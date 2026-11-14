/* ==========================================================================
   Persistance · migrations versionnées du schéma PostgreSQL
   - Une migration par fichier migrations/NNNN-description.sql, jamais
     modifiée une fois publiée : toute évolution du schéma en ajoute une.
   - Chaque migration s'exécute dans sa propre transaction, dans le schéma
     de l'espace (search_path), puis est inscrite dans orion_migration.
   - Appelée au démarrage sous le verrou d'initialisation (postgres.ts) :
     un seul serveur applique les migrations, la base n'est jamais
     réinitialisée.
   ========================================================================== */

import { readdirSync, readFileSync } from 'node:fs';
import { journal } from '../journal.ts';
import type { PoolClient } from 'pg';

const DOSSIER = new URL('./migrations/', import.meta.url);

/** Migrations connues, par version croissante */
export const MIGRATIONS = readdirSync(DOSSIER).filter((f) => /^\d{4}-[a-z0-9-]+\.sql$/.test(f)).sort()
  .map((fichier) => ({ version: Number(fichier.slice(0, 4)), nom: fichier.slice(5, -4), sql: readFileSync(new URL(fichier, DOSSIER), 'utf8') }));

/** Applique les migrations manquantes au schéma s ; renvoie les versions appliquées. */
export async function migrer(db: PoolClient, s: string) {
  await db.query(`CREATE SCHEMA IF NOT EXISTS ${s};
    CREATE TABLE IF NOT EXISTS ${s}.orion_migration (version integer PRIMARY KEY, nom text NOT NULL, appliquee_le timestamptz NOT NULL DEFAULT now())`);
  const faites = new Set((await db.query<{ version: number }>(`SELECT version FROM ${s}.orion_migration`)).rows.map((r) => r.version));
  const appliquees: number[] = [];
  for (const m of MIGRATIONS.filter((x) => !faites.has(x.version))) {
    await db.query('BEGIN');
    try {
      await db.query(`SET LOCAL search_path TO ${s}`);
      await db.query(m.sql);
      await db.query(`INSERT INTO ${s}.orion_migration (version, nom) VALUES ($1, $2)`, [m.version, m.nom]);
      await db.query('COMMIT');
    } catch (error) {
      await db.query('ROLLBACK').catch(() => {});
      throw Object.assign(new Error(`Migration ${m.version} (${m.nom}) en échec : ${(error as Error).message}`), { cause: error });
    }
    journal.info('migration', { schema: s, version: m.version, nom: m.nom });
    appliquees.push(m.version);
  }
  return appliquees;
}
