// Pure document reducers used by the admin. Each returns a new Content object.
import { sortByOrder } from '../../content/selectors';
import type { Content } from '../../content/types';

export type CollectionKey =
  | 'socials'
  | 'projects'
  | 'projectCategories'
  | 'techCategories'
  | 'technologies'
  | 'education'
  | 'academicPathway'
  | 'certifications'
  | 'achievements'
  | 'roles'
  | 'programs';

export type ItemOf<K extends CollectionKey> = Content[K][number];
export type Reducer = (doc: Content) => Content;

type AnyItem = { id: string; order: number; visible: boolean };

const items = (doc: Content, key: CollectionKey) => doc[key] as unknown as AnyItem[];
const withItems = (doc: Content, key: CollectionKey, next: AnyItem[]): Content => ({ ...doc, [key]: next }) as Content;

export function nextOrder(list: readonly { order: number }[]): number {
  return list.reduce((max, i) => Math.max(max, i.order), -1) + 1;
}

/** Inserts or replaces (by id). New items go to the end unless they already carry an order. */
export function upsertItem<K extends CollectionKey>(key: K, item: ItemOf<K>): Reducer {
  return (doc) => {
    const list = items(doc, key);
    const value = item as unknown as AnyItem;
    const idx = list.findIndex((i) => i.id === value.id);
    if (idx >= 0) {
      const next = list.slice();
      next[idx] = value;
      return withItems(doc, key, next);
    }
    return withItems(doc, key, [...list, value]);
  };
}

export function patchItem<K extends CollectionKey>(key: K, id: string, patch: Partial<ItemOf<K>>): Reducer {
  return (doc) => withItems(doc, key, items(doc, key).map((i) => (i.id === id ? { ...i, ...patch } : i)));
}

export function toggleVisible(key: CollectionKey, id: string): Reducer {
  return (doc) => withItems(doc, key, items(doc, key).map((i) => (i.id === id ? { ...i, visible: !i.visible } : i)));
}

/** Removes an item and cleans up references to it. */
export function removeItem(key: CollectionKey, id: string): Reducer {
  return (doc) => {
    let next = withItems(doc, key, items(doc, key).filter((i) => i.id !== id));
    if (key === 'technologies') {
      next = { ...next, projects: next.projects.map((p) => ({ ...p, stack: p.stack.filter((s) => s.techId !== id) })) };
    }
    if (key === 'projectCategories') {
      next = { ...next, projects: next.projects.map((p) => ({ ...p, categoryIds: p.categoryIds.filter((c) => c !== id) })) };
    }
    if (key === 'certifications') {
      next = {
        ...next,
        programs: next.programs.map((p) => {
          if (p.certificationId !== id) return p;
          const { certificationId: _removed, ...rest } = p;
          return rest;
        }),
      };
    }
    return next;
  };
}

/** Restores the given collections to the values in `snapshot` (used for Undo after delete). */
export function restoreCollections(snapshot: Content, keys: CollectionKey[]): Reducer {
  return (doc) => {
    let next = doc;
    for (const key of keys) next = withItems(next, key, items(snapshot, key));
    return next;
  };
}

/** Collections touched by removeItem(key). */
export function affectedBy(key: CollectionKey): CollectionKey[] {
  if (key === 'technologies' || key === 'projectCategories') return [key, 'projects'];
  if (key === 'certifications') return [key, 'programs'];
  return [key];
}

/**
 * Reorders a subset of a collection (e.g. one tab or one category). `orderedIds` is the new
 * order of that subset; other items keep their relative positions. Orders are renumbered 0..n.
 */
export function reorderSubset(key: CollectionKey, orderedIds: string[]): Reducer {
  return (doc) => {
    const sorted = sortByOrder(items(doc, key));
    const subset = new Set(orderedIds);
    const byId = new Map(sorted.map((i) => [i.id, i]));
    const queue = orderedIds.map((id) => byId.get(id)).filter((i): i is AnyItem => !!i);
    let q = 0;
    const merged = sorted.map((item) => (subset.has(item.id) ? queue[q++] : item));
    return withItems(doc, key, merged.map((item, index) => (item.order === index ? item : { ...item, order: index })));
  };
}

/** Moves one item up/down within a subset (keyboard alternative to drag-and-drop). */
export function moveInSubset(key: CollectionKey, subsetIds: string[], id: string, delta: -1 | 1): Reducer | null {
  const idx = subsetIds.indexOf(id);
  const target = idx + delta;
  if (idx < 0 || target < 0 || target >= subsetIds.length) return null;
  const next = subsetIds.slice();
  [next[idx], next[target]] = [next[target], next[idx]];
  return reorderSubset(key, next);
}

export function setProfile(update: (p: Content['profile']) => Content['profile']): Reducer {
  return (doc) => ({ ...doc, profile: update(doc.profile) });
}

export function setSite(update: (s: Content['site']) => Content['site']): Reducer {
  return (doc) => ({ ...doc, site: update(doc.site) });
}
