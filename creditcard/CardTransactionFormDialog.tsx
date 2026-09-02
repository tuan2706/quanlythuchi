import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { MoneyInput } from '@/components/ui/money-input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { useFinance } from '@/context/FinanceContext'
import type { CardTransaction } from '@/types'

export function CardTransactionFormDialog({
  open,
  onOpenChange,
  day,
  cardId,
  transaction,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  day: string
  cardId: string
  transaction?: CardTransaction
}) {
  const { data, addCardTransaction, updateCardTransaction } = useFinance()
  const [name, setName] = useState('')
  const [amount, setAmount] = useState(0)
  const [categoryId, setCategoryId] = useState('')
  const [note, setNote] = useState('')
  const [selectedCardId, setSelectedCardId] = useState(cardId)

  useEffect(() => {
    if (open) {
      setName(transaction?.name || '')
      setAmount(transaction?.amount || 0)
      setCategoryId(transaction?.categoryId || data.categories[0]?.id || '')
      setNote(transaction?.note || '')
      setSelectedCardId(transaction?.cardId || cardId)
    }
  }, [open, transaction, cardId, data.categories])

  const canSave = name.trim() && amount > 0 && selectedCardId

  const handleSave = () => {
    if (!canSave) return
    const payload = { date: day, name: name.trim(), amount, categoryId, note: note.trim(), cardId: selectedCardId }
    if (transaction) updateCardTransaction(transaction.id, payload)
    else addCardTransaction(payload)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{transaction ? 'Sửa giao dịch thẻ' : 'Thêm giao dịch quẹt thẻ'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Tên giao dịch</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: Mua laptop" />
          </div>
          <div>
            <Label>Số tiền</Label>
            <MoneyInput value={amount} onChange={setAmount} autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Danh mục</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  {data.categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Thẻ sử dụng</Label>
              <Select value={selectedCardId} onValueChange={setSelectedCardId}>
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
          </div>
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
