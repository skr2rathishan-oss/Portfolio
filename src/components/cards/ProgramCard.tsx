import { ArrowUpRight, Award } from 'lucide-react';
import type { Certification, Program, ProgramKind } from '../../content/types';
import { formatRange } from '../../content/selectors';
import { cx, linkProps, MediaImage, NewTabHint, SkillList } from './shared';

export interface ProgramCardProps {
  program: Program;
  /** The linked certification (resolved by the caller from program.certificationId). */
  certification?: Certification;
  className?: string;
}

export const PROGRAM_KIND_LABEL: Record<ProgramKind, string> = {
  bootcamp: 'Bootcamp',
  fellowship: 'Fellowship',
  workshop: 'Workshop',
  course: 'Course',
  accelerator: 'Accelerator',
  exchange: 'Exchange',
  other: 'Program',
};

const MODE_LABEL = { online: 'Online', 'in-person': 'In person', hybrid: 'Hybrid' } as const;

const linkClass =
  'inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline';

export default function ProgramCard({ program, certification, className }: ProgramCardProps) {
  const range = formatRange(program.start, program.end);
  return (
    <article
      className={cx(
        'grid gap-5 rounded-card border border-line bg-surface p-4 sm:grid-cols-[6rem_minmax(0,1fr)] sm:p-5',
        className,
      )}
    >
      <MediaImage
        src={program.logo}
        alt={`${program.organizer} logo`}
        fallbackText={program.organizer}
        width={192}
        height={192}
        className="h-20 w-20 self-start rounded-control border border-line bg-raised text-xl sm:h-24 sm:w-24"
        imgClassName="object-contain p-2"
      />
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
          <span className="rounded-chip border border-line px-2 py-0.5 text-ink-2">{PROGRAM_KIND_LABEL[program.kind]}</span>
          {program.mode && <span className="text-ink-3">{MODE_LABEL[program.mode]}</span>}
        </div>
        <h3 className="mt-3 text-h3 text-ink text-pretty">{program.title}</h3>
        <p className="mt-1 text-sm text-ink-2">{program.organizer}</p>
        {range && <p className="mt-1 font-mono text-xs text-ink-3">{range}</p>}
        {program.description && (
          <p className="mt-3 max-w-[65ch] text-[0.9375rem] leading-relaxed text-ink-2">{program.description}</p>
        )}
        {program.skills.length > 0 && (
          <div className="mt-4">
            <SkillList skills={program.skills} label="Skills covered" />
          </div>
        )}
        {(certification?.credentialUrl || program.url) && (
          <div className="mt-2 flex flex-wrap gap-x-5">
            {certification?.credentialUrl && (
              <a {...linkProps(certification.credentialUrl)} className={cx(linkClass, 'text-accent')}>
                <Award size={15} aria-hidden="true" />
                Certificate<span className="sr-only">: {certification.name}</span>
                <NewTabHint url={certification.credentialUrl} />
              </a>
            )}
            {program.url && (
              <a {...linkProps(program.url)} className={cx(linkClass, 'text-ink-2 hover:text-ink')}>
                Program page<span className="sr-only"> for {program.title}</span>
                <ArrowUpRight size={15} aria-hidden="true" />
                <NewTabHint url={program.url} />
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
