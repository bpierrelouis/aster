# Diagramme de classes de conception

<!-- version:debut : généré par versions.py, ne pas modifier à la main -->
| Version | Mise à jour | Destination | Dernière évolution | Historique |
| --- | --- | --- | --- | --- |
| 3.0 | 16/11/2026 | Production destinée à la remise | Représenter les classes majeures avec attributs, méthodes et associations | [5 versions](../../../archive/README.md#01-diagramme-classes-conception) |
<!-- version:fin -->

## Classes de conception d'ORION

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
        +lancerInstallation(gestionnaire : Compte) OperationRigel
    }
    class Materiel {
        -id : String
        -idOrion : String
        -type : String
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
        -numero : String
        -typeProbleme : String
        -description : String
        -statut : StatutRemontee
        -dateCreation : Date
        +prendreEnCharge(gestionnaire : Compte) void
        +terminer(statut : StatutRemontee) void
        +produireEtatDesLieux() PDF
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
        +recevoirRapport(rapport : Rapport) void
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
        +transmettre(poste : Poste) void
        +enregistrerResultat(poste : Poste, reussie : Boolean) void
        +clore() void
    }
    class OperationRigel {
        -id : String
        -nom : String
        -mode : ModeOperation
        -date : Date
        -dateExpiration : Date
        +appairer() Appairage
        +appliquerEvenements(evenements : Evenement[]) void
        +clore() void
    }
    class Constat {
        -id : String
        -type : TypeConstat
        -code : String
        -dateObservation : Date
        +traiter(action : ActionConstat) void
    }
    class Profil {
        <<enumeration>>
        FORMATEUR
        GESTIONNAIRE
        ADMINISTRATEUR
        SUPER_ADMINISTRATEUR
    }
    class StatutRemontee {
        <<enumeration>>
        EN_ATTENTE
        EN_COURS
        REMPLACE
        CORRIGE
    }
    class TypeIntervention {
        <<enumeration>>
        INSTALLATION
        DESINSTALLATION
        REINITIALISATION
        ARRET_PROCESSUS
    }

    Ecole "0..1" -- "*" Compte : rattache
    Ecole "1" *-- "*" Salle : comprend
    Ecole "1" -- "*" Materiel : possède
    Ecole "1" -- "*" Remontee : reçoit
    Salle "0..1" o-- "*" Materiel : contient
    Salle "1" *-- "*" Poste : accueille
    Poste "0..1" -- "0..1" Materiel : unité centrale
    Poste "1" *-- "*" Processus : exécute
    Poste "*" -- "*" Application : installée
    Processus ..> RegleProcessus : «use»
    Compte "0..1" <-- "*" Remontee : auteur
    Remontee "*" --> "1..*" Materiel : concerne
    Remontee "1" *-- "1..*" EtapeRemontee : historique
    Compte "1" <-- "*" Intervention : demandeur
    Intervention "*" --> "1..*" Poste : cibles
    Intervention "*" --> "0..1" Application
    Compte "1" <-- "*" OperationRigel : lanceur
    OperationRigel "*" --> "1..*" Salle : couvre
    OperationRigel "1" *-- "*" Constat : remonte
    Constat "*" --> "0..1" Materiel : identifie
    Compte ..> Profil
    Remontee ..> StatutRemontee
    Intervention ..> TypeIntervention
```
