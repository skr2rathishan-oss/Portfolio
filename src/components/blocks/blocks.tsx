// Content blocks for custom sections. Plain JSX text only (no HTML injection); every style value
// maps to a fixed design-system class (src/content/styleClasses.ts).
import { type ReactNode } from 'react';
import { ArrowRight, Download, ExternalLink, Mail, MapPin, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useContent } from '../../content/ContentProvider';
import { SOCIAL_ICONS } from '../../content/icons';
import {
  BG,
  BORDER,
  BOX_ALIGN,
  COLUMNS,
  FONT_WEIGHT,
  IMAGE_ASPECT,
  IMAGE_FIT,
  IMAGE_HEIGHT,
  IMAGE_POSITION,
  PADDING,
  RADIUS,
  TEXT_ALIGN,
  TEXT_COLOR,
  TEXT_SIZE,
  WIDTH,
} from '../../content/styleClasses';
import type {
  Block,
  ButtonBlock as ButtonBlockT,
  ContactInfoBlock as ContactInfoBlockT,
  CustomSection,
  DividerBlock as DividerBlockT,
  GalleryBlock as GalleryBlockT,
  HeadingBlock as HeadingBlockT,
  ImageBlock as ImageBlockT,
  StylePresets,
  TextBlock as TextBlockT,
} from '../../content/types';
import { cx, isExternal, linkProps, MediaImage, NewTabHint } from '../cards/shared';
import { btnPrimary, btnQuiet, btnSecondary } from '../ui/styles';

export interface BlockProps<B extends Block = Block> {
  block: B;
  section: CustomSection;
}

/** Width + horizontal placement of a block box. */
function boxClasses(style: StylePresets | undefined): string {
  return cx(style?.width && WIDTH[style.width], style?.boxAlign && BOX_ALIGN[style.boxAlign]);
}

/** Typography classes with defaults (each key replaces its default instead of stacking). */
function textClasses(
  style: StylePresets | undefined,
  defaults: { size: string; weight?: string; color: string },
): string {
  return cx(
    style?.textSize ? TEXT_SIZE[style.textSize] : defaults.size,
    style?.fontWeight ? FONT_WEIGHT[style.fontWeight] : defaults.weight,
    style?.textColor ? TEXT_COLOR[style.textColor] : defaults.color,
    style?.textAlign && TEXT_ALIGN[style.textAlign],
  );
}

export function HeadingBlock({ block, section }: BlockProps<HeadingBlockT>) {
  const { style } = block;
  const Tag = block.props.level === 'h3' ? 'h3' : 'h2';
  return (
    <div className={boxClasses(style) || undefined}>
      <Tag
        className={cx(
          'text-balance',
          textClasses(style, { size: Tag === 'h2' ? 'text-h2' : 'text-h3', color: 'text-ink' }),
        )}
      >
        {block.props.text}
      </Tag>
    </div>
  );
}

