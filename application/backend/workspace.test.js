import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  initialState, actorOf, accountForIdentity, scopedState, mergeState, rebase, applyReports, pendingCommands, applyResults,
  markDisconnected, createWorkspaceRepository, createWorkspaceRouter, createAgentRouter, DISCONNECT_AFTER,
} from './workspace.js';
import { renameBuilding } from '../frontend/workspace/core/buildings.js';
import { processClass } from '../frontend/workspace/core/operations-data.js';

const as = (state, accountId) => actorOf(state, accountId);
const ADMIN = 'cpt-num-admin', MANAGER = 'cpt-num-gestionnaire', TEACHER = 'cpt-num-formateur', SUPER = 'cpt-superadmin';
const online = (state) => { applyReports(state, state.postes.filter((p) => p.salleId === 's-e-num-a012').map((p) => ({ poste: p.nomReseau, processus: [{ nom: 'firefox.exe', compte: 'stagiaire.01' }], applications: ['app-firefox'] }))); return state; };

test('identité : rapprochement par sujet puis adresse, compte désactivé sans accès', () => {
  const state = initialState();
  assert.equal(accountForIdentity(state, { sub: 'kc-1', email: 'Formateur@aster.demo' }).id, TEACHER);
  state.comptes.find((c) => c.id === TEACHER).sujet = 'kc-1';
  assert.equal(accountForIdentity(state, { sub: 'kc-1', email: 'autre@aster.demo' }).id, TEACHER);
  assert.equal(accountForIdentity(state, { sub: 'kc-2', email: 'formateur@aster.demo' }), null, 'adresse déjà reliée à une autre identité');
  assert.equal(accountForIdentity(state, { sub: 'kc-3', email: 'inconnu@aster.demo' }), null);
  state.comptes.find((c) => c.id === TEACHER).actif = false;
  assert.equal(actorOf(state, TEACHER), null);
});

test('visibilité : école, auteur des remontées, comptes et données de supervision', () => {
  const state = online(initialState());
  state.comptes[0].sujet = 'secret';
  const teacher = scopedState(state, as(state, TEACHER));
  assert.equal(teacher.moi.nom, 'L. Martin');
  assert(teacher.materiels.every((m) => m.ecoleId === 'e-num'));
  assert(teacher.remontees.length && teacher.remontees.every((r) => r.auteurId === TEACHER));
  assert.equal(teacher.comptes.length, 0);
  assert(teacher.processus.length > 0);
  const manager = scopedState(state, as(state, MANAGER));
  assert.equal(manager.postes.length, 0);
  assert.equal(manager.processus.length, 0);
  const sup = scopedState(state, as(state, SUPER));
  assert(sup.comptes.every((c) => !('sujet' in c)), 'le sujet ne quitte pas le serveur');
  assert.equal(sup.ecoleId, 'e-num');
});

test('remontée : auteur, date, numéro et historique imposés par le serveur', () => {
  const state = initialState();
  const teacher = as(state, TEACHER);
  const input = scopedState(state, teacher);
  const mat = input.materiels.find((m) => m.salleId);
  input.remontees.unshift({ id: 'tmp', ecoleId: 'e-num', auteur: 'Quelqu’un d’autre', auteurId: ADMIN, createdAt: 1, materielIds: [mat.id], probleme: 'display', description: 'Écran noir', statut: 'corrige', historique: [] });
  const next = mergeState(state, input, teacher, 1_800_000_000_000);
  const created = next.remontees.find((r) => r.description === 'Écran noir');
  assert.match(created.id, /^REM-\d{4}$/);
  assert.deepEqual([created.auteur, created.auteurId, created.createdAt, created.statut], ['L. Martin', TEACHER, 1_800_000_000_000, 'attente']);
  assert.equal(created.historique.length, 1);

  const manager = as(next, MANAGER);
  const m = scopedState(next, manager);
  const r = m.remontees.find((x) => x.id === created.id);
  r.statut = 'corrige';
  assert.throws(() => mergeState(next, m, manager), { status: 400 });
  r.statut = 'remplace';
  r.historique.push({ statut: 'remplace', at: 1, par: 'Faux' });
  const treated = mergeState(next, m, manager).remontees.find((x) => x.id === created.id);
  assert.equal(treated.historique.at(-1).par, 'G. Bernard');
  r.description = 'Texte remplacé';
  assert.throws(() => mergeState(next, m, manager), { status: 400 });
});

