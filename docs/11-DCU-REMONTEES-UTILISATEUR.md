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
