/* ==========================================================================
   RECON · recensement mobile du parc : contrat commun à ORION, au connecteur,
   au relais et à l'application mobile.
   - Le téléphone ne joint jamais ORION : il échange avec le relais, sur
     Internet, des blocs chiffrés que seuls ORION et le téléphone lisent.
   - La clé d'une campagne est transmise au téléphone par le QR d'appairage,
     dans le fragment de l'adresse (#…), que le navigateur n'envoie jamais.
   - Chiffrement AES-GCM 256 (Web Crypto, navigateur et Node.js) ; données
     authentifiées : l'identifiant de la campagne.
   ========================================================================== */

import type { ConstatResultat, ConstatType, DeviceTypeId, Id, Timestamp } from './types.ts';

/* ---------- Échanges ---------- */

/** Bloc chiffré : vecteur d'initialisation et données, en base64url */
export interface Bloc { iv: string; data: string }

/** Informations saisies pour un matériel inconnu */
export interface Saisie { type: DeviceTypeId; modele: string; marque: string | null; serie: string | null }

/** Constat produit par le téléphone, en clair avant chiffrement. id : généré par le téléphone, rend l'envoi idempotent. */
export interface EvenementRecon {
  id: string;
  type: ConstatType;
  /** Valeur lue (code, numéro de série) ou saisie */
  code: string;
  /** Salle constatée ; null : stock */
  salleId: Id | null;
  /** Matériel reconnu par le téléphone ; null pour un code inconnu */
  materielId: Id | null;
  observeLe: Timestamp;
  saisie?: Saisie;
}

export interface SalleRecon { id: Id; nom: string; batiment: string; etage: number | null }
export interface MaterielRecon {
  id: Id; idOrion: string; type: DeviceTypeId; modele: string; marque: string | null; serie: string | null;
  /** Salle d'affectation ; null : stock */
  salleId: Id | null;
  hs: boolean;
  /** Affectation enregistrée dont le déplacement physique n'est pas encore confirmé */
  enCours: boolean;
}
/** Constat intégré par ORION, renvoyé au téléphone */
export interface ConstatRecon { id: Id; materielId: Id | null; salleId: Id | null; resultat: ConstatResultat; message?: string; at: Timestamp }

/** Instantané d'une campagne : ce que le téléphone consulte hors ligne */
export interface InstantaneRecon {
  campagne: { id: Id; nom: string; ecole: string; expireLe: Timestamp };
  /** Salles de la campagne, dans l'ordre d'affichage */
  salles: SalleRecon[];
  /** Matériels de l'école */
  materiels: MaterielRecon[];
  constats: ConstatRecon[];
}

/** Résultat de l'intégration d'un événement par ORION */
export interface ResultatRecon { id: string; statut: 'applique' | 'doublon' | 'refuse'; message?: string }

/** Campagne publiée par ORION pour le connecteur */
export interface CampagnePubliee { id: Id; expireLe: Timestamp; empreinte: string; version: string; instantane: Bloc }

/** Accès d'un téléphone à une campagne, lu dans le fragment du QR d'appairage */
export interface Appairage { campagne: Id; jeton: string; cle: string }

/* ---------- Libellés ---------- */

export const RESULTATS: Record<ConstatResultat, { label: string; icon: string; tone: 'ok' | 'install' | 'crit' | 'stock' | 'accent' }> = {
  confirme: { label: 'Installation confirmée', icon: 'checkCircle', tone: 'ok' },
  present: { label: 'Présent', icon: 'checkCircle', tone: 'ok' },
  deplace: { label: 'Relocalisé', icon: 'deplacement', tone: 'accent' },
  range: { label: 'Rangé au stock', icon: 'stockage', tone: 'stock' },
  ecart: { label: 'Vu dans une autre salle', icon: 'alert', tone: 'install' },
  inconnu: { label: 'Code inconnu', icon: 'search', tone: 'install' },
  refuse: { label: 'Refusé', icon: 'shieldX', tone: 'crit' },
};

/** Durée d'ouverture d'une campagne */
export const DUREE_CAMPAGNE = 14 * 24 * 60 * 60 * 1000;

/* ---------- Étiquettes et appairage ---------- */

/** Contenu des étiquettes ORION (QR code ou Data Matrix) */
export const etiquette = {
  salle: (id: Id) => `ORION:SALLE:${id}`,
  stock: (ecoleId: Id) => `ORION:STOCK:${ecoleId}`,
  materiel: (idOrion: string) => `ORION:MAT:${idOrion}`,
};

