#!/usr/bin/env bash
# Déploiement de la pile « orion », exécuté sur le manager orion-1 : installé par installer.sh (/usr/local/bin/orion-deploiement,
# adresses dans /usr/local/lib/orion/vm.sh), appelé par deployer.sh depuis le poste de l'opérateur ou le runner. Seule commande
# permise à la clé SSH du runner (authorized_keys : restrict,command=), qui transmet ses arguments dans SSH_ORIGINAL_COMMAND.
# Arguments : <compte Docker Hub> <étiquette des images> <adresse HTTPS du relais RIGEL, ou - s'il n'est pas publié>
# Entrée standard : jeton du relais sur la première ligne (vide : aléatoire au premier déploiement), puis archive tar des fichiers
# de la pile (deployer.sh).
set -euo pipefail -o noglob
. /usr/local/lib/orion/vm.sh

if [ $# -eq 0 ] && [ -n "${SSH_ORIGINAL_COMMAND:-}" ]; then
  read -ra demande <<<"$SSH_ORIGINAL_COMMAND"
  [ "${demande[0]##*/}" = orion-deploiement ] || { echo "Commande refusée" >&2; exit 2; }
  set -- "${demande[@]:1}"
fi
[ $# -eq 3 ] || { echo "Usage : orion-deploiement <compte Docker Hub> <étiquette> <relais|->" >&2; exit 2; }
ORION_IMAGES=$1 ORION_TAG=$2 RELAIS_URL=${3#-}
[[ $ORION_IMAGES =~ ^[A-Za-z0-9._/-]+$ ]] || { echo "Compte Docker Hub invalide : $ORION_IMAGES" >&2; exit 2; }
[[ $ORION_TAG =~ ^[0-9a-fA-F]{7,64}$ ]] || { echo "Étiquette attendue : SHA Git de 7 à 64 caractères hexadécimaux" >&2; exit 2; }
# RIGEL est facultatif : une adresse ou un jeton du relais invalide le désactive, sans bloquer le déploiement d'ORION
if [[ -n $RELAIS_URL && ! $RELAIS_URL =~ ^https://[A-Za-z0-9.-]+(:[0-9]+)?(/[A-Za-z0-9._~/-]*)?$ ]]; then
  echo "Adresse du relais invalide : RIGEL désactivé, ORION déployé sans lui" >&2; RELAIS_URL=""
fi
IFS= read -r RELAIS_TOKEN || true
[[ $RELAIS_TOKEN =~ ^[A-Za-z0-9._~+/=-]*$ ]] || { echo "Jeton du relais invalide : ignoré" >&2; RELAIS_TOKEN=""; }

# Fichiers de la pile, et eux seuls
PILE=~/orion-pile
rm -rf "$PILE" && mkdir "$PILE"
tar -xf - -C "$PILE" vm/pile.yaml vm/pile-rigel.yaml vm/haproxy.cfg vm/logstash.conf vm/postgres-roles.sh ldap/orion-utilisateurs.ldif
find "$PILE" -type f -exec sed -i 's/\r$//' {} +
cd "$PILE/vm"

aleatoire() { od -An -tx1 -N32 /dev/urandom | tr -d ' \n'; }
secret() { docker secret inspect "$1" >/dev/null 2>&1 || printf '%s' "$2" | docker secret create "$1" - >/dev/null; }
# Secrets créés au premier déploiement, jamais versionnés : campagnes RIGEL (API et connecteur), mots de passe des comptes du
# démonstrateur (dérivés par l'API, application/README.md), rôle applicatif de PostgreSQL et son adresse de connexion
secret RIGEL_SECRET "$(aleatoire)"
secret PROVISIONING_PASSWORD_SECRET "$(aleatoire)"
# Les deux secrets vont ensemble : si l'un manque (création interrompue), l'autre, encore inutilisé, est recréé avec lui
if ! docker secret inspect orion_app_password >/dev/null 2>&1 || ! docker secret inspect orion_app_database_url >/dev/null 2>&1; then
  docker secret rm orion_app_password orion_app_database_url >/dev/null 2>&1 || true
  if docker secret inspect orion_app_password >/dev/null 2>&1 || docker secret inspect orion_app_database_url >/dev/null 2>&1; then
    echo "Secrets orion_app_* dépareillés et encore utilisés : arrêter le service concerné, les supprimer, puis redéployer" >&2; exit 1
  fi
  mdp=$(aleatoire)
  secret orion_app_password "$mdp"
  secret orion_app_database_url "postgres://orion_app:$mdp@postgres:5432/orion"
fi

# La VM de secours est vidée pendant le déploiement, pour que PostgreSQL, l'identité et Logstash démarrent sur leur VM ;
# elle ne l'est que si ces VM sont prêtes, sinon le service repris par le secours y reste.
etat_noeud() { docker node inspect -f '{{.Status.State}}' "orion-$1"; }
VIDE=""
if [ "$(etat_noeud 6)$(etat_noeud 7)$(etat_noeud 8)" = readyreadyready ]; then
  docker node update --availability drain "orion-$SECOURS" >/dev/null && VIDE=1
fi
# Remise en service de la VM de secours, même si le déploiement échoue
trap 'if [ -n "$VIDE" ]; then docker node update --availability active "orion-$SECOURS" >/dev/null; fi' EXIT

# Base existante : rôle applicatif créé ou mis à jour avant que l'API ne l'utilise (une base neuve le crée à son initialisation)
if docker service inspect orion_postgres >/dev/null 2>&1; then
  # Base arrêtée par installer.sh avant un changement des exports NFS : relancée le temps de mettre à jour le rôle, sous le
  # compte postgres (70) et sans copie dans le volume, seuls acceptés par le stockage (root_squash) ; la pile lui applique
  # ensuite sa définition
  if [ "$(docker service inspect -f '{{.Spec.Mode.Replicated.Replicas}}' orion_postgres)" = 0 ]; then
    # Pilote de logs syslog de PostgreSQL : Logstash, arrêté avec lui, doit tourner avant
    docker service scale --detach=false orion_logstash=1 >/dev/null
    timeout 300 docker service update --quiet --detach=false --user 70:70 --replicas 1 --mount-rm /var/lib/postgresql/data \
      --mount-add type=volume,source=orion_pg-nfs,target=/var/lib/postgresql/data,volume-nocopy=true orion_postgres >/dev/null
  fi
  image=$(docker service inspect -f '{{.Spec.TaskTemplate.ContainerSpec.Image}}' orion_postgres)
  docker service rm orion-roles >/dev/null 2>&1 || true
  timeout 300 docker service create --quiet --detach=false --name orion-roles --mode replicated-job --restart-condition none \
    --network orion_orion --env PGHOST=orion_postgres \
    --secret source=orion_postgres_password,target=postgres --secret orion_app_password \
    "$image" sh -c "$(cat postgres-roles.sh)" >/dev/null || true
  etat=$(docker service ps orion-roles --format '{{.CurrentState}}' 2>/dev/null | head -n1)
  if [[ $etat != Complete* ]]; then
    docker service logs orion-roles >&2 || true
    docker service rm orion-roles >/dev/null 2>&1 || true
    echo "Rôle applicatif de PostgreSQL non mis à jour : $etat" >&2; exit 1
  fi
  docker service rm orion-roles >/dev/null
fi

# Les configurations Swarm sont immuables : leur nom porte l'empreinte du contenu
empreinte() { sha256sum < "$1" | cut -c1-12; }
EMPREINTE_HAPROXY=$(empreinte haproxy.cfg) EMPREINTE_LOGSTASH=$(empreinte logstash.conf)
EMPREINTE_LDAP=$(empreinte ../ldap/orion-utilisateurs.ldif) EMPREINTE_ROLES=$(empreinte postgres-roles.sh)
export ORION_IMAGES ORION_TAG ORION_ENTREE=$ENTREE ORION_STOCKAGE=${VM[10]} ORION_RELAIS=$RELAIS_URL \
  EMPREINTE_HAPROXY EMPREINTE_LOGSTASH EMPREINTE_LDAP EMPREINTE_ROLES
# Un service mis à jour pendant le redémarrage de Logstash (changement de sa configuration) ne peut ouvrir son pilote de logs :
# sa mise à jour est suspendue ; un second passage la reprend, Logstash étant alors en service
timeout 900 docker stack deploy --detach=false --prune -c pile.yaml orion \
  || timeout 900 docker stack deploy --detach=false --prune -c pile.yaml orion

# Connecteur RIGEL, pile à part, au mieux : jamais d'attente ni d'échec du déploiement d'ORION à cause de lui (design for failure).
# Sans relais, la pile est retirée. Jeton du relais : celui transmis au premier déploiement, sinon aléatoire, à lire dans le
# conteneur et à reporter sur le relais (application/README.md).
rigel() {
  if [ -z "$RELAIS_URL" ]; then docker stack rm orion-rigel >/dev/null 2>&1 || true; return 0; fi
  secret RELAIS_TOKEN "${RELAIS_TOKEN:-$(aleatoire)}"
  ORION_PROXY=$(grep -siE '^https_proxy=' /etc/environment | head -n1 | cut -d= -f2- | tr -d '"' || true) \
    docker stack deploy --detach=true -c pile-rigel.yaml orion-rigel >/dev/null
}
rigel || echo "Connecteur RIGEL non déployé : ORION n'est pas concerné ; voir docker service ps orion-rigel_connecteur" >&2

# Vérification : la version servie par l'entrée est celle déployée
for _ in $(seq 60); do
  if curl -sf --noproxy '*' --cacert /etc/docker/orion-ca.pem "https://$ENTREE/api/infos" | grep -q "$ORION_TAG"; then
    echo "ORION $ORION_TAG déployé : https://$ENTREE"; exit 0
  fi
  sleep 5
done
echo "La version $ORION_TAG ne répond pas sur https://$ENTREE" >&2
docker service ls >&2
exit 1
