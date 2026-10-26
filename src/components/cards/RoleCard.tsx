import { ArrowUpRight, MapPin } from 'lucide-react';
import type { Role, RoleKind } from '../../content/types';
import { formatRange } from '../../content/selectors';
import { applyStyle, cardRules } from '../sections/sectionStyle';
import { cx, linkProps, MediaImage, NewTabHint } from './shared';

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
  const range = formatRange(role.start, role.end);
  const current = role.end === 'present';
  const { style } = role;
  return (
    <article
      className={cx(
        applyStyle(
          'grid gap-5 rounded-card border border-line bg-surface p-4 sm:grid-cols-[8rem_minmax(0,1fr)] sm:p-5 lg:grid-cols-[9rem_minmax(0,1fr)] lg:gap-7',
          style,
          cardRules({ background: 'bg-surface', border: 'border border-line', radius: 'rounded-card' }),
        ),
        className,
      )}
    >
      {/* Logo is shown prominently; a lettermark stands in when none is set. */}
      <MediaImage
        src={role.logo}
        alt={`${role.organization} logo`}
        fallbackText={role.organization}
        width={288}
        height={288}
        className="h-28 w-28 self-start rounded-control border border-line bg-raised text-3xl sm:h-32 sm:w-32 lg:h-36 lg:w-36"
        imgClassName={applyStyle('object-contain p-3', style, [{ key: 'imageFit', tokens: 'object-contain' }])}
      />

      <div className="flex min-w-0 flex-col">
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
          <span className="rounded-chip border border-line px-2 py-0.5 text-ink-2">{ROLE_KIND_LABEL[role.kind]}</span>
          {current && (
            <span className="inline-flex items-center gap-1.5 rounded-chip border border-success/30 px-2 py-0.5 text-success">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-success" />
              Current
            </span>
          )}
        </div>

        <h3
          className={applyStyle('mt-3 text-h3 text-ink text-pretty', style, [
            { key: 'titleSize', tokens: 'text-h3' },
            { key: 'titleColor', tokens: 'text-ink' },
          ])}
        >
          {role.title}
        </h3>
        <p className="mt-1 text-sm text-ink-2">
          {role.organization}
          {role.parentOrg && <span className="text-ink-3">, {role.parentOrg}</span>}
        </p>

        {(range || role.location) && (
          <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-3">
            {range && <span className="font-mono">{range}</span>}
            {role.location && (
              <span className="inline-flex items-center gap-1">
                <MapPin size={12} aria-hidden="true" />
                {role.location}
              </span>
            )}
          </p>
        )}

        {role.description && (
          <p className="mt-3 max-w-[65ch] text-[0.9375rem] leading-relaxed text-ink-2">
            {role.description}
          </p>
        )}

        {role.highlights && role.highlights.length > 0 && (
          <ul className="mt-3 max-w-[65ch] space-y-1.5 text-sm text-ink-2">
            {role.highlights.map((h) => (
              <li key={h} className="flex gap-2">
                <span aria-hidden="true" className="mt-[0.6em] h-1 w-1 shrink-0 rounded-full bg-accent" />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        )}

        {role.url && (
          <div className="mt-auto pt-3">
            <a
              {...linkProps(role.url)}
              className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-accent underline-offset-4 hover:underline"
            >
              Visit {role.organization.length > 32 ? 'website' : role.organization}
              <ArrowUpRight size={15} aria-hidden="true" />
              <NewTabHint url={role.url} />
            </a>
          </div>
        )}
      </div>
    </article>
  );
}
