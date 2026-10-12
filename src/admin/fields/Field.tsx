// Labelled form fields. Every control has a <label>, required marker, hint and
// error text wired with aria-describedby / aria-invalid.
import { ArrowDown, ArrowUp, Plus, X } from 'lucide-react';
import { useId, useState, type ReactNode } from 'react';
import { ICON_NAMES, getIcon } from '../../content/icons';
import type { IconName } from '../../content/types';
import { cx, focusRing, IconButton } from '../ui/primitives';

/** Input styling without a width (for inline controls). */
export const inputBase = cx(
  'rounded-lg border bg-[#0a1a2b] px-3 py-2 text-sm text-[#e8f0f7] placeholder:text-[#5f7a93]',
  'border-[#27496b] hover:border-[#3a6690] transition-colors',
  'focus:outline-none focus:border-[#00abf0] focus:ring-2 focus:ring-[#00abf0]/30',
);
export const inputClass = cx('w-full', inputBase);
const invalidClass = 'border-[#ff6b6b]/70 hover:border-[#ff6b6b]';

interface FieldShellProps {
  label: string;
  /** Form field name; rendered as `data-field` so the visual editor can focus it. */
  name?: string;
  required?: boolean;
  hint?: ReactNode;
  error?: string;
  counter?: { value: number; max: number };
  children: (ids: { id: string; describedBy?: string; invalid: boolean }) => ReactNode;
  className?: string;
  /** Use a <fieldset>/<legend> for groups of controls. */
  group?: boolean;
}

export function FieldShell({ name, label, required, hint, error, counter, children, className, group }: FieldShellProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errId = `${id}-err`;
  const describedBy = [hint ? hintId : null, error ? errId : null].filter(Boolean).join(' ') || undefined;
  const labelEl = (
    <span className="flex items-baseline justify-between gap-2">
      <span className="text-[13px] font-medium text-[#cfdbe6]">
        {label}
        {required && (
          <span className="ml-0.5 text-[#00abf0]" aria-hidden="true">
            *
          </span>
        )}
        {required && <span className="sr-only"> (required)</span>}
      </span>
      {counter && (
        <span
          className={cx('text-[11px] tabular-nums', counter.value > counter.max ? 'text-[#ff8a8a]' : 'text-[#5f7a93]')}
          aria-hidden="true"
        >
          {counter.value}/{counter.max}
        </span>
      )}
    </span>
  );
  const body = (
    <>
      {children({ id, describedBy, invalid: !!error })}
      {hint && (
        <p id={hintId} className="mt-1.5 text-xs text-[#7f97ad]">
          {hint}
        </p>
      )}
      {error && (
        <p id={errId} className="mt-1.5 text-xs font-medium text-[#ff8a8a]" role="alert">
          {error}
        </p>
      )}
    </>
  );
  if (group) {
    return (
      <fieldset className={cx('min-w-0', className)} data-field={name}>
        <legend className="mb-1.5 w-full">{labelEl}</legend>
        {body}
      </fieldset>
    );
  }
  return (
    <div className={cx('min-w-0', className)} data-field={name}>
      <label htmlFor={id} className="mb-1.5 block">
        {labelEl}
      </label>
      {body}
    </div>
  );
}

interface TextProps {
  label: string;
  name?: string;
  value: string | undefined;
  onChange: (value: string) => void;
  required?: boolean;
  hint?: ReactNode;
  error?: string;
  placeholder?: string;
  maxLength?: number;
  type?: 'text' | 'url' | 'email';
  className?: string;
  autoFocus?: boolean;
  inputMode?: 'text' | 'url' | 'email';
}

export function TextField({ name, label, value, onChange, required, hint, error, placeholder, maxLength, type = 'text', className, autoFocus, inputMode }: TextProps) {
  const v = value ?? '';
  return (
    <FieldShell
      name={name}
      label={label}
      required={required}
      hint={hint}
      error={error}
      className={className}
      counter={maxLength && v.length > maxLength * 0.8 ? { value: v.length, max: maxLength } : undefined}
    >
      {({ id, describedBy, invalid }) => (
        <input
          id={id}
          type={type}
          value={v}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          autoFocus={autoFocus}
          inputMode={inputMode}
          spellCheck={type === 'text'}
          className={cx(inputClass, invalid && invalidClass)}
        />
      )}
    </FieldShell>
  );
}

export function UrlField(props: Omit<TextProps, 'type'> & { allowMailto?: boolean; media?: boolean }) {
  const { media, allowMailto, hint, ...rest } = props;
  const defaultHint = media
    ? 'https:// link or a site path such as /projects/shot.png'
    : `https:// link${allowMailto ? ', mailto:' : ''} or a site path such as /projects`;
  return <TextField {...rest} type="text" inputMode="url" hint={hint ?? defaultHint} placeholder={props.placeholder ?? 'https://'} />;
}

