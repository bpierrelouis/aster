/* ==========================================================================
   Remontées utilisateur
   - Liste maître-détail : en attente, traitées, toutes, les miennes
   - Traitement : « en attente » → « remplacé » ou « corrigé » (RG-13)
   - État des lieux (remontees-edl.jsx) et création (remontees-create.jsx)
   ========================================================================== */

import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router';
import { Icon, Tile } from '../ui/icons.jsx';
import { notify } from '../ui/overlays.jsx';
import { useTitle } from '../ui/useTitle.js';
import { store, me } from '../core/store.js';
import { useStore } from '../core/useStore.js';
import { can } from '../core/permissions.js';
import { num, ago, dateLong, dateShort } from '../core/format.js';
import { deviceType, problem, statut } from '../core/catalog.js';
import { remontees, remonteeContext, batiments, batimentLabel } from '../core/selectors.js';
import { StatutPill, LieuChip, PageHead } from '../widgets/parts.jsx';
import { openNewRemontee } from './remontees-create.jsx';
import { openEtatDesLieux } from './remontees-edl.jsx';

const TABS = {
  attente: (rm) => rm.attente,
  traitees: (rm) => rm.traitees,
  toutes: (rm) => rm.visible,
  miennes: (rm) => rm.mine,
};

const EMPTIES = {
  attente: ['checkCircle', 'Aucune remontée en attente. Tout est traité.'],
  traitees: ['hourglass', 'Aucune remontée traitée pour le moment.'],
  toutes: ['documents', 'Aucune remontée.'],
  miennes: ['documents', 'Vous n’avez pas encore créé de remontée.'],
};

function RemonteeRow({ r, tab, selected }) {
  const { mats, salles, first } = remonteeContext(r);
  const dt = deviceType(first?.type);
  const p = problem(r.probleme);
  return <li>
    <Link className={`rm-row ${selected ? 'is-selected' : ''}`} to={`/remontees/${tab}/${r.id}`} aria-current={selected ? 'true' : 'false'}>
      <span className="tile-wrap"><Tile name={p.icon} color={dt.color} size="m" className="tile--tint" />{r.statut === 'attente' && <span className="led led--wait tile-led" />}</span>
      <span className="rm-main">
        <span className="rm-title">{first?.modele ?? 'Matériel retiré'}{mats.length > 1 && <> <span className="row-more">+{mats.length - 1}</span></>}</span>
        <span className="rm-desc">{r.description}</span>
        <span className="row-sub">
          {salles.length
            ? salles.slice(0, 2).map((x) => <span key={x.id} className="chip chip--pin"><Icon name="pin" size={13} />{x.nom}</span>)
            : <span className="chip chip--stock"><Icon name="stockage" size={13} />Stock</span>}
          <span className="row-meta">{r.id}</span>
          {can('remontee.viewAll') && <span className="row-meta"><Icon name="user" size={13} />{r.auteur}</span>}
        </span>
      </span>
      <span className="rm-side"><StatutPill r={r} /><span className="rm-age">{ago(r.createdAt)}</span></span>
    </Link>
  </li>;
}

