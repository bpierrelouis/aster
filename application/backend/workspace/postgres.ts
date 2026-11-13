/* ==========================================================================
   Espace de travail · persistance PostgreSQL
   Les entités métier ont leurs tables (écoles, étages, salles, matériels,
   remontées et leurs matériels). Les données de supervision et
   d'administration sont conservées en JSONB dans une table commune.
   Les règles de droits (mergeState) s'appliquent avant toute écriture ;
   chaque écriture est une transaction qui verrouille la ligne de révision,
   ce qui permet à plusieurs serveurs de partager la même base.
   L'état des lieux PDF n'est pas conservé : il est produit à la demande
   (engine.ts).
   ========================================================================== */

import { SEED_VERSION } from '#shared/seed.ts';
import { collections, initialState, same } from './rules.ts';
import { keyOf } from './fusion.ts';
import { createEngine, JOURNAL_SIZE } from './engine.ts';
import { schemaSQL, TABLES } from './postgres-schema.ts';
import type { DatabaseError, Pool, PoolClient } from 'pg';
import type { CollectionName, DisplayPrefs, EcoleChoisie, Id, Item, Layout, PreferencesCompte, Timestamp, WorkspaceState } from '#shared/types.ts';
import type { LooseItem, Lists } from './rules.ts';
import type { Store } from './engine.ts';

/** Pool ou connexion d'une transaction */
type Db = Pick<Pool, 'query'>;

const toTs = (ms: Timestamp | null | undefined) => (ms == null ? null : new Date(ms).toISOString());
const fromTs = (date: Date | string | null | undefined) => (date == null ? null : new Date(date).getTime());

/* [colonne, type SQL, propriété, conversion vers SQL, conversion depuis SQL] */
const ts: [to: typeof toTs, from: typeof fromTs] = [toTs, fromTs];
type Column = [col: string, type: string, key: keyof LooseItem, to?: typeof toTs, from?: typeof fromTs];
interface Entity { collection: CollectionName; table: string; order: string; cols: Column[] }
const ENTITIES: Entity[] = [
  { collection: 'ecoles', table: 'orion_ecole', order: 'id', cols: [['id', 'text', 'id'], ['nom', 'text', 'nom']] },
  { collection: 'etages', table: 'orion_etage', order: 'ecole_id, batiment, niveau', cols: [['id', 'text', 'id'], ['ecole_id', 'text', 'ecoleId'], ['batiment', 'text', 'batiment'], ['niveau', 'integer', 'niveau']] },
  { collection: 'salles', table: 'orion_salle', order: 'ecole_id, batiment, nom', cols: [['id', 'text', 'id'], ['ecole_id', 'text', 'ecoleId'], ['batiment', 'text', 'batiment'], ['nom', 'text', 'nom'], ['etage', 'integer', 'etage']] },
  { collection: 'materiels', table: 'orion_materiel', order: 'id_orion', cols: [
    ['id', 'text', 'id'], ['ecole_id', 'text', 'ecoleId'], ['id_orion', 'text', 'idOrion'], ['salle_id', 'text', 'salleId'], ['type', 'text', 'type'],
    ['modele', 'text', 'modele'], ['marque', 'text', 'marque'], ['serie', 'text', 'serie'], ['date_reception', 'timestamptz', 'dateReception', ...ts],
    ['garantie_fin', 'timestamptz', 'garantieFin', ...ts], ['hors_service', 'boolean', 'hs'],
    ['date_hors_service', 'timestamptz', 'dateHs', ...ts],
  ] },
  { collection: 'comptes', table: 'orion_compte', order: 'nom, id', cols: [
    ['id', 'text', 'id'], ['nom', 'text', 'nom'], ['email', 'text', 'email'], ['role', 'text', 'role'], ['ecole_id', 'text', 'ecoleId'],
    ['actif', 'boolean', 'actif'], ['sujet', 'text', 'sujet'],
    ['derniere_connexion', 'timestamptz', 'derniereConnexion', ...ts], ['date_desactivation', 'timestamptz', 'dateDesactivation', ...ts],
  ] },
  { collection: 'remontees', table: 'orion_remontee', order: 'created_at DESC, id DESC', cols: [
    ['id', 'text', 'id'], ['ecole_id', 'text', 'ecoleId'], ['auteur', 'text', 'auteur'], ['created_at', 'timestamptz', 'createdAt', ...ts],
    ['probleme', 'text', 'probleme'], ['description', 'text', 'description'], ['statut', 'text', 'statut'], ['historique', 'jsonb', 'historique'], ['auteur_id', 'text', 'auteurId'],
  ] },
];
const ENTITY = new Map(ENTITIES.map((e) => [e.collection, e]));
const GENERIC = collections.filter((c) => !ENTITY.has(c));
const LINKED = new Set(['materielIds']); // propriétés portées par une table de liaison

