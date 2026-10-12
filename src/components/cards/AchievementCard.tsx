import { ArrowUpRight, Maximize2 } from 'lucide-react';
import type { Achievement, AchievementKind } from '../../content/types';
import { formatDate } from '../../content/selectors';
import type { PreviewMedia } from '../ui/Lightbox';
import { T, useEd } from '../../content/editable';
import { applyStyle, cardRules } from '../sections/sectionStyle';
import { cx, isImageUrl, linkProps, MediaImage, NewTabHint, SkillList } from './shared';

export interface AchievementCardProps {
  item: Achievement;
  /** When provided, the image (and image links such as certificates) open in a lightbox. */
  onPreview?: (media: PreviewMedia) => void;
  className?: string;
}

export const ACHIEVEMENT_KIND_LABEL: Record<AchievementKind, string> = {
  hackathon: 'Hackathon',
  competition: 'Competition',
  challenge: 'Challenge',
  award: 'Award',
};

export default function AchievementCard({ item, onPreview, className }: AchievementCardProps) {
  const date = formatDate(item.date);
  const imageAlt = `${item.title}`;
  const linkIsImage = !!item.link && isImageUrl(item.link.url);
  const ed = useEd();
  const { style } = item;
  const f = (name: string) => T.field('achievements', item.id, name);

  const image = (
    <MediaImage
      src={item.image}
      alt={onPreview ? '' : imageAlt}
      fallbackText={item.title}
      width={640}
      height={640}
      className="h-full w-full text-4xl"
      imgClassName={applyStyle('object-cover', style, [
        { key: 'imageFit', tokens: 'object-cover' },
        { key: 'imagePosition' },
      ])}
      attrs={ed(f('image'), 'image')}
    />
  );
  const frame = 'block w-full aspect-[4/3] overflow-hidden rounded-control border border-line bg-navy sm:aspect-square';

  return (
    <article
      {...ed(T.item('achievements', item.id), 'item')}
      className={cx(
        applyStyle(
          'grid gap-5 rounded-card border border-line bg-surface p-4 sm:grid-cols-[12rem_minmax(0,1fr)] sm:p-5 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-7',
          style,
          cardRules({ background: 'bg-surface', border: 'border border-line', radius: 'rounded-card' }),
        ),
        className,
      )}
    >
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

      <div className="flex min-w-0 flex-col">
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
          <span className="rounded-chip border border-line px-2 py-0.5 text-ink-2">{ACHIEVEMENT_KIND_LABEL[item.kind]}</span>
          {item.result && (
            <span className="rounded-chip border border-accent/35 bg-accent-wash px-2 py-0.5 text-ink">{item.result}</span>
          )}
        </div>

        <h3
          {...ed(f('title'), 'text')}
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
          <p {...ed(f('description'), 'text')} className="mt-3 max-w-[65ch] text-[0.9375rem] leading-relaxed text-ink-2">
            {item.description}
          </p>
        )}

        {item.skills.length > 0 && (
          <div {...ed(f('skills'), 'field')} className="mt-4">
            <SkillList skills={item.skills} label="Skills used" />
          </div>
        )}

        {item.link && (
          <div className="mt-auto pt-4">
            {linkIsImage && onPreview ? (
              <button
                {...ed(f('link'), 'link')}
                type="button"
                onClick={() =>
                  onPreview({ src: item.link!.url, alt: `${item.title} certificate`, title: item.title, caption: item.organizer })
                }
                className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-accent underline-offset-4 hover:underline"
              >
                <Maximize2 size={14} aria-hidden="true" />
                {item.link.label || 'View certificate'}
                <span className="sr-only">: {item.title}</span>
              </button>
            ) : (
              <a
                {...ed(f('link'), 'link')}
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
    </article>
  );
}
