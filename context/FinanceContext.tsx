import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type {
  AppData,
  Transaction,
  Category,
  Account,
  Loan,
  LoanPaymentRecord,
  PaymentMethod,
  Budget,
  SavingsGoal,
  RecurringExpense,
  AppSettings,
  CreditCard,
  CardTransaction,
} from '@/types'
import { loadAppData, saveAppData, clearAppData } from '@/lib/storage'
import { uid } from '@/lib/utils'
import { accountBalance } from '@/lib/account-calculations'
import { LoadingSplash } from '@/components/shared/LoadingSplash'
import { addMonths, format } from 'date-fns'

const CARD_PAYMENT_CATEGORY_NAME = 'Thanh toán thẻ tín dụng'
const LOAN_INSTALLMENT_CATEGORY_NAME = 'Trả góp vay'
const LOAN_PAYMENT_CATEGORY_NAME = 'Trả nợ vay'
const LOAN_RECEIVE_CATEGORY_NAME = 'Thu nợ cho vay'
const LOAN_FEE_CATEGORY_NAME = 'Phí tất toán khoản vay'
const BALANCE_ADJUSTMENT_CATEGORY_NAME = 'Điều chỉnh số dư'

function ensureCategory(categories: Category[], name: string): [Category[], string] {
  const existing = categories.find((c) => c.name === name)?.id
  if (existing) return [categories, existing]
  const id = uid()
  return [[...categories, { id, name, isDefault: false }], id]
}

interface FinanceContextValue {
  data: AppData

  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void
  updateTransaction: (id: string, patch: Partial<Transaction>) => void
  deleteTransaction: (id: string) => void
  importTransactions: (txs: Transaction[]) => void

  addCategory: (name: string) => Category
  updateCategory: (id: string, name: string) => void
  deleteCategory: (id: string) => void

  addAccount: (account: Omit<Account, 'id' | 'createdAt'>) => void
  updateAccount: (id: string, patch: Partial<Account>) => void
  /** Reconciles an account's balance to a user-specified actual amount by recording the difference as a real Transaction. */
  adjustAccountBalance: (accountId: string, actualBalance: number, note?: string) => void
  deleteAccount: (id: string) => void

  addLoan: (loan: Omit<Loan, 'id' | 'createdAt'>) => void
  updateLoan: (id: string, patch: Partial<Loan>) => void
  deleteLoan: (id: string) => void

  /** Pays the next installment on an installment-style loan: updates progress, deducts from the
   * chosen account via a real linked Transaction, and records it in the payment ledger. */
  payLoanInstallment: (
    loanId: string,
    details: { date: string; amount: number; method: PaymentMethod; accountId?: string; note: string },
  ) => void

  /** Full creation path used by the Loan Wizard: creates the loan and optionally adjusts an account's balance via a real Transaction. */
  createLoanFromWizard: (
    loan: Omit<Loan, 'id' | 'createdAt'>,
    fund?: { accountId: string; direction: 'add' | 'subtract' },
  ) => void

  /** Records a detailed payment against a loan (principal/interest/fee breakdown) and keeps loan totals + a linked Transaction in sync. */
  addLoanPayment: (payment: Omit<LoanPaymentRecord, 'id' | 'createdAt' | 'totalPaid' | 'linkedTransactionId'>) => void
  updateLoanPayment: (id: string, patch: Partial<Omit<LoanPaymentRecord, 'id' | 'loanId' | 'createdAt'>>) => void
  deleteLoanPayment: (id: string) => void

  settleLoan: (loanId: string, date: string, earlySettlementFee?: number) => void
  cancelLoan: (loanId: string) => void
  reactivateLoan: (loanId: string) => void

  setBudget: (month: string, amount: number) => void

  addGoal: (goal: Omit<SavingsGoal, 'id' | 'createdAt'>) => void
  updateGoal: (id: string, patch: Partial<SavingsGoal>) => void
  deleteGoal: (id: string) => void

