/* ==========================================================================
   Espace de travail · persistance PostgreSQL et archivage S3
   Les entités métier ont leurs tables (écoles, étages, salles, matériels,
   remontées et leurs matériels). Les données de supervision et
   d'administration sont conservées en JSONB dans une table commune.
   Les règles de droits (mergeState) s'appliquent avant toute écriture ;
   chaque écriture est une transaction contrôlée par numéro de révision.
   L'état des lieux PDF est produit à la transmission et déposé dans S3.
   ========================================================================== */

import { SEED_VERSION } from '../frontend/workspace/core/seed.js';
import { collections, createEngine, initialState } from './workspace.js';
import { reportPdf } from './workspace-pdf.js';

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const toTs = (ms) => (ms == null ? null : new Date(ms).toISOString());
const fromTs = (date) => (date == null ? null : new Date(date).getTime());

/* [colonne, type SQL, propriété, conversion vers SQL, conversion depuis SQL] */
const ts = [toTs, fromTs];
const ENTITIES = [
  { collection: 'ecoles', table: 'aster_ecole', order: 'id', cols: [['id', 'text', 'id'], ['nom', 'text', 'nom']] },
  { collection: 'etages', table: 'aster_etage', order: 'ecole_id, batiment, niveau', cols: [['id', 'text', 'id'], ['ecole_id', 'text', 'ecoleId'], ['batiment', 'text', 'batiment'], ['niveau', 'integer', 'niveau']] },
  { collection: 'salles', table: 'aster_salle', order: 'ecole_id, batiment, nom', cols: [['id', 'text', 'id'], ['ecole_id', 'text', 'ecoleId'], ['batiment', 'text', 'batiment'], ['nom', 'text', 'nom'], ['etage', 'integer', 'etage']] },
  { collection: 'materiels', table: 'aster_materiel', order: 'id_aster', cols: [
    ['id', 'text', 'id'], ['ecole_id', 'text', 'ecoleId'], ['id_aster', 'text', 'idAster'], ['salle_id', 'text', 'salleId'], ['type', 'text', 'type'],
    ['modele', 'text', 'modele'], ['marque', 'text', 'marque'], ['serie', 'text', 'serie'], ['date_reception', 'timestamptz', 'dateReception', ...ts],
    ['garantie_fin', 'timestamptz', 'garantieFin', ...ts], ['hors_service', 'boolean', 'hs'],
  ] },
  { collection: 'comptes', table: 'aster_compte', order: 'nom, id', cols: [
    ['id', 'text', 'id'], ['nom', 'text', 'nom'], ['email', 'text', 'email'], ['role', 'text', 'role'], ['ecole_id', 'text', 'ecoleId'],
    ['actif', 'boolean', 'actif'], ['sujet', 'text', 'sujet'],
  ] },
  { collection: 'remontees', table: 'aster_remontee', order: 'created_at DESC, id DESC', cols: [
    ['id', 'text', 'id'], ['ecole_id', 'text', 'ecoleId'], ['auteur', 'text', 'auteur'], ['created_at', 'timestamptz', 'createdAt', ...ts],
    ['probleme', 'text', 'probleme'], ['description', 'text', 'description'], ['statut', 'text', 'statut'], ['historique', 'jsonb', 'historique'], ['auteur_id', 'text', 'auteurId'],
  ] },
];
const ENTITY = new Map(ENTITIES.map((e) => [e.collection, e]));
const GENERIC = collections.filter((c) => !ENTITY.has(c));
const LINKED = new Set(['materielIds']); // propriétés portées par une table de liaison

