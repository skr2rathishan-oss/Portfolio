import { useContent } from '../content/ContentProvider';
import PageSections from '../components/sections/PageSections';
import { usePageMeta } from '../components/layout/usePageMeta';

export default function Contact() {
  const { profile } = useContent();
  const { contact } = profile;

  usePageMeta({
    title: 'Contact',
    siteName: profile.fullName,
    description: contact.intro || `Get in touch with ${profile.fullName}.`,
  });

  return (
    <div className="page-container">
      <PageSections page="contact" />
    </div>
  );
}
