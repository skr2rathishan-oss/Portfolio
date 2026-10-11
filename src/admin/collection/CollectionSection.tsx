// Generic "grid of real cards" editor for one collection (or a filtered slice of it).
import { Plus } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { sortByOrder } from '../../content/selectors';
import { newId } from '../lib/ids';
import { moveInSubset, reorderSubset, toggleVisible, upsertItem, type CollectionKey, type ItemOf } from '../lib/reducers';
import { useAdminContent, useDoc } from '../state/AdminContentContext';
import { useToast } from '../state/toast';
import { Button, ConfirmDialog, cx, EmptyState } from '../ui/primitives';
import { EditableCard } from './EditableCard';
import { EntityDialog } from './EntityDialog';
import { SortableGrid } from './SortableGrid';
import type { EntityConfig } from './types';

type Editing<K extends CollectionKey> = { item: ItemOf<K>; isNew: boolean } | null;

export function CollectionSection<K extends CollectionKey>({
  config,
  filter,
  prefill,
  addLabel,
  emptyTitle,
  emptyBody,
  gridClassName = 'grid gap-5 sm:grid-cols-2 xl:grid-cols-3',
  heading,
  toolbar,
}: {
  config: EntityConfig<K>;
  filter?: (item: ItemOf<K>) => boolean;
  /** Field defaults for new items created from this view (e.g. a tab's kind). */
  prefill?: Partial<ItemOf<K>>;
  addLabel?: string;
  emptyTitle?: string;
  emptyBody?: string;
  gridClassName?: string;
  heading?: ReactNode;
  toolbar?: ReactNode;
}) {
  const doc = useDoc();
  const { mutate, removeWithUndo } = useAdminContent();
  const [editing, setEditing] = useState<Editing<K>>(null);
  const [deleting, setDeleting] = useState<ItemOf<K> | null>(null);
  const toast = useToast();
  const requestDelete = (item: ItemOf<K>) => {
    const reason = config.deleteBlocker?.(item, doc);
    if (reason) toast({ tone: 'error', message: reason });
    else setDeleting(item);
  };

  const all = sortByOrder(doc[config.key] as unknown as ItemOf<K>[]);
  const items = filter ? all.filter(filter) : all;
  const ids = items.map((i) => (i as { id: string }).id);
  const label = addLabel ?? `Add ${config.singular}`;

  const openNew = () => setEditing({ item: { ...config.blank(doc), ...prefill } as ItemOf<K>, isNew: true });

  const duplicate = (item: ItemOf<K>) => {
    const src = item as unknown as Record<string, unknown>;
    const title = `${String(src[config.titleField] ?? '')} (copy)`.slice(0, 120);
    const copy = { ...src, id: newId(config.idPrefix, title), [config.titleField]: title, visible: false } as unknown as ItemOf<K>;
    // Place the copy right after the original.
    const nextIds = ids.flatMap((id) => (id === src.id ? [id, (copy as { id: string }).id] : [id]));
    void mutate((d) => reorderSubset(config.key, nextIds)(upsertItem(config.key, { ...copy, order: Number.MAX_SAFE_INTEGER } as ItemOf<K>)(d)), {
      success: `Duplicated as a hidden copy`,
    });
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">{heading}</div>
          <div className="flex flex-wrap items-center gap-2">
            {toolbar}
            <Button variant="primary" icon={<Plus size={16} aria-hidden="true" />} onClick={openNew}>
              {label}
            </Button>
          </div>
        </div>

      {items.length === 0 ? (
        <EmptyState
          title={emptyTitle ?? `No ${config.singular}s yet`}
          body={emptyBody ?? 'Empty sections are hidden on the public site.'}
          action={
            <Button variant="primary" icon={<Plus size={16} aria-hidden="true" />} onClick={openNew}>
              {label}
            </Button>
          }
        />
      ) : (
        <div className="rounded-3xl border border-[#14304b] bg-[#081b29] p-4 sm:p-6 [background-image:radial-gradient(rgba(0,171,240,0.07)_1px,transparent_1px)] [background-size:22px_22px]">
          <SortableGrid
            label={`${config.singular} list`}
            items={items as unknown as { id: string }[]}
            onReorder={(next) => void mutate(reorderSubset(config.key, next))}
            className={cx(gridClassName)}
            renderItem={(raw, handle, index) => {
              const item = raw as unknown as ItemOf<K>;
              const entity = item as unknown as { id: string; visible: boolean };
              const title = config.title(item);
              const Preview = config.Preview;
              return (
                <EditableCard
                  title={title}
                  hidden={!entity.visible}
                  featured={config.isFeatured?.(item)}
                  badges={config.badges?.(item, doc)}
                  handle={handle}
                  isFirst={index === 0}
                  isLast={index === items.length - 1}
                  onMove={(delta) => {
                    const r = moveInSubset(config.key, ids, entity.id, delta);
                    if (r) void mutate(r);
                  }}
                  onEdit={() => setEditing({ item, isNew: false })}
                  onDuplicate={() => duplicate(item)}
                  onToggleVisible={() =>
                    void mutate(toggleVisible(config.key, entity.id), {
                      success: entity.visible ? `“${title}” is now hidden` : `“${title}” is now visible`,
                    })
                  }
                  onDelete={() => requestDelete(item)}
                >
                  <Preview item={item} doc={doc} />
                </EditableCard>
              );
            }}
          />
        </div>
      )}

      {editing && (
        <EntityDialog config={config} initial={editing.item} isNew={editing.isNew} onClose={() => setEditing(null)} />
      )}
      {deleting && (
        <ConfirmDialog
          title={`Delete this ${config.singular}?`}
          message={
            <>
              <strong className="text-white">{config.title(deleting)}</strong> will be removed from the site. You can undo this
              for a few seconds, or restore an earlier version from History.
            </>
          }
          confirmLabel="Delete"
          onCancel={() => setDeleting(null)}
          onConfirm={() => {
            const d = deleting as unknown as { id: string };
            setDeleting(null);
            void removeWithUndo(config.key, d.id, config.title(deleting));
          }}
        />
      )}
    </section>
  );
}
