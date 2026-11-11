/* ==========================================================================
   Espace de travail · routes HTTP : API de l'espace (session) et des postes
   (jeton porteur).
   ========================================================================== */

import express from 'express';
import { timingSafeEqual } from 'node:crypto';
import { assert } from './rules.js';

/** actor : fonction (req) => utilisateur agissant, ou null sans session valide. */
export function createWorkspaceRouter({ repository, actor }) {
  const router = express.Router();
  router.use(express.json({ limit: '8mb' }));
  router.use(async (req, res, next) => {
    res.set('Cache-Control', 'no-store');
    try {
      const current = await actor(req);
      if (!current) return res.status(401).json({ error: 'Connexion nécessaire.' });
      res.locals.actor = current;
      next();
    } catch (error) { next(error); }
  });
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
  router.get('/reports/:id/pdf', async (req, res, next) => {
    try {
      const pdf = await repository.pdf(req.params.id, res.locals.actor);
      if (pdf.url) return res.redirect(303, pdf.url);
      res.type('application/pdf').set('Content-Disposition', `inline; filename="${req.params.id.replace(/[^a-zA-Z0-9-]/g, '')}.pdf"`).send(pdf.body);
    } catch (e) { next(e); }
  });
  router.use(errorHandler('Espace de travail'));
  return router;
}

/** API des postes : authentification par jeton porteur. */
export function createAgentRouter({ repository, token }) {
  const expected = Buffer.from(String(token));
  const router = express.Router();
  router.use(express.json({ limit: '4mb' }));
  router.use((req, res, next) => {
    res.set('Cache-Control', 'no-store');
    const given = Buffer.from(String(req.get('Authorization') ?? '').replace(/^Bearer /, ''));
    if (given.length !== expected.length || !timingSafeEqual(given, expected)) return res.status(401).json({ error: 'Poste non authentifié.' });
    next();
  });
  router.get('/postes', async (_req, res, next) => {
    try { res.json({ postes: await repository.agent.postes() }); } catch (e) { next(e); }
  });
  router.post('/rapports', async (req, res, next) => {
    try {
      const rapports = req.body?.rapports;
      assert(Array.isArray(rapports) && rapports.length <= 2000, 'Rapports invalides.');
      res.json(await repository.agent.rapports(rapports));
    } catch (e) { next(e); }
  });
  router.post('/resultats', async (req, res, next) => {
    try {
      const resultats = req.body?.resultats;
      assert(Array.isArray(resultats) && resultats.length <= 5000, 'Résultats invalides.');
      await repository.agent.resultats(resultats);
      res.json({ ok: true });
    } catch (e) { next(e); }
  });
  router.use(errorHandler('Postes'));
  return router;
}

const errorHandler = (label) => (error, _req, res, _next) => {
  if (!error.status) console.error(`${label} :`, error.code || error.name, error.message);
  res.status(error.status || 500).json({ error: error.status ? error.message : 'Enregistrement momentanément indisponible.' });
};
