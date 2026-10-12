// Editor canvas: runs inside the editor's same-origin srcdoc iframe (booted by App.tsx when the
// canvas meta is present) and renders the real public layout from the document the parent sends.
// Must NOT import zod, ../../api or ../../state (keeps this chunk small and side-effect free).
//
// Edit mode: capture-phase listeners make links/forms inert, clicks select `[data-ed]` targets,
// double-click starts inline text editing, and an overlay draws hover/selection + a mini toolbar.
// Preview mode: no overlay; internal links navigate the MemoryRouter (reported to the parent),
// external links open a new tab, forms never submit.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom';
import { MotionConfig } from 'motion/react';
import PortfolioLayout from '../../../components/layout/PortfolioLayout';
import { StaticContentProvider } from '../../../content/ContentProvider';
import { EditContext, type EditBridge, type EditKind } from '../../../content/editable';
import { PAGE_PATH, pageFromPath } from '../../../content/layout';
import type { Content, PageKey } from '../../../content/types';
import { acceptFromParent, postToParent, type CanvasAction, type CanvasMode } from '../protocol';
import { inlineMaxLength, readTargetValue } from '../targets';
import { canInlineEdit, startInline, type InlineSession } from './inline';
import Overlay, { findTargetEl } from './Overlay';

interface CanvasState {
  doc: Content;
  page: PageKey;
  mode: CanvasMode;
  selected: string | null;
}

const bridge: EditBridge = {
  attrs: (target, kind) => ({ 'data-ed': target, 'data-ed-kind': kind }),
};

const EDIT_CSS = `
[data-ed]{cursor:default}
[data-ed-kind="text"]{cursor:text}
[contenteditable]{caret-color:#00abf0}
html{scroll-behavior:auto!important}
`;

function edTarget(el: EventTarget | null): HTMLElement | null {
  return el instanceof Element ? (el.closest('[data-ed]') as HTMLElement | null) : null;
}
const inOverlay = (el: EventTarget | null) => el instanceof Element && !!el.closest('[data-editor-overlay]');

/** Keys forwarded to the parent (its shortcut handler runs them). */
function isShortcut(e: KeyboardEvent, mode: CanvasMode): boolean {
  const mod = e.ctrlKey || e.metaKey;
  const k = e.key.toLowerCase();
  if (mod && (k === 'z' || k === 'y' || k === 's')) return true;
  if (e.altKey && (k === 'p' || e.code === 'KeyP')) return true;
  if (mode === 'preview') return false;
  if (e.key === 'Delete' || e.key === 'Backspace' || e.key === 'Escape' || e.key === 'F2' || e.key === '?') return true;
  if (e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) return true;
  return false;
}

/** Reports in-canvas navigation (preview) and follows parent page changes without remounting. */
function RouteSync({ page, onPage }: { page: PageKey; onPage: (p: PageKey) => void }) {
  const { pathname } = useLocation();
  useEffect(() => {
    const p = pageFromPath(pathname);
    if (p) onPage(p);
  }, [pathname, onPage]);
  void page;
  return null;
}

