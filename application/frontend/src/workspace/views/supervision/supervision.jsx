/* ==========================================================================
   Supervision : alertes (onglet par défaut), processus des postes par
   salle, règles de classement (whitelist / blacklist) et statistiques
   d'utilisation. Processus et détections ne sont alimentés que par les
   postes ; l'utilisateur demande un arrêt, le poste l'exécute. La recherche
   ignore casse et accents et reconnaît le nom de l'application d'un
   exécutable (« libreoffice » trouve soffice.exe).
   ========================================================================== */

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router';
import { store, currentEcole, me } from '../../core/store.js';
import { useStore } from '../../hooks/use-store.js';
import { scope, index, detections, batiments } from '../../core/selectors.js';
import { uid } from '../../core/dom.js';
import { can } from '../../core/permissions.js';
import { CLASSEMENTS } from '#shared/catalog.js';
import { processClass, logiciel } from '#shared/operations-data.js';
import { Icon, Tile } from '../../ui/icons.jsx';
import { AppIcon } from '../../ui/app-icon.jsx';
import { Sheet, openSheet, confirmSheet, notify } from '../../ui/overlays.jsx';
import { SheetForm, SheetFormActions } from '../../ui/forms.jsx';
import { OpsEmpty, OpsTable, PageHead } from '../../widgets/parts.jsx';
import { dateTime, clock } from '#shared/format.js';
import { useTitle } from '../../hooks/use-title.js';

const time = () => clock(Date.now());

function Status({ c }) {
  return <span className="ops-status"><span className={`led led--${CLASSEMENTS[c]?.led || 'wait'}`}></span>{CLASSEMENTS[c]?.label || c}</span>;
}

const Empty = ({ title, text }) => <OpsEmpty icon="supervision" title={title} text={text} />;

const TITLES = {
  alertes: 'Alertes & détections',
  salles: 'Supervision des salles',
  listes: 'Règles de processus',
  statistiques: 'Utilisation du parc',
};
const SEARCH = { alertes: 'Processus, poste ou compte…', salles: 'Poste, processus ou compte…', listes: 'Processus ou application…', statistiques: 'Processus ou application…' };

// Recherche insensible à la casse, aux accents et aux espaces : chaque mot cherché figure dans l'un des textes
const fold = (text) => String(text ?? '').normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
function matcher(query) {
  const words = fold(query).split(/\s+/).filter(Boolean);
  return (...texts) => { const t = fold(texts.join(' ')); return words.every((w) => t.includes(w)); };
}
// Un exécutable se cherche aussi par le nom de son application
const processText = (nom) => `${nom} ${logiciel(nom)?.nom ?? ''}`;

export function Supervision() {
  useTitle('Supervision');
  const state = useStore();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const [salleChoice, setSalleId] = useState(() => searchParams.get('salle') || '');
  const [query, setQuery] = useState('');
  const [stamp, setStamp] = useState(time);

  // Une salle passée dans l'adresse remplace la sélection courante
  useEffect(() => {
    if (searchParams.has('salle')) setSalleId(searchParams.get('salle'));
  }, [searchParams]);

  // Horodatage de la dernière synchronisation reçue
  useEffect(() => store.subscribe((topic) => { if (topic !== 'prefs' && topic !== 'layout') setStamp(time()); }), []);

  if (!can('supervision.view')) return <Empty title="Accès non autorisé" text="Ce module n’est pas accessible avec votre profil." />;

  const salleId = salleChoice && scope().salleIds.has(salleChoice) ? salleChoice : '';
  const allowed = can('administration.view') ? Object.keys(TITLES) : ['alertes', 'salles'];
  const tab = allowed.includes(params.tab) ? params.tab : 'alertes';
  const relevant = (state.processus || []).filter((p) => scope().salleIds.has(p.salleId) && (!salleId || p.salleId === salleId));

  return <>
    <PageHead title={TITLES[tab]}>
      {tab === 'listes'
        ? <button className="btn btn--primary" onClick={() => openRuleForm()}><Icon name="plus" size={18} /><span>Ajouter une règle</span></button>
        : <span className="ops-status"><span className="led led--ok"></span><span>Actualisé à {stamp}</span></span>}
    </PageHead>
    <div className="ops-toolbar">
      {['salles', 'alertes'].includes(tab) && <label className="field"><span className="field-label">Salle à superviser</span>
        <select aria-label="Salle à superviser" value={salleId} onChange={(e) => setSalleId(e.target.value)}>
          <option value="">Choisir une salle</option>
          {scope().salles.map((s) => <option key={s.id} value={s.id}>{s.nom} · Bâtiment {s.batiment}</option>)}
        </select>
      </label>}
      <label className="field"><span className="field-label">Rechercher</span>
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={SEARCH[tab]} aria-label="Rechercher" />
      </label>
    </div>
    <div>
      {tab === 'listes' ? <Rules query={query} />
        : tab === 'salles' ? <Rooms salleId={salleId} query={query} relevant={relevant} />
          : tab === 'statistiques' ? <Stats relevant={relevant} query={query} />
            : <Alerts salleId={salleId} query={query} />}
    </div>
  </>;
}

