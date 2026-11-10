import { Fragment, useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router';
import { Icon, Tile } from '../ui/icons.jsx';
import { uid, outsideControls } from '../core/dom.js';
import { store, currentEcole } from '../core/store.js';
import { useStore } from '../core/useStore.js';
import { can } from '../core/permissions.js';
import { scope, index } from '../core/selectors.js';
import { DEVICE_TYPES, deviceType } from '../core/catalog.js';
import { openMaterielForm, AffectationOptions } from './materiel.jsx';
import { Sheet, openSheet, confirmSheet, notify } from '../ui/overlays.jsx';
import { SheetForm, SheetFormActions } from '../ui/forms.jsx';
import { dateNum } from '../core/format.js';
import { useTitle } from '../ui/useTitle.js';
import { usePeek } from '../ui/peek.js';
import { PageHead } from '../widgets/parts.jsx';

const date = (n) => (n ? dateNum(n) : '—');
const warranty = (m) => !m.garantieFin ? 'Non renseignée' : m.garantieFin < Date.now() ? 'Échue' : m.garantieFin < Date.now() + 182 * 86400000 ? 'À échéance' : 'En cours';
const TABS = ['inventaire', 'import'];
const TITLES = { inventaire: 'Inventaire', import: 'Import JSON' };
const PAGE_SIZE = 25;

export function validateImport(text, ecoleId, salles) {
  let rows;
  try { rows = JSON.parse(text); } catch { throw new Error('JSON invalide : vérifiez les virgules, guillemets et crochets.'); }
  if (!Array.isArray(rows) || !rows.length) throw new Error('Le fichier doit contenir un tableau non vide de matériels.');
  if (rows.length > 2000) throw new Error('Limitez chaque import à 2 000 matériels.');
  return rows.map((row, i) => {
    const fail = (message) => { throw new Error(`Matériel ${i + 1} : ${message}`); };
    if (!row || typeof row !== 'object' || Array.isArray(row)) fail('objet attendu.');
    if (typeof row.modele !== 'string' || !row.modele.trim() || row.modele.length > 60) fail('modèle obligatoire (60 caractères maximum).');
    const received = typeof row.dateReception === 'number' ? row.dateReception : Date.parse(row.dateReception);
    if (!Number.isFinite(received)) fail('dateReception obligatoire, au format AAAA-MM-JJ.');
    if (row.hs !== undefined && typeof row.hs !== 'boolean') fail('hs doit être true ou false.');
    if (row.type && !DEVICE_TYPES.some((t) => t.id === row.type)) fail('type inconnu.');
    if (row.salleId && !salles.some((s) => s.id === row.salleId && s.ecoleId === ecoleId)) fail('salle absente de l’école sélectionnée.');
    for (const key of ['marque', 'serie']) if (row[key] != null && (typeof row[key] !== 'string' || row[key].length > 40)) fail(`${key} : texte de 40 caractères maximum.`);
    const garantieFin = row.garantieFin ? typeof row.garantieFin === 'number' ? row.garantieFin : Date.parse(row.garantieFin) : null;
    if (garantieFin !== null && !Number.isFinite(garantieFin)) fail('date de garantie invalide.');
    return { id: uid('m'), ecoleId, type: row.type || 'autre', modele: row.modele.trim(), marque: row.marque?.trim() || null, serie: row.serie?.trim() || null, dateReception: received, garantieFin, hs: row.hs ?? false, salleId: row.salleId || null };
  });
}

export function Inventaire() {
  useTitle('Matériels');
  useStore();
  const params = useParams();
  const [query] = useSearchParams();
  const tab = TABS.includes(params.tab) ? params.tab : 'inventaire';
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState(() => (query.get('hs') ? 'hs' : ''));
  const [location, setLocation] = useState(() => (query.get('stock') ? 'stock' : ''));
  const [guarantee, setGuarantee] = useState('');
  const [sort, setSort] = useState('idAster');
  const [direction, setDirection] = useState(1);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(() => new Set());
  const tableScroll = usePeek('tbody tr', '.inv-panel');

  // Changement d'onglet : retour à la première page
  useEffect(() => { setPage(1); }, [tab]);

  // Sélection : purgée des matériels supprimés, vidée au changement d'école ou de profil
  useEffect(() => store.subscribe((topic) => {
    if (topic === 'data' || topic === 'remote') setSelected((prev) => [...prev].every((id) => index().materiel.has(id)) ? prev : new Set([...prev].filter((id) => index().materiel.has(id))));
    else if (['all', 'ecole', 'role'].includes(topic)) setSelected(new Set());
  }), []);

  const list = scope().materiels.filter((m) => {
    const room = index().salle.get(m.salleId);
    return (!q || `${m.idAster} ${m.modele} ${m.marque || ''} ${m.serie || ''} ${room?.nom || 'stock'}`.toLocaleLowerCase('fr').includes(q.toLocaleLowerCase('fr')))
      && (!type || m.type === type) && (!status || m.hs === (status === 'hs'))
      && (!location || (location === 'stock' ? !m.salleId : m.salleId === location))
      && (!guarantee || warranty(m) === guarantee);
  }).sort((a, b) => direction * (sort === 'dateReception' ? a[sort] - b[sort] : String(a[sort] || '').localeCompare(String(b[sort] || ''), 'fr', { numeric: true })));
  const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const rows = list.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const chosen = () => scope().materiels.filter((m) => selected.has(m.id));

  const filter = (setter) => (e) => { setter(e.target.value); setPage(1); };
  const toggle = (ids, on) => setSelected((prev) => {
    const next = new Set(prev);
    for (const id of ids) if (on) next.add(id); else next.delete(id);
    return next;
  });

  async function remove(items) {
    if (!can('materiel.delete') || !items.length) return;
    if (store.state.remontees.some((r) => r.materielIds.some((id) => items.some((m) => m.id === id)))) {
      notify('Un matériel est lié à une remontée : sa fiche doit être conservée.', { tone: 'info', icon: 'ticket' }); return;
    }
    if (!await confirmSheet({ title: 'Supprimer les matériels', message: `Supprimer définitivement ${items.length} matériel(s) de l’inventaire ?` })) return;
    try {
      const ids = new Set(items.map((m) => m.id));
      store.update('data', (s) => { s.materiels = s.materiels.filter((m) => !ids.has(m.id)); });
      await store.flush(); setSelected(new Set()); notify('Matériels supprimés');
    } catch (error) { notify(error.message, { tone: 'danger' }); }
  }

  function move(items) {
    if (!can('materiel.move') || !items.length) return;
    if (new Set(items.map((m) => m.ecoleId)).size !== 1) { notify('Sélectionnez des matériels de la même école.', { tone: 'info' }); return; }
    openSheet(<MoveSheet items={items} onDone={() => setSelected(new Set())} />);
  }

  function detail(m) {
    openSheet(<DetailSheet m={m} onDelete={() => remove([m])} />);
  }

  const header = (key, label) => <button className="inv-sort" onClick={() => { setDirection(sort === key ? -direction : 1); setSort(key); }}>
    {label}{sort === key ? direction === 1 ? ' ↑' : ' ↓' : ''}
  </button>;

  return <div className="inv-view">
    <PageHead title={TITLES[tab]}>
      {can('materiel.create') && <button className="btn btn--primary" onClick={() => openMaterielForm()}><Icon name="plus" size={18} /><span>Ajouter un matériel</span></button>}
    </PageHead>
    {tab === 'import' ? <ImportPanel /> : <section className="inv-panel glass">
      <div className="inv-filters">
        <label className="field field--search"><Icon name="recherche" size={18} /><input type="search" value={q} onChange={filter(setQ)} placeholder="Modèle, identifiant, série…" aria-label="Rechercher un matériel" /></label>
        <select aria-label="Type" value={type} onChange={filter(setType)}><option value="">Tous les types</option>{DEVICE_TYPES.map((t) => <option key={t.id} value={t.id}>{t.plural}</option>)}</select>
        <select aria-label="État" value={status} onChange={filter(setStatus)}><option value="">Tous les états</option><option value="ok">En service</option><option value="hs">Hors service</option></select>
        <select aria-label="Localisation" value={location} onChange={filter(setLocation)}><option value="">Toutes les salles</option><option value="stock">Stock</option>{scope().salles.map((s) => <option key={s.id} value={s.id}>{s.nom}</option>)}</select>
        <select aria-label="Garantie" value={guarantee} onChange={filter(setGuarantee)}><option value="">Toutes les garanties</option>{['Échue', 'À échéance', 'En cours', 'Non renseignée'].map((v) => <option key={v}>{v}</option>)}</select>
      </div>
      <div>
        <div className="inv-selection">
          <span><strong>{selected.size}</strong> sélectionné(s)</span>
          <button className="btn btn--ghost" disabled={!selected.size || !can('materiel.move')} onClick={() => move(chosen())}><Icon name="deplacement" size={17} />Affecter</button>
          {can('materiel.delete') && <button className="btn btn--ghost" disabled={!selected.size} onClick={() => remove(chosen())}><Icon name="trash" size={17} />Supprimer</button>}
          {selected.size > 0 && <button className="btn btn--ghost" onClick={() => setSelected(new Set())}>Effacer la sélection</button>}
          <span className="inv-count">{list.length} matériel(s)</span>
        </div>
        <div ref={tableScroll} className="inv-table-scroll"><table className="inv-table">
          <thead><tr>
            <th><input type="checkbox" aria-label="Sélectionner la page" checked={rows.length > 0 && rows.every((m) => selected.has(m.id))} onChange={(e) => toggle(rows.map((m) => m.id), e.target.checked)} /></th>
            <th>{header('idAster', 'Identifiant')}</th><th>{header('modele', 'Matériel')}</th><th>Localisation</th><th>État</th><th>{header('dateReception', 'Réception')}</th><th>Garantie</th>
          </tr></thead>
          <tbody>{rows.length ? rows.map((m) => {
            const t = deviceType(m.type), room = index().salle.get(m.salleId), on = selected.has(m.id);
            return <tr key={m.id} className={on ? 'is-selected' : ''} onClick={(e) => { if (outsideControls(e)) toggle([m.id], !on); }}>
              <td><input type="checkbox" aria-label={`Sélectionner ${m.idAster}`} checked={on} onChange={(e) => toggle([m.id], e.target.checked)} /></td>
              <td className="inv-id">{m.idAster}</td>
              <td><button className="inv-device" onClick={() => detail(m)}><Tile name={t.icon} color={t.color} size="s" className="tile--tint" /><span><strong>{m.modele}</strong><small>{m.marque || t.label}{m.serie ? ` · ${m.serie}` : ''}</small></span></button></td>
              <td>{room ? <><Link className="chip" to={`/salles/salle/${room.id}`}>{room.nom}</Link><small className="inv-sub">Bâtiment {room.batiment}</small></> : <span className="chip chip--stock">Stock</span>}</td>
              <td><span className="inv-state"><i className={`led led--${m.hs ? 'hs' : 'ok'}`} />{m.hs ? 'Hors service' : 'En service'}</span></td>
              <td>{date(m.dateReception)}</td>
              <td><span className={`inv-warranty${warranty(m) === 'Échue' ? ' is-expired' : ''}`}>{warranty(m)}</span><small className="inv-sub">{date(m.garantieFin)}</small></td>
            </tr>;
          }) : <tr><td colSpan={7}><div className="w-empty w-empty--l">Aucun matériel ne correspond aux filtres.</div></td></tr>}</tbody>
        </table></div>
        <footer className="inv-pagination">
          <button className="btn btn--ghost" disabled={current <= 1} onClick={() => setPage(current - 1)}>Précédent</button>
          <span>Page {current} sur {pages}</span>
          <button className="btn btn--ghost" disabled={current >= pages} onClick={() => setPage(current + 1)}>Suivant</button>
        </footer>
      </div>
    </section>}
  </div>;
}

/** Affectation groupée : nouvelle salle ou retour en stock */
function MoveSheet({ items, onDone }) {
  useStore();
  async function save(form) {
    const salleId = form.get('destination') || null;
    const ids = new Set(items.map((m) => m.id));
    store.update('data', (s) => { for (const m of s.materiels) if (ids.has(m.id)) m.salleId = salleId; });
    await store.flush();
    onDone();
    notify('Affectation enregistrée', { icon: 'deplacement' });
  }

  return <Sheet title={`Affecter ${items.length} matériel(s)`} size="s" lead={<Tile name="deplacement" color="var(--accent)" size="m" />}
    footer={<SheetFormActions form="move-form" label="Enregistrer l’affectation" />}>
    <p className="sheet-text">Choisissez leur nouvelle salle ou replacez-les en stock.</p>
    <SheetForm id="move-form" onSave={save}>
      <label className="field"><span className="field-label">Destination</span><select name="destination" defaultValue=""><AffectationOptions ecoleId={items[0].ecoleId} /></select></label>
    </SheetForm>
  </Sheet>;
}

/** Fiche d'un matériel, avec modification et suppression selon les droits */
function DetailSheet({ m, onDelete }) {
  const t = deviceType(m.type), room = index().salle.get(m.salleId);
  const rows = [['Identifiant ASTER', m.idAster], ['Type', t.label], ['Marque', m.marque || '—'], ['Numéro de série', m.serie || '—'], ['Réception', date(m.dateReception)], ['Localisation', room ? `${room.nom} · Bâtiment ${room.batiment}` : 'Stock'], ['État', m.hs ? 'Hors service' : 'En service'], ['Garantie', `${warranty(m)} · ${date(m.garantieFin)}`]];
  return <Sheet title={m.modele} lead={<Tile name={t.icon} color={t.color} size="m" />}
    footer={(close) => <>
      {can('materiel.edit') && <button className="btn btn--primary" onClick={() => { close(); setTimeout(() => openMaterielForm(m), 230); }}>Modifier</button>}
      {can('materiel.delete') && <button className="btn btn--ghost" onClick={() => { close(); setTimeout(onDelete, 230); }}>Supprimer</button>}
    </>}>
    <dl className="inv-details">{rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
  </Sheet>;
}

/** Import JSON : validation puis enregistrement ; le serveur attribue les identifiants */
function ImportPanel() {
  const ecole = currentEcole();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!can('materiel.import')) return;
    const form = e.currentTarget;
    setError(''); setSuccess(''); setBusy(true);
    try {
      const file = form.elements.file.files[0];
      if (file && file.size > 2 * 1024 * 1024) throw new Error('Le fichier dépasse 2 Mo.');
      const rows = validateImport(file ? await file.text() : form.elements.json.value, form.elements.ecole.value, store.state.salles);
      store.update('data', (s) => {
        s.materiels.push(...rows.map((m) => ({ ...m, idAster: 'MAT-0000' }))); // identifiants attribués par le serveur
      });
      await store.flush();
      form.reset(); setSuccess(`${rows.length} matériel(s) importé(s). Retrouvez-les dans l’inventaire.`);
      notify(`${rows.length} matériel(s) importé(s)`, { icon: 'importJson' });
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  return <section className="inv-import glass">
    <div><Tile name="importJson" color="var(--accent)" size="l" /><h2>Votre inventaire, en une fois.</h2><p>Importez un tableau JSON. Chaque ligne crée un matériel et reçoit un identifiant ASTER.</p></div>
    <form className="form" onSubmit={submit}>
      <label className="field"><span className="field-label">École</span><select name="ecole">{store.state.ecoles.filter((e) => ecole === 'all' || e.id === ecole).map((e) => <option key={e.id} value={e.id}>{e.nom}</option>)}</select></label>
      <label className="inv-drop field"><span className="field-label">Fichier JSON</span><input name="file" type="file" accept=".json,application/json" /><span className="field-hint">2 000 matériels maximum, 2 Mo maximum.</span></label>
      <label className="field"><span className="field-label">Ou coller le JSON</span><textarea name="json" rows={10} spellCheck={false} placeholder='[{"modele":"Écran 24 pouces","dateReception":"2026-11-08","type":"ecran","hs":false}]' /></label>
      <p className="form-error" role="alert" hidden={!error}>{error}</p>
      <p role="status" hidden={!success}>{success}</p>
      <button className="btn btn--primary" type="submit" disabled={busy}><Icon name="importJson" size={18} />Importer les matériels</button>
    </form>
    <details className="inv-help"><summary>Format attendu et exemple</summary>
      <p>Obligatoires : <code>modele</code> et <code>dateReception</code>. Facultatifs : <code>type</code>, <code>marque</code>, <code>serie</code>, <code>hs</code>, <code>salleId</code>, <code>garantieFin</code>. L’école est celle sélectionnée ci-dessus ; sans salle, le matériel entre en stock.</p>
      <pre>{`[{
  "modele": "Écran 24 pouces",
  "type": "ecran",
  "dateReception": "2026-11-08",
  "hs": false,
  "marque": "Dell",
  "serie": "SN-12345",
  "garantieFin": "2029-11-08"
}]`}</pre>
      <p>Types : {DEVICE_TYPES.map((t, i) => <Fragment key={t.id}>{i ? ', ' : ''}<code>{t.id}</code></Fragment>)}.</p>
    </details>
  </section>;
}
