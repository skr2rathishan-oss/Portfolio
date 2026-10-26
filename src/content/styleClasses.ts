// Design-system style presets -> Tailwind classes. Public, pure: no React, no zod.
// Every class string is written out literally so Tailwind v4's source scan generates it.
// Theme tokens are the ones in index.css @theme (`signal` and `on-accent` are deliberately excluded).
import type {
  Align,
  BgColor,
  BlockType,
  BorderPreset,
  CollectionName,
  Columns,
  Emphasis,
  FontWeight,
  ImageAspect,
  ImageFit,
  ImageHeight,
  ImagePosition,
  Radius,
  Space,
  StyleKey,
  StylePresets,
  TextColor,
  TextSize,
  TitleColor,
  TitleSize,
  WidthPreset,
} from './types';

// ── Enum value lists (used by schema.ts and the editor's style controls) ──
/** Compile-time check that a literal tuple lists every member of the union `T` (and nothing else). */
const values =
  <T extends string>() =>
  <const A extends readonly T[]>(list: A & ([T] extends [A[number]] ? unknown : never)): A =>
    list;

export const TEXT_SIZES = values<TextSize>()(['sm', 'base', 'lead', 'h3', 'h2', 'h1', 'display']);
export const FONT_WEIGHTS = values<FontWeight>()(['normal', 'medium', 'semibold', 'bold']);
export const TEXT_COLORS = values<TextColor>()(['ink', 'ink-2', 'ink-3', 'accent', 'success', 'warning', 'danger']);
export const BG_COLORS = values<BgColor>()(['none', 'canvas', 'navy', 'surface', 'raised', 'accent-wash']);
export const SPACES = values<Space>()(['none', 'xs', 'sm', 'md', 'lg', 'xl']);
export const ALIGNS = values<Align>()(['left', 'center', 'right']);
export const WIDTH_PRESETS = values<WidthPreset>()(['full', 'wide', 'content', 'prose', 'narrow']);
export const IMAGE_HEIGHTS = values<ImageHeight>()(['auto', 'xs', 'sm', 'md', 'lg', 'xl']);
export const IMAGE_ASPECTS = values<ImageAspect>()(['auto', 'square', 'video', 'portrait', 'wide', 'photo']);
export const IMAGE_FITS = values<ImageFit>()(['cover', 'contain']);
export const IMAGE_POSITIONS = values<ImagePosition>()(['top', 'center', 'bottom']);
export const RADII = values<Radius>()(['none', 'chip', 'control', 'card', 'panel', 'full']);
export const BORDER_PRESETS = values<BorderPreset>()(['none', 'line', 'strong', 'accent']);
export const COLUMN_COUNTS = values<Columns>()(['1', '2', '3', '4']);
export const TITLE_SIZES = values<TitleSize>()(['sm', 'md', 'lg']);
export const TITLE_COLORS = values<TitleColor>()(['ink', 'accent']);
export const EMPHASES = values<Emphasis>()(['default', 'accent']);

/** Allowed values per style key (drives zod enums and the editor's segmented controls). */
export const STYLE_VALUES = {
  textSize: TEXT_SIZES,
  fontWeight: FONT_WEIGHTS,
  textColor: TEXT_COLORS,
  textAlign: ALIGNS,
  background: BG_COLORS,
  padding: SPACES,
  spaceTop: SPACES,
  width: WIDTH_PRESETS,
  boxAlign: ALIGNS,
  radius: RADII,
  border: BORDER_PRESETS,
  imageHeight: IMAGE_HEIGHTS,
  imageAspect: IMAGE_ASPECTS,
  imageFit: IMAGE_FITS,
  imagePosition: IMAGE_POSITIONS,
  columns: COLUMN_COUNTS,
  titleSize: TITLE_SIZES,
  titleColor: TITLE_COLORS,
  emphasis: EMPHASES,
} as const satisfies { [K in StyleKey]-?: readonly NonNullable<StylePresets[K]>[] };

export const STYLE_KEYS = Object.keys(STYLE_VALUES) as StyleKey[];

