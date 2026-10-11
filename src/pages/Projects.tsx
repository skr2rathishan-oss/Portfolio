import { useMemo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useSearchParams } from 'react-router-dom';
import { useContent } from '../content/ContentProvider';
import { indexById, stackTechnologies, techUsageCount } from '../content/selectors';
import type { Project } from '../content/types';
import ProjectCard from '../components/cards/ProjectCard';
import TechChip from '../components/cards/TechChip';
import { cx } from '../components/cards/shared';
import PageHeader from '../components/layout/PageHeader';
import { usePageMeta } from '../components/layout/usePageMeta';

const pillClass =
  'inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-medium whitespace-nowrap transition-colors duration-150 pointer-fine:min-h-9';

function plural(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`;
}

export default function Projects() {
  const { projects, technologies, techCategories, projectCategories, profile } = useContent();
  const [params, setParams] = useSearchParams();

  usePageMeta({
    title: 'Projects',
    siteName: profile.fullName,
    description: `Projects by ${profile.fullName}: AI agents, full-stack apps and the tools behind them.`,
  });

  const techById = useMemo(() => indexById(technologies), [technologies]);
  const usage = useMemo(() => techUsageCount(projects), [projects]);

  const stack = useMemo(() => stackTechnologies(technologies), [technologies]);
  const groups = useMemo(
    () =>
      techCategories
        .map((cat) => ({ cat, techs: stack.filter((t) => t.categoryId === cat.id && t.proficiency !== 'exploring') }))
        .filter((g) => g.techs.length > 0),
    [techCategories, stack],
  );
  const exploring = useMemo(() => stack.filter((t) => t.proficiency === 'exploring'), [stack]);

  const categories = useMemo(
    () =>
      projectCategories
        .map((c) => ({ c, count: projects.filter((p) => p.categoryIds.includes(c.id)).length }))
        .filter((x) => x.count > 0),
    [projectCategories, projects],
  );

  const rawTech = params.get('tech');
  const rawCategory = params.get('category');
  const activeTech = rawTech ? techById.get(rawTech) ?? null : null;
  const activeCategory = rawCategory ? categories.find((x) => x.c.id === rawCategory)?.c ?? null : null;

  const filtered = useMemo(
    () =>
      projects.filter(
        (p) =>
          (!activeTech || p.stack.some((s) => s.techId === activeTech.id)) &&
          (!activeCategory || p.categoryIds.includes(activeCategory.id)),
      ),
    [projects, activeTech, activeCategory],
  );
  const featured = filtered.filter((p) => p.featured);
  const rest = filtered.filter((p) => !p.featured);

  const update = (key: 'tech' | 'category', value: string | null) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { preventScrollReset: true });
  };
  const clear = () => setParams(new URLSearchParams(), { preventScrollReset: true });
  const filtering = !!(activeTech || activeCategory);

  let status = `Showing all ${plural(filtered.length, 'project', 'projects')}`;
  if (filtering) {
    status = `Showing ${plural(filtered.length, 'project', 'projects')}`;
    if (activeTech) status += ` using ${activeTech.name}`;
    if (activeCategory) status += ` in ${activeCategory.label}`;
  }

  const renderCard = (p: Project, variant: 'featured' | 'grid', index: number) => (
    <motion.li
      key={p.id}
      id={`project-${p.id}`}
      layout="position"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="min-w-0"
    >
      <ProjectCard
        project={p}
        techById={techById}
        variant={variant}
        priority={index < 2}
        reverse={variant === 'featured' && index % 2 === 1}
      />
    </motion.li>
  );

  return (
    <div className="page-container">
      <PageHeader title="Projects" lead="Things I've built, and the tools behind them." />

      <section id="stack" aria-labelledby="stack-heading" className="mt-10 border-y border-line py-8 sm:mt-12">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
          <div>
            <h2 id="stack-heading" className="text-h2 text-ink">
              Tech stack
            </h2>
            <p className="mt-2 text-[0.9375rem] text-ink-2">
              Pick a technology to see the projects that use it. The number is how many projects use it.
            </p>
          </div>
        </div>

        <div className="space-y-5 md:space-y-3">
          {groups.map(({ cat, techs }) => (
            <div
              key={cat.id}
              role="group"
              aria-labelledby={`tcat-${cat.id}`}
              className="md:grid md:grid-cols-[11rem_minmax(0,1fr)] md:items-start md:gap-6 lg:grid-cols-[13rem_minmax(0,1fr)]"
            >
              <h3 id={`tcat-${cat.id}`} className="mb-2 text-sm font-medium text-ink-2 md:mb-0 md:pt-2.5">
                {cat.title}
              </h3>
              <ul className="scroll-row -mx-4 px-4 sm:-mx-8 sm:px-8 md:mx-0 md:flex-wrap md:overflow-visible md:px-0 md:[mask-image:none]">
                {techs.map((t) => {
                  const count = usage.get(t.id) ?? 0;
                  return (
                    <li key={t.id} className="shrink-0">
                      <TechChip
                        tech={t}
                        count={count > 0 ? count : undefined}
                        active={activeTech?.id === t.id}
                        onClick={count > 0 ? (tech) => update('tech', activeTech?.id === tech.id ? null : tech.id) : undefined}
                      />
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {exploring.length > 0 && (
          <p className="mt-6 text-sm text-ink-2">
            <span className="text-ink">Exploring now:</span> {exploring.map((t) => t.name).join(', ')}.
          </p>
        )}
      </section>

      <section aria-labelledby="project-list-heading" className="mt-10">
        <h2 id="project-list-heading" className="sr-only">
          Project list
        </h2>

        {categories.length > 1 && (
          <div role="group" aria-label="Filter by category" className="scroll-row -mx-4 px-4 sm:-mx-8 sm:px-8 md:mx-0 md:flex-wrap md:overflow-visible md:px-0 md:[mask-image:none]">
            <button
              type="button"
              aria-pressed={!activeCategory}
              onClick={() => update('category', null)}
              className={cx(
                pillClass,
                !activeCategory ? 'border-accent bg-accent-wash text-ink' : 'border-line text-ink-2 hover:border-white/25 hover:text-ink',
              )}
            >
              All
              <span aria-hidden="true" className="font-mono text-xs text-ink-3">
                {projects.length}
              </span>
            </button>
            {categories.map(({ c, count }) => {
              const active = activeCategory?.id === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={active}
                  aria-label={`${c.label}, ${plural(count, 'project', 'projects')}`}
                  onClick={() => update('category', active ? null : c.id)}
                  className={cx(
                    pillClass,
                    active ? 'border-accent bg-accent-wash text-ink' : 'border-line text-ink-2 hover:border-white/25 hover:text-ink',
                  )}
                >
                  {c.label}
                  <span aria-hidden="true" className={cx('font-mono text-xs', active ? 'text-accent' : 'text-ink-3')}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-5 flex min-h-11 flex-wrap items-center gap-x-3 text-sm text-ink-2">
          <p role="status" aria-live="polite">
            {status}
          </p>
          {filtering && (
            <button
              type="button"
              onClick={clear}
              className="inline-flex min-h-11 items-center px-1 font-semibold text-accent underline-offset-4 hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="mt-6 rounded-card border border-dashed border-line-strong/40 px-6 py-12 text-center">
            <p className="text-lg font-semibold text-ink">No projects match these filters yet.</p>
            <p className="mt-2 text-ink-2">Try another technology, or show every project.</p>
            <button
              type="button"
              onClick={clear}
              className="mt-5 inline-flex min-h-11 items-center rounded-full border border-line-strong px-5 text-sm font-semibold text-ink hover:border-ink"
            >
              Show all projects
            </button>
          </div>
        ) : (
          <>
            {featured.length > 0 && (
              <ul className="mt-6 grid gap-6" aria-label="Featured projects">
                <AnimatePresence initial={false} mode="popLayout">
                  {featured.map((p, i) => renderCard(p, 'featured', i))}
                </AnimatePresence>
              </ul>
            )}
            {rest.length > 0 && (
              <ul
                className={cx('grid gap-6 md:grid-cols-2 xl:grid-cols-3', featured.length > 0 ? 'mt-10' : 'mt-6')}
                aria-label={featured.length > 0 ? 'More projects' : 'Projects'}
              >
                <AnimatePresence initial={false} mode="popLayout">
                  {rest.map((p, i) => renderCard(p, 'grid', featured.length + i))}
                </AnimatePresence>
              </ul>
            )}
          </>
        )}
      </section>
    </div>
  );
}
