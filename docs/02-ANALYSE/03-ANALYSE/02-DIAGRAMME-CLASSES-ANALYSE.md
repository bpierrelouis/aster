# Diagramme de classes d’analyse

<!-- version:debut : généré par versions.py, ne pas modifier à la main -->
| Version | Mise à jour | Destination | Dernière évolution | Historique |
| --- | --- | --- | --- | --- |
| 4.2 | 17/11/2026 | Production destinée à la remise | Nommer Exécution la classe des processus en cours et aligner les multiplicités sur le code | [8 versions](../../../archive/README.md#02-diagramme-classes-analyse) |
<!-- version:fin -->

## Remontées utilisateur

```mermaid
classDiagram
    direction LR
    class AuteurRemontee["Auteur de remontée"] {
        <<actor>>
    }
    class ResponsableRemontees["Responsable des remontées"] {
        <<actor>>
    }
    class Gestionnaire {
        <<actor>>
    }
    class Administrateur["Administrateur ou super administrateur"] {
        <<actor>>
    }
    class EcranRemontees["Écran des remontées"] {
        <<boundary>>
    }
    class FormulaireRemontee["Formulaire de remontée"] {
        <<boundary>>
    }
    class DocumentEtatDesLieux["État des lieux PDF"] {
        <<boundary>>
    }
    class EcranNotifications["Notifications"] {
        <<boundary>>
    }
    class CreerRemontee["Créer une remontée"] {
        <<control>>
        +controlerSaisie()
        +attribuerNumero()
    }
    class TraiterRemontee["Prendre en charge et traiter"] {
        <<control>>
        +changerStatut()
    }
    class ProduireEtatDesLieux["Produire l’état des lieux"] {
        <<control>>
        +produirePDF()
    }
    class SuivreNotifications["Suivre les notifications"] {
        <<control>>
    }
    class Remontee["Remontée"] {
        <<entity>>
        numero
        typeProbleme
        description
        statut
        dateCreation
    }
    class EtapeRemontee["Étape de remontée"] {
        <<entity>>
        statut
        date
        auteur
    }
    class Materiel["Matériel"] {
        <<entity>>
    }
    class Salle {
        <<entity>>
    }
    class Ecole["École"] {
        <<entity>>
    }
    class CompteOrion["Compte ORION"] {
        <<entity>>
    }
    class Intervention {
        <<entity>>
    }
    class Detection["Détection"] {
        <<entity>>
    }

    AuteurRemontee -- FormulaireRemontee
    AuteurRemontee -- EcranRemontees
    ResponsableRemontees -- EcranRemontees
    Gestionnaire -- EcranNotifications
    AuteurRemontee -- EcranNotifications
    Administrateur -- EcranNotifications
    EcranRemontees -- DocumentEtatDesLieux
    FormulaireRemontee --> CreerRemontee
    EcranRemontees --> TraiterRemontee
    DocumentEtatDesLieux --> ProduireEtatDesLieux
    EcranNotifications --> SuivreNotifications
    CreerRemontee --> Remontee
    CreerRemontee --> Materiel
    TraiterRemontee --> Remontee
    ProduireEtatDesLieux --> Remontee
    ProduireEtatDesLieux --> Materiel
    SuivreNotifications --> Remontee
    SuivreNotifications --> Materiel
    SuivreNotifications --> Intervention
    SuivreNotifications --> Detection
    Remontee "1" *-- "1..*" EtapeRemontee : historique
    Remontee "*" --> "1..*" Materiel : concerne
    Remontee "*" --> "1" Ecole : rattachée à
    Remontee "*" --> "1" CompteOrion : auteur
    Materiel "*" --> "0..1" Salle : affecté à
    Salle "*" --> "1" Ecole
```

## Parc, affectations et déplacements

```mermaid
classDiagram
    direction LR
    class ActeurGestionParc["Acteur de gestion du parc"] {
        <<actor>>
    }
    class ActeurAdministrationParc["Acteur d’administration du parc"] {
        <<actor>>
    }
    class EcranSalles["Vue éclatée des salles"] {
        <<boundary>>
    }
    class EcranInventaire["Inventaire"] {
        <<boundary>>
    }
    class FormulaireMateriel["Fiche du matériel"] {
        <<boundary>>
    }
    class EcranDeplacements["Déplacements"] {
        <<boundary>>
    }
    class EcranImport["Import JSON"] {
        <<boundary>>
    }
    class GererMateriel["Gérer un matériel"] {
        <<control>>
        +declarer()
        +mettreHorsService()
        +supprimer()
    }
    class AffecterMateriel["Affecter un matériel"] {
        <<control>>
        +affecter()
        +lancerDeplacement()
    }
    class ConfirmerInstallation["Confirmer l’installation"] {
        <<control>>
        +confirmer()
    }
    class ImporterMateriels["Importer des matériels"] {
        <<control>>
        +rapprocherSeries()
        +importer()
    }
    class GererLieux["Gérer salles et étages"] {
        <<control>>
    }
    class Materiel["Matériel"] {
        <<entity>>
        identifiantOrion
        type
        modele
        marque
        numeroSerie
        adresseMac
        dateReception
        finGarantie
        horsService
        dateHorsService
    }
    class Deplacement["Déplacement"] {
        <<entity>>
        origine
        date
        auteur
    }
    class Salle {
        <<entity>>
        nom
        batiment
        etage
    }
    class Etage["Étage"] {
        <<entity>>
        batiment
        niveau
    }
    class Ecole["École"] {
        <<entity>>
        nom
    }
    class Remontee["Remontée"] {
        <<entity>>
    }

    ActeurGestionParc -- EcranSalles
    ActeurGestionParc -- EcranInventaire
    ActeurGestionParc -- EcranDeplacements
    ActeurGestionParc -- EcranImport
    ActeurAdministrationParc -- EcranSalles
    EcranInventaire -- FormulaireMateriel
    EcranSalles -- FormulaireMateriel
    FormulaireMateriel --> GererMateriel
    EcranSalles --> AffecterMateriel
    EcranSalles --> GererLieux
    EcranDeplacements --> ConfirmerInstallation
    EcranImport --> ImporterMateriels
    GererMateriel --> Materiel
    GererMateriel --> Remontee
    AffecterMateriel --> Materiel
    AffecterMateriel --> Deplacement
    ConfirmerInstallation --> Deplacement
    ImporterMateriels --> Materiel
    GererLieux --> Salle
    GererLieux --> Etage
    Materiel "*" --> "1" Ecole : appartient à
    Materiel "*" --> "0..1" Salle : affecté à
    Materiel "1" *-- "0..1" Deplacement : déplacement en cours {xor}
    Materiel "1" *-- "0..1" Deplacement : dernière installation {xor}
    Deplacement "*" --> "0..1" Salle : origine
    Salle "*" --> "1" Ecole
    Etage "*" --> "1" Ecole
    Remontee "*" --> "1..*" Materiel : cite
```

## Supervision et interventions sur les postes

```mermaid
classDiagram
    direction LR
    class ActeurSupervision["Acteur de supervision"] {
        <<actor>>
    }
    class Administrateur["Administrateur ou super administrateur"] {
        <<actor>>
    }
    class SolutionPostes["Solution d’administration des postes Windows"] {
        <<actor>>
    }
    class EcranSupervision["Supervision des postes"] {
        <<boundary>>
    }
    class EcranInterventions["Interventions"] {
        <<boundary>>
    }
    class EcranRegles["Règles de processus"] {
        <<boundary>>
    }
    class InterfacePostes["API des postes"] {
        <<boundary>>
    }
    class RecevoirRapport["Recevoir un rapport de poste"] {
        <<control>>
        +mettreAJourPoste()
        +classerProcessus()
        +demanderArretAutomatique()
    }
    class DemanderIntervention["Demander une intervention"] {
        <<control>>
        +fixerCibles()
    }
    class DemanderArret["Demander l’arrêt d’un processus"] {
        <<control>>
    }
    class TransmettreCommandes["Transmettre les commandes"] {
        <<control>>
    }
    class EnregistrerResultat["Enregistrer un résultat"] {
        <<control>>
        +appliquerEffets()
        +clore()
    }
    class DetecterDeconnexion["Détecter les postes déconnectés"] {
        <<control>>
    }
    class GererRegles["Gérer les règles de processus"] {
        <<control>>
    }
    class Poste {
        <<entity>>
        nomReseau
        allume
        session
        dernierRapport
        adresseIp
        systeme
    }
    class Execution["Exécution"] {
        <<entity>>
        nomProcessus
        compteWindows
        debut
        fin
    }
    class Detection["Détection"] {
        <<entity>>
        date
        classement
        resultatArret
    }
    class RegleProcessus["Règle de processus"] {
        <<entity>>
        nomProcessus
        classement
        portee
    }
    class Intervention {
        <<entity>>
        type
        statut
        image
        date
        dateFin
    }
    class ResultatPoste["Résultat par poste"] {
        <<entity>>
        etat
    }
    class Application {
        <<entity>>
        nom
        version
        editeur
    }
    class Installation {
        <<entity>>
    }
    class Salle {
        <<entity>>
    }
    class Materiel["Matériel"] {
        <<entity>>
    }
    class CompteOrion["Compte ORION"] {
        <<entity>>
    }

    ActeurSupervision -- EcranSupervision
    Administrateur -- EcranInterventions
    Administrateur -- EcranRegles
    SolutionPostes -- InterfacePostes
    EcranSupervision --> DemanderArret
    EcranInterventions --> DemanderIntervention
    EcranRegles --> GererRegles
    InterfacePostes --> RecevoirRapport
    InterfacePostes --> TransmettreCommandes
    InterfacePostes --> EnregistrerResultat
    RecevoirRapport --> DetecterDeconnexion
    RecevoirRapport --> Poste
    RecevoirRapport --> Execution
    RecevoirRapport --> Detection
    RecevoirRapport --> RegleProcessus
    RecevoirRapport --> Installation
    DemanderIntervention --> Intervention
    DemanderArret --> Intervention
    TransmettreCommandes --> Intervention
    EnregistrerResultat --> ResultatPoste
    EnregistrerResultat --> Installation
    EnregistrerResultat --> Detection
    DetecterDeconnexion --> Poste
    GererRegles --> RegleProcessus
    Poste "*" --> "1" Salle : dans
    Poste "0..1" --> "0..1" Materiel : unité centrale
    Execution "*" --> "1" Poste : exécuté sur
    Detection "0..1" --> "1" Execution : signale
    Intervention "1" *-- "1..500" ResultatPoste
    ResultatPoste "*" --> "1" Poste : cible
    Intervention "*" --> "0..1" Application
    Intervention "*" --> "0..1" Execution : arrêt de
    Intervention "0..1" --> "0..1" Detection : déclenchée par
    Intervention "*" --> "0..1" CompteOrion : demandeur
    Installation "*" --> "1" Poste
    Installation "*" --> "1" Application
    RegleProcessus "*" --> "0..1" Salle : portée
```

## Comptes et connexion

```mermaid
classDiagram
    direction LR
    class UtilisateurOrion["Utilisateur ORION"] {
        <<actor>>
    }
    class Administrateur["Administrateur ou super administrateur"] {
        <<actor>>
    }
    class MindefConnect {
        <<actor>>
    }
    class PageConnexion["Page de connexion"] {
        <<boundary>>
    }
    class InterfaceIdentite["Interface du fournisseur d’identité"] {
        <<boundary>>
    }
    class EcranComptes["Comptes"] {
        <<boundary>>
    }
    class FormulaireCompte["Fiche du compte"] {
        <<boundary>>
    }
    class Authentifier["Authentifier et ouvrir la session"] {
        <<control>>
        +rapprocherIdentite()
        +ouvrirSession()
        +fermerSession()
    }
    class ControlerPerimetre["Contrôler le profil et le périmètre"] {
        <<control>>
        +filtrerDonnees()
        +autoriserEcriture()
    }
    class GererCompte["Gérer un compte"] {
        <<control>>
        +creer()
        +modifier()
        +desactiver()
    }
    class CompteOrion["Compte ORION"] {
        <<entity>>
        nom
        adresseElectronique
        profil
        actif
        sujetIdentite
        derniereConnexion
        dateDesactivation
    }
    class Ecole["École"] {
        <<entity>>
    }
    class Session {
        <<entity>>
        expiration
    }
    class Preferences["Préférences"] {
        <<entity>>
        apparence
        tableauxDeBord
        derniereConsultation
        ecoleAffichee
    }

    UtilisateurOrion -- PageConnexion
    MindefConnect -- InterfaceIdentite
    Administrateur -- EcranComptes
    EcranComptes -- FormulaireCompte
    PageConnexion --> Authentifier
    Authentifier --> InterfaceIdentite
    FormulaireCompte --> GererCompte
    GererCompte --> ControlerPerimetre
    Authentifier --> CompteOrion
    Authentifier --> Session
    ControlerPerimetre --> CompteOrion
    GererCompte --> CompteOrion
    CompteOrion "*" --> "0..1" Ecole : rattaché à
    Session "*" --> "1" CompteOrion
    CompteOrion "1" *-- "0..1" Preferences
```

## Recensement et installation avec RIGEL

```mermaid
classDiagram
    direction LR
    class UtilisateurRigel["Utilisateur de RIGEL"] {
        <<actor>>
    }
    class Rigel["RIGEL"] {
        <<actor>>
    }
    class EcranRecensement["Recensement"] {
        <<boundary>>
    }
    class EcranDeplacements["Déplacements de la salle"] {
        <<boundary>>
    }
    class Appairage["Code d’appairage"] {
        <<boundary>>
    }
    class InterfaceRigel["API de RIGEL"] {
        <<boundary>>
    }
    class LancerRecensement["Lancer ou clore un recensement"] {
        <<control>>
    }
    class LancerInstallation["Lancer l’installation d’une salle"] {
        <<control>>
    }
    class PublierOperations["Fournir l’opération au téléphone"] {
        <<control>>
        +authentifier()
        +produireInstantane()
    }
    class IntegrerConstats["Intégrer les constats"] {
        <<control>>
        +authentifier()
        +appliquer()
    }
    class TraiterConstat["Traiter un constat"] {
        <<control>>
    }
    class CloreInstallation["Clore l’installation"] {
        <<control>>
    }
    class Operation["Opération"] {
        <<entity>>
        nom
        type
        date
        expiration
        cloture
    }
    class Constat {
        <<entity>>
        type
        code
        dateObservation
        dateIntegration
        resultat
        saisie
        traitement
    }
    class Materiel["Matériel"] {
        <<entity>>
    }
    class Deplacement["Déplacement"] {
        <<entity>>
    }
    class Salle {
        <<entity>>
    }
    class Ecole["École"] {
        <<entity>>
    }

    UtilisateurRigel -- EcranRecensement
    UtilisateurRigel -- EcranDeplacements
    EcranRecensement -- Appairage
    EcranDeplacements -- Appairage
    Rigel -- InterfaceRigel
    EcranRecensement --> LancerRecensement
    EcranRecensement --> TraiterConstat
    EcranDeplacements --> LancerInstallation
    InterfaceRigel --> PublierOperations
    InterfaceRigel --> IntegrerConstats
    IntegrerConstats --> CloreInstallation
    LancerRecensement --> Operation
    LancerInstallation --> Operation
    PublierOperations --> Operation
    IntegrerConstats --> Constat
    IntegrerConstats --> Materiel
    IntegrerConstats --> Deplacement
    TraiterConstat --> Constat
    TraiterConstat --> Materiel
    CloreInstallation --> Operation
    Operation "*" --> "1" Ecole
    Operation "*" --> "0..*" Salle : salles visées
    Constat "*" --> "1" Operation : rattaché à
    Constat "*" --> "0..1" Materiel : concerne
    Constat "*" --> "0..1" Salle : lieu constaté
    Materiel "1" *-- "0..1" Deplacement
    Materiel "*" --> "0..1" Salle
```
