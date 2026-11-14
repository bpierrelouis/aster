import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import { createWorkspaceRepository } from '../workspace/engine.ts';
import { createRigelRouter } from '../workspace/routes.ts';
import { createRelais } from './relais.ts';
import { createMemoryStore } from './relais-store.ts';
import { createConnecteur } from './connecteur.ts';
import { chiffrer, dechiffrer, lireAppairage } from '#shared/rigel.ts';
import type { EvenementRigel, InstantaneRigel } from '#shared/rigel.ts';

const SECRET = 'secret-rigel-de-test', TOKEN = 'jeton-relais-de-test';

async function ecouter(app: express.Express) {
  const server: Server = app.listen(0, '127.0.0.1');
  await new Promise<void>((resolve) => server.once('listening', resolve));
  return { server, url: `http://127.0.0.1:${(server.address() as AddressInfo).port}` };
}

test('connecteur : publication, constat d’un téléphone intégré par ORION, acquittement, installation close retirée', async () => {
  const repository = await createWorkspaceRepository();
  const orion = await ecouter(express().use('/api/rigel', createRigelRouter({ repository, secret: SECRET })));
  const store = createMemoryStore();
  const relais = await ecouter(createRelais({ store, token: TOKEN, dist: 'absent' }));
  try {
    // Installation d'une salle lancée dans ORION par le gestionnaire, depuis ses déplacements
    const gestionnaire = (await repository.actor('cpt-num-gestionnaire'))!;
    const prevu = (await repository.snapshot()).materiels.find((x) => x.ecoleId === 'e-num' && x.deplacement && x.salleId)!;
    const lancee = await repository.rigel.installation(gestionnaire, prevu.salleId!, { secret: SECRET, url: 'https://rigel.test' });
    const campagne = { id: lancee.id };
    const connecteur = createConnecteur({ orion: orion.url, secret: SECRET, relais: relais.url, token: TOKEN });
    assert.equal(await connecteur.cycle(), 0);
    assert.equal((await store.campagnes()).length, 1);

    // Téléphone appairé : lit l'instantané sur le relais, constate un matériel en cours d'installation dans sa salle
    const acces = lireAppairage(lancee.url)!;
    const telephone = { Authorization: `Bearer ${acces.jeton}`, 'Content-Type': 'application/json' };
    const { instantane } = await (await fetch(`${relais.url}/api/campagnes/${campagne.id}/instantane`, { headers: telephone })).json();
    const inst = await dechiffrer<InstantaneRigel>(acces.cle, campagne.id, instantane);
    const m = inst.materiels.find((x) => x.id === prevu.id)!;
    const e: EvenementRigel = { id: crypto.randomUUID(), type: 'vu', code: m.idOrion, salleId: m.salleId, materielId: m.id, observeLe: Date.now() };
    const envoi = await fetch(`${relais.url}/api/campagnes/${campagne.id}/evenements`, { method: 'POST', headers: telephone, body: JSON.stringify({ evenements: [{ id: e.id, bloc: await chiffrer(acces.cle, campagne.id, e) }] }) });
    assert.equal(envoi.status, 200);

    assert.equal(await connecteur.cycle(), 1);
    const apres = (await repository.snapshot()).materiels.find((x) => x.id === m.id)!;
    assert.equal(apres.deplacement, undefined, 'déplacement confirmé dans ORION');
    assert.deepEqual(await store.evenements(campagne.id, 10), [], 'événement acquitté sur le relais');
    assert.equal(await connecteur.cycle(), 0);
    const { instantane: nouveau } = await (await fetch(`${relais.url}/api/campagnes/${campagne.id}/instantane`, { headers: telephone })).json();
    assert.equal((await dechiffrer<InstantaneRigel>(acces.cle, campagne.id, nouveau)).constats[0].resultat, 'confirme', 'nouvel instantané publié');

    // Derniers déplacements de la salle confirmés dans ORION : l'installation se clôt et disparaît du relais
    const vue2 = await repository.read(gestionnaire);
    for (const x of vue2.materiels) if (x.deplacement && (x.salleId === prevu.salleId || x.deplacement.de === prevu.salleId)) delete x.deplacement;
    await repository.update(vue2, vue2.revision, gestionnaire);
    assert.equal((await repository.snapshot()).recensements.find((r) => r.id === campagne.id)!.close?.parId, gestionnaire.id);
    await connecteur.cycle();
    assert.deepEqual(await store.campagnes(), []);
  } finally { orion.server.close(); relais.server.close(); }
});

test('connecteur : une erreur du relais interrompt le cycle sans rien acquitter', async () => {
  const repository = await createWorkspaceRepository();
  const orion = await ecouter(express().use('/api/rigel', createRigelRouter({ repository, secret: SECRET })));
  const relais = await ecouter(createRelais({ store: createMemoryStore(), token: TOKEN, dist: 'absent' }));
  try {
    await assert.rejects(createConnecteur({ orion: orion.url, secret: SECRET, relais: relais.url, token: 'mauvais' }).cycle(), /401/);
    await assert.rejects(createConnecteur({ orion: orion.url, secret: 'mauvais', relais: relais.url, token: TOKEN }).cycle(), /401/);
  } finally { orion.server.close(); relais.server.close(); }
});
