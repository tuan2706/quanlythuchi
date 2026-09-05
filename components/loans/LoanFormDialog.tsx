import { useEffect, useState } from 'react'
import { addMonths, format } from 'date-fns'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { MoneyInput } from '@/components/ui/money-input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { useFinance } from '@/context/FinanceContext'
import type { Loan } from '@/types'

function useDayInput(initial: number) {
  const [day, setDay] = useState(initial)
  const bind = {
    value: day === 0 ? '' : day,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value
      if (raw === '') {
        setDay(0)
        return
      }
      const n = Number(raw)
      if (!Number.isNaN(n)) setDay(Math.min(31, Math.max(0, n)))
    },
    onBlur: () => setDay((d) => Math.min(31, Math.max(1, d || 1))),
  }
  return [day, setDay, bind] as const
}

export function LoanFormDialog({
  open,
  onOpenChange,
  loan,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  loan?: Loan
}) {
  const { data, addLoan, updateLoan } = useFinance()
  const [name, setName] = useState('')
  const [total, setTotal] = useState(0)
  const [paid, setPaid] = useState(0)
  const [monthly, setMonthly] = useState(0)
  const [day, setDay, dayBind] = useDayInput(1)
  const [note, setNote] = useState('')

  const [useInstallments, setUseInstallments] = useState(false)
  const [totalInstallments, setTotalInstallments] = useState(0)
  const [paidInstallments, setPaidInstallments] = useState(0)
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [sourceType, setSourceType] = useState<'bank' | 'card'>('bank')
  const [sourceCardId, setSourceCardId] = useState('')

  useEffect(() => {
    if (open) {
      setName(loan?.name || '')
      setTotal(loan?.totalAmount || 0)
      setPaid(loan?.paidAmount || 0)
      setMonthly(loan?.monthlyPayment || 0)
      setDay(loan?.paymentDay || 1)
      setNote(loan?.note || '')
      setUseInstallments(!!loan?.totalInstallments)
      setTotalInstallments(loan?.totalInstallments || 0)
      setPaidInstallments(loan?.paidInstallments || 0)
      setStartDate(loan?.startDate || format(new Date(), 'yyyy-MM-dd'))
      setSourceType(loan?.sourceType || 'bank')
      setSourceCardId(loan?.sourceCardId || '')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, loan])

  const canSave = name.trim() && total > 0

  const handleSave = () => {
    if (!canSave) return
    const payload: Omit<Loan, 'id' | 'createdAt'> = {
      name: name.trim(),
      totalAmount: total,
      paidAmount: paid,
      monthlyPayment: monthly,
      paymentDay: day || 1,
      note,
      ...(useInstallments && totalInstallments > 0
        ? {
            totalInstallments,
            paidInstallments,
            startDate,
            expectedEndDate: format(addMonths(new Date(startDate), totalInstallments), 'yyyy-MM-dd'),
            sourceType,
            sourceCardId: sourceType === 'card' ? sourceCardId || undefined : undefined,
          }
        : {
            totalInstallments: undefined,
            paidInstallments: undefined,
            startDate: undefined,
            expectedEndDate: undefined,
            sourceType: undefined,
            sourceCardId: undefined,
          }),
    }
    if (loan) updateLoan(loan.id, payload)
    else addLoan(payload)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{loan ? 'Sửa khoản vay' : 'Thêm khoản vay'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Tên khoản vay</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: Vay mua xe máy" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Tổng khoản vay</Label>
              <MoneyInput value={total} onChange={setTotal} />
            </div>
            <div>
              <Label>Đã trả</Label>
              <MoneyInput value={paid} onChange={setPaid} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Trả mỗi tháng</Label>
              <MoneyInput value={monthly} onChange={setMonthly} />
            </div>
            <div>
              <Label>Ngày thanh toán</Label>
              <Input type="number" min={1} max={31} {...dayBind} />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setUseInstallments((v) => !v)}
            className="text-left text-sm font-medium text-brand"
          >
            {useInstallments ? '− Ẩn chi tiết trả góp theo kỳ' : '+ Đây là khoản vay trả góp theo kỳ'}
          </button>

          {useInstallments && (
            <div className="space-y-4 rounded-xl bg-surface-2 p-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Tổng số kỳ trả</Label>
                  <Input
                    type="number"
                    min={1}
                    value={totalInstallments || ''}
                    onChange={(e) => setTotalInstallments(Math.max(0, Number(e.target.value) || 0))}
                    placeholder="VD: 12"
                  />
                </div>
                <div>
                  <Label>Đã trả (kỳ)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={paidInstallments || ''}
                    onChange={(e) => setPaidInstallments(Math.max(0, Number(e.target.value) || 0))}
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <Label>Ngày bắt đầu vay</Label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div>
                <Label>Nguồn khoản vay</Label>
                <Select value={sourceType} onValueChange={(v) => setSourceType(v as 'bank' | 'card')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank">Ngân hàng</SelectItem>
                    <SelectItem value="card">Thẻ tín dụng</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {sourceType === 'card' && (
                <div>
                  <Label>Thẻ liên kết</Label>
                  <Select value={sourceCardId} onValueChange={setSourceCardId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn thẻ" />
                    </SelectTrigger>
                    <SelectContent>
                      {data.creditCards.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          <div>
            <Label>Ghi chú</Label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ghi chú (tùy chọn)" />
          </div>
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
