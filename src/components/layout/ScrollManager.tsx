// Route-change hygiene for the single layout tree:
//  - new path without a hash: scroll to top and move focus to the page <h1> (not on first load);
//  - a hash (on load, on a new path, or a same-page hash change): scroll to that element,
//    retrying for a few frames while the page renders;
//  - search-only changes (e.g. project filters) leave the scroll position alone.
import { useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function scrollToHash(hash: string, smooth: boolean): void {
  let id = hash.slice(1);
  try {
    id = decodeURIComponent(id);
  } catch {
    // keep the raw value
  }
  let tries = 0;
  const attempt = () => {
    const el = id ? document.getElementById(id) : null;
    if (el) {
      el.scrollIntoView({ behavior: smooth && !prefersReducedMotion() ? 'smooth' : 'instant', block: 'start' });
      return;
    }
    if (tries++ < 30) requestAnimationFrame(attempt);
  };
  attempt();
}

export default function ScrollManager() {
  const { pathname, hash } = useLocation();
  const prevPath = useRef<string | null>(null);
  const prevHash = useRef<string>('');

  useLayoutEffect(() => {
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
  }, []);

  useEffect(() => {
    const firstLoad = prevPath.current === null;
    const pathChanged = prevPath.current !== pathname;
    const hashChanged = prevHash.current !== hash;
    prevPath.current = pathname;
    prevHash.current = hash;

    // Retries are not cancelled on cleanup: StrictMode re-runs effects and the refs above
    // already record this location, so a cancelled scroll would never be retried.
    if (pathChanged) {
      if (hash) {
        scrollToHash(hash, false);
        return;
      }
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      if (!firstLoad) {
        requestAnimationFrame(() => {
          const heading = document.querySelector<HTMLElement>('#content h1');
          if (heading) {
            if (!heading.hasAttribute('tabindex')) heading.setAttribute('tabindex', '-1');
            heading.focus({ preventScroll: true });
          }
        });
      }
      return;
    }
    if (hashChanged && hash) scrollToHash(hash, true);
  }, [pathname, hash]);

  return null;
}
