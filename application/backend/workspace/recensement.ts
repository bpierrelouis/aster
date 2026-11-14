/* ==========================================================================
   Espace de travail · recensement mobile (RIGEL)
   - Campagne : ouverte dans ORION par un gestionnaire, sur toute l'école ou
     sur des salles ; close à la demande ou à expiration. RIGEL est réservé
     au gestionnaire (ticket #156) : les administrateurs suivent en lecture.
   - Constats : produits par les téléphones, transmis chiffrés par le relais
     et le connecteur, intégrés ici (valeurs d'autorité fixées par le serveur).
   - Ouvrir un lieu sur le téléphone, c'est déclarer s'y trouver (RG-96) : un
     matériel scanné dans sa salle confirme son déplacement en mode installation
     ou enregistre sa présence en mode recensement ; affecté ailleurs, il est
     accepté ici (affecté au lieu, déplacement confirmé) ou
     refusé (retour lancé vers son affectation, à confirmer par le
     gestionnaire) ; un code inconnu reste à traiter dans ORION.
   - Clé et jeton d'une campagne sont dérivés du secret RIGEL_SECRET :
     aucun secret n'est conservé dans les données.
   ========================================================================== */

import { createHmac } from 'node:crypto';
import { DEVICE_TYPES } from '#shared/catalog.ts';
import { DUREE_CAMPAGNE, adresseAppairage, chiffrer, compact, dechiffrer, empreinte, parSerie } from '#shared/rigel.ts';
import { assert, fail, same } from './rules.ts';
import { journal, raison } from '../journal.ts';
import type { ActionConstat, Actor, Constat, Id, Materiel, Recensement, WorkspaceState } from '#shared/types.ts';
import type { Bloc, CampagnePubliee, EvenementRigel, InstantaneRigel, ResultatRigel } from '#shared/rigel.ts';
import type { LooseItem } from './rules.ts';

/** Campagne en cours : ni close, ni expirée */
export const ouverte = (r: Pick<Recensement, 'close' | 'expireLe'>, now = Date.now()) => !r.close && r.expireLe > now;

/** Salles d'une campagne : celles qu'elle désigne, sinon toutes les salles de l'école */
export const sallesDe = (state: Pick<WorkspaceState, 'salles'>, r: Pick<Recensement, 'ecoleId' | 'salleIds'>) =>
  state.salles.filter((s) => s.ecoleId === r.ecoleId && (!r.salleIds.length || r.salleIds.includes(s.id)));

/* ---------- Écritures des utilisateurs (appelées par mergeState) ---------- */

/** RIGEL réservé au gestionnaire (ticket #156, décision de l'utilisateur du 14 novembre) : campagnes, constats et appairage */
const reserve = (actor: Actor) => { if (actor.role !== 'gestionnaire') fail(403, 'Recensement réservé au gestionnaire.'); };

/** Ouverture ou clôture d'une campagne ; x : élément proposé, old : élément enregistré */
export function regleRecensement(x: LooseItem, old: LooseItem | undefined, state: WorkspaceState, actor: Actor, now: number) {
  reserve(actor);
  if (!old) {
    assert(typeof x.nom === 'string' && x.nom.trim() && x.nom.length <= 120, 'Nom de la campagne obligatoire.');
    x.nom = x.nom.trim();
    assert(['installation', 'recensement'].includes(String(x.mode)), 'Type de campagne invalide.');
    assert(Array.isArray(x.salleIds) && x.salleIds.length <= 2000 && new Set(x.salleIds).size === x.salleIds.length, 'Salles invalides.');
    assert(x.salleIds.every((sid) => state.salles.some((s) => s.id === sid && s.ecoleId === x.ecoleId)), 'Salle inconnue ou hors école.');
    Object.assign(x, { at: now, par: actor.nom, parId: actor.id, expireLe: now + DUREE_CAMPAGNE });
    delete x.close;
    return;
  }
  const stable = (r: LooseItem) => Object.fromEntries(Object.entries(r).filter(([k]) => k !== 'close'));
  assert(same(stable(old), stable(x)), 'Seule la clôture d’une campagne peut être modifiée.');
  if (old.close) assert(same(old.close, x.close), 'Une campagne close ne peut pas être rouverte.');
  else if (x.close) x.close = { at: now, par: actor.nom, parId: actor.id };
}

