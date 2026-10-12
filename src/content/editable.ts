// Edit-target annotations. Public and tiny: no editor logic lives here.
// Components spread `{...ed(T.field('projects', p.id, 'title'), 'text')}`. Without an EditContext
// provider (the public site) `ed` returns undefined, so no attributes are emitted and the DOM is
// unchanged. Inside the editor canvas the bridge emits `data-ed="<target>" data-ed-kind="<kind>"`.
import { createContext, useContext } from 'react';

export type EditKind = 'text' | 'image' | 'link' | 'item' | 'section' | 'block' | 'field';
export type EdAttrs = (target: string, kind: EditKind) => Record<string, string> | undefined;

export interface EditBridge {
  /** Must not rely on `this` (it is called detached). */
  attrs: (target: string, kind: EditKind) => Record<string, string>;
}

export const EditContext = createContext<EditBridge | null>(null);

const noop: EdAttrs = () => undefined;

export function useEd(): EdAttrs {
  const bridge = useContext(EditContext);
  return bridge ? bridge.attrs : noop;
}

/** Target string builders. Ids never contain ':' (ID_RE), so targets split unambiguously. */
export const T = {
  item: (c: string, id: string) => `item:${c}:${id}`,
  field: (c: string, id: string, f: string) => `field:${c}:${id}:${f}`,
  profile: (p: string) => `profile:${p}`,
  site: (p: string) => `site:${p}`,
  section: (id: string, p?: string) => (p ? `section:${id}:${p}` : `section:${id}`),
  block: (sid: string, bid: string, p?: string) => (p ? `block:${sid}:${bid}:${p}` : `block:${sid}:${bid}`),
};

/** `<meta name=...>` injected into the editor's srcdoc canvas; App.tsx boots the canvas when present. */
export const CANVAS_META_NAME = 'portfolio-canvas';