  addRecurring: (r: Omit<RecurringExpense, 'id'>) => void
  updateRecurring: (id: string, patch: Partial<RecurringExpense>) => void
  deleteRecurring: (id: string) => void
  confirmRecurring: (recurringId: string, month: string) => void
  skipRecurring: (recurringId: string, month: string) => void

  updateSettings: (patch: Partial<AppSettings>) => void

  addCreditCard: (card: Omit<CreditCard, 'id' | 'createdAt'>) => void
  updateCreditCard: (id: string, patch: Partial<CreditCard>) => void
  deleteCreditCard: (id: string) => void

  addCardTransaction: (tx: Omit<CardTransaction, 'id' | 'createdAt'>) => void
  updateCardTransaction: (id: string, patch: Partial<CardTransaction>) => void
  deleteCardTransaction: (id: string) => void

  /** Pays down a card's balance AND records a real expense Transaction in the Diary, so reports stay accurate. */
  payCreditCard: (cardId: string, amount: number, date: string, note: string) => void

  /** Converts a card swipe into a fixed-installment Loan linked back to that card ("chuyển đổi trả góp"). */
  convertCardTransactionToLoan: (cardTransactionId: string, installments: number) => void

  replaceAll: (data: AppData) => void
  resetAll: () => void
}

const FinanceContext = createContext<FinanceContextValue | null>(null)

