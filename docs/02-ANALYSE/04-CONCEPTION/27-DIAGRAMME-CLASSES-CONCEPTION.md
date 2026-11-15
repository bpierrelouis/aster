# Diagramme de classes de conception

<!-- version:debut : généré par versions.py, ne pas modifier à la main -->
| Version | Mise à jour | Destination | Dernière évolution | Historique |
| --- | --- | --- | --- | --- |
| 1.0 | 15/11/2026 | Production destinée à la remise | Classes de conception du serveur et du navigateur | [1 version](../../../archive/README.md#27-diagramme-classes-conception) |
<!-- version:fin -->

## Serveur : API, moteur d'écriture et persistance

```mermaid
classDiagram
    direction TB
    class ServeurExpress["index.ts"] {
        <<module>>
        GET /auth/login
        GET /auth/callback
        POST /auth/logout
        GET /api/me
        +sessionActor(req) Promise~Actor~
        +identityProvider() Promise~Configuration~
    }
    class OpenIdClient["openid-client"] {
        <<library>>
        +discovery()
        +buildAuthorizationUrl()
        +authorizationCodeGrant()
        +buildEndSessionUrl()
    }
    class SessionPg["connect-pg-simple"] {
        <<library>>
        table session
    }
    class WorkspaceRouter["routes.ts · createWorkspaceRouter · /api/workspace"] {
        <<router>>
        GET PUT /
        POST /import/analyse
        POST /import
        GET /postes/:id/jeton
        GET /recensements/:id/appairage
        POST /salles/:id/installation
        POST /constats/:id/traitement
        GET /reports/:id/pdf
    }
    class AgentRouter["routes.ts · createAgentRouter · /api/agent"] {
        <<router>>
        GET /postes
        POST /rapports
        POST /resultats
        +jetonPoste(secret, nomReseau) string
    }
    class RigelRouter["routes.ts · createRigelRouter · /api/rigel"] {
        <<router>>
        GET /campagnes
        POST /campagnes/:id/evenements
    }
    class Engine["engine.ts · Engine"] {
        -listeners : Set
        +snapshot() Promise~WorkspaceState~
        +read(actor) Promise~WorkspaceView~
        +update(input, baseRevision, actor) Promise~WorkspaceView~
        +connexion(accountId, sub)
        +actor(accountId) Promise~Actor~
        +findAccount(identity) Promise~Compte~
        +importAnalyse(actor, input)
        +importMateriels(actor, input)
        +pdf(reportId, actor) Promise~Buffer~
        +rigel.appairage(actor, id, config)
        +rigel.campagnes(secret)
        +rigel.evenements(secret, campagne, blocs)
        +rigel.installation(actor, salleId, config)
        +rigel.traiter(actor, constat, action)
        +agent.postes()
        +agent.rapports(rapports)
        +agent.resultats(resultats)
        +agent.sweep()
        +onCommit(fn)
        -write~R~(change, auteur) Promise~R~
        -system~R~(mutate) Promise~R~
    }
    class Store {
        <<interface>>
        +read() Promise~WorkspaceState~
        +write~R~(change) Promise~Committed~
        +replace(choose) Promise~boolean~
    }
    class JournalEntry {
        <<interface>>
        revision : number
        before : Map
    }
    class Fusion["fusion.ts"] {
        <<module>>
        +rebase(state, input, base, log, actor) WorkspaceInput
        +keyOf(collection, id) string
        +parseKey(key) string[]
    }
    class PostgresStore["postgres.ts · createPostgresWorkspaceRepository"] {
        -cache : WorkspaceState
        -ENTITIES : Entity[]
        -current(db, lock) WorkspaceState
        -loadState(db, schema)
        -writeDiff(db, schema, before, after)
        -writePreferences(db, schema, before, after)
        -writeMeta(db, schema, state)
        -transaction(pool, fn, begin)
    }
    class FichierStore["engine.ts · createWorkspaceRepository"] {
        -state : WorkspaceState
        -journal : JournalEntry[]
        -queue : Promise
        -save(next)
    }
    class Migrations["migrations.ts"] {
        <<module>>
        MIGRATIONS
        +migrer(db, schema) number[]
    }
    class PoolPg["pg · Pool"] {
        <<library>>
    }

    ServeurExpress ..> OpenIdClient : «use»
    ServeurExpress ..> SessionPg : «use»
    ServeurExpress ..> WorkspaceRouter : «create»
    ServeurExpress ..> AgentRouter : «create»
    ServeurExpress ..> RigelRouter : «create»
    ServeurExpress --> Engine : workspaceRepository
    WorkspaceRouter --> Engine : repository
    AgentRouter --> Engine : repository
    RigelRouter --> Engine : repository
    Engine --> "1" Store : store
    Engine ..> Fusion : «use»
    Store ..> JournalEntry
    PostgresStore ..|> Store
    FichierStore ..|> Store
    PostgresStore ..> Migrations : «use»
    PostgresStore --> PoolPg : pool
    SessionPg --> PoolPg : pool
```

## Serveur : règles du domaine, documents et RIGEL

```mermaid
classDiagram
    direction LR
    class Engine["engine.ts · Engine"] {
        +update(input, baseRevision, actor)
        +pdf(reportId, actor)
        +agent.rapports(rapports)
        +agent.resultats(resultats)
        +rigel.evenements(secret, campagne, blocs)
    }
    class Espace["espace.ts"] {
        <<module>>
        +initialState(now) WorkspaceState
        +visibleTo(collection, item, state, actor) boolean
        +scopedState(state, actor) WorkspaceView
        +mergeState(state, input, actor, now) WorkspaceState
        +editable(collection, item)
        +strip(collection, item)
    }
    class Contexte {
        <<interface>>
        state : WorkspaceState
        next : WorkspaceState
        actor : Actor
        now : number
        stored : Map
        numeros : object
    }
    class Commun["commun.ts"] {
        <<module>>
        collections : CollectionName[]
        +same(a, b) boolean
        +fail(status, message) never
        +assert(condition, message)
        +schoolOf(item, state) Id
        +seulsModifies(old, x, champs, message)
    }
    class Comptes["comptes.ts"] {
        <<module>>
        +actorOf(state, accountId) Actor
        +accountForIdentity(state, identity) Compte
        +regleCompte(x, old, ctx)
    }
    class Parc["parc.ts"] {
        <<module>>
        +regleMateriel(x, old, ctx)
        +regleLieu(collection, x)
    }
    class Remontees["remontees.ts"] {
        <<module>>
        +regleRemontee(x, old, ctx)
    }
    class Postes["postes.ts"] {
        <<module>>
        DISCONNECT_AFTER
        +applyReports(state, rapports, now) string[]
        +pendingCommands(state, posteNames) Commande[]
        +applyResults(state, resultats, now)
        +markDisconnected(state, now)
        +reglePoste(x, ctx)
        +regleIntervention(x, old, ctx)
        +eteindreHorsService(state, now)
    }
    class Recensement["recensement.ts"] {
        <<module>>
        +regleRecensement(x, old, state, actor, now)
        +regleConstat(x, old, actor, now)
        +traiterConstat(state, id, action, actor, now)
        +lancerInstallation(state, actor, salleId, now)
        +cloreInstallations(state, now)
        +appairage(state, actor, id, config)
        +campagnesPubliees(state, secret, now)
        +dechiffrerEvenements(secret, campagne, blocs)
        +appliquerEvenements(state, campagne, evenements, now)
    }
    class Import["import.ts"] {
        <<module>>
        +analyseImport(state, actor, input)
        +importMateriels(state, actor, input, now)
    }
    class Pdf["pdf.ts"] {
        <<module>>
        +reportPdf(report, state) Buffer
        -canvas()
        -assemble(pages)
    }
    class PdfTexte["pdf-texte.ts"] {
        <<module>>
        +textWidth(s, size, bold, spacing)
        +fit(s, width, size, bold)
        +wrap(s, width, size)
    }
    class SharedRigel["shared/rigel.ts"] {
        <<module>>
        +chiffrer(cle, campagne, valeur) Bloc
        +dechiffrer(cle, campagne, bloc)
        +empreinte(valeur) string
        +installationDe(operations, salleId, now)
        +ouverte(r, now) boolean
    }
    class Connecteur["connecteur.ts · createConnecteur"] {
        -publiees : Map
        +cycle() Promise~number~
        +demarrer(intervalle)
        -versOrion(chemin, init)
        -versRelais(chemin, init)
    }
    class Relais["relais.ts · createRelais · /api"] {
        GET /campagnes/:id/instantane
        POST /campagnes/:id/evenements
        GET /connecteur/campagnes
        PUT DELETE /connecteur/campagnes/:id
        GET /connecteur/campagnes/:id/evenements
        POST /connecteur/campagnes/:id/acquittement
    }
    class RelaisStore {
        <<interface>>
        +campagnes()
        +campagne(id)
        +deposer(campagne)
        +supprimer(id)
        +ajouter(campagne, evenements)
        +enAttente(campagne) number
        +evenements(campagne, limite)
        +acquitter(campagne, jusqua)
        +purger(now)
    }
    class RelaisPg["relais-store.ts · createPostgresStore"]
    class RelaisMemoire["relais-store.ts · createMemoryStore"]

    Engine ..> Espace : «use»
    Engine ..> Postes : «use»
    Engine ..> Recensement : «use»
    Engine ..> Import : «use»
    Engine ..> Pdf : «use»
    Engine ..> Comptes : «use»
    Espace ..> Contexte : «create»
    Espace ..> Comptes : «use»
    Espace ..> Parc : «use»
    Espace ..> Remontees : «use»
    Espace ..> Postes : «use»
    Espace ..> Recensement : «use»
    Espace ..> Commun : «use»
    Parc ..> Contexte
    Remontees ..> Contexte
    Postes ..> Contexte
    Comptes ..> Contexte
    Pdf ..> PdfTexte : «use»
    Recensement ..> SharedRigel : «use»
    Connecteur ..> Engine : HTTP /api/rigel
    Connecteur ..> Relais : HTTPS /api/connecteur
    Relais --> RelaisStore : store
    RelaisPg ..|> RelaisStore
    RelaisMemoire ..|> RelaisStore
```

## Navigateur : espace de travail ORION et application RIGEL

```mermaid
classDiagram
    direction LR
    class Workspace["espace.tsx · Workspace"] {
        <<component>>
        routes react-router
    }
    class Shell {
        <<component>>
    }
    class Salles {
        <<component>>
    }
    class Inventaire {
        <<component>>
    }
    class Remontees["Remontees"] {
        <<component>>
    }
    class Supervision {
        <<component>>
        -requestStop(proc)
    }
    class Administration {
        <<component>>
    }
    class RecensementVue["Recensement"] {
        <<component>>
    }
    class Store["core/store.ts · store"] {
        <<singleton>>
        -state : EtatLocal
        -committed : WorkspaceView
        -queue : Promise
        -pending : number
        -etag : string
        +state EtatLocal
        +version number
        +subscribe(fn) function
        +update(topic, mutator) Promise
        +flush() Promise
        +call~T~(path, body) Promise~T~
        -request(options, path)
        -sync()
    }
    class UseStore["hooks/use-store.ts"] {
        <<hook>>
        +useStore() EtatLocal
    }
    class Selectors["core/selectors.ts"] {
        <<module>>
        +cached(key, fn)
        +scope()
        +parc()
        +remontees()
        +detections()
    }
    class Permissions["core/permissions.ts"] {
        <<module>>
        +can(capability) boolean
        +why(capability) string
    }
    class Interventions["core/interventions.ts"] {
        <<module>>
        +interventions() SuiviIntervention[]
        +interventionsOuvertes()
    }
    class Overlays["ui/overlays.tsx"] {
        <<module>>
        +notify(message, options)
        OverlayHost
    }
    class RigelApp["rigel/app.tsx"] {
        <<component>>
        Accueil Explorer Salle Scanner Inventaire Synchronisation
    }
    class UseRigel["rigel/hooks/use-rigel.ts"] {
        <<hook>>
        +useRigel() Etat
    }
    class EtatRigel["rigel/core/etat.ts · rigel"] {
        <<singleton>>
        -etat : Etat
        +demarrer()
        +appairer(appairage)
        +constater(evenement) EvenementRigel
        +synchroniser() Promise
        +dissocier()
    }
    class RelaisClient["rigel/core/relais.ts"] {
        <<module>>
        +deposer(appairage, evenements) Set
        +telecharger(appairage) InstantaneRigel
    }
    class BaseLocale["rigel/core/base.ts"] {
        <<module>>
        IndexedDB orion-recensement
        +lire(cle)
        +ecrire(cle, valeur)
        +vider()
    }

    Workspace *-- Shell
    Workspace o-- Salles : route
    Workspace o-- Inventaire : route
    Workspace o-- Remontees : route
    Workspace o-- Supervision : route
    Workspace o-- Administration : route
    Workspace o-- RecensementVue : route
    Salles ..> UseStore
    Remontees ..> UseStore
    Supervision ..> UseStore
    Administration ..> UseStore
    Inventaire ..> UseStore
    RecensementVue ..> UseStore
    UseStore ..> Store
    Salles ..> Selectors
    Remontees ..> Selectors
    Supervision ..> Selectors
    Administration ..> Interventions
    Selectors ..> Store
    Interventions ..> Store
    Permissions ..> Store
    Shell ..> Permissions
    Remontees ..> Store : update
    Supervision ..> Store : update
    Administration ..> Store : update
    Inventaire ..> Store : call /import
    RecensementVue ..> Store : call
    Workspace ..> Overlays
    RigelApp ..> UseRigel
    UseRigel ..> EtatRigel
    EtatRigel ..> RelaisClient
    EtatRigel ..> BaseLocale
```