function schemaSQL(s) {
  const fk = (table) => `REFERENCES ${s}.${table}(id) DEFERRABLE INITIALLY DEFERRED`;
  return `
  CREATE SCHEMA IF NOT EXISTS ${s};
  CREATE TABLE IF NOT EXISTS ${s}.aster_espace (
    id smallint PRIMARY KEY CHECK (id = 1), version_donnees integer NOT NULL, revision integer NOT NULL, initialise_le timestamptz NOT NULL);
  CREATE TABLE IF NOT EXISTS ${s}.aster_ecole (id text PRIMARY KEY, nom text NOT NULL CHECK (nom <> ''), extra jsonb NOT NULL DEFAULT '{}');
  CREATE TABLE IF NOT EXISTS ${s}.aster_etage (
    id text PRIMARY KEY, ecole_id text NOT NULL ${fk('aster_ecole')}, batiment text NOT NULL CHECK (batiment <> ''),
    niveau integer NOT NULL CHECK (niveau BETWEEN -5 AND 30), extra jsonb NOT NULL DEFAULT '{}',
    CONSTRAINT aster_etage_unique UNIQUE (ecole_id, batiment, niveau) DEFERRABLE INITIALLY DEFERRED);
  CREATE TABLE IF NOT EXISTS ${s}.aster_salle (
    id text PRIMARY KEY, ecole_id text NOT NULL ${fk('aster_ecole')}, batiment text NOT NULL CHECK (batiment <> ''),
    nom text NOT NULL CHECK (nom <> ''), etage integer CHECK (etage BETWEEN -5 AND 30), extra jsonb NOT NULL DEFAULT '{}');
  CREATE TABLE IF NOT EXISTS ${s}.aster_materiel (
    id text PRIMARY KEY, ecole_id text NOT NULL ${fk('aster_ecole')}, id_aster text NOT NULL,
    salle_id text ${fk('aster_salle')}, type text NOT NULL, modele text NOT NULL CHECK (modele <> ''), marque text, serie text,
    date_reception timestamptz NOT NULL, garantie_fin timestamptz, hors_service boolean NOT NULL, extra jsonb NOT NULL DEFAULT '{}',
    CONSTRAINT aster_materiel_id_aster_unique UNIQUE (id_aster) DEFERRABLE INITIALLY DEFERRED);
  CREATE INDEX IF NOT EXISTS aster_materiel_ecole ON ${s}.aster_materiel (ecole_id);
  CREATE INDEX IF NOT EXISTS aster_materiel_salle ON ${s}.aster_materiel (salle_id);
  -- Compte ASTER : profil et école ; le sujet relie le compte à l'identité du fournisseur
  CREATE TABLE IF NOT EXISTS ${s}.aster_compte (
    id text PRIMARY KEY, nom text NOT NULL CHECK (nom <> ''), email text NOT NULL CHECK (email = lower(email)),
    role text NOT NULL CHECK (role IN ('superadmin', 'admin', 'gestionnaire', 'formateur')), ecole_id text ${fk('aster_ecole')},
    actif boolean NOT NULL, sujet text, extra jsonb NOT NULL DEFAULT '{}',
    CHECK ((role = 'superadmin') = (ecole_id IS NULL)),
    CONSTRAINT aster_compte_email_unique UNIQUE (email) DEFERRABLE INITIALLY DEFERRED,
    CONSTRAINT aster_compte_sujet_unique UNIQUE (sujet) DEFERRABLE INITIALLY DEFERRED);
  CREATE TABLE IF NOT EXISTS ${s}.aster_preference (
    compte_id text PRIMARY KEY REFERENCES ${s}.aster_compte(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    affichage jsonb, dispositions jsonb, consultation timestamptz, ecole_affichee text);
  CREATE TABLE IF NOT EXISTS ${s}.aster_remontee (
    id text PRIMARY KEY, ecole_id text NOT NULL ${fk('aster_ecole')}, auteur text NOT NULL, created_at timestamptz NOT NULL,
    probleme text, description text NOT NULL CHECK (description <> ''), statut text NOT NULL CHECK (statut IN ('attente', 'remplace', 'corrige')),
    historique jsonb NOT NULL DEFAULT '[]', auteur_id text ${fk('aster_compte')}, etat_des_lieux_cle text, extra jsonb NOT NULL DEFAULT '{}');
  CREATE INDEX IF NOT EXISTS aster_remontee_ecole ON ${s}.aster_remontee (ecole_id, statut);
  -- Pas de clé étrangère vers le matériel : une remontée reste consultable après la suppression du matériel.
  CREATE TABLE IF NOT EXISTS ${s}.aster_remontee_materiel (
    remontee_id text NOT NULL REFERENCES ${s}.aster_remontee(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    rang integer NOT NULL, materiel_id text NOT NULL, PRIMARY KEY (remontee_id, rang));
  CREATE TABLE IF NOT EXISTS ${s}.aster_donnee (
    collection text NOT NULL, id text NOT NULL, ecole_id text, data jsonb NOT NULL,
    rang bigint GENERATED ALWAYS AS IDENTITY, PRIMARY KEY (collection, id));`;
}

