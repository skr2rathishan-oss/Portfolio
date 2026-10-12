// Pure layout reducers for the visual editor (pages -> sections -> blocks, plus style presets).
// Every reducer returns a new Content; the first layout change on a page materializes that page
// (resolvePage), so documents without `layout` keep rendering DEFAULT_LAYOUT until edited.
import { PAGE_KEYS, resolvePage } from '../../content/layout';
import { cleanStyle } from '../../content/styleClasses';
import type {
  Block,
  BuiltinSectionProps,
  CollectionName,
  Content,
  CustomSection,
  GalleryImage,
  PageKey,
  Section,
  SiteLayout,
  StyleKey,
  StylePresets,
} from '../../content/types';
import { newId } from './ids';
import type { Reducer } from './reducers';

type AnyItem = { id: string; style?: StylePresets };

export const pageKeyOf = (p: string): PageKey | null => ((PAGE_KEYS as readonly string[]).includes(p) ? (p as PageKey) : null);

const renumber = <T extends { order: number }>(list: T[]): T[] =>
  list.map((x, order) => (x.order === order ? x : { ...x, order }));

function move<T>(list: readonly T[], from: number, to: number): T[] {
  const next = list.slice();
  const [x] = next.splice(from, 1);
  next.splice(to, 0, x);
  return next;
}

/** The page's sections, ready to edit (materialized + ordered). */
export function pageSections(doc: Content, page: PageKey): Section[] {
  return resolvePage(doc, page);
}

/** The page a section id lives on (searching stored layouts, then defaults). */
export function findSectionPage(doc: Content, sectionId: string): PageKey | null {
  for (const p of PAGE_KEYS) if (resolvePage(doc, p).some((s) => s.id === sectionId)) return p;
  return null;
}

function withPage(doc: Content, page: PageKey, sections: Section[]): Content {
  const layout: SiteLayout = doc.layout ?? { version: 1, pages: {} };
  return { ...doc, layout: { ...layout, pages: { ...layout.pages, [page]: { sections: renumber(sections) } } } };
}

/** Materializes the page's layout (no-op when it is already stored and complete). */
export function ensurePageLayout(page: PageKey): Reducer {
  return (doc) => withPage(doc, page, resolvePage(doc, page));
}

function mapSections(page: PageKey, fn: (list: Section[]) => Section[] | null): Reducer {
  return (doc) => {
    const next = fn(resolvePage(doc, page));
    return next ? withPage(doc, page, next) : doc;
  };
}

function mapSection(page: PageKey, id: string, fn: (s: Section) => Section): Reducer {
  return mapSections(page, (list) => {
    const idx = list.findIndex((s) => s.id === id);
    if (idx < 0) return null;
    const next = list.slice();
    next[idx] = fn(list[idx]);
    return next;
  });
}

function mapCustom(page: PageKey, id: string, fn: (s: CustomSection) => CustomSection): Reducer {
  return mapSection(page, id, (s) => (s.type === 'custom' ? fn(s) : s));
}

// ── Sections ─────────────────────────────────────────────────
export function newCustomSection(blocks: Block[] = [], title = 'New section'): CustomSection {
  return {
    id: newId('sec', title),
    type: 'custom',
    order: 0,
    visible: true,
    props: { title, arrangement: 'stack' },
    blocks: renumber(blocks),
  };
}

/** Inserts after `afterId` (or at the end). */
export function addSection(page: PageKey, section: Section, afterId?: string | null): Reducer {
  return mapSections(page, (list) => {
    const at = afterId ? list.findIndex((s) => s.id === afterId) + 1 : list.length;
    const next = list.slice();
    next.splice(at <= 0 ? list.length : at, 0, section);
    return next;
  });
}

export function reorderSections(page: PageKey, orderedIds: string[]): Reducer {
  return mapSections(page, (list) => {
    const byId = new Map(list.map((s) => [s.id, s]));
    const ordered = orderedIds.map((id) => byId.get(id)).filter((s): s is Section => !!s);
    const rest = list.filter((s) => !orderedIds.includes(s.id));
    return [...ordered, ...rest];
  });
}

export function moveSection(page: PageKey, id: string, delta: -1 | 1): Reducer {
  return mapSections(page, (list) => {
    const i = list.findIndex((s) => s.id === id);
    const j = i + delta;
    if (i < 0 || j < 0 || j >= list.length) return null;
    return move(list, i, j);
  });
}

export function setSectionVisible(page: PageKey, id: string, visible: boolean): Reducer {
  return mapSection(page, id, (s) => ({ ...s, visible }));
}

