import ProjectCard from '../../components/cards/ProjectCard';
import { ProjectSchema, LIMITS } from '../../content/schema';
import { indexById } from '../../content/selectors';
import type { Project } from '../../content/types';
import type { EntityConfig, FormProps } from '../collection/types';
import { CheckboxGroup, ListEditor, MonthField, TextArea, TextField, Toggle, UrlField } from '../fields/Field';
import { ImageField } from '../fields/MediaField';
import { TechPicker } from '../fields/TechPicker';
import { Badge } from '../ui/primitives';

function ProjectForm({ value: p, set, errors, doc, extras }: FormProps<Project>) {
  const categories = [...doc.projectCategories].sort((a, b) => a.order - b.order);
  const technologies = [...doc.technologies].sort((a, b) => a.name.localeCompare(b.name));
  return (
    <>
      <TextField label="Title" required value={p.title} onChange={(v) => set('title', v)} error={errors.title} maxLength={LIMITS.title} autoFocus />
      <TextArea label="Description" required value={p.summary} onChange={(v) => set('summary', v)} error={errors.summary} maxLength={LIMITS.summary} rows={4} hint="One or two sentences: what it does and how it is built." />
      <ImageField
        label="Image"
        required
        value={p.image || undefined}
        onChange={(v) => set('image', v ?? '')}
        error={errors.image}
        maxDim={1920}
        alt={{ value: p.imageAlt, onChange: (v) => set('imageAlt', v), error: errors.imageAlt }}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <UrlField label="GitHub / source link" value={p.sourceUrl} onChange={(v) => set('sourceUrl', v)} error={errors.sourceUrl} placeholder="https://github.com/…" />
        <UrlField label="Demo link" value={p.demoUrl} onChange={(v) => set('demoUrl', v)} error={errors.demoUrl} />
        <TextField label="Demo button label" value={p.demoLabel} onChange={(v) => set('demoLabel', v)} error={errors.demoLabel} placeholder="Live demo" maxLength={LIMITS.short} hint="e.g. “Video demo” for a recording." />
        <MonthField label="Date" value={p.date} onChange={(v) => set('date', v)} error={errors.date} />
      </div>
      <TechPicker
        label="Tech stack"
        value={p.stack}
        onChange={(v) => set('stack', v)}
        technologies={technologies}
        onCreate={extras.createTechnology}
        error={errors.stack ?? Object.entries(errors).find(([k]) => k.startsWith('stack.'))?.[1]}
      />
      {categories.length > 0 && (
        <CheckboxGroup
          label="Categories"
          options={categories.map((c) => ({ value: c.id, label: c.label, muted: !c.visible }))}
          value={p.categoryIds}
          onChange={(v) => set('categoryIds', v)}
          error={errors.categoryIds}
          hint="Used by the category filter on the Projects page."
        />
      )}
      <ListEditor label="Highlights" value={p.highlights ?? []} onChange={(v) => set('highlights', v)} itemLabel="Highlight" error={errors.highlights ?? Object.entries(errors).find(([k]) => k.startsWith('highlights.'))?.[1]} hint="Optional short bullet points." />
      <div className="grid gap-3 sm:grid-cols-2">
        <Toggle label="Featured" hint="Shown first and on the home page." checked={p.featured} onChange={(v) => set('featured', v)} />
        <Toggle label="Visible on site" checked={p.visible} onChange={(v) => set('visible', v)} />
      </div>
    </>
  );
}

export const projectConfig: EntityConfig<'projects'> = {
  key: 'projects',
  singular: 'project',
  idPrefix: 'prj',
  schema: ProjectSchema,
  titleField: 'title',
  title: (p) => p.title || 'Untitled project',
  isFeatured: (p) => p.featured,
  dialogSize: 'lg',
  blank: () => ({
    id: '',
    order: 0,
    visible: true,
    title: '',
    summary: '',
    image: '',
    imageAlt: '',
    stack: [],
    categoryIds: [],
    sourceUrl: '',
    demoUrl: '',
    demoLabel: '',
    highlights: [],
    featured: false,
  }),
  Preview: ({ item, doc }) => <ProjectCard project={item} techById={indexById(doc.technologies)} />,
  Form: ProjectForm,
  badges: (p) => (!p.image ? <Badge tone="danger">No image</Badge> : null),
};