/** Traitement d'un constat (code inconnu ou écart) : seul ce suivi est modifiable par un utilisateur */
export function regleConstat(x: LooseItem, old: LooseItem | undefined, actor: Actor, now: number) {
  if (!old) fail(403, 'Les constats sont transmis par les téléphones.');
  reserve(actor);
  const stable = (c: LooseItem) => Object.fromEntries(Object.entries(c).filter(([k]) => k !== 'traite'));
  assert(same(stable(old), stable(x)), 'Seul le traitement d’un constat peut être modifié.');
  if (old.traite) assert(same(old.traite, x.traite), 'Ce constat est déjà traité.');
  else if (x.traite) {
    assert(['ajoute', 'ecarte'].includes(String(x.traite.action)) && old.resultat !== 'ecart', 'Choisissez une action adaptée au constat.');
    x.traite = { at: now, par: actor.nom, parId: actor.id, action: x.traite.action };
  }
}

/** Résout un écart dans ORION et enregistre définitivement l'action choisie. */
export function traiterConstat(s: WorkspaceState, id: Id, action: ActionConstat, actor: Actor, now = Date.now()) {
  reserve(actor);
  const c = s.constats.find((x) => x.id === id && x.ecoleId === actor.ecoleId);
  if (!c) fail(404, 'Constat introuvable.');
  if (c.traite) fail(400, 'Ce constat est déjà traité.');
  if (c.resultat !== 'ecart' || !c.materielId) fail(400, 'Ce constat ne correspond pas à un écart de localisation.');
  if (!['stock', 'affectation', 'constat'].includes(action)) fail(400, 'Action de traitement invalide.');
  const m = s.materiels.find((x) => x.id === c.materielId && x.ecoleId === c.ecoleId);
  if (!m) fail(404, 'Matériel introuvable.');
  const trace = { at: now, par: actor.nom, parId: actor.id };
  const affectation = m.salleId ?? null;
  if (action === 'stock') {
    m.salleId = null;
    delete m.deplacement;
    m.installation = { de: c.salleId, ...trace };
  } else if (action === 'affectation') {
    delete m.deplacement;
    m.installation = { de: c.salleId, ...trace };
  } else {
    if (m.hs && c.salleId) fail(400, 'Un matériel hors service ne peut aller qu’au stock.');
    m.salleId = c.salleId;
    delete m.deplacement;
    m.installation = { de: affectation, ...trace };
  }
  c.traite = { ...trace, action };
}

/* ---------- Clé, jeton et appairage ---------- */

const derive = (secret: string, usage: string, id: Id) => createHmac('sha256', secret).update(`${usage}:${id}`).digest('base64url');
/** Clé AES-256 de la campagne (base64url) */
export const cleCampagne = (secret: string, id: Id) => derive(secret, 'cle', id);
/** Jeton du téléphone auprès du relais ; le relais n'en connaît que l'empreinte */
export const jetonCampagne = (secret: string, id: Id) => derive(secret, 'jeton', id);

/** Adresse d'appairage d'une campagne ouverte du périmètre du compte */
export function appairage(state: WorkspaceState, actor: Actor, id: Id, { secret, url }: { secret: string; url: string | null }) {
  reserve(actor);
  const r = state.recensements.find((x) => x.id === id && x.ecoleId === actor.ecoleId);
  if (!r) fail(404, 'Campagne introuvable.');
  if (!ouverte(r)) fail(400, 'Cette campagne est close.');
  if (!url) fail(503, 'L’application mobile n’est pas configurée.');
  return { url: adresseAppairage(url, { campagne: r.id, jeton: jetonCampagne(secret, r.id), cle: cleCampagne(secret, r.id) }), expireLe: r.expireLe };
}

/* ---------- Instantané publié ---------- */

const versRigel = (m: Materiel) => ({ id: m.id, idOrion: m.idOrion, type: m.type, modele: m.modele, marque: m.marque, serie: m.serie, salleId: m.salleId, hs: m.hs, enCours: !!m.deplacement });

