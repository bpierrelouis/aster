import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { inflateSync } from 'node:zlib';
import { createWorkspaceRepository } from './engine.ts';
import { actorOf, initialState, mergeState, scopedState } from './rules.ts';
import { problem } from '#shared/catalog.ts';
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
    input.remontees.unshift({ id: 'tmp-other', ecoleId: mat.ecoleId, materielIds: [mat.id], probleme: '  Bruit inhabituel  ', description: 'Le ventilateur fait un bruit continu.' });
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
  for (const invalid of ['', '   ', 'x'.repeat(101), 42, { label: 'Bruit' }]) {
    const input: Ecriture = scopedState(state, actor);
    const mat = input.materiels.find((m) => m.salleId)!;
    input.remontees.unshift({ id: 'tmp-other', ecoleId: mat.ecoleId, materielIds: [mat.id], probleme: invalid as string, description: 'Un bruit continu.' });
    assert.throws(() => mergeState(state, input, actor), { status: 400, message: 'Type de problème invalide.' });
  }
});
