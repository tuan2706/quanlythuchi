import type { InterestMethod, InterestRatePeriod, CompoundFrequency } from '@/types'

export interface InterestCalcInput {
  principal: number
  /** Rate already normalized to "per period" as a decimal fraction, e.g. 0.01 for 1%. */
  ratePerPeriod: number
  numberOfPeriods: number
  method: InterestMethod
  compoundFrequency?: CompoundFrequency
  /** Only used by 'actual_days': real calendar days per period, oldest→first period first. */
  actualDaysPerPeriod?: number[]
}

export interface InterestCalcResult {
  totalInterest: number
  totalPayback: number
  /** Representative periodic payment for display. For declining balance this is the FIRST
   * (highest) installment — the UI notes that later installments are smaller. */
  periodicPayment: number
  /** Per-period breakdown: principal portion + interest portion. Always numberOfPeriods long. */
  schedule: { period: number; principal: number; interest: number; payment: number; balance: number }[]
}

/** Converts a user-entered rate (e.g. "12%/năm") into a decimal rate-per-period (e.g. monthly). */
export function normalizeRatePerPeriod(ratePercent: number, ratePeriod: InterestRatePeriod, periodUnit: 'month' = 'month'): number {
  const monthly = ratePeriod === 'year' ? ratePercent / 12 : ratePercent
  return monthly / 100
}

/**
 * 1) Lãi đơn (Simple interest) — interest is a flat amount each period, computed once on the
 *    original principal, and principal+interest are repaid in equal installments.
 */
function calcSimple(input: InterestCalcInput): InterestCalcResult {
  const { principal, ratePerPeriod, numberOfPeriods } = input
  const totalInterest = principal * ratePerPeriod * numberOfPeriods
  const totalPayback = principal + totalInterest
  const periodicPayment = numberOfPeriods > 0 ? totalPayback / numberOfPeriods : totalPayback
  const equalPrincipal = numberOfPeriods > 0 ? principal / numberOfPeriods : principal
  const equalInterest = numberOfPeriods > 0 ? totalInterest / numberOfPeriods : totalInterest
  const schedule = Array.from({ length: numberOfPeriods }, (_, i) => ({
    period: i + 1,
    principal: equalPrincipal,
    interest: equalInterest,
    payment: equalPrincipal + equalInterest,
    balance: Math.max(principal - equalPrincipal * (i + 1), 0),
  }))
  return { totalInterest, totalPayback, periodicPayment, schedule }
}

/**
 * 2) Dư nợ giảm dần (Declining/reducing balance) — equal PRINCIPAL each period; interest is
 *    computed on the remaining balance, so it shrinks every period.
 */
function calcDecliningBalance(input: InterestCalcInput): InterestCalcResult {
  const { principal, ratePerPeriod, numberOfPeriods } = input
  const equalPrincipal = numberOfPeriods > 0 ? principal / numberOfPeriods : principal
  let balance = principal
  let totalInterest = 0
  const schedule: InterestCalcResult['schedule'] = []
  for (let i = 0; i < numberOfPeriods; i++) {
    const interest = balance * ratePerPeriod
    totalInterest += interest
    balance = Math.max(balance - equalPrincipal, 0)
    schedule.push({ period: i + 1, principal: equalPrincipal, interest, payment: equalPrincipal + interest, balance })
  }
  return {
    totalInterest,
    totalPayback: principal + totalInterest,
    periodicPayment: schedule[0]?.payment ?? 0,
    schedule,
  }
}

/**
 * 3) Lãi theo dư nợ gốc (Flat / original-balance interest) — equal PRINCIPAL each period, but
 *    interest stays CONSTANT every period, always computed on the ORIGINAL principal (does not
 *    shrink like method 2). Common "flat rate" method for Vietnamese consumer installment loans.
 */
function calcFlatOriginalBalance(input: InterestCalcInput): InterestCalcResult {
  const { principal, ratePerPeriod, numberOfPeriods } = input
  const equalPrincipal = numberOfPeriods > 0 ? principal / numberOfPeriods : principal
  const flatInterest = principal * ratePerPeriod
  const totalInterest = flatInterest * numberOfPeriods
  const schedule = Array.from({ length: numberOfPeriods }, (_, i) => ({
    period: i + 1,
    principal: equalPrincipal,
    interest: flatInterest,
    payment: equalPrincipal + flatInterest,
    balance: Math.max(principal - equalPrincipal * (i + 1), 0),
  }))
  return {
    totalInterest,
    totalPayback: principal + totalInterest,
    periodicPayment: equalPrincipal + flatInterest,
    schedule,
  }
}

