import { ChevronLeft, ChevronRight } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { Button } from '@/components/ui/button'
import { shiftMonth } from '@/lib/calculations'

const VN_MONTHS = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
]

export function MonthSelector({ month, onChange }: { month: string; onChange: (m: string) => void }) {
  const date = parseISO(month + '-01')
  const label = `${VN_MONTHS[date.getMonth()]} / ${format(date, 'yyyy')}`
  const isCurrentMonth = month === format(new Date(), 'yyyy-MM')

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon" onClick={() => onChange(shiftMonth(month, -1))} aria-label="Tháng trước">
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <div className="min-w-[132px] text-center">
        <p className="font-display text-lg font-semibold text-ink leading-none">{label}</p>
        {isCurrentMonth && <p className="text-[11px] text-brand mt-1">Tháng hiện tại</p>}
      </div>
      <Button variant="outline" size="icon" onClick={() => onChange(shiftMonth(month, 1))} aria-label="Tháng sau">
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
