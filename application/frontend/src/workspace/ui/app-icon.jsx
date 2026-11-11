/* ==========================================================================
   Icône d'une application ou d'un processus (firefox.exe, Code.exe…) :
   logo de l'éditeur (assets/apps, sources dans SOURCES.md) d'après le
   référentiel des logiciels connus (shared/operations-data.js), sinon
   cercle barré, comme une application sans icône sur Apple.
   ========================================================================== */

import { logiciel } from '#shared/operations-data.js';

const LOGOS = import.meta.glob('../assets/apps/*.svg', { eager: true, query: '?url', import: 'default' });
const logo = (file) => LOGOS[`../assets/apps/${file}.svg`];
// Logos noirs ou très sombres : posés sur un disque blanc en ambiance sombre (styles/base.css)
const DARK = new Set(['steam', 'eclipse', 'tor']);

export function AppIcon({ name, size = 28 }) {
  const file = logiciel(name)?.logo;
  const src = logo(file);
  if (src) return <img className={`app-icon${DARK.has(file) ? ' app-icon--dark' : ''}`} src={src} width={size} height={size} alt="" aria-hidden="true" />;
  return <svg className="app-icon app-icon--none" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.6" />
    <path d="M5.64 5.64l12.72 12.72" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>;
}
