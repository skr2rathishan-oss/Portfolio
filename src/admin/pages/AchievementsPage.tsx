import { useState } from 'react';
import { CollectionSection } from '../collection/CollectionSection';
import { achievementConfig, programConfig, roleConfig } from '../entities/activities';
import { useDoc } from '../state/AdminContentContext';
import { PageHeader, TabPanel, Tabs } from '../ui/primitives';

type Tab = 'achievements' | 'roles' | 'programs';

export function AchievementsPage() {
  const doc = useDoc();
  const [tab, setTab] = useState<Tab>('achievements');
  return (
    <>
      <PageHeader
        title="Achievements & Activities"
        description="Hackathons and competitions, leadership and community roles, and programs. Images and logos are shown prominently on each card."
      />
      <Tabs<Tab>
        label="Achievements & Activities sections"
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'achievements', label: 'Hackathons & Competitions', count: doc.achievements.length },
          { id: 'roles', label: 'Leadership & Community', count: doc.roles.length },
          { id: 'programs', label: 'Programs', count: doc.programs.length },
        ]}
      />
      <TabPanel id={tab}>
        {tab === 'achievements' && (
          <CollectionSection config={achievementConfig} gridClassName="grid gap-5" addLabel="Add achievement" emptyTitle="No hackathons or competitions yet" />
        )}
        {tab === 'roles' && <CollectionSection config={roleConfig} gridClassName="grid gap-5" addLabel="Add role" emptyTitle="No roles yet" />}
        {tab === 'programs' && (
          <CollectionSection
            config={programConfig}
            gridClassName="grid gap-5 lg:grid-cols-2"
            addLabel="Add program"
            emptyTitle="No programs yet"
            emptyBody="Bootcamps, fellowships and courses. The Programs section is hidden on the site while it is empty."
          />
        )}
      </TabPanel>
    </>
  );
}
