import { Wallet, Landmark, Smartphone, CreditCard, PiggyBank, Banknote, CircleDollarSign, Building2 } from 'lucide-react'
import type { AccountType } from '@/types'

export const ACCOUNT_ICON_MAP = {
  wallet: Wallet,
  landmark: Landmark,
  smartphone: Smartphone,
  'credit-card': CreditCard,
  'piggy-bank': PiggyBank,
  banknote: Banknote,
  'circle-dollar': CircleDollarSign,
  building: Building2,
} as const

export type AccountIconKey = keyof typeof ACCOUNT_ICON_MAP

export const ACCOUNT_ICON_OPTIONS: AccountIconKey[] = [
  'wallet',
  'landmark',
  'building',
  'smartphone',
  'credit-card',
  'piggy-bank',
  'banknote',
  'circle-dollar',
]

export const ACCOUNT_COLOR_OPTIONS = [
  '#34D399', // green — cash-like
  '#3D8BFD', // blue — bank
  '#7C5CFF', // purple — e-wallet
  '#FF9F43', // orange
  '#FF5C5C', // red — credit card
  '#22D3EE', // cyan
]

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  cash: 'Tiền mặt',
  bank: 'Ngân hàng',
  ewallet: 'Ví điện tử',
  credit_card: 'Thẻ tín dụng',
  other: 'Tài khoản khác',
}

export const ACCOUNT_TYPE_DEFAULT_ICON: Record<AccountType, AccountIconKey> = {
  cash: 'banknote',
  bank: 'landmark',
  ewallet: 'smartphone',
  credit_card: 'credit-card',
  other: 'circle-dollar',
}
