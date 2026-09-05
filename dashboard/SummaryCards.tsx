import { ArrowDownCircle, ArrowUpCircle, Wallet, Landmark, Gem, Eye, EyeOff } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { formatMoney } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { AppSettings } from '@/types'

interface StatCard {
  label: string
  value: number
  icon: React.ElementType
  tone: 'income' | 'expense' | 'brand' | 'warn' | 'ink'
}

export function SummaryCards({
  income,
  expense,
  balance,
  loanRemaining,
  netWorth,
  settings,
  hidden,
  onToggleHidden,
}: {
  income: number
  expense: number
  balance: number
  loanRemaining: number
  netWorth: number
  settings: AppSettings
  hidden: boolean
  onToggleHidden: () => void
}) {
  const cards: StatCard[] = [
    { label: 'Tổng thu', value: income, icon: ArrowUpCircle, tone: 'income' },
    { label: 'Tổng chi', value: expense, icon: ArrowDownCircle, tone: 'expense' },
    { label: 'Tiền còn lại', value: balance, icon: Wallet, tone: 'brand' },
    { label: 'Khoản vay còn lại', value: loanRemaining, icon: Landmark, tone: 'warn' },
    { label: 'Tài sản ròng', value: netWorth, icon: Gem, tone: 'ink' },
  ]

  const toneText: Record<StatCard['tone'], string> = {
    income: 'text-income',
    expense: 'text-expense',
    brand: 'text-brand',
    warn: 'text-warn',
    ink: 'text-ink',
  }
  const toneBg: Record<StatCard['tone'], string> = {
    income: 'bg-income/15 text-income',
    expense: 'bg-expense/15 text-expense',
    brand: 'bg-brand-light text-brand',
    warn: 'bg-warn/15 text-warn',
    ink: 'bg-surface-2 text-ink',
  }

  return (
    <div>
      <div className="mb-2.5 flex items-center justify-between px-1">
        <p className="text-[13px] font-semibold text-muted">Tổng quan</p>
        <button
          onClick={onToggleHidden}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-2 text-muted hover:text-ink"
          aria-label={hidden ? 'Hiện số tiền' : 'Ẩn số tiền'}
        >
          {hidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {cards.map((c, i) => (
          <Card key={c.label} className={cn('animate-fade-in', i === cards.length - 1 && cards.length % 2 === 1 && 'col-span-2')}>
            <CardContent className={cn('p-4', i === cards.length - 1 && cards.length % 2 === 1 && 'flex items-center justify-between')}>
              <div>
                <div className={cn('mb-3 flex h-9 w-9 items-center justify-center rounded-full', toneBg[c.tone])}>
                  <c.icon className="h-[18px] w-[18px]" />
                </div>
                <p className="text-[12px] text-muted">{c.label}</p>
              </div>
              <p
                className={cn(
                  'mt-1 font-display text-lg font-bold tabular truncate',
                  toneText[c.tone],
                  hidden && 'blur-mask',
                )}
              >
                {hidden ? '••••••••' : formatMoney(c.value, settings)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
