import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export function MascotBubble({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.15, duration: 0.25 }}
      className={cn('relative rounded-2xl rounded-tl-md bg-surface-2 px-3.5 py-2.5', className)}
    >
      {children}
    </motion.div>
  )
}
