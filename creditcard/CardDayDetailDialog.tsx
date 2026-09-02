import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { Plus, Pencil, Trash2, CreditCard as CardIcon, Repeat, CheckCircle2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { formatMoney } from '@/lib/format'
import { cardTransactionsForDay } from '@/lib/creditcard-calculations'
import { useFinance } from '@/context/FinanceContext'
import type { AppSettings, CardTransaction } from '@/types'
import { CardTransactionFormDialog } from './CardTransactionFormDialog'
import { ConvertToLoanDialog } from './ConvertToLoanDialog'

const WEEKDAYS = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']

export function CardDayDetailDialog({
  day,
  cardId,
  open,
  onOpenChange,
  settings,
}: {
  day: string
  cardId: string
  open: boolean
  onOpenChange: (v: boolean) => void
  settings: AppSettings
}) {
  const { data, deleteCardTransaction } = useFinance()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<CardTransaction | undefined>()
  const [deleting, setDeleting] = useState<CardTransaction | undefined>()
  const [converting, setConverting] = useState<CardTransaction | undefined>()

  const txs = cardTransactionsForDay(data, cardId, day).slice().sort((a, b) => b.createdAt - a.createdAt)
  const total = txs.reduce((s, t) => s + t.amount, 0)
  const date = parseISO(day)

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {WEEKDAYS[date.getDay()]}, {format(date, 'dd/MM/yyyy')}
            </DialogTitle>
          </DialogHeader>

          <Button
            variant="outline"
            className="mb-4 w-full"
            onClick={() => {
              setEditing(undefined)
              setFormOpen(true)
            }}
          >
            <Plus className="h-4 w-4" /> Thêm giao dịch quẹt thẻ
          </Button>

          {txs.length === 0 ? (
            <EmptyState icon={CardIcon} title="Chưa có giao dịch" description="Thêm khoản quẹt thẻ cho ngày này." />
          ) : (
            <div className="max-h-72 space-y-1.5 overflow-y-auto">
              {txs.map((t) => {
                const cat = data.categories.find((c) => c.id === t.categoryId)?.name
                const converted = !!t.convertedToLoanId
                return (
                  <div key={t.id} className="group rounded-xl px-2 py-2 hover:bg-surface-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm text-ink">{t.name}</p>
                        {cat && <p className="truncate text-xs text-muted">{cat}</p>}
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <p className="text-sm font-medium tabular text-ink">{formatMoney(t.amount, settings)}</p>
                        {!converted && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 opacity-0 group-hover:opacity-100"
                              onClick={() => {
                                setEditing(t)
                                setFormOpen(true)
                              }}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-expense opacity-0 group-hover:opacity-100"
                              onClick={() => setDeleting(t)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="mt-1">
                      {converted ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-income/15 px-2 py-0.5 text-[11px] text-income">
                          <CheckCircle2 className="h-3 w-3" /> Đã chuyển đổi trả góp
                        </span>
                      ) : (
                        <button
                          onClick={() => setConverting(t)}
                          className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2 py-0.5 text-[11px] text-brand hover:bg-brand-light"
                        >
                          <Repeat className="h-3 w-3" /> Chuyển đổi trả góp
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div className="mt-4 rounded-xl bg-surface-2 p-3 text-center">
            <p className="text-[11px] text-muted">Tổng đã quẹt hôm nay</p>
            <p className="text-base font-semibold tabular text-ink">{formatMoney(total, settings)}</p>
          </div>
        </DialogContent>
      </Dialog>

      <CardTransactionFormDialog open={formOpen} onOpenChange={setFormOpen} day={day} cardId={cardId} transaction={editing} />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(v) => !v && setDeleting(undefined)}
        title="Xóa giao dịch?"
        description="Giao dịch quẹt thẻ này sẽ bị xóa vĩnh viễn."
        onConfirm={() => deleting && deleteCardTransaction(deleting.id)}
      />
      {converting && (
        <ConvertToLoanDialog
          open={!!converting}
          onOpenChange={(v) => !v && setConverting(undefined)}
          transaction={converting}
          settings={settings}
        />
      )}
    </>
  )
}
