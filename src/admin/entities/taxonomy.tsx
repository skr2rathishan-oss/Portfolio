import TechChip from '../../components/cards/TechChip';
import { getIcon, SOCIAL_ICONS } from '../../content/icons';
import {
  LIMITS,
  ProjectCategorySchema,
  SocialLinkSchema,
  TechCategorySchema,
  TechnologySchema,
} from '../../content/schema';
import { techUsageCount } from '../../content/selectors';
import type { Proficiency, ProjectCategory, SocialLink, SocialPlatform, TechCategory, Technology } from '../../content/types';
import type { EntityConfig, FormProps } from '../collection/types';
import { ColorField, IconSelect, ListEditor, SelectField, TextArea, TextField, Toggle, UrlField } from '../fields/Field';
import { Badge } from '../ui/primitives';

export const PROFICIENCY_LABEL: Record<Proficiency, string> = {
  core: 'Core (daily driver)',
  proficient: 'Proficient',
  familiar: 'Familiar',
  exploring: 'Exploring',
};

// ── Technologies ─────────────────────────────────────────────
function TechnologyForm({ value: t, set, errors, doc }: FormProps<Technology>) {
  const cats = [...doc.techCategories].sort((a, b) => a.order - b.order);
  return (
    <>
      <TextField label="Name" required value={t.name} onChange={(v) => set('name', v)} error={errors.name} maxLength={LIMITS.short} autoFocus />
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          label="Category"
          required
          value={t.categoryId || undefined}
          placeholder="Choose a category"
          onChange={(v) => set('categoryId', v ?? '')}
          options={cats.map((c) => ({ value: c.id, label: c.visible ? c.title : `${c.title} (hidden)` }))}
          error={errors.categoryId}
        />
        <SelectField
          label="Proficiency"
          required
          value={t.proficiency}
          onChange={(v) => set('proficiency', (v ?? 'familiar') as Proficiency)}
          options={(Object.keys(PROFICIENCY_LABEL) as Proficiency[]).map((p) => ({ value: p, label: PROFICIENCY_LABEL[p] }))}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <UrlField
          label="Icon URL"
          media
          value={t.icon}
          onChange={(v) => set('icon', v)}
          error={errors.icon}
          hint="Use the matching devicon (cdn.jsdelivr.net/gh/devicons/…). Leave empty to show initials."
        />
        {t.icon && (
          <span className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg border border-[#27496b] bg-[#081b29]">
            <img src={t.icon} alt="" className="h-6 w-6 object-contain" />
          </span>
        )}
      </div>
      <ColorField label="Brand colour" value={t.color} onChange={(v) => set('color', v)} error={errors.color} />
      <TextArea label="Summary" value={t.summary} onChange={(v) => set('summary', v)} error={errors.summary} maxLength={LIMITS.summary} rows={2} hint="How you use it, in one sentence." />
      <ListEditor label="How I use it" value={t.highlights ?? []} onChange={(v) => set('highlights', v)} itemLabel="Point" />
      <div className="grid gap-3 sm:grid-cols-2">
        <Toggle label="Show in tech stack" hint="Off for concept tags used only on projects." checked={t.showInStack} onChange={(v) => set('showInStack', v)} />
        <Toggle label="Featured" hint="Quick pills on the home page." checked={t.featured} onChange={(v) => set('featured', v)} />
        <Toggle label="Visible on site" checked={t.visible} onChange={(v) => set('visible', v)} />
      </div>
    </>
  );
}

function TechnologyPreview({ item, doc }: { item: Technology; doc: { projects: Parameters<typeof techUsageCount>[0] } }) {
  const count = techUsageCount(doc.projects).get(item.id) ?? 0;
  return (
    <div className="flex h-full flex-col gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-3 pt-12">
      <TechChip tech={{ ...item, name: item.name || 'Technology' }} count={count || undefined} />
      <p className="text-xs text-gray-400">
        {PROFICIENCY_LABEL[item.proficiency]}
        {count > 0 ? `, used in ${count} project${count === 1 ? '' : 's'}` : ''}
      </p>
    </div>
  );
}

export const technologyConfig: EntityConfig<'technologies'> = {
  key: 'technologies',
  singular: 'technology',
  idPrefix: 'tec',
  schema: TechnologySchema,
  titleField: 'name',
  title: (t) => t.name || 'Untitled technology',
  isFeatured: (t) => t.featured,
  blank: (doc) => ({
    id: '',
    order: 0,
    visible: true,
    name: '',
    categoryId: [...doc.techCategories].sort((a, b) => a.order - b.order)[0]?.id ?? '',
    proficiency: 'familiar',
    showInStack: true,
    featured: false,
  }),
  Preview: TechnologyPreview,
  Form: TechnologyForm,
  badges: (t) => (!t.showInStack ? <Badge>Not in stack</Badge> : null),
};

// ── Tech categories ──────────────────────────────────────────
function TechCategoryForm({ value: c, set, errors }: FormProps<TechCategory>) {
  return (
    <>
      <TextField label="Title" required value={c.title} onChange={(v) => set('title', v)} error={errors.title} maxLength={LIMITS.title} autoFocus />
      <TextArea label="Subtitle" value={c.subtitle} onChange={(v) => set('subtitle', v)} error={errors.subtitle} maxLength={LIMITS.summary} rows={2} />
      <IconSelect label="Icon" value={c.icon} onChange={(v) => set('icon', v)} error={errors.icon} />
      <Toggle label="Visible on site" hint="Hidden categories keep their technologies usable on projects." checked={c.visible} onChange={(v) => set('visible', v)} />
    </>
  );
}

function TechCategoryPreview({ item, doc }: { item: TechCategory; doc: { technologies: Technology[] } }) {
  const Icon = getIcon(item.icon);
  const count = doc.technologies.filter((t) => t.categoryId === item.id).length;
  return (
    <div className="flex h-full items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 pt-12">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#00abf0]/12 text-[#00abf0]">
        <Icon size={20} aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="font-semibold text-white">{item.title || 'Category'}</p>
        {item.subtitle && <p className="mt-0.5 line-clamp-2 text-sm text-gray-400">{item.subtitle}</p>}
        <p className="mt-1 text-xs text-[#7f97ad]">
          {count} technolog{count === 1 ? 'y' : 'ies'}
        </p>
      </div>
    </div>
  );
}

export const techCategoryConfig: EntityConfig<'techCategories'> = {
  key: 'techCategories',
  singular: 'category',
  idPrefix: 'tcat',
  schema: TechCategorySchema,
  titleField: 'title',
  title: (c) => c.title || 'Untitled category',
  blank: () => ({ id: '', order: 0, visible: true, title: '', icon: 'Code2' }),
  Preview: TechCategoryPreview,
  deleteBlocker: (c, doc) => {
    const n = doc.technologies.filter((t) => t.categoryId === c.id).length;
    return n ? `Move or delete the ${n} technolog${n === 1 ? 'y' : 'ies'} in “${c.title}” first.` : null;
  },
  Form: TechCategoryForm,
};

// ── Project categories ───────────────────────────────────────
function ProjectCategoryForm({ value: c, set, errors }: FormProps<ProjectCategory>) {
  return (
    <>
      <TextField label="Label" required value={c.label} onChange={(v) => set('label', v)} error={errors.label} maxLength={LIMITS.short} autoFocus />
      <Toggle label="Visible on site" checked={c.visible} onChange={(v) => set('visible', v)} />
    </>
  );
}

export const projectCategoryConfig: EntityConfig<'projectCategories'> = {
  key: 'projectCategories',
  singular: 'project category',
  idPrefix: 'pcat',
  schema: ProjectCategorySchema,
  titleField: 'label',
  title: (c) => c.label || 'Untitled category',
  blank: () => ({ id: '', order: 0, visible: true, label: '' }),
  Preview: ({ item, doc }) => {
    const count = doc.projects.filter((p) => p.categoryIds.includes(item.id)).length;
    return (
      <div className="flex h-full flex-col justify-end rounded-2xl border border-white/10 bg-white/[0.03] p-4 pt-12">
        <p className="font-semibold text-white">{item.label || 'Category'}</p>
        <p className="text-xs text-[#7f97ad]">
          {count} project{count === 1 ? '' : 's'}
        </p>
      </div>
    );
  },
  Form: ProjectCategoryForm,
};

// ── Social links ─────────────────────────────────────────────
export const PLATFORM_LABEL: Record<SocialPlatform, string> = {
  email: 'Email',
  linkedin: 'LinkedIn',
  github: 'GitHub',
  instagram: 'Instagram',
  facebook: 'Facebook',
  x: 'X (Twitter)',
  youtube: 'YouTube',
  medium: 'Medium',
  devto: 'DEV',
  ieee: 'IEEE',
  website: 'Website',
  university: 'University',
  location: 'Location',
  other: 'Other',
};

function SocialForm({ value: s, set, errors }: FormProps<SocialLink>) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          label="Platform"
          required
          value={s.platform}
          onChange={(v) => {
            const platform = (v ?? 'other') as SocialPlatform;
            set('platform', platform);
            if (!s.label) set('label', PLATFORM_LABEL[platform]);
          }}
          options={(Object.keys(PLATFORM_LABEL) as SocialPlatform[]).map((p) => ({ value: p, label: PLATFORM_LABEL[p] }))}
        />
        <TextField label="Label" required value={s.label} onChange={(v) => set('label', v)} error={errors.label} maxLength={LIMITS.short} />
      </div>
      <TextField label="Handle or display text" value={s.handle} onChange={(v) => set('handle', v)} error={errors.handle} placeholder="@username or email address" />
      <UrlField
        label="Link"
        allowMailto
        value={s.url}
        onChange={(v) => set('url', v)}
        error={errors.url}
        placeholder={s.platform === 'email' ? 'mailto:you@example.com' : 'https://'}
      />
      <ColorField label="Accent colour" value={s.accent} onChange={(v) => set('accent', v)} error={errors.accent} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Toggle label="Show in hero" hint="Icon row on the home page (needs a link)." checked={s.showInHero} onChange={(v) => set('showInHero', v)} />
        <Toggle label="Show on contact page" checked={s.showInContact} onChange={(v) => set('showInContact', v)} />
        <Toggle label="Visible on site" checked={s.visible} onChange={(v) => set('visible', v)} />
      </div>
    </>
  );
}

function SocialPreview({ item }: { item: SocialLink }) {
  const Icon = SOCIAL_ICONS[item.platform] ?? SOCIAL_ICONS.other;
  return (
    <div className="flex h-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/[0.06]"
        style={item.accent ? { color: item.accent, backgroundColor: `${item.accent}1f` } : { color: '#00abf0' }}
      >
        <Icon size={20} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-white">{item.label || 'Link'}</p>
        <p className="truncate text-sm text-gray-400">{item.handle || item.url || 'No link'}</p>
      </div>
      <div className="hidden flex-wrap gap-1.5 sm:flex">
        {item.showInHero && <Badge tone="accent">Hero</Badge>}
        {item.showInContact && <Badge tone="accent">Contact</Badge>}
      </div>
    </div>
  );
}

export const socialConfig: EntityConfig<'socials'> = {
  key: 'socials',
  singular: 'social link',
  idPrefix: 'soc',
  schema: SocialLinkSchema,
  titleField: 'label',
  title: (s) => s.label || 'Untitled link',
  blank: () => ({ id: '', order: 0, visible: true, platform: 'linkedin', label: 'LinkedIn', url: '', showInHero: true, showInContact: true }),
  Preview: SocialPreview,
  Form: SocialForm,
};
