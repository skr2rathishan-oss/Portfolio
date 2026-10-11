// Image and PDF fields: drag & drop / pick / paste a link, client-side resize,
// upload with progress, preview, and a picker for previously uploaded files.
import { FileText, ImagePlus, Library, Link2, Loader2, Trash2, Upload } from 'lucide-react';
import { useEffect, useRef, useState, type DragEvent } from 'react';
import * as api from '../api';
import { formatBytes, MAX_UPLOAD_BYTES, prepareImage } from '../lib/image';
import { Button, cx, focusRing, Modal, Skeleton } from '../ui/primitives';
import { FieldShell, inputClass } from './Field';

const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif,image/avif';

interface UploadState {
  progress: number;
  controller: AbortController;
}

function useUploader(purpose: 'image' | 'document', maxDim: number, onDone: (r: api.UploadResult) => void) {
  const [state, setState] = useState<UploadState | null>(null);
  const [error, setError] = useState<string | null>(null);

  const start = async (file: File) => {
    setError(null);
    if (purpose === 'image' && file.type && !file.type.startsWith('image/')) return setError('Choose an image file (JPEG, PNG, WebP, GIF or AVIF).');
    if (purpose === 'image' && file.type === 'image/svg+xml') return setError('SVG files are not accepted. Export a PNG or WebP instead.');
    if (purpose === 'document' && file.type && file.type !== 'application/pdf') return setError('Choose a PDF file.');
    const controller = new AbortController();
    setState({ progress: 0, controller });
    try {
      const prepared = purpose === 'image' ? await prepareImage(file, maxDim) : { blob: file, fileName: file.name };
      if (prepared.blob.size > MAX_UPLOAD_BYTES) {
        throw new Error(`The file is ${formatBytes(prepared.blob.size)}; the limit is 4 MB.`);
      }
      const result = await api.uploadFile(prepared.blob, prepared.fileName, purpose, (p) =>
        setState((s) => (s ? { ...s, progress: p } : s)), controller.signal);
      onDone(result);
    } catch (err) {
      if ((err as api.ApiError).code !== 'aborted') setError((err as Error).message);
    } finally {
      setState(null);
    }
  };
  return { uploading: state, error, setError, start, cancel: () => state?.controller.abort() };
}

