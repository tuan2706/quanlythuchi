import { useMemo } from 'react'
import { Mascot } from './Mascot'
import { MascotBubble } from './MascotBubble'
import { pickMascotMessage, type MascotContext } from '@/lib/mascot-messages'
import { CONTEXT_EXPRESSION } from '@/lib/mascot-logic'
import { cn } from '@/lib/utils'

export function MascotMessage({
  context,
  size = 52,
  className,
}: {
  context: MascotContext
  size?: number
  className?: string
}) {
  // Re-rolls whenever the context category changes (e.g. reload, or state
  // moving from "no transaction" to "budget good"); stable in between so
  // the text doesn't jump around on every re-render.
  const message = useMemo(() => pickMascotMessage(context), [context])
  const expression = CONTEXT_EXPRESSION[context]

  return (
    <div className={cn('flex items-start gap-2.5', className)}>
      <Mascot expression={expression} size={size} wave bounce={expression === 'excited'} />
      <MascotBubble className="flex-1 mt-1">
        <p className="text-[13px] leading-snug text-ink">{message}</p>
      </MascotBubble>
    </div>
  )
}
