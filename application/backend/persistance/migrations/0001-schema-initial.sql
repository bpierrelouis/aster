-- Schéma initial de l'espace de travail : tables, contraintes et index.
-- Rejouable sur une base créée avant les migrations (IF NOT EXISTS, colonnes ajoutées ou retirées) ;
-- les migrations suivantes supposent ce schéma en place.

CREATE TABLE IF NOT EXISTS orion_espace (
  id smallint PRIMARY KEY CHECK (id = 1), version_donnees integer NOT NULL, revision integer NOT NULL, initialise_le timestamptz NOT NULL);
ALTER TABLE orion_espace DROP COLUMN IF EXISTS ecole_affichee, DROP COLUMN IF EXISTS preferences,
  DROP COLUMN IF EXISTS dispositions, DROP COLUMN IF EXISTS consultations;

CREATE TABLE IF NOT EXISTS orion_ecole (id text PRIMARY KEY, nom text NOT NULL CHECK (nom <> ''), extra jsonb NOT NULL DEFAULT '{}');

CREATE TABLE IF NOT EXISTS orion_etage (
  id text PRIMARY KEY, ecole_id text NOT NULL REFERENCES orion_ecole(id) DEFERRABLE INITIALLY DEFERRED,
  batiment text NOT NULL CHECK (batiment <> ''), niveau integer NOT NULL CHECK (niveau BETWEEN -5 AND 30), extra jsonb NOT NULL DEFAULT '{}',
  CONSTRAINT orion_etage_unique UNIQUE (ecole_id, batiment, niveau) DEFERRABLE INITIALLY DEFERRED);

CREATE TABLE IF NOT EXISTS orion_salle (
  id text PRIMARY KEY, ecole_id text NOT NULL REFERENCES orion_ecole(id) DEFERRABLE INITIALLY DEFERRED,
  batiment text NOT NULL CHECK (batiment <> ''), nom text NOT NULL CHECK (nom <> ''),
  etage integer CHECK (etage BETWEEN -5 AND 30), extra jsonb NOT NULL DEFAULT '{}');

CREATE TABLE IF NOT EXISTS orion_materiel (
  id text PRIMARY KEY, ecole_id text NOT NULL REFERENCES orion_ecole(id) DEFERRABLE INITIALLY DEFERRED, id_orion text NOT NULL,
  salle_id text REFERENCES orion_salle(id) DEFERRABLE INITIALLY DEFERRED, type text NOT NULL, modele text NOT NULL CHECK (modele <> ''),
  marque text, serie text, date_reception timestamptz NOT NULL, garantie_fin timestamptz, hors_service boolean NOT NULL,
  extra jsonb NOT NULL DEFAULT '{}',
  CONSTRAINT orion_materiel_id_orion_unique UNIQUE (id_orion) DEFERRABLE INITIALLY DEFERRED);
-- Date de mise hors service, fixée par le serveur ; adresse MAC
ALTER TABLE orion_materiel ADD COLUMN IF NOT EXISTS date_hors_service timestamptz, ADD COLUMN IF NOT EXISTS mac text;
CREATE INDEX IF NOT EXISTS orion_materiel_ecole ON orion_materiel (ecole_id);
CREATE INDEX IF NOT EXISTS orion_materiel_salle ON orion_materiel (salle_id);

-- Compte ORION : profil et école ; le sujet relie le compte à l'identité du fournisseur
CREATE TABLE IF NOT EXISTS orion_compte (
  id text PRIMARY KEY, nom text NOT NULL CHECK (nom <> ''), email text NOT NULL CHECK (email = lower(email)),
  role text NOT NULL CHECK (role IN ('admin', 'gestionnaire', 'formateur', 'superadmin')),
  ecole_id text REFERENCES orion_ecole(id) DEFERRABLE INITIALLY DEFERRED,
  actif boolean NOT NULL, sujet text, extra jsonb NOT NULL DEFAULT '{}',
  CHECK ((role = 'superadmin') = (ecole_id IS NULL)),
  CONSTRAINT orion_compte_email_unique UNIQUE (email) DEFERRABLE INITIALLY DEFERRED,
  CONSTRAINT orion_compte_sujet_unique UNIQUE (sujet) DEFERRABLE INITIALLY DEFERRED);
-- Dernière connexion et date de désactivation, fixées par le serveur
ALTER TABLE orion_compte ADD COLUMN IF NOT EXISTS derniere_connexion timestamptz, ADD COLUMN IF NOT EXISTS date_desactivation timestamptz;

CREATE TABLE IF NOT EXISTS orion_preference (
  compte_id text PRIMARY KEY REFERENCES orion_compte(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
  affichage jsonb, dispositions jsonb, consultation timestamptz, ecole_affichee text);

CREATE TABLE IF NOT EXISTS orion_remontee (
  id text PRIMARY KEY, ecole_id text NOT NULL REFERENCES orion_ecole(id) DEFERRABLE INITIALLY DEFERRED,
  auteur text NOT NULL, created_at timestamptz NOT NULL, probleme text, description text NOT NULL CHECK (description <> ''),
  statut text NOT NULL, historique jsonb NOT NULL DEFAULT '[]',
  auteur_id text REFERENCES orion_compte(id) DEFERRABLE INITIALLY DEFERRED, extra jsonb NOT NULL DEFAULT '{}');
ALTER TABLE orion_remontee ADD COLUMN IF NOT EXISTS auteur_id text, DROP COLUMN IF EXISTS etat_des_lieux_cle;
-- Statuts du catalogue (shared/catalog.ts) ; NOT VALID : une base existante n'est pas relue
ALTER TABLE orion_remontee DROP CONSTRAINT IF EXISTS orion_remontee_statut_check;
ALTER TABLE orion_remontee ADD CONSTRAINT orion_remontee_statut_check CHECK (statut IN ('attente', 'encours', 'remplace', 'corrige')) NOT VALID;
CREATE INDEX IF NOT EXISTS orion_remontee_ecole ON orion_remontee (ecole_id, statut);

-- Pas de clé étrangère vers le matériel : une remontée reste consultable après la suppression du matériel
CREATE TABLE IF NOT EXISTS orion_remontee_materiel (
  remontee_id text NOT NULL REFERENCES orion_remontee(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
  rang integer NOT NULL, materiel_id text NOT NULL, PRIMARY KEY (remontee_id, rang));

-- Données de supervision et d'administration, en JSONB
CREATE TABLE IF NOT EXISTS orion_donnee (
  collection text NOT NULL, id text NOT NULL, ecole_id text, data jsonb NOT NULL,
  rang bigint GENERATED ALWAYS AS IDENTITY, PRIMARY KEY (collection, id));

-- Journal des dernières modifications : permet à tout serveur de fusionner les écritures concurrentes
CREATE TABLE IF NOT EXISTS orion_journal (revision integer PRIMARY KEY, cles json NOT NULL);
