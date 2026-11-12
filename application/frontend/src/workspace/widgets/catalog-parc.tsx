/* ==========================================================================
   Widgets du parc issus des maquettes du tableau de bord (design/maquettes) :
   part hors service par bâtiment, hors service par type, matrice hors
   service, échéances de garantie, salles à surveiller ; installation
   physique des salles (matériels à déplacer, avancement par salle).
   Couleurs : le rouge des matériels hors service et le jaune des remontées
   en attente sont des couleurs d'état ; l'accent sert aux autres grandeurs.
   ========================================================================== */

import { Link } from 'react-router';
import { num, pct, pct1, monthShort, monthYear } from '#shared/format.ts';
import { DEVICE_TYPES } from '#shared/catalog.ts';
import { parc, batimentLabel } from '../core/selectors.ts';
import { installations } from '../core/installations.ts';
import { BulletRows, RankBars, VBars, MicroBar } from '../ui/charts-bars.tsx';
import { HeatMatrix, HeatLegend } from '../ui/charts-heat.tsx';
import { WidgetHead, WidgetEmpty, KpiBody, KpiSub, Progress, alertClass } from './parts.tsx';
import type { CSSProperties } from 'react';
import type { WidgetDef } from './catalog.tsx';

/** Échelle arrondie au-dessus d'un ratio (2 %, 5 %, 10 %…), pour des barres comparables d'un écran à l'autre */
const ratioScale = (v: number) => [.02, .05, .1, .2, .5, 1].find((s) => s >= v) ?? 1;
const SOON = 'var(--warn)';
const LATER = 'color-mix(in srgb, var(--accent) 38%, var(--ramp-base))';

