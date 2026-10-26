import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { MotionConfig } from 'motion/react';
import { ContentProvider } from './content/ContentProvider';
import PortfolioLayout from './components/layout/PortfolioLayout';
import SiteSkeleton from './components/layout/SiteSkeleton';

export default function App() {
  return (
    <Router>
      <MotionConfig reducedMotion="user">
        <Routes>
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
