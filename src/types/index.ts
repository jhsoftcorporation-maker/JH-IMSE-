export type BusinessType = 'grocery' | 'pharmacy' | 'electronics' | 'warehouse';

export type UserRole = 'super_admin' | 'owner' | 'manager' | 'cashier';

export interface TenantFeatures {
  pos: boolean;
  ecommerce: boolean;
  crm: boolean;
  hrm: boolean;
  ai: boolean;
  pharmacyBatch: boolean;
  imeiWarranty: boolean;
  multiWarehouse: boolean;
  accounting?: boolean;
  commissions?: boolean;
  serviceMaintenance?: boolean;
  assets?: boolean;
  projects?: boolean;
  peoplePortal?: boolean;
  analytics3d?: boolean;
  subscriptions?: boolean;
  globalCommerce?: boolean;
  whatsappLoyalty?: boolean;
  hardwareSuite?: boolean;
  integrations?: boolean;
}

export type PlanTier = 'trial' | 'starter' | 'professional' | 'enterprise';
export type TenantStatus = 'active' | 'suspended' | 'grace_period' | 'expired';

export interface TenantQuota {
  maxBranches: number;
  maxUsers: number;
  maxProducts: number;
  maxMonthlyInvoices: number;
  storageGb: number;
}

export interface TenantUsage {
  currentBranches: number;
  currentUsers: number;
  currentProducts: number;
  currentMonthlyInvoices: number;
  currentStorageMb: number;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  businessType: BusinessType;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  logo?: string;
  currency: string;
  plan: PlanTier;
  status: TenantStatus;
  subscriptionExpiry: string;
  monthlyFee: number;
  billingCycle?: 'monthly' | 'yearly';
  licenseKey?: string;
  tradeLicenseNo?: string;
  taxVatNo?: string;
  customDomain?: string;
  storeNotice?: string;
  storeBannerText?: string;
  insideDhakaDeliveryFee?: number;
  outsideDhakaDeliveryFee?: number;
  nidNumber?: string;
  selectedModule?: 'ecommerce' | 'erp_pos' | 'hrm' | 'crm' | 'all_in_one';
  isPosLocked?: boolean;
  posLockReason?: string;
  posTerminalMode?: 'desktop' | 'handheld_mobile';
  customDomainDnsStatus?: 'connected' | 'pending' | 'ssl_active' | 'custom_host';
  // A-to-Z POS Fleet Control Settings per Tenant
  posSettings?: {
    allowDueSale: boolean;
    allowCashierDiscount: boolean;
    maxDiscountPercent: number;
    allowNegativeStock: boolean;
    autoPrintThermal: boolean;
    audioBeep: boolean;
    requireCustomerPhone: boolean;
    allowHoldCart: boolean;
  };
  storeThemeColor?: string;
  themePrimaryColor?: string;
  sidebarLayout?: 'sidebar-1' | 'sidebar-2';
  isDarkMode?: boolean;
  isRTL?: boolean;
  storeDescription?: string;
  storeAnnouncement?: string;
  quotas: TenantQuota;
  usage: TenantUsage;
  features: TenantFeatures;
  createdAt: string;
}

export interface GlobalPlatformSettings {
  platformName: string;
  platformTitleBengali: string;
  platformSubtitleBengali: string;
  helplinePhone: string;
  supportEmail: string;
  officeAddress: string;
  maintenanceMode: boolean;
  globalAnnouncement: string;
  fleetPosLockdown: boolean;
  allowRegistration: boolean;
  defaultTrialDays: number;
  defaultCurrency: string;
  hostingerCnameTarget: string;
  offlinePwaEnabled: boolean;
  smsGateway: {
    provider: string;
    apiToken: string;
    senderId: string;
    apiUrl: string;
  };
  emailSmtp: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
    fromName: string;
    fromEmail: string;
  };
  courierConfig: {
    steadfastApiKey: string;
    steadfastSecret: string;
    redxToken: string;
    pathaoClientId: string;
    pathaoSecret: string;
  };
  mysqlConfig: {
    host: string;
    port: number;
    database: string;
    user: string;
    connected: boolean;
  };
}

export interface SubscriptionPackage {
  id: string;
  name: string;
  tier: PlanTier;
  monthlyPrice: number;
  yearlyPrice: number;
  description: string;
  badge?: string;
  popular?: boolean;
  quotas: TenantQuota;
  includedFeatures: string[];
}

export interface SubscriptionTransaction {
  id: string;
  tenantId: string;
  tenantName: string;
  plan: PlanTier;
  amount: number;
  paymentMethod: 'bKash' | 'Nagad' | 'Rocket' | 'Bank Transfer' | 'Card';
  trxId: string;
  date: string;
  billingCycle: 'monthly' | 'yearly';
  status: 'paid' | 'pending' | 'failed';
  invoiceNumber: string;
}

export interface CustomDomainRequest {
  id: string;
  tenantId: string;
  tenantName: string;
  domain: string;
  cnameTarget: string;
  requestedDate: string;
  status: 'active' | 'pending' | 'rejected';
  sslStatus: 'secured' | 'provisioning' | 'failed';
}

export interface BroadcastNotice {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'maintenance' | 'critical';
  target: 'all' | 'pharmacy' | 'grocery' | 'electronics' | 'enterprise';
  createdAt: string;
  active: boolean;
}

export interface LicenseKeyItem {
  id: string;
  key: string;
  tenantId: string;
  tenantName: string;
  plan: PlanTier;
  durationMonths: number;
  generatedAt: string;
  expiresAt: string;
  status: 'active' | 'redeemed' | 'revoked';
  maxBranches: number;
  maxUsers: number;
}

export interface ProductVariant {
  id: string;
  name: string; // e.g. "500gm", "1kg", "Red-XL"
  sku: string;
  priceDelta: number;
  stock: number;
}

export interface StockAdjustment {
  id: string;
  productId: string;
  productName: string;
  type: 'addition' | 'subtraction' | 'damage' | 'expired' | 'audit';
  quantity: number;
  reason: string;
  adjustedBy: string;
  createdAt: string;
}

export interface Product {
  id: string;
  tenantId: string;
  name: string;
  sku: string;
  category: string;
  costPrice: number;
  sellingPrice: number;
  wholesalePrice?: number;
  stock: number;
  alertStock: number;
  unit: string;
  image?: string;
  showInOnlineStore: boolean;
  warehouseId: string;
  warehouseStock?: Record<string, number>; // Mapping from warehouseId to quantity at that location
  variants?: ProductVariant[];
  // Pharmacy specific
  expiryDate?: string;
  batchNumber?: string;
  genericName?: string;
  dosageForm?: string; // Tablet, Capsule, Syrup, Drop, Injection
  manufacturer?: string; // e.g., Square Pharmaceuticals, Beximco, Incepta
  rackNumber?: string; // e.g., Rack A-3
  darNumber?: string; // Drug Administration Registration No
  // Electronics specific
  imeiNumbers?: string[];
  warrantyMonths?: number;
  brand?: string;
  modelNumber?: string;
  // Warehouse & Wholesale specific
  moq?: number; // Minimum Order Quantity
  masterCartonSize?: number;
  // Phase 17: Product Hierarchy & UOM extensions
  brandId?: string;
  subCategoryId?: string;
  unitId?: string;
  purchaseUnitId?: string;
  openingStock?: number;
  openingCost?: number;
}

export interface Category {
  id: string;
  tenantId: string;
  name: string;
  icon?: string;
  description?: string;
}

