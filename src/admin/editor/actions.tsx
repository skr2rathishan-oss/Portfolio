// Editor actions shared by the toolbar, the canvas mini toolbar, Layers and keyboard shortcuts.
import { useCallback } from 'react';
import { SECTION_META } from '../../content/layout';
import { validateContent } from '../../content/schema';
import type { BuiltinSectionProps, Content, PageKey } from '../../content/types';
import {
  duplicateBlock,
  duplicateSection,
  moveBlock,
  moveGalleryImage,
  moveSection,
  patchBlockProps,
  removeBlock,
  removeGalleryImage,
  removeSection,
  setBlockVisible,
  setSectionProp,
  setSectionVisible,
} from '../lib/layoutReducers';
import { newId } from '../lib/ids';
import {
  moveInSubset,
  patchItem,
  removeItem,
  reorderSubset,
  setProfile,
  setSite,
  toggleVisible,
  upsertItem,
  type CollectionKey,
  type Reducer,
} from '../lib/reducers';
import { useToast } from '../state/toast';
import { configFor } from './entityConfigs';
import type { CanvasAction } from './protocol';
import { useEditor } from './state/EditorContext';
import {
  capabilities,
  describeTarget,
  findBlock,
  findSection,
  galleryImageId,
  itemSubset,
  itemTitle,
  parentTarget,
  parseTarget,
  structuralTarget,
} from './targets';

function setPath<T>(obj: T, path: string, value: unknown): T {
  const [head, ...rest] = path.split('.');
  const src = (obj ?? {}) as Record<string, unknown>;
  return { ...src, [head]: rest.length ? setPath(src[head], rest.join('.'), value) : value } as T;
}

/** Reducer that writes a plain-text value into a target (inline edits). Null when not text-editable. */
export function textReducer(doc: Content, page: PageKey, target: string, value: string): Reducer | null {
  const p = parseTarget(target);
  if (!p) return null;
  switch (p.t) {
    case 'field':
      if (p.field.includes('.')) {
        const [head, ...rest] = p.field.split('.');
        return (d) => {
          const item = (d[p.coll] as unknown as Record<string, unknown>[]).find((i) => i.id === p.id);
          if (!item) return d;
          return patchItem(p.coll as CollectionKey, p.id, { [head]: setPath(item[head], rest.join('.'), value) } as never)(d);
        };
      }
      return patchItem(p.coll as CollectionKey, p.id, { [p.field]: value } as never);
    case 'profile':
      return setProfile((prof) => setPath(prof, p.path, value));
    case 'site':
      return setSite((s) => setPath(s, p.path, value));
    case 'section': {
      if (!p.prop) return null;
      const s = findSection(doc, page, p.id);
      if (!s) return null;
      const key = p.prop as keyof BuiltinSectionProps;
      const def =
        s.type === 'custom'
          ? undefined
          : ({ title: SECTION_META[s.type].defaultTitle, lead: SECTION_META[s.type].defaultLead, secondaryTitle: SECTION_META[s.type].defaultSecondaryTitle, buttonLabel: SECTION_META[s.type].defaultButtonLabel } as Record<string, string | undefined>)[key];
      return setSectionProp(page, p.id, key, value === '' && s.type === 'custom' ? undefined : value, def);
    }
    case 'block': {
      if (!p.prop || galleryImageId(p.prop)) return null;
      const optional = p.prop === 'title' || p.prop === 'caption';
      return patchBlockProps(page, p.sid, p.bid, { [p.prop]: optional && value === '' ? undefined : value });
    }
    default:
      return null;
  }
}

