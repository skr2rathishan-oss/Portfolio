// Local draft for a properties-panel form. Edits show in the panel immediately and are committed
// to the document (one `apply`, i.e. one PUT to the server draft) after 800ms idle, on blur, on
// Save draft, or when the panel unmounts. Invalid values stay local and show inline errors.
import { useCallback, useEffect, useRef, useState } from 'react';
import type { FieldErrors } from '../../lib/validate';
import type { MutateResult } from '../../state/AdminContentContext';
import { useEditor } from '../state/EditorContext';

export type Validation<T> = { ok: true; data: T } | { ok: false; errors: FieldErrors };

const IDLE_MS = 800;

/** Keys whose JSON differs (undefined in `next` = removed). */
export function changedKeys<T extends object>(base: T, next: T, ignore: readonly string[] = []): Partial<T> {
  const out: Record<string, unknown> = {};
  const a = base as Record<string, unknown>;
  const b = next as Record<string, unknown>;
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
    if (ignore.includes(k)) continue;
    if (JSON.stringify(a[k]) !== JSON.stringify(b[k])) out[k] = b[k];
  }
  return out as Partial<T>;
}

export function issuesToFieldErrors(issues: { path: string; message: string }[] | undefined, prefix: RegExp): FieldErrors {
  const out: FieldErrors = {};
  for (const i of issues ?? []) {
    const key = i.path.replace(prefix, '');
    if (!(key in out)) out[key] = i.message;
  }
  return out;
}

export function useDraft<T extends object>({
  id,
  source,
  validate,
  commit,
}: {
  /** Unique per edited object (registry key for Save draft / unload guard). */
  id: string;
  source: T;
  validate: (value: T) => Validation<T>;
  /** Applies the validated value; `base` is the source the draft started from. */
  commit: (data: T, base: T) => Promise<MutateResult>;
}) {
  const { registerPending } = useEditor();
  const [draft, setDraftState] = useState<T>(source);
  const [errors, setErrors] = useState<FieldErrors>({});
  const draftRef = useRef(draft);
  const base = useRef(source);
  const dirty = useRef(false);
  const timer = useRef<number | undefined>(undefined);
  const fns = useRef({ validate, commit });
  fns.current = { validate, commit };

  // Follow external changes (undo, inline edits, other panels) while nothing is being typed.
  useEffect(() => {
    if (!dirty.current && source !== base.current) {
      base.current = source;
      draftRef.current = source;
      setDraftState(source);
      setErrors({});
    }
  }, [source]);

  const commitNow = useCallback(async () => {
    window.clearTimeout(timer.current);
    if (!dirty.current) return;
    const checked = fns.current.validate(draftRef.current);
    if (!checked.ok) {
      setErrors(checked.errors);
      return;
    }
    setErrors({});
    dirty.current = false;
    registerPending(id, null);
    const from = base.current;
    const res = await fns.current.commit(checked.data, from);
    if (!res.ok && res.issues) setErrors(issuesToFieldErrors(res.issues, /^.*?\.\d+\.|^[a-z]+\./i));
  }, [id, registerPending]);

  const commitRef = useRef(commitNow);
  commitRef.current = commitNow;

  const update = useCallback(
    (patch: Partial<T>) => {
      draftRef.current = { ...draftRef.current, ...patch };
      setDraftState(draftRef.current);
      dirty.current = true;
      registerPending(id, () => commitRef.current());
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => void commitRef.current(), IDLE_MS);
      const keys = Object.keys(patch);
      setErrors((e) => {
        if (!Object.keys(e).some((ek) => keys.some((k) => ek === k || ek.startsWith(`${k}.`)))) return e;
        const next = { ...e };
        for (const ek of Object.keys(next)) if (keys.some((k) => ek === k || ek.startsWith(`${k}.`))) delete next[ek];
        return next;
      });
    },
    [id, registerPending],
  );

  const set = useCallback(<K extends keyof T>(key: K, value: T[K]) => update({ [key]: value } as unknown as Partial<T>), [update]);

  // Commit what was typed when the panel switches to another element.
  useEffect(
    () => () => {
      void commitRef.current();
      registerPending(id, null);
    },
    [id, registerPending],
  );

  /** Attach to the form: commits when focus leaves it. */
  const onBlur = useCallback((e: React.FocusEvent<HTMLElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) void commitRef.current();
  }, []);

  return { draft, errors, update, set, commitNow, onBlur };
}
