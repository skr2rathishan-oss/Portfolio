import { useMemo } from 'react';
import { useContent } from '../content/ContentProvider';
import { resolvePage } from '../content/layout';
import { ProjectsList } from '../components/sections/builtin/projects';
import { usePageMeta } from '../components/layout/usePageMeta';

export default function Projects() {
  const { profile, layout } = useContent();
  const sections = useMemo(() => resolvePage({ layout }, 'projects').filter((s) => s.visible !== false), [layout]);
  const list = sections.find((s) => s.type === 'projects.list');

  usePageMeta({
    title: 'Projects',
    siteName: profile.fullName,
    description: `Projects by ${profile.fullName}: AI agents, full-stack apps and the tools behind them.`,
  });

  return (
    <div className="page-container pt-10 sm:pt-14">
      <h1 className="sr-only">Projects</h1>
      {list?.type === 'projects.list' && <ProjectsList section={list} />}
    </div>
  );
}
