import { randomBytes } from 'node:crypto';

export function readConfig(env = process.env) {
  const production = env.NODE_ENV === 'production';
  const required = ['APP_URL', 'DATABASE_URL', 'OIDC_ISSUER', 'OIDC_CLIENT_ID', 'OIDC_CLIENT_SECRET', 'SESSION_SECRET', 'AGENT_TOKEN'];
  if (production && required.some((name) => !env[name])) {
    throw new Error('En production, renseigner APP_URL, DATABASE_URL, OIDC_ISSUER, OIDC_CLIENT_ID, OIDC_CLIENT_SECRET, SESSION_SECRET et AGENT_TOKEN.');
  }
  const appUrl = new URL(env.APP_URL || 'http://localhost:5173');
  const issuer = new URL(env.OIDC_ISSUER || 'http://localhost:8081/realms/orion');
  if (production && (env.AGENT_TOKEN === 'orion-agent-local' || env.AGENT_TOKEN!.length < 32)) throw new Error('La production exige un jeton dédié pour les postes (32 caractères minimum).');
  if (production && (appUrl.protocol !== 'https:' || issuer.protocol !== 'https:' || env.OIDC_CLIENT_SECRET === 'orion-client-local' || env.SESSION_SECRET!.length < 32)) {
    throw new Error('La production exige HTTPS, un fournisseur hors démonstrateur et des secrets dédiés.');
  }
  // Démonstrateur : création des identités dans le Keycloak local, active hors production ou sur demande explicite
  const identityProvisioning = env.IDENTITY_PROVISIONING ? env.IDENTITY_PROVISIONING === 'true' : !production;
  // Réinitialisation des données quand la version du jeu de départ change : jamais en production, sauf démonstrateur (SEED_RESET=true)
  const seedReset = env.SEED_RESET ? env.SEED_RESET === 'true' : !production;
  // Recensement mobile (RECON) : adresse publique de l'application mobile (relais) ; sans elle, l'appairage est indisponible
  const reconUrl = env.RECON_URL ? new URL(env.RECON_URL).origin : production ? null : 'http://localhost:5175';
  if (production && reconUrl && (!env.RECON_SECRET || env.RECON_SECRET.length < 32 || !reconUrl.startsWith('https:'))) {
    throw new Error('Le recensement mobile exige en production un RECON_URL en HTTPS et un RECON_SECRET dédié (32 caractères minimum).');
  }
  if (production && identityProvisioning &&(!env.PROVISIONING_CLIENT_SECRET || env.PROVISIONING_CLIENT_SECRET === 'orion-provisionnement-local')) {
    throw new Error('La création des identités en production exige un secret dédié du client orion-provisionnement.');
  }
  return {
    production,
    port: Number(env.PORT || 3001),
    // Adresse d'écoute : boucle locale par défaut, toutes les interfaces dans un conteneur (HOST=0.0.0.0)
    host: env.HOST || '127.0.0.1',
    appUrl: appUrl.origin,
    issuer,
    clientId: env.OIDC_CLIENT_ID || 'orion-web',
    clientSecret: env.OIDC_CLIENT_SECRET || 'orion-client-local',
    databaseUrl: env.DATABASE_URL || 'postgres://orion:orion-local@localhost:5432/orion',
    sessionSecret: env.SESSION_SECRET || randomBytes(48).toString('base64url'),
    agentToken: env.AGENT_TOKEN || 'orion-agent-local',
    // Secret des campagnes : authentifie le connecteur et dérive la clé et le jeton de chaque campagne ; absent en production : connecteur refusé
    recon: { secret: env.RECON_SECRET || (production ? randomBytes(48).toString('base64url') : 'orion-recon-local'), url: reconUrl },
    // Démonstrateur : compte de service du Keycloak local, limité à la gestion des utilisateurs du realm
    identityProvisioning,
    seedReset,
    provisioning: {
      adminUrl: new URL(env.KEYCLOAK_ADMIN_URL || issuer.origin),
      clientId: env.PROVISIONING_CLIENT_ID || 'orion-provisionnement',
      clientSecret: env.PROVISIONING_CLIENT_SECRET || 'orion-provisionnement-local',
    },
  };
}

export type Config = ReturnType<typeof readConfig>;
