/* ==========================================================================
   Diagrammes du tableau de bord : un titre, la forme et sa légende.
   Valeurs calculées sur le périmètre affiché (école), comme les autres
   widgets ; ajoutés au catalogue (widgets/catalog.jsx).
   ========================================================================== */

import { num, dec, pct, pct1, dateShort, DAY } from '#shared/format.js';
import { PROBLEMS, problem } from '#shared/catalog.js';
import { parc, remontees, scope, index, batimentLabel } from '../core/selectors.js';
import { LineChart } from '../ui/charts.jsx';
import { Donut, Arcs, Gauge, Columns, ComboBars, Pyramid, ChartLegend } from '../ui/charts-shapes.jsx';
import { WidgetHead, WidgetEmpty } from './parts.jsx';

/* Catégories sans couleur propre (problèmes, bâtiments) : ordre fixe de la palette catégorielle */
const PALETTE = ['var(--c1)', 'var(--c5)', 'var(--c3)', 'var(--c2)', 'var(--c6)', 'var(--c4)', 'var(--c7)', 'var(--c8)'];
const color = (i) => PALETTE[i % PALETTE.length];
const byName = (a, b) => a.localeCompare(b, 'fr', { numeric: true });

/** Trimestres civils, du plus ancien au trimestre en cours */
function quarters(count, now = new Date()) {
  const list = [];
  let y = now.getFullYear(), q = Math.floor(now.getMonth() / 3);
  for (let i = 0; i < count; i++) {
    list.unshift({ label: `T${q + 1} ${String(y).slice(2)}`, from: new Date(y, q * 3, 1).getTime(), to: new Date(y, q * 3 + 3, 1).getTime() });
    if (--q < 0) { q = 3; y--; }
  }
  return list;
}

