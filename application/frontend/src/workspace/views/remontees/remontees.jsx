/* ==========================================================================
   Remontées utilisateur
   - Onglets par profil (remontees-tabs.js) : backlogs du gestionnaire, des
     remontées (remontees-backlog.jsx) et des installations des salles
     (remontees-installations.jsx) ; listes maître-détail pour les autres profils
   - Cycle : en attente → en cours → remplacé ou corrigé (terminée) ; le
     suivi (shared/catalog.js) est le même dans le détail et l'état des lieux
   - État des lieux (remontees-edl.jsx) et création (remontees-create.jsx)
   ========================================================================== */

import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router';
import { useEscape } from '../../hooks/use-escape.js';
import { Icon, Tile } from '../../ui/icons.jsx';
import { notify } from '../../ui/overlays.jsx';
import { useTitle } from '../../hooks/use-title.js';
import { usePeek } from '../../ui/peek.js';
import { store, me } from '../../core/store.js';
import { useStore } from '../../hooks/use-store.js';
import { can } from '../../core/permissions.js';
import { num, ago, dateLong, dateShort } from '#shared/format.js';
import { deviceType, problem, statut, phaseOf, suiviRemontee } from '#shared/catalog.js';
import { remontees, remonteeContext, batiments, batimentLabel } from '../../core/selectors.js';
import { StatutPill, LieuChip, PageHead } from '../../widgets/parts.jsx';
import { openNewRemontee } from './remontees-create.jsx';
import { openEtatDesLieux } from './remontees-edl.jsx';
import { TABS, remonteeTabs } from './remontees-tabs.js';
import { Backlog } from './remontees-backlog.jsx';
import { InstallationsBoard } from './remontees-installations.jsx';
import { MaterielsConcernes } from './remontees-materiels.jsx';

/** Une ligne par remontée : son problème et son lieu ; ses matériels sont dans le détail */
function RemonteeRow({ r, tab, selected }) {
  const { first } = remonteeContext(r);
  const dt = deviceType(first?.type);
  const p = problem(r.probleme);
  return <li>
    <Link className={`rm-row ${selected ? 'is-selected' : ''}`} to={`/remontees/${tab}/${r.id}`} aria-current={selected ? 'true' : 'false'}>
      <span className="tile-wrap"><Tile name={p.icon} color={dt.color} size="m" className="tile--tint" />{r.statut === 'attente' && <span className="led led--wait tile-led" />}</span>
      <span className="rm-main">
        <span className="rm-title">{p.label}</span>
        <span className="rm-desc">{r.description}</span>
        <span className="row-sub">
          <LieuChip m={first ?? {}} />
          <span className="row-meta">{r.id}</span>
          {can('remontee.viewAll') && <span className="row-meta"><Icon name="user" size={13} />{r.auteur}</span>}
        </span>
      </span>
      <span className="rm-side"><StatutPill r={r} /><span className="rm-age">{ago(r.createdAt)}</span></span>
    </Link>
  </li>;
}

/** Détail d'une remontée : le contenu défile dans la fenêtre, les actions restent dessous */
function RemonteeDetail({ selId, tab }) {
  useStore();
  const scroll = usePeek('.rm-detail');
  const navigate = useNavigate();
  const r = remontees().visible.find((x) => x.id === selId) ?? remontees().mine.find((x) => x.id === selId);
  useEscape(() => navigate(`/remontees/${tab}`), Boolean(r));
  if (!r) {
    return <div ref={scroll} className="insp-scroll"><div className="rm-empty"><Tile name="ticket" color="var(--accent)" size="xl" /><p>Sélectionnez une remontée pour voir son détail et son état des lieux.</p></div></div>;
  }
  const { mats } = remonteeContext(r);
  const p = problem(r.probleme);
  const steps = suiviRemontee(r);
  const current = steps.findLastIndex((s) => !s.todo);
  const phase = phaseOf(r);
  const treat = can('remontee.treat') && (phase === 'attente' || phase === 'encours');
  const gerer = phase === 'encours' && can('remontee.treat') && can('materiel.move'); // matériels déclarés et remis depuis la remontée

  const edl = () => { const x = store.state.remontees.find((y) => y.id === r.id); if (x) openEtatDesLieux(x); };
  const setStatut = async (val) => {
    const id = selId;
    store.update('data', (s) => {
      const x = s.remontees.find((y) => y.id === id);
      x.statut = val;
      x.historique.push({ statut: val, at: Date.now(), par: me().nom });
    });
    try { await store.flush(); } catch { return; }
    notify(`${id} : ${statut(val).label.toLowerCase()}`, { icon: statut(val).icon, tone: val === 'encours' ? 'info' : 'ok' });
  };

  return <>
    <div ref={scroll} className="insp-scroll">
      <div className="insp-head">
        <Tile name={p.icon} color="var(--accent)" size="l" />
        <div className="insp-title"><h2>{r.id}</h2><span><StatutPill r={r} /></span></div>
        <div className="insp-actions"><Link className="icon-btn" to={`/remontees/${tab}`} aria-label="Fermer le détail" data-tip="Fermer (Échap)"><Icon name="close" size={18} /></Link></div>
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
        <MaterielsConcernes r={r} gerer={gerer} />
      </section>
      <section className="insp-block">
        <h3 className="insp-section-title"><Icon name="clock" size={18} />Suivi</h3>
        <ol className="timeline">
          {steps.map((s, i) => (s.todo
            ? <li key={i} className="tl-item tl-item--todo"><span className="tl-dot"><Icon name={s.icon} size={16} /></span><div className="tl-body"><b>{s.label}</b><span>{s.sub}</span></div></li>
            : <li key={i} className={`tl-item is-done ${i === current ? 'is-current' : ''} tl-item--${s.statut}`}>
              <span className="tl-dot"><Icon name={s.icon} size={16} /></span>
              <div className="tl-body"><b>{s.label}</b><span>{dateLong(s.at)}</span><span>{s.par}</span></div>
            </li>))}
        </ol>
      </section>
    </div>
    <footer className="insp-foot">
      {treat ? <>
        <button className="btn btn--glass btn--icon" aria-label="État des lieux" data-tip="État des lieux" onClick={edl}><Icon name="documents" size={20} /></button>
        {phase === 'attente' ? <button className="btn btn--primary flex-1" onClick={() => setStatut('encours')}><Icon name="refresh" size={18} /><span>Prendre en charge</span></button>
          : <>
            <button className="btn btn--glass flex-1" onClick={() => setStatut('remplace')}><Icon name="swap" size={18} /><span>Remplacé</span></button>
            <button className="btn btn--primary flex-1" onClick={() => setStatut('corrige')}><Icon name="check" size={18} /><span>Corrigé</span></button>
          </>}
      </> : <button className="btn btn--glass flex-1" onClick={edl}><Icon name="documents" size={18} /><span>État des lieux</span></button>}
    </footer>
  </>;
}

