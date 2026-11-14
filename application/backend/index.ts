import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import pg from 'pg';
import * as oidc from 'openid-client';
import swaggerUi from 'swagger-ui-express';
import { fileURLToPath } from 'node:url';
import { readConfig } from './config.ts';
import { journal, raison } from './journal.ts';
import { identityFromClaims, userFromAccount } from './profiles.ts';
import { createWorkspaceRouter, createAgentRouter, createRigelRouter } from './workspace/routes.ts';
import { createKeycloakProvisioning } from './demonstrateur/identity-provisioning.ts';
import { createPostgresWorkspaceRepository } from './workspace/postgres.ts';
import { createServices } from './services.ts';
import { openapi } from './openapi.ts';
import { DISCONNECT_AFTER } from './workspace/postes.ts';
import { editable, same } from './workspace/rules.ts';
import { refuser } from './refus.ts';
import type { Compte, Id, WorkspaceState } from '#shared/types.ts';

declare module 'express-session' {
  interface SessionData {
    /** Connexion OIDC en cours : vérificateur PKCE, état et nonce attendus au retour */
    login: { verifier: string; state: string; nonce: string; createdAt: number };
    accountId: Id;
    idToken: string;
    expiresAt: number;
  }
}

const config = readConfig();
const pool = new pg.Pool({ connectionString: config.databaseUrl });
pool.on('error', (error) => journal.error('postgresql', { erreur: raison(error) }));
await pool.query('SELECT 1');

