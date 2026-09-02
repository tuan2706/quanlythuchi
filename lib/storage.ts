import type { AppData } from '@/types'
import { buildDefaultCategories } from './categories'
import { buildSampleData } from './sample-data'

// ---------------------------------------------------------------------
// Persistence layer — IndexedDB (was localStorage before).
// Whole AppData is still kept as a single JSON-able record; only the
// storage engine changed, so IndexedDB gives us a much larger quota
// (hundreds of MB+ depending on the device, vs ~5-10MB for localStorage)
// without needing to touch any of the app's calculation/CRUD logic.
// ---------------------------------------------------------------------

const DB_NAME = 'so-thu-chi-db'
const DB_VERSION = 1
const STORE_NAME = 'app-data'
const RECORD_KEY = 'main'

// Old key, kept only so we can migrate anyone updating from the
// localStorage-based version without losing their data.
const LEGACY_LOCALSTORAGE_KEY = 'so-thu-chi.data.v1'

const CURRENT_VERSION = 1

export function emptyAppData(): AppData {
  return {
    version: CURRENT_VERSION,
    transactions: [],
    categories: buildDefaultCategories(),
    loans: [],
    loanPayments: [],
    budgets: [],
    goals: [],
    recurring: [],
    confirmedRecurringStamps: [],
    accounts: [],
    creditCards: [],
    cardTransactions: [],
    cardPayments: [],
    settings: {
      theme: 'dark',
      currency: 'VND',
      usdRate: 26000,
    },
  }
}

function withDefaults(parsed: Partial<AppData>): AppData {
  return {
    ...emptyAppData(),
    ...parsed,
    settings: { ...emptyAppData().settings, ...parsed.settings },
  }
}

/**
 * One-time, additive migration for people updating from a version before the
 * "Tài khoản" (Account) feature existed: creates a default "Tiền mặt" account
 * and backfills it onto any transaction that doesn't have one yet. Never
 * deletes or overwrites anything — only fills in the new field.
 */
function migrateAccounts(data: AppData): AppData {
  if (data.accounts.length > 0) return data

  const hasUntaggedTx = data.transactions.some((t) => !t.accountId)
  if (!hasUntaggedTx && data.transactions.length > 0) return data
  if (data.transactions.length === 0) return data

  const defaultAccount = {
    id: 'default-cash-' + Date.now().toString(36),
    name: 'Tiền mặt',
    type: 'cash' as const,
    icon: 'banknote',
    color: '#34D399',
    initialBalance: 0,
    createdAt: Date.now(),
  }

  return {
    ...data,
    accounts: [defaultAccount],
    transactions: data.transactions.map((t) => (t.accountId ? t : { ...t, accountId: defaultAccount.id })),
  }
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB không khả dụng trên trình duyệt này'))
      return
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

function idbGet(db: IDBDatabase, key: string): Promise<AppData | undefined> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const req = tx.objectStore(STORE_NAME).get(key)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

function idbPut(db: IDBDatabase, key: string, value: AppData): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).put(value, key)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

function idbClear(db: IDBDatabase): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).clear()
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

/** One-time migration: pull data out of the old localStorage key (if any) and delete it once safely copied over. */
function readLegacyLocalStorage(): AppData | null {
  try {
    const raw = localStorage.getItem(LEGACY_LOCALSTORAGE_KEY)
    if (!raw) return null
    return withDefaults(JSON.parse(raw))
  } catch {
    return null
  }
}

export async function loadAppData(): Promise<AppData> {
  try {
    const db = await openDB()
    const existing = await idbGet(db, RECORD_KEY)
    if (existing) {
      const migrated = migrateAccounts(withDefaults(existing))
      if (migrated !== existing) await idbPut(db, RECORD_KEY, migrated)
      return migrated
    }

    // Nothing in IndexedDB yet — check for data from the old localStorage version.
    const legacy = readLegacyLocalStorage()
    if (legacy) {
      const migrated = migrateAccounts(legacy)
      await idbPut(db, RECORD_KEY, migrated)
      localStorage.removeItem(LEGACY_LOCALSTORAGE_KEY)
      return migrated
    }

    // Brand new install: seed with sample data so the app isn't empty.
    const seeded = buildSampleData()
    await idbPut(db, RECORD_KEY, seeded)
    return seeded
  } catch (err) {
    console.error('Không thể tải dữ liệu từ IndexedDB', err)
    return readLegacyLocalStorage() || emptyAppData()
  }
}

export async function saveAppData(data: AppData): Promise<void> {
  try {
    const db = await openDB()
    await idbPut(db, RECORD_KEY, data)
  } catch (err) {
    console.error('Không thể lưu dữ liệu vào IndexedDB', err)
  }
}

export async function clearAppData(): Promise<AppData> {
  const fresh = emptyAppData()
  try {
    const db = await openDB()
    await idbClear(db)
    await idbPut(db, RECORD_KEY, fresh)
  } catch (err) {
    console.error('Không thể xóa dữ liệu trong IndexedDB', err)
  }
  return fresh
}