// Phase 17: Product Hierarchy Domain Models
export interface Brand {
  id: string;
  tenantId: string;
  name: string;
  code?: string;
  logo?: string;
  website?: string;
  originCountry?: string;
  description?: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface SubCategory {
  id: string;
  tenantId: string;
  categoryId: string;
  categoryName?: string;
  name: string;
  code?: string;
  description?: string;
  createdAt: string;
}

export interface UnitOfMeasure {
  id: string;
  tenantId: string;
  name: string; // e.g. "Box", "Carton", "Kilogram", "Dozen"
  shortName: string; // e.g. "box", "ctn", "kg", "doz", "pcs"
  baseUnit?: string; // e.g. "pcs", "gm"
  operator?: '*' | '/'; // e.g. 1 Box = 12 * pcs
  operationValue?: number; // e.g. 12
  isBaseUnit?: boolean;
  createdAt: string;
}

export interface OpeningStockEntry {
  id: string;
  tenantId: string;
  warehouseId: string;
  warehouseName?: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitCost: number;
  subtotalCost: number;
  batchNumber?: string;
  expiryDate?: string;
  entryDate: string;
  note?: string;
  status: 'posted' | 'draft';
}

export type LabelPaperFormat = 'a4_24' | 'a4_30' | 'roll_50x30' | 'roll_40x25';
export type BarcodeSymbology = 'CODE128' | 'EAN13' | 'QR';

export interface BarcodeLabelConfig {
  format: LabelPaperFormat;
  symbology: BarcodeSymbology;
  includeProductName: boolean;
  includeBrand: boolean;
  includeSKU: boolean;
  includePrice: boolean;
  includeExpiry: boolean;
  includeBusinessName: boolean;
  copiesPerProduct: number;
}

export interface BulkUpdateItem {
  sku: string;
  name?: string;
  costPrice?: number;
  sellingPrice?: number;
  stock?: number;
  stockAction?: 'replace' | 'add';
  status: 'success' | 'not_found' | 'error';
  message: string;
}

export interface BulkUpdateSummary {
  totalRows: number;
  updatedCount: number;
  notFoundCount: number;
  skippedCount: number;
  items: BulkUpdateItem[];
}

export type WarehouseType = 'cdc' | 'retail_branch' | 'regional_hub' | 'dark_store';

export interface Warehouse {
  id: string;
  tenantId: string;
  name: string;
  location: string;
  isMain: boolean;
  code?: string; // e.g. CDC-01, BR-DHK-02
  type?: WarehouseType;
  contactPerson?: string;
  phone?: string;
  email?: string;
  capacitySqFt?: number;
  status?: 'active' | 'inactive' | 'renovating';
}

export interface SaleItem {
  productId: string;
  productName: string;
  sku: string;
  price: number;
  costPrice: number;
  quantity: number;
  subtotal: number;
  imei?: string;
  batchNumber?: string;
  unit?: string;
}

export interface Sale {
  id: string;
  invoiceNumber: string;
  tenantId: string;
  warehouseId: string;
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  items: SaleItem[];
  subtotal: number;
  tax: number;
  discount: number;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  changeAmount: number;
  paymentMethod: 'cash' | 'bkash' | 'nagad' | 'card' | 'credit';
  transactionId?: string;
  pricingType?: 'retail' | 'wholesale';
  invoiceStatus?: 'paid' | 'partial' | 'due' | 'returned';
  cashierId: string;
  cashierName: string;
  createdAt: string;
  status: 'completed' | 'returned';
  loyaltyPointsUsed?: number;
  loyaltyDiscountBDT?: number;
  loyaltyPointsEarned?: number;
  whatsAppStatus?: 'not_sent' | 'sent' | 'delivered' | 'read';
}

export interface QuotationItem {
  productId: string;
  productName: string;
  sku: string;
  rate: number;
  quantity: number;
  unit: string;
  subtotal: number;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  tenantId: string;
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  items: QuotationItem[];
  subtotal: number;
  tax: number;
  discount: number;
  totalAmount: number;
  validUntil: string;
  status: 'sent' | 'accepted' | 'declined' | 'expired' | 'converted';
  notes?: string;
  createdAt: string;
}

export interface DeliveryChallanItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unit: string;
  packType?: string; // Cartons, Sacks, Packs
}

export interface DeliveryChallan {
  id: string;
  challanNumber: string;
  tenantId: string;
  invoiceNumber: string;
  customerName: string;
  customerPhone?: string;
  deliveryAddress: string;
  transportName: string; // e.g., Sundarban, SA Paribahan, RedX, Own Delivery
  vehicleNumber?: string;
  driverName?: string;
  driverPhone?: string;
  items: DeliveryChallanItem[];
  status: 'dispatched' | 'delivered' | 'pending';
  dispatchDate: string;
  notes?: string;
  createdAt: string;
}

export interface CreditNoteItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  condition: 'good' | 'damaged'; // If good, restock to inventory
}

export interface CreditNote {
  id: string;
  creditNoteNumber: string;
  tenantId: string;
  originalInvoiceNumber: string;
  customerId?: string;
  customerName: string;
  items: CreditNoteItem[];
  totalRefundAmount: number;
  reason: string;
  refundMethod: 'cash' | 'adjust_due' | 'wallet';
  createdAt: string;
}

export interface HoldCart {
  id: string;
  note: string;
  createdAt: string;
  items: { product: Product; quantity: number }[];
  customerId?: string;
  discountAmount: number;
  taxPercent: number;
  pricingType: 'retail' | 'wholesale';
}

export type LoyaltyTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'vip';
export type CustomerType = 'retail' | 'wholesale' | 'corporate' | 'distributor';

export interface CustomerTransaction {
  id: string;
  customerId: string;
  date: string;
  type: 'invoice' | 'payment' | 'credit_note' | 'opening_balance';
  referenceNo: string;
  description: string;
  debit: number; // Increases due
  credit: number; // Decreases due (payment or return)
  balance: number; // Balance after this transaction
  paymentMethod?: 'cash' | 'bkash' | 'nagad' | 'bank';
  note?: string;
}

export interface CustomerPaymentReceipt {
  id: string;
  receiptNumber: string;
  tenantId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  amount: number;
  discount: number;
  paymentMethod: 'cash' | 'bkash' | 'nagad' | 'bank';
  transactionId?: string;
  bankName?: string;
  previousDue: number;
  remainingDue: number;
  date: string;
  collectedBy: string;
  note?: string;
}

export interface Customer {
  id: string;
  tenantId: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  company?: string;
  totalSpent: number;
  dueAmount: number;
  creditLimit?: number; // e.g. 10000 (0 or undefined for no limit)
  loyaltyTier?: LoyaltyTier;
  loyaltyPoints?: number;
  customerType?: CustomerType;
  purchaseCount: number;
  lastPurchased: string;
  notes?: string;
  transactions?: CustomerTransaction[];
  // Phase 23: People Management & Client Portal
  hasLoginAccount?: boolean;
  portalUsername?: string;
  portalPassword?: string;
  portalStatus?: 'active' | 'suspended' | 'invited';
  tradeLicenseNo?: string;
  inviteCodeUsed?: string;
  companyVatBin?: string;
  lastPortalLogin?: string;
}

export type EmployeeRole = 'owner' | 'manager' | 'cashier' | 'accountant' | 'auditor' | 'sales_rep';
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'half_day' | 'on_leave';

export interface Employee {
  id: string;
  tenantId: string;
  name: string;
  phone: string;
  email: string;
  designation?: string;
  role: EmployeeRole;
  warehouseId?: string;
  nid?: string;
  emergencyPhone?: string;
  address?: string;
  salary: number; // basic salary
  allowance?: number;
  salesTarget?: number; // Target monthly sales
  salesCommissionRate: number; // percentage
  salesThisMonth: number;
  attendanceToday: AttendanceStatus;
  clockInTime?: string;
  clockOutTime?: string;
  status?: 'active' | 'inactive' | 'on_leave';
  joinedDate: string;
  avatar?: string;
}

export interface AttendanceRecord {
  id: string;
  tenantId: string;
  employeeId: string;
  employeeName: string;
  designation?: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  clockIn?: string;
  clockOut?: string;
  workingHours?: number;
  overtimeHours?: number;
  notes?: string;
}

export interface RolePermission {
  roleId: string;
  roleName: string;
  roleNameBn: string;
  description: string;
  isSystem?: boolean;
  permissions: {
    posBilling: boolean;
    posDiscount: boolean;
    posPriceOverride: boolean;
    posHoldCart: boolean;
    inventoryView: boolean;
    inventoryManage: boolean;
    stockTransfer: boolean;
    customerView: boolean;
    customerDueCollect: boolean;
    customerCreditLimit: boolean;
    sendSmsReminder: boolean;
    quotationsManage: boolean;
    challansManage: boolean;
    creditNotesManage: boolean;
    financialReports: boolean;
    hrmManage: boolean;
    payrollManage: boolean;
    settingsManage: boolean;
  };
}

