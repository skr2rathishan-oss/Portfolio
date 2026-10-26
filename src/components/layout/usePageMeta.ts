// Per-route document title, description and canonical URL.
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const SITE_ORIGIN = 'https://www.skrathishan.app';

function setMeta(selector: string, attr: 'content' | 'href', value: string) {
  const el = document.head.querySelector(selector);
  if (el) el.setAttribute(attr, value);
}

export interface PageMeta {
  /** Page title; the site name is appended unless `exact` is set. */
  title: string;
  description?: string;
  siteName?: string;
  exact?: boolean;
  noindex?: boolean;
}

export function usePageMeta({ title, description, siteName, exact, noindex }: PageMeta) {
  const { pathname } = useLocation();
  useEffect(() => {
    const full = exact || !siteName ? title : `${title} | ${siteName}`;
    document.title = full;
    const url = `${SITE_ORIGIN}${pathname === '/' ? '/' : pathname.replace(/\/+$/, '')}`;
    setMeta('link[rel="canonical"]', 'href', url);
    setMeta('meta[property="og:url"]', 'content', url);
    setMeta('meta[property="og:title"]', 'content', full);
    setMeta('meta[name="twitter:title"]', 'content', full);
    if (description) {
      setMeta('meta[name="description"]', 'content', description);
      setMeta('meta[property="og:description"]', 'content', description);
      setMeta('meta[name="twitter:description"]', 'content', description);
    }
    let robots = document.head.querySelector<HTMLMetaElement>('meta[name="robots"][data-page]');
    if (noindex) {
      if (!robots) {
        robots = document.createElement('meta');
        robots.name = 'robots';
        robots.dataset.page = '';
        document.head.appendChild(robots);
      }
      robots.content = 'noindex';
    } else if (robots) {
      robots.remove();
    }
  }, [title, description, siteName, exact, noindex, pathname]);
}
