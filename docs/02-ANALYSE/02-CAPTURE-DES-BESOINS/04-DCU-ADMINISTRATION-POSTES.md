# DCU — Administrer les postes

<!-- version:debut : généré par versions.py, ne pas modifier à la main -->
| Version | Mise à jour | Destination | Dernière évolution | Historique |
| --- | --- | --- | --- | --- |
| 4.0 | 16/11/2026 | Production destinée à la remise | Appliquer les droits de l’administrateur, corriger les écarts avec le code et remettre en page à angles droits | [11 versions](../../../archive/README.md#04-dcu-administration-postes) |
<!-- version:fin -->

```mermaid
flowchart LR
    administrateur(["Administrateur"])
    superAdministrateur(["Super administrateur"])
    acteurAdministrationPostes(["Acteur d'administration<br/>des postes"])

    administrateur -->|« hérite de »| acteurAdministrationPostes
    superAdministrateur -->|« hérite de »| acteurAdministrationPostes

    subgraph orion["Application web ORION — Administration des postes"]
        direction TB
        consulterApplications(["Consulter les applications installées"])
        installerApplication(["Installer une application<br/>sur un poste ou une salle"])
        desinstallerApplication(["Désinstaller une application<br/>sur un poste ou une salle"])
        demanderPoste(["Demander la réinitialisation<br/>d'un ou plusieurs postes"])
        demanderSalle(["Demander la réinitialisation d'une salle"])
        suivreInterventions(["Suivre les demandes d'intervention"])
        recevoirFin(["Recevoir une notification de fin<br/>d'une intervention qu'il a demandée"])
        gererPostes(["Consulter la vue des postes"])
    end

    administrationDistante(["« système »<br/>Solution d’administration<br/>et de déploiement des postes"])

    acteurAdministrationPostes --- consulterApplications
    acteurAdministrationPostes --- installerApplication
    acteurAdministrationPostes --- desinstallerApplication
    acteurAdministrationPostes --- demanderPoste
    acteurAdministrationPostes --- demanderSalle
    acteurAdministrationPostes --- suivreInterventions
    acteurAdministrationPostes --- recevoirFin
    acteurAdministrationPostes --- gererPostes

    consulterApplications --- administrationDistante
    installerApplication --- administrationDistante
    desinstallerApplication --- administrationDistante
    demanderPoste --- administrationDistante
    demanderSalle --- administrationDistante
    suivreInterventions --- administrationDistante

    classDef acteurReel fill:#DCEEFF,stroke:#2878B5,color:#102A43,stroke-width:1.5px
    classDef acteurAbstrait fill:#E3F5E6,stroke:#35864A,color:#173B22,stroke-width:2px,stroke-dasharray:6 4
    classDef acteurSecondaire fill:#FFECBD,stroke:#E8B84E,color:#17243B
    classDef casUtilisation fill:#F5F2FF,stroke:#6954C0,color:#241C45
    class administrateur,superAdministrateur acteurReel
    class acteurAdministrationPostes acteurAbstrait
    class administrationDistante acteurSecondaire
    class consulterApplications,installerApplication,desinstallerApplication,demanderPoste,demanderSalle,suivreInterventions,recevoirFin,gererPostes casUtilisation

    style orion fill:none,stroke:#7D8793,stroke-width:1px
```