export const PARC_WIDGETS: WidgetDef[] = [
  {
    type: 'chart.hsBatiments', kind: 'chart', title: 'Part hors service par bâtiment', icon: 'chartBar', color: 'var(--crit)', sizes: ['L', 'XL'], cap: 'dashboard.parc',
    Body() {
      const { byBatiment, stock, totals } = parc();
      const rows = [...byBatiment.map((b) => ({ ...b, label: batimentLabel(b.batiment) })), { ...stock, label: 'Stock' }].filter((r) => r.total)
        .map((r) => ({ label: r.label, value: r.hs / r.total, detail: `${num(r.hs)} sur ${num(r.total)}`, tip: `${num(r.hs)} hors service sur ${num(r.total)} matériels` }));
      const mean = totals.total ? totals.hs / totals.total : 0;
      return <>
        <WidgetHead title="Part hors service par bâtiment" />
        {rows.length ? <BulletRows rows={rows} max={ratioScale(Math.max(mean, ...rows.map((r) => r.value)) * 1.1)} fmt={pct1} color="var(--crit)"
          mark={{ value: mean, label: `Moyenne de l’école ${pct1(mean)}` }}
          label={`Part hors service : ${rows.map((r) => `${r.label} ${pct1(r.value)}`).join(', ')} ; moyenne ${pct1(mean)}`} />
          : <WidgetEmpty ic="materiel" text="Aucun matériel" />}
      </>;
    },
  },
  {
    type: 'chart.hsTypes', kind: 'chart', title: 'Hors service par type', icon: 'chartBar', color: 'var(--crit)', sizes: ['M', 'L'], cap: 'dashboard.parc',
    Body({ size }) {
      const { byType } = parc();
      const rows = DEVICE_TYPES.map((t) => ({ key: t.id, label: t.plural, value: byType[t.id].hs, tip: `${num(byType[t.id].hs)} sur ${num(byType[t.id].total)}, ${pct(byType[t.id].total ? byType[t.id].hs / byType[t.id].total : 0)}` }))
        .filter((r) => r.value).sort((a, b) => b.value - a.value).slice(0, size === 'M' ? 3 : 8);
      return <>
        <WidgetHead title="Hors service par type" />
        {rows.length ? <RankBars rows={rows} color="var(--crit)" label={`Matériels hors service par type : ${rows.map((r) => `${r.label} ${r.value}`).join(', ')}`} />
          : <WidgetEmpty ic="checkCircle" text="Tout le parc est en service" />}
      </>;
    },
  },
  {
    type: 'chart.matriceHs', kind: 'chart', title: 'Hors service par type et par bâtiment', icon: 'widgets', color: 'var(--crit)', sizes: ['L', 'XL'], cap: 'dashboard.parc',
    Body() {
      const { matrix } = parc();
      const cols = matrix.cols.map((b) => b ?? 'Stock');
      const rows = matrix.rows.map((r) => ({ label: r.t.plural, cells: r.cells }));
      return <>
        <WidgetHead title="Hors service par type et par bâtiment" right={<HeatLegend tone="crit" />} />
        {rows.length ? <HeatMatrix cols={cols} rows={rows} tone="crit"
          tip={(r, j, v) => `${v ? num(v) : 'Aucun'} hors service, ${matrix.cols[j] ? batimentLabel(matrix.cols[j]).toLowerCase() : 'stock'}`}
          label={`Matériels hors service par type et par bâtiment : ${rows.map((r) => `${r.label} ${r.cells.reduce((t, v) => t + v, 0)}`).join(', ')}`} />
          : <WidgetEmpty ic="checkCircle" text="Tout le parc est en service" />}
      </>;
    },
  },
  {
    type: 'chart.echeances', kind: 'chart', title: 'Échéances de garantie', icon: 'calendarWarn', color: 'var(--warn)', sizes: ['M', 'L', 'XL'], cap: 'dashboard.parc',
    Body({ size }) {
      const { echeances } = parc();
      const items = echeances.map((e, i) => ({ key: e.from, label: monthShort(e.from), value: e.n, color: i < 6 ? SOON : LATER, tipTitle: monthYear(e.from), tip: `${num(e.n)} fin${e.n > 1 ? 's' : ''} de garantie` }));
      const legend = <ul className="legend legend--inline">
        <li><span className="key-dot" style={{ '--k': SOON } as CSSProperties} />Sous 6 mois</li>
        <li><span className="key-dot" style={{ '--k': LATER } as CSSProperties} />6 à 12 mois</li>
      </ul>;
      return <>
        <WidgetHead title="Échéances de garantie" right={size === 'M' ? null : legend} />
        <VBars items={items} every={size === 'M' ? 2 : 1} label={`Fins de garantie par mois, de ${monthYear(echeances[0].from)} à ${monthYear(echeances.at(-1)!.from)} : ${items.map((it) => it.value).join(', ')}`} />
      </>;
    },
  },
  {
    type: 'list.surveiller', kind: 'list', title: 'Salles à surveiller', icon: 'salles', color: 'var(--crit)', sizes: ['M', 'L'], cap: 'dashboard.parc',
    Body({ size }) {
      const { surveiller, bySalle } = parc();
      const list = surveiller.slice(0, size === 'M' ? 2 : 6);
      const maxHs = Math.max(1, ...list.map((x) => bySalle.get(x.id)!.hs)), maxWait = Math.max(1, ...list.map((x) => bySalle.get(x.id)!.attente));
      return <>
        <WidgetHead title="Salles à surveiller" right={<span className="watch-head"><span>Hors service</span><span>En attente</span></span>} />
        {list.length ? <ul className="watch">{list.map((x) => {
          const v = bySalle.get(x.id)!;
          return <li key={x.id}><Link className="watch-row" to={`/salles/salle/${x.id}`}>
            <span className="watch-name"><b>{x.nom}</b><small>{batimentLabel(x.batiment)}</small></span>
            <span className={`watch-cell${v.hs ? '' : ' is-zero'}`} data-tip={`${num(v.hs)} hors service`}><MicroBar value={v.hs} max={maxHs} color="var(--crit)" /><b>{num(v.hs)}</b></span>
            <span className={`watch-cell${v.attente ? '' : ' is-zero'}`} data-tip={`${num(v.attente)} en remontée`}><MicroBar value={v.attente} max={maxWait} color="var(--wait)" /><b>{num(v.attente)}</b></span>
          </Link></li>;
        })}</ul> : <WidgetEmpty ic="checkCircle" text="Aucune salle à surveiller" />}
      </>;
    },
  },
  {
    type: 'kpi.deplacements', kind: 'kpi', title: 'Matériels à déplacer', icon: 'refresh', color: 'var(--install)', sizes: ['S'], cap: 'materiel.move',
    Body() {
      const { deplacements } = parc();
      const { enCours } = installations();
      return <Link className={`kpi kpi--link${alertClass('install', deplacements.length)}`} to="/salles/deplacements">
        <KpiBody label="À déplacer" value={num(deplacements.length)} sub={<KpiSub>{enCours.length ? `${num(enCours.length)} salle${enCours.length > 1 ? 's' : ''} en installation` : 'Toutes les salles sont équipées'}</KpiSub>} />
      </Link>;
    },
  },
  {
    type: 'list.installations', kind: 'list', title: 'Installation des salles', icon: 'salles', color: 'var(--install)', sizes: ['M', 'L'], cap: 'materiel.move',
    Body({ size }) {
      const { enCours } = installations();
      const list = enCours.slice(0, size === 'M' ? 2 : 6);
      return <>
        <WidgetHead title="Installation des salles" right={<Link className="w-count" to="/salles/deplacements" data-tip="Salles en installation : ouvrir les déplacements">{num(enCours.length)}</Link>} />
        {list.length ? <ul className="watch">{list.map((x) => (
          <li key={x.salle.id}><Link className="watch-row watch-row--install" to={`/salles/deplacements?salle=${x.salle.id}`}>
            <span className="watch-name"><b>{x.salle.nom}</b><small>{batimentLabel(x.salle.batiment)} · {num(x.enCours.length)} à déplacer</small></span>
            <Progress value={x.pct} label={`Avancement de l’installation de ${x.salle.nom}`} />
          </Link></li>))}</ul>
          : <WidgetEmpty ic="checkCircle" text="Toutes les salles sont équipées" />}
      </>;
    },
  },
];
