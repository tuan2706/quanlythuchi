import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { PieChart as PieIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { CATEGORY_PALETTE } from '@/lib/chart-colors'
import { formatMoney } from '@/lib/format'
import type { AppSettings } from '@/types'

interface Item { categoryId: string; name: string; amount: number }

export function CategoryChart({ items, total, settings }: { items: Item[]; total: number; settings: AppSettings }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Chi tiêu theo danh mục</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <EmptyState icon={PieIcon} title="Chưa có chi tiêu" description="Thêm khoản chi trong tháng để xem biểu đồ." />
        ) : (
          <div className="flex flex-col gap-4">
            <div className="h-52 w-full shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={items} dataKey="amount" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={2}>
                    {items.map((_, i) => (
                      <Cell key={i} fill={CATEGORY_PALETTE[i % CATEGORY_PALETTE.length]} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatMoney(v, settings)} contentStyle={{ borderRadius: 12, fontSize: 13 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2 min-w-0">
              {items.slice(0, 8).map((it, i) => (
                <div key={it.categoryId} className="flex items-center justify-between gap-2 text-sm">
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: CATEGORY_PALETTE[i % CATEGORY_PALETTE.length] }}
                    />
                    <span className="truncate text-ink">{it.name}</span>
                  </div>
                  <div className="flex shrink-0 items-center gap-2 tabular">
                    <span className="text-muted text-xs">{total > 0 ? Math.round((it.amount / total) * 100) : 0}%</span>
                    <span className="font-medium text-ink">{formatMoney(it.amount, settings)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
