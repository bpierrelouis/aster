---
name: orion-documentation
description: >-
  Recueillir, rédiger, synchroniser ou auditer la documentation fonctionnelle et de conception d'ORION. Ne couvre pas le développement de l'application ni les tâches Git seules.
---

# Documentation ORION

Appliquer `AGENTS.md` pour les sources, les protections, le classement et les contrôles. Les demandes de l'utilisateur et les sources du projet priment sur les modèles de ce skill.

## Cibler le travail

- Identifier le résultat : recueil, rédaction, synchronisation ou audit. Une vérification seule n'autorise pas de correction.
- Utiliser les parcours du README pour repérer les sections utiles ; rechercher les termes métier et identifiants `RG-*`, puis lire les passages et leurs sources datées. Ne pas supposer les numéros de fichiers immuables.
- Élargir aux dépendances ou contradictions rencontrées. Ne charger ni tous les documents ni toutes les ressources du skill par défaut. Une exploration globale se justifie par la demande ou une incertitude qui empêche de conclure.

## Recueillir et synchroniser

- En entretien interactif, poser une question à la fois. « Passe » conserve le point inchangé ; arrêter les questions si demandé.
- Dater les réponses directes du jour réel de l'échange, sans les attribuer à un ancien entretien ni déduire une validation du silence. Consolider dans le cadrage ; un registre éventuel conserve la provenance sans devenir un second cadrage. Ne pas créer de registre vide par défaut.
- Pour chaque changement, rechercher ses conséquences dans les documents existants : glossaire, cadrage, règles, données, droits, diagrammes, fiches, stories et backlog ; inclure les maquettes et présentations si elles reprennent l'information. Lire les passages avant de les modifier et synchroniser toutes les conséquences autorisées, sans se limiter au premier fichier trouvé.
- Citer la source précise (document et section, ou réponse directe datée) ; réutiliser les identifiants existants plutôt que recopier des règles complètes. Conserver le vocabulaire métier et le niveau demandé : les détails techniques vont dans les livrables qui les nécessitent.
- Signaler le décalage des documents protégés et terminer les mises à jour autorisées ; une demande générale ne lève pas leur protection. Ne pas renuméroter sans nécessité documentaire.

## Ressources à la demande

- [Revue UML et Merise](references/MODELISATION.md) : conception ou audit des modèles.
- [Décision](assets/MODELE-DECISION.md) : registre existant ou demandé.
- [Cas d'utilisation](assets/MODELE-CAS-UTILISATION.md) : parcours détaillé.
- [Story et backlog](assets/MODELE-STORY-BACKLOG.md) : organisation des besoins.
- [Règles de gestion](assets/MODELE-REGLES-GESTION.md) : contraintes confirmées.
- [Dossier d'analyse](assets/MODELE-DOSSIER-ANALYSE.md) : assemblage des livrables.

Adapter les modèles, omettre les rubriques inutiles et laisser les inconnues explicites. Pour Word, PDF ou diaporama, utiliser le skill de format disponible, garder une source éditable et vérifier le rendu.

## Auditer et livrer

- Comparer les affirmations aux sources et représentations concernées, y compris les sources éditables des diagrammes. Un statut « validé » incohérent avec le modèle est un écart à signaler, pas une autorisation d'inventer une règle.
- Distinguer contradiction, information non répercutée, question déjà résolue, manque de source et livrable absent. Donner pour chaque écart les références, la conséquence et la correction suggérée. Une omission dans une vue volontairement limitée n'est pas automatiquement une erreur.
- Après chaque mise à jour d’un document suivi, publier sa version avec `scripts/versions.py publier <fichier> --majeure|--mineure -m "…"` (règles dans `AGENTS.md`, section « Versions et archives »).
- Exécuter depuis la racine `python3 .agents/skills/orion-documentation/scripts/verifier_documentation.py`, puis les contrôles prescrits dans `AGENTS.md`. Un succès structurel ne prouve pas la cohérence métier ; ne pas corriger un autre périmètre pour faire passer le contrôle.
- Rapporter les documents touchés, contrôles, écarts et limites. Pour une reprise de tâche longue, fournir un résumé court : périmètre, sources, décisions référencées, travail effectué et restant. Ne créer une note durable que si utile et autorisé ; elle ne remplace pas le cadrage. Ne pas annoncer le chargement automatique d'un skill modifié dans le chat courant.
