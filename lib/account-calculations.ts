import type { AppData } from '@/types'

/** Current balance for an account = its opening balance + all income - all expense recorded against it. */
export function accountBalance(data: AppData, accountId: string): number {
  const account = data.accounts.find((a) => a.id === accountId)
  const opening = account?.initialBalance || 0
  const txs = data.transactions.filter((t) => t.accountId === accountId)
  const income = txs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expense = txs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  return opening + income - expense
}

export function totalBalanceAllAccounts(data: AppData): number {
  return data.accounts.reduce((s, a) => s + accountBalance(data, a.id), 0)
}
