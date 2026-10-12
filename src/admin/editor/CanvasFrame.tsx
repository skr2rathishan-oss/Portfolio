// The canvas: a same-origin srcdoc iframe running the real SPA bundle at a real device width.
// srcdoc documents are not HTTP responses, so X-Frame-Options / frame-ancestors (netlify.toml)
// do not apply and stay DENY / 'none'. The iframe is scaled down to fit the pane; the browser maps
// pointer events through the transform.
import { Loader2 } from 'lucide-react';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { PAGE_LABEL } from '../../content/layout';
import type { CanvasAction } from './protocol';
import { acceptFromCanvas, buildCanvasSrcdoc, postToCanvas } from './protocol';
import { DEVICE_LABEL, DEVICE_WIDTH, useEditor } from './state/EditorContext';

let srcdocPromise: Promise<string> | null = null;
function loadSrcdoc(): Promise<string> {
  srcdocPromise ??= fetch('/index.html', { cache: 'no-store', credentials: 'same-origin' })
    .then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.text();
    })
    .then(buildCanvasSrcdoc)
    .catch((err: Error) => {
      srcdocPromise = null;
      throw err;
    });
  return srcdocPromise;
}

export interface CanvasHandlers {
  onAction: (action: CanvasAction, target: string) => void;
  onInlineCommit: (target: string, value: string) => Promise<unknown>;
  onKey: (key: { key: string; ctrl: boolean; shift: boolean; alt: boolean; meta: boolean }) => void;
}

export function CanvasFrame({ handlers }: { handlers: CanvasHandlers }) {
  const { doc, page, setPage, mode, device, selected, select, scrollNonce, setHovered, openImage } = useEditor();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const paneRef = useRef<HTMLDivElement>(null);
  const [srcdoc, setSrcdoc] = useState<string | null>(null);
  const [bootError, setBootError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [pane, setPane] = useState({ w: 0, h: 0 });
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    let alive = true;
    loadSrcdoc()
      .then((html) => alive && setSrcdoc(html))
      .catch((err: Error) => alive && setBootError(`The canvas could not load the site (${err.message}).`));
    return () => {
      alive = false;
    };
  }, []);

  useLayoutEffect(() => {
    const el = paneRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const r = entry.contentRect;
      setPane({ w: Math.floor(r.width), h: Math.floor(r.height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ── Render: one message per animation frame with the latest state ──
  const latest = useRef({ doc, page, mode, selected });
  latest.current = { doc, page, mode, selected };
  const rafId = useRef(0);
  const postRender = useCallback(() => {
    if (rafId.current) return;
    rafId.current = requestAnimationFrame(() => {
      rafId.current = 0;
      const s = latest.current;
      postToCanvas(iframeRef.current, { type: 'render', doc: s.doc, page: s.page, mode: s.mode, selected: s.selected });
    });
  }, []);
  useEffect(() => {
    if (ready) postRender();
  }, [ready, doc, page, mode, selected, postRender]);
  useEffect(() => () => cancelAnimationFrame(rafId.current), []);

  useEffect(() => {
    if (ready && scrollNonce) postToCanvas(iframeRef.current, { type: 'select', target: latest.current.selected, scroll: true });
  }, [ready, scrollNonce]);

  // ── Messages from the canvas ──
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      const msg = acceptFromCanvas(e, iframeRef.current);
      if (!msg) return;
      switch (msg.type) {
        case 'ready':
          setReady(true);
          postRender();
          break;
        case 'hover':
          setHovered(msg.target);
          break;
        case 'select':
          select(msg.target);
          break;
        case 'inlineCommit':
          // The canvas shows the value optimistically until the next render, so always send one.
          void handlersRef.current.onInlineCommit(msg.target, msg.value).finally(postRender);
          break;
        case 'inlineCancel':
          break;
        case 'openImage':
          select(msg.target);
          openImage(msg.target);
          break;
        case 'navigate':
          setPage(msg.page);
          break;
        case 'action':
          handlersRef.current.onAction(msg.action, msg.target);
          break;
        case 'key':
          handlersRef.current.onKey(msg);
          break;
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [postRender, select, setHovered, openImage, setPage]);

  const width = DEVICE_WIDTH[device];
  const gutter = 32;
  const scale = pane.w ? Math.min(1, (pane.w - gutter) / width) : 1;
  const frameH = pane.h ? Math.max(200, (pane.h - gutter) / scale) : 800;
  const shownW = Math.round(width * scale);

  return (
    <div
      ref={paneRef}
      className="relative min-h-0 min-w-0 flex-1 overflow-hidden bg-[#050d16] [background-image:radial-gradient(rgba(0,171,240,0.06)_1px,transparent_1px)] [background-size:20px_20px]"
    >
      <div className="absolute left-1/2 top-4 -translate-x-1/2" style={{ width: shownW }}>
        <div
          className="overflow-hidden rounded-md shadow-[0_0_0_1px_#1f3d5c,0_24px_60px_rgba(0,0,0,0.55)]"
          style={{ width: shownW, height: Math.round(frameH * scale), background: '#06101c' }}
        >
          {srcdoc && (
            <iframe
              ref={iframeRef}
              title={`Canvas: ${PAGE_LABEL[page]}, ${mode === 'edit' ? 'edit mode' : 'preview'}, ${DEVICE_LABEL[device].toLowerCase()} ${width}px`}
              srcDoc={srcdoc}
              style={{
                width,
                height: frameH,
                border: 0,
                display: 'block',
                transform: `scale(${scale})`,
                transformOrigin: '0 0',
                background: '#06101c',
              }}
            />
          )}
        </div>
      </div>
      {(!ready || bootError) && (
        <div className="absolute inset-0 flex items-center justify-center" aria-busy={!bootError}>
          <div className="flex items-center gap-3 rounded-xl border border-[#1f3d5c] bg-[#0b1c2e] px-4 py-3 text-sm text-[#b8c9d9]">
            {bootError ? (
              <span className="text-[#ff8a8a]">{bootError}</span>
            ) : (
              <>
                <Loader2 size={16} className="animate-spin text-[#00abf0]" aria-hidden="true" /> Loading the canvas…
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
