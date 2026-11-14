# Diagrammes d'activité de l'application ORION

<!-- version:debut : généré par versions.py, ne pas modifier à la main -->
| Version | Mise à jour | Destination | Dernière évolution | Historique |
| --- | --- | --- | --- | --- |
| 2.0 | 14/11/2026 | Production destinée à la remise | Mise à jour d’après l’état actuel : super administrateur, MindefConnect, RIGEL, solution d’administration des postes, PDF à la demande, traitement par le gestionnaire | [7 versions](../../../archive/README.md#07-diagrammes-activite) |
<!-- version:fin -->

## Parcours général

```mermaid
flowchart TD
    debut(["Début"]) --> authentification["S'authentifier via MindefConnect"]
    authentification --> compte{"Compte ORION actif<br/>pour cette identité ?"}
    compte -->|"Non"| refus(["Accès refusé"])
    compte -->|"Oui"| accueil["Afficher son tableau de bord personnel<br/>et le résumé de ses notifications"]
    accueil --> profil{"Super administrateur ?"}
    profil -->|"Oui"| ecole["Choisir l'école affichée<br/>ou toutes les écoles"]
    profil -->|"Non"| choix["Choisir une activité accessible<br/>selon son profil"]
    ecole --> choix

    choix -->|"Tous les profils"| personnel["Personnaliser son tableau de bord ;<br/>consulter ses notifications,<br/>les salles et leurs matériels"]
    choix -->|"Gestionnaire, administrateur,<br/>super administrateur"| bords["Consulter les tableaux de bord<br/>du parc et des remontées"]
    choix -->|"Gestionnaire, administrateur,<br/>super administrateur"| parc["Créer, modifier ou importer des matériels ;<br/>gérer stocks et affectations ;<br/>prévoir l'installation d'une salle"]
    choix -->|"Gestionnaire, administrateur,<br/>super administrateur"| suivi["Consulter les remontées de l'école,<br/>leur PDF d'état des lieux,<br/>les installations et les recensements"]
    choix -->|"Gestionnaire"| traitement["Traiter les remontées"]
    choix -->|"Gestionnaire"| rigel["Confirmer les installations ;<br/>lancer et réaliser les recensements,<br/>dans ORION ou avec RIGEL"]
    choix -->|"Formateur, administrateur,<br/>super administrateur"| supervision["Superviser une salle"]
    choix -->|"Formateur, administrateur,<br/>super administrateur"| remontee["Créer une remontée ;<br/>suivre ses remontées et leur PDF"]
    choix -->|"Administrateur,<br/>super administrateur"| administration["Gérer salles, étages, postes,<br/>applications, règles de processus et comptes ;<br/>supprimer un matériel du stock ;<br/>demander une intervention sur les postes"]
    choix -->|"Super administrateur"| global["Gérer les écoles, les règles globales<br/>et les comptes de super administrateur"]

    personnel --> autre{"Autre activité ?"}
    bords --> autre
    parc --> autre
    suivi --> autre
    traitement --> autre
    rigel --> autre
    supervision --> autre
    remontee --> autre
    administration --> autre
    global --> autre
    autre -->|"Oui"| choix
    autre -->|"Non"| deconnexion["Se déconnecter"]
    deconnexion --> fin(["Fin"])
```

## Création d'une remontée

```mermaid
flowchart TD
    debut(["Formateur, administrateur ou<br/>super administrateur : créer une remontée"]) --> materiels["Sélectionner le ou les matériels concernés :<br/>matériels affectés à une salle pour le formateur,<br/>matériels de l'école sinon"]
    materiels --> type["Choisir le type de problème"]
    type --> description["Décrire le problème"]
    description --> transmettre["Transmettre la remontée"]
    transmettre --> controle{"Type, description et matériels<br/>conformes ?"}
    controle -->|"Non"| materiels
    controle -->|"Oui"| enregistrer["ORION numérote la remontée, fixe son auteur<br/>et sa date, et l'enregistre « en attente »"]
    enregistrer --> notifier["ORION notifie le gestionnaire de l'école"]
    notifier --> fin(["Remontée créée"])
```

## Consultation d'un état des lieux

```mermaid
flowchart TD
    debut(["Utilisateur : consulter ou télécharger<br/>le PDF d'état des lieux d'une remontée"]) --> droit{"Gestionnaire ou administrateur de l'école,<br/>super administrateur ou auteur de la remontée ?"}
    droit -->|"Non"| refus(["Document indisponible"])
    droit -->|"Oui"| produire["ORION produit le PDF avec les informations actuelles :<br/>matériels, problème, localisation, statut et suivi"]
    produire --> remettre["Afficher ou télécharger le PDF"]
    remettre --> fin(["PDF remis, non conservé par ORION"])
```

## Traitement d'une remontée par le gestionnaire

```mermaid
flowchart TD
    debut(["Gestionnaire : remontée « en attente »<br/>notifiée ou repérée dans le suivi"]) --> ouvrir["Ouvrir la remontée"]
    ouvrir --> prendre["Prendre en charge la remontée"]
    prendre --> encours["ORION la passe « en cours », conserve la date<br/>et l'auteur, et notifie l'auteur de la remontée"]
    encours --> intervenir["Remplacer ou corriger<br/>le ou les matériels concernés"]
    intervenir --> issue{"Issue du traitement ?"}
    issue -->|"Remplacement"| remplace["Terminer la remontée « remplacé »"]
    issue -->|"Correction"| corrige["Terminer la remontée « corrigé »"]
    remplace --> terminer["ORION conserve la date et l'auteur,<br/>et notifie l'auteur de la remontée"]
    corrige --> terminer
    terminer --> fin(["Remontée terminée : statut définitif"])
```

## Supervision des processus

```mermaid
flowchart TD
    debut(["Formateur, administrateur ou<br/>super administrateur : superviser"]) --> salle["Choisir une salle de son école"]
    salle --> consulter["Consulter les postes, leurs sessions,<br/>leurs processus utilisateur et les alertes de la salle"]
    consulter --> arret{"Arrêter un processus utilisateur ?"}
    arret -->|"Non"| fin(["Fin de la supervision"])
    arret -->|"Oui"| selection["Sélectionner un processus en cours"]
    selection --> attente{"Arrêt déjà en attente<br/>pour ce processus ?"}
    attente -->|"Oui"| consulter
    attente -->|"Non"| demande["ORION enregistre la demande d'arrêt"]
    demande --> execution["La solution d'administration des postes<br/>arrête le processus sur le poste<br/>et renvoie le résultat"]
    execution --> resultat["Afficher le résultat : réussi ou en échec"]
    resultat --> consulter
```

## Remontée de l'état d'un poste

```mermaid
flowchart TD
    rapport(["Solution d'administration des postes :<br/>état d'un poste toutes les cinq secondes"]) --> etat["ORION met à jour le système d'exploitation,<br/>la session, les processus utilisateur<br/>et les applications installées du poste"]
    etat --> classement{"Classement d'un nouveau processus ?"}
    classement -->|"Liste blanche"| affichage["Afficher le processus en temps réel"]
    classement -->|"Non référencé"| detection["Afficher le processus et<br/>enregistrer une détection"]
    classement -->|"Liste noire"| interdit["Enregistrer une détection et<br/>demander l'arrêt automatique du processus"]
    interdit --> alerte["Notifier l'administrateur et le super administrateur ;<br/>afficher l'alerte dans la salle"]
    alerte --> resultat["Conserver le résultat de l'arrêt<br/>renvoyé par le poste"]
    affichage --> fin(["Poste à jour"])
    detection --> fin
    resultat --> fin
    silence(["Aucun état reçu<br/>depuis trente secondes"]) --> deconnecte["ORION considère le poste déconnecté<br/>et clôt ses processus en cours"]
    deconnecte --> fin
```

## Intervention sur les postes

```mermaid
flowchart TD
    debut(["Administrateur ou super administrateur :<br/>intervenir sur des postes"]) --> type["Choisir l'intervention : installation<br/>ou désinstallation d'une application,<br/>réinitialisation"]
    type --> cible["Choisir un poste ou les postes d'une salle"]
    cible --> enregistrer["ORION enregistre l'intervention<br/>pour un à cinq cents postes d'une école"]
    enregistrer --> executer["La solution d'administration des postes<br/>exécute l'intervention sur chaque poste<br/>et renvoie son résultat"]
    executer --> suivi["ORION met à jour le suivi poste par poste"]
    suivi --> reponses{"Tous les postes<br/>ont répondu ?"}
    reponses -->|"Non"| executer
    reponses -->|"Oui"| reussite{"Tous les postes<br/>ont réussi ?"}
    reussite -->|"Oui"| terminee["Intervention « terminée »"]
    reussite -->|"Non"| echec["Intervention « en échec »"]
    terminee --> notifier["ORION notifie l'auteur de l'intervention"]
    echec --> notifier
    notifier --> fin(["Fin de l'intervention"])
```

## Consultation des notifications

```mermaid
flowchart TD
    debut(["Utilisateur connecté"]) --> calcul["ORION rassemble les notifications<br/>de son profil"]
    calcul --> gestionnaire{"Gestionnaire ?"}
    gestionnaire -->|"Oui"| parc["Nouvelles remontées de l'école,<br/>garanties échues ou à échéance dans six mois,<br/>matériels à déplacer"]
    gestionnaire -->|"Non"| auteur["Évolution des remontées<br/>dont il est l'auteur"]
    auteur --> admin{"Administrateur ou<br/>super administrateur ?"}
    admin -->|"Oui"| supervision["Interventions demandées et terminées,<br/>processus interdits lancés"]
    admin -->|"Non"| resume
    parc --> resume["Afficher le résumé des notifications<br/>regroupées par nature"]
    supervision --> resume
    resume --> detail{"Consulter le détail ?"}
    detail -->|"Oui"| liste["Afficher le détail des notifications<br/>et ouvrir l'élément concerné"]
    detail -->|"Non"| fin(["Fin"])
    liste --> fin
```

## Installation d'une salle

```mermaid
flowchart TD
    debut(["Gestionnaire, administrateur ou<br/>super administrateur : prévoir l'installation"]) --> affecter["Affecter des matériels à la salle<br/>ou en retirer vers le stock"]
    affecter --> deplacements["ORION lance les déplacements :<br/>salle en cours d'installation"]
    deplacements --> notifier["ORION notifie le gestionnaire<br/>des matériels à déplacer"]
    notifier --> mode{"Gestionnaire :<br/>confirmer avec RIGEL ?"}
    mode -->|"Non"| confirmer["Confirmer dans ORION le déplacement<br/>de chaque matériel installé"]
    mode -->|"Oui"| lier["Lancer l'installation RIGEL de la salle<br/>et lier son téléphone par le QR code"]
    lier --> scanner["Ouvrir la salle sur le téléphone<br/>et scanner les matériels"]
    scanner --> integrer["ORION intègre les constats<br/>transmis par le relais"]
    confirmer --> reste{"Reste-t-il des déplacements<br/>vers la salle ou depuis elle ?"}
    integrer --> reste
    reste -->|"Oui"| mode
    reste -->|"Non"| terminee(["ORION termine l'installation de la salle"])
```

## Recensement avec RIGEL

```mermaid
flowchart TD
    debut(["Gestionnaire : nouveau recensement"]) --> perimetre["Choisir l'école entière ou des salles"]
    perimetre --> lancer["ORION ouvre le recensement<br/>pour quatorze jours au plus"]
    lancer --> lier["Lier son téléphone par le QR code<br/>affiché dans ORION"]
    lier --> lieu["Ouvrir un lieu sur le téléphone :<br/>s'y déclarer présent"]
    lieu --> scan["Scanner un matériel, avec ou sans réseau"]
    scan --> connu{"Matériel connu ?"}
    connu -->|"Non"| inconnu["Confirmer l'ajout et saisir<br/>les informations du matériel"]
    connu -->|"Oui"| place{"Affecté au lieu ouvert ?"}
    place -->|"Oui"| present["Confirmer sa présence"]
    place -->|"Non"| ailleurs["L'accepter sur place, le ramener<br/>à son lieu d'affectation ou le mettre au stock"]
    inconnu --> constat["Enregistrer le constat sur le téléphone"]
    present --> constat
    ailleurs --> constat
    constat --> suivant{"Autre matériel ou autre lieu ?"}
    suivant -->|"Autre matériel"| scan
    suivant -->|"Autre lieu"| lieu
    suivant -->|"Non"| transmettre["Transmettre les constats chiffrés<br/>au relais dès que le réseau le permet"]
    transmettre --> recent{"Scan plus récent que la dernière<br/>information connue du matériel ?"}
    recent -->|"Non"| refuse["ORION refuse le constat"]
    recent -->|"Oui"| integrer["ORION intègre le constat : présence confirmée,<br/>matériel réaffecté, déplacement lancé<br/>ou matériel créé dans le lieu du scan"]
    refuse --> cloture
    integrer --> cloture{"Recensement clos à la demande<br/>ou au bout de quatorze jours ?"}
    cloture -->|"Non"| lieu
    cloture -->|"Oui"| fin(["Recensement clos, constats conservés"])
```
