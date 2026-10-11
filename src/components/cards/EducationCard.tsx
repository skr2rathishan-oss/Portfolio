import type { Education } from '../../content/types';
import { formatRange } from '../../content/selectors';
import { cx, linkProps, MediaImage, NewTabHint } from './shared';

export interface EducationCardProps {
  education: Education;
  className?: string;
}

export default function EducationCard({ education: e, className }: EducationCardProps) {
  const inProgress = e.status === 'in-progress';
  return (
    <article className={cx('flex gap-4 rounded-card border border-line bg-surface p-4 sm:p-5', className)}>
      <MediaImage
        src={e.logo}
        alt=""
        fallbackText={e.institution}
        width={128}
        height={128}
        className="h-14 w-14 shrink-0 rounded-control border border-line bg-raised text-base sm:h-16 sm:w-16"
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
          <h3 className="text-base font-semibold leading-snug text-ink sm:text-lg">
            {e.degree}
            {e.field && <span className="font-normal text-ink-2">, {e.field}</span>}
          </h3>
          <span
            className={cx(
              'rounded-chip border px-2 py-0.5 text-xs font-medium whitespace-nowrap',
              inProgress ? 'border-accent/35 bg-accent-wash text-ink' : 'border-line text-ink-2',
            )}
          >
            {inProgress ? 'In progress' : 'Completed'}
          </span>
        </div>
        {e.url ? (
          <a
            {...linkProps(e.url)}
            className="mt-0.5 inline-block py-1 text-sm text-ink-2 underline decoration-line-strong underline-offset-4 transition-colors hover:text-ink hover:decoration-ink"
          >
            {e.institution}
            <NewTabHint url={e.url} />
          </a>
        ) : (
          <p className="mt-0.5 text-sm text-ink-2">{e.institution}</p>
        )}
        <p className="font-mono text-xs text-ink-3">{formatRange(e.start, e.end)}</p>
        {e.grade && <p className="mt-1 text-sm text-ink-2">{e.grade}</p>}
        {e.description && <p className="mt-2 text-sm leading-relaxed text-ink-2">{e.description}</p>}
      </div>
    </article>
  );
}
