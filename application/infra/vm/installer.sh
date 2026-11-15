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

# 1. Certificats, conservés hors du dépôt : autorité locale, entrée (HAProxy), jointe par l'adresse d'orion-1, collecteur
#    de logs (Logstash), joint par chaque VM sur sa propre adresse locale (maillage de routage de Swarm), et certificat client
#    de chaque VM, présenté à Logstash par son pilote syslog. Une autorité créée par ce script n'émet que pour les adresses du
#    réseau des VM et 127.0.0.1 (nameConstraints), et sa clé est chiffrée : phrase de passe lue dans ORION_PKI_PASSWORD, sinon
#    demandée, seulement pour émettre un certificat manquant. Une autorité existante est conservée telle quelle.
umask 077
mkdir -p "$PKI" && chmod 700 "$PKI"
phrase() {
  [ -n "${ORION_PKI_PASSWORD:-}" ] && return
  read -rsp "Phrase de passe de l'autorité ORION : " ORION_PKI_PASSWORD; echo
  export ORION_PKI_PASSWORD
}
masque() { # préfixe /N → masque décimal pointé
  local b=${1#*/} n m=()
  for _ in 1 2 3 4; do n=$(( b > 8 ? 8 : b )); m+=($(( 256 - (1 << (8 - n)) ))); b=$(( b - n )); done
  local IFS=.; echo "${m[*]}"
}
certificat() { # nom adresse_ip usage (serverAuth ou clientAuth)
  [ -f "$PKI/$1.crt" ] && return
  local cle=()
  if grep -q ENCRYPTED "$PKI/ca.key"; then phrase; cle=(-passin env:ORION_PKI_PASSWORD); fi
  # Nom commun sans point : jamais pris pour un nom DNS soumis aux contraintes de l'autorité
  MSYS_NO_PATHCONV=1 openssl req -new -newkey rsa:3072 -nodes -keyout "$PKI/$1.key" -out "$PKI/$1.csr" -subj "/O=ORION/CN=$1"
  printf 'subjectAltName=IP:%s\nextendedKeyUsage=%s\n' "$2" "$3" > "$PKI/$1.ext"
  openssl x509 -req -in "$PKI/$1.csr" -CA "$PKI/ca.crt" -CAkey "$PKI/ca.key" "${cle[@]}" -CAcreateserial -days 825 -sha256 \
    -extfile "$PKI/$1.ext" -out "$PKI/$1.crt"
  rm "$PKI/$1.csr" "$PKI/$1.ext"
}
if [ ! -f "$PKI/ca.crt" ]; then
  phrase
  MSYS_NO_PATHCONV=1 openssl req -x509 -newkey rsa:3072 -passout env:ORION_PKI_PASSWORD -days 3650 -sha256 \
    -keyout "$PKI/ca.key" -out "$PKI/ca.crt" -subj "/O=ORION/CN=Autorite ORION" \
    -addext basicConstraints=critical,CA:TRUE -addext keyUsage=critical,keyCertSign,cRLSign \
    -addext "nameConstraints=critical,permitted;IP:${RESEAU%/*}/$(masque "$RESEAU"),permitted;IP:127.0.0.1/255.255.255.255,permitted;DNS:orion.invalid"
fi
certificat orion-entree-ip "$ENTREE" serverAuth
certificat orion-collecteur-ip 127.0.0.1 serverAuth
for n in 1 2 3 4 5 6 7 8 9; do certificat "orion-syslog-$n" "${VM[$n]}" clientAuth; done
chmod 600 "$PKI"/*.key

# 2. Préparation de chaque VM : nom d'hôte orion-N (Docker relancé tant qu'il ne porte pas ce nom, avant le cluster),
#    résolution des noms par le DNS du réseau, horloge, autorité et certificat client (orion-1 à orion-9) du pilote syslog,
#    client NFS des VM qui montent le stockage (PostgreSQL, identité, Logstash, secours)
for n in 1 2 3 4 5 6 7 8 9 10; do
  echo "== orion-$n (${VM[$n]})"
  fichiers=(ca.crt); [ "$n" = 10 ] || fichiers+=("orion-syslog-$n.crt" "orion-syslog-$n.key")
  { printf '%s\n' "$SUDO_PASSWORD"; tar -C "$PKI" -cf - "${fichiers[@]}"; } | ssh_vm "$n" "sudo -S -p '' bash -c '
    set -e
    pki=\$(mktemp -d); tar -xf - -C \$pki
    install -D -m 644 \$pki/ca.crt /etc/docker/orion-ca.pem
    if [ -f \$pki/orion-syslog-$n.crt ]; then
      install -m 644 \$pki/orion-syslog-$n.crt /etc/docker/orion-syslog.crt
      install -m 600 \$pki/orion-syslog-$n.key /etc/docker/orion-syslog.key
    fi
    rm -rf \$pki
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

# Commande de déploiement d'orion-1 (deploiement.sh), appelée par deployer.sh ; propriété de root, hors de portée des clés SSH
echo "== commande orion-deploiement sur orion-1"
{ printf '%s\n' "$SUDO_PASSWORD"; tar -cf - deploiement.sh vm.sh; } | ssh_vm 1 "sudo -S -p '' bash -c '
  set -e
  d=\$(mktemp -d); tar -xf - -C \$d; sed -i \"s/\\r\$//\" \$d/*
  install -m 755 \$d/deploiement.sh /usr/local/bin/orion-deploiement
  install -D -m 644 \$d/vm.sh /usr/local/lib/orion/vm.sh
  rm -rf \$d
'"

# 3. Stockage (orion-10, hors Swarm) : un disque ext4 pour les données (/srv/orion/donnees) et un pour les logs
#    (/srv/orion/logs). Un export NFSv4 par dossier de service, vers la VM du service et la VM de secours seulement ;
#    root_squash, sauf pour l'annuaire (osixia/openldap démarre en root et attribue ses fichiers à chaque démarrage).
#    Un disque qui porte déjà une table de partitions ou un autre système de fichiers n'est jamais formaté.
#    Stockage en service dont les exports changent : PostgreSQL, l'annuaire et Logstash sont arrêtés proprement avant, puis la
#    pile est redéployée à la fin du script avec les images de ce commit si la CI les a publiées, sinon par la CI à sa fusion.
DISQUE_DONNEES="${DISQUE_DONNEES:-/dev/sdb}" DISQUE_LOGS="${DISQUE_LOGS:-/dev/sdc}"
exporter() { # dossier option_root clients…
  local dossier=$1 root=$2 ip; shift 2
  for ip in "$@"; do printf '%s %s(rw,sync,no_subtree_check,%s)\n' "$dossier" "$ip" "$root"; done
}
EXPORTS=$(
  exporter /srv/orion/donnees/postgres root_squash "${VM[6]}" "${VM[$SECOURS]}"
  exporter /srv/orion/donnees/ldap-data no_root_squash "${VM[7]}" "${VM[$SECOURS]}"
  exporter /srv/orion/donnees/ldap-config no_root_squash "${VM[7]}" "${VM[$SECOURS]}"
  exporter /srv/orion/logs/conteneurs root_squash "${VM[8]}" "${VM[$SECOURS]}"
)
REDEPLOYER=""
if [ "$(ssh_vm 10 cat /etc/exports.d/orion.exports 2>/dev/null || true)" != "$EXPORTS" ] && docker_vm service inspect orion_api >/dev/null 2>&1; then
  echo "== arrêt de PostgreSQL, de l'annuaire et de Logstash avant le changement des exports NFS"
  docker_vm service scale --detach=false orion_postgres=0 orion_ldap=0 orion_logstash=0 >/dev/null
  # Redéploiement à la fin avec les images de ce commit si la CI les a publiées ; sinon par la CI, à la fusion de ce commit
  image=$(docker_vm service inspect -f '{{.Spec.TaskTemplate.ContainerSpec.Image}}' orion_api)
  ORION_IMAGES=${image%%/orion-api:*} ORION_TAG=$(git rev-parse HEAD) REDEPLOYER=1
  for depot in orion-web orion-api orion-postes orion-keycloak; do
    curl -sf "https://hub.docker.com/v2/repositories/$ORION_IMAGES/$depot/tags/$ORION_TAG" >/dev/null || REDEPLOYER=""
  done
  # Adresse du relais RIGEL en service, reprise au redéploiement
  RELAIS_EN_SERVICE=$(docker_vm service inspect -f '{{range .Spec.TaskTemplate.ContainerSpec.Env}}{{println .}}{{end}}' orion_api | sed -n 's/^RIGEL_URL=//p')
  [ -n "$REDEPLOYER" ] || echo "Images $ORION_IMAGES:$ORION_TAG pas encore publiées : PostgreSQL, l'annuaire et Logstash restent arrêtés jusqu'au déploiement de ce commit par la CI (fusion sur main)" >&2
fi
echo "== orion-10 (${VM[10]}) : données sur $DISQUE_DONNEES, logs sur $DISQUE_LOGS"
{ printf '%s\n' "$SUDO_PASSWORD"; cat <<'FIN'; } | ssh_vm 10 "sudo -S -p '' env DISQUE_DONNEES=$DISQUE_DONNEES DISQUE_LOGS=$DISQUE_LOGS EXPORTS='$(printf '%s\n' "$EXPORTS" | base64 | tr -d '\n')' bash -s"
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
# Propriétaires attendus par les conteneurs, qui n'écrivent pas en root : postgres (70, image alpine) et Logstash (1000)
install -d -o 70 -g 70 -m 700 /srv/orion/donnees/postgres && chown -R 70:70 /srv/orion/donnees/postgres
install -d /srv/orion/donnees/ldap-data /srv/orion/donnees/ldap-config
install -d -o 1000 -g 1000 /srv/orion/logs/conteneurs
command -v exportfs >/dev/null || DEBIAN_FRONTEND=noninteractive apt-get install -y -q nfs-kernel-server >/dev/null
mkdir -p /etc/nfs.conf.d /etc/exports.d
printf '[nfsd]\nvers3=n\n' > /etc/nfs.conf.d/orion.conf
# Serveur NFS relancé seulement si ses exports changent : les services montés ne sont pas interrompus
if ! printf '%s' "$EXPORTS" | base64 -d | cmp -s - /etc/exports.d/orion.exports; then
  printf '%s' "$EXPORTS" | base64 -d > /etc/exports.d/orion.exports
  systemctl restart nfs-server
  exportfs -ra
fi
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
# Base orion : mot de passe du superutilisateur orion, réservé à l'administration ; le rôle applicatif de l'API et son adresse
# de connexion sont créés par deploiement.sh
secret orion_postgres_password "$(aleatoire)"
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
if [ -n "$REDEPLOYER" ]; then
  echo "== redéploiement de la pile ($ORION_TAG) sur le stockage modifié"
  RELAIS_URL=$RELAIS_EN_SERVICE ./deployer.sh "$ORION_IMAGES" "$ORION_TAG"
fi
echo "Installation terminée. Autorité à faire reconnaître par les navigateurs : $PKI/ca.crt"
echo "Adresse des utilisateurs : https://$ENTREE"
