import { Mascot } from '@/components/mascot/Mascot'
import { MascotBubble } from '@/components/mascot/MascotBubble'
import { pickMascotMessage, type MascotContext } from '@/lib/mascot-messages'
import { CONTEXT_EXPRESSION } from '@/lib/mascot-logic'
import { useMemo } from 'react'

export function GreetingHeader({ insight, mascotContext }: { insight: string; mascotContext: MascotContext }) {
  // Re-rolls when the context category changes (reload, or state shifts
  // e.g. from "no transaction" to "budget good") — stable in between.
  const message = useMemo(() => pickMascotMessage(mascotContext), [mascotContext])
  const expression = CONTEXT_EXPRESSION[mascotContext]

  return (
    <div className="mb-5">
      <div className="mb-3 flex items-center justify-between">
        <h1 className="font-display text-xl font-bold tracking-tight text-ink">Sổ Thu Chi</h1>
        <span className="inline-flex items-center rounded-full bg-brand-light px-3 py-1 text-xs font-medium text-brand">
          {insight}
        </span>
      </div>
      <div className="flex items-start gap-2.5">
        <Mascot expression={expression} size={48} wave bounce={expression === 'excited'} />
        <MascotBubble className="flex-1 mt-1">
          <p className="text-[13px] leading-snug text-ink">{message}</p>
        </MascotBubble>
      </div>
    </div>
  )
}
