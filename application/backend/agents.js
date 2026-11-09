/* ==========================================================================
   Émulateur de postes Windows (démonstrateur)
   Chaque poste émulé exécute des programmes utilisateur, remonte son état
   par l'API d'agent, reçoit les interventions demandées (arrêt de
   processus, installation, désinstallation, réinstallation), les exécute
   et renvoie le résultat. Seuls les postes sont émulés : ASTER traite
   leurs rapports comme ceux de postes réels.
   Lancement autonome : node backend/agents.js (ASTER_API, AGENT_TOKEN).
   ========================================================================== */

import { fileURLToPath } from 'node:url';

// Programmes utilisateur et poids de tirage (les processus système ne sont pas remontés)
const PROGRAMMES = [['firefox.exe', 50], ['Code.exe', 40], ['soffice.exe', 1.2], ['putty.exe', 0.8], ['steam.exe', 0.25], ['discord.exe', 0.25], ['spotify.exe', 0.15], ['torrent.exe', 0.1]];
const IMAGE = ['app-firefox', 'app-vscode']; // applications de l'image de référence

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

  function emulate(nomReseau, index) {
    const compte = `stagiaire.${String((index % 40) + 1).padStart(2, '0')}`;
    const online = rnd() > 0.1;
    const processes = new Set(online ? ['firefox.exe', ...(rnd() < 0.6 ? ['Code.exe'] : [])] : []);
    const apps = new Set([...IMAGE, ...(rnd() < 0.3 ? ['app-libreoffice'] : [])]);
    return { nomReseau, compte, online, processes, apps };
  }

  async function refresh() {
    const list = await transport.postes();
    list.forEach((p, i) => { if (!postes.has(p.nomReseau)) postes.set(p.nomReseau, emulate(p.nomReseau, i)); });
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
    else if (cmd.type === 'reinstallation') { p.apps = new Set(IMAGE); p.processes.clear(); }
    return { operation: cmd.operation, poste: cmd.poste, statut: ok ? 'reussie' : 'echec' };
  }

  async function tick() {
    if (running) return;
    running = true;
    try {
      if (!postes.size || Date.now() - lastRefresh > 60_000) await refresh();
      for (const p of postes.values()) {
        if (!p.online) { if (rnd() < 0.004) { p.online = true; p.processes = new Set(['firefox.exe']); } continue; }
        if (rnd() < 0.0008) { p.online = false; p.processes.clear(); continue; }
        if (rnd() < 0.015) {
          if (p.processes.size && rnd() < 0.45) p.processes.delete([...p.processes][Math.floor(rnd() * p.processes.size)]);
          else p.processes.add(pick());
        }
      }
      const online = [...postes.values()].filter((p) => p.online);
      const { commandes = [] } = await transport.rapports(online.map((p) => ({ poste: p.nomReseau, processus: [...p.processes].map((nom) => ({ nom, compte: p.compte })), applications: [...p.apps] })));
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
