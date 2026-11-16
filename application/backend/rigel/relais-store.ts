/* ==========================================================================
   RIGEL · stockage du relais : operations (empreinte du jeton des téléphones,
   version et instantané chiffré) et événements chiffrés en attente du
   connecteur. Deux implémentations : mémoire (tests, développement) et
   PostgreSQL (Hidora). Le relais ne stocke aucune donnée en clair.
   ========================================================================== */

import type { Pool } from 'pg';
import type { Bloc } from '#shared/rigel.ts';

export interface OperationRelais { id: string; empreinte: string; version: string; expireLe: number; instantane: Bloc }
export interface EvenementRelais { rang: number; id: string; bloc: Bloc }

export interface RelaisStore {
  /** Vérifie que le stockage répond */
  sante(): Promise<void>;
  operations(): Promise<Pick<OperationRelais, 'id' | 'version' | 'expireLe'>[]>;
  operation(id: string): Promise<OperationRelais | null>;
  /** Crée ou remplace l’opération ; ses événements sont conservés */
  deposer(c: OperationRelais): Promise<void>;
  /** Supprime l’opération et ses événements */
  supprimer(id: string): Promise<void>;
  /**
   * Ajoute les événements, sauf si les non acquittés dépasseraient max (renvoie false) ; contrôle et ajout sont atomiques.
   * Un événement déjà reçu (même identifiant) est ignoré.
   */
  ajouter(operation: string, evenements: { id: string; bloc: Bloc }[], max: number): Promise<boolean>;
  /** Nombre d'événements de l’opération non encore acquittés par le connecteur */
  enAttente(operation: string): Promise<number>;
  evenements(operation: string, limite: number): Promise<EvenementRelais[]>;
  /** Efface les événements de rang inférieur ou égal à jusqua */
  acquitter(operation: string, jusqua: number): Promise<void>;
  /** Supprime les opérations expirées */
  purger(now?: number): Promise<void>;
}

export function createMemoryStore(): RelaisStore {
  const operations = new Map<string, OperationRelais>();
  const evenements = new Map<string, EvenementRelais[]>();
  let rang = 0;
  const supprimer = async (id: string) => { operations.delete(id); evenements.delete(id); };
  return {
    async sante() {},
    async operations() { return [...operations.values()].map(({ id, version, expireLe }) => ({ id, version, expireLe })); },
    async operation(id) { return operations.get(id) ?? null; },
    async deposer(c) { operations.set(c.id, structuredClone(c)); },
    supprimer,
    async ajouter(operation, liste, max) {
      const file = evenements.get(operation) ?? [];
      if (file.length + liste.length > max) return false;
      for (const e of liste) if (!file.some((x) => x.id === e.id)) file.push({ rang: ++rang, id: e.id, bloc: e.bloc });
      evenements.set(operation, file);
      return true;
    },
    async enAttente(operation) { return evenements.get(operation)?.length ?? 0; },
    async evenements(operation, limite) { return (evenements.get(operation) ?? []).slice(0, limite); },
    async acquitter(operation, jusqua) { evenements.set(operation, (evenements.get(operation) ?? []).filter((e) => e.rang > jusqua)); },
    async purger(now = Date.now()) { for (const c of [...operations.values()]) if (c.expireLe <= now) await supprimer(c.id); },
  };
}

