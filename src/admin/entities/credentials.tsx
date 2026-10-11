import { CheckCircle2, Circle } from 'lucide-react';
import CertificationCard from '../../components/cards/CertificationCard';
import EducationCard from '../../components/cards/EducationCard';
import { CertificationSchema, EducationSchema, LIMITS, MilestoneSchema } from '../../content/schema';
import type { Certification, Education, Milestone } from '../../content/types';
import type { EntityConfig, FormProps } from '../collection/types';
import { ColorField, MonthField, SelectField, TagInput, TextArea, TextField, Toggle, UrlField } from '../fields/Field';
import { FileField, ImageField } from '../fields/MediaField';
import { Badge } from '../ui/primitives';

// ── Certifications ───────────────────────────────────────────
function CertificationForm({ value: c, set, errors }: FormProps<Certification>) {
  return (
    <>
      <TextField label="Certificate name" required value={c.name} onChange={(v) => set('name', v)} error={errors.name} maxLength={LIMITS.title} autoFocus />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Issuer" required value={c.issuer} onChange={(v) => set('issuer', v)} error={errors.issuer} maxLength={LIMITS.title} />
        <TextField label="Credential ID" value={c.credentialId} onChange={(v) => set('credentialId', v)} error={errors.credentialId} />
        <MonthField label="Issued" required value={c.issued} onChange={(v) => set('issued', v ?? '')} error={errors.issued} />
        <MonthField label="Expires" value={c.expires} onChange={(v) => set('expires', v)} error={errors.expires} />
      </div>
      <ImageField label="Certificate image" required value={c.image || undefined} onChange={(v) => set('image', v ?? '')} error={errors.image} maxDim={2400} aspect="wide" />
      <FileField label="Certificate PDF" value={c.pdf} onChange={(v) => set('pdf', v)} error={errors.pdf} hint="Optional. PDF, up to 4 MB." />
      <UrlField label="Credential link" value={c.credentialUrl} onChange={(v) => set('credentialUrl', v)} error={errors.credentialUrl} hint="Verification page (LinkedIn, Credly, issuer site…)." />
      <TextArea label="Description" value={c.description} onChange={(v) => set('description', v)} error={errors.description} maxLength={LIMITS.summary} rows={3} />
      <TagInput label="Skills" value={c.skills} onChange={(v) => set('skills', v)} error={errors.skills} />
      <ColorField label="Accent colour" value={c.accent} onChange={(v) => set('accent', v)} error={errors.accent} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Toggle label="Featured" checked={c.featured} onChange={(v) => set('featured', v)} />
        <Toggle label="Visible on site" checked={c.visible} onChange={(v) => set('visible', v)} />
      </div>
    </>
  );
}

export const certificationConfig: EntityConfig<'certifications'> = {
  key: 'certifications',
  singular: 'certification',
  idPrefix: 'cert',
  schema: CertificationSchema,
  titleField: 'name',
  title: (c) => c.name || 'Untitled certification',
  isFeatured: (c) => c.featured,
  blank: () => ({
    id: '',
    order: 0,
    visible: true,
    name: '',
    issuer: '',
    issued: String(new Date().getFullYear()),
    image: '',
    skills: [],
    featured: false,
  }),
  Preview: ({ item }) => <CertificationCard cert={item} />,
  Form: CertificationForm,
};

