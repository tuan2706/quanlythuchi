import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, Tags, X } from 'lucide-react'
import { MonthSelector } from '@/components/shared/MonthSelector'
import { Button } from '@/components/ui/button'
import { FilterPills } from '@/components/ui/filter-pills'
import { Card } from '@/components/ui/card'
import { CalendarGrid } from '@/components/diary/CalendarGrid'
import { DayDetailDialog } from '@/components/diary/DayDetailDialog'
import { SearchPanel } from '@/components/diary/SearchPanel'
import { CategoryManagerDialog } from '@/components/diary/CategoryManagerDialog'
import { useFinance } from '@/context/FinanceContext'
import { useMonthState } from '@/hooks/useMonthState'

export default function Diary() {
  const { data } = useFinance()
  const [month, setMonth] = useMonthState()
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchOpen, setSearchOpen] = useState(false)
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [openDay, setOpenDay] = useState<string | null>(null)

  useEffect(() => {
    if (searchParams.get('search') === '1') {
      setSearchOpen(true)
      searchParams.delete('search')
      setSearchParams(searchParams, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-[13px] text-muted">Nhật ký</p>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink">Lịch giao dịch</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => setCategoryOpen(true)} aria-label="Quản lý danh mục">
            <Tags className="h-4 w-4" />
          </Button>
          <Button variant={searchOpen ? 'default' : 'outline'} size="icon" onClick={() => setSearchOpen((v) => !v)} aria-label="Tìm kiếm">
            {searchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {searchOpen ? (
        <SearchPanel settings={data.settings} onClose={() => setSearchOpen(false)} />
      ) : (
        <>
          <div className="mb-4 flex justify-center">
            <MonthSelector month={month} onChange={setMonth} />
          </div>

          <div className="mb-4">
            <FilterPills
              value={filter}
              onChange={setFilter}
              options={[
                { value: 'all', label: 'Tất cả' },
                { value: 'income', label: 'Khoản thu' },
                { value: 'expense', label: 'Khoản chi' },
              ]}
            />
          </div>

          <Card className="p-4">
            <CalendarGrid month={month} data={data} onSelectDay={setOpenDay} filter={filter} />
          </Card>

          <div className="mt-4 flex items-center justify-center gap-4 text-[11px] text-muted">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-income" /> Thu
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-expense" /> Chi
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-warn" /> Kỳ trả nợ
            </span>
          </div>
        </>
      )}

      {openDay && <DayDetailDialog day={openDay} open={!!openDay} onOpenChange={(v) => !v && setOpenDay(null)} settings={data.settings} />}
      <CategoryManagerDialog open={categoryOpen} onOpenChange={setCategoryOpen} />
    </div>
  )
}
