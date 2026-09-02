import { parseISO, subMonths, format } from 'date-fns'
import type { AppData, CardTransaction } from '@/types'
import { monthKey } from './calculations'

export function cardTxMonth(t: CardTransaction): string {
  return t.date.slice(0, 7)
}

export function cardTransactionsForCard(data: AppData, cardId: string) {
  return data.cardTransactions.filter((t) => t.cardId === cardId)
}

export function cardTransactionsForMonth(data: AppData, cardId: string, month: string) {
  return cardTransactionsForCard(data, cardId).filter((t) => cardTxMonth(t) === month)
}

export function cardTransactionsForDay(data: AppData, cardId: string, day: string) {
  return cardTransactionsForCard(data, cardId).filter((t) => t.date === day)
}

export function cardPaymentsForCard(data: AppData, cardId: string) {
  return data.cardPayments.filter((p) => p.cardId === cardId)
}

/** Total ever swiped on the card, EXCLUDING swipes already converted into an
 * installment loan — that debt now lives on the Loan instead, so counting it
 * here too would double it up. */
export function totalSwipedAllTime(data: AppData, cardId: string): number {
  return cardTransactionsForCard(data, cardId)
    .filter((t) => !t.convertedToLoanId)
    .reduce((s, t) => s + t.amount, 0)
}

/** Total ever paid off for the card (all-time). */
export function totalPaidAllTime(data: AppData, cardId: string): number {
  return cardPaymentsForCard(data, cardId).reduce((s, p) => s + p.amount, 0)
}

/** Current outstanding balance = all-time swipes - all-time payments (never below 0). */
export function cardBalance(data: AppData, cardId: string): number {
  return Math.max(totalSwipedAllTime(data, cardId) - totalPaidAllTime(data, cardId), 0)
}

export function cardAvailableCredit(data: AppData, cardId: string, creditLimit: number): number {
  return Math.max(creditLimit - cardBalance(data, cardId), 0)
}

export function cardUtilization(data: AppData, cardId: string, creditLimit: number): number {
  if (creditLimit <= 0) return 0
  return Math.min(cardBalance(data, cardId) / creditLimit, 1)
}

export function totalSwipedThisMonth(data: AppData, cardId: string, month: string): number {
  return cardTransactionsForMonth(data, cardId, month).reduce((s, t) => s + t.amount, 0)
}

export function totalPaidThisMonth(data: AppData, cardId: string, month: string): number {
  return cardPaymentsForCard(data, cardId)
    .filter((p) => p.date.slice(0, 7) === month)
    .reduce((s, p) => s + p.amount, 0)
}

/** Last N months of swiped totals for a card, oldest first — for the spending trend chart. */
export function cardMonthlyTrend(data: AppData, cardId: string, month: string, count = 6) {
  const base = parseISO(month + '-01')
  const months: string[] = []
  for (let i = count - 1; i >= 0; i--) {
    months.push(monthKey(subMonths(base, i)))
  }
  return months.map((m) => ({ month: m, amount: totalSwipedThisMonth(data, cardId, m) }))
}

/** Days (0-31) until the next occurrence of a given day-of-month, from today. */
export function daysUntilDayOfMonth(targetDay: number, today: Date = new Date()): number {
  const day = today.getDate()
  if (targetDay >= day) return targetDay - day
  const daysInThisMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  return daysInThisMonth - day + targetDay
}

export function todayStr(): string {
  return format(new Date(), 'yyyy-MM-dd')
}
