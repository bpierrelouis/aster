/* ==========================================================================
   Administration : postes (réinitialisation d'une salle ou de postes),
   applications (installation, désinstallation), suivi des interventions
   (administration-interventions.jsx), bâtiments (renommage), comptes et
   écoles. L'utilisateur demande une intervention (administration-
   intervention-form.jsx) ; chaque poste cible l'exécute et renvoie son résultat.
   ========================================================================== */

import { useState } from 'react';
import { useParams } from 'react-router';
import { store, currentEcole, me } from '../../core/store.js';
import { useStore } from '../../hooks/use-store.js';
import { scope, index, parc, batimentLabel, emplacement } from '../../core/selectors.js';
import { can } from '../../core/permissions.js';
import { role } from '#shared/catalog.js';
import { num, plural } from '#shared/format.js';
import { Icon, Tile } from '../../ui/icons.jsx';
import { AppIcon } from '../../ui/app-icon.jsx';
import { confirmSheet, notify } from '../../ui/overlays.jsx';
import { openAccountForm, openSchoolForm, openPostDetail } from './administration-forms.jsx';
import { openInterventionForm } from './administration-intervention-form.jsx';
import { Interventions } from './administration-interventions.jsx';
import { openBuildingForm } from '../salles/salles-forms.jsx';
import { DataPanel, OpsEmpty, OpsTable, PageHead, Pagination, PosteEtat, paginate } from '../../widgets/parts.jsx';
import { useTitle } from '../../hooks/use-title.js';

const Empty = ({ text }) => <OpsEmpty icon="desktop" title={text} />;

const TITLES = {
  postes: 'Administration des postes',
  applications: 'Applications',
  batiments: 'Bâtiments',
  comptes: 'Comptes & accès',
};
const SEARCH = { postes: 'Nom du poste…', applications: 'Application…', batiments: 'Bâtiment…', comptes: 'Nom ou adresse…' };

export function Administration() {
  useTitle('Administration');
  useStore();
  const { tab = 'postes', id } = useParams();
  const [salleChoice, setSalleId] = useState('');
  const [query, setQuery] = useState('');
  // La recherche repart de zéro à chaque changement d'onglet
  const [queryTab, setQueryTab] = useState(tab);
  if (queryTab !== tab) { setQueryTab(tab); setQuery(''); }

  if (!can('administration.view')) return <Empty text="Accès non autorisé" />;
  if (tab === 'interventions') return <Interventions id={id} />;

  const salleId = salleChoice && scope().salleIds.has(salleChoice) ? salleChoice : '';
  const q = query.toLowerCase();
  const posts = scope().postes.filter((p) => (!salleId || p.salleId === salleId) && p.nomReseau.toLowerCase().includes(q));

  return <>
    <PageHead title={TITLES[tab] || TITLES.postes}>
      {tab === 'postes' && <button className="btn btn--primary" onClick={() => openInterventionForm('reinstallation', { salleId: salleId || null })}><Icon name="refresh" size={18} /><span>Réinitialiser</span></button>}
      {tab === 'comptes' && <button className="btn btn--primary" onClick={() => openAccountForm()}><Icon name="plus" size={18} /><span>Créer un compte</span></button>}
    </PageHead>
    {tab === 'postes'
      ? <Posts list={posts} salleId={salleId} onSalle={setSalleId} query={query} onQuery={setQuery} />
      : <>
        <div className="ops-toolbar">
          {tab === 'applications' && <label className="field"><span className="field-label">Salle</span><SalleFilter value={salleId} onChange={setSalleId} /></label>}
          <label className="field"><span className="field-label">Rechercher</span>
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder={SEARCH[tab] ?? SEARCH.postes} aria-label="Rechercher" />
          </label>
        </div>
        <div>
          {tab === 'comptes' ? <Accounts query={q} />
            : tab === 'batiments' ? <Buildings query={q} />
              : <Apps query={q} salleId={salleId} />}
        </div>
      </>}
    {tab === 'comptes' && me().role === 'superadmin' && <Schools />}
  </>;
}

const POSTS_PAGE = 25;

/** Filtre par salle (postes, applications) */
function SalleFilter({ value, onChange }) {
  return <select aria-label="Filtrer par salle" value={value} onChange={(e) => onChange(e.target.value)}>
    <option value="">Toutes les salles</option>
    {scope().salles.map((s) => <option key={s.id} value={s.id}>{s.nom} · Bâtiment {s.batiment}</option>)}
  </select>;
}

/** Postes : même carte que l'inventaire (filtres, tableau, pagination) ; un filtre revient à la première page.
    La réinitialisation (salle entière ou postes) se demande depuis la barre haute. */
function Posts({ list, salleId, onSalle, query, onQuery }) {
  const [page, setPage] = useState(1);
  const filter = (set) => (value) => { set(value); setPage(1); };
  const installations = store.state.installations || [];
  const { pages, current, rows } = paginate(list, page, POSTS_PAGE);
  return <DataPanel
    filters={<>
      <label className="field field--search"><Icon name="recherche" size={18} /><input type="search" value={query} onChange={(e) => filter(onQuery)(e.target.value)} placeholder={SEARCH.postes} aria-label="Rechercher un poste" /></label>
      <SalleFilter value={salleId} onChange={filter(onSalle)} />
    </>}
    head={<><th>Poste</th><th>Emplacement</th><th>Matériel</th><th>État</th><th>Applications</th><th><span className="sr-only">Actions</span></th></>}
    footer={<Pagination current={current} pages={pages} onPage={setPage} total={plural(list.length, 'poste')} />}>
    {rows.length ? rows.map((p) => {
      const m = index().materiel.get(p.materielId);
      return <tr key={p.id}>
        <td><strong>{p.nomReseau}</strong></td>
        <td>{emplacement(index().salle.get(p.salleId))}</td>
        <td>{m ? <>{m.idOrion}<small className="inv-sub">{m.modele}</small></> : <span className="ops-muted">Aucun</span>}</td>
        <td><PosteEtat p={p} /></td>
        <td>{installations.filter((i) => i.posteId === p.id).length}</td>
        <td><button className="btn btn--ghost" onClick={() => openPostDetail(p.id)}>Ouvrir</button></td>
      </tr>;
    }) : <tr><td colSpan={6}><div className="w-empty w-empty--l">Aucun poste ne correspond aux filtres.</div></td></tr>}
  </DataPanel>;
}

/** Applications : installer ou désinstaller, la salle filtrée étant proposée comme cible */
function Apps({ query, salleId }) {
  const apps = (store.state.applications || []).filter((a) => `${a.nom} ${a.editeur}`.toLowerCase().includes(query));
  const ids = new Set(scope().postes.filter((p) => !salleId || p.salleId === salleId).map((p) => p.id));
  if (!apps.length) return <Empty text="Aucune application trouvée" />;
  return <div className="ops-grid">{apps.map((a) => <article key={a.id} className="ops-card glass">
    <div className="ops-card-top"><AppIcon name={a.nom} size={40} /><div><h2>{a.nom}</h2><p>{a.editeur} · {a.version}</p></div></div>
    <p className="ops-muted">{plural((store.state.installations || []).filter((i) => i.applicationId === a.id && ids.has(i.posteId)).length, 'poste équipé', 'postes équipés')}</p>
    <div className="ops-card-actions">
      <button className="btn btn--primary" onClick={() => openInterventionForm('installation', { applicationId: a.id, salleId })}>Installer</button>
      <button className="btn btn--danger-ghost" onClick={() => openInterventionForm('desinstallation', { applicationId: a.id, salleId })}>Désinstaller</button>
    </div>
  </article>)}</div>;
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
