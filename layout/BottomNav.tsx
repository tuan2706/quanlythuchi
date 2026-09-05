import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { NAV_ITEMS } from './nav-items'
import { cn } from '@/lib/utils'

export function BottomNav() {
  const location = useLocation()

  return (
    <nav className="fixed bottom-[env(safe-area-inset-bottom)] left-1/2 z-30 mb-3 w-full max-w-[420px] -translate-x-1/2 px-4">
      <div className="glass flex items-center justify-around rounded-3xl px-2 py-2 shadow-float">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
          const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)
          return (
            <NavLink
              key={to}
              to={to}
              className="relative flex flex-1 flex-col items-center gap-1 rounded-2xl py-2 text-[10px] font-medium"
            >
              {isActive && (
                <motion.span
                  layoutId="bottom-nav-active"
                  className="absolute inset-x-2 inset-y-0.5 -z-10 rounded-2xl bg-brand-light"
                  transition={{ type: 'spring', stiffness: 500, damping: 34 }}
                />
              )}
              <Icon className={cn('h-5 w-5 transition-colors', isActive ? 'text-brand' : 'text-muted')} />
              <span className={cn('transition-colors', isActive ? 'text-brand' : 'text-muted')}>{label}</span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
