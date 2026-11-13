import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { inflateSync } from 'node:zlib';
import { createWorkspaceRepository } from './engine.ts';
import { actorOf, initialState, mergeState, scopedState } from './rules.ts';
import { problem } from '#shared/catalog.ts';
import { normalizeProblemLabel, PROBLEM_LABEL_HELP } from '#shared/problem-label.ts';
import type { Ecriture } from './rules.ts';

const TEACHER = 'cpt-num-formateur';

test('problème libre : libellé conservé, catégorie Autre et contenu du PDF', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'orion-probleme-'));
  try {
    const file = join(dir, 'workspace.json');
    const repo = await createWorkspaceRepository({ file });
    const actor = (await repo.actor(TEACHER))!;
    const input: Ecriture = await repo.read(actor);
    const mat = input.materiels.find((m) => m.salleId)!;
    input.remontees.unshift({ id: 'tmp-other', ecoleId: mat.ecoleId, materielIds: [mat.id], probleme: '  bRUIT INHABITUEL  ', description: 'Le ventilateur fait un bruit continu.' });
    const saved = await repo.update(input, input.revision, actor);
    const report = saved.remontees.find((r) => r.description === 'Le ventilateur fait un bruit continu.')!;
    assert.equal(report.probleme, 'Bruit inhabituel');
    assert.deepEqual(problem(report.probleme), { id: 'other', label: 'Bruit inhabituel', icon: 'other' });
    assert.equal(problem('display').label, 'Pas d’image');
    assert.equal(problem(null).label, 'Autre');
    const reopened = await createWorkspaceRepository({ file });
    assert.equal((await reopened.read(actor)).remontees.find((r) => r.id === report.id)!.probleme, 'Bruit inhabituel');
    const pdf = (await reopened.pdf(report.id, actor)).toString('latin1');
    const contents = [...pdf.matchAll(/stream\n([\s\S]*?)\nendstream/g)].map((m) => inflateSync(Buffer.from(m[1], 'latin1')).toString('latin1')).join('\n');
    const text = [...contents.matchAll(/<([0-9a-f]+)> Tj/g)].map((m) => Buffer.from(m[1], 'hex').toString('latin1')).join('\n');
    assert.match(text, /Bruit inhabituel/);
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test('problème libre : le serveur refuse les libellés vides, trop longs ou non textuels', () => {
  const state = initialState();
  const actor = actorOf(state, TEACHER)!;
  for (const invalid of ['x'.repeat(101), 42, { label: 'Bruit' }]) {
    const input: Ecriture = scopedState(state, actor);
    const mat = input.materiels.find((m) => m.salleId)!;
    input.remontees.unshift({ id: 'tmp-other', ecoleId: mat.ecoleId, materielIds: [mat.id], probleme: invalid as string, description: 'Un bruit continu.' });
    assert.throws(() => mergeState(state, input, actor), { status: 400, message: 'Type de problème invalide.' });
  }
});

test('type de problème : obligatoire pour créer une remontée', () => {
  const state = initialState();
  const actor = actorOf(state, TEACHER)!;
  for (const missing of [undefined, null, '', '   ']) {
    const input: Ecriture = scopedState(state, actor);
    const mat = input.materiels.find((m) => m.salleId)!;
    input.remontees.unshift({ id: 'tmp-sans-type', ecoleId: mat.ecoleId, materielIds: [mat.id], probleme: missing as string, description: 'Un bruit continu.' });
    if (missing === undefined) delete input.remontees[0].probleme;
    assert.throws(() => mergeState(state, input, actor), { status: 400, message: 'Type de problème obligatoire : choisissez un type ou précisez le problème.' });
  }
  assert.ok(state.remontees.every((r) => typeof r.probleme === 'string' && r.probleme.trim()), 'jeu de départ : chaque remontée a un type');
});


test('problème libre : casse française, accents composés, apostrophes et traits d’union', () => {
  for (const input of ['éCRAN D’ACCUEIL', 'e\u0301CRAN D’ACCUEIL', 'ÉCRAN\u00a0D’ACCUEIL']) {
    assert.deepEqual(normalizeProblemLabel(input), { value: 'Écran d’accueil', invalid: false });
  }
  assert.deepEqual(normalizeProblemLabel("œIL D'ÉCRAN À-COUPS"), { value: "Œil d'écran à-coups", invalid: false });
  assert.deepEqual(normalizeProblemLabel('  surCHAUFFE#42!'), { value: 'Surchauffe42', invalid: true });
  assert.deepEqual(normalizeProblemLabel('Bruit '), { value: 'Bruit ', invalid: false });
  assert.deepEqual(normalizeProblemLabel('- éCRAN'), { value: 'Écran', invalid: true });
  assert.deepEqual(normalizeProblemLabel('---'), { value: '', invalid: true });
  assert.deepEqual(normalizeProblemLabel('eRREUR 404'), { value: 'Erreur 404', invalid: false });
  assert.deepEqual(normalizeProblemLabel('404 erreur'), { value: 'Erreur', invalid: true });
});

test('problème libre : une API directe ne peut enregistrer les caractères interdits', () => {
  const state = initialState();
  const actor = actorOf(state, TEACHER)!;
  for (const invalid of ['Bruit #', '404 bruit', 'Bruit🙂', 'Bruit\n', '<script>', '---', '- écran']) {
    const input: Ecriture = scopedState(state, actor);
    const mat = input.materiels.find((m) => m.salleId)!;
    input.remontees.unshift({ id: 'tmp-other', ecoleId: mat.ecoleId, materielIds: [mat.id], probleme: invalid, description: 'Un bruit continu.' });
    assert.throws(() => mergeState(state, input, actor), { status: 400, message: `Type de problème invalide. ${PROBLEM_LABEL_HELP}` });
  }
});

test('problème libre : traiter une ancienne remontée conserve son libellé historique', () => {
  const state = initialState();
  const old = state.remontees.find((r) => r.ecoleId === 'e-num' && r.statut === 'attente')!;
  old.probleme = 'Bruit USB #12';
  const actor = actorOf(state, 'cpt-num-gestionnaire')!;
  const input: Ecriture = scopedState(state, actor);
  input.remontees.find((r) => r.id === old.id)!.statut = 'encours';
  const saved = mergeState(state, input, actor);
  assert.equal(saved.remontees.find((r) => r.id === old.id)!.probleme, 'Bruit USB #12');
});


test('problème libre : les chiffres sont autorisés après une initiale en lettre', () => {
  const state = initialState();
  const actor = actorOf(state, TEACHER)!;
  const input: Ecriture = scopedState(state, actor);
  const mat = input.materiels.find((m) => m.salleId)!;
  input.remontees.unshift({ id: 'tmp-other', ecoleId: mat.ecoleId, materielIds: [mat.id], probleme: 'eRREUR 404', description: 'La page affiche une erreur.' });
  const saved = mergeState(state, input, actor);
  assert.equal(saved.remontees.find((r) => r.description === 'La page affiche une erreur.')!.probleme, 'Erreur 404');
});
