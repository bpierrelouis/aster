import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import type { AddressInfo } from 'node:net';
import { initialState, actorOf, scopedState, mergeState } from './rules.ts';
import { createWorkspaceRepository } from './engine.ts';
import { createReconRouter, createWorkspaceRouter } from './routes.ts';
import { appliquerEvenements, cleCampagne, instantane, jetonCampagne } from './recensement.ts';
import { chiffrer, dechiffrer, empreinte, etiquette, lireAppairage, rapprocherSerie, resoudre, serieLue, serieStructuree } from '#shared/recon.ts';
import type { EvenementRecon, InstantaneRecon } from '#shared/recon.ts';
import type { Id, Recensement, WorkspaceState } from '#shared/types.ts';
import type { Ecriture, HttpError } from './rules.ts';

const ADMIN = 'cpt-num-admin', MANAGER = 'cpt-num-gestionnaire', TEACHER = 'cpt-num-formateur';
const as = (state: WorkspaceState, accountId: Id) => actorOf(state, accountId)!;

/** Campagne ouverte par le gestionnaire de l'École du numérique (toutes les salles si salleIds est vide) */
function ouvrir(state: WorkspaceState, salleIds: Id[] = []) {
  const actor = as(state, MANAGER);
  const input: Ecriture = scopedState(state, actor);
  input.recensements.push({ id: 'navigateur', ecoleId: 'e-num', nom: ' Rentrée ', salleIds, at: 0, par: 'falsifié', parId: null, expireLe: 0 });
  const next = mergeState(state, input, actor);
  return { next, campagne: next.recensements.at(-1)! };
}

const evt = (e: Partial<EvenementRecon> & Pick<EvenementRecon, 'type'>): EvenementRecon => ({ id: crypto.randomUUID(), code: '', salleId: null, materielId: null, observeLe: Date.now(), ...e });

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
  assert.equal(serieStructuree(`0109501101530003\u001d21SN-42\u001d10LOT`), 'SN-42', 'GS1 : séparateur après le GTIN toléré');
  assert.equal(serieStructuree('0412345678'), null, 'code-barres ordinaire');
  assert.equal(serieStructuree(`010950110153000317261231\u001d21SN-42`), 'SN-42');
  assert.equal(serieStructuree(`01095011015300031726123110LOT7\u001d21ABC`), 'ABC');
  assert.deepEqual(resoudre('INCONNU-777', inst), { type: 'inconnu', code: 'INCONNU-777' });
  assert.deepEqual(resoudre('https://recon.test/#c=rec-1&j=J&k=K', inst), { type: 'appairage', appairage: { campagne: 'rec-1', jeton: 'J', cle: 'K' } });
  assert.equal(lireAppairage('https://recon.test/#c=rec-1&j=J'), null);
  // Reconnaissance de caractères : confusions courantes ramenées au même caractère
  const lu = m.serie!.replace(/0/g, 'O').replace(/1/g, 'I');
  assert.deepEqual(rapprocherSerie(`Modèle X\nS/N ${lu}`, inst.materiels).map((x) => x.id), [m.id]);
  assert.equal(serieLue('Serial No: AB-1234 Made in'), 'AB1234');
});

test('chiffrement : clé et campagne authentifiées', async () => {
  const cle = cleCampagne('secret', 'rec-1');
  const bloc = await chiffrer(cle, 'rec-1', { a: 1 });
  assert.deepEqual(await dechiffrer(cle, 'rec-1', bloc), { a: 1 });
  await assert.rejects(dechiffrer(cle, 'rec-2', bloc), 'bloc déplacé vers une autre campagne');
  await assert.rejects(dechiffrer(cleCampagne('autre', 'rec-1'), 'rec-1', bloc));
  assert.notEqual(jetonCampagne('secret', 'rec-1'), jetonCampagne('secret', 'rec-2'));
});