export const DIAGRAMS = [
  {
    type: 'chart.problemes', kind: 'chart', title: 'Types de problème', icon: 'ring', color: 'var(--accent)', sizes: ['M', 'L'], cap: 'remontee.viewAll',
    Body() {
      const list = remontees().visible;
      const parts = PROBLEMS.map((p, i) => ({ label: p.label, value: list.filter((r) => problem(r.probleme).id === p.id).length, color: color(i) }))
        .filter((p) => p.value).sort((a, b) => b.value - a.value);
      return <>
        <WidgetHead title="Types de problème" />
        {list.length ? <div className="diagram">
          <Donut parts={parts} label={`Remontées par type de problème : ${parts.map((p) => `${p.label} ${p.value}`).join(', ')}`}
            center={<><b>{num(list.length)}</b><span>remontées</span></>} />
          <ChartLegend items={parts.map((p) => ({ label: p.label, color: p.color, value: pct(p.value / list.length) }))} />
        </div> : <WidgetEmpty ic="checkCircle" text="Aucune remontée" />}
      </>;
    },
  },
  {
    type: 'chart.localisation', kind: 'chart', title: 'En salle et en stock', icon: 'ring', color: 'var(--accent)', sizes: ['M', 'L'], cap: 'dashboard.parc',
    Body() {
      const { totals: t } = parc();
      const parts = [
        { label: 'En salle', value: t.affectes, color: 'var(--accent)' },
        { label: 'En stock', value: t.stock, color: 'var(--stock)', explode: true },
      ];
      return <>
        <WidgetHead title="En salle et en stock" />
        <div className="diagram">
          <Donut parts={parts} hole={0} label={`${t.affectes} matériels en salle, ${t.stock} en stock`} />
          <ChartLegend items={parts.map((p) => ({ label: p.label, color: p.color, value: `${num(p.value)} · ${pct(t.total ? p.value / t.total : 0)}` }))} />
        </div>
      </>;
    },
  },
  {
    type: 'chart.semaines', kind: 'chart', title: 'Remontées par type et par semaine', icon: 'chartLine', color: 'var(--accent)', sizes: ['L', 'XL'], cap: 'remontee.viewAll',
    Body() {
      const rm = remontees();
      const start = rm.weeks[0].from;
      const series = PROBLEMS.map((p, i) => ({ name: p.label, color: color(i), values: rm.weeks.map(() => 0) }));
      for (const r of rm.visible) {
        const w = Math.floor((r.createdAt - start) / (7 * DAY));
        if (w >= 0 && w < rm.weeks.length) series[PROBLEMS.indexOf(problem(r.probleme))].values[w]++;
      }
      const used = series.filter((s) => s.values.some(Boolean));
      return <>
        <WidgetHead title="Remontées par type et par semaine" />
        {used.length ? <>
          <LineChart stacked labels={rm.weeks.map((w) => dateShort(w.from))} series={used} />
          <ul className="legend legend--inline legend--wrap">{used.map((s) => <li key={s.name}><span className="key-dot" style={{ '--k': s.color }} />{s.name}</li>)}</ul>
        </> : <WidgetEmpty ic="checkCircle" text="Aucune remontée sur 12 semaines" />}
      </>;
    },
  },
  {
    type: 'chart.parcBatiments', kind: 'chart', title: 'Matériels par bâtiment', icon: 'chartBar', color: 'var(--accent)', sizes: ['M', 'L'], cap: 'dashboard.parc',
    Body() {
      const { byBatiment, totals } = parc();
      const max = Math.max(1, ...byBatiment.map((b) => b.total));
      const items = byBatiment.map((b, i) => ({
        key: b.batiment, label: batimentLabel(b.batiment), short: b.batiment, ratio: b.total / max, color: color(i),
        display: pct(totals.total ? b.total / totals.total : 0), tip: `${num(b.total)} matériels\n${num(b.hs)} hors service`,
      }));
      return <>
        <WidgetHead title="Matériels par bâtiment" />
        <Columns items={items} label={`Part du parc par bâtiment : ${items.map((x) => `${x.label} ${x.display}`).join(', ')}`} />
      </>;
    },
  },
  {
    type: 'chart.postes', kind: 'chart', title: 'Postes connectés par bâtiment', icon: 'ring', color: 'var(--accent)', sizes: ['M', 'L'], cap: 'supervision.view',
    Body() {
      const groups = new Map();
      for (const p of scope().postes) {
        const b = index().salle.get(p.salleId)?.batiment;
        if (!b) continue;
        const g = groups.get(b) ?? { total: 0, on: 0 };
        g.total++;
        if (p.connecte) g.on++;
        groups.set(b, g);
      }
      const items = [...groups].sort(([a], [b]) => byName(a, b)).map(([b, g], i) => ({
        label: batimentLabel(b), ratio: g.on / g.total, color: color(i), tip: `${num(g.on)} postes connectés sur ${num(g.total)}`,
      }));
      return <>
        <WidgetHead title="Postes connectés par bâtiment" />
        {items.length ? <div className="diagram">
          <Arcs items={items} label={`Postes connectés : ${items.map((x) => `${x.label} ${pct(x.ratio)}`).join(', ')}`} />
          <ChartLegend items={items.map((x) => ({ label: x.label, color: x.color, value: pct(x.ratio) }))} />
        </div> : <WidgetEmpty ic="desktop" text="Aucun poste supervisé" />}
      </>;
    },
  },
  {
    type: 'chart.receptions', kind: 'chart', title: 'Réceptions de matériel', icon: 'chartBar', color: 'var(--accent)', sizes: ['L', 'XL'], cap: 'dashboard.parc',
    Body() {
      const list = quarters(12);
      const bars = list.map((q) => scope().materiels.filter((m) => m.dateReception >= q.from && m.dateReception < q.to).length);
      const trend = bars.map((_, i) => { const w = bars.slice(Math.max(0, i - 3), i + 1); return w.reduce((t, v) => t + v, 0) / w.length; });
      return <>
        <WidgetHead title="Réceptions de matériel" right={<ul className="legend legend--inline">
          <li><span className="key-dot" style={{ '--k': 'var(--accent)' }} />Reçus</li>
          <li><span className="key-line" style={{ '--k': 'var(--c2)' }} />Moyenne sur 4 trimestres</li>
        </ul>} />
        <ComboBars labels={list.map((q) => q.label)} bars={bars} line={trend} barName="Reçus" lineName="Moyenne sur 4 trimestres" fmtLine={dec}
          label={`Matériels reçus par trimestre, de ${list[0].label} à ${list.at(-1).label}`} />
      </>;
    },
  },
  {
    type: 'chart.garanties', kind: 'chart', title: 'Garanties du parc', icon: 'stack', color: 'var(--warn)', sizes: ['M', 'L'], cap: 'dashboard.parc',
    Body() {
      const now = Date.now();
      const buckets = [
        { label: 'Échue', color: 'var(--crit)', until: now },
        { label: 'Sous 6 mois', color: 'var(--warn)', until: now + 182 * DAY },
        { label: '6 à 12 mois', color: 'var(--c5)', until: now + 365 * DAY },
        { label: 'Plus d’un an', color: 'var(--ok)', until: Infinity },
        { label: 'Non renseignée', color: 'var(--stock)', until: null },
      ].map((b) => ({ ...b, n: 0 }));
      const list = scope().materiels;
      for (const m of list) (m.garantieFin ? buckets.find((b) => b.until !== null && m.garantieFin <= b.until) : buckets.at(-1)).n++;
      const layers = buckets.filter((b) => b.n).sort((a, b) => a.n - b.n)
        .map((b) => ({ ...b, tip: `${num(b.n)} matériels, ${pct(b.n / list.length)}` }));
      return <>
        <WidgetHead title="Garanties du parc" />
        {list.length ? <div className="diagram">
          <Pyramid layers={layers} label={`Garanties : ${layers.map((l) => `${l.label} ${l.n}`).join(', ')}`} />
          <ChartLegend items={layers.map((l) => ({ label: l.label, color: l.color, value: num(l.n) }))} />
        </div> : <WidgetEmpty ic="materiel" text="Aucun matériel" />}
      </>;
    },
  },
  {
    type: 'chart.disponibilite', kind: 'chart', title: 'Taux de disponibilité', icon: 'gauge', color: 'var(--accent)', sizes: ['S', 'M'], cap: 'dashboard.parc',
    Body() {
      const { totals: t } = parc();
      const ratio = t.total ? t.ok / t.total : 0;
      return <>
        <WidgetHead title="Taux de disponibilité" />
        <Gauge ratio={ratio} value={pct1(ratio)} caption={`${num(t.hs)} hors service`} label={`${pct1(ratio)} du parc en service`} />
      </>;
    },
  },
  {
    type: 'chart.marques', kind: 'chart', title: 'Matériels par marque', icon: 'chartBar', color: 'var(--accent)', sizes: ['M', 'L'], cap: 'dashboard.parc',
    Body({ size }) {
      const list = scope().materiels;
      const counts = new Map();
      for (const m of list) { const k = m.marque || 'Non renseignée'; counts.set(k, (counts.get(k) ?? 0) + 1); }
      const rows = [...counts].sort((a, b) => b[1] - a[1] || byName(a[0], b[0])).slice(0, size === 'M' ? 3 : 8);
      const max = rows[0]?.[1] || 1;
      return <>
        <WidgetHead title="Matériels par marque" />
        <ul className="hbars hbars--plain">{rows.map(([nom, n]) => (
          <li key={nom} className="hbar" data-tip-title={nom} data-tip={`${num(n)} matériels, ${pct(n / list.length)}`}>
            <span className="hbar-label">{nom}</span>
            <span className="hbar-track"><span className="hbar-fill" style={{ width: `${(n / max) * 100}%` }} /></span>
            <b className="hbar-value">{num(n)}</b>
          </li>))}</ul>
      </>;
    },
  },
];
