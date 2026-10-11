import { ExternalLink, FileText, Maximize2 } from 'lucide-react';
import type { Certification } from '../../content/types';
import { formatDate } from '../../content/selectors';
import { cx, linkProps, MediaImage, NewTabHint, SkillList } from './shared';

export interface CertificationCardProps {
  cert: Certification;
  /** When provided, the certificate image and a "View certificate" button open a preview. */
  onPreview?: (cert: Certification) => void;
  className?: string;
}

/** "Verify on LinkedIn" when the destination is recognisable, otherwise "Verify credential". */
export function verifyLabel(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '');
    if (host.endsWith('linkedin.com')) return 'Verify on LinkedIn';
    if (host.endsWith('devtown.in')) return 'Verify on DevTown';
    if (host.endsWith('sliit.org') || host.endsWith('sliit.lk')) return 'Verify on SLIIT';
    if (host.endsWith('educative.io')) return 'Verify on Educative';
    if (host.endsWith('github.com')) return 'View on GitHub';
    if (host.endsWith('credly.com')) return 'Verify on Credly';
  } catch {
    // relative or malformed URL: fall through
  }
  return 'Verify credential';
}

const actionClass =
  'inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold transition-colors underline-offset-4 hover:underline';

export default function CertificationCard({ cert, onPreview, className }: CertificationCardProps) {
  const issued = formatDate(cert.issued);
  const image = (
    <MediaImage
      src={cert.image}
      alt={onPreview ? '' : `${cert.name} certificate`}
      fallbackText={cert.issuer}
      width={800}
      height={600}
      className="h-full w-full text-2xl"
      imgClassName="object-contain"
    />
  );
  const frameClass =
    'relative block w-full aspect-[4/3] overflow-hidden rounded-control border border-line bg-navy p-1.5';

  return (
    <article
      className={cx(
        'grid grid-cols-[6.5rem_minmax(0,1fr)] gap-4 rounded-card border border-line bg-surface p-4 sm:grid-cols-[9rem_minmax(0,1fr)] md:grid-cols-1 md:p-5',
        className,
      )}
    >
      <div className="self-start">
        {onPreview ? (
          <button
            type="button"
            onClick={() => onPreview(cert)}
            className={cx(frameClass, 'cursor-zoom-in transition-colors hover:border-white/25')}
          >
            {image}
            <span className="sr-only">View {cert.name} certificate</span>
          </button>
        ) : (
          <div className={frameClass}>{image}</div>
        )}
      </div>

      <div className="flex min-w-0 flex-col">
        <h3 className="text-base font-semibold leading-snug text-ink text-pretty md:text-h3">{cert.name}</h3>
        <p className="mt-1 text-sm text-ink-2">{cert.issuer}</p>
        {issued && (
          <p className="mt-1 font-mono text-xs text-ink-3">
            Issued <time dateTime={cert.issued}>{issued}</time>
            {cert.credentialId && <span> · ID {cert.credentialId}</span>}
          </p>
        )}
        {cert.description && (
          <p className="mt-3 hidden text-sm leading-relaxed text-ink-2 sm:line-clamp-3">{cert.description}</p>
        )}
        {cert.skills.length > 0 && (
          <div className="mt-3">
            <SkillList skills={cert.skills} label="Skills covered" max={3} />
          </div>
        )}

        {(onPreview || cert.credentialUrl || cert.pdf) && (
          <div className="mt-auto flex flex-wrap items-center gap-x-4 pt-3">
            {cert.credentialUrl && (
              <a {...linkProps(cert.credentialUrl)} className={cx(actionClass, 'text-accent')}>
                {verifyLabel(cert.credentialUrl)}
                <ExternalLink size={14} aria-hidden="true" />
                <span className="sr-only">: {cert.name}</span>
                <NewTabHint url={cert.credentialUrl} />
              </a>
            )}
            {onPreview && (
              <button type="button" onClick={() => onPreview(cert)} className={cx(actionClass, 'text-ink-2 hover:text-ink')}>
                <Maximize2 size={14} aria-hidden="true" />
                View
                <span className="sr-only"> {cert.name} certificate</span>
              </button>
            )}
            {cert.pdf && (
              <a {...linkProps(cert.pdf)} className={cx(actionClass, 'text-ink-2 hover:text-ink')}>
                <FileText size={14} aria-hidden="true" />
                PDF
                <span className="sr-only"> of {cert.name}</span>
                <NewTabHint url={cert.pdf} />
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
