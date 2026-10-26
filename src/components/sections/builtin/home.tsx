// Home page built-in sections. Markup is the 28e364b Home.tsx JSX, cut verbatim; only opt-in style
// presets were added.
import { useMemo } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useContent } from '../../../content/ContentProvider';
import { sectionText } from '../../../content/layout';
import { dateSortKey, formatDate, indexById, techUsageCount } from '../../../content/selectors';
import type { BuiltinSection, Technology } from '../../../content/types';
import Hero from '../Hero';
import { TechIcon } from '../../cards/TechChip';
import { MediaImage } from '../../cards/shared';
import { SectionHeading } from '../../layout/PageHeader';
import { btnPrimary, btnQuiet } from '../../ui/styles';
import { ACHIEVEMENT_KIND_LABEL } from '../../cards/AchievementCard';
import { applyStyle, bodyRules } from '../sectionStyle';

const PROFICIENCY_RANK: Record<Technology['proficiency'], number> = { core: 0, proficient: 1, familiar: 2, exploring: 3 };
const MAX_CORE_STACK = 12;

type Props = { section: BuiltinSection };

export function HomeHero({ section }: Props) {
  const { profile, socials, site } = useContent();
  return <Hero profile={profile} socials={socials} cvUrl={site.cv?.url} fullHeight />;
}

const chipClass =
  'group inline-flex min-h-11 items-center gap-2.5 rounded-control border border-line bg-surface/70 px-3.5 text-sm font-medium text-ink transition-colors hover:border-white/25 hover:bg-raised';

