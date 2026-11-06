import { CheckCircle2, Info, AlertTriangle, X } from 'lucide-react'
import { useDemo } from '../store/DemoContext'
import { cn } from '../lib/cn'

const toneStyles = {
  info: { cls: 'border-info-border bg-white text-ink', Icon: Info, iconCls: 'text-brand-600' },
  success: { cls: 'border-success-border bg-white text-ink', Icon: CheckCircle2, iconCls: 'text-success-fg' },
  warning: { cls: 'border-warning-border bg-white text-ink', Icon: AlertTriangle, iconCls: 'text-warning-fg' },
}

export function ToastHost() {
  const { toasts, dismissToast } = useDemo()
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-80 flex-col gap-2">
      {toasts.map((t) => {
        const { cls, Icon, iconCls } = toneStyles[t.tone]
        return (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto flex items-start gap-2.5 rounded-lg border px-3 py-2.5 shadow-overlay',
              'animate-[slidein_140ms_ease-out]',
              cls,
            )}
            role="status"
          >
            <Icon size={16} className={cn('mt-0.5 shrink-0', iconCls)} />
            <p className="flex-1 text-xs leading-relaxed">{t.message}</p>
            <button
              onClick={() => dismissToast(t.id)}
              className="rounded p-0.5 text-ink-muted hover:bg-surface-hover"
              aria-label="Cerrar aviso"
            >
              <X size={14} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
