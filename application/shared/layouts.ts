/* ==========================================================================
   Dispositions des tableaux de bord par défaut, par profil (RG-36 : tableaux
   spécialisés) ; partagées par le serveur (préférences) et le navigateur
   (réinitialisation d'un tableau).
   ========================================================================== */

import type { Layout, RoleId, Widget, WidgetSize } from './types.ts';

export function defaultLayouts(): Record<RoleId, Layout> {
  let i = 0;
  const w = (type: string, size: WidgetSize): Widget => ({ id: `w${++i}`, type, size });
  // Parc : indicateurs, où sont les matériels hors service, composition, garanties, acquisitions, listes
  const parc = () => [
    w('kpi.materiels', 'S'), w('kpi.affectes', 'S'), w('kpi.stock', 'S'), w('kpi.hs', 'S'),
    w('chart.hsBatiments', 'L'), w('chart.types', 'L'),
    w('chart.matriceHs', 'L'), w('list.surveiller', 'L'),
    w('chart.garanties', 'M'), w('chart.disponibilite', 'M'),
    w('chart.echeances', 'L'), w('chart.parcBatiments', 'L'),
    w('chart.receptions', 'XL'),
    w('chart.localisation', 'M'), w('chart.marques', 'M'),
    w('list.hs', 'M'), w('list.salles', 'M'),
    w('list.recents', 'XL'),
  ];
  // Remontées : file de travail, flux, ancienneté, répartition dans le temps, par type et par bâtiment
  const remontees = () => [
    w('kpi.attente', 'M'), w('kpi.traitees', 'S'), w('kpi.delai', 'S'),
    w('list.aTraiter', 'L'), w('chart.flux', 'L'),
    w('chart.anciennete', 'M'), w('chart.solde', 'M'),
    w('chart.calendrier', 'XL'),
    w('chart.semaines', 'L'), w('chart.problemes', 'M'), w('chart.statuts', 'M'),
    w('chart.taux', 'L'), w('chart.batiments', 'L'),
  ];
  // Synthèse : ce qui demande une action d'abord, puis l'état du parc et des postes
  const admin = () => ({
    perso: [
      w('kpi.hs', 'S'), w('kpi.attente', 'S'), w('kpi.traitees', 'S'), w('kpi.delai', 'S'),
      w('list.aTraiter', 'L'), w('chart.flux', 'L'),
      w('chart.hsBatiments', 'L'), w('list.surveiller', 'L'),
      w('chart.postes', 'M'), w('list.detections', 'M'),
      w('kpi.parc', 'M'), w('chart.garanties', 'M'),
    ],
    parc: parc(),
    remontees: remontees(),
  });
  return {
    admin: admin(),
    superadmin: admin(),
    gestionnaire: {
      perso: [
        w('kpi.stock', 'S'), w('kpi.hs', 'S'), w('kpi.attente', 'S'), w('kpi.deplacements', 'S'),
        w('list.aTraiter', 'L'), w('list.installations', 'L'),
        w('chart.garanties', 'M'), w('chart.hsTypes', 'M'),
        w('list.surveiller', 'L'), w('chart.echeances', 'L'),
        w('chart.receptions', 'XL'),
      ],
      parc: parc(),
      remontees: remontees(),
    },
    formateur: {
      perso: [
        w('kpi.mesattente', 'S'), w('kpi.salles', 'S'),
        w('chart.postes', 'M'),
        w('list.mesremontees', 'XL'),
      ],
    },
  };
}
