import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, ArrowUpCircle, ArrowDownCircle, Landmark, CreditCard, X } from 'lucide-react'
import { format } from 'date-fns'
import { useFinance } from '@/context/FinanceContext'
import { TransactionFormDialog } from '@/components/diary/TransactionFormDialog'
import { LoanWizardDialog } from '@/components/loans/wizard/LoanWizardDialog'
import { CardTransactionFormDialog } from '@/components/creditcard/CardTransactionFormDialog'
import { CardFormDialog } from '@/components/creditcard/CardFormDialog'

const ACTIONS = [
  { key: 'income', label: 'Thêm thu', icon: ArrowUpCircle, tone: 'bg-income' },
  { key: 'expense', label: 'Thêm chi', icon: ArrowDownCircle, tone: 'bg-expense' },
  { key: 'loan', label: 'Thêm khoản vay', icon: Landmark, tone: 'bg-warn' },
  { key: 'card', label: 'Thêm giao dịch thẻ', icon: CreditCard, tone: 'bg-brand' },
] as const

// 200-250ms scale + fade + slide per item, staggered.
const ITEM_TRANSITION = (i: number) => ({ duration: 0.22, delay: i * 0.035, ease: [0.16, 1, 0.3, 1] as const })

export function FloatingActionButton() {
  const { data } = useFinance()
  const [open, setOpen] = useState(false)
  const [txOpen, setTxOpen] = useState(false)
  const [txType, setTxType] = useState<'income' | 'expense'>('income')
  const [loanOpen, setLoanOpen] = useState(false)
  const [cardTxOpen, setCardTxOpen] = useState(false)
  const [addCardOpen, setAddCardOpen] = useState(false)

  const handleAction = (key: (typeof ACTIONS)[number]['key']) => {
    setOpen(false)
    if (key === 'loan') {
      setLoanOpen(true)
      return
    }
    if (key === 'card') {
      // No card yet: prompt to create one first instead of opening a broken form.
      if (data.creditCards.length === 0) setAddCardOpen(true)
      else setCardTxOpen(true)
      return
    }
    setTxType(key)
    setTxOpen(true)
  }

  const today = format(new Date(), 'yyyy-MM-dd')

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-30 bg-black/20"
          />
        )}
      </AnimatePresence>

      {/* True mobile-standard placement: fixed to the bottom-right corner of the
          screen, 20px off the right edge and 20px above the bottom nav — not
          centered over the nav like a typical "middle tab" FAB. */}
      <div
        className="fixed z-40 flex flex-col items-end gap-3"
        style={{
          right: 'max(20px, calc((100vw - 420px) / 2 + 20px))',
          bottom: 'calc(105px + env(safe-area-inset-bottom))',
        }}
      >
        <AnimatePresence>
          {open && (
            <motion.div className="flex flex-col items-end gap-3">
              {ACTIONS.map((action, i) => (
                <motion.button
                  key={action.key}
                  initial={{ opacity: 0, y: 14, scale: 0.85 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.85 }}
                  transition={ITEM_TRANSITION(i)}
                  onClick={() => handleAction(action.key)}
                  className="flex items-center gap-3"
                >
                  <span className="rounded-full bg-surface px-3 py-1.5 text-sm font-medium text-ink shadow-float border border-border">
                    {action.label}
                  </span>
                  <span className={`flex h-12 w-12 items-center justify-center rounded-full text-white shadow-float ${action.tone}`}>
                    <action.icon className="h-5 w-5" />
                  </span>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={() => setOpen((v) => !v)}
          whileTap={{ scale: 0.92 }}
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="flex h-[62px] w-[62px] items-center justify-center rounded-full bg-brand text-white shadow-glow"
          aria-label="Thêm giao dịch"
        >
          {open ? <X className="h-7 w-7" /> : <Plus className="h-7 w-7" />}
        </motion.button>
      </div>

      <TransactionFormDialog open={txOpen} onOpenChange={setTxOpen} day={today} defaultType={txType} />
      <LoanWizardDialog open={loanOpen} onOpenChange={setLoanOpen} />
      {data.creditCards.length > 0 && (
        <CardTransactionFormDialog
          open={cardTxOpen}
          onOpenChange={setCardTxOpen}
          day={today}
          cardId={data.creditCards[0].id}
        />
      )}
      <CardFormDialog open={addCardOpen} onOpenChange={setAddCardOpen} />
    </>
  )
}
