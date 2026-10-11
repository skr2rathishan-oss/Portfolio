import { CollectionSection } from '../collection/CollectionSection';
import { projectConfig } from '../entities/projects';
import { PageHeader } from '../ui/primitives';

export function ProjectsPage() {
  return (
    <>
      <PageHeader
        title="Projects"
        description="These are the cards from your Projects page. Click a card to edit it, drag to reorder, or use the toolbar to hide, duplicate or delete."
      />
      <CollectionSection config={projectConfig} addLabel="Add project" emptyBody="Add your first project to show it on the Projects page." />
    </>
  );
}