test('parc : gestionnaire sans suppression ni autre école ; identifiant ASTER attribué', () => {
  const state = initialState();
  const manager = as(state, MANAGER);
  const input = scopedState(state, manager);
  input.materiels[0].modele = 'Nouveau modèle';
  input.materiels.push({ id: 'm-new', ecoleId: 'e-num', idAster: 'MAT-0001', type: 'autre', modele: 'Onduleur', marque: null, serie: null, dateReception: Date.now(), hs: false, salleId: null, garantieFin: null });
  const next = mergeState(state, input, manager);
  assert.equal(next.materiels.find((x) => x.id === input.materiels[0].id).modele, 'Nouveau modèle');
  assert.notEqual(next.materiels.find((x) => x.id === 'm-new').idAster, 'MAT-0001');
  const deleting = scopedState(state, manager); deleting.materiels.shift();
  assert.throws(() => mergeState(state, deleting, manager), { status: 403 });
  const admin = as(state, ADMIN);
  const crossed = scopedState(state, admin);
  crossed.materiels[0].salleId = state.salles.find((s) => s.ecoleId === 'e-res').id;
  assert.throws(() => mergeState(state, crossed, admin), { status: 400 });
});

test('bâtiments : un administrateur renomme un bâtiment ; salles, étages et règles suivent', () => {
  const state = initialState();
  state.regles.push({ id: 'rule-bat', nom: 'jeu.exe', classement: 'blacklist', portee: 'batiment', ecoleId: 'e-num', batiment: 'C' });
  const admin = as(state, ADMIN);
  const input = scopedState(state, admin);
  renameBuilding(input, { ecoleId: 'e-num', batiment: 'C' }, ' sud ');
  const next = mergeState(state, input, admin);
  const school = (list) => list.filter((x) => x.ecoleId === 'e-num');
  assert(!school(next.salles).some((s) => s.batiment === 'C') && !school(next.etages).some((e) => e.batiment === 'C'));
  assert.equal(school(next.salles).filter((s) => s.batiment === 'SUD').length, school(state.salles).filter((s) => s.batiment === 'C').length);
  assert.equal(next.regles.find((r) => r.id === 'rule-bat').batiment, 'SUD');
  assert.equal(processClass(next, { nom: 'jeu.exe', salleId: next.salles.find((s) => s.batiment === 'SUD').id }), 'blacklist', 'la règle suit le bâtiment');
  assert.throws(() => renameBuilding(scopedState(next, admin), { ecoleId: 'e-num', batiment: 'SUD' }, 'a'), /existe déjà/, 'deux bâtiments ne fusionnent pas');
  const teacher = as(state, TEACHER);
  const attempt = scopedState(state, teacher);
  renameBuilding(attempt, { ecoleId: 'e-num', batiment: 'C' }, 'SUD');
  assert.throws(() => mergeState(state, attempt, teacher), { status: 403 });
});

test('préférences : ambiance et verre reconnus, valeur inconnue remplacée par le défaut', () => {
  const state = initialState();
  const admin = as(state, ADMIN);
  const input = scopedState(state, admin);
  input.prefs = { ambiance: 'orion', glass: 'solid' };
  let next = mergeState(state, input, admin);
  assert.deepEqual(scopedState(next, admin).prefs, { ambiance: 'orion', glass: 'solid' });
  input.prefs = { ambiance: 'brume', glass: 'frost' }; // anciennes valeurs
  next = mergeState(state, input, admin);
  assert.deepEqual(scopedState(next, admin).prefs, { ambiance: 'aube', glass: 'liquid' });
});

test('comptes : création dans son école, adresse unique, pas d’auto-désactivation, sujet conservé', () => {
  const state = initialState();
  state.comptes.find((c) => c.id === TEACHER).sujet = 'kc-teacher';
  const admin = as(state, ADMIN);
  const input = scopedState(state, admin);
  input.comptes.push({ id: 'cpt-new', nom: 'P. Nouveau', email: 'P.Nouveau@Aster.Demo', role: 'formateur', ecoleId: 'e-num', actif: true });
  input.comptes.find((c) => c.id === TEACHER).nom = 'L. Martin-Durand';
  const next = mergeState(state, input, admin);
  assert.equal(next.comptes.find((c) => c.id === 'cpt-new').email, 'p.nouveau@aster.demo');
  assert.equal(next.comptes.find((c) => c.id === TEACHER).sujet, 'kc-teacher');
  for (const bad of [
    { id: 'x1', nom: 'X', email: 'admin@aster.demo', role: 'formateur', ecoleId: 'e-num', actif: true },
    { id: 'x2', nom: 'X', email: 'x2@aster.demo', role: 'superadmin', ecoleId: null, actif: true },
    { id: 'x3', nom: 'X', email: 'x3@aster.demo', role: 'formateur', ecoleId: 'e-res', actif: true },
  ]) {
    const attempt = scopedState(state, admin); attempt.comptes.push(bad);
    assert.throws(() => mergeState(state, attempt, admin), (e) => [400, 403].includes(e.status));
  }
  const self = scopedState(state, admin); self.comptes.find((c) => c.id === ADMIN).actif = false;
  assert.throws(() => mergeState(state, self, admin), { status: 400 });
  const removed = scopedState(state, admin); removed.comptes.pop();
  assert.throws(() => mergeState(state, removed, admin), { status: 403 });
});

