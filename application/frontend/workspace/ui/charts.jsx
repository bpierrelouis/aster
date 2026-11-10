/* ==========================================================================
   Graphiques SVG / HTML légers
   Règles : traits 2px, marqueurs ≥ 8px avec anneau de surface, grille
   discrète, texte toujours en encre (jamais dans la couleur de série),
   survol avec infobulle sur chaque graphique.
   ========================================================================== */

import { Fragment, useEffect, useRef, useState } from 'react';
import { floatTip } from './tooltips.js';
import { num } from '../core/format.js';

function niceMax(v) {
  if (v <= 0) return 4;
  const steps = [1, 2, 2.5, 5, 10];
  const mag = Math.pow(10, Math.floor(Math.log10(v)));
  for (const s of steps) { const m = s * mag; if (m >= v) return m; }
  return 10 * mag;
}

/**
 * Courbes avec réticule et infobulle, à la taille de leur conteneur (.chart-host).
 * stacked : aires empilées (la première série en bas), l'infobulle donne la valeur de chaque série.
 * @param {{series:{name:string,color:string,values:number[]}[], labels:string[], fmt?:(n:number)=>string, stacked?:boolean}} props
 */
export function LineChart({ series, labels, fmt = num, stacked = false }) {
  const ref = useRef(null);
  const [box, setBox] = useState(null); // { w, h } mesurés
  const [hover, setHover] = useState(null); // index survolé

  useEffect(() => {
    const host = ref.current;
    const measure = () => {
      const w = host.clientWidth, h = host.clientHeight;
      if (w < 40 || h < 40) return;
      setBox((b) => (b?.w === w && b?.h === h ? b : { w, h }));
    };
    const ro = new ResizeObserver(measure);
    ro.observe(host);
    measure();
    return () => ro.disconnect();
  }, []);

  // Hauteur de chaque série : cumulée si empilée
  const tops = stacked ? series.map((_, k) => labels.map((__, i) => series.slice(0, k + 1).reduce((t, s) => t + s.values[i], 0))) : series.map((s) => s.values);
  let svg = null, geo = null;
  if (box) {
    const { w, h } = box;
    const pad = { l: 30, r: stacked ? 10 : 34, t: 10, b: 22 };
    const n = labels.length;
    const max = niceMax(Math.max(...tops.flat()) * 1.08);
    const X = (i) => pad.l + (i * (w - pad.l - pad.r)) / (n - 1);
    const Y = (v) => pad.t + (1 - v / max) * (h - pad.t - pad.b);
    const points = (values) => values.map((v, i) => [X(i), Y(v)]);
    const path = (pts) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join('');
    const line = (values) => path(points(values));
    geo = { X, Y, n };
    svg = <svg width={w} height={h} className="chart-svg" role="img" aria-label={series.map((s) => s.name).join(', ')}>
      {[0, max / 2, max].map((t, k) => <Fragment key={k}>
        <line x1={pad.l} x2={w - pad.r} y1={Y(t)} y2={Y(t)} className="ch-grid" />
        <text x={pad.l - 8} y={Y(t) + 4} className="ch-tick" textAnchor="end">{fmt(t)}</text>
      </Fragment>)}
      {[0, Math.floor((n - 1) / 2), n - 1].map((i, k) => (
        <text key={k} x={X(i)} y={h - 4} className="ch-tick" textAnchor={i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'}>{labels[i]}</text>
      ))}
      {stacked && series.map((s, k) => {
        const floor = k ? points(tops[k - 1]).reverse() : [[X(n - 1), Y(0)], [X(0), Y(0)]];
        return <Fragment key={s.name}>
          <path d={`${path([...points(tops[k]), ...floor])}Z`} fill={s.color} opacity=".82" />
          <path d={line(tops[k])} fill="none" stroke={s.color} strokeWidth="2" strokeLinejoin="round" />
        </Fragment>;
      })}
      {!stacked && series.map((s) => {
        const d = line(s.values);
        const last = s.values[n - 1];
        return <Fragment key={s.name}>
          <path d={`${d}L${X(n - 1)} ${Y(0)}L${X(0)} ${Y(0)}Z`} fill={s.color} opacity=".09" />
          <path d={d} fill="none" stroke={s.color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
          <circle cx={X(n - 1)} cy={Y(last)} r="4.5" fill={s.color} className="ch-dot" />
          <text x={X(n - 1) + 9} y={Y(last) + 4} className="ch-end">{fmt(last)}</text>
        </Fragment>;
      })}
      <line className="ch-cross" y1={pad.t} y2={h - pad.b} x1={hover == null ? 0 : X(hover)} x2={hover == null ? 0 : X(hover)} visibility={hover == null ? 'hidden' : 'visible'} />
      <g className="ch-hover">
        {hover != null && series.map((s, k) => <circle key={s.name} cx={X(hover)} cy={Y(tops[k][hover])} r="4.5" fill={s.color} className="ch-dot" />)}
      </g>
    </svg>;
  }

  const onMove = (e) => {
    if (!geo) return;
    const r = ref.current.getBoundingClientRect();
    const { X, Y, n } = geo;
    let i = Math.round(((e.clientX - r.left - X(0)) / (X(n - 1) - X(0))) * (n - 1));
    i = Math.max(0, Math.min(n - 1, i));
    setHover(i);
    floatTip({ title: labels[i], rows: series.map((s) => ({ color: s.color, name: s.name, value: fmt(s.values[i]) })) },
      r.left + X(i), r.top + Math.min(...tops.map((t) => Y(t[i]))));
  };
  const onLeave = () => { floatTip(null); setHover(null); };

  return <div ref={ref} className="chart-host" onPointerMove={onMove} onPointerLeave={onLeave}>{svg}</div>;
}

/** Sparkline : ligne en teinte discrète, point courant accentué */
export function Sparkline({ values, w = 120, h = 36, color = 'var(--c1)', label = '' }) {
  if (!values.length) return null;
  const max = Math.max(...values) || 1;
  const min = Math.min(...values);
  const span = max - min || 1;
  const X = (i) => 4 + (i * (w - 10)) / (values.length - 1);
  const Y = (v) => 5 + (1 - (v - min) / span) * (h - 10);
  const d = values.map((v, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)} ${Y(v).toFixed(1)}`).join('');
  const li = values.length - 1;
  return <svg className="spark" width={w} height={h} viewBox={`0 0 ${w} ${h}`} role="img" aria-label={label}>
    <path d={`${d}L${X(li)} ${h}L${X(0)} ${h}Z`} fill={color} opacity=".08" />
    <path d={d} fill="none" stroke={color} strokeOpacity=".55" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx={X(li)} cy={Y(values[li])} r="4" fill={color} className="ch-dot" />
  </svg>;
}
