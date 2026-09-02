import type { AppData, Transaction } from '@/types'
import { uid } from './utils'

// xlsx (SheetJS) is a fairly large library — load it lazily so it never bloats
// the initial bundle of any page, only fetched when the user actually exports/imports.
async function loadXlsx() {
  return await import('xlsx')
}

function txRows(data: AppData) {
  return data.transactions
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((t) => ({
      'Ngày': t.date,
      'Loại': t.type === 'income' ? 'Thu' : 'Chi',
      'Số tiền': t.amount,
      'Danh mục': t.type === 'expense' ? data.categories.find((c) => c.id === t.categoryId)?.name || '' : '',
      'Ghi chú': t.note,
    }))
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function loanPaymentRows(data: AppData, loanId: string) {
  const loan = data.loans.find((l) => l.id === loanId)
  return data.loanPayments
    .filter((p) => p.loanId === loanId)
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((p) => ({
      'Ngày': p.date,
      'Khoản vay': loan?.name || '',
      'Tiền gốc': p.principalPaid,
      'Tiền lãi': p.interestPaid,
      'Phí': p.feePaid,
      'Tổng thanh toán': p.totalPaid,
      'Phương thức': p.method,
      'Ghi chú': p.note,
    }))
}

export async function exportLoanPaymentsExcel(data: AppData, loanId: string) {
  const loan = data.loans.find((l) => l.id === loanId)
  const XLSX = await loadXlsx()
  const ws = XLSX.utils.json_to_sheet(loanPaymentRows(data, loanId))
  ws['!cols'] = [{ wch: 12 }, { wch: 20 }, { wch: 14 }, { wch: 14 }, { wch: 12 }, { wch: 14 }, { wch: 14 }, { wch: 30 }]
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Lịch sử thanh toán')
  XLSX.writeFile(wb, `lich-su-thanh-toan-${loan?.name || 'khoan-vay'}-${new Date().toISOString().slice(0, 10)}.xlsx`)
}

export async function exportLoanPaymentsCsv(data: AppData, loanId: string) {
  const loan = data.loans.find((l) => l.id === loanId)
  const XLSX = await loadXlsx()
  const ws = XLSX.utils.json_to_sheet(loanPaymentRows(data, loanId))
  const csv = XLSX.utils.sheet_to_csv(ws)
  downloadBlob(
    new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }),
    `lich-su-thanh-toan-${loan?.name || 'khoan-vay'}-${new Date().toISOString().slice(0, 10)}.csv`,
  )
}

export async function exportExcel(data: AppData) {
  const XLSX = await loadXlsx()
  const ws = XLSX.utils.json_to_sheet(txRows(data))
  ws['!cols'] = [{ wch: 12 }, { wch: 8 }, { wch: 14 }, { wch: 16 }, { wch: 30 }]
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Giao dịch')
  XLSX.writeFile(wb, `so-thu-chi-${new Date().toISOString().slice(0, 10)}.xlsx`)
}

export async function exportCsv(data: AppData) {
  const XLSX = await loadXlsx()
  const ws = XLSX.utils.json_to_sheet(txRows(data))
  const csv = XLSX.utils.sheet_to_csv(ws)
  downloadBlob(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }), `so-thu-chi-${new Date().toISOString().slice(0, 10)}.csv`)
}

export function exportBackupJson(data: AppData) {
  downloadBlob(
    new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }),
    `so-thu-chi-backup-${new Date().toISOString().slice(0, 10)}.json`,
  )
}

export async function importBackupJson(file: File): Promise<AppData> {
  const text = await file.text()
  const parsed = JSON.parse(text)
  if (!parsed || !Array.isArray(parsed.transactions)) {
    throw new Error('File sao lưu không hợp lệ')
  }
  return parsed as AppData
}

/** Import transactions from a CSV/Excel file matching the exported column layout, merging into existing data. */
export async function importTransactionsSheet(file: File, data: AppData): Promise<Transaction[]> {
  const XLSX = await loadXlsx()
  const buf = await file.arrayBuffer()
  const wb = XLSX.read(buf, { type: 'array' })
  const sheet = wb.Sheets[wb.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { raw: true })

  const catByName = new Map(data.categories.map((c) => [c.name.trim().toLowerCase(), c.id]))

  const imported: Transaction[] = []
  for (const row of rows) {
    const dateRaw = row['Ngày'] ?? row['Date'] ?? row['ngay']
    const typeRaw = String(row['Loại'] ?? row['Type'] ?? '').trim().toLowerCase()
    const amountRaw = row['Số tiền'] ?? row['Amount'] ?? row['so tien']
    const noteRaw = row['Ghi chú'] ?? row['Note'] ?? ''
    const catRaw = String(row['Danh mục'] ?? row['Category'] ?? '').trim()

    if (!dateRaw || amountRaw === undefined) continue

    let date: string
    if (typeof dateRaw === 'number') {
      const parsed = XLSX.SSF.parse_date_code(dateRaw)
      date = `${parsed.y}-${String(parsed.m).padStart(2, '0')}-${String(parsed.d).padStart(2, '0')}`
    } else {
      date = String(dateRaw).slice(0, 10)
    }

    const type: Transaction['type'] = typeRaw.startsWith('thu') || typeRaw.startsWith('in') ? 'income' : 'expense'
    const amount = Number(String(amountRaw).replace(/[^\d.-]/g, '')) || 0
    if (amount <= 0) continue

    imported.push({
      id: uid(),
      date,
      type,
      amount,
      categoryId: type === 'expense' ? catByName.get(catRaw.toLowerCase()) : undefined,
      note: String(noteRaw || ''),
      createdAt: Date.now(),
    })
  }
  return imported
}
