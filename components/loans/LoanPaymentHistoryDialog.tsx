import { useRef, useState } from 'react'
import { Plus, Pencil, Trash2, FileSpreadsheet, FileDown, Undo2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Receipt } from 'lucide-react'
import { formatMoney } from '@/lib/format'
import { useFinance } from '@/context/FinanceContext'
import { exportLoanPaymentsExcel, exportLoanPaymentsCsv } from '@/lib/export-import'
import type { AppSettings, Loan, LoanPaymentRecord } from '@/types'
import { AddLoanPaymentDialog } from './AddLoanPaymentDialog'

const UNDO_WINDOW_MS = 5000

export function LoanPaymentHistoryDialog({
  open,
  onOpenChange,
  loan,
  settings,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  loan: Loan
  settings: AppSettings
}) {
  const { data, deleteLoanPayment } = useFinance()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<LoanPaymentRecord | undefined>()
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const undoTimer = useRef<ReturnType<typeof setTimeout>>()

  const payments = data.loanPayments
    .filter((p) => p.loanId === loan.id && p.id !== pendingDeleteId)
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt)

  const totalPrincipal = payments.reduce((s, p) => s + p.principalPaid, 0)
  const totalInterest = payments.reduce((s, p) => s + p.interestPaid, 0)
  const totalFees = payments.reduce((s, p) => s + p.feePaid, 0)

  const requestDelete = (id: string) => {
    setPendingDeleteId(id)
    if (undoTimer.current) clearTimeout(undoTimer.current)
    undoTimer.current = setTimeout(() => {
      deleteLoanPayment(id)
      setPendingDeleteId(null)
    }, UNDO_WINDOW_MS)
  }

  const undoDelete = () => {
    if (undoTimer.current) clearTimeout(undoTimer.current)
    setPendingDeleteId(null)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Lịch sử thanh toán</DialogTitle>
          </DialogHeader>

          <div className="mb-3 grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-surface-2 p-2.5 text-center">
              <p className="text-[10px] text-muted">Tổng gốc</p>
              <p className="text-xs font-semibold tabular text-ink">{formatMoney(totalPrincipal, settings)}</p>
            </div>
            <div className="rounded-xl bg-surface-2 p-2.5 text-center">
              <p className="text-[10px] text-muted">Tổng lãi</p>
              <p className="text-xs font-semibold tabular text-warn">{formatMoney(totalInterest, settings)}</p>
            </div>
            <div className="rounded-xl bg-surface-2 p-2.5 text-center">
              <p className="text-[10px] text-muted">Tổng phí</p>
              <p className="text-xs font-semibold tabular text-expense">{formatMoney(totalFees, settings)}</p>
            </div>
          </div>

          <div className="mb-3 flex gap-2">
            <Button
              className="flex-1"
              onClick={() => {
                setEditing(undefined)
                setFormOpen(true)
              }}
            >
              <Plus className="h-4 w-4" /> Ghi nhận thanh toán
            </Button>
            <Button variant="outline" size="icon" onClick={() => exportLoanPaymentsExcel(data, loan.id)} aria-label="Xuất Excel">
              <FileSpreadsheet className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => exportLoanPaymentsCsv(data, loan.id)} aria-label="Xuất CSV">
              <FileDown className="h-4 w-4" />
            </Button>
          </div>

          {pendingDeleteId && (
            <div className="mb-3 flex items-center justify-between rounded-xl bg-surface-2 px-3 py-2 text-sm">
              <span className="text-muted">Đã xóa khoản thanh toán.</span>
              <button onClick={undoDelete} className="flex items-center gap-1 font-medium text-brand">
                <Undo2 className="h-3.5 w-3.5" /> Hoàn tác
              </button>
            </div>
          )}

          {payments.length === 0 ? (
            <EmptyState icon={Receipt} title="Chưa có thanh toán nào" description="Ghi nhận khoản thanh toán đầu tiên cho khoản vay này." />
          ) : (
            <div className="max-h-72 space-y-1.5 overflow-y-auto">
              {payments.map((p) => (
                <div key={p.id} className="group flex items-center justify-between gap-2 rounded-xl px-2 py-2 hover:bg-surface-2">
                  <div className="min-w-0">
                    <p className="text-sm text-ink">{p.date}</p>
                    <p className="truncate text-xs text-muted">
                      Gốc {formatMoney(p.principalPaid, settings)} · Lãi {formatMoney(p.interestPaid, settings)}
                      {p.feePaid > 0 && ` · Phí ${formatMoney(p.feePaid, settings)}`}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <p className="text-sm font-medium tabular text-ink">{formatMoney(p.totalPaid, settings)}</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100"
                      onClick={() => {
                        setEditing(p)
                        setFormOpen(true)
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-expense opacity-0 group-hover:opacity-100"
                      onClick={() => requestDelete(p.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AddLoanPaymentDialog open={formOpen} onOpenChange={setFormOpen} loan={loan} record={editing} />
    </>
  )
}
