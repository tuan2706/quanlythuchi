import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { MoneyInput } from '@/components/ui/money-input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { useFinance } from '@/context/FinanceContext'
import type { RecurringExpense } from '@/types'

export function RecurringFormDialog({
  open,
  onOpenChange,
  item,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  item?: RecurringExpense
}) {
  const { data, addRecurring, updateRecurring } = useFinance()
  const [name, setName] = useState('')
  const [amount, setAmount] = useState(0)
  const [categoryId, setCategoryId] = useState('')
  const [day, setDay] = useState(1)

  useEffect(() => {
    if (open) {
      setName(item?.name || '')
      setAmount(item?.amount || 0)
      setCategoryId(item?.categoryId || data.categories[0]?.id || '')
      setDay(item?.dayOfMonth || 1)
    }
  }, [open, item, data.categories])

  const canSave = name.trim() && amount > 0 && categoryId

  const handleSave = () => {
    if (!canSave) return
    if (item) {
      updateRecurring(item.id, { name: name.trim(), amount, categoryId, dayOfMonth: day })
    } else {
      addRecurring({ name: name.trim(), amount, categoryId, dayOfMonth: day, active: true })
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{item ? 'Sửa khoản chi định kỳ' : 'Thêm khoản chi định kỳ'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Tên khoản chi</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: Tiền nhà, Netflix..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Số tiền / tháng</Label>
              <MoneyInput value={amount} onChange={setAmount} />
            </div>
            <div>
              <Label>Ngày trong tháng</Label>
              <Input
                type="number"
                min={1}
                max={31}
                value={day === 0 ? '' : day}
                onChange={(e) => {
                  const raw = e.target.value
                  if (raw === '') {
                    setDay(0)
                    return
                  }
                  const n = Number(raw)
                  if (!Number.isNaN(n)) setDay(Math.min(31, Math.max(0, n)))
                }}
                onBlur={() => setDay((d) => Math.min(31, Math.max(1, d || 1)))}
              />
            </div>
          </div>
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
