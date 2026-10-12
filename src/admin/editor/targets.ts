// Edit-target model shared by the editor (parent) and the canvas iframe.
// Pure: no React, no zod, no api.ts, no admin state, so the canvas chunk can import it.
//
// Targets (see src/content/editable.ts `T`):
//   item:<coll>:<id>             field:<coll>:<id>:<field>
//   profile:<path>               site:<path>
//   section:<id>[:<prop>]        block:<sid>:<bid>[:<prop>]   (prop `images.<gimgId>` = gallery image)
import { BLOCK_LABEL, PAGE_LABEL, SECTION_META, resolvePage, sectionLabel, sectionText } from '../../content/layout';
import { sortByOrder } from '../../content/selectors';
import type {
  Block,
  BuiltinSectionProps,
  BuiltinSectionType,
  CollectionName,
  Content,
  CustomSection,
  PageKey,
  Section,
} from '../../content/types';

export type ParsedTarget =
  | { t: 'item'; coll: CollectionName; id: string }
  | { t: 'field'; coll: CollectionName; id: string; field: string }
  | { t: 'profile'; path: string }
  | { t: 'site'; path: string }
  | { t: 'section'; id: string; prop?: string }
  | { t: 'block'; sid: string; bid: string; prop?: string };

const COLLECTIONS: readonly CollectionName[] = [
  'socials',
  'projects',
  'projectCategories',
  'techCategories',
  'technologies',
  'education',
  'academicPathway',
  'certifications',
  'achievements',
  'roles',
  'programs',
];

export function isCollection(x: string): x is CollectionName {
  return (COLLECTIONS as readonly string[]).includes(x);
}

export function parseTarget(target: string | null | undefined): ParsedTarget | null {
  if (!target) return null;
  const parts = target.split(':');
  const [kind] = parts;
  switch (kind) {
    case 'item':
      return parts.length === 3 && isCollection(parts[1]) ? { t: 'item', coll: parts[1], id: parts[2] } : null;
    case 'field':
      return parts.length >= 4 && isCollection(parts[1])
        ? { t: 'field', coll: parts[1], id: parts[2], field: parts.slice(3).join(':') }
        : null;
    case 'profile':
      return parts.length >= 2 ? { t: 'profile', path: parts.slice(1).join(':') } : null;
    case 'site':
      return parts.length >= 2 ? { t: 'site', path: parts.slice(1).join(':') } : null;
    case 'section':
      if (parts.length === 2) return { t: 'section', id: parts[1] };
      return parts.length === 3 ? { t: 'section', id: parts[1], prop: parts[2] } : null;
    case 'block':
      if (parts.length === 3) return { t: 'block', sid: parts[1], bid: parts[2] };
      return parts.length >= 4 ? { t: 'block', sid: parts[1], bid: parts[2], prop: parts.slice(3).join(':') } : null;
    default:
      return null;
  }
}

export const galleryImageId = (prop: string | undefined): string | null =>
  prop && prop.startsWith('images.') ? prop.slice('images.'.length) : null;

// ── Labels ───────────────────────────────────────────────────
export const COLLECTION_LABEL: Record<CollectionName, string> = {
  socials: 'Social link',
  projects: 'Project',
  projectCategories: 'Project category',
  techCategories: 'Tech category',
  technologies: 'Skill',
  education: 'Education',
  academicPathway: 'Milestone',
  certifications: 'Certificate',
  achievements: 'Achievement',
  roles: 'Role',
  programs: 'Program',
};

const TITLE_FIELD: Record<CollectionName, string> = {
  socials: 'label',
  projects: 'title',
  projectCategories: 'label',
  techCategories: 'title',
  technologies: 'name',
  education: 'degree',
  academicPathway: 'label',
  certifications: 'name',
  achievements: 'title',
  roles: 'title',
  programs: 'title',
};

