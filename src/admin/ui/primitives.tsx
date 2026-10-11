// Small UI building blocks for the admin (dark navy + cyan, matching the public site).
import { Loader2, X } from 'lucide-react';
import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from 'react';

export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}

export const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00abf0]';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
const VARIANTS: Record<Variant, string> = {
  primary: 'bg-[#00abf0] text-[#04141f] hover:bg-[#33bdf3] font-semibold',
  secondary: 'bg-[#11263d] text-[#e8f0f7] border border-[#27496b] hover:border-[#3a6690] hover:bg-[#14304b]',
  ghost: 'text-[#b8c9d9] hover:text-white hover:bg-white/[0.06]',
  danger: 'bg-[#ff6b6b]/12 text-[#ff8a8a] border border-[#ff6b6b]/40 hover:bg-[#ff6b6b]/20',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: 'sm' | 'md';
  busy?: boolean;
  icon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'secondary', size = 'md', busy, icon, className, children, disabled, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || busy}
      aria-busy={busy || undefined}
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap',
        size === 'sm' ? 'h-8 px-3 text-[13px]' : 'h-10 px-4 text-sm',
        VARIANTS[variant],
        focusRing,
        className,
      )}
      {...rest}
    >
      {busy ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : icon}
      {children}
    </button>
  );
});

export const IconButton = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { label: string; tone?: 'default' | 'danger' | 'active' }
>(function IconButton({ label, tone = 'default', className, children, type = 'button', ...rest }, ref) {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={label}
      className={cx(
        'inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors disabled:opacity-40',
        tone === 'danger' && 'text-[#ff8a8a] hover:bg-[#ff6b6b]/15',
        tone === 'active' && 'text-[#00abf0] bg-[#00abf0]/12 hover:bg-[#00abf0]/20',
        tone === 'default' && 'text-[#b8c9d9] hover:text-white hover:bg-white/[0.08]',
        focusRing,
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
});

export function Badge({ children, tone = 'muted', className }: { children: ReactNode; tone?: 'muted' | 'accent' | 'warn' | 'ok' | 'danger'; className?: string }) {
  const tones = {
    muted: 'bg-white/[0.06] text-[#b8c9d9] border-white/10',
    accent: 'bg-[#00abf0]/12 text-[#5ccdf7] border-[#00abf0]/30',
    warn: 'bg-[#f5b544]/12 text-[#f5c46a] border-[#f5b544]/30',
    ok: 'bg-[#3ddc97]/12 text-[#6ee7b4] border-[#3ddc97]/30',
    danger: 'bg-[#ff6b6b]/12 text-[#ff9a9a] border-[#ff6b6b]/30',
  };
  return (
    <span className={cx('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium', tones[tone], className)}>
      {children}
    </span>
  );
}

/** Native <dialog> opened with showModal() while mounted. Mount it conditionally. */
export function Modal({
  title,
  description,
  onClose,
  children,
  footer,
  size = 'md',
  aside,
}: {
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  /** Optional side panel (e.g. live preview), shown next to the form on wide screens. */
  aside?: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descId = useId();
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
      if (dialog.open) dialog.close();
    };
  }, []);

  const widths = { sm: 'sm:max-w-md', md: 'sm:max-w-2xl', lg: aside ? 'sm:max-w-5xl' : 'sm:max-w-3xl' };

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      onCancel={(e) => {
        e.preventDefault();
        onCloseRef.current();
      }}
      onMouseDown={(e) => {
        if (e.target === ref.current) onCloseRef.current();
      }}
      className={cx(
        'm-0 sm:m-auto p-0 w-full h-full max-w-none max-h-none overflow-hidden sm:h-auto sm:max-h-[92vh] sm:rounded-2xl',
        'bg-[#0b1c2e] text-[#e8f0f7] border-0 sm:border sm:border-[#1f3d5c] shadow-[0_30px_80px_rgba(0,0,0,0.6)]',
        'backdrop:bg-[#02070d]/75 backdrop:backdrop-blur-[2px]',
        widths[size],
      )}
    >
      <div className="flex h-full sm:max-h-[calc(92vh-2px)] flex-col">
        <header className="flex items-start justify-between gap-4 border-b border-[#1b3550] px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg font-semibold text-white">
              {title}
            </h2>
            {description && (
              <p id={descId} className="mt-0.5 text-sm text-[#8ea6bd]">
                {description}
              </p>
            )}
          </div>
          <IconButton label="Close" onClick={() => onCloseRef.current()}>
            <X size={18} aria-hidden="true" />
          </IconButton>
        </header>
        <div className={cx('flex-1 min-h-0', aside ? 'lg:grid lg:grid-cols-[minmax(0,1fr)_420px]' : '')}>
          <div className="h-full overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
          {aside && (
            <aside
              aria-label="Live preview"
              className="hidden lg:block overflow-y-auto border-l border-[#1b3550] bg-[#081b29] p-5"
            >
              {aside}
            </aside>
          )}
        </div>
        {footer && (
          <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-[#1b3550] px-5 py-3 sm:px-6">
            {footer}
          </footer>
        )}
      </div>
    </dialog>
  );
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel,
  tone = 'danger',
  busy,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: ReactNode;
  confirmLabel: string;
  tone?: 'danger' | 'primary';
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal
      title={title}
      onClose={onCancel}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={onConfirm} busy={busy} autoFocus>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="text-sm leading-relaxed text-[#b8c9d9]">{message}</div>
    </Modal>
  );
}

