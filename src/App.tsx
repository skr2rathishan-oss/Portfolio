import { lazy, Suspense, type ReactNode } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { motion, MotionConfig } from 'motion/react';
import NetworkBackground from './NetworkBackground';
import { ContentProvider, useContent } from './content/ContentProvider';
import ScrollManager from './components/layout/ScrollManager';
import SiteFooter from './components/layout/SiteFooter';
import SiteHeader from './components/layout/SiteHeader';
import SiteSkeleton from './components/layout/SiteSkeleton';
import Home from './pages/Home';
import About from './pages/About';
import Projects from './pages/Projects';
import Achievements from './pages/Achievements';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';

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

function PortfolioLayout() {
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

const AdminApp = lazy(() => import('./admin/AdminApp'));

export default function App() {
  return (
    <Router>
      <MotionConfig reducedMotion="user">
        <Routes>
          <Route
            path="/admin/*"
            element={
              <Suspense fallback={<div className="min-h-screen bg-[#081524]" />}>
                <AdminApp />
              </Suspense>
            }
          />
          <Route
            path="*"
            element={
              <ContentProvider fallback={<SiteSkeleton />}>
                <PortfolioLayout />
              </ContentProvider>
            }
          />
        </Routes>
      </MotionConfig>
    </Router>
  );
}
