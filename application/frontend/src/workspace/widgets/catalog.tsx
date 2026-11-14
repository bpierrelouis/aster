/* ==========================================================================
   Catalogue des widgets ORION
   Tailles (comme les widgets iOS) : S 1×1, M 2×1, L 2×2, XL 4×2
   Indicateurs issus des maquettes ORION et du cadrage (§ 14) ; les calculs
   détaillés restent à valider avec le client.
   ========================================================================== */

import { Link } from 'react-router';
import { Icon, Tile } from '../ui/icons.tsx';
import { num, pct1, dateShort } from '#shared/format.ts';
import { DEVICE_TYPES, REMONTEE_STATUTS } from '#shared/catalog.ts';
import { parc, remontees, batimentLabel, scope } from '../core/selectors.ts';
import { can } from '../core/permissions.ts';
import { LineChart, Sparkline } from '../ui/charts.tsx';
import { EtatBar, WidgetHead, KpiBody, KpiSub, Delta, alertClass } from './parts.tsx';
import { LIST_WIDGETS } from './catalog-listes.tsx';
import { DIAGRAMS } from './diagrams.tsx';
import { PARC_WIDGETS } from './catalog-parc.tsx';
import { REMONTEE_WIDGETS } from './catalog-remontees.tsx';
import type { CSSProperties, ReactNode } from 'react';
import type { WidgetSize } from '#shared/types.ts';
import type { Capability } from '../core/permissions.ts';
import type { Effectif } from '../core/selectors.ts';

/** Catégorie d'un widget (onglets de la galerie) */
export type WidgetKind = 'kpi' | 'chart' | 'list';
/** Définition d'un widget du catalogue ; cap : droit requis pour l'ajouter */
export interface WidgetDef {
  type: string; kind: WidgetKind; title: string; icon: string; color: string; sizes: WidgetSize[]; cap?: Capability;
  Body: (props: { size: WidgetSize }) => ReactNode;
}

export const SIZES: Record<WidgetSize, { c: number; r: number; label: string }> = {
  S: { c: 1, r: 1, label: 'Petit' },
  M: { c: 2, r: 1, label: 'Moyen' },
  L: { c: 2, r: 2, label: 'Grand' },
  XL: { c: 4, r: 2, label: 'Très grand' },
};

/** Ligne d'un bâtiment (ou du stock) dans « État par bâtiment » */
function BstackRow({ code, label, c, to }: { code: string; label: string; c: Effectif; to: string }) {
  return <li><Link className="bstack-row" to={to}>
    <span className="bstack-name"><span className="code-badge">{code}</span><span className="bstack-label">{label}</span></span>
    <EtatBar c={c} />
    <span className="bstack-meta"><b>{num(c.total)}</b>{c.hs > 0 && <span className="bstack-hs"><Icon name="power" size={14} />{num(c.hs)}</span>}</span>
  </Link></li>;
}

/* ---------- Catalogue ---------- */

