// The private working copy ("draft") that the admin edits, stored beside the published document.
//
// Store layout (same content store as content.ts):
//   content                 -> published ContentEnvelope (the only key /api/content ever reads)
//   draft                   -> StoredDraft { draftRev, baseRev, updatedAt, content }
//   draft-backups/<ms>_<n>  -> StoredDraft saved before a discard / restore overwrote it (newest 10 kept)
//
// When there is no `draft` key yet, the published document is served as a virtual draft with
// draftRev 0; the first PUT with `If-Match: "draft-0"` creates the key (onlyIfNew).
// `hasUnpublishedChanges` is computed on every read and never stored.
import { createHash } from 'node:crypto';
import { validateContent } from '../../src/content/schema';
import type { Content } from '../../src/content/types';
import { casSetJSON, loadContent, type LoadedContent } from './content';
import { HttpError } from './http';
import type { BlobStore } from './stores';

export const DRAFT_KEY = 'draft';
export const DRAFT_BACKUP_PREFIX = 'draft-backups/';
export const MAX_DRAFT_BACKUPS = 10;

export interface StoredDraft {
  draftRev: number;
  /** Published rev this draft was based on; publish answers 409 `published_changed` when it moved. */
  baseRev: number;
  updatedAt: string;
  content: Content;
}

export type DraftSource = 'draft' | 'published' | 'seed';

export interface LoadedDraft {
  draft: StoredDraft;
  /** 'draft' when the key exists; otherwise the virtual draft mirrors the published document. */
  source: DraftSource;
  blobEtag?: string;
  /** The  key exists but is unreadable: the next write overwrites it instead of using onlyIfNew. */
  malformed?: boolean;
}

function isStoredDraft(value: unknown): value is StoredDraft {
  if (!value || typeof value !== 'object') return false;
  const v = value as Partial<StoredDraft>;
  return (
    typeof v.draftRev === 'number' &&
    typeof v.baseRev === 'number' &&
    typeof v.updatedAt === 'string' &&
    !!v.content &&
    typeof v.content === 'object'
  );
}

export function draftEtag(draftRev: number): string {
  return `"draft-${draftRev}"`;
}

/** Parses `If-Match: "draft-N"` (428 when missing, 400 when malformed). */
export function parseIfMatchDraft(req: Request): number {
  const raw = req.headers.get('if-match');
  if (!raw) throw new HttpError(428, 'precondition_required', 'If-Match header with the current draft revision is required');
  const m = /^(?:W\/)?"draft-(\d{1,9})"$/.exec(raw.trim());
  if (!m) throw new HttpError(400, 'bad_if_match', 'If-Match must look like "draft-<number>"');
  return Number(m[1]);
}

export function staleDraft(currentDraftRev: number, message = 'The draft changed since it was loaded'): HttpError {
  return new HttpError(412, 'stale_draft', message, { currentDraftRev }, { etag: draftEtag(currentDraftRev) });
}

/** Loads the stored draft, or the virtual draft (draftRev 0) built from the published document. */
export async function loadDraft(store: BlobStore, published?: LoadedContent): Promise<LoadedDraft> {
  const entry = await store.getWithMetadata(DRAFT_KEY, { type: 'json' });
  if (entry && isStoredDraft(entry.data)) return { draft: entry.data, source: 'draft', blobEtag: entry.etag };
  if (entry) console.error('[draft] stored draft is malformed; falling back to the published document');
  const pub = published ?? (await loadContent(store));
  return {
    ...(entry ? { malformed: true, blobEtag: entry.etag } : {}),
    draft: {
      draftRev: 0,
      baseRev: pub.envelope.rev,
      updatedAt: pub.envelope.updatedAt,
      content: pub.envelope.content,
    },
    source: pub.source === 'seed' ? 'seed' : 'published',
  };
}

/**
 * Atomically replaces the draft when `expectedDraftRev` matches. Returns the new stored draft.
 * Throws 412 `stale_draft` (with currentDraftRev) on a mismatch or a lost race.
 */
