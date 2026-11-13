import { useId, useState } from 'react';
import type { ComponentProps } from 'react';
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

/** Liste native : le filtre réduit les choix sans modifier la sélection ni les données du formulaire. */
export function FilterSelect({ options, value, defaultValue, onChange, id, disabled, 'aria-label': label,
  'aria-describedby': describedBy, ...props }: FilterSelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const countId = `${selectId}-count`;
  const [query, setQuery] = useState('');
  const [localValue, setLocalValue] = useState(() => defaultValue ?? options.find((option) => !option.disabled)?.value ?? '');
  const selected = value ?? localValue;
  const searchable = options.length > 8;
  const matches = matcher(searchable ? query : '');
  const visible = options.filter((option) => matches(option.label, option.group));
  const current = options.find((option) => option.value === selected);
  const hiddenCurrent = current && !visible.some((option) => option.value === selected);
  const groups: { label?: string; options: FilterOption[] }[] = [];
  for (const option of visible) {
    const group = groups.find((item) => item.label === option.group);
    if (group) group.options.push(option);
    else groups.push({ label: option.group, options: [option] });
  }
  groups.sort((a, b) => !a.label ? -1 : !b.label ? 1 : a.label.localeCompare(b.label, 'fr', { numeric: true }));
  const renderOption = (option: FilterOption) => <option key={option.value} value={option.value} disabled={option.disabled}>{option.label}</option>;

  return <div className="filter-select">
    {searchable && <div className="filter-select-search">
      <Icon name="recherche" size={16} />
      <input type="search" value={query} disabled={disabled} autoComplete="off" placeholder="Filtrer la liste…"
        aria-label={`Rechercher dans : ${label}`} aria-controls={selectId}
        onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') event.preventDefault(); }} />
    </div>}
    <select {...props} id={selectId} disabled={disabled} value={selected} aria-label={label}
      aria-describedby={[describedBy, searchable ? countId : null].filter(Boolean).join(' ') || undefined}
      onChange={(event) => { if (value === undefined) setLocalValue(event.target.value); onChange?.(event); }}>
      {hiddenCurrent && <option value={current.value} disabled={current.disabled} hidden>{current.label}</option>}
      {groups.map((group, index) => group.label
        ? <optgroup key={index} label={group.label}>{group.options.map(renderOption)}</optgroup>
        : group.options.map(renderOption))}
    </select>
    {searchable && <span id={countId} className="filter-select-count" role="status">
      {visible.length ? `${visible.length} choix disponible${visible.length > 1 ? 's' : ''}` : 'Aucun résultat'}
    </span>}
  </div>;
}
