import { ArrowRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useContent } from '../content/ContentProvider';
import PageHeader from '../components/layout/PageHeader';
import { usePageMeta } from '../components/layout/usePageMeta';
import { btnPrimary, btnSecondary } from '../components/ui/styles';

export default function NotFound() {
  const { profile } = useContent();
  const { pathname } = useLocation();
  usePageMeta({ title: 'Page not found', siteName: profile.fullName, noindex: true });

  return (
    <div className="page-container pb-8">
      <PageHeader
        title="Page not found"
        lead={
          <>
            There's no page at <code className="break-all font-mono text-[0.9em] text-ink">{pathname}</code>. It may have
            moved, or the link has a typo.
          </>
        }
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/projects" className={btnPrimary}>
            See projects
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <Link to="/" className={btnSecondary}>
            Go to the home page
          </Link>
          <Link to="/contact" className={btnSecondary}>
            Contact
          </Link>
        </div>
      </PageHeader>
    </div>
  );
}
