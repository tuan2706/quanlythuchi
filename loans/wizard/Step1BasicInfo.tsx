import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { LOAN_CATEGORY_LABELS, type WizardState } from './wizard-types'
import type { LoanCategory } from '@/types'

const CATEGORIES: LoanCategory[] = ['borrowed', 'lent', 'installment']

export function Step1BasicInfo({ state, update }: { state: WizardState; update: (patch: Partial<WizardState>) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Loại khoản vay</Label>
        <div className="grid grid-cols-3 gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => update({ category: c })}
              className={`rounded-xl border px-2 py-2.5 text-center text-xs font-medium transition-colors ${
                state.category === c ? 'border-brand bg-brand-light text-brand' : 'border-border text-muted hover:text-ink'
              }`}
            >
              {LOAN_CATEGORY_LABELS[c]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label>Tên khoản vay</Label>
        <Input value={state.name} onChange={(e) => update({ name: e.target.value })} placeholder="VD: Vay mua xe máy" />
      </div>

      <div>
        <Label>{state.category === 'lent' ? 'Người vay' : 'Người / Ngân hàng cho vay'}</Label>
        <Input
          value={state.counterpartyName}
          onChange={(e) => update({ counterpartyName: e.target.value })}
          placeholder={state.category === 'lent' ? 'VD: Nguyễn Văn A' : 'VD: Ngân hàng MB, chị Hoa...'}
        />
      </div>

      <div>
        <Label>Danh mục (tùy chọn)</Label>
        <Select value={state.loanTag || '__none'} onValueChange={(v) => update({ loanTag: v === '__none' ? '' : v })}>
          <SelectTrigger>
            <SelectValue placeholder="Chọn danh mục" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none">Không chọn</SelectItem>
            {['Nhà', 'Xe', 'Điện thoại', 'Kinh doanh', 'Học tập', 'Y tế', 'Khác'].map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Ghi chú</Label>
        <Input value={state.note} onChange={(e) => update({ note: e.target.value })} placeholder="Ghi chú (tùy chọn)" />
      </div>
    </div>
  )
}