export interface SalarySlip {
  id: string;
  slipNumber: string;
  tenantId: string;
  employeeId: string;
  employeeName: string;
  designation: string;
  phone: string;
  department?: string;
  month: string;
  payPeriod: string;
  basicSalary: number;
  houseRentAllowance: number;
  conveyanceAllowance: number;
  medicalAllowance: number;
  salesAchieved: number;
  salesTarget: number;
  salesCommissionRate: number;
  salesCommission: number;
  overtimeHours: number;
  overtimeRate: number;
  overtimeAmount: number;
  grossEarnings: number;
  absentDays: number;
  absentDeduction: number;
  advanceDeduction: number;
  providentFund: number;
  totalDeductions: number;
  netPayable: number;
  paymentMethod: 'cash' | 'bkash' | 'bank';
  paymentDate: string;
  status: 'paid' | 'pending';
  note?: string;
}

export interface OnlineOrder {
  id: string;
  orderNumber: string;
  tenantId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerEmail?: string;
  items: {
    productId: string;
    productName: string;
    price: number;
    quantity: number;
    unit?: string;
    sku?: string;
  }[];
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  deliveryArea: 'inside_dhaka' | 'outside_dhaka' | 'store_pickup' | 'pickup';
  paymentMethod: 'cod' | 'bkash' | 'nagad' | 'rocket' | 'bank';
  paymentStatus: 'paid' | 'unpaid' | 'cod';
  transactionId?: string;
  senderPhone?: string;
  courierPartner?: 'steadfast' | 'redx' | 'pathao' | 'in_house';
  courierTrackingId?: string;
  courierStatus?: 'pending_pickup' | 'in_transit' | 'delivered' | 'returned';
  customerNotes?: string;
  status: 'pending' | 'accepted' | 'confirmed' | 'packing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
}

export interface SubscriptionPaymentRequest {
  id: string;
  tenantId: string;
  tenantName: string;
  ownerName: string;
  ownerPhone: string;
  plan: PlanTier;
  amount: number;
  billingCycle: 'monthly' | 'yearly';
  paymentMethod: 'bKash' | 'Nagad' | 'Rocket' | 'Bank Transfer';
  senderPhone: string;
  trxId: string;
  screenshotUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  adminNotes?: string;
}

export interface AdminPaymentAccounts {
  bkashNumber: string;
  bkashType: 'merchant' | 'personal';
  nagadNumber: string;
  nagadType: 'merchant' | 'personal';
  rocketNumber: string;
  bankName: string;
  bankAccountName: string;
  bankAccountNumber: string;
  bankBranch: string;
  paymentInstructions: string;
}

export interface AIInsight {
  id: string;
  type: 'restock' | 'dead_stock' | 'sales_trend' | 'profit_boost';
  title: string;
  message: string;
  severity: 'high' | 'medium' | 'info';
  actionableText: string;
}

// ==========================================
// PHASE 6: FINANCIAL OVERVIEW, EXPENSES & SUPPLIERS
// ==========================================

export type ExpenseCategory = 
  | 'rent' 
  | 'utilities' 
  | 'salaries' 
  | 'food_entertainment' 
  | 'transport_courier' 
  | 'marketing' 
  | 'maintenance' 
  | 'packaging' 
  | 'tax_trade_license' 
  | 'other';

export interface ExpenseItem {
  id: string;
  tenantId: string;
  voucherNo: string;
  date: string;
  category: ExpenseCategory;
  title: string;
  description?: string;
  amount: number;
  paymentMethod: 'cash' | 'bkash' | 'nagad' | 'bank';
  referenceNo?: string;
  paidTo?: string;
  approvedBy: string;
  receiptImage?: string;
  createdAt: string;
}

export interface Supplier {

  id: string;
  tenantId: string;
  name: string;
  companyName: string;
  phone: string;
  email?: string;
  address: string;
  category: string;
  tradeLicenseNo?: string;
  bankAccountDetails?: string;
  totalPurchases: number;
  totalPaid: number;
  dueBalance: number;
  status: 'active' | 'inactive';
  createdAt: string;
  transactions?: SupplierTransaction[];
}

export interface SupplierTransaction {
  id: string;
  supplierId: string;
  date: string;
  type: 'purchase_bill' | 'payment' | 'purchase_return';
  referenceNo: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
  paymentMethod?: 'cash' | 'bkash' | 'nagad' | 'bank';
  note?: string;
}

export interface SupplierPurchaseOrder {
  id: string;
  tenantId: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  supplierPhone?: string;
  date: string;
  items: {
    productId?: string;
    productName: string;
    sku?: string;
    unitPrice: number;
    quantity: number;
    total: number;
    batchNumber?: string;
    expiryDate?: string;
  }[];
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  paymentMethod: 'cash' | 'bkash' | 'nagad' | 'bank' | 'due';
  status: 'received' | 'ordered' | 'cancelled';
  note?: string;
  receivedBy: string;
  createdAt: string;
}

export interface SupplierPayment {
  id: string;
  tenantId: string;
  paymentVoucherNo: string;
  supplierId: string;
  supplierName: string;
  supplierPhone?: string;
  date: string;
  amount: number;
  paymentMethod: 'cash' | 'bkash' | 'nagad' | 'bank';
  transactionId?: string;
  remainingDue: number;
  note?: string;
  paidBy: string;
  createdAt: string;
}

export interface CashBookEntry {
  id: string;
  tenantId: string;
  date: string;
  type: 'cash_in' | 'cash_out';
  source: 'sale' | 'due_collection' | 'expense' | 'supplier_payment' | 'capital_in' | 'drawings';
  referenceNo: string;
  description: string;
  amount: number;
  paymentMethod: 'cash' | 'bkash' | 'nagad' | 'bank';
  balance: number;
}

// ==========================================
// PHASE 10: AUTOMATED DOUBLE-ENTRY ACCOUNTING, COA & FINANCIAL AUDIT
// ==========================================


export type AccountCategory = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';

export type AccountClassification = 
  | 'current_asset' 
  | 'fixed_asset' 
  | 'other_asset'
  | 'current_liability' 
  | 'long_term_liability' 
  | 'equity' 
  | 'operating_revenue' 
  | 'non_operating_revenue' 
  | 'cost_of_goods_sold' 
  | 'operating_expense' 
  | 'administrative_expense'
  | 'tax_expense';

export interface ChartOfAccount {
  id: string;
  tenantId: string;
  code: string; // e.g. "1010", "1020", "2010"
  name: string; // e.g. "ক্যাশ ইন হ্যান্ড (Cash in Hand)"
  nameBn: string;
  category: AccountCategory;
  classification: AccountClassification;
  balance: number;
  normalBalance: 'debit' | 'credit';
  isSystem: boolean;
  description?: string;
  parentCode?: string;
}

export interface JournalEntryLine {
  id: string;
  accountId: string;
  accountCode: string;
  accountName: string;
  description?: string;
  debit: number;
  credit: number;
}

export interface JournalEntry {
  id: string;
  tenantId: string;
  entryNumber: string; // e.g. "JV-2026-001"
  date: string; // YYYY-MM-DD
  description: string;
  referenceType: 'sale' | 'purchase' | 'supplier_payment' | 'due_collection' | 'expense' | 'bank_transfer' | 'manual_jv' | 'payroll' | 'opening_balance' | 'depreciation' | 'asset_disposal' | 'asset_purchase';
  referenceId?: string;
  lines: JournalEntryLine[];
  totalDebit: number;
  totalCredit: number;
  status: 'posted' | 'draft' | 'void';
  createdBy: string;
  createdAt: string;
  notes?: string;
}

export interface BankReconciliationItem {
  id: string;
  tenantId: string;
  bankAccountId: string;
  bankAccountName: string;
  date: string;
  description: string;
  referenceNo: string;
  bookAmount: number;
  bankAmount: number;
  type: 'deposit_in_transit' | 'outstanding_cheque' | 'bank_fee' | 'interest_earned' | 'matched';
  status: 'reconciled' | 'pending' | 'discrepancy';
  reconciledDate?: string;
  notes?: string;
}

export interface TrialBalanceRow {
  accountCode: string;
  accountName: string;
  category: AccountCategory;
  debitTotal: number;
  creditTotal: number;
  netDebit: number;
  netCredit: number;
}

export interface BalanceSheetReport {
  asOfDate: string;
  currentAssets: { code: string; name: string; amount: number }[];
  fixedAssets: { code: string; name: string; amount: number }[];
  totalAssets: number;
  currentLiabilities: { code: string; name: string; amount: number }[];
  longTermLiabilities: { code: string; name: string; amount: number }[];
  totalLiabilities: number;
  equity: { code: string; name: string; amount: number }[];
  retainedEarnings: number;
  totalEquity: number;
  totalLiabilitiesAndEquity: number;
  isBalanced: boolean;
}

