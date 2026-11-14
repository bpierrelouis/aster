#!/usr/bin/env sh
# Régénère la version Word (.docx) des quatre fiches descriptives et du backlog, à côté de leur source Markdown.
# Usage, depuis n'importe quel dossier : sh .agents/skills/orion-documentation/scripts/fiches-word.sh
# Prérequis : pandoc. L'en-tête de version généré est retiré ; captures et graphiques sont inclus.
set -eu

racine=$(cd "$(dirname "$0")/../../../.." && pwd)

for source in "$racine"/docs/02-ANALYSE/02-CAPTURE-DES-BESOINS/1[3-6]-FICHE-DESCRIPTIVE-*.md \
              "$racine"/docs/04-ORGANISATION/20-BACKLOG-ET-SUIVI-PROJET.md; do
  sed '/<!-- version:debut/,/<!-- version:fin -->/d' "$source" |
    pandoc --from=gfm --resource-path="$(dirname "$source")" -o "${source%.md}.docx"
  echo "${source%.md}.docx"
done
