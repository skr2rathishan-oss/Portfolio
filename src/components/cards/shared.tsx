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
      className={cx('flex items-center justify-center font-bold select-none bg-white/[0.06] text-[#00abf0]', className)}
      style={accent ? { color: accent, backgroundColor: `${accent}1f` } : undefined}
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
}: {
  src?: string;
  alt: string;
  fallbackText: string;
  className?: string;
  imgClassName?: string;
  accent?: string;
  loading?: 'lazy' | 'eager';
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
        'inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-medium bg-[#00abf0]/15 text-[#00abf0] border border-[#00abf0]/30',
        className,
      )}
    >
      {children}
    </span>
  );
}

export function SkillList({ skills, label }: { skills: string[]; label: string }) {
  if (skills.length === 0) return null;
  return (
    <ul aria-label={label} className="flex flex-wrap gap-1.5">
      {skills.map((s) => (
        <li key={s}>
          <Pill>{s}</Pill>
        </li>
      ))}
    </ul>
  );
}
