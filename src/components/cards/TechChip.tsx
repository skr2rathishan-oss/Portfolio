import { useState } from 'react';
import type { Technology } from '../../content/types';
import { cx, Monogram } from './shared';

export interface TechChipProps {
  tech: Technology;
  count?: number;
  active?: boolean;
  onClick?: (tech: Technology) => void;
  className?: string;
}

function TechIcon({ tech }: { tech: Technology }) {
  const [failed, setFailed] = useState(false);
  if (!tech.icon || failed) {
    return <Monogram text={tech.name} accent={tech.color} className="w-5 h-5 rounded text-[9px]" />;
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
      className="w-5 h-5 object-contain"
    />
  );
}

export default function TechChip({ tech, count, active = false, onClick, className }: TechChipProps) {
  const body = (
    <>
      <TechIcon tech={tech} />
      <span>{tech.name}</span>
      {count !== undefined && (
        <span className="text-[10px] font-mono text-gray-500">
          <span aria-hidden="true">{count}</span>
          <span className="sr-only">
            ({count} project{count === 1 ? '' : 's'})
          </span>
        </span>
      )}
    </>
  );
  const base = cx(
    'inline-flex items-center gap-2 min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors',
    active ? 'bg-[#00abf0]/15 border-[#00abf0]/60 text-white' : 'bg-white/[0.03] border-white/[0.08] text-gray-300',
    className,
  );

  if (onClick) {
    return (
      <button
        type="button"
        aria-pressed={active}
        onClick={() => onClick(tech)}
        className={cx(
          base,
          'cursor-pointer hover:border-[#00abf0]/40 hover:text-white focus-visible:outline-2 focus-visible:outline-[#00abf0]',
        )}
      >
        {body}
      </button>
    );
  }
  return <span className={base}>{body}</span>;
}
