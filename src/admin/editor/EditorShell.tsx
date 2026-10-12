// Visual editor at /admin/editor: toolbar, Layers, canvas, Properties, dialogs and shortcuts.
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LAYOUT_LIMITS, PAGE_LABEL } from '../../content/layout';
import { LIMITS } from '../../content/schema';
import { useAdminContent } from '../state/AdminContentContext';
import { useToast } from '../state/toast';
import { useEditorActions } from './actions';
import { CanvasFrame, type CanvasHandlers } from './CanvasFrame';
import { ComponentLibrary } from './ComponentLibrary';
import { EditorConfirm, ReplaceImageDialog, ShortcutSheet } from './Dialogs';
import { LayersPanel } from './LayersPanel';
import { PropertiesPanel } from './PropertiesPanel';
import { EditorProvider, useEditor } from './state/EditorContext';
import { INLINE_LIMITS, parentTarget } from './targets';
import { Toolbar } from './Toolbar';

// The canvas can't import schema.ts (zod); keep its inline limits in sync at compile time.
({ title: LIMITS.title, short: LIMITS.short, summary: LIMITS.summary, bio: LIMITS.bio, blockText: LAYOUT_LIMITS.blockText }) satisfies typeof INLINE_LIMITS;

interface KeyInfo {
  key: string;
  ctrl: boolean;
  shift: boolean;
  alt: boolean;
  meta: boolean;
}

function isTypingTarget(el: Element | null): boolean {
  if (!el) return false;
  if (el instanceof HTMLInputElement) return !['checkbox', 'radio', 'button', 'submit', 'file', 'range', 'color'].includes(el.type);
  return el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement || (el as HTMLElement).isContentEditable;
}

