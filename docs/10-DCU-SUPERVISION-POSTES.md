# DCU — Superviser les postes

<!-- version:debut : généré par versions.py, ne pas modifier à la main -->
| Version | Mise à jour | Destination | Dernière évolution | Historique |
| --- | --- | --- | --- | --- |
| 1.4 | 12/11/2026 | Production destinée à la remise | Renommer ASTER en ORION dans tout le dépôt | [5 versions](../archive/README.md#10-dcu-supervision-postes) |
<!-- version:fin -->

```mermaid
flowchart LR
    acteurSupervision(["Acteur de supervision"])
    formateur(["Formateur"])
    administrateur(["Administrateur"])
    superAdministrateur(["Super administrateur"])

    formateur -->|« hérite de »| acteurSupervision
    administrateur -->|« hérite de »| acteurSupervision
    superAdministrateur -->|« hérite de »| administrateur

    subgraph orion["Application web ORION — Supervision des postes"]
        direction TB
        accederSalle(["Accéder à une salle"])
        consulterEtat(["Consulter l'état des postes"])
        consulterProcessus(["Consulter les processus utilisateur"])
        arreterProcessus(["Arrêter manuellement un processus"])
        gererListes(["Gérer la whitelist et la blacklist"])
        gererReglesGlobales(["Gérer les règles globales"])
        appliquerRegles(["Classer les processus et<br/>appliquer les règles"])
        arreterInterdit(["Arrêter automatiquement<br/>un processus blacklisté"])
        consulterAlertes(["Consulter les détections<br/>de processus d'une salle"])
        recevoirAlerte(["Recevoir une notification<br/>de processus blacklisté"])
        consulterStatistiques(["Consulter les statistiques d'utilisation"])
    end

    administrationDistante(["Solution d’administration<br/>à distance des postes"])

    acteurSupervision --- accederSalle
    acteurSupervision --- consulterEtat
    acteurSupervision --- consulterProcessus
    acteurSupervision --- arreterProcessus
    acteurSupervision --- consulterAlertes
    administrateur --- gererListes
    administrateur --- consulterStatistiques
    administrateur --- recevoirAlerte
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

    classDef acteurReel fill:#DCEEFF,stroke:#2878B5,color:#102A43,stroke-width:1.5px
    classDef acteurAbstrait fill:#E3F5E6,stroke:#35864A,color:#173B22,stroke-width:2px,stroke-dasharray:6 4
    classDef acteurSecondaire fill:#FFECBD,stroke:#E8B84E,color:#17243B
    classDef casUtilisation fill:#F5F2FF,stroke:#6954C0,color:#241C45
    class formateur,administrateur,superAdministrateur acteurReel
    class acteurSupervision acteurAbstrait
    class administrationDistante acteurSecondaire
    class accederSalle,consulterEtat,consulterProcessus,arreterProcessus,gererListes,gererReglesGlobales,appliquerRegles,arreterInterdit,consulterAlertes,recevoirAlerte,consulterStatistiques casUtilisation

    style orion fill:none,stroke:#7D8793,stroke-width:1px
```
