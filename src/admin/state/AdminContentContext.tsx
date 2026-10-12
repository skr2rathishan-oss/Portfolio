// Admin-side content state.
//
// Mutation model: every change is a pure reducer `(doc) => doc`. `mutate(reducer)`
//  1. shows the change immediately (optimistic: pending reducers are applied on top of
//     the last confirmed document);
//  2. validates the whole document with zod, then PUTs it with `If-Match: "rev-N"`;
//  3. on 412 (someone/something saved in between) refetches and re-applies the reducer once;
//     a second 412 opens the conflict dialog;
//  4. on any error the optimistic change is rolled back and a toast offers Retry.
// Saves are serialized so revisions never race each other.
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { validateContent, type ValidationIssue } from '../../content/schema';
import type { Content } from '../../content/types';
import * as api from '../api';
import { affectedBy, removeItem, restoreCollections, type CollectionKey, type Reducer } from '../lib/reducers';
import { useToast } from './toast';

export type SaveState = 'idle' | 'saving' | 'saved' | 'error';

export type MutateResult =
  | { ok: true }
  /** `code` is set for errors the UI branches on, e.g. 'published_changed' from publish(). */
  | { ok: false; message: string; issues?: ValidationIssue[]; code?: string };

export interface MutateOptions {
  /** Toast text on success, e.g. "Project saved". */
  success?: string;
  /** Do not toast validation errors (the caller shows them inline). */
  quietValidation?: boolean;
}

interface Confirmed {
  doc: Content;
  rev: number;
  source: 'store' | 'seed';
  updatedAt: string;
}

interface ContextValue {
  phase: 'loading' | 'ready' | 'error';
  loadError: string | null;
  doc: Content | null;
  rev: number;
  source: 'store' | 'seed';
  updatedAt: string | null;
  saveState: SaveState;
  lastError: string | null;
  conflict: boolean;
  mutate: (reducer: Reducer, opts?: MutateOptions) => Promise<MutateResult>;
  removeWithUndo: (key: CollectionKey, id: string, label: string) => Promise<MutateResult>;
  reload: () => Promise<void>;
  dismissConflict: () => void;
  // ── Draft / publish (FROZEN interface; WS-A swaps the temporary implementations) ──
  /** Live (published) revision. */
  publishedRev: number;
  /** Draft differs from published (computed server-side). */
  hasUnpublishedChanges: boolean;
  /** Waits for the save queue to drain, then publishes the draft. `{ok:false, code:'published_changed'}` on 409. */
  publish: (opts?: { force?: boolean }) => Promise<MutateResult>;
  /** Resets the draft to the published content (the server backs the old draft up). */
  discardDraft: () => Promise<MutateResult>;
  /** Resolves when the save queue is empty. */
  flush: () => Promise<void>;
}

const Ctx = createContext<ContextValue | null>(null);

export function useAdminContent(): ContextValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAdminContent outside AdminContentProvider');
  return ctx;
}

/** The current (optimistic) document; only use below the loading gate. */
export function useDoc(): Content {
  const { doc } = useAdminContent();
  if (!doc) throw new Error('Content not loaded');
  return doc;
}

function issueMessage(issues: ValidationIssue[]): string {
  const first = issues[0];
  if (!first) return 'The change is invalid';
  return first.path ? `${first.path}: ${first.message}` : first.message;
}

