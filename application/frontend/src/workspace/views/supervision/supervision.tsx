/* ==========================================================================
   Supervision : alertes (onglet par défaut), processus des postes par
   salle, règles de classement (liste blanche / liste noire) et statistiques
   d'utilisation. Processus et détections ne sont alimentés que par les
   postes ; l'utilisateur demande un arrêt, le poste l'exécute. La recherche
   ignore casse et accents et reconnaît le nom de l'application d'un
   exécutable (« libreoffice » trouve soffice.exe).
   ========================================================================== */

import { FilterSelect } from '../../ui/filter-select.tsx';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router';
import { store, currentEcole, me } from '../../core/store.ts';
import { useStore } from '../../hooks/use-store.ts';
import { scope, index, optionsSalles, detections, batiments, batimentLabel } from '../../core/selectors.ts';
import { uid } from '../../core/dom.ts';
import { can } from '../../core/permissions.ts';
import { matcher } from '../../core/search.ts';
import { CLASSEMENTS } from '#shared/catalog.ts';
import { processClass, logiciel } from '#shared/operations-data.ts';
import { Icon, Tile } from '../../ui/icons.tsx';
import { AppIcon } from '../../ui/app-icon.tsx';
import { Sheet, openSheet, confirmSheet, notify } from '../../ui/overlays.tsx';
import { SheetForm, SheetFormActions } from '../../ui/forms.tsx';
import { OpsEmpty, OpsTable, PageHead, PosteEtat, SearchField } from '../../widgets/parts.tsx';
import { dateTime, clock, num, plural } from '#shared/format.ts';
import { useTitle } from '../../hooks/use-title.ts';
import type { Classement, Id, Operation, Portee, Processus, Regle, WorkspaceView } from '#shared/types.ts';

const time = () => clock(Date.now());

function Status({ c }: { c: Classement }) {
  return <span className="ops-status"><span className={`led led--${CLASSEMENTS[c]?.led || 'wait'}`}></span>{CLASSEMENTS[c]?.label || c}</span>;
}

const Empty = ({ title, text }: { title: string; text: string }) => <OpsEmpty icon="supervision" title={title} text={text} />;

const TITLES = {
  alertes: 'Alertes & détections',
  salles: 'Supervision des salles',
  listes: 'Règles de processus',
  statistiques: 'Utilisation du parc',
};
type Tab = keyof typeof TITLES;
const SEARCH: Record<Tab, string> = { alertes: 'Processus, poste, adresse IP ou compte…', salles: 'Poste, processus ou compte…', listes: 'Processus ou application…', statistiques: 'Processus ou application…' };

// Un exécutable se cherche aussi par le nom de son application
const processText = (nom: string) => `${nom} ${logiciel(nom)?.nom ?? ''}`;

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
    if (searchParams.has('salle')) setSalleId(searchParams.get('salle')!);
  }, [searchParams]);

  // Horodatage de la dernière synchronisation reçue
  useEffect(() => store.subscribe((topic) => { if (topic !== 'prefs' && topic !== 'layout') setStamp(time()); }), []);

  if (!can('supervision.view')) return <Empty title="Accès non autorisé" text="Ce module n’est pas accessible avec votre profil." />;

  const salleId = salleChoice && scope().salleIds.has(salleChoice) ? salleChoice : '';
  const allowed: Tab[] = can('administration.view') ? Object.keys(TITLES) as Tab[] : ['alertes', 'salles'];
  const tab = allowed.find((t) => t === params.tab) ?? 'alertes';
  const relevant = (state.processus || []).filter((p) => scope().salleIds.has(p.salleId) && (!salleId || p.salleId === salleId));

  return <>
    <PageHead title={TITLES[tab]}>
      {tab === 'listes'
        ? <button className="btn btn--primary" onClick={() => openRuleForm()}><Icon name="plus" size={18} /><span>Ajouter une règle</span></button>
        : <span className="ops-status"><span className="led led--ok"></span><span>Actualisé à {stamp}</span></span>}
    </PageHead>
    <div className="ops-toolbar">
      {['salles', 'alertes'].includes(tab) && <div className="field"><span className="field-label">Salle à superviser</span>
        <FilterSelect aria-label="Salle à superviser" value={salleId} onChange={(e) => setSalleId(e.target.value)} options={[{ value: '', label: 'Choisir une salle' }, ...optionsSalles()]} />
      </div>}
      <SearchField compact value={query} onChange={setQuery} placeholder={SEARCH[tab]} label="Rechercher" />
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
const stopRequested = (state: WorkspaceView, processId: Id) => (state.operations || []).some((o) => o.type === 'arret' && o.processusId === processId && o.statut === 'enregistree');

async function requestStop(proc: Processus) {
  try {
    // Demande partielle : le serveur complète l'opération (école, date, auteur, statut, résultats)
    await store.update('data', (s) => { s.operations.push({ id: uid('op'), type: 'arret', cibles: [proc.posteId], processusId: proc.id } as Operation); });
    await store.flush();
    notify('Arrêt demandé au poste', { icon: 'check', tone: 'info' });
  } catch (error) { notify((error as Error).message, { tone: 'danger' }); }
}

