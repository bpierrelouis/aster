/* ==========================================================================
   Notifications (RG-37, RG-55, RG-66, RG-67), regroupées par nature : le
   menu de la barre haute présente un résumé par groupe (« 12 matériels dont
   la garantie est échue »…), l'espace Notifications le détail de chacune.
   - Gestionnaire : nouvelles remontées de la semaine, garanties échues ou
     arrivant à échéance (état du parc), matériels à déplacer (installation).
   - Auteur d'une remontée (formateur, administrateurs) : ses remontées
     terminées (remplacées ou corrigées) cette semaine.
   - Formateur : ses remontées prises en charge par d'autres cette semaine.
   - Administrateurs : interventions terminées cette semaine (installation,
     désinstallation, réinstallation, réussies ou en échec) et processus
     interdits lancés cette semaine (arrêtés automatiquement).
   ========================================================================== */

import { me } from './store.js';
import { parc, remontees, detections, treatedAt } from './selectors.js';
import { interventions } from './interventions.js';
import { statut } from '#shared/catalog.js';
import { DAY, plural } from '#shared/format.js';


/** Groupes non vides du compte connecté ; chaque élément porte sa date (at). */
export function notificationGroups(now = Date.now()) {
  const since = now - 7 * DAY;
  const role = me().role;
  const groups = [];
  const add = (g) => { if (g.items.length) groups.push({ ...g, title: g.title(g.items.length), items: g.items.sort((a, b) => b.at - a.at) }); };

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
      id: 'garanties-echues', icon: 'calendarWarn', color: 'var(--crit)', href: `/materiels/inventaire?garantie=${encodeURIComponent('Échue')}`, period: 'État du parc',
      title: (n) => `${plural(n, 'matériel', 'matériels')} sous garantie échue`,
      items: echues.map((m) => ({ kind: 'garantie', at: m.garantieFin, m })),
    });
    add({
      id: 'garanties-proches', icon: 'calendarWarn', color: 'var(--warn)', href: `/materiels/inventaire?garantie=${encodeURIComponent('À échéance')}`, period: 'Fin de garantie dans les 6 mois',
      title: (n) => `${plural(n, 'matériel arrive', 'matériels arrivent')} à échéance`,
      items: proches.map((m) => ({ kind: 'garantie', at: m.garantieFin, m })),
    });
  }

  if (['formateur', 'admin', 'superadmin'].includes(role)) {
    add({
      id: 'terminees', icon: 'checkCircle', color: 'var(--ok)', href: role === 'formateur' ? '/remontees/terminees' : '/remontees/miennes', period: 'Cette semaine',
      title: (n) => plural(n, 'remontée terminée', 'remontées terminées'),
      items: remontees().mine.filter((r) => treatedAt(r) > since).map((r) => { const h = r.historique.findLast((x) => statut(x.statut).phase === 'terminee'); return { kind: 'statut', at: h.at, r, h }; }),
    });
  }

  if (role === 'formateur') {
    add({
      id: 'encours', icon: 'refresh', color: 'var(--c5)', href: '/remontees/encours', period: 'Cette semaine',
      title: (n) => plural(n, 'remontée prise en charge', 'remontées prises en charge'),
      items: remontees().mine.flatMap((r) => r.historique
        .filter((h) => statut(h.statut).phase === 'encours' && h.parId !== me().id && h.at > since)
        .map((h) => ({ kind: 'statut', at: h.at, r, h }))),
    });
  }

  if (role === 'admin' || role === 'superadmin') {
    add({
      id: 'interventions', icon: 'download', color: 'var(--ok)', href: '/administration/interventions', period: 'Cette semaine',
      title: (n) => plural(n, 'intervention terminée', 'interventions terminées'),
      items: interventions().filter((x) => ['fait', 'echec'].includes(x.etat) && x.o.termineLe > since).map((x) => ({ kind: 'intervention', at: x.o.termineLe, x })),
    });
    add({
      id: 'interdits', icon: 'shieldX', color: 'var(--crit)', href: '/supervision/alertes', period: 'Cette semaine, arrêtés automatiquement',
      title: (n) => plural(n, 'processus interdit a été lancé', 'processus interdits ont été lancés'),
      items: detections().filter((d) => d.classement === 'blacklist' && d.at > since).map((d) => ({ kind: 'interdit', at: d.at, d })),
    });
  }
  return groups;
}
