import { ArrowRight, Calendar, Trophy, Users } from 'lucide-react';
import type { Achievement, AchievementKind } from '../../content/types';
import { formatDate } from '../../content/selectors';
import { cx, linkProps, MediaImage, SkillList } from './shared';

export interface AchievementCardProps {
  item: Achievement;
  className?: string;
}

export const ACHIEVEMENT_KIND_LABEL: Record<AchievementKind, string> = {
  hackathon: 'Hackathon',
  competition: 'Competition',
  challenge: 'Challenge',
  award: 'Award',
};

export default function AchievementCard({ item, className }: AchievementCardProps) {
  const accent = item.accent ?? '#00abf0';
  return (
    <article
      className={cx(
        'group relative rounded-2xl bg-[#061524] border border-white/[0.08] hover:border-[#00abf0]/40 p-4 sm:p-5 flex flex-col gap-4 transition-colors duration-300',
        className,
      )}
    >
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 items-start">
        {/* Image is a first-class element of this card. */}
        <MediaImage
          src={item.image}
          alt={`${item.title} image`}
          fallbackText={item.title}
          accent={accent}
          className="w-full aspect-square sm:w-36 sm:h-36 flex-shrink-0 rounded-2xl border border-[#00abf0]/40 bg-black/40 text-3xl"
          imgClassName="object-cover"
        />

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5 text-[11px] font-semibold">
            <span className="px-2.5 py-0.5 rounded-full bg-white/[0.05] text-gray-300 border border-white/10">
              {ACHIEVEMENT_KIND_LABEL[item.kind]}
            </span>
            {item.result && (
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#00abf0]/15 text-[#00abf0] border border-[#00abf0]/30">
                <Trophy size={12} aria-hidden="true" />
                {item.result}
              </span>
            )}
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">{item.title}</h3>

          <p className="flex items-center flex-wrap gap-x-2 gap-y-1 text-xs text-gray-400 mt-1 mb-2.5">
            <span>{item.organizer}</span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1.5">
              <Calendar size={12} className="text-[#00abf0]" aria-hidden="true" />
              <time dateTime={item.date}>{formatDate(item.date)}</time>
            </span>
            {item.team && (
              <>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1.5">
                  <Users size={12} className="text-[#00abf0]" aria-hidden="true" />
                  Team {item.team}
                </span>
              </>
            )}
          </p>

          {item.description && <p className="text-xs sm:text-sm text-gray-400 leading-relaxed mb-3.5">{item.description}</p>}
          <SkillList skills={item.skills} label="Skills" />
        </div>
      </div>

      {item.link && (
        <a
          {...linkProps(item.link.url)}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold border border-[#00abf0]/40 text-white hover:bg-[#00abf0]/10 hover:border-[#00abf0] hover:text-[#00abf0] transition-colors"
        >
          <span>{item.link.label || 'Learn more'}</span>
          <span className="sr-only"> about {item.title}</span>
          <ArrowRight size={14} aria-hidden="true" />
        </a>
      )}
    </article>
  );
}
