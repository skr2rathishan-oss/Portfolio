// zod (v4) validation for the content document.
// Used by the admin UI, Netlify functions and scripts/validate-seed.ts.
// The public site must NOT import this file (keeps zod out of the public bundle).
import { z } from 'zod';
import { BLOCK_TYPES, BUILTIN_SECTION_TYPES, LAYOUT_LIMITS, PAGE_KEYS, SECTION_META, isBuiltinType } from './layout';
import { STYLE_VALUES } from './styleClasses';
import type { Block, BuiltinSectionType, Content, Section, SiteLayout, StylePresets } from './types';

// ── Limits ───────────────────────────────────────────────────
export const LIMITS = {
  title: 120,
  short: 60,
  summary: 400,
  bio: 3000,
  listItem: 120,
  list: 20,
  collection: 200,
  url: 2048,
  docBytes: 512 * 1024,
} as const;

// ── Patterns ─────────────────────────────────────────────────
export const URL_RE = /^(https?:\/\/|mailto:|\/(?!\/))/;
export const MEDIA_URL_RE = /^(https:\/\/|\/(?!\/))/;
export const HEX_COLOR_RE = /^#[0-9a-f]{6}$/;
export const DATE_YM_RE = /^\d{4}(-(0[1-9]|1[0-2]))?$/;
export const ID_RE = /^[a-z]+_[a-z0-9_]{1,60}$/;
// Control characters other than tab / newline / carriage return are never valid in plain text.
// eslint-disable-next-line no-control-regex
const CONTROL_RE = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/;