function Progress({ value, onCancel }: { value: number; onCancel: () => void }) {
  const pct = Math.round(value * 100);
  return (
    <div className="flex items-center gap-3 rounded-lg border border-[#27496b] bg-[#0a1a2b] px-3 py-3">
      <Loader2 size={16} className="animate-spin text-[#00abf0]" aria-hidden="true" />
      <div className="flex-1">
        <div
          role="progressbar"
          aria-label="Upload progress"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          className="h-1.5 overflow-hidden rounded-full bg-white/10"
        >
          <div className="h-full bg-[#00abf0] transition-[width]" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-1 text-xs text-[#8ea6bd]">Uploading… {pct}%</p>
      </div>
      <Button size="sm" variant="ghost" onClick={onCancel}>
        Cancel
      </Button>
    </div>
  );
}

export function MediaLibraryDialog({
  purpose,
  onPick,
  onClose,
}: {
  purpose: 'image' | 'document';
  onPick: (url: string) => void;
  onClose: () => void;
}) {
  const [items, setItems] = useState<api.MediaItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    api
      .getMedia()
      .then((all) => setItems(all.filter((m) => m.purpose === purpose)))
      .catch((e: Error) => setError(e.message));
  }, [purpose]);
  return (
    <Modal title={purpose === 'image' ? 'Choose an uploaded image' : 'Choose an uploaded PDF'} onClose={onClose} size="lg">
      {error && <p className="text-sm text-[#ff8a8a]">{error}</p>}
      {!items && !error && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="aspect-square" />
          ))}
        </div>
      )}
      {items && items.length === 0 && <p className="text-sm text-[#8ea6bd]">Nothing uploaded yet.</p>}
      {items && items.length > 0 && (
        <ul className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {items.map((m) => (
            <li key={m.key}>
              <button
                type="button"
                onClick={() => onPick(m.url)}
                className={cx('group block w-full overflow-hidden rounded-xl border border-[#27496b] bg-[#0a1a2b] text-left hover:border-[#00abf0]', focusRing)}
              >
                {m.purpose === 'image' ? (
                  <img src={m.url} alt="" loading="lazy" className="aspect-square w-full object-cover" />
                ) : (
                  <span className="flex aspect-square items-center justify-center text-[#8ea6bd]">
                    <FileText size={36} aria-hidden="true" />
                  </span>
                )}
                <span className="block truncate px-2 py-1.5 text-xs text-[#b8c9d9]">{m.originalName}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}

export function ImageField({
  label,
  value,
  onChange,
  required,
  error,
  hint,
  maxDim = 1920,
  aspect = 'video',
  alt,
  className,
}: {
  label: string;
  value: string | undefined;
  onChange: (url: string | undefined) => void;
  required?: boolean;
  error?: string;
  hint?: string;
  /** Longest edge after client-side resize (1920 covers, 2400 certificates). */
  maxDim?: number;
  aspect?: 'video' | 'square' | 'portrait' | 'wide';
  alt?: { value: string | undefined; onChange: (v: string) => void; label?: string; required?: boolean; error?: string };
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [showLink, setShowLink] = useState(false);
  const [library, setLibrary] = useState(false);
  const [broken, setBroken] = useState(false);
  const up = useUploader('image', maxDim, (r) => {
    setBroken(false);
    onChange(r.url);
  });
  useEffect(() => setBroken(false), [value]);

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void up.start(file);
  };
  const aspectClass = { video: 'aspect-video', square: 'aspect-square', portrait: 'aspect-[3/4]', wide: 'aspect-[1.91/1]' }[aspect];

  return (
    <div className={cx('space-y-3', className)}>
      <FieldShell label={label} required={required} error={(required && !value && error ? 'Add an image' : error) ?? up.error ?? undefined} hint={hint ?? `Drop, choose or paste a link. Images are resized to ${maxDim}px and converted to WebP.`} group>
        {({ id, describedBy }) => (
          <div className="space-y-2">
            <input
              ref={inputRef}
              id={id}
              type="file"
              accept={IMAGE_ACCEPT}
              className="sr-only"
              aria-describedby={describedBy}
              onChange={(e) => {
                const f = e.target.files?.[0];
                e.target.value = '';
                if (f) void up.start(f);
              }}
            />
            {up.uploading ? (
              <Progress value={up.uploading.progress} onCancel={up.cancel} />
            ) : value ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                <div className={cx('relative w-full sm:w-56 shrink-0 overflow-hidden rounded-xl border border-[#27496b] bg-[#081b29]', aspectClass)}>
                  {broken ? (
                    <p className="absolute inset-0 flex items-center justify-center p-3 text-center text-xs text-[#ff8a8a]">Image could not be loaded</p>
                  ) : (
                    <img src={value} alt="" className="h-full w-full object-cover" onError={() => setBroken(true)} />
                  )}
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <p className="truncate font-mono text-xs text-[#8ea6bd]" title={value}>
                    {value}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" icon={<Upload size={14} aria-hidden="true" />} onClick={() => inputRef.current?.click()}>
                      Replace
                    </Button>
                    <Button size="sm" variant="ghost" icon={<Library size={14} aria-hidden="true" />} onClick={() => setLibrary(true)}>
                      Library
                    </Button>
                    <Button size="sm" variant="ghost" icon={<Link2 size={14} aria-hidden="true" />} onClick={() => setShowLink((s) => !s)}>
                      Link
                    </Button>
                    <Button size="sm" variant="ghost" icon={<Trash2 size={14} aria-hidden="true" />} onClick={() => onChange(undefined)}>
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                className={cx(
                  'flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-8 text-center transition-colors',
                  dragging ? 'border-[#00abf0] bg-[#00abf0]/8' : 'border-[#27496b] bg-[#0a1a2b]/60',
                )}
              >
                <ImagePlus size={26} className="text-[#5f7a93]" aria-hidden="true" />
                <p className="text-sm text-[#b8c9d9]">Drop an image here</p>
                <div className="flex flex-wrap justify-center gap-2">
                  <Button size="sm" variant="primary" onClick={() => inputRef.current?.click()}>
                    Choose file
                  </Button>
                  <Button size="sm" variant="ghost" icon={<Library size={14} aria-hidden="true" />} onClick={() => setLibrary(true)}>
                    Library
                  </Button>
                  <Button size="sm" variant="ghost" icon={<Link2 size={14} aria-hidden="true" />} onClick={() => setShowLink((s) => !s)}>
                    Paste link
                  </Button>
                </div>
              </div>
            )}
            {showLink && (
              <input
                aria-label={`${label} link`}
                value={value ?? ''}
                placeholder="https://… or /path/in/site.png"
                onChange={(e) => onChange(e.target.value.trim() || undefined)}
                className={inputClass}
              />
            )}
          </div>
        )}
      </FieldShell>
      {alt && (
        <FieldShell label={alt.label ?? 'Alt text'} required={alt.required} error={alt.error} hint="Describe the image for screen-reader users.">
          {({ id, describedBy, invalid }) => (
            <input
              id={id}
              value={alt.value ?? ''}
              onChange={(e) => alt.onChange(e.target.value)}
              aria-describedby={describedBy}
              aria-invalid={invalid || undefined}
              className={inputClass}
            />
          )}
        </FieldShell>
      )}
      {library && (
        <MediaLibraryDialog
          purpose="image"
          onClose={() => setLibrary(false)}
          onPick={(url) => {
            onChange(url);
            setLibrary(false);
          }}
        />
      )}
    </div>
  );
}

export function FileField({
  label,
  value,
  onChange,
  onUploaded,
  error,
  hint,
  className,
}: {
  label: string;
  value: string | undefined;
  onChange: (url: string | undefined) => void;
  /** Called instead of onChange after an upload, with the original file name. */
  onUploaded?: (url: string, fileName: string) => void;
  error?: string;
  hint?: string;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [library, setLibrary] = useState(false);
  const lastName = useRef('');
  const up = useUploader('document', 0, (r) => {
    if (onUploaded) onUploaded(r.url, lastName.current);
    else onChange(r.url);
  });
  return (
    <FieldShell label={label} error={error ?? up.error ?? undefined} hint={hint ?? 'PDF, up to 4 MB.'} className={className} group>
      {({ id, describedBy }) => (
        <div className="space-y-2">
          <input
            ref={inputRef}
            id={id}
            type="file"
            accept="application/pdf"
            className="sr-only"
            aria-describedby={describedBy}
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = '';
              if (f) {
                lastName.current = f.name;
                void up.start(f);
              }
            }}
          />
          {up.uploading ? (
            <Progress value={up.uploading.progress} onCancel={up.cancel} />
          ) : (
            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[#27496b] bg-[#0a1a2b] px-3 py-2.5">
              <FileText size={18} className="text-[#5f7a93]" aria-hidden="true" />
              {value ? (
                <a href={value} target="_blank" rel="noopener noreferrer" className={cx('min-w-0 flex-1 truncate font-mono text-xs text-[#5ccdf7] hover:underline rounded', focusRing)}>
                  {value}
                </a>
              ) : (
                <span className="flex-1 text-sm text-[#7f97ad]">No file</span>
              )}
              <Button size="sm" icon={<Upload size={14} aria-hidden="true" />} onClick={() => inputRef.current?.click()}>
                {value ? 'Replace' : 'Upload PDF'}
              </Button>
              <Button size="sm" variant="ghost" icon={<Library size={14} aria-hidden="true" />} onClick={() => setLibrary(true)}>
                Library
              </Button>
              {value && (
                <Button size="sm" variant="ghost" icon={<Trash2 size={14} aria-hidden="true" />} onClick={() => onChange(undefined)}>
                  Remove
                </Button>
              )}
            </div>
          )}
          {library && (
            <MediaLibraryDialog
              purpose="document"
              onClose={() => setLibrary(false)}
              onPick={(url) => {
                onChange(url);
                setLibrary(false);
              }}
            />
          )}
        </div>
      )}
    </FieldShell>
  );
}
