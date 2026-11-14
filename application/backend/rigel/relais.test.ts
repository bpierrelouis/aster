import test from 'node:test';
import assert from 'node:assert/strict';
import pg from 'pg';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import type { AddressInfo } from 'node:net';
import { createRelais } from './relais.ts';
import { createMemoryStore, createPostgresStore } from './relais-store.ts';
import { empreinte } from '#shared/rigel.ts';
import { readConfig } from '../config.ts';
import type { RelaisStore } from './relais-store.ts';

const TOKEN = 'jeton-du-connecteur-de-test';
const JETON = 'jeton-du-telephone';
const bloc = { iv: 'aXY', data: 'ZGF0YQ' };

async function demarrer(store: RelaisStore, dist?: string) {
  const server = createRelais({ store, token: TOKEN, dist }).listen(0, '127.0.0.1');
  await new Promise<void>((resolve) => server.once('listening', resolve));
  return { server, url: `http://127.0.0.1:${(server.address() as AddressInfo).port}` };
}

/** Scénario commun aux deux stockages */
async function scenario(store: RelaisStore) {
  const { server, url } = await demarrer(store);
  const connecteur = { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' };
  const telephone = { Authorization: `Bearer ${JETON}`, 'Content-Type': 'application/json' };
  try {
    assert.deepEqual(await (await fetch(`${url}/api/health`)).json(), { status: 'ok' });
    assert.equal((await fetch(`${url}/api/connecteur/campagnes`)).status, 401);
    assert.equal((await fetch(`${url}/api/connecteur/campagnes`, { headers: { Authorization: 'Bearer faux' } })).status, 401);
    const depot = { empreinte: await empreinte(JETON), expireLe: Date.now() + 60_000, version: 'v1', instantane: bloc };
    assert.equal((await fetch(`${url}/api/connecteur/campagnes/rec-1`, { method: 'PUT', headers: connecteur, body: JSON.stringify(depot) })).status, 204);
    assert.equal((await fetch(`${url}/api/connecteur/campagnes/rec-1`, { method: 'PUT', headers: connecteur, body: JSON.stringify({ ...depot, empreinte: 'x' }) })).status, 400);
    assert.deepEqual((await (await fetch(`${url}/api/connecteur/campagnes`, { headers: connecteur })).json()).campagnes, [{ id: 'rec-1', version: 'v1', expireLe: depot.expireLe }]);

    // Téléphone : jeton de sa campagne seulement
    assert.equal((await fetch(`${url}/api/campagnes/rec-1/instantane`)).status, 401);
    assert.equal((await fetch(`${url}/api/campagnes/rec-1/instantane`, { headers: { Authorization: `Bearer ${TOKEN}` } })).status, 401, 'le secret du connecteur n’ouvre pas une campagne');
    assert.equal((await fetch(`${url}/api/campagnes/rec-2/instantane`, { headers: telephone })).status, 404);
    assert.deepEqual(await (await fetch(`${url}/api/campagnes/rec-1/instantane`, { headers: telephone })).json(), { version: 'v1', instantane: bloc });
    const envoi = (evenements: unknown) => fetch(`${url}/api/campagnes/rec-1/evenements`, { method: 'POST', headers: telephone, body: JSON.stringify({ evenements }) });
    assert.equal((await envoi([{ id: 'court', bloc }])).status, 400);
    assert.deepEqual(await (await envoi([{ id: 'evenement-1', bloc }, { id: 'evenement-2', bloc }])).json(), { recus: ['evenement-1', 'evenement-2'] });
    assert.equal((await envoi([{ id: 'evenement-1', bloc }])).status, 200, 'renvoi après une coupure');

    // Connecteur : relève, idempotence, acquittement ; une nouvelle version conserve les événements
    await fetch(`${url}/api/connecteur/campagnes/rec-1`, { method: 'PUT', headers: connecteur, body: JSON.stringify({ ...depot, version: 'v2' }) });
    const { evenements } = await (await fetch(`${url}/api/connecteur/campagnes/rec-1/evenements`, { headers: connecteur })).json();
    assert.deepEqual(evenements.map((e: { id: string }) => e.id), ['evenement-1', 'evenement-2']);
    assert.equal((await fetch(`${url}/api/connecteur/campagnes/rec-1/acquittement`, { method: 'POST', headers: connecteur, body: JSON.stringify({ jusqua: evenements[0].rang }) })).status, 204);
    assert.deepEqual((await (await fetch(`${url}/api/connecteur/campagnes/rec-1/evenements`, { headers: connecteur })).json()).evenements.map((e: { id: string }) => e.id), ['evenement-2']);

    // Suppression et expiration
    assert.equal((await fetch(`${url}/api/connecteur/campagnes/rec-1`, { method: 'DELETE', headers: connecteur })).status, 204);
    assert.equal((await fetch(`${url}/api/campagnes/rec-1/instantane`, { headers: telephone })).status, 404);
    assert.deepEqual((await store.evenements('rec-1', 10)), []);
    await fetch(`${url}/api/connecteur/campagnes/rec-3`, { method: 'PUT', headers: connecteur, body: JSON.stringify({ ...depot, expireLe: Date.now() - 1 }) });
    assert.equal((await fetch(`${url}/api/campagnes/rec-3/instantane`, { headers: telephone })).status, 404, 'campagne expirée');
    await store.purger();
    assert.deepEqual(await store.campagnes(), []);
  } finally { server.close(); }
}

test('relais : authentification, campagnes, événements idempotents, acquittement, suppression, purge (mémoire)', () => scenario(createMemoryStore()));

test('relais : application mobile, adresses de l’interface et en-têtes de sécurité', async () => {
  const dist = await mkdtemp(join(tmpdir(), 'rigel-dist-'));
  await mkdir(join(dist, 'assets'));
  await writeFile(join(dist, 'index.html'), '<!doctype html><title>RIGEL</title>');
  await writeFile(join(dist, 'sw.js'), 'self;');
  await writeFile(join(dist, 'assets', 'app-1.js'), 'export {};');
  const { server, url } = await demarrer(createMemoryStore(), dist);
  try {
    const page = await fetch(`${url}/salles/s-1`);
    assert.equal(await page.text(), '<!doctype html><title>RIGEL</title>');
    assert.equal(page.headers.get('cache-control'), 'no-cache');
    const csp = page.headers.get('content-security-policy')!;
    assert.match(csp, /script-src 'self' 'wasm-unsafe-eval'/);
    assert.match(csp, /frame-ancestors 'none'/);
    assert.equal(page.headers.get('permissions-policy'), 'camera=(self)');
    assert.equal((await fetch(`${url}/sw.js`)).headers.get('cache-control'), 'no-cache');
    assert.match((await fetch(`${url}/assets/app-1.js`)).headers.get('cache-control')!, /immutable/);
    const inconnue = await fetch(`${url}/api/rien`);
    assert.equal(inconnue.status, 404);
    assert.equal(inconnue.headers.get('cache-control'), 'no-store');
  } finally { server.close(); await rm(dist, { recursive: true, force: true }); }
});

// Intégration : PostgreSQL de l'infrastructure ORION (npm run infra:up), schéma temporaire. Ignoré si absent.
const pool = new pg.Pool({ connectionString: process.env.RELAIS_TEST_DATABASE_URL || readConfig().databaseUrl, max: 2, connectionTimeoutMillis: 1500 });
const database = await pool.query('SELECT 1').then(() => true, () => false);
const schema = `rigel_test_${process.pid}`;
test('relais : même scénario sur PostgreSQL', { skip: !database && 'PostgreSQL indisponible' }, async () => scenario(await createPostgresStore({ pool, schema })));
test.after(async () => {
  if (database) await pool.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);
  await pool.end();
});