/* ---------- Correspondance objets ⇄ lignes ---------- */

function toRecord(entity, item) {
  const record = {};
  const known = new Set(entity.cols.map((c) => c[2]));
  for (const [col, , key, to] of entity.cols) record[col] = to ? to(item[key]) : item[key] ?? null;
  record.extra = Object.fromEntries(Object.entries(item).filter(([k]) => !known.has(k) && !LINKED.has(k)));
  return record;
}

const OPTIONAL = new Set(['sujet', 'auteurId']); // propriétés absentes plutôt que nulles

function fromRow(entity, row) {
  const item = {};
  for (const [col, , key, , from] of entity.cols) {
    const value = from ? from(row[col]) : row[col];
    if (value === null && OPTIONAL.has(key)) continue;
    item[key] = value;
  }
  return Object.assign(item, row.extra);
}

const upsertSQL = (s, entity) => {
  const cols = [...entity.cols.map((c) => c[0]), 'extra'];
  const defs = [...entity.cols.map((c) => `${c[0]} ${c[1]}`), 'extra jsonb'];
  return `INSERT INTO ${s}.${entity.table} (${cols.join(', ')})
    SELECT ${cols.join(', ')} FROM jsonb_to_recordset($1::jsonb) AS x(${defs.join(', ')})
    ON CONFLICT (id) DO UPDATE SET ${cols.filter((c) => c !== 'id').map((c) => `${c} = EXCLUDED.${c}`).join(', ')}`;
};

async function upsertEntity(db, s, entity, items) {
  if (!items.length) return;
  await db.query(upsertSQL(s, entity), [JSON.stringify(items.map((x) => toRecord(entity, x)))]);
  if (entity.collection === 'remontees') {
    const ids = items.map((r) => r.id);
    await db.query(`DELETE FROM ${s}.aster_remontee_materiel WHERE remontee_id = ANY($1::text[])`, [ids]);
    const links = items.flatMap((r) => (r.materielIds ?? []).map((materiel_id, rang) => ({ remontee_id: r.id, rang, materiel_id })));
    if (links.length) {
      await db.query(`INSERT INTO ${s}.aster_remontee_materiel (remontee_id, rang, materiel_id)
        SELECT remontee_id, rang, materiel_id FROM jsonb_to_recordset($1::jsonb) AS x(remontee_id text, rang integer, materiel_id text)`, [JSON.stringify(links)]);
    }
  }
}

async function upsertGeneric(db, s, collection, items) {
  if (!items.length) return;
  await db.query(`INSERT INTO ${s}.aster_donnee (collection, id, ecole_id, data)
    SELECT $1, x->>'id', x->>'ecoleId', x FROM jsonb_array_elements($2::jsonb) AS x
    ON CONFLICT (collection, id) DO UPDATE SET ecole_id = EXCLUDED.ecole_id, data = EXCLUDED.data`, [collection, JSON.stringify(items)]);
}

async function writeMeta(db, s, state) {
  await db.query(`INSERT INTO ${s}.aster_espace (id, version_donnees, revision, initialise_le) VALUES (1, $1, $2, $3)
    ON CONFLICT (id) DO UPDATE SET version_donnees = $1, revision = $2, initialise_le = $3`, [SEED_VERSION, state.revision, toTs(state.seededAt ?? Date.now())]);
}

/** Préférences par compte : seules celles qui ont changé sont écrites. */
async function writePreferences(db, s, before, after) {
  const rows = Object.entries(after.preferences ?? {}).filter(([accountId, p]) => !same(p, before.preferences?.[accountId]))
    .map(([compte_id, p]) => ({ compte_id, affichage: p.prefs ?? null, dispositions: p.layouts ?? null, consultation: toTs(p.seenAt), ecole_affichee: p.ecoleId ?? null }));
  if (!rows.length) return;
  await db.query(`INSERT INTO ${s}.aster_preference (compte_id, affichage, dispositions, consultation, ecole_affichee)
    SELECT compte_id, affichage, dispositions, consultation, ecole_affichee FROM jsonb_to_recordset($1::jsonb)
      AS x(compte_id text, affichage jsonb, dispositions jsonb, consultation timestamptz, ecole_affichee text)
    ON CONFLICT (compte_id) DO UPDATE SET affichage = EXCLUDED.affichage, dispositions = EXCLUDED.dispositions, consultation = EXCLUDED.consultation, ecole_affichee = EXCLUDED.ecole_affichee`, [JSON.stringify(rows)]);
}

