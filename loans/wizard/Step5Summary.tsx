import { Card, CardContent } from '@/components/ui/card'
import { formatMoney } from '@/lib/format'
import { calculateInterest, normalizeRatePerPeriod, INTEREST_METHOD_LABELS } from '@/lib/loan-interest-calculations'
import { useFinance } from '@/context/FinanceContext'
import { LOAN_CATEGORY_LABELS, PAYMENT_FREQUENCY_LABELS, type WizardState } from './wizard-types'

export function Step5Summary({ state }: { state: WizardState }) {
  const { data } = useFinance()

  const effectiveRatePerPeriod =
    state.interestRateType === 'amount'
      ? state.principal > 0
        ? state.interestRateValue / state.principal
        : 0
      : normalizeRatePerPeriod(state.interestRateValue, state.interestRatePeriod)

  const periods = state.paymentFrequency === 'once' ? 1 : state.numberOfPeriods
  const result = calculateInterest({
    principal: state.principal,
    ratePerPeriod: effectiveRatePerPeriod,
    numberOfPeriods: periods,
    method: state.interestMethod,
    compoundFrequency: state.compoundFrequency,
  })

  const account = data.accounts.find((a) => a.id === state.fundAccountId)

  const rows: [string, string][] = [
    ['Loại khoản vay', LOAN_CATEGORY_LABELS[state.category]],
    ['Tên', state.name || '—'],
    [state.category === 'lent' ? 'Người vay' : 'Người/Ngân hàng cho vay', state.counterpartyName || '—'],
    ['Số tiền gốc', formatMoney(state.principal, data.settings)],
    ['Phương pháp tính lãi', INTEREST_METHOD_LABELS[state.interestMethod]],
    ['Tổng lãi dự kiến', formatMoney(Math.round(result.totalInterest), data.settings)],
    ['Tổng phải trả', formatMoney(Math.round(result.totalPayback), data.settings)],
    ['Tần suất thanh toán', PAYMENT_FREQUENCY_LABELS[state.paymentFrequency]],
    ...(state.paymentFrequency !== 'once' && state.paymentFrequency !== 'free'
      ? ([['Số kỳ', String(state.numberOfPeriods)]] as [string, string][])
      : []),
    ['Ngày bắt đầu', state.startDate],
  ]

  if (state.adjustFund && account) {
    rows.push([state.category === 'lent' ? 'Trừ khỏi tài khoản' : 'Cộng vào tài khoản', account.name])
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="divide-y divide-border p-0">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between px-4 py-2.5 text-sm">
              <span className="text-muted">{label}</span>
              <span className="text-right font-medium text-ink">{value}</span>
            </div>
          ))}
        </CardContent>
      </Card>
      <p className="text-center text-xs text-muted">Kiểm tra lại thông tin trước khi tạo khoản vay.</p>
    </div>
  )
}
