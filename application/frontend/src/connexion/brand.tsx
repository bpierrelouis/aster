/* Marques : symbole MindefConnect (bouton de connexion) et marque ORION (charte ORION) : étoile, étoile scintillante et
   logotype, communs aux pages publiques et à l'espace de travail. Styles dans connexion.css, chargé pour toute l'application. */
import { useState } from 'react';
import type { CSSProperties } from 'react';
import { ORION_STAR } from '#shared/ambiance.ts';

export function MinDefSymbol() {
  const nodes = [[30, 12], [70, 12], [90, 50], [70, 88], [30, 88], [10, 50]];
  return <svg className="mindef-symbol" viewBox="0 0 100 100" aria-hidden="true">
    {/* Réseau : arêtes de l'hexagone et rayons vers le cercle central */}
    <g stroke="#007ac1" strokeWidth="2.5" strokeLinecap="round">
      {nodes.map(([x, y], i) => { const [nx, ny] = nodes[(i + 1) % 6]; return <line key={`e${i}`} x1={x} y1={y} x2={nx} y2={ny} />; })}
      {nodes.map(([x, y]) => <line key={`r${x}-${y}`} x1={x} y1={y} x2={50 + (x - 50) * 0.62} y2={50 + (y - 50) * 0.62} />)}
    </g>
    <circle cx="50" cy="50" r="25" fill="#4caf50" />
    {nodes.map(([cx, cy]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="6" fill="#01a9f4" />)}
    <path d="M48 47a10 10 0 1 1 8 8l-18 18-7-7 5-5 4 2 3-3-2-4Z" fill="#01a9f4" stroke="#000091" strokeWidth="3" strokeLinejoin="round" />
    <circle cx="57" cy="44" r="3" fill="#000091" />
  </svg>;
}

/** Étoile ORION à quatre branches, de la taille du texte (1em) : Bleu Orion en clair, blanche avec lueur bleue en sombre. */
export function OrionStar({ className = '' }: { className?: string }) {
  return <svg className={`orion-star ${className}`.trim()} viewBox="0 0 40 40" aria-hidden="true"><path d={ORION_STAR} /></svg>;
}

/** Petites étoiles tirées au hasard : direction et distance au centre (en tailles d'étoile), taille, durée et phase du scintillement. */
const scatter = (count: number) => Array.from({ length: count }, () => {
  const angle = Math.random() * 2 * Math.PI;
  const distance = 0.75 + Math.random() * 0.75;
  return {
    '--x': (Math.cos(angle) * distance).toFixed(3),
    '--y': (Math.sin(angle) * distance).toFixed(3),
    '--s': (0.4 + Math.random() * 0.6).toFixed(2),
    '--t': `${(1.8 + Math.random() * 2.4).toFixed(2)}s`,
    '--d': `${(-Math.random() * 4).toFixed(2)}s`, // délai négatif : chaque étoile part d'un moment différent de son cycle
  } as CSSProperties;
});

/**
 * Étoile ORION entourée de petites étoiles qui scintillent, tirées une fois au montage (rien si le système demande de
 * réduire les animations). Taille : `size` en pixels, sinon celle du texte.
 */
export function OrionMark({ className = '', size, count = 12 }: { className?: string; size?: number; count?: number }) {
  const [stars] = useState(() => scatter(count));
  return <span className={`orion-mark ${className}`.trim()} style={size ? { fontSize: size } : undefined} aria-hidden="true">
    {stars.map((style, i) => <svg key={i} className="twinkle" viewBox="0 0 40 40" style={style}><path d={ORION_STAR} /></svg>)}
    <OrionStar />
  </span>;
}

/** Logotype ORION : capitales larges espacées, étoile toujours au-dessus du « I » ; `animated` : étoiles qui scintillent autour. */
export function OrionLogo({ animated = false }: { animated?: boolean }) {
  return <span className="orion-logo" role="img" aria-label="ORION">
    <span>O</span><span>R</span><span className="orion-logo-i">I{animated ? <OrionMark count={14} /> : <OrionStar />}</span><span>O</span><span>N</span>
  </span>;
}
