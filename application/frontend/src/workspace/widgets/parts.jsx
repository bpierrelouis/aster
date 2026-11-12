/* Éléments d'affichage partagés par plusieurs écrans. */
import { createContext, useContext, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '../ui/icons.jsx';
import { OrionMark } from '../../connexion/brand.jsx';
import { usePeek } from '../ui/peek.js';
import { num, pct } from '#shared/format.js';
import { ETATS, statut, etatPoste } from '#shared/catalog.js';
import { index, batimentLabel } from '../core/selectors.js';

/** État d'un matériel : icône seule */
export function EtatIcon({ m }) {
  const e = m.hs ? ETATS.hs : ETATS.ok;
  return <span className={`st st--${e.id}`} data-tip={e.label}><Icon name={e.icon} size={16} /></span>;
}

/** Étiquette d'état d'un matériel : libellé sur fond de la couleur de l'état, sans témoin */
export function EtatPill({ m }) {
  return <span className={`pill pill--${m.hs ? 'hs' : 'ok'}`}>{m.hs ? 'Hors service' : 'En service'}</span>;
}

/** Pastille de statut d'une remontée */
export function StatutPill({ r }) {
  const s = statut(r.statut);
  return <span className={`pill pill--${s.id}`}><Icon name={s.icon} size={14} />{s.label}</span>;
}

/** État d'un poste supervisé (éteint, allumé, connecté, matériel hors service) et, connecté, l'utilisateur de sa session */
export function PosteEtat({ p }) {
  const e = etatPoste(p, index().materiel.get(p?.materielId));
  return <span className="inv-state"><i className={`led led--${e.led}`} />{e.label}{e.id === 'connecte' && <span className="poste-session"><Icon name="user" size={13} />{p.session}</span>}</span>;
}

/** Localisation d'un matériel : salle ou stock */
export function LieuChip({ m }) {
  const salle = m.salleId ? index().salle.get(m.salleId) : null;
  return salle
    ? <span className="chip chip--pin" data-tip={batimentLabel(salle.batiment)}><Icon name="pin" size={13} />{salle.nom}</span>
    : <span className="chip chip--stock" data-tip="Sans localisation"><Icon name="stockage" size={13} />Stock</span>;
}

/** Barre en service / hors service */
export function EtatBar({ c, thin = false }) {
  const seg = (id, n, label) => (n ? <span className={`sb-seg sb-seg--${id}`} style={{ flex: n }} data-tip={`${label} : ${num(n)}`} /> : null);
  return <div className={`sbar${thin ? ' sbar--thin' : ''}`} role="img" aria-label={`En service ${c.ok}, hors service ${c.hs}`}>
    {seg('ok', c.ok, 'En service')}{seg('hs', c.hs, 'Hors service')}
  </div>;
}

/** Pourcentage d'avancement : 100 % seulement une fois fini (99 % au plus avant) */
export const avancement = (value) => pct(value >= 1 ? 1 : Math.min(value, .99));

/** Avancement épuré : barre fine et pourcentage ; orange en cours, vert une fois fini */
export function Progress({ value, label }) {
  const done = value >= 1;
  return <span className={`progress${done ? ' is-done' : ''}`} role="progressbar" aria-label={label}
    aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(value * 100)}>
    <span className="progress-track"><span className="progress-fill" style={{ width: `${value * 100}%` }} /></span>
    <b>{avancement(value)}</b>
  </span>;
}

/** Emplacement des actions de l'écran dans la barre haute, fourni par le shell */
export const PageActionsSlot = createContext(null);

/**
 * En-tête d'écran : le menu indique déjà l'écran, le titre reste réservé aux
 * lecteurs d'écran ; les actions vont dans la barre haute, toujours visibles.
 */
export function PageHead({ title, children }) {
  const slot = useContext(PageActionsSlot);
  return <>
    <h1 className="sr-only">{title}</h1>
    {slot && createPortal(children, slot)}
  </>;
}

/** En-tête d'un widget : le titre seul, sans icône, et un complément facultatif à droite */
export function WidgetHead({ title, right = null }) {
  return <header className="w-head">
    <h3 className="w-title">{title}</h3>
    {right && <div className="w-head-right">{right}</div>}
  </header>;
}

/** Contenu vide d'un widget */
export const WidgetEmpty = ({ ic, text }) => <div className="w-empty"><Icon name={ic} size={28} /><span>{text}</span></div>;

/** Indicateur : libellé en haut (puce facultative à droite), valeur en bas, suivie d'une ligne facultative (variation, détail) */
export const KpiBody = ({ label, value, chip = null, sub = null }) => <>
  <div className="kpi-top"><span className="kpi-label">{label}</span>{chip}</div>
  <div className="kpi-bottom"><div className="kpi-value">{value}</div>{sub}</div>
</>;

/** Signal d'un indicateur : la carte prend un fond rouge (hors service) ou jaune (en attente) discret tant que la valeur n'est pas nulle */
export const alertClass = (tone, n) => (n > 0 ? ` kpi--${tone}` : '');

/** Ligne de détail sous la valeur d'un indicateur */
export const KpiSub = ({ children }) => <p className="kpi-sub">{children}</p>;

/**
 * Variation datée d'un indicateur : flèche, écart, puis la période.
 * sense : 'up-bad' (une hausse est défavorable), 'up-good' ou 'neutral' (sans jugement, encre).
 */
