// Provides the portfolio content document, bundled from src/content/seed.json.
// The seed is loaded as a separate chunk so the skeleton can paint first.
// This file must not import zod / schema.ts (keeps them out of the public bundle).
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Content } from './types';
import { normalizePublic } from './selectors';

const ContentContext = createContext<Content | null>(null);

async function loadSeed(): Promise<Content> {
  const mod = await import('./seed.json');
  return (mod.default ?? mod) as unknown as Content;
}

export function ContentProvider({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  const [content, setContent] = useState<Content | null>(null);

  useEffect(() => {
    let cancelled = false;
    void loadSeed().then((seed) => {
      if (!cancelled) setContent(seed);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return <ContentContext.Provider value={content}>{content ? children : fallback}</ContentContext.Provider>;
}

/** Public content: hidden items removed, collections sorted by `order`. */
export function useContent(): Content {
  const content = useContext(ContentContext);
  const publicContent = useMemo(() => (content ? normalizePublic(content) : null), [content]);
  if (!publicContent) throw new Error('useContent called before content loaded');
  return publicContent;
}
