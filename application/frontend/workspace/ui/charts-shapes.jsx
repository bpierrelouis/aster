/* ==========================================================================
   Diagrammes du tableau de bord : formes qui occupent la place de leur widget.
   - Anneau ou camembert (Donut), arcs concentriques (Arcs), jauge (Gauge)
   - Colonnes en relief (Columns), barres et tendance (ComboBars), pyramide
   Mêmes règles que ui/charts.jsx : texte en encre, infobulle sur chaque part
   (attributs data-tip), libellé accessible sur chaque diagramme.
   ========================================================================== */

import { num, pct } from '../core/format.js';

/* ---------- Géométrie polaire (angles en degrés depuis midi, sens horaire) ---------- */
const at = (r, a) => {
  const t = ((a - 90) * Math.PI) / 180;
  return [50 + r * Math.cos(t), 50 + r * Math.sin(t)];
};
const f = (n) => n.toFixed(2);
function sector(inner, outer, a0, a1) {
  const large = a1 - a0 > 180 ? 1 : 0;
  const [x0, y0] = at(outer, a0), [x1, y1] = at(outer, a1);
  const rim = `M${f(x0)} ${f(y0)}A${outer} ${outer} 0 ${large} 1 ${f(x1)} ${f(y1)}`;
  if (!inner) return `${rim}L50 50Z`;
  const [x2, y2] = at(inner, a1), [x3, y3] = at(inner, a0);
  return `${rim}L${f(x2)} ${f(y2)}A${inner} ${inner} 0 ${large} 0 ${f(x3)} ${f(y3)}Z`;
}

/** Légende : pastille de couleur, libellé, valeur */
export function ChartLegend({ items }) {
  return <ul className="legend chart-legend">{items.map((it) => (
    <li key={it.label}><span className="key-dot" style={{ '--k': it.color }} /><span className="legend-text">{it.label}</span><b>{it.value}</b></li>
  ))}</ul>;
}

/**
 * Anneau (hole > 0) ou camembert (hole = 0). parts : { label, value, color, explode? }.
 * Une part « explode » est détachée du centre.
 */
export function Donut({ parts, hole = .6, label, center = null }) {
  const total = parts.reduce((t, p) => t + p.value, 0);
  const shown = parts.filter((p) => p.value);
  const gap = shown.length > 1 ? 1.2 : 0; // espace entre les parts, en degrés
  let a = 0;
  return <div className="radial">
    <svg viewBox="-6 -6 112 112" role="img" aria-label={label}>
      {total ? shown.map((p) => {
        const sweep = (p.value / total) * 360;
        const a0 = a + gap / 2, a1 = Math.min(a + sweep - gap / 2, a0 + 359.99);
        const [dx, dy] = p.explode ? at(5, a + sweep / 2).map((v) => v - 50) : [0, 0];
        a += sweep;
        return <path key={p.label} className="radial-part" d={sector(48 * hole, 48, a0, a1)} fill={p.color} transform={`translate(${f(dx)} ${f(dy)})`}
          data-tip-title={p.label} data-tip={`${num(p.value)}, ${pct(p.value / total)}`} />;
      }) : <circle cx="50" cy="50" r="40" className="radial-track" />}
    </svg>
    {center && <div className="radial-center">{center}</div>}
  </div>;
}

/** Arcs concentriques, du plus grand au plus petit. items : { label, ratio (0 à 1), color, tip } */
export function Arcs({ items, label }) {
  const step = 44 / Math.max(items.length, 1);
  const width = Math.min(step * .64, 8);
  return <div className="radial">
    <svg viewBox="0 0 100 100" role="img" aria-label={label}>
      {items.map((it, i) => {
        const r = 49 - width / 2 - i * step;
        return <g key={it.label} data-tip-title={it.label} data-tip={it.tip}>
          <circle cx="50" cy="50" r={r} className="radial-track" strokeWidth={width} />
          <circle cx="50" cy="50" r={r} className="radial-arc" stroke={it.color} strokeWidth={width} pathLength="100"
            strokeDasharray={`${Math.max(it.ratio * 100, .01)} 100`} transform="rotate(-90 50 50)" />
        </g>;
      })}
    </svg>
  </div>;
}

/** Jauge en demi-cercle : ratio entre 0 et 1, valeur affichée au centre */
export function Gauge({ ratio, value, caption, label }) {
  const d = 'M10 50A40 40 0 0 1 90 50';
  return <div className="gauge">
    <svg viewBox="0 0 100 56" role="img" aria-label={label}>
      <path d={d} className="radial-track" strokeWidth="11" fill="none" />
      <path d={d} className="radial-arc gauge-arc" strokeWidth="11" fill="none" pathLength="100" strokeDasharray={`${ratio * 100} 100`} />
    </svg>
    <div className="gauge-text"><b>{value}</b>{caption && <span>{caption}</span>}</div>
  </div>;
}

/** Colonnes en relief (deux faces et un dessus). items : { key, label, short?, ratio (0 à 1), display, color, tip } */
export function Columns({ items, label }) {
  return <div className="cols" role="img" aria-label={label}>{items.map((it) => (
    <div key={it.key} className="col" data-tip-title={it.label} data-tip={it.tip}>
      <span className="col-track">
        <span className="col-bar" style={{ '--h': `${Math.max(it.ratio * 100, 2)}%`, '--c': it.color }}><span className="col-value">{it.display}</span></span>
      </span>
      <span className="col-label">{it.short ?? it.label}</span>
    </div>
  ))}</div>;
}

/** Barres et courbe de tendance, sur la même échelle */
export function ComboBars({ labels, bars, line, barName, lineName, label, fmtLine = num }) {
  const max = Math.max(...bars, ...line, 1) * 1.1;
  const n = bars.length;
  const x = (i) => ((i + .5) / n) * 100;
  const y = (v) => (v / max) * 100;
  const every = Math.ceil(n / 6); // une étiquette d'axe sur deux ou trois
  return <div className="combo" role="img" aria-label={label}>
    <div className="combo-plot">
      {bars.map((v, i) => <span key={i} className="combo-col" data-tip-title={labels[i]} data-tip={`${barName} : ${num(v)}\n${lineName} : ${fmtLine(line[i])}`}>
        <span className="combo-bar" style={{ height: `${y(v)}%` }} />
      </span>)}
      <svg className="combo-line" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <polyline points={line.map((v, i) => `${f(x(i))},${f(100 - y(v))}`).join(' ')} />
      </svg>
      {line.map((v, i) => <span key={i} className="combo-dot" style={{ left: `${x(i)}%`, bottom: `${y(v)}%` }} />)}
    </div>
    <div className="combo-axis">{labels.map((l, i) => <span key={i}>{i % every === 0 ? l : ''}</span>)}</div>
  </div>;
}

/** Pyramide : une bande par catégorie, de haut en bas. layers : { label, color, tip } */
export function Pyramid({ layers, label }) {
  const W = 116, H = 100, gap = 2.5;
  const h = (H - gap * (layers.length - 1)) / layers.length;
  const half = (y) => (y / H) * (W / 2);
  return <svg className="pyramid" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label}>
    {layers.map((l, i) => {
      const y0 = i * (h + gap), y1 = y0 + h;
      const pts = [[W / 2 - half(y0), y0], [W / 2 + half(y0), y0], [W / 2 + half(y1), y1], [W / 2 - half(y1), y1]];
      return <polygon key={l.label} points={pts.map(([px, py]) => `${f(px)},${f(py)}`).join(' ')} fill={l.color} data-tip-title={l.label} data-tip={l.tip} />;
    })}
  </svg>;
}
