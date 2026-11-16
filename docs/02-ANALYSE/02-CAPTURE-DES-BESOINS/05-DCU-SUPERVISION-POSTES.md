# DCU — Superviser les postes

<!-- version:debut : généré par versions.py, ne pas modifier à la main -->
| Version | Mise à jour | Destination | Dernière évolution | Historique |
| --- | --- | --- | --- | --- |
| 3.0 | 16/11/2026 | Production destinée à la remise | Appliquer les droits de l’administrateur, corriger les écarts avec le code et remettre en page à angles droits | [9 versions](../../../archive/README.md#05-dcu-supervision-postes) |
<!-- version:fin -->

```mermaid
flowchart LR
    acteurSupervision(["Acteur de supervision"])
    formateur(["Formateur"])
    administrateur(["Administrateur"])
    superAdministrateur(["Super administrateur"])
    acteurAdministrationSupervision(["Acteur d'administration<br/>de la supervision"])

    formateur -->|« hérite de »| acteurSupervision
    acteurAdministrationSupervision -->|« hérite de »| acteurSupervision
    administrateur -->|« hérite de »| acteurAdministrationSupervision
    superAdministrateur -->|« hérite de »| acteurAdministrationSupervision

    subgraph orion["Application web ORION — Supervision des postes"]
        direction TB
        accederSalle(["Accéder à une salle"])
        consulterEtat(["Consulter l'état des postes,<br/>leur adresse IP et leur système d'exploitation"])
        consulterProcessus(["Consulter les processus utilisateur"])
        arreterProcessus(["Arrêter manuellement un processus"])
        gererListes(["Gérer la whitelist et la blacklist"])
        gererReglesGlobales(["Gérer les règles globales"])
        appliquerRegles(["Classer les processus et<br/>appliquer les règles"])
        arreterInterdit(["Arrêter automatiquement<br/>un processus blacklisté"])
        consulterAlertes(["Consulter les détections<br/>de processus d'une salle"])
        recevoirAlerte(["Recevoir une notification du lancement<br/>d'une application interdite (blacklist)"])
        consulterStatistiques(["Consulter les statistiques d'utilisation"])
    end

    administrationDistante(["« système »<br/>Solution d’administration<br/>à distance des postes"])

    acteurSupervision --- accederSalle
    acteurSupervision --- consulterEtat
    acteurSupervision --- consulterProcessus
    acteurSupervision --- arreterProcessus
    acteurSupervision --- consulterAlertes
    acteurAdministrationSupervision --- gererListes
    acteurAdministrationSupervision --- consulterStatistiques
    acteurAdministrationSupervision --- recevoirAlerte
    superAdministrateur --- gererReglesGlobales

    consulterEtat -.->|« include »| accederSalle
    consulterProcessus -.->|« include »| accederSalle
    arreterProcessus -.->|« include »| consulterProcessus
    gererReglesGlobales -.->|« extend »| gererListes
    arreterInterdit -.->|« extend »| appliquerRegles

    consulterEtat --- administrationDistante
    consulterProcessus --- administrationDistante
    arreterProcessus --- administrationDistante
    appliquerRegles --- administrationDistante
    arreterInterdit --- administrationDistante

    classDef acteurReel fill:#DCEEFF,stroke:#2878B5,color:#102A43,stroke-width:1.5px
    classDef acteurAbstrait fill:#E3F5E6,stroke:#35864A,color:#173B22,stroke-width:2px,stroke-dasharray:6 4
    classDef acteurSecondaire fill:#FFECBD,stroke:#E8B84E,color:#17243B
    classDef casUtilisation fill:#F5F2FF,stroke:#6954C0,color:#241C45
    class formateur,administrateur,superAdministrateur acteurReel
    class acteurSupervision,acteurAdministrationSupervision acteurAbstrait
    class administrationDistante acteurSecondaire
    class accederSalle,consulterEtat,consulterProcessus,arreterProcessus,gererListes,gererReglesGlobales,appliquerRegles,arreterInterdit,consulterAlertes,recevoirAlerte,consulterStatistiques casUtilisation

    style orion fill:none,stroke:#7D8793,stroke-width:1px
```
