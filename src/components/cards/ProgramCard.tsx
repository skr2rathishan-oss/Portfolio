import { Award, Calendar, ExternalLink } from 'lucide-react';
import type { Certification, Program, ProgramKind } from '../../content/types';
import { formatRange } from '../../content/selectors';
import { cx, linkProps, MediaImage, SkillList } from './shared';

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

export default function ProgramCard({ program, certification, className }: ProgramCardProps) {
  const range = formatRange(program.start, program.end);
  return (
    <article
      className={cx(
        'group relative rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-[#00abf0]/40 p-4 sm:p-5 flex gap-4 transition-colors duration-300',
        className,
      )}
    >
      <MediaImage
        src={program.logo}
        alt={`${program.organizer} logo`}
        fallbackText={program.organizer}
        className="w-16 h-16 flex-shrink-0 rounded-xl bg-white/5 text-lg"
        imgClassName="object-contain p-1.5"
      />
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1 text-[11px] font-semibold">
          <span className="px-2.5 py-0.5 rounded-full bg-white/[0.05] text-gray-300 border border-white/10">
            {PROGRAM_KIND_LABEL[program.kind]}
          </span>
          {program.mode && <span className="text-gray-500">{MODE_LABEL[program.mode]}</span>}
        </div>
        <h3 className="font-bold text-base text-white">{program.title}</h3>
        <p className="text-sm text-gray-300">{program.organizer}</p>
        {range && (
          <p className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
            <Calendar size={12} className="text-[#00abf0]" aria-hidden="true" />
            {range}
          </p>
        )}
        {program.description && <p className="text-xs sm:text-sm text-gray-400 leading-relaxed mt-2">{program.description}</p>}
        {program.skills.length > 0 && (
          <div className="mt-3">
            <SkillList skills={program.skills} label="Skills" />
          </div>
        )}
        <div className="flex flex-wrap gap-3 mt-3 text-xs font-semibold">
          {certification?.credentialUrl && (
            <a {...linkProps(certification.credentialUrl)} className="inline-flex items-center gap-1.5 text-[#00abf0] hover:underline">
              <Award size={12} aria-hidden="true" />
              Certificate<span className="sr-only">: {certification.name}</span>
            </a>
          )}
          {program.url && (
            <a {...linkProps(program.url)} className="inline-flex items-center gap-1.5 text-gray-300 hover:text-white hover:underline">
              <ExternalLink size={12} aria-hidden="true" />
              Program page<span className="sr-only"> for {program.title}</span>
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
