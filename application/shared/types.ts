/* ==========================================================================
   Types des données ORION, communs au navigateur et au serveur.
   La forme des objets suit le glossaire et les règles de gestion ;
   les dates sont des horodatages en millisecondes.
   ========================================================================== */

export type Id = string;
/** Horodatage en millisecondes depuis l'époque Unix */
export type Timestamp = number;

export type RoleId = 'superadmin' | 'admin' | 'gestionnaire' | 'formateur';
export type DeviceTypeId = 'uc' | 'videoprojecteur' | 'reseau' | 'peripherique' | 'ecran' | 'audio' | 'imprimante' | 'autre';
export type RemonteeStatut = 'attente' | 'encours' | 'remplace' | 'corrige';
export type RemonteePhase = 'attente' | 'encours' | 'terminee';
export type ProblemId = 'power' | 'display' | 'network' | 'broken' | 'malfunction' | 'other';
export type Classement = 'blacklist' | 'nonref' | 'whitelist';
export type OperationType = 'installation' | 'desinstallation' | 'reinstallation' | 'arret';
/** Intervention demandée sur les postes (l'arrêt d'un processus relève de la supervision) */
export type InterventionType = Exclude<OperationType, 'arret'>;
export type OperationStatut = 'enregistree' | 'terminee' | 'echec';
export type ResultatPoste = 'en_attente' | 'reussie' | 'echec';
export type Portee = 'global' | 'ecole' | 'batiment' | 'salle';

/** Auteur et date d'une action enregistrée par le serveur */
export interface Trace {
  at: Timestamp;
  par: string;
  parId: Id | null;
}

/** Déplacement physique d'un matériel ; de : salle d'origine, null pour le stock */
export interface Mouvement extends Trace {
  de: Id | null;
}

export interface Ecole {
  id: Id;
  nom: string;
}

export interface Etage {
  id: Id;
  ecoleId: Id;
  batiment: string;
  niveau: number;
}

export interface Salle {
  id: Id;
  ecoleId: Id;
  batiment: string;
  nom: string;
  etage?: number | null;
}

export interface Materiel {
  id: Id;
  ecoleId: Id;
  idOrion: string;
  salleId: Id | null;
  type: DeviceTypeId;
  modele: string;
  marque: string | null;
  serie: string | null;
  dateReception: Timestamp;
  garantieFin: Timestamp | null;
  hs: boolean;
  /** Date de mise hors service, fixée par le serveur ; absente pour un matériel en service */
  dateHs?: Timestamp;
  /** Affectation enregistrée, déplacement physique non encore confirmé */
  deplacement?: Mouvement;
  /** Dernier déplacement physique confirmé */
  installation?: Mouvement;
}

export interface Poste {
  id: Id;
  salleId: Id;
  nomReseau: string;
  /** Unité centrale du poste */
  materielId: Id | null;
  /** allume, session, vuLe et adresseIp : remontés par le poste (API des postes), jamais écrits par le navigateur */
  allume: boolean;
  /** Compte Windows connecté */
  session?: string | null;
  vuLe?: Timestamp | null;
  /** Adresse IPv4 remontée par le poste dans ses rapports ; jamais saisie par un utilisateur */
  adresseIp?: string;
}

export interface Compte {
  id: Id;
  nom: string;
  email: string;
  role: RoleId;
  ecoleId: Id | null;
  actif: boolean;
  /** Dernière connexion réussie, fixée par le serveur ; absente si le compte ne s'est jamais connecté */
  derniereConnexion?: Timestamp;
  /** Date de désactivation, fixée par le serveur ; absente pour un compte actif */
  dateDesactivation?: Timestamp;
  /** Sujet OIDC de l'identité rapprochée ; jamais transmis au navigateur */
  sujet?: string;
}

export interface EtapeRemontee extends Trace {
  statut: RemonteeStatut;
}

export interface Remontee {
  id: Id;
  ecoleId: Id;
  auteur: string;
  auteurId?: Id;
  createdAt: Timestamp;
  materielIds: Id[];
  /** Type de problème proposé (ProblemId) ou libellé précisé pour « Autre » ; obligatoire */
  probleme: string;
  description: string;
  statut: RemonteeStatut;
  historique: EtapeRemontee[];
}