test('campagne : ouverte par un gestionnaire, valeurs fixées par le serveur, clôture seule modifiable', () => {
  const state = initialState();
  const salle = state.salles.find((s) => s.ecoleId === 'e-num')!;
  const { next, campagne } = ouvrir(state, [salle.id]);
  assert.match(campagne.id, /^rec-/);
  assert.equal(campagne.nom, 'Rentrée');
  assert.equal(campagne.par, 'G. Bernard');
  assert(campagne.expireLe > Date.now() + 13 * 86400e3);
  assert.equal(scopedState(next, as(next, TEACHER)).recensements.length, 0, 'invisible au formateur');
  assert.equal(scopedState(next, as(next, 'cpt-res-admin')).recensements.length, 0, 'invisible à une autre école');

  const teacher = as(next, TEACHER);
  const parFormateur: Ecriture = scopedState(next, teacher);
  parFormateur.recensements.push({ ...campagne, id: 'x' });
  assert.throws(() => mergeState(next, parFormateur, teacher), (e: HttpError) => e.status === 403);

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
  assert.equal(fermee.close?.par, 'G. Bernard');
  assert(fermee.close!.at > 1);
  const rouvre: Ecriture = scopedState(closed, manager);
  delete rouvre.recensements[0].close;
  assert.throws(() => mergeState(closed, rouvre, manager), /rouverte/);
});

test('constats : confirmation, présence, écart, relocalisation, stock, hors service, code inconnu, doublon', () => {
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
  const inconnu = evt({ type: 'inconnu', code: 'NOUVEAU-1', salleId: autreSalle.id, saisie: { type: 'ecran', modele: ' P2422H ', marque: 'Dell', serie: 'XYZ-9' } });
  const etrangerVu = evt({ type: 'vu', materielId: etranger.id, salleId: autreSalle.id });
  const resultats = appliquerEvenements(s, campagne.id, [confirme, doublon, ecart, releve, range, refuse, inconnu, etrangerVu]);

  assert.deepEqual(resultats.map((r) => r.statut), ['applique', 'doublon', 'applique', 'applique', 'applique', 'refuse', 'applique', 'refuse']);
  const m = (id: Id) => s.materiels.find((x) => x.id === id)!;
  assert.equal(m(enCours.id).deplacement, undefined, 'déplacement confirmé');
  assert.equal(m(enCours.id).installation?.par, 'G. Bernard', 'auteur : ouvreur de la campagne');
  assert.equal(m(installe.id).salleId, autreSalle.id, 'relocalisé');
  assert.equal(m(installe.id).installation?.de, origine);
  assert.equal(m(installe.id).deplacement, undefined, 'relocalisation constatée : déjà installé');
  assert.equal(m(autre.id).salleId, null, 'rangé au stock');
  assert.equal(m(hs.id).salleId, hs.salleId, 'hors service : refusé hors du stock');
  const constats = s.constats.filter((c) => c.recensementId === campagne.id);
  assert.deepEqual(constats.map((c) => c.resultat), ['confirme', 'ecart', 'deplace', 'range', 'refuse', 'inconnu']);
  assert.deepEqual(constats.at(-1)!.saisie, { type: 'ecran', modele: 'P2422H', marque: 'Dell', serie: 'XYZ-9' });

  // Code « inconnu » d'un téléphone en retard : le serveur reconnaît le numéro de série
  const tardif = evt({ type: 'inconnu', code: autre.serie!, salleId: null });
  assert.deepEqual(appliquerEvenements(s, campagne.id, [tardif]).map((r) => r.statut), ['applique']);
  assert.equal(s.constats.at(-1)!.resultat, 'present');

  const horsCampagne = ouvrir(s, [autreSalle.id]);
  const autrePiece = s.salles.find((x) => x.ecoleId === 'e-num' && x.id !== autreSalle.id)!;
  assert.equal(appliquerEvenements(horsCampagne.next, horsCampagne.campagne.id, [evt({ type: 'vu', materielId: installe.id, salleId: autrePiece.id })])[0].message, 'Salle hors de la campagne.');
  horsCampagne.campagne.close = { at: Date.now(), par: 'x', parId: null };
  assert.equal(appliquerEvenements(horsCampagne.next, horsCampagne.campagne.id, [evt({ type: 'vu', materielId: installe.id, salleId: autreSalle.id })])[0].message, 'Campagne close.');
});

