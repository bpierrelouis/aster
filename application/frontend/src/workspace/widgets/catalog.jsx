/* ==========================================================================
   Catalogue des widgets ORION
   Un widget = { type, kind, title, icon, color, sizes, cap?, Body({ size }) }
   Tailles (comme les widgets iOS) : S 1×1, M 2×1, L 2×2, XL 4×2
   Indicateurs issus des maquettes ORION et du cadrage (§ 14) ; les calculs
   détaillés restent à valider avec le client.
   ========================================================================== */

import { Link } from 'react-router';
import { Icon, Tile } from '../ui/icons.jsx';
import { AppIcon } from '../ui/app-icon.jsx';
import { num, pct1, ago, dateShort, dateMed } from '#shared/format.js';
import { DEVICE_TYPES, REMONTEE_STATUTS, CLASSEMENTS, deviceType, problem } from '#shared/catalog.js';
import { parc, remontees, remonteeContext, remonteePath, detections, batimentLabel, index, scope } from '../core/selectors.js';
import { can } from '../core/permissions.js';
import { LineChart, Sparkline } from '../ui/charts.jsx';
import { EtatIcon, EtatPill, StatutPill, LieuChip, EtatBar, WidgetHead, WidgetEmpty, KpiBody, KpiSub, Delta, alertClass } from './parts.jsx';
import { DIAGRAMS } from './diagrams.jsx';
import { PARC_WIDGETS } from './catalog-parc.jsx';
import { REMONTEE_WIDGETS } from './catalog-remontees.jsx';

export const SIZES = {
  S: { c: 1, r: 1, label: 'Petit' },
  M: { c: 2, r: 1, label: 'Moyen' },
  L: { c: 2, r: 2, label: 'Grand' },
  XL: { c: 4, r: 2, label: 'Très grand' },
};

/* ---------- Fragments communs ---------- */

/** Ligne de remontée (listes) */
function RemonteeRow({ r, showStatut = false }) {
  const { mats, salles, first } = remonteeContext(r);
  const dt = deviceType(first?.type);
  const p = problem(r.probleme);
  return <li><Link className="row" to={remonteePath(r)}>
    <span className="tile-wrap"><Tile name={p.icon} color={dt.color} size="m" className="tile--tint" /></span>
    <span className="row-main">
      <span className="row-title">{first?.modele ?? 'Matériel retiré'}{mats.length > 1 && <> <span className="row-more">+{mats.length - 1}</span></>}</span>
      <span className="row-sub">
        {salles.length
          ? <span className="chip chip--pin"><Icon name="pin" size={13} />{salles.map((x) => x.nom).join(', ')}</span>
          : <span className="chip chip--stock"><Icon name="stockage" size={13} />Stock</span>}
        <span className="row-meta">{r.id}</span><span className="row-meta"><Icon name="clock" size={13} />{ago(r.createdAt)}</span>
      </span>
    </span>
    {showStatut && <StatutPill r={r} />}
  </Link></li>;
}

function MaterielRow({ m }) {
  const dt = deviceType(m.type);
  return <li><Link className="row" to={`/salles/${m.salleId ? `salle/${m.salleId}` : 'stock'}?m=${m.id}`}>
    <span className="tile-wrap"><Tile name={dt.icon} color={dt.color} size="m" /></span>
    <span className="row-main">
      <span className="row-title">{m.modele}</span>
      <span className="row-sub"><LieuChip m={m} /><span className="row-meta">{m.idOrion}</span>{m.marque && <span className="row-meta">{m.marque}</span>}</span>
    </span>
    <EtatIcon m={m} />
  </Link></li>;
}

/** Ligne d'un bâtiment (ou du stock) dans « État par bâtiment » */
function BstackRow({ code, label, c, to }) {
  return <li><Link className="bstack-row" to={to}>
    <span className="bstack-name"><span className="code-badge">{code}</span><span className="bstack-label">{label}</span></span>
    <EtatBar c={c} />
    <span className="bstack-meta"><b>{num(c.total)}</b>{c.hs > 0 && <span className="bstack-hs"><Icon name="power" size={14} />{num(c.hs)}</span>}</span>
  </Link></li>;
}

