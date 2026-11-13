/* ==========================================================================
   Services d'ORION : description, adresse et contrôle d'état, publiés par
   /api/infos et /api/health.
   ========================================================================== */

import { lookup } from 'node:dns/promises';
import { connect } from 'node:net';
import { hostname, networkInterfaces, platform, arch } from 'node:os';
import type { NetworkInterfaceInfo } from 'node:os';
import type { Poste } from '#shared/types.ts';
import type { Config } from './config.ts';

/** État d'un service publié par /api/health */
type ServiceHealth = {
  id: string; name: string; address: string | null; ip: string[] | null; port: number | null; required: boolean;
  status: 'up' | 'down' | 'not-configured'; latencyMs?: number; error?: string; connected?: number; total?: number;
};
/** Lecture des postes : seule la date du dernier rapport est utilisée */
type Snapshot = () => Promise<{ postes: Pick<Poste, 'vuLe'>[] }>;

const TIMEOUT = 3000;
const DEFAULT_PORTS: Record<string, number> = { 'http:': 80, 'https:': 443, 'postgres:': 5432, 'postgresql:': 5432, 'ldap:': 389 };
const startedAt = new Date();

/** Connexion TCP acceptée. */
const tcp = ({ hostname: host, port }: URL) => new Promise<void>((resolve, reject) => {
  const socket = connect({ host, port: Number(port), timeout: TIMEOUT });
  socket.once('connect', () => { socket.destroy(); resolve(); });
  socket.once('timeout', () => { socket.destroy(); reject(new Error('Délai dépassé')); });
  socket.once('error', reject);
});

/** Réponse HTTP : toute réponse, ou seulement un succès (2xx et 3xx) si strict. */
const http = (strict: boolean) => async (url: URL) => {
  const response = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(TIMEOUT) });
  if (strict && response.status >= 400) throw new Error(`HTTP ${response.status}`);
};

/** Adresse sans identifiants : hôte et port. */
function address(value: string | undefined) {
  if (!value) return null;
  const url = new URL(value);
  return { url, host: url.hostname.replace(/^\[|\]$/g, ''), port: Number(url.port) || DEFAULT_PORTS[url.protocol] || null };
}

/**
 * Services joints par ORION. Les adresses facultatives (WEB_URL, LDAP_URL,
 * SYSLOG_URL) servent seulement au contrôle d'état : sans elles, le service est
 * présenté comme non configuré.
 */
