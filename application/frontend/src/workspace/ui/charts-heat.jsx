/* ==========================================================================
   Grilles de chaleur du tableau de bord (styles/diagrams.css) :
   calendrier par jour et matrice à double entrée. L'intensité d'une case
   suit sa valeur rapportée au maximum, en quatre paliers d'une même teinte.
   ========================================================================== */

import { num, plural, dateDay, monthShort } from '#shared/format.js';

/** Palier 0 à 3 d'une valeur rapportée au maximum (0 : aucune) */
const level = (v, max) => (v > 0 ? Math.min(3, Math.ceil((v / Math.max(max, 1)) * 3)) : 0);
const DAYS = ['lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.', 'dim.'];

/**
 * Calendrier : semaines en colonnes, jours en lignes (lundi en haut), total par jour de la semaine en marge.
 * weeks : [[{ at, n, future }] × 7] ; unit : [singulier, pluriel]
 */
export function HeatCalendar({ weeks, unit, label, totals = true }) {
  const max = Math.max(...weeks.flat().map((d) => d.n));
  const byDay = DAYS.map((_, k) => weeks.reduce((t, w) => t + (w[k].future ? 0 : w[k].n), 0));
  const maxDay = Math.max(1, ...byDay);
  let lastMonth = -1;
  return <div className={`heatcal${totals ? ' has-totals' : ''}`} role="img" aria-label={label}>
    <span />
    {weeks.map((w) => {
      const m = new Date(w[0].at).getMonth();
      const shown = m !== lastMonth;
      lastMonth = m;
      return <span key={w[0].at} className="heatcal-month">{shown ? monthShort(w[0].at) : ''}</span>;
    })}
    {totals && <span className="heatcal-month">Total</span>}
    {DAYS.map((d, k) => <div key={d} className="heatcal-row">
      <span className="heatcal-day">{k % 2 ? '' : d}</span>
      {weeks.map((w) => {
        const day = w[k];
        return day.future ? <span key={day.at} className="heat-cell is-future" />
          : <span key={day.at} className={`heat-cell heat-${level(day.n, max)}`} data-tip-title={dateDay(day.at)} data-tip={day.n ? plural(day.n, ...unit) : `Aucune ${unit[0]}`} />;
      })}
      {totals && <span className="heatcal-total" data-tip-title={`Les ${d.replace('.', '')}`} data-tip={plural(byDay[k], ...unit)}>
        <span className="heatcal-total-bar" style={{ width: `${(byDay[k] / maxDay) * 100}%` }} /><b>{num(byDay[k])}</b>
      </span>}
    </div>)}
  </div>;
}

/** Légende d'intensité : « Moins » quatre paliers « Plus » */
export const HeatLegend = ({ tone = '' }) => <ul className={`legend legend--inline heat-legend${tone ? ` heat--${tone}` : ''}`} aria-hidden="true">
  <li>Moins</li>{[0, 1, 2, 3].map((l) => <li key={l}><span className={`heat-cell heat-${l}`} /></li>)}<li>Plus</li>
</ul>;

/**
 * Matrice : lignes et colonnes nommées, total de chaque ligne et de chaque colonne.
 * rows : { label, cells: number[] } ; tone : teinte des cases ('crit' pour un état hors service) ; tip(row, j, v) : texte d'une case
 */
export function HeatMatrix({ cols, rows, label, tone = '', tip }) {
  const max = Math.max(1, ...rows.flatMap((r) => r.cells));
  const colTotals = cols.map((_, j) => rows.reduce((t, r) => t + r.cells[j], 0));
  return <div className={`heatmx${tone ? ` heat--${tone}` : ''}`} role="img" aria-label={label} style={{ '--cols': cols.length }}>
    <span />{cols.map((c) => <span key={c} className="heatmx-col">{c}</span>)}<span className="heatmx-col">Total</span>
    {rows.map((r) => <div key={r.label} className="heatmx-row">
      <span className="heatmx-label">{r.label}</span>
      {r.cells.map((v, j) => <span key={cols[j]} className={`heat-cell heat-${level(v, max)}`} data-tip-title={r.label} data-tip={tip(r, j, v)}>{v ? num(v) : ''}</span>)}
      <b className="heatmx-total">{num(r.cells.reduce((t, v) => t + v, 0))}</b>
    </div>)}
    <div className="heatmx-row heatmx-row--total">
      <span className="heatmx-label">Total</span>
      {colTotals.map((v, j) => <b key={cols[j]} className="heatmx-total">{num(v)}</b>)}
      <b className="heatmx-total">{num(colTotals.reduce((t, v) => t + v, 0))}</b>
    </div>
  </div>;
}
