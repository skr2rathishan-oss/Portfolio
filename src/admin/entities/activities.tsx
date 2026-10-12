import AchievementCard, { ACHIEVEMENT_KIND_LABEL } from '../../components/cards/AchievementCard';
import ProgramCard, { PROGRAM_KIND_LABEL } from '../../components/cards/ProgramCard';
import RoleCard, { ROLE_KIND_LABEL } from '../../components/cards/RoleCard';
import { AchievementSchema, LIMITS, ProgramSchema, RoleSchema } from '../../content/schema';
import type { Achievement, AchievementKind, Program, ProgramKind, Role, RoleKind } from '../../content/types';
import type { EntityConfig, FormProps } from '../collection/types';
import { ColorField, ListEditor, MonthField, SelectField, TagInput, TextArea, TextField, Toggle, UrlField } from '../fields/Field';
import { ImageField } from '../fields/MediaField';
import { Badge } from '../ui/primitives';

const options = <T extends string>(labels: Record<T, string>) =>
  (Object.keys(labels) as T[]).map((value) => ({ value, label: labels[value] }));

const listError = (errors: Record<string, string>, key: string) =>
  errors[key] ?? Object.entries(errors).find(([k]) => k.startsWith(`${key}.`))?.[1];

// ── Achievements (hackathons & competitions) ─────────────────
function AchievementForm({ embedded, value: a, set, errors }: FormProps<Achievement>) {
  const link = a.link ?? { url: '' };
  const setLink = (patch: Partial<{ url: string; label?: string }>) => {
    const next = { ...link, ...patch };
    set('link', !next.url && !next.label ? undefined : { url: next.url, ...(next.label ? { label: next.label } : {}) });
  };
  return (
    <>
      <TextField name="title" label="Title" required value={a.title} onChange={(v) => set('title', v)} error={errors.title} maxLength={LIMITS.title} placeholder="CodeBlast 2025 Hackathon" autoFocus={!embedded} />
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField name="kind" label="Type" required value={a.kind} onChange={(v) => set('kind', (v ?? 'hackathon') as AchievementKind)} options={options(ACHIEVEMENT_KIND_LABEL)} />
        <MonthField name="date" label="Date" required value={a.date} onChange={(v) => set('date', v ?? '')} error={errors.date} />
        <TextField name="organizer" label="Organizer" required value={a.organizer} onChange={(v) => set('organizer', v)} error={errors.organizer} className="sm:col-span-2" />
        <TextField name="result" label="Result" value={a.result} onChange={(v) => set('result', v)} error={errors.result} placeholder="Participant, Finalist, 2nd place…" maxLength={LIMITS.short} hint="Be precise: “Participant” for participation." />
        <TextField name="team" label="Team name" value={a.team} onChange={(v) => set('team', v)} error={errors.team} maxLength={LIMITS.short} />
      </div>
      <ImageField name="image" label="Image" value={a.image} onChange={(v) => set('image', v)} error={errors.image} maxDim={1920} aspect="square" hint="Photo, banner or certificate. Shown prominently on the card." />
      <TextArea name="description" label="Description" value={a.description} onChange={(v) => set('description', v)} error={errors.description} maxLength={LIMITS.summary} rows={3} />
      <TagInput name="skills" label="Skills" value={a.skills} onChange={(v) => set('skills', v)} error={listError(errors, 'skills')} />
      <div className="grid gap-4 sm:grid-cols-2">
        <UrlField label="Link" value={link.url} onChange={(v) => setLink({ url: v })} error={errors['link.url'] ?? errors.link} hint="Post, certificate or results page." />
        <TextField label="Link label" value={link.label} onChange={(v) => setLink({ label: v })} error={errors['link.label']} placeholder="View on LinkedIn" maxLength={LIMITS.short} />
      </div>
      <ColorField name="accent" label="Accent colour" value={a.accent} onChange={(v) => set('accent', v)} error={errors.accent} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Toggle name="featured" label="Featured" checked={a.featured} onChange={(v) => set('featured', v)} />
        <Toggle name="visible" label="Visible on site" checked={a.visible} onChange={(v) => set('visible', v)} />
      </div>
    </>
  );
}

export const achievementConfig: EntityConfig<'achievements'> = {
  key: 'achievements',
  singular: 'achievement',
  idPrefix: 'ach',
  schema: AchievementSchema,
  titleField: 'title',
  title: (a) => a.title || 'Untitled achievement',
  isFeatured: (a) => a.featured,
  blank: () => ({
    id: '',
    order: 0,
    visible: true,
    title: '',
    kind: 'hackathon',
    organizer: '',
    date: String(new Date().getFullYear()),
    skills: [],
    featured: false,
  }),
  Preview: ({ item }) => <AchievementCard item={item} />,
  Form: AchievementForm,
  badges: (a) => (!a.image ? <Badge tone="warn">No image</Badge> : null),
};

