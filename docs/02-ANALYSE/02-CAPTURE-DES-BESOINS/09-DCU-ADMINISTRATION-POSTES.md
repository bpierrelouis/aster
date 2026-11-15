# DCU — Administrer les postes

<!-- version:debut : généré par versions.py, ne pas modifier à la main -->
| Version | Mise à jour | Destination | Dernière évolution | Historique |
| --- | --- | --- | --- | --- |
| 2.0 | 15/11/2026 | Production destinée à la remise | DCU complété d’après l’application | [8 versions](../../../archive/README.md#09-dcu-administration-postes) |
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
        demanderPoste(["Demander la réinitialisation<br/>d'un ou plusieurs postes"])
        demanderSalle(["Demander la réinitialisation d'une salle"])
        suivreInterventions(["Suivre les demandes d'intervention"])
        recevoirFin(["Recevoir une notification de fin<br/>d'une intervention qu'il a demandée"])
        gererPostes(["Gérer les postes supervisés"])
        gererCatalogue(["Gérer le catalogue des applications"])
    end

    administrationDistante(["Solution d’administration<br/>et de déploiement des postes"])

    administrateur --- consulterApplications
    administrateur --- installerApplication
    administrateur --- desinstallerApplication
    administrateur --- demanderPoste
    administrateur --- demanderSalle
    administrateur --- suivreInterventions
    administrateur --- recevoirFin
    administrateur --- gererPostes
    administrateur --- gererCatalogue

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
    class consulterApplications,installerApplication,desinstallerApplication,demanderPoste,demanderSalle,suivreInterventions,recevoirFin,gererPostes,gererCatalogue casUtilisation

    style orion fill:none,stroke:#7D8793,stroke-width:1px
```
