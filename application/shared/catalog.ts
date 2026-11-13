/* ==========================================================================
   Référentiels ORION : types de matériel, états, statuts de remontée,
   profils. Une entité = une icône + une couleur, partout dans l'application.
   Sources : docs/00-GLOSSAIRE, docs/04-REGLES-DE-GESTION, docs/12-MATRICE-DROITS.
   ========================================================================== */

import { DAY } from './format.ts';
import type { DeviceTypeId, Id, InterventionType, Materiel, Poste, ProblemId, Remontee, RemonteePhase, RemonteeStatut, RoleId } from './types.ts';

/** Pastille d'état (témoin lumineux) */
export type Led = 'ok' | 'hs' | 'wait';

/* Types de matériel : le cadrage ne fixe pas de liste exhaustive (§ 4) ;
   ces catégories servent au classement visuel et restent modifiables. */
export const DEVICE_TYPES: { id: DeviceTypeId; label: string; plural: string; icon: string; color: string }[] = [
  { id: 'uc', label: 'Unité centrale', plural: 'Unités centrales', icon: 'tower', color: 'var(--c1)' },
  { id: 'videoprojecteur', label: 'Vidéoprojecteur', plural: 'Vidéoprojecteurs', icon: 'projector', color: 'var(--c2)' },
  { id: 'reseau', label: 'Réseau', plural: 'Matériel réseau', icon: 'switch', color: 'var(--c3)' },
  { id: 'peripherique', label: 'Périphérique', plural: 'Périphériques', icon: 'periph', color: 'var(--c4)' },
  { id: 'ecran', label: 'Écran', plural: 'Écrans', icon: 'monitor', color: 'var(--c5)' },
  { id: 'audio', label: 'Audio et vidéo', plural: 'Audio et vidéo', icon: 'speaker', color: 'var(--c6)' },
  { id: 'imprimante', label: 'Imprimante', plural: 'Imprimantes', icon: 'printer', color: 'var(--c7)' },
  { id: 'autre', label: 'Autre', plural: 'Autres', icon: 'materiel', color: 'var(--c8)' },
];

/* État binaire « hors service : oui/non » (RG-08) */
export const ETATS = {
  ok: { id: 'ok', label: 'En service', icon: 'checkCircle', led: 'ok' },
  hs: { id: 'hs', label: 'Hors service', icon: 'power', led: 'hs' },
};
/** Clé de rapprochement d'un numéro de série (import JSON) : sans espaces de début et de fin, en minuscules ; null si absent */
export const serieKey = (s: unknown) => (typeof s === 'string' && s.trim() ? s.trim().toLowerCase() : null);

/* Installation physique (orientation de l'utilisateur du 11 novembre, à soumettre au client,
   cadrage § 23). Une affectation enregistrée dans ORION reste en cours tant que le
   déplacement physique n'est pas confirmé (aujourd'hui d'un clic, demain par le scanner).
   Le serveur tient deux champs du matériel : deplacement { de, at, par, parId } (en cours ;
   de : salle d'origine physique, null pour le stock) et installation { de, at, par, parId }
   (dernier déplacement confirmé). Point orange : en cours ; point vert : installé. */
/** État logistique d'un matériel ; done : libellé de la confirmation du déplacement en cours */
export type Logistique = { id: string; label: string; tone: string; done?: string };
export const LOGISTIQUE: Record<'stock' | 'installe' | 'encours' | 'rapatrier', Logistique> = {
  stock: { id: 'stock', label: 'En stock', tone: 'none' },
  installe: { id: 'installe', label: 'Installé', tone: 'ok' },
  encours: { id: 'encours', label: 'En cours d’installation', tone: 'wait', done: 'installé' },
  rapatrier: { id: 'rapatrier', label: 'À rapatrier au stock', tone: 'wait', done: 'rangé au stock' },
};
export const logistique = (m: Pick<Materiel, 'deplacement' | 'salleId'>) => (m.deplacement ? (m.salleId ? LOGISTIQUE.encours : LOGISTIQUE.rapatrier) : m.salleId ? LOGISTIQUE.installe : LOGISTIQUE.stock);
/** Statut d'une salle : en cours d'installation tant qu'un déplacement y arrive ou en part, équipée ensuite */
export const SALLE_STATUTS = {
  installation: { id: 'installation', label: 'En cours d’installation', tone: 'wait' },
  equipee: { id: 'equipee', label: 'Équipée', tone: 'ok' },
};

/* Statuts d'une remontée (RG-13). « En cours » est une orientation de l'utilisateur du 11 novembre
   (cadrage, § 23). Le client n'a pas retenu la validation par l'auteur (12 novembre) : une
   remontée remplacée ou corrigée est terminée. */
