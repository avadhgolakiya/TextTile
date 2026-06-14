'use client';

import { useToastStore } from '@/lib/toast-store';

const typeStyles = {
  success: 'border-green-200 bg-surface text-text-primary',
  error: 'border-red-200 bg-surface text-text-primary',
  info: 'border-divider bg-surface text-text-primary',
} as const;

const typeIcons = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
} as const;

const typeIconBg = {
  success: 'bg-green-100 text-green-700',
  error: 'bg-red-100 text-red-700',
  info: 'bg-cream-deep text-maroon',
} as const;

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const confirm = useToastStore((s) => s.confirm);
  const dismiss = useToastStore((s) => s.dismiss);
  const resolveConfirm = useToastStore((s) => s.resolveConfirm);

  return (
    <>
      {/* Toast stack */}
      <div
        className="pointer-events-none fixed left-1/2 top-6 z-[100] flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 px-4 lg:top-8"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-2xl border p-4 shadow-lg ${typeStyles[t.type]}`}
            role="status"
          >
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${typeIconBg[t.type]}`}
              aria-hidden
            >
              {typeIcons[t.type]}
            </span>
            <p className="flex-1 pt-1 text-sm font-medium leading-snug">{t.message}</p>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              className="shrink-0 text-text-secondary transition hover:text-maroon"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Confirm dialog */}
      {confirm ? (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div
            className="w-full max-w-md rounded-card border border-divider bg-surface p-6 shadow-xl"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
          >
            <h2 id="confirm-title" className="font-serif text-xl font-bold text-text-primary">
              Are you sure?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-text-secondary">
              {confirm.message}
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                className="btn-outline flex-1"
                onClick={() => resolveConfirm(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary flex-1 !bg-maroon"
                onClick={() => resolveConfirm(true)}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
