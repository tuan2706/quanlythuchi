import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const STEP_LABELS = ['Thông tin', 'Tài chính', 'Lịch trả', 'Nguồn tiền', 'Xác nhận']

export function WizardStepper({ current }: { current: number }) {
  return (
    <div className="mb-5 flex items-center">
      {STEP_LABELS.map((label, i) => {
        const step = i + 1
        const done = step < current
        const active = step === current
        return (
          <div key={label} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                  done ? 'bg-brand text-white' : active ? 'bg-brand text-white' : 'bg-surface-2 text-muted',
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : step}
              </div>
              <span className={cn('hidden text-[9px] sm:block', active ? 'text-ink font-medium' : 'text-muted')}>{label}</span>
            </div>
            {step < STEP_LABELS.length && (
              <div className="mx-1 h-0.5 flex-1 overflow-hidden rounded-full bg-surface-2">
                <motion.div
                  className="h-full bg-brand"
                  initial={false}
                  animate={{ width: done ? '100%' : '0%' }}
                  transition={{ duration: 0.25 }}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
