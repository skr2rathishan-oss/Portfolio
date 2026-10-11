import { CollectionSection } from '../collection/CollectionSection';
import { socialConfig } from '../entities/taxonomy';
import { PageHeader } from '../ui/primitives';

export function SocialsPage() {
  return (
    <>
      <PageHeader
        title="Social links"
        description="Choose which links appear as icons in the hero and which appear on the contact page."
      />
      <CollectionSection config={socialConfig} addLabel="Add link" gridClassName="grid gap-3 lg:grid-cols-2" />
    </>
  );
}
