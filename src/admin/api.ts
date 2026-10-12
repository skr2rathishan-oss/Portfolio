// Thin client for the admin API. Every request is same-origin, sends the session
// cookie automatically and carries `X-Admin-Request: 1` (required by the CSRF check).
import type { Content } from '../content/types';

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
  get issues(): { path: string; message: string }[] {
    const d = this.details as { issues?: { path: string; message: string }[] } | undefined;
    return Array.isArray(d?.issues) ? d.issues : [];
  }
}

/** Called when a request comes back 401; resolves once the user signed in again (or rejects). */
type ReauthHandler = () => Promise<void>;
let reauthHandler: ReauthHandler | null = null;
export function setReauthHandler(handler: ReauthHandler | null) {
  reauthHandler = handler;
}

const API_MISSING =
  'The admin API is not reachable. Run the site with `npx netlify-cli dev` (or deploy it) — plain `vite` has no functions.';

async function parseError(res: Response): Promise<ApiError> {
  const type = res.headers.get('content-type') ?? '';
  if (type.includes('application/json')) {
    try {
      const body = (await res.json()) as { error?: { code?: string; message?: string; details?: unknown } };
      if (body.error) {
        return new ApiError(res.status, body.error.code ?? 'error', body.error.message ?? `HTTP ${res.status}`, body.error.details);
      }
    } catch {
      // fall through
    }
  }
  if (res.status === 404) return new ApiError(404, 'api_missing', API_MISSING);
  return new ApiError(res.status, 'http_error', `Request failed (HTTP ${res.status})`);
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  /** Do not try the re-login flow on 401 (used by login/session). */
  noReauth?: boolean;
}

export async function request<T>(path: string, opts: RequestOptions = {}): Promise<{ data: T; res: Response }> {
  const headers: Record<string, string> = { Accept: 'application/json', 'X-Admin-Request': '1', ...opts.headers };
  let body: BodyInit | undefined;
  if (opts.body !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(opts.body);
  }
  let res: Response;
  try {
    res = await fetch(path, { method: opts.method ?? 'GET', headers, body, credentials: 'same-origin', cache: 'no-store' });
  } catch {
    throw new ApiError(0, 'network', navigator.onLine ? 'Could not reach the server' : 'You are offline');
  }
  if (res.status === 401 && !opts.noReauth && reauthHandler) {
    await reauthHandler();
    return request<T>(path, { ...opts, noReauth: true });
  }
  if (!res.ok) throw await parseError(res);
  if (res.status === 204) return { data: undefined as T, res };
  const type = res.headers.get('content-type') ?? '';
  if (!type.includes('application/json')) throw new ApiError(res.status, 'api_missing', API_MISSING);
  return { data: (await res.json()) as T, res };
}

// ── Auth ─────────────────────────────────────────────────────
export interface SessionInfo {
  authenticated: boolean;
  configured?: boolean;
  expiresAt?: string;
}
export const getSession = () => request<SessionInfo>('/api/admin/session', { noReauth: true }).then((r) => r.data);
export const login = (password: string) =>
  request<void>('/api/admin/login', { method: 'POST', body: { password }, noReauth: true }).then(() => undefined);
export const logout = () => request<void>('/api/admin/logout', { method: 'POST', noReauth: true }).then(() => undefined);

// ── Content ──────────────────────────────────────────────────
export interface AdminEnvelope {
  rev: number;
  updatedAt: string;
  source: 'store' | 'seed';
  content: Content;
}
export const getContent = () => request<AdminEnvelope>('/api/admin/content').then((r) => r.data);
export const putContent = (content: Content, rev: number) =>
  request<{ rev: number; updatedAt: string }>('/api/admin/content', {
    method: 'PUT',
    body: { content },
    headers: { 'If-Match': `"rev-${rev}"` },
  }).then((r) => r.data);

// ── Draft / publish (FROZEN client contract; server: netlify/functions/admin-draft.mts, WS-A) ──
// Drafts are private: /api/content only ever serves the published `content` key.
// Every draft mutation sends `If-Match: "draft-N"` (428 when missing, 412 when stale).
export const draftEtag = (draftRev: number) => `"draft-${draftRev}"`;

export interface DraftEnvelope {
  draftRev: number;
  /** Published rev the draft was based on (publish answers 409 `published_changed` when it moved). */
  baseRev: number;
  publishedRev: number;
  updatedAt: string;
  publishedUpdatedAt: string;
  /** 'draft' = stored draft; 'published' / 'seed' = no draft key yet (virtual draft, draftRev 0). */
  source: 'draft' | 'published' | 'seed';
  hasUnpublishedChanges: boolean;
  content: Content;
}
export interface DraftSaveResult {
  draftRev: number;
  updatedAt: string;
  hasUnpublishedChanges: boolean;
}
export interface PublishResult {
  publishedRev: number;
  draftRev: number;
  updatedAt: string;
}
export interface PublishStatus {
  publishedRev: number;
  draftRev: number;
  hasUnpublishedChanges: boolean;
  publishedUpdatedAt: string;
  draftUpdatedAt: string;
}

