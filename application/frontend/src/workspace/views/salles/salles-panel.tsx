/* ==========================================================================
   Salles · panneau latéral : vue d'ensemble, fiche de salle, stock (seul à
   l'écran Stock) et cartes de matériel (sélection, glisser-déposer, affectation).
   ========================================================================== */

import { FilterSelect } from '../../ui/filter-select.tsx';
import { Link, useNavigate } from 'react-router';
import { useEscape } from '../../hooks/use-escape.ts';
import { Icon, Tile } from '../../ui/icons.tsx';
import { currentEcole, store } from '../../core/store.ts';
import { recensementDe } from '#shared/rigel.ts';
import { can, why } from '../../core/permissions.ts';
import { num, dateMed } from '#shared/format.ts';
import { DEVICE_TYPES, deviceType, logistique } from '#shared/catalog.ts';
import { parc, affectationOptions, batiments, batimentLabel, sallesOf, materielsOf, index } from '../../core/selectors.ts';
import { installationOf, salleStatut, lieuNom, resteAFaire } from '../../core/installations.ts';
import { EtatBar, Progress, avancement, etatMateriel } from '../../widgets/parts.tsx';
import { InstallDot } from './salles-installation.tsx';
import { motifSuppression, openMaterielForm } from '../inventaire/inventaire-materiel.tsx';
import { openNewRemontee } from '../remontees/remontees-create.tsx';
import { floorLabel, floorLevel, roomOrder } from './salles-scene.tsx';
import { openSalleForm, openBuildingForm } from './salles-forms.tsx';
import { openEquipSheet } from './salles-affectation.tsx';
import type { CSSProperties, ComponentProps } from 'react';
import type { Capability } from '../../core/permissions.ts';
import type { SalleEnInstallation } from '../../core/installations.ts';
import type { Id, Materiel, Salle } from '#shared/types.ts';
import type { DevHandlers, Mode, SalleActions } from './salles.tsx';

/** Bouton désactivé, avec l'explication, si le droit manque ou si une règle l'interdit (motif). */
function GuardedBtn({ cap, motif = '', className, onClick, children, ...attrs }: ComponentProps<'button'> & { cap: Capability; motif?: string }) {
  const refus = why(cap) || motif;
  return <button className={className} {...attrs} {...(refus ? { 'aria-disabled': 'true', 'data-tip': refus } : { onClick })}>{children}</button>;
}

export function Overview({ mode, stageBat, stageFloor, hoverId }: { mode: Mode; stageBat: string | null; stageFloor: number | null; hoverId: Id | null }) {
  const navigate = useNavigate();
  const p = parc();
  const bats = mode === 'batiment' ? [stageBat] : batiments();
  const list = bats.flatMap((b) => [...sallesOf(b)].sort(roomOrder)).filter((x) => stageFloor === null || floorLevel(x) === stageFloor); // groupées par bâtiment
  const c = { total: 0, hs: 0, ok: 0 };
  for (const x of list) { const v = p.bySalle.get(x.id)!; c.total += v.total; c.hs += v.hs; c.ok += v.ok; }
  const e = currentEcole();
  const titleTxt = mode === 'batiment' ? batimentLabel(stageBat!) : e === 'all' ? 'Toutes les écoles' : index().ecole.get(e!)?.nom ?? '';
  return <>
    <div className="insp-head">
      <Tile name={mode === 'batiment' ? 'salles' : 'school'} color="var(--c3)" size="l" />
      <div className="insp-title"><h2>{titleTxt}</h2><span>{num(list.length)} salles{mode === 'all' ? `, ${num(bats.length)} bâtiments` : ''}</span></div>
      {mode === 'batiment' && <div className="insp-actions">
        <GuardedBtn cap="salle.manage" className="icon-btn" aria-label="Renommer le bâtiment" data-tip="Renommer le bâtiment"
          onClick={() => openBuildingForm({ ecoleId: sallesOf(stageBat)[0]?.ecoleId, batiment: stageBat! }, { onRenamed: (nom) => navigate(`/salles/batiment/${encodeURIComponent(nom)}`) })}><Icon name="pencil" size={18} /></GuardedBtn>
      </div>}
    </div>
    <ul className="stat-row">
      <li data-tip="Salles"><Icon name="salles" size={20} /><b>{num(list.length)}</b></li>
      <li data-tip="Matériels affectés"><Icon name="materiel" size={20} /><b>{num(c.total)}</b></li>
      <li data-tip="Hors service" className={c.hs ? 'is-alert' : ''}><Icon name="power" size={20} /><b>{num(c.hs)}</b></li>
    </ul>
    <EtatBar c={c} thin />
    <ul className="salle-list">
      {list.map((x) => {
        const v = p.bySalle.get(x.id)!;
        const inst = installationOf(x.id);
        return <li key={x.id}><Link className={`salle-row${x.id === hoverId ? ' is-hover' : ''}`} to={`/salles/salle/${x.id}`} data-salle-row={x.id}>
          <span className="code-badge">{x.batiment}</span><b>{x.nom}</b>
          <span className="salle-types">{Object.entries(v.types).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([t]) => <span key={t} data-tip={deviceType(t).plural}><Tile name={deviceType(t).icon} color={deviceType(t).color} size="s" className="tile--tint" /></span>)}</span>
          <span className="salle-meta">{inst ? <span className="salle-inst" data-tip="En cours d’installation"><span className="inst-dot inst-dot--wait inst-dot--s" />{avancement(inst.pct)}</span> : null}{v.hs ? <span className="led led--hs" /> : v.attente ? <span className="led led--wait" /> : null}<b>{num(v.total)}</b></span>
          <Icon name="chevR" size={18} />
        </Link></li>;
      })}
    </ul>
  </>;
}

