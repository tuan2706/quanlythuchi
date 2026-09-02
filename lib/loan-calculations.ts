import type { AppData, Loan } from '@/types'

export function isInstallmentLoan(loan: Loan): boolean {
  return typeof loan.totalInstallments === 'number' && loan.totalInstallments > 0
}

export function installmentsRemaining(loan: Loan): number {
  if (!isInstallmentLoan(loan)) return 0
  return Math.max((loan.totalInstallments || 0) - (loan.paidInstallments || 0), 0)
}

export function isLoanComplete(loan: Loan): boolean {
  if (isInstallmentLoan(loan)) return installmentsRemaining(loan) <= 0
  return loan.totalAmount - loan.paidAmount <= 0
}

/** All active (not-yet-finished) installment loans. */
export function activeInstallmentLoans(data: AppData): Loan[] {
  return data.loans.filter((l) => isInstallmentLoan(l) && !isLoanComplete(l))
}

/** The installment loan closest to finishing (fewest installments left), for the Dashboard highlight. */
export function nearestCompletionLoan(data: AppData): Loan | undefined {
  const active = activeInstallmentLoans(data)
  if (active.length === 0) return undefined
  return active.slice().sort((a, b) => installmentsRemaining(a) - installmentsRemaining(b))[0]
}

/** Total monthly installment commitment across all active installment loans. */
export function totalMonthlyInstallments(data: AppData): number {
  return activeInstallmentLoans(data).reduce((s, l) => s + l.monthlyPayment, 0)
}

export function loansLinkedToCard(data: AppData, cardId: string): Loan[] {
  return data.loans.filter((l) => l.sourceType === 'card' && l.sourceCardId === cardId)
}

export function loanProgressPct(loan: Loan): number {
  if (isInstallmentLoan(loan)) {
    const total = loan.totalInstallments || 1
    return Math.min(Math.round(((loan.paidInstallments || 0) / total) * 100), 100)
  }
  return loan.totalAmount > 0 ? Math.min(Math.round((loan.paidAmount / loan.totalAmount) * 100), 100) : 0
}
