import assert from 'node:assert/strict';
import { test } from 'node:test';
import { motDePasse } from './mot-de-passe.ts';

test('mot de passe dérivé : stable, propre à chaque compte et à chaque secret', () => {
  const a = motDePasse('secret', 'julien.mercier@outlook.fr');
  assert.match(a, /^[a-hj-km-np-z2-9]{4}-[a-hj-km-np-z2-9]{4}-[a-hj-km-np-z2-9]{4}$/);
  assert.equal(motDePasse('secret', ' Julien.Mercier@outlook.fr '), a, 'adresse normalisée');
  assert.notEqual(motDePasse('secret', 'sophie.garnier@yahoo.fr'), a, 'un mot de passe par compte');
  assert.notEqual(motDePasse('autre secret', 'julien.mercier@outlook.fr'), a, 'dépend du secret');
});
