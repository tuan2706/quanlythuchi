import { Repeat } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { MonthSelector } from '@/components/shared/MonthSelector'
import { StatsSummary } from '@/components/stats/StatsSummary'
import { TrendChart } from '@/components/stats/TrendChart'
import { BalanceTrendChart } from '@/components/stats/BalanceTrendChart'
import { CategoryChart } from '@/components/stats/CategoryChart'
import { Card, CardContent } from '@/components/ui/card'
import { MascotMessage } from '@/components/mascot/MascotMessage'
import { useFinance } from '@/context/FinanceContext'
import { useMonthState } from '@/hooks/useMonthState'
import { transactionsForMonth, totalsFor, trendData, categoryBreakdown } from '@/lib/calculations'
import { activeInstallmentLoans, totalMonthlyInstallments } from '@/lib/loan-calculations'
import { formatMoney } from '@/lib/format'

export default function Stats() {
  const { data } = useFinance()
  const [month, setMonth] = useMonthState()

  const totals = totalsFor(transactionsForMonth(data, month))
  const trend = trendData(data, month, 6)
  const categories = categoryBreakdown(data, month)
  const activeInstallments = activeInstallmentLoans(data)
  const monthlyInstallmentTotal = totalMonthlyInstallments(data)

  return (
    <div className="space-y-6">
      <PageHeader title="Thống kê" description="Phân tích thu chi theo thời gian" action={<MonthSelector month={month} onChange={setMonth} />} />

      <MascotMessage context="stats_general" size={44} />

      <StatsSummary income={totals.income} expense={totals.expense} balance={totals.balance} settings={data.settings} />

      {activeInstallments.length > 0 && (
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-light text-brand">
              <Repeat className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-xs text-muted">Tổng tiền trả góp mỗi tháng ({activeInstallments.length} khoản)</p>
              <p className="font-display text-lg font-bold tabular text-ink">{formatMoney(monthlyInstallmentTotal, data.settings)}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <TrendChart data={trend} settings={data.settings} />

      <div className="grid grid-cols-1 gap-4">
        <BalanceTrendChart data={trend} settings={data.settings} />
        <CategoryChart items={categories} total={totals.expense} settings={data.settings} />
      </div>
    </div>
  )
}
