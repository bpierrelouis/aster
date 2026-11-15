# Diagramme de classes métier — modèle du domaine ORION

<!-- version:debut : généré par versions.py, ne pas modifier à la main -->
| Version | Mise à jour | Destination | Dernière évolution | Historique |
| --- | --- | --- | --- | --- |
| 1.0 | 15/11/2026 | Production destinée à la remise | Diagramme de classes métier en cinq vues | [1 version](../../../archive/README.md#24-diagramme-classes-metier) |
<!-- version:fin -->

## 1. Organisation des écoles et comptes ORION

```mermaid
classDiagram
    direction LR
    class Ecole["École"] {
        nom
    }
    class Batiment["Bâtiment"] {
        nom
    }
    class Etage["Étage"] {
        niveau
    }
    class Salle {
        nom
    }
    class CompteORION["Compte ORION"] {
        nom
        adresseÉlectronique
        identifiantMindefConnect
        profil : Profil
        actif
        dateDernièreConnexion
        dateDésactivation
        dateConsultationNotifications
    }
    class Profil {
        <<enumeration>>
        administrateur
        gestionnaire
        formateur
        super administrateur
    }

    Ecole "1" -- "0..*" Batiment : comprend
    Batiment "1" -- "0..*" Etage : est composé de
    Etage "1" -- "0..*" Salle : situe
    CompteORION "0..*" -- "0..1" Ecole : est rattaché à
    CompteORION ..> Profil
```

## 2. Parc

```mermaid
classDiagram
    direction LR
    class Ecole["École"] {
        nom
    }
    class Salle {
        nom
    }
    class Materiel["Matériel"] {
        identifiantORION
        numéroSérie
        modèle
        marque
        adresseMAC
        dateRéception
        dateFinGarantie
        horsService
        dateMiseHorsService
        dateDéplacement
        dateInstallation
        /enStock
        /garantieÉchue
    }
    class TypeMateriel["TypeMatériel"] {
        <<enumeration>>
        unité centrale
        vidéoprojecteur
        réseau
        périphérique
        écran
        audio et vidéo
        imprimante
        autre
    }

    Ecole "1" -- "0..*" Materiel : détient
    Materiel "0..*" -- "0..1" Salle : est affecté à
    Materiel ..> TypeMateriel
```

## 3. Remontées utilisateur

```mermaid
classDiagram
    direction LR
    class CompteORION["Compte ORION"] {
        nom
        profil
    }
    class Ecole["École"] {
        nom
    }
    class Materiel["Matériel"] {
        identifiantORION
        modèle
    }
    class Remontee["Remontée"] {
        numéro
        dateCréation
        typeProblème : TypeProblème
        description
        /statut : StatutRemontée
    }
    class EtapeRemontee["ÉtapeRemontée"] {
        statut : StatutRemontée
        date
    }
    class TypeProbleme["TypeProblème"] {
        <<enumeration>>
        ne s’allume pas
        pas d’image
        connexion
        casse
        fonctionnement anormal
        autre, précisé
    }
    class StatutRemontee["StatutRemontée"] {
        <<enumeration>>
        en attente
        en cours
        remplacé
        corrigé
    }

    CompteORION "1" -- "0..*" Remontee : déclare
    Remontee "0..*" -- "1" Ecole : relève de
    Remontee "0..*" -- "1..*" Materiel : concerne
    Remontee "1" *-- "1..*" EtapeRemontee : est jalonnée par
    CompteORION "1" -- "0..*" EtapeRemontee : effectue
    Remontee ..> TypeProbleme
    EtapeRemontee ..> StatutRemontee
```

## 4. Supervision des postes et interventions

```mermaid
classDiagram
    direction LR
    class Salle {
        nom
    }
    class Batiment["Bâtiment"] {
        nom
    }
    class Ecole["École"] {
        nom
    }
    class Materiel["Matériel"] {
        identifiantORION
        horsService
    }
    class Poste {
        nomRéseau
        adresseIP
        systèmeExploitation
    }
    class Application {
        nom
        version
        éditeur
    }
    class Processus {
        nom
    }
    class CompteWindows["Compte Windows"] {
        nomUtilisateur
    }
    class Detection["Détection"] {
        dateDétection
        classement : Classement
    }
    class Regle["Règle"] {
        classement : Classement
        /portée
    }
    class Intervention {
        type : TypeIntervention
        dateDemande
        /état
    }
    class CibleIntervention["Cible d’intervention"] {
        résultat
    }
    class CompteORION["Compte ORION"] {
        nom
    }
    class Classement {
        <<enumeration>>
        whitelist
        blacklist
        non référencé
    }
    class TypeIntervention {
        <<enumeration>>
        arrêt d’un processus
        installation
        désinstallation
        réinitialisation
    }

    Salle "1" -- "0..*" Poste : accueille
    Poste "0..1" -- "0..1" Materiel : a pour unité centrale
    Poste "0..*" -- "0..*" Application : est équipé de
    Detection "0..*" -- "1" Poste : survient sur
    CompteWindows "1" -- "0..*" Detection : exécute
    Processus "1" -- "0..*" Detection : est signalé par
    Processus "1" -- "0..*" Regle : est réglementé par
    Ecole "0..1" -- "0..*" Regle : couvre
    Batiment "0..1" -- "0..*" Regle : limite
    Salle "0..1" -- "0..*" Regle : vise
    Intervention "0..*" -- "1..*" Poste : cible
    CibleIntervention .. Intervention
    CompteORION "0..1" -- "0..*" Intervention : demande
    Application "0..1" -- "0..*" Intervention : est déployée par
    Processus "0..1" -- "0..*" Intervention : est arrêté par
    Detection "0..1" -- "0..1" Intervention : provoque
    Detection ..> Classement
    Regle ..> Classement
    Intervention ..> TypeIntervention
```

## 5. Installation et recensement avec RIGEL

```mermaid
classDiagram
    direction LR
    class CompteORION["Compte ORION"] {
        nom
    }
    class Ecole["École"] {
        nom
    }
    class Salle {
        nom
    }
    class Materiel["Matériel"] {
        identifiantORION
        dateDéplacement
        dateInstallation
    }
    class Recensement {
        nom
        dateOuverture
        dateClôture
    }
    class Constat {
        type
        codeLu
        résultat
        dateObservation
        dateConstat
        dateTraitement
    }

    CompteORION "1" -- "0..*" Recensement : ouvre
    Recensement "0..*" -- "1" Ecole : porte sur
    Recensement "0..*" -- "0..*" Salle : inclut
    Recensement "1" *-- "0..*" Constat : regroupe
    Constat "0..*" -- "0..1" Materiel : identifie
    Constat "0..*" -- "0..1" Salle : localise
    CompteORION "0..1" -- "0..*" Constat : traite
```
