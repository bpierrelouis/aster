#!/usr/bin/env bash
# Installation des VM orion-1 à orion-10, depuis le poste de l'opérateur (Git Bash, Linux ou macOS).
# Prérequis : clé SSH de l'opérateur autorisée pour le compte VM_USER sur chaque VM (voir application/README.md) ;
# deux disques vierges ajoutés à orion-10 pour le stockage.
# Le mot de passe sudo est demandé une fois et n'est enregistré nulle part.
# DISQUE_DONNEES et DISQUE_LOGS : disques de données et de logs d'orion-10, formatés en ext4 s'ils sont vierges (/dev/sdb et /dev/sdc par défaut).
# Idempotent : relancer le script ne recrée ni le cluster, ni les secrets, ni les certificats existants ; il amène un cluster
# existant à la répartition prévue (managers, workers, étiquettes), fait quitter le cluster à orion-10 et à toute VM
# membre d'un autre cluster, et retire toute autre pile que « orion ».
set -euo pipefail
cd "$(dirname "$0")"
. ./vm.sh

PKI="${ORION_PKI:-$HOME/.orion-pki}"
# Git Bash : chemin Windows pour openssl, dont les sujets /O=… ne doivent pas être convertis (MSYS_NO_PATHCONV)
if command -v cygpath >/dev/null; then PKI=$(cygpath -m "$PKI"); fi

if [ -z "${SUDO_PASSWORD:-}" ]; then read -rsp "Mot de passe sudo des VM : " SUDO_PASSWORD; echo; fi

# 1. Certificats, conservés hors du dépôt : autorité locale, entrée (HAProxy) et collecteur de logs (Logstash),
#    tous deux joints par orion.internal, c'est-à-dire par orion-1 ou orion-2
mkdir -p "$PKI" && chmod 700 "$PKI"
certificat() { # nom noms_alternatifs
  [ -f "$PKI/$1.crt" ] && return
  MSYS_NO_PATHCONV=1 openssl req -new -newkey rsa:3072 -nodes -keyout "$PKI/$1.key" -out "$PKI/$1.csr" -subj "/O=ORION/CN=$DOMAINE"
  printf 'subjectAltName=%s\nextendedKeyUsage=serverAuth\n' "$2" > "$PKI/$1.ext"
  openssl x509 -req -in "$PKI/$1.csr" -CA "$PKI/ca.crt" -CAkey "$PKI/ca.key" -CAcreateserial -days 825 -sha256 -extfile "$PKI/$1.ext" -out "$PKI/$1.crt"
  rm "$PKI/$1.csr" "$PKI/$1.ext"
}
[ -f "$PKI/ca.crt" ] || MSYS_NO_PATHCONV=1 openssl req -x509 -newkey rsa:3072 -nodes -days 3650 -sha256 \
  -keyout "$PKI/ca.key" -out "$PKI/ca.crt" -subj "/O=ORION/CN=Autorite ORION" \
  -addext basicConstraints=critical,CA:TRUE -addext keyUsage=critical,keyCertSign,cRLSign
NOMS_ENTREE="DNS:$DOMAINE,IP:${VM[1]},IP:${VM[2]}"
certificat orion-entree "$NOMS_ENTREE"
certificat orion-collecteur "$NOMS_ENTREE"

