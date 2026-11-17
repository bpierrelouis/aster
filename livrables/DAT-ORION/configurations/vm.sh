# Adresses des VM du démonstrateur orion-1 à orion-10 (dossier d'architecture, § 4.5) et accès SSH, communs aux scripts.
# VM[N] = orion-N. Managers Swarm : orion-1 à orion-3, dont orion-1 porte l'entrée (HAProxy) et orion-3 l'administration (runner) ;
# application : orion-4, orion-5 ; PostgreSQL : orion-6 ; identité (Keycloak, OpenLDAP) : orion-7 ; Logstash : orion-8 ;
# secours de ces trois rôles : orion-9 ; stockage NFS, hors Swarm : orion-10.
VM=(- 172.16.131.188 172.16.131.133 172.16.131.193 172.16.131.208 172.16.131.142 172.16.131.131 172.16.131.137 172.16.131.146 172.16.131.190 172.16.131.197)
RESEAU=172.16.128.0/20
ENTREE=${VM[1]}                # seule adresse des utilisateurs : https://172.16.131.188
DNS_FORMATION=172.16.143.251   # DNS du réseau de formation, seul DNS des VM
SECOURS=9                      # VM de secours de PostgreSQL, de l'identité et de Logstash
VM_USER="${VM_USER:-user}"
CLE_SSH="${ORION_SSH_KEY:-$HOME/.ssh/orion_deploy}"

# ssh_vm N commande… : exécute une commande sur la VM N
ssh_vm() { local n=$1; shift; ssh -i "$CLE_SSH" -o BatchMode=yes -o StrictHostKeyChecking=accept-new "$VM_USER@${VM[$n]}" "$@"; }
# docker_vm arguments… : client Docker d'un manager (orion-1 par défaut, MANAGER pour en changer)
docker_vm() { ssh_vm "${MANAGER:-1}" docker "$(printf '%q ' "$@")"; }
