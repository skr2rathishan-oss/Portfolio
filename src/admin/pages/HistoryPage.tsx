import { Download, RefreshCw, RotateCcw, Send, Sprout } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Content } from '../../content/types';
import * as api from '../api';
import { formatBytes } from '../lib/image';
import { useAdminContent } from '../state/AdminContentContext';
import { useToast } from '../state/toast';
import { Badge, Button, ConfirmDialog, cx, EmptyState, focusRing, PageHeader, Panel, Skeleton } from '../ui/primitives';

const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });

export function HistoryPage() {
  const { publishedRev, mutate, source, hasUnpublishedChanges, restoreToDraft, restoreAndPublish, publish } = useAdminContent();
  const toast = useToast();
  const navigate = useNavigate();
  const [revisions, setRevisions] = useState<api.RevisionInfo[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [restoring, setRestoring] = useState<{ revision: api.RevisionInfo; mode: 'draft' | 'publish' } | null>(null);
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
  }, [load, publishedRev]);

  const publishNow = async () => {
    const res = await publish();
    toast(
      res.ok
        ? { tone: 'success', message: 'Published. Visitors now see your changes.' }
        : {
            tone: 'error',
            message: `Not published: ${res.message}${res.code === 'published_changed' ? ' Use Publish in the header to publish anyway.' : ''}`,
          },
    );
  };

  const restore = async (r: api.RevisionInfo, mode: 'draft' | 'publish') => {
    setBusy(true);
    const res = mode === 'draft' ? await restoreToDraft(r.id) : await restoreAndPublish(r.id);
    setBusy(false);
    if (!res.ok) {
      toast({ tone: 'error', message: `Not restored: ${res.message}` });
      return;
    }
    setRestoring(null);
    if (mode === 'draft') {
      toast({
        tone: 'success',
        message: `Revision ${r.rev} loaded into your draft. The live site has not changed.`,
        duration: 10000,
        action: { label: 'Publish now', onClick: () => void publishNow() },
      });
    } else {
      toast({
        tone: 'success',
        message: `Revision ${r.rev} is live again. Your draft now matches it.`,
        action: { label: 'Open editor', onClick: () => navigate('/admin/editor') },
      });
      void load();
    }
  };

  const publishSeed = async () => {
    setBusy(true);
    try {
      const mod = await import('../../content/seed.json');
      const seed = (mod.default ?? mod) as unknown as Content;
      const res = await mutate(() => ({ ...seed }), { success: 'Built-in content loaded into your draft' });
      if (res.ok) setSeedConfirm(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader
        title="History"
        description="Every publish creates a revision; the newest 30 are kept. Restore loads a revision into your draft so you can check it before publishing. Restore and publish makes it live straight away. Nothing is lost either way."
        actions={
          <>
            <Button variant="ghost" icon={<RefreshCw size={15} aria-hidden="true" />} onClick={() => void load()}>
              Refresh
            </Button>
            <a
              href={api.exportUrl('published')}
              download
              className={cx('inline-flex h-10 items-center gap-2 rounded-lg border border-[#27496b] bg-[#11263d] px-4 text-sm text-[#e8f0f7] hover:border-[#3a6690]', focusRing)}
            >
              <Download size={15} aria-hidden="true" /> Export live JSON
            </a>
            <a
              href={api.exportUrl('draft')}
              download
              className={cx('inline-flex h-10 items-center gap-2 rounded-lg border border-[#27496b] bg-[#11263d] px-4 text-sm text-[#e8f0f7] hover:border-[#3a6690]', focusRing)}
            >
              <Download size={15} aria-hidden="true" /> Export draft JSON
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
        <EmptyState title="No revisions yet" body="The site is showing the built-in content. Your first publish creates revision 1." />
      )}
      {revisions && revisions.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-[#1b3550] bg-[#0b1c2e]">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Published revisions, newest first</caption>
            <thead className="border-b border-[#1b3550] text-xs text-[#7f97ad]">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">
                  Revision
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Published
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
                    {r.rev === publishedRev && (
                      <Badge tone="ok" className="ml-2">
                        Live
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[#b8c9d9]">{dateFormat.format(new Date(r.updatedAt))}</td>
                  <td className="px-4 py-3 tabular-nums text-[#7f97ad]">{formatBytes(r.size)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        icon={<RotateCcw size={14} aria-hidden="true" />}
                        onClick={() => setRestoring({ revision: r, mode: 'draft' })}
                        aria-label={`Restore revision ${r.rev} into the draft`}
                      >
                        Restore
                      </Button>
                      {r.rev !== publishedRev && (
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={<Send size={14} aria-hidden="true" />}
                          onClick={() => setRestoring({ revision: r, mode: 'publish' })}
                          aria-label={`Restore revision ${r.rev} and publish it now`}
                        >
                          Restore and publish
                        </Button>
                      )}
                    </div>
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
        description="Loads the content bundled with the site code (src/content/seed.json) into your draft. The live site changes only when you publish."
      >
        <Button icon={<Sprout size={15} aria-hidden="true" />} onClick={() => setSeedConfirm(true)} disabled={source === 'seed'}>
          Load built-in content into draft
        </Button>
      </Panel>

      {restoring?.mode === 'draft' && (
        <ConfirmDialog
          title={`Restore revision ${restoring.revision.rev} into your draft?`}
          tone="primary"
          message={`Your draft is replaced with this revision so you can review it in the editor before publishing. The live site does not change.${hasUnpublishedChanges ? ' Your current unpublished changes are backed up on the server.' : ''}`}
          confirmLabel="Restore to draft"
          busy={busy}
          onCancel={() => setRestoring(null)}
          onConfirm={() => void restore(restoring.revision, 'draft')}
        />
      )}
      {restoring?.mode === 'publish' && (
        <ConfirmDialog
          title={`Restore and publish revision ${restoring.revision.rev}?`}
          tone="primary"
          message={`The live site immediately shows this revision, and your draft is reset to it.${hasUnpublishedChanges ? ' Your current unpublished changes are replaced (a backup is kept on the server).' : ''} The current live version stays in History.`}
          confirmLabel="Restore and publish"
          busy={busy}
          onCancel={() => setRestoring(null)}
          onConfirm={() => void restore(restoring.revision, 'publish')}
        />
      )}
      {seedConfirm && (
        <ConfirmDialog
          title="Load the built-in content into your draft?"
          message="This replaces everything in your draft with the content bundled in the code. The live site changes only when you publish, and every published version stays in History."
          confirmLabel="Load into draft"
          busy={busy}
          onCancel={() => setSeedConfirm(false)}
          onConfirm={() => void publishSeed()}
        />
      )}
    </>
  );
}
