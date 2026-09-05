import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Mascot } from './Mascot'
import { pickMascotMessage, type MascotContext } from '@/lib/mascot-messages'

interface MascotToastContextValue {
  showMascotToast: (context?: MascotContext) => void
}

const MascotToastContext = createContext<MascotToastContextValue | null>(null)

export function MascotToastProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false)
  const [message, setMessage] = useState('')
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  const showMascotToast = useCallback((context: MascotContext = 'transaction_saved') => {
    setMessage(pickMascotMessage(context))
    setVisible(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setVisible(false), 2600)
  }, [])

  return (
    <MascotToastContext.Provider value={{ showMascotToast }}>
      {children}

      <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex justify-center px-4">
        <AnimatePresence>
          {visible && (
            <motion.div
              initial={{ opacity: 0, y: -16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              className="glass pointer-events-auto flex w-full max-w-[380px] items-center gap-2.5 rounded-2xl px-3 py-2.5 shadow-float"
            >
              <Mascot expression="excited" size={34} bounce />
              <p className="text-[13px] font-medium leading-snug text-ink">{message}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MascotToastContext.Provider>
  )
}

export function useMascotToast() {
  const ctx = useContext(MascotToastContext)
  if (!ctx) throw new Error('useMascotToast phải được dùng bên trong <MascotToastProvider>')
  return ctx
}
