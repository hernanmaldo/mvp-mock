import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Info } from 'lucide-react'
import { cn } from '../../lib/cn'

export function Breadcrumbs({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <nav className="flex items-center gap-1 text-xs text-ink-muted" aria-label="Breadcrumb">
      {items.map((it, i) => (
        <span key={i} className="flex items-center gap-1">
          {it.to ? (
            <Link to={it.to} className="hover:text-brand-600 hover:underline">
              {it.label}
            </Link>
          ) : (
            <span className="text-ink-subtle">{it.label}</span>
          )}
          {i < items.length - 1 && <ChevronRight size={13} className="text-ink-disabled" />}
        </span>
      ))}
    </nav>
  )
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold text-ink">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}

/** Nota informativa de demostración (texto + icono, además del color). */
export function DemoNote({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'flex items-start gap-2 rounded-md border border-info-border bg-info-bg px-3 py-2 text-xs text-info-fg',
        className,
      )}
    >
      <Info size={15} className="mt-0.5 shrink-0" />
      <div>{children}</div>
    </div>
  )
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-line bg-white px-6 py-10 text-center">
      {icon && <div className="text-ink-disabled">{icon}</div>}
      <p className="text-sm font-medium text-ink">{title}</p>
      {description && <p className="max-w-md text-xs text-ink-muted">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

export function DefinitionList({ items }: { items: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((it, i) => (
        <div key={i}>
          <dt className="text-2xs font-semibold uppercase tracking-wide text-ink-muted">
            {it.label}
          </dt>
          <dd className="mt-0.5 text-sm text-ink">{it.value}</dd>
        </div>
      ))}
    </dl>
  )
}
