/* ==========================================================================
   Graphiques SVG / HTML légers
   Règles : traits 2px, marqueurs ≥ 8px avec anneau de surface, grille
   discrète, texte toujours en encre (jamais dans la couleur de série),
   survol avec infobulle sur chaque graphique.
   ========================================================================== */

import { Fragment, useEffect, useId, useRef, useState } from 'react';
import type { PointerEvent, ReactNode } from 'react';
import { floatTip } from './tooltips.ts';
import { num } from '#shared/format.ts';
import { ChartPaintDefs, chartPaint } from './charts-paint.tsx';

/** Mise en forme d'une valeur numérique (format.ts : num, pct, dec…) */
export type NumberFormat = (n: number) => string;

/** Part d'un tout : libellé, valeur, couleur (barre segmentée, anneau, légende) */
export interface ChartPart {
  label: string;
  value: number;
  color: string;
}

/** Série d'une courbe : une valeur par libellé de l'axe */
export interface LineSeries {
  name: string;
  color: string;
  values: number[];
}

function niceMax(v: number) {
  if (v <= 0) return 4;
  const steps = [1, 2, 2.5, 5, 10];
  const mag = Math.pow(10, Math.floor(Math.log10(v)));
  for (const s of steps) { const m = s * mag; if (m >= v) return m; }
  return 10 * mag;
}

/**
 * Courbes avec réticule et infobulle, à la taille de leur conteneur (.chart-host).
 */
export function LineChart({ series, labels, fmt = num }: { series: LineSeries[]; labels: string[]; fmt?: NumberFormat }) {
  const paintId = useId();
  const ref = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<{ w: number; h: number } | null>(null); // { w, h } mesurés
  const [hover, setHover] = useState<number | null>(null); // index survolé

  useEffect(() => {
    const host = ref.current!;
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

  const tops = series.map((s) => s.values);
  let svg: ReactNode = null, geo: { X: (i: number) => number; Y: (v: number) => number; n: number } | null = null;
  if (box) {
    const { w, h } = box;
    const pad = { l: 30, r: 34, t: 10, b: 22 };
    const n = labels.length;
    const max = niceMax(Math.max(...tops.flat()) * 1.08);
    const X = (i: number) => pad.l + (i * (w - pad.l - pad.r)) / (n - 1);
    const Y = (v: number) => pad.t + (1 - v / max) * (h - pad.t - pad.b);
    const points = (values: number[]) => values.map((v, i) => [X(i), Y(v)]);
    const path = (pts: number[][]) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join('');
    const line = (values: number[]) => path(points(values));
    geo = { X, Y, n };
    svg = <svg width={w} height={h} className="chart-svg" role="img" aria-label={series.map((s) => s.name).join(', ')}>
      <ChartPaintDefs id={paintId} colors={series.map((s) => s.color)} area />
      {[0, max / 2, max].map((t, k) => <Fragment key={k}>
        <line x1={pad.l} x2={w - pad.r} y1={Y(t)} y2={Y(t)} className="ch-grid" />
        <text x={pad.l - 8} y={Y(t) + 4} className="ch-tick" textAnchor="end">{fmt(t)}</text>
      </Fragment>)}
      {[0, Math.floor((n - 1) / 2), n - 1].map((i, k) => (
        <text key={k} x={X(i)} y={h - 4} className="ch-tick" textAnchor={i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'}>{labels[i]}</text>
      ))}
      {series.map((s, k) => {
        const d = line(s.values);
        const last = s.values[n - 1];
        return <Fragment key={s.name}>
          <path d={`${d}L${X(n - 1)} ${Y(0)}L${X(0)} ${Y(0)}Z`} fill={`url(#${paintId}-${k}-area)`} />
          <path d={d} fill="none" stroke={chartPaint(paintId, k)} className="chart-luminous" style={{ color: s.color }} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
          <circle cx={X(n - 1)} cy={Y(last)} r="4.5" fill={chartPaint(paintId, k)} className="ch-dot" />
          <text x={X(n - 1) + 9} y={Y(last) + 4} className="ch-end">{fmt(last)}</text>
        </Fragment>;
      })}
      <line className="ch-cross" y1={pad.t} y2={h - pad.b} x1={hover == null ? 0 : X(hover)} x2={hover == null ? 0 : X(hover)} visibility={hover == null ? 'hidden' : 'visible'} />
      <g className="ch-hover">
        {hover != null && series.map((s, k) => <circle key={s.name} cx={X(hover)} cy={Y(tops[k][hover])} r="4.5" fill={chartPaint(paintId, k)} className="ch-dot" />)}
      </g>
    </svg>;
  }

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!geo) return;
    const r = ref.current!.getBoundingClientRect();
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

/** Sparkline : tendance en encre discrète, seul le point courant prend la couleur (état ou accent) */
export function Sparkline({ values, w = 120, h = 36, color = 'var(--accent)', label = '' }: { values: number[]; w?: number; h?: number; color?: string; label?: string }) {
  const paintId = useId();
  if (!values.length) return null;
  const max = Math.max(...values) || 1;
  const min = Math.min(...values);
  const span = max - min || 1;
  const X = (i: number) => 4 + (i * (w - 10)) / (values.length - 1);
  const Y = (v: number) => 5 + (1 - (v - min) / span) * (h - 10);
  const d = values.map((v, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)} ${Y(v).toFixed(1)}`).join('');
  const li = values.length - 1;
  return <svg className="spark" width={w} height={h} viewBox={`0 0 ${w} ${h}`} role="img" aria-label={label}>
    <ChartPaintDefs id={paintId} colors={[color, 'var(--ink-3)']} area />
    <path d={`${d}L${X(li)} ${h}L${X(0)} ${h}Z`} className="spark-area" style={{ fill: `url(#${paintId}-1-area)` }} />
    <path d={d} className="spark-line chart-luminous" style={{ stroke: chartPaint(paintId, 1), color: 'var(--ink-3)' }} />
    <circle cx={X(li)} cy={Y(values[li])} r="4" fill={chartPaint(paintId)} className="ch-dot" />
  </svg>;
}
