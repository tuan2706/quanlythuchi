import { format, subDays, addMonths } from 'date-fns'
import type { AppData, Transaction, Loan, Budget, SavingsGoal, RecurringExpense, CreditCard, CardTransaction, Account } from '@/types'
import { buildDefaultCategories } from './categories'
import { uid } from './utils'

const d = (offset: number) => format(subDays(new Date(), offset), 'yyyy-MM-dd')

export function buildSampleData(): AppData {
  const categories = buildDefaultCategories()
  const byName = (n: string) => categories.find((c) => c.name === n)!.id

  const cashId = uid()
  const bankId = uid()
  const walletId = uid()
  const accounts: Account[] = [
    { id: cashId, name: 'Tiền mặt', type: 'cash', icon: 'banknote', color: '#34D399', initialBalance: 500000, createdAt: Date.now() },
    { id: bankId, name: 'MB Bank', type: 'bank', icon: 'landmark', color: '#3D8BFD', initialBalance: 8000000, createdAt: Date.now() },
    { id: walletId, name: 'MoMo', type: 'ewallet', icon: 'smartphone', color: '#7C5CFF', initialBalance: 300000, createdAt: Date.now() },
  ]

  const transactions: Transaction[] = [
    { id: uid(), date: d(0), type: 'expense', amount: 45000, categoryId: byName('Cafe'), accountId: cashId, note: 'Cà phê sáng', createdAt: Date.now() },
    { id: uid(), date: d(0), type: 'expense', amount: 120000, categoryId: byName('Ăn uống'), accountId: walletId, note: 'Cơm trưa văn phòng', createdAt: Date.now() },
    { id: uid(), date: d(1), type: 'income', amount: 15000000, accountId: bankId, note: 'Lương tháng', createdAt: Date.now() },
    { id: uid(), date: d(1), type: 'expense', amount: 350000, categoryId: byName('Xăng'), accountId: cashId, note: 'Đổ xăng xe máy', createdAt: Date.now() },
    { id: uid(), date: d(2), type: 'expense', amount: 89000, categoryId: byName('Mua sắm'), accountId: walletId, note: 'Đồ dùng cá nhân', createdAt: Date.now() },
    { id: uid(), date: d(3), type: 'expense', amount: 250000, categoryId: byName('Giải trí'), accountId: bankId, note: 'Xem phim cuối tuần', createdAt: Date.now() },
    { id: uid(), date: d(4), type: 'expense', amount: 65000, categoryId: byName('Đi lại'), accountId: cashId, note: 'Grab đi làm', createdAt: Date.now() },
    { id: uid(), date: d(5), type: 'income', amount: 2000000, accountId: bankId, note: 'Thưởng dự án', createdAt: Date.now() },
    { id: uid(), date: d(6), type: 'expense', amount: 500000, categoryId: byName('Gia đình'), accountId: bankId, note: 'Biếu ba mẹ', createdAt: Date.now() },
    { id: uid(), date: d(7), type: 'expense', amount: 199000, categoryId: byName('Internet'), accountId: bankId, note: 'Cước internet nhà', createdAt: Date.now() },
  ]

  const cardId = uid()
  const creditCards: CreditCard[] = [
    {
      id: cardId,
      name: 'MB Visa',
      bank: 'MB Bank',
      creditLimit: 50000000,
      statementDay: 5,
      paymentDay: 20,
      color: '#3D8BFD',
      createdAt: Date.now(),
    },
  ]

  const cardTransactions: CardTransaction[] = [
    { id: uid(), cardId, date: d(1), name: 'Mua laptop phụ kiện', categoryId: byName('Mua sắm'), amount: 2500000, note: '', createdAt: Date.now() },
    { id: uid(), cardId, date: d(3), name: 'Đặt vé máy bay', categoryId: byName('Giải trí'), amount: 3200000, note: 'Chuyến du lịch cuối năm', createdAt: Date.now() },
    { id: uid(), cardId, date: d(5), name: 'Siêu thị cuối tuần', categoryId: byName('Ăn uống'), amount: 850000, note: '', createdAt: Date.now() },
  ]

  const today = new Date()
  const loans: Loan[] = [
    {
      id: uid(),
      name: 'Vay mua xe máy',
      totalAmount: 30000000,
      paidAmount: 12000000,
      monthlyPayment: 1500000,
      paymentDay: 10,
      note: 'Trả góp 20 tháng',
      createdAt: Date.now(),
    },
    // Example of a card-linked installment loan (converted from a card swipe)
    {
      id: uid(),
      name: 'Laptop Dell (trả góp MB Visa)',
      totalAmount: 24000000,
      paidAmount: 8000000,
      monthlyPayment: 2000000,
      paymentDay: 20,
      note: 'Chuyển đổi trả góp từ MB Visa',
      createdAt: Date.now(),
      totalInstallments: 12,
      paidInstallments: 4,
      startDate: format(subDays(today, 120), 'yyyy-MM-dd'),
      expectedEndDate: format(addMonths(subDays(today, 120), 12), 'yyyy-MM-dd'),
      sourceType: 'card',
      sourceCardId: cardId,
    },
  ]

  const budgets: Budget[] = [{ id: uid(), month: format(new Date(), 'yyyy-MM'), amount: 20000000 }]

  const goals: SavingsGoal[] = [
    { id: uid(), name: 'Du lịch Nhật Bản', targetAmount: 100000000, savedAmount: 45000000, note: 'Dự kiến đi vào mùa hoa anh đào', createdAt: Date.now() },
    { id: uid(), name: 'Quỹ dự phòng', targetAmount: 50000000, savedAmount: 32000000, note: '', createdAt: Date.now() },
  ]

  const recurring: RecurringExpense[] = [
    { id: uid(), name: 'Tiền thuê nhà', amount: 4000000, categoryId: byName('Thuê nhà'), dayOfMonth: 5, active: true },
    { id: uid(), name: 'Netflix', amount: 260000, categoryId: byName('Giải trí'), dayOfMonth: 15, active: true },
    { id: uid(), name: 'Internet', amount: 199000, categoryId: byName('Internet'), dayOfMonth: 7, active: true },
  ]

  return {
    version: 1,
    transactions,
    categories,
    accounts,
    loans,
    loanPayments: [],
    budgets,
    goals,
    recurring,
    confirmedRecurringStamps: [],
    creditCards,
    cardTransactions,
    cardPayments: [],
    settings: { theme: 'dark', currency: 'VND', usdRate: 26000 },
  }
}
