import { useEffect, useState } from 'react';
import { ArrowRight, Code2, ExternalLink, Terminal } from 'lucide-react';
import { motion, type Variants } from 'motion/react';
import { Link } from 'react-router-dom';
import type { Profile, SocialLink } from '../../content/types';
import { SOCIAL_ICONS } from '../../content/icons';
import { cx, isExternal, linkProps, Monogram, NewTabHint } from '../cards/shared';

export interface HeroProps {
  profile: Profile;
  socials: SocialLink[];
  /** Kept for API compatibility; the CV link lives in the site header. */
  cvUrl?: string;
  className?: string;
  /** Fill the first screen (below the header) from the lg breakpoint. Only the public Home passes it. */
  fullHeight?: boolean;
}

const HERO_SEEN_KEY = 'hero-intro-played';
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

const socialList: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

const socialItem: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE } },
};

const ctaPrimary =
  'group inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-accent px-7 sm:px-8 text-sm sm:text-[0.9375rem] font-bold text-on-accent ' +
  'shadow-[0_0_20px_rgb(0_171_240/0.3)] transition-[background-color,box-shadow,translate] duration-200 ' +
  'hover:-translate-y-0.5 hover:bg-accent-hover hover:shadow-[0_0_26px_rgb(0_171_240/0.5)] active:translate-y-px';

const ctaSecondary =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-accent/40 px-7 sm:px-8 text-sm sm:text-[0.9375rem] font-bold text-ink ' +
  'transition-[background-color,border-color,box-shadow,translate] duration-200 ' +
  'hover:-translate-y-0.5 hover:border-accent hover:bg-accent/10 hover:shadow-[0_0_15px_rgb(0_171_240/0.2)] active:translate-y-px';

const ctaIcon = 'transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5';

/** The entrance plays once per browser session, not on every return to Home. */
function useIntroOnce(): boolean {
  const [play] = useState(() => {
    try {
      return window.sessionStorage.getItem(HERO_SEEN_KEY) !== '1';
    } catch {
      return true;
    }
  });
  useEffect(() => {
    try {
      window.sessionStorage.setItem(HERO_SEEN_KEY, '1');
    } catch {
      // storage unavailable: the intro simply plays again next time
    }
  }, []);
  return play;
}

function Cta({ to, label, primary }: { to: string; label: string; primary?: boolean }) {
  const className = primary ? ctaPrimary : ctaSecondary;
  if (/^\/(?!\/)/.test(to)) {
    return (
      <Link to={to} className={className}>
        {label}
        {primary && <ArrowRight size={16} aria-hidden="true" className={ctaIcon} />}
      </Link>
    );
  }
  return (
    <a {...linkProps(to)} className={className}>
      {label}
      {primary && <ExternalLink size={16} aria-hidden="true" className={ctaIcon} />}
      <NewTabHint url={to} />
    </a>
  );
}

