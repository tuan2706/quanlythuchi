import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { MoneyInput } from '@/components/ui/money-input'
import { useFinance } from '@/context/FinanceContext'
import type { CreditCard } from '@/types'

export const CARD_COLOR_OPTIONS = [
  { value: '#3D8BFD', label: 'Xanh dương' },
  { value: '#7C5CFF', label: 'Tím' },
  { value: '#34D399', label: 'Xanh lá' },
  { value: '#FF9F43', label: 'Cam' },
  { value: '#FF5C5C', label: 'Đỏ' },
  { value: '#12131A', label: 'Đen' },
]

export function CardFormDialog({
  open,
  onOpenChange,
  card,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  card?: CreditCard
}) {
  const { addCreditCard, updateCreditCard } = useFinance()
  const [name, setName] = useState('')
  const [bank, setBank] = useState('')
  const [limit, setLimit] = useState(0)
  const [statementDay, setStatementDay] = useState(1)
  const [paymentDay, setPaymentDay] = useState(1)
  const [color, setColor] = useState(CARD_COLOR_OPTIONS[0].value)

  useEffect(() => {
    if (open) {
      setName(card?.name || '')
      setBank(card?.bank || '')
      setLimit(card?.creditLimit || 0)
      setStatementDay(card?.statementDay || 1)
      setPaymentDay(card?.paymentDay || 1)
      setColor(card?.color || CARD_COLOR_OPTIONS[0].value)
    }
  }, [open, card])

  const canSave = name.trim() && bank.trim() && limit > 0

  const handleDayInput = (setter: (n: number) => void) => ({
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value
      if (raw === '') {
        setter(0)
        return
      }
      const n = Number(raw)
      if (!Number.isNaN(n)) setter(Math.min(31, Math.max(0, n)))
    },
  })

  const handleSave = () => {
    if (!canSave) return
    const payload = {
      name: name.trim(),
      bank: bank.trim(),
      creditLimit: limit,
      statementDay: statementDay || 1,
      paymentDay: paymentDay || 1,
      color,
    }
    if (card) updateCreditCard(card.id, payload)
    else addCreditCard(payload)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{card ? 'Sửa thẻ tín dụng' : 'Thêm thẻ tín dụng'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Tên thẻ</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: MB Visa" />
            </div>
            <div>
              <Label>Ngân hàng</Label>
              <Input value={bank} onChange={(e) => setBank(e.target.value)} placeholder="VD: MB Bank" />
            </div>
          </div>
          <div>
            <Label>Hạn mức tín dụng</Label>
            <MoneyInput value={limit} onChange={setLimit} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Ngày sao kê</Label>
              <Input type="number" min={1} max={31} value={statementDay === 0 ? '' : statementDay} {...handleDayInput(setStatementDay)} onBlur={() => setStatementDay((d) => Math.min(31, Math.max(1, d || 1)))} />
            </div>
            <div>
              <Label>Ngày thanh toán</Label>
              <Input type="number" min={1} max={31} value={paymentDay === 0 ? '' : paymentDay} {...handleDayInput(setPaymentDay)} onBlur={() => setPaymentDay((d) => Math.min(31, Math.max(1, d || 1)))} />
            </div>
          </div>
          <div>
            <Label>Màu thẻ</Label>
            <div className="flex flex-wrap gap-2">
              {CARD_COLOR_OPTIONS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className="h-9 w-9 rounded-full ring-2 ring-offset-2 ring-offset-surface transition-all"
                  style={{ backgroundColor: c.value, ['--tw-ring-color' as any]: color === c.value ? c.value : 'transparent' }}
                  aria-label={c.label}
                />
              ))}
            </div>
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