// ── Class maps ───────────────────────────────────────────────
export const TEXT_SIZE: Record<TextSize, string> = {
  sm: 'text-sm',
  base: 'text-base',
  lead: 'text-lead',
  h3: 'text-h3',
  h2: 'text-h2',
  h1: 'text-h1',
  display: 'text-display',
};
export const FONT_WEIGHT: Record<FontWeight, string> = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};
export const TEXT_COLOR: Record<TextColor, string> = {
  ink: 'text-ink',
  'ink-2': 'text-ink-2',
  'ink-3': 'text-ink-3',
  accent: 'text-accent',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
};
export const TEXT_ALIGN: Record<Align, string> = { left: 'text-left', center: 'text-center', right: 'text-right' };
export const BG: Record<BgColor, string> = {
  none: 'bg-transparent',
  canvas: 'bg-canvas',
  navy: 'bg-navy',
  surface: 'bg-surface',
  raised: 'bg-raised',
  'accent-wash': 'bg-accent-wash',
};
export const PADDING: Record<Space, string> = {
  none: 'p-0',
  xs: 'p-3',
  sm: 'p-4 sm:p-5',
  md: 'p-5 sm:p-7',
  lg: 'p-6 sm:p-10',
  xl: 'p-8 sm:p-14',
};
export const SPACE_TOP: Record<Space, string> = {
  none: 'mt-0',
  xs: 'mt-3',
  sm: 'mt-6',
  md: 'mt-10 sm:mt-12',
  lg: 'section-gap',
  xl: 'mt-24 sm:mt-32',
};
export const WIDTH: Record<WidthPreset, string> = {
  full: 'w-full',
  wide: 'w-full max-w-5xl',
  content: 'w-full max-w-3xl',
  prose: 'w-full max-w-[65ch]',
  narrow: 'w-full max-w-xl',
};
export const BOX_ALIGN: Record<Align, string> = { left: 'mr-auto', center: 'mx-auto', right: 'ml-auto' };
export const RADIUS: Record<Radius, string> = {
  none: 'rounded-none',
  chip: 'rounded-chip',
  control: 'rounded-control',
  card: 'rounded-card',
  panel: 'rounded-panel',
  full: 'rounded-full',
};
export const BORDER: Record<BorderPreset, string> = {
  none: 'border-0',
  line: 'border border-line',
  strong: 'border border-line-strong',
  accent: 'border border-accent/40',
};
export const IMAGE_HEIGHT: Record<ImageHeight, string> = {
  auto: 'h-auto',
  xs: 'h-32',
  sm: 'h-48',
  md: 'h-64',
  lg: 'h-80',
  xl: 'h-[28rem]',
};
export const IMAGE_ASPECT: Record<ImageAspect, string> = {
  auto: '',
  square: 'aspect-square',
  video: 'aspect-video',
  portrait: 'aspect-[3/4]',
  wide: 'aspect-[21/9]',
  photo: 'aspect-[16/10]',
};
export const IMAGE_FIT: Record<ImageFit, string> = { cover: 'object-cover', contain: 'object-contain' };
export const IMAGE_POSITION: Record<ImagePosition, string> = {
  top: 'object-top',
  center: 'object-center',
  bottom: 'object-bottom',
};
/** Always collapses to one (or two, for '4') columns on mobile so grids can't break. */
export const COLUMNS: Record<Columns, string> = {
  '1': 'grid-cols-1',
  '2': 'grid-cols-1 md:grid-cols-2',
  '3': 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3',
  '4': 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4',
};
/** 'md' is the card's own default (keep its existing token). */
export const TITLE_SIZE: Record<TitleSize, string> = { sm: 'text-base', md: '', lg: 'text-h2' };
export const TITLE_COLOR: Record<TitleColor, string> = { ink: 'text-ink', accent: 'text-accent' };
/** 'default' keeps the component's own tokens. */
export const EMPHASIS: Record<Emphasis, string> = { default: '', accent: 'border-accent/50 bg-accent-wash' };

/** Class map per style key. */
export const STYLE_CLASSES: { [K in StyleKey]-?: Record<NonNullable<StylePresets[K]>, string> } = {
  textSize: TEXT_SIZE,
  fontWeight: FONT_WEIGHT,
  textColor: TEXT_COLOR,
  textAlign: TEXT_ALIGN,
  background: BG,
  padding: PADDING,
  spaceTop: SPACE_TOP,
  width: WIDTH,
  boxAlign: BOX_ALIGN,
  radius: RADIUS,
  border: BORDER,
  imageHeight: IMAGE_HEIGHT,
  imageAspect: IMAGE_ASPECT,
  imageFit: IMAGE_FIT,
  imagePosition: IMAGE_POSITION,
  columns: COLUMNS,
  titleSize: TITLE_SIZE,
  titleColor: TITLE_COLOR,
  emphasis: EMPHASIS,
};

/** The class string for one style key, or '' when unset. */
export function styleClass<K extends StyleKey>(key: K, value: StylePresets[K] | undefined): string {
  if (value === undefined) return '';
  return (STYLE_CLASSES[key] as Record<string, string>)[value as string] ?? '';
}

// ── Helpers ──────────────────────────────────────────────────
export interface RestyleRule {
  key: StyleKey;
  /** The default token(s) in `base` this key replaces, e.g. 'bg-surface' or 'mt-10 sm:mt-12'. */
  token: string;
}

const words = (s: string) => s.split(/\s+/).filter(Boolean);

/**
 * Swaps default tokens in a class string for the classes of the set style keys.
 * - Returns `base` itself (same string) when none of the rules' keys is set, so the default DOM is
 *   byte-identical.
 * - A rule's `token` may be several classes; they are replaced in place as a contiguous run.
 *   When the token is not found, the new classes are appended.
 * - An empty mapped class (e.g. imageAspect 'auto', titleSize 'md') removes the token.
 */
