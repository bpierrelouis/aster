# DCU — Administrer les postes

<!-- version:debut : généré par versions.py, ne pas modifier à la main -->
| Version | Mise à jour | Destination | Dernière évolution | Historique |
| --- | --- | --- | --- | --- |
| 1.4 | 12/11/2026 | Production destinée à la remise | Renommer le projet en ORION dans tout le dépôt | [5 versions](../archive/README.md#09-dcu-administration-postes) |
<!-- version:fin -->

```mermaid
flowchart LR
    administrateur(["Administrateur"])
    superAdministrateur(["Super administrateur"])

    superAdministrateur -->|« hérite de »| administrateur

    subgraph orion["Application web ORION — Administration des postes"]
        direction TB
        consulterApplications(["Consulter les applications installées"])
        installerApplication(["Installer une application<br/>sur un poste ou une salle"])
        desinstallerApplication(["Désinstaller une application<br/>sur un poste ou une salle"])
        demanderPoste(["Demander la réinstallation<br/>d'un ou plusieurs postes"])
        demanderSalle(["Demander la réinstallation d'une salle"])
        suivreInterventions(["Suivre les demandes d'intervention"])
    end

    administrationDistante(["Solution d’administration<br/>et de déploiement des postes"])

    administrateur --- consulterApplications
    administrateur --- installerApplication
    administrateur --- desinstallerApplication
    administrateur --- demanderPoste
    administrateur --- demanderSalle
    administrateur --- suivreInterventions
    consulterApplications --- administrationDistante
    installerApplication --- administrationDistante
    desinstallerApplication --- administrationDistante
    demanderPoste --- administrationDistante
    demanderSalle --- administrationDistante
    suivreInterventions --- administrationDistante

    classDef acteurReel fill:#DCEEFF,stroke:#2878B5,color:#102A43,stroke-width:1.5px
    classDef acteurSecondaire fill:#FFECBD,stroke:#E8B84E,color:#17243B
    classDef casUtilisation fill:#F5F2FF,stroke:#6954C0,color:#241C45
    class administrateur,superAdministrateur acteurReel
    class administrationDistante acteurSecondaire
    class consulterApplications,installerApplication,desinstallerApplication,demanderPoste,demanderSalle,suivreInterventions casUtilisation

    style orion fill:none,stroke:#7D8793,stroke-width:1px
```
