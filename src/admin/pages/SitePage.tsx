import { LIMITS, SiteSettingsSchema } from '../../content/schema';
import type { SiteSettings } from '../../content/types';
import { CollectionSection } from '../collection/CollectionSection';
import { projectCategoryConfig } from '../entities/taxonomy';
import { TextArea, TextField } from '../fields/Field';
import { FileField, ImageField } from '../fields/MediaField';
import { setSite } from '../lib/reducers';
import { useDoc } from '../state/AdminContentContext';
import { PageHeader, Panel } from '../ui/primitives';
import { SaveBar, useSingletonDraft } from './singleton';

export function SitePage() {
  const doc = useDoc();
  const { draft: s, set, errors, dirty, saving, save, discard } = useSingletonDraft<SiteSettings>(
    doc.site,
    SiteSettingsSchema,
    (v) => setSite(() => v),
    'Site settings published',
    'site.',
  );

  return (
    <>
      <PageHeader title="Site settings" description="Résumé, search and sharing details, footer and project categories." />
      <div className="space-y-6">
        <Panel title="Résumé (CV)" description="The Résumé button in the navigation and hero downloads this PDF.">
          <div className="space-y-4">
            <FileField
              label="CV PDF"
              value={s.cv?.url}
              onChange={(url) =>
                set('cv', url ? { url, fileName: s.cv?.fileName || 'CV.pdf', updatedAt: new Date().toISOString() } : null)
              }
              onUploaded={(url, name) => set('cv', { url, fileName: name || 'CV.pdf', updatedAt: new Date().toISOString() })}
              error={errors['cv.url'] ?? errors.cv}
            />
            {s.cv && (
              <TextField
                label="Download file name"
                required
                value={s.cv.fileName}
                onChange={(v) => set('cv', s.cv ? { ...s.cv, fileName: v } : null)}
                error={errors['cv.fileName']}
                hint="The name visitors see when they save the file."
              />
            )}
          </div>
        </Panel>

        <Panel title="Search and sharing">
          <div className="space-y-4">
            <TextField label="Page title" required value={s.title} onChange={(v) => set('title', v)} error={errors.title} maxLength={LIMITS.title} />
            <TextArea label="Description" required value={s.description} onChange={(v) => set('description', v)} error={errors.description} maxLength={LIMITS.summary} rows={3} hint="Shown by search engines and link previews." />
            <ImageField label="Sharing image" value={s.ogImage} onChange={(v) => set('ogImage', v)} error={errors.ogImage} maxDim={1200} aspect="wide" hint="1200 × 630 works best for link previews." />
          </div>
        </Panel>

        <Panel title="Brand and footer">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Logo text" required value={s.brand.primary} onChange={(v) => set('brand', { ...s.brand, primary: v })} error={errors['brand.primary']} maxLength={LIMITS.short} />
            <TextField label="Logo accent" value={s.brand.suffix} onChange={(v) => set('brand', { ...s.brand, suffix: v })} error={errors['brand.suffix']} maxLength={LIMITS.short} hint="Shown in the accent colour after the logo text." />
            <TextField label="Footer text" value={s.footerText} onChange={(v) => set('footerText', v)} error={errors.footerText} maxLength={LIMITS.title} className="sm:col-span-2" />
          </div>
        </Panel>
      </div>
      <SaveBar dirty={dirty} saving={saving} onSave={() => void save()} onDiscard={discard} errorCount={Object.keys(errors).length} />

      <div className="mt-12">
        <CollectionSection
          config={projectCategoryConfig}
          addLabel="Add category"
          gridClassName="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
          heading={
            <div>
              <h2 className="text-lg font-semibold text-white">Project categories</h2>
              <p className="text-sm text-[#8ea6bd]">Filters on the Projects page. Deleting one removes it from every project. These save immediately.</p>
            </div>
          }
        />
      </div>
    </>
  );
}
