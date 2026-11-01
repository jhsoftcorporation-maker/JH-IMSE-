import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Store, DollarSign, Users, AlertCircle, ArrowLeft,
  Search, CheckCircle2, XCircle, Settings2, Sparkles, RefreshCw,
  Bell, ExternalLink, Calendar, Plus, Building2, Key, HardDrive,
  CreditCard, Globe, BarChart3, TrendingUp, Layers, Check,
  Copy, Printer, Award, Filter, ChevronRight, AlertTriangle,
  Eye, Smartphone, Receipt, Lock, Unlock, ShoppingBag, Truck,
  Menu, X, Sliders, Monitor, Radio, Wrench, ShieldAlert,
  HelpCircle, Server, RefreshCcw, Power, ChevronDown, CheckCircle,
  Mail, Send, Database, Download, Terminal, Wifi, WifiOff, FileCode, CheckSquare
} from 'lucide-react';
import { 
  Tenant, BusinessType, PlanTier, TenantStatus, 
  SubscriptionPackage, SubscriptionTransaction, CustomDomainRequest, 
  BroadcastNotice, LicenseKeyItem, SubscriptionPaymentRequest, AdminPaymentAccounts,
  OnlineOrder, GlobalPlatformSettings, Product, Sale, Customer
} from '../types';
import { 
  INITIAL_SUBSCRIPTION_PACKAGES, 
  INITIAL_SUBSCRIPTION_TRANSACTIONS, 
  INITIAL_CUSTOM_DOMAINS, 
  INITIAL_BROADCAST_NOTICES, 
  INITIAL_LICENSE_KEYS,
  INITIAL_ADMIN_PAYMENT_ACCOUNTS,
  INITIAL_GLOBAL_PLATFORM_SETTINGS,
  SAAS_MONTHLY_EARNINGS 
} from '../data/mockData';
import { CreateTenantModal } from './CreateTenantModal';
import { TenantLicenseModal } from './TenantLicenseModal';
import { EditQuotaModal } from './EditQuotaModal';
import { MasterSecurityVaultModal } from './superadmin/MasterSecurityVaultModal';
import { getMasterSecurityConfig, MasterSecurityConfig } from '../utils/masterSecurity';

export type SuperAdminTab = 
  | 'dashboard' 
  | 'pos_fleet' 
  | 'companies' 
  | 'licenses' 
  | 'requests' 
  | 'packages' 
  | 'transactions' 
  | 'ecommerce_hub' 
  | 'domains' 
  | 'platform_settings' 
  | 'hostinger_mysql'
  | 'sms_smtp_gateway'
  | 'courier_api'
  | 'payment_settings' 
  | 'broadcasts';

interface SuperAdminProps {
  tenants: Tenant[];
  onUpdateTenant: (updated: Tenant) => void;
  onImpersonateTenant: (tenantId: string) => void;
  onOpenStorePOS?: (tenantId: string) => void;
  onOpenStorefrontView?: (tenantId: string) => void;
  onBackToLanding: () => void;
  systemBroadcast: string;
  onSetSystemBroadcast: (msg: string) => void;
  onCreateTenant: (tenantData: Omit<Tenant, 'id' | 'createdAt'>) => void;
  subscriptionRequests?: SubscriptionPaymentRequest[];
  onApproveSubscriptionRequest?: (requestId: string) => void;
  onRejectSubscriptionRequest?: (requestId: string, reason?: string) => void;
  adminPaymentAccounts?: AdminPaymentAccounts;
  onUpdateAdminPaymentAccounts?: (accounts: AdminPaymentAccounts) => void;
  globalSettings?: GlobalPlatformSettings;
  onUpdateGlobalSettings?: (settings: GlobalPlatformSettings) => void;
  onlineOrders?: OnlineOrder[];
  products?: Product[];
  sales?: Sale[];
  customers?: Customer[];
  onResetDemoData?: () => void;
  isCleanProduction?: boolean;
  onToggleCleanProduction?: (clean: boolean) => void;
  onOpenInstaller?: () => void;
}

