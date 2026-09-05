import { useState } from 'react'
import { format } from 'date-fns'
import { Repeat, Settings2, Check, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatMoney } from '@/lib/format'
import { useFinance } from '@/context/FinanceContext'
import type { AppSettings } from '@/types'
import { RecurringManageDialog } from './RecurringManageDialog'

export function RecurringSection({ settings }: { settings: AppSettings }) {
  const { data, confirmRecurring, skipRecurring } = useFinance()
  const [manageOpen, setManageOpen] = useState(false)
  const thisMonth = format(new Date(), 'yyyy-MM')

  const pending = data.recurring.filter(
    (r) => r.active && !data.confirmedRecurringStamps.includes(`${r.id}:${thisMonth}`),
  )

  if (pending.length === 0 && data.recurring.length === 0) return null

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <Repeat className="h-4 w-4 text-brand" />
          <CardTitle>Khoản chi định kỳ tháng này</CardTitle>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setManageOpen(true)}>
          <Settings2 className="h-3.5 w-3.5" /> Quản lý
        </Button>
      </CardHeader>
      <CardContent>
        {pending.length === 0 ? (
          <p className="text-sm text-muted">Đã xác nhận hết khoản chi định kỳ tháng này 👍</p>
        ) : (
          <div className="space-y-2">
            {pending.map((r) => {
              const cat = data.categories.find((c) => c.id === r.categoryId)?.name
              return (
                <div key={r.id} className="flex items-center justify-between gap-2 rounded-xl bg-surface-2 p-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{r.name}</p>
                    <p className="text-xs text-muted">
                      {cat} · {formatMoney(r.amount, settings)}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    <Button size="sm" variant="outline" onClick={() => skipRecurring(r.id, thisMonth)}>
                      <X className="h-3.5 w-3.5" /> Bỏ qua
                    </Button>
                    <Button size="sm" onClick={() => confirmRecurring(r.id, thisMonth)}>
                      <Check className="h-3.5 w-3.5" /> Xác nhận
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
      <RecurringManageDialog open={manageOpen} onOpenChange={setManageOpen} settings={settings} />
    </Card>
  )
}
