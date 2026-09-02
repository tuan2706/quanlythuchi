import { useState } from 'react'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { formatMoney } from '@/lib/format'
import { useFinance } from '@/context/FinanceContext'
import type { AppSettings, SavingsGoal } from '@/types'
import { GoalFormDialog } from './GoalFormDialog'

export function GoalCard({ goal, settings }: { goal: SavingsGoal; settings: AppSettings }) {
  const { deleteGoal, updateGoal } = useFinance()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const pct = goal.targetAmount > 0 ? Math.min(Math.round((goal.savedAmount / goal.targetAmount) * 100), 100) : 0
  const done = pct >= 100

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-medium text-ink truncate">{goal.name}</p>
            {goal.note && <p className="text-xs text-muted truncate">{goal.note}</p>}
          </div>
          <div className="flex shrink-0 gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditOpen(true)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-expense" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <div className="mt-3 flex items-end justify-between">
          <p className="font-display text-lg font-semibold tabular text-ink">{formatMoney(goal.savedAmount, settings)}</p>
          <p className="text-xs text-muted tabular">/ {formatMoney(goal.targetAmount, settings)}</p>
        </div>
        <Progress value={pct} className="mt-2" indicatorClassName={done ? 'bg-income' : 'bg-brand'} />
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-muted">{done ? 'Hoàn thành 🎉' : `${pct}% tiến độ`}</span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => updateGoal(goal.id, { savedAmount: goal.savedAmount + 500000 })}
          >
            <Plus className="h-3.5 w-3.5" /> 500k
          </Button>
        </div>
      </CardContent>

      <GoalFormDialog open={editOpen} onOpenChange={setEditOpen} goal={goal} />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Xóa mục tiêu tiết kiệm?"
        description={`"${goal.name}" sẽ bị xóa vĩnh viễn.`}
        onConfirm={() => deleteGoal(goal.id)}
      />
    </Card>
  )
}