// Arrêt demandé et pas encore exécuté par le poste
const stopRequested = (state, processId) => (state.operations || []).some((o) => o.type === 'arret' && o.processusId === processId && o.statut === 'enregistree');

async function requestStop(proc) {
  try {
    await store.update('data', (s) => { s.operations.push({ id: uid('op'), type: 'arret', cibles: [proc.posteId], processusId: proc.id }); });
    await store.flush();
    notify('Arrêt demandé au poste', { icon: 'check', tone: 'info' });
  } catch (error) { notify(error.message, { tone: 'danger' }); }
}

function Rooms({ salleId, query, relevant }) {
  if (!salleId) return <Empty title="Choisissez votre salle" text="Sélectionnez une salle pour consulter ses postes et leurs processus." />;
  const state = store.state;
  const matches = matcher(query);
  // Un poste trouvé par son nom montre tous ses processus en cours ; sinon, seulement ceux qui correspondent
  const shown = scope().postes.filter((p) => p.salleId === salleId).flatMap((p) => {
    const running = relevant.filter((x) => x.posteId === p.id && !x.stoppedAt);
    if (matches(p.nomReseau)) return [{ p, processes: running }];
    const found = running.filter((x) => matches(p.nomReseau, processText(x.nom), x.compte));
    return found.length ? [{ p, processes: found }] : [];
  });
  if (!shown.length) return <Empty title="Aucun poste" text="Aucun poste ni processus en cours ne correspond à cette recherche." />;
  return <div className="ops-grid">{shown.map(({ p, processes }) => <article key={p.id} className="ops-card glass">
    <div className="ops-card-top"><Tile name="desktop" color="var(--accent)" size="m" /><div><h2>{p.nomReseau}</h2><p><span className={`led led--${p.connecte ? 'ok' : 'wait'}`}></span> {p.connecte ? 'Connecté' : 'Déconnecté'}</p></div></div>
    {!p.connecte ? <p className="ops-muted">Aucun processus disponible.</p>
      : !processes.length ? <p className="ops-muted">Aucun processus utilisateur en cours.</p>
        : processes.map((x) => <div key={x.id} className="ops-process">
          <AppIcon name={x.nom} />
          <div><strong>{x.nom}</strong><small>{x.compte}</small><small><Status c={processClass(state, x)} /></small></div>
          {stopRequested(state, x.id)
            ? <span className="ops-status"><span className="led led--wait"></span>Arrêt demandé</span>
            : <button className="icon-btn" data-stop={x.id} onClick={() => requestStop(x)} aria-label={`Arrêter ${x.nom} sur ${p.nomReseau}`} data-tip="Arrêter ce processus"><Icon name="power" size={17} /></button>}
        </div>)}
  </article>)}</div>;
}

