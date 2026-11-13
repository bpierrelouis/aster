/* ==========================================================================
   RECON · connecteur, sur le réseau d'ORION : seul lien entre ORION et le
   relais, par des requêtes sortantes uniquement (aucun port entrant).
   À chaque cycle :
   1. lit les campagnes ouvertes d'ORION (/api/recon/campagnes, instantanés
      déjà chiffrés par ORION) ;
   2. publie sur le relais celles dont la version a changé, supprime celles
      qu'ORION ne publie plus (closes ou expirées) ;
   3. relève les événements des téléphones, les transmet à ORION, puis les
      acquitte sur le relais ; s'il y en avait, relance aussitôt un cycle.
   Le connecteur ne déchiffre rien et ne garde aucun état qui fasse autorité
   (versions publiées en mémoire, republiées après un redémarrage).
   Variables : ORION_API, RECON_SECRET, RELAIS_URL, RELAIS_TOKEN,
   RECON_INTERVALLE (ms).
   Proxy sortant : HTTPS_PROXY et NO_PROXY, pris en compte par fetch avec
   NODE_USE_ENV_PROXY=1 (Node.js 22.21 et suivants) ; NODE_EXTRA_CA_CERTS
   pour reconnaître l'autorité d'un proxy qui inspecte le TLS.
   ========================================================================== */

import { fileURLToPath } from 'node:url';
import type { Bloc, CampagnePubliee, ResultatRecon } from '#shared/recon.ts';
import { journal, raison } from '../journal.ts';

type Fetch = typeof fetch;

export function createConnecteur({ orion, secret, relais, token, fetch: http = fetch }: { orion: string; secret: string; relais: string; token: string; fetch?: Fetch }) {
  const publiees = new Map<string, string>(); // campagne → version déposée sur le relais

  async function appel<T>(base: string, jeton: string, chemin: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
    const response = await http(`${base.replace(/\/+$/, '')}${chemin}`, {
      method: init.method ?? 'GET',
      headers: { Authorization: `Bearer ${jeton}`, ...(init.body !== undefined && { 'Content-Type': 'application/json' }) },
      ...(init.body !== undefined && { body: JSON.stringify(init.body) }),
      signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok) {
      const { error } = await response.json().catch(() => ({ error: '' }));
      throw new Error(`${init.method ?? 'GET'} ${chemin} : ${response.status}${error ? ` ${error}` : ''}`);
    }
    return (response.status === 204 ? undefined : await response.json()) as T;
  }
  const versOrion = <T>(chemin: string, init?: { method?: string; body?: unknown }) => appel<T>(orion, secret, `/api/recon${chemin}`, init);
  const versRelais = <T>(chemin: string, init?: { method?: string; body?: unknown }) => appel<T>(relais, token, `/api/connecteur${chemin}`, init);

  /** Un cycle complet ; renvoie le nombre d'événements intégrés par ORION */
  async function cycle() {
    const { campagnes } = await versOrion<{ campagnes: CampagnePubliee[] }>('/campagnes');
    const { campagnes: surRelais } = await versRelais<{ campagnes: { id: string; version: string }[] }>('/campagnes');
    const ouvertes = new Set(campagnes.map((c) => c.id));
    for (const c of surRelais) publiees.set(c.id, c.version);
    for (const c of surRelais.filter((x) => !ouvertes.has(x.id))) {
      await versRelais(`/campagnes/${encodeURIComponent(c.id)}`, { method: 'DELETE' });
      publiees.delete(c.id);
    }
    for (const c of campagnes.filter((x) => publiees.get(x.id) !== x.version)) {
      await versRelais(`/campagnes/${encodeURIComponent(c.id)}`, { method: 'PUT', body: { empreinte: c.empreinte, expireLe: c.expireLe, version: c.version, instantane: c.instantane } });
      publiees.set(c.id, c.version);
    }
    let integres = 0;
    for (const c of campagnes) {
      const chemin = `/campagnes/${encodeURIComponent(c.id)}`;
      const { evenements } = await versRelais<{ evenements: { rang: number; id: string; bloc: Bloc }[] }>(`${chemin}/evenements?limite=500`);
      if (!evenements.length) continue;
      const { resultats } = await versOrion<{ resultats: ResultatRecon[] }>(`${chemin}/evenements`, { method: 'POST', body: { evenements: evenements.map(({ id, bloc }) => ({ id, bloc })) } });
      for (const r of resultats.filter((x) => x.statut === 'refuse')) journal.warn('recon_constat_refuse', { evenement: r.id, motif: r.message });
      await versRelais(`${chemin}/acquittement`, { method: 'POST', body: { jusqua: Math.max(...evenements.map((e) => e.rang)) } });
      integres += evenements.length;
    }
    return integres;
  }

  /** Boucle : un cycle par intervalle, aussitôt relancé après l'intégration d'événements ; une erreur attend le cycle suivant */
  function demarrer(intervalle: number) {
    let arret = false;
    let attente: ReturnType<typeof setTimeout> | undefined;
    (async function boucle() {
      while (!arret) {
        let integres = 0;
        try { integres = await cycle(); } catch (error) { journal.error('connecteur', { erreur: raison(error) }); }
        if (!integres) await new Promise<void>((resolve) => { attente = setTimeout(resolve, intervalle); });
      }
    })();
    return () => { arret = true; clearTimeout(attente); };
  }

  return { cycle, demarrer };
}

/* ---------- Exécution ---------- */

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const env = process.env;
  const production = env.NODE_ENV === 'production';
  const config = {
    orion: env.ORION_API || 'http://127.0.0.1:3001',
    secret: env.RECON_SECRET || (production ? '' : 'orion-recon-local'),
    relais: env.RELAIS_URL || 'http://127.0.0.1:3002',
    token: env.RELAIS_TOKEN || (production ? '' : 'recon-relais-local'),
  };
  if (production && (config.secret.length < 32 || config.token.length < 32)) {
    throw new Error('En production, renseigner RECON_SECRET et RELAIS_TOKEN dédiés (32 caractères minimum).');
  }
  let stop = () => {};
  if (production && !env.RELAIS_URL) {
    // Relais pas encore publié : le connecteur reste inactif, sans être relancé en boucle par l'orchestrateur
    journal.warn('connecteur_inactif', { motif: 'RELAIS_URL non renseigné' });
    const veille = setInterval(() => {}, 3_600_000);
    stop = () => clearInterval(veille);
  } else {
    if (production && !config.relais.startsWith('https:')) throw new Error('En production, RELAIS_URL doit être en HTTPS.');
    stop = createConnecteur(config).demarrer(Number(env.RECON_INTERVALLE) || 10_000);
    journal.info('demarrage', { orion: config.orion, relais: config.relais });
  }
  for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => { stop(); process.exit(0); });
}
