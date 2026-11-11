# Images ASTER, une cible par image : docker build --target web | api | postes .

FROM node:22.22.3-alpine3.24 AS node
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY shared ./shared
COPY backend ./backend
COPY --chmod=755 infra/images/secrets.sh /usr/local/bin/aster-secrets
USER node
ENTRYPOINT ["aster-secrets"]

# Express : API, connexion et API des postes
FROM node AS api
ENV HOST=0.0.0.0 PORT=3001
EXPOSE 3001
HEALTHCHECK --interval=10s --timeout=3s --start-period=20s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:3001/api/health').then(() => process.exit(0), () => process.exit(1))"]
CMD ["node", "backend/start-production.js"]

# Émulateur des postes Windows
FROM node AS postes
CMD ["node", "backend/demonstrateur/agents.js"]

# Build React
FROM node:22.22.3-alpine3.24 AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
# La configuration de Vite référence le serveur (mode interface seule) : backend est nécessaire à son chargement
COPY shared ./shared
COPY backend ./backend
COPY frontend ./frontend
RUN npm run build

# Apache : fichiers de l'interface
FROM httpd:2.4.69-alpine3.24 AS web
COPY infra/images/apache-aster.conf /usr/local/apache2/conf/aster.conf
RUN sed -i 's/^Listen 80$/Listen 8080/' /usr/local/apache2/conf/httpd.conf \
  && echo 'Include conf/aster.conf' >> /usr/local/apache2/conf/httpd.conf
COPY --from=build /app/frontend/dist /usr/local/apache2/htdocs/
EXPOSE 8080
HEALTHCHECK --interval=10s --timeout=3s --retries=3 CMD ["wget", "-q", "--spider", "http://127.0.0.1:8080/"]
