/* ==========================================================================
   Shell · menus de la barre haute : école affichée (RG-69), notifications
   (RG-37), compte et préférences d'affichage, recherche globale.
   ========================================================================== */

import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { Icon, Tile, Brand } from '../ui/icons.jsx';
import { Popover, notify, useSheetClose } from '../ui/overlays.jsx';
import { store, me, currentEcole } from '../core/store.js';
import { can } from '../core/permissions.js';
import { glassInfo } from '../core/glass.js';
import { AMBIANCES, GLASS } from '../core/ambiance.js';
import { role as roleOf, deviceType, statut } from '../core/catalog.js';
import { remontees, batimentLabel, index, scope, detections, remonteeContext, parc } from '../core/selectors.js';
import { num, ago } from '../core/format.js';

export const ecoleNom = (e) => (e === 'all' || !e ? 'Toutes les écoles' : index().ecole.get(e)?.nom ?? '');

/* Notifications (RG-37, RG-55, RG-66, RG-67) */
function notificationsFor(since) {
  const items = [];
  const r = me().role;
  if (r === 'gestionnaire') {
    for (const x of remontees().visible) if (x.createdAt > since) items.push({ kind: 'new', at: x.createdAt, r: x });
    for (const m of [...parc().garanties.echues, ...parc().garanties.proches]) items.push({ kind: 'garantie', at: m.garantieFin, m });
  }
  if (r === 'formateur') {
    for (const x of remontees().mine) for (const h of x.historique) if (h.statut !== 'attente' && h.at > since) items.push({ kind: 'status', at: h.at, r: x, h });
  }
  if (r === 'admin' || r === 'superadmin') {
    for (const d of detections()) if (d.classement === 'blacklist' && d.at > since) items.push({ kind: 'blacklist', at: d.at, d });
  }
  return items.sort((a, b) => b.at - a.at);
}
export const weekNotifications = () => notificationsFor(Date.now() - 7 * 86400e3);

function NotifRow({ n, onOpen }) {
  if (n.kind === 'garantie') {
    return <li><Link className="pop-row" to="/materiels/inventaire" onClick={onOpen}>
      <Tile name="clock" color="var(--accent)" size="s" />
      <span><b>{n.m.garantieFin <= Date.now() ? 'Garantie échue' : 'Garantie proche de l’échéance'}</b><small>{n.m.modele} · {n.m.idAster}</small></span>
    </Link></li>;
  }
  if (n.kind === 'blacklist') {
    const salle = index().salle.get(n.d.salleId);
    return <li><div className="pop-row">
      <Tile name="shieldX" color="var(--crit)" size="s" />
      <span><b>{n.d.processus} arrêté</b><small>{salle?.nom ?? ''}, {ago(n.at)}</small></span>
    </div></li>;
  }
  const { first } = remonteeContext(n.r);
  const dt = deviceType(first?.type);
  const label = n.kind === 'new' ? 'Nouvelle remontée' : `Statut : ${statut(n.h.statut).label.toLowerCase()}`;
  return <li><Link className="pop-row" to={`/remontees/toutes/${n.r.id}`} onClick={onOpen}>
    <Tile name={dt.icon} color={dt.color} size="s" />
    <span><b>{label}</b><small>{n.r.id}, {first?.modele ?? ''}, {ago(n.at)}</small></span>
    <Icon name="chevR" size={16} />
  </Link></li>;
}

/* --------------------------------------------------------------------------
   Popovers de la barre haute
   -------------------------------------------------------------------------- */
export function AccountPopover({ anchor, onClose }) {
  const s = store.state;
  const info = glassInfo();
  const setPref = (key, value) => store.update('prefs', (st) => { st.prefs[key] = value; });
  return <Popover anchor={anchor} onClose={onClose}>
    <div className="account">
      <div className="account-head">
        <span className="avatar-face avatar-face--l">{me().nom.split(' ').at(-1).slice(0, 1)}</span>
        <div><b>{me().nom}</b><span>{roleOf(s.role).label}</span><span>{ecoleNom(currentEcole())}</span></div>
      </div>
      <div className="pop-group">
        <div className="swatches" role="radiogroup" aria-label="Ambiance">
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
        {!info.supportsLens && s.prefs.glass === 'liquid' && <span className="pop-note"><Icon name="eye" size={14} />La réfraction des bords s’affiche dans Chrome ou Edge.</span>}
      </div>
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

export function AlertsPopover({ anchor, onClose }) {
  const items = weekNotifications();
  return <Popover anchor={anchor} onClose={onClose} className="popover--list">
    <div className="pop-list">
      <div className="pop-title"><Icon name="bell" size={18} /><b>Notifications</b><span className="w-count">{num(items.length)}</span></div>
      {items.length
        ? <ul>{items.slice(0, 8).map((n, i) => <NotifRow key={i} n={n} onOpen={onClose} />)}</ul>
        : <div className="w-empty"><Icon name="checkCircle" size={24} /><span>Rien de nouveau cette semaine</span></div>}
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
      <input ref={input} type="search" placeholder="Salle, modèle, identifiant ASTER, n° de série, remontée…" autoComplete="off" aria-label="Recherche"
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
