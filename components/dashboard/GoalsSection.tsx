import { useState } from 'react'
import { Target, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { useFinance } from '@/context/FinanceContext'
import type { AppSettings } from '@/types'
import { GoalCard } from './GoalCard'
import { GoalFormDialog } from './GoalFormDialog'

export function GoalsSection({ settings }: { settings: AppSettings }) {
  const { data } = useFinance()
  const [addOpen, setAddOpen] = useState(false)

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-base font-semibold text-ink">Mục tiêu tiết kiệm</h2>
        <Button variant="outline" size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="h-3.5 w-3.5" /> Thêm mục tiêu
        </Button>
      </div>
      {data.goals.length === 0 ? (
        <EmptyState
          icon={Target}
          title="Chưa có mục tiêu nào"
          description="Đặt mục tiêu tiết kiệm để theo dõi tiến độ, ví dụ: du lịch, mua xe, quỹ dự phòng."
          action={
            <Button size="sm" onClick={() => setAddOpen(true)}>
              <Plus className="h-3.5 w-3.5" /> Thêm mục tiêu đầu tiên
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {data.goals.map((g) => (
            <GoalCard key={g.id} goal={g} settings={settings} />
          ))}
        </div>
      )}
      <GoalFormDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  )
}
