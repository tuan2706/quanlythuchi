import { Wallet } from 'lucide-react'

export function LoadingSplash() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg">
      <div className="flex h-14 w-14 animate-pulse items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-[#7C5CFF] text-white shadow-glow">
        <Wallet className="h-6 w-6" />
      </div>
    </div>
  )
}
