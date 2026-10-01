import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { CloseIcon } from '../components/Icons';

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 border-b border-taupe/30 pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-serif text-4xl uppercase tracking-wide">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-deep">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </div>
  );
}

export function Field({ label, hint, children, className = '' }: { label: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="field-label">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-taupe">{hint}</span>}
    </label>
  );
}

export const inputCls = 'w-full border border-taupe/50 bg-cream px-3 py-2.5 text-sm text-ink focus:border-ink focus:outline-none';
export const smallBtn = 'border border-taupe/60 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-ink transition-colors hover:bg-ink hover:text-cream disabled:opacity-40';
export const dangerBtn = 'border border-[#b48a7c] px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-[#8a4b3c] transition-colors hover:bg-[#8a4b3c] hover:text-cream';

export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/40 p-4 sm:p-8" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`w-full animate-fadeIn bg-cream ${wide ? 'max-w-5xl' : 'max-w-2xl'}`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-taupe/30 px-6 py-4">
          <h2 className="font-serif text-2xl uppercase tracking-wide">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="p-1">
            <CloseIcon />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

type Toast = { id: number; message: string; tone: 'ok' | 'error' };
const ToastContext = createContext<(message: string, tone?: 'ok' | 'error') => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((message: string, tone: 'ok' | 'error' = 'ok') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);
  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`animate-fadeUp px-4 py-3 text-sm shadow-sm ${t.tone === 'ok' ? 'bg-ink text-cream' : 'bg-[#8a4b3c] text-cream'}`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-sm">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-[#302D2A]" />
      {label}
    </label>
  );
}
