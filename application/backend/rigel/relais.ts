/* ==========================================================================
   RIGEL · relais, hébergé sur Internet (Hidora) : boîte aux lettres chiffrée
   entre les téléphones et ORION, qui n'est jamais joint depuis Internet.
   - Sert l'application mobile (frontend/dist-rigel).
   - Téléphone (jeton de l’opération, dont seule l'empreinte est conservée) :
     lit l'instantané de son opération, dépose ses événements.
   - Connecteur d'ORION (RELAIS_TOKEN) : publie les opérations, relève les
     événements, les acquitte, supprime les opérations closes.
   - Aucune donnée en clair : instantanés et événements restent chiffrés
     (clé connue d'ORION et des téléphones seulement, shared/rigel.ts).
   ========================================================================== */

import express from 'express';
import helmet from 'helmet';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { blocEvenementValide, empreinte } from '#shared/rigel.ts';
import type { NextFunction, Request, Response } from 'express';
import type { Bloc } from '#shared/rigel.ts';
import type { RelaisStore } from './relais-store.ts';
import { journal, raison } from '../journal.ts';
import { egalConstant } from '../securite.ts';

export const DIST_RIGEL = fileURLToPath(new URL('../../frontend/dist-rigel', import.meta.url));
/** Intervalle de purge des opérations expirées */
export const PURGE = 10 * 60 * 1000;
/** Plafond des événements non acquittés d'une opération : un téléphone appairé ou un jeton divulgué ne remplit pas la base */
export const MAX_EN_ATTENTE = 5000;

const ID = /^[\w-]{8,100}$/;
const OPERATION = /^[\w-]{1,80}$/;
const jetonDe = (req: Request) => String(req.get('Authorization') ?? '').replace(/^Bearer /, '');
/** Instantané chiffré d'une opération (déposé par le connecteur) */
const estBloc = (b: unknown): b is Bloc => !!b && typeof (b as Bloc).iv === 'string' && typeof (b as Bloc).data === 'string' && (b as Bloc).iv.length < 64 && (b as Bloc).data.length < 12_000_000;
type Erreur = Error & { status?: number; type?: string };
const refus = (status: number, message: string): never => { throw Object.assign(new Error(message), { status }); };

