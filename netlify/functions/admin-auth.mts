// GET  /api/admin/session  -> { authenticated, expiresAt? }
// POST /api/admin/login    -> { password } -> 204 + Set-Cookie | 401 | 429
// POST /api/admin/logout   -> 204 (clears the cookie)
import type { Config } from '@netlify/functions';
import {
  clearSessionCookie,
  createSessionToken,
  getAuthConfig,
  getSession,
  hashIp,
  sessionCookie,
  verifyPassword,
} from '../lib/auth';
import { adminJson, assertSameOrigin, errorResponse, handle, HttpError, methodNotAllowed, noContent, notFound, readJson, sleep } from '../lib/http';
import { checkLoginLimit, clearLoginFailures, recordLoginFailure } from '../lib/ratelimit';
import { openStore, type FnContext } from '../lib/stores';

const FAILURE_DELAY_MS = 400;

async function login(req: Request, context: FnContext): Promise<Response> {
  assertSameOrigin(req);
  const { passwordHash, sessionSecret } = getAuthConfig();
  const store = openStore('auth', context);
  const ipHash = hashIp(context.ip, sessionSecret);

  const limit = await checkLoginLimit(store, ipHash);
  if (limit.limited) {
    return errorResponse(429, 'rate_limited', 'Too many failed attempts. Try again later.', undefined, {
      'retry-after': String(limit.retryAfterSeconds),
    });
  }

  const body = await readJson(req, 4096);
  const password = body && typeof body === 'object' ? (body as { password?: unknown }).password : undefined;
  if (typeof password !== 'string' || password.length === 0 || password.length > 256) {
    throw new HttpError(400, 'bad_request', 'Password is required');
  }

  const started = Date.now();
  const ok = await verifyPassword(password, passwordHash);
  if (!ok) {
    await recordLoginFailure(store, ipHash);
    const elapsed = Date.now() - started;
    if (elapsed < FAILURE_DELAY_MS) await sleep(FAILURE_DELAY_MS - elapsed);
    return errorResponse(401, 'invalid_credentials', 'Incorrect password');
  }

  await clearLoginFailures(store, ipHash);
  const { token } = createSessionToken(sessionSecret);
  return noContent({ 'set-cookie': sessionCookie(req, context, token) });
}

export default handle(async (req: Request, context: FnContext) => {
  const action = new URL(req.url).pathname.replace(/\/+$/, '').split('/').pop();
  switch (action) {
    case 'session': {
      if (req.method !== 'GET') return methodNotAllowed(['GET']);
      let session;
      try {
        session = getSession(req, context);
      } catch (err) {
        if (err instanceof HttpError && err.code === 'not_configured') {
          return adminJson({ authenticated: false, configured: false });
        }
        throw err;
      }
      return adminJson(
        session
          ? { authenticated: true, configured: true, expiresAt: new Date(session.exp * 1000).toISOString() }
          : { authenticated: false, configured: true },
      );
    }
    case 'login':
      if (req.method !== 'POST') return methodNotAllowed(['POST']);
      return login(req, context);
    case 'logout':
      if (req.method !== 'POST') return methodNotAllowed(['POST']);
      assertSameOrigin(req);
      return noContent({ 'set-cookie': clearSessionCookie(req, context) });
    default:
      return notFound();
  }
});

export const config: Config = { path: ['/api/admin/session', '/api/admin/login', '/api/admin/logout'] };