function Rooms({ salleId, query, relevant }: { salleId: Id; query: string; relevant: Processus[] }) {
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
    <div className="ops-card-top"><Tile name="desktop" color="var(--accent)" size="m" /><div><h2>{p.nomReseau}</h2><p><PosteEtat p={p} /></p></div></div>
    {!p.allume ? <p className="ops-muted">Aucun processus disponible.</p>
      : !p.session ? <p className="ops-muted">Aucune session ouverte.</p>
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

function Alerts({ salleId, query }: { salleId: Id; query: string }) {
  if (!can('administration.view') && !salleId) return <Empty title="Choisissez votre salle" text="Les alertes concernent la salle que vous supervisez." />;
  const matches = matcher(query);
  const items = detections().map((d) => ({ d, poste: index().poste.get(d.posteId) })).filter(({ d, poste }) => (!salleId || d.salleId === salleId)
    && matches(processText(d.processus), poste?.nomReseau, poste?.adresseIp, index().salle.get(d.salleId)?.nom, d.compte))
    .sort((x, y) => y.d.at - x.d.at); // détections les plus récentes d'abord
  if (!items.length) return <Empty title="Aucune détection" text="Aucun événement ne correspond à votre sélection." />;
  return <OpsTable head={['Processus', 'Poste / salle', 'Adresse IP', 'Compte Windows', 'Détection', 'Résultat']}>
    {items.map(({ d, poste }) => <tr key={d.id}>
      <td><span className="app-cell"><AppIcon name={d.processus} /><span><strong>{d.processus}</strong><small><Status c={d.classement} /></small></span></span></td>
      <td>{poste?.nomReseau}<small>{index().salle.get(d.salleId)?.nom}</small></td>
      <td>{poste?.adresseIp ?? '—'}</td>
      <td>{d.compte}</td>
      <td>{dateTime(d.at)}</td>
      <td>{d.arret ? `Arrêt ${d.arret}` : d.classement === 'blacklist' ? 'Arrêt en cours' : 'Historisé'}</td>
    </tr>)}
  </OpsTable>;
}

async function deleteRule(id: Id) {
  try {
    if (!await confirmSheet({ title: 'Supprimer cette règle ?', message: 'Les autres règles applicables restent actives.' })) return;
    await store.update('data', (s) => { s.regles = s.regles.filter((r) => r.id !== id); });
    await store.flush();
    notify('Règle supprimée', { icon: 'check' });
  } catch (error) { notify((error as Error).message, { tone: 'danger' }); }
}

function Rules({ query }: { query: string }) {
  const e = currentEcole();
  const matches = matcher(query);
  const scopeLabel = (r: Regle) => (r.portee === 'global' ? 'Toutes les écoles' : r.portee === 'ecole' ? index().ecole.get(r.ecoleId!)?.nom : r.portee === 'batiment' ? batimentLabel(r.batiment!) : index().salle.get(r.salleId!)?.nom);
  const rules = (store.state.regles || []).filter((r) => (r.portee === 'global' || e === 'all' || r.ecoleId === e)
    && matches(processText(r.nom), CLASSEMENTS[r.classement]?.label, scopeLabel(r)));
  // Règle globale : réservée au super administrateur ; sans règle modifiable, pas de colonne Actions
  const editable = (r: Regle) => r.portee !== 'global' || me().role === 'superadmin';
  const actions = rules.some(editable);
  return <>
    <p className="ops-muted" style={{ marginBottom: 20 }}>Les règles se cumulent. Une interdiction reste prioritaire sur une autorisation.</p>
    <OpsTable head={['Processus', 'Classement', 'Portée', ...(actions ? ['Actions'] : [])]}>
      {!rules.length && <tr><td colSpan={actions ? 4 : 3}><div className="w-empty w-empty--l">Aucune règle ne correspond à cette recherche.</div></td></tr>}
      {rules.map((r) => <tr key={r.id}>
        <td><span className="app-cell"><AppIcon name={r.nom} /><strong>{r.nom}</strong></span></td>
        <td><Status c={r.classement} /></td>
        <td>{scopeLabel(r)}</td>
        {actions && <td>{editable(r) && <>
          <button className="icon-btn" onClick={() => openRuleForm(store.state.regles.find((x) => x.id === r.id))} aria-label={`Modifier ${r.nom}`}><Icon name="pencil" size={17} /></button>
          <button className="icon-btn" onClick={() => deleteRule(r.id)} aria-label={`Supprimer ${r.nom}`}><Icon name="trash" size={17} /></button>
        </>}</td>}
      </tr>)}
    </OpsTable>
  </>;
}

function Stats({ relevant, query }: { relevant: Processus[]; query: string }) {
  const postes = scope().postes;
  const allumes = postes.filter((p) => p.allume).length;
  const ds = detections();
  const counts = new Map<string, number>();
  ds.forEach((d) => counts.set(d.processus, (counts.get(d.processus) || 0) + 1));
  const max = Math.max(1, ...counts.values());
  const matches = matcher(query);
  const shown = [...counts].filter(([nom]) => matches(processText(nom))).sort((x, y) => y[1] - x[1]);
  const metrics: [string, number, string][] = [
    ['Postes allumés', allumes, `${num(postes.length)} postes au total`],
    ['Processus utilisateur actifs', relevant.filter((p) => !p.stoppedAt).length, 'Dernier état disponible'],
    ['Détections conservées', ds.length, `${num(ds.filter((d) => d.classement === 'blacklist').length)} processus interdits`],
  ];
  return <>
    <div className="ops-metrics">{metrics.map(([label, n, sub]) => <article key={label} className="ops-metric glass"><span>{label}</span><strong>{num(n)}</strong><span>{sub}</span></article>)}</div>
    <h2 className="ops-section-title">Processus détectés</h2>
    {shown.length
      ? <div className="ops-grid">{shown.map(([nom, n]) => <article key={nom} className="ops-card glass">
        <div className="ops-card-top"><AppIcon name={nom} size={36} /><h3>{nom}</h3></div><span className="ops-muted">{plural(n, 'détection')}</span><div className="ops-bar"><i style={{ width: `${n / max * 100}%` }}></i></div>
      </article>)}</div>
      : <p className="ops-muted">{counts.size ? 'Aucun processus détecté ne correspond à cette recherche.' : 'Aucun processus détecté.'}</p>}
  </>;
}

const PORTEES: Record<Portee, string> = { global: 'Globale', ecole: 'École', batiment: 'Bâtiment', salle: 'Salle' };
/** Champs saisis d'une règle ; école absente si la salle choisie est introuvable */
type RegleSaisie = Omit<Regle, 'id' | 'ecoleId'> & { ecoleId?: Id | null };

function openRuleForm(rule: Regle | null = null) {
  openSheet(<Sheet title={rule ? 'Modifier la règle' : 'Ajouter une règle'} lead={<Tile name="shield" color="var(--accent)" size="m" />}
    footer={<SheetFormActions form="rule-form" />}>
    <RuleForm rule={rule} />
  </Sheet>);
}

function RuleForm({ rule }: { rule: Regle | null }) {
  const state = useStore();
  const ecole = currentEcole() === 'all' ? state.ecoles[0]?.id : currentEcole();

  async function save(form: FormData) {
    const values = Object.fromEntries(form) as RegleSaisie;
    values.nom = values.nom.trim();
    const room = scope().salles.find((s) => s.id === values.salleId);
    if (values.portee === 'salle') values.ecoleId = room?.ecoleId;
    if (values.portee === 'global') values.ecoleId = null;
    await store.update('data', (s) => {
      const item = { id: rule?.id || uid('rule'), ...values } as Regle;
      if (rule) s.regles.splice(s.regles.findIndex((r) => r.id === rule.id), 1, item); else s.regles.push(item);
    });
    await store.flush();
    notify('Règle enregistrée', { icon: 'shield', tone: 'info' });
  }

  return <SheetForm id="rule-form" onSave={save}>
    <label className="field"><span className="field-label">Nom du processus *</span><input name="nom" defaultValue={rule?.nom || ''} required maxLength={100} placeholder="application.exe" /></label>
    <div className="form-2">
      <div className="field"><span className="field-label">Classement</span>
        <FilterSelect aria-label="Classement" name="classement" defaultValue={rule?.classement} options={[{ value: 'whitelist', label: 'Autorisé (liste blanche)' }, { value: 'blacklist', label: 'Interdit (liste noire)' }]} />
      </div>
      <div className="field"><span className="field-label">Portée</span>
        <FilterSelect aria-label="Portée" name="portee" defaultValue={rule?.portee}
          options={((me().role === 'superadmin' ? ['global', 'ecole', 'batiment', 'salle'] : ['ecole', 'batiment', 'salle']) as Portee[]).map((p) => ({ value: p, label: PORTEES[p] }))} />
      </div>
      <div className="field"><span className="field-label">École</span>
        <FilterSelect aria-label="École" name="ecoleId" defaultValue={(rule?.ecoleId || ecole) ?? undefined} options={state.ecoles.map((e) => ({ value: e.id, label: e.nom }))} />
      </div>
      <div className="field"><span className="field-label">Bâtiment</span>
        <FilterSelect aria-label="Bâtiment" name="batiment" defaultValue={rule?.batiment} options={batiments().map((b) => ({ value: b, label: b }))} />
      </div>
      <div className="field"><span className="field-label">Salle</span>
        <FilterSelect aria-label="Salle" name="salleId" defaultValue={rule?.salleId} options={optionsSalles()} />
      </div>
    </div>
  </SheetForm>;
}
