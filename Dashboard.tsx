import { useState } from 'react'
import { GreetingHeader } from '@/components/dashboard/GreetingHeader'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { SummaryCards } from '@/components/dashboard/SummaryCards'
import { BudgetSection } from '@/components/dashboard/BudgetSection'
import { GoalsSection } from '@/components/dashboard/GoalsSection'
import { RecurringSection } from '@/components/dashboard/RecurringSection'
import { AccountsBalanceSection } from '@/components/dashboard/AccountsBalanceSection'
import { CreditCardSpendCard } from '@/components/dashboard/CreditCardSpendCard'
import { LoanHighlightSection } from '@/components/dashboard/LoanHighlightSection'
import { LoanStatusOverviewSection } from '@/components/dashboard/LoanStatusOverviewSection'
import { SegmentedControl } from '@/components/ui/segmented-control'
import { MonthSelector } from '@/components/shared/MonthSelector'
import { MascotEmptyState } from '@/components/mascot/MascotEmptyState'
import { TransactionFormDialog } from '@/components/diary/TransactionFormDialog'
import { useFinance } from '@/context/FinanceContext'
import { useMonthState } from '@/hooks/useMonthState'
import { transactionsForMonth, transactionsForDay, totalsFor, totalLoanRemaining, netWorth } from '@/lib/calculations'
import { getInsightMessage } from '@/lib/insights'
import { getDashboardMascotContext, isAppEmpty } from '@/lib/mascot-logic'
import { format } from 'date-fns'

export default function Dashboard() {
  const { data } = useFinance()
  const [month, setMonth] = useMonthState()
  const [period, setPeriod] = useState<'day' | 'month'>('month')
  const [hidden, setHidden] = useState(false)
  const [onboardingAddOpen, setOnboardingAddOpen] = useState(false)

  const today = format(new Date(), 'yyyy-MM-dd')
  const periodTxs = period === 'day' ? transactionsForDay(data, today) : transactionsForMonth(data, month)
  const totals = totalsFor(periodTxs)

  const monthTxs = transactionsForMonth(data, month)
  const loanRemaining = totalLoanRemaining(data)
  const worth = netWorth(data, month)
  const expenseThisMonth = monthTxs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  if (isAppEmpty(data)) {
    return (
      <div>
        <MascotEmptyState onAddFirst={() => setOnboardingAddOpen(true)} />
        <TransactionFormDialog open={onboardingAddOpen} onOpenChange={setOnboardingAddOpen} day={today} defaultType="expense" />
      </div>
    )
  }

  return (
    <div>
      <GreetingHeader insight={getInsightMessage(data, month)} mascotContext={getDashboardMascotContext(data, month)} />
      <QuickActions />

      <div className="mb-4 flex flex-col items-center gap-3">
        <SegmentedControl
          value={period}
          onChange={setPeriod}
          options={[
            { value: 'day', label: 'Hôm nay' },
            { value: 'month', label: 'Tháng này' },
          ]}
          className="w-full"
        />
        {period === 'month' && <MonthSelector month={month} onChange={setMonth} />}
      </div>

      <div className="space-y-5">
        <SummaryCards
          income={totals.income}
          expense={totals.expense}
          balance={totals.balance}
          loanRemaining={loanRemaining}
          netWorth={worth}
          settings={data.settings}
          hidden={hidden}
          onToggleHidden={() => setHidden((v) => !v)}
        />

        <CreditCardSpendCard data={data} month={month} settings={data.settings} />
        <AccountsBalanceSection data={data} settings={data.settings} />
        <LoanStatusOverviewSection data={data} />
        <LoanHighlightSection data={data} settings={data.settings} />
        <RecurringSection settings={data.settings} />
        <BudgetSection month={month} spent={expenseThisMonth} settings={data.settings} />
        <GoalsSection settings={data.settings} />
      </div>
    </div>
  )
}
