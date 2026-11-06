import test from 'node:test';
import assert from 'node:assert/strict';
import { userFromClaims } from './profiles.js';
import { readConfig } from './config.js';

test('chaque compte reçoit exactement son profil issu des claims OIDC', () => {
  for (const role of ['super_admin', 'admin', 'gestionnaire', 'formateur']) {
    const user = userFromClaims({ sub: `id-${role}`, email: `${role}@aster.demo`, aster_roles: ['offline_access', role] });
    assert.equal(user.role, role);
    assert.equal(user.scope, role === 'super_admin' ? 'Toutes les écoles' : 'École de rattachement');
  }
});

test('un compte sans profil, avec plusieurs profils ou sans identité est refusé', () => {
  for (const claims of [
    { sub: '1' },
    { sub: '1', aster_roles: ['inconnu'] },
    { sub: '1', aster_roles: ['admin', 'formateur'] },
    { aster_roles: ['super_admin'] },
    { sub: '1', aster_roles: 'admin' },
  ]) assert.throws(() => userFromClaims(claims));
});

test('les identifiants locaux sont utilisables uniquement hors production', () => {
  assert.equal(readConfig({}).issuer.pathname, '/realms/aster-demo');
  assert.throws(() => readConfig({ NODE_ENV: 'production' }));
  const production = {
    NODE_ENV: 'production', APP_URL: 'https://aster.example.test', DATABASE_URL: 'postgres://example',
    OIDC_ISSUER: 'https://identity.example.test/realms/aster', OIDC_CLIENT_ID: 'aster',
    OIDC_CLIENT_SECRET: 'dedicated-client-secret', SESSION_SECRET: 'a'.repeat(48),
  };
  assert.equal(readConfig(production).production, true);
  assert.throws(() => readConfig({ ...production, OIDC_ISSUER: 'http://localhost:8080/realms/aster-demo' }));
  assert.throws(() => readConfig({ ...production, OIDC_CLIENT_SECRET: 'aster-demo-client-local' }));
  assert.throws(() => readConfig({ ...production, SESSION_SECRET: 'short' }));
});
