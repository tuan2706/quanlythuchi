// ---- Core domain types -----------------------------------------------

export type TransactionType = 'income' | 'expense'

export interface Transaction {
  id: string
  date: string // 'yyyy-MM-dd'
  type: TransactionType
  amount: number
  categoryId?: string // only for expense
  accountId?: string // optional for backward compatibility with pre-existing data
  note: string
  recurringId?: string // set if generated from a recurring expense
  createdAt: number
}

export interface Category {
  id: string
  name: string
  isDefault: boolean
}

export type AccountType = 'cash' | 'bank' | 'ewallet' | 'credit_card' | 'other'

export interface Account {
  id: string
  name: string
  type: AccountType
  icon: string // key into ACCOUNT_ICON_MAP
  color: string // hex
  initialBalance: number
  createdAt: number
}

export type LoanCategory = 'borrowed' | 'lent' | 'installment' // Tiền đi vay / Tiền cho vay / Trả góp
export type InterestRateType = 'percent' | 'amount' // Theo % / Theo số tiền
export type InterestRatePeriod = 'month' | 'year'
export type InterestMethod = 'simple' | 'declining_balance' | 'flat' | 'actual_days' | 'compound'
export type CompoundFrequency = 'daily' | 'monthly' | 'quarterly' | 'yearly'
export type PaymentFrequency = 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'once' | 'free' | 'custom'
export type PaymentMethod = 'cash' | 'ewallet' | 'bank' | 'credit_card'

export interface RateChange {
  id: string
  effectiveDate: string // 'yyyy-MM-dd'
  rate: number
}

export interface Loan {
  id: string
  name: string
  totalAmount: number
  paidAmount: number
  monthlyPayment: number
  paymentDay: number // 1-31
  note: string
  createdAt: number
  // Installment tracking (optional — old loans keep working exactly as before without these)
  totalInstallments?: number
  paidInstallments?: number
  startDate?: string // 'yyyy-MM-dd'
  expectedEndDate?: string // 'yyyy-MM-dd'
  sourceType?: 'bank' | 'card'
  sourceCardId?: string

  // --- v9: Loan & Lending Manager fields (all optional, additive) ----
  category?: LoanCategory
  counterpartyName?: string // Người vay / Người cho vay / Ngân hàng
  loanTag?: string // Danh mục: Nhà, Xe, Điện thoại...

  principal?: number // tiền gốc thuần, tách riêng khỏi totalAmount (gốc + lãi)
  interestRateType?: InterestRateType
  interestRateValue?: number
  interestRatePeriod?: InterestRatePeriod
  conversionFee?: number
  interestMethod?: InterestMethod
  isFloatingRate?: boolean
  rateChanges?: RateChange[]

  // actual_days method
  interestStartDate?: string
  monthlyInterestPaymentDay?: number
  interestStartMonth?: string
  // compound method
  compoundFrequency?: CompoundFrequency

  paymentFrequency?: PaymentFrequency

  fundAccountId?: string // account credited/debited when the loan was created

  // Status (active/due_soon/overdue are always derived; these two are explicit manual states)
  cancelledAt?: string
  settledAt?: string
  earlySettlementFee?: number

  totalPrincipalPaid?: number
  totalInterestPaid?: number
  totalFeesPaid?: number
}

/** A single recorded payment against a loan — the detailed ledger (separate from the quick paidAmount counter). */
export interface LoanPaymentRecord {
  id: string
  loanId: string
  date: string // 'yyyy-MM-dd'
  principalPaid: number
  interestPaid: number
  feePaid: number
  totalPaid: number
  method: PaymentMethod
  accountId?: string
  note: string
  linkedTransactionId?: string
  createdAt: number
}

export interface Budget {
  id: string
  month: string // 'yyyy-MM'
  amount: number
}

export interface SavingsGoal {
  id: string
  name: string
  targetAmount: number
  savedAmount: number
  note: string
  createdAt: number
}

export interface RecurringExpense {
  id: string
  name: string
  amount: number
  categoryId: string
  dayOfMonth: number // 1-31
  active: boolean
}

export interface CreditCard {
  id: string
  name: string
  bank: string
  creditLimit: number
  statementDay: number // 1-31
  paymentDay: number // 1-31
  color: string // hex, used for the card's visual accent
  createdAt: number
}

/** A card swipe — a temporary debt on the card, NOT a real expense yet. */
export interface CardTransaction {
  id: string
  cardId: string
  date: string // 'yyyy-MM-dd'
  name: string
  categoryId?: string
  amount: number
  note: string
  createdAt: number
  /** Set once this swipe has been converted into an installment Loan — excluded from the card's revolving balance from then on. */
  convertedToLoanId?: string
}

/** Paying down a card's balance. This is what actually becomes a real Transaction. */
export interface CardPayment {
  id: string
  cardId: string
  amount: number
  date: string // 'yyyy-MM-dd'
  note: string
  linkedTransactionId?: string
  createdAt: number
}

export type Currency = 'VND' | 'USD'

export interface AppSettings {
  theme: 'light' | 'dark'
  currency: Currency
  usdRate: number // VND per 1 USD, used only for display conversion
  loanDueSoonThresholdDays?: number // default 5 if unset
}

export interface AppData {
  version: number
  transactions: Transaction[]
  categories: Category[]
  accounts: Account[]
  loans: Loan[]
  loanPayments: LoanPaymentRecord[]
  budgets: Budget[]
  goals: SavingsGoal[]
  recurring: RecurringExpense[]
  confirmedRecurringStamps: string[] // `${recurringId}:${yyyy-MM}` already actioned (confirmed or skipped)
  creditCards: CreditCard[]
  cardTransactions: CardTransaction[]
  cardPayments: CardPayment[]
  settings: AppSettings
}
