import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatMoney, formatCompact } from '@/lib/format'
import { CHART_COLORS } from '@/lib/chart-colors'
import { totalSwipedThisMonth, totalPaidThisMonth, cardBalance, cardUtilization, cardMonthlyTrend } from '@/lib/creditcard-calculations'
import type { AppData, AppSettings, CreditCard } from '@/types'

function monthShortLabel(m: string) {
  const [, mm] = m.split('-')
  return `T${parseInt(mm, 10)}`
}

export function CardStatsSection({ data, card, month, settings }: { data: AppData; card: CreditCard; month: string; settings: AppSettings }) {
  const swiped = totalSwipedThisMonth(data, card.id, month)
  const paid = totalPaidThisMonth(data, card.id, month)
  const remaining = cardBalance(data, card.id)
  const utilization = Math.round(cardUtilization(data, card.id, card.creditLimit) * 100)
  const trend = cardMonthlyTrend(data, card.id, month, 6)

  const items = [
    { label: 'Đã quẹt tháng này', value: formatMoney(swiped, settings), tone: 'text-ink' },
    { label: 'Đã thanh toán', value: formatMoney(paid, settings), tone: 'text-income' },
    { label: 'Còn phải thanh toán', value: formatMoney(remaining, settings), tone: remaining > 0 ? 'text-expense' : 'text-income' },
    { label: 'Tỷ lệ dùng hạn mức', value: `${utilization}%`, tone: utilization >= 80 ? 'text-expense' : 'text-brand' },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {items.map((it) => (
          <Card key={it.label}>
            <CardContent className="p-4">
              <p className="text-[12px] text-muted">{it.label}</p>
              <p className={`mt-1 font-display text-lg font-bold tabular truncate ${it.tone}`}>{it.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Chi tiêu theo tháng — {card.name}</CardTitle>
        </CardHeader>
        <CardContent className="pl-1">
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trend} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke={CHART_COLORS.grid} />
                <XAxis dataKey="month" tickFormatter={monthShortLabel} tick={{ fontSize: 12, fill: CHART_COLORS.muted }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(v) => formatCompact(v)} tick={{ fontSize: 12, fill: CHART_COLORS.muted }} axisLine={false} tickLine={false} width={48} />
                <Tooltip
                  formatter={(value: number) => formatMoney(value, settings)}
                  labelFormatter={(l) => monthShortLabel(String(l))}
                  contentStyle={{ borderRadius: 12, border: `1px solid ${CHART_COLORS.grid}`, fontSize: 13 }}
                />
                <Bar dataKey="amount" fill={`${card.color}`} radius={[6, 6, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
