// Accessible image preview built on the native <dialog> (modal: the page behind is inert,
// Tab stays inside, Esc closes). Focus returns to the element that opened it and body
// scroll is locked while it is open.
import { useEffect, useId, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

export interface PreviewMedia {
  src: string;
  alt: string;
  title: string;
  caption?: string;
}

export interface LightboxProps {
  media: PreviewMedia | null;
  onClose: () => void;
  /** Extra actions under the image (verify link, PDF, ...). */
  actions?: ReactNode;
}

export default function Lightbox({ media, onClose, actions }: LightboxProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const open = media !== null;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      returnFocusRef.current = document.activeElement as HTMLElement | null;
      dialog.showModal();
      closeRef.current?.focus();
      const { overflow } = document.body.style;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = overflow;
      };
    }
    if (!open && dialog.open) dialog.close();
    return undefined;
  }, [open]);

  // Return focus after closing (covers Esc, the close button and backdrop clicks).
  useEffect(() => {
    if (open) return;
    const el = returnFocusRef.current;
    if (el && document.contains(el)) el.focus({ preventScroll: true });
    returnFocusRef.current = null;
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        // Clicks on the backdrop target the <dialog> element itself.
        if (e.target === e.currentTarget) onClose();
      }}
      className="lightbox m-auto max-h-[92dvh] w-[min(64rem,calc(100vw-2rem))] overflow-visible bg-transparent p-0 text-ink"
    >
      {media && (
        <div className="flex max-h-[92dvh] flex-col overflow-hidden rounded-panel border border-line bg-surface shadow-float">
          <div className="flex items-start justify-between gap-4 border-b border-line px-4 py-3 sm:px-5">
            <div className="min-w-0 py-1.5">
              <h2 id={titleId} className="text-base font-semibold leading-snug text-ink sm:text-lg">
                {media.title}
              </h2>
              {media.caption && <p className="text-sm text-ink-2">{media.caption}</p>}
            </div>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close preview"
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-control text-ink-2 transition-colors hover:bg-white/[0.06] hover:text-ink"
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-auto bg-navy p-3 sm:p-4">
            <img src={media.src} alt={media.alt} className="mx-auto max-h-[70dvh] w-auto object-contain" />
          </div>
          {actions && <div className="flex flex-wrap items-center gap-x-5 border-t border-line px-4 py-2 sm:px-5">{actions}</div>}
        </div>
      )}
    </dialog>
  );
}