// ── Education ────────────────────────────────────────────────
function EducationForm({ value: e, set, errors }: FormProps<Education>) {
  return (
    <>
      <TextField label="Degree" required value={e.degree} onChange={(v) => set('degree', v)} error={errors.degree} maxLength={LIMITS.title} placeholder="B.Sc. (Hons) in Engineering" autoFocus />
      <TextField label="Field of study" value={e.field} onChange={(v) => set('field', v)} error={errors.field} placeholder="Computer Engineering" />
      <TextField label="Institution" required value={e.institution} onChange={(v) => set('institution', v)} error={errors.institution} />
      <div className="grid gap-4 sm:grid-cols-2">
        <MonthField label="Start" required value={e.start} onChange={(v) => set('start', v ?? '')} error={errors.start} />
        <MonthField label="End (or expected)" value={e.end} onChange={(v) => set('end', v)} error={errors.end} />
        <SelectField
          label="Status"
          required
          value={e.status}
          onChange={(v) => set('status', v ?? 'in-progress')}
          options={[
            { value: 'in-progress', label: 'In progress' },
            { value: 'completed', label: 'Completed' },
          ]}
        />
        <TextField label="Grade" value={e.grade} onChange={(v) => set('grade', v)} error={errors.grade} placeholder="GPA 3.6 / First class" />
      </div>
      <ImageField label="Logo" value={e.logo} onChange={(v) => set('logo', v)} error={errors.logo} maxDim={512} aspect="square" />
      <UrlField label="Website" value={e.url} onChange={(v) => set('url', v)} error={errors.url} />
      <TextArea label="Description" value={e.description} onChange={(v) => set('description', v)} error={errors.description} maxLength={LIMITS.summary} rows={3} />
      <Toggle label="Visible on site" checked={e.visible} onChange={(v) => set('visible', v)} />
    </>
  );
}

export const educationConfig: EntityConfig<'education'> = {
  key: 'education',
  singular: 'education entry',
  idPrefix: 'edu',
  schema: EducationSchema,
  titleField: 'degree',
  title: (e) => e.degree || 'Untitled education',
  blank: () => ({
    id: '',
    order: 0,
    visible: true,
    degree: '',
    institution: '',
    start: String(new Date().getFullYear()),
    status: 'in-progress',
  }),
  Preview: ({ item }) => <EducationCard education={item} />,
  Form: EducationForm,
};

// ── Academic pathway milestones ──────────────────────────────
function MilestoneForm({ value: m, set, errors }: FormProps<Milestone>) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-[8rem_1fr]">
        <TextField label="Year" required value={m.year} onChange={(v) => set('year', v)} error={errors.year} placeholder="2024" maxLength={16} autoFocus />
        <TextField label="Milestone" required value={m.label} onChange={(v) => set('label', v)} error={errors.label} placeholder="Entered Computer Engineering" />
      </div>
      <TextField label="Detail" value={m.sub} onChange={(v) => set('sub', v)} error={errors.sub} placeholder="University of Ruhuna" />
      <UrlField label="Link" value={m.url} onChange={(v) => set('url', v)} error={errors.url} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Toggle label="Reached" hint="Off for upcoming milestones." checked={m.done} onChange={(v) => set('done', v)} />
        <Toggle label="Visible on site" checked={m.visible} onChange={(v) => set('visible', v)} />
      </div>
    </>
  );
}

function MilestonePreview({ item }: { item: Milestone }) {
  return (
    <div className="flex h-full items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      {item.done ? (
        <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-[#00abf0]" aria-hidden="true" />
      ) : (
        <Circle size={20} className="mt-0.5 shrink-0 text-[#5f7a93]" aria-hidden="true" />
      )}
      <div className="min-w-0">
        <p className="font-mono text-sm text-[#00abf0]">{item.year || 'Year'}</p>
        <p className="font-semibold text-white">{item.label || 'Milestone'}</p>
        {item.sub && <p className="text-sm text-gray-400">{item.sub}</p>}
        {!item.done && <Badge className="mt-2">Upcoming</Badge>}
      </div>
    </div>
  );
}

export const milestoneConfig: EntityConfig<'academicPathway'> = {
  key: 'academicPathway',
  singular: 'milestone',
  idPrefix: 'ms',
  schema: MilestoneSchema,
  titleField: 'label',
  title: (m) => (m.year ? `${m.year} – ${m.label}` : m.label) || 'Untitled milestone',
  blank: () => ({ id: '', order: 0, visible: true, year: String(new Date().getFullYear()), label: '', done: true }),
  Preview: MilestonePreview,
  Form: MilestoneForm,
};
