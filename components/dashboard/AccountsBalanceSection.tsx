import { useState } from 'react'
import { Wallet, SlidersHorizontal } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatMoney } from '@/lib/format'
import { accountBalance } from '@/lib/account-calculations'
import { ACCOUNT_ICON_MAP } from '@/lib/account-options'
import { AdjustBalanceDialog } from '@/components/accounts/AdjustBalanceDialog'
import type { Account, AppData, AppSettings } from '@/types'

export function AccountsBalanceSection({ data, settings }: { data: AppData; settings: AppSettings }) {
  const [adjusting, setAdjusting] = useState<Account | null>(null)

  if (data.accounts.length === 0) return null

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Số dư tài khoản</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {data.accounts.map((a) => {
            const Icon = ACCOUNT_ICON_MAP[a.icon as keyof typeof ACCOUNT_ICON_MAP] || Wallet
            const balance = accountBalance(data, a.id)
            return (
              <div key={a.id} className="flex items-center justify-between rounded-xl bg-surface-2 px-3 py-2.5">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white"
                    style={{ backgroundColor: a.color }}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <p className="truncate text-sm font-medium text-ink">{a.name}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <p className="text-sm font-semibold tabular text-ink">{formatMoney(balance, settings)}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted"
                    onClick={() => setAdjusting(a)}
                    aria-label={`Điều chỉnh số dư ${a.name}`}
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {adjusting && (
        <AdjustBalanceDialog
          open={!!adjusting}
          onOpenChange={(v) => !v && setAdjusting(null)}
          account={adjusting}
          data={data}
          settings={settings}
        />
      )}
    </>
  )
}
