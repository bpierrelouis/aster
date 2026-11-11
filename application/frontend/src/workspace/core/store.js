import { defaultLayouts } from '#shared/seed.js';

const subs = new Set();
let state;
let committed;
let queue = Promise.resolve();
let generation = 0;
let lastError = null;
let pending = 0;
// Données comparées à la réponse du serveur (hors compteurs locaux de rendu)
const serverFields = (s) => JSON.stringify({ ...s, rev: 0, revision: 0 });
// version : change à chaque notification, pour que React détecte les mutations en place
let version = 0;
const emit = (topic) => { version++; for (const fn of [...subs]) fn(topic); };
// Reprend un état du serveur ; rev avance toujours, pour que les calculs mémorisés (core/selectors.js) soient refaits
const adopt = (data, topic) => { state = { ...structuredClone(data), rev: (state.rev || 0) + 1 }; emit(topic); };

async function request(options, path = '') {
  const response = await fetch(`/api/workspace${path}`, options);
  if (response.status === 304) return null; // aucune modification depuis la dernière lecture
  const body = await response.json().catch(() => ({}));
  // Session absente ou expirée : retour à la page de connexion
  if (response.status === 401) { location.replace('/'); throw Object.assign(new Error(body.error || 'Connexion nécessaire.'), { status: 401 }); }
  if (!response.ok) throw Object.assign(new Error(body.error || 'Votre espace est momentanément indisponible.'), { status: response.status });
  return body;
}

export const ready = request().then((data) => { state = data; committed = structuredClone(data); });

/* Synchronisation : les modifications des autres utilisateurs et des postes sont reprises
   régulièrement, uniquement quand aucune écriture locale n'est en attente. */
const SYNC_INTERVAL = 4000;
let etag = null;
async function sync() {
  if (!state || pending || document.hidden) return;
  const batch = generation;
  try {
    const response = await fetch('/api/workspace', { headers: etag ? { 'If-None-Match': etag } : {} });
    if (response.status === 401) { location.replace('/'); return; }
    if (response.status === 304 || !response.ok) return;
    etag = response.headers.get('ETag');
    const data = await response.json();
    if (pending || batch !== generation || data.revision <= committed.revision) return;
    committed = data;
    adopt(data, 'remote');
  } catch { /* nouvelle tentative au prochain intervalle */ }
}
ready.then(() => { setInterval(sync, SYNC_INTERVAL); document.addEventListener('visibilitychange', () => { if (!document.hidden) sync(); }); }, () => {});

export const store = {
  get state() { return state; },
  get version() { return version; },
  subscribe(fn) { subs.add(fn); return () => subs.delete(fn); },
  update(topic, mutator) {
    if (!state) throw new Error('Espace en cours de chargement.');
    const before = structuredClone(state);
    try { mutator(state); } catch (error) { state = before; throw error; }
    if (['data', 'ecole'].includes(topic)) state.rev = (state.rev || 0) + 1;
    const snapshot = structuredClone(state);
    const batch = generation;
    lastError = null;
    emit(topic);
    pending++;
    queue = queue.then(async () => {
      pending--;
      if (batch !== generation) return;
      try {
        const data = await request({ method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ baseRevision: committed.revision, state: snapshot }) });
        committed = data;
        state.revision = data.revision;
        // Valeurs attribuées par le serveur (identifiants ASTER, numéros de remontée) : reprises si aucune écriture n'attend
        if (!pending && serverFields(data) !== serverFields(state)) adopt(data, 'data');
      } catch (error) {
        generation++;
        lastError = error;
        adopt(committed, 'all');
        window.dispatchEvent(new CustomEvent('aster:save-error', { detail: error.message }));
      }
    });
    return queue;
  },
  async flush() { await queue; if (lastError) throw lastError; },
  /** Opération du serveur (path sous /api/workspace, ex. /import) après les écritures en cours ; l'état renvoyé (state) est repris */
  async call(path, body) {
    await this.flush();
    const data = await request({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }, path);
    if (data?.state) {
      committed = data.state;
      adopt(data.state, 'data');
    }
    return data;
  },
  resetLayout(board, roleId = state.role) { return this.update('layout', (s) => { s.layouts[roleId][board] = defaultLayouts()[roleId][board]; }); },
};

/** Compte connecté, tel que fourni par le serveur. */
export const me = () => state.moi;
export const currentEcole = () => state.role === 'superadmin' ? state.ecoleId : state.moi.ecoleId;
