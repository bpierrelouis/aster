import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import type { AddressInfo } from 'node:net';
import { initialState, actorOf, scopedState, mergeState } from './rules.ts';
import { createWorkspaceRepository } from './engine.ts';
import { createRigelRouter, createWorkspaceRouter } from './routes.ts';
import { appliquerEvenements, cleCampagne, cloreInstallations, instantane, jetonCampagne, lancerInstallation, traiterConstat } from './recensement.ts';
import { chiffrer, choisirCode, dechiffrer, empreinte, etiquette, lireAppairage, lireEtiquette, rapprocherSerie, resoudre, serieLue } from '#shared/rigel.ts';
import type { EvenementRigel, InstantaneRigel } from '#shared/rigel.ts';
import type { Id, Recensement, WorkspaceState } from '#shared/types.ts';
import type { Ecriture, HttpError } from './rules.ts';

const ADMIN = 'cpt-num-admin', MANAGER = 'cpt-num-gestionnaire', TEACHER = 'cpt-num-formateur';
const as = (state: WorkspaceState, accountId: Id) => actorOf(state, accountId)!;

/** Recensement lancé par le gestionnaire de l'École du numérique (toutes les salles si salleIds est vide) */
function ouvrir(state: WorkspaceState, salleIds: Id[] = []) {
  const actor = as(state, MANAGER);
  const input: Ecriture = scopedState(state, actor);
  input.recensements.push({ id: 'navigateur', ecoleId: 'e-num', nom: ' Rentrée ', mode: 'recensement', salleIds, at: 0, par: 'falsifié', parId: null, expireLe: 0 });
  const next = mergeState(state, input, actor);
  return { next, campagne: next.recensements.at(-1)! };
}

const evt = (e: Partial<EvenementRigel> & Pick<EvenementRigel, 'type'>): EvenementRigel => ({ id: crypto.randomUUID(), code: '', salleId: null, materielId: null, observeLe: Date.now(), ...e });

test('étiquettes et lecture : codes ORION, identifiant, numéro de série, étiquettes constructeur, appairage', () => {
  const state = initialState();
  const { next, campagne } = ouvrir(state);
  const inst = instantane(next, campagne);
  const m = inst.materiels.find((x) => x.serie)!;
  const salle = inst.salles[0];
  assert.deepEqual(resoudre(etiquette.salle(salle.id), inst), { type: 'salle', salle });
  assert.deepEqual(resoudre(etiquette.stock('e-num'), inst), { type: 'stock' });
  assert.equal(resoudre(etiquette.materiel(m.idOrion), inst).type, 'materiel');
  assert.equal(resoudre(m.idOrion.toLowerCase(), inst).type, 'materiel', 'identifiant ORION sans tenir compte de la casse');
  assert.deepEqual(resoudre(` ${m.serie!.toLowerCase()} `, inst), { type: 'materiel', materiel: m }, 'numéro de série d’un code-barres');
  assert.deepEqual(resoudre(`S/N: ${m.serie}`, inst), { type: 'materiel', materiel: m }, 'préfixe imprimé');
  assert.deepEqual(resoudre(`[)>\u001e06\u001dP12345\u001dS${m.serie}\u001e\u0004`, inst), { type: 'materiel', materiel: m }, 'Data Matrix ISO/IEC 15434');
  assert.equal(lireEtiquette(`0109501101530003\u001d21SN-42\u001d10LOT`)?.serie ?? null, 'SN-42', 'GS1 : séparateur après le GTIN toléré');
  assert.equal(lireEtiquette('0412345678')?.serie ?? null, null, 'code-barres ordinaire');
  assert.equal(lireEtiquette(`010950110153000317261231\u001d21SN-42`)?.serie ?? null, 'SN-42');
  assert.equal(lireEtiquette(`01095011015300031726123110LOT7\u001d21ABC`)?.serie ?? null, 'ABC');
  assert.deepEqual(resoudre('INCONNU-777', inst), { type: 'inconnu', code: 'INCONNU-777' });
  assert.deepEqual(resoudre('https://rigel.test/#c=rec-1&j=J&k=K', inst), { type: 'appairage', appairage: { campagne: 'rec-1', jeton: 'J', cle: 'K' } });
  assert.equal(lireAppairage('https://rigel.test/#c=rec-1&j=J'), null);
  // Reconnaissance de caractères : confusions courantes ramenées au même caractère
  const lu = m.serie!.replace(/0/g, 'O').replace(/1/g, 'I');
  assert.deepEqual(rapprocherSerie(`Modèle X\nS/N ${lu}`, inst.materiels).map((x) => x.id), [m.id]);
  assert.equal(serieLue('Serial No: AB-1234 Made in'), 'AB1234');
});

