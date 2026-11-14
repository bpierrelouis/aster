# Diagramme de contexte de l'application ORION

<!-- version:debut : généré par versions.py, ne pas modifier à la main -->
| Version | Mise à jour | Destination | Dernière évolution | Historique |
| --- | --- | --- | --- | --- |
| 2.0 | 14/11/2026 | Production destinée à la remise | Nommer M42 comme agent candidat | [5 versions](../../../archive/README.md#06-diagramme-contexte) |
<!-- version:fin -->

```mermaid
flowchart LR
    gestionnaire(["Gestionnaire"])
    administrateur(["Administrateur"])
    formateur(["Formateur"])
    subgraph suite["Suite ORION"]
        orion["Application ORION"]
        agent["M42<br/>agent candidat développé par ASTER"]
    end

    gestionnaire -->|"Création, modification<br/>et affectation des matériels"| orion
    orion -->|"Inventaire, stocks et localisation<br/>Tableaux de bord et PDF d'état des lieux"| gestionnaire

    administrateur -->|"Toutes les actions : gestion du parc,<br/>administration et supervision"| orion
    orion -->|"Données du parc, tableaux de bord,<br/>PDF et résultats des actions"| administrateur

    formateur -->|"Consultation d'une salle, arrêt de<br/>processus utilisateur et remontée"| orion
    orion -->|"Sessions et processus utilisateur<br/>PDF de la remontée"| formateur

    agent -->|"Applications installées<br/>Sessions et processus utilisateur"| orion
    orion -->|"Réinitialisation et contrôle des processus"| agent
```
