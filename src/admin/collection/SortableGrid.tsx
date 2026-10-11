// Drag-and-drop ordering (pointer + keyboard) built on @dnd-kit.
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { CSSProperties, ReactNode } from 'react';

export interface DragHandleProps {
  ref: (el: HTMLElement | null) => void;
  attributes: Record<string, unknown>;
  listeners: Record<string, unknown> | undefined;
  isDragging: boolean;
}

function SortableItem({ id, children }: { id: string; children: (handle: DragHandleProps) => ReactNode }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 30 : undefined,
    position: 'relative',
  };
  return (
    <div ref={setNodeRef} style={style} className={isDragging ? 'opacity-80' : undefined}>
      {children({
        ref: setActivatorNodeRef,
        attributes: attributes as unknown as Record<string, unknown>,
        listeners: listeners as Record<string, unknown> | undefined,
        isDragging,
      })}
    </div>
  );
}

export function SortableGrid<T extends { id: string }>({
  items,
  onReorder,
  renderItem,
  className,
  layout = 'grid',
  label,
}: {
  items: T[];
  onReorder: (orderedIds: string[]) => void;
  renderItem: (item: T, handle: DragHandleProps, index: number) => ReactNode;
  className?: string;
  layout?: 'grid' | 'list';
  label: string;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const ids = items.map((i) => i.id);
  const onDragEnd = (e: DragEndEvent) => {
    if (!e.over || e.active.id === e.over.id) return;
    const from = ids.indexOf(String(e.active.id));
    const to = ids.indexOf(String(e.over.id));
    if (from < 0 || to < 0) return;
    onReorder(arrayMove(ids, from, to));
  };
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
      accessibility={{
        screenReaderInstructions: {
          draggable: `To reorder, press Space or Enter on the drag handle, use the arrow keys to move, then Space or Enter to drop. Press Escape to cancel.`,
        },
      }}
    >
      <SortableContext items={ids} strategy={layout === 'grid' ? rectSortingStrategy : verticalListSortingStrategy}>
        <div className={className} role="list" aria-label={label}>
          {items.map((item, index) => (
            <div role="listitem" key={item.id}>
              <SortableItem id={item.id}>{(handle) => renderItem(item, handle, index)}</SortableItem>
            </div>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
