// Editor dialogs: confirm (focus starts on Cancel), replace image, keyboard shortcuts.
import { useEffect, useRef, useState } from 'react';
import { ImageField } from '../fields/MediaField';
import { patchBlockProps, patchGalleryImage } from '../lib/layoutReducers';
import { patchItem, setProfile, type CollectionKey, type Reducer } from '../lib/reducers';
import { Button, Modal } from '../ui/primitives';
import { useEditor } from './state/EditorContext';
import { describeTarget, findBlock, findItem, galleryImageId, parseTarget } from './targets';

export function EditorConfirm() {
  const { confirm, askConfirm } = useEditor();
  const [busy, setBusy] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);
  // showModal() focuses the first focusable control (Close); start on Cancel instead.
  useEffect(() => {
    if (!confirm) return;
    const raf = requestAnimationFrame(() => cancelRef.current?.focus());
    return () => cancelAnimationFrame(raf);
  }, [confirm]);
  if (!confirm) return null;
  return (
    <Modal
      title={confirm.title}
      onClose={() => askConfirm(null)}
      size="sm"
      footer={
        <>
          <Button ref={cancelRef} variant="ghost" onClick={() => askConfirm(null)}>
            Cancel
          </Button>
          <Button
            variant={confirm.tone === 'primary' ? 'primary' : 'danger'}
            busy={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await confirm.onConfirm();
              } finally {
                setBusy(false);
              }
            }}
          >
            {confirm.confirmLabel}
          </Button>
        </>
      }
    >
      <div className="text-sm leading-relaxed text-[#b8c9d9]">{confirm.message}</div>
    </Modal>
  );
}

interface ImageBinding {
  value: string | undefined;
  alt?: string;
  altRequired?: boolean;
  set: (src: string | undefined) => Reducer | null;
  setAlt?: (alt: string) => Reducer;
  aspect: 'video' | 'square' | 'portrait' | 'wide';
}

/** Maps an image target to its document value + reducers. */
function bindImage(doc: ReturnType<typeof useEditor>['doc'], page: ReturnType<typeof useEditor>['page'], target: string): ImageBinding | null {
  const p = parseTarget(target);
  if (!p) return null;
  if (p.t === 'profile' && (p.path === 'hero.image' || p.path === 'about.image')) {
    const group = p.path.split('.')[0] as 'hero' | 'about';
    const obj = doc.profile[group];
    return {
      value: obj.image || undefined,
      alt: group === 'hero' ? doc.profile.hero.imageAlt : undefined,
      altRequired: true,
      aspect: 'portrait',
      set: (src) => (src ? setProfile((pr) => ({ ...pr, [group]: { ...pr[group], image: src } })) : null),
      setAlt: group === 'hero' ? (alt) => setProfile((pr) => ({ ...pr, hero: { ...pr.hero, imageAlt: alt } })) : undefined,
    };
  }
  if (p.t === 'field' || p.t === 'item') {
    const field = p.t === 'field' ? p.field : 'image';
    const item = findItem(doc, p.coll, p.id);
    if (!item) return null;
    const required = (p.coll === 'projects' || p.coll === 'certifications') && field === 'image';
    return {
      value: (item[field] as string) || undefined,
      alt: p.coll === 'projects' && field === 'image' ? ((item.imageAlt as string) ?? '') : undefined,
      aspect: field === 'logo' || field === 'icon' ? 'square' : p.coll === 'certifications' ? 'wide' : 'video',
      set: (src) => (src || !required ? patchItem(p.coll as CollectionKey, p.id, { [field]: src ?? undefined } as never) : null),
      setAlt: p.coll === 'projects' && field === 'image' ? (alt) => patchItem('projects', p.id, { imageAlt: alt }) : undefined,
    };
  }
  if (p.t === 'block') {
    const found = findBlock(doc, page, p.sid, p.bid);
    if (!found) return null;
    const imgId = galleryImageId(p.prop);
    if (found.block.type === 'gallery' && imgId) {
      const img = found.block.props.images.find((i) => i.id === imgId);
      if (!img) return null;
      return {
        value: img.src,
        alt: img.alt,
        altRequired: true,
        aspect: 'video',
        set: (src) => (src ? patchGalleryImage(page, p.sid, p.bid, imgId, { src }) : null),
        setAlt: (alt) => patchGalleryImage(page, p.sid, p.bid, imgId, { alt }),
      };
    }
    if (found.block.type === 'image') {
      return {
        value: found.block.props.src,
        alt: found.block.props.alt,
        altRequired: !!found.block.props.src,
        aspect: 'video',
        set: (src) => patchBlockProps(page, p.sid, p.bid, { src: src ?? undefined }),
        setAlt: (alt) => patchBlockProps(page, p.sid, p.bid, { alt }),
      };
    }
  }
  return null;
}

