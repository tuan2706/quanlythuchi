import { useState } from 'react'
import { PiggyBank, Pencil, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { MoneyInput } from '@/components/ui/money-input'
import { formatMoney } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useFinance } from '@/context/FinanceContext'
import type { AppSettings } from '@/types'

export function BudgetSection({ month, spent, settings }: { month: string; spent: number; settings: AppSettings }) {
  const { data, setBudget } = useFinance()
  const budget = data.budgets.find((b) => b.month === month)
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(budget?.amount || 0)

  const amount = budget?.amount || 0
  const pct = amount > 0 ? Math.min(Math.round((spent / amount) * 100), 999) : 0
  const over = amount > 0 && spent > amount
  const remaining = amount - spent

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <PiggyBank className="h-4 w-4 text-brand" />
          <CardTitle>Ngân sách tháng</CardTitle>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setDraft(amount)
            setOpen(true)
          }}
        >
          <Pencil className="h-3.5 w-3.5" /> {amount ? 'Sửa' : 'Đặt ngân sách'}
        </Button>
      </CardHeader>
      <CardContent>
        {amount > 0 ? (
          <div className="space-y-3">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs text-muted">Đã chi</p>
                <p className={cn('font-display text-xl font-semibold tabular', over ? 'text-expense' : 'text-ink')}>
                  {formatMoney(spent, settings)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted">{over ? 'Vượt ngân sách' : 'Còn lại'}</p>
                <p className={cn('font-display text-sm font-medium tabular', over ? 'text-expense' : 'text-income')}>
                  {formatMoney(Math.abs(remaining), settings)}
                </p>
              </div>
            </div>
            <Progress value={Math.min(pct, 100)} indicatorClassName={over ? 'bg-expense' : 'bg-brand'} />
            <div className="flex items-center justify-between text-xs text-muted">
              <span>{pct}% đã sử dụng</span>
              <span>Ngân sách: {formatMoney(amount, settings)}</span>
            </div>
            {over && (
              <div className="flex items-center gap-1.5 rounded-lg bg-expense/10 px-3 py-2 text-xs text-expense">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                Bạn đã chi vượt ngân sách tháng này.
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted">Chưa đặt ngân sách cho tháng này. Nhấn "Đặt ngân sách" để bắt đầu theo dõi.</p>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Đặt ngân sách tháng</DialogTitle>
          </DialogHeader>
          <div>
            <Label>Số tiền ngân sách</Label>
            <MoneyInput value={draft} onChange={setDraft} autoFocus />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button
              onClick={() => {
                setBudget(month, draft)
                setOpen(false)
              }}
            >
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
