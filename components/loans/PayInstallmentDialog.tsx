import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { MoneyInput } from '@/components/ui/money-input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { EmptyState } from '@/components/ui/empty-state'
import { Wallet } from 'lucide-react'
import { useFinance } from '@/context/FinanceContext'
import { useMascotToast } from '@/components/mascot/MascotToast'
import type { Loan, PaymentMethod } from '@/types'

const METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'Tiền mặt',
  bank: 'Chuyển khoản ngân hàng',
  ewallet: 'Ví điện tử',
  credit_card: 'Thẻ tín dụng',
}

export function PayInstallmentDialog({
  open,
  onOpenChange,
  loan,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  loan: Loan
}) {
  const { data, payLoanInstallment } = useFinance()
  const { showMascotToast } = useMascotToast()
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [amount, setAmount] = useState(0)
  const [method, setMethod] = useState<PaymentMethod>('bank')
  const [accountId, setAccountId] = useState('')
  const [note, setNote] = useState('')

  const nextInstallment = (loan.paidInstallments || 0) + 1

  useEffect(() => {
    if (open) {
      setDate(format(new Date(), 'yyyy-MM-dd'))
      setAmount(loan.monthlyPayment)
      setMethod('bank')
      setAccountId(data.accounts[0]?.id || '')
      setNote('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, loan])

  const canSave = amount > 0

  const handleSave = () => {
    if (!canSave) return
    payLoanInstallment(loan.id, { date, amount, method, accountId: accountId || undefined, note: note.trim() })
    const remainingAfter = (loan.totalInstallments || 0) - nextInstallment
    showMascotToast(remainingAfter <= 0 ? 'loan_near_complete' : 'transaction_saved')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ghi nhận thanh toán</DialogTitle>
          <DialogDescription>
            Kỳ {nextInstallment}/{loan.totalInstallments} — {loan.name}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Ngày thanh toán</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <Label>Số tiền thanh toán</Label>
            <MoneyInput value={amount} onChange={setAmount} autoFocus />
          </div>
          <div>
            <Label>Phương thức thanh toán</Label>
            <Select value={method} onValueChange={(v) => setMethod(v as PaymentMethod)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(METHOD_LABELS) as PaymentMethod[]).map((m) => (
                  <SelectItem key={m} value={m}>
                    {METHOD_LABELS[m]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Tài khoản thanh toán</Label>
            {data.accounts.length === 0 ? (
              <EmptyState
                icon={Wallet}
                title="Chưa có tài khoản"
                description="Tạo tài khoản trong Cài đặt để app tự trừ đúng số dư, hoặc cứ để trống và ghi nhận riêng."
              />
            ) : (
              <Select value={accountId} onValueChange={setAccountId}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn tài khoản" />
                </SelectTrigger>
                <SelectContent>
                  {data.accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div>
            <Label>Ghi chú</Label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ghi chú (tùy chọn)" />
          </div>
          <p className="text-xs text-muted">
            Số tiền sẽ tự động trừ vào tài khoản đã chọn và ghi vào Nhật ký như một khoản chi thật.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button disabled={!canSave} onClick={handleSave}>
            Xác nhận thanh toán
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
