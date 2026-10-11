import { useMemo, useState } from 'react';
import { ExternalLink, FileText } from 'lucide-react';
import { useContent } from '../content/ContentProvider';
import { getIcon } from '../content/icons';
import type { Certification } from '../content/types';
import CertificationCard, { verifyLabel } from '../components/cards/CertificationCard';
import EducationCard from '../components/cards/EducationCard';
import { cx, linkProps, MediaImage, NewTabHint } from '../components/cards/shared';
import PageHeader, { SectionHeading } from '../components/layout/PageHeader';
import { usePageMeta } from '../components/layout/usePageMeta';
import Lightbox from '../components/ui/Lightbox';
import { formatDate } from '../content/selectors';

export default function About() {
  const { profile, education, academicPathway, certifications } = useContent();
  const { about } = profile;
  const [preview, setPreview] = useState<Certification | null>(null);

  usePageMeta({
    title: 'About',
    siteName: profile.fullName,
    description: `About ${profile.fullName}: education, background and certifications.`,
  });

  const paragraphs = useMemo(
    () =>
      about.bio
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean),
    [about.bio],
  );

  return (
    <div className="page-container">
      <PageHeader title="About" />

      {/* Intro */}
      <section aria-labelledby="intro-heading" className="mt-8 grid gap-8 sm:mt-10 md:grid-cols-[14rem_minmax(0,1fr)] md:gap-10 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-14">
        <MediaImage
          src={about.image}
          alt={`Portrait of ${profile.fullName}`}
          fallbackText={profile.fullName}
          loading="eager"
          width={576}
          height={720}
          className="aspect-[4/5] w-full max-w-[16rem] self-start rounded-panel border border-line bg-surface text-4xl md:max-w-none"
          imgClassName="object-cover object-[center_18%]"
        />
        <div className="min-w-0">
          <h2 id="intro-heading" className="text-h2 text-ink">
            {about.displayName || profile.fullName}
          </h2>
          {about.tagline && <p className="mt-1 text-ink-2">{about.tagline}</p>}
          <div className="mt-5 max-w-[65ch] space-y-4 text-base leading-relaxed text-ink-2 sm:text-lead">
            {paragraphs.map((p, i) => (
              <p key={i} className={i === 0 ? 'text-ink' : undefined}>
                {p}
              </p>
            ))}
          </div>

          {about.facts.length > 0 && (
            <dl className="mt-8 grid max-w-2xl gap-x-8 border-t border-line sm:grid-cols-2">
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
            <div className="mt-6">
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

      {/* Goals (optional) */}
      {about.goals.length > 0 && (
        <section aria-labelledby="goals-heading" className="section-gap">
          <SectionHeading id="goals-heading" title="What I'm working towards" />
          <ul className="grid gap-x-8 border-t border-line md:grid-cols-3">
            {about.goals.map((g) => (
              <li key={g.id} className="border-b border-line py-4">
                <h3 className="font-semibold text-ink">{g.title}</h3>
                {g.description && <p className="mt-1 text-sm text-ink-2">{g.description}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Stats (optional; only real, owner-entered figures) */}
      {about.stats.length > 0 && (
        <section aria-label="In numbers" className="section-gap">
          <dl className="flex flex-wrap gap-x-12 gap-y-4">
            {about.stats.map((s) => (
              <div key={s.id}>
                <dt className="text-sm text-ink-2">{s.label}</dt>
                <dd className="font-mono text-h2 text-ink">{s.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {/* Education */}
      {(education.length > 0 || academicPathway.length > 0) && (
        <section aria-labelledby="education-heading" id="education" className="section-gap">
          <SectionHeading id="education-heading" title="Education" />
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
                <h3 className="text-sm font-medium text-ink-2">Academic pathway</h3>
                <ol className="mt-4">
                  {academicPathway.map((m, i) => {
                    const last = i === academicPathway.length - 1;
                    return (
                      <li key={m.id} className="relative grid grid-cols-[3.5rem_1.25rem_minmax(0,1fr)] gap-x-3">
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
      )}

      {/* Certifications */}
      {certifications.length > 0 && (
        <section aria-labelledby="certifications-heading" id="certifications" className="section-gap">
          <SectionHeading
            id="certifications-heading"
            title="Certifications"
            lead="Courses and programs I've completed. Select a certificate to view it."
          />
          <ul className="grid gap-4 md:grid-cols-2 md:gap-5 xl:grid-cols-3">
            {certifications.map((c) => (
              <li key={c.id} className="min-w-0">
                <CertificationCard cert={c} onPreview={setPreview} className="h-full" />
              </li>
            ))}
          </ul>
        </section>
      )}

      <Lightbox
        media={
          preview
            ? {
                src: preview.image,
                alt: `${preview.name} certificate`,
                title: preview.name,
                caption: [preview.issuer, formatDate(preview.issued)].filter(Boolean).join(', '),
              }
            : null
        }
        onClose={() => setPreview(null)}
        actions={
          preview && (preview.credentialUrl || preview.pdf) ? (
            <>
              {preview.credentialUrl && (
                <a
                  {...linkProps(preview.credentialUrl)}
                  className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-accent underline-offset-4 hover:underline"
                >
                  {verifyLabel(preview.credentialUrl)}
                  <ExternalLink size={14} aria-hidden="true" />
                  <NewTabHint url={preview.credentialUrl} />
                </a>
              )}
              {preview.pdf && (
                <a
                  {...linkProps(preview.pdf)}
                  className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-ink-2 underline-offset-4 hover:text-ink hover:underline"
                >
                  <FileText size={14} aria-hidden="true" />
                  Open PDF
                  <NewTabHint url={preview.pdf} />
                </a>
              )}
            </>
          ) : undefined
        }
      />
    </div>
  );
}