test('étiquettes réelles : Data Matrix DIRISI, codes-barres Lenovo, Acer et Philips', () => {
  // Contenus décodés sur des photos d'étiquettes (tabulations entre les champs DIRISI)
  const dirisiUc = 'SGY12.31F.SS4SG0548\tSS4SG0548\t2CF05DC90096\t2020-057\t1300157350\t10/2024\t7021-146027780';
  const dirisiEcran = 'F9065.E24.MMTH3EE02E529024804256\tMMTH3EE02E529024804256\t\t2024_000664\t1300197958\t02/2027\t7025-14-6120910';
  const lenovo = '1S30DJS3CX00S4SG0457';
  assert.deepEqual(lireEtiquette(dirisiUc), { serie: 'SS4SG0548', garantieFin: new Date(2024, 10, 0, 12).getTime() });
  assert.equal(new Date(lireEtiquette(dirisiEcran)!.garantieFin!).getDate(), 28, 'dernier jour de février 2027');
  assert.deepEqual(lireEtiquette(lenovo), { serie: 'S4SG0457', marque: 'Lenovo' });
  assert.equal(lireEtiquette('UHB2035021640'), null);

  const materiel = (id: string, serie: string) => ({ id, idOrion: id.toUpperCase(), type: 'uc' as const, modele: 'P340', marque: null, serie, salleId: null, hs: false, enCours: false });
  const inst = { salles: [], materiels: [materiel('m-1', 'S4SG0548'), materiel('m-2', 'SS4SG0457'), materiel('m-3', 'UHB2035021640')] };
  assert.equal((resoudre(dirisiUc, inst) as { materiel: { id: string } }).materiel.id, 'm-1', 'numéro DIRISI « S » + numéro constructeur');
  assert.equal((resoudre(lenovo, inst) as { materiel: { id: string } }).materiel.id, 'm-2', 'code Lenovo, numéro noté par la DIRISI');
  assert.deepEqual(resoudre(dirisiEcran, inst), { type: 'inconnu', code: 'MMTH3EE02E529024804256', lue: lireEtiquette(dirisiEcran) });
  assert.deepEqual(rapprocherSerie('N série SS4SG0548', inst.materiels).map((m) => m.id), ['m-1'], 'lecture de caractères de l’étiquette DIRISI');

  // Plusieurs codes dans la même image : jamais l'EAN ni le modèle
  const vide = { salles: [], materiels: [] };
  assert.equal(choisirCode([{ format: 'ean_13', valeur: '4711474186157' }, { format: 'code_128', valeur: 'MMTH3EE02E529024804256' }], vide), 'MMTH3EE02E529024804256');
  assert.equal(choisirCode([{ format: 'code_39', valeur: '242V8A/86' }, { format: 'code_39', valeur: 'UHB2035021640' }], vide), 'UHB2035021640');
  assert.equal(choisirCode([{ format: 'code_39', valeur: '242V8A/86' }], vide), null, 'modèle seul : la lecture continue');
  assert.equal(choisirCode([{ format: 'ean_13', valeur: '4711474186157' }], vide), null);
  assert.equal(choisirCode([{ format: 'code_128', valeur: 'AUTRE-CODE-LONG' }, { format: 'data_matrix', valeur: dirisiUc }], vide), dirisiUc, 'étiquette structurée d’abord');
  assert.equal(choisirCode([{ format: 'code_128', valeur: 'AUTRE-CODE-LONG' }, { format: 'code_39', valeur: 'UHB2035021640' }], inst), 'UHB2035021640', 'matériel connu d’abord');
});

test('chiffrement : clé et campagne authentifiées', async () => {
  const cle = cleCampagne('secret', 'rec-1');
  const bloc = await chiffrer(cle, 'rec-1', { a: 1 });
  assert.deepEqual(await dechiffrer(cle, 'rec-1', bloc), { a: 1 });
  await assert.rejects(dechiffrer(cle, 'rec-2', bloc), 'bloc déplacé vers une autre campagne');
  await assert.rejects(dechiffrer(cleCampagne('autre', 'rec-1'), 'rec-1', bloc));
  assert.notEqual(jetonCampagne('secret', 'rec-1'), jetonCampagne('secret', 'rec-2'));
});

