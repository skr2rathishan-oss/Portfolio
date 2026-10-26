import { ArrowUpRight, Maximize2 } from 'lucide-react';
import type { Achievement, AchievementKind } from '../../content/types';
import { formatDate } from '../../content/selectors';
import type { PreviewMedia } from '../ui/Lightbox';
import { applyStyle, cardRules } from '../sections/sectionStyle';
import PhotoGallery from './PhotoGallery';
import { cx, isImageUrl, linkProps, MediaImage, NewTabHint, SkillList } from './shared';

export interface AchievementCardProps {
  item: Achievement;
  /** Shorter card: text beside smaller photos on wide screens. */
  compact?: boolean;
  /** When provided, the image (and image links) open in a lightbox. */
  onPreview?: (media: PreviewMedia) => void;
  className?: string;
}

export const ACHIEVEMENT_KIND_LABEL: Record<AchievementKind, string> = {
  hackathon: 'Hackathon',
  competition: 'Competition',
  challenge: 'Challenge',
  award: 'Award',
  exhibition: 'Exhibition',
  program: 'Program',
  research: 'Research',
  project: 'Project',
};

export default function AchievementCard({ item, compact = false, onPreview, className }: AchievementCardProps) {
  const date = formatDate(item.date);
  const imageAlt = `${item.title}`;
  const linkIsImage = !!item.link && isImageUrl(item.link.url);
  const { style } = item;
  const gallery = item.gallery ?? [];
  const imgPresets = applyStyle('object-cover', style, [
    { key: 'imageFit', tokens: 'object-cover' },
    { key: 'imagePosition' },
  ]);

  const image = (
    <MediaImage
      src={item.image}
      alt={onPreview ? '' : imageAlt}
      fallbackText={item.title}
      width={640}
      height={640}
      className="h-full w-full text-4xl"
      imgClassName={imgPresets}
    />
  );
  const frame = 'block w-full aspect-[4/3] overflow-hidden rounded-control border border-line bg-navy sm:aspect-square';

  const hasGallery = gallery.length > 0;

  return (
    <article
      className={cx(
        applyStyle(
          hasGallery && compact
            ? 'grid gap-4 rounded-card border border-line bg-surface p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-6'
            : hasGallery
            ? 'flex flex-col gap-5 rounded-card border border-line bg-surface p-4 sm:p-5'
            : 'grid gap-5 rounded-card border border-line bg-surface p-4 sm:grid-cols-[14rem_minmax(0,1fr)] sm:p-5 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-7',
          style,
          cardRules({ background: 'bg-surface', border: 'border border-line', radius: 'rounded-card' }),
        ),
        className,
      )}
    >
      {!hasGallery && (
        <div className="self-start">
          {onPreview && item.image ? (
            <button
              type="button"
              onClick={() => onPreview({ src: item.image!, alt: imageAlt, title: item.title, caption: item.organizer })}
              className={cx(frame, 'cursor-zoom-in transition-colors hover:border-white/25')}
            >
              {image}
              <span className="sr-only">Enlarge image: {item.title}</span>
            </button>
          ) : (
            <div className={frame}>{image}</div>
          )}
        </div>
      )}

      <div className="flex min-w-0 flex-col">
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
          <span className="rounded-chip border border-line px-2 py-0.5 text-ink-2">{ACHIEVEMENT_KIND_LABEL[item.kind]}</span>
          {item.result && (
            <span className="rounded-chip border border-accent/35 bg-accent-wash px-2 py-0.5 text-ink">{item.result}</span>
          )}
        </div>

        <h3
          className={applyStyle('mt-3 text-h3 text-ink text-pretty', style, [
            { key: 'titleSize', tokens: 'text-h3' },
            { key: 'titleColor', tokens: 'text-ink' },
          ])}
        >
          {item.title}
        </h3>
        <p className="mt-1 text-sm text-ink-2">
          {item.organizer}
          {item.team && <span className="text-ink-3"> — team {item.team}</span>}
        </p>
        {date && (
          <p className="mt-1 font-mono text-xs text-ink-3">
            <time dateTime={item.date}>{date}</time>
          </p>
        )}

        {item.description && (
          <p className="mt-3 max-w-[65ch] text-[0.9375rem] leading-relaxed text-ink-2">
            {item.description}
          </p>
        )}

        {item.skills.length > 0 && (
          <div className="mt-4">
            <SkillList skills={item.skills} label="Skills used" />
          </div>
        )}

        {item.link && (
          <div className="mt-auto pt-4">
            {linkIsImage && onPreview ? (
              <button
                type="button"
                onClick={() =>
                  onPreview({ src: item.link!.url, alt: item.title, title: item.title, caption: item.organizer })
                }
                className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-accent underline-offset-4 hover:underline"
              >
                <Maximize2 size={14} aria-hidden="true" />
                {item.link.label || 'View image'}
                <span className="sr-only">: {item.title}</span>
              </button>
            ) : (
              <a
                {...linkProps(item.link.url)}
                className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-accent underline-offset-4 hover:underline"
              >
                {item.link.label || 'Learn more'}
                <ArrowUpRight size={15} aria-hidden="true" />
                <span className="sr-only">: {item.title}</span>
                <NewTabHint url={item.link.url} />
              </a>
            )}
          </div>
        )}
      </div>

      {hasGallery && (
        <PhotoGallery
          photos={gallery}
          title={item.title}
          caption={item.organizer}
          onPreview={onPreview}
          size={compact ? 'sm' : 'md'}
          imgClassName={imgPresets}
          className={compact ? 'lg:max-w-[27rem]' : undefined}
        />
      )}
    </article>
  );
}
