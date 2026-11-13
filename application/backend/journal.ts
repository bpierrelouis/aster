/* ==========================================================================
   Journal applicatif : une ligne par événement, « NIVEAU événement clé=valeur… ».
   info sur la sortie standard, warn et error sur la sortie d'erreur ; sur les VM,
   le pilote syslog de Docker les transmet à Logstash (horodatage, hôte, conteneur).
   Jamais de secret, de jeton ni de contenu de requête dans un journal.
   ========================================================================== */

type Champs = Record<string, string | number | boolean | null | undefined>;

const valeur = (v: string | number | boolean | null) => {
  const texte = String(v).replace(/[\r\n]+/g, ' ');
  return texte === '' || /[\s"=]/.test(texte) ? JSON.stringify(texte) : texte;
};

function ecrire(niveau: 'INFO' | 'WARN' | 'ERROR', evenement: string, champs: Champs = {}) {
  const ligne = [niveau, evenement, ...Object.entries(champs).filter(([, v]) => v !== undefined).map(([k, v]) => `${k}=${valeur(v!)}`)].join(' ');
  (niveau === 'INFO' ? process.stdout : process.stderr).write(`${ligne}\n`);
}

/** Message d'une erreur, sans trace de pile */
export const raison = (error: unknown) => {
  const e = error as NodeJS.ErrnoException;
  return [e?.code, e?.message || e?.name || String(error)].filter(Boolean).join(' ');
};

export const journal = {
  info: (evenement: string, champs?: Champs) => ecrire('INFO', evenement, champs),
  warn: (evenement: string, champs?: Champs) => ecrire('WARN', evenement, champs),
  error: (evenement: string, champs?: Champs) => ecrire('ERROR', evenement, champs),
};
