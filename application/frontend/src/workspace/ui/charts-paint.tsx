import { Fragment } from 'react';

// Une peinture continue : teinte de la serie, reflet doux et transparence legere.
const STOPS: [number, string, string][] = [[0, 'light', 'top'], [40, 'base', 'mid'], [100, 'depth', 'bottom']];

export const chartPaint = (id: string, index = 0) => `url(#${id}-${index})`;

export function ChartPaintDefs({ id, colors, area = false }: { id: string; colors: string[]; area?: boolean }) {
  return <defs>{colors.map((color, index) => <Fragment key={index}><linearGradient id={`${id}-${index}`} x1="0" y1="0" x2=".18" y2="1" style={{ color }}>
    {STOPS.map(([offset, tone, opacity]) => <stop key={offset} offset={`${offset}%`}
      stopColor={`var(--paint-${tone}, currentColor)`} stopOpacity={`var(--paint-${opacity}-opacity, 1)`} />)}
  </linearGradient>
    {area && <linearGradient id={`${id}-${index}-area`} x1="0" y1="0" x2="0" y2="1" style={{ color }}>
      <stop offset="0%" stopColor="currentColor" stopOpacity=".2" />
      <stop offset="100%" stopColor="currentColor" stopOpacity=".01" />
    </linearGradient>}
  </Fragment>)}</defs>;
}
