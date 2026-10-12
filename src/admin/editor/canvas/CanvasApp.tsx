// Editor canvas (STUB from the foundation step; WS-C owns and replaces the internals).
// Runs inside the editor's same-origin srcdoc iframe, booted by App.tsx when the canvas meta is
// present. Renders the real public layout from the document the parent sends via `render`.
// Must NOT import zod, ../../api or ../../state (keeps this chunk small and side-effect free).
import { useEffect, useMemo, useState } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { MotionConfig } from 'motion/react';
import PortfolioLayout from '../../../components/layout/PortfolioLayout';
import { StaticContentProvider } from '../../../content/ContentProvider';
import { EditContext, type EditBridge } from '../../../content/editable';
import { PAGE_PATH } from '../../../content/layout';
import type { Content, PageKey } from '../../../content/types';
import { acceptFromParent, postToParent, type CanvasMode } from '../protocol';

interface CanvasState {
  doc: Content;
  page: PageKey;
  mode: CanvasMode;
}

const bridge: EditBridge = {
  attrs: (target, kind) => ({ 'data-ed': target, 'data-ed-kind': kind }),
};

export default function CanvasApp() {
  const [state, setState] = useState<CanvasState | null>(null);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      const msg = acceptFromParent(e);
      if (!msg) return;
      switch (msg.type) {
        case 'render':
          setState({ doc: msg.doc, page: msg.page, mode: msg.mode });
          break;
        case 'mode':
          setState((s) => (s ? { ...s, mode: msg.mode } : s));
          break;
        case 'page':
          setState((s) => (s ? { ...s, page: msg.page } : s));
          break;
        case 'select':
          break; // selection overlay: WS-C
      }
    };
    window.addEventListener('message', onMessage);
    postToParent({ type: 'ready' });
    return () => window.removeEventListener('message', onMessage);
  }, []);

  const edit = useMemo(() => (state?.mode === 'edit' ? bridge : null), [state?.mode]);

  if (!state) return null;
  return (
    <MotionConfig reducedMotion="user">
      <MemoryRouter key={state.page} initialEntries={[PAGE_PATH[state.page]]}>
        <StaticContentProvider content={state.doc}>
          <EditContext.Provider value={edit}>
            <PortfolioLayout />
          </EditContext.Provider>
        </StaticContentProvider>
      </MemoryRouter>
    </MotionConfig>
  );
}
