import { useState } from 'react';
import type { Technology } from '../../content/types';
import { T, useEd } from '../../content/editable';
import { applyStyle } from '../sections/sectionStyle';
import { cx, initials } from './shared';

export interface TechChipProps {
  tech: Technology;
  count?: number;
  active?: boolean;
  onClick?: (tech: Technology) => void;
  className?: string;
}

/** Monochrome-ish icon (full colour on hover/active); a monogram when no icon is set or it fails to load. */
export function TechIcon({ tech, active = false }: { tech: Technology; active?: boolean }) {
  const [failed, setFailed] = useState(false);
  if (!tech.icon || failed) {
    return (
      <span
        aria-hidden="true"
        className={cx(
          'flex h-5 w-5 shrink-0 items-center justify-center rounded-[4px] border text-[0.5625rem] font-semibold leading-none tracking-tight',
          active ? 'border-accent/60 text-accent' : 'border-line-strong/50 text-ink-2',
        )}
      >
        {initials(tech.name)}
      </span>
    );
  }
  return (
    <img
      src={tech.icon}
      alt=""
      width={20}
      height={20}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={cx(
        'h-5 w-5 shrink-0 object-contain transition-[filter,opacity] duration-150',
        active ? 'opacity-100' : 'opacity-75 grayscale group-hover:opacity-100 group-hover:grayscale-0',
      )}
    />
  );
}

export default function TechChip({ tech, count, active = false, onClick, className }: TechChipProps) {
  const label = count !== undefined ? `${tech.name}, ${count} project${count === 1 ? '' : 's'}` : tech.name;
  const ed = useEd();
  const attrs = ed(T.item('technologies', tech.id), 'item');
  const body = (
    <>
      <TechIcon tech={tech} active={active} />
      <span>{tech.name}</span>
      {count !== undefined && (
        <span
          aria-hidden="true"
          className={cx('font-mono text-xs tabular-nums', active ? 'text-accent' : 'text-ink-3')}
        >
          {count}
        </span>
      )}
    </>
  );

  if (onClick) {
    return (
      <button
        {...attrs}
        type="button"
        aria-pressed={active}
        aria-label={label}
        onClick={() => onClick(tech)}
        className={cx(
          'group inline-flex min-h-11 shrink-0 items-center gap-2 rounded-control border px-3 text-sm font-medium whitespace-nowrap transition-colors duration-150 pointer-fine:min-h-9',
          active
            ? 'border-accent bg-accent-wash text-ink'
            : applyStyle('border-line bg-white/[0.02] text-ink-2 hover:border-white/25 hover:text-ink', tech.style, [
                { key: 'emphasis', tokens: 'border-line bg-white/[0.02]' },
              ]),
          className,
        )}
      >
        {body}
      </button>
    );
  }
  return (
    <span
      {...attrs}
      aria-label={count !== undefined ? label : undefined}
      className={cx(
        'group inline-flex min-h-9 shrink-0 items-center gap-2 px-1 text-sm font-medium whitespace-nowrap text-ink-2',
        tech.style?.emphasis === 'accent' && 'rounded-control border border-accent/50 bg-accent-wash px-2',
        className,
      )}
    >
      {body}
    </span>
  );
}
