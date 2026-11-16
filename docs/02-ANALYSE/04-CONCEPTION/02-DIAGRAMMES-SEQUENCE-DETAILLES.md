# Diagrammes de séquence détaillés

<!-- version:debut : généré par versions.py, ne pas modifier à la main -->
| Version | Mise à jour | Destination | Dernière évolution | Historique |
| --- | --- | --- | --- | --- |
| 4.0 | 16/11/2026 | Production destinée à la remise | Appliquer les droits de l’administrateur, corriger les écarts avec le code et remettre en page à angles droits | [6 versions](../../../archive/README.md#02-diagrammes-sequence-detailles) |
<!-- version:fin -->

## Écriture concurrente fusionnée

```mermaid
sequenceDiagram
    autonumber
    actor U as Utilisateur
    participant V as Vue (ex. Salles)
    participant S as store (core/store.ts)
    participant R as WorkspaceRouter
    participant E as Engine
    participant P as PostgresStore
    participant F as fusion.rebase
    participant M as espace.mergeState
    participant DB as PostgreSQL

    U->>V: affecter un matériel à une salle
    V->>S: update('data', mutator)
    S->>S: appliquer mutator à l'état local, emit('data'), pending++
    S->>R: PUT /api/workspace {baseRevision: n, state}
    R->>R: contrôle de l'origine, sessionActor(req)
    R->>E: update(state, n, actor)
    E->>P: write(change)
    P->>DB: BEGIN
    P->>DB: SELECT revision FROM espace WHERE id = 1 FOR UPDATE
    DB-->>P: revision = n + k
    opt copie du serveur périmée
        P->>DB: SELECT des tables relationnelles et de donnee
        DB-->>P: lignes
        P->>P: loadState() → état courant
    end
    P->>E: change(état courant, since)
    E->>P: since(n)
    P->>DB: SELECT revision, cles FROM journal WHERE revision > n
    DB-->>P: entrées n + 1 … n + k
    P-->>E: entrées
    E->>F: rebase(état, saisie, n, journal, actor)
    alt journal incomplet depuis n, ou même élément modifié par le navigateur et par une autre écriture
        F-->>E: erreur 409
        E-->>P: exception
        P->>DB: ROLLBACK
        R-->>S: 409 « Les données ont changé » ou « Cet élément a été modifié entre-temps »
        S->>S: adopt(committed, 'all'), generation++
        S-->>V: événement orion:save-error
    else éléments distincts
        F-->>E: saisie rejouée sur l'état courant
        E->>M: mergeState(état, saisie rejouée, actor)
        M->>M: droits, périmètre, règles du domaine, valeurs d'autorité
        M-->>E: next (révision n + k + 1)
        E->>E: cloreInstallations(next), diffKeys(état, next)
        E-->>P: next, résultat, entrée du journal
        P->>DB: writeDiff : INSERT … ON CONFLICT DO UPDATE, DELETE
        P->>DB: writePreferences, writeMeta (UPDATE espace)
        P->>DB: INSERT INTO journal, DELETE des entrées au-delà de 2000
        P->>DB: COMMIT
        P-->>E: before, next, résultat
        E->>E: journal « enregistrement », écouteurs onCommit
        E-->>R: scopedState(next, actor)
        R-->>S: 200 WorkspaceView
        S->>S: committed = vue, adopt(vue) si aucune autre écriture en attente
    end
    S->>S: pending--
```

## Création et traitement d'une remontée

```mermaid
sequenceDiagram
    autonumber
    actor A as Formateur, administrateur<br/>ou super administrateur
    actor G as Gestionnaire, administrateur<br/>ou super administrateur
    participant C as Création (remontees-create.tsx)
    participant L as Remontées (remontees.tsx)
    participant S as store
    participant R as WorkspaceRouter
    participant E as Engine
    participant M as espace.mergeState
    participant RR as remontees.regleRemontee
    participant DB as PostgreSQL

    A->>C: matériels, type de problème, description
    C->>S: update('data', ajout de la remontée)
    S->>R: PUT /api/workspace
    R->>E: update(saisie, révision, actor)
    E->>M: mergeState(état, saisie, actor)
    M->>M: numeroRemontee(++rang) remplace l'identifiant provisoire
    M->>RR: regleRemontee(x, undefined, contexte)
    RR->>RR: refus si gestionnaire, champs hors saisie retirés
    RR->>RR: auteur, date, statut « attente », historique fixés
    RR->>RR: contrôle du type de problème, de la description et des matériels de l'école
    RR-->>M: remontée complétée
    M-->>E: next
    E->>DB: INSERT remontee, remontee_materiel, journal, COMMIT
    E-->>R: vue du compte
    R-->>S: 200 avec le numéro attribué
    S-->>C: adopt(vue)

    loop toutes les 4 s, page visible et aucune écriture en attente
        L->>S: sync()
        S->>R: GET /api/workspace (If-None-Match)
        R-->>S: 200 nouvelle révision ou 304
    end
    S-->>L: emit('remote') : notification et file « En attente »

    G->>L: prendre en charge
    L->>S: update('data', statut = « encours »)
    S->>R: PUT /api/workspace
    R->>E: update(saisie, révision, actor)
    E->>M: mergeState
    M->>RR: regleRemontee(x, ancienne, contexte)
    RR->>RR: refus si formateur, transition attente → encours, seuls statut et historique modifiés
    RR->>RR: étape ajoutée à l'historique (statut, date, auteur)
    E->>DB: UPDATE remontee, COMMIT
    R-->>S: 200
    G->>L: traiter « Remplacé » ou « Corrigé »
    L->>S: update('data', statut final)
    S->>R: PUT /api/workspace
    R->>E: update
    E->>M: mergeState
    M->>RR: regleRemontee : transition encours → remplace ou corrige
    E->>DB: UPDATE remontee, COMMIT
    R-->>S: 200
```

## Intervention sur un poste

```mermaid
sequenceDiagram
    autonumber
    actor A as Administrateur<br/>ou super administrateur
    participant V as Formulaire d'intervention
    participant S as store
    participant R as WorkspaceRouter
    participant E as Engine
    participant PO as domaine/postes.ts
    participant DB as PostgreSQL
    participant AR as AgentRouter
    participant AG as Agent du poste Windows

    A->>V: installer une application sur une salle
    V->>S: update('data', ajout {type, salleId, applicationId})
    S->>R: PUT /api/workspace
    R->>E: update(saisie, révision, actor)
    E->>PO: regleIntervention(x, undefined, contexte) via mergeState
    PO->>PO: droits, cibles = postes de la salle, une seule salle, application du catalogue
    PO->>PO: auteur, date, statut « enregistree », résultats « en_attente » par poste
    E->>DB: INSERT donnee (collection interventions), COMMIT
    R-->>S: 200

    loop à chaque rapport du poste
        AG->>AR: POST /api/agent/rapports (jeton du poste) {session, adresseIp, os, processus, applications}
        AR->>AR: jeton HMAC du nom réseau, le poste ne rapporte que pour lui-même
        AR->>E: agent.rapports(rapports)
        E->>PO: applyReports(état, rapports)
        PO->>PO: poste allumé, processus, détections, installations, arrêt automatique
        E->>PO: pendingCommands(état, postes)
        E->>DB: écriture système, COMMIT
        E-->>AR: {inconnus, commandes}
        AR-->>AG: commandes en attente pour ce poste
    end
    AG->>AG: exécuter la commande
    AG->>AR: POST /api/agent/resultats {intervention, poste, statut}
    AR->>E: agent.resultats(resultats)
    E->>PO: applyResults(état, resultats)
    PO->>PO: résultat du poste, installation ajoutée si réussie
    opt tous les postes ont répondu
        PO->>PO: statut « terminee » ou « echec », date de fin
    end
    E->>DB: écriture système, COMMIT
    AR-->>AG: 200
    S->>R: GET /api/workspace (synchronisation)
    R-->>S: suivi mis à jour
    S-->>V: emit('remote')
```

## Constat RIGEL intégré

```mermaid
sequenceDiagram
    autonumber
    actor G as Gestionnaire ou administrateur
    participant V as Déplacements de la salle
    participant S as store
    participant R as WorkspaceRouter
    participant E as Engine
    participant RC as domaine/recensement.ts
    participant DB as PostgreSQL
    participant RG as RigelRouter
    participant T as Téléphone RIGEL

    G->>V: installer la salle avec RIGEL
    V->>S: call('/salles/:id/installation')
    S->>R: POST /api/workspace/salles/:id/installation
    R->>E: rigel.installation(actor, salleId, config)
    E->>RC: lancerInstallation(état, actor, salleId)
    E->>RC: appairage(état, actor, id, config)
    RC-->>E: adresse avec opération et jeton dérivé du secret
    E->>DB: INSERT donnee (collection operations), COMMIT
    R-->>S: {url, expireLe, state}
    S-->>V: code QR d'appairage
    G->>T: lire le code QR
    T->>T: appairer() : appairage enregistré dans IndexedDB

    T->>RG: GET /api/rigel/operations/:id/instantane (jeton)
    RG->>E: rigel.instantane(jeton, operation)
    E->>RC: jeton comparé, opération ouverte
    RC-->>E: instantané de l'opération, version
    RG-->>T: instantané
    T->>T: enregistrer dans IndexedDB

    G->>T: scanner un matériel dans la salle
    T->>T: constater() : événement en file locale
    T->>RG: POST /api/rigel/operations/:id/evenements (jeton), dès que le réseau le permet
    RG->>E: rigel.evenements(jeton, operation, événements)
    E->>RC: jeton comparé, opération ouverte
    E->>RC: appliquerEvenements(état, operation, événements)
    RC->>RC: doublon, opération ouverte, salle de l'opération, constat dépassé
    RC->>RC: matériel dans sa salle : installation confirmée, constat « confirme »
    E->>RC: cloreInstallations(next)
    E->>DB: écriture système, COMMIT
    RG-->>T: résultats par événement
    T->>RG: GET /api/rigel/operations/:id/instantane (jeton)
    RG-->>T: instantané avec le constat intégré
    T->>T: integrer() : constat déplacé vers l'historique
```

## État des lieux PDF à la demande

```mermaid
sequenceDiagram
    autonumber
    actor U as Utilisateur
    participant V as État des lieux (remontees-edl.tsx)
    participant N as Navigateur
    participant R as WorkspaceRouter
    participant E as Engine
    participant P as PostgresStore
    participant DB as PostgreSQL
    participant PDF as documents/pdf.ts

    U->>V: télécharger le PDF
    V->>N: lien /api/workspace/reports/:id/pdf (nouvel onglet)
    N->>R: GET /api/workspace/reports/:id/pdf (cookie de session)
    R->>R: sessionActor(req)
    alt session absente ou expirée
        R-->>N: 401
    else compte actif
        R->>E: pdf(id, actor)
        E->>P: read()
        P->>DB: BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY
        P->>DB: SELECT revision FROM espace
        opt copie du serveur périmée
            P->>DB: lecture des tables
        end
        P->>DB: COMMIT
        P-->>E: état courant
        E->>E: scopedState(état, actor) : remontée dans le périmètre
        alt remontée hors périmètre ou inconnue
            E-->>R: erreur 404
            R-->>N: 404 « État des lieux introuvable »
        else remontée visible
            E->>PDF: reportPdf(remontée, état)
            PDF->>PDF: matériels, salles, école, suivi, pages assemblées
            PDF-->>E: Buffer
            E-->>R: Buffer
            R-->>N: 200 application/pdf, inline
        end
    end
```

## Connexion OIDC

```mermaid
sequenceDiagram
    autonumber
    actor U as Utilisateur
    participant N as Navigateur
    participant X as Serveur Express (index.ts)
    participant SS as Sessions (connect-pg-simple)
    participant IDP as MindefConnect
    participant E as Engine
    participant DB as PostgreSQL

    U->>N: Se connecter avec MindefConnect
    N->>X: GET /auth/login
    X->>IDP: découverte OpenID (première fois)
    IDP-->>X: configuration du fournisseur
    X->>X: vérificateur PKCE, state, nonce
    X->>SS: session.logins[state] enregistrée
    SS->>DB: INSERT ou UPDATE session
    X-->>N: 302 vers l'adresse d'autorisation
    N->>IDP: demande d'autorisation (code_challenge S256)
    U->>IDP: authentification
    IDP-->>N: 302 /auth/callback?code&state
    N->>X: GET /auth/callback
    X->>SS: lire et retirer la tentative de ce state
    alt tentative inconnue ou de plus de 10 minutes
        X-->>N: 302 /?error=session
    else tentative valide
        X->>IDP: authorizationCodeGrant (code, vérificateur PKCE)
        IDP-->>X: jeton d'identité et jeton d'accès, ou refus
        X->>X: contrôle du state et du nonce, revendications
        alt échange refusé ou jeton invalide
            X->>SS: destroy()
            X-->>N: 302 /?error=connexion
        else jeton valide
            X->>E: findAccount({sub, email})
            E-->>X: compte ORION rapproché
            alt compte inconnu ou désactivé
                X->>SS: destroy()
                X-->>N: 302 /?error=compte
            else compte actif
                X->>E: connexion(compte, sub)
                E->>DB: sujet et dernière connexion, COMMIT
                X->>SS: regenerate() puis accountId, idToken, ouverteLe, activeLe
                SS->>DB: INSERT session
                X-->>N: 302 / (cookie orion.sid)
                N->>X: GET /api/me
                X->>X: sessionActor(req)
                X-->>N: profil, école
                N->>X: GET /api/workspace
                X-->>N: vue du compte
            end
        end
    end
```
