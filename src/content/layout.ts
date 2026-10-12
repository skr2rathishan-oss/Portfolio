// Page layout model for the visual editor. Public, pure: no React, no zod.
// An absent `content.layout` resolves to DEFAULT_LAYOUT, which renders today's pages exactly.
import { sortByOrder } from './selectors';
import { CUSTOM_SECTION_STYLE_KEYS, SECTION_BODY_STYLE_KEYS } from './styleClasses';
import type {
  BlockType,
  BuiltinSection,
  BuiltinSectionProps,
  BuiltinSectionType,
  CollectionName,
  Content,
  PageKey,
  Section,
  SectionType,
  SiteLayout,
  StyleKey,
} from './types';

export const PAGE_KEYS = ['home', 'about', 'projects', 'achievements', 'contact'] as const satisfies readonly PageKey[];

export const PAGE_PATH: Record<PageKey, string> = {
  home: '/',
  about: '/about',
  projects: '/projects',
  achievements: '/achievements',
  contact: '/contact',
};

export const PAGE_LABEL: Record<PageKey, string> = {
  home: 'Home',
  about: 'About',
  projects: 'Projects',
  achievements: 'Achievements',
  contact: 'Contact',
};

/** '/about' -> 'about'; unknown paths -> null. Trailing slashes, search and hash are ignored. */
export function pageFromPath(pathname: string): PageKey | null {
  const clean = pathname.split(/[?#]/)[0].replace(/\/+$/, '') || '/';
  return PAGE_KEYS.find((k) => PAGE_PATH[k] === clean) ?? null;
}

export const BLOCK_TYPES = [
  'heading',
  'text',
  'image',
  'gallery',
  'button',
  'contactInfo',
  'divider',
] as const satisfies readonly BlockType[];

export const BLOCK_LABEL: Record<BlockType, string> = {
  heading: 'Heading',
  text: 'Text',
  image: 'Image',
  gallery: 'Gallery',
  button: 'Button / link',
  contactInfo: 'Contact info',
  divider: 'Divider',
};

/** Caps enforced by schema.ts (and usable by the editor without zod). */
export const LAYOUT_LIMITS = {
  sectionsPerPage: 30,
  customSectionsPerPage: 10,
  blocksPerSection: 40,
  galleryImages: 24,
  blocksTotal: 300,
  /** Text block length. */
  blockText: 3000,
  sectionLead: 400,
} as const;

export interface BuiltinSectionMeta {
  page: PageKey;
  /** Editor label, e.g. "Core stack". */
  label: string;
  /** Deterministic id used by DEFAULT_LAYOUT. */
  defaultId: string;
  /** Default copy, taken from the page JSX at 28e364b. Section components read these (single source). */
  defaultTitle?: string;
  defaultLead?: string;
  defaultSecondaryTitle?: string;
  defaultButtonLabel?: string;
  /** Which `props` overrides the editor offers. */
  props: readonly (keyof BuiltinSectionProps)[];
  /** Which style keys the section accepts. */
  styleKeys: readonly StyleKey[];
  /** Collections whose items render inside this section (for the Layers tree / Add Component). */
  collections: readonly CollectionName[];
  /** false when item order is derived (date sort, ranking, featured selection), so manual reorder is blocked. */
  orderable: boolean;
  /** Shown when `orderable` is false. */
  orderNote?: string;
}

export interface CustomSectionMeta {
  label: string;
  props: readonly ('title' | 'lead' | 'arrangement')[];
  styleKeys: readonly StyleKey[];
  collections: readonly CollectionName[];
  orderable: true;
}

const BODY = SECTION_BODY_STYLE_KEYS;
const BODY_COLS: readonly StyleKey[] = [...SECTION_BODY_STYLE_KEYS, 'columns'];

/** Built-in section metadata, in default page order. */
export const SECTION_META: Record<BuiltinSectionType, BuiltinSectionMeta> = {
  // ── Home
  'home.hero': {
    page: 'home',
    label: 'Hero',
    defaultId: 'sec_home_hero',
    props: [],
    styleKeys: [],
    collections: ['socials'],
    orderable: true,
  },
  'home.coreStack': {
    page: 'home',
    label: 'Core stack',
    defaultId: 'sec_home_core_stack',
    defaultTitle: 'Core stack',
    defaultLead: 'The tools I reach for first. Each one links to the projects that use it.',
    defaultButtonLabel: 'Full tech stack',
    props: ['title', 'lead', 'buttonLabel'],
    styleKeys: BODY,
    collections: ['technologies'],
    orderable: false,
    orderNote: 'Ranked automatically by proficiency and project count.',
  },
  'home.highlights': {
    page: 'home',
    label: 'Selected work & recent activity',
    defaultId: 'sec_home_highlights',
    defaultTitle: 'Selected work',
    defaultSecondaryTitle: 'Recent activity',
    props: ['title', 'secondaryTitle'],
    styleKeys: BODY,
    collections: ['projects', 'achievements'],
    orderable: false,
    orderNote: 'Shows featured projects and the newest achievements automatically.',
  },
  'home.contactCta': {
    page: 'home',
    label: 'Contact call-to-action',
    defaultId: 'sec_home_contact_cta',
    // The heading is the availability title when availability is enabled; otherwise this default.
    defaultTitle: 'Get in touch',
    defaultButtonLabel: 'Contact me',
    props: ['title', 'buttonLabel'],
    styleKeys: BODY,
    collections: [],
    orderable: true,
  },
  // ── About
  'about.header': {
    page: 'about',
    label: 'Page header',
    defaultId: 'sec_about_header',
    defaultTitle: 'About',
    props: ['title'],
    styleKeys: [],
    collections: [],
    orderable: true,
  },
  'about.intro': {
    page: 'about',
    label: 'Intro',
    defaultId: 'sec_about_intro',
    props: [],
    styleKeys: BODY,
    collections: [],
    orderable: true,
  },
  'about.goals': {
    page: 'about',
    label: 'Goals',
    defaultId: 'sec_about_goals',
    defaultTitle: "What I'm working towards",
    props: ['title'],
    styleKeys: BODY,
    collections: [],
    orderable: true,
  },
  'about.stats': {
    page: 'about',
    label: 'In numbers',
    defaultId: 'sec_about_stats',
    props: [],
    styleKeys: BODY,
    collections: [],
    orderable: true,
  },
  'about.education': {
    page: 'about',
    label: 'Education',
    defaultId: 'sec_about_education',
    defaultTitle: 'Education',
    defaultSecondaryTitle: 'Academic pathway',
    props: ['title', 'secondaryTitle'],
    styleKeys: BODY,
    collections: ['education', 'academicPathway'],
    orderable: true,
  },
  'about.certifications': {
    page: 'about',
    label: 'Certifications',
    defaultId: 'sec_about_certifications',
    defaultTitle: 'Certifications',
    defaultLead: "Courses and programs I've completed. Select a certificate to view it.",
    props: ['title', 'lead'],
    styleKeys: BODY_COLS,
    collections: ['certifications'],
    orderable: true,
  },
  // ── Projects
  'projects.header': {
    page: 'projects',
    label: 'Page header',
    defaultId: 'sec_projects_header',
    defaultTitle: 'Projects',
    defaultLead: "Things I've built, and the tools behind them.",
    props: ['title', 'lead'],
    styleKeys: [],
    collections: [],
    orderable: true,
  },
  'projects.stack': {
    page: 'projects',
    label: 'Tech stack',
    defaultId: 'sec_projects_stack',
    defaultTitle: 'Tech stack',
    defaultLead: 'Pick a technology to see the projects that use it. The number is how many projects use it.',
    props: ['title', 'lead'],
    styleKeys: BODY,
    collections: ['techCategories', 'technologies'],
    orderable: true,
  },
  'projects.list': {
    page: 'projects',
    label: 'Project list',
    defaultId: 'sec_projects_list',
    props: [],
    styleKeys: BODY_COLS,
    collections: ['projects', 'projectCategories'],
    orderable: true,
  },
  // ── Achievements
  'achievements.header': {
    page: 'achievements',
    label: 'Page header',
    defaultId: 'sec_achievements_header',
    defaultTitle: 'Achievements & Activities',
    defaultLead: "Hackathons and competitions I've entered, and the communities I'm part of.",
    props: ['title', 'lead'],
    styleKeys: [],
    collections: [],
    orderable: true,
  },
  'achievements.hackathons': {
    page: 'achievements',
    label: 'Hackathons & competitions',
    defaultId: 'sec_achievements_hackathons',
    defaultTitle: 'Hackathons & Competitions',
    props: ['title'],
    styleKeys: BODY,
    collections: ['achievements'],
    orderable: false,
    orderNote: 'Sorted by date on the site.',
  },
  'achievements.community': {
    page: 'achievements',
    label: 'Leadership & community',
    defaultId: 'sec_achievements_community',
    defaultTitle: 'Leadership & Community',
    props: ['title'],
    styleKeys: BODY,
    collections: ['roles'],
    orderable: true,
  },
  'achievements.programs': {
    page: 'achievements',
    label: 'Programs',
    defaultId: 'sec_achievements_programs',
    defaultTitle: 'Programs',
    props: ['title'],
    styleKeys: BODY_COLS,
    collections: ['programs'],
    orderable: true,
  },
  // ── Contact
  'contact.header': {
    page: 'contact',
    label: 'Page header',
    defaultId: 'sec_contact_header',
    // Title and lead come from profile.contact (heading / intro).
    props: [],
    styleKeys: [],
    collections: [],
    orderable: true,
  },
  'contact.main': {
    page: 'contact',
    label: 'Contact details & form',
    defaultId: 'sec_contact_main',
    props: [],
    styleKeys: ['spaceTop'],
    collections: ['socials'],
    orderable: true,
  },
};

export const CUSTOM_SECTION_META: CustomSectionMeta = {
  label: 'Custom section',
  props: ['title', 'lead', 'arrangement'],
  styleKeys: CUSTOM_SECTION_STYLE_KEYS,
  collections: [],
  orderable: true,
};

export const BUILTIN_SECTION_TYPES = Object.keys(SECTION_META) as BuiltinSectionType[];
export const SECTION_TYPES: readonly SectionType[] = [...BUILTIN_SECTION_TYPES, 'custom'];

export function isBuiltinType(type: unknown): type is BuiltinSectionType {
  return typeof type === 'string' && Object.prototype.hasOwnProperty.call(SECTION_META, type);
}

/** Built-in section types of a page, in default order. */
export function builtinTypesOf(page: PageKey): BuiltinSectionType[] {
  return BUILTIN_SECTION_TYPES.filter((t) => SECTION_META[t].page === page);
}

function defaultSections(page: PageKey): BuiltinSection[] {
  return builtinTypesOf(page).map((type, order) => ({ id: SECTION_META[type].defaultId, type, order, visible: true }));
}

/** Fresh copy of the default layout (deterministic ids, order 0..n, all visible, no props/style). */
export function defaultLayout(): SiteLayout {
  return {
    version: 1,
    pages: Object.fromEntries(PAGE_KEYS.map((p) => [p, { sections: defaultSections(p) }])) as SiteLayout['pages'],
  };
}

export const DEFAULT_LAYOUT: SiteLayout = defaultLayout();

/**
 * The sections of a page, ready to render (hidden ones included; filter on `visible`):
 *  1. stored sections (or none);
 *  2. unknown types, built-ins of another page and duplicate built-ins are dropped;
 *  3. missing built-ins are inserted after their default predecessor (built-ins can be hidden,
 *     never deleted);
 *  4. sorted by `order`. When something was inserted, orders are renumbered 0..n.
 * An absent layout yields exactly DEFAULT_LAYOUT's sections for the page.
 */
export function resolvePage(content: Pick<Content, 'layout'>, page: PageKey): Section[] {
  const stored = content.layout?.pages?.[page]?.sections ?? [];
  const seenBuiltins = new Set<BuiltinSectionType>();
  const kept: Section[] = [];
  for (const s of stored) {
    if (!s || typeof s !== 'object') continue;
    if (s.type === 'custom') {
      kept.push(s);
    } else if (isBuiltinType(s.type) && SECTION_META[s.type].page === page && !seenBuiltins.has(s.type)) {
      seenBuiltins.add(s.type);
      kept.push(s);
    }
  }
  const list = sortByOrder(kept);
  const defaults = builtinTypesOf(page);
  const missing = defaults.filter((t) => !seenBuiltins.has(t));
  if (missing.length === 0) return list;

  const usedIds = new Set(list.map((s) => s.id));
  for (const type of missing) {
    let id = SECTION_META[type].defaultId;
    for (let n = 2; usedIds.has(id); n++) id = `${SECTION_META[type].defaultId}_${n}`;
    usedIds.add(id);
    // Insert after the nearest preceding default built-in that is present; otherwise first.
    const idx = defaults.indexOf(type);
    let at = 0;
    for (let i = idx - 1; i >= 0; i--) {
      const pos = list.findIndex((s) => s.type === defaults[i]);
      if (pos >= 0) {
        at = pos + 1;
        break;
      }
    }
    list.splice(at, 0, { id, type, order: 0, visible: true });
  }
  return list.map((s, order) => (s.order === order ? s : { ...s, order }));
}

/** Section heading/lead/etc. with built-in defaults applied. */
export function sectionText(section: Section, key: keyof BuiltinSectionProps): string | undefined {
  if (section.type === 'custom') {
    return key === 'title' || key === 'lead' ? section.props[key] : undefined;
  }
  const meta = SECTION_META[section.type];
  const override = section.props?.[key];
  if (override !== undefined) return override;
  switch (key) {
    case 'title':
      return meta.defaultTitle;
    case 'lead':
      return meta.defaultLead;
    case 'secondaryTitle':
      return meta.defaultSecondaryTitle;
    case 'buttonLabel':
      return meta.defaultButtonLabel;
  }
}

/** Section label for editor UI ("Core stack", or a custom section's title). */
export function sectionLabel(section: Section): string {
  if (section.type === 'custom') return section.props.title?.trim() || CUSTOM_SECTION_META.label;
  return SECTION_META[section.type].label;
}
