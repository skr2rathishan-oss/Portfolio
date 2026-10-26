// TRCSL ICT Volunteer Programme: a three-stage vertical timeline (training -> placement ->
// certificate ceremony), each stage with a horizontally scrolling photo strip.
// Photos open in the page's Lightbox through PreviewContext; when mounted outside a page that
// provides it, the section renders its own Lightbox so it stays self-contained.
import { useContext, useId, useState } from 'react';
import { MapPin } from 'lucide-react';
import { TRCSL_TIMELINE, type TrcslPhoto, type TrcslStage, type TrcslTimelineData } from '../../../content/trcsl';
import type { BuiltinSection } from '../../../content/types';
import PhotoGallery from '../../cards/PhotoGallery';
import { cx } from '../../cards/shared';
import { SectionHeading } from '../../layout/PageHeader';
import Lightbox, { PreviewContext, type PreviewMedia } from '../../ui/Lightbox';
import { applyStyle, bodyRules } from '../sectionStyle';

type Open = (media: PreviewMedia) => void;

/** The stage's chosen cover photo leads the strip; the rest keep their order. */
function coverFirst(stage: TrcslStage): TrcslPhoto[] {
  const i = Math.min(Math.max(stage.cover ?? 0, 0), stage.photos.length - 1);
  return i <= 0 ? stage.photos : [stage.photos[i], ...stage.photos.filter((_, j) => j !== i)];
}

export interface TrcslTimelineProps {
  /** Optional: lets the section editor override title/lead and apply style presets. */
  section?: BuiltinSection;
  data?: TrcslTimelineData;
  className?: string;
}

export default function TrcslTimeline({ section, data = TRCSL_TIMELINE, className }: TrcslTimelineProps) {
  const pagePreview = useContext(PreviewContext);
  const [localMedia, setLocalMedia] = useState<PreviewMedia | null>(null);
  const open: Open = pagePreview ?? setLocalMedia;

  const title = section?.props?.title || data.title;
  const lead = section?.props?.lead || data.lead;

  return (
    <section
      aria-labelledby="trcsl-heading"
      id="trcsl"
      className={cx(applyStyle('section-gap', section?.style, bodyRules({ spaceTop: 'section-gap' })), className)}
    >
      <SectionHeading id="trcsl-heading" title={title} lead={lead} />

      <ol>
        {data.stages.map((stage, i) => (
          <StageItem
            key={stage.id}
            stage={stage}
            step={i + 1}
            last={i === data.stages.length - 1}
            onOpen={open}
          />
        ))}
      </ol>

      {!pagePreview && <Lightbox media={localMedia} onClose={() => setLocalMedia(null)} />}
    </section>
  );
}

function StageItem({
  stage,
  step,
  last,
  onOpen,
}: {
  stage: TrcslStage;
  step: number;
  last: boolean;
  onOpen: Open;
}) {
  const headingId = useId();
  const stepLabel = String(step).padStart(2, '0');

  return (
    <li id={stage.id} className={cx('relative grid grid-cols-[2rem_minmax(0,1fr)] gap-x-3 sm:gap-x-5', !last && 'pb-8 sm:pb-10')}>
      {/* Rail: numbered marker plus the connecting line to the next stage. */}
      <div aria-hidden="true" className="relative flex justify-center">
        {!last && <span className="absolute top-8 bottom-[-0.25rem] w-px bg-line" />}
        <span className="relative z-[1] mt-4 flex h-8 w-8 items-center justify-center rounded-full border border-accent/40 bg-accent-wash font-mono text-xs font-semibold text-accent sm:mt-5">
          {stepLabel}
        </span>
      </div>

      <article
        aria-labelledby={headingId}
        className="flex min-w-0 flex-col gap-5 rounded-card border border-line bg-surface p-4 sm:p-5"
      >
        <div className="flex min-w-0 flex-col">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
            <span className="rounded-chip border border-line px-2 py-0.5 font-medium text-ink-2">
              <span className="sr-only">Stage {step}: </span>
              {stage.label}
            </span>
            {stage.period && (
              <time dateTime={stage.periodStart} className="font-mono text-ink-3">
                {stage.period}
              </time>
            )}
          </div>

          <h3 id={headingId} className="mt-3 text-h3 text-ink text-pretty">
            {stage.title}
          </h3>
          {stage.place && (
            <p className="mt-1 flex items-start gap-1.5 text-sm text-ink-2">
              <MapPin size={14} aria-hidden="true" className="mt-[0.2em] shrink-0 text-ink-3" />
              <span>{stage.place}</span>
            </p>
          )}

          <p className="mt-3 max-w-[65ch] text-[0.9375rem] leading-relaxed text-ink-2">{stage.description}</p>

          {stage.highlights && stage.highlights.length > 0 && (
            <ul className="mt-3 max-w-[65ch] space-y-1.5 text-sm text-ink-2">
              {stage.highlights.map((h) => (
                <li key={h} className="flex gap-2">
                  <span aria-hidden="true" className="mt-[0.6em] h-1 w-1 shrink-0 rounded-full bg-accent" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {stage.photos.length > 0 && (
          <PhotoGallery
            photos={coverFirst(stage)}
            title={stage.title}
            caption={stage.label}
            onPreview={onOpen}
          />
        )}
      </article>
    </li>
  );
}

