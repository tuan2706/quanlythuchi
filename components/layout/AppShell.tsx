import type { ReactNode } from 'react'
import { BottomNav } from './BottomNav'
import { FloatingActionButton } from './FloatingActionButton'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#050506] md:flex md:items-center md:justify-center">
      <div className="relative min-h-screen w-full max-w-[420px] bg-bg md:min-h-[calc(100vh-48px)] md:my-6 md:overflow-hidden md:rounded-[2.75rem] md:border md:border-white/10 md:shadow-[0_0_0_10px_rgba(255,255,255,0.02),0_40px_80px_-20px_rgba(0,0,0,0.7)]">
        <main className="min-h-screen overflow-y-auto px-4 pb-32 pt-6">{children}</main>
        <BottomNav />
        <FloatingActionButton />
      </div>
    </div>
  )
}