export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
  label,
}: {
  tabs: { id: T; label: string; count?: number }[];
  value: T;
  onChange: (id: T) => void;
  label: string;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  return (
    <div role="tablist" aria-label={label} className="flex gap-1 overflow-x-auto overflow-y-hidden border-b border-[#1b3550] -mx-1 px-1">
      {tabs.map((t, i) => {
        const selected = t.id === value;
        return (
          <button
            key={t.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            role="tab"
            type="button"
            id={`tab-${t.id}`}
            aria-selected={selected}
            aria-controls={`panel-${t.id}`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(t.id)}
            onKeyDown={(e) => {
              if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
              e.preventDefault();
              const next = (i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
              onChange(tabs[next].id);
              refs.current[next]?.focus();
            }}
            className={cx(
              'relative -mb-px whitespace-nowrap px-3.5 py-2.5 text-sm transition-colors border-b-2',
              selected ? 'border-[#00abf0] text-white font-medium' : 'border-transparent text-[#8ea6bd] hover:text-white',
              focusRing,
            )}
          >
            {t.label}
            {t.count !== undefined && <span className="ml-1.5 text-xs tabular-nums text-[#5f7a93]">{t.count}</span>}
          </button>
        );
      })}
    </div>
  );
}

export function TabPanel({ id, children }: { id: string; children: ReactNode }) {
  return (
    <div role="tabpanel" id={`panel-${id}`} aria-labelledby={`tab-${id}`} className="pt-6">
      {children}
    </div>
  );
}

export function EmptyState({ title, body, action }: { title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#27496b] bg-[#0a1a2b]/60 px-6 py-14 text-center">
      <p className="font-medium text-white">{title}</p>
      {body && <p className="mt-1 max-w-sm text-sm text-[#8ea6bd]">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cx('animate-pulse rounded-xl bg-white/[0.05]', className)} />;
}

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-white">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-[#8ea6bd]">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({ title, description, children, actions, className }: { title?: string; description?: string; children: ReactNode; actions?: ReactNode; className?: string }) {
  return (
    <section className={cx('rounded-2xl border border-[#1b3550] bg-[#0b1c2e]', className)}>
      {(title || actions) && (
        <div className="flex items-start justify-between gap-4 border-b border-[#1b3550] px-5 py-4">
          <div>
            {title && <h2 className="font-semibold text-white">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-[#8ea6bd]">{description}</p>}
          </div>
          {actions}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}
