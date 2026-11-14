/* ==========================================================================
   Simulateur de postes Windows et de M42 (démonstrateur)
   Chaque poste émulé est éteint, allumé sans session ou connecté (session
   d'un stagiaire au nom fictif, qui lance des programmes), remonte son état
   par l'API d'agent, reçoit les interventions demandées (arrêt de
   processus, installation, désinstallation, réinstallation), les exécute
   et renvoie le résultat. Chaque poste reçoit une adresse IPv4 stable,
   attribuée par salle (adressesIp), qu'il remonte dans ses rapports.
   Seuls les postes sont émulés : ORION traite leurs rapports comme ceux
   de postes réels.
   Lancement autonome : node outils/simulateur-postes/agents.ts (ORION_API, AGENT_TOKEN).
   ========================================================================== */

import { fileURLToPath } from 'node:url';
import { UTILISATEURS, SALLES_FERMEES, prng } from '../donnees-demonstration/jeu.ts';
import type { Commande, Rapport, Resultat } from '../../backend/domaine/postes.ts';
import { journal, raison } from '../../backend/journal.ts';

/* Échanges avec l'API d'agent (backend/domaine/postes.ts), vus depuis le poste */
export type PosteAgent = { nomReseau: string; horsService: boolean; salleId: string; ecoleId: string | null };
export type AgentTransport = {
  postes(): Promise<PosteAgent[]>;
  rapports(rapports: Rapport[]): Promise<{ commandes?: Commande[] }>;
  resultats(resultats: Resultat[]): Promise<unknown>;
};

/** Poste émulé */
type PosteEmule = PosteAgent & { index: number; adresseIp: string; fermee: boolean; online: boolean; session: string | null; processes: Set<string>; apps: Set<string> };

// Programmes utilisateur et poids de tirage (les processus système ne sont pas remontés) : surtout des
// outils de développement et de bureautique autorisés, rarement des programmes non référencés ou interdits
const PROGRAMMES: [string, number][] = [
  ['firefox.exe', 40], ['Code.exe', 30], ['msedge.exe', 5], ['WindowsTerminal.exe', 4], ['powershell.exe', 3],
  ['git.exe', 3], ['node.exe', 3], ['python.exe', 3], ['idea64.exe', 2], ['pycharm64.exe', 2], ['notepad++.exe', 2],
  ['soffice.exe', 1.5], ['eclipse.exe', 1], ['Postman.exe', 1], ['Docker Desktop.exe', 1], ['putty.exe', 0.8],
  ['dbeaver.exe', 0.8], ['WinSCP.exe', 0.6],
  ['vlc.exe', 0.4], ['Discord.exe', 0.25], ['Spotify.exe', 0.15],
  ['steam.exe', 0.2], ['EpicGamesLauncher.exe', 0.1], ['RobloxPlayerBeta.exe', 0.1], ['MinecraftLauncher.exe', 0.1],
  ['qbittorrent.exe', 0.08], ['uTorrent.exe', 0.05], ['tor.exe', 0.05], ['AnyDesk.exe', 0.05],
];
const SYSTEME = 'Windows 11'; // système installé sur tous les postes émulés (version actuelle des machines)
const IMAGE = ['app-firefox', 'app-vscode', 'app-git', 'app-python']; // applications de l'image de référence
// Applications installées en plus de l'image, avec leur probabilité
const OPTIONS: [string, number][] = [['app-libreoffice', 0.3], ['app-notepadpp', 0.3], ['app-nodejs', 0.25], ['app-putty', 0.2], ['app-intellij', 0.15],
  ['app-pycharm', 0.15], ['app-eclipse', 0.1], ['app-docker', 0.1], ['app-postman', 0.1], ['app-dbeaver', 0.1], ['app-winscp', 0.1]];

/**
 * Plan d'adressage simulé, un réseau par salle : 10.<école>.<salle>.<10 + rang du poste dans la salle>, école et
 * salle numérotées à partir de 1 dans l'ordre de la liste des postes (stable : les nouveaux postes s'y ajoutent).
 */
export function adressesIp(list: Pick<PosteAgent, 'nomReseau' | 'salleId' | 'ecoleId'>[]) {
  const ecoles = new Map<string | null, Map<string, number>>(); // école → salle → nombre de postes déjà numérotés
  const out = new Map<string, string>();
  for (const p of list) {
    if (!ecoles.has(p.ecoleId)) ecoles.set(p.ecoleId, new Map());
    const salles = ecoles.get(p.ecoleId)!;
    if (!salles.has(p.salleId)) salles.set(p.salleId, 0);
    const rang = salles.get(p.salleId)! + 1;
    salles.set(p.salleId, rang);
    const ecole = [...ecoles.keys()].indexOf(p.ecoleId) + 1;
    const salle = [...salles.keys()].indexOf(p.salleId) + 1;
    out.set(p.nomReseau, `10.${ecole % 256}.${salle % 256}.${(10 + rang) % 256}`);
  }
  return out;
}

/**
 * transport : { postes() → [{ nomReseau, horsService, salleId, ecoleId }], rapports(liste) → { commandes }, resultats(liste) }.
 */
