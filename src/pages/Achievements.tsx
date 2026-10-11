import { useMemo, useState } from 'react';
import { useContent } from '../content/ContentProvider';
import { dateSortKey, indexById } from '../content/selectors';
import type { Achievement } from '../content/types';
import AchievementCard from '../components/cards/AchievementCard';
import ProgramCard from '../components/cards/ProgramCard';
import RoleCard from '../components/cards/RoleCard';
import PageHeader, { SectionHeading } from '../components/layout/PageHeader';
import { usePageMeta } from '../components/layout/usePageMeta';
import Lightbox, { type PreviewMedia } from '../components/ui/Lightbox';

function yearOf(date: string): string {
  return date.slice(0, 4);
}

export default function Achievements() {
  const { achievements, roles, programs, certifications, profile } = useContent();
  const [preview, setPreview] = useState<PreviewMedia | null>(null);
  const certById = useMemo(() => indexById(certifications), [certifications]);

  usePageMeta({
    title: 'Achievements & Activities',
    siteName: profile.fullName,
    description: `Hackathons, competitions, community roles and programs ${profile.fullName} has taken part in.`,
  });

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

  const empty = achievements.length === 0 && roles.length === 0 && programs.length === 0;

  return (
    <div className="page-container">
      <PageHeader
        title="Achievements & Activities"
        lead="Hackathons and competitions I've entered, and the communities I'm part of."
      />

      {empty && <p className="mt-10 text-ink-2">Nothing here yet.</p>}

      {byYear.length > 0 && (
        <section aria-labelledby="hackathons-heading" id="hackathons" className="mt-12 sm:mt-14">
          <SectionHeading id="hackathons-heading" title="Hackathons & Competitions" />
          <div className="space-y-10">
            {byYear.map(({ year, items }) => (
              <div key={year} className="lg:grid lg:grid-cols-[6rem_minmax(0,1fr)] lg:gap-8">
                <p className="mb-3 font-mono text-sm text-ink-3 lg:sticky lg:top-[calc(var(--header-h)+1.5rem)] lg:mb-0 lg:self-start lg:pt-5 lg:text-base">
                  {year}
                </p>
                <ol className="space-y-5">
                  {items.map((a) => (
                    <li key={a.id} id={a.id}>
                      <AchievementCard item={a} onPreview={setPreview} />
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </section>
      )}

      {roles.length > 0 && (
        <section aria-labelledby="community-heading" id="community" className="section-gap">
          <SectionHeading id="community-heading" title="Leadership & Community" />
          <ul className="space-y-5 lg:pl-32">
            {roles.map((r) => (
              <li key={r.id} id={r.id}>
                <RoleCard role={r} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {programs.length > 0 && (
        <section aria-labelledby="programs-heading" id="programs" className="section-gap">
          <SectionHeading id="programs-heading" title="Programs" />
          <ul className="grid gap-5 lg:grid-cols-2 lg:pl-32">
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
      )}

      <Lightbox media={preview} onClose={() => setPreview(null)} />
    </div>
  );
}
