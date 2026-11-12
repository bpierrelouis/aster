/* ==========================================================================
   Salles · scène isométrique
   Chaque étage est une dalle de verre. Les salles y sont rangées par ordre
   alphabétique, en une grille aussi proche que possible d'un carré, sans
   coordonnées physiques. Les étages d'un bâtiment sont toujours éclatés
   verticalement et centrés sur l'emprise du plus grand : chaque bâtiment
   garde sa silhouette. Les étiquettes font face à l'écran pour rester lisibles.
   ========================================================================== */

import { Link, useNavigate } from 'react-router';
import { Icon } from '../../ui/icons.tsx';
import { num } from '#shared/format.ts';
import { clamp } from '../../core/dom.ts';
import { parc, sallesOf, batimentLabel, floorLabel, floorShort } from '../../core/selectors.ts';
import type { CSSProperties } from 'react';
import type { SalleStats } from '../../core/selectors.ts';
import type { Id, Salle, WorkspaceView } from '#shared/types.ts';

/** Étage d'un bâtiment : niveau et salles */
interface Floor { level: number; rooms: Salle[] }
/** Salle placée sur la grille de son étage, en cellules */
interface Cell { salle: Salle; x: number; y: number }
/** Étage disposé : grille (cells, w, h), décalage sur l'emprise commune (ox, oy) et hauteur (z) */
type FloorModel = Floor & ReturnType<typeof floorLayout> & { ox: number; oy: number; z: number };
export type BuildingModel = ReturnType<typeof buildingModel>;
/** Activation d'une salle ; key : au clavier */
type OnRoom = (id: Id, key: boolean) => void;
/** Propriétés communes des salles d'une scène (survol, sélection, dépôt) */
export interface SceneProps { bySalle: Map<Id, SalleStats>; selectedId: Id | null; hoverId: Id | null; dropId: Id | null; onRoom: OnRoom }
/** Options de mise à l'échelle (fitIso) */
export interface FitOptions { tagW?: number; max?: number }
/** Scènes de l'écran : enregistrement d'un élément .iso (référence React), clic à ignorer après un glisser, propriétés des salles */
export interface Scene {
  register: (model: BuildingModel, opts: FitOptions) => (iso: HTMLDivElement) => () => void;
  suppressClick: () => boolean;
  props: SceneProps;
}

export const ISO = { rx: 56, rz: -24 };
const TW = 5, TH = 4, GAP = 1.5, PAD = 1.2; // en cellules
const RAD = Math.PI / 180;
const SX = Math.sin(ISO.rx * RAD), CX = Math.cos(ISO.rx * RAD);
const SZ = Math.abs(Math.sin(ISO.rz * RAD)), CZ = Math.cos(ISO.rz * RAD);

export { floorLabel, floorShort }; // définis dans core/selectors.ts, partagés avec l'administration

/** Disposition d'un étage : salles accolées en grille, le nombre de colonnes donnant l'emprise la plus carrée. */
function floorLayout(rooms: Salle[]) {
  const n = Math.max(1, rooms.length);
  const span = (count: number, size: number) => count * size + (count - 1) * GAP;
  let cols = 1;
  let best = Infinity;
  for (let c = 1; c <= n; c++) {
    const w = span(c, TW), h = span(Math.ceil(n / c), TH);
    const ratio = Math.max(w / h, h / w);
    if (ratio < best) { best = ratio; cols = c; }
  }
  return {
    cells: rooms.map((salle, i): Cell => ({ salle, x: PAD + (i % cols) * (TW + GAP), y: PAD + Math.floor(i / cols) * (TH + GAP) })),
    w: PAD * 2 + span(cols, TW),
    h: PAD * 2 + span(Math.ceil(n / cols), TH),
  };
}

/** Projection à l'écran d'un rectangle du plan, en cellules. */
const projW = (w: number, h: number) => w * CZ + h * SZ;
const projH = (w: number, h: number) => (w * SZ + h * CZ) * CX;

/**
 * Modèle d'un bâtiment : floors = [{ level, rooms }] du plus bas au plus haut.
 * Les étages sont centrés sur l'emprise commune ; l'écart vertical évite
 * qu'un étage recouvre celui du dessous à l'écran.
 */
export function buildingModel(batiment: string, floors: Floor[], spread = 1) {
  const laid = floors.map((f) => ({ ...f, ...floorLayout(f.rooms) }) as FloorModel); // ox, oy, z : fixés ci-dessous
  const W = Math.max(TW + PAD * 2, ...laid.map((f) => f.w));
  const H = Math.max(TH + PAD * 2, ...laid.map((f) => f.h));
  const gap = (projH(W, H) / SX + 1.6) * spread;
  laid.forEach((f, i) => { f.ox = (W - f.w) / 2; f.oy = (H - f.h) / 2; f.z = i * gap; });
  return { batiment, floors: laid, W, H, lift: (laid.length - 1) * gap * SX };
}

