import { CollectionSection } from '../collection/CollectionSection';
import { certificationConfig } from '../entities/credentials';
import { PageHeader } from '../ui/primitives';

export function CertificationsPage() {
  return (
    <>
      <PageHeader
        title="Certifications"
        description="Certificates shown on the About page. Upload the certificate image (and optionally the PDF) and link the verification page."
      />
      <CollectionSection config={certificationConfig} addLabel="Add certification" />
    </>
  );
}
