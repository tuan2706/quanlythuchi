import { forwardRef, type HTMLAttributes } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export const Dialog = DialogPrimitive.Root
export const DialogTrigger = DialogPrimitive.Trigger

/**
 * Styled as an iOS-style bottom sheet: slides up from the bottom, pinned to
 * the app's phone-width column, rounded top corners, drag handle.
 */
export const DialogContent = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & { hideClose?: boolean }
>(({ className, children, hideClose, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-black/55 backdrop-blur-[2px] data-[state=open]:animate-sheet-overlay data-[aria-hidden=true]:!pointer-events-none" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed bottom-0 left-1/2 z-50 w-full max-w-[420px] -translate-x-1/2 !pointer-events-auto',
        'max-h-[88vh] overflow-y-auto rounded-t-4xl border-t border-x border-border bg-surface',
        'px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-3 shadow-float',
        'data-[state=open]:animate-sheet-up',
        className,
      )}
      {...props}
    >
      <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-border-strong" />
      {children}
      {!hideClose && (
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-full bg-surface-2 p-1.5 text-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">
          <X className="h-4 w-4" />
          <span className="sr-only">Đóng</span>
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
))
DialogContent.displayName = 'DialogContent'

export function DialogHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mb-4 flex flex-col gap-1', className)} {...props} />
}

export const DialogTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title ref={ref} className={cn('font-display text-lg font-bold tracking-tight', className)} {...props} />
))
DialogTitle.displayName = 'DialogTitle'

export const DialogDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description ref={ref} className={cn('text-sm text-muted', className)} {...props} />
))
DialogDescription.displayName = 'DialogDescription'

export function DialogFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mt-6 flex justify-end gap-2', className)} {...props} />
}
