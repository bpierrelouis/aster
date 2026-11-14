# Tests de l'interface sous Linux, avec les polices du runner GitHub ubuntu-24.04 (DejaVu Sans par défaut) :
# l'image Playwright seule retombe sur WenQuanYi et ne reproduit pas les largeurs de la CI.
# Version de l'image : celle de @playwright/test dans package.json.
FROM mcr.microsoft.com/playwright:v1.65.0-noble
RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends fonts-dejavu-core fonts-liberation \
  && rm -rf /var/lib/apt/lists/*