/** Données consultées par le téléphone : salles de la campagne, matériels de l'école, constats déjà intégrés */
export function instantane(state: WorkspaceState, r: Recensement): InstantaneRigel {
  return {
    campagne: { id: r.id, nom: r.nom, ecole: state.ecoles.find((e) => e.id === r.ecoleId)?.nom ?? '', mode: r.mode, expireLe: r.expireLe },
    salles: sallesDe(state, r).map((s) => ({ id: s.id, nom: s.nom, batiment: s.batiment, etage: s.etage ?? null }))
      .sort((a, b) => a.batiment.localeCompare(b.batiment, 'fr', { numeric: true }) || a.nom.localeCompare(b.nom, 'fr', { numeric: true })),
    materiels: state.materiels.filter((m) => m.ecoleId === r.ecoleId).map(versRigel),
    constats: state.constats.filter((c) => c.recensementId === r.id).map((c) => ({ id: c.id, materielId: c.materielId, salleId: c.salleId, resultat: c.resultat, ...(c.message && { message: c.message }), at: c.at })),
  };
}

/** Campagnes ouvertes, chacune avec son instantané chiffré, sa version et l'empreinte du jeton des téléphones */
export async function campagnesPubliees(state: WorkspaceState, secret: string, now = Date.now()): Promise<CampagnePubliee[]> {
  return Promise.all(state.recensements.filter((r) => ouverte(r, now)).map(async (r) => {
    const contenu = instantane(state, r);
    return {
      id: r.id, expireLe: r.expireLe,
      empreinte: await empreinte(jetonCampagne(secret, r.id)),
      version: await empreinte(JSON.stringify(contenu)),
      instantane: await chiffrer(cleCampagne(secret, r.id), r.id, contenu),
    };
  }));
}

/** Événements chiffrés reçus du relais, déchiffrés ; un bloc illisible est refusé */
export async function dechiffrerEvenements(secret: string, campagne: Id, blocs: { id: string; bloc: Bloc }[]) {
  return Promise.all(blocs.map(async ({ id, bloc }) => {
    try {
      const e = await dechiffrer<EvenementRigel>(cleCampagne(secret, campagne), campagne, bloc);
      return e && e.id === id ? e : { id, illisible: true as const };
    } catch { return { id, illisible: true as const }; }
  }));
}

/* ---------- Intégration des constats (écriture système) ---------- */

const ID = /^[\w-]{8,100}$/;
const texte = (v: unknown, max: number) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null);
const LOCALISE: readonly Constat['resultat'][] = ['confirme', 'present', 'deplace', 'range', 'retour'];

/**
 * Date de la dernière information sur l'emplacement d'un matériel : observation d'un téléphone (sa date d'observation, pas
 * celle de son arrivée), déplacement prévu ou installation confirmée dans ORION. Une relocalisation observée avant est dépassée :
 * un téléphone resté hors ligne n'écrase pas une information plus récente.
 */
function derniereInformation(s: WorkspaceState, m: Materiel) {
  const constats = s.constats.filter((c) => c.materielId === m.id && LOCALISE.includes(c.resultat));
  // Installation confirmée ou retour lancé par un constat : sa date d'observation compte, pas celle de son intégration
  const parTelephone = new Set(constats.map((c) => c.at));
  const retours = new Set(constats.filter((c) => c.resultat === 'retour').map((c) => c.at));
  const dansOrion = m.installation && !parTelephone.has(m.installation.at) ? m.installation.at : 0;
  const prevu = m.deplacement && !retours.has(m.deplacement.at) ? m.deplacement.at : 0;
  return Math.max(0, prevu, dansOrion, ...constats.map((c) => c.observeLe));
}

/**
 * Intègre les événements d'une campagne dans l'état (modifié en place) et renvoie le résultat de chacun.
 * Un événement déjà intégré est un doublon ; auteur et date sont ceux de la campagne et du serveur.
 */
export function appliquerEvenements(s: WorkspaceState, campagne: Id, evenements: (EvenementRigel | { id: string; illisible: true })[], now = Date.now()): ResultatRigel[] {
  const r = s.recensements.find((x) => x.id === campagne);
  const par = { par: r?.par ?? 'RIGEL', parId: r?.parId ?? null };
  return evenements.map((e) => {
    // Un événement inattendu est refusé seul : il ne bloque ni les autres, ni la campagne, ni ORION
    try { return appliquer(s, r, e, par, now); } catch (error) {
      journal.warn('rigel_constat_refuse', { campagne, evenement: String(e?.id ?? ''), erreur: raison(error) });
      return { id: String(e?.id ?? ''), statut: 'refuse', message: 'Constat illisible par le serveur.' };
    }
  });
}

