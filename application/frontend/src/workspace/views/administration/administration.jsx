/* ==========================================================================
   Administration : postes (réinstallation), applications (déploiement),
   bâtiments (renommage), comptes et écoles. L'utilisateur enregistre une
   demande d'intervention ; chaque poste cible l'exécute et renvoie son résultat.
   ========================================================================== */

import { useState } from 'react';
import { useParams } from 'react-router';
import { store, currentEcole, me } from '../../core/store.js';
import { useStore } from '../../hooks/use-store.js';
import { scope, index, parc, batimentLabel } from '../../core/selectors.js';
import { can } from '../../core/permissions.js';
import { role } from '#shared/catalog.js';
import { num, dateTime } from '#shared/format.js';
import { Icon, Tile } from '../../ui/icons.jsx';
import { AppIcon } from '../../ui/app-icon.jsx';
import { confirmSheet, notify } from '../../ui/overlays.jsx';
import { openAccountForm, openSchoolForm, recordOperation, openDeploymentForm, openPostDetail } from './administration-forms.jsx';
import { openBuildingForm } from '../salles/salles-forms.jsx';
import { OpsEmpty, OpsTable, PageHead, Pagination, paginate } from '../../widgets/parts.jsx';
import { outsideControls } from '../../core/dom.js';
import { useTitle } from '../../hooks/use-title.js';

const Empty = ({ text }) => <OpsEmpty icon="desktop" title={text} />;

const TITLES = {
  postes: 'Administration des postes',
  applications: 'Applications',
  batiments: 'Bâtiments',
  comptes: 'Comptes & accès',
};
const SEARCH = { postes: 'Nom du poste…', applications: 'Application…', batiments: 'Bâtiment…', comptes: 'Nom ou adresse…' };
const byPost = (tab) => tab === 'postes' || tab === 'applications'; // onglets filtrés par salle (suivi des interventions : Applications)

export function Administration() {
  useTitle('Administration');
  const state = useStore();
  const tab = useParams().tab || 'postes';
  const [salleChoice, setSalleId] = useState('');
  const [query, setQuery] = useState('');
  const [selection, setSelection] = useState(() => new Set());
  // La recherche repart de zéro à chaque changement d'onglet
  const [queryTab, setQueryTab] = useState(tab);
  if (queryTab !== tab) { setQueryTab(tab); setQuery(''); }

  if (!can('administration.view')) return <Empty text="Accès non autorisé" />;

  const salleId = salleChoice && scope().salleIds.has(salleChoice) ? salleChoice : '';
  const selected = new Set([...selection].filter((id) => scope().postes.some((p) => p.id === id)));
  const q = query.toLowerCase();
  const posts = scope().postes.filter((p) => (!salleId || p.salleId === salleId) && p.nomReseau.toLowerCase().includes(q));

  const toggle = (id, on) => setSelection((prev) => { const next = new Set(prev); if (on) next.add(id); else next.delete(id); return next; });
  function selectAll() {
    const ids = posts.map((p) => p.id);
    const all = ids.every((id) => selected.has(id));
    setSelection(() => { const next = new Set(selected); ids.forEach((id) => (all ? next.delete(id) : next.add(id))); return next; });
  }
  async function reinstall() {
    if (!selected.size) return;
    try {
      if (!await confirmSheet({ title: 'Demander une réinstallation ?', message: `Réappliquer l’image Windows sur les ${selected.size} postes sélectionnés.`, confirm: 'Enregistrer la demande', iconName: 'refresh' })) return;
      await recordOperation('reinstallation', [...selected], { image: 'Windows — configuration de référence' });
      setSelection(new Set());
    } catch (error) { notify(error.message, { tone: 'danger' }); }
  }

  return <>
    <PageHead title={TITLES[tab] || TITLES.postes}>
      {tab === 'comptes' && <button className="btn btn--primary" onClick={() => openAccountForm()}><Icon name="plus" size={18} /><span>Créer un compte</span></button>}
    </PageHead>
    <div className="ops-toolbar">
      {byPost(tab) && <label className="field"><span className="field-label">Salle</span>
        <select aria-label="Filtrer par salle" value={salleId} onChange={(e) => { setSalleId(e.target.value); setSelection(new Set()); }}>
          <option value="">Toutes les salles</option>
          {scope().salles.map((s) => <option key={s.id} value={s.id}>{s.nom} · Bâtiment {s.batiment}</option>)}
        </select>
      </label>}
      <label className="field"><span className="field-label">Rechercher</span>
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder={SEARCH[tab] ?? SEARCH.postes} aria-label="Rechercher" />
      </label>
      {tab === 'postes' && <>
        <button className="btn btn--ghost" onClick={selectAll}>Tout sélectionner</button>
        <button className="btn btn--primary" disabled={!selected.size} onClick={reinstall}><Icon name="refresh" size={17} />Réinstaller ({selected.size})</button>
      </>}
    </div>
    <div>
      {tab === 'comptes' ? <Accounts query={q} />
        : tab === 'batiments' ? <Buildings query={q} />
          : tab === 'applications' ? <Apps query={q} salleId={salleId} />
            : <Posts key={`${salleId}|${q}`} list={posts} selected={selected} onToggle={toggle} />}
    </div>
    {tab === 'comptes' && me().role === 'superadmin' && <Schools />}
    {tab === 'applications' && <Operations state={state} />}
  </>;
}