export interface Detection {
  id: Id;
  at: Timestamp;
  posteId: Id;
  salleId: Id;
  ecoleId?: Id;
  processus: string;
  compte: string;
  classement: Classement;
  arret: 'réussi' | 'échec' | null;
}

export interface Application {
  id: Id;
  nom: string;
  version: string;
  editeur: string;
}

export interface Regle {
  id: Id;
  nom: string;
  classement: Exclude<Classement, 'nonref'>;
  portee: Portee;
  ecoleId: Id | null;
  batiment?: string;
  salleId?: Id;
}

export interface Operation {
  id: Id;
  type: OperationType;
  /** Postes visés */
  cibles: Id[];
  salleId?: Id;
  ecoleId: Id;
  at: Timestamp;
  par: string;
  parId: Id | null;
  statut: OperationStatut;
  resultats: Record<Id, ResultatPoste>;
  applicationId?: Id;
  image?: string;
  processusId?: Id;
  detectionId?: Id;
  /** Arrêt demandé automatiquement pour un processus interdit */
  auto?: boolean;
  termineLe?: Timestamp;
}

export interface Processus {
  id: Id;
  posteId: Id;
  salleId: Id;
  ecoleId?: Id;
  nom: string;
  compte: string;
  startedAt: Timestamp;
  stoppedAt: Timestamp | null;
}

export interface Installation {
  id: Id;
  posteId: Id;
  salleId: Id;
  ecoleId?: Id;
  applicationId: Id;
}

/** Collections de l'espace de travail, dans l'ordre de `collections` (backend/workspace/rules.ts) */
export interface Collections {
  ecoles: Ecole[];
  salles: Salle[];
  etages: Etage[];
  materiels: Materiel[];
  postes: Poste[];
  remontees: Remontee[];
  detections: Detection[];
  applications: Application[];
  comptes: Compte[];
  regles: Regle[];
  operations: Operation[];
  processus: Processus[];
  installations: Installation[];
}
export type CollectionName = keyof Collections;
/** Élément d'une collection quelconque */
export type Item = Collections[CollectionName][number];

/* ---------- Préférences d'un compte ---------- */

export interface DisplayPrefs {
  ambiance: string;
  tone: string;
  glass: string;
  accent: string;
}

export type WidgetSize = 'S' | 'M' | 'L' | 'XL';
export interface Widget {
  id: string;
  type: string;
  size: WidgetSize;
}
/** Tableaux de bord prédéfinis */
export type Board = 'perso' | 'parc' | 'remontees';
/** Tableau de bord ajouté par un compte */
export interface TableauPerso {
  id: string;
  nom: string;
}
/** Disposition des tableaux de bord d'un profil : widgets de chaque tableau, prédéfini ou ajouté (par identifiant), et liste des tableaux ajoutés */
export interface Layout {
  perso?: Widget[];
  parc?: Widget[];
  remontees?: Widget[];
  tableaux?: TableauPerso[];
  [board: string]: Widget[] | TableauPerso[] | undefined;
}

/** École affichée par le super administrateur : une école ou toutes */
export type EcoleChoisie = Id | 'all';

export interface PreferencesCompte {
  prefs?: DisplayPrefs;
  layouts?: Layout;
  /** Dernière consultation des notifications */
  seenAt?: Timestamp;
  ecoleId?: EcoleChoisie;
}

/* ---------- États ---------- */

/** État complet de l'espace, tenu par le serveur */
export interface WorkspaceState extends Collections {
  version: number;
  revision: number;
  seededAt?: Timestamp | null;
  preferences: Record<Id, PreferencesCompte>;
}

/** Utilisateur agissant : compte actif connecté */
export interface Actor {
  id: Id;
  nom: string;
  email: string;
  role: RoleId;
  ecoleId: Id | null;
}

/** Données transmises au navigateur pour un compte (scopedState) */
export interface WorkspaceView extends Collections {
  version: number;
  revision: number;
  seededAt?: Timestamp | null;
  role: RoleId;
  moi: Actor;
  prefs: DisplayPrefs;
  layouts: Partial<Record<RoleId, Layout>>;
  seenAt: Partial<Record<RoleId, Timestamp>>;
  ecoleId: EcoleChoisie | null;
}
