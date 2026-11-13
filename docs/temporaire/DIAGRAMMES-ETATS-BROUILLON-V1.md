# Diagrammes d'états — brouillon V1

<!-- version:debut : généré par versions.py, ne pas modifier à la main -->
| Version | Mise à jour | Destination | Dernière évolution | Historique |
| --- | --- | --- | --- | --- |
| 3.0 | 13/11/2026 | Brouillon interne | Traitement des remontées réservé au gestionnaire, prise en charge obligatoire ; règles RG-13, 15, 21, 39, 40, 64, 66, 72 mises à jour et RG-87 à RG-91 ajoutées | [3 versions](../../archive/README.md#diagrammes-etats-brouillon-v1) |
<!-- version:fin -->

## Remontée

```mermaid
stateDiagram-v2
    direction LR
    [*] --> attente : créer la remontée<br/>[formateur · administrateur · super administrateur]<br/>[description et type de problème saisis ∧ ≥ 1 matériel de l'école]<br/>/ numéro attribué, historique initialisé, notification des gestionnaires
    attente --> encours : prendre en charge<br/>[gestionnaire]<br/>/ ajout à l'historique, notification de l'auteur
    encours --> remplace : traiter « Remplacé »<br/>[gestionnaire]<br/>/ ajout à l'historique, notification de l'auteur
    encours --> corrige : traiter « Corrigé »<br/>[gestionnaire]<br/>/ ajout à l'historique, notification de l'auteur
    remplace --> [*]
    corrige --> [*]

    attente : En attente
    encours : En cours
    remplace : Remplacé
    corrige : Corrigé
```

## Intervention sur les postes

```mermaid
stateDiagram-v2
    direction LR
    [*] --> enregistree : demander l'intervention<br/>[administrateur · super administrateur, ou formateur pour un arrêt]<br/>[1 à 500 postes d'une seule salle]
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