/* ---------- Catalogue ---------- */

export const WIDGETS = [
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
          <div><span className="kpi-value">{num(g.echues.length)}</span><span className="kpi-label">Arrivées à échéance</span></div>
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
  {
    type: 'list.salles', kind: 'list', title: 'Salles les plus équipées', icon: 'salles', color: 'var(--c3)', sizes: ['M', 'L'], cap: 'dashboard.parc',
    Body({ size }) {
      const { topSalles, bySalle } = parc();
      const list = topSalles.slice(0, size === 'M' ? 2 : 5);
      return <>
        <WidgetHead title="Salles les plus équipées" right={<Link className="w-link" to="/salles">Toutes</Link>} />
        <ul className="rank">{list.map((x) => {
          const c = bySalle.get(x.id);
          return <li key={x.id}><Link className="rank-row" to={`/salles/salle/${x.id}`}>
            <span className="code-badge">{x.batiment}</span><b>{x.nom}</b>
            {c.hs > 0 && <span className="chip chip--bad" data-tip="Hors service"><Icon name="power" size={14} />{num(c.hs)}</span>}
            <span className="rank-value">{num(c.total)} <small>matériels</small></span></Link></li>;
        })}</ul>
      </>;
    },
  },
  {
    type: 'list.recents', kind: 'list', title: 'Matériels récemment enregistrés', icon: 'importJson', color: 'var(--accent)', sizes: ['L', 'XL'], cap: 'dashboard.parc',
    Body({ size }) {
      const { recents } = parc();
      if (size === 'L') return <><WidgetHead title="Récemment enregistrés" /><ul className="rows">{recents.slice(0, 4).map((m) => <MaterielRow key={m.id} m={m} />)}</ul></>;
      return <>
        <WidgetHead title="Matériels récemment enregistrés" />
        <div className="table-wrap"><table className="table">
          <thead><tr><th>Modèle</th><th>Identifiant Orion</th><th>Réception</th><th>Localisation</th><th>État</th></tr></thead>
          <tbody>{recents.slice(0, 4).map((m) => {
            const dt = deviceType(m.type);
            return <tr key={m.id}><td><span className="cell-model"><Tile name={dt.icon} color={dt.color} size="s" className="tile--tint" /><span><b>{m.modele}</b><small>{m.marque ?? 'Marque non renseignée'}</small></span></span></td>
              <td className="mono-num">{m.idOrion}</td><td>{dateMed(m.dateReception)}</td><td><LieuChip m={m} /></td><td><EtatPill m={m} /></td></tr>;
          })}</tbody></table></div>
      </>;
    },
  },
  {
    type: 'list.hs', kind: 'list', title: 'Matériels hors service', icon: 'power', color: 'var(--crit)', sizes: ['M', 'L'], cap: 'dashboard.parc',
    Body({ size }) {
      const list = scope().materiels.filter((m) => m.hs);
      return <>
        <WidgetHead title="Hors service" right={<span className="w-count">{num(list.length)}</span>} />
        {list.length
          ? <ul className="rows">{list.slice(0, size === 'M' ? 2 : 4).map((m) => <MaterielRow key={m.id} m={m} />)}</ul>
          : <WidgetEmpty ic="checkCircle" text="Tout le parc est en service" />}
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
      const delta = <Delta diff={rm.recentTraitees.length - rm.traiteesAvant} period="par rapport aux 30 jours précédents" sense="up-good" />;
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
          <li><span className="key-line" style={{ '--k': 'var(--accent)' }} />Créées</li>
          <li><span className="key-line" style={{ '--k': 'var(--ok)' }} />Traitées</li>
        </ul>} />
        <LineChart labels={rm.weeks.map((w) => dateShort(w.from))} series={[
          { name: 'Créées', color: 'var(--accent)', values: rm.weeks.map((w) => w.creees) },
          { name: 'Traitées', color: 'var(--ok)', values: rm.weeks.map((w) => w.traitees) },
        ]} />
      </>;
    },
  },
  {
    type: 'list.attente', kind: 'list', title: 'Remontées en attente', icon: 'hourglass', color: 'var(--wait)', sizes: ['M', 'L', 'XL'], cap: 'remontee.viewAll',
    Body({ size }) {
      const rm = remontees();
      const list = rm.attente.slice(0, size === 'M' ? 2 : 4);
      return <>
        <WidgetHead title="Remontées en attente" right={<Link className="w-count" to="/remontees/attente" data-tip="Ouvrir la liste">{num(rm.attente.length)}<Icon name="chevR" size={14} /></Link>} />
        {list.length
          ? <ul className="rows">{list.map((r) => <RemonteeRow key={r.id} r={r} />)}</ul>
          : <WidgetEmpty ic="checkCircle" text="Aucune remontée en attente" />}
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
  {
    type: 'list.mesremontees', kind: 'list', title: 'Mes remontées', icon: 'documents', color: 'var(--accent)', sizes: ['L', 'XL'], cap: 'remontee.create',
    Body() {
      const rm = remontees();
      const list = rm.mine.slice(0, 4);
      return <>
        <WidgetHead title="Mes remontées" right={<Link className="w-count" to="/remontees/miennes">{num(rm.mine.length)}<Icon name="chevR" size={14} /></Link>} />
        {list.length
          ? <ul className="rows">{list.map((r) => <RemonteeRow key={r.id} r={r} showStatut />)}</ul>
          : <WidgetEmpty ic="documents" text="Aucune remontée pour le moment" />}
      </>;
    },
  },

  /* ===== Supervision (administrateurs) ===== */
  {
    type: 'list.detections', kind: 'list', title: 'Détections de processus', icon: 'shieldX', color: 'var(--crit)', sizes: ['M', 'L'], cap: 'administration.view',
    Body({ size }) {
      const all = detections();
      const list = all.slice(0, size === 'M' ? 2 : 4);
      const ix = index();
      return <>
        <WidgetHead title="Détections de processus" right={<span className="w-count">{num(all.length)}</span>} />
        {list.length ? <ul className="rows">{list.map((d) => {
          const c = CLASSEMENTS[d.classement];
          const p = ix.poste.get(d.posteId);
          const s = ix.salle.get(d.salleId);
          return <li key={d.id}><div className="row">
            <AppIcon name={d.processus} size={32} />
            <span className="row-main"><span className="row-title">{d.processus}</span>
              <span className="row-sub"><span className={`chip${d.classement === 'blacklist' ? ' chip--bad' : ''}`} data-tip={d.arret ? `Arrêt ${d.arret}` : null}>{c.label}</span><span className="chip chip--pin"><Icon name="pin" size={13} />{s?.nom ?? ''}</span><span className="row-meta">{p?.nomReseau ?? ''}</span><span className="row-meta"><Icon name="clock" size={13} />{ago(d.at)}</span></span></span>
          </div></li>;
        })}</ul> : <WidgetEmpty ic="shield" text="Aucune détection" />}
      </>;
    },
  },

  /* ===== Salles (formateur) ===== */
  {
    type: 'kpi.salles', kind: 'kpi', title: 'Salles', icon: 'salles', color: 'var(--c3)', sizes: ['S'], cap: 'salle.view',
    Body: () => <Link className="kpi kpi--link" to="/salles"><KpiBody label="Salles de l’école" value={num(scope().salles.length)} /></Link>,
  },

  /* ===== Diagrammes (widgets/diagrams.jsx) ===== */
  ...DIAGRAMS,
  /* ===== Diagrammes et listes issus des maquettes (catalog-parc.jsx, catalog-remontees.jsx) ===== */
  ...PARC_WIDGETS,
  ...REMONTEE_WIDGETS,
];

export const widgetDef = (type) => WIDGETS.find((w) => w.type === type);

export const KINDS = [
  { id: 'kpi', label: 'Indicateurs', icon: 'gauge' },
  { id: 'chart', label: 'Graphiques', icon: 'chartBar' },
  { id: 'list', label: 'Listes', icon: 'list' },
];

/** Widgets disponibles pour le profil connecté */
export const widgetsFor = () => WIDGETS.filter((w) => !w.cap || can(w.cap));