function Room({ c, f, bySalle, selectedId, hoverId, dropId, onRoom }: SceneProps & { c: Cell; f: FloorModel }) {
  const s = c.salle;
  const v = bySalle.get(s.id) ?? { total: 0, hs: 0, attente: 0 };
  const state = v.hs ? 'is-hs' : v.attente ? 'is-wait' : '';
  const details = [`${num(v.total)} matériel${v.total > 1 ? 's' : ''}`, v.hs ? `${num(v.hs)} hors service` : '', v.attente ? `${num(v.attente)} en remontée` : ''].filter(Boolean);
  const cls = ['blk', state, s.id === selectedId && 'is-selected', s.id === hoverId && 'is-hover', s.id === dropId && 'is-drop'].filter(Boolean).join(' ');
  return <div className={cls} data-salle={s.id} role="button" tabIndex={0}
    style={{ '--bx': c.x, '--by': c.y } as CSSProperties} aria-label={`${s.nom}, ${floorLabel(f.level)}, ${details.join(', ')}`}
    data-tip-title={s.nom} data-tip={details.join('\n')}
    onClick={() => onRoom(s.id, false)}
    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onRoom(s.id, true); } }}>
    <span className="blk-face blk-face--s" /><span className="blk-face blk-face--w" /><span className="blk-top" />
    <span className="blk-label"><span>
      <b>{s.nom}</b>
      <small><Icon name="materiel" size={12} />{num(v.total)}{v.hs ? <i className="chip-hs">{num(v.hs)} HS</i> : null}{v.attente ? <i className="chip-wait"><Icon name="hourglass" size={11} />{num(v.attente)}</i> : null}</small>
    </span></span>
  </div>;
}

/**
 * Étages d'un bâtiment ; floorHref(level) donne le lien de l'étiquette d'étage.
 * onRoom(id, clavier) : activation d'une salle.
 */
export function Building({ model, bySalle, selectedId = null, hoverId = null, dropId = null, floorHref, activeLevel = null, onRoom }: Pick<SceneProps, 'bySalle' | 'onRoom'> & Partial<Omit<SceneProps, 'bySalle' | 'onRoom'>> & {
  model: BuildingModel; floorHref: (level: number) => string; activeLevel?: number | null;
}) {
  return model.floors.map((f) => {
    const hs = f.rooms.reduce((n, s) => n + (bySalle.get(s.id)?.hs ? 1 : 0), 0);
    return <div key={f.level} className={`plat floor-slab${activeLevel === f.level ? ' is-active' : ''}`}
      style={{ '--px': f.ox, '--py': f.oy, '--pw': f.w, '--ph': f.h, '--floor-z': f.z } as CSSProperties}>
      <span className="plat-face plat-face--s" /><span className="plat-face plat-face--w" />
      {f.cells.map((c) => <Room key={c.salle.id} c={c} f={f} bySalle={bySalle} selectedId={selectedId} hoverId={hoverId} dropId={dropId} onRoom={onRoom} />)}
      <Link className="plat-tag floor-tag-link" to={floorHref(f.level)} aria-label={`${floorLabel(f.level)}, ${f.rooms.length} salles`}>
        <span><span className="floor-code">{floorShort(f.level)}</span><span className="tag-txt"><b>{floorLabel(f.level)}</b><small>{f.rooms.length} salle{f.rooms.length > 1 ? 's' : ''}{hs ? <> · <em>{hs} avec HS</em></> : null}</small></span></span>
      </Link>
    </div>;
  });
}

/** Hauteur projetée de la scène, en cellules (étiquettes de salle comprises). */
const sceneHeight = (model: BuildingModel) => projH(model.W, model.H) + model.lift + 2;

/** Hauteur de conteneur (pixels) qui donne au moins `cell` pixels par cellule. */
export const heightForCell = (model: BuildingModel, cell: number) => (sceneHeight(model) * cell) / 0.9;

/**
 * Met la scène à l'échelle de son conteneur. tagW : place réservée à gauche
 * pour les étiquettes d'étage (pixels). En dessous d'une certaine taille de
 * cellule, les étiquettes de salle se réduisent au nom.
 */
