# Diagramme de contexte de l'application ORION

```mermaid
flowchart LR
    gestionnaire(["Gestionnaire"])
    administrateur(["Administrateur"])
    formateur(["Formateur"])
    subgraph suite["Suite ORION"]
        orion["Application ORION"]
        agent["Agent ORION<br/>installé sur chaque machine cible"]
    end

    gestionnaire -->|"Création, modification<br/>et affectation des matériels"| orion
    orion -->|"Inventaire, stocks et localisation<br/>Tableaux de bord et PDF d'état des lieux"| gestionnaire

    administrateur -->|"Toutes les actions : gestion du parc,<br/>administration et supervision"| orion
    orion -->|"Données du parc, tableaux de bord,<br/>PDF et résultats des actions"| administrateur

    formateur -->|"Consultation d'une salle, arrêt de<br/>processus utilisateur et remontée"| orion
    orion -->|"Sessions et processus utilisateur<br/>PDF de la remontée"| formateur

    agent -->|"Applications installées<br/>Sessions et processus utilisateur"| orion
    orion -->|"Réinstallation et contrôle des processus"| agent
```
