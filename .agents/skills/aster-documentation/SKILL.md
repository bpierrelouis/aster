---
name: aster-documentation
description: >-
  Recueillir, rédiger, actualiser ou auditer la documentation fonctionnelle et de conception d'ASTER : cadrage, règles, UML, Merise et backlog. Ne couvre pas le développement de l'application ni les tâches Git seules.
---

# Documentation ASTER

Appliquer `AGENTS.md`. Ce skill fournit une méthode, pas de nouvelles exigences métier. Les sources du dépôt et les demandes explicites de l'utilisateur priment sur ses modèles.

## Entrer dans la tâche

- Identifier le résultat demandé : recueillir une réponse, rédiger, synchroniser ou auditer sans modifier. Une vérification seule ne déclenche pas de correction.
- Lire le README et les sources prescrites par `AGENTS.md`, puis le cadrage et les documents concernés. Retrouver les fichiers depuis le sommaire et l'inventaire, sans supposer leurs numéros immuables.
- Distinguer source primaire datée, réponse consolidée et représentation dérivée. Un modèle annoncé comme validé mais différent de sa description constitue un écart à signaler, pas une raison pour inventer une règle.

## Recueillir et tracer

- En entretien interactif, poser une seule question à la fois. « Passe » conserve le point inchangé ; arrêter les questions si demandé.
- Dater les réponses directes avec la date réelle de l'échange ; ne pas les attribuer à un ancien entretien.
- Appliquer la réponse la plus récente sur le même sujet. Conserver les précisions compatibles et les inconnues restantes. Ne pas déduire une validation du silence.
- Préserver les entretiens historiques. Le cadrage porte les réponses courantes ; un registre éventuel conserve la provenance sans devenir un second cadrage concurrent.
- Si un registre existe ou est demandé, adapter le [modèle de décision](assets/MODELE-DECISION.md). Ne pas créer de registre vide ou de décisions supposées pour chaque tâche.

## Rédiger et synchroniser

1. Repérer les conséquences du changement : glossaire, cadrage, règles, données, contexte, activités, cas d'utilisation, stories et backlog lorsqu'ils existent. Lire les passages concernés avant d'éditer.
2. Relier les affirmations importantes à une source précise : document et section, ou réponse directe datée. Réutiliser les identifiants existants ; éviter de recopier intégralement les mêmes règles.
3. Séparer exigences confirmées, propositions, hypothèses et questions ouvertes. Une recommandation technique n'est pas un besoin du client.
4. Respecter le niveau demandé : stories stratégiques et vocabulaire métier pour l'analyse fonctionnelle ; détails techniques dans les livrables qui les demandent. Ne pas déduire le besoin du code.
5. Respecter les documents protégés : signaler leur décalage et terminer les mises à jour autorisées. Une demande générale ne lève pas implicitement leur protection.
6. Mettre à jour les références et le sommaire si nécessaire. Placer les brouillons dans `docs/temporaire/`, avec leur statut dans le nom. Ne pas renuméroter sans nécessité documentaire.
7. Dans les fichiers Markdown de diagrammes, conserver les blocs de diagramme ou images intégrées, avec des titres Markdown pour les identifier et les organiser, sans texte explicatif. Vérifier la couverture des informations dans le glossaire, le cadrage et les règles avant de retirer les textes ; transférer les précisions pertinentes manquantes dans ces documents. Ne pas réintroduire la prose dans des notes ou commentaires du diagramme.

Lire uniquement les ressources utiles :

- [Revue UML et Merise](references/MODELISATION.md) pour concevoir ou auditer les modèles.
- [Décision](assets/MODELE-DECISION.md) pour tracer une réponse et ses conséquences.
- [Cas d'utilisation](assets/MODELE-CAS-UTILISATION.md) pour détailler un parcours.
- [Story et backlog](assets/MODELE-STORY-BACKLOG.md) pour organiser les besoins.
- [Règles de gestion](assets/MODELE-REGLES-GESTION.md) pour formaliser les contraintes.
- [Dossier d'analyse](assets/MODELE-DOSSIER-ANALYSE.md) pour assembler les livrables existants.

Adapter les modèles au document cible et omettre les rubriques inutiles. Ne jamais remplir une inconnue par une invention. Pour un Word, PDF ou diaporama, utiliser en complément le skill de format disponible, conserver une source éditable et vérifier le rendu.

## Auditer et livrer

- Comparer les affirmations avec leurs sources et représentations, y compris les sources éditables des diagrammes. Les anciennes réponses conservées dans un entretien ne sont pas des contradictions du cadrage.
- Distinguer contradiction, information confirmée non répercutée, question déjà résolue, manque de source et livrable absent. Pour chaque écart : références précises, conséquence et correction suggérée. Une omission dans une vue volontairement limitée n'est pas automatiquement une erreur.
- Exécuter depuis la racine : `python3 .agents/skills/aster-documentation/scripts/verifier_documentation.py`. Ce script en lecture seule contrôle la structure, pas le sens métier ; un résultat positif ne prouve pas la cohérence fonctionnelle.
- Après modification, relire le diff, exécuter `git diff --check` et les contrôles adaptés au livrable. Distinguer les défauts préexistants des défauts introduits ; ne pas corriger un autre périmètre pour faire passer le contrôle.
- Rendre compte des documents touchés, vérifications exécutées, écarts et limites. Ne pas annoncer qu'un nouveau skill est déjà chargé automatiquement dans le chat courant.
