import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { ACCENTS } from '#shared/ambiance.js';
import { Icon } from '../../ui/icons.jsx';
import { reduceMotion } from '../../core/dom.js';

/** Palette circulaire : souris, Tab et flèches, sans quitter le menu du compte. */
export function AppearanceColor({ value, onChange }) {
  const [expanded, setExpanded] = useState(false);
  const id = useId();
  const trigger = useRef(null);
  const wheel = useRef(null);
  const selected = ACCENTS.find((a) => a.id === value) ?? ACCENTS[0];

  // La couche native depasse le menu sans en changer les dimensions.
  const place = useCallback(() => {
    const rect = trigger.current.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    wheel.current.style.left = `${x}px`;
    wheel.current.style.top = `${y}px`;
    const radius = Math.min(66, x - 22, innerWidth - x - 22);
    wheel.current.style.setProperty('--wheel-radius', `${Math.max(32, radius)}px`);
  }, []);

  useEffect(() => {
    if (!expanded) {
      const timer = setTimeout(() => wheel.current?.hidePopover(), reduceMotion() ? 0 : 480);
      return () => clearTimeout(timer);
    }
    addEventListener('resize', place);
    addEventListener('scroll', place, true);
    return () => {
      removeEventListener('resize', place);
      removeEventListener('scroll', place, true);
    };
  }, [expanded, place]);

  function toggle() {
    if (expanded) { setExpanded(false); return; }
    place();
    wheel.current.showPopover();
    // Etat replie mesure avant l'ouverture pour declencher les transitions.
    wheel.current.getBoundingClientRect();
    setExpanded(true);
  }

  function choose(color) {
    onChange(color);
    setExpanded(false);
    trigger.current.focus();
  }

  function navigate(event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      setExpanded(false);
      trigger.current.focus();
      return;
    }
    const keys = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    const radios = [...event.currentTarget.querySelectorAll('[role="radio"]')];
    const index = radios.indexOf(document.activeElement);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? radios.length - 1
      : (index + (['ArrowLeft', 'ArrowUp'].includes(event.key) ? -1 : 1) + radios.length) % radios.length;
    radios[next].focus();
    radios[next].click();
  }

  return <div className="pop-group">
    <div className="accent-label">Couleur</div>
    <div className={`accent-picker${expanded ? ' is-open' : ''}`} onKeyDown={navigate}>
      <button ref={trigger} type="button" className="accent-trigger" style={{ '--swatch-color': selected.color }}
        aria-label="Choisir la couleur" aria-expanded={expanded} aria-controls={id}
        onClick={toggle} />
      <div ref={wheel} id={id} popover="manual" className="accent-wheel" inert={!expanded} aria-hidden={!expanded} role="radiogroup" aria-label="Couleur">
        {ACCENTS.map((a, i) => {
          const angle = i * 360 / ACCENTS.length - 90;
          return <button key={a.id} type="button" role="radio" aria-label={a.label} aria-checked={a.id === selected.id}
            tabIndex={a.id === selected.id ? 0 : -1} className="accent-option" title={a.label}
            style={{ '--swatch-color': a.color, '--angle': `${angle}deg`, '--order': i, '--reverse-order': ACCENTS.length - 1 - i }}
            onClick={() => choose(a.id)}><span>{a.id === selected.id && <Icon name="check" size={15} />}</span></button>;
        })}
      </div>
    </div>
  </div>;
}
