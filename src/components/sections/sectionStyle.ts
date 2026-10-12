// Applies design-system style presets to an existing class string (sections, cards).
// Pure and public. With no relevant style key set, the base string is returned unchanged, so the
// default DOM stays byte-identical.
import { styleClass } from '../../content/styleClasses';
import type { StyleKey, StylePresets } from '../../content/types';

export interface StyleRule {
  key: StyleKey;
  /**
   * Default classes in `base` that the key replaces (they need not be contiguous). The new classes
   * go where the first of them was. Omitted or not found: the new classes are appended.
   */
  tokens?: string;
}

const words = (s: string) => s.split(/\s+/).filter(Boolean);

/** True when the value means "keep the component's own look". */
function isNoop(key: StyleKey, value: unknown): boolean {
  return (key === 'titleSize' && value === 'md') || (key === 'emphasis' && value === 'default');
}

export function applyStyle(base: string, style: StylePresets | undefined, rules: readonly StyleRule[]): string {
  if (!style) return base;
  let out: string[] | null = null;
  for (const rule of rules) {
    const value = style[rule.key];
    if (value === undefined || isNoop(rule.key, value)) continue;
    const list: string[] = out ?? words(base);
    const next = words(styleClass(rule.key, value as never));
    const toks = rule.tokens ? words(rule.tokens) : [];
    const first = list.findIndex((w) => toks.includes(w));
    const kept = list.filter((w) => !toks.includes(w));
    const at = first < 0 ? kept.length : list.slice(0, first).filter((w) => !toks.includes(w)).length;
    kept.splice(at, 0, ...next.filter((w) => !kept.includes(w)));
    out = kept;
  }
  return out ? out.join(' ') : base;
}

/** Rules for a body section's box: spacing replaces the section's own spacing token(s). */
export function bodyRules(defaults: {
  spaceTop: string;
  background?: string;
  padding?: string;
  radius?: string;
  border?: string;
}): StyleRule[] {
  return [
    { key: 'spaceTop', tokens: defaults.spaceTop },
    { key: 'background', tokens: defaults.background },
    { key: 'padding', tokens: defaults.padding },
    { key: 'radius', tokens: defaults.radius },
    { key: 'border', tokens: defaults.border },
  ];
}

/** Card rules shared by the entity cards. */
export function cardRules(defaults: { background: string; border: string; radius: string }): StyleRule[] {
  return [
    { key: 'background', tokens: defaults.background },
    { key: 'border', tokens: defaults.border },
    { key: 'radius', tokens: defaults.radius },
  ];
}
