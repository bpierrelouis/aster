# Adresses des VM du démonstrateur (dossier d'architecture, § 4.5) et accès SSH, communs aux scripts.
VM=(- 172.16.131.188 172.16.131.133 172.16.131.193 172.16.131.208 172.16.131.142 172.16.131.131 172.16.131.137)
RESEAU=172.16.128.0/20
VM_USER="${VM_USER:-user}"
CLE_SSH="${ASTER_SSH_KEY:-$HOME/.ssh/aster_deploy}"

# ssh_vm N commande… : exécute une commande sur la VM N
ssh_vm() { local n=$1; shift; ssh -i "$CLE_SSH" -o BatchMode=yes -o StrictHostKeyChecking=accept-new "$VM_USER@${VM[$n]}" "$@"; }
# docker_vm arguments… : client Docker du manager de la VM 01
docker_vm() { ssh_vm 1 docker "$(printf '%q ' "$@")"; }
