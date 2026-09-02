import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { addDays, addMonths, format } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useFinance } from '@/context/FinanceContext'
import { useMascotToast } from '@/components/mascot/MascotToast'
import { calculateInterest, normalizeRatePerPeriod } from '@/lib/loan-interest-calculations'
import type { Loan } from '@/types'
import { WizardStepper } from './WizardStepper'
import { defaultWizardState, type WizardState } from './wizard-types'
import { Step1BasicInfo } from './Step1BasicInfo'
import { Step2FinancialInfo } from './Step2FinancialInfo'
import { Step3Schedule } from './Step3Schedule'
import { Step4Funding } from './Step4Funding'
import { Step5Summary } from './Step5Summary'

const TOTAL_STEPS = 5

export function LoanWizardDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { data, createLoanFromWizard } = useFinance()
  const { showMascotToast } = useMascotToast()
  const today = format(new Date(), 'yyyy-MM-dd')

  const [step, setStep] = useState(1)
  const [state, setState] = useState<WizardState>(() => defaultWizardState(today, data.accounts[0]?.id || ''))

  useEffect(() => {
    if (open) {
      setStep(1)
      setState(defaultWizardState(today, data.accounts[0]?.id || ''))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const update = (patch: Partial<WizardState>) => setState((s) => ({ ...s, ...patch }))

  const canProceed = (() => {
    if (step === 1) return state.name.trim().length > 0
    if (step === 2) return state.principal > 0
    if (step === 3) return state.paymentFrequency === 'once' || state.paymentFrequency === 'free' || state.numberOfPeriods > 0
    if (step === 4) return !state.adjustFund || data.accounts.length === 0 || !!state.fundAccountId
    return true
  })()

  const handleCreate = () => {
    const periods = state.paymentFrequency === 'once' || state.paymentFrequency === 'free' ? 1 : state.numberOfPeriods
    const effectiveRatePerPeriod =
      state.interestRateType === 'amount'
        ? state.principal > 0
          ? state.interestRateValue / state.principal
          : 0
        : normalizeRatePerPeriod(state.interestRateValue, state.interestRatePeriod)

    const result = calculateInterest({
      principal: state.principal,
      ratePerPeriod: effectiveRatePerPeriod,
      numberOfPeriods: periods,
      method: state.interestMethod,
      compoundFrequency: state.compoundFrequency,
    })

    let expectedEndDate: string
    const start = new Date(state.startDate)
    switch (state.paymentFrequency) {
      case 'weekly':
        expectedEndDate = format(addDays(start, periods * 7), 'yyyy-MM-dd')
        break
      case 'quarterly':
        expectedEndDate = format(addMonths(start, periods * 3), 'yyyy-MM-dd')
        break
      case 'yearly':
        expectedEndDate = format(addMonths(start, periods * 12), 'yyyy-MM-dd')
        break
      default:
        expectedEndDate = format(addMonths(start, periods), 'yyyy-MM-dd')
    }

    const showSchedule = state.paymentFrequency !== 'once' && state.paymentFrequency !== 'free'

    const loanPayload: Omit<Loan, 'id' | 'createdAt'> = {
      name: state.name.trim(),
      note: state.note,
      totalAmount: Math.round(result.totalPayback) + state.conversionFee,
      paidAmount: 0,
      monthlyPayment: Math.round(result.periodicPayment),
      paymentDay: state.paymentDay || 1,
      totalInstallments: showSchedule ? periods : undefined,
      paidInstallments: 0,
      startDate: state.startDate,
      expectedEndDate,
      sourceType: 'bank',

      category: state.category,
      counterpartyName: state.counterpartyName.trim() || undefined,
      loanTag: state.loanTag || undefined,
      principal: state.principal,
      interestRateType: state.interestRateType,
      interestRateValue: state.interestRateValue,
      interestRatePeriod: state.interestRatePeriod,
      conversionFee: state.conversionFee || undefined,
      interestMethod: state.interestMethod,
      isFloatingRate: state.isFloatingRate,
      compoundFrequency: state.interestMethod === 'compound' ? state.compoundFrequency : undefined,
      interestStartDate: state.interestMethod === 'actual_days' ? state.interestStartDate : undefined,
      monthlyInterestPaymentDay: state.interestMethod === 'actual_days' ? state.monthlyInterestPaymentDay : undefined,
      paymentFrequency: state.paymentFrequency,
      fundAccountId: state.adjustFund ? state.fundAccountId : undefined,
    }

    createLoanFromWizard(
      loanPayload,
      state.adjustFund && state.fundAccountId
        ? { accountId: state.fundAccountId, direction: state.category === 'lent' ? 'subtract' : 'add' }
        : undefined,
    )
    showMascotToast()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Thêm khoản vay</DialogTitle>
        </DialogHeader>

        <WizardStepper current={step} />

        <div className="max-h-[52vh] overflow-y-auto pr-0.5">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.18 }}
            >
              {step === 1 && <Step1BasicInfo state={state} update={update} />}
              {step === 2 && <Step2FinancialInfo state={state} update={update} />}
              {step === 3 && <Step3Schedule state={state} update={update} />}
              {step === 4 && <Step4Funding state={state} update={update} />}
              {step === 5 && <Step5Summary state={state} />}
            </motion.div>
          </AnimatePresence>
        </div>

        <DialogFooter className="mt-4">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep((s) => s - 1)}>
              <ChevronLeft className="h-4 w-4" /> Quay lại
            </Button>
          )}
          {step < TOTAL_STEPS ? (
            <Button disabled={!canProceed} onClick={() => setStep((s) => s + 1)}>
              Tiếp tục <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleCreate}>Tạo khoản vay</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
