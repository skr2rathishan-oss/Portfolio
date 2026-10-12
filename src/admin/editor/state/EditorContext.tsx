// Visual editor state: page / device / mode / selection, undo-redo history and UI requests.
//
// History: every editor change goes through `apply(reducer, {coalesceKey})`, which records the
// document before the change and then calls the shared AdminContentContext `mutate` (one PUT to the
// draft). Changes with the same coalesceKey within 1s (typing in a field) share one undo step.
// Undo/redo are `mutate(() => snapshot)`. Stacks are cleared on publish, discard and conflicts.
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useSearchParams } from 'react-router-dom';
import { PAGE_KEYS } from '../../../content/layout';
import type { Content, PageKey } from '../../../content/types';
import type { Reducer } from '../../lib/reducers';
import { useAdminContent, type MutateResult } from '../../state/AdminContentContext';
import type { CanvasMode } from '../protocol';

export type Device = 'desktop' | 'tablet' | 'mobile';
export const DEVICE_WIDTH: Record<Device, number> = { desktop: 1440, tablet: 768, mobile: 390 };
export const DEVICE_LABEL: Record<Device, string> = { desktop: 'Desktop', tablet: 'Tablet', mobile: 'Mobile' };

const HISTORY_MAX = 100;
const COALESCE_MS = 1000;

export interface ApplyOptions {
  /** Same key within 1s = one undo step (e.g. `panel:item:projects:prj_x`). */
  coalesceKey?: string;
  /** Toast on success. */
  success?: string;
  /** Do not toast validation errors (caller shows them inline). */
  quiet?: boolean;
}

export interface ConfirmRequest {
  title: string;
  message: ReactNode;
  confirmLabel: string;
  tone?: 'danger' | 'primary';
  onConfirm: () => void | Promise<void>;
}

interface EditorValue {
  doc: Content;
  page: PageKey;
  /** `select`: target to select (and scroll to) once the new page is shown. */
  setPage: (p: PageKey, opts?: { select?: string }) => void;
  device: Device;
  setDevice: (d: Device) => void;
  mode: CanvasMode;
  setMode: (m: CanvasMode) => void;
  selected: string | null;
  /** `scroll` asks the canvas to bring the element into view (selection from Layers/toolbar). */
  select: (target: string | null, opts?: { scroll?: boolean }) => void;
  /** Increments whenever the canvas should scroll to the selection. */
  scrollNonce: number;
  hovered: string | null;
  setHovered: (t: string | null) => void;

  apply: (reducer: Reducer, opts?: ApplyOptions) => Promise<MutateResult>;
  /** Records a change made outside `apply` (e.g. EntityDialog saved) as one undo step. */
  recordExternal: (before: Content) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  clearHistory: () => void;

  announce: (msg: string) => void;
  announcement: string;

  confirm: ConfirmRequest | null;
  askConfirm: (req: ConfirmRequest | null) => void;
  libraryOpen: boolean;
  setLibraryOpen: (open: boolean) => void;
  imageTarget: string | null;
  openImage: (target: string | null) => void;
  shortcutsOpen: boolean;
  setShortcutsOpen: (open: boolean) => void;
  /** Increments when the properties panel should take focus (Edit / Enter / F2). */
  panelFocusNonce: number;
  focusPanel: () => void;

  /** Panels register a commit function for uncommitted field edits (Save draft / leave flush them). */
  registerPending: (id: string, commit: (() => Promise<void> | void) | null) => void;
  commitPanels: () => Promise<void>;
  hasPendingPanels: () => boolean;
}

const Ctx = createContext<EditorValue | null>(null);

export function useEditor(): EditorValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useEditor outside EditorProvider');
  return v;
}

function readPref<T extends string>(key: string, allowed: readonly T[], fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v && (allowed as readonly string[]).includes(v) ? (v as T) : fallback;
  } catch {
    return fallback;
  }
}
function writePref(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // UI preference only
  }
}