const POSTS_PAGE = 25;

/** Postes de la salle filtrée, par pages ; un changement de filtre ou de recherche revient à la première page (key) */
function Posts({ list, selected, onToggle }) {
  const [page, setPage] = useState(1);
  if (!list.length) return <Empty text="Aucun poste trouvé" />;
  const installations = store.state.installations || [];
  const { pages, current, rows } = paginate(list, page, POSTS_PAGE);
  return <OpsTable head={['Sélection', 'Poste', 'Salle', 'État', 'Applications', 'Actions']}
    footer={pages > 1 ? <Pagination current={current} pages={pages} onPage={setPage} /> : null}>
    {rows.map((p) => <tr key={p.id} className={selected.has(p.id) ? 'is-selected' : ''} onClick={(e) => { if (outsideControls(e)) onToggle(p.id, !selected.has(p.id)); }}>
      <td><input className="ops-check" type="checkbox" checked={selected.has(p.id)} onChange={(e) => onToggle(p.id, e.target.checked)} aria-label={`Sélectionner ${p.nomReseau}`} /></td>
      <td><strong>{p.nomReseau}</strong></td>
      <td>{index().salle.get(p.salleId)?.nom}</td>
      <td><span className="ops-status"><span className={`led led--${p.connecte ? 'ok' : 'wait'}`}></span>{p.connecte ? 'Connecté' : 'Déconnecté'}</span></td>
      <td>{installations.filter((i) => i.posteId === p.id).length}</td>
      <td><button className="btn btn--ghost" onClick={() => openPostDetail(p.id)}>Ouvrir</button></td>
    </tr>)}
  </OpsTable>;
}

function Apps({ query, salleId }) {
  const apps = (store.state.applications || []).filter((a) => `${a.nom} ${a.editeur}`.toLowerCase().includes(query));
  const ids = new Set(scope().postes.filter((p) => !salleId || p.salleId === salleId).map((p) => p.id));
  if (!apps.length) return <Empty text="Aucune application trouvée" />;
  return <div className="ops-grid">{apps.map((a) => <article key={a.id} className="ops-card glass">
    <div className="ops-card-top"><AppIcon name={a.nom} size={40} /><div><h2>{a.nom}</h2><p>{a.editeur} · {a.version}</p></div></div>
    <p className="ops-muted">{(store.state.installations || []).filter((i) => i.applicationId === a.id && ids.has(i.posteId)).length} postes équipés</p>
    <button className="btn btn--primary" onClick={() => openDeploymentForm(a.id, null, salleId)}>Gérer le déploiement</button>
  </article>)}</div>;
}

// Suivi réel : chaque poste cible renvoie le résultat de l'intervention
function OperationStatus({ o }) {
  const states = Object.values(o.resultats || {});
  const done = states.filter((x) => x !== 'en_attente').length;
  const failed = states.filter((x) => x === 'echec').length;
  if (o.statut === 'terminee') return <span className="ops-status"><span className="led led--ok"></span>Terminée</span>;
  if (o.statut === 'echec') return <span className="ops-status"><span className="led led--hs"></span>Échec sur {failed} poste{failed > 1 ? 's' : ''}</span>;
  return <span className="ops-status"><span className="led led--wait"></span>{done ? `En cours, ${done}/${states.length} postes` : 'En attente des postes'}</span>;
}

const OPERATION_TYPES = { reinstallation: 'Réinstallation', installation: 'Installation', desinstallation: 'Désinstallation' };

function Operations({ state }) {
  const ids = new Set(scope().postes.map((p) => p.id));
  const items = (state.operations || []).filter((o) => o.cibles?.some((id) => ids.has(id))).slice().reverse().slice(0, 12);
  if (!items.length) return null;
  const label = (o) => (o.type === 'arret' ? (o.auto ? 'Arrêt automatique' : 'Arrêt de processus') : OPERATION_TYPES[o.type] || o.type);
  return <>
    <h2 className="ops-section-title">Demandes d’intervention</h2>
    <OpsTable head={['Intervention', 'Cible', 'Date', 'État']}>
      {items.map((o) => <tr key={o.id}>
        <td>{label(o)}<small>{o.image || (state.applications || []).find((a) => a.id === o.applicationId)?.nom || ''}</small></td>
        <td>{o.cibles.length} poste{o.cibles.length > 1 ? 's' : ''}</td>
        <td>{dateTime(o.at)}</td>
        <td><OperationStatus o={o} /></td>
      </tr>)}
    </OpsTable>
  </>;
}

