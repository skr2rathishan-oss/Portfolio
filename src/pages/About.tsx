import { useState } from 'react';
import { ExternalLink, FileText } from 'lucide-react';
import { useContent } from '../content/ContentProvider';
import type { Certification } from '../content/types';
import { verifyLabel } from '../components/cards/CertificationCard';
import { linkProps, NewTabHint } from '../components/cards/shared';
import { usePageMeta } from '../components/layout/usePageMeta';
import PageSections from '../components/sections/PageSections';
import { CertificationPreviewContext } from '../components/sections/builtin/about';
import Lightbox from '../components/ui/Lightbox';
import { formatDate } from '../content/selectors';

export default function About() {
  const { profile } = useContent();
  const [preview, setPreview] = useState<Certification | null>(null);

  usePageMeta({
    title: 'About',
    siteName: profile.fullName,
    description: `About ${profile.fullName}: education, background and certifications.`,
  });

  return (
    <div className="page-container">
      <CertificationPreviewContext.Provider value={setPreview}>
        <PageSections page="about" />
      </CertificationPreviewContext.Provider>

      <Lightbox
        media={
          preview
            ? {
                src: preview.image,
                alt: `${preview.name} certificate`,
                title: preview.name,
                caption: [preview.issuer, formatDate(preview.issued)].filter(Boolean).join(', '),
              }
            : null
        }
        onClose={() => setPreview(null)}
        actions={
          preview && (preview.credentialUrl || preview.pdf) ? (
            <>
              {preview.credentialUrl && (
                <a
                  {...linkProps(preview.credentialUrl)}
                  className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-accent underline-offset-4 hover:underline"
                >
                  {verifyLabel(preview.credentialUrl)}
                  <ExternalLink size={14} aria-hidden="true" />
                  <NewTabHint url={preview.credentialUrl} />
                </a>
              )}
              {preview.pdf && (
                <a
                  {...linkProps(preview.pdf)}
                  className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-ink-2 underline-offset-4 hover:text-ink hover:underline"
                >
                  <FileText size={14} aria-hidden="true" />
                  Open PDF
                  <NewTabHint url={preview.pdf} />
                </a>
              )}
            </>
          ) : undefined
        }
      />
    </div>
  );
}
