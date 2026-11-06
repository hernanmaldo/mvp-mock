import { type ReactNode } from 'react'
import { cn } from '../../lib/cn'

export function TableScroll({ children, className }: { children: ReactNode; className?: string }) {
  // Permite desplazamiento horizontal en tablas extensas.
  return (
    <div className={cn('w-full overflow-x-auto scroll-thin', className)}>{children}</div>
  )
}

export function Table({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <table className={cn('w-full border-collapse text-sm', className)}>{children}</table>
  )
}

export function Th({
  children,
  className,
  align = 'left',
}: {
  children?: ReactNode
  className?: string
  align?: 'left' | 'right' | 'center'
}) {
  return (
    <th
      className={cn(
        'whitespace-nowrap border-b border-line bg-surface-sunken px-3 py-2 text-2xs font-semibold uppercase tracking-wide text-ink-muted',
        align === 'right' && 'text-right',
        align === 'center' && 'text-center',
        align === 'left' && 'text-left',
        className,
      )}
    >
      {children}
    </th>
  )
}

export function Td({
  children,
  className,
  align = 'left',
}: {
  children?: ReactNode
  className?: string
  align?: 'left' | 'right' | 'center'
}) {
  return (
    <td
      className={cn(
        'border-b border-line px-3 py-2 align-top text-ink',
        align === 'right' && 'text-right tabular-nums',
        align === 'center' && 'text-center',
        className,
      )}
    >
      {children}
    </td>
  )
}

export function Tr({
  children,
  className,
  hover,
}: {
  children: ReactNode
  className?: string
  hover?: boolean
}) {
  return (
    <tr className={cn(hover && 'hover:bg-surface-hover', className)}>{children}</tr>
  )
}
