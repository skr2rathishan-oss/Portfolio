// Login throttling backed by the `portfolio-auth` Blobs store.
//  - per client (hashed IP): at most 5 failed attempts in a sliding 15-minute window;
//  - global: at most 30 failed attempts per clock hour across all clients (lock-out).
// Counters are best-effort (Blobs has no atomic increment) which is fine for this purpose.
import type { BlobStore } from './stores';

export const IP_WINDOW_MS = 15 * 60 * 1000;
export const IP_MAX_FAILS = 5;
export const GLOBAL_MAX_FAILS = 30;

interface IpRecord {
  fails: number[];
}
interface GlobalRecord {
  count: number;
}

const ipKey = (ipHash: string) => `login/ip/${ipHash}`;
const globalKey = (now: number) => `login/global/${new Date(now).toISOString().slice(0, 13).replace(/[-T:]/g, '')}`;

async function readJson<T>(store: BlobStore, key: string): Promise<T | null> {
  try {
    return ((await store.get(key, { type: 'json' })) as T | null) ?? null;
  } catch {
    return null;
  }
}

export interface LimitStatus {
  limited: boolean;
  retryAfterSeconds: number;
}

export async function checkLoginLimit(store: BlobStore, ipHash: string, now = Date.now()): Promise<LimitStatus> {
  const [ip, global] = await Promise.all([
    readJson<IpRecord>(store, ipKey(ipHash)),
    readJson<GlobalRecord>(store, globalKey(now)),
  ]);
  if (global && global.count >= GLOBAL_MAX_FAILS) {
    const nextHour = Math.ceil((now + 1) / 3_600_000) * 3_600_000;
    return { limited: true, retryAfterSeconds: Math.max(1, Math.ceil((nextHour - now) / 1000)) };
  }
  const recent = (ip?.fails ?? []).filter((t) => now - t < IP_WINDOW_MS);
  if (recent.length >= IP_MAX_FAILS) {
    const oldest = Math.min(...recent);
    return { limited: true, retryAfterSeconds: Math.max(1, Math.ceil((oldest + IP_WINDOW_MS - now) / 1000)) };
  }
  return { limited: false, retryAfterSeconds: 0 };
}

export async function recordLoginFailure(store: BlobStore, ipHash: string, now = Date.now()): Promise<void> {
  const [ip, global] = await Promise.all([
    readJson<IpRecord>(store, ipKey(ipHash)),
    readJson<GlobalRecord>(store, globalKey(now)),
  ]);
  const fails = [...(ip?.fails ?? []).filter((t) => now - t < IP_WINDOW_MS), now].slice(-IP_MAX_FAILS * 2);
  await Promise.all([
    store.setJSON(ipKey(ipHash), { fails } satisfies IpRecord),
    store.setJSON(globalKey(now), { count: (global?.count ?? 0) + 1 } satisfies GlobalRecord),
  ]);
}

export async function clearLoginFailures(store: BlobStore, ipHash: string): Promise<void> {
  try {
    await store.delete(ipKey(ipHash));
  } catch {
    // best-effort
  }
}
