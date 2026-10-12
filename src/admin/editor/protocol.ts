// postMessage protocol between the admin editor (parent) and the canvas iframe (same-origin srcdoc).
// FROZEN contract (additive changes only, with orchestrator approval).
//
// Rules (both sides):
//  - every message is `{ p: PROTOCOL, type, ... }`;
//  - accept only if `e.origin === window.origin` (in about:srcdoc `location.origin` is "null",
//    so never use location.origin) AND `e.source` is the expected window
//    (canvas: window.parent; parent: iframe.contentWindow) AND the tag/type are known;
//  - post with targetOrigin `window.origin`, never '*'.
// No zod here: the canvas chunk imports this file and must stay free of zod / api.ts / admin state.
import { CANVAS_META_NAME } from '../../content/editable';
import type { Content, PageKey } from '../../content/types';

export { CANVAS_META_NAME };

export const PROTOCOL = 'portfolio-editor/v1' as const;

export type CanvasMode = 'edit' | 'preview';
export type EditKind = import('../../content/editable').EditKind;
export type CanvasAction = 'edit' | 'delete' | 'duplicate' | 'moveUp' | 'moveDown' | 'hide' | 'selectParent';

// ── Parent -> canvas ─────────────────────────────────────────
export type ParentToCanvas =
  /** Full state; the parent throttles these to one per animation frame. */
  | { type: 'render'; doc: Content; page: PageKey; mode: CanvasMode; selected: string | null }
  | { type: 'select'; target: string | null; scroll?: boolean }
  | { type: 'mode'; mode: CanvasMode }
  | { type: 'page'; page: PageKey };

// ── Canvas -> parent ─────────────────────────────────────────
export type CanvasToParent =
  | { type: 'ready' }
  | { type: 'hover'; target: string | null }
  | { type: 'select'; target: string; kind: EditKind }
  | { type: 'inlineCommit'; target: string; value: string }
  | { type: 'inlineCancel'; target: string }
  | { type: 'openImage'; target: string }
  /** Preview-mode link navigation inside the canvas MemoryRouter. */
  | { type: 'navigate'; page: PageKey }
  | { type: 'action'; action: CanvasAction; target: string }
  /** Shortcuts pressed while focus is inside the canvas. */
  | { type: 'key'; key: string; ctrl: boolean; shift: boolean; alt: boolean; meta: boolean };

export type Envelope<M> = M & { p: typeof PROTOCOL };

const PARENT_TO_CANVAS_TYPES: ReadonlySet<string> = new Set<ParentToCanvas['type']>(['render', 'select', 'mode', 'page']);
const CANVAS_TO_PARENT_TYPES: ReadonlySet<string> = new Set<CanvasToParent['type']>([
  'ready',
  'hover',
  'select',
  'inlineCommit',
  'inlineCancel',
  'openImage',
  'navigate',
  'action',
  'key',
]);

function hasTag(data: unknown): data is { p: string; type: string } {
  return (
    !!data &&
    typeof data === 'object' &&
    (data as { p?: unknown }).p === PROTOCOL &&
    typeof (data as { type?: unknown }).type === 'string'
  );
}

/** Origin + source + tag + type check. Returns the message or null. */
function accept<M>(e: MessageEvent, expectedSource: MessageEventSource | null | undefined, types: ReadonlySet<string>): M | null {
  if (e.origin !== window.origin) return null;
  if (!expectedSource || e.source !== expectedSource) return null;
  if (!hasTag(e.data) || !types.has(e.data.type)) return null;
  return e.data as unknown as M;
}

/** Canvas side: accept a message from the parent editor. */
export function acceptFromParent(e: MessageEvent): Envelope<ParentToCanvas> | null {
  return accept<Envelope<ParentToCanvas>>(e, window.parent, PARENT_TO_CANVAS_TYPES);
}

/** Parent side: accept a message from the canvas iframe. */
export function acceptFromCanvas(e: MessageEvent, iframe: HTMLIFrameElement | null): Envelope<CanvasToParent> | null {
  return accept<Envelope<CanvasToParent>>(e, iframe?.contentWindow, CANVAS_TO_PARENT_TYPES);
}

/** Parent side: send to the canvas. No-op until the iframe has a window. */
export function postToCanvas(iframe: HTMLIFrameElement | null, msg: ParentToCanvas): void {
  iframe?.contentWindow?.postMessage({ ...msg, p: PROTOCOL }, window.origin);
}

/** Canvas side: send to the parent editor. */
export function postToParent(msg: CanvasToParent): void {
  if (window.parent === window) return;
  window.parent.postMessage({ ...msg, p: PROTOCOL }, window.origin);
}

/**
 * Builds the canvas srcdoc from the SPA's index.html: injects the canvas meta right after <head>
 * and removes the public /api/content preload (the canvas gets its document via `render`).
 */
export function buildCanvasSrcdoc(indexHtml: string): string {
  return indexHtml
    .replace(/<head([^>]*)>/i, `<head$1><meta name="${CANVAS_META_NAME}" content="1">`)
    .replace(/<link[^>]*href="\/api\/content"[^>]*>\s*/i, '');
}
