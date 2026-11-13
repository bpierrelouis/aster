# Diagrammes d'états — brouillon V1

<!-- version:debut : généré par versions.py, ne pas modifier à la main -->
| Version | Mise à jour | Destination | Dernière évolution | Historique |
| --- | --- | --- | --- | --- |
| 1.0 | 09/11/2026 | Brouillon interne | Ajouter les diagrammes d'états de la remontée et des interventions | [1 version](../../archive/README.md#diagrammes-etats-brouillon-v1) |
<!-- version:fin -->

## Remontée

```mermaid
stateDiagram-v2
    direction LR
    [*] --> attente : créer la remontée<br/>[formateur · administrateur · super administrateur]<br/>[description saisie ∧ ≥ 1 matériel de l'école]<br/>/ historique initialisé, PDF d'état des lieux
    attente --> remplace : traiter « Remplacé »<br/>[gestionnaire · administrateur · super administrateur]<br/>/ ajout à l'historique
    attente --> corrige : traiter « Corrigé »<br/>[administrateur · super administrateur]<br/>/ ajout à l'historique
    remplace --> [*]
    corrige --> [*]

    attente : En attente
    remplace : Remplacé
    corrige : Corrigé
```

## Intervention sur les postes

```mermaid
stateDiagram-v2
    direction LR
    [*] --> enregistree : demander l'intervention<br/>[administrateur · super administrateur, ou formateur pour un arrêt]<br/>[postes d'une seule école]
    [*] --> enregistree : arrêt automatique<br/>[processus classé blacklist]

    state enregistree {
        direction LR
        [*] --> en_attente : pour chaque poste cible
        en_attente --> reussie : résultat du poste « réussie »
        en_attente --> echec_poste : résultat du poste « échec »
        en_attente : En attente
        reussie : Réussie
        echec_poste : Échec
    }

    enregistree --> terminee : [tous les postes en réussite]
    enregistree --> echec : [aucun poste en attente ∧ ≥ 1 échec]
    terminee --> [*]
    echec --> [*]

    enregistree : Enregistrée
    terminee : Terminée
    echec : Échec
```
