// Password verification (scrypt) and stateless HMAC-signed session tokens.
//
// ADMIN_PASSWORD_HASH   = "scrypt:N:r:p:saltB64:hashB64"   (generate with scripts/hash-password.mjs)
// ADMIN_SESSION_SECRET  = random string, at least 32 characters
//
// Token  = base64url(JSON {sub, iat, exp}) + "." + base64url(HMAC-SHA256(secret, payload))
// Cookie = __Host-pa_session (production / previews, Secure) or pa_session (netlify dev over http).
import { createHmac, scrypt as scryptCb, timingSafeEqual, type ScryptOptions } from 'node:crypto';
import { HttpError } from './http';
import { deployContextKind, type FnContext } from './stores';

export const SESSION_TTL_SECONDS = 12 * 60 * 60; // 43200
const SUBJECT = 'admin';

function scrypt(password: string, salt: Buffer, keylen: number, options: ScryptOptions): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCb(password, salt, keylen, options, (err, key) => (err ? reject(err) : resolve(key)));
  });
}

export interface AuthConfig {
  passwordHash: string;
  sessionSecret: string;
}

/** Reads auth configuration from the environment; 503 when the site owner has not configured it. */
export function getAuthConfig(): AuthConfig {
  const passwordHash = process.env.ADMIN_PASSWORD_HASH ?? '';
  const sessionSecret = process.env.ADMIN_SESSION_SECRET ?? '';
  if (!passwordHash.startsWith('scrypt:') || sessionSecret.length < 32) {
    throw new HttpError(
      503,
      'not_configured',
      'Admin login is not configured. Set ADMIN_PASSWORD_HASH and ADMIN_SESSION_SECRET (>= 32 chars).',
    );
  }
  return { passwordHash, sessionSecret };
}

/** Constant-time check of a password against "scrypt:N:r:p:saltB64:hashB64". Never throws. */
export async function verifyPassword(password: string, encoded: string): Promise<boolean> {
  try {
    const parts = encoded.split(':');
    if (parts.length !== 6 || parts[0] !== 'scrypt') return false;
    const N = Number(parts[1]);
    const r = Number(parts[2]);
    const p = Number(parts[3]);
    if (![N, r, p].every(Number.isInteger) || N < 2 ** 14 || N > 2 ** 20 || r < 1 || r > 32 || p < 1 || p > 16) {
      return false;
    }
    const salt = Buffer.from(parts[4], 'base64');
    const expected = Buffer.from(parts[5], 'base64');
    if (salt.length < 16 || expected.length < 32) return false;
    const actual = await scrypt(password.normalize('NFKC'), salt, expected.length, {
      N,
      r,
      p,
      maxmem: 256 * N * r + 1024 * 1024,
    });
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

const b64url = (buf: Buffer | string) => Buffer.from(buf).toString('base64url');

function sign(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

export interface SessionClaims {
  sub: string;
  iat: number;
  exp: number;
}

export function createSessionToken(secret: string, now = Date.now()): { token: string; claims: SessionClaims } {
  const iat = Math.floor(now / 1000);
  const claims: SessionClaims = { sub: SUBJECT, iat, exp: iat + SESSION_TTL_SECONDS };
  const payload = b64url(JSON.stringify(claims));
  return { token: `${payload}.${sign(payload, secret)}`, claims };
}

export function verifySessionToken(token: string, secret: string, now = Date.now()): SessionClaims | null {
  const dot = token.indexOf('.');
  if (dot <= 0 || dot !== token.lastIndexOf('.') || token.length > 1024) return null;
  const payload = token.slice(0, dot);
  const sig = Buffer.from(token.slice(dot + 1), 'base64url');
  const expected = Buffer.from(sign(payload, secret), 'base64url');
  if (sig.length !== expected.length || !timingSafeEqual(sig, expected)) return null;
  try {
    const claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as SessionClaims;
    const nowSec = Math.floor(now / 1000);
    if (claims.sub !== SUBJECT || typeof claims.exp !== 'number' || claims.exp <= nowSec) return null;
    if (typeof claims.iat !== 'number' || claims.iat > nowSec + 60) return null;
    return claims;
  } catch {
    return null;
  }
}

// ── Cookies ──────────────────────────────────────────────────
function isLocalDev(req: Request, ctx?: FnContext): boolean {
  return deployContextKind(ctx) === 'dev' && new URL(req.url).protocol === 'http:';
}

export function cookieName(req: Request, ctx?: FnContext): string {
  return isLocalDev(req, ctx) ? 'pa_session' : '__Host-pa_session';
}

export function sessionCookie(req: Request, ctx: FnContext | undefined, token: string): string {
  const base = `${cookieName(req, ctx)}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_TTL_SECONDS}`;
  return isLocalDev(req, ctx) ? base : `${base}; Secure`;
}

export function clearSessionCookie(req: Request, ctx?: FnContext): string {
  const base = `${cookieName(req, ctx)}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`;
  return isLocalDev(req, ctx) ? base : `${base}; Secure`;
}

export function readCookie(req: Request, name: string): string | null {
  const header = req.headers.get('cookie');
  if (!header) return null;
  for (const part of header.split(';')) {
    const eq = part.indexOf('=');
    if (eq < 0) continue;
    if (part.slice(0, eq).trim() === name) return part.slice(eq + 1).trim();
  }
  return null;
}

/** Returns the session claims for a request, or null when not signed in. */
export function getSession(req: Request, ctx?: FnContext): SessionClaims | null {
  const { sessionSecret } = getAuthConfig();
  const token = readCookie(req, cookieName(req, ctx));
  return token ? verifySessionToken(token, sessionSecret) : null;
}

/** Throws 401 unless the request carries a valid session cookie. */
export function requireSession(req: Request, ctx?: FnContext): SessionClaims {
  const session = getSession(req, ctx);
  if (!session) throw new HttpError(401, 'unauthorized', 'Sign in to continue');
  return session;
}

/** HMAC of the client IP so raw addresses are never stored. */
export function hashIp(ip: string | undefined, secret: string): string {
  return createHmac('sha256', secret)
    .update(`ip:${ip || 'unknown'}`)
    .digest('hex')
    .slice(0, 32);
}