export function HomeCoreStack({ section }: Props) {
  const { projects, technologies } = useContent();
  const usage = useMemo(() => techUsageCount(projects), [projects]);

  // Featured technologies that real projects use, strongest first.
  const coreStack = useMemo(
    () =>
      technologies
        .map((t, index) => ({ t, index, count: usage.get(t.id) ?? 0 }))
        .filter(({ t, count }) => t.featured && t.showInStack && t.proficiency !== 'exploring' && count > 0)
        .sort(
          (a, b) =>
            PROFICIENCY_RANK[a.t.proficiency] - PROFICIENCY_RANK[b.t.proficiency] ||
            b.count - a.count ||
            a.index - b.index,
        )
        .slice(0, MAX_CORE_STACK),
    [technologies, usage],
  );

  if (coreStack.length === 0) return null;
  return (
    <section
      aria-labelledby="core-stack-heading"
      className={applyStyle('section-gap', section.style, bodyRules({ spaceTop: 'section-gap' }))}
    >
      <SectionHeading
        id="core-stack-heading"
        title={sectionText(section, 'title')}
        lead={sectionText(section, 'lead')}
        action={
          <Link to="/projects#stack" className={btnQuiet}>
            {sectionText(section, 'buttonLabel')}
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        }
      />
      <ul className="flex flex-wrap gap-2">
        {coreStack.map(({ t, count }) => (
          <li key={t.id}>
            <Link
              to={`/projects?tech=${encodeURIComponent(t.id)}#stack`}
              aria-label={`${t.name}: ${count} project${count === 1 ? '' : 's'}`}
              className={applyStyle(chipClass, t.style, [{ key: 'emphasis', tokens: 'border-line bg-surface/70' }])}
            >
              <TechIcon tech={t} />
              {t.name}
              <span aria-hidden="true" className="font-mono text-xs tabular-nums text-ink-3">
                {count}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function HomeHighlights({ section }: Props) {
  const { projects, technologies, achievements } = useContent();
  const techById = useMemo(() => indexById(technologies), [technologies]);

  const featuredProjects = useMemo(() => {
    const featured = projects.filter((p) => p.featured);
    return (featured.length > 0 ? featured : projects).slice(0, 3);
  }, [projects]);

  const recentAchievements = useMemo(
    () =>
      achievements
        .map((a, index) => ({ a, index }))
        .sort((x, y) => dateSortKey(y.a.date).localeCompare(dateSortKey(x.a.date)) || x.index - y.index)
        .map(({ a }) => a)
        .slice(0, 3),
    [achievements],
  );

  return (
    <div
      className={applyStyle(
        'section-gap grid gap-14 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16',
        section.style,
        bodyRules({ spaceTop: 'section-gap' }),
      )}
    >
      {featuredProjects.length > 0 && (
        <section aria-labelledby="selected-work-heading">
          <SectionHeading
            id="selected-work-heading"
            title={sectionText(section, 'title')}
            action={
              <Link to="/projects" className={btnQuiet}>
                All projects
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            }
          />
          <ul className="divide-y divide-line border-y border-line">
            {featuredProjects.map((p) => {
              const core = p.stack
                .filter((s) => s.level === 'core')
                .map((s) => techById.get(s.techId)?.name)
                .filter(Boolean)
                .slice(0, 3);
              return (
                <li key={p.id}>
                  <Link
                    to={`/projects#project-${p.id}`}
                    className="group grid grid-cols-[6rem_minmax(0,1fr)] items-center gap-4 py-4 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-5"
                  >
                    <MediaImage
                      src={p.image}
                      alt=""
                      fallbackText={p.title}
                      width={288}
                      height={180}
                      className="aspect-[16/10] w-full rounded-control border border-line bg-navy text-lg"
                      imgClassName="object-cover object-top"
                    />
                    <span className="min-w-0">
                      <span
                        className="block font-semibold leading-snug text-ink underline-offset-4 group-hover:underline"
                      >
                        {p.title}
                      </span>
                      <span className="mt-1 line-clamp-2 text-sm text-ink-2">
                        {p.summary}
                      </span>
                      {core.length > 0 && <span className="mt-1.5 block text-xs text-ink-3">{core.join(', ')}</span>}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {recentAchievements.length > 0 && (
        <section aria-labelledby="recent-activity-heading">
          <SectionHeading
            id="recent-activity-heading"
            title={sectionText(section, 'secondaryTitle')}
            action={
              <Link to="/achievements" className={btnQuiet}>
                Achievements
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            }
          />
          <ul className="divide-y divide-line border-y border-line">
            {recentAchievements.map((a) => (
              <li key={a.id}>
                <Link
                  to={`/achievements#${a.id}`}
                  className="group grid grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-4 py-4"
                >
                  <MediaImage
                    src={a.image}
                    alt=""
                    fallbackText={a.title}
                    width={144}
                    height={144}
                    className="aspect-square w-full rounded-control border border-line bg-navy text-base"
                  />
                  <span className="min-w-0">
                    <span
                      className="block font-semibold leading-snug text-ink underline-offset-4 group-hover:underline"
                    >
                      {a.title}
                    </span>
                    <span className="mt-1 block text-sm text-ink-2">
                      {[ACHIEVEMENT_KIND_LABEL[a.kind], a.result].filter(Boolean).join(', ')}
                    </span>
                    <span className="mt-0.5 block font-mono text-xs text-ink-3">{formatDate(a.date)}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

const ctaSectionClass =
  'section-gap rounded-panel border border-line bg-surface/80 px-5 py-8 sm:px-8 sm:py-10 lg:flex lg:items-center lg:justify-between lg:gap-12 lg:px-12';

export function HomeContactCta({ section }: Props) {
  const { profile } = useContent();
  const { contact } = profile;
  const title =
    section.props?.title ??
    (contact.availability.enabled && contact.availability.title ? contact.availability.title : sectionText(section, 'title'));

  return (
    <section
      aria-labelledby="home-contact-heading"
      className={applyStyle(
        ctaSectionClass,
        section.style,
        bodyRules({
          spaceTop: 'section-gap',
          background: 'bg-surface/80',
          padding: 'px-5 py-8 sm:px-8 sm:py-10 lg:px-12',
          radius: 'rounded-panel',
          border: 'border border-line',
        }),
      )}
    >
      <div className="max-w-2xl">
        <h2 id="home-contact-heading" className="text-h2 text-ink">
          {title}
        </h2>
        {contact.intro && (
          <p className="mt-2 text-ink-2">
            {contact.intro}
          </p>
        )}
      </div>
      <Link to="/contact" className={`${btnPrimary} mt-6 shrink-0 lg:mt-0`}>
        {sectionText(section, 'buttonLabel')}
        <ArrowRight size={16} aria-hidden="true" />
      </Link>
    </section>
  );
}