test('supervision : le formateur demande un arrêt ; seuls les postes modifient les processus', () => {
  const state = online(initialState());
  const teacher = as(state, TEACHER);
  const proc = state.processus[0];
  const direct = scopedState(state, teacher); direct.processus.find((p) => p.id === proc.id).stoppedAt = Date.now();
  assert.throws(() => mergeState(state, direct, teacher), { status: 403 });
  const install = scopedState(state, teacher); install.operations.push({ id: 'x', type: 'installation', cibles: [proc.posteId], applicationId: 'app-putty' });
  assert.throws(() => mergeState(state, install, teacher), { status: 400 });
  const request = scopedState(state, teacher); request.operations.push({ id: 'x', type: 'arret', cibles: [proc.posteId], processusId: proc.id, statut: 'terminee' });
  const next = mergeState(state, request, teacher);
  const op = next.operations.find((o) => o.processusId === proc.id);
  assert.deepEqual([op.statut, op.par, op.resultats[proc.posteId]], ['enregistree', 'L. Martin', 'en_attente']);
  const again = scopedState(next, teacher); again.operations.push({ id: 'y', type: 'arret', cibles: [proc.posteId], processusId: proc.id });
  assert.throws(() => mergeState(next, again, teacher), { status: 400 });
  assert.equal(next.processus.find((p) => p.id === proc.id).stoppedAt, null, 'le processus reste actif jusqu’au résultat du poste');
});

test('postes : rapports, détection, arrêt automatique, résultats et déconnexion', () => {
  const state = initialState();
  const poste = state.postes.find((p) => p.salleId === 's-e-num-a012');
  const now = 1_800_000_000_000;
  applyReports(state, [{ poste: poste.nomReseau, processus: [{ nom: 'firefox.exe', compte: 'stagiaire.01' }, { nom: 'steam.exe', compte: 'stagiaire.01' }, { nom: 'vlc.exe', compte: 'stagiaire.01' }], applications: ['app-firefox', 'inconnue'] }], now);
  assert(poste.connecte);
  assert.equal(state.processus.filter((p) => p.posteId === poste.id).length, 3);
  assert.deepEqual(state.detections.map((d) => [d.processus, d.classement]).sort(), [['steam.exe', 'blacklist'], ['vlc.exe', 'nonref']]);
  const auto = state.operations.find((o) => o.auto);
  assert.equal(auto.type, 'arret');
  assert.deepEqual(state.installations.filter((i) => i.posteId === poste.id).map((i) => i.applicationId), ['app-firefox']);
  const commands = pendingCommands(state, [poste.nomReseau]);
  assert.deepEqual(commands.map((c) => [c.type, c.processus.nom]), [['arret', 'steam.exe']]);
  applyResults(state, [{ operation: auto.id, poste: poste.nomReseau, statut: 'reussie' }], now + 1000);
  assert.equal(auto.statut, 'terminee');
  assert.equal(state.processus.find((p) => p.nom === 'steam.exe').stoppedAt, now + 1000);
  assert.equal(state.detections.find((d) => d.processus === 'steam.exe').arret, 'réussi');
  // Le processus disparaît du rapport suivant : arrêté ; un poste silencieux est déconnecté
  applyReports(state, [{ poste: poste.nomReseau, processus: [{ nom: 'firefox.exe', compte: 'stagiaire.01' }] }], now + 2000);
  assert(state.processus.find((p) => p.nom === 'vlc.exe').stoppedAt);
  markDisconnected(state, now + 2000 + DISCONNECT_AFTER);
  assert.equal(poste.connecte, false);
  assert(state.processus.filter((p) => p.posteId === poste.id).every((p) => p.stoppedAt));
});

