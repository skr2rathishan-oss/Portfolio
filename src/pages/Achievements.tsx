import { useState } from 'react';
import { useContent } from '../content/ContentProvider';
import PageSections from '../components/sections/PageSections';
import { usePageMeta } from '../components/layout/usePageMeta';
import Lightbox, { PreviewContext, type PreviewMedia } from '../components/ui/Lightbox';

export default function Achievements() {
  const { profile } = useContent();
  const [preview, setPreview] = useState<PreviewMedia | null>(null);

  usePageMeta({
    title: 'Achievements & Activities',
    siteName: profile.fullName,
    description: `Hackathons, competitions, community roles and programs ${profile.fullName} has taken part in.`,
  });

  return (
    <div className="page-container">
      <PreviewContext.Provider value={setPreview}>
        <PageSections page="achievements" />
      </PreviewContext.Provider>

      <Lightbox media={preview} onClose={() => setPreview(null)} />
    </div>
  );
}
