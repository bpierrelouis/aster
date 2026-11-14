/* ==========================================================================
   Widgets des remontées issus des maquettes du tableau de bord
   (design/maquettes) : délai médian de traitement, remontées à traiter par
   ancienneté, ancienneté des remontées en attente, solde hebdomadaire,
   calendrier par jour, remontées pour 100 matériels par bâtiment.
   Les tranches d'ancienneté ne servent qu'à regrouper : aucun seuil d'alerte.
   ========================================================================== */

import { Link } from 'react-router';
import { num, plural, dec, dateShort, DAY } from '#shared/format.ts';
import { problem } from '#shared/catalog.ts';
import { remontees, remonteeContext, remonteePath, remonteesParJour, remonteesParBatiment, batimentLabel } from '../core/selectors.ts';
import { BulletRows, SegBar, SegLegend, VBars, MicroBar, AgeStrip } from '../ui/charts-bars.tsx';
import { HeatCalendar, HeatLegend } from '../ui/charts-heat.tsx';
import { WidgetHead, WidgetEmpty, KpiBody, KpiSub, Delta, StatutPill } from './parts.tsx';
import type { CSSProperties } from 'react';
import type { Remontee } from '#shared/types.ts';
import type { WidgetDef } from './catalog.tsx';

const days = (ms: number) => ms / DAY;
const ageOf = (r: Remontee, now = Date.now()) => Math.floor(days(now - r.createdAt));
const ageText = (d: number) => (d ? `${num(d)} j` : 'Auj.');
/* Ancienneté : trois tranches d'une même teinte d'attente, de la plus claire à la plus soutenue */
const AGES = [
  { label: 'Moins de 2 jours', test: (d: number) => d < 2, color: 'color-mix(in srgb, var(--wait) 38%, var(--ramp-base))' },
  { label: '2 à 7 jours', test: (d: number) => d >= 2 && d <= 7, color: 'color-mix(in srgb, var(--wait) 68%, var(--ramp-base))' },
  { label: 'Plus de 7 jours', test: (d: number) => d > 7, color: 'var(--wait)' },
];

