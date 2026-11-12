#!/usr/bin/env bash
# Installation initiale des sept VM, une seule fois, depuis le poste de l'opérateur (Git Bash, Linux ou macOS).
# Prérequis : clé SSH de l'opérateur autorisée pour le compte VM_USER sur chaque VM (voir application/README.md).
# Le mot de passe sudo est demandé une fois et n'est enregistré nulle part.
# Idempotent : relancer le script ne recrée ni le cluster, ni les secrets, ni les certificats existants.
set -euo pipefail
cd "$(dirname "$0")"
. ./vm.sh

PKI="${ASTER_PKI:-$HOME/.aster-pki}"
# Git Bash : chemin Windows pour openssl, dont les sujets /O=… ne doivent pas être convertis (MSYS_NO_PATHCONV)
if command -v cygpath >/dev/null; then PKI=$(cygpath -m "$PKI"); fi

if [ -z "${SUDO_PASSWORD:-}" ]; then read -rsp "Mot de passe sudo des VM : " SUDO_PASSWORD; echo; fi

# 1. Certificats : autorité locale, entrée (VM 01) et collecteur de journaux (VM 07), conservés hors du dépôt
mkdir -p "$PKI" && chmod 700 "$PKI"
certificat() { # nom IP
  [ -f "$PKI/$1.crt" ] && return
  MSYS_NO_PATHCONV=1 openssl req -new -newkey rsa:3072 -nodes -keyout "$PKI/$1.key" -out "$PKI/$1.csr" -subj "/O=ASTER/CN=$2"
  printf 'subjectAltName=IP:%s\nextendedKeyUsage=serverAuth\n' "$2" > "$PKI/$1.ext"
  openssl x509 -req -in "$PKI/$1.csr" -CA "$PKI/ca.crt" -CAkey "$PKI/ca.key" -CAcreateserial -days 825 -sha256 -extfile "$PKI/$1.ext" -out "$PKI/$1.crt"
  rm "$PKI/$1.csr" "$PKI/$1.ext"
}
[ -f "$PKI/ca.crt" ] || MSYS_NO_PATHCONV=1 openssl req -x509 -newkey rsa:3072 -nodes -days 3650 -sha256 \
  -keyout "$PKI/ca.key" -out "$PKI/ca.crt" -subj "/O=ASTER/CN=Autorite ASTER" \
  -addext basicConstraints=critical,CA:TRUE -addext keyUsage=critical,keyCertSign,cRLSign
certificat entree "${VM[1]}"
certificat journaux "${VM[7]}"

# 2. Préparation de chaque VM : nom d'hôte résolu, horloge, autorité pour le pilote syslog, dossier des journaux
for n in 1 2 3 4 5 6 7; do
  echo "== VM 0$n (${VM[$n]})"
  { printf '%s\n' "$SUDO_PASSWORD"; cat "$PKI/ca.crt"; } | ssh_vm "$n" "sudo -S -p '' bash -c '
    set -e
    install -D -m 644 /dev/stdin /etc/docker/aster-ca.pem
    grep -q \"\$(hostname)\" /etc/hosts || echo \"127.0.1.1 \$(hostname)\" >> /etc/hosts
    if [ $n = 1 ]; then
      command -v chronyd >/dev/null || DEBIAN_FRONTEND=noninteractive apt-get install -y -q chrony >/dev/null
      sed -i \"s/^pool /#pool /\" /etc/chrony/chrony.conf
      printf \"allow $RESEAU\nlocal stratum 10\n\" > /etc/chrony/conf.d/aster.conf
      systemctl restart chrony
    else
      mkdir -p /etc/systemd/timesyncd.conf.d
      printf \"[Time]\nNTP=${VM[1]}\nFallbackNTP=\n\" > /etc/systemd/timesyncd.conf.d/aster.conf
      systemctl restart systemd-timesyncd
    fi
    if [ $n = 7 ]; then install -d -o 1000 -g 1000 -m 755 /var/log/aster; fi
  '"
done

# 3. Cluster Swarm : managers 01, 04, 05 ; workers 02, 03, 06, 07 ; étiquette du groupe sans données
etat() { ssh_vm "$1" "docker info --format '{{.Swarm.LocalNodeState}}'"; }
[ "$(etat 1)" = active ] || ssh_vm 1 "docker swarm init --advertise-addr ${VM[1]}"
JETON_MANAGER=$(ssh_vm 1 "docker swarm join-token -q manager")
JETON_WORKER=$(ssh_vm 1 "docker swarm join-token -q worker")
for n in 2 3 4 5 6 7; do
  case $n in 4|5) jeton=$JETON_MANAGER ;; *) jeton=$JETON_WORKER ;; esac
  [ "$(etat $n)" = active ] || ssh_vm "$n" "docker swarm join --advertise-addr ${VM[$n]} --token $jeton ${VM[1]}:2377"
done
for n in 2 3 6; do docker_vm node update --label-add aster=sans-donnees "aster-$n" >/dev/null; done

# 4. Secrets Swarm, créés une fois avec des valeurs aléatoires (aucune copie sur le poste, sauf les certificats)
aleatoire() { openssl rand -hex 32; }
secret() { # nom valeur
  docker_vm secret inspect "$1" >/dev/null 2>&1 || printf '%s' "$2" | docker_vm secret create "$1" - >/dev/null
}
if ! docker_vm secret inspect postgres_password >/dev/null 2>&1; then
  pg=$(aleatoire)
  secret postgres_password "$pg"
  secret DATABASE_URL "postgres://aster:$pg@postgres:5432/aster"
fi
secret OIDC_CLIENT_SECRET "$(aleatoire)"
secret SESSION_SECRET "$(aleatoire)"
secret AGENT_TOKEN "$(aleatoire)"
secret keycloak_admin "$(aleatoire)"
secret ldap_admin "$(aleatoire)"
secret ca "$(cat "$PKI/ca.crt")"
secret tls_entree "$(cat "$PKI/entree.crt" "$PKI/ca.crt" "$PKI/entree.key")"
secret tls_journaux_cert "$(cat "$PKI/journaux.crt" "$PKI/ca.crt")"
secret tls_journaux_cle "$(cat "$PKI/journaux.key")"

docker_vm node ls
echo "Installation terminée. Autorité à faire reconnaître par les navigateurs : $PKI/ca.crt"
