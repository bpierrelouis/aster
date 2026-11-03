---
name: create-architectural-decision-record
description: 'Documenter un choix d’architecture ASTER : contexte, options, justification, compromis et statut. Utiliser pour une décision technique ou une comparaison formalisée ; pas pour tracer chaque réponse métier.'
---

# Create Architectural Decision Record

## Adaptation ASTER

Appliquer `AGENTS.md` et utiliser `aster-documentation` pour les sources et la synchronisation. Cette adaptation remplace les conventions génériques de sortie ci-dessous.

- Rédiger en français ; distinguer contraintes confirmées, hypothèses techniques et options proposées. Rechercher les informations disponibles dans les sections pertinentes du cadrage avant de questionner l'utilisateur.
- Réutiliser un document ou registre approprié s'il existe. Pour une nouvelle proposition, utiliser `docs/temporaire/DECISION-ARCHITECTURE-<SUJET>-BROUILLON-V1.md`. Un livrable final suit le classement et la numérotation du dépôt, avec un lien dans le README.
- Remplacer les variables de formulaire par le contexte connu ; laisser explicites les informations manquantes. Poser une seule question à la fois lorsqu'un point bloque réellement la décision. Ne pas inventer de parties prenantes ou de motifs de rejet.
- Comparer les options selon les contraintes du projet et présenter leurs conséquences. Tant qu'aucun choix n'est validé, conserver le statut « Proposé » et indiquer ce qui reste à confirmer. L'installation de ce skill ne valide aucune architecture et ne déclenche aucune implémentation.
- Adapter le modèle aux informations utiles ; les codes de listes et les métadonnées facultatives ne sont pas des exigences ASTER. Citer les sources sans dupliquer le cadrage.

## Ressource à la demande

Lire le [modèle de référence](references/MODELE-AMONT.md) seulement pour structurer le livrable demandé. Les adaptations ASTER ci-dessus priment sur ce modèle générique.
