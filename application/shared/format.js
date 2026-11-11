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

export const num = (n) => nf0.format(n);
/** Nombre et nom accordé : plural(2, 'matériel') → « 2 matériels » ; pluriel irrégulier en dernier argument */
export const plural = (n, one, many = `${one}s`) => `${num(n)} ${n > 1 ? many : one}`;
export const dec = (n) => nf1.format(n);
export const pct = (n) => pf.format(n);
export const pct1 = (n) => pf1.format(n);
export const dateShort = (t) => dShort.format(t);
export const dateLong = (t) => dLong.format(t);
export const dateMed = (t) => dMed.format(t);
/** « 08/11/2026 » */
export const dateNum = (t) => dNum.format(t);
/** « 08/11/2026 20:15 » */
export const dateTime = (t) => dTime.format(t);
/** « dimanche 8 novembre » */
export const dateDay = (t) => dDay.format(t);
/** « 20:15:42 » */
export const clock = (t) => tClock.format(t);
/** « 8 novembre 2026 à 20:15 » */
export const dateFull = (t) => dFull.format(t);
/** « nov. » */
export const monthShort = (t) => mShort.format(t);
/** « novembre 2026 » */
export const monthYear = (t) => mYear.format(t);

const H = 3600e3, D = 24 * H;

/** Durée relative compacte : « 12 min », « 3 h », « 2 j », « 3 sem » */
export function ago(t, now = Date.now()) {
  const d = Math.max(0, now - t);
  if (d < H) return `${Math.max(1, Math.round(d / 60e3))} min`;
  if (d < D) return `${Math.round(d / H)} h`;
  if (d < 14 * D) return `${Math.round(d / D)} j`;
  return `${Math.round(d / (7 * D))} sem`;
}

/** Durée en jours, ex. « 2,4 j » */
export const durDays = (ms) => `${nf1.format(ms / D)} j`;

export const DAY = D;
export const HOUR = H;
