/* ==========================================================================
   Barres du tableau de bord, en HTML et CSS (styles/diagrams.css) :
   barres classées, barres à repère, barre segmentée et sa légende,
   colonnes (divergentes autour de zéro), petits multiples, micro-barres,
   frise d'ancienneté.
   Mêmes règles que ui/charts.tsx : texte en encre, infobulle (data-tip) sur
   chaque mesure, libellé accessible sur chaque diagramme. Les grandeurs sont
   en couleur d'accent ; les couleurs d'état ne servent qu'aux états.
   ========================================================================== */

import type { CSSProperties, Key } from 'react';
import { num, pct } from '#shared/format.ts';
import type { ChartPart, NumberFormat } from './charts.tsx';

/** Ligne de barres classées (RankBars) */
export interface RankRow {
  key?: Key;
  label: string;
  value: number;
  tip?: string;
  color?: string;
}

/** Ligne de barres à repère (BulletRows) */
export interface BulletRow {
  label: string;
  value: number;
  detail: string;
  tip: string;
}

/** Repère commun des barres à repère (moyenne) */
export interface BulletMark {
  value: number;
  label: string;
}

/** Colonne (VBars) ; valeur négative sous l'axe */
export interface VBarItem {
  key: Key;
  label: string;
  value: number;
  color?: string;
  tip: string;
  tipTitle?: string;
}

/** Série d'un petit multiple : une valeur et une infobulle par période */
export interface MultipleItem {
  label: string;
  values: number[];
  tips: string[];
}

/** Point de la frise d'ancienneté, en jours */
export interface AgePoint {
  key: Key;
  days: number;
  tip: string;
  tipTitle?: string;
}

/** Teinte n° i sur n de l'accent, de la plus soutenue (i = 0) à la plus claire */
export const accentShade = (i: number, n: number) => (i === 0 || n <= 1 ? 'var(--accent)'
  : `color-mix(in srgb, var(--accent) ${Math.round(100 - (i * 64) / (n - 1))}%, var(--ramp-base))`);

const share = (v: number, max: number) => `${max ? Math.min(100, (Math.max(v, 0) / max) * 100) : 0}%`;

/** Barres horizontales classées */
export function RankBars({ rows, label, fmt = num, color = 'var(--accent)' }: { rows: RankRow[]; label: string; fmt?: NumberFormat; color?: string }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return <ul className="rbars" role="img" aria-label={label}>{rows.map((r) => (
    <li key={r.key ?? r.label} className="rbar" data-tip-title={r.label} data-tip={r.tip ?? fmt(r.value)}>
      <span className="rbar-label">{r.label}</span>
      <span className="rbar-track"><span className="rbar-fill" style={{ width: share(r.value, max), '--c': r.color ?? color } as CSSProperties} /></span>
      <b className="rbar-value">{fmt(r.value)}</b>
    </li>))}</ul>;
}

/**
 * Barres à repère : valeur de chaque ligne sur une même échelle (0 à max), détail sous la valeur,
 * repère commun facultatif (moyenne).
 */
export function BulletRows({ rows, max, fmt, mark = null, label, color = 'var(--accent)' }: { rows: BulletRow[]; max: number; fmt: NumberFormat; mark?: BulletMark | null; label: string; color?: string }) {
  return <ul className="bullets" role="img" aria-label={label} style={{ '--c': color } as CSSProperties}>
    {mark && <li className="bullet bullet--head" aria-hidden="true"><span /><span className="bullet-axis"><span className="bullet-mark-label" style={{ left: share(mark.value, max) }}>{mark.label}</span></span><span /></li>}
    {rows.map((r) => <li key={r.label} className="bullet" data-tip-title={r.label} data-tip={r.tip}>
      <span className="bullet-label">{r.label}</span>
      <span className="bullet-track">
        <span className="bullet-fill" style={{ width: share(r.value, max) }} />
        {mark && <span className="bullet-mark" style={{ left: share(mark.value, max) }} />}
      </span>
      <span className="bullet-value"><b>{fmt(r.value)}</b><small>{r.detail}</small></span>
    </li>)}
  </ul>;
}

