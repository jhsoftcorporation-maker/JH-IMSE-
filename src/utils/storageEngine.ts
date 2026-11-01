/**
 * JH IMSE Persistent Storage & Data Lifecycle Engine
 * Handles LocalStorage persistence, multi-tenant isolation, clean production slate,
 * data export/import, and controlled factory reset.
 */

const STORAGE_PREFIX = 'jhimse_v2_';

export interface StoreDataStats {
  productsCount: number;
  salesCount: number;
  customersCount: number;
  suppliersCount: number;
  employeesCount: number;
  expensesCount: number;
  quotationsCount: number;
  transfersCount: number;
  storageUsageKb: number;
  isCleanProduction: boolean;
}

/**
 * Checks whether the first-time setup installer has completed.
 */
export function isSystemInstalled(): boolean {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(STORAGE_PREFIX + 'installed') === 'true';
}

/**
 * Marks the system installation status.
 */
export function markSystemInstalled(installed: boolean = true): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_PREFIX + 'installed', installed ? 'true' : 'false');
}

/**
 * Checks whether the platform is in Clean Production Slate mode (0 fake tenants, 0 fake sales).
 */
export function isCleanProductionMode(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_PREFIX + 'clean_slate') === 'true';
}

/**
 * Sets Clean Production Slate mode.
 */
export function setCleanProductionMode(clean: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_PREFIX + 'clean_slate', clean ? 'true' : 'false');
}

/**
 * Retrieves persisted data or returns the default fallback.
 */
export function getPersistedData<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`[StorageEngine] Failed to read ${key}:`, err);
    return defaultValue;
  }
}

/**
 * Saves data securely to localStorage.
 */
export function setPersistedData<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
  } catch (err) {
    console.error(`[StorageEngine] Failed to persist ${key}:`, err);
  }
}

/**
 * Removes a specific persisted key.
 */
export function removePersistedData(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_PREFIX + key);
  } catch (err) {
    console.error(`[StorageEngine] Failed to remove ${key}:`, err);
  }
}

/**
 * Calculates current storage statistics for a tenant.
 */
export function getTenantDataStats(
  tenantId: string,
  products: any[],
  sales: any[],
  customers: any[],
  suppliers: any[],
  employees: any[],
  expenses: any[],
  quotations: any[],
  transfers: any[]
): StoreDataStats {
  let totalBytes = 0;
  try {
    if (typeof window !== 'undefined') {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.includes(tenantId)) {
          const val = localStorage.getItem(k);
          if (val) totalBytes += val.length * 2; // ~2 bytes per char
        }
      }
    }
  } catch {
    // Ignore
  }

  const tenantProducts = products.filter(p => !p.tenantId || p.tenantId === tenantId);
  const tenantSales = sales.filter(s => !s.tenantId || s.tenantId === tenantId);

  return {
    productsCount: tenantProducts.length,
    salesCount: tenantSales.length,
    customersCount: customers.filter(c => !c.tenantId || c.tenantId === tenantId).length,
    suppliersCount: suppliers.filter(s => !s.tenantId || s.tenantId === tenantId).length,
    employeesCount: employees.filter(e => !e.tenantId || e.tenantId === tenantId).length,
    expensesCount: expenses.filter(ex => !ex.tenantId || ex.tenantId === tenantId).length,
    quotationsCount: quotations.filter(q => !q.tenantId || q.tenantId === tenantId).length,
    transfersCount: transfers.filter(t => !t.tenantId || t.tenantId === tenantId).length,
    storageUsageKb: Math.max(12, Math.round(totalBytes / 1024)),
    isCleanProduction: tenantSales.length === 0,
  };
}

/**
 * Exports all data for a specific tenant as a structured JSON object.
 */
export function exportTenantBackupJSON(tenantId: string, allData: Record<string, any>): string {
  const backupObject = {
    app: 'JH_IMSE_V2',
    version: '2.0.0',
    tenantId,
    exportedAt: new Date().toISOString(),
    payload: allData,
  };
  return JSON.stringify(backupObject, null, 2);
}

/**
 * Triggers a browser download of the backup JSON file.
 */
export function downloadBackupFile(fileName: string, jsonString: string): void {
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
