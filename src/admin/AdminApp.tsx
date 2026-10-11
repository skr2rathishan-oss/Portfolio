// Admin panel, lazy-loaded at /admin/* (zod + dnd-kit live only in this chunk).
import { useCallback, useEffect, useRef, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import * as api from './api';
import { AchievementsPage } from './pages/AchievementsPage';
import { CertificationsPage } from './pages/CertificationsPage';
import { Dashboard } from './pages/Dashboard';
import { EducationPage } from './pages/EducationPage';
import { HistoryPage } from './pages/HistoryPage';
import { MediaPage } from './pages/MediaPage';
import { ProfilePage } from './pages/ProfilePage';
import { ProjectsPage } from './pages/ProjectsPage';
import { SitePage } from './pages/SitePage';
import { SocialsPage } from './pages/SocialsPage';
import { TechnologiesPage } from './pages/TechnologiesPage';
import { Layout } from './shell/Layout';
import { LoginPage, ReloginDialog } from './shell/Login';
import { AdminContentProvider, useAdminContent } from './state/AdminContentContext';
import { ToastProvider } from './state/toast';
import { Button, Skeleton } from './ui/primitives';

type SessionState =
  | { phase: 'checking' }
  | { phase: 'anonymous'; configured: boolean; apiError: string | null }
  | { phase: 'authenticated' };

function Splash() {
  return (
    <div className="min-h-screen bg-[#06111d] px-6 py-10" aria-busy="true" aria-label="Loading admin">
      <div className="mx-auto max-w-6xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Opens a re-login dialog whenever the API answers 401, then lets the request retry. */
function ReauthBridge({ onGiveUp }: { onGiveUp: () => void }) {
  const [open, setOpen] = useState(false);
  const waiters = useRef<{ resolve: () => void; reject: (e: Error) => void }[]>([]);

  useEffect(() => {
    api.setReauthHandler(
      () =>
        new Promise<void>((resolve, reject) => {
          waiters.current.push({ resolve, reject });
          setOpen(true);
        }),
    );
    return () => api.setReauthHandler(null);
  }, []);

  if (!open) return null;
  const settle = (ok: boolean) => {
    const list = waiters.current;
    waiters.current = [];
    setOpen(false);
    for (const w of list) {
      if (ok) w.resolve();
      else w.reject(new api.ApiError(401, 'unauthorized', 'Signed out'));
    }
    if (!ok) onGiveUp();
  };
  return <ReloginDialog onSuccess={() => settle(true)} onCancel={() => settle(false)} />;
}

function AdminRoutes({ onLogout }: { onLogout: () => void }) {
  const { phase, loadError, reload } = useAdminContent();
  if (phase === 'loading') return <Splash />;
  if (phase === 'error') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#06111d] px-4 text-center text-[#e8f0f7]">
        <div className="max-w-md space-y-4">
          <h1 className="text-xl font-semibold text-white">Content could not be loaded</h1>
          <p className="text-sm text-[#8ea6bd]">{loadError}</p>
          <Button variant="primary" onClick={() => void reload()}>
            Try again
          </Button>
        </div>
      </main>
    );
  }
  return (
    <Layout onLogout={onLogout}>
      <Routes>
        <Route index element={<Dashboard />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="achievements" element={<AchievementsPage />} />
        <Route path="certifications" element={<CertificationsPage />} />
        <Route path="education" element={<EducationPage />} />
        <Route path="technologies" element={<TechnologiesPage />} />
        <Route path="socials" element={<SocialsPage />} />
        <Route path="site" element={<SitePage />} />
        <Route path="media" element={<MediaPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </Layout>
  );
}

function AuthGate() {
  const [session, setSession] = useState<SessionState>({ phase: 'checking' });

  const check = useCallback(async () => {
    try {
      const s = await api.getSession();
      setSession(s.authenticated ? { phase: 'authenticated' } : { phase: 'anonymous', configured: s.configured !== false, apiError: null });
    } catch (err) {
      setSession({ phase: 'anonymous', configured: true, apiError: (err as Error).message });
    }
  }, []);

  useEffect(() => {
    void check();
  }, [check]);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } finally {
      setSession({ phase: 'anonymous', configured: true, apiError: null });
    }
  }, []);

  if (session.phase === 'checking') return <Splash />;
  if (session.phase === 'anonymous') {
    return (
      <LoginPage
        notConfigured={!session.configured}
        apiError={session.apiError}
        onSuccess={() => setSession({ phase: 'authenticated' })}
      />
    );
  }
  return (
    <AdminContentProvider>
      <ReauthBridge onGiveUp={() => setSession({ phase: 'anonymous', configured: true, apiError: null })} />
      <AdminRoutes onLogout={() => void logout()} />
    </AdminContentProvider>
  );
}

export default function AdminApp() {
  return (
    <ToastProvider>
      <title>Admin – Portfolio</title>
      <meta name="robots" content="noindex, nofollow" />
      <AuthGate />
    </ToastProvider>
  );
}
