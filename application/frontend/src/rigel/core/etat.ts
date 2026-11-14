/* ==========================================================================
   État du téléphone : appairage, instantané de la campagne, file des
   constats et historique, conservés en IndexedDB (base.ts).
   - Chaque action est enregistrée localement d'abord : le travail n'est
     jamais bloqué par le réseau.
   - Synchronisation au démarrage, au retour du réseau ou au premier plan,
     toutes les 15 secondes et à la demande : dépôt des constats en attente,
     puis lecture de l'instantané.
   - Un constat transmis reste affiché comme tel jusqu'à son intégration
     par ORION (constat « cst-<id> » présent dans l'instantané).
   ========================================================================== */

import { ecrire, lire, vider } from './base.ts';
import { AccesRefuse, deposer, telecharger } from './relais.ts';
import { precharger } from './ocr.ts';
import { lireAppairage } from '#shared/rigel.ts';
import type { Appairage, EvenementRigel, InstantaneRigel } from '#shared/rigel.ts';
import type { ConstatResultat } from '#shared/types.ts';

/** Constat du téléphone : en attente d'envoi, ou transmis au relais et pas encore intégré par ORION */
export interface ConstatLocal { evenement: EvenementRigel; etat: 'attente' | 'transmis' }
/** Constat du téléphone intégré par ORION */
export interface ConstatIntegre { evenement: EvenementRigel; resultat: ConstatResultat; message?: string; at: number }
export type Ton = 'ok' | 'install' | 'crit' | 'accent' | 'stock';

export interface Etat {
  pret: boolean;
  appairage: Appairage | null;
  /** Appairage lu pendant qu'une autre campagne est en cours : à confirmer */
  proposition: Appairage | null;
  instantane: InstantaneRigel | null;
  version: string | null;
  file: ConstatLocal[];
  historique: ConstatIntegre[];
  reseau: { enCours: boolean; synchroLe: number | null; erreur: string | null; refuse: boolean };
  /** Retour bref d'une action, affiché par le scanner et les écrans */
  annonce: { texte: string; ton: Ton; at: number } | null;
}

const HISTORIQUE = 200;
const INTERVALLE = 15_000;

let etat: Etat = {
  pret: false, appairage: null, proposition: null, instantane: null, version: null, file: [], historique: [],
  reseau: { enCours: false, synchroLe: null, erreur: null, refuse: false }, annonce: null,
};
const abonnes = new Set<() => void>();
const changer = (patch: Partial<Etat>) => { etat = { ...etat, ...patch }; for (const fn of abonnes) fn(); };

export const rigel = {
  get etat() { return etat; },
  abonner(fn: () => void) { abonnes.add(fn); return () => { abonnes.delete(fn); }; },
};

const enregistrerFile = () => ecrire('file', etat.file);

/** Chargement : données locales, appairage éventuellement lu dans l'adresse, puis synchronisation régulière */
export async function demarrer() {
  const [appairage, inst, file, historique] = await Promise.all([
    lire<Appairage>('appairage'), lire<{ version: string; instantane: InstantaneRigel }>('instantane'),
    lire<ConstatLocal[]>('file'), lire<ConstatIntegre[]>('historique'),
  ]);
  changer({ pret: true, appairage: appairage ?? null, instantane: inst?.instantane ?? null, version: inst?.version ?? null, file: file ?? [], historique: historique ?? [] });
  await lireAdresse();
  addEventListener('hashchange', () => void lireAdresse()); // lien d'appairage ouvert dans l'application déjà chargée
  addEventListener('online', () => void synchroniser());
  document.addEventListener('visibilitychange', () => { if (!document.hidden) void synchroniser(); });
  setInterval(() => { if (!document.hidden) void synchroniser(); }, INTERVALLE);
  void synchroniser();
}

/** Appairage lu dans le fragment de l'adresse, effacé aussitôt : la clé ne reste ni dans l'adresse ni dans l'historique */
async function lireAdresse() {
  const lu = lireAppairage(location.hash);
  if (!lu) return;
  history.replaceState(history.state, '', location.pathname + location.search);
  await proposer(lu);
}