export function restyle(base: string, style: StylePresets | undefined, rules: readonly RestyleRule[]): string {
  if (!style) return base;
  let out: string[] | null = null;
  for (const rule of rules) {
    const value = style[rule.key];
    if (value === undefined) continue;
    out ??= words(base);
    const next = words(styleClass(rule.key, value));
    const tok = words(rule.token);
    let at = -1;
    if (tok.length > 0) {
      for (let i = 0; i + tok.length <= out.length; i++) {
        if (tok.every((t, j) => out![i + j] === t)) {
          at = i;
          break;
        }
      }
    }
    if (at >= 0) out.splice(at, tok.length, ...next);
    else out.push(...next);
  }
  return out ? out.join(' ') : base;
}

/** Replaces every `grid-cols-*` token (any breakpoint) with `COLUMNS[columns]`. `base` itself when unset. */
export function swapGridCols(base: string, columns: Columns | undefined): string {
  if (columns === undefined) return base;
  const list = words(base);
  const isCols = (w: string) => /^(?:[a-z0-9]+:)*grid-cols-/.test(w);
  const at = list.findIndex(isCols);
  const kept = list.filter((w) => !isCols(w));
  const insertAt = at < 0 ? kept.length : list.slice(0, at).filter((w) => !isCols(w)).length;
  kept.splice(insertAt, 0, ...words(COLUMNS[columns]));
  return kept.join(' ');
}

const BOX_KEYS: StyleKey[] = [
  'spaceTop',
  'width',
  'boxAlign',
  'background',
  'padding',
  'radius',
  'border',
  'textSize',
  'fontWeight',
  'textColor',
  'textAlign',
];

/** Classes for a block / custom-section box from its style (keys without a value are skipped). */
export function blockBoxClasses(style: StylePresets | undefined): string {
  if (!style) return '';
  return BOX_KEYS.map((k) => styleClass(k, style[k] as never))
    .filter(Boolean)
    .join(' ');
}

/** Classes for an <img> from imageHeight / imageAspect / imageFit / imagePosition. */
export function imageClasses(style: StylePresets | undefined): string {
  if (!style) return '';
  return (['imageHeight', 'imageAspect', 'imageFit', 'imagePosition'] as const)
    .map((k) => styleClass(k, style[k] as never))
    .filter(Boolean)
    .join(' ');
}

// ── Support tables (which keys each thing accepts) ──────────
export type StyledCollection = Extract<
  CollectionName,
  'projects' | 'technologies' | 'certifications' | 'achievements' | 'roles' | 'education' | 'programs' | 'socials'
>;

export const ITEM_STYLE_SUPPORT: Record<StyledCollection, readonly StyleKey[]> = {
  projects: ['background', 'border', 'radius', 'titleSize', 'titleColor', 'imageFit', 'imageAspect', 'imagePosition'],
  certifications: ['background', 'border', 'radius', 'titleSize', 'titleColor', 'imageFit', 'imagePosition'],
  achievements: ['background', 'border', 'radius', 'titleSize', 'titleColor', 'imageFit', 'imagePosition'],
  roles: ['background', 'border', 'radius', 'titleSize', 'titleColor', 'imageFit'],
  education: ['background', 'border', 'radius', 'titleSize', 'titleColor'],
  programs: ['background', 'border', 'radius', 'titleSize', 'titleColor'],
  technologies: ['emphasis'],
  socials: ['emphasis'],
};

export const BLOCK_STYLE_SUPPORT: Record<BlockType, readonly StyleKey[]> = {
  heading: ['textSize', 'fontWeight', 'textColor', 'textAlign', 'width', 'boxAlign'],
  text: ['textSize', 'fontWeight', 'textColor', 'textAlign', 'width', 'boxAlign'],
  image: ['width', 'boxAlign', 'radius', 'border', 'imageHeight', 'imageAspect', 'imageFit', 'imagePosition'],
  gallery: ['columns', 'radius', 'imageAspect', 'imageFit', 'imagePosition'],
  button: ['textAlign'],
  contactInfo: ['background', 'padding', 'radius', 'border', 'width', 'boxAlign', 'textAlign'],
  divider: ['width', 'boxAlign'],
};

/** Body-section keys (see SECTION_META in layout.ts for the per-section lists). */
export const SECTION_BODY_STYLE_KEYS: readonly StyleKey[] = ['spaceTop', 'background', 'padding', 'radius', 'border'];
export const CUSTOM_SECTION_STYLE_KEYS: readonly StyleKey[] = [
  'spaceTop',
  'background',
  'padding',
  'radius',
  'border',
  'width',
  'boxAlign',
  'textAlign',
  'columns',
];

/** Drops undefined keys; returns undefined for an empty style (keeps documents and DOM minimal). */
export function cleanStyle(style: StylePresets | undefined): StylePresets | undefined {
  if (!style) return undefined;
  const out: StylePresets = {};
  let any = false;
  for (const k of Object.keys(style) as StyleKey[]) {
    if (style[k] !== undefined) {
      (out as Record<string, unknown>)[k] = style[k];
      any = true;
    }
  }
  return any ? out : undefined;
}
