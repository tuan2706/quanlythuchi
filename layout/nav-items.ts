import { LayoutDashboard, BarChart3, NotebookPen, Landmark, CreditCard, Settings } from 'lucide-react'

export const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/stats', label: 'Thống kê', icon: BarChart3 },
  { to: '/diary', label: 'Nhật ký', icon: NotebookPen },
  { to: '/loans', label: 'Khoản vay', icon: Landmark },
  { to: '/cards', label: 'Thẻ', icon: CreditCard },
  { to: '/settings', label: 'Cài đặt', icon: Settings },
] as const
