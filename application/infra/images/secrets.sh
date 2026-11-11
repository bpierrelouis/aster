#!/bin/sh
# Transmet chaque secret Docker Swarm (/run/secrets/NOM) au service, dans la variable d'environnement NOM.
for secret in /run/secrets/*; do
  if [ -f "$secret" ]; then
    export "$(basename "$secret")=$(cat "$secret")"
  fi
done
exec "$@"
