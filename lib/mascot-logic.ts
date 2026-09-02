import type { AppData } from '@/types'
import { transactionsForDay, transactionsForMonth, totalsFor, budgetForMonth } from './calculations'
import { computeLoanStatus, getDueSoonThreshold } from './loan-status'
import type { MascotContext } from './mascot-messages'

export type MascotExpression = 'happy' | 'calm' | 'excited' | 'concerned' | 'wink'

export const CONTEXT_EXPRESSION: Record<MascotContext, MascotExpression> = {
  greeting_morning: 'happy',
  greeting_afternoon: 'calm',
  greeting_afternoon_late: 'calm',
  greeting_evening: 'calm',
  no_transaction_today: 'calm',
  transaction_saved: 'excited',
  budget_good: 'excited',
  budget_exceeded: 'concerned',
  loan_due_soon: 'concerned',
  loan_generic: 'calm',
  card_payment_due_soon: 'concerned',
  card_limit_high: 'concerned',
  card_payment_success: 'excited',
  card_generic: 'calm',
  loan_near_complete: 'excited',
  loan_overdue: 'concerned',
  installment_upcoming_total: 'calm',
  stats_general: 'calm',
  settings_tip: 'wink',
  onboarding_empty: 'happy',
  idle: 'happy',
}

function timeGreetingContext(): MascotContext {
  const h = new Date().getHours()
  if (h < 11) return 'greeting_morning'
  if (h < 14) return 'greeting_afternoon'
  if (h < 18) return 'greeting_afternoon_late'
  return 'greeting_evening'
}

/** Days (in the 1-31 sense) until a loan's next payment day, always 0-31. */
function daysUntilPaymentDay(paymentDay: number, today: Date): number {
  const day = today.getDate()
  if (paymentDay >= day) return paymentDay - day
  // Wrap to next month
  const daysInThisMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  return daysInThisMonth - day + paymentDay
}

export function hasUpcomingLoanPayment(data: AppData, withinDays = 3): boolean {
  const today = new Date()
  return data.loans.some((l) => {
    if (l.totalAmount - l.paidAmount <= 0) return false
    return daysUntilPaymentDay(l.paymentDay, today) <= withinDays
  })
}

/** Smart context pick for the Dashboard mascot: most actionable/relevant thing first, greeting as fallback. */
export function getDashboardMascotContext(data: AppData, month: string): MascotContext {
  const budget = budgetForMonth(data, month)
  const monthExpense = totalsFor(transactionsForMonth(data, month)).expense

  if (budget && monthExpense > budget.amount) return 'budget_exceeded'
  if (hasUpcomingLoanPayment(data)) return 'loan_due_soon'

  const today = new Date().toISOString().slice(0, 10)
  if (transactionsForDay(data, today).length === 0) return 'no_transaction_today'

  const totals = totalsFor(transactionsForMonth(data, month))
  if (totals.income > 0) {
    const savingsRate = totals.balance / totals.income
    if (savingsRate >= 0.15) return 'budget_good'
  }

  return timeGreetingContext()
}

export function getLoansMascotContext(data: AppData): MascotContext {
  const threshold = getDueSoonThreshold(data)
  const hasOverdue = data.loans.some((l) => computeLoanStatus(l, threshold) === 'overdue')
  if (hasOverdue) return 'loan_overdue'

  const nearComplete = data.loans.some((l) => {
    if (!l.totalInstallments) return false
    const remaining = l.totalInstallments - (l.paidInstallments || 0)
    return remaining > 0 && remaining <= 3
  })
  if (nearComplete) return 'loan_near_complete'
  if (hasUpcomingLoanPayment(data)) return 'loan_due_soon'

  const activeInstallmentCount = data.loans.filter(
    (l) => l.totalInstallments && (l.paidInstallments || 0) < l.totalInstallments,
  ).length
  if (activeInstallmentCount >= 2) return 'installment_upcoming_total'

  return 'loan_generic'
}

export function getCreditCardMascotContext(data: AppData): MascotContext {
  const today = new Date()
  const hasHighUtilization = data.creditCards.some((c) => {
    const balance = data.cardTransactions
      .filter((t) => t.cardId === c.id)
      .reduce((s, t) => s + t.amount, 0) -
      data.cardPayments.filter((p) => p.cardId === c.id).reduce((s, p) => s + p.amount, 0)
    return c.creditLimit > 0 && balance / c.creditLimit >= 0.8
  })
  if (hasHighUtilization) return 'card_limit_high'

  const hasDueSoon = data.creditCards.some((c) => daysUntilPaymentDay(c.paymentDay, today) <= 3)
  if (hasDueSoon) return 'card_payment_due_soon'

  return 'card_generic'
}

export function isAppEmpty(data: AppData): boolean {
  return (
    data.transactions.length === 0 &&
    data.loans.length === 0 &&
    data.goals.length === 0 &&
    data.recurring.length === 0 &&
    data.creditCards.length === 0
  )
}