const FIELD_LABEL: Record<string, string> = {
  title: 'Title',
  name: 'Name',
  label: 'Label',
  summary: 'Description',
  description: 'Description',
  image: 'Image',
  logo: 'Logo',
  icon: 'Icon',
  sourceUrl: 'Source link',
  demoUrl: 'Demo link',
  url: 'Link',
  'link.url': 'Link',
  credentialUrl: 'Credential link',
  stack: 'Tech stack',
  skills: 'Skills',
  highlights: 'Highlights',
  organizer: 'Organizer',
  organization: 'Organization',
  issuer: 'Issuer',
  institution: 'Institution',
  degree: 'Degree',
  result: 'Result',
  handle: 'Handle',
  date: 'Date',
};

const PROFILE_LABEL: Record<string, string> = {
  fullName: 'Full name',
  'hero.roleBadge': 'Role badge',
  'hero.focusAreas': 'Focus areas',
  'hero.headline': 'Headline',
  'hero.headlineAccent': 'Headline accent',
  'hero.intro': 'Intro',
  'hero.primaryCta': 'Primary button',
  'hero.secondaryCta': 'Secondary button',
  'hero.image': 'Profile picture',
  'about.image': 'About photo',
  'about.displayName': 'Display name',
  'about.tagline': 'Tagline',
  'about.bio': 'Bio',
  'about.facts': 'Quick facts',
  'about.interests': 'Interests',
  'about.goals': 'Goals',
  'about.stats': 'Stats',
  'contact.eyebrow': 'Contact eyebrow',
  'contact.heading': 'Contact heading',
  'contact.headingAccent': 'Contact heading accent',
  'contact.intro': 'Contact intro',
  'contact.email': 'Email',
  'contact.location': 'Location',
  'contact.availability': 'Availability',
};

const SITE_LABEL: Record<string, string> = {
  brand: 'Site name',
  cv: 'CV download',
  footerText: 'Footer text',
};

const SECTION_PROP_LABEL: Record<string, string> = {
  title: 'Heading',
  lead: 'Lead text',
  secondaryTitle: 'Second heading',
  buttonLabel: 'Button label',
};

const BLOCK_PROP_LABEL: Record<string, string> = { text: 'Text', src: 'Image', label: 'Button label', title: 'Title' };

const humanize = (s: string) => {
  const last = s.split('.').pop() ?? s;
  const words = last.replace(/([A-Z])/g, ' $1').toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
};

// ── Lookups ──────────────────────────────────────────────────
type AnyItem = { id: string; order: number; visible: boolean } & Record<string, unknown>;

export function findItem(doc: Content, coll: CollectionName, id: string): AnyItem | undefined {
  return (doc[coll] as unknown as AnyItem[]).find((i) => i.id === id);
}

export function itemTitle(doc: Content, coll: CollectionName, id: string): string {
  const item = findItem(doc, coll, id);
  const v = item?.[TITLE_FIELD[coll]];
  return typeof v === 'string' && v.trim() ? v : `Untitled ${COLLECTION_LABEL[coll].toLowerCase()}`;
}

export function findSection(doc: Content, page: PageKey, id: string): Section | undefined {
  return resolvePage(doc, page).find((s) => s.id === id);
}

export function findBlock(doc: Content, page: PageKey, sid: string, bid: string): { section: CustomSection; block: Block } | null {
  const s = findSection(doc, page, sid);
  if (!s || s.type !== 'custom') return null;
  const block = s.blocks.find((b) => b.id === bid);
  return block ? { section: s, block } : null;
}

