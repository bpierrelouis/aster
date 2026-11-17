# Diagrammes de séquence système ORION

<!-- version:debut : généré par versions.py, ne pas modifier à la main -->
| Version | Mise à jour | Destination | Dernière évolution | Historique |
| --- | --- | --- | --- | --- |
| 3.2 | 17/11/2026 | Production destinée à la remise | Notifier les matériels à déplacer aux gestionnaires et administrateurs | [6 versions](../../../archive/README.md#10-diagrammes-sequence-systeme) |
<!-- version:fin -->

## 1. Se connecter par MindefConnect

```mermaid
sequenceDiagram
    autonumber
    actor U as Utilisateur ORION
    participant O as :ORION
    participant M as MindefConnect
    U->>O: accéderÀOrion()
    O-->>U: redirection vers MindefConnect
    U->>M: s’authentifier()
    M-->>U: redirection vers ORION, code d’autorisation
    U->>O: transmettreCode(code d’autorisation)
    O->>M: échangerCode(code d’autorisation)
    M-->>O: identité authentifiée
    alt compte ORION actif pour cette identité
        O-->>U: tableau de bord personnel, résumé des notifications
    else aucun compte ORION actif
        O-->>U: accès refusé
    end
```

## 2. Créer une remontée

```mermaid
sequenceDiagram
    autonumber
    actor A as Formateur, administrateur<br/>ou super administrateur
    participant O as :ORION
    actor G as Gestionnaire
    A->>O: rechercherMatériels(critères)
    O-->>A: matériels de l’école et leur localisation
    A->>O: créerRemontée(matériels, typeProblème, description)
    alt données conformes et matériels autorisés
        O-->>A: numéro de remontée, statut « en attente »
        O-)G: notification de nouvelle remontée
    else type, description ou matériels non conformes
        O-->>A: informations à corriger
    end
```

## 3. Traiter une remontée

```mermaid
sequenceDiagram
    autonumber
    actor G as Gestionnaire, administrateur<br/>ou super administrateur
    participant O as :ORION
    actor A as Auteur de la remontée
    G->>O: consulterRemontée(numéro)
    O-->>G: remontée, matériels, localisation et suivi
    G->>O: prendreEnCharge(numéro)
    alt remontée « en attente »
        O-->>G: statut « en cours », étape datée
        O-)A: notification de prise en charge
    else transition interdite ou compte non autorisé (formateur)
        O-->>G: prise en charge refusée
    end
    G->>O: terminerRemontée(numéro, remplacé ou corrigé)
    alt remontée « en cours »
        O-->>G: statut final, étape datée
        O-)A: notification de fin de traitement
    else transition interdite ou compte non autorisé (formateur)
        O-->>G: traitement refusé
    end
    opt consultation de l’état des lieux
        A->>O: demanderÉtatDesLieux(numéro)
        O-->>A: PDF produit avec les informations actuelles
    end
```

## 4. Affecter ou déplacer un matériel

```mermaid
sequenceDiagram
    autonumber
    actor A as Gestionnaire, administrateur<br/>ou super administrateur
    participant O as :ORION
    actor G as Gestionnaire, administrateur<br/>ou super administrateur notifié
    A->>O: rechercherMatériels(critères)
    O-->>A: matériels de l’école
    A->>O: affecter(matériels, salle ou stock)
    alt même école et aucun matériel hors service vers une salle
        O-->>A: affectation enregistrée, matériels « en cours de déplacement »
        O-)G: notification de matériels à déplacer
        alt confirmation par un utilisateur notifié
            G->>O: confirmerInstallation(matériel)
            O-->>G: matériel installé, date et auteur conservés
        else confirmation par l’auteur de l’affectation
            A->>O: confirmerInstallation(matériel)
            O-->>A: matériel installé, date et auteur conservés
        end
    else affectation non permise
        O-->>A: affectation refusée
    end
```

## 5. Importer des matériels en JSON

```mermaid
sequenceDiagram
    autonumber
    actor A as Gestionnaire, administrateur<br/>ou super administrateur
    participant O as :ORION
    A->>O: analyserImport(école, numéros de série du fichier)
    O-->>A: correspondances : matériels déjà connus, transferts possibles
    A->>O: importer(école, matériels, transferts validés)
    alt fichier exploitable et matériels valides
        O-->>A: bilan : ajoutés, transférés, ignorés
    else fichier vide, trop volumineux ou matériel invalide
        O-->>A: import refusé, motif
    end
```

## 6. Demander une intervention sur les postes

```mermaid
sequenceDiagram
    autonumber
    actor A as Administrateur<br/>ou super administrateur
    participant O as :ORION
    participant S as Solution d’administration<br/>et de déploiement des postes
    A->>O: demanderIntervention(type, application, postes ou salle)
    O-->>A: intervention enregistrée, postes « en attente »
    O->>S: commande d’intervention pour chaque poste
    loop pour chaque poste
        S->>O: résultatIntervention(poste, réussie ou échec)
        O-)A: suivi mis à jour poste par poste
    end
    O-)A: notification de fin : terminée ou en échec
```

## 7. Superviser une salle et arrêter un processus

```mermaid
sequenceDiagram
    autonumber
    actor F as Formateur, administrateur<br/>ou super administrateur
    participant O as :ORION
    participant S as Solution d’administration<br/>à distance des postes
    actor A as Administrateur<br/>et super administrateur
    loop toutes les cinq secondes, pour chaque poste
        S->>O: remonterÉtat(poste, session, adresse IP, système, processus, applications)
        opt processus blacklisté
            O->>S: arrêt automatique du processus
            O-)A: notification de lancement d’une application interdite
            S->>O: résultatArrêt(processus, réussi ou échec)
        end
    end
    F->>O: superviserSalle(salle)
    O-->>F: postes, processus utilisateur, classements et alertes
    F->>O: arrêterProcessus(processus)
    alt processus en cours, sans arrêt en attente
        O-->>F: arrêt demandé
        O->>S: commande d’arrêt
        S->>O: résultatArrêt(processus, réussi ou échec)
        O-)F: résultat de l’arrêt
    else arrêt impossible
        O-->>F: arrêt refusé
    end
```

## 8. Installer une salle avec RIGEL

```mermaid
sequenceDiagram
    autonumber
    actor G as Gestionnaire<br/>ou administrateur
    participant O as :ORION
    participant R as RIGEL
    G->>O: installerAvecTéléphone(salle)
    O-->>G: QR code d’appairage, QR codes de la salle et du stock
    G->>R: lierTéléphone(QR code d’appairage)
    R->>O: demande de données de l’installation
    O-->>R: matériels à déplacer vers la salle ou depuis elle
    G->>R: ouvrirLieu(QR code de la salle)
    loop pour chaque matériel scanné
        G->>R: scanner(code)
        R-->>G: action proposée : confirmer, accepter ici, ramener, mettre au stock ou ajouter
        G->>R: choisirAction(action)
    end
    R->>O: transmettreConstats(constats datés)
    O-->>R: résultat de chaque constat
    O-)G: déplacements confirmés, installation terminée s’il n’en reste aucun
```

## 9. Recenser le parc avec RIGEL

```mermaid
sequenceDiagram
    autonumber
    actor G as Gestionnaire<br/>ou administrateur
    participant O as :ORION
    participant R as RIGEL
    G->>O: lancerRecensement(nom, école ou salles)
    O-->>G: recensement ouvert pour quatorze jours au plus, QR code d’appairage
    G->>R: lierTéléphone(QR code d’appairage)
    R->>O: demande de données du recensement
    O-->>R: lieux et matériels attendus
    loop pour chaque lieu ouvert
        G->>R: ouvrirLieu(QR code du lieu)
        loop pour chaque matériel scanné
            G->>R: scanner(code)
            R-->>G: présence à confirmer, matériel affecté ailleurs ou code inconnu
            G->>R: choisirAction(action, informations saisies)
        end
    end
    R->>O: transmettreConstats(constats datés)
    alt scan plus récent que la dernière information connue
        O-->>R: constat intégré
    else scan plus ancien
        O-->>R: constat refusé
    end
    G->>O: consulterBilan(recensement)
    O-->>G: matériels vus, relocalisés, ajoutés et constats à traiter
    G->>O: clôturerRecensement(recensement)
    O-->>G: recensement clos
```