function DevGroups({ list, draggable, mode, selected, onPick, onGrab }: DevHandlers & { list: Materiel[]; draggable: boolean; mode: 'salle' | 'stock'; selected: Set<Id> }) {
  const groups = DEVICE_TYPES.map((t) => ({ t, list: list.filter((m) => m.type === t.id) })).filter((g) => g.list.length);
  if (!groups.length) return <div className="w-empty"><Icon name="materiel" size={26} /><span>Aucun matériel {mode === 'stock' ? 'en stock' : 'dans cette salle'}.</span></div>;
  return <div className="dev-groups">{groups.map(({ t, list: l }) => (
    <section key={t.id} className="dev-group">
      <header><Tile name={t.icon} color={t.color} size="s" /><span>{t.plural}</span><b>{num(l.length)}</b></header>
      <div className="dev-grid">{l.map((m) => (
        <button key={m.id} className={`dev ${selected.has(m.id) ? 'is-on' : ''} ${draggable ? 'is-draggable' : ''} ${m.deplacement ? 'is-moving' : ''}`} style={{ '--c': t.color } as CSSProperties}
          aria-label={`${m.modele}, ${m.idOrion}, ${m.hs ? 'hors service' : 'en service'}`} aria-pressed={selected.has(m.id)} data-tip={`${m.modele}\n${m.idOrion}`}
          onClick={(e) => onPick(e, m.id)} onPointerDown={draggable ? (e) => onGrab(e, m.id) : undefined}>
          <Icon name={t.icon} size={20} /><span className={`led led--${m.hs ? 'hs' : 'ok'}`} />
        </button>))}</div>
    </section>))}</div>;
}

/** Aide à la sélection, sous la zone qui défile tant qu'aucun matériel n'est sélectionné */
function SelectionHint({ mode, salleId }: { mode: Mode; salleId: Id | null }) {
  if (!can('materiel.move') || !materielsOf(mode === 'stock' ? null : salleId).length) return null;
  return <p className="hint-s spanel-hint"><Icon name="deplacement" size={16} />{mode === 'stock'
    ? 'Sélectionnez une pastille pour l’affecter à une salle. Ctrl ou Maj pour en sélectionner plusieurs.'
    : 'Glissez une pastille sur une salle ou sur le stock. Ctrl ou Maj pour en sélectionner plusieurs.'}</p>;
}

