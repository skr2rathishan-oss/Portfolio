// Left sidebar: the page's sections, their items / blocks and gallery images as a tree.
// The accessible equivalent of clicking in the canvas: every row selects, and order can be changed
// by dragging (pointer or keyboard via dnd-kit) or with the up/down buttons.
import { ArrowDown, ArrowUp, ChevronRight, Eye, EyeOff, GripVertical, Lock, Plus } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { BLOCK_LABEL, PAGE_LABEL, SECTION_META, resolvePage, sectionLabel } from '../../content/layout';
import { dateSortKey, sortByOrder } from '../../content/selectors';
import type { CollectionName, Content, CustomSection, Section } from '../../content/types';
import { SortableGrid, type DragHandleProps } from '../collection/SortableGrid';
import { reorderBlocks, reorderGallery, reorderSections } from '../lib/layoutReducers';
import { reorderSubset, type CollectionKey } from '../lib/reducers';
import { cx, focusRing, IconButton } from '../ui/primitives';
import { useEditorActions } from './actions';
import { useEditor } from './state/EditorContext';
import { COLLECTION_LABEL, isPinnedSection, itemTitle, parseTarget, structuralTarget } from './targets';

type AnyItem = { id: string; order: number; visible: boolean } & Record<string, unknown>;

interface Group {
  coll: CollectionName;
  label?: string;
  items: AnyItem[];
  orderable: boolean;
  note?: string;
}

/** Items a built-in section shows, grouped for ordering. */
function sectionGroups(doc: Content, section: Section): Group[] {
  if (section.type === 'custom') return [];
  const meta = SECTION_META[section.type];
  const out: Group[] = [];
  const all = (c: CollectionName) => sortByOrder(doc[c] as unknown as AnyItem[]);
  for (const coll of meta.collections) {
    if (coll === 'projectCategories' || coll === 'techCategories') continue;
    const orderable = meta.orderable && coll !== 'achievements';
    const note = coll === 'achievements' ? 'Sorted by date on the site.' : meta.orderNote;
    let items = all(coll);
    if (coll === 'socials') items = items.filter((s) => (section.type === 'home.hero' ? s.showInHero : s.showInContact));
    if (section.type === 'home.coreStack') items = items.filter((t) => t.featured);
    if (section.type === 'home.highlights' && coll === 'projects') items = items.filter((p) => p.featured);
    if (section.type === 'home.highlights' && coll === 'achievements')
      items = items.filter((a) => a.visible).sort((a, b) => dateSortKey(b.date as string).localeCompare(dateSortKey(a.date as string))).slice(0, 3);
    if (coll === 'technologies' && section.type === 'projects.stack') {
      for (const cat of sortByOrder(doc.techCategories)) {
        const techs = items.filter((t) => t.categoryId === cat.id && t.showInStack);
        if (techs.length) out.push({ coll, label: cat.title, items: techs, orderable, note });
      }
      continue;
    }
    if (items.length || meta.collections.length === 1) out.push({ coll, label: meta.collections.length > 1 ? COLLECTION_LABEL[coll] + 's' : undefined, items, orderable, note });
  }
  return out;
}

