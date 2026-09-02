import { useRef, useState } from 'react'
import { FileSpreadsheet, FileDown, FileUp, Save, Upload, Trash2, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useFinance } from '@/context/FinanceContext'
import { exportExcel, exportCsv, exportBackupJson, importBackupJson, importTransactionsSheet } from '@/lib/export-import'

export function DataManagementCard() {
  const { data, importTransactions, replaceAll, resetAll } = useFinance()
  const backupInputRef = useRef<HTMLInputElement>(null)
  const sheetInputRef = useRef<HTMLInputElement>(null)
  const [resetOpen, setResetOpen] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const notify = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 4000)
  }

  const handleRestoreBackup = async (file: File) => {
    try {
      const restored = await importBackupJson(file)
      replaceAll(restored)
      notify('success', 'Đã khôi phục dữ liệu từ file sao lưu.')
    } catch (e) {
      notify('error', 'File sao lưu không hợp lệ, vui lòng kiểm tra lại.')
    }
  }

  const handleImportSheet = async (file: File) => {
    try {
      const txs = await importTransactionsSheet(file, data)
      if (txs.length === 0) {
        notify('error', 'Không tìm thấy giao dịch hợp lệ trong file.')
        return
      }
      importTransactions(txs)
      notify('success', `Đã nhập ${txs.length} giao dịch từ file.`)
    } catch (e) {
      notify('error', 'Không thể đọc file. Hãy dùng file xuất từ chính ứng dụng này.')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dữ liệu</CardTitle>
        <CardDescription>Xuất, nhập và sao lưu dữ liệu — mọi thứ lưu ngay trên thiết bị của bạn.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {message && (
          <div
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
              message.type === 'success' ? 'bg-income/10 text-income' : 'bg-expense/10 text-expense'
            }`}
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            {message.text}
          </div>
        )}

        <div>
          <p className="mb-2 text-sm font-medium text-ink">Xuất giao dịch</p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => exportExcel(data)}>
              <FileSpreadsheet className="h-3.5 w-3.5" /> Xuất Excel
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportCsv(data)}>
              <FileDown className="h-3.5 w-3.5" /> Xuất CSV
            </Button>
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-ink">Nhập giao dịch (Excel / CSV)</p>
          <Button variant="outline" size="sm" onClick={() => sheetInputRef.current?.click()}>
            <FileUp className="h-3.5 w-3.5" /> Chọn file để nhập
          </Button>
          <input
            ref={sheetInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) handleImportSheet(f)
              e.target.value = ''
            }}
          />
          <p className="mt-1.5 text-xs text-muted">File cần có các cột: Ngày, Loại, Số tiền, Danh mục, Ghi chú (giống file xuất ra).</p>
        </div>

        <div className="border-t border-border pt-4">
          <p className="mb-2 text-sm font-medium text-ink">Sao lưu toàn bộ dữ liệu</p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => exportBackupJson(data)}>
              <Save className="h-3.5 w-3.5" /> Sao lưu (.json)
            </Button>
            <Button variant="outline" size="sm" onClick={() => backupInputRef.current?.click()}>
              <Upload className="h-3.5 w-3.5" /> Khôi phục từ file
            </Button>
          </div>
          <input
            ref={backupInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) handleRestoreBackup(f)
              e.target.value = ''
            }}
          />
          <p className="mt-1.5 text-xs text-muted">Khôi phục sẽ thay thế toàn bộ dữ liệu hiện tại bằng dữ liệu trong file sao lưu.</p>
        </div>

        <div className="border-t border-border pt-4">
          <p className="mb-2 text-sm font-medium text-expense">Vùng nguy hiểm</p>
          <Button variant="destructive" size="sm" onClick={() => setResetOpen(true)}>
            <Trash2 className="h-3.5 w-3.5" /> Xóa toàn bộ dữ liệu
          </Button>
        </div>
      </CardContent>

      <ConfirmDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title="Xóa toàn bộ dữ liệu?"
        description="Tất cả giao dịch, khoản vay, ngân sách và mục tiêu sẽ bị xóa vĩnh viễn và không thể khôi phục. Hãy sao lưu trước nếu cần."
        confirmLabel="Xóa toàn bộ"
        onConfirm={() => {
          resetAll()
          notify('success', 'Đã xóa toàn bộ dữ liệu.')
        }}
      />
    </Card>
  )
}
