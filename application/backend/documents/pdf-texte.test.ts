import test from 'node:test';
import assert from 'node:assert/strict';
import { fit, textWidth, wrap } from './pdf-texte.ts';

test('texte du PDF : coupe et réduction exactes, en temps linéaire même pour un très long mot', () => {
  assert.deepEqual(wrap('un deux trois', 1000, 10), ['un deux trois']);
  const lignes = wrap('i'.repeat(200), 50, 10);
  assert.equal(lignes.join(''), 'i'.repeat(200));
  assert.ok(lignes.every((l) => textWidth(l, 10) <= 50));
  assert.ok(textWidth(fit('Matériel informatique de salle', 60, 10), 10) <= 60);
  assert.ok(fit('Matériel informatique de salle', 60, 10).endsWith('…'));
  // Description maximale d'une remontée (12 000 caractères) : un seul mot, coupé et réduit sans geler le serveur
  const debut = performance.now();
  wrap('i'.repeat(12_000), 480, 10);
  fit('i'.repeat(12_000), 120, 10);
  assert.ok(performance.now() - debut < 500, 'découpe en temps linéaire');
});
