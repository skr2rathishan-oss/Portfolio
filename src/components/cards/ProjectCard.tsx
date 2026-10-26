import { Eye, Github, PlayCircle } from 'lucide-react';
import type { ID, Project, ProjectPriority, Technology } from '../../content/types';
import { applyStyle, cardRules } from '../sections/sectionStyle';
import { cx, linkProps, MediaImage, NewTabHint } from './shared';

export interface ProjectCardProps {
  project: Project;
  techById: Map<ID, Technology>;
  /** Load the cover eagerly (first visible cards). */
  priority?: boolean;
  className?: string;
}

const LEVEL_ORDER = { core: 0, supporting: 1, exposure: 2 } as const;
const MAX_CHIPS = 6;

const PRIORITY_LABEL: Record<ProjectPriority, string> = { high: 'High', medium: 'Medium', low: 'Low' };
const PRIORITY_DOT: Record<ProjectPriority, string> = {
  high: 'bg-amber-400',
  medium: 'bg-sky-400',
  low: 'bg-ink-3',
};

const buttonBase =
  'inline-flex min-h-11 flex-1 basis-0 items-center justify-center gap-2 rounded-control px-4 text-sm font-semibold transition-colors duration-150 active:translate-y-px';

export default function ProjectCard({ project, techById, priority = false, className }: ProjectCardProps) {
  const stack = [...project.stack]
    .sort((a, b) => LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level])
    .flatMap((s) => {
      const tech = techById.get(s.techId);
      return tech ? [{ ...s, tech }] : [];
    });
  const shownStack = stack.slice(0, MAX_CHIPS);
  const hiddenCount = stack.length - shownStack.length;
  const isVideo = !!project.demoUrl && (/video/i.test(project.demoLabel ?? '') || /drive\.google|youtu|loom|vimeo/i.test(project.demoUrl));
  const demoLabel = project.demoLabel?.trim() || (isVideo ? 'Watch Demo' : 'Visit Site');
  const level: ProjectPriority = project.priority ?? (project.featured ? 'high' : 'medium');
  const { style } = project;

  return (
    <article
      className={cx(
        applyStyle(
          'group relative flex h-full w-full flex-col rounded-[1.75rem] border border-line bg-surface/80 p-5 backdrop-blur-sm transition-[border-color,box-shadow] duration-200 hover:border-accent/40 hover:shadow-[0_0_32px_rgb(0_171_240/0.12)]',
          style,
          cardRules({ background: 'bg-surface/80', border: 'border border-line', radius: 'rounded-[1.75rem]' }),
        ),
        className,
      )}
    >
      <div className="relative">
        <MediaImage
          src={project.image}
          alt={project.imageAlt ?? `Screenshot of ${project.title}`}
          fallbackText={project.title}
          loading={priority ? 'eager' : 'lazy'}
          width={1200}
          height={750}
          className={applyStyle('relative w-full aspect-[2/1] rounded-2xl bg-navy text-3xl', style, [
            { key: 'imageAspect', tokens: 'aspect-[2/1]' },
          ])}
          imgClassName={applyStyle(
            'object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]',
            style,
            [
              { key: 'imageFit', tokens: 'object-cover' },
              { key: 'imagePosition', tokens: 'object-top' },
            ],
          )}
        />
        <span className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-canvas/85 px-3 py-1 font-mono text-xs font-semibold uppercase tracking-wider text-ink backdrop-blur">
          <span aria-hidden="true" className={cx('h-1.5 w-1.5 rounded-full', PRIORITY_DOT[level])} />
          <span className="sr-only">Priority: </span>
          {PRIORITY_LABEL[level]}
        </span>
      </div>

      <h3
        title={project.title}
        className={applyStyle('mt-5 truncate text-h3 font-bold text-ink', style, [
          { key: 'titleSize', tokens: 'text-h3' },
          { key: 'titleColor', tokens: 'text-ink' },
        ])}
      >
        {project.title}
      </h3>

      <p className="mt-2 line-clamp-3 text-[0.9375rem] leading-relaxed text-ink-2">{project.summary}</p>

      {shownStack.length > 0 && (
        <ul aria-label="Tech stack" className="mt-4 flex flex-wrap gap-2">
          {shownStack.map(({ techId, level: stackLevel, tech }) => (
            <li
              key={techId}
              className={cx(
                'rounded-control border px-2.5 py-1 text-xs font-medium',
                stackLevel === 'core' ? 'border-accent/40 bg-accent-wash text-accent' : 'border-line bg-white/[0.03] text-ink-2',
              )}
            >
              {tech.name}
              {stackLevel === 'core' && <span className="sr-only"> (core)</span>}
            </li>
          ))}
          {hiddenCount > 0 && (
            <li className="rounded-control border border-line px-2.5 py-1 text-xs font-medium text-ink-3">
              +{hiddenCount}
              <span className="sr-only"> more</span>
            </li>
          )}
        </ul>
      )}

      {(project.demoUrl || project.sourceUrl) && (
        <div className="mt-auto pt-5">
          <div className="flex gap-3 border-t border-line pt-4">
            {project.demoUrl && (
              <a
                {...linkProps(project.demoUrl)}
                className={cx(buttonBase, 'bg-accent text-on-accent hover:bg-accent-hover')}
              >
                {isVideo ? <PlayCircle size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
                <span>{demoLabel}</span>
                <span className="sr-only">: {project.title}</span>
                <NewTabHint url={project.demoUrl} />
              </a>
            )}
            {project.sourceUrl && (
              <a
                {...linkProps(project.sourceUrl)}
                className={cx(buttonBase, 'border border-line-strong bg-canvas/40 text-ink hover:border-accent/50 hover:text-accent')}
              >
                <Github size={16} aria-hidden="true" />
                <span>Source Code</span>
                <span className="sr-only">: {project.title}</span>
                <NewTabHint url={project.sourceUrl} />
              </a>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
