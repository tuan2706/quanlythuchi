import { differenceInCalendarDays, parseISO } from 'date-fns'
import type { AppData, Loan } from '@/types'
import { isInstallmentLoan, isLoanComplete } from './loan-calculations'

export type LoanStatus = 'active' | 'due_soon' | 'overdue' | 'settled' | 'cancelled'

export const LOAN_STATUS_LABELS: Record<LoanStatus, string> = {
  active: 'Đang hoạt động',
  due_soon: 'Sắp đến hạn',
  overdue: 'Quá hạn',
  settled: 'Đã tất toán',
  cancelled: 'Đã hủy',
}

export const DEFAULT_DUE_SOON_THRESHOLD_DAYS = 5

/** The next relevant due date for a loan: its expected end date if set, else derived from paymentDay this/next month. */
function nextDueDate(loan: Loan, today: Date): Date | null {
  if (loan.expectedEndDate) return parseISO(loan.expectedEndDate)
  if (!loan.paymentDay) return null
  const y = today.getFullYear()
  const m = today.getMonth()
  const day = Math.min(loan.paymentDay, new Date(y, m + 1, 0).getDate())
  const thisMonth = new Date(y, m, day)
  if (thisMonth >= new Date(y, today.getMonth(), today.getDate())) return thisMonth
  const nextMonthDay = Math.min(loan.paymentDay, new Date(y, m + 2, 0).getDate())
  return new Date(y, m + 1, nextMonthDay)
}

/**
 * Status is derived on the fly for active/due_soon/overdue/settled — never stored, so it can
 * never go stale. 'cancelled' is the one true manual override (nothing else can derive it).
 */
export function computeLoanStatus(loan: Loan, thresholdDays: number, today: Date = new Date()): LoanStatus {
  if (loan.cancelledAt) return 'cancelled'
  if (loan.settledAt) return 'settled'
  if (isLoanComplete(loan)) return 'settled'

  const due = nextDueDate(loan, today)
  if (due) {
    const daysUntil = differenceInCalendarDays(due, today)
    if (daysUntil < 0) return 'overdue'
    if (daysUntil <= thresholdDays) return 'due_soon'
  }
  return 'active'
}

export function getDueSoonThreshold(data: AppData): number {
  return data.settings.loanDueSoonThresholdDays ?? DEFAULT_DUE_SOON_THRESHOLD_DAYS
}

export function loanStatusCounts(data: AppData): Record<LoanStatus, number> {
  const threshold = getDueSoonThreshold(data)
  const counts: Record<LoanStatus, number> = { active: 0, due_soon: 0, overdue: 0, settled: 0, cancelled: 0 }
  for (const loan of data.loans) {
    counts[computeLoanStatus(loan, threshold)]++
  }
  return counts
}

export function loansWithStatus(data: AppData, status: LoanStatus | 'all'): Loan[] {
  if (status === 'all') return data.loans
  const threshold = getDueSoonThreshold(data)
  return data.loans.filter((l) => computeLoanStatus(l, threshold) === status)
}

/** Re-exported for convenience so status-aware UI doesn't need two separate imports. */
export { isInstallmentLoan }
