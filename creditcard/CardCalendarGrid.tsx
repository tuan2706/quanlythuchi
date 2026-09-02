import { format, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'
import { daysInMonth } from '@/lib/calculations'
import { cardTransactionsForDay } from '@/lib/creditcard-calculations'
import type { AppData } from '@/types'

const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

export function CardCalendarGrid({
  month,
  data,
  cardId,
  cardColor,
  onSelectDay,
}: {
  month: string
  data: AppData
  cardId: string
  cardColor: string
  onSelectDay: (day: string) => void
}) {
  const days = daysInMonth(month)
  const firstDate = parseISO(days[0])
  const leadingBlanks = (firstDate.getDay() + 6) % 7
  const today = format(new Date(), 'yyyy-MM-dd')

  return (
    <div>
      <div className="mb-2 grid grid-cols-7 text-center text-[11px] font-medium text-muted">
        {WEEKDAYS.map((w) => (
          <div key={w}>{w}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1.5">
        {Array.from({ length: leadingBlanks }).map((_, i) => (
          <div key={`blank-${i}`} />
        ))}
        {days.map((day) => {
          const dayNum = parseInt(day.slice(-2), 10)
          const txs = cardTransactionsForDay(data, cardId, day)
          const isToday = day === today
          const isEmpty = txs.length === 0

          return (
            <button
              key={day}
              onClick={() => onSelectDay(day)}
              className="flex flex-col items-center justify-center gap-1 py-1"
            >
              <span
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-semibold transition-colors',
                  isToday ? 'text-white' : 'text-ink hover:bg-surface-2',
                )}
                style={isToday ? { backgroundColor: cardColor } : undefined}
              >
                {dayNum}
              </span>
              <span className="flex h-3 items-center justify-center gap-0.5">
                {isEmpty ? (
                  <span className={cn('text-[11px] leading-none', isToday ? 'text-ink' : 'text-border-strong')}>+</span>
                ) : txs.length > 3 ? (
                  <span className="rounded-full bg-surface-2 px-1.5 text-[9px] font-bold leading-[14px] text-muted">
                    +{txs.length}
                  </span>
                ) : (
                  <span className="flex gap-0.5">
                    {txs.map((t) => (
                      <span key={t.id} className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: cardColor }} />
                    ))}
                  </span>
                )}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
