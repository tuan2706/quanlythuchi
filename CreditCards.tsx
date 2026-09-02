import { useState } from 'react'
import { Plus, CreditCard as CardIcon, Repeat } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { MonthSelector } from '@/components/shared/MonthSelector'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { EmptyState } from '@/components/ui/empty-state'
import { MascotMessage } from '@/components/mascot/MascotMessage'
import { CardOverviewCard } from '@/components/creditcard/CardOverviewCard'
import { CardFormDialog } from '@/components/creditcard/CardFormDialog'
import { CardCalendarGrid } from '@/components/creditcard/CardCalendarGrid'
import { CardDayDetailDialog } from '@/components/creditcard/CardDayDetailDialog'
import { CardStatsSection } from '@/components/creditcard/CardStatsSection'
import { useFinance } from '@/context/FinanceContext'
import { useMonthState } from '@/hooks/useMonthState'
import { getCreditCardMascotContext } from '@/lib/mascot-logic'
import { loansLinkedToCard, loanProgressPct } from '@/lib/loan-calculations'

export default function CreditCards() {
  const { data } = useFinance()
  const [month, setMonth] = useMonthState()
  const [addOpen, setAddOpen] = useState(false)
  const [selectedCardId, setSelectedCardId] = useState<string | null>(data.creditCards[0]?.id ?? null)
  const [openDay, setOpenDay] = useState<string | null>(null)

  const selectedCard = data.creditCards.find((c) => c.id === selectedCardId) || data.creditCards[0]
  const linkedLoans = selectedCard ? loansLinkedToCard(data, selectedCard.id) : []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Thẻ tín dụng"
        description="Theo dõi chi tiêu và dư nợ các thẻ"
        action={
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" /> Thêm thẻ
          </Button>
        }
      />

      {data.creditCards.length > 0 && <MascotMessage context={getCreditCardMascotContext(data)} size={44} />}

      {data.creditCards.length === 0 ? (
        <EmptyState
          icon={CardIcon}
          title="Chưa có thẻ tín dụng nào"
          description="Thêm thẻ để bắt đầu theo dõi chi tiêu quẹt thẻ và dư nợ."
          action={
            <Button size="sm" onClick={() => setAddOpen(true)}>
              <Plus className="h-3.5 w-3.5" /> Thêm thẻ đầu tiên
            </Button>
          }
        />
      ) : (
        <>
          <div className="space-y-3">
            {data.creditCards.map((c) => (
              <CardOverviewCard
                key={c.id}
                card={c}
                settings={data.settings}
                selected={c.id === selectedCard?.id}
                onSelect={() => setSelectedCardId(c.id)}
              />
            ))}
          </div>

          {selectedCard && (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-ink">
                  Giao dịch: <span style={{ color: selectedCard.color }}>{selectedCard.name}</span>
                </p>
                <MonthSelector month={month} onChange={setMonth} />
              </div>

              <Card className="p-4">
                <CardCalendarGrid
                  month={month}
                  data={data}
                  cardId={selectedCard.id}
                  cardColor={selectedCard.color}
                  onSelectDay={setOpenDay}
                />
              </Card>

              {linkedLoans.length > 0 && (
                <Card className="p-4">
                  <p className="mb-3 flex items-center gap-1.5 text-sm font-medium text-ink">
                    <Repeat className="h-4 w-4 text-brand" /> Khoản trả góp
                  </p>
                  <div className="space-y-3">
                    {linkedLoans.map((l) => (
                      <div key={l.id}>
                        <div className="mb-1 flex items-center justify-between text-sm">
                          <span className="text-ink">{l.name}</span>
                          <span className="text-muted">
                            Đã trả {l.paidInstallments || 0}/{l.totalInstallments} kỳ
                          </span>
                        </div>
                        <Progress value={loanProgressPct(l)} />
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              <CardStatsSection data={data} card={selectedCard} month={month} settings={data.settings} />
            </>
          )}
        </>
      )}

      <CardFormDialog open={addOpen} onOpenChange={setAddOpen} />
      {openDay && selectedCard && (
        <CardDayDetailDialog
          day={openDay}
          cardId={selectedCard.id}
          open={!!openDay}
          onOpenChange={(v) => !v && setOpenDay(null)}
          settings={data.settings}
        />
      )}
    </div>
  )
}