/** Adresse d'appairage : application mobile, campagne, jeton et clé dans le fragment */
export const adresseAppairage = (base: string, a: Appairage) => `${base.replace(/\/+$/, '')}/#${new URLSearchParams({ c: a.campagne, j: a.jeton, k: a.cle })}`;

/** Appairage lu dans une adresse (ou son seul fragment) ; null si incomplet */
export function lireAppairage(valeur: string): Appairage | null {
  const fragment = valeur.slice(valeur.indexOf('#') + 1);
  const p = new URLSearchParams(fragment);
  const [campagne, jeton, cle] = [p.get('c'), p.get('j'), p.get('k')];
  return campagne && jeton && cle && /^[\w-]{1,80}$/.test(campagne) ? { campagne, jeton, cle } : null;
}

/* ---------- Résolution d'un code lu ---------- */

export type Cible =
  | { type: 'salle'; salle: SalleRecon }
  | { type: 'stock' }
  | { type: 'materiel'; materiel: MaterielRecon }
  | { type: 'appairage'; appairage: Appairage }
  | { type: 'inconnu'; code: string };

/** Forme comparable d'un numéro de série ou d'un identifiant : capitales, sans espaces, tirets ni points */
export const compact = (valeur: string) => valeur.toUpperCase().replace(/[\s\-_.\/]+/g, '');

const GS = '\u001d';
/** Identifiants d'application GS1 de longueur fixe : longueur des données */
const GS1_FIXES: Record<string, number> = { '00': 18, '01': 14, '02': 14, '11': 6, '12': 6, '13': 6, '15': 6, '16': 6, '17': 6, '20': 2 };
/**
 * Numéro de série d'une étiquette structurée, null sinon :
 * - ISO/IEC 15434 avec identifiants de données ANSI MH10.8.2 (« [)>␞06␝S… ») : champ S ;
 * - GS1 commençant par un GTIN (01) : identifiant d'application 21, champs variables séparés par GS.
 */
export function serieStructuree(valeur: string): string | null {
  if (valeur.startsWith('[)>')) {
    const champ = valeur.split(/[\u001d\u001e\u0004]/).find((x) => /^S[A-Z0-9][\w\-./]*$/i.test(x));
    return champ ? champ.slice(1) : null;
  }
  let reste = valeur.replace(/^\](?:d2|C1|Q3)/, '');
  if (!/^01\d{14}/.test(reste)) return null;
  while (reste.length > 2) {
    const ai = reste.slice(0, 2);
    if (ai === '21') return reste.slice(2).split(GS)[0] || null;
    if (GS1_FIXES[ai]) { reste = reste.slice(2 + GS1_FIXES[ai]).replace(/^\u001d/, ''); continue; }
    const fin = reste.indexOf(GS); // champ variable (lot 10…) : jusqu'au séparateur
    if (fin < 0) return null;
    reste = reste.slice(fin + 1);
  }
  return null;
}

