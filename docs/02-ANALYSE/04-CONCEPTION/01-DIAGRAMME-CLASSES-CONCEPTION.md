# Diagramme de classes de conception

<!-- version:debut : généré par versions.py, ne pas modifier à la main -->
| Version | Mise à jour | Destination | Dernière évolution | Historique |
| --- | --- | --- | --- | --- |
| 4.0 | 16/11/2026 | Production destinée à la remise | Appliquer les droits de l’administrateur, corriger les écarts avec le code et remettre en page à angles droits | [6 versions](../../../archive/README.md#01-diagramme-classes-conception) |
<!-- version:fin -->

## Classes de conception d’ORION

```mermaid
classDiagram
    direction TB
    class Compte {
        -id : String
        -nom : String
        -email : String
        -profil : Profil
        -actif : Boolean
        -derniereConnexion : Date
        -dateDesactivation : Date
        -sujet : String
        +ouvrirSession(sujet : String) void
        +changerProfil(profil : Profil) void
        +desactiver() void
        +peutConsulter(ecole : Ecole) Boolean
    }
    class Ecole {
        -id : String
        -nom : String
        +ajouterSalle(nom : String, batiment : String, etage : Integer) Salle
        +importerMateriels(materiels : Materiel[]) Integer
    }
    class Salle {
        -id : String
        -nom : String
        -batiment : String
        -etage : Integer
        +equiper(materiel : Materiel) void
        +lancerInstallation(lanceur : Compte) OperationRigel
    }
    class Materiel {
        -id : String
        -idOrion : String
        -type : TypeMateriel
        -modele : String
        -marque : String
        -numeroSerie : String
        -adresseMac : String
        -dateReception : Date
        -finGarantie : Date
        -horsService : Boolean
        -dateHorsService : Date
        +affecter(salle : Salle) void
        +mettreEnStock() void
        +mettreHorsService() void
    }
    class Remontee {
        -id : String
        -typeProbleme : String
        -description : String
        -statut : StatutRemontee
        -dateCreation : Date
        +prendreEnCharge(responsable : Compte) void
        +terminer(statut : StatutRemontee) void
        +produireEtatDesLieux() Byte[]
    }
    class EtapeRemontee {
        -statut : StatutRemontee
        -date : Date
        -auteur : String
    }
    class Poste {
        -id : String
        -nomReseau : String
        -adresseIp : String
        -systeme : String
        -allume : Boolean
        -session : String
        -dernierRapport : Date
        +recevoirRapport(processus : Processus[], applications : Application[]) void
        +commandesEnAttente() Intervention[]
        +marquerDeconnecte() void
    }
    class Processus {
        -id : String
        -nom : String
        -compteWindows : String
        -debut : Date
        -fin : Date
        +classer(regles : RegleProcessus[]) Classement
    }
    class RegleProcessus {
        -id : String
        -nomProcessus : String
        -classement : Classement
        -portee : Portee
        +sAppliqueA(poste : Poste) Boolean
    }
    class Application {
        -id : String
        -nom : String
        -version : String
        -editeur : String
    }
    class Intervention {
        -id : String
        -type : TypeIntervention
        -statut : StatutIntervention
        -image : String
        -date : Date
        -dateFin : Date
        -resultats : Map~Poste, ResultatPoste~
        +transmettre(poste : Poste) void
        +enregistrerResultat(poste : Poste, resultat : ResultatPoste) void
        +clore() void
    }
    class OperationRigel {
        -id : String
        -nom : String
        -mode : ModeOperation
        -date : Date
        -dateExpiration : Date
        +appairer() String
        +integrerConstats(constats : Constat[]) void
        +clore() void
    }
    class Constat {
        -id : String
        -type : TypeConstat
        -code : String
        -dateObservation : Date
        -resultat : ResultatConstat
        +traiter(action : ActionConstat) void
    }
    class Profil {
        <<enumeration>>
        formateur
        gestionnaire
        admin
        superadmin
    }
    class StatutRemontee {
        <<enumeration>>
        attente
        encours
        remplace
        corrige
    }
    class TypeIntervention {
        <<enumeration>>
        installation
        desinstallation
        reinstallation
        arret
    }
    class StatutIntervention {
        <<enumeration>>
        enregistree
        terminee
        echec
    }
    class ResultatPoste {
        <<enumeration>>
        en_attente
        reussie
        echec
    }
    class Classement {
        <<enumeration>>
        blacklist
        nonref
        whitelist
    }
    class Portee {
        <<enumeration>>
        global
        ecole
        batiment
        salle
    }
    class ModeOperation {
        <<enumeration>>
        installation
        recensement
    }
    class TypeConstat {
        <<enumeration>>
        vu
        releve
        retour
        stock
        inconnu
    }
    class ResultatConstat {
        <<enumeration>>
        confirme
        present
        ecart
        deplace
        range
        retour
        stock
        ajoute
        inconnu
        refuse
    }
    class ActionConstat {
        <<enumeration>>
        stock
        affectation
        constat
        ajoute
        ecarte
    }
    class TypeMateriel {
        <<enumeration>>
        uc
        videoprojecteur
        reseau
        peripherique
        ecran
        audio
        imprimante
        autre
    }

    Ecole "0..1" -- "*" Compte : rattache
    Ecole "1" *-- "*" Salle : comprend
    Ecole "1" -- "*" Materiel : possède
    Ecole "1" -- "*" Remontee : reçoit
    Salle "0..1" o-- "*" Materiel : contient
    Salle "1" o-- "*" Poste : accueille
    Poste "0..1" -- "0..1" Materiel : unité centrale
    Poste "1" *-- "*" Processus : exécute
    Poste "*" -- "*" Application : installée
    Processus ..> RegleProcessus : «use»
    Compte "0..1" <-- "*" Remontee : auteur
    Remontee "*" --> "1..*" Materiel : concerne
    Remontee "1" *-- "1..*" EtapeRemontee : historique
    Compte "0..1" <-- "*" Intervention : demandeur
    Intervention "*" --> "1..*" Poste : cibles
    Intervention "*" --> "0..1" Application
    Intervention "*" --> "0..1" Processus : arrêt de
    Compte "1" <-- "*" OperationRigel : lanceur
    Ecole "1" -- "*" OperationRigel
    OperationRigel "*" --> "0..*" Salle : couvre
    OperationRigel "1" *-- "*" Constat : remonte
    Constat "*" --> "0..1" Materiel : identifie
    Constat "*" --> "0..1" Salle : lieu constaté
```