export function AdminContentProvider({ children }: { children: ReactNode }) {
  const toast = useToast();
  const [phase, setPhase] = useState<'loading' | 'ready' | 'error'>('loading');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [confirmed, setConfirmedState] = useState<Confirmed | null>(null);
  const confirmedRef = useRef<Confirmed | null>(null);
  const [pending, setPending] = useState<{ id: number; reducer: Reducer }[]>([]);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [lastError, setLastError] = useState<string | null>(null);
  const [conflict, setConflict] = useState(false);
  const queue = useRef<Promise<unknown>>(Promise.resolve());
  const counter = useRef(0);
  const savedTimer = useRef<number | undefined>(undefined);

  const setConfirmed = useCallback((c: Confirmed) => {
    confirmedRef.current = c;
    setConfirmedState(c);
  }, []);

  const fetchLatest = useCallback(async () => {
    const env = await api.getContent();
    const result = validateContent(env.content);
    // A stored document that fails today's schema is still shown so it can be repaired.
    const doc = result.success ? result.data : env.content;
    setConfirmed({ doc, rev: env.rev, source: env.source, updatedAt: env.updatedAt });
  }, [setConfirmed]);

  const reload = useCallback(async () => {
    try {
      setLoadError(null);
      await fetchLatest();
      setPhase('ready');
    } catch (err) {
      setLoadError((err as Error).message);
      setPhase((p) => (p === 'ready' ? p : 'error'));
      if (confirmedRef.current) toast({ tone: 'error', message: `Could not reload: ${(err as Error).message}` });
    }
  }, [fetchLatest, toast]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const commit = useCallback(
    async (reducer: Reducer, retried = false): Promise<MutateResult> => {
      const base = confirmedRef.current;
      if (!base) return { ok: false, message: 'Content is not loaded yet' };
      const next = reducer(base.doc);
      if (next === base.doc) return { ok: true };
      const result = validateContent(next);
      if (!result.success) return { ok: false, message: issueMessage(result.issues), issues: result.issues };
      try {
        const saved = await api.putContent(result.data, base.rev);
        setConfirmed({
          doc: { ...result.data, updatedAt: saved.updatedAt },
          rev: saved.rev,
          source: 'store',
          updatedAt: saved.updatedAt,
        });
        return { ok: true };
      } catch (err) {
        const e = err as api.ApiError;
        if (e.status === 412 && !retried) {
          try {
            await fetchLatest();
          } catch {
            return { ok: false, message: 'The content changed elsewhere and could not be reloaded' };
          }
          return commit(reducer, true);
        }
        if (e.status === 412) {
          setConflict(true);
          return { ok: false, message: 'The content was changed in another tab or by a restore.' };
        }
        if (e.status === 400 && e.issues.length) {
          return { ok: false, message: issueMessage(e.issues), issues: e.issues };
        }
        return { ok: false, message: e.message || 'Save failed' };
      }
    },
    [fetchLatest, setConfirmed],
  );

  const mutate = useCallback(
    (reducer: Reducer, opts: MutateOptions = {}): Promise<MutateResult> => {
      const id = ++counter.current;
      setPending((p) => [...p, { id, reducer }]);
      setSaveState('saving');
      window.clearTimeout(savedTimer.current);
      const run = queue.current.then(async () => {
        const res = await commit(reducer);
        setPending((p) => {
          const rest = p.filter((x) => x.id !== id);
          if (rest.length === 0) {
            setSaveState(res.ok ? 'saved' : 'error');
            if (res.ok) savedTimer.current = window.setTimeout(() => setSaveState('idle'), 2500);
          }
          return rest;
        });
        if (res.ok) {
          setLastError(null);
          if (opts.success) toast({ tone: 'success', message: opts.success });
        } else {
          setLastError(res.message);
          if (!(opts.quietValidation && res.issues)) {
            toast({
              tone: 'error',
              message: `Not saved: ${res.message}`,
              action: res.issues ? undefined : { label: 'Retry', onClick: () => void mutate(reducer, opts) },
            });
          }
        }
        return res;
      });
      queue.current = run.catch(() => undefined);
      return run;
    },
    [commit, toast],
  );

  const removeWithUndo = useCallback(
    async (key: CollectionKey, id: string, label: string): Promise<MutateResult> => {
      const snapshot = confirmedRef.current?.doc;
      const res = await mutate(removeItem(key, id));
      if (res.ok && snapshot) {
        toast({
          tone: 'info',
          message: `Deleted “${label}”`,
          duration: 8000,
          action: {
            label: 'Undo',
            onClick: () => void mutate(restoreCollections(snapshot, affectedBy(key)), { success: `Restored “${label}”` }),
          },
        });
      }
      return res;
    },
    [mutate, toast],
  );

  // Warn before leaving while saves are in flight.
  useEffect(() => {
    if (pending.length === 0) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [pending.length]);

  // TEMPORARY (foundation step): the data path is still the legacy publish-on-save one.
  const flush = useCallback(async () => {
    let current: Promise<unknown>;
    do {
      current = queue.current;
      await current;
    } while (current !== queue.current);
  }, []);

  const publish = useCallback(
    async (_opts?: { force?: boolean }): Promise<MutateResult> => {
      await flush();
      return { ok: true };
    },
    [flush],
  );

  const discardDraft = useCallback(async (): Promise<MutateResult> => {
    await flush();
    await reload();
    return { ok: true };
  }, [flush, reload]);

  const doc = useMemo(() => {
    if (!confirmed) return null;
    return pending.reduce((d, p) => {
      try {
        return p.reducer(d);
      } catch {
        return d;
      }
    }, confirmed.doc);
  }, [confirmed, pending]);

  const value: ContextValue = {
    phase,
    loadError,
    doc,
    rev: confirmed?.rev ?? 0,
    source: confirmed?.source ?? 'seed',
    updatedAt: confirmed?.updatedAt ?? null,
    saveState,
    lastError,
    conflict,
    mutate,
    removeWithUndo,
    reload,
    dismissConflict: () => setConflict(false),
    publishedRev: confirmed?.rev ?? 0,
    hasUnpublishedChanges: false,
    publish,
    discardDraft,
    flush,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
