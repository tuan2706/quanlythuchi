import { AlertTriangle, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { loanStatusCounts } from '@/lib/loan-status'
import type { AppData } from '@/types'

export function LoanStatusOverviewSection({ data }: { data: AppData }) {
  const counts = loanStatusCounts(data)
  if (counts.due_soon === 0 && counts.overdue === 0) return null

  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        {counts.overdue > 0 && (
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-expense/15 text-expense">
              <AlertTriangle className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs text-muted">Quá hạn</p>
              <p className="font-display text-base font-bold text-expense">{counts.overdue} khoản</p>
            </div>
          </div>
        )}
        {counts.due_soon > 0 && (
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-warn/15 text-warn">
              <Clock className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs text-muted">Sắp đến hạn</p>
              <p className="font-display text-base font-bold text-warn">{counts.due_soon} khoản</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