function Alerts({ salleId, query }) {
  if (!can('administration.view') && !salleId) return <Empty title="Choisissez votre salle" text="Les alertes concernent la salle que vous supervisez." />;
  const matches = matcher(query);
  const items = detections().filter((d) => (!salleId || d.salleId === salleId)
    && matches(processText(d.processus), index().poste.get(d.posteId)?.nomReseau, index().salle.get(d.salleId)?.nom, d.compte));
  if (!items.length) return <Empty title="Aucune détection" text="Aucun événement ne correspond à votre sélection." />;
  return <OpsTable head={['Processus', 'Poste / salle', 'Compte Windows', 'Détection', 'Résultat']}>
    {items.map((d) => <tr key={d.id}>
      <td><span className="app-cell"><AppIcon name={d.processus} /><span><strong>{d.processus}</strong><small><Status c={d.classement} /></small></span></span></td>
      <td>{index().poste.get(d.posteId)?.nomReseau}<small>{index().salle.get(d.salleId)?.nom}</small></td>
      <td>{d.compte}</td>
      <td>{dateTime(d.at)}</td>
      <td>{d.arret ? `Arrêt ${d.arret}` : d.classement === 'blacklist' ? 'Arrêt en cours' : 'Historisé'}</td>
    </tr>)}
  </OpsTable>;
}

async function deleteRule(id) {
  try {
    if (!await confirmSheet({ title: 'Supprimer cette règle ?', message: 'Les autres règles applicables restent actives.' })) return;
    await store.update('data', (s) => { s.regles = s.regles.filter((r) => r.id !== id); });
    await store.flush();
    notify('Règle supprimée', { icon: 'check' });
  } catch (error) { notify(error.message, { tone: 'danger' }); }
}

function Rules({ query }) {
  const e = currentEcole();
  const matches = matcher(query);
  const scopeLabel = (r) => (r.portee === 'global' ? 'Toutes les écoles' : r.portee === 'ecole' ? index().ecole.get(r.ecoleId)?.nom : r.portee === 'batiment' ? `Bâtiment ${r.batiment}` : index().salle.get(r.salleId)?.nom);
  const rules = (store.state.regles || []).filter((r) => (r.portee === 'global' || e === 'all' || r.ecoleId === e)
    && matches(processText(r.nom), CLASSEMENTS[r.classement]?.label, scopeLabel(r)));
  return <>
    <p className="ops-muted" style={{ marginBottom: 20 }}>Les règles se cumulent. Une interdiction reste prioritaire sur une autorisation.</p>
    <OpsTable head={['Processus', 'Classement', 'Portée', 'Actions']}>
      {!rules.length && <tr><td colSpan={4}><div className="w-empty w-empty--l">Aucune règle ne correspond à cette recherche.</div></td></tr>}
      {rules.map((r) => <tr key={r.id}>
        <td><span className="app-cell"><AppIcon name={r.nom} /><strong>{r.nom}</strong></span></td>
        <td><Status c={r.classement} /></td>
        <td>{scopeLabel(r)}</td>
        <td>{r.portee !== 'global' || me().role === 'superadmin'
          ? <>
            <button className="icon-btn" onClick={() => openRuleForm(store.state.regles.find((x) => x.id === r.id))} aria-label={`Modifier ${r.nom}`}><Icon name="pencil" size={17} /></button>
            <button className="icon-btn" onClick={() => deleteRule(r.id)} aria-label={`Supprimer ${r.nom}`}><Icon name="trash" size={17} /></button>
          </>
          : <span className="ops-muted">Règle globale</span>}</td>
      </tr>)}
    </OpsTable>
  </>;
}