/** Sets (or, with undefined / the built-in default, clears) one text prop of a section. */
export function setSectionProp(
  page: PageKey,
  id: string,
  key: keyof BuiltinSectionProps | 'arrangement',
  value: string | undefined,
  builtinDefault?: string,
): Reducer {
  return mapSection(page, id, (s) => {
    if (s.type === 'custom') {
      if (key === 'arrangement') return { ...s, props: { ...s.props, arrangement: value === 'grid' ? 'grid' : 'stack' } };
      if (key !== 'title' && key !== 'lead') return s;
      const props = { ...s.props };
      if (value === undefined || value === '') delete props[key];
      else props[key] = value;
      return { ...s, props };
    }
    if (key === 'arrangement') return s;
    const props: BuiltinSectionProps = { ...s.props };
    if (value === undefined || value === builtinDefault) delete props[key];
    else props[key] = value;
    const { props: _old, ...rest } = s;
    return Object.keys(props).length ? { ...rest, props } : rest;
  });
}

/** Custom sections only: built-ins can be hidden, never removed. */
export function removeSection(page: PageKey, id: string): Reducer {
  return mapSections(page, (list) => {
    const s = list.find((x) => x.id === id);
    if (!s || s.type !== 'custom') return null;
    return list.filter((x) => x.id !== id);
  });
}

function cloneBlock(b: Block): Block {
  const copy = { ...b, id: newId('blk', b.type) } as Block;
  if (copy.type === 'gallery') {
    copy.props = { images: copy.props.images.map((img) => ({ ...img, id: newId('gimg', 'image') })) };
  }
  return copy;
}

/** Duplicates a custom section (fresh sec_/blk_/gimg_ ids), placed after the original and hidden. */
export function duplicateSection(page: PageKey, id: string): { reducer: Reducer; newId: string } | null {
  const freshId = newId('sec', 'copy');
  return {
    newId: freshId,
    reducer: mapSections(page, (list) => {
      const i = list.findIndex((s) => s.id === id);
      const s = list[i];
      if (!s || s.type !== 'custom') return null;
      const copy: CustomSection = { ...s, id: freshId, visible: false, blocks: s.blocks.map(cloneBlock) };
      const next = list.slice();
      next.splice(i + 1, 0, copy);
      return next;
    }),
  };
}

// ── Blocks ───────────────────────────────────────────────────
export function addBlock(page: PageKey, sectionId: string, block: Block, afterBlockId?: string | null): Reducer {
  return mapCustom(page, sectionId, (s) => {
    const list = s.blocks.slice().sort((a, b) => a.order - b.order);
    const at = afterBlockId ? list.findIndex((b) => b.id === afterBlockId) + 1 : list.length;
    list.splice(at <= 0 ? list.length : at, 0, block);
    return { ...s, blocks: renumber(list) };
  });
}

function mapBlocks(page: PageKey, sectionId: string, fn: (list: Block[]) => Block[] | null): Reducer {
  return (doc) => {
    let changed = false;
    const next = mapCustom(page, sectionId, (s) => {
      const out = fn(s.blocks.slice().sort((a, b) => a.order - b.order));
      if (!out) return s;
      changed = true;
      return { ...s, blocks: renumber(out) };
    })(doc);
    return changed ? next : doc;
  };
}

function mapBlock(page: PageKey, sectionId: string, blockId: string, fn: (b: Block) => Block): Reducer {
  return mapBlocks(page, sectionId, (list) => {
    const i = list.findIndex((b) => b.id === blockId);
    if (i < 0) return null;
    const next = list.slice();
    next[i] = fn(list[i]);
    return next;
  });
}

export function patchBlockProps(page: PageKey, sectionId: string, blockId: string, props: Record<string, unknown>): Reducer {
  return mapBlock(page, sectionId, blockId, (b) => {
    const merged: Record<string, unknown> = { ...b.props, ...props };
    for (const k of Object.keys(merged)) if (merged[k] === undefined) delete merged[k];
    return { ...b, props: merged } as Block;
  });
}

export function setBlockVisible(page: PageKey, sectionId: string, blockId: string, visible: boolean): Reducer {
  return mapBlock(page, sectionId, blockId, (b) => ({ ...b, visible }));
}

export function moveBlock(page: PageKey, sectionId: string, blockId: string, delta: -1 | 1): Reducer {
  return mapBlocks(page, sectionId, (list) => {
    const i = list.findIndex((b) => b.id === blockId);
    const j = i + delta;
    if (i < 0 || j < 0 || j >= list.length) return null;
    return move(list, i, j);
  });
}

export function reorderBlocks(page: PageKey, sectionId: string, orderedIds: string[]): Reducer {
  return mapBlocks(page, sectionId, (list) => {
    const byId = new Map(list.map((b) => [b.id, b]));
    const ordered = orderedIds.map((id) => byId.get(id)).filter((b): b is Block => !!b);
    return [...ordered, ...list.filter((b) => !orderedIds.includes(b.id))];
  });
}

export function removeBlock(page: PageKey, sectionId: string, blockId: string): Reducer {
  return mapBlocks(page, sectionId, (list) => (list.some((b) => b.id === blockId) ? list.filter((b) => b.id !== blockId) : null));
}

