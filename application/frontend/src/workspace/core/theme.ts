import { AMBIANCES, ACCENTS } from '#shared/ambiance.ts';

// Tonalité « auto » (ambiances Orion et Minarm) : celle forcée par le compte, sinon celle du système, suivie quand elle change
const systemDark = matchMedia('(prefers-color-scheme: dark)');
let current = AMBIANCES[0];
let forced = 'auto';
export const systemTone = () => (systemDark.matches ? 'dark' : 'light');
export const subscribeSystemTone = (listener: () => void) => {
  systemDark.addEventListener('change', listener);
  return () => systemDark.removeEventListener('change', listener);
};
/** Tonalité d'une ambiance qui suit la machine, compte tenu du choix forcé */
export const autoTone = (tone: string) => (tone === 'light' || tone === 'dark' ? tone : systemTone());
const toneOf = (a: (typeof AMBIANCES)[number]) => (a.tone === 'auto' ? autoTone(forced) : a.tone);
systemDark.addEventListener('change', () => { document.documentElement.dataset.tone = toneOf(current); });

/** Applique l'ambiance au document : tokens (data-ambiance) et tonalité claire ou sombre (data-tone). */
export function applyAmbiance(id: string, tone = 'auto', accent = 'blue') {
  current = AMBIANCES.find((x) => x.id === id) ?? AMBIANCES[0];
  forced = tone;
  const color = ACCENTS.find((x) => x.id === accent) ?? ACCENTS[0];
  document.documentElement.dataset.accent = color.id;
  document.documentElement.style.setProperty('--chosen-accent', color.color);
  document.documentElement.dataset.ambiance = current.id;
  document.documentElement.dataset.tone = toneOf(current);
}
