// Pure helpers over the content document. No zod, no React — safe for the public
// bundle and for Netlify functions.
import type { Content, DateYM, Entity, ID, PageKey, PageLayout, Project, SiteLayout, Technology } from './types';

/** Stable sort by `order` (ties keep their original relative position). Returns a new array. */
export function sortByOrder<T extends { order: number }>(items: readonly T[]): T[] {
  return items
    .map((item, index) => ({ item, index }))
    .sort((a, b) => a.item.order - b.item.order || a.index - b.index)
    .map(({ item }) => item);
}

/** Items with `visible !== false`. */
export function visibleOnly<T extends { visible: boolean }>(items: readonly T[]): T[] {
  return items.filter((item) => item.visible !== false);
}

const visibleSorted = <T extends Entity>(items: readonly T[]): T[] => sortByOrder(visibleOnly(items));

/**
 * Public view of the content: hidden items removed, every collection sorted by
 * `order`, and references to removed items cleaned up:
 *  - project.stack / categoryIds only reference items that remain;
 *  - technologies in a hidden category stay (projects may still list them)
 *    but get `showInStack: false`;
 *  - program.certificationId is dropped when that certification is hidden.
 */
export function normalizePublic(content: Content): Content {
  const techCategories = visibleSorted(content.techCategories);
  const techCatIds = new Set(techCategories.map((c) => c.id));
  const technologies = visibleSorted(content.technologies).map((t) =>
    techCatIds.has(t.categoryId) ? t : { ...t, showInStack: false },
  );
  const techIds = new Set(technologies.map((t) => t.id));
  const projectCategories = visibleSorted(content.projectCategories);
  const projCatIds = new Set(projectCategories.map((c) => c.id));
  const certifications = visibleSorted(content.certifications);
  const certIds = new Set(certifications.map((c) => c.id));

  return {
    ...content,
    ...(content.layout ? { layout: normalizeLayout(content.layout) } : {}),
    socials: visibleSorted(content.socials),
    projects: visibleSorted(content.projects).map((p) => ({
      ...p,
      stack: p.stack.filter((s) => techIds.has(s.techId)),
      categoryIds: p.categoryIds.filter((c) => projCatIds.has(c)),
    })),
    projectCategories,
    techCategories,
    technologies,
    education: visibleSorted(content.education),
    academicPathway: visibleSorted(content.academicPathway),
    certifications,
    achievements: visibleSorted(content.achievements),
    roles: visibleSorted(content.roles),
    programs: visibleSorted(content.programs).map((p) => {
      if (!p.certificationId || certIds.has(p.certificationId)) return p;
      const { certificationId: _dropped, ...rest } = p;
      return rest;
    }),
  };
}

/**
 * Public view of the layout: hidden custom sections and hidden blocks are removed and blocks are
 * sorted by `order`. Hidden built-in sections are KEPT (as markers) so that resolvePage() does not
 * re-insert them as visible; renderers skip sections with `visible === false`.
 */
function normalizeLayout(layout: SiteLayout): SiteLayout {
  const pages: SiteLayout['pages'] = {};
  for (const [key, page] of Object.entries(layout.pages ?? {}) as [PageKey, PageLayout | undefined][]) {
    if (!page) continue;
    pages[key] = {
      sections: (page.sections ?? [])
        .filter((s) => s.type !== 'custom' || s.visible !== false)
        .map((s) => (s.type === 'custom' ? { ...s, blocks: visibleSorted(s.blocks ?? []) } : s)),
    };
  }
  return { ...layout, pages };
}

export function indexById<T extends { id: ID }>(items: readonly T[]): Map<ID, T> {
  return new Map(items.map((item) => [item.id, item]));
}

export function projectsUsingTech(projects: readonly Project[], techId: ID): Project[] {
  return projects.filter((p) => p.stack.some((s) => s.techId === techId));
}

/** techId -> number of projects that list it in their stack. */
export function techUsageCount(projects: readonly Project[]): Map<ID, number> {
  const counts = new Map<ID, number>();
  for (const p of projects) {
    for (const techId of new Set(p.stack.map((s) => s.techId))) {
      counts.set(techId, (counts.get(techId) ?? 0) + 1);
    }
  }
  return counts;
}

/** Technologies that should appear in the public tech-stack band. */
export function stackTechnologies(technologies: readonly Technology[]): Technology[] {
  return technologies.filter((t) => t.showInStack);
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "2026-03" -> "Mar 2026", "2025" -> "2025", "present" -> "Present". Unknown input is returned as-is. */
export function formatDate(value: DateYM | 'present' | undefined | null): string {
  if (!value) return '';
  if (value === 'present') return 'Present';
  const m = /^(\d{4})(?:-(\d{2}))?$/.exec(value);
  if (!m) return value;
  const month = m[2] ? Number(m[2]) : 0;
  return month >= 1 && month <= 12 ? `${MONTHS[month - 1]} ${m[1]}` : m[1];
}

/** "Jan 2026 – Present", "2023 – 2028", or a single date when start === end / end missing. */
export function formatRange(start?: DateYM | null, end?: DateYM | 'present' | null): string {
  const s = formatDate(start);
  const e = formatDate(end);
  if (s && e && s !== e) return `${s} – ${e}`;
  return s || e;
}

/** Sort key for DateYM values ("2026" sorts as "2026-00"). */
export function dateSortKey(value: DateYM | 'present' | undefined | null): string {
  if (!value) return '';
  if (value === 'present') return '9999-99';
  return value.length === 4 ? `${value}-00` : value;
}