export function ReplaceImageDialog() {
  const { imageTarget, openImage, doc, page, apply, focusPanel, select } = useEditor();
  const [altDraft, setAltDraft] = useState<string | null>(null);
  if (!imageTarget) return null;
  const b = bindImage(doc, page, imageTarget);
  const close = () => {
    setAltDraft(null);
    openImage(null);
  };
  if (!b) {
    // Not an image we can bind directly: edit it in the panel instead.
    queueMicrotask(() => {
      close();
      select(imageTarget);
      focusPanel();
    });
    return null;
  }
  const alt = altDraft ?? b.alt ?? '';
  const commitAlt = () => {
    if (b.setAlt && altDraft !== null && altDraft !== b.alt) void apply(b.setAlt(altDraft.trim()), { coalesceKey: `image-alt:${imageTarget}` });
  };
  return (
    <Modal
      title="Replace image"
      description={describeTarget(doc, page, imageTarget)}
      onClose={() => {
        commitAlt();
        close();
      }}
      size="md"
      footer={
        <Button
          variant="primary"
          onClick={() => {
            commitAlt();
            close();
          }}
        >
          Done
        </Button>
      }
    >
      <ImageField
        label="Image"
        value={b.value}
        aspect={b.aspect}
        onChange={(src) => {
          const r = b.set(src);
          if (r) void apply(r, { success: 'Image updated in the draft' });
        }}
        alt={b.setAlt ? { value: alt, onChange: (v) => setAltDraft(v), required: b.altRequired } : undefined}
        hint="Upload, pick from the library or paste a link. The change shows in the canvas immediately."
      />
    </Modal>
  );
}

const SHORTCUTS: [string, string][] = [
  ['Ctrl/⌘ + Z', 'Undo'],
  ['Ctrl/⌘ + Shift + Z, Ctrl + Y', 'Redo'],
  ['Ctrl/⌘ + S', 'Save draft'],
  ['Alt + P', 'Switch between Edit and Preview'],
  ['Enter', 'Edit the selected text in place (or open its properties)'],
  ['F2', 'Edit properties of the selection'],
  ['Alt + ↑ / ↓', 'Move the selection up or down'],
  ['Delete / Backspace', 'Delete the selection (asks first)'],
  ['Esc', 'Cancel inline editing, then clear the selection'],
  ['?', 'Show this list'],
];

export function ShortcutSheet() {
  const { shortcutsOpen, setShortcutsOpen } = useEditor();
  if (!shortcutsOpen) return null;
  return (
    <Modal title="Keyboard shortcuts" description="They also work while the canvas has focus." onClose={() => setShortcutsOpen(false)} size="sm">
      <dl className="divide-y divide-[#1b3550] text-sm">
        {SHORTCUTS.map(([keys, what]) => (
          <div key={keys} className="flex items-baseline justify-between gap-4 py-2">
            <dt className="text-[#b8c9d9]">{what}</dt>
            <dd className="shrink-0 font-mono text-[12px] text-[#5ccdf7]">{keys}</dd>
          </div>
        ))}
      </dl>
    </Modal>
  );
}
