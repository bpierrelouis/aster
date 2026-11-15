import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { environnement } from './secrets.ts';

test('les secrets Swarm complètent l’environnement sans le modifier', () => {
  const dossier = mkdtempSync(join(tmpdir(), 'secrets-'));
  writeFileSync(join(dossier, 'AGENT_TOKEN'), 'jeton\n');
  writeFileSync(join(dossier, 'ca.pem'), 'certificat');
  mkdirSync(join(dossier, 'SOUS_DOSSIER'));
  const env = { AGENT_TOKEN: 'ancien', PORT: '3001' };
  const lu = environnement(env, dossier);
  assert.deepEqual(lu, { AGENT_TOKEN: 'jeton', PORT: '3001' });
  assert.equal(env.AGENT_TOKEN, 'ancien');
});

test('sans dossier de secrets, l’environnement est inchangé', () => {
  const env = { PORT: '3001' };
  assert.equal(environnement(env, join(tmpdir(), 'absent-orion')), env);
});
