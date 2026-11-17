# Modèle physique des données

<!-- version:debut : généré par versions.py, ne pas modifier à la main -->
| Version | Mise à jour | Destination | Dernière évolution | Historique |
| --- | --- | --- | --- | --- |
| 4.1 | 17/11/2026 | Production destinée à la remise | Renuméroter après l’ajout du modèle logique | [6 versions](../../../archive/README.md#04-modele-physique-donnees) |
<!-- version:fin -->

## Base ORION : tables relationnelles

```mermaid
classDiagram
    direction LR
    class espace {
        <<Table>>
        «PK» id : smallint CHECK id = 1
        version_donnees : integer NOT NULL
        revision : integer NOT NULL
        initialise_le : timestamptz NOT NULL
    }
    class journal {
        <<Table>>
        «PK» revision : integer
        cles : json NOT NULL
    }
    class migration {
        <<Table>>
        «PK» version : integer
        nom : text NOT NULL
        appliquee_le : timestamptz NOT NULL
    }
    class session {
        <<Table>>
        «PK» sid : varchar
        sess : json NOT NULL
        expire : timestamp#40;6#41; NOT NULL
    }
    class ecole {
        <<Table>>
        «PK» id : text
        nom : text NOT NULL
        extra : jsonb NOT NULL
    }
    class etage {
        <<Table>>
        «PK» id : text
        «FK» «AK» ecole_id : text NOT NULL
        «AK» batiment : text NOT NULL
        «AK» niveau : integer NOT NULL, -5 à 30
        extra : jsonb NOT NULL
    }
    class salle {
        <<Table>>
        «PK» id : text
        «FK» ecole_id : text NOT NULL
        batiment : text NOT NULL
        nom : text NOT NULL
        etage : integer, -5 à 30
        extra : jsonb NOT NULL
    }
    class materiel {
        <<Table>>
        «PK» id : text
        «FK» ecole_id : text NOT NULL
        «AK» id_orion : text NOT NULL
        «FK» salle_id : text
        type : text NOT NULL
        modele : text NOT NULL
        marque : text
        serie : text
        mac : text
        date_reception : timestamptz NOT NULL
        garantie_fin : timestamptz
        hors_service : boolean NOT NULL
        date_hors_service : timestamptz
        extra : jsonb NOT NULL
    }
    class compte {
        <<Table>>
        «PK» id : text
        nom : text NOT NULL
        «AK» email : text NOT NULL, minuscules
        role : text NOT NULL, admin gestionnaire formateur superadmin
        «FK» ecole_id : text, nulle si et seulement si superadmin
        actif : boolean NOT NULL
        «AK» sujet : text
        derniere_connexion : timestamptz
        date_desactivation : timestamptz
        extra : jsonb NOT NULL
    }
    class preference {
        <<Table>>
        «PK» «FK» compte_id : text
        affichage : jsonb
        dispositions : jsonb
        consultation : timestamptz
        ecole_affichee : text
    }
    class remontee {
        <<Table>>
        «PK» id : text
        «FK» ecole_id : text NOT NULL
        auteur : text NOT NULL
        «FK» auteur_id : text
        created_at : timestamptz NOT NULL
        probleme : text
        description : text NOT NULL
        statut : text NOT NULL, attente encours remplace corrige
        historique : jsonb NOT NULL
        extra : jsonb NOT NULL
    }
    class remontee_materiel {
        <<Table>>
        «PK» «FK» remontee_id : text
        «PK» rang : integer
        materiel_id : text NOT NULL
    }
    class donnee {
        <<Table>>
        «PK» collection : text
        «PK» id : text
        ecole_id : text
        data : jsonb NOT NULL
        rang : bigint GENERATED ALWAYS AS IDENTITY
    }
    class materiel_ecole {
        <<Index>>
        ecole_id
    }
    class materiel_salle {
        <<Index>>
        salle_id
    }
    class remontee_ecole {
        <<Index>>
        ecole_id, statut
    }
    class IDX_session_expire {
        <<Index>>
        expire
    }

    etage "*" --> "1" ecole : ecole_id
    salle "*" --> "1" ecole : ecole_id
    materiel "*" --> "1" ecole : ecole_id
    materiel "*" --> "0..1" salle : salle_id
    compte "*" --> "0..1" ecole : ecole_id
    preference "0..1" --> "1" compte : compte_id ON DELETE CASCADE
    remontee "*" --> "1" ecole : ecole_id
    remontee "*" --> "0..1" compte : auteur_id
    remontee_materiel "1..*" --* "1" remontee : remontee_id ON DELETE CASCADE
    remontee_materiel ..> materiel : materiel_id sans contrainte
    materiel_ecole ..> materiel
    materiel_salle ..> materiel
    remontee_ecole ..> remontee
    IDX_session_expire ..> session
```

## Base ORION : documents JSONB

```mermaid
classDiagram
    direction LR
    class donnee {
        <<Table>>
        «PK» collection : text
        «PK» id : text
        ecole_id : text
        data : jsonb NOT NULL
        rang : bigint GENERATED ALWAYS AS IDENTITY
    }
    class Poste {
        <<JSON>>
        id : Id
        salleId : Id
        nomReseau : string, unique, capitales
        materielId : Id ou null
        allume : boolean
        session? : string ou null
        vuLe? : horodatage ou null
        adresseIp? : string
        os? : string
    }
    class Processus {
        <<JSON>>
        id : Id
        posteId : Id
        salleId : Id
        ecoleId? : Id
        nom : string
        compte : string
        startedAt : horodatage
        stoppedAt : horodatage ou null
    }
    class Detection {
        <<JSON>>
        id : Id
        at : horodatage
        posteId : Id
        salleId : Id
        ecoleId? : Id
        processus : string
        compte : string
        classement : blacklist nonref whitelist
        arret : réussi échec ou null
    }
    class Regle {
        <<JSON>>
        id : Id
        nom : string
        classement : blacklist whitelist
        portee : global ecole batiment salle
        ecoleId : Id ou null
        batiment? : string
        salleId? : Id
    }
    class Application {
        <<JSON>>
        id : Id
        nom : string
        version : string
        editeur : string
    }
    class Installation {
        <<JSON>>
        id : posteId-applicationId
        posteId : Id
        salleId : Id
        ecoleId? : Id
        applicationId : Id
    }
    class Intervention {
        <<JSON>>
        id : Id
        type : installation desinstallation reinstallation arret
        cibles : Id[]
        salleId? : Id
        ecoleId : Id
        at : horodatage
        par : string
        parId : Id ou null
        statut : enregistree terminee echec
        resultats : posteId vers en_attente reussie echec
        applicationId? : Id
        image? : string
        processusId? : Id
        detectionId? : Id
        auto? : boolean
        termineLe? : horodatage
    }
    class Operation {
        <<JSON>>
        id : Id
        ecoleId : Id
        nom : string
        mode : installation recensement
        salleIds : Id[]
        at : horodatage
        par : string
        parId : Id ou null
        expireLe : horodatage
        close? : Trace
    }
    class Constat {
        <<JSON>>
        id : cst-identifiant de l'événement
        operationId : Id
        ecoleId : Id
        type : vu releve retour stock inconnu
        code : string
        salleId : Id ou null
        materielId : Id ou null
        observeLe : horodatage
        at : horodatage
        resultat : confirme present ecart deplace range retour stock ajoute inconnu refuse
        message? : string
        saisie? : type modele marque serie garantieFin?
        traite? : Trace et action
    }
    class Deplacement {
        <<JSON>>
        de : Id ou null
        at : horodatage
        par : string
        parId : Id ou null
    }
    class EtapeRemontee {
        <<JSON>>
        statut : attente encours remplace corrige
        at : horodatage
        par : string
        parId : Id ou null
    }
    class materiel {
        <<Table>>
        extra : jsonb
    }
    class remontee {
        <<Table>>
        historique : jsonb
    }

    donnee "1" *-- "*" Poste : collection postes
    donnee "1" *-- "*" Processus : collection processus
    donnee "1" *-- "*" Detection : collection detections
    donnee "1" *-- "*" Regle : collection regles
    donnee "1" *-- "*" Application : collection applications
    donnee "1" *-- "*" Installation : collection installations
    donnee "1" *-- "*" Intervention : collection interventions
    donnee "1" *-- "*" Operation : collection operations
    donnee "1" *-- "*" Constat : collection constats
    materiel *-- "0..1" Deplacement : extra.deplacement
    materiel *-- "0..1" Deplacement : extra.installation
    remontee *-- "1..*" EtapeRemontee : historique
    Processus ..> Poste : posteId
    Detection ..> Poste : posteId
    Installation ..> Poste : posteId
    Installation ..> Application : applicationId
    Intervention ..> Poste : cibles
    Intervention ..> Application : applicationId
    Intervention ..> Processus : processusId
    Intervention ..> Detection : detectionId
    Constat ..> Operation : operationId
    Constat ..> materiel : materielId
```