export function duplicateBlock(page: PageKey, sectionId: string, blockId: string): { reducer: Reducer; newId: string } {
  const pre = newId('blk', 'copy');
  return {
    newId: pre,
    reducer: mapBlocks(page, sectionId, (list) => {
      const i = list.findIndex((b) => b.id === blockId);
      if (i < 0) return null;
      const copy = { ...cloneBlock(list[i]), id: pre, visible: false } as Block;
      const next = list.slice();
      next.splice(i + 1, 0, copy);
      return next;
    }),
  };
}

// ── Gallery images ───────────────────────────────────────────
function mapGallery(page: PageKey, sectionId: string, blockId: string, fn: (imgs: GalleryImage[]) => GalleryImage[] | null): Reducer {
  return (doc) => {
    let changed = false;
    const next = mapBlock(page, sectionId, blockId, (b) => {
      if (b.type !== 'gallery') return b;
      const out = fn(b.props.images);
      if (!out) return b;
      changed = true;
      return { ...b, props: { ...b.props, images: out } };
    })(doc);
    return changed ? next : doc;
  };
}

export function addGalleryImages(page: PageKey, sectionId: string, blockId: string, srcs: string[]): Reducer {
  return mapGallery(page, sectionId, blockId, (imgs) => [
    ...imgs,
    ...srcs.map((src) => ({ id: newId('gimg', 'image'), src, alt: 'Gallery image' })),
  ]);
}

export function patchGalleryImage(page: PageKey, sectionId: string, blockId: string, imageId: string, patch: Partial<GalleryImage>): Reducer {
  return mapGallery(page, sectionId, blockId, (imgs) =>
    imgs.map((img) => {
      if (img.id !== imageId) return img;
      const merged: GalleryImage = { ...img, ...patch };
      if (!merged.caption) delete merged.caption;
      return merged;
    }),
  );
}

export function removeGalleryImage(page: PageKey, sectionId: string, blockId: string, imageId: string): Reducer {
  return mapGallery(page, sectionId, blockId, (imgs) => (imgs.some((i) => i.id === imageId) ? imgs.filter((i) => i.id !== imageId) : null));
}

export function reorderGallery(page: PageKey, sectionId: string, blockId: string, orderedIds: string[]): Reducer {
  return mapGallery(page, sectionId, blockId, (imgs) => {
    const byId = new Map(imgs.map((i) => [i.id, i]));
    const ordered = orderedIds.map((id) => byId.get(id)).filter((i): i is GalleryImage => !!i);
    return [...ordered, ...imgs.filter((i) => !orderedIds.includes(i.id))];
  });
}

export function moveGalleryImage(page: PageKey, sectionId: string, blockId: string, imageId: string, delta: -1 | 1): Reducer {
  return mapGallery(page, sectionId, blockId, (imgs) => {
    const i = imgs.findIndex((x) => x.id === imageId);
    const j = i + delta;
    if (i < 0 || j < 0 || j >= imgs.length) return null;
    return move(imgs, i, j);
  });
}

// ── Style presets ────────────────────────────────────────────
function setKey(style: StylePresets | undefined, key: StyleKey, value: string | undefined): StylePresets | undefined {
  return cleanStyle({ ...style, [key]: value } as StylePresets);
}

function withStyle<T extends { style?: StylePresets }>(x: T, style: StylePresets | undefined): T {
  const { style: _old, ...rest } = x;
  return (style ? { ...rest, style } : rest) as T;
}

export function setItemStyle(coll: CollectionName, id: string, key: StyleKey, value: string | undefined): Reducer {
  return (doc) => {
    const list = doc[coll] as unknown as AnyItem[];
    if (!list.some((i) => i.id === id)) return doc;
    return { ...doc, [coll]: list.map((i) => (i.id === id ? withStyle(i, setKey(i.style, key, value)) : i)) } as Content;
  };
}

export function setSectionStyle(page: PageKey, id: string, key: StyleKey, value: string | undefined): Reducer {
  return mapSection(page, id, (s) => withStyle(s, setKey(s.style, key, value)));
}

export function setBlockStyle(page: PageKey, sectionId: string, blockId: string, key: StyleKey, value: string | undefined): Reducer {
  return mapBlock(page, sectionId, blockId, (b) => withStyle(b, setKey(b.style, key, value)));
}

// ── Defaults for new blocks (Component library) ─────────────
export function newBlock(type: Block['type']): Block {
  const base = { id: newId('blk', type), order: 0, visible: true };
  switch (type) {
    case 'heading':
      return { ...base, type, props: { text: 'New heading', level: 'h2' } };
    case 'text':
      return { ...base, type, props: { text: 'Write something about this section.' } };
    case 'image':
      return { ...base, type, props: { alt: '' } };
    case 'gallery':
      return { ...base, type, props: { images: [] }, style: { columns: '3' } };
    case 'button':
      return { ...base, type, props: { label: 'Learn more', href: '/projects', variant: 'primary', icon: 'arrow' } };
    case 'contactInfo':
      return { ...base, type, props: { showEmail: true, showLocation: true, showSocials: true } };
    case 'divider':
      return { ...base, type, props: {} };
  }
}
