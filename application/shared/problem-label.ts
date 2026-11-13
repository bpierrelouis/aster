/** Saisie du type libre d’un signalement : français, initiale majuscule puis minuscules. */
export const PROBLEM_LABEL_HELP = 'Utilisez des lettres françaises, des chiffres, des espaces, des apostrophes ou des traits d’union.';

export function normalizeProblemLabel(input: string) {
  let invalid = false;
  const value = input.normalize('NFC').replace(/[\u00a0\u202f]/gu, ' ')
    .replace(/[^a-zàâäçéèêëîïôöùûüÿœæ0-9 '\u2019-]/giu, () => { invalid = true; return ''; })
    .trimStart().replace(/^[-'’ 0-9]+/u, () => { invalid = true; return ''; })
    .toLocaleLowerCase('fr-FR')
    .replace(/[a-zàâäçéèêëîïôöùûüÿœæ]/iu, (letter) => letter.toLocaleUpperCase('fr-FR'));
  return { value, invalid };
}
