// Draft / publish API (session cookie required everywhere; CSRF checks + If-Match on mutations).
// The draft is private: /api/content only ever reads the published `content` key.
//
//   GET  /api/admin/draft                              -> draft body, ETag "draft-N"
//   PUT  /api/admin/draft                              -> body { content }, If-Match "draft-N"
//                                                         -> { draftRev, updatedAt, hasUnpublishedChanges }
//   POST /api/admin/publish                            -> body { force? }, If-Match "draft-N"
//                                                         -> { publishedRev, draftRev, updatedAt } | 409 published_changed
//   POST /api/admin/draft/discard                      -> If-Match "draft-N" -> draft body (draft = published)
//   POST /api/admin/revisions/:id/restore-to-draft     -> If-Match "draft-N" -> { draftRev, updatedAt, hasUnpublishedChanges }
//   GET  /api/admin/status                             -> { publishedRev, draftRev, hasUnpublishedChanges, publishedUpdatedAt, draftUpdatedAt }
//
// Only publish writes a revision snapshot and purges the CDN; draft writes do neither.
import type { Config } from '@netlify/functions';
import { LIMITS } from '../../src/content/schema';
import { requireSession } from '../lib/auth';
import { loadContent, loadRevision, validateOrThrow, writeContent } from '../lib/content';
import {
  backupDraft,
  computeStatus,
  draftBody,
  draftEtag,
  loadDraft,
  parseIfMatchDraft,
  staleDraft,
  writeDraft,
  type LoadedDraft,
} from '../lib/draft';
import {
  adminJson,
  assertSameOrigin,
  handle,
  HttpError,
  methodNotAllowed,
  notFound,
  readJson,
  readTextLimited,
} from '../lib/http';
import { purgePublicCache } from '../lib/publish';
import { openStore, type BlobStore, type FnContext } from '../lib/stores';

const MAX_BODY_BYTES = LIMITS.docBytes + 64 * 1024;
const MAX_SMALL_BODY_BYTES = 1024;

/** Optional small JSON body (publish options). Empty body -> {}. */
async function readOptionalJson(req: Request): Promise<Record<string, unknown>> {
  const text = await readTextLimited(req, MAX_SMALL_BODY_BYTES);
  if (!text.trim()) return {};
  const type = (req.headers.get('content-type') ?? '').toLowerCase();
  if (!type.startsWith('application/json')) {
    throw new HttpError(415, 'unsupported_media_type', 'Expected application/json');
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new HttpError(400, 'invalid_json', 'Request body is not valid JSON');
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new HttpError(400, 'bad_request', 'Body must be a JSON object');
  }
  return parsed as Record<string, unknown>;
}

async function loadBoth(store: BlobStore) {
  const published = await loadContent(store);
  const draft = await loadDraft(store, published);
  return { published, draft };
}

function assertDraftRev(draft: LoadedDraft, expected: number) {
  if (draft.draft.draftRev !== expected) throw staleDraft(draft.draft.draftRev);
}

async function publish(req: Request, context: FnContext, store: BlobStore): Promise<Response> {
  assertSameOrigin(req);
  const expected = parseIfMatchDraft(req);
  const body = await readOptionalJson(req);
  if (body.force !== undefined && typeof body.force !== 'boolean') {
    throw new HttpError(400, 'bad_request', '"force" must be a boolean');
  }
  const force = body.force === true;

  const { published, draft } = await loadBoth(store);
  assertDraftRev(draft, expected);
  const publishedRev = published.envelope.rev;
  if (publishedRev !== draft.draft.baseRev && !force) {
    throw new HttpError(
      409,
      'published_changed',
      'The live site was published from somewhere else after this draft was started. Publish anyway to replace it.',
      { publishedRev, baseRev: draft.draft.baseRev },
    );
  }

  // Validate again: the schema may have tightened since the draft was saved.
  const content = validateOrThrow(draft.draft.content);
  const result = await writeContent(store, content, publishedRev);
  await purgePublicCache(context);

  // Mark the draft as based on the new published revision.
  let draftRev: number;
  try {
    const stored = await writeDraft(store, draft, expected, { content, baseRev: result.rev, updatedAt: result.updatedAt });
    draftRev = stored.draftRev;
  } catch {
    // Another tab saved the draft while publishing: keep its newer content, rebase it once.
    const latest = await loadDraft(store);
    draftRev = latest.draft.draftRev;
    try {
      draftRev = (await writeDraft(store, latest, latest.draft.draftRev, { content: latest.draft.content, baseRev: result.rev }))
        .draftRev;
    } catch (err) {
      console.error('[admin-draft] could not rebase the draft after publishing', err);
    }
  }
  return adminJson(
    { publishedRev: result.rev, draftRev, updatedAt: result.updatedAt },
    { headers: { etag: draftEtag(draftRev) } },
  );
}

