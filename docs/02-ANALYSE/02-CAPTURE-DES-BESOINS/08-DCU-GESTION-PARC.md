# DCU — Gérer le parc

<!-- version:debut : généré par versions.py, ne pas modifier à la main -->
| Version | Mise à jour | Destination | Dernière évolution | Historique |
| --- | --- | --- | --- | --- |
| 1.5 | 14/11/2026 | Production destinée à la remise | RIGEL : installation et recensement consolidés, notion de campagne retirée | [6 versions](../../../archive/README.md#08-dcu-gestion-parc) |
<!-- version:fin -->

```mermaid
flowchart LR
    formateur(["Formateur"])
    gestionnaire(["Gestionnaire"])
    administrateur(["Administrateur"])
    superAdministrateur(["Super administrateur"])
    consultantParc(["Consultant du parc"])
    acteurGestion(["Acteur de gestion du parc"])
    acteurAdministrationParc(["Acteur d'administration du parc"])

    formateur -->|« hérite de »| consultantParc
    acteurGestion -->|« hérite de »| consultantParc
    gestionnaire -->|« hérite de »| acteurGestion
    administrateur -->|« hérite de »| acteurGestion
    administrateur -->|« hérite de »| acteurAdministrationParc
    superAdministrateur -->|« hérite de »| administrateur

    subgraph orion["Application web ORION — Gestion du parc"]
        direction TB
        consulterSalles(["Consulter les salles par bâtiment<br/>et le matériel de chaque salle"])
        consulter(["Consulter la fiche d'un matériel"])
        recevoirGarantie(["Recevoir une notification<br/>de fin de garantie"])
        rechercher(["Rechercher un matériel"])
        enregistrer(["Enregistrer un matériel"])
        importer(["Importer de nouveaux matériels en JSON"])
        modifier(["Modifier un matériel"])
        renseignerGarantie(["Renseigner la fin de garantie"])
        affecter(["Affecter un ou plusieurs matériels<br/>à une salle ou au stock"])
        consulterStock(["Consulter le stock"])
        consulterTableau(["Consulter le tableau de bord du parc"])
        supprimer(["Supprimer un ou plusieurs matériels"])
        gererSalles(["Gérer les salles et les étages"])
        installer(["Installer une salle"])
        recenser(["Recenser le parc"])
    end

    consultantParc --- consulterSalles
    consultantParc --- consulter
    acteurGestion --- rechercher
    acteurGestion --- enregistrer
    acteurGestion --- importer
    acteurGestion --- modifier
    acteurGestion --- renseignerGarantie
    acteurGestion --- affecter
    acteurGestion --- consulterStock
    acteurGestion --- consulterTableau
    gestionnaire --- recevoirGarantie
    gestionnaire --- installer
    gestionnaire --- recenser
    acteurAdministrationParc --- supprimer
    acteurAdministrationParc --- gererSalles

    consulter -.->|« include »| rechercher
    modifier -.->|« include »| consulter
    supprimer -.->|« include »| consulter
    affecter -.->|« include »| rechercher
    renseignerGarantie -.->|« extend »| modifier

    classDef acteurReel fill:#DCEEFF,stroke:#2878B5,color:#102A43,stroke-width:1.5px
    classDef acteurAbstrait fill:#E3F5E6,stroke:#35864A,color:#173B22,stroke-width:2px,stroke-dasharray:6 4
    classDef casUtilisation fill:#F5F2FF,stroke:#6954C0,color:#241C45

    class formateur,gestionnaire,administrateur,superAdministrateur acteurReel
    class consultantParc,acteurGestion,acteurAdministrationParc acteurAbstrait
    class consulterSalles,consulter,recevoirGarantie,rechercher,enregistrer,importer,modifier,renseignerGarantie,affecter,consulterStock,supprimer,gererSalles,consulterTableau,installer,recenser casUtilisation

    style orion fill:none,stroke:#7D8793,stroke-width:1px
```
