import {
  AlertTriangle,
  Award,
  BadgeCheck,
  Check,
  Cpu,
  ExternalLink,
  FolderKanban,
  GraduationCap,
  History,
  Image,
  LayoutDashboard,
  Link2,
  Loader2,
  LogOut,
  MousePointerClick,
  Send,
  Settings,
  Undo2,
  UserRound,
  WifiOff,
} from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import type { Content } from '../../content/types';
import { useAdminContent } from '../state/AdminContentContext';
import { useToast } from '../state/toast';
import { Badge, Button, ConfirmDialog, cx, focusRing } from '../ui/primitives';

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  count?: (doc: Content) => number;
}

export const NAV: NavItem[] = [
  { to: '', label: 'Dashboard', icon: LayoutDashboard },
  { to: 'editor', label: 'Visual editor', icon: MousePointerClick },
  { to: 'profile', label: 'Profile', icon: UserRound },
  { to: 'projects', label: 'Projects', icon: FolderKanban, count: (d) => d.projects.length },
  {
    to: 'achievements',
    label: 'Achievements & Activities',
    icon: Award,
    count: (d) => d.achievements.length + d.roles.length + d.programs.length,
  },
  { to: 'certifications', label: 'Certifications', icon: BadgeCheck, count: (d) => d.certifications.length },
  { to: 'education', label: 'Education', icon: GraduationCap, count: (d) => d.education.length + d.academicPathway.length },
  { to: 'technologies', label: 'Technologies', icon: Cpu, count: (d) => d.technologies.length },
  { to: 'socials', label: 'Social links', icon: Link2, count: (d) => d.socials.length },
  { to: 'site', label: 'Site settings', icon: Settings },
  { to: 'media', label: 'Media', icon: Image },
  { to: 'history', label: 'History', icon: History },
];

function SaveStatus() {
  const { saveState, lastError } = useAdminContent();
  const content =
    saveState === 'saving' ? (
      <>
        <Loader2 size={14} className="animate-spin text-[#00abf0]" aria-hidden="true" /> Saving…
      </>
    ) : saveState === 'error' ? (
      <span className="flex items-center gap-1.5 text-[#ff8a8a]" title={lastError ?? undefined}>
        <AlertTriangle size={14} aria-hidden="true" /> Not saved
      </span>
    ) : saveState === 'saved' ? (
      <>
        <Check size={14} className="text-[#3ddc97]" aria-hidden="true" /> Saved to draft
      </>
    ) : (
      <span className="text-[#5f7a93]">Changes save to your draft</span>
    );
  return (
    <p role="status" aria-live="polite" className="hidden sm:flex items-center gap-1.5 text-[13px] text-[#b8c9d9]">
      {content}
    </p>
  );
}

/** Status pill + Publish / Discard draft. Visitors only see what was last published. */
export function PublishControls({ showStatus = true }: { showStatus?: boolean }) {
  const { hasUnpublishedChanges, publishedRev, saveState, publish, discardDraft } = useAdminContent();
  const toast = useToast();
  const [busy, setBusy] = useState<'publish' | 'discard' | null>(null);
  const [confirm, setConfirm] = useState<'discard' | 'force' | null>(null);
  const saving = saveState === 'saving';

  const runPublish = async (force = false) => {
    setBusy('publish');
    const res = await publish({ force });
    setBusy(null);
    if (res.ok) {
      setConfirm(null);
      toast({
        tone: 'success',
        message: 'Published. Visitors now see your changes.',
        action: { label: 'View site', onClick: () => window.open('/', '_blank', 'noopener,noreferrer') },
      });
      return;
    }
    if (res.code === 'published_changed') {
      setConfirm('force');
      return;
    }
    setConfirm(null);
    toast({
      tone: 'error',
      message: `Not published: ${res.message} The draft is unchanged.`,
      action: res.code === 'stale_draft' || res.issues ? undefined : { label: 'Retry', onClick: () => void runPublish(force) },
    });
  };

  const runDiscard = async () => {
    setBusy('discard');
    const res = await discardDraft();
    setBusy(null);
    setConfirm(null);
    toast(res.ok ? { tone: 'success', message: 'Draft discarded. It matches the live site again.' } : { tone: 'error', message: `Not discarded: ${res.message}` });
  };

  return (
    <>
      {showStatus && (
      <span className="hidden md:inline-flex">
        {hasUnpublishedChanges ? (
          <Badge tone="warn">
            <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" /> Unpublished changes
          </Badge>
        ) : (
          <Badge tone="ok">
            <Check size={12} aria-hidden="true" /> Up to date
          </Badge>
        )}
      </span>
      )}
      {hasUnpublishedChanges && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setConfirm('discard')}
          disabled={busy !== null}
          icon={<Undo2 size={15} aria-hidden="true" />}
          title="Discard draft: go back to the live version"
        >
          <span className="hidden xl:inline">Discard draft</span>
          <span className="sr-only xl:hidden">Discard draft</span>
        </Button>
      )}
      <Button
        variant="primary"
        size="sm"
        onClick={() => void runPublish()}
        disabled={!hasUnpublishedChanges || saving || busy === 'discard'}
        busy={busy === 'publish'}
        icon={<Send size={14} aria-hidden="true" />}
        title={hasUnpublishedChanges ? 'Publish the draft to the live site' : 'Nothing to publish: the draft matches the live site'}
      >
        Publish
        <span className="sr-only">{hasUnpublishedChanges ? ' (unpublished changes)' : ' (up to date)'}</span>
      </Button>

      {confirm === 'discard' && (
        <ConfirmDialog
          title="Discard unpublished changes?"
          message={`Your draft goes back to what the live site shows${publishedRev ? ` (revision ${publishedRev})` : ''}. A backup of the current draft is kept on the server.`}
          confirmLabel="Discard changes"
          busy={busy === 'discard'}
          onCancel={() => setConfirm(null)}
          onConfirm={() => void runDiscard()}
        />
      )}
      {confirm === 'force' && (
        <ConfirmDialog
          title="The live site changed"
          tone="primary"
          message="Someone published a different version (for example from History) after this draft was started. Publishing now replaces the live site with your draft. The current live version stays in History."
          confirmLabel="Publish anyway"
          busy={busy === 'publish'}
          onCancel={() => setConfirm(null)}
          onConfirm={() => void runPublish(true)}
        />
      )}
    </>
  );
}

