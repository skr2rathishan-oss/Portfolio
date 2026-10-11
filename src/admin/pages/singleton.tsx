// Draft editing for single objects (profile.hero, profile.about, site, …):
// edit locally, then Save publishes in one change. A sticky bar shows unsaved state.
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { z } from 'zod';
import type { Reducer } from '../lib/reducers';
import { issuesToErrors, type FieldErrors } from '../lib/validate';
import { useAdminContent } from '../state/AdminContentContext';
import { Button, cx, focusRing, IconButton } from '../ui/primitives';

export function useSingletonDraft<T extends object>(
  source: T,
  schema: z.ZodType,
  commit: (value: T) => Reducer,
  successMessage: string,
  /** Document path of the object, e.g. "profile.hero." (used to map server errors to fields). */
  issuePrefix: string,
) {
  const { mutate } = useAdminContent();
  const [draft, setDraft] = useState<T>(source);
  const [dirty, setDirty] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);
  const sourceRef = useRef(source);

  // Follow external changes (undo, restore, other tabs) while nothing is being edited.
  useEffect(() => {
    if (sourceRef.current !== source) {
      sourceRef.current = source;
      if (!dirty) setDraft(source);
    }
  }, [source, dirty]);

  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  const update = (patch: Partial<T>) => {
    setDraft((d) => ({ ...d, ...patch }));
    setDirty(true);
  };
  const set = <K extends keyof T>(key: K, value: T[K]) => update({ [key]: value } as unknown as Partial<T>);

  const save = async () => {
    const result = schema.safeParse(draft);
    if (!result.success) {
      setErrors(issuesToErrors(result.error.issues));
      return false;
    }
    setErrors({});
    setSaving(true);
    const res = await mutate(commit(result.data as T), { success: successMessage, quietValidation: true });
    setSaving(false);
    if (res.ok) {
      setDirty(false);
      return true;
    }
    if (res.issues) {
      setErrors(issuesToErrors(res.issues.map((i) => ({ path: i.path.startsWith(issuePrefix) ? i.path.slice(issuePrefix.length) : i.path, message: i.message }))));
    }
    return false;
  };

  const discard = () => {
    setDraft(sourceRef.current);
    setErrors({});
    setDirty(false);
  };

  return { draft, set, update, errors, dirty, saving, save, discard };
}

export function SaveBar({ dirty, saving, onSave, onDiscard, errorCount }: { dirty: boolean; saving: boolean; onSave: () => void; onDiscard: () => void; errorCount: number }) {
  return (
    <div
      className={cx(
        'sticky bottom-0 z-30 -mx-4 mt-8 flex flex-wrap items-center gap-3 border-t px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10',
        dirty ? 'border-[#00abf0]/40 bg-[#082033]/95' : 'border-[#14304b] bg-[#06111d]/90',
      )}
    >
      <p className="mr-auto text-sm text-[#b8c9d9]" role="status" aria-live="polite">
        {errorCount > 0 ? (
          <span className="text-[#ff8a8a]">Fix {errorCount} highlighted field{errorCount === 1 ? '' : 's'} to save.</span>
        ) : dirty ? (
          'You have unsaved changes.'
        ) : (
          'All changes are live.'
        )}
      </p>
      <Button variant="ghost" onClick={onDiscard} disabled={!dirty || saving}>
        Discard
      </Button>
      <Button variant="primary" onClick={onSave} disabled={!dirty} busy={saving}>
        Save and publish
      </Button>
    </div>
  );
}

/** Repeatable rows of small objects (facts, goals, stats…). */
export function RepeatList<T>({
  label,
  items,
  onChange,
  create,
  renderRow,
  max = 20,
  itemLabel,
  description,
}: {
  label: string;
  items: T[];
  onChange: (items: T[]) => void;
  create: () => T;
  renderRow: (item: T, update: (patch: Partial<T>) => void, index: number) => ReactNode;
  max?: number;
  itemLabel: string;
  description?: string;
}) {
  const move = (i: number, d: -1 | 1) => {
    const next = items.slice();
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
  };
  return (
    <fieldset className="min-w-0">
      <legend className="text-[15px] font-semibold text-white">{label}</legend>
      {description && <p className="mt-0.5 text-sm text-[#8ea6bd]">{description}</p>}
      <div className="mt-3 space-y-3">
        {items.map((item, i) => (
          <div key={i} className="flex flex-col gap-3 rounded-xl border border-[#1b3550] bg-[#0a1a2b]/60 p-3 sm:flex-row sm:items-start">
            <div className="min-w-0 flex-1">{renderRow(item, (patch) => onChange(items.map((x, j) => (j === i ? { ...x, ...patch } : x))), i)}</div>
            <div className="flex shrink-0 gap-0.5 sm:flex-col sm:pt-6">
              <IconButton label={`Move ${itemLabel} ${i + 1} up`} disabled={i === 0} onClick={() => move(i, -1)}>
                <ArrowUp size={15} aria-hidden="true" />
              </IconButton>
              <IconButton label={`Move ${itemLabel} ${i + 1} down`} disabled={i === items.length - 1} onClick={() => move(i, 1)}>
                <ArrowDown size={15} aria-hidden="true" />
              </IconButton>
              <IconButton label={`Remove ${itemLabel} ${i + 1}`} tone="danger" onClick={() => onChange(items.filter((_, j) => j !== i))}>
                <Trash2 size={15} aria-hidden="true" />
              </IconButton>
            </div>
          </div>
        ))}
        {items.length < max && (
          <button
            type="button"
            onClick={() => onChange([...items, create()])}
            className={cx('inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-[#5ccdf7] hover:bg-[#00abf0]/10', focusRing)}
          >
            <Plus size={15} aria-hidden="true" /> Add {itemLabel}
          </button>
        )}
      </div>
    </fieldset>
  );
}
