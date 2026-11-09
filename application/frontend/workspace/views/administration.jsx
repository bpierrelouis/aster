/* ==========================================================================
   Administration : postes (réinstallation), applications (déploiement),
   comptes et écoles. L'utilisateur enregistre une demande d'intervention ;
   chaque poste cible l'exécute et renvoie son résultat.
   ========================================================================== */

import { useState } from 'react';
import { useParams } from 'react-router';
import { store, currentEcole, me } from '../core/store.js';
import { useStore } from '../core/useStore.js';
import { scope, index } from '../core/selectors.js';
import { can } from '../core/permissions.js';
import { role } from '../core/catalog.js';
import { Icon, Tile } from '../ui/icons.jsx';
import { confirmSheet, notify } from '../ui/overlays.jsx';
import { openAccountForm, openSchoolForm, recordOperation, openDeploymentForm, openPostDetail } from './administration-forms.jsx';
import { OpsEmpty, PageHead } from '../widgets/parts.jsx';
import { dateTime } from '../core/format.js';
import { useTitle } from '../ui/useTitle.js';

const Empty = ({ text }) => <OpsEmpty icon="desktop" title={text} />;

const TITLES = {
  postes: 'Administration des postes',
  applications: 'Applications',
  comptes: 'Comptes & accès',
};

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
      {tab !== 'comptes' && <label className="field"><span className="field-label">Salle</span>
        <select aria-label="Filtrer par salle" value={salleId} onChange={(e) => { setSalleId(e.target.value); setSelection(new Set()); }}>
          <option value="">Toutes les salles</option>
          {scope().salles.map((s) => <option key={s.id} value={s.id}>{s.nom} · Bâtiment {s.batiment}</option>)}
        </select>
      </label>}
      <label className="field"><span className="field-label">Rechercher</span>
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder={tab === 'comptes' ? 'Nom ou adresse…' : tab === 'applications' ? 'Application…' : 'Nom du poste…'} aria-label="Rechercher" />
      </label>
      {tab === 'postes' && <>
        <button className="btn btn--ghost" onClick={selectAll}>Tout sélectionner</button>
        <button className="btn btn--primary" disabled={!selected.size} onClick={reinstall}><Icon name="refresh" size={17} />Réinstaller ({selected.size})</button>
      </>}
    </div>
    <div>
      {tab === 'comptes' ? <Accounts query={q} />
        : tab === 'applications' ? <Apps query={q} salleId={salleId} />
          : <Posts list={posts} selected={selected} onToggle={toggle} />}
    </div>
    {tab === 'comptes' && me().role === 'superadmin' && <Schools />}
    {tab !== 'comptes' && <Operations state={state} />}
  </>;
}

function Posts({ list, selected, onToggle }) {
  if (!list.length) return <Empty text="Aucun poste trouvé" />;
  const installations = store.state.installations || [];
  return <div className="ops-table-wrap glass"><table className="ops-table">
    <thead><tr><th>Sélection</th><th>Poste</th><th>Salle</th><th>État</th><th>Applications</th><th>Actions</th></tr></thead>
    <tbody>{list.map((p) => <tr key={p.id}>
      <td><input className="ops-check" type="checkbox" checked={selected.has(p.id)} onChange={(e) => onToggle(p.id, e.target.checked)} aria-label={`Sélectionner ${p.nomReseau}`} /></td>
      <td><strong>{p.nomReseau}</strong></td>
      <td>{index().salle.get(p.salleId)?.nom}</td>
      <td><span className="ops-status"><span className={`led led--${p.connecte ? 'ok' : 'wait'}`}></span>{p.connecte ? 'Connecté' : 'Déconnecté'}</span></td>
      <td>{installations.filter((i) => i.posteId === p.id).length}</td>
      <td><button className="btn btn--ghost" onClick={() => openPostDetail(p.id)}>Ouvrir</button></td>
    </tr>)}</tbody>
  </table></div>;
}

function Apps({ query, salleId }) {
  const apps = (store.state.applications || []).filter((a) => `${a.nom} ${a.editeur}`.toLowerCase().includes(query));
  const ids = new Set(scope().postes.filter((p) => !salleId || p.salleId === salleId).map((p) => p.id));
  if (!apps.length) return <Empty text="Aucune application trouvée" />;
  return <div className="ops-grid">{apps.map((a) => <article key={a.id} className="ops-card glass">
    <div className="ops-card-top"><Tile name="widgets" color="var(--iris)" size="m" /><div><h2>{a.nom}</h2><p>{a.editeur} · {a.version}</p></div></div>
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
    <div className="ops-table-wrap glass"><table className="ops-table">
      <thead><tr><th>Intervention</th><th>Cible</th><th>Date</th><th>État</th></tr></thead>
      <tbody>{items.map((o) => <tr key={o.id}>
        <td>{label(o)}<small>{o.image || (state.applications || []).find((a) => a.id === o.applicationId)?.nom || ''}</small></td>
        <td>{o.cibles.length} poste{o.cibles.length > 1 ? 's' : ''}</td>
        <td>{dateTime(o.at)}</td>
        <td><OperationStatus o={o} /></td>
      </tr>)}</tbody>
    </table></div>
  </>;
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
  return <div className="ops-table-wrap glass"><table className="ops-table">
    <thead><tr><th>Utilisateur</th><th>Profil</th><th>École</th><th>État</th><th>Actions</th></tr></thead>
    <tbody>{list.map((c) => <tr key={c.id}>
      <td><strong>{c.nom}</strong><small>{c.email}</small></td>
      <td>{role(c.role).label}</td>
      <td>{index().ecole.get(c.ecoleId)?.nom || 'Toutes les écoles'}</td>
      <td><span className="ops-status"><span className={`led led--${c.actif ? 'ok' : 'wait'}`}></span>{c.actif ? 'Actif' : 'Désactivé'}</span></td>
      <td>
        <button className="icon-btn" onClick={() => openAccountForm(store.state.comptes.find((x) => x.id === c.id))} aria-label={`Modifier ${c.nom}`}><Icon name="edit" size={17} /></button>
        {c.id !== me().id && <button className="btn btn--ghost" onClick={() => toggleAccount(c.id)}>{c.actif ? 'Désactiver' : 'Réactiver'}</button>}
      </td>
    </tr>)}</tbody>
  </table></div>;
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
