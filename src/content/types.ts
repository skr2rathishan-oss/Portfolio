// Content contract for the portfolio CMS.
// FROZEN after the foundation step: only additive, optional fields may be added later
// (and always together with schema.ts + seed.json).

export type ID = string; // prefixed: prj_, tec_, tcat_, pcat_, cert_, ach_, role_, prog_, edu_, ms_, soc_, fact_, goal_, stat_, sec_, blk_, gimg_
export type DateYM = string; // "YYYY" | "YYYY-MM"
export type Url = string;
export type MediaUrl = string;
export type HexColor = string;

export type IconName =
  | 'Bot'
  | 'Cpu'
  | 'Globe'
  | 'Wrench'
  | 'Database'
  | 'Layers'
  | 'Code2'
  | 'Server'
  | 'Cloud'
  | 'Smartphone'
  | 'Shield'
  | 'MapPin'
  | 'BookOpen'
  | 'GraduationCap'
  | 'Languages'
  | 'Briefcase'
  | 'Sparkles'
  | 'Terminal';

export interface Entity {
  id: ID;
  order: number;
  visible: boolean;
}

export interface LinkRef {
  url: Url;
  label?: string;
}

export interface SiteSettings {
  title: string;
  description: string;
  footerText: string;
  brand: { primary: string; suffix: string };
  cv: { url: MediaUrl; fileName: string; updatedAt?: string } | null;
  ogImage?: MediaUrl;
}

export interface Profile {
  fullName: string;
  hero: {
    roleBadge: string;
    focusAreas: string[];
    headline: string;
    headlineAccent: string;
    intro: string;
    primaryCta: { label: string; to: string };
    secondaryCta: { label: string; to: string };
    image: MediaUrl;
    imageAlt: string;
  };
  about: {
    displayName: string;
    tagline: string;
    bio: string;
    image: MediaUrl;
    interests: string[];
    facts: { id: ID; icon: IconName; label: string; value: string }[];
    goals: { id: ID; emoji: string; title: string; description: string }[];
    stats: { id: ID; emoji: string; value: string; label: string }[];
  };
  contact: {
    eyebrow: string;
    heading: string;
    headingAccent: string;
    intro: string;
    email: string;
    location: string;
    timezone: string;
    availability: { enabled: boolean; title: string; subtitle: string };
  };
}

export type SocialPlatform =
  | 'email'
  | 'linkedin'
  | 'github'
  | 'instagram'
  | 'facebook'
  | 'x'
  | 'youtube'
  | 'medium'
  | 'devto'
  | 'ieee'
  | 'website'
  | 'university'
  | 'location'
  | 'other';

export interface SocialLink extends Entity {
  platform: SocialPlatform;
  label: string;
  handle?: string;
  url?: Url;
  showInHero: boolean;
  showInContact: boolean;
  accent?: HexColor;
  /** Design-system style presets (visual editor). Absent = the default look. */
  style?: StylePresets;
}

export interface ProjectCategory extends Entity {
  label: string;
}

export type StackLevel = 'core' | 'supporting' | 'exposure';

export interface Project extends Entity {
  title: string;
  summary: string;
  image: MediaUrl;
  imageAlt?: string;
  stack: { techId: ID; level: StackLevel }[];
  categoryIds: ID[];
  sourceUrl?: Url;
  demoUrl?: Url;
  demoLabel?: string;
  highlights?: string[];
  date?: DateYM;
  featured: boolean;
  /** Design-system style presets (visual editor). Absent = the default look. */
  style?: StylePresets;
}

export interface TechCategory extends Entity {
  title: string;
  subtitle?: string;
  icon: IconName;
}

export type Proficiency = 'core' | 'proficient' | 'familiar' | 'exploring';

export interface Technology extends Entity {
  name: string;
  categoryId: ID;
  proficiency: Proficiency;
  icon?: MediaUrl;
  color?: HexColor;
  summary?: string;
  highlights?: string[];
  showInStack: boolean;
  featured: boolean;
  /** Design-system style presets (visual editor). Absent = the default look. */
  style?: StylePresets;
}

export interface Education extends Entity {
  degree: string;
  field?: string;
  institution: string;
  start: DateYM;
  end?: DateYM;
  status: 'in-progress' | 'completed';
  logo?: MediaUrl;
  url?: Url;
  grade?: string;
  description?: string;
  /** Design-system style presets (visual editor). Absent = the default look. */
  style?: StylePresets;
}