/** Écrit les différences entre deux états, des parents vers les enfants puis l'inverse pour les suppressions. */
async function writeDiff(db, s, before, after) {
  const plan = collections.map((collection) => {
    const old = new Map((before[collection] ?? []).map((x) => [x.id, x]));
    const ids = new Set((after[collection] ?? []).map((x) => x.id));
    return {
      collection,
      upserts: (after[collection] ?? []).filter((x) => !same(x, old.get(x.id))),
      deletes: [...old.keys()].filter((id) => !ids.has(id)),
    };
  });
  const byName = new Map(plan.map((p) => [p.collection, p]));
  for (const entity of ENTITIES) await upsertEntity(db, s, entity, byName.get(entity.collection).upserts);
  for (const c of GENERIC) await upsertGeneric(db, s, c, byName.get(c).upserts);
  for (const c of GENERIC) {
    const { deletes } = byName.get(c);
    if (deletes.length) await db.query(`DELETE FROM ${s}.aster_donnee WHERE collection = $1 AND id = ANY($2::text[])`, [c, deletes]);
  }
  for (const entity of [...ENTITIES].reverse()) {
    const { deletes } = byName.get(entity.collection);
    if (deletes.length) await db.query(`DELETE FROM ${s}.${entity.table} WHERE id = ANY($1::text[])`, [deletes]);
  }
}

async function loadState(db, s) {
  const meta = (await db.query(`SELECT * FROM ${s}.aster_espace WHERE id = 1`)).rows[0];
  if (!meta) return null;
  const state = { version: meta.version_donnees, revision: meta.revision, rev: meta.revision, seededAt: fromTs(meta.initialise_le), preferences: {} };
  for (const row of (await db.query(`SELECT * FROM ${s}.aster_preference`)).rows) {
    const p = {};
    if (row.affichage) p.prefs = row.affichage;
    if (row.dispositions) p.layouts = row.dispositions;
    if (row.consultation) p.seenAt = fromTs(row.consultation);
    if (row.ecole_affichee) p.ecoleId = row.ecole_affichee;
    state.preferences[row.compte_id] = p;
  }
  const pdfKeys = new Map();
  for (const entity of ENTITIES) {
    const { rows } = await db.query(`SELECT * FROM ${s}.${entity.table} ORDER BY ${entity.order}`);
    state[entity.collection] = rows.map((row) => fromRow(entity, row));
    if (entity.collection === 'remontees') for (const row of rows) if (row.etat_des_lieux_cle) pdfKeys.set(row.id, row.etat_des_lieux_cle);
  }
  const links = (await db.query(`SELECT remontee_id, materiel_id FROM ${s}.aster_remontee_materiel ORDER BY remontee_id, rang`)).rows;
  const byReport = new Map();
  for (const l of links) (byReport.get(l.remontee_id) ?? byReport.set(l.remontee_id, []).get(l.remontee_id)).push(l.materiel_id);
  for (const r of state.remontees) r.materielIds = byReport.get(r.id) ?? [];
  for (const c of GENERIC) state[c] = [];
  for (const row of (await db.query(`SELECT collection, data FROM ${s}.aster_donnee ORDER BY rang`)).rows) state[row.collection]?.push(row.data);
  return { state, pdfKeys };
}

async function transaction(pool, fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally { client.release(); }
}

const reportKey = (r) => `etats-des-lieux/${r.ecoleId}/${r.id}.pdf`;
const TABLES = (s) => `${s}.aster_preference, ${s}.aster_remontee_materiel, ${s}.aster_remontee, ${s}.aster_materiel, ${s}.aster_salle, ${s}.aster_etage, ${s}.aster_compte, ${s}.aster_ecole, ${s}.aster_donnee`;

/**
 * Dépôt de l'espace de travail sur PostgreSQL. schema permet d'isoler les tests.
 * storage : { put(key, buffer), get(key) } (S3 ou mémoire).
 */
