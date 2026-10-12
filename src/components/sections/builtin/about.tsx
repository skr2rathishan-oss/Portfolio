// About page built-in sections (28e364b About.tsx JSX, cut verbatim). The certificate lightbox
// stays in the page (its <dialog> must remain at the page end); sections reach its setter through
// CertificationPreviewContext.
import { createContext, useContext, useMemo } from 'react';
import { useContent } from '../../../content/ContentProvider';
import { T, useEd } from '../../../content/editable';
import { getIcon } from '../../../content/icons';
import { sectionText } from '../../../content/layout';
import { swapGridCols } from '../../../content/styleClasses';
import type { BuiltinSection, Certification } from '../../../content/types';
import CertificationCard from '../../cards/CertificationCard';
import EducationCard from '../../cards/EducationCard';
import { cx, linkProps, MediaImage, NewTabHint } from '../../cards/shared';
import PageHeader, { SectionHeading } from '../../layout/PageHeader';
import { applyStyle, bodyRules } from '../sectionStyle';

type Props = { section: BuiltinSection };

export const CertificationPreviewContext = createContext<((cert: Certification) => void) | undefined>(undefined);

export function AboutHeader({ section }: Props) {
  const ed = useEd();
  return (
    <PageHeader
      title={sectionText(section, 'title')}
      attrs={ed(T.section(section.id), 'section')}
      titleAttrs={ed(T.section(section.id, 'title'), 'text')}
    />
  );
}

