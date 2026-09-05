import { format, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'
import { daysInMonth, transactionsForDay, totalsFor } from '@/lib/calculations'
import { formatCompact } from '@/lib/format'
import type { AppData } from '@/types'

const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

export function CalendarGrid({
  month,
  data,
  onSelectDay,
  filter,
}: {
  month: string
  data: AppData
  onSelectDay: (day: string) => void
  filter: 'all' | 'income' | 'expense'
}) {
  const days = daysInMonth(month)
  const firstDate = parseISO(days[0])
  // Monday-start offset: 0 for Monday ... 6 for Sunday
  const leadingBlanks = (firstDate.getDay() + 6) % 7
  const loanPaymentDays = new Set(data.loans.map((l) => l.paymentDay))
  const today = format(new Date(), 'yyyy-MM-dd')

  return (
    <div>
      <div className="mb-2 grid grid-cols-7 text-center text-[11px] font-medium text-muted">
        {WEEKDAYS.map((w) => (
          <div key={w}>{w}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: leadingBlanks }).map((_, i) => (
          <div key={`blank-${i}`} />
        ))}
        {days.map((day) => {
          const dayNum = parseInt(day.slice(-2), 10)
          const allTxs = transactionsForDay(data, day)
          const txs = filter === 'all' ? allTxs : allTxs.filter((t) => t.type === filter)
          const totals = totalsFor(txs)
          const hasLoanDue = filter === 'all' && loanPaymentDays.has(dayNum)
          const isToday = day === today
          const hasActivity = txs.length > 0

          // "all" shows the net (thu - chi); a single-type filter shows that type's total.
          const displayValue = filter === 'income' ? totals.income : filter === 'expense' ? -totals.expense : totals.balance
          const tone = displayValue > 0 ? 'text-income' : displayValue < 0 ? 'text-expense' : 'text-muted'

          return (
            <button
              key={day}
              onClick={() => onSelectDay(day)}
              className={cn(
                'relative flex aspect-square flex-col items-center justify-center gap-0.5 rounded-2xl border transition-colors',
                isToday ? 'border-brand bg-brand-light' : 'border-border bg-surface-2 hover:border-border-strong',
              )}
            >
              <span className={cn('text-[10px] font-medium leading-none', isToday ? 'text-brand' : 'text-muted')}>
                {dayNum}
              </span>
              {hasActivity ? (
                <span className={cn('text-[11px] font-bold leading-none tabular', tone)}>
                  {displayValue > 0 ? '+' : ''}
                  {formatCompact(displayValue)}
                </span>
              ) : (
                <span className="text-[10px] leading-none text-border-strong">·</span>
              )}
              {hasLoanDue && <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-warn" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
