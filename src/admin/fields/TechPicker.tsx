// Project tech stack editor: autocomplete over technologies, a level per entry,
// reorder, and inline creation of a technology that does not exist yet.
import { ArrowDown, ArrowUp, Plus, X } from 'lucide-react';
import { useId, useMemo, useState } from 'react';
import type { ID, StackLevel, Technology } from '../../content/types';
import { cx, focusRing, IconButton } from '../ui/primitives';
import { FieldShell, inputBase, inputClass } from './Field';

const LEVELS: { value: StackLevel; label: string }[] = [
  { value: 'core', label: 'Core' },
  { value: 'supporting', label: 'Supporting' },
  { value: 'exposure', label: 'Exposure' },
];

export function TechPicker({
  label,
  value,
  onChange,
  technologies,
  onCreate,
  error,
  max = 20,
}: {
  label: string;
  value: { techId: ID; level: StackLevel }[];
  onChange: (value: { techId: ID; level: StackLevel }[]) => void;
  technologies: Technology[];
  /** Creates a technology (added on save) and returns its id. */
  onCreate: (name: string) => ID;
  error?: string;
  max?: number;
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const listId = useId();
  const byId = useMemo(() => new Map(technologies.map((t) => [t.id, t])), [technologies]);
  const used = new Set(value.map((v) => v.techId));
  const q = query.trim().toLowerCase();
  const matches = technologies
    .filter((t) => !used.has(t.id) && (!q || t.name.toLowerCase().includes(q)))
    .sort((a, b) => Number(!a.name.toLowerCase().startsWith(q)) - Number(!b.name.toLowerCase().startsWith(q)) || a.name.localeCompare(b.name))
    .slice(0, 8);
  const exact = technologies.some((t) => t.name.toLowerCase() === q);
  const options: ({ kind: 'tech'; tech: Technology } | { kind: 'create'; name: string })[] = [
    ...matches.map((tech) => ({ kind: 'tech' as const, tech })),
    ...(q && !exact ? [{ kind: 'create' as const, name: query.trim() }] : []),
  ];

  const add = (techId: ID) => {
    if (value.length >= max) return;
    onChange([...value, { techId, level: value.length < 3 ? 'core' : 'supporting' }]);
    setQuery('');
    setActive(0);
  };
  const choose = (i: number) => {
    const o = options[i];
    if (!o) return;
    add(o.kind === 'tech' ? o.tech.id : onCreate(o.name));
  };
  const move = (i: number, d: -1 | 1) => {
    const next = value.slice();
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
  };

  return (
    <FieldShell label={label} error={error} hint="Core technologies are highlighted on the card." group>
      {({ id, describedBy }) => (
        <div className="space-y-2">
          {value.length > 0 && (
            <ul className="space-y-1.5" aria-label="Selected technologies">
              {value.map((entry, i) => {
                const tech = byId.get(entry.techId);
                return (
                  <li key={entry.techId} className="flex items-center gap-1.5 rounded-lg border border-[#1b3550] bg-[#0a1a2b] py-1 pl-3 pr-1">
                    <span className={cx('min-w-0 flex-1 truncate text-sm', tech ? 'text-[#e8f0f7]' : 'text-[#ff8a8a]')}>
                      {tech?.name ?? `Missing (${entry.techId})`}
                    </span>
                    <label className="sr-only" htmlFor={`${id}-lvl-${i}`}>
                      Level for {tech?.name ?? entry.techId}
                    </label>
                    <select
                      id={`${id}-lvl-${i}`}
                      value={entry.level}
                      onChange={(e) => onChange(value.map((v, j) => (j === i ? { ...v, level: e.target.value as StackLevel } : v)))}
                      className={cx(inputBase, 'h-8 w-32 py-0 appearance-auto')}
                    >
                      {LEVELS.map((l) => (
                        <option key={l.value} value={l.value}>
                          {l.label}
                        </option>
                      ))}
                    </select>
                    <IconButton label={`Move ${tech?.name ?? 'entry'} up`} disabled={i === 0} onClick={() => move(i, -1)}>
                      <ArrowUp size={15} aria-hidden="true" />
                    </IconButton>
                    <IconButton label={`Move ${tech?.name ?? 'entry'} down`} disabled={i === value.length - 1} onClick={() => move(i, 1)}>
                      <ArrowDown size={15} aria-hidden="true" />
                    </IconButton>
                    <IconButton label={`Remove ${tech?.name ?? 'entry'}`} tone="danger" onClick={() => onChange(value.filter((_, j) => j !== i))}>
                      <X size={15} aria-hidden="true" />
                    </IconButton>
                  </li>
                );
              })}
            </ul>
          )}
          <div className="relative">
            <label htmlFor={`${id}-q`} className="sr-only">
              Add a technology
            </label>
            <input
              id={`${id}-q`}
              role="combobox"
              aria-expanded={open && options.length > 0}
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={open && options[active] ? `${listId}-${active}` : undefined}
              aria-describedby={describedBy}
              value={query}
              placeholder={value.length >= max ? 'Limit reached' : 'Add a technology…'}
              disabled={value.length >= max}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
                setActive(0);
              }}
              onFocus={() => setOpen(true)}
              onBlur={() => window.setTimeout(() => setOpen(false), 120)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  setOpen(true);
                  setActive((a) => Math.min(a + 1, options.length - 1));
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  setActive((a) => Math.max(a - 1, 0));
                } else if (e.key === 'Enter') {
                  e.preventDefault();
                  if (open) choose(active);
                } else if (e.key === 'Escape' && open) {
                  e.preventDefault();
                  e.stopPropagation();
                  setOpen(false);
                }
              }}
              className={inputClass}
            />
            {open && options.length > 0 && (
              <ul
                id={listId}
                role="listbox"
                aria-label="Technologies"
                className="absolute z-10 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-[#27496b] bg-[#0d2033] py-1 shadow-xl"
              >
                {options.map((o, i) => (
                  <li
                    key={o.kind === 'tech' ? o.tech.id : '__create'}
                    id={`${listId}-${i}`}
                    role="option"
                    aria-selected={i === active}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      choose(i);
                    }}
                    onMouseEnter={() => setActive(i)}
                    className={cx(
                      'flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm',
                      i === active ? 'bg-[#00abf0]/15 text-white' : 'text-[#cfdbe6]',
                    )}
                  >
                    {o.kind === 'tech' ? (
                      <>
                        <span className="flex-1">{o.tech.name}</span>
                        {!o.tech.visible && <span className="text-xs text-[#5f7a93]">hidden</span>}
                      </>
                    ) : (
                      <>
                        <Plus size={14} className="text-[#00abf0]" aria-hidden="true" />
                        Create “{o.name}”
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <span className={cx('sr-only', focusRing)} aria-live="polite">
            {value.length} technologies selected
          </span>
        </div>
      )}
    </FieldShell>
  );
}
