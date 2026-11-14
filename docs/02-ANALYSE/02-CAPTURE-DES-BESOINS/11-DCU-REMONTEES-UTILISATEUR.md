# DCU — Créer une remontée et consulter son état des lieux

<!-- version:debut : généré par versions.py, ne pas modifier à la main -->
| Version | Mise à jour | Destination | Dernière évolution | Historique |
| --- | --- | --- | --- | --- |
| 3.1 | 14/11/2026 | Production destinée à la remise | Déplacer dans docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/ | [7 versions](../../../archive/README.md#11-dcu-remontees-utilisateur) |
<!-- version:fin -->

```mermaid
flowchart LR
    auteurRemontee(["Auteur de remontée"])
    consultantRemontees(["Consultant des remontées"])
    lecteurRemontee(["Lecteur d'une remontée autorisée"])
    formateur(["Formateur"])
    gestionnaire(["Gestionnaire"])
    administrateur(["Administrateur"])
    superAdministrateur(["Super administrateur"])

    formateur -->|« hérite de »| auteurRemontee
    administrateur -->|« hérite de »| auteurRemontee
    gestionnaire -->|« hérite de »| consultantRemontees
    administrateur -->|« hérite de »| consultantRemontees
    formateur -->|« hérite de »| lecteurRemontee
    consultantRemontees -->|« hérite de »| lecteurRemontee
    superAdministrateur -->|« hérite de »| administrateur

    subgraph orion["Application web ORION — Remontées utilisateur"]
        direction TB
        creerRemontee(["Créer une remontée"])
        suivreRemontee(["Suivre l'avancement de ses remontées"])
        consulterRemontee(["Consulter une remontée et son suivi"])
        consulterPdf(["Consulter un PDF d'état des lieux"])
        telechargerPdf(["Télécharger ou imprimer<br/>un PDF d'état des lieux"])
        consulterTableau(["Consulter le tableau de bord des remontées"])
        prendreEnCharge(["Prendre en charge une remontée"])
        marquerRemplace(["Marquer une remontée « remplacé »"])
        marquerCorrige(["Marquer une remontée « corrigé »"])
        recevoirNotification(["Recevoir une notification<br/>lors d'un changement de statut"])
        recevoirNouvelleRemontee(["Recevoir une notification<br/>de nouvelle remontée"])
    end

    auteurRemontee --- creerRemontee
    auteurRemontee --- suivreRemontee
    lecteurRemontee --- consulterRemontee
    lecteurRemontee --- consulterPdf
    lecteurRemontee --- telechargerPdf
    consultantRemontees --- consulterTableau
    gestionnaire --- prendreEnCharge
    gestionnaire --- marquerRemplace
    gestionnaire --- marquerCorrige
    auteurRemontee ---|sa propre remontée| recevoirNotification
    gestionnaire --- recevoirNouvelleRemontee

    prendreEnCharge -.->|« include »| consulterRemontee
    marquerRemplace -.->|« include »| consulterRemontee
    marquerCorrige -.->|« include »| consulterRemontee

    classDef acteurReel fill:#DCEEFF,stroke:#2878B5,color:#102A43,stroke-width:1.5px
    classDef acteurAbstrait fill:#E3F5E6,stroke:#35864A,color:#173B22,stroke-width:2px,stroke-dasharray:6 4
    classDef casUtilisation fill:#F5F2FF,stroke:#6954C0,color:#241C45
    class formateur,gestionnaire,administrateur,superAdministrateur acteurReel
    class auteurRemontee,consultantRemontees,lecteurRemontee acteurAbstrait
    class creerRemontee,suivreRemontee,consulterRemontee,consulterPdf,telechargerPdf,consulterTableau,prendreEnCharge,marquerRemplace,marquerCorrige,recevoirNotification,recevoirNouvelleRemontee casUtilisation

    style orion fill:none,stroke:#7D8793,stroke-width:1px
```
