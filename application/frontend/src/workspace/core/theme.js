import { AMBIANCES } from '#shared/ambiance.js';

/** Applique l'ambiance au document : tokens (data-ambiance) et tonalité claire ou sombre (data-tone). */
export function applyAmbiance(id) {
  const a = AMBIANCES.find((x) => x.id === id) ?? AMBIANCES[0];
  document.documentElement.dataset.ambiance = a.id;
  document.documentElement.dataset.tone = a.tone;
}
