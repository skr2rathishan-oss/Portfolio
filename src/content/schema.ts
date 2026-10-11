// zod (v4) validation for the content document.
// Used by the admin UI, Netlify functions and scripts/validate-seed.ts.
// The public site must NOT import this file (keeps zod out of the public bundle).
import { z } from 'zod';
import type { Content } from './types';

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
});

const collection = <T extends z.ZodTypeAny>(item: T) => z.array(item).max(LIMITS.collection);

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