export default function Hero({ profile, socials, className, fullHeight }: HeroProps) {
  const { hero, fullName } = profile;
  const heroSocials = socials.filter((s) => s.showInHero && s.url);
  const animate = useIntroOnce();
  const motionProps = animate ? { initial: 'hidden' as const, animate: 'visible' as const } : {};
  const [imageFailed, setImageFailed] = useState(false);

  // A new image (admin preview) gets a fresh chance to load.
  useEffect(() => setImageFailed(false), [hero.image]);

  return (
    <section
      aria-labelledby="hero-heading"
      className={cx(
        'grid items-center gap-12 pt-8 pb-14 sm:gap-14 sm:pt-12 sm:pb-16',
        'lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-12 lg:py-12 xl:gap-16',
        fullHeight && 'lg:min-h-[min(calc(100svh-var(--header-h)),56rem)]',
        className,
      )}
    >
      <motion.div variants={container} {...motionProps} className="flex min-w-0 flex-col items-start">
        {hero.roleBadge && (
          <motion.p
            variants={item}
            className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-accent/25 bg-white/[0.04] px-3 py-1.5 font-mono text-xs shadow-[0_0_15px_rgb(0_171_240/0.1)] backdrop-blur-sm sm:gap-2 sm:px-3.5"
          >
            <Terminal size={13} aria-hidden="true" className="shrink-0 text-accent" />
            <span aria-hidden="true" className="hidden text-ink-3 sm:inline">
              const
            </span>
            <span aria-hidden="true" className="font-semibold text-accent">
              engineer
            </span>
            <span aria-hidden="true" className="text-ink-3">
              =
            </span>
            <span className="min-w-0 truncate font-medium text-success">
              <span aria-hidden="true">"</span>
              {hero.roleBadge}
              <span aria-hidden="true">"</span>
            </span>
            <span aria-hidden="true" className="ml-0.5 size-1.5 shrink-0 rounded-full bg-success motion-safe:animate-pulse" />
          </motion.p>
        )}

        {hero.focusAreas.length > 0 && (
          <motion.div
            variants={item}
            className="mt-5 flex items-start gap-2 font-mono text-xs font-bold uppercase tracking-[0.25em] text-accent lg:text-[0.8125rem] xl:text-sm"
          >
            <Code2 size={14} aria-hidden="true" className="mt-px shrink-0" />
            {/* Every item carries a separator dot; the list is pulled left by (dot + gap) and clipped,
                so the dot that starts each visual line is hidden and wraps never leave an orphaned dot. */}
            <div className="min-w-0 overflow-x-clip">
              <ul
                aria-label="Focus areas"
                className="-ml-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 sm:-ml-5 sm:gap-x-4 xl:-ml-6 xl:gap-x-5"
              >
                {hero.focusAreas.map((area) => (
                  <li
                    key={area}
                    className="flex items-center gap-3 before:block before:size-1 before:shrink-0 before:rounded-full before:bg-accent/60 before:content-[''] sm:gap-4 xl:gap-5"
                  >
                    {area}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}

        <motion.h1 id="hero-heading" variants={item} className="mt-4 text-hero text-pretty sm:mt-5">
          <span className="sr-only">{fullName}: </span>
          <span className="block text-ink">{hero.headline}</span>{' '}
          {hero.headlineAccent && <span className="block text-accent">{hero.headlineAccent}</span>}
        </motion.h1>

        {hero.intro && (
          <motion.p variants={item} className="mt-5 max-w-[36rem] text-base leading-relaxed text-ink-2">
            {hero.intro}
          </motion.p>
        )}

        <motion.div variants={item} className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
          <Cta to={hero.primaryCta.to} label={hero.primaryCta.label} primary />
          <Cta to={hero.secondaryCta.to} label={hero.secondaryCta.label} />
        </motion.div>

        {heroSocials.length > 0 && (
          <motion.ul variants={socialList} aria-label="Profiles" className="mt-8 flex flex-wrap items-center gap-3">
            {heroSocials.map((s) => {
              const Icon = SOCIAL_ICONS[s.platform];
              return (
                <motion.li key={s.id} variants={socialItem}>
                  <a
                    {...linkProps(s.url!)}
                    aria-label={`${s.label}${isExternal(s.url!) ? ' (opens in new tab)' : ''}`}
                    className="inline-flex size-11 items-center justify-center rounded-full border border-white/15 bg-white/[0.02] text-ink-2 transition-[color,border-color,background-color,translate] duration-200 hover:-translate-y-0.5 hover:border-accent/60 hover:bg-accent-wash hover:text-ink"
                  >
                    <Icon size={18} aria-hidden="true" />
                  </a>
                </motion.li>
              );
            })}
          </motion.ul>
        )}
      </motion.div>

      <motion.figure
        initial={animate ? { opacity: 0, scale: 0.95 } : false}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
        className="relative mx-auto grid place-items-center py-6 sm:py-8 lg:py-0"
      >
        <div className="group relative size-64 motion-safe:animate-hero-float sm:size-76 md:size-84 xl:size-96">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-[18%] rounded-full bg-[radial-gradient(closest-side,rgb(0_171_240/0.32),rgb(0_171_240/0.08)_55%,transparent)] opacity-80 transition-opacity duration-500 group-hover:opacity-100"
          />
          <div
            aria-hidden="true"
            className="absolute -inset-2.5 rounded-blob border border-accent/40 bg-[linear-gradient(135deg,rgb(0_171_240/0.15),rgb(8_27_41/0.4))] transition-[border-color,scale] duration-500 group-hover:scale-[1.015] group-hover:border-accent/70 md:-inset-3"
          />
          <div
            aria-hidden="true"
            className="absolute -inset-4 rotate-[-15deg] rounded-blob-alt border-[1.5px] border-white/45 transition-colors duration-500 group-hover:border-white/70 md:-inset-5"
          />
          {hero.image && !imageFailed ? (
            <img
              src={hero.image}
              alt={hero.imageAlt}
              width={768}
              height={768}
              loading="eager"
              fetchPriority="high"
              onError={() => setImageFailed(true)}
              className="relative z-10 size-full rounded-blob bg-surface object-cover object-[center_18%] shadow-[0_24px_48px_-16px_rgb(2_8_16/0.8)] transition-[scale] duration-500 group-hover:scale-[1.02]"
            />
          ) : (
            <Monogram text={fullName} className="relative z-10 size-full rounded-blob text-5xl" />
          )}
        </div>
      </motion.figure>
    </section>
  );
}
