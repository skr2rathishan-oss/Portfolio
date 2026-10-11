import { Code2, Download, ExternalLink, Terminal } from 'lucide-react';
import { motion, type Variants } from 'motion/react';
import { Link } from 'react-router-dom';
import type { Profile, SocialLink } from '../../content/types';
import { SOCIAL_ICONS } from '../../content/icons';
import { cx, isExternal, linkProps } from '../cards/shared';

export interface HeroProps {
  profile: Profile;
  socials: SocialLink[];
  cvUrl?: string;
  className?: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

function Cta({ to, label, primary }: { to: string; label: string; primary?: boolean }) {
  const className = primary
    ? 'group px-8 py-3.5 rounded-full font-bold bg-[#00abf0] text-[#081b29] flex items-center gap-2 text-sm shadow-[0_0_20px_rgba(0,171,240,0.3)] hover:shadow-[0_0_25px_rgba(0,171,240,0.5)] transition-shadow'
    : 'px-8 py-3.5 rounded-full font-bold border border-[#00abf0]/40 text-white hover:bg-[#00abf0]/10 hover:border-[#00abf0] flex items-center gap-2 text-sm transition-colors';
  const content = (
    <>
      {label}
      {primary && <ExternalLink size={16} aria-hidden="true" />}
    </>
  );
  // Internal routes use the router; everything else is a plain link.
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
    </a>
  );
}

export default function Hero({ profile, socials, cvUrl, className }: HeroProps) {
  const { hero } = profile;
  const heroSocials = socials.filter((s) => s.showInHero && s.url);

  return (
    <section
      aria-labelledby="hero-heading"
      className={cx('relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 py-8 lg:py-16', className)}
    >
      <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-14 w-full">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full lg:w-[56%] flex flex-col items-start text-left order-2 lg:order-1"
        >
          {hero.roleBadge && (
            <motion.p
              variants={itemVariants}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-[#00abf0]/25 text-xs font-mono mb-5"
            >
              <Terminal size={13} className="text-[#00abf0]" aria-hidden="true" />
              <span className="text-gray-400">const</span>
              <span className="text-[#00abf0] font-semibold">engineer</span>
              <span className="text-gray-400">=</span>
              <span className="text-emerald-400 font-medium">"{hero.roleBadge}"</span>
            </motion.p>
          )}

          {hero.focusAreas.length > 0 && (
            <motion.p
              variants={itemVariants}
              className="text-xs md:text-sm font-bold tracking-[0.25em] uppercase mb-4 text-[#00abf0] font-mono flex items-center gap-2 flex-wrap"
            >
              <Code2 size={14} aria-hidden="true" />
              {hero.focusAreas.join(' · ')}
            </motion.p>
          )}

          <motion.h1
            id="hero-heading"
            variants={itemVariants}
            className="text-4xl md:text-5xl lg:text-[3.2rem] xl:text-[3.6rem] font-bold mb-5 tracking-tight leading-[1.15]"
          >
            <span className="text-white">{hero.headline}</span>
            {hero.headlineAccent && (
              <>
                <br />
                <span className="text-[#00abf0]">{hero.headlineAccent}</span>
              </>
            )}
          </motion.h1>

          {hero.intro && (
            <motion.p variants={itemVariants} className="text-sm md:text-base leading-relaxed mb-8 max-w-xl text-gray-400">
              {hero.intro}
            </motion.p>
          )}

          <motion.div variants={itemVariants} className="flex items-center flex-wrap gap-4 mb-8">
            <Cta to={hero.primaryCta.to} label={hero.primaryCta.label} primary />
            <Cta to={hero.secondaryCta.to} label={hero.secondaryCta.label} />
            {cvUrl && (
              <a
                href={cvUrl}
                {...(isExternal(cvUrl) ? { target: '_blank', rel: 'noopener noreferrer' } : { download: true })}
                className="px-5 py-3.5 rounded-full font-semibold text-sm text-gray-300 hover:text-white flex items-center gap-2"
              >
                <Download size={16} aria-hidden="true" /> Résumé
              </a>
            )}
          </motion.div>

          {heroSocials.length > 0 && (
            <motion.ul variants={itemVariants} className="flex items-center gap-4 text-gray-400" aria-label="Social links">
              {heroSocials.map((s) => {
                const Icon = SOCIAL_ICONS[s.platform];
                return (
                  <li key={s.id}>
                    <a
                      {...linkProps(s.url!)}
                      aria-label={s.label}
                      className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center bg-white/[0.02] hover:text-white hover:border-white/40 transition-colors"
                    >
                      <Icon size={18} aria-hidden="true" />
                    </a>
                  </li>
                );
              })}
            </motion.ul>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          className="w-full lg:w-[44%] flex justify-center items-center order-1 lg:order-2"
        >
          <div className="relative w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 flex items-center justify-center">
            <div
              aria-hidden="true"
              className="absolute inset-0 rounded-full blur-2xl opacity-40 pointer-events-none"
              style={{ background: 'radial-gradient(circle, #00abf0 0%, #081b29 70%)' }}
            />
            <div
              aria-hidden="true"
              className="absolute inset-[-10px] md:inset-[-12px] border border-[#00abf0]/40"
              style={{
                borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
                background: 'linear-gradient(135deg, rgba(0,171,240,0.15) 0%, rgba(8,27,41,0.4) 100%)',
              }}
            />
            <img
              src={hero.image}
              alt={hero.imageAlt}
              loading="eager"
              decoding="async"
              className="relative z-10 w-full h-full object-cover object-[center_18%] shadow-2xl"
              style={{ borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