function EditorBody() {
  const ed = useEditor();
  const { page, mode, setMode, selected, select, undo, redo, setShortcutsOpen, focusPanel, commitPanels, hasPendingPanels, clearHistory, askConfirm, announce, announcement, confirm, libraryOpen, imageTarget, shortcutsOpen } = ed;
  const admin = useAdminContent();
  const { flush, publish, discardDraft, saveState } = admin;
  const actions = useEditorActions();
  const toast = useToast();
  const navigate = useNavigate();
  const [busy, setBusy] = useState<'save' | 'publish' | 'discard' | null>(null);
  const saveStateRef = useRef(saveState);
  saveStateRef.current = saveState;

  const save = useCallback(async () => {
    setBusy('save');
    try {
      await commitPanels();
      await flush();
    } finally {
      setBusy(null);
    }
    // Let the last save's state settle before reading it.
    await new Promise((r) => setTimeout(r, 0));
    if (saveStateRef.current === 'error') {
      toast({ tone: 'error', message: 'Some changes are not saved. Check the message above and try again.' });
    } else {
      toast({ tone: 'success', message: 'Draft saved' });
      announce('Draft saved');
    }
  }, [commitPanels, flush, toast, announce]);

  const runPublish = useCallback(
    async (force = false) => {
      setBusy('publish');
      await commitPanels();
      const res = await publish({ force });
      setBusy(null);
      if (res.ok) {
        askConfirm(null);
        clearHistory();
        toast({
          tone: 'success',
          message: 'Published. Visitors now see your changes.',
          action: { label: 'View site', onClick: () => window.open('/', '_blank', 'noopener,noreferrer') },
        });
        announce('Published');
        return;
      }
      if (res.code === 'published_changed') {
        askConfirm({
          title: 'The live site changed',
          message: 'Someone published (or restored a revision) after this draft was started. Publishing now replaces the live site with this draft.',
          confirmLabel: 'Publish anyway',
          tone: 'primary',
          onConfirm: () => runPublish(true),
        });
        return;
      }
      askConfirm(null);
      toast({ tone: 'error', message: `Not published: ${res.message} The draft is unchanged.` });
    },
    [commitPanels, publish, askConfirm, clearHistory, toast, announce],
  );

  const discard = useCallback(() => {
    askConfirm({
      title: 'Discard all unpublished changes?',
      message: 'The draft goes back to what is live on the site. A backup of the current draft is kept on the server.',
      confirmLabel: 'Discard changes',
      onConfirm: async () => {
        askConfirm(null);
        setBusy('discard');
        const res = await discardDraft();
        setBusy(null);
        if (res.ok) {
          clearHistory();
          select(null);
          toast({ tone: 'success', message: 'Draft discarded. It matches the live site again.' });
        } else toast({ tone: 'error', message: `Not discarded: ${res.message}` });
      },
    });
  }, [askConfirm, discardDraft, clearHistory, select, toast]);

  const back = useCallback(async () => {
    await commitPanels();
    await flush();
    navigate('/admin');
  }, [commitPanels, flush, navigate]);

  // ── Shortcuts (parent window and, via `key` messages, the canvas) ──
  const modalOpen = !!confirm || libraryOpen || !!imageTarget || shortcutsOpen;
  const state = useRef({ modalOpen, selected, mode });
  state.current = { modalOpen, selected, mode };

  const handleKey = useCallback(
    (k: KeyInfo, fromCanvas: boolean, typing: boolean, prevent: () => void) => {
      const { modalOpen: modal, selected: sel, mode: m } = state.current;
      const mod = k.ctrl || k.meta;
      const key = k.key.length === 1 ? k.key.toLowerCase() : k.key;
      if (mod && key === 's') {
        prevent();
        void save();
        return;
      }
      if (modal) return;
      if (mod && !typing && (key === 'z' || key === 'y')) {
        prevent();
        if (key === 'y' || k.shift) redo();
        else undo();
        return;
      }
      if (k.alt && (key === 'p' || key === 'π')) {
        prevent();
        setMode(m === 'edit' ? 'preview' : 'edit');
        announce(m === 'edit' ? 'Preview mode' : 'Edit mode');
        return;
      }
      if (typing || mod) return;
      if (key === '?') {
        prevent();
        setShortcutsOpen(true);
        return;
      }
      if (m !== 'edit') return;
      if (k.alt && (key === 'ArrowUp' || key === 'ArrowDown') && sel) {
        prevent();
        void actions.moveTarget(sel, key === 'ArrowUp' ? -1 : 1);
        return;
      }
      if ((key === 'Delete' || key === 'Backspace') && sel) {
        prevent();
        actions.deleteTarget(sel);
        return;
      }
      if (key === 'Escape' && sel) {
        prevent();
        select(null);
        return;
      }
      if (key === 'F2' && sel) {
        prevent();
        focusPanel();
        return;
      }
      void fromCanvas;
    },
    [save, undo, redo, setMode, announce, setShortcutsOpen, actions, select, focusPanel],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return;
      const typing = isTypingTarget(document.activeElement);
      // Only handle navigation-ish keys when focus is on the page itself or editor chrome buttons.
      handleKey({ key: e.key, ctrl: e.ctrlKey, shift: e.shiftKey, alt: e.altKey, meta: e.metaKey }, false, typing, () => e.preventDefault());
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleKey]);

  const handlers: CanvasHandlers = {
    onAction: (action, target) => {
      if (action === 'selectParent') {
        const parent = parentTarget(ed.doc, page, target);
        if (parent) select(parent, { scroll: true });
        return;
      }
      actions.runAction(action, target);
    },
    onInlineCommit: (target, value) => actions.commitInline(target, value),
    onKey: (k) => handleKey(k, true, false, () => undefined),
  };

  // ── Unsaved-change guard ──
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (saveState === 'saving' || hasPendingPanels()) e.preventDefault();
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [saveState, hasPendingPanels]);

  // Leaving the editor route: commit what was typed (the save queue keeps running).
  useEffect(() => () => void commitPanels(), [commitPanels]);

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[#06111d] text-[#e8f0f7]">
      <title>{`Editor · ${PAGE_LABEL[page]} – Admin`}</title>
      <Toolbar onBack={() => void back()} onSave={() => void save()} onPublish={() => void runPublish(false)} onDiscard={discard} busy={busy} />
      <div className="flex min-h-0 flex-1">
        {mode === 'edit' && <LayersPanel />}
        <main aria-label="Canvas" className="flex min-h-0 min-w-0 flex-1 flex-col">
          {mode === 'preview' && (
            <p className="border-b border-[#14304b] bg-[#0a1a2b] px-4 py-1.5 text-center text-[12px] text-[#8ea6bd]">
              Preview of the draft, exactly as visitors will see it after you publish. Links work; press Alt+P to keep editing.
            </p>
          )}
          <CanvasFrame handlers={handlers} />
        </main>
        {mode === 'edit' && <PropertiesPanel />}
      </div>
      <ComponentLibrary />
      <ReplaceImageDialog />
      <EditorConfirm />
      <ShortcutSheet />
      <div aria-live="polite" className="sr-only">
        {announcement}
      </div>
    </div>
  );
}

export default function EditorShell() {
  return (
    <EditorProvider>
      <EditorBody />
    </EditorProvider>
  );
}
