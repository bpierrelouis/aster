import { randomBytes } from 'node:crypto';
import { journal } from './journal.ts';

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
  // Recensement mobile (RIGEL), fonctionnalité complémentaire : adresse publique de l'application mobile (relais). Sans elle,
  // ou mal configurée en production (adresse invalide ou non HTTPS, secret absent ou trop court), l'appairage est indisponible
  // et le connecteur refusé, mais le serveur démarre : le recensement ne bloque jamais ORION.
  const rigelUrl = adresseRigel(env.RIGEL_URL, production);
  const rigelValide = !production || (rigelUrl?.startsWith('https:') && (env.RIGEL_SECRET?.length ?? 0) >= 32);
  if (env.RIGEL_URL && !rigelValide) journal.warn('rigel_desactive', { motif: 'RIGEL_URL en HTTPS et RIGEL_SECRET de 32 caractères minimum attendus' });
  if (production && identityProvisioning && (!env.PROVISIONING_CLIENT_SECRET || env.PROVISIONING_CLIENT_SECRET === 'orion-provisionnement-local')) {
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
    rigel: { secret: (rigelValide && env.RIGEL_SECRET) || (production ? randomBytes(48).toString('base64url') : 'orion-rigel-local'), url: rigelValide ? rigelUrl : null },
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

/** Origine de l'application mobile ; null si absente ou invalide (hors production : celle de npm run dev:mobile) */
function adresseRigel(valeur: string | undefined, production: boolean) {
  if (!valeur) return production ? null : 'http://localhost:5175';
  try { return new URL(valeur).origin; } catch { return null; }
}

export type Config = ReturnType<typeof readConfig>;
