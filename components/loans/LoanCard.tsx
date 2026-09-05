import { useState } from 'react'
import { Pencil, Trash2, CalendarClock, CreditCard, CheckCircle2, Receipt, Flag, XCircle, RotateCcw, User } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { formatMoney } from '@/lib/format'
import { useFinance } from '@/context/FinanceContext'
import { isInstallmentLoan, loanProgressPct, isLoanComplete } from '@/lib/loan-calculations'
import { computeLoanStatus, getDueSoonThreshold } from '@/lib/loan-status'
import { LOAN_CATEGORY_LABELS } from './wizard/wizard-types'
import type { AppSettings, Loan } from '@/types'
import { LoanFormDialog } from './LoanFormDialog'
import { LoanStatusBadge } from './LoanStatusBadge'
import { LoanPaymentHistoryDialog } from './LoanPaymentHistoryDialog'
import { SettleLoanDialog } from './SettleLoanDialog'
import { PayInstallmentDialog } from './PayInstallmentDialog'

export function LoanCard({ loan, settings }: { loan: Loan; settings: AppSettings }) {
  const { data, deleteLoan, cancelLoan, reactivateLoan } = useFinance()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [settleOpen, setSettleOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [payOpen, setPayOpen] = useState(false)

  const installment = isInstallmentLoan(loan)
  const remaining = Math.max(loan.totalAmount - loan.paidAmount, 0)
  const pct = loanProgressPct(loan)
  const paidOff = isLoanComplete(loan)
  const linkedCard = loan.sourceCardId ? data.creditCards.find((c) => c.id === loan.sourceCardId) : undefined
  const status = computeLoanStatus(loan, getDueSoonThreshold(data))
  const inactive = status === 'settled' || status === 'cancelled'

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="mb-1 flex flex-wrap items-center gap-1.5">
              <LoanStatusBadge status={status} />
              {loan.category && (
                <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[11px] text-muted">
                  {LOAN_CATEGORY_LABELS[loan.category]}
                </span>
              )}
            </div>
            <p className="font-medium text-ink truncate">{loan.name}</p>
            {loan.counterpartyName && (
              <p className="flex items-center gap-1 text-xs text-muted truncate">
                <User className="h-3 w-3" /> {loan.counterpartyName}
              </p>
            )}
            {loan.note && <p className="text-xs text-muted truncate">{loan.note}</p>}
            {linkedCard && (
              <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-surface-2 px-2 py-0.5 text-[11px] text-muted">
                <CreditCard className="h-3 w-3" /> {linkedCard.name}
              </span>
            )}
          </div>
          <div className="flex shrink-0 gap-1">
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
            <p className="text-xs text-muted">Còn lại</p>
            <p className="font-display text-lg font-semibold tabular text-warn">{formatMoney(remaining, settings)}</p>
          </div>
          <p className="text-xs text-muted tabular">/ {formatMoney(loan.totalAmount, settings)}</p>
        </div>
        <Progress value={pct} className="mt-2" indicatorClassName={paidOff ? 'bg-income' : 'bg-warn'} />

        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="text-muted">
            {paidOff
              ? status === 'cancelled'
                ? 'Đã hủy'
                : 'Đã trả xong 🎉'
              : installment
                ? `Đã trả ${loan.paidInstallments || 0}/${loan.totalInstallments} kỳ`
                : `Đã trả ${pct}%`}
          </span>
          {!inactive && (
            <span className="flex items-center gap-1 text-ink">
              <CalendarClock className="h-3.5 w-3.5 text-muted" />
              {formatMoney(loan.monthlyPayment, settings)}/tháng · ngày {loan.paymentDay}
            </span>
          )}
        </div>

        {installment && !inactive && (
          <Button size="sm" className="mt-3 w-full" onClick={() => setPayOpen(true)}>
            <CheckCircle2 className="h-3.5 w-3.5" /> Trả kỳ này ({(loan.paidInstallments || 0) + 1}/{loan.totalInstallments})
          </Button>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border pt-2">
          <button onClick={() => setHistoryOpen(true)} className="flex items-center gap-1 text-xs font-medium text-brand">
            <Receipt className="h-3.5 w-3.5" /> Lịch sử thanh toán
          </button>
          {!inactive && (
            <button onClick={() => setSettleOpen(true)} className="flex items-center gap-1 text-xs font-medium text-income">
              <Flag className="h-3.5 w-3.5" /> Tất toán
            </button>
          )}
          {!inactive && (
            <button onClick={() => setCancelOpen(true)} className="flex items-center gap-1 text-xs font-medium text-muted">
              <XCircle className="h-3.5 w-3.5" /> Hủy
            </button>
          )}
          {inactive && (
            <button onClick={() => reactivateLoan(loan.id)} className="flex items-center gap-1 text-xs font-medium text-brand">
              <RotateCcw className="h-3.5 w-3.5" /> Kích hoạt lại
            </button>
          )}
        </div>
      </CardContent>

      <LoanFormDialog open={editOpen} onOpenChange={setEditOpen} loan={loan} />
      <PayInstallmentDialog open={payOpen} onOpenChange={setPayOpen} loan={loan} />
      <LoanPaymentHistoryDialog open={historyOpen} onOpenChange={setHistoryOpen} loan={loan} settings={settings} />
      <SettleLoanDialog open={settleOpen} onOpenChange={setSettleOpen} loan={loan} settings={settings} />
      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Hủy khoản vay?"
        description={`"${loan.name}" sẽ chuyển sang trạng thái đã hủy. Bạn có thể kích hoạt lại bất cứ lúc nào.`}
        confirmLabel="Hủy khoản vay"
        onConfirm={() => cancelLoan(loan.id)}
      />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Xóa khoản vay?"
        description={`"${loan.name}" sẽ bị xóa vĩnh viễn.`}
        onConfirm={() => deleteLoan(loan.id)}
      />
    </Card>
  )
}