export interface CashFlowReport {
  period: string;
  operatingActivities: { item: string; amount: number }[];
  totalOperatingCashFlow: number;
  investingActivities: { item: string; amount: number }[];
  totalInvestingCashFlow: number;
  financingActivities: { item: string; amount: number }[];
  totalFinancingCashFlow: number;
  netCashFlow: number;
  beginningCash: number;
  endingCash: number;
}

// ==========================================
// PHASE 11: MULTI-BRANCH LOGISTICS & CENTRAL WAREHOUSE
// ==========================================

export type RequisitionUrgency = 'normal' | 'urgent' | 'critical';
export type RequisitionStatus = 'draft' | 'submitted' | 'approved' | 'in_transit' | 'completed' | 'rejected';

export interface RequisitionItem {
  productId: string;
  productName: string;
  sku: string;
  requestedQty: number;
  approvedQty: number;
  unitCost: number;
  unit: string;
  currentStockAtBranch: number;
  currentStockAtCDC: number;
}

export interface BranchRequisition {
  id: string;
  tenantId: string;
  requisitionNo: string; // e.g. "RO-DHK-0042"
  fromBranchId: string;
  fromBranchName: string;
  toWarehouseId: string;
  toWarehouseName: string;
  requestedBy: string;
  status: RequisitionStatus;
  urgency: RequisitionUrgency;
  notes?: string;
  items: RequisitionItem[];
  totalEstimatedValue: number;
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
}

export type TransferStatus = 'dispatched' | 'in_transit' | 'received' | 'discrepancy';

export interface TransferChallanItem {
  productId: string;
  productName: string;
  sku: string;
  unit: string;
  unitCost: number;
  dispatchedQty: number;
  receivedQty?: number;
  damagedQty?: number;
  damageReason?: string;
  batchNumber?: string;
}

export interface StockTransferChallan {
  id: string;
  tenantId: string;
  transferNo: string; // e.g. "TR-2026-0089"
  requisitionId?: string;
  requisitionNo?: string;
  sourceWarehouseId: string;
  sourceWarehouseName: string;
  destinationBranchId: string;
  destinationBranchName: string;
  driverName: string;
  driverPhone: string;
  vehicleNo: string;
  totalItems: number;
  totalCostValue: number;
  status: TransferStatus;
  items: TransferChallanItem[];
  dispatchedAt: string;
  dispatchedBy: string;
  receivedAt?: string;
  receivedBy?: string;
  notes?: string;
  grnNo?: string; // Goods Receive Note Number e.g. "GRN-2026-0045"
  gatepassBarcode?: string;
  journalEntryId?: string;
}

export interface BranchPerformanceMetric {
  branchId: string;
  branchName: string;
  branchCode: string;
  branchType: string;
  location: string;
  managerName: string;
  totalSales: number;
  totalOrders: number;
  inventoryValue: number;
  stockCount: number;
  lowStockItemsCount: number;
  requisitionCount: number;
  transitIncomingCount: number;
}

// ==========================================
// PHASE 12: AI AUTONOMOUS DEMAND FORECASTING & AUTO-PO
// ==========================================

export type DemandRiskLevel = 'critical' | 'warning' | 'optimal' | 'overstocked' | 'dead_stock';

export interface AIDemandForecast {
  productId: string;
  productName: string;
  sku: string;
  category: string;
  currentStock: number;
  salesVelocity: number; // Daily average units sold (V)
  daysOfInventoryRemaining: number; // DIR
  runOutDate: string; // Projected date when stock hits 0
  leadTimeDays: number; // Supplier lead time in days
  safetyStock: number; // SS
  reorderPoint: number; // Dynamic ROP
  recommendedOrderQty: number; // Recommended Reorder Quantity
  riskLevel: DemandRiskLevel;
  preferredSupplierId?: string;
  preferredSupplierName?: string;
  stockoutImpactEstimatedLoss: number; // Revenue risk if out of stock
  aiReasoning: string;
  urgencyText: string;
}

export interface AutoPurchaseOrderItem {
  productId: string;
  productName: string;
  sku: string;
  currentStock: number;
  velocityDaily: number;
  daysRemaining: number;
  recommendedQty: number;
  orderQty: number;
  unitCost: number;
  totalCost: number;
  unit: string;
}

export interface AutoPurchaseOrder {
  id: string;
  tenantId: string;
  autoPoNumber: string; // e.g. "PO-2026-AUTO-001"
  supplierId: string;
  supplierName: string;
  supplierPhone?: string;
  supplierEmail?: string;
  status: 'draft' | 'approved' | 'sent_whatsapp' | 'sent_email' | 'received' | 'cancelled';
  generatedDate: string;
  approvedDate?: string;
  items: AutoPurchaseOrderItem[];
  totalAmount: number;
  urgency: 'critical' | 'high' | 'normal';
  aiGeneratedReason: string;
  notes?: string;
  deliveryExpectedDate?: string;
}

export interface SeasonalDemandTrend {
  id: string;
  seasonName: string;
  seasonNameBn: string;
  targetCategories: string[];
  expectedDemandSurgePct: number;
  peakPeriod: string;
  recommendedPrepDays: number;
  recommendedAction: string;
  highDemandProducts: {
    productId: string;
    productName: string;
    currentStock: number;
    recommendedStockBuffer: number;
  }[];
}

export interface DeadStockLiquidationItem {
  productId: string;
  productName: string;
  sku: string;
  category: string;
  currentStock: number;
  tiedUpCapital: number;
  costPrice: number;
  sellingPrice: number;
  daysWithoutSale: number;
  suggestedDiscountPct: number;
  suggestedSalePrice: number;
  projectedCapitalRecovery: number;
  promotionalHook: string;
}

// ==========================================
// PHASE 13: GLOBAL PAYMENTS & MULTI-CURRENCY FOREX ENGINE
// ==========================================

export type CurrencyCode = 'BDT' | 'USD' | 'EUR' | 'GBP' | 'AED' | 'SAR';

export interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  nameEn: string;
  nameBn: string;
  country: string;
  flag: string;
  decimalDigits: number;
  isBaseCurrency: boolean;
}

export interface ExchangeRateRecord {
  id: string;
  fromCurrency: CurrencyCode;
  toCurrency: CurrencyCode; // Usually 'BDT'
  rate: number; // 1 fromCurrency in BDT (e.g., 121.50)
  inverseRate: number; // 1 BDT in fromCurrency (e.g., 0.00823)
  buyRate: number; // Bank buying rate (e.g., 120.80)
  sellRate: number; // Bank selling rate (e.g., 122.20)
  spreadPct: number; // Spread %
  change24hPct: number; // Daily price movement %
  lastUpdated: string;
  source: 'bangladesh_bank' | 'open_exchange_rates' | 'manual';
}

export type GatewayKey = 'stripe' | 'paypal' | 'apple_pay' | 'google_pay' | 'bkash' | 'sslcommerz';

export interface PaymentGatewayConfig {
  id: string;
  gatewayKey: GatewayKey;
  name: string;
  nameBn: string;
  icon: string;
  isEnabled: boolean;
  mode: 'sandbox' | 'production';
  supportedCurrencies: CurrencyCode[];
  publishableKey: string;
  secretKeyMasked: string;
  webhookSecretMasked: string;
  transactionFeePct: number;
  fixedFee: number;
  scaCompliant: boolean; // 3D Secure 2.0
  description: string;
  lastWebhookPing?: string;
  webhookStatus?: 'healthy' | 'warning' | 'error';
}

export interface CrossBorderTaxSlab {
  id: string;
  countryCode: string; // 'BD', 'US', 'GB', 'EU', 'AE', 'SA'
  countryName: string;
  countryNameBn: string;
  taxType: 'vat' | 'sales_tax' | 'gst' | 'mushak_6_3';
  standardRatePct: number;
  reducedRatePct?: number;
  exportRatePct: number; // 0% for exports
  tdsRatePct?: number; // Withholding tax
  reverseChargeApplicable: boolean;
  taxAuthority: string; // NBR, HMRC, IRS, FTA, ZATCA
  notes: string;
}