export interface Milestone extends Entity {
  year: string;
  label: string;
  sub?: string;
  done: boolean;
  url?: Url;
}

export interface Certification extends Entity {
  name: string;
  issuer: string;
  issued: DateYM;
  expires?: DateYM;
  image: MediaUrl;
  pdf?: MediaUrl;
  credentialUrl?: Url;
  credentialId?: string;
  description?: string;
  skills: string[];
  accent?: HexColor;
  featured: boolean;
  /** Design-system style presets (visual editor). Absent = the default look. */
  style?: StylePresets;
}

export type AchievementKind = 'hackathon' | 'competition' | 'challenge' | 'award';

export interface Achievement extends Entity {
  title: string;
  kind: AchievementKind;
  organizer: string;
  date: DateYM;
  result?: string;
  team?: string;
  image?: MediaUrl;
  description?: string;
  skills: string[];
  link?: LinkRef;
  accent?: HexColor;
  featured: boolean;
  /** Design-system style presets (visual editor). Absent = the default look. */
  style?: StylePresets;
}

export type RoleKind = 'work' | 'leadership' | 'community' | 'membership' | 'volunteer';

export interface Role extends Entity {
  title: string;
  organization: string;
  parentOrg?: string;
  kind: RoleKind;
  start?: DateYM;
  end?: DateYM | 'present';
  location?: string;
  description?: string;
  highlights?: string[];
  logo?: MediaUrl;
  /** Optional photo / banner shown prominently on the card (in addition to the logo). */
  image?: MediaUrl;
  url?: Url;
  accent?: HexColor;
  /** Design-system style presets (visual editor). Absent = the default look. */
  style?: StylePresets;
}

export type ProgramKind = 'bootcamp' | 'fellowship' | 'workshop' | 'course' | 'accelerator' | 'exchange' | 'other';

export interface Program extends Entity {
  title: string;
  organizer: string;
  kind: ProgramKind;
  start: DateYM;
  end?: DateYM;
  mode?: 'online' | 'in-person' | 'hybrid';
  description?: string;
  skills: string[];
  logo?: MediaUrl;
  url?: Url;
  certificationId?: ID;
  /** Design-system style presets (visual editor). Absent = the default look. */
  style?: StylePresets;
}

export interface Content {
  schemaVersion: 1;
  updatedAt: string;
  site: SiteSettings;
  profile: Profile;
  socials: SocialLink[];
  projects: Project[];
  projectCategories: ProjectCategory[];
  techCategories: TechCategory[];
  technologies: Technology[];
  education: Education[];
  academicPathway: Milestone[];
  certifications: Certification[];
  achievements: Achievement[];
  roles: Role[];
  programs: Program[];
  /** Page / section layout (visual editor). Absent = DEFAULT_LAYOUT (the built-in pages). */
  layout?: SiteLayout;
}

export interface ContentEnvelope {
  rev: number;
  updatedAt: string;
  content: Content;
}

/** Keys of the entity collections in `Content`. */
export type CollectionName =
  | 'socials'
  | 'projects'
  | 'projectCategories'
  | 'techCategories'
  | 'technologies'
  | 'education'
  | 'academicPathway'
  | 'certifications'
  | 'achievements'
  | 'roles'
  | 'programs';

// ── Visual editor: style presets ────────────────────────────
// One shape for items, sections and blocks. Support tables in styleClasses.ts decide which keys
// apply where; every value maps to a fixed design-system class (no free-form CSS).
export type PageKey = 'home' | 'about' | 'projects' | 'achievements' | 'contact';

export type TextSize = 'sm' | 'base' | 'lead' | 'h3' | 'h2' | 'h1' | 'display';
export type FontWeight = 'normal' | 'medium' | 'semibold' | 'bold';
export type TextColor = 'ink' | 'ink-2' | 'ink-3' | 'accent' | 'success' | 'warning' | 'danger';
export type BgColor = 'none' | 'canvas' | 'navy' | 'surface' | 'raised' | 'accent-wash';
export type Space = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type Align = 'left' | 'center' | 'right';
export type WidthPreset = 'full' | 'wide' | 'content' | 'prose' | 'narrow';
export type ImageHeight = 'auto' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type ImageAspect = 'auto' | 'square' | 'video' | 'portrait' | 'wide' | 'photo';
export type ImageFit = 'cover' | 'contain';
export type ImagePosition = 'top' | 'center' | 'bottom';
export type Radius = 'none' | 'chip' | 'control' | 'card' | 'panel' | 'full';
export type BorderPreset = 'none' | 'line' | 'strong' | 'accent';
export type Columns = '1' | '2' | '3' | '4';
export type TitleSize = 'sm' | 'md' | 'lg';
export type TitleColor = 'ink' | 'accent';
export type Emphasis = 'default' | 'accent';

