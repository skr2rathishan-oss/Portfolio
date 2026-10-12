// Properties for page sections and content blocks.
import { ArrowDown, ArrowUp, ImagePlus, Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { BLOCK_LABEL, CUSTOM_SECTION_META, LAYOUT_LIMITS, SECTION_META } from '../../../content/layout';
import { BlockSchema, LIMITS } from '../../../content/schema';
import { BLOCK_STYLE_SUPPORT } from '../../../content/styleClasses';
import type { Block, BuiltinSectionProps, GalleryImage, Section } from '../../../content/types';
import { inputClass, SelectField, TextArea, TextField, Toggle, UrlField } from '../../fields/Field';
import { ImageField, MediaLibraryDialog } from '../../fields/MediaField';
import { newId } from '../../lib/ids';
import {
  patchBlockProps,
  setBlockStyle,
  setBlockVisible,
  setSectionProp,
  setSectionStyle,
  setSectionVisible,
} from '../../lib/layoutReducers';
import { issuesToErrors } from '../../lib/validate';
import { Button, cx, IconButton } from '../../ui/primitives';
import { useEditor } from '../state/EditorContext';
import { StyleControls } from '../StyleControls';
import { findBlock, findSection } from '../targets';
import { changedKeys, useDraft, type Validation } from './useDraft';

const PROP_LABEL: Record<keyof BuiltinSectionProps, string> = {
  title: 'Heading',
  lead: 'Lead text',
  secondaryTitle: 'Second heading',
  buttonLabel: 'Button label',
};
const PROP_MAX: Record<keyof BuiltinSectionProps, number> = {
  title: LIMITS.title,
  lead: LAYOUT_LIMITS.sectionLead,
  secondaryTitle: LIMITS.title,
  buttonLabel: LIMITS.short,
};

function defaultOf(section: Section, key: keyof BuiltinSectionProps): string | undefined {
  if (section.type === 'custom') return undefined;
  const m = SECTION_META[section.type];
  return { title: m.defaultTitle, lead: m.defaultLead, secondaryTitle: m.defaultSecondaryTitle, buttonLabel: m.defaultButtonLabel }[key];
}

// ── Sections ─────────────────────────────────────────────────
export function SectionContent({ id }: { id: string }) {
  const { doc, page } = useEditor();
  const section = findSection(doc, page, id);
  if (!section) return <p className="text-sm text-[#8ea6bd]">This section is not on this page.</p>;
  return <SectionForm key={id} section={section} />;
}

type SectionDraft = Partial<Record<keyof BuiltinSectionProps | 'arrangement', string>>;

function SectionForm({ section }: { section: Section }) {
  const { apply, page, setLibraryOpen } = useEditor();
  const keys: (keyof BuiltinSectionProps)[] =
    section.type === 'custom' ? ['title', 'lead'] : [...SECTION_META[section.type].props];
  const source: SectionDraft =
    section.type === 'custom'
      ? { title: section.props.title ?? '', lead: section.props.lead ?? '', arrangement: section.props.arrangement }
      : Object.fromEntries(keys.map((k) => [k, section.props?.[k] ?? ''])) as SectionDraft;

  const d = useDraft<SectionDraft>({
    id: `panel:section:${section.id}`,
    source,
    validate: (v) => {
      const errors: Record<string, string> = {};
      for (const k of keys) if ((v[k] ?? '').trim().length > PROP_MAX[k]) errors[k] = `Must be at most ${PROP_MAX[k]} characters`;
      return Object.keys(errors).length ? { ok: false, errors } : { ok: true, data: v };
    },
    commit: (data, base) => {
      const patch = changedKeys(base, data);
      return apply(
        (doc) =>
          Object.entries(patch).reduce((acc, [k, v]) => {
            const val = typeof v === 'string' && v.trim() ? v.trim() : undefined;
            return setSectionProp(page, section.id, k as keyof BuiltinSectionProps, k === 'arrangement' ? (v as string) : val, defaultOf(section, k as keyof BuiltinSectionProps))(acc);
          }, doc),
        { coalesceKey: `panel:section:${section.id}`, quiet: true },
      );
    },
  });

  const meta = section.type === 'custom' ? null : SECTION_META[section.type];
  return (
    <form noValidate onSubmit={(e) => e.preventDefault()} onBlur={d.onBlur} className="space-y-5">
      <Toggle
        name="visible"
        label="Show this section"
        hint={section.visible ? undefined : 'Hidden sections are kept but not shown on the site.'}
        checked={section.visible}
        onChange={(v) => void apply(setSectionVisible(page, section.id, v))}
      />
      {keys.map((k) => {
        const def = defaultOf(section, k);
        const Comp = k === 'lead' ? TextArea : TextField;
        return (
          <Comp
            key={k}
            name={k}
            label={PROP_LABEL[k]}
            value={d.draft[k]}
            onChange={(v: string) => d.set(k, v)}
            error={d.errors[k]}
            maxLength={PROP_MAX[k]}
            placeholder={def}
            hint={def ? 'Leave empty to use the default shown in grey.' : undefined}
            {...(k === 'lead' ? { rows: 3 } : {})}
          />
        );
      })}
      {section.type === 'custom' && (
        <>
          <SelectField
            name="arrangement"
            label="Arrangement"
            value={(d.draft.arrangement ?? 'stack') as 'stack' | 'grid'}
            onChange={(v) => {
              d.set('arrangement', v ?? 'stack');
              void d.commitNow();
            }}
            options={[
              { value: 'stack', label: 'Stacked (one per row)' },
              { value: 'grid', label: 'Grid (set columns in Style)' },
            ]}
          />
          <div className="rounded-lg border border-[#1b3550] bg-[#0a1a2b]/60 p-3">
            <p className="text-sm text-[#cfdbe6]">
              {section.blocks.length} block{section.blocks.length === 1 ? '' : 's'}
            </p>
            <p className="mt-0.5 text-xs text-[#8ea6bd]">Select a block in the canvas or in Layers to edit it.</p>
            <Button size="sm" className="mt-3" icon={<Plus size={14} aria-hidden="true" />} onClick={() => setLibraryOpen(true)}>
              Add a block
            </Button>
          </div>
        </>
      )}
      {meta && (meta.collections.length > 0 || meta.orderNote) && (
        <p className="rounded-lg border border-[#1b3550] bg-[#0a1a2b]/60 px-3 py-2 text-xs leading-relaxed text-[#8ea6bd]">
          {meta.collections.length > 0 && 'Select an item in the canvas to edit it. '}
          {meta.orderNote ?? (meta.collections.length > 0 ? 'Reorder items in Layers.' : '')}
        </p>
      )}
    </form>
  );
}

export function SectionStyle({ id }: { id: string }) {
  const { doc, page, apply } = useEditor();
  const section = findSection(doc, page, id);
  if (!section) return null;
  const keys = section.type === 'custom' ? CUSTOM_SECTION_META.styleKeys : SECTION_META[section.type].styleKeys;
  return (
    <StyleControls
      keys={keys}
      style={section.style}
      empty="This section keeps the page's built-in spacing."
      onChange={(key, value) => void apply(setSectionStyle(page, id, key, value), { coalesceKey: `style:section:${id}` })}
    />
  );
}

// ── Blocks ───────────────────────────────────────────────────
export function BlockContent({ sid, bid, focusImage }: { sid: string; bid: string; focusImage?: string | null }) {
  const { doc, page } = useEditor();
  const found = findBlock(doc, page, sid, bid);
  if (!found) return <p className="text-sm text-[#8ea6bd]">This block no longer exists.</p>;
  return <BlockForm key={bid} sid={sid} block={found.block} focusImage={focusImage ?? null} />;
}

type Props = Record<string, unknown>;

function BlockForm({ sid, block, focusImage }: { sid: string; block: Block; focusImage: string | null }) {
  const { apply, page } = useEditor();
  const [library, setLibrary] = useState(false);
  const d = useDraft<Props>({
    id: `panel:block:${block.id}`,
    source: block.props as Props,
    validate: (v): Validation<Props> => {
      const r = BlockSchema.safeParse({ ...block, props: v });
      if (r.success) return { ok: true, data: r.data.props as Props };
      const errs = issuesToErrors(r.error.issues);
      return { ok: false, errors: Object.fromEntries(Object.entries(errs).map(([k, m]) => [k.replace(/^props\./, ''), m])) };
    },
    commit: (data, base) => apply(patchBlockProps(page, sid, block.id, changedKeys(base, data)), { coalesceKey: `panel:block:${block.id}`, quiet: true }),
  });
  const p = d.draft;
  const e = d.errors;

  useEffect(() => {
    if (!focusImage) return;
    document.querySelector(`[data-field="images.${CSS.escape(focusImage)}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [focusImage]);

  const images = (p.images as GalleryImage[] | undefined) ?? [];
  const setImages = (next: GalleryImage[], now = false) => {
    d.set('images', next);
    if (now) void d.commitNow();
  };

  return (
    <form noValidate onSubmit={(ev) => ev.preventDefault()} onBlur={d.onBlur} className="space-y-5">
      <Toggle name="visible" label="Show this block" checked={block.visible} onChange={(v) => void apply(setBlockVisible(page, sid, block.id, v))} />
      {block.type === 'heading' && (
        <>
          <TextField name="text" label="Heading" required value={p.text as string} onChange={(v) => d.set('text', v)} error={e.text} maxLength={LIMITS.title} />
          <SelectField
            name="level"
            label="Level"
            value={p.level as 'h2' | 'h3'}
            onChange={(v) => d.set('level', v ?? 'h2')}
            options={[
              { value: 'h2', label: 'Section heading (H2)' },
              { value: 'h3', label: 'Sub-heading (H3)' },
            ]}
          />
        </>
      )}
      {block.type === 'text' && (
        <TextArea name="text" label="Text" required value={p.text as string} onChange={(v) => d.set('text', v)} error={e.text} maxLength={LAYOUT_LIMITS.blockText} rows={8} hint="Plain text. A blank line starts a new paragraph." />
      )}
      {block.type === 'image' && (
        <>
          <ImageField
            name="src"
            label="Image"
            value={p.src as string | undefined}
            onChange={(v) => {
              d.set('src', v);
              void d.commitNow();
            }}
            error={e.src}
            alt={{ value: p.alt as string, onChange: (v) => d.set('alt', v), required: !!p.src, error: e.alt }}
          />
          <TextField name="caption" label="Caption" value={p.caption as string | undefined} onChange={(v) => d.set('caption', v || undefined)} error={e.caption} maxLength={200} />
          <UrlField name="href" label="Link (optional)" value={p.href as string | undefined} onChange={(v) => d.set('href', v || undefined)} error={e.href} />
        </>
      )}
      {block.type === 'gallery' && (
        <fieldset data-field="images" className="min-w-0 space-y-2">
          <legend className="mb-1.5 text-[13px] font-medium text-[#cfdbe6]">
            Images <span className="font-normal text-[#7f97ad]">({images.length} of {LAYOUT_LIMITS.galleryImages})</span>
          </legend>
          {images.length === 0 && <p className="text-sm text-[#8ea6bd]">No images yet. Add some from the media library.</p>}
          <ul className="space-y-2">
            {images.map((img, i) => (
              <li
                key={img.id}
                data-field={`images.${img.id}`}
                className={cx('flex gap-2 rounded-lg border bg-[#0a1a2b]/60 p-2', focusImage === img.id ? 'border-[#00abf0]' : 'border-[#1b3550]')}
              >
                <img src={img.src} alt="" className="h-14 w-14 shrink-0 rounded-md object-cover" />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <input
                    aria-label={`Alt text for image ${i + 1}`}
                    placeholder="Alt text (required)"
                    value={img.alt}
                    onChange={(ev) => setImages(images.map((x) => (x.id === img.id ? { ...x, alt: ev.target.value } : x)))}
                    className={cx(inputClass, 'px-2 py-1.5', e[`images.${i}.alt`] && 'border-[#ff6b6b]/70')}
                  />
                  <input
                    aria-label={`Caption for image ${i + 1}`}
                    placeholder="Caption (optional)"
                    value={img.caption ?? ''}
                    onChange={(ev) => setImages(images.map((x) => (x.id === img.id ? { ...x, caption: ev.target.value || undefined } : x)))}
                    className={cx(inputClass, 'px-2 py-1.5')}
                  />
                  {e[`images.${i}.alt`] && <p className="text-xs text-[#ff8a8a]">{e[`images.${i}.alt`]}</p>}
                </div>
                <div className="flex flex-col">
                  <IconButton label={`Move image ${i + 1} up`} disabled={i === 0} onClick={() => setImages(swap(images, i, i - 1), true)}>
                    <ArrowUp size={14} aria-hidden="true" />
                  </IconButton>
                  <IconButton label={`Move image ${i + 1} down`} disabled={i === images.length - 1} onClick={() => setImages(swap(images, i, i + 1), true)}>
                    <ArrowDown size={14} aria-hidden="true" />
                  </IconButton>
                  <IconButton label={`Remove image ${i + 1}`} tone="danger" onClick={() => setImages(images.filter((x) => x.id !== img.id), true)}>
                    <X size={14} aria-hidden="true" />
                  </IconButton>
                </div>
              </li>
            ))}
          </ul>
          {images.length < LAYOUT_LIMITS.galleryImages && (
            <Button size="sm" icon={<ImagePlus size={14} aria-hidden="true" />} onClick={() => setLibrary(true)}>
              Add images
            </Button>
          )}
          {library && (
            <MediaLibraryDialog
              purpose="image"
              onClose={() => setLibrary(false)}
              onPick={() => undefined}
              onPickMany={(urls) => {
                setLibrary(false);
                const room = LAYOUT_LIMITS.galleryImages - images.length;
                setImages([...images, ...urls.slice(0, room).map((src) => ({ id: newId('gimg', 'image'), src, alt: 'Gallery image' }))], true);
              }}
            />
          )}
        </fieldset>
      )}
      {block.type === 'button' && (
        <>
          <TextField name="label" label="Label" required value={p.label as string} onChange={(v) => d.set('label', v)} error={e.label} maxLength={LIMITS.short} />
          <UrlField name="href" label="Link" required allowMailto value={p.href as string} onChange={(v) => d.set('href', v)} error={e.href} />
          <SelectField
            name="variant"
            label="Style"
            value={p.variant as 'primary' | 'secondary' | 'quiet'}
            onChange={(v) => d.set('variant', v ?? 'primary')}
            options={[
              { value: 'primary', label: 'Primary' },
              { value: 'secondary', label: 'Secondary' },
              { value: 'quiet', label: 'Quiet link' },
            ]}
          />
          <SelectField
            name="icon"
            label="Icon"
            value={p.icon as 'none' | 'arrow' | 'external' | 'download' | 'mail'}
            onChange={(v) => d.set('icon', v ?? 'none')}
            options={[
              { value: 'none', label: 'None' },
              { value: 'arrow', label: 'Arrow' },
              { value: 'external', label: 'External link' },
              { value: 'download', label: 'Download' },
              { value: 'mail', label: 'Email' },
            ]}
          />
        </>
      )}
      {block.type === 'contactInfo' && (
        <>
          <TextField name="title" label="Title" value={p.title as string | undefined} onChange={(v) => d.set('title', v || undefined)} error={e.title} maxLength={LIMITS.title} />
          <Toggle name="showEmail" label="Show email" checked={!!p.showEmail} onChange={(v) => { d.set('showEmail', v); void d.commitNow(); }} />
          <Toggle name="showLocation" label="Show location" checked={!!p.showLocation} onChange={(v) => { d.set('showLocation', v); void d.commitNow(); }} />
          <Toggle name="showSocials" label="Show social links" checked={!!p.showSocials} onChange={(v) => { d.set('showSocials', v); void d.commitNow(); }} />
          <p className="text-xs text-[#7f97ad]">Email, location and links come from your contact details and social links.</p>
        </>
      )}
      {block.type === 'divider' && <p className="text-sm text-[#8ea6bd]">A divider has no content. Adjust its width in Style.</p>}
      <p className="sr-only">{BLOCK_LABEL[block.type]} block</p>
    </form>
  );
}

function swap<T>(list: T[], i: number, j: number): T[] {
  const next = list.slice();
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

export function BlockStyle({ sid, bid }: { sid: string; bid: string }) {
  const { doc, page, apply } = useEditor();
  const found = findBlock(doc, page, sid, bid);
  if (!found) return null;
  return (
    <StyleControls
      keys={BLOCK_STYLE_SUPPORT[found.block.type]}
      style={found.block.style}
      onChange={(key, value) => void apply(setBlockStyle(page, sid, bid, key, value), { coalesceKey: `style:block:${bid}` })}
    />
  );
}
