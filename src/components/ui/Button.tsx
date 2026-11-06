import { type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from '../../lib/cn'

type Variant = 'primary' | 'default' | 'subtle' | 'danger' | 'ghost'
type Size = 'sm' | 'md'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  icon?: ReactNode
  iconRight?: ReactNode
  children?: ReactNode
}

const variants: Record<Variant, string> = {
  primary:
    'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-700 border border-transparent',
  default:
    'bg-white text-ink border border-line hover:bg-surface-hover active:bg-surface-hover',
  subtle:
    'bg-neutralTag-bg text-ink-subtle border border-transparent hover:bg-line',
  danger:
    'bg-danger-bg text-danger-fg border border-danger-border hover:brightness-95',
  ghost:
    'bg-transparent text-ink-subtle border border-transparent hover:bg-surface-hover',
}

const sizes: Record<Size, string> = {
  sm: 'h-7 px-2.5 text-xs gap-1.5',
  md: 'h-9 px-3.5 text-sm gap-2',
}

export function Button({
  variant = 'default',
  size = 'md',
  icon,
  iconRight,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded font-medium transition-colors',
        'focus-visible:focus-ring disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap',
        variants[variant],
        sizes[size],
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
      {iconRight}
    </button>
  )
}