export const REMONTEE_WIDGETS: WidgetDef[] = [
  {
    type: 'kpi.delai', kind: 'kpi', title: 'Délai médian de traitement', icon: 'clock', color: 'var(--accent)', sizes: ['S'], cap: 'remontee.viewAll',
    Body() {
      const { delai } = remontees();
      const value = delai.median === null ? '—' : <>{dec(days(delai.median))}<small> j</small></>;
      const sub = delai.median === null ? <KpiSub>Aucun traitement sur 12 semaines</KpiSub>
        : delai.avant === null ? <KpiSub>Sur 12 semaines</KpiSub>
          : <Delta diff={Math.round(days(delai.median - delai.avant) * 10) / 10} fmt={(n) => `${dec(n)} j`} period="par rapport aux 12 semaines précédentes" sense="up-bad" />;
      return <Link className="kpi kpi--link" to="/remontees/terminees"><KpiBody label="Délai médian de traitement" value={value} sub={sub} /></Link>;
    },
  },
  {
    type: 'list.aTraiter', kind: 'list', title: 'Remontées à traiter', icon: 'hourglass', color: 'var(--wait)', sizes: ['M', 'L', 'XL'], cap: 'remontee.viewAll',
    Body({ size }) {
      const { aTraiter } = remontees();
      const list = aTraiter.slice(0, size === 'M' ? 2 : 5);
      const oldest = Math.max(1, ...list.map((r) => ageOf(r)));
      return <>
        <WidgetHead title="Remontées à traiter" right={<Link className="w-count" to="/remontees/attente" data-tip="Ouvrir la liste">{num(aTraiter.length)}</Link>} />
        {list.length ? <ul className="rows">{list.map((r) => {
          const { mats, salles, first } = remonteeContext(r);
          const d = ageOf(r);
          return <li key={r.id}><Link className="row row--age" to={remonteePath(r)}>
            <span className="age" data-tip={`Créée le ${dateShort(r.createdAt)}`}><b>{ageText(d)}</b><MicroBar value={d} max={oldest} color="var(--wait)" /></span>
            <span className="row-main">
              <span className="row-title">{first?.modele ?? 'Matériel retiré'}{mats.length > 1 && <> <span className="row-more">+{mats.length - 1}</span></>}</span>
              <span className="row-sub">{[salles.map((x) => x.nom).join(', ') || 'Stock', salles[0] && batimentLabel(salles[0].batiment), problem(r.probleme).label].filter(Boolean).join(' · ')}</span>
            </span>
            {r.statut === 'encours' ? <StatutPill r={r} /> : <span className="row-meta">{r.id}</span>}
          </Link></li>;
        })}</ul> : <WidgetEmpty ic="checkCircle" text="Aucune remontée à traiter" />}
      </>;
    },
  },
  {
    type: 'chart.anciennete', kind: 'chart', title: 'Ancienneté des remontées en attente', icon: 'hourglass', color: 'var(--wait)', sizes: ['M', 'L'], cap: 'remontee.viewAll',
    Body({ size }) {
      const { aTraiter } = remontees();
      const parts = AGES.map((a) => ({ label: a.label, color: a.color, value: aTraiter.filter((r) => a.test(ageOf(r))).length }));
      const max = Math.max(14, Math.ceil((aTraiter.length ? ageOf(aTraiter[0]) + 1 : 0) / 7) * 7);
      return <>
        <WidgetHead title="Ancienneté des remontées en attente" />
        {aTraiter.length ? <div className="aging">
          <SegBar parts={parts} label={`Remontées en attente par ancienneté : ${parts.map((p) => `${p.label} ${p.value}`).join(', ')}`} />
          <SegLegend parts={parts} />
          {size !== 'M' && <AgeStrip max={max} limits={[2, 7]} ticks={Array.from({ length: max / 7 + 1 }, (_, i) => i * 7)}
            points={aTraiter.map((r) => ({ key: r.id, days: Math.min(days(Date.now() - r.createdAt), max), tipTitle: r.id, tip: `En attente depuis ${ageText(ageOf(r))}` }))}
            label={`Ancienneté de chaque remontée en attente : ${aTraiter.map((r) => `${ageOf(r)} jours`).join(', ')}`} />}
        </div> : <WidgetEmpty ic="checkCircle" text="Aucune remontée en attente" />}
      </>;
    },
  },
  {
    type: 'chart.solde', kind: 'chart', title: 'Solde hebdomadaire des remontées', icon: 'chartBar', color: 'var(--wait)', sizes: ['M', 'L', 'XL'], cap: 'remontee.viewAll',
    Body({ size }) {
      const { weeks } = remontees();
      const sign = (v: number) => (v > 0 ? `+${num(v)}` : v < 0 ? `−${num(-v)}` : '0');
      const items = weeks.map((w) => ({
        key: w.from, label: dateShort(w.from), value: w.solde, color: w.solde > 0 ? 'var(--wait)' : 'var(--ok)', tipTitle: `Semaine du ${dateShort(w.from)}`,
        tip: `${sign(w.solde)} : ${plural(w.creees, 'créée', 'créées')}, ${plural(w.traitees, 'traitée', 'traitées')}`,
      }));
      return <>
        <WidgetHead title="Solde hebdomadaire des remontées" right={<ul className="legend legend--inline">
          <li><span className="key-dot" style={{ '--k': 'var(--wait)' } as CSSProperties} />File qui s’allonge</li>
          <li><span className="key-dot" style={{ '--k': 'var(--ok)' } as CSSProperties} />File qui se résorbe</li>
        </ul>} />
        <VBars items={items} every={size === 'XL' ? 1 : 3} label={`Remontées créées moins traitées, par semaine : ${items.map((it) => sign(it.value)).join(', ')}`} />
      </>;
    },
  },
  {
    type: 'chart.calendrier', kind: 'chart', title: 'Remontées par jour', icon: 'calendar', color: 'var(--accent)', sizes: ['L', 'XL'], cap: 'remontee.viewAll',
    Body() {
      const weeks = remonteesParJour();
      const total = weeks.flat().reduce((t, d) => t + d.n, 0);
      return <>
        <WidgetHead title="Remontées par jour" right={<HeatLegend />} />
        <HeatCalendar weeks={weeks} unit={['remontée', 'remontées']}
          label={`Remontées créées par jour sur 12 semaines, du ${dateShort(weeks[0][0].at)} à aujourd’hui : ${plural(total, 'remontée', 'remontées')}`} />
      </>;
    },
  },
  {
    type: 'chart.taux', kind: 'chart', title: 'Remontées pour 100 matériels', icon: 'chartBar', color: 'var(--accent)', sizes: ['L', 'XL'], cap: 'remontee.viewAll',
    Body() {
      const { rows, moyenne } = remonteesParBatiment();
      const list = rows.filter((r) => r.total).sort((a, b) => b.taux - a.taux)
        .map((r) => ({ label: batimentLabel(r.batiment), value: r.taux, detail: `${num(r.n)} pour ${num(r.total)}`, tip: `${plural(r.n, 'remontée', 'remontées')} sur 12 semaines pour ${num(r.total)} matériels` }));
      const max = Math.max(1, ...list.map((r) => r.value), moyenne) * 1.15;
      return <>
        <WidgetHead title="Remontées pour 100 matériels" right={<span className="w-note">12 semaines</span>} />
        {list.length ? <BulletRows rows={list} max={max} fmt={dec} mark={{ value: moyenne, label: `Moyenne de l’école ${dec(moyenne)}` }}
          label={`Remontées pour 100 matériels sur 12 semaines : ${list.map((r) => `${r.label} ${dec(r.value)}`).join(', ')}`} />
          : <WidgetEmpty ic="materiel" text="Aucun matériel en salle" />}
      </>;
    },
  },
];
