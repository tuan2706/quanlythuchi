import type { AppSettings } from '@/types'

/** Format a raw amount (always stored in VND) for display, honoring the user's chosen currency. */
export function formatMoney(amountVnd: number, settings: AppSettings): string {
  if (settings.currency === 'USD') {
    const usd = amountVnd / (settings.usdRate || 1)
    return usd.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 })
  }
  return amountVnd.toLocaleString('vi-VN', { maximumFractionDigits: 0 }) + ' \u20ab'
}

/** Compact formatting for chart axes, e.g. 1.2tr, 500k */
export function formatCompact(amountVnd: number): string {
  const abs = Math.abs(amountVnd)
  if (abs >= 1_000_000_000) return (amountVnd / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B'
  if (abs >= 1_000_000) return (amountVnd / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'tr'
  if (abs >= 1_000) return (amountVnd / 1_000).toFixed(0) + 'k'
  return String(amountVnd)
}

export function parseMoneyInput(raw: string): number {
  const digits = raw.replace(/[^\d]/g, '')
  return digits ? parseInt(digits, 10) : 0
}

/** Group-thousands live input formatting, e.g. 1000000 -> "1.000.000" */
export function formatInputNumber(value: number): string {
  if (!value) return ''
  return value.toLocaleString('vi-VN')
}
