import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { MoneyInput } from '@/components/ui/money-input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { useFinance } from '@/context/FinanceContext'
import { useMascotToast } from '@/components/mascot/MascotToast'
import type { Loan, LoanPaymentRecord, PaymentMethod } from '@/types'

const METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'Tiền mặt',
  bank: 'Ngân hàng',
  ewallet: 'Ví điện tử',
  credit_card: 'Thẻ tín dụng',
}

export function AddLoanPaymentDialog({
  open,
  onOpenChange,
  loan,
  record,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  loan: Loan
  record?: LoanPaymentRecord
}) {
  const { data, addLoanPayment, updateLoanPayment } = useFinance()
  const { showMascotToast } = useMascotToast()
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [principalPaid, setPrincipalPaid] = useState(0)
  const [interestPaid, setInterestPaid] = useState(0)
  const [feePaid, setFeePaid] = useState(0)
  const [method, setMethod] = useState<PaymentMethod>('bank')
  const [accountId, setAccountId] = useState('')
  const [note, setNote] = useState('')

  useEffect(() => {
    if (open) {
      setDate(record?.date || format(new Date(), 'yyyy-MM-dd'))
      setPrincipalPaid(record?.principalPaid || 0)
      setInterestPaid(record?.interestPaid || 0)
      setFeePaid(record?.feePaid || 0)
      setMethod(record?.method || 'bank')
      setAccountId(record?.accountId || data.accounts[0]?.id || '')
      setNote(record?.note || '')
    }
  }, [open, record, data.accounts])

  const total = principalPaid + interestPaid + feePaid
  const canSave = total > 0

  const handleSave = () => {
    if (!canSave) return
    if (record) {
      updateLoanPayment(record.id, { date, principalPaid, interestPaid, feePaid, method, accountId, note: note.trim() })
    } else {
      addLoanPayment({ loanId: loan.id, date, principalPaid, interestPaid, feePaid, method, accountId, note: note.trim() })
      showMascotToast()
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{record ? 'Sửa khoản thanh toán' : 'Ghi nhận thanh toán'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Ngày thanh toán</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Tiền gốc</Label>
              <MoneyInput value={principalPaid} onChange={setPrincipalPaid} />
            </div>
            <div>
              <Label>Tiền lãi</Label>
              <MoneyInput value={interestPaid} onChange={setInterestPaid} />
            </div>
          </div>
          <div>
            <Label>Phí (nếu có)</Label>
            <MoneyInput value={feePaid} onChange={setFeePaid} />
          </div>
          <div className="rounded-xl bg-surface-2 px-3 py-2 text-sm text-ink">
            Tổng thanh toán: <span className="font-semibold tabular">{total.toLocaleString('vi-VN')} đ</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Phương thức</Label>
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
              <Label>Tài khoản</Label>
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
            </div>
          </div>
          <div>
            <Label>Ghi chú</Label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ghi chú (tùy chọn)" />
          </div>
          <p className="text-xs text-muted">Khoản này sẽ tự động ghi vào Nhật ký như một giao dịch thật.</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button disabled={!canSave} onClick={handleSave}>
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
