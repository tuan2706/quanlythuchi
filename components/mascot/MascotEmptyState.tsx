import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Mascot } from './Mascot'
import { MascotIdleFloat } from './MascotAnimation'
import { pickMascotMessage } from '@/lib/mascot-messages'

export function MascotEmptyState({ onAddFirst }: { onAddFirst: () => void }) {
  const headline = useMemo(() => pickMascotMessage('onboarding_empty'), [])

  return (
    <div className="flex flex-col items-center justify-center gap-5 py-16 text-center">
      <MascotIdleFloat>
        <Mascot expression="happy" size={92} wave />
      </MascotIdleFloat>
      <div>
        <p className="font-display text-lg font-bold text-ink">{headline}</p>
        <p className="mt-1.5 text-sm text-muted">Ghi lại khoản thu hoặc chi đầu tiên để bắt đầu.</p>
      </div>
      <Button onClick={onAddFirst}>Thêm giao dịch đầu tiên</Button>
    </div>
  )
}
