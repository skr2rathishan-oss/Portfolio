import { ExternalLink, Github, PlayCircle } from 'lucide-react';
import type { ID, Project, Technology } from '../../content/types';
import { formatDate } from '../../content/selectors';
import { cx, linkProps, MediaImage, NewTabHint } from './shared';

export interface ProjectCardProps {
  project: Project;
  techById: Map<ID, Technology>;
  /** 'featured' is a wide split card used for highlighted work; 'carousel' is kept for compatibility. */
  variant?: 'grid' | 'carousel' | 'featured';
  /** Load the cover eagerly (first visible cards). */
  priority?: boolean;
  /** Featured variant only: put the image on the right at wide sizes. */
  reverse?: boolean;
  className?: string;
}

const LEVEL_ORDER = { core: 0, supporting: 1, exposure: 2 } as const;
const MAX_CHIPS = 5;

export default function ProjectCard({
  project,
  techById,
  variant = 'grid',
  priority = false,
  reverse = false,
  className,
}: ProjectCardProps) {
  const featured = variant === 'featured';
  const stack = [...project.stack]
    .sort((a, b) => LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level])
    .flatMap((s) => {
      const tech = techById.get(s.techId);
      return tech ? [{ ...s, tech }] : [];
    });
  const shownStack = featured ? stack : stack.slice(0, MAX_CHIPS);
  const hiddenCount = stack.length - shownStack.length;
  const isVideo = !!project.demoUrl && (/video/i.test(project.demoLabel ?? '') || /drive\.google|youtu|loom|vimeo/i.test(project.demoUrl));
  const demoLabel = project.demoLabel?.trim() || (isVideo ? 'Watch demo' : 'Live demo');
  const date = formatDate(project.date);

  return (
    <article
      className={cx(
        'group relative flex flex-col rounded-card bg-surface border border-line overflow-hidden transition-colors duration-150 hover:border-white/20',
        featured && 'md:grid md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:items-stretch',
        variant === 'carousel' ? 'w-[84vw] max-w-[340px] flex-shrink-0 snap-center' : 'w-full h-full',
        className,
      )}
    >
      <MediaImage
        src={project.image}
        alt={project.imageAlt ?? `Screenshot of ${project.title}`}
        fallbackText={project.title}
        loading={priority ? 'eager' : 'lazy'}
        width={1200}
        height={750}
        className={cx(
          'relative w-full aspect-[16/10] bg-navy text-3xl border-b border-line',
          featured && 'md:aspect-auto md:h-full md:min-h-[18rem] md:border-b-0',
          featured && (reverse ? 'md:order-2 md:border-l' : 'md:border-r'),
        )}
        imgClassName="object-cover object-top"
      />

      <div className={cx('flex flex-1 flex-col p-5', featured && 'md:p-7 lg:p-8')}>
        {(featured || date) && (
          <p className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-3">
            {featured && <span className="font-semibold text-accent">Featured</span>}
            {date && (
              <time dateTime={project.date} className="font-mono">
                {date}
              </time>
            )}
          </p>
        )}

        <h3 className={cx('text-h3 text-ink text-pretty', featured && 'md:text-h2')}>{project.title}</h3>

        <p className={cx('mt-2 text-[0.9375rem] leading-relaxed text-ink-2', !featured && 'line-clamp-4')}>
          {project.summary}
        </p>

        {project.highlights && project.highlights.length > 0 && (
          <ul className="mt-3 space-y-1.5 text-sm text-ink-2">
            {project.highlights.map((h) => (
              <li key={h} className="flex gap-2">
                <span aria-hidden="true" className="mt-[0.6em] h-1 w-1 flex-shrink-0 rounded-full bg-accent" />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        )}

        {shownStack.length > 0 && (
          <ul aria-label="Tech stack" className="mt-4 flex flex-wrap gap-1.5">
            {shownStack.map(({ techId, level, tech }) => (
              <li
                key={techId}
                className={cx(
                  'rounded-chip border px-2 py-0.5 text-xs font-medium',
                  level === 'core' ? 'border-accent/35 text-ink bg-accent-wash' : 'border-line text-ink-2',
                )}
              >
                {tech.name}
                {level === 'core' && <span className="sr-only"> (core)</span>}
              </li>
            ))}
            {hiddenCount > 0 && (
              <li className="rounded-chip border border-line px-2 py-0.5 text-xs font-medium text-ink-3">
                +{hiddenCount}
                <span className="sr-only"> more</span>
              </li>
            )}
          </ul>
        )}

        {(project.demoUrl || project.sourceUrl) && (
          <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-5">
            {project.demoUrl && (
              <a
                {...linkProps(project.demoUrl)}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-accent px-4 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-hover active:translate-y-px"
              >
                {isVideo ? <PlayCircle size={16} aria-hidden="true" /> : <ExternalLink size={16} aria-hidden="true" />}
                <span>{demoLabel}</span>
                <span className="sr-only">: {project.title}</span>
                <NewTabHint url={project.demoUrl} />
              </a>
            )}
            {project.sourceUrl && (
              <a
                {...linkProps(project.sourceUrl)}
                className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-ink-2 underline-offset-4 transition-colors hover:text-ink hover:underline"
              >
                <Github size={16} aria-hidden="true" />
                <span>Source code</span>
                <span className="sr-only">: {project.title}</span>
                <NewTabHint url={project.sourceUrl} />
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