test('constat inconnu : traité dans ORION avec la création du matériel, seul le traitement est modifiable', () => {
  const { next: s, campagne } = ouvrir(initialState());
  const salle = s.salles.find((x) => x.ecoleId === 'e-num')!;
  appliquerEvenements(s, campagne.id, [evt({ type: 'inconnu', code: 'NEUF', salleId: salle.id, saisie: { type: 'autre', modele: 'Câble', marque: null, serie: null } })]);
  const manager = as(s, MANAGER);
  const input: Ecriture = scopedState(s, manager);
  input.materiels.push({ id: 'nouveau', ecoleId: 'e-num', idOrion: '', salleId: salle.id, type: 'autre', modele: 'Câble', marque: null, serie: null, dateReception: Date.now(), garantieFin: null, hs: false });
  input.constats[0].traite = { at: 0, par: 'falsifié', parId: null };
  const next = mergeState(s, input, manager);
  assert.equal(next.constats[0].traite?.par, 'G. Bernard');
  assert(next.materiels.some((m) => m.id === 'nouveau' && m.idOrion.startsWith('MAT-')));
  const modifie: Ecriture = scopedState(next, manager);
  modifie.constats[0].resultat = 'present';
  assert.throws(() => mergeState(next, modifie, manager), /traitement/);
});

test('API : appairage par un gestionnaire, connecteur authentifié, blocs chiffrés de bout en bout', async () => {
  const repository = await createWorkspaceRepository();
  const secret = 'secret-recon-de-test';
  let accountId: Id = MANAGER;
  const app = express()
    .use('/api/workspace', createWorkspaceRouter({ repository, actor: async () => repository.actor(accountId), agentToken: 'jeton', recon: { secret, url: 'https://recon.test/' } }))
    .use('/api/recon', createReconRouter({ repository, secret }));
  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>((resolve) => server.once('listening', resolve));
  const url = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  try {
    const state = await repository.read((await repository.actor(MANAGER))!);
    state.recensements.push({ id: 'n', ecoleId: 'e-num', nom: 'Inventaire', salleIds: [], at: 0, par: '', parId: null, expireLe: 0 });
    const { recensements: [campagne] } = await repository.update(state, state.revision, (await repository.actor(MANAGER))!);

    const { url: lien } = await (await fetch(`${url}/api/workspace/recensements/${campagne.id}/appairage`)).json();
    const acces = lireAppairage(lien)!;
    assert(lien.startsWith('https://recon.test/#c='));
    assert.equal(acces.cle, cleCampagne(secret, campagne.id));
    accountId = TEACHER;
    assert.equal((await fetch(`${url}/api/workspace/recensements/${campagne.id}/appairage`)).status, 403);

    assert.equal((await fetch(`${url}/api/recon/campagnes`)).status, 401);
    const auth = { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' };
    const { campagnes } = await (await fetch(`${url}/api/recon/campagnes`, { headers: auth })).json();
    assert.equal(campagnes.length, 1);
    assert.equal(campagnes[0].empreinte, await empreinte(acces.jeton), 'le relais ne connaît que l’empreinte du jeton');
    const inst = await dechiffrer<InstantaneRecon>(acces.cle, campagne.id, campagnes[0].instantane);
    assert.equal(inst.campagne.ecole, 'École du numérique');
    assert(inst.materiels.length > 0 && inst.salles.length > 0);

    const m = inst.materiels.find((x) => x.salleId && !x.enCours)!;
    const e = evt({ type: 'vu', materielId: m.id, salleId: m.salleId });
    const evenements = [{ id: e.id, bloc: await chiffrer(acces.cle, campagne.id, e) }, { id: 'illisible-0001', bloc: { iv: 'AAAA', data: 'AAAA' } }];
    const { resultats } = await (await fetch(`${url}/api/recon/campagnes/${campagne.id}/evenements`, { method: 'POST', headers: auth, body: JSON.stringify({ evenements }) })).json();
    assert.deepEqual(resultats.map((r: { statut: string }) => r.statut), ['applique', 'refuse']);
    const apres = (await (await fetch(`${url}/api/recon/campagnes`, { headers: auth })).json()).campagnes[0];
    assert.notEqual(apres.version, campagnes[0].version, 'nouvelle version de l’instantané');
    assert.equal((await dechiffrer<InstantaneRecon>(acces.cle, campagne.id, apres.instantane)).constats[0].resultat, 'present');
  } finally { server.close(); }
});