function RemonteeDetail({ selId, tab }) {
  const state = useStore();
  const r = remontees().visible.find((x) => x.id === selId) ?? remontees().mine.find((x) => x.id === selId);
  if (!r) {
    return <div className="rm-empty"><Tile name="ticket" color="var(--iris)" size="xl" /><p>Sélectionnez une remontée pour voir son détail et son état des lieux.</p></div>;
  }
  const { mats } = remonteeContext(r);
  const p = problem(r.probleme);
  const steps = r.historique;
  const done = r.statut !== 'attente';
  const treat = can('remontee.treat') && !done;

  const edl = () => { const x = store.state.remontees.find((y) => y.id === r.id); if (x) openEtatDesLieux(x); };
  const setStatut = async (val) => {
    const id = selId;
    store.update('data', (s) => {
      const x = s.remontees.find((y) => y.id === id);
      x.statut = val;
      x.historique.push({ statut: val, at: Date.now(), par: me().nom });
    });
    try { await store.flush(); } catch { return; }
    notify(`${id} : ${statut(val).label.toLowerCase()}`, { icon: statut(val).icon, tone: val === 'corrige' ? 'ok' : 'info' });
  };

  return <>
    <div className="insp-head">
      <Tile name={p.icon} color="var(--iris)" size="l" />
      <div className="insp-title"><h2>{r.id}</h2><span><StatutPill r={r} /></span></div>
      <div className="insp-actions"><Link className="icon-btn" to={`/remontees/${tab}`} aria-label="Fermer le détail"><Icon name="close" size={18} /></Link></div>
    </div>
    <ul className="facts">
      <li><span><Icon name={p.icon} size={18} />Problème</span><b>{p.label}</b></li>
      <li><span><Icon name="user" size={18} />Déclarée par</span><b>{r.auteur}</b></li>
      <li><span><Icon name="clock" size={18} />Créée</span><b>{dateShort(r.createdAt)}</b></li>
      <li><span><Icon name="materiel" size={18} />Matériels</span><b>{num(mats.length)}</b></li>
    </ul>
    <blockquote className="rm-quote">{r.description}</blockquote>
    <section className="insp-block">
      <h3 className="insp-section-title"><Icon name="materiel" size={18} />Matériels concernés</h3>
      <ul className="rows rows--flat">{mats.map((m) => {
        const t = deviceType(m.type);
        return <li key={m.id}>
          <Link className="row" to={`/salles/${m.salleId ? `salle/${m.salleId}` : 'stock'}?m=${m.id}`}>
            <span className="tile-wrap"><Tile name={t.icon} color={t.color} size="m" /><span className={`led led--${m.hs ? 'hs' : 'ok'} tile-led`} /></span>
            <span className="row-main"><span className="row-title">{m.modele}</span><span className="row-sub"><LieuChip m={m} /><span className="row-meta">{m.idAster}</span></span></span>
            <Icon name="chevR" size={16} />
          </Link>
        </li>;
      })}</ul>
    </section>
    <section className="insp-block">
      <h3 className="insp-section-title"><Icon name="clock" size={18} />Suivi</h3>
      <ol className="timeline">
        {steps.map((h, i) => {
          const s = statut(h.statut);
          return <li key={i} className={`tl-item is-done ${i === steps.length - 1 ? 'is-current' : ''} tl-item--${s.id}`}>
            <span className="tl-dot"><Icon name={i === 0 ? 'documents' : s.icon} size={16} /></span>
            <div className="tl-body"><b>{i === 0 ? 'Transmise, en attente' : s.label}</b><span>{dateLong(h.at)}</span><span>{h.par}</span></div>
          </li>;
        })}
        {!done && <li className="tl-item tl-item--todo"><span className="tl-dot"><Icon name="swap" size={16} /></span><div className="tl-body"><b>Remplacé ou corrigé</b><span>Traitement par le gestionnaire</span></div></li>}
      </ol>
    </section>
    <footer className="insp-foot">
      {treat ? <>
        <button className="btn btn--glass btn--icon" aria-label="État des lieux" data-tip="État des lieux" onClick={edl}><Icon name="documents" size={20} /></button>
        <button className="btn btn--glass flex-1" onClick={() => setStatut('remplace')}><Icon name="swap" size={18} /><span>Remplacé</span></button>
        {['admin', 'superadmin'].includes(state.role) && <button className="btn btn--primary flex-1" onClick={() => setStatut('corrige')}><Icon name="checkCircle" size={18} /><span>Corrigé</span></button>}
      </> : <button className="btn btn--glass flex-1" onClick={edl}><Icon name="documents" size={18} /><span>État des lieux</span></button>}
    </footer>
  </>;
}

export function Remontees() {
  useStore();
  const params = useParams();
  const tab = TABS[params.tab] ? params.tab : 'attente';
  const selId = params.id ?? null;
  const [query, setQuery] = useState('');
  const [bat, setBat] = useState('');
  const rootRef = useRef(null);
  const title = can('remontee.viewAll') ? 'Remontées' : 'Mes remontées';
  useTitle(title);

  // À l'ouverture, la remontée sélectionnée est amenée dans la liste
  useEffect(() => { rootRef.current?.querySelector('.rm-row.is-selected')?.scrollIntoView({ block: 'nearest' }); }, []);

  let list = TABS[tab](remontees());
  if (bat) list = list.filter((r) => remonteeContext(r).salles.some((x) => x.batiment === bat));
  const q = query.trim().toLowerCase();
  if (q) list = list.filter((r) => {
    const { mats } = remonteeContext(r);
    return `${r.id} ${r.description} ${r.auteur} ${mats.map((m) => `${m.modele} ${m.idAster}`).join(' ')}`.toLowerCase().includes(q);
  });

  return <div ref={rootRef} className="view-remontees">
    <PageHead title={title}>
      {can('remontee.create') && <button className="btn btn--primary" onClick={() => openNewRemontee()}><Icon name="alertes" size={18} /><span>Signaler un problème</span></button>}
    </PageHead>
    <div className={`rm-layout ${selId ? 'has-selection' : ''}`}>
      <section className="rm-panel glass" data-lens="" aria-label="Liste des remontées">
        <div className="rm-toolbar">
          <label className="field field--search field--compact"><Icon name="recherche" size={20} /><input type="search" placeholder="Matériel, identifiant, description, auteur…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Filtrer les remontées" /></label>
          <div className="seg" role="radiogroup" aria-label="Bâtiment">
            <button className={`seg-btn ${!bat ? 'is-on' : ''}`} role="radio" aria-checked={!bat} onClick={() => setBat('')}>Tous</button>
            {batiments().map((b) => (
              <button key={b} className={`seg-btn ${bat === b ? 'is-on' : ''}`} role="radio" aria-checked={bat === b} data-tip={batimentLabel(b)} onClick={() => setBat(b)}><span className="code-badge">{b}</span></button>
            ))}
          </div>
          <span className="rm-count" aria-live="polite">{num(list.length)}</span>
        </div>
        <div className="rm-scroll">
          {list.length
            ? <ul className="rm-list">{list.map((r) => <RemonteeRow key={r.id} r={r} tab={tab} selected={r.id === selId} />)}</ul>
            : <div className="w-empty w-empty--l"><Icon name={query || bat ? 'recherche' : EMPTIES[tab][0]} size={32} /><span>{query || bat ? 'Aucune remontée ne correspond à ces filtres.' : EMPTIES[tab][1]}</span></div>}
        </div>
      </section>
      <aside className="rm-detail glass" data-lens="" aria-live="polite"><RemonteeDetail selId={selId} tab={tab} /></aside>
    </div>
  </div>;
}
