import { forwardRef } from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cn } from '@/lib/utils'

export const Tabs = TabsPrimitive.Root

export const TabsList = forwardRef<HTMLDivElement, TabsPrimitive.TabsListProps>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn('inline-flex items-center gap-1 rounded-2xl bg-surface-2 p-1', className)}
    {...props}
  />
))
TabsList.displayName = 'TabsList'

export const TabsTrigger = forwardRef<HTMLButtonElement, TabsPrimitive.TabsTriggerProps>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'rounded-xl px-3 py-2 text-sm font-semibold text-muted transition-colors',
      'data-[state=active]:bg-surface data-[state=active]:text-ink data-[state=active]:shadow-soft',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
      className,
    )}
    {...props}
  />
))
TabsTrigger.displayName = 'TabsTrigger'

export const TabsContent = forwardRef<HTMLDivElement, TabsPrimitive.TabsContentProps>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content ref={ref} className={cn('mt-4 animate-fade-in', className)} {...props} />
))
TabsContent.displayName = 'TabsContent'
