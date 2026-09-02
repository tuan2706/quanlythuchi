import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { MoneyInput } from '@/components/ui/money-input'
import { useFinance } from '@/context/FinanceContext'
import type { SavingsGoal } from '@/types'

export function GoalFormDialog({
  open,
  onOpenChange,
  goal,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  goal?: SavingsGoal
}) {
  const { addGoal, updateGoal } = useFinance()
  const [name, setName] = useState('')
  const [target, setTarget] = useState(0)
  const [saved, setSaved] = useState(0)
  const [note, setNote] = useState('')

  useEffect(() => {
    if (open) {
      setName(goal?.name || '')
      setTarget(goal?.targetAmount || 0)
      setSaved(goal?.savedAmount || 0)
      setNote(goal?.note || '')
    }
  }, [open, goal])

  const canSave = name.trim().length > 0 && target > 0

  const handleSave = () => {
    if (!canSave) return
    if (goal) {
      updateGoal(goal.id, { name: name.trim(), targetAmount: target, savedAmount: saved, note })
    } else {
      addGoal({ name: name.trim(), targetAmount: target, savedAmount: saved, note })
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{goal ? 'Sửa mục tiêu tiết kiệm' : 'Thêm mục tiêu tiết kiệm'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Tên mục tiêu</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: Du lịch Nhật Bản" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Số tiền mục tiêu</Label>
              <MoneyInput value={target} onChange={setTarget} />
            </div>
            <div>
              <Label>Đã tiết kiệm</Label>
              <MoneyInput value={saved} onChange={setSaved} />
            </div>
          </div>
          <div>
            <Label>Ghi chú (tùy chọn)</Label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ghi chú thêm" />
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