// ── Roles (leadership & community) ───────────────────────────
function RoleForm({ embedded, value: r, set, errors }: FormProps<Role>) {
  return (
    <>
      <TextField name="title" label="Role title" required value={r.title} onChange={(v) => set('title', v)} error={errors.title} maxLength={LIMITS.title} placeholder="Student member, Lead organiser…" autoFocus={!embedded} />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField name="organization" label="Organization" required value={r.organization} onChange={(v) => set('organization', v)} error={errors.organization} />
        <TextField name="parentOrg" label="Parent organization" value={r.parentOrg} onChange={(v) => set('parentOrg', v)} error={errors.parentOrg} placeholder="University of Ruhuna" />
        <SelectField name="kind" label="Type" required value={r.kind} onChange={(v) => set('kind', (v ?? 'community') as RoleKind)} options={options(ROLE_KIND_LABEL)} />
        <TextField name="location" label="Location" value={r.location} onChange={(v) => set('location', v)} error={errors.location} />
        <MonthField name="start" label="Start" value={r.start} onChange={(v) => set('start', v)} error={errors.start} />
        <MonthField name="end" label="End" allowPresent value={r.end} onChange={(v) => set('end', v)} error={errors.end} />
      </div>
      <ImageField name="logo" label="Logo" value={r.logo} onChange={(v) => set('logo', v)} error={errors.logo} maxDim={1024} aspect="square" hint="Organization logo. Square images work best." />
      <ImageField name="image" label="Image" value={r.image} onChange={(v) => set('image', v)} error={errors.image} maxDim={1920} aspect="video" hint="Optional photo or banner, shown prominently on the card." />
      <TextArea name="description" label="Description" value={r.description} onChange={(v) => set('description', v)} error={errors.description} maxLength={LIMITS.summary} rows={3} />
      <ListEditor name="highlights" label="Highlights" value={r.highlights ?? []} onChange={(v) => set('highlights', v)} itemLabel="Highlight" error={listError(errors, 'highlights')} />
      <UrlField name="url" label="Website" value={r.url} onChange={(v) => set('url', v)} error={errors.url} />
      <ColorField name="accent" label="Accent colour" value={r.accent} onChange={(v) => set('accent', v)} error={errors.accent} />
      <Toggle name="visible" label="Visible on site" checked={r.visible} onChange={(v) => set('visible', v)} />
    </>
  );
}

export const roleConfig: EntityConfig<'roles'> = {
  key: 'roles',
  singular: 'role',
  idPrefix: 'role',
  schema: RoleSchema,
  titleField: 'title',
  title: (r) => (r.organization ? `${r.title} – ${r.organization}` : r.title) || 'Untitled role',
  blank: () => ({ id: '', order: 0, visible: true, title: '', organization: '', kind: 'community' }),
  Preview: ({ item }) => <RoleCard role={item} />,
  Form: RoleForm,
  badges: (r) => (!r.logo && !r.image ? <Badge tone="warn">No image</Badge> : null),
};

// ── Programs ─────────────────────────────────────────────────
function ProgramForm({ embedded, value: p, set, errors, doc }: FormProps<Program>) {
  const certs = [...doc.certifications].sort((a, b) => a.order - b.order);
  return (
    <>
      <TextField name="title" label="Program name" required value={p.title} onChange={(v) => set('title', v)} error={errors.title} maxLength={LIMITS.title} autoFocus={!embedded} />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField name="organizer" label="Organizer" required value={p.organizer} onChange={(v) => set('organizer', v)} error={errors.organizer} />
        <SelectField name="kind" label="Type" required value={p.kind} onChange={(v) => set('kind', (v ?? 'bootcamp') as ProgramKind)} options={options(PROGRAM_KIND_LABEL)} />
        <MonthField name="start" label="Start" required value={p.start} onChange={(v) => set('start', v ?? '')} error={errors.start} />
        <MonthField name="end" label="End" value={p.end} onChange={(v) => set('end', v)} error={errors.end} />
        <SelectField name="mode"
          label="Format"
          value={p.mode}
          placeholder="Not specified"
          onChange={(v) => set('mode', v)}
          options={[
            { value: 'online', label: 'Online' },
            { value: 'in-person', label: 'In person' },
            { value: 'hybrid', label: 'Hybrid' },
          ]}
        />
        <SelectField name="certificationId"
          label="Linked certification"
          value={p.certificationId}
          placeholder="None"
          onChange={(v) => set('certificationId', v)}
          options={certs.map((c) => ({ value: c.id, label: c.name }))}
          error={errors.certificationId}
        />
      </div>
      <ImageField name="logo" label="Logo" value={p.logo} onChange={(v) => set('logo', v)} error={errors.logo} maxDim={1024} aspect="square" />
      <TextArea name="description" label="Description" value={p.description} onChange={(v) => set('description', v)} error={errors.description} maxLength={LIMITS.summary} rows={3} />
      <TagInput name="skills" label="Skills" value={p.skills} onChange={(v) => set('skills', v)} error={listError(errors, 'skills')} />
      <UrlField name="url" label="Website" value={p.url} onChange={(v) => set('url', v)} error={errors.url} />
      <Toggle name="visible" label="Visible on site" checked={p.visible} onChange={(v) => set('visible', v)} />
    </>
  );
}

export const programConfig: EntityConfig<'programs'> = {
  key: 'programs',
  singular: 'program',
  idPrefix: 'prog',
  schema: ProgramSchema,
  titleField: 'title',
  title: (p) => p.title || 'Untitled program',
  blank: () => ({
    id: '',
    order: 0,
    visible: true,
    title: '',
    organizer: '',
    kind: 'bootcamp',
    start: String(new Date().getFullYear()),
    skills: [],
  }),
  Preview: ({ item, doc }) => (
    <ProgramCard program={item} certification={doc.certifications.find((c) => c.id === item.certificationId)} />
  ),
  Form: ProgramForm,
};