test('recensement : lancé par un gestionnaire, valeurs fixées par le serveur, clôture seule modifiable', () => {
  const state = initialState();
  const salle = state.salles.find((s) => s.ecoleId === 'e-num')!;
  const { next, campagne } = ouvrir(state, [salle.id]);
  assert.match(campagne.id, /^rec-/);
  assert.equal(campagne.nom, 'Rentrée');
  assert.equal(campagne.par, 'Sophie Garnier');
  assert(campagne.expireLe > Date.now() + 13 * 86400e3);
  assert.equal(scopedState(next, as(next, TEACHER)).recensements.length, 0, 'invisible au formateur');
  assert.equal(scopedState(next, as(next, 'cpt-res-admin')).recensements.length, 0, 'invisible à une autre école');

  const teacher = as(next, TEACHER);
  const parFormateur: Ecriture = scopedState(next, teacher);
  parFormateur.recensements.push({ ...campagne, id: 'x' });
  assert.throws(() => mergeState(next, parFormateur, teacher), (e: HttpError) => e.status === 403);

  // RIGEL réservé au gestionnaire (ticket #156) : les administrateurs suivent la campagne sans l'ouvrir ni la clore
  for (const accountId of [ADMIN, 'cpt-superadmin']) {
    const admin = as(next, accountId);
    assert.equal(scopedState(next, admin).recensements.length, 1, `${accountId} : campagne visible en lecture`);
    const ouverture: Ecriture = scopedState(next, admin);
    ouverture.recensements.push({ ...campagne, id: 'z' });
    assert.throws(() => mergeState(next, ouverture, admin), (e: HttpError) => e.status === 403 && /réservé au gestionnaire/.test(e.message));
    const cloture: Ecriture = scopedState(next, admin);
    cloture.recensements[0].close = { at: 1, par: '', parId: null };
    assert.throws(() => mergeState(next, cloture, admin), (e: HttpError) => e.status === 403);
  }

  const manager = as(next, MANAGER);
  const horsEcole: Ecriture = scopedState(next, manager);
  horsEcole.recensements.push({ ...campagne, id: 'y', salleIds: [next.salles.find((s) => s.ecoleId === 'e-res')!.id] });
  assert.throws(() => mergeState(next, horsEcole, manager), /hors école/);

  const renomme: Ecriture = scopedState(next, manager);
  renomme.recensements[0].nom = 'Autre';
  assert.throws(() => mergeState(next, renomme, manager), /clôture/);
  const supprime: Ecriture = scopedState(next, manager);
  supprime.recensements = [];
  assert.throws(() => mergeState(next, supprime, manager), /clôt/);

  const close: Ecriture = scopedState(next, manager);
  close.recensements[0].close = { at: 1, par: 'falsifié', parId: null };
  const closed = mergeState(next, close, manager);
  const fermee = closed.recensements[0] as Recensement;
  assert.equal(fermee.close?.par, 'Sophie Garnier');
  assert(fermee.close!.at > 1);
  const rouvre: Ecriture = scopedState(closed, manager);
  delete rouvre.recensements[0].close;
  assert.throws(() => mergeState(closed, rouvre, manager), /rouvert/);
});

test('constats : une opération qui n’a pas été lancée par un gestionnaire n’est pas appliquée', () => {
  const s = initialState();
  const admin = s.comptes.find((c) => c.id === ADMIN)!;
  s.recensements.push({ id: 'rec-admin', ecoleId: 'e-num', nom: 'Ancienne', mode: 'recensement', salleIds: [], at: Date.now(), par: admin.nom, parId: admin.id, expireLe: Date.now() + 86400e3 });
  const enCours = s.materiels.find((m) => m.ecoleId === 'e-num' && m.deplacement && m.salleId)!;
  const [r] = appliquerEvenements(s, 'rec-admin', [evt({ type: 'vu', materielId: enCours.id, salleId: enCours.salleId })]);
  assert.deepEqual(r, { id: r.id, statut: 'refuse', message: 'Opération non lancée par un gestionnaire.' });
  assert(enCours.deplacement, 'déplacement toujours en cours');
});

