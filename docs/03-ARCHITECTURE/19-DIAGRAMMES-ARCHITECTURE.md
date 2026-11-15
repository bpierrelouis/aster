# Diagrammes d’architecture

<!-- version:debut : généré par versions.py, ne pas modifier à la main -->
| Version | Mise à jour | Destination | Dernière évolution | Historique |
| --- | --- | --- | --- | --- |
| 2.3 | 15/11/2026 | Production destinée à la remise | Trace tous les flux réels de la vue complète du démonstrateur ; Trace tous les flux réels de la vue complète et nomme le stockage NFS de la cible ; Trace tous les flux de la vue complète ; cible avec stockage NFS et RIGEL servi par l’entrée d’ORION | [9 versions](../../archive/README.md#19-diagrammes-architecture) |
<!-- version:fin -->

## Vue simplifiée

![Vue simplifiée du démonstrateur ORION sur dix VM, avec leurs IPv4](assets/ORION-VUE-SIMPLIFIEE.svg)

## Architecture réelle sur VM

![Vue complète du démonstrateur ORION sur dix VM, avec leurs IPv4](assets/ORION-DEPLOIEMENT-VM.svg)

## Architecture cible sur le C1NP

### Vue simplifiée de la cible

![Principaux échanges et répartition des rôles sur les quatre VM ORION](assets/ORION-CIBLE-VUE-SIMPLIFIEE.svg)

### Vue détaillée de la cible

![Déploiement cible ORION sur quatre VM](assets/ORION-CIBLE-C1NP.svg)
