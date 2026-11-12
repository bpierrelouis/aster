import { AMBIANCES } from '#shared/ambiance.js';

// Tonalité « auto » (ambiances Orion et Minarm) : celle forcée par le compte, sinon celle du système, suivie quand elle change
const systemDark = matchMedia('(prefers-color-scheme: dark)');
let current = AMBIANCES[0];
let forced = 'auto';
export const systemTone = () => (systemDark.matches ? 'dark' : 'light');
/** Tonalité d'une ambiance qui suit la machine, compte tenu du choix forcé */
export const autoTone = (tone) => (tone === 'light' || tone === 'dark' ? tone : systemTone());
const toneOf = (a) => (a.tone === 'auto' ? autoTone(forced) : a.tone);
systemDark.addEventListener('change', () => { document.documentElement.dataset.tone = toneOf(current); });

/** Applique l'ambiance au document : tokens (data-ambiance) et tonalité claire ou sombre (data-tone). */
export function applyAmbiance(id, tone = 'auto') {
  current = AMBIANCES.find((x) => x.id === id) ?? AMBIANCES[0];
  forced = tone;
  document.documentElement.dataset.ambiance = current.id;
  document.documentElement.dataset.tone = toneOf(current);
}
