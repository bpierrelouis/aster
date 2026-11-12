/* ==========================================================================
   Shell · menus de la barre haute : école affichée (RG-69), résumé des
   notifications (RG-37, calcul dans core/notifications.js, détail dans
   views/notifications), compte et préférences d'affichage, recherche globale.
   ========================================================================== */

import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { Icon, Tile, Brand } from '../../ui/icons.jsx';
import { Popover, notify, useSheetClose } from '../../ui/overlays.jsx';
import { store, me, currentEcole } from '../../core/store.js';
import { can } from '../../core/permissions.js';
import { autoTone, systemTone } from '../../core/theme.js';
import { AMBIANCES, GLASS } from '#shared/ambiance.js';
import { role as roleOf, deviceType, statut } from '#shared/catalog.js';
import { remontees, batimentLabel, index, scope } from '../../core/selectors.js';
import { num } from '#shared/format.js';
import { notificationGroups } from '../../core/notifications.js';
import { UserSwitch } from './user-switch.jsx';

export const ecoleNom = (e) => (e === 'all' || !e ? 'Toutes les écoles' : index().ecole.get(e)?.nom ?? '');
/** Initiale du nom de famille du compte connecté (avatar) */
export const initiale = () => me().nom.split(' ').at(-1).slice(0, 1);

/* --------------------------------------------------------------------------
   Popovers de la barre haute
   -------------------------------------------------------------------------- */
export function AccountPopover({ anchor, onClose }) {
  const s = store.state;
  const setPref = (key, value) => store.update('prefs', (st) => { st.prefs[key] = value; });
  // Orion et Minarm suivent la machine ; le soleil ou la lune force l'autre tonalité (revenir à celle de la machine la suit de nouveau)
  const tone = autoTone(s.prefs.tone);
  const followsMachine = AMBIANCES.find((a) => a.id === s.prefs.ambiance)?.tone === 'auto';
  const switchTone = () => { const next = tone === 'dark' ? 'light' : 'dark'; setPref('tone', next === systemTone() ? 'auto' : next); };
  return <Popover anchor={anchor} onClose={onClose}>
    <div className="account">
      <div className="account-head">
        <span className="avatar-face avatar-face--l">{initiale()}</span>
        <div><b>{me().nom}</b><span>{roleOf(s.role).label}</span><span>{ecoleNom(currentEcole())}</span></div>
        {followsMachine && <button type="button" className="icon-btn tone-switch" onClick={switchTone}
          aria-label={tone === 'dark' ? 'Passer en clair' : 'Passer en sombre'} data-tip={tone === 'dark' ? 'Passer en clair' : 'Passer en sombre'}>
          <Icon name={tone === 'dark' ? 'moon' : 'sun'} size={20} />
        </button>}
      </div>
      <div className="pop-group">
        <div className="swatches" role="radiogroup" aria-label="Ambiance" data-tone={tone}>
          {AMBIANCES.map((a) => <button key={a.id} type="button" role="radio" aria-checked={s.prefs.ambiance === a.id}
            className="swatch-item" onClick={() => setPref('ambiance', a.id)}>
            <span className={`swatch swatch--${a.id}`}><Brand ambiance={a.id} size={24} /></span>{a.label}
          </button>)}
        </div>
      </div>
      <div className="pop-group">
        <div className="seg" role="radiogroup" aria-label="Verre">
          {GLASS.map((g) => <button key={g.id} type="button" role="radio" aria-checked={s.prefs.glass === g.id}
            className={`seg-btn${s.prefs.glass === g.id ? ' is-on' : ''}`} data-tip={g.tip} onClick={() => setPref('glass', g.id)}>{g.label}</button>)}
        </div>
      </div>
      {import.meta.env.MODE === 'ui' && <UserSwitch />}
      <form action="/auth/logout" method="post"><button className="pop-link" type="submit">Se déconnecter</button></form>
    </div>
  </Popover>;
}

export function EcolePopover({ anchor, onClose }) {
  const s = store.state;
  const opts = [{ id: 'all', nom: 'Toutes les écoles' }, ...s.ecoles];
  const choose = (id) => {
    onClose();
    store.update('ecole', (st) => { st.ecoleId = id; });
    notify(ecoleNom(id), { icon: 'school', tone: 'info' });
  };
  return <Popover anchor={anchor} onClose={onClose} className="popover--list">
    <div className="pop-list">
      <div className="pop-title"><Icon name="school" size={18} /><b>École affichée</b></div>
      <ul>{opts.map((o) => {
        const on = s.ecoleId === o.id;
        const count = o.id === 'all' ? s.salles.length : s.salles.filter((x) => x.ecoleId === o.id).length;
        return <li key={o.id}><button type="button" className={`pop-row${on ? ' is-on' : ''}`} onClick={() => choose(o.id)}>
          <Tile name={o.id === 'all' ? 'layers' : 'school'} color="var(--accent)" size="s" className="tile--tint" />
          <span><b>{o.nom}</b><small>{num(count)} salles</small></span>
          {on && <Icon name="check" size={18} />}
        </button></li>;
      })}</ul>
    </div>
  </Popover>;
}

