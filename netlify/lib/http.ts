// Shared HTTP helpers for the Netlify functions.
// Every error body has the shape { error: { code, message, details? } }.
// No CORS headers are ever emitted: the API is same-origin only.

export interface ApiErrorBody {
  error: { code: string; message: string; details?: unknown };
}

export const NO_STORE = 'no-store';

export function json(data: unknown, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers);
  if (!headers.has('content-type')) headers.set('content-type', 'application/json; charset=utf-8');
  headers.set('x-content-type-options', 'nosniff');
  return new Response(JSON.stringify(data), { ...init, headers });
}

export function errorResponse(
  status: number,
  code: string,
  message: string,
  details?: unknown,
  headers: HeadersInit = {},
): Response {
  const body: ApiErrorBody = { error: { code, message, ...(details === undefined ? {} : { details }) } };
  const h = new Headers(headers);
  if (!h.has('cache-control')) h.set('cache-control', NO_STORE);
  return json(body, { status, headers: h });
}

export function noContent(headers: HeadersInit = {}): Response {
  const h = new Headers(headers);
  if (!h.has('cache-control')) h.set('cache-control', NO_STORE);
  h.set('x-content-type-options', 'nosniff');
  return new Response(null, { status: 204, headers: h });
}

/** Admin JSON response: never cached anywhere. */
export function adminJson(data: unknown, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers);
  headers.set('cache-control', NO_STORE);
  return json(data, { ...init, headers });
}

export function methodNotAllowed(allowed: string[]): Response {
  return errorResponse(405, 'method_not_allowed', 'Method not allowed', undefined, { allow: allowed.join(', ') });
}

export function notFound(message = 'Not found'): Response {
  return errorResponse(404, 'not_found', message);
}

/** Thrown inside handlers to short-circuit with an error response. */
export class HttpError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
    public headers: HeadersInit = {},
  ) {
    super(message);
  }
  toResponse(): Response {
    return errorResponse(this.status, this.code, this.message, this.details, this.headers);
  }
}

/** Wraps a handler so HttpError -> JSON error and anything else -> 500 (without leaking internals). */
export function handle<A extends unknown[]>(fn: (...args: A) => Promise<Response>) {
  return async (...args: A): Promise<Response> => {
    try {
      return await fn(...args);
    } catch (err) {
      if (err instanceof HttpError) return err.toResponse();
      console.error('[function error]', err);
      return errorResponse(500, 'internal', 'Something went wrong on the server');
    }
  };
}

/**
 * CSRF protection for state-changing admin requests:
 *  - Origin header must be present and equal the request's own origin;
 *  - Sec-Fetch-Site, when sent, must be same-origin;
 *  - the custom header `X-Admin-Request: 1` must be present (forces a CORS preflight cross-site).
 * The session cookie is also SameSite=Strict.
 */
export function assertSameOrigin(req: Request): void {
  const origin = req.headers.get('origin');
  const own = new URL(req.url).origin;
  if (!origin || origin !== own) {
    throw new HttpError(403, 'bad_origin', 'Cross-origin request rejected');
  }
  const site = req.headers.get('sec-fetch-site');
  if (site && site !== 'same-origin') {
    throw new HttpError(403, 'bad_origin', 'Cross-site request rejected');
  }
  if (req.headers.get('x-admin-request') !== '1') {
    throw new HttpError(403, 'missing_header', 'Missing X-Admin-Request header');
  }
}

/** Reads a request body as text, enforcing a byte limit (413). */
export async function readTextLimited(req: Request, maxBytes: number): Promise<string> {
  const declared = Number(req.headers.get('content-length') ?? '');
  if (Number.isFinite(declared) && declared > maxBytes) {
    throw new HttpError(413, 'too_large', `Request body exceeds ${maxBytes} bytes`);
  }
  const buf = await req.arrayBuffer();
  if (buf.byteLength > maxBytes) {
    throw new HttpError(413, 'too_large', `Request body exceeds ${maxBytes} bytes`);
  }
  return new TextDecoder().decode(buf);
}

export async function readJson(req: Request, maxBytes: number): Promise<unknown> {
  const type = (req.headers.get('content-type') ?? '').toLowerCase();
  if (!type.startsWith('application/json')) {
    throw new HttpError(415, 'unsupported_media_type', 'Expected application/json');
  }
  const text = await readTextLimited(req, maxBytes);
  try {
    return JSON.parse(text);
  } catch {
    throw new HttpError(400, 'invalid_json', 'Request body is not valid JSON');
  }
}

/** Parses an If-Match / If-None-Match header into its list of entity tags (weak prefix stripped). */
export function parseEtagList(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map((s) => s.trim().replace(/^W\//, ''))
    .filter(Boolean);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