export function useEditorActions() {
  const ed = useEditor();
  const { doc, page, apply, select, announce, askConfirm, openImage, focusPanel, undo } = ed;
  const toast = useToast();

  const deleteTarget = useCallback(
    (target: string) => {
      const st = structuralTarget(target);
      const p = parseTarget(st);
      if (!p || !st) return;
      const caps = capabilities(doc, page, st);
      if (!caps.delete) {
        if (caps.deleteNote) toast({ tone: 'info', message: caps.deleteNote });
        return;
      }
      const label = describeTarget(doc, page, st);
      const after = parentTarget(doc, page, st);
      const run = (reducer: Reducer, done: string) => async () => {
        askConfirm(null);
        const res = await apply(reducer);
        if (res.ok) {
          select(after);
          announce(done);
          toast({ tone: 'info', message: done, duration: 8000, action: { label: 'Undo', onClick: () => undo() } });
        }
      };
      if (p.t === 'item') {
        const config = configFor(p.coll);
        const item = (doc[p.coll] as unknown as { id: string }[]).find((i) => i.id === p.id);
        const blocker = item ? config.deleteBlocker?.(item, doc) : null;
        if (blocker) return toast({ tone: 'error', message: blocker });
        const title = itemTitle(doc, p.coll, p.id);
        askConfirm({
          title: `Delete ${config.singular} “${title}”?`,
          message: `It will be removed from the draft. You can undo this, and nothing changes on the live site until you publish.`,
          confirmLabel: 'Delete',
          onConfirm: run(removeItem(p.coll as CollectionKey, p.id), `Deleted “${title}”`),
        });
      } else if (p.t === 'section') {
        const s = findSection(doc, page, p.id);
        const count = s?.type === 'custom' ? s.blocks.length : 0;
        askConfirm({
          title: `Delete section “${label.replace(/^Section · /, '')}”?`,
          message: count ? `The section and its ${count} block${count === 1 ? '' : 's'} will be removed from the draft.` : 'The section will be removed from the draft.',
          confirmLabel: 'Delete section',
          onConfirm: run(removeSection(page, p.id), 'Section deleted'),
        });
      } else if (p.t === 'block') {
        const img = galleryImageId(p.prop);
        askConfirm({
          title: img ? 'Remove this image from the gallery?' : `Delete this ${label.replace(/ block$/, '').toLowerCase()} block?`,
          message: img ? 'The uploaded file stays in Media.' : 'The block will be removed from the draft.',
          confirmLabel: img ? 'Remove image' : 'Delete block',
          onConfirm: run(img ? removeGalleryImage(page, p.sid, p.bid, img) : removeBlock(page, p.sid, p.bid), img ? 'Image removed' : 'Block deleted'),
        });
      }
    },
    [doc, page, apply, select, announce, askConfirm, toast, undo],
  );

  const moveTarget = useCallback(
    async (target: string, delta: -1 | 1) => {
      const st = structuralTarget(target);
      const p = parseTarget(st);
      if (!p || !st) return;
      const caps = capabilities(doc, page, st);
      if (delta < 0 ? !caps.moveUp : !caps.moveDown) {
        if (caps.moveNote) toast({ tone: 'info', message: caps.moveNote });
        return;
      }
      let reducer: Reducer | null = null;
      if (p.t === 'item') reducer = moveInSubset(p.coll as CollectionKey, itemSubset(doc, p.coll, p.id), p.id, delta);
      else if (p.t === 'section') reducer = moveSection(page, p.id, delta);
      else if (p.t === 'block') {
        const img = galleryImageId(p.prop);
        reducer = img ? moveGalleryImage(page, p.sid, p.bid, img, delta) : moveBlock(page, p.sid, p.bid, delta);
      }
      if (!reducer) return;
      const res = await apply(reducer);
      if (res.ok) {
        select(st, { scroll: true });
        announce(`Moved ${describeTarget(doc, page, st)} ${delta < 0 ? 'up' : 'down'}`);
      }
    },
    [doc, page, apply, select, announce, toast],
  );

  const toggleHidden = useCallback(
    async (target: string) => {
      const st = structuralTarget(target);
      const p = parseTarget(st);
      if (!p || !st) return;
      const caps = capabilities(doc, page, st);
      if (!caps.hide) return;
      let reducer: Reducer | null = null;
      if (p.t === 'item') reducer = toggleVisible(p.coll as CollectionKey, p.id);
      else if (p.t === 'section') reducer = setSectionVisible(page, p.id, !caps.visible);
      else if (p.t === 'block') reducer = setBlockVisible(page, p.sid, p.bid, !caps.visible);
      if (!reducer) return;
      const res = await apply(reducer);
      if (res.ok) announce(`${describeTarget(doc, page, st)} is now ${caps.visible ? 'hidden' : 'visible'}`);
    },
    [doc, page, apply, announce],
  );

  const duplicateTarget = useCallback(
    async (target: string) => {
      const st = structuralTarget(target);
      const p = parseTarget(st);
      if (!p || !st) return;
      if (p.t === 'item') {
        const config = configFor(p.coll);
        const src = (doc[p.coll] as unknown as Record<string, unknown>[]).find((i) => i.id === p.id);
        if (!src) return;
        const title = `${String(src[config.titleField] ?? '')} (copy)`.slice(0, 120);
        const copyId = newId(config.idPrefix, title);
        const copy = { ...src, id: copyId, [config.titleField]: title, visible: false, order: Number.MAX_SAFE_INTEGER };
        const ids = itemSubset(doc, p.coll, p.id);
        const nextIds = ids.flatMap((id) => (id === p.id ? [id, copyId] : [id]));
        const res = await apply((d) => reorderSubset(p.coll as CollectionKey, nextIds)(upsertItem(p.coll as CollectionKey, copy as never)(d)), {
          success: 'Duplicated as a hidden copy',
        });
        if (res.ok) select(`item:${p.coll}:${copyId}`);
      } else if (p.t === 'section') {
        const dup = duplicateSection(page, p.id);
        if (!dup) return;
        const res = await apply(dup.reducer, { success: 'Section duplicated as a hidden copy' });
        if (res.ok) select(`section:${dup.newId}`);
      } else if (p.t === 'block' && !galleryImageId(p.prop)) {
        if (!findBlock(doc, page, p.sid, p.bid)) return;
        const dup = duplicateBlock(page, p.sid, p.bid);
        const res = await apply(dup.reducer, { success: 'Block duplicated as a hidden copy' });
        if (res.ok) select(`block:${p.sid}:${dup.newId}`);
      }
    },
    [doc, page, apply, select],
  );

  const editTarget = useCallback(
    (target: string, kind?: string) => {
      select(target);
      if (kind === 'image') openImage(target);
      else focusPanel();
    },
    [select, openImage, focusPanel],
  );

  const runAction = useCallback(
    (action: CanvasAction, target: string) => {
      switch (action) {
        case 'edit':
          return editTarget(target);
        case 'delete':
          return deleteTarget(target);
        case 'duplicate':
          return void duplicateTarget(target);
        case 'moveUp':
          return void moveTarget(target, -1);
        case 'moveDown':
          return void moveTarget(target, 1);
        case 'hide':
          return void toggleHidden(target);
        case 'selectParent': {
          const parent = parentTarget(doc, page, target);
          if (parent) select(parent, { scroll: true });
          return;
        }
      }
    },
    [doc, page, editTarget, deleteTarget, duplicateTarget, moveTarget, toggleHidden, select],
  );

  /** Inline text commit from the canvas: validate with the schema, then apply (or explain). */
  const commitInline = useCallback(
    async (target: string, raw: string): Promise<boolean> => {
      const value = raw.replace(/\s*\n\s*/g, ' ').trim();
      const reducer = textReducer(doc, page, target, value);
      if (!reducer) return false;
      const next = reducer(doc);
      if (next === doc) return true;
      const check = validateContent(next);
      if (!check.success) {
        const issue = check.issues[0];
        select(target);
        focusPanel();
        toast({ tone: 'error', message: `Not saved: ${issue?.message ?? 'invalid value'}. Fix it in the panel.` });
        return false;
      }
      const res = await apply(reducer, { coalesceKey: `inline:${target}` });
      if (res.ok) announce('Saved to draft');
      return res.ok;
    },
    [doc, page, apply, select, focusPanel, toast, announce],
  );

  return { runAction, deleteTarget, moveTarget, toggleHidden, duplicateTarget, editTarget, commitInline };
}