export interface CrossBorderTransaction {
  id: string;
  tenantId: string;
  transactionNo: string; // e.g. "GLB-2026-0091"
  customerName: string;
  customerCountry: string;
  customerEmail: string;
  gateway: 'stripe' | 'paypal' | 'apple_pay';
  currency: CurrencyCode;
  foreignAmount: number;
  exchangeRate: number; // Booking rate
  baseAmountBDT: number;
  settlementExchangeRate: number; // Realized settlement rate
  settlementAmountBDT: number;
  forexGainLossBDT: number; // (+) Gain or (-) Loss
  gatewayFeeBDT: number;
  netAmountBDT: number;
  status: 'succeeded' | 'pending' | 'failed' | 'refunded';
  paymentIntentId: string;
  cardLast4?: string;
  cardBrand?: 'visa' | 'mastercard' | 'amex';
  threeDSecureAuthenticated: boolean;
  date: string;
  notes?: string;
  journalEntryPosted: boolean;
}

// ============================================================================
// PHASE 14: OMNICHANNEL WHATSAPP BOT & LOYALTY REWARDS
// ============================================================================
export type WhatsAppMessageStatus = 'queued' | 'sent' | 'delivered' | 'read' | 'failed';

export type WhatsAppTemplateType = 
  | 'pos_invoice' 
  | 'due_reminder' 
  | 'order_dispatch' 
  | 'loyalty_upgrade' 
  | 'catalog_inquiry' 
  | 'custom_broadcast';

export interface WhatsAppMessageLog {
  id: string;
  tenantId: string;
  recipientName: string;
  recipientPhone: string;
  templateType: WhatsAppTemplateType;
  messageText: string;
  status: WhatsAppMessageStatus;
  timestamp: string;
  pdfUrl?: string;
  quickReplyActions?: string[];
  costBDT: number;
  errorMessage?: string;
}

export interface WhatsAppConfig {
  id: string;
  tenantId: string;
  phoneNumberId: string;
  businessAccountId: string;
  apiAccessToken: string;
  webhookVerifyToken: string;
  isActive: boolean;
  autoSendOnPOSSale: boolean;
  autoSendDueReminderDays: number;
  defaultGreetingBn: string;
  verifiedBusinessName: string;
  phoneDisplay: string;
  appSecret: string;
  catalogSyncEnabled: boolean;
}

export interface LoyaltyPointTransaction {
  id: string;
  tenantId: string;
  customerId: string;
  customerName: string;
  type: 'earned' | 'redeemed' | 'bonus' | 'tier_upgrade';
  points: number;
  amountBDT: number;
  referenceInvoiceNo?: string;
  date: string;
  notes?: string;
}

export interface LoyaltyTierConfig {
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  nameBn: string;
  minSpendBDT: number;
  maxSpendBDT: number;
  pointsPerHundredBDT: number; // e.g. 1, 1.5, 2.0, 3.0
  discountPct: number; // e.g. 0%, 2%, 3%, 5%
  perks: string[];
  badgeColor: string;
  badgeTextColor: string;
  bgGradient: string;
  iconName: string;
}

export interface WhatsAppChatMessage {
  id: string;
  sender: 'user' | 'bot' | 'agent';
  text: string;
  timestamp: string;
  quickReplies?: string[];
  actionLink?: { title: string; url: string };
  mediaType?: 'pdf' | 'image' | 'catalog';
  mediaUrl?: string;
}

// ============================================================================
// PHASE 15: SUNMI & IMIN HARDWARE INTEGRATION & SMART POS SUITE
// ============================================================================
export type PrinterConnectionType = 'usb' | 'bluetooth' | 'network_tcp' | 'serial' | 'browser_direct';
export type PrinterPaperWidth = '58mm' | '80mm';

export interface ThermalPrinterConfig {
  id: string;
  tenantId: string;
  name: string; // e.g. "Sunmi V2s Built-in Thermal", "Xprinter XP-N160II Network", "Epson TM-T88VI USB"
  connectionType: PrinterConnectionType;
  paperWidth: PrinterPaperWidth;
  ipAddress?: string;
  port?: number; // 9100 default
  bluetoothDeviceId?: string;
  autoCut: boolean;
  openDrawerOnCash: boolean;
  isDefault: boolean;
  density: 'light' | 'normal' | 'dark';
  banglaBitmapSupport: boolean;
  status: 'connected' | 'disconnected' | 'out_of_paper';
}

export interface ElectronicCashDrawerConfig {
  id: string;
  tenantId: string;
  enabled: boolean;
  kickCommandHex: string; // "1B 70 00 19 FA" (ESC p 0 25 250)
  pulseDurationMs: number;
  pinNumber: 2 | 5;
  testKickCount: number;
  lastKickedAt?: string;
}

export interface DigitalWeighingScaleConfig {
  id: string;
  tenantId: string;
  enabled: boolean;
  portName: string; // e.g. "COM3", "/dev/ttyUSB0", "WebSerial USB"
  baudRate: number; // 9600, 4800, 19200
  dataBits: number; // 8
  stopBits: number; // 1
  parity: 'none' | 'even' | 'odd';
  currentWeightKg: number;
  tareWeightKg: number;
  isStable: boolean;
  autoAddToCart: boolean;
  status: 'connected' | 'disconnected' | 'streaming';
}

export interface CustomerFacingDisplayConfig {
  id: string;
  tenantId: string;
  isEnabled: boolean;
  mode: 'idle' | 'live_cart' | 'payment_qr' | 'thank_you';
  welcomeTitle: string;
  bannerNotice: string;
  showBkashQr: boolean;
  showNagadQr: boolean;
  bkashMerchantNumber: string;
  nagadMerchantNumber: string;
  secondScreenWindowOpen: boolean;
}

export interface SunmiHardwareDeviceStatus {
  model: string; // e.g. "Sunmi V2s Pro", "Sunmi T2s Dual-Screen", "iMin D4-504"
  osVersion: string; // "Sunmi OS 3.2 (Android 11)"
  serialNumber: string;
  batteryLevelPct: number;
  isCharging: boolean;
  thermalHeadTempC: number;
  paperRollState: 'ok' | 'paper_low' | 'out_of_paper';
  cutterStatus: 'ok' | 'jammed';
  nfcReaderAvailable: boolean;
  scannerEngine: '1d_laser' | '2d_cmos_imager';
  lastHealthCheck: string;
}

// ============================================================================
// PHASE 18: RETURNS MANAGEMENT (RMA), DAMAGES & PHYSICAL STOCK COUNT AUDIT
// ============================================================================

export type PurchaseReturnReason = 'expired' | 'damaged' | 'wrong_item' | 'quality_defect' | 'excess_delivery';

export interface PurchaseReturnItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  batchNumber?: string;
  reason: PurchaseReturnReason;
}

export interface PurchaseReturn {
  id: string;
  debitNoteNumber: string; // e.g. "PR-2026-001"
  tenantId: string;
  supplierId: string;
  supplierName: string;
  supplierPhone?: string;
  originalPoNumber?: string;
  warehouseId?: string;
  warehouseName?: string;
  items: PurchaseReturnItem[];
  totalRefundAmount: number;
  settlementMethod: 'deduct_from_due' | 'cash_refund' | 'bank_transfer';
  reason: string;
  status: 'draft' | 'approved' | 'dispatched';
  dispatchDate: string;
  returnedBy: string;
  note?: string;
  createdAt: string;
}

export type DamageReason = 
  | 'expired' 
  | 'broken_in_transit' 
  | 'water_pest_damage' 
  | 'manufacturing_defect' 
  | 'testing_wastage' 
  | 'storage_spoilage';

export interface DamageLogItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number; // cost price
  lossAmount: number; // qty * costPrice
  batchNumber?: string;
  expiryDate?: string;
  reason: DamageReason;
}

export interface DamageLog {
  id: string;
  damageVoucherNumber: string; // e.g. "DMG-2026-001"
  tenantId: string;
  warehouseId: string;
  warehouseName: string;
  date: string;
  items: DamageLogItem[];
  totalLossAmount: number;
  reportedBy: string;
  approvedBy: string;
  disposalMethod: 'discarded' | 'recycled' | 'returned_for_scrap' | 'quarantine';
  notes?: string;
  status: 'pending_review' | 'approved_written_off';
  createdAt: string;
}

export interface StockCountItem {
  productId: string;
  productName: string;
  sku: string;
  category: string;
  unit?: string;
  systemStock: number; // Expected count in software
  countedStock: number; // Physical count by auditor
  varianceQty: number; // countedStock - systemStock (+ surplus, - shortage)
  costPrice: number;
  varianceAmount: number; // varianceQty * costPrice
  status: 'matched' | 'surplus' | 'shortage';
  notes?: string;
}

