import { format, parseISO, subMonths } from 'date-fns'
import type { AppData, Transaction } from '@/types'

export function monthKey(date: Date): string {
  return format(date, 'yyyy-MM')
}

export function txMonth(t: Transaction): string {
  return t.date.slice(0, 7)
}

export function transactionsForMonth(data: AppData, month: string): Transaction[] {
  return data.transactions.filter((t) => txMonth(t) === month)
}

export function transactionsForDay(data: AppData, day: string): Transaction[] {
  return data.transactions.filter((t) => t.date === day)
}

export interface MonthTotals {
  income: number
  expense: number
  balance: number
}

export function totalsFor(transactions: Transaction[]): MonthTotals {
  let income = 0
  let expense = 0
  for (const t of transactions) {
    if (t.type === 'income') income += t.amount
    else expense += t.amount
  }
  return { income, expense, balance: income - expense }
}

export function totalLoanRemaining(data: AppData): number {
  return data.loans.reduce((sum, l) => sum + Math.max(l.totalAmount - l.paidAmount, 0), 0)
}

export function totalLoanMonthly(data: AppData): number {
  return data.loans.reduce((sum, l) => sum + l.monthlyPayment, 0)
}

export function totalSaved(data: AppData): number {
  return data.goals.reduce((sum, g) => sum + g.savedAmount, 0)
}

/** Net worth = tiền còn lại tháng hiện tại + tổng tiết kiệm - tổng khoản vay còn lại */
export function netWorth(data: AppData, month: string): number {
  const monthBalance = totalsFor(transactionsForMonth(data, month)).balance
  return monthBalance + totalSaved(data) - totalLoanRemaining(data)
}

export function categoryBreakdown(data: AppData, month: string) {
  const txs = transactionsForMonth(data, month).filter((t) => t.type === 'expense')
  const map = new Map<string, number>()
  for (const t of txs) {
    const key = t.categoryId || 'unknown'
    map.set(key, (map.get(key) || 0) + t.amount)
  }
  return Array.from(map.entries())
    .map(([categoryId, amount]) => ({
      categoryId,
      name: data.categories.find((c) => c.id === categoryId)?.name || 'Khác',
      amount,
    }))
    .sort((a, b) => b.amount - a.amount)
}

/** Last N months (including given month) of income/expense totals, oldest first. */
export function trendData(data: AppData, month: string, count = 6) {
  const base = parseISO(month + '-01')
  const months: string[] = []
  for (let i = count - 1; i >= 0; i--) {
    months.push(monthKey(subMonths(base, i)))
  }
  return months.map((m) => {
    const totals = totalsFor(transactionsForMonth(data, m))
    return { month: m, ...totals }
  })
}

export function shiftMonth(month: string, delta: number): string {
  const base = parseISO(month + '-01')
  return monthKey(delta >= 0 ? new Date(base.getFullYear(), base.getMonth() + delta, 1) : subMonths(base, -delta))
}

export function daysInMonth(month: string): string[] {
  const [y, m] = month.split('-').map(Number)
  const count = new Date(y, m, 0).getDate()
  return Array.from({ length: count }, (_, i) => `${month}-${String(i + 1).padStart(2, '0')}`)
}

export function budgetForMonth(data: AppData, month: string) {
  return data.budgets.find((b) => b.month === month)
}
