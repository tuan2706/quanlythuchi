import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { MoneyInput } from '@/components/ui/money-input'
import { formatMoney } from '@/lib/format'
import { useFinance } from '@/context/FinanceContext'
import type { AppSettings, Loan } from '@/types'

export function SettleLoanDialog({
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
  const { settleLoan } = useFinance()
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [fee, setFee] = useState(0)

  useEffect(() => {
    if (open) {
      setDate(format(new Date(), 'yyyy-MM-dd'))
      setFee(0)
    }
  }, [open])

  const remaining = Math.max(loan.totalAmount - loan.paidAmount, 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tất toán khoản vay</DialogTitle>
          <DialogDescription>
            "{loan.name}" — còn lại {formatMoney(remaining, settings)}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Ngày tất toán</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <Label>Phí tất toán trước hạn (nếu có)</Label>
            <MoneyInput value={fee} onChange={setFee} />
          </div>
          <p className="text-xs text-muted">
            Khoản vay sẽ chuyển sang trạng thái "Đã tất toán". Nếu có phí, một giao dịch chi sẽ được tự động ghi vào Nhật ký.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            onClick={() => {
              settleLoan(loan.id, date, fee)
              onOpenChange(false)
            }}
          >
            Xác nhận tất toán
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
