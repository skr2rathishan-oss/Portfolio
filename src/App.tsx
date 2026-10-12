import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { MotionConfig } from 'motion/react';
import { ContentProvider } from './content/ContentProvider';
import { CANVAS_META_NAME } from './content/editable';
import PortfolioLayout from './components/layout/PortfolioLayout';
import SiteSkeleton from './components/layout/SiteSkeleton';

const AdminApp = lazy(() => import('./admin/AdminApp'));
// Visual-editor canvas: only loaded inside the admin editor's same-origin srcdoc iframe.
const EditorCanvas = lazy(() => import('./admin/editor/canvas/CanvasApp'));

const IS_CANVAS =
  typeof document !== 'undefined' &&
  document.querySelector(`meta[name="${CANVAS_META_NAME}"]`) !== null &&
  window.parent !== window;

export default function App() {
  if (IS_CANVAS) {
    return (
      <Suspense fallback={null}>
        <EditorCanvas />
      </Suspense>
    );
  }
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
