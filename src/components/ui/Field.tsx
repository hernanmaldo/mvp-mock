import {
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
  type ReactNode,
} from 'react'
import { cn } from '../../lib/cn'

const baseControl =
  'w-full rounded border border-line bg-white px-2.5 py-1.5 text-sm text-ink placeholder:text-ink-disabled ' +
  'focus-visible:focus-ring disabled:bg-surface-sunken disabled:text-ink-muted'

export function Label({
  children,
  htmlFor,
  required,
}: {
  children: ReactNode
  htmlFor?: string
  required?: boolean
}) {
  return (
    <label htmlFor={htmlFor} className="mb-1 block text-xs font-semibold text-ink-subtle">
      {children}
      {required && <span className="ml-0.5 text-danger-fg">*</span>}
    </label>
  )
}

export function FieldWrap({
  label,
  htmlFor,
  required,
  hint,
  error,
  children,
}: {
  label?: ReactNode
  htmlFor?: string
  required?: boolean
  hint?: ReactNode
  error?: ReactNode
  children: ReactNode
}) {
  return (
    <div>
      {label && (
        <Label htmlFor={htmlFor} required={required}>
          {label}
        </Label>
      )}
      {children}
      {error ? (
        <p className="mt-1 text-xs text-danger-fg">{error}</p>
      ) : (
        hint && <p className="mt-1 text-xs text-ink-muted">{hint}</p>
      )}
    </div>
  )
}

export function TextInput({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(baseControl, className)} {...rest} />
}

export function TextArea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(baseControl, 'min-h-[76px] resize-y', className)} {...rest} />
}

export function Select({
  className,
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(baseControl, 'appearance-none pr-8 cursor-pointer', className)} {...rest}>
      {children}
    </select>
  )
}

export function Checkbox({
  label,
  description,
  className,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { label?: ReactNode; description?: ReactNode }) {
  return (
    <label className={cn('flex cursor-pointer items-start gap-2.5', className)}>
      <input
        type="checkbox"
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-line text-brand-600 focus-visible:focus-ring accent-brand-600"
        {...rest}
      />
      {(label || description) && (
        <span className="min-w-0">
          {label && <span className="block text-sm text-ink">{label}</span>}
          {description && <span className="block text-xs text-ink-muted">{description}</span>}
        </span>
      )}
    </label>
  )
}
