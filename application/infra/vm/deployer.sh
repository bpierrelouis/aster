#!/usr/bin/env bash
# Déploiement de la pile « orion » sur les VM, depuis le poste de l'opérateur ou le runner du déploiement continu.
# Usage : ./deployer.sh <compte Docker Hub> <étiquette des images>   (étiquette = SHA du commit publié par la CI)
# Prérequis : installer.sh exécuté (cluster, stockage, secrets, certificats, commande orion-deploiement d'orion-1).
# Envoie les fichiers de la pile à orion-1, où orion-deploiement (deploiement.sh) les déploie et contrôle la version servie.
# Recensement mobile (fonctionnalité complémentaire) : RELAIS_URL, adresse HTTPS du relais (vide : connecteur non déployé) ;
# RELAIS_TOKEN, jeton du relais, lu au premier déploiement seulement.
set -euo pipefail
cd "$(dirname "$0")"
. ./vm.sh

[ $# -eq 2 ] || { echo "Usage : $0 <compte Docker Hub> <étiquette>" >&2; exit 2; }
# Adresse du relais : https:// ajouté à un simple nom de domaine, sans / final
RELAIS_URL=${RELAIS_URL:-}
if [ -n "$RELAIS_URL" ] && [[ $RELAIS_URL != *://* ]]; then RELAIS_URL="https://$RELAIS_URL"; fi
RELAIS_URL=${RELAIS_URL%/}
# Jeton du relais : une seule ligne, sinon il corromprait l'archive qui le suit sur l'entrée standard ; RIGEL est facultatif
RELAIS_TOKEN=${RELAIS_TOKEN:-}
if [[ ! $RELAIS_TOKEN =~ ^[A-Za-z0-9._~+/=-]*$ ]]; then echo "Jeton du relais invalide : ignoré" >&2; RELAIS_TOKEN=""; fi

# Arguments contrôlés par orion-deploiement ; jeton du relais, puis fichiers de la pile, par l'entrée standard
{ printf '%s\n' "$RELAIS_TOKEN"; tar -C .. -cf - vm/pile.yaml vm/pile-rigel.yaml vm/haproxy.cfg vm/logstash.conf vm/postgres-roles.sh \
  ldap/orion-utilisateurs.ldif; } | ssh_vm 1 /usr/local/bin/orion-deploiement "$(printf '%q %q %q' "$1" "$2" "${RELAIS_URL:--}")"