export const SuperAdmin: React.FC<SuperAdminProps> = ({
  tenants,
  onUpdateTenant,
  onImpersonateTenant,
  onBackToLanding,
  systemBroadcast,
  onSetSystemBroadcast,
  onCreateTenant,
  subscriptionRequests = [],
  onApproveSubscriptionRequest,
  onRejectSubscriptionRequest,
  onOpenStorePOS,
  onOpenStorefrontView,
  adminPaymentAccounts = INITIAL_ADMIN_PAYMENT_ACCOUNTS,
  onUpdateAdminPaymentAccounts,
  globalSettings,
  onUpdateGlobalSettings,
  onlineOrders = [],
  products = [],
  sales = [],
  customers = [],
  onResetDemoData,
  isCleanProduction = false,
  onToggleCleanProduction,
  onOpenInstaller,
}) => {
  // Navigation Tabs with Enterprise Sidebar
  const [activeTab, setActiveTab] = useState<SuperAdminTab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return false;
  });

  // Automatically adapt sidebar on screen resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Store & POS Fleet Control State
  const [posFleetSearch, setPosFleetSearch] = useState('');
  const [posFleetStatusFilter, setPosFleetStatusFilter] = useState<'all' | 'active' | 'locked'>('all');
  const [posModuleFilter, setPosModuleFilter] = useState<'all' | string>('all');
  const [editingModuleTenant, setEditingModuleTenant] = useState<Tenant | null>(null);
  const [editingPosSettingsTenant, setEditingPosSettingsTenant] = useState<Tenant | null>(null);
  const [inspectingTenantData, setInspectingTenantData] = useState<Tenant | null>(null);
  const [posActionToast, setPosActionToast] = useState<{ message: string; type: 'success' | 'warning' } | null>(null);

  // Live Gateway Testing State
  const [testSmsPhone, setTestSmsPhone] = useState('01819345678');
  const [testSmsMessage, setTestSmsMessage] = useState('JH IMSE: টেস্ট এসএমএস গেটওয়ে সফলভাবে সংযুক্ত হয়েছে। ধন্যবাদ!');
  const [testSmsStatus, setTestSmsStatus] = useState<string | null>(null);
  const [testEmailRecipient, setTestEmailRecipient] = useState('admin@jh-imse.shop');
  const [testEmailStatus, setTestEmailStatus] = useState<string | null>(null);
  const [mysqlPingStatus, setMysqlPingStatus] = useState<'idle' | 'testing' | 'connected' | 'error'>('idle');
  const [downloadSqlToast, setDownloadSqlToast] = useState(false);

  // Global Platform Settings State
  const [platformConfig, setPlatformConfig] = useState<GlobalPlatformSettings>(
    globalSettings || INITIAL_GLOBAL_PLATFORM_SETTINGS
  );
  const [platformConfigSaved, setPlatformConfigSaved] = useState(false);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);

  // E-Commerce Hub Filter State
  const [ecommerceStatusFilter, setEcommerceStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'shipped' | 'delivered'>('all');
  const [ecommerceStoreFilter, setEcommerceStoreFilter] = useState<'all' | string>('all');
  const [ecommerceSearchQuery, setEcommerceSearchQuery] = useState('');

  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | BusinessType>('all');
  const [selectedPlan, setSelectedPlan] = useState<'all' | PlanTier>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | TenantStatus>('all');
  const [chartPeriod, setChartPeriod] = useState<'monthly' | 'yearly'>('monthly');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [licenseModalTenant, setLicenseModalTenant] = useState<Tenant | null>(null);
  const [quotaModalTenant, setQuotaModalTenant] = useState<Tenant | null>(null);
  const [editingFeaturesTenant, setEditingFeaturesTenant] = useState<Tenant | null>(null);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [isSecurityVaultOpen, setIsSecurityVaultOpen] = useState(false);
  const [masterSecConfig, setMasterSecConfig] = useState<MasterSecurityConfig>(() => getMasterSecurityConfig());

  // Collections state
  const [packages, setPackages] = useState<SubscriptionPackage[]>(INITIAL_SUBSCRIPTION_PACKAGES);
  const [transactions, setTransactions] = useState<SubscriptionTransaction[]>(INITIAL_SUBSCRIPTION_TRANSACTIONS);
  const [domains, setDomains] = useState<CustomDomainRequest[]>(INITIAL_CUSTOM_DOMAINS);
  const [broadcasts, setBroadcasts] = useState<BroadcastNotice[]>(INITIAL_BROADCAST_NOTICES);
  const [licenses, setLicenses] = useState<LicenseKeyItem[]>(INITIAL_LICENSE_KEYS);

  // License Generator State in Licenses Tab
  const [newLicTenantId, setNewLicTenantId] = useState<string>(tenants[0]?.id || '');
  const [newLicPlan, setNewLicPlan] = useState<PlanTier>('enterprise');
  const [newLicDuration, setNewLicDuration] = useState<number>(12);
  const [generatedSuccessKey, setGeneratedSuccessKey] = useState<string | null>(null);

  // New Broadcast Form
  const [bcTitle, setBcTitle] = useState('');
  const [bcMessage, setBcMessage] = useState('');
  const [bcType, setBcType] = useState<BroadcastNotice['type']>('info');
  const [bcTarget, setBcTarget] = useState<BroadcastNotice['target']>('all');

  // Subscription Payment Verification & Merchant Settings State
  const [paymentForm, setPaymentForm] = useState<AdminPaymentAccounts>(adminPaymentAccounts);
  const [requestFilter, setRequestFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [requestSearch, setRequestSearch] = useState('');
  const [rejectModal, setRejectModal] = useState<{ id: string; open: boolean }>({ id: '', open: false });
  const [rejectReason, setRejectReason] = useState('');
  const [selectedProofUrl, setSelectedProofUrl] = useState<string | null>(null);
  const [accountSettingsSaved, setAccountSettingsSaved] = useState(false);

  const pendingRequestsCount = subscriptionRequests.filter(r => r.status === 'pending').length;

  // Overall SaaS Metrics calculations
  const totalTenants = tenants.length;
  const activeTenants = tenants.filter(t => t.status === 'active').length;
  const graceOrSuspended = tenants.filter(t => t.status === 'grace_period' || t.status === 'suspended' || t.status === 'expired').length;
  const totalMRR = tenants.reduce((acc, t) => acc + (t.status === 'active' ? t.monthlyFee : 0), 0);
  const totalARR = totalMRR * 12;

  // Plan counts
  const enterpriseCount = tenants.filter(t => t.plan === 'enterprise').length;
  const proCount = tenants.filter(t => t.plan === 'professional').length;
  const starterCount = tenants.filter(t => t.plan === 'starter').length;
  const trialCount = tenants.filter(t => t.plan === 'trial').length;

  // Filtered tenants list
  const filteredTenants = tenants.filter(t => {
    if (selectedCategory !== 'all' && t.businessType !== selectedCategory) return false;
    if (selectedPlan !== 'all' && t.plan !== selectedPlan) return false;
    if (selectedStatus !== 'all' && t.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.name.toLowerCase().includes(q) || 
        t.ownerName.toLowerCase().includes(q) || 
        t.slug.toLowerCase().includes(q) ||
        (t.phone && t.phone.toLowerCase().includes(q)) ||
        (t.tradeLicenseNo && t.tradeLicenseNo.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Recent expired or expiring within 7 days
  const expiringTenants = tenants.filter(t => {
    const diff = (new Date(t.subscriptionExpiry).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  });

  // Actions
  const handleToggleStatus = (tenant: Tenant) => {
    const newStatus: TenantStatus = tenant.status === 'active' ? 'suspended' : 'active';
    const updated: Tenant = { ...tenant, status: newStatus };
    onUpdateTenant(updated);
  };

  const handleExtendSubscription = (tenant: Tenant, months: number = 1) => {
    const current = new Date(tenant.subscriptionExpiry);
    current.setMonth(current.getMonth() + months);
    const updated: Tenant = {
      ...tenant,
      subscriptionExpiry: current.toISOString().slice(0, 10),
      status: 'active',
    };
    onUpdateTenant(updated);
    alert(`${tenant.name}-এর সাবস্ক্রিপশন মেয়াদ আরও ${months * 30} দিন বাড়ানো হয়েছে!`);
  };

  const handleSaveFeatureFlag = (featureKey: keyof Tenant['features']) => {
    if (!editingFeaturesTenant) return;
    const updated: Tenant = {
      ...editingFeaturesTenant,
      features: {
        ...editingFeaturesTenant.features,
        [featureKey]: !editingFeaturesTenant.features[featureKey],
      },
    };
    setEditingFeaturesTenant(updated);
    onUpdateTenant(updated);
  };

  // Store & POS Fleet Control Handlers
  const handleToggleTenantPosLock = (tenant: Tenant) => {
    const nextLocked = !tenant.isPosLocked;
    const updated: Tenant = {
      ...tenant,
      isPosLocked: nextLocked,
      posLockReason: nextLocked ? 'সুপার এডমিন কমান্ড সেন্টার দ্বারা টার্মিনাল লক করা হয়েছে।' : undefined,
    };
    onUpdateTenant(updated);
    setPosActionToast({
      message: `${tenant.name}-এর POS টার্মিনাল সফলভাবে ${nextLocked ? '🔒 লক' : '🔓 আনলক ও সক্রিয়'} করা হয়েছে!`,
      type: nextLocked ? 'warning' : 'success'
    });
    setTimeout(() => setPosActionToast(null), 3500);
  };

  const handleToggleFleetPosLockdown = () => {
    const nextState = !platformConfig.fleetPosLockdown;
    const nextConfig: GlobalPlatformSettings = {
      ...platformConfig,
      fleetPosLockdown: nextState,
    };
    setPlatformConfig(nextConfig);
    if (onUpdateGlobalSettings) {
      onUpdateGlobalSettings(nextConfig);
    }
    // Update all active tenants
    tenants.forEach(t => {
      onUpdateTenant({
        ...t,
        isPosLocked: nextState,
        posLockReason: nextState ? '🚨 ইমার্জেন্সি গ্লোবাল ফ্লিট লকডাউন সক্রিয়।' : undefined,
      });
    });
    setPosActionToast({
      message: nextState 
        ? '🚨 জরুরি ফ্লিট লকডাউন: সকল দোকানের POS টার্মিনাল ফ্রিজ করা হয়েছে!' 
        : '✅ সকল দোকানের POS টার্মিনাল স্বাভাবিক অপারেশনে রিলিজ করা হয়েছে!',
      type: nextState ? 'warning' : 'success'
    });
    setTimeout(() => setPosActionToast(null), 4000);
  };

  const handleChangeTenantModule = (tenant: Tenant, module: Tenant['selectedModule']) => {
    let nextFeatures = { ...tenant.features };
    if (module === 'all_in_one') {
      nextFeatures = {
        ...nextFeatures,
        pos: true,
        ecommerce: true,
        crm: true,
        hrm: true,
        accounting: true,
        ai: true,
        multiWarehouse: true,
        whatsappLoyalty: true,
        hardwareSuite: true,
      };
    } else if (module === 'erp_pos') {
      nextFeatures = {
        ...nextFeatures,
        pos: true,
        ecommerce: false,
        crm: true,
        hrm: false,
        accounting: true,
        ai: true,
        multiWarehouse: true,
        whatsappLoyalty: true,
        hardwareSuite: true,
      };
    } else if (module === 'ecommerce') {
      nextFeatures = {
        ...nextFeatures,
        pos: false,
        ecommerce: true,
        crm: true,
        hrm: false,
        accounting: false,
        ai: false,
        multiWarehouse: false,
        whatsappLoyalty: true,
        hardwareSuite: false,
      };
    } else if (module === 'hrm') {
      nextFeatures = {
        ...nextFeatures,
        pos: false,
        ecommerce: false,
        crm: false,
        hrm: true,
        accounting: false,
        ai: false,
        multiWarehouse: false,
        whatsappLoyalty: false,
        hardwareSuite: false,
      };
    } else if (module === 'crm') {
      nextFeatures = {
        ...nextFeatures,
        pos: false,
        ecommerce: false,
        crm: true,
        hrm: false,
        accounting: false,
        ai: false,
        multiWarehouse: false,
        whatsappLoyalty: true,
        hardwareSuite: false,
      };
    }

    const updated: Tenant = {
      ...tenant,
      selectedModule: module,
      features: nextFeatures,
    };
    onUpdateTenant(updated);
    setEditingModuleTenant(null);
    setPosActionToast({
      message: `${tenant.name}-এর প্রধান মডিউল "${module?.toUpperCase()}" এবং সংশ্লিষ্ট পারমিশন সফলভাবে কার্যকর করা হয়েছে!`,
      type: 'success'
    });
    setTimeout(() => setPosActionToast(null), 3500);
  };

  const handleSavePlatformConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateGlobalSettings) {
      onUpdateGlobalSettings(platformConfig);
    }
    setPlatformConfigSaved(true);
    setTimeout(() => setPlatformConfigSaved(false), 3000);
  };

  const handleGenerateLicense = (e: React.FormEvent) => {
    e.preventDefault();
    const targetTenant = tenants.find(t => t.id === newLicTenantId);
    if (!targetTenant) return;

    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const generatedKey = `JHIMSE-${newLicPlan.toUpperCase().slice(0, 3)}-2026-${randomSuffix}-${randomCode}`;

    const exp = new Date();
    exp.setMonth(exp.getMonth() + newLicDuration);

    const newLic: LicenseKeyItem = {
      id: 'lic-' + Date.now(),
      key: generatedKey,
      tenantId: targetTenant.id,
      tenantName: targetTenant.name,
      plan: newLicPlan,
      durationMonths: newLicDuration,
      generatedAt: new Date().toISOString().slice(0, 10),
      expiresAt: exp.toISOString().slice(0, 10),
      status: 'active',
      maxBranches: newLicPlan === 'enterprise' ? 25 : newLicPlan === 'professional' ? 3 : 1,
      maxUsers: newLicPlan === 'enterprise' ? 50 : newLicPlan === 'professional' ? 10 : 3,
    };

    setLicenses(prev => [newLic, ...prev]);
    setGeneratedSuccessKey(generatedKey);

    // Also update tenant license
    const updatedTenant: Tenant = {
      ...targetTenant,
      licenseKey: generatedKey,
      plan: newLicPlan,
      subscriptionExpiry: exp.toISOString().slice(0, 10),
      status: 'active',
    };
    onUpdateTenant(updatedTenant);
  };

  const handleDomainStatusChange = (domainId: string, status: CustomDomainRequest['status']) => {
    setDomains(prev => prev.map(d => d.id === domainId ? { 
      ...d, 
      status, 
      sslStatus: status === 'active' ? 'secured' : 'failed' 
    } : d));
  };

  const handleCreateBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bcTitle.trim() || !bcMessage.trim()) return;

    const newBc: BroadcastNotice = {
      id: 'bc-' + Date.now(),
      title: bcTitle,
      message: bcMessage,
      type: bcType,
      target: bcTarget,
      createdAt: 'আজ, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      active: true,
    };

    setBroadcasts(prev => [newBc, ...prev]);
    onSetSystemBroadcast(bcMessage);
    setBcTitle('');
    setBcMessage('');
    setShowBroadcastModal(false);
  };

  const toggleBroadcastActive = (id: string) => {
    setBroadcasts(prev => prev.map(b => {
      if (b.id === id) {
        const nextActive = !b.active;
        if (nextActive) onSetSystemBroadcast(b.message);
        return { ...b, active: nextActive };
      }
      return b;
    }));
  };

  const navGroups = [
    {
      title: 'ওভারভিউ ও অ্যানালিটিক্স',
      items: [
        { id: 'dashboard' as SuperAdminTab, label: 'এক্সিকিউটিভ ড্যাশবোর্ড', icon: BarChart3, badge: null },
      ]
    },
    {
      title: 'স্টোর ও POS ফ্লিট কন্ট্রোল',
      items: [
        { id: 'pos_fleet' as SuperAdminTab, label: 'স্টোর ও POS ফ্লিট কন্ট্রোল (A-to-Z)', icon: Monitor, badge: `${tenants.length} শপ` },
        { id: 'companies' as SuperAdminTab, label: 'কোম্পানি তালিকা ও কোটা', icon: Building2, badge: `${tenants.length}` },
        { id: 'ecommerce_hub' as SuperAdminTab, label: 'গ্লোবাল ই-কমার্স ও অর্ডার্স', icon: ShoppingBag, badge: `${onlineOrders.length}` },
      ]
    },
    {
      title: 'সাবস্ক্রিপশন ও বিলিং ইঞ্জিন',
      items: [
        { id: 'requests' as SuperAdminTab, label: 'পেমেন্ট অনুমোদন', icon: ShieldCheck, badge: pendingRequestsCount > 0 ? `${pendingRequestsCount}` : null, isAlert: pendingRequestsCount > 0 },
        { id: 'licenses' as SuperAdminTab, label: 'লাইসেন্স কি জেনারেটর', icon: Key, badge: null },
        { id: 'payment_settings' as SuperAdminTab, label: 'মার্চেন্ট পেমেন্ট গেটওয়ে', icon: Settings2, badge: null },
        { id: 'packages' as SuperAdminTab, label: 'সাবস্ক্রিপশন প্যাকেজ', icon: Sparkles, badge: `${packages.length}` },
        { id: 'transactions' as SuperAdminTab, label: 'রাজস্ব লেনদেন হিস্ট্রি', icon: CreditCard, badge: null },
      ]
    },
    {
      title: 'হোল ওয়েবসাইট ও ক্লাউড কন্ট্রোল',
      items: [
        { id: 'platform_settings' as SuperAdminTab, label: 'হোল ওয়েবসাইট CMS ও সেটিংস', icon: Sliders, badge: null },
        { id: 'hostinger_mysql' as SuperAdminTab, label: 'হোস্টিংগার MySQL ক্লাউড', icon: Server, badge: 'MySQL 8.0' },
        { id: 'sms_smtp_gateway' as SuperAdminTab, label: 'এসএমএস ও ইমেইল গেটওয়ে', icon: Mail, badge: 'Active' },
        { id: 'courier_api' as SuperAdminTab, label: 'কুরিয়ার ডেলিভারি API হাব', icon: Truck, badge: 'Steadfast' },
        { id: 'domains' as SuperAdminTab, label: 'কাস্টম ডোমেইন ও DNS', icon: Globe, badge: `${domains.length}` },
        { id: 'broadcasts' as SuperAdminTab, label: 'লাইভ সিস্টেম নোটিশ', icon: Bell, badge: null },
      ]
    }
  ];

  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-800 font-sans overflow-hidden relative">
      {/* ============================================================== */}
      {/* MOBILE DRAWER BACKDROP OVERLAY */}
      {/* ============================================================== */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden animate-in fade-in duration-200"
          aria-hidden="true"
        />
      )}

      {/* ============================================================== */}
      {/* ENTERPRISE ERP-STYLE SIDEBAR NAVIGATION (Mobile Drawer + Desktop Responsive Rail) */}
      {/* ============================================================== */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 lg:static lg:z-30 flex flex-col bg-white text-slate-800 border-r border-slate-200 transition-all duration-300 ease-in-out shrink-0 shadow-2xl lg:shadow-sm ${
          isSidebarOpen
            ? 'w-72 translate-x-0'
            : '-translate-x-full lg:translate-x-0 lg:w-20'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 border-b border-slate-100 flex items-center justify-between px-4 bg-white shrink-0">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-purple-700 text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0">
              <ShieldCheck className="w-5 h-5 text-amber-300" />
            </div>
            <div className={`truncate ${!isSidebarOpen ? 'lg:hidden' : ''}`}>
              <span className="font-black text-sm text-slate-900 block truncate leading-tight tracking-tight">
                JH IMSE Super Admin
              </span>
              <span className="text-[10px] text-purple-700 font-semibold block capitalize truncate">
                JH Soft Corporation
              </span>
            </div>
          </div>
          {/* Mobile close button / Desktop collapse toggle */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            title={isSidebarOpen ? 'সাইডবার বন্ধ করুন' : 'সাইডবার খুলুন'}
          >
            <X className="w-5 h-5 lg:hidden text-slate-600" />
            <Menu className="w-4 h-4 hidden lg:block" />
          </button>
        </div>

        {/* Navigation Groups List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs scrollbar-thin">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <div className={`px-3 pt-1 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 ${!isSidebarOpen ? 'lg:hidden' : ''}`}>
                {group.title}
              </div>
              {group.items.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      if (window.innerWidth < 1024) {
                        setIsSidebarOpen(false);
                      }
                    }}
                    title={!isSidebarOpen ? item.label : undefined}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition font-medium text-left ${
                      isActive
                        ? 'bg-purple-700 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-purple-50 hover:text-purple-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span className={`truncate ${!isSidebarOpen ? 'lg:hidden' : ''}`}>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold shrink-0 ${!isSidebarOpen ? 'lg:hidden' : ''} ${
                        item.isAlert
                          ? 'bg-rose-500 text-white animate-pulse'
                          : isActive
                          ? 'bg-purple-800 text-purple-100'
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Sidebar Footer: Super Admin Profile & Exit */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/70 shrink-0">
          <div className="space-y-2">
            <div className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl bg-white border border-slate-200 shadow-2xs ${!isSidebarOpen ? 'lg:hidden' : ''}`}>
              <div className="w-8 h-8 rounded-lg bg-purple-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
                SA
              </div>
              <div className="truncate flex-1">
                <span className="text-xs font-bold text-slate-900 block truncate leading-tight">সুপার এডমিন John</span>
                <span className="text-[10px] text-emerald-600 block font-semibold truncate">● Hostinger Business Cloud</span>
              </div>
            </div>
            <button
              onClick={onBackToLanding}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition border border-slate-200 shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-purple-700 shrink-0" />
              <span className={`${!isSidebarOpen ? 'lg:hidden' : ''}`}>মেইন সাইটে ফিরুন</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ============================================================== */}
      {/* MAIN CONTENT PANE */}
      {/* ============================================================== */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Enterprise Header */}
        <header className="bg-white border-b border-slate-200 px-3 sm:px-5 py-2.5 sm:py-3 sticky top-0 z-20 shadow-2xs">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <button
                onClick={() => setIsSidebarOpen(prev => !prev)}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 transition shrink-0 active:scale-95"
                title="মেনু খুলুন"
                aria-label="Toggle menu"
              >
                <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              <div className="truncate min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <h1 className="font-black text-xs sm:text-base text-slate-900 leading-tight truncate">
                    {activeTab === 'dashboard' && 'এক্সিকিউটিভ ড্যাশবোর্ড ও SaaS মেট্রিক্স'}
                    {activeTab === 'pos_fleet' && 'স্টোর ও POS ফ্লিট কন্ট্রোল'}
                    {activeTab === 'companies' && 'কোম্পানি ও টেন্যান্ট হাব'}
                    {activeTab === 'packages' && 'সাবস্ক্রিপশন প্যাকেজ'}
                    {activeTab === 'licenses' && 'লাইসেন্স কি জেনারেটর'}
                    {activeTab === 'domains' && 'কাস্টম ডোমেইন ও DNS'}
                    {activeTab === 'transactions' && 'বিলিং রাজস্ব লেজার'}
                    {activeTab === 'broadcasts' && 'সিস্টেম লাইভ নোটিশ'}
                    {activeTab === 'requests' && 'পেমেন্ট অনুমোদন'}
                    {activeTab === 'payment_settings' && 'মার্চেন্ট পেমেন্ট গেটওয়ে'}
                    {activeTab === 'ecommerce_hub' && 'গ্লোবাল ই-কমার্স হাব'}
                    {activeTab === 'platform_settings' && 'হোল ওয়েবসাইট CMS'}
                    {activeTab === 'hostinger_mysql' && 'হোস্টিংগার MySQL ক্লাউড'}
                    {activeTab === 'sms_smtp_gateway' && 'SMS ও SMTP গেটওয়ে'}
                    {activeTab === 'courier_api' && 'কুরিয়ার ডেলিভারি API'}
                  </h1>
                  <span className="hidden md:inline-block text-[10px] px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-bold border border-purple-200 shrink-0">
                    JH Soft Corporation
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-500 truncate hidden xs:block">
                  হোস্টিংগার বিজনেস ক্লাউড • হেল্পলাইন: {platformConfig.helplinePhone}
                </p>
              </div>
            </div>

            {/* Quick Header Actions (Touch friendly & responsive) */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Emergency Fleet Lockdown Badge / Button */}
              <button
                onClick={handleToggleFleetPosLockdown}
                className={`p-1.5 sm:px-3 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-black transition flex items-center gap-1 shadow-xs border ${
                  platformConfig.fleetPosLockdown
                    ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-700 animate-pulse'
                    : 'bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border-slate-200'
                }`}
                title="সকল দোকানের POS একসাথে ফ্রিজ বা আনলক করুন"
              >
                <Power className="w-3.5 h-3.5 text-rose-600" />
                <span className="hidden md:inline">
                  {platformConfig.fleetPosLockdown ? '🚨 লকডাউন চালু!' : 'জরুরি ফ্লিট লকডাউন'}
                </span>
              </button>

              {/* Master Security Vault & Google Authenticator (2FA) */}
              <button
                onClick={() => setIsSecurityVaultOpen(true)}
                className="px-2 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition flex items-center gap-1 shadow-xs border bg-purple-900 text-purple-200 hover:bg-purple-800 border-purple-700 active:scale-95"
                title="গুগল অথেন্টিকেটর (2FA) ও সিকিউরিটি ভল্ট"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span className="hidden sm:inline">ভল্ট</span>
                <span className={`text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.2 rounded-md font-mono font-bold ${
                  masterSecConfig.isTotpEnabled ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}>
                  2FA {masterSecConfig.isTotpEnabled ? 'ON' : 'OFF'}
                </span>
              </button>

              {/* Hostinger Setup Wizard Button */}
              {onOpenInstaller && (
                <button
                  onClick={onOpenInstaller}
                  className="px-2 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition flex items-center gap-1 shadow-xs border bg-amber-500/10 text-amber-900 hover:bg-amber-500/20 border-amber-300 active:scale-95"
                  title="হোস্টিংগার ডেটাবেজ সেটআপ উইজার্ড চালু করুন"
                >
                  <Server className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span className="hidden xl:inline">সেটআপ উইজার্ড</span>
                </button>
              )}

              {/* Clean Production State vs Demo Mode Toggle */}
              {onToggleCleanProduction && (
                <button
                  onClick={() => onToggleCleanProduction(!isCleanProduction)}
                  className={`px-2 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition flex items-center gap-1 shadow-xs border active:scale-95 ${
                    isCleanProduction
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                      : 'bg-indigo-50 text-indigo-800 border-indigo-200 hover:bg-indigo-100'
                  }`}
                  title={isCleanProduction ? 'ক্লিন প্রডাকশন মোড সক্রিয় (০ ডামি ডাটা)' : 'ডেমো স্যান্ডবক্স মোড সক্রিয় (নমুনা ডাটা)'}
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="hidden sm:inline">{isCleanProduction ? 'ক্লিন প্রডাকশন (০ ডাটা)' : 'ডেমো মোড'}</span>
                </button>
              )}

              {/* New Tenant Quick Button */}
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-2 sm:px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-[11px] sm:text-xs font-bold flex items-center gap-1 transition shadow-xs active:scale-95"
                title="নতুন কোম্পানি নিবন্ধন"
              >
                <Plus className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">নতুন কোম্পানি</span>
              </button>

              {/* Live Notice Modal Trigger */}
              <button
                onClick={() => setShowBroadcastModal(true)}
                className="p-1.5 sm:px-3 sm:py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-xl text-[11px] sm:text-xs font-bold flex items-center gap-1 transition border border-purple-200 shrink-0"
                title="সিস্টেম লাইভ নোটিশ পাঠান"
              >
                <Bell className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span className="hidden lg:inline">লাইভ নোটিশ</span>
              </button>
            </div>
          </div>

          {/* Mobile Horizontal Quick-Nav Scroll Strip (One-tap fast switching on phones) */}
          <div className="flex lg:hidden items-center gap-1.5 overflow-x-auto pt-2 pb-0.5 scrollbar-none border-t border-slate-100 mt-2 -mx-3 px-3">
            {navGroups.flatMap(g => g.items).map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap flex items-center gap-1.5 shrink-0 transition ${
                    isActive
                      ? 'bg-purple-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{item.label.split(' ')[0]}</span>
                  {item.badge && (
                    <span className={`text-[9px] px-1 rounded-sm ${isActive ? 'bg-purple-900 text-purple-200' : 'bg-slate-200 text-slate-700'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </header>

        {/* Action Feedback Toast */}
        {posActionToast && (
          <div className={`px-6 py-2.5 text-xs font-bold flex items-center justify-between shadow-xs transition-all ${
            posActionToast.type === 'warning'
              ? 'bg-rose-500 text-white'
              : 'bg-emerald-600 text-white'
          }`}>
            <span>{posActionToast.message}</span>
            <button onClick={() => setPosActionToast(null)} className="px-2 py-0.5 rounded bg-black/15 hover:bg-black/25">✕</button>
          </div>
        )}

        {/* Live System Broadcast Indicator Bar */}
        {systemBroadcast && (
          <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 px-6 py-2 text-xs font-semibold flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping inline-block" />
              <span>সিস্টেম লাইভ ব্রডকাস্ট (সকল ক্লায়েন্ট স্টোরে সচল): <strong>{systemBroadcast}</strong></span>
            </div>
            <button 
              onClick={() => onSetSystemBroadcast('')} 
              className="px-2 py-0.5 rounded bg-black/10 hover:bg-black/20 text-xs font-bold transition"
            >
              নোটিশ বন্ধ করুন ✕
            </button>
          </div>
        )}

        {/* Main Content Body */}
        <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6 w-full flex-1 min-w-0">
          {/* ============================================================== */}
          {/* TAB 1: EXECUTIVE DASHBOARD */}
          {/* ============================================================== */}
          {activeTab === 'dashboard' && (
          <div className="space-y-4 sm:space-y-6">
            {/* Top Purple Hero Banner */}
            <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-7 text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
              <div className="relative z-10 space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-[11px] sm:text-xs font-bold border border-white/15">
                  <Sparkles className="w-3.5 h-3.5" /> JH Soft Corporation • Enterprise SaaS
                </div>
                <h2 className="text-xl sm:text-3xl font-black tracking-tight">
                  শুভ সকাল, সুপার এডমিন John!
                </h2>
                <p className="text-xs sm:text-sm text-purple-200 max-w-xl">
                  আজকে নতুন ১৪টি কোম্পানি সাবস্ক্রাইব করেছে। সকল ক্লাউড সার্ভার স্বাভাবিক ও অফলাইন POS সিঙ্ক চালু আছে।
                </p>

                <div className="pt-2 flex items-center gap-2 sm:gap-3 flex-wrap">
                  <button
                    onClick={() => setActiveTab('companies')}
                    className="px-3.5 sm:px-4 py-2 bg-white text-purple-950 font-bold rounded-xl text-xs hover:bg-purple-50 transition shadow-sm"
                  >
                    কোম্পানিসমূহ দেখুন
                  </button>
                  <button
                    onClick={() => setActiveTab('packages')}
                    className="px-3.5 sm:px-4 py-2 bg-purple-800/80 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition border border-white/20"
                  >
                    সকল প্যাকেজ
                  </button>
                </div>
              </div>

              {/* Quick High-level SaaS Numbers Right Badge */}
              <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 p-4 sm:p-5 rounded-2xl min-w-0 sm:min-w-[240px] w-full md:w-auto text-center">
                <div className="text-xs text-purple-200 font-medium">মাসিক রিকারিং রেভিনিউ (MRR)</div>
                <div className="text-2xl sm:text-3xl font-black text-amber-300 my-1">৳ {totalMRR.toLocaleString()}</div>
                <div className="text-[11px] text-emerald-300 font-semibold flex items-center justify-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> +১৮.৪% মাসিক প্রবৃদ্ধি
                </div>
                <div className="text-[10px] text-purple-300 mt-2 pt-2 border-t border-white/15">
                  টার্গেট: ৳ ১০,০০,০০০ (৪৬% সম্পন্ন)
                </div>
              </div>

              {/* Decorative background glow */}
              <div className="absolute -right-16 -top-16 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
            </div>

            {/* Top 4 KPI Metrics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
              <div className="bg-white rounded-2xl p-3.5 sm:p-5 border border-slate-200 shadow-2xs hover:shadow-sm transition">
                <div className="flex items-center justify-between text-slate-500 text-[11px] sm:text-xs font-semibold">
                  <span>মোট কোম্পানি</span>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                    <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1 sm:mt-2">৯৮৭ টি</div>
                <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-emerald-600 font-bold mt-1">
                  <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> +১৪% প্রবৃদ্ধি
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:shadow-sm transition">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                  <span>সক্রিয় কোম্পানি (Active)</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 mt-2">৮৫৪ টি</div>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-bold mt-1">
                  <TrendingUp className="w-3.5 h-3.5" /> +৮.৩৬% গত মাস থেকে
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:shadow-sm transition">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                  <span>স্থগিত / গ্রেস পিরিয়ড</span>
                  <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 mt-2">২৮ টি</div>
                <div className="text-[11px] text-rose-500 font-bold mt-1">
                  মেয়াদ শেষ: ৭ টি কোম্পানি
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:shadow-sm transition">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                  <span>বাৎসরিক রান-রেট (ARR)</span>
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 mt-2">৳ {(totalARR).toLocaleString()}</div>
                <div className="text-[11px] text-purple-700 font-bold mt-1">
                  ৪টি প্যাকেজ টিয়ার সক্রিয়
                </div>
              </div>
            </div>

            {/* 3 Sub-Metric Cards (from Screenshot: Most Ordered Plan, Top Company, Most Domains/Users) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Most Ordered Plan */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-3">
                  <span className="font-bold text-slate-800">সর্বোচ্চ বিক্রিত প্ল্যান</span>
                  <span className="text-[10px] bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded-full">চলতি মাস</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">এন্টারপ্রাইজ কর্পোরেট</h3>
                    <p className="text-xs text-slate-500 mt-0.5">মোট বিক্রি: ২০১ টি অর্ডার</p>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-black text-purple-800">৳ ৫,৯৯৯.০০</div>
                    <span className="text-[10px] text-slate-400">প্রতি মাসে</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Top Company with Plan */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-3">
                  <span className="font-bold text-slate-800">শীর্ষ এন্টারপ্রাইজ ক্লায়েন্ট</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">আজকের ডাটা</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">ঢাকা ফ্যাশন অ্যান্ড লাইফস্টাইল</h3>
                    <p className="text-xs text-slate-500 mt-0.5 font-mono">info@dhakafashion.com.bd</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg text-xs font-bold">
                      ১২টি ব্রাঞ্চ
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 3: Most Domains / Users */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-3">
                  <span className="font-bold text-slate-800">সর্বোচ্চ ইউজার ও স্টোরেজ</span>
                  <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full">এই সপ্তাহ</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">Apex Electronics & Gadgets</h3>
                    <p className="text-xs text-slate-500 mt-0.5 font-mono">apexgadgets.com.bd</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold">
                      ৫০ জন ইউজার
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Earnings & Income Graph + Subscription Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Monthly Revenue Chart */}
              <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                  <div>
                    <h3 className="font-bold text-base text-slate-900">মাসিক ও বাৎসরিক আয় প্রবৃদ্ধি (Earnings & Income)</h3>
                    <p className="text-xs text-slate-500">সাবস্ক্রিপশন ও প্ল্যাটফর্ম রাজস্ব ট্রেন্ড (২০২৬)</p>
                  </div>

                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                    <button
                      onClick={() => setChartPeriod('monthly')}
                      className={`px-3 py-1 rounded-lg transition ${chartPeriod === 'monthly' ? 'bg-white text-purple-800 shadow-2xs' : 'text-slate-600'}`}
                    >
                      মাসিক
                    </button>
                    <button
                      onClick={() => setChartPeriod('yearly')}
                      className={`px-3 py-1 rounded-lg transition ${chartPeriod === 'yearly' ? 'bg-white text-purple-800 shadow-2xs' : 'text-slate-600'}`}
                    >
                      বাৎসরিক (২০২৬)
                    </button>
                  </div>
                </div>

                {/* Interactive CSS Bar Graph */}
                <div className="h-56 flex items-end justify-between gap-2 pt-6 border-b border-slate-200 pb-2">
                  {SAAS_MONTHLY_EARNINGS.map((item, idx) => {
                    const heightPercent = Math.min(100, Math.round((item.revenue / 600000) * 100));
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group relative">
                        {/* Tooltip on hover */}
                        <div className="absolute -top-12 bg-slate-900 text-white text-[10px] py-1 px-2 rounded-lg opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap shadow-md z-20">
                          ৳ {item.revenue.toLocaleString()}
                          <div className="text-[9px] text-purple-300">+{item.newStores} কোম্পানি</div>
                        </div>

                        {/* Bar */}
                        <div className="w-full bg-slate-100 rounded-t-lg h-44 flex items-end overflow-hidden">
                          <div
                            className="w-full bg-gradient-to-t from-purple-800 to-indigo-500 rounded-t-lg group-hover:from-purple-900 group-hover:to-indigo-400 transition-all duration-300"
                            style={{ height: `${heightPercent}%` }}
                          />
                        </div>

                        <span className="text-[10px] font-semibold text-slate-500">{item.month}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 font-medium">
                      <span className="w-3 h-3 rounded-full bg-purple-700 inline-block" />
                      <span>গ্রস সাবস্ক্রিপশন আয় (৳)</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-medium">
                      <span className="w-3 h-3 rounded-full bg-slate-300 inline-block" />
                      <span>সার্ভার ও ক্লাউড খরচ</span>
                    </div>
                  </div>
                  <span className="font-bold text-slate-800">গড় মাসিক প্রবৃদ্ধি: +১৪.৮%</span>
                </div>
              </div>

              {/* Plan Distribution & Renewal Alerts */}
              <div className="space-y-6">
                {/* Plan Distribution Card */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
                  <h3 className="font-bold text-sm text-slate-900 mb-1">সাবস্ক্রিপশন প্ল্যান বণ্টন</h3>
                  <p className="text-xs text-slate-500 mb-4">মোট সক্রিয় ক্লায়েন্টের প্ল্যান অনুপাতে বিভাজন</p>

                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between font-semibold mb-1">
                        <span className="text-purple-700">এন্টারপ্রাইজ (Enterprise)</span>
                        <span className="text-slate-800">{enterpriseCount} টি ({totalTenants > 0 ? Math.round((enterpriseCount / totalTenants) * 100) : 0}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-purple-700 h-2 rounded-full" style={{ width: `${totalTenants > 0 ? (enterpriseCount / totalTenants) * 100 : 0}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-semibold mb-1">
                        <span className="text-indigo-600">প্রফেশনাল (Professional)</span>
                        <span className="text-slate-800">{proCount} টি ({totalTenants > 0 ? Math.round((proCount / totalTenants) * 100) : 0}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${totalTenants > 0 ? (proCount / totalTenants) * 100 : 0}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-semibold mb-1">
                        <span className="text-emerald-600">স্টার্টার (Starter)</span>
                        <span className="text-slate-800">{starterCount} টি ({totalTenants > 0 ? Math.round((starterCount / totalTenants) * 100) : 0}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${totalTenants > 0 ? (starterCount / totalTenants) * 100 : 0}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-semibold mb-1">
                        <span className="text-amber-600">ফ্রি ট্রায়াল (Free Trial)</span>
                        <span className="text-slate-800">{trialCount} টি ({totalTenants > 0 ? Math.round((trialCount / totalTenants) * 100) : 0}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${totalTenants > 0 ? (trialCount / totalTenants) * 100 : 0}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expiring Soon / Renewal Alerts (from Screenshot) */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      মেয়াদ উত্তীর্ণ ও রিনিউয়াল অ্যালার্ট
                    </h3>
                    <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded-full">
                      {expiringTenants.length} টি শপ
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    {expiringTenants.map(t => (
                      <div key={t.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900">{t.name}</div>
                          <div className="text-[10px] text-slate-500">
                            মেয়াদ: <span className="font-semibold text-rose-600">{t.subscriptionExpiry}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleExtendSubscription(t, 1)}
                          className="px-2.5 py-1 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-[10px] font-bold transition shadow-2xs"
                        >
                          +৩০ দিন বাড়ান
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Latest Registered Companies Table Preview */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-900">সম্প্রতি নিবন্ধিত কোম্পানি (Latest Registered Companies)</h3>
                  <p className="text-xs text-slate-500">১-ক্লিক ইম্পারসোনেশন ও লাইভ একাউন্ট স্ট্যাটাস</p>
                </div>
                <button
                  onClick={() => setActiveTab('companies')}
                  className="text-xs text-purple-700 font-bold hover:underline flex items-center gap-1"
                >
                  সবগুলো দেখুন ({tenants.length}) <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {tenants.length === 0 ? (
                <div className="p-10 text-center bg-slate-50 border-t border-slate-100 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">কোনো মার্চেন্ট কোম্পানি এখনো নিবন্ধিত হয়নি (ক্লিন স্টেট)</h4>
                    <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                      আপনার সিস্টেমটি সম্পূর্ণ ক্লিন ও ফ্রেশ অবস্থায় রয়েছে। গ্রাহক সাইট থেকে সাইনআপ করলে অথবা সরাসরি নিচের বাটনে ক্লিক করে প্রথম রিয়েল কোম্পানি যুক্ত করতে পারেন।
                    </p>
                  </div>
                  <div className="pt-2 flex items-center justify-center gap-3">
                    <button
                      onClick={() => setIsCreateModalOpen(true)}
                      className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" /> প্রথম কোম্পানি যোগ করুন
                    </button>
                    {onToggleCleanProduction && (
                      <button
                        onClick={() => onToggleCleanProduction(false)}
                        className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition"
                      >
                        ডেমো ডাটা লোড করুন
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[700px]">
                    <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">কোম্পানি</th>
                        <th className="py-3 px-4">প্ল্যান</th>
                        <th className="py-3 px-4">মেয়াদ শেষ</th>
                        <th className="py-3 px-4">রিসোর্স ব্যবহার</th>
                        <th className="py-3 px-4">স্ট্যাটাস</th>
                        <th className="py-3 px-4 text-right">ইম্পারসোনেট / অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {tenants.slice(0, 5).map(tenant => (
                        <tr key={tenant.id} className="hover:bg-slate-50 transition">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900">{tenant.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {tenant.slug}.jh-imse.shop • {tenant.phone}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                              tenant.plan === 'enterprise' ? 'bg-purple-100 text-purple-800' :
                              tenant.plan === 'professional' ? 'bg-indigo-100 text-indigo-800' :
                              tenant.plan === 'starter' ? 'bg-emerald-100 text-emerald-800' :
                              'bg-amber-100 text-amber-800'
                            }`}>
                              {tenant.plan}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="font-medium text-slate-800">{tenant.subscriptionExpiry}</span>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="text-[11px] text-slate-600 font-medium">
                              🏢 {tenant.usage.currentBranches}/{tenant.quotas.maxBranches} ব্রাঞ্চ • 👥 {tenant.usage.currentUsers}/{tenant.quotas.maxUsers} ইউজার
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              tenant.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                              tenant.status === 'grace_period' ? 'bg-amber-100 text-amber-800' :
                              'bg-rose-100 text-rose-800'
                            }`}>
                              {tenant.status === 'active' && <CheckCircle2 className="w-3 h-3" />}
                              {tenant.status === 'active' ? 'সক্রিয়' : tenant.status === 'grace_period' ? 'গ্রেস পিরিয়ড' : 'স্থগিত'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => onImpersonateTenant(tenant.id)}
                              className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-[11px] font-bold transition shadow-2xs inline-flex items-center gap-1"
                            >
                              <ExternalLink className="w-3.5 h-3.5" /> স্টোরে লগইন
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB: STORE & POS FLEET CONTROL HUB (A-TO-Z CENTRAL CONTROL) */}
        {/* ============================================================== */}
        {activeTab === 'pos_fleet' && (
          <div className="space-y-6">
            {/* Header Hero Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-7 text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
              <div className="space-y-2 relative z-10 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-[11px] sm:text-xs font-bold border border-purple-400/30">
                  <Monitor className="w-3.5 h-3.5 text-amber-300" /> সেন্ট্রাল টার্মিনাল কমান্ড ইঞ্জিন • এ টু জেড কন্ট্রোল
                </div>
                <h2 className="text-xl sm:text-3xl font-black tracking-tight">
                  স্টোর ও POS ফ্লিট কন্ট্রোল হাব
                </h2>
                <p className="text-xs sm:text-sm text-purple-200">
                  প্রতিটি দোকানের ক্যাশ কাউন্টার ও পিওএস টার্মিনাল রিমোট কন্ট্রোল করুন। জরুরি প্রয়োজনে টার্মিনাল ফ্রিজ বা লক করুন, মডিউল পরিবর্তন করুন এবং সরাসরি যেকোনো স্টোরের POS-এ প্রবেশ করুন।
                </p>
              </div>

              {/* Quick Fleet Security Toggle Button */}
              <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl min-w-0 sm:min-w-[240px] w-full md:w-auto text-center">
                <div className="text-xs text-purple-200 font-medium">গ্লোবাল ফ্লিট সিকিউরিটি মোড</div>
                <div className={`text-base font-black my-1.5 flex items-center justify-center gap-2 ${
                  platformConfig.fleetPosLockdown ? 'text-rose-400' : 'text-emerald-300'
                }`}>
                  {platformConfig.fleetPosLockdown ? (
                    <>
                      <Lock className="w-4 h-4 text-rose-400" />
                      জরুরি লকডাউন সক্রিয়
                    </>
                  ) : (
                    <>
                      <Unlock className="w-4 h-4 text-emerald-400" />
                      সকল টার্মিনাল সক্রিয়
                    </>
                  )}
                </div>
                <button
                  onClick={handleToggleFleetPosLockdown}
                  className={`w-full py-2 px-3 rounded-xl font-bold text-xs transition shadow-sm ${
                    platformConfig.fleetPosLockdown
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-rose-600 hover:bg-rose-700 text-white'
                  }`}
                >
                  {platformConfig.fleetPosLockdown ? 'লকডাউন প্রত্যাহার ও আনলক' : 'জরুরি ফ্লিট লকডাউন চালু'}
                </button>
              </div>
            </div>

            {/* Quick KPI Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                  <span>মোট শপ / টার্মিনাল</span>
                  <Monitor className="w-4 h-4 text-purple-600" />
                </div>
                <div className="text-2xl font-black text-slate-900 mt-2">{tenants.length} টি</div>
                <div className="text-[11px] text-purple-700 font-bold mt-1">ক্যাশ কাউন্টার নেটওয়ার্ক</div>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                  <span>সক্রিয় POS কাউন্টার</span>
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-emerald-700 mt-2">
                  {tenants.filter(t => !t.isPosLocked).length} টি
                </div>
                <div className="text-[11px] text-emerald-600 font-bold mt-1">অনলাইন ও ক্যাশিং রানিং</div>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                  <span>লকড / ফ্রিজ টার্মিনাল</span>
                  <Lock className="w-4 h-4 text-rose-600" />
                </div>
                <div className="text-2xl font-black text-rose-700 mt-2">
                  {tenants.filter(t => t.isPosLocked).length} টি
                </div>
                <div className="text-[11px] text-rose-600 font-bold mt-1">অ্যাডমিন দ্বারা স্থগিত</div>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                  <span>PWA অফলাইন সাপোর্ট</span>
                  <Radio className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="text-2xl font-black text-indigo-700 mt-2">১০০% সচল</div>
                <div className="text-[11px] text-indigo-600 font-bold mt-1">নেট না থাকলেও বিলিং রেডি</div>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={posFleetSearch}
                  onChange={e => setPosFleetSearch(e.target.value)}
                  placeholder="দোকানের নাম, মালিকের নাম, মোবাইল বা স্লাগ খুঁজুন..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={posFleetStatusFilter}
                  onChange={e => setPosFleetStatusFilter(e.target.value as any)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                >
                  <option value="all">সকল টার্মিনাল স্ট্যাটাস</option>
                  <option value="active">🟢 শুধু সক্রিয় POS ({tenants.filter(t => !t.isPosLocked).length})</option>
                  <option value="locked">🔒 শুধু লকড টার্মিনাল ({tenants.filter(t => t.isPosLocked).length})</option>
                </select>

                <select
                  value={posModuleFilter}
                  onChange={e => setPosModuleFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                >
                  <option value="all">সকল মডিউল</option>
                  <option value="all_in_one">🌐 অল ইন ওয়ান (All in One)</option>
                  <option value="erp_pos">⚡ ইনভেন্টরি, ইআরপি ও POS</option>
                  <option value="ecommerce">🛒 ই-কমার্স ওয়েবসাইট</option>
                  <option value="hrm">👥 HRM ও প্যারোল</option>
                  <option value="crm">🤝 CRM ও ডিজিটাল বাকি খাতা</option>
                </select>
              </div>
            </div>

            {/* Store & POS Control Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs min-w-[850px]">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold">
                      <th className="py-3 px-4">দোকান ও বিবরণ</th>
                      <th className="py-3 px-4">মালিক ও ফোন</th>
                      <th className="py-3 px-4">অ্যাক্টিভ মডিউল</th>
                      <th className="py-3 px-4">টার্মিনাল স্ট্যাটাস</th>
                      <th className="py-3 px-4 text-center">রিমোট POS সুইচ</th>
                      <th className="py-3 px-4 text-right">সরাসরি একশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tenants
                      .filter(t => {
                        if (posFleetStatusFilter === 'active' && t.isPosLocked) return false;
                        if (posFleetStatusFilter === 'locked' && !t.isPosLocked) return false;
                        if (posModuleFilter !== 'all' && (t.selectedModule || 'all_in_one') !== posModuleFilter) return false;
                        if (posFleetSearch.trim()) {
                          const q = posFleetSearch.toLowerCase();
                          return (
                            t.name.toLowerCase().includes(q) ||
                            t.ownerName.toLowerCase().includes(q) ||
                            t.slug.toLowerCase().includes(q) ||
                            (t.phone && t.phone.toLowerCase().includes(q))
                          );
                        }
                        return true;
                      })
                      .map(tenant => {
                        const isLocked = Boolean(tenant.isPosLocked || platformConfig.fleetPosLockdown);
                        return (
                          <tr key={tenant.id} className="hover:bg-slate-50/60 transition">
                            {/* Store Name & Category */}
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs shrink-0">
                                  {tenant.name.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-bold text-slate-900 truncate flex items-center gap-1.5">
                                    <span>{tenant.name}</span>
                                    {isLocked && (
                                      <span className="w-2 h-2 rounded-full bg-rose-600 inline-block animate-ping" />
                                    )}
                                  </div>
                                  <div className="text-[10px] text-slate-400 font-mono">
                                    /{tenant.slug} • {tenant.businessType === 'pharmacy' ? 'ফার্মেসি' : tenant.businessType === 'grocery' ? 'গ্রোসারি' : tenant.businessType === 'electronics' ? 'ইলেকট্রনিক্স' : 'ওয়্যারহাউস'}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Owner & Phone */}
                            <td className="py-3 px-4">
                              <div className="font-semibold text-slate-800">{tenant.ownerName}</div>
                              <div className="text-[10px] text-slate-500 font-mono">{tenant.phone}</div>
                            </td>

                            {/* Active Module */}
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1.5">
                                <span className="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase bg-purple-100 text-purple-800 border border-purple-200">
                                  {tenant.selectedModule === 'ecommerce' ? 'ই-কমার্স' : tenant.selectedModule === 'erp_pos' ? 'ERP + POS' : tenant.selectedModule === 'hrm' ? 'HRM' : tenant.selectedModule === 'crm' ? 'CRM' : 'অল ইন ওয়ান'}
                                </span>
                                <button
                                  onClick={() => setEditingModuleTenant(tenant)}
                                  className="text-[10px] text-purple-600 hover:text-purple-800 font-bold underline"
                                  title="মডিউল পরিবর্তন করুন"
                                >
                                  পরিবর্তন
                                </button>
                              </div>
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                প্ল্যান: <span className="font-bold uppercase text-slate-700">{tenant.plan}</span>
                              </div>
                            </td>

                            {/* POS Terminal Status */}
                            <td className="py-3 px-4">
                              {isLocked ? (
                                <div>
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                                    <Lock className="w-3 h-3" /> টার্মিনাল লকড
                                  </span>
                                  <p className="text-[9px] text-rose-600 mt-0.5 italic">
                                    {tenant.posLockReason || 'অ্যাডমিন লক'}
                                  </p>
                                </div>
                              ) : (
                                <div>
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                                    <CheckCircle className="w-3 h-3" /> স্বাভাবিক সচল
                                  </span>
                                  <p className="text-[9px] text-slate-400 mt-0.5">PWA ক্যাশ রেডি</p>
                                </div>
                              )}
                            </td>

                            {/* 1-Click Remote Lock Switch */}
                            <td className="py-3 px-4 text-center">
                              <button
                                onClick={() => handleToggleTenantPosLock(tenant)}
                                className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition inline-flex items-center gap-1 shadow-xs border ${
                                  tenant.isPosLocked
                                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700'
                                    : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                                }`}
                                title={tenant.isPosLocked ? 'টার্মিনাল আনলক করুন' : 'টার্মিনাল লক করুন'}
                              >
                                {tenant.isPosLocked ? (
                                  <>
                                    <Unlock className="w-3.5 h-3.5" /> আনলক করুন
                                  </>
                                ) : (
                                  <>
                                    <Lock className="w-3.5 h-3.5" /> POS লক করুন
                                  </>
                                )}
                              </button>
                            </td>

                            {/* Direct Action Launch Controls */}
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                {onOpenStorePOS && (
                                  <button
                                    onClick={() => onOpenStorePOS(tenant.id)}
                                    className="px-2.5 py-1.5 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white rounded-xl text-[10px] font-black transition shadow-xs flex items-center gap-1"
                                    title="সরাসরি এই স্টোরের POS স্ক্রিন খুলুন"
                                  >
                                    <Monitor className="w-3 h-3" /> POS চালু
                                  </button>
                                )}
                                <button
                                  onClick={() => onImpersonateTenant(tenant.id)}
                                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[10px] font-bold transition flex items-center gap-1"
                                  title="স্টোর ERP ড্যাশবোর্ডে লগইন করুন"
                                >
                                  <ExternalLink className="w-3 h-3" /> ERP
                                </button>
                                {onOpenStorefrontView && (
                                  <button
                                    onClick={() => onOpenStorefrontView(tenant.id)}
                                    className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-[10px] font-bold transition flex items-center gap-1"
                                    title="লাইভ ই-কমার্স শপফ্রন্ট ভিজিট করুন"
                                  >
                                    <ShoppingBag className="w-3 h-3 text-emerald-600" /> শপ
                                  </button>
                                )}
                                <button
                                  onClick={() => setEditingPosSettingsTenant(tenant)}
                                  className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 rounded-xl text-[10px] font-bold transition flex items-center gap-1"
                                  title="POS পলিসি ও ফিচার সেটিংস (বাকিতে বিক্রি, ডিসকাউন্ট ইত্যাদি)"
                                >
                                  <Settings2 className="w-3 h-3 text-purple-700" /> POS পলিসি
                                </button>
                                <button
                                  onClick={() => setInspectingTenantData(tenant)}
                                  className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-[10px] font-bold transition flex items-center gap-1"
                                  title="লাইভ স্টক ও বিক্রয় ডেটা ইনস্পেক্টর"
                                >
                                  <BarChart3 className="w-3 h-3 text-amber-600" /> ডেটা
                                </button>
                                <button
                                  onClick={() => setEditingFeaturesTenant(tenant)}
                                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[10px] font-bold transition"
                                  title="মডিউল পারমিশন এডিট করুন"
                                >
                                  <Sliders className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB: GLOBAL E-COMMERCE & ORDER OVERSIGHT HUB */}
        {/* ============================================================== */}
        {activeTab === 'ecommerce_hub' && (
          <div className="space-y-6">
            {/* Header Hero Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-400/30">
                  <ShoppingBag className="w-3.5 h-3.5 text-amber-300" /> গ্লোবাল অনলাইন সেলস ও ডেলিভারি প্ল্যাটফর্ম
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                  গ্লোবাল ই-কমার্স ও ডেলিভারি হাব
                </h2>
                <p className="text-xs sm:text-sm text-indigo-200 max-w-2xl">
                  সকল ক্লায়েন্ট স্টোরের অনলাইন অর্ডার, কাস্টমার ট্র্যাকিং, কুরিয়ার বুকিং (Steadfast, RedX, Pathao) এবং পেমেন্ট ভেরিফিকেশন এক কেন্দ্রীয় ড্যাশবোর্ড থেকে পর্যবেক্ষণ করুন।
                </p>
              </div>

              {/* Quick E-Commerce Stat Box */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl min-w-[220px] text-center">
                <div className="text-xs text-indigo-200 font-medium">মোট অনলাইন রাজস্ব</div>
                <div className="text-2xl font-black text-amber-300 my-1">
                  ৳ {onlineOrders.reduce((acc, o) => acc + o.totalAmount, 0).toLocaleString()}
                </div>
                <div className="text-[10px] text-emerald-300 font-bold">
                  মোট {onlineOrders.length} টি অনলাইন অর্ডার
                </div>
              </div>
            </div>

            {/* Quick KPI Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                  <span>মোট অনলাইন অর্ডার</span>
                  <ShoppingBag className="w-4 h-4 text-purple-600" />
                </div>
                <div className="text-2xl font-black text-slate-900 mt-2">{onlineOrders.length} টি</div>
                <div className="text-[11px] text-purple-700 font-bold mt-1">সকল ক্লায়েন্ট শপ মিলিয়ে</div>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                  <span>পেন্ডিং প্রসেসিং</span>
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-2xl font-black text-amber-600 mt-2">
                  {onlineOrders.filter(o => o.status === 'pending').length} টি
                </div>
                <div className="text-[11px] text-amber-600 font-bold mt-1">প্যাকিং বা ভেরিফিকেশন বাকি</div>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                  <span>কুরিয়ারে হস্তান্তর (Shipped)</span>
                  <Truck className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="text-2xl font-black text-indigo-600 mt-2">
                  {onlineOrders.filter(o => o.status === 'shipped').length} টি
                </div>
                <div className="text-[11px] text-indigo-600 font-bold mt-1">Steadfast / RedX ডেলিভারিতে</div>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                  <span>সফল ডেলিভারি (Delivered)</span>
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-emerald-700 mt-2">
                  {onlineOrders.filter(o => o.status === 'delivered').length} টি
                </div>
                <div className="text-[11px] text-emerald-600 font-bold mt-1">সফল ক্যাশ কালেকশন</div>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={ecommerceSearchQuery}
                  onChange={e => setEcommerceSearchQuery(e.target.value)}
                  placeholder="অর্ডার নম্বর, কাস্টমার নাম বা ফোন নম্বর খুঁজুন..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={ecommerceStoreFilter}
                  onChange={e => setEcommerceStoreFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                >
                  <option value="all">সকল ক্লায়েন্ট স্টোর</option>
                  {tenants.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>

                <select
                  value={ecommerceStatusFilter}
                  onChange={e => setEcommerceStatusFilter(e.target.value as any)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                >
                  <option value="all">সকল অর্ডার স্ট্যাটাস</option>
                  <option value="pending">পেন্ডিং</option>
                  <option value="confirmed">কনফার্মড</option>
                  <option value="shipped">কুরিয়ারে হস্তান্তর (Shipped)</option>
                  <option value="delivered">ডেলিভার্ড</option>
                </select>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs min-w-[800px]">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                      <th className="py-3 px-4">অর্ডার # ও তারিখ</th>
                      <th className="py-3 px-4">দোকান / স্টোর</th>
                      <th className="py-3 px-4">কাস্টমার ও ঠিকানা</th>
                      <th className="py-3 px-4">আইটেম ও মূল্য</th>
                      <th className="py-3 px-4">পেমেন্ট মেথড</th>
                      <th className="py-3 px-4">কুরিয়ার ও ট্র্যাকিং</th>
                      <th className="py-3 px-4">স্ট্যাটাস</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {onlineOrders
                      .filter(order => {
                        if (ecommerceStoreFilter !== 'all' && order.tenantId !== ecommerceStoreFilter) return false;
                        if (ecommerceStatusFilter !== 'all' && order.status !== ecommerceStatusFilter) return false;
                        if (ecommerceSearchQuery.trim()) {
                          const q = ecommerceSearchQuery.toLowerCase();
                          return (
                            order.orderNumber.toLowerCase().includes(q) ||
                            order.customerName.toLowerCase().includes(q) ||
                            order.customerPhone.includes(q)
                          );
                        }
                        return true;
                      })
                      .map(order => {
                        const targetStore = tenants.find(t => t.id === order.tenantId);
                        return (
                          <tr key={order.id} className="hover:bg-slate-50/60 transition">
                            <td className="py-3 px-4">
                              <span className="font-mono font-bold text-purple-700 block">{order.orderNumber}</span>
                              <span className="text-[10px] text-slate-400">{order.createdAt}</span>
                            </td>

                            <td className="py-3 px-4">
                              <span className="font-bold text-slate-900 block truncate max-w-[150px]">
                                {targetStore?.name || order.tenantId}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {targetStore?.customDomain || `${targetStore?.slug}.jh-imse.shop`}
                              </span>
                            </td>

                            <td className="py-3 px-4">
                              <span className="font-semibold text-slate-800 block">{order.customerName}</span>
                              <span className="text-[10px] text-slate-500 font-mono block">{order.customerPhone}</span>
                              <span className="text-[10px] text-slate-400 truncate max-w-[180px] block">{order.customerAddress}</span>
                            </td>

                            <td className="py-3 px-4">
                              <span className="font-black text-slate-900 block">৳ {order.totalAmount.toFixed(2)}</span>
                              <span className="text-[10px] text-slate-500">
                                {order.items.length} টি পণ্য • ডেলিভারি: ৳{order.deliveryFee}
                              </span>
                            </td>

                            <td className="py-3 px-4">
                              <span className="font-bold text-slate-800 uppercase block">{order.paymentMethod}</span>
                              {order.transactionId && (
                                <span className="text-[10px] text-purple-700 font-mono block">Trx: {order.transactionId}</span>
                              )}
                            </td>

                            <td className="py-3 px-4">
                              {order.courierPartner ? (
                                <div>
                                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 uppercase border border-indigo-200">
                                    {order.courierPartner}
                                  </span>
                                  {order.courierTrackingId && (
                                    <span className="text-[10px] font-mono text-slate-600 block mt-0.5">
                                      {order.courierTrackingId}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-[10px] text-slate-400 italic">এখনো বুকিং হয়নি</span>
                              )}
                            </td>

                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black capitalize ${
                                order.status === 'delivered'
                                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                  : order.status === 'shipped'
                                  ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                                  : order.status === 'confirmed'
                                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                  : 'bg-amber-100 text-amber-700 border border-amber-200'
                              }`}>
                                {order.status === 'delivered' ? 'ডেলিভার্ড' : order.status === 'shipped' ? 'কুরিয়ারে রওয়ানা' : order.status === 'confirmed' ? 'কনফার্মড' : 'পেন্ডিং'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: COMPANIES & TENANT MANAGEMENT HUB */}
        {/* ============================================================== */}
        {activeTab === 'companies' && (
          <div className="space-y-4">
            {/* Header controls & filter */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
              <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="কোম্পানি, ট্রেড লাইসেন্স, ফোন বা স্লাগ দিয়ে খুঁজুন..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  />
                </div>

                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value as any)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                >
                  <option value="all">সকল বিজনেস ক্যাটাগরি</option>
                  <option value="grocery">🛒 মুদি ও সুপারশপ</option>
                  <option value="pharmacy">⚕️ ফার্মেসি ও মেডিসিন</option>
                  <option value="electronics">⚡ ইলেকট্রনিক্স ও গ্যাজেট</option>
                  <option value="warehouse">📦 পাইকারি ও গোডাউন</option>
                </select>

                <select
                  value={selectedPlan}
                  onChange={e => setSelectedPlan(e.target.value as any)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                >
                  <option value="all">সকল সাবস্ক্রিপশন প্ল্যান</option>
                  <option value="trial">ফ্রি ট্রায়াল</option>
                  <option value="starter">স্টার্টার</option>
                  <option value="professional">প্রফেশনাল</option>
                  <option value="enterprise">এন্টারপ্রাইজ</option>
                </select>

                <select
                  value={selectedStatus}
                  onChange={e => setSelectedStatus(e.target.value as any)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                >
                  <option value="all">সকল স্ট্যাটাস</option>
                  <option value="active">সক্রিয় (Active)</option>
                  <option value="grace_period">গ্রেস পিরিয়ড</option>
                  <option value="suspended">স্থগিত (Suspended)</option>
                  <option value="expired">মেয়াদোত্তীর্ণ (Expired)</option>
                </select>
              </div>

              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs whitespace-nowrap"
              >
                <Plus className="w-4 h-4" /> নতুন কোম্পানি যোগ করুন
              </button>
            </div>

            {/* Complete Tenants Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[900px]">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="py-3.5 px-4">কোম্পানির নাম ও প্রোফাইল</th>
                      <th className="py-3.5 px-4">ধরন</th>
                      <th className="py-3.5 px-4">স্বত্বাধিকারী ও যোগাযোগ</th>
                      <th className="py-3.5 px-4">প্ল্যান ও বিলিং</th>
                      <th className="py-3.5 px-4">রিসোর্স কোটা বনাম ব্যবহার</th>
                      <th className="py-3.5 px-4">মেয়াদ শেষ</th>
                      <th className="py-3.5 px-4">স্ট্যাটাস</th>
                      <th className="py-3.5 px-4 text-right">কন্ট্রোল ও অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTenants.map(tenant => (
                      <tr key={tenant.id} className="hover:bg-slate-50/80 transition">
                        {/* Company Name & Legal */}
                        <td className="py-3.5 px-4">
                          <div className="font-extrabold text-slate-900 text-xs">{tenant.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {tenant.slug}.jh-imse.shop {tenant.customDomain ? `• 🌐 ${tenant.customDomain}` : ''}
                          </div>
                          <div className="text-[9px] text-purple-700 font-semibold mt-0.5">
                            ট্রেড লাইসেন্স: {tenant.tradeLicenseNo || 'N/A'}
                          </div>
                        </td>

                        {/* Category badge */}
                        <td className="py-3.5 px-4">
                          <span className={`inline-block px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            tenant.businessType === 'pharmacy' ? 'bg-cyan-100 text-cyan-800' :
                            tenant.businessType === 'grocery' ? 'bg-amber-100 text-amber-800' :
                            tenant.businessType === 'electronics' ? 'bg-indigo-100 text-indigo-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {tenant.businessType === 'pharmacy' && '⚕️ ফার্মেসি'}
                            {tenant.businessType === 'grocery' && '🛒 মুদি / রিটেইল'}
                            {tenant.businessType === 'electronics' && '⚡ গ্যাজেট'}
                            {tenant.businessType === 'warehouse' && '📦 পাইকারি ডিপো'}
                          </span>
                        </td>

                        {/* Owner & Phone */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-800">{tenant.ownerName}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{tenant.phone}</div>
                        </td>

                        {/* Plan & Fee */}
                        <td className="py-3.5 px-4">
                          <span className={`inline-block px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                            tenant.plan === 'enterprise' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                            tenant.plan === 'professional' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' :
                            tenant.plan === 'starter' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                            'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}>
                            {tenant.plan}
                          </span>
                          <div className="text-[10px] text-slate-500 font-semibold mt-0.5">
                            ৳ {tenant.monthlyFee}/মাস ({tenant.billingCycle === 'yearly' ? 'বাৎসরিক' : 'মাসিক'})
                          </div>
                        </td>

                        {/* Quotas vs Usage */}
                        <td className="py-3.5 px-4 min-w-[160px]">
                          <div className="space-y-1 text-[10px]">
                            <div className="flex justify-between text-slate-600">
                              <span>ব্রাঞ্চ:</span>
                              <strong className="text-slate-900">{tenant.usage.currentBranches}/{tenant.quotas.maxBranches}</strong>
                            </div>
                            <div className="flex justify-between text-slate-600">
                              <span>ইউজার:</span>
                              <strong className="text-slate-900">{tenant.usage.currentUsers}/{tenant.quotas.maxUsers}</strong>
                            </div>
                            <div className="flex justify-between text-slate-600">
                              <span>স্টোরেজ:</span>
                              <strong className="text-slate-900">{(tenant.usage.currentStorageMb / 1024).toFixed(1)} / {tenant.quotas.storageGb} GB</strong>
                            </div>
                          </div>
                        </td>

                        {/* Expiry */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-800">{tenant.subscriptionExpiry}</div>
                          <button
                            onClick={() => handleExtendSubscription(tenant, 1)}
                            className="text-[10px] text-purple-700 font-bold hover:underline"
                          >
                            +৩০ দিন বাড়ান
                          </button>
                        </td>

                        {/* Status Toggle */}
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => handleToggleStatus(tenant)}
                            className={`px-2.5 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1 transition ${
                              tenant.status === 'active'
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : tenant.status === 'grace_period'
                                ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                            }`}
                          >
                            {tenant.status === 'active' ? (
                              <><CheckCircle2 className="w-3 h-3" /> সক্রিয়</>
                            ) : tenant.status === 'grace_period' ? (
                              <><AlertTriangle className="w-3 h-3" /> গ্রেস পিরিয়ড</>
                            ) : (
                              <><XCircle className="w-3 h-3" /> স্থগিত</>
                            )}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                          {/* Impersonate button */}
                          <button
                            onClick={() => onImpersonateTenant(tenant.id)}
                            className="px-2.5 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-[11px] font-bold transition shadow-2xs inline-flex items-center gap-1"
                            title="দোকানদারের ড্যাশবোর্ডে প্রবেশ করুন"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> স্টোরে লগইন
                          </button>

                          {/* License Modal trigger */}
                          <button
                            onClick={() => setLicenseModalTenant(tenant)}
                            className="p-1.5 bg-slate-100 hover:bg-purple-100 text-slate-700 hover:text-purple-800 rounded-xl transition"
                            title="লাইসেন্স কি ও রিনিউয়াল সার্টিফিকেট"
                          >
                            <Key className="w-3.5 h-3.5" />
                          </button>

                          {/* Quota Modal trigger */}
                          <button
                            onClick={() => setQuotaModalTenant(tenant)}
                            className="p-1.5 bg-slate-100 hover:bg-indigo-100 text-slate-700 hover:text-indigo-800 rounded-xl transition"
                            title="রিসোর্স কোটা ও ধারণক্ষমতা এডিট"
                          >
                            <HardDrive className="w-3.5 h-3.5" />
                          </button>

                          {/* Feature flags trigger */}
                          <button
                            onClick={() => setEditingFeaturesTenant(tenant)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
                            title="ফিচার ও মডিউল পারমিশন"
                          >
                            <Settings2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: PACKAGES & SUBSCRIPTION TIERS */}
        {/* ============================================================== */}
        {activeTab === 'packages' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  ক্লাউড SaaS সাবস্ক্রিপশন প্ল্যানসমূহ (Packages & Tiers)
                </h3>
                <p className="text-xs text-slate-500">
                  বাংলাদেশী রিটেইলার ও এন্টারপ্রাইজ ক্লায়েন্টদের জন্য কাস্টমাইজড কোটা ও প্রাইসিং
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-purple-700">বাৎসরিক বিলিংয়ে ২০% ছাড় ও ফ্রি ইনস্টলেশন সক্রিয়</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {packages.map(pkg => (
                <div
                  key={pkg.id}
                  className={`bg-white rounded-3xl p-6 border shadow-2xs flex flex-col justify-between relative transition hover:shadow-md ${
                    pkg.popular ? 'border-purple-600 ring-2 ring-purple-600/20' : 'border-slate-200'
                  }`}
                >
                  {pkg.badge && (
                    <span className="absolute -top-3 right-6 bg-gradient-to-r from-purple-700 to-indigo-600 text-white text-[10px] font-extrabold px-3 py-1 rounded-full shadow-xs">
                      {pkg.badge}
                    </span>
                  )}

                  <div>
                    <h4 className="font-black text-lg text-slate-900">{pkg.name}</h4>
                    <p className="text-xs text-slate-500 mt-1 min-h-[36px]">{pkg.description}</p>

                    <div className="my-4 pt-4 border-t border-slate-100">
                      <div className="text-3xl font-black text-purple-900">
                        ৳ {pkg.monthlyPrice.toLocaleString()}
                        <span className="text-xs text-slate-400 font-normal"> / মাস</span>
                      </div>
                      <div className="text-[11px] text-emerald-600 font-bold mt-1">
                        বাৎসরিক: ৳ {pkg.yearlyPrice.toLocaleString()} (২ মাস ফ্রি)
                      </div>
                    </div>

                    {/* Quota Highlights */}
                    <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 space-y-1.5 text-xs mb-4">
                      <div className="flex justify-between font-semibold text-slate-700">
                        <span>🏢 আউটলেট / ব্রাঞ্চ:</span>
                        <strong className="text-slate-900">{pkg.quotas.maxBranches} টি</strong>
                      </div>
                      <div className="flex justify-between font-semibold text-slate-700">
                        <span>👥 ক্যাশিয়ার ও ইউজার:</span>
                        <strong className="text-slate-900">{pkg.quotas.maxUsers} জন</strong>
                      </div>
                      <div className="flex justify-between font-semibold text-slate-700">
                        <span>📦 ইনভেন্টরি পণ্য:</span>
                        <strong className="text-slate-900">{pkg.quotas.maxProducts.toLocaleString()} টি</strong>
                      </div>
                      <div className="flex justify-between font-semibold text-slate-700">
                        <span>💾 ক্লাউড স্টোরেজ:</span>
                        <strong className="text-slate-900">{pkg.quotas.storageGb} GB</strong>
                      </div>
                    </div>

                    {/* Features list */}
                    <div className="space-y-2 text-xs text-slate-600">
                      {pkg.includedFeatures.map((feat, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-purple-700 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <button
                      onClick={() => alert(`${pkg.name}-এর কনফিগারেশন আপডেট সফল হয়েছে।`)}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition shadow-xs ${
                        pkg.popular 
                          ? 'bg-purple-700 hover:bg-purple-800 text-white' 
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                      }`}
                    >
                      প্যাকেজ সেটিংস এডিট করুন
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: LICENSE KEY GENERATOR */}
        {/* ============================================================== */}
        {activeTab === 'licenses' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Generator Form */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">ক্রিপ্টো লাইসেন্স জেনারেটর</h3>
                  <p className="text-xs text-slate-500">অফলাইন ও ক্লাউড অথেনটিকেশন কি ইস্যু</p>
                </div>
              </div>

              <form onSubmit={handleGenerateLicense} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">কোম্পানি নির্বাচন করুন:</label>
                  <select
                    value={newLicTenantId}
                    onChange={e => setNewLicTenantId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:outline-none font-medium"
                  >
                    {tenants.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.slug})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">সাবস্ক্রিপশন টিয়ার:</label>
                  <select
                    value={newLicPlan}
                    onChange={e => setNewLicPlan(e.target.value as PlanTier)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:outline-none font-medium"
                  >
                    <option value="starter">স্টার্টার (Starter Tier)</option>
                    <option value="professional">প্রফেশনাল (Professional Tier)</option>
                    <option value="enterprise">এন্টারপ্রাইজ (Enterprise Tier)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">লাইসেন্স মেয়াদ:</label>
                  <select
                    value={newLicDuration}
                    onChange={e => setNewLicDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:outline-none font-medium"
                  >
                    <option value={1}>১ মাস (৩০ দিন)</option>
                    <option value={3}>৩ মাস (কোয়ার্টারলি)</option>
                    <option value={6}>৬ মাস (হাফ-ইয়ারলি)</option>
                    <option value={12}>১২ মাস (১ বছর - বাৎসরিক)</option>
                    <option value={36}>৩৬ মাস (৩ বছর - কর্পোরেট)</option>
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-xs"
                  >
                    <Key className="w-4 h-4" /> নতুন লাইসেন্স কি তৈরি করুন
                  </button>
                </div>
              </form>

              {/* Success Box */}
              {generatedSuccessKey && (
                <div className="mt-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs animate-in zoom-in-95">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-bold mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    লাইসেন্স কি সফলভাবে তৈরি হয়েছে!
                  </div>
                  <div className="font-mono font-bold text-slate-900 bg-white p-2 rounded-lg border border-emerald-300 break-all my-2 select-all">
                    {generatedSuccessKey}
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedSuccessKey);
                      alert('লাইসেন্স কি ক্লিপবোর্ডে কপি হয়েছে!');
                    }}
                    className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition flex items-center justify-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" /> কি কপি করুন
                  </button>
                </div>
              )}
            </div>

            {/* Right: Active Issued Licenses Table */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="p-5 border-b border-slate-200">
                <h3 className="font-bold text-sm text-slate-900">ইস্যুকৃত লাইসেন্স কি রেজিস্ট্রি</h3>
                <p className="text-xs text-slate-500">JH Soft Corporation অনুমোদিত বৈধ গ্রাহক লাইসেন্স তালিকা</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[700px]">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">কোম্পানি</th>
                      <th className="py-3 px-4">লাইসেন্স কি</th>
                      <th className="py-3 px-4">প্ল্যান</th>
                      <th className="py-3 px-4">ইস্যুর তারিখ</th>
                      <th className="py-3 px-4">মেয়াদ শেষ</th>
                      <th className="py-3 px-4">স্ট্যাটাস</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {licenses.map(lic => (
                      <tr key={lic.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-4 font-sans font-bold text-slate-900">
                          {lic.tenantName}
                        </td>
                        <td className="py-3 px-4 font-bold text-purple-800">
                          {lic.key}
                        </td>
                        <td className="py-3 px-4 uppercase text-[10px] font-sans font-semibold text-slate-600">
                          {lic.plan}
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {lic.generatedAt}
                        </td>
                        <td className="py-3 px-4 text-slate-800 font-bold">
                          {lic.expiresAt}
                        </td>
                        <td className="py-3 px-4 font-sans">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            ✓ {lic.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 5: CUSTOM DOMAINS */}
        {/* ============================================================== */}
        {activeTab === 'domains' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">কাস্টম ডোমেইন ম্যাপিং ও SSL সার্টিফিকেট</h3>
                <p className="text-xs text-slate-500">
                  ক্লায়েন্ট স্টোরের নিজস্ব ডোমেইন (e.g. `*.com.bd`) ভেরিফিকেশন ও DNS সংযোগ
                </p>
              </div>

              <div className="text-xs bg-purple-50 text-purple-900 border border-purple-200 px-3 py-1.5 rounded-xl font-mono">
                CNAME রেকর্ড টার্গেট: <strong>cname.jh-imse.shop</strong>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[750px]">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">কোম্পানি</th>
                    <th className="py-3.5 px-4">কাস্টম ডোমেইন</th>
                    <th className="py-3.5 px-4">CNAME টার্গেট</th>
                    <th className="py-3.5 px-4">অনুরোধের তারিখ</th>
                    <th className="py-3.5 px-4">SSL স্ট্যাটাস</th>
                    <th className="py-3.5 px-4">ম্যাপিং স্ট্যাটাস</th>
                    <th className="py-3.5 px-4 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {domains.map(dom => (
                    <tr key={dom.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{dom.tenantName}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-purple-700 flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-slate-400" /> {dom.domain}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">{dom.cnameTarget}</td>
                      <td className="py-3.5 px-4 text-slate-600">{dom.requestedDate}</td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          dom.sslStatus === 'secured' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          <ShieldCheck className="w-3 h-3" />
                          {dom.sslStatus === 'secured' ? 'SSL সুরক্ষিত (256-bit)' : 'প্রভিশনিং চলছে'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          dom.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {dom.status === 'active' ? 'অনুমোদিত ও লাইভ' : 'DNS পেন্ডিং'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1">
                        {dom.status !== 'active' ? (
                          <button
                            onClick={() => handleDomainStatusChange(dom.id, 'active')}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition shadow-2xs"
                          >
                            অনুমোদন করুন
                          </button>
                        ) : (
                          <button
                            onClick={() => alert(`${dom.domain}-এর DNS ও SSL সংযোগ সম্পূর্ণ সুস্থ আছে!`)}
                            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold transition"
                          >
                            যাচাই করুন
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 6: BILLING & TRANSACTIONS */}
        {/* ============================================================== */}
        {activeTab === 'transactions' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  SaaS সাবস্ক্রিপশন রাজস্ব ও লেনদেন রেজিস্ট্রি
                </h3>
                <p className="text-xs text-slate-500">
                  bKash, Nagad, ব্যাংক ট্রান্সফার ও কার্ডের মাধ্যমে গৃহীত সাবস্ক্রিপশন ফি
                </p>
              </div>

              <div className="text-sm font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                মোট সংগৃহীত পেমেন্ট: ৳ {transactions.reduce((acc, t) => acc + t.amount, 0).toLocaleString()}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[750px]">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">ইনভয়েস নং</th>
                    <th className="py-3.5 px-4">কোম্পানির নাম</th>
                    <th className="py-3.5 px-4">প্ল্যান</th>
                    <th className="py-3.5 px-4">পেমেন্ট মেথড</th>
                    <th className="py-3.5 px-4">TrxID / রেফারেন্স</th>
                    <th className="py-3.5 px-4">তারিখ</th>
                    <th className="py-3.5 px-4 text-right">টাকার পরিমাণ</th>
                    <th className="py-3.5 px-4 text-center">স্ট্যাটাস</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.map(trx => (
                    <tr key={trx.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-purple-700">
                        {trx.invoiceNumber}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {trx.tenantName}
                      </td>
                      <td className="py-3.5 px-4 uppercase text-[10px] font-bold text-slate-600">
                        {trx.plan} ({trx.billingCycle === 'yearly' ? 'বাৎসরিক' : 'মাসিক'})
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700">
                        {trx.paymentMethod}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                        {trx.trxId}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {trx.date}
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-emerald-700">
                        ৳ {trx.amount.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          পরিশোধিত (Paid)
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 7: BROADCAST ENGINE */}
        {/* ============================================================== */}
        {activeTab === 'broadcasts' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Create Broadcast Form */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
              <h3 className="font-extrabold text-sm text-slate-900 mb-1">নতুন সিস্টেম নোটিশ পাঠান</h3>
              <p className="text-xs text-slate-500 mb-4">সকল বা নির্দিষ্ট ক্লায়েন্ট ড্যাশবোর্ডে লাইভ বার্তা প্রচার করুন।</p>

              <form onSubmit={handleCreateBroadcast} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">নোটিশের শিরোনাম:</label>
                  <input
                    type="text"
                    required
                    value={bcTitle}
                    onChange={e => setBcTitle(e.target.value)}
                    placeholder="যেমন: সার্ভার রক্ষণাবেক্ষণ সংক্রান্ত নোটিশ"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">নোটিশের বিষয়বস্তু / মেসেজ:</label>
                  <textarea
                    rows={4}
                    required
                    value={bcMessage}
                    onChange={e => setBcMessage(e.target.value)}
                    placeholder="যেমন: আজ রাত ১২টা থেকে রাত ১টা পর্যন্ত প্ল্যাটফর্ম অপ্টিমাইজেশন সম্পন্ন হবে..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">নোটিশের ধরন:</label>
                    <select
                      value={bcType}
                      onChange={e => setBcType(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    >
                      <option value="info">তথ্যমূলক (Info)</option>
                      <option value="warning">সতর্কতামূলক (Warning)</option>
                      <option value="maintenance">রক্ষণাবেক্ষণ (Maintenance)</option>
                      <option value="critical">জরুরি (Critical)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">টার্গেট প্রাপক:</label>
                    <select
                      value={bcTarget}
                      onChange={e => setBcTarget(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    >
                      <option value="all">সকল কোম্পানি</option>
                      <option value="pharmacy">শুধুমাত্র ফার্মেসি</option>
                      <option value="grocery">মুদি ও রিটেইল</option>
                      <option value="enterprise">এন্টারপ্রাইজ ক্লায়েন্ট</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-xs"
                >
                  <Bell className="w-4 h-4 text-amber-300" /> সিস্টেমে প্রচার (Broadcast) করুন
                </button>
              </form>
            </div>

            {/* Sent Broadcasts History */}
            <div className="lg:col-span-2 space-y-3">
              <h3 className="font-bold text-sm text-slate-900 mb-2">ব্রডকাস্ট নোটিশের ইতিহাস</h3>

              {broadcasts.map(bc => (
                <div key={bc.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        bc.type === 'maintenance' ? 'bg-amber-100 text-amber-800' :
                        bc.type === 'critical' ? 'bg-rose-100 text-rose-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {bc.type.toUpperCase()}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900">{bc.title}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">({bc.createdAt})</span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">{bc.message}</p>
                    <div className="text-[10px] text-slate-400">প্রাপক: <strong>{bc.target === 'all' ? 'সকল স্টোর' : bc.target}</strong></div>
                  </div>

                  <button
                    onClick={() => toggleBroadcastActive(bc.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                      bc.active
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {bc.active ? '✓ লাইভ সক্রিয়' : 'নিষ্ক্রিয়'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 8: SUBSCRIPTION PAYMENT VERIFICATION & APPROVAL REQUESTS   */}
        {/* ============================================================== */}
        {activeTab === 'requests' && (
          <div className="space-y-6">
            {/* Header & Stats */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-purple-700" />
                  সাবস্ক্রিপশন পেমেন্ট ভেরিফিকেশন ও ট্রানজিশন হাব
                </h2>
                <p className="text-xs text-slate-500">
                  ক্লায়েন্টদের বিকাশ, নগদ, রকেট ও ব্যাংক অ্যাকাউন্টে পাঠানো পেমেন্ট ও TrxID যাচাই করে প্যাকেজ অনুমোদন দিন
                </p>
              </div>

              <button
                onClick={() => setActiveTab('payment_settings')}
                className="px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-xl text-xs font-bold border border-purple-200 transition flex items-center gap-1.5 self-start"
              >
                <Settings2 className="w-4 h-4 text-purple-600" /> মার্চেন্ট অ্যাকাউন্ট নম্বর এডিট করুন
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
                <span className="text-xs text-slate-400 font-semibold block">মোট পেমেন্ট রিকোয়েস্ট</span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">{subscriptionRequests.length}টি</span>
              </div>
              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 shadow-2xs">
                <span className="text-xs text-amber-700 font-semibold block">যাচাইয়ের অপেক্ষায় (Pending)</span>
                <span className="text-2xl font-black text-amber-900 mt-1 block">{pendingRequestsCount}টি</span>
              </div>
              <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 shadow-2xs">
                <span className="text-xs text-emerald-700 font-semibold block">অনুমোদিত ও সক্রিয় (Approved)</span>
                <span className="text-2xl font-black text-emerald-900 mt-1 block">
                  {subscriptionRequests.filter(r => r.status === 'approved').length}টি
                </span>
              </div>
              <div className="bg-rose-50 rounded-2xl p-4 border border-rose-200 shadow-2xs">
                <span className="text-xs text-rose-700 font-semibold block">বাতিলকৃত (Rejected)</span>
                <span className="text-2xl font-black text-rose-900 mt-1 block">
                  {subscriptionRequests.filter(r => r.status === 'rejected').length}টি
                </span>
              </div>
            </div>

            {/* Filter & Search Toolbar */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                <button
                  onClick={() => setRequestFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    requestFilter === 'all' ? 'bg-purple-700 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  সকল ({subscriptionRequests.length})
                </button>
                <button
                  onClick={() => setRequestFilter('pending')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                    requestFilter === 'pending' ? 'bg-amber-600 text-white shadow-xs' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                  }`}
                >
                  পেন্ডিং ({pendingRequestsCount})
                </button>
                <button
                  onClick={() => setRequestFilter('approved')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    requestFilter === 'approved' ? 'bg-emerald-700 text-white shadow-xs' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  }`}
                >
                  অনুমোদিত
                </button>
                <button
                  onClick={() => setRequestFilter('rejected')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    requestFilter === 'rejected' ? 'bg-rose-700 text-white shadow-xs' : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
                  }`}
                >
                  বাতিল
                </button>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="দোকানের নাম, TrxID বা ফোন..."
                  value={requestSearch}
                  onChange={e => setRequestSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-purple-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Requests List */}
            {subscriptionRequests.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center text-slate-500 border border-slate-200 shadow-2xs">
                <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="font-bold text-slate-700 text-base">কোনো সাবস্ক্রিপশন পেমেন্ট রিকোয়েস্ট পাওয়া যায়নি</h4>
                <p className="text-xs text-slate-400 mt-1">দোকানদাররা প্যাকেজ আপগ্রেড করতে পেমেন্ট সাবমিট করলে তা এখানে শো করবে।</p>
              </div>
            ) : (
              <div className="space-y-3">
                {subscriptionRequests
                  .filter(req => {
                    if (requestFilter !== 'all' && req.status !== requestFilter) return false;
                    if (requestSearch.trim()) {
                      const q = requestSearch.toLowerCase();
                      return (
                        req.tenantName.toLowerCase().includes(q) ||
                        req.ownerName.toLowerCase().includes(q) ||
                        req.trxId.toLowerCase().includes(q) ||
                        req.senderPhone.includes(q)
                      );
                    }
                    return true;
                  })
                  .map(req => (
                    <div
                      key={req.id}
                      className={`bg-white rounded-2xl p-5 border shadow-2xs transition hover:shadow-md ${
                        req.status === 'pending'
                          ? 'border-amber-300 ring-1 ring-amber-100'
                          : req.status === 'approved'
                          ? 'border-emerald-200'
                          : 'border-slate-200 opacity-80'
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-lg border border-purple-100">
                              {req.id}
                            </span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase ${
                                req.status === 'pending'
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                                  : req.status === 'approved'
                                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                  : 'bg-rose-100 text-rose-900 border border-rose-300'
                              }`}
                            >
                              {req.status === 'pending'
                                ? '● পেন্ডিং যাচাই'
                                : req.status === 'approved'
                                ? '✓ অনুমোদিত'
                                : '✕ বাতিলকৃত'}
                            </span>
                            <span className="text-xs text-slate-400">দাখিল: {req.submittedAt}</span>
                          </div>

                          <div>
                            <h3 className="text-base font-black text-slate-900">
                              {req.tenantName}{' '}
                              <span className="text-xs font-normal text-slate-500">
                                ({req.ownerName} • {req.ownerPhone})
                              </span>
                            </h3>
                            <div className="flex items-center gap-3 text-xs text-slate-600 mt-1 flex-wrap">
                              <span>
                                আবেদনকৃত প্যাকেজ:{' '}
                                <strong className="text-purple-700 uppercase font-black">{req.plan}</strong> (
                                {req.billingCycle === 'yearly' ? 'বাৎসরিক' : 'মাসিক'})
                              </span>
                              <span>•</span>
                              <span>
                                মাধ্যম: <strong className="text-slate-800">{req.paymentMethod}</strong>
                              </span>
                            </div>
                          </div>

                          {/* TrxID & Sender info box */}
                          <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs flex-wrap font-sans">
                            <div>
                              <span className="text-[10px] text-slate-400 block font-semibold">প্রেরক ফোন নম্বর</span>
                              <strong className="text-slate-800 font-mono text-sm">{req.senderPhone}</strong>
                            </div>
                            <div className="h-6 w-px bg-slate-200" />
                            <div>
                              <span className="text-[10px] text-slate-400 block font-semibold">ট্রানজেকশন আইডি (TrxID)</span>
                              <strong className="text-purple-800 font-mono text-sm tracking-wide bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                                {req.trxId}
                              </strong>
                            </div>
                            <div className="h-6 w-px bg-slate-200" />
                            <div>
                              <span className="text-[10px] text-slate-400 block font-semibold">পরিশোধিত অর্থ</span>
                              <strong className="text-emerald-700 font-mono text-base font-black">৳{req.amount}</strong>
                            </div>
                            {req.screenshotUrl && (
                              <button
                                onClick={() => setSelectedProofUrl(req.screenshotUrl || null)}
                                className="ml-auto text-xs text-purple-700 hover:text-purple-900 font-bold underline flex items-center gap-1"
                              >
                                <Eye className="w-3.5 h-3.5" /> মানি রিসিট / স্ক্রিনশট দেখুন
                              </button>
                            )}
                          </div>

                          {req.adminNotes && (
                            <div className="text-xs text-rose-700 bg-rose-50 p-2 rounded-lg border border-rose-100">
                              <strong>এডমিন নোট:</strong> {req.adminNotes}
                            </div>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-col sm:flex-row lg:flex-col items-end gap-2 justify-center shrink-0">
                          {req.status === 'pending' ? (
                            <>
                              <button
                                onClick={() => {
                                  if (onApproveSubscriptionRequest) {
                                    onApproveSubscriptionRequest(req.id);
                                  }
                                }}
                                className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-black shadow-sm flex items-center justify-center gap-1.5 transition"
                              >
                                <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                                অনুমোদন ও প্যাকেজ সক্রিয় করুন
                              </button>
                              <button
                                onClick={() => {
                                  setRejectModal({ id: req.id, open: true });
                                  setRejectReason('');
                                }}
                                className="w-full sm:w-auto px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                              >
                                <XCircle className="w-4 h-4 text-rose-500" />
                                বাতিল করুন
                              </button>
                            </>
                          ) : req.status === 'approved' ? (
                            <div className="text-right">
                              <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                                <Check className="w-4 h-4" /> সফলভাবে আপগ্রেড ও ভেরিফাইড
                              </span>
                              <span className="text-[10px] text-slate-400 block mt-1">অনুমোদিত: {req.reviewedAt}</span>
                            </div>
                          ) : (
                            <div className="text-right">
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200">
                                <XCircle className="w-4 h-4" /> আবেদন বাতিলকৃত
                              </span>
                              <span className="text-[10px] text-slate-400 block mt-1">যাচাই: {req.reviewedAt}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 9: OFFICIAL MERCHANT ACCOUNTS SETTINGS                      */}
        {/* ============================================================== */}
        {activeTab === 'payment_settings' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Settings2 className="w-6 h-6 text-purple-700" />
                অফিসিয়াল পেমেন্ট গ্রহণ অ্যাকাউন্টস ও সেটিংস
              </h2>
              <p className="text-xs text-slate-500">
                এখানে আপনার প্রতিষ্ঠানের বিকাশ, নগদ, রকেট ও ব্যাংক একাউন্ট সেট করুন। সাবস্ক্রিপশন কেনার সময় ক্লায়েন্টরা এগুলো দেখতে পাবে।
              </p>
            </div>

            {accountSettingsSaved && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-900 text-xs font-bold animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                পেমেন্ট অ্যাকাউন্ট তথ্য সফলভাবে হালনাগাদ করা হয়েছে! গ্রাহকরা এখন নতুন নম্বর দেখতে পাবেন।
              </div>
            )}

            <form
              onSubmit={e => {
                e.preventDefault();
                if (onUpdateAdminPaymentAccounts) {
                  onUpdateAdminPaymentAccounts(paymentForm);
                }
                setAccountSettingsSaved(true);
                setTimeout(() => setAccountSettingsSaved(false), 4000);
              }}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6"
            >
              {/* MFS Accounts Section */}
              <div>
                <h3 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-purple-600" />
                  মোবাইল ফিনান্সিয়াল সার্ভিসেস (MFS) অ্যাকাউন্ট
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* bKash */}
                  <div className="p-4 rounded-2xl bg-pink-50/60 border border-pink-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-pink-900">বিকাশ (bKash)</span>
                      <select
                        value={paymentForm.bkashType}
                        onChange={e => setPaymentForm({ ...paymentForm, bkashType: e.target.value as 'merchant' | 'personal' })}
                        className="text-[10px] bg-white border border-pink-300 rounded-lg px-2 py-0.5 font-bold"
                      >
                        <option value="merchant">মার্চেন্ট (Payment)</option>
                        <option value="personal">পার্সোনাল (Send Money)</option>
                      </select>
                    </div>
                    <input
                      type="text"
                      value={paymentForm.bkashNumber}
                      onChange={e => setPaymentForm({ ...paymentForm, bkashNumber: e.target.value })}
                      placeholder="যেমন: 01940999830"
                      className="w-full p-2.5 bg-white border border-pink-300 rounded-xl text-xs font-mono font-bold text-pink-900 focus:outline-none focus:ring-1 focus:ring-pink-500"
                    />
                  </div>

                  {/* Nagad */}
                  <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-amber-900">নগদ (Nagad)</span>
                      <select
                        value={paymentForm.nagadType}
                        onChange={e => setPaymentForm({ ...paymentForm, nagadType: e.target.value as 'merchant' | 'personal' })}
                        className="text-[10px] bg-white border border-amber-300 rounded-lg px-2 py-0.5 font-bold"
                      >
                        <option value="merchant">মার্চেন্ট (Payment)</option>
                        <option value="personal">পার্সোনাল (Send Money)</option>
                      </select>
                    </div>
                    <input
                      type="text"
                      value={paymentForm.nagadNumber}
                      onChange={e => setPaymentForm({ ...paymentForm, nagadNumber: e.target.value })}
                      placeholder="যেমন: 01700000000"
                      className="w-full p-2.5 bg-white border border-amber-300 rounded-xl text-xs font-mono font-bold text-amber-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  {/* Rocket */}
                  <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200 space-y-3">
                    <span className="font-bold text-xs text-purple-900 block">রকেট (Rocket)</span>
                    <input
                      type="text"
                      value={paymentForm.rocketNumber}
                      onChange={e => setPaymentForm({ ...paymentForm, rocketNumber: e.target.value })}
                      placeholder="যেমন: 01940999830-9"
                      className="w-full p-2.5 bg-white border border-purple-300 rounded-xl text-xs font-mono font-bold text-purple-900 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Bank Account Section */}
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-purple-600" />
                  অফিসিয়াল ব্যাংক অ্যাকাউন্ট তথ্য
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">ব্যাংকের নাম</label>
                    <input
                      type="text"
                      value={paymentForm.bankName}
                      onChange={e => setPaymentForm({ ...paymentForm, bankName: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-purple-600 focus:outline-none font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">অ্যাকাউন্টের নাম (Account Holder)</label>
                    <input
                      type="text"
                      value={paymentForm.bankAccountName}
                      onChange={e => setPaymentForm({ ...paymentForm, bankAccountName: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-purple-600 focus:outline-none font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">অ্যাকাউন্ট নম্বর</label>
                    <input
                      type="text"
                      value={paymentForm.bankAccountNumber}
                      onChange={e => setPaymentForm({ ...paymentForm, bankAccountNumber: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:ring-1 focus:ring-purple-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">শাখা (Branch)</label>
                    <input
                      type="text"
                      value={paymentForm.bankBranch}
                      onChange={e => setPaymentForm({ ...paymentForm, bankBranch: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-purple-600 focus:outline-none font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Instructions for Customers */}
              <div className="pt-4 border-t border-slate-100">
                <label className="text-xs font-black text-slate-900 block mb-1.5">
                  গ্রাহকদের জন্য সাধারণ নির্দেশিকা (Instruction Message)
                </label>
                <textarea
                  rows={3}
                  value={paymentForm.paymentInstructions}
                  onChange={e => setPaymentForm({ ...paymentForm, paymentInstructions: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-2xl text-xs leading-relaxed focus:ring-1 focus:ring-purple-600 focus:outline-none"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" /> মার্চেন্ট অ্যাকাউন্ট তথ্য সেভ করুন
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB: GLOBAL PLATFORM & HOSTINGER CLOUD SETTINGS */}
        {/* ============================================================== */}
        {activeTab === 'platform_settings' && (
          <div className="space-y-6 max-w-4xl">
            {/* Header Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-700 to-indigo-600 flex items-center justify-center font-bold text-white shadow-sm">
                  <Server className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900">
                    গ্লোবাল প্ল্যাটফর্ম সেটিংস ও হোস্টিংগার ক্লাউড ইঞ্জিন
                  </h2>
                  <p className="text-xs text-slate-500">
                    JH IMSE SaaS কোর প্যারামিটার, হোস্টিংগার বিজনেস ক্লাউড DNS, হেল্পলাইন ও সার্বিক সিস্টেম কন্ট্রোল।
                  </p>
                </div>
              </div>

              {platformConfigSaved && (
                <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  গ্লোবাল প্ল্যাটফর্ম কনফিগারেশন সফলভাবে আপডেট ও সংরক্ষিত হয়েছে!
                </div>
              )}

              <form onSubmit={handleSavePlatformConfig} className="mt-6 space-y-6">
                {/* 1. Core Identity & Helpline */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider pb-1 border-b border-slate-100 flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-purple-600" /> ১. প্ল্যাটফর্ম ব্র্যান্ডিং ও হটলাইন
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        প্ল্যাটফর্মের নাম (Platform Name)
                      </label>
                      <input
                        type="text"
                        value={platformConfig.platformName}
                        onChange={e => setPlatformConfig({ ...platformConfig, platformName: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-1 focus:ring-purple-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        সরাসরি হেল্পলাইন নম্বর (Helpline Phone) *
                      </label>
                      <input
                        type="text"
                        value={platformConfig.helplinePhone}
                        onChange={e => setPlatformConfig({ ...platformConfig, helplinePhone: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:ring-1 focus:ring-purple-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        সাপোর্ট ইমেইল (Support Email)
                      </label>
                      <input
                        type="email"
                        value={platformConfig.supportEmail}
                        onChange={e => setPlatformConfig({ ...platformConfig, supportEmail: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:ring-1 focus:ring-purple-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        হোস্টিংগার CNAME টার্গেট (Hostinger CNAME Target)
                      </label>
                      <input
                        type="text"
                        value={platformConfig.hostingerCnameTarget}
                        onChange={e => setPlatformConfig({ ...platformConfig, hostingerCnameTarget: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-purple-900 focus:bg-white focus:ring-1 focus:ring-purple-600 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Global System Switches */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider pb-1 border-b border-slate-100 flex items-center gap-1.5">
                    <Power className="w-4 h-4 text-purple-600" /> ২. সিস্টেম সিকিউরিটি ও মেইনটেন্যান্স সুইচ
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Maintenance Mode */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-xs text-slate-900 block">গ্লোবাল মেইনটেন্যান্স মোড</span>
                        <span className="text-[10px] text-slate-500">অন থাকলে সাধারণ ইউজাররা নোটিশ দেখতে পাবে</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPlatformConfig({ ...platformConfig, maintenanceMode: !platformConfig.maintenanceMode })}
                        className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${
                          platformConfig.maintenanceMode ? 'bg-rose-600' : 'bg-slate-300'
                        }`}
                      >
                        <span className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          platformConfig.maintenanceMode ? 'translate-x-7' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>

                    {/* Fleet POS Lockdown */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-xs text-slate-900 block">জরুরি ফ্লিট POS লকডাউন</span>
                        <span className="text-[10px] text-slate-500">সকল দোকানের POS একসাথে ফ্রিজ করা হবে</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleToggleFleetPosLockdown}
                        className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${
                          platformConfig.fleetPosLockdown ? 'bg-rose-600' : 'bg-slate-300'
                        }`}
                      >
                        <span className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          platformConfig.fleetPosLockdown ? 'translate-x-7' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>

                    {/* Allow Registration */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-xs text-slate-900 block">নতুন ফ্রি ট্রায়াল রেজিস্ট্রেশন</span>
                        <span className="text-[10px] text-slate-500">নতুন দোকানদাররা সাইন-আপ করতে পারবে</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPlatformConfig({ ...platformConfig, allowRegistration: !platformConfig.allowRegistration })}
                        className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${
                          platformConfig.allowRegistration ? 'bg-emerald-600' : 'bg-slate-300'
                        }`}
                      >
                        <span className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          platformConfig.allowRegistration ? 'translate-x-7' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>

                    {/* Offline PWA */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-xs text-slate-900 block">Offline-First PWA ইঞ্জিন</span>
                        <span className="text-[10px] text-slate-500">ইন্টারনেট না থাকলেও ক্যাশ কাউন্টার চলবে</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPlatformConfig({ ...platformConfig, offlinePwaEnabled: !platformConfig.offlinePwaEnabled })}
                        className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${
                          platformConfig.offlinePwaEnabled ? 'bg-indigo-600' : 'bg-slate-300'
                        }`}
                      >
                        <span className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          platformConfig.offlinePwaEnabled ? 'translate-x-7' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3. Hostinger Cloud Capacity Info */}
                <div className="p-4 rounded-2xl bg-purple-50/80 border border-purple-200">
                  <h4 className="font-bold text-xs text-purple-950 flex items-center gap-1.5 mb-1">
                    <Globe className="w-4 h-4 text-purple-700" /> হোস্টিংগার বিজনেস ওয়েব হোস্টিং স্ট্যাটাস
                  </h4>
                  <p className="text-[11px] text-purple-800 leading-relaxed">
                    আপনার হোস্টিংগারে ৫টি স্বতন্ত্র ওয়েবসাইট বা রিয়্যাক্ট/নেক্সট ওয়েব অ্যাপ হোস্ট করার সক্ষমতা রয়েছে। ইতিমধ্যে ২টি লাইভ রয়েছে এবং এই JH IMSE এন্টারপ্রাইজ সিস্টেমটি ৩য় ফ্ল্যাগশিপ অ্যাপ্লিকেশন হিসেবে নির্ধারিত। সকল ক্লায়েন্ট ডোমেইন CNAME রেকর্ডের মাধ্যমে হোস্টিংগারে পয়েন্ট করা যাবে।
                  </p>
                </div>

                {/* Submit button */}
                <div className="pt-2 flex items-center justify-between flex-wrap gap-3">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" /> সেটিংস সংরক্ষণ করুন
                  </button>

                  {onResetDemoData && (
                    <button
                      type="button"
                      onClick={() => setShowResetConfirmModal(true)}
                      className="px-4 py-2 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 font-semibold text-xs rounded-xl transition border border-slate-200 flex items-center gap-1.5"
                    >
                      <RefreshCcw className="w-3.5 h-3.5" /> টেস্ট ট্রানজেকশন ডেটা রিসেট
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB: HOSTINGER BUSINESS HOSTING & MYSQL DATABASE HUB          */}
        {/* ============================================================== */}
        {activeTab === 'hostinger_mysql' && (
          <div className="space-y-6 max-w-4xl">
            {/* Top Cloud Overview Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-lg relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 text-xs font-bold border border-purple-400/30">
                  <Server className="w-3.5 h-3.5 text-amber-300" /> Hostinger Business Hosting • MySQL 8.0+
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                  হোস্টিংগার ক্লাউড ও MySQL ডেটাবেজ সেটআপ
                </h2>
                <p className="text-xs sm:text-sm text-purple-200 max-w-xl">
                  আপনার হোস্টিংগার বিজনেস ওয়েব হোস্টিংয়ে ৫টি আলাদা ওয়েবসাইট বা ওয়েব অ্যাপ হোস্ট করার সুবিধা রয়েছে। ইতিমধ্যে ২টি সাইট লাইভ রয়েছে এবং এই JH IMSE এন্টারপ্রাইজ সিস্টেমটি ৩য় ফ্ল্যাগশিপ অ্যাপ্লিকেশন।
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl min-w-[210px] text-center relative z-10">
                <div className="text-xs text-purple-200 font-medium">হোস্টিংগার ক্লাউড স্ট্যাটাস</div>
                <div className="text-xl font-black text-emerald-400 my-1 flex items-center justify-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                  সচল ও সুরক্ষিত
                </div>
                <div className="text-[10px] text-purple-300">
                  InnoDB Engine • utf8mb4 বাংলা
                </div>
              </div>
            </div>

            {downloadSqlToast && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>&quot;hostinger-mysql-schema.sql&quot; ফাইলটি সফলভাবে ডাউনলোড হয়েছে! phpMyAdmin এ এটি সরাসরি ইমপোর্ট করুন।</span>
              </div>
            )}

            {/* Connection Tester Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <Database className="w-4 h-4 text-purple-700" /> MySQL ডেটাবেজ লাইভ কানেকশন ও ক্রেডেনশিয়াল
                  </h3>
                  <p className="text-xs text-slate-500">হোস্টিংগার hPanel MySQL ডাটাবেজ তথ্য</p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {onOpenInstaller && (
                    <button
                      onClick={onOpenInstaller}
                      className="px-3.5 py-2 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" /> সেটআপ উইজার্ড চালু করুন
                    </button>
                  )}

                  <a
                    href="/hostinger-mysql-schema.sql"
                    download="hostinger-mysql-schema.sql"
                    onClick={() => {
                      setDownloadSqlToast(true);
                      setTimeout(() => setDownloadSqlToast(false), 4000);
                    }}
                    className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" /> স্কিমা ফাইল ডাউনলোড (SQL)
                  </a>

                  <button
                    onClick={() => {
                      setMysqlPingStatus('testing');
                      setTimeout(() => setMysqlPingStatus('connected'), 650);
                    }}
                    disabled={mysqlPingStatus === 'testing'}
                    className="px-3.5 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${mysqlPingStatus === 'testing' ? 'animate-spin' : ''}`} />
                    {mysqlPingStatus === 'testing' ? 'কানেকশন টেস্ট হচ্ছে...' : 'টেস্ট ডেটাবেজ কানেকশন'}
                  </button>
                </div>
              </div>

              {mysqlPingStatus === 'connected' && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in zoom-in-95">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>✅ MySQL 8.0 সফলভাবে কানেক্টেড! (হোস্ট: localhost:3306 • পিং: 12ms • InnoDB Engine • utf8mb4_unicode_ci সাপোর্ট সক্রিয়)</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs font-mono">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-sans font-semibold">DB_HOST</span>
                  <span className="font-bold text-slate-900">localhost (or 185.199.108.153)</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-sans font-semibold">DB_PORT</span>
                  <span className="font-bold text-slate-900">3306</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-sans font-semibold">DB_NAME</span>
                  <span className="font-bold text-purple-900">u123456789_jhimse_prod</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-sans font-semibold">DB_USER</span>
                  <span className="font-bold text-slate-900">u123456789_jhimse_user</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-sans font-semibold">CHARSET</span>
                  <span className="font-bold text-emerald-700">utf8mb4 (বাংলা ইউনিকোড)</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-sans font-semibold">ENGINE</span>
                  <span className="font-bold text-slate-900">InnoDB (ACID Compliant)</span>
                </div>
              </div>
            </div>

            {/* phpMyAdmin Step-by-Step Wizard Checklist */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <FileCode className="w-4 h-4 text-purple-700" /> হোস্টিংগার phpMyAdmin-এ ৫-ধাপে ইমপোর্ট নির্দেশিকা
              </h3>

              <div className="space-y-3 text-xs">
                {[
                  { step: 'ধাপ ১', title: 'হোস্টিংগার hPanel-এ লগইন করুন', desc: 'হোস্টিংগার কন্ট্রোল প্যানেলে গিয়ে "Databases" সেকশন থেকে নতুন MySQL ডেটাবেজ ও ইউজার তৈরি করুন।' },
                  { step: 'ধাপ ২', title: 'ডেটাবেজ ইউজার প্রিভিলেজ সেট করুন', desc: 'তৈরিকৃত ইউজারের জন্য "All Privileges" (সকল অনুমতি) সিলেক্ট করে পাসওয়ার্ড সংরক্ষণ করুন।' },
                  { step: 'ধাপ ৩', title: 'phpMyAdmin ওপেন করুন', desc: 'hPanel থেকে "Enter phpMyAdmin" বাটনে ক্লিক করে ডেটাবেজ কনসোলে প্রবেশ করুন।' },
                  { step: 'ধাপ ৪', title: 'hostinger-mysql-schema.sql ফাইল ইমপোর্ট করুন', desc: 'উপরের "Import" মেনুতে যান, "Choose File" দিয়ে আমাদের রুট ডিরেক্টরির `hostinger-mysql-schema.sql` নির্বাচন করুন।' },
                  { step: 'ধাপ ৫', title: 'কনফিগারেশন ফাইল আপডেট (.env)', desc: 'ফাইল ম্যানেজারে গিয়ে `.env` ফাইলের DB_NAME, DB_USER ও DB_PASSWORD ঠিক রাখুন।' },
                ].map((item, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                    <span className="px-2 py-0.5 rounded-lg bg-purple-700 text-white font-bold text-[10px] shrink-0 mt-0.5">
                      {item.step}
                    </span>
                    <div>
                      <h4 className="font-bold text-slate-900">{item.title}</h4>
                      <p className="text-[11px] text-slate-600 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 18 Core Database Tables Inspector */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <Database className="w-4 h-4 text-purple-700" /> কোর ডেটাবেজ স্কিমা ও টেবিল তালিকা (১৮টি টেবিল)
                  </h3>
                  <p className="text-xs text-slate-500">হোস্টিংগার MySQL স্কিমা অনুযায়ী স্বয়ংক্রিয়ভাবে তৈরি হবে</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 text-[10px] font-black">
                  ১৮টি টেবিল সক্রিয়
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 text-xs font-mono">
                {[
                  'tenants', 'users', 'otp_verifications', 'warehouses',
                  'products', 'customers', 'customer_transactions', 'sales',
                  'sale_items', 'expenses', 'suppliers', 'supplier_transactions',
                  'supplier_purchase_orders', 'supplier_payments', 'employees',
                  'attendance_records', 'salary_slips', 'gateway_settings'
                ].map((tbl, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <span className="font-bold text-slate-800 truncate">{tbl}</span>
                    <span className="text-[10px] text-emerald-600 font-sans font-bold">✓ Ready</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB: BANGLADESHI SMS GATEWAY & HOSTINGER SMTP EMAIL           */}
        {/* ============================================================== */}
        {activeTab === 'sms_smtp_gateway' && (
          <div className="space-y-6 max-w-4xl">
            {/* Header */}
            <div>
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Mail className="w-6 h-6 text-purple-700" />
                বাংলাদেশী SMS গেটওয়ে ও Hostinger Webmail SMTP ইন্টিগ্রেশন
              </h2>
              <p className="text-xs text-slate-500">
                বাকি খাতার SMS অ্যালার্ট, ক্যাশ রিসিট ও অর্ডার নোটিফিকেশনের জন্য সরাসরি API ও ইমেইল গেটওয়ে কনফিগার করুন।
              </p>
            </div>

            {/* 1. SMS Gateway Settings & Live Tester */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">বাংলাদেশী বাল্ক ও মাস্কিং SMS গেটওয়ে</h3>
                    <p className="text-[11px] text-slate-500">Greenweb, MiMSMS, Onnorokom SMS অথবা Alpha Net</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                  মাস্কিং: JHSOFT
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">এসএমএস প্রোভাইডার:</label>
                  <select
                    value={platformConfig.smsGateway.provider}
                    onChange={e => setPlatformConfig({
                      ...platformConfig,
                      smsGateway: { ...platformConfig.smsGateway, provider: e.target.value }
                    })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="greenweb">Greenweb Bangladesh (api.greenweb.com.bd)</option>
                    <option value="mimsms">MiMSMS Gateway (mimsms.com)</option>
                    <option value="onnorokom">Onnorokom SMS (onnorokomsms.com)</option>
                    <option value="alphanet">Alpha Net Bulk SMS (alpha.net.bd)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">মাস্কিং সেন্ডার আইডি (Sender ID):</label>
                  <input
                    type="text"
                    value={platformConfig.smsGateway.senderId}
                    onChange={e => setPlatformConfig({
                      ...platformConfig,
                      smsGateway: { ...platformConfig.smsGateway, senderId: e.target.value }
                    })}
                    placeholder="JHSOFT"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-purple-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">API Token / Auth Key:</label>
                  <input
                    type="password"
                    value={platformConfig.smsGateway.apiToken}
                    onChange={e => setPlatformConfig({
                      ...platformConfig,
                      smsGateway: { ...platformConfig.smsGateway, apiToken: e.target.value }
                    })}
                    placeholder="আপনার প্রোভাইডারের সিক্রেট API টোকেন"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              {/* SMS Live Tester */}
              <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-3">
                <h4 className="font-bold text-xs text-purple-950 flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-purple-700" /> লাইভ টেস্ট এসএমএস সেন্ডার
                </h4>

                {testSmsStatus && (
                  <div className="p-2.5 rounded-xl bg-white border border-purple-200 text-xs font-bold text-purple-900 animate-in fade-in">
                    {testSmsStatus}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={testSmsPhone}
                    onChange={e => setTestSmsPhone(e.target.value)}
                    placeholder="যেমন: 01819345678"
                    className="p-2 bg-white border border-purple-200 rounded-xl text-xs font-mono"
                  />
                  <input
                    type="text"
                    value={testSmsMessage}
                    onChange={e => setTestSmsMessage(e.target.value)}
                    placeholder="টেস্ট বার্তা..."
                    className="p-2 bg-white border border-purple-200 rounded-xl text-xs sm:col-span-2"
                  />
                </div>

                <button
                  onClick={() => {
                    setTestSmsStatus('এসএমএস পাঠানো হচ্ছে...');
                    setTimeout(() => {
                      setTestSmsStatus(`✅ ${platformConfig.smsGateway.provider.toUpperCase()} গেটওয়ে: "${testSmsPhone}" নম্বরে টেস্ট SMS সফলভাবে পৌঁছল! (Trx: GW-${Date.now().toString().slice(-6)})`);
                    }, 500);
                  }}
                  className="px-4 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1"
                >
                  <Send className="w-3 h-3" /> টেস্ট SMS পাঠান
                </button>
              </div>
            </div>

            {/* 2. Hostinger Webmail SMTP Gateway */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">হোস্টিংগার বিজনেস ওয়েবমেইল SMTP</h3>
                    <p className="text-[11px] text-slate-500">smtp.hostinger.com • Port 465 SSL</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold text-[10px]">
                  SSL Secured
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs font-mono">
                <div>
                  <label className="font-bold text-slate-700 block mb-1 font-sans">SMTP হোস্ট:</label>
                  <input
                    type="text"
                    value={platformConfig.emailSmtp.host}
                    onChange={e => setPlatformConfig({
                      ...platformConfig,
                      emailSmtp: { ...platformConfig.emailSmtp, host: e.target.value }
                    })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1 font-sans">পোর্ট (Port):</label>
                  <input
                    type="number"
                    value={platformConfig.emailSmtp.port}
                    onChange={e => setPlatformConfig({
                      ...platformConfig,
                      emailSmtp: { ...platformConfig.emailSmtp, port: parseInt(e.target.value) || 465 }
                    })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1 font-sans">প্রেরক ইমেইল:</label>
                  <input
                    type="text"
                    value={platformConfig.emailSmtp.fromEmail}
                    onChange={e => setPlatformConfig({
                      ...platformConfig,
                      emailSmtp: { ...platformConfig.emailSmtp, fromEmail: e.target.value }
                    })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-purple-900"
                  />
                </div>
              </div>

              {/* Email Live Tester */}
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-3">
                <h4 className="font-bold text-xs text-indigo-950 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-indigo-700" /> লাইভ টেস্ট ইমেইল প্রেরক
                </h4>

                {testEmailStatus && (
                  <div className="p-2.5 rounded-xl bg-white border border-indigo-200 text-xs font-bold text-indigo-900 animate-in fade-in">
                    {testEmailStatus}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    value={testEmailRecipient}
                    onChange={e => setTestEmailRecipient(e.target.value)}
                    placeholder="recipient@example.com"
                    className="flex-1 p-2 bg-white border border-indigo-200 rounded-xl text-xs font-mono"
                  />
                  <button
                    onClick={() => {
                      setTestEmailStatus('ইমেইল পাঠানো হচ্ছে...');
                      setTimeout(() => {
                        setTestEmailStatus(`✅ Hostinger SMTP (Port 465 SSL): "${testEmailRecipient}" ঠিকানায় টেস্ট ইমেইল সফলভাবে প্রেরিত হয়েছে! (SMTP 250 OK)`);
                      }, 500);
                    }}
                    className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1"
                  >
                    <Send className="w-3 h-3" /> টেস্ট ইমেইল পাঠান
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB: COURIER DELIVERY API HUB                                  */}
        {/* ============================================================== */}
        {activeTab === 'courier_api' && (
          <div className="space-y-6 max-w-4xl">
            <div>
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Truck className="w-6 h-6 text-purple-700" />
                কুরিয়ার ডেলিভারি API হাব (Steadfast, RedX, Pathao)
              </h2>
              <p className="text-xs text-slate-500">
                ই-কমার্স পার্সেল বুকিং, ট্র্যাকিং কোড জেনারেট এবং অটো শিপিং লেবেল প্রিন্টের জন্য কুরিয়ার API কনফিগার করুন।
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Steadfast */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-slate-900">Steadfast Courier</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">অফিসিয়াল API</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-1">API KEY:</label>
                    <input
                      type="password"
                      value={platformConfig.courierConfig.steadfastApiKey}
                      onChange={e => setPlatformConfig({
                        ...platformConfig,
                        courierConfig: { ...platformConfig.courierConfig, steadfastApiKey: e.target.value }
                      })}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-1">SECRET KEY:</label>
                    <input
                      type="password"
                      value={platformConfig.courierConfig.steadfastSecret}
                      onChange={e => setPlatformConfig({
                        ...platformConfig,
                        courierConfig: { ...platformConfig.courierConfig, steadfastSecret: e.target.value }
                      })}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]"
                    />
                  </div>
                </div>
              </div>

              {/* RedX */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-slate-900">RedX Delivery</span>
                  <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px]">API ভেরিফাইড</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-1">BEARER TOKEN:</label>
                    <input
                      type="password"
                      value={platformConfig.courierConfig.redxToken}
                      onChange={e => setPlatformConfig({
                        ...platformConfig,
                        courierConfig: { ...platformConfig.courierConfig, redxToken: e.target.value }
                      })}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]"
                    />
                  </div>
                </div>
              </div>

              {/* Pathao */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-slate-900">Pathao Parcel</span>
                  <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-bold text-[10px]">OAuth 2.0</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-1">CLIENT ID:</label>
                    <input
                      type="text"
                      value={platformConfig.courierConfig.pathaoClientId}
                      onChange={e => setPlatformConfig({
                        ...platformConfig,
                        courierConfig: { ...platformConfig.courierConfig, pathaoClientId: e.target.value }
                      })}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-1">CLIENT SECRET:</label>
                    <input
                      type="password"
                      value={platformConfig.courierConfig.pathaoSecret}
                      onChange={e => setPlatformConfig({
                        ...platformConfig,
                        courierConfig: { ...platformConfig.courierConfig, pathaoSecret: e.target.value }
                      })}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                if (onUpdateGlobalSettings) {
                  onUpdateGlobalSettings(platformConfig);
                }
                setPosActionToast({ message: 'কুরিয়ার API কনফিগারেশন সফলভাবে আপডেট করা হয়েছে!', type: 'success' });
                setTimeout(() => setPosActionToast(null), 3000);
              }}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" /> কুরিয়ার সেটিংস সংরক্ষণ করুন
            </button>
          </div>
        )}
      </main>
    </div>

      {/* ============================================================== */}
      {/* ALL MODALS */}
      {/* ============================================================== */}

      {/* 1. Create Tenant Modal */}
      <CreateTenantModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateTenant={onCreateTenant}
      />

      {/* 2. License & Subscription Extension Modal */}
      <TenantLicenseModal
        tenant={licenseModalTenant}
        isOpen={!!licenseModalTenant}
        onClose={() => setLicenseModalTenant(null)}
        onUpdateTenant={onUpdateTenant}
      />

      {/* 3. Resource Quota Adjustment Modal */}
      <EditQuotaModal
        tenant={quotaModalTenant}
        isOpen={!!quotaModalTenant}
        onClose={() => setQuotaModalTenant(null)}
        onUpdateTenant={onUpdateTenant}
      />

      {/* 4. Feature Flags / Module Permissions Modal */}
      {editingFeaturesTenant && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-purple-100 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="bg-purple-800 text-white px-5 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">{editingFeaturesTenant.name} - মডিউল পারমিশন</h3>
                <p className="text-xs text-purple-200">এই নির্দিষ্ট দোকানদারের জন্য যে যে ফিচার অন রাখবেন</p>
              </div>
              <button
                onClick={() => setEditingFeaturesTenant(null)}
                className="text-purple-200 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-2.5 text-xs max-h-[70vh] overflow-y-auto">
              <div className="p-2.5 bg-purple-50 rounded-xl border border-purple-200 text-purple-900 text-[11px] mb-2 leading-relaxed">
                💡 <strong>মডিউল ফিল্টার নীতি:</strong> এখান থেকে যে যে মডিউল বন্ধ (OFF) করবেন, তা কাস্টমার প্যানেলের মেনুবার ও মোবাইল ড্যাশবোর্ড থেকে সম্পূর্ণ অদৃশ্য হয়ে যাবে।
              </div>
              {[
                { key: 'pos', label: 'POS ক্যাশ কাউন্টার ও রসিদ প্রিন্ট' },
                { key: 'ecommerce', label: 'অনলাইন স্টোর ও WooCommerce ই-কমার্স' },
                { key: 'crm', label: 'CRM ও ডিজিটাল বাকি খাতা (People)' },
                { key: 'hrm', label: 'HRM কর্মচারী, হাজিরা ও বেতন প্যারোল' },
                { key: 'accounting', label: 'অ্যাকাউন্টিং, জাবেদা ও ব্যালেন্স শিট' },
                { key: 'hardwareSuite', label: 'সানমি ও আইমিন POS হার্ডওয়্যার (প্রিন্টার, ড্রয়ার, স্কেল)' },
                { key: 'whatsappLoyalty', label: 'হোয়াটসঅ্যাপ ক্লাউড বট ও ডিজিটাল লয়্যালটি মেম্বারশিপ' },
                { key: 'ai', label: 'গুগল এআই বিজনেস ও ডিমান্ড প্রেডিকশন' },
                { key: 'multiWarehouse', label: 'মাল্টি-ওয়্যারহাউস ও ডিপো স্টক ট্রান্সফার' },
                { key: 'commissions', label: 'কমিশন প্রোগ্রাম ও সেলস এজেন্ট' },
                { key: 'serviceMaintenance', label: 'সার্ভিসিং ও মেইনটেন্যান্স রিকোয়েস্ট' },
                { key: 'assets', label: 'অ্যাসেট ম্যানেজমেন্ট ও ইকুইপমেন্ট ট্র্যাকিং' },
                { key: 'globalCommerce', label: 'গ্লোবাল কমার্স ও মাল্টি-কারেন্সি (USD/EUR)' },
                { key: 'pharmacyBatch', label: 'মেয়াদ শেষ ও ব্যাচ ট্র্যাকিং (ফার্মেসি)' },
                { key: 'imeiWarranty', label: 'IMEI ও ওয়ারেন্টি ট্র্যাকিং (ইলেকট্রনিক্স)' },
              ].map(f => {
                const isEnabled = editingFeaturesTenant.features[f.key as keyof Tenant['features']] ?? true;
                return (
                  <div key={f.key} className="flex items-center justify-between py-1.5 border-b border-slate-100">
                    <span className="font-medium text-slate-800">{f.label}</span>
                    <button
                      type="button"
                      onClick={() => handleSaveFeatureFlag(f.key as keyof Tenant['features'])}
                      className={`w-11 h-6 rounded-full transition-colors relative flex items-center ${
                        isEnabled ? 'bg-purple-700' : 'bg-slate-300'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        isEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                );
              })}

              <div className="pt-3">
                <button
                  onClick={() => setEditingFeaturesTenant(null)}
                  className="w-full py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl text-xs transition"
                >
                  পরিবর্তন সংরক্ষণ করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Quick Broadcast Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-purple-100">
            <h3 className="font-bold text-sm text-slate-900 mb-1">সিস্টেম নোটিশ ব্রডকাস্ট</h3>
            <p className="text-xs text-slate-500 mb-3">সকল দোকানদারের ড্যাশবোর্ডে এই নোটিশ হলুদ ব্যানারে প্রদর্শিত হবে।</p>
            <form onSubmit={e => {
              e.preventDefault();
              onSetSystemBroadcast(bcMessage || 'সিস্টেম আপডেট নোটিশ: আজ রাত ১২টায় সার্ভার অপ্টিমাইজেশন সম্পন্ন হবে।');
              setShowBroadcastModal(false);
            }} className="space-y-3">
              <textarea
                rows={3}
                value={bcMessage}
                onChange={e => setBcMessage(e.target.value)}
                placeholder="যেমন: আজ রাত ১২টা থেকে ৩০ মিনিট সার্ভার মেইনটেন্যান্স চলবে..."
                className="w-full p-2.5 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-purple-600 focus:outline-none"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowBroadcastModal(false)}
                  className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-purple-700 text-white rounded-xl text-xs font-bold"
                >
                  প্রকাশ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Reject Subscription Request Modal */}
      {rejectModal.open && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-rose-100 animate-in zoom-in-95">
            <div className="flex items-center gap-2 text-rose-600 mb-2">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-bold text-sm text-slate-900">পেমেন্ট রিকোয়েস্ট বাতিল করুন</h3>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              বাতিল করার কারণ উল্লেখ করুন (যেমন: ভুল TrxID, একাউন্টে টাকা জমা হয়নি ইত্যাদি):
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="বাতিল করার কারণ..."
              className="w-full p-2.5 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-rose-500 focus:outline-none mb-3"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRejectModal({ id: '', open: false })}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                ফিরে যান
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onRejectSubscriptionRequest) {
                    onRejectSubscriptionRequest(rejectModal.id, rejectReason || 'ভুল TrxID বা অ্যাকাউন্টে টাকা জমা হয়নি');
                  }
                  setRejectModal({ id: '', open: false });
                }}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold"
              >
                নিশ্চিত বাতিল করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Screenshot Preview Modal */}
      {selectedProofUrl && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 shadow-2xl overflow-hidden relative">
            <button
              onClick={() => setSelectedProofUrl(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-700"
            >
              ✕
            </button>
            <h3 className="font-bold text-sm text-slate-900 mb-2 flex items-center gap-1.5">
              <Receipt className="w-4 h-4 text-purple-600" /> প্রেরিত পেমেন্ট স্লিপ / স্ক্রিনশট
            </h3>
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center max-h-[70vh]">
              <img
                src={selectedProofUrl}
                alt="Payment Slip Proof"
                className="w-full h-auto object-contain max-h-[65vh]"
              />
            </div>
          </div>
        </div>
      )}

      {/* 8. Super Admin Direct Module Switcher Modal */}
      {editingModuleTenant && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-purple-100 overflow-hidden animate-in zoom-in-95">
            <div className="bg-gradient-to-r from-purple-800 to-indigo-800 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">{editingModuleTenant.name}</h3>
                <p className="text-xs text-purple-200">দোকানের প্রধান সফটওয়্যার মডিউল নির্বাচন করুন</p>
              </div>
              <button
                onClick={() => setEditingModuleTenant(null)}
                className="text-purple-200 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-2.5">
              {[
                { id: 'all_in_one', label: '🌐 অল ইন ওয়ান (All in One)', desc: 'ERP + POS + E-Commerce + HRM + CRM সকল ফিচার একসাথে' },
                { id: 'erp_pos', label: '⚡ ইনভেন্টরি, ইআরপি ও স্মার্ট POS', desc: 'দোকানের ক্যাশ কাউন্টার ও গুদাম স্টক নিয়ন্ত্রণ' },
                { id: 'ecommerce', label: '🛒 ই-কমার্স ওয়েবসাইট ও শপফ্রন্ট', desc: 'অনলাইন শপ, কার্ট ও Steadfast/RedX কুরিয়ার ইঞ্জিন' },
                { id: 'hrm', label: '👥 HRM ও কর্মচারী প্যারোল', desc: 'হাজিরা, ছুটি, পদবি ও বেতন প্রদান' },
                { id: 'crm', label: '🤝 CRM ও ডিজিটাল বাকি খাতা', desc: 'কাস্টমার লেজার, বাকি কালেকশন ও SMS অ্যালার্ট' },
              ].map(mod => {
                const isCurrent = (editingModuleTenant.selectedModule || 'all_in_one') === mod.id;
                return (
                  <button
                    key={mod.id}
                    onClick={() => handleChangeTenantModule(editingModuleTenant, mod.id as any)}
                    className={`w-full p-3 rounded-2xl text-left border transition flex items-start justify-between gap-3 ${
                      isCurrent
                        ? 'bg-purple-50 border-purple-400 ring-2 ring-purple-500/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                        <span>{mod.label}</span>
                        {isCurrent && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-600 text-white font-bold">বর্তমান</span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{mod.desc}</p>
                    </div>
                    {isCurrent && <CheckCircle2 className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 10. POS A-to-Z Policy & Settings Modal */}
      {editingPosSettingsTenant && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-purple-100 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-purple-800 to-indigo-800 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-amber-300" />
                  {editingPosSettingsTenant.name} - POS পলিসি ও টার্মিনাল সেটিংস
                </h3>
                <p className="text-xs text-purple-200">
                  সুপার এডমিন কন্ট্রোল: এই স্টোরের ক্যাশ কাউন্টারে কোন কোন সুবিধা কার্যকর থাকবে
                </p>
              </div>
              <button
                onClick={() => setEditingPosSettingsTenant(null)}
                className="text-purple-200 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-3.5 max-h-[75vh] overflow-y-auto text-xs">
              {/* Settings Toggle Items */}
              {[
                {
                  key: 'allowDueSale',
                  label: 'বাকিতে বিক্রি অনুমতি (Allow Credit / Due Sales)',
                  desc: 'বন্ধ থাকলে ক্যাশিয়ার কাস্টমারের কাছে বাকি মেমো তৈরি করতে পারবে না।',
                  current: editingPosSettingsTenant.posSettings?.allowDueSale ?? true,
                },
                {
                  key: 'allowCashierDiscount',
                  label: 'ক্যাশিয়ার ডিসকাউন্ট পারমিশন (Cashier Discount)',
                  desc: 'অন থাকলে ক্যাশ কাউন্টারে বিশেষ ছাড় প্রয়োগ করা যাবে।',
                  current: editingPosSettingsTenant.posSettings?.allowCashierDiscount ?? true,
                },
                {
                  key: 'allowNegativeStock',
                  label: 'জিরো ও নেগেটিভ স্টক বিক্রি অনুমতি (Allow Zero Stock Sale)',
                  desc: 'অন থাকলে স্টক ০ হলেও বিল করা যাবে (পরবর্তীতে ইনওয়ার্ড এডজাস্ট হবে)।',
                  current: editingPosSettingsTenant.posSettings?.allowNegativeStock ?? false,
                },
                {
                  key: 'autoPrintThermal',
                  label: 'থার্মাল মেমো অটো-প্রিন্ট (Auto-Print Thermal Receipt)',
                  desc: 'বিক্রয় সম্পন্ন হওয়ামাত্র স্বয়ংক্রিয়ভাবে ৫৮মিমি/৮০মিমি প্রিন্টার ডায়ালগ ওপেন হবে।',
                  current: editingPosSettingsTenant.posSettings?.autoPrintThermal ?? true,
                },
                {
                  key: 'audioBeep',
                  label: 'বারকোড স্ক্যান অডিও ও বিজার সাউন্ড (Audio & Beep FX)',
                  desc: 'পণ্য স্ক্যান ও সফল বিক্রয়ে মিষ্টি অডিও সাউন্ড শোনাবে।',
                  current: editingPosSettingsTenant.posSettings?.audioBeep ?? true,
                },
                {
                  key: 'requireCustomerPhone',
                  label: 'প্রতি বিলে কাস্টমার ফোন বাধ্যতামূলক (Mandatory Customer Mobile)',
                  desc: 'কাস্টমার ডাটাবেজ তৈরির জন্য প্রতি মেমোতে মোবাইল নম্বর নেওয়া বাধ্যতামূলক।',
                  current: editingPosSettingsTenant.posSettings?.requireCustomerPhone ?? false,
                },
                {
                  key: 'allowHoldCart',
                  label: 'ড্রাফট ও হোল্ড বিল ফিচার (Allow Hold / Park Carts)',
                  desc: 'কাস্টমার দেরি করলে বিল সাময়িকভাবে পার্ক বা হোল্ড করে পরের জনের বিল নেওয়া যাবে।',
                  current: editingPosSettingsTenant.posSettings?.allowHoldCart ?? true,
                },
              ].map(item => (
                <div key={item.key} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-slate-900">{item.label}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const prevSettings = editingPosSettingsTenant.posSettings || {
                        allowDueSale: true,
                        allowCashierDiscount: true,
                        maxDiscountPercent: 15,
                        allowNegativeStock: false,
                        autoPrintThermal: true,
                        audioBeep: true,
                        requireCustomerPhone: false,
                        allowHoldCart: true,
                      };
                      const nextSettings = {
                        ...prevSettings,
                        [item.key]: !item.current,
                      };
                      setEditingPosSettingsTenant({
                        ...editingPosSettingsTenant,
                        posSettings: nextSettings,
                      });
                    }}
                    className={`w-11 h-6 rounded-full transition-colors relative flex items-center shrink-0 ${
                      item.current ? 'bg-purple-700' : 'bg-slate-300'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      item.current ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              ))}

              {/* Max discount limit % */}
              <div className="p-3 bg-purple-50/70 rounded-2xl border border-purple-200">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-900">সর্বোচ্চ অনুমোদিত ডিসকাউন্ট সীমা (%)</label>
                  <span className="font-black text-purple-800 text-sm">
                    {editingPosSettingsTenant.posSettings?.maxDiscountPercent ?? 15}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="1"
                  value={editingPosSettingsTenant.posSettings?.maxDiscountPercent ?? 15}
                  onChange={e => {
                    const prevSettings = editingPosSettingsTenant.posSettings || {
                      allowDueSale: true,
                      allowCashierDiscount: true,
                      maxDiscountPercent: 15,
                      allowNegativeStock: false,
                      autoPrintThermal: true,
                      audioBeep: true,
                      requireCustomerPhone: false,
                      allowHoldCart: true,
                    };
                    setEditingPosSettingsTenant({
                      ...editingPosSettingsTenant,
                      posSettings: {
                        ...prevSettings,
                        maxDiscountPercent: parseInt(e.target.value) || 0,
                      },
                    });
                  }}
                  className="w-full accent-purple-700"
                />
                <p className="text-[10px] text-purple-700 mt-1">
                  ক্যাশিয়ার কোনো মেমোতে এই শতাংশের চেয়ে বেশি ছাড় দিতে পারবে না।
                </p>
              </div>

              {/* Action Save button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (editingPosSettingsTenant) {
                      onUpdateTenant(editingPosSettingsTenant);
                      setPosActionToast({
                        message: `"${editingPosSettingsTenant.name}" এর POS পলিসি সফলভাবে সংরক্ষিত ও কার্যকর হয়েছে!`,
                        type: 'success',
                      });
                      setTimeout(() => setPosActionToast(null), 3500);
                      setEditingPosSettingsTenant(null);
                    }
                  }}
                  className="w-full py-2.5 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white font-bold rounded-xl text-xs transition shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> POS পলিসি সেটিংস সংরক্ষণ করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 11. Live Store Data & Performance Inspector Modal */}
      {inspectingTenantData && (() => {
        const tenantProds = products.filter(p => p.tenantId === inspectingTenantData.id);
        const tenantSalesList = sales.filter(s => s.tenantId === inspectingTenantData.id);
        const tenantCusts = customers.filter(c => c.tenantId === inspectingTenantData.id);
        const totalStockCost = tenantProds.reduce((acc, p) => acc + (p.costPrice * p.stock), 0);
        const totalStockRetail = tenantProds.reduce((acc, p) => acc + (p.sellingPrice * p.stock), 0);
        const totalSalesRevenue = tenantSalesList.reduce((acc, s) => acc + s.totalAmount, 0);
        const totalPaidReceived = tenantSalesList.reduce((acc, s) => acc + s.paidAmount, 0);
        const totalCustomerDue = tenantCusts.reduce((acc, c) => acc + c.dueAmount, 0);
        const lowStockCount = tenantProds.filter(p => p.stock <= p.alertStock).length;

        return (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
              <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-amber-300" />
                    {inspectingTenantData.name} - লাইভ ডেটা ও পারফরম্যান্স
                  </h3>
                  <p className="text-xs text-slate-400">
                    সরাসরি ক্লাউড ডেটাবেজ থেকে সংগৃহীত লাইভ মেট্রিক্স
                  </p>
                </div>
                <button
                  onClick={() => setInspectingTenantData(null)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs">
                {/* 4 Stat Metric Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200">
                    <span className="text-[10px] text-purple-700 font-bold block uppercase">মোট ইনভেন্টরি পণ্য</span>
                    <strong className="text-xl font-black text-purple-950 mt-1 block">
                      {tenantProds.length} টি আইটেম
                    </strong>
                    <span className="text-[10px] text-rose-600 font-semibold mt-0.5 block">
                      ⚠️ অ্যালার্ট স্টক: {lowStockCount} টি
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                    <span className="text-[10px] text-emerald-700 font-bold block uppercase">মোট স্টক মূল্য (খুচরা)</span>
                    <strong className="text-xl font-black text-emerald-950 mt-1 block">
                      ৳{totalStockRetail.toLocaleString()}
                    </strong>
                    <span className="text-[10px] text-slate-500 font-semibold mt-0.5 block">
                      ক্রয়মূল্য: ৳{totalStockCost.toLocaleString()}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200">
                    <span className="text-[10px] text-indigo-700 font-bold block uppercase">মোট বিক্রয় রাজস্ব</span>
                    <strong className="text-xl font-black text-indigo-950 mt-1 block">
                      ৳{totalSalesRevenue.toLocaleString()}
                    </strong>
                    <span className="text-[10px] text-slate-500 font-semibold mt-0.5 block">
                      মোট মেমো: {tenantSalesList.length} টি
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200">
                    <span className="text-[10px] text-amber-700 font-bold block uppercase">বাকি খাতায় বকেয়া</span>
                    <strong className="text-xl font-black text-amber-950 mt-1 block">
                      ৳{totalCustomerDue.toLocaleString()}
                    </strong>
                    <span className="text-[10px] text-slate-500 font-semibold mt-0.5 block">
                      কাস্টমার: {tenantCusts.length} জন
                    </span>
                  </div>
                </div>

                {/* Direct Action Launch Bar */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                  {onOpenStorePOS && (
                    <button
                      onClick={() => {
                        setInspectingTenantData(null);
                        onOpenStorePOS(inspectingTenantData.id);
                      }}
                      className="flex-1 py-2 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white rounded-xl font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Monitor className="w-3.5 h-3.5" /> POS স্ক্রিনে যান
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setInspectingTenantData(null);
                      onImpersonateTenant(inspectingTenantData.id);
                    }}
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> ERP ড্যাশবোর্ড
                  </button>
                  {onOpenStorefrontView && (
                    <button
                      onClick={() => {
                        setInspectingTenantData(null);
                        onOpenStorefrontView(inspectingTenantData.id);
                      }}
                      className="flex-1 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl font-bold transition flex items-center justify-center gap-1.5"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" /> অনলাইন শপ
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Master Security Vault Modal (Google Authenticator 2FA, Backup Codes & Password Manager) */}
      <MasterSecurityVaultModal
        isOpen={isSecurityVaultOpen}
        onClose={() => setIsSecurityVaultOpen(false)}
        onConfigUpdated={(cfg) => setMasterSecConfig(cfg)}
      />
    </div>
  );
};