function Row({
  depth,
  target,
  label,
  hidden,
  handle,
  expand,
  onUp,
  onDown,
  onToggle,
  pinned,
  sub,
}: {
  depth: number;
  target: string;
  label: string;
  hidden?: boolean;
  handle?: DragHandleProps;
  expand?: { open: boolean; onToggle: () => void };
  onUp?: (() => void) | null;
  onDown?: (() => void) | null;
  onToggle?: () => void;
  pinned?: boolean;
  sub?: string;
}) {
  const { selected, select, hovered } = useEditor();
  const isSel = structuralTarget(selected) === target || selected === target;
  const isHov = hovered === target;
  return (
    <div
      className={cx(
        'group flex h-9 items-center gap-0.5 rounded-md pr-1 text-[13px]',
        isSel ? 'bg-[#00abf0]/14 text-white' : isHov ? 'bg-white/[0.05] text-[#e8f0f7]' : 'text-[#cfdbe6] hover:bg-white/[0.04]',
      )}
      style={{ paddingLeft: 4 + depth * 14 }}
    >
      {handle ? (
        <button
          type="button"
          ref={handle.ref}
          {...handle.attributes}
          {...handle.listeners}
          aria-label={`Drag to reorder ${label}`}
          className={cx('flex h-8 w-5 shrink-0 cursor-grab items-center justify-center rounded text-[#5f7a93] hover:text-white active:cursor-grabbing', focusRing)}
        >
          <GripVertical size={14} aria-hidden="true" />
        </button>
      ) : (
        <span className="flex w-5 shrink-0 justify-center text-[#3f5d79]" aria-hidden="true">
          {pinned ? <Lock size={11} /> : null}
        </span>
      )}
      {expand ? (
        <button
          type="button"
          aria-label={expand.open ? `Collapse ${label}` : `Expand ${label}`}
          aria-expanded={expand.open}
          onClick={expand.onToggle}
          className={cx('flex h-8 w-5 shrink-0 items-center justify-center rounded text-[#7f97ad] hover:text-white', focusRing)}
        >
          <ChevronRight size={14} aria-hidden="true" className={cx('transition-transform motion-reduce:transition-none', expand.open && 'rotate-90')} />
        </button>
      ) : (
        <span className="w-5 shrink-0" aria-hidden="true" />
      )}
      <button
        type="button"
        aria-current={isSel ? 'true' : undefined}
        onClick={() => select(target, { scroll: true })}
        className={cx('flex h-8 min-w-0 flex-1 items-center gap-1.5 rounded px-1 text-left', hidden && 'text-[#5f7a93] line-through decoration-[#3f5d79]', focusRing)}
      >
        <span className="truncate">{label}</span>
        {sub && <span className="shrink-0 text-[11px] text-[#5f7a93] no-underline">{sub}</span>}
      </button>
      {(onUp !== undefined || onDown !== undefined) && (
        <span className={cx('flex shrink-0 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100', isSel && 'opacity-100')}>
          <IconButton label={`Move ${label} up`} disabled={!onUp} onClick={() => onUp?.()} className="h-7 w-7">
            <ArrowUp size={13} aria-hidden="true" />
          </IconButton>
          <IconButton label={`Move ${label} down`} disabled={!onDown} onClick={() => onDown?.()} className="h-7 w-7">
            <ArrowDown size={13} aria-hidden="true" />
          </IconButton>
        </span>
      )}
      {onToggle && (
        <IconButton label={hidden ? `Show ${label}` : `Hide ${label}`} onClick={onToggle} className={cx('h-7 w-7', hidden && 'text-[#f5c46a]')}>
          {hidden ? <EyeOff size={13} aria-hidden="true" /> : <Eye size={13} aria-hidden="true" />}
        </IconButton>
      )}
    </div>
  );
}

function Sortable<T extends { id: string }>({
  items,
  enabled,
  label,
  onReorder,
  render,
}: {
  items: T[];
  enabled: boolean;
  label: string;
  onReorder: (ids: string[]) => void;
  render: (item: T, handle: DragHandleProps | undefined, index: number) => ReactNode;
}) {
  if (!enabled || items.length < 2) {
    return (
      <div role="list" aria-label={label}>
        {items.map((it, i) => (
          <div role="listitem" key={it.id}>
            {render(it, undefined, i)}
          </div>
        ))}
      </div>
    );
  }
  return <SortableGrid layout="list" label={label} items={items} onReorder={onReorder} renderItem={(it, h, i) => render(it, h, i)} />;
}

