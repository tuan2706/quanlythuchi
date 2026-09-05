import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { MoneyInput } from '@/components/ui/money-input'
import { Switch } from '@/components/ui/switch'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { formatMoney } from '@/lib/format'
import { calculateInterest, normalizeRatePerPeriod, INTEREST_METHOD_LABELS, INTEREST_METHOD_DESCRIPTIONS } from '@/lib/loan-interest-calculations'
import { useFinance } from '@/context/FinanceContext'
import type { InterestMethod, CompoundFrequency } from '@/types'
import type { WizardState } from './wizard-types'

const METHODS: InterestMethod[] = ['declining_balance', 'flat', 'simple', 'actual_days', 'compound']
const COMPOUND_OPTIONS: CompoundFrequency[] = ['daily', 'monthly', 'quarterly', 'yearly']
const COMPOUND_LABELS: Record<CompoundFrequency, string> = { daily: 'Hàng ngày', monthly: 'Hàng tháng', quarterly: 'Hàng quý', yearly: 'Hàng năm' }

export function Step2FinancialInfo({ state, update }: { state: WizardState; update: (patch: Partial<WizardState>) => void }) {
  const { data } = useFinance()

  const effectiveRatePerPeriod =
    state.interestRateType === 'amount'
      ? state.principal > 0
        ? state.interestRateValue / state.principal
        : 0
      : normalizeRatePerPeriod(state.interestRateValue, state.interestRatePeriod)

  const result = calculateInterest({
    principal: state.principal,
    ratePerPeriod: effectiveRatePerPeriod,
    numberOfPeriods: state.numberOfPeriods,
    method: state.interestMethod,
    compoundFrequency: state.compoundFrequency,
  })

  return (
    <div className="space-y-4">
      <div>
        <Label>Số tiền gốc</Label>
        <MoneyInput value={state.principal} onChange={(v) => update({ principal: v })} autoFocus />
      </div>

      <div>
        <Label>Hình thức nhập lãi suất</Label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => update({ interestRateType: 'percent' })}
            className={`rounded-xl border px-3 py-2 text-sm font-medium ${state.interestRateType === 'percent' ? 'border-brand bg-brand-light text-brand' : 'border-border text-muted'}`}
          >
            Theo %
          </button>
          <button
            type="button"
            onClick={() => update({ interestRateType: 'amount' })}
            className={`rounded-xl border px-3 py-2 text-sm font-medium ${state.interestRateType === 'amount' ? 'border-brand bg-brand-light text-brand' : 'border-border text-muted'}`}
          >
            Theo số tiền
          </button>
        </div>
      </div>

      {state.interestRateType === 'percent' ? (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Lãi suất (%)</Label>
            <Input
              type="number"
              min={0}
              step={0.01}
              value={state.interestRateValue || ''}
              onChange={(e) => update({ interestRateValue: Math.max(0, Number(e.target.value) || 0) })}
              placeholder="VD: 1.5"
            />
          </div>
          <div>
            <Label>Chu kỳ</Label>
            <Select value={state.interestRatePeriod} onValueChange={(v) => update({ interestRatePeriod: v as 'month' | 'year' })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">%/tháng</SelectItem>
                <SelectItem value="year">%/năm</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      ) : (
        <div>
          <Label>Số tiền lãi mỗi kỳ</Label>
          <MoneyInput value={state.interestRateValue} onChange={(v) => update({ interestRateValue: v })} />
        </div>
      )}

      <div>
        <Label>Phí chuyển đổi / phí hồ sơ (nếu có)</Label>
        <MoneyInput value={state.conversionFee} onChange={(v) => update({ conversionFee: v })} />
      </div>

      <div className="flex items-center justify-between rounded-xl bg-surface-2 px-3 py-2.5">
        <span className="text-sm text-ink">Lãi suất thả nổi</span>
        <Switch checked={state.isFloatingRate} onCheckedChange={(v) => update({ isFloatingRate: v })} />
      </div>

      <div>
        <Label>Phương pháp tính lãi</Label>
        <div className="space-y-2">
          {METHODS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => update({ interestMethod: m })}
              className={`w-full rounded-xl border p-3 text-left transition-colors ${
                state.interestMethod === m ? 'border-brand bg-brand-light' : 'border-border hover:bg-surface-2'
              }`}
            >
              <p className={`text-sm font-medium ${state.interestMethod === m ? 'text-brand' : 'text-ink'}`}>{INTEREST_METHOD_LABELS[m]}</p>
              <p className="mt-0.5 text-xs text-muted">{INTEREST_METHOD_DESCRIPTIONS[m]}</p>
            </button>
          ))}
        </div>
      </div>

      {state.interestMethod === 'compound' && (
        <div>
          <Label>Kỳ ghép lãi</Label>
          <Select value={state.compoundFrequency} onValueChange={(v) => update({ compoundFrequency: v as CompoundFrequency })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COMPOUND_OPTIONS.map((c) => (
                <SelectItem key={c} value={c}>
                  {COMPOUND_LABELS[c]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {state.interestMethod === 'actual_days' && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Ngày bắt đầu tính lãi</Label>
            <Input type="date" value={state.interestStartDate} onChange={(e) => update({ interestStartDate: e.target.value })} />
          </div>
          <div>
            <Label>Ngày trả lãi hàng tháng</Label>
            <Input
              type="number"
              min={1}
              max={31}
              value={state.monthlyInterestPaymentDay || ''}
              onChange={(e) => update({ monthlyInterestPaymentDay: Math.min(31, Math.max(1, Number(e.target.value) || 1)) })}
            />
          </div>
        </div>
      )}

      {state.principal > 0 && state.numberOfPeriods > 0 && (
        <div className="rounded-xl bg-surface-2 p-3 space-y-1.5">
          <p className="text-xs font-medium text-muted">Ước tính (dựa trên số kỳ ở bước sau, mặc định {state.numberOfPeriods} kỳ)</p>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">Tổng lãi dự kiến</span>
            <span className="font-semibold tabular text-warn">{formatMoney(Math.round(result.totalInterest), data.settings)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">Tổng phải trả</span>
            <span className="font-semibold tabular text-ink">{formatMoney(Math.round(result.totalPayback), data.settings)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">{state.interestMethod === 'declining_balance' || state.interestMethod === 'actual_days' ? 'Kỳ đầu tiên' : 'Mỗi kỳ'}</span>
            <span className="font-semibold tabular text-ink">{formatMoney(Math.round(result.periodicPayment), data.settings)}</span>
          </div>
        </div>
      )}
    </div>
  )
}