test('constats : présence, écart (version antérieure), relocalisation, stock, hors service, code inconnu ajouté au parc, doublon', () => {
  const { next: s, campagne } = ouvrir(initialState());
  const enCours = s.materiels.find((m) => m.ecoleId === 'e-num' && m.deplacement && m.salleId)!;
  const installe = s.materiels.find((m) => m.ecoleId === 'e-num' && !m.deplacement && m.salleId && !m.hs && m.id !== enCours.id)!;
  const autreSalle = s.salles.find((x) => x.ecoleId === 'e-num' && x.id !== installe.salleId)!;
  const hs = s.materiels.find((m) => m.ecoleId === 'e-num' && m.hs && m.salleId)!;
  const etranger = s.materiels.find((m) => m.ecoleId === 'e-res')!;
  const origine = installe.salleId;
  const autre = s.materiels.find((m) => m.ecoleId === 'e-num' && m.serie && ![enCours.id, installe.id, hs.id].includes(m.id) && !m.deplacement)!;

  const confirme = evt({ type: 'vu', materielId: enCours.id, salleId: enCours.salleId, code: enCours.idOrion });
  const doublon = { ...confirme };
  const ecart = evt({ type: 'vu', materielId: installe.id, salleId: autreSalle.id });
  const releve = evt({ type: 'releve', materielId: installe.id, salleId: autreSalle.id });
  const range = evt({ type: 'releve', materielId: autre.id, salleId: null });
  const refuse = evt({ type: 'releve', materielId: hs.id, salleId: autreSalle.id === hs.salleId ? s.salles.find((x) => x.ecoleId === 'e-num' && x.id !== hs.salleId)!.id : autreSalle.id });
  const garantieFin = new Date(2027, 2, 0, 12).getTime();
  const inconnu = evt({ type: 'inconnu', code: 'NOUVEAU-1', salleId: autreSalle.id, saisie: { type: 'ecran', modele: ' P2422H ', marque: 'Dell', serie: 'XYZ-9', garantieFin } });
  const ancienInconnu = evt({ type: 'inconnu', code: 'SANS-SAISIE', salleId: autreSalle.id });
  const etrangerVu = evt({ type: 'vu', materielId: etranger.id, salleId: autreSalle.id });
  const nombre = s.materiels.length;
  const dernier = Math.max(...s.materiels.map((x) => Number(x.idOrion.slice(4))));
  const resultats = appliquerEvenements(s, campagne.id, [confirme, doublon, ecart, releve, range, refuse, inconnu, ancienInconnu, etrangerVu]);

  assert.deepEqual(resultats.map((r) => r.statut), ['applique', 'doublon', 'applique', 'applique', 'applique', 'refuse', 'applique', 'applique', 'refuse']);
  const m = (id: Id) => s.materiels.find((x) => x.id === id)!;
  assert(m(enCours.id).deplacement, 'recensement : la présence ne confirme pas le déplacement prévu');
  assert.equal(m(installe.id).salleId, autreSalle.id, 'relocalisé');
  assert.equal(m(installe.id).installation?.de, origine);
  assert.equal(m(installe.id).deplacement, undefined, 'relocalisation constatée : déjà installé');
  assert.equal(m(autre.id).salleId, null, 'rangé au stock');
  assert.equal(m(hs.id).salleId, hs.salleId, 'hors service : refusé hors du stock');
  const constats = s.constats.filter((c) => c.recensementId === campagne.id);
  assert.deepEqual(constats.map((c) => c.resultat), ['present', 'ecart', 'deplace', 'range', 'refuse', 'ajoute', 'inconnu']);
  // Code inconnu confirmé sur le téléphone : ajouté au parc par le serveur, dans le lieu du scan, sans déplacement à confirmer
  const ajoute = constats.at(-2)!;
  assert.deepEqual(ajoute.saisie, { type: 'ecran', modele: 'P2422H', marque: 'Dell', serie: 'XYZ-9', garantieFin });
  assert.equal(s.materiels.length, nombre + 1);
  const nouveau = m(ajoute.materielId!);
  assert.deepEqual({ ...nouveau, id: '', dateReception: 0 }, { id: '', ecoleId: 'e-num', idOrion: `MAT-${String(dernier + 1).padStart(4, '0')}`, salleId: autreSalle.id, type: 'ecran', modele: 'P2422H', marque: 'Dell', serie: 'XYZ-9', dateReception: 0, garantieFin, hs: false });
  assert.equal(constats.at(-1)!.materielId, null, 'ancien téléphone, sans saisie : à traiter dans ORION');
  // Même numéro de série scanné par un second agent : rattaché au matériel ajouté, sans doublon
  appliquerEvenements(s, campagne.id, [evt({ type: 'inconnu', code: 'xyz 9', salleId: autreSalle.id, saisie: { type: 'ecran', modele: 'Écran', marque: null, serie: 'XYZ-9' } })]);
  assert.equal(s.materiels.length, nombre + 1);
  assert.deepEqual([s.constats.at(-1)!.resultat, s.constats.at(-1)!.materielId], ['present', nouveau.id]);

  // Code « inconnu » d'un téléphone en retard : le serveur reconnaît le numéro de série, y compris noté par la DIRISI (« S » devant)
  const tardif = evt({ type: 'inconnu', code: autre.serie!, salleId: null });
  const dirisi = evt({ type: 'inconnu', code: `S${autre.serie!}`, salleId: null });
  assert.deepEqual(appliquerEvenements(s, campagne.id, [tardif, dirisi]).map((r) => r.statut), ['applique', 'applique']);
  assert.deepEqual(s.constats.slice(-2).map((c) => [c.resultat, c.materielId]), [['present', autre.id], ['present', autre.id]]);
  // Code « inconnu » d'un matériel du parc affecté ailleurs : rattaché et accepté dans le lieu ouvert
  appliquerEvenements(s, campagne.id, [evt({ type: 'inconnu', code: autre.serie!, salleId: autreSalle.id, saisie: { type: 'autre', modele: 'X', marque: null, serie: autre.serie } })]);
  assert.deepEqual([s.constats.at(-1)!.resultat, m(autre.id).salleId, m(autre.id).deplacement], ['deplace', autreSalle.id, undefined]);

  // Ordre d'observation, pas d'arrivée : un téléphone resté hors ligne n'écrase pas une information plus récente
  const libre = s.materiels.find((x) => x.ecoleId === 'e-num' && x.salleId && !x.hs && !x.deplacement && ![installe.id, autre.id].includes(x.id))!;
  const [ici, la] = s.salles.filter((x) => x.ecoleId === 'e-num' && x.id !== libre.salleId);
  const t0 = Date.now() - 60_000;
  const recent = evt({ type: 'releve', materielId: libre.id, salleId: ici.id, observeLe: t0 + 30_000 });
  const ancien = evt({ type: 'releve', materielId: libre.id, salleId: la.id, observeLe: t0 });
  const posterieur = evt({ type: 'releve', materielId: libre.id, salleId: la.id, observeLe: t0 + 40_000 });
  assert.deepEqual(appliquerEvenements(s, campagne.id, [recent, ancien]).map((r) => r.message ?? r.statut), ['applique', 'Constat dépassé : ce matériel a été vu ou déplacé depuis.']);
  assert.equal(m(libre.id).salleId, ici.id, 'l’observation la plus récente reste');
  assert.deepEqual(appliquerEvenements(s, campagne.id, [posterieur]).map((r) => r.statut), ['applique'], 'observée après, arrivée après : appliquée');
  assert.equal(m(libre.id).salleId, la.id);
  // Déplacement prévu dans ORION après l'observation : l'observation est dépassée
  m(libre.id).deplacement = { de: la.id, at: Date.now(), par: 'Sophie Garnier', parId: MANAGER };
  m(libre.id).salleId = ici.id;
  assert.equal(appliquerEvenements(s, campagne.id, [evt({ type: 'releve', materielId: libre.id, salleId: la.id, observeLe: t0 + 50_000 })])[0].statut, 'refuse');

  // Événement inattendu : refusé seul, sans bloquer les suivants
  const piege = new Proxy(evt({ type: 'vu', materielId: installe.id, salleId: autreSalle.id }), { get: (t, k) => { if (k === 'type') throw new Error('piège'); return t[k as keyof typeof t]; } });
  assert.deepEqual(appliquerEvenements(s, campagne.id, [piege, evt({ type: 'vu', materielId: installe.id, salleId: autreSalle.id })]).map((r) => r.statut), ['refuse', 'applique']);

  const horsCampagne = ouvrir(s, [autreSalle.id]);
  const autrePiece = s.salles.find((x) => x.ecoleId === 'e-num' && x.id !== autreSalle.id)!;
  assert.equal(appliquerEvenements(horsCampagne.next, horsCampagne.campagne.id, [evt({ type: 'vu', materielId: installe.id, salleId: autrePiece.id })])[0].message, 'Salle hors de l’opération.');
  horsCampagne.campagne.close = { at: Date.now(), par: 'x', parId: null };
  assert.equal(appliquerEvenements(horsCampagne.next, horsCampagne.campagne.id, [evt({ type: 'vu', materielId: installe.id, salleId: autreSalle.id })])[0].message, 'Opération close.');
});

