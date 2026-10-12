// Right sidebar: Content | Style for the selected element, with a breadcrumb to its parents.
import { ChevronRight, EyeOff, MousePointerClick } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { PAGE_LABEL, resolvePage, sectionLabel } from '../../content/layout';
import { cx, focusRing } from '../ui/primitives';
import { ItemContent, ItemStyle } from './panels/ItemPanel';
import { BlockContent, BlockStyle, SectionContent, SectionStyle } from './panels/LayoutPanels';
import { ProfilePanel, SitePanel } from './panels/SingletonPanels';
import { useEditor } from './state/EditorContext';
import { breadcrumb, capabilities, describeTarget, galleryImageId, parseTarget, shortKind, type ParsedTarget } from './targets';

type Tab = 'content' | 'style';

function hasStyleTab(p: ParsedTarget | null): boolean {
  return !!p && (p.t === 'item' || p.t === 'field' || p.t === 'section' || (p.t === 'block' && !galleryImageId(p.prop)));
}

/** Field name to focus for a target (matches `data-field` in the forms). */
function focusFieldOf(p: ParsedTarget | null): string | null {
  if (!p) return null;
  if (p.t === 'field') return p.field.split('.')[0];
  if (p.t === 'profile') return p.path.split('.').slice(1).join('.') || null;
  if (p.t === 'site') return p.path.split('.')[0];
  if (p.t === 'section') return p.prop ?? null;
  if (p.t === 'block') return galleryImageId(p.prop) ? `images.${galleryImageId(p.prop)}` : p.prop === 'title' ? 'title' : (p.prop ?? null);
  return null;
}

function focusField(root: HTMLElement | null, field: string | null) {
  if (!root) return;
  const scope = (field && root.querySelector<HTMLElement>(`[data-field="${CSS.escape(field)}"]`)) || root;
  const control = scope.querySelector<HTMLElement>('input:not([type=hidden]):not(.sr-only), textarea, select, button[role=switch], [role=radio][tabindex="0"], button');
  scope.scrollIntoView({ block: 'nearest' });
  control?.focus();
}

function PageOverview() {
  const { doc, page, select } = useEditor();
  const sections = resolvePage(doc, page);
  return (
    <div className="space-y-5 p-4">
      <div className="flex items-start gap-3 rounded-xl border border-[#1b3550] bg-[#0a1a2b] p-4">
        <MousePointerClick size={18} className="mt-0.5 shrink-0 text-[#00abf0]" aria-hidden="true" />
        <div className="text-sm leading-relaxed text-[#b8c9d9]">
          <p className="font-medium text-white">Select something to edit it</p>
          <p className="mt-1">Click an element in the canvas or pick it in Layers. Double-click text to edit it in place.</p>
        </div>
      </div>
      <div>
        <h3 className="mb-2 text-[12px] font-semibold text-[#8ea6bd]">{PAGE_LABEL[page]} page sections</h3>
        <ul className="space-y-1">
          {sections.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => select(`section:${s.id}`, { scroll: true })}
                className={cx('flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm text-[#cfdbe6] hover:bg-white/[0.05]', focusRing)}
              >
                <span className={cx('truncate', !s.visible && 'text-[#5f7a93]')}>{sectionLabel(s)}</span>
                {!s.visible && <EyeOff size={14} className="shrink-0 text-[#5f7a93]" aria-label="Hidden" />}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="border-t border-[#1b3550] pt-4">
        <h3 className="mb-2 text-[12px] font-semibold text-[#8ea6bd]">Site-wide</h3>
        <button type="button" onClick={() => select('site:brand')} className={cx('rounded-md px-2 py-1.5 text-sm text-[#5ccdf7] hover:bg-white/[0.05]', focusRing)}>
          Site name, CV and footer
        </button>
      </div>
    </div>
  );
}

