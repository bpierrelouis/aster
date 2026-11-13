import test from 'node:test';
import assert from 'node:assert/strict';
import pg from 'pg';
import { createPostgresWorkspaceRepository } from './postgres.ts';
import { readConfig } from '../config.ts';
import type { Ecriture } from './rules.ts';

// Tests d'intégration : PostgreSQL réel (npm run infra:up). Ignorés si l'infrastructure est absente.
const config = readConfig();
const pool = new pg.Pool({ connectionString: config.databaseUrl, max: 4, connectionTimeoutMillis: 1500 });
const database = await pool.query('SELECT 1').then(() => true, () => false);
const schema = `orion_test_${process.pid}`;
const open = () => createPostgresWorkspaceRepository({ pool, schema });

test('PostgreSQL : sans SEED_RESET, des données d’une autre version ne sont pas effacées', { skip: !database && 'PostgreSQL indisponible' }, async () => {
  await open();
  await pool.query(`UPDATE ${schema}.orion_espace SET version_donnees = 0`);
  await assert.rejects(createPostgresWorkspaceRepository({ pool, schema, seedReset: false }), /réinitialisation refusée/);
  await open(); // démonstrateur : réinitialisation autorisée
});

test.after(async () => {
  if (database) await pool.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);
  await pool.end();
});

test('PostgreSQL : comptes, préférences, écritures, postes et états des lieux persistent', { skip: !database && 'PostgreSQL indisponible' }, async () => {
  const repo = await open();
  const admin = (await repo.actor('cpt-num-admin'))!;
  const teacher = (await repo.actor('cpt-num-formateur'))!;
  const counts = (await pool.query(`SELECT (SELECT count(*) FROM ${schema}.orion_materiel)::int AS materiels, (SELECT count(*) FROM ${schema}.orion_compte)::int AS comptes`)).rows[0];
  assert.equal(counts.materiels, (await repo.snapshot()).materiels.length);
  assert.equal(counts.comptes, (await repo.snapshot()).comptes.length);

  // Administrateur : matériel créé (identifiant attribué), salle supprimée, compte créé, préférences
  const input: Ecriture = await repo.read(admin);
  input.materiels.push({ id: 'm-test', ecoleId: 'e-num', idOrion: 'MAT-0000', type: 'autre', modele: 'Onduleur test', marque: null, serie: null, dateReception: Date.UTC(2026, 9, 1), hs: false, salleId: null, garantieFin: null });
  input.materiels[0].modele = 'Modèle modifié';
  const { postes } = await repo.snapshot();
  const emptyRoom = input.salles.find((x) => !postes.some((p) => p.salleId === x.id))!;
  const moved = input.materiels.filter((m) => m.salleId === emptyRoom.id).map((m) => m.id);
  input.materiels.forEach((m) => { if (m.salleId === emptyRoom.id) m.salleId = null; });
  input.salles = input.salles.filter((x) => x.id !== emptyRoom.id);
  input.comptes.push({ id: 'cpt-test', nom: 'P. Nouveau', email: 'p.nouveau@orion.demo', role: 'formateur', ecoleId: 'e-num', actif: true });
  input.prefs = { ambiance: 'minarm', glass: 'solid' };
  await repo.update(input, 0, admin);
  const avantConnexion = Date.now();
  await repo.connexion('cpt-test', 'kc-nouveau');

  // Postes : rapport, arrêt automatique d'un processus interdit, résultat
  const poste = (await repo.snapshot()).postes.find((p) => p.salleId === 's-e-num-a012')!;
  const { commandes } = await repo.agent.rapports([{ poste: poste.nomReseau, processus: [{ nom: 'firefox.exe', compte: 'stagiaire.01' }, { nom: 'steam.exe', compte: 'stagiaire.01' }], applications: ['app-firefox'] }]);
  assert.equal(commandes[0].type, 'arret');
  await repo.agent.resultats([{ operation: commandes[0].operation, poste: poste.nomReseau, statut: 'reussie' }]);

  // Formateur : remontée transmise sur une révision antérieure (fusion)
  const mine: Ecriture = await repo.read(teacher);
  const mat = mine.materiels.find((m) => m.salleId && m.id !== input.materiels[0].id)!;
  mine.remontees.unshift({ id: 'tmp-1', ecoleId: mat.ecoleId, materielIds: [mat.id], probleme: 'display', description: 'Écran noir test' });
  await repo.agent.rapports([{ poste: poste.nomReseau, processus: [{ nom: 'firefox.exe', compte: 'stagiaire.01' }] }]);
  const after = await repo.update(mine, mine.revision, teacher);
  const report = after.remontees.find((r) => r.description === 'Écran noir test')!;
  assert.match(report.id, /^REM-\d{4}$/);
  assert.equal(report.auteurId, 'cpt-num-formateur');
  // L'état des lieux est produit à la demande, avec les informations actuelles
  const later = await repo.read(admin);
  later.materiels.find((m) => m.id === mat.id)!.modele = 'Renommé après la remontée';
  await repo.update(later, later.revision, admin);
  const pdf = await repo.pdf(report.id, teacher);
  assert.equal(pdf.subarray(0, 5).toString(), '%PDF-');

  // Relecture complète depuis PostgreSQL
  const reopened = await open();
  const state = await reopened.snapshot();
  assert.equal(state.materiels.find((m) => m.id === 'm-test')!.modele, 'Onduleur test');
  assert.match(state.materiels.find((m) => m.id === 'm-test')!.idOrion, /^MAT-\d{4}$/);
  assert.equal(state.materiels.find((m) => m.id === input.materiels[0].id)!.modele, 'Modèle modifié');
  assert(!state.salles.some((x) => x.id === emptyRoom.id));
  assert(moved.every((id) => state.materiels.find((m) => m.id === id)!.salleId === null));
  assert.deepEqual(state.remontees.find((r) => r.id === report.id)!.materielIds, [mat.id]);
  assert.equal(state.materiels.find((m) => m.id === mat.id)!.modele, 'Renommé après la remontée');
  const connecte = await reopened.findAccount({ sub: 'kc-nouveau' });
  assert.equal(connecte?.id, 'cpt-test');
  assert.ok(connecte!.derniereConnexion! >= avantConnexion && !("dateDesactivation" in connecte!), 'dernière connexion relue en base ; compte actif sans date de désactivation');
  assert.equal((await reopened.read(admin)).prefs.ambiance, 'minarm');
  assert.equal((await reopened.read(teacher)).prefs.ambiance, 'orion', 'préférences propres à chaque compte');
  assert(state.detections.some((d) => d.processus === 'steam.exe' && d.arret === 'réussi'));
  assert(state.processus.find((p) => p.nom === 'steam.exe')!.stoppedAt);
  assert.equal((await reopened.pdf(report.id, teacher)).subarray(0, 5).toString(), '%PDF-');
  await assert.rejects(reopened.pdf(state.remontees.find((r) => r.ecoleId === 'e-res')!.id, admin), { status: 404 });
  const row = (await pool.query(`SELECT date_reception FROM ${schema}.orion_materiel WHERE id = 'm-test'`)).rows[0];
  assert.equal(row.date_reception.toISOString(), '2026-10-01T00:00:00.000Z');
  const account = (await pool.query(`SELECT email, role, ecole_id, sujet, derniere_connexion IS NOT NULL AS connecte FROM ${schema}.orion_compte WHERE id = 'cpt-test'`)).rows[0];
  assert.deepEqual(account, { email: 'p.nouveau@orion.demo', role: 'formateur', ecole_id: 'e-num', sujet: 'kc-nouveau', connecte: true });
});