test('constats : présence refusée, retour lancé vers l’affectation, confirmé par le gestionnaire (RG-96)', () => {
  const { next: s, campagne } = ouvrir(initialState());
  const m = (id: Id) => s.materiels.find((x) => x.id === id)!;
  const installe = s.materiels.find((x) => x.ecoleId === 'e-num' && x.salleId && !x.deplacement && !x.hs)!;
  const affectation = installe.salleId;
  const ici = s.salles.find((x) => x.ecoleId === 'e-num' && x.id !== affectation)!;
  const enCours = s.materiels.find((x) => x.ecoleId === 'e-num' && x.deplacement && x.salleId && x.salleId !== ici.id)!;
  const hs = s.materiels.find((x) => x.ecoleId === 'e-num' && x.hs && x.salleId && x.salleId !== ici.id && !x.deplacement)!;
  const enStock = s.materiels.find((x) => x.ecoleId === 'e-num' && x.salleId === null && !x.deplacement)!;

  const r = appliquerEvenements(s, campagne.id, [
    evt({ type: 'retour', materielId: installe.id, salleId: ici.id }),
    evt({ type: 'retour', materielId: enCours.id, salleId: null }),
    evt({ type: 'retour', materielId: hs.id, salleId: ici.id }),
    evt({ type: 'retour', materielId: enStock.id, salleId: ici.id }),
  ]);
  assert.deepEqual(r.map((x) => x.statut), ['applique', 'applique', 'applique', 'applique']);
  assert.deepEqual(s.constats.slice(-4).map((c) => c.resultat), ['retour', 'retour', 'retour', 'retour']);
  assert.equal(m(installe.id).salleId, affectation, 'affectation inchangée');
  assert.deepEqual(m(installe.id).deplacement, { de: ici.id, at: s.constats.at(-4)!.at, par: 'Sophie Garnier', parId: MANAGER }, 'à ramener depuis le lieu ouvert');
  assert.equal(m(installe.id).installation, undefined, 'installation retirée');
  assert.equal(m(enCours.id).deplacement?.de, null, 'déplacement déjà en cours : origine remplacée par le lieu ouvert');
  assert.equal(m(hs.id).deplacement?.de, ici.id, 'hors service : retour vers son affectation possible');
  assert.equal(m(enStock.id).salleId, null, 'à ramener au stock');
  assert.equal(m(enStock.id).deplacement?.de, ici.id);

  // Constat observé avant le retour : dépassé
  const [ancien] = appliquerEvenements(s, campagne.id, [evt({ type: 'releve', materielId: installe.id, salleId: ici.id, observeLe: Date.now() - 60_000 })]);
  assert.equal(ancien.message, 'Constat dépassé : ce matériel a été vu ou déplacé depuis.');

  // Confirmation dans ORION, une fois le matériel rapporté : réservée au gestionnaire
  const confirmer = (compte: Id) => {
    const input: Ecriture = scopedState(s, as(s, compte));
    delete input.materiels.find((x) => x.id === installe.id)!.deplacement;
    return mergeState(s, input, as(s, compte));
  };
  assert.throws(() => confirmer(ADMIN), (e: HttpError) => e.status === 403);
  const confirme = confirmer(MANAGER).materiels.find((x) => x.id === installe.id)!;
  assert.equal(confirme.salleId, affectation);
  assert.equal(confirme.deplacement, undefined);
  assert.equal(confirme.installation?.de, ici.id);

});

