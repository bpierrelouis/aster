#!/usr/bin/env bash
# Déploiement de la pile « orion » sur les VM, depuis le poste de l'opérateur ou le runner du déploiement continu.
# Usage : ./deployer.sh <compte Docker Hub> <étiquette des images>   (étiquette = SHA du commit publié par la CI)
# Prérequis : installer.sh exécuté (cluster, stockage, secrets, certificats).
set -euo pipefail
cd "$(dirname "$0")"
. ./vm.sh

[ $# -eq 2 ] || { echo "Usage : $0 <compte Docker Hub> <étiquette>" >&2; exit 2; }
ORION_IMAGES=$1 ORION_TAG=$2
# Les configurations Swarm sont immuables : leur nom porte l'empreinte du contenu
empreinte() { tr -d '\r' < "$1" | sha256sum | cut -c1-12; }
VARIABLES="ORION_IMAGES=$ORION_IMAGES ORION_TAG=$ORION_TAG EMPREINTE_HAPROXY=$(empreinte haproxy.cfg) \
EMPREINTE_LOGSTASH=$(empreinte logstash.conf) EMPREINTE_BIND=$(empreinte bind/named.conf) \
EMPREINTE_ZONE=$(empreinte bind/orion.internal.zone) EMPREINTE_LDAP=$(empreinte ../ldap/orion-utilisateurs.ldif)"

# La VM de secours est vidée pendant le déploiement, pour que PostgreSQL, l'identité et Logstash démarrent sur leur VM ;
# elle ne l'est que si ces VM sont prêtes, sinon le service repris par le secours y reste.
etat_noeud() { docker_vm node inspect -f '{{.Status.State}}' "orion-$1"; }
VIDE=""
if [ "$(etat_noeud 6)$(etat_noeud 7)$(etat_noeud 8)" = readyreadyready ]; then
  docker_vm node update --availability drain "orion-$SECOURS" >/dev/null && VIDE=1
fi
# Remise en service de la VM de secours, même si le déploiement échoue
trap 'if [ -n "$VIDE" ]; then docker_vm node update --availability active "orion-$SECOURS" >/dev/null; fi' EXIT

# Fichiers de la pile copiés sur le manager orion-1, puis déploiement ; attend la convergence des services
tar -C .. -cf - vm/pile.yaml vm/haproxy.cfg vm/logstash.conf vm/bind ldap/orion-utilisateurs.ldif \
  | ssh_vm 1 'rm -rf ~/orion-pile && mkdir ~/orion-pile && tar -xf - -C ~/orion-pile && find ~/orion-pile -type f -exec sed -i "s/\r$//" {} +'
ssh_vm 1 "cd ~/orion-pile/vm && $VARIABLES timeout 900 docker stack deploy --detach=false --prune -c pile.yaml orion"

# Vérification, depuis orion-1 : la version servie par https://orion.internal est celle déployée
for _ in $(seq 60); do
  if ssh_vm 1 "curl -sf --noproxy '*' --cacert /etc/docker/orion-ca.pem https://$DOMAINE/api/infos" | grep -q "$ORION_TAG"; then
    echo "ORION $ORION_TAG déployé : https://$DOMAINE"; exit 0
  fi
  sleep 5
done
echo "La version $ORION_TAG ne répond pas sur https://$DOMAINE" >&2
docker_vm service ls >&2
exit 1
