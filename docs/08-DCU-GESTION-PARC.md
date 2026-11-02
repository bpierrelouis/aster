# DCU — Gérer le parc

```mermaid
flowchart LR
    acteurGestion(["Acteur de gestion du parc"])
    gestionnaire(["Gestionnaire"])
    administrateur(["Administrateur"])

    gestionnaire -->|« hérite de »| acteurGestion
    administrateur -->|« hérite de »| acteurGestion

    subgraph aster["Application web ASTER — Gestion du parc"]
        direction TB
        rechercher(["Rechercher un matériel"])
        enregistrer(["Enregistrer un matériel"])
        consulter(["Consulter la fiche d'un matériel"])
        modifier(["Modifier un matériel"])
        supprimer(["Supprimer un matériel"])
        affecter(["Rattacher un matériel à une école,<br/>un bâtiment ou une salle"])
        deplacer(["Déplacer un matériel"])
        affecterGroupe(["Affecter plusieurs matériels"])
        consulterParc(["Consulter l'état du parc"])
        consulterTableau(["Consulter le tableau de bord du parc"])
        renseignerGarantie(["Renseigner la fin de garantie<br/>(bonus)"])
    end

    acteurGestion --- rechercher
    acteurGestion --- enregistrer
    acteurGestion --- consulter
    acteurGestion --- modifier
    acteurGestion --- affecter
    acteurGestion --- deplacer
    acteurGestion --- affecterGroupe
    acteurGestion --- consulterParc
    acteurGestion --- consulterTableau
    acteurGestion --- renseignerGarantie
    administrateur --- supprimer

    consulter -.->|« include »| rechercher
    modifier -.->|« include »| consulter
    supprimer -.->|« include »| consulter
    affecter -.->|« include »| rechercher
    deplacer -.->|« include »| rechercher
    affecterGroupe -.->|« include »| rechercher

    classDef acteur fill:#C2E5FF,stroke:#3DADFF,color:#17243B
    classDef acteurGeneral fill:#E8F5E9,stroke:#3E9B4B,color:#17243B
    classDef cas fill:#F6F4FB,stroke:#6954C0,color:#17243B
    class gestionnaire,administrateur acteur
    class acteurGestion acteurGeneral
    class rechercher,enregistrer,consulter,modifier,supprimer,affecter,deplacer,affecterGroupe,consulterParc,consulterTableau,renseignerGarantie cas
```

## Acteurs

- **Acteur de gestion du parc** : acteur général portant les actions communes de gestion du parc.
- **Gestionnaire** : crée, consulte et modifie les matériels, gère les stocks et réalise les affectations, sans pouvoir supprimer de matériel.
- **Administrateur** : dispose de tous les droits et peut donc réaliser les mêmes actions de gestion du parc.

## Règles représentées

- un matériel peut être rattaché directement à une école, un bâtiment ou une salle, ou rester sans localisation lorsqu'il est en stock ;
- une affectation ou un déplacement prend effet immédiatement et peut concerner plusieurs matériels ;
- le gestionnaire ne peut pas supprimer de matériel ; l'administrateur, qui dispose de tous les droits, porte seul ce cas ;
- le numéro de série est facultatif, tandis que le modèle, la date de réception et l'état « hors service : oui/non » sont obligatoires ;
- la gestion de la garantie est un bonus limité à une date de fin, renseignée par le gestionnaire ou l'administrateur ;
- ASTER ne gère ni formations induites ni durées d'aptitude ;
- le CND n'est pas un système connecté à ASTER.

## Limites

- l'enregistrement peut être manuel ou provenir d'un import JSON réalisé par le gestionnaire ou l'administrateur ;
- la prévention des doublons et les critères détaillés de recherche restent à définir.
