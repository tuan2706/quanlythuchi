import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CHART_COLORS } from '@/lib/chart-colors'
import { formatCompact, formatMoney } from '@/lib/format'
import type { AppSettings } from '@/types'

interface Point { month: string; income: number; expense: number; balance: number }

function monthShortLabel(m: string) {
  const [, mm] = m.split('-')
  return `T${parseInt(mm, 10)}`
}

export function BalanceTrendChart({ data, settings }: { data: Point[]; settings: AppSettings }) {
  const withBalance = data.map((d) => ({ ...d, balance: d.income - d.expense }))
  return (
    <Card>
      <CardHeader>
        <CardTitle>Xu hướng số dư</CardTitle>
      </CardHeader>
      <CardContent className="pl-1">
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={withBalance} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke={CHART_COLORS.grid} />
              <XAxis dataKey="month" tickFormatter={monthShortLabel} tick={{ fontSize: 12, fill: CHART_COLORS.muted }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => formatCompact(v)} tick={{ fontSize: 12, fill: CHART_COLORS.muted }} axisLine={false} tickLine={false} width={48} />
              <Tooltip
                formatter={(value: number) => formatMoney(value, settings)}
                labelFormatter={(l) => monthShortLabel(String(l))}
                contentStyle={{ borderRadius: 12, border: `1px solid ${CHART_COLORS.grid}`, fontSize: 13 }}
              />
              <Line type="monotone" dataKey="balance" stroke={CHART_COLORS.brand} strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
