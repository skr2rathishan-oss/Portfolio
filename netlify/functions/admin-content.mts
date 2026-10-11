// Admin content API (session cookie required everywhere; CSRF checks on mutations).
//   GET  /api/admin/content                  -> { rev, updatedAt, source, content }   ETag "rev-N"
//   PUT  /api/admin/content                  -> body { content }, If-Match "rev-N"     -> { rev, updatedAt }
//   GET  /api/admin/revisions                -> [{ id, rev, updatedAt, size }]
//   POST /api/admin/revisions/:id/restore    -> If-Match "rev-N"                       -> { rev, updatedAt }
//   GET  /api/admin/export                   -> envelope as a JSON attachment
import { purgeCache, type Config } from '@netlify/functions';
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
import { adminJson, assertSameOrigin, handle, HttpError, methodNotAllowed, notFound, readJson } from '../lib/http';
import { deployContextKind, openStore, type FnContext } from '../lib/stores';

const MAX_BODY_BYTES = LIMITS.docBytes + 64 * 1024;

async function purgePublicCache(context: FnContext): Promise<void> {
  if (deployContextKind(context) === 'dev') return;
  try {
    await purgeCache({ tags: ['content'] });
  } catch (err) {
    // The CDN entry still revalidates within max-age; log and continue.
    console.error('[admin-content] cache purge failed', err);
  }
}

async function save(context: FnContext, doc: unknown, expectedRev: number): Promise<Response> {
  const content = validateOrThrow(doc);
  const result = await writeContent(openStore('content', context), content, expectedRev);
  await purgePublicCache(context);
  return adminJson(result, { headers: { etag: revEtag(result.rev) } });
}

export default handle(async (req: Request, context: FnContext) => {
  requireSession(req, context);
  const path = new URL(req.url).pathname.replace(/\/+$/, '');
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
      return save(context, (body as { content: unknown }).content, expectedRev);
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
    return save(context, revision.content, expectedRev);
  }

  if (path === '/api/admin/export') {
    if (req.method !== 'GET') return methodNotAllowed(['GET']);
    const { envelope } = await loadContent(store());
    const date = new Date().toISOString().slice(0, 10);
    return adminJson(envelope, {
      headers: { 'content-disposition': `attachment; filename="portfolio-content-rev${envelope.rev}-${date}.json"` },
    });
  }

  return notFound();
});

export const config: Config = {
  path: ['/api/admin/content', '/api/admin/revisions', '/api/admin/revisions/:id/restore', '/api/admin/export'],
};
