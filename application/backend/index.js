import express from 'express';
import helmet from 'helmet';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import pg from 'pg';
import * as oidc from 'openid-client';
import { fileURLToPath } from 'node:url';
import { readConfig } from './config.js';
import { userFromClaims } from './profiles.js';

const config = readConfig();
const pool = new pg.Pool({ connectionString: config.databaseUrl });
pool.on('error', (error) => console.error('Connexion PostgreSQL :', error.message));
await pool.query('SELECT 1');

// Discovery is retried on the next request if the identity provider is unavailable.
let oidcConfig;
async function identityProvider() {
  if (!oidcConfig) {
    oidcConfig = oidc.discovery(config.issuer, config.clientId, config.clientSecret, undefined,
      { execute: config.production ? [oidc.enableNonRepudiationChecks] : [oidc.allowInsecureRequests, oidc.enableNonRepudiationChecks] })
      .catch((error) => { oidcConfig = undefined; throw error; });
  }
  return oidcConfig;
}

const app = express();
app.disable('x-powered-by');
if (config.production) app.set('trust proxy', 1);
app.use(helmet({ strictTransportSecurity: config.production ? undefined : false, contentSecurityPolicy: config.production ? undefined : false }));
app.use(['/api', '/auth'], (_req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
app.use(session({
  name: 'aster.sid',
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
  store: new (connectPgSimple(session))({ pool, createTableIfMissing: true }),
  cookie: { httpOnly: true, secure: config.production, sameSite: 'lax', maxAge: 60 * 60 * 1000 },
}));

const saveSession = (req) => new Promise((resolve, reject) => req.session.save((error) => error ? reject(error) : resolve()));
const regenerateSession = (req) => new Promise((resolve, reject) => req.session.regenerate((error) => error ? reject(error) : resolve()));
const destroySession = (req) => new Promise((resolve, reject) => req.session.destroy((error) => error ? reject(error) : resolve()));

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    const metadata = await fetch(`${config.issuer.href.replace(/\/$/, '')}/.well-known/openid-configuration`, { signal: AbortSignal.timeout(3000) });
    if (!metadata.ok || (await metadata.json()).issuer !== config.issuer.href) throw new Error('Fournisseur indisponible');
    res.json({ status: 'ok' });
  } catch {
    res.status(503).json({ status: 'unavailable' });
  }
});

app.get('/api/me', async (req, res) => {
  if (!req.session.user || req.session.expiresAt <= Date.now()) {
    if (req.session.user) await destroySession(req);
    return res.status(401).json({ error: 'Connexion nécessaire.' });
  }
  res.json({ user: req.session.user });
});

app.get('/auth/login', async (req, res) => {
  const provider = await identityProvider();
  const verifier = oidc.randomPKCECodeVerifier();
  const state = oidc.randomState();
  const nonce = oidc.randomNonce();
  req.session.login = { verifier, state, nonce, createdAt: Date.now() };
  const url = oidc.buildAuthorizationUrl(provider, {
    redirect_uri: `${config.appUrl}/auth/callback`,
    scope: 'openid profile email',
    code_challenge: await oidc.calculatePKCECodeChallenge(verifier),
    code_challenge_method: 'S256', state, nonce,
  });
  await saveSession(req);
  res.redirect(url.href);
});

app.get('/auth/callback', async (req, res) => {
  const login = req.session.login;
  delete req.session.login;
  await saveSession(req);
  if (!login || Date.now() - login.createdAt > 10 * 60 * 1000) {
    return res.redirect('/?error=session');
  }
  try {
    const tokens = await oidc.authorizationCodeGrant(await identityProvider(), new URL(req.originalUrl, config.appUrl), {
      pkceCodeVerifier: login.verifier, expectedState: login.state, expectedNonce: login.nonce, idTokenExpected: true,
    });
    const claims = tokens.claims();
    const user = userFromClaims(claims);
    await regenerateSession(req);
    req.session.user = user;
    req.session.idToken = tokens.id_token;
    req.session.expiresAt = Math.min(claims.exp * 1000, Date.now() + 60 * 60 * 1000);
    await saveSession(req);
    res.redirect('/');
  } catch (error) {
    console.error('Échec du retour OIDC :', error.code || error.name);
    await destroySession(req);
    res.clearCookie('aster.sid');
    res.redirect('/?error=connexion');
  }
});

app.post('/auth/logout', async (req, res) => {
  if (req.get('origin') !== config.appUrl) return res.status(403).send('Origine refusée.');
  const idToken = req.session.idToken;
  await destroySession(req);
  res.clearCookie('aster.sid');
  if (!idToken) return res.redirect(303, '/');
  const url = oidc.buildEndSessionUrl(await identityProvider(), {
    id_token_hint: idToken,
    post_logout_redirect_uri: `${config.appUrl}/`,
  });
  res.redirect(303, url.href);
});

app.use(['/api', '/auth'], (_req, res) => res.status(404).json({ error: 'Adresse inconnue.' }));
if (config.production) {
  app.use(express.static(fileURLToPath(new URL('../frontend/dist', import.meta.url))));
  app.get('/{*path}', (_req, res) => res.sendFile(fileURLToPath(new URL('../frontend/dist/index.html', import.meta.url))));
}
app.use((error, _req, res, _next) => {
  console.error('Serveur :', error.code || error.name);
  res.status(503).type('html').send('<!doctype html><html lang="fr"><meta charset="utf-8"><title>ASTER — Connexion indisponible</title><h1>Connexion momentanément indisponible</h1><p>Veuillez réessayer dans quelques instants. Si le problème persiste, contactez votre administrateur.</p><a href="/">Retour à la connexion</a></html>');
});

const server = app.listen(config.port, '127.0.0.1', () => console.log(`Serveur ASTER : http://localhost:${config.port}`));
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, () => server.close(() => pool.end().then(() => process.exit(0))));
}
