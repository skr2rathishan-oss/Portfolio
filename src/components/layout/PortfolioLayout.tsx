// Public site shell (header, routes, footer). Moved verbatim out of App.tsx so the editor
// canvas can render the same layout inside a MemoryRouter + StaticContentProvider.
// FROZEN signature: `export default function PortfolioLayout(): JSX.Element` (no props).
import type { ReactNode } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import NetworkBackground from '../../NetworkBackground';
import { useContent } from '../../content/ContentProvider';
import ScrollManager from './ScrollManager';
import SiteFooter from './SiteFooter';
import SiteHeader from './SiteHeader';
import Home from '../../pages/Home';
import About from '../../pages/About';
import Projects from '../../pages/Projects';
import Achievements from '../../pages/Achievements';
import Contact from '../../pages/Contact';
import NotFound from '../../pages/NotFound';

/** Route enter: opacity + a small rise, no exit animation (no dead time between pages). */
function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default function PortfolioLayout() {
  const content = useContent();
  const location = useLocation();

  return (
    <div className="relative flex min-h-dvh flex-col">
      <a
        href="#content"
        className="sr-only z-[60] rounded-control bg-accent px-4 py-3 font-semibold text-on-accent focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <NetworkBackground subdued={location.pathname !== '/'} />
      <ScrollManager />
      <SiteHeader content={content} />

      <main id="content" tabIndex={-1} className="relative z-10 flex-1">
        <PageTransition key={location.pathname}>
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/skills" element={<Navigate to="/projects#stack" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </PageTransition>
      </main>

      <SiteFooter content={content} />
    </div>
  );
}
