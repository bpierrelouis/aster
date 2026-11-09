import test from 'node:test';
import assert from 'node:assert/strict';
import pg from 'pg';
import { createPostgresWorkspaceRepository } from './workspace-postgres.js';
import { createMemoryStorage, createS3Storage } from './storage.js';
import { readConfig } from './config.js';

// Tests d'intégration : PostgreSQL et S3 réels (npm run infra:up). Ignorés si l'infrastructure est absente.
const config = readConfig();
const pool = new pg.Pool({ connectionString: config.databaseUrl, max: 4, connectionTimeoutMillis: 1500 });
const database = await pool.query('SELECT 1').then(() => true, () => false);
const schema = `aster_test_${process.pid}`;
const quiet = { error() {} };
const open = (storage) => createPostgresWorkspaceRepository({ pool, storage, schema, log: quiet });

test.after(async () => {
  if (database) await pool.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);
  await pool.end();
});

test('PostgreSQL : comptes, préférences, écritures, postes et états des lieux persistent', { skip: !database && 'PostgreSQL indisponible' }, async () => {
  const storage = createMemoryStorage();
  const repo = await open(storage);
  const admin = repo.actor('cpt-num-admin');
  const teacher = repo.actor('cpt-num-formateur');
  const counts = (await pool.query(`SELECT (SELECT count(*) FROM ${schema}.aster_materiel)::int AS materiels, (SELECT count(*) FROM ${schema}.aster_remontee)::int AS remontees, (SELECT count(*) FROM ${schema}.aster_compte)::int AS comptes`)).rows[0];
  assert.equal(counts.materiels, repo.state.materiels.length);
  assert.equal(counts.comptes, repo.state.comptes.length);
  assert.equal(storage.objects.size, counts.remontees, 'un état des lieux déposé par remontée existante');

  // Administrateur : matériel créé (identifiant attribué), salle supprimée, compte créé, préférences
  const input = repo.read(admin);
  input.materiels.push({ id: 'm-test', ecoleId: 'e-num', idAster: 'MAT-0000', type: 'autre', modele: 'Onduleur test', marque: null, serie: null, dateReception: Date.UTC(2026, 9, 1), hs: false, salleId: null, garantieFin: null });
  input.materiels[0].modele = 'Modèle modifié';
  const emptyRoom = input.salles.find((x) => !repo.state.postes.some((p) => p.salleId === x.id));
  const moved = input.materiels.filter((m) => m.salleId === emptyRoom.id).map((m) => m.id);
  input.materiels.forEach((m) => { if (m.salleId === emptyRoom.id) m.salleId = null; });
  input.salles = input.salles.filter((x) => x.id !== emptyRoom.id);
  input.comptes.push({ id: 'cpt-test', nom: 'P. Nouveau', email: 'p.nouveau@aster.demo', role: 'formateur', ecoleId: 'e-num', actif: true });
  input.prefs = { ambiance: 'encre', glass: 'frost' };
  await repo.update(input, 0, admin);
  await repo.bindIdentity('cpt-test', 'kc-nouveau');

  // Postes : rapport, arrêt automatique d'un processus interdit, résultat
  const poste = repo.state.postes.find((p) => p.salleId === 's-e-num-a012');
  const { commandes } = await repo.agent.rapports([{ poste: poste.nomReseau, processus: [{ nom: 'firefox.exe', compte: 'stagiaire.01' }, { nom: 'steam.exe', compte: 'stagiaire.01' }], applications: ['app-firefox'] }]);
  assert.equal(commandes[0].type, 'arret');
  await repo.agent.resultats([{ operation: commandes[0].operation, poste: poste.nomReseau, statut: 'reussie' }]);

  // Formateur : remontée transmise sur une révision antérieure (fusion), PDF déposé à la transmission
  const mine = repo.read(teacher);
  const mat = mine.materiels.find((m) => m.salleId && m.id !== input.materiels[0].id);
  mine.remontees.unshift({ id: 'tmp-1', ecoleId: mat.ecoleId, materielIds: [mat.id], probleme: 'display', description: 'Écran noir test' });
  await repo.agent.rapports([{ poste: poste.nomReseau, processus: [{ nom: 'firefox.exe', compte: 'stagiaire.01' }] }]);
  const after = await repo.update(mine, mine.revision, teacher);
  const report = after.remontees.find((r) => r.description === 'Écran noir test');
  assert.match(report.id, /^REM-\d{4}$/);
  assert.equal(report.auteurId, 'cpt-num-formateur');
  const key = `etats-des-lieux/${report.ecoleId}/${report.id}.pdf`;
  const snapshot = storage.objects.get(key);
  assert(snapshot);

  // L'état des lieux reste celui de la transmission même si le matériel change ensuite
  const later = repo.read(admin);
  later.materiels.find((m) => m.id === mat.id).modele = 'Renommé après la remontée';
  await repo.update(later, later.revision, admin);
  assert.deepEqual(await repo.pdf(report.id, teacher), { url: `memoire:///${key}` }, 'lien vers le document déposé, sans transit');
  assert.deepEqual(storage.objects.get(key), snapshot);

  // Relecture complète depuis PostgreSQL
  const reopened = await open(storage);
  const state = reopened.state;
  assert.equal(state.materiels.find((m) => m.id === 'm-test').modele, 'Onduleur test');
  assert.match(state.materiels.find((m) => m.id === 'm-test').idAster, /^MAT-\d{4}$/);
  assert.equal(state.materiels.find((m) => m.id === input.materiels[0].id).modele, 'Modèle modifié');
  assert(!state.salles.some((x) => x.id === emptyRoom.id));
  assert(moved.every((id) => state.materiels.find((m) => m.id === id).salleId === null));
  assert.deepEqual(state.remontees.find((r) => r.id === report.id).materielIds, [mat.id]);
  assert.equal(state.materiels.find((m) => m.id === mat.id).modele, 'Renommé après la remontée');
  assert.equal(reopened.findAccount({ sub: 'kc-nouveau' }).id, 'cpt-test');
  assert.equal(reopened.read(admin).prefs.ambiance, 'encre');
  assert.equal(reopened.read(teacher).prefs.ambiance, 'brume', 'préférences propres à chaque compte');
  assert(state.detections.some((d) => d.processus === 'steam.exe' && d.arret === 'réussi'));
  assert(state.processus.find((p) => p.nom === 'steam.exe').stoppedAt);
  assert.deepEqual(await reopened.pdf(report.id, teacher), { url: `memoire:///${key}` });
  await assert.rejects(reopened.pdf(state.remontees.find((r) => r.ecoleId === 'e-res').id, admin), { status: 404 });
  const row = (await pool.query(`SELECT date_reception FROM ${schema}.aster_materiel WHERE id = 'm-test'`)).rows[0];
  assert.equal(row.date_reception.toISOString(), '2026-10-01T00:00:00.000Z');
  const account = (await pool.query(`SELECT email, role, ecole_id, sujet FROM ${schema}.aster_compte WHERE id = 'cpt-test'`)).rows[0];
  assert.deepEqual(account, { email: 'p.nouveau@aster.demo', role: 'formateur', ecole_id: 'e-num', sujet: 'kc-nouveau' });
});