test('ancien code inconnu : traité dans ORION avec la création du matériel, seul le traitement est modifiable', () => {
  const { next: s, campagne } = ouvrir(initialState());
  const salle = s.salles.find((x) => x.ecoleId === 'e-num')!;
  appliquerEvenements(s, campagne.id, [evt({ type: 'inconnu', code: 'NEUF', salleId: salle.id })]);
  assert.equal(s.constats[0].resultat, 'inconnu');
  const manager = as(s, MANAGER);
  const input: Ecriture = scopedState(s, manager);
  input.materiels.push({ id: 'nouveau', ecoleId: 'e-num', idOrion: '', salleId: salle.id, type: 'autre', modele: 'Câble', marque: null, serie: null, dateReception: Date.now(), garantieFin: null, hs: false });
  input.constats[0].traite = { at: 0, par: 'falsifié', parId: null, action: 'ajoute' };
  const next = mergeState(s, input, manager);
  assert.equal(next.constats[0].traite?.par, 'Sophie Garnier');
  assert(next.materiels.some((m) => m.id === 'nouveau' && m.idOrion.startsWith('MAT-')));
  const modifie: Ecriture = scopedState(next, manager);
  modifie.constats[0].resultat = 'present';
  assert.throws(() => mergeState(next, modifie, manager), /traitement/);
});

test('recensement : une présence ne confirme pas une installation ; un ancien écart réaffecté sur place', () => {
  const { next: s, campagne } = ouvrir(initialState());
  const enCours = s.materiels.find((x) => x.ecoleId === 'e-num' && x.deplacement && x.salleId)!;
  assert.equal(appliquerEvenements(s, campagne.id, [evt({ type: 'vu', materielId: enCours.id, salleId: enCours.salleId })])[0].statut, 'applique');
  assert(enCours.deplacement, 'une présence de recensement ne confirme pas le déplacement prévu');
  assert.equal(s.constats.at(-1)!.resultat, 'present');

  const m = s.materiels.find((x) => x.ecoleId === 'e-num' && x.salleId && !x.hs && !x.deplacement)!;
  const affectation = m.salleId!;
  const autre = s.salles.find((x) => x.ecoleId === 'e-num' && x.id !== affectation)!;
  const avant = structuredClone(m);
  const e = evt({ type: 'vu', materielId: m.id, salleId: autre.id });
  assert.equal(appliquerEvenements(s, campagne.id, [e])[0].statut, 'applique');
  assert.deepEqual(s.materiels.find((x) => x.id === m.id), avant, 'un constat historique ne déplace pas le matériel');
  const c = s.constats.at(-1)!;
  assert.equal(c.resultat, 'ecart');
  assert.equal(c.type, 'vu');

  const gestionnaire = as(s, MANAGER);
  traiterConstat(s, c.id, 'constat', gestionnaire, Date.now());
  assert.equal(m.salleId, autre.id);
  assert.equal(c.traite?.action, 'constat');
  assert.equal(c.traite?.parId, MANAGER);
  assert.equal(m.deplacement, undefined, 'réaffecté où il a été constaté : installation confirmée');
  assert.equal(m.installation?.de, affectation);
  assert.throws(() => traiterConstat(s, c.id, 'stock', gestionnaire), /déjà traité/);
});

test('ancien écart : remettre au stock ou ramener à l’affectation lance un déplacement à confirmer (RG-87)', () => {
  const { next: s, campagne } = ouvrir(initialState());
  const gestionnaire = as(s, MANAGER);
  const [a, b] = s.materiels.filter((x) => x.ecoleId === 'e-num' && x.salleId && !x.hs && !x.deplacement);
  const hs = s.materiels.find((x) => x.ecoleId === 'e-num' && x.hs && x.salleId && !x.deplacement)!;
  const ecart = (x: typeof a) => {
    const ailleurs = s.salles.find((y) => y.ecoleId === 'e-num' && y.id !== x.salleId)!;
    appliquerEvenements(s, campagne.id, [evt({ type: 'vu', materielId: x.id, salleId: ailleurs.id })]);
    return { c: s.constats.at(-1)!, ailleurs: ailleurs.id };
  };
  const ea = ecart(a), eb = ecart(b), eh = ecart(hs);
  traiterConstat(s, ea.c.id, 'stock', gestionnaire);
  assert.equal(a.salleId, null, 'affecté au stock');
  assert.deepEqual(a.deplacement && [a.deplacement.de, a.deplacement.parId], [ea.ailleurs, MANAGER], 'déplacement lancé depuis le lieu constaté');
  assert.equal(a.installation, undefined);
  const affectationB = b.salleId;
  traiterConstat(s, eb.c.id, 'affectation', gestionnaire);
  assert.equal(b.salleId, affectationB, 'affectation inchangée');
  assert.equal(b.deplacement?.de, eb.ailleurs);
  assert.equal(eb.c.traite?.action, 'affectation');
  assert.throws(() => traiterConstat(s, eh.c.id, 'affectation', gestionnaire), /hors service/, 'RG-87');
  assert.throws(() => traiterConstat(s, eh.c.id, 'constat', gestionnaire), /hors service/);
  traiterConstat(s, eh.c.id, 'stock', gestionnaire);
  assert.equal(hs.salleId, null);
  assert.throws(() => traiterConstat(s, ea.c.id, 'stock', as(s, ADMIN)), (e: HttpError) => e.status === 403);
});

