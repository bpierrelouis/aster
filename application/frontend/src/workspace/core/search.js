/* Recherche insensible à la casse, aux accents et aux espaces : chaque mot cherché figure dans l'un des textes
   (Supervision, Administration › Interventions). */

const fold = (text) => String(text ?? '').normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

export function matcher(query) {
  const words = fold(query).split(/\s+/).filter(Boolean);
  return (...texts) => { const t = fold(texts.join(' ')); return words.every((w) => t.includes(w)); };
}
