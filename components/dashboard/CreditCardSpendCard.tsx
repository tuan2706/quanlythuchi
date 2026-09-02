import { CreditCard } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { formatMoney } from '@/lib/format'
import { totalSwipedThisMonth } from '@/lib/creditcard-calculations'
import type { AppData, AppSettings } from '@/types'

export function CreditCardSpendCard({ data, month, settings }: { data: AppData; month: string; settings: AppSettings }) {
  if (data.creditCards.length === 0) return null

  const total = data.creditCards.reduce((s, c) => s + totalSwipedThisMonth(data, c.id, month), 0)

  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-light text-brand">
          <CreditCard className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-xs text-muted">Tổng chi tiêu bằng thẻ tín dụng tháng này</p>
          <p className="font-display text-lg font-bold tabular text-ink">{formatMoney(total, settings)}</p>
        </div>
      </CardContent>
    </Card>
  )
}
