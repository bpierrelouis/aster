/* ==========================================================================
   RECON · démarrage du relais (Hidora en production, poste en développement).
   Variables : PORT, HOST, RELAIS_TOKEN (secret du connecteur), DATABASE_URL
   (PostgreSQL ; facultatif hors production : stockage en mémoire),
   RELAIS_DIST (application mobile construite, frontend/dist-recon par défaut).
   ========================================================================== */

import pg from 'pg';
import { createRelais, DIST_RECON } from './relais.ts';
import { createMemoryStore, createPostgresStore } from './relais-store.ts';

const env = process.env;
const production = env.NODE_ENV === 'production';
const token = env.RELAIS_TOKEN || (production ? '' : 'recon-relais-local');
if (production && (token.length < 32 || !env.DATABASE_URL)) throw new Error('En production, renseigner DATABASE_URL et un RELAIS_TOKEN dédié (32 caractères minimum).');

const pool = env.DATABASE_URL ? new pg.Pool({ connectionString: env.DATABASE_URL, max: 5 }) : null;
pool?.on('error', (error) => console.error('Connexion PostgreSQL :', error.message));
if (!pool) console.log('Relais : aucune DATABASE_URL, stockage en mémoire (développement).');
const store = pool ? await createPostgresStore({ pool }) : createMemoryStore();

const app = createRelais({ store, token, dist: env.RELAIS_DIST || DIST_RECON, production });
const port = Number(env.PORT || (production ? 3000 : 3002));
const host = env.HOST || '127.0.0.1';
const server = app.listen(port, host, () => console.log(`Relais RECON : http://${host}:${port}`));
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, () => server.close(() => (pool ? pool.end() : Promise.resolve()).then(() => process.exit(0))));
}
