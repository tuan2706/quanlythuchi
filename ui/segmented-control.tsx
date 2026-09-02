import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface Option<T extends string> {
  value: T
  label: string
}

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  className,
}: {
  value: T
  onChange: (v: T) => void
  options: Option<T>[]
  className?: string
}) {
  return (
    <div className={cn('relative inline-flex items-center rounded-2xl bg-surface-2 p-1', className)}>
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={cn(
              'relative z-10 flex-1 rounded-xl px-4 py-1.5 text-sm font-semibold transition-colors',
              active ? 'text-white' : 'text-muted hover:text-ink',
            )}
          >
            {active && (
              <motion.span
                layoutId="segmented-control-pill"
                className="absolute inset-0 -z-10 rounded-xl bg-brand"
                transition={{ type: 'spring', stiffness: 500, damping: 34 }}
              />
            )}
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