/* ---------- Correspondance objets ⇄ lignes ---------- */

function toRecord(entity: Entity, item: LooseItem) {
  const record: Record<string, unknown> = {};
  const known = new Set<string>(entity.cols.map((c) => c[2]));
  for (const [col, , key, to] of entity.cols) record[col] = to ? to(item[key] as Timestamp | null | undefined) : item[key] ?? null;
  record.extra = Object.fromEntries(Object.entries(item).filter(([k]) => !known.has(k) && !LINKED.has(k)));
  return record;
}

/* Lignes lues en base */
type EntityRow = Record<string, unknown> & { extra: Record<string, unknown> };
type EspaceRow = { version_donnees: number; revision: number; initialise_le: Date };
type PreferenceRow = { compte_id: Id; affichage: DisplayPrefs | null; dispositions: Layout | null; consultation: Date | null; ecole_affichee: EcoleChoisie | null };

const OPTIONAL = new Set<string>(['sujet', 'auteurId', 'dateHs', 'derniereConnexion', 'dateDesactivation']); // propriétés absentes plutôt que nulles

function fromRow(entity: Entity, row: EntityRow) {
  const item: Record<string, unknown> = {};
  for (const [col, , key, , from] of entity.cols) {
    const value = from ? from(row[col] as Date | null) : row[col];
    if (value === null && OPTIONAL.has(key)) continue;
    item[key] = value;
  }
  return Object.assign(item, row.extra) as LooseItem; // ligne écrite par toRecord
}

const upsertSQL = (s: string, entity: Entity) => {
  const cols = [...entity.cols.map((c) => c[0]), 'extra'];
  const defs = [...entity.cols.map((c) => `${c[0]} ${c[1]}`), 'extra jsonb'];
  return `INSERT INTO ${s}.${entity.table} (${cols.join(', ')})
    SELECT ${cols.join(', ')} FROM jsonb_to_recordset($1::jsonb) AS x(${defs.join(', ')})
    ON CONFLICT (id) DO UPDATE SET ${cols.filter((c) => c !== 'id').map((c) => `${c} = EXCLUDED.${c}`).join(', ')}`;
};

async function upsertEntity(db: Db, s: string, entity: Entity, items: LooseItem[]) {
  if (!items.length) return;
  await db.query(upsertSQL(s, entity), [JSON.stringify(items.map((x) => toRecord(entity, x)))]);
  if (entity.collection === 'remontees') {
    const ids = items.map((r) => r.id);
    await db.query(`DELETE FROM ${s}.orion_remontee_materiel WHERE remontee_id = ANY($1::text[])`, [ids]);
    const links = items.flatMap((r) => (r.materielIds ?? []).map((materiel_id, rang) => ({ remontee_id: r.id, rang, materiel_id })));
    if (links.length) {
      await db.query(`INSERT INTO ${s}.orion_remontee_materiel (remontee_id, rang, materiel_id)
        SELECT remontee_id, rang, materiel_id FROM jsonb_to_recordset($1::jsonb) AS x(remontee_id text, rang integer, materiel_id text)`, [JSON.stringify(links)]);
    }
  }
}

async function upsertGeneric(db: Db, s: string, collection: CollectionName, items: LooseItem[]) {
  if (!items.length) return;
  await db.query(`INSERT INTO ${s}.orion_donnee (collection, id, ecole_id, data)
    SELECT $1, x->>'id', x->>'ecoleId', x FROM jsonb_array_elements($2::jsonb) AS x
    ON CONFLICT (collection, id) DO UPDATE SET ecole_id = EXCLUDED.ecole_id, data = EXCLUDED.data`, [collection, JSON.stringify(items)]);
}

async function writeMeta(db: Db, s: string, state: WorkspaceState) {
  await db.query(`INSERT INTO ${s}.orion_espace (id, version_donnees, revision, initialise_le) VALUES (1, $1, $2, $3)
    ON CONFLICT (id) DO UPDATE SET version_donnees = $1, revision = $2, initialise_le = $3`, [SEED_VERSION, state.revision, toTs(state.seededAt ?? Date.now())]);
}

