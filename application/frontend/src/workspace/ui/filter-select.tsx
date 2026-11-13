import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import type { ComponentProps, KeyboardEvent } from 'react';
import { matcher } from '../core/search.ts';
import { Icon } from './icons.tsx';
import '../styles/filter-select.css';

export interface FilterOption {
  value: string;
  label: string;
  group?: string;
  disabled?: boolean;
}

export type FilterSelectProps = Omit<ComponentProps<'select'>, 'children' | 'defaultValue' | 'value' | 'aria-label'> & {
  options: FilterOption[];
  'aria-label': string;
  value?: string;
  defaultValue?: string;
};

/** Un seul choix visuel ; le select caché conserve le contrat des formulaires et leur validation native. */
export function FilterSelect({ options, value, defaultValue, onChange, id, disabled, required, 'aria-label': label,
  'aria-describedby': describedBy, ...props }: FilterSelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const listId = `${selectId}-list`;
  const trigger = useRef<HTMLButtonElement>(null);
  const native = useRef<HTMLSelectElement>(null);
  const popup = useRef<HTMLDivElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const typing = useRef({ text: '', at: 0 });
  const downward = useRef<boolean | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState<string | null>(null);
  const [invalid, setInvalid] = useState(false);
  const [localValue, setLocalValue] = useState(() => defaultValue ?? options.find((option) => !option.disabled)?.value ?? '');
  const selected = value ?? localValue;
  const current = options.find((option) => option.value === selected);
  const searchable = options.length > 8;
  const matches = matcher(query);
  const visible = options.filter((option) => matches(option.label, option.group));
  const optionId = (option: FilterOption) => `${listId}-${options.indexOf(option)}`;
  const groups: { label?: string; options: FilterOption[] }[] = [];
  for (const option of visible) {
    const group = groups.find((item) => item.label === option.group);
    if (group) group.options.push(option);
    else groups.push({ label: option.group, options: [option] });
  }
  groups.sort((a, b) => !a.label ? -1 : !b.label ? 1 : a.label.localeCompare(b.label, 'fr', { numeric: true }));

  const enabled = groups.flatMap((group) => group.options).filter((option) => !option.disabled);
  const activeOption = enabled.find((option) => option.value === active) ?? enabled[0];

  function place() {
    if (!popup.current || !trigger.current) return;
    const panel = popup.current;
    const rect = trigger.current.getBoundingClientRect();
    const width = Math.min(Math.max(rect.width, 240), innerWidth - 24);
    panel.style.width = `${width}px`;
    const below = innerHeight - rect.bottom - 20;
    const above = rect.top - 20;
    const down = downward.current ?? (downward.current = below >= Math.min(panel.scrollHeight, 320) || below >= above);
    const height = Math.max(0, Math.min(360, down ? below : above));
    panel.style.maxHeight = `${height}px`;
    panel.style.left = `${Math.max(12, Math.min(rect.left, innerWidth - width - 12))}px`;
    panel.style.top = `${down ? rect.bottom + 8 : Math.max(12, rect.top - 8 - panel.offsetHeight)}px`;
  }
  function close(restore = true) {
    popup.current?.hidePopover();
    setExpanded(false);
    if (restore) trigger.current?.focus({ preventScroll: true });
  }
  function open(edge?: 'first' | 'last') {
    if (disabled) return;
    setQuery('');
    downward.current = null;
    const available = options.filter((option) => !option.disabled).sort((a, b) => (a.group ?? '').localeCompare(b.group ?? '', 'fr', { numeric: true }));
    setActive((edge === 'last' ? available.at(-1) : edge === 'first' ? available[0] : available.find((option) => option.value === selected) ?? available[0])?.value ?? null);
    popup.current!.showPopover();
    setExpanded(true);

  }
  function choose(option: FilterOption) {
    if (option.disabled) return;
    close();
    native.current!.value = option.value;
    native.current!.dispatchEvent(new Event('change', { bubbles: true }));
  }
  function navigate(event: KeyboardEvent<HTMLElement>) {
    if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(); return; }
    if (event.key === 'Tab') { requestAnimationFrame(() => close(false)); return; }
    if (event.target === search.current && (event.key === 'Home' || event.key === 'End' || event.ctrlKey || event.metaKey)) return;
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      const index = enabled.findIndex((option) => option.value === activeOption?.value);
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? enabled.length - 1
        : (index + (event.key === 'ArrowDown' ? 1 : -1) + enabled.length) % enabled.length;
      setActive(enabled[next]?.value ?? null);
    } else if (event.key === 'Enter' || (event.key === ' ' && event.target !== search.current)) {
      event.preventDefault();
      if (activeOption) choose(activeOption);
    } else if (event.key.length === 1 && event.target !== search.current && !event.ctrlKey && !event.metaKey && !event.altKey) {
      typing.current = { text: Date.now() - typing.current.at < 700 ? typing.current.text + event.key : event.key, at: Date.now() };
      setActive(enabled.find((option) => matcher(typing.current.text)(option.label))?.value ?? activeOption?.value ?? null);
    }
  }
  useLayoutEffect(() => {
    if (!expanded) return;
    place();
    const box = list.current;
    const row = box?.querySelector<HTMLElement>('.is-active');
    if (box && row) {
      const parent = box.getBoundingClientRect();
      const child = row.getBoundingClientRect();
      if (child.top < parent.top) box.scrollTop += child.top - parent.top;
      else if (child.bottom > parent.bottom) box.scrollTop += child.bottom - parent.bottom;
    }
  });
  useLayoutEffect(() => {
    if (expanded) (searchable ? search.current : list.current)?.focus({ preventScroll: true });
  }, [expanded, searchable]);
  useEffect(() => {
    if (!expanded) return;
    const resize = () => { downward.current = null; place(); };
    addEventListener('resize', resize);
    addEventListener('scroll', place, true);
    return () => { removeEventListener('resize', resize); removeEventListener('scroll', place, true); };
  }, [expanded]);

  return <div className="filter-select">
    <select {...props} ref={native} id={`${selectId}-value`} className="filter-select-value" tabIndex={-1} aria-hidden="true"
      disabled={disabled} required={required} value={selected}
      onInvalid={(event) => { event.preventDefault(); setInvalid(true); open(); }}
      onChange={(event) => { if (value === undefined) setLocalValue(event.target.value); setInvalid(false); onChange?.(event); }}>
      {options.map((option) => <option key={option.value} value={option.value} disabled={option.disabled}>{option.label}</option>)}
    </select>
    <button ref={trigger} id={selectId} type="button" className="filter-select-trigger" role="combobox" disabled={disabled}
      aria-label={label} aria-haspopup="listbox" aria-expanded={expanded} aria-controls={listId} aria-required={required}
      aria-invalid={invalid || undefined} aria-describedby={[describedBy, invalid ? `${selectId}-error` : null].filter(Boolean).join(' ') || undefined}
      onClick={() => expanded ? close() : open()}
      onKeyDown={(event) => { if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); open(event.key === 'ArrowUp' ? 'last' : undefined); } }}>
      <span>{current?.label ?? 'Choisir…'}</span><Icon name="chevD" size={18} />
    </button>
    <div ref={popup} popover="auto" className="filter-select-popup" onKeyDown={navigate}
      onToggle={() => { if (!popup.current?.matches(':popover-open')) setExpanded(false); }}>
      {searchable && <div className="filter-select-search"><Icon name="recherche" size={17} />
        <input ref={search} type="search" value={query} autoComplete="off" placeholder="Rechercher…"
          aria-label={`Rechercher dans : ${label}`} aria-controls={listId} aria-activedescendant={activeOption ? optionId(activeOption) : undefined}
          onChange={(event) => { setQuery(event.target.value); setActive(null); }} />
      </div>}
      <div ref={list} id={listId} className="filter-select-list" role="listbox" aria-label={label} tabIndex={-1}
        aria-activedescendant={activeOption ? optionId(activeOption) : undefined}>
        {groups.map((group, index) => <div key={index} role="group" aria-label={group.label}>
          {group.label && <div className="filter-select-group" aria-hidden="true">{group.label}</div>}
          {group.options.map((option) => <button key={option.value} id={optionId(option)} type="button" role="option"
            className={`filter-select-option${activeOption?.value === option.value ? ' is-active' : ''}`} tabIndex={-1}
            aria-selected={option.value === selected} disabled={option.disabled} onClick={() => choose(option)}
            onPointerMove={() => { if (!option.disabled) setActive(option.value); }}>
            <span>{option.label}</span>{option.value === selected && <Icon name="check" size={17} />}
          </button>)}
        </div>)}
      </div>
      <div className="filter-select-count" role="status">{visible.length ? `${visible.length} choix disponible${visible.length > 1 ? 's' : ''}` : 'Aucun résultat'}</div>
    </div>
    {invalid && <span id={`${selectId}-error`} className="field-hint form-error" role="alert">Choisissez une valeur.</span>}
  </div>;
}
