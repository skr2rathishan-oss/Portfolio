// "+ Add" component library: content blocks, a custom section, and portfolio items.
// Blocks go into the selected custom section (after the selected block) or into a new custom
// section after the selected section. Portfolio items open the list editors' dialog and are then
// selected on their host page.
import {
  Award,
  Briefcase,
  FolderKanban,
  GalleryHorizontalEnd,
  GraduationCap,
  Heading,
  Image as ImageIcon,
  LayoutTemplate,
  Link2,
  Mail,
  Minus,
  MousePointerClick,
  Search,
  Share2,
  Sparkles,
  Text,
  Trophy,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { LAYOUT_LIMITS, PAGE_LABEL, SECTION_META, resolvePage } from '../../content/layout';
import type { Block, CollectionName, Content, PageKey } from '../../content/types';
import { EntityDialog } from '../collection/EntityDialog';
import { MediaLibraryDialog } from '../fields/MediaField';
import { addBlock, addGalleryImages, addSection, newBlock, newCustomSection, setSectionVisible } from '../lib/layoutReducers';
import { cx, focusRing, Modal } from '../ui/primitives';
import { configFor } from './entityConfigs';
import { useEditor } from './state/EditorContext';
import { ENTITY_HOST, findSection, parentTarget, parseTarget, structuralTarget } from './targets';

type LibraryItem =
  | { id: string; group: 'blocks'; name: string; description: string; icon: LucideIcon; blocks: Block['type'][] }
  | { id: string; group: 'sections'; name: string; description: string; icon: LucideIcon }
  | { id: string; group: 'items'; name: string; description: string; icon: LucideIcon; coll: CollectionName };

const ITEMS: LibraryItem[] = [
  { id: 'heading', group: 'blocks', name: 'Heading', description: 'A section or sub-section title.', icon: Heading, blocks: ['heading'] },
  { id: 'text', group: 'blocks', name: 'Text', description: 'Paragraphs of plain text.', icon: Text, blocks: ['text'] },
  { id: 'headingText', group: 'blocks', name: 'Heading and text', description: 'A title with a paragraph below it.', icon: LayoutTemplate, blocks: ['heading', 'text'] },
  { id: 'image', group: 'blocks', name: 'Image', description: 'One image with alt text, caption and optional link.', icon: ImageIcon, blocks: ['image'] },
  { id: 'gallery', group: 'blocks', name: 'Gallery', description: 'A grid of images from the media library.', icon: GalleryHorizontalEnd, blocks: ['gallery'] },
  { id: 'button', group: 'blocks', name: 'Button or link', description: 'A call to action pointing to a page or URL.', icon: MousePointerClick, blocks: ['button'] },
  { id: 'contactInfo', group: 'blocks', name: 'Contact info', description: 'Your email, location and social links.', icon: Mail, blocks: ['contactInfo'] },
  { id: 'divider', group: 'blocks', name: 'Divider', description: 'A horizontal rule between blocks.', icon: Minus, blocks: ['divider'] },
  { id: 'section', group: 'sections', name: 'Custom content section', description: 'An empty section with a heading, ready for blocks.', icon: Sparkles },
  { id: 'projects', group: 'items', name: 'Project card', description: 'A project with image, summary, stack and links.', icon: FolderKanban, coll: 'projects' },
  { id: 'technologies', group: 'items', name: 'Skill', description: 'A technology in your tech stack.', icon: Wrench, coll: 'technologies' },
  { id: 'achievements', group: 'items', name: 'Achievement', description: 'A hackathon, competition or award on the timeline.', icon: Trophy, coll: 'achievements' },
  { id: 'roles', group: 'items', name: 'Experience or role', description: 'Leadership, community or work experience.', icon: Briefcase, coll: 'roles' },
  { id: 'programs', group: 'items', name: 'Program', description: 'A bootcamp, fellowship, workshop or course.', icon: Sparkles, coll: 'programs' },
  { id: 'education', group: 'items', name: 'Education entry', description: 'A degree or school.', icon: GraduationCap, coll: 'education' },
  { id: 'certifications', group: 'items', name: 'Certificate', description: 'A certificate card with image and credential link.', icon: Award, coll: 'certifications' },
  { id: 'socials', group: 'items', name: 'Social link', description: 'A profile link shown in the hero, contact page and footer.', icon: Share2, coll: 'socials' },
];

const GROUP_LABEL = { blocks: 'Content blocks', sections: 'Sections', items: 'Portfolio items' } as const;

function customCount(doc: Content, page: PageKey) {
  return resolvePage(doc, page).filter((s) => s.type === 'custom').length;
}

export function ComponentLibrary() {
  const ed = useEditor();
  const { doc, page, selected, apply, select, libraryOpen, setLibraryOpen, setPage, recordExternal, askConfirm, openImage, focusPanel, announce } = ed;
  const [query, setQuery] = useState('');
  const [entity, setEntity] = useState<CollectionName | null>(null);
  const [galleryFor, setGalleryFor] = useState<{ page: PageKey; sid: string; bid: string } | null>(null);
  const before = useRef<Content | null>(null);

  // Where blocks go.
  const destination = useMemo(() => {
    const p = parseTarget(selected);
    if (p?.t === 'block') return { sid: p.sid, after: p.bid as string | null };
    if (p?.t === 'section') {
      const s = findSection(doc, page, p.id);
      if (s?.type === 'custom') return { sid: s.id, after: s.blocks.length ? [...s.blocks].sort((a, b) => a.order - b.order).at(-1)!.id : null };
    }
    return null;
  }, [doc, page, selected]);

  const afterSectionId = useMemo(() => {
    let t = structuralTarget(selected);
    for (let n = 0; t && n < 5; n++, t = parentTarget(doc, page, t)) if (t.startsWith('section:')) return t.split(':')[1];
    return null;
  }, [doc, page, selected]);

  const destSection = destination ? findSection(doc, page, destination.sid) : null;
  const blockCountInDest = destSection?.type === 'custom' ? destSection.blocks.length : 0;

  const blockReason = (n: number): string | null => {
    if (destination) return blockCountInDest + n > LAYOUT_LIMITS.blocksPerSection ? `This section is full (${LAYOUT_LIMITS.blocksPerSection} blocks).` : null;
    return customCount(doc, page) >= LAYOUT_LIMITS.customSectionsPerPage ? `This page already has ${LAYOUT_LIMITS.customSectionsPerPage} custom sections.` : null;
  };

  const where = (item: LibraryItem): string => {
    if (item.group === 'items') {
      const host = ENTITY_HOST[item.coll];
      return host ? `${PAGE_LABEL[SECTION_META[host].page]} · ${SECTION_META[host].label}` : '';
    }
    if (item.group === 'sections') return afterSectionId ? 'After the selected section' : `End of the ${PAGE_LABEL[page]} page`;
    return destination ? 'Into the selected custom section' : 'New section after the selection';
  };

  const close = () => setLibraryOpen(false);

  const insertBlocks = async (types: Block['type'][]) => {
    const blocks = types.map(newBlock);
    let reducer: (d: Content) => Content;
    let sid: string;
    if (destination) {
      sid = destination.sid;
      reducer = (d) => {
        let after = destination.after;
        let out = d;
        for (const b of blocks) {
          out = addBlock(page, sid, b, after)(out);
          after = b.id;
        }
        return out;
      };
    } else {
      const section = newCustomSection(blocks);
      section.props = { arrangement: 'stack' };
      sid = section.id;
      reducer = addSection(page, section, afterSectionId);
    }
    close();
    const res = await apply(reducer, { success: blocks.length > 1 ? 'Blocks added' : 'Block added' });
    if (!res.ok) return;
    const target = `block:${sid}:${blocks[0].id}`;
    select(target, { scroll: true });
    announce(`Added ${types.join(' and ')}`);
    if (types[0] === 'image') openImage(`${target}:src`);
    else if (types[0] === 'gallery') setGalleryFor({ page, sid, bid: blocks[0].id });
    else focusPanel();
  };

  const insertSection = async () => {
    const section = newCustomSection([newBlock('heading')]);
    section.style = undefined;
    close();
    const res = await apply(addSection(page, section, afterSectionId), { success: 'Section added' });
    if (res.ok) {
      select(`section:${section.id}`, { scroll: true });
      focusPanel();
    }
  };

  const onEntitySaved = (coll: CollectionName, item: { id: string }) => {
    if (before.current) recordExternal(before.current);
    const host = ENTITY_HOST[coll];
    const hostPage = host ? SECTION_META[host].page : page;
    if (hostPage !== page) setPage(hostPage);
    const target = `item:${coll}:${item.id}`;
    // Select after the page switch has rendered.
    setTimeout(() => select(target, { scroll: true }), 0);
    const hostSection = host ? resolvePage(doc, hostPage).find((s) => s.type === host) : undefined;
    if (hostSection && !hostSection.visible) {
      askConfirm({
        title: 'Show the section?',
        message: `“${SECTION_META[host!].label}” is hidden on the ${PAGE_LABEL[hostPage]} page, so the new item will not appear until it is shown.`,
        confirmLabel: 'Show section',
        tone: 'primary',
        onConfirm: async () => {
          askConfirm(null);
          await apply(setSectionVisible(hostPage, hostSection.id, true));
        },
      });
    }
  };

  const q = query.trim().toLowerCase();
  const shown = ITEMS.filter((i) => !q || `${i.name} ${i.description}`.toLowerCase().includes(q));

  return (
    <>
      {libraryOpen && !entity && (
        <Modal title="Add a component" description="Choose what to add to the draft." onClose={close} size="lg">
          <div className="space-y-6">
            <label className="relative block">
              <span className="sr-only">Search components</span>
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#5f7a93]" aria-hidden="true" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search: image, project, button…"
                className="w-full rounded-lg border border-[#27496b] bg-[#0a1a2b] py-2.5 pl-9 pr-3 text-sm text-[#e8f0f7] placeholder:text-[#5f7a93] focus:border-[#00abf0] focus:outline-none focus:ring-2 focus:ring-[#00abf0]/30"
              />
            </label>
            {shown.length === 0 && <p className="text-sm text-[#8ea6bd]">Nothing matches “{query}”.</p>}
            {(['blocks', 'sections', 'items'] as const).map((g) => {
              const list = shown.filter((i) => i.group === g);
              if (!list.length) return null;
              return (
                <section key={g} aria-labelledby={`lib-${g}`}>
                  <h3 id={`lib-${g}`} className="mb-2 text-[13px] font-semibold text-[#cfdbe6]">
                    {GROUP_LABEL[g]}
                  </h3>
                  <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {list.map((item) => {
                      const reason =
                        item.group === 'blocks'
                          ? blockReason(item.blocks.length)
                          : item.group === 'sections'
                            ? customCount(doc, page) >= LAYOUT_LIMITS.customSectionsPerPage
                              ? `This page already has ${LAYOUT_LIMITS.customSectionsPerPage} custom sections.`
                              : null
                            : null;
                      const Icon = item.icon;
                      return (
                        <li key={item.id}>
                          <button
                            type="button"
                            disabled={!!reason}
                            title={reason ?? undefined}
                            onClick={() => {
                              if (item.group === 'blocks') void insertBlocks(item.blocks);
                              else if (item.group === 'sections') void insertSection();
                              else {
                                before.current = doc;
                                setEntity(item.coll);
                                close();
                              }
                            }}
                            className={cx(
                              'flex h-full w-full items-start gap-3 rounded-xl border border-[#1f3d5c] bg-[#0a1a2b] p-3 text-left transition-colors',
                              'hover:border-[#00abf0]/70 hover:bg-[#0d2238] disabled:cursor-not-allowed disabled:opacity-45',
                              focusRing,
                            )}
                          >
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#00abf0]/10 text-[#00abf0]">
                              <Icon size={18} aria-hidden="true" />
                            </span>
                            <span className="min-w-0">
                              <span className="block text-sm font-medium text-white">{item.name}</span>
                              <span className="mt-0.5 block text-xs leading-snug text-[#8ea6bd]">{item.description}</span>
                              <span className="mt-1.5 flex items-center gap-1 text-[11px] text-[#5f7a93]">
                                <Link2 size={11} aria-hidden="true" />
                                {reason ?? where(item)}
                              </span>
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              );
            })}
          </div>
        </Modal>
      )}
      {entity && (
        <EntityDialog
          config={configFor(entity)}
          initial={configFor(entity).blank(doc)}
          isNew
          onSaved={(item: { id: string }) => onEntitySaved(entity, item)}
          onClose={() => setEntity(null)}
        />
      )}
      {galleryFor && <GalleryPicker {...galleryFor} onDone={() => setGalleryFor(null)} />}
    </>
  );
}

/** Opens right after a Gallery block is added. */
function GalleryPicker({ page, sid, bid, onDone }: { page: PageKey; sid: string; bid: string; onDone: () => void }) {
  const { apply } = useEditor();
  return (
    <MediaLibraryDialog
      purpose="image"
      onClose={onDone}
      onPick={() => undefined}
      onPickMany={(urls) => {
        onDone();
        void apply(addGalleryImages(page, sid, bid, urls.slice(0, LAYOUT_LIMITS.galleryImages)), { success: 'Images added. Add alt text in the panel.' });
      }}
    />
  );
}