export function AboutIntro({ section }: Props) {
  const { profile } = useContent();
  const ed = useEd();
  const { about } = profile;

  const paragraphs = useMemo(
    () =>
      about.bio
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean),
    [about.bio],
  );

  return (
    <section
      {...ed(T.section(section.id), 'section')}
      aria-labelledby="intro-heading"
      className={applyStyle(
        'mt-8 grid gap-8 sm:mt-10 md:grid-cols-[14rem_minmax(0,1fr)] md:gap-10 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-14',
        section.style,
        bodyRules({ spaceTop: 'mt-8 sm:mt-10' }),
      )}
    >
      <MediaImage
        src={about.image}
        alt={`Portrait of ${profile.fullName}`}
        fallbackText={profile.fullName}
        loading="eager"
        width={576}
        height={720}
        className="aspect-[4/5] w-full max-w-[16rem] self-start rounded-panel border border-line bg-surface text-4xl md:max-w-none"
        imgClassName="object-cover object-[center_18%]"
        attrs={ed(T.profile('about.image'), 'image')}
      />
      <div className="min-w-0">
        <h2 {...ed(T.profile('about.displayName'), 'text')} id="intro-heading" className="text-h2 text-ink">
          {about.displayName || profile.fullName}
        </h2>
        {about.tagline && (
          <p {...ed(T.profile('about.tagline'), 'text')} className="mt-1 text-ink-2">
            {about.tagline}
          </p>
        )}
        <div
          {...ed(T.profile('about.bio'), 'field')}
          className="mt-5 max-w-[65ch] space-y-4 text-base leading-relaxed text-ink-2 sm:text-lead"
        >
          {paragraphs.map((p, i) => (
            <p key={i} className={i === 0 ? 'text-ink' : undefined}>
              {p}
            </p>
          ))}
        </div>

        {about.facts.length > 0 && (
          <dl {...ed(T.profile('about.facts'), 'field')} className="mt-8 grid max-w-2xl gap-x-8 border-t border-line sm:grid-cols-2">
            {about.facts.map((f) => {
              const Icon = getIcon(f.icon);
              return (
                <div key={f.id} className="flex items-start gap-3 border-b border-line py-3">
                  <Icon size={18} className="mt-0.5 shrink-0 text-ink-3" aria-hidden="true" />
                  <div className="min-w-0">
                    <dt className="text-xs text-ink-3">{f.label}</dt>
                    <dd className="text-sm font-medium text-ink">{f.value}</dd>
                  </div>
                </div>
              );
            })}
          </dl>
        )}

        {about.interests.length > 0 && (
          <div {...ed(T.profile('about.interests'), 'field')} className="mt-6">
            <h3 className="text-sm font-medium text-ink-2">Interests</h3>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {about.interests.map((i) => (
                <li key={i} className="rounded-chip border border-line px-2 py-0.5 text-xs font-medium text-ink-2">
                  {i}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

export function AboutGoals({ section }: Props) {
  const { profile } = useContent();
  const ed = useEd();
  const { goals } = profile.about;
  if (goals.length === 0) return null;
  return (
    <section
      {...ed(T.section(section.id), 'section')}
      aria-labelledby="goals-heading"
      className={applyStyle('section-gap', section.style, bodyRules({ spaceTop: 'section-gap' }))}
    >
      <SectionHeading id="goals-heading" title={sectionText(section, 'title')} titleAttrs={ed(T.section(section.id, 'title'), 'text')} />
      <ul {...ed(T.profile('about.goals'), 'field')} className="grid gap-x-8 border-t border-line md:grid-cols-3">
        {goals.map((g) => (
          <li key={g.id} className="border-b border-line py-4">
            <h3 className="font-semibold text-ink">{g.title}</h3>
            {g.description && <p className="mt-1 text-sm text-ink-2">{g.description}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function AboutStats({ section }: Props) {
  const { profile } = useContent();
  const ed = useEd();
  const { stats } = profile.about;
  if (stats.length === 0) return null;
  return (
    <section
      {...ed(T.section(section.id), 'section')}
      aria-label="In numbers"
      className={applyStyle('section-gap', section.style, bodyRules({ spaceTop: 'section-gap' }))}
    >
      <dl {...ed(T.profile('about.stats'), 'field')} className="flex flex-wrap gap-x-12 gap-y-4">
        {stats.map((s) => (
          <div key={s.id}>
            <dt className="text-sm text-ink-2">{s.label}</dt>
            <dd className="font-mono text-h2 text-ink">{s.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function AboutEducation({ section }: Props) {
  const { education, academicPathway } = useContent();
  const ed = useEd();
  if (education.length === 0 && academicPathway.length === 0) return null;
  return (
    <section
      {...ed(T.section(section.id), 'section')}
      aria-labelledby="education-heading"
      id="education"
      className={applyStyle('section-gap', section.style, bodyRules({ spaceTop: 'section-gap' }))}
    >
      <SectionHeading id="education-heading" title={sectionText(section, 'title')} titleAttrs={ed(T.section(section.id, 'title'), 'text')} />
      <div className="grid gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-14">
        {education.length > 0 && (
          <ul className="space-y-4">
            {education.map((e) => (
              <li key={e.id}>
                <EducationCard education={e} />
              </li>
            ))}
          </ul>
        )}

        {academicPathway.length > 0 && (
          <div>
            <h3 {...ed(T.section(section.id, 'secondaryTitle'), 'text')} className="text-sm font-medium text-ink-2">
              {sectionText(section, 'secondaryTitle')}
            </h3>
            <ol className="mt-4">
              {academicPathway.map((m, i) => {
                const last = i === academicPathway.length - 1;
                return (
                  <li
                    key={m.id}
                    {...ed(T.item('academicPathway', m.id), 'item')}
                    className="relative grid grid-cols-[3.5rem_1.25rem_minmax(0,1fr)] gap-x-3"
                  >
                    <span className={cx('pt-0.5 font-mono text-sm', m.done ? 'text-ink-2' : 'text-ink-3')}>{m.year}</span>
                    <span className="relative flex justify-center" aria-hidden="true">
                      <span
                        className={cx(
                          'relative z-10 mt-1.5 h-3 w-3 rounded-full border-2',
                          m.done ? 'border-accent bg-accent' : 'border-ink-3 bg-canvas',
                        )}
                      />
                      {!last && <span className="absolute top-4 bottom-0 w-px bg-line-strong/40" />}
                    </span>
                    <div className={cx('min-w-0', last ? 'pb-0' : 'pb-6')}>
                      <p className="font-medium leading-snug text-ink">
                        {m.url ? (
                          <a
                            {...linkProps(m.url)}
                            className="underline decoration-line-strong underline-offset-4 hover:decoration-ink"
                          >
                            {m.label}
                            <NewTabHint url={m.url} />
                          </a>
                        ) : (
                          m.label
                        )}
                        {!m.done && <span className="ml-2 text-xs font-normal text-ink-3">(upcoming)</span>}
                      </p>
                      {m.sub && <p className="mt-0.5 text-sm text-ink-2">{m.sub}</p>}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        )}
      </div>
    </section>
  );
}

export function AboutCertifications({ section }: Props) {
  const { certifications } = useContent();
  const ed = useEd();
  const onPreview = useContext(CertificationPreviewContext);
  if (certifications.length === 0) return null;
  return (
    <section
      {...ed(T.section(section.id), 'section')}
      aria-labelledby="certifications-heading"
      id="certifications"
      className={applyStyle('section-gap', section.style, bodyRules({ spaceTop: 'section-gap' }))}
    >
      <SectionHeading
        id="certifications-heading"
        title={sectionText(section, 'title')}
        lead={sectionText(section, 'lead')}
        titleAttrs={ed(T.section(section.id, 'title'), 'text')}
        leadAttrs={ed(T.section(section.id, 'lead'), 'text')}
      />
      <ul className={swapGridCols('grid gap-4 md:grid-cols-2 md:gap-5 xl:grid-cols-3', section.style?.columns)}>
        {certifications.map((c) => (
          <li key={c.id} className="min-w-0">
            <CertificationCard cert={c} onPreview={onPreview} className="h-full" />
          </li>
        ))}
      </ul>
    </section>
  );
}
