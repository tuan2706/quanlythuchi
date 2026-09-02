import { forwardRef } from 'react'
import { Input } from './input'
import { formatInputNumber, parseMoneyInput } from '@/lib/format'
import { cn } from '@/lib/utils'

interface MoneyInputProps {
  value: number
  onChange: (value: number) => void
  placeholder?: string
  className?: string
  suffix?: string
  autoFocus?: boolean
}

export const MoneyInput = forwardRef<HTMLInputElement, MoneyInputProps>(
  ({ value, onChange, placeholder = '0', className, suffix = '\u20ab', autoFocus }, ref) => {
    return (
      <div className="relative">
        <Input
          ref={ref}
          inputMode="numeric"
          autoFocus={autoFocus}
          className={cn('pr-11 text-right text-xl font-bold tabular', className)}
          placeholder={placeholder}
          value={formatInputNumber(value)}
          onChange={(e) => onChange(parseMoneyInput(e.target.value))}
        />
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-muted">
          {suffix}
        </span>
      </div>
    )
  },
)
MoneyInput.displayName = 'MoneyInput'