/** Bâtiments de chaque école : information portée par les salles (RG-02), renommée pour toutes ses salles */
function Buildings({ query }) {
  const p = parc();
  const groups = new Map();
  for (const x of scope().salles) {
    const key = `${x.ecoleId}\u0000${x.batiment}`;
    const g = groups.get(key) ?? { ecoleId: x.ecoleId, batiment: x.batiment, salles: 0, etages: new Set(), materiels: 0 };
    g.salles++;
    g.etages.add(x.etage ?? 0);
    g.materiels += p.bySalle.get(x.id)?.total ?? 0;
    groups.set(key, g);
  }
  const all = currentEcole() === 'all';
  const list = [...groups.values()]
    .filter((g) => batimentLabel(g.batiment).toLowerCase().includes(query))
    .sort((a, b) => (index().ecole.get(a.ecoleId)?.nom ?? '').localeCompare(index().ecole.get(b.ecoleId)?.nom ?? '', 'fr') || a.batiment.localeCompare(b.batiment, 'fr', { numeric: true }));
  if (!list.length) return <Empty text="Aucun bâtiment trouvé" />;
  return <OpsTable head={['Bâtiment', ...(all ? ['École'] : []), 'Étages', 'Salles', 'Matériels', 'Actions']}>
    {list.map((g) => <tr key={`${g.ecoleId}-${g.batiment}`}>
      <td><span className="ops-building"><span className="code-badge">{g.batiment}</span><strong>{batimentLabel(g.batiment)}</strong></span></td>
      {all && <td>{index().ecole.get(g.ecoleId)?.nom}</td>}
      <td>{num(g.etages.size)}</td>
      <td>{num(g.salles)}</td>
      <td>{num(g.materiels)}</td>
      <td><button className="btn btn--ghost" onClick={() => openBuildingForm(g)}><Icon name="pencil" size={17} />Renommer</button></td>
    </tr>)}
  </OpsTable>;
}

async function toggleAccount(id) {
  try {
    const account = store.state.comptes.find((c) => c.id === id);
    if (!account) return;
    if (!await confirmSheet({ title: `${account.actif ? 'Désactiver' : 'Réactiver'} ce compte ?`, message: account.nom, confirm: account.actif ? 'Désactiver' : 'Réactiver', iconName: 'users' })) return;
    await store.update('data', (s) => { s.comptes.find((c) => c.id === account.id).actif = !account.actif; });
    await store.flush();
    notify('Compte mis à jour', { icon: 'check' });
  } catch (error) { notify(error.message, { tone: 'danger' }); }
}

function Accounts({ query }) {
  const list = (store.state.comptes || []).filter((c) => (currentEcole() === 'all' || c.ecoleId === currentEcole()) && `${c.nom} ${c.email}`.toLowerCase().includes(query));
  if (!list.length) return <Empty text="Aucun compte trouvé" />;
  return <OpsTable head={['Utilisateur', 'Profil', 'École', 'État', 'Actions']}>
    {list.map((c) => <tr key={c.id}>
      <td><strong>{c.nom}</strong><small>{c.email}</small></td>
      <td>{role(c.role).label}</td>
      <td>{index().ecole.get(c.ecoleId)?.nom || 'Toutes les écoles'}</td>
      <td><span className="ops-status"><span className={`led led--${c.actif ? 'ok' : 'wait'}`}></span>{c.actif ? 'Actif' : 'Désactivé'}</span></td>
      <td>
        <button className="icon-btn" onClick={() => openAccountForm(store.state.comptes.find((x) => x.id === c.id))} aria-label={`Modifier ${c.nom}`}><Icon name="pencil" size={17} /></button>
        {c.id !== me().id && <button className="btn btn--ghost" onClick={() => toggleAccount(c.id)}>{c.actif ? 'Désactiver' : 'Réactiver'}</button>}
      </td>
    </tr>)}
  </OpsTable>;
}

function Schools() {
  return <>
    <h2 className="ops-section-title">Écoles</h2>
    <div className="ops-grid">
      {store.state.ecoles.map((e) => <article key={e.id} className="ops-card glass">
        <div className="ops-card-top"><Tile name="school" color="var(--c3)" size="m" /><div><h3>{e.nom}</h3><p>{store.state.salles.filter((s) => s.ecoleId === e.id).length} salles</p></div></div>
        <button className="btn btn--ghost" onClick={() => openSchoolForm(store.state.ecoles.find((x) => x.id === e.id))}>Modifier</button>
      </article>)}
      <article className="ops-card glass">
        <h3>Une nouvelle école</h3>
        <p className="ops-muted">Organiser un nouvel espace de gestion.</p>
        <button className="btn btn--primary" onClick={() => openSchoolForm()}>Ajouter une école</button>
      </article>
    </div>
  </>;
}
