# Diagrammes d'états

<!-- version:debut : généré par versions.py, ne pas modifier à la main -->
| Version | Mise à jour | Destination | Dernière évolution | Historique |
| --- | --- | --- | --- | --- |
| 5.0 | 16/11/2026 | Production destinée à la remise | Traitement et confirmation ouverts aux administrateurs | [8 versions](../../../archive/README.md#17-diagrammes-etats) |
<!-- version:fin -->

## Remontée

```mermaid
stateDiagram-v2
    direction LR
    [*] --> attente : créer la remontée<br/>[formateur · administrateur · super administrateur]<br/>[description et type de problème saisis ∧ ≥ 1 matériel de l'école]<br/>/ numéro attribué, historique initialisé, notification des gestionnaires
    attente --> encours : prendre en charge<br/>[gestionnaire · administrateur · super administrateur]<br/>/ ajout à l'historique, notification de l'auteur
    encours --> remplace : traiter « Remplacé »<br/>[gestionnaire · administrateur · super administrateur]<br/>/ ajout à l'historique, notification de l'auteur
    encours --> corrige : traiter « Corrigé »<br/>[gestionnaire · administrateur · super administrateur]<br/>/ ajout à l'historique, notification de l'auteur
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
    [*] --> enregistree : demander l'intervention<br/>[administrateur · super administrateur, ou formateur pour un arrêt]<br/>[1 à 500 postes d'une seule salle]<br/>[arrêt : un seul poste, processus en cours, aucun arrêt déjà demandé]<br/>[installation ou désinstallation : application du catalogue]<br/>/ auteur et date fixés par le serveur, image de référence imposée pour une réinitialisation
    [*] --> enregistree : arrêt automatique<br/>[processus classé blacklist]<br/>/ détection enregistrée

    state enregistree {
        direction LR
        [*] --> demande_en_attente
        demande_en_attente --> demande_en_cours : [≥ 1 poste en cours, en réussite ou en échec]
        demande_en_cours --> demande_en_attente : [aucun résultat ∧ tous les postes éteints ou indisponibles]
        demande_en_attente : En attente
        demande_en_cours : En cours
        --
        [*] --> en_attente : pour chaque poste cible<br/>[poste éteint ou indisponible]
        [*] --> en_cours : pour chaque poste cible<br/>[poste allumé]
        en_attente --> en_cours : poste allumé<br/>/ exécution à son prochain rapport
        en_cours --> en_attente : poste éteint ou indisponible<br/>[aucun résultat]
        en_cours --> reussie : résultat du poste « réussie »<br/>/ installation : application ajoutée au poste<br/>désinstallation : application retirée<br/>réinitialisation : processus du poste arrêtés<br/>arrêt : processus arrêté, détection « arrêt réussi »
        en_cours --> echec_poste : résultat du poste « échec »<br/>/ arrêt : détection « arrêt en échec »
        en_attente : En attente
        en_cours : En cours
        reussie : Réussie
        echec_poste : Échec
    }

    enregistree --> terminee : [tous les postes en réussite]<br/>/ date de fin ; notification de l'administrateur demandeur<br/>(installation, désinstallation, réinitialisation)
    enregistree --> echec : [aucun poste en attente ∧ ≥ 1 échec]<br/>/ date de fin ; notification de l'administrateur demandeur<br/>(installation, désinstallation, réinitialisation)
    terminee --> [*]
    echec --> [*]

    enregistree : Enregistrée
    terminee : Terminée
    echec : Échec
```

## Matériel

```mermaid
stateDiagram-v2
    direction LR
    [*] --> parc : déclarer ou importer le matériel<br/>[gestionnaire · administrateur · super administrateur]<br/>/ identifiant ORION attribué par le serveur
    [*] --> parc : code inconnu confirmé et renseigné sur RIGEL<br/>/ ajout au parc dans le lieu ouvert, identifiant ORION attribué

    state parc {
        direction LR
        [*] --> en_service
        en_service --> hors_service : déclarer hors service<br/>[gestionnaire · administrateur · super administrateur]<br/>/ date de mise hors service fixée, poste de l'unité centrale éteint
        hors_service --> en_service : remettre en service<br/>/ date de mise hors service retirée
        en_service : En service
        hors_service : Hors service
        --
        [*] --> stock : [déclaré sans salle]
        [*] --> affecte : [déclaré dans une salle de son école]
        stock --> affecte : affecter à une salle ∨ présence acceptée par RIGEL dans une salle<br/>[en service ∧ salle de son école]
        affecte --> affecte : réaffecter à une autre salle ∨ présence acceptée par RIGEL<br/>[en service]
        affecte --> stock : renvoyer au stock ∨ constat RIGEL « stock »<br/>∨ présence acceptée par RIGEL au stock
        stock : Au stock
        affecte : Affecté à une salle
        --
        [*] --> installe
        installe --> deplacement : affectation modifiée [nouveau lieu ≠ emplacement physique]<br/>∨ constat RIGEL « retour » ou « stock »<br/>/ déplacement lancé : origine, auteur et date
        deplacement --> installe : confirmer l’installation<br/>[gestionnaire · administrateur · super administrateur dans ORION,<br/>ou scan RIGEL dans le lieu affecté]<br/>/ installation confirmée : origine, auteur et date
        deplacement --> installe : affectation ramenée à l'emplacement physique<br/>/ déplacement annulé
        installe : Installé
        deplacement : Déplacement en cours
    }

    parc : Au parc
    parc --> [*] : supprimer<br/>[administrateur · super administrateur]<br/>[au stock ∧ cité par aucune remontée]
```

## Processus

```mermaid
stateDiagram-v2
    direction LR
    state classement <<choice>>
    [*] --> classement : processus utilisateur<br/>remonté par le poste<br/>/ début fixé à la date du rapport
    classement --> en_cours : [whitelist]
    classement --> en_cours : [non référencé]<br/>/ détection enregistrée
    classement --> arret_demande : [blacklist]<br/>/ détection enregistrée,<br/>arrêt automatique demandé

    en_cours --> arret_demande : demander l'arrêt<br/>[formateur · administrateur<br/>· super administrateur]<br/>[aucun arrêt en attente]
    arret_demande --> echec : résultat du poste « échec »<br/>/ détection « arrêt en échec »
    echec --> arret_demande : demander l'arrêt<br/>[formateur · administrateur<br/>· super administrateur]
    en_cours --> arrete : fin constatée<br/>[absent du rapport du poste<br/>∨ poste déconnecté<br/>∨ réinitialisation réussie]<br/>/ fin fixée par le serveur
    arret_demande --> arrete : résultat du poste « réussie »<br/>/ détection « arrêt réussi »<br/>∨ fin constatée
    echec --> arrete : fin constatée
    arrete --> [*] : after(1 h)<br/>/ retiré de l'historique

    en_cours : En cours
    arret_demande : Arrêt demandé
    echec : Arrêt en échec
    arrete : Arrêté
```