test('écritures concurrentes : fusion élément par élément, conflit seulement sur le même élément', () => {
  const state = online(initialState());
  const admin = as(state, ADMIN);
  const base = scopedState(state, admin);
  const log = [];
  // Un rapport de poste et une modification d'un autre utilisateur interviennent entre-temps
  const after = structuredClone(state);
  applyReports(after, [{ poste: after.postes[0].nomReseau, processus: [] }]);
  after.materiels.find((m) => m.id === base.materiels[1].id).modele = 'Modifié ailleurs';
  after.revision = state.revision + 1;
  log.push({ revision: after.revision, before: new Map([
    ...state.processus.filter((p) => p.posteId === state.postes[0].id).map((p) => [`processus\u0000${p.id}`, p]),
    [`postes\u0000${state.postes[0].id}`, state.postes[0]],
    [`materiels\u0000${base.materiels[1].id}`, state.materiels.find((m) => m.id === base.materiels[1].id)],
  ]) });
  const edit = structuredClone(base);
  edit.materiels[0].modele = 'Ma modification';
  const merged = mergeState(after, rebase(after, edit, state.revision, log, admin), admin);
  assert.equal(merged.materiels.find((m) => m.id === base.materiels[0].id).modele, 'Ma modification');
  assert.equal(merged.materiels.find((m) => m.id === base.materiels[1].id).modele, 'Modifié ailleurs');
  const conflict = structuredClone(base);
  conflict.materiels[1].modele = 'Concurrente';
  assert.throws(() => rebase(after, conflict, state.revision, log, admin), { status: 409 });
  assert.throws(() => rebase(after, edit, state.revision - 5, log, admin), { status: 409 });
});

test('moteur : persistance fichier, révision, rapprochement d’identité et PDF dans le périmètre', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'aster-backend-test-'));
  try {
    const file = join(dir, 'state.json');
    const repo = await createWorkspaceRepository({ file });
    const admin = repo.actor(ADMIN);
    const input = repo.read(admin); input.materiels[0].modele = 'Persisté';
    await repo.update(input, 0, admin);
    await repo.agent.rapports([{ poste: repo.state.postes[0].nomReseau, processus: [{ nom: 'firefox.exe', compte: 's' }] }]);
    const stale = repo.read(admin); // révision 2
    await repo.agent.rapports([{ poste: repo.state.postes[0].nomReseau, processus: [] }]); // révision 3
    stale.materiels[2].modele = 'Après un rapport de poste';
    await repo.update(stale, 2, admin);
    await repo.bindIdentity(TEACHER, 'kc-teacher');
    const reopened = await createWorkspaceRepository({ file });
    assert.equal(reopened.read(admin).materiels[0].modele, 'Persisté');
    assert.equal(reopened.read(admin).materiels[2].modele, 'Après un rapport de poste');
    assert.equal(reopened.findAccount({ sub: 'kc-teacher' }).id, TEACHER);
    const report = reopened.read(admin).remontees[0];
    assert.equal((await reopened.pdf(report.id, admin)).body.subarray(0, 8).toString(), '%PDF-1.4');
    const foreign = reopened.state.remontees.find((r) => r.ecoleId === 'e-res');
    await assert.rejects(reopened.pdf(foreign.id, admin), { status: 404 });
    const others = reopened.read(admin).remontees.find((r) => r.auteurId !== TEACHER);
    await assert.rejects(reopened.pdf(others.id, reopened.actor(TEACHER)), { status: 404 });
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test('routeurs : session obligatoire, ETag, jeton des postes', async () => {
  const repository = await createWorkspaceRepository();
  let accountId = null;
  const app = express()
    .use('/api/workspace', createWorkspaceRouter({ repository, actor: () => (accountId ? repository.actor(accountId) : null) }))
    .use('/api/agent', createAgentRouter({ repository, token: 'jeton-de-test' }));
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const url = `http://127.0.0.1:${server.address().port}`;
  try {
    assert.equal((await fetch(`${url}/api/workspace`)).status, 401);
    accountId = TEACHER;
    const first = await fetch(`${url}/api/workspace`);
    const body = await first.json();
    assert.equal(body.moi.nom, 'L. Martin');
    assert.equal(body.comptes.length, 0);
    assert.equal((await fetch(`${url}/api/workspace`, { headers: { 'If-None-Match': first.headers.get('ETag') } })).status, 304);
    assert.equal((await fetch(`${url}/api/agent/postes`)).status, 401);
    assert.equal((await fetch(`${url}/api/agent/postes`, { headers: { Authorization: 'Bearer faux-jeton-de-t' } })).status, 401);
    const auth = { Authorization: 'Bearer jeton-de-test', 'Content-Type': 'application/json' };
    const postes = (await (await fetch(`${url}/api/agent/postes`, { headers: auth })).json()).postes;
    const reply = await (await fetch(`${url}/api/agent/rapports`, { method: 'POST', headers: auth, body: JSON.stringify({ rapports: [{ poste: postes[0].nomReseau, processus: [{ nom: 'steam.exe', compte: 's' }] }] }) })).json();
    assert.equal(reply.commandes[0].type, 'arret');
    assert.equal((await fetch(`${url}/api/workspace`, { headers: { 'If-None-Match': first.headers.get('ETag') } })).status, 200, 'nouvelle révision après le rapport');
    accountId = 'inconnu';
    assert.equal((await fetch(`${url}/api/workspace`)).status, 401);
  } finally { server.close(); }
});
