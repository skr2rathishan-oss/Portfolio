import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Download, Menu, X } from 'lucide-react';
import { motion } from 'motion/react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import type { Content } from '../../content/types';
import { SOCIAL_ICONS } from '../../content/icons';
import { cx, isExternal, linkProps } from '../cards/shared';
import { btnSignalOutline } from '../ui/styles';
import { NAV_ITEMS } from './nav';

function Brand({ site, fullName, onClick }: { site: Content['site']; fullName: string; onClick?: () => void }) {
  return (
    <Link
      to="/"
      onClick={onClick}
      aria-label={`${fullName}, home`}
      className="inline-flex min-h-11 items-center text-xl font-bold tracking-[-0.02em] text-ink sm:text-2xl"
    >
      {site.brand.primary}
      <span className="text-accent">.</span>
      {site.brand.suffix && <span className="ml-1.5 font-medium text-ink-2">{site.brand.suffix}</span>}
    </Link>
  );
}

/** CV download. `compact` collapses it to a 44px icon circle below sm (the label stays for screen readers). */
function CvButton({
  cv,
  className,
  compact,
}: {
  cv: NonNullable<Content['site']['cv']>;
  className?: string;
  compact?: boolean;
}) {
  const external = isExternal(cv.url);
  return (
    <a
      href={cv.url}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : { download: cv.fileName || true })}
      className={cx(btnSignalOutline, className)}
    >
      <span className={compact ? 'sr-only sm:not-sr-only' : undefined}>Download CV</span>
      <Download size={16} strokeWidth={2.2} aria-hidden="true" />
      <span className="sr-only">{external ? ' (opens in new tab)' : ' (PDF download)'}</span>
    </a>
  );
}

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function SiteHeader({ content }: { content: Content }) {
  const { site, profile, socials } = content;
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const close = useCallback((returnFocus = true) => {
    setOpen(false);
    if (returnFocus) requestAnimationFrame(() => toggleRef.current?.focus());
  }, []);

  // Close on navigation.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Close if the viewport grows past the mobile breakpoint (lg).
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 64rem)');
    const onChange = () => mq.matches && setOpen(false);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // While open: lock scroll, focus the first link, trap Tab, close on Esc.
  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    panel?.querySelector<HTMLElement>('nav a')?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== 'Tab' || !panel) return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close]);

  const menuSocials = socials.filter((s) => s.url && ['email', 'github', 'linkedin'].includes(s.platform));

  return (
    <>
      <header className="header-glass sticky top-0 z-40 h-(--header-h) border-b border-line bg-navy/85 backdrop-blur-md">
        <div className="page-container flex h-full items-center justify-between gap-6 lg:grid lg:grid-cols-[1fr_auto_1fr]">
          <div className="lg:justify-self-start">
            <Brand site={site} fullName={profile.fullName} />
          </div>

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-2">
              {NAV_ITEMS.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      cx(
                        'relative inline-flex min-h-11 items-center px-3 text-[0.9375rem] font-semibold transition-colors',
                        isActive ? 'text-accent' : 'text-ink/85 hover:text-ink',
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {item.label}
                        {isActive && (
                          <motion.span
                            layoutId="nav-active"
                            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                            aria-hidden="true"
                            className="absolute inset-x-3 bottom-1.5 h-0.5 rounded-full bg-accent shadow-[0_0_8px_rgb(0_171_240/0.8)]"
                          />
                        )}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2 lg:justify-self-end">
            {site.cv && <CvButton cv={site.cv} compact className="size-11 sm:size-auto sm:px-6" />}
            <button
              ref={toggleRef}
              type="button"
              aria-expanded={open}
              aria-controls={menuId}
              aria-label="Open menu"
              onClick={() => setOpen(true)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-control text-ink transition-colors hover:bg-white/[0.06] lg:hidden"
            >
              <Menu size={22} aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu: a modal sheet. Closed = invisible, inert and out of the tab order. */}
      <div
        ref={panelRef}
        id={menuId}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        inert={!open}
        aria-hidden={!open}
        className={cx(
          'fixed inset-0 z-50 flex flex-col bg-canvas duration-200 ease-out lg:hidden',
          // Visibility flips instantly on open (so focus can move in) and only after the fade on close.
          open
            ? 'visible translate-y-0 opacity-100 transition-[opacity,transform]'
            : 'invisible -translate-y-2 opacity-0 transition-[opacity,transform,visibility]',
        )}
      >
        <div className="page-container flex h-(--header-h) shrink-0 items-center justify-between border-b border-line">
          <Brand site={site} fullName={profile.fullName} onClick={() => close(false)} />
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => close()}
            className="inline-flex h-11 w-11 items-center justify-center rounded-control text-ink transition-colors hover:bg-white/[0.06]"
          >
            <X size={22} aria-hidden="true" />
          </button>
        </div>

        <div className="page-container flex flex-1 flex-col overflow-y-auto pb-8 pt-4">
          <nav aria-label="Menu">
            <ul>
              {NAV_ITEMS.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    onClick={() => close(false)}
                    className={({ isActive }) =>
                      cx(
                        'flex min-h-14 items-center border-b border-line text-h2 transition-colors',
                        isActive ? 'text-accent' : 'text-ink',
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-auto pt-10">
            {site.cv && <CvButton cv={site.cv} className="w-full px-5" />}
            {menuSocials.length > 0 && (
              <ul className="mt-4 flex items-center justify-center gap-2" aria-label="Profiles">
                {menuSocials.map((s) => {
                  const Icon = SOCIAL_ICONS[s.platform];
                  return (
                    <li key={s.id}>
                      <a
                        {...linkProps(s.url!)}
                        aria-label={`${s.label}${isExternal(s.url!) ? ' (opens in new tab)' : ''}`}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-control text-ink-2 transition-colors hover:bg-white/[0.06] hover:text-ink"
                      >
                        <Icon size={20} aria-hidden="true" />
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
