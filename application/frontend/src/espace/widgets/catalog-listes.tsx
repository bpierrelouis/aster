/* ==========================================================================
   Widgets « liste » du catalogue (widgets/catalog.tsx) : salles les plus
   équipées, matériels récents ou hors service, remontées en attente ou de
   l'auteur, détections de processus.
   ========================================================================== */

import { Link } from 'react-router';
import { Icon, Tile } from '../ui/icons.tsx';
import { AppIcon } from '../ui/app-icon.tsx';
import { num, ago, dateMed } from '#shared/format.ts';
import { CLASSEMENTS, deviceType, problem } from '#shared/catalog.ts';
import { parc, remontees, remonteeContext, remonteePath, materielPath, detections, index, scope } from '../core/selectors.ts';
import { EtatIcon, EtatPill, StatutPill, LieuChip, WidgetHead, WidgetEmpty } from './parts.tsx';
import type { Materiel, Remontee } from '#shared/types.ts';
import type { WidgetDef } from './catalog.tsx';

/** Ligne de remontée (listes) */
function RemonteeRow({ r, showStatut = false }: { r: Remontee; showStatut?: boolean }) {
  const { mats, salles, first } = remonteeContext(r);
  const dt = deviceType(first?.type);
  const p = problem(r.probleme);
  return <li><Link className="row" to={remonteePath(r)}>
    <span className="tile-wrap"><Tile name={p.icon} color={dt.color} size="m" className="tile--tint" /></span>
    <span className="row-main">
      <span className="row-title">{first?.modele ?? 'Matériel retiré'}{mats.length > 1 && <> <span className="row-more">+{mats.length - 1}</span></>}</span>
      <span className="row-sub">
        <LieuChip salles={salles} />
        <span className="row-meta">{r.id}</span><span className="row-meta"><Icon name="clock" size={13} />{ago(r.createdAt)}</span>
      </span>
    </span>
    {showStatut && <StatutPill r={r} />}
  </Link></li>;
}

function MaterielRow({ m }: { m: Materiel }) {
  const dt = deviceType(m.type);
  return <li><Link className="row" to={materielPath(m)}>
    <span className="tile-wrap"><Tile name={dt.icon} color={dt.color} size="m" /></span>
    <span className="row-main">
      <span className="row-title">{m.modele}</span>
      <span className="row-sub"><LieuChip m={m} /><span className="row-meta">{m.idOrion}</span>{m.marque && <span className="row-meta">{m.marque}</span>}</span>
    </span>
    <EtatIcon m={m} />
  </Link></li>;
}

export const LIST_WIDGETS: WidgetDef[] = [
  {
    type: 'list.salles', kind: 'list', title: 'Salles les plus équipées', icon: 'salles', color: 'var(--c3)', sizes: ['M', 'L'], cap: 'dashboard.parc',
    Body({ size }) {
      const { topSalles, bySalle } = parc();
      const list = topSalles.slice(0, size === 'M' ? 2 : 5);
      return <>
        <WidgetHead title="Salles les plus équipées" right={<Link className="w-link" to="/salles">Toutes</Link>} />
        <ul className="rank">{list.map((x) => {
          const c = bySalle.get(x.id)!;
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
          <thead><tr><th>Modèle</th><th>Identifiant ORION</th><th>Réception</th><th>Localisation</th><th>État</th></tr></thead>
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
];
