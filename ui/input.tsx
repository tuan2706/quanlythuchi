import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'flex h-12 w-full rounded-2xl border border-border bg-surface-2 px-4 py-2 text-[15px] text-ink placeholder:text-muted/70',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:border-transparent transition-shadow',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  ),
)
Input.displayName = 'Input'
