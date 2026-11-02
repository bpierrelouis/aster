# DCU — Superviser les postes

```mermaid
flowchart LR
    acteurSupervision(["Acteur de supervision"])
    formateur(["Formateur"])
    administrateur(["Administrateur"])

    formateur -->|« hérite de »| acteurSupervision
    administrateur -->|« hérite de »| acteurSupervision

    subgraph aster["Application web ASTER — Supervision des postes"]
        direction TB
        accederSalle(["Accéder à une salle"])
        consulterEtat(["Consulter l'état des postes"])
        consulterProcessus(["Consulter les processus utilisateur"])
        arreterProcessus(["Arrêter manuellement un processus"])
        gererListes(["Gérer la whitelist et la blacklist"])
        appliquerRegles(["Classer les processus et<br/>appliquer les règles"])
        arreterInterdit(["Arrêter automatiquement<br/>un processus blacklisté"])
        consulterAlertes(["Recevoir et consulter une alerte<br/>de processus blacklisté"])
        consulterStatistiques(["Consulter les statistiques d'utilisation<br/>(à valider)"])
    end

    agentAster(["Agent ASTER installé<br/>sur la machine cible"])

    acteurSupervision --- accederSalle
    acteurSupervision --- consulterEtat
    acteurSupervision --- consulterProcessus
    acteurSupervision --- arreterProcessus
    acteurSupervision --- consulterAlertes
    administrateur --- gererListes
    administrateur -.->|« proposition »| consulterStatistiques

    consulterEtat -.->|« include »| accederSalle
    consulterProcessus -.->|« include »| accederSalle
    arreterProcessus -.->|« include »| consulterProcessus
    arreterInterdit -.->|« extend »| appliquerRegles

    consulterEtat --- agentAster
    consulterProcessus --- agentAster
    arreterProcessus --- agentAster
    appliquerRegles --- agentAster

    classDef acteur fill:#C2E5FF,stroke:#3DADFF,color:#17243B
    classDef acteurGeneral fill:#E8F5E9,stroke:#3E9B4B,color:#17243B
    classDef acteurSecondaire fill:#FFECBD,stroke:#E8B84E,color:#17243B
    classDef cas fill:#F6F4FB,stroke:#6954C0,color:#17243B
    classDef casAValider fill:#FFF8E1,stroke:#D39E00,color:#17243B,stroke-dasharray: 5 5
    class formateur,administrateur acteur
    class acteurSupervision acteurGeneral
    class agentAster acteurSecondaire
    class accederSalle,consulterEtat,consulterProcessus,arreterProcessus,gererListes,appliquerRegles,arreterInterdit,consulterAlertes cas
    class consulterStatistiques casAValider
```

## Acteurs

- **Acteur de supervision** : acteur général portant les consultations et l'arrêt manuel communs au formateur et à l'administrateur.
- **Formateur** : peut entrer dans toutes les salles, une salle à la fois, consulter les processus utilisateur et les arrêter. Il ne dispose pas d'une vue globale de supervision.
- **Administrateur** : possède les mêmes droits de supervision et gère seul la whitelist et la blacklist. La consultation des statistiques d'utilisation lui est proposée, mais reste à valider.
- **Agent ASTER** : composant de la suite ASTER installé sur chaque machine cible ; il porte les remontées de supervision et les commandes d'arrêt, simulées pour la démonstration.

## Règles représentées

- les processus internes du système d'exploitation sont exclus des données de supervision ;
- les données d'un poste connecté sont actualisées toutes les cinq secondes ; après environ quinze secondes sans remontée, le poste reste visible mais sans processus ;
- un processus absent de la blacklist est autorisé ; un processus absent des deux listes est classé « non référencé » ;
- un processus blacklisté est arrêté automatiquement, sans confirmation ni justification, puis génère une alerte et un historique ;
- l'alerte est destinée à l'administrateur et au formateur qui supervise la salle concernée ;
- les détections blacklistées et non référencées sont historisées, contrairement aux exécutions whitelistées.

## Limites

- les données de supervision et les arrêts sont simulés pour la démonstration, mais un agent de la suite ASTER est installé sur chaque machine cible ; son protocole et ses modalités de déploiement restent à définir ;
- la durée de conservation de l'historique reste à confirmer ;
- la présence même des statistiques d'utilisation, leurs indicateurs et leurs règles de calcul restent à valider.
