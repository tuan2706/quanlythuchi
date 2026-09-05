import { Badge } from '@/components/ui/badge'
import { LOAN_STATUS_LABELS, type LoanStatus } from '@/lib/loan-status'
import { cn } from '@/lib/utils'

const VARIANT: Record<LoanStatus, 'income' | 'warn' | 'expense' | 'neutral' | 'default'> = {
  active: 'default',
  due_soon: 'warn',
  overdue: 'expense',
  settled: 'income',
  cancelled: 'neutral',
}

export function LoanStatusBadge({ status, className }: { status: LoanStatus; className?: string }) {
  return (
    <Badge variant={VARIANT[status]} className={cn(className)}>
      {LOAN_STATUS_LABELS[status]}
    </Badge>
  )
}