export function createServices({ config, env = process.env, pool, snapshot, connectedAfter }: {
  config: Config; env?: NodeJS.ProcessEnv; pool: { query(sql: string): Promise<unknown> }; snapshot: Snapshot; connectedAfter: number;
}) {
  const issuer = config.issuer.href.replace(/\/$/, '');
  const services = [
    {
      id: 'entree', name: 'Point d’entrée', role: 'Reçoit les navigateurs en HTTPS et répartit les requêtes vers l’interface et l’API.',
      url: config.appUrl, check: http(true),
    },
    {
      id: 'web', name: 'Serveur web', role: 'Sert les fichiers de l’interface React.',
      url: env.WEB_URL, check: http(true),
    },
    {
      id: 'api', name: 'API ORION', role: 'Applique les règles métier, la connexion et l’API des postes ; cette instance répond.',
      url: `http://${config.host}:${config.port}`, ip: localAddresses(), check: async () => {},
    },
    {
      id: 'base', name: 'Base de données', role: 'Conserve les données métier, les sessions et le journal des révisions.', required: true,
      url: config.databaseUrl, check: () => pool.query('SELECT 1'),
    },
    {
      id: 'identite', name: 'Fournisseur d’identité', role: 'Authentifie les utilisateurs (OIDC).', required: true,
      url: issuer, check: async () => {
        const response = await fetch(`${issuer}/.well-known/openid-configuration`, { signal: AbortSignal.timeout(TIMEOUT) });
        if (!response.ok || ((await response.json()) as { issuer?: unknown }).issuer !== config.issuer.href) throw new Error('Émetteur OIDC inattendu');
      },
    },
    ...(config.identityProvisioning ? [{
      id: 'identite-admin', name: 'Administration du fournisseur d’identité', role: 'Reçoit la création des identités des comptes ORION.',
      url: config.provisioning.adminUrl.href, check: http(false),
    }] : []),
    {
      id: 'annuaire', name: 'Annuaire', role: 'Porte les identités lues par le fournisseur d’identité (LDAP).',
      url: env.LDAP_URL, check: tcp,
    },
    {
      id: 'journaux', name: 'Collecteur de journaux', role: 'Reçoit les journaux des conteneurs (syslog RFC 5424 sur TLS).',
      url: env.SYSLOG_URL, check: tcp,
    },
  ].map((service) => ({ ...service, address: address(service.url) }));

  const postes = {
    id: 'postes', name: 'Postes', role: 'Envoient leurs rapports d’activité et exécutent les interventions.',
  };

  return {
    /** Description du système et des services. */
    infos: () => ({
      application: {
        name: 'ORION',
        description: 'Gestion du parc informatique des écoles et supervision des postes Windows.',
        version: env.ORION_VERSION || null,
        mode: config.production ? 'production' : 'développement',
        startedAt: startedAt.toISOString(),
      },
      instance: { hostname: hostname(), ip: localAddresses(), node: process.version, platform: `${platform()} ${arch()}`, uptimeSeconds: Math.round(process.uptime()) },
      services: [...services.map(({ id, name, role, address: a, required }) => ({ id, name, role, host: a?.host ?? null, port: a?.port ?? null, required: Boolean(required) })),
        { ...postes, host: null, port: null, required: false }],
    }),

    /** État de chaque service ; HTTP 503 si un service requis est indisponible. */
    async health() {
      const results = await Promise.all(services.map(async (service): Promise<ServiceHealth> => {
        const { id, name, address: a, required = false } = service;
        if (!a) return { id, name, address: null, ip: null, port: null, required, status: 'not-configured' };
        const ip = service.ip ?? await lookup(a.host, { all: true }).then((list) => list.map((x) => x.address), () => []);
        const begin = performance.now();
        try {
          await service.check(a.url);
          return { id, name, address: `${a.host}:${a.port}`, ip, port: a.port, required, status: 'up', latencyMs: Math.round(performance.now() - begin) };
        } catch (error) {
          return { id, name, address: `${a.host}:${a.port}`, ip, port: a.port, required, status: 'down', error: (error as NodeJS.ErrnoException).code || (error as Error).message };
        }
      }));
      results.push(await postesHealth(postes, snapshot, connectedAfter));
      const down = results.filter((s) => s.status === 'down');
      const status = down.some((s) => s.required) ? 'unavailable' : down.length ? 'degraded' : 'ok';
      return { status, checkedAt: new Date().toISOString(), instance: hostname(), services: results };
    },
  };
}

/** Postes : actifs si au moins un rapport a été reçu dans le délai de connexion. */
async function postesHealth({ id, name }: { id: string; name: string }, snapshot: Snapshot, connectedAfter: number): Promise<ServiceHealth> {
  try {
    const postes = (await snapshot()).postes;
    const connected = postes.filter((p) => p.vuLe && Date.now() - p.vuLe < connectedAfter).length;
    return { id, name, address: null, ip: [], port: null, required: false, status: connected ? 'up' : 'down', connected, total: postes.length };
  } catch (error) {
    return { id, name, address: null, ip: [], port: null, required: false, status: 'down', error: (error as NodeJS.ErrnoException).code || (error as Error).message };
  }
}

/** Adresses IPv4 de cette instance, hors boucle locale. */
function localAddresses() {
  return [...new Set((Object.values(networkInterfaces()) as NetworkInterfaceInfo[][]).flat().filter((i) => !i.internal && i.family === 'IPv4').map((i) => i.address))];
}
