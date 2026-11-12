# DCU — Créer une remontée et consulter son état des lieux

```mermaid
flowchart LR
    auteurRemontee(["Auteur de remontée"])
    consultantRemontees(["Consultant des remontées"])
    lecteurRemontee(["Lecteur d'une remontée autorisée"])
    acteurTraitement(["Acteur de traitement des remontées"])
    formateur(["Formateur"])
    gestionnaire(["Gestionnaire"])
    administrateur(["Administrateur"])
    superAdministrateur(["Super administrateur"])

    formateur -->|« hérite de »| auteurRemontee
    administrateur -->|« hérite de »| auteurRemontee
    gestionnaire -->|« hérite de »| consultantRemontees
    administrateur -->|« hérite de »| consultantRemontees
    gestionnaire -->|« hérite de »| acteurTraitement
    administrateur -->|« hérite de »| acteurTraitement
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
    acteurTraitement --- marquerRemplace
    administrateur --- marquerCorrige
    formateur ---|sa propre remontée| recevoirNotification
    gestionnaire --- recevoirNouvelleRemontee

    marquerRemplace -.->|« include »| consulterRemontee
    marquerCorrige -.->|« include »| consulterRemontee

    classDef acteurReel fill:#DCEEFF,stroke:#2878B5,color:#102A43,stroke-width:1.5px
    classDef acteurAbstrait fill:#E3F5E6,stroke:#35864A,color:#173B22,stroke-width:2px,stroke-dasharray:6 4
    classDef casUtilisation fill:#F5F2FF,stroke:#6954C0,color:#241C45
    class formateur,gestionnaire,administrateur,superAdministrateur acteurReel
    class auteurRemontee,consultantRemontees,lecteurRemontee,acteurTraitement acteurAbstrait
    class creerRemontee,suivreRemontee,consulterRemontee,consulterPdf,telechargerPdf,consulterTableau,marquerRemplace,marquerCorrige,recevoirNotification,recevoirNouvelleRemontee casUtilisation

    style orion fill:none,stroke:#7D8793,stroke-width:1px
```
