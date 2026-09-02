import { useState } from 'react'
import { Pencil, Trash2, Wallet2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { formatMoney } from '@/lib/format'
import { cardBalance, cardAvailableCredit, cardUtilization } from '@/lib/creditcard-calculations'
import { useFinance } from '@/context/FinanceContext'
import type { AppSettings, CreditCard } from '@/types'
import { cn } from '@/lib/utils'
import { CardFormDialog } from './CardFormDialog'
import { PayCardDialog } from './PayCardDialog'

export function CardOverviewCard({
  card,
  settings,
  selected,
  onSelect,
}: {
  card: CreditCard
  settings: AppSettings
  selected: boolean
  onSelect: () => void
}) {
  const { data, deleteCreditCard } = useFinance()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [payOpen, setPayOpen] = useState(false)

  const balance = cardBalance(data, card.id)
  const available = cardAvailableCredit(data, card.id, card.creditLimit)
  const utilization = cardUtilization(data, card.id, card.creditLimit)
  const pctDisplay = Math.round(utilization * 100)
  const high = utilization >= 0.8

  return (
    <Card
      onClick={onSelect}
      className={cn('cursor-pointer transition-shadow', selected && 'ring-2 ring-offset-2 ring-offset-bg')}
      style={selected ? ({ ['--tw-ring-color' as any]: card.color } as React.CSSProperties) : undefined}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white"
              style={{ backgroundColor: card.color }}
            >
              <Wallet2 className="h-[18px] w-[18px]" />
            </span>
            <div className="min-w-0">
              <p className="font-medium text-ink truncate">{card.name}</p>
              <p className="text-xs text-muted truncate">{card.bank}</p>
            </div>
          </div>
          <div className="flex shrink-0 gap-1" onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditOpen(true)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-expense" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <div className="mt-3 flex items-end justify-between">
          <div>
            <p className="text-xs text-muted">Đã sử dụng</p>
            <p className={cn('font-display text-lg font-bold tabular', high ? 'text-expense' : 'text-ink')}>
              {formatMoney(balance, settings)}
            </p>
          </div>
          <p className="text-xs text-muted tabular">/ {formatMoney(card.creditLimit, settings)}</p>
        </div>
        <Progress value={pctDisplay} className="mt-2" indicatorClassName={high ? 'bg-expense' : 'bg-brand'} />

        <div className="mt-2 flex items-center justify-between text-xs">
          <span className="text-muted">Còn lại {formatMoney(available, settings)}</span>
          <span className="text-muted">
            Sao kê {card.statementDay} · Thanh toán {card.paymentDay}
          </span>
        </div>

        <Button size="sm" className="mt-3 w-full" onClick={(e) => { e.stopPropagation(); setPayOpen(true) }}>
          Thanh toán
        </Button>
      </CardContent>

      <CardFormDialog open={editOpen} onOpenChange={setEditOpen} card={card} />
      <PayCardDialog open={payOpen} onOpenChange={setPayOpen} card={card} settings={settings} />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Xóa thẻ tín dụng?"
        description={`"${card.name}" và lịch sử quẹt thẻ sẽ bị xóa. Các giao dịch thanh toán đã ghi vào Nhật ký vẫn được giữ nguyên.`}
        onConfirm={() => deleteCreditCard(card.id)}
      />
    </Card>
  )
}