export interface StylePresets {
  textSize?: TextSize;
  fontWeight?: FontWeight;
  textColor?: TextColor;
  textAlign?: Align;
  background?: BgColor;
  padding?: Space;
  spaceTop?: Space;
  width?: WidthPreset;
  boxAlign?: Align;
  radius?: Radius;
  border?: BorderPreset;
  imageHeight?: ImageHeight;
  imageAspect?: ImageAspect;
  imageFit?: ImageFit;
  imagePosition?: ImagePosition;
  columns?: Columns;
  titleSize?: TitleSize;
  titleColor?: TitleColor;
  emphasis?: Emphasis;
}
export type StyleKey = keyof StylePresets;

// ── Visual editor: layout ───────────────────────────────────
export type BuiltinSectionType =
  | 'home.hero'
  | 'home.coreStack'
  | 'home.highlights'
  | 'home.contactCta'
  | 'about.header'
  | 'about.intro'
  | 'about.goals'
  | 'about.stats'
  | 'about.education'
  | 'about.certifications'
  | 'projects.header'
  | 'projects.stack'
  | 'projects.list'
  | 'achievements.header'
  | 'achievements.hackathons'
  | 'achievements.community'
  | 'achievements.programs'
  | 'contact.header'
  | 'contact.main';
export type SectionType = BuiltinSectionType | 'custom';

export interface SectionBase {
  id: ID; // sec_
  order: number;
  visible: boolean;
  style?: StylePresets;
}
/** Optional text overrides for a built-in section; `SECTION_META[type].props` lists which apply. */
export interface BuiltinSectionProps {
  title?: string;
  lead?: string;
  secondaryTitle?: string;
  buttonLabel?: string;
}
export interface BuiltinSection extends SectionBase {
  type: BuiltinSectionType;
  props?: BuiltinSectionProps;
}
export interface CustomSection extends SectionBase {
  type: 'custom';
  /** `grid` lays blocks out in `style.columns` columns (default '2'). */
  props: { title?: string; lead?: string; arrangement: 'stack' | 'grid' };
  blocks: Block[];
}
export type Section = BuiltinSection | CustomSection;

export interface BlockBase {
  id: ID; // blk_
  order: number;
  visible: boolean;
  style?: StylePresets;
}
export interface GalleryImage {
  id: ID; // gimg_
  src: MediaUrl;
  alt: string;
  caption?: string;
}
export type ButtonVariant = 'primary' | 'secondary' | 'quiet';
export type ButtonIcon = 'none' | 'arrow' | 'external' | 'download' | 'mail';

export interface HeadingBlock extends BlockBase {
  type: 'heading';
  props: { text: string; level: 'h2' | 'h3' };
}
/** Plain text; a blank line separates paragraphs. */
export interface TextBlock extends BlockBase {
  type: 'text';
  props: { text: string };
}
/** Renders nothing until `src` is set; `alt` is required once it is. */
export interface ImageBlock extends BlockBase {
  type: 'image';
  props: { src?: MediaUrl; alt: string; caption?: string; href?: Url };
}
export interface GalleryBlock extends BlockBase {
  type: 'gallery';
  props: { images: GalleryImage[] };
}
export interface ButtonBlock extends BlockBase {
  type: 'button';
  props: { label: string; href: Url; variant: ButtonVariant; icon: ButtonIcon };
}
/** Reads profile.contact and socials; no duplicated data. */
export interface ContactInfoBlock extends BlockBase {
  type: 'contactInfo';
  props: { title?: string; showEmail: boolean; showLocation: boolean; showSocials: boolean };
}
export interface DividerBlock extends BlockBase {
  type: 'divider';
  props: Record<string, never>;
}
export type Block = HeadingBlock | TextBlock | ImageBlock | GalleryBlock | ButtonBlock | ContactInfoBlock | DividerBlock;
export type BlockType = Block['type'];

export interface PageLayout {
  sections: Section[];
}
export interface SiteLayout {
  version: 1;
  pages: Partial<Record<PageKey, PageLayout>>;
}
