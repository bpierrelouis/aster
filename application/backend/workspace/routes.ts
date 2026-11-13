/* ==========================================================================
   Espace de travail · routes HTTP : API de l'espace (session) et des postes
   (jeton porteur).
   ========================================================================== */

import express from 'express';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { assert } from './rules.ts';
import { journal, raison } from '../journal.ts';
import type { NextFunction, Request, Response } from 'express';
import type { Actor } from '#shared/types.ts';
import type { HttpError } from './rules.ts';
import type { Engine } from './engine.ts';

/** Recensement mobile : secret des campagnes et adresse publique de l'application mobile (relais), null si non configurée */
export interface ReconConfig { secret: string; url: string | null }

/** actor : fonction (req) => utilisateur agissant, ou null sans session valide ; agentToken : secret des postes. */
export function createWorkspaceRouter({ repository, actor, agentToken, recon }: { repository: Engine; actor: (req: Request) => Promise<Actor | null>; agentToken: string; recon: ReconConfig }) {
  const router = express.Router();
  router.use(async (req, res, next) => {
    res.set('Cache-Control', 'no-store');
    try {
      const current = await actor(req);
      if (!current) return res.status(401).json({ error: 'Connexion nécessaire.' });
      res.locals.actor = current;
      next();
    } catch (error) { next(error); }
  });
  router.use(express.json({ limit: '8mb' })); // corps lu seulement pour une session valide
  router.get('/', async (req, res, next) => {
    try {
      const view = await repository.read(res.locals.actor);
      const etag = `"${view.revision}-${res.locals.actor.id}"`;
      res.set('ETag', etag);
      if (req.get('If-None-Match') === etag) return res.status(304).end();
      res.json(view);
    } catch (e) { next(e); }
  });
  router.put('/', async (req, res, next) => {
    try { res.json(await repository.update(req.body?.state, req.body?.baseRevision, res.locals.actor)); } catch (e) { next(e); }
  });
  router.post('/import/analyse', async (req, res, next) => {
    try { res.json(await repository.importAnalyse(res.locals.actor, req.body)); } catch (e) { next(e); }
  });
  router.post('/import', async (req, res, next) => {
    try { res.json(await repository.importMateriels(res.locals.actor, req.body)); } catch (e) { next(e); }
  });
  // Jeton à installer sur un poste de son périmètre (administrateur, super administrateur)
  router.get('/postes/:id/jeton', async (req, res, next) => {
    try {
      const current: Actor = res.locals.actor;
      if (!['admin', 'superadmin'].includes(current.role)) return res.status(403).json({ error: 'Action réservée aux administrateurs.' });
      const poste = (await repository.read(current)).postes.find((p) => p.id === req.params.id);
      if (!poste) return res.status(404).json({ error: 'Poste introuvable.' });
      res.json({ poste: poste.nomReseau, jeton: jetonPoste(agentToken, poste.nomReseau) });
    } catch (e) { next(e); }
  });
  // Adresse d'appairage d'un téléphone à une campagne de recensement (QR affiché par ORION)
  router.get('/recensements/:id/appairage', async (req, res, next) => {
    try { res.json(await repository.recon.appairage(res.locals.actor, req.params.id, recon)); } catch (e) { next(e); }
  });
  router.get('/reports/:id/pdf', async (req, res, next) => {
    try {
      const pdf = await repository.pdf(req.params.id, res.locals.actor);
      res.type('application/pdf').set('Content-Disposition', `inline; filename="${req.params.id.replace(/[^a-zA-Z0-9-]/g, '')}.pdf"`).send(pdf);
    } catch (e) { next(e); }
  });
  router.use(errorHandler('Espace de travail'));
  return router;
}

const equal = (a: string, b: string) => { const x = Buffer.from(a), y = Buffer.from(b); return x.length === y.length && timingSafeEqual(x, y); };

/** Jeton propre à un poste : NOM:signature, signature HMAC-SHA256 du nom réseau (en capitales) par le secret des postes */
export const jetonPoste = (secret: string, nomReseau: string) => {
  const nom = nomReseau.trim().toUpperCase();
  return `${nom}:${createHmac('sha256', secret).update(nom).digest('base64url')}`;
};

/**
 * API des postes, par jeton porteur :
 * - jeton propre à un poste (jetonPoste) : ses seuls rapports et résultats ;
 * - secret des postes : passerelle de confiance (émulateur du démonstrateur), liste des postes et envois groupés.
 */
