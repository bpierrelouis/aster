-- Lecture seule ; exécuter dans la base ORION de développement.
SELECT collection, count(*)::int AS nombre FROM public.donnee GROUP BY collection ORDER BY nombre DESC;
SELECT ecole_id, count(*)::int AS nombre, count(*) FILTER (WHERE data->>'stoppedAt' IS NULL)::int AS en_cours
FROM public.donnee WHERE collection = 'processus' GROUP BY ecole_id;
SELECT revision FROM public.espace;
