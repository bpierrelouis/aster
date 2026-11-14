# Diagramme de contexte de l'application ORION

<!-- version:debut : généré par versions.py, ne pas modifier à la main -->
| Version | Mise à jour | Destination | Dernière évolution | Historique |
| --- | --- | --- | --- | --- |
| 3.0 | 14/11/2026 | Production destinée à la remise | Mise à jour d’après l’état actuel : super administrateur, MindefConnect, RIGEL, solution d’administration des postes, PDF à la demande, traitement par le gestionnaire | [6 versions](../../../archive/README.md#06-diagramme-contexte) |
<!-- version:fin -->

```mermaid
flowchart LR
    gestionnaire(["Gestionnaire"])
    formateur(["Formateur"])
    administrateur(["Administrateur"])
    superadmin(["Super administrateur"])
    subgraph rigel["RIGEL, module externe de recensement mobile"]
        telephone["Téléphone RIGEL<br/>du gestionnaire"]
        relais["Relais public RIGEL"]
    end
    orion["Application ORION"]
    mindefconnect["MindefConnect<br/>service d'authentification"]
    administrationPostes["Solution d'administration<br/>des postes Windows"]

    gestionnaire <-->|"Vers RIGEL : scan des salles et des matériels,<br/>saisie d'un matériel inconnu<br/>Vers le gestionnaire : avancement, matériels attendus"| telephone
    telephone <-->|"Vers le relais : constats chiffrés<br/>Vers le téléphone : lieux et matériels à jour, chiffrés"| relais
    relais <-->|"Vers ORION : constats chiffrés, relevés par ORION<br/>Vers le relais : installations et recensements en cours,<br/>lieux et matériels à jour, chiffrés"| orion

    gestionnaire <-->|"Vers ORION : matériels, stocks, affectations, import JSON ;<br/>prise en charge et traitement des remontées ;<br/>confirmation des installations, recensements<br/>Vers le gestionnaire : tableaux de bord du parc et des remontées ;<br/>notifications des nouvelles remontées, des garanties<br/>et des matériels à déplacer ; PDF d'état des lieux<br/>produit à la demande ; QR code de liaison RIGEL"| orion
    formateur <-->|"Vers ORION : consultation des salles ; supervision d'une salle,<br/>arrêt d'un processus utilisateur ; création d'une remontée<br/>Vers le formateur : postes, processus utilisateur et alertes<br/>de la salle ; suivi et PDF de ses remontées ;<br/>notifications de leur évolution"| orion
    administrateur <-->|"Vers ORION : parc, salles, postes, applications,<br/>règles de processus et comptes de son école ;<br/>interventions sur les postes ; création d'une remontée<br/>Vers l'administrateur : tableaux de bord, supervision,<br/>statistiques, PDF d'état des lieux, résultats des interventions ;<br/>notifications des interventions, des processus interdits<br/>et de ses remontées"| orion
    superadmin <-->|"Vers ORION : actions de l'administrateur sur toutes les écoles ;<br/>écoles, règles globales, comptes de super administrateur<br/>Vers le super administrateur : données de l'école choisie<br/>ou de toutes les écoles ; notifications de l'administrateur"| orion

    orion <-->|"Vers MindefConnect : redirection des utilisateurs<br/>pour authentification<br/>Vers ORION : identité authentifiée"| mindefconnect
    orion <-->|"Vers la solution : interventions (arrêt de processus,<br/>installation, désinstallation, réinitialisation)<br/>Vers ORION : système d'exploitation, sessions,<br/>processus utilisateur et applications installées<br/>des postes ; résultats des interventions"| administrationPostes
```
