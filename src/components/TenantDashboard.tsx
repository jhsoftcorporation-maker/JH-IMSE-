import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, Store, Users, UserCheck, Package, ShoppingBag, 
  ShoppingCart, DollarSign, BrainCircuit, Settings, ChevronDown, ChevronRight,
  Menu, X, Bell, Calculator, Moon, Sun, Globe, Search, Plus, 
  TrendingUp, TrendingDown, AlertTriangle, ArrowUpRight, ArrowDownRight,
  Printer, Send, CheckCircle2, ShieldCheck, Sparkles, Filter, Calendar,
  Clock, Award, HelpCircle, Layers, Eye, Smartphone, AlertCircle,
  Barcode, Download, UploadCloud, SlidersHorizontal, Trash2, FileSpreadsheet,
  FileText, Truck, RotateCcw, Receipt, CreditCard, RefreshCw, Scale, HardDrive, Monitor, Shield, Cpu, ArrowLeft,
  Bookmark, Tag, Building2, Wrench, FolderKanban, Box, Database
} from 'lucide-react';
import { 
  Tenant, Product, Sale, Customer, Employee, OnlineOrder, Warehouse, AIInsight, 
  StockAdjustment, Quotation, DeliveryChallan, CreditNote, CustomerPaymentReceipt, LoyaltyTier, CustomerType,
  AttendanceRecord, RolePermission, SalarySlip 
} from '../types';
import { BarcodeGeneratorModal } from './BarcodeGeneratorModal';
import { BulkImportModal } from './BulkImportModal';
import { StockAdjustmentModal } from './StockAdjustmentModal';
import { QuotationModal } from './QuotationModal';
import { DeliveryChallanModal } from './DeliveryChallanModal';
import { CreditNoteModal } from './CreditNoteModal';
import { CustomerLedgerModal } from './CustomerLedgerModal';
import { ReceivePaymentModal } from './ReceivePaymentModal';
import { SmsReminderModal } from './SmsReminderModal';
import { AddCustomerModal } from './AddCustomerModal';
import { PaymentReceiptModal } from './PaymentReceiptModal';
import { HRMManager } from './hrm/HRMManager';
import { AccountingManager } from './accounting/AccountingManager';
import { ECommerceManager } from './ecommerce/ECommerceManager';
import { MultiBranchLogisticsManager } from './logistics/MultiBranchLogisticsManager';
import { AIDemandForecastManager } from './ai/AIDemandForecastManager';
import { GlobalCommerceManager } from './global/GlobalCommerceManager';
import { WhatsAppLoyaltyManager } from './whatsapp/WhatsAppLoyaltyManager';
import { WhatsAppDueReminderModal } from './whatsapp/WhatsAppDueReminderModal';
import { HardwareSuiteManager } from './hardware/HardwareSuiteManager';
import { MobileDashboardView } from './mobile/MobileDashboardView';
import { MobileDrawerNav } from './mobile/MobileDrawerNav';
import { MobileDynamicAppearance } from './mobile/MobileDynamicAppearance';
import { MobilePOSView } from './mobile/MobilePOSView';
import { ProductHierarchyManager } from './products/ProductHierarchyManager';
import { ReturnsAndAuditHub } from './returns/ReturnsAndAuditHub';
import { CommissionManager } from './commissions/CommissionManager';
import { ServiceMaintenanceManager } from './services/ServiceMaintenanceManager';
import { FixedAssetManager } from './assets/FixedAssetManager';
import { ProjectsAndBookingsHub } from './projects/ProjectsAndBookingsHub';
import { PeopleAndClientPortalHub } from './people/PeopleAndClientPortalHub';
import { AnalyticsAndIntelligenceHub } from './analytics/AnalyticsAndIntelligenceHub';
import { EnterpriseIntegrationsAndSecurityHub } from './integrations/EnterpriseIntegrationsAndSecurityHub';
import { EnterpriseSettingsHub } from './settings/EnterpriseSettingsHub';
import { 
  ExpenseItem, Supplier, SupplierPurchaseOrder, SupplierPayment,
  BranchRequisition, StockTransferChallan, RequisitionStatus, TransferChallanItem,
  AutoPurchaseOrder, SeasonalDemandTrend, DeadStockLiquidationItem,
  ExchangeRateRecord, PaymentGatewayConfig, CrossBorderTaxSlab, CrossBorderTransaction,
  WhatsAppConfig, WhatsAppMessageLog, LoyaltyPointTransaction,
  Brand, SubCategory, UnitOfMeasure, OpeningStockEntry, Category,
  PurchaseReturn, DamageLog, StockCountAudit, DamageReason,
  SalesAgent, CommissionProgram, CommissionRule, CommissionReceipt,
  ServiceJobTicket, InspectionChecklist, MaintenanceContract, WarrantyRecord, WarrantyClaim,
  ServiceJobPartItem, WarrantyClaimStatus,
  FixedAsset, AssetMaintenanceRecord,
  Project, ProjectTask, CommercialContract, AppointmentBooking,
  B2BInviteCode, PendingCustomerApplication, ClientPortalDuePaymentClaim,
  CashRegisterShift, UserLoginActivityLog, SystemAuditErrorLog, CashDenominationBreakdown,
  QuickBooksConfig, WooCommerceConfig, OutboundWebhook, WebhookDeliveryLog,
  ActiveUserSession, SystemHealthMetrics, DatabaseBackupArchive, BackupScheduleConfig
} from '../types';

interface TenantDashboardProps {
  tenant: Tenant;
  tenants: Tenant[];
  onSelectTenant: (tenantId: string) => void;
  products: Product[];
  sales: Sale[];
  customers: Customer[];
  employees: Employee[];
  onlineOrders: OnlineOrder[];
  warehouses: Warehouse[];
  activeWarehouseId: string;
  onSelectWarehouse: (whId: string) => void;
  onOpenPOS: () => void;
  onOpenStorefront: () => void;
  onOpenCalculator: () => void;
  onOpenSuperAdmin: () => void;
  isImpersonating?: boolean;
  onBackToLanding: () => void;
  onOpenDataResetManager?: () => void;
  onAddProduct: (prod: Omit<Product, 'id'>) => void;
  onBulkImportProducts?: (prods: Omit<Product, 'id'>[]) => void;
  onAdjustStock?: (productId: string, newStock: number, record: StockAdjustment) => void;
  onDeleteProduct?: (productId: string) => void;
  onSmsCustomerDue: (customer: Customer, message?: string) => void;
  onUpdateOrderStatus: (orderId: string, status: OnlineOrder['status']) => void;
  quotations?: Quotation[];
  deliveryChallans?: DeliveryChallan[];
  creditNotes?: CreditNote[];
  paymentReceipts?: CustomerPaymentReceipt[];
  onAddCustomer?: (customerData: Omit<Customer, 'id'>, existingId?: string) => void;
  onReceivePayment?: (receipt: CustomerPaymentReceipt) => void;
  onCreateQuotation?: (quote: Omit<Quotation, 'id'>) => void;
  onCreateDeliveryChallan?: (challan: Omit<DeliveryChallan, 'id'>) => void;
  onCreateCreditNote?: (cn: Omit<CreditNote, 'id'>, restockItems: { productId: string; quantity: number }[]) => void;
  onConvertToInvoice?: (quote: Quotation) => void;
  onOpenReceipt?: (sale: Sale) => void;
  onOpenA4Invoice?: (sale: Sale) => void;
  systemBroadcast?: string;
  attendanceRecords?: AttendanceRecord[];
  rolePermissions?: RolePermission[];
  salarySlips?: SalarySlip[];
  onSaveEmployee?: (employeeData: Omit<Employee, 'id'>, existingId?: string) => void;
  onDeleteEmployee?: (employeeId: string) => void;
  onUpdateAttendanceRecord?: (record: AttendanceRecord) => void;
  onBulkMarkAttendance?: (records: AttendanceRecord[]) => void;
  onUpdateRolePermissions?: (roles: RolePermission[]) => void;
  onAddSalarySlip?: (slip: SalarySlip) => void;
  onUpdateSlipStatus?: (slipId: string, status: 'paid' | 'pending', method?: 'cash' | 'bkash' | 'bank') => void;
  expenses?: ExpenseItem[];
  suppliers?: Supplier[];
  purchaseOrders?: SupplierPurchaseOrder[];
  supplierPayments?: SupplierPayment[];
  onAddExpense?: (expense: Omit<ExpenseItem, 'id' | 'voucherNo' | 'createdAt'>) => void;
  onDeleteExpense?: (expenseId: string) => void;
  onSaveSupplier?: (supplierData: Omit<Supplier, 'id' | 'createdAt'>, existingId?: string) => void;
  onRecordSupplierPayment?: (payment: SupplierPayment) => void;
  onCreatePurchaseOrder?: (purchase: Omit<SupplierPurchaseOrder, 'id' | 'createdAt'>) => void;
  onUpdateOrderCourier?: (
    orderId: string, 
    partner: 'steadfast' | 'redx' | 'pathao' | 'in_house', 
    trackingId: string
  ) => void;
  onUpdateStoreSettings?: (settings: {
    storeBannerText?: string;
    insideDhakaDeliveryFee?: number;
    outsideDhakaDeliveryFee?: number;
  }) => void;
  requisitions?: BranchRequisition[];
  transfers?: StockTransferChallan[];
  onCreateRequisition?: (req: BranchRequisition) => void;
  onUpdateRequisitionStatus?: (reqId: string, status: RequisitionStatus, approvedBy?: string) => void;
  onDispatchTransfer?: (challan: StockTransferChallan) => void;
  onReceiveTransfer?: (
    transferId: string,
    receiptData: {
      grnNo: string;
      receivedBy: string;
      items: TransferChallanItem[];
      status: 'received' | 'discrepancy';
      notes?: string;
    }
  ) => void;
  onSaveWarehouse?: (warehouse: Warehouse) => void;
  autoPurchaseOrders?: AutoPurchaseOrder[];
  seasonalTrends?: SeasonalDemandTrend[];
  deadStockItems?: DeadStockLiquidationItem[];
  onApproveAndCreatePO?: (approvedPo: SupplierPurchaseOrder) => void;
  onUpdateAutoPoStatus?: (autoPoId: string, status: AutoPurchaseOrder['status']) => void;
  onApplyDeadStockPromo?: (productId: string, newSellingPrice: number, discountPct: number) => void;
  onGenerateNewAutoPOs?: (newPos: AutoPurchaseOrder[]) => void;
  exchangeRates?: ExchangeRateRecord[];
  paymentGateways?: PaymentGatewayConfig[];
  taxSlabs?: CrossBorderTaxSlab[];
  crossBorderTransactions?: CrossBorderTransaction[];
  onUpdateExchangeRate?: (rateRecord: ExchangeRateRecord) => void;
  onToggleGateway?: (gatewayId: string, isEnabled: boolean) => void;
  onUpdateGatewayMode?: (gatewayId: string, mode: 'sandbox' | 'production') => void;
  onAddCrossBorderTransaction?: (trx: CrossBorderTransaction) => void;
  onSaveTaxSlab?: (slab: CrossBorderTaxSlab) => void;
  whatsAppConfigs?: WhatsAppConfig[];
  whatsAppLogs?: WhatsAppMessageLog[];
  loyaltyTransactions?: LoyaltyPointTransaction[];
  onUpdateWhatsAppConfig?: (config: WhatsAppConfig) => void;
  onAddWhatsAppLog?: (log: WhatsAppMessageLog) => void;
  onAddLoyaltyTransaction?: (trx: LoyaltyPointTransaction) => void;
  onUpdateCustomerPoints?: (customerId: string, newPoints: number) => void;
  brands?: Brand[];
  subCategories?: SubCategory[];
  units?: UnitOfMeasure[];
  openingStocks?: OpeningStockEntry[];
  categories?: Category[];
  onSaveBrand?: (brand: Brand) => void;
  onDeleteBrand?: (brandId: string) => void;
  onSaveSubCategory?: (subCat: SubCategory) => void;
  onDeleteSubCategory?: (subCatId: string) => void;
  onSaveUnit?: (unit: UnitOfMeasure) => void;
  onDeleteUnit?: (unitId: string) => void;
  onSaveOpeningStock?: (entry: OpeningStockEntry) => void;
  onBulkUpdateProducts?: (updates: { id: string; costPrice?: number; sellingPrice?: number; stock?: number }[]) => void;
  purchaseReturns?: PurchaseReturn[];
  damageLogs?: DamageLog[];
  stockCountAudits?: StockCountAudit[];
  onSavePurchaseReturn?: (pr: Omit<PurchaseReturn, 'id'>) => void;
  onSaveDamageLog?: (dmg: Omit<DamageLog, 'id'>) => void;
  onCreateStockCountAudit?: (audit: Omit<StockCountAudit, 'id'>) => void;
  onUpdateStockCountAudit?: (audit: StockCountAudit) => void;
  onReconcileStockCountAudit?: (auditId: string) => void;
  salesAgents?: SalesAgent[];
  commissionPrograms?: CommissionProgram[];
  commissionRules?: CommissionRule[];
  commissionReceipts?: CommissionReceipt[];
  onSaveAgent?: (agentData: Omit<SalesAgent, 'id'>, existingId?: string) => void;
  onDeleteAgent?: (agentId: string) => void;
  onSaveCommissionProgram?: (programData: Omit<CommissionProgram, 'id'>, existingId?: string) => void;
  onDeleteCommissionProgram?: (programId: string) => void;
  onSaveCommissionRule?: (ruleData: Omit<CommissionRule, 'id'>, existingId?: string) => void;
  onDeleteCommissionRule?: (ruleId: string) => void;
  onSaveCommissionReceipt?: (receiptData: Omit<CommissionReceipt, 'id'>) => void;
  serviceTickets?: ServiceJobTicket[];
  inspectionChecklists?: InspectionChecklist[];
  maintenanceContracts?: MaintenanceContract[];
  warrantyRecords?: WarrantyRecord[];
  warrantyClaims?: WarrantyClaim[];
  onSaveServiceTicket?: (ticket: Omit<ServiceJobTicket, 'id' | 'createdAt'>) => void;
  onUpdateServiceTicket?: (updated: ServiceJobTicket) => void;
  onAddSparePartToJob?: (ticketId: string, part: ServiceJobPartItem) => void;
  onSaveChecklist?: (checklist: InspectionChecklist) => void;
  onSaveAMCContract?: (contract: Omit<MaintenanceContract, 'id' | 'createdAt'>) => void;
  onRecordAMCVisit?: (contractId: string, visit: any) => void;
  onSaveWarrantyClaim?: (claim: Omit<WarrantyClaim, 'id' | 'createdAt'>) => void;
  onUpdateWarrantyClaimStatus?: (claimId: string, status: WarrantyClaimStatus, notes?: string) => void;
  fixedAssets?: FixedAsset[];
  assetMaintenanceLogs?: AssetMaintenanceRecord[];
  onSaveFixedAsset?: (asset: FixedAsset) => void;
  onUpdateFixedAsset?: (asset: FixedAsset) => void;
  onSaveAssetMaintenance?: (record: AssetMaintenanceRecord) => void;
  projects?: Project[];
  projectTasks?: ProjectTask[];
  commercialContracts?: CommercialContract[];
  appointmentBookings?: AppointmentBooking[];
  onSaveProject?: (project: Project) => void;
  onUpdateProject?: (project: Project) => void;
  onDeleteProject?: (id: string) => void;
  onSaveProjectTask?: (task: ProjectTask) => void;
  onUpdateProjectTask?: (task: ProjectTask) => void;
  onDeleteProjectTask?: (id: string) => void;
  onSaveCommercialContract?: (contract: CommercialContract) => void;
  onUpdateCommercialContract?: (contract: CommercialContract) => void;
  onDeleteCommercialContract?: (id: string) => void;
  onSaveAppointmentBooking?: (booking: AppointmentBooking) => void;
  onUpdateAppointmentBookingStatus?: (id: string, status: AppointmentBooking['status']) => void;
  onDeleteAppointmentBooking?: (id: string) => void;
  onSendBookingReminder?: (booking: AppointmentBooking) => void;
  onCompleteSale?: (sale: Sale) => void;
  inviteCodes?: B2BInviteCode[];
  pendingApplications?: PendingCustomerApplication[];
  portalPaymentClaims?: ClientPortalDuePaymentClaim[];
  onSaveInviteCode?: (code: B2BInviteCode) => void;
  onDeleteInviteCode?: (codeId: string) => void;
  onApproveApplication?: (appId: string, assignedCreditLimit: number) => void;
  onRejectApplication?: (appId: string, reason: string) => void;
  onCreateApplication?: (appData: Omit<PendingCustomerApplication, 'id' | 'applicationNo' | 'appliedDate' | 'status'>) => void;
  onSubmitPortalPaymentClaim?: (claim: Omit<ClientPortalDuePaymentClaim, 'id' | 'submittedAt' | 'status'>) => void;
  onVerifyPortalPaymentClaim?: (claimId: string, isApproved: boolean) => void;
  onUpdateCustomerPortalAccess?: (customerId: string, portalData: {
    hasLoginAccount: boolean;
    portalUsername?: string;
    portalPassword?: string;
    portalStatus?: 'active' | 'suspended' | 'invited';
  }) => void;
  cashRegisterShifts?: CashRegisterShift[];
  loginActivityLogs?: UserLoginActivityLog[];
  systemErrorLogs?: SystemAuditErrorLog[];
  onOpenShift?: (shiftData: Omit<CashRegisterShift, 'id' | 'status' | 'totalCashSales' | 'totalDigitalSales' | 'totalReturnsRefunded' | 'totalExpensesPaid' | 'cashAdded' | 'cashRemoved' | 'expectedClosingCash' | 'totalTransactionsCount'>) => void;
  onCloseShift?: (shiftId: string, actualClosingCash: number, notes?: string, denominations?: CashDenominationBreakdown) => void;
  onAddCashAdjustment?: (shiftId: string, type: 'cash_in' | 'cash_out', amount: number, reason: string) => void;
  onResolveErrorLog?: (logId: string, resolutionNotes: string) => void;
  quickBooksConfig?: QuickBooksConfig;
  onUpdateQuickBooksConfig?: (config: QuickBooksConfig) => void;
  wooCommerceConfig?: WooCommerceConfig;
  onUpdateWooCommerceConfig?: (config: WooCommerceConfig) => void;
  outboundWebhooks?: OutboundWebhook[];
  onSaveWebhook?: (webhook: OutboundWebhook) => void;
  onDeleteWebhook?: (webhookId: string) => void;
  webhookDeliveryLogs?: WebhookDeliveryLog[];
  onAddWebhookDeliveryLog?: (log: WebhookDeliveryLog) => void;
  activeSessions?: ActiveUserSession[];
  onRevokeSession?: (sessionId: string) => void;
  onTerminateAllOtherSessions?: (currentUserId: string) => void;
  systemHealth?: SystemHealthMetrics;
  backupArchives?: DatabaseBackupArchive[];
  onCreateBackup?: (type: 'manual' | 'automated', format: 'sql' | 'json', notes?: string) => void;
  onRestoreBackup?: (archiveId: string) => void;
  onDeleteBackup?: (archiveId: string) => void;
  backupSchedule?: BackupScheduleConfig;
  onUpdateBackupSchedule?: (schedule: BackupScheduleConfig) => void;
}

