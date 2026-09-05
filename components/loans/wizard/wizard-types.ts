import type {
  LoanCategory,
  InterestRateType,
  InterestRatePeriod,
  InterestMethod,
  CompoundFrequency,
  PaymentFrequency,
} from '@/types'

export interface WizardState {
  // Step 1 — Basic info
  category: LoanCategory
  name: string
  counterpartyName: string
  loanTag: string
  note: string

  // Step 2 — Financial info
  principal: number
  interestRateType: InterestRateType
  interestRateValue: number
  interestRatePeriod: InterestRatePeriod
  conversionFee: number
  interestMethod: InterestMethod
  isFloatingRate: boolean
  compoundFrequency: CompoundFrequency
  interestStartDate: string
  monthlyInterestPaymentDay: number

  // Step 3 — Schedule
  startDate: string
  paymentFrequency: PaymentFrequency
  numberOfPeriods: number
  paymentDay: number

  // Step 4 — Fund adjustment
  adjustFund: boolean
  fundAccountId: string
  fundDirection: 'add' | 'subtract'
}

export function defaultWizardState(today: string, defaultAccountId: string): WizardState {
  return {
    category: 'borrowed',
    name: '',
    counterpartyName: '',
    loanTag: '',
    note: '',

    principal: 0,
    interestRateType: 'percent',
    interestRateValue: 0,
    interestRatePeriod: 'month',
    conversionFee: 0,
    interestMethod: 'declining_balance',
    isFloatingRate: false,
    compoundFrequency: 'monthly',
    interestStartDate: today,
    monthlyInterestPaymentDay: 1,

    startDate: today,
    paymentFrequency: 'monthly',
    numberOfPeriods: 12,
    paymentDay: 1,

    adjustFund: true,
    fundAccountId: defaultAccountId,
    fundDirection: 'add',
  }
}

export const LOAN_CATEGORY_LABELS: Record<LoanCategory, string> = {
  borrowed: 'Tiền đi vay',
  lent: 'Tiền cho vay',
  installment: 'Trả góp',
}

export const PAYMENT_FREQUENCY_LABELS: Record<PaymentFrequency, string> = {
  weekly: 'Hàng tuần',
  monthly: 'Hàng tháng',
  quarterly: 'Hàng quý',
  yearly: 'Hàng năm',
  once: 'Một lần (đáo hạn)',
  free: 'Tự do',
  custom: 'Tùy chỉnh',
}
