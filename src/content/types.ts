// Content contract for the portfolio CMS.
// FROZEN after the foundation step: only additive, optional fields may be added later
// (and always together with schema.ts + seed.json).

export type ID = string; // prefixed: prj_, tec_, tcat_, pcat_, cert_, ach_, role_, prog_, edu_, ms_, soc_, fact_, goal_, stat_
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
  url?: Url;
  accent?: HexColor;
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
}

export interface ContentEnvelope {
  rev: number;
  updatedAt: string;
  content: Content;
}
