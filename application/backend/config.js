import { randomBytes } from 'node:crypto';

export function readConfig(env = process.env) {
  const production = env.NODE_ENV === 'production';
  const required = ['APP_URL', 'DATABASE_URL', 'OIDC_ISSUER', 'OIDC_CLIENT_ID', 'OIDC_CLIENT_SECRET', 'SESSION_SECRET'];
  if (production && required.some((name) => !env[name])) {
    throw new Error('En production, renseigner APP_URL, DATABASE_URL, OIDC_ISSUER, OIDC_CLIENT_ID, OIDC_CLIENT_SECRET et SESSION_SECRET.');
  }
  const appUrl = new URL(env.APP_URL || 'http://localhost:5173');
  const issuer = new URL(env.OIDC_ISSUER || 'http://localhost:8081/realms/aster-demo');
  if (production && (appUrl.protocol !== 'https:' || issuer.protocol !== 'https:' || issuer.pathname.endsWith('/aster-demo') || env.OIDC_CLIENT_SECRET === 'aster-demo-client-local' || env.SESSION_SECRET.length < 32)) {
    throw new Error('La production exige HTTPS, un fournisseur hors démonstrateur et des secrets dédiés.');
  }
  return {
    production,
    port: Number(env.PORT || 3001),
    appUrl: appUrl.origin,
    issuer,
    clientId: env.OIDC_CLIENT_ID || 'aster-web',
    clientSecret: env.OIDC_CLIENT_SECRET || 'aster-demo-client-local',
    databaseUrl: env.DATABASE_URL || 'postgres://aster:aster-demo-local@localhost:5432/aster',
    sessionSecret: env.SESSION_SECRET || randomBytes(48).toString('base64url'),
  };
}
