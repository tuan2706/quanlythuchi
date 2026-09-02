import { useState } from 'react'
import { Plus, Landmark } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { FilterPills } from '@/components/ui/filter-pills'
import { LoanCard } from '@/components/loans/LoanCard'
import { LoanWizardDialog } from '@/components/loans/wizard/LoanWizardDialog'
import { MascotMessage } from '@/components/mascot/MascotMessage'
import { formatMoney } from '@/lib/format'
import { totalLoanRemaining, totalLoanMonthly } from '@/lib/calculations'
import { getLoansMascotContext } from '@/lib/mascot-logic'
import { loansWithStatus, loanStatusCounts, LOAN_STATUS_LABELS, type LoanStatus } from '@/lib/loan-status'
import { useFinance } from '@/context/FinanceContext'

export default function Loans() {
  const { data } = useFinance()
  const [addOpen, setAddOpen] = useState(false)
  const [filter, setFilter] = useState<LoanStatus | 'all'>('all')

  const totalAmount = data.loans.reduce((s, l) => s + l.totalAmount, 0)
  const remaining = totalLoanRemaining(data)
  const monthly = totalLoanMonthly(data)
  const counts = loanStatusCounts(data)
  const filteredLoans = loansWithStatus(data, filter)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Khoản vay"
        description="Theo dõi các khoản vay và tiến độ trả nợ"
        action={
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" /> Thêm khoản vay
          </Button>
        }
      />

      {data.loans.length > 0 && <MascotMessage context={getLoansMascotContext(data)} size={44} />}

      <div className="grid grid-cols-3 gap-2">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted">Tổng khoản vay</p>
            <p className="mt-1 font-display text-lg font-semibold tabular text-ink">{formatMoney(totalAmount, data.settings)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted">Còn lại phải trả</p>
            <p className="mt-1 font-display text-lg font-semibold tabular text-warn">{formatMoney(remaining, data.settings)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted">Trả mỗi tháng</p>
            <p className="mt-1 font-display text-lg font-semibold tabular text-ink">{formatMoney(monthly, data.settings)}</p>
          </CardContent>
        </Card>
      </div>

      {data.loans.length > 0 && (
        <FilterPills
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: `Tất cả (${data.loans.length})` },
            { value: 'active', label: `${LOAN_STATUS_LABELS.active} (${counts.active})` },
            { value: 'due_soon', label: `${LOAN_STATUS_LABELS.due_soon} (${counts.due_soon})` },
            { value: 'overdue', label: `${LOAN_STATUS_LABELS.overdue} (${counts.overdue})` },
            { value: 'settled', label: `${LOAN_STATUS_LABELS.settled} (${counts.settled})` },
            { value: 'cancelled', label: `${LOAN_STATUS_LABELS.cancelled} (${counts.cancelled})` },
          ]}
        />
      )}

      {data.loans.length === 0 ? (
        <EmptyState
          icon={Landmark}
          title="Chưa có khoản vay nào"
          description="Thêm khoản vay để theo dõi số tiền đã trả và còn lại."
          action={
            <Button size="sm" onClick={() => setAddOpen(true)}>
              <Plus className="h-3.5 w-3.5" /> Thêm khoản vay đầu tiên
            </Button>
          }
        />
      ) : filteredLoans.length === 0 ? (
        <EmptyState icon={Landmark} title="Không có khoản vay nào ở trạng thái này" />
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredLoans.map((l) => (
            <LoanCard key={l.id} loan={l} settings={data.settings} />
          ))}
        </div>
      )}

      <LoanWizardDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  )
}
