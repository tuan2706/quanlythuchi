import {
  UtensilsCrossed,
  Coffee,
  ShoppingBag,
  Zap,
  Droplet,
  Wifi,
  Fuel,
  Bus,
  Home,
  Building2,
  Users,
  Gamepad2,
  HeartPulse,
  GraduationCap,
  Gift,
  CreditCard,
  Landmark,
  HandCoins,
  Wallet,
  Tag,
  type LucideIcon,
} from 'lucide-react'

/** Maps a category NAME to an icon — keeps the Category data model untouched (no icon field needed). */
export const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
  'Ăn uống': UtensilsCrossed,
  'Cafe': Coffee,
  'Mua sắm': ShoppingBag,
  'Điện': Zap,
  'Nước': Droplet,
  'Internet': Wifi,
  'Xăng': Fuel,
  'Đi lại': Bus,
  'Nhà': Home,
  'Thuê nhà': Building2,
  'Gia đình': Users,
  'Giải trí': Gamepad2,
  'Y tế': HeartPulse,
  'Học tập': GraduationCap,
  'Quà tặng': Gift,
  'Thanh toán thẻ tín dụng': CreditCard,
  'Trả góp vay': Landmark,
  'Trả nợ vay': Landmark,
  'Thu nợ cho vay': HandCoins,
  'Phí tất toán khoản vay': Landmark,
  'Khác': Wallet,
}

export function getCategoryIcon(name: string): LucideIcon {
  return CATEGORY_ICON_MAP[name] || Tag
}
