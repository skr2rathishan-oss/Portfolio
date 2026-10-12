// Admin-side content state. Everything in the admin edits the private DRAFT; visitors only see
// what was last published (`publish()`).
//
// Mutation model: every change is a pure reducer `(doc) => doc`. `mutate(reducer)`
//  1. shows the change immediately (optimistic: pending reducers are applied on top of
//     the last confirmed draft);
//  2. validates the whole document with zod, then PUTs it to /api/admin/draft with
//     `If-Match: "draft-N"` (no revision snapshot, no CDN purge);
//  3. on 412 (another tab saved in between) refetches and re-applies the reducer once;
//     a second 412 opens the conflict dialog;
//  4. on any error the optimistic change is rolled back and a toast offers Retry.
// Saves, publish, discard and restores share one queue, so draft revisions never race and
// publish always sends the latest saved draft.
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
  /** Draft revision (If-Match "draft-N"). */
  rev: number;
  source: 'store' | 'seed';
  updatedAt: string;
  publishedRev: number;
  publishedUpdatedAt: string;
  hasUnpublishedChanges: boolean;
}

interface ContextValue {
  phase: 'loading' | 'ready' | 'error';
  loadError: string | null;
  /** The draft (optimistic). */
  doc: Content | null;
  /** Draft revision. */
  rev: number;
  /** 'seed' while the draft is still the built-in content and nothing was ever saved. */
  source: 'store' | 'seed';
  /** Last draft save. */
  updatedAt: string | null;
  saveState: SaveState;
  lastError: string | null;
  conflict: boolean;
  mutate: (reducer: Reducer, opts?: MutateOptions) => Promise<MutateResult>;
  removeWithUndo: (key: CollectionKey, id: string, label: string) => Promise<MutateResult>;
  reload: () => Promise<void>;
  dismissConflict: () => void;
  // ── Draft / publish (FROZEN interface) ──
  /** Live (published) revision; 0 = the site still serves the built-in content. */
  publishedRev: number;
  /** Draft differs from published (computed server-side). */
  hasUnpublishedChanges: boolean;
  /** Waits for the save queue to drain, then publishes the draft. `{ok:false, code:'published_changed'}` on 409. */
  publish: (opts?: { force?: boolean }) => Promise<MutateResult>;
  /** Resets the draft to the published content (the server backs the old draft up). */
  discardDraft: () => Promise<MutateResult>;
  /** Resolves when the save queue is empty. */
  flush: () => Promise<void>;
  // ── Additive (WS-A) ──
  /** When the live revision was published (ISO), null before loading. */
  publishedUpdatedAt: string | null;
  /** Replaces the draft with a revision's content (published untouched; old draft backed up). */
  restoreToDraft: (revisionId: string) => Promise<MutateResult>;
  /** Publishes a revision directly; the draft is backed up and reset to it. */
  restoreAndPublish: (revisionId: string) => Promise<MutateResult>;
}

const Ctx = createContext<ContextValue | null>(null);

export function useAdminContent(): ContextValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAdminContent outside AdminContentProvider');
  return ctx;
}

/** The current (optimistic) draft document; only use below the loading gate. */
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

const STALE_DRAFT = 'The draft was changed in another tab. The latest version is loaded; check it and try again.';

