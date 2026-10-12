// Compact panels for profile (hero / about / contact) and site settings targets, built with the
// same field components as the list editors. Each group is one local draft committed as a patch.
import { ArrowDown, ArrowUp, Plus, X } from 'lucide-react';
import type { ReactNode } from 'react';
import type { z } from 'zod';
import { ICON_NAMES } from '../../../content/icons';
import { LIMITS, ProfileSchema, SiteSettingsSchema } from '../../../content/schema';
import type { Content, IconName } from '../../../content/types';
import { inputClass, TagInput, TextArea, TextField, Toggle, UrlField } from '../../fields/Field';
import { FileField, ImageField } from '../../fields/MediaField';
import { newId } from '../../lib/ids';
import { setProfile, setSite } from '../../lib/reducers';
import { issuesToErrors } from '../../lib/validate';
import { cx, focusRing, IconButton } from '../../ui/primitives';
import { useEditor } from '../state/EditorContext';
import { changedKeys, useDraft, type Validation } from './useDraft';

type Group = 'hero' | 'about' | 'contact';
type Obj = Record<string, unknown>;

function schemaValidate<T>(schema: z.ZodType): (v: T) => Validation<T> {
  return (v) => {
    const r = schema.safeParse(v);
    return r.success ? { ok: true, data: r.data as T } : { ok: false, errors: issuesToErrors(r.error.issues) };
  };
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="space-y-4 border-t border-[#1b3550] pt-4 first:border-t-0 first:pt-0">
      <legend className="sr-only">{title}</legend>
      <p aria-hidden="true" className="text-[12px] font-semibold text-[#8ea6bd]">
        {title}
      </p>
      {children}
    </fieldset>
  );
}

