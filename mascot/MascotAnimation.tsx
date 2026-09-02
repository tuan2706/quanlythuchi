import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

/** Slow, subtle continuous float — for when the mascot sits alone (empty states, hero spots). */
export function MascotIdleFloat({ children }: { children: ReactNode }) {
  return (
    <motion.div
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  )
}

export const popIn = {
  initial: { opacity: 0, scale: 0.85, y: 8 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.9, y: 6 },
  transition: { type: 'spring' as const, stiffness: 380, damping: 26 },
}