export function EditorProvider({ children }: { children: ReactNode }) {
  const { doc: maybeDoc, mutate, conflict } = useAdminContent();
  const doc = maybeDoc as Content;
  const docRef = useRef(doc);
  docRef.current = doc;

  const [params, setParams] = useSearchParams();
  const pageParam = params.get('page');
  const page: PageKey = (PAGE_KEYS as readonly string[]).includes(pageParam ?? '') ? (pageParam as PageKey) : 'home';
  const afterPageSelect = useRef<string | null>(null);
  const setPage = useCallback(
    (p: PageKey, opts?: { select?: string }) => {
      afterPageSelect.current = opts?.select ?? null;
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (p === 'home') next.delete('page');
          else next.set('page', p);
          return next;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  const [device, setDeviceState] = useState<Device>(() => readPref('editor.device', ['desktop', 'tablet', 'mobile'], 'desktop'));
  const setDevice = useCallback((d: Device) => {
    setDeviceState(d);
    writePref('editor.device', d);
  }, []);
  const [mode, setMode] = useState<CanvasMode>('edit');

  const [selected, setSelected] = useState<string | null>(null);
  const [scrollNonce, setScrollNonce] = useState(0);
  const select = useCallback((target: string | null, opts?: { scroll?: boolean }) => {
    setSelected(target);
    if (opts?.scroll && target) setScrollNonce((n) => n + 1);
  }, []);
  const [hovered, setHovered] = useState<string | null>(null);

  // Selection belongs to a page.
  const lastPage = useRef(page);
  useEffect(() => {
    if (lastPage.current !== page) {
      lastPage.current = page;
      const next = afterPageSelect.current;
      afterPageSelect.current = null;
      setSelected(next);
      setHovered(null);
      if (next) setScrollNonce((n) => n + 1);
    }
  }, [page]);

  // ── History ──
  const past = useRef<Content[]>([]);
  const future = useRef<Content[]>([]);
  const last = useRef<{ key: string; at: number } | null>(null);
  const [, setHistVersion] = useState(0);
  const bump = () => setHistVersion((v) => v + 1);

  const clearHistory = useCallback(() => {
    past.current = [];
    future.current = [];
    last.current = null;
    bump();
  }, []);

  const push = (before: Content) => {
    past.current.push(before);
    if (past.current.length > HISTORY_MAX) past.current.shift();
    future.current = [];
  };

  const apply = useCallback(
    async (reducer: Reducer, opts: ApplyOptions = {}): Promise<MutateResult> => {
      const before = docRef.current;
      let next: Content;
      try {
        next = reducer(before);
      } catch (err) {
        return { ok: false, message: (err as Error).message };
      }
      if (next === before) return { ok: true };
      const now = Date.now();
      const coalesce = !!opts.coalesceKey && last.current?.key === opts.coalesceKey && now - last.current.at < COALESCE_MS;
      if (!coalesce) push(before);
      last.current = opts.coalesceKey ? { key: opts.coalesceKey, at: now } : null;
      bump();
      const res = await mutate(reducer, { success: opts.success, quietValidation: opts.quiet });
      if (!res.ok && !coalesce) {
        const i = past.current.lastIndexOf(before);
        if (i >= 0) past.current.splice(i, 1);
        last.current = null;
        bump();
      }
      return res;
    },
    [mutate],
  );

  const recordExternal = useCallback((before: Content) => {
    push(before);
    last.current = null;
    bump();
  }, []);

  const undo = useCallback(() => {
    const snap = past.current.pop();
    if (!snap) return;
    future.current.push(docRef.current);
    last.current = null;
    bump();
    void mutate(() => snap);
  }, [mutate]);

  const redo = useCallback(() => {
    const snap = future.current.pop();
    if (!snap) return;
    past.current.push(docRef.current);
    last.current = null;
    bump();
    void mutate(() => snap);
  }, [mutate]);

  useEffect(() => {
    if (conflict) clearHistory();
  }, [conflict, clearHistory]);

  // ── Live region ──
  const [announcement, setAnnouncement] = useState('');
  const announce = useCallback((msg: string) => {
    // Re-announce identical messages by toggling a zero-width suffix.
    setAnnouncement((prev) => (prev === msg ? `${msg}​` : msg));
  }, []);

  // ── UI requests ──
  const [confirm, askConfirm] = useState<ConfirmRequest | null>(null);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [imageTarget, openImage] = useState<string | null>(null);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [panelFocusNonce, setPanelFocusNonce] = useState(0);
  const focusPanel = useCallback(() => setPanelFocusNonce((n) => n + 1), []);

  const pending = useRef(new Map<string, () => Promise<void> | void>());
  const registerPending = useCallback((id: string, commit: (() => Promise<void> | void) | null) => {
    if (commit) pending.current.set(id, commit);
    else pending.current.delete(id);
  }, []);
  const commitPanels = useCallback(async () => {
    for (const fn of [...pending.current.values()]) await fn();
  }, []);
  const hasPendingPanels = useCallback(() => pending.current.size > 0, []);

  const value: EditorValue = {
    doc,
    page,
    setPage,
    device,
    setDevice,
    mode,
    setMode,
    selected,
    select,
    scrollNonce,
    hovered,
    setHovered,
    apply,
    recordExternal,
    undo,
    redo,
    canUndo: past.current.length > 0,
    canRedo: future.current.length > 0,
    clearHistory,
    announce,
    announcement,
    confirm,
    askConfirm,
    libraryOpen,
    setLibraryOpen,
    imageTarget,
    openImage,
    shortcutsOpen,
    setShortcutsOpen,
    panelFocusNonce,
    focusPanel,
    registerPending,
    commitPanels,
    hasPendingPanels,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
