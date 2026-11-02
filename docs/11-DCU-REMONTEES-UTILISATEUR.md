# DCU — Créer une remontée et consulter son état des lieux

```mermaid
flowchart LR
    auteurRemontee(["Auteur de remontée"])
    consultantRemontees(["Consultant des remontées"])
    formateur(["Formateur"])
    gestionnaire(["Gestionnaire"])
    administrateur(["Administrateur"])

    formateur -->|« hérite de »| auteurRemontee
    administrateur -->|« hérite de »| auteurRemontee
    gestionnaire -->|« hérite de »| consultantRemontees
    administrateur -->|« hérite de »| consultantRemontees

    subgraph aster["Application web ASTER — Remontées utilisateur"]
        direction TB
        creerRemontee(["Créer une remontée"])
        consulterPdf(["Consulter un PDF d'état des lieux"])
        consulterTableau(["Consulter le tableau de bord des remontées"])
    end

    auteurRemontee --- creerRemontee
    consultantRemontees --- consulterPdf
    consultantRemontees --- consulterTableau

    classDef acteur fill:#C2E5FF,stroke:#3DADFF,color:#17243B
    classDef acteurAbstrait fill:#E8F5E9,stroke:#3E9B4B,color:#17243B
    classDef cas fill:#F6F4FB,stroke:#6954C0,color:#17243B
    class formateur,gestionnaire,administrateur acteur
    class auteurRemontee,consultantRemontees acteurAbstrait
    class creerRemontee,consulterPdf,consulterTableau cas
```

## Acteurs

- **Auteur de remontée** : acteur abstrait portant la création d'une remontée, commune au formateur et à l'administrateur.
- **Consultant des remontées** : acteur abstrait portant la consultation des PDF d'état des lieux et du tableau de bord spécialisé des remontées, commune au gestionnaire et à l'administrateur.
- **Formateur** : hérite des actions de l'auteur de remontée.
- **Gestionnaire** : hérite des actions du consultant des remontées.
- **Administrateur** : hérite des deux acteurs abstraits et dispose ainsi des actions de création et de consultation.

## Règles représentées

- une remontée est créée par un utilisateur ASTER authentifié et concerne un ou plusieurs matériels ;
- le ou les matériels et la description du problème sont obligatoires ;
- la remontée n'est rattachée directement ni à une salle ni à un poste ; la localisation affichée provient de chaque matériel concerné ;
- la transmission de la remontée génère automatiquement un PDF d'état des lieux ;
- le PDF contient le matériel ou son type, le type de problème, sa description et les localisations renseignées ;
- les statuts de la remontée sont « en attente », « remplacé » et « corrigé », sans cycle de transition défini.

## Limites

- le contenu, les indicateurs et les filtres du tableau de bord spécialisé des remontées restent à définir ;
- la qualification, l'affectation, le traitement, le suivi et les notifications de changement de statut restent à définir ;
- les modalités de téléchargement des PDF ne sont pas précisées.