function getPath(obj: unknown, path: string): unknown {
  let cur: unknown = obj;
  for (const k of path.split('.')) {
    if (!cur || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[k];
  }
  return cur;
}

/** The value a text target displays (used to decide whether inline editing is possible). */
export function readTargetValue(doc: Content, page: PageKey, target: string): unknown {
  const p = parseTarget(target);
  if (!p) return undefined;
  switch (p.t) {
    case 'item':
      return undefined;
    case 'field':
      return getPath(findItem(doc, p.coll, p.id), p.field);
    case 'profile':
      return getPath(doc.profile, p.path);
    case 'site':
      return getPath(doc.site, p.path);
    case 'section': {
      const s = findSection(doc, page, p.id);
      if (!s || !p.prop) return undefined;
      return sectionText(s, p.prop as keyof BuiltinSectionProps);
    }
    case 'block': {
      const found = findBlock(doc, page, p.sid, p.bid);
      if (!found || !p.prop) return undefined;
      return (found.block.props as Record<string, unknown>)[p.prop];
    }
  }
}

/**
 * Max length for inline edits (mirrors LIMITS in src/content/schema.ts, which the canvas can't
 * import; EditorShell type-checks these numbers against LIMITS). The server validates anyway.
 */
export const INLINE_LIMITS = { title: 120, short: 60, summary: 400, bio: 3000, blockText: 3000 } as const;

const SHORT_FIELDS = new Set(['label', 'name', 'roleBadge', 'buttonLabel', 'result', 'team', 'handle', 'demoLabel', 'timezone', 'eyebrow', 'suffix', 'primary']);
const SUMMARY_FIELDS = new Set(['summary', 'description', 'intro', 'lead', 'subtitle']);

export function inlineMaxLength(target: string): number {
  const p = parseTarget(target);
  if (!p) return INLINE_LIMITS.title;
  if (p.t === 'block') return p.prop === 'text' ? INLINE_LIMITS.blockText : p.prop === 'label' ? INLINE_LIMITS.short : INLINE_LIMITS.title;
  if (p.t === 'section' && p.prop === 'lead') return 400;
  const leaf = (p.t === 'field' ? p.field : p.t === 'profile' || p.t === 'site' ? p.path : p.t === 'section' ? (p.prop ?? '') : '').split('.').pop() ?? '';
  if (leaf === 'bio') return INLINE_LIMITS.bio;
  if (SUMMARY_FIELDS.has(leaf)) return INLINE_LIMITS.summary;
  if (SHORT_FIELDS.has(leaf)) return INLINE_LIMITS.short;
  return INLINE_LIMITS.title;
}

// ── Structure ────────────────────────────────────────────────
/** Builtin sections whose items come from `coll`. */
export function hostSectionTypes(coll: CollectionName): BuiltinSectionType[] {
  return (Object.keys(SECTION_META) as BuiltinSectionType[]).filter((t) => SECTION_META[t].collections.includes(coll));
}

/** Where new items of a collection appear (Add Component destination). */
export const ENTITY_HOST: Partial<Record<CollectionName, BuiltinSectionType>> = {
  projects: 'projects.list',
  technologies: 'projects.stack',
  achievements: 'achievements.hackathons',
  roles: 'achievements.community',
  programs: 'achievements.programs',
  education: 'about.education',
  certifications: 'about.certifications',
  socials: 'contact.main',
};

function profileSectionType(path: string): BuiltinSectionType | null {
  if (path.startsWith('hero.') || path === 'fullName') return 'home.hero';
  if (path.startsWith('about.goals')) return 'about.goals';
  if (path.startsWith('about.stats')) return 'about.stats';
  if (path.startsWith('about.')) return 'about.intro';
  if (/^contact\.(eyebrow|heading|headingAccent|intro)/.test(path)) return 'contact.header';
  if (path.startsWith('contact.')) return 'contact.main';
  return null;
}

/** The thing structural actions (move / delete / hide / duplicate) apply to. */
export function structuralTarget(target: string | null): string | null {
  const p = parseTarget(target);
  if (!p) return null;
  switch (p.t) {
    case 'field':
      return `item:${p.coll}:${p.id}`;
    case 'section':
      return `section:${p.id}`;
    case 'block':
      return galleryImageId(p.prop) ? target : `block:${p.sid}:${p.bid}`;
    default:
      return target;
  }
}

/** Logical parent (breadcrumb / Select parent from the toolbar). */
export function parentTarget(doc: Content, page: PageKey, target: string): string | null {
  const p = parseTarget(target);
  if (!p) return null;
  const sections = resolvePage(doc, page);
  const sectionOfType = (type: BuiltinSectionType | null) => {
    const s = type ? sections.find((x) => x.type === type) : undefined;
    return s ? `section:${s.id}` : null;
  };
  switch (p.t) {
    case 'field':
      return `item:${p.coll}:${p.id}`;
    case 'item': {
      const s = sections.find((x) => x.type !== 'custom' && SECTION_META[x.type].collections.includes(p.coll));
      return s ? `section:${s.id}` : null;
    }
    case 'profile':
      return sectionOfType(profileSectionType(p.path));
    case 'site':
      return null;
    case 'section':
      return p.prop ? `section:${p.id}` : null;
    case 'block':
      return p.prop ? `block:${p.sid}:${p.bid}` : `section:${p.sid}`;
  }
}

export function breadcrumb(doc: Content, page: PageKey, target: string): string[] {
  const chain = [target];
  for (let cur = parentTarget(doc, page, target), n = 0; cur && n < 6; cur = parentTarget(doc, page, cur), n++) chain.unshift(cur);
  return chain;
}

/** Human label, e.g. "Project · Study Buddy" or "Heading · Core stack". */
export function describeTarget(doc: Content, page: PageKey, target: string): string {
  const p = parseTarget(target);
  if (!p) return 'Element';
  switch (p.t) {
    case 'item':
      return `${COLLECTION_LABEL[p.coll]} · ${itemTitle(doc, p.coll, p.id)}`;
    case 'field':
      return `${FIELD_LABEL[p.field] ?? humanize(p.field)} · ${itemTitle(doc, p.coll, p.id)}`;
    case 'profile':
      return PROFILE_LABEL[p.path] ?? humanize(p.path);
    case 'site':
      return SITE_LABEL[p.path] ?? humanize(p.path);
    case 'section': {
      const s = findSection(doc, page, p.id);
      const name = s ? sectionLabel(s) : 'Section';
      return p.prop ? `${SECTION_PROP_LABEL[p.prop] ?? humanize(p.prop)} · ${name}` : `Section · ${name}`;
    }
    case 'block': {
      const found = findBlock(doc, page, p.sid, p.bid);
      const name = found ? BLOCK_LABEL[found.block.type] : 'Block';
      if (galleryImageId(p.prop)) return 'Gallery image';
      return p.prop ? `${BLOCK_PROP_LABEL[p.prop] ?? humanize(p.prop)} · ${name}` : `${name} block`;
    }
  }
}

/** Short type name for chips ("Project", "Heading block", "Section"). */
export function shortKind(target: string): string {
  const p = parseTarget(target);
  if (!p) return 'Element';
  if (p.t === 'item' || p.t === 'field') return COLLECTION_LABEL[p.coll];
  if (p.t === 'section') return p.prop ? SECTION_PROP_LABEL[p.prop] ?? 'Text' : 'Section';
  if (p.t === 'block') return galleryImageId(p.prop) ? 'Gallery image' : 'Block';
  return p.t === 'profile' ? 'Profile' : 'Site';
}

// ── Capabilities (what the toolbar / mini toolbar offers) ───
export interface Capabilities {
  edit: boolean;
  moveUp: boolean;
  moveDown: boolean;
  /** Why moving is unavailable (shown as a tooltip). */
  moveNote?: string;
  duplicate: boolean;
  hide: boolean;
  /** Current visibility (for the Hide/Show label). */
  visible: boolean;
  delete: boolean;
  deleteNote?: string;
}

const NONE: Capabilities = { edit: false, moveUp: false, moveDown: false, duplicate: false, hide: false, visible: true, delete: false };

/** Sections pinned to the top of their page (hero and page headers). */
export function isPinnedSection(s: Section): boolean {
  return s.type === 'home.hero' || (s.type !== 'custom' && s.type.endsWith('.header'));
}

/** Items in the same ordering group as `id` (the subset reordered together), in order. */
export function itemSubset(doc: Content, coll: CollectionName, id: string): string[] {
  const list = sortByOrder(doc[coll] as unknown as AnyItem[]);
  if (coll === 'technologies') {
    const cat = list.find((i) => i.id === id)?.categoryId;
    return list.filter((i) => i.categoryId === cat).map((i) => i.id);
  }
  return list.map((i) => i.id);
}

/** Reason manual ordering of a collection is unavailable on this page, or null. */
export function itemOrderNote(doc: Content, page: PageKey, coll: CollectionName): string | null {
  if (coll === 'achievements') return SECTION_META['achievements.hackathons'].orderNote ?? 'Sorted by date on the site.';
  const hosts = resolvePage(doc, page).filter((s) => s.type !== 'custom' && SECTION_META[s.type].collections.includes(coll));
  if (hosts.length > 0 && hosts.every((s) => s.type !== 'custom' && !SECTION_META[s.type].orderable)) {
    const s = hosts[0];
    return (s.type !== 'custom' && SECTION_META[s.type].orderNote) || 'Ordered automatically here.';
  }
  return null;
}

export function capabilities(doc: Content, page: PageKey, target: string | null): Capabilities {
  const st = structuralTarget(target);
  const p = parseTarget(st);
  if (!p || !target) return NONE;
  switch (p.t) {
    case 'item': {
      const item = findItem(doc, p.coll, p.id);
      if (!item) return NONE;
      const note = itemOrderNote(doc, page, p.coll);
      const subset = itemSubset(doc, p.coll, p.id);
      const i = subset.indexOf(p.id);
      return {
        edit: true,
        moveUp: !note && i > 0,
        moveDown: !note && i >= 0 && i < subset.length - 1,
        moveNote: note ?? undefined,
        duplicate: true,
        hide: true,
        visible: item.visible !== false,
        delete: true,
      };
    }
    case 'section': {
      const list = resolvePage(doc, page);
      const i = list.findIndex((s) => s.id === p.id);
      const s = list[i];
      if (!s) return NONE;
      const pinned = isPinnedSection(s);
      const prev = list[i - 1];
      return {
        edit: true,
        moveUp: !pinned && i > 0 && !!prev && !isPinnedSection(prev),
        moveDown: !pinned && i < list.length - 1,
        moveNote: pinned ? 'The hero and page headers stay at the top.' : undefined,
        duplicate: s.type === 'custom',
        hide: true,
        visible: s.visible,
        delete: s.type === 'custom',
        deleteNote: s.type === 'custom' ? undefined : 'Built-in sections can be hidden, not deleted.',
      };
    }
    case 'block': {
      const found = findBlock(doc, page, p.sid, p.bid);
      if (!found) return NONE;
      const imgId = galleryImageId(p.prop);
      if (imgId && found.block.type === 'gallery') {
        const imgs = found.block.props.images;
        const i = imgs.findIndex((x) => x.id === imgId);
        if (i < 0) return NONE;
        return { ...NONE, edit: true, moveUp: i > 0, moveDown: i < imgs.length - 1, delete: true };
      }
      const blocks = sortByOrder(found.section.blocks);
      const i = blocks.findIndex((b) => b.id === p.bid);
      return {
        edit: true,
        moveUp: i > 0,
        moveDown: i < blocks.length - 1,
        duplicate: true,
        hide: true,
        visible: found.block.visible,
        delete: true,
      };
    }
    case 'profile':
    case 'site':
      return { ...NONE, edit: true };
    default:
      return NONE;
  }
}

export const pageLabel = (p: PageKey) => PAGE_LABEL[p];
