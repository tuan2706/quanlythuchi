import { format } from 'date-fns'
import type { AppData } from '@/types'
import { transactionsForDay, transactionsForMonth, totalsFor, shiftMonth } from './calculations'

/** Small one-line insight shown as a badge under the dashboard greeting. Pure derived text, no new data. */
export function getInsightMessage(data: AppData, month: string): string {
  const today = format(new Date(), 'yyyy-MM-dd')
  const todayTxs = transactionsForDay(data, today)

  if (todayTxs.length === 0) {
    return 'Hôm nay chưa có giao dịch'
  }

  const thisMonth = totalsFor(transactionsForMonth(data, month))
  const lastMonth = totalsFor(transactionsForMonth(data, shiftMonth(month, -1)))

  if (lastMonth.expense > 0 && thisMonth.expense < lastMonth.expense) {
    const pct = Math.round((1 - thisMonth.expense / lastMonth.expense) * 100)
    return `Chi tiêu ít hơn ${pct}% so với tháng trước`
  }

  if (thisMonth.income > 0) {
    const savingsRate = Math.round((thisMonth.balance / thisMonth.income) * 100)
    if (savingsRate >= 15) return `Đã tiết kiệm ${savingsRate}% tháng này`
  }

  return 'Chúc bạn một ngày quản lý tài chính hiệu quả'
}
