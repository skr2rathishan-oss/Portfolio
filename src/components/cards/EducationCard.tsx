import type { Education } from '../../content/types';
import { formatRange } from '../../content/selectors';
import { cx, linkProps, MediaImage } from './shared';

export interface EducationCardProps {
  education: Education;
  className?: string;
}

export default function EducationCard({ education: e, className }: EducationCardProps) {
  const inProgress = e.status === 'in-progress';
  return (
    <article
      className={cx(
        'flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-[#00abf0]/40 transition-colors duration-200',
        className,
      )}
    >
      <MediaImage
        src={e.logo}
        alt={`${e.institution} logo`}
        fallbackText={e.institution}
        className="w-16 h-16 rounded-lg flex-shrink-0 border border-white/[0.08] text-lg"
      />
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-sm text-white">
          {e.degree}
          {e.field && <span className="font-normal text-gray-300"> · {e.field}</span>}
        </h3>
        {e.url ? (
          <a
            {...linkProps(e.url)}
            className="text-xs mt-0.5 text-gray-400 hover:text-[#00abf0] transition-colors underline underline-offset-2"
          >
            {e.institution}
          </a>
        ) : (
          <p className="text-xs text-gray-400 mt-0.5">{e.institution}</p>
        )}
        <p className="text-xs text-gray-400 mt-0.5">{formatRange(e.start, e.end)}</p>
        {e.grade && <p className="text-xs text-gray-300 mt-0.5">{e.grade}</p>}
        {e.description && <p className="text-xs text-gray-400 mt-1 leading-relaxed">{e.description}</p>}
      </div>
      <span
        className={cx(
          'text-xs px-2.5 py-1 rounded-full font-semibold whitespace-nowrap',
          inProgress ? 'bg-[#00abf0]/15 text-[#00abf0]' : 'bg-emerald-500/15 text-emerald-400',
        )}
      >
        {inProgress ? 'In progress' : 'Completed'}
      </span>
    </article>
  );
}
