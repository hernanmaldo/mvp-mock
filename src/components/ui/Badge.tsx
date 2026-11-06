import { type ReactNode } from 'react'
import { cn } from '../../lib/cn'

export type Tone = 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'brand'

const tones: Record<Tone, string> = {
  neutral: 'bg-neutralTag-bg text-neutralTag-fg',
  info: 'bg-info-bg text-info-fg',
  success: 'bg-success-bg text-success-fg',
  warning: 'bg-warning-bg text-warning-fg',
  danger: 'bg-danger-bg text-danger-fg',
  brand: 'bg-brand-50 text-brand-600',
}

export function Badge({
  tone = 'neutral',
  icon,
  children,
  className,
}: {
  tone?: Tone
  icon?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-2xs font-semibold uppercase tracking-wide',
        tones[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  )
}