export default handle(async (req: Request, context: FnContext) => {
  requireSession(req, context);
  const path = new URL(req.url).pathname.replace(/\/+$/, '');
  const store = openStore('content', context);

  if (path === '/api/admin/draft') {
    if (req.method === 'GET') {
      const { published, draft } = await loadBoth(store);
      return adminJson(draftBody(draft, published), { headers: { etag: draftEtag(draft.draft.draftRev) } });
    }
    if (req.method === 'PUT') {
      assertSameOrigin(req);
      const expected = parseIfMatchDraft(req);
      const body = await readJson(req, MAX_BODY_BYTES);
      if (!body || typeof body !== 'object' || !('content' in body)) {
        throw new HttpError(400, 'bad_request', 'Body must be { "content": { ... } }');
      }
      const content = validateOrThrow((body as { content: unknown }).content);
      const { published, draft } = await loadBoth(store);
      assertDraftRev(draft, expected);
      const stored = await writeDraft(store, draft, expected, { content, baseRev: draft.draft.baseRev });
      const status = computeStatus({ draft: stored, source: 'draft' }, published);
      return adminJson(
        { draftRev: stored.draftRev, updatedAt: stored.updatedAt, hasUnpublishedChanges: status.hasUnpublishedChanges },
        { headers: { etag: draftEtag(stored.draftRev) } },
      );
    }
    return methodNotAllowed(['GET', 'PUT']);
  }

  if (path === '/api/admin/publish') {
    if (req.method !== 'POST') return methodNotAllowed(['POST']);
    return publish(req, context, store);
  }

  if (path === '/api/admin/draft/discard') {
    if (req.method !== 'POST') return methodNotAllowed(['POST']);
    assertSameOrigin(req);
    const expected = parseIfMatchDraft(req);
    const { published, draft } = await loadBoth(store);
    assertDraftRev(draft, expected);
    await backupDraft(store, draft);
    const stored = await writeDraft(store, draft, expected, {
      content: published.envelope.content,
      baseRev: published.envelope.rev,
    });
    const next: LoadedDraft = { draft: stored, source: 'draft' };
    return adminJson(draftBody(next, published), { headers: { etag: draftEtag(stored.draftRev) } });
  }

  const restore = /^\/api\/admin\/revisions\/([^/]+)\/restore-to-draft$/.exec(path);
  if (restore) {
    if (req.method !== 'POST') return methodNotAllowed(['POST']);
    assertSameOrigin(req);
    const expected = parseIfMatchDraft(req);
    const revision = await loadRevision(store, decodeURIComponent(restore[1]));
    const content = validateOrThrow(revision.content);
    const { published, draft } = await loadBoth(store);
    assertDraftRev(draft, expected);
    await backupDraft(store, draft);
    const stored = await writeDraft(store, draft, expected, { content, baseRev: published.envelope.rev });
    const status = computeStatus({ draft: stored, source: 'draft' }, published);
    return adminJson(
      { draftRev: stored.draftRev, updatedAt: stored.updatedAt, hasUnpublishedChanges: status.hasUnpublishedChanges },
      { headers: { etag: draftEtag(stored.draftRev) } },
    );
  }

  if (path === '/api/admin/status') {
    if (req.method !== 'GET') return methodNotAllowed(['GET']);
    const { published, draft } = await loadBoth(store);
    return adminJson(computeStatus(draft, published));
  }

  return notFound();
});

export const config: Config = {
  path: [
    '/api/admin/draft',
    '/api/admin/draft/discard',
    '/api/admin/publish',
    '/api/admin/status',
    '/api/admin/revisions/:id/restore-to-draft',
  ],
};
