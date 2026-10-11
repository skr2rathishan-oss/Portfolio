// Small building blocks shared by the card components.
import { useState, type ReactNode } from 'react';

export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}

export function isExternal(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

/** Props for an <a> that opens external links in a new tab safely. */
export function linkProps(url: string) {
  return isExternal(url) ? { href: url, target: '_blank', rel: 'noopener noreferrer' } : { href: url };
}

/** Visually hidden "(opens in new tab)" suffix for external links. */
export function NewTabHint({ url }: { url: string }) {
  return isExternal(url) ? <span className="sr-only"> (opens in new tab)</span> : null;
}

/** True when a URL points at an image file (used to open certificate links in a lightbox). */
export function isImageUrl(url: string | undefined): boolean {
  return !!url && /\.(png|jpe?g|webp|gif|avif)(\?.*)?$/i.test(url);
}

export function initials(text: string): string {
  const words = text
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

/** Lettermark used when an image is missing or fails to load. */
export function Monogram({ text, className, accent }: { text: string; className?: string; accent?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cx(
        'flex items-center justify-center font-semibold tracking-tight select-none bg-raised text-ink-2',
        className,
      )}
      style={accent ? { color: accent } : undefined}
    >
      {initials(text)}
    </span>
  );
}

/** <img> with a monogram fallback. Pass `alt=""` for decorative images. */
export function MediaImage({
  src,
  alt,
  fallbackText,
  className,
  imgClassName,
  accent,
  loading = 'lazy',
  width,
  height,
}: {
  src?: string;
  alt: string;
  fallbackText: string;
  className?: string;
  imgClassName?: string;
  accent?: string;
  loading?: 'lazy' | 'eager';
  width?: number;
  height?: number;
}) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return <Monogram text={fallbackText} accent={accent} className={className} />;
  }
  return (
    <span className={cx('block overflow-hidden', className)}>
      <img
        src={src}
        alt={alt}
        loading={loading}
        decoding="async"
        width={width}
        height={height}
        onError={() => setFailed(true)}
        className={cx('w-full h-full', imgClassName ?? 'object-cover')}
      />
    </span>
  );
}

export function Pill({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1 rounded-chip border border-line bg-white/[0.03] px-2 py-0.5 text-xs font-medium text-ink-2',
        className,
      )}
    >
      {children}
    </span>
  );
}

export function SkillList({ skills, label, max }: { skills: string[]; label: string; max?: number }) {
  if (skills.length === 0) return null;
  const shown = max ? skills.slice(0, max) : skills;
  const rest = skills.length - shown.length;
  return (
    <ul aria-label={label} className="flex flex-wrap gap-1.5">
      {shown.map((s) => (
        <li key={s}>
          <Pill>{s}</Pill>
        </li>
      ))}
      {rest > 0 && (
        <li>
          <Pill className="text-ink-3">
            +{rest}
            <span className="sr-only"> more</span>
          </Pill>
        </li>
      )}
    </ul>
  );
}
