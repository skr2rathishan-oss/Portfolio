// Design-system style presets: segmented buttons / selects per key, each with a "Default" option
// that removes the key (the stored style omits it and the element renders exactly as before).
import { useId } from 'react';
import { STYLE_VALUES } from '../../content/styleClasses';
import type { StyleKey, StylePresets } from '../../content/types';
import { cx, focusRing } from '../ui/primitives';

const KEY_LABEL: Record<StyleKey, string> = {
  textSize: 'Text size',
  fontWeight: 'Font weight',
  textColor: 'Text colour',
  textAlign: 'Text alignment',
  background: 'Background',
  padding: 'Padding',
  spaceTop: 'Space above',
  width: 'Width',
  boxAlign: 'Position',
  radius: 'Corner radius',
  border: 'Border',
  imageHeight: 'Image height',
  imageAspect: 'Image shape',
  imageFit: 'Image fit',
  imagePosition: 'Image focus',
  columns: 'Columns',
  titleSize: 'Title size',
  titleColor: 'Title colour',
  emphasis: 'Emphasis',
};

const VALUE_LABEL: Partial<Record<StyleKey, Record<string, string>>> = {
  textSize: { sm: 'Small', base: 'Body', lead: 'Lead', h3: 'H3', h2: 'H2', h1: 'H1', display: 'Display' },
  fontWeight: { normal: 'Regular', medium: 'Medium', semibold: 'Semibold', bold: 'Bold' },
  textColor: { ink: 'Primary', 'ink-2': 'Secondary', 'ink-3': 'Muted', accent: 'Accent', success: 'Success', warning: 'Warning', danger: 'Danger' },
  textAlign: { left: 'Left', center: 'Center', right: 'Right' },
  boxAlign: { left: 'Left', center: 'Center', right: 'Right' },
  background: { none: 'None', canvas: 'Page', navy: 'Navy', surface: 'Surface', raised: 'Raised', 'accent-wash': 'Accent wash' },
  padding: { none: 'None', xs: 'XS', sm: 'S', md: 'M', lg: 'L', xl: 'XL' },
  spaceTop: { none: 'None', xs: 'XS', sm: 'S', md: 'M', lg: 'L', xl: 'XL' },
  width: { full: 'Full', wide: 'Wide', content: 'Content', prose: 'Reading', narrow: 'Narrow' },
  radius: { none: 'None', chip: 'Chip', control: 'Control', card: 'Card', panel: 'Panel', full: 'Round' },
  border: { none: 'None', line: 'Line', strong: 'Strong', accent: 'Accent' },
  imageHeight: { auto: 'Auto', xs: 'XS', sm: 'S', md: 'M', lg: 'L', xl: 'XL' },
  imageAspect: { auto: 'Auto', square: 'Square', video: '16:9', portrait: '3:4', wide: '21:9', photo: '16:10' },
  imageFit: { cover: 'Fill', contain: 'Fit' },
  imagePosition: { top: 'Top', center: 'Center', bottom: 'Bottom' },
  columns: { '1': '1', '2': '2', '3': '3', '4': '4' },
  titleSize: { sm: 'Small', md: 'Medium', lg: 'Large' },
  titleColor: { ink: 'Primary', accent: 'Accent' },
  emphasis: { default: 'Default', accent: 'Accent' },
};

/** Colour swatches (theme tokens; dark site palette). */
const SWATCH: Record<string, string> = {
  ink: '#e6edf5',
  'ink-2': '#a9b8c8',
  'ink-3': '#7d8ea2',
  accent: '#00abf0',
  success: '#3ddc97',
  warning: '#f5b544',
  danger: '#ff6b6b',
  none: 'transparent',
  canvas: '#06101c',
  navy: '#0a1a2c',
  surface: '#0e2034',
  raised: '#142a42',
  'accent-wash': 'rgba(0,171,240,0.14)',
};

function Segmented({
  label,
  name,
  options,
  value,
  onChange,
  swatches,
}: {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  value: string | undefined;
  onChange: (v: string | undefined) => void;
  swatches?: boolean;
}) {
  const id = useId();
  const all = [{ value: '', label: 'Default' }, ...options];
  return (
    <fieldset className="min-w-0" data-field={`style.${name}`}>
      <legend id={id} className="mb-1.5 text-[12px] font-medium text-[#cfdbe6]">
        {label}
      </legend>
      <div role="radiogroup" aria-labelledby={id} className="flex flex-wrap gap-1">
        {all.map((o) => {
          const checked = (value ?? '') === o.value;
          return (
            <button
              key={o.value || 'default'}
              type="button"
              role="radio"
              aria-checked={checked}
              onClick={() => onChange(o.value || undefined)}
              onKeyDown={(e) => {
                if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
                e.preventDefault();
                const i = all.findIndex((x) => x.value === (value ?? ''));
                const next = all[(i + (e.key === 'ArrowRight' ? 1 : all.length - 1)) % all.length];
                onChange(next.value || undefined);
                const group = e.currentTarget.parentElement;
                requestAnimationFrame(() => (group?.querySelector('[aria-checked="true"]') as HTMLElement | null)?.focus());
              }}
              tabIndex={checked ? 0 : -1}
              className={cx(
                'inline-flex h-7 items-center gap-1.5 rounded-md border px-2 text-[12px] transition-colors',
                checked
                  ? 'border-[#00abf0] bg-[#00abf0]/15 text-white'
                  : 'border-[#1f3d5c] bg-[#0a1a2b] text-[#b8c9d9] hover:border-[#3a6690] hover:text-white',
                !o.value && !checked && 'text-[#8ea6bd]',
                focusRing,
              )}
            >
              {swatches && o.value && (
                <span
                  aria-hidden="true"
                  className="h-3 w-3 rounded-sm border border-white/20"
                  style={{ background: SWATCH[o.value] ?? 'transparent' }}
                />
              )}
              {o.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function StyleControls({
  keys,
  style,
  onChange,
  empty = 'This element has no style options.',
}: {
  keys: readonly StyleKey[];
  style: StylePresets | undefined;
  onChange: (key: StyleKey, value: string | undefined) => void;
  empty?: string;
}) {
  if (keys.length === 0) return <p className="text-sm text-[#8ea6bd]">{empty}</p>;
  const set = Object.keys(style ?? {}).length;
  return (
    <div className="space-y-4">
      {keys.map((key) => (
        <Segmented
          key={key}
          name={key}
          label={KEY_LABEL[key]}
          value={style?.[key] as string | undefined}
          onChange={(v) => onChange(key, v)}
          swatches={key === 'textColor' || key === 'background'}
          options={(STYLE_VALUES[key] as readonly string[]).map((v) => ({ value: v, label: VALUE_LABEL[key]?.[v] ?? v }))}
        />
      ))}
      {set > 0 && (
        <button
          type="button"
          onClick={() => keys.forEach((k) => style?.[k] !== undefined && onChange(k, undefined))}
          className={cx('text-[12px] text-[#8ea6bd] underline-offset-2 hover:text-white hover:underline rounded', focusRing)}
        >
          Reset all to default
        </button>
      )}
    </div>
  );
}
