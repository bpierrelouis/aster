import test from 'node:test';
import assert from 'node:assert/strict';
import { identityFromClaims, userFromAccount } from './profiles.ts';
import { readConfig } from './config.ts';

test('le fournisseur transmet une identité ; le profil ne vient pas des claims', () => {
  const identity = identityFromClaims({ sub: 'id-1', email: ' Formateur@Orion.Demo ', email_verified: true, name: 'Formateur ORION', orion_roles: ['superadmin'] });
  assert.deepEqual(identity, { sub: 'id-1', email: 'formateur@orion.demo' });
  assert.equal(identityFromClaims({ sub: 'id-2', email: 'admin@orion.demo' }).email, null, 'adresse non vérifiée : pas de rapprochement');
  assert.throws(() => identityFromClaims({ email: 'x@orion.demo' }));
  assert.throws(() => identityFromClaims({ sub: '' }));
});

test('l’utilisateur présenté vient du compte ORION', () => {
  const user = userFromAccount({ id: 'cpt-1', nom: 'L. Martin', email: 'formateur@orion.demo', role: 'formateur', ecoleId: 'e-num' }, 'École du numérique');
  assert.deepEqual(user, { id: 'cpt-1', name: 'L. Martin', email: 'formateur@orion.demo', role: 'formateur', profile: 'Formateur', scope: 'École du numérique' });
  assert.equal(userFromAccount({ id: 's', nom: 'S', email: 's@x.y', role: 'superadmin', ecoleId: null }).scope, 'Toutes les écoles');
});

test('les identifiants locaux sont utilisables uniquement hors production', () => {
  assert.equal(readConfig({}).issuer.pathname, '/realms/orion');
  assert.throws(() => readConfig({ NODE_ENV: 'production' }));
  const production = {
    NODE_ENV: 'production', APP_URL: 'https://orion.example.test', DATABASE_URL: 'postgres://example',
    OIDC_ISSUER: 'https://identity.example.test/realms/orion', OIDC_CLIENT_ID: 'orion',
    OIDC_CLIENT_SECRET: 'dedicated-client-secret', SESSION_SECRET: 'a'.repeat(48),
    AGENT_TOKEN: 'b'.repeat(40),
  };
  assert.equal(readConfig(production).production, true);
  assert.throws(() => readConfig({ ...production, OIDC_ISSUER: 'http://localhost:8080/realms/orion' }));
  assert.throws(() => readConfig({ ...production, OIDC_CLIENT_SECRET: 'orion-client-local' }));
  assert.throws(() => readConfig({ ...production, SESSION_SECRET: 'short' }));
  assert.throws(() => readConfig({ ...production, AGENT_TOKEN: 'orion-agent-local' }));
  // Écoute et création des identités du démonstrateur
  assert.equal(readConfig({}).host, '127.0.0.1');
  assert.equal(readConfig({ HOST: '0.0.0.0' }).host, '0.0.0.0');
  assert.equal(readConfig({}).identityProvisioning, true);
  assert.equal(readConfig(production).identityProvisioning, false);
  assert.throws(() => readConfig({ ...production, IDENTITY_PROVISIONING: 'true' }));
  const demo = readConfig({ ...production, IDENTITY_PROVISIONING: 'true', KEYCLOAK_ADMIN_PASSWORD: 'dedicated-admin', KEYCLOAK_ADMIN_URL: 'http://keycloak:8080' });
  assert.equal(demo.identityProvisioning, true);
  assert.equal(demo.keycloakAdmin.adminUrl.origin, 'http://keycloak:8080');
  assert.equal(readConfig(production).keycloakAdmin.adminUrl.origin, 'https://identity.example.test');
});
