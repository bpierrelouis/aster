/* Formats français */

const nf0 = new Intl.NumberFormat('fr-FR');
const nf1 = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 });
const pf = new Intl.NumberFormat('fr-FR', { style: 'percent', maximumFractionDigits: 0 });
const pf1 = new Intl.NumberFormat('fr-FR', { style: 'percent', maximumFractionDigits: 1 });
const dShort = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' });
const dLong = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
const dMed = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
const dNum = new Intl.DateTimeFormat('fr-FR');
const dTime = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeStyle: 'short' });
const dDay = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
const tClock = new Intl.DateTimeFormat('fr-FR', { timeStyle: 'medium' });
const dFull = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeStyle: 'short' });
const mShort = new Intl.DateTimeFormat('fr-FR', { month: 'short' });
const mYear = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' });

export const num = (n: number) => nf0.format(n);
/** Mot seul accordé, quand le nombre est affiché à part : accord(2, 'ajouté') → « ajoutés » */
export const accord = (n: number, one: string, many = `${one}s`) => (n > 1 ? many : one);
/** Nombre et nom accordé : plural(2, 'matériel') → « 2 matériels » ; pluriel irrégulier en dernier argument */
export const plural = (n: number, one: string, many = `${one}s`) => `${num(n)} ${accord(n, one, many)}`;
export const dec = (n: number) => nf1.format(n);
export const pct = (n: number) => pf.format(n);
export const pct1 = (n: number) => pf1.format(n);
export const dateShort = (t: number | Date) => dShort.format(t);
export const dateLong = (t: number | Date) => dLong.format(t);
export const dateMed = (t: number | Date) => dMed.format(t);
/** « 08/11/2026 » */
export const dateNum = (t: number | Date) => dNum.format(t);
/** « 08/11/2026 20:15 » */
export const dateTime = (t: number | Date) => dTime.format(t);
/** « dimanche 8 novembre » */
export const dateDay = (t: number | Date) => dDay.format(t);
/** « 20:15:42 » */
export const clock = (t: number | Date) => tClock.format(t);
/** « 8 novembre 2026 à 20:15 » */
export const dateFull = (t: number | Date) => dFull.format(t);
/** « nov. » */
export const monthShort = (t: number | Date) => mShort.format(t);
/** « novembre 2026 » */
export const monthYear = (t: number | Date) => mYear.format(t);

const H = 3600e3, D = 24 * H;

/** Durée relative compacte : « 12 min », « 3 h », « 2 j », « 3 sem » */
export function ago(t: number, now = Date.now()) {
  const d = Math.max(0, now - t);
  if (d < H) return `${Math.max(1, Math.round(d / 60e3))} min`;
  if (d < D) return `${Math.round(d / H)} h`;
  if (d < 14 * D) return `${Math.round(d / D)} j`;
  return `${Math.round(d / (7 * D))} sem`;
}

export const DAY = D;
export const HOUR = H;

/** Valeur d'un champ de date (AAAA-MM-JJ), en heure locale */
export const inputDate = (t: number | null | undefined) => {
  if (!t) return '';
  const d = new Date(t);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
/** Horodatage d'un champ de date : midi local, à l'abri des changements d'heure */
export const fromInputDate = (v: string) => (v ? new Date(`${v}T12:00:00`).getTime() : null);
