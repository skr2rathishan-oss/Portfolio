import { useState } from 'react';
import { getIcon } from '../../content/icons';
import { sortByOrder } from '../../content/selectors';
import { CollectionSection } from '../collection/CollectionSection';
import { techCategoryConfig, technologyConfig } from '../entities/taxonomy';
import { useDoc } from '../state/AdminContentContext';
import { Badge, PageHeader, TabPanel, Tabs } from '../ui/primitives';

type Tab = 'tech' | 'categories';

export function TechnologiesPage() {
  const doc = useDoc();
  const [tab, setTab] = useState<Tab>('tech');
  const categories = sortByOrder(doc.techCategories);
  const catIds = new Set(categories.map((c) => c.id));
  const orphans = doc.technologies.filter((t) => !catIds.has(t.categoryId));

  return (
    <>
      <PageHeader
        title="Technologies"
        description="The tech stack band on the Projects page. Technologies are grouped by category; project cards list them by name."
      />
      <Tabs<Tab>
        label="Technology sections"
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'tech', label: 'Technologies', count: doc.technologies.length },
          { id: 'categories', label: 'Categories', count: doc.techCategories.length },
        ]}
      />
      <TabPanel id={tab}>
        {tab === 'tech' ? (
          <div className="space-y-12">
            {categories.map((cat) => {
              const Icon = getIcon(cat.icon);
              return (
                <CollectionSection
                  key={cat.id}
                  config={technologyConfig}
                  filter={(t) => t.categoryId === cat.id}
                  prefill={{ categoryId: cat.id }}
                  addLabel="Add technology"
                  emptyTitle={`No technologies in ${cat.title}`}
                  emptyBody="Add one, or move technologies here by editing them."
                  gridClassName="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  heading={
                    <div className="flex items-center gap-2.5">
                      <Icon size={18} className="text-[#00abf0]" aria-hidden="true" />
                      <h2 className="text-lg font-semibold text-white">{cat.title}</h2>
                      {!cat.visible && <Badge tone="warn">Hidden category</Badge>}
                    </div>
                  }
                />
              );
            })}
            {orphans.length > 0 && (
              <CollectionSection
                config={technologyConfig}
                filter={(t) => !catIds.has(t.categoryId)}
                addLabel="Add technology"
                gridClassName="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                heading={<h2 className="text-lg font-semibold text-[#ff8a8a]">Without a valid category</h2>}
              />
            )}
          </div>
        ) : (
          <CollectionSection
            config={techCategoryConfig}
            addLabel="Add category"
            gridClassName="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
            heading={<p className="text-sm text-[#8ea6bd]">Hidden categories keep their technologies usable as project tags without showing them in the stack.</p>}
          />
        )}
      </TabPanel>
    </>
  );
}
