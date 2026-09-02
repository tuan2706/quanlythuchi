import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { PAYMENT_FREQUENCY_LABELS, type WizardState } from './wizard-types'
import type { PaymentFrequency } from '@/types'

const FREQUENCIES: PaymentFrequency[] = ['weekly', 'monthly', 'quarterly', 'yearly', 'once', 'free', 'custom']

export function Step3Schedule({ state, update }: { state: WizardState; update: (patch: Partial<WizardState>) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Ngày bắt đầu</Label>
        <Input type="date" value={state.startDate} onChange={(e) => update({ startDate: e.target.value })} />
      </div>

      <div>
        <Label>Tần suất thanh toán</Label>
        <Select value={state.paymentFrequency} onValueChange={(v) => update({ paymentFrequency: v as PaymentFrequency })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FREQUENCIES.map((f) => (
              <SelectItem key={f} value={f}>
                {PAYMENT_FREQUENCY_LABELS[f]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {state.paymentFrequency !== 'once' && state.paymentFrequency !== 'free' && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Số kỳ thanh toán</Label>
            <Input
              type="number"
              min={1}
              value={state.numberOfPeriods || ''}
              onChange={(e) => update({ numberOfPeriods: Math.max(1, Number(e.target.value) || 1) })}
              placeholder="VD: 12"
            />
          </div>
          <div>
            <Label>Ngày thanh toán</Label>
            <Input
              type="number"
              min={1}
              max={31}
              value={state.paymentDay || ''}
              onChange={(e) => update({ paymentDay: Math.min(31, Math.max(1, Number(e.target.value) || 1)) })}
            />
          </div>
        </div>
      )}

      {state.paymentFrequency === 'once' && (
        <p className="rounded-xl bg-surface-2 p-3 text-xs text-muted">
          Khoản vay sẽ đáo hạn và thanh toán một lần duy nhất — toàn bộ gốc và lãi vào cuối kỳ.
        </p>
      )}
      {state.paymentFrequency === 'free' && (
        <p className="rounded-xl bg-surface-2 p-3 text-xs text-muted">
          Không có lịch cố định — bạn có thể ghi nhận thanh toán bất cứ lúc nào từ mục Lịch sử thanh toán.
        </p>
      )}
    </div>
  )
}
