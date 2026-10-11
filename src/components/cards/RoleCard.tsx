import { Calendar, ExternalLink, MapPin } from 'lucide-react';
import type { Role, RoleKind } from '../../content/types';
import { formatRange } from '../../content/selectors';
import { cx, linkProps, MediaImage } from './shared';

export interface RoleCardProps {
  role: Role;
  className?: string;
}

export const ROLE_KIND_LABEL: Record<RoleKind, string> = {
  work: 'Work',
  leadership: 'Leadership',
  community: 'Community',
  membership: 'Membership',
  volunteer: 'Volunteer',
};

export default function RoleCard({ role, className }: RoleCardProps) {
  const accent = role.accent ?? '#00abf0';
  const range = formatRange(role.start, role.end);
  return (
    <article
      className={cx(
        'group relative rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-[#00abf0]/40 p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:gap-5 transition-colors duration-300',
        className,
      )}
    >
      {/* Logo is shown prominently; a lettermark stands in when none is set. */}
      <MediaImage
        src={role.logo}
        alt={`${role.organization} logo`}
        fallbackText={role.organization}
        accent={accent}
        className="w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 rounded-2xl bg-white/5 text-2xl"
        imgClassName="object-contain p-2"
      />

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span
            className="text-[11px] px-2.5 py-0.5 rounded-full font-semibold"
            style={{ background: `${accent}1f`, color: accent }}
          >
            {ROLE_KIND_LABEL[role.kind]}
          </span>
        </div>
        <h3 className="font-bold text-base sm:text-lg text-white">{role.title}</h3>
        <p className="text-sm text-gray-300">
          {role.organization}
          {role.parentOrg && <span className="text-gray-500"> · {role.parentOrg}</span>}
        </p>

        {(range || role.location) && (
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400 mt-1">
            {range && (
              <span className="flex items-center gap-1.5">
                <Calendar size={12} className="text-[#00abf0]" aria-hidden="true" />
                {range}
              </span>
            )}
            {role.location && (
              <span className="flex items-center gap-1.5">
                <MapPin size={12} className="text-[#00abf0]" aria-hidden="true" />
                {role.location}
              </span>
            )}
          </p>
        )}

        {role.description && <p className="text-xs sm:text-sm text-gray-400 leading-relaxed mt-2">{role.description}</p>}

        {role.highlights && role.highlights.length > 0 && (
          <ul className="list-disc pl-4 mt-2 text-xs text-gray-400 space-y-1">
            {role.highlights.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        )}

        {role.url && (
          <a
            {...linkProps(role.url)}
            className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold hover:underline underline-offset-2"
            style={{ color: accent }}
          >
            <ExternalLink size={12} aria-hidden="true" />
            Visit website<span className="sr-only"> of {role.organization}</span>
          </a>
        )}
      </div>
    </article>
  );
}