/** Barre segmentée : un tout et ses parts ({ label, value, color }) ; les chiffres sont dans SegLegend */
export function SegBar({ parts, label }: { parts: ChartPart[]; label: string }) {
  const total = parts.reduce((t, p) => t + p.value, 0);
  return <div className="segbar" role="img" aria-label={label}>{parts.filter((p) => p.value).map((p) => (
    <span key={p.label} className="segbar-part" style={{ flexGrow: p.value, '--c': p.color } as CSSProperties} data-tip-title={p.label} data-tip={`${num(p.value)}, ${pct(p.value / total)}`} />
  ))}</div>;
}

/** Légende d'une barre segmentée : chiffre en grand, repère de couleur et libellé */
export function SegLegend({ parts }: { parts: ChartPart[] }) {
  return <ul className="seglegend">{parts.map((p) => (
    <li key={p.label}><b>{num(p.value)}</b><span><span className="key-dot" style={{ '--k': p.color } as CSSProperties} />{p.label}</span></li>
  ))}</ul>;
}

/**
 * Colonnes sur la hauteur disponible.
 * Valeurs négatives sous l'axe (colonnes divergentes) ; une étiquette d'axe toutes les `every` colonnes.
 */
export function VBars({ items, label, every = 1 }: { items: VBarItem[]; label: string; every?: number }) {
  const hi = Math.max(0, ...items.map((it) => it.value)), lo = Math.min(0, ...items.map((it) => it.value));
  const span = hi - lo || 1;
  const n = items.length;
  return <div className="vbars" role="img" aria-label={label} style={{ '--z': `${(-lo / span) * 100}%` } as CSSProperties}>
    <div className={`vbars-plot${lo < 0 ? ' has-zero' : ''}`}>{items.map((it) => (
      <span key={it.key} className="vbar" data-tip-title={it.tipTitle ?? it.label} data-tip={it.tip}>
        <span className={`vbar-fill${it.value < 0 ? ' is-neg' : ''}${it.value ? '' : ' is-zero'}`} style={{ '--h': `${(Math.abs(it.value) / span) * 100}%`, '--c': it.color ?? 'var(--accent)' } as CSSProperties} />
      </span>))}</div>
    <div className="vbars-axis">{items.map((it, i) => <span key={it.key}>{(n - 1 - i) % every === 0 ? it.label : ''}</span>)}</div>
  </div>;
}

/** Petits multiples : une série par case, toutes sur la même échelle */
export function Multiples({ items, label }: { items: MultipleItem[]; label: string }) {
  const max = Math.max(1, ...items.flatMap((it) => it.values));
  return <ul className="multiples" role="img" aria-label={label}>{items.map((it) => (
    <li key={it.label}>
      <span className="mult-head"><span className="mult-name">{it.label}</span><b>{num(it.values.reduce((t, v) => t + v, 0))}</b></span>
      <span className="mult-plot">{it.values.map((v, i) => (
        <span key={i} className="mult-col" data-tip-title={it.label} data-tip={it.tips[i]}><span className="mult-bar" style={{ height: share(v, max) }} /></span>
      ))}</span>
    </li>))}</ul>;
}

/** Micro-barre d'une valeur dans une liste */
export const MicroBar = ({ value, max, color }: { value: number; max: number; color: string }) => <span className="microbar" aria-hidden="true"><span style={{ width: share(value, max), '--c': color } as CSSProperties} /></span>;

/** Frise : un point par élément sur une échelle de jours, graduations et limites de tranches */
export function AgeStrip({ points, max, limits = [], ticks = [], label }: { points: AgePoint[]; max: number; limits?: number[]; ticks?: number[]; label: string }) {
  const x = (d: number) => share(d, max);
  return <div className="agestrip" role="img" aria-label={label}>
    <span className="agestrip-line" />
    {limits.map((d) => <span key={`l${d}`} className="agestrip-limit" style={{ left: x(d) }} />)}
    {points.map((p) => <span key={p.key} className="agestrip-dot" style={{ left: x(p.days) }} data-tip-title={p.tipTitle} data-tip={p.tip} />)}
    {ticks.map((d) => <span key={`t${d}`} className="agestrip-tick" style={{ left: x(d) }}>{num(d)} j</span>)}
  </div>;
}
