import type { ReactNode } from 'react';
import { cx } from '../cards/shared';

type Attrs = Record<string, string> | undefined;

/** Page title block: one <h1> per route, an optional one-line lead. Left-aligned. */
export default function PageHeader({
  title,
  lead,
  children,
  className,
  attrs,
  titleAttrs,
  leadAttrs,
}: {
  title: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;
  className?: string;
  /** Edit-target attributes (visual editor only; undefined on the public site). */
  attrs?: Attrs;
  titleAttrs?: Attrs;
  leadAttrs?: Attrs;
}) {
  return (
    <header {...attrs} className={cx('max-w-3xl pt-10 sm:pt-14 lg:pt-16', className)}>
      <h1 {...titleAttrs} className="text-h1 text-ink text-balance">
        {title}
      </h1>
      {lead && (
        <p {...leadAttrs} className="mt-3 max-w-[60ch] text-base leading-relaxed text-ink-2 sm:text-lead">
          {lead}
        </p>
      )}
      {children}
    </header>
  );
}

/** Section heading: an <h2> with an optional one-sentence lead and an optional trailing action. */
export function SectionHeading({
  id,
  title,
  lead,
  action,
  className,
  titleAttrs,
  leadAttrs,
}: {
  id: string;
  title: ReactNode;
  lead?: ReactNode;
  action?: ReactNode;
  className?: string;
  /** Edit-target attributes (visual editor only; undefined on the public site). */
  titleAttrs?: Attrs;
  leadAttrs?: Attrs;
}) {
  return (
    <div className={cx('mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-2', className)}>
      <div className="max-w-2xl">
        <h2 {...titleAttrs} id={id} className="text-h2 text-ink">
          {title}
        </h2>
        {lead && (
          <p {...leadAttrs} className="mt-2 text-[0.9375rem] leading-relaxed text-ink-2">
            {lead}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
