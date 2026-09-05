import { useNavigate } from 'react-router-dom'
import { Search, BarChart3, Plus, Settings } from 'lucide-react'
import { motion } from 'framer-motion'

const ACTIONS = [
  { key: 'search', label: 'Tìm kiếm', icon: Search, to: '/diary?search=1' },
  { key: 'stats', label: 'Thống kê', icon: BarChart3, to: '/stats' },
  { key: 'add', label: 'Thêm', icon: Plus, to: '/diary' },
  { key: 'settings', label: 'Cài đặt', icon: Settings, to: '/settings' },
] as const

export function QuickActions() {
  const navigate = useNavigate()

  return (
    <div className="mb-5 grid grid-cols-4 gap-2">
      {ACTIONS.map((a) => (
        <motion.button
          key={a.key}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(a.to)}
          className="flex flex-col items-center gap-2"
        >
          <span
            className={
              a.key === 'add'
                ? 'flex h-12 w-12 items-center justify-center rounded-full bg-brand text-white shadow-glow'
                : 'flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-ink border border-border'
            }
          >
            <a.icon className="h-5 w-5" />
          </span>
          <span className="text-[11px] font-medium text-muted">{a.label}</span>
        </motion.button>
      ))}
    </div>
  )
}