// ── Primitives ───────────────────────────────────────────────
const text = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Must be at most ${max} characters`)
    .refine((s) => !CONTROL_RE.test(s), 'Contains invalid control characters');
const reqText = (max: number) => text(max).min(1, 'Required');
const optText = (max: number) => text(max).optional();
const list = (max: number = LIMITS.list, itemMax: number = LIMITS.listItem) =>
  z.array(reqText(itemMax)).max(max, `At most ${max} items`);

export const UrlSchema = z.string().trim().max(LIMITS.url).regex(URL_RE, 'Must start with https://, http://, mailto: or /');
export const MediaUrlSchema = z.string().trim().max(LIMITS.url).regex(MEDIA_URL_RE, 'Must start with https:// or /');
export const HexColorSchema = z.string().trim().regex(HEX_COLOR_RE, 'Must be a lowercase hex colour like #00abf0');
export const DateYMSchema = z.string().trim().regex(DATE_YM_RE, 'Must be YYYY or YYYY-MM');
const idWithPrefix = (prefix: string) =>
  z
    .string()
    .regex(ID_RE, 'Invalid id')
    .refine((s) => s.startsWith(`${prefix}_`), `Id must start with "${prefix}_"`);

export const IconNameSchema = z.enum([
  'Bot', 'Cpu', 'Globe', 'Wrench', 'Database', 'Layers', 'Code2', 'Server', 'Cloud', 'Smartphone', 'Shield',
  'MapPin', 'BookOpen', 'GraduationCap', 'Languages', 'Briefcase', 'Sparkles', 'Terminal',
]);

const entity = (prefix: string) => ({
  id: idWithPrefix(prefix),
  order: z.number().int(),
  visible: z.boolean(),
});

const LinkRefSchema = z.object({ url: UrlSchema, label: optText(LIMITS.short) });
const CtaSchema = z.object({ label: reqText(LIMITS.short), to: UrlSchema });

// ── Style presets (visual editor) ────────────────────────────
// Every key is an optional enum of design-system presets (no free-form CSS).
const styleEnum = <K extends keyof typeof STYLE_VALUES>(key: K) => z.enum(STYLE_VALUES[key]).optional();
export const StylePresetsSchema = z.object({
  textSize: styleEnum('textSize'),
  fontWeight: styleEnum('fontWeight'),
  textColor: styleEnum('textColor'),
  textAlign: styleEnum('textAlign'),
  background: styleEnum('background'),
  padding: styleEnum('padding'),
  spaceTop: styleEnum('spaceTop'),
  width: styleEnum('width'),
  boxAlign: styleEnum('boxAlign'),
  radius: styleEnum('radius'),
  border: styleEnum('border'),
  imageHeight: styleEnum('imageHeight'),
  imageAspect: styleEnum('imageAspect'),
  imageFit: styleEnum('imageFit'),
  imagePosition: styleEnum('imagePosition'),
  columns: styleEnum('columns'),
  titleSize: styleEnum('titleSize'),
  titleColor: styleEnum('titleColor'),
  emphasis: styleEnum('emphasis'),
}) satisfies z.ZodType<StylePresets>;

// ── Sections ─────────────────────────────────────────────────
export const SiteSettingsSchema = z.object({
  title: reqText(LIMITS.title),
  description: reqText(LIMITS.summary),
  footerText: text(LIMITS.title),
  brand: z.object({ primary: reqText(LIMITS.short), suffix: text(LIMITS.short) }),
  cv: z
    .object({
      url: MediaUrlSchema,
      fileName: reqText(LIMITS.title),
      updatedAt: z.string().max(40).optional(),
    })
    .nullable(),
  ogImage: MediaUrlSchema.optional(),
});

export const ProfileSchema = z.object({
  fullName: reqText(LIMITS.title),
  hero: z.object({
    roleBadge: text(LIMITS.short),
    focusAreas: list(8, LIMITS.short),
    headline: reqText(LIMITS.title),
    headlineAccent: text(LIMITS.title),
    intro: text(LIMITS.summary),
    primaryCta: CtaSchema,
    secondaryCta: CtaSchema,
    image: MediaUrlSchema,
    imageAlt: reqText(LIMITS.title),
  }),
  about: z.object({
    displayName: reqText(LIMITS.title),
    tagline: text(LIMITS.title),
    bio: text(LIMITS.bio),
    image: MediaUrlSchema,
    interests: list(),
    facts: z
      .array(
        z.object({
          id: idWithPrefix('fact'),
          icon: IconNameSchema,
          label: reqText(LIMITS.short),
          value: reqText(LIMITS.listItem),
        }),
      )
      .max(LIMITS.list),
    goals: z
      .array(
        z.object({
          id: idWithPrefix('goal'),
          emoji: text(16),
          title: reqText(LIMITS.title),
          description: text(LIMITS.summary),
        }),
      )
      .max(LIMITS.list),
    stats: z
      .array(
        z.object({
          id: idWithPrefix('stat'),
          emoji: text(16),
          value: reqText(LIMITS.short),
          label: reqText(LIMITS.short),
        }),
      )
      .max(LIMITS.list),
  }),
  contact: z.object({
    eyebrow: text(LIMITS.short),
    heading: reqText(LIMITS.title),
    headingAccent: text(LIMITS.title),
    intro: text(LIMITS.summary),
    email: z.union([z.literal(''), z.string().trim().max(254).email('Invalid email')]),
    location: text(LIMITS.title),
    timezone: text(LIMITS.short),
    availability: z.object({
      enabled: z.boolean(),
      title: text(LIMITS.title),
      subtitle: text(LIMITS.title),
    }),
  }),
});

export const SocialLinkSchema = z.object({
  ...entity('soc'),
  platform: z.enum([
    'email', 'linkedin', 'github', 'instagram', 'facebook', 'x', 'youtube', 'medium', 'devto', 'ieee', 'website',
    'university', 'location', 'other',
  ]),
  label: reqText(LIMITS.short),
  handle: optText(LIMITS.listItem),
  url: UrlSchema.optional(),
  showInHero: z.boolean(),
  showInContact: z.boolean(),
  accent: HexColorSchema.optional(),
  style: StylePresetsSchema.optional(),
});

export const ProjectCategorySchema = z.object({ ...entity('pcat'), label: reqText(LIMITS.short) });

export const StackLevelSchema = z.enum(['core', 'supporting', 'exposure']);

export const ProjectSchema = z.object({
  ...entity('prj'),
  title: reqText(LIMITS.title),
  summary: reqText(LIMITS.summary),
  image: MediaUrlSchema,
  imageAlt: optText(LIMITS.title),
  stack: z.array(z.object({ techId: idWithPrefix('tec'), level: StackLevelSchema })).max(LIMITS.list),
  categoryIds: z.array(idWithPrefix('pcat')).max(LIMITS.list),
  sourceUrl: UrlSchema.optional(),
  demoUrl: UrlSchema.optional(),
  demoLabel: optText(LIMITS.short),
  highlights: list().optional(),
  date: DateYMSchema.optional(),
  featured: z.boolean(),
  style: StylePresetsSchema.optional(),
});

export const TechCategorySchema = z.object({
  ...entity('tcat'),
  title: reqText(LIMITS.title),
  subtitle: optText(LIMITS.summary),
  icon: IconNameSchema,
});

export const ProficiencySchema = z.enum(['core', 'proficient', 'familiar', 'exploring']);

export const TechnologySchema = z.object({
  ...entity('tec'),
  name: reqText(LIMITS.short),
  categoryId: idWithPrefix('tcat'),
  proficiency: ProficiencySchema,
  icon: MediaUrlSchema.optional(),
  color: HexColorSchema.optional(),
  summary: optText(LIMITS.summary),
  highlights: list().optional(),
  showInStack: z.boolean(),
  featured: z.boolean(),
  style: StylePresetsSchema.optional(),
});

export const EducationSchema = z.object({
  ...entity('edu'),
  degree: reqText(LIMITS.title),
  field: optText(LIMITS.title),
  institution: reqText(LIMITS.title),
  start: DateYMSchema,
  end: DateYMSchema.optional(),
  status: z.enum(['in-progress', 'completed']),
  logo: MediaUrlSchema.optional(),
  url: UrlSchema.optional(),
  grade: optText(LIMITS.short),
  description: optText(LIMITS.summary),
  style: StylePresetsSchema.optional(),
});

export const MilestoneSchema = z.object({
  ...entity('ms'),
  year: reqText(16),
  label: reqText(LIMITS.title),
  sub: optText(LIMITS.title),
  done: z.boolean(),
  url: UrlSchema.optional(),
});

export const CertificationSchema = z.object({
  ...entity('cert'),
  name: reqText(LIMITS.title),
  issuer: reqText(LIMITS.title),
  issued: DateYMSchema,
  expires: DateYMSchema.optional(),
  image: MediaUrlSchema,
  pdf: MediaUrlSchema.optional(),
  credentialUrl: UrlSchema.optional(),
  credentialId: optText(LIMITS.listItem),
  description: optText(LIMITS.summary),
  skills: list(),
  accent: HexColorSchema.optional(),
  featured: z.boolean(),
  style: StylePresetsSchema.optional(),
});

export const AchievementSchema = z.object({
  ...entity('ach'),
  title: reqText(LIMITS.title),
  kind: z.enum(['hackathon', 'competition', 'challenge', 'award']),
  organizer: reqText(LIMITS.title),
  date: DateYMSchema,
  result: optText(LIMITS.short),
  team: optText(LIMITS.short),
  image: MediaUrlSchema.optional(),
  description: optText(LIMITS.summary),
  skills: list(),
  link: LinkRefSchema.optional(),
  accent: HexColorSchema.optional(),
  featured: z.boolean(),
  style: StylePresetsSchema.optional(),
});

export const RoleSchema = z.object({
  ...entity('role'),
  title: reqText(LIMITS.title),
  organization: reqText(LIMITS.title),
  parentOrg: optText(LIMITS.title),
  kind: z.enum(['work', 'leadership', 'community', 'membership', 'volunteer']),
  start: DateYMSchema.optional(),
  end: z.union([DateYMSchema, z.literal('present')]).optional(),
  location: optText(LIMITS.title),
  description: optText(LIMITS.summary),
  highlights: list().optional(),
  logo: MediaUrlSchema.optional(),
  image: MediaUrlSchema.optional(),
  url: UrlSchema.optional(),
  accent: HexColorSchema.optional(),
  style: StylePresetsSchema.optional(),
});

export const ProgramSchema = z.object({
  ...entity('prog'),
  title: reqText(LIMITS.title),
  organizer: reqText(LIMITS.title),
  kind: z.enum(['bootcamp', 'fellowship', 'workshop', 'course', 'accelerator', 'exchange', 'other']),
  start: DateYMSchema,
  end: DateYMSchema.optional(),
  mode: z.enum(['online', 'in-person', 'hybrid']).optional(),
  description: optText(LIMITS.summary),
  skills: list(),
  logo: MediaUrlSchema.optional(),
  url: UrlSchema.optional(),
  certificationId: idWithPrefix('cert').optional(),
  style: StylePresetsSchema.optional(),
});

const collection = <T extends z.ZodTypeAny>(item: T) => z.array(item).max(LIMITS.collection);

// ── Layout (visual editor) ───────────────────────────────────
const blockBase = {
  id: idWithPrefix('blk'),
  order: z.number().int(),
  visible: z.boolean(),
  style: StylePresetsSchema.optional(),
};

const ImageBlockPropsSchema = z
  .object({
    src: MediaUrlSchema.optional(),
    alt: text(LIMITS.title),
    caption: optText(200),
    href: UrlSchema.optional(),
  })
  .superRefine((p, ctx) => {
    if (p.src && !p.alt) ctx.addIssue({ code: 'custom', path: ['alt'], message: 'Alt text is required when an image is set' });
  });

export const GalleryImageSchema = z.object({
  id: idWithPrefix('gimg'),
  src: MediaUrlSchema,
  alt: reqText(LIMITS.title),
  caption: optText(200),
});

export const BlockSchema = z.discriminatedUnion('type', [
  z.object({
    ...blockBase,
    type: z.literal('heading'),
    props: z.object({ text: reqText(LIMITS.title), level: z.enum(['h2', 'h3']) }),
  }),
  z.object({ ...blockBase, type: z.literal('text'), props: z.object({ text: reqText(LAYOUT_LIMITS.blockText) }) }),
  z.object({ ...blockBase, type: z.literal('image'), props: ImageBlockPropsSchema }),
  z.object({
    ...blockBase,
    type: z.literal('gallery'),
    props: z.object({
      images: z.array(GalleryImageSchema).max(LAYOUT_LIMITS.galleryImages, `At most ${LAYOUT_LIMITS.galleryImages} images`),
    }),
  }),
  z.object({
    ...blockBase,
    type: z.literal('button'),
    props: z.object({
      label: reqText(LIMITS.short),
      href: UrlSchema,
      variant: z.enum(['primary', 'secondary', 'quiet']),
      icon: z.enum(['none', 'arrow', 'external', 'download', 'mail']),
    }),
  }),
  z.object({
    ...blockBase,
    type: z.literal('contactInfo'),
    props: z.object({
      title: optText(LIMITS.title),
      showEmail: z.boolean(),
      showLocation: z.boolean(),
      showSocials: z.boolean(),
    }),
  }),
  z.object({ ...blockBase, type: z.literal('divider'), props: z.object({}) }),
]) satisfies z.ZodType<Block>;

// Keeps BLOCK_TYPES (layout.ts) and the union above in sync.
type _BlockTypesMatch = [z.infer<typeof BlockSchema>['type']] extends [(typeof BLOCK_TYPES)[number]]
  ? [(typeof BLOCK_TYPES)[number]] extends [z.infer<typeof BlockSchema>['type']]
    ? true
    : never
  : never;
const _blockTypesMatch: _BlockTypesMatch = true;
void _blockTypesMatch;

const sectionBase = {
  id: idWithPrefix('sec'),
  order: z.number().int(),
  visible: z.boolean(),
  style: StylePresetsSchema.optional(),
};

export const BuiltinSectionSchema = z.object({
  ...sectionBase,
  type: z.enum(BUILTIN_SECTION_TYPES as [BuiltinSectionType, ...BuiltinSectionType[]]),
  props: z
    .object({
      title: optText(LIMITS.title),
      lead: optText(LAYOUT_LIMITS.sectionLead),
      secondaryTitle: optText(LIMITS.title),
      buttonLabel: optText(LIMITS.short),
    })
    .optional(),
});

export const CustomSectionSchema = z.object({
  ...sectionBase,
  type: z.literal('custom'),
  props: z.object({
    title: optText(LIMITS.title),
    lead: optText(LAYOUT_LIMITS.sectionLead),
    arrangement: z.enum(['stack', 'grid']),
  }),
  blocks: z
    .array(BlockSchema)
    .max(LAYOUT_LIMITS.blocksPerSection, `At most ${LAYOUT_LIMITS.blocksPerSection} blocks per section`),
});

export const SectionSchema = z.discriminatedUnion('type', [CustomSectionSchema, BuiltinSectionSchema]) satisfies z.ZodType<Section>;

const PageLayoutSchema = z.object({
  sections: z
    .array(SectionSchema)
    .max(LAYOUT_LIMITS.sectionsPerPage, `At most ${LAYOUT_LIMITS.sectionsPerPage} sections per page`),
});

export const LayoutSchema = z.object({
  version: z.literal(1),
  pages: z.object(
    Object.fromEntries(PAGE_KEYS.map((p) => [p, PageLayoutSchema.optional()])) as Record<
      (typeof PAGE_KEYS)[number],
      z.ZodOptional<typeof PageLayoutSchema>
    >,
  ),
}) satisfies z.ZodType<SiteLayout>;

const ContentObjectSchema = z.object({
  schemaVersion: z.literal(1),
  updatedAt: z.string().max(40),
  site: SiteSettingsSchema,
  profile: ProfileSchema,
  socials: collection(SocialLinkSchema),
  projects: collection(ProjectSchema),
  projectCategories: collection(ProjectCategorySchema),
  techCategories: collection(TechCategorySchema),
  technologies: collection(TechnologySchema),
  education: collection(EducationSchema),
  academicPathway: collection(MilestoneSchema),
  certifications: collection(CertificationSchema),
  achievements: collection(AchievementSchema),
  roles: collection(RoleSchema),
  programs: collection(ProgramSchema),
  layout: LayoutSchema.optional(),
});

// ── Cross-document rules (unique ids + referential integrity) ─
type Ctx = z.RefinementCtx;

function checkIntegrity(doc: z.infer<typeof ContentObjectSchema>, ctx: Ctx) {
  const seen = new Map<string, string>();
  const claim = (id: string, path: (string | number)[]) => {
    const prev = seen.get(id);
    if (prev) {
      ctx.addIssue({ code: 'custom', path, message: `Duplicate id "${id}" (already used at ${prev})` });
    } else {
      seen.set(id, path.join('.'));
    }
  };

  const collections = [
    'socials', 'projects', 'projectCategories', 'techCategories', 'technologies', 'education',
    'academicPathway', 'certifications', 'achievements', 'roles', 'programs',
  ] as const;
  for (const key of collections) {
    (doc[key] as { id: string }[]).forEach((item, i) => claim(item.id, [key, i, 'id']));
  }
  doc.profile.about.facts.forEach((f, i) => claim(f.id, ['profile', 'about', 'facts', i, 'id']));
  doc.profile.about.goals.forEach((g, i) => claim(g.id, ['profile', 'about', 'goals', i, 'id']));
  doc.profile.about.stats.forEach((s, i) => claim(s.id, ['profile', 'about', 'stats', i, 'id']));

  // Layout: global id uniqueness, built-ins on their own page (once), caps.
  if (doc.layout) {
    let blocksTotal = 0;
    for (const page of PAGE_KEYS) {
      const sections = doc.layout.pages[page]?.sections;
      if (!sections) continue;
      const base = ['layout', 'pages', page, 'sections'];
      const builtins = new Set<string>();
      let customCount = 0;
      sections.forEach((s, i) => {
        claim(s.id, [...base, i, 'id']);
        if (s.type === 'custom') {
          customCount++;
          blocksTotal += s.blocks.length;
          s.blocks.forEach((b, j) => {
            claim(b.id, [...base, i, 'blocks', j, 'id']);
            if (b.type === 'gallery') {
              b.props.images.forEach((img, k) => claim(img.id, [...base, i, 'blocks', j, 'props', 'images', k, 'id']));
            }
          });
        } else if (isBuiltinType(s.type)) {
          if (SECTION_META[s.type].page !== page) {
            ctx.addIssue({
              code: 'custom',
              path: [...base, i, 'type'],
              message: `Section "${s.type}" belongs to the ${SECTION_META[s.type].page} page`,
            });
          } else if (builtins.has(s.type)) {
            ctx.addIssue({ code: 'custom', path: [...base, i, 'type'], message: `Section "${s.type}" appears twice` });
          }
          builtins.add(s.type);
        }
      });
      if (customCount > LAYOUT_LIMITS.customSectionsPerPage) {
        ctx.addIssue({
          code: 'custom',
          path: base,
          message: `At most ${LAYOUT_LIMITS.customSectionsPerPage} custom sections per page`,
        });
      }
    }
    if (blocksTotal > LAYOUT_LIMITS.blocksTotal) {
      ctx.addIssue({ code: 'custom', path: ['layout'], message: `At most ${LAYOUT_LIMITS.blocksTotal} blocks in total` });
    }
  }

  const techIds = new Set(doc.technologies.map((t) => t.id));
  const techCatIds = new Set(doc.techCategories.map((c) => c.id));
  const projCatIds = new Set(doc.projectCategories.map((c) => c.id));
  const certIds = new Set(doc.certifications.map((c) => c.id));

  doc.projects.forEach((p, i) => {
    const used = new Set<string>();
    p.stack.forEach((s, j) => {
      if (!techIds.has(s.techId)) {
        ctx.addIssue({ code: 'custom', path: ['projects', i, 'stack', j, 'techId'], message: `Unknown technology "${s.techId}"` });
      }
      if (used.has(s.techId)) {
        ctx.addIssue({ code: 'custom', path: ['projects', i, 'stack', j, 'techId'], message: `Technology "${s.techId}" listed twice` });
      }
      used.add(s.techId);
    });
    p.categoryIds.forEach((c, j) => {
      if (!projCatIds.has(c)) {
        ctx.addIssue({ code: 'custom', path: ['projects', i, 'categoryIds', j], message: `Unknown project category "${c}"` });
      }
    });
  });
  doc.technologies.forEach((t, i) => {
    if (!techCatIds.has(t.categoryId)) {
      ctx.addIssue({ code: 'custom', path: ['technologies', i, 'categoryId'], message: `Unknown tech category "${t.categoryId}"` });
    }
  });
  doc.programs.forEach((p, i) => {
    if (p.certificationId && !certIds.has(p.certificationId)) {
      ctx.addIssue({ code: 'custom', path: ['programs', i, 'certificationId'], message: `Unknown certification "${p.certificationId}"` });
    }
  });
}

export const ContentSchema = ContentObjectSchema.superRefine(checkIntegrity) satisfies z.ZodType<Content>;

export const EnvelopeSchema = z.object({
  rev: z.number().int().nonnegative(),
  updatedAt: z.string().max(40),
  content: ContentSchema,
});

// ── Migration ────────────────────────────────────────────────
const COLLECTION_KEYS = [
  'socials', 'projects', 'projectCategories', 'techCategories', 'technologies', 'education',
  'academicPathway', 'certifications', 'achievements', 'roles', 'programs',
] as const;

/**
 * Bring an arbitrary stored document up to the current schema version.
 * Throws if the document is not an object or has an unsupported schemaVersion.
 * The result still needs to be validated with ContentSchema.
 */
export function migrate(doc: unknown): unknown {
  if (!doc || typeof doc !== 'object' || Array.isArray(doc)) {
    throw new Error('Content document must be an object');
  }
  const input = doc as Record<string, unknown>;
  const version = input.schemaVersion ?? 1;
  if (version !== 1) {
    throw new Error(`Unsupported schemaVersion: ${String(version)}`);
  }
  const out: Record<string, unknown> = { ...input, schemaVersion: 1 };
  // Collections added later default to empty arrays.
  for (const key of COLLECTION_KEYS) {
    if (out[key] === undefined) out[key] = [];
  }
  return out;
}

// ── Helpers ──────────────────────────────────────────────────
export function byteSize(value: unknown): number {
  return new TextEncoder().encode(JSON.stringify(value)).length;
}

export type ValidationIssue = { path: string; message: string };
export type ValidationResult =
  | { success: true; data: Content }
  | { success: false; issues: ValidationIssue[] };

/** migrate + size check + schema validation. Never throws. */
export function validateContent(doc: unknown): ValidationResult {
  let migrated: unknown;
  try {
    migrated = migrate(doc);
  } catch (err) {
    return { success: false, issues: [{ path: '', message: (err as Error).message }] };
  }
  const size = byteSize(migrated);
  if (size > LIMITS.docBytes) {
    return { success: false, issues: [{ path: '', message: `Document is ${size} bytes; limit is ${LIMITS.docBytes}` }] };
  }
  const result = ContentSchema.safeParse(migrated);
  if (result.success) return { success: true, data: result.data };
  return {
    success: false,
    issues: result.error.issues.map((i) => ({ path: i.path.map(String).join('.'), message: i.message })),
  };
}