export function createAgentEmulator({ transport, interval = 3000, seed = 20261108, log = journal }: {
  transport: AgentTransport; interval?: number; seed?: number; log?: Pick<typeof journal, 'error'>;
}) {
  const rnd = prng(seed);
  const pick = () => { const total = PROGRAMMES.reduce((n, [, w]) => n + w, 0); let x = rnd() * total; for (const [nom, w] of PROGRAMMES) { x -= w; if (x <= 0) return nom; } return PROGRAMMES[0][0]; };
  const postes = new Map<string, PosteEmule>();
  let timer: NodeJS.Timeout | null = null;
  let running = false;
  let lastRefresh = 0;

  // Session d'un stagiaire (compte Windows fictif) ou poste seulement allumé ; les programmes viennent de la session
  const ouvrir = (p: PosteEmule) => { p.session = rnd() < 0.8 ? UTILISATEURS[p.index % UTILISATEURS.length] : null; p.processes = new Set(p.session ? ['firefox.exe', ...(rnd() < 0.6 ? ['Code.exe'] : [])] : []); };
  const eteindre = (p: PosteEmule) => { p.online = false; p.session = null; p.processes.clear(); };

  // Poste d'une salle fermée (simulation, outils/donnees-demonstration/jeu.ts) : reste éteint
  const fermee = (nomReseau: string) => SALLES_FERMEES.some((salle) => nomReseau.startsWith(`${salle}-`));

  function emulate(agent: PosteAgent, index: number, adresseIp: string) {
    const p = { ...agent, index, adresseIp, fermee: fermee(agent.nomReseau), session: null, processes: new Set() } as PosteEmule; // online et apps ajoutés ci-dessous
    p.online = !agent.horsService && !p.fermee && rnd() > 0.1;
    if (p.online) ouvrir(p);
    p.apps = new Set([...IMAGE, ...OPTIONS.filter(([, x]) => rnd() < x).map(([app]) => app)]);
    return p;
  }

  // Un poste dont l'unité centrale est hors service, ou d'une salle fermée, reste éteint
  async function refresh() {
    const list = await transport.postes();
    const ips = adressesIp(list);
    list.forEach((x, i) => {
      const p = postes.get(x.nomReseau);
      if (!p) postes.set(x.nomReseau, emulate(x, i, ips.get(x.nomReseau)!)); // adresse conservée tant que le poste existe
      else { p.horsService = x.horsService; if (p.horsService && p.online) eteindre(p); }
    });
    for (const name of [...postes.keys()]) if (!list.some((p) => p.nomReseau === name)) postes.delete(name);
    lastRefresh = Date.now();
  }

  function execute(cmd: Commande): Resultat | null {
    const p = postes.get(cmd.poste);
    if (!p || !p.online) return null; // le poste exécutera la commande à son retour
    let ok = true;
    if (cmd.type === 'arret') { ok = rnd() > 0.03; if (ok && cmd.processus) p.processes.delete(cmd.processus.nom); }
    else if (cmd.type === 'installation') { ok = rnd() > 0.05; if (ok) p.apps.add(cmd.applicationId!); }
    else if (cmd.type === 'desinstallation') p.apps.delete(cmd.applicationId!);
    else if (cmd.type === 'reinstallation') { p.apps = new Set(IMAGE); p.session = null; p.processes.clear(); } // redémarrage : session fermée
    return { operation: cmd.operation, poste: cmd.poste, statut: ok ? 'reussie' : 'echec' };
  }

  async function tick() {
    if (running) return;
    running = true;
    try {
      if (!postes.size || Date.now() - lastRefresh > 15_000) await refresh();
      for (const p of postes.values()) {
        if (!p.online) { if (!p.horsService && !p.fermee && rnd() < 0.004) { p.online = true; ouvrir(p); } continue; }
        if (rnd() < 0.0008) { eteindre(p); continue; }
        if (rnd() < 0.002) { if (p.session) { p.session = null; p.processes.clear(); } else ouvrir(p); continue; } // fermeture ou ouverture de session
        if (p.session && rnd() < 0.015) {
          if (p.processes.size && rnd() < 0.45) p.processes.delete([...p.processes][Math.floor(rnd() * p.processes.size)]);
          else p.processes.add(pick());
        }
      }
      const online = [...postes.values()].filter((p) => p.online);
      const { commandes = [] } = await transport.rapports(online.map((p) => ({ poste: p.nomReseau, adresseIp: p.adresseIp, os: SYSTEME, session: p.session, processus: [...p.processes].map((nom) => ({ nom, compte: p.session })), applications: [...p.apps] })));
      const resultats = commandes.map(execute).filter(Boolean) as Resultat[];
      if (resultats.length) await transport.resultats(resultats);
    } catch (error) {
      log.error('postes_emules', { erreur: raison(error) });
    } finally { running = false; }
  }

  return {
    start() { if (!timer) { timer = setInterval(tick, interval); timer.unref?.(); tick(); } return this; },
    stop() { clearInterval(timer!); timer = null; },
    tick,
    postes,
  };
}

/** Transport HTTP vers l'API d'agent d'ORION. */
export function httpTransport({ api, token }: { api: string; token: string }): AgentTransport {
  const call = async <T>(path: string, body?: object): Promise<T> => {
    const response = await fetch(`${api}/api/agent${path}`, {
      method: body ? 'POST' : 'GET',
      headers: { Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new Error(`${path} : ${response.status}`);
    return response.json() as Promise<T>;
  };
  return {
    postes: async () => (await call<{ postes: PosteAgent[] }>('/postes')).postes,
    rapports: (rapports) => call('/rapports', { rapports }),
    resultats: (resultats) => call('/resultats', { resultats }),
  };
}

/** Transport direct vers le moteur (mode interface seule, sans réseau). */
export const directTransport = (repository: { agent: AgentTransport }): AgentTransport => ({
  postes: async () => repository.agent.postes(),
  rapports: (rapports) => repository.agent.rapports(rapports),
  resultats: (resultats) => repository.agent.resultats(resultats),
});

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const api = process.env.ORION_API || 'http://127.0.0.1:3001';
  const token = process.env.AGENT_TOKEN || 'orion-agent-local';
  createAgentEmulator({ transport: httpTransport({ api, token }) }).start();
  setInterval(() => {}, 1 << 30); // processus maintenu actif
  journal.info('demarrage', { api: `${api}/api/agent` });
}