/** Fiche des matériels sélectionnés (affectation, état), ou aide à la sélection : rendue sous la zone qui défile du panneau */
export function DevCard({ ids, mode, salleId, act }: { ids: Id[]; mode: Mode; salleId: Id | null; act: SalleActions }) {
  useEscape(act.clear, ids.length > 0);
  if (!ids.length) return <SelectionHint mode={mode} salleId={salleId} />;
  const move = can('materiel.move') ? (
    <form className="move-row" onSubmit={(e) => { e.preventDefault(); act.move((e.currentTarget.elements as HTMLFormControlsCollection & { destination: HTMLSelectElement }).destination.value || null); }}>
      <label className="sr-only" htmlFor="move-to">Affecter à</label>
      <FilterSelect id="move-to" aria-label="Affecter à" name="destination" key={ids.join()} defaultValue={mode === 'stock' ? '' : salleId ?? ''} options={affectationOptions(null)} />
      <button type="submit" className="btn btn--primary btn--s">Affecter</button>
    </form>) : null;
  if (ids.length > 1) {
    return <div className="dev-card">
      <div className="dev-card-head"><Tile name="deplacement" color="var(--accent)" size="m" /><div><b>{num(ids.length)} matériels sélectionnés</b><span>Glissez-les sur une salle, ou choisissez une destination.</span></div>
        <button className="icon-btn" aria-label="Annuler la sélection" onClick={act.clear}><Icon name="close" size={16} /></button></div>
      {move}
    </div>;
  }
  const m = index().materiel.get(ids[0]);
  if (!m) return null;
  const t = deviceType(m.type);
  const canEdit = can('materiel.edit');
  const guard = canEdit ? {} : { 'aria-disabled': 'true' as const, 'data-tip': why('materiel.edit') };
  return <div className="dev-card">
    <div className="dev-card-head">
      <span className="tile-wrap"><Tile name={t.icon} color={t.color} size="m" /><span className={`led led--${m.hs ? 'hs' : 'ok'} tile-led`} /></span>
      <div><b>{m.modele}</b><span>{m.idOrion}{m.marque ? `, ${m.marque}` : ''}</span></div>
      <button className="icon-btn" aria-label="Fermer" onClick={act.clear}><Icon name="close" size={16} /></button>
    </div>
    <ul className="dev-facts">
      <li data-tip="Numéro de série"><Icon name="key" size={16} /><span>{m.serie ?? 'Sans numéro'}</span></li>
      <li data-tip="Date de réception"><Icon name="calendar" size={16} /><span>{dateMed(m.dateReception)}</span></li>
      {m.garantieFin ? <li data-tip="Fin de garantie" className={m.garantieFin < Date.now() ? 'is-late' : ''}><Icon name="calendarWarn" size={16} /><span>{dateMed(m.garantieFin)}</span></li> : null}
      {m.hs ? <li data-tip="État" className="is-late"><Icon name="power" size={16} /><span>{etatMateriel(m)}</span></li> : null}
      {m.salleId || m.deplacement ? <li className="dev-fact-inst"><InstallDot m={m} /><span>{logistique(m).label}{m.deplacement ? ` (${lieuNom(m.deplacement.de)} → ${lieuNom(m.salleId)})` : ''}</span></li> : null}
    </ul>
    <div className="seg seg--status" role="radiogroup" aria-label="Hors service">
      <button role="radio" aria-checked={!m.hs} className={`seg-btn st-btn st-btn--ok ${!m.hs ? 'is-on' : ''}`} {...guard} onClick={canEdit ? () => act.setHs(m.id, false) : undefined}><Icon name="checkCircle" size={18} /><span>En service</span></button>
      <button role="radio" aria-checked={m.hs} className={`seg-btn st-btn st-btn--hs ${m.hs ? 'is-on' : ''}`} {...guard} onClick={canEdit ? () => act.setHs(m.id, true) : undefined}><Icon name="power" size={18} /><span>Hors service</span></button>
    </div>
    {move}
    <div className="dev-card-actions">
      <span />
      <span className="flex-1" />
      {canEdit && <button className="icon-btn" aria-label="Modifier la fiche" data-tip="Modifier la fiche" onClick={() => openMaterielForm(m)}><Icon name="pencil" size={18} /></button>}
      <GuardedBtn cap="materiel.delete" motif={motifSuppression(m)} className="icon-btn icon-btn--danger" aria-label="Supprimer le matériel" onClick={() => act.deleteMat(m)}><Icon name="trash" size={18} /></GuardedBtn>
    </div>
  </div>;
}

/** Installation en cours : avancement, matériels à apporter et à retirer ; confirmés un à un dans Déplacements */
function InstallationBlock({ x, inst }: { x: Salle; inst: SalleEnInstallation }) {
  return <div className="inst-block">
    <span className="inst-block-head"><b>En cours d’installation</b><small>{resteAFaire(inst)}</small></span>
    <Progress value={inst.pct} label={`Avancement de l’installation de ${x.nom}`} />
  </div>;
}

/** Opérations en cours dans la salle, indépendantes l'une de l'autre : installation (ses déplacements) et campagne de recensement */
function OperationsEnCours({ x, installation }: { x: Salle; installation: boolean }) {
  const campagne = can('recensement.view') ? recensementDe(store.state.recensements, x) : undefined;
  const vers = installation && can('materiel.move');
  if (!vers && !campagne) return null;
  return <div className="salle-operations">
    {vers && <Link className="btn btn--ghost btn--s" to={`/salles/deplacements?salle=${x.id}`}><Icon name="deplacement" size={16} />Installation en cours</Link>}
    {campagne && <Link className="btn btn--ghost btn--s" to={`/materiels/recensement/${campagne.id}`}><Icon name="clipboardCheck" size={16} />Recensement en cours</Link>}
  </div>;
}