export const REMONTEE_STATUTS: { id: RemonteeStatut; label: string; icon: string; color: string; led: Led; phase: RemonteePhase }[] = [
  { id: 'attente', label: 'En attente', icon: 'hourglass', color: 'var(--wait)', led: 'wait', phase: 'attente' },
  { id: 'encours', label: 'En cours', icon: 'refresh', color: 'var(--c5)', led: 'wait', phase: 'encours' },
  { id: 'remplace', label: 'Remplacé', icon: 'swap', color: 'var(--accent)', led: 'ok', phase: 'terminee' },
  { id: 'corrige', label: 'Corrigé', icon: 'check', color: 'var(--ok)', led: 'ok', phase: 'terminee' },
];

/* Suivi d'une remontée, de la transmission à la fin du traitement (détail, état des lieux et son PDF) :
   étapes franchies, tirées de l'historique tenu par le serveur, puis étapes restantes */
/** Étape du suivi d'une remontée : franchie (at, par) ou à venir (todo, sub) */
export interface EtapeSuivi {
  statut: RemonteeStatut | 'terminee';
  label: string;
  icon: string;
  at?: number;
  par?: string;
  sub?: string;
  todo?: boolean;
}
export function suiviRemontee(r: Pick<Remontee, 'historique' | 'createdAt' | 'auteur' | 'statut'>): EtapeSuivi[] {
  const historique: { statut: RemonteeStatut; at: number; par: string }[] = r.historique?.length ? r.historique : [{ statut: 'attente', at: r.createdAt, par: r.auteur }];
  const phase = phaseOf(r);
  return [
    ...historique.map((h, i) => ({ statut: h.statut, label: i === 0 ? 'Transmise, en attente' : statut(h.statut).label, icon: i === 0 ? 'documents' : statut(h.statut).icon, at: h.at, par: h.par })),
    ...[
      phase === 'attente' && { statut: 'encours' as const, label: 'En cours', icon: 'refresh', sub: 'Prise en charge par le gestionnaire' },
      phase !== 'terminee' && { statut: 'terminee' as const, label: 'Remplacé ou corrigé', icon: 'checkCircle', sub: 'Traitement par le gestionnaire' },
    ].filter((s) => s !== false).map((s) => ({ ...s, todo: true })),
  ];
}

/* Phases du traitement : colonnes des backlogs (remontées, installations) et onglets des remontées ;
   mêmes libellés et icônes partout : sablier, flèches tournantes, coche verte */
export const REMONTEE_PHASES: { id: RemonteePhase; label: string; icon: string; hint: string }[] = [
  { id: 'attente', label: 'En attente', icon: 'hourglass', hint: 'Transmises, pas encore prises en charge' },
  { id: 'encours', label: 'En cours', icon: 'refresh', hint: 'Prises en charge' },
  { id: 'terminee', label: 'Terminées', icon: 'checkCircle', hint: 'Remplacées ou corrigées' },
];
/** Les colonnes « Terminées » des backlogs gardent 30 jours */
export const TERMINEES_RECENTES = 30 * DAY;
/** Une remontée en attente ou en cours est ouverte ; remplacée ou corrigée, elle est terminée */
export const remonteeOuverte = (r: Pick<Remontee, 'statut'>) => phaseOf(r) !== 'terminee';
/** Matériel cité par une remontée : sa fiche est conservée pour que la remontée reste consultable (RG-73) */
export const materielCite = (remontees: readonly Pick<Remontee, 'materielIds'>[], materielId: Id) => remontees.some((r) => r.materielIds.includes(materielId));

/* Types de problème (contenu de l'état des lieux, RG-14) : liste proposée */
export const PROBLEMS: { id: ProblemId; label: string; icon: string }[] = [
  { id: 'power', label: 'Ne s’allume pas', icon: 'noPower' },
  { id: 'display', label: 'Pas d’image', icon: 'noDisplay' },
  { id: 'network', label: 'Connexion', icon: 'noNetwork' },
  { id: 'broken', label: 'Casse', icon: 'broken' },
  { id: 'malfunction', label: 'Fonctionnement anormal', icon: 'malfunction' },
  { id: 'other', label: 'Autre', icon: 'other' },
];

/* Profils (RG-01) */
export const ROLES: { id: RoleId; label: string; icon: string; color: string }[] = [
  { id: 'admin', label: 'Administrateur', icon: 'shield', color: 'var(--accent)' },
  { id: 'gestionnaire', label: 'Gestionnaire', icon: 'materiel', color: 'var(--c5)' },
  { id: 'formateur', label: 'Formateur', icon: 'user', color: 'var(--c3)' },
  { id: 'superadmin', label: 'Super administrateur', icon: 'school', color: 'var(--encre)' },
];
/* Numéros attribués par ORION : MAT-0001 (matériel), REM-0101 (remontée) */
export const numeroMateriel = (rang: number) => `MAT-${String(rang).padStart(4, '0')}`;
export const numeroRemontee = (rang: number) => `REM-${String(rang).padStart(4, '0')}`;
/** Rang d'un numéro attribué (0 s'il n'en suit pas le format) */
export const rangDuNumero = (numero: unknown) => Number(String(numero).slice(4)) || 0;

