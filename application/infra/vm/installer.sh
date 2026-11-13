#!/usr/bin/env bash
# Installation des VM orion-1 à orion-10, depuis le poste de l'opérateur (Git Bash, Linux ou macOS).
# Prérequis : clé SSH de l'opérateur autorisée pour le compte VM_USER sur chaque VM (voir application/README.md) ;
# deux disques vierges ajoutés à orion-10 pour le stockage, à défaut deux fichiers image sur son disque système.
# Le mot de passe sudo est lu dans SUDO_PASSWORD, sinon demandé une fois ; il n'est enregistré nulle part.
# DISQUE_DONNEES et DISQUE_LOGS : disques de données et de logs d'orion-10, formatés en ext4 s'ils sont vierges (/dev/sdb et /dev/sdc par défaut) ;
# un disque absent est remplacé par un fichier image ext4 (6 Go pour les données, 4 Go pour les logs) dans /srv/orion/disques.
# Idempotent : relancer le script ne recrée ni le cluster, ni les secrets, ni les certificats existants ; il amène un cluster
# existant à la répartition prévue (managers, workers, étiquettes), et fait quitter le cluster à orion-10 et à toute VM
# membre d'un autre cluster. Les autres piles éventuellement présentes ne sont pas modifiées.
set -euo pipefail
cd "$(dirname "$0")"
. ./vm.sh

PKI="${ORION_PKI:-$HOME/.orion-pki}"
# Git Bash : chemin Windows pour openssl, dont les sujets /O=… ne doivent pas être convertis (MSYS_NO_PATHCONV)
if command -v cygpath >/dev/null; then PKI=$(cygpath -m "$PKI"); fi

if [ -z "${SUDO_PASSWORD:-}" ]; then read -rsp "Mot de passe sudo des VM : " SUDO_PASSWORD; echo; fi

# 1. Certificats, conservés hors du dépôt : autorité locale, entrée (HAProxy), jointe par l'adresse d'orion-1, et collecteur
#    de logs (Logstash), joint par chaque VM sur sa propre adresse locale (maillage de routage de Swarm)
mkdir -p "$PKI" && chmod 700 "$PKI"
certificat() { # nom adresse_ip
  [ -f "$PKI/$1.crt" ] && return
  MSYS_NO_PATHCONV=1 openssl req -new -newkey rsa:3072 -nodes -keyout "$PKI/$1.key" -out "$PKI/$1.csr" -subj "/O=ORION/CN=$2"
  printf 'subjectAltName=IP:%s\nextendedKeyUsage=serverAuth\n' "$2" > "$PKI/$1.ext"
  openssl x509 -req -in "$PKI/$1.csr" -CA "$PKI/ca.crt" -CAkey "$PKI/ca.key" -CAcreateserial -days 825 -sha256 -extfile "$PKI/$1.ext" -out "$PKI/$1.crt"
  rm "$PKI/$1.csr" "$PKI/$1.ext"
}
[ -f "$PKI/ca.crt" ] || MSYS_NO_PATHCONV=1 openssl req -x509 -newkey rsa:3072 -nodes -days 3650 -sha256 \
  -keyout "$PKI/ca.key" -out "$PKI/ca.crt" -subj "/O=ORION/CN=Autorite ORION" \
  -addext basicConstraints=critical,CA:TRUE -addext keyUsage=critical,keyCertSign,cRLSign
certificat orion-entree-ip "$ENTREE"
certificat orion-collecteur-ip 127.0.0.1

# 2. Préparation de chaque VM : nom d'hôte orion-N (Docker relancé tant qu'il ne porte pas ce nom, avant le cluster),
#    résolution des noms par le DNS du réseau, horloge, autorité pour le pilote syslog,
#    client NFS des VM qui montent le stockage (PostgreSQL, identité, Logstash, secours)
for n in 1 2 3 4 5 6 7 8 9 10; do
  echo "== orion-$n (${VM[$n]})"
  { printf '%s\n' "$SUDO_PASSWORD"; cat "$PKI/ca.crt"; } | ssh_vm "$n" "sudo -S -p '' bash -c '
    set -e
    install -D -m 644 /dev/stdin /etc/docker/orion-ca.pem
    if [ \"\$(hostname)\" != orion-$n ]; then echo orion-$n > /etc/hostname; hostname orion-$n; fi
    grep -q \"^127.0.1.1 orion-$n\$\" /etc/hosts || { sed -i \"/^127.0.1.1 /d\" /etc/hosts; echo \"127.0.1.1 orion-$n\" >> /etc/hosts; }
    # DNS du réseau seulement (retire les DNS d’ORION, que dhcpcd plaçait en tête par resolv.conf.head)
    if [ -f /etc/resolv.conf.head ]; then rm /etc/resolv.conf.head; printf \"domain formation\nnameserver $DNS_FORMATION\n\" > /etc/resolv.conf; fi
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
    case $n in 6|7|8|9)
      command -v mount.nfs >/dev/null || DEBIAN_FRONTEND=noninteractive apt-get install -y -q nfs-common >/dev/null ;;
    esac
  '"
