import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { EmptyState } from '@/components/ui/empty-state'
import { Wallet } from 'lucide-react'
import { useFinance } from '@/context/FinanceContext'
import { LOAN_CATEGORY_LABELS, type WizardState } from './wizard-types'

export function Step4Funding({ state, update }: { state: WizardState; update: (patch: Partial<WizardState>) => void }) {
  const { data } = useFinance()
  const isAdd = state.category !== 'lent'

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-xl bg-surface-2 px-3 py-2.5">
        <div>
          <p className="text-sm font-medium text-ink">Cộng/trừ tiền ngay vào tài khoản</p>
          <p className="text-xs text-muted">
            {LOAN_CATEGORY_LABELS[state.category]} — {isAdd ? 'tiền sẽ được cộng vào' : 'tiền sẽ được trừ khỏi'} tài khoản bạn chọn
          </p>
        </div>
        <Switch checked={state.adjustFund} onCheckedChange={(v) => update({ adjustFund: v })} />
      </div>

      {state.adjustFund && (
        <>
          {data.accounts.length === 0 ? (
            <EmptyState icon={Wallet} title="Chưa có tài khoản" description="Tạo tài khoản trong Cài đặt trước, hoặc tắt tùy chọn cộng/trừ tiền ở trên." />
          ) : (
            <div>
              <Label>Tài khoản</Label>
              <Select value={state.fundAccountId} onValueChange={(v) => update({ fundAccountId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn tài khoản" />
                </SelectTrigger>
                <SelectContent>
                  {data.accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <p className="rounded-xl bg-surface-2 p-3 text-xs text-muted">
            {isAdd
              ? 'Khoản tiền gốc sẽ được ghi nhận là một khoản thu vào tài khoản đã chọn.'
              : 'Khoản tiền gốc sẽ được ghi nhận là một khoản chi từ tài khoản đã chọn.'}
          </p>
        </>
      )}
    </div>
  )
}
