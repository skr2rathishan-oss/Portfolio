// Selection / hover overlay drawn inside the canvas iframe (edit mode only).
// Position: fixed boxes recomputed every animation frame, so scrolling, resizing and layout
// changes keep them aligned. Outlines never affect layout (they are separate elements).
import { ArrowUp, ArrowDown, Copy, CornerLeftUp, Eye, EyeOff, Pencil, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { Content, PageKey } from '../../../content/types';
import type { CanvasAction } from '../protocol';
import { capabilities, describeTarget } from '../targets';

const ACCENT = '#00abf0';
const Z = 2147483000;

interface Box {
  top: number;
  left: number;
  width: number;
  height: number;
}

const sameBox = (a: Box | null, b: Box | null) =>
  a === b || (!!a && !!b && a.top === b.top && a.left === b.left && a.width === b.width && a.height === b.height);

export function findTargetEl(target: string, preferred?: Element | null): HTMLElement | null {
  if (preferred && preferred.isConnected && preferred.getAttribute('data-ed') === target) return preferred as HTMLElement;
  const all = document.querySelectorAll<HTMLElement>(`[data-ed="${CSS.escape(target)}"]`);
  for (const el of all) {
    const r = el.getBoundingClientRect();
    if (r.width > 0 || r.height > 0) return el;
  }
  return all[0] ?? null;
}

function measure(el: HTMLElement | null): Box | null {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (r.width === 0 && r.height === 0) return null;
  return { top: Math.round(r.top), left: Math.round(r.left), width: Math.round(r.width), height: Math.round(r.height) };
}

function ToolButton({ label, onClick, children, danger }: { label: string; onClick: () => void; children: ReactNode; danger?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      style={{
        all: 'unset',
        boxSizing: 'border-box',
        width: 28,
        height: 28,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 6,
        cursor: 'pointer',
        color: danger ? '#ff8a8a' : '#e8f0f7',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = danger ? 'rgba(255,107,107,0.18)' : 'rgba(255,255,255,0.10)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      onFocus={(e) => (e.currentTarget.style.boxShadow = `0 0 0 2px ${ACCENT}`)}
      onBlur={(e) => (e.currentTarget.style.boxShadow = 'none')}
    >
      {children}
    </button>
  );
}

export default function Overlay({
  doc,
  page,
  selected,
  hovered,
  preferredEl,
  inlineTarget,
  onAction,
}: {
  doc: Content;
  page: PageKey;
  selected: string | null;
  hovered: string | null;
  preferredEl: Element | null;
  inlineTarget: string | null;
  onAction: (action: CanvasAction, target: string) => void;
}) {
  const [selBox, setSelBox] = useState<Box | null>(null);
  const [hovBox, setHovBox] = useState<Box | null>(null);
  const [vw, setVw] = useState(() => window.innerWidth);
  const latest = useRef({ selected, hovered, preferredEl });
  latest.current = { selected, hovered, preferredEl };

  useEffect(() => {
    let raf = 0;
    let prevSel: Box | null = null;
    let prevHov: Box | null = null;
    const tick = () => {
      const { selected: s, hovered: h, preferredEl: pref } = latest.current;
      const nextSel = s ? measure(findTargetEl(s, pref)) : null;
      const nextHov = h && h !== s ? measure(findTargetEl(h)) : null;
      if (!sameBox(prevSel, nextSel)) setSelBox((prevSel = nextSel));
      if (!sameBox(prevHov, nextHov)) setHovBox((prevHov = nextHov));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const onResize = () => setVw(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const caps = selected ? capabilities(doc, page, selected) : null;
  const label = selected ? describeTarget(doc, page, selected) : '';
  const editing = !!inlineTarget && inlineTarget === selected;

  // Chip + toolbar sit above the box; inside it when the box touches the top of the viewport.
  const chipTop = selBox ? (selBox.top >= 34 ? selBox.top - 32 : Math.max(4, selBox.top + 4)) : 0;
  const toolbarWidth = 7 * 28 + 8;
  const toolbarLeft = selBox ? Math.min(Math.max(4, selBox.left + selBox.width - toolbarWidth), Math.max(4, vw - toolbarWidth - 4)) : 0;

  return (
    <div data-editor-overlay="" aria-hidden={false} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: Z }}>
      {hovBox && (
        <div
          style={{
            position: 'fixed',
            top: hovBox.top - 1,
            left: hovBox.left - 1,
            width: hovBox.width + 2,
            height: hovBox.height + 2,
            outline: `1px dashed rgba(0,171,240,0.75)`,
            borderRadius: 4,
          }}
        />
      )}
      {selBox && selected && (
        <>
          <div
            style={{
              position: 'fixed',
              top: selBox.top - 3,
              left: selBox.left - 3,
              width: selBox.width + 6,
              height: selBox.height + 6,
              outline: `2px solid ${ACCENT}`,
              boxShadow: '0 0 0 4px rgba(0,171,240,0.14)',
              borderRadius: 6,
            }}
          />
          <div
            style={{
              position: 'fixed',
              top: chipTop,
              left: Math.max(4, Math.min(selBox.left - 3, vw - 260)),
              maxWidth: Math.max(120, Math.min(360, toolbarLeft - selBox.left - 8)),
              height: 26,
              padding: '0 10px',
              display: 'flex',
              alignItems: 'center',
              borderRadius: 6,
              background: ACCENT,
              color: '#04141f',
              font: '600 12px/1 system-ui, -apple-system, Segoe UI, sans-serif',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {editing ? 'Editing · Enter saves · Esc cancels' : label}
          </div>
          {!editing && caps && (
            <div
              role="toolbar"
              aria-label={`Actions for ${label}`}
              style={{
                position: 'fixed',
                top: chipTop - 1,
                left: toolbarLeft,
                display: 'flex',
                gap: 0,
                padding: 1,
                borderRadius: 8,
                background: '#0b1c2e',
                border: '1px solid #27496b',
                boxShadow: '0 6px 20px rgba(0,0,0,0.45)',
                pointerEvents: 'auto',
              }}
            >
              {caps.edit && (
                <ToolButton label="Edit properties" onClick={() => onAction('edit', selected)}>
                  <Pencil size={14} aria-hidden="true" />
                </ToolButton>
              )}
              {(caps.moveUp || caps.moveDown) && (
                <>
                  <ToolButton label="Move up (Alt+↑)" onClick={() => onAction('moveUp', selected)}>
                    <ArrowUp size={14} aria-hidden="true" style={{ opacity: caps.moveUp ? 1 : 0.35 }} />
                  </ToolButton>
                  <ToolButton label="Move down (Alt+↓)" onClick={() => onAction('moveDown', selected)}>
                    <ArrowDown size={14} aria-hidden="true" style={{ opacity: caps.moveDown ? 1 : 0.35 }} />
                  </ToolButton>
                </>
              )}
              {caps.duplicate && (
                <ToolButton label="Duplicate" onClick={() => onAction('duplicate', selected)}>
                  <Copy size={14} aria-hidden="true" />
                </ToolButton>
              )}
              {caps.hide && (
                <ToolButton label={caps.visible ? 'Hide on site' : 'Show on site'} onClick={() => onAction('hide', selected)}>
                  {caps.visible ? <EyeOff size={14} aria-hidden="true" /> : <Eye size={14} aria-hidden="true" />}
                </ToolButton>
              )}
              <ToolButton label="Select parent" onClick={() => onAction('selectParent', selected)}>
                <CornerLeftUp size={14} aria-hidden="true" />
              </ToolButton>
              {caps.delete && (
                <ToolButton label="Delete" danger onClick={() => onAction('delete', selected)}>
                  <Trash2 size={14} aria-hidden="true" />
                </ToolButton>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
