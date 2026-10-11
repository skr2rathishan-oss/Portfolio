import { Check, Copy, FileText, RefreshCw, Trash2, Upload } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import * as api from '../api';
import { formatBytes, MAX_UPLOAD_BYTES, prepareImage } from '../lib/image';
import { useToast } from '../state/toast';
import { Badge, Button, ConfirmDialog, EmptyState, IconButton, PageHeader, Skeleton } from '../ui/primitives';

export function MediaPage() {
  const toast = useToast();
  const [items, setItems] = useState<api.MediaItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<api.MediaItem | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState<number | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setItems(await api.getMedia());
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);

  const upload = async (file: File) => {
    const isPdf = file.type === 'application/pdf';
    try {
      setUploading(0);
      const prepared = isPdf ? { blob: file, fileName: file.name } : await prepareImage(file, 2400);
      if (prepared.blob.size > MAX_UPLOAD_BYTES) throw new Error(`The file is ${formatBytes(prepared.blob.size)}; the limit is 4 MB.`);
      await api.uploadFile(prepared.blob, prepared.fileName, isPdf ? 'document' : 'image', setUploading);
      toast({ tone: 'success', message: 'File uploaded' });
      await load();
    } catch (err) {
      toast({ tone: 'error', message: (err as Error).message });
    } finally {
      setUploading(null);
    }
  };

  const remove = async (item: api.MediaItem) => {
    setBusy(true);
    try {
      await api.deleteMedia(item.key, item.referenced);
      toast({ tone: 'success', message: 'File deleted' });
      setDeleting(null);
      await load();
    } catch (err) {
      toast({ tone: 'error', message: (err as Error).message });
    } finally {
      setBusy(false);
    }
  };

  const copy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(url);
      window.setTimeout(() => setCopied(null), 1500);
    } catch {
      toast({ tone: 'error', message: 'Could not copy to the clipboard' });
    }
  };

  return (
    <>
      <PageHeader
        title="Media"
        description="Every image and PDF you have uploaded. Files still used by your content are marked “In use”."
        actions={
          <>
            <Button variant="ghost" icon={<RefreshCw size={15} aria-hidden="true" />} onClick={() => void load()}>
              Refresh
            </Button>
            <Button variant="primary" icon={<Upload size={15} aria-hidden="true" />} busy={uploading !== null} onClick={() => inputRef.current?.click()}>
              {uploading !== null ? `Uploading ${Math.round(uploading * 100)}%` : 'Upload'}
            </Button>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/avif,application/pdf"
              className="sr-only"
              aria-label="Upload a file"
              onChange={(e) => {
                const f = e.target.files?.[0];
                e.target.value = '';
                if (f) void upload(f);
              }}
            />
          </>
        }
      />
      {error && (
        <p role="alert" className="mb-4 text-sm text-[#ff8a8a]">
          {error}
        </p>
      )}
      {!items && !error && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="aspect-[4/5]" />
          ))}
        </div>
      )}
      {items && items.length === 0 && (
        <EmptyState title="No uploads yet" body="Images you add to projects, certifications and other items appear here." />
      )}
      {items && items.length > 0 && (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((m) => (
            <li key={m.key} className="overflow-hidden rounded-2xl border border-[#1b3550] bg-[#0b1c2e]">
              <a href={m.url} target="_blank" rel="noopener noreferrer" className="block bg-[#081b29] focus-visible:outline-2 focus-visible:outline-[#00abf0]">
                {m.purpose === 'image' ? (
                  <img src={m.url} alt={m.originalName} loading="lazy" className="aspect-square w-full object-cover" />
                ) : (
                  <span className="flex aspect-square items-center justify-center text-[#5f7a93]">
                    <FileText size={40} aria-hidden="true" />
                    <span className="sr-only">{m.originalName}</span>
                  </span>
                )}
              </a>
              <div className="space-y-1.5 p-3">
                <p className="truncate text-sm text-white" title={m.originalName}>
                  {m.originalName}
                </p>
                <p className="text-xs text-[#7f97ad]">
                  {formatBytes(m.size)}
                  {m.width ? `, ${m.width}×${m.height}` : ''}
                </p>
                <div className="flex items-center justify-between gap-2">
                  {m.referenced ? <Badge tone="accent">In use</Badge> : <Badge>Unused</Badge>}
                  <div className="flex">
                    <IconButton label={`Copy link to ${m.originalName}`} onClick={() => void copy(m.url)}>
                      {copied === m.url ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
                    </IconButton>
                    <IconButton label={`Delete ${m.originalName}`} tone="danger" onClick={() => setDeleting(m)}>
                      <Trash2 size={15} aria-hidden="true" />
                    </IconButton>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      {deleting && (
        <ConfirmDialog
          title="Delete this file?"
          message={
            deleting.referenced
              ? 'This file is still used by your content. Deleting it will leave a broken image or link until you replace it there.'
              : 'This file is not used anywhere. Deleting it cannot be undone.'
          }
          confirmLabel={deleting.referenced ? 'Delete anyway' : 'Delete'}
          busy={busy}
          onCancel={() => setDeleting(null)}
          onConfirm={() => void remove(deleting)}
        />
      )}
    </>
  );
}
