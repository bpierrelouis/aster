import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { mkdtemp, rm, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import type { AddressInfo } from 'node:net';
import { initialState, actorOf, accountForIdentity, scopedState, mergeState } from './rules.ts';
import { rebase } from './fusion.ts';
import { applyReports, pendingCommands, applyResults, markDisconnected, DISCONNECT_AFTER } from './postes.ts';
import { createWorkspaceRepository } from './engine.ts';
import { analyseImport, importMateriels } from './import.ts';
import { createWorkspaceRouter, createAgentRouter } from './routes.ts';
import { renameBuilding } from '#shared/buildings.ts';
import { remonteeOuverte } from '#shared/catalog.ts';
import { processClass, logiciel, IMAGE_REFERENCE } from '#shared/operations-data.ts';
import type { Compte, EtapeRemontee, Id, Item, Materiel, Mouvement, RemonteeStatut, WorkspaceState, WorkspaceView } from '#shared/types.ts';
import type { JournalEntry } from './engine.ts';
import type { Ecriture, HttpError, LooseItem } from './rules.ts';

/** Matériel dont le numéro de série est renseigné */
type AvecSerie = Materiel & { serie: string };

const as = (state: WorkspaceState, accountId: Id) => actorOf(state, accountId)!;
const ADMIN = 'cpt-num-admin', MANAGER = 'cpt-num-gestionnaire', TEACHER = 'cpt-num-formateur', SUPER = 'cpt-superadmin';
const online = (state: WorkspaceState) => { applyReports(state, state.postes.filter((p) => p.salleId === 's-e-num-a012').map((p) => ({ poste: p.nomReseau, processus: [{ nom: 'firefox.exe', compte: 'stagiaire.01' }], applications: ['app-firefox'] }))); return state; };

test('identité : rapprochement par sujet puis adresse, compte désactivé sans accès', () => {
  const state = initialState();
  assert.equal(accountForIdentity(state, { sub: 'kc-1', email: 'Formateur@orion.demo' })?.id, TEACHER);
  state.comptes.find((c) => c.id === TEACHER)!.sujet = 'kc-1';
  assert.equal(accountForIdentity(state, { sub: 'kc-1', email: 'autre@orion.demo' })?.id, TEACHER);
  assert.equal(accountForIdentity(state, { sub: 'kc-2', email: 'formateur@orion.demo' }), null, 'adresse déjà reliée à une autre identité');
  assert.equal(accountForIdentity(state, { sub: 'kc-3', email: 'inconnu@orion.demo' }), null);
  state.comptes.find((c) => c.id === TEACHER)!.actif = false;
  assert.equal(actorOf(state, TEACHER), null);
});

test('visibilité : école, auteur des remontées, comptes et données de supervision', () => {
  const state = online(initialState());
  state.comptes[0].sujet = 'secret';
  const teacher = scopedState(state, as(state, TEACHER));
  assert.equal(teacher.moi.nom, 'L. Martin');
  assert(teacher.materiels.every((m) => m.ecoleId === 'e-num'));
  assert(teacher.remontees.length && teacher.remontees.every((r) => r.auteurId === TEACHER));
  assert.equal(teacher.comptes.length, 0);
  assert(teacher.processus.length > 0);
  const manager = scopedState(state, as(state, MANAGER));
  assert.equal(manager.postes.length, 0);
  assert.equal(manager.processus.length, 0);
  const sup = scopedState(state, as(state, SUPER));
  assert(sup.comptes.every((c) => !('sujet' in c)), 'le sujet ne quitte pas le serveur');
  assert.equal(sup.ecoleId, 'e-num');
});

test('remontée : auteur, date, numéro et historique imposés par le serveur', () => {
  const state = initialState();
  const teacher = as(state, TEACHER);
  const input: Ecriture = scopedState(state, teacher);
  const mat = input.materiels.find((m) => m.salleId)!;
  input.remontees.unshift({ id: 'tmp', ecoleId: 'e-num', auteur: 'Quelqu’un d’autre', auteurId: ADMIN, createdAt: 1, materielIds: [mat.id], probleme: 'display', description: 'Écran noir', statut: 'corrige', historique: [] });
  const next = mergeState(state, input, teacher, 1_800_000_000_000);
  const created = next.remontees.find((r) => r.description === 'Écran noir')!;
  assert.match(created.id, /^REM-\d{4}$/);
  assert.deepEqual([created.auteur, created.auteurId, created.createdAt, created.statut], ['L. Martin', TEACHER, 1_800_000_000_000, 'attente']);
  assert.equal(created.historique.length, 1);

  const manager = as(next, MANAGER);
  const m = scopedState(next, manager);
  const r = m.remontees.find((x) => x.id === created.id)!;
  r.statut = 'validee' as RemonteeStatut; // valeur invalide volontaire
  assert.throws(() => mergeState(next, m, manager), { status: 400 }); // la validation par l'auteur n'existe plus
  r.statut = 'corrige'; // le gestionnaire remplace ou corrige
  r.historique.push({ statut: 'corrige', at: 1, par: 'Faux' } as EtapeRemontee); // entrée incomplète volontaire
  const treated = mergeState(next, m, manager).remontees.find((x) => x.id === created.id)!;
  assert.deepEqual([treated.statut, treated.historique.at(-1)!.par], ['corrige', 'G. Bernard']);
  r.description = 'Texte remplacé';
  assert.throws(() => mergeState(next, m, manager), { status: 400 });
});

test('remontée : prise en charge puis traitement, qui la termine', () => {
  let state = initialState();
  const teacher = as(state, TEACHER);
  const input: Ecriture = scopedState(state, teacher);
  const mat = input.materiels.find((m) => m.salleId)!;
  input.remontees.unshift({ id: 'tmp', ecoleId: 'e-num', materielIds: [mat.id], probleme: 'display', description: 'Projecteur muet', historique: [] });
  state = mergeState(state, input, teacher);
  const id = state.remontees.find((r) => r.description === 'Projecteur muet')!.id;
  const move = (accountId: Id, statut: RemonteeStatut) => {
    const actor = as(state, accountId);
    const view = scopedState(state, actor);
    view.remontees.find((r) => r.id === id)!.statut = statut;
    return mergeState(state, view, actor);
  };
  assert.throws(() => move(TEACHER, 'encours'), { status: 403 });   // le formateur ne traite pas
  state = move(MANAGER, 'encours');
  assert.throws(() => move(MANAGER, 'attente'), { status: 400 });   // pas de retour en arrière
  state = move(MANAGER, 'remplace');
  const done = state.remontees.find((r) => r.id === id)!;
  assert.deepEqual(done.historique.map((h) => [h.statut, h.parId]), [['attente', TEACHER], ['encours', MANAGER], ['remplace', MANAGER]]);
  assert.throws(() => move(MANAGER, 'corrige'), { status: 400 });   // une remontée terminée ne change plus
  assert.throws(() => move(TEACHER, 'validee' as RemonteeStatut), { status: 403 }); // valeur invalide volontaire
});

test('données de départ : stock récent ; le lot d’import de démonstration ajoute un matériel déjà présent et un d’une autre école', async () => {
  const state = initialState();
  const lot: { modele: string; serie: string }[] = JSON.parse(await readFile(new URL('../../tests/fixtures/import-stock-salle.json', import.meta.url), 'utf8'));
  const modeles = new Set(state.materiels.map((m) => m.modele));
  const bySerie = new Map(state.materiels.filter((m) => m.serie).map((m) => [m.serie, m]));
  const open = new Set(state.remontees.filter(remonteeOuverte).flatMap((r) => r.materielIds));
  const connus = lot.filter((m) => bySerie.has(m.serie)).map((m) => bySerie.get(m.serie)!);
  assert.deepEqual(connus.map((m) => m.ecoleId).sort(), ['e-num', 'e-res']); // non traité / à transférer depuis l'école des réseaux
  assert.ok(connus.every((m) => !open.has(m.id)), 'transfert possible : aucune remontée en cours');
  assert.deepEqual(lot.filter((m) => !bySerie.has(m.serie) && modeles.has(m.modele)), []); // les autres : modèles inédits
  assert.equal(new Set(lot.map((m) => m.serie).filter(Boolean)).size, lot.filter((m) => m.serie).length); // numéros uniques
  // Stock pour équiper une salle : reçu ces dernières semaines, aucune garantie échue
  const recent = state.materiels.filter((m) => m.ecoleId === 'e-num' && (!m.salleId || m.deplacement || m.installation) && Date.now() - m.dateReception < 22 * 864e5); // en stock, en cours d'installation ou installé
  assert.ok(recent.length >= 140);
  assert.ok(recent.every((m) => !m.garantieFin || m.garantieFin > Date.now()));
});

test('installation : une affectation reste en cours jusqu’à la confirmation, qui devient l’installation', () => {
  let state = initialState();
  const move = (accountId: Id, mutate: (view: WorkspaceView) => void) => {
    const actor = as(state, accountId);
    const view = scopedState(state, actor);
    mutate(view);
    return mergeState(state, view, actor, 1_800_000_000_000);
  };
  const stock = state.materiels.find((m) => m.ecoleId === 'e-num' && !m.salleId && !m.deplacement)!;
  const [a, b] = state.salles.filter((s) => s.ecoleId === 'e-num');
  const mat = (s: { materiels: Materiel[] }) => s.materiels.find((m) => m.id === stock.id)!;
  state = move(MANAGER, (v) => { mat(v).salleId = a.id; });
  assert.deepEqual(mat(state).deplacement, { de: null, at: 1_800_000_000_000, par: 'G. Bernard', parId: MANAGER });
  state = move(MANAGER, (v) => { mat(v).salleId = b.id; });            // pas encore déplacé : l'origine reste le stock
  assert.equal(mat(state).deplacement!.de, null);
  assert.throws(() => move(MANAGER, (v) => { mat(v).deplacement!.de = a.id; }), { status: 400 }); // tenu par le serveur
  assert.throws(() => move(TEACHER, (v) => { delete mat(v).deplacement; }), { status: 403 });
  state = move(MANAGER, (v) => { delete mat(v).deplacement; mat(v).installation = { de: a.id, at: 0, par: 'X' } as Mouvement; }); // confirmé ; valeur incomplète volontaire
  assert.equal(mat(state).deplacement, undefined);
  assert.deepEqual(mat(state).installation, { de: null, at: 1_800_000_000_000, par: 'G. Bernard', parId: MANAGER }); // valeur du serveur
  state = move(MANAGER, (v) => { mat(v).hs = true; delete mat(v).installation; }); // autre modification : installation conservée
  assert.equal(mat(state).installation!.de, null);
  assert.throws(() => move(MANAGER, (v) => { mat(v).salleId = a.id; }), { status: 400 }); // hors service : au stock seulement
  state = move(MANAGER, (v) => { mat(v).salleId = null; });             // retour au stock : à déplacer depuis la salle b
  assert.equal(mat(state).deplacement!.de, b.id);
  assert.equal(mat(state).installation, undefined);
  state = move(MANAGER, (v) => { mat(v).hs = false; mat(v).salleId = b.id; }); // remis en service et revenu à son emplacement physique : rien à faire
  assert.equal(mat(state).deplacement, undefined);
});

test('import : seuls les nouveaux matériels et les transferts validés sont traités', () => {
  const state = initialState();
  const manager = as(state, MANAGER);
  const open = new Set(state.remontees.filter(remonteeOuverte).flatMap((r) => r.materielIds));
  const ici = state.materiels.find((m) => m.ecoleId === 'e-num' && m.serie) as AvecSerie;
  const [ailleurs, autre, cite] = [
    ...state.materiels.filter((m) => m.ecoleId === 'e-res' && m.serie && !open.has(m.id)).slice(0, 2),
    state.materiels.find((m) => m.ecoleId === 'e-res' && m.serie && open.has(m.id)),
  ] as [AvecSerie, AvecSerie, AvecSerie | undefined];
  const row = (serie: string, modele = 'Écran importé') => ({ modele, type: 'ecran', dateReception: 1_790_000_000_000, hs: false, serie });
  const analyse = analyseImport(state, manager, { ecoleId: 'e-num', series: [ici.serie, ailleurs.serie.toUpperCase(), 'INCONNU-1'] });
  assert.equal(analyse[ici.serie.toLowerCase()].ecoleId, 'e-num');
  assert.equal(analyse[ailleurs.serie.toLowerCase()].ecole, 'École des réseaux');
  assert.equal(analyse['inconnu-1'], undefined);
  if (cite) assert.ok(analyseImport(state, manager, { ecoleId: 'e-num', series: [cite.serie] })[cite.serie.toLowerCase()].bloque);
  const rows = [row('NOUVEAU-1'), row('nouveau-1 '), row(ici.serie), row(ailleurs.serie), row(autre.serie), ...(cite ? [row(cite.serie)] : [])];
  const { next, bilan } = importMateriels(state, manager, { ecoleId: 'e-num', materiels: rows, transferts: [ailleurs.serie, ...(cite ? [cite.serie] : [])] }, 1_800_000_000_000);
  assert.deepEqual(bilan, { ajoutes: 1, transferes: 1, ignores: cite ? 4 : 3 }); // répété, déjà présent, transfert non validé, remontée en cours
  const cree = next.materiels.find((m) => m.serie === 'NOUVEAU-1')!;
  assert.ok(cree.idOrion.startsWith('MAT-') && cree.ecoleId === 'e-num' && !cree.deplacement);
  const transfere = next.materiels.find((m) => m.id === ailleurs.id)!;
  assert.deepEqual([transfere.ecoleId, transfere.salleId, transfere.idOrion], ['e-num', null, ailleurs.idOrion]); // identifiant conservé, en stock
  assert.equal(next.materiels.find((m) => m.id === autre.id)!.ecoleId, 'e-res');
  assert.equal(next.materiels.length, state.materiels.length + 1);
  assert.throws(() => importMateriels(state, as(state, TEACHER), { ecoleId: 'e-num', materiels: rows }), { status: 403 });
  assert.throws(() => importMateriels(state, manager, { ecoleId: 'e-res', materiels: rows }), { status: 400 }); // école d'un autre
  assert.throws(() => importMateriels(state, manager, { ecoleId: 'e-num', materiels: [row(ici.serie)] }), { status: 400 }); // rien de nouveau
});

test('parc : gestionnaire sans suppression ni autre école ; identifiant ORION attribué', () => {
  const state = initialState();
  const manager = as(state, MANAGER);
  const input = scopedState(state, manager);
  input.materiels[0].modele = 'Nouveau modèle';
  input.materiels.push({ id: 'm-new', ecoleId: 'e-num', idOrion: 'MAT-0001', type: 'autre', modele: 'Onduleur', marque: null, serie: null, dateReception: Date.now(), hs: false, salleId: null, garantieFin: null });
  const next = mergeState(state, input, manager);
  assert.equal(next.materiels.find((x) => x.id === input.materiels[0].id)!.modele, 'Nouveau modèle');
  assert.notEqual(next.materiels.find((x) => x.id === 'm-new')!.idOrion, 'MAT-0001');
  const deleting = scopedState(state, manager); deleting.materiels.shift();
  assert.throws(() => mergeState(state, deleting, manager), { status: 403 });
  const admin = as(state, ADMIN);
  const crossed = scopedState(state, admin);
  crossed.materiels[0].salleId = state.salles.find((s) => s.ecoleId === 'e-res')!.id;
  assert.throws(() => mergeState(state, crossed, admin), { status: 400 });
});

test('parc : un matériel cité par une remontée est conservé (RG-73)', () => {
  const state = initialState();
  const admin = as(state, ADMIN);
  const input = scopedState(state, admin);
  const cited = input.remontees[0].materielIds[0];
  input.materiels = input.materiels.filter((m) => m.id !== cited);
  assert.throws(() => mergeState(state, input, admin), { status: 400 });
});

test('sécurité : poste cloisonné à son école, nom réseau unique ; sujet et image fixés par le serveur', () => {
  const state = initialState();
  const admin = as(state, ADMIN);
  const ailleurs = state.postes.find((p) => state.salles.find((s) => s.id === p.salleId)!.ecoleId === 'e-res')!;
  const nouveau = (salleId: Id, nomReseau: string, extra = {}) => ({ id: `p-${nomReseau}`, salleId, nomReseau, materielId: null, allume: false, ...extra });
  const homonyme: Ecriture = scopedState(state, admin);
  homonyme.postes.push(nouveau('s-e-num-a012', ailleurs.nomReseau.toLowerCase()));
  assert.throws(() => mergeState(state, homonyme, admin), { status: 400 }, 'nom réseau d’un poste d’une autre école');
  const intrus: Ecriture = scopedState(state, admin);
  intrus.postes.push(nouveau(ailleurs.salleId, 'NOUVEAU-PC01', { ecoleId: 'e-num' }));
  assert.throws(() => mergeState(state, intrus, admin), { status: 403 }, 'salle d’une autre école, école déclarée trompeuse');
  const forge: Ecriture = scopedState(state, admin);
  forge.comptes.find((c) => c.id === TEACHER)!.sujet = 'kc-autre';
  forge.operations.push({ id: 'op-x', type: 'reinstallation', salleId: 's-e-num-a012', image: 'smb://hote-inconnu/image.wim' });
  const next = mergeState(state, forge, admin);
  assert.equal(next.comptes.find((c) => c.id === TEACHER)!.sujet, undefined, 'lien d’identité non fixé par le navigateur');
  assert.equal(next.operations.at(-1)!.image, IMAGE_REFERENCE, 'image de référence imposée');
});

test('bâtiments : un administrateur renomme un bâtiment ; salles, étages et règles suivent', () => {
  const state = initialState();
  state.regles.push({ id: 'rule-bat', nom: 'jeu.exe', classement: 'blacklist', portee: 'batiment', ecoleId: 'e-num', batiment: 'C' });
  const admin = as(state, ADMIN);
  const input = scopedState(state, admin);
  renameBuilding(input, { ecoleId: 'e-num', batiment: 'C' }, ' sud ');
  const next = mergeState(state, input, admin);
  const school = <T extends { ecoleId: Id }>(list: T[]) => list.filter((x) => x.ecoleId === 'e-num');
  assert(!school(next.salles).some((s) => s.batiment === 'C') && !school(next.etages).some((e) => e.batiment === 'C'));
  assert.equal(school(next.salles).filter((s) => s.batiment === 'SUD').length, school(state.salles).filter((s) => s.batiment === 'C').length);
  assert.equal(next.regles.find((r) => r.id === 'rule-bat')!.batiment, 'SUD');
  assert.equal(processClass(next, { nom: 'jeu.exe', salleId: next.salles.find((s) => s.batiment === 'SUD')!.id }), 'blacklist', 'la règle suit le bâtiment');
  assert.throws(() => renameBuilding(scopedState(next, admin), { ecoleId: 'e-num', batiment: 'SUD' }, 'a'), /existe déjà/, 'deux bâtiments ne fusionnent pas');
  const teacher = as(state, TEACHER);
  const attempt = scopedState(state, teacher);
  renameBuilding(attempt, { ecoleId: 'e-num', batiment: 'C' }, 'SUD');
  assert.throws(() => mergeState(state, attempt, teacher), { status: 403 });
});

test('préférences : ambiance, tonalité et verre reconnus, valeur inconnue remplacée par le défaut', () => {
  const state = initialState();
  const admin = as(state, ADMIN);
  const input: Ecriture = scopedState(state, admin);
  input.prefs = { ambiance: 'minarm', tone: 'dark', glass: 'solid', accent: 'violet' }; // sombre forcé
  let next = mergeState(state, input, admin);
  assert.deepEqual(scopedState(next, admin).prefs, { ambiance: 'minarm', tone: 'dark', glass: 'solid', accent: 'violet' });
  input.prefs = { ambiance: 'brume', tone: 'nuit', glass: 'frost', accent: 'inconnue' }; // anciennes valeurs, tonalité inconnue
  next = mergeState(state, input, admin);
  assert.deepEqual(scopedState(next, admin).prefs, { ambiance: 'orion', tone: 'auto', glass: 'liquid', accent: 'blue' });
  input.prefs = { ambiance: 'encre', glass: 'solid' }; // Aube et Encre réunies dans ORION (11 novembre)
  next = mergeState(state, input, admin);
  assert.equal(scopedState(next, admin).prefs.ambiance, 'orion');
  input.prefs = { ambiance: 'etat', glass: 'solid' }; // État renommée Minarm
  next = mergeState(state, input, admin);
  assert.equal(scopedState(next, admin).prefs.ambiance, 'minarm');
});

test('comptes : création dans son école, adresse unique, pas d’auto-désactivation, sujet conservé', () => {
  const state = initialState();
  state.comptes.find((c) => c.id === TEACHER)!.sujet = 'kc-teacher';
  const admin = as(state, ADMIN);
  const input = scopedState(state, admin);
  input.comptes.push({ id: 'cpt-new', nom: 'P. Nouveau', email: 'P.Nouveau@Orion.Demo', role: 'formateur', ecoleId: 'e-num', actif: true });
  input.comptes.find((c) => c.id === TEACHER)!.nom = 'L. Martin-Durand';
  const next = mergeState(state, input, admin);
  assert.equal(next.comptes.find((c) => c.id === 'cpt-new')!.email, 'p.nouveau@orion.demo');
  assert.equal(next.comptes.find((c) => c.id === TEACHER)!.sujet, 'kc-teacher');
  for (const bad of [
    { id: 'x1', nom: 'X', email: 'admin@orion.demo', role: 'formateur', ecoleId: 'e-num', actif: true },
    { id: 'x2', nom: 'X', email: 'x2@orion.demo', role: 'superadmin', ecoleId: null, actif: true },
    { id: 'x3', nom: 'X', email: 'x3@orion.demo', role: 'formateur', ecoleId: 'e-res', actif: true },
  ] satisfies Compte[]) {
    const attempt = scopedState(state, admin); attempt.comptes.push(bad);
    assert.throws(() => mergeState(state, attempt, admin), (e: HttpError) => [400, 403].includes(e.status!));
  }
  const self = scopedState(state, admin); self.comptes.find((c) => c.id === ADMIN)!.actif = false;
  assert.throws(() => mergeState(state, self, admin), { status: 400 });
  const removed = scopedState(state, admin); removed.comptes.pop();
  assert.throws(() => mergeState(state, removed, admin), { status: 403 });
});

test('supervision : le formateur demande un arrêt ; seuls les postes modifient les processus', () => {
  const state = online(initialState());
  const teacher = as(state, TEACHER);
  const proc = state.processus[0];
  const direct = scopedState(state, teacher); direct.processus.find((p) => p.id === proc.id)!.stoppedAt = Date.now();
  assert.throws(() => mergeState(state, direct, teacher), { status: 403 });
  const install: Ecriture = scopedState(state, teacher); install.operations.push({ id: 'x', type: 'installation', cibles: [proc.posteId], applicationId: 'app-putty' });
  assert.throws(() => mergeState(state, install, teacher), { status: 400 });
  const request: Ecriture = scopedState(state, teacher); request.operations.push({ id: 'x', type: 'arret', cibles: [proc.posteId], processusId: proc.id, statut: 'terminee' });
  const next = mergeState(state, request, teacher);
  const op = next.operations.find((o) => o.processusId === proc.id)!;
  assert.deepEqual([op.statut, op.par, op.resultats[proc.posteId]], ['enregistree', 'L. Martin', 'en_attente']);
  const again: Ecriture = scopedState(next, teacher); again.operations.push({ id: 'y', type: 'arret', cibles: [proc.posteId], processusId: proc.id });
  assert.throws(() => mergeState(next, again, teacher), { status: 400 });
  assert.equal(next.processus.find((p) => p.id === proc.id)!.stoppedAt, null, 'le processus reste actif jusqu’au résultat du poste');
});

test('interventions : une salle entière, dont le serveur fixe les postes, ou des postes d’une même salle', () => {
  const state = initialState();
  assert.deepEqual(state.operations.map((o) => [o.type, o.statut]), [['desinstallation', 'enregistree'], ['reinstallation', 'enregistree'], ['installation', 'enregistree'], ['installation', 'enregistree']], 'simulation : quatre interventions enregistrées');
  const admin = as(state, ADMIN);
  const salle = 's-e-num-a012';
  const postes = state.postes.filter((p) => p.salleId === salle).map((p) => p.id);
  const ask = (op: Partial<LooseItem>) => { const view: Ecriture = scopedState(state, admin); view.operations.push({ id: 'tmp', ...op }); return mergeState(state, view, admin).operations.at(-1)!; };
  const room = ask({ type: 'installation', applicationId: 'app-putty', salleId: salle, cibles: [postes[0]] });
  assert.deepEqual([room.salleId, room.cibles, room.statut], [salle, postes, 'enregistree']);
  assert.deepEqual(Object.values(room.resultats), postes.map(() => 'en_attente'));
  const some = ask({ type: 'reinstallation', cibles: postes.slice(0, 2), image: 'Windows' });
  assert.deepEqual([some.salleId, some.cibles], [undefined, postes.slice(0, 2)]);
  const ailleurs = state.postes.find((p) => p.salleId !== salle && p.salleId.startsWith('s-e-num-'))!.id;
  assert.throws(() => ask({ type: 'reinstallation', cibles: [postes[0], ailleurs] }), { status: 400 }); // une seule salle
  assert.throws(() => ask({ type: 'reinstallation', cibles: [] })); // aucun poste : refusée
  assert.throws(() => ask({ type: 'reinstallation', salleId: 's-inconnue', cibles: [] }), { status: 403 });
});

test('postes : un poste dont l’unité centrale est hors service reste éteint ; allumé, il peut avoir une session', () => {
  let state = initialState();
  const [hs, ok] = ['A014-PC02', 'A014-PC01'].map((nom) => state.postes.find((p) => p.nomReseau === nom)!);
  applyReports(state, [{ poste: hs.nomReseau, session: 'camille.durand' }, { poste: ok.nomReseau, session: 'lucas.bernard' }]);
  assert.deepEqual([hs.allume, ok.allume, ok.session], [false, true, 'lucas.bernard']);
  applyReports(state, [{ poste: ok.nomReseau }]);
  assert.deepEqual([ok.allume, ok.session], [true, null], 'allumé sans session');
  // Unité centrale déclarée hors service : le poste s'éteint
  const manager = as(state, MANAGER);
  const view = scopedState(state, manager);
  view.materiels.find((m) => m.id === ok.materielId)!.hs = true;
  state = mergeState(state, view, manager);
  assert.equal(state.postes.find((p) => p.id === ok.id)!.allume, false);
  // Même extinction dans une écriture qui modifie aussi un autre poste : l'état d'avant reste intact
  state = initialState();
  applyReports(state, [{ poste: ok.nomReseau }]);
  const admin = as(state, ADMIN);
  const both = scopedState(state, admin);
  both.materiels.find((m) => m.id === ok.materielId)!.hs = true;
  both.postes.find((p) => p.id === hs.id)!.nomReseau = 'A014-PC02B';
  const next = mergeState(state, both, admin);
  assert.deepEqual([state.postes.find((p) => p.id === ok.id)!.allume, next.postes.find((p) => p.id === ok.id)!.allume], [true, false]);
});

test('postes : rapports, détection, arrêt automatique, résultats et déconnexion', () => {
  const state = initialState();
  const poste = state.postes.find((p) => p.salleId === 's-e-num-a012')!;
  const now = 1_800_000_000_000;
  applyReports(state, [{ poste: poste.nomReseau, processus: [{ nom: 'firefox.exe', compte: 'stagiaire.01' }, { nom: 'steam.exe', compte: 'stagiaire.01' }, { nom: 'vlc.exe', compte: 'stagiaire.01' }], applications: ['app-firefox', 'inconnue'] }], now);
  assert(poste.allume);
  assert.equal(state.processus.filter((p) => p.posteId === poste.id).length, 3);
  assert.deepEqual(state.detections.map((d) => [d.processus, d.classement]).sort(), [['steam.exe', 'blacklist'], ['vlc.exe', 'nonref']]);
  const auto = state.operations.find((o) => o.auto)!;
  assert.equal(auto.type, 'arret');
  assert.deepEqual(state.installations.filter((i) => i.posteId === poste.id).map((i) => i.applicationId), ['app-firefox']);
  const commands = pendingCommands(state, [poste.nomReseau]);
  assert.deepEqual(commands.map((c) => [c.type, c.processus!.nom]), [['arret', 'steam.exe']]);
  applyResults(state, [{ operation: auto.id, poste: poste.nomReseau, statut: 'reussie' }], now + 1000);
  assert.equal(auto.statut, 'terminee');
  assert.equal(state.processus.find((p) => p.nom === 'steam.exe')!.stoppedAt, now + 1000);
  assert.equal(state.detections.find((d) => d.processus === 'steam.exe')!.arret, 'réussi');
  // Le processus disparaît du rapport suivant : arrêté ; un poste silencieux est déconnecté
  applyReports(state, [{ poste: poste.nomReseau, processus: [{ nom: 'firefox.exe', compte: 'stagiaire.01' }] }], now + 2000);
  assert(state.processus.find((p) => p.nom === 'vlc.exe')!.stoppedAt);
  markDisconnected(state, now + 2000 + DISCONNECT_AFTER);
  assert.equal(poste.allume, false);
  assert(state.processus.filter((p) => p.posteId === poste.id).every((p) => p.stoppedAt));
});

test('comparaison : l’ordre des propriétés d’un élément relu en base est sans effet', () => {
  const state = initialState();
  const teacher = actorOf(state, TEACHER)!;
  const view = scopedState(state, teacher);
  // Un autre serveur renvoie les mêmes matériels, propriétés dans un autre ordre : aucune modification
  view.materiels = view.materiels.map((m) => Object.fromEntries(Object.entries(m).reverse()) as Materiel);
  assert.doesNotThrow(() => mergeState(state, view, teacher));
});

test('supervision : règles de départ, applications déployables et logiciels connus', () => {
  const state = initialState();
  const classOf = (nom: string) => processClass(state, { nom, salleId: 's-e-num-a012' });
  assert.equal(new Set(state.regles.map((r) => r.id)).size, state.regles.length, 'identifiants de règles uniques');
  assert(state.regles.every((r) => r.portee === 'global' && r.ecoleId === null));
  for (const nom of ['firefox.exe', 'Code.exe', 'idea64.exe', 'python.exe', 'Docker Desktop.exe', 'notepad++.exe', 'soffice.exe']) assert.equal(classOf(nom), 'whitelist', nom);
  for (const nom of ['steam.exe', 'EpicGamesLauncher.exe', 'RobloxPlayerBeta.exe', 'qbittorrent.exe', 'tor.exe', 'AnyDesk.exe']) assert.equal(classOf(nom), 'blacklist', nom);
  assert.equal(classOf('STEAM.EXE'), 'blacklist', 'nom comparé sans la casse');
  assert.equal(classOf('vlc.exe'), 'nonref');
  // Une application déployable est un logiciel connu dont les exécutables sont autorisés
  for (const app of state.applications) {
    const l = logiciel(app.nom);
    assert(l, app.nom);
    assert(l.exe.every((nom) => classOf(nom) === 'whitelist'), app.nom);
  }
  assert.equal(logiciel('libreoffice')!.exe[0], 'soffice.exe');
  assert.equal(logiciel('CODE.EXE')!.nom, 'Visual Studio Code');
  assert.equal(logiciel('inconnu.exe'), undefined);
});

test('écritures concurrentes : fusion élément par élément, conflit seulement sur le même élément', () => {
  const state = online(initialState());
  const admin = as(state, ADMIN);
  const base = scopedState(state, admin);
  const log: JournalEntry[] = [];
  // Un rapport de poste et une modification d'un autre utilisateur interviennent entre-temps
  const after = structuredClone(state);
  applyReports(after, [{ poste: after.postes[0].nomReseau, processus: [] }]);
  after.materiels.find((m) => m.id === base.materiels[1].id)!.modele = 'Modifié ailleurs';
  after.revision = state.revision + 1;
  log.push({ revision: after.revision, before: new Map<string, Item | undefined>([
    ...state.processus.filter((p) => p.posteId === state.postes[0].id).map((p) => [`processus\u0000${p.id}`, p] as const),
    [`postes\u0000${state.postes[0].id}`, state.postes[0]],
    [`materiels\u0000${base.materiels[1].id}`, state.materiels.find((m) => m.id === base.materiels[1].id)],
  ]) });
  const edit = structuredClone(base);
  edit.materiels[0].modele = 'Ma modification';
  const merged = mergeState(after, rebase(after, edit, state.revision, log, admin), admin);
  assert.equal(merged.materiels.find((m) => m.id === base.materiels[0].id)!.modele, 'Ma modification');
  assert.equal(merged.materiels.find((m) => m.id === base.materiels[1].id)!.modele, 'Modifié ailleurs');
  const conflict = structuredClone(base);
  conflict.materiels[1].modele = 'Concurrente';
  assert.throws(() => rebase(after, conflict, state.revision, log, admin), { status: 409 });
  assert.throws(() => rebase(after, edit, state.revision - 5, log, admin), { status: 409 });
});

test('moteur : persistance fichier, révision, rapprochement d’identité et PDF dans le périmètre', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'orion-backend-test-'));
  try {
    const file = join(dir, 'state.json');
    const repo = await createWorkspaceRepository({ file });
    const admin = (await repo.actor(ADMIN))!;
    const input = await repo.read(admin); input.materiels[0].modele = 'Persisté';
    await repo.update(input, 0, admin);
    await repo.agent.rapports([{ poste: (await repo.snapshot()).postes[0].nomReseau, processus: [{ nom: 'firefox.exe', compte: 's' }] }]);
    const stale = await repo.read(admin); // révision 2
    await repo.agent.rapports([{ poste: (await repo.snapshot()).postes[0].nomReseau, processus: [] }]); // révision 3
    stale.materiels[2].modele = 'Après un rapport de poste';
    await repo.update(stale, 2, admin);
    await repo.bindIdentity(TEACHER, 'kc-teacher');
    const reopened = await createWorkspaceRepository({ file });
    assert.equal((await reopened.read(admin)).materiels[0].modele, 'Persisté');
    assert.equal((await reopened.read(admin)).materiels[2].modele, 'Après un rapport de poste');
    assert.equal((await reopened.findAccount({ sub: 'kc-teacher' }))?.id, TEACHER);
    const report = (await reopened.read(admin)).remontees[0];
    assert.equal((await reopened.pdf(report.id, admin)).subarray(0, 8).toString(), '%PDF-1.4');
    const foreign = (await reopened.snapshot()).remontees.find((r) => r.ecoleId === 'e-res')!;
    await assert.rejects(reopened.pdf(foreign.id, admin), { status: 404 });
    const others = (await reopened.read(admin)).remontees.find((r) => r.auteurId !== TEACHER)!;
    await assert.rejects(reopened.pdf(others.id, (await reopened.actor(TEACHER))!), { status: 404 });
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test('routeurs : session obligatoire, ETag, jeton des postes', async () => {
  const repository = await createWorkspaceRepository();
  let accountId: Id | null = null;
  const app = express()
    .use('/api/workspace', createWorkspaceRouter({ repository, actor: async () => (accountId ? repository.actor(accountId) : null) }))
    .use('/api/agent', createAgentRouter({ repository, token: 'jeton-de-test' }));
  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>((resolve) => server.once('listening', resolve));
  const url = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  try {
    assert.equal((await fetch(`${url}/api/workspace`)).status, 401);
    accountId = TEACHER;
    const first = await fetch(`${url}/api/workspace`);
    const body = await first.json();
    assert.equal(body.moi.nom, 'L. Martin');
    assert.equal(body.comptes.length, 0);
    assert.equal((await fetch(`${url}/api/workspace`, { headers: { 'If-None-Match': first.headers.get('ETag')! } })).status, 304);
    assert.equal((await fetch(`${url}/api/agent/postes`)).status, 401);
    assert.equal((await fetch(`${url}/api/agent/postes`, { headers: { Authorization: 'Bearer faux-jeton-de-t' } })).status, 401);
    const auth = { Authorization: 'Bearer jeton-de-test', 'Content-Type': 'application/json' };
    const postes = (await (await fetch(`${url}/api/agent/postes`, { headers: auth })).json()).postes;
    const reply = await (await fetch(`${url}/api/agent/rapports`, { method: 'POST', headers: auth, body: JSON.stringify({ rapports: [{ poste: postes[0].nomReseau, processus: [{ nom: 'steam.exe', compte: 's' }] }] }) })).json();
    assert.equal(reply.commandes[0].type, 'arret');
    assert.equal((await fetch(`${url}/api/workspace`, { headers: { 'If-None-Match': first.headers.get('ETag')! } })).status, 200, 'nouvelle révision après le rapport');
    accountId = 'inconnu';
    assert.equal((await fetch(`${url}/api/workspace`)).status, 401);
  } finally { server.close(); }
});
