/* Icônes ASTER en composants React. Les tracés sont les constantes de la charte (core/icons.js). */
import { A, P } from '../core/icons.js';
import { Marianne } from './marianne.jsx';
import { OrionMark } from '../../connexion/brand.jsx';

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

/**
 * Marque de l'ambiance (shared/ambiance.js) : étoile ORION, Bleu Orion en clair et
 * blanche avec lueur bleue en sombre, entourée de petites étoiles qui scintillent
 * au survol du menu ; Marianne (Minarm) ; repère de la charte VIGIE.
 */
export function Brand({ ambiance, size = 32 }) {
  if (ambiance === 'vigie') {
    return <svg className="brand brand--vigie" viewBox="6 6 116 116" width={size} height={size} fill="none" strokeLinecap="round" aria-hidden="true">
      <circle cx="64" cy="64" r="48" stroke="#0b6173" strokeWidth="10" />
      <circle cx="64" cy="64" r="26" stroke="#77d7d0" strokeWidth="9" />
      <path d="M64 64 101 32" stroke="#f06449" strokeWidth="12" />
    </svg>;
  }
  if (ambiance === 'minarm') return <Marianne size={size} />;
  return <OrionMark className="brand brand--orion" size={size} count={8} />;
}