done

# 3. Stockage (orion-10, hors Swarm) : un disque ext4 pour les données (/srv/orion/donnees) et un pour les logs
#    (/srv/orion/logs), exportés en NFSv4 vers les VM qui les montent.
#    Un disque qui porte déjà une table de partitions ou un autre système de fichiers n'est jamais formaté.
DISQUE_DONNEES="${DISQUE_DONNEES:-/dev/sdb}" DISQUE_LOGS="${DISQUE_LOGS:-/dev/sdc}"
echo "== orion-10 (${VM[10]}) : données sur $DISQUE_DONNEES, logs sur $DISQUE_LOGS"
{ printf '%s\n' "$SUDO_PASSWORD"; cat <<'FIN'; } | ssh_vm 10 "sudo -S -p '' env DISQUE_DONNEES=$DISQUE_DONNEES DISQUE_LOGS=$DISQUE_LOGS CLIENTS='${VM[6]} ${VM[7]} ${VM[8]} ${VM[9]}' bash -s"
set -e
monter() { # disque point_de_montage étiquette taille_sans_disque
  mountpoint -q "$2" && return
  if [ -b "$1" ]; then
    type=$(blkid -p -o value -s TYPE "$1" || true)
    if [ -z "$type" ]; then
      if blkid -p "$1" >/dev/null 2>&1; then echo "$1 porte des partitions : préciser DISQUE_DONNEES ou DISQUE_LOGS" >&2; exit 1; fi
      mkfs.ext4 -q -L "$3" "$1"
    elif [ "$type" != ext4 ]; then
      echo "$1 contient un système de fichiers $type" >&2; exit 1
    fi
    source="UUID=$(blkid -o value -s UUID "$1")" options=defaults,nofail
  else
    # Sans disque ajouté : fichier image ext4 de taille fixe sur le disque système, monté comme un disque
    source=/srv/orion/disques/$3.img options=loop,nofail
    echo "Disque $1 absent : $2 sur le fichier image $source ($4)"
    if [ ! -f "$source" ]; then install -d /srv/orion/disques; fallocate -l "$4" "$source"; mkfs.ext4 -q -F -L "$3" "$source"; fi
  fi
  grep -q " $2 " /etc/fstab || echo "$source $2 ext4 $options 0 2" >> /etc/fstab
  mkdir -p "$2" && mount "$2"
}
monter "$DISQUE_DONNEES" /srv/orion/donnees orion-donnees 6G
monter "$DISQUE_LOGS" /srv/orion/logs orion-logs 4G
install -d /srv/orion/donnees/postgres /srv/orion/donnees/ldap-data /srv/orion/donnees/ldap-config
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

# 4. Cluster Swarm : managers orion-1 à orion-3 (entrée sur orion-1, administration sur orion-3) ; workers orion-4 à orion-9 ; orion-10 hors Swarm.
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
# Étiquettes : entrée (orion-1), application et rôles isolés ; orion-9 porte les trois rôles isolés, pour les reprendre
# Seules les étiquettes en trop sont retirées et les manquantes ajoutées : une relance ne déplace aucun service
etiquettes() { case $1 in
  1) echo orion=entree ;; 4|5) echo orion=application ;; 6) echo pg=true ;; 7) echo identite=true ;; 8) echo logs=true ;;
  "$SECOURS") echo pg=true identite=true logs=true ;;
esac; }
for n in 1 2 3 4 5 6 7 8 9; do
  voulues=" $(etiquettes "$n") " actuelles=" $(docker_vm node inspect -f '{{range $k, $v := .Spec.Labels}}{{$k}}={{$v}} {{end}}' "orion-$n") "
  modifications=()
  for e in $actuelles; do [[ $voulues == *" ${e%%=*}="* ]] || modifications+=(--label-rm "${e%%=*}"); done
  for e in $voulues; do [[ $actuelles == *" $e "* ]] || modifications+=(--label-add "$e"); done
  [ ${#modifications[@]} -eq 0 ] || docker_vm node update "${modifications[@]}" "orion-$n" >/dev/null
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
secret PROVISIONING_CLIENT_SECRET "$(aleatoire)"
secret keycloak_admin "$(aleatoire)"
secret ldap_admin "$(aleatoire)"
secret ca "$(cat "$PKI/ca.crt")"
secret orion_tls_entree_ip "$(cat "$PKI/orion-entree-ip.crt" "$PKI/ca.crt" "$PKI/orion-entree-ip.key")"
secret orion_tls_collecteur_cert_ip "$(cat "$PKI/orion-collecteur-ip.crt" "$PKI/ca.crt")"
secret orion_tls_collecteur_cle_ip "$(cat "$PKI/orion-collecteur-ip.key")"

docker_vm node ls
echo "Installation terminée. Autorité à faire reconnaître par les navigateurs : $PKI/ca.crt"
echo "Adresse des utilisateurs : https://$ENTREE"
