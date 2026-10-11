import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';

export type ToastTone = 'info' | 'success' | 'error';
export interface ToastOptions {
  message: string;
  tone?: ToastTone;
  action?: { label: string; onClick: () => void };
  /** ms; 0 keeps it until dismissed. Defaults: 4s, errors 8s. */
  duration?: number;
}
interface ToastItem extends ToastOptions {
  id: number;
}

const ToastContext = createContext<((t: ToastOptions) => void) | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast outside ToastProvider');
  return ctx;
}

const ICON = { info: Info, success: CheckCircle2, error: AlertTriangle };
const TONE = {
  info: 'border-[#27496b] text-[#e8f0f7]',
  success: 'border-[#3ddc97]/40 text-[#e8f0f7]',
  error: 'border-[#ff6b6b]/50 text-[#e8f0f7]',
};
const ICON_TONE = { info: 'text-[#00abf0]', success: 'text-[#3ddc97]', error: 'text-[#ff6b6b]' };

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const push = useCallback(
    (t: ToastOptions) => {
      const id = ++counter.current;
      setToasts((list) => [...list.slice(-3), { ...t, id }]);
      const duration = t.duration ?? (t.tone === 'error' ? 8000 : 4000);
      if (duration > 0) window.setTimeout(() => dismiss(id), duration);
    },
    [dismiss],
  );
  const value = useMemo(() => push, [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="fixed z-[60] bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 flex flex-col gap-2 sm:w-[380px] pointer-events-none"
      >
        {toasts.map((t) => {
          const tone = t.tone ?? 'info';
          const Icon = ICON[tone];
          return (
            <div
              key={t.id}
              role={tone === 'error' ? 'alert' : 'status'}
              className={`pointer-events-auto flex items-start gap-3 rounded-xl border bg-[#0d2033] px-4 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.45)] ${TONE[tone]}`}
            >
              <Icon size={18} className={`mt-0.5 shrink-0 ${ICON_TONE[tone]}`} aria-hidden="true" />
              <p className="flex-1 text-sm leading-snug">{t.message}</p>
              {t.action && (
                <button
                  type="button"
                  onClick={() => {
                    t.action!.onClick();
                    dismiss(t.id);
                  }}
                  className="shrink-0 rounded-md px-2 py-0.5 text-sm font-semibold text-[#00abf0] hover:bg-[#00abf0]/10 focus-visible:outline-2 focus-visible:outline-[#00abf0]"
                >
                  {t.action.label}
                </button>
              )}
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss notification"
                className="shrink-0 rounded-md p-0.5 text-[#8ea6bd] hover:text-white focus-visible:outline-2 focus-visible:outline-[#00abf0]"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