/** Appairage lu (QR ou adresse) : appliqué directement, ou proposé si une autre campagne est en cours */
export async function proposer(a: Appairage) {
  if (!etat.appairage || etat.appairage.campagne === a.campagne) return appairer(a);
  changer({ proposition: a });
}
export const ecarterProposition = () => changer({ proposition: null });

/** Associe le téléphone à une campagne : les données d'une campagne précédente sont effacées */
export async function appairer(a: Appairage) {
  const meme = etat.appairage?.campagne === a.campagne;
  if (!meme) await vider();
  await ecrire('appairage', a);
  changer({
    appairage: a, proposition: null,
    ...(meme ? {} : { instantane: null, version: null, file: [], historique: [] }),
    reseau: { ...etat.reseau, erreur: null, refuse: false },
  });
  await synchroniser();
  void precharger().catch(() => {}); // ressources de lecture en cache pour le hors ligne
}

/** Dissocie le téléphone : toutes les données locales sont effacées */
export async function dissocier() {
  await vider();
  changer({ appairage: null, proposition: null, instantane: null, version: null, file: [], historique: [], reseau: { enCours: false, synchroLe: null, erreur: null, refuse: false } });
}

export function annoncer(texte: string, ton: Ton = 'ok') { changer({ annonce: { texte, ton, at: Date.now() } }); }

/** Enregistre un constat sur le téléphone, puis tente de le transmettre */
export async function constater(e: Omit<EvenementRigel, 'id' | 'observeLe'>) {
  const evenement: EvenementRigel = { ...e, id: crypto.randomUUID(), observeLe: Date.now() };
  changer({ file: [...etat.file, { evenement, etat: 'attente' }] });
  await enregistrerFile();
  void synchroniser();
  return evenement;
}

let enCours: Promise<void> | null = null;
/** Dépôt des constats en attente, puis lecture de l'instantané ; une seule synchronisation à la fois */
export function synchroniser() {
  enCours ??= executer().finally(() => { enCours = null; });
  return enCours;
}

async function executer() {
  const a = etat.appairage;
  if (!a) return;
  changer({ reseau: { ...etat.reseau, enCours: true } });
  try {
    const attente = etat.file.filter((c) => c.etat === 'attente').map((c) => c.evenement);
    for (let i = 0; i < attente.length; i += 100) {
      const recus = await deposer(a, attente.slice(i, i + 100));
      changer({ file: etat.file.map((c) => (recus.has(c.evenement.id) ? { ...c, etat: 'transmis' } : c)) });
      await enregistrerFile();
    }
    const { version, instantane } = await telecharger(a);
    if (etat.appairage?.campagne !== a.campagne) return; // dissocié pendant la synchronisation
    if (version !== etat.version) await ecrire('instantane', { version, instantane });
    integrer(instantane);
    changer({ instantane, version, reseau: { enCours: false, synchroLe: Date.now(), erreur: null, refuse: false } });
    await Promise.all([enregistrerFile(), ecrire('historique', etat.historique)]);
  } catch (error) {
    const refuse = error instanceof AccesRefuse;
    const erreur = refuse ? (error as Error).message : navigator.onLine ? 'Relais momentanément indisponible.' : 'Hors ligne.';
    changer({ reseau: { ...etat.reseau, enCours: false, erreur, refuse } });
  }
}

/** Constats transmis désormais intégrés par ORION : déplacés vers l'historique avec leur résultat */
function integrer(instantane: InstantaneRigel) {
  const constats = new Map(instantane.constats.map((c) => [c.id, c]));
  const integres: ConstatIntegre[] = [];
  const file = etat.file.filter((c) => {
    const constat = constats.get(`cst-${c.evenement.id}`);
    if (!constat) return true;
    integres.push({ evenement: c.evenement, resultat: constat.resultat, ...(constat.message && { message: constat.message }), at: constat.at });
    return false;
  });
  if (integres.length) changer({ file, historique: [...integres.reverse(), ...etat.historique].slice(0, HISTORIQUE) });
}