export interface StockCountAudit {
  id: string;
  auditNumber: string; // e.g. "AUD-2026-001"
  tenantId: string;
  warehouseId: string;
  warehouseName: string;
  title: string;
  auditDate: string;
  categoryFilter?: string;
  items: StockCountItem[];
  totalSystemItems: number;
  totalCountedItems: number;
  totalSurplusQty: number;
  totalShortageQty: number;
  totalFinancialVariance: number;
  auditedBy: string;
  status: 'in_progress' | 'completed' | 'reconciled';
  reconciledAt?: string;
  reconciledBy?: string;
  notes?: string;
  createdAt: string;
}

// ============================================================================
// PHASE 19: MULTI-TIER SALES AGENT COMMISSION PROGRAM & RULE ENGINE
// ============================================================================

export type CommissionCalculationType = 
  | 'percentage_of_sales' 
  | 'percentage_of_profit' 
  | 'tiered_volume' 
  | 'flat_per_unit';

export interface CommissionRule {
  id: string;
  tenantId: string;
  programId: string;
  name: string;
  condition: 'min_sales_amount' | 'brand_specific' | 'category_specific' | 'new_customer_bonus';
  threshold: number; // e.g. sales > 50,000
  brandName?: string;
  categoryName?: string;
  rewardType: 'rate_boost_pct' | 'fixed_bonus_bdt';
  rewardValue: number; // e.g. +1.5% boost or ৳2000 bonus
  description?: string;
  isActive: boolean;
}

export interface CommissionProgram {
  id: string;
  tenantId: string;
  title: string;
  code: string; // e.g. "REP-TIER-01"
  description: string;
  calculationType: CommissionCalculationType;
  baseRatePercent: number; // e.g. 3.0%
  targetBonusAmount: number; // e.g. 5000 BDT
  monthlyTargetThreshold: number; // e.g. 100,000 BDT
  eligibleBrands?: string[];
  eligibleCategories?: string[];
  rules: CommissionRule[];
  status: 'active' | 'archived';
  createdAt: string;
}

export interface SalesAgent {
  id: string;
  tenantId: string;
  name: string;
  phone: string;
  email: string;
  nationalId?: string;
  territory: string; // e.g. "ধানমন্ডি ও লালমাটিয়া জোন"
  programId: string;
  programTitle: string;
  monthlyTargetSales: number;
  currentMonthSales: number;
  earnedCommission: number;
  paidCommission: number;
  dueCommission: number;
  performanceRating?: 'top_performer' | 'on_track' | 'needs_improvement';
  status: 'active' | 'inactive';
  joinedDate: string;
  notes?: string;
}

export interface CommissionReceipt {
  id: string;
  receiptNumber: string; // e.g. "CMP-2026-001"
  tenantId: string;
  agentId: string;
  agentName: string;
  agentPhone: string;
  territory: string;
  periodStart: string;
  periodEnd: string;
  totalSalesAchieved: number;
  baseCommissionAmount: number;
  bonusAmount: number;
  taxDeduction: number; // TDS / AIT
  netPayable: number;
  paidAmount: number;
  paymentMethod: 'cash' | 'bkash' | 'nagad' | 'bank';
  transactionReference?: string;
  payoutStatus: 'paid' | 'partial' | 'pending';
  approvedBy: string;
  paidAt?: string;
  notes?: string;
  createdAt: string;
}

// ============================================================================
// PHASE 20: SERVICE, REPAIR JOBS & MAINTENANCE MANAGEMENT (AMC / WARRANTY)
// ============================================================================

export type ServiceJobStatus = 
  | 'received' 
  | 'in_diagnosis' 
  | 'waiting_for_parts' 
  | 'in_repair' 
  | 'ready_for_qa' 
  | 'completed' 
  | 'delivered' 
  | 'cancelled';

export type ServiceJobPriority = 'low' | 'normal' | 'high' | 'urgent';

export type ServiceWarrantyStatus = 
  | 'under_warranty' 
  | 'out_of_warranty' 
  | 'shop_guarantee' 
  | 'amc_covered';

export interface ServiceJobPartItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface ServiceJobTicket {
  id: string;
  ticketNumber: string; // e.g. "JOB-2026-001"
  tenantId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress?: string;
  deviceType: string; // e.g. Smartphone, Laptop, Tablet, Desktop, Printer, AC/Appliance, Vehicle
  brand: string;
  model: string;
  imeiOrSerial: string;
  deviceColor?: string;
  securityLockType: 'none' | 'pin_pattern' | 'password';
  securityCode?: string;
  accessoriesReceived: string[]; // e.g. ["Charger", "SIM Tray", "Protective Case", "Box", "Power Cable"]
  reportedIssues: string; // Customer complaint
  diagnosticNotes?: string; // Technician findings
  assignedTechnicianId?: string;
  assignedTechnicianName?: string;
  priority: ServiceJobPriority;
  status: ServiceJobStatus;
  estimatedCost: number;
  laborCost: number;
  partsCost: number;
  discount: number;
  totalCost: number; // laborCost + partsCost - discount
  advancePaid: number;
  dueAmount: number; // totalCost - advancePaid
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  warrantyStatus: ServiceWarrantyStatus;
  partsUsed: ServiceJobPartItem[];
  intakeDate: string;
  expectedDeliveryDate: string;
  completedDate?: string;
  deliveredDate?: string;
  checklistReportId?: string;
  customerSignature?: string;
  technicianNotes?: string;
  createdAt: string;
}

export type ChecklistCategory = 
  | 'Display & Touch'
  | 'Battery & Power'
  | 'Audio & Microphone'
  | 'Cameras'
  | 'Connectivity & Network'
  | 'Biometrics & Sensors'
  | 'Housing & Ports';

export interface ChecklistItem {
  id: string;
  category: ChecklistCategory;
  name: string;
  status: 'pass' | 'fail' | 'na';
  notes?: string;
}

export interface InspectionChecklist {
  id: string;
  ticketId: string;
  ticketNumber: string;
  tenantId: string;
  inspectionType: 'pre_repair_intake' | 'post_repair_qa';
  inspectorName: string;
  inspectionDate: string;
  items: ChecklistItem[];
  overallResult: 'passed' | 'passed_with_issues' | 'failed';
  technicianRemarks?: string;
  customerConfirmed: boolean;
  createdAt: string;
}

export type MaintenanceContractTier = 'standard' | 'silver' | 'gold' | 'enterprise_24_7';
export type MaintenanceFrequency = 'monthly' | 'quarterly' | 'bi_annual' | 'annual';
export type MaintenanceContractStatus = 'active' | 'expiring_soon' | 'expired' | 'renewed' | 'terminated';

export interface CoveredEquipmentItem {
  id: string;
  name: string;
  brand: string;
  model: string;
  serialNumber: string;
  location?: string;
}

export interface MaintenanceVisitLog {
  id: string;
  visitDate: string;
  technicianName: string;
  servicePerformed: string;
  partsReplaced?: string;
  status: 'completed' | 'rescheduled' | 'pending';
  rating?: number;
  customerRemarks?: string;
}

export interface MaintenanceContract {
  id: string;
  contractNumber: string; // e.g. "AMC-2026-101"
  tenantId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  title: string;
  tier: MaintenanceContractTier;
  frequency: MaintenanceFrequency;
  startDate: string;
  endDate: string;
  contractAmount: number;
  paidAmount: number;
  paymentStatus: 'paid' | 'partial' | 'due';
  totalVisitsAllowed: number;
  visitsCompleted: number;
  nextScheduledDate: string;
  status: MaintenanceContractStatus;
  coveredEquipment: CoveredEquipmentItem[];
  visitLogs: MaintenanceVisitLog[];
  autoReminderSms: boolean;
  notes?: string;
  createdAt: string;
}

export type WarrantyType = 'brand_official' | 'shop_replacement' | 'service_warranty' | 'extended';
export type WarrantyClaimStatus = 
  | 'verifying' 
  | 'accepted_in_warranty' 
  | 'sent_to_vendor' 
  | 'replaced_new' 
  | 'repaired_free' 
  | 'rejected_void' 
  | 'closed';

export interface WarrantyRecord {
  id: string;
  tenantId: string;
  imeiOrSerial: string;
  productName: string;
  brand: string;
  model: string;
  invoiceNumber: string;
  customerName: string;
  customerPhone: string;
  purchaseDate: string;
  warrantyDurationMonths: number;
  warrantyExpiryDate: string;
  warrantyType: WarrantyType;
  status: 'active' | 'expired' | 'claimed' | 'voided';
  claimsCount: number;
  notes?: string;
  createdAt: string;
}

