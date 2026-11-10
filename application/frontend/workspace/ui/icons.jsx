/* Icônes ASTER en composants React. Les tracés sont les constantes de la charte (core/icons.js). */
import { A, P } from '../core/icons.js';

export function Icon({ name, size = 24, label, className = '', stroke = 2 }) {
  const aster = A[name];
  const vb = aster ? 28 : 24;
  const a11y = label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true };
  return <svg className={`ico ${className}`.trim()} viewBox={`0 0 ${vb} ${vb}`} width={size} height={size} fill="none" stroke="currentColor"
    strokeWidth={(stroke * (vb / 24)).toFixed(2)} strokeLinecap="round" strokeLinejoin="round" {...a11y}
    dangerouslySetInnerHTML={{ __html: aster ?? P[name] ?? P.other }} />;
}

/** Tuile colorée : size s | m | l | xl */
export function Tile({ name, color, size = 'm', className = '' }) {
  return <span className={`tile tile--${size} ${className}`.trim()} style={{ '--c': color }}><Icon name={name} /></span>;
}

/** Fleur ASTER : 8 pétales iris, cœur doré */
export function Flower({ size = 32, petal = 'var(--iris)', heart = 'var(--coeur)', label }) {
  const a11y = label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true };
  return <svg className="flower" viewBox="0 0 112 112" width={size} height={size} {...a11y}>
    <g style={{ fill: petal }}>{Array.from({ length: 8 }, (_, i) => <ellipse key={i} cx="56" cy="24" rx="7" ry="19" transform={`rotate(${i * 45} 56 56)`} />)}</g>
    <circle cx="56" cy="56" r="10" style={{ fill: heart }} />
  </svg>;
}

/**
 * Marque de l'ambiance (core/ambiance.js) : fleur ASTER iris (Clair) ou dorée
 * (Sombre), étoile de la charte ORION, repère de la charte VIGIE.
 */
export function Brand({ ambiance, size = 32 }) {
  if (ambiance === 'orion') {
    return <svg className="brand brand--orion" viewBox="0 0 40 40" width={size} height={size} aria-hidden="true">
      <path fill="#fff" d="M20 0C21.5 13 27 18.5 40 20C27 21.5 21.5 27 20 40C18.5 27 13 21.5 0 20C13 18.5 18.5 13 20 0Z" />
    </svg>;
  }
  if (ambiance === 'vigie') {
    return <svg className="brand brand--vigie" viewBox="6 6 116 116" width={size} height={size} fill="none" strokeLinecap="round" aria-hidden="true">
      <circle cx="64" cy="64" r="48" stroke="#0b6173" strokeWidth="10" />
      <circle cx="64" cy="64" r="26" stroke="#77d7d0" strokeWidth="9" />
      <path d="M64 64 101 32" stroke="#f06449" strokeWidth="12" />
    </svg>;
  }
  return ambiance === 'encre' ? <Flower size={size} petal="#d6aa4f" heart="#f4f1ea" /> : <Flower size={size} />;
}
