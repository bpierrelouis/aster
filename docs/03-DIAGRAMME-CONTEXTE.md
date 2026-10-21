# Diagramme de contexte de l'application ASTER

## Diagramme

```mermaid
%%{init: {"block": {"padding": 24}}}%%
block
    columns 7

    gestionnaire(["Gestionnaire<br/>de matériel"]) space:5 administrateur(["Administrateur<br/>de salle technique"])
    space parc["Parc et<br/>référentiels"] inventaire["Inventaire et<br/>documents"] space commandes["Règles et<br/>commandes"] alertes["Alertes et<br/>statistiques"] space
    space:7
    utilisateur(["Utilisateur<br/>du poste"]) remontees["Remontées"] space aster["ASTER"] space supervision["Demande de<br/>supervision"] formateur(["Formateur"])
    space:5 etatPostes["État des postes"] space
    space livraison["Informations<br/>de livraison"] space:2 applications["Applications et<br/>processus"] reinstallation["Réinstallation<br/>et contrôle"] space
    cnd["CND"] space:5 postes["Postes informatiques<br/>des salles"]

    gestionnaire --- parc
    parc --> aster
    aster --- inventaire
    inventaire --> gestionnaire
    utilisateur --- remontees
    remontees --> aster
    cnd --- livraison
    livraison --> aster

    administrateur --- commandes
    commandes --> aster
    aster --- alertes
    alertes --> administrateur

    formateur --- supervision
    supervision --> aster
    aster --- etatPostes
    etatPostes --> formateur

    postes --- applications
    applications --> aster
    aster --- reinstallation
    reinstallation --> postes

    classDef acteur fill:#C2E5FF,stroke:#3DADFF
    classDef externe fill:#FFECBD,stroke:#FFC943
    classDef systeme fill:#CDF4D3,stroke:#3E9B4B
    classDef flux fill:transparent,stroke:transparent,color:#333333

    class gestionnaire,administrateur,formateur,utilisateur acteur
    class cnd,postes externe
    class aster systeme
    class parc,inventaire,commandes,alertes,supervision,remontees,etatPostes,livraison,applications,reinstallation flux
```

## Entités et flux

| Entité externe                    | Flux vers ASTER                                                                          | Flux provenant d'ASTER                                                                      |
| --------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Gestionnaire de matériel          | matériels, salles, affectations, mouvements, aptitudes et formations induites            | inventaire, localisation, état du parc et documents d'état des lieux                        |
| Administrateur de salle technique | demandes de réinstallation, listes de processus autorisés ou interdits et ordres d'arrêt | applications installées, processus démarrés, alertes, résultats des actions et statistiques |
| Formateur                         | demandes de consultation et de supervision de sa salle                                   | état et données d'utilisation des postes de sa salle                                        |
| Utilisateur du poste              | remontées utilisateur                                                                    | aucun retour n'est explicitement prévu dans les consignes                                   |
| CND                               | informations accompagnant les matériels livrés                                           | aucun flux sortant n'est explicitement prévu dans les consignes                             |
| Postes informatiques des salles   | applications installées, processus démarrés et données d'utilisation                     | commandes de réinstallation et de contrôle des processus                                    |

## Choix de modélisation

- les trois modules fonctionnels ne sont pas affichés : ils appartiennent à l'intérieur d'ASTER ;
- les documents d'état des lieux sont représentés comme un **flux sortant** vers le gestionnaire, et non comme une entité externe ;
- les processus ne sont pas une entité externe : leurs informations proviennent des postes, tandis que les règles et commandes sont échangées avec l'administrateur ;
- les fichiers Excel ne figurent pas dans le diagramme, car les consignes les présentent comme le fonctionnement à remplacer et non comme une intégration à conserver ;
- aucun annuaire, SSO, outil de déploiement ou système du CND n'est ajouté tant que son existence et son intégration ne sont pas confirmées.

## Points à confirmer pendant le cadrage

- la saisie des informations du CND est-elle manuelle, issue d'un fichier ou réalisée par une API ?
- ASTER communique-t-il directement avec les postes ou par l'intermédiaire d'un agent ou d'un outil tiers ?
- quel outil exécute réellement la réinstallation des postes et des salles ?
- quels retours ASTER fournit-il aux utilisateurs ayant créé une remontée ?
- quels acteurs reçoivent les documents d'état des lieux en plus du gestionnaire de matériel ?