export async function writeDraft(
  store: BlobStore,
  current: LoadedDraft,
  expectedDraftRev: number,
  next: { content: Content; baseRev: number; updatedAt?: string },
): Promise<StoredDraft> {
  if (expectedDraftRev !== current.draft.draftRev) throw staleDraft(current.draft.draftRev);
  const updatedAt = next.updatedAt ?? new Date().toISOString();
  const stored: StoredDraft = {
    draftRev: current.draft.draftRev + 1,
    baseRev: next.baseRev,
    updatedAt,
    content: { ...next.content, updatedAt },
  };
  const ok = await casSetJSON(store, DRAFT_KEY, stored, current.source !== 'draft' && !current.malformed, current.blobEtag);
  if (!ok) throw staleDraft(current.draft.draftRev + 1, 'The draft changed while saving');
  return stored;
}

/** Copies the stored draft to draft-backups/ (no-op for a virtual draft) and trims old backups. */
export async function backupDraft(store: BlobStore, current: LoadedDraft): Promise<void> {
  if (current.source !== 'draft') return;
  try {
    const key = `${DRAFT_BACKUP_PREFIX}${Date.now()}_${current.draft.draftRev}`;
    await store.setJSON(key, current.draft);
    const { blobs } = await store.list({ prefix: DRAFT_BACKUP_PREFIX });
    // The listing may not include the entry just written yet; count it explicitly. Filter by the
    // exact prefix: some Blobs backends (the local dev server) also list the sibling `draft` key.
    const listed = blobs.map((b) => b.key).filter((k) => k.startsWith(DRAFT_BACKUP_PREFIX));
    const keys = [...new Set([key, ...listed])].sort((a, b) => {
        const ms = (k: string) => Number(k.slice(DRAFT_BACKUP_PREFIX.length).split('_')[0]) || 0;
        return ms(b) - ms(a);
      });
    await Promise.all(keys.slice(MAX_DRAFT_BACKUPS).map((k) => store.delete(k)));
  } catch (err) {
    // A failed backup must never block the user's action; it is logged for the owner.
    console.error('[draft] could not back up the draft', err);
  }
}

// ── Change detection ─────────────────────────────────────────

/** JSON with object keys sorted, so equal documents hash equally regardless of key order. */
function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj)
      .filter((k) => obj[k] !== undefined)
      .sort();
    return `{${keys.map((k) => `${JSON.stringify(k)}:${canonicalJson(obj[k])}`).join(',')}}`;
  }
  return JSON.stringify(value) ?? 'null';
}

/** Hash of a document ignoring `updatedAt` (normalized through the schema when it validates). */
export function contentFingerprint(content: unknown): string {
  const parsed = validateContent(content);
  const doc = (parsed.success ? parsed.data : content) as Record<string, unknown>;
  return createHash('sha256')
    .update(canonicalJson({ ...doc, updatedAt: '' }))
    .digest('base64url');
}

export function hasUnpublishedChanges(draft: StoredDraft, published: LoadedContent): boolean {
  return contentFingerprint(draft.content) !== contentFingerprint(published.envelope.content);
}

export interface PublishStatusBody {
  publishedRev: number;
  draftRev: number;
  hasUnpublishedChanges: boolean;
  publishedUpdatedAt: string;
  draftUpdatedAt: string;
}

export function computeStatus(draft: LoadedDraft, published: LoadedContent): PublishStatusBody {
  return {
    publishedRev: published.envelope.rev,
    draftRev: draft.draft.draftRev,
    // A virtual draft is the published document by definition.
    hasUnpublishedChanges: draft.source === 'draft' && hasUnpublishedChanges(draft.draft, published),
    publishedUpdatedAt: published.envelope.updatedAt,
    draftUpdatedAt: draft.draft.updatedAt,
  };
}

/** Full GET /api/admin/draft body. */
export function draftBody(draft: LoadedDraft, published: LoadedContent) {
  const status = computeStatus(draft, published);
  return {
    draftRev: draft.draft.draftRev,
    baseRev: draft.draft.baseRev,
    publishedRev: status.publishedRev,
    updatedAt: draft.draft.updatedAt,
    publishedUpdatedAt: status.publishedUpdatedAt,
    source: draft.source,
    hasUnpublishedChanges: status.hasUnpublishedChanges,
    content: draft.draft.content,
  };
}
