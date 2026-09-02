import type { ReactNode } from 'react'

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="text-[13px] text-muted">{description}</p>
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink">{title}</h1>
      </div>
      {action}
    </div>
  )
}
