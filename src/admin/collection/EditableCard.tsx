// Wraps a real public card: clicking anywhere opens the editor; a toolbar offers
// drag, move up/down (keyboard alternative), duplicate, hide/show and delete.
import { ArrowDown, ArrowUp, Copy, Eye, EyeOff, GripVertical, Pencil, Star, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { Badge, cx, IconButton } from '../ui/primitives';
import type { DragHandleProps } from './SortableGrid';

export interface EditableCardProps {
  title: string;
  hidden?: boolean;
  featured?: boolean;
  /** Extra badges (e.g. "Not in stack"). */
  badges?: ReactNode;
  onEdit: () => void;
  onToggleVisible?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onMove?: (delta: -1 | 1) => void;
  isFirst?: boolean;
  isLast?: boolean;
  handle?: DragHandleProps;
  children: ReactNode;
  className?: string;
  compact?: boolean;
}

export function EditableCard({
  title,
  hidden,
  featured,
  badges,
  onEdit,
  onToggleVisible,
  onDuplicate,
  onDelete,
  onMove,
  isFirst,
  isLast,
  handle,
  children,
  className,
  compact,
}: EditableCardProps) {
  return (
    <div
      className={cx(
        'group relative h-full rounded-2xl outline outline-1 outline-transparent transition-[outline-color]',
        'hover:outline-[#00abf0]/50 focus-within:outline-[#00abf0]/70',
        handle?.isDragging && 'outline-[#00abf0] shadow-[0_20px_50px_rgba(0,0,0,0.5)]',
        className,
      )}
    >
      {/* The real card, non-interactive inside the editor. */}
      <div inert className={cx('h-full transition-opacity', hidden && 'opacity-45 saturate-50')}>
        {children}
      </div>

      <button
        type="button"
        onClick={onEdit}
        aria-label={`Edit ${title}`}
        className="absolute inset-0 z-10 cursor-pointer rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00abf0]"
      />

      {(hidden || featured || badges) && (
        <div className="pointer-events-none absolute left-2.5 top-2.5 z-20 flex flex-wrap gap-1.5">
          {hidden && (
            <Badge tone="warn" className="bg-[#2a2008] backdrop-blur">
              <EyeOff size={11} aria-hidden="true" /> Hidden
            </Badge>
          )}
          {featured && (
            <Badge tone="accent" className="bg-[#062638]">
              <Star size={11} aria-hidden="true" /> Featured
            </Badge>
          )}
          {badges}
        </div>
      )}

      <div
        role="toolbar"
        aria-label={`Actions for ${title}`}
        className={cx(
          'absolute right-2 top-2 z-20 flex items-center gap-0.5 rounded-lg border border-[#27496b] bg-[#0b1c2e]/95 p-0.5 shadow-lg backdrop-blur',
          'opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100',
          handle?.isDragging && 'opacity-100',
        )}
      >
        {handle && (
          <button
            ref={handle.ref}
            type="button"
            aria-label={`Drag to reorder ${title}`}
            title="Drag to reorder"
            className="inline-flex h-8 w-7 cursor-grab touch-none items-center justify-center rounded-md text-[#8ea6bd] hover:bg-white/[0.08] hover:text-white active:cursor-grabbing focus-visible:outline-2 focus-visible:outline-[#00abf0]"
            {...handle.attributes}
            {...handle.listeners}
          >
            <GripVertical size={16} aria-hidden="true" />
          </button>
        )}
        {onMove && !compact && (
          <>
            <IconButton label={`Move ${title} earlier`} disabled={isFirst} onClick={() => onMove(-1)}>
              <ArrowUp size={15} aria-hidden="true" />
            </IconButton>
            <IconButton label={`Move ${title} later`} disabled={isLast} onClick={() => onMove(1)}>
              <ArrowDown size={15} aria-hidden="true" />
            </IconButton>
          </>
        )}
        <IconButton label={`Edit ${title}`} onClick={onEdit}>
          <Pencil size={15} aria-hidden="true" />
        </IconButton>
        {onDuplicate && !compact && (
          <IconButton label={`Duplicate ${title}`} onClick={onDuplicate}>
            <Copy size={15} aria-hidden="true" />
          </IconButton>
        )}
        {onToggleVisible && (
          <IconButton label={hidden ? `Show ${title} on the site` : `Hide ${title} from the site`} onClick={onToggleVisible} tone={hidden ? 'active' : 'default'}>
            {hidden ? <Eye size={15} aria-hidden="true" /> : <EyeOff size={15} aria-hidden="true" />}
          </IconButton>
        )}
        {onDelete && (
          <IconButton label={`Delete ${title}`} tone="danger" onClick={onDelete}>
            <Trash2 size={15} aria-hidden="true" />
          </IconButton>
        )}
      </div>
    </div>
  );
}