/** Notifications regroupées par nature (core/notifications.js) ; le détail est dans l'espace Notifications */
export function AlertsPopover({ anchor, onClose }) {
  const groups = notificationGroups();
  return <Popover anchor={anchor} onClose={onClose} className="popover--list">
    <div className="pop-list">
      <div className="pop-title"><Icon name="bell" size={18} /><b>Notifications</b><span className="w-count">{num(groups.length)}</span></div>
      {groups.length
        ? <ul>{groups.map((g) => <li key={g.id}><Link className="pop-row" to={g.href} onClick={onClose}>
          <Tile name={g.icon} color={g.color} size="s" />
          <span><b>{g.title}</b><small>{g.period}</small></span>
          <Icon name="chevR" size={16} />
        </Link></li>)}</ul>
        : <div className="w-empty"><Icon name="checkCircle" size={24} /><span>Rien de nouveau cette semaine</span></div>}
      <Link className="pop-link pop-link--foot" to="/notifications" onClick={onClose}><Icon name="list" size={16} /><span>Voir toutes les notifications</span><Icon name="chevR" size={16} /></Link>
    </div>
  </Popover>;
}

/* --------------------------------------------------------------------------
   Recherche globale
   -------------------------------------------------------------------------- */
function searchResults(q) {
  q = q.trim().toLowerCase();
  if (!q) return [];
  const ix = index();
  const out = [];
  for (const x of scope().salles) {
    if (`${x.nom} ${batimentLabel(x.batiment)}`.toLowerCase().includes(q)) out.push({ icon: 'salles', color: 'var(--c3)', title: x.nom, sub: batimentLabel(x.batiment), href: `/salles/salle/${x.id}` });
  }
  if (can('materiel.view')) for (const m of scope().materiels) {
    if (out.length > 40) break;
    if (`${m.modele} ${m.marque ?? ''} ${m.idAster} ${m.serie ?? ''}`.toLowerCase().includes(q)) {
      const dt = deviceType(m.type);
      const salle = m.salleId ? ix.salle.get(m.salleId) : null;
      out.push({ icon: dt.icon, color: dt.color, title: m.modele, sub: `${m.idAster}, ${salle ? salle.nom : 'Stock'}`, href: `/salles/${salle ? `salle/${salle.id}` : 'stock'}?m=${m.id}`, led: m.hs ? 'hs' : 'ok' });
    }
  }
  for (const r of remontees().visible) {
    if (r.id.toLowerCase().includes(q) || r.description.toLowerCase().includes(q)) out.push({ icon: 'ticket', color: 'var(--accent)', title: r.id, sub: statut(r.statut).label, href: `/remontees/toutes/${r.id}` });
  }
  return out.slice(0, 12);
}

export function Spotlight({ navigate }) {
  const close = useSheetClose();
  const [q, setQ] = useState('');
  const input = useRef(null);
  const results = searchResults(q);
  const open = (r) => { close(); navigate(r.href); };
  useEffect(() => { const t = setTimeout(() => input.current?.focus(), 50); return () => clearTimeout(t); }, []);
  return <>
    <label className="field field--search"><Icon name="recherche" size={22} />
      <input ref={input} type="search" placeholder="Salle, modèle, identifiant Orion, n° de série, remontée…" autoComplete="off" aria-label="Recherche"
        value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && results[0]) open(results[0]); }} />
    </label>
    <ul className="results" role="listbox">
      {results.map((r, i) => <li key={i}><button type="button" className="pop-row" role="option" aria-selected="false" onClick={() => open(r)}>
        <span className="tile-wrap"><Tile name={r.icon} color={r.color} size="s" />{r.led && <span className={`led led--${r.led} tile-led`} />}</span>
        <span><b>{r.title}</b><small>{r.sub}</small></span><Icon name="chevR" size={16} />
      </button></li>)}
      {!results.length && q.trim() && <li className="w-empty"><Icon name="recherche" size={24} /><span>Aucun résultat pour « {q.trim()} »</span></li>}
    </ul>
  </>;
}
