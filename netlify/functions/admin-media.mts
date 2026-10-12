// Admin media API (session cookie required; CSRF checks on mutations).
//   POST   /api/admin/upload          multipart: file, purpose=image|document
//                                     -> 201 { key, url, contentType, size, width?, height? } | 413 | 415
//   GET    /api/admin/media           -> [{ key, url, contentType, size, purpose, originalName, uploadedAt, width?, height?, referenced }]
//   DELETE /api/admin/media/<key>     -> 204 | 409 when referenced by the published content or the draft (unless ?force=1)
import { createHash } from 'node:crypto';
import type { Config } from '@netlify/functions';
import { requireSession } from '../lib/auth';
import { loadContent, referencedMediaKeys } from '../lib/content';
import { loadDraft } from '../lib/draft';
import { adminJson, assertSameOrigin, handle, HttpError, methodNotAllowed, noContent, notFound } from '../lib/http';
import {
  MAX_UPLOAD_BYTES,
  MEDIA_KEY_RE,
  mediaUrl,
  sanitizeFileName,
  type MediaMetadata,
  type MediaPurpose,
} from '../lib/media';
import { DOCUMENT_TYPES, EXTENSIONS, IMAGE_TYPES, imageSize, sniffType } from '../lib/sniff';
import { openStore, type FnContext } from '../lib/stores';

const MULTIPART_OVERHEAD = 64 * 1024;

async function upload(req: Request, context: FnContext): Promise<Response> {
  assertSameOrigin(req);
  const type = (req.headers.get('content-type') ?? '').toLowerCase();
  if (!type.startsWith('multipart/form-data')) {
    throw new HttpError(415, 'unsupported_media_type', 'Expected multipart/form-data');
  }
  const declared = Number(req.headers.get('content-length') ?? '');
  if (Number.isFinite(declared) && declared > MAX_UPLOAD_BYTES + MULTIPART_OVERHEAD) {
    throw new HttpError(413, 'too_large', 'Files must be 4 MB or smaller');
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    throw new HttpError(400, 'bad_request', 'Could not read the upload');
  }
  const file = form.get('file');
  const purposeRaw = form.get('purpose');
  const purpose: MediaPurpose | null = purposeRaw === 'image' || purposeRaw === 'document' ? purposeRaw : null;
  if (!purpose) throw new HttpError(400, 'bad_request', 'purpose must be "image" or "document"');
  if (!file || typeof file === 'string') throw new HttpError(400, 'bad_request', 'A file is required');
  if (file.size > MAX_UPLOAD_BYTES) throw new HttpError(413, 'too_large', 'Files must be 4 MB or smaller');
  if (file.size === 0) throw new HttpError(400, 'bad_request', 'The file is empty');

  const bytes = new Uint8Array(await file.arrayBuffer());
  const sniffed = sniffType(bytes);
  const allowed = purpose === 'image' ? IMAGE_TYPES : DOCUMENT_TYPES;
  if (!sniffed || !allowed.includes(sniffed)) {
    throw new HttpError(
      415,
      'unsupported_media_type',
      purpose === 'image' ? 'Images must be JPEG, PNG, WebP, GIF or AVIF' : 'Documents must be PDF files',
    );
  }

  const hash = createHash('sha256').update(bytes).digest('hex').slice(0, 16);
  const now = new Date();
  const key = `uploads/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, '0')}/${hash}.${EXTENSIONS[sniffed]}`;
  const size = sniffed === 'application/pdf' ? undefined : imageSize(bytes, sniffed);
  const metadata: MediaMetadata = {
    contentType: sniffed,
    size: bytes.byteLength,
    purpose,
    originalName: sanitizeFileName(file.name || 'upload'),
    uploadedAt: now.toISOString(),
    ...(size ? { width: size.width, height: size.height } : {}),
  };
  // Content-addressed: an identical file uploaded again in the same month keeps the existing entry.
  await openStore('media', context).set(key, bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer, {
    metadata,
    onlyIfNew: true,
  });

  return adminJson(
    {
      key,
      url: mediaUrl(key),
      contentType: sniffed,
      size: bytes.byteLength,
      ...(size ? { width: size.width, height: size.height } : {}),
    },
    { status: 201 },
  );
}

/** Media keys used by the published document or the draft (a draft-only upload is "in use" too). */
async function referencedKeys(context: FnContext): Promise<Set<string>> {
  const store = openStore('content', context);
  const published = await loadContent(store);
  const { draft } = await loadDraft(store, published);
  const keys = referencedMediaKeys(published.envelope.content);
  for (const key of referencedMediaKeys(draft.content)) keys.add(key);
  return keys;
}

async function list(context: FnContext): Promise<Response> {
  const store = openStore('media', context);
  const [{ blobs }, referenced] = await Promise.all([store.list({ prefix: 'uploads/' }), referencedKeys(context)]);
  const items = await Promise.all(
    blobs
      .filter((b) => MEDIA_KEY_RE.test(b.key))
      .map(async (b) => {
        const meta = ((await store.getMetadata(b.key))?.metadata ?? {}) as Partial<MediaMetadata>;
        return {
          key: b.key,
          url: mediaUrl(b.key),
          contentType: meta.contentType ?? 'application/octet-stream',
          size: meta.size ?? 0,
          purpose: meta.purpose ?? 'image',
          originalName: meta.originalName ?? b.key.split('/').pop(),
          uploadedAt: meta.uploadedAt ?? '',
          ...(meta.width ? { width: meta.width, height: meta.height } : {}),
          referenced: referenced.has(b.key),
        };
      }),
  );
  items.sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
  return adminJson(items);
}

async function remove(req: Request, context: FnContext, key: string): Promise<Response> {
  assertSameOrigin(req);
  if (!MEDIA_KEY_RE.test(key)) return notFound('Media not found');
  const force = new URL(req.url).searchParams.get('force') === '1';
  if (!force) {
    if ((await referencedKeys(context)).has(key)) {
      throw new HttpError(409, 'in_use', 'This file is still used by your content. Remove it there first or force delete.');
    }
  }
  await openStore('media', context).delete(key);
  return noContent();
}

export default handle(async (req: Request, context: FnContext) => {
  requireSession(req, context);
  const path = new URL(req.url).pathname;

  if (path === '/api/admin/upload') {
    if (req.method !== 'POST') return methodNotAllowed(['POST']);
    return upload(req, context);
  }
  if (path === '/api/admin/media' || path === '/api/admin/media/') {
    if (req.method !== 'GET') return methodNotAllowed(['GET']);
    return list(context);
  }
  if (path.startsWith('/api/admin/media/')) {
    if (req.method !== 'DELETE') return methodNotAllowed(['DELETE']);
    return remove(req, context, decodeURIComponent(path.slice('/api/admin/media/'.length)));
  }
  return notFound();
});

export const config: Config = { path: ['/api/admin/upload', '/api/admin/media', '/api/admin/media/*'] };
