import { useState } from 'react'
import { Pencil, Trash2, Plus, Repeat } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { formatMoney } from '@/lib/format'
import { useFinance } from '@/context/FinanceContext'
import type { AppSettings, RecurringExpense } from '@/types'
import { RecurringFormDialog } from './RecurringFormDialog'

export function RecurringManageDialog({
  open,
  onOpenChange,
  settings,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  settings: AppSettings
}) {
  const { data, deleteRecurring } = useFinance()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<RecurringExpense | undefined>()
  const [deleting, setDeleting] = useState<RecurringExpense | undefined>()

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Khoản chi định kỳ</DialogTitle>
          </DialogHeader>

          <Button
            variant="outline"
            className="w-full mb-3"
            onClick={() => {
              setEditing(undefined)
              setFormOpen(true)
            }}
          >
            <Plus className="h-4 w-4" /> Thêm khoản định kỳ
          </Button>

          {data.recurring.length === 0 ? (
            <EmptyState icon={Repeat} title="Chưa có khoản chi định kỳ" description="Thêm tiền nhà, Internet, Netflix... để đầu tháng tự nhắc xác nhận." />
          ) : (
            <div className="space-y-2">
              {data.recurring.map((r) => {
                const cat = data.categories.find((c) => c.id === r.categoryId)?.name
                return (
                  <div key={r.id} className="flex items-center justify-between rounded-xl border border-border p-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink truncate">{r.name}</p>
                      <p className="text-xs text-muted">
                        {cat} · Ngày {r.dayOfMonth} hàng tháng
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <p className="text-sm font-medium tabular text-ink">{formatMoney(r.amount, settings)}</p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => {
                          setEditing(r)
                          setFormOpen(true)
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-expense" onClick={() => setDeleting(r)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <RecurringFormDialog open={formOpen} onOpenChange={setFormOpen} item={editing} />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(v) => !v && setDeleting(undefined)}
        title="Xóa khoản chi định kỳ?"
        description={`"${deleting?.name}" sẽ không còn được nhắc xác nhận hàng tháng nữa.`}
        onConfirm={() => deleting && deleteRecurring(deleting.id)}
      />
    </>
  )
}