/** GET /api/admin/draft */
export const getDraft = () => request<DraftEnvelope>('/api/admin/draft').then((r) => r.data);
/** PUT /api/admin/draft — 400 validation (details.issues) / 412 / 413 / 415 / 428. */
export const putDraft = (content: Content, draftRev: number) =>
  request<DraftSaveResult>('/api/admin/draft', {
    method: 'PUT',
    body: { content },
    headers: { 'If-Match': draftEtag(draftRev) },
  }).then((r) => r.data);
/** POST /api/admin/publish — 409 code `published_changed` unless `force`. */
export const publish = (draftRev: number, force = false) =>
  request<PublishResult>('/api/admin/publish', {
    method: 'POST',
    body: force ? { force: true } : {},
    headers: { 'If-Match': draftEtag(draftRev) },
  }).then((r) => r.data);
/** POST /api/admin/draft/discard — backs up the draft, resets it to published; returns the new draft. */
export const discardDraft = (draftRev: number) =>
  request<DraftEnvelope>('/api/admin/draft/discard', {
    method: 'POST',
    headers: { 'If-Match': draftEtag(draftRev) },
  }).then((r) => r.data);
/** POST /api/admin/revisions/:id/restore-to-draft — published content is untouched. */
export const restoreToDraft = (id: string, draftRev: number) =>
  request<DraftSaveResult>(`/api/admin/revisions/${encodeURIComponent(id)}/restore-to-draft`, {
    method: 'POST',
    headers: { 'If-Match': draftEtag(draftRev) },
  }).then((r) => r.data);
/** GET /api/admin/status */
export const getStatus = () => request<PublishStatus>('/api/admin/status').then((r) => r.data);
/** GET /api/admin/export?source=draft|published (default published). */
export const exportUrl = (source: 'draft' | 'published' = 'published') => `/api/admin/export?source=${source}`;

export interface RevisionInfo {
  id: string;
  rev: number;
  updatedAt: string;
  size: number;
}
export const getRevisions = () => request<RevisionInfo[]>('/api/admin/revisions').then((r) => r.data);
export const restoreRevision = (id: string, rev: number) =>
  request<{ rev: number; updatedAt: string }>(`/api/admin/revisions/${encodeURIComponent(id)}/restore`, {
    method: 'POST',
    headers: { 'If-Match': `"rev-${rev}"` },
  }).then((r) => r.data);

// ── Media ────────────────────────────────────────────────────
export interface MediaItem {
  key: string;
  url: string;
  contentType: string;
  size: number;
  purpose: 'image' | 'document';
  originalName: string;
  uploadedAt: string;
  width?: number;
  height?: number;
  referenced: boolean;
}
export const getMedia = () => request<MediaItem[]>('/api/admin/media').then((r) => r.data);
export const deleteMedia = (key: string, force = false) =>
  request<void>(`/api/admin/media/${key}${force ? '?force=1' : ''}`, { method: 'DELETE' }).then(() => undefined);

export interface UploadResult {
  key: string;
  url: string;
  contentType: string;
  size: number;
  width?: number;
  height?: number;
}

/** multipart upload with progress (XHR). Retries once after a re-login on 401. */
export function uploadFile(
  file: Blob,
  fileName: string,
  purpose: 'image' | 'document',
  onProgress?: (fraction: number) => void,
  signal?: AbortSignal,
  retried = false,
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/admin/upload');
    xhr.setRequestHeader('X-Admin-Request', '1');
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.responseType = 'text';
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(e.loaded / e.total);
    };
    xhr.onerror = () => reject(new ApiError(0, 'network', 'Upload failed: could not reach the server'));
    xhr.onabort = () => reject(new ApiError(0, 'aborted', 'Upload cancelled'));
    xhr.onload = async () => {
      const type = xhr.getResponseHeader('content-type') ?? '';
      if (xhr.status === 401 && !retried && reauthHandler) {
        try {
          await reauthHandler();
          resolve(await uploadFile(file, fileName, purpose, onProgress, signal, true));
        } catch (err) {
          reject(err);
        }
        return;
      }
      let body: unknown = null;
      if (type.includes('application/json')) {
        try {
          body = JSON.parse(xhr.responseText);
        } catch {
          body = null;
        }
      }
      if (xhr.status >= 200 && xhr.status < 300 && body) {
        resolve(body as UploadResult);
        return;
      }
      const err = (body as { error?: { code: string; message: string } } | null)?.error;
      if (err) reject(new ApiError(xhr.status, err.code, err.message));
      else if (xhr.status === 404) reject(new ApiError(404, 'api_missing', API_MISSING));
      else reject(new ApiError(xhr.status, 'http_error', `Upload failed (HTTP ${xhr.status})`));
    };
    signal?.addEventListener('abort', () => xhr.abort());
    const form = new FormData();
    form.append('purpose', purpose);
    form.append('file', file, fileName);
    xhr.send(form);
  });
}
