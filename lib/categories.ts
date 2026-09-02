import type { Category } from '@/types'

export const DEFAULT_CATEGORY_NAMES = [
  'Ăn uống',
  'Cafe',
  'Mua sắm',
  'Điện',
  'Nước',
  'Internet',
  'Xăng',
  'Đi lại',
  'Nhà',
  'Thuê nhà',
  'Gia đình',
  'Giải trí',
  'Y tế',
  'Học tập',
  'Quà tặng',
  'Khác',
]

export function buildDefaultCategories(): Category[] {
  return DEFAULT_CATEGORY_NAMES.map((name, i) => ({
    id: `default-${i}`,
    name,
    isDefault: true,
  }))
}
