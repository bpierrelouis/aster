import { randomBytes } from 'node:crypto';

export function readConfig(env = process.env) {
  const production = env.NODE_ENV === 'production';
  const required = ['APP_URL', 'DATABASE_URL', 'OIDC_ISSUER', 'OIDC_CLIENT_ID', 'OIDC_CLIENT_SECRET', 'SESSION_SECRET', 'AGENT_TOKEN'];
  if (production && required.some((name) => !env[name])) {
    throw new Error('En production, renseigner APP_URL, DATABASE_URL, OIDC_ISSUER, OIDC_CLIENT_ID, OIDC_CLIENT_SECRET, SESSION_SECRET et AGENT_TOKEN.');
  }
  const appUrl = new URL(env.APP_URL || 'http://localhost:5173');
  const issuer = new URL(env.OIDC_ISSUER || 'http://localhost:8081/realms/aster');
  if (production && (env.AGENT_TOKEN === 'aster-agent-local' || env.AGENT_TOKEN.length < 32)) throw new Error('La production exige un jeton dédié pour les postes (32 caractères minimum).');
  if (production && (appUrl.protocol !== 'https:' || issuer.protocol !== 'https:' || env.OIDC_CLIENT_SECRET === 'aster-client-local' || env.SESSION_SECRET.length < 32)) {
    throw new Error('La production exige HTTPS, un fournisseur hors démonstrateur et des secrets dédiés.');
  }
  // Démonstrateur : création des identités dans le Keycloak local, active hors production ou sur demande explicite
  const identityProvisioning = env.IDENTITY_PROVISIONING ? env.IDENTITY_PROVISIONING === 'true' : !production;
  if (production && identityProvisioning && (!env.KEYCLOAK_ADMIN_PASSWORD || env.KEYCLOAK_ADMIN_PASSWORD === 'keycloak-admin-local')) {
    throw new Error('La création des identités en production exige un mot de passe d’administration Keycloak dédié.');
  }
  return {
    production,
    port: Number(env.PORT || 3001),
    // Adresse d'écoute : boucle locale par défaut, toutes les interfaces dans un conteneur (HOST=0.0.0.0)
    host: env.HOST || '127.0.0.1',
    appUrl: appUrl.origin,
    issuer,
    clientId: env.OIDC_CLIENT_ID || 'aster-web',
    clientSecret: env.OIDC_CLIENT_SECRET || 'aster-client-local',
    databaseUrl: env.DATABASE_URL || 'postgres://aster:aster-local@localhost:5432/aster',
    sessionSecret: env.SESSION_SECRET || randomBytes(48).toString('base64url'),
    agentToken: env.AGENT_TOKEN || 'aster-agent-local',
    // Démonstrateur : compte d'administration du Keycloak local (création des identités)
    identityProvisioning,
    keycloakAdmin: {
      adminUrl: new URL(env.KEYCLOAK_ADMIN_URL || issuer.origin),
      adminUser: env.KEYCLOAK_ADMIN_USER || 'keycloak-admin',
      adminPassword: env.KEYCLOAK_ADMIN_PASSWORD || 'keycloak-admin-local',
    },
  };
}