export async function createPostgresWorkspaceRepository({ pool, storage, schema = 'public', log = console }) {
  if (!/^[a-z_][a-z0-9_]*$/.test(schema)) throw new Error('Nom de schéma invalide.');
  const s = schema;
  await pool.query(schemaSQL(s));
  // Évolutions de schéma des versions précédentes du démonstrateur
  await pool.query(`ALTER TABLE ${s}.aster_espace DROP COLUMN IF EXISTS ecole_affichee, DROP COLUMN IF EXISTS preferences, DROP COLUMN IF EXISTS dispositions, DROP COLUMN IF EXISTS consultations;
    ALTER TABLE ${s}.aster_remontee ADD COLUMN IF NOT EXISTS auteur_id text`);

  let loaded = await loadState(pool, s);
  if (!loaded || loaded.state.version !== SEED_VERSION) {
    // Premier démarrage ou jeu de données d'une version antérieure : initialisation complète
    const initial = initialState();
    await transaction(pool, async (db) => {
      await db.query(`TRUNCATE ${TABLES(s)} RESTART IDENTITY`);
      await writeDiff(db, s, Object.fromEntries(collections.map((c) => [c, []])), initial);
      await writeMeta(db, s, initial);
    });
    loaded = await loadState(pool, s);
    // États des lieux des remontées existantes, déposés une fois
    const keys = [];
    for (const r of loaded.state.remontees) {
      try { await storage.put(reportKey(r), reportPdf(r, loaded.state)); keys.push({ id: r.id, key: reportKey(r) }); }
      catch (error) { log.error?.('Dépôt S3 impossible :', error.name || error.message); break; }
    }
    if (keys.length) {
      await pool.query(`UPDATE ${s}.aster_remontee r SET etat_des_lieux_cle = x.key FROM jsonb_to_recordset($1::jsonb) AS x(id text, key text) WHERE r.id = x.id`, [JSON.stringify(keys)]);
      for (const { id, key } of keys) loaded.pdfKeys.set(id, key);
    }
  }
  const { pdfKeys } = loaded;

  async function storePdf(report, source) {
    const key = reportKey(report);
    await storage.put(key, reportPdf(report, source));
    return key;
  }

  return createEngine({
    state: loaded.state,
    async persist(before, after) {
      // État des lieux produit à la transmission, avec les informations de cet instant
      const known = new Set(before.remontees.map((r) => r.id));
      const keys = [];
      for (const r of after.remontees.filter((x) => !known.has(x.id))) {
        try { keys.push({ id: r.id, key: await storePdf(r, after) }); } catch (error) { log.error?.('Dépôt S3 impossible :', error.name || error.message); }
      }
      try {
        await transaction(pool, async (db) => {
          const current = (await db.query(`SELECT revision FROM ${s}.aster_espace WHERE id = 1 FOR UPDATE`)).rows[0];
          if (current?.revision !== before.revision) throw Object.assign(new Error('Les données ont changé. Rechargez la page avant de réessayer.'), { status: 409 });
          await writeDiff(db, s, before, after);
          await writePreferences(db, s, before, after);
          for (const { id, key } of keys) await db.query(`UPDATE ${s}.aster_remontee SET etat_des_lieux_cle = $2 WHERE id = $1`, [id, key]);
          await writeMeta(db, s, after);
        });
      } catch (error) {
        if (String(error.code).startsWith('23')) throw Object.assign(new Error('Données invalides.'), { status: 400, cause: error }); // contrainte de la base
        throw error;
      }
      for (const { id, key } of keys) pdfKeys.set(id, key);
    },
    async pdf(report, state) {
      const key = pdfKeys.get(report.id);
      if (key) {
        try { return await storage.get(key); } catch (error) { log.error?.('Lecture S3 impossible :', error.name || error.message); }
      }
      // Repli : document produit avec les informations actuelles, puis déposé s'il manquait
      const buffer = reportPdf(report, state);
      if (!key) {
        try {
          const stored = await storePdf(report, state);
          await pool.query(`UPDATE ${s}.aster_remontee SET etat_des_lieux_cle = $2 WHERE id = $1`, [report.id, stored]);
          pdfKeys.set(report.id, stored);
        } catch (error) { log.error?.('Dépôt S3 impossible :', error.name || error.message); }
      }
      return buffer;
    },
  });
}