/** Preview mode: same-document behaviour of links that React Router does not handle. */
function PreviewLinks({ active }: { active: boolean }) {
  const navigate = useNavigate();
  useEffect(() => {
    if (!active) return;
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return;
      const a = e.target instanceof Element ? (e.target.closest('a[href]') as HTMLAnchorElement | null) : null;
      if (!a) return;
      const href = a.getAttribute('href') ?? '';
      if (href.startsWith('#')) return;
      if (a.target === '_blank') return;
      e.preventDefault();
      if (href.startsWith('/') && !href.startsWith('//') && !a.hasAttribute('download')) navigate(href);
      else window.open(a.href, '_blank', 'noopener,noreferrer');
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [active, navigate]);
  return null;
}

export default function CanvasApp() {
  const [state, setState] = useState<CanvasState | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;
  const [routerKey, setRouterKey] = useState<{ page: PageKey; n: number } | null>(null);
  const routerPage = useRef<PageKey | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const preferredEl = useRef<Element | null>(null);
  const inline = useRef<InlineSession | null>(null);
  const [inlineTarget, setInlineTarget] = useState<string | null>(null);
  const deferred = useRef<CanvasState | null>(null);
  /** Optimistic inline value shown until the parent's next render (reverted first so React reconciles). */
  const optimistic = useRef<{ node: Text; original: string } | null>(null);

  const applyState = useCallback((next: CanvasState) => {
    const opt = optimistic.current;
    if (opt) {
      optimistic.current = null;
      if (opt.node.isConnected) opt.node.data = opt.original;
    }
    flushSync(() => setState(next));
    if (routerPage.current !== next.page) {
      routerPage.current = next.page;
      setRouterKey((k) => ({ page: next.page, n: (k?.n ?? 0) + 1 }));
    }
  }, []);

  const endInline = useCallback((commit: boolean) => {
    const session = inline.current;
    if (!session) return;
    inline.current = null;
    const value = session.finish(commit);
    setInlineTarget(null);
    if (value !== null) {
      const node = session.el.firstChild;
      if (node instanceof Text) {
        optimistic.current = { node, original: node.data };
        node.data = value;
      }
      postToParent({ type: 'inlineCommit', target: session.target, value });
    } else {
      postToParent({ type: 'inlineCancel', target: session.target });
    }
    const pending = deferred.current;
    deferred.current = null;
    if (pending) applyState(pending);
  }, [applyState]);

  const selectLocal = useCallback((target: string, kind: EditKind, el: Element | null) => {
    preferredEl.current = el;
    setState((s) => (s ? { ...s, selected: target } : s));
    postToParent({ type: 'select', target, kind });
  }, []);

  const tryInline = useCallback(
    (el: HTMLElement) => {
      const s = stateRef.current;
      const target = el.getAttribute('data-ed');
      if (!s || !target) return;
      if (el.getAttribute('data-ed-kind') !== 'text' || !canInlineEdit(el, readTargetValue(s.doc, s.page, target))) {
        postToParent({ type: 'action', action: 'edit', target });
        return;
      }
      endInline(true);
      inline.current = startInline(el, target, inlineMaxLength(target), (commit) => endInline(commit));
      setInlineTarget(target);
    },
    [endInline],
  );

  // ── Messages from the parent ──
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      const msg = acceptFromParent(e);
      if (!msg) return;
      const cur = stateRef.current;
      switch (msg.type) {
        case 'render': {
          const next: CanvasState = { doc: msg.doc, page: msg.page, mode: msg.mode, selected: msg.selected };
          if (inline.current) deferred.current = next;
          else applyState(next);
          break;
        }
        case 'mode':
          if (cur) applyState({ ...cur, mode: msg.mode });
          break;
        case 'page':
          if (cur) applyState({ ...cur, page: msg.page });
          break;
        case 'select': {
          if (!cur) break;
          if (inline.current && inline.current.target !== msg.target) endInline(true);
          setState((s) => (s ? { ...s, selected: msg.target } : s));
          if (msg.target && msg.scroll) {
            const target = msg.target;
            // Retry for ~1s: the element may appear only after the next render (new item, page switch).
            let tries = 0;
            const attempt = () => {
              const el = findTargetEl(target);
              if (!el) {
                if (tries++ < 60) requestAnimationFrame(attempt);
                return;
              }
              const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
              el.scrollIntoView({ block: 'center', behavior: reduce ? 'instant' : 'smooth' });
            };
            requestAnimationFrame(attempt);
          }
          break;
        }
      }
    };
    window.addEventListener('message', onMessage);
    postToParent({ type: 'ready' });
    return () => window.removeEventListener('message', onMessage);
  }, [applyState, endInline]);

  const mode = state?.mode ?? 'edit';

  // ── Keyboard (both modes): forward editor shortcuts so they work while focus is in the canvas ──
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (inline.current) {
        if (e.key === 'Enter') {
          e.preventDefault();
          endInline(true);
        } else if (e.key === 'Escape') {
          e.preventDefault();
          endInline(false);
        } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
          e.preventDefault();
          endInline(true);
          postToParent({ type: 'key', key: e.key, ctrl: e.ctrlKey, shift: e.shiftKey, alt: e.altKey, meta: e.metaKey });
        }
        return;
      }
      const s = stateRef.current;
      if (s?.mode === 'edit' && (e.key === 'Enter' || e.key === 'F2') && s.selected && !(e.target instanceof HTMLButtonElement)) {
        const el = findTargetEl(s.selected, preferredEl.current);
        e.preventDefault();
        if (e.key === 'Enter' && el) tryInline(el);
        else postToParent({ type: 'action', action: 'edit', target: s.selected });
        return;
      }
      if (!isShortcut(e, s?.mode ?? 'edit')) return;
      e.preventDefault();
      e.stopPropagation();
      postToParent({ type: 'key', key: e.key, ctrl: e.ctrlKey, shift: e.shiftKey, alt: e.altKey, meta: e.metaKey });
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [endInline, tryInline]);

  // ── Edit-mode pointer handling ──
  useEffect(() => {
    if (mode !== 'edit') {
      setHovered(null);
      return;
    }
    const style = document.createElement('style');
    style.setAttribute('data-editor-style', '');
    style.textContent = EDIT_CSS;
    document.head.appendChild(style);

    const inEditable = (t: EventTarget | null) => !!inline.current && t instanceof Node && inline.current.el.contains(t);

    const block = (e: Event) => {
      if (inOverlay(e.target) || inEditable(e.target)) return;
      e.preventDefault();
      e.stopPropagation();
    };
    const onPointerDown = (e: PointerEvent) => {
      if (inOverlay(e.target) || inEditable(e.target)) return;
      e.preventDefault();
    };
    const onClick = (e: MouseEvent) => {
      if (inOverlay(e.target) || inEditable(e.target)) return;
      e.preventDefault();
      e.stopPropagation();
      if (inline.current) endInline(true);
      const el = edTarget(e.target);
      const target = el?.getAttribute('data-ed');
      if (el && target) selectLocal(target, (el.getAttribute('data-ed-kind') as EditKind) ?? 'field', el);
    };
    const onDblClick = (e: MouseEvent) => {
      if (inOverlay(e.target) || inEditable(e.target)) return;
      e.preventDefault();
      e.stopPropagation();
      const el = edTarget(e.target);
      const target = el?.getAttribute('data-ed');
      if (!el || !target) return;
      const kind = el.getAttribute('data-ed-kind');
      if (kind === 'image') postToParent({ type: 'openImage', target });
      else tryInline(el);
    };
    let lastHover: string | null = null;
    const onMove = (e: PointerEvent) => {
      if (inOverlay(e.target)) return;
      const target = edTarget(e.target)?.getAttribute('data-ed') ?? null;
      if (target === lastHover) return;
      lastHover = target;
      setHovered(target);
      postToParent({ type: 'hover', target });
    };
    const onLeave = () => {
      lastHover = null;
      setHovered(null);
      postToParent({ type: 'hover', target: null });
    };

    window.addEventListener('pointerdown', onPointerDown, true);
    window.addEventListener('mousedown', block, true);
    window.addEventListener('click', onClick, true);
    window.addEventListener('auxclick', block, true);
    window.addEventListener('dblclick', onDblClick, true);
    window.addEventListener('dragstart', block, true);
    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    return () => {
      style.remove();
      window.removeEventListener('pointerdown', onPointerDown, true);
      window.removeEventListener('mousedown', block, true);
      window.removeEventListener('click', onClick, true);
      window.removeEventListener('auxclick', block, true);
      window.removeEventListener('dblclick', onDblClick, true);
      window.removeEventListener('dragstart', block, true);
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
    };
  }, [mode, endInline, selectLocal, tryInline]);

  // Forms never submit inside the canvas.
  useEffect(() => {
    const onSubmit = (e: Event) => e.preventDefault();
    window.addEventListener('submit', onSubmit, true);
    return () => window.removeEventListener('submit', onSubmit, true);
  }, []);

  const onOverlayAction = useCallback(
    (action: CanvasAction, target: string) => {
      if (action === 'selectParent') {
        const el = findTargetEl(target, preferredEl.current);
        const parent = el?.parentElement ? edTarget(el.parentElement) : null;
        const pt = parent?.getAttribute('data-ed');
        if (parent && pt) {
          selectLocal(pt, (parent.getAttribute('data-ed-kind') as EditKind) ?? 'field', parent);
          return;
        }
      }
      if (action === 'edit') {
        const el = findTargetEl(target, preferredEl.current);
        if (el?.getAttribute('data-ed-kind') === 'image') {
          postToParent({ type: 'openImage', target });
          return;
        }
      }
      postToParent({ type: 'action', action, target });
    },
    [selectLocal],
  );

  const onPage = useCallback((p: PageKey) => {
    routerPage.current = p;
    const s = stateRef.current;
    if (s && s.page !== p) {
      setState({ ...s, page: p, selected: null });
      postToParent({ type: 'navigate', page: p });
    }
  }, []);

  const edit = useMemo(() => (state?.mode === 'edit' ? bridge : null), [state?.mode]);

  if (!state || !routerKey) return null;
  return (
    <MotionConfig reducedMotion="user">
      <MemoryRouter key={`${routerKey.page}-${routerKey.n}`} initialEntries={[PAGE_PATH[routerKey.page]]}>
        <StaticContentProvider content={state.doc}>
          <EditContext.Provider value={edit}>
            <PortfolioLayout />
          </EditContext.Provider>
        </StaticContentProvider>
        <RouteSync page={state.page} onPage={onPage} />
        <PreviewLinks active={state.mode === 'preview'} />
      </MemoryRouter>
      {state.mode === 'edit' && (
        <Overlay
          doc={state.doc}
          page={state.page}
          selected={state.selected}
          hovered={hovered}
          preferredEl={preferredEl.current}
          inlineTarget={inlineTarget}
          onAction={onOverlayAction}
        />
      )}
    </MotionConfig>
  );
}
