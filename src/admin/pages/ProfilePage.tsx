import { MousePointerClick } from 'lucide-react';
import { useMemo, type MouseEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import Hero from '../../components/sections/Hero';
import { ICON_NAMES } from '../../content/icons';
import { LIMITS, ProfileSchema } from '../../content/schema';
import { sortByOrder, visibleOnly } from '../../content/selectors';
import type { IconName, Profile } from '../../content/types';
import { SelectField, TagInput, TextArea, TextField, Toggle, UrlField } from '../fields/Field';
import { ImageField } from '../fields/MediaField';
import { newId } from '../lib/ids';
import { setProfile } from '../lib/reducers';
import { useDoc } from '../state/AdminContentContext';
import { PageHeader, Panel, TabPanel, Tabs } from '../ui/primitives';
import { RepeatList, SaveBar, useSingletonDraft } from './singleton';

type Tab = 'hero' | 'about' | 'contact';

const HeroDraftSchema = z.object({ fullName: ProfileSchema.shape.fullName, hero: ProfileSchema.shape.hero });
type HeroDraft = { fullName: string; hero: Profile['hero'] };

/** Focuses the form field group for a clicked region of the hero preview. */
function focusRegion(region: string) {
  const el = document.querySelector<HTMLElement>(`[data-region="${region}"]`);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  const input = el.querySelector<HTMLElement>('input:not([type=file]):not([type=color]), textarea, select, button');
  window.setTimeout(() => input?.focus({ preventScroll: true }), 250);
  el.animate?.([{ boxShadow: '0 0 0 2px rgba(0,171,240,0.8)' }, { boxShadow: '0 0 0 2px rgba(0,171,240,0)' }], { duration: 1400 });
}

function HeroTab() {
  const doc = useDoc();
  const navigate = useNavigate();
  const { fullName, hero } = doc.profile;
  const source = useMemo<HeroDraft>(() => ({ fullName, hero }), [fullName, hero]);
  const { draft, update, errors, dirty, saving, save, discard } = useSingletonDraft<HeroDraft>(
    source,
    HeroDraftSchema,
    (v) => setProfile((p) => ({ ...p, fullName: v.fullName, hero: v.hero })),
    'Hero saved to draft',
    'profile.',
  );
  const h = draft.hero;
  const setHero = <K extends keyof Profile['hero']>(key: K, value: Profile['hero'][K]) => update({ hero: { ...h, [key]: value } });
  const socials = sortByOrder(visibleOnly(doc.socials));

  const onPreviewClick = (e: MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const link = target.closest('a');
    e.preventDefault();
    e.stopPropagation();
    if (target.closest('img')) return focusRegion('image');
    if (target.closest('h1')) return focusRegion('headline');
    if (link) {
      const href = link.getAttribute('href') ?? '';
      const text = link.textContent ?? '';
      if (socials.some((s) => s.url && s.url === href)) return navigate('/admin/socials');
      if (doc.site.cv && href === doc.site.cv.url) return navigate('/admin/site');
      return focusRegion('ctas');
    }
    const text = (target.closest('li, p') ?? target).textContent ?? '';
    if (h.focusAreas.some((a) => text.trim() === a)) return focusRegion('focus');
    if (h.intro && text.includes(h.intro.slice(0, 40))) return focusRegion('intro');
    if (h.headline && text.includes(h.headline)) return focusRegion('headline');
    if (h.roleBadge && text.includes(h.roleBadge)) return focusRegion('badge');
    if (doc.profile.contact.availability.title && text.includes(doc.profile.contact.availability.title)) return navigate('/admin/profile?tab=contact');
    focusRegion('headline');
  };

  return (
    <>
      <div className="mb-8 overflow-hidden rounded-3xl border border-[#14304b] bg-[#081b29]">
        <p className="flex items-center gap-2 border-b border-[#14304b] px-4 py-2.5 text-xs text-[#8ea6bd]">
          <MousePointerClick size={14} className="text-[#00abf0]" aria-hidden="true" />
          Live preview. Click any part of the hero to jump to its field.
        </p>
        <div
          onClickCapture={onPreviewClick}
          className="cursor-pointer [&_a]:cursor-pointer"
          role="region"
          aria-label="Hero preview. Activating an element jumps to its field."
        >
          <div className="px-5 sm:px-8"><Hero profile={{ ...doc.profile, fullName: draft.fullName, hero: h }} socials={socials} cvUrl={doc.site.cv?.url} /></div>
        </div>
      </div>

      <div className="space-y-6">
        <Panel title="Identity">
          <div className="grid gap-4 sm:grid-cols-2">
            <div data-region="name">
            <TextField label="Full name" required value={draft.fullName} onChange={(v) => update({ fullName: v })} error={errors.fullName} maxLength={LIMITS.title} />
            </div>
            <div data-region="badge">
            <TextField label="Role badge" value={h.roleBadge} onChange={(v) => setHero('roleBadge', v)} error={errors['hero.roleBadge']} maxLength={LIMITS.short} hint="Shown as the code-style badge at the top of the hero." />
            </div>
            <div data-region="focus" className="sm:col-span-2">
            <TagInput label="Focus areas" value={h.focusAreas} onChange={(v) => setHero('focusAreas', v)} max={8} error={errors['hero.focusAreas']} />
            </div>
          </div>
        </Panel>
        <Panel title="Headline and intro">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2" data-region="headline">
              <TextField label="Headline" required value={h.headline} onChange={(v) => setHero('headline', v)} error={errors['hero.headline']} maxLength={LIMITS.title} />
              <TextField label="Headline, second part" value={h.headlineAccent} onChange={(v) => setHero('headlineAccent', v)} error={errors['hero.headlineAccent']} maxLength={LIMITS.title} />
            </div>
            <div data-region="intro">
              <TextArea label="Intro" value={h.intro} onChange={(v) => setHero('intro', v)} error={errors['hero.intro']} maxLength={LIMITS.summary} rows={3} />
            </div>
          </div>
        </Panel>
        <Panel title="Buttons" description="Internal pages start with / (for example /projects). External links use https://.">
          <div className="grid gap-4 sm:grid-cols-2" data-region="ctas">
            <TextField label="Primary button label" required value={h.primaryCta.label} onChange={(v) => setHero('primaryCta', { ...h.primaryCta, label: v })} error={errors['hero.primaryCta.label']} />
            <UrlField label="Primary button link" required value={h.primaryCta.to} onChange={(v) => setHero('primaryCta', { ...h.primaryCta, to: v })} error={errors['hero.primaryCta.to']} />
            <TextField label="Secondary button label" required value={h.secondaryCta.label} onChange={(v) => setHero('secondaryCta', { ...h.secondaryCta, label: v })} error={errors['hero.secondaryCta.label']} />
            <UrlField label="Secondary button link" required value={h.secondaryCta.to} onChange={(v) => setHero('secondaryCta', { ...h.secondaryCta, to: v })} error={errors['hero.secondaryCta.to']} />
          </div>
        </Panel>
        <Panel title="Photo">
          <div data-region="image">
            <ImageField
              label="Hero photo"
              required
              value={h.image || undefined}
              onChange={(v) => setHero('image', v ?? '')}
              error={errors['hero.image']}
              maxDim={1600}
              aspect="portrait"
              alt={{ value: h.imageAlt, onChange: (v) => setHero('imageAlt', v), required: true, error: errors['hero.imageAlt'] }}
            />
          </div>
        </Panel>
      </div>
      <SaveBar dirty={dirty} saving={saving} onSave={() => void save()} onDiscard={discard} errorCount={Object.keys(errors).length} />
    </>
  );
}

type About = Profile['about'];

function AboutTab() {
  const doc = useDoc();
  const { draft: a, set, errors, dirty, saving, save, discard } = useSingletonDraft<About>(
    doc.profile.about,
    ProfileSchema.shape.about,
    (v) => setProfile((p) => ({ ...p, about: v })),
    'About saved to draft',
    'profile.about.',
  );
  const rowError = (prefix: string, i: number, field: string) => errors[`${prefix}.${i}.${field}`];
  return (
    <>
      <div className="space-y-6">
        <Panel title="Introduction">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Display name" required value={a.displayName} onChange={(v) => set('displayName', v)} error={errors.displayName} maxLength={LIMITS.title} />
              <TextField label="Tagline" value={a.tagline} onChange={(v) => set('tagline', v)} error={errors.tagline} maxLength={LIMITS.title} />
            </div>
            <TextArea label="Bio" value={a.bio} onChange={(v) => set('bio', v)} error={errors.bio} maxLength={LIMITS.bio} rows={8} hint="Plain text. Leave a blank line between paragraphs." />
            <ImageField label="About photo" required value={a.image || undefined} onChange={(v) => set('image', v ?? '')} error={errors.image} maxDim={1600} aspect="portrait" />
            <TagInput label="Interests" value={a.interests} onChange={(v) => set('interests', v)} error={errors.interests} />
          </div>
        </Panel>
        <Panel title="Quick facts">
          <RepeatList
            label="Facts"
            itemLabel="fact"
            items={a.facts}
            onChange={(v) => set('facts', v)}
            create={() => ({ id: newId('fact', 'fact'), icon: 'Sparkles' as IconName, label: '', value: '' })}
            renderRow={(f, up, i) => (
              <div className="grid gap-3 sm:grid-cols-[10rem_1fr_2fr]">
                <SelectField label="Icon" value={f.icon} onChange={(v) => up({ icon: (v ?? 'Sparkles') as IconName })} options={ICON_NAMES.map((n) => ({ value: n, label: n }))} />
                <TextField label="Label" required value={f.label} onChange={(v) => up({ label: v })} error={rowError('facts', i, 'label')} />
                <TextField label="Value" required value={f.value} onChange={(v) => up({ value: v })} error={rowError('facts', i, 'value')} />
              </div>
            )}
          />
        </Panel>
        <Panel title="Goals">
          <RepeatList
            label="Goals"
            itemLabel="goal"
            items={a.goals}
            onChange={(v) => set('goals', v)}
            create={() => ({ id: newId('goal', 'goal'), emoji: '', title: '', description: '' })}
            renderRow={(g, up, i) => (
              <div className="grid gap-3 sm:grid-cols-[5rem_1fr]">
                <TextField label="Emoji" value={g.emoji} onChange={(v) => up({ emoji: v })} error={rowError('goals', i, 'emoji')} />
                <TextField label="Title" required value={g.title} onChange={(v) => up({ title: v })} error={rowError('goals', i, 'title')} />
                <TextArea label="Description" value={g.description} onChange={(v) => up({ description: v })} rows={2} className="sm:col-span-2" error={rowError('goals', i, 'description')} />
              </div>
            )}
          />
        </Panel>
        <Panel title="Stats" description="Only use numbers you can back up.">
          <RepeatList
            label="Stats"
            itemLabel="stat"
            items={a.stats}
            onChange={(v) => set('stats', v)}
            create={() => ({ id: newId('stat', 'stat'), emoji: '', value: '', label: '' })}
            renderRow={(s, up, i) => (
              <div className="grid gap-3 sm:grid-cols-[5rem_8rem_1fr]">
                <TextField label="Emoji" value={s.emoji} onChange={(v) => up({ emoji: v })} />
                <TextField label="Value" required value={s.value} onChange={(v) => up({ value: v })} error={rowError('stats', i, 'value')} />
                <TextField label="Label" required value={s.label} onChange={(v) => up({ label: v })} error={rowError('stats', i, 'label')} />
              </div>
            )}
          />
        </Panel>
      </div>
      <SaveBar dirty={dirty} saving={saving} onSave={() => void save()} onDiscard={discard} errorCount={Object.keys(errors).length} />
    </>
  );
}

type Contact = Profile['contact'];

function ContactTab() {
  const doc = useDoc();
  const { draft: c, set, errors, dirty, saving, save, discard } = useSingletonDraft<Contact>(
    doc.profile.contact,
    ProfileSchema.shape.contact,
    (v) => setProfile((p) => ({ ...p, contact: v })),
    'Contact page saved to draft',
    'profile.contact.',
  );
  return (
    <>
      <div className="space-y-6">
        <Panel title="Heading">
          <div className="space-y-4">
            <TextField label="Eyebrow" value={c.eyebrow} onChange={(v) => set('eyebrow', v)} error={errors.eyebrow} maxLength={LIMITS.short} hint="Short line above the heading." />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Heading" required value={c.heading} onChange={(v) => set('heading', v)} error={errors.heading} maxLength={LIMITS.title} />
              <TextField label="Heading, accent part" value={c.headingAccent} onChange={(v) => set('headingAccent', v)} error={errors.headingAccent} maxLength={LIMITS.title} />
            </div>
            <TextArea label="Intro" value={c.intro} onChange={(v) => set('intro', v)} error={errors.intro} maxLength={LIMITS.summary} rows={3} />
          </div>
        </Panel>
        <Panel title="Details">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Email" type="email" value={c.email} onChange={(v) => set('email', v)} error={errors.email} />
            <TextField label="Location" value={c.location} onChange={(v) => set('location', v)} error={errors.location} />
            <TextField label="Time zone" value={c.timezone} onChange={(v) => set('timezone', v)} error={errors.timezone} placeholder="GMT+5:30" />
          </div>
        </Panel>
        <Panel title="Availability">
          <div className="space-y-4">
            <Toggle label="Show availability" checked={c.availability.enabled} onChange={(v) => set('availability', { ...c.availability, enabled: v })} />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Title" value={c.availability.title} onChange={(v) => set('availability', { ...c.availability, title: v })} error={errors['availability.title']} placeholder="Open to internships" />
              <TextField label="Subtitle" value={c.availability.subtitle} onChange={(v) => set('availability', { ...c.availability, subtitle: v })} error={errors['availability.subtitle']} />
            </div>
          </div>
        </Panel>
      </div>
      <SaveBar dirty={dirty} saving={saving} onSave={() => void save()} onDiscard={discard} errorCount={Object.keys(errors).length} />
    </>
  );
}

export function ProfilePage() {
  const [params, setParams] = useSearchParams();
  const requested = params.get('tab');
  const tab: Tab = requested === 'about' || requested === 'contact' ? requested : 'hero';
  const setTab = (t: Tab) => setParams(t === 'hero' ? {} : { tab: t }, { replace: true });
  return (
    <>
      <PageHeader title="Profile" description="Your home page hero, About introduction and Contact page copy." />
      <Tabs<Tab>
        label="Profile sections"
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'hero', label: 'Hero' },
          { id: 'about', label: 'About' },
          { id: 'contact', label: 'Contact' },
        ]}
      />
      <TabPanel id={tab}>
        {tab === 'hero' && <HeroTab />}
        {tab === 'about' && <AboutTab />}
        {tab === 'contact' && <ContactTab />}
      </TabPanel>
    </>
  );
}