export function SalleDetail({ x, stageBat, selected, devs, act }: { x: Salle; stageBat: string | null; selected: Set<Id>; devs: DevHandlers; act: SalleActions }) {
  const navigate = useNavigate();
  const closeTo = `/salles${stageBat ? `/batiment/${stageBat}` : ''}`;
  useEscape(() => navigate(closeTo));
  const v = parc().bySalle.get(x.id) ?? { total: 0, hs: 0, ok: 0, postes: 0, allumes: 0, attente: 0 };
  const inst = installationOf(x.id);
  const st = inst ? null : salleStatut(x.id, v.total); // en cours d'installation : bloc d'avancement ci-dessous
  const list = materielsOf(x.id);
  const draggable = can('materiel.move');
  const postesLink = can('supervision.view') ? `/supervision/salles?salle=${encodeURIComponent(x.id)}` : null;
  return <>
    <div className="insp-head">
      <Tile name="salles" color="var(--c3)" size="l" />
      <div className="insp-title"><h2>{x.nom}</h2><span><span className="code-badge" role="img" aria-label={batimentLabel(x.batiment)} data-tip={batimentLabel(x.batiment)}>{x.batiment}</span>{floorLabel(floorLevel(x))}</span>{st && <b className="salle-statut"><span className={`inst-dot inst-dot--${st.tone} inst-dot--s`} />{st.label}</b>}</div>
      <div className="insp-actions">
        <GuardedBtn cap="salle.manage" className="icon-btn" aria-label="Modifier la salle" onClick={() => openSalleForm(x)}><Icon name="pencil" size={18} /></GuardedBtn>
        {v.postes ? <button className="icon-btn" aria-disabled="true" aria-label="Suppression impossible" data-tip="La salle accueille des postes supervisés"><Icon name="trash" size={18} /></button>
          : <GuardedBtn cap="salle.delete" className="icon-btn icon-btn--danger" aria-label="Supprimer la salle" onClick={() => act.deleteSalle(x)}><Icon name="trash" size={18} /></GuardedBtn>}
        <Link className="icon-btn" to={closeTo} aria-label="Fermer" data-tip="Fermer (Échap)"><Icon name="close" size={18} /></Link>
      </div>
    </div>
    <ul className="stat-row">
      <li data-tip="Matériels"><Icon name="materiel" size={20} /><b>{num(v.total)}</b></li>
      <li data-tip="Hors service" className={v.hs ? 'is-alert' : ''}><Icon name="power" size={20} /><b>{num(v.hs)}</b></li>
      <li className={postesLink ? 'stat-link' : ''} data-tip="Postes supervisés allumés"><Icon name="supervision" size={20} /><b>{num(v.allumes)}<small>/{num(v.postes)}</small></b>{postesLink && <Link className="stretched" to={postesLink} aria-label="Superviser les postes" />}</li>
      {v.attente ? <li data-tip="Matériels en remontée" className="is-wait"><Icon name="hourglass" size={20} /><b>{num(v.attente)}</b></li> : null}
    </ul>
    {v.total ? <EtatBar c={v} thin /> : null}
    {inst ? <InstallationBlock x={x} inst={inst} /> : null}
    <OperationsEnCours x={x} installation={Boolean(inst)} />
    <div className="insp-section">
      <span className="insp-section-title"><Icon name="materiel" size={18} />Matériels</span>
      <span className="insp-tools">
        {can('remontee.create') && <button className="icon-btn icon-btn--glass" aria-label="Signaler un problème dans cette salle" data-tip-title="Signaler un problème" data-tip="Reprend les matériels sélectionnés"
          onClick={() => openNewRemontee({ salleId: x.id, materielIds: [...selected] })}><Icon name="alertes" size={18} /></button>}
        {can('materiel.move') && <button className="icon-btn icon-btn--glass" aria-label="Équiper la salle" data-tip-title="Équiper la salle" data-tip="Postes et matériels secondaires pris dans le stock" onClick={() => openEquipSheet(x)}><Icon name="plus" size={18} /></button>}
      </span>
    </div>
    <DevGroups list={list} draggable={draggable} mode="salle" selected={selected} {...devs} />
  </>;
}

export function Stock({ selected, devs }: { selected: Set<Id>; devs: DevHandlers }) {
  const list = materielsOf(null);
  const s = parc().stock;
  return <>
    <div className="insp-head">
      <Tile name="stockage" color="var(--c8)" size="l" />
      <div className="insp-title"><h2>Stock</h2><span>Matériels sans localisation</span></div>
    </div>
    <ul className="stat-row">
      <li data-tip="En stock"><Icon name="stockage" size={20} /><b>{num(s.total)}</b></li>
      <li data-tip="Hors service" className={s.hs ? 'is-alert' : ''}><Icon name="power" size={20} /><b>{num(s.hs)}</b></li>
    </ul>
    <div className="insp-section">
      <span className="insp-section-title"><Icon name="materiel" size={18} />Matériels</span>
      {can('materiel.create') && <button className="icon-btn icon-btn--glass" aria-label="Ajouter un matériel" data-tip="Ajouter un matériel" onClick={() => openMaterielForm(null, { salleId: null })}><Icon name="plus" size={18} /></button>}
    </div>
    <DevGroups list={list} draggable={false} mode="stock" selected={selected} {...devs} />
  </>;
}
