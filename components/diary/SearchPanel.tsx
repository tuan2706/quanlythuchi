import { useMemo, useState } from 'react'
import { Search, X, ArrowUpCircle, ArrowDownCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { EmptyState } from '@/components/ui/empty-state'
import { formatMoney } from '@/lib/format'
import { useFinance } from '@/context/FinanceContext'
import type { AppSettings } from '@/types'
import { DayDetailDialog } from './DayDetailDialog'

export function SearchPanel({ settings, onClose }: { settings: AppSettings; onClose: () => void }) {
  const { data } = useFinance()
  const [keyword, setKeyword] = useState('')
  const [categoryId, setCategoryId] = useState<string>('all')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [openDay, setOpenDay] = useState<string | null>(null)

  const results = useMemo(() => {
    return data.transactions
      .filter((t) => {
        if (keyword && !t.note.toLowerCase().includes(keyword.toLowerCase())) return false
        if (categoryId !== 'all' && t.categoryId !== categoryId) return false
        if (from && t.date < from) return false
        if (to && t.date > to) return false
        return true
      })
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt)
      .slice(0, 200)
  }, [data.transactions, keyword, categoryId, from, to])

  return (
    <>
      <Card className="p-4 mb-4 animate-fade-in">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm font-medium text-ink">
            <Search className="h-4 w-4" /> Tìm kiếm giao dịch
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Input placeholder="Tìm theo ghi chú..." value={keyword} onChange={(e) => setKeyword(e.target.value)} />
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger>
              <SelectValue placeholder="Tất cả danh mục" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả danh mục</SelectItem>
              {data.categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>

        <div className="mt-4 max-h-80 space-y-1 overflow-y-auto">
          {results.length === 0 ? (
            <EmptyState icon={Search} title="Không tìm thấy giao dịch" description="Thử từ khóa hoặc bộ lọc khác." />
          ) : (
            results.map((t) => {
              const cat = data.categories.find((c) => c.id === t.categoryId)?.name
              const isIncome = t.type === 'income'
              return (
                <button
                  key={t.id}
                  onClick={() => setOpenDay(t.date)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left hover:bg-surface-2"
                >
                  {isIncome ? (
                    <ArrowUpCircle className="h-4 w-4 shrink-0 text-income" />
                  ) : (
                    <ArrowDownCircle className="h-4 w-4 shrink-0 text-expense" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-ink">{t.note || cat || 'Giao dịch'}</p>
                    <p className="text-xs text-muted">
                      {t.date}
                      {cat ? ` · ${cat}` : ''}
                    </p>
                  </div>
                  <p className={`shrink-0 text-sm font-medium tabular ${isIncome ? 'text-income' : 'text-expense'}`}>
                    {isIncome ? '+' : '-'}
                    {formatMoney(t.amount, settings)}
                  </p>
                </button>
              )
            })
          )}
        </div>
      </Card>

      {openDay && <DayDetailDialog day={openDay} open={!!openDay} onOpenChange={(v) => !v && setOpenDay(null)} settings={settings} />}
    </>
  )
}
