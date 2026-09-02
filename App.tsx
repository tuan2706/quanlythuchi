import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { Loader2 } from 'lucide-react'

const Dashboard = lazy(() => import('@/pages/Dashboard'))
const Diary = lazy(() => import('@/pages/Diary'))
const Stats = lazy(() => import('@/pages/Stats'))
const Loans = lazy(() => import('@/pages/Loans'))
const CreditCards = lazy(() => import('@/pages/CreditCards'))
const SettingsPage = lazy(() => import('@/pages/Settings'))

function PageFallback() {
  return (
    <div className="flex h-[60vh] items-center justify-center text-muted">
      <Loader2 className="h-6 w-6 animate-spin" />
    </div>
  )
}

export default function App() {
  return (
    <AppShell>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/diary" element={<Diary />} />
          <Route path="/diary/:day" element={<Diary />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/loans" element={<Loans />} />
          <Route path="/cards" element={<CreditCards />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </Suspense>
    </AppShell>
  )
}
