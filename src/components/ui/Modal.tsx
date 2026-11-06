import { type ReactNode, useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../lib/cn'

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
}: {
  open: boolean
  onClose: () => void
  title: ReactNode
  description?: ReactNode
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg'
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const width = size === 'sm' ? 'max-w-md' : size === 'lg' ? 'max-w-3xl' : 'max-w-xl'

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:p-8">
      <div
        className="fixed inset-0 bg-ink/40 backdrop-blur-[1px]"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'relative z-10 w-full rounded-xl border border-line bg-white shadow-overlay',
          'my-4 animate-[fadein_120ms_ease-out]',
          width,
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-3.5">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-ink">{title}</h2>
            {description && <p className="mt-0.5 text-xs text-ink-muted">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-ink-muted hover:bg-surface-hover focus-visible:focus-ring"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-5 py-4 max-h-[60vh] overflow-y-auto scroll-thin">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-line bg-surface-sunken px-5 py-3 rounded-b-xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