export function FinanceProvider({ children }: { children: ReactNode }) {
  // null while the initial IndexedDB read is in flight.
  const [data, setData] = useState<AppData | null>(null)

  useEffect(() => {
    let cancelled = false
    loadAppData().then((loaded) => {
      if (!cancelled) setData(loaded)
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (data) saveAppData(data)
  }, [data])

  useEffect(() => {
    const root = document.documentElement
    if (data?.settings.theme === 'light') root.classList.add('light')
    else root.classList.remove('light')
  }, [data?.settings.theme])

  // Small helper so every CRUD action below doesn't need to repeat the
  // "data might still be null while loading" guard.
  const update = (fn: (d: AppData) => AppData) => setData((d) => (d ? fn(d) : d))

  const value = useMemo<FinanceContextValue | null>(() => {
    if (!data) return null
    return {
      data,

      addTransaction: (tx) =>
        update((d) => ({
          ...d,
          transactions: [...d.transactions, { ...tx, id: uid(), createdAt: Date.now() }],
        })),
      updateTransaction: (id, patch) =>
        update((d) => ({
          ...d,
          transactions: d.transactions.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),
      deleteTransaction: (id) => update((d) => ({ ...d, transactions: d.transactions.filter((t) => t.id !== id) })),
      importTransactions: (txs) => update((d) => ({ ...d, transactions: [...d.transactions, ...txs] })),

      addCategory: (name) => {
        const cat: Category = { id: uid(), name, isDefault: false }
        update((d) => ({ ...d, categories: [...d.categories, cat] }))
        return cat
      },
      updateCategory: (id, name) =>
        update((d) => ({ ...d, categories: d.categories.map((c) => (c.id === id ? { ...c, name } : c)) })),
      deleteCategory: (id) => update((d) => ({ ...d, categories: d.categories.filter((c) => c.id !== id) })),

      addAccount: (account) =>
        update((d) => ({ ...d, accounts: [...d.accounts, { ...account, id: uid(), createdAt: Date.now() }] })),
      updateAccount: (id, patch) =>
        update((d) => ({ ...d, accounts: d.accounts.map((a) => (a.id === id ? { ...a, ...patch } : a)) })),
      // Deleting an account just leaves its past transactions with a dangling
      // accountId (shown as "no account"), mirroring how deleting a category
      // already behaves in this app — nothing else is touched.
      deleteAccount: (id) => update((d) => ({ ...d, accounts: d.accounts.filter((a) => a.id !== id) })),

      adjustAccountBalance: (accountId, actualBalance, note) =>
        update((d) => {
          const account = d.accounts.find((a) => a.id === accountId)
          if (!account) return d

          const currentBalance = accountBalance(d, accountId)
          const diff = actualBalance - currentBalance
          if (Math.abs(diff) < 1) return d // already matches, nothing to record

          const [categories, categoryId] = ensureCategory(d.categories, BALANCE_ADJUSTMENT_CATEGORY_NAME)
          const tx: Transaction = {
            id: uid(),
            date: format(new Date(), 'yyyy-MM-dd'),
            type: diff > 0 ? 'income' : 'expense',
            amount: Math.abs(diff),
            categoryId: diff > 0 ? undefined : categoryId,
            accountId,
            note: note?.trim() ? `Điều chỉnh số dư - ${note.trim()}` : 'Điều chỉnh số dư',
            createdAt: Date.now(),
          }

          return { ...d, categories, transactions: [...d.transactions, tx] }
        }),

      addLoan: (loan) => update((d) => ({ ...d, loans: [...d.loans, { ...loan, id: uid(), createdAt: Date.now() }] })),
      updateLoan: (id, patch) =>
        update((d) => ({ ...d, loans: d.loans.map((l) => (l.id === id ? { ...l, ...patch } : l)) })),
      deleteLoan: (id) => update((d) => ({ ...d, loans: d.loans.filter((l) => l.id !== id) })),

      payLoanInstallment: (loanId, details) =>
        update((d) => {
          const loan = d.loans.find((l) => l.id === loanId)
          if (!loan || !loan.totalInstallments) return d
          const remaining = loan.totalInstallments - (loan.paidInstallments || 0)
          if (remaining <= 0 || details.amount <= 0) return d

          let categories = d.categories
          let categoryId = categories.find((c) => c.name === LOAN_INSTALLMENT_CATEGORY_NAME)?.id
          if (!categoryId) {
            categoryId = uid()
            categories = [...categories, { id: categoryId, name: LOAN_INSTALLMENT_CATEGORY_NAME, isDefault: false }]
          }

          const nextInstallment = (loan.paidInstallments || 0) + 1
          const baseNote = `Trả góp kỳ ${nextInstallment}/${loan.totalInstallments} - ${loan.name}`
          const linkedTransactionId = uid()
          const transaction: Transaction = {
            id: linkedTransactionId,
            date: details.date,
            type: 'expense',
            amount: details.amount,
            categoryId,
            accountId: details.accountId,
            note: details.note ? `${baseNote} - ${details.note}` : baseNote,
            createdAt: Date.now(),
          }

          const paymentRecord: LoanPaymentRecord = {
            id: uid(),
            loanId,
            date: details.date,
            principalPaid: details.amount,
            interestPaid: 0,
            feePaid: 0,
            totalPaid: details.amount,
            method: details.method,
            accountId: details.accountId,
            note: details.note,
            linkedTransactionId,
            createdAt: Date.now(),
          }

          return {
            ...d,
            categories,
            transactions: [...d.transactions, transaction],
            loanPayments: [...d.loanPayments, paymentRecord],
            loans: d.loans.map((l) =>
              l.id === loanId
                ? { ...l, paidInstallments: nextInstallment, paidAmount: l.paidAmount + details.amount }
                : l,
            ),
          }
        }),

      createLoanFromWizard: (loan, fund) =>
        update((d) => {
          const newLoan: Loan = { ...loan, id: uid(), createdAt: Date.now() }
          let next: AppData = { ...d, loans: [...d.loans, newLoan] }

          if (fund && fund.accountId) {
            const account = d.accounts.find((a) => a.id === fund.accountId)
            if (account) {
              const isIncome = fund.direction === 'add'
              const [categories, categoryId] = ensureCategory(
                next.categories,
                isIncome ? LOAN_RECEIVE_CATEGORY_NAME : LOAN_PAYMENT_CATEGORY_NAME,
              )
              const tx: Transaction = {
                id: uid(),
                date: format(new Date(), 'yyyy-MM-dd'),
                type: isIncome ? 'income' : 'expense',
                amount: newLoan.principal || newLoan.totalAmount,
                categoryId: isIncome ? undefined : categoryId,
                accountId: fund.accountId,
                note: `${isIncome ? 'Nhận tiền' : 'Giải ngân'} — ${newLoan.name}`,
                createdAt: Date.now(),
              }
              next = { ...next, categories, transactions: [...next.transactions, tx] }
            }
          }
          return next
        }),

      addLoanPayment: (payment) =>
        update((d) => {
          const loan = d.loans.find((l) => l.id === payment.loanId)
          if (!loan) return d
          const totalPaid = payment.principalPaid + payment.interestPaid + payment.feePaid
          if (totalPaid <= 0) return d

          const isReceiving = loan.category === 'lent'
          const [categories, categoryId] = ensureCategory(
            d.categories,
            isReceiving ? LOAN_RECEIVE_CATEGORY_NAME : LOAN_PAYMENT_CATEGORY_NAME,
          )
          const linkedTransactionId = uid()
          const tx: Transaction = {
            id: linkedTransactionId,
            date: payment.date,
            type: isReceiving ? 'income' : 'expense',
            amount: totalPaid,
            categoryId: isReceiving ? undefined : categoryId,
            accountId: payment.accountId,
            note: payment.note ? `${loan.name} - ${payment.note}` : loan.name,
            createdAt: Date.now(),
          }

          const record: LoanPaymentRecord = { ...payment, id: uid(), totalPaid, linkedTransactionId, createdAt: Date.now() }

          return {
            ...d,
            categories,
            transactions: [...d.transactions, tx],
            loanPayments: [...d.loanPayments, record],
            loans: d.loans.map((l) =>
              l.id === payment.loanId
                ? {
                    ...l,
                    paidAmount: l.paidAmount + totalPaid,
                    totalPrincipalPaid: (l.totalPrincipalPaid || 0) + payment.principalPaid,
                    totalInterestPaid: (l.totalInterestPaid || 0) + payment.interestPaid,
                    totalFeesPaid: (l.totalFeesPaid || 0) + payment.feePaid,
                  }
                : l,
            ),
          }
        }),

      updateLoanPayment: (id, patch) =>
        update((d) => {
          const old = d.loanPayments.find((p) => p.id === id)
          if (!old) return d
          const merged = { ...old, ...patch }
          const newTotal = merged.principalPaid + merged.interestPaid + merged.feePaid
          const deltaPrincipal = merged.principalPaid - old.principalPaid
          const deltaInterest = merged.interestPaid - old.interestPaid
          const deltaFee = merged.feePaid - old.feePaid
          const deltaTotal = newTotal - old.totalPaid

          return {
            ...d,
            loanPayments: d.loanPayments.map((p) => (p.id === id ? { ...merged, totalPaid: newTotal } : p)),
            transactions: d.transactions.map((t) =>
              t.id === old.linkedTransactionId ? { ...t, amount: newTotal, date: merged.date } : t,
            ),
            loans: d.loans.map((l) =>
              l.id === old.loanId
                ? {
                    ...l,
                    paidAmount: l.paidAmount + deltaTotal,
                    totalPrincipalPaid: (l.totalPrincipalPaid || 0) + deltaPrincipal,
                    totalInterestPaid: (l.totalInterestPaid || 0) + deltaInterest,
                    totalFeesPaid: (l.totalFeesPaid || 0) + deltaFee,
                  }
                : l,
            ),
          }
        }),

      deleteLoanPayment: (id) =>
        update((d) => {
          const record = d.loanPayments.find((p) => p.id === id)
          if (!record) return d
          return {
            ...d,
            loanPayments: d.loanPayments.filter((p) => p.id !== id),
            transactions: d.transactions.filter((t) => t.id !== record.linkedTransactionId),
            loans: d.loans.map((l) =>
              l.id === record.loanId
                ? {
                    ...l,
                    paidAmount: Math.max(l.paidAmount - record.totalPaid, 0),
                    totalPrincipalPaid: Math.max((l.totalPrincipalPaid || 0) - record.principalPaid, 0),
                    totalInterestPaid: Math.max((l.totalInterestPaid || 0) - record.interestPaid, 0),
                    totalFeesPaid: Math.max((l.totalFeesPaid || 0) - record.feePaid, 0),
                  }
                : l,
            ),
          }
        }),

      settleLoan: (loanId, date, earlySettlementFee = 0) =>
        update((d) => {
          const loan = d.loans.find((l) => l.id === loanId)
          if (!loan) return d
          let next: AppData = {
            ...d,
            loans: d.loans.map((l) =>
              l.id === loanId
                ? {
                    ...l,
                    settledAt: date,
                    cancelledAt: undefined,
                    earlySettlementFee: earlySettlementFee || undefined,
                    totalFeesPaid: (l.totalFeesPaid || 0) + earlySettlementFee,
                  }
                : l,
            ),
          }
          if (earlySettlementFee > 0) {
            const [categories, categoryId] = ensureCategory(next.categories, LOAN_FEE_CATEGORY_NAME)
            const tx: Transaction = {
              id: uid(),
              date,
              type: 'expense',
              amount: earlySettlementFee,
              categoryId,
              note: `Phí tất toán trước hạn - ${loan.name}`,
              createdAt: Date.now(),
            }
            next = { ...next, categories, transactions: [...next.transactions, tx] }
          }
          return next
        }),

      cancelLoan: (loanId) =>
        update((d) => ({
          ...d,
          loans: d.loans.map((l) => (l.id === loanId ? { ...l, cancelledAt: format(new Date(), 'yyyy-MM-dd') } : l)),
        })),

      reactivateLoan: (loanId) =>
        update((d) => ({
          ...d,
          loans: d.loans.map((l) => (l.id === loanId ? { ...l, cancelledAt: undefined, settledAt: undefined } : l)),
        })),

      setBudget: (month, amount) =>
        update((d) => {
          const exists = d.budgets.find((b) => b.month === month)
          if (exists) {
            return { ...d, budgets: d.budgets.map((b) => (b.month === month ? { ...b, amount } : b)) }
          }
          return { ...d, budgets: [...d.budgets, { id: uid(), month, amount }] }
        }),

      addGoal: (goal) => update((d) => ({ ...d, goals: [...d.goals, { ...goal, id: uid(), createdAt: Date.now() }] })),
      updateGoal: (id, patch) =>
        update((d) => ({ ...d, goals: d.goals.map((g) => (g.id === id ? { ...g, ...patch } : g)) })),
      deleteGoal: (id) => update((d) => ({ ...d, goals: d.goals.filter((g) => g.id !== id) })),

      addRecurring: (r) => update((d) => ({ ...d, recurring: [...d.recurring, { ...r, id: uid() }] })),
      updateRecurring: (id, patch) =>
        update((d) => ({ ...d, recurring: d.recurring.map((r) => (r.id === id ? { ...r, ...patch } : r)) })),
      deleteRecurring: (id) => update((d) => ({ ...d, recurring: d.recurring.filter((r) => r.id !== id) })),

      confirmRecurring: (recurringId, month) =>
        update((d) => {
          const r = d.recurring.find((x) => x.id === recurringId)
          if (!r) return d
          const day = String(r.dayOfMonth).padStart(2, '0')
          const tx: Transaction = {
            id: uid(),
            date: `${month}-${day}`,
            type: 'expense',
            amount: r.amount,
            categoryId: r.categoryId,
            note: r.name,
            recurringId: r.id,
            createdAt: Date.now(),
          }
          return {
            ...d,
            transactions: [...d.transactions, tx],
            confirmedRecurringStamps: [...d.confirmedRecurringStamps, `${recurringId}:${month}`],
          }
        }),
      skipRecurring: (recurringId, month) =>
        update((d) => ({
          ...d,
          confirmedRecurringStamps: [...d.confirmedRecurringStamps, `${recurringId}:${month}`],
        })),

      updateSettings: (patch) => update((d) => ({ ...d, settings: { ...d.settings, ...patch } })),

      addCreditCard: (card) =>
        update((d) => ({ ...d, creditCards: [...d.creditCards, { ...card, id: uid(), createdAt: Date.now() }] })),
      updateCreditCard: (id, patch) =>
        update((d) => ({ ...d, creditCards: d.creditCards.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),
      deleteCreditCard: (id) =>
        update((d) => ({
          ...d,
          creditCards: d.creditCards.filter((c) => c.id !== id),
          // Cascade-remove this card's swipe/payment bookkeeping. The real expense
          // Transactions already created by past payments are left untouched —
          // that money already left your pocket, deleting the card shouldn't erase it.
          cardTransactions: d.cardTransactions.filter((t) => t.cardId !== id),
          cardPayments: d.cardPayments.filter((p) => p.cardId !== id),
        })),

      addCardTransaction: (tx) =>
        update((d) => ({
          ...d,
          cardTransactions: [...d.cardTransactions, { ...tx, id: uid(), createdAt: Date.now() }],
        })),
      updateCardTransaction: (id, patch) =>
        update((d) => ({
          ...d,
          cardTransactions: d.cardTransactions.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),
      deleteCardTransaction: (id) =>
        update((d) => ({ ...d, cardTransactions: d.cardTransactions.filter((t) => t.id !== id) })),

      payCreditCard: (cardId, amount, date, note) =>
        update((d) => {
          const card = d.creditCards.find((c) => c.id === cardId)
          if (!card || amount <= 0) return d

          // Reuse the existing "Thanh toán thẻ tín dụng" category if present,
          // otherwise create it once — never duplicates on repeat payments.
          let categories = d.categories
          let categoryId = categories.find((c) => c.name === CARD_PAYMENT_CATEGORY_NAME)?.id
          if (!categoryId) {
            categoryId = uid()
            categories = [...categories, { id: categoryId, name: CARD_PAYMENT_CATEGORY_NAME, isDefault: false }]
          }

          const linkedTransactionId = uid()
          const transaction: Transaction = {
            id: linkedTransactionId,
            date,
            type: 'expense',
            amount,
            categoryId,
            note: note ? `Thanh toán ${card.name} - ${note}` : `Thanh toán ${card.name}`,
            createdAt: Date.now(),
          }

          return {
            ...d,
            categories,
            transactions: [...d.transactions, transaction],
            cardPayments: [
              ...d.cardPayments,
              { id: uid(), cardId, amount, date, note, linkedTransactionId, createdAt: Date.now() },
            ],
          }
        }),

      convertCardTransactionToLoan: (cardTransactionId, installments) =>
        update((d) => {
          const tx = d.cardTransactions.find((t) => t.id === cardTransactionId)
          if (!tx || tx.convertedToLoanId || installments <= 0) return d
          const card = d.creditCards.find((c) => c.id === tx.cardId)

          const loanId = uid()
          const startDate = format(new Date(), 'yyyy-MM-dd')
          const expectedEndDate = format(addMonths(new Date(), installments), 'yyyy-MM-dd')
          const monthlyPayment = Math.round(tx.amount / installments)

          const newLoan: Loan = {
            id: loanId,
            name: tx.name,
            totalAmount: tx.amount,
            paidAmount: 0,
            monthlyPayment,
            paymentDay: card?.paymentDay || 1,
            note: card ? `Chuyển đổi trả góp từ ${card.name}` : 'Chuyển đổi trả góp từ thẻ tín dụng',
            createdAt: Date.now(),
            totalInstallments: installments,
            paidInstallments: 0,
            startDate,
            expectedEndDate,
            sourceType: 'card',
            sourceCardId: tx.cardId,
          }

          return {
            ...d,
            loans: [...d.loans, newLoan],
            // Flag the swipe as converted so it's excluded from the card's
            // revolving balance from now on — its debt lives on the Loan instead.
            cardTransactions: d.cardTransactions.map((t) =>
              t.id === cardTransactionId ? { ...t, convertedToLoanId: loanId } : t,
            ),
          }
        }),

      replaceAll: (newData) => setData(newData),
      resetAll: () => {
        clearAppData().then(setData)
      },
    }
  }, [data])

  if (!value) {
    return <LoadingSplash />
  }

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
}

export function useFinance() {
  const ctx = useContext(FinanceContext)
  if (!ctx) throw new Error('useFinance phải được dùng bên trong <FinanceProvider>')
  return ctx
}
