/* ==========================================================================
   Diagrammes du tableau de bord : un titre, la forme et sa légende.
   Valeurs calculées sur le périmètre affiché (école), comme les autres
   widgets ; ajoutés au catalogue (widgets/catalog.jsx).
   Couleurs : les grandeurs et les catégories sans état prennent l'accent et
   ses teintes (accentShade) ; les couleurs d'état ne servent qu'aux états.
   ========================================================================== */

import { num, dec, pct, pct1, dateShort } from '#shared/format.js';
import { PROBLEMS, problem } from '#shared/catalog.js';
import { parc, remontees, scope, index, batimentLabel } from '../core/selectors.js';
import { Donut, Arcs, Gauge, Columns, ComboBars, Pyramid, ChartLegend } from '../ui/charts-shapes.jsx';
import { accentShade, RankBars, SegBar, SegLegend, Multiples } from '../ui/charts-bars.jsx';
import { WidgetHead, WidgetEmpty } from './parts.jsx';

/* Garanties : échue et sous 6 mois sont des états (alerte, échéance proche) ; au-delà, teintes de l'accent */
const GARANTIE_COLORS = { echue: 'var(--crit)', proche: 'var(--warn)', annee: accentShade(2, 3), longue: 'var(--accent)', aucune: 'var(--stock)' };
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
      const parts = PROBLEMS.map((p) => ({ label: p.label, value: list.filter((r) => problem(r.probleme).id === p.id).length }))
        .filter((p) => p.value).sort((a, b) => b.value - a.value).map((p, i, all) => ({ ...p, color: accentShade(i, all.length) }));
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
          <ChartLegend items={parts.map((p) => ({ label: p.label, color: p.color, value: pct(t.total ? p.value / t.total : 0) }))} />
        </div>
      </>;
    },
  },
  {
    type: 'chart.semaines', kind: 'chart', title: 'Remontées par type et par semaine', icon: 'chartBar', color: 'var(--accent)', sizes: ['L', 'XL'], cap: 'remontee.viewAll',
    Body() {
      const rm = remontees();
      const items = rm.problemes.filter((x) => x.values.some(Boolean)).sort((a, b) => b.values.reduce((t, v) => t + v, 0) - a.values.reduce((t, v) => t + v, 0))
        .map((x) => ({ label: x.p.label, values: x.values, tips: x.values.map((v, k) => `${num(v)} la semaine du ${dateShort(rm.weeks[k].from)}`) }));
      return <>
        <WidgetHead title="Remontées par type et par semaine" />
        {items.length ? <Multiples items={items} label={`Remontées par type de problème et par semaine, 12 semaines : ${items.map((x) => `${x.label} ${x.values.reduce((t, v) => t + v, 0)}`).join(', ')}`} />
          : <WidgetEmpty ic="checkCircle" text="Aucune remontée sur 12 semaines" />}
      </>;
    },
  },
  {
    type: 'chart.parcBatiments', kind: 'chart', title: 'Matériels par bâtiment', icon: 'chartBar', color: 'var(--accent)', sizes: ['M', 'L'], cap: 'dashboard.parc',
    Body() {
      const { byBatiment, totals } = parc();
      const max = Math.max(1, ...byBatiment.map((b) => b.total));
      const items = byBatiment.map((b) => ({
        key: b.batiment, label: batimentLabel(b.batiment), short: b.batiment, ratio: b.total / max, color: 'var(--accent)',
        display: pct(totals.total ? b.total / totals.total : 0), tip: `${num(b.total)} matériels\n${num(b.hs)} hors service`,
      }));
      return <>
        <WidgetHead title="Matériels par bâtiment" />
        <Columns items={items} label={`Part du parc par bâtiment : ${items.map((x) => `${x.label} ${x.display}`).join(', ')}`} />
      </>;
    },
  },
  {
    type: 'chart.postes', kind: 'chart', title: 'Postes allumés par bâtiment', icon: 'ring', color: 'var(--accent)', sizes: ['M', 'L'], cap: 'supervision.view',
    Body() {
      const groups = new Map();
      for (const p of scope().postes) {
        const b = index().salle.get(p.salleId)?.batiment;
        if (!b) continue;
        const g = groups.get(b) ?? { total: 0, on: 0 };
        g.total++;
        if (p.allume) g.on++;
        groups.set(b, g);
      }
      const items = [...groups].sort(([a], [b]) => byName(a, b)).map(([b, g], i, all) => ({
        label: batimentLabel(b), ratio: g.on / g.total, color: accentShade(i, all.length), tip: `${num(g.on)} postes allumés sur ${num(g.total)}`,
      }));
      return <>
        <WidgetHead title="Postes allumés par bâtiment" />
        {items.length ? <div className="diagram">
          <Arcs items={items} label={`Postes allumés : ${items.map((x) => `${x.label} ${pct(x.ratio)}`).join(', ')}`} />
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
          <li><span className="key-line" style={{ '--k': 'var(--ink-2)' }} />Moyenne sur 4 trimestres</li>
        </ul>} />
        <ComboBars labels={list.map((q) => q.label)} bars={bars} line={trend} barName="Reçus" lineName="Moyenne sur 4 trimestres" fmtLine={dec}
          label={`Matériels reçus par trimestre, de ${list[0].label} à ${list.at(-1).label}`} />
      </>;
    },
  },
  {
    type: 'chart.garanties', kind: 'chart', title: 'Garanties du parc', icon: 'stack', color: 'var(--warn)', sizes: ['M', 'L'], cap: 'dashboard.parc',
    Body({ size }) {
      const { garantieTranches, totals } = parc();
      const parts = garantieTranches.map((t) => ({ label: t.label, value: t.n, color: GARANTIE_COLORS[t.id] }));
      const label = `Garanties : ${parts.map((p) => `${p.label} ${p.value}`).join(', ')}`;
      if (!totals.total) return <><WidgetHead title="Garanties du parc" /><WidgetEmpty ic="materiel" text="Aucun matériel" /></>;
      if (size === 'M') return <><WidgetHead title="Garanties du parc" /><div className="aging"><SegBar parts={parts} label={label} /><SegLegend parts={parts} /></div></>;
      const layers = parts.filter((p) => p.value).sort((a, b) => a.value - b.value).map((p) => ({ ...p, n: p.value, tip: `${num(p.value)} matériels, ${pct(p.value / totals.total)}` }));
      return <>
        <WidgetHead title="Garanties du parc" />
        <div className="diagram">
          <Pyramid layers={layers} label={label} />
          <ChartLegend items={layers.map((l) => ({ label: l.label, color: l.color, value: num(l.n) }))} />
        </div>
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
      return <>
        <WidgetHead title="Matériels par marque" />
        <RankBars rows={rows.map(([nom, n]) => ({ label: nom, value: n, tip: `${num(n)} matériels, ${pct(n / list.length)}` }))}
          label={`Matériels par marque : ${rows.map(([nom, n]) => `${nom} ${n}`).join(', ')}`} />
      </>;
    },
  },
];