test('PostgreSQL : un état des lieux manquant est produit puis déposé', { skip: !database && 'PostgreSQL indisponible' }, async () => {
  const storage = createMemoryStorage();
  const repo = await open(storage);
  const admin = repo.actor('cpt-num-admin');
  const id = repo.read(admin).remontees[0].id;
  await pool.query(`UPDATE ${schema}.aster_remontee SET etat_des_lieux_cle = NULL WHERE id = $1`, [id]);
  storage.objects.clear();
  const reopened = await open(storage);
  const { url } = await reopened.pdf(id, admin);
  assert.equal(storage.objects.size, 1);
  const [[key, body]] = storage.objects;
  assert.equal(url, `memoire:///${key}`);
  assert.equal(body.subarray(0, 5).toString(), '%PDF-');
  assert((await pool.query(`SELECT etat_des_lieux_cle FROM ${schema}.aster_remontee WHERE id = $1`, [id])).rows[0].etat_des_lieux_cle);
});

const s3 = createS3Storage({ ...config.s3, bucket: 'aster-tests' });
const s3Available = await s3.ensureBucket().then(() => true, () => false);
test('S3 : dépôt et relecture d’un objet', { skip: !s3Available && 'S3 indisponible' }, async () => {
  const body = Buffer.from('%PDF-1.4 test');
  await s3.put('etats-des-lieux/test.pdf', body);
  assert.deepEqual(await s3.get('etats-des-lieux/test.pdf'), body);
  await assert.rejects(s3.get('etats-des-lieux/absent.pdf'));
  const signed = await fetch(await s3.signedUrl('etats-des-lieux/test.pdf', 'test.pdf'));
  assert.equal(signed.headers.get('content-type'), 'application/pdf');
  assert.deepEqual(Buffer.from(await signed.arrayBuffer()), body, 'lecture par le lien signé, sans identifiants');
  const altered = new URL(await s3.signedUrl('etats-des-lieux/test.pdf', 'test.pdf'));
  altered.pathname = altered.pathname.replace('test.pdf', 'autre.pdf');
  assert.equal((await fetch(altered)).status, 403, 'signature propre à un objet');
  const wrong = createS3Storage({ ...config.s3, bucket: 'aster-tests', secretAccessKey: 'faux' });
  await assert.rejects(wrong.get('etats-des-lieux/test.pdf'));
  wrong.destroy();
});
test.after(() => s3.destroy());