export function TextArea({
  name,
  label,
  value,
  onChange,
  required,
  hint,
  error,
  maxLength,
  rows = 4,
  placeholder,
  className,
}: Omit<TextProps, 'type'> & { rows?: number }) {
  const v = value ?? '';
  return (
    <FieldShell
      name={name}
      label={label}
      required={required}
      hint={hint}
      error={error}
      className={className}
      counter={maxLength ? { value: v.length, max: maxLength } : undefined}
    >
      {({ id, describedBy, invalid }) => (
        <textarea
          id={id}
          value={v}
          rows={rows}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          className={cx(inputClass, 'resize-y leading-relaxed', invalid && invalidClass)}
        />
      )}
    </FieldShell>
  );
}

export function SelectField<T extends string>({
  name,
  label,
  value,
  onChange,
  options,
  required,
  hint,
  error,
  className,
  placeholder,
}: {
  label: string;
  name?: string;
  value: T | undefined;
  onChange: (value: T | undefined) => void;
  options: { value: T; label: string }[];
  required?: boolean;
  hint?: ReactNode;
  error?: string;
  className?: string;
  /** When set, an empty option is offered (value -> undefined). */
  placeholder?: string;
}) {
  return (
    <FieldShell name={name} label={label} required={required} hint={hint} error={error} className={className}>
      {({ id, describedBy, invalid }) => (
        <select
          id={id}
          value={value ?? ''}
          onChange={(e) => onChange((e.target.value || undefined) as T | undefined)}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          required={required}
          className={cx(inputClass, 'appearance-auto', invalid && invalidClass)}
        >
          {placeholder !== undefined && <option value="">{placeholder}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )}
    </FieldShell>
  );
}

export function Toggle({
  name,
  label,
  checked,
  onChange,
  hint,
  className,
}: {
  label: string;
  name?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  hint?: string;
  className?: string;
}) {
  const id = useId();
  return (
    <div data-field={name} className={cx('flex items-start justify-between gap-4 rounded-lg border border-[#1b3550] bg-[#0a1a2b]/60 px-3 py-2.5', className)}>
      <div className="min-w-0">
        <label htmlFor={id} className="text-[13px] font-medium text-[#cfdbe6] cursor-pointer">
          {label}
        </label>
        {hint && (
          <p id={`${id}-hint`} className="text-xs text-[#7f97ad]">
            {hint}
          </p>
        )}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-describedby={hint ? `${id}-hint` : undefined}
        onClick={() => onChange(!checked)}
        className={cx(
          'relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors',
          checked ? 'bg-[#00abf0]' : 'bg-[#27496b]',
          focusRing,
        )}
      >
        <span
          aria-hidden="true"
          className={cx(
            'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-[22px]' : 'translate-x-0.5',
          )}
        />
      </button>
    </div>
  );
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "YYYY" | "YYYY-MM" editor (+ optional "Present"). */
export function MonthField({
  name,
  label,
  value,
  onChange,
  required,
  allowPresent,
  hint,
  error,
  className,
}: {
  label: string;
  name?: string;
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  required?: boolean;
  allowPresent?: boolean;
  hint?: ReactNode;
  error?: string;
  className?: string;
}) {
  const present = value === 'present';
  const m = /^(\d{4})(?:-(\d{2}))?$/.exec(value ?? '');
  const year = m?.[1] ?? '';
  const month = m?.[2] ?? '';
  const thisYear = new Date().getFullYear();
  const set = (y: string, mo: string) => onChange(y ? (mo ? `${y}-${mo}` : y) : undefined);
  return (
    <FieldShell name={name} label={label} required={required} hint={hint} error={error} className={className} group>
      {({ id, describedBy, invalid }) => (
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor={`${id}-y`} className="sr-only">
            {label} year
          </label>
          <input
            id={`${id}-y`}
            type="number"
            inputMode="numeric"
            min={1950}
            max={thisYear + 10}
            placeholder="Year"
            disabled={present}
            value={present ? '' : year}
            onChange={(e) => set(e.target.value.slice(0, 4), month)}
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
            className={cx(inputBase, 'w-24 disabled:opacity-40', invalid && invalidClass)}
          />
          <label htmlFor={`${id}-m`} className="sr-only">
            {label} month
          </label>
          <select
            id={`${id}-m`}
            value={present ? '' : month}
            disabled={present || !year}
            onChange={(e) => set(year, e.target.value)}
            className={cx(inputBase, 'w-32 appearance-auto disabled:opacity-40')}
          >
            <option value="">No month</option>
            {MONTH_NAMES.map((name, i) => (
              <option key={name} value={String(i + 1).padStart(2, '0')}>
                {name}
              </option>
            ))}
          </select>
          {allowPresent && (
            <label className="inline-flex items-center gap-2 text-sm text-[#cfdbe6] cursor-pointer">
              <input
                type="checkbox"
                checked={present}
                onChange={(e) => onChange(e.target.checked ? 'present' : undefined)}
                className="h-4 w-4 accent-[#00abf0]"
              />
              Present
            </label>
          )}
          {!required && !present && year && (
            <button type="button" onClick={() => onChange(undefined)} className={cx('text-xs text-[#8ea6bd] hover:text-white underline-offset-2 hover:underline rounded', focusRing)}>
              Clear
            </button>
          )}
        </div>
      )}
    </FieldShell>
  );
}

export function ColorField({
  name,
  label,
  value,
  onChange,
  hint,
  error,
  className,
}: {
  label: string;
  name?: string;
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  hint?: ReactNode;
  error?: string;
  className?: string;
}) {
  return (
    <FieldShell name={name} label={label} hint={hint ?? 'Optional accent colour'} error={error} className={className}>
      {({ id, describedBy, invalid }) => (
        <div className="flex items-center gap-2">
          <input
            type="color"
            aria-label={`${label} picker`}
            value={value && /^#[0-9a-f]{6}$/i.test(value) ? value : '#00abf0'}
            onChange={(e) => onChange(e.target.value.toLowerCase())}
            className={cx('h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-[#27496b] bg-[#0a1a2b] p-1', focusRing)}
          />
          <input
            id={id}
            value={value ?? ''}
            placeholder="#00abf0"
            onChange={(e) => onChange(e.target.value.trim().toLowerCase() || undefined)}
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
            className={cx(inputBase, 'font-mono w-32', invalid && invalidClass)}
          />
          {value && (
            <IconButton label={`Clear ${label}`} onClick={() => onChange(undefined)}>
              <X size={16} aria-hidden="true" />
            </IconButton>
          )}
        </div>
      )}
    </FieldShell>
  );
}

/** Chips with free text entry (Enter or comma adds). */
export function TagInput({
  name,
  label,
  value,
  onChange,
  hint,
  error,
  max = 20,
  placeholder = 'Type and press Enter',
  suggestions,
  className,
}: {
  label: string;
  name?: string;
  value: string[];
  onChange: (value: string[]) => void;
  hint?: ReactNode;
  error?: string;
  max?: number;
  placeholder?: string;
  suggestions?: string[];
  className?: string;
}) {
  const [draft, setDraft] = useState('');
  const listId = useId();
  const add = (raw: string) => {
    const parts = raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const next = [...value];
    for (const p of parts) if (!next.some((v) => v.toLowerCase() === p.toLowerCase()) && next.length < max) next.push(p);
    onChange(next);
    setDraft('');
  };
  return (
    <FieldShell name={name} label={label} hint={hint ?? `Press Enter or comma to add (${value.length} of ${max})`} error={error} className={className}>
      {({ id, describedBy, invalid }) => (
        <div className={cx(inputClass, 'flex flex-wrap items-center gap-1.5 px-2 py-1.5 focus-within:border-[#00abf0] focus-within:ring-2 focus-within:ring-[#00abf0]/30', invalid && invalidClass)}>
          <ul className="contents" aria-label={`${label} list`}>
            {value.map((tag, i) => (
              <li key={`${tag}-${i}`} className="inline-flex items-center gap-1 rounded-md bg-[#00abf0]/12 border border-[#00abf0]/30 pl-2 pr-0.5 py-0.5 text-xs text-[#9fe0fa]">
                {tag}
                <button
                  type="button"
                  aria-label={`Remove ${tag}`}
                  onClick={() => onChange(value.filter((_, j) => j !== i))}
                  className={cx('rounded p-0.5 hover:bg-white/10', focusRing)}
                >
                  <X size={12} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
          <input
            id={id}
            value={draft}
            list={suggestions ? listId : undefined}
            onChange={(e) => {
              if (e.target.value.includes(',')) add(e.target.value);
              else setDraft(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (draft.trim()) add(draft);
              } else if (e.key === 'Backspace' && !draft && value.length) {
                onChange(value.slice(0, -1));
              }
            }}
            onBlur={() => draft.trim() && add(draft)}
            placeholder={value.length >= max ? 'Limit reached' : placeholder}
            disabled={value.length >= max}
            aria-describedby={describedBy}
            className="min-w-[8rem] flex-1 bg-transparent px-1 py-1 text-sm outline-none placeholder:text-[#5f7a93]"
          />
          {suggestions && (
            <datalist id={listId}>
              {suggestions.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          )}
        </div>
      )}
    </FieldShell>
  );
}

/** Ordered list of short strings (e.g. highlights) with add / remove / move. */
export function ListEditor({
  name,
  label,
  value,
  onChange,
  hint,
  error,
  max = 20,
  itemLabel = 'Item',
  placeholder,
  className,
}: {
  label: string;
  name?: string;
  value: string[];
  onChange: (value: string[]) => void;
  hint?: ReactNode;
  error?: string;
  max?: number;
  itemLabel?: string;
  placeholder?: string;
  className?: string;
}) {
  const move = (i: number, d: -1 | 1) => {
    const next = value.slice();
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
  };
  return (
    <FieldShell name={name} label={label} hint={hint} error={error} className={className} group>
      {() => (
        <div className="space-y-2">
          {value.map((item, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <input
                aria-label={`${itemLabel} ${i + 1}`}
                value={item}
                placeholder={placeholder}
                onChange={(e) => onChange(value.map((v, j) => (j === i ? e.target.value : v)))}
                className={inputClass}
              />
              <IconButton label={`Move ${itemLabel.toLowerCase()} ${i + 1} up`} disabled={i === 0} onClick={() => move(i, -1)}>
                <ArrowUp size={15} aria-hidden="true" />
              </IconButton>
              <IconButton label={`Move ${itemLabel.toLowerCase()} ${i + 1} down`} disabled={i === value.length - 1} onClick={() => move(i, 1)}>
                <ArrowDown size={15} aria-hidden="true" />
              </IconButton>
              <IconButton label={`Remove ${itemLabel.toLowerCase()} ${i + 1}`} tone="danger" onClick={() => onChange(value.filter((_, j) => j !== i))}>
                <X size={15} aria-hidden="true" />
              </IconButton>
            </div>
          ))}
          {value.length < max && (
            <button
              type="button"
              onClick={() => onChange([...value, ''])}
              className={cx('inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-[#5ccdf7] hover:bg-[#00abf0]/10', focusRing)}
            >
              <Plus size={15} aria-hidden="true" /> Add {itemLabel.toLowerCase()}
            </button>
          )}
        </div>
      )}
    </FieldShell>
  );
}

export function IconSelect({
  name,
  label,
  value,
  onChange,
  error,
  className,
}: {
  label: string;
  name?: string;
  value: IconName;
  onChange: (value: IconName) => void;
  error?: string;
  className?: string;
}) {
  return (
    <FieldShell name={name} label={label} error={error} className={className} group>
      {() => (
        <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5">
          {ICON_NAMES.map((name) => {
            const Icon = getIcon(name);
            const selected = name === value;
            return (
              <button
                key={name}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={name}
                title={name}
                onClick={() => onChange(name)}
                className={cx(
                  'flex h-9 w-9 items-center justify-center rounded-lg border transition-colors',
                  selected ? 'border-[#00abf0] bg-[#00abf0]/15 text-[#00abf0]' : 'border-[#27496b] text-[#8ea6bd] hover:text-white',
                  focusRing,
                )}
              >
                <Icon size={17} aria-hidden="true" />
              </button>
            );
          })}
        </div>
      )}
    </FieldShell>
  );
}

export function CheckboxGroup({
  name,
  label,
  options,
  value,
  onChange,
  hint,
  error,
  className,
}: {
  label: string;
  name?: string;
  options: { value: string; label: string; muted?: boolean }[];
  value: string[];
  onChange: (value: string[]) => void;
  hint?: ReactNode;
  error?: string;
  className?: string;
}) {
  return (
    <FieldShell name={name} label={label} hint={hint} error={error} className={className} group>
      {() => (
        <div className="flex flex-wrap gap-2">
          {options.map((o) => {
            const checked = value.includes(o.value);
            return (
              <label
                key={o.value}
                className={cx(
                  'inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors focus-within:ring-2 focus-within:ring-[#00abf0]/40',
                  checked ? 'border-[#00abf0]/60 bg-[#00abf0]/10 text-white' : 'border-[#27496b] text-[#b8c9d9]',
                )}
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-[#00abf0]"
                  checked={checked}
                  onChange={(e) => onChange(e.target.checked ? [...value, o.value] : value.filter((v) => v !== o.value))}
                />
                {o.label}
                {o.muted && <span className="text-xs text-[#5f7a93]">(hidden)</span>}
              </label>
            );
          })}
        </div>
      )}
    </FieldShell>
  );
}
