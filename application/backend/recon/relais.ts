/* ==========================================================================
   RECON · relais, hébergé sur Internet (Hidora) : boîte aux lettres chiffrée
   entre les téléphones et ORION, qui n'est jamais joint depuis Internet.
   - Sert l'application mobile (frontend/dist-recon).
   - Téléphone (jeton de campagne, dont seule l'empreinte est conservée) :
     lit l'instantané de sa campagne, dépose ses événements.
   - Connecteur d'ORION (RELAIS_TOKEN) : publie les campagnes, relève les
     événements, les acquitte, supprime les campagnes closes.
   - Aucune donnée en clair : instantanés et événements restent chiffrés
     (clé connue d'ORION et des téléphones seulement, shared/recon.ts).
   ========================================================================== */

import express from 'express';
import helmet from 'helmet';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { timingSafeEqual } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { empreinte } from '#shared/recon.ts';
import type { NextFunction, Request, Response } from 'express';
import type { Bloc } from '#shared/recon.ts';
import type { RelaisStore } from './relais-store.ts';
import { journal, raison } from '../journal.ts';

export const DIST_RECON = fileURLToPath(new URL('../../frontend/dist-recon', import.meta.url));
/** Intervalle de purge des campagnes expirées */
export const PURGE = 10 * 60 * 1000;

const ID = /^[\w-]{8,100}$/;
const CAMPAGNE = /^[\w-]{1,80}$/;
const egal = (a: string, b: string) => { const x = Buffer.from(a), y = Buffer.from(b); return x.length === y.length && timingSafeEqual(x, y); };
const jetonDe = (req: Request) => String(req.get('Authorization') ?? '').replace(/^Bearer /, '');
const estBloc = (b: unknown): b is Bloc => !!b && typeof (b as Bloc).iv === 'string' && typeof (b as Bloc).data === 'string' && (b as Bloc).iv.length < 64 && (b as Bloc).data.length < 12_000_000;
type Erreur = Error & { status?: number; type?: string };
const refus = (status: number, message: string): never => { throw Object.assign(new Error(message), { status }); };

/** Application Express du relais ; production : derrière le proxy TLS de l'hébergeur */
export function createRelais({ store, token, dist = DIST_RECON, production = false }: { store: RelaisStore; token: string; dist?: string; production?: boolean }) {
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

  /* ---------- Téléphone : jeton de sa campagne ---------- */
  const telephone = express.Router({ mergeParams: true });
  telephone.use(async (req, res, next) => {
    try {
      const id = String(req.params.id);
      const c = CAMPAGNE.test(id) ? await store.campagne(id) : null;
      if (!c || c.expireLe <= Date.now()) refus(404, 'Campagne inconnue ou close.');
      if (!egal(await empreinte(jetonDe(req)), c!.empreinte)) refus(401, 'Accès à la campagne refusé.');
      res.locals.campagne = c;
      next();
    } catch (e) { next(e); }
  });
  telephone.get('/instantane', (_req, res) => { const { version, instantane } = res.locals.campagne; res.json({ version, instantane }); });
  telephone.post('/evenements', express.json({ limit: '1mb' }), async (req, res, next) => {
    try {
      const evenements: unknown = req.body?.evenements;
      if (!Array.isArray(evenements) || evenements.length > 200 || !evenements.every((e) => e && ID.test(e.id) && estBloc(e.bloc))) refus(400, 'Événements invalides.');
      const liste = (evenements as { id: string; bloc: Bloc }[]).map(({ id, bloc }) => ({ id, bloc: { iv: bloc.iv, data: bloc.data } }));
      await store.ajouter(res.locals.campagne.id, liste);
      res.json({ recus: liste.map((e) => e.id) });
    } catch (e) { next(e); }
  });
  app.use('/api/campagnes/:id', telephone);

  /* ---------- Connecteur d'ORION : RELAIS_TOKEN ---------- */
  const connecteur = express.Router();
  connecteur.use((req, _res, next) => { if (!egal(jetonDe(req), token)) refus(401, 'Connecteur non authentifié.'); next(); });
  const campagneId = (req: Request) => { const id = String(req.params.id); if (!CAMPAGNE.test(id)) refus(400, 'Campagne invalide.'); return id; };
  connecteur.get('/campagnes', async (_req, res, next) => {
    try { res.json({ campagnes: await store.campagnes() }); } catch (e) { next(e); }
  });
  connecteur.put('/campagnes/:id', express.json({ limit: '8mb' }), async (req, res, next) => {
    try {
      const { empreinte: e, expireLe, version, instantane } = req.body ?? {};
      if (typeof e !== 'string' || !/^[0-9a-f]{64}$/.test(e) || !Number.isFinite(expireLe) || typeof version !== 'string' || version.length > 128 || !estBloc(instantane)) refus(400, 'Campagne invalide.');
      await store.deposer({ id: campagneId(req), empreinte: e, expireLe, version, instantane: { iv: instantane.iv, data: instantane.data } });
      res.status(204).end();
    } catch (e) { next(e); }
  });
  connecteur.delete('/campagnes/:id', async (req, res, next) => {
    try { await store.supprimer(campagneId(req)); res.status(204).end(); } catch (e) { next(e); }
  });
  connecteur.get('/campagnes/:id/evenements', async (req, res, next) => {
    try {
      const limite = Math.min(Math.max(Number(req.query.limite) || 500, 1), 1000);
      res.json({ evenements: await store.evenements(campagneId(req), limite) });
    } catch (e) { next(e); }
  });
  connecteur.post('/campagnes/:id/acquittement', express.json(), async (req, res, next) => {
    try {
      const jusqua = req.body?.jusqua;
      if (!Number.isSafeInteger(jusqua)) refus(400, 'Rang invalide.');
      await store.acquitter(campagneId(req), jusqua);
      res.status(204).end();
    } catch (e) { next(e); }
  });
  app.use('/api/connecteur', connecteur);

  app.use('/api', (_req, res) => res.status(404).json({ error: 'Adresse inconnue.' }));
  app.use((error: Erreur, _req: Request, res: Response, _next: NextFunction) => {
    const status = error.status ?? (error.type === 'entity.too.large' ? 413 : error.type === 'entity.parse.failed' ? 400 : 500);
    if (status >= 500) journal.error('relais', { erreur: raison(error) });
    res.status(status).json({ error: status >= 500 ? 'Relais momentanément indisponible.' : error.message });
  });

  /* ---------- Application mobile ---------- */
  if (existsSync(dist)) {
    app.use('/assets', express.static(join(dist, 'assets'), { immutable: true, maxAge: '1y', fallthrough: false }));
    app.use(express.static(dist, { index: false, setHeaders: (res, path) => { if (/(?:index\.html|sw\.js)$/.test(path)) res.set('Cache-Control', 'no-cache'); } }));
    app.get('/{*path}', (_req, res) => { res.set('Cache-Control', 'no-cache'); res.sendFile(join(dist, 'index.html')); });
  }
  return app;
}