export function createAgentRouter({ repository, token }: { repository: Engine; token: string }) {
  const router = express.Router();
  router.use((req, res, next) => {
    res.set('Cache-Control', 'no-store');
    const given = String(req.get('Authorization') ?? '').replace(/^Bearer /, '');
    const nom = given.slice(0, Math.max(0, given.lastIndexOf(':')));
    if (equal(given, String(token))) res.locals.poste = null; // passerelle
    else if (nom && equal(given, jetonPoste(token, nom))) res.locals.poste = nom;
    else return res.status(401).json({ error: 'Poste non authentifié.' });
    next();
  });
  router.use(express.json({ limit: '4mb' })); // corps lu seulement pour un poste authentifié
  /** Un poste authentifié n'agit que pour lui-même */
  const own = (res: Response, items: { poste?: unknown }[]) => res.locals.poste === null || items.every((x) => String(x?.poste ?? '').toUpperCase() === res.locals.poste);
  router.get('/postes', async (_req, res, next) => {
    if (res.locals.poste !== null) return res.status(403).json({ error: 'Liste réservée à la passerelle des postes.' });
    try { res.json({ postes: await repository.agent.postes() }); } catch (e) { next(e); }
  });
  router.post('/rapports', async (req, res, next) => {
    try {
      const rapports = req.body?.rapports;
      assert(Array.isArray(rapports) && rapports.length <= 2000, 'Rapports invalides.');
      if (!own(res, rapports)) return res.status(403).json({ error: 'Un poste ne rapporte que pour lui-même.' });
      res.json(await repository.agent.rapports(rapports));
    } catch (e) { next(e); }
  });
  router.post('/resultats', async (req, res, next) => {
    try {
      const resultats = req.body?.resultats;
      assert(Array.isArray(resultats) && resultats.length <= 5000, 'Résultats invalides.');
      if (!own(res, resultats)) return res.status(403).json({ error: 'Un poste ne rapporte que pour lui-même.' });
      await repository.agent.resultats(resultats);
      for (const r of resultats) journal.info('intervention_resultat', { operation: r.operation, poste: r.poste, statut: r.statut });
      res.json({ ok: true });
    } catch (e) { next(e); }
  });
  router.use(errorHandler('Postes'));
  return router;
}

/**
 * API du connecteur RECON, par jeton porteur (secret des campagnes) : le connecteur, sur le réseau d'ORION, publie
 * les campagnes ouvertes sur le relais et transmet les constats des téléphones. Les blocs restent chiffrés jusqu'ici.
 */
export function createReconRouter({ repository, secret }: { repository: Engine; secret: string }) {
  const router = express.Router();
  router.use((req, res, next) => {
    res.set('Cache-Control', 'no-store');
    if (!equal(String(req.get('Authorization') ?? '').replace(/^Bearer /, ''), secret)) return res.status(401).json({ error: 'Connecteur non authentifié.' });
    next();
  });
  router.use(express.json({ limit: '4mb' }));
  router.get('/campagnes', async (_req, res, next) => {
    try { res.json({ campagnes: await repository.recon.campagnes(secret) }); } catch (e) { next(e); }
  });
  router.post('/campagnes/:id/evenements', async (req, res, next) => {
    try {
      const evenements = req.body?.evenements;
      assert(Array.isArray(evenements) && evenements.length <= 1000 && evenements.every((x) => x && typeof x.id === 'string' && x.bloc), 'Événements invalides.');
      const resultats = await repository.recon.evenements(secret, req.params.id, evenements);
      const statuts: Record<string, number> = {};
      for (const r of resultats) statuts[r.statut] = (statuts[r.statut] ?? 0) + 1;
      journal.info('recon_constats', { campagne: req.params.id, ...statuts });
      res.json({ resultats });
    } catch (e) { next(e); }
  });
  router.use(errorHandler('Recensement'));
  return router;
}

const errorHandler = (label: string) => (error: HttpError, req: Request, res: Response, _next: NextFunction) => {
  if (!error.status) journal.error('erreur', { api: label, chemin: req.originalUrl.split('?')[0], erreur: raison(error) });
  else if (error.status !== 401) journal.warn('refus', { api: label, chemin: req.originalUrl.split('?')[0], compte: res.locals.actor?.id, statut: error.status, motif: error.message });
  res.status(error.status || 500).json({ error: error.status ? error.message : 'Enregistrement momentanément indisponible.' });
};
