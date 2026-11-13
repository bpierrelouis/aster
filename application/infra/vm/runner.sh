#!/usr/bin/env bash
# Runner GitHub Actions du déploiement continu, installé sur orion-3 (manager Swarm sans service), depuis le poste de l'opérateur.
# Usage : ./runner.sh <jeton d'enregistrement>
#   jeton : GitHub, Settings → Actions → Runners → New self-hosted runner (valable une heure).
# Le runner (compte VM_USER, service systemd, étiquette « orion ») exécute deployer.sh avec sa propre clé SSH, autorisée sur orion-1 seulement.
# Le mot de passe sudo est lu dans SUDO_PASSWORD, sinon demandé ; il n'est enregistré nulle part. Idempotent.
set -euo pipefail
cd "$(dirname "$0")"
. ./vm.sh

[ $# -eq 1 ] || { echo "Usage : $0 <jeton d'enregistrement du runner>" >&2; exit 2; }
if [ -z "${SUDO_PASSWORD:-}" ]; then read -rsp "Mot de passe sudo des VM : " SUDO_PASSWORD; echo; fi
RUNNER=3 VERSION=2.338.2
DEPOT=$(git remote get-url origin) DEPOT=${DEPOT%.git}

# Clé SSH du runner, autorisée sur le manager orion-1 que joint deployer.sh
ssh_vm "$RUNNER" "[ -f ~/.ssh/orion_deploy ] || ssh-keygen -q -t ed25519 -N '' -C runner@orion-$RUNNER -f ~/.ssh/orion_deploy"
CLE=$(ssh_vm "$RUNNER" cat .ssh/orion_deploy.pub)
ssh_vm 1 "grep -qxF '$CLE' ~/.ssh/authorized_keys || echo '$CLE' >> ~/.ssh/authorized_keys"

# Runner : mot de passe et jeton transmis par l'entrée standard, jamais sur la ligne de commande
echo "== runner sur orion-$RUNNER (${VM[$RUNNER]}) pour $DEPOT"
{ printf '%s\n%s\n' "$SUDO_PASSWORD" "$1"; cat <<'FIN'; } | ssh_vm "$RUNNER" "read -r MDP; read -r JETON; export MDP JETON DEPOT=$DEPOT VERSION=$VERSION NOM=orion-$RUNNER; bash -s"
set -e
s() { printf '%s\n' "$MDP" | sudo -S -p '' "$@"; }
mkdir -p ~/actions-runner && cd ~/actions-runner
if [ ! -x config.sh ]; then
  curl -fsSL "https://github.com/actions/runner/releases/download/v$VERSION/actions-runner-linux-x64-$VERSION.tar.gz" | tar -xz
  s ./bin/installdependencies.sh >/dev/null
fi
if [ ! -f .runner ]; then
  ./config.sh --unattended --url "$DEPOT" --token "$JETON" --name "$NOM" --labels orion --replace
  # Le service systemd ne lit pas /etc/environment : proxy du réseau de formation pour joindre GitHub
  grep -E '^(https?|no)_proxy=' /etc/environment | tr -d '"' >> .env
  s ./svc.sh install "$USER"
fi
s ./svc.sh start >/dev/null
s ./svc.sh status | grep -m1 'Active:'
FIN
