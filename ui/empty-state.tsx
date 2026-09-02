import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-border-strong py-12 px-6 text-center', className)}>
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-2 text-muted">
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="font-display font-semibold text-ink">{title}</p>
        {description && <p className="mt-1 text-sm text-muted max-w-xs">{description}</p>}
      </div>
      {action}
    </div>
  )
}
