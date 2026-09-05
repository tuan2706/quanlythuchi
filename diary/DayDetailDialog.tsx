import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { Plus, Pencil, Trash2, ArrowUpCircle, ArrowDownCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { formatMoney } from '@/lib/format'
import { transactionsForDay, totalsFor } from '@/lib/calculations'
import { useFinance } from '@/context/FinanceContext'
import type { AppSettings, Transaction } from '@/types'
import { TransactionFormDialog } from './TransactionFormDialog'

const WEEKDAYS = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']

export function DayDetailDialog({
  day,
  open,
  onOpenChange,
  settings,
}: {
  day: string
  open: boolean
  onOpenChange: (v: boolean) => void
  settings: AppSettings
}) {
  const { data, deleteTransaction } = useFinance()
  const [formOpen, setFormOpen] = useState(false)
  const [formType, setFormType] = useState<'income' | 'expense'>('expense')
  const [editing, setEditing] = useState<Transaction | undefined>()
  const [deleting, setDeleting] = useState<Transaction | undefined>()

  const txs = transactionsForDay(data, day).slice().sort((a, b) => b.createdAt - a.createdAt)
  const totals = totalsFor(txs)
  const date = parseISO(day)

  const openAdd = (type: 'income' | 'expense') => {
    setEditing(undefined)
    setFormType(type)
    setFormOpen(true)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{WEEKDAYS[date.getDay()]}, {format(date, 'dd/MM/yyyy')}</DialogTitle>
          </DialogHeader>

          <div className="mb-4 grid grid-cols-2 gap-2">
            <Button variant="outline" className="text-income border-income/30 hover:bg-income/10" onClick={() => openAdd('income')}>
              <Plus className="h-4 w-4" /> Khoản thu
            </Button>
            <Button variant="outline" className="text-expense border-expense/30 hover:bg-expense/10" onClick={() => openAdd('expense')}>
              <Plus className="h-4 w-4" /> Khoản chi
            </Button>
          </div>

          {txs.length === 0 ? (
            <EmptyState icon={Plus} title="Chưa có giao dịch" description="Thêm khoản thu hoặc khoản chi cho ngày này." />
          ) : (
            <div className="space-y-1.5 max-h-72 overflow-y-auto">
              {txs.map((t) => {
                const cat = data.categories.find((c) => c.id === t.categoryId)?.name
                const isIncome = t.type === 'income'
                return (
                  <div key={t.id} className="flex items-center justify-between gap-2 rounded-xl px-2 py-2 hover:bg-surface-2 group">
                    <div className="flex min-w-0 items-center gap-2.5">
                      {isIncome ? (
                        <ArrowUpCircle className="h-4 w-4 shrink-0 text-income" />
                      ) : (
                        <ArrowDownCircle className="h-4 w-4 shrink-0 text-expense" />
                      )}
                      <div className="min-w-0">
                        <p className="text-sm text-ink truncate">{t.note || (isIncome ? 'Khoản thu' : cat) || 'Khoản chi'}</p>
                        {!isIncome && cat && <p className="text-xs text-muted truncate">{cat}</p>}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <p className={`text-sm font-medium tabular ${isIncome ? 'text-income' : 'text-expense'}`}>
                        {isIncome ? '+' : '-'}
                        {formatMoney(t.amount, settings)}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100"
                        onClick={() => {
                          setEditing(t)
                          setFormType(t.type)
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
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-surface-2 p-3 text-center">
            <div>
              <p className="text-[11px] text-muted">Thu</p>
              <p className="text-sm font-medium tabular text-income">{formatMoney(totals.income, settings)}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted">Chi</p>
              <p className="text-sm font-medium tabular text-expense">{formatMoney(totals.expense, settings)}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted">Số dư</p>
              <p className="text-sm font-medium tabular text-ink">{formatMoney(totals.balance, settings)}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <TransactionFormDialog open={formOpen} onOpenChange={setFormOpen} day={day} transaction={editing} defaultType={formType} />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(v) => !v && setDeleting(undefined)}
        title="Xóa giao dịch?"
        description="Giao dịch này sẽ bị xóa vĩnh viễn."
        onConfirm={() => deleting && deleteTransaction(deleting.id)}
      />
    </>
  )
}
