import { ArrowUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Content } from '../../content/types';
import { SOCIAL_ICONS } from '../../content/icons';
import { isExternal, linkProps } from '../cards/shared';
import { NAV_ITEMS } from './nav';

function scrollToTop() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: 0, behavior: reduce ? 'instant' : 'smooth' });
  document.querySelector<HTMLElement>('#content')?.focus({ preventScroll: true });
}

export default function SiteFooter({ content }: { content: Content }) {
  const { site, profile, socials } = content;
  const { contact } = profile;
  const profileLinks = socials.filter((s) => s.url && s.showInContact && s.platform !== 'email');
  const place = [contact.location, contact.timezone].filter(Boolean).join(', ');
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 mt-24 border-t border-line bg-canvas">
      <div className="page-container grid gap-10 py-12 md:grid-cols-[minmax(0,1fr)_auto] md:gap-16">
        <div className="max-w-md">
          <p className="text-lg font-semibold tracking-[-0.01em] text-ink">{profile.fullName}</p>
          {contact.email && (
            <a
              href={`mailto:${contact.email}`}
              className="mt-2 inline-flex min-h-11 items-center text-ink-2 underline decoration-line-strong underline-offset-4 transition-colors hover:text-ink hover:decoration-ink"
            >
              {contact.email}
            </a>
          )}
          {place && <p className="font-mono text-xs text-ink-3">{place}</p>}
          {profileLinks.length > 0 && (
            <ul className="-mx-2.5 mt-4 flex flex-wrap items-center gap-1" aria-label="Profiles">
              {profileLinks.map((s) => {
                const Icon = SOCIAL_ICONS[s.platform];
                return (
                  <li key={s.id}>
                    <a
                      {...linkProps(s.url!)}
                      aria-label={`${s.label}${isExternal(s.url!) ? ' (opens in new tab)' : ''}`}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-control text-ink-2 transition-colors hover:bg-white/[0.05] hover:text-ink"
                    >
                      <Icon size={18} aria-hidden="true" />
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <nav aria-label="Footer">
          <ul className="grid grid-cols-2 gap-x-10 sm:grid-cols-3 md:gap-x-12">
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="inline-flex min-h-11 items-center text-sm text-ink-2 transition-colors hover:text-ink"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            {site.cv && (
              <li>
                <a
                  href={site.cv.url}
                  {...(isExternal(site.cv.url) ? { target: '_blank', rel: 'noopener noreferrer' } : { download: site.cv.fileName || true })}
                  className="inline-flex min-h-11 items-center text-sm text-ink-2 transition-colors hover:text-ink"
                >
                  Résumé (PDF)
                </a>
              </li>
            )}
          </ul>
        </nav>
      </div>

      <div className="border-t border-line">
        <div className="page-container flex flex-col-reverse gap-2 py-5 text-sm text-ink-3 sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {year} {profile.fullName}
            {site.footerText ? `. ${site.footerText.replace(/^\s*[.·-]\s*/, '')}` : ''}
          </p>
          <button
            type="button"
            onClick={scrollToTop}
            className="-ml-1 inline-flex min-h-11 items-center gap-1.5 self-start px-1 text-ink-2 transition-colors hover:text-ink sm:self-auto"
          >
            Back to top
            <ArrowUp size={15} aria-hidden="true" />
          </button>
        </div>
      </div>
    </footer>
  );
}
