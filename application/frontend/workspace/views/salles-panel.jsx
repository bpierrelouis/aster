/* ==========================================================================
   Salles · panneau latéral : vue d'ensemble, fiche de salle, stock (seul à
   l'écran Stock) et cartes de matériel (sélection, glisser-déposer, affectation).
   ========================================================================== */

import { useRef } from 'react';
import { Link } from 'react-router';
import { Icon, Tile } from '../ui/icons.jsx';
import { currentEcole } from '../core/store.js';
import { can, why } from '../core/permissions.js';
import { num, dateMed } from '../core/format.js';
import { DEVICE_TYPES, deviceType } from '../core/catalog.js';
import { parc, batiments, batimentLabel, sallesOf, materielsOf, index } from '../core/selectors.js';
import { EtatBar } from '../widgets/parts.jsx';
import { openMaterielForm, AffectationOptions } from './materiel.jsx';
import { openNewRemontee } from './remontees-create.jsx';
import { floorLabel, floorLevel, roomOrder } from './salles-scene.jsx';
import { openSalleForm } from './salles-forms.jsx';

/** Bouton désactivé, avec l'explication, si le droit manque. */
function GuardedBtn({ cap, className, onClick, children, ...attrs }) {
  const ok = can(cap);
  return <button className={className} {...attrs} {...(ok ? { onClick } : { 'aria-disabled': 'true', 'data-tip': why(cap) })}>{children}</button>;
}

export function Overview({ mode, stageBat, stageFloor, hoverId }) {
  const p = parc();
  const bats = mode === 'batiment' ? [stageBat] : batiments();
  const list = bats.flatMap((b) => [...sallesOf(b)].sort(roomOrder)).filter((x) => stageFloor === null || floorLevel(x) === stageFloor); // groupées par bâtiment
  const c = { total: 0, hs: 0, ok: 0 };
  for (const x of list) { const v = p.bySalle.get(x.id); c.total += v.total; c.hs += v.hs; c.ok += v.ok; }
  const e = currentEcole();
  const titleTxt = mode === 'batiment' ? batimentLabel(stageBat) : e === 'all' ? 'Toutes les écoles' : index().ecole.get(e)?.nom ?? '';
  return <>
    <div className="insp-head">
      <Tile name={mode === 'batiment' ? 'salles' : 'school'} color="var(--c3)" size="l" />
      <div className="insp-title"><h2>{titleTxt}</h2><span>{num(list.length)} salles{mode === 'all' ? `, ${num(bats.length)} bâtiments` : ''}</span></div>
    </div>
    <ul className="stat-row">
      <li data-tip="Salles"><Icon name="salles" size={20} /><b>{num(list.length)}</b></li>
      <li data-tip="Matériels affectés"><Icon name="materiel" size={20} /><b>{num(c.total)}</b></li>
      <li data-tip="Hors service" className={c.hs ? 'is-alert' : ''}><Icon name="power" size={20} /><b>{num(c.hs)}</b></li>
    </ul>
    <EtatBar c={c} thin />
    <ul className="salle-list">
      {list.map((x) => {
        const v = p.bySalle.get(x.id);
        return <li key={x.id}><Link className={`salle-row${x.id === hoverId ? ' is-hover' : ''}`} to={`/salles/salle/${x.id}`} data-salle-row={x.id}>
          <span className="code-badge">{x.batiment}</span><b>{x.nom}</b>
          <span className="salle-types">{Object.entries(v.types).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([t]) => <span key={t} data-tip={deviceType(t).plural}><Tile name={deviceType(t).icon} color={deviceType(t).color} size="s" className="tile--tint" /></span>)}</span>
          <span className="salle-meta">{v.hs ? <span className="led led--hs" /> : v.attente ? <span className="led led--wait" /> : null}<b>{num(v.total)}</b></span>
          <Icon name="chevR" size={18} />
        </Link></li>;
      })}
    </ul>
  </>;
}

