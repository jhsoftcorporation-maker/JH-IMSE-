import React, { useState, useEffect } from 'react';
import { 
  getPersistedData, setPersistedData, getTenantDataStats, exportTenantBackupJSON,
  isSystemInstalled, markSystemInstalled, isCleanProductionMode, setCleanProductionMode
} from './utils/storageEngine';
import { FirstTimeInstallerWizard, DatabaseConfig, SuperAdminSetupData, PlatformSetupConfig } from './components/FirstTimeInstallerWizard';
import { DataResetManagerModal } from './components/settings/DataResetManagerModal';
import { 
  INITIAL_TENANTS, INITIAL_PRODUCTS, INITIAL_CUSTOMERS, 
  INITIAL_SALES, INITIAL_EMPLOYEES, INITIAL_ONLINE_ORDERS, 
  INITIAL_WAREHOUSES, INITIAL_QUOTATIONS, INITIAL_DELIVERY_CHALLANS,
  INITIAL_CREDIT_NOTES, INITIAL_PAYMENT_RECEIPTS,
  INITIAL_ATTENDANCE_RECORDS, INITIAL_ROLE_PERMISSIONS, INITIAL_SALARY_SLIPS,
  INITIAL_EXPENSES, INITIAL_SUPPLIERS, INITIAL_PURCHASE_ORDERS, INITIAL_SUPPLIER_PAYMENTS,
  INITIAL_ADMIN_PAYMENT_ACCOUNTS, INITIAL_SUBSCRIPTION_REQUESTS, INITIAL_GLOBAL_PLATFORM_SETTINGS,
  INITIAL_BRANCH_REQUISITIONS, INITIAL_STOCK_TRANSFERS,
  INITIAL_AUTO_PURCHASE_ORDERS, INITIAL_SEASONAL_TRENDS, INITIAL_DEAD_STOCK_ITEMS,
  INITIAL_EXCHANGE_RATES, INITIAL_PAYMENT_GATEWAYS, INITIAL_CROSS_BORDER_TAX_SLABS, INITIAL_CROSS_BORDER_TRANSACTIONS,
  INITIAL_WHATSAPP_CONFIGS, INITIAL_WHATSAPP_LOGS, INITIAL_LOYALTY_TRANSACTIONS,
  INITIAL_BRANDS, INITIAL_SUB_CATEGORIES, INITIAL_UNITS, INITIAL_OPENING_STOCKS, INITIAL_CATEGORIES_LIST,
  INITIAL_PURCHASE_RETURNS, INITIAL_DAMAGE_LOGS, INITIAL_STOCK_COUNT_AUDITS,
  INITIAL_SALES_AGENTS, INITIAL_COMMISSION_PROGRAMS, INITIAL_COMMISSION_RULES, INITIAL_COMMISSION_RECEIPTS,
  INITIAL_SERVICE_JOB_TICKETS, INITIAL_INSPECTION_CHECKLISTS, INITIAL_MAINTENANCE_CONTRACTS,
  INITIAL_WARRANTY_RECORDS, INITIAL_WARRANTY_CLAIMS,
  INITIAL_FIXED_ASSETS, INITIAL_ASSET_MAINTENANCE_LOGS,
  INITIAL_PROJECTS, INITIAL_PROJECT_TASKS, INITIAL_COMMERCIAL_CONTRACTS, INITIAL_APPOINTMENT_BOOKINGS,
  INITIAL_B2B_INVITE_CODES, INITIAL_PENDING_APPLICATIONS, INITIAL_PORTAL_PAYMENT_CLAIMS,
  INITIAL_CASH_REGISTER_SHIFTS, INITIAL_USER_LOGIN_LOGS, INITIAL_SYSTEM_ERROR_LOGS,
  INITIAL_QUICKBOOKS_CONFIGS, INITIAL_WOOCOMMERCE_CONFIGS, INITIAL_OUTBOUND_WEBHOOKS,
  INITIAL_WEBHOOK_DELIVERY_LOGS, INITIAL_ACTIVE_USER_SESSIONS, INITIAL_DATABASE_BACKUPS,
  INITIAL_SYSTEM_HEALTH, INITIAL_BACKUP_SCHEDULE
} from './data/mockData';
import { 
  Tenant, Product, Sale, Customer, Employee, OnlineOrder, Warehouse,
  Quotation, DeliveryChallan, CreditNote, CustomerPaymentReceipt,
  CustomerTransaction, AttendanceRecord, RolePermission, SalarySlip,
  ExpenseItem, Supplier, SupplierPurchaseOrder, SupplierPayment, SupplierTransaction,
  SubscriptionPaymentRequest, AdminPaymentAccounts, PlanTier, GlobalPlatformSettings,
  BranchRequisition, StockTransferChallan, RequisitionStatus, TransferChallanItem,
  AutoPurchaseOrder, SeasonalDemandTrend, DeadStockLiquidationItem,
  ExchangeRateRecord, PaymentGatewayConfig, CrossBorderTaxSlab, CrossBorderTransaction,
  WhatsAppConfig, WhatsAppMessageLog, LoyaltyPointTransaction,
  Brand, SubCategory, UnitOfMeasure, OpeningStockEntry, Category,
  PurchaseReturn, DamageLog, StockCountAudit, DamageReason, StockAdjustment,
  SalesAgent, CommissionProgram, CommissionRule, CommissionReceipt,
  ServiceJobTicket, InspectionChecklist, MaintenanceContract, WarrantyRecord, WarrantyClaim,
  ServiceJobPartItem, WarrantyClaimStatus,
  FixedAsset, AssetMaintenanceRecord, JournalEntry,
  Project, ProjectTask, CommercialContract, AppointmentBooking,
  B2BInviteCode, PendingCustomerApplication, ClientPortalDuePaymentClaim,
  CashRegisterShift, UserLoginActivityLog, SystemAuditErrorLog, CashDenominationBreakdown,
  QuickBooksConfig, WooCommerceConfig, OutboundWebhook, WebhookDeliveryLog,
  ActiveUserSession, SystemHealthMetrics, DatabaseBackupArchive, BackupScheduleConfig
} from './types';
import { LandingPage } from './components/LandingPage';
import { SuperAdmin } from './components/SuperAdmin';
import { TenantDashboard } from './components/TenantDashboard';
import { POSScreen } from './components/POSScreen';
import { StorefrontView } from './components/StorefrontView';
import { CalculatorModal } from './components/CalculatorModal';
import { ThermalReceipt } from './components/ThermalReceipt';
import { A4InvoiceModal } from './components/A4InvoiceModal';
import { FreeTrialRegisterModal } from './components/auth/FreeTrialRegisterModal';
import { SubscriptionCheckoutModal } from './components/auth/SubscriptionCheckoutModal';
import { AuthModal } from './components/auth/AuthModal';
import { CheckCircle2, MessageSquare, X, ArrowLeft, Building2, ShieldCheck, Sparkles, User, LogOut, CreditCard } from 'lucide-react';