export interface WarrantyClaim {
  id: string;
  claimNumber: string; // e.g. "WAR-2026-001"
  tenantId: string;
  warrantyId?: string;
  imeiOrSerial: string;
  productName: string;
  brand: string;
  customerName: string;
  customerPhone: string;
  claimDate: string;
  defectDescription: string;
  claimStatus: WarrantyClaimStatus;
  vendorName?: string;
  vendorRmaNo?: string;
  rejectionReason?: string;
  resolutionDate?: string;
  replacementSerialNo?: string;
  technicianNotes?: string;
  createdAt: string;
}

// ==========================================
// PHASE 21: FIXED ASSET MANAGEMENT, DEPRECIATION (SLM/WDV) & MAINTENANCE
// ==========================================

export type AssetCategory = 
  | 'furniture_fixtures' 
  | 'it_computer' 
  | 'pos_hardware' 
  | 'machinery_equipment' 
  | 'vehicles' 
  | 'office_appliances' 
  | 'medical_equipment' 
  | 'leasehold_improvements' 
  | 'other';

export type DepreciationMethod = 'SLM' | 'WDV' | 'NO_DEPRECIATION';

export type AssetCondition = 
  | 'brand_new' 
  | 'good' 
  | 'fair' 
  | 'needs_repair' 
  | 'damaged' 
  | 'disposed';

export type AssetStatus = 
  | 'in_service' 
  | 'under_maintenance' 
  | 'idle_storage' 
  | 'fully_depreciated' 
  | 'disposed';

export type AssetDisposalType = 
  | 'sold' 
  | 'scrapped' 
  | 'lost_stolen' 
  | 'donated' 
  | 'traded_in';

export interface AssetMaintenanceRecord {
  id: string;
  assetId: string;
  assetCode: string;
  maintenanceDate: string; // YYYY-MM-DD
  maintenanceType: 'preventive' | 'corrective_repair' | 'upgrade' | 'inspection';
  serviceProvider: string;
  technicianPhone?: string;
  invoiceBillNo?: string;
  cost: number;
  description: string;
  partsReplaced?: string;
  performedBy: string;
  nextScheduledDate?: string;
  createdAt: string;
}

export interface DepreciationScheduleItem {
  year: number;
  fiscalYear: string; // e.g. "2026-2027"
  openingBookValue: number;
  depreciationRate: number;
  depreciationAmount: number;
  accumulatedDepreciation: number;
  closingBookValue: number;
  isPosted?: boolean;
  journalVoucherNo?: string;
}

export interface AssetDisposal {
  id: string;
  assetId: string;
  assetCode: string;
  disposalDate: string;
  disposalType: AssetDisposalType;
  saleProceeds: number; // Cash/Bank amount received
  bookValueAtDisposal: number;
  accumulatedDepreciationAtDisposal: number;
  originalCost: number;
  gainOrLoss: number; // positive = gain, negative = loss
  buyerOrScrapDealer?: string;
  contactPhone?: string;
  reason: string;
  approvedBy: string;
  journalVoucherNo?: string;
  createdAt: string;
}

