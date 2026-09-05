import { TrendingUp, Repeat } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { formatMoney } from '@/lib/format'
import { activeInstallmentLoans, nearestCompletionLoan, installmentsRemaining, loanProgressPct } from '@/lib/loan-calculations'
import type { AppData, AppSettings } from '@/types'

export function LoanHighlightSection({ data, settings }: { data: AppData; settings: AppSettings }) {
  const active = activeInstallmentLoans(data)
  const nearest = nearestCompletionLoan(data)

  if (active.length === 0) return null

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-ink">
          <Repeat className="h-4 w-4 text-brand" />
          {active.length} khoản trả góp đang chạy
        </div>

        {nearest && (
          <div className="rounded-xl bg-surface-2 p-3">
            <div className="mb-1.5 flex items-center justify-between">
              <p className="flex items-center gap-1.5 text-sm font-medium text-ink">
                <TrendingUp className="h-3.5 w-3.5 text-income" />
                {nearest.name}
              </p>
              <span className="text-xs text-muted">
                {(nearest.paidInstallments || 0)}/{nearest.totalInstallments} kỳ
              </span>
            </div>
            <Progress value={loanProgressPct(nearest)} />
            <p className="mt-1.5 text-xs text-muted">
              Còn {installmentsRemaining(nearest)} kỳ · {formatMoney(nearest.monthlyPayment, settings)}/tháng
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