/** Stockage PostgreSQL ; schema permet d'isoler les tests */
export async function createPostgresStore({ pool, schema = 'public' }: { pool: Pool; schema?: string }): Promise<RelaisStore> {
  if (!/^[a-z_][a-z0-9_]*$/.test(schema)) throw new Error('Nom de schéma invalide.');
  const s = schema;
  await pool.query(`
    CREATE SCHEMA IF NOT EXISTS ${s};
    -- Reprise d'une base créée avant le 15 novembre : tables et colonne renommées, données conservées
    DO $$ BEGIN
      IF to_regclass('${s}.rigel_campagne') IS NOT NULL AND to_regclass('${s}.operation') IS NULL THEN
        ALTER TABLE ${s}.rigel_campagne RENAME TO operation;
        ALTER TABLE ${s}.rigel_evenement RENAME TO evenement;
        ALTER TABLE ${s}.evenement RENAME COLUMN campagne_id TO operation_id;
      END IF;
    END $$;
    CREATE TABLE IF NOT EXISTS ${s}.operation (
      id text PRIMARY KEY, empreinte text NOT NULL, version text NOT NULL, expire_le timestamptz NOT NULL, instantane jsonb NOT NULL);
    CREATE TABLE IF NOT EXISTS ${s}.evenement (
      rang bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      operation_id text NOT NULL REFERENCES ${s}.operation(id) ON DELETE CASCADE,
      id text NOT NULL, bloc jsonb NOT NULL, recu_le timestamptz NOT NULL DEFAULT now(),
      UNIQUE (operation_id, id));`);
  type Ligne = { id: string; empreinte: string; version: string; expire_le: Date; instantane: Bloc };
  const versOperation = (r: Ligne): OperationRelais => ({ id: r.id, empreinte: r.empreinte, version: r.version, expireLe: r.expire_le.getTime(), instantane: r.instantane });
  return {
    async sante() { await pool.query('SELECT 1'); },
    async operations() {
      const { rows } = await pool.query<Ligne>(`SELECT id, version, expire_le FROM ${s}.operation ORDER BY id`);
      return rows.map((r) => ({ id: r.id, version: r.version, expireLe: r.expire_le.getTime() }));
    },
    async operation(id) {
      const { rows } = await pool.query<Ligne>(`SELECT * FROM ${s}.operation WHERE id = $1`, [id]);
      return rows[0] ? versOperation(rows[0]) : null;
    },
    async deposer(c) {
      await pool.query(`INSERT INTO ${s}.operation (id, empreinte, version, expire_le, instantane) VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id) DO UPDATE SET empreinte = EXCLUDED.empreinte, version = EXCLUDED.version, expire_le = EXCLUDED.expire_le, instantane = EXCLUDED.instantane`,
      [c.id, c.empreinte, c.version, new Date(c.expireLe), JSON.stringify(c.instantane)]);
    },
    async supprimer(id) { await pool.query(`DELETE FROM ${s}.operation WHERE id = $1`, [id]); },
    async ajouter(operation, liste, max) {
      if (!liste.length) return true;
      // Verrou sur l'opération : deux dépôts simultanés ne dépassent pas le plafond
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query(`SELECT 1 FROM ${s}.operation WHERE id = $1 FOR UPDATE`, [operation]);
        const { rows } = await client.query<{ n: number }>(`SELECT count(*)::int AS n FROM ${s}.evenement WHERE operation_id = $1`, [operation]);
        if (rows[0].n + liste.length > max) { await client.query('ROLLBACK'); return false; }
        await client.query(`INSERT INTO ${s}.evenement (operation_id, id, bloc)
          SELECT $1, x->>'id', x->'bloc' FROM jsonb_array_elements($2::jsonb) AS x ON CONFLICT (operation_id, id) DO NOTHING`, [operation, JSON.stringify(liste)]);
        await client.query('COMMIT');
        return true;
      } catch (error) {
        await client.query('ROLLBACK').catch(() => {});
        throw error;
      } finally { client.release(); }
    },
    async enAttente(operation) {
      const { rows } = await pool.query<{ n: number }>(`SELECT count(*)::int AS n FROM ${s}.evenement WHERE operation_id = $1`, [operation]);
      return rows[0].n;
    },
    async evenements(operation, limite) {
      const { rows } = await pool.query<{ rang: string; id: string; bloc: Bloc }>(`SELECT rang, id, bloc FROM ${s}.evenement WHERE operation_id = $1 ORDER BY rang LIMIT $2`, [operation, limite]);
      return rows.map((r) => ({ rang: Number(r.rang), id: r.id, bloc: r.bloc }));
    },
    async acquitter(operation, jusqua) { await pool.query(`DELETE FROM ${s}.evenement WHERE operation_id = $1 AND rang <= $2`, [operation, jusqua]); },
    async purger(now = Date.now()) { await pool.query(`DELETE FROM ${s}.operation WHERE expire_le <= $1`, [new Date(now)]); },
  };
}
