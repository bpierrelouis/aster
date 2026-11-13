/* ==========================================================================
   Notifications (RG-37, RG-55, RG-66, RG-67), regroupées par nature : le
   menu de la barre haute présente un résumé par groupe (« 12 matériels dont
   la garantie est échue »…), l'espace Notifications le détail de chacune.
   - Gestionnaire : nouvelles remontées de la semaine, garanties échues ou
     arrivant à échéance (état du parc), matériels à déplacer (installation).
   - Auteur d'une remontée (formateur, administrateurs) : évolution de ses
     remontées cette semaine, prises en charge par d'autres ou terminées
     (remplacées ou corrigées).
   - Administrateurs : interventions qu'ils ont demandées (installation,
     désinstallation, réinitialisation), terminées cette semaine, réussies ou
     en échec, et processus interdits lancés cette semaine (arrêtés
     automatiquement).
   ========================================================================== */

import { me } from './store.ts';
import { parc, remontees, detections, treatedAt, garantiePath } from './selectors.ts';
import { interventions } from './interventions.ts';
import { statut } from '#shared/catalog.ts';
import { DAY, plural } from '#shared/format.ts';
import type { Detection, EtapeRemontee, Materiel, Remontee, Timestamp } from '#shared/types.ts';
import type { MaterielADeplacer } from './selectors.ts';
import type { SuiviIntervention } from './interventions.ts';

/** Élément d'un groupe de notifications, selon sa nature (kind), daté (at) */
export type NotificationItem = { at: Timestamp } & (
  | { kind: 'remontee'; r: Remontee }
  | { kind: 'deplacement'; m: MaterielADeplacer }
  | { kind: 'garantie'; m: Materiel }
  | { kind: 'statut'; r: Remontee; h: EtapeRemontee }
  | { kind: 'intervention'; x: SuiviIntervention }
  | { kind: 'interdit'; d: Detection }
);
/** Groupe de notifications : résumé (title), page du détail (href), éléments les plus récents d'abord */
export interface NotificationGroup {
  id: string;
  icon: string;
  color: string;
  href: string;
  period: string;
  title: string;
  items: NotificationItem[];
}

/** Groupes non vides du compte connecté ; chaque élément porte sa date (at). */
export function notificationGroups(now = Date.now()): NotificationGroup[] {
  const since = now - 7 * DAY;
  const role = me().role;
  const groups: NotificationGroup[] = [];
  const add = (g: Omit<NotificationGroup, 'title'> & { title: (n: number) => string }) => { if (g.items.length) groups.push({ ...g, title: g.title(g.items.length), items: g.items.sort((a, b) => b.at - a.at) }); };

  if (role === 'gestionnaire') {
    add({
      id: 'remontees', icon: 'ticket', color: 'var(--wait)', href: '/remontees', period: 'Cette semaine',
      title: (n) => plural(n, 'nouvelle remontée', 'nouvelles remontées'),
      items: remontees().visible.filter((r) => r.createdAt > since).map((r) => ({ kind: 'remontee', at: r.createdAt, r })),
    });
    add({
      id: 'deplacements', icon: 'refresh', color: 'var(--c5)', href: '/salles/deplacements', period: 'Installation des salles',
      title: (n) => `${plural(n, 'matériel', 'matériels')} à déplacer`,
      items: parc().deplacements.map((m) => ({ kind: 'deplacement', at: m.deplacement.at, m })),
    });
    const { echues, proches } = parc().garanties;
    add({
      id: 'garanties-echues', icon: 'calendarWarn', color: 'var(--crit)', href: garantiePath('Échue'), period: 'État du parc',
      title: (n) => `${plural(n, 'matériel', 'matériels')} sous garantie échue`,
      items: echues.map((m) => ({ kind: 'garantie', at: m.garantieFin!, m })),
    });
    add({
      id: 'garanties-proches', icon: 'calendarWarn', color: 'var(--warn)', href: garantiePath('À échéance'), period: 'Fin de garantie dans les 6 mois',
      title: (n) => `${plural(n, 'matériel arrive', 'matériels arrivent')} à échéance`,
      items: proches.map((m) => ({ kind: 'garantie', at: m.garantieFin!, m })),
    });
  }

  // Évolution des remontées de l'auteur : même règle pour le formateur et les administrateurs ; le formateur les retrouve
  // dans l'onglet de leur phase, les administrateurs (qui voient toutes les remontées) dans « Mes remontées »
  if (['formateur', 'admin', 'superadmin'].includes(role)) {
    const tab = (phase: string) => (role === 'formateur' ? `/remontees/${phase}` : '/remontees/miennes');
    add({
      id: 'terminees', icon: 'checkCircle', color: 'var(--ok)', href: tab('terminees'), period: 'Cette semaine',
      title: (n) => plural(n, 'remontée terminée', 'remontées terminées'),
      items: remontees().mine.filter((r) => treatedAt(r)! > since).map((r) => { const h = r.historique.findLast((x) => statut(x.statut).phase === 'terminee')!; return { kind: 'statut', at: h.at, r, h }; }),
    });
    add({
      id: 'encours', icon: 'refresh', color: 'var(--c5)', href: tab('encours'), period: 'Cette semaine',
      title: (n) => plural(n, 'remontée prise en charge', 'remontées prises en charge'),
      items: remontees().mine.flatMap((r) => r.historique
        .filter((h) => statut(h.statut).phase === 'encours' && h.parId !== me().id && h.at > since)
        .map((h) => ({ kind: 'statut', at: h.at, r, h }))),
    });
  }

  if (role === 'admin' || role === 'superadmin') {
    // Interventions (installation, désinstallation, réinitialisation ; interventions()) demandées par le compte connecté
    add({
      id: 'interventions', icon: 'download', color: 'var(--ok)', href: '/administration/interventions', period: 'Cette semaine',
      title: (n) => plural(n, 'intervention terminée', 'interventions terminées'),
      items: interventions().filter((x) => x.o.parId === me().id && ['fait', 'echec'].includes(x.etat) && x.o.termineLe! > since).map((x) => ({ kind: 'intervention', at: x.o.termineLe!, x })),
    });
    add({
      id: 'interdits', icon: 'shieldX', color: 'var(--crit)', href: '/supervision/alertes', period: 'Cette semaine, arrêtés automatiquement',
      title: (n) => plural(n, 'processus interdit a été lancé', 'processus interdits ont été lancés'),
      items: detections().filter((d) => d.classement === 'blacklist' && d.at > since).map((d) => ({ kind: 'interdit', at: d.at, d })),
    });
  }
  return groups;
}
