import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { MoneyInput } from '@/components/ui/money-input'
import { formatMoney } from '@/lib/format'
import { cardBalance, todayStr } from '@/lib/creditcard-calculations'
import { useFinance } from '@/context/FinanceContext'
import { useMascotToast } from '@/components/mascot/MascotToast'
import type { AppSettings, CreditCard } from '@/types'

export function PayCardDialog({
  open,
  onOpenChange,
  card,
  settings,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  card: CreditCard
  settings: AppSettings
}) {
  const { data, payCreditCard } = useFinance()
  const { showMascotToast } = useMascotToast()
  const [amount, setAmount] = useState(0)
  const [date, setDate] = useState(todayStr())
  const [note, setNote] = useState('')

  const balance = cardBalance(data, card.id)

  useEffect(() => {
    if (open) {
      setAmount(balance)
      setDate(todayStr())
      setNote('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const canSave = amount > 0

  const handleSave = () => {
    if (!canSave) return
    payCreditCard(card.id, amount, date, note.trim())
    showMascotToast('card_payment_success')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thanh toán {card.name}</DialogTitle>
          <DialogDescription>Dư nợ hiện tại: {formatMoney(balance, settings)}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Số tiền thanh toán</Label>
            <MoneyInput value={amount} onChange={setAmount} autoFocus />
          </div>
          <div>
            <Label>Ngày thanh toán</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <Label>Ghi chú</Label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ghi chú (tùy chọn)" />
          </div>
          <p className="text-xs text-muted">
            Khoản này sẽ tự động được ghi vào Nhật ký như một khoản chi, danh mục "Thanh toán thẻ tín dụng".
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
