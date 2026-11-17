# DCU — Administrer ORION et personnaliser son espace

<!-- version:debut : généré par versions.py, ne pas modifier à la main -->
| Version | Mise à jour | Destination | Dernière évolution | Historique |
| --- | --- | --- | --- | --- |
| 3.1 | 17/11/2026 | Production destinée à la remise | Employer l’apostrophe typographique | [5 versions](../../../archive/README.md#07-dcu-administrer-orion) |
<!-- version:fin -->

```mermaid
flowchart LR
    utilisateur(["Utilisateur ORION"])
    formateur(["Formateur"])
    gestionnaire(["Gestionnaire"])
    administrateur(["Administrateur"])
    superAdministrateur(["Super administrateur"])
    exploitant(["Exploitant"])
    acteurAdministrationComptes(["Acteur d’administration<br/>des comptes"])

    formateur -->|« hérite de »| utilisateur
    gestionnaire -->|« hérite de »| utilisateur
    acteurAdministrationComptes -->|« hérite de »| utilisateur
    administrateur -->|« hérite de »| acteurAdministrationComptes
    superAdministrateur -->|« hérite de »| acteurAdministrationComptes

    subgraph orion["Application web ORION — Administration d’ORION et espace personnel"]
        direction TB
        seConnecter(["Se connecter par MindefConnect"])
        consulterNotifications(["Consulter ses notifications"])
        personnaliserTableaux(["Personnaliser ses tableaux de bord"])
        choisirAmbiance(["Choisir son ambiance d’affichage"])
        rechercherOrion(["Rechercher dans ORION"])
        seDeconnecter(["Se déconnecter"])
        consulterComptes(["Consulter les comptes ORION"])
        creerCompte(["Créer un compte ORION"])
        modifierCompte(["Modifier un compte ORION"])
        desactiverCompte(["Désactiver un compte ORION"])
        reactiverCompte(["Réactiver un compte ORION"])
        creerSuperAdministrateur(["Créer un compte<br/>de super administrateur"])
        changerEcole(["Changer l’école<br/>d’un administrateur"])
        creerEcole(["Créer une école"])
        renommerEcole(["Renommer une école"])
        choisirEcole(["Choisir l’école affichée<br/>ou toutes les écoles"])
        designerPremierSuperAdministrateur(["Désigner le premier<br/>super administrateur<br/>d’un espace neuf"])
    end

    mindefConnect(["« système »<br/>MindefConnect"])

    utilisateur --- seConnecter
    utilisateur --- consulterNotifications
    utilisateur --- personnaliserTableaux
    utilisateur --- choisirAmbiance
    utilisateur --- rechercherOrion
    utilisateur --- seDeconnecter
    acteurAdministrationComptes --- consulterComptes
    acteurAdministrationComptes --- creerCompte
    acteurAdministrationComptes --- modifierCompte
    acteurAdministrationComptes --- desactiverCompte
    acteurAdministrationComptes --- reactiverCompte
    superAdministrateur --- creerSuperAdministrateur
    superAdministrateur --- changerEcole
    superAdministrateur --- creerEcole
    superAdministrateur --- renommerEcole
    superAdministrateur --- choisirEcole
    exploitant --- designerPremierSuperAdministrateur

    modifierCompte -.->|« include »| consulterComptes
    desactiverCompte -.->|« include »| consulterComptes
    reactiverCompte -.->|« include »| consulterComptes
    creerSuperAdministrateur -.->|« extend »| creerCompte
    changerEcole -.->|« extend »| modifierCompte

    seConnecter --- mindefConnect
    seDeconnecter --- mindefConnect

    classDef acteurReel fill:#DCEEFF,stroke:#2878B5,color:#102A43,stroke-width:1.5px
    classDef acteurAbstrait fill:#E3F5E6,stroke:#35864A,color:#173B22,stroke-width:2px,stroke-dasharray:6 4
    classDef acteurSecondaire fill:#FFECBD,stroke:#E8B84E,color:#17243B
    classDef casUtilisation fill:#F5F2FF,stroke:#6954C0,color:#241C45
    class formateur,gestionnaire,administrateur,superAdministrateur,exploitant acteurReel
    class utilisateur,acteurAdministrationComptes acteurAbstrait
    class mindefConnect acteurSecondaire
    class seConnecter,consulterNotifications,personnaliserTableaux,choisirAmbiance,rechercherOrion,seDeconnecter,consulterComptes,creerCompte,modifierCompte,desactiverCompte,reactiverCompte,creerSuperAdministrateur,changerEcole,creerEcole,renommerEcole,choisirEcole,designerPremierSuperAdministrateur casUtilisation

    style orion fill:none,stroke:#7D8793,stroke-width:1px
```
