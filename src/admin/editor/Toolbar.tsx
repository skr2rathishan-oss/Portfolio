// Editor toolbar: navigation, page, device and mode on the left; component actions and history in
// the middle; draft status, Discard, Save draft and Publish on the right.
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Eye,
  Keyboard,
  Monitor,
  PenLine,
  Plus,
  Redo2,
  Save,
  Settings2,
  Smartphone,
  Tablet,
  Trash2,
  Undo2,
  Upload,
  type LucideIcon,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { PAGE_KEYS, PAGE_LABEL } from '../../content/layout';
import type { PageKey } from '../../content/types';
import { useAdminContent } from '../state/AdminContentContext';
import { Button, cx, focusRing } from '../ui/primitives';
import { useEditorActions } from './actions';
import { DEVICE_LABEL, DEVICE_WIDTH, useEditor, type Device } from './state/EditorContext';
import { capabilities } from './targets';

const DEVICE_ICON: Record<Device, LucideIcon> = { desktop: Monitor, tablet: Tablet, mobile: Smartphone };

function ToolButton({
  label,
  shortcut,
  icon: Icon,
  onClick,
  disabled,
  pressed,
  tone,
  showLabel,
}: {
  label: string;
  shortcut?: string;
  icon: LucideIcon;
  onClick: () => void;
  disabled?: boolean;
  pressed?: boolean;
  tone?: 'danger';
  showLabel?: boolean;
}) {
  const tip = shortcut ? `${label} (${shortcut})` : label;
  return (
    <button
      type="button"
      aria-label={showLabel ? undefined : label}
      aria-keyshortcuts={shortcut?.replace(/\//g, ' ')}
      aria-pressed={pressed}
      title={disabled && !pressed ? `${tip}: nothing to apply it to` : tip}
      disabled={disabled}
      onClick={onClick}
      className={cx(
        'inline-flex h-8 items-center justify-center gap-1.5 rounded-md text-[13px] transition-colors disabled:cursor-not-allowed disabled:opacity-35',
        showLabel ? 'px-2.5' : 'w-8',
        pressed ? 'bg-[#00abf0]/15 text-[#5ccdf7]' : tone === 'danger' ? 'text-[#ff8a8a] hover:bg-[#ff6b6b]/15' : 'text-[#b8c9d9] hover:bg-white/[0.07] hover:text-white',
        focusRing,
      )}
    >
      <Icon size={16} aria-hidden="true" />
      {showLabel && <span>{label}</span>}
    </button>
  );
}

function Divider() {
  return <span aria-hidden="true" className="mx-1 h-5 w-px shrink-0 bg-[#1f3d5c]" />;
}

function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
  iconOnly,
}: {
  iconOnly?: boolean;
  label: string;
  value: T;
  options: { value: T; label: string; icon: LucideIcon; title?: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div role="group" aria-label={label} className="flex rounded-lg border border-[#1f3d5c] bg-[#081524] p-0.5">
      {options.map((o) => {
        const on = o.value === value;
        const Icon = o.icon;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={on}
            title={o.title ?? o.label}
            onClick={() => onChange(o.value)}
            className={cx(
              'inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-[12px] font-medium transition-colors',
              on ? 'bg-[#13324f] text-white shadow-[inset_0_0_0_1px_#2a5277]' : 'text-[#8ea6bd] hover:text-white',
              focusRing,
            )}
          >
            <Icon size={14} aria-hidden="true" />
            <span className={iconOnly ? 'sr-only' : 'max-xl:sr-only'}>{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function Status() {
  const { saveState, hasUnpublishedChanges, updatedAt, lastError } = useAdminContent();
  let dot = 'bg-[#3ddc97]';
  let text: ReactNode = 'Published';
  if (saveState === 'saving') {
    dot = 'bg-[#00abf0] animate-pulse motion-reduce:animate-none';
    text = 'Saving…';
  } else if (saveState === 'error') {
    dot = 'bg-[#ff6b6b]';
    text = 'Not saved';
  } else if (hasUnpublishedChanges) {
    dot = 'bg-[#f5b544]';
    const t = updatedAt ? new Date(updatedAt) : null;
    text = t && !Number.isNaN(t.getTime()) ? `Draft saved ${t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Unpublished changes';
  }
  return (
    <span
      role="status"
      title={saveState === 'error' ? (lastError ?? undefined) : hasUnpublishedChanges ? 'The draft has changes visitors do not see yet.' : 'The live site matches the draft.'}
      className="inline-flex h-8 items-center gap-2 whitespace-nowrap rounded-full border border-[#1f3d5c] bg-[#081524] px-3 text-[12px] text-[#b8c9d9]"
    >
      <span aria-hidden="true" className={cx('h-2 w-2 rounded-full', dot)} />
      {text}
      {hasUnpublishedChanges && saveState !== 'saving' && <span className="sr-only">, unpublished changes</span>}
    </span>
  );
}

export function Toolbar({
  onBack,
  onSave,
  onPublish,
  onDiscard,
  busy,
}: {
  onBack: () => void;
  onSave: () => void;
  onPublish: () => void;
  onDiscard: () => void;
  busy: 'save' | 'publish' | 'discard' | null;
}) {
  const { doc, page, setPage, device, setDevice, mode, setMode, selected, undo, redo, canUndo, canRedo, setLibraryOpen, setShortcutsOpen, focusPanel } = useEditor();
  const { hasUnpublishedChanges, saveState } = useAdminContent();
  const actions = useEditorActions();
  const caps = capabilities(doc, page, selected);
  const editing = mode === 'edit';

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-[#14304b] bg-[#0b1c2e] px-3">
      <div role="toolbar" aria-label="View" className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          className={cx('inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-[13px] text-[#b8c9d9] hover:bg-white/[0.07] hover:text-white', focusRing)}
        >
          <ArrowLeft size={16} aria-hidden="true" />
          <span className="max-2xl:sr-only">Admin</span>
        </button>
        <label className="sr-only" htmlFor="editor-page">
          Page
        </label>
        <select
          id="editor-page"
          value={page}
          onChange={(e) => setPage(e.target.value as PageKey)}
          className={cx('h-8 rounded-md border border-[#1f3d5c] bg-[#081524] px-2 text-[13px] font-medium text-white appearance-auto', focusRing)}
        >
          {PAGE_KEYS.map((p) => (
            <option key={p} value={p}>
              {PAGE_LABEL[p]}
            </option>
          ))}
        </select>
        <Segmented
          label="Device width"
          iconOnly
          value={device}
          onChange={setDevice}
          options={(['desktop', 'tablet', 'mobile'] as Device[]).map((d) => ({
            value: d,
            label: DEVICE_LABEL[d],
            icon: DEVICE_ICON[d],
            title: `${DEVICE_LABEL[d]} · ${DEVICE_WIDTH[d]}px`,
          }))}
        />
        <Segmented
          label="Mode (Alt+P)"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'edit', label: 'Edit', icon: PenLine, title: 'Edit mode (Alt+P)' },
            { value: 'preview', label: 'Preview', icon: Eye, title: 'Preview exactly as visitors see it (Alt+P)' },
          ]}
        />
      </div>

      <Divider />
      <div role="toolbar" aria-label="Edit" className="flex items-center gap-0.5">
        <ToolButton label="Add" shortcut="" icon={Plus} showLabel onClick={() => setLibraryOpen(true)} disabled={!editing} />
        <ToolButton label="Edit properties" shortcut="F2" icon={Settings2} onClick={focusPanel} disabled={!editing || !caps.edit} />
        <ToolButton label="Move up" shortcut="Alt+ArrowUp" icon={ArrowUp} onClick={() => selected && void actions.moveTarget(selected, -1)} disabled={!editing || !caps.moveUp} />
        <ToolButton label="Move down" shortcut="Alt+ArrowDown" icon={ArrowDown} onClick={() => selected && void actions.moveTarget(selected, 1)} disabled={!editing || !caps.moveDown} />
        <ToolButton label="Delete" shortcut="Delete" icon={Trash2} tone="danger" onClick={() => selected && actions.deleteTarget(selected)} disabled={!editing || !caps.delete} />
        <Divider />
        <ToolButton label="Undo" shortcut="Ctrl+Z" icon={Undo2} onClick={undo} disabled={!canUndo} />
        <ToolButton label="Redo" shortcut="Ctrl+Shift+Z" icon={Redo2} onClick={redo} disabled={!canRedo} />
        <ToolButton label="Keyboard shortcuts" shortcut="?" icon={Keyboard} onClick={() => setShortcutsOpen(true)} />
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-2">
        <Status />
        <Button size="sm" variant="ghost" onClick={onDiscard} disabled={!hasUnpublishedChanges || busy !== null} busy={busy === 'discard'} title="Discard all unpublished changes">
          Cancel
        </Button>
        <Button size="sm" icon={<Save size={14} aria-hidden="true" />} onClick={onSave} busy={busy === 'save'} disabled={busy !== null} title="Save draft (Ctrl+S)">
          Save draft
        </Button>
        <Button
          size="sm"
          variant="primary"
          icon={<Upload size={14} aria-hidden="true" />}
          onClick={onPublish}
          busy={busy === 'publish'}
          disabled={!hasUnpublishedChanges || busy !== null || saveState === 'error'}
          title={hasUnpublishedChanges ? 'Publish changes to the live site' : 'Nothing to publish: the live site matches the draft'}
        >
          Publish changes
        </Button>
      </div>
    </header>
  );
}