/** Application Express du relais ; production : derrière le proxy TLS de l'hébergeur */
export function createRelais({ store, token, dist = DIST_RIGEL, production = false, maxEnAttente = MAX_EN_ATTENTE }: { store: RelaisStore; token: string; dist?: string; production?: boolean; maxEnAttente?: number }) {
  const app = express();
  app.disable('x-powered-by');
  setInterval(() => store.purger().catch((e: Error) => journal.error('purge', { erreur: raison(e) })), PURGE).unref();
  if (production) app.set('trust proxy', 1);
  app.use(helmet({
    strictTransportSecurity: production ? undefined : false,
    contentSecurityPolicy: { useDefaults: false, directives: {
      defaultSrc: ["'self'"], scriptSrc: ["'self'", "'wasm-unsafe-eval'"], workerSrc: ["'self'", 'blob:'], imgSrc: ["'self'", 'data:', 'blob:'],
      mediaSrc: ["'self'", 'blob:'], connectSrc: ["'self'"], styleSrc: ["'self'", "'unsafe-inline'"], fontSrc: ["'self'"], manifestSrc: ["'self'"],
      frameAncestors: ["'none'"], baseUri: ["'self'"], formAction: ["'self'"], objectSrc: ["'none'"],
    } },
    referrerPolicy: { policy: 'same-origin' },
  }));
  app.use((_req, res, next) => { res.set('Permissions-Policy', 'camera=(self)'); next(); });
  app.use('/api', (_req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });

  app.get('/api/health', async (_req, res) => {
    try { await store.sante(); res.json({ status: 'ok' }); } catch { res.status(503).json({ status: 'unavailable' }); }
  });

  /* ---------- Téléphone : jeton de son opération ---------- */
  const telephone = express.Router({ mergeParams: true });
  telephone.use(async (req, res, next) => {
    try {
      const id = String(req.params.id);
      const c = OPERATION.test(id) ? await store.operation(id) : null;
      // Même réponse pour une opération inconnue, close ou un jeton faux : l'existence d'une opération n'est pas révélée
      const jeton = await empreinte(jetonDe(req));
      if (!c || c.expireLe <= Date.now() || !egalConstant(jeton, c.empreinte)) refus(401, 'Opération inconnue, close ou accès refusé.');
      res.locals.operation = c;
      next();
    } catch (e) { next(e); }
  });
  telephone.get('/instantane', (_req, res) => { const { version, instantane } = res.locals.operation; res.json({ version, instantane }); });
  telephone.post('/evenements', express.json({ limit: '1mb' }), async (req, res, next) => {
    try {
      const evenements: unknown = req.body?.evenements;
      if (!Array.isArray(evenements) || evenements.length > 200 || !evenements.every((e) => e && ID.test(e.id) && blocEvenementValide(e.bloc))) refus(400, 'Événements invalides.');
      const liste = (evenements as { id: string; bloc: Bloc }[]).map(({ id, bloc }) => ({ id, bloc: { iv: bloc.iv, data: bloc.data } }));
      // Le téléphone garde ses événements refusés et les renvoie une fois les précédents relevés par ORION
      if (!await store.ajouter(res.locals.operation.id, liste, maxEnAttente)) refus(429, 'Trop d’événements en attente d’ORION : réessayez plus tard.');
      res.json({ recus: liste.map((e) => e.id) });
    } catch (e) { next(e); }
  });
  app.use('/api/operations/:id', telephone);

  /* ---------- Connecteur d'ORION : RELAIS_TOKEN ---------- */
  const connecteur = express.Router();
  connecteur.use((req, _res, next) => { if (!egalConstant(jetonDe(req), token)) refus(401, 'Connecteur non authentifié.'); next(); });
  const operationId = (req: Request) => { const id = String(req.params.id); if (!OPERATION.test(id)) refus(400, 'Opération invalide.'); return id; };
  connecteur.get('/operations', async (_req, res, next) => {
    try { res.json({ operations: await store.operations() }); } catch (e) { next(e); }
  });
  connecteur.put('/operations/:id', express.json({ limit: '8mb' }), async (req, res, next) => {
    try {
      const { empreinte: e, expireLe, version, instantane } = req.body ?? {};
      if (typeof e !== 'string' || !/^[0-9a-f]{64}$/.test(e) || !Number.isFinite(expireLe) || typeof version !== 'string' || version.length > 128 || !estBloc(instantane)) refus(400, 'Opération invalide.');
      await store.deposer({ id: operationId(req), empreinte: e, expireLe, version, instantane: { iv: instantane.iv, data: instantane.data } });
      res.status(204).end();
    } catch (e) { next(e); }
  });
  connecteur.delete('/operations/:id', async (req, res, next) => {
    try { await store.supprimer(operationId(req)); res.status(204).end(); } catch (e) { next(e); }
  });
  connecteur.get('/operations/:id/evenements', async (req, res, next) => {
    try {
      const limite = Math.min(Math.max(Number(req.query.limite) || 500, 1), 1000);
      res.json({ evenements: await store.evenements(operationId(req), limite) });
    } catch (e) { next(e); }
  });
  connecteur.post('/operations/:id/acquittement', express.json(), async (req, res, next) => {
    try {
      const jusqua = req.body?.jusqua;
      if (!Number.isSafeInteger(jusqua)) refus(400, 'Rang invalide.');
      await store.acquitter(operationId(req), jusqua);
      res.status(204).end();
    } catch (e) { next(e); }
  });
  app.use('/api/connecteur', connecteur);

  app.use('/api', (_req, res) => res.status(404).json({ error: 'Adresse inconnue.' }));
  app.use((error: Erreur, _req: Request, res: Response, _next: NextFunction) => {
    const status = error.status ?? (error.type === 'entity.too.large' ? 413 : error.type === 'entity.parse.failed' ? 400 : 500);
    if (status >= 500) journal.error('relais', { erreur: raison(error) });
    // Le message d'un JSON illisible cite un extrait du corps : jamais renvoyé
    res.status(status).json({ error: status >= 500 ? 'Relais momentanément indisponible.' : error.type === 'entity.parse.failed' ? 'JSON invalide.' : error.message });
  });

  /* ---------- Application mobile ---------- */
  if (existsSync(dist)) {
    app.use('/assets', express.static(join(dist, 'assets'), { immutable: true, maxAge: '1y', fallthrough: false }));
    app.use(express.static(dist, { index: false, setHeaders: (res, path) => { if (/(?:index\.html|sw\.js)$/.test(path)) res.set('Cache-Control', 'no-cache'); } }));
    app.get('/{*path}', (_req, res) => { res.set('Cache-Control', 'no-cache'); res.sendFile(join(dist, 'index.html')); });
  }
  return app;
}
