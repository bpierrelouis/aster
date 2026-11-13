/* ==========================================================================
   Espace de travail · schéma PostgreSQL (tables, contraintes, index) et liste
   des tables réinitialisées avec le jeu de départ (postgres.ts).
   ========================================================================== */

import { REMONTEE_STATUTS, ROLES } from '#shared/catalog.ts';

/** Tables vidées ensemble à la réinitialisation du jeu de départ */
export const TABLES = (s: string) => `${s}.orion_preference, ${s}.orion_remontee_materiel, ${s}.orion_remontee, ${s}.orion_materiel, ${s}.orion_salle, ${s}.orion_etage, ${s}.orion_compte, ${s}.orion_ecole, ${s}.orion_donnee, ${s}.orion_journal`;

/** Création du schéma, rejouable à chaque démarrage */
export function schemaSQL(s: string) {
  const fk = (table: string) => `REFERENCES ${s}.${table}(id) DEFERRABLE INITIALLY DEFERRED`;
  const statuts = REMONTEE_STATUTS.map((x) => `'${x.id}'`).join(', ');
  const roles = ROLES.map((x) => `'${x.id}'`).join(', ');
  return `
  CREATE SCHEMA IF NOT EXISTS ${s};
  CREATE TABLE IF NOT EXISTS ${s}.orion_espace (
    id smallint PRIMARY KEY CHECK (id = 1), version_donnees integer NOT NULL, revision integer NOT NULL, initialise_le timestamptz NOT NULL);
  CREATE TABLE IF NOT EXISTS ${s}.orion_ecole (id text PRIMARY KEY, nom text NOT NULL CHECK (nom <> ''), extra jsonb NOT NULL DEFAULT '{}');
  CREATE TABLE IF NOT EXISTS ${s}.orion_etage (
    id text PRIMARY KEY, ecole_id text NOT NULL ${fk('orion_ecole')}, batiment text NOT NULL CHECK (batiment <> ''),
    niveau integer NOT NULL CHECK (niveau BETWEEN -5 AND 30), extra jsonb NOT NULL DEFAULT '{}',
    CONSTRAINT orion_etage_unique UNIQUE (ecole_id, batiment, niveau) DEFERRABLE INITIALLY DEFERRED);
  CREATE TABLE IF NOT EXISTS ${s}.orion_salle (
    id text PRIMARY KEY, ecole_id text NOT NULL ${fk('orion_ecole')}, batiment text NOT NULL CHECK (batiment <> ''),
    nom text NOT NULL CHECK (nom <> ''), etage integer CHECK (etage BETWEEN -5 AND 30), extra jsonb NOT NULL DEFAULT '{}');
  CREATE TABLE IF NOT EXISTS ${s}.orion_materiel (
    id text PRIMARY KEY, ecole_id text NOT NULL ${fk('orion_ecole')}, id_orion text NOT NULL,
    salle_id text ${fk('orion_salle')}, type text NOT NULL, modele text NOT NULL CHECK (modele <> ''), marque text, serie text,
    date_reception timestamptz NOT NULL, garantie_fin timestamptz, hors_service boolean NOT NULL, extra jsonb NOT NULL DEFAULT '{}',
    CONSTRAINT orion_materiel_id_orion_unique UNIQUE (id_orion) DEFERRABLE INITIALLY DEFERRED);
  CREATE INDEX IF NOT EXISTS orion_materiel_ecole ON ${s}.orion_materiel (ecole_id);
  CREATE INDEX IF NOT EXISTS orion_materiel_salle ON ${s}.orion_materiel (salle_id);
  -- Compte ORION : profil et école ; le sujet relie le compte à l'identité du fournisseur
  CREATE TABLE IF NOT EXISTS ${s}.orion_compte (
    id text PRIMARY KEY, nom text NOT NULL CHECK (nom <> ''), email text NOT NULL CHECK (email = lower(email)),
    role text NOT NULL CHECK (role IN (${roles})), ecole_id text ${fk('orion_ecole')},
    actif boolean NOT NULL, sujet text, extra jsonb NOT NULL DEFAULT '{}',
    CHECK ((role = 'superadmin') = (ecole_id IS NULL)),
    CONSTRAINT orion_compte_email_unique UNIQUE (email) DEFERRABLE INITIALLY DEFERRED,
    CONSTRAINT orion_compte_sujet_unique UNIQUE (sujet) DEFERRABLE INITIALLY DEFERRED);
  CREATE TABLE IF NOT EXISTS ${s}.orion_preference (
    compte_id text PRIMARY KEY REFERENCES ${s}.orion_compte(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    affichage jsonb, dispositions jsonb, consultation timestamptz, ecole_affichee text);
  CREATE TABLE IF NOT EXISTS ${s}.orion_remontee (
    id text PRIMARY KEY, ecole_id text NOT NULL ${fk('orion_ecole')}, auteur text NOT NULL, created_at timestamptz NOT NULL,
    probleme text, description text NOT NULL CHECK (description <> ''), statut text NOT NULL,
    historique jsonb NOT NULL DEFAULT '[]', auteur_id text ${fk('orion_compte')}, extra jsonb NOT NULL DEFAULT '{}');
  -- Statuts du catalogue, contrainte recréée à chaque démarrage : une base existante suit le catalogue.
  -- NOT VALID : les lignes d'un jeu de données antérieur, réinitialisé ensuite (SEED_VERSION), n'empêchent pas le démarrage.
  ALTER TABLE ${s}.orion_remontee DROP CONSTRAINT IF EXISTS orion_remontee_statut_check;
  ALTER TABLE ${s}.orion_remontee ADD CONSTRAINT orion_remontee_statut_check CHECK (statut IN (${statuts})) NOT VALID;
  CREATE INDEX IF NOT EXISTS orion_remontee_ecole ON ${s}.orion_remontee (ecole_id, statut);
  -- Pas de clé étrangère vers le matériel : une remontée reste consultable après la suppression du matériel.
  CREATE TABLE IF NOT EXISTS ${s}.orion_remontee_materiel (
    remontee_id text NOT NULL REFERENCES ${s}.orion_remontee(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    rang integer NOT NULL, materiel_id text NOT NULL, PRIMARY KEY (remontee_id, rang));
  CREATE TABLE IF NOT EXISTS ${s}.orion_donnee (
    collection text NOT NULL, id text NOT NULL, ecole_id text, data jsonb NOT NULL,
    rang bigint GENERATED ALWAYS AS IDENTITY, PRIMARY KEY (collection, id));
  -- Journal des dernières modifications : permet à tout serveur de fusionner les écritures concurrentes.
  CREATE TABLE IF NOT EXISTS ${s}.orion_journal (revision integer PRIMARY KEY, cles json NOT NULL);`;
}
