// Visual editor route (/admin/editor), rendered full-screen outside the admin Layout sidebar.
// The editor itself is a separate lazy chunk; below 1024px a notice points to the list editors.
import { Monitor } from 'lucide-react';
import { lazy, Suspense, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Skeleton } from '../ui/primitives';

const EditorShell = lazy(() => import('./EditorShell'));

const WIDE = '(min-width: 1024px)';

function useWideScreen(): boolean {
  const [wide, setWide] = useState(() => typeof window === 'undefined' || window.matchMedia(WIDE).matches);
  useEffect(() => {
    const mq = window.matchMedia(WIDE);
    const on = () => setWide(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return wide;
}

const LIST_EDITORS: [string, string][] = [
  ['/admin/profile', 'Profile'],
  ['/admin/projects', 'Projects'],
  ['/admin/technologies', 'Tech stack'],
  ['/admin/achievements', 'Achievements'],
  ['/admin/certifications', 'Certifications'],
  ['/admin/education', 'Education'],
  ['/admin/socials', 'Social links'],
];

function NarrowNotice() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#06111d] px-4 py-10 text-[#e8f0f7]">
      <div className="w-full max-w-md space-y-5 rounded-2xl border border-[#1b3550] bg-[#0b1c2e] p-6">
        <Monitor size={22} className="text-[#00abf0]" aria-hidden="true" />
        <div>
          <h1 className="text-lg font-semibold text-white">Use a wider screen for the visual editor</h1>
          <p className="mt-1.5 text-sm leading-relaxed text-[#8ea6bd]">
            The editor needs at least 1024 pixels of width for the canvas and its panels. On this screen, edit your content with
            the list editors. They save to the same draft.
          </p>
        </div>
        <ul className="grid grid-cols-2 gap-2">
          {LIST_EDITORS.map(([to, label]) => (
            <li key={to}>
              <Link to={to} className="block rounded-lg border border-[#1f3d5c] px-3 py-2 text-sm text-[#cfdbe6] hover:border-[#00abf0] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00abf0]">
                {label}
              </Link>
            </li>
          ))}
        </ul>
        <Link to="/admin" className="inline-block text-sm font-semibold text-[#00abf0] underline-offset-4 hover:underline">
          Back to the dashboard
        </Link>
      </div>
    </main>
  );
}

function Loading() {
  return (
    <div className="flex h-dvh flex-col bg-[#06111d]" aria-busy="true" aria-label="Loading the editor">
      <div className="h-14 border-b border-[#14304b] bg-[#0b1c2e]" />
      <div className="flex flex-1 gap-4 p-4">
        <Skeleton className="w-64" />
        <Skeleton className="flex-1" />
        <Skeleton className="w-80" />
      </div>
    </div>
  );
}

export function EditorPage() {
  const wide = useWideScreen();
  if (!wide) return <NarrowNotice />;
  return (
    <Suspense fallback={<Loading />}>
      <EditorShell />
    </Suspense>
  );
}

export default EditorPage;