export function Delta({ diff, period, fmt = num, sense = 'neutral' }) {
  if (diff === null || diff === undefined || Number.isNaN(diff)) return null;
  if (!diff) return <p className="kpi-sub kpi-delta"><b>Stable</b> {period}</p>;
  const tone = sense === 'neutral' ? 'flat' : (diff > 0) === (sense === 'up-good') ? 'good' : 'bad';
  return <p className="kpi-sub kpi-delta" data-tone={tone}><b>{diff > 0 ? '▲' : '▼'} {fmt(Math.abs(diff))}</b> {period}</p>;
}

/** Tableau des écrans Supervision et Administration : en-tête fixe, défilement dans le cadre */
export function OpsTable({ head, scroll = true, children }) {
  const ref = usePeek();
  const table = <table className="ops-table">
    <thead><tr>{head.map((h) => <th key={h}>{h}</th>)}</tr></thead>
    <tbody>{children}</tbody>
  </table>;
  // scroll : le tableau défile dans sa carte ; sinon il s'affiche en entier et défile avec la page
  return <div className="ops-table-wrap glass">{scroll ? <div ref={ref} className="ops-table-scroll">{table}</div> : table}</div>;
}

/**
 * Tableau de données dans une carte (Matériels › Inventaire, Administration › Postes) :
 * filtres, barre de sélection facultative, tableau défilant à en-tête fixe, pied (pagination).
 * La zone défilante tient compte de ce qui la suit dans la carte. Styles : styles/inventaire.css.
 */
export function DataPanel({ filters, selection = null, head, children, footer = null }) {
  const scroll = usePeek('.inv-panel');
  return <section className="inv-panel glass">
    <div className="inv-filters">{filters}</div>
    <div>
      {selection && <div className="inv-selection">{selection}</div>}
      <div ref={scroll} className="inv-table-scroll"><table className="inv-table">
        <thead><tr>{head}</tr></thead>
        <tbody>{children}</tbody>
      </table></div>
      {footer}
    </div>
  </section>;
}

/** Page d'une liste : page demandée bornée au nombre de pages, lignes de cette page */
export function paginate(list, page, size) {
  const pages = Math.max(1, Math.ceil(list.length / size));
  const current = Math.min(Math.max(1, page), pages);
  return { pages, current, rows: list.slice((current - 1) * size, current * size) };
}

/** Pied de tableau paginé : nombre de lignes à gauche (facultatif), puis Précédent, page courante, Suivant */
export function Pagination({ current, pages, onPage, total = null }) {
  return <footer className="pagination">
    {total && <span className="pagination-total">{total}</span>}
    <button className="btn btn--ghost" disabled={current <= 1} onClick={() => onPage(current - 1)}>Précédent</button>
    <span>Page {current} sur {pages}</span>
    <button className="btn btn--ghost" disabled={current >= pages} onClick={() => onPage(current + 1)}>Suivant</button>
  </footer>;
}

/**
 * Carte d'un groupe (espace Notifications, déplacements à faire) : pictogramme, titre,
 * précision, action facultative, puis une liste qui défile dans la carte (éléments .rows > li).
 */
export function GroupCard({ tile = null, title, label = title, sub, action = null, extra = null, children }) {
  const scroll = usePeek('.group-card');
  return <section className="group-card glass" aria-label={label}>
    <header className="group-head">
      {tile}
      <div><h2>{title}</h2>{sub && <span>{sub}</span>}</div>
      {action}
    </header>
    {extra}
    <div ref={scroll} className="group-scroll"><ul className="rows">{children}</ul></div>
  </section>;
}

/**
 * Cartes en colonnes, sans grand espace entre elles : dans l'ordre, chaque carte va dans la colonne la moins
 * remplie d'après son poids (weight : hauteur estimée, en lignes) ; une colonne par tranche de 460 px
 * (écart entre colonnes : celui du CSS, .group-grid).
 */
export function GroupGrid({ items, weight, render }) {
  const ref = useRef(null);
  const [cols, setCols] = useState(1);
  useLayoutEffect(() => {
    const el = ref.current;
    const fit = () => {
      const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
      setCols(Math.max(1, Math.floor((el.clientWidth + gap) / (460 + gap))));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const columns = Array.from({ length: cols }, () => ({ load: 0, items: [] }));
  for (const item of items) {
    const c = columns.reduce((a, b) => (b.load < a.load ? b : a));
    c.items.push(item);
    c.load += weight(item);
  }
  return <div ref={ref} className="group-grid" style={{ '--cols': cols }}>
    {columns.map((c, i) => <div key={i} className="group-col">{c.items.map(render)}</div>)}
  </div>;
}

/** Chargement : étoile ORION entourée de petites étoiles qui scintillent, comme à l'ouverture de l'application, et libellé */
export function Loader({ label }) {
  return <div className="w-loader glass" role="status">
    <OrionMark className="loading-mark" />
    <span>{label}</span>
  </div>;
}

/** État vide des écrans Supervision et Administration */
export function OpsEmpty({ icon, title, text }) {
  return <div className="ops-empty glass"><Icon name={icon} size={36} /><h2>{title}</h2>{text && <p>{text}</p>}</div>;
}