/**
 * 4) Lãi theo ngày thực tế (Actual/365 days) — interest each period = balance × annualRate ×
 *    actualDaysInPeriod/365, using the real calendar day-count instead of assuming 30-day months.
 */
function calcActualDays(input: InterestCalcInput): InterestCalcResult {
  const { principal, ratePerPeriod, numberOfPeriods, actualDaysPerPeriod } = input
  const annualRate = ratePerPeriod * 12 // ratePerPeriod is normalized monthly; scale back to annual
  const equalPrincipal = numberOfPeriods > 0 ? principal / numberOfPeriods : principal
  let balance = principal
  let totalInterest = 0
  const schedule: InterestCalcResult['schedule'] = []
  for (let i = 0; i < numberOfPeriods; i++) {
    const days = actualDaysPerPeriod?.[i] ?? 30
    const interest = balance * annualRate * (days / 365)
    totalInterest += interest
    balance = Math.max(balance - equalPrincipal, 0)
    schedule.push({ period: i + 1, principal: equalPrincipal, interest, payment: equalPrincipal + interest, balance })
  }
  return {
    totalInterest,
    totalPayback: principal + totalInterest,
    periodicPayment: schedule[0]?.payment ?? 0,
    schedule,
  }
}

/**
 * 5) Lãi kép (Compound interest) — interest is added back into the principal each compounding
 *    period, then future interest is computed on the new, larger balance.
 */
function calcCompound(input: InterestCalcInput): InterestCalcResult {
  const { principal, ratePerPeriod, numberOfPeriods, compoundFrequency = 'monthly' } = input
  const compoundsPerMonth: Record<CompoundFrequency, number> = { daily: 30, monthly: 1, quarterly: 1 / 3, yearly: 1 / 12 }
  const compoundPeriods = Math.max(Math.round(numberOfPeriods * compoundsPerMonth[compoundFrequency]), 1)
  const ratePerCompound = ratePerPeriod / compoundsPerMonth[compoundFrequency]

  const totalPayback = principal * Math.pow(1 + ratePerCompound, compoundPeriods)
  const totalInterest = totalPayback - principal
  const periodicPayment = numberOfPeriods > 0 ? totalPayback / numberOfPeriods : totalPayback
  const equalPrincipal = numberOfPeriods > 0 ? principal / numberOfPeriods : principal
  const equalInterest = numberOfPeriods > 0 ? totalInterest / numberOfPeriods : totalInterest
  const schedule = Array.from({ length: numberOfPeriods }, (_, i) => ({
    period: i + 1,
    principal: equalPrincipal,
    interest: equalInterest,
    payment: equalPrincipal + equalInterest,
    balance: Math.max(principal - equalPrincipal * (i + 1), 0),
  }))
  return { totalInterest, totalPayback, periodicPayment, schedule }
}

export function calculateInterest(input: InterestCalcInput): InterestCalcResult {
  if (input.principal <= 0 || input.numberOfPeriods <= 0) {
    return { totalInterest: 0, totalPayback: input.principal, periodicPayment: input.principal, schedule: [] }
  }
  switch (input.method) {
    case 'simple':
      return calcSimple(input)
    case 'declining_balance':
      return calcDecliningBalance(input)
    case 'flat':
      return calcFlatOriginalBalance(input)
    case 'actual_days':
      return calcActualDays(input)
    case 'compound':
      return calcCompound(input)
    default:
      return calcSimple(input)
  }
}

export const INTEREST_METHOD_LABELS: Record<InterestMethod, string> = {
  simple: 'Lãi đơn',
  declining_balance: 'Dư nợ giảm dần',
  flat: 'Lãi theo dư nợ ban đầu',
  actual_days: 'Lãi theo ngày thực tế',
  compound: 'Lãi kép',
}

export const INTEREST_METHOD_DESCRIPTIONS: Record<InterestMethod, string> = {
  simple: 'Tiền lãi cố định mỗi kỳ, tính trên số tiền gốc ban đầu.',
  declining_balance: 'Tiền gốc cố định, tiền lãi giảm dần theo dư nợ còn lại.',
  flat: 'Lãi tính trên số tiền gốc ban đầu, không đổi mỗi kỳ.',
  actual_days: 'Lãi tính theo số ngày thực tế giữa các kỳ thanh toán.',
  compound: 'Lãi được cộng vào gốc sau mỗi kỳ để tiếp tục tính lãi.',
}
