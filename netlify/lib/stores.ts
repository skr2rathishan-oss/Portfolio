// Netlify Blobs stores, separated per deploy context so previews and local dev
// never touch production data:
//   production                       -> portfolio-content / portfolio-media / portfolio-auth
//   deploy-preview / branch-deploy   -> ...-preview
//   dev (netlify dev) / unknown      -> ...-dev
import { getStore, type Store } from '@netlify/blobs';

export type StoreKind = 'content' | 'media' | 'auth';
export type DeployContextKind = 'production' | 'preview' | 'dev';

/** Minimal shape of the function Context we rely on (keeps tests independent of @netlify/types). */
export interface FnContext {
  ip?: string;
  params?: Record<string, string>;
  deploy?: { context?: string };
}

export function deployContextKind(ctx?: FnContext): DeployContextKind {
  const raw = ctx?.deploy?.context ?? process.env.CONTEXT ?? '';
  if (raw === 'production') return 'production';
  if (raw === 'deploy-preview' || raw === 'branch-deploy') return 'preview';
  return 'dev';
}

export function storeName(kind: StoreKind, ctx?: FnContext): string {
  const env = deployContextKind(ctx);
  const base = `portfolio-${kind}`;
  return env === 'production' ? base : `${base}-${env}`;
}

/** Subset of the Blobs Store API used by the functions (also implemented by the test mock). */
export type BlobStore = Pick<Store, 'get' | 'getWithMetadata' | 'getMetadata' | 'set' | 'setJSON' | 'delete' | 'list'>;

type StoreFactory = (name: string) => BlobStore;

let factory: StoreFactory = (name) => getStore({ name, consistency: 'strong' });

/** Test hook: replace the Blobs backend (e.g. with an in-memory mock). */
export function setStoreFactory(next: StoreFactory): void {
  factory = next;
}

export function openStore(kind: StoreKind, ctx?: FnContext): BlobStore {
  return factory(storeName(kind, ctx));
}