/** Filtres communs à la liste et au backlog : bâtiment et recherche */
function filterRemontees(list, query, bat) {
  let out = bat ? list.filter((r) => remonteeContext(r).salles.some((x) => x.batiment === bat)) : list;
  const q = query.trim().toLowerCase();
  if (q) out = out.filter((r) => {
    const { mats } = remonteeContext(r);
    return `${r.id} ${r.description} ${r.auteur} ${mats.map((m) => `${m.modele} ${m.idOrion}`).join(' ')}`.toLowerCase().includes(q);
  });
  return out;
}

export function Remontees() {
  useStore();
  const params = useParams();
  const tabs = remonteeTabs();
  const tab = params.tab;
  const selId = params.id ?? null;
  const [query, setQuery] = useState('');
  const [bat, setBat] = useState('');
  const rootRef = useRef(null);
  const listScroll = usePeek('.rm-panel');
  const title = can('remontee.viewAll') ? 'Remontées' : 'Mes remontées';
  useTitle(title);

  // À l'ouverture, la remontée sélectionnée est amenée dans la liste
  useEffect(() => { rootRef.current?.querySelector('.rm-row.is-selected, .bl-card.is-selected')?.scrollIntoView({ block: 'nearest' }); }, []);

  // Onglet absent pour ce profil (adresse ancienne, lien d'un widget) : onglet par défaut, sélection conservée
  if (!tabs.includes(tab)) return <Navigate to={`/remontees/${tabs[0]}${selId ? `/${selId}` : ''}`} replace />;

  const installs = tab === 'installations';
  const board = tab === 'backlog' || installs;
  const rm = remontees();
  const list = installs ? [] : filterRemontees(board ? rm.visible : TABS[tab].list(rm), query, bat);
  const filtered = Boolean(query || bat);
  const toolbar = <div className="rm-toolbar">
    <label className="field field--search field--compact"><Icon name="recherche" size={20} /><input type="search" value={query} onChange={(e) => setQuery(e.target.value)}
      placeholder={installs ? 'Salle…' : 'Matériel, identifiant, description, auteur…'} aria-label={installs ? 'Filtrer les installations' : 'Filtrer les remontées'} /></label>
    <div className="seg" role="radiogroup" aria-label="Bâtiment">
      <button className={`seg-btn ${!bat ? 'is-on' : ''}`} role="radio" aria-checked={!bat} onClick={() => setBat('')}>Tous</button>
      {batiments().map((b) => (
        <button key={b} className={`seg-btn ${bat === b ? 'is-on' : ''}`} role="radio" aria-checked={bat === b} data-tip={batimentLabel(b)} onClick={() => setBat(b)}><span className="code-badge">{b}</span></button>
      ))}
    </div>
    {!installs && <span className="rm-count" aria-live="polite">{num(list.length)}</span>}
  </div>;

  return <div ref={rootRef} className="view-remontees">
    <PageHead title={title}>
      {can('remontee.create') && <button className="btn btn--primary" onClick={() => openNewRemontee()}><Icon name="alertes" size={18} /><span>Signaler un problème</span></button>}
    </PageHead>
    <div className={`rm-layout${board ? ' rm-layout--board' : ''} ${selId ? 'has-selection' : ''}`}>
      {board
        ? <section className="bl-panel" aria-label={installs ? 'Backlog des installations' : 'Backlog des remontées'}><div className="bl-toolbar glass">{toolbar}</div>
          {installs ? <InstallationsBoard bat={bat} query={query} /> : <Backlog list={list} selId={selId} />}</section>
        : <section className="rm-panel glass" aria-label="Liste des remontées">
          {toolbar}
          <div ref={listScroll} className="rm-scroll">
            {list.length
              ? <ul className="rm-list">{list.map((r) => <RemonteeRow key={r.id} r={r} tab={tab} selected={r.id === selId} />)}</ul>
              : <div className="w-empty w-empty--l"><Icon name={filtered ? 'recherche' : TABS[tab].empty[0]} size={32} /><span>{filtered ? 'Aucune remontée ne correspond à ces filtres.' : TABS[tab].empty[1]}</span></div>}
          </div>
        </section>}
      <aside className="rm-detail glass" aria-live="polite"><RemonteeDetail selId={selId} tab={tab} /></aside>
    </div>
  </div>;
}
