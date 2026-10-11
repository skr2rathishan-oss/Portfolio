import { Calendar, ExternalLink, FileText, ZoomIn } from 'lucide-react';
import type { Certification } from '../../content/types';
import { formatDate } from '../../content/selectors';
import { cx, linkProps, MediaImage, SkillList } from './shared';

export interface CertificationCardProps {
  cert: Certification;
  /** When provided, the certificate image and an "Inspect" button open a preview. */
  onPreview?: (cert: Certification) => void;
  className?: string;
}

export default function CertificationCard({ cert, onPreview, className }: CertificationCardProps) {
  const accent = cert.accent ?? '#00abf0';
  const issued = formatDate(cert.issued);
  const image = (
    <MediaImage
      src={cert.image}
      alt={`${cert.name} certificate`}
      fallbackText={cert.issuer}
      className="w-full h-full rounded-lg bg-white/95 text-3xl"
      imgClassName="object-contain"
    />
  );
  const frameClass =
    'relative w-full aspect-[1.4/1] rounded-xl overflow-hidden p-1.5 flex items-center justify-center';
  const frameStyle = {
    border: `2px solid ${accent}75`,
    background: `radial-gradient(ellipse at center, ${accent}15 0%, rgba(6,21,36,0.9) 100%)`,
  };

  return (
    <article
      className={cx(
        'group relative rounded-2xl bg-[#061524] border border-white/[0.08] hover:border-[#00abf0]/50 p-4 sm:p-5 flex flex-col transition-colors duration-300',
        className,
      )}
    >
      <div className="relative mb-4">
        {onPreview ? (
          <button
            type="button"
            onClick={() => onPreview(cert)}
            className={cx(frameClass, 'cursor-zoom-in focus-visible:outline-2 focus-visible:outline-[#00abf0]')}
            style={frameStyle}
          >
            {image}
            <span className="sr-only">Open {cert.name} certificate preview</span>
          </button>
        ) : (
          <div className={frameClass} style={frameStyle}>
            {image}
          </div>
        )}
        {issued && (
          <span className="absolute top-3 right-3 pointer-events-none flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium text-white bg-black/70 border border-white/20">
            <Calendar size={11} className="text-[#00abf0]" aria-hidden="true" />
            <time dateTime={cert.issued}>{issued}</time>
          </span>
        )}
      </div>

      <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug mb-1">{cert.name}</h3>
      <p className="text-xs font-semibold text-gray-300 flex items-center gap-1.5 mb-2.5">
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: accent }} aria-hidden="true" />
        {cert.issuer}
      </p>
      {cert.description && <p className="text-xs text-gray-400 leading-relaxed mb-3.5 line-clamp-3">{cert.description}</p>}
      <div className="mb-4">
        <SkillList skills={cert.skills} label="Skills" />
      </div>

      {(onPreview || cert.credentialUrl || cert.pdf) && (
        <div className="pt-3 border-t border-white/[0.06] flex flex-wrap items-center gap-2.5 mt-auto">
          {onPreview && (
            <button
              type="button"
              onClick={() => onPreview(cert)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold text-gray-300 bg-white/[0.04] hover:bg-white/[0.08] hover:text-white border border-white/10 transition-colors cursor-pointer"
            >
              <ZoomIn size={13} aria-hidden="true" />
              <span>Inspect</span>
            </button>
          )}
          {cert.pdf && (
            <a
              {...linkProps(cert.pdf)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold text-gray-300 bg-white/[0.04] hover:bg-white/[0.08] hover:text-white border border-white/10 transition-colors"
            >
              <FileText size={13} aria-hidden="true" />
              <span>PDF</span>
              <span className="sr-only"> of {cert.name}</span>
            </a>
          )}
          {cert.credentialUrl && (
            <a
              {...linkProps(cert.credentialUrl)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-[#00abf0]/15 border border-[#00abf0]/50 text-[#00abf0] hover:bg-[#00abf0] hover:text-[#081b29] transition-colors"
            >
              <span>Show credential</span>
              <span className="sr-only"> for {cert.name}</span>
              <ExternalLink size={13} aria-hidden="true" />
            </a>
          )}
        </div>
      )}
    </article>
  );
}
