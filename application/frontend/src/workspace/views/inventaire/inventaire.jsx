import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router';
import { Icon, Tile } from '../../ui/icons.jsx';
import { outsideControls } from '../../core/dom.js';
import { store } from '../../core/store.js';
import { useStore } from '../../hooks/use-store.js';
import { can } from '../../core/permissions.js';
import { scope, index } from '../../core/selectors.js';
import { DEVICE_TYPES, deviceType, logistique } from '#shared/catalog.js';
import { openMaterielForm, AffectationOptions } from './materiel.jsx';
import { affecter } from '../salles/salles-affectation.jsx';
import { Sheet, openSheet, confirmSheet, notify } from '../../ui/overlays.jsx';
import { SheetForm, SheetFormActions } from '../../ui/forms.jsx';
import { dateNum, DAY, num, plural } from '#shared/format.js';
import { useTitle } from '../../hooks/use-title.js';
import { PageHead, DataPanel, Pagination, paginate } from '../../widgets/parts.jsx';
import { ImportPanel } from './inventaire-import.jsx';

const date = (n) => (n ? dateNum(n) : '—');
const warranty = (m) => !m.garantieFin ? 'Non renseignée' : m.garantieFin < Date.now() ? 'Échue' : m.garantieFin < Date.now() + 182 * DAY ?'À échéance' : 'En cours';
const WARRANTIES = ['Échue', 'À échéance', 'En cours', 'Non renseignée'];
const TABS = ['inventaire', 'import'];
const TITLES = { inventaire: 'Inventaire', import: 'Import JSON' };
const PAGE_SIZE = 25;

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
  const [guarantee, setGuarantee] = useState(() => (WARRANTIES.includes(query.get('garantie')) ? query.get('garantie') : '')); // lien d'une notification
  const [sort, setSort] = useState('idAster');
  const [direction, setDirection] = useState(1);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(() => new Set());

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
  const { pages, current, rows } = paginate(list, page, PAGE_SIZE);
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
    if (!await confirmSheet({ title: 'Supprimer les matériels', message: `Supprimer définitivement ${plural(items.length, 'matériel')} de l’inventaire ?` })) return;
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
    {tab === 'import' ? <ImportPanel /> : <DataPanel
      filters={<>
        <label className="field field--search"><Icon name="recherche" size={18} /><input type="search" value={q} onChange={filter(setQ)} placeholder="Modèle, identifiant, série…" aria-label="Rechercher un matériel" /></label>
        <select aria-label="Type" value={type} onChange={filter(setType)}><option value="">Tous les types</option>{DEVICE_TYPES.map((t) => <option key={t.id} value={t.id}>{t.plural}</option>)}</select>
        <select aria-label="État" value={status} onChange={filter(setStatus)}><option value="">Tous les états</option><option value="ok">En service</option><option value="hs">Hors service</option></select>
        <select aria-label="Localisation" value={location} onChange={filter(setLocation)}><option value="">Toutes les salles</option><option value="stock">Stock</option>{scope().salles.map((s) => <option key={s.id} value={s.id}>{s.nom}</option>)}</select>
        <select aria-label="Garantie" value={guarantee} onChange={filter(setGuarantee)}><option value="">Toutes les garanties</option>{WARRANTIES.map((v) => <option key={v}>{v}</option>)}</select>
      </>}
      selection={<>
        <span><strong>{num(selected.size)}</strong> sélectionné{selected.size > 1 ? 's' : ''}</span>
        <button className="btn btn--ghost" disabled={!selected.size || !can('materiel.move')} onClick={() => move(chosen())}><Icon name="deplacement" size={17} />Affecter</button>
        {can('materiel.delete') && <button className="btn btn--ghost" disabled={!selected.size} onClick={() => remove(chosen())}><Icon name="trash" size={17} />Supprimer</button>}
        {selected.size > 0 && <button className="btn btn--ghost" onClick={() => setSelected(new Set())}>Effacer la sélection</button>}
        <span className="inv-count">{plural(list.length, 'matériel')}</span>
      </>}
      head={<>
        <th><input type="checkbox" aria-label="Sélectionner la page" checked={rows.length > 0 && rows.every((m) => selected.has(m.id))} onChange={(e) => toggle(rows.map((m) => m.id), e.target.checked)} /></th>
        <th>{header('idAster', 'Identifiant')}</th><th>{header('modele', 'Matériel')}</th><th>Localisation</th><th>État</th><th>{header('dateReception', 'Réception')}</th><th>Garantie</th>
      </>}
      footer={<Pagination current={current} pages={pages} onPage={setPage} />}>
      {rows.length ? rows.map((m) => {
        const t = deviceType(m.type), room = index().salle.get(m.salleId), on = selected.has(m.id);
        return <tr key={m.id} className={on ? 'is-selected' : ''} onClick={(e) => { if (outsideControls(e)) toggle([m.id], !on); }}>
          <td><input type="checkbox" aria-label={`Sélectionner ${m.idAster}`} checked={on} onChange={(e) => toggle([m.id], e.target.checked)} /></td>
          <td className="inv-id">{m.idAster}</td>
          <td><button className="inv-device" onClick={() => detail(m)}><Tile name={t.icon} color={t.color} size="s" className="tile--tint" /><span><strong>{m.modele}</strong><small>{m.marque || t.label}{m.serie ? ` · ${m.serie}` : ''}</small></span></button></td>
          <td>{room ? <><Link className="chip" to={`/salles/salle/${room.id}`}>{room.nom}</Link><small className="inv-sub">Bâtiment {room.batiment}</small></> : <span className="chip chip--stock">Stock</span>}{m.deplacement && <span className="chip chip--move" data-tip="Affecté dans ASTER, pas encore à sa place"><span className="inst-dot inst-dot--wait inst-dot--s" />{logistique(m).label}</span>}</td>
          <td><span className="inv-state"><i className={`led led--${m.hs ? 'hs' : 'ok'}`} />{m.hs ? 'Hors service' : 'En service'}</span></td>
          <td>{date(m.dateReception)}</td>
          <td><span className={`inv-warranty${warranty(m) === 'Échue' ? ' is-expired' : ''}`}>{warranty(m)}</span><small className="inv-sub">{date(m.garantieFin)}</small></td>
        </tr>;
      }) : <tr><td colSpan={7}><div className="w-empty w-empty--l">Aucun matériel ne correspond aux filtres.</div></td></tr>}
    </DataPanel>}
  </div>;
}

/** Affectation groupée : nouvelle salle ou retour en stock */
function MoveSheet({ items, onDone }) {
  useStore();
  async function save(form) {
    if (await affecter(items, form.get('destination') || null)) onDone(); // même écriture que dans les salles
  }

  return <Sheet title={`Affecter ${plural(items.length, 'matériel')}`} size="s" lead={<Tile name="deplacement" color="var(--accent)" size="m" />}
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