export function AdminContentProvider({ children }: { children: ReactNode }) {
  const toast = useToast();
  const [phase, setPhase] = useState<'loading' | 'ready' | 'error'>('loading');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [confirmed, setConfirmedState] = useState<Confirmed | null>(null);
  const confirmedRef = useRef<Confirmed | null>(null);
  const [pending, setPending] = useState<{ id: number; reducer: Reducer }[]>([]);
  const pendingCount = useRef(0);
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

  const applyEnvelope = useCallback(
    (env: api.DraftEnvelope) => {
      const result = validateContent(env.content);
      // A stored document that fails today's schema is still shown so it can be repaired.
      const doc = result.success ? result.data : env.content;
      setConfirmed({
        doc,
        rev: env.draftRev,
        source: env.source === 'seed' ? 'seed' : 'store',
        updatedAt: env.updatedAt,
        publishedRev: env.publishedRev,
        publishedUpdatedAt: env.publishedUpdatedAt,
        hasUnpublishedChanges: env.hasUnpublishedChanges,
      });
    },
    [setConfirmed],
  );

  const fetchLatest = useCallback(async () => {
    applyEnvelope(await api.getDraft());
  }, [applyEnvelope]);

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

  /** Runs `fn` after every queued save (and before any later one). */
  const enqueue = useCallback(<T,>(fn: () => Promise<T>): Promise<T> => {
    const run = queue.current.then(fn);
    queue.current = run.catch(() => undefined);
    return run;
  }, []);

  const commit = useCallback(
    async (reducer: Reducer, retried = false): Promise<MutateResult> => {
      const base = confirmedRef.current;
      if (!base) return { ok: false, message: 'Content is not loaded yet' };
      const next = reducer(base.doc);
      if (next === base.doc) return { ok: true };
      const result = validateContent(next);
      if (!result.success) return { ok: false, message: issueMessage(result.issues), issues: result.issues };
      try {
        const saved = await api.putDraft(result.data, base.rev);
        setConfirmed({
          ...base,
          doc: { ...result.data, updatedAt: saved.updatedAt },
          rev: saved.draftRev,
          source: 'store',
          updatedAt: saved.updatedAt,
          hasUnpublishedChanges: saved.hasUnpublishedChanges,
        });
        return { ok: true };
      } catch (err) {
        const e = err as api.ApiError;
        if (e.status === 412 && !retried) {
          try {
            await fetchLatest();
          } catch {
            return { ok: false, message: 'The draft changed elsewhere and could not be reloaded' };
          }
          return commit(reducer, true);
        }
        if (e.status === 412) {
          setConflict(true);
          return { ok: false, message: 'The draft was changed in another tab or by a restore.', code: 'stale_draft' };
        }
        if (e.status === 400 && e.issues.length) {
          return { ok: false, message: issueMessage(e.issues), issues: e.issues };
        }
        return { ok: false, message: e.message || 'Save failed', code: e.code };
      }
    },
    [fetchLatest, setConfirmed],
  );

  const mutate = useCallback(
    (reducer: Reducer, opts: MutateOptions = {}): Promise<MutateResult> => {
      const id = ++counter.current;
      pendingCount.current++;
      setPending((p) => [...p, { id, reducer }]);
      setSaveState('saving');
      window.clearTimeout(savedTimer.current);
      return enqueue(async () => {
        const res = await commit(reducer);
        pendingCount.current--;
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
    },
    [commit, enqueue, toast],
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

  const flush = useCallback(async () => {
    let current: Promise<unknown>;
    do {
      current = queue.current;
      await current;
    } while (current !== queue.current);
  }, []);

  /** Maps a failed draft-level request; reloads the draft after a 412 so the UI shows the latest. */
  const failure = useCallback(
    async (err: unknown): Promise<MutateResult> => {
      const e = err as api.ApiError;
      if (e.status === 412) {
        try {
          await fetchLatest();
        } catch {
          // keep the current view; the message still explains what happened
        }
        return { ok: false, code: 'stale_draft', message: STALE_DRAFT };
      }
      if (e.status === 409 && e.code === 'published_changed') {
        return {
          ok: false,
          code: 'published_changed',
          message: 'The live site was published from somewhere else after this draft was started.',
        };
      }
      if (e.status === 400 && e.issues?.length) {
        return { ok: false, code: e.code, message: issueMessage(e.issues), issues: e.issues };
      }
      return { ok: false, code: e.code, message: e.message || 'Request failed' };
    },
    [fetchLatest],
  );

  const publish = useCallback(
    (opts?: { force?: boolean }): Promise<MutateResult> =>
      enqueue(async () => {
        const base = confirmedRef.current;
        if (!base) return { ok: false, message: 'Content is not loaded yet' };
        try {
          const res = await api.publish(base.rev, opts?.force === true);
          if (res.draftRev !== base.rev + 1) {
            // The server rebased a draft another tab saved meanwhile: load it.
            await fetchLatest();
          } else {
            setConfirmed({
              ...base,
              rev: res.draftRev,
              source: 'store',
              publishedRev: res.publishedRev,
              publishedUpdatedAt: res.updatedAt,
              hasUnpublishedChanges: false,
            });
          }
          return { ok: true };
        } catch (err) {
          return failure(err);
        }
      }),
    [enqueue, failure, fetchLatest, setConfirmed],
  );

  const discardDraft = useCallback(
    (): Promise<MutateResult> =>
      enqueue(async () => {
        const base = confirmedRef.current;
        if (!base) return { ok: false, message: 'Content is not loaded yet' };
        try {
          applyEnvelope(await api.discardDraft(base.rev));
          return { ok: true };
        } catch (err) {
          return failure(err);
        }
      }),
    [applyEnvelope, enqueue, failure],
  );

  const restoreToDraft = useCallback(
    (revisionId: string): Promise<MutateResult> =>
      enqueue(async () => {
        const base = confirmedRef.current;
        if (!base) return { ok: false, message: 'Content is not loaded yet' };
        try {
          await api.restoreToDraft(revisionId, base.rev);
          await fetchLatest();
          return { ok: true };
        } catch (err) {
          return failure(err);
        }
      }),
    [enqueue, failure, fetchLatest],
  );

  const restoreAndPublish = useCallback(
    (revisionId: string): Promise<MutateResult> =>
      enqueue(async () => {
        const base = confirmedRef.current;
        if (!base) return { ok: false, message: 'Content is not loaded yet' };
        try {
          await api.restoreRevision(revisionId, base.publishedRev);
          await fetchLatest();
          return { ok: true };
        } catch (err) {
          const e = err as api.ApiError;
          if (e.status === 412) {
            try {
              await fetchLatest();
            } catch {
              // ignore
            }
            return { ok: false, code: 'stale_revision', message: 'The live site changed meanwhile. The latest state is loaded; try again.' };
          }
          return failure(err);
        }
      }),
    [enqueue, failure, fetchLatest],
  );

  // Keep the publish status fresh when coming back to the tab (another tab may have published
  // or saved the draft). Only reloads the document when nothing is waiting to be saved.
  useEffect(() => {
    if (phase !== 'ready') return;
    let busy = false;
    const refresh = async () => {
      if (busy || document.visibilityState !== 'visible') return;
      busy = true;
      try {
        const s = await api.getStatus();
        const base = confirmedRef.current;
        if (!base) return;
        if (s.draftRev !== base.rev) {
          if (pendingCount.current === 0) await enqueue(fetchLatest);
        } else if (s.publishedRev !== base.publishedRev || s.hasUnpublishedChanges !== base.hasUnpublishedChanges) {
          setConfirmed({
            ...base,
            publishedRev: s.publishedRev,
            publishedUpdatedAt: s.publishedUpdatedAt,
            hasUnpublishedChanges: s.hasUnpublishedChanges,
          });
        }
      } catch {
        // Status is advisory; the next save reports real problems.
      } finally {
        busy = false;
      }
    };
    const onVisible = () => void refresh();
    window.addEventListener('focus', onVisible);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener('focus', onVisible);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [phase, enqueue, fetchLatest, setConfirmed]);

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
    publishedRev: confirmed?.publishedRev ?? 0,
    hasUnpublishedChanges: confirmed?.hasUnpublishedChanges ?? false,
    publish,
    discardDraft,
    flush,
    publishedUpdatedAt: confirmed?.publishedUpdatedAt ?? null,
    restoreToDraft,
    restoreAndPublish,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
