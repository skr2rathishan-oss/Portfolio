// Loads the public content document for the portfolio.
//  1. If a localStorage copy exists, render it immediately and revalidate against /api/content.
//  2. Otherwise wait up to 2.5s for /api/content, then fall back to the bundled seed
//     (a late API response still replaces the seed when it arrives).
// Only `application/json` responses whose document has `schemaVersion === 1` are accepted.
// This file must not import zod / schema.ts (keeps them out of the public bundle).
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Content } from './types';
import { normalizePublic } from './selectors';

export const CONTENT_CACHE_KEY = 'portfolio-content-v1';
export const CONTENT_ENDPOINT = '/api/content';
const API_WAIT_MS = 2500;

export type ContentSource = 'cache' | 'api' | 'seed';
export interface ContentStatus {
  /** 'loading' only before anything can be rendered. */
  status: 'loading' | 'ready';
  source: ContentSource | null;
  /** true while a background revalidation request is in flight. */
  revalidating: boolean;
  /** Last network error (the page still renders cached/seed content). */
  error: string | null;
}

interface ContextValue {
  content: Content | null;
  status: ContentStatus;
}

const ContentContext = createContext<ContextValue | null>(null);

function looksLikeContent(value: unknown): value is Content {
  if (!value || typeof value !== 'object') return false;
  const v = value as Partial<Content>;
  return (
    v.schemaVersion === 1 &&
    !!v.profile &&
    !!v.site &&
    Array.isArray(v.projects) &&
    Array.isArray(v.technologies) &&
    Array.isArray(v.socials)
  );
}

/** Accepts either a bare Content document or an envelope `{ rev, updatedAt, content }`. */
function extractContent(body: unknown): Content | null {
  if (looksLikeContent(body)) return body;
  if (body && typeof body === 'object' && 'content' in body) {
    const inner = (body as { content: unknown }).content;
    if (looksLikeContent(inner)) return inner;
  }
  return null;
}

function readCache(): Content | null {
  try {
    const raw = window.localStorage.getItem(CONTENT_CACHE_KEY);
    if (!raw) return null;
    return extractContent(JSON.parse(raw));
  } catch {
    return null;
  }
}

function writeCache(content: Content) {
  try {
    window.localStorage.setItem(CONTENT_CACHE_KEY, JSON.stringify(content));
  } catch {
    // Storage full / disabled: caching is best-effort.
  }
}

async function fetchContent(signal: AbortSignal): Promise<Content> {
  const res = await fetch(CONTENT_ENDPOINT, { headers: { Accept: 'application/json' }, signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const type = res.headers.get('content-type') ?? '';
  if (!type.toLowerCase().includes('application/json')) throw new Error('Unexpected content type');
  const content = extractContent(await res.json());
  if (!content) throw new Error('Unsupported content document');
  return content;
}

async function loadSeed(): Promise<Content> {
  const mod = await import('./seed.json');
  return (mod.default ?? mod) as unknown as Content;
}

export function ContentProvider({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  const [state, setState] = useState<ContextValue>(() => {
    const cached = typeof window !== 'undefined' ? readCache() : null;
    return {
      content: cached,
      status: { status: cached ? 'ready' : 'loading', source: cached ? 'cache' : null, revalidating: true, error: null },
    };
  });

  useEffect(() => {
    const controller = new AbortController();
    const hadCache = state.content !== null;
    let settled = false; // API answered (success or failure)
    let shownSeed = false;

    const showSeed = async (error: string | null) => {
      if (shownSeed) return;
      shownSeed = true;
      try {
        const seed = await loadSeed();
        if (controller.signal.aborted) return;
        setState((prev) =>
          prev.content
            ? { ...prev, status: { ...prev.status, error: error ?? prev.status.error } }
            : { content: seed, status: { status: 'ready', source: 'seed', revalidating: !settled, error } },
        );
      } catch (err) {
        if (!controller.signal.aborted) {
          setState((prev) => ({ ...prev, status: { ...prev.status, error: (err as Error).message } }));
        }
      }
    };

    // No cache: give the API a head start, then render the seed.
    const timer = window.setTimeout(() => {
      if (!settled && !hadCache) void showSeed(null);
    }, API_WAIT_MS);

    fetchContent(controller.signal)
      .then((content) => {
        settled = true;
        writeCache(content);
        setState({ content, status: { status: 'ready', source: 'api', revalidating: false, error: null } });
      })
      .catch((err: Error) => {
        settled = true;
        if (controller.signal.aborted) return;
        setState((prev) =>
          prev.content
            ? { ...prev, status: { ...prev.status, revalidating: false, error: err.message } }
            : prev,
        );
        if (hadCache) return;
        void showSeed(err.message).then(() => {
          if (!controller.signal.aborted) {
            setState((prev) => ({ ...prev, status: { ...prev.status, revalidating: false } }));
          }
        });
      })
      .finally(() => window.clearTimeout(timer));

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
    // Runs once on mount; `state.content` is only read to know whether a cache was found.
  }, []);

  return (
    <ContentContext.Provider value={state}>{state.content ? children : fallback}</ContentContext.Provider>
  );
}

function useContentContext(): ContextValue {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error('useContent must be used inside <ContentProvider>');
  return ctx;
}

/** Public content: hidden items removed, collections sorted by `order`. */
export function useContent(): Content {
  const { content } = useContentContext();
  const publicContent = useMemo(() => (content ? normalizePublic(content) : null), [content]);
  if (!publicContent) throw new Error('useContent called before content loaded');
  return publicContent;
}

export function useContentStatus(): ContentStatus {
  return useContentContext().status;
}
