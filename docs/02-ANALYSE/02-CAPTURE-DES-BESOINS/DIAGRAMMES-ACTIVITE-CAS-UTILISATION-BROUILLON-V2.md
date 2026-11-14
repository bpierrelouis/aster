# Diagrammes d’activité des cas d’utilisation ORION — Brouillon V2

<!-- version:debut : généré par versions.py, ne pas modifier à la main -->
| Version | Mise à jour | Destination | Dernière évolution | Historique |
| --- | --- | --- | --- | --- |
| 1.3 | 14/11/2026 | Brouillon interne | PDF à la demande et type de problème obligatoire | [4 versions](../../../archive/README.md#diagrammes-activite-cas-utilisation-brouillon-v2) |
<!-- version:fin -->

## 1. Importer de nouveaux matériels en JSON — scénario nominal, acteur habilité

```mermaid
flowchart TD
    debut(["Début — fichier exploitable et données conformes"])
    fin(["Fin"])

    subgraph ACTEUR["Gestionnaire, administrateur ou super administrateur"]
        direction TB
        action1["Préparer les nouveaux matériels à importer dans le périmètre accessible"]
        action2["Sélectionner le fichier JSON et demander son import"]
    end

    subgraph SYSTEME["ORION"]
        direction TB
        action3["Lire les données du fichier"]
        decision{"Reste-t-il un matériel à importer ?"}
        suivant["Lire le matériel suivant"]
        enregistrer["Attribuer un identifiant interne unique et enregistrer le matériel"]
        resultat1["Rendre les matériels importés disponibles dans l’inventaire"]
    end

    debut --> action1
    action1 --> action2
    action2 --> action3
    action3 --> decision
    decision -->|"[oui]"| suivant
    suivant --> enregistrer
    enregistrer --> decision
    decision -->|"[non]"| resultat1
    resultat1 --> fin
```

## 2. Modifier un matériel

```mermaid
flowchart TD
    debut(["Début"])
    fin(["Fin — matériel modifié"])
    finRefus(["Fin — modification refusée"])

    subgraph ACTEUR["Gestionnaire, administrateur ou super administrateur"]
        selection["Sélectionner le matériel à modifier"]
        saisie["Modifier les informations et demander l’enregistrement"]
        correction["Corriger les informations signalées"]
    end

    subgraph ORION["ORION"]
        controleAcces["Vérifier le droit de modification et le périmètre du matériel"]
        acces{"Accès autorisé ?"}
        fiche["Présenter les informations du matériel"]
        controleEnregistrement["Vérifier les droits et le périmètre à l’enregistrement"]
        autorisation{"Modification autorisée ?"}
        controleDonnees["Contrôler les données obligatoires du matériel"]
        conformite{"Données conformes ?"}
        erreurs["Signaler les informations à corriger"]
        refus["Refuser l’opération sans modifier le matériel"]
        enregistrer["Enregistrer les modifications en conservant l’identifiant interne"]
    end

    debut --> selection --> controleAcces --> acces
    acces -->|"[oui]"| fiche --> saisie
    acces -->|"[non]"| refus
    saisie --> controleEnregistrement --> autorisation
    autorisation -->|"[non]"| refus --> finRefus
    autorisation -->|"[oui]"| controleDonnees --> conformite
    conformite -->|"[non]"| erreurs --> correction --> saisie
    conformite -->|"[oui]"| enregistrer --> fin
```

## 3. Créer une remontée utilisateur — scénario limité aux matériels d’une même école

```mermaid
flowchart TD
    debut(["Début"])
    fin(["Fin — remontée créée"])
    finRefus(["Fin — création refusée"])

    subgraph ACTEUR["Formateur, administrateur ou super administrateur"]
        selection["Sélectionner un ou plusieurs matériels d’une même école"]
        saisie["Choisir le type de problème, le décrire et transmettre la remontée"]
        correction["Compléter les matériels concernés, le type de problème ou la description"]
    end

    subgraph ORION["ORION"]
        localisation["Présenter la localisation de chaque matériel lorsqu’elle est renseignée"]
        controleAcces["Vérifier le droit de création et le périmètre des matériels"]
        acces{"Création autorisée pour ces matériels ?"}
        controleDonnees["Vérifier les informations obligatoires de la remontée"]
        conformite{"Au moins un matériel, un type de problème et une description renseignés ?"}
        erreurs["Signaler les informations manquantes"]
        refus["Refuser la création sans enregistrer de remontée"]
        enregistrer["Enregistrer la remontée, son auteur et les matériels concernés"]
        notification["Créer la notification ORION destinée au gestionnaire de l’école concernée"]
    end

    debut --> selection --> localisation --> saisie
    saisie --> controleAcces --> acces
    acces -->|"[non]"| refus --> finRefus
    acces -->|"[oui]"| controleDonnees --> conformite
    conformite -->|"[non]"| erreurs --> correction --> saisie
    conformite -->|"[oui]"| enregistrer --> notification --> fin
```

## 4. Modifier le profil d’un utilisateur — proposition, transitions à définir

```mermaid
flowchart TD
    debut(["Début"])
    fin(["Fin"])
    fin_refus(["Fin — aucun changement"])

    subgraph ACTEUR["Administrateur ou super administrateur"]
        direction TB
        action1["Sélectionner le compte utilisateur concerné"]
        action3["Choisir le nouveau profil et son rattachement, puis demander l’enregistrement"]
    end

    subgraph SYSTEME["ORION"]
        direction TB
        action2["Présenter le profil actuel et les choix autorisés"]
        action4["Vérifier l’habilitation, le périmètre et la cohérence du rattachement"]
        decision{"Changement autorisé et cohérent ?"}
        resultat1["Enregistrer le nouveau profil unique et le rattachement cohérent"]
        resultat2["Présenter le profil enregistré"]
    end

    debut --> action1
    action1 --> action2
    action2 --> action3
    action3 --> action4
    action4 --> decision
    decision -->|"[non]"| fin_refus
    decision -->|"[oui]"| resultat1
    resultat1 --> resultat2
    resultat2 --> fin
```

## 5. Ajouter une règle de processus

```mermaid
flowchart TD
    debut(["Début"])
    fin(["Fin"])
    fin_refus(["Fin — aucun changement"])

    subgraph ACTEUR["Administrateur ou super administrateur"]
        direction TB
        action1["Demander l’ajout d’une règle"]
        action2["Désigner le programme et choisir whitelist ou blacklist"]
        action3["Choisir la portée globale, école, bâtiment ou salle et demander l’enregistrement"]
    end

    subgraph SYSTEME["ORION"]
        direction TB
        action4["Contrôler les droits sur la portée demandée"]
        decision{"Portée accessible à cet acteur ?"}
        resultat1["Enregistrer le programme, le classement et la portée"]
        resultat2["Rendre la règle disponible pour la supervision"]
    end

    debut --> action1
    action1 --> action2
    action2 --> action3
    action3 --> action4
    action4 --> decision
    decision -->|"[non]"| fin_refus
    decision -->|"[oui]"| resultat1
    resultat1 --> resultat2
    resultat2 --> fin
```

## 6. Créer une salle — proposition, acteurs et droits à confirmer

```mermaid
flowchart TD
    debut(["Début"])
    fin(["Fin — salle créée"])
    finRefus(["Fin — création refusée"])

    subgraph ACTEUR["Administrateur ou super administrateur"]
        demande["Demander la création d’une salle"]
        choixEcole["Choisir l’école de rattachement de la salle"]
        saisie["Renseigner le nom de la salle et l’information de bâtiment, puis demander l’enregistrement"]
        correction["Renseigner le nom manquant"]
    end

    subgraph ORION["ORION"]
        profil{"Profil de l’acteur ?"}
        ecoleAdmin["Retenir l’école de rattachement de l’administrateur"]
        controleAcces["Vérifier le droit de création et l’accès à l’école choisie"]
        acces{"Création autorisée dans cette école ?"}
        controleNom["Vérifier la présence du nom de la salle"]
        nomPresent{"Nom renseigné ?"}
        erreurs["Signaler le nom manquant"]
        refus["Refuser l’opération sans créer de salle"]
        enregistrer["Enregistrer la salle avec son école et son information de bâtiment"]
    end

    debut --> demande --> profil
    profil -->|"[administrateur]"| ecoleAdmin --> saisie
    profil -->|"[super administrateur]"| choixEcole --> saisie
    saisie --> controleAcces --> acces
    acces -->|"[non]"| refus --> finRefus
    acces -->|"[oui]"| controleNom --> nomPresent
    nomPresent -->|"[non]"| erreurs --> correction --> saisie
    nomPresent -->|"[oui]"| enregistrer --> fin
```

## 7. Créer une école — proposition hors V1, scénario nominal sous réserve d’habilitation

```mermaid
flowchart TD
    debut(["Début"])
    fin(["Fin — école créée"])

    subgraph ACTEUR["Super administrateur"]
        saisie["Renseigner le nom de la nouvelle école et demander l’enregistrement"]
        correction["Renseigner le nom manquant"]
    end

    subgraph ORION["ORION"]
        controleNom["Vérifier la présence du nom de l’école"]
        nomPresent{"Nom renseigné ?"}
        erreurs["Signaler le nom manquant"]
        enregistrer["Enregistrer la nouvelle école"]
    end

    debut --> saisie --> controleNom --> nomPresent
    nomPresent -->|"[non]"| erreurs --> correction --> saisie
    nomPresent -->|"[oui]"| enregistrer --> fin
```