/** Préférences par compte : seules celles qui ont changé sont écrites. */
async function writePreferences(db: Db, s: string, before: WorkspaceState, after: WorkspaceState) {
  const rows = Object.entries(after.preferences ?? {}).filter(([accountId, p]) => !same(p, before.preferences?.[accountId]))
    .map(([compte_id, p]) => ({ compte_id, affichage: p.prefs ?? null, dispositions: p.layouts ?? null, consultation: toTs(p.seenAt), ecole_affichee: p.ecoleId ?? null }));
  if (!rows.length) return;
  await db.query(`INSERT INTO ${s}.orion_preference (compte_id, affichage, dispositions, consultation, ecole_affichee)
    SELECT compte_id, affichage, dispositions, consultation, ecole_affichee FROM jsonb_to_recordset($1::jsonb)
      AS x(compte_id text, affichage jsonb, dispositions jsonb, consultation timestamptz, ecole_affichee text)
    ON CONFLICT (compte_id) DO UPDATE SET affichage = EXCLUDED.affichage, dispositions = EXCLUDED.dispositions, consultation = EXCLUDED.consultation, ecole_affichee = EXCLUDED.ecole_affichee`, [JSON.stringify(rows)]);
}

/** Écrit les différences entre deux états, des parents vers les enfants puis l'inverse pour les suppressions. */
async function writeDiff(db: Db, s: string, before: Partial<Lists>, after: Partial<Lists>) {
  const plan = collections.map((collection) => {
    const old = new Map<Id, LooseItem>((before[collection] ?? []).map((x) => [x.id, x]));
    const ids = new Set((after[collection] ?? []).map((x) => x.id));
    return {
      collection,
      upserts: (after[collection] ?? []).filter((x) => !same(x, old.get(x.id))),
      deletes: [...old.keys()].filter((id) => !ids.has(id)),
    };
  });
  const byName = new Map(plan.map((p) => [p.collection, p]));
  for (const entity of ENTITIES) await upsertEntity(db, s, entity, byName.get(entity.collection)!.upserts);
  for (const c of GENERIC) await upsertGeneric(db, s, c, byName.get(c)!.upserts);
  for (const c of GENERIC) {
    const { deletes } = byName.get(c)!;
    if (deletes.length) await db.query(`DELETE FROM ${s}.orion_donnee WHERE collection = $1 AND id = ANY($2::text[])`, [c, deletes]);
  }
  for (const entity of [...ENTITIES].reverse()) {
    const { deletes } = byName.get(entity.collection)!;
    if (deletes.length) await db.query(`DELETE FROM ${s}.${entity.table} WHERE id = ANY($1::text[])`, [deletes]);
  }
}

async function loadState(db: Db, s: string) {
  const meta = (await db.query<EspaceRow>(`SELECT * FROM ${s}.orion_espace WHERE id = 1`)).rows[0];
  if (!meta) return null;
  const state: Omit<WorkspaceState, CollectionName> & Partial<Lists> = { version: meta.version_donnees, revision: meta.revision, seededAt: fromTs(meta.initialise_le), preferences: {} };
  for (const row of (await db.query<PreferenceRow>(`SELECT * FROM ${s}.orion_preference`)).rows) {
    const p: PreferencesCompte = {};
    if (row.affichage) p.prefs = row.affichage;
    if (row.dispositions) p.layouts = row.dispositions;
    if (row.consultation) p.seenAt = fromTs(row.consultation)!;
    if (row.ecole_affichee) p.ecoleId = row.ecole_affichee;
    state.preferences[row.compte_id] = p;
  }
  for (const entity of ENTITIES) {
    const { rows } = await db.query<EntityRow>(`SELECT * FROM ${s}.${entity.table} ORDER BY ${entity.order}`);
    state[entity.collection] = rows.map((row) => fromRow(entity, row));
  }
  const links = (await db.query<{ remontee_id: Id; materiel_id: Id }>(`SELECT remontee_id, materiel_id FROM ${s}.orion_remontee_materiel ORDER BY remontee_id, rang`)).rows;
  const byReport = new Map<Id, Id[]>();
  for (const l of links) (byReport.get(l.remontee_id) ?? byReport.set(l.remontee_id, []).get(l.remontee_id)!).push(l.materiel_id);
  for (const r of state.remontees!) r.materielIds = byReport.get(r.id) ?? [];
  for (const c of GENERIC) state[c] = [];
  for (const row of (await db.query<{ collection: CollectionName; data: LooseItem }>(`SELECT collection, data FROM ${s}.orion_donnee ORDER BY rang`)).rows) state[row.collection]?.push(row.data);
  return { state: state as WorkspaceState }; // toutes les collections lues
}