/** Small repeatable rows (facts, goals, stats). */
function Rows<R extends { id: string }>({
  label,
  name,
  rows,
  onChange,
  columns,
  make,
  max = LIMITS.list,
  errors,
  errorKey,
}: {
  label: string;
  name: string;
  rows: R[];
  onChange: (rows: R[]) => void;
  columns: { key: keyof R & string; label: string; width?: string; options?: readonly string[] }[];
  make: () => R;
  max?: number;
  errors: Record<string, string>;
  errorKey: string;
}) {
  const move = (i: number, d: -1 | 1) => {
    const next = rows.slice();
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
  };
  const error = Object.entries(errors).find(([k]) => k === errorKey || k.startsWith(`${errorKey}.`))?.[1];
  return (
    <fieldset data-field={name} className="min-w-0">
      <legend className="mb-1.5 text-[13px] font-medium text-[#cfdbe6]">{label}</legend>
      <ul className="space-y-2">
        {rows.map((row, i) => (
          <li key={row.id} className="rounded-lg border border-[#1b3550] bg-[#0a1a2b]/60 p-2">
            <div className="flex gap-1.5">
              {columns.map((c) =>
                c.options ? (
                  <select
                    key={c.key}
                    aria-label={`${c.label} ${i + 1}`}
                    value={String(row[c.key] ?? '')}
                    onChange={(e) => onChange(rows.map((r, j) => (j === i ? { ...r, [c.key]: e.target.value } : r)))}
                    className={cx(inputClass, 'appearance-auto px-2', c.width)}
                  >
                    {c.options.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    key={c.key}
                    aria-label={`${c.label} ${i + 1}`}
                    placeholder={c.label}
                    value={String(row[c.key] ?? '')}
                    onChange={(e) => onChange(rows.map((r, j) => (j === i ? { ...r, [c.key]: e.target.value } : r)))}
                    className={cx(inputClass, 'px-2', c.width)}
                  />
                ),
              )}
            </div>
            <div className="mt-1 flex justify-end gap-0.5">
              <IconButton label={`Move ${label.toLowerCase()} ${i + 1} up`} disabled={i === 0} onClick={() => move(i, -1)}>
                <ArrowUp size={14} aria-hidden="true" />
              </IconButton>
              <IconButton label={`Move ${label.toLowerCase()} ${i + 1} down`} disabled={i === rows.length - 1} onClick={() => move(i, 1)}>
                <ArrowDown size={14} aria-hidden="true" />
              </IconButton>
              <IconButton label={`Remove ${label.toLowerCase()} ${i + 1}`} tone="danger" onClick={() => onChange(rows.filter((_, j) => j !== i))}>
                <X size={14} aria-hidden="true" />
              </IconButton>
            </div>
          </li>
        ))}
      </ul>
      {rows.length < max && (
        <button
          type="button"
          onClick={() => onChange([...rows, make()])}
          className={cx('mt-2 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-[#5ccdf7] hover:bg-[#00abf0]/10', focusRing)}
        >
          <Plus size={15} aria-hidden="true" /> Add
        </button>
      )}
      {error && (
        <p className="mt-1.5 text-xs font-medium text-[#ff8a8a]" role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
}

function useGroupDraft<T extends Obj>(id: string, source: T, schema: z.ZodType, write: (patch: Partial<T>) => (doc: Content) => Content) {
  const { apply } = useEditor();
  return useDraft<T>({
    id,
    source,
    validate: schemaValidate<T>(schema),
    commit: (data, base) => apply(write(changedKeys(base, data)), { coalesceKey: id, quiet: true }),
  });
}

export function ProfilePanel({ path }: { path: string }) {
  const group = (path.split('.')[0] as Group) || 'hero';
  if (group === 'about') return <AboutPanel />;
  if (group === 'contact') return <ContactPanel />;
  return <HeroPanel />;
}

function HeroPanel() {
  const { doc } = useEditor();
  const d = useGroupDraft('panel:profile:hero', doc.profile.hero as unknown as Obj, ProfileSchema.shape.hero, (patch) =>
    setProfile((p) => ({ ...p, hero: { ...p.hero, ...patch } })),
  );
  const h = d.draft as unknown as Content['profile']['hero'];
  const e = d.errors;
  const set = d.set as (k: string, v: unknown) => void;
  return (
    <form noValidate onSubmit={(ev) => ev.preventDefault()} onBlur={d.onBlur} className="space-y-5">
      <Group title="Text">
        <TextField name="roleBadge" label="Role badge" value={h.roleBadge} onChange={(v) => set('roleBadge', v)} error={e.roleBadge} maxLength={LIMITS.short} />
        <TextField name="headline" label="Headline" required value={h.headline} onChange={(v) => set('headline', v)} error={e.headline} maxLength={LIMITS.title} />
        <TextField name="headlineAccent" label="Headline accent" value={h.headlineAccent} onChange={(v) => set('headlineAccent', v)} error={e.headlineAccent} maxLength={LIMITS.title} hint="Shown in the accent colour after the headline." />
        <TextArea name="intro" label="Intro" value={h.intro} onChange={(v) => set('intro', v)} error={e.intro} maxLength={LIMITS.summary} rows={3} />
        <TagInput name="focusAreas" label="Focus areas" value={h.focusAreas} onChange={(v) => set('focusAreas', v)} max={8} error={e.focusAreas ?? Object.entries(e).find(([k]) => k.startsWith('focusAreas.'))?.[1]} />
      </Group>
      <Group title="Profile picture">
        <ImageField
          name="image"
          label="Profile picture"
          required
          value={h.image || undefined}
          onChange={(v) => set('image', v ?? '')}
          error={e.image}
          maxDim={1600}
          aspect="portrait"
          alt={{ value: h.imageAlt, onChange: (v) => set('imageAlt', v), required: true, error: e.imageAlt }}
        />
      </Group>
      <Group title="Buttons">
        <div data-field="primaryCta" className="grid gap-3">
          <TextField label="Primary button label" required value={h.primaryCta.label} onChange={(v) => set('primaryCta', { ...h.primaryCta, label: v })} error={e['primaryCta.label']} maxLength={LIMITS.short} />
          <UrlField label="Primary button link" required value={h.primaryCta.to} onChange={(v) => set('primaryCta', { ...h.primaryCta, to: v })} error={e['primaryCta.to']} />
        </div>
        <div data-field="secondaryCta" className="grid gap-3">
          <TextField label="Secondary button label" required value={h.secondaryCta.label} onChange={(v) => set('secondaryCta', { ...h.secondaryCta, label: v })} error={e['secondaryCta.label']} maxLength={LIMITS.short} />
          <UrlField label="Secondary button link" required value={h.secondaryCta.to} onChange={(v) => set('secondaryCta', { ...h.secondaryCta, to: v })} error={e['secondaryCta.to']} />
        </div>
      </Group>
    </form>
  );
}

function AboutPanel() {
  const { doc } = useEditor();
  const d = useGroupDraft('panel:profile:about', doc.profile.about as unknown as Obj, ProfileSchema.shape.about, (patch) =>
    setProfile((p) => ({ ...p, about: { ...p.about, ...patch } })),
  );
  const a = d.draft as unknown as Content['profile']['about'];
  const e = d.errors;
  const set = d.set as (k: string, v: unknown) => void;
  return (
    <form noValidate onSubmit={(ev) => ev.preventDefault()} onBlur={d.onBlur} className="space-y-5">
      <Group title="Intro">
        <TextField name="displayName" label="Display name" required value={a.displayName} onChange={(v) => set('displayName', v)} error={e.displayName} maxLength={LIMITS.title} />
        <TextField name="tagline" label="Tagline" value={a.tagline} onChange={(v) => set('tagline', v)} error={e.tagline} maxLength={LIMITS.title} />
        <TextArea name="bio" label="Bio" value={a.bio} onChange={(v) => set('bio', v)} error={e.bio} maxLength={LIMITS.bio} rows={8} hint="A blank line starts a new paragraph." />
        <ImageField name="image" label="Photo" required value={a.image || undefined} onChange={(v) => set('image', v ?? '')} error={e.image} maxDim={1600} aspect="portrait" />
        <TagInput name="interests" label="Interests" value={a.interests} onChange={(v) => set('interests', v)} error={e.interests} />
      </Group>
      <Group title="Quick facts">
        <Rows
          label="Fact"
          name="facts"
          rows={a.facts}
          errors={e}
          errorKey="facts"
          onChange={(v) => set('facts', v)}
          make={() => ({ id: newId('fact', 'fact'), icon: 'MapPin' as IconName, label: 'Label', value: 'Value' })}
          columns={[
            { key: 'icon', label: 'Icon', width: 'w-28 shrink-0', options: ICON_NAMES },
            { key: 'label', label: 'Label', width: 'w-24 shrink-0' },
            { key: 'value', label: 'Value', width: 'min-w-0 flex-1' },
          ]}
        />
      </Group>
      <Group title="Goals">
        <Rows
          label="Goal"
          name="goals"
          rows={a.goals}
          errors={e}
          errorKey="goals"
          onChange={(v) => set('goals', v)}
          make={() => ({ id: newId('goal', 'goal'), emoji: '', title: 'New goal', description: '' })}
          columns={[
            { key: 'emoji', label: 'Emoji', width: 'w-14 shrink-0' },
            { key: 'title', label: 'Title', width: 'min-w-0 flex-1' },
            { key: 'description', label: 'Description', width: 'min-w-0 flex-1' },
          ]}
        />
      </Group>
      <Group title="In numbers">
        <Rows
          label="Stat"
          name="stats"
          rows={a.stats}
          errors={e}
          errorKey="stats"
          onChange={(v) => set('stats', v)}
          make={() => ({ id: newId('stat', 'stat'), emoji: '', value: '1', label: 'Label' })}
          columns={[
            { key: 'emoji', label: 'Emoji', width: 'w-14 shrink-0' },
            { key: 'value', label: 'Value', width: 'w-20 shrink-0' },
            { key: 'label', label: 'Label', width: 'min-w-0 flex-1' },
          ]}
        />
      </Group>
    </form>
  );
}

function ContactPanel() {
  const { doc } = useEditor();
  const d = useGroupDraft('panel:profile:contact', doc.profile.contact as unknown as Obj, ProfileSchema.shape.contact, (patch) =>
    setProfile((p) => ({ ...p, contact: { ...p.contact, ...patch } })),
  );
  const c = d.draft as unknown as Content['profile']['contact'];
  const e = d.errors;
  const set = d.set as (k: string, v: unknown) => void;
  return (
    <form noValidate onSubmit={(ev) => ev.preventDefault()} onBlur={d.onBlur} className="space-y-5">
      <Group title="Header">
        <TextField name="eyebrow" label="Eyebrow" value={c.eyebrow} onChange={(v) => set('eyebrow', v)} error={e.eyebrow} maxLength={LIMITS.short} />
        <TextField name="heading" label="Heading" required value={c.heading} onChange={(v) => set('heading', v)} error={e.heading} maxLength={LIMITS.title} />
        <TextField name="headingAccent" label="Heading accent" value={c.headingAccent} onChange={(v) => set('headingAccent', v)} error={e.headingAccent} maxLength={LIMITS.title} />
        <TextArea name="intro" label="Intro" value={c.intro} onChange={(v) => set('intro', v)} error={e.intro} maxLength={LIMITS.summary} rows={3} />
      </Group>
      <Group title="Details">
        <TextField name="email" label="Email" type="email" value={c.email} onChange={(v) => set('email', v)} error={e.email} />
        <TextField name="location" label="Location" value={c.location} onChange={(v) => set('location', v)} error={e.location} />
        <TextField name="timezone" label="Time zone" value={c.timezone} onChange={(v) => set('timezone', v)} error={e.timezone} maxLength={LIMITS.short} />
      </Group>
      <Group title="Availability">
        <div data-field="availability" className="space-y-3">
          <Toggle label="Show availability" checked={c.availability.enabled} onChange={(v) => set('availability', { ...c.availability, enabled: v })} />
          <TextField label="Title" value={c.availability.title} onChange={(v) => set('availability', { ...c.availability, title: v })} error={e['availability.title']} maxLength={LIMITS.title} />
          <TextField label="Subtitle" value={c.availability.subtitle} onChange={(v) => set('availability', { ...c.availability, subtitle: v })} error={e['availability.subtitle']} maxLength={LIMITS.title} />
        </div>
      </Group>
    </form>
  );
}

export function SitePanel() {
  const { doc } = useEditor();
  const d = useGroupDraft('panel:site', doc.site as unknown as Obj, SiteSettingsSchema, (patch) => setSite((s) => ({ ...s, ...patch })));
  const s = d.draft as unknown as Content['site'];
  const e = d.errors;
  const set = d.set as (k: string, v: unknown) => void;
  return (
    <form noValidate onSubmit={(ev) => ev.preventDefault()} onBlur={d.onBlur} className="space-y-5">
      <Group title="Header">
        <div data-field="brand" className="grid gap-3">
          <TextField label="Site name" required value={s.brand.primary} onChange={(v) => set('brand', { ...s.brand, primary: v })} error={e['brand.primary']} maxLength={LIMITS.short} />
          <TextField label="Name suffix" value={s.brand.suffix} onChange={(v) => set('brand', { ...s.brand, suffix: v })} error={e['brand.suffix']} maxLength={LIMITS.short} />
        </div>
        <div data-field="cv" className="space-y-3">
          <FileField
            label="CV (PDF)"
            value={s.cv?.url}
            onChange={(url) => set('cv', url ? { url, fileName: s.cv?.fileName || 'CV.pdf', updatedAt: new Date().toISOString() } : null)}
            onUploaded={(url, name) => set('cv', { url, fileName: name || 'CV.pdf', updatedAt: new Date().toISOString() })}
            error={e['cv.url'] ?? e.cv}
          />
          {s.cv && (
            <TextField label="Download file name" value={s.cv.fileName} onChange={(v) => set('cv', s.cv ? { ...s.cv, fileName: v } : null)} error={e['cv.fileName']} />
          )}
        </div>
      </Group>
      <Group title="Footer and search">
        <TextField name="footerText" label="Footer text" value={s.footerText} onChange={(v) => set('footerText', v)} error={e.footerText} maxLength={LIMITS.title} />
        <TextField name="title" label="Browser title" required value={s.title} onChange={(v) => set('title', v)} error={e.title} maxLength={LIMITS.title} />
        <TextArea name="description" label="Search description" required value={s.description} onChange={(v) => set('description', v)} error={e.description} maxLength={LIMITS.summary} rows={3} />
      </Group>
    </form>
  );
}