const WIDGETS: WidgetDef[] = [
  /* ===== Parc ===== */
  {
    type: 'kpi.materiels', kind: 'kpi', title: 'Matériels', icon: 'materiel', color: 'var(--accent)', sizes: ['S'], cap: 'dashboard.parc',
    Body() {
      const p = parc();
      return <div className="kpi"><KpiBody label="Matériels" value={num(p.totals.total)} sub={<Delta diff={p.recus} period="sur 12 semaines" />} /></div>;
    },
  },
  {
    type: 'kpi.affectes', kind: 'kpi', title: 'Affectés en salle', icon: 'salles', color: 'var(--c3)', sizes: ['S'], cap: 'dashboard.parc',
    Body() {
      const p = parc();
      const chip = <span className="chip" data-tip="Salles équipées"><Icon name="salles" size={14} />{num(p.sallesEquipees)}</span>;
      return <div className="kpi"><KpiBody label="Affectés en salle" value={num(p.totals.affectes)} chip={chip} /></div>;
    },
  },
  {
    type: 'kpi.stock', kind: 'kpi', title: 'En stock', icon: 'stockage', color: 'var(--c8)', sizes: ['S'], cap: 'dashboard.parc',
    Body() {
      const p = parc();
      const chip = p.stock.hs ? <span className="chip chip--bad" data-tip="Hors service en stock"><Icon name="power" size={14} />{num(p.stock.hs)}</span> : null;
      return <div className="kpi"><KpiBody label="En stock" value={num(p.totals.stock)} chip={chip} /></div>;
    },
  },
  {
    type: 'kpi.hs', kind: 'kpi', title: 'Hors service', icon: 'power', color: 'var(--crit)', sizes: ['S', 'M'], cap: 'dashboard.parc',
    Body({ size }) {
      const p = parc();
      const main = <KpiBody label="Hors service" value={num(p.totals.hs)} sub={<KpiSub>{pct1(p.totals.total ? p.totals.hs / p.totals.total : 0)} du parc</KpiSub>} />;
      const alert = alertClass('hs', p.totals.hs);
      if (size === 'S') return <div className={`kpi${alert}`}>{main}</div>;
      const top = DEVICE_TYPES.map((t) => ({ t, n: p.byType[t.id].hs })).filter((x) => x.n).sort((a, b) => b.n - a.n).slice(0, 4);
      return <div className={`kpi kpi--split${alert}`}><div className="kpi">{main}</div>
        <ul className="kpi-icons">
          {top.length
            ? top.map(({ t, n }) => <li key={t.id} data-tip={t.plural}><Tile name={t.icon} color={t.color} size="m" /><b>{num(n)}</b></li>)
            : <li className="is-muted">—</li>}
        </ul></div>;
    },
  },
  {
    type: 'kpi.parc', kind: 'kpi', title: 'État du parc', icon: 'materiel', color: 'var(--accent)', sizes: ['M'], cap: 'dashboard.parc',
    Body() {
      const { totals: c } = parc();
      return <div className="kpi kpi--split"><div className="kpi"><KpiBody label="Matériels" value={num(c.total)} /></div>
        <div className="kpi-side">
          <EtatBar c={c} />
          <ul className="legend">
            <li><span className="st st--ok"><Icon name="checkCircle" size={16} /></span><b>{num(c.ok)}</b><span>En service</span></li>
            <li><span className="st st--hs"><Icon name="power" size={16} /></span><b>{num(c.hs)}</b><span>Hors service</span></li>
            <li><span className="st st--stock"><Icon name="stockage" size={16} /></span><b>{num(c.stock)}</b><span>En stock</span></li>
          </ul>
        </div></div>;
    },
  },
  {
    type: 'kpi.garanties', kind: 'kpi', title: 'Garanties', icon: 'calendarWarn', color: 'var(--warn)', sizes: ['M'], cap: 'dashboard.parc',
    Body() {
      const { garanties: g } = parc();
      return <div className="kpi kpi--split"><div className="kpi"><div className="kpi-top"><span className="kpi-label">Garanties</span></div></div>
        <div className="kpi-pair">
          <div><span className="kpi-value">{num(g.proches.length)}</span><span className="kpi-label">Échéance sous 6 mois</span></div>
          <div><span className="kpi-value">{num(g.echues.length)}</span><span className="kpi-label">Hors garantie</span></div>
        </div></div>;
    },
  },
  {
    type: 'chart.types', kind: 'chart', title: 'Répartition du matériel', icon: 'chartBar', color: 'var(--accent)', sizes: ['M', 'L'], cap: 'dashboard.parc',
    Body({ size }) {
      const { byType } = parc();
      const rows = DEVICE_TYPES.map((t) => ({ t, ...byType[t.id] })).filter((r) => r.total).sort((a, b) => b.total - a.total).slice(0, size === 'M' ? 4 : 8);
      const max = Math.max(...rows.map((r) => r.total), 1);
      return <>
        <WidgetHead title="Répartition du matériel" right={<Link className="w-link" to="/salles">Voir les salles</Link>} />
        <ul className={`hbars${size === 'M' ? ' hbars--compact' : ''}`}>{rows.map((r) => (
          <li key={r.t.id} className="hbar" data-tip-title={r.t.plural} data-tip={`${num(r.total)} matériels\n${num(r.hs)} hors service`}>
            <Tile name={r.t.icon} color={r.t.color} size="s" />
            <span className="hbar-label">{r.t.plural}</span>
            <span className="hbar-track"><span className="hbar-fill" style={{ width: `${(r.total / max) * 100}%` }} /></span>
            <b className="hbar-value">{num(r.total)}</b>
          </li>))}</ul>
      </>;
    },
  },
  {
    type: 'chart.batiments', kind: 'chart', title: 'État par bâtiment', icon: 'salles', color: 'var(--c3)', sizes: ['M', 'L', 'XL'], cap: 'dashboard.parc',
    Body({ size }) {
      const { byBatiment, stock } = parc();
      const legend = <ul className="legend legend--inline">
        <li><span className="st st--ok"><Icon name="checkCircle" size={16} /></span><span className="legend-text">En service</span></li>
        <li><span className="st st--hs"><Icon name="power" size={16} /></span><span className="legend-text">Hors service</span></li></ul>;
      return <>
        <WidgetHead title="État par bâtiment" right={size === 'M' ? null : legend} />
        <ul className={`bstack${size === 'M' ? ' bstack--compact' : ''}`}>
          {byBatiment.map((b) => <BstackRow key={b.batiment} code={b.batiment} label={batimentLabel(b.batiment)} c={b} to={`/salles/batiment/${b.batiment}`} />)}
          <BstackRow code="—" label="Stock" c={stock} to="/salles/stock" />
        </ul>
      </>;
    },
  },

  /* ===== Remontées ===== */
  {
    type: 'kpi.attente', kind: 'kpi', title: 'Remontées en attente', icon: 'hourglass', color: 'var(--wait)', sizes: ['S', 'M'], cap: 'remontee.viewAll',
    Body({ size }) {
      const rm = remontees();
      const alert = alertClass('wait', rm.attente.length);
      const delta = <Delta diff={rm.attente.length - rm.attenteAvant} period="sur 7 jours" sense="up-bad" />;
      const main = <Link className={`kpi kpi--link${size === 'S' ? alert : ''}`} to="/remontees/attente"><KpiBody label="Remontées en attente" value={num(rm.attente.length)} sub={delta} /></Link>;
      if (size === 'S') return main;
      const values = rm.weeks.map((w) => w.attente);
      return <div className={`kpi kpi--split${alert}`}>{main}
        <div className="kpi-side kpi-side--center" data-tip-title="En attente en fin de semaine" data-tip={`De ${num(Math.min(...values))} à ${num(Math.max(...values))} sur 12 semaines`}>
          <Sparkline values={values} w={240} h={64} color="var(--wait)" label="Remontées en attente en fin de semaine, 12 semaines" /></div></div>;
    },
  },
  {
    type: 'kpi.traitees', kind: 'kpi', title: 'Traitées sur 30 jours', icon: 'clipboardCheck', color: 'var(--ok)', sizes: ['S'], cap: 'remontee.viewAll',
    Body() {
      const rm = remontees();
      const delta = <Delta diff={rm.recentTraitees.length - rm.traiteesAvant} period="par rapport au mois précédent" sense="up-good" />;
      return <Link className="kpi kpi--link" to="/remontees/terminees"><KpiBody label="Traitées sur 30 jours" value={num(rm.recentTraitees.length)} sub={delta} /></Link>;
    },
  },
  {
    type: 'chart.statuts', kind: 'chart', title: 'Statuts des remontées', icon: 'documents', color: 'var(--accent)', sizes: ['M'], cap: 'remontee.viewAll',
    Body() {
      const { byStatut } = remontees();
      const total = REMONTEE_STATUTS.reduce((t, s) => t + byStatut[s.id], 0) || 1;
      return <>
        <WidgetHead title="Statuts des remontées" />
        <div className="stbar" role="img" aria-label={REMONTEE_STATUTS.map((s) => `${s.label} ${byStatut[s.id]}`).join(', ')}>
          {REMONTEE_STATUTS.map((s) => (byStatut[s.id]
            ? <span key={s.id} className={`stbar-seg stbar-seg--${s.id}`} style={{ flex: byStatut[s.id] / total }} data-tip={`${s.label} : ${num(byStatut[s.id])}`} />
            : null))}
        </div>
        <ul className="legend legend--inline legend--spread">{REMONTEE_STATUTS.map((s) => (
          <li key={s.id}><span className={`pill-ico pill-ico--${s.id}`}><Icon name={s.icon} size={14} /></span><b>{num(byStatut[s.id])}</b><span>{s.label}</span></li>
        ))}</ul>
      </>;
    },
  },
  {
    type: 'chart.flux', kind: 'chart', title: 'Flux des remontées', icon: 'chartLine', color: 'var(--accent)', sizes: ['L', 'XL'], cap: 'remontee.viewAll',
    Body() {
      const rm = remontees();
      return <>
        <WidgetHead title="Flux des remontées" right={<ul className="legend legend--inline">
          <li><span className="key-line" style={{ '--k': 'var(--accent)' } as CSSProperties} />Créées</li>
          <li><span className="key-line" style={{ '--k': 'var(--ok)' } as CSSProperties} />Traitées</li>
        </ul>} />
        <LineChart labels={rm.weeks.map((w) => dateShort(w.from))} series={[
          { name: 'Créées', color: 'var(--accent)', values: rm.weeks.map((w) => w.creees) },
          { name: 'Traitées', color: 'var(--ok)', values: rm.weeks.map((w) => w.traitees) },
        ]} />
      </>;
    },
  },
  {
    type: 'kpi.mesattente', kind: 'kpi', title: 'Mes remontées en attente', icon: 'hourglass', color: 'var(--wait)', sizes: ['S'], cap: 'remontee.create',
    Body() {
      const rm = remontees();
      return <Link className={`kpi kpi--link${alertClass('wait', rm.mineAttente.length)}`} to="/remontees/miennes"><KpiBody label="Mes remontées en attente" value={num(rm.mineAttente.length)} /></Link>;
    },
  },

  /* ===== Salles (formateur) ===== */
  {
    type: 'kpi.salles', kind: 'kpi', title: 'Salles', icon: 'salles', color: 'var(--c3)', sizes: ['S'], cap: 'salle.view',
    Body: () => <Link className="kpi kpi--link" to="/salles"><KpiBody label="Salles de l’école" value={num(scope().salles.length)} /></Link>,
  },

  /* ===== Listes (catalog-listes.tsx) ===== */
  ...LIST_WIDGETS,

  /* ===== Diagrammes (widgets/diagrams.tsx) ===== */
  ...DIAGRAMS,
  /* ===== Diagrammes et listes issus des maquettes (catalog-parc.tsx, catalog-remontees.tsx) ===== */
  ...PARC_WIDGETS,
  ...REMONTEE_WIDGETS,
];

export const widgetDef = (type: string) => WIDGETS.find((w) => w.type === type);

export const KINDS: { id: WidgetKind; label: string; icon: string }[] = [
  { id: 'kpi', label: 'Indicateurs', icon: 'gauge' },
  { id: 'chart', label: 'Graphiques', icon: 'chartBar' },
  { id: 'list', label: 'Listes', icon: 'list' },
];

/** Widgets disponibles pour le profil connecté */
export const widgetsFor = () => WIDGETS.filter((w) => !w.cap || can(w.cap));
