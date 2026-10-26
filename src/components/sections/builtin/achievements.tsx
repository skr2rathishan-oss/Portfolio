// Achievements page built-in sections (28e364b Achievements.tsx JSX, cut verbatim). The lightbox
// stays in the page; sections reach its setter through PreviewContext.
import { useContext, useMemo } from 'react';
import { useContent } from '../../../content/ContentProvider';
import { sectionText } from '../../../content/layout';
import { dateSortKey } from '../../../content/selectors';
import { swapGridCols } from '../../../content/styleClasses';
import type { Achievement, BuiltinSection } from '../../../content/types';
import AchievementCard from '../../cards/AchievementCard';
import ProgramCard from '../../cards/ProgramCard';
import RoleCard from '../../cards/RoleCard';
import { cx } from '../../cards/shared';
import { SectionHeading } from '../../layout/PageHeader';
import { PreviewContext } from '../../ui/Lightbox';
import { applyStyle, bodyRules } from '../sectionStyle';

type Props = { section: BuiltinSection };

function yearOf(date: string): string {
  return date.slice(0, 4);
}

export function AchievementsHeader({ section }: Props) {
  const { achievements, roles, programs } = useContent();
  const empty = achievements.length === 0 && roles.length === 0 && programs.length === 0;
  return (
    <>
      {/* No visible page title (Leadership & Community leads the page); the <h1> stays for screen readers. */}
      <h1 className="sr-only">{sectionText(section, 'title')}</h1>

      {empty && <p className="mt-10 text-ink-2">Nothing here yet.</p>}
    </>
  );
}

export function AchievementsHackathons({ section }: Props) {
  const { achievements } = useContent();
  const onPreview = useContext(PreviewContext);

  // Newest first, grouped by year (`order` breaks ties). Research has its own section.
  const byYear = useMemo(() => {
    const sorted = achievements
      .filter((a) => a.kind !== 'research')
      .map((a, index) => ({ a, index }))
      .sort((x, y) => dateSortKey(y.a.date).localeCompare(dateSortKey(x.a.date)) || x.index - y.index)
      .map(({ a }) => a);
    const groups: { year: string; items: Achievement[] }[] = [];
    for (const a of sorted) {
      const year = yearOf(a.date);
      const g = groups[groups.length - 1];
      if (g && g.year === year) g.items.push(a);
      else groups.push({ year, items: [a] });
    }
    return groups;
  }, [achievements]);

  if (byYear.length === 0) return null;
  return (
    <section
      aria-labelledby="hackathons-heading"
      id="hackathons"
      className={applyStyle('section-gap', section.style, bodyRules({ spaceTop: 'section-gap' }))}
    >
      <SectionHeading id="hackathons-heading" title={sectionText(section, 'title')} />
      <div className="space-y-10">
        {byYear.map(({ year, items }) => (
          <div key={year} className="lg:grid lg:grid-cols-[6rem_minmax(0,1fr)] lg:gap-8">
            <p className="mb-3 font-mono text-sm text-ink-3 lg:sticky lg:top-[calc(var(--header-h)+1.5rem)] lg:mb-0 lg:self-start lg:pt-5 lg:text-base">
              {year}
            </p>
            <ol className="space-y-5">
              {items.map((a) => (
                <li key={a.id} id={a.id}>
                  <AchievementCard item={a} onPreview={onPreview} />
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </section>
  );
}

export function AchievementsResearch({ section }: Props) {
  const { achievements } = useContent();
  const onPreview = useContext(PreviewContext);
  const research = useMemo(
    () =>
      achievements
        .map((a, index) => ({ a, index }))
        .filter(({ a }) => a.kind === 'research')
        .sort((x, y) => dateSortKey(y.a.date).localeCompare(dateSortKey(x.a.date)) || x.index - y.index)
        .map(({ a }) => a),
    [achievements],
  );
  if (research.length === 0) return null;
  return (
    <section
      aria-labelledby="research-heading"
      id="research"
      className={applyStyle('section-gap', section.style, bodyRules({ spaceTop: 'section-gap' }))}
    >
      <SectionHeading id="research-heading" title={sectionText(section, 'title')} lead={sectionText(section, 'lead')} />
      <ol className="space-y-5">
        {research.map((a) => (
          <li key={a.id} id={a.id}>
            <AchievementCard item={a} compact onPreview={onPreview} />
          </li>
        ))}
      </ol>
    </section>
  );
}

export function AchievementsCommunity({ section }: Props) {
  const { roles } = useContent();
  // Oldest first, so the timeline reads top-down like the TRCSL one.
  const ordered = useMemo(
    () =>
      roles
        .map((r, index) => ({ r, index }))
        .sort((x, y) => dateSortKey(x.r.start).localeCompare(dateSortKey(y.r.start)) || x.index - y.index)
        .map(({ r }) => r),
    [roles],
  );
  if (ordered.length === 0) return null;
  return (
    <section
      aria-labelledby="community-heading"
      id="community"
      className={applyStyle('pt-10 sm:pt-14', section.style, bodyRules({ spaceTop: 'pt-10 sm:pt-14' }))}
    >
      <SectionHeading id="community-heading" title={sectionText(section, 'title')} lead={sectionText(section, 'lead')} />
      <ol>
        {ordered.map((r, i) => {
          const last = i === ordered.length - 1;
          return (
            <li
              key={r.id}
              id={r.id}
              className={cx('relative grid grid-cols-[2rem_minmax(0,1fr)] gap-x-3 sm:gap-x-5', !last && 'pb-8 sm:pb-10')}
            >
              {/* Rail: marker plus the connecting line to the next role. */}
              <div aria-hidden="true" className="relative flex justify-center">
                {!last && <span className="absolute top-8 bottom-[-0.25rem] w-px bg-line" />}
                <span
                  className={cx(
                    'relative z-[1] mt-4 flex h-8 w-8 items-center justify-center rounded-full border font-mono text-xs font-semibold sm:mt-5',
                    r.end === 'present'
                      ? 'border-accent/40 bg-accent-wash text-accent'
                      : 'border-line-strong bg-raised text-ink-3',
                  )}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
              <RoleCard role={r} />
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export function AchievementsPrograms({ section }: Props) {
  const { programs } = useContent();
  if (programs.length === 0) return null;
  return (
    <section
      aria-labelledby="programs-heading"
      id="programs"
      className={applyStyle('section-gap', section.style, bodyRules({ spaceTop: 'section-gap' }))}
    >
      <SectionHeading id="programs-heading" title={sectionText(section, 'title')} />
      <ul className={swapGridCols('grid gap-5 lg:grid-cols-2', section.style?.columns)}>
        {programs.map((p) => (
          <li key={p.id} id={p.id} className="min-w-0">
            <ProgramCard program={p} className="h-full" />
          </li>
        ))}
      </ul>
    </section>
  );
}
