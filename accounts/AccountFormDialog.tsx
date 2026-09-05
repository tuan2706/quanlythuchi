import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { MoneyInput } from '@/components/ui/money-input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { useFinance } from '@/context/FinanceContext'
import {
  ACCOUNT_ICON_MAP,
  ACCOUNT_ICON_OPTIONS,
  ACCOUNT_COLOR_OPTIONS,
  ACCOUNT_TYPE_LABELS,
  ACCOUNT_TYPE_DEFAULT_ICON,
} from '@/lib/account-options'
import type { Account, AccountType } from '@/types'
import { cn } from '@/lib/utils'

const TYPE_OPTIONS: AccountType[] = ['cash', 'bank', 'ewallet', 'credit_card', 'other']

export function AccountFormDialog({
  open,
  onOpenChange,
  account,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  account?: Account
}) {
  const { addAccount, updateAccount } = useFinance()
  const [name, setName] = useState('')
  const [type, setType] = useState<AccountType>('cash')
  const [icon, setIcon] = useState<string>('banknote')
  const [color, setColor] = useState(ACCOUNT_COLOR_OPTIONS[0])
  const [initialBalance, setInitialBalance] = useState(0)

  useEffect(() => {
    if (open) {
      setName(account?.name || '')
      setType(account?.type || 'cash')
      setIcon(account?.icon || 'banknote')
      setColor(account?.color || ACCOUNT_COLOR_OPTIONS[0])
      setInitialBalance(account?.initialBalance || 0)
    }
  }, [open, account])

  const canSave = name.trim().length > 0

  const handleSave = () => {
    if (!canSave) return
    const payload = { name: name.trim(), type, icon, color, initialBalance }
    if (account) updateAccount(account.id, payload)
    else addAccount(payload)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{account ? 'Sửa tài khoản' : 'Thêm tài khoản'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Tên tài khoản</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: MB Bank, MoMo, Tiền mặt..." />
          </div>

          <div>
            <Label>Loại tài khoản</Label>
            <Select
              value={type}
              onValueChange={(v) => {
                const t = v as AccountType
                setType(t)
                setIcon(ACCOUNT_TYPE_DEFAULT_ICON[t])
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TYPE_OPTIONS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {ACCOUNT_TYPE_LABELS[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Số dư ban đầu</Label>
            <MoneyInput value={initialBalance} onChange={setInitialBalance} />
          </div>

          <div>
            <Label>Icon</Label>
            <div className="flex flex-wrap gap-2">
              {ACCOUNT_ICON_OPTIONS.map((key) => {
                const Icon = ACCOUNT_ICON_MAP[key]
                const active = icon === key
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setIcon(key)}
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-xl border transition-colors',
                      active ? 'border-transparent text-white' : 'border-border text-muted hover:text-ink',
                    )}
                    style={active ? { backgroundColor: color } : undefined}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <Label>Màu</Label>
            <div className="flex flex-wrap gap-2">
              {ACCOUNT_COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="h-9 w-9 rounded-full ring-2 ring-offset-2 ring-offset-surface"
                  style={{ backgroundColor: c, ['--tw-ring-color' as any]: color === c ? c : 'transparent' }}
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
