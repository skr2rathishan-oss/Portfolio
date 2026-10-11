// GET|HEAD /api/media/<key> — serves an uploaded file with its sniffed content type.
// Keys are content-addressed, so responses are immutable.
import type { Config } from '@netlify/functions';
import { handle, methodNotAllowed, notFound, parseEtagList } from '../lib/http';
import { MEDIA_KEY_RE, type MediaMetadata } from '../lib/media';
import { openStore, type FnContext } from '../lib/stores';

const PREFIX = '/api/media/';

export default handle(async (req: Request, context: FnContext) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return methodNotAllowed(['GET', 'HEAD']);
  const { pathname } = new URL(req.url);
  const key = decodeURIComponent(pathname.slice(PREFIX.length));
  if (!pathname.startsWith(PREFIX) || !MEDIA_KEY_RE.test(key)) return notFound();

  const store = openStore('media', context);
  const etag = `"${key.slice(-24)}"`;
  const headers = new Headers({
    'cache-control': 'public, max-age=31536000, immutable',
    'x-content-type-options': 'nosniff',
    'cross-origin-resource-policy': 'same-origin',
    etag,
  });

  if (parseEtagList(req.headers.get('if-none-match')).includes(etag)) {
    return new Response(null, { status: 304, headers });
  }

  const entry = await store.getWithMetadata(key, { type: 'arrayBuffer' });
  if (!entry) return notFound();
  const meta = entry.metadata as Partial<MediaMetadata>;
  const type = typeof meta.contentType === 'string' ? meta.contentType : 'application/octet-stream';
  headers.set('content-type', type);
  headers.set('content-length', String(entry.data.byteLength));
  if (type === 'application/pdf') {
    // No CSP sandbox here: browsers refuse to open sandboxed PDFs in their built-in viewer.
    const raw = typeof meta.originalName === 'string' ? meta.originalName : 'document.pdf';
    const name = raw.replace(/[^\x20-\x7e]/g, '_').replace(/["\\;]/g, '') || 'document.pdf';
    headers.set('content-disposition', `inline; filename="${name}"`);
  } else {
    headers.set('content-security-policy', "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; sandbox");
  }
  return new Response(req.method === 'HEAD' ? null : entry.data, { status: 200, headers });
});

export const config: Config = { path: '/api/media/*' };
