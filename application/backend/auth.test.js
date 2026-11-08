import test from 'node:test';
import assert from 'node:assert/strict';
import { identityFromClaims, userFromAccount } from './profiles.js';
import { readConfig } from './config.js';

test('le fournisseur transmet une identité ; le profil ne vient pas des claims', () => {
  const identity = identityFromClaims({ sub: 'id-1', email: ' Formateur@Aster.Demo ', name: 'Formateur ASTER', aster_roles: ['super_admin'] });
  assert.deepEqual(identity, { sub: 'id-1', email: 'formateur@aster.demo', name: 'Formateur ASTER' });
  assert.throws(() => identityFromClaims({ email: 'x@aster.demo' }));
  assert.throws(() => identityFromClaims({ sub: '' }));
});

test('l’utilisateur présenté vient du compte ASTER', () => {
  const user = userFromAccount({ id: 'cpt-1', nom: 'L. Martin', email: 'formateur@aster.demo', role: 'formateur', ecoleId: 'e-num' }, 'École du numérique');
  assert.deepEqual(user, { id: 'cpt-1', name: 'L. Martin', email: 'formateur@aster.demo', role: 'formateur', profile: 'Formateur', scope: 'École du numérique' });
  assert.equal(userFromAccount({ id: 's', nom: 'S', email: 's@x.y', role: 'superadmin', ecoleId: null }).scope, 'Toutes les écoles');
});

test('les identifiants locaux sont utilisables uniquement hors production', () => {
  assert.equal(readConfig({}).issuer.pathname, '/realms/aster-demo');
  assert.throws(() => readConfig({ NODE_ENV: 'production' }));
  const production = {
    NODE_ENV: 'production', APP_URL: 'https://aster.example.test', DATABASE_URL: 'postgres://example',
    OIDC_ISSUER: 'https://identity.example.test/realms/aster', OIDC_CLIENT_ID: 'aster',
    OIDC_CLIENT_SECRET: 'dedicated-client-secret', SESSION_SECRET: 'a'.repeat(48),
    S3_ENDPOINT: 'https://s3.example.test', S3_BUCKET: 'aster', S3_ACCESS_KEY: 'aster', S3_SECRET_KEY: 'dedicated-s3-secret', AGENT_TOKEN: 'b'.repeat(40),
  };
  assert.equal(readConfig(production).production, true);
  assert.throws(() => readConfig({ ...production, OIDC_ISSUER: 'http://localhost:8080/realms/aster-demo' }));
  assert.throws(() => readConfig({ ...production, OIDC_CLIENT_SECRET: 'aster-demo-client-local' }));
  assert.throws(() => readConfig({ ...production, SESSION_SECRET: 'short' }));
  assert.throws(() => readConfig({ ...production, S3_ENDPOINT: 'http://localhost:8333' }));
  assert.throws(() => readConfig({ ...production, S3_SECRET_KEY: 'aster-demo-local-s3' }));
  assert.throws(() => readConfig({ ...production, S3_BUCKET: '' }));
  assert.throws(() => readConfig({ ...production, AGENT_TOKEN: 'aster-agent-demo-local' }));
});
