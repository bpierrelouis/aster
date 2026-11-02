# DCU — Administrer les postes

```mermaid
flowchart LR
    administrateur(["Administrateur"])

    subgraph aster["Application web ASTER — Administration des postes"]
        direction TB
        consulterApplications(["Consulter les applications installées"])
        demanderPoste(["Demander la réinstallation d'un poste"])
        demanderSalle(["Demander la réinstallation d'une salle"])
    end

    agentAster(["Agent ASTER installé<br/>sur la machine cible"])

    administrateur --- consulterApplications
    administrateur --- demanderPoste
    administrateur --- demanderSalle

    consulterApplications --- agentAster
    demanderPoste --- agentAster
    demanderSalle --- agentAster

    classDef acteur fill:#C2E5FF,stroke:#3DADFF,color:#17243B
    classDef acteurSecondaire fill:#FFECBD,stroke:#E8B84E,color:#17243B
    classDef cas fill:#F6F4FB,stroke:#6954C0,color:#17243B
    class administrateur acteur
    class agentAster acteurSecondaire
    class consulterApplications,demanderPoste,demanderSalle cas
```

## Acteurs

- **Administrateur** : consulte les applications installées et réalise la masterisation d'un poste ou d'une salle.
- **Agent ASTER** : composant de la suite ASTER installé sur chaque machine cible ; il porte les échanges fonctionnels liés aux applications installées et à la réinstallation.

## Règles représentées

- la masterisation consiste à réappliquer une image système sur un poste Windows ;
- seul l'administrateur réalise la masterisation ;
- le sujet prévoit la réinstallation d'un poste ainsi que celle d'une salle complète ;
- l'agent installé sur la machine cible appartient à la suite ASTER.

## Limites

- le format et le protocole de collecte des applications installées par l'agent restent à définir ;
- il reste à décider si ASTER exécute la réinstallation, la déclenche dans un outil tiers ou crée seulement une demande ;
- le déploiement, la configuration, l'authentification et la mise à jour de l'agent restent à préciser ;
- le choix de l'image, la planification, la confirmation, l'annulation, la progression et le compte rendu d'une réinstallation restent ouverts ;
- aucun suivi de résultat n'est représenté tant que son comportement n'est pas confirmé.