export interface FixedAsset {
  id: string;
  assetCode: string; // e.g. "AST-2026-001"
  tenantId: string;
  name: string;
  category: AssetCategory;
  modelNo?: string;
  serialOrBarcode: string;
  purchaseDate: string; // YYYY-MM-DD
  vendorOrSupplier: string;
  vendorInvoiceNo?: string;
  originalCost: number;
  salvageValue: number;
  usefulLifeYears: number;
  depreciationMethod: DepreciationMethod;
  depreciationRatePercentage: number;
  accumulatedDepreciation: number;
  currentBookValue: number;
  location: string;
  department: string;
  custodianName: string;
  custodianPhone?: string;
  condition: AssetCondition;
  status: AssetStatus;
  warrantyExpiryDate?: string;
  lastMaintenanceDate?: string;
  totalMaintenanceCost: number;
  disposal?: AssetDisposal;
  qrCodeData?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// PHASE 22: PROJECTS, TASKS KANBAN, CONTRACTS & APPOINTMENT BOOKINGS
// ==========================================

export type ProjectStatus = 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
export type ProjectPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface ProjectMilestone {
  id: string;
  title: string;
  dueDate: string;
  amount: number;
  status: 'pending' | 'in_progress' | 'achieved' | 'cancelled';
  achievedDate?: string;
  deliverable: string;
}

export interface Project {
  id: string;
  projectCode: string; // e.g. "PRJ-2026-001"
  tenantId: string;
  title: string;
  description: string;
  clientId: string;
  clientName: string;
  clientPhone?: string;
  clientCompany?: string;
  managerId: string;
  managerName: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  startDate: string; // YYYY-MM-DD
  targetEndDate: string; // YYYY-MM-DD
  actualEndDate?: string;
  budgetAmount: number;
  actualCost: number;
  billingAmount: number;
  paidAmount: number;
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  progressPercent: number; // 0 to 100
  milestones: ProjectMilestone[];
  tags?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type TaskKanbanColumn = 'todo' | 'in_progress' | 'in_review' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface TaskChecklistItem {
  id: string;
  title: string;
  completed: boolean;
}

export interface ProjectTask {
  id: string;
  taskCode: string; // e.g. "TSK-101"
  tenantId: string;
  projectId?: string;
  projectName?: string;
  title: string;
  description?: string;
  column: TaskKanbanColumn;
  priority: TaskPriority;
  assignedEmployeeId: string;
  assignedEmployeeName: string;
  dueDate: string;
  estimatedHours: number;
  spentHours: number;
  checklists: TaskChecklistItem[];
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export type ContractCategory = 
  | 'corporate_supply' 
  | 'service_sla' 
  | 'vendor_distribution' 
  | 'franchise_license' 
  | 'nda_mou';

export type ContractPartyType = 'client' | 'supplier' | 'partner';

export type ContractPaymentTerms = 
  | 'milestone_based' 
  | 'monthly_retainer' 
  | 'advance_full' 
  | 'net_30' 
  | 'custom';

export type ContractStatus = 'draft' | 'active' | 'expiring_soon' | 'expired' | 'terminated';

export interface ContractClause {
  id: string;
  title: string;
  content: string;
}

export interface CommercialContract {
  id: string;
  contractNumber: string; // e.g. "CNT-2026-001"
  tenantId: string;
  title: string;
  category: ContractCategory;
  partyType: ContractPartyType;
  partyId?: string;
  partyName: string;
  partyContact: string;
  partyEmail?: string;
  partyAddress?: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  contractValue: number;
  paymentTerms: ContractPaymentTerms;
  status: ContractStatus;
  autoRenew: boolean;
  renewalNoticeDays: number;
  clauses: ContractClause[];
  signedByTenant: string;
  signedByParty: string;
  signedDate?: string;
  notes?: string;
  documentUrl?: string;
  createdAt: string;
}

export type BookingServiceType = 
  | 'consultation' 
  | 'installation' 
  | 'maintenance_visit' 
  | 'product_demo' 
  | 'custom_tailoring';

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
export type BookingPaymentStatus = 'paid' | 'pending' | 'waived';
export type BookingLocationType = 'on_site' | 'in_store' | 'virtual_meeting';

export interface AppointmentBooking {
  id: string;
  bookingNumber: string; // e.g. "BKG-2026-001"
  tenantId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerId?: string;
  serviceType: BookingServiceType;
  bookingDate: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "10:30 AM - 11:30 AM"
  assignedStaffName: string;
  assignedStaffId?: string;
  locationType: BookingLocationType;
  locationDetails?: string;
  fee: number;
  paymentStatus: BookingPaymentStatus;
  status: BookingStatus;
  notes?: string;
  smsReminderSent: boolean;
  createdAt: string;
}

// ============================================================================
// PHASE 23: PEOPLE MANAGEMENT, CLIENT SELF-SERVICE PORTAL & INVITED CUSTOMERS
// ============================================================================

export interface B2BInviteCode {
  id: string;
  tenantId: string;
  code: string; // e.g. "WHOLESALE2026", "VIP-CORP-88"
  description?: string;
  tier: CustomerType; // 'wholesale' | 'corporate' | 'distributor' | 'retail'
  discountPct: number; // e.g. 10% wholesale discount
  defaultCreditLimit: number; // e.g. 50000 BDT
  maxRedemptions: number;
  timesRedeemed: number;
  validUntil: string;
  status: 'active' | 'expired' | 'disabled';
  createdAt: string;
}

export interface PendingCustomerApplication {
  id: string;
  tenantId: string;
  applicationNo: string; // e.g. "APP-2026-001"
  businessName: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  customerType: CustomerType;
  tradeLicenseNo?: string;
  binTaxNo?: string;
  requestedCreditLimit: number;
  inviteCodeUsed?: string;
  appliedDate: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdCustomerId?: string;
}

export interface ClientPortalDuePaymentClaim {
  id: string;
  tenantId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  amount: number;
  paymentMethod: 'bkash' | 'nagad' | 'bank' | 'rocket';
  transactionId: string;
  depositSlipImage?: string;
  bankAccountDetails?: string;
  status: 'submitted' | 'verified_approved' | 'rejected';
  submittedAt: string;
  note?: string;
}

// ==========================================
// PHASE 24: 3D DASHBOARD, CASH REGISTER SHIFT REPORTS & ANALYTICAL INTELLIGENCE
// ==========================================

export interface CashDenominationBreakdown {
  note1000?: number;
  note500?: number;
  note200?: number;
  note100?: number;
  note50?: number;
  note20?: number;
  note10?: number;
  coins?: number;
}

export interface CashRegisterAdjustment {
  id: string;
  type: 'cash_in' | 'cash_out';
  amount: number;
  reason: string;
  timestamp: string;
  performedBy: string;
}

export interface CashRegisterShift {
  id: string;
  tenantId: string;
  warehouseId: string;
  registerName: string; // e.g. "Counter-01 (Main POS)"
  cashierId: string;
  cashierName: string;
  openedAt: string; // ISO
  closedAt?: string; // ISO or undefined if active
  status: 'open' | 'closed';
  openingCash: number;
  totalCashSales: number;
  totalDigitalSales: number; // bKash, card, nagad
  totalReturnsRefunded: number;
  totalExpensesPaid: number;
  cashAdded: number; // petty cash injection
  cashRemoved: number; // safe drop
  expectedClosingCash: number;
  actualClosingCash?: number;
  cashDifference?: number; // actual - expected
  totalTransactionsCount: number;
  notes?: string;
  denominations?: CashDenominationBreakdown;
  adjustments?: CashRegisterAdjustment[];
}

export interface UserLoginActivityLog {
  id: string;
  tenantId: string;
  userId: string;
  userName: string;
  userRole: string;
  ipAddress: string;
  deviceType: 'Mobile' | 'Desktop' | 'POS Handheld' | 'Tablet';
  browser: string;
  operatingSystem: string;
  locationCity: string;
  status: 'success' | 'failed_credentials' | 'blocked_ip' | 'session_expired';
  timestamp: string;
  notes?: string;
}

export interface SystemAuditErrorLog {
  id: string;
  tenantId: string;
  errorCode: string;
  module: 'POS' | 'Inventory' | 'Accounting' | 'eCommerce' | 'Hardware' | 'Gateway' | 'Security';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  stackTrace?: string;
  occurredAt: string;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
  resolutionNotes?: string;
}

// ==========================================
// PHASE 25: QUICKBOOKS ONLINE SYNC, WOOCOMMERCE API, WEBHOOKS & SECURITY HUB
// ==========================================

export type QuickBooksSyncStatus = 'idle' | 'syncing' | 'success' | 'error';
export type QuickBooksSyncEntity = 'Invoice' | 'Customer' | 'Product' | 'Payment' | 'Expense';

export interface QuickBooksSyncLog {
  id: string;
  timestamp: string;
  action: string;
  entity: QuickBooksSyncEntity;
  status: 'success' | 'failed' | 'skipped';
  details: string;
  externalId?: string;
}

export interface QuickBooksConfig {
  tenantId: string;
  isConnected: boolean;
  environment: 'sandbox' | 'production';
  realmId: string; // Company Realm ID
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  authScope: string;
  tokenExpiresAt?: string;
  lastSyncTime?: string;
  syncStatus: QuickBooksSyncStatus;
  syncItems: {
    invoices: boolean;
    customers: boolean;
    products: boolean;
    payments: boolean;
    expenses: boolean;
  };
  accountMappings: {
    salesIncomeAccountId: string;
    salesIncomeAccountName: string;
    bankDepositAccountId: string;
    bankDepositAccountName: string;
    accountsReceivableId: string;
    accountsReceivableName: string;
    inventoryAssetAccountId: string;
    inventoryAssetAccountName: string;
  };
  logs: QuickBooksSyncLog[];
}

export type WooCommerceSyncDirection = 'two_way' | 'erp_to_woo' | 'woo_to_erp';

export interface WooCommerceSyncLog {
  id: string;
  timestamp: string;
  direction: 'push' | 'pull';
  entity: 'product' | 'order' | 'inventory' | 'category';
  status: 'success' | 'failed';
  message: string;
  recordsCount?: number;
}

export interface WooCommerceConfig {
  tenantId: string;
  isConnected: boolean;
  storeUrl: string; // e.g. "https://mystore.com"
  consumerKey: string; // ck_...
  consumerSecret: string; // cs_...
  apiVersion: 'wc/v3' | 'wc/v2';
  syncDirection: WooCommerceSyncDirection;
  autoSyncOnSale: boolean;
  syncCategories: boolean;
  defaultTaxClass: string;
  webhookSecret: string;
  webhookListenerUrl: string;
  orderStatusMapping: {
    processing: string;
    completed: string;
    onHold: string;
    cancelled: string;
  };
  lastSyncTime?: string;
  totalSyncedProducts: number;
  totalPendingOrders: number;
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
  logs: WooCommerceSyncLog[];
}

export type WebhookEvent =
  | 'sale.created'
  | 'sale.refunded'
  | 'order.placed'
  | 'order.delivered'
  | 'stock.low_threshold'
  | 'customer.created'
  | 'payment.received'
  | 'service.ticket_completed';

export interface OutboundWebhook {
  id: string;
  tenantId: string;
  name: string;
  targetUrl: string;
  secretKey: string;
  events: WebhookEvent[];
  isActive: boolean;
  createdAt: string;
  lastTriggeredAt?: string;
  successCount: number;
  failureCount: number;
  description?: string;
}

export interface WebhookDeliveryLog {
  id: string;
  webhookId: string;
  webhookName: string;
  event: WebhookEvent;
  payload: Record<string, any>;
  signatureHeader: string; // HMAC-SHA256 signature
  targetUrl: string;
  responseStatus: number;
  responseBody: string;
  latencyMs: number;
  attemptedAt: string;
  status: 'delivered' | 'failed';
}

export interface ActiveUserSession {
  id: string;
  tenantId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  devicePlatform: string; // e.g. "Chrome 128 (Windows 11)", "Safari Mobile (iPhone 15 Pro)", "Sunmi V2s Android 13"
  deviceType: 'desktop' | 'mobile' | 'pos_terminal' | 'tablet';
  ipAddress: string;
  location: string;
  lastActive: string;
  isCurrentSession: boolean;
  createdAt: string;
}

export interface SystemHealthMetrics {
  dbStatus: 'connected' | 'degraded' | 'offline';
  dbEngine: string; // "MySQL 8.0.35 Enterprise (Hostinger Cloud)"
  dbLatencyMs: number;
  dbUptime: string;
  storageUsedMb: number;
  storageTotalMb: number;
  cpuLoadPercent: number;
  ramLoadPercent: number;
  activeConnections: number;
  lastHealthCheck: string;
}

export interface DatabaseBackupArchive {
  id: string;
  tenantId: string;
  fileName: string;
  fileSizeBytes: number;
  fileSizeFormatted: string; // e.g. "4.8 MB"
  backupType: 'automated' | 'manual' | 'pre_update';
  format: 'sql' | 'json';
  checksum: string; // SHA-256
  status: 'completed' | 'in_progress' | 'failed';
  createdAt: string;
  createdBy: string;
  downloadUrl?: string;
  notes?: string;
}

export interface BackupScheduleConfig {
  frequency: 'daily' | 'weekly' | 'manual';
  backupTime: string; // e.g. "02:00"
  retentionDays: number;
  storageTarget: 'local_hostinger' | 'google_drive' | 'aws_s3';
  includeMedia: boolean;
  autoCompression: boolean;
  lastBackupTime?: string;
}
