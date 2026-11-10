/* Éléments d'affichage partagés par plusieurs écrans. */
import { createContext, useContext } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '../ui/icons.jsx';
import { usePeek } from '../ui/peek.js';
import { num } from '#shared/format.js';
import { ETATS, statut } from '#shared/catalog.js';
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

/** Tableau des écrans Supervision et Administration : en-tête fixe, défilement dans le cadre, pied facultatif (pagination) */
export function OpsTable({ head, children, footer = null }) {
  const scroll = usePeek('tbody tr');
  return <div className="ops-table-wrap glass">
    <div ref={scroll} className="ops-table-scroll"><table className="ops-table">
      <thead><tr>{head.map((h) => <th key={h}>{h}</th>)}</tr></thead>
      <tbody>{children}</tbody>
    </table></div>
    {footer}
  </div>;
}

/** Page d'une liste : page demandée bornée au nombre de pages, lignes de cette page */
export function paginate(list, page, size) {
  const pages = Math.max(1, Math.ceil(list.length / size));
  const current = Math.min(Math.max(1, page), pages);
  return { pages, current, rows: list.slice((current - 1) * size, current * size) };
}

/** Pied de tableau paginé : Précédent, page courante, Suivant */
export function Pagination({ current, pages, onPage }) {
  return <footer className="pagination">
    <button className="btn btn--ghost" disabled={current <= 1} onClick={() => onPage(current - 1)}>Précédent</button>
    <span>Page {current} sur {pages}</span>
    <button className="btn btn--ghost" disabled={current >= pages} onClick={() => onPage(current + 1)}>Suivant</button>
  </footer>;
}

/** État vide des écrans Supervision et Administration */
export function OpsEmpty({ icon, title, text }) {
  return <div className="ops-empty glass"><Icon name={icon} size={36} /><h2>{title}</h2>{text && <p>{text}</p>}</div>;
}
