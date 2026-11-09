import { randomBytes } from 'node:crypto';

export function readConfig(env = process.env) {
  const production = env.NODE_ENV === 'production';
  const required = ['APP_URL', 'DATABASE_URL', 'OIDC_ISSUER', 'OIDC_CLIENT_ID', 'OIDC_CLIENT_SECRET', 'SESSION_SECRET', 'S3_ENDPOINT', 'S3_BUCKET', 'S3_ACCESS_KEY', 'S3_SECRET_KEY', 'AGENT_TOKEN'];
  if (production && required.some((name) => !env[name])) {
    throw new Error('En production, renseigner APP_URL, DATABASE_URL, OIDC_ISSUER, OIDC_CLIENT_ID, OIDC_CLIENT_SECRET, SESSION_SECRET, la configuration S3 (S3_ENDPOINT, S3_BUCKET, S3_ACCESS_KEY, S3_SECRET_KEY) et AGENT_TOKEN.');
  }
  const appUrl = new URL(env.APP_URL || 'http://localhost:5173');
  const issuer = new URL(env.OIDC_ISSUER || 'http://localhost:8081/realms/aster');
  const s3Endpoint = new URL(env.S3_ENDPOINT || 'http://localhost:8333');
  if (production && (env.AGENT_TOKEN === 'aster-agent-local' || env.AGENT_TOKEN.length < 32)) throw new Error('La production exige un jeton dédié pour les postes (32 caractères minimum).');
  if (production && (s3Endpoint.protocol !== 'https:' || env.S3_SECRET_KEY === 'aster-local-s3')) {
    throw new Error('La production exige un stockage S3 en HTTPS avec des identifiants dédiés.');
  }
  if (production && (appUrl.protocol !== 'https:' || issuer.protocol !== 'https:' || env.OIDC_CLIENT_SECRET === 'aster-client-local' || env.SESSION_SECRET.length < 32)) {
    throw new Error('La production exige HTTPS, un fournisseur hors démonstrateur et des secrets dédiés.');
  }
  return {
    production,
    port: Number(env.PORT || 3001),
    appUrl: appUrl.origin,
    issuer,
    clientId: env.OIDC_CLIENT_ID || 'aster-web',
    clientSecret: env.OIDC_CLIENT_SECRET || 'aster-client-local',
    databaseUrl: env.DATABASE_URL || 'postgres://aster:aster-local@localhost:5432/aster',
    sessionSecret: env.SESSION_SECRET || randomBytes(48).toString('base64url'),
    agentToken: env.AGENT_TOKEN || 'aster-agent-local',
    // Démonstrateur : compte d'administration du Keycloak local (création des identités)
    keycloakAdmin: { adminUser: env.KEYCLOAK_ADMIN_USER || 'keycloak-admin', adminPassword: env.KEYCLOAK_ADMIN_PASSWORD || 'keycloak-admin-local' },
    s3: {
      endpoint: s3Endpoint.href.replace(/\/$/, ''),
      region: env.S3_REGION || 'us-east-1',
      bucket: env.S3_BUCKET || 'aster-etats-des-lieux',
      accessKeyId: env.S3_ACCESS_KEY || 'aster',
      secretAccessKey: env.S3_SECRET_KEY || 'aster-local-s3',
    },
  };
}
