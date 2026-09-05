import { useState } from 'react'
import { Plus, Pencil, Trash2, Check, X, Tag } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useFinance } from '@/context/FinanceContext'
import type { Category } from '@/types'

export function CategoryManagerDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { data, addCategory, updateCategory, deleteCategory } = useFinance()
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [deleting, setDeleting] = useState<Category | null>(null)

  const usedCount = (id: string) => data.transactions.filter((t) => t.categoryId === id).length

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Danh mục chi tiêu</DialogTitle>
          </DialogHeader>

          <div className="flex gap-2 mb-4">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Tên danh mục mới"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newName.trim()) {
                  addCategory(newName.trim())
                  setNewName('')
                }
              }}
            />
            <Button
              disabled={!newName.trim()}
              onClick={() => {
                addCategory(newName.trim())
                setNewName('')
              }}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="max-h-80 space-y-1.5 overflow-y-auto">
            {data.categories.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-surface-2">
                {editingId === c.id ? (
                  <div className="flex flex-1 items-center gap-1.5">
                    <Input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="h-8"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && editValue.trim()) {
                          updateCategory(c.id, editValue.trim())
                          setEditingId(null)
                        }
                      }}
                    />
                    <Button
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        if (editValue.trim()) updateCategory(c.id, editValue.trim())
                        setEditingId(null)
                      }}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingId(null)}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 text-sm text-ink">
                      <Tag className="h-3.5 w-3.5 text-muted" />
                      {c.name}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => {
                          setEditingId(c.id)
                          setEditValue(c.name)
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-expense" onClick={() => setDeleting(c)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(v) => !v && setDeleting(null)}
        title="Xóa danh mục?"
        description={
          deleting && usedCount(deleting.id) > 0
            ? `"${deleting.name}" đang được dùng trong ${usedCount(deleting.id)} giao dịch. Các giao dịch này sẽ không còn danh mục.`
            : `"${deleting?.name}" sẽ bị xóa.`
        }
        onConfirm={() => deleting && deleteCategory(deleting.id)}
      />
    </>
  )
}
