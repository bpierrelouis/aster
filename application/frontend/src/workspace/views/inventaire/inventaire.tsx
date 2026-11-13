import { FilterSelect } from '../../ui/filter-select.tsx';
import { useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router';
import { Icon, Tile } from '../../ui/icons.tsx';
import { outsideControls } from '../../core/dom.ts';
import { store } from '../../core/store.ts';
import { useStore } from '../../hooks/use-store.ts';
import { can } from '../../core/permissions.ts';
import { scope, index, optionsSalles, affectationOptions, batimentLabel, garantie, GARANTIES } from '../../core/selectors.ts';
import { DEVICE_TYPES, deviceType, logistique } from '#shared/catalog.ts';
import { openMaterielForm, suppressionRefusee } from './inventaire-materiel.tsx';
import { affecter } from '../salles/salles-affectation.tsx';
import { Sheet, openSheet, confirmSheet, notify } from '../../ui/overlays.tsx';
import { SheetForm, SheetFormActions } from '../../ui/forms.tsx';
import { accord, dateNum, num, plural } from '#shared/format.ts';
import { useTitle } from '../../hooks/use-title.ts';
import { PageHead, DataPanel, LieuChip, Pagination, etatMateriel, paginate } from '../../widgets/parts.tsx';
import { ImportPanel } from './inventaire-import.tsx';
import type { ChangeEvent } from 'react';
import type { SheetClose } from '../../ui/overlays.tsx';
import type { Garantie } from '../../core/selectors.ts';
import type { Id, Materiel, Timestamp } from '#shared/types.ts';

type Tab = 'inventaire' | 'import';
/** Colonnes triables */
type SortKey = 'idOrion' | 'modele' | 'dateReception';

const date = (n: Timestamp | null) => (n ? dateNum(n) : '—');
const TABS: Tab[] = ['inventaire', 'import'];
const TITLES: Record<Tab, string> = { inventaire: 'Inventaire', import: 'Import JSON' };
const PAGE_SIZE = 25;

export function Inventaire() {
  useTitle('Matériels');
  useStore();
  const params = useParams();
  const [query] = useSearchParams();
  const tab = TABS.includes(params.tab as Tab) ? params.tab as Tab : 'inventaire';
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState(() => (query.get('hs') ? 'hs' : ''));
  const [location, setLocation] = useState(() => (query.get('stock') ? 'stock' : ''));
  const [guarantee, setGuarantee] = useState(() => (GARANTIES.includes(query.get('garantie') as Garantie) ? query.get('garantie')! : '')); // lien d'une notification
  const [sort, setSort] = useState<SortKey>('idOrion');
  const [direction, setDirection] = useState(1);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(() => new Set<Id>());

  // Changement d'onglet : retour à la première page
  useEffect(() => { setPage(1); }, [tab]);

  // Sélection : purgée des matériels supprimés, vidée au changement d'école ou de profil
  useEffect(() => store.subscribe((topic) => {
    if (topic === 'data' || topic === 'remote') setSelected((prev) => [...prev].every((id) => index().materiel.has(id)) ? prev : new Set([...prev].filter((id) => index().materiel.has(id))));
    else if (['all', 'ecole'].includes(topic)) setSelected(new Set());
  }), []);

  const list = scope().materiels.filter((m) => {
    const room = index().salle.get(m.salleId!);
    return (!q || `${m.idOrion} ${m.modele} ${m.marque || ''} ${m.serie || ''} ${room?.nom || 'stock'}`.toLocaleLowerCase('fr').includes(q.toLocaleLowerCase('fr')))
      && (!type || m.type === type) && (!status || m.hs === (status === 'hs'))
      && (!location || (location === 'stock' ? !m.salleId : m.salleId === location))
      && (!guarantee || garantie(m) === guarantee);
  }).sort((a, b) => direction * (sort === 'dateReception' ? a[sort] - b[sort] : String(a[sort] || '').localeCompare(String(b[sort] || ''), 'fr', { numeric: true })));
  const { pages, current, rows } = paginate(list, page, PAGE_SIZE);
  const chosen = () => scope().materiels.filter((m) => selected.has(m.id));

  const filter = (setter: (value: string) => void) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { setter(e.target.value); setPage(1); };
  const toggle = (ids: Id[], on: boolean) => setSelected((prev) => {
    const next = new Set(prev);
    for (const id of ids) if (on) next.add(id); else next.delete(id);
    return next;
  });

  async function remove(items: Materiel[]) {
    if (!can('materiel.delete') || !items.length) return;
    if (suppressionRefusee(items)) return;
    if (!await confirmSheet({ title: 'Supprimer les matériels', message: `Supprimer définitivement ${plural(items.length, 'matériel')} de l’inventaire ?` })) return;
    try {
      const ids = new Set(items.map((m) => m.id));
      store.update('data', (s) => { s.materiels = s.materiels.filter((m) => !ids.has(m.id)); });
      await store.flush(); setSelected(new Set()); notify('Matériels supprimés');
    } catch (error) { notify((error as Error).message, { tone: 'danger' }); }
  }

  function move(items: Materiel[]) {
    if (!can('materiel.move') || !items.length) return;
    if (new Set(items.map((m) => m.ecoleId)).size !== 1) { notify('Sélectionnez des matériels de la même école.', { tone: 'info' }); return; }
    openSheet(<MoveSheet items={items} onDone={() => setSelected(new Set())} />);
  }

  function detail(m: Materiel) {
    openSheet(<DetailSheet m={m} onDelete={() => remove([m])} />);
  }

  const header = (key: SortKey, label: string) => <button className="inv-sort" onClick={() => { setDirection(sort === key ? -direction : 1); setSort(key); }}>
    {label}{sort === key ? direction === 1 ? ' ↑' : ' ↓' : ''}
  </button>;

  return <div className="inv-view">
    <PageHead title={TITLES[tab]}>
      {can('materiel.create') && <button className="btn btn--primary" onClick={() => openMaterielForm()}><Icon name="plus" size={18} /><span>Ajouter un matériel</span></button>}
    </PageHead>
    {tab === 'import' ? <ImportPanel /> : <DataPanel
      filters={<>
        <label className="field field--search"><Icon name="recherche" size={18} /><input type="search" value={q} onChange={filter(setQ)} placeholder="Modèle, identifiant, série…" aria-label="Rechercher un matériel" /></label>
        <FilterSelect aria-label="Type" value={type} onChange={filter(setType)} options={[{ value: '', label: 'Tous les types' }, ...DEVICE_TYPES.map((t) => ({ value: t.id, label: t.plural }))]} />
        <FilterSelect aria-label="État" value={status} onChange={filter(setStatus)} options={[{ value: '', label: 'Tous les états' }, { value: 'ok', label: 'En service' }, { value: 'hs', label: 'Hors service' }]} />
        <FilterSelect aria-label="Localisation" value={location} onChange={filter(setLocation)} options={[{ value: '', label: 'Toutes les salles' }, { value: 'stock', label: 'Stock' }, ...optionsSalles()]} />
        <FilterSelect aria-label="Garantie" value={guarantee} onChange={filter(setGuarantee)} options={[{ value: '', label: 'Toutes les garanties' }, ...GARANTIES.map((v) => ({ value: v, label: v }))]} />
      </>}
      selection={<>
        <span><strong>{num(selected.size)}</strong> {accord(selected.size, 'sélectionné')}</span>
        <button className="btn btn--ghost" disabled={!selected.size || !can('materiel.move')} onClick={() => move(chosen())}><Icon name="deplacement" size={17} />Affecter</button>
        {can('materiel.delete') && <button className="btn btn--ghost" disabled={!selected.size} onClick={() => remove(chosen())}><Icon name="trash" size={17} />Supprimer</button>}
        {selected.size > 0 && <button className="btn btn--ghost" onClick={() => setSelected(new Set())}>Effacer la sélection</button>}
        <span className="inv-count">{plural(list.length, 'matériel')}</span>
      </>}
      head={<>
        <th><input type="checkbox" aria-label="Sélectionner la page" checked={rows.length > 0 && rows.every((m) => selected.has(m.id))} onChange={(e) => toggle(rows.map((m) => m.id), e.target.checked)} /></th>
        <th>{header('idOrion', 'Identifiant')}</th><th>{header('modele', 'Matériel')}</th><th>Localisation</th><th>État</th><th>{header('dateReception', 'Réception')}</th><th>Garantie</th>
      </>}
      footer={<Pagination current={current} pages={pages} onPage={setPage} />}>
      {rows.length ? rows.map((m) => {
        const t = deviceType(m.type), room = index().salle.get(m.salleId!), on = selected.has(m.id);
        return <tr key={m.id} className={on ? 'is-selected' : ''} onClick={(e) => { if (outsideControls(e)) toggle([m.id], !on); }}>
          <td><input type="checkbox" aria-label={`Sélectionner ${m.idOrion}`} checked={on} onChange={(e) => toggle([m.id], e.target.checked)} /></td>
          <td className="inv-id">{m.idOrion}</td>
          <td><button className="inv-device" onClick={() => detail(m)}><Tile name={t.icon} color={t.color} size="s" className="tile--tint" /><span><strong>{m.modele}</strong><small>{m.marque || t.label}{m.serie ? ` · ${m.serie}` : ''}</small></span></button></td>
          <td><LieuChip m={m} link />{room && <small className="inv-sub">{batimentLabel(room.batiment)}</small>}{m.deplacement && <span className="chip chip--move" data-tip="Affecté dans Orion, pas encore à sa place"><span className="inst-dot inst-dot--wait inst-dot--s" />{logistique(m).label}</span>}</td>
          <td><span className="inv-state"><i className={`led led--${m.hs ? 'hs' : 'ok'}`} />{m.hs ? 'Hors service' : 'En service'}</span></td>
          <td>{date(m.dateReception)}</td>
          <td><span className={`inv-warranty${garantie(m) === 'Échue' ? ' is-expired' : ''}`}>{garantie(m)}</span><small className="inv-sub">{date(m.garantieFin)}</small></td>
        </tr>;
      }) : <tr><td colSpan={7}><div className="w-empty w-empty--l">Aucun matériel ne correspond aux filtres.</div></td></tr>}
    </DataPanel>}
  </div>;
}

/** Affectation groupée : nouvelle salle ou retour en stock */
function MoveSheet({ items, onDone }: { items: Materiel[]; onDone: () => void }) {
  useStore();
  async function save(form: FormData) {
    if (await affecter(items, (form.get('destination') as string) || null)) onDone(); // même écriture que dans les salles
  }

  return <Sheet title={`Affecter ${plural(items.length, 'matériel')}`} size="s" lead={<Tile name="deplacement" color="var(--accent)" size="m" />}
    footer={<SheetFormActions form="move-form" label="Enregistrer l’affectation" />}>
    <p className="sheet-text">Choisissez leur nouvelle salle ou replacez-les en stock.</p>
    <SheetForm id="move-form" onSave={save}>
      <div className="field"><span className="field-label">Destination</span><FilterSelect aria-label="Destination" name="destination" defaultValue="" options={affectationOptions(items[0].ecoleId)} /></div>
    </SheetForm>
  </Sheet>;
}

/** Fiche d'un matériel, avec modification et suppression selon les droits */
function DetailSheet({ m, onDelete }: { m: Materiel; onDelete: () => void }) {
  const t = deviceType(m.type), room = index().salle.get(m.salleId!);
  const rows = [['Identifiant Orion', m.idOrion], ['Type', t.label], ['Marque', m.marque || '—'], ['Numéro de série', m.serie || '—'], ['Réception', date(m.dateReception)], ['Localisation', room ? `${room.nom} · ${batimentLabel(room.batiment)}` : 'Stock'], ['État', etatMateriel(m)], ['Garantie', `${garantie(m)} · ${date(m.garantieFin)}`]];
  const ensuite = useRef<(() => void) | null>(null); // action ouverte une fois la fiche fermée
  const puis = (close: SheetClose, action: () => void) => { ensuite.current = action; close(); };
  return <Sheet title={m.modele} lead={<Tile name={t.icon} color={t.color} size="m" />} onClose={() => ensuite.current?.()}
    footer={(close) => <>
      {can('materiel.edit') && <button className="btn btn--primary" onClick={() => puis(close, () => openMaterielForm(m))}>Modifier</button>}
      {can('materiel.delete') && <button className="btn btn--ghost" onClick={() => puis(close, onDelete)}>Supprimer</button>}
    </>}>
    <dl className="inv-details">{rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
  </Sheet>;
}
