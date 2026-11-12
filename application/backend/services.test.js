import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readConfig } from './config.js';
import { createServices } from './services.js';

/** Serveur HTTP local qui répond toujours avec le statut donné ; body(url) donne le contenu. */
async function server(status, body = () => ({})) {
  let url;
  const s = createServer((_req, res) => res.writeHead(status, { 'Content-Type': 'application/json' }).end(JSON.stringify(body(url))));
  await new Promise((resolve) => s.listen(0, '127.0.0.1', resolve));
  url = `http://127.0.0.1:${s.address().port}`;
  return { url, close: () => s.close() };
}

async function setup({ databaseUp = true, env = {} } = {}) {
  const web = await server(200);
  const oidc = await server(200, (url) => ({ issuer: `${url}/realms/aster` }));
  const issuerUrl = `${oidc.url}/realms/aster`;
  const config = readConfig({ APP_URL: web.url, OIDC_ISSUER: issuerUrl, IDENTITY_PROVISIONING: 'false' });
  const pool = { query: async () => { if (!databaseUp) throw Object.assign(new Error('refus'), { code: 'ECONNREFUSED' }); } };
  const snapshot = async () => ({ postes: [{ vuLe: Date.now() }, { vuLe: Date.now() - 60_000 }, {}] });
  const services = createServices({ config, env: { WEB_URL: web.url, ...env }, pool, snapshot, connectedAfter: 30_000 });
  return { services, close: () => { web.close(); oidc.close(); } };
}

const byId = (health) => Object.fromEntries(health.services.map((s) => [s.id, s]));

test('état : adresse, IP, port et état de chaque service', async () => {
  const { services, close } = await setup();
  try {
    const health = await services.health();
    const s = byId(health);
    assert.equal(health.status, 'ok');
    for (const id of ['entree', 'web', 'api', 'base', 'identite']) assert.equal(s[id].status, 'up', id);
    assert.equal(s.base.address, 'localhost:5432');
    assert.ok(s.base.ip.length > 0);
    assert.equal(s.annuaire.status, 'not-configured');
    assert.equal(s.journaux.status, 'not-configured');
    assert.deepEqual([s.postes.status, s.postes.connected, s.postes.total], ['up', 1, 3]);
    assert.ok(!JSON.stringify(health).includes('aster-local'), 'aucun secret dans la réponse');
  } finally { close(); }
});

test('état : service requis indisponible, ou service facultatif indisponible', async () => {
  let { services, close } = await setup({ databaseUp: false });
  try {
    const health = await services.health();
    assert.equal(health.status, 'unavailable');
    assert.equal(byId(health).base.error, 'ECONNREFUSED');
  } finally { close(); }
  ({ services, close } = await setup({ env: { LDAP_URL: 'ldap://127.0.0.1:1' } }));
  try {
    const health = await services.health();
    assert.equal(health.status, 'degraded');
    assert.deepEqual([byId(health).annuaire.status, byId(health).annuaire.port], ['down', 1]);
  } finally { close(); }
});

test('description : système et services, sans identifiants', async () => {
  const { services, close } = await setup({ env: { ASTER_VERSION: 'abc123' } });
  try {
    const infos = services.infos();
    assert.equal(infos.application.version, 'abc123');
    assert.equal(infos.application.mode, 'développement');
    assert.ok(infos.services.every((s) => s.name && s.role));
    assert.deepEqual(infos.services.find((s) => s.id === 'base'), { id: 'base', name: 'Base de données', role: infos.services.find((s) => s.id === 'base').role, host: 'localhost', port: 5432, required: true });
    assert.ok(!JSON.stringify(infos).includes('aster-local'));
  } finally { close(); }
});