# 2. Préparation de chaque VM : nom d'hôte orion-N (Docker relancé tant qu'il ne porte pas ce nom, avant le cluster),
#    résolution des noms par les deux DNS (orion-1, orion-2) puis celui du réseau, horloge, autorité pour le pilote syslog,
#    client NFS des VM qui montent le stockage (orion-1 et orion-2 pour BIND, PostgreSQL, identité, Logstash, secours)
for n in 1 2 3 4 5 6 7 8 9 10; do
  echo "== orion-$n (${VM[$n]})"
  { printf '%s\n' "$SUDO_PASSWORD"; cat "$PKI/ca.crt"; } | ssh_vm "$n" "sudo -S -p '' bash -c '
    set -e
    install -D -m 644 /dev/stdin /etc/docker/orion-ca.pem
    if [ \"\$(hostname)\" != orion-$n ]; then echo orion-$n > /etc/hostname; hostname orion-$n; fi
    grep -q \"^127.0.1.1 orion-$n\$\" /etc/hosts || { sed -i \"/^127.0.1.1 /d\" /etc/hosts; echo \"127.0.1.1 orion-$n\" >> /etc/hosts; }
    printf \"search $DOMAINE formation\nnameserver ${VM[1]}\nnameserver ${VM[2]}\nnameserver $DNS_FORMATION\noptions timeout:1 attempts:1\n\" > /etc/resolv.conf
    if [ \"\$(docker info --format {{.Name}})\" != orion-$n ]; then systemctl restart docker; fi
    if [ $n = 1 ]; then
      command -v chronyd >/dev/null || DEBIAN_FRONTEND=noninteractive apt-get install -y -q chrony >/dev/null
      sed -i \"s/^pool /#pool /\" /etc/chrony/chrony.conf
      printf \"allow $RESEAU\nlocal stratum 10\n\" > /etc/chrony/conf.d/orion.conf
      systemctl restart chrony
    else
      mkdir -p /etc/systemd/timesyncd.conf.d
      printf \"[Time]\nNTP=${VM[1]}\nFallbackNTP=\n\" > /etc/systemd/timesyncd.conf.d/orion.conf
      systemctl restart systemd-timesyncd
    fi
    case $n in 1|2|6|7|8|9)
      command -v mount.nfs >/dev/null || DEBIAN_FRONTEND=noninteractive apt-get install -y -q nfs-common >/dev/null ;;
    esac
  '"
done

# 3. Stockage (orion-10, hors Swarm) : un disque ext4 pour les données (/srv/orion/donnees) et un pour les logs
#    (/srv/orion/logs), exportés en NFSv4 vers les VM qui les montent.
#    Un disque qui porte déjà une table de partitions ou un autre système de fichiers n'est jamais formaté.
DISQUE_DONNEES="${DISQUE_DONNEES:-/dev/sdb}" DISQUE_LOGS="${DISQUE_LOGS:-/dev/sdc}"
echo "== orion-10 (${VM[10]}) : données sur $DISQUE_DONNEES, logs sur $DISQUE_LOGS"
{ printf '%s\n' "$SUDO_PASSWORD"; cat <<'FIN'; } | ssh_vm 10 "sudo -S -p '' env DISQUE_DONNEES=$DISQUE_DONNEES DISQUE_LOGS=$DISQUE_LOGS CLIENTS='${VM[1]} ${VM[2]} ${VM[6]} ${VM[7]} ${VM[8]} ${VM[9]}' bash -s"
set -e
monter() { # disque point_de_montage étiquette
  mountpoint -q "$2" && return
  [ -b "$1" ] || { echo "Disque $1 introuvable : ajouter le disque ou préciser DISQUE_DONNEES et DISQUE_LOGS" >&2; exit 1; }
  type=$(blkid -p -o value -s TYPE "$1" || true)
  if [ -z "$type" ]; then
    if blkid -p "$1" >/dev/null 2>&1; then echo "$1 porte des partitions : préciser DISQUE_DONNEES ou DISQUE_LOGS" >&2; exit 1; fi
    mkfs.ext4 -q -L "$3" "$1"
  elif [ "$type" != ext4 ]; then
    echo "$1 contient un système de fichiers $type" >&2; exit 1
  fi
  grep -q " $2 " /etc/fstab || echo "UUID=$(blkid -o value -s UUID "$1") $2 ext4 defaults,nofail 0 2" >> /etc/fstab
  mkdir -p "$2" && mount "$2"
}
monter "$DISQUE_DONNEES" /srv/orion/donnees orion-donnees
monter "$DISQUE_LOGS" /srv/orion/logs orion-logs
install -d /srv/orion/donnees/postgres /srv/orion/donnees/ldap-data /srv/orion/donnees/ldap-config
for n in 1 2; do   # compte de BIND, un jeu de dossiers par serveur DNS
  install -d -o 53 -g 53 /srv/orion/donnees/bind/$n/cache /srv/orion/donnees/bind/$n/lib /srv/orion/logs/bind/$n
done
install -d -o 1000 -g 1000 /srv/orion/logs/conteneurs                                                    # compte de Logstash
command -v exportfs >/dev/null || DEBIAN_FRONTEND=noninteractive apt-get install -y -q nfs-kernel-server >/dev/null
mkdir -p /etc/nfs.conf.d /etc/exports.d
printf '[nfsd]\nvers3=n\n' > /etc/nfs.conf.d/orion.conf
for partage in /srv/orion/donnees /srv/orion/logs; do
  for ip in $CLIENTS; do printf '%s %s(rw,sync,no_subtree_check,no_root_squash)\n' "$partage" "$ip"; done
done > /etc/exports.d/orion.exports
systemctl restart nfs-server
exportfs -ra
FIN

# 4. Cluster Swarm : managers orion-1 à orion-3 (HAProxy et DNS sur orion-1 et orion-2) ; workers orion-4 à orion-9 ; orion-10 hors Swarm.
#    Un cluster existant est repris : nouveaux managers promus avant la rétrogradation des anciens (quorum conservé).
etat() { ssh_vm "$1" "docker info --format '{{.Swarm.LocalNodeState}}'"; }
dirige() { [ "$(ssh_vm "$1" "docker info --format '{{.Swarm.ControlAvailable}}'")" = true ]; }
identifiant() { ssh_vm "$1" "docker info --format '{{.Swarm.NodeID}}'"; }
role() { docker_vm node inspect -f '{{.Spec.Role}}' "orion-$1"; }
MANAGER=""
for n in 1 2 3 4 5 7; do if dirige "$n"; then MANAGER=$n; break; fi; done
if [ -z "$MANAGER" ]; then ssh_vm 1 "docker swarm init --advertise-addr ${VM[1]}"; MANAGER=1; fi
NOEUDS=$(docker_vm node ls -q)
JETON_MANAGER=$(docker_vm swarm join-token -q manager)
JETON_WORKER=$(docker_vm swarm join-token -q worker)
for n in 1 2 3 4 5 6 7 8 9; do
  if [ "$(etat "$n")" = active ] && ! grep -qx "$(identifiant "$n")" <<<"$NOEUDS"; then
    echo "== orion-$n quitte un autre cluster Swarm"
    ssh_vm "$n" "docker swarm leave --force" >/dev/null
  fi
  case $n in 1|2|3) jeton=$JETON_MANAGER ;; *) jeton=$JETON_WORKER ;; esac
  [ "$(etat "$n")" = active ] || ssh_vm "$n" "docker swarm join --advertise-addr ${VM[$n]} --token $jeton ${VM[$MANAGER]}:2377"