export function TextBlock({ block, section }: BlockProps<TextBlockT>) {
  const { style } = block;
  const { text } = block.props;
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  return (
    <div
      className={cx(
        'leading-relaxed',
        textClasses(style, { size: 'text-base', color: 'text-ink-2' }),
        style?.width ? WIDTH[style.width] : 'max-w-[65ch]',
        style?.boxAlign && BOX_ALIGN[style.boxAlign],
      )}
    >
      {paragraphs.length <= 1 ? (
        <p className="whitespace-pre-line">
          {text}
        </p>
      ) : (
        <div className="space-y-4">
          {paragraphs.map((p, i) => (
            <p key={i} className="whitespace-pre-line">
              {p}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

function imageFrame(style: StylePresets | undefined, defaults: { radius: string; border: string; aspect: string }) {
  return cx(
    'relative block w-full bg-navy',
    style?.radius ? RADIUS[style.radius] : defaults.radius,
    style?.border ? BORDER[style.border] : defaults.border,
    style?.imageAspect ? IMAGE_ASPECT[style.imageAspect] : defaults.aspect,
    style?.imageHeight && IMAGE_HEIGHT[style.imageHeight],
  );
}

function imageFit(style: StylePresets | undefined) {
  return cx(IMAGE_FIT[style?.imageFit ?? 'cover'], style?.imagePosition && IMAGE_POSITION[style.imagePosition]);
}

/** Internal paths use the router; everything else is a normal (new-tab when external) link. */
function SmartLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  if (/^\/(?!\/)/.test(href)) {
    return (
      <Link to={href} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <a {...linkProps(href)} className={className}>
      {children}
      <NewTabHint url={href} />
    </a>
  );
}

export function ImageBlock({ block, section }: BlockProps<ImageBlockT>) {
  const { style } = block;
  const { src, alt, caption, href } = block.props;
  if (!src) {
    return null;
  }
  const image = (
    <MediaImage
      src={src}
      alt={alt}
      fallbackText={alt || 'Image'}
      width={1200}
      height={750}
      className={imageFrame(style, { radius: 'rounded-card', border: 'border border-line', aspect: '' })}
      imgClassName={imageFit(style)}
    />
  );
  return (
    <figure className={boxClasses(style) || undefined}>
      {href ? (
        <SmartLink href={href} className="block transition-opacity hover:opacity-90">
          {image}
        </SmartLink>
      ) : (
        image
      )}
      {caption && <figcaption className="mt-2 text-sm text-ink-3">{caption}</figcaption>}
    </figure>
  );
}

export function GalleryBlock({ block, section }: BlockProps<GalleryBlockT>) {
  const { style } = block;
  const { images } = block.props;
  if (images.length === 0) {
    return null;
  }
  return (
    <div>
      <ul className={cx('grid gap-3 sm:gap-4', COLUMNS[style?.columns ?? '3'])}>
        {images.map((img) => (
          <li key={img.id} className="min-w-0">
            <figure>
              <MediaImage
                src={img.src}
                alt={img.alt}
                fallbackText={img.alt || 'Image'}
                width={800}
                height={600}
                className={imageFrame(style, { radius: 'rounded-control', border: 'border border-line', aspect: 'aspect-[4/3]' })}
                imgClassName={imageFit(style)}
              />
              {img.caption && <figcaption className="mt-1.5 text-sm text-ink-3">{img.caption}</figcaption>}
            </figure>
          </li>
        ))}
      </ul>
    </div>
  );
}

const BUTTON_ICON: Record<ButtonBlockT['props']['icon'], LucideIcon | null> = {
  none: null,
  arrow: ArrowRight,
  external: ExternalLink,
  download: Download,
  mail: Mail,
};
const BUTTON_VARIANT: Record<ButtonBlockT['props']['variant'], string> = {
  primary: btnPrimary,
  secondary: btnSecondary,
  quiet: btnQuiet,
};

export function ButtonBlock({ block, section }: BlockProps<ButtonBlockT>) {
  const { label, href, variant, icon } = block.props;
  const Icon = BUTTON_ICON[icon];
  return (
    <div
      className={block.style?.textAlign ? TEXT_ALIGN[block.style.textAlign] : undefined}
    >
      <SmartLink href={href} className={cx(BUTTON_VARIANT[variant], 'max-w-full')}>
        <span className="min-w-0 break-words">
          {label}
        </span>
        {Icon && <Icon size={16} aria-hidden="true" className="shrink-0" />}
      </SmartLink>
    </div>
  );
}

export function ContactInfoBlock({ block, section }: BlockProps<ContactInfoBlockT>) {
  const { profile, socials } = useContent();
  const { style } = block;
  const { title, showEmail, showLocation, showSocials } = block.props;
  const { contact } = profile;
  const place = [contact.location, contact.timezone].filter(Boolean).join(', ');
  const links = showSocials
    ? socials.filter((s) => s.url && s.showInContact && !['email', 'location'].includes(s.platform))
    : [];
  const email = showEmail && contact.email ? contact.email : '';
  const location = showLocation ? place : '';

  return (
    <div
      className={cx(
        'min-w-0',
        style?.background && BG[style.background],
        style?.padding && PADDING[style.padding],
        style?.radius && RADIUS[style.radius],
        style?.border && BORDER[style.border],
        style?.textAlign && TEXT_ALIGN[style.textAlign],
        boxClasses(style),
      )}
    >
      {title && (
        <h3 className="mb-3 text-h3 text-ink">
          {title}
        </h3>
      )}
      {(email || location) && (
        <dl className="space-y-2">
          {email && (
            <div className="flex items-center gap-3">
              <Mail size={18} aria-hidden="true" className="shrink-0 text-ink-3" />
              <dt className="sr-only">Email</dt>
              <dd className="min-w-0">
                <a
                  href={`mailto:${email}`}
                  className="inline-block max-w-full break-all py-0.5 font-medium text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink"
                >
                  {email}
                </a>
              </dd>
            </div>
          )}
          {location && (
            <div className="flex items-center gap-3">
              <MapPin size={18} aria-hidden="true" className="shrink-0 text-ink-3" />
              <dt className="sr-only">Based in</dt>
              <dd className="font-medium text-ink">{location}</dd>
            </div>
          )}
        </dl>
      )}
      {links.length > 0 && (
        <ul className={cx('flex flex-wrap items-center gap-2', (email || location) && 'mt-4')} aria-label="Profiles">
          {links.map((s) => {
            const Icon = SOCIAL_ICONS[s.platform];
            return (
              <li key={s.id}>
                <a
                  {...linkProps(s.url!)}
                  aria-label={`${s.label}${isExternal(s.url!) ? ' (opens in new tab)' : ''}`}
                  className="inline-flex size-11 items-center justify-center rounded-full border border-white/15 text-ink-2 transition-colors hover:border-accent/60 hover:bg-accent-wash hover:text-ink"
                >
                  <Icon size={18} aria-hidden="true" />
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function DividerBlock({ block, section }: BlockProps<DividerBlockT>) {
  return (
    <hr
      className={cx('border-0 border-t border-line', boxClasses(block.style) || 'w-full')}
    />
  );
}