async function transaction<R>(pool: Pool, fn: (client: PoolClient) => Promise<R>, begin = 'BEGIN') {
  const client = await pool.connect();
  try {
    await client.query(begin);
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally { client.release(); }
}

/**
 * Dépôt de l'espace de travail sur PostgreSQL. schema permet d'isoler les tests.
 * Sans état propre : plusieurs serveurs peuvent ouvrir le même schéma. Chaque écriture verrouille
 * la ligne de révision ; la copie de l'état gardée par un serveur n'est réutilisée que si la base
 * porte toujours sa révision.
 */
export async function createPostgresWorkspaceRepository({ pool, schema = 'public', seedReset = true }: { pool: Pool; schema?: string; seedReset?: boolean }) {
  if (!/^[a-z_][a-z0-9_]*$/.test(schema)) throw new Error('Nom de schéma invalide.');
  const s = schema;

  // Initialisation sous verrou consultatif : un seul serveur crée le schéma et le jeu de départ
  const init = await pool.connect();
  try {
    await init.query('SELECT pg_advisory_lock(hashtext($1))', [`orion:${s}`]);
    await init.query(schemaSQL(s));
    // Évolutions de schéma des versions précédentes du démonstrateur
    await init.query(`ALTER TABLE ${s}.orion_espace DROP COLUMN IF EXISTS ecole_affichee, DROP COLUMN IF EXISTS preferences, DROP COLUMN IF EXISTS dispositions, DROP COLUMN IF EXISTS consultations;
      ALTER TABLE ${s}.orion_remontee ADD COLUMN IF NOT EXISTS auteur_id text, DROP COLUMN IF EXISTS etat_des_lieux_cle`);
    const loaded = await loadState(init, s);
    if (loaded && loaded.state.version !== SEED_VERSION && !seedReset) {
      throw new Error(`Données en version ${loaded.state.version}, version ${SEED_VERSION} attendue : réinitialisation refusée (SEED_RESET=true pour l'autoriser).`);
    }
    if (!loaded || loaded.state.version !== SEED_VERSION) {
      // Premier démarrage ou jeu de données d'une version antérieure : initialisation complète
      const initial = initialState();
      await init.query('BEGIN');
      try {
        await init.query(`TRUNCATE ${TABLES(s)} RESTART IDENTITY`);
        await writeDiff(init, s, Object.fromEntries(collections.map((c) => [c, []])), initial);
        await writeMeta(init, s, initial);
        await init.query('COMMIT');
      } catch (error) { await init.query('ROLLBACK').catch(() => {}); throw error; }
    }
  } finally {
    await init.query('SELECT pg_advisory_unlock(hashtext($1))', [`orion:${s}`]).catch(() => {});
    init.release();
  }

  // Copie de l'état gardée par ce serveur, valable tant que la base porte la même révision
  let cache: { state: WorkspaceState } | null = null;
  async function current(db: Db, lock = false) {
    const row = (await db.query<{ revision: number }>(`SELECT revision FROM ${s}.orion_espace WHERE id = 1${lock ? ' FOR UPDATE' : ''}`)).rows[0];
    if (cache && row && cache.state.revision === row.revision) return cache;
    const loaded = (await loadState(db, s))!;
    if (!cache || loaded.state.revision >= cache.state.revision) cache = loaded;
    return loaded;
  }
  // Journal : [collection, identifiant, valeur avant modification] ; une valeur absente est enregistrée comme nulle
  const since = (db: Db) => async (base: number) => (await db.query<{ revision: number; cles: [CollectionName, Id, Item | null][] }>(`SELECT revision, cles FROM ${s}.orion_journal WHERE revision > $1 ORDER BY revision`, [base])).rows
    .map((row) => ({ revision: row.revision, before: new Map<string, Item | undefined>(row.cles.map(([c, itemId, v]) => [keyOf(c, itemId), v ?? undefined])) }));

  const store: Store = {
    // Lecture dans un instantané unique : une écriture concurrente ne peut pas produire un état mélangé
    read: async () => (await transaction(pool, (db) => current(db), 'BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY')).state,
    async write(change) {
      let done;
      try {
        done = await transaction(pool, async (db) => {
          const { state: before } = await current(db, true);
          const out = await change(before, since(db));
          const next = out.next;
          await writeDiff(db, s, before, next);
          await writePreferences(db, s, before, next);
          await writeMeta(db, s, next);
          await db.query(`INSERT INTO ${s}.orion_journal (revision, cles) VALUES ($1, $2::json)`, [out.entry.revision, JSON.stringify([...out.entry.before].map(([k, v]) => [...k.split('\u0000'), v ?? null]))]);
          await db.query(`DELETE FROM ${s}.orion_journal WHERE revision <= $1`, [out.entry.revision - JOURNAL_SIZE]);
          return { before, next, result: out.result };
        });
      } catch (error) {
        if (String((error as DatabaseError).code).startsWith('23')) throw Object.assign(new Error('Données invalides.'), { status: 400, cause: error }); // contrainte de la base
        throw error;
      }
      if (!cache || done.next.revision > cache.state.revision) cache = { state: done.next };
      return done;
    },
  };

  return createEngine({ store });
}
