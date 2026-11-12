/* ==========================================================================
   Émulateur de postes Windows (démonstrateur)
   Chaque poste émulé est éteint, allumé sans session ou connecté (session
   d'un stagiaire au nom fictif, qui lance des programmes), remonte son état
   par l'API d'agent, reçoit les interventions demandées (arrêt de
   processus, installation, désinstallation, réinstallation), les exécute
   et renvoie le résultat. Seuls les postes sont émulés : ASTER traite
   leurs rapports comme ceux de postes réels.
   Lancement autonome : node backend/demonstrateur/agents.js (ASTER_API, AGENT_TOKEN).
   ========================================================================== */

import { fileURLToPath } from 'node:url';
import { UTILISATEURS, SALLES_FERMEES } from '#shared/seed.js';

// Programmes utilisateur et poids de tirage (les processus système ne sont pas remontés) : surtout des
// outils de développement et de bureautique autorisés, rarement des programmes non référencés ou interdits
const PROGRAMMES = [
  ['firefox.exe', 40], ['Code.exe', 30], ['msedge.exe', 5], ['WindowsTerminal.exe', 4], ['powershell.exe', 3],
  ['git.exe', 3], ['node.exe', 3], ['python.exe', 3], ['idea64.exe', 2], ['pycharm64.exe', 2], ['notepad++.exe', 2],
  ['soffice.exe', 1.5], ['eclipse.exe', 1], ['Postman.exe', 1], ['Docker Desktop.exe', 1], ['putty.exe', 0.8],
  ['dbeaver.exe', 0.8], ['WinSCP.exe', 0.6],
  ['vlc.exe', 0.4], ['Discord.exe', 0.25], ['Spotify.exe', 0.15],
  ['steam.exe', 0.2], ['EpicGamesLauncher.exe', 0.1], ['RobloxPlayerBeta.exe', 0.1], ['MinecraftLauncher.exe', 0.1],
  ['qbittorrent.exe', 0.08], ['uTorrent.exe', 0.05], ['tor.exe', 0.05], ['AnyDesk.exe', 0.05],
];
const IMAGE = ['app-firefox', 'app-vscode', 'app-git', 'app-python']; // applications de l'image de référence
// Applications installées en plus de l'image, avec leur probabilité
const OPTIONS = [['app-libreoffice', 0.3], ['app-notepadpp', 0.3], ['app-nodejs', 0.25], ['app-putty', 0.2], ['app-intellij', 0.15],
  ['app-pycharm', 0.15], ['app-eclipse', 0.1], ['app-docker', 0.1], ['app-postman', 0.1], ['app-dbeaver', 0.1], ['app-winscp', 0.1]];

function prng(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

/**
 * transport : { postes() → [{ nomReseau }], rapports(liste) → { commandes }, resultats(liste) }.
 */
export function createAgentEmulator({ transport, interval = 3000, seed = 20261108, log = console }) {
  const rnd = prng(seed);
  const pick = () => { const total = PROGRAMMES.reduce((n, [, w]) => n + w, 0); let x = rnd() * total; for (const [nom, w] of PROGRAMMES) { x -= w; if (x <= 0) return nom; } return PROGRAMMES[0][0]; };
  const postes = new Map();
  let timer = null;
  let running = false;
  let lastRefresh = 0;

  // Session d'un stagiaire (compte Windows fictif) ou poste seulement allumé ; les programmes viennent de la session
  const ouvrir = (p) => { p.session = rnd() < 0.8 ? UTILISATEURS[p.index % UTILISATEURS.length] : null; p.processes = new Set(p.session ? ['firefox.exe', ...(rnd() < 0.6 ? ['Code.exe'] : [])] : []); };
  const eteindre = (p) => { p.online = false; p.session = null; p.processes.clear(); };

  // Poste d'une salle fermée (simulation, shared/seed.js) : reste éteint
  const fermee = (nomReseau) => SALLES_FERMEES.some((salle) => nomReseau.startsWith(`${salle}-`));

  function emulate({ nomReseau, horsService }, index) {
    const p = { nomReseau, index, horsService, fermee: fermee(nomReseau), session: null, processes: new Set() };
    p.online = !horsService && !p.fermee && rnd() > 0.1;
    if (p.online) ouvrir(p);
    p.apps = new Set([...IMAGE, ...OPTIONS.filter(([, x]) => rnd() < x).map(([app]) => app)]);
    return p;
  }

  // Un poste dont l'unité centrale est hors service, ou d'une salle fermée, reste éteint
  async function refresh() {
    const list = await transport.postes();
    list.forEach((x, i) => {
      const p = postes.get(x.nomReseau);
      if (!p) postes.set(x.nomReseau, emulate(x, i));
      else { p.horsService = x.horsService; if (p.horsService && p.online) eteindre(p); }
    });
    for (const name of [...postes.keys()]) if (!list.some((p) => p.nomReseau === name)) postes.delete(name);
    lastRefresh = Date.now();
  }

  function execute(cmd) {
    const p = postes.get(cmd.poste);
    if (!p || !p.online) return null; // le poste exécutera la commande à son retour
    let ok = true;
    if (cmd.type === 'arret') { ok = rnd() > 0.03; if (ok) p.processes.delete(cmd.processus?.nom); }
    else if (cmd.type === 'installation') { ok = rnd() > 0.05; if (ok) p.apps.add(cmd.applicationId); }
    else if (cmd.type === 'desinstallation') p.apps.delete(cmd.applicationId);
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
      const { commandes = [] } = await transport.rapports(online.map((p) => ({ poste: p.nomReseau, session: p.session, processus: [...p.processes].map((nom) => ({ nom, compte: p.session })), applications: [...p.apps] })));
      const resultats = commandes.map(execute).filter(Boolean);
      if (resultats.length) await transport.resultats(resultats);
    } catch (error) {
      log.error?.('Postes émulés :', error.message);
    } finally { running = false; }
  }

  return {
    start() { if (!timer) { timer = setInterval(tick, interval); timer.unref?.(); tick(); } return this; },
    stop() { clearInterval(timer); timer = null; },
    tick,
    postes,
  };
}

/** Transport HTTP vers l'API d'agent d'ASTER. */
export function httpTransport({ api, token }) {
  const call = async (path, body) => {
    const response = await fetch(`${api}/api/agent${path}`, {
      method: body ? 'POST' : 'GET',
      headers: { Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new Error(`${path} : ${response.status}`);
    return response.json();
  };
  return {
    postes: async () => (await call('/postes')).postes,
    rapports: (rapports) => call('/rapports', { rapports }),
    resultats: (resultats) => call('/resultats', { resultats }),
  };
}

/** Transport direct vers le moteur (mode interface seule, sans réseau). */
export const directTransport = (repository) => ({
  postes: async () => repository.agent.postes(),
  rapports: (rapports) => repository.agent.rapports(rapports),
  resultats: (resultats) => repository.agent.resultats(resultats),
});

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const api = process.env.ASTER_API || 'http://127.0.0.1:3001';
  const token = process.env.AGENT_TOKEN || 'aster-agent-local';
  createAgentEmulator({ transport: httpTransport({ api, token }) }).start();
  setInterval(() => {}, 1 << 30); // processus maintenu actif
  console.log(`Postes émulés : rapports vers ${api}/api/agent`);
}
