# Modèle logique de données

<!-- version:debut : généré par versions.py, ne pas modifier à la main -->
| Version | Mise à jour | Destination | Dernière évolution | Historique |
| --- | --- | --- | --- | --- |
| 1.0 | 17/11/2026 | Production destinée à la remise | Créer le modèle logique de données et sa correspondance avec le modèle physique ; Créer le modèle logique de données et sa correspondance avec le modèle physique ; Créer le modèle logique de données en quatre vues | [1 version](../../../archive/README.md#03-modele-logique-donnees) |
<!-- version:fin -->

## Organisation, comptes et parc

```mermaid
erDiagram
    ECOLE["ÉCOLE"] {
        text Id_ecole PK
        text nom_ecole
    }
    BATIMENT["BÂTIMENT"] {
        text Id_batiment PK
        text nom_batiment
        text Id_ecole FK
    }
    ETAGE["ÉTAGE"] {
        text Id_etage PK
        integer niveau
        text Id_batiment FK
    }
    SALLE["SALLE"] {
        text Id_salle PK
        text nom_salle
        text Id_etage FK
    }
    COMPTE_ORION["COMPTE_ORION"] {
        text Id_compte_ORION PK
        text nom
        text adresse_electronique
        text identifiant_MindefConnect
        text profil
        boolean actif
        timestamptz date_derniere_connexion
        timestamptz date_desactivation
        timestamptz date_consultation_notifications
        text Id_ecole FK "?"
    }
    MATERIEL["MATÉRIEL"] {
        text identifiant_ORION PK
        text type_materiel
        text numero_serie
        text modele
        text marque
        text adresse_MAC
        timestamptz date_reception
        timestamptz date_fin_garantie
        boolean hors_service
        timestamptz date_mise_hors_service
        text Id_ecole FK
        text Id_salle FK "?"
    }
    ECOLE ||--o{ BATIMENT : "COMPRENDRE"
    BATIMENT ||--o{ ETAGE : "COMPOSER"
    ETAGE ||--o{ SALLE : "SITUER"
    ECOLE |o--o{ COMPTE_ORION : "RATTACHER (nul : super administrateur)"
    ECOLE ||--o{ MATERIEL : "DÉTENIR"
    SALLE |o--o{ MATERIEL : "AFFECTER (nul : stock)"
```

## Remontées et déplacements

```mermaid
erDiagram
    REMONTEE["REMONTÉE"] {
        text numero_remontee PK
        timestamptz date_creation
        text description
        text type_probleme
        text Id_compte_ORION FK
        text Id_ecole FK
    }
    ETAPE_REMONTEE["ÉTAPE_REMONTÉE"] {
        text Id_etape PK
        timestamptz date_etape
        text statut
        text numero_remontee FK
        text Id_compte_ORION FK
    }
    CONCERNER["CONCERNER"] {
        text numero_remontee PK, FK
        text identifiant_ORION PK, FK
    }
    DEPLACEMENT["DÉPLACEMENT"] {
        text Id_deplacement PK
        timestamptz date_demande
        timestamptz date_confirmation
        text identifiant_ORION FK
        text Id_compte_ordonne FK
        text Id_compte_confirme FK "?"
        text Id_salle_origine FK "?"
        text Id_salle_destination FK "?"
    }
    COMPTE_ORION["COMPTE_ORION"] {
        text Id_compte_ORION PK
    }
    ECOLE["ÉCOLE"] {
        text Id_ecole PK
    }
    MATERIEL["MATÉRIEL"] {
        text identifiant_ORION PK
    }
    SALLE["SALLE"] {
        text Id_salle PK
    }
    COMPTE_ORION ||--o{ REMONTEE : "DÉCLARER"
    ECOLE ||--o{ REMONTEE : "RELEVER"
    REMONTEE ||--o{ ETAPE_REMONTEE : "JALONNER"
    COMPTE_ORION ||--o{ ETAPE_REMONTEE : "EFFECTUER"
    REMONTEE ||--|{ CONCERNER : "CONCERNER"
    MATERIEL ||--o{ CONCERNER : "CONCERNER"
    MATERIEL ||--o{ DEPLACEMENT : "DÉPLACER"
    COMPTE_ORION ||--o{ DEPLACEMENT : "ORDONNER"
    COMPTE_ORION |o--o{ DEPLACEMENT : "CONFIRMER"
    SALLE |o--o{ DEPLACEMENT : "PROVENIR (nul : stock)"
    SALLE |o--o{ DEPLACEMENT : "DESTINER (nul : stock)"
```

## Postes, applications et supervision

```mermaid
erDiagram
    SYSTEME_EXPLOITATION["SYSTÈME_EXPLOITATION"] {
        text Id_systeme PK
        text nom_systeme
        text version
    }
    APPLICATION["APPLICATION"] {
        text Id_application PK
        text nom_application
        text version
        text editeur
    }
    PAQUET["PAQUET"] {
        text Id_paquet PK
        text nom_fichier
        text version
        text empreinte
        text Id_application FK "?"
        text Id_systeme FK "?"
    }
    POSTE["POSTE"] {
        text Id_poste PK
        text nom_reseau
        text adresse_IP
        text Id_salle FK
        text identifiant_ORION FK, UK "?"
        text Id_systeme FK "?"
    }
    EQUIPER["ÉQUIPER"] {
        text Id_poste PK, FK
        text Id_application PK, FK
    }
    COMPTE_WINDOWS["COMPTE_WINDOWS"] {
        text Id_compte_Windows PK
        text nom_utilisateur
    }
    PROCESSUS["PROCESSUS"] {
        text Id_processus PK
        text nom_processus
    }
    REGLE["RÈGLE"] {
        text Id_regle PK
        text classement
        text Id_processus FK
        text Id_ecole FK "?"
        text Id_batiment FK "?"
        text Id_salle FK "?"
    }
    DETECTION["DÉTECTION"] {
        text Id_detection PK
        timestamptz date_detection
        text classement
        text resultat_arret
        text Id_poste FK
        text Id_compte_Windows FK
        text Id_processus FK
    }
    SALLE["SALLE"] {
        text Id_salle PK
    }
    MATERIEL["MATÉRIEL"] {
        text identifiant_ORION PK
    }
    ECOLE["ÉCOLE"] {
        text Id_ecole PK
    }
    BATIMENT["BÂTIMENT"] {
        text Id_batiment PK
    }
    APPLICATION |o--o{ PAQUET : "CONDITIONNER (XT)"
    SYSTEME_EXPLOITATION |o--o{ PAQUET : "DISTRIBUER (XT)"
    SALLE ||--o{ POSTE : "ACCUEILLIR"
    MATERIEL |o--o| POSTE : "CONSTITUER (unité centrale)"
    SYSTEME_EXPLOITATION |o--o{ POSTE : "FONCTIONNER"
    POSTE ||--o{ EQUIPER : "ÉQUIPER"
    APPLICATION ||--o{ EQUIPER : "ÉQUIPER"
    PROCESSUS ||--o{ REGLE : "RÉGLEMENTER"
    ECOLE |o--o{ REGLE : "COUVRIR (X)"
    BATIMENT |o--o{ REGLE : "LIMITER (X)"
    SALLE |o--o{ REGLE : "VISER (X)"
    POSTE ||--o{ DETECTION : "SURVENIR"
    COMPTE_WINDOWS ||--o{ DETECTION : "EXÉCUTER"
    PROCESSUS ||--o{ DETECTION : "SIGNALER"
```

## Interventions, opérations RIGEL et constats

```mermaid
erDiagram
    INTERVENTION["INTERVENTION"] {
        text Id_intervention PK
        text type_intervention
        timestamptz date_demande
        timestamptz date_fin
        text Id_compte_ORION FK "?"
        text Id_application FK "?"
        text Id_systeme FK "?"
        text Id_processus FK "?"
        text Id_detection FK "?"
    }
    CIBLER["CIBLER"] {
        text Id_intervention PK, FK
        text Id_poste PK, FK
        text resultat
    }
    OPERATION["OPÉRATION"] {
        text Id_operation PK
        text nom
        text type_operation
        timestamptz date_ouverture
        timestamptz date_expiration
        timestamptz date_cloture
        text Id_compte_ORION FK
        text Id_ecole FK
    }
    INCLURE["INCLURE"] {
        text Id_operation PK, FK
        text Id_salle PK, FK
    }
    CONSTAT["CONSTAT"] {
        text Id_constat PK
        text type
        text code_lu
        text resultat
        text type_materiel_saisi
        text modele_saisi
        text marque_saisie
        text serie_saisie
        timestamptz date_fin_garantie_saisie
        timestamptz date_observation
        timestamptz date_constat
        timestamptz date_traitement
        text Id_operation FK
        text identifiant_ORION FK "?"
        text Id_salle FK "?"
        text Id_compte_traite FK "?"
    }
    COMPTE_ORION["COMPTE_ORION"] {
        text Id_compte_ORION PK
    }
    ECOLE["ÉCOLE"] {
        text Id_ecole PK
    }
    SALLE["SALLE"] {
        text Id_salle PK
    }
    MATERIEL["MATÉRIEL"] {
        text identifiant_ORION PK
    }
    POSTE["POSTE"] {
        text Id_poste PK
    }
    APPLICATION["APPLICATION"] {
        text Id_application PK
    }
    SYSTEME_EXPLOITATION["SYSTÈME_EXPLOITATION"] {
        text Id_systeme PK
    }
    PROCESSUS["PROCESSUS"] {
        text Id_processus PK
    }
    DETECTION["DÉTECTION"] {
        text Id_detection PK
    }
    COMPTE_ORION |o--o{ INTERVENTION : "DEMANDER (nul : automatique)"
    APPLICATION |o--o{ INTERVENTION : "DÉPLOYER"
    SYSTEME_EXPLOITATION |o--o{ INTERVENTION : "RESTAURER"
    PROCESSUS |o--o{ INTERVENTION : "ARRÊTER"
    DETECTION |o--o{ INTERVENTION : "PROVOQUER"
    INTERVENTION ||--|{ CIBLER : "CIBLER"
    POSTE ||--o{ CIBLER : "CIBLER"
    COMPTE_ORION ||--o{ OPERATION : "OUVRIR"
    ECOLE ||--o{ OPERATION : "PORTER"
    OPERATION ||--o{ INCLURE : "INCLURE"
    SALLE ||--o{ INCLURE : "INCLURE"
    OPERATION ||--o{ CONSTAT : "REGROUPER"
    MATERIEL |o--o{ CONSTAT : "IDENTIFIER (nul : inconnu)"
    SALLE |o--o{ CONSTAT : "LOCALISER (nul : stock)"
    COMPTE_ORION |o--o{ CONSTAT : "TRAITER"
```
