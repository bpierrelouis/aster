# shellcheck shell=sh
# Rôle applicatif orion_app de la base orion : sans superutilisateur, propriétaire de la base et de ses objets (l'API crée ses
# schémas et tables). Le superutilisateur orion reste réservé à l'administration. Idempotent ; exécuté par PostgreSQL à la
# création de la base (docker-entrypoint-initdb.d), puis par deploiement.sh à chaque déploiement, pour une base existante.
# Secrets : /run/secrets/orion_app_password (mot de passe du rôle) ; par le réseau (PGHOST), /run/secrets/postgres.
if [ -n "${PGHOST:-}" ]; then PGPASSWORD=$(cat /run/secrets/postgres); export PGPASSWORD; fi
psql -v ON_ERROR_STOP=1 --no-psqlrc -U orion -d orion -v mdp="$(cat /run/secrets/orion_app_password)" <<'SQL'
SELECT 'CREATE ROLE orion_app' WHERE NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'orion_app') \gexec
ALTER ROLE orion_app WITH LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS PASSWORD :'mdp';
ALTER DATABASE orion OWNER TO orion_app;
-- Objets créés auparavant par le superutilisateur : schémas, tables et vues, puis séquences non rattachées à une table
DO $$
DECLARE o record;
BEGIN
  FOR o IN SELECT nspname FROM pg_namespace
      WHERE nspowner = 'orion'::regrole AND nspname NOT LIKE 'pg\_%' AND nspname <> 'information_schema' LOOP
    EXECUTE format('ALTER SCHEMA %I OWNER TO orion_app', o.nspname);
  END LOOP;
  FOR o IN SELECT c.oid::regclass AS nom, c.relkind FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE c.relowner = 'orion'::regrole AND c.relkind IN ('r', 'p', 'v', 'm', 'f')
        AND n.nspname NOT LIKE 'pg\_%' AND n.nspname <> 'information_schema' LOOP
    EXECUTE format('ALTER %s %s OWNER TO orion_app',
      CASE o.relkind WHEN 'v' THEN 'VIEW' WHEN 'm' THEN 'MATERIALIZED VIEW' WHEN 'f' THEN 'FOREIGN TABLE' ELSE 'TABLE' END, o.nom);
  END LOOP;
  FOR o IN SELECT c.oid::regclass AS nom FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE c.relowner = 'orion'::regrole AND c.relkind = 'S'
        AND n.nspname NOT LIKE 'pg\_%' AND n.nspname <> 'information_schema' LOOP
    EXECUTE format('ALTER SEQUENCE %s OWNER TO orion_app', o.nom);
  END LOOP;
END $$;
SQL
