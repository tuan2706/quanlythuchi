import { useState } from 'react'
import { Plus, Pencil, Trash2, SlidersHorizontal } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Wallet } from 'lucide-react'
import { formatMoney } from '@/lib/format'
import { accountBalance } from '@/lib/account-calculations'
import { ACCOUNT_ICON_MAP, ACCOUNT_TYPE_LABELS } from '@/lib/account-options'
import { useFinance } from '@/context/FinanceContext'
import type { Account, AppSettings } from '@/types'
import { AccountFormDialog } from './AccountFormDialog'
import { AdjustBalanceDialog } from './AdjustBalanceDialog'

export function AccountManagerDialog({
  open,
  onOpenChange,
  settings,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  settings: AppSettings
}) {
  const { data, deleteAccount } = useFinance()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Account | undefined>()
  const [deleting, setDeleting] = useState<Account | undefined>()
  const [adjusting, setAdjusting] = useState<Account | undefined>()

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tài khoản</DialogTitle>
          </DialogHeader>

          <Button
            variant="outline"
            className="mb-3 w-full"
            onClick={() => {
              setEditing(undefined)
              setFormOpen(true)
            }}
          >
            <Plus className="h-4 w-4" /> Thêm tài khoản
          </Button>

          {data.accounts.length === 0 ? (
            <EmptyState icon={Wallet} title="Chưa có tài khoản nào" description="Thêm tài khoản để gắn vào từng khoản thu/chi." />
          ) : (
            <div className="space-y-2">
              {data.accounts.map((a) => {
                const Icon = ACCOUNT_ICON_MAP[a.icon as keyof typeof ACCOUNT_ICON_MAP] || Wallet
                const balance = accountBalance(data, a.id)
                return (
                  <div key={a.id} className="rounded-xl border border-border p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white"
                          style={{ backgroundColor: a.color }}
                        >
                          <Icon className="h-[18px] w-[18px]" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-ink">{a.name}</p>
                          <p className="text-xs text-muted">{ACCOUNT_TYPE_LABELS[a.type]}</p>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <p className="text-sm font-medium tabular text-ink">{formatMoney(balance, settings)}</p>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditing(a)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-expense" onClick={() => setDeleting(a)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    <button
                      onClick={() => setAdjusting(a)}
                      className="mt-2 flex items-center gap-1 text-xs font-medium text-brand"
                    >
                      <SlidersHorizontal className="h-3 w-3" /> Điều chỉnh số dư
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AccountFormDialog
        open={formOpen || !!editing}
        onOpenChange={(v) => {
          if (!v) {
            setFormOpen(false)
            setEditing(undefined)
          }
        }}
        account={editing}
      />
      {adjusting && (
        <AdjustBalanceDialog
          open={!!adjusting}
          onOpenChange={(v) => !v && setAdjusting(undefined)}
          account={adjusting}
          data={data}
          settings={settings}
        />
      )}
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(v) => !v && setDeleting(undefined)}
        title="Xóa tài khoản?"
        description={`"${deleting?.name}" sẽ bị xóa. Các giao dịch đã gắn tài khoản này sẽ không còn tài khoản.`}
        onConfirm={() => deleting && deleteAccount(deleting.id)}
      />
    </>
  )
}
