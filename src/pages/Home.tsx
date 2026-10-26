import { useContent } from '../content/ContentProvider';
import PageSections from '../components/sections/PageSections';
import { usePageMeta } from '../components/layout/usePageMeta';

export default function Home() {
  const { site } = useContent();

  usePageMeta({ title: site.title, description: site.description, exact: true });

  return (
    <div className="page-container">
      <PageSections page="home" />
    </div>
  );
}
