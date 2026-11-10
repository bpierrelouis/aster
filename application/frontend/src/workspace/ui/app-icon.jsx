/* ==========================================================================
   Icône d'une application ou d'un processus (firefox.exe, Code.exe…) :
   logo de l'éditeur (assets/apps, sources dans SOURCES.md), sinon cercle
   barré, comme une application sans icône sur Apple.
   ========================================================================== */

const LOGOS = import.meta.glob('../assets/apps/*.svg', { eager: true, query: '?url', import: 'default' });
const logo = (file) => LOGOS[`../assets/apps/${file}.svg`];

// Nom d'exécutable ou d'application, sans « .exe », espaces ni casse → fichier du logo
const ALIASES = {
  firefox: 'firefox',
  code: 'vscode', visualstudiocode: 'vscode',
  soffice: 'libreoffice', libreoffice: 'libreoffice',
  putty: 'putty',
  steam: 'steam',
  discord: 'discord',
  spotify: 'spotify',
};

const keyOf = (name) => String(name ?? '').toLowerCase().replace(/\.exe$/, '').replace(/[^a-z0-9]/g, '');

export function AppIcon({ name, size = 28 }) {
  const src = logo(ALIASES[keyOf(name)]);
  if (src) return <img className="app-icon" src={src} width={size} height={size} alt="" aria-hidden="true" />;
  return <svg className="app-icon app-icon--none" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.6" />
    <path d="M5.64 5.64l12.72 12.72" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>;
}
