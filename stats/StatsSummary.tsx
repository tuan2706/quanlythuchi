import { Card, CardContent } from '@/components/ui/card'
import { formatMoney } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { AppSettings } from '@/types'

export function StatsSummary({
  income,
  expense,
  balance,
  settings,
}: {
  income: number
  expense: number
  balance: number
  settings: AppSettings
}) {
  const savingsRate = income > 0 ? Math.round((balance / income) * 100) : 0

  const items = [
    { label: 'Tổng thu tháng', value: formatMoney(income, settings), tone: 'text-income' },
    { label: 'Tổng chi tháng', value: formatMoney(expense, settings), tone: 'text-expense' },
    { label: 'Tiền còn lại', value: formatMoney(balance, settings), tone: balance >= 0 ? 'text-ink' : 'text-expense' },
    { label: 'Tỷ lệ tiết kiệm', value: `${savingsRate}%`, tone: savingsRate >= 0 ? 'text-brand' : 'text-expense' },
  ]

  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((it) => (
        <Card key={it.label}>
          <CardContent className="p-4">
            <p className="text-xs text-muted">{it.label}</p>
            <p className={cn('mt-1 font-display text-lg font-semibold tabular truncate', it.tone)}>{it.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
