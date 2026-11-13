#!/usr/bin/env bash
# Déploiement de la pile « orion » sur les VM, depuis le poste de l'opérateur ou le runner du déploiement continu.
# Usage : ./deployer.sh <compte Docker Hub> <étiquette des images>   (étiquette = SHA du commit publié par la CI)
# Prérequis : installer.sh exécuté (cluster, stockage, secrets, certificats).
set -euo pipefail
cd "$(dirname "$0")"
. ./vm.sh

[ $# -eq 2 ] || { echo "Usage : $0 <compte Docker Hub> <étiquette>" >&2; exit 2; }
ORION_IMAGES=$1 ORION_TAG=$2
[[ $ORION_IMAGES =~ ^[A-Za-z0-9._/-]+$ ]] || { echo "Compte Docker Hub invalide : $ORION_IMAGES" >&2; exit 2; }
[[ $ORION_TAG =~ ^[0-9a-fA-F]{7,64}$ ]] || { echo "Étiquette attendue : SHA Git de 7 à 64 caractères hexadécimaux" >&2; exit 2; }
# Les configurations Swarm sont immuables : leur nom porte l'empreinte du contenu
empreinte() {
  if command -v sha256sum >/dev/null; then tr -d '\r' < "$1" | sha256sum | cut -c1-12
  else tr -d '\r' < "$1" | shasum -a 256 | cut -c1-12
  fi
}
VARIABLES="ORION_IMAGES=$ORION_IMAGES ORION_TAG=$ORION_TAG ORION_ENTREE=$ENTREE ORION_STOCKAGE=${VM[10]} EMPREINTE_HAPROXY=$(empreinte haproxy.cfg) \
EMPREINTE_LOGSTASH=$(empreinte logstash.conf) EMPREINTE_LDAP=$(empreinte ../ldap/orion-utilisateurs.ldif)"
# Recensement mobile (fonctionnalité complémentaire) : adresse HTTPS du relais (RELAIS_URL ; vide : non déployé) et secret des
# campagnes, partagé par l'API et le connecteur, créé au premier déploiement
VARIABLES="$VARIABLES ORION_RELAIS=$(printf '%q' "${RELAIS_URL:-}")"
docker_vm secret inspect RECON_SECRET >/dev/null 2>&1 || printf '%s' "$(openssl rand -hex 32)" | docker_vm secret create RECON_SECRET - >/dev/null

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
tar -C .. -cf - vm/pile.yaml vm/haproxy.cfg vm/logstash.conf ldap/orion-utilisateurs.ldif \
  | ssh_vm 1 'rm -rf ~/orion-pile && mkdir ~/orion-pile && tar -xf - -C ~/orion-pile && find ~/orion-pile -type f -exec sed -i "s/\r$//" {} +'
ssh_vm 1 "cd ~/orion-pile/vm && $VARIABLES timeout 900 docker stack deploy --detach=false --prune -c pile.yaml orion"

# Connecteur RECON, pile à part, au mieux : jamais d'attente ni d'échec du déploiement d'ORION à cause de lui (design for failure).
# Sans RELAIS_URL, la pile est retirée. Jeton du relais : variable RELAIS_TOKEN au premier déploiement, sinon aléatoire, à lire
# dans le conteneur et à reporter sur le relais (application/README.md).
recon() {
  if [ -z "${RELAIS_URL:-}" ]; then docker_vm stack rm orion-recon >/dev/null 2>&1 || true; return 0; fi
  local proxy jeton
  proxy=$(ssh_vm 1 "grep -iE '^https_proxy=' /etc/environment | head -n1 | cut -d= -f2- | tr -d '\"'" || true)
  jeton=${RELAIS_TOKEN:-$(openssl rand -hex 32)}
  docker_vm secret inspect RELAIS_TOKEN >/dev/null 2>&1 || printf '%s' "$jeton" | docker_vm secret create RELAIS_TOKEN - >/dev/null
  tr -d '\r' < pile-recon.yaml | ssh_vm 1 'mkdir -p ~/orion-pile/vm && cat > ~/orion-pile/vm/pile-recon.yaml'
  ssh_vm 1 "cd ~/orion-pile/vm && $VARIABLES ORION_PROXY=$(printf '%q' "$proxy") docker stack deploy --detach=true -c pile-recon.yaml orion-recon" >/dev/null
}
recon || echo "Connecteur RECON non déployé : ORION n'est pas concerné ; voir docker service ps orion-recon_connecteur" >&2

# Vérification, depuis orion-1 : la version servie par l'entrée est celle déployée
for _ in $(seq 60); do
  if ssh_vm 1 "curl -sf --noproxy '*' --cacert /etc/docker/orion-ca.pem https://$ENTREE/api/infos" | grep -q "$ORION_TAG"; then
    echo "ORION $ORION_TAG déployé : https://$ENTREE"; exit 0
  fi
  sleep 5
done
echo "La version $ORION_TAG ne répond pas sur https://$ENTREE" >&2
docker_vm service ls >&2
exit 1