// Découverte du fournisseur d'identité : retentée à la requête suivante s'il est indisponible.
let oidcConfig: Promise<oidc.Configuration> | undefined;
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
// Referrer-Policy same-origin, comme Apache : avec no-referrer (défaut d'Helmet), le navigateur envoie « Origin: null »
// sur les POST de l'interface, que le contrôle d'origine refuse
app.use(helmet({
  strictTransportSecurity: config.production ? undefined : false,
  contentSecurityPolicy: config.production ? undefined : false,
  referrerPolicy: { policy: 'same-origin' },
}));
app.use(['/api', '/auth'], (_req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
// Journal d'accès de l'API : une ligne par requête ; les sondes et rapports périodiques n'y figurent qu'en cas d'échec
const periodiques = new Set(['/api/health', '/api/infos', '/api/agent/rapports', '/api/rigel/campagnes', '/api/workspace']);
app.use(['/api', '/auth'], (req, res, next) => {
  const debut = performance.now();
  res.on('finish', () => {
    const chemin = req.originalUrl.split('?')[0].replace(/\/$/, '');
    if (res.statusCode < 400 && periodiques.has(chemin) && (req.method === 'GET' || chemin === '/api/agent/rapports')) return;
    const champs = { methode: req.method, chemin, statut: res.statusCode, duree_ms: Math.round(performance.now() - debut), compte: req.session?.accountId, ip: req.ip };
    if (res.statusCode >= 500) journal.error('requete', champs); else if (res.statusCode >= 400) journal.warn('requete', champs); else journal.info('requete', champs);
  });
  next();
});
app.use(session({
  name: 'orion.sid',
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
  store: new (connectPgSimple(session))({ pool, createTableIfMissing: true }),
  cookie: { httpOnly: true, secure: config.production, sameSite: 'lax', maxAge: 60 * 60 * 1000 },
}));

const saveSession = (req: Request) => new Promise<void>((resolve, reject) => req.session.save((error) => error ? reject(error) : resolve()));
const regenerateSession = (req: Request) => new Promise<void>((resolve, reject) => req.session.regenerate((error) => error ? reject(error) : resolve()));
const destroySession = (req: Request) => new Promise<void>((resolve, reject) => req.session.destroy((error) => error ? reject(error) : resolve()));

// Espace de travail : données métier dans PostgreSQL ; états des lieux PDF produits à la demande.
const workspaceRepository = await createPostgresWorkspaceRepository({ pool, seedReset: config.seedReset });

// Système : état et description des services, documentation de l'API. Sans session de super administrateur,
// l'état et la description se limitent au minimum utile aux contrôles (HAProxy, déploiement) : ni adresse, ni port.
const services = createServices({ config, pool, snapshot: workspaceRepository.snapshot, connectedAfter: DISCONNECT_AFTER });
const superadmin = async (req: Request) => (await sessionActor(req))?.role === 'superadmin';
app.get('/api/health', async (req, res) => {
  const health = await services.health();
  res.status(health.status === 'unavailable' ? 503 : 200).json(await superadmin(req) ? health : { status: health.status, checkedAt: health.checkedAt });
});
app.get('/api/infos', async (req, res) => {
  const infos = services.infos();
  res.json(await superadmin(req) ? infos : { application: infos.application });
});
const connected = async (req: Request, res: Response, next: NextFunction) => ((await sessionActor(req)) ? next() : res.status(401).json({ error: 'Connexion nécessaire.' }));
app.get('/api/openapi.json', connected, (_req, res) => res.json(openapi));
app.use('/api/docs', connected, swaggerUi.serve, swaggerUi.setup(openapi, { customSiteTitle: 'API ORION' }));

// Identités du fournisseur local (démonstrateur) : créées pour les comptes ORION actifs
const provisioning = config.identityProvisioning ? createKeycloakProvisioning({ issuer: config.issuer, ...config.provisioning }) : null;
const provision = (accounts: Compte[]) => provisioning?.ensure(accounts).catch((error) => journal.error('provisionnement', { erreur: raison(error) }));
provision((await workspaceRepository.snapshot()).comptes);
// Comptes modifiés par un administrateur (une connexion ne change que des valeurs tenues par le serveur)
const comptesGeres = (s: WorkspaceState) => s.comptes.map((c) => editable('comptes', c));
workspaceRepository.onCommit((before, after) => { if (!same(comptesGeres(before), comptesGeres(after))) provision(after.comptes); });
setInterval(() => workspaceRepository.agent.sweep().catch(() => {}), 10_000).unref();

/** Compte ORION actif de la session ; une session dont le compte est désactivé est fermée. */
async function sessionActor(req: Request) {
  if (!req.session.accountId) return null;
  const actor = req.session.expiresAt! > Date.now() ? await workspaceRepository.actor(req.session.accountId) : null;
  if (!actor) { journal.info('session_fermee', { compte: req.session.accountId, motif: req.session.expiresAt! > Date.now() ? 'compte_inactif' : 'expiree' }); await destroySession(req); }
  return actor;
}

app.get('/api/me', async (req, res) => {
  const actor = await sessionActor(req);
  if (!actor) return res.status(401).json({ error: 'Connexion nécessaire.' });
  const ecole = (await workspaceRepository.snapshot()).ecoles.find((e) => e.id === actor.ecoleId);
  res.json({ user: userFromAccount(actor, ecole?.nom) });
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
    const claims = tokens.claims()!;
    const identity = identityFromClaims(claims);
    // Rapprochement avec le compte ORION : profil et école sont attribués dans ORION
    const account = await workspaceRepository.findAccount(identity);
    if (!account || !account.actif) {
      journal.warn('connexion_refusee', { motif: account ? 'compte_inactif' : 'compte_inconnu', compte: account?.id, sujet: identity.sub });
      await destroySession(req);
      res.clearCookie('orion.sid');
      return res.redirect('/?error=compte');
    }
    await workspaceRepository.connexion(account.id, identity.sub);
    await regenerateSession(req);
    req.session.accountId = account.id;
    req.session.idToken = tokens.id_token;
    req.session.expiresAt = Math.min(claims.exp * 1000, Date.now() + 60 * 60 * 1000);
    await saveSession(req);
    journal.info('connexion', { compte: account.id, profil: account.role, ecole: account.ecoleId });
    res.redirect('/');
  } catch (error) {
    journal.error('connexion_echec', { erreur: (error as NodeJS.ErrnoException).code || (error as Error).name });
    await destroySession(req);
    res.clearCookie('orion.sid');
    res.redirect('/?error=connexion');
  }
});

app.post('/auth/logout', async (req, res) => {
  if (req.get('origin') !== config.appUrl) return res.status(403).send('Origine refusée.');
  const idToken = req.session.idToken;
  if (req.session.accountId) journal.info('deconnexion', { compte: req.session.accountId });
  await destroySession(req);
  res.clearCookie('orion.sid');
  if (!idToken) return res.redirect(303, '/');
  const url = oidc.buildEndSessionUrl(await identityProvider(), {
    id_token_hint: idToken,
    post_logout_redirect_uri: `${config.appUrl}/`,
  });
  res.redirect(303, url.href);
});

app.use('/api/workspace', (req, res, next) => {
  if (!['GET', 'HEAD'].includes(req.method) && req.get('origin') !== config.appUrl) return refuser(req, res, 403, { error: 'Origine refusée.' });
  next();
}, createWorkspaceRouter({
  repository: workspaceRepository,
  actor: sessionActor,
  agentToken: config.agentToken,
  rigel: config.rigel,
}));
// Postes : rapports d'activité et résultats d'intervention
app.use('/api/agent', createAgentRouter({ repository: workspaceRepository, token: config.agentToken }));
// Recensement mobile : connecteur du relais RIGEL
app.use('/api/rigel', createRigelRouter({ repository: workspaceRepository, secret: config.rigel.secret }));

app.use(['/api', '/auth'], (_req, res) => res.status(404).json({ error: 'Adresse inconnue.' }));
if (config.production) {
  app.use(express.static(fileURLToPath(new URL('../frontend/dist', import.meta.url))));
  app.get('/{*path}', (_req, res) => res.sendFile(fileURLToPath(new URL('../frontend/dist/index.html', import.meta.url))));
}
app.use((error: NodeJS.ErrnoException, req: Request, res: Response, _next: NextFunction) => {
  journal.error('serveur', { chemin: req.originalUrl.split('?')[0], erreur: raison(error) });
  res.status(503).type('html').send('<!doctype html><html lang="fr"><meta charset="utf-8"><title>Orion — Connexion indisponible</title><h1>Connexion momentanément indisponible</h1><p>Veuillez réessayer dans quelques instants. Si le problème persiste, contactez votre administrateur.</p><a href="/">Retour à la connexion</a></html>');
});

const server = app.listen(config.port, config.host, () => journal.info('demarrage', { adresse: `http://${config.host}:${config.port}`, production: config.production }));
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, () => {
    journal.info('arret', { signal });
    server.close(() => pool.end().then(() => process.exit(0)));
  });
}
