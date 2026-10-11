// GET|HEAD /api/content — public content document (hidden items removed).
// Cached at the CDN (durable, purged by tag "content" on every admin save) and
// revalidated by browsers with a strong ETag.
import type { Config } from '@netlify/functions';
import { normalizePublic } from '../../src/content/selectors';
import { loadContent, bodyEtag, seedEnvelope, type LoadedContent } from '../lib/content';
import { handle, methodNotAllowed, parseEtagList } from '../lib/http';
import { openStore, type FnContext } from '../lib/stores';

export default handle(async (req: Request, context: FnContext) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return methodNotAllowed(['GET', 'HEAD']);

  let loaded: LoadedContent;
  let degraded = false;
  try {
    loaded = await loadContent(openStore('content', context));
  } catch (err) {
    console.error('[content] store unavailable, serving seed', err);
    loaded = { envelope: seedEnvelope(), source: 'seed' };
    degraded = true;
  }

  const body = JSON.stringify(normalizePublic(loaded.envelope.content));
  const etag = bodyEtag(body);
  const headers = new Headers({
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'public, max-age=0, must-revalidate',
    'netlify-cdn-cache-control': degraded
      ? 'public, max-age=30'
      : 'public, durable, max-age=3600, stale-while-revalidate=86400',
    'netlify-cache-tag': 'content',
    etag,
    'x-content-source': loaded.source,
    'x-content-rev': String(loaded.envelope.rev),
    'x-content-type-options': 'nosniff',
  });

  if (parseEtagList(req.headers.get('if-none-match')).includes(etag)) {
    return new Response(null, { status: 304, headers });
  }
  return new Response(req.method === 'HEAD' ? null : body, { status: 200, headers });
});

export const config: Config = { path: '/api/content' };