export function LayersPanel() {
  const { doc, page, selected, apply, announce, setLibraryOpen } = useEditor();
  const actions = useEditorActions();
  const sections = resolvePage(doc, page);
  const [open, setOpen] = useState<Set<string>>(() => new Set());

  // Expand the section containing the selection.
  useEffect(() => {
    const p = parseTarget(selected);
    if (!p) return;
    let sid: string | null = null;
    if (p.t === 'block') sid = p.sid;
    else if (p.t === 'item' || p.t === 'field') {
      const coll = p.coll;
      sid = sections.find((s) => s.type !== 'custom' && SECTION_META[s.type].collections.includes(coll))?.id ?? null;
    }
    if (sid && !open.has(sid)) setOpen((o) => new Set(o).add(sid));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  const toggleOpen = (id: string) =>
    setOpen((o) => {
      const n = new Set(o);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const pinned = sections.filter(isPinnedSection);
  const movable = sections.filter((s) => !isPinnedSection(s));

  const renderSection = (s: Section, handle: DragHandleProps | undefined, index: number, list: Section[]) => {
    const target = `section:${s.id}`;
    const groups = sectionGroups(doc, s);
    const custom = s.type === 'custom' ? (s as CustomSection) : null;
    const expandable = groups.some((g) => g.items.length) || (custom?.blocks.length ?? 0) > 0;
    const isOpen = open.has(s.id);
    const isPinned = isPinnedSection(s);
    return (
      <div>
        <Row
          depth={0}
          target={target}
          label={sectionLabel(s)}
          hidden={!s.visible}
          handle={handle}
          pinned={isPinned}
          expand={expandable ? { open: isOpen, onToggle: () => toggleOpen(s.id) } : undefined}
          onUp={isPinned ? undefined : index > 0 ? () => void actions.moveTarget(target, -1) : null}
          onDown={isPinned ? undefined : index < list.length - 1 ? () => void actions.moveTarget(target, 1) : null}
          onToggle={() => void actions.toggleHidden(target)}
        />
        {isOpen && custom && <BlockRows section={custom} />}
        {isOpen &&
          groups.map((g) => (
            <div key={`${g.coll}-${g.label ?? ''}`} role="group" aria-label={g.label ?? COLLECTION_LABEL[g.coll]}>
              {g.label && <p className="pl-12 pt-1.5 text-[11px] font-medium text-[#5f7a93]">{g.label}</p>}
              {!g.orderable && g.note && <p className="pl-12 pb-1 text-[11px] text-[#5f7a93]">{g.note}</p>}
              <Sortable
                items={g.items}
                enabled={g.orderable}
                label={`${g.label ?? COLLECTION_LABEL[g.coll]} order`}
                onReorder={(ids) => {
                  void apply(reorderSubset(g.coll as CollectionKey, ids));
                  announce('Order updated');
                }}
                render={(it, h, i) => {
                  const t = `item:${g.coll}:${it.id}`;
                  return (
                    <Row
                      depth={1}
                      target={t}
                      label={itemTitle(doc, g.coll, it.id)}
                      hidden={!it.visible}
                      handle={h}
                      onUp={g.orderable ? (i > 0 ? () => void actions.moveTarget(t, -1) : null) : undefined}
                      onDown={g.orderable ? (i < g.items.length - 1 ? () => void actions.moveTarget(t, 1) : null) : undefined}
                      onToggle={() => void actions.toggleHidden(t)}
                    />
                  );
                }}
              />
            </div>
          ))}
      </div>
    );
  };

  return (
    <aside aria-label="Layers" className="flex w-[272px] shrink-0 flex-col border-r border-[#14304b] bg-[#0b1c2e]">
      <header className="flex items-center justify-between border-b border-[#14304b] px-4 py-3">
        <h2 className="text-sm font-semibold text-white">
          Layers <span className="font-normal text-[#7f97ad]">· {PAGE_LABEL[page]}</span>
        </h2>
        <IconButton label="Add component (A)" onClick={() => setLibraryOpen(true)}>
          <Plus size={16} aria-hidden="true" />
        </IconButton>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
        <div role="list" aria-label="Pinned sections">
          {pinned.map((s, i) => (
            <div role="listitem" key={s.id}>
              {renderSection(s, undefined, i, pinned)}
            </div>
          ))}
        </div>
        <Sortable
          items={movable}
          enabled
          label="Sections"
          onReorder={(ids) => {
            void apply(reorderSections(page, [...pinned.map((s) => s.id), ...ids]));
            announce('Sections reordered');
          }}
          render={(s, h, i) => renderSection(s, h, i, movable)}
        />
        <p className="mt-3 px-2 text-[11px] leading-relaxed text-[#5f7a93]">
          Drag rows or use the arrows to reorder. The hero and page headers stay at the top. Header and footer are site-wide.
        </p>
      </div>
    </aside>
  );
}

function BlockRows({ section }: { section: CustomSection }) {
  const { page, apply, announce } = useEditor();
  const actions = useEditorActions();
  const blocks = sortByOrder(section.blocks);
  const [openGallery, setOpenGallery] = useState<Set<string>>(() => new Set());
  return (
    <Sortable
      items={blocks}
      enabled
      label={`Blocks in ${sectionLabel(section)}`}
      onReorder={(ids) => {
        void apply(reorderBlocks(page, section.id, ids));
        announce('Blocks reordered');
      }}
      render={(b, h, i) => {
        const t = `block:${section.id}:${b.id}`;
        const text = b.type === 'heading' || b.type === 'text' ? b.props.text : b.type === 'button' ? b.props.label : '';
        const gallery = b.type === 'gallery' ? b.props.images : null;
        const isOpen = openGallery.has(b.id);
        return (
          <div>
            <Row
              depth={1}
              target={t}
              label={BLOCK_LABEL[b.type]}
              sub={text ? text.slice(0, 24) : gallery ? `${gallery.length}` : undefined}
              hidden={!b.visible}
              handle={h}
              expand={gallery && gallery.length ? { open: isOpen, onToggle: () => setOpenGallery((o) => { const n = new Set(o); if (n.has(b.id)) n.delete(b.id); else n.add(b.id); return n; }) } : undefined}
              onUp={i > 0 ? () => void actions.moveTarget(t, -1) : null}
              onDown={i < blocks.length - 1 ? () => void actions.moveTarget(t, 1) : null}
              onToggle={() => void actions.toggleHidden(t)}
            />
            {gallery && isOpen && (
              <Sortable
                items={gallery}
                enabled
                label="Gallery images"
                onReorder={(ids) => {
                  void apply(reorderGallery(page, section.id, b.id, ids));
                  announce('Images reordered');
                }}
                render={(img, ih, j) => {
                  const it = `block:${section.id}:${b.id}:images.${img.id}`;
                  return (
                    <Row
                      depth={2}
                      target={it}
                      label={img.alt || `Image ${j + 1}`}
                      handle={ih}
                      onUp={j > 0 ? () => void actions.moveTarget(it, -1) : null}
                      onDown={j < gallery.length - 1 ? () => void actions.moveTarget(it, 1) : null}
                    />
                  );
                }}
              />
            )}
          </div>
        );
      }}
    />
  );
}