test('PostgreSQL : deux serveurs partagent la même base et fusionnent leurs écritures', { skip: !database && 'PostgreSQL indisponible' }, async () => {
  const [a, b] = [await open(), await open()];
  const admin = (await a.actor('cpt-num-admin'))!;
  const base = await a.read(admin);
  const [first, second] = [structuredClone(base), structuredClone(base)];
  first.materiels[0].modele = 'Écrit par le serveur A';
  second.materiels[1].modele = 'Écrit par le serveur B';
  // Écritures simultanées préparées sur la même révision : verrou en base, puis fusion par le journal
  await Promise.all([a.update(first, base.revision, admin), b.update(second, base.revision, admin)]);
  for (const repo of [a, b]) {
    const view = await repo.read(admin);
    assert.equal(view.revision, base.revision + 2);
    assert.equal(view.materiels[0].modele, 'Écrit par le serveur A');
    assert.equal(view.materiels[1].modele, 'Écrit par le serveur B');
  }
  // Le même élément modifié des deux côtés : la seconde écriture est refusée
  const conflict = structuredClone(base);
  conflict.materiels[0].modele = 'Conflit';
  await assert.rejects(b.update(conflict, base.revision, admin), { status: 409 });
  // Un rapport de poste reçu par B est visible depuis A
  const poste = (await a.snapshot()).postes[0];
  await b.agent.rapports([{ poste: poste.nomReseau, processus: [{ nom: 'notepad.exe', compte: 'stagiaire.02' }] }]);
  assert((await a.snapshot()).processus.some((p) => p.posteId === poste.id && p.nom === 'notepad.exe'));
});