function Stats({ relevant, query }) {
  const postes = scope().postes;
  const connected = postes.filter((p) => p.connecte).length;
  const ds = detections();
  const counts = new Map();
  ds.forEach((d) => counts.set(d.processus, (counts.get(d.processus) || 0) + 1));
  const max = Math.max(1, ...counts.values());
  const matches = matcher(query);
  const shown = [...counts].filter(([nom]) => matches(processText(nom))).sort((x, y) => y[1] - x[1]);
  const metrics = [
    ['Postes connectés', connected, `${postes.length} postes au total`],
    ['Processus utilisateur actifs', relevant.filter((p) => !p.stoppedAt).length, 'Dernier état disponible'],
    ['Détections conservées', ds.length, `${ds.filter((d) => d.classement === 'blacklist').length} processus interdits`],
  ];
  return <>
    <div className="ops-metrics">{metrics.map(([label, n, sub]) => <article key={label} className="ops-metric glass"><span>{label}</span><strong>{n}</strong><span>{sub}</span></article>)}</div>
    <h2 className="ops-section-title">Processus détectés</h2>
    {shown.length
      ? <div className="ops-grid">{shown.map(([nom, n]) => <article key={nom} className="ops-card glass">
        <div className="ops-card-top"><AppIcon name={nom} size={36} /><h3>{nom}</h3></div><span className="ops-muted">{n} détection{n > 1 ? 's' : ''}</span><div className="ops-bar"><i style={{ width: `${n / max * 100}%` }}></i></div>
      </article>)}</div>
      : <p className="ops-muted">{counts.size ? 'Aucun processus détecté ne correspond à cette recherche.' : 'Aucun processus détecté.'}</p>}
  </>;
}

const PORTEES = { global: 'Globale', ecole: 'École', batiment: 'Bâtiment', salle: 'Salle' };

function openRuleForm(rule = null) {
  openSheet(<Sheet title={rule ? 'Modifier la règle' : 'Ajouter une règle'} lead={<Tile name="shield" color="var(--accent)" size="m" />}
    footer={<SheetFormActions form="rule-form" />}>
    <RuleForm rule={rule} />
  </Sheet>);
}

function RuleForm({ rule }) {
  const state = useStore();
  const ecole = currentEcole() === 'all' ? state.ecoles[0]?.id : currentEcole();

  async function save(form) {
    const values = Object.fromEntries(form);
    values.nom = values.nom.trim();
    const room = scope().salles.find((s) => s.id === values.salleId);
    if (values.portee === 'salle') values.ecoleId = room?.ecoleId;
    if (values.portee === 'global') values.ecoleId = null;
    await store.update('data', (s) => {
      const item = { id: rule?.id || uid('rule'), ...values };
      if (rule) s.regles.splice(s.regles.findIndex((r) => r.id === rule.id), 1, item); else s.regles.push(item);
    });
    await store.flush();
    notify('Règle enregistrée', { icon: 'shield', tone: 'info' });
  }

  return <SheetForm id="rule-form" onSave={save}>
    <label className="field"><span className="field-label">Nom du processus *</span><input name="nom" defaultValue={rule?.nom || ''} required maxLength={100} placeholder="application.exe" /></label>
    <div className="form-2">
      <label className="field"><span className="field-label">Classement</span>
        <select name="classement" defaultValue={rule?.classement}><option value="whitelist">Autorisé (whitelist)</option><option value="blacklist">Interdit (blacklist)</option></select>
      </label>
      <label className="field"><span className="field-label">Portée</span>
        <select name="portee" defaultValue={rule?.portee}>
          {(me().role === 'superadmin' ? ['global', 'ecole', 'batiment', 'salle'] : ['ecole', 'batiment', 'salle']).map((p) => <option key={p} value={p}>{PORTEES[p]}</option>)}
        </select>
      </label>
      <label className="field"><span className="field-label">École</span>
        <select name="ecoleId" defaultValue={rule?.ecoleId || ecole}>{state.ecoles.map((e) => <option key={e.id} value={e.id}>{e.nom}</option>)}</select>
      </label>
      <label className="field"><span className="field-label">Bâtiment</span>
        <select name="batiment" defaultValue={rule?.batiment}>{batiments().map((b) => <option key={b}>{b}</option>)}</select>
      </label>
      <label className="field"><span className="field-label">Salle</span>
        <select name="salleId" defaultValue={rule?.salleId}>{scope().salles.map((s) => <option key={s.id} value={s.id}>{s.nom}</option>)}</select>
      </label>
    </div>
  </SheetForm>;
}