done
for n in 1 2 3; do [ "$(role "$n")" = manager ] || docker_vm node promote "orion-$n" >/dev/null; done
MANAGER=1
for n in 4 5 6 7 8 9; do [ "$(role "$n")" = worker ] || docker_vm node demote "orion-$n" >/dev/null; done
for n in 1 2 3 4 5 6 7 8 9; do docker_vm node update --availability active "orion-$n" >/dev/null; done
if [ "$(etat 10)" = active ]; then
  id=$(identifiant 10)
  echo "== orion-10 quitte son cluster Swarm (stockage hors Swarm)"
  ssh_vm 10 "docker swarm leave --force" >/dev/null
  if grep -qx "$id" <<<"$NOEUDS"; then docker_vm node rm --force "$id" >/dev/null; fi
fi
# Étiquettes : groupe (entrée, application) et rôles isolés ; orion-9 porte les trois rôles isolés, pour les reprendre
for n in 1 2 3 4 5 6 7 8 9; do   # retrait de toutes les étiquettes existantes, puis pose des étiquettes prévues
  for etiquette in $(docker_vm node inspect -f '{{range $k, $v := .Spec.Labels}}{{$k}} {{end}}' "orion-$n"); do
    docker_vm node update --label-rm "$etiquette" "orion-$n" >/dev/null
  done
done
for n in 1 2; do docker_vm node update --label-add orion=entree "orion-$n" >/dev/null; done
for n in 4 5; do docker_vm node update --label-add orion=application "orion-$n" >/dev/null; done
docker_vm node update --label-add pg=true orion-6 >/dev/null
docker_vm node update --label-add identite=true orion-7 >/dev/null
docker_vm node update --label-add logs=true orion-8 >/dev/null
docker_vm node update --label-add pg=true --label-add identite=true --label-add logs=true "orion-$SECOURS" >/dev/null
for pile in $(docker_vm stack ls --format '{{.Name}}'); do
  [ "$pile" = orion ] && continue
  echo "== retrait de la pile « $pile », remplacée par « orion »"
  docker_vm stack rm "$pile" >/dev/null
done

# 5. Secrets Swarm, créés une fois avec des valeurs aléatoires (aucune copie sur le poste, sauf les certificats)
aleatoire() { openssl rand -hex 32; }
secret() { # nom valeur
  docker_vm secret inspect "$1" >/dev/null 2>&1 || printf '%s' "$2" | docker_vm secret create "$1" - >/dev/null
}
# Base orion : mot de passe et adresse de connexion créés ensemble (noms propres à la base orion)
if ! docker_vm secret inspect orion_postgres_password >/dev/null 2>&1; then
  pg=$(aleatoire)
  secret orion_postgres_password "$pg"
  secret orion_database_url "postgres://orion:$pg@postgres:5432/orion"
fi
secret OIDC_CLIENT_SECRET "$(aleatoire)"
secret SESSION_SECRET "$(aleatoire)"
secret AGENT_TOKEN "$(aleatoire)"
secret keycloak_admin "$(aleatoire)"
secret ldap_admin "$(aleatoire)"
secret ca "$(cat "$PKI/ca.crt")"
secret orion_tls_entree "$(cat "$PKI/orion-entree.crt" "$PKI/ca.crt" "$PKI/orion-entree.key")"
secret orion_tls_collecteur_cert "$(cat "$PKI/orion-collecteur.crt" "$PKI/ca.crt")"
secret orion_tls_collecteur_cle "$(cat "$PKI/orion-collecteur.key")"

docker_vm node ls
echo "Installation terminée. Autorité à faire reconnaître par les navigateurs : $PKI/ca.crt"
echo "Postes des utilisateurs : serveurs DNS ${VM[1]} et ${VM[2]}, puis https://$DOMAINE"