export function PropertiesPanel() {
  const { doc, page, selected, select, panelFocusNonce } = useEditor();
  const [tab, setTab] = useState<Tab>('content');
  const bodyRef = useRef<HTMLDivElement>(null);
  const p = parseTarget(selected);
  const styleable = hasStyleTab(p);
  const activeTab: Tab = styleable ? tab : 'content';

  // Explicit "Edit properties" (toolbar, Enter/F2, mini toolbar): focus the matching field.
  useEffect(() => {
    if (!panelFocusNonce) return;
    setTab('content');
    requestAnimationFrame(() => requestAnimationFrame(() => focusField(bodyRef.current, focusFieldOf(parseTarget(selected)))));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panelFocusNonce]);

  if (!selected || !p) {
    return (
      <aside aria-label="Properties" className="flex w-[340px] shrink-0 flex-col border-l border-[#14304b] bg-[#0b1c2e]">
        <header className="border-b border-[#14304b] px-4 py-3">
          <h2 className="text-sm font-semibold text-white">Properties</h2>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <PageOverview />
        </div>
      </aside>
    );
  }

  const crumbs = breadcrumb(doc, page, selected);
  const caps = capabilities(doc, page, selected);
  const tabId = (t: Tab) => `props-tab-${t}`;

  let content: React.ReactNode = null;
  let style: React.ReactNode = null;
  switch (p.t) {
    case 'item':
    case 'field':
      content = <ItemContent key={`${p.coll}:${p.id}`} coll={p.coll} id={p.id} />;
      style = <ItemStyle coll={p.coll} id={p.id} />;
      break;
    case 'profile':
      content = <ProfilePanel key={p.path.split('.')[0]} path={p.path} />;
      break;
    case 'site':
      content = <SitePanel />;
      break;
    case 'section':
      content = <SectionContent key={p.id} id={p.id} />;
      style = <SectionStyle id={p.id} />;
      break;
    case 'block':
      content = <BlockContent key={p.bid} sid={p.sid} bid={p.bid} focusImage={galleryImageId(p.prop)} />;
      style = <BlockStyle sid={p.sid} bid={p.bid} />;
      break;
  }

  return (
    <aside aria-label="Properties" className="flex w-[340px] shrink-0 flex-col border-l border-[#14304b] bg-[#0b1c2e]">
      <header className="border-b border-[#14304b] px-4 pt-3">
        <nav aria-label="Selection path" className="mb-1.5">
          <ol className="flex flex-wrap items-center gap-0.5 text-[11px] text-[#7f97ad]">
            {crumbs.slice(0, -1).map((c) => (
              <li key={c} className="flex items-center gap-0.5">
                <button type="button" onClick={() => select(c, { scroll: true })} className={cx('rounded px-1 hover:text-white', focusRing)}>
                  {shortKind(c) === 'Section' ? describeTarget(doc, page, c).replace(/^Section · /, '') : shortKind(c)}
                </button>
                <ChevronRight size={11} aria-hidden="true" />
              </li>
            ))}
          </ol>
        </nav>
        <h2 className="truncate text-sm font-semibold text-white" title={describeTarget(doc, page, selected)}>
          {describeTarget(doc, page, selected)}
        </h2>
        {!caps.visible && (
          <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-[#f5c46a]">
            <EyeOff size={12} aria-hidden="true" /> Hidden on the site
          </p>
        )}
        <div role="tablist" aria-label="Property groups" className="mt-2 flex gap-1">
          {(['content', 'style'] as Tab[]).map((t) => {
            const disabled = t === 'style' && !styleable;
            if (disabled) return null;
            const on = activeTab === t;
            return (
              <button
                key={t}
                id={tabId(t)}
                role="tab"
                type="button"
                aria-selected={on}
                aria-controls={`${tabId(t)}-panel`}
                tabIndex={on ? 0 : -1}
                onClick={() => setTab(t)}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                    e.preventDefault();
                    const next = t === 'content' ? 'style' : 'content';
                    if (next === 'style' && !styleable) return;
                    setTab(next);
                    requestAnimationFrame(() => document.getElementById(tabId(next))?.focus());
                  }
                }}
                className={cx(
                  '-mb-px border-b-2 px-3 py-2 text-[13px] transition-colors',
                  on ? 'border-[#00abf0] font-medium text-white' : 'border-transparent text-[#8ea6bd] hover:text-white',
                  focusRing,
                )}
              >
                {t === 'content' ? 'Content' : 'Style'}
              </button>
            );
          })}
        </div>
      </header>
      <div
        ref={bodyRef}
        role="tabpanel"
        id={`${tabId(activeTab)}-panel`}
        aria-labelledby={tabId(activeTab)}
        className="min-h-0 flex-1 overflow-y-auto px-4 py-4"
        onKeyDown={(e) => {
          if (e.key === 'Escape' && !(e.target instanceof HTMLTextAreaElement)) {
            // Return focus to the canvas selection.
            (e.currentTarget as HTMLElement).blur();
            document.querySelector<HTMLIFrameElement>('iframe[title^="Canvas"]')?.focus();
          }
        }}
      >
        <div hidden={activeTab !== 'content'}>{content}</div>
        {styleable && <div hidden={activeTab !== 'style'}>{style}</div>}
      </div>
    </aside>
  );
}
