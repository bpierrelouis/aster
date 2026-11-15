-- Noms alignés sur la documentation (15 novembre, ticket #162) :
-- - tables, index, séquences et contraintes sans préfixe orion_ (la base orion est dédiée) ;
-- - collection operations (demandes adressées aux postes) renommée interventions ;
-- - collection recensements (opérations RIGEL : recensement ou installation) renommée operations ;
-- - champ recensementId d'un constat renommé operationId.
-- Exécutée dans le schéma de l'espace (search_path) ; les données sont conservées.

DO $$
DECLARE r record;
BEGIN
  -- Contraintes d'abord (une contrainte unique ou primaire renomme aussi son index)
  FOR r IN SELECT c.conname, t.relname FROM pg_constraint c
      JOIN pg_class t ON t.oid = c.conrelid JOIN pg_namespace n ON n.oid = t.relnamespace
      WHERE n.nspname = current_schema() AND c.conname LIKE 'orion\_%' LOOP
    EXECUTE format('ALTER TABLE %I RENAME CONSTRAINT %I TO %I', r.relname, r.conname, substr(r.conname, 7));
  END LOOP;
  -- Index restants et séquences
  FOR r IN SELECT c.relname, c.relkind FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = current_schema() AND c.relkind IN ('i', 'S') AND c.relname LIKE 'orion\_%' LOOP
    EXECUTE format(CASE r.relkind WHEN 'i' THEN 'ALTER INDEX %I RENAME TO %I' ELSE 'ALTER SEQUENCE %I RENAME TO %I' END, r.relname, substr(r.relname, 7));
  END LOOP;
  -- Tables
  FOR r IN SELECT c.relname FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = current_schema() AND c.relkind = 'r' AND c.relname LIKE 'orion\_%' LOOP
    EXECUTE format('ALTER TABLE %I RENAME TO %I', r.relname, substr(r.relname, 7));
  END LOOP;
END $$;

UPDATE donnee SET collection = CASE collection WHEN 'operations' THEN 'interventions' ELSE 'operations' END
  WHERE collection IN ('operations', 'recensements');

UPDATE donnee SET data = (data - 'recensementId') || jsonb_build_object('operationId', data -> 'recensementId')
  WHERE collection = 'constats' AND data ? 'recensementId';

-- Journal de fusion : mêmes renommages dans les éléments enregistrés [collection, id, valeur]
UPDATE journal SET cles = (
  SELECT coalesce(json_agg(json_build_array(
    CASE e ->> 0 WHEN 'operations' THEN 'interventions' WHEN 'recensements' THEN 'operations' ELSE e ->> 0 END,
    e -> 1,
    CASE WHEN e ->> 0 = 'constats' AND jsonb_typeof((e -> 2)::jsonb) = 'object' AND (e -> 2)::jsonb ? 'recensementId'
      THEN (((e -> 2)::jsonb - 'recensementId') || jsonb_build_object('operationId', (e -> 2)::jsonb -> 'recensementId'))::json
      ELSE e -> 2 END) ORDER BY i), '[]'::json)
  FROM json_array_elements(cles) WITH ORDINALITY AS x(e, i));
