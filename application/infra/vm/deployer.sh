#!/usr/bin/env bash
# Déploiement de la pile sur les VM, depuis le poste de l'opérateur ou le runner du déploiement continu.
# Usage : ./deployer.sh <compte Docker Hub> <étiquette des images>   (étiquette = SHA du commit publié par la CI)
# Prérequis : installer.sh exécuté une fois (cluster, secrets, certificats).
set -euo pipefail
cd "$(dirname "$0")"
. ./vm.sh

[ $# -eq 2 ] || { echo "Usage : $0 <compte Docker Hub> <étiquette>" >&2; exit 2; }
export ASTER_IMAGES=$1 ASTER_TAG=$2
# Les configurations Swarm sont immuables : leur nom porte l'empreinte du contenu
empreinte() { tr -d '\r' < "$1" | sha256sum | cut -c1-12; }
export EMPREINTE_HAPROXY=$(empreinte haproxy.cfg) EMPREINTE_LOGSTASH=$(empreinte logstash.conf) EMPREINTE_LDAP=$(empreinte ../ldap/aster-utilisateurs.ldif)

# Fichiers de la pile copiés sur le manager de la VM 01, puis déploiement ; attend la convergence des services
tar -C .. -cf - vm/pile.yaml vm/haproxy.cfg vm/logstash.conf ldap/aster-utilisateurs.ldif \
  | ssh_vm 1 'rm -rf ~/aster-pile && mkdir ~/aster-pile && tar -xf - -C ~/aster-pile && find ~/aster-pile -type f -exec sed -i "s/\r$//" {} +'
ssh_vm 1 "cd ~/aster-pile/vm && ASTER_IMAGES=$ASTER_IMAGES ASTER_TAG=$ASTER_TAG EMPREINTE_HAPROXY=$EMPREINTE_HAPROXY \
  EMPREINTE_LOGSTASH=$EMPREINTE_LOGSTASH EMPREINTE_LDAP=$EMPREINTE_LDAP \
  timeout 900 docker stack deploy --detach=false --prune -c pile.yaml aster"

# Vérification : la version servie par l'entrée est celle déployée
for _ in $(seq 60); do
  if ssh_vm 1 "curl -sf --noproxy '*' --cacert /etc/docker/aster-ca.pem https://${VM[1]}/api/infos" | grep -q "$ASTER_TAG"; then
    echo "ASTER $ASTER_TAG déployé : https://${VM[1]}"; exit 0
  fi
  sleep 5
done
echo "La version $ASTER_TAG ne répond pas sur https://${VM[1]}" >&2
docker_vm service ls >&2
exit 1
