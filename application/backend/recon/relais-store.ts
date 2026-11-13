/* ==========================================================================
   RECON · stockage du relais : campagnes (empreinte du jeton des téléphones,
   version et instantané chiffré) et événements chiffrés en attente du
   connecteur. Deux implémentations : mémoire (tests, développement) et
   PostgreSQL (Hidora). Le relais ne stocke aucune donnée en clair.
   ========================================================================== */

import type { Pool } from 'pg';
import type { Bloc } from '#shared/recon.ts';

export interface CampagneRelais { id: string; empreinte: string; version: string; expireLe: number; instantane: Bloc }
export interface EvenementRelais { rang: number; id: string; bloc: Bloc }

export interface RelaisStore {
  /** Vérifie que le stockage répond */
  sante(): Promise<void>;
  campagnes(): Promise<Pick<CampagneRelais, 'id' | 'version' | 'expireLe'>[]>;
  campagne(id: string): Promise<CampagneRelais | null>;
  /** Crée ou remplace la campagne ; ses événements sont conservés */
  deposer(c: CampagneRelais): Promise<void>;
  /** Supprime la campagne et ses événements */
  supprimer(id: string): Promise<void>;
  /** Ajoute les événements ; un événement déjà reçu (même identifiant) est ignoré */
  ajouter(campagne: string, evenements: { id: string; bloc: Bloc }[]): Promise<void>;
  evenements(campagne: string, limite: number): Promise<EvenementRelais[]>;
  /** Efface les événements de rang inférieur ou égal à jusqua */
  acquitter(campagne: string, jusqua: number): Promise<void>;
  /** Supprime les campagnes expirées */
  purger(now?: number): Promise<void>;
}

export function createMemoryStore(): RelaisStore {
  const campagnes = new Map<string, CampagneRelais>();
  const evenements = new Map<string, EvenementRelais[]>();
  let rang = 0;
  const supprimer = async (id: string) => { campagnes.delete(id); evenements.delete(id); };
  return {
    async sante() {},
    async campagnes() { return [...campagnes.values()].map(({ id, version, expireLe }) => ({ id, version, expireLe })); },
    async campagne(id) { return campagnes.get(id) ?? null; },
    async deposer(c) { campagnes.set(c.id, structuredClone(c)); },
    supprimer,
    async ajouter(campagne, liste) {
      const file = evenements.get(campagne) ?? [];
      for (const e of liste) if (!file.some((x) => x.id === e.id)) file.push({ rang: ++rang, id: e.id, bloc: e.bloc });
      evenements.set(campagne, file);
    },
    async evenements(campagne, limite) { return (evenements.get(campagne) ?? []).slice(0, limite); },
    async acquitter(campagne, jusqua) { evenements.set(campagne, (evenements.get(campagne) ?? []).filter((e) => e.rang > jusqua)); },
    async purger(now = Date.now()) { for (const c of [...campagnes.values()]) if (c.expireLe <= now) await supprimer(c.id); },
  };
}

/** Stockage PostgreSQL ; schema permet d'isoler les tests */
export async function createPostgresStore({ pool, schema = 'public' }: { pool: Pool; schema?: string }): Promise<RelaisStore> {
  if (!/^[a-z_][a-z0-9_]*$/.test(schema)) throw new Error('Nom de schéma invalide.');
  const s = schema;
  await pool.query(`
    CREATE SCHEMA IF NOT EXISTS ${s};
    CREATE TABLE IF NOT EXISTS ${s}.recon_campagne (
      id text PRIMARY KEY, empreinte text NOT NULL, version text NOT NULL, expire_le timestamptz NOT NULL, instantane jsonb NOT NULL);
    CREATE TABLE IF NOT EXISTS ${s}.recon_evenement (
      rang bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      campagne_id text NOT NULL REFERENCES ${s}.recon_campagne(id) ON DELETE CASCADE,
      id text NOT NULL, bloc jsonb NOT NULL, recu_le timestamptz NOT NULL DEFAULT now(),
      UNIQUE (campagne_id, id));`);
  type Ligne = { id: string; empreinte: string; version: string; expire_le: Date; instantane: Bloc };
  const versCampagne = (r: Ligne): CampagneRelais => ({ id: r.id, empreinte: r.empreinte, version: r.version, expireLe: r.expire_le.getTime(), instantane: r.instantane });
  return {
    async sante() { await pool.query('SELECT 1'); },
    async campagnes() {
      const { rows } = await pool.query<Ligne>(`SELECT id, version, expire_le FROM ${s}.recon_campagne ORDER BY id`);
      return rows.map((r) => ({ id: r.id, version: r.version, expireLe: r.expire_le.getTime() }));
    },
    async campagne(id) {
      const { rows } = await pool.query<Ligne>(`SELECT * FROM ${s}.recon_campagne WHERE id = $1`, [id]);
      return rows[0] ? versCampagne(rows[0]) : null;
    },
    async deposer(c) {
      await pool.query(`INSERT INTO ${s}.recon_campagne (id, empreinte, version, expire_le, instantane) VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id) DO UPDATE SET empreinte = EXCLUDED.empreinte, version = EXCLUDED.version, expire_le = EXCLUDED.expire_le, instantane = EXCLUDED.instantane`,
      [c.id, c.empreinte, c.version, new Date(c.expireLe), JSON.stringify(c.instantane)]);
    },
    async supprimer(id) { await pool.query(`DELETE FROM ${s}.recon_campagne WHERE id = $1`, [id]); },
    async ajouter(campagne, liste) {
      if (!liste.length) return;
      await pool.query(`INSERT INTO ${s}.recon_evenement (campagne_id, id, bloc)
        SELECT $1, x->>'id', x->'bloc' FROM jsonb_array_elements($2::jsonb) AS x ON CONFLICT (campagne_id, id) DO NOTHING`, [campagne, JSON.stringify(liste)]);
    },
    async evenements(campagne, limite) {
      const { rows } = await pool.query<{ rang: string; id: string; bloc: Bloc }>(`SELECT rang, id, bloc FROM ${s}.recon_evenement WHERE campagne_id = $1 ORDER BY rang LIMIT $2`, [campagne, limite]);
      return rows.map((r) => ({ rang: Number(r.rang), id: r.id, bloc: r.bloc }));
    },
    async acquitter(campagne, jusqua) { await pool.query(`DELETE FROM ${s}.recon_evenement WHERE campagne_id = $1 AND rang <= $2`, [campagne, jusqua]); },
    async purger(now = Date.now()) { await pool.query(`DELETE FROM ${s}.recon_campagne WHERE expire_le <= $1`, [new Date(now)]); },
  };
}
