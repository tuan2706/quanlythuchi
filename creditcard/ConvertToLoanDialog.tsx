import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { formatMoney } from '@/lib/format'
import { useFinance } from '@/context/FinanceContext'
import type { AppSettings, CardTransaction } from '@/types'

export function ConvertToLoanDialog({
  open,
  onOpenChange,
  transaction,
  settings,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  transaction: CardTransaction
  settings: AppSettings
}) {
  const { convertCardTransactionToLoan } = useFinance()
  const [installments, setInstallments] = useState(12)

  const monthlyPreview = installments > 0 ? Math.round(transaction.amount / installments) : 0

  const handleConvert = () => {
    if (installments <= 0) return
    convertCardTransactionToLoan(transaction.id, installments)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chuyển đổi trả góp</DialogTitle>
          <DialogDescription>
            "{transaction.name}" — {formatMoney(transaction.amount, settings)}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Số kỳ trả góp</Label>
            <Input
              type="number"
              min={2}
              max={60}
              value={installments || ''}
              onChange={(e) => setInstallments(Math.max(0, Number(e.target.value) || 0))}
              placeholder="VD: 12"
            />
          </div>
          {installments > 0 && (
            <p className="rounded-xl bg-surface-2 p-3 text-sm text-ink">
              Mỗi kỳ khoảng <span className="font-semibold tabular">{formatMoney(monthlyPreview, settings)}</span> ×{' '}
              {installments} kỳ
            </p>
          )}
          <p className="text-xs text-muted">
            Khoản này sẽ được tạo thành một khoản vay trả góp riêng, không còn tính vào dư nợ thường xuyên của thẻ nữa.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button disabled={installments < 2} onClick={handleConvert}>
            Xác nhận chuyển đổi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