function DevGroups({ list, draggable, mode, selected, onPick, onGrab }) {
  const groups = DEVICE_TYPES.map((t) => ({ t, list: list.filter((m) => m.type === t.id) })).filter((g) => g.list.length);
  if (!groups.length) return <div className="w-empty"><Icon name="materiel" size={26} /><span>Aucun matériel {mode === 'stock' ? 'en stock' : 'dans cette salle'}.</span></div>;
  return <div className="dev-groups">{groups.map(({ t, list: l }) => (
    <section key={t.id} className="dev-group">
      <header><Tile name={t.icon} color={t.color} size="s" /><span>{t.plural}</span><b>{num(l.length)}</b></header>
      <div className="dev-grid">{l.map((m) => (
        <button key={m.id} className={`dev ${selected.has(m.id) ? 'is-on' : ''} ${draggable ? 'is-draggable' : ''}`} data-mat={m.id} style={{ '--c': t.color }}
          aria-label={`${m.modele}, ${m.idAster}, ${m.hs ? 'hors service' : 'en service'}`} aria-pressed={selected.has(m.id)} data-tip={`${m.modele}\n${m.idAster}`}
          onClick={(e) => onPick(e, m.id)} onPointerDown={draggable ? (e) => onGrab(e, m.id) : undefined}>
          <Icon name={t.icon} size={20} /><span className={`led led--${m.hs ? 'hs' : 'ok'}`} />
        </button>))}</div>
    </section>))}</div>;
}

function DevCard({ ids, mode, salleId, act }) {
  const moveRef = useRef(null);
  if (!ids.length) return null;
  const move = can('materiel.move') ? (
    <div className="move-row">
      <label className="sr-only" htmlFor="move-to">Affecter à</label>
      <select id="move-to" ref={moveRef} key={ids.join()} defaultValue={mode === 'stock' ? '' : salleId ?? ''}><AffectationOptions ecoleId={null} /></select>
      <button className="btn btn--primary btn--s" onClick={() => act.move(moveRef.current.value || null)}><Icon name="deplacement" size={16} /><span>Affecter</span></button>
    </div>) : null;
  if (ids.length > 1) {
    return <div className="dev-card">
      <div className="dev-card-head"><Tile name="deplacement" color="var(--iris)" size="m" /><div><b>{num(ids.length)} matériels sélectionnés</b><span>Glissez-les sur une salle, ou choisissez une destination.</span></div>
        <button className="icon-btn" aria-label="Annuler la sélection" onClick={act.clear}><Icon name="close" size={16} /></button></div>
      {move}
    </div>;
  }
  const m = index().materiel.get(ids[0]);
  if (!m) return null;
  const t = deviceType(m.type);
  const canEdit = can('materiel.edit');
  const guard = canEdit ? {} : { 'aria-disabled': 'true', 'data-tip': why('materiel.edit') };
  return <div className="dev-card">
    <div className="dev-card-head">
      <span className="tile-wrap"><Tile name={t.icon} color={t.color} size="m" /><span className={`led led--${m.hs ? 'hs' : 'ok'} tile-led`} /></span>
      <div><b>{m.modele}</b><span>{m.idAster}{m.marque ? `, ${m.marque}` : ''}</span></div>
      <button className="icon-btn" aria-label="Fermer" onClick={act.clear}><Icon name="close" size={16} /></button>
    </div>
    <ul className="dev-facts">
      <li data-tip="Numéro de série"><Icon name="key" size={16} /><span>{m.serie ?? 'Sans numéro'}</span></li>
      <li data-tip="Date de réception"><Icon name="calendar" size={16} /><span>{dateMed(m.dateReception)}</span></li>
      {m.garantieFin ? <li data-tip="Fin de garantie" className={m.garantieFin < Date.now() ? 'is-late' : ''}><Icon name="calendarWarn" size={16} /><span>{dateMed(m.garantieFin)}</span></li> : null}
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
      <GuardedBtn cap="materiel.delete" className="icon-btn icon-btn--danger" aria-label="Supprimer le matériel" onClick={() => act.deleteMat(m)}><Icon name="trash" size={18} /></GuardedBtn>
    </div>
  </div>;
}