export const TenantDashboard: React.FC<TenantDashboardProps> = ({
  tenant,
  tenants,
  onSelectTenant,
  products,
  sales,
  customers,
  employees,
  onlineOrders,
  warehouses,
  activeWarehouseId,
  onSelectWarehouse,
  onOpenPOS,
  onOpenStorefront,
  onOpenCalculator,
  onOpenSuperAdmin,
  isImpersonating = false,
  onBackToLanding,
  onOpenDataResetManager,
  onAddProduct,
  onBulkImportProducts,
  onAdjustStock,
  onDeleteProduct,
  onSmsCustomerDue,
  onUpdateOrderStatus,
  quotations = [],
  deliveryChallans = [],
  creditNotes = [],
  paymentReceipts = [],
  onAddCustomer,
  onReceivePayment,
  onCreateQuotation,
  onCreateDeliveryChallan,
  onCreateCreditNote,
  onConvertToInvoice,
  onOpenReceipt,
  onOpenA4Invoice,
  systemBroadcast,
  attendanceRecords = [],
  rolePermissions = [],
  salarySlips = [],
  onSaveEmployee,
  onDeleteEmployee,
  onUpdateAttendanceRecord,
  onBulkMarkAttendance,
  onUpdateRolePermissions,
  onAddSalarySlip,
  onUpdateSlipStatus,
  expenses = [],
  suppliers = [],
  purchaseOrders = [],
  supplierPayments = [],
  onAddExpense,
  onDeleteExpense,
  onSaveSupplier,
  onRecordSupplierPayment,
  onCreatePurchaseOrder,
  onUpdateOrderCourier,
  onUpdateStoreSettings,
  requisitions = [],
  transfers = [],
  onCreateRequisition,
  onUpdateRequisitionStatus,
  onDispatchTransfer,
  onReceiveTransfer,
  onSaveWarehouse,
  autoPurchaseOrders = [],
  seasonalTrends = [],
  deadStockItems = [],
  onApproveAndCreatePO = () => {},
  onUpdateAutoPoStatus = () => {},
  onApplyDeadStockPromo = () => {},
  onGenerateNewAutoPOs,
  exchangeRates = [],
  paymentGateways = [],
  taxSlabs = [],
  crossBorderTransactions = [],
  onUpdateExchangeRate = () => {},
  onToggleGateway = () => {},
  onUpdateGatewayMode = () => {},
  onAddCrossBorderTransaction = () => {},
  onSaveTaxSlab = () => {},
  whatsAppConfigs = [],
  whatsAppLogs = [],
  loyaltyTransactions = [],
  onUpdateWhatsAppConfig = () => {},
  onAddWhatsAppLog = () => {},
  onAddLoyaltyTransaction = () => {},
  onUpdateCustomerPoints = () => {},
  brands = [],
  subCategories = [],
  units = [],
  openingStocks = [],
  categories = [],
  onSaveBrand = () => {},
  onDeleteBrand = () => {},
  onSaveSubCategory = () => {},
  onDeleteSubCategory = () => {},
  onSaveUnit = () => {},
  onDeleteUnit = () => {},
  onSaveOpeningStock = () => {},
  onBulkUpdateProducts = () => {},
  purchaseReturns = [],
  damageLogs = [],
  stockCountAudits = [],
  onSavePurchaseReturn = () => {},
  onSaveDamageLog = () => {},
  onCreateStockCountAudit = () => {},
  onUpdateStockCountAudit = () => {},
  onReconcileStockCountAudit = () => {},
  salesAgents = [],
  commissionPrograms = [],
  commissionRules = [],
  commissionReceipts = [],
  onSaveAgent = () => {},
  onDeleteAgent = () => {},
  onSaveCommissionProgram = () => {},
  onDeleteCommissionProgram = () => {},
  onSaveCommissionRule = () => {},
  onDeleteCommissionRule = () => {},
  onSaveCommissionReceipt = () => {},
  serviceTickets = [],
  inspectionChecklists = [],
  maintenanceContracts = [],
  warrantyRecords = [],
  warrantyClaims = [],
  onSaveServiceTicket = () => {},
  onUpdateServiceTicket = () => {},
  onAddSparePartToJob = () => {},
  onSaveChecklist = () => {},
  onSaveAMCContract = () => {},
  onRecordAMCVisit = () => {},
  onSaveWarrantyClaim = () => {},
  onUpdateWarrantyClaimStatus = () => {},
  fixedAssets = [],
  assetMaintenanceLogs = [],
  onSaveFixedAsset = () => {},
  onUpdateFixedAsset = () => {},
  onSaveAssetMaintenance = () => {},
  projects = [],
  projectTasks = [],
  commercialContracts = [],
  appointmentBookings = [],
  onSaveProject = () => {},
  onUpdateProject = () => {},
  onDeleteProject = () => {},
  onSaveProjectTask = () => {},
  onUpdateProjectTask = () => {},
  onDeleteProjectTask = () => {},
  onSaveCommercialContract = () => {},
  onUpdateCommercialContract = () => {},
  onDeleteCommercialContract = () => {},
  onSaveAppointmentBooking = () => {},
  onUpdateAppointmentBookingStatus = () => {},
  onDeleteAppointmentBooking = () => {},
  onSendBookingReminder,
  onCompleteSale,
  inviteCodes = [],
  pendingApplications = [],
  portalPaymentClaims = [],
  onSaveInviteCode = () => {},
  onDeleteInviteCode = () => {},
  onApproveApplication = () => {},
  onRejectApplication = () => {},
  onCreateApplication = () => {},
  onSubmitPortalPaymentClaim = () => {},
  onVerifyPortalPaymentClaim = () => {},
  onUpdateCustomerPortalAccess = () => {},
  cashRegisterShifts = [],
  loginActivityLogs = [],
  systemErrorLogs = [],
  onOpenShift = () => {},
  onCloseShift = () => {},
  onAddCashAdjustment = () => {},
  onResolveErrorLog = () => {},
  quickBooksConfig = {
    tenantId: tenant.id,
    isConnected: true,
    environment: 'production',
    realmId: '9341452819024810',
    clientId: 'AB12984019241-prod-intuit-oauth2-client-id',
    clientSecret: 'qbo_sec_9918239019238120491823',
    redirectUri: 'https://jh-imse.shop/api/auth/quickbooks/callback',
    authScope: 'com.intuit.quickbooks.accounting',
    lastSyncTime: '2026-10-27 19:45:10',
    syncStatus: 'success',
    syncItems: { invoices: true, customers: true, products: true, payments: true, expenses: false },
    accountMappings: {
      salesIncomeAccountId: '4000',
      salesIncomeAccountName: '4000 Sales & Professional Services',
      bankDepositAccountId: '1010',
      bankDepositAccountName: '1010 DBBL Business Checking',
      accountsReceivableId: '1200',
      accountsReceivableName: '1200 Accounts Receivable (A/R)',
      inventoryAssetAccountId: '1300',
      inventoryAssetAccountName: '1300 Inventory Asset & Pharmacy Stock',
    },
    logs: [],
  },
  onUpdateQuickBooksConfig = () => {},
  wooCommerceConfig = {
    tenantId: tenant.id,
    isConnected: true,
    storeUrl: 'https://rahim-medicos.shop',
    consumerKey: 'ck_984fba21804bce9102830f1920d39481903',
    consumerSecret: 'cs_19284fa9812903bbca90123849102384910',
    apiVersion: 'wc/v3',
    syncDirection: 'two_way',
    autoSyncOnSale: true,
    syncCategories: true,
    defaultTaxClass: 'standard',
    webhookSecret: 'whsec_991823901923840192830',
    webhookListenerUrl: 'https://jh-imse.shop/api/webhooks/woocommerce/' + tenant.id,
    orderStatusMapping: { processing: 'confirmed', completed: 'delivered', onHold: 'pending', cancelled: 'cancelled' },
    totalSyncedProducts: 1420,
    totalPendingOrders: 4,
    syncStatus: 'idle',
    logs: [],
  },
  onUpdateWooCommerceConfig = () => {},
  outboundWebhooks = [],
  onSaveWebhook = () => {},
  onDeleteWebhook = () => {},
  webhookDeliveryLogs = [],
  onAddWebhookDeliveryLog = () => {},
  activeSessions = [],
  onRevokeSession = () => {},
  onTerminateAllOtherSessions = () => {},
  systemHealth = {
    dbStatus: 'connected',
    dbEngine: 'MySQL 8.0.35 Enterprise (Hostinger SSD Storage)',
    dbLatencyMs: 3.4,
    dbUptime: '99.98% (Online 45 Days)',
    storageUsedMb: 2450,
    storageTotalMb: 10240,
    cpuLoadPercent: 24,
    ramLoadPercent: 42,
    activeConnections: 18,
    lastHealthCheck: '2026-10-28 00:30:00',
  },
  backupArchives = [],
  onCreateBackup = () => {},
  onRestoreBackup = () => {},
  onDeleteBackup = () => {},
  backupSchedule = {
    frequency: 'daily',
    backupTime: '02:00',
    retentionDays: 30,
    storageTarget: 'local_hostinger',
    includeMedia: true,
    autoCompression: true,
    lastBackupTime: '2026-10-27 02:00:00',
  },
  onUpdateBackupSchedule = () => {},
}) => {
  // Mobile-First Adaptive Shell & Dynamic Appearance Theme Engine (Phase 16)
  const [isMobileView, setIsMobileView] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });
  const [primaryColor, setPrimaryColor] = useState('#663399');
  const [sidebarLayout, setSidebarLayout] = useState<'sidebar-1' | 'sidebar-2'>('sidebar-2');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isRTL, setIsRTL] = useState(false);
  const [isMobilePOSOpen, setIsMobilePOSOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isAppearanceOpen, setIsAppearanceOpen] = useState(false);

  // Phase 17 Product Hierarchy Sub-Navigation State
  const [productSubTab, setProductSubTab] = useState<'all' | 'brands' | 'sub_categories' | 'units' | 'opening_stock' | 'barcodes' | 'update_import'>('all');

  // Auto-detect mobile screen on mount/resize
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsMobileView(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync theme color with CSS variable
  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--primary-color', primaryColor);
    }
  }, [primaryColor]);

  // Navigation tabs (Strictly controlled by tenant.features)
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'products' | 'invoices' | 'pos' | 'crm' | 'hrm' | 'ecommerce' | 'ai' | 'warehouses' | 'accounting' | 'global' | 'whatsapp_loyalty' | 'hardware' | 'returns' | 'commissions' | 'service' | 'assets' | 'projects' | 'people' | 'analytics' | 'integrations' | 'settings'
  >('dashboard');
  const [returnsSubTab, setReturnsSubTab] = useState<'sales_returns' | 'purchase_returns' | 'damages' | 'stock_count'>('sales_returns');
  const [commissionsSubTab, setCommissionsSubTab] = useState<'agents' | 'programs' | 'rules' | 'receipts' | 'reports'>('agents');
  const [serviceSubTab, setServiceSubTab] = useState<'jobs' | 'checklists' | 'amc' | 'warranty'>('jobs');
  const [peopleSubTab, setPeopleSubTab] = useState<'segmentation' | 'invite_codes' | 'pending_applications' | 'client_portal'>('segmentation');
  const [peopleFilter, setPeopleFilter] = useState<'all' | 'with_login' | 'without_login' | 'over_limit'>('all');
  const [analyticsSubTab, setAnalyticsSubTab] = useState<'3d_dashboard' | 'cash_register' | 'inventory_radar' | 'ranking_matrix' | 'security_audit'>('3d_dashboard');
  const [integrationsSubTab, setIntegrationsSubTab] = useState<'quickbooks' | 'woocommerce' | 'webhooks' | 'sessions' | 'system_health'>('quickbooks');
  const [accountingSubTab, setAccountingSubTab] = useState<'journal' | 'coa' | 'statements' | 'reconciliation' | 'pnl_cashbook' | 'expenses' | 'suppliers' | 'purchases'>('journal');
  const [settingsSubTab, setSettingsSubTab] = useState<'general' | 'sms' | 'pos_policy' | 'receipt_designer' | 'modules' | 'knowledge_base' | 'subscriptions' | 'languages'>('general');
  const [bulkImportType, setBulkImportType] = useState<'products' | 'customers' | 'suppliers'>('products');

  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  // Dynamic Module Permissions based on Super Admin Settings
  const hasPos = tenant.features?.pos !== false;
  const hasEcommerce = tenant.features?.ecommerce !== false;
  const hasCrm = tenant.features?.crm !== false;
  const hasHrm = tenant.features?.hrm !== false;
  const hasAccounting = tenant.features?.accounting !== false;
  const hasAi = tenant.features?.ai !== false;
  const hasWarehouse = tenant.features?.multiWarehouse !== false;
  const hasGlobal = tenant.features?.globalCommerce !== false;
  const hasWhatsappLoyalty = tenant.features?.whatsappLoyalty !== false;
  const hasHardware = tenant.features?.hardwareSuite !== false;
  const hasCommissions = tenant.features?.commissions !== false;
  const hasService = tenant.features?.serviceMaintenance !== false;
  const hasAssets = tenant.features?.assets !== false;
  const hasProjects = tenant.features?.projects !== false;
  const hasPeoplePortal = tenant.features?.peoplePortal !== false;
  const hasAnalytics = tenant.features?.analytics3d !== false;

  // Auto-fallback to dashboard if activeTab module is disabled by Super Admin
  React.useEffect(() => {
    if (activeTab === 'crm' && !hasCrm) setActiveTab('dashboard');
    if (activeTab === 'hrm' && !hasHrm) setActiveTab('dashboard');
    if (activeTab === 'ecommerce' && !hasEcommerce) setActiveTab('dashboard');
    if (activeTab === 'accounting' && !hasAccounting) setActiveTab('dashboard');
    if (activeTab === 'ai' && !hasAi) setActiveTab('dashboard');
    if (activeTab === 'warehouses' && !hasWarehouse) setActiveTab('dashboard');
    if (activeTab === 'global' && !hasGlobal) setActiveTab('dashboard');
    if (activeTab === 'whatsapp_loyalty' && !hasWhatsappLoyalty) setActiveTab('dashboard');
    if (activeTab === 'hardware' && !hasHardware) setActiveTab('dashboard');
    if (activeTab === 'commissions' && !hasCommissions) setActiveTab('dashboard');
    if (activeTab === 'service' && !hasService) setActiveTab('dashboard');
    if (activeTab === 'assets' && !hasAssets) setActiveTab('dashboard');
    if (activeTab === 'projects' && !hasProjects) setActiveTab('dashboard');
    if (activeTab === 'people' && !hasPeoplePortal) setActiveTab('dashboard');
    if (activeTab === 'analytics' && !hasAnalytics) setActiveTab('dashboard');
  }, [activeTab, hasCrm, hasHrm, hasEcommerce, hasAccounting, hasAi, hasWarehouse, hasGlobal, hasWhatsappLoyalty, hasHardware, hasCommissions, hasService, hasAssets, hasProjects, hasPeoplePortal, hasAnalytics]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [dateRange, setDateRange] = useState<'today' | '7days' | 'month' | 'year'>('month');
  
  // Phase 1 Modals & Filters State
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
  const [barcodeProductToPrint, setBarcodeProductToPrint] = useState<string | undefined>(undefined);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [isStockAdjustmentOpen, setIsStockAdjustmentOpen] = useState(false);
  const [productStatusFilter, setProductStatusFilter] = useState<'all' | 'low_stock' | 'near_expiry' | 'out_of_stock'>('all');
  const [productSearchQuery, setProductSearchQuery] = useState('');

  // Phase 2 Invoicing & Modals State
  const [isQuotationModalOpen, setIsQuotationModalOpen] = useState(false);
  const [isChallanModalOpen, setIsChallanModalOpen] = useState(false);
  const [isCreditNoteModalOpen, setIsCreditNoteModalOpen] = useState(false);
  const [invoiceFilterStatus, setInvoiceFilterStatus] = useState<'all' | 'paid' | 'due' | 'returned'>('all');
  const [invoiceSearchQuery, setInvoiceSearchQuery] = useState('');
  const [invoiceSubTab, setInvoiceSubTab] = useState<'invoices' | 'quotations' | 'challans' | 'credit_notes'>('invoices');

  // Phase 3 CRM & Digital Due Ledger State
  const [isLedgerModalOpen, setIsLedgerModalOpen] = useState(false);
  const [selectedLedgerCustomer, setSelectedLedgerCustomer] = useState<Customer | null>(null);
  const [isReceivePaymentModalOpen, setIsReceivePaymentModalOpen] = useState(false);
  const [selectedPaymentCustomer, setSelectedPaymentCustomer] = useState<Customer | null>(null);
  const [isSmsReminderModalOpen, setIsSmsReminderModalOpen] = useState(false);
  const [selectedSmsCustomer, setSelectedSmsCustomer] = useState<Customer | null>(null);
  const [selectedWhatsAppDueCustomer, setSelectedWhatsAppDueCustomer] = useState<Customer | null>(null);
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);
  const [isPaymentReceiptModalOpen, setIsPaymentReceiptModalOpen] = useState(false);
  const [selectedPaymentReceipt, setSelectedPaymentReceipt] = useState<CustomerPaymentReceipt | null>(null);

  const [customerFilterStatus, setCustomerFilterStatus] = useState<'all' | 'due' | 'paid' | 'over_limit'>('all');
  const [customerTierFilter, setCustomerTierFilter] = useState<'all' | 'vip' | 'gold' | 'silver' | 'bronze'>('all');
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [crmSubTab, setCrmSubTab] = useState<'customers' | 'receipts'>('customers');

  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [isAiThinking, setIsAiThinking] = useState(false);

  // New product form state with deep niche fields
  const [pName, setPName] = useState('');
  const [pSku, setPSku] = useState('');
  const [pCategory, setPCategory] = useState('');
  const [pCostPrice, setPCostPrice] = useState('');
  const [pSellingPrice, setPSellingPrice] = useState('');
  const [pWholesalePrice, setPWholesalePrice] = useState('');
  const [pStock, setPStock] = useState('');
  const [pAlertStock, setPAlertStock] = useState('5');
  const [pUnit, setPUnit] = useState('pcs');
  const [pExpiry, setPExpiry] = useState('');
  const [pBatch, setPBatch] = useState('');
  const [pGeneric, setPGeneric] = useState('');
  const [pManufacturer, setPManufacturer] = useState('');
  const [pRackNumber, setPRackNumber] = useState('');
  const [pDarNumber, setPDarNumber] = useState('');
  const [pDosageForm, setPDosageForm] = useState('Tablet');
  const [pWarranty, setPWarranty] = useState('');
  const [pBrand, setPBrand] = useState('');
  const [pModelNumber, setPModelNumber] = useState('');
  const [pMoq, setPMoq] = useState('');
  const [pOnline, setPOnline] = useState(true);

  // CSV Export Generator
  const handleExportCSV = () => {
    if (tenantProducts.length === 0) return;
    const headers = [
      'ID', 'Name', 'SKU', 'Category', 'CostPrice', 'SellingPrice', 'WholesalePrice',
      'Stock', 'Unit', 'AlertStock', 'ExpiryDate', 'BatchNumber', 'GenericName', 'Manufacturer', 'RackNumber'
    ];
    const rows = tenantProducts.map(p => [
      p.id,
      `"${p.name.replace(/"/g, '""')}"`,
      p.sku,
      `"${p.category}"`,
      p.costPrice,
      p.sellingPrice,
      p.wholesalePrice || (p.sellingPrice * 0.9).toFixed(2),
      p.stock,
      p.unit,
      p.alertStock,
      p.expiryDate || '',
      p.batchNumber || '',
      `"${(p.genericName || '').replace(/"/g, '""')}"`,
      `"${(p.manufacturer || '').replace(/"/g, '""')}"`,
      `"${(p.rackNumber || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${tenant.slug}_inventory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter products and sales for this tenant
  const tenantProducts = useMemo(() => {
    return products.filter(p => {
      if (p.tenantId !== tenant.id) return false;
      if (activeWarehouseId !== 'all' && p.warehouseId !== activeWarehouseId) return false;
      return true;
    });
  }, [products, tenant.id, activeWarehouseId]);

  const tenantSales = useMemo(() => {
    return sales.filter(s => s.tenantId === tenant.id);
  }, [sales, tenant.id]);

  const tenantCustomers = useMemo(() => {
    return customers.filter(c => c.tenantId === tenant.id);
  }, [customers, tenant.id]);

  const tenantEmployees = useMemo(() => {
    return employees.filter(e => e.tenantId === tenant.id);
  }, [employees, tenant.id]);

  const tenantOrders = useMemo(() => {
    return onlineOrders.filter(o => o.tenantId === tenant.id);
  }, [onlineOrders, tenant.id]);

  // Financial KPI calculations
  const totalSalesAmount = useMemo(() => {
    return tenantSales.reduce((acc, s) => acc + s.totalAmount, 0);
  }, [tenantSales]);

  const totalCostAmount = useMemo(() => {
    return tenantSales.reduce((acc, s) => {
      const saleCost = s.items.reduce((sum, item) => sum + (item.costPrice * item.quantity), 0);
      return acc + saleCost;
    }, 0);
  }, [tenantSales]);

  const totalProfit = Math.max(0, totalSalesAmount - totalCostAmount);

  const totalSalesDue = useMemo(() => {
    return tenantCustomers.reduce((acc, c) => acc + c.dueAmount, 0);
  }, [tenantCustomers]);

  // Phase 3 CRM & Due Ledger Calculations
  const tenantReceipts = useMemo(() => {
    return (paymentReceipts || []).filter(r => r.tenantId === tenant.id);
  }, [paymentReceipts, tenant.id]);

  const collectedThisMonth = useMemo(() => {
    return tenantReceipts.reduce((sum, r) => sum + r.amount, 0);
  }, [tenantReceipts]);

  const activeDueCustomers = useMemo(() => {
    return tenantCustomers.filter(c => c.dueAmount > 0);
  }, [tenantCustomers]);

  const overLimitCustomers = useMemo(() => {
    return tenantCustomers.filter(c => (c.creditLimit || 0) > 0 && c.dueAmount > (c.creditLimit || 0));
  }, [tenantCustomers]);

  const topCustomersByPurchases = useMemo(() => {
    return [...tenantCustomers].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 4);
  }, [tenantCustomers]);

  const displayedCustomers = useMemo(() => {
    return tenantCustomers.filter(c => {
      // Status filter
      if (customerFilterStatus === 'due' && c.dueAmount <= 0) return false;
      if (customerFilterStatus === 'paid' && c.dueAmount > 0) return false;
      if (customerFilterStatus === 'over_limit') {
        const limit = c.creditLimit || 0;
        if (limit <= 0 || c.dueAmount <= limit) return false;
      }

      // Loyalty tier filter
      if (customerTierFilter !== 'all' && c.loyaltyTier !== customerTierFilter) return false;

      // Search query
      if (customerSearchQuery.trim()) {
        const q = customerSearchQuery.toLowerCase();
        const matchesName = c.name.toLowerCase().includes(q);
        const matchesPhone = c.phone.toLowerCase().includes(q);
        const matchesEmail = c.email?.toLowerCase().includes(q) || false;
        const matchesAddress = c.address?.toLowerCase().includes(q) || false;
        if (!matchesName && !matchesPhone && !matchesEmail && !matchesAddress) return false;
      }

      return true;
    });
  }, [tenantCustomers, customerFilterStatus, customerTierFilter, customerSearchQuery]);

  const handleExportCustomersCSV = () => {
    const headers = ['কাস্টমার আইডি', 'নাম', 'মোবাইল', 'ইমেইল', 'ঠিকানা', 'ক্যাটাগরি', 'লয়্যালটি টিয়ার', 'মোট ক্রয় (টাকা)', 'ক্রেডিট লিমিট (টাকা)', 'বর্তমান বকেয়া (টাকা)', 'অর্ডার সংখ্যা'];
    const rows = displayedCustomers.map(c => [
      c.id,
      `"${c.name.replace(/"/g, '""')}"`,
      c.phone,
      c.email || '',
      `"${(c.address || '').replace(/"/g, '""')}"`,
      c.customerType || 'retail',
      c.loyaltyTier || 'bronze',
      c.totalSpent.toFixed(2),
      (c.creditLimit || 0).toFixed(2),
      c.dueAmount.toFixed(2),
      c.purchaseCount,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${tenant.slug}_Customer_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalStockCost = useMemo(() => {
    return tenantProducts.reduce((acc, p) => acc + (p.costPrice * p.stock), 0);
  }, [tenantProducts]);

  const totalStockRetail = useMemo(() => {
    return tenantProducts.reduce((acc, p) => acc + (p.sellingPrice * p.stock), 0);
  }, [tenantProducts]);

  const totalStockWholesale = useMemo(() => {
    return tenantProducts.reduce((acc, p) => acc + ((p.wholesalePrice || p.costPrice * 1.1) * p.stock), 0);
  }, [tenantProducts]);

  // Near expiry & low stock alerts
  const nearExpiryProducts = useMemo(() => {
    return tenantProducts.filter(p => p.expiryDate && p.expiryDate < '2026-12-31');
  }, [tenantProducts]);

  const lowStockProducts = useMemo(() => {
    return tenantProducts.filter(p => p.stock <= p.alertStock);
  }, [tenantProducts]);

  const outOfStockProducts = useMemo(() => {
    return tenantProducts.filter(p => p.stock <= 0);
  }, [tenantProducts]);

  const displayedProducts = useMemo(() => {
    return tenantProducts.filter(p => {
      // Search query
      if (productSearchQuery.trim()) {
        const q = productSearchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesSku = p.sku.toLowerCase().includes(q);
        const matchesGeneric = p.genericName?.toLowerCase().includes(q);
        const matchesManufacturer = p.manufacturer?.toLowerCase().includes(q);
        const matchesRack = p.rackNumber?.toLowerCase().includes(q);
        if (!matchesName && !matchesSku && !matchesGeneric && !matchesManufacturer && !matchesRack) {
          return false;
        }
      }

      // Status filter
      if (productStatusFilter === 'low_stock') {
        return p.stock > 0 && p.stock <= p.alertStock;
      }
      if (productStatusFilter === 'out_of_stock') {
        return p.stock <= 0;
      }
      if (productStatusFilter === 'near_expiry') {
        return Boolean(p.expiryDate && p.expiryDate < '2026-12-31');
      }

      return true;
    });
  }, [tenantProducts, productSearchQuery, productStatusFilter]);

  // Invoicing & Billing Memos
  const tenantQuotations = useMemo(() => {
    return quotations.filter(q => q.tenantId === tenant.id);
  }, [quotations, tenant.id]);

  const tenantDeliveryChallans = useMemo(() => {
    return deliveryChallans.filter(dc => dc.tenantId === tenant.id);
  }, [deliveryChallans, tenant.id]);

  const tenantCreditNotes = useMemo(() => {
    return creditNotes.filter(cn => cn.tenantId === tenant.id);
  }, [creditNotes, tenant.id]);

  const invoiceStats = useMemo(() => {
    const totalInvoiced = tenantSales.reduce((acc, s) => acc + s.totalAmount, 0);
    const paidSales = tenantSales.filter(s => (s.dueAmount || 0) <= 0);
    const paidTotal = paidSales.reduce((acc, s) => acc + s.paidAmount, 0);
    const dueSales = tenantSales.filter(s => (s.dueAmount || 0) > 0);
    const dueTotal = dueSales.reduce((acc, s) => acc + (s.dueAmount || 0), 0);
    const returnedTotal = tenantCreditNotes.reduce((acc, cn) => acc + cn.totalRefundAmount, 0);

    return {
      totalInvoiced,
      invoicesCount: tenantSales.length,
      paidTotal,
      paidCount: paidSales.length,
      dueTotal,
      dueCount: dueSales.length,
      returnedTotal,
      returnedCount: tenantCreditNotes.length,
    };
  }, [tenantSales, tenantCreditNotes]);

  const displayedInvoices = useMemo(() => {
    return tenantSales.filter(sale => {
      if (invoiceSearchQuery.trim()) {
        const q = invoiceSearchQuery.toLowerCase();
        const matchesId = (sale.invoiceNumber || '').toLowerCase().includes(q) || sale.id.toLowerCase().includes(q);
        const matchesCustomer = (sale.customerName || '').toLowerCase().includes(q);
        const matchesPhone = (sale.customerPhone || '').toLowerCase().includes(q);
        const matchesTrx = (sale.transactionId || '').toLowerCase().includes(q);
        if (!matchesId && !matchesCustomer && !matchesPhone && !matchesTrx) {
          return false;
        }
      }

      if (invoiceFilterStatus === 'paid') {
        return (sale.dueAmount || 0) <= 0;
      }
      if (invoiceFilterStatus === 'due') {
        return (sale.dueAmount || 0) > 0;
      }
      if (invoiceFilterStatus === 'returned') {
        return tenantCreditNotes.some(cn => cn.originalInvoiceNumber === sale.invoiceNumber || cn.originalInvoiceNumber === sale.id);
      }
      return true;
    });
  }, [tenantSales, invoiceSearchQuery, invoiceFilterStatus, tenantCreditNotes]);

  // AI / System query handler
  const handleAskAI = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuestion.trim()) return;
    setIsAiThinking(true);
    setTimeout(() => {
      setIsAiThinking(false);
      const q = aiQuestion.toLowerCase();
      if (q.includes('লাভ') || q.includes('profit')) {
        setAiAnswer(`আপনার বর্তমান নিট লাভ হচ্ছে ${tenant.currency}${totalProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}। গড় প্রফিট মার্জিন ২২.৪%।`);
      } else if (q.includes('স্টক') || q.includes('মজুদ') || q.includes('বাকি')) {
        setAiAnswer(`আপনার মোট পণ্যের পাইকারি মূল্য ${tenant.currency}${totalStockCost.toLocaleString()} এবং খুচরা মূল্য ${tenant.currency}${totalStockRetail.toLocaleString()}। বাকি খাতায় মোট বকেয়া আছে ${tenant.currency}${totalSalesDue.toLocaleString()}।`);
      } else {
        setAiAnswer(`সিস্টেম অ্যানালাইটিক্স রিপোর্ট: ${tenant.name}-এ চলতি সপ্তাহে সবচেয়ে বেশি বিক্রি হয়েছে ${tenantProducts[0]?.name || 'পণ্য'}। পরবর্তী সপ্তাহের জন্য আরও ৩০% স্টক বাড়ানো লাভজনক হবে।`);
      }
    }, 600);
  };

  const handleCreateProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName || !pSellingPrice) return;

    onAddProduct({
      tenantId: tenant.id,
      name: pName,
      sku: pSku || 'SKU-' + Math.floor(1000 + Math.random() * 9000),
      category: pCategory || 'General',
      costPrice: parseFloat(pCostPrice) || 0,
      sellingPrice: parseFloat(pSellingPrice) || 0,
      wholesalePrice: pWholesalePrice ? parseFloat(pWholesalePrice) : (parseFloat(pSellingPrice) || 0) * 0.9,
      stock: parseInt(pStock) || 10,
      alertStock: parseInt(pAlertStock) || 5,
      unit: pUnit || 'pcs',
      showInOnlineStore: pOnline,
      warehouseId: activeWarehouseId === 'all' ? (warehouses[0]?.id || 'wh-1') : activeWarehouseId,
      expiryDate: pExpiry || undefined,
      batchNumber: pBatch || undefined,
      genericName: pGeneric || undefined,
      manufacturer: pManufacturer || undefined,
      rackNumber: pRackNumber || undefined,
      darNumber: pDarNumber || undefined,
      dosageForm: pDosageForm || undefined,
      warrantyMonths: pWarranty ? parseInt(pWarranty) : undefined,
      brand: pBrand || undefined,
      modelNumber: pModelNumber || undefined,
      moq: pMoq ? parseInt(pMoq) : undefined,
    });

    setShowAddProductModal(false);
    setPName('');
    setPSku('');
    setPCategory('');
    setPCostPrice('');
    setPSellingPrice('');
    setPWholesalePrice('');
    setPStock('');
    setPAlertStock('5');
    setPExpiry('');
    setPBatch('');
    setPGeneric('');
    setPManufacturer('');
    setPRackNumber('');
    setPDarNumber('');
    setPWarranty('');
    setPBrand('');
  };

  // Central Navigation & Deep-Linking Router (prevents blank/conflated screens)
  const handleSelectTab = (tab: any, sub?: string) => {
    // 1. Returns, Damages, Credit Notes & Stock Audit (Phase 18)
    if (tab === 'returns' || sub === 'credit_notes' || sub === 'sales_returns' || sub === 'purchase_returns' || sub === 'damages' || sub === 'audit' || sub === 'adjustments' || sub === 'create_adjustment' || sub === 'stock_count') {
      setActiveTab('returns');
      if (sub === 'credit_notes' || sub === 'sales_returns') setReturnsSubTab('sales_returns');
      else if (sub === 'purchase_returns') setReturnsSubTab('purchase_returns');
      else if (sub === 'damages') setReturnsSubTab('damages');
      else setReturnsSubTab('stock_count');
      return;
    }

    // 2. Commissions & Sales Agents (Phase 19)
    if (tab === 'commissions' || sub === 'commission_programs' || sub === 'sales_agents' || sub === 'commission_rules' || sub === 'commission_receipts' || sub === 'commission_reports') {
      setActiveTab('commissions');
      if (sub === 'sales_agents') setCommissionsSubTab('agents');
      else if (sub === 'commission_programs') setCommissionsSubTab('programs');
      else if (sub === 'commission_rules') setCommissionsSubTab('rules');
      else if (sub === 'commission_receipts') setCommissionsSubTab('receipts');
      else if (sub === 'commission_reports') setCommissionsSubTab('reports');
      else setCommissionsSubTab('agents');
      return;
    }

    // 3. People & Client Self-Service Portal (Phase 23)
    if (tab === 'people' || sub === 'guest_customers' || sub === 'portal_customers' || sub === 'client_portal' || sub === 'invites' || sub === 'pending_customers') {
      setActiveTab('people');
      if (sub === 'guest_customers') {
        setPeopleSubTab('segmentation');
        setPeopleFilter('without_login');
      } else if (sub === 'portal_customers') {
        setPeopleSubTab('segmentation');
        setPeopleFilter('with_login');
      } else if (sub === 'client_portal') {
        setPeopleSubTab('client_portal');
      } else if (sub === 'invites') {
        setPeopleSubTab('invite_codes');
      } else if (sub === 'pending_customers') {
        setPeopleSubTab('pending_applications');
      } else {
        setPeopleSubTab('segmentation');
      }
      return;
    }

    // 4. CRM / Quick Customer Actions
    if (tab === 'crm') {
      if (sub === 'create_customer') {
        setIsAddCustomerModalOpen(true);
      } else if (sub === 'import_customers') {
        setBulkImportType('customers');
        setIsBulkImportOpen(true);
      } else {
        setActiveTab('crm');
      }
      return;
    }

    // 5. Accounting, Expenses & Supplier Purchases (Phase 10)
    if (tab === 'accounting') {
      setActiveTab('accounting');
      if (sub === 'suppliers' || sub === 'create_supplier') {
        setAccountingSubTab('suppliers');
      } else if (sub === 'import_suppliers') {
        setBulkImportType('suppliers');
        setIsBulkImportOpen(true);
      } else if (sub === 'purchases' || sub === 'create_purchase') {
        setAccountingSubTab('purchases');
      } else if (sub === 'import_purchases') {
        setBulkImportType('products');
        setIsBulkImportOpen(true);
      } else if (sub === 'expenses' || sub === 'create_expense' || sub === 'expense_categories') {
        setAccountingSubTab('expenses');
      } else if (sub === 'coa' || sub === 'accounts') {
        setAccountingSubTab('coa');
      } else if (sub === 'reconciliation' || sub === 'money_transfer' || sub === 'deposits' || sub === 'create_deposit' || sub === 'deposit_categories') {
        setAccountingSubTab('reconciliation');
      } else if (sub === 'pnl_cashbook') {
        setAccountingSubTab('pnl_cashbook');
      } else if (sub === 'reports' || sub === 'statements' || sub === 'trial_balance' || sub === 'profit_loss' || sub === 'balance_sheet' || sub === 'taxes') {
        setAccountingSubTab('statements');
      } else {
        setAccountingSubTab('journal');
      }
      return;
    }

    // 6. 3D Analytics, Cash Register & Security Audit (Phase 24)
    if (tab === 'analytics' || sub === '3d_sales' || sub === 'cash_register' || sub === 'stock_aging' || sub === 'customer_ranking' || sub === 'audit_logs') {
      setActiveTab('analytics');
      if (sub === 'cash_register') setAnalyticsSubTab('cash_register');
      else if (sub === 'stock_aging') setAnalyticsSubTab('inventory_radar');
      else if (sub === 'customer_ranking') setAnalyticsSubTab('ranking_matrix');
      else if (sub === 'audit_logs') setAnalyticsSubTab('security_audit');
      else setAnalyticsSubTab('3d_dashboard');
      return;
    }

    // 7. Enterprise Integrations & Cloud Sync (Phase 25)
    if (tab === 'integrations' || sub === 'quickbooks' || sub === 'woocommerce' || sub === 'webhooks' || sub === 'sessions' || sub === 'system_health' || sub === 'backup') {
      setActiveTab('integrations');
      if (sub === 'woocommerce') setIntegrationsSubTab('woocommerce');
      else if (sub === 'webhooks') setIntegrationsSubTab('webhooks');
      else if (sub === 'sessions') setIntegrationsSubTab('sessions');
      else if (sub === 'system_health' || sub === 'backup') setIntegrationsSubTab('system_health');
      else setIntegrationsSubTab('quickbooks');
      return;
    }

    // 8. E-Commerce WooCommerce Redirect
    if (tab === 'ecommerce' && sub === 'woocommerce') {
      setActiveTab('integrations');
      setIntegrationsSubTab('woocommerce');
      return;
    }

    // 9. Enterprise Settings Hub
    if (tab === 'settings') {
      setActiveTab('settings');
      if (sub === 'sms') setSettingsSubTab('sms');
      else if (sub === 'pos_policy') setSettingsSubTab('pos_policy');
      else if (sub === 'receipt_designer') setSettingsSubTab('receipt_designer');
      else if (sub === 'modules') setSettingsSubTab('modules');
      else if (sub === 'knowledge_base') setSettingsSubTab('knowledge_base');
      else if (sub === 'subscriptions') setSettingsSubTab('subscriptions');
      else if (sub === 'languages') setSettingsSubTab('languages');
      else setSettingsSubTab('general');
      return;
    }

    // 10. Service, Repair Jobs & Maintenance (Phase 20)
    if (tab === 'service' && sub) {
      setActiveTab('service');
      if (sub === 'jobs') setServiceSubTab('jobs');
      else if (sub === 'checklists') setServiceSubTab('checklists');
      else if (sub === 'amc') setServiceSubTab('amc');
      else if (sub === 'warranty') setServiceSubTab('warranty');
      return;
    }

    setActiveTab(tab as any);

    // 11. Invoices SubTabs
    if (tab === 'invoices' && sub) {
      if (sub === 'quotations') setInvoiceSubTab('quotations');
      else if (sub === 'challans') setInvoiceSubTab('challans');
      else if (sub === 'credit_notes') {
        setActiveTab('returns');
        setReturnsSubTab('sales_returns');
      } else if (sub === 'import') {
        setBulkImportType('products');
        setIsBulkImportOpen(true);
      } else {
        setInvoiceSubTab('invoices');
      }
    } else if (tab === 'products' && sub) {
      if (sub === 'create') {
        setProductSubTab('all');
        setShowAddProductModal(true);
      } else if (sub === 'import') {
        setProductSubTab('all');
        setBulkImportType('products');
        setIsBulkImportOpen(true);
      } else if (sub === 'brands') setProductSubTab('brands');
      else if (sub === 'sub_categories') setProductSubTab('sub_categories');
      else if (sub === 'units') setProductSubTab('units');
      else if (sub === 'opening_stock') setProductSubTab('opening_stock');
      else if (sub === 'barcodes') setProductSubTab('barcodes');
      else if (sub === 'update_import') setProductSubTab('update_import');
      else if (sub === 'audit' || sub === 'adjustments' || sub === 'create_adjustment') {
        setActiveTab('returns');
        setReturnsSubTab('stock_count');
      } else {
        setProductSubTab('all');
      }
    }
  };

  // Mobile-First Screen Views (Phase 16 - 95% Parity with screenshots)
  if (isMobileView && isMobilePOSOpen) {
    return (
      <MobilePOSView
        tenant={tenant}
        products={tenantProducts}
        customers={tenantCustomers}
        warehouses={warehouses}
        activeWarehouseId={activeWarehouseId}
        onSelectWarehouse={onSelectWarehouse}
        onCompleteSale={onCompleteSale || ((sale) => alert('বিক্রি সফলভাবে সম্পন্ন হয়েছে!'))}
        onBackToDashboard={() => setIsMobilePOSOpen(false)}
        onOpenReceipt={onOpenReceipt}
        onOpenA4Invoice={onOpenA4Invoice}
        primaryColor={primaryColor}
        onToggleDesktopMode={() => setIsMobileView(false)}
      />
    );
  }

  if (isMobileView && activeTab === 'dashboard') {
    return (
      <MobileDashboardView
        tenant={tenant}
        products={tenantProducts}
        sales={tenantSales}
        customers={tenantCustomers}
        employees={tenantEmployees}
        onlineOrders={tenantOrders}
        warehouses={warehouses}
        activeWarehouseId={activeWarehouseId}
        onSelectWarehouse={onSelectWarehouse}
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onOpenPOS={() => setIsMobilePOSOpen(true)}
        onOpenStorefront={onOpenStorefront}
        onOpenCalculator={onOpenCalculator}
        primaryColor={primaryColor}
        onUpdatePrimaryColor={setPrimaryColor}
        sidebarLayout={sidebarLayout}
        onUpdateSidebarLayout={setSidebarLayout}
        isDarkMode={isDarkMode}
        onToggleDarkMode={setIsDarkMode}
        isRTL={isRTL}
        onToggleRTL={setIsRTL}
        onToggleDesktopMode={() => setIsMobileView(false)}
      />
    );
  }

  return (
    <div className={`flex h-screen bg-[#f8fafc] text-slate-800 font-sans overflow-hidden ${isDarkMode ? 'dark bg-slate-900 text-slate-100' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Sidebar Navigation (Matching Stocky / IMS screenshot) */}
      {!isMobileView && (
      <aside
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-white border-r border-slate-200 transition-all duration-200 flex flex-col z-30 shrink-0 shadow-sm`}
      >
        {/* Brand Header */}
        <div className="h-16 border-b border-slate-100 flex items-center justify-between px-4">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-purple-700 text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0">
              {tenant.name.charAt(0)}
            </div>
            {isSidebarOpen && (
              <div className="truncate">
                <span className="font-bold text-sm text-slate-900 block truncate leading-tight">
                  {tenant.name}
                </span>
                <span className="text-[10px] text-purple-700 font-semibold block capitalize truncate">
                  {tenant.businessType === 'pharmacy' ? '⚕️ ফার্মেসি' : tenant.businessType === 'grocery' ? '🛒 মুদি ও সুপারশপ' : '⚡ গ্যাজেট স্টোর'}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Nav Links with Exact Accordion Hierarchy & Module Feature Filtering */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1 text-xs scrollbar-thin">
          {/* 1. Dashboard */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition font-medium ${
              activeTab === 'dashboard'
                ? 'bg-purple-700 text-white shadow-xs font-bold'
                : 'text-slate-700 hover:bg-purple-50 hover:text-purple-900'
            }`}
          >
            <div className="flex items-center gap-3 truncate">
              <LayoutDashboard className={`w-4 h-4 shrink-0 ${activeTab === 'dashboard' ? 'text-white' : 'text-slate-400'}`} />
              {isSidebarOpen && <span>ড্যাশবোর্ড (Dashboard)</span>}
            </div>
          </button>

          {/* 2. Store (Strictly Conditional on ecommerce) */}
          {hasEcommerce && (
            <div>
              <button
                onClick={() => isSidebarOpen ? setOpenAccordion(openAccordion === 'store' ? null : 'store') : setActiveTab('ecommerce')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition font-medium ${
                  activeTab === 'ecommerce' ? 'bg-purple-50 text-purple-900 font-bold' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <ShoppingBag className="w-4 h-4 text-slate-500 shrink-0" />
                  {isSidebarOpen && <span>Store (ই-কমার্স)</span>}
                </div>
                {isSidebarOpen && (
                  openAccordion === 'store' ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>
              {isSidebarOpen && openAccordion === 'store' && (
                <div className="pl-9 pr-2 py-1 space-y-1 bg-slate-50/70 rounded-xl my-0.5 text-[11px]">
                  <button onClick={onOpenStorefront} className="w-full text-left py-1 px-2 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-white transition">
                    🌐 Visit Online Store
                  </button>
                  <button onClick={() => setActiveTab('ecommerce')} className="w-full text-left py-1 px-2 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-white transition">
                    📦 Online Orders ({tenantOrders.length})
                  </button>
                  <button onClick={() => setActiveTab('ecommerce')} className="w-full text-left py-1 px-2 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-white transition">
                    ⚙️ Store Settings & Couriers
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 3. People / CRM & Client Portal (Phase 23) */}
          {(hasCrm || hasPeoplePortal) && (
            <div>
              <button
                onClick={() => isSidebarOpen ? setOpenAccordion(openAccordion === 'people' ? null : 'people') : setActiveTab('people')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition font-medium ${
                  activeTab === 'crm' || activeTab === 'people' ? 'bg-purple-700 text-white shadow-xs font-bold' : 'text-slate-700 hover:bg-purple-50 hover:text-purple-900'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <Users className={`w-4 h-4 shrink-0 ${activeTab === 'crm' || activeTab === 'people' ? 'text-white' : 'text-slate-400'}`} />
                  {isSidebarOpen && <span>People ও ক্লায়েন্ট পোর্টাল</span>}
                </div>
                {isSidebarOpen && (
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                      activeTab === 'people' ? 'bg-purple-800 text-purple-100' : 'bg-purple-100 text-purple-700'
                    }`}>
                      Phase 23
                    </span>
                    {openAccordion === 'people' ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </div>
                )}
              </button>
              {isSidebarOpen && openAccordion === 'people' && (
                <div className="pl-9 pr-2 py-1 space-y-1 bg-slate-50/70 rounded-xl my-0.5 text-[11px]">
                  <button onClick={() => { setActiveTab('people'); setPeopleSubTab('segmentation'); setPeopleFilter('all'); }} className="w-full text-left py-1 px-2 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-white transition cursor-pointer">
                    🌐 গ্রাহক সেগমেন্টেশন ({tenantCustomers.length})
                  </button>
                  <button onClick={() => { setActiveTab('people'); setPeopleSubTab('segmentation'); setPeopleFilter('without_login'); }} className="w-full text-left py-1 px-2 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-white transition cursor-pointer">
                    🚶 কাউন্টার খদ্দের (Without Login)
                  </button>
                  <button onClick={() => { setActiveTab('people'); setPeopleSubTab('segmentation'); setPeopleFilter('with_login'); }} className="w-full text-left py-1 px-2 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-white transition cursor-pointer">
                    🔐 সেলফ-সার্ভিস একাউন্ট (With Login)
                  </button>
                  <button onClick={() => { setActiveTab('people'); setPeopleSubTab('invite_codes'); }} className="w-full text-left py-1 px-2 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-white transition cursor-pointer flex items-center justify-between">
                    <span>🎟️ বি২বি ইনভাইটেশন কোড</span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-purple-100 text-purple-700 rounded-full font-bold">{inviteCodes.length}</span>
                  </button>
                  <button onClick={() => { setActiveTab('people'); setPeopleSubTab('pending_applications'); }} className="w-full text-left py-1 px-2 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-white transition cursor-pointer flex items-center justify-between">
                    <span>📥 আবেদন ও অনুমোদন কিউ</span>
                    {pendingApplications.filter(a => a.status === 'pending').length > 0 && (
                      <span className="text-[10px] px-1.5 py-0.2 bg-amber-500 text-white rounded-full font-bold animate-pulse">
                        {pendingApplications.filter(a => a.status === 'pending').length}
                      </span>
                    )}
                  </button>
                  <button onClick={() => { setActiveTab('people'); setPeopleSubTab('client_portal'); }} className="w-full text-left py-1 px-2 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-white transition cursor-pointer">
                    💻 ক্লায়েন্ট পোর্টাল প্রিভিউ (Live)
                  </button>
                  <button onClick={() => setActiveTab('crm')} className="w-full text-left py-1 px-2 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-white transition cursor-pointer">
                    👥 সাধারণ CRM খতিয়ান
                  </button>
                  <button onClick={() => setIsAddCustomerModalOpen(true)} className="w-full text-left py-1 px-2 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-white transition cursor-pointer">
                    ➕ নতুন গ্রাহক নিবন্ধন
                  </button>
                  <button onClick={() => { setActiveTab('accounting'); setAccountingSubTab('suppliers'); }} className="w-full text-left py-1 px-2 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-white transition cursor-pointer">
                    🏢 সরবরাহকারী (Suppliers) ({suppliers.length})
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 4. Products & Inventory */}
          <div>
            <button
              onClick={() => isSidebarOpen ? setOpenAccordion(openAccordion === 'products' ? null : 'products') : setActiveTab('products')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition font-medium ${
                activeTab === 'products' ? 'bg-purple-50 text-purple-900 font-bold' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <Package className="w-4 h-4 text-slate-500 shrink-0" />
                {isSidebarOpen && <span>Products (পণ্য ও স্টক)</span>}
              </div>
              {isSidebarOpen && (
                openAccordion === 'products' ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>
            {isSidebarOpen && openAccordion === 'products' && (
              <div className="pl-9 pr-2 py-1 space-y-1 bg-slate-50/70 rounded-xl my-0.5 text-[11px]">
                <button onClick={() => { setActiveTab('products'); setProductSubTab('all'); setShowAddProductModal(true); }} className="w-full text-left py-1 px-2 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-white transition">
                  ➕ Create Product
                </button>
                <button onClick={() => { setActiveTab('products'); setProductSubTab('all'); }} className="w-full text-left py-1 px-2 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-white transition">
                  📋 All Products ({tenantProducts.length})
                </button>
                <button onClick={() => { setActiveTab('products'); setProductSubTab('brands'); }} className="w-full text-left py-1 px-2 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-white transition">
                  🏷️ Brand Master ({brands.filter(b => b.tenantId === tenant.id).length})
                </button>
                <button onClick={() => { setActiveTab('products'); setProductSubTab('sub_categories'); }} className="w-full text-left py-1 px-2 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-white transition">
                  🏷️ Sub-Categories ({subCategories.filter(s => s.tenantId === tenant.id).length})
                </button>
                <button onClick={() => { setActiveTab('products'); setProductSubTab('units'); }} className="w-full text-left py-1 px-2 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-white transition">
                  ⚖️ Units of Measure (UOM)
                </button>
                <button onClick={() => { setActiveTab('products'); setProductSubTab('opening_stock'); }} className="w-full text-left py-1 px-2 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-white transition">
                  🏢 Opening Stock Setup
                </button>
                <button onClick={() => { setActiveTab('products'); setProductSubTab('barcodes'); }} className="w-full text-left py-1 px-2 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-white transition">
                  🏷️ Print Barcodes & Labels
                </button>
                <button onClick={() => { setActiveTab('products'); setProductSubTab('update_import'); }} className="w-full text-left py-1 px-2 rounded-lg text-indigo-700 font-semibold hover:bg-white transition">
                  📥 Import (Update Only)
                </button>
                <button onClick={() => setIsBulkImportOpen(true)} className="w-full text-left py-1 px-2 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-white transition">
                  📥 Import New Products (CSV)
                </button>
                <button onClick={() => setIsStockAdjustmentOpen(true)} className="w-full text-left py-1 px-2 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-white transition">
                  ⚖️ Count & Adjust Stock
                </button>
              </div>
            )}
          </div>

          {/* 5. Sales & POS Terminal */}
          <div>
            <button
              onClick={() => isSidebarOpen ? setOpenAccordion(openAccordion === 'sales' ? null : 'sales') : setActiveTab('invoices')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition font-medium ${
                activeTab === 'invoices' ? 'bg-purple-50 text-purple-900 font-bold' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <ShoppingCart className="w-4 h-4 text-slate-500 shrink-0" />
                {isSidebarOpen && <span>Sales & POS (বিক্রয়)</span>}
              </div>
              {isSidebarOpen && (
                openAccordion === 'sales' ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>
            {isSidebarOpen && openAccordion === 'sales' && (
              <div className="pl-9 pr-2 py-1 space-y-1 bg-slate-50/70 rounded-xl my-0.5 text-[11px]">
                {hasPos && (
                  <button onClick={onOpenPOS} className="w-full text-left py-1 px-2 rounded-lg text-purple-700 font-bold hover:bg-white transition flex items-center justify-between">
                    <span>⚡ POS ক্যাশ কাউন্টার</span>
                    <span className="text-[9px] px-1 bg-emerald-100 text-emerald-800 rounded font-bold">Live</span>
                  </button>
                )}
                <button onClick={() => setActiveTab('invoices')} className="w-full text-left py-1 px-2 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-white transition">
                  🧾 All Sales & Invoices ({tenantSales.length})
                </button>
                <button onClick={() => setIsQuotationModalOpen(true)} className="w-full text-left py-1 px-2 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-white transition">
                  📝 Quotations ({quotations.length})
                </button>
                <button onClick={() => setIsChallanModalOpen(true)} className="w-full text-left py-1 px-2 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-white transition">
                  🚚 Delivery Challans ({deliveryChallans.length})
                </button>
                <button onClick={() => setIsCreditNoteModalOpen(true)} className="w-full text-left py-1 px-2 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-white transition">
                  🔄 Sales Return / Credit Notes
                </button>
              </div>
            )}
          </div>

          {/* 6. HRM (Strictly Conditional on hrm) */}
          {hasHrm && (
            <div>
              <button
                onClick={() => isSidebarOpen ? setOpenAccordion(openAccordion === 'hrm' ? null : 'hrm') : setActiveTab('hrm')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition font-medium ${
                  activeTab === 'hrm' ? 'bg-purple-50 text-purple-900 font-bold' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <UserCheck className="w-4 h-4 text-slate-500 shrink-0" />
                  {isSidebarOpen && <span>HRM (কর্মচারী ও বেতন)</span>}
                </div>
                {isSidebarOpen && (
                  openAccordion === 'hrm' ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>
              {isSidebarOpen && openAccordion === 'hrm' && (
                <div className="pl-9 pr-2 py-1 space-y-1 bg-slate-50/70 rounded-xl my-0.5 text-[11px]">
                  <button onClick={() => setActiveTab('hrm')} className="w-full text-left py-1 px-2 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-white transition">
                    👨‍💼 Employees ({employees.length})
                  </button>
                  <button onClick={() => setActiveTab('hrm')} className="w-full text-left py-1 px-2 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-white transition">
                    📅 Attendance & Leaves
                  </button>
                  <button onClick={() => setActiveTab('hrm')} className="w-full text-left py-1 px-2 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-white transition">
                    💰 Monthly Payroll
                  </button>
                  <button onClick={() => setActiveTab('hrm')} className="w-full text-left py-1 px-2 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-white transition">
                    🛡️ Roles & Permissions
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 7. Accounting (Strictly Conditional on accounting) */}
          {hasAccounting && (
            <div>
              <button
                onClick={() => isSidebarOpen ? setOpenAccordion(openAccordion === 'accounting' ? null : 'accounting') : setActiveTab('accounting')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition font-medium ${
                  activeTab === 'accounting' ? 'bg-purple-50 text-purple-900 font-bold' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <DollarSign className="w-4 h-4 text-slate-500 shrink-0" />
                  {isSidebarOpen && <span>Accounting (হিসাববিজ্ঞান)</span>}
                </div>
                {isSidebarOpen && (
                  openAccordion === 'accounting' ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>
              {isSidebarOpen && openAccordion === 'accounting' && (
                <div className="pl-9 pr-2 py-1 space-y-1 bg-slate-50/70 rounded-xl my-0.5 text-[11px]">
                  <button onClick={() => { setActiveTab('accounting'); setAccountingSubTab('coa'); }} className="w-full text-left py-1 px-2 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-white transition cursor-pointer">
                    📊 Chart of Accounts
                  </button>
                  <button onClick={() => { setActiveTab('accounting'); setAccountingSubTab('journal'); }} className="w-full text-left py-1 px-2 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-white transition cursor-pointer">
                    📖 General Journal & Ledger
                  </button>
                  <button onClick={() => { setActiveTab('accounting'); setAccountingSubTab('expenses'); }} className="w-full text-left py-1 px-2 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-white transition cursor-pointer">
                    📉 Expenses & Vouchers ({expenses.length})
                  </button>
                  <button onClick={() => { setActiveTab('accounting'); setAccountingSubTab('purchases'); }} className="w-full text-left py-1 px-2 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-white transition cursor-pointer">
                    🛒 Purchases (ক্রয় চালান) ({purchaseOrders.length})
                  </button>
                  <button onClick={() => { setActiveTab('accounting'); setAccountingSubTab('suppliers'); }} className="w-full text-left py-1 px-2 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-white transition cursor-pointer">
                    🏢 Suppliers & AP (মহাজন) ({suppliers.length})
                  </button>
                  <button onClick={() => { setActiveTab('accounting'); setAccountingSubTab('statements'); }} className="w-full text-left py-1 px-2 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-white transition cursor-pointer">
                    ⚖️ Trial Balance & Profit-Loss
                  </button>
                  <button onClick={() => { setActiveTab('accounting'); setAccountingSubTab('reconciliation'); }} className="w-full text-left py-1 px-2 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-white transition cursor-pointer">
                    🏦 Bank Reconciliation
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 8. Hardware & POS Devices (Phase 15 - Strictly Conditional on hardwareSuite) */}
          {hasHardware && (
            <button
              onClick={() => setActiveTab('hardware')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition font-medium ${
                activeTab === 'hardware'
                  ? 'bg-purple-700 text-white shadow-xs font-bold'
                  : 'text-slate-700 hover:bg-purple-50 hover:text-purple-900'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <Printer className={`w-4 h-4 shrink-0 ${activeTab === 'hardware' ? 'text-white' : 'text-slate-400'}`} />
                {isSidebarOpen && <span>হার্ডওয়্যার ও সানমি POS</span>}
              </div>
              {isSidebarOpen && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                  activeTab === 'hardware' ? 'bg-purple-800 text-purple-100' : 'bg-purple-100 text-purple-700'
                }`}>
                  Phase 15
                </span>
              )}
            </button>
          )}

          {/* 9. WhatsApp Bot & Loyalty (Phase 14 - Strictly Conditional on whatsappLoyalty) */}
          {hasWhatsappLoyalty && (
            <button
              onClick={() => setActiveTab('whatsapp_loyalty')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition font-medium ${
                activeTab === 'whatsapp_loyalty'
                  ? 'bg-purple-700 text-white shadow-xs font-bold'
                  : 'text-slate-700 hover:bg-purple-50 hover:text-purple-900'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <Smartphone className={`w-4 h-4 shrink-0 ${activeTab === 'whatsapp_loyalty' ? 'text-white' : 'text-slate-400'}`} />
                {isSidebarOpen && <span>হোয়াটসঅ্যাপ বট ও মেম্বারশিপ</span>}
              </div>
              {isSidebarOpen && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                  activeTab === 'whatsapp_loyalty' ? 'bg-purple-800 text-purple-100' : 'bg-purple-100 text-purple-700'
                }`}>
                  Phase 14
                </span>
              )}
            </button>
          )}

          {/* 10. AI Demand Forecast (Phase 12 - Strictly Conditional on ai) */}
          {hasAi && (
            <button
              onClick={() => setActiveTab('ai')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition font-medium ${
                activeTab === 'ai'
                  ? 'bg-purple-700 text-white shadow-xs font-bold'
                  : 'text-slate-700 hover:bg-purple-50 hover:text-purple-900'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <BrainCircuit className={`w-4 h-4 shrink-0 ${activeTab === 'ai' ? 'text-white' : 'text-slate-400'}`} />
                {isSidebarOpen && <span>AI ফোরকাস্ট ও অটো-পিও</span>}
              </div>
              {isSidebarOpen && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                  activeTab === 'ai' ? 'bg-purple-800 text-purple-100' : 'bg-purple-100 text-purple-700'
                }`}>
                  Phase 12
                </span>
              )}
            </button>
          )}

          {/* 11. Multi-Branch & Warehouses (Phase 11 - Strictly Conditional on multiWarehouse) */}
          {hasWarehouse && (
            <button
              onClick={() => setActiveTab('warehouses')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition font-medium ${
                activeTab === 'warehouses'
                  ? 'bg-purple-700 text-white shadow-xs font-bold'
                  : 'text-slate-700 hover:bg-purple-50 hover:text-purple-900'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <Layers className={`w-4 h-4 shrink-0 ${activeTab === 'warehouses' ? 'text-white' : 'text-slate-400'}`} />
                {isSidebarOpen && <span>ডিপো ও শাখা লজিস্টিকস</span>}
              </div>
              {isSidebarOpen && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                  activeTab === 'warehouses' ? 'bg-purple-800 text-purple-100' : 'bg-purple-100 text-purple-700'
                }`}>
                  Phase 11
                </span>
              )}
            </button>
          )}

          {/* 12. Global Commerce & Forex (Phase 13 - Strictly Conditional on globalCommerce) */}
          {hasGlobal && (
            <button
              onClick={() => setActiveTab('global')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition font-medium ${
                activeTab === 'global'
                  ? 'bg-purple-700 text-white shadow-xs font-bold'
                  : 'text-slate-700 hover:bg-purple-50 hover:text-purple-900'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <Globe className={`w-4 h-4 shrink-0 ${activeTab === 'global' ? 'text-white' : 'text-slate-400'}`} />
                {isSidebarOpen && <span>গ্লোবাল পেমেন্ট ও ফরেক্স</span>}
              </div>
              {isSidebarOpen && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                  activeTab === 'global' ? 'bg-purple-800 text-purple-100' : 'bg-purple-100 text-purple-700'
                }`}>
                  Phase 13
                </span>
              )}
            </button>
          )}

          {/* 13. Smart Hardware Suite (Phase 15 - Sunmi & iMin POS Native Hardware Integration) */}
          {hasHardware && (
            <button
              onClick={() => setActiveTab('hardware')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition font-medium ${
                activeTab === 'hardware'
                  ? 'bg-purple-700 text-white shadow-xs font-bold'
                  : 'text-slate-700 hover:bg-purple-50 hover:text-purple-900'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <Cpu className={`w-4 h-4 shrink-0 ${activeTab === 'hardware' ? 'text-white' : 'text-slate-400'}`} />
                {isSidebarOpen && <span>হার্ডওয়্যার ও থার্মাল প্রিন্টার</span>}
              </div>
              {isSidebarOpen && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                  activeTab === 'hardware' ? 'bg-purple-800 text-purple-100' : 'bg-purple-100 text-purple-700'
                }`}>
                  Phase 15
                </span>
              )}
            </button>
          )}

          {/* 14. Phase 18: Returns Management, Damages & Physical Stock Count Audit */}
          <button
            onClick={() => setActiveTab('returns')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition font-medium ${
              activeTab === 'returns'
                ? 'bg-purple-700 text-white shadow-xs font-bold'
                : 'text-slate-700 hover:bg-purple-50 hover:text-purple-900'
            }`}
          >
            <div className="flex items-center gap-3 truncate">
              <RotateCcw className={`w-4 h-4 shrink-0 ${activeTab === 'returns' ? 'text-white' : 'text-slate-400'}`} />
              {isSidebarOpen && <span>রিটার্ন, ড্যামেজ ও স্টক অডিট</span>}
            </div>
            {isSidebarOpen && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                activeTab === 'returns' ? 'bg-purple-800 text-purple-100' : 'bg-rose-100 text-rose-700'
              }`}>
                Phase 18
              </span>
            )}
          </button>

          {/* 15. Phase 19: Multi-Tier Sales Agent Commission Program & Rule Engine */}
          {hasCommissions && (
            <button
              onClick={() => setActiveTab('commissions')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition font-medium ${
                activeTab === 'commissions'
                  ? 'bg-purple-700 text-white shadow-xs font-bold'
                  : 'text-slate-700 hover:bg-purple-50 hover:text-purple-900'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <Award className={`w-4 h-4 shrink-0 ${activeTab === 'commissions' ? 'text-white' : 'text-slate-400'}`} />
                {isSidebarOpen && <span>কমিশন ও সেলস এজেন্ট</span>}
              </div>
              {isSidebarOpen && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                  activeTab === 'commissions' ? 'bg-purple-800 text-purple-100' : 'bg-amber-100 text-amber-800'
                }`}>
                  Phase 19
                </span>
              )}
            </button>
          )}

          {/* 16. Phase 20: Service, Repair Jobs & Maintenance Management (AMC / Warranty) */}
          {hasService && (
            <div>
              <button
                onClick={() => isSidebarOpen ? setOpenAccordion(openAccordion === 'service' ? null : 'service') : setActiveTab('service')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition font-medium ${
                  activeTab === 'service'
                    ? 'bg-purple-700 text-white shadow-xs font-bold'
                    : 'text-slate-700 hover:bg-purple-50 hover:text-purple-900'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <Wrench className={`w-4 h-4 shrink-0 ${activeTab === 'service' ? 'text-white' : 'text-slate-400'}`} />
                  {isSidebarOpen && <span>সার্ভিস, রিপেয়ার ও AMC</span>}
                </div>
                {isSidebarOpen && (
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                      activeTab === 'service' ? 'bg-purple-800 text-purple-100' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      Phase 20
                    </span>
                    {openAccordion === 'service' ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </div>
                )}
              </button>
              {isSidebarOpen && openAccordion === 'service' && (
                <div className="pl-9 pr-2 py-1 space-y-1 bg-slate-50/70 rounded-xl my-0.5 text-[11px]">
                  <button onClick={() => { setActiveTab('service'); setServiceSubTab('jobs'); }} className="w-full text-left py-1 px-2 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-white transition cursor-pointer">
                    🔧 রিপেয়ার জব টিকিট ({serviceTickets.length})
                  </button>
                  <button onClick={() => { setActiveTab('service'); setServiceSubTab('checklists'); }} className="w-full text-left py-1 px-2 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-white transition cursor-pointer">
                    📋 টেকনিক্যাল চেকলিস্ট ({inspectionChecklists.length})
                  </button>
                  <button onClick={() => { setActiveTab('service'); setServiceSubTab('amc'); }} className="w-full text-left py-1 px-2 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-white transition cursor-pointer">
                    🛡️ AMC রক্ষণাবেক্ষণ চুক্তি ({maintenanceContracts.length})
                  </button>
                  <button onClick={() => { setActiveTab('service'); setServiceSubTab('warranty'); }} className="w-full text-left py-1 px-2 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-white transition cursor-pointer">
                    🔍 IMEI / ওয়ারেন্টি ট্র্যাকার
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 17. Phase 21: Fixed Asset Management, Maintenance & Depreciation (SLM/WDV) */}
          {hasAssets && (
            <div>
              <button
                onClick={() => isSidebarOpen ? setOpenAccordion(openAccordion === 'assets' ? null : 'assets') : setActiveTab('assets')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition font-medium ${
                  activeTab === 'assets'
                    ? 'bg-purple-700 text-white shadow-xs font-bold'
                    : 'text-slate-700 hover:bg-purple-50 hover:text-purple-900'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <Building2 className={`w-4 h-4 shrink-0 ${activeTab === 'assets' ? 'text-white' : 'text-slate-400'}`} />
                  {isSidebarOpen && <span>স্থায়ী সম্পদ ও অবচয় (Assets)</span>}
                </div>
                {isSidebarOpen && (
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                      activeTab === 'assets' ? 'bg-purple-800 text-purple-100' : 'bg-blue-100 text-blue-800'
                    }`}>
                      Phase 21
                    </span>
                    {openAccordion === 'assets' ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </div>
                )}
              </button>
              {isSidebarOpen && openAccordion === 'assets' && (
                <div className="pl-9 pr-2 py-1 space-y-1 bg-slate-50/70 rounded-xl my-0.5 text-[11px]">
                  <button onClick={() => { setActiveTab('assets'); }} className="w-full text-left py-1 px-2 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-white transition cursor-pointer">
                    🏢 স্থায়ী সম্পদ খতিয়ান ({fixedAssets.length})
                  </button>
                  <button onClick={() => { setActiveTab('assets'); }} className="w-full text-left py-1 px-2 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-white transition cursor-pointer">
                    ✨ অবচয় ইঞ্জিন (SLM/WDV)
                  </button>
                  <button onClick={() => { setActiveTab('assets'); }} className="w-full text-left py-1 px-2 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-white transition cursor-pointer">
                    🛠️ মেরামত ও সার্ভিসিং ({assetMaintenanceLogs.length})
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 18. Phase 22: Projects, Tasks Kanban, Contracts & Appointment Bookings */}
          {hasProjects && (
            <div>
              <button
                onClick={() => isSidebarOpen ? setOpenAccordion(openAccordion === 'projects' ? null : 'projects') : setActiveTab('projects')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition font-medium ${
                  activeTab === 'projects'
                    ? 'bg-purple-700 text-white shadow-xs font-bold'
                    : 'text-slate-700 hover:bg-purple-50 hover:text-purple-900'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <FolderKanban className={`w-4 h-4 shrink-0 ${activeTab === 'projects' ? 'text-white' : 'text-slate-400'}`} />
                  {isSidebarOpen && <span>প্রজেক্ট, টাস্ক ও বুকিং</span>}
                </div>
                {isSidebarOpen && (
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                      activeTab === 'projects' ? 'bg-purple-800 text-purple-100' : 'bg-indigo-100 text-indigo-800'
                    }`}>
                      Phase 22
                    </span>
                    {openAccordion === 'projects' ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </div>
                )}
              </button>
              {isSidebarOpen && openAccordion === 'projects' && (
                <div className="pl-9 pr-2 py-1 space-y-1 bg-slate-50/70 rounded-xl my-0.5 text-[11px]">
                  <button onClick={() => { setActiveTab('projects'); }} className="w-full text-left py-1 px-2 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-white transition cursor-pointer">
                    📁 প্রজেক্ট ট্র্যাকার ({projects.length})
                  </button>
                  <button onClick={() => { setActiveTab('projects'); }} className="w-full text-left py-1 px-2 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-white transition cursor-pointer">
                    📋 টাস্ক কানবান বোর্ড ({projectTasks.length})
                  </button>
                  <button onClick={() => { setActiveTab('projects'); }} className="w-full text-left py-1 px-2 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-white transition cursor-pointer">
                    📄 বাণিজ্যিক চুক্তিপত্র ({commercialContracts.length})
                  </button>
                  <button onClick={() => { setActiveTab('projects'); }} className="w-full text-left py-1 px-2 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-white transition cursor-pointer">
                    📅 অ্যাপয়েন্টমেন্ট বুকিং ({appointmentBookings.length})
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 19. Phase 24: 3D Dashboard, Cash Register Shift Reports & Analytical Intelligence */}
          {hasAnalytics && (
            <div>
              <button
                onClick={() => isSidebarOpen ? setOpenAccordion(openAccordion === 'analytics' ? null : 'analytics') : setActiveTab('analytics')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition font-medium ${
                  activeTab === 'analytics'
                    ? 'bg-purple-700 text-white shadow-xs font-bold'
                    : 'text-slate-700 hover:bg-purple-50 hover:text-purple-900'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <Box className={`w-4 h-4 shrink-0 ${activeTab === 'analytics' ? 'text-white' : 'text-slate-400'}`} />
                  {isSidebarOpen && <span>৩ডি অ্যানালিটিক্স ও গোয়েন্দা হাব</span>}
                </div>
                {isSidebarOpen && (
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                      activeTab === 'analytics' ? 'bg-purple-800 text-purple-100' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      Phase 24
                    </span>
                    {openAccordion === 'analytics' ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </div>
                )}
              </button>
              {isSidebarOpen && openAccordion === 'analytics' && (
                <div className="pl-9 pr-2 py-1 space-y-1 bg-slate-50/70 rounded-xl my-0.5 text-[11px]">
                  <button onClick={() => { setActiveTab('analytics'); setAnalyticsSubTab('3d_dashboard'); }} className="w-full text-left py-1 px-2 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-white transition cursor-pointer">
                    🧊 ৩ডি সেলস ও ব্রাঞ্চ ড্যাশবোর্ড
                  </button>
                  <button onClick={() => { setActiveTab('analytics'); setAnalyticsSubTab('cash_register'); }} className="w-full text-left py-1 px-2 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-white transition cursor-pointer flex items-center justify-between">
                    <span>💵 ক্যাশ রেজিস্টার শিফট ও Z-রিপোর্ট</span>
                    {cashRegisterShifts.filter(s => s.status === 'open').length > 0 && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    )}
                  </button>
                  <button onClick={() => { setActiveTab('analytics'); setAnalyticsSubTab('inventory_radar'); }} className="w-full text-left py-1 px-2 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-white transition cursor-pointer flex items-center justify-between">
                    <span>⚠️ ইনভেন্টরি গোয়েন্দা ও স্টক এজিং</span>
                    {products.filter(p => p.stock <= 0).length > 0 && (
                      <span className="text-[9px] px-1.5 py-0.2 bg-rose-500 text-white rounded-full font-bold">
                        {products.filter(p => p.stock <= 0).length}
                      </span>
                    )}
                  </button>
                  <button onClick={() => { setActiveTab('analytics'); setAnalyticsSubTab('ranking_matrix'); }} className="w-full text-left py-1 px-2 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-white transition cursor-pointer">
                    🏆 কাস্টমার ও সাপ্লায়ার র্যাঙ্কিং
                  </button>
                  <button onClick={() => { setActiveTab('analytics'); setAnalyticsSubTab('security_audit'); }} className="w-full text-left py-1 px-2 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-white transition cursor-pointer flex items-center justify-between">
                    <span>🛡️ সিকিউরিটি ও সিস্টেম অডিট লগ</span>
                    {systemErrorLogs.filter(e => !e.resolved).length > 0 && (
                      <span className="text-[9px] px-1.5 py-0.2 bg-amber-500 text-slate-900 rounded-full font-bold">
                        {systemErrorLogs.filter(e => !e.resolved).length}
                      </span>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 20. Phase 25: Enterprise Integrations, Cloud Sync & Security Hub */}
          <div>
            <button
              onClick={() => isSidebarOpen ? setOpenAccordion(openAccordion === 'integrations' ? null : 'integrations') : setActiveTab('integrations')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition font-medium ${
                activeTab === 'integrations'
                  ? 'bg-purple-700 text-white shadow-xs font-bold'
                  : 'text-slate-700 hover:bg-purple-50 hover:text-purple-900'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <Globe className={`w-4 h-4 shrink-0 ${activeTab === 'integrations' ? 'text-white' : 'text-slate-400'}`} />
                {isSidebarOpen && <span>ইন্টিগ্রেশন ও ক্লাউড সিঙ্ক</span>}
              </div>
              {isSidebarOpen && (
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                    activeTab === 'integrations' ? 'bg-purple-800 text-purple-100' : 'bg-purple-100 text-purple-800'
                  }`}>
                    Phase 25
                  </span>
                  {openAccordion === 'integrations' ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </div>
              )}
            </button>
            {isSidebarOpen && openAccordion === 'integrations' && (
              <div className="pl-9 pr-2 py-1 space-y-1 bg-slate-50/70 rounded-xl my-0.5 text-[11px]">
                <button onClick={() => { setActiveTab('integrations'); setIntegrationsSubTab('quickbooks'); }} className="w-full text-left py-1 px-2 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-white transition cursor-pointer flex items-center justify-between">
                  <span>⚡ কুইকবুকস (QuickBooks)</span>
                  <span className="text-[9px] px-1 bg-emerald-100 text-emerald-800 rounded font-bold">Live</span>
                </button>
                <button onClick={() => { setActiveTab('integrations'); setIntegrationsSubTab('woocommerce'); }} className="w-full text-left py-1 px-2 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-white transition cursor-pointer">
                  🛒 উ-কমার্স (WooCommerce API)
                </button>
                <button onClick={() => { setActiveTab('integrations'); setIntegrationsSubTab('webhooks'); }} className="w-full text-left py-1 px-2 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-white transition cursor-pointer flex items-center justify-between">
                  <span>📡 ওয়েবহুকস (Webhooks Hub)</span>
                  <span className="text-[9px] px-1 bg-purple-100 text-purple-800 rounded font-bold font-mono">HMAC</span>
                </button>
                <button onClick={() => { setActiveTab('integrations'); setIntegrationsSubTab('sessions'); }} className="w-full text-left py-1 px-2 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-white transition cursor-pointer flex items-center justify-between">
                  <span>🔒 ডিভাইস ও সেশন কন্ট্রোল</span>
                  <span className="text-[9px] px-1 bg-emerald-100 text-emerald-800 rounded font-bold">{activeSessions.length}</span>
                </button>
                <button onClick={() => { setActiveTab('integrations'); setIntegrationsSubTab('system_health'); }} className="w-full text-left py-1 px-2 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-white transition cursor-pointer">
                  💾 ডাটাবেজ ব্যাকআপ ও রিস্টোর
                </button>
              </div>
            )}
          </div>

          {/* 19. Settings */}
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition font-medium ${
              activeTab === 'settings'
                ? 'bg-purple-700 text-white shadow-xs font-bold'
                : 'text-slate-700 hover:bg-purple-50 hover:text-purple-900'
            }`}
          >
            <div className="flex items-center gap-3 truncate">
              <Settings className={`w-4 h-4 shrink-0 ${activeTab === 'settings' ? 'text-white' : 'text-slate-400'}`} />
              {isSidebarOpen && <span>স্টোর সেটিংস</span>}
            </div>
          </button>
        </nav>

        {/* Sidebar Footer - Switch Tenant & Public Link */}
        <div className="p-3 border-t border-slate-100 bg-slate-50 space-y-2">
          {isSidebarOpen && (
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                অন্য দোকানে স্যুইচ করুন:
              </label>
              <select
                value={tenant.id}
                onChange={e => onSelectTenant(e.target.value)}
                className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none"
              >
                {tenants.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.businessType})
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={onOpenStorefront}
            className="w-full py-2 bg-white border border-purple-200 text-purple-800 hover:bg-purple-50 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs"
          >
            <Eye className="w-3.5 h-3.5" />
            {isSidebarOpen && <span>অনলাইন স্টোরফ্রন্ট প্রিভিউ</span>}
          </button>
        </div>
      </aside>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navigation Bar (Mobile Header or Desktop Header) */}
        {isMobileView ? (
          <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 py-2.5 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMobileDrawerOpen(true)}
                className="p-1.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title="মেনু খুলুন"
              >
                <Menu className="w-5 h-5 stroke-[2.2]" />
              </button>
              <button
                onClick={() => setActiveTab('dashboard')}
                className="p-1.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1.5 text-xs font-bold"
                title="ড্যাশবোর্ডে ফিরুন"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="capitalize">{activeTab}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onOpenCalculator}
                style={{ backgroundColor: primaryColor }}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs"
                title="ক্যালকুলেটর"
              >
                <Calculator className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300"
                title="ডার্ক মোড"
              >
                {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsMobileView(false)}
                className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300"
                title="ডেস্কটপ ভিউতে যান"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <div className="flex items-center gap-1 pl-1">
                <div style={{ color: primaryColor }} className="font-black text-base tracking-tighter flex items-center">
                  <span className="italic font-serif text-xl font-black leading-none">$</span>
                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 block -ml-0.5 mt-2.5">STOCKY</span>
                </div>
              </div>
            </div>
          </header>
        ) : (
          <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between z-20 shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 lg:hidden"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Quick Breadcrumb */}
              <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold text-purple-700">{tenant.name}</span>
                <span>/</span>
                <span className="capitalize">{activeTab}</span>
              </div>
            </div>

            {/* Right Action Icons */}
            <div className="flex items-center gap-2.5">
              {/* Mobile View Toggle Button */}
              <button
                onClick={() => setIsMobileView(true)}
                className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
                title="মোবাইল ভিউ (Mobile V2 Parity)"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">মোবাইল ভিউ</span>
              </button>

              {/* Data Reset & Clean Production Mode */}
              <button
                onClick={onOpenDataResetManager}
                className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-rose-200 shadow-2xs"
                title="ডামি ডাটা রিসেট ও ব্যাকআপ"
              >
                <Database className="w-3.5 h-3.5 text-rose-600" />
                <span className="hidden xl:inline">রিয়েল ডেটা ও রিসেট</span>
              </button>

              {/* Quick POS Launch Button (Purple) */}
              <button
                onClick={onOpenPOS}
                className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>POS কাউন্টার</span>
              </button>

              {/* Quick Calculator Tool */}
              <button
                onClick={onOpenCalculator}
                className="p-2 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 transition"
                title="ক্যালকুলেটর"
              >
                <Calculator className="w-4 h-4" />
              </button>

              {/* Online Store Shortcut */}
              <button
                onClick={onOpenStorefront}
                className="hidden md:flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition"
                title="অনলাইন ওয়েবসাইট"
              >
                <Globe className="w-3.5 h-3.5 text-purple-600" />
                <span>ই-কমার্স সাইট</span>
              </button>

              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => setActiveTab('ecommerce')}
                  className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition relative"
                  title="নোটিফিকেশন"
                >
                  <Bell className="w-4 h-4" />
                  {tenantOrders.filter(o => o.status === 'pending').length > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  )}
                </button>
              </div>

              {/* Super Admin Return Access (Only visible when Platform Owner is Impersonating) */}
              {isImpersonating && (
                <button
                  onClick={onOpenSuperAdmin}
                  className="px-2.5 py-1.5 rounded-xl bg-purple-900 text-purple-200 hover:bg-purple-800 transition flex items-center gap-1.5 text-xs font-bold"
                  title="সুপার অ্যাডমিন কনসোলে ফিরুন"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                  <span className="hidden sm:inline">সুপার কনসোল</span>
                </button>
              )}

              {/* User Profile */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-800 font-bold text-xs flex items-center justify-center">
                  {tenant.ownerName.charAt(0)}
                </div>
                <div className="hidden lg:block text-left text-xs">
                  <span className="font-bold text-slate-900 block leading-tight">{tenant.ownerName}</span>
                  <span className="text-[10px] text-slate-400 capitalize">{tenant.plan} Plan</span>
                </div>
              </div>
            </div>
          </header>
        )}

        {/* Global Broadcast Announcement */}
        {systemBroadcast && (
          <div className="bg-amber-500 text-slate-950 px-6 py-2 text-xs font-medium flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{systemBroadcast}</span>
            </div>
          </div>
        )}

        {/* Dynamic Body Content */}
        <main className={`flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 ${isMobileView ? 'pb-24 max-w-md mx-auto w-full' : ''}`}>
          {activeTab === 'dashboard' && (
            <>
              {/* Purple Hero Banner (Matching the screenshot exactly) */}
              <div className="bg-gradient-to-r from-purple-800 via-purple-700 to-indigo-800 rounded-3xl p-6 text-white shadow-md">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                      Dashboard - স্বাগতম, {tenant.name}!
                    </h1>
                    <p className="text-xs sm:text-sm text-purple-200 mt-1">
                      আজকের সার্বিক ব্যবসায়িক হিসাব, লাইভ ইনভেন্টরি ও বিক্রয় চিত্র
                    </p>
                  </div>

                  {/* Filter by warehouse & Date range picker */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {/* Warehouse Selector */}
                    <div className="bg-purple-900/60 border border-purple-400/30 rounded-xl px-3 py-1.5 flex items-center gap-2">
                      <Store className="w-3.5 h-3.5 text-purple-300" />
                      <select
                        value={activeWarehouseId}
                        onChange={e => onSelectWarehouse(e.target.value)}
                        className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
                      >
                        <option value="all" className="text-slate-900">সকল ওয়্যারহাউস / ব্রাঞ্চ</option>
                        {warehouses.filter(w => w.tenantId === tenant.id).map(w => (
                          <option key={w.id} value={w.id} className="text-slate-900">
                            {w.name} ({w.location})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Date Filter */}
                    <div className="bg-purple-900/60 border border-purple-400/30 rounded-xl px-3 py-1.5 flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-purple-300" />
                      <select
                        value={dateRange}
                        onChange={e => setDateRange(e.target.value as any)}
                        className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
                      >
                        <option value="today" className="text-slate-900">আজকের হিসাব (Today)</option>
                        <option value="7days" className="text-slate-900">গত ৭ দিন (Last 7 Days)</option>
                        <option value="month" className="text-slate-900">চলতি মাস (This Month)</option>
                        <option value="year" className="text-slate-900">এই বছর (This Year)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* 8 Metric Summary KPI Cards (Exact replica from the screenshot) */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* 1. Sales */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs hover:shadow-xs transition">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Sales</span>
                    <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                      <ShoppingCart className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-slate-900 mt-2">
                    {tenant.currency}{totalSalesAmount.toFixed(2)}
                  </div>
                  <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-0.5 mt-0.5">
                    <TrendingUp className="w-3 h-3" /> +12.5% গত সপ্তাহের তুলনায়
                  </span>
                </div>

                {/* 2. Purchases */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs hover:shadow-xs transition">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Purchases</span>
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <Package className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-slate-900 mt-2">
                    {tenant.currency}{(totalCostAmount * 1.3).toFixed(2)}
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">সাপ্লায়ার ইনভয়েস</span>
                </div>

                {/* 3. Sales Return */}
                <div 
                  onClick={() => { setActiveTab('returns'); setReturnsSubTab('sales_returns'); }}
                  className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs hover:shadow-xs transition cursor-pointer hover:border-amber-300"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Sales Return</span>
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                      <ArrowDownRight className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-slate-900 mt-2">
                    {tenant.currency}{tenantCreditNotes.reduce((acc, c) => acc + c.totalRefundAmount, 0).toFixed(2)}
                  </div>
                  <span className="text-[10px] text-amber-700 font-medium block mt-0.5">
                    {tenantCreditNotes.length} টি বিক্রয় ফেরত ভাউচার →
                  </span>
                </div>

                {/* 4. Purchases Return */}
                <div 
                  onClick={() => { setActiveTab('returns'); setReturnsSubTab('purchase_returns'); }}
                  className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs hover:shadow-xs transition cursor-pointer hover:border-rose-300"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Purchases Return</span>
                    <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-slate-900 mt-2">
                    {tenant.currency}{purchaseReturns.filter(pr => pr.tenantId === tenant.id).reduce((acc, p) => acc + p.totalRefundAmount, 0).toFixed(2)}
                  </div>
                  <span className="text-[10px] text-rose-700 font-medium block mt-0.5">
                    {purchaseReturns.filter(pr => pr.tenantId === tenant.id).length} টি ডেবিট নোট চালান →
                  </span>
                </div>

                {/* 5. Sales Due (বাকি খাতা) */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs hover:shadow-xs transition">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Sales Due (বাকি)</span>
                    <div className="w-8 h-8 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-cyan-700 mt-2">
                    {tenant.currency}{totalSalesDue.toFixed(2)}
                  </div>
                  <span className="text-[10px] text-cyan-600 font-medium block mt-0.5">
                    {tenantCustomers.filter(c => c.dueAmount > 0).length} জন গ্রাহকের বাকি
                  </span>
                </div>

                {/* 6. Total Purchase Due */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs hover:shadow-xs transition">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Total Purchase Due</span>
                    <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center">
                      <DollarSign className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-slate-900 mt-2">
                    {tenant.currency}0.00
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">কোম্পানি বকেয়া পরিশোধিত</span>
                </div>

                {/* 7. Invoice Count */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs hover:shadow-xs transition">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Invoices</span>
                    <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                      <Printer className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-slate-900 mt-2">
                    {tenantSales.length}
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">মোট মুদ্রিত মেমো</span>
                </div>

                {/* 8. Profit */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs hover:shadow-xs transition">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Profit (লাভ)</span>
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-emerald-700 mt-2">
                    {tenant.currency}{totalProfit.toFixed(2)}
                  </div>
                  <span className="text-[10px] text-emerald-600 font-medium block mt-0.5">নিট লাভ মার্জিন</span>
                </div>
              </div>

              {/* Special Alerts for Pharmacy & Grocery */}
              {tenant.businessType === 'pharmacy' && nearExpiryProducts.length > 0 && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-rose-900">
                        জরুরি ফার্মেসি ড্রাগ এক্সপায়ারি সতর্কতা!
                      </h4>
                      <p className="text-xs text-rose-700">
                        {nearExpiryProducts.length}টি ওষুধের মেয়াদ আগামী ৬০-৯০ দিনের মধ্যে শেষ হচ্ছে (যেমন: {nearExpiryProducts.map(p => p.name).join(', ')})।
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('products')}
                    className="px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold transition shrink-0"
                  >
                    তালিকা দেখুন
                  </button>
                </div>
              )}

              {/* Phase 12: AI Autonomous Demand & Auto-PO Banner */}
              <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-2xl p-4 sm:p-5 text-white shadow-md border border-purple-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-400/30 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-purple-300" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-sm sm:text-base text-white">
                        AI অটোনোমাস স্টকআউট রাডার ও স্মার্ট রি-অর্ডার হাব
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                        Phase 12 Live
                      </span>
                    </div>
                    <p className="text-xs text-purple-200 mt-0.5">
                      গাণিতিক সেলস ভেলোসিটি ($V$) ও ROP হিসাব অনুযায়ী {autoPurchaseOrders.length}টি অটো-পিও প্রস্তুত রয়েছে।
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setActiveTab('ai')}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <TrendingUp className="w-3.5 h-3.5" /> AI ফোরকাস্ট ও অটো-পিও ড্যাশবোর্ড →
                  </button>
                </div>
              </div>

              {lowStockProducts.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold shrink-0">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-amber-900">
                        লো-স্টক (Low Stock) রিমাইন্ডার!
                      </h4>
                      <p className="text-xs text-amber-700">
                        {lowStockProducts.length}টি পণ্যের মজুদ বিপজ্জনকভাবে কমে গেছে (যেমন: {lowStockProducts.map(p => `${p.name} [স্টক: ${p.stock}]`).join(', ')})।
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setActiveTab('ai')}
                      className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> AI অটো-পিও তৈরি করুন
                    </button>
                    <button
                      onClick={() => setActiveTab('products')}
                      className="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      পণ্য তালিকা
                    </button>
                  </div>
                </div>
              )}

              {/* Charts & Stock Value Widgets (Exact layout as user screenshot) */}
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Left 2 Cols: Sales & Purchases Interactive Chart Widget */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">Sales & Purchases</h3>
                      <p className="text-[11px] text-slate-400">রিয়েল-টাইম বিক্রয় ও ক্রয়ের তুলনামূলক চার্ট</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1.5 text-purple-700 font-semibold">
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-700" /> Sales
                      </span>
                      <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Purchases
                      </span>
                    </div>
                  </div>

                  {/* Simulated interactive SVG / bar chart */}
                  <div className="h-56 flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-slate-100">
                    {[
                      { day: 'শনি', sales: 65, pur: 40 },
                      { day: 'রবি', sales: 85, pur: 55 },
                      { day: 'সোম', sales: 45, pur: 30 },
                      { day: 'মঙ্গল', sales: 90, pur: 70 },
                      { day: 'বুধ', sales: 75, pur: 45 },
                      { day: 'বৃহস্পতি', sales: 110, pur: 60 },
                      { day: 'শুক্র', sales: 135, pur: 80 },
                    ].map((bar, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                        <div className="w-full flex items-end justify-center gap-1.5 h-full">
                          {/* Sales Bar */}
                          <div
                            style={{ height: `${(bar.sales / 150) * 100}%` }}
                            className="w-4 bg-purple-600 group-hover:bg-purple-700 rounded-t-md transition-all relative"
                          >
                            <span className="opacity-0 group-hover:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] px-1 py-0.5 rounded whitespace-nowrap z-10 transition">
                              ৳{bar.sales * 100}
                            </span>
                          </div>
                          {/* Purchases Bar */}
                          <div
                            style={{ height: `${(bar.pur / 150) * 100}%` }}
                            className="w-4 bg-emerald-400 group-hover:bg-emerald-500 rounded-t-md transition-all relative"
                          >
                            <span className="opacity-0 group-hover:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] px-1 py-0.5 rounded whitespace-nowrap z-10 transition">
                              ৳{bar.pur * 100}
                            </span>
                          </div>
                        </div>
                        <span className="text-[11px] font-medium text-slate-500">{bar.day}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-3 text-xs text-slate-500">
                    <span>সর্বোচ্চ বিক্রি: শুক্রবার (৳ ১৩,৫০০.০০)</span>
                    <span className="text-emerald-600 font-semibold">সাপ্তাহিক প্রবৃদ্ধি: +১৮%</span>
                  </div>
                </div>

                {/* Right Col: Stock Value Widget (From Screenshot) */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Stock Value</h3>
                    <p className="text-[11px] text-slate-400 mb-4">মোট পণ্য ইনভেন্টরি মূল্যায়ন</p>

                    <div className="space-y-3">
                      {/* Stock Value by Cost (Blue badge) */}
                      <div className="p-3 rounded-xl bg-sky-50 border border-sky-100">
                        <div className="flex items-center justify-between text-xs font-semibold text-sky-800">
                          <span>Stock Value by Cost</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-200 text-sky-900">কেনা দর</span>
                        </div>
                        <div className="text-lg font-bold text-sky-950 mt-1">
                          {tenant.currency}{totalStockCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                      </div>

                      {/* Stock Value by Retail (Yellow badge) */}
                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
                        <div className="flex items-center justify-between text-xs font-semibold text-amber-800">
                          <span>Stock Value by Retail</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">খুচরা বেচা দর</span>
                        </div>
                        <div className="text-lg font-bold text-amber-950 mt-1">
                          {tenant.currency}{totalStockRetail.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                      </div>

                      {/* Stock Value by Wholesale (Purple badge) */}
                      <div className="p-3 rounded-xl bg-purple-50 border border-purple-100">
                        <div className="flex items-center justify-between text-xs font-semibold text-purple-800">
                          <span>Stock Value by Wholesale</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-200 text-purple-900">পাইকারি দর</span>
                        </div>
                        <div className="text-lg font-bold text-purple-950 mt-1">
                          {tenant.currency}{totalStockWholesale.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>মোট স্টক আইটেম:</span>
                    <strong className="text-slate-800">{tenantProducts.length} প্রকার</strong>
                  </div>
                </div>
              </div>

              {/* Bottom Row: Top Selling Products & Payment Distribution */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Top Selling Products */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-sm text-slate-900">Top Selling Products</h3>
                    <button onClick={() => setActiveTab('products')} className="text-xs text-purple-700 hover:underline">
                      সব দেখুন
                    </button>
                  </div>
                  <div className="divide-y divide-slate-100 text-xs">
                    {tenantProducts.slice(0, 4).map((p, idx) => (
                      <div key={p.id} className="py-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold flex items-center justify-center">
                            #{idx + 1}
                          </span>
                          <div>
                            <div className="font-semibold text-slate-900">{p.name}</div>
                            <div className="text-[10px] text-slate-400">{p.category} • স্টক: {p.stock} {p.unit}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-purple-700">{tenant.currency}{p.sellingPrice.toFixed(2)}</div>
                          <div className="text-[10px] text-emerald-600 font-medium">ইন-স্টক</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sales by Payment Method */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
                  <h3 className="font-bold text-sm text-slate-900 mb-3">Sales by Payment Method</h3>
                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between text-slate-700 mb-1">
                        <span className="font-semibold">নগদ ক্যাশ (Cash)</span>
                        <span className="font-bold">৬৫% (৳ ১২,০৫০.০০)</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-700 rounded-full" style={{ width: '65%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-700 mb-1">
                        <span className="font-semibold">বিকাশ / নগদ (Mobile MFS)</span>
                        <span className="font-bold">২২% (৳ ৪,১০০.০০)</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-pink-500 rounded-full" style={{ width: '22%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-700 mb-1">
                        <span className="font-semibold">বাকি খাতায় বকেয়া (Credit / Due)</span>
                        <span className="font-bold">১৩% (৳ ২,৪০০.০০)</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-rose-500 rounded-full" style={{ width: '13%' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* PRODUCTS TAB - Phase 1 Full Implementation & Phase 17 Product Hierarchy */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              {/* Product Ecosystem Sub-Navigation Bar */}
              <div className="bg-white p-2.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
                <button
                  onClick={() => setProductSubTab('all')}
                  className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    productSubTab === 'all'
                      ? 'bg-purple-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Package className="w-3.5 h-3.5" /> সকল পণ্য ({tenantProducts.length})
                </button>

                <button
                  onClick={() => setProductSubTab('brands')}
                  className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    productSubTab === 'brands'
                      ? 'bg-purple-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" /> ব্র্যান্ড মাস্টার ({brands.filter(b => b.tenantId === tenant.id).length})
                </button>

                <button
                  onClick={() => setProductSubTab('sub_categories')}
                  className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    productSubTab === 'sub_categories'
                      ? 'bg-purple-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Tag className="w-3.5 h-3.5" /> সাব-ক্যাটাগরি ({subCategories.filter(s => s.tenantId === tenant.id).length})
                </button>

                <button
                  onClick={() => setProductSubTab('units')}
                  className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    productSubTab === 'units'
                      ? 'bg-purple-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Scale className="w-3.5 h-3.5" /> পরিমাপ একক ও কনভার্সন ({units.filter(u => u.tenantId === tenant.id).length})
                </button>

                <button
                  onClick={() => setProductSubTab('opening_stock')}
                  className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    productSubTab === 'opening_stock'
                      ? 'bg-purple-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" /> প্রারম্ভিক স্টক এন্ট্রি ({openingStocks.filter(o => o.tenantId === tenant.id).length})
                </button>

                <button
                  onClick={() => setProductSubTab('barcodes')}
                  className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    productSubTab === 'barcodes'
                      ? 'bg-purple-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Barcode className="w-3.5 h-3.5" /> বারকোড ও স্টিকার শিট স্টুডিও
                </button>

                <button
                  onClick={() => setProductSubTab('update_import')}
                  className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    productSubTab === 'update_import'
                      ? 'bg-indigo-700 text-white shadow-xs'
                      : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                  }`}
                >
                  <UploadCloud className="w-3.5 h-3.5" /> Import (Update Only) এক্সেল
                </button>
              </div>

              {productSubTab !== 'all' ? (
                <ProductHierarchyManager
                  tenant={tenant}
                  products={tenantProducts}
                  warehouses={warehouses}
                  categories={categories.length > 0 ? categories : [
                    { id: 'cat-1', tenantId: tenant.id, name: 'General' }
                  ]}
                  brands={brands}
                  subCategories={subCategories}
                  units={units}
                  openingStocks={openingStocks}
                  initialTab={productSubTab}
                  onSaveBrand={onSaveBrand}
                  onDeleteBrand={onDeleteBrand}
                  onSaveSubCategory={onSaveSubCategory}
                  onDeleteSubCategory={onDeleteSubCategory}
                  onSaveUnit={onSaveUnit}
                  onDeleteUnit={onDeleteUnit}
                  onSaveOpeningStock={onSaveOpeningStock}
                  onBulkUpdateProducts={onBulkUpdateProducts}
                />
              ) : (
                <>
                  {/* Top Header & Action Controls */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <Package className="w-5 h-5 text-purple-700" />
                        পণ্য ও ইনভেন্টরি হাব (JH IMSE Products Engine)
                      </h2>
                      <p className="text-xs text-slate-500">
                        {tenant.businessType === 'pharmacy' && 'ওষুধের স্টক, মেয়াদোত্তীর্ণ তারিখ, ড্রাগ লাইসেন্স ও প্রস্তুতকারক ট্র্যাকিং'}
                        {tenant.businessType === 'grocery' && 'খুচরা ও পাইকারি দর, বারকোড এবং ডিজিটাল স্কেল ওজন'}
                        {tenant.businessType === 'electronics' && 'আইএমইআই সিরিয়াল নম্বর ও সার্ভিসিং ওয়ারেন্টি'}
                        {tenant.businessType === 'warehouse' && 'মাল্টি-ডিপো কার্টুন স্টক ও হোলসেল লট'}
                      </p>
                    </div>

                    {/* 7 Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => setShowAddProductModal(true)}
                        className="px-3.5 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <Plus className="w-4 h-4" /> নতুন পণ্য
                      </button>

                      <button
                        onClick={() => setProductSubTab('barcodes')}
                        className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                      >
                        <Barcode className="w-4 h-4 text-purple-700" /> বারকোড স্টিকার
                      </button>

                      <button
                        onClick={() => setProductSubTab('brands')}
                        className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                      >
                        <Bookmark className="w-4 h-4 text-purple-700" /> ব্র্যান্ড ও UOM
                      </button>

                      <button
                        onClick={() => setProductSubTab('opening_stock')}
                        className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                      >
                        <Building2 className="w-4 h-4 text-purple-700" /> প্রারম্ভিক স্টক
                      </button>

                      <button
                        onClick={() => setProductSubTab('update_import')}
                        className="px-3 py-2 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                      >
                        <UploadCloud className="w-4 h-4 text-indigo-600" /> Import (Update Only)
                      </button>

                      <button
                        onClick={() => setIsBulkImportOpen(true)}
                        className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                      >
                        <UploadCloud className="w-4 h-4 text-slate-600" /> CSV ইমপোর্ট
                      </button>

                      <button
                        onClick={handleExportCSV}
                        className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                      >
                        <Download className="w-4 h-4 text-emerald-600" /> CSV এক্সপোর্ট
                      </button>

                      <button
                        onClick={() => setIsStockAdjustmentOpen(true)}
                        className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                      >
                        <SlidersHorizontal className="w-4 h-4 text-amber-600" /> +/- স্টক সমন্বয়
                      </button>
                    </div>
                  </div>

              {/* Status Filter Tabs & Search Bar */}
              <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
                {/* Status Badges */}
                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                  <button
                    onClick={() => setProductStatusFilter('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                      productStatusFilter === 'all'
                        ? 'bg-purple-700 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    সকল পণ্য ({tenantProducts.length})
                  </button>

                  <button
                    onClick={() => setProductStatusFilter('low_stock')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap flex items-center gap-1 ${
                      productStatusFilter === 'low_stock'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                    }`}
                  >
                    লো-স্টক ({lowStockProducts.length})
                  </button>

                  <button
                    onClick={() => setProductStatusFilter('near_expiry')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap flex items-center gap-1 ${
                      productStatusFilter === 'near_expiry'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
                    }`}
                  >
                    মেয়াদোত্তীর্ণ সংকেত ({nearExpiryProducts.length})
                  </button>

                  <button
                    onClick={() => setProductStatusFilter('out_of_stock')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                      productStatusFilter === 'out_of_stock'
                        ? 'bg-slate-800 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    স্টক নেই ({outOfStockProducts.length})
                  </button>
                </div>

                {/* Instant Search Bar */}
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={productSearchQuery}
                    onChange={e => setProductSearchQuery(e.target.value)}
                    placeholder="পণ্য, SKU, জেনেরিক বা তাক নম্বর..."
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-600"
                  />
                  {productSearchQuery && (
                    <button
                      onClick={() => setProductSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Products Table Card */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                {displayedProducts.length === 0 ? (
                  <div className="p-12 text-center text-slate-500">
                    <Package className="w-12 h-12 stroke-[1.2] mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-700">কোনো পণ্য পাওয়া যায়নি</p>
                    <p className="text-xs text-slate-400 mt-1">ফিল্টার বা সার্চ কি-ওয়ার্ড পরিবর্তন করে দেখুন।</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                        <tr>
                          <th className="py-3 px-4">পণ্য ও স্পেসিফিকেশন</th>
                          <th className="py-3 px-4">ক্যাটাগরি ও লোকেশন</th>
                          <th className="py-3 px-4">মূল্য বিবরণ (কেনা / পাইকারি / বেচা)</th>
                          <th className="py-3 px-4">বর্তমান মজুদ</th>
                          {tenant.businessType === 'pharmacy' && <th className="py-3 px-4">মেয়াদ ও ব্যাচ নং</th>}
                          {tenant.businessType === 'electronics' && <th className="py-3 px-4">ব্র্যান্ড ও ওয়ারেন্টি</th>}
                          <th className="py-3 px-4 text-center">অনলাইন স্টোর</th>
                          <th className="py-3 px-4 text-right">অ্যাকশন</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {displayedProducts.map(p => {
                          const isLow = p.stock > 0 && p.stock <= p.alertStock;
                          const isOut = p.stock <= 0;

                          return (
                            <tr key={p.id} className="hover:bg-slate-50/80 transition">
                              {/* Product Info */}
                              <td className="py-3 px-4">
                                <div className="font-bold text-slate-900 text-xs">{p.name}</div>
                                <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5 mt-0.5">
                                  <span>SKU: {p.sku}</span>
                                  {p.genericName && (
                                    <span className="text-purple-700 italic font-sans font-medium">• {p.genericName}</span>
                                  )}
                                </div>
                                {p.manufacturer && (
                                  <div className="text-[9px] text-slate-400 font-medium">কোম্পানি: {p.manufacturer}</div>
                                )}
                              </td>

                              {/* Category & Rack */}
                              <td className="py-3 px-4">
                                <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px]">
                                  {p.category}
                                </span>
                                {p.rackNumber && (
                                  <div className="text-[10px] text-purple-700 font-semibold mt-1">
                                    তাক নং: {p.rackNumber}
                                  </div>
                                )}
                              </td>

                              {/* Pricing (3 Tier) */}
                              <td className="py-3 px-4">
                                <div className="font-bold text-purple-700 text-xs">
                                  বিক্রয়: {tenant.currency}{p.sellingPrice.toFixed(2)}
                                </div>
                                <div className="text-[10px] text-slate-400 flex gap-2 mt-0.5">
                                  <span>কেনা: {tenant.currency}{p.costPrice.toFixed(2)}</span>
                                  {p.wholesalePrice && (
                                    <span>পাইকারি: {tenant.currency}{p.wholesalePrice.toFixed(2)}</span>
                                  )}
                                </div>
                              </td>

                              {/* Stock */}
                              <td className="py-3 px-4">
                                <span className={`inline-block px-2 py-0.5 rounded-lg font-bold text-[11px] ${
                                  isOut
                                    ? 'bg-rose-100 text-rose-700'
                                    : isLow
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}>
                                  {p.stock} {p.unit}
                                </span>
                                {isLow && (
                                  <span className="block text-[9px] text-amber-700 font-semibold mt-0.5">
                                    ⚠️ অ্যালার্ট সীমা: {p.alertStock}
                                  </span>
                                )}
                              </td>

                              {/* Pharmacy Specific */}
                              {tenant.businessType === 'pharmacy' && (
                                <td className="py-3 px-4">
                                  <div className="font-medium text-slate-800 text-[11px]">{p.expiryDate || 'N/A'}</div>
                                  <div className="text-[10px] text-slate-400">ব্যাচ: {p.batchNumber || 'N/A'}</div>
                                  {p.darNumber && (
                                    <div className="text-[9px] text-slate-400">DAR: {p.darNumber}</div>
                                  )}
                                </td>
                              )}

                              {/* Electronics Specific */}
                              {tenant.businessType === 'electronics' && (
                                <td className="py-3 px-4">
                                  <div className="font-medium text-slate-800 text-[11px]">{p.brand || 'N/A'}</div>
                                  <span className="text-indigo-600 font-semibold text-[10px]">
                                    {p.warrantyMonths ? `🛡️ ${p.warrantyMonths} মাস ওয়ারেন্টি` : 'ওয়ারেন্টি নেই'}
                                  </span>
                                </td>
                              )}

                              {/* Online Storefront toggle */}
                              <td className="py-3 px-4 text-center">
                                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                  p.showInOnlineStore
                                    ? 'bg-purple-100 text-purple-800'
                                    : 'bg-slate-100 text-slate-400'
                                }`}>
                                  {p.showInOnlineStore ? 'ওয়েবসাইটে চালু' : 'অফলাইন'}
                                </span>
                              </td>

                              {/* Actions */}
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    onClick={() => {
                                      setBarcodeProductToPrint(p.id);
                                      setIsBarcodeModalOpen(true);
                                    }}
                                    className="p-1.5 text-slate-500 hover:text-purple-700 rounded-lg hover:bg-purple-50 transition"
                                    title="বারকোড লেবেল প্রিন্ট"
                                  >
                                    <Barcode className="w-4 h-4" />
                                  </button>

                                  <button
                                    onClick={() => {
                                      setIsStockAdjustmentOpen(true);
                                    }}
                                    className="p-1.5 text-slate-500 hover:text-amber-600 rounded-lg hover:bg-amber-50 transition"
                                    title="+/- স্টক সমন্বয়"
                                  >
                                    <SlidersHorizontal className="w-4 h-4" />
                                  </button>

                                  {onDeleteProduct && (
                                    <button
                                      onClick={() => {
                                        if (confirm(`আপনি কি নিশ্চিত যে "${p.name}" পণ্যটি ইনভেন্টরি থেকে মুছে ফেলতে চান?`)) {
                                          onDeleteProduct(p.id);
                                        }
                                      }}
                                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                                      title="পণ্য মুছে ফেলুন"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
                </>
              )}
            </div>
          )}

          {/* INVOICES & BILLING ECOSYSTEM (Kanakku SaaS Style) */}
          {activeTab === 'invoices' && (
            <div className="space-y-6">
              {/* Header with Actions */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                      <FileText className="w-5 h-5" />
                    </span>
                    <h2 className="text-xl font-bold text-slate-900">ইনভয়েস, বিলিং ও কোটেশন হাব</h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    কোটেশন জেনারেশন, A4 কর্পোরেট ট্যাক্স ইনভয়েস, থার্মাল POS রশিদ, ট্রান্সপোর্ট চালান ও বিক্রয় ফেরত ক্রেডিট নোট
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setIsQuotationModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-xl border border-indigo-200 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    নতুন কোটেশন
                  </button>
                  <button
                    onClick={() => setIsChallanModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold rounded-xl border border-amber-200 transition-colors cursor-pointer"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    ডেলিভারি চালান
                  </button>
                  <button
                    onClick={() => setIsCreditNoteModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-xl border border-rose-200 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    বিক্রয় ফেরত
                  </button>
                  <button
                    onClick={onOpenPOS}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    + POS ক্যাশ কাউন্টার
                  </button>
                </div>
              </div>

              {/* 4 Kanakku Top KPI Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Invoiced */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">মোট ইনভয়েস বিলিং</p>
                      <h3 className="text-xl font-extrabold text-slate-900 mt-1">
                        {tenant.currency}{invoiceStats.totalInvoiced.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </h3>
                    </div>
                    <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <FileText className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>মোট ইস্যুকৃত ইনভয়েস</span>
                    <span className="font-bold text-slate-700">{invoiceStats.invoicesCount} টি</span>
                  </div>
                </div>

                {/* Paid Invoices */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">পরিশোধিত ইনভয়েস (Paid)</p>
                      <h3 className="text-xl font-extrabold text-emerald-700 mt-1">
                        {tenant.currency}{invoiceStats.paidTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </h3>
                    </div>
                    <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>পূর্ণ পরিশোধ ইনভয়েস</span>
                    <span className="font-bold text-emerald-600">{invoiceStats.paidCount} টি</span>
                  </div>
                </div>

                {/* Due Invoices */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">বকেয়া ইনভয়েস (Due)</p>
                      <h3 className="text-xl font-extrabold text-rose-600 mt-1">
                        {tenant.currency}{invoiceStats.dueTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </h3>
                    </div>
                    <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                      <Clock className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>বকেয়া রয়েছে</span>
                    <span className="font-bold text-rose-600">{invoiceStats.dueCount} টি ইনভয়েস</span>
                  </div>
                </div>

                {/* Returns / Credit Notes */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider">বিক্রয় ফেরত (Credit Notes)</p>
                      <h3 className="text-xl font-extrabold text-purple-700 mt-1">
                        {tenant.currency}{invoiceStats.returnedTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </h3>
                    </div>
                    <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                      <RotateCcw className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>মোট ক্রেডিট নোট</span>
                    <span className="font-bold text-purple-600">{invoiceStats.returnedCount} টি</span>
                  </div>
                </div>
              </div>

              {/* Invoicing Navigation Tabs (Kanakku Sub-tabs) */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="flex border-b border-slate-200 bg-slate-50/70 p-2 gap-2 overflow-x-auto">
                  <button
                    onClick={() => setInvoiceSubTab('invoices')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      invoiceSubTab === 'invoices'
                        ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    বিক্রয় ইনভয়েস তালিকা
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-100 text-blue-700 font-extrabold">
                      {tenantSales.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setInvoiceSubTab('quotations')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      invoiceSubTab === 'quotations'
                        ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/80'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                  >
                    <Award className="w-4 h-4" />
                    কোটেশন হাব (Quotations)
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-100 text-indigo-700 font-extrabold">
                      {tenantQuotations.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setInvoiceSubTab('challans')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      invoiceSubTab === 'challans'
                        ? 'bg-white text-amber-800 shadow-xs border border-slate-200/80'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                  >
                    <Truck className="w-4 h-4" />
                    ডেলিভারি চালান (Challans)
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800 font-extrabold">
                      {tenantDeliveryChallans.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setInvoiceSubTab('credit_notes')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      invoiceSubTab === 'credit_notes'
                        ? 'bg-white text-rose-700 shadow-xs border border-slate-200/80'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                  >
                    <RotateCcw className="w-4 h-4" />
                    বিক্রয় ফেরত (Credit Notes)
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-100 text-rose-700 font-extrabold">
                      {tenantCreditNotes.length}
                    </span>
                  </button>
                </div>

                {/* TAB 1: INVOICES LIST */}
                {invoiceSubTab === 'invoices' && (
                  <div>
                    {/* Filters & Search Toolbar */}
                    <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3">
                      {/* Status Tabs */}
                      <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
                        <button
                          onClick={() => setInvoiceFilterStatus('all')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                            invoiceFilterStatus === 'all'
                              ? 'bg-slate-900 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          সকল ({tenantSales.length})
                        </button>
                        <button
                          onClick={() => setInvoiceFilterStatus('paid')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                            invoiceFilterStatus === 'paid'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          পরিশোধিত ({invoiceStats.paidCount})
                        </button>
                        <button
                          onClick={() => setInvoiceFilterStatus('due')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                            invoiceFilterStatus === 'due'
                              ? 'bg-rose-600 text-white'
                              : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                          }`}
                        >
                          বকেয়া ({invoiceStats.dueCount})
                        </button>
                        <button
                          onClick={() => setInvoiceFilterStatus('returned')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                            invoiceFilterStatus === 'returned'
                              ? 'bg-purple-600 text-white'
                              : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                          }`}
                        >
                          ফেরত ({invoiceStats.returnedCount})
                        </button>
                      </div>

                      {/* Search Field */}
                      <div className="relative w-full md:w-72">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={invoiceSearchQuery}
                          onChange={(e) => setInvoiceSearchQuery(e.target.value)}
                          placeholder="ইনভয়েস #, নাম, মোবাইল বা TrxID..."
                          className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                        />
                        {invoiceSearchQuery && (
                          <button
                            onClick={() => setInvoiceSearchQuery('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Invoices Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                          <tr>
                            <th className="py-3 px-4">ইনভয়েস নং</th>
                            <th className="py-3 px-4">গ্রাহকের তথ্য</th>
                            <th className="py-3 px-4">তারিখ ও সময়</th>
                            <th className="py-3 px-4">পেমেন্ট মাধ্যম</th>
                            <th className="py-3 px-4 text-right">মোট বিল</th>
                            <th className="py-3 px-4 text-right">পরিশোধ</th>
                            <th className="py-3 px-4 text-right">বকেয়া</th>
                            <th className="py-3 px-4 text-center">স্ট্যাটাস</th>
                            <th className="py-3 px-4 text-center">ইনভয়েস প্রিন্ট ও অ্যাকশন</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {displayedInvoices.length === 0 ? (
                            <tr>
                              <td colSpan={9} className="py-12 text-center text-slate-400">
                                <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                                <p className="font-medium">কোনো ইনভয়েস রেকর্ড পাওয়া যায়নি</p>
                                <p className="text-[11px] text-slate-400 mt-1">POS ক্যাশ কাউন্টার থেকে নতুন বিক্রয় সম্পন্ন করুন</p>
                              </td>
                            </tr>
                          ) : (
                            displayedInvoices.map((sale) => {
                              const isDue = (sale.dueAmount || 0) > 0;
                              const isWholesale = sale.pricingType === 'wholesale';
                              const total = sale.totalAmount;
                              const paid = sale.paidAmount;

                              return (
                                <tr key={sale.id} className="hover:bg-slate-50/70 transition-colors">
                                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                                    <div className="flex items-center gap-1.5">
                                      <span>#{sale.invoiceNumber || sale.id}</span>
                                      {isWholesale ? (
                                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-100 text-purple-700 font-bold">
                                          পাইকারি
                                        </span>
                                      ) : (
                                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600">
                                          খুচরা
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                                      {sale.items.length} টি আইটেম
                                    </div>
                                  </td>
                                  <td className="py-3.5 px-4">
                                    <div className="font-semibold text-slate-900">
                                      {sale.customerName || 'সাধারণ ক্রেতা (Walk-in)'}
                                    </div>
                                    {sale.customerPhone && (
                                      <div className="text-[11px] text-slate-500 font-mono">
                                        {sale.customerPhone}
                                      </div>
                                    )}
                                  </td>
                                  <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                                    <div>{new Date(sale.createdAt).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                                    <div className="text-[10px] text-slate-400 font-mono">
                                      {new Date(sale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                  </td>
                                  <td className="py-3.5 px-4">
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 uppercase">
                                      {sale.paymentMethod}
                                    </span>
                                    {sale.transactionId && (
                                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                                        Trx: {sale.transactionId}
                                      </div>
                                    )}
                                  </td>
                                  <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                                    {tenant.currency}{total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </td>
                                  <td className="py-3.5 px-4 text-right font-bold text-emerald-600">
                                    {tenant.currency}{paid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </td>
                                  <td className="py-3.5 px-4 text-right font-bold">
                                    {isDue ? (
                                      <span className="text-rose-600">
                                        {tenant.currency}{(sale.dueAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                      </span>
                                    ) : (
                                      <span className="text-slate-400 font-mono">৳0.00</span>
                                    )}
                                  </td>
                                  <td className="py-3.5 px-4 text-center">
                                    {isDue ? (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                                        বকেয়া
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                                        <CheckCircle2 className="w-3 h-3" />
                                        পেইড
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-3.5 px-4 text-center">
                                    <div className="flex items-center justify-center gap-1.5">
                                      {/* Thermal Receipt */}
                                      <button
                                        onClick={() => onOpenReceipt?.(sale)}
                                        title="থার্মাল রসিদ (POS Slip) প্রিন্ট"
                                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                                      >
                                        <Receipt className="w-3.5 h-3.5" />
                                      </button>
                                      {/* A4 Tax Invoice */}
                                      <button
                                        onClick={() => onOpenA4Invoice?.(sale)}
                                        title="A4 কর্পোরেট ট্যাক্স ইনভয়েস প্রিন্ট"
                                        className="px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-[11px] inline-flex items-center gap-1 transition-colors cursor-pointer border border-blue-200"
                                      >
                                        <FileText className="w-3 h-3" />
                                        A4 ইনভয়েস
                                      </button>
                                      {/* Delivery Challan */}
                                      <button
                                        onClick={() => setIsChallanModalOpen(true)}
                                        title="চালান ইস্যু করুন"
                                        className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 transition-colors cursor-pointer"
                                      >
                                        <Truck className="w-3.5 h-3.5" />
                                      </button>
                                      {/* Sales Return / Credit Note */}
                                      <button
                                        onClick={() => setIsCreditNoteModalOpen(true)}
                                        title="বিক্রয় ফেরত / ক্রেডিট নোট তৈরি করুন"
                                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors cursor-pointer"
                                      >
                                        <RotateCcw className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* TAB 2: QUOTATIONS LIST */}
                {invoiceSubTab === 'quotations' && (
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">গ্রাহক কোটেশন ও প্রাইজ অফার লেটার</h4>
                        <p className="text-xs text-slate-500">কোটেশন অনুমোদন হলে ১-ক্লিকেই সরাসরি ইনভয়েসে রূপান্তর করা যাবে</p>
                      </div>
                      <button
                        onClick={() => setIsQuotationModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        নতুন কোটেশন তৈরি
                      </button>
                    </div>

                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                          <tr>
                            <th className="py-2.5 px-3">কোটেশন নং</th>
                            <th className="py-2.5 px-3">গ্রাহক ও প্রতিষ্ঠান</th>
                            <th className="py-2.5 px-3">মেয়াদ (Valid Until)</th>
                            <th className="py-2.5 px-3">আইটেম সংখ্যা</th>
                            <th className="py-2.5 px-3 text-right">মোট অফার মূল্য</th>
                            <th className="py-2.5 px-3 text-center">স্ট্যাটাস</th>
                            <th className="py-2.5 px-3 text-center">অ্যাকশন</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {tenantQuotations.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="py-8 text-center text-slate-400">
                                <Award className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                                <p className="font-semibold text-slate-600">কোনো কোটেশন তৈরি করা হয়নি</p>
                                <p className="text-[11px] text-slate-400 mt-0.5">নতুন কোটেশন তৈরি করতে উপরের বাটনে ক্লিক করুন</p>
                              </td>
                            </tr>
                          ) : (
                            tenantQuotations.map((q) => (
                              <tr key={q.id} className="hover:bg-slate-50/70">
                                <td className="py-3 px-3 font-mono font-bold text-slate-900">
                                  {q.quotationNumber}
                                </td>
                                <td className="py-3 px-3">
                                  <div className="font-semibold text-slate-900">{q.customerName}</div>
                                  {q.customerPhone && <div className="text-[11px] text-slate-500 font-mono">{q.customerPhone}</div>}
                                </td>
                                <td className="py-3 px-3 text-slate-600 font-mono">
                                  {q.validUntil}
                                </td>
                                <td className="py-3 px-3 text-slate-700">
                                  {q.items.length} টি পণ্য
                                </td>
                                <td className="py-3 px-3 text-right font-extrabold text-slate-900">
                                  {tenant.currency}{q.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </td>
                                <td className="py-3 px-3 text-center">
                                  {q.status === 'converted' ? (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                                      ইনভয়েসে রূপান্তরিত
                                    </span>
                                  ) : q.status === 'accepted' ? (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                                      গৃহীত (Accepted)
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                      প্রস্তাবিত (Sent)
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 px-3 text-center">
                                  <div className="flex items-center justify-center gap-1.5">
                                    {q.status !== 'converted' && onConvertToInvoice && (
                                      <button
                                        onClick={() => onConvertToInvoice(q)}
                                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-[11px] font-bold cursor-pointer"
                                      >
                                        বিক্রয়ে রূপান্তর
                                      </button>
                                    )}
                                    <button
                                      onClick={() => setIsQuotationModalOpen(true)}
                                      className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                                      title="কোটেশন দেখুন ও প্রিন্ট করুন"
                                    >
                                      <Printer className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* TAB 3: CHALLANS LIST */}
                {invoiceSubTab === 'challans' && (
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">ডেলিভারি চালান ও ট্রান্সপোর্ট গেটপাস</h4>
                        <p className="text-xs text-slate-500">পণ্য ডেলিভারি ও কুরিয়ার ট্র্যাকিং এর জন্য অফিসিয়াল ডেলিভারি চালান</p>
                      </div>
                      <button
                        onClick={() => setIsChallanModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        নতুন চালান তৈরি
                      </button>
                    </div>

                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                          <tr>
                            <th className="py-2.5 px-3">চালান নং</th>
                            <th className="py-2.5 px-3">ইনভয়েস রেফারেন্স</th>
                            <th className="py-2.5 px-3">গ্রাহক ও গন্তব্য</th>
                            <th className="py-2.5 px-3">ট্রান্সপোর্ট / কুরিয়ার</th>
                            <th className="py-2.5 px-3">যানবাহন ও চালক</th>
                            <th className="py-2.5 px-3 text-center">স্ট্যাটাস</th>
                            <th className="py-2.5 px-3 text-center">প্রিন্ট</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {tenantDeliveryChallans.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="py-8 text-center text-slate-400">
                                <Truck className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                                <p className="font-semibold text-slate-600">কোনো ডেলিভারি চালান পাওয়া যায়নি</p>
                                <p className="text-[11px] text-slate-400 mt-0.5">নতুন চালান তৈরি করতে উপরের বাটনে ক্লিক করুন</p>
                              </td>
                            </tr>
                          ) : (
                            tenantDeliveryChallans.map((dc) => (
                              <tr key={dc.id} className="hover:bg-slate-50/70">
                                <td className="py-3 px-3 font-mono font-bold text-amber-800">
                                  {dc.challanNumber}
                                </td>
                                <td className="py-3 px-3 font-mono text-slate-700">
                                  #{dc.invoiceNumber}
                                </td>
                                <td className="py-3 px-3">
                                  <div className="font-semibold text-slate-900">{dc.customerName}</div>
                                  <div className="text-[11px] text-slate-500 truncate max-w-xs">{dc.deliveryAddress}</div>
                                </td>
                                <td className="py-3 px-3 text-slate-700">
                                  <span className="font-medium">{dc.transportName}</span>
                                </td>
                                <td className="py-3 px-3 text-slate-600">
                                  <div>{dc.vehicleNumber || '—'}</div>
                                  {dc.driverPhone && <div className="text-[10px] text-slate-400">{dc.driverPhone}</div>}
                                </td>
                                <td className="py-3 px-3 text-center">
                                  {dc.status === 'delivered' ? (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                                      ডেলিভার্ড
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                                      ইন-ট্রানজিট
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 px-3 text-center">
                                  <button
                                    onClick={() => setIsChallanModalOpen(true)}
                                    className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 cursor-pointer"
                                    title="চালান প্রিন্ট করুন"
                                  >
                                    <Printer className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* TAB 4: CREDIT NOTES LIST */}
                {invoiceSubTab === 'credit_notes' && (
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">বিক্রয় ফেরত ও ক্রেডিট নোট (Sales Returns)</h4>
                        <p className="text-xs text-slate-500">ত্রুটিযুক্ত বা অতিরিক্ত পণ্য ফেরত নেওয়া এবং ইনভেন্টরি অটো-এডজাস্টমেন্ট</p>
                      </div>
                      <button
                        onClick={() => setIsCreditNoteModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        নতুন ক্রেডিট নোট তৈরি
                      </button>
                    </div>

                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                          <tr>
                            <th className="py-2.5 px-3">ক্রেডিট নোট নং</th>
                            <th className="py-2.5 px-3">মূল ইনভয়েস #</th>
                            <th className="py-2.5 px-3">গ্রাহক</th>
                            <th className="py-2.5 px-3">ফেরতের কারণ</th>
                            <th className="py-2.5 px-3">রিফান্ড মাধ্যম</th>
                            <th className="py-2.5 px-3 text-right">মোট রিফান্ড টাকা</th>
                            <th className="py-2.5 px-3 text-center">প্রিন্ট</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {tenantCreditNotes.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="py-8 text-center text-slate-400">
                                <RotateCcw className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                                <p className="font-semibold text-slate-600">কোনো বিক্রয় ফেরত বা ক্রেডিট নোট নেই</p>
                                <p className="text-[11px] text-slate-400 mt-0.5">গ্রাহক পণ্য ফেরত দিলে নতুন ক্রেডিট নোট তৈরি করুন</p>
                              </td>
                            </tr>
                          ) : (
                            tenantCreditNotes.map((cn) => (
                              <tr key={cn.id} className="hover:bg-slate-50/70">
                                <td className="py-3 px-3 font-mono font-bold text-rose-700">
                                  {cn.creditNoteNumber}
                                </td>
                                <td className="py-3 px-3 font-mono text-slate-700">
                                  #{cn.originalInvoiceNumber}
                                </td>
                                <td className="py-3 px-3 font-semibold text-slate-900">
                                  {cn.customerName}
                                </td>
                                <td className="py-3 px-3 text-slate-600">
                                  {cn.reason}
                                </td>
                                <td className="py-3 px-3">
                                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                                    {cn.refundMethod === 'cash' ? 'নগদ ফেরত' : cn.refundMethod === 'adjust_due' ? 'বাকি সমন্বয়' : 'স্টোর ক্রেডিট'}
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-right font-extrabold text-rose-600">
                                  {tenant.currency}{cn.totalRefundAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </td>
                                <td className="py-3 px-3 text-center">
                                  <button
                                    onClick={() => setIsCreditNoteModalOpen(true)}
                                    className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 cursor-pointer"
                                    title="ক্রেডিট নোট প্রিন্ট করুন"
                                  >
                                    <Printer className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CRM & DIGITAL DUE LEDGER (বাকি খাতা) - Phase 3 Enterprise CRM */}
          {activeTab === 'crm' && (
            <div className="space-y-6">
              {/* Header with Title & Core Action Controls */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-2 bg-purple-100 text-purple-700 rounded-xl">
                      <Users className="w-5 h-5" />
                    </span>
                    <h2 className="text-xl font-bold text-slate-900">CRM ও ডিজিটাল বাকি খাতা (Customer Due Ledger)</h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    ক্রেডিট লিমিট নিয়ন্ত্রণ, রিয়েল-টাইম বাকি খাতা, লেজার স্টেটমেন্ট প্রিন্ট ও ১-ক্লিক বাংলা SMS তাগাদা পোর্টাল
                  </p>
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => {
                      setCustomerToEdit(null);
                      setIsAddCustomerModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    + নতুন গ্রাহক
                  </button>

                  <button
                    onClick={() => {
                      const firstWithDue = activeDueCustomers[0] || tenantCustomers[0];
                      if (firstWithDue) {
                        setSelectedPaymentCustomer(firstWithDue);
                        setIsReceivePaymentModalOpen(true);
                      } else {
                        alert('বর্তমানে কোনো গ্রাহকের বকেয়া বাকি নেই।');
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-200 transition-colors cursor-pointer"
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    বকেয়া জমা গ্রহণ
                  </button>

                  <button
                    onClick={handleExportCustomersCSV}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                    CSV এক্সপোর্ট
                  </button>
                </div>
              </div>

              {/* 4 Kanakku Top KPI Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Total Receivables / Due */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-rose-600 uppercase tracking-wider">মোট পাওনা / বকেয়া (Due)</p>
                      <h3 className="text-xl font-extrabold text-rose-600 mt-1">
                        {tenant.currency}{totalSalesDue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </h3>
                    </div>
                    <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                      <Clock className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>বকেয়া খাতা খরিদ্দার</span>
                    <span className="font-bold text-rose-600">{activeDueCustomers.length} জন</span>
                  </div>
                </div>

                {/* 2. Collected This Month */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">চলতি মাসে মোট আদায়</p>
                      <h3 className="text-xl font-extrabold text-emerald-700 mt-1">
                        {tenant.currency}{collectedThisMonth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </h3>
                    </div>
                    <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>আদায় রশিদ সংখ্যা</span>
                    <span className="font-bold text-emerald-600">{tenantReceipts.length} টি ভাউচার</span>
                  </div>
                </div>

                {/* 3. Total Customers */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider">মোট সক্রিয় খরিদ্দার</p>
                      <h3 className="text-xl font-extrabold text-slate-900 mt-1">
                        {tenantCustomers.length} জন
                      </h3>
                    </div>
                    <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                      <Users className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>পরিশোধিত অ্যাকাউন্ট</span>
                    <span className="font-bold text-slate-700">{tenantCustomers.length - activeDueCustomers.length} জন</span>
                  </div>
                </div>

                {/* 4. Over Credit Limit */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">ক্রেডিট লিমিট অতিক্রমকারী</p>
                      <h3 className="text-xl font-extrabold text-amber-900 mt-1">
                        {overLimitCustomers.length} জন
                      </h3>
                    </div>
                    <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>উচ্চ ঝুঁকি স্ট্যাটাস</span>
                    <span className={`font-bold ${overLimitCustomers.length > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {overLimitCustomers.length > 0 ? 'তাগাদা প্রয়োজন' : 'ঝুঁকিমুক্ত'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Top Customers Loyalty Ranking Bar */}
              {topCustomersByPurchases.length > 0 && (
                <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50 border border-purple-200/80 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-purple-700" />
                      <h4 className="font-extrabold text-xs text-purple-950 uppercase tracking-wider">
                        শীর্ষ খরিদ্দার ও লয়্যালটি র‍্যাংকিং (Top Customers)
                      </h4>
                    </div>
                    <span className="text-[10px] text-purple-700 font-semibold">আজীবন কেনাকাটার পরিমাণের ভিত্তিতে</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {topCustomersByPurchases.map((tc, idx) => (
                      <div
                        key={tc.id}
                        onClick={() => {
                          setSelectedLedgerCustomer(tc);
                          setIsLedgerModalOpen(true);
                        }}
                        className="bg-white p-3 rounded-xl border border-purple-100 shadow-2xs hover:shadow-xs hover:border-purple-300 transition cursor-pointer flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between">
                          <span className={`w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center ${
                            idx === 0 ? 'bg-amber-100 text-amber-900' :
                            idx === 1 ? 'bg-slate-200 text-slate-800' :
                            idx === 2 ? 'bg-orange-100 text-orange-900' : 'bg-purple-100 text-purple-800'
                          }`}>
                            #{idx + 1}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase bg-purple-100 text-purple-800">
                            {tc.loyaltyTier || 'gold'}
                          </span>
                        </div>
                        <div className="mt-2">
                          <strong className="text-xs font-bold text-slate-900 block truncate">{tc.name}</strong>
                          <div className="text-[11px] font-black text-purple-700 mt-0.5">
                            {tenant.currency}{tc.totalSpent.toLocaleString()}
                          </div>
                        </div>
                        <span className="text-[9px] text-slate-400 block mt-1">
                          {tc.purchaseCount} বার ক্রয় • লেজার দেখুন →
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sub-Tabs: Customers vs Payment Receipts */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="flex border-b border-slate-200 bg-slate-50/70 p-2 gap-2 overflow-x-auto">
                  <button
                    onClick={() => setCrmSubTab('customers')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      crmSubTab === 'customers'
                        ? 'bg-white text-purple-800 shadow-xs border border-slate-200/80'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    গ্রাহক ও বাকি খাতা তালিকা
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-100 text-purple-800 font-extrabold">
                      {tenantCustomers.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setCrmSubTab('receipts')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      crmSubTab === 'receipts'
                        ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/80'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                  >
                    <Receipt className="w-4 h-4" />
                    টাকা জমা ও মানি রিসিট হিস্ট্রি
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-extrabold">
                      {tenantReceipts.length}
                    </span>
                  </button>
                </div>

                {/* TAB 1: CUSTOMERS & DUE LEDGER */}
                {crmSubTab === 'customers' && (
                  <div>
                    {/* Filters & Search Toolbar */}
                    <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3">
                      {/* Status Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
                        <button
                          onClick={() => setCustomerFilterStatus('all')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                            customerFilterStatus === 'all'
                              ? 'bg-slate-900 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          সকল ({tenantCustomers.length})
                        </button>
                        <button
                          onClick={() => setCustomerFilterStatus('due')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                            customerFilterStatus === 'due'
                              ? 'bg-rose-600 text-white'
                              : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                          }`}
                        >
                          বকেয়া আছে ({activeDueCustomers.length})
                        </button>
                        <button
                          onClick={() => setCustomerFilterStatus('paid')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                            customerFilterStatus === 'paid'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          পরিশোধিত ({tenantCustomers.length - activeDueCustomers.length})
                        </button>
                        <button
                          onClick={() => setCustomerFilterStatus('over_limit')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                            customerFilterStatus === 'over_limit'
                              ? 'bg-amber-600 text-white'
                              : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                          }`}
                        >
                          লিমিট পার ({overLimitCustomers.length})
                        </button>

                        {/* Loyalty Tier Dropdown Filter */}
                        <select
                          value={customerTierFilter}
                          onChange={e => setCustomerTierFilter(e.target.value as any)}
                          className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none ml-1"
                        >
                          <option value="all">সকল লয়্যালটি টিয়ার</option>
                          <option value="vip">VIP সদস্য</option>
                          <option value="gold">Gold গোল্ড</option>
                          <option value="silver">Silver সিলভার</option>
                          <option value="bronze">Bronze ব্রোঞ্জ</option>
                        </select>
                      </div>

                      {/* Search Bar */}
                      <div className="relative w-full md:w-72">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={customerSearchQuery}
                          onChange={e => setCustomerSearchQuery(e.target.value)}
                          placeholder="নাম, ফোন, ঠিকানা বা ইমেইল খুঁজুন..."
                          className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 outline-none"
                        />
                        {customerSearchQuery && (
                          <button
                            onClick={() => setCustomerSearchQuery('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Customers Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11px]">
                          <tr>
                            <th className="py-3 px-4">গ্রাহকের নাম ও যোগাযোগ</th>
                            <th className="py-3 px-4">ক্যাটাগরি ও টিয়ার</th>
                            <th className="py-3 px-4 text-right">ক্রেডিট লিমিট</th>
                            <th className="py-3 px-4 text-right">মোট ক্রয় (Spent)</th>
                            <th className="py-3 px-4 text-right">বর্তমান বকেয়া (Due)</th>
                            <th className="py-3 px-4 text-center">সর্বশেষ ক্রয়</th>
                            <th className="py-3 px-4 text-center">অ্যাকশন ও বাকি খাতা</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {displayedCustomers.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="py-12 text-center text-slate-400">
                                <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                                <p className="font-semibold text-slate-600">কোনো গ্রাহকের তথ্য পাওয়া যায়নি</p>
                                <p className="text-[11px] text-slate-400 mt-0.5">নতুন গ্রাহক যুক্ত করতে উপরের বাটনে ক্লিক করুন</p>
                              </td>
                            </tr>
                          ) : (
                            displayedCustomers.map(cust => {
                              const limit = cust.creditLimit || 0;
                              const isOver = limit > 0 && cust.dueAmount > limit;
                              const hasDue = cust.dueAmount > 0;

                              return (
                                <tr key={cust.id} className="hover:bg-slate-50/80 transition">
                                  {/* Name & Phone */}
                                  <td className="py-3 px-4">
                                    <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                                      <span>{cust.name}</span>
                                    </div>
                                    <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2 mt-0.5">
                                      <span>{cust.phone}</span>
                                      {cust.email && <span className="text-slate-400 font-sans">• {cust.email}</span>}
                                    </div>
                                    {cust.address && (
                                      <div className="text-[10px] text-slate-400 truncate max-w-xs mt-0.5">
                                        📍 {cust.address}
                                      </div>
                                    )}
                                  </td>

                                  {/* Category & Tier */}
                                  <td className="py-3 px-4">
                                    <div className="flex flex-col gap-1 items-start">
                                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                                        {cust.customerType === 'wholesale' ? 'পাইকারি' : cust.customerType === 'corporate' ? 'কর্পোরেট' : 'খুচরা'}
                                      </span>
                                      {cust.loyaltyTier && (
                                        <span className={`text-[9px] uppercase font-black px-1.5 py-0.2 rounded ${
                                          cust.loyaltyTier === 'vip' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                                          cust.loyaltyTier === 'gold' ? 'bg-yellow-100 text-yellow-900' :
                                          cust.loyaltyTier === 'silver' ? 'bg-slate-200 text-slate-800' : 'bg-orange-100 text-orange-900'
                                        }`}>
                                          ★ {cust.loyaltyTier}
                                        </span>
                                      )}
                                    </div>
                                  </td>

                                  {/* Credit Limit */}
                                  <td className="py-3 px-4 text-right">
                                    <div className="font-mono font-bold text-slate-800">
                                      {limit > 0 ? `${tenant.currency}${limit.toLocaleString()}` : 'সীমাহীন'}
                                    </div>
                                    {isOver && (
                                      <span className="inline-block text-[9px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200 mt-0.5">
                                        ⚠️ লিমিট পার
                                      </span>
                                    )}
                                  </td>

                                  {/* Total Spent */}
                                  <td className="py-3 px-4 text-right">
                                    <div className="font-mono font-extrabold text-purple-700">
                                      {tenant.currency}{cust.totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </div>
                                    <div className="text-[10px] text-slate-400">
                                      {cust.purchaseCount} বার কেনাকাটা
                                    </div>
                                  </td>

                                  {/* Due Amount */}
                                  <td className="py-3 px-4 text-right">
                                    {hasDue ? (
                                      <div>
                                        <span className="font-mono font-black text-rose-600 text-sm">
                                          {tenant.currency}{cust.dueAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </span>
                                        <span className="block text-[9px] text-rose-500 font-semibold mt-0.5">
                                          বকেয়া অনাদায়ী
                                        </span>
                                      </div>
                                    ) : (
                                      <div>
                                        <span className="font-mono font-bold text-emerald-700">
                                          {tenant.currency}0.00
                                        </span>
                                        <span className="block text-[9px] text-emerald-600 font-semibold mt-0.5">
                                          পরিশোধিত ✓
                                        </span>
                                      </div>
                                    )}
                                  </td>

                                  {/* Last Purchased */}
                                  <td className="py-3 px-4 text-center font-mono text-slate-500 text-[11px]">
                                    {cust.lastPurchased || 'N/A'}
                                  </td>

                                  {/* Action Buttons */}
                                  <td className="py-3 px-4 text-center">
                                    <div className="flex items-center justify-center gap-1.5">
                                      {/* View Ledger */}
                                      <button
                                        onClick={() => {
                                          setSelectedLedgerCustomer(cust);
                                          setIsLedgerModalOpen(true);
                                        }}
                                        className="p-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 transition cursor-pointer"
                                        title="লেজার স্টেটমেন্ট দেখুন ও প্রিন্ট করুন"
                                      >
                                        <FileText className="w-3.5 h-3.5" />
                                      </button>

                                      {/* Receive Due Payment */}
                                      <button
                                        onClick={() => {
                                          setSelectedPaymentCustomer(cust);
                                          setIsReceivePaymentModalOpen(true);
                                        }}
                                        className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition cursor-pointer"
                                        title="বকেয়া জমা গ্রহণ করুন"
                                      >
                                        <DollarSign className="w-3.5 h-3.5" />
                                      </button>

                                      {/* SMS Payment Reminder */}
                                      <button
                                        onClick={() => {
                                          setSelectedSmsCustomer(cust);
                                          setIsSmsReminderModalOpen(true);
                                        }}
                                        disabled={!hasDue}
                                        className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 disabled:opacity-30 text-indigo-700 transition cursor-pointer"
                                        title="বকেয়া তাগাদা SMS পাঠান"
                                      >
                                        <Send className="w-3.5 h-3.5" />
                                      </button>

                                      {/* WhatsApp Due Reminder & Pay Link */}
                                      <button
                                        onClick={() => setSelectedWhatsAppDueCustomer(cust)}
                                        disabled={!hasDue}
                                        className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 disabled:opacity-30 text-emerald-700 transition cursor-pointer"
                                        title="হোয়াটসঅ্যাপে বকেয়া পে-লিংক ও রিমাইন্ডার পাঠান"
                                      >
                                        <Smartphone className="w-3.5 h-3.5" />
                                      </button>

                                      {/* Edit Customer Profile */}
                                      <button
                                        onClick={() => {
                                          setCustomerToEdit(cust);
                                          setIsAddCustomerModalOpen(true);
                                        }}
                                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                                        title="গ্রাহকের তথ্য ও ক্রেডিট লিমিট এডিট করুন"
                                      >
                                        <Settings className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* TAB 2: MONEY RECEIPTS HISTORY */}
                {crmSubTab === 'receipts' && (
                  <div>
                    <div className="p-4 border-b border-slate-200 flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-700">বকেয়া জমা ও আদায়কৃত মানি রিসিটের তালিকা</span>
                      <span className="text-slate-500">মোট রিসিট: <strong>{tenantReceipts.length}</strong> টি</span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11px]">
                          <tr>
                            <th className="py-3 px-4">রশিদ নং</th>
                            <th className="py-3 px-4">গ্রাহকের নাম ও ফোন</th>
                            <th className="py-3 px-4">তারিখ ও সময়</th>
                            <th className="py-3 px-4">পেমেন্ট মাধ্যম</th>
                            <th className="py-3 px-4 text-right">জমার পরিমাণ</th>
                            <th className="py-3 px-4 text-right">ছাড় (Discount)</th>
                            <th className="py-3 px-4 text-right">অবশিষ্ট বকেয়া</th>
                            <th className="py-3 px-4 text-center">আদায়কারী</th>
                            <th className="py-3 px-4 text-center">ভাউচার প্রিন্ট</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {tenantReceipts.length === 0 ? (
                            <tr>
                              <td colSpan={9} className="py-12 text-center text-slate-400">
                                <Receipt className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                                <p className="font-semibold text-slate-600">কোনো জমার ভাউচার তৈরি হয়নি</p>
                                <p className="text-[11px] text-slate-400 mt-0.5">গ্রাহক থেকে টাকা জমা নিলে এখানে স্বয়ংক্রিয়ভাবে সংরক্ষিত হবে</p>
                              </td>
                            </tr>
                          ) : (
                            tenantReceipts.map(rec => (
                              <tr key={rec.id} className="hover:bg-slate-50/80 transition">
                                <td className="py-3 px-4 font-mono font-bold text-purple-700">
                                  {rec.receiptNumber}
                                </td>
                                <td className="py-3 px-4">
                                  <div className="font-bold text-slate-900">{rec.customerName}</div>
                                  <div className="text-[11px] text-slate-400 font-mono">{rec.customerPhone}</div>
                                </td>
                                <td className="py-3 px-4 font-mono text-slate-600 text-[11px]">
                                  {rec.date}
                                </td>
                                <td className="py-3 px-4">
                                  <span className="uppercase font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px]">
                                    {rec.paymentMethod}
                                  </span>
                                  {rec.transactionId && (
                                    <div className="text-[9px] text-purple-600 font-mono mt-0.5">
                                      Trx: {rec.transactionId}
                                    </div>
                                  )}
                                </td>
                                <td className="py-3 px-4 text-right font-mono font-black text-emerald-700 text-sm">
                                  {tenant.currency}{rec.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </td>
                                <td className="py-3 px-4 text-right font-mono text-slate-600">
                                  {rec.discount > 0 ? `${tenant.currency}${rec.discount.toFixed(2)}` : '-'}
                                </td>
                                <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                                  {tenant.currency}{rec.remainingDue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </td>
                                <td className="py-3 px-4 text-center text-slate-600 text-[11px]">
                                  {rec.collectedBy}
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <button
                                    onClick={() => {
                                      setSelectedPaymentReceipt(rec);
                                      setIsPaymentReceiptModalOpen(true);
                                    }}
                                    className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition cursor-pointer"
                                    title="মানি রিসিট প্রিন্ট করুন"
                                  >
                                    <Printer className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ONLINE E-COMMERCE ORDERS TAB */}
          {activeTab === 'ecommerce' && (
            <ECommerceManager
              tenant={tenant}
              orders={onlineOrders}
              products={products}
              onOpenStorefront={onOpenStorefront}
              onUpdateOrderStatus={onUpdateOrderStatus}
              onUpdateOrderCourier={onUpdateOrderCourier || (() => {})}
              onUpdateStoreSettings={onUpdateStoreSettings || (() => {})}
            />
          )}

          {/* HRM TAB */}
          {activeTab === 'hrm' && (
            <HRMManager
              tenant={tenant}
              employees={employees}
              warehouses={warehouses}
              attendanceRecords={attendanceRecords}
              rolePermissions={rolePermissions}
              salarySlips={salarySlips}
              onSaveEmployee={onSaveEmployee || (() => {})}
              onDeleteEmployee={onDeleteEmployee}
              onUpdateAttendanceRecord={onUpdateAttendanceRecord || (() => {})}
              onBulkMarkAttendance={onBulkMarkAttendance}
              onUpdateRolePermissions={onUpdateRolePermissions || (() => {})}
              onAddSalarySlip={onAddSalarySlip || (() => {})}
              onUpdateSlipStatus={onUpdateSlipStatus || (() => {})}
            />
          )}

          {/* PHASE 12: AI DEMAND FORECASTING & AUTONOMOUS AUTO-PO */}
          {activeTab === 'ai' && (
            <AIDemandForecastManager
              tenant={tenant}
              products={tenantProducts}
              sales={tenantSales}
              suppliers={suppliers}
              autoPurchaseOrders={autoPurchaseOrders}
              seasonalTrends={seasonalTrends}
              deadStockItems={deadStockItems}
              onApproveAndCreatePO={onApproveAndCreatePO}
              onUpdateAutoPoStatus={onUpdateAutoPoStatus}
              onApplyDeadStockPromo={onApplyDeadStockPromo}
              onGenerateNewAutoPOs={onGenerateNewAutoPOs}
            />
          )}

          {/* PHASE 6: ACCOUNTING, EXPENSES & SUPPLIERS TAB */}
          {activeTab === 'accounting' && (
            <AccountingManager
              tenant={tenant}
              sales={sales}
              customers={customers}
              products={products}
              expenses={expenses}
              suppliers={suppliers}
              purchaseOrders={purchaseOrders}
              supplierPayments={supplierPayments}
              initialSubTab={accountingSubTab}
              onAddExpense={onAddExpense || (() => {})}
              onDeleteExpense={onDeleteExpense}
              onSaveSupplier={onSaveSupplier || (() => {})}
              onRecordSupplierPayment={onRecordSupplierPayment || (() => {})}
              onCreatePurchaseOrder={onCreatePurchaseOrder || (() => {})}
            />
          )}

          {/* PHASE 11: MULTI-BRANCH LOGISTICS & CENTRAL WAREHOUSE TAB */}
          {activeTab === 'warehouses' && (
            <MultiBranchLogisticsManager
              tenant={tenant}
              warehouses={warehouses}
              products={products}
              sales={sales}
              requisitions={requisitions}
              transfers={transfers}
              activeWarehouseId={activeWarehouseId}
              onSelectWarehouse={onSelectWarehouse}
              onCreateRequisition={onCreateRequisition || (() => {})}
              onUpdateRequisitionStatus={onUpdateRequisitionStatus || (() => {})}
              onDispatchTransfer={onDispatchTransfer || (() => {})}
              onReceiveTransfer={onReceiveTransfer || (() => {})}
              onSaveWarehouse={onSaveWarehouse || (() => {})}
            />
          )}

          {/* PHASE 13: GLOBAL COMMERCE, PAYMENTS & MULTI-CURRENCY TAB */}
          {activeTab === 'global' && (
            <GlobalCommerceManager
              tenant={tenant}
              exchangeRates={exchangeRates}
              paymentGateways={paymentGateways}
              taxSlabs={taxSlabs}
              transactions={crossBorderTransactions}
              onUpdateExchangeRate={onUpdateExchangeRate}
              onToggleGateway={onToggleGateway}
              onUpdateGatewayMode={onUpdateGatewayMode}
              onAddTransaction={onAddCrossBorderTransaction}
              onSaveTaxSlab={onSaveTaxSlab}
            />
          )}

          {/* PHASE 14: OMNICHANNEL WHATSAPP BOT & LOYALTY REWARDS */}
          {activeTab === 'whatsapp_loyalty' && (
            <WhatsAppLoyaltyManager
              tenant={tenant}
              customers={customers}
              products={products}
              sales={sales}
              whatsAppConfig={
                whatsAppConfigs.find(c => c.tenantId === tenant.id) || {
                  id: 'waba-cfg-' + tenant.id,
                  tenantId: tenant.id,
                  phoneNumberId: '109283746591023',
                  businessAccountId: '592817294819283',
                  apiAccessToken: 'EAAG9x_JHIMSE_META_CLOUD_API_v20_PROD_SECURE_TOKEN_9921',
                  webhookVerifyToken: 'jh_imse_whatsapp_webhook_secret_2026',
                  isActive: true,
                  autoSendOnPOSSale: true,
                  autoSendDueReminderDays: 7,
                  defaultGreetingBn: `আসসালামু আলাইকুম! ${tenant.name}-এ স্বাগতম।`,
                  verifiedBusinessName: `${tenant.name} (Official)`,
                  phoneDisplay: tenant.phone || '+880 1711-234567',
                  appSecret: '98f7a6e1c2b5d409e3a7c6f8',
                  catalogSyncEnabled: true,
                }
              }
              onUpdateWhatsAppConfig={onUpdateWhatsAppConfig}
              whatsAppLogs={whatsAppLogs}
              onAddWhatsAppLog={onAddWhatsAppLog}
              loyaltyTransactions={loyaltyTransactions}
              onAddLoyaltyTransaction={onAddLoyaltyTransaction}
              onUpdateCustomerPoints={onUpdateCustomerPoints}
            />
          )}

          {/* PHASE 15: SUNMI & IMIN HARDWARE INTEGRATION SUITE */}
          {activeTab === 'hardware' && (
            <HardwareSuiteManager tenant={tenant} />
          )}

          {/* PHASE 18: RETURNS MANAGEMENT, DAMAGES & PHYSICAL STOCK COUNT AUDIT */}
          {activeTab === 'returns' && (
            <ReturnsAndAuditHub
              tenant={tenant}
              products={products}
              warehouses={warehouses}
              suppliers={suppliers}
              customers={customers}
              sales={sales}
              creditNotes={creditNotes}
              purchaseReturns={purchaseReturns}
              damageLogs={damageLogs}
              stockCountAudits={stockCountAudits}
              initialTab={returnsSubTab}
              onSaveCreditNote={(cn, restockItems) => {
                if (onCreateCreditNote) {
                  onCreateCreditNote(cn, restockItems);
                }
              }}
              onSavePurchaseReturn={onSavePurchaseReturn}
              onSaveDamageLog={onSaveDamageLog}
              onCreateStockCountAudit={onCreateStockCountAudit}
              onUpdateStockCountAudit={onUpdateStockCountAudit}
              onReconcileStockCountAudit={onReconcileStockCountAudit}
            />
          )}

          {/* PHASE 19: SALES AGENTS & MULTI-TIER COMMISSION PROGRAM */}
          {activeTab === 'commissions' && (
            <CommissionManager
              tenant={tenant}
              agents={salesAgents}
              programs={commissionPrograms}
              rules={commissionRules}
              receipts={commissionReceipts}
              initialTab={commissionsSubTab}
              onSaveAgent={onSaveAgent}
              onDeleteAgent={onDeleteAgent}
              onSaveProgram={onSaveCommissionProgram}
              onDeleteProgram={onDeleteCommissionProgram}
              onSaveRule={onSaveCommissionRule}
              onDeleteRule={onDeleteCommissionRule}
              onSaveReceipt={onSaveCommissionReceipt}
            />
          )}

          {/* PHASE 20: SERVICE, REPAIR JOBS & MAINTENANCE MANAGEMENT (AMC / WARRANTY) */}
          {activeTab === 'service' && (
            <ServiceMaintenanceManager
              tenant={tenant}
              products={products}
              customers={customers}
              employees={employees}
              sales={sales}
              tickets={serviceTickets}
              checklists={inspectionChecklists}
              contracts={maintenanceContracts}
              warranties={warrantyRecords}
              claims={warrantyClaims}
              initialTab={serviceSubTab}
              onSaveTicket={onSaveServiceTicket}
              onUpdateTicket={onUpdateServiceTicket}
              onAddSparePartToJob={onAddSparePartToJob}
              onSaveChecklist={onSaveChecklist}
              onSaveContract={onSaveAMCContract}
              onRecordVisit={onRecordAMCVisit}
              onSaveWarrantyClaim={onSaveWarrantyClaim}
              onUpdateWarrantyClaimStatus={onUpdateWarrantyClaimStatus}
              onSendSmsAlert={(phone, msg) => onSmsCustomerDue?.({ id: 'srv', tenantId: tenant.id, name: 'Service Customer', phone, dueAmount: 0, totalSpent: 0, address: '', purchaseCount: 0, lastPurchased: new Date().toISOString() }, msg)}
            />
          )}

          {/* PHASE 21: FIXED ASSET MANAGEMENT, DEPRECIATION (SLM/WDV) & MAINTENANCE */}
          {activeTab === 'assets' && (
            <FixedAssetManager
              tenant={tenant}
              currency={tenant.currency || '৳'}
              assets={fixedAssets}
              maintenanceLogs={assetMaintenanceLogs}
              onSaveAsset={onSaveFixedAsset}
              onUpdateAsset={onUpdateFixedAsset}
              onSaveMaintenanceRecord={onSaveAssetMaintenance}
            />
          )}

          {/* PHASE 22: PROJECTS, TASKS KANBAN, CONTRACTS & APPOINTMENT BOOKINGS */}
          {activeTab === 'projects' && (
            <ProjectsAndBookingsHub
              tenant={tenant}
              currency={tenant.currency || '৳'}
              projects={projects}
              tasks={projectTasks}
              contracts={commercialContracts}
              bookings={appointmentBookings}
              customers={customers}
              employees={employees}
              suppliers={suppliers}
              onSaveProject={onSaveProject}
              onUpdateProject={onUpdateProject}
              onDeleteProject={onDeleteProject}
              onSaveTask={onSaveProjectTask}
              onUpdateTask={onUpdateProjectTask}
              onDeleteTask={onDeleteProjectTask}
              onSaveContract={onSaveCommercialContract}
              onUpdateContract={onUpdateCommercialContract}
              onDeleteContract={onDeleteCommercialContract}
              onSaveBooking={onSaveAppointmentBooking}
              onUpdateBookingStatus={onUpdateAppointmentBookingStatus}
              onDeleteBooking={onDeleteAppointmentBooking}
              onSendBookingReminder={onSendBookingReminder}
            />
          )}

          {/* PHASE 23: PEOPLE MANAGEMENT, CLIENT SELF-SERVICE PORTAL & INVITED CUSTOMERS */}
          {activeTab === 'people' && (
            <PeopleAndClientPortalHub
              tenant={tenant}
              customers={customers}
              sales={sales}
              onlineOrders={onlineOrders}
              serviceTickets={serviceTickets}
              contracts={commercialContracts}
              bookings={appointmentBookings}
              inviteCodes={inviteCodes}
              pendingApplications={pendingApplications}
              portalPaymentClaims={portalPaymentClaims}
              initialTab={peopleSubTab}
              initialFilter={peopleFilter}
              onAddCustomer={() => setIsAddCustomerModalOpen(true)}
              onUpdateCustomerPortalAccess={onUpdateCustomerPortalAccess || (() => {})}
              onSaveInviteCode={onSaveInviteCode || (() => {})}
              onDeleteInviteCode={onDeleteInviteCode || (() => {})}
              onApproveApplication={onApproveApplication || (() => {})}
              onRejectApplication={onRejectApplication || (() => {})}
              onCreateApplication={onCreateApplication || (() => {})}
              onSubmitPortalPaymentClaim={onSubmitPortalPaymentClaim || (() => {})}
              onVerifyPortalPaymentClaim={onVerifyPortalPaymentClaim || (() => {})}
              onOpenCustomerLedger={(c) => { setSelectedLedgerCustomer(c); setIsLedgerModalOpen(true); }}
              onOpenReceivePayment={(c) => { setSelectedPaymentCustomer(c); setIsReceivePaymentModalOpen(true); }}
              onSendSmsReminder={onSmsCustomerDue}
              onOpenA4Invoice={onOpenA4Invoice}
            />
          )}

          {/* PHASE 24: 3D DASHBOARD, CASH REGISTER SHIFT REPORTS & ANALYTICAL INTELLIGENCE */}
          {activeTab === 'analytics' && (
            <AnalyticsAndIntelligenceHub
              tenant={tenant}
              currency={tenant.currency || '৳'}
              products={products}
              sales={sales}
              warehouses={warehouses}
              suppliers={suppliers}
              customers={customers}
              employees={employees}
              cashRegisterShifts={cashRegisterShifts}
              loginActivityLogs={loginActivityLogs}
              systemErrorLogs={systemErrorLogs}
              initialTab={analyticsSubTab}
              onOpenShift={onOpenShift || (() => {})}
              onCloseShift={onCloseShift || (() => {})}
              onAddCashAdjustment={onAddCashAdjustment || (() => {})}
              onResolveErrorLog={onResolveErrorLog || (() => {})}
              onStockAdjustment={(prod, newStk, reason) => {
                if (onAdjustStock) {
                  onAdjustStock(prod.id, newStk, {
                    id: 'adj-' + Date.now(),
                    productId: prod.id,
                    productName: prod.name,
                    type: 'audit',
                    quantity: Math.abs(newStk - prod.stock),
                    reason: reason,
                    adjustedBy: 'Auditor Admin',
                    createdAt: new Date().toISOString()
                  });
                }
              }}
              onSendSmsAlert={onSmsCustomerDue ? ((phone, msg) => onSmsCustomerDue({
                id: 'churn-' + Date.now(),
                tenantId: tenant.id,
                name: 'Loyalty Member',
                phone,
                dueAmount: 0,
                totalSpent: 0,
                address: '',
                purchaseCount: 0,
                lastPurchased: new Date().toISOString()
              }, msg)) : undefined}
            />
          )}

          {/* PHASE 25: QUICKBOOKS ONLINE SYNC, WOOCOMMERCE API, WEBHOOKS & SECURITY HUB */}
          {activeTab === 'integrations' && (
            <EnterpriseIntegrationsAndSecurityHub
              tenant={tenant}
              quickBooksConfig={quickBooksConfig}
              onUpdateQuickBooksConfig={onUpdateQuickBooksConfig}
              wooCommerceConfig={wooCommerceConfig}
              onUpdateWooCommerceConfig={onUpdateWooCommerceConfig}
              outboundWebhooks={outboundWebhooks}
              onSaveWebhook={onSaveWebhook}
              onDeleteWebhook={onDeleteWebhook}
              webhookDeliveryLogs={webhookDeliveryLogs}
              onAddWebhookDeliveryLog={onAddWebhookDeliveryLog}
              activeSessions={activeSessions}
              onRevokeSession={onRevokeSession}
              onTerminateAllOtherSessions={onTerminateAllOtherSessions}
              systemHealth={systemHealth}
              backupArchives={backupArchives}
              onCreateBackup={onCreateBackup}
              onRestoreBackup={onRestoreBackup}
              onDeleteBackup={onDeleteBackup}
              backupSchedule={backupSchedule}
              onUpdateBackupSchedule={onUpdateBackupSchedule}
              initialTab={integrationsSubTab}
            />
          )}

          {/* STORE SETTINGS TAB - Enterprise Settings & Knowledge Base */}
          {activeTab === 'settings' && (
            <EnterpriseSettingsHub
              tenant={tenant}
              initialTab={settingsSubTab}
              onUpdateStoreSettings={onUpdateStoreSettings}
              onOpenSuperAdmin={onOpenSuperAdmin}
              onOpenDataResetManager={onOpenDataResetManager}
            />
          )}
        </main>
      </div>

      {/* Add Product Modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-purple-100 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="bg-purple-800 text-white px-5 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">নতুন পণ্য যুক্ত করুন ({tenant.name})</h3>
                <p className="text-xs text-purple-200">ইনভেন্টরি ও অনলাইন স্টোরে পণ্যটি যুক্ত হবে</p>
              </div>
              <button onClick={() => setShowAddProductModal(false)} className="text-purple-200 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateProductSubmit} className="p-5 space-y-3 text-xs max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">পণ্যের নাম: *</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: নাপা ৫০০মিগ্রা / বাসমতি চাল"
                    value={pName}
                    onChange={e => setPName(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">SKU / বারকোড:</label>
                  <input
                    type="text"
                    placeholder="অটো জেনারেট"
                    value={pSku}
                    onChange={e => setPSku(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">ক্যাটাগরি:</label>
                  <input
                    type="text"
                    placeholder="যেমন: মেডিসিন / চাল"
                    value={pCategory}
                    onChange={e => setPCategory(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">কেনা দর (Cost Price):</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="0.00"
                    value={pCostPrice}
                    onChange={e => setPCostPrice(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">খুচরা বিক্রয় মূল্য (MRP): *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="0.00"
                    value={pSellingPrice}
                    onChange={e => setPSellingPrice(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl font-bold text-purple-700"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">পাইকারি দর (Wholesale):</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="যেমন: ৳৫০.০০"
                    value={pWholesalePrice}
                    onChange={e => setPWholesalePrice(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-slate-700"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">প্রারম্ভিক স্টক:</label>
                  <input
                    type="number"
                    placeholder="10"
                    value={pStock}
                    onChange={e => setPStock(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">সতর্কবার্তা স্টক (Low Alert):</label>
                  <input
                    type="number"
                    placeholder="5"
                    value={pAlertStock}
                    onChange={e => setPAlertStock(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-amber-700"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">একক (Unit):</label>
                  <select
                    value={pUnit}
                    onChange={e => setPUnit(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl"
                  >
                    <option value="pcs">পিস (pcs)</option>
                    <option value="kg">কেজি (kg)</option>
                    <option value="strip">পাতা (strip)</option>
                    <option value="bottle">বোতল (bottle)</option>
                    <option value="box">কার্টুন (box)</option>
                    <option value="packet">প্যাকেট (packet)</option>
                    <option value="meter">মিটার (meter)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">কোম্পানি / প্রস্তুতকারক:</label>
                  <input
                    type="text"
                    placeholder="যেমন: স্কয়ার / বেক্সিমকো / প্রাণ"
                    value={pManufacturer}
                    onChange={e => setPManufacturer(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">র‍্যাক বা তাকের অবস্থান:</label>
                  <input
                    type="text"
                    placeholder="যেমন: Rack-A1, Shelf-3"
                    value={pRackNumber}
                    onChange={e => setPRackNumber(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              {/* Special Fields for Pharmacy */}
              {tenant.businessType === 'pharmacy' && (
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 space-y-2">
                  <span className="font-bold text-purple-900 block text-xs">⚕️ ফার্মেসি স্পেশাল ফিল্ডস (DGDA স্ট্যান্ডার্ড):</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-slate-600 block">জেনেরিক নাম:</label>
                      <input
                        type="text"
                        placeholder="যেমন: Paracetamol 500mg"
                        value={pGeneric}
                        onChange={e => setPGeneric(e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-600 block">ঔষধের ধরন (Dosage Form):</label>
                      <select
                        value={pDosageForm}
                        onChange={e => setPDosageForm(e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                      >
                        <option value="Tablet">Tablet (ট্যাবলেট)</option>
                        <option value="Capsule">Capsule (ক্যাপসুল)</option>
                        <option value="Syrup">Syrup (সিরাপ)</option>
                        <option value="Suspension">Suspension</option>
                        <option value="Injection">Injection (ইনজেকশন)</option>
                        <option value="Ointment">Ointment / Gel (মলম)</option>
                        <option value="Eye Drops">Eye / Ear Drops (ড্রপ)</option>
                        <option value="Suppository">Suppository</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-600 block">মেয়াদোত্তীর্ণ তারিখ (Expiry):</label>
                      <input
                        type="date"
                        value={pExpiry}
                        onChange={e => setPExpiry(e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-600 block">ব্যাচ নম্বর:</label>
                      <input
                        type="text"
                        placeholder="BEX-2026-01"
                        value={pBatch}
                        onChange={e => setPBatch(e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[11px] text-slate-600 block">DAR / ড্রাগ রেজিস্ট্রেশন নম্বর:</label>
                      <input
                        type="text"
                        placeholder="যেমন: DAR-025-010"
                        value={pDarNumber}
                        onChange={e => setPDarNumber(e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Special Fields for Electronics & Hardware */}
              {tenant.businessType === 'electronics' && (
                <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 space-y-2">
                  <span className="font-bold text-indigo-900 block text-xs">⚡ গ্যাজেট ও ইলেকট্রনিক্স ফিল্ডস:</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-slate-600 block">ব্র্যান্ড (Brand):</label>
                      <input
                        type="text"
                        placeholder="যেমন: Samsung, Walton, Apple"
                        value={pBrand}
                        onChange={e => setPBrand(e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-600 block">মডেল নম্বর:</label>
                      <input
                        type="text"
                        placeholder="যেমন: SM-G998B"
                        value={pModelNumber}
                        onChange={e => setPModelNumber(e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[11px] text-slate-600 block">ওয়ারেন্টির মেয়াদ (মাসে):</label>
                      <input
                        type="number"
                        placeholder="১২"
                        value={pWarranty}
                        onChange={e => setPWarranty(e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="pOnlineCheck"
                  checked={pOnline}
                  onChange={e => setPOnline(e.target.checked)}
                  className="rounded text-purple-700"
                />
                <label htmlFor="pOnlineCheck" className="text-slate-700 font-semibold cursor-pointer">
                  অনলাইন ই-কমার্স ওয়েবসাইটে দেখান
                </label>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold shadow-xs"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Barcode & Price Tag Generator Modal */}
      <BarcodeGeneratorModal
        isOpen={isBarcodeModalOpen}
        onClose={() => setIsBarcodeModalOpen(false)}
        tenant={tenant}
        products={tenantProducts}
        initialSelectedProductId={barcodeProductToPrint}
      />

      {/* CSV Bulk Import Modal (Products, Customers, Suppliers) */}
      <BulkImportModal
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        tenant={tenant}
        warehouseId={activeWarehouseId}
        importType={bulkImportType}
        onImportProducts={(prods) => {
          if (onBulkImportProducts) {
            onBulkImportProducts(prods);
          }
        }}
        onImportCustomers={(newCusts) => {
          newCusts.forEach(c => onAddCustomer?.(c));
        }}
        onImportSuppliers={(newSupps) => {
          newSupps.forEach(s => onSaveSupplier?.(s));
        }}
      />

      {/* Stock Adjustment Modal */}
      <StockAdjustmentModal
        isOpen={isStockAdjustmentOpen}
        onClose={() => setIsStockAdjustmentOpen(false)}
        tenant={tenant}
        products={tenantProducts}
        onApplyAdjustment={(productId, newStock, record) => {
          if (onAdjustStock) {
            onAdjustStock(productId, newStock, record);
          }
        }}
      />

      {/* Quotations Modal */}
      <QuotationModal
        isOpen={isQuotationModalOpen}
        onClose={() => setIsQuotationModalOpen(false)}
        tenant={tenant}
        products={tenantProducts}
        customers={tenantCustomers}
        quotations={quotations}
        onCreateQuotation={(q) => onCreateQuotation?.(q)}
        onConvertToInvoice={(q) => onConvertToInvoice?.(q)}
      />

      {/* Delivery Challans Modal */}
      <DeliveryChallanModal
        isOpen={isChallanModalOpen}
        onClose={() => setIsChallanModalOpen(false)}
        tenant={tenant}
        sales={tenantSales}
        challans={deliveryChallans}
        onCreateChallan={(ch) => onCreateDeliveryChallan?.(ch)}
      />

      {/* Credit Note / Sales Return Modal */}
      <CreditNoteModal
        isOpen={isCreditNoteModalOpen}
        onClose={() => setIsCreditNoteModalOpen(false)}
        tenant={tenant}
        sales={tenantSales}
        creditNotes={creditNotes}
        onCreateCreditNote={(cn, items) => onCreateCreditNote?.(cn, items)}
      />

      {/* Phase 3: Customer Detailed Ledger Statement Modal */}
      <CustomerLedgerModal
        isOpen={isLedgerModalOpen}
        onClose={() => {
          setIsLedgerModalOpen(false);
          setSelectedLedgerCustomer(null);
        }}
        customer={selectedLedgerCustomer}
        tenant={tenant}
        onOpenReceivePayment={(cust) => {
          setIsLedgerModalOpen(false);
          setSelectedPaymentCustomer(cust);
          setIsReceivePaymentModalOpen(true);
        }}
        onOpenSmsReminder={(cust) => {
          setIsLedgerModalOpen(false);
          setSelectedSmsCustomer(cust);
          setIsSmsReminderModalOpen(true);
        }}
      />

      {/* Phase 3: Receive Due Payment Modal */}
      <ReceivePaymentModal
        isOpen={isReceivePaymentModalOpen}
        onClose={() => {
          setIsReceivePaymentModalOpen(false);
          setSelectedPaymentCustomer(null);
        }}
        customer={selectedPaymentCustomer}
        tenant={tenant}
        cashierName={employees[0]?.name || 'Suman Roy'}
        onPaymentReceived={(receipt) => {
          onReceivePayment?.(receipt);
        }}
      />

      {/* Phase 3: SMS Payment Reminder Modal */}
      <SmsReminderModal
        isOpen={isSmsReminderModalOpen}
        onClose={() => {
          setIsSmsReminderModalOpen(false);
          setSelectedSmsCustomer(null);
        }}
        customer={selectedSmsCustomer}
        tenant={tenant}
        onSendSms={(cust, msg) => {
          onSmsCustomerDue(cust, msg);
        }}
      />

      {/* Phase 3: Add / Edit Customer Modal */}
      <AddCustomerModal
        isOpen={isAddCustomerModalOpen}
        onClose={() => {
          setIsAddCustomerModalOpen(false);
          setCustomerToEdit(null);
        }}
        tenant={tenant}
        customerToEdit={customerToEdit}
        onSaveCustomer={(customerData, existingId) => {
          onAddCustomer?.(customerData, existingId);
        }}
      />

      {/* Phase 3: Money Receipt Voucher Modal */}
      <PaymentReceiptModal
        isOpen={isPaymentReceiptModalOpen}
        onClose={() => {
          setIsPaymentReceiptModalOpen(false);
          setSelectedPaymentReceipt(null);
        }}
        receipt={selectedPaymentReceipt}
        tenant={tenant}
      />

      {/* Phase 14: WhatsApp Due Recovery Reminder Modal */}
      {selectedWhatsAppDueCustomer && (
        <WhatsAppDueReminderModal
          customer={selectedWhatsAppDueCustomer}
          tenant={tenant}
          onClose={() => setSelectedWhatsAppDueCustomer(null)}
          onSend={(msg, phone) => {
            const log: WhatsAppMessageLog = {
              id: 'wa-due-' + Date.now(),
              tenantId: tenant.id,
              recipientName: selectedWhatsAppDueCustomer.name,
              recipientPhone: phone,
              templateType: 'due_reminder',
              messageText: msg,
              status: 'delivered',
              timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
              costBDT: 0.55,
            };
            onAddWhatsAppLog?.(log);
          }}
        />
      )}

      {/* Mobile Fixed Bottom Navigation Bar (Matching Screenshot 1) */}
      {isMobileView && (
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 px-4 py-2 flex items-center justify-around shadow-lg">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold transition ${
              activeTab === 'dashboard' ? 'text-[#663399] dark:text-purple-400' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 stroke-[2.2]" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('invoices')}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold transition ${
              activeTab === 'invoices' ? 'text-[#663399] dark:text-purple-400' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShoppingCart className="w-5 h-5 stroke-[2.2]" />
            <span>Sales</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold transition ${
              activeTab === 'products' ? 'text-[#663399] dark:text-purple-400' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Package className="w-5 h-5 stroke-[2.2]" />
            <span>Products</span>
          </button>

          <button
            onClick={() => setActiveTab('accounting')}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold transition ${
              activeTab === 'accounting' ? 'text-[#663399] dark:text-purple-400' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <TrendingUp className="w-5 h-5 stroke-[2.2]" />
            <span>Reports</span>
          </button>

          <button
            onClick={() => setIsAppearanceOpen(true)}
            className="flex flex-col items-center gap-0.5 text-[10px] font-semibold text-slate-500 relative"
          >
            <div 
              style={{ backgroundColor: primaryColor }}
              className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg active:scale-95 transition -mt-5"
            >
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <span>Settings</span>
          </button>
        </nav>
      )}

      {/* Mobile Drawer Navigation (Multi-level Accordion Matching Screenshots 3-19) */}
      <MobileDrawerNav
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        tenant={tenant}
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onOpenPOS={() => setIsMobilePOSOpen(true)}
        onOpenStorefront={onOpenStorefront}
        onOpenCalculator={onOpenCalculator}
        onOpenAppearance={() => setIsAppearanceOpen(true)}
        primaryColor={primaryColor}
      />

      {/* Mobile Dynamic Appearance Customizer (Matching Screenshot 8) */}
      <MobileDynamicAppearance
        isOpen={isAppearanceOpen}
        onClose={() => setIsAppearanceOpen(false)}
        currentColor={primaryColor}
        onSelectColor={setPrimaryColor}
        sidebarLayout={sidebarLayout}
        onSelectSidebarLayout={setSidebarLayout}
        isDarkMode={isDarkMode}
        onToggleDarkMode={setIsDarkMode}
        isRTL={isRTL}
        onToggleRTL={setIsRTL}
      />
    </div>
  );
};
