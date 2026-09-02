import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { MoneyInput } from '@/components/ui/money-input'
import { formatMoney } from '@/lib/format'
import { accountBalance } from '@/lib/account-calculations'
import { useFinance } from '@/context/FinanceContext'
import type { Account, AppData, AppSettings } from '@/types'

export function AdjustBalanceDialog({
  open,
  onOpenChange,
  account,
  data,
  settings,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  account: Account
  data: AppData
  settings: AppSettings
}) {
  const { adjustAccountBalance } = useFinance()
  const currentBalance = accountBalance(data, account.id)
  const [actualBalance, setActualBalance] = useState(currentBalance)
  const [note, setNote] = useState('')

  useEffect(() => {
    if (open) {
      setActualBalance(currentBalance)
      setNote('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const diff = actualBalance - currentBalance

  const handleSave = () => {
    adjustAccountBalance(account.id, actualBalance, note)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Điều chỉnh số dư</DialogTitle>
          <DialogDescription>
            {account.name} — số dư hiện tại trong app: {formatMoney(currentBalance, settings)}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Số dư thực tế</Label>
            <MoneyInput value={actualBalance} onChange={setActualBalance} autoFocus />
          </div>

          {diff !== 0 && (
            <p className={`rounded-xl p-3 text-sm ${diff > 0 ? 'bg-income/15 text-income' : 'bg-expense/15 text-expense'}`}>
              App sẽ tự ghi một khoản {diff > 0 ? 'thu' : 'chi'} chênh lệch{' '}
              <span className="font-semibold tabular">{formatMoney(Math.abs(diff), settings)}</span> để khớp đúng số dư này.
            </p>
          )}

          <div>
            <Label>Ghi chú</Label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="VD: Quên ghi vài khoản chi tiền mặt" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleSave}>Cập nhật số dư</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