test('mise au stock depuis une salle : affecté au stock, déplacement à confirmer ; refusée au stock', () => {
  const { next: s, campagne } = ouvrir(initialState());
  const m = s.materiels.find((x) => x.ecoleId === 'e-num' && x.salleId && !x.hs && !x.deplacement)!;
  const ici = s.salles.find((x) => x.ecoleId === 'e-num' && x.id !== m.salleId)!;
  const r = appliquerEvenements(s, campagne.id, [evt({ type: 'stock', materielId: m.id, salleId: ici.id })]);
  assert.equal(r[0].statut, 'applique');
  assert.equal(s.constats.at(-1)!.resultat, 'stock');
  assert.equal(m.salleId, null);
  assert.deepEqual(m.deplacement && m.deplacement.de, ici.id);
  const autre = s.materiels.find((x) => x.ecoleId === 'e-num' && x.salleId && !x.hs && !x.deplacement)!;
  assert.equal(appliquerEvenements(s, campagne.id, [evt({ type: 'stock', materielId: autre.id, salleId: null })])[0].statut, 'refuse');
  // Scanné au stock pendant un recensement : présence seule, le déplacement reste à confirmer
  appliquerEvenements(s, campagne.id, [evt({ type: 'vu', materielId: m.id, salleId: null })]);
  assert.equal(s.constats.at(-1)!.resultat, 'present');
  assert(m.deplacement);
});

test('installation d’une salle : lancée par le gestionnaire, salle et stock, confirmation, ajout au parc, close d’elle-même ; indépendante d’un recensement simultané', () => {
  const s = initialState();
  const gestionnaire = as(s, MANAGER);
  const enCours = s.materiels.find((x) => x.ecoleId === 'e-num' && x.deplacement && x.salleId)!;
  const salle = enCours.salleId!;
  const sansDeplacement = s.salles.find((x) => x.ecoleId === 'e-num' && !s.materiels.some((m) => m.deplacement && (m.salleId === x.id || m.deplacement.de === x.id)))!;
  assert.throws(() => lancerInstallation(s, as(s, ADMIN), salle), (e: HttpError) => e.status === 403, 'gestionnaire seul');
  assert.throws(() => lancerInstallation(s, gestionnaire, sansDeplacement.id), /Aucun déplacement/);
  const ins = lancerInstallation(s, gestionnaire, salle);
  assert.equal(lancerInstallation(s, gestionnaire, salle).id, ins.id, 'reprise, pas de doublon');
  assert.deepEqual([ins.mode, ins.salleIds, ins.par], ['installation', [salle], 'Sophie Garnier']);
  // Une installation ne se crée pas comme une campagne
  const input: Ecriture = scopedState(s, gestionnaire);
  input.recensements.push({ ...ins, id: 'x' });
  assert.throws(() => mergeState(s, input, gestionnaire), /déplacements de la salle/);
  // Ni close à la main : elle se clôt d'elle-même
  const cloture: Ecriture = scopedState(s, gestionnaire);
  cloture.recensements.find((r) => r.id === ins.id)!.close = { at: 0, par: '', parId: null };
  assert.throws(() => mergeState(s, cloture, gestionnaire), /se clôt d’elle-même/);

  // Recensement simultané couvrant la même salle : opérations distinctes, constats rattachés à chacune
  const { next, campagne } = ouvrir(s, [salle]);
  const insNext = next.recensements.find((r) => r.id === ins.id)!;
  assert.deepEqual(instantane(next, insNext).salles.map((x) => x.id), [salle]);
  assert.equal(instantane(next, insNext).campagne.mode, 'installation');
  assert.equal(instantane(next, campagne).campagne.mode, 'recensement');
  const autreSalle = next.salles.find((x) => x.ecoleId === 'e-num' && x.id !== salle)!;
  assert.equal(appliquerEvenements(next, ins.id, [evt({ type: 'vu', materielId: enCours.id, salleId: autreSalle.id })])[0].message, 'Salle hors de l’opération.', 'installation limitée à sa salle et au stock');
  const enCoursNext = next.materiels.find((x) => x.id === enCours.id)!;
  appliquerEvenements(next, campagne.id, [evt({ type: 'vu', materielId: enCours.id, salleId: salle })]);
  assert(enCoursNext.deplacement, 'le recensement ne confirme pas l’installation');
  const ajout = evt({ type: 'inconnu', code: 'NEUF-INS', salleId: salle, saisie: { type: 'ecran', modele: 'E24', marque: null, serie: 'NEUF-INS' } });
  appliquerEvenements(next, ins.id, [evt({ type: 'vu', materielId: enCours.id, salleId: salle }), ajout]);
  assert.equal(enCoursNext.deplacement, undefined, 'installation confirmée');
  assert.deepEqual(next.constats.filter((c) => c.recensementId === ins.id).map((c) => c.resultat), ['confirme', 'ajoute']);
  assert.deepEqual(next.constats.filter((c) => c.recensementId === campagne.id).map((c) => c.resultat), ['present']);

  // Plus aucun déplacement ne concerne la salle : installation close par le serveur ; le recensement reste ouvert
  for (const m of next.materiels) if (m.deplacement && (m.salleId === salle || m.deplacement.de === salle)) delete m.deplacement;
  cloreInstallations(next);
  assert.deepEqual([insNext.close?.par, insNext.close?.parId], ['Sophie Garnier', gestionnaire.id], 'signée par le gestionnaire qui l’a terminée');
  assert.equal(next.recensements.find((r) => r.id === campagne.id)!.close, undefined);
  assert.equal(appliquerEvenements(next, ins.id, [evt({ type: 'vu', materielId: enCours.id, salleId: salle })])[0].message, 'Opération close.');
});

