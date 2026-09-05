import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { MoneyInput } from '@/components/ui/money-input'
import { Plus, Wallet } from 'lucide-react'
import { useFinance } from '@/context/FinanceContext'
import { useMascotToast } from '@/components/mascot/MascotToast'
import { AccountFormDialog } from '@/components/accounts/AccountFormDialog'
import { ACCOUNT_ICON_MAP } from '@/lib/account-options'
import { getCategoryIcon } from '@/lib/category-icons'
import { cn } from '@/lib/utils'
import type { Transaction, TransactionType } from '@/types'

export function TransactionFormDialog({
  open,
  onOpenChange,
  day,
  transaction,
  defaultType = 'expense',
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  day: string
  transaction?: Transaction
  defaultType?: TransactionType
}) {
  const { data, addTransaction, updateTransaction } = useFinance()
  const { showMascotToast } = useMascotToast()
  const [type, setType] = useState<TransactionType>(defaultType)
  const [amount, setAmount] = useState(0)
  const [categoryId, setCategoryId] = useState('')
  const [accountId, setAccountId] = useState('')
  const [note, setNote] = useState('')
  const [quickAccountOpen, setQuickAccountOpen] = useState(false)

  useEffect(() => {
    if (open) {
      setType(transaction?.type || defaultType)
      setAmount(transaction?.amount || 0)
      setCategoryId(transaction?.categoryId || data.categories[0]?.id || '')
      setAccountId(transaction?.accountId || data.accounts[0]?.id || '')
      setNote(transaction?.note || '')
    }
  }, [open, transaction, defaultType, data.categories, data.accounts])

  const canSave = amount > 0 && (type === 'income' || categoryId) && accountId

  const handleSave = () => {
    if (!canSave) return
    const payload = {
      date: day,
      type,
      amount,
      categoryId: type === 'expense' ? categoryId : undefined,
      accountId,
      note: note.trim(),
    }
    if (transaction) {
      updateTransaction(transaction.id, payload)
    } else {
      addTransaction(payload)
    }
    showMascotToast()
    onOpenChange(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{transaction ? 'Sửa giao dịch' : 'Thêm giao dịch'}</DialogTitle>
          </DialogHeader>

          {!transaction && (
            <Tabs value={type} onValueChange={(v) => setType(v as TransactionType)} className="mb-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="income">Khoản thu</TabsTrigger>
                <TabsTrigger value="expense">Khoản chi</TabsTrigger>
              </TabsList>
            </Tabs>
          )}

          <div className="space-y-5">
            <div>
              <Label>Số tiền</Label>
              <MoneyInput value={amount} onChange={setAmount} autoFocus />
            </div>

            <div>
              <Label>Tài khoản</Label>
              {data.accounts.length === 0 ? (
                <Button variant="outline" className="w-full" onClick={() => setQuickAccountOpen(true)}>
                  <Plus className="h-3.5 w-3.5" /> Tạo tài khoản đầu tiên
                </Button>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {data.accounts.map((a) => {
                    const Icon = ACCOUNT_ICON_MAP[a.icon as keyof typeof ACCOUNT_ICON_MAP] || Wallet
                    const active = accountId === a.id
                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => setAccountId(a.id)}
                        className={cn(
                          'flex flex-col items-center gap-1.5 rounded-2xl border-2 p-2.5 transition-colors',
                          active ? 'border-brand bg-brand-light' : 'border-transparent bg-surface-2 hover:bg-border/30',
                        )}
                      >
                        <span
                          className="flex h-10 w-10 items-center justify-center rounded-full text-white"
                          style={{ backgroundColor: active ? a.color : undefined, opacity: active ? 1 : 0.55 }}
                        >
                          <Icon className="h-[18px] w-[18px]" style={{ color: active ? undefined : a.color }} />
                        </span>
                        <span className={cn('truncate text-[11px] font-medium leading-tight', active ? 'text-brand' : 'text-muted')}>
                          {a.name}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {type === 'expense' && (
              <div>
                <Label>Danh mục</Label>
                <div className="grid grid-cols-4 gap-2">
                  {data.categories.map((c) => {
                    const Icon = getCategoryIcon(c.name)
                    const active = categoryId === c.id
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setCategoryId(c.id)}
                        className={cn(
                          'flex flex-col items-center gap-1.5 rounded-2xl border-2 p-2.5 transition-colors',
                          active ? 'border-brand bg-brand-light' : 'border-transparent bg-surface-2 hover:bg-border/30',
                        )}
                      >
                        <span
                          className={cn(
                            'flex h-10 w-10 items-center justify-center rounded-full',
                            active ? 'bg-brand text-white' : 'bg-surface text-muted',
                          )}
                        >
                          <Icon className="h-[18px] w-[18px]" />
                        </span>
                        <span className={cn('truncate text-[11px] font-medium leading-tight', active ? 'text-brand' : 'text-muted')}>
                          {c.name}
                        </span>
                      </button>
                    )
                  })}
                </div>
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

      <AccountFormDialog open={quickAccountOpen} onOpenChange={setQuickAccountOpen} />
    </>
  )
}
