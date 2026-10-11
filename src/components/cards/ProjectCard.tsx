import { ExternalLink, Github, PlayCircle } from 'lucide-react';
import type { ID, Project, Technology } from '../../content/types';
import { cx, linkProps, MediaImage } from './shared';

export interface ProjectCardProps {
  project: Project;
  techById: Map<ID, Technology>;
  variant?: 'grid' | 'carousel';
  className?: string;
}

const LEVEL_ORDER = { core: 0, supporting: 1, exposure: 2 } as const;

export default function ProjectCard({ project, techById, variant = 'grid', className }: ProjectCardProps) {
  const stack = [...project.stack]
    .sort((a, b) => LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level])
    .flatMap((s) => {
      const tech = techById.get(s.techId);
      return tech ? [{ ...s, tech }] : [];
    });
  const isVideo = !!project.demoLabel && /video/i.test(project.demoLabel);

  return (
    <article
      className={cx(
        'group relative rounded-2xl md:rounded-3xl bg-[#061424] border border-white/[0.08] hover:border-[#00abf0]/40 p-4 pb-5 flex flex-col transition-colors duration-300',
        variant === 'carousel' ? 'w-[84vw] max-w-[340px] flex-shrink-0 snap-center' : 'w-full h-full',
        className,
      )}
    >
      <MediaImage
        src={project.image}
        alt={project.imageAlt ?? `Screenshot of ${project.title}`}
        fallbackText={project.title}
        className="relative w-full h-44 rounded-xl md:rounded-2xl mb-4 bg-black/40 border border-white/5 text-3xl"
        imgClassName="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
      />

      <h3 className="text-lg md:text-xl font-bold text-white mb-2 group-hover:text-[#00abf0] transition-colors duration-200">
        {project.title}
      </h3>

      <p className="text-xs md:text-sm text-gray-400 leading-relaxed mb-4 line-clamp-3">{project.summary}</p>

      {project.highlights && project.highlights.length > 0 && (
        <ul className="list-disc pl-4 mb-4 text-xs text-gray-400 space-y-1">
          {project.highlights.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
      )}

      {stack.length > 0 && (
        <ul aria-label="Tech stack" className="flex flex-wrap gap-1.5 mb-4">
          {stack.map(({ techId, level, tech }) => (
            <li
              key={techId}
              className={cx(
                'text-[10px] md:text-[11px] px-2.5 py-1 rounded-lg font-medium',
                level === 'core'
                  ? 'bg-[#00abf0]/15 text-[#00abf0] border border-[#00abf0]/30'
                  : 'bg-white/[0.04] text-gray-400 border border-white/[0.06]',
              )}
            >
              {tech.name}
            </li>
          ))}
        </ul>
      )}

      {(project.demoUrl || project.sourceUrl) && (
        <div className="flex items-center gap-2 pt-3 border-t border-white/5 mt-auto">
          {project.demoUrl && (
            <a
              {...linkProps(project.demoUrl)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold bg-[#00abf0] text-[#081b29] hover:bg-[#00abf0]/90 transition-colors"
            >
              {isVideo ? <PlayCircle size={14} aria-hidden="true" /> : <ExternalLink size={14} aria-hidden="true" />}
              <span>{project.demoLabel || 'Live demo'}</span>
              <span className="sr-only"> for {project.title}</span>
            </a>
          )}
          {project.sourceUrl && (
            <a
              {...linkProps(project.sourceUrl)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold bg-white/[0.05] border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
            >
              <Github size={14} aria-hidden="true" />
              <span>Source code</span>
              <span className="sr-only"> for {project.title}</span>
            </a>
          )}
        </div>
      )}
    </article>
  );
}
