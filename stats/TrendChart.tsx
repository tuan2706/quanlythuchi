import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CHART_COLORS } from '@/lib/chart-colors'
import { formatCompact, formatMoney } from '@/lib/format'
import type { AppSettings } from '@/types'

interface Point { month: string; income: number; expense: number }

function monthShortLabel(m: string) {
  const [, mm] = m.split('-')
  return `T${parseInt(mm, 10)}`
}

export function TrendChart({ data, settings }: { data: Point[]; settings: AppSettings }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Thu chi theo tháng</CardTitle>
      </CardHeader>
      <CardContent className="pl-1">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke={CHART_COLORS.grid} />
              <XAxis dataKey="month" tickFormatter={monthShortLabel} tick={{ fontSize: 12, fill: CHART_COLORS.muted }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => formatCompact(v)} tick={{ fontSize: 12, fill: CHART_COLORS.muted }} axisLine={false} tickLine={false} width={48} />
              <Tooltip
                formatter={(value: number) => formatMoney(value, settings)}
                labelFormatter={(l) => monthShortLabel(String(l))}
                contentStyle={{ borderRadius: 12, border: `1px solid ${CHART_COLORS.grid}`, fontSize: 13 }}
              />
              <Legend
                formatter={(v) => (v === 'income' ? 'Thu' : 'Chi')}
                wrapperStyle={{ fontSize: 12 }}
              />
              <Bar dataKey="income" name="income" fill={CHART_COLORS.income} radius={[6, 6, 0, 0]} maxBarSize={28} />
              <Bar dataKey="expense" name="expense" fill={CHART_COLORS.expense} radius={[6, 6, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