function appliquer(s: WorkspaceState, r: Recensement | undefined, e: EvenementRigel | { id: string; illisible: true }, par: { par: string; parId: Id | null }, now: number): ResultatRigel {
  const id = String(e?.id ?? '');
  if (!ID.test(id)) return { id, statut: 'refuse', message: 'Identifiant invalide.' };
  const cid = `cst-${id}`;
  if (s.constats.some((c) => c.id === cid)) return { id, statut: 'doublon' };
  if ('illisible' in e) return { id, statut: 'refuse', message: 'Événement illisible.' };
  if (!r || !ouverte(r, now)) return { id, statut: 'refuse', message: 'Campagne close.' };
  // Les constats confirment des installations au nom de l'ouvreur : une campagne d'un autre profil n'est plus appliquée
  if (s.comptes.find((c) => c.id === r.parId)?.role !== 'gestionnaire') return { id, statut: 'refuse', message: 'Campagne non ouverte par un gestionnaire.' };
  if (!['vu', 'releve', 'retour', 'inconnu'].includes(e.type)) return { id, statut: 'refuse', message: 'Constat inconnu.' };
  const salleId = e.salleId ?? null;
  if (salleId !== null && !sallesDe(s, r).some((x) => x.id === salleId)) return { id, statut: 'refuse', message: 'Salle hors de la campagne.' };
  const code = texte(e.code, 200) ?? '';
  const ecole = s.materiels.filter((m) => m.ecoleId === r.ecoleId);
  // Un code « inconnu » pour un téléphone dont l'instantané est ancien peut désigner un matériel connu
  const serieSaisie = typeof e.saisie?.serie === 'string' ? e.saisie.serie : '';
  const connu = e.type === 'inconnu' && code ? ecole.find((m) => compact(m.idOrion) === compact(code)) ?? parSerie(ecole, code) ?? parSerie(ecole, serieSaisie) : undefined;
  const m = connu ?? ecole.find((x) => x.id === e.materielId);
  const type = connu ? 'vu' : e.type;
  const constat: Constat = {
    id: cid, recensementId: r.id, ecoleId: r.ecoleId, type, code, salleId, materielId: m?.id ?? null,
    observeLe: Number.isFinite(e.observeLe) ? Math.min(e.observeLe, now) : now, at: now, resultat: 'inconnu',
  };
  if (e.type === 'inconnu' && !connu) {
    const t = e.saisie;
    if (t) {
      constat.saisie = {
        type: DEVICE_TYPES.some((d) => d.id === t.type) ? t.type : 'autre',
        modele: texte(t.modele, 250) ?? 'Non renseigné', marque: texte(t.marque, 120), serie: texte(t.serie, 120),
        ...(Number.isFinite(t.garantieFin) && { garantieFin: t.garantieFin }),
      };
    }
  } else if (!m) return { id, statut: 'refuse', message: 'Matériel inconnu ou hors école.' };
  else if (constat.observeLe < derniereInformation(s, m)) Object.assign(constat, { resultat: 'refuse', message: 'Constat dépassé : ce matériel a été vu ou déplacé depuis.' });
  else if ((m.salleId ?? null) === salleId) {
    if (r.mode === 'installation' && m.deplacement) { m.installation = { de: m.deplacement.de, at: now, ...par }; delete m.deplacement; constat.resultat = 'confirme'; }
    else constat.resultat = 'present';
  } else if (e.type === 'vu' || connu) constat.resultat = 'ecart'; // téléphone d'une version antérieure (« Signaler sans déplacer »)
  else if (e.type === 'retour') {
    // Présence refusée : le matériel est ici et doit être ramené à son affectation, inchangée ; le gestionnaire confirmera son installation
    m.deplacement = { de: salleId, at: now, ...par };
    delete m.installation;
    constat.resultat = 'retour';
  }
  else if (m.hs && salleId) Object.assign(constat, { resultat: 'refuse', message: 'Un matériel hors service ne peut aller qu’au stock.' });
  else {
    // Relocalisation constatée sur place : affectation et déplacement physique confirmés ensemble
    const de = m.deplacement ? m.deplacement.de : m.salleId ?? null;
    m.salleId = salleId;
    delete m.deplacement;
    m.installation = { de, at: now, ...par };
    constat.resultat = salleId ? 'deplace' : 'range';
  }
  s.constats.push(constat);
  return constat.resultat === 'refuse' ? { id, statut: 'refuse', message: constat.message } : { id, statut: 'applique' };
}
