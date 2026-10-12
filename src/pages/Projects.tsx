import { useContent } from '../content/ContentProvider';
import PageSections from '../components/sections/PageSections';
import { usePageMeta } from '../components/layout/usePageMeta';

export default function Projects() {
  const { profile } = useContent();

  usePageMeta({
    title: 'Projects',
    siteName: profile.fullName,
    description: `Projects by ${profile.fullName}: AI agents, full-stack apps and the tools behind them.`,
  });

  return (
    <div className="page-container">
      <PageSections page="projects" />
    </div>
  );
}