export function fitIso(iso: HTMLElement, container: HTMLElement, model: BuildingModel, { tagW = 170, max = 30 }: FitOptions = {}) {
  const W = container.clientWidth, Hc = container.clientHeight;
  if (!W || !Hc) return;
  const pw = projW(model.W, model.H);
  const ph = sceneHeight(model);
  const cell = Math.max(4, Math.min(max, (W * 0.94 - tagW) / pw, (Hc * 0.9) / ph));
  iso.style.setProperty('--cell', `${cell}px`);
  iso.style.setProperty('--tw', String(model.W));
  iso.style.setProperty('--th', String(model.H));
  iso.style.setProperty('--rx', `${ISO.rx}deg`);
  iso.style.setProperty('--rz', `${ISO.rz}deg`);
  iso.style.setProperty('--shift-x', `${tagW / 2}px`);
  iso.style.setProperty('--shift-y', `${(model.lift / 2 + .6) * cell}px`);
  iso.classList.toggle('is-compact', cell < 11);
  iso.classList.toggle('is-tiny', cell < 8);
}

/* --------------------------------------------------------------------------
   Étages et ordre des salles
   -------------------------------------------------------------------------- */
const MINI_CELL = 11; // échelle minimale des vignettes, en pixels par cellule
export const floorLevel = (s: Salle) => Number(s.etage ?? 0);
/** Étages d'un bâtiment : ceux de ses salles */
const floorsOf = (b: string) => [...new Set(sallesOf(b).map(floorLevel))].sort((x, y) => x - y);
export const roomOrder = (a: Salle, b: Salle) => a.nom.localeCompare(b.nom, 'fr', { numeric: true });
export const floorHref = (b: string) => (level: number) => `/salles/batiment/${encodeURIComponent(b)}?etage=${level}`;

/* --------------------------------------------------------------------------
   Scène : modèles et totaux
   -------------------------------------------------------------------------- */

// spread < 1 : étages moins espacés, pour les vignettes de la vue d'ensemble
export function modelOf(b: string, spread = 1) {
  const rooms = sallesOf(b);
  return buildingModel(b, floorsOf(b).map((level) => ({ level, rooms: rooms.filter((x) => floorLevel(x) === level).sort(roomOrder) })), spread);
}

function batTotals(b: string) {
  const { bySalle } = parc();
  const c = { total: 0, hs: 0, attente: 0 };
  for (const x of sallesOf(b)) { const v = bySalle.get(x.id)!; c.total += v.total; c.hs += v.hs; c.attente += v.attente; }
  return c;
}

// Données affichées par l'écran : salles, étages, matériels, remontées en attente, postes allumés
export const signature = (st: WorkspaceView) => JSON.stringify([st.salles, st.materiels, st.remontees.map((r) => [r.id, r.statut, r.materielIds]), st.postes.map((p) => [p.id, p.allume]), st.ecoleId]);

export function BatCard({ b, scene }: { b: string; scene: Scene }) {
  const navigate = useNavigate();
  const levels = floorsOf(b);
  const n = sallesOf(b).length;
  const c = batTotals(b);
  const model = modelOf(b, .8);
  return <article className="bat-card glass">
    <Link className="bat-card-head" to={`/salles/batiment/${encodeURIComponent(b)}`}>
      <span className="code-badge code-badge--l">{b}</span>
      <span className="bat-card-title"><b>{batimentLabel(b)}</b><small>{levels.length} niveau{levels.length > 1 ? 'x' : ''} · {n} salle{n > 1 ? 's' : ''}</small></span>
      <span className="bat-card-stats">
        <span data-tip="Matériels affectés"><Icon name="materiel" size={15} />{num(c.total)}</span>
        {c.hs ? <span className="is-hs" data-tip="Matériels hors service"><Icon name="power" size={15} />{num(c.hs)}</span> : null}
        {c.attente ? <span className="is-wait" data-tip="Matériels en remontée"><Icon name="hourglass" size={15} />{num(c.attente)}</span> : null}
      </span>
      <Icon name="chevR" size={18} />
    </Link>
    {/* Chaque carte prend la hauteur qu'il faut pour que les noms des salles restent lisibles */}
    <div className="bat-card-stage" style={{ minHeight: `${Math.round(clamp(heightForCell(model, MINI_CELL), 280, 620))}px` }}
      onClick={(e) => { if (!scene.suppressClick() && !(e.target as Element).closest('.blk, a')) navigate(`/salles/batiment/${b}`); }}>
      <div className="iso is-exploded is-mini" ref={scene.register(model, { tagW: 64, max: 18 })}>
        <Building model={model} {...scene.props} floorHref={floorHref(b)} />
      </div>
    </div>
  </article>;
}
