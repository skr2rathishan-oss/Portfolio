import { CollectionSection } from '../collection/CollectionSection';
import { educationConfig, milestoneConfig } from '../entities/credentials';
import { PageHeader } from '../ui/primitives';

export function EducationPage() {
  return (
    <>
      <PageHeader title="Education" description="Degrees and the academic pathway timeline on the About page." />
      <div className="space-y-12">
        <CollectionSection
          config={educationConfig}
          addLabel="Add education"
          gridClassName="grid gap-5"
          heading={<h2 className="text-lg font-semibold text-white">Degrees</h2>}
        />
        <CollectionSection
          config={milestoneConfig}
          addLabel="Add milestone"
          gridClassName="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
          heading={
            <div>
              <h2 className="text-lg font-semibold text-white">Academic pathway</h2>
              <p className="text-sm text-[#8ea6bd]">Shown as a timeline, in this order.</p>
            </div>
          }
        />
      </div>
    </>
  );
}
