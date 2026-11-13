# Images ORION, une cible par image : docker build --target web | api | postes | keycloak | relais | connecteur .
# relais : application mobile RECON et relais chiffré, hébergés hors du réseau d'ORION (Hidora) ;
# connecteur : sur le réseau d'ORION, seul lien sortant entre ORION et le relais.

FROM node:22.22.3-alpine3.24 AS node
# Version publiée par /api/infos : commit de l'image
ARG ORION_VERSION
WORKDIR /app
ENV NODE_ENV=production ORION_VERSION=$ORION_VERSION
COPY package.json package-lock.json ./
# Sans scripts d'installation : aucune dépendance de production n'en a besoin (évite la télémétrie de @scarf/scarf)
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force
COPY shared ./shared
COPY backend ./backend
COPY --chmod=755 infra/images/secrets.sh /usr/local/bin/orion-secrets
USER node
ENTRYPOINT ["orion-secrets"]

# Express : API, connexion et API des postes
FROM node AS api
ENV HOST=0.0.0.0 PORT=3001
EXPOSE 3001
HEALTHCHECK --interval=10s --timeout=3s --start-period=20s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:3001/api/health').then(() => process.exit(0), () => process.exit(1))"]
CMD ["node", "backend/start-production.ts"]

# Simulateur des postes Windows et de leur agent d'administration
FROM node AS postes
CMD ["node", "backend/demonstrateur/agents.ts"]

# RECON : connecteur entre ORION et le relais, par requêtes sortantes (proxy : HTTPS_PROXY, NO_PROXY)
FROM node AS connecteur
ENV NODE_USE_ENV_PROXY=1
CMD ["node", "backend/recon/connecteur.ts"]

# Build React
FROM node:22.22.3-alpine3.24 AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
# La configuration de Vite référence le serveur (mode interface seule) : backend est nécessaire à son chargement
COPY shared ./shared
COPY backend ./backend
COPY frontend ./frontend
RUN npm run build && npm run build:recon

# Apache : fichiers de l'interface
FROM httpd:2.4.69-alpine3.24 AS web
COPY infra/images/apache-orion.conf /usr/local/apache2/conf/orion.conf
RUN sed -i 's/^Listen 80$/Listen 8080/' /usr/local/apache2/conf/httpd.conf \
  && echo 'Include conf/orion.conf' >> /usr/local/apache2/conf/httpd.conf
COPY --from=build /app/frontend/dist /usr/local/apache2/htdocs/
EXPOSE 8080
HEALTHCHECK --interval=10s --timeout=3s --retries=3 CMD ["wget", "-q", "--spider", "http://127.0.0.1:8080/"]

# RECON : relais et application mobile (Hidora), derrière le proxy TLS de l'hébergeur
FROM node AS relais
COPY --from=build /app/frontend/dist-recon ./frontend/dist-recon
ENV HOST=0.0.0.0 PORT=3000
EXPOSE 3000
HEALTHCHECK --interval=10s --timeout=3s --start-period=20s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:3000/api/health').then((r) => process.exit(r.ok ? 0 : 1), () => process.exit(1))"]
CMD ["node", "backend/recon/relais-start.ts"]

# Keycloak des VM : realm (réimporté à chaque création du conteneur) et thème de connexion
FROM quay.io/keycloak/keycloak:26.7.4 AS keycloak
COPY infra/keycloak/orion-realm.json /opt/keycloak/data/import/orion-realm.json
COPY infra/keycloak/themes/orion-mindef /opt/keycloak/themes/orion-mindef
COPY --chmod=755 infra/images/secrets.sh /usr/local/bin/orion-secrets
ENV KC_HEALTH_ENABLED=true KC_HTTP_ENABLED=true KC_PROXY_HEADERS=xforwarded
ENTRYPOINT ["orion-secrets", "/opt/keycloak/bin/kc.sh"]
CMD ["start", "--import-realm"]
HEALTHCHECK --interval=10s --timeout=5s --start-period=90s --retries=5 \
  CMD ["bash", "-ec", "exec 3<>/dev/tcp/localhost/9000; printf 'GET /health/ready HTTP/1.0\\r\\n\\r\\n' >&3; grep -q '200 OK' <&3"]
