import { Download, RefreshCw, RotateCcw, Sprout } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import type { Content } from '../../content/types';
import * as api from '../api';
import { formatBytes } from '../lib/image';
import { useAdminContent } from '../state/AdminContentContext';
import { useToast } from '../state/toast';
import { Badge, Button, ConfirmDialog, cx, EmptyState, focusRing, PageHeader, Panel, Skeleton } from '../ui/primitives';

const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });

export function HistoryPage() {
  const { rev, reload, mutate, source } = useAdminContent();
  const toast = useToast();
  const [revisions, setRevisions] = useState<api.RevisionInfo[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [restoring, setRestoring] = useState<api.RevisionInfo | null>(null);
  const [seedConfirm, setSeedConfirm] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      setRevisions(await api.getRevisions());
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load, rev]);

  const restore = async (r: api.RevisionInfo) => {
    setBusy(true);
    try {
      const res = await api.restoreRevision(r.id, rev);
      toast({ tone: 'success', message: `Restored revision ${r.rev} as revision ${res.rev}` });
      setRestoring(null);
      await reload();
    } catch (err) {
      const e = err as api.ApiError;
      toast({ tone: 'error', message: e.status === 412 ? 'The content changed meanwhile. Reloaded; try again.' : e.message });
      if (e.status === 412) await reload();
    } finally {
      setBusy(false);
    }
  };

  const publishSeed = async () => {
    setBusy(true);
    try {
      const mod = await import('../../content/seed.json');
      const seed = (mod.default ?? mod) as unknown as Content;
      const res = await mutate(() => ({ ...seed }), { success: 'Built-in content published' });
      if (res.ok) setSeedConfirm(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader
        title="History"
        description="Every save creates a revision. The newest 30 are kept. Restoring a revision publishes it as a new revision, so nothing is lost."
        actions={
          <>
            <Button variant="ghost" icon={<RefreshCw size={15} aria-hidden="true" />} onClick={() => void load()}>
              Refresh
            </Button>
            <a
              href="/api/admin/export"
              download
              className={cx('inline-flex h-10 items-center gap-2 rounded-lg border border-[#27496b] bg-[#11263d] px-4 text-sm text-[#e8f0f7] hover:border-[#3a6690]', focusRing)}
            >
              <Download size={15} aria-hidden="true" /> Export JSON
            </a>
          </>
        }
      />
      {error && (
        <p role="alert" className="mb-4 text-sm text-[#ff8a8a]">
          {error}
        </p>
      )}
      {!revisions && !error && <Skeleton className="h-64" />}
      {revisions && revisions.length === 0 && (
        <EmptyState title="No revisions yet" body="The site is showing the built-in content. Your first save creates revision 1." />
      )}
      {revisions && revisions.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-[#1b3550] bg-[#0b1c2e]">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Saved revisions, newest first</caption>
            <thead className="border-b border-[#1b3550] text-xs text-[#7f97ad]">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">
                  Revision
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Saved
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Size
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {revisions.map((r) => (
                <tr key={r.id} className="border-b border-[#14304b] last:border-0">
                  <td className="px-4 py-3 tabular-nums text-white">
                    {r.rev}
                    {r.rev === rev && (
                      <Badge tone="ok" className="ml-2">
                        Live
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[#b8c9d9]">{dateFormat.format(new Date(r.updatedAt))}</td>
                  <td className="px-4 py-3 tabular-nums text-[#7f97ad]">{formatBytes(r.size)}</td>
                  <td className="px-4 py-3 text-right">
                    {r.rev !== rev && (
                      <Button size="sm" icon={<RotateCcw size={14} aria-hidden="true" />} onClick={() => setRestoring(r)}>
                        Restore
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Panel
        className="mt-10"
        title="Start over from the built-in content"
        description="Publishes the content bundled with the site code (src/content/seed.json) as a new revision. Your current content stays in History."
      >
        <Button icon={<Sprout size={15} aria-hidden="true" />} onClick={() => setSeedConfirm(true)} disabled={source === 'seed'}>
          Publish built-in content
        </Button>
      </Panel>

      {restoring && (
        <ConfirmDialog
          title={`Restore revision ${restoring.rev}?`}
          tone="primary"
          message="The site will immediately show the content from this revision. The current version stays in History."
          confirmLabel="Restore and publish"
          busy={busy}
          onCancel={() => setRestoring(null)}
          onConfirm={() => void restore(restoring)}
        />
      )}
      {seedConfirm && (
        <ConfirmDialog
          title="Publish the built-in content?"
          message="This replaces everything on the live site with the content bundled in the code. You can restore the current version from History."
          confirmLabel="Publish built-in content"
          busy={busy}
          onCancel={() => setSeedConfirm(false)}
          onConfirm={() => void publishSeed()}
        />
      )}
    </>
  );
}