test('recensement : un scan antérieur à la dernière information est refusé avant toute confirmation', () => {
  const { next: s, campagne } = ouvrir(initialState());
  const m = s.materiels.find((x) => x.ecoleId === 'e-num' && x.salleId && !x.hs)!;
  m.deplacement = { de: null, at: Date.now(), par: 'Sophie Garnier', parId: MANAGER };
  const ancien = evt({ type: 'vu', materielId: m.id, salleId: m.salleId, observeLe: m.deplacement.at - 1000 });
  assert.equal(appliquerEvenements(s, campagne.id, [ancien])[0].statut, 'refuse');
  assert(m.deplacement, 'le déplacement reste à confirmer');
});

test('API : appairage par un gestionnaire, connecteur authentifié, blocs chiffrés de bout en bout', async () => {
  const repository = await createWorkspaceRepository();
  const secret = 'secret-rigel-de-test';
  let accountId: Id = MANAGER;
  const app = express()
    .use('/api/workspace', createWorkspaceRouter({ repository, actor: async () => repository.actor(accountId), agentToken: 'jeton', rigel: { secret, url: 'https://rigel.test/' } }))
    .use('/api/rigel', createRigelRouter({ repository, secret }));
  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>((resolve) => server.once('listening', resolve));
  const url = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  try {
    const state = await repository.read((await repository.actor(MANAGER))!);
    state.recensements.push({ id: 'n', ecoleId: 'e-num', nom: 'Inventaire', mode: 'recensement', salleIds: [], at: 0, par: '', parId: null, expireLe: 0 });
    const { recensements: [campagne] } = await repository.update(state, state.revision, (await repository.actor(MANAGER))!);

    const { url: lien } = await (await fetch(`${url}/api/workspace/recensements/${campagne.id}/appairage`)).json();
    const acces = lireAppairage(lien)!;
    assert(lien.startsWith('https://rigel.test/#c='));
    assert.equal(acces.cle, cleCampagne(secret, campagne.id));
    for (accountId of [TEACHER, ADMIN]) assert.equal((await fetch(`${url}/api/workspace/recensements/${campagne.id}/appairage`)).status, 403);

    assert.equal((await fetch(`${url}/api/rigel/campagnes`)).status, 401);
    const auth = { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' };
    const { campagnes } = await (await fetch(`${url}/api/rigel/campagnes`, { headers: auth })).json();
    assert.equal(campagnes.length, 1);
    assert.equal(campagnes[0].empreinte, await empreinte(acces.jeton), 'le relais ne connaît que l’empreinte du jeton');
    const inst = await dechiffrer<InstantaneRigel>(acces.cle, campagne.id, campagnes[0].instantane);
    assert.equal(inst.campagne.ecole, 'École du numérique');
    assert(inst.materiels.length > 0 && inst.salles.length > 0);

    const m = inst.materiels.find((x) => x.salleId && !x.enCours)!;
    const e = evt({ type: 'vu', materielId: m.id, salleId: m.salleId });
    const evenements = [{ id: e.id, bloc: await chiffrer(acces.cle, campagne.id, e) }, { id: 'illisible-0001', bloc: { iv: 'AAAA', data: 'AAAA' } }];
    const { resultats } = await (await fetch(`${url}/api/rigel/campagnes/${campagne.id}/evenements`, { method: 'POST', headers: auth, body: JSON.stringify({ evenements }) })).json();
    assert.deepEqual(resultats.map((r: { statut: string }) => r.statut), ['applique', 'refuse']);
    const apres = (await (await fetch(`${url}/api/rigel/campagnes`, { headers: auth })).json()).campagnes[0];
    assert.notEqual(apres.version, campagnes[0].version, 'nouvelle version de l’instantané');
    assert.equal((await dechiffrer<InstantaneRigel>(acces.cle, campagne.id, apres.instantane)).constats[0].resultat, 'present');

    // Installation d'une salle : lancée puis reprise par le gestionnaire, refusée aux autres profils ; publiée à part de la campagne
    const salle = (await repository.snapshot()).materiels.find((x) => x.ecoleId === 'e-num' && x.deplacement && x.salleId)!.salleId!;
    const installer = () => fetch(`${url}/api/workspace/salles/${salle}/installation`, { method: 'POST' });
    for (accountId of [TEACHER, ADMIN]) assert.equal((await installer()).status, 403);
    accountId = MANAGER;
    const premiere = await (await installer()).json();
    const reprise = await (await installer()).json();
    assert.match(premiere.id, /^ins-/);
    assert.equal(reprise.id, premiere.id);
    assert.equal(lireAppairage(premiere.url)!.campagne, premiere.id);
    assert(premiere.state.recensements.some((r: Recensement) => r.id === premiere.id && r.mode === 'installation'));
    const publiees = (await (await fetch(`${url}/api/rigel/campagnes`, { headers: auth })).json()).campagnes;
    assert.deepEqual(publiees.map((c: { id: Id }) => c.id).sort(), [campagne.id, premiere.id].sort());
  } finally { server.close(); }
});
