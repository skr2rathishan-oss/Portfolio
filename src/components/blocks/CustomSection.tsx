// Owner-built section: optional heading + lead, then its blocks stacked or in a responsive grid.
import type { ComponentType } from 'react';
import { T, useEd } from '../../content/editable';
import { sortByOrder } from '../../content/selectors';
import { blockBoxClasses, COLUMNS, SPACE_TOP } from '../../content/styleClasses';
import type { Block, BlockType, CustomSection as CustomSectionT } from '../../content/types';
import { cx } from '../cards/shared';
import { SectionHeading } from '../layout/PageHeader';
import { ButtonBlock, ContactInfoBlock, DividerBlock, GalleryBlock, HeadingBlock, ImageBlock, TextBlock, type BlockProps } from './blocks';

export const BLOCK_COMPONENTS: { [K in BlockType]: ComponentType<BlockProps<Extract<Block, { type: K }>>> } = {
  heading: HeadingBlock,
  text: TextBlock,
  image: ImageBlock,
  gallery: GalleryBlock,
  button: ButtonBlock,
  contactInfo: ContactInfoBlock,
  divider: DividerBlock,
};

function BlockView({ block, section }: { block: Block; section: CustomSectionT }) {
  const C = BLOCK_COMPONENTS[block.type] as ComponentType<BlockProps> | undefined;
  if (!C) {
    if (import.meta.env.DEV) console.warn(`Unknown block type "${(block as { type: string }).type}" skipped`);
    return null;
  }
  return <C block={block} section={section} />;
}

export default function CustomSection({ section }: { section: CustomSectionT }) {
  const ed = useEd();
  const { style } = section;
  const { title, lead, arrangement } = section.props;
  const headingId = `${section.id}-heading`;
  const blocks = sortByOrder((section.blocks ?? []).filter((b) => b.visible !== false));

  return (
    <section
      {...ed(T.section(section.id), 'section')}
      aria-labelledby={title ? headingId : undefined}
      className={cx(SPACE_TOP[style?.spaceTop ?? 'lg'], blockBoxClasses(style ? { ...style, spaceTop: undefined } : undefined))}
    >
      {title ? (
        <SectionHeading
          id={headingId}
          title={title}
          lead={lead}
          titleAttrs={ed(T.section(section.id, 'title'), 'text')}
          leadAttrs={ed(T.section(section.id, 'lead'), 'text')}
        />
      ) : (
        lead && (
          <p {...ed(T.section(section.id, 'lead'), 'text')} className="mb-6 max-w-2xl text-[0.9375rem] leading-relaxed text-ink-2">
            {lead}
          </p>
        )
      )}
      {blocks.length > 0 && (
        <div className={arrangement === 'grid' ? cx('grid gap-5', COLUMNS[style?.columns ?? '2']) : 'space-y-5'}>
          {blocks.map((b) => (
            <BlockView key={b.id} block={b} section={section} />
          ))}
        </div>
      )}
    </section>
  );
}
