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
