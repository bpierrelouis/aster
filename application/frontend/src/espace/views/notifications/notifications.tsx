/* ==========================================================================
   Espace Notifications : toutes les notifications du compte, une carte par
   groupe (core/notifications.ts), chacune avec son détail et un lien vers
   l'écran concerné. Ouvert depuis le menu des notifications de la barre haute.
   ========================================================================== */

import { Link } from 'react-router';
import { Icon, Tile } from '../../ui/icons.tsx';
import { AppIcon } from '../../ui/app-icon.tsx';
import { useStore } from '../../hooks/use-store.ts';
import { useTitle } from '../../hooks/use-title.ts';
import { notificationGroups } from '../../core/notifications.ts';
import { index, remonteeContext, remonteePath, materielPath, garantie } from '../../core/selectors.ts';
import { titreIntervention, objetIntervention } from '../../core/interventions.ts';
import { deviceType, statut, intervention, etatIntervention } from '#shared/catalog.ts';
import { ago, dateMed, plural } from '#shared/format.ts';
import { GroupCard, GroupGrid, PageHead } from '../../widgets/parts.tsx';
import { lieuNom } from '../../core/installations.ts';
import type { NotificationGroup as Groupe, NotificationItem } from '../../core/notifications.ts';

/** Une notification : élément concerné, précision et date */
function NotificationRow({ n }: { n: NotificationItem }) {
  const ix = index();
  if (n.kind === 'garantie') {
    const t = deviceType(n.m.type);
    const salle = n.m.salleId ? ix.salle.get(n.m.salleId) : null;
    const echue = garantie(n.m) === 'Hors garantie';
    return <li><Link className="row" to={materielPath(n.m)}>
      <Tile name={t.icon} color={t.color} size="m" className="tile--tint" />
      <span className="row-main"><span className="row-title">{n.m.modele}</span>
        <span className="row-sub"><span className="row-meta">{n.m.idOrion}</span><span className="row-meta">{salle ? salle.nom : 'Stock'}</span></span></span>
      <span className="row-when">{echue ? 'Hors garantie depuis le' : 'Fin le'} {dateMed(n.m.garantieFin!)}</span>
    </Link></li>;
  }
  if (n.kind === 'deplacement') {
    const t = deviceType(n.m.type);
    return <li><Link className="row" to={`/salles/deplacements${n.m.salleId ? `?salle=${n.m.salleId}` : ''}`}>
      <Tile name={t.icon} color={t.color} size="m" className="tile--tint" />
      <span className="row-main"><span className="row-title">{n.m.modele}</span>
        <span className="row-sub"><span className="row-meta">{n.m.idOrion}</span><span className="row-meta">{lieuNom(n.m.deplacement.de)} → {lieuNom(n.m.salleId)}</span></span></span>
      <span className="row-when">{ago(n.at)}</span>
    </Link></li>;
  }
  if (n.kind === 'intervention') {
    const { o, n: c } = n.x;
    return <li><Link className="row" to={`/administration/interventions/${o.id}`}>
      {o.type === 'reinstallation' ? <Tile name={intervention(o.type)!.icon} color="var(--accent)" size="m" className="tile--tint" /> : <AppIcon name={objetIntervention(o)} size={32} />}
      <span className="row-main"><span className="row-title">{titreIntervention(o)}</span>
        <span className="row-sub"><span className="row-meta">{n.x.cible.label}</span>
          <span className="row-meta">{etatIntervention(o.type, n.x.etat)}{c.echec ? ` sur ${plural(c.echec, 'poste')}` : ''}</span></span></span>
      <span className="row-when">{ago(n.at)}</span>
    </Link></li>;
  }
  if (n.kind === 'interdit') {
    const salle = ix.salle.get(n.d.salleId);
    return <li><Link className="row" to="/supervision/alertes">
      <AppIcon name={n.d.processus} size={32} />
      <span className="row-main"><span className="row-title">{n.d.processus}</span>
        <span className="row-sub"><span className="row-meta">{ix.poste.get(n.d.posteId)?.nomReseau ?? ''}</span><span className="row-meta">{salle?.nom ?? ''}</span>{n.d.arret && <span className="row-meta">Arrêt {n.d.arret}</span>}</span></span>
      <span className="row-when">{ago(n.at)}</span>
    </Link></li>;
  }
  const { first } = remonteeContext(n.r);
  const t = deviceType(first?.type);
  const label = n.kind === 'statut' ? `${n.r.id} : ${statut(n.h.statut).label.toLowerCase()}` : `${n.r.id}, ${first?.modele ?? 'matériel retiré'}`;
  return <li><Link className="row" to={remonteePath(n.r)}>
    <Tile name={t.icon} color={t.color} size="m" className="tile--tint" />
    <span className="row-main"><span className="row-title">{label}</span>
      <span className="row-sub"><span className="row-meta">{n.kind === 'statut' ? `par ${n.h.par}` : `par ${n.r.auteur}`}</span></span></span>
    <span className="row-when">{ago(n.at)}</span>
  </Link></li>;
}

/** Clé stable d'une notification : sa nature et l'élément concerné (une étape de remontée par sa date) */
function itemKey(n: NotificationItem) {
  switch (n.kind) {
    case 'remontee': return `${n.kind}-${n.r.id}`;
    case 'statut': return `${n.kind}-${n.r.id}-${n.h.at}`;
    case 'deplacement': case 'garantie': return `${n.kind}-${n.m.id}`;
    case 'intervention': return `${n.kind}-${n.x.o.id}`;
    case 'interdit': return `${n.kind}-${n.d.id}`;
  }
}

const NotificationGroup = ({ g }: { g: Groupe }) => <GroupCard tile={<Tile name={g.icon} color={g.color} size="m" />} title={g.title} sub={g.period}
  action={<Link className="btn btn--ghost" to={g.href}><span>Ouvrir</span><Icon name="chevR" size={16} /></Link>}>
  {g.items.map((n) => <NotificationRow key={itemKey(n)} n={n} />)}
</GroupCard>;

export function Notifications() {
  useTitle('Notifications');
  useStore();
  const groups = notificationGroups();
  const total = groups.reduce((t, g) => t + g.items.length, 0);
  return <div className="group-view">
    <PageHead title="Notifications" />
    {groups.length
      ? <>
        <p className="group-lead">{plural(total, 'notification')}, {total > 1 ? 'regroupées' : 'regroupée'} en {plural(groups.length, 'sujet')}.</p>
        <GroupGrid items={groups} weight={(g) => 3 + Math.min(12, g.items.length)} render={(g) => <NotificationGroup key={g.id} g={g} />} />
      </>
      : <div className="w-empty w-empty--l glass group-empty"><Icon name="checkCircle" size={32} /><span>Rien de nouveau cette semaine.</span></div>}
  </div>;
}
