#!/usr/bin/env sh
# Régénère la version Word (.docx) des quatre fiches descriptives, à côté de leur source Markdown.
# Usage, depuis n'importe quel dossier : sh .agents/skills/orion-documentation/scripts/fiches-word.sh
# Prérequis : pandoc. L'en-tête de version généré est retiré ; les captures sont incluses.
set -eu

racine=$(cd "$(dirname "$0")/../../../.." && pwd)
dossier="$racine/docs/02-ANALYSE/02-CAPTURE-DES-BESOINS"

for source in "$dossier"/1[3-6]-FICHE-DESCRIPTIVE-*.md; do
  sed '/<!-- version:debut/,/<!-- version:fin -->/d' "$source" |
    pandoc --from=gfm --resource-path="$dossier" -o "${source%.md}.docx"
  echo "${source%.md}.docx"
done
