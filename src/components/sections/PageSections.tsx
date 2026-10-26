// Renders a page's sections in layout order. An absent layout resolves to DEFAULT_LAYOUT, which
// reproduces the built-in pages exactly. Hidden sections are skipped; unknown types never reach here
// (resolvePage drops them).
import { useMemo } from 'react';
import { useContent } from '../../content/ContentProvider';
import { resolvePage } from '../../content/layout';
import type { PageKey } from '../../content/types';
import { SECTION_COMPONENTS } from './registry';

export default function PageSections({ page }: { page: PageKey }) {
  const { layout } = useContent();
  const sections = useMemo(() => resolvePage({ layout }, page).filter((s) => s.visible !== false), [layout, page]);
  return (
    <>
      {sections.map((s) => {
        if (s.type === 'custom') {
          const C = SECTION_COMPONENTS.custom;
          return <C key={s.id} section={s} />;
        }
        const C = SECTION_COMPONENTS[s.type];
        return C ? <C key={s.id} section={s} /> : null;
      })}
    </>
  );
}