/** Profil connu (contrôle des écritures et de la configuration) */
export const isRole = (value: unknown): value is RoleId => ROLES.some((r) => r.id === value);

/* Interventions sur les postes (Administration › Interventions) : une demande vise une salle entière ou un seul poste,
   chaque poste l'exécute et renvoie son résultat. État d'un poste : en attente (éteint ou indisponible), en cours
   (connecté, il l'exécute), fait, ou échec renvoyé par le poste. L'arrêt d'un processus relève de la supervision. */
/** État d'un poste pour une intervention */
export type EtatIntervention = 'attente' | 'encours' | 'fait' | 'echec';
export const INTERVENTIONS: { id: InterventionType; label: string; verbe: string; icon: string; etats: Record<Exclude<EtatIntervention, 'echec'>, string> }[] = [
  { id: 'installation', label: 'Installation', verbe: 'Installer', icon: 'download', etats: { attente: 'En attente d’installation', encours: 'En cours d’installation', fait: 'Installé' } },
  { id: 'desinstallation', label: 'Désinstallation', verbe: 'Désinstaller', icon: 'trash', etats: { attente: 'En attente de désinstallation', encours: 'En cours de désinstallation', fait: 'Désinstallé' } },
  // Réinitialisation (nommée réinstallation jusqu'au 12 novembre ; identifiant inchangé) : image de référence réappliquée
  { id: 'reinstallation', label: 'Réinitialisation', verbe: 'Réinitialiser', icon: 'refresh', etats: { attente: 'En attente de réinitialisation', encours: 'En cours de réinitialisation', fait: 'Réinitialisé' } },
];
export const ETATS_INTERVENTION: Record<EtatIntervention, { id: EtatIntervention; tone: string; icon: string; label?: string }> = {
  attente: { id: 'attente', tone: 'attente', icon: 'hourglass' },
  encours: { id: 'encours', tone: 'encours', icon: 'refresh' },
  fait: { id: 'fait', tone: 'ok', icon: 'checkCircle' },
  echec: { id: 'echec', tone: 'hs', icon: 'alert', label: 'Échec' },
};

/* État d'un poste supervisé (orientation de l'utilisateur du 12 novembre) : éteint ou indisponible (aucun rapport
   depuis 30 secondes), allumé (rapports, aucune session) ou connecté (session ouverte) ; allumé et connecté ont le
   même témoin. Un poste dont l'unité centrale est hors service ne peut être ni allumé ni connecté. */
export const ETATS_POSTE = {
  hs: { id: 'hs', label: 'Matériel hors service', led: 'hs' },
  eteint: { id: 'eteint', label: 'Éteint ou indisponible', led: 'wait' },
  allume: { id: 'allume', label: 'Allumé', led: 'ok' },
  connecte: { id: 'connecte', label: 'Connecté', led: 'ok' },
};
/** État d'un poste ; materiel : son unité centrale */
export const etatPoste = (p: Pick<Poste, 'allume' | 'session'> | null | undefined, materiel: Pick<Materiel, 'hs'> | null | undefined) => (materiel?.hs ? ETATS_POSTE.hs : !p?.allume ? ETATS_POSTE.eteint : p.session ? ETATS_POSTE.connecte : ETATS_POSTE.allume);

/* Classement d'un processus (RG-45) */
export const CLASSEMENTS = {
  blacklist: { label: 'Liste noire', icon: 'shieldX', led: 'hs' },
  nonref: { label: 'Non référencé', icon: 'malfunction', led: 'wait' },
  whitelist: { label: 'Liste blanche', icon: 'shield', led: 'ok' },
};

export const byId = <T extends { id: string }>(list: readonly T[], id: unknown): T | undefined => list.find((x) => x.id === id);
export const deviceType = (id: unknown) => byId(DEVICE_TYPES, id) ?? DEVICE_TYPES[7];
export const statut = (id: unknown) => byId(REMONTEE_STATUTS, id) ?? REMONTEE_STATUTS[0];
/** Phase d'une remontée (attente, encours, terminee) */
export const phaseOf = (r: Pick<Remontee, 'statut'>) => statut(r.statut).phase;
export const problem = (id: unknown) => byId(PROBLEMS, id) ?? {
  ...PROBLEMS[5], label: typeof id === 'string' && id.trim() ? id.trim() : PROBLEMS[5].label,
};
export const role = (id: unknown) => byId(ROLES, id) ?? ROLES[0];
/** Intervention sur les postes ; undefined pour l'arrêt d'un processus */
export const intervention = (id: unknown) => byId(INTERVENTIONS, id);
/** Libellé d'un état d'intervention : « En cours d'installation », « Installé », « Échec » */
export const etatIntervention = (type: string, etat: EtatIntervention) => ETATS_INTERVENTION[etat].label ?? intervention(type)!.etats[etat as Exclude<EtatIntervention, 'echec'>];
export const etat = (m: Pick<Materiel, 'hs'> | null | undefined) => (m?.hs ? ETATS.hs : ETATS.ok);
