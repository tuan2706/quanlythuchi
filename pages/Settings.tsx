import { useState } from 'react'
import { Moon, Sun, Tags, DollarSign, Wallet } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { CategoryManagerDialog } from '@/components/diary/CategoryManagerDialog'
import { AccountManagerDialog } from '@/components/accounts/AccountManagerDialog'
import { DataManagementCard } from '@/components/settings/DataManagementCard'
import { MascotMessage } from '@/components/mascot/MascotMessage'
import { useFinance } from '@/context/FinanceContext'
import type { Currency } from '@/types'

export default function Settings() {
  const { data, updateSettings } = useFinance()
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [rateInput, setRateInput] = useState(() => String(data.settings.usdRate))
  const isDark = data.settings.theme === 'dark'

  return (
    <div className="space-y-6">
      <PageHeader title="Cài đặt" description="Tùy chỉnh giao diện và quản lý dữ liệu" />

      <MascotMessage context="settings_tip" size={44} />

      <Card>
        <CardHeader>
          <CardTitle>Giao diện</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-2 text-ink">
                {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </div>
              <div>
                <p className="text-sm font-medium text-ink">Chế độ tối</p>
                <p className="text-xs text-muted">Chuyển giữa giao diện sáng và tối</p>
              </div>
            </div>
            <Switch checked={isDark} onCheckedChange={(v) => updateSettings({ theme: v ? 'dark' : 'light' })} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Đơn vị tiền tệ</CardTitle>
          <CardDescription>Số tiền luôn được lưu bằng VNĐ. Đổi đơn vị chỉ thay đổi cách hiển thị.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Hiển thị theo</Label>
            <Select value={data.settings.currency} onValueChange={(v) => updateSettings({ currency: v as Currency })}>
              <SelectTrigger className="max-w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VND">VNĐ (₫)</SelectItem>
                <SelectItem value="USD">USD ($)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {data.settings.currency === 'USD' && (
            <div className="max-w-[240px]">
              <Label>Tỷ giá quy đổi (1 USD = ? VNĐ)</Label>
              <div className="relative">
                <DollarSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <Input
                  type="number"
                  className="pl-9"
                  value={rateInput}
                  onChange={(e) => {
                    const raw = e.target.value
                    setRateInput(raw)
                    if (raw !== '') {
                      const n = Number(raw)
                      if (!Number.isNaN(n) && n > 0) updateSettings({ usdRate: n })
                    }
                  }}
                  onBlur={() => {
                    const n = Number(rateInput)
                    const clamped = !Number.isNaN(n) && n > 0 ? n : 1
                    setRateInput(String(clamped))
                    updateSettings({ usdRate: clamped })
                  }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Khoản vay</CardTitle>
          <CardDescription>Số ngày trước hạn để một khoản vay được đánh dấu "Sắp đến hạn".</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-w-[160px]">
            <Label>Ngưỡng cảnh báo (ngày)</Label>
            <Input
              type="number"
              min={1}
              max={30}
              value={data.settings.loanDueSoonThresholdDays ?? 5}
              onChange={(e) => updateSettings({ loanDueSoonThresholdDays: Math.max(1, Math.min(30, Number(e.target.value) || 5)) })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tài khoản</CardTitle>
          <CardDescription>Quản lý tiền mặt, ngân hàng, ví điện tử, thẻ tín dụng... để gắn vào từng giao dịch.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => setAccountOpen(true)}>
            <Wallet className="h-4 w-4" /> Quản lý tài khoản
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danh mục chi tiêu</CardTitle>
          <CardDescription>Thêm, sửa, xóa danh mục dùng khi ghi khoản chi.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => setCategoryOpen(true)}>
            <Tags className="h-4 w-4" /> Quản lý danh mục
          </Button>
        </CardContent>
      </Card>

      <DataManagementCard />

      <CategoryManagerDialog open={categoryOpen} onOpenChange={setCategoryOpen} />
      <AccountManagerDialog open={accountOpen} onOpenChange={setAccountOpen} settings={data.settings} />
    </div>
  )
}
