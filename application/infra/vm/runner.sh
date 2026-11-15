#!/usr/bin/env bash
# Runner GitHub Actions du déploiement continu, installé sur orion-3 (manager Swarm sans service), depuis le poste de l'opérateur.
# Usage : ./runner.sh <jeton d'enregistrement>
#   jeton : GitHub, Settings → Actions → Runners → New self-hosted runner (valable une heure).
# Le runner (compte VM_USER, service systemd, étiquette « orion ») exécute deployer.sh avec sa propre clé SSH, autorisée sur orion-1
# seulement, et pour la seule commande orion-deploiement (installer.sh) : ni shell, ni redirection de port.
# Le mot de passe sudo est lu dans SUDO_PASSWORD, sinon demandé ; il n'est enregistré nulle part. Idempotent.
set -euo pipefail
cd "$(dirname "$0")"
. ./vm.sh

[ $# -eq 1 ] || { echo "Usage : $0 <jeton d'enregistrement du runner>" >&2; exit 2; }
if [ -z "${SUDO_PASSWORD:-}" ]; then read -rsp "Mot de passe sudo des VM : " SUDO_PASSWORD; echo; fi
RUNNER=3 VERSION=2.338.2
# Empreinte de l'archive publiée avec cette version (notes de version GitHub) : à changer avec VERSION
SHA256=baebf204307bac6193480852732f0aba2ae97b6c5597c244f4d5558390147c40
DEPOT=$(git remote get-url origin) DEPOT=${DEPOT%.git}

# Clé SSH du runner, autorisée sur le manager orion-1 que joint deployer.sh, restreinte à la commande de déploiement ;
# une autorisation antérieure de la même clé est remplacée
ssh_vm "$RUNNER" "[ -f ~/.ssh/orion_deploy ] || ssh-keygen -q -t ed25519 -N '' -C runner@orion-$RUNNER -f ~/.ssh/orion_deploy"
CLE=$(ssh_vm "$RUNNER" cat .ssh/orion_deploy.pub)
CORPS=$(cut -d' ' -f2 <<<"$CLE")
[[ $CORPS =~ ^[A-Za-z0-9+/=]+$ ]] || { echo "Clé du runner illisible" >&2; exit 1; }
ssh_vm 1 "touch ~/.ssh/authorized_keys && grep -vF '$CORPS' ~/.ssh/authorized_keys > ~/.ssh/authorized_keys.orion || true
  echo 'restrict,command=\"/usr/local/bin/orion-deploiement\" $CLE' >> ~/.ssh/authorized_keys.orion
  chmod 600 ~/.ssh/authorized_keys.orion && mv ~/.ssh/authorized_keys.orion ~/.ssh/authorized_keys"

# Runner : mot de passe et jeton transmis par l'entrée standard, jamais sur la ligne de commande
echo "== runner sur orion-$RUNNER (${VM[$RUNNER]}) pour $DEPOT"
{ printf '%s\n%s\n' "$SUDO_PASSWORD" "$1"; cat <<'FIN'; } | ssh_vm "$RUNNER" "read -r MDP; read -r JETON; export MDP JETON DEPOT=$DEPOT VERSION=$VERSION SHA256=$SHA256 NOM=orion-$RUNNER; bash -s"
set -e
s() { printf '%s\n' "$MDP" | sudo -S -p '' "$@"; }
mkdir -p ~/actions-runner && cd ~/actions-runner
if [ ! -x config.sh ]; then
  curl -fsSL -o runner.tar.gz "https://github.com/actions/runner/releases/download/v$VERSION/actions-runner-linux-x64-$VERSION.tar.gz"
  echo "$SHA256  runner.tar.gz" | sha256sum -c --quiet
  tar -xzf runner.tar.gz && rm runner.tar.gz
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
