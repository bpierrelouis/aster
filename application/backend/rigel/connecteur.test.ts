import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import { createWorkspaceRepository } from '../persistance/engine.ts';
import { createRigelRouter } from '../api/routes.ts';
import { etatDemonstration } from '../../outils/donnees-demonstration/charger.ts';
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
  const repository = await createWorkspaceRepository({ initialState: etatDemonstration() });
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
  const repository = await createWorkspaceRepository({ initialState: etatDemonstration() });
  const orion = await ecouter(express().use('/api/rigel', createRigelRouter({ repository, secret: SECRET })));
  const relais = await ecouter(createRelais({ store: createMemoryStore(), token: TOKEN, dist: 'absent' }));
  try {
    await assert.rejects(createConnecteur({ orion: orion.url, secret: SECRET, relais: relais.url, token: 'mauvais' }).cycle(), /401/);
    await assert.rejects(createConnecteur({ orion: orion.url, secret: 'mauvais', relais: relais.url, token: TOKEN }).cycle(), /401/);
  } finally { orion.server.close(); relais.server.close(); }
});

test('connecteur : une opération en erreur n’empêche pas d’intégrer les constats des autres', async () => {
  const bloc = { iv: 'iv', data: 'data' };
  const acquittees: string[] = [];
  // ORION et relais simulés : deux opérations ouvertes, ORION refuse l'envoi de la première (rec-a)
  const http = (async (url: string, init?: RequestInit) => {
    const { pathname } = new URL(url);
    const json = (status: number, body: unknown) => new Response(status === 204 ? null : JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
    if (pathname === '/api/rigel/campagnes') return json(200, { campagnes: ['rec-a', 'rec-b'].map((id) => ({ id, version: 'v1', expireLe: Date.now() + 60_000, empreinte: '0'.repeat(64), instantane: bloc })) });
    if (pathname === '/api/connecteur/campagnes') return json(200, { campagnes: ['rec-a', 'rec-b'].map((id) => ({ id, version: 'v1' })) });
    const [, , , , id, action] = pathname.split('/');
    if (pathname.startsWith('/api/connecteur/') && action === 'evenements') return json(200, { evenements: [{ rang: 1, id: `evenement-${id}`, bloc }] });
    if (pathname.startsWith('/api/rigel/') && action === 'evenements') return id === 'rec-a' ? json(413, { error: 'Trop gros' }) : json(200, { resultats: [{ id: `evenement-${id}`, statut: 'applique' }] });
    if (action === 'acquittement' && init?.method === 'POST') { acquittees.push(id); return json(204, null); }
    return json(404, { error: 'inconnu' });
  }) as typeof fetch;
  const connecteur = createConnecteur({ orion: 'http://orion.test', secret: SECRET, relais: 'http://relais.test', token: TOKEN, fetch: http });
  assert.equal(await connecteur.cycle(), 1);
  assert.deepEqual(acquittees, ['rec-b'], 'seule l’opération intégrée est acquittée');
});
