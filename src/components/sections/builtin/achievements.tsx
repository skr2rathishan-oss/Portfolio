// Achievements page built-in sections (28e364b Achievements.tsx JSX, cut verbatim). The lightbox
// stays in the page; sections reach its setter through PreviewContext.
import { useContext, useMemo } from 'react';
import { useContent } from '../../../content/ContentProvider';
import { T, useEd } from '../../../content/editable';
import { sectionText } from '../../../content/layout';
import { dateSortKey, indexById } from '../../../content/selectors';
import { swapGridCols } from '../../../content/styleClasses';
import type { Achievement, BuiltinSection } from '../../../content/types';
import AchievementCard from '../../cards/AchievementCard';
import ProgramCard from '../../cards/ProgramCard';
import RoleCard from '../../cards/RoleCard';
import PageHeader, { SectionHeading } from '../../layout/PageHeader';
import { PreviewContext } from '../../ui/Lightbox';
import { applyStyle, bodyRules } from '../sectionStyle';

type Props = { section: BuiltinSection };

function yearOf(date: string): string {
  return date.slice(0, 4);
}

export function AchievementsHeader({ section }: Props) {
  const { achievements, roles, programs } = useContent();
  const ed = useEd();
  const empty = achievements.length === 0 && roles.length === 0 && programs.length === 0;
  return (
    <>
      <PageHeader
        title={sectionText(section, 'title')}
        lead={sectionText(section, 'lead')}
        attrs={ed(T.section(section.id), 'section')}
        titleAttrs={ed(T.section(section.id, 'title'), 'text')}
        leadAttrs={ed(T.section(section.id, 'lead'), 'text')}
      />

      {empty && <p className="mt-10 text-ink-2">Nothing here yet.</p>}
    </>
  );
}

export function AchievementsHackathons({ section }: Props) {
  const { achievements } = useContent();
  const ed = useEd();
  const onPreview = useContext(PreviewContext);

  // Newest first, grouped by year (the admin order breaks ties).
  const byYear = useMemo(() => {
    const sorted = achievements
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
      {...ed(T.section(section.id), 'section')}
      aria-labelledby="hackathons-heading"
      id="hackathons"
      className={applyStyle('mt-12 sm:mt-14', section.style, bodyRules({ spaceTop: 'mt-12 sm:mt-14' }))}
    >
      <SectionHeading id="hackathons-heading" title={sectionText(section, 'title')} titleAttrs={ed(T.section(section.id, 'title'), 'text')} />
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

export function AchievementsCommunity({ section }: Props) {
  const { roles } = useContent();
  const ed = useEd();
  if (roles.length === 0) return null;
  return (
    <section
      {...ed(T.section(section.id), 'section')}
      aria-labelledby="community-heading"
      id="community"
      className={applyStyle('section-gap', section.style, bodyRules({ spaceTop: 'section-gap' }))}
    >
      <SectionHeading id="community-heading" title={sectionText(section, 'title')} titleAttrs={ed(T.section(section.id, 'title'), 'text')} />
      <ul className="space-y-5 lg:pl-32">
        {roles.map((r) => (
          <li key={r.id} id={r.id}>
            <RoleCard role={r} />
          </li>
        ))}
      </ul>
    </section>
  );
}

export function AchievementsPrograms({ section }: Props) {
  const { programs, certifications } = useContent();
  const ed = useEd();
  const certById = useMemo(() => indexById(certifications), [certifications]);
  if (programs.length === 0) return null;
  return (
    <section
      {...ed(T.section(section.id), 'section')}
      aria-labelledby="programs-heading"
      id="programs"
      className={applyStyle('section-gap', section.style, bodyRules({ spaceTop: 'section-gap' }))}
    >
      <SectionHeading id="programs-heading" title={sectionText(section, 'title')} titleAttrs={ed(T.section(section.id, 'title'), 'text')} />
      <ul className={swapGridCols('grid gap-5 lg:grid-cols-2 lg:pl-32', section.style?.columns)}>
        {programs.map((p) => (
          <li key={p.id} id={p.id} className="min-w-0">
            <ProgramCard
              program={p}
              certification={p.certificationId ? certById.get(p.certificationId) : undefined}
              className="h-full"
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
