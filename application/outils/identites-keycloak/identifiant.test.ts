import test from 'node:test';
import assert from 'node:assert/strict';
import { identifiantDeBase, identifiantUnique } from './identifiant.ts';

test('identifiant : prénom.nom en minuscules, sans accents', () => {
  assert.equal(identifiantDeBase('Élodie Lefèvre'), 'elodie.lefevre');
  assert.equal(identifiantDeBase('C. Durand'), 'c.durand');
  assert.equal(identifiantDeBase('Chloé Œuvray'), 'chloe.oeuvray');
});

test('identifiant : prénoms et noms composés ou longs raccourcis', () => {
  assert.equal(identifiantDeBase('Pierre-Louis Baelde'), 'pl.baelde', 'prénom composé : initiales');
  assert.equal(identifiantDeBase('Pierre Louis Baelde'), 'pl.baelde', 'prénoms séparés par une espace');
  assert.equal(identifiantDeBase('Jean Dupont-Moretti'), 'jean.dupont-m', 'nom composé : premier élément et initiales');
  assert.equal(identifiantDeBase('Anne-Marie DUPONT MORETTI'), 'am.dupont-m', 'nom en capitales');
  assert.equal(identifiantDeBase('Jean de La Fontaine'), 'jean.fontaine', 'particules retirées');
  assert.equal(identifiantDeBase('Maximilien Wolfeschlegelsteinhausen'), 'maximili.wolfeschleg', 'longueurs bornées');
  assert(identifiantDeBase('Maximilien Wolfeschlegelsteinhausen').length <= 20);
});

test('identifiant : repli sur la partie locale de l’adresse si le nom est inutilisable', () => {
  assert.equal(identifiantDeBase('—', 'n.petit'), 'n.petit');
  assert.equal(identifiantDeBase(''), 'utilisateur');
});

test('identifiant : homonymes départagés par un chiffre à partir du deuxième', () => {
  const pris = new Set<string>();
  const suivant = (nom: string) => { const id = identifiantUnique(nom, (x) => pris.has(x)); pris.add(id); return id; };
  assert.deepEqual(['Pierre-Louis Baelde', 'Pierre Louis Baelde', 'Pierre-Louis BAELDE'].map(suivant), ['pl.baelde', 'pl.baelde1', 'pl.baelde2']);
  pris.add('maximili.wolfeschleg');
  assert.equal(identifiantUnique('Maximilien Wolfeschlegelsteinhausen', (x) => pris.has(x)), 'maximili.wolfeschle1', 'suffixe compris dans les 20 caractères');
});
