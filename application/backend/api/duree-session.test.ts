import test from 'node:test';
import assert from 'node:assert/strict';
import { DUREE_MAX, INACTIVITE_MAX, prolonger, sessionValide } from './duree-session.ts';

test('une session active est prolongée, une session inactive expire', () => {
  const t0 = 1_000_000_000_000;
  const s = { ouverteLe: t0, activeLe: t0 };
  assert.ok(sessionValide(s, t0 + 20 * 60 * 1000), 'au-delà de la durée des jetons (15 minutes)');
  assert.equal(prolonger(s, false, t0 + 30 * 1000), false, 'une prolongation par minute au plus');
  assert.equal(prolonger(s, true, t0 + 20 * 60 * 1000), false, 'relecture périodique : pas de prolongation');
  assert.ok(prolonger(s, false, t0 + 25 * 60 * 1000));
  assert.ok(sessionValide(s, t0 + 50 * 60 * 1000), 'activité à 25 minutes : valide jusqu’à 55 minutes');
  assert.equal(sessionValide(s, t0 + 25 * 60 * 1000 + INACTIVITE_MAX), false, '30 minutes sans action');
});

test('une session expire 12 heures après la connexion, même active', () => {
  const t0 = 1_000_000_000_000;
  const s = { ouverteLe: t0, activeLe: t0 + DUREE_MAX - 1000 };
  assert.ok(sessionValide(s, t0 + DUREE_MAX - 1));
  assert.equal(sessionValide(s, t0 + DUREE_MAX), false);
  assert.equal(sessionValide({}, t0), false, 'session sans dates (ancien format) : expirée');
});
