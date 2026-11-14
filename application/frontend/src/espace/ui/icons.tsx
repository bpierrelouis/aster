/* Icônes ORION en composants React. Les tracés sont les constantes de la charte (core/icons.ts). */
import { createElement } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { A, P } from '../core/icons.ts';
import { Marianne } from './marianne.tsx';
import { OrionMark } from '../../connexion/brand.tsx';

// Tracés indexés par nom : les noms d'icônes viennent des référentiels (chaînes libres)
const ORION: Partial<Record<string, string>> = A;
const PATHS: Partial<Record<string, string>> = P;

/* Les tracés sont des formes SVG simples (<path …/>, <rect …/>, <circle …/>) : chacune devient un élément React, une fois par
   icône. Attributs : class → className, noms à tiret en camelCase (stroke-opacity → strokeOpacity). */
const SHAPE = /<(\w+)([^>]*)\/>/g;
const ATTR = /([\w-]+)="([^"]*)"/g;
const prop = (name: string) => (name === 'class' ? 'className' : name.replace(/-(\w)/g, (_, c: string) => c.toUpperCase()));
const shapes = new Map<string, ReactNode[]>();
function shapesOf(markup: string) {
  if (!shapes.has(markup)) shapes.set(markup, [...markup.matchAll(SHAPE)].map(([, tag, attrs], i) =>
    createElement(tag, { key: i, ...Object.fromEntries([...attrs.matchAll(ATTR)].map(([, k, v]) => [prop(k), v])) })));
  return shapes.get(markup)!;
}

export function Icon({ name, size = 24, label, className = '', stroke = 2 }: { name: string; size?: number; label?: string; className?: string; stroke?: number }) {
  const orion = ORION[name];
  const vb = orion ? 28 : 24;
  const a11y = label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true };
  return <svg className={`ico ${className}`.trim()} viewBox={`0 0 ${vb} ${vb}`} width={size} height={size} fill="none" stroke="currentColor"
    strokeWidth={(stroke * (vb / 24)).toFixed(2)} strokeLinecap="round" strokeLinejoin="round" {...a11y}>
    {shapesOf(orion ?? PATHS[name] ?? P.other)}
  </svg>;
}

export type TileSize = 's' | 'm' | 'l' | 'xl';

/** Tuile colorée : size s | m | l | xl */
export function Tile({ name, color, size = 'm', className = '' }: { name: string; color: string; size?: TileSize; className?: string }) {
  return <span className={`tile tile--${size} ${className}`.trim()} style={{ '--c': color } as CSSProperties}><Icon name={name} /></span>;
}

/**
 * Marque de l'ambiance (shared/ambiance.ts) : étoile ORION, Bleu Orion en clair et
 * blanche avec lueur bleue en sombre, entourée de petites étoiles qui scintillent
 * au survol du menu ; Marianne (Minarm).
 */
export function Brand({ ambiance, size = 32 }: { ambiance: string; size?: number }) {
  if (ambiance === 'minarm') return <Marianne size={size} />;
  return <OrionMark className="brand brand--orion" size={size} count={8} />;
}
