# DCU — Gérer le parc

<!-- version:debut : généré par versions.py, ne pas modifier à la main -->
| Version | Mise à jour | Destination | Dernière évolution | Historique |
| --- | --- | --- | --- | --- |
| 1.5 | 14/11/2026 | Production destinée à la remise | RIGEL : installation et recensement consolidés, notion de campagne retirée ; DCU complété d’après l’application | [6 versions](../../../archive/README.md#08-dcu-gestion-parc) |
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
        rapprocher(["Rapprocher les numéros de série<br/>de tout le parc"])
        transferer(["Changer l'école d'un matériel<br/>par un transfert validé"])
        modifier(["Modifier un matériel"])
        renseignerGarantie(["Renseigner la fin de garantie"])
        affecter(["Affecter un ou plusieurs matériels<br/>à une salle ou au stock"])
        consulterStock(["Consulter le stock"])
        consulterTableau(["Consulter le tableau de bord du parc"])
        supprimer(["Supprimer un ou plusieurs matériels"])
        gererSalles(["Gérer les salles et les étages"])
        installer(["Installer une salle"])
        recenser(["Recenser le parc"])
        suivreInstallations(["Suivre les installations<br/>et les recensements"])
        lierTelephone(["Lier son téléphone à RIGEL<br/>par un QR code"])
        traiterConstats(["Traiter les anciens constats"])
    end

    rigel(["RIGEL"])

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
    acteurGestion --- suivreInstallations
    gestionnaire --- recevoirGarantie
    gestionnaire --- installer
    gestionnaire --- recenser
    gestionnaire --- traiterConstats
    acteurAdministrationParc --- supprimer
    acteurAdministrationParc --- gererSalles

    modifier -.->|« include »| consulter
    supprimer -.->|« include »| consulter
    affecter -.->|« include »| rechercher
    renseignerGarantie -.->|« extend »| modifier
    importer -.->|« include »| rapprocher
    transferer -.->|« extend »| importer
    installer -.->|« include »| lierTelephone
    recenser -.->|« include »| lierTelephone
    traiterConstats -.->|« extend »| recenser

    lierTelephone --- rigel

    classDef acteurReel fill:#DCEEFF,stroke:#2878B5,color:#102A43,stroke-width:1.5px
    classDef acteurAbstrait fill:#E3F5E6,stroke:#35864A,color:#173B22,stroke-width:2px,stroke-dasharray:6 4
    classDef acteurSecondaire fill:#FFECBD,stroke:#E8B84E,color:#17243B
    classDef casUtilisation fill:#F5F2FF,stroke:#6954C0,color:#241C45

    class formateur,gestionnaire,administrateur,superAdministrateur acteurReel
    class consultantParc,acteurGestion,acteurAdministrationParc acteurAbstrait
    class rigel acteurSecondaire
    class consulterSalles,consulter,recevoirGarantie,rechercher,enregistrer,importer,modifier,renseignerGarantie,affecter,consulterStock,supprimer,gererSalles,consulterTableau,installer,recenser,rapprocher,transferer,suivreInstallations,lierTelephone,traiterConstats casUtilisation

    style orion fill:none,stroke:#7D8793,stroke-width:1px
```
