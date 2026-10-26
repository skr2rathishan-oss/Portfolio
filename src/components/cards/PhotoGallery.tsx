// Event-photo strip for cards: full-size photos in one horizontally scrolling row (swipe on touch,
// arrow buttons on wider screens). Every photo opens the page lightbox.
import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { PreviewMedia } from '../ui/Lightbox';
import { cx, MediaImage } from './shared';

export interface GalleryPhoto {
  src: string;
  alt: string;
  /** Optional per-photo caption shown in the lightbox. */
  caption?: string;
}

export interface PhotoGalleryProps {
  photos: GalleryPhoto[];
  /** Lightbox heading (usually the card title). */
  title: string;
  /** Lightbox caption suffix (e.g. the organizer). */
  caption?: string;
  onPreview?: (media: PreviewMedia) => void;
  /** 'sm' uses smaller photos for compact cards. */
  size?: 'md' | 'sm';
  /** Classes for each <img> (fit / position presets). Default: object-cover. */
  imgClassName?: string;
  className?: string;
}

const frameBase = 'relative block shrink-0 snap-start overflow-hidden rounded-control border border-line bg-navy';
const FRAME_SIZE = {
  md: 'h-56 w-[18rem] sm:h-64 sm:w-[21rem]',
  sm: 'h-40 w-[12rem] sm:h-44 sm:w-[13rem]',
} as const;
const zoom = 'motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-[1.03]';
const arrow =
  'absolute top-1/2 z-[1] hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-line-strong bg-canvas/85 text-ink backdrop-blur transition-[opacity,border-color] hover:border-accent/60 hover:text-accent disabled:pointer-events-none disabled:opacity-0 sm:flex';

export default function PhotoGallery({
  photos,
  title,
  caption,
  onPreview,
  size = 'md',
  imgClassName,
  className,
}: PhotoGalleryProps) {
  const frame = cx(frameBase, FRAME_SIZE[size]);
  const rowRef = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: true });

  const updateEdges = useCallback(() => {
    const el = rowRef.current;
    if (!el) return;
    setEdges({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
  }, []);

  useEffect(() => {
    updateEdges();
    const el = rowRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(updateEdges);
    ro.observe(el);
    return () => ro.disconnect();
  }, [updateEdges, photos.length]);

  if (photos.length === 0) return null;
  const total = photos.length;

  const scroll = (dir: 1 | -1) => {
    const el = rowRef.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
  };

  const open = (index: number) =>
    onPreview?.({
      src: photos[index].src,
      alt: photos[index].alt,
      title,
      caption: [photos[index].caption, `Photo ${index + 1} of ${total}`, caption].filter(Boolean).join(' · '),
    });

  return (
    <div className={cx('relative min-w-0', className)}>
      <button type="button" onClick={() => scroll(-1)} disabled={edges.start} className={cx(arrow, '-left-3')}>
        <ChevronLeft size={18} aria-hidden="true" />
        <span className="sr-only">Previous photos: {title}</span>
      </button>

      <ul
        ref={rowRef}
        onScroll={updateEdges}
        aria-label={`Photos: ${title}`}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain pb-2 [scrollbar-width:thin]"
      >
        {photos.map((p, index) => {
          const img = (
            <MediaImage
              src={p.src}
              alt={onPreview ? '' : p.alt}
              fallbackText={title}
              loading={index < 2 ? 'eager' : 'lazy'}
              width={672}
              height={512}
              className="h-full w-full text-3xl"
              imgClassName={cx(imgClassName ?? 'object-cover', onPreview && zoom)}
            />
          );
          return (
            <li key={p.src} className="shrink-0">
              {onPreview ? (
                <button
                  type="button"
                  onClick={() => open(index)}
                  className={cx(frame, 'group cursor-zoom-in transition-colors hover:border-white/25')}
                >
                  {img}
                  <span className="sr-only">
                    Enlarge photo {index + 1} of {total}: {p.alt}
                  </span>
                </button>
              ) : (
                <div className={frame}>{img}</div>
              )}
            </li>
          );
        })}
      </ul>

      <button type="button" onClick={() => scroll(1)} disabled={edges.end} className={cx(arrow, '-right-3')}>
        <ChevronRight size={18} aria-hidden="true" />
        <span className="sr-only">Next photos: {title}</span>
      </button>
    </div>
  );
}
