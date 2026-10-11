import { useEffect, useState } from 'react';
import { ArrowRight, Download } from 'lucide-react';
import { motion, type Variants } from 'motion/react';
import { Link } from 'react-router-dom';
import type { Profile, SocialLink } from '../../content/types';
import { SOCIAL_ICONS } from '../../content/icons';
import { cx, isExternal, linkProps, NewTabHint } from '../cards/shared';
import { btnPrimary, btnSecondary } from '../ui/styles';

export interface HeroProps {
  profile: Profile;
  socials: SocialLink[];
  cvUrl?: string;
  className?: string;
}

const HERO_SEEN_KEY = 'hero-intro-played';

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

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
  const className = primary ? btnPrimary : btnSecondary;
  const content = (
    <>
      {label}
      {primary && <ArrowRight size={16} aria-hidden="true" />}
    </>
  );
  if (/^\/(?!\/)/.test(to)) {
    return (
      <Link to={to} className={className}>
        {content}
      </Link>
    );
  }
  return (
    <a {...linkProps(to)} className={className}>
      {content}
      <NewTabHint url={to} />
    </a>
  );
}

export default function Hero({ profile, socials, cvUrl, className }: HeroProps) {
  const { hero, contact } = profile;
  const heroSocials = socials.filter((s) => s.showInHero && s.url);
  const statement = [hero.headline, hero.headlineAccent].filter(Boolean).join(' ');
  const availability = contact.availability.enabled ? contact.availability.title : '';
  const place = [contact.location, contact.timezone].filter(Boolean).join(', ');
  const animate = useIntroOnce();
  const motionProps = animate ? { initial: 'hidden' as const, animate: 'visible' as const } : {};

  return (
    <section
      aria-labelledby="hero-heading"
      className={cx(
        'grid items-center gap-10 py-10 sm:py-14 lg:min-h-[calc(100dvh-var(--header-h)-4rem)] lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16 lg:py-16',
        className,
      )}
    >
      <motion.div variants={containerVariants} {...motionProps} className="flex min-w-0 flex-col items-start">
        {(availability || hero.roleBadge) && (
          <motion.p variants={itemVariants} className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-2">
            {hero.roleBadge && <span className="font-medium text-ink">{hero.roleBadge}</span>}
            {availability && (
              <span className="inline-flex items-center gap-2">
                <span aria-hidden="true" className="h-2 w-2 rounded-full bg-success" />
                {availability}
              </span>
            )}
          </motion.p>
        )}

        <motion.h1
          id="hero-heading"
          variants={itemVariants}
          className="mt-4 text-display text-ink text-balance"
        >
          {profile.fullName}
        </motion.h1>

        {statement && (
          <motion.p
            variants={itemVariants}
            className="mt-4 max-w-[34ch] text-balance text-[clamp(1.25rem,1.05rem+0.9vw,1.625rem)] font-medium leading-snug tracking-[-0.01em] text-ink"
          >
            {statement}
          </motion.p>
        )}

        {hero.intro && (
          <motion.p variants={itemVariants} className="mt-4 max-w-[60ch] text-base leading-relaxed text-ink-2 sm:text-lead">
            {hero.intro}
          </motion.p>
        )}

        <motion.div variants={itemVariants} className="mt-7 flex flex-wrap items-center gap-3">
          <Cta to={hero.primaryCta.to} label={hero.primaryCta.label} primary />
          <Cta to={hero.secondaryCta.to} label={hero.secondaryCta.label} />
          {cvUrl && (
            <a
              href={cvUrl}
              {...(isExternal(cvUrl) ? { target: '_blank', rel: 'noopener noreferrer' } : { download: true })}
              className="inline-flex min-h-11 items-center gap-2 px-2 text-sm font-semibold text-ink-2 underline-offset-4 transition-colors hover:text-ink hover:underline"
            >
              <Download size={16} aria-hidden="true" />
              Download résumé
              <NewTabHint url={cvUrl} />
            </a>
          )}
        </motion.div>

        {(hero.focusAreas.length > 0 || heroSocials.length > 0) && (
          <motion.div
            variants={itemVariants}
            className="mt-8 flex w-full flex-wrap items-center justify-between gap-x-6 gap-y-4 border-t border-line pt-5"
          >
            {hero.focusAreas.length > 0 && (
              <ul aria-label="Focus areas" className="flex flex-wrap gap-1.5">
                {hero.focusAreas.map((area) => (
                  <li key={area} className="rounded-chip border border-line px-2 py-0.5 text-xs font-medium text-ink-2">
                    {area}
                  </li>
                ))}
              </ul>
            )}
            {heroSocials.length > 0 && (
              <ul className="-mx-1.5 flex items-center gap-1" aria-label="Profiles">
                {heroSocials.map((s) => {
                  const Icon = SOCIAL_ICONS[s.platform];
                  return (
                    <li key={s.id}>
                      <a
                        {...linkProps(s.url!)}
                        aria-label={`${s.label}${isExternal(s.url!) ? ' (opens in new tab)' : ''}`}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-control text-ink-2 transition-colors hover:bg-white/[0.05] hover:text-ink"
                      >
                        <Icon size={19} aria-hidden="true" />
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </motion.div>
        )}
      </motion.div>

      <motion.figure
        initial={animate ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
        className="mx-auto w-full max-w-[22rem] sm:max-w-[26rem] lg:mx-0 lg:max-w-none"
      >
        <div className="relative">
          {/* A single offset outline: the one decorative gesture in the hero. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 translate-x-3 translate-y-3 rounded-panel border border-accent/45"
          />
          <img
            src={hero.image}
            alt={hero.imageAlt}
            width={768}
            height={960}
            loading="eager"
            fetchPriority="high"
            className="relative aspect-[4/5] w-full rounded-panel border border-line bg-surface object-cover object-[center_18%]"
          />
        </div>
        {place && (
          <figcaption className="mt-6 flex items-center justify-between gap-4 font-mono text-xs text-ink-3">
            <span>{place}</span>
            {contact.email && <span className="hidden truncate sm:inline">{contact.email}</span>}
          </figcaption>
        )}
      </motion.figure>
    </section>
  );
}