export function SalleDetail({ x, stageBat, selected, devs, act }) {
  const v = parc().bySalle.get(x.id) ?? { total: 0, hs: 0, ok: 0, postes: 0, connectes: 0, attente: 0 };
  const list = materielsOf(x.id);
  const draggable = can('materiel.move');
  const postesLink = can('supervision.view') ? `/supervision/salles?salle=${encodeURIComponent(x.id)}` : null;
  return <>
    <div className="insp-head">
      <Tile name="salles" color="var(--c3)" size="l" />
      <div className="insp-title"><h2>{x.nom}</h2><span><span className="code-badge">{x.batiment}</span>{batimentLabel(x.batiment)} · {floorLabel(floorLevel(x))}</span></div>
      <div className="insp-actions">
        <GuardedBtn cap="salle.manage" className="icon-btn" aria-label="Modifier la salle" onClick={() => openSalleForm(x)}><Icon name="pencil" size={18} /></GuardedBtn>
        {v.postes ? <button className="icon-btn" aria-disabled="true" aria-label="Suppression impossible" data-tip="La salle accueille des postes supervisés"><Icon name="trash" size={18} /></button>
          : <GuardedBtn cap="salle.delete" className="icon-btn icon-btn--danger" aria-label="Supprimer la salle" onClick={() => act.deleteSalle(x)}><Icon name="trash" size={18} /></GuardedBtn>}
        <Link className="icon-btn" to={`/salles${stageBat ? `/batiment/${stageBat}` : ''}`} aria-label="Fermer"><Icon name="close" size={18} /></Link>
      </div>
    </div>
    <ul className="stat-row">
      <li data-tip="Matériels"><Icon name="materiel" size={20} /><b>{num(v.total)}</b></li>
      <li data-tip="Hors service" className={v.hs ? 'is-alert' : ''}><Icon name="power" size={20} /><b>{num(v.hs)}</b></li>
      <li className={postesLink ? 'stat-link' : ''} data-tip="Postes supervisés connectés"><Icon name="supervision" size={20} /><b>{num(v.connectes)}<small>/{num(v.postes)}</small></b>{postesLink && <Link className="stretched" to={postesLink} aria-label="Superviser les postes" />}</li>
      {v.attente ? <li data-tip="Matériels en remontée" className="is-wait"><Icon name="hourglass" size={20} /><b>{num(v.attente)}</b></li> : null}
    </ul>
    {v.total ? <EtatBar c={v} thin /> : null}
    <div className="insp-section">
      <span className="insp-section-title"><Icon name="materiel" size={18} />Matériels</span>
      <span className="insp-tools">
        {can('remontee.create') && <button className="icon-btn icon-btn--glass" aria-label="Signaler un problème dans cette salle" data-tip-title="Signaler un problème" data-tip="Reprend les matériels sélectionnés"
          onClick={() => openNewRemontee({ salleId: x.id, materielIds: [...selected] })}><Icon name="alertes" size={18} /></button>}
        {can('materiel.create') && <button className="icon-btn icon-btn--glass" aria-label="Ajouter un matériel" data-tip="Ajouter un matériel" onClick={() => openMaterielForm(null, { salleId: x.id })}><Icon name="plus" size={18} /></button>}
      </span>
    </div>
    <DevGroups list={list} draggable={draggable} mode="salle" selected={selected} {...devs} />
    {draggable && list.length && !selected.size ? <p className="hint-s"><Icon name="deplacement" size={16} />Glissez une pastille sur une salle ou sur le stock. Ctrl ou Maj pour en sélectionner plusieurs.</p> : null}
    <DevCard ids={[...selected]} mode="salle" salleId={x.id} act={act} />
  </>;
}

export function Stock({ selected, devs, act }) {
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
    {list.length && !selected.size ? <p className="hint-s"><Icon name="deplacement" size={16} />Sélectionnez une pastille pour l’affecter à une salle. Ctrl ou Maj pour en sélectionner plusieurs.</p> : null}
    <DevCard ids={[...selected]} mode="stock" salleId={null} act={act} />
  </>;
}