function useOnline() {
  const [online, setOnline] = useState(() => navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);
  return online;
}

export function Layout({ children, onLogout }: { children: ReactNode; onLogout: () => void }) {
  const { doc, conflict, dismissConflict, reload, publishedRev } = useAdminContent();
  const online = useOnline();
  const brand = doc ? `${doc.site.brand.primary}${doc.site.brand.suffix ? ` ${doc.site.brand.suffix}` : ''}` : 'Portfolio';

  const navLink = (item: NavItem, mobile = false) => {
    const Icon = item.icon;
    const count = doc && item.count ? item.count(doc) : undefined;
    return (
      <NavLink
        key={item.to}
        to={item.to === '' ? '/admin' : `/admin/${item.to}`}
        end={item.to === ''}
        className={({ isActive }) =>
          cx(
            'flex items-center gap-2.5 rounded-lg text-sm transition-colors',
            mobile ? 'shrink-0 px-3 py-2' : 'px-3 py-2',
            isActive ? 'bg-[#00abf0]/12 text-white font-medium' : 'text-[#9fb4c8] hover:bg-white/[0.04] hover:text-white',
            focusRing,
          )
        }
      >
        {({ isActive }) => (
          <>
            <Icon size={17} className={isActive ? 'text-[#00abf0]' : 'text-[#5f7a93]'} aria-hidden="true" />
            <span className={mobile ? '' : 'flex-1'}>{item.label}</span>
            {count !== undefined && <span className="text-xs tabular-nums text-[#5f7a93]">{count}</span>}
          </>
        )}
      </NavLink>
    );
  };

  return (
    <div className="min-h-screen bg-[#06111d] text-[#e8f0f7] font-sans">
      <a
        href="#admin-main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[70] focus:rounded-lg focus:bg-[#00abf0] focus:px-3 focus:py-2 focus:text-[#04141f]"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-40 border-b border-[#14304b] bg-[#06111d]/90 backdrop-blur">
        <div className="flex h-14 items-center gap-3 px-4 lg:px-6">
          <p className="flex items-baseline gap-2 font-semibold text-white">
            <span>{brand}</span>
            <span className="text-sm font-normal text-[#5f7a93]">admin</span>
          </p>
          <div className="ml-auto flex items-center gap-2 sm:gap-4">
            <SaveStatus />
            <PublishControls />
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className={cx('inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm text-[#b8c9d9] hover:bg-white/[0.06] hover:text-white', focusRing)}
            >
              <ExternalLink size={15} aria-hidden="true" />
              <span className="hidden sm:inline">View site</span>
              <span className="sr-only sm:hidden">View site</span>
            </a>
            <Button variant="ghost" size="sm" onClick={onLogout} icon={<LogOut size={15} aria-hidden="true" />}>
              <span className="hidden sm:inline">Log out</span>
              <span className="sr-only sm:hidden">Log out</span>
            </Button>
          </div>
        </div>
        <nav aria-label="Admin sections (compact)" className="flex gap-1 overflow-x-auto border-t border-[#14304b] px-3 py-2 lg:hidden">
          {NAV.map((item) => navLink(item, true))}
        </nav>
      </header>

      {!online && (
        <div role="alert" className="flex items-center justify-center gap-2 bg-[#f5b544]/15 px-4 py-2 text-sm text-[#f5c46a]">
          <WifiOff size={15} aria-hidden="true" /> You are offline. Changes cannot be saved until the connection returns.
        </div>
      )}

      <div className="flex">
        <nav aria-label="Admin sections" className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-64 shrink-0 overflow-y-auto border-r border-[#14304b] px-3 py-5 lg:block">
          <div className="space-y-0.5">{NAV.map((item) => navLink(item))}</div>
          <p className="mt-6 rounded-lg border border-[#27496b] bg-[#0a1a2b] p-3 text-xs leading-relaxed text-[#8ea6bd]">
            {publishedRev === 0
              ? 'The live site is showing the built-in content. Edits save to your private draft; Publish makes them live as revision 1.'
              : 'Edits save to your private draft. Visitors see them only after you publish.'}
          </p>
        </nav>
        <main id="admin-main" className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>

      {conflict && (
        <ConfirmDialog
          title="Draft changed elsewhere"
          tone="primary"
          message="The draft was updated in another tab or by a restore, and your last change could not be applied on top of it. Reload to continue from the latest draft."
          confirmLabel="Reload latest"
          onCancel={dismissConflict}
          onConfirm={() => {
            dismissConflict();
            void reload();
          }}
        />
      )}
    </div>
  );
}