export default function App() {
  // Navigation View State
  const [currentView, setCurrentView] = useState<
    'landing' | 'super_admin' | 'tenant_dashboard' | 'pos' | 'storefront'
  >('landing');
  const [isImpersonating, setIsImpersonating] = useState(false);

  // First-Time Installer & Clean Production Slate State
  const [isCleanSlate, setIsCleanSlate] = useState<boolean>(() => isCleanProductionMode());
  const [isInstallerOpen, setIsInstallerOpen] = useState(false);

  // Core Data Collections with Auto-Persistence Engine (Zero Dummy Slate by default in Production)
  const isClean = isCleanProductionMode();
  const [tenants, setTenants] = useState<Tenant[]>(() => {
    if (isClean) return getPersistedData('tenants', []);
    return getPersistedData('tenants', INITIAL_TENANTS);
  });
  const [activeTenantId, setActiveTenantId] = useState<string>(() => getPersistedData('activeTenantId', 'tenant-default'));
  const [products, setProducts] = useState<Product[]>(() => getPersistedData('products', isClean ? [] : INITIAL_PRODUCTS));
  const [sales, setSales] = useState<Sale[]>(() => getPersistedData('sales', isClean ? [] : INITIAL_SALES));
  const [customers, setCustomers] = useState<Customer[]>(() => getPersistedData('customers', isClean ? [] : INITIAL_CUSTOMERS));
  const [employees, setEmployees] = useState<Employee[]>(() => getPersistedData('employees', isClean ? [] : INITIAL_EMPLOYEES));
  const [onlineOrders, setOnlineOrders] = useState<OnlineOrder[]>(() => getPersistedData('onlineOrders', isClean ? [] : INITIAL_ONLINE_ORDERS));
  const [warehouses, setWarehouses] = useState<Warehouse[]>(() => getPersistedData('warehouses', isClean ? [] : INITIAL_WAREHOUSES));
  const [activeWarehouseId, setActiveWarehouseId] = useState<string>('all');
  const [quotations, setQuotations] = useState<Quotation[]>(() => getPersistedData('quotations', isClean ? [] : INITIAL_QUOTATIONS));
  const [deliveryChallans, setDeliveryChallans] = useState<DeliveryChallan[]>(() => getPersistedData('deliveryChallans', isClean ? [] : INITIAL_DELIVERY_CHALLANS));
  const [creditNotes, setCreditNotes] = useState<CreditNote[]>(() => getPersistedData('creditNotes', isClean ? [] : INITIAL_CREDIT_NOTES));
  const [paymentReceipts, setPaymentReceipts] = useState<CustomerPaymentReceipt[]>(() => getPersistedData('paymentReceipts', isClean ? [] : INITIAL_PAYMENT_RECEIPTS));
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(isClean ? [] : INITIAL_ATTENDANCE_RECORDS);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>(INITIAL_ROLE_PERMISSIONS);
  const [salarySlips, setSalarySlips] = useState<SalarySlip[]>(isClean ? [] : INITIAL_SALARY_SLIPS);
  const [expenses, setExpenses] = useState<ExpenseItem[]>(() => getPersistedData('expenses', isClean ? [] : INITIAL_EXPENSES));
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => getPersistedData('suppliers', isClean ? [] : INITIAL_SUPPLIERS));
  const [purchaseOrders, setPurchaseOrders] = useState<SupplierPurchaseOrder[]>(() => getPersistedData('purchaseOrders', isClean ? [] : INITIAL_PURCHASE_ORDERS));
  const [supplierPayments, setSupplierPayments] = useState<SupplierPayment[]>(() => getPersistedData('supplierPayments', isClean ? [] : INITIAL_SUPPLIER_PAYMENTS));
  const [requisitions, setRequisitions] = useState<BranchRequisition[]>(isClean ? [] : INITIAL_BRANCH_REQUISITIONS);
  const [transfers, setTransfers] = useState<StockTransferChallan[]>(() => getPersistedData('transfers', isClean ? [] : INITIAL_STOCK_TRANSFERS));

  // Phase 12 AI Demand Forecasting & Auto-PO State
  const [autoPurchaseOrders, setAutoPurchaseOrders] = useState<AutoPurchaseOrder[]>(INITIAL_AUTO_PURCHASE_ORDERS);
  const [seasonalTrends, setSeasonalTrends] = useState<SeasonalDemandTrend[]>(INITIAL_SEASONAL_TRENDS);
  const [deadStockItems, setDeadStockItems] = useState<DeadStockLiquidationItem[]>(INITIAL_DEAD_STOCK_ITEMS);

  // Phase 13 Global Payments & Multi-Currency State
  const [exchangeRates, setExchangeRates] = useState<ExchangeRateRecord[]>(INITIAL_EXCHANGE_RATES);
  const [paymentGateways, setPaymentGateways] = useState<PaymentGatewayConfig[]>(INITIAL_PAYMENT_GATEWAYS);
  const [taxSlabs, setTaxSlabs] = useState<CrossBorderTaxSlab[]>(INITIAL_CROSS_BORDER_TAX_SLABS);
  const [crossBorderTransactions, setCrossBorderTransactions] = useState<CrossBorderTransaction[]>(INITIAL_CROSS_BORDER_TRANSACTIONS);

  // Phase 14 Omnichannel WhatsApp Bot & Loyalty Rewards State
  const [whatsAppConfigs, setWhatsAppConfigs] = useState<WhatsAppConfig[]>(INITIAL_WHATSAPP_CONFIGS);
  const [whatsAppLogs, setWhatsAppLogs] = useState<WhatsAppMessageLog[]>(INITIAL_WHATSAPP_LOGS);
  const [loyaltyTransactions, setLoyaltyTransactions] = useState<LoyaltyPointTransaction[]>(INITIAL_LOYALTY_TRANSACTIONS);

  // Phase 17: Product Hierarchy, Brands, SubCategories, UOM & Opening Stocks
  const [brands, setBrands] = useState<Brand[]>(INITIAL_BRANDS);
  const [subCategories, setSubCategories] = useState<SubCategory[]>(INITIAL_SUB_CATEGORIES);
  const [units, setUnits] = useState<UnitOfMeasure[]>(INITIAL_UNITS);
  const [openingStocks, setOpeningStocks] = useState<OpeningStockEntry[]>(INITIAL_OPENING_STOCKS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES_LIST);

  // Phase 18: Returns Management (RMA), Damages & Physical Stock Count Audit
  const [purchaseReturns, setPurchaseReturns] = useState<PurchaseReturn[]>(INITIAL_PURCHASE_RETURNS);
  const [damageLogs, setDamageLogs] = useState<DamageLog[]>(INITIAL_DAMAGE_LOGS);
  const [stockCountAudits, setStockCountAudits] = useState<StockCountAudit[]>(INITIAL_STOCK_COUNT_AUDITS);

  // Phase 19: Multi-Tier Sales Agent Commission Program & Rule Engine
  const [salesAgents, setSalesAgents] = useState<SalesAgent[]>(INITIAL_SALES_AGENTS);
  const [commissionPrograms, setCommissionPrograms] = useState<CommissionProgram[]>(INITIAL_COMMISSION_PROGRAMS);
  const [commissionRules, setCommissionRules] = useState<CommissionRule[]>(INITIAL_COMMISSION_RULES);
  const [commissionReceipts, setCommissionReceipts] = useState<CommissionReceipt[]>(INITIAL_COMMISSION_RECEIPTS);

  // Phase 20: Service, Repair Jobs & Maintenance Management (AMC / Warranty)
  const [serviceTickets, setServiceTickets] = useState<ServiceJobTicket[]>(INITIAL_SERVICE_JOB_TICKETS);
  const [inspectionChecklists, setInspectionChecklists] = useState<InspectionChecklist[]>(INITIAL_INSPECTION_CHECKLISTS);
  const [maintenanceContracts, setMaintenanceContracts] = useState<MaintenanceContract[]>(INITIAL_MAINTENANCE_CONTRACTS);
  const [warrantyRecords, setWarrantyRecords] = useState<WarrantyRecord[]>(INITIAL_WARRANTY_RECORDS);
  const [warrantyClaims, setWarrantyClaims] = useState<WarrantyClaim[]>(INITIAL_WARRANTY_CLAIMS);

  // Phase 21: Fixed Asset Management, Maintenance & Depreciation (SLM/WDV)
  const [fixedAssets, setFixedAssets] = useState<FixedAsset[]>(INITIAL_FIXED_ASSETS);
  const [assetMaintenanceLogs, setAssetMaintenanceLogs] = useState<AssetMaintenanceRecord[]>(INITIAL_ASSET_MAINTENANCE_LOGS);

  // Phase 22: Projects, Tasks Kanban, Contracts & Appointment Bookings
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [projectTasks, setProjectTasks] = useState<ProjectTask[]>(INITIAL_PROJECT_TASKS);
  const [commercialContracts, setCommercialContracts] = useState<CommercialContract[]>(INITIAL_COMMERCIAL_CONTRACTS);
  const [appointmentBookings, setAppointmentBookings] = useState<AppointmentBooking[]>(INITIAL_APPOINTMENT_BOOKINGS);

  // Phase 23: People Management, Client Self-Service Portal & Invited Customers
  const [inviteCodes, setInviteCodes] = useState<B2BInviteCode[]>(INITIAL_B2B_INVITE_CODES);
  const [pendingApplications, setPendingApplications] = useState<PendingCustomerApplication[]>(INITIAL_PENDING_APPLICATIONS);
  const [portalPaymentClaims, setPortalPaymentClaims] = useState<ClientPortalDuePaymentClaim[]>(INITIAL_PORTAL_PAYMENT_CLAIMS);

  // Phase 24: 3D Dashboard, Cash Register Shift Reports & Analytical Intelligence
  const [cashRegisterShifts, setCashRegisterShifts] = useState<CashRegisterShift[]>(INITIAL_CASH_REGISTER_SHIFTS);
  const [loginActivityLogs, setLoginActivityLogs] = useState<UserLoginActivityLog[]>(INITIAL_USER_LOGIN_LOGS);
  const [systemErrorLogs, setSystemErrorLogs] = useState<SystemAuditErrorLog[]>(INITIAL_SYSTEM_ERROR_LOGS);

  // Phase 25: QuickBooks Online Sync, WooCommerce API, Webhooks & Security Hub State
  const [quickBooksConfigs, setQuickBooksConfigs] = useState<Record<string, QuickBooksConfig>>(INITIAL_QUICKBOOKS_CONFIGS);
  const [wooCommerceConfigs, setWooCommerceConfigs] = useState<Record<string, WooCommerceConfig>>(INITIAL_WOOCOMMERCE_CONFIGS);
  const [outboundWebhooks, setOutboundWebhooks] = useState<OutboundWebhook[]>(INITIAL_OUTBOUND_WEBHOOKS);
  const [webhookLogs, setWebhookLogs] = useState<WebhookDeliveryLog[]>(INITIAL_WEBHOOK_DELIVERY_LOGS);
  const [activeSessions, setActiveSessions] = useState<ActiveUserSession[]>(INITIAL_ACTIVE_USER_SESSIONS);
  const [systemHealth, setSystemHealth] = useState<SystemHealthMetrics>(INITIAL_SYSTEM_HEALTH);
  const [backupArchives, setBackupArchives] = useState<DatabaseBackupArchive[]>(INITIAL_DATABASE_BACKUPS);
  const [backupSchedule, setBackupSchedule] = useState<BackupScheduleConfig>(INITIAL_BACKUP_SCHEDULE);

  // Subscription Payment Requests & Admin Payment Settings
  const [subscriptionRequests, setSubscriptionRequests] = useState<SubscriptionPaymentRequest[]>(INITIAL_SUBSCRIPTION_REQUESTS);
  const [adminPaymentAccounts, setAdminPaymentAccounts] = useState<AdminPaymentAccounts>(INITIAL_ADMIN_PAYMENT_ACCOUNTS);
  const [platformSettings, setPlatformSettings] = useState<GlobalPlatformSettings>(INITIAL_GLOBAL_PLATFORM_SETTINGS);

  // Auth & Subscription Modals
  const [isFreeTrialModalOpen, setIsFreeTrialModalOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authPortalTarget, setAuthPortalTarget] = useState<'standard' | 'super_admin'>('standard');
  const [selectedUpgradePlan, setSelectedUpgradePlan] = useState<'starter' | 'professional' | 'enterprise'>('professional');

  // URL Route Detection for #admin, #super-admin, and #setup / #installer
  useEffect(() => {
    const handleUrlHashRoute = () => {
      const hash = window.location.hash.toLowerCase();
      const pathname = window.location.pathname.toLowerCase();

      if (hash === '#setup' || hash === '#installer' || pathname.endsWith('/setup') || pathname.endsWith('/installer')) {
        setIsInstallerOpen(true);
      } else if (hash === '#super-admin' || hash === '#superadmin' || pathname.endsWith('/super-admin')) {
        setAuthPortalTarget('super_admin');
        setIsAuthModalOpen(true);
      } else if (hash === '#admin' || hash === '#login' || pathname.endsWith('/admin')) {
        setAuthPortalTarget('standard');
        setIsAuthModalOpen(true);
      }
    };

    handleUrlHashRoute();
    window.addEventListener('hashchange', handleUrlHashRoute);
    return () => window.removeEventListener('hashchange', handleUrlHashRoute);
  }, []);

  // Clean Production Slate Toggle (Zero Dummy Data vs Demo Sandbox)
  const handleToggleCleanProduction = (clean: boolean) => {
    setIsCleanSlate(clean);
    setCleanProductionMode(clean);
    if (clean) {
      setTenants([]);
      setSales([]);
      setProducts([]);
      setCustomers([]);
      setEmployees([]);
      setSubscriptionRequests([]);
      setOnlineOrders([]);
      setQuotations([]);
      setDeliveryChallans([]);
      setCreditNotes([]);
      setPaymentReceipts([]);
      setExpenses([]);
      setSuppliers([]);
      setPurchaseOrders([]);
      setSupplierPayments([]);
      setTransfers([]);
      setWarehouses([]);
      setCashRegisterShifts([]);
      setAttendanceRecords([]);
      setSalarySlips([]);

      setPersistedData('tenants', []);
      setPersistedData('sales', []);
      setPersistedData('products', []);
      setPersistedData('customers', []);
      setPersistedData('employees', []);
      setPersistedData('subscriptionRequests', []);
      setPersistedData('onlineOrders', []);
      setPersistedData('quotations', []);
      setPersistedData('deliveryChallans', []);
      setPersistedData('creditNotes', []);
      setPersistedData('paymentReceipts', []);
      setPersistedData('expenses', []);
      setPersistedData('suppliers', []);
      setPersistedData('purchaseOrders', []);
      setPersistedData('supplierPayments', []);
      setPersistedData('transfers', []);
      setPersistedData('warehouses', []);
      setPersistedData('cashRegisterShifts', []);
    } else {
      setTenants(INITIAL_TENANTS);
      setSales(INITIAL_SALES);
      setProducts(INITIAL_PRODUCTS);
      setCustomers(INITIAL_CUSTOMERS);
      setEmployees(INITIAL_EMPLOYEES);
      setSubscriptionRequests(INITIAL_SUBSCRIPTION_REQUESTS);
      setOnlineOrders(INITIAL_ONLINE_ORDERS);
      setQuotations(INITIAL_QUOTATIONS);
      setDeliveryChallans(INITIAL_DELIVERY_CHALLANS);
      setCreditNotes(INITIAL_CREDIT_NOTES);
      setPaymentReceipts(INITIAL_PAYMENT_RECEIPTS);
      setExpenses(INITIAL_EXPENSES);
      setSuppliers(INITIAL_SUPPLIERS);
      setPurchaseOrders(INITIAL_PURCHASE_ORDERS);
      setSupplierPayments(INITIAL_SUPPLIER_PAYMENTS);
      setTransfers(INITIAL_STOCK_TRANSFERS);
      setWarehouses(INITIAL_WAREHOUSES);
      setCashRegisterShifts(INITIAL_CASH_REGISTER_SHIFTS);
      setAttendanceRecords(INITIAL_ATTENDANCE_RECORDS);
      setSalarySlips(INITIAL_SALARY_SLIPS);

      setPersistedData('tenants', INITIAL_TENANTS);
      setPersistedData('sales', INITIAL_SALES);
      setPersistedData('products', INITIAL_PRODUCTS);
      setPersistedData('customers', INITIAL_CUSTOMERS);
      setPersistedData('employees', INITIAL_EMPLOYEES);
      setPersistedData('subscriptionRequests', INITIAL_SUBSCRIPTION_REQUESTS);
      setPersistedData('onlineOrders', INITIAL_ONLINE_ORDERS);
      setPersistedData('quotations', INITIAL_QUOTATIONS);
      setPersistedData('deliveryChallans', INITIAL_DELIVERY_CHALLANS);
      setPersistedData('creditNotes', INITIAL_CREDIT_NOTES);
      setPersistedData('paymentReceipts', INITIAL_PAYMENT_RECEIPTS);
      setPersistedData('expenses', INITIAL_EXPENSES);
      setPersistedData('suppliers', INITIAL_SUPPLIERS);
      setPersistedData('purchaseOrders', INITIAL_PURCHASE_ORDERS);
      setPersistedData('supplierPayments', INITIAL_SUPPLIER_PAYMENTS);
      setPersistedData('transfers', INITIAL_STOCK_TRANSFERS);
      setPersistedData('warehouses', INITIAL_WAREHOUSES);
      setPersistedData('cashRegisterShifts', INITIAL_CASH_REGISTER_SHIFTS);
    }
  };

  // Complete First-Time Installation
  const handleCompleteInstallation = (
    dbConfig: DatabaseConfig,
    adminData: SuperAdminSetupData,
    platformConfig: PlatformSetupConfig
  ) => {
    markSystemInstalled(true);
    const startClean = platformConfig.startMode === 'clean_production';
    handleToggleCleanProduction(startClean);
    setIsInstallerOpen(false);

    // Auto-login to Super Admin Console
    setCurrentUser({
      id: 'super-admin-master',
      name: adminData.adminName,
      email: adminData.adminEmail,
      role: 'super_admin',
      phone: adminData.adminPhone,
      shopName: adminData.companyName,
    });
    setCurrentView('super_admin');
  };
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    name: string;
    email: string;
    role: 'super_admin' | 'owner' | 'manager' | 'cashier';
    phone?: string;
    shopName?: string;
  } | null>(null);

  // Modals & Tools
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [activeReceiptSale, setActiveReceiptSale] = useState<Sale | null>(null);
  const [activeA4InvoiceSale, setActiveA4InvoiceSale] = useState<Sale | null>(null);
  const [systemBroadcast, setSystemBroadcast] = useState(
    'সিস্টেম আপডেট নোটিশ: আজ রাত ১২টায় সার্ভার অপ্টিমাইজেশন সম্পন্ন হবে।'
  );

  // SMS Alert Simulation Toast
  const [smsToast, setSmsToast] = useState<{ name: string; phone: string; amount: number; message?: string } | null>(null);

  // Default Empty Tenant Fallback (Guarantees zero-crash when in Clean Production mode with 0 stores)
  const DEFAULT_EMPTY_TENANT: Tenant = {
    id: 'tenant-default',
    name: 'আপনার কোম্পানি',
    slug: 'my-company',
    businessType: 'grocery',
    ownerName: 'মালিক',
    email: 'admin@jh-imse.shop',
    phone: '01800000000',
    address: 'ঢাকা, বাংলাদেশ',
    currency: '৳',
    plan: 'trial',
    status: 'active',
    subscriptionExpiry: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
    createdAt: new Date().toISOString().slice(0, 10),
    monthlyFee: 0,
    quotas: {
      maxBranches: 1,
      maxUsers: 2,
      maxProducts: 100,
      maxMonthlyInvoices: 100,
      storageGb: 1,
    },
    usage: {
      currentBranches: 1,
      currentUsers: 1,
      currentProducts: 0,
      currentMonthlyInvoices: 0,
      currentStorageMb: 1,
    },
    features: {
      pos: true,
      ecommerce: true,
      crm: true,
      hrm: true,
      accounting: true,
      ai: true,
      multiWarehouse: true,
      globalCommerce: true,
      whatsappLoyalty: true,
      hardwareSuite: true,
      commissions: true,
      serviceMaintenance: true,
      assets: true,
      projects: true,
      peoplePortal: true,
      analytics3d: true,
      pharmacyBatch: true,
      imeiWarranty: true,
    },
  };

  // Active Tenant Helper (Always non-null and safely typed)
  const activeTenant = tenants.find(t => t.id === activeTenantId) || tenants[0] || DEFAULT_EMPTY_TENANT;

  // Store Data Management & Production Reset State
  const [isDataResetModalOpen, setIsDataResetModalOpen] = useState(false);

  // Auto-Persistence Synchronizer
  useEffect(() => { setPersistedData('tenants', tenants); }, [tenants]);
  useEffect(() => { setPersistedData('activeTenantId', activeTenantId); }, [activeTenantId]);
  useEffect(() => { setPersistedData('products', products); }, [products]);
  useEffect(() => { setPersistedData('sales', sales); }, [sales]);
  useEffect(() => { setPersistedData('customers', customers); }, [customers]);
  useEffect(() => { setPersistedData('employees', employees); }, [employees]);
  useEffect(() => { setPersistedData('onlineOrders', onlineOrders); }, [onlineOrders]);
  useEffect(() => { setPersistedData('expenses', expenses); }, [expenses]);
  useEffect(() => { setPersistedData('suppliers', suppliers); }, [suppliers]);
  useEffect(() => { setPersistedData('quotations', quotations); }, [quotations]);
  useEffect(() => { setPersistedData('deliveryChallans', deliveryChallans); }, [deliveryChallans]);
  useEffect(() => { setPersistedData('creditNotes', creditNotes); }, [creditNotes]);
  useEffect(() => { setPersistedData('paymentReceipts', paymentReceipts); }, [paymentReceipts]);
  useEffect(() => { setPersistedData('transfers', transfers); }, [transfers]);
  useEffect(() => { setPersistedData('purchaseOrders', purchaseOrders); }, [purchaseOrders]);
  useEffect(() => { setPersistedData('supplierPayments', supplierPayments); }, [supplierPayments]);
  useEffect(() => { setPersistedData('cashRegisterShifts', cashRegisterShifts); }, [cashRegisterShifts]);

  // Data Lifecycle Handlers (Clean Production, Reset Sales, Demo Reload, Backup/Restore)
  const handleCleanProductionReset = () => {
    // Keep tenant profiles and warehouses, but wipe all dummy items for this tenant
    setProducts(prev => prev.filter(p => p.tenantId && p.tenantId !== activeTenantId));
    setSales(prev => prev.filter(s => s.tenantId && s.tenantId !== activeTenantId));
    setCustomers(prev => prev.filter(c => c.tenantId && c.tenantId !== activeTenantId));
    setQuotations(prev => prev.filter(q => q.tenantId && q.tenantId !== activeTenantId));
    setDeliveryChallans(prev => prev.filter(d => d.tenantId && d.tenantId !== activeTenantId));
    setCreditNotes(prev => prev.filter(cn => cn.tenantId && cn.tenantId !== activeTenantId));
    setPaymentReceipts(prev => prev.filter(pr => pr.tenantId && pr.tenantId !== activeTenantId));
    setExpenses(prev => prev.filter(ex => ex.tenantId && ex.tenantId !== activeTenantId));
    setPurchaseOrders(prev => prev.filter(po => po.tenantId && po.tenantId !== activeTenantId));
    setSupplierPayments(prev => prev.filter(sp => sp.tenantId && sp.tenantId !== activeTenantId));
    setCashRegisterShifts(prev => prev.filter(cs => cs.tenantId && cs.tenantId !== activeTenantId));
    setTransfers(prev => prev.filter(t => t.tenantId && t.tenantId !== activeTenantId));
    setOnlineOrders(prev => prev.filter(o => o.tenantId && o.tenantId !== activeTenantId));
  };

  const handleResetSalesOnly = () => {
    // Keep products, categories, suppliers and customer directory intact
    setSales(prev => prev.filter(s => s.tenantId && s.tenantId !== activeTenantId));
    setQuotations(prev => prev.filter(q => q.tenantId && q.tenantId !== activeTenantId));
    setDeliveryChallans(prev => prev.filter(d => d.tenantId && d.tenantId !== activeTenantId));
    setCreditNotes(prev => prev.filter(cn => cn.tenantId && cn.tenantId !== activeTenantId));
    setPaymentReceipts(prev => prev.filter(pr => pr.tenantId && pr.tenantId !== activeTenantId));
    setCashRegisterShifts(prev => prev.filter(cs => cs.tenantId && cs.tenantId !== activeTenantId));
    
    // Reset customer debts to 0
    setCustomers(prev => prev.map(c => {
      if (c.tenantId === activeTenantId) {
        return { ...c, dueAmount: 0, totalSpent: 0, purchaseCount: 0 };
      }
      return c;
    }));
  };

  const handleLoadStarterTemplate = (industry: 'clean_blank' | 'pharmacy_starter' | 'grocery_starter' | 'electronics_starter') => {
    handleCleanProductionReset();
    if (industry === 'pharmacy_starter') {
      setCategories([
        { id: 'cat-1', tenantId: activeTenantId, name: 'অ্যান্টিবায়োটিক (Antibiotics)' },
        { id: 'cat-2', tenantId: activeTenantId, name: 'ব্যথানাশক ও জ্বর (Analgesics)' },
        { id: 'cat-3', tenantId: activeTenantId, name: 'গ্যাস্ট্রিক ও এসিডিটি (PPI & Antacid)' },
        { id: 'cat-4', tenantId: activeTenantId, name: 'ভিটামিন ও সাপ্লিমেন্ট (Vitamins)' },
      ]);
      setUnits([
        { id: 'u-1', tenantId: activeTenantId, name: 'পাতা (Strip)', shortName: 'strip', isBaseUnit: true, createdAt: '2026-01-01' },
        { id: 'u-2', tenantId: activeTenantId, name: 'পিস (Pcs)', shortName: 'pcs', isBaseUnit: true, createdAt: '2026-01-01' },
        { id: 'u-3', tenantId: activeTenantId, name: 'বক্স (Box)', shortName: 'box', isBaseUnit: false, createdAt: '2026-01-01' },
        { id: 'u-4', tenantId: activeTenantId, name: 'বোতল (Bottle)', shortName: 'btl', isBaseUnit: true, createdAt: '2026-01-01' },
      ]);
    } else if (industry === 'grocery_starter') {
      setCategories([
        { id: 'cat-10', tenantId: activeTenantId, name: 'চাল ও ডাল (Rice & Pulses)' },
        { id: 'cat-11', tenantId: activeTenantId, name: 'ভোজ্য তেল ও মসলা (Oils & Spices)' },
        { id: 'cat-12', tenantId: activeTenantId, name: 'দুগ্ধজাত ও বেকারি (Dairy & Bakery)' },
        { id: 'cat-13', tenantId: activeTenantId, name: 'ব্যক্তিগত যত্ন ও টয়লেট্রিজ (Personal Care)' },
      ]);
      setUnits([
        { id: 'u-10', tenantId: activeTenantId, name: 'কেজি (Kg)', shortName: 'kg', isBaseUnit: true, createdAt: '2026-01-01' },
        { id: 'u-11', tenantId: activeTenantId, name: 'গ্রাম (Gram)', shortName: 'gm', isBaseUnit: false, createdAt: '2026-01-01' },
        { id: 'u-12', tenantId: activeTenantId, name: 'লিটার (Liter)', shortName: 'ltr', isBaseUnit: true, createdAt: '2026-01-01' },
        { id: 'u-13', tenantId: activeTenantId, name: 'পিস (Pcs)', shortName: 'pcs', isBaseUnit: true, createdAt: '2026-01-01' },
      ]);
    }
  };

  const handleLoadDemoData = () => {
    setProducts(INITIAL_PRODUCTS);
    setSales(INITIAL_SALES);
    setCustomers(INITIAL_CUSTOMERS);
    setEmployees(INITIAL_EMPLOYEES);
    setQuotations(INITIAL_QUOTATIONS);
    setDeliveryChallans(INITIAL_DELIVERY_CHALLANS);
    setCreditNotes(INITIAL_CREDIT_NOTES);
    setPaymentReceipts(INITIAL_PAYMENT_RECEIPTS);
    setExpenses(INITIAL_EXPENSES);
    setSuppliers(INITIAL_SUPPLIERS);
    setPurchaseOrders(INITIAL_PURCHASE_ORDERS);
    setSupplierPayments(INITIAL_SUPPLIER_PAYMENTS);
    setCashRegisterShifts(INITIAL_CASH_REGISTER_SHIFTS);
    setTransfers(INITIAL_STOCK_TRANSFERS);
    setOnlineOrders(INITIAL_ONLINE_ORDERS);
  };

  const handleExportAllData = () => {
    return exportTenantBackupJSON(activeTenantId, {
      tenant: activeTenant,
      products: products.filter(p => !p.tenantId || p.tenantId === activeTenantId),
      sales: sales.filter(s => !s.tenantId || s.tenantId === activeTenantId),
      customers: customers.filter(c => !c.tenantId || c.tenantId === activeTenantId),
      expenses: expenses.filter(e => !e.tenantId || e.tenantId === activeTenantId),
      suppliers: suppliers.filter(s => !s.tenantId || s.tenantId === activeTenantId),
      quotations: quotations.filter(q => !q.tenantId || q.tenantId === activeTenantId),
      deliveryChallans: deliveryChallans.filter(d => !d.tenantId || d.tenantId === activeTenantId),
      creditNotes: creditNotes.filter(cn => !cn.tenantId || cn.tenantId === activeTenantId),
      paymentReceipts: paymentReceipts.filter(pr => !pr.tenantId || pr.tenantId === activeTenantId),
    });
  };

  const handleImportAllData = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed.payload) return false;
      const { products: p, sales: s, customers: c, expenses: ex, suppliers: sup } = parsed.payload;
      if (Array.isArray(p)) setProducts(p);
      if (Array.isArray(s)) setSales(s);
      if (Array.isArray(c)) setCustomers(c);
      if (Array.isArray(ex)) setExpenses(ex);
      if (Array.isArray(sup)) setSuppliers(sup);
      return true;
    } catch {
      return false;
    }
  };

  // Actions
  const handleCreateTenant = (newTenantData: Omit<Tenant, 'id' | 'createdAt'>) => {
    const newId = 'tenant-' + (tenants.length + 1);
    const created: Tenant = {
      ...newTenantData,
      id: newId,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setTenants(prev => [created, ...prev]);

    // Create a default warehouse for this tenant
    const newWh: Warehouse = {
      id: 'wh-' + Date.now(),
      tenantId: newId,
      name: 'Main Store Outlet',
      location: created.address,
      isMain: true,
    };
    setWarehouses(prev => [...prev, newWh]);

    // Switch directly into their new dashboard
    setActiveTenantId(newId);
    setCurrentView('tenant_dashboard');
  };

  const handleUpdateTenant = (updated: Tenant) => {
    setTenants(prev => prev.map(t => t.id === updated.id ? updated : t));
  };

  const handleCompleteSale = (newSale: Sale) => {
    // 1. Add to sales log
    setSales(prev => [newSale, ...prev]);

    // 2. Deduct inventory stock for each item sold
    setProducts(prev => {
      return prev.map(p => {
        const itemSold = newSale.items.find(i => i.productId === p.id);
        if (itemSold) {
          const newStock = Math.max(0, p.stock - itemSold.quantity);
          return { ...p, stock: newStock };
        }
        return p;
      });
    });

    // 3. Update customer due & loyalty rewards if customer exists
    if (newSale.customerId) {
      const earned = newSale.loyaltyPointsEarned || 0;
      const redeemed = newSale.loyaltyPointsUsed || 0;

      setCustomers(prev => {
        return prev.map(c => {
          if (c.id === newSale.customerId) {
            const newDue = c.dueAmount + newSale.dueAmount;
            const newSpent = c.totalSpent + newSale.totalAmount;
            const newTier = newSpent > 50000 ? 'platinum' : newSpent > 25000 ? 'gold' : newSpent > 10000 ? 'silver' : 'bronze';
            const updatedPoints = Math.max(0, (c.loyaltyPoints || 0) - redeemed + earned);

            const newTrx: CustomerTransaction = {
              id: 'trx-' + Date.now(),
              customerId: c.id,
              date: newSale.createdAt.slice(0, 10),
              type: 'invoice',
              referenceNo: newSale.invoiceNumber,
              description: `বিক্রয় মেমো (${newSale.paymentMethod.toUpperCase()})`,
              debit: newSale.totalAmount,
              credit: newSale.paidAmount,
              balance: newDue,
              paymentMethod: newSale.paymentMethod as any,
              note: `মোট বিল: ৳${newSale.totalAmount}, জমা: ৳${newSale.paidAmount}${earned > 0 ? `, অর্জিত লয়্যালটি: +${earned} Pts` : ''}`,
            };

            return {
              ...c,
              totalSpent: newSpent,
              dueAmount: newDue,
              loyaltyTier: newTier,
              loyaltyPoints: updatedPoints,
              purchaseCount: c.purchaseCount + 1,
              lastPurchased: new Date().toISOString().slice(0, 10),
              transactions: [newTrx, ...(c.transactions || [])],
            };
          }
          return c;
        });
      });

      // Record loyalty point transaction
      if (earned > 0) {
        const newLpt: LoyaltyPointTransaction = {
          id: 'lpt-' + Date.now(),
          tenantId: newSale.tenantId,
          customerId: newSale.customerId,
          customerName: newSale.customerName,
          type: 'earned',
          points: earned,
          amountBDT: newSale.totalAmount,
          referenceInvoiceNo: newSale.invoiceNumber,
          date: new Date().toISOString().slice(0, 10),
          notes: `ইনভয়েস #${newSale.invoiceNumber} বাবদ অর্জিত পয়েন্ট`,
        };
        setLoyaltyTransactions(prev => [newLpt, ...prev]);
      }

      // Automatically dispatch WhatsApp Invoice if customer has phone
      if (newSale.customerPhone) {
        const waLog: WhatsAppMessageLog = {
          id: 'wa-pos-' + Date.now(),
          tenantId: newSale.tenantId,
          recipientName: newSale.customerName,
          recipientPhone: newSale.customerPhone,
          templateType: 'pos_invoice',
          messageText: `🌟 ${activeTenant.name} - ডিজিটাল ক্যাশ মেমো #${newSale.invoiceNumber} সফলভাবে সম্পন্ন। মোট: ৳${newSale.totalAmount}। অর্জিত লয়্যালটি: +${earned} Pts। ডাউনলোড: https://jh-imse.shop/invoice/${newSale.invoiceNumber}`,
          status: 'delivered',
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
          pdfUrl: `https://jh-imse.shop/invoice/${newSale.invoiceNumber}`,
          costBDT: 0.55,
        };
        setWhatsAppLogs(prev => [waLog, ...prev]);
        setSmsToast({
          name: newSale.customerName,
          phone: newSale.customerPhone,
          amount: newSale.totalAmount,
          message: `📱 হোয়াটসঅ্যাপে ক্যাশ মেমো (#${newSale.invoiceNumber}) ও +${earned} লয়্যালটি পয়েন্ট ক্লাউড API দিয়ে পাঠানো হয়েছে!`,
        });
      }
    }
  };

  const handleUpdateWhatsAppConfig = (updated: WhatsAppConfig) => {
    setWhatsAppConfigs(prev => prev.map(c => c.tenantId === updated.tenantId ? updated : c));
  };

  const handleAddWhatsAppLog = (newLog: WhatsAppMessageLog) => {
    setWhatsAppLogs(prev => [newLog, ...prev]);
  };

  const handleAddLoyaltyTransaction = (newTrx: LoyaltyPointTransaction) => {
    setLoyaltyTransactions(prev => [newTrx, ...prev]);
  };

  const handleUpdateCustomerPoints = (customerId: string, newPoints: number) => {
    setCustomers(prev => prev.map(c => c.id === customerId ? { ...c, loyaltyPoints: newPoints } : c));
  };

  const handlePlaceOnlineOrder = (newOrder: OnlineOrder) => {
    // 1. Add order to tenant list
    setOnlineOrders(prev => [newOrder, ...prev]);

    // 2. Deduct inventory stock immediately
    setProducts(prev => {
      return prev.map(p => {
        const itemOrdered = newOrder.items.find(i => i.productId === p.id);
        if (itemOrdered) {
          return { ...p, stock: Math.max(0, p.stock - itemOrdered.quantity) };
        }
        return p;
      });
    });
  };

  const handleAddProduct = (newProdData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...newProdData,
      id: 'prod-' + Date.now(),
    };
    setProducts(prev => [newProduct, ...prev]);
  };

  const handleBulkImportProducts = (newProductsList: Omit<Product, 'id'>[]) => {
    const created = newProductsList.map((p, idx) => ({
      ...p,
      id: 'prod-bulk-' + Date.now() + '-' + idx,
    }));
    setProducts(prev => [...created, ...prev]);
  };

  const handleAdjustStock = (productId: string, newStock: number) => {
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: newStock } : p));
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  const handleSaveCustomer = (customerData: Omit<Customer, 'id'>, existingId?: string) => {
    if (existingId) {
      setCustomers(prev => prev.map(c => c.id === existingId ? { ...c, ...customerData, id: existingId } : c));
    } else {
      const newId = 'cust-' + Date.now();
      const created: Customer = {
        ...customerData,
        id: newId,
      };
      setCustomers(prev => [created, ...prev]);
    }
  };

  const handleReceivePayment = (receipt: CustomerPaymentReceipt) => {
    setPaymentReceipts(prev => [receipt, ...prev]);

    setCustomers(prev => prev.map(c => {
      if (c.id === receipt.customerId) {
        const remainingDue = receipt.remainingDue;
        const newTrx: CustomerTransaction = {
          id: 'trx-' + Date.now(),
          customerId: c.id,
          date: receipt.date.slice(0, 10),
          type: 'payment',
          referenceNo: receipt.receiptNumber,
          description: `বকেয়া জমা (${receipt.paymentMethod.toUpperCase()})${receipt.discount > 0 ? ` [ছাড়: ৳${receipt.discount}]` : ''}`,
          debit: 0,
          credit: receipt.amount + receipt.discount,
          balance: remainingDue,
          paymentMethod: receipt.paymentMethod,
          note: receipt.note || (receipt.transactionId ? `TrxID: ${receipt.transactionId}` : undefined),
        };

        return {
          ...c,
          dueAmount: remainingDue,
          transactions: [newTrx, ...(c.transactions || [])],
        };
      }
      return c;
    }));
  };

  const handleSmsDue = (customer: Customer, message?: string) => {
    setSmsToast({
      name: customer.name,
      phone: customer.phone,
      amount: customer.dueAmount,
      message,
    });
    setTimeout(() => {
      setSmsToast(null);
    }, 6000);
  };

  const handleUpdateOrderStatus = (orderId: string, status: OnlineOrder['status']) => {
    setOnlineOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  const handleUpdateOrderCourier = (
    orderId: string, 
    partner: 'steadfast' | 'redx' | 'pathao' | 'in_house', 
    trackingId: string
  ) => {
    setOnlineOrders(prev => prev.map(o => o.id === orderId ? {
      ...o,
      courierPartner: partner,
      courierTrackingId: trackingId,
      courierStatus: 'in_transit',
      status: o.status === 'pending' ? 'packing' : o.status
    } : o));
  };

  const handleUpdateStoreSettings = (settings: {
    storeBannerText?: string;
    insideDhakaDeliveryFee?: number;
    outsideDhakaDeliveryFee?: number;
  }) => {
    setTenants(prev => prev.map(t => t.id === activeTenantId ? { ...t, ...settings } : t));
  };

  const handleFreeTrialSuccess = (trialData: {
    shopName: string;
    ownerName: string;
    phone: string;
    email: string;
    nidNumber: string;
    businessType: 'grocery' | 'pharmacy' | 'electronics' | 'warehouse';
    selectedModule: 'ecommerce' | 'erp_pos' | 'hrm' | 'crm' | 'all_in_one';
  }) => {
    const newId = 'tenant-' + (tenants.length + 1);
    const slug = trialData.shopName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 14);

    const createdTenant: Tenant = {
      id: newId,
      name: trialData.shopName,
      slug,
      businessType: trialData.businessType,
      ownerName: trialData.ownerName,
      email: trialData.email,
      phone: trialData.phone,
      nidNumber: trialData.nidNumber,
      selectedModule: trialData.selectedModule,
      address: 'ঢাকা, বাংলাদেশ',
      currency: '৳',
      plan: 'trial',
      status: 'active', // Instant auto-approval!
      subscriptionExpiry: expiryDate.toISOString().slice(0, 10),
      monthlyFee: 0,
      billingCycle: 'monthly',
      licenseKey: `JH-TRIAL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      quotas: {
        maxBranches: 1,
        maxUsers: 3,
        maxProducts: 250,
        maxMonthlyInvoices: 500,
        storageGb: 2,
      },
      usage: {
        currentBranches: 1,
        currentUsers: 1,
        currentProducts: 0,
        currentMonthlyInvoices: 0,
        currentStorageMb: 24,
      },
      features: {
        pos: true,
        ecommerce: trialData.selectedModule === 'ecommerce' || trialData.selectedModule === 'all_in_one',
        crm: trialData.selectedModule === 'crm' || trialData.selectedModule === 'all_in_one',
        hrm: trialData.selectedModule === 'hrm' || trialData.selectedModule === 'all_in_one',
        ai: true,
        pharmacyBatch: trialData.businessType === 'pharmacy',
        imeiWarranty: trialData.businessType === 'electronics',
        multiWarehouse: trialData.businessType === 'warehouse',
      },
      createdAt: new Date().toISOString().slice(0, 10),
    };

    setTenants(prev => [createdTenant, ...prev]);

    // Create default outlet
    const newWh: Warehouse = {
      id: 'wh-' + Date.now(),
      tenantId: newId,
      name: 'প্রধান আউটলেট / শপ',
      location: 'ঢাকা',
      isMain: true,
    };
    setWarehouses(prev => [...prev, newWh]);

    setActiveTenantId(newId);
    setCurrentView('tenant_dashboard');
    setIsFreeTrialModalOpen(false);
  };

  const handleSubmitSubscriptionRequest = (reqData: {
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
  }) => {
    const newReq: SubscriptionPaymentRequest = {
      id: 'SUB-' + Math.floor(1000 + Math.random() * 9000),
      ...reqData,
      status: 'pending',
      submittedAt: 'আজ, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setSubscriptionRequests(prev => [newReq, ...prev]);
    setIsSubscriptionModalOpen(false);
    alert('ধন্যবাদ! আপনার পেমেন্ট তথ্য সফলভাবে জমা হয়েছে। এডমিন ভেরিফাই করে অনুমোদন দেওয়া মাত্র আপনার সাবস্ক্রিপশন ও লাইসেন্স কার্যকর হবে।');
  };

  const handleApproveSubscriptionRequest = (requestId: string) => {
    const req = subscriptionRequests.find(r => r.id === requestId);
    if (!req) return;

    // 1. Mark request as approved
    setSubscriptionRequests(prev => prev.map(r => r.id === requestId ? {
      ...r,
      status: 'approved',
      reviewedAt: 'আজ, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    } : r));

    // 2. Upgrade the tenant
    setTenants(prev => prev.map(t => {
      if (t.id === req.tenantId || t.name === req.tenantName) {
        const currentExp = new Date(t.subscriptionExpiry > new Date().toISOString() ? t.subscriptionExpiry : new Date());
        if (req.billingCycle === 'yearly') {
          currentExp.setFullYear(currentExp.getFullYear() + 1);
        } else {
          currentExp.setMonth(currentExp.getMonth() + 1);
        }

        const fee = req.plan === 'starter' ? 999 : req.plan === 'professional' ? 1999 : 3999;
        const newLicense = `JH-PROD-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

        return {
          ...t,
          plan: req.plan,
          status: 'active',
          subscriptionExpiry: currentExp.toISOString().slice(0, 10),
          monthlyFee: fee,
          billingCycle: req.billingCycle,
          licenseKey: newLicense,
          features: {
            ...t.features,
            ecommerce: true,
            crm: true,
            hrm: req.plan === 'enterprise' || t.features.hrm,
            multiWarehouse: req.plan === 'enterprise' || t.features.multiWarehouse,
          },
        };
      }
      return t;
    }));
  };

  const handleRejectSubscriptionRequest = (requestId: string, reason?: string) => {
    setSubscriptionRequests(prev => prev.map(r => r.id === requestId ? {
      ...r,
      status: 'rejected',
      adminNotes: reason,
      reviewedAt: 'আজ, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    } : r));
  };

  const handleUpdateAdminPaymentAccounts = (accounts: AdminPaymentAccounts) => {
    setAdminPaymentAccounts(accounts);
  };

  const handleLoginSuccess = (user: {
    id: string;
    name: string;
    email: string;
    role: 'super_admin' | 'owner' | 'manager' | 'cashier';
    phone?: string;
    shopName?: string;
  }) => {
    setCurrentUser(user);
    setIsAuthModalOpen(false);

    if (user.role === 'super_admin') {
      setCurrentView('super_admin');
    } else {
      // Find matching tenant or default
      const matchedTenant = tenants.find(t => t.email.toLowerCase() === user.email.toLowerCase() || (user.phone && t.phone.includes(user.phone)));
      if (matchedTenant) {
        setActiveTenantId(matchedTenant.id);
      }
      setCurrentView('tenant_dashboard');
    }
  };

  const handleCreateQuotation = (newQuoteData: Omit<Quotation, 'id'>) => {
    const newQuote: Quotation = {
      ...newQuoteData,
      id: 'quote-' + Date.now(),
    };
    setQuotations(prev => [newQuote, ...prev]);
  };

  const handleCreateDeliveryChallan = (newChallanData: Omit<DeliveryChallan, 'id'>) => {
    const newChallan: DeliveryChallan = {
      ...newChallanData,
      id: 'challan-' + Date.now(),
    };
    setDeliveryChallans(prev => [newChallan, ...prev]);
  };

  const handleCreateCreditNote = (cnData: Omit<CreditNote, 'id'>, restockItems: { productId: string; quantity: number }[]) => {
    const newCn: CreditNote = {
      ...cnData,
      id: 'cn-' + Date.now(),
    };
    setCreditNotes(prev => [newCn, ...prev]);

    // If items in good condition, restock inventory!
    if (restockItems.length > 0) {
      setProducts(prev => prev.map(p => {
        const itemReturned = restockItems.find(it => it.productId === p.id);
        if (itemReturned) {
          return { ...p, stock: p.stock + itemReturned.quantity };
        }
        return p;
      }));
    }

    // If refundMethod is adjust_due, deduct customer's due amount in ledger
    if (cnData.refundMethod === 'adjust_due' && cnData.customerId) {
      setCustomers(prev => prev.map(c => {
        if (c.id === cnData.customerId) {
          return { ...c, dueAmount: Math.max(0, c.dueAmount - cnData.totalRefundAmount) };
        }
        return c;
      }));
    }
  };

  // Phase 18: Purchase Returns, Damages & Physical Stock Count Handlers
  const handleSavePurchaseReturn = (newPrData: Omit<PurchaseReturn, 'id'>) => {
    const newPr: PurchaseReturn = {
      ...newPrData,
      id: 'pr-' + Date.now(),
    };
    // Deduct returned quantity from products stock
    newPr.items.forEach(it => {
      setProducts(prev => prev.map(p => {
        if (p.id === it.productId) {
          return { ...p, stock: Math.max(0, p.stock - it.quantity) };
        }
        return p;
      }));
    });
    // Adjust supplier due balance if deduct_from_due
    if (newPr.settlementMethod === 'deduct_from_due' && newPr.supplierId) {
      setSuppliers(prev => prev.map(s => {
        if (s.id === newPr.supplierId) {
          return { ...s, dueBalance: Math.max(0, s.dueBalance - newPr.totalRefundAmount) };
        }
        return s;
      }));
    }
    setPurchaseReturns(prev => [newPr, ...prev]);
  };

  const handleSaveDamageLog = (newDmgData: Omit<DamageLog, 'id'>) => {
    const newDmg: DamageLog = {
      ...newDmgData,
      id: 'dmg-' + Date.now(),
    };
    // Deduct damaged quantity from product stock
    newDmg.items.forEach(it => {
      setProducts(prev => prev.map(p => {
        if (p.id === it.productId) {
          return { ...p, stock: Math.max(0, p.stock - it.quantity) };
        }
        return p;
      }));
    });
    setDamageLogs(prev => [newDmg, ...prev]);
  };

  const handleCreateStockCountAudit = (newAuditData: Omit<StockCountAudit, 'id'>) => {
    const newAudit: StockCountAudit = {
      ...newAuditData,
      id: 'aud-' + Date.now(),
    };
    setStockCountAudits(prev => [newAudit, ...prev]);
  };

  const handleUpdateStockCountAudit = (updatedAudit: StockCountAudit) => {
    setStockCountAudits(prev => prev.map(a => a.id === updatedAudit.id ? updatedAudit : a));
  };

  const handleReconcileStockCountAudit = (auditId: string) => {
    const audit = stockCountAudits.find(a => a.id === auditId);
    if (!audit) return;

    // 1. Reconcile inventory stock with physical count
    audit.items.forEach(it => {
      setProducts(prev => prev.map(p => {
        if (p.id === it.productId) {
          return { ...p, stock: it.countedStock };
        }
        return p;
      }));
    });

    // 2. Mark audit as reconciled
    const nowStr = new Date().toLocaleString('en-GB');
    setStockCountAudits(prev => prev.map(a => {
      if (a.id === auditId) {
        return {
          ...a,
          status: 'reconciled',
          reconciledAt: nowStr,
          reconciledBy: activeTenant?.ownerName || 'Admin Auditor',
        };
      }
      return a;
    }));
  };

  // Phase 19: Sales Agent & Multi-Tier Commission Program Handlers
  const handleSaveAgent = (agentData: Omit<SalesAgent, 'id'>, existingId?: string) => {
    if (existingId) {
      setSalesAgents(prev => prev.map(a => a.id === existingId ? { ...agentData, id: existingId } : a));
    } else {
      const newAgent: SalesAgent = {
        ...agentData,
        id: 'agent-' + Date.now(),
      };
      setSalesAgents(prev => [newAgent, ...prev]);
    }
  };

  const handleDeleteAgent = (agentId: string) => {
    setSalesAgents(prev => prev.filter(a => a.id !== agentId));
  };

  const handleSaveCommissionProgram = (progData: Omit<CommissionProgram, 'id'>, existingId?: string) => {
    if (existingId) {
      setCommissionPrograms(prev => prev.map(p => p.id === existingId ? { ...progData, id: existingId } : p));
    } else {
      const newProg: CommissionProgram = {
        ...progData,
        id: 'prog-' + Date.now(),
      };
      setCommissionPrograms(prev => [newProg, ...prev]);
    }
  };

  const handleDeleteCommissionProgram = (progId: string) => {
    setCommissionPrograms(prev => prev.filter(p => p.id !== progId));
  };

  const handleSaveCommissionRule = (ruleData: Omit<CommissionRule, 'id'>, existingId?: string) => {
    if (existingId) {
      setCommissionRules(prev => prev.map(r => r.id === existingId ? { ...ruleData, id: existingId } : r));
    } else {
      const newRule: CommissionRule = {
        ...ruleData,
        id: 'rule-' + Date.now(),
      };
      setCommissionRules(prev => [newRule, ...prev]);
    }
  };

  const handleDeleteCommissionRule = (ruleId: string) => {
    setCommissionRules(prev => prev.filter(r => r.id !== ruleId));
  };

  const handleSaveCommissionReceipt = (receiptData: Omit<CommissionReceipt, 'id'>) => {
    const newReceipt: CommissionReceipt = {
      ...receiptData,
      id: 'rec-' + Date.now(),
    };
    setCommissionReceipts(prev => [newReceipt, ...prev]);

    // Update agent commission numbers
    setSalesAgents(prev => prev.map(a => {
      if (a.id === newReceipt.agentId) {
        const newPaid = a.paidCommission + newReceipt.netPayable;
        const newDue = Math.max(0, a.earnedCommission - newPaid);
        return {
          ...a,
          paidCommission: newPaid,
          dueCommission: newDue,
        };
      }
      return a;
    }));

    setSmsToast({
      name: newReceipt.agentName,
      phone: newReceipt.receiptNumber,
      amount: newReceipt.netPayable,
      message: `কমিশন পে-আউট রসিদ #${newReceipt.receiptNumber} ইস্যু সম্পন্ন (৳${newReceipt.netPayable.toLocaleString()} BDT)।`,
    });
  };

  // Phase 20: Service, Repair Jobs & Maintenance Management (AMC / Warranty) Handlers
  const handleSaveServiceTicket = (ticketData: Omit<ServiceJobTicket, 'id' | 'createdAt'>) => {
    const newTicket: ServiceJobTicket = {
      ...ticketData,
      id: 'job-' + Date.now(),
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    };
    setServiceTickets(prev => [newTicket, ...prev]);
    setSmsToast({
      name: newTicket.customerName,
      phone: newTicket.ticketNumber,
      amount: newTicket.totalCost,
      message: `সার্ভিস জব টিকিট ${newTicket.ticketNumber} তৈরি হয়েছে (${newTicket.brand} ${newTicket.model})।`,
    });
  };

  const handleUpdateServiceTicket = (updated: ServiceJobTicket) => {
    setServiceTickets(prev => prev.map(t => t.id === updated.id ? updated : t));
  };

  const handleAddSparePartToJob = (ticketId: string, part: ServiceJobPartItem) => {
    // Deduct stock from product inventory
    setProducts(prev => prev.map(p => {
      if (p.id === part.productId) {
        return {
          ...p,
          stock: Math.max(0, p.stock - part.quantity),
        };
      }
      return p;
    }));
  };

  const handleSaveChecklist = (checklist: InspectionChecklist) => {
    setInspectionChecklists(prev => {
      const idx = prev.findIndex(c => c.id === checklist.id || c.ticketId === checklist.ticketId);
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = checklist;
        return copy;
      }
      return [checklist, ...prev];
    });
  };

  const handleSaveAMCContract = (contractData: Omit<MaintenanceContract, 'id' | 'createdAt'>) => {
    const newContract: MaintenanceContract = {
      ...contractData,
      id: 'amc-' + Date.now(),
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    };
    setMaintenanceContracts(prev => [newContract, ...prev]);
    setSmsToast({
      name: newContract.customerName,
      phone: newContract.contractNumber,
      amount: newContract.contractAmount,
      message: `AMC বার্ষিক রক্ষণাবেক্ষণ চুক্তি ${newContract.contractNumber} সক্রিয় হয়েছে।`,
    });
  };

  const handleRecordAMCVisit = (contractId: string, visit: any) => {
    setMaintenanceContracts(prev => prev.map(c => {
      if (c.id === contractId) {
        return {
          ...c,
          visitsCompleted: c.visitsCompleted + 1,
          visitLogs: [visit, ...c.visitLogs],
        };
      }
      return c;
    }));
    setSmsToast({
      name: visit.technicianName,
      phone: 'AMC Visit',
      amount: 0,
      message: `রক্ষণাবেক্ষণ ভিজিট লগ সম্পন্ন হয়েছে (${visit.visitDate})।`,
    });
  };

  const handleSaveWarrantyClaim = (claimData: Omit<WarrantyClaim, 'id' | 'createdAt'>) => {
    const newClaim: WarrantyClaim = {
      ...claimData,
      id: 'w-clm-' + Date.now(),
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    };
    setWarrantyClaims(prev => [newClaim, ...prev]);
    if (newClaim.warrantyId) {
      setWarrantyRecords(prev => prev.map(w => w.id === newClaim.warrantyId ? { ...w, claimsCount: w.claimsCount + 1, status: 'claimed' } : w));
    }
    setSmsToast({
      name: newClaim.customerName,
      phone: newClaim.claimNumber,
      amount: 0,
      message: `ওয়ারেন্টি ক্লেইম ${newClaim.claimNumber} গৃহীত হয়েছে।`,
    });
  };

  const handleUpdateWarrantyClaimStatus = (claimId: string, status: WarrantyClaimStatus, notes?: string) => {
    setWarrantyClaims(prev => prev.map(cl => cl.id === claimId ? { ...cl, claimStatus: status, technicianNotes: notes || cl.technicianNotes } : cl));
  };

  const handleConvertQuotationToSale = (quote: Quotation) => {
    const newSale: Sale = {
      id: 'sale-' + Date.now(),
      invoiceNumber: 'INV-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + Math.floor(100 + Math.random() * 900),
      tenantId: quote.tenantId,
      warehouseId: activeWarehouseId === 'all' ? (warehouses[0]?.id || 'wh-1') : activeWarehouseId,
      customerId: quote.customerId,
      customerName: quote.customerName,
      customerPhone: quote.customerPhone,
      items: quote.items.map(it => {
        const prod = products.find(p => p.id === it.productId);
        return {
          productId: it.productId,
          productName: it.productName,
          sku: it.sku,
          price: it.rate,
          costPrice: prod?.costPrice || it.rate * 0.8,
          quantity: it.quantity,
          unit: it.unit,
          subtotal: it.subtotal,
        };
      }),
      subtotal: quote.subtotal,
      tax: quote.tax,
      discount: quote.discount,
      totalAmount: quote.totalAmount,
      paidAmount: quote.totalAmount,
      dueAmount: 0,
      changeAmount: 0,
      paymentMethod: 'cash',
      cashierId: 'cashier-1',
      cashierName: employees[0]?.name || 'Suman Roy',
      createdAt: new Date().toLocaleString('en-GB'),
      status: 'completed',
      invoiceStatus: 'paid',
    };

    setSales(prev => [newSale, ...prev]);

    // Deduct stock for converted items
    setProducts(prev => prev.map(p => {
      const itemSold = newSale.items.find(i => i.productId === p.id);
      if (itemSold) {
        return { ...p, stock: Math.max(0, p.stock - itemSold.quantity) };
      }
      return p;
    }));

    // Update quotation status to accepted
    setQuotations(prev => prev.map(q => q.id === quote.id ? { ...q, status: 'accepted' } : q));

    // Show A4 Invoice
    setActiveA4InvoiceSale(newSale);
  };

  // Phase 5 HRM Handlers
  const handleSaveEmployee = (empData: Omit<Employee, 'id'>, existingId?: string) => {
    if (existingId) {
      setEmployees(prev => prev.map(e => e.id === existingId ? { ...empData, id: existingId } : e));
    } else {
      const newEmp: Employee = {
        ...empData,
        id: 'emp-' + Date.now(),
      };
      setEmployees(prev => [newEmp, ...prev]);
    }
  };

  const handleDeleteEmployee = (id: string) => {
    setEmployees(prev => prev.filter(e => e.id !== id));
  };

  const handleUpdateAttendanceRecord = (record: AttendanceRecord) => {
    setAttendanceRecords(prev => {
      const idx = prev.findIndex(r => r.tenantId === record.tenantId && r.employeeId === record.employeeId && r.date === record.date);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = record;
        return copy;
      }
      return [record, ...prev];
    });

    setEmployees(prev => prev.map(e => {
      if (e.id === record.employeeId) {
        return {
          ...e,
          attendanceToday: record.status,
          clockInTime: record.clockIn || e.clockInTime,
          clockOutTime: record.clockOut || e.clockOutTime,
        };
      }
      return e;
    }));
  };

  const handleBulkMarkAttendance = (records: AttendanceRecord[]) => {
    setAttendanceRecords(prev => {
      let nextList = [...prev];
      records.forEach(rec => {
        const idx = nextList.findIndex(r => r.tenantId === rec.tenantId && r.employeeId === rec.employeeId && r.date === rec.date);
        if (idx >= 0) {
          nextList[idx] = rec;
        } else {
          nextList = [rec, ...nextList];
        }
      });
      return nextList;
    });

    setEmployees(prev => prev.map(e => {
      const rec = records.find(r => r.employeeId === e.id);
      if (rec) {
        return {
          ...e,
          attendanceToday: rec.status,
          clockInTime: rec.clockIn || e.clockInTime,
        };
      }
      return e;
    }));
  };

  const handleUpdateRolePermissions = (roles: RolePermission[]) => {
    setRolePermissions(roles);
  };

  const handleAddSalarySlip = (slip: SalarySlip) => {
    setSalarySlips(prev => [slip, ...prev]);
  };

  const handleUpdateSlipStatus = (slipId: string, status: 'paid' | 'pending', method?: 'cash' | 'bkash' | 'bank') => {
    setSalarySlips(prev => prev.map(s => {
      if (s.id === slipId) {
        return {
          ...s,
          status,
          paymentMethod: method || s.paymentMethod,
          paymentDate: new Date().toISOString().slice(0, 10),
        };
      }
      return s;
    }));
  };

  // Phase 6: Financial Overview & Accounts Handlers
  const handleAddExpense = (expenseData: Omit<ExpenseItem, 'id' | 'voucherNo' | 'createdAt'>) => {
    const voucherNo = 'EXP-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + Math.floor(100 + Math.random() * 900);
    const newExp: ExpenseItem = {
      ...expenseData,
      id: 'exp-' + Date.now(),
      voucherNo,
      createdAt: new Date().toISOString(),
    };
    setExpenses(prev => [newExp, ...prev]);
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const handleSaveSupplier = (data: Omit<Supplier, 'id' | 'createdAt'>, existingId?: string) => {
    if (existingId) {
      setSuppliers(prev => prev.map(s => s.id === existingId ? { ...s, ...data, id: existingId } : s));
    } else {
      const newId = 'sup-' + Date.now();
      const created: Supplier = {
        ...data,
        id: newId,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      setSuppliers(prev => [created, ...prev]);
    }
  };

  const handleRecordSupplierPayment = (payment: SupplierPayment) => {
    setSupplierPayments(prev => [payment, ...prev]);
    setSuppliers(prev => prev.map(s => {
      if (s.id === payment.supplierId) {
        const newDue = Math.max(0, s.dueBalance - payment.amount);
        const newTrx: SupplierTransaction = {
          id: 'st-' + Date.now(),
          supplierId: s.id,
          date: payment.date,
          type: 'payment',
          referenceNo: payment.paymentVoucherNo,
          description: `বিল পরিশোধ (${payment.paymentMethod.toUpperCase()})`,
          debit: 0,
          credit: payment.amount,
          balance: newDue,
          paymentMethod: payment.paymentMethod,
          note: payment.note,
        };
        return {
          ...s,
          totalPaid: s.totalPaid + payment.amount,
          dueBalance: newDue,
          transactions: [newTrx, ...(s.transactions || [])],
        };
      }
      return s;
    }));
  };

  const handleCreatePurchaseOrder = (purchaseData: Omit<SupplierPurchaseOrder, 'id' | 'createdAt'>) => {
    const newPo: SupplierPurchaseOrder = {
      ...purchaseData,
      id: 'po-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setPurchaseOrders(prev => [newPo, ...prev]);

    // 1. Restock items in inventory!
    setProducts(prev => {
      return prev.map(prod => {
        const purchasedItem = newPo.items.find((i: any) => i.productId === prod.id || (i.sku && i.sku === prod.sku));
        if (purchasedItem) {
          return {
            ...prod,
            stock: prod.stock + purchasedItem.quantity,
            costPrice: purchasedItem.unitPrice || prod.costPrice,
            batchNumber: purchasedItem.batchNumber || prod.batchNumber,
            expiryDate: purchasedItem.expiryDate || prod.expiryDate,
          };
        }
        return prod;
      });
    });

    // 2. If purchased with due or payment, record in supplier's ledger!
    setSuppliers(prev => prev.map(s => {
      if (s.id === newPo.supplierId) {
        const newDue = s.dueBalance + newPo.dueAmount;
        const newTrx: SupplierTransaction = {
          id: 'st-' + Date.now(),
          supplierId: s.id,
          date: newPo.date,
          type: 'purchase_bill',
          referenceNo: newPo.poNumber,
          description: `চালান ক্রয় বিল (${newPo.paymentMethod.toUpperCase()})`,
          debit: newPo.totalAmount,
          credit: newPo.paidAmount,
          balance: newDue,
          paymentMethod: newPo.paymentMethod === 'due' ? undefined : (newPo.paymentMethod as any),
          note: newPo.note,
        };
        return {
          ...s,
          totalPurchases: s.totalPurchases + newPo.totalAmount,
          totalPaid: s.totalPaid + newPo.paidAmount,
          dueBalance: newDue,
          transactions: [newTrx, ...(s.transactions || [])],
        };
      }
      return s;
    }));
  };

  // Phase 11 Multi-Branch Logistics Handlers
  const handleCreateRequisition = (newReq: BranchRequisition) => {
    setRequisitions(prev => [newReq, ...prev]);
    setSmsToast({
      name: newReq.fromBranchName,
      phone: 'সেন্ট্রাল ডিপো',
      amount: newReq.totalEstimatedValue,
      message: `নতুন চাহিদাপত্র ${newReq.requisitionNo} সেন্ট্রাল ডিপোতে পাঠানো হয়েছে।`,
    });
  };

  const handleUpdateRequisitionStatus = (reqId: string, status: RequisitionStatus, approvedBy?: string) => {
    setRequisitions(prev => prev.map(r => r.id === reqId ? {
      ...r,
      status,
      approvedBy: approvedBy || r.approvedBy,
      approvedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    } : r));
  };

  const handleDispatchTransfer = (newChallan: StockTransferChallan) => {
    setTransfers(prev => [newChallan, ...prev]);

    // 1. Deduct stock from source warehouse
    setProducts(prev => prev.map(p => {
      const transferItem = newChallan.items.find(it => it.productId === p.id);
      if (transferItem) {
        const currentWhStock = p.warehouseStock?.[newChallan.sourceWarehouseId] ?? p.stock;
        const updatedWhStock = Math.max(0, currentWhStock - transferItem.dispatchedQty);
        const newWhMap = {
          ...(p.warehouseStock || {}),
          [newChallan.sourceWarehouseId]: updatedWhStock,
        };
        return {
          ...p,
          stock: Math.max(0, p.stock - transferItem.dispatchedQty),
          warehouseStock: newWhMap,
        };
      }
      return p;
    }));

    // 2. If linked to requisition, mark requisition in_transit
    if (newChallan.requisitionId) {
      setRequisitions(prev => prev.map(r => r.id === newChallan.requisitionId ? { ...r, status: 'in_transit' } : r));
    }

    setSmsToast({
      name: newChallan.driverName,
      phone: newChallan.driverPhone,
      amount: newChallan.totalCostValue,
      message: `গেটপাস চালান ${newChallan.transferNo} অনুমোদন ও গাড়ি রওনা দিয়েছে।`,
    });
  };

  const handleReceiveTransfer = (
    transferId: string,
    receiptData: {
      grnNo: string;
      receivedBy: string;
      items: TransferChallanItem[];
      status: 'received' | 'discrepancy';
      notes?: string;
    }
  ) => {
    let matchedChallan: StockTransferChallan | undefined;

    setTransfers(prev => prev.map(t => {
      if (t.id === transferId) {
        matchedChallan = t;
        return {
          ...t,
          grnNo: receiptData.grnNo,
          status: receiptData.status,
          receivedBy: receiptData.receivedBy,
          receivedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
          items: receiptData.items,
          notes: receiptData.notes || t.notes,
        };
      }
      return t;
    }));

    if (matchedChallan) {
      const destId = matchedChallan.destinationBranchId;
      // Increase stock at destination branch by the received qty
      setProducts(prev => prev.map(p => {
        const rItem = receiptData.items.find(it => it.productId === p.id);
        if (rItem && (rItem.receivedQty || 0) > 0) {
          const recQty = rItem.receivedQty || 0;
          const currentDestStock = p.warehouseStock?.[destId] ?? 0;
          const newWhMap = {
            ...(p.warehouseStock || {}),
            [destId]: currentDestStock + recQty,
          };
          return {
            ...p,
            stock: p.stock + recQty,
            warehouseStock: newWhMap,
          };
        }
        return p;
      }));

      // If linked to requisition, mark completed
      if (matchedChallan.requisitionId) {
        setRequisitions(prev => prev.map(r => r.id === matchedChallan?.requisitionId ? { ...r, status: 'completed' } : r));
      }

      setSmsToast({
        name: receiptData.receivedBy,
        phone: receiptData.grnNo,
        amount: matchedChallan.totalCostValue,
        message: `জিআরএন ${receiptData.grnNo} সফল! পণ্য শাখায় স্টক-ইন হয়েছে।`,
      });
    }
  };

  const handleSaveWarehouse = (wh: Warehouse) => {
    setWarehouses(prev => {
      const exists = prev.some(w => w.id === wh.id);
      if (exists) {
        return prev.map(w => w.id === wh.id ? wh : w);
      }
      return [...prev, wh];
    });
  };

  // Phase 12 AI Demand Forecasting & Auto-PO Handlers
  const handleApproveAutoPo = (approvedPo: SupplierPurchaseOrder) => {
    setPurchaseOrders(prev => [approvedPo, ...prev]);
    setSmsToast({
      name: approvedPo.supplierName,
      phone: approvedPo.supplierPhone || '',
      amount: approvedPo.totalAmount,
      message: `অটো-পিও ${approvedPo.poNumber} অনুমোদিত হয়েছে এবং সরবরাহকারীকে অর্ডার প্রেরণ করা হয়েছে।`,
    });
  };

  const handleUpdateAutoPoStatus = (autoPoId: string, status: AutoPurchaseOrder['status']) => {
    setAutoPurchaseOrders(prev => prev.map(po => po.id === autoPoId ? { ...po, status } : po));
  };

  const handleApplyDeadStockPromo = (productId: string, newSellingPrice: number, discountPct: number) => {
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, sellingPrice: newSellingPrice } : p));
    setDeadStockItems(prev => prev.filter(i => i.productId !== productId));
    setSmsToast({
      name: 'লিকুইডেশন অফার সক্রিয়',
      phone: 'JH IMSE Promo',
      amount: newSellingPrice,
      message: `ডেড-স্টক পণ্যে ${discountPct}% ছাড় প্রমোশন সক্রিয় হয়েছে (নতুন বিক্রয়মূল্য: ৳${newSellingPrice})।`,
    });
  };

  const handleGenerateNewAutoPOs = (newPos: AutoPurchaseOrder[]) => {
    setAutoPurchaseOrders(newPos);
    setSmsToast({
      name: 'AI Auto-PO Engine',
      phone: 'JH IMSE AI',
      amount: newPos.reduce((acc, p) => acc + p.totalAmount, 0),
      message: `মোট ${newPos.length}টি সরবরাহকারীর জন্য স্বয়ংক্রিয় পারচেজ অর্ডার রিক্যালকুলেট সম্পন্ন হয়েছে।`,
    });
  };

  // Phase 13 Global Commerce, Multi-Currency & Payments Handlers
  const handleUpdateExchangeRate = (rateRecord: ExchangeRateRecord) => {
    setExchangeRates(prev => prev.map(r => r.id === rateRecord.id ? rateRecord : r));
    setSmsToast({
      name: rateRecord.fromCurrency,
      phone: 'Forex Central',
      amount: rateRecord.rate,
      message: `মুদ্রা বিনিময় হার হালনাগাদ: ১ ${rateRecord.fromCurrency} = ৳${rateRecord.rate.toFixed(2)} BDT।`,
    });
  };

  const handleToggleGateway = (gatewayId: string, isEnabled: boolean) => {
    setPaymentGateways(prev => prev.map(g => g.id === gatewayId ? { ...g, isEnabled } : g));
  };

  const handleUpdateGatewayMode = (gatewayId: string, mode: 'sandbox' | 'production') => {
    setPaymentGateways(prev => prev.map(g => g.id === gatewayId ? { ...g, mode } : g));
  };

  const handleAddCrossBorderTransaction = (trx: CrossBorderTransaction) => {
    setCrossBorderTransactions(prev => [trx, ...prev]);
    setSmsToast({
      name: trx.customerName,
      phone: trx.transactionNo,
      amount: trx.netAmountBDT,
      message: `আন্তর্জাতিক পেমেন্ট সফল: ${trx.currency} ${trx.foreignAmount} (৳${trx.netAmountBDT.toLocaleString()} BDT)।`,
    });
  };

  const handleSaveTaxSlab = (slab: CrossBorderTaxSlab) => {
    setTaxSlabs(prev => {
      const exists = prev.some(s => s.id === slab.id);
      if (exists) {
        return prev.map(s => s.id === slab.id ? slab : s);
      }
      return [...prev, slab];
    });
  };

  // Phase 17: Product Hierarchy, Brands, SubCategories, UOM & Opening Stocks Handlers
  const handleSaveBrand = (brand: Brand) => {
    setBrands(prev => {
      const idx = prev.findIndex(b => b.id === brand.id);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = brand;
        return updated;
      }
      return [brand, ...prev];
    });
  };

  const handleDeleteBrand = (brandId: string) => {
    setBrands(prev => prev.filter(b => b.id !== brandId));
  };

  const handleSaveSubCategory = (subCat: SubCategory) => {
    setSubCategories(prev => {
      const idx = prev.findIndex(s => s.id === subCat.id);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = subCat;
        return updated;
      }
      return [subCat, ...prev];
    });
  };

  const handleDeleteSubCategory = (subCatId: string) => {
    setSubCategories(prev => prev.filter(s => s.id !== subCatId));
  };

  const handleSaveUnit = (unit: UnitOfMeasure) => {
    setUnits(prev => {
      const idx = prev.findIndex(u => u.id === unit.id);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = unit;
        return updated;
      }
      return [unit, ...prev];
    });
  };

  const handleDeleteUnit = (unitId: string) => {
    setUnits(prev => prev.filter(u => u.id !== unitId));
  };

  const handleSaveOpeningStock = (entry: OpeningStockEntry) => {
    setOpeningStocks(prev => [entry, ...prev]);
    // Inject directly into product inventory
    setProducts(prev => prev.map(p => {
      if (p.id === entry.productId) {
        return {
          ...p,
          stock: p.stock + entry.quantity,
          costPrice: entry.unitCost > 0 ? entry.unitCost : p.costPrice,
          batchNumber: entry.batchNumber || p.batchNumber,
          expiryDate: entry.expiryDate || p.expiryDate,
        };
      }
      return p;
    }));
  };

  const handleBulkUpdateProducts = (updates: { id: string; costPrice?: number; sellingPrice?: number; stock?: number }[]) => {
    setProducts(prev => prev.map(p => {
      const match = updates.find(u => u.id === p.id);
      if (match) {
        return {
          ...p,
          costPrice: match.costPrice !== undefined ? match.costPrice : p.costPrice,
          sellingPrice: match.sellingPrice !== undefined ? match.sellingPrice : p.sellingPrice,
          stock: match.stock !== undefined ? match.stock : p.stock,
        };
      }
      return p;
    }));
  };

  // Phase 21: Fixed Assets, Depreciation & Maintenance Handlers
  const handleSaveFixedAsset = (newAsset: FixedAsset) => {
    setFixedAssets(prev => [newAsset, ...prev]);
  };

  const handleUpdateFixedAsset = (updatedAsset: FixedAsset) => {
    setFixedAssets(prev => prev.map(a => a.id === updatedAsset.id ? updatedAsset : a));
  };

  const handleSaveAssetMaintenance = (record: AssetMaintenanceRecord) => {
    setAssetMaintenanceLogs(prev => [record, ...prev]);
  };

  // Phase 22: Projects, Tasks Kanban, Contracts & Appointment Bookings Handlers
  const handleSaveProject = (newProj: Project) => {
    setProjects(prev => [newProj, ...prev]);
    setSmsToast({
      name: newProj.clientName,
      phone: newProj.projectCode,
      amount: newProj.billingAmount,
      message: `নতুন প্রজেক্ট "${newProj.title}" তৈরি হয়েছে (বাজেট ৳${newProj.budgetAmount.toLocaleString()})।`,
    });
  };

  const handleUpdateProject = (updated: Project) => {
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const handleDeleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  const handleSaveProjectTask = (newTask: ProjectTask) => {
    setProjectTasks(prev => [newTask, ...prev]);
  };

  const handleUpdateProjectTask = (updated: ProjectTask) => {
    setProjectTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
  };

  const handleDeleteProjectTask = (id: string) => {
    setProjectTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleSaveCommercialContract = (newContract: CommercialContract) => {
    setCommercialContracts(prev => [newContract, ...prev]);
    setSmsToast({
      name: newContract.partyName,
      phone: newContract.contractNumber,
      amount: newContract.contractValue,
      message: `বাণিজ্যিক চুক্তিপত্র #${newContract.contractNumber} সংরক্ষিত হয়েছে।`,
    });
  };

  const handleUpdateCommercialContract = (updated: CommercialContract) => {
    setCommercialContracts(prev => prev.map(c => c.id === updated.id ? updated : c));
  };

  const handleDeleteCommercialContract = (id: string) => {
    setCommercialContracts(prev => prev.filter(c => c.id !== id));
  };

  const handleSaveAppointmentBooking = (newBooking: AppointmentBooking) => {
    setAppointmentBookings(prev => [newBooking, ...prev]);
    setSmsToast({
      name: newBooking.customerName,
      phone: newBooking.customerPhone,
      amount: newBooking.fee,
      message: `অ্যাপয়েন্টমেন্ট বুকিং নিশ্চিত: ${newBooking.bookingDate} [${newBooking.timeSlot}]`,
    });
  };

  const handleUpdateAppointmentBookingStatus = (id: string, status: AppointmentBooking['status']) => {
    setAppointmentBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  };

  const handleDeleteAppointmentBooking = (id: string) => {
    setAppointmentBookings(prev => prev.filter(b => b.id !== id));
  };

  const handleSendBookingReminder = (booking: AppointmentBooking) => {
    setAppointmentBookings(prev => prev.map(b => b.id === booking.id ? { ...b, smsReminderSent: true } : b));
    setSmsToast({
      name: booking.customerName,
      phone: booking.customerPhone,
      amount: booking.fee,
      message: `রিমাইন্ডার পাঠানো হয়েছে: অ্যাপয়েন্টমেন্ট তারিখ ${booking.bookingDate}, সময় ${booking.timeSlot}। JH IMSE`,
    });
  };

  // Phase 23: People Management, Client Self-Service Portal & Invited Customers Handlers
  const handleSaveInviteCode = (newCode: B2BInviteCode) => {
    setInviteCodes(prev => {
      const exists = prev.some(c => c.id === newCode.id);
      if (exists) return prev.map(c => c.id === newCode.id ? newCode : c);
      return [newCode, ...prev];
    });
    setSmsToast({
      name: newCode.code,
      phone: 'B2B Portal',
      amount: newCode.defaultCreditLimit,
      message: `বি২বি ইনভাইটেশন কোড "${newCode.code}" (${newCode.discountPct}% ছাড়) সক্রিয় করা হয়েছে।`,
    });
  };

  const handleDeleteInviteCode = (codeId: string) => {
    setInviteCodes(prev => prev.filter(c => c.id !== codeId));
  };

  const handleApproveApplication = (appId: string, assignedCreditLimit: number) => {
    const app = pendingApplications.find(a => a.id === appId);
    if (!app) return;

    // 1. Create a verified Customer with login credentials
    const newCustId = 'cust-' + Date.now();
    const newCustomer: Customer = {
      id: newCustId,
      tenantId: app.tenantId,
      name: app.businessName,
      company: app.businessName,
      phone: app.phone,
      email: app.email,
      address: app.address,
      totalSpent: 0,
      dueAmount: 0,
      creditLimit: assignedCreditLimit,
      customerType: app.customerType,
      loyaltyTier: 'gold',
      loyaltyPoints: 100,
      purchaseCount: 0,
      lastPurchased: new Date().toISOString().slice(0, 10),
      hasLoginAccount: true,
      portalUsername: (app.email ? app.email.split('@')[0] : '') || app.phone.replace(/[^0-9]/g, '').slice(-8),
      portalPassword: 'ClientPass123!',
      portalStatus: 'active',
      tradeLicenseNo: app.tradeLicenseNo,
      companyVatBin: app.binTaxNo,
      inviteCodeUsed: app.inviteCodeUsed,
      notes: `বি২বি আবেদন #${app.applicationNo} অনুমোদিত।`,
    };
    setCustomers(prev => [newCustomer, ...prev]);

    // 2. Mark application approved
    setPendingApplications(prev => prev.map(a => a.id === appId ? {
      ...a,
      status: 'approved',
      reviewedBy: activeTenant.ownerName,
      reviewedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      createdCustomerId: newCustId,
    } : a));

    // 3. Increment times redeemed for invite code if used
    if (app.inviteCodeUsed) {
      setInviteCodes(prev => prev.map(ic => ic.code === app.inviteCodeUsed ? {
        ...ic,
        timesRedeemed: ic.timesRedeemed + 1,
      } : ic));
    }

    setSmsToast({
      name: app.businessName,
      phone: app.phone,
      amount: assignedCreditLimit,
      message: `অভিনন্দন! আপনার বি২বি আবেদন অনুমোদিত হয়েছে। ক্লায়েন্ট পোর্টালে লগইন করুন।`,
    });
  };

  const handleRejectApplication = (appId: string, reason: string) => {
    setPendingApplications(prev => prev.map(a => a.id === appId ? {
      ...a,
      status: 'rejected',
      rejectionReason: reason,
      reviewedBy: activeTenant.ownerName,
      reviewedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    } : a));
  };

  const handleCreateApplication = (appData: Omit<PendingCustomerApplication, 'id' | 'applicationNo' | 'appliedDate' | 'status'>) => {
    const newApp: PendingCustomerApplication = {
      ...appData,
      id: 'app-' + Date.now(),
      applicationNo: 'APP-' + new Date().getFullYear() + '-' + String(pendingApplications.length + 1).padStart(3, '0'),
      appliedDate: new Date().toISOString().slice(0, 16).replace('T', ' '),
      status: 'pending',
    };
    setPendingApplications(prev => [newApp, ...prev]);
    setSmsToast({
      name: newApp.businessName,
      phone: newApp.phone,
      amount: newApp.requestedCreditLimit,
      message: `নতুন বি২বি রেজিস্ট্রেশন আবেদন #${newApp.applicationNo} জমা হয়েছে।`,
    });
  };

  const handleSubmitPortalPaymentClaim = (claimData: Omit<ClientPortalDuePaymentClaim, 'id' | 'submittedAt' | 'status'>) => {
    const newClaim: ClientPortalDuePaymentClaim = {
      ...claimData,
      id: 'claim-' + Date.now(),
      submittedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      status: 'submitted',
    };
    setPortalPaymentClaims(prev => [newClaim, ...prev]);
    setSmsToast({
      name: newClaim.customerName,
      phone: newClaim.customerPhone,
      amount: newClaim.amount,
      message: `গ্রাহক পোর্টাল থেকে ${newClaim.amount} টাকার অনলাইন বকেয়া পরিশোধ দাবি জমা হয়েছে।`,
    });
  };

  const handleVerifyPortalPaymentClaim = (claimId: string, isApproved: boolean) => {
    const claim = portalPaymentClaims.find(c => c.id === claimId);
    if (!claim) return;

    if (isApproved) {
      // 1. Mark claim approved
      setPortalPaymentClaims(prev => prev.map(c => c.id === claimId ? { ...c, status: 'verified_approved' } : c));

      // 2. Adjust customer due and record payment receipt
      const cust = customers.find(c => c.id === claim.customerId);
      if (cust) {
        const receipt: CustomerPaymentReceipt = {
          id: 'rec-' + Date.now(),
          receiptNumber: 'REC-' + new Date().getFullYear() + '-' + Date.now().toString().slice(-4),
          tenantId: claim.tenantId,
          customerId: cust.id,
          customerName: cust.name,
          customerPhone: cust.phone,
          amount: claim.amount,
          discount: 0,
          paymentMethod: claim.paymentMethod === 'rocket' ? 'bkash' : (claim.paymentMethod as any),
          transactionId: claim.transactionId,
          previousDue: cust.dueAmount,
          remainingDue: Math.max(0, cust.dueAmount - claim.amount),
          date: new Date().toISOString().slice(0, 16).replace('T', ' '),
          collectedBy: 'Client Portal Auto-Reconcile',
          note: `অনলাইন পোর্টাল যাচাইকৃত পরিশোধ (TxID: ${claim.transactionId})`,
        };
        handleReceivePayment(receipt);
      }
    } else {
      setPortalPaymentClaims(prev => prev.map(c => c.id === claimId ? { ...c, status: 'rejected' } : c));
    }
  };

  const handleUpdateCustomerPortalAccess = (customerId: string, portalData: {
    hasLoginAccount: boolean;
    portalUsername?: string;
    portalPassword?: string;
    portalStatus?: 'active' | 'suspended' | 'invited';
  }) => {
    setCustomers(prev => prev.map(c => c.id === customerId ? {
      ...c,
      ...portalData,
    } : c));
    setSmsToast({
      name: 'Client Portal',
      phone: 'Access Updated',
      amount: 0,
      message: `গ্রাহকের অনলাইন সেলফ-সার্ভিস পোর্টাল ক্রেডেনশিয়াল সফলভাবে সংরক্ষিত হয়েছে।`,
    });
  };

  // Phase 24: 3D Dashboard, Cash Register Shift Reports & Analytical Intelligence Handlers
  const handleOpenShift = (shiftData: Omit<CashRegisterShift, 'id' | 'status' | 'totalCashSales' | 'totalDigitalSales' | 'totalReturnsRefunded' | 'totalExpensesPaid' | 'cashAdded' | 'cashRemoved' | 'expectedClosingCash' | 'totalTransactionsCount'>) => {
    const newShift: CashRegisterShift = {
      ...shiftData,
      id: 'shift-' + Date.now(),
      status: 'open',
      totalCashSales: 0,
      totalDigitalSales: 0,
      totalReturnsRefunded: 0,
      totalExpensesPaid: 0,
      cashAdded: 0,
      cashRemoved: 0,
      expectedClosingCash: shiftData.openingCash,
      totalTransactionsCount: 0,
    };
    setCashRegisterShifts(prev => [newShift, ...prev]);
    setSmsToast({
      name: newShift.registerName,
      phone: newShift.cashierName,
      amount: newShift.openingCash,
      message: `নতুন পিওএস শিফট শুরু হয়েছে (ওপেনিং ক্যাশ: ৳${newShift.openingCash})।`,
    });
  };

  const handleCloseShift = (shiftId: string, actualClosingCash: number, notes?: string, denominations?: CashDenominationBreakdown) => {
    setCashRegisterShifts(prev => prev.map(s => {
      if (s.id !== shiftId) return s;
      const diff = actualClosingCash - s.expectedClosingCash;
      return {
        ...s,
        status: 'closed',
        closedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
        actualClosingCash,
        cashDifference: diff,
        notes,
        denominations,
      };
    }));
    setSmsToast({
      name: 'Shift Closed',
      phone: 'Z-Report',
      amount: actualClosingCash,
      message: `ক্যাশ শিফট সমাপ্ত ও Z-রিপোর্ট জেনারেট সম্পন্ন হয়েছে।`,
    });
  };

  const handleAddCashAdjustment = (shiftId: string, type: 'cash_in' | 'cash_out', amount: number, reason: string) => {
    setCashRegisterShifts(prev => prev.map(s => {
      if (s.id !== shiftId) return s;
      const newAdj = {
        id: 'adj-' + Date.now(),
        type,
        amount,
        reason,
        timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
        performedBy: activeTenant.ownerName,
      };
      const newCashAdded = type === 'cash_in' ? s.cashAdded + amount : s.cashAdded;
      const newCashRemoved = type === 'cash_out' ? s.cashRemoved + amount : s.cashRemoved;
      const newExpected = s.openingCash + s.totalCashSales + newCashAdded - s.totalReturnsRefunded - s.totalExpensesPaid - newCashRemoved;
      return {
        ...s,
        cashAdded: newCashAdded,
        cashRemoved: newCashRemoved,
        expectedClosingCash: newExpected,
        adjustments: [...(s.adjustments || []), newAdj],
      };
    }));
    setSmsToast({
      name: type === 'cash_in' ? 'ক্যাশ ইন' : 'সেফে জমা (Drop)',
      phone: activeTenant.ownerName,
      amount,
      message: `ক্যাশ ড্রয়ারে ৳${amount} ${type === 'cash_in' ? 'যোগ' : 'কর্তন'} করা হয়েছে।`,
    });
  };

  const handleResolveErrorLog = (logId: string, resolutionNotes: string) => {
    setSystemErrorLogs(prev => prev.map(err => {
      if (err.id !== logId) return err;
      return {
        ...err,
        resolved: true,
        resolvedBy: activeTenant.ownerName,
        resolvedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
        resolutionNotes,
      };
    }));
    setSmsToast({
      name: 'System Audit',
      phone: 'Resolved',
      amount: 0,
      message: `সিস্টেম ত্রুটি সফলভাবে সমাধান হিসেবে মার্ক করা হয়েছে।`,
    });
  };

  // Phase 25: QuickBooks, WooCommerce, Webhooks, Sessions & Cloud Backup Handlers
  const currentQboConfig = quickBooksConfigs[activeTenantId] || {
    tenantId: activeTenantId,
    isConnected: false,
    environment: 'production',
    realmId: '',
    clientId: '',
    clientSecret: '',
    redirectUri: 'https://jh-imse.shop/api/auth/quickbooks/callback',
    authScope: 'com.intuit.quickbooks.accounting',
    syncStatus: 'idle',
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
  };

  const currentWooConfig = wooCommerceConfigs[activeTenantId] || {
    tenantId: activeTenantId,
    isConnected: true,
    storeUrl: 'https://' + activeTenant.slug + '.shop',
    consumerKey: 'ck_sample_key_' + activeTenant.slug,
    consumerSecret: 'cs_sample_secret_' + activeTenant.slug,
    apiVersion: 'wc/v3',
    syncDirection: 'two_way',
    autoSyncOnSale: true,
    syncCategories: true,
    defaultTaxClass: 'standard',
    webhookSecret: 'whsec_imse_' + activeTenant.slug,
    webhookListenerUrl: 'https://jh-imse.shop/api/webhooks/woocommerce/' + activeTenantId,
    orderStatusMapping: { processing: 'confirmed', completed: 'delivered', onHold: 'pending', cancelled: 'cancelled' },
    totalSyncedProducts: activeTenant.usage?.currentProducts || 1420,
    totalPendingOrders: 2,
    syncStatus: 'idle',
    logs: [],
  };

  const handleUpdateQuickBooksConfig = (config: QuickBooksConfig) => {
    setQuickBooksConfigs(prev => ({ ...prev, [config.tenantId]: config }));
  };

  const handleUpdateWooCommerceConfig = (config: WooCommerceConfig) => {
    setWooCommerceConfigs(prev => ({ ...prev, [config.tenantId]: config }));
  };

  const handleSaveWebhook = (webhook: OutboundWebhook) => {
    setOutboundWebhooks(prev => {
      const exists = prev.some(w => w.id === webhook.id);
      if (exists) {
        return prev.map(w => w.id === webhook.id ? webhook : w);
      }
      return [webhook, ...prev];
    });
  };

  const handleDeleteWebhook = (webhookId: string) => {
    setOutboundWebhooks(prev => prev.filter(w => w.id !== webhookId));
  };

  const handleAddWebhookDeliveryLog = (log: WebhookDeliveryLog) => {
    setWebhookLogs(prev => [log, ...prev]);
    setOutboundWebhooks(prev => prev.map(w => {
      if (w.id === log.webhookId) {
        return {
          ...w,
          lastTriggeredAt: log.attemptedAt,
          successCount: log.status === 'delivered' ? w.successCount + 1 : w.successCount,
          failureCount: log.status === 'failed' ? w.failureCount + 1 : w.failureCount,
        };
      }
      return w;
    }));
  };

  const handleRevokeSession = (sessionId: string) => {
    setActiveSessions(prev => prev.filter(s => s.id !== sessionId));
  };

  const handleTerminateAllOtherSessions = (currentUserId: string) => {
    setActiveSessions(prev => prev.filter(s => s.isCurrentSession));
  };

  const handleCreateBackup = (type: 'manual' | 'automated', format: 'sql' | 'json', notes?: string) => {
    const newBackup: DatabaseBackupArchive = {
      id: 'bak-' + Date.now(),
      tenantId: activeTenantId,
      fileName: `jhimse_${activeTenant.slug}_${format}_snapshot_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.${format === 'sql' ? 'sql.gz' : 'json'}`,
      fileSizeBytes: Math.floor(Math.random() * 2000000 + 4000000),
      fileSizeFormatted: (Math.random() * 2 + 4.5).toFixed(1) + ' MB',
      backupType: type,
      format,
      checksum: 'sha256-' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      status: 'completed',
      createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
      createdBy: activeTenant.ownerName,
      downloadUrl: '#',
      notes,
    };
    setBackupArchives(prev => [newBackup, ...prev]);
  };

  const handleRestoreBackup = (archiveId: string) => {
    setSmsToast({
      name: 'Cloud Restore',
      phone: activeTenant.name,
      amount: 0,
      message: `ডাটাবেজ স্ন্যাপশট থেকে সফলভাবে পুনরুদ্ধার সম্পন্ন হয়েছে।`,
    });
  };

  const handleDeleteBackup = (archiveId: string) => {
    setBackupArchives(prev => prev.filter(b => b.id !== archiveId));
  };

  const handleUpdateBackupSchedule = (schedule: BackupScheduleConfig) => {
    setBackupSchedule(schedule);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-purple-100 selection:text-purple-900">
      {/* Impersonation Banner if logged in via Super Admin */}
      {isImpersonating && currentView !== 'super_admin' && (
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white px-6 py-2.5 text-xs font-bold flex flex-wrap items-center justify-between shadow-md border-b border-purple-500/30 gap-2">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              ⚡ সুপার এডমিন ইম্পারসোনেশন ভিউ: আপনি বর্তমানে <strong className="text-amber-300">&quot;{activeTenant.name}&quot;</strong> ({activeTenant.slug}) স্টোরে প্রবেশ করেছেন।
            </span>
          </div>
          <button
            onClick={() => {
              setIsImpersonating(false);
              setCurrentView('super_admin');
            }}
            className="px-3 py-1 bg-white hover:bg-purple-50 text-purple-950 rounded-xl text-xs font-black transition shadow-xs flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> সুপার এডমিন কমান্ড সেন্টারে ফিরুন
          </button>
        </div>
      )}

      {/* Render Current View */}
      {currentView === 'landing' && (
        <LandingPage
          tenants={tenants}
          onOpenStoreDashboard={(id) => {
            setActiveTenantId(id);
            setCurrentView('tenant_dashboard');
          }}
          onOpenSuperAdmin={() => setCurrentView('super_admin')}
          onCreateTenant={handleCreateTenant}
          onOpenFreeTrialModal={() => setIsFreeTrialModalOpen(true)}
          onOpenAuthModal={() => {
            setAuthPortalTarget('standard');
            setIsAuthModalOpen(true);
          }}
          onOpenSubscriptionModal={(plan) => {
            if (plan) setSelectedUpgradePlan(plan);
            setIsSubscriptionModalOpen(true);
          }}
        />
      )}

      {currentView === 'super_admin' && (
        <SuperAdmin
          tenants={tenants}
          onUpdateTenant={handleUpdateTenant}
          onImpersonateTenant={(id) => {
            setIsImpersonating(true);
            setActiveTenantId(id);
            setCurrentView('tenant_dashboard');
          }}
          onOpenStorePOS={(id) => {
            setActiveTenantId(id);
            setCurrentView('pos');
          }}
          onOpenStorefrontView={(id) => {
            setActiveTenantId(id);
            setCurrentView('storefront');
          }}
          onBackToLanding={() => setCurrentView('landing')}
          systemBroadcast={systemBroadcast}
          onSetSystemBroadcast={setSystemBroadcast}
          onCreateTenant={handleCreateTenant}
          subscriptionRequests={subscriptionRequests}
          onApproveSubscriptionRequest={handleApproveSubscriptionRequest}
          onRejectSubscriptionRequest={handleRejectSubscriptionRequest}
          adminPaymentAccounts={adminPaymentAccounts}
          onUpdateAdminPaymentAccounts={handleUpdateAdminPaymentAccounts}
          globalSettings={platformSettings}
          onUpdateGlobalSettings={setPlatformSettings}
          onlineOrders={onlineOrders}
          products={products}
          sales={sales}
          customers={customers}
          onResetDemoData={() => {
            setTenants(INITIAL_TENANTS);
            setProducts(INITIAL_PRODUCTS);
            setSales(INITIAL_SALES);
            setCustomers(INITIAL_CUSTOMERS);
            setOnlineOrders(INITIAL_ONLINE_ORDERS);
            setPlatformSettings(INITIAL_GLOBAL_PLATFORM_SETTINGS);
            alert('সিস্টেম ডেমো ডেটা সফলভাবে রিসেট করা হয়েছে!');
          }}
          isCleanProduction={isCleanSlate}
          onToggleCleanProduction={handleToggleCleanProduction}
          onOpenInstaller={() => setIsInstallerOpen(true)}
        />
      )}

      {currentView === 'tenant_dashboard' && (
        <TenantDashboard
          tenant={activeTenant}
          tenants={tenants}
          onSelectTenant={(id) => setActiveTenantId(id)}
          products={products}
          sales={sales}
          customers={customers}
          employees={employees}
          onlineOrders={onlineOrders}
          warehouses={warehouses}
          activeWarehouseId={activeWarehouseId}
          onSelectWarehouse={setActiveWarehouseId}
          onOpenPOS={() => setCurrentView('pos')}
          onOpenStorefront={() => setCurrentView('storefront')}
          onOpenCalculator={() => setIsCalculatorOpen(true)}
          onOpenSuperAdmin={() => {
            setIsImpersonating(false);
            setCurrentView('super_admin');
          }}
          isImpersonating={isImpersonating}
          onBackToLanding={() => {
            setIsImpersonating(false);
            setCurrentView('landing');
          }}
          onOpenDataResetManager={() => setIsDataResetModalOpen(true)}
          onAddProduct={handleAddProduct}
          onBulkImportProducts={handleBulkImportProducts}
          onAdjustStock={handleAdjustStock}
          onDeleteProduct={handleDeleteProduct}
          onSmsCustomerDue={handleSmsDue}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          quotations={quotations}
          deliveryChallans={deliveryChallans}
          creditNotes={creditNotes}
          paymentReceipts={paymentReceipts}
          onAddCustomer={handleSaveCustomer}
          onReceivePayment={handleReceivePayment}
          onCreateQuotation={handleCreateQuotation}
          onCreateDeliveryChallan={handleCreateDeliveryChallan}
          onCreateCreditNote={handleCreateCreditNote}
          onConvertToInvoice={handleConvertQuotationToSale}
          onOpenReceipt={(sale) => setActiveReceiptSale(sale)}
          onOpenA4Invoice={(sale) => setActiveA4InvoiceSale(sale)}
          systemBroadcast={systemBroadcast}
          attendanceRecords={attendanceRecords}
          rolePermissions={rolePermissions}
          salarySlips={salarySlips}
          onSaveEmployee={handleSaveEmployee}
          onDeleteEmployee={handleDeleteEmployee}
          onUpdateAttendanceRecord={handleUpdateAttendanceRecord}
          onBulkMarkAttendance={handleBulkMarkAttendance}
          onUpdateRolePermissions={handleUpdateRolePermissions}
          onAddSalarySlip={handleAddSalarySlip}
          onUpdateSlipStatus={handleUpdateSlipStatus}
          expenses={expenses}
          suppliers={suppliers}
          purchaseOrders={purchaseOrders}
          supplierPayments={supplierPayments}
          onAddExpense={handleAddExpense}
          onDeleteExpense={handleDeleteExpense}
          onSaveSupplier={handleSaveSupplier}
          onRecordSupplierPayment={handleRecordSupplierPayment}
          onCreatePurchaseOrder={handleCreatePurchaseOrder}
          onUpdateOrderCourier={handleUpdateOrderCourier}
          onUpdateStoreSettings={handleUpdateStoreSettings}
          requisitions={requisitions}
          transfers={transfers}
          onCreateRequisition={handleCreateRequisition}
          onUpdateRequisitionStatus={handleUpdateRequisitionStatus}
          onDispatchTransfer={handleDispatchTransfer}
          onReceiveTransfer={handleReceiveTransfer}
          onSaveWarehouse={handleSaveWarehouse}
          autoPurchaseOrders={autoPurchaseOrders}
          seasonalTrends={seasonalTrends}
          deadStockItems={deadStockItems}
          onApproveAndCreatePO={handleApproveAutoPo}
          onUpdateAutoPoStatus={handleUpdateAutoPoStatus}
          onApplyDeadStockPromo={handleApplyDeadStockPromo}
          onGenerateNewAutoPOs={handleGenerateNewAutoPOs}
          exchangeRates={exchangeRates}
          paymentGateways={paymentGateways}
          taxSlabs={taxSlabs}
          crossBorderTransactions={crossBorderTransactions}
          onUpdateExchangeRate={handleUpdateExchangeRate}
          onToggleGateway={handleToggleGateway}
          onUpdateGatewayMode={handleUpdateGatewayMode}
          onAddCrossBorderTransaction={handleAddCrossBorderTransaction}
          onSaveTaxSlab={handleSaveTaxSlab}
          whatsAppConfigs={whatsAppConfigs}
          whatsAppLogs={whatsAppLogs}
          loyaltyTransactions={loyaltyTransactions}
          onUpdateWhatsAppConfig={handleUpdateWhatsAppConfig}
          onAddWhatsAppLog={handleAddWhatsAppLog}
          onAddLoyaltyTransaction={handleAddLoyaltyTransaction}
          onUpdateCustomerPoints={handleUpdateCustomerPoints}
          brands={brands}
          subCategories={subCategories}
          units={units}
          openingStocks={openingStocks}
          categories={categories}
          onSaveBrand={handleSaveBrand}
          onDeleteBrand={handleDeleteBrand}
          onSaveSubCategory={handleSaveSubCategory}
          onDeleteSubCategory={handleDeleteSubCategory}
          onSaveUnit={handleSaveUnit}
          onDeleteUnit={handleDeleteUnit}
          onSaveOpeningStock={handleSaveOpeningStock}
          onBulkUpdateProducts={handleBulkUpdateProducts}
          purchaseReturns={purchaseReturns}
          damageLogs={damageLogs}
          stockCountAudits={stockCountAudits}
          onSavePurchaseReturn={handleSavePurchaseReturn}
          onSaveDamageLog={handleSaveDamageLog}
          onCreateStockCountAudit={handleCreateStockCountAudit}
          onUpdateStockCountAudit={handleUpdateStockCountAudit}
          onReconcileStockCountAudit={handleReconcileStockCountAudit}
          salesAgents={salesAgents}
          commissionPrograms={commissionPrograms}
          commissionRules={commissionRules}
          commissionReceipts={commissionReceipts}
          onSaveAgent={handleSaveAgent}
          onDeleteAgent={handleDeleteAgent}
          onSaveCommissionProgram={handleSaveCommissionProgram}
          onDeleteCommissionProgram={handleDeleteCommissionProgram}
          onSaveCommissionRule={handleSaveCommissionRule}
          onDeleteCommissionRule={handleDeleteCommissionRule}
          onSaveCommissionReceipt={handleSaveCommissionReceipt}
          serviceTickets={serviceTickets}
          inspectionChecklists={inspectionChecklists}
          maintenanceContracts={maintenanceContracts}
          warrantyRecords={warrantyRecords}
          warrantyClaims={warrantyClaims}
          onSaveServiceTicket={handleSaveServiceTicket}
          onUpdateServiceTicket={handleUpdateServiceTicket}
          onAddSparePartToJob={handleAddSparePartToJob}
          onSaveChecklist={handleSaveChecklist}
          onSaveAMCContract={handleSaveAMCContract}
          onRecordAMCVisit={handleRecordAMCVisit}
          onSaveWarrantyClaim={handleSaveWarrantyClaim}
          onUpdateWarrantyClaimStatus={handleUpdateWarrantyClaimStatus}
          fixedAssets={fixedAssets}
          assetMaintenanceLogs={assetMaintenanceLogs}
          onSaveFixedAsset={handleSaveFixedAsset}
          onUpdateFixedAsset={handleUpdateFixedAsset}
          onSaveAssetMaintenance={handleSaveAssetMaintenance}
          projects={projects}
          projectTasks={projectTasks}
          commercialContracts={commercialContracts}
          appointmentBookings={appointmentBookings}
          onSaveProject={handleSaveProject}
          onUpdateProject={handleUpdateProject}
          onDeleteProject={handleDeleteProject}
          onSaveProjectTask={handleSaveProjectTask}
          onUpdateProjectTask={handleUpdateProjectTask}
          onDeleteProjectTask={handleDeleteProjectTask}
          onSaveCommercialContract={handleSaveCommercialContract}
          onUpdateCommercialContract={handleUpdateCommercialContract}
          onDeleteCommercialContract={handleDeleteCommercialContract}
          onSaveAppointmentBooking={handleSaveAppointmentBooking}
          onUpdateAppointmentBookingStatus={handleUpdateAppointmentBookingStatus}
          onDeleteAppointmentBooking={handleDeleteAppointmentBooking}
          onSendBookingReminder={handleSendBookingReminder}
          onCompleteSale={handleCompleteSale}
          inviteCodes={inviteCodes}
          pendingApplications={pendingApplications}
          portalPaymentClaims={portalPaymentClaims}
          onSaveInviteCode={handleSaveInviteCode}
          onDeleteInviteCode={handleDeleteInviteCode}
          onApproveApplication={handleApproveApplication}
          onRejectApplication={handleRejectApplication}
          onCreateApplication={handleCreateApplication}
          onSubmitPortalPaymentClaim={handleSubmitPortalPaymentClaim}
          onVerifyPortalPaymentClaim={handleVerifyPortalPaymentClaim}
          onUpdateCustomerPortalAccess={handleUpdateCustomerPortalAccess}
          cashRegisterShifts={cashRegisterShifts}
          loginActivityLogs={loginActivityLogs}
          onOpenShift={handleOpenShift}
          onCloseShift={handleCloseShift}
          onAddCashAdjustment={handleAddCashAdjustment}
          onResolveErrorLog={handleResolveErrorLog}
          quickBooksConfig={currentQboConfig}
          onUpdateQuickBooksConfig={handleUpdateQuickBooksConfig}
          wooCommerceConfig={currentWooConfig}
          onUpdateWooCommerceConfig={handleUpdateWooCommerceConfig}
          outboundWebhooks={outboundWebhooks}
          onSaveWebhook={handleSaveWebhook}
          onDeleteWebhook={handleDeleteWebhook}
          webhookDeliveryLogs={webhookLogs}
          onAddWebhookDeliveryLog={handleAddWebhookDeliveryLog}
          activeSessions={activeSessions}
          onRevokeSession={handleRevokeSession}
          onTerminateAllOtherSessions={handleTerminateAllOtherSessions}
          systemHealth={systemHealth}
          backupArchives={backupArchives}
          onCreateBackup={handleCreateBackup}
          onRestoreBackup={handleRestoreBackup}
          onDeleteBackup={handleDeleteBackup}
          backupSchedule={backupSchedule}
          onUpdateBackupSchedule={handleUpdateBackupSchedule}
        />

      )}

      {currentView === 'pos' && (
        <POSScreen
          tenant={activeTenant}
          products={products.filter(p => !p.tenantId || p.tenantId === activeTenant.id)}
          customers={customers.filter(c => !c.tenantId || c.tenantId === activeTenant.id)}
          warehouses={warehouses.filter(w => !w.tenantId || w.tenantId === activeTenant.id)}
          activeWarehouseId={activeWarehouseId}
          cashierName={employees.find(e => e.tenantId === activeTenant.id)?.name || activeTenant.ownerName || 'ক্যাশিয়ার'}
          onCompleteSale={handleCompleteSale}
          onBackToDashboard={() => setCurrentView('tenant_dashboard')}
          onOpenReceipt={(sale) => setActiveReceiptSale(sale)}
          onOpenA4Invoice={(sale) => setActiveA4InvoiceSale(sale)}
          globalFleetPosLocked={Boolean(platformSettings.fleetPosLockdown || activeTenant.isPosLocked)}
        />
      )}

      {currentView === 'storefront' && (
        <StorefrontView
          tenant={activeTenant}
          tenants={tenants}
          onSelectTenant={(id) => setActiveTenantId(id)}
          products={products.filter(p => !p.tenantId || p.tenantId === activeTenant.id)}
          onPlaceOnlineOrder={handlePlaceOnlineOrder}
          onBackToDashboard={() => setCurrentView('tenant_dashboard')}
          orders={onlineOrders.filter(o => !o.tenantId || o.tenantId === activeTenant.id)}
          globalSettings={platformSettings}
        />
      )}

      {/* Modals & Tools */}
      <CalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
      />

      {/* Free Trial Registration Modal (Instant Auto-Approval) */}
      <FreeTrialRegisterModal
        isOpen={isFreeTrialModalOpen}
        onClose={() => setIsFreeTrialModalOpen(false)}
        onRegisterSuccess={handleCreateTenant}
      />

      {/* Subscription Upgrade Checkout Modal (Manual MFS & Bank Verification) */}
      <SubscriptionCheckoutModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        tenant={activeTenant}
        selectedPlan={selectedUpgradePlan}
        planPrice={selectedUpgradePlan === 'starter' ? 999 : selectedUpgradePlan === 'professional' ? 1999 : 3999}
        billingCycle="monthly"
        adminPaymentAccounts={adminPaymentAccounts}
        onSubmitPaymentRequest={(req) => {
          handleSubmitSubscriptionRequest({
            ...req,
            tenantId: activeTenant.id,
            tenantName: activeTenant.name,
            ownerName: activeTenant.ownerName,
            ownerPhone: activeTenant.phone,
          });
        }}
      />

      {/* In-House Authentication Modal (Email/Password, Google Authenticator 2FA, OTP, Forgot Password) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        portalTarget={authPortalTarget}
        onClose={() => {
          setIsAuthModalOpen(false);
          if (window.location.hash === '#admin' || window.location.hash === '#super-admin' || window.location.hash === '#superadmin') {
            try {
              history.replaceState(null, '', window.location.pathname + window.location.search);
            } catch {}
          }
        }}
        tenants={tenants}
        onLoginSuccess={(tenantId, role) => {
          setIsAuthModalOpen(false);
          if (window.location.hash === '#admin' || window.location.hash === '#super-admin' || window.location.hash === '#superadmin') {
            try {
              history.replaceState(null, '', window.location.pathname + window.location.search);
            } catch {}
          }
          if (role === 'super_admin') {
            setCurrentUser({
              id: 'master-admin',
              name: 'Super Admin',
              email: 'jhanik1616@gmail.com',
              role: 'super_admin',
            });
            setCurrentView('super_admin');
          } else {
            const loggedTenant = tenants.find(t => t.id === tenantId) || tenants[0];
            setCurrentUser({
              id: loggedTenant?.id || 'tenant-1',
              name: loggedTenant?.ownerName || 'Merchant Owner',
              email: loggedTenant?.email || 'admin@jh-imse.shop',
              role: 'owner',
              shopName: loggedTenant?.name,
              phone: loggedTenant?.phone,
            });
            setActiveTenantId(tenantId);
            setCurrentView('tenant_dashboard');
          }
        }}
        onOpenRegister={() => {
          setIsAuthModalOpen(false);
          setIsFreeTrialModalOpen(true);
        }}
      />

      {/* Thermal POS Slip Modal (80mm) */}
      {activeReceiptSale && (
        <ThermalReceipt
          sale={activeReceiptSale}
          tenant={activeTenant}
          onClose={() => setActiveReceiptSale(null)}
        />
      )}

      {/* Corporate A4 Tax Invoice Modal */}
      <A4InvoiceModal
        isOpen={Boolean(activeA4InvoiceSale)}
        onClose={() => setActiveA4InvoiceSale(null)}
        sale={activeA4InvoiceSale}
        tenant={activeTenant}
      />

      {/* SMS Simulation Toast */}
      {smsToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white rounded-2xl p-4 shadow-2xl border border-purple-500/40 max-w-sm flex items-start gap-3 animate-in slide-in-from-bottom duration-200">
          <div className="w-8 h-8 rounded-xl bg-purple-700 text-white flex items-center justify-center shrink-0 mt-0.5">
            <MessageSquare className="w-4 h-4 text-amber-300" />
          </div>
          <div className="flex-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-purple-300">অটো SMS প্রেরিত হয়েছে!</span>
              <button onClick={() => setSmsToast(null)} className="text-slate-400 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-slate-300 mt-1">
              প্রাপক: <strong>{smsToast.name}</strong> ({smsToast.phone})
            </p>
            <p className="text-[11px] text-slate-300 mt-1 italic bg-slate-800 p-2.5 rounded-lg border border-slate-700 leading-relaxed font-sans">
              &quot;{smsToast.message || `সম্মানিত গ্রাহক, ${activeTenant.name}-এ আপনার বকেয়া ${activeTenant.currency}${smsToast.amount.toFixed(2)} টাকা। দ্রুত পরিশোধের বিনীত অনুরোধ জানাচ্ছি।`}&quot;
            </p>
            <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
              <CheckCircle2 className="w-3 h-3" />
              <span>JH Soft SMS Gateway: Delivered</span>
            </div>
          </div>
        </div>
      )}
      {/* Store Data Manager & Clean Production Reset Modal */}
      <DataResetManagerModal
        isOpen={isDataResetModalOpen}
        onClose={() => setIsDataResetModalOpen(false)}
        tenant={activeTenant}
        stats={getTenantDataStats(
          activeTenantId,
          products,
          sales,
          customers,
          suppliers,
          employees,
          expenses,
          quotations,
          transfers
        )}
        onCleanProductionReset={handleCleanProductionReset}
        onResetSalesOnly={handleResetSalesOnly}
        onLoadStarterTemplate={handleLoadStarterTemplate}
        onLoadDemoData={handleLoadDemoData}
        onExportAllData={handleExportAllData}
        onImportAllData={handleImportAllData}
      />

      {/* Hostinger First-Time Setup & Installation Wizard */}
      <FirstTimeInstallerWizard
        isOpen={isInstallerOpen}
        onClose={() => {
          setIsInstallerOpen(false);
          if (window.location.hash === '#setup' || window.location.hash === '#installer') {
            try {
              history.replaceState(null, '', window.location.pathname + window.location.search);
            } catch {}
          }
        }}
        onCompleteInstallation={handleCompleteInstallation}
      />
    </div>
  );
}