/** Préfixes souvent imprimés devant un numéro de série */
const PREFIXES_SERIE = /^(?:S\/?N|SER(?:IAL)?(?:NO|NUMBER)?|NS|NO\.?DESERIE)[:#]?/;

/**
 * Résout une valeur lue (code, étiquette, texte) dans l'instantané : étiquette ORION, adresse d'appairage,
 * identifiant ORION, numéro de série (étiquette constructeur structurée comprise).
 */
export function resoudre(brut: string, inst: Pick<InstantaneRecon, 'salles' | 'materiels'>): Cible {
  const valeur = brut.trim();
  const appairage = valeur.includes('#') ? lireAppairage(valeur) : null;
  if (appairage) return { type: 'appairage', appairage };
  const orion = valeur.match(/^ORION:(SALLE|STOCK|MAT):(.+)$/i);
  if (orion) {
    const [, genre, cle] = orion;
    if (genre.toUpperCase() === 'STOCK') return { type: 'stock' };
    if (genre.toUpperCase() === 'SALLE') {
      const salle = inst.salles.find((s) => s.id === cle) ?? inst.salles.find((s) => s.id.toLowerCase() === cle.toLowerCase());
      return salle ? { type: 'salle', salle } : { type: 'inconnu', code: valeur };
    }
    const materiel = inst.materiels.find((m) => compact(m.idOrion) === compact(cle));
    return materiel ? { type: 'materiel', materiel } : { type: 'inconnu', code: valeur };
  }
  const trouver = (cle: string) => (cle ? inst.materiels.find((m) => compact(m.idOrion) === cle) ?? inst.materiels.find((m) => m.serie && compact(m.serie) === cle) : undefined);
  const serie = serieStructuree(valeur);
  const materiel = trouver(compact(valeur)) ?? (serie ? trouver(compact(serie)) : trouver(compact(valeur).replace(PREFIXES_SERIE, '')));
  return materiel ? { type: 'materiel', materiel } : { type: 'inconnu', code: serie ?? valeur };
}

/* Confusions courantes de la reconnaissance de caractères, ramenées à un même caractère */
const CONFUSIONS: Record<string, string> = { O: '0', Q: '0', D: '0', I: '1', L: '1', S: '5', B: '8', Z: '2', G: '6' };
const canonique = (valeur: string) => compact(valeur).replace(PREFIXES_SERIE, '').replace(/[^A-Z0-9]/g, '').replace(/[OQDILSBZG]/g, (c) => CONFUSIONS[c]);

/**
 * Matériels dont le numéro de série correspond au texte reconnu, aux confusions courantes près (O/0, I/1, S/5, B/8…).
 * Le texte peut contenir plusieurs lignes : chacune est essayée, puis chaque mot.
 */
export function rapprocherSerie(texte: string, materiels: readonly MaterielRecon[]): MaterielRecon[] {
  const essais = new Set<string>();
  for (const ligne of texte.split(/\n+/)) {
    const c = canonique(ligne);
    if (c.length >= 4) essais.add(c);
    for (const mot of ligne.split(/\s+/)) { const m = canonique(mot); if (m.length >= 4) essais.add(m); }
  }
  return materiels.filter((m) => m.serie && essais.has(canonique(m.serie)));
}

/** Texte reconnu ramené à un numéro de série plausible : plus long mot alphanumérique, sans préfixe */
export function serieLue(texte: string) {
  const mots = texte.split(/\s+/).map((m) => compact(m).replace(PREFIXES_SERIE, '').replace(/[^A-Z0-9]/g, '')).filter((m) => m.length >= 4);
  return mots.sort((a, b) => b.length - a.length)[0] ?? '';
}

/* ---------- Chiffrement ---------- */

const texte = new TextEncoder();
const lecture = new TextDecoder();

export function versBase64url(octets: Uint8Array) {
  let binaire = '';
  for (let i = 0; i < octets.length; i += 0x8000) binaire += String.fromCharCode(...octets.subarray(i, i + 0x8000));
  return btoa(binaire).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
export function depuisBase64url(valeur: string) {
  const binaire = atob(valeur.replace(/-/g, '+').replace(/_/g, '/'));
  const octets = new Uint8Array(binaire.length);
  for (let i = 0; i < binaire.length; i++) octets[i] = binaire.charCodeAt(i);
  return octets;
}

const cles = new Map<string, Promise<CryptoKey>>();
function cleAes(cle: string) {
  if (!cles.has(cle)) {
    const octets = depuisBase64url(cle);
    if (octets.length !== 32) throw new Error('Clé de campagne invalide.');
    cles.set(cle, crypto.subtle.importKey('raw', octets, 'AES-GCM', false, ['encrypt', 'decrypt']));
  }
  return cles.get(cle)!;
}

/** Chiffre une valeur JSON ; campagne : identifiant authentifié avec le bloc */
export async function chiffrer(cle: string, campagne: string, valeur: unknown): Promise<Bloc> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: texte.encode(campagne) }, await cleAes(cle), texte.encode(JSON.stringify(valeur)));
  return { iv: versBase64url(iv), data: versBase64url(new Uint8Array(data)) };
}

/** Déchiffre un bloc de la campagne ; une erreur si la clé, la campagne ou le contenu ne correspondent pas */
export async function dechiffrer<T>(cle: string, campagne: string, bloc: Bloc): Promise<T> {
  if (!bloc || typeof bloc.iv !== 'string' || typeof bloc.data !== 'string') throw new Error('Bloc invalide.');
  const clair = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: depuisBase64url(bloc.iv), additionalData: texte.encode(campagne) }, await cleAes(cle), depuisBase64url(bloc.data));
  return JSON.parse(lecture.decode(clair)) as T;
}

/** Empreinte SHA-256 (hexadécimal) : version d'un instantané, jeton vérifié par le relais */
export async function empreinte(valeur: string) {
  const h = new Uint8Array(await crypto.subtle.digest('SHA-256', texte.encode(valeur)));
  return [...h].map((b) => b.toString(16).padStart(2, '0')).join('');
}
