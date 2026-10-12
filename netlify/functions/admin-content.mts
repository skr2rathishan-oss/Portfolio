// Admin content API (session cookie required everywhere; CSRF checks on mutations).
// The admin UI edits the private draft (see admin-draft.mts); these routes act on the published
// document directly.
//   GET  /api/admin/content                  -> { rev, updatedAt, source, content }   ETag "rev-N"  (published)
//   PUT  /api/admin/content                  -> body { content }, If-Match "rev-N"     -> { rev, updatedAt }
//                                               Legacy direct publish, kept for compatibility; the admin UI no
//                                               longer calls it. The draft is left alone (its status is computed).
//   GET  /api/admin/revisions                -> [{ id, rev, updatedAt, size }]
//   POST /api/admin/revisions/:id/restore    -> If-Match "rev-N" -> { rev, updatedAt }
//                                               "Restore & publish now": publishes the revision, then backs up the
//                                               draft and resets it to the restored content.
//   GET  /api/admin/export?source=published|draft -> envelope as a JSON attachment (default: published)
import type { Config } from '@netlify/functions';
import type { Content } from '../../src/content/types';
import { LIMITS } from '../../src/content/schema';
import { requireSession } from '../lib/auth';
import {
  listRevisions,
  loadContent,
  loadRevision,
  parseIfMatchRev,
  revEtag,
  validateOrThrow,
  writeContent,
} from '../lib/content';
import { loadDraft } from '../lib/draft';
import { adminJson, assertSameOrigin, handle, HttpError, methodNotAllowed, notFound, readJson } from '../lib/http';
import { purgePublicCache, resetDraftAfterPublish } from '../lib/publish';
import { openStore, type FnContext } from '../lib/stores';

const MAX_BODY_BYTES = LIMITS.docBytes + 64 * 1024;

async function publishContent(context: FnContext, doc: unknown, expectedRev: number): Promise<{ rev: number; updatedAt: string; content: Content }> {
  const content = validateOrThrow(doc);
  const result = await writeContent(openStore('content', context), content, expectedRev);
  await purgePublicCache(context);
  return { ...result, content };
}

export default handle(async (req: Request, context: FnContext) => {
  requireSession(req, context);
  const url = new URL(req.url);
  const path = url.pathname.replace(/\/+$/, '');
  const store = () => openStore('content', context);

  if (path === '/api/admin/content') {
    if (req.method === 'GET') {
      const { envelope, source } = await loadContent(store());
      return adminJson({ ...envelope, source }, { headers: { etag: revEtag(envelope.rev) } });
    }
    if (req.method === 'PUT') {
      assertSameOrigin(req);
      const expectedRev = parseIfMatchRev(req);
      const body = await readJson(req, MAX_BODY_BYTES);
      if (!body || typeof body !== 'object' || !('content' in body)) {
        throw new HttpError(400, 'bad_request', 'Body must be { "content": { ... } }');
      }
      const { rev, updatedAt } = await publishContent(context, (body as { content: unknown }).content, expectedRev);
      return adminJson({ rev, updatedAt }, { headers: { etag: revEtag(rev) } });
    }
    return methodNotAllowed(['GET', 'PUT']);
  }

  if (path === '/api/admin/revisions') {
    if (req.method !== 'GET') return methodNotAllowed(['GET']);
    return adminJson(await listRevisions(store()));
  }

  const restore = /^\/api\/admin\/revisions\/([^/]+)\/restore$/.exec(path);
  if (restore) {
    if (req.method !== 'POST') return methodNotAllowed(['POST']);
    assertSameOrigin(req);
    const expectedRev = parseIfMatchRev(req);
    const revision = await loadRevision(store(), decodeURIComponent(restore[1]));
    const { rev, updatedAt, content } = await publishContent(context, revision.content, expectedRev);
    await resetDraftAfterPublish(store(), content, rev);
    return adminJson({ rev, updatedAt }, { headers: { etag: revEtag(rev) } });
  }

  if (path === '/api/admin/export') {
    if (req.method !== 'GET') return methodNotAllowed(['GET']);
    const source = url.searchParams.get('source') ?? 'published';
    if (source !== 'published' && source !== 'draft') {
      throw new HttpError(400, 'bad_request', 'source must be "published" or "draft"');
    }
    const date = new Date().toISOString().slice(0, 10);
    if (source === 'draft') {
      const { draft } = await loadDraft(store());
      return adminJson(draft, {
        headers: { 'content-disposition': `attachment; filename="portfolio-draft${draft.draftRev}-${date}.json"` },
      });
    }
    const { envelope } = await loadContent(store());
    return adminJson(envelope, {
      headers: { 'content-disposition': `attachment; filename="portfolio-content-rev${envelope.rev}-${date}.json"` },
    });
  }

  return notFound();
});

export const config: Config = {
  path: ['/api/admin/content', '/api/admin/revisions', '/api/admin/revisions/:id/restore', '/api/admin/export'],
};
