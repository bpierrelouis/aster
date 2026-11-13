import { AMBIANCES, ACCENTS } from '#shared/ambiance.ts';

// Tonalité « auto » (ambiances Orion et Minarm) : celle forcée par le compte, sinon celle du système, suivie quand elle change
const systemDark = matchMedia('(prefers-color-scheme: dark)');
let current = AMBIANCES[0];
let forced = 'auto';
let selectedAccent = ACCENTS[0].id;
let transition: ViewTransition | undefined;
let change = 0;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
export const systemTone = () => (systemDark.matches ? 'dark' : 'light');
export const subscribeSystemTone = (listener: () => void) => {
  systemDark.addEventListener('change', listener);
  return () => systemDark.removeEventListener('change', listener);
};
/** Tonalité d'une ambiance qui suit la machine, compte tenu du choix forcé */
export const autoTone = (tone: string) => (tone === 'light' || tone === 'dark' ? tone : systemTone());
const toneOf = (a: (typeof AMBIANCES)[number]) => (a.tone === 'auto' ? autoTone(forced) : a.tone);
systemDark.addEventListener('change', () => applyAmbiance(current.id, forced, selectedAccent));

/** Applique l'ambiance au document : tokens (data-ambiance) et tonalité claire ou sombre (data-tone). */
export function applyAmbiance(id: string, tone = 'auto', accent = 'blue') {
  current = AMBIANCES.find((x) => x.id === id) ?? AMBIANCES[0];
  forced = tone;
  const color = ACCENTS.find((x) => x.id === accent) ?? ACCENTS[0];
  selectedAccent = color.id;
  const root = document.documentElement;
  const nextTone = toneOf(current);
  const version = ++change;
  transition?.skipTransition();
  if (root.dataset.ambiance === current.id && root.dataset.tone === nextTone && root.dataset.accent === color.id) return;
  const ambiance = current.id;
  const update = () => {
    // Une sélection plus récente peut remplacer celle dont la capture est encore en cours.
    if (version !== change) return;
    root.dataset.accent = color.id;
    root.style.setProperty('--chosen-accent', color.color);
    root.dataset.ambiance = ambiance;
    root.dataset.tone = nextTone;
  };
  // Premier affichage, mouvement réduit et anciens navigateurs : application immédiate.
  if (!root.dataset.ambiance || reducedMotion.matches || !document.startViewTransition) {
    update();
    return;
  }
  transition = document.startViewTransition(() => {
    // Capturer la palette finale plutôt que les couleurs intermédiaires des contrôles.
    root.classList.add('ambiance-capture');
    update();
    root.getBoundingClientRect();
    root.classList.remove('ambiance-capture');
  });
  // Une nouvelle sélection peut interrompre la capture sans que ce soit une erreur.
  void transition.ready.catch(() => {});
}
