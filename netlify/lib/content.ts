// Reading / writing the content document in Blobs, plus revision history.
//
// Store layout (portfolio-content[-preview|-dev]):
//   content                                    -> ContentEnvelope { rev, updatedAt, content }
//   revisions/<rev:8>_<updatedAtMs>_<bytes>    -> ContentEnvelope snapshot written by every publish (newest 30 kept)
//   draft, draft-backups/*                      -> the private working copy (see draft.ts)
import { createHash } from 'node:crypto';
import seedJson from '../../src/content/seed.json';
import { validateContent, type ValidationIssue } from '../../src/content/schema';
import type { Content, ContentEnvelope } from '../../src/content/types';
import { HttpError } from './http';
import type { BlobStore } from './stores';

export const CONTENT_KEY = 'content';
export const REVISION_PREFIX = 'revisions/';
export const MAX_REVISIONS = 30;

export const seedContent = seedJson as unknown as Content;

export type ContentSource = 'store' | 'seed';

export interface LoadedContent {
  envelope: ContentEnvelope;
  source: ContentSource;
  /** Blobs etag of the stored entry (used for atomic compare-and-set). */
  blobEtag?: string;
}

export function seedEnvelope(): ContentEnvelope {
  return { rev: 0, updatedAt: seedContent.updatedAt, content: seedContent };
}

function isEnvelope(value: unknown): value is ContentEnvelope {
  if (!value || typeof value !== 'object') return false;
  const v = value as Partial<ContentEnvelope>;
  return typeof v.rev === 'number' && typeof v.updatedAt === 'string' && !!v.content && typeof v.content === 'object';
}

/** Loads the stored envelope, falling back to the bundled seed when the store is empty. */
export async function loadContent(store: BlobStore): Promise<LoadedContent> {
  const entry = await store.getWithMetadata(CONTENT_KEY, { type: 'json' });
  if (entry && isEnvelope(entry.data)) {
    return { envelope: entry.data, source: 'store', blobEtag: entry.etag };
  }
  if (entry) console.error('[content] stored document is malformed; serving seed');
  return { envelope: seedEnvelope(), source: 'seed' };
}

export function revEtag(rev: number): string {
  return `"rev-${rev}"`;
}

/** Parses `If-Match: "rev-N"` (428 when missing, 400 when malformed). */
export function parseIfMatchRev(req: Request): number {
  const raw = req.headers.get('if-match');
  if (!raw) throw new HttpError(428, 'precondition_required', 'If-Match header with the current revision is required');
  const m = /^(?:W\/)?"rev-(\d{1,9})"$/.exec(raw.trim());
  if (!m) throw new HttpError(400, 'bad_if_match', 'If-Match must look like "rev-<number>"');
  return Number(m[1]);
}

export function validationError(issues: ValidationIssue[]): HttpError {
  return new HttpError(400, 'validation_failed', 'The content document is invalid', { issues: issues.slice(0, 50) });
}

/** Validates (migrate + size + schema). Size overflow -> 413, schema errors -> 400. */
export function validateOrThrow(doc: unknown): Content {
  const result = validateContent(doc);
  if (result.success) return result.data;
  const sizeIssue = result.issues.find((i) => i.path === '' && /bytes; limit is/.test(i.message));
  if (sizeIssue) throw new HttpError(413, 'too_large', sizeIssue.message);
  throw validationError(result.issues);
}

const pad = (n: number) => String(n).padStart(8, '0');
const REVISION_ID_RE = /^(\d{8})_(\d{1,15})_(\d{1,9})$/;

export interface RevisionInfo {
  id: string;
  rev: number;
  updatedAt: string;
  size: number;
}

function parseRevisionId(id: string): RevisionInfo | null {
  const m = REVISION_ID_RE.exec(id);
  if (!m) return null;
  return { id, rev: Number(m[1]), updatedAt: new Date(Number(m[2])).toISOString(), size: Number(m[3]) };
}

export async function listRevisions(store: BlobStore): Promise<RevisionInfo[]> {
  const { blobs } = await store.list({ prefix: REVISION_PREFIX });
  return blobs
    .map((b) => parseRevisionId(b.key.slice(REVISION_PREFIX.length)))
    .filter((r): r is RevisionInfo => r !== null)
    .sort((a, b) => b.rev - a.rev || b.updatedAt.localeCompare(a.updatedAt));
}

export async function loadRevision(store: BlobStore, id: string): Promise<ContentEnvelope> {
  if (!REVISION_ID_RE.test(id)) throw new HttpError(404, 'not_found', 'Revision not found');
  const data = await store.get(REVISION_PREFIX + id, { type: 'json' });
  if (!isEnvelope(data)) throw new HttpError(404, 'not_found', 'Revision not found');
  return data;
}

/**
 * Compare-and-set write: `isNew` -> only when the key does not exist yet; otherwise only when the
 * stored Blobs etag still equals `blobEtag`. Returns false when the write lost a race.
 * (The local `netlify dev` blobs server returns no etag on reads; there callers rely on their own
 * revision check, as before.)
 */
export async function casSetJSON(
  store: BlobStore,
  key: string,
  value: unknown,
  isNew: boolean,
  blobEtag: string | undefined,
): Promise<boolean> {
  const options = isNew ? { onlyIfNew: true as const } : blobEtag ? { onlyIfMatch: blobEtag } : {};
  const result = await store.setJSON(key, value, options);
  return result.modified;
}

/**
 * Atomically replaces the content document when `expectedRev` matches the stored revision.
 * Throws 412 (with the current rev) on a mismatch or a lost race. Records a revision snapshot.
 */
export async function writeContent(
  store: BlobStore,
  content: Content,
  expectedRev: number,
): Promise<{ rev: number; updatedAt: string }> {
  const current = await loadContent(store);
  const currentRev = current.envelope.rev;
  if (expectedRev !== currentRev) {
    throw new HttpError(412, 'stale_revision', 'The content changed since it was loaded', { currentRev }, {
      etag: revEtag(currentRev),
    });
  }
  const now = new Date();
  const updatedAt = now.toISOString();
  const envelope: ContentEnvelope = { rev: currentRev + 1, updatedAt, content: { ...content, updatedAt } };
  if (!(await casSetJSON(store, CONTENT_KEY, envelope, current.source === 'seed', current.blobEtag))) {
    throw new HttpError(412, 'stale_revision', 'The content changed while saving', { currentRev: currentRev + 1 });
  }

  const size = Buffer.byteLength(JSON.stringify(envelope));
  try {
    await store.setJSON(`${REVISION_PREFIX}${pad(envelope.rev)}_${now.getTime()}_${size}`, envelope);
    const revisions = await listRevisions(store);
    await Promise.all(revisions.slice(MAX_REVISIONS).map((r) => store.delete(REVISION_PREFIX + r.id)));
  } catch (err) {
    console.error('[content] could not record revision', err);
  }
  return { rev: envelope.rev, updatedAt };
}

/** Strong ETag for a response body. */
export function bodyEtag(body: string): string {
  return `"${createHash('sha256').update(body).digest('base64url').slice(0, 27)}"`;
}

/** Every `/api/media/<key>` reference in a document (keys only). */
export function referencedMediaKeys(content: unknown): Set<string> {
  const keys = new Set<string>();
  const text = JSON.stringify(content);
  const re = /\/api\/media\/(uploads\/[A-Za-z0-9/_.-]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) keys.add(m[1]);
  return keys;
}
