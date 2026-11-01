import React, { useState, useMemo } from 'react';
import { 
  Users, UserCheck, Shield, Key, ExternalLink, Copy, Check, Plus, 
  Search, Filter, Globe, Building2, CheckCircle2, XCircle, AlertTriangle, 
  Clock, DollarSign, Calendar, FileText, Printer, ArrowRight, Download, 
  Sparkles, Eye, ShieldCheck, Tag, ShoppingCart, Truck, CreditCard, 
  Lock, RefreshCw, Send, Mail, Phone, MapPin, Wrench, ChevronRight
} from 'lucide-react';
import { 
  Customer, Tenant, Sale, OnlineOrder, ServiceJobTicket, CommercialContract, 
  AppointmentBooking, B2BInviteCode, PendingCustomerApplication, 
  ClientPortalDuePaymentClaim, CustomerType, LoyaltyTier 
} from '../../types';

interface PeopleAndClientPortalHubProps {
  tenant: Tenant;
  customers: Customer[];
  sales: Sale[];
  onlineOrders: OnlineOrder[];
  serviceTickets?: ServiceJobTicket[];
  contracts?: CommercialContract[];
  bookings?: AppointmentBooking[];
  inviteCodes: B2BInviteCode[];
  pendingApplications: PendingCustomerApplication[];
  portalPaymentClaims: ClientPortalDuePaymentClaim[];
  initialTab?: 'segmentation' | 'invite_codes' | 'pending_applications' | 'client_portal';
  initialFilter?: 'all' | 'with_login' | 'without_login' | 'over_limit';
  onAddCustomer: (customerData: Omit<Customer, 'id'>, existingId?: string) => void;
  onUpdateCustomerPortalAccess: (customerId: string, portalData: {
    hasLoginAccount: boolean;
    portalUsername?: string;
    portalPassword?: string;
    portalStatus?: 'active' | 'suspended' | 'invited';
  }) => void;
  onSaveInviteCode: (code: B2BInviteCode) => void;
  onDeleteInviteCode: (codeId: string) => void;
  onApproveApplication: (applicationId: string, assignedCreditLimit: number) => void;
  onRejectApplication: (applicationId: string, reason: string) => void;
  onCreateApplication: (appData: Omit<PendingCustomerApplication, 'id' | 'applicationNo' | 'appliedDate' | 'status'>) => void;
  onSubmitPortalPaymentClaim: (claim: Omit<ClientPortalDuePaymentClaim, 'id' | 'submittedAt' | 'status'>) => void;
  onVerifyPortalPaymentClaim: (claimId: string, isApproved: boolean) => void;
  onOpenCustomerLedger?: (customer: Customer) => void;
  onOpenReceivePayment?: (customer: Customer) => void;
  onSendSmsReminder?: (customer: Customer) => void;
  onOpenA4Invoice?: (sale: Sale) => void;
}

export const PeopleAndClientPortalHub: React.FC<PeopleAndClientPortalHubProps> = ({
  tenant,
  customers,
  sales,
  onlineOrders,
  serviceTickets = [],
  contracts = [],
  bookings = [],
  inviteCodes,
  pendingApplications,
  portalPaymentClaims,
  initialTab = 'segmentation',
  initialFilter = 'all',
  onAddCustomer,
  onUpdateCustomerPortalAccess,
  onSaveInviteCode,
  onDeleteInviteCode,
  onApproveApplication,
  onRejectApplication,
  onCreateApplication,
  onSubmitPortalPaymentClaim,
  onVerifyPortalPaymentClaim,
  onOpenCustomerLedger,
  onOpenReceivePayment,
  onSendSmsReminder,
  onOpenA4Invoice,
}) => {
  // Navigation Sub-tab
  const [activeTab, setActiveTab] = useState<'segmentation' | 'invite_codes' | 'pending_applications' | 'client_portal'>(initialTab);
  
  // Segmentation Tab Filters
  const [segmentFilter, setSegmentFilter] = useState<'all' | 'with_login' | 'without_login' | 'over_limit' | 'vip' | 'wholesale'>(initialFilter);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // Portal Management Modal State
  const [selectedCustomerForPortal, setSelectedCustomerForPortal] = useState<Customer | null>(null);
  const [portalUsernameInput, setPortalUsernameInput] = useState('');
  const [portalPasswordInput, setPortalPasswordInput] = useState('');
  const [portalStatusInput, setPortalStatusInput] = useState<'active' | 'invited' | 'suspended'>('active');

  // Customer Portal Simulator State
  const [activePortalCustomerId, setActivePortalCustomerId] = useState<string>(() => {
    const defaultCust = customers.find(c => c.hasLoginAccount) || customers[0];
    return defaultCust ? defaultCust.id : '';
  });
  const [portalViewSection, setPortalViewSection] = useState<'overview' | 'invoices' | 'pay_due' | 'repairs' | 'bookings'>('overview');

  // Portal Due Payment Form State
  const [portalPayAmount, setPortalPayAmount] = useState('');
  const [portalPayMethod, setPortalPayMethod] = useState<'bkash' | 'nagad' | 'bank' | 'rocket'>('bkash');
  const [portalPayTrxId, setPortalPayTrxId] = useState('');
  const [portalPayNote, setPortalPayNote] = useState('');

  // Create Invite Code Modal State
  const [isCreateInviteModalOpen, setIsCreateInviteModalOpen] = useState(false);
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [inviteDescInput, setInviteDescInput] = useState('');
  const [inviteTierInput, setInviteTierInput] = useState<CustomerType>('wholesale');
  const [inviteDiscountInput, setInviteDiscountInput] = useState('10');
  const [inviteCreditLimitInput, setInviteCreditLimitInput] = useState('50000');
  const [inviteMaxRedemptionsInput, setInviteMaxRedemptionsInput] = useState('20');
  const [inviteValidUntilInput, setInviteValidUntilInput] = useState('2027-12-31');

  // Create Manual B2B Application Modal
  const [isManualAppModalOpen, setIsManualAppModalOpen] = useState(false);
  const [appBusinessName, setAppBusinessName] = useState('');
  const [appOwnerName, setAppOwnerName] = useState('');
  const [appPhone, setAppPhone] = useState('');
  const [appEmail, setAppEmail] = useState('');
  const [appAddress, setAppAddress] = useState('');
  const [appCustomerType, setAppCustomerType] = useState<CustomerType>('wholesale');
  const [appTradeLicense, setAppTradeLicense] = useState('');
  const [appBinTax, setAppBinTax] = useState('');
  const [appRequestedCredit, setAppRequestedCredit] = useState('30000');
  const [appInviteCode, setAppInviteCode] = useState('');

  // Rejection Reason Modal
  const [rejectingAppId, setRejectingAppId] = useState<string | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');

  // Quick Customer Creation Modal
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');
  const [newCustType, setNewCustType] = useState<CustomerType>('retail');
  const [newCustCreditLimit, setNewCustCreditLimit] = useState('10000');
  const [newCustEnablePortal, setNewCustEnablePortal] = useState(false);
  const [newCustPortalUsername, setNewCustPortalUsername] = useState('');
  const [newCustPortalPassword, setNewCustPortalPassword] = useState('');

  // Sync initial tab when props change
  React.useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  React.useEffect(() => {
    if (initialFilter) setSegmentFilter(initialFilter);
  }, [initialFilter]);

  // Tenant-specific Customers
  const tenantCustomers = useMemo(() => {
    return customers.filter(c => c.tenantId === tenant.id);
  }, [customers, tenant.id]);

  // Filtered Customers based on Segments
  const filteredCustomers = useMemo(() => {
    return tenantCustomers.filter(c => {
      // Segment filter
      if (segmentFilter === 'with_login' && !c.hasLoginAccount) return false;
      if (segmentFilter === 'without_login' && c.hasLoginAccount) return false;
      if (segmentFilter === 'over_limit') {
        const limit = c.creditLimit || 0;
        if (limit <= 0 || c.dueAmount <= limit) return false;
      }
      if (segmentFilter === 'vip' && c.loyaltyTier !== 'vip' && c.loyaltyTier !== 'platinum') return false;
      if (segmentFilter === 'wholesale' && c.customerType !== 'wholesale' && c.customerType !== 'corporate' && c.customerType !== 'distributor') return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = c.name.toLowerCase().includes(q);
        const matchPhone = c.phone.includes(q);
        const matchEmail = (c.email || '').toLowerCase().includes(q);
        const matchCompany = (c.company || '').toLowerCase().includes(q);
        const matchUsername = (c.portalUsername || '').toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchEmail && !matchCompany && !matchUsername) return false;
      }

      return true;
    });
  }, [tenantCustomers, segmentFilter, searchQuery]);

  // Aggregate Metrics
  const withLoginCount = tenantCustomers.filter(c => c.hasLoginAccount).length;
  const withoutLoginCount = tenantCustomers.filter(c => !c.hasLoginAccount).length;
  const totalDueAmount = tenantCustomers.reduce((sum, c) => sum + c.dueAmount, 0);
  const overLimitCount = tenantCustomers.filter(c => (c.creditLimit || 0) > 0 && c.dueAmount > (c.creditLimit || 0)).length;
  const wholesaleB2BCount = tenantCustomers.filter(c => c.customerType === 'wholesale' || c.customerType === 'corporate' || c.customerType === 'distributor').length;

  const tenantInviteCodes = inviteCodes.filter(i => i.tenantId === tenant.id);
  const tenantApplications = pendingApplications.filter(a => a.tenantId === tenant.id);
  const pendingAppsCount = tenantApplications.filter(a => a.status === 'pending').length;
  const tenantPaymentClaims = portalPaymentClaims.filter(p => p.tenantId === tenant.id);
  const submittedClaimsCount = tenantPaymentClaims.filter(p => p.status === 'submitted').length;

  // Active Customer for Portal Simulation
  const currentPortalCustomer = useMemo(() => {
    return tenantCustomers.find(c => c.id === activePortalCustomerId) || tenantCustomers[0];
  }, [tenantCustomers, activePortalCustomerId]);

  // Sales and Orders for Portal Customer
  const customerSales = useMemo(() => {
    if (!currentPortalCustomer) return [];
    return sales.filter(s => s.tenantId === tenant.id && (s.customerId === currentPortalCustomer.id || s.customerPhone === currentPortalCustomer.phone));
  }, [sales, tenant.id, currentPortalCustomer]);

  const customerOrders = useMemo(() => {
    if (!currentPortalCustomer) return [];
    return onlineOrders.filter(o => o.tenantId === tenant.id && (o.customerPhone === currentPortalCustomer.phone || o.customerName === currentPortalCustomer.name));
  }, [onlineOrders, tenant.id, currentPortalCustomer]);

  const customerServiceTickets = useMemo(() => {
    if (!currentPortalCustomer) return [];
    return serviceTickets.filter(t => t.tenantId === tenant.id && (t.customerId === currentPortalCustomer.id || t.customerPhone === currentPortalCustomer.phone));
  }, [serviceTickets, tenant.id, currentPortalCustomer]);

  const customerContracts = useMemo(() => {
    if (!currentPortalCustomer) return [];
    return contracts.filter(c => c.tenantId === tenant.id && (c.partyName.toLowerCase().includes(currentPortalCustomer.name.toLowerCase()) || (currentPortalCustomer.company && c.partyName.toLowerCase().includes(currentPortalCustomer.company.toLowerCase()))));
  }, [contracts, tenant.id, currentPortalCustomer]);

  const customerBookings = useMemo(() => {
    if (!currentPortalCustomer) return [];
    return bookings.filter(b => b.tenantId === tenant.id && (b.customerId === currentPortalCustomer.id || b.customerPhone === currentPortalCustomer.phone));
  }, [bookings, tenant.id, currentPortalCustomer]);

  const customerClaims = useMemo(() => {
    if (!currentPortalCustomer) return [];
    return tenantPaymentClaims.filter(p => p.customerId === currentPortalCustomer.id);
  }, [tenantPaymentClaims, currentPortalCustomer]);

  // Handlers
  const handleOpenPortalSettings = (cust: Customer) => {
    setSelectedCustomerForPortal(cust);
    setPortalUsernameInput(cust.portalUsername || cust.phone.replace(/[^0-9]/g, '').slice(-8));
    setPortalPasswordInput(cust.portalPassword || 'ClientPass123!');
    setPortalStatusInput(cust.portalStatus || 'active');
  };

  const handleSavePortalAccess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerForPortal) return;
    onUpdateCustomerPortalAccess(selectedCustomerForPortal.id, {
      hasLoginAccount: true,
      portalUsername: portalUsernameInput.trim(),
      portalPassword: portalPasswordInput.trim(),
      portalStatus: portalStatusInput,
    });
    setSelectedCustomerForPortal(null);
  };

  const handleLaunchPortalForCustomer = (cust: Customer) => {
    setActivePortalCustomerId(cust.id);
    setActiveTab('client_portal');
    setPortalViewSection('overview');
  };

  const handleCopyLink = (code: string, id: string) => {
    const inviteLink = `https://${tenant.slug}.jh-imse.shop/b2b-register?invite=${code}`;
    navigator.clipboard.writeText(inviteLink);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2500);
  };

  const handleCreateInviteCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCode: B2BInviteCode = {
      id: 'inv-' + Date.now(),
      tenantId: tenant.id,
      code: (inviteCodeInput || 'VIP-' + Math.random().toString(36).substring(2, 7).toUpperCase()).trim().toUpperCase(),
      description: inviteDescInput.trim(),
      tier: inviteTierInput,
      discountPct: parseFloat(inviteDiscountInput) || 0,
      defaultCreditLimit: parseFloat(inviteCreditLimitInput) || 0,
      maxRedemptions: parseInt(inviteMaxRedemptionsInput, 10) || 10,
      timesRedeemed: 0,
      validUntil: inviteValidUntilInput || '2027-12-31',
      status: 'active',
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    };
    onSaveInviteCode(newCode);
    setIsCreateInviteModalOpen(false);
    setInviteCodeInput('');
    setInviteDescInput('');
  };

  const handleCreateManualAppSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateApplication({
      tenantId: tenant.id,
      businessName: appBusinessName.trim(),
      ownerName: appOwnerName.trim(),
      phone: appPhone.trim(),
      email: appEmail.trim(),
      address: appAddress.trim(),
      customerType: appCustomerType,
      tradeLicenseNo: appTradeLicense.trim(),
      binTaxNo: appBinTax.trim(),
      requestedCreditLimit: parseFloat(appRequestedCredit) || 0,
      inviteCodeUsed: appInviteCode.trim(),
    });
    setIsManualAppModalOpen(false);
    setAppBusinessName('');
    setAppOwnerName('');
    setAppPhone('');
    setAppEmail('');
  };

  const handleConfirmReject = () => {
    if (!rejectingAppId) return;
    onRejectApplication(rejectingAppId, rejectionReasonInput || 'ট্রেড লাইসেন্স বা নথিপত্র অসম্পূর্ণ।');
    setRejectingAppId(null);
    setRejectionReasonInput('');
  };

  const handleSubmitClaimFromPortal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPortalCustomer) return;
    const amount = parseFloat(portalPayAmount);
    if (!amount || amount <= 0) {
      alert('সঠিক পরিশোধের টাকার পরিমাণ দিন।');
      return;
    }
    onSubmitPortalPaymentClaim({
      tenantId: tenant.id,
      customerId: currentPortalCustomer.id,
      customerName: currentPortalCustomer.name,
      customerPhone: currentPortalCustomer.phone,
      amount,
      paymentMethod: portalPayMethod,
      transactionId: portalPayTrxId.trim() || 'TRX-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      bankAccountDetails: `${tenant.name} Official Payment Account`,
      note: portalPayNote.trim(),
    });
    setPortalPayAmount('');
    setPortalPayTrxId('');
    setPortalPayNote('');
    alert('আপনার পরিশোধ জমা সফলভাবে পাঠানো হয়েছে! অ্যাডমিন শীঘ্রই যাচাই করে বকেয়া সমন্বয় করবেন।');
  };

  const handleAddQuickCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    const newCust: Omit<Customer, 'id'> = {
      tenantId: tenant.id,
      name: newCustName.trim(),
      phone: newCustPhone.trim(),
      email: newCustEmail.trim() || undefined,
      address: newCustAddress.trim(),
      customerType: newCustType,
      totalSpent: 0,
      dueAmount: 0,
      creditLimit: parseFloat(newCustCreditLimit) || 10000,
      loyaltyTier: 'bronze',
      loyaltyPoints: 0,
      purchaseCount: 0,
      lastPurchased: new Date().toISOString().slice(0, 10),
      hasLoginAccount: newCustEnablePortal,
      portalUsername: newCustEnablePortal ? (newCustPortalUsername.trim() || newCustPhone.replace(/[^0-9]/g, '').slice(-8)) : undefined,
      portalPassword: newCustEnablePortal ? (newCustPortalPassword.trim() || 'ClientPass123!') : undefined,
      portalStatus: newCustEnablePortal ? 'active' : undefined,
    };
    onAddCustomer(newCust);
    setIsAddCustomerModalOpen(false);
    setNewCustName('');
    setNewCustPhone('');
    setNewCustEmail('');
    setNewCustAddress('');
    setNewCustEnablePortal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Header Banner & Sub-Navigation */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[11px] font-bold text-purple-300 uppercase tracking-widest">
                Phase 23 Enterprise Engine
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black mt-1 flex items-center gap-2.5">
              <Users className="w-6 h-6 text-purple-300" />
              <span>পিপল ম্যানেজমেন্ট, সেলফ-সার্ভিস পোর্টাল ও বি২বি ইনভাইটেশন হাব</span>
            </h1>
            <p className="text-xs sm:text-sm text-purple-200 mt-1 max-w-3xl">
              ওয়াক-ইন কাউন্টার গ্রাহক বনাম লগইনধারী পোর্টাল গ্রাহকদের সেগমেন্টেশন, পাইকারি বি২বি আমন্ত্রণ কোড অনুমোদন ব্যবস্থা এবং গ্রাহকের লাইভ সেলফ-সার্ভিস পোর্টাল প্রিভিউ।
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddCustomerModalOpen(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              + নতুন গ্রাহক নিবন্ধন
            </button>
            <button
              onClick={() => setIsCreateInviteModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Tag className="w-4 h-4" />
              + বি২বি ইনভাইট কোড
            </button>
          </div>
        </div>

        {/* 4 Interactive Sub-Tabs */}
        <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t border-purple-800/60 text-xs font-bold">
          <button
            onClick={() => setActiveTab('segmentation')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'segmentation'
                ? 'bg-white text-purple-900 shadow-xs'
                : 'bg-purple-950/60 text-purple-200 hover:bg-purple-900/60'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>গ্রাহক শ্রেণীবিভাগ ও ডিরেক্টরি ({tenantCustomers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('invite_codes')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'invite_codes'
                ? 'bg-white text-purple-900 shadow-xs'
                : 'bg-purple-950/60 text-purple-200 hover:bg-purple-900/60'
            }`}
          >
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span>বি২বি আমন্ত্রণ কোড ({tenantInviteCodes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('pending_applications')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer relative ${
              activeTab === 'pending_applications'
                ? 'bg-white text-purple-900 shadow-xs'
                : 'bg-purple-950/60 text-purple-200 hover:bg-purple-900/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>বি২বি আবেদন ও অনুমোদন ({tenantApplications.length})</span>
            {pendingAppsCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center animate-pulse">
                {pendingAppsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('client_portal')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'client_portal'
                ? 'bg-white text-purple-900 shadow-xs'
                : 'bg-purple-950/60 text-purple-200 hover:bg-purple-900/60'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>ক্লায়েন্ট সেলফ-সার্ভিস পোর্টাল প্রিভিউ</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-400/20 text-cyan-200">Live</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: CUSTOMER SEGMENTATION & DIRECTORY                             */}
      {/* ========================================================================= */}
      {activeTab === 'segmentation' && (
        <div className="space-y-5">
          {/* Top 5 KPI Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">মোট নিবন্ধিত গ্রাহক</span>
              <div className="text-xl font-black text-slate-800 mt-1 flex items-baseline justify-between">
                <span>{tenantCustomers.length} জন</span>
                <Users className="w-4 h-4 text-purple-600" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold uppercase text-emerald-600 tracking-wider">অনলাইন পোর্টাল লগইনধারী</span>
              <div className="text-xl font-black text-emerald-700 mt-1 flex items-baseline justify-between">
                <span>{withLoginCount} জন</span>
                <Globe className="w-4 h-4 text-emerald-600" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">কাউন্টার ওয়াক-ইন গ্রাহক</span>
              <div className="text-xl font-black text-slate-700 mt-1 flex items-baseline justify-between">
                <span>{withoutLoginCount} জন</span>
                <UserCheck className="w-4 h-4 text-slate-500" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold uppercase text-indigo-600 tracking-wider">পাইকারি ও বি২বি পার্টনার</span>
              <div className="text-xl font-black text-indigo-700 mt-1 flex items-baseline justify-between">
                <span>{wholesaleB2BCount} প্রতিষ্ঠান</span>
                <Building2 className="w-4 h-4 text-indigo-600" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold uppercase text-rose-600 tracking-wider">মোট বকেয়া পাওনা</span>
              <div className="text-xl font-black text-rose-600 mt-1 flex items-baseline justify-between">
                <span>{tenant.currency}{totalDueAmount.toLocaleString()}</span>
                <DollarSign className="w-4 h-4 text-rose-500" />
              </div>
            </div>
          </div>

          {/* Search, Filter Pills & Actions Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
              <button
                onClick={() => setSegmentFilter('all')}
                className={`px-3 py-1.5 rounded-xl transition ${
                  segmentFilter === 'all'
                    ? 'bg-purple-700 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                সকল গ্রাহক ({tenantCustomers.length})
              </button>

              <button
                onClick={() => setSegmentFilter('with_login')}
                className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1 ${
                  segmentFilter === 'with_login'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>পোর্টাল লগইনধারী ({withLoginCount})</span>
              </button>

              <button
                onClick={() => setSegmentFilter('without_login')}
                className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1 ${
                  segmentFilter === 'without_login'
                    ? 'bg-slate-700 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>কাউন্টার ওয়াক-ইন ({withoutLoginCount})</span>
              </button>

              <button
                onClick={() => setSegmentFilter('wholesale')}
                className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1 ${
                  segmentFilter === 'wholesale'
                    ? 'bg-indigo-700 text-white'
                    : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>হোলসেল / বি২বি ({wholesaleB2BCount})</span>
              </button>

              <button
                onClick={() => setSegmentFilter('over_limit')}
                className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1 ${
                  segmentFilter === 'over_limit'
                    ? 'bg-rose-600 text-white'
                    : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>লিমিট অতিক্রম ({overLimitCount})</span>
              </button>
            </div>

            {/* Search Box */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="নাম, ফোন, প্রতিষ্ঠান বা ইউজারনেম..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-600"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Customers Directory Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">গ্রাহকের নাম ও যোগাযোগ</th>
                    <th className="py-3 px-4">টাইপ ও টিয়ার</th>
                    <th className="py-3 px-4">অনলাইন পোর্টাল স্ট্যাটাস</th>
                    <th className="py-3 px-4">মোট কেনাকাটা</th>
                    <th className="py-3 px-4">বকেয়া ও ক্রেডিট লিমিট</th>
                    <th className="py-3 px-4 text-center">সেলফ-সার্ভিস প্রিভিউ</th>
                    <th className="py-3 px-4 text-right">ম্যানেজ অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <Users className="w-10 h-10 mx-auto text-slate-300 mb-2 stroke-[1.2]" />
                        <p className="font-semibold text-slate-700">কোনো গ্রাহক পাওয়া যায়নি</p>
                        <p className="text-xs text-slate-400 mt-0.5">ফিল্টার বা সার্চ কি-ওয়ার্ড পরিবর্তন করে দেখুন।</p>
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map(cust => {
                      const isOverLimit = (cust.creditLimit || 0) > 0 && cust.dueAmount > (cust.creditLimit || 0);

                      return (
                        <tr key={cust.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{cust.name}</span>
                              {cust.company && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 font-medium">
                                  {cust.company}
                                </span>
                              )}
                            </div>
                            <div className="text-slate-500 text-[11px] font-mono mt-0.5 flex items-center gap-2">
                              <span>📞 {cust.phone}</span>
                              {cust.email && <span>✉️ {cust.email}</span>}
                            </div>
                            {cust.address && (
                              <div className="text-[10px] text-slate-400 truncate max-w-xs mt-0.5">
                                📍 {cust.address}
                              </div>
                            )}
                          </td>

                          <td className="py-3 px-4">
                            <div className="flex flex-col gap-1 items-start">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                cust.customerType === 'corporate'
                                  ? 'bg-purple-100 text-purple-800'
                                  : cust.customerType === 'wholesale'
                                  ? 'bg-indigo-100 text-indigo-800'
                                  : cust.customerType === 'distributor'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}>
                                {cust.customerType || 'Retail'}
                              </span>

                              {cust.loyaltyTier && (
                                <span className="text-[10px] text-amber-700 font-semibold flex items-center gap-1">
                                  ⭐ {cust.loyaltyTier.toUpperCase()} ({cust.loyaltyPoints || 0} pts)
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            {cust.hasLoginAccount ? (
                              <div className="space-y-0.5">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>সক্রিয় অ্যাকাউন্ট</span>
                                </span>
                                <div className="text-[11px] font-mono text-slate-600 font-semibold">
                                  👤 {cust.portalUsername || 'N/A'}
                                </div>
                                {cust.lastPortalLogin && (
                                  <div className="text-[9px] text-slate-400">
                                    সর্বশেষ: {cust.lastPortalLogin}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                                  কাউন্টার ওয়াক-ইন
                                </span>
                                <div className="text-[10px] text-slate-400 mt-0.5">
                                  অনলাইন পোর্টাল নেই
                                </div>
                              </div>
                            )}
                          </td>

                          <td className="py-3 px-4 font-mono">
                            <div className="font-bold text-slate-800">
                              {tenant.currency}{cust.totalSpent.toLocaleString()}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {cust.purchaseCount} টি ভাউচার
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <div className={`font-mono font-bold ${cust.dueAmount > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
                              {tenant.currency}{cust.dueAmount.toLocaleString()}
                            </div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <span>সীমা: {tenant.currency}{(cust.creditLimit || 0).toLocaleString()}</span>
                              {isOverLimit && (
                                <span className="px-1 py-0.2 bg-rose-100 text-rose-700 rounded text-[9px] font-bold">
                                  Over Limit!
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => handleLaunchPortalForCustomer(cust)}
                              className="px-2.5 py-1.5 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-800 text-[11px] font-bold transition flex items-center justify-center gap-1 mx-auto cursor-pointer"
                              title="এই গ্রাহকের সেলফ-সার্ভিস পোর্টাল দেখুন"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>পোর্টাল প্রিভিউ</span>
                            </button>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {cust.hasLoginAccount ? (
                                <button
                                  onClick={() => handleOpenPortalSettings(cust)}
                                  className="p-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 transition cursor-pointer"
                                  title="লগইন ক্রেডেনশিয়াল ও পাসওয়ার্ড রিসেট"
                                >
                                  <Key className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleOpenPortalSettings(cust)}
                                  className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                                  title="অনলাইন পোর্টাল লগইন তৈরি করুন"
                                >
                                  <Plus className="w-3 h-3" />
                                  <span>লগইন দিন</span>
                                </button>
                              )}

                              <button
                                onClick={() => onOpenCustomerLedger?.(cust)}
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                                title="খতিয়ান হিসেব দেখুন"
                              >
                                <FileText className="w-3.5 h-3.5" />
                              </button>

                              {cust.dueAmount > 0 && (
                                <button
                                  onClick={() => onOpenReceivePayment?.(cust)}
                                  className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition cursor-pointer"
                                  title="বকেয়া জমা গ্রহণ করুন"
                                >
                                  <DollarSign className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {cust.dueAmount > 0 && onSendSmsReminder && (
                                <button
                                  onClick={() => onSendSmsReminder(cust)}
                                  className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition cursor-pointer"
                                  title="এসএমএস রিমাইন্ডার পাঠান"
                                >
                                  <Send className="w-3.5 h-3.5" />
                                </button>
                              )}
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
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: B2B INVITATION CODES ENGINE                                    */}
      {/* ========================================================================= */}
      {activeTab === 'invite_codes' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
            <div>
              <h3 className="font-bold text-sm text-slate-900">বি২বি পাইকারি ও ডিলার আমন্ত্রণ কোড (B2B Invite Codes)</h3>
              <p className="text-xs text-slate-500">
                বিশ্বস্ত পাইকারি ও কর্পোরেট ক্লায়েন্টদের বিশেষ ডিসকাউন্ট ও ক্রেডিট লিমিট সহ নিজস্ব রেজিস্ট্রেশন কোড প্রদান করুন।
              </p>
            </div>

            <button
              onClick={() => setIsCreateInviteModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              + নতুন ইনভাইট কোড তৈরি
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tenantInviteCodes.length === 0 ? (
              <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400">
                <Key className="w-10 h-10 mx-auto text-slate-300 mb-2 stroke-[1.2]" />
                <p className="font-bold text-slate-700">কোনো সক্রিয় ইনভাইট কোড নেই</p>
                <p className="text-xs text-slate-400 mt-1">বি২বি পার্টনারদের জন্য উপরের বাটনে ক্লিক করে নতুন আমন্ত্রণ কোড তৈরি করুন।</p>
              </div>
            ) : (
              tenantInviteCodes.map(code => {
                const percentUsed = Math.min(100, Math.round((code.timesRedeemed / code.maxRedemptions) * 100));

                return (
                  <div key={code.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs relative flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-black text-sm px-2.5 py-1 rounded-lg bg-purple-50 text-purple-900 border border-purple-200 tracking-wider">
                          {code.code}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          code.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {code.status}
                        </span>
                      </div>

                      <p className="text-xs font-semibold text-slate-800 mt-3 line-clamp-2">
                        {code.description || 'বি২বি বিশেষ বাল্ক কেনাকাটা পার্টনারশিপ কোড'}
                      </p>

                      <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 block">কাস্টমার টিয়ার:</span>
                          <span className="font-bold text-slate-700 capitalize">{code.tier}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">বিশেষ ডিসকাউন্ট:</span>
                          <span className="font-bold text-emerald-600">{code.discountPct}% ফ্ল্যাট</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">প্রারম্ভিক ক্রেডিট সীমা:</span>
                          <span className="font-bold text-purple-700">{tenant.currency}{code.defaultCreditLimit.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">মেয়াদ:</span>
                          <span className="font-semibold text-slate-600 font-mono text-[11px]">{code.validUntil}</span>
                        </div>
                      </div>

                      {/* Usage Progress */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                          <span>ব্যবহার সম্পন্ন:</span>
                          <span className="font-bold text-slate-800">{code.timesRedeemed} / {code.maxRedemptions} বার</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${percentUsed}%` }}
                            className={`h-full rounded-full ${
                              percentUsed > 80 ? 'bg-amber-500' : 'bg-purple-600'
                            }`}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleCopyLink(code.code, code.id)}
                        className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                          copiedCodeId === code.id
                            ? 'bg-emerald-600 text-white'
                            : 'bg-purple-50 hover:bg-purple-100 text-purple-800'
                        }`}
                      >
                        {copiedCodeId === code.id ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>লিংক কপিড!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>ইনভাইট লিংক কপি</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`আপনি কি "${code.code}" ইনভাইট কোডটি মুছে ফেলতে চান?`)) {
                            onDeleteInviteCode(code.id);
                          }
                        }}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="মুছে ফেলুন"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: PENDING APPLICATIONS & APPROVALS                               */}
      {/* ========================================================================= */}
      {activeTab === 'pending_applications' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
            <div>
              <h3 className="font-bold text-sm text-slate-900">বি২বি গ্রাহক অনুমোদন কিউ (Registration Queue)</h3>
              <p className="text-xs text-slate-500">
                ইনভাইট কোড দিয়ে আবেদনকৃত হোলসেল ফার্মেসি, ক্লিনিক বা ডিলারদের ট্রেড লাইসেন্স ও ক্রেডিট সীমা যাচাই করে অনুমোদন দিন।
              </p>
            </div>

            <button
              onClick={() => setIsManualAppModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              + ম্যানুয়াল বি২বি আবেদন গ্রহণ
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">আবেদন নং ও তারিখ</th>
                    <th className="py-3 px-4">প্রতিষ্ঠানের নাম ও প্রোপ্রাইটার</th>
                    <th className="py-3 px-4">যোগাযোগ ও ঠিকানা</th>
                    <th className="py-3 px-4">ট্রেড লাইসেন্স ও BIN</th>
                    <th className="py-3 px-4">প্রার্থিত ক্রেডিট লিমিট</th>
                    <th className="py-3 px-4 text-center">স্ট্যাটাস</th>
                    <th className="py-3 px-4 text-right">সিদ্ধান্ত ও অনুমোদন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tenantApplications.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <ShieldCheck className="w-10 h-10 mx-auto text-slate-300 mb-2 stroke-[1.2]" />
                        <p className="font-bold text-slate-700">অনুমোদনের অপেক্ষায় কোনো আবেদন নেই</p>
                        <p className="text-xs text-slate-400 mt-1">নতুন আবেদন জমা হলে এই তালিকায় প্রদর্শিত হবে।</p>
                      </td>
                    </tr>
                  ) : (
                    tenantApplications.map(app => (
                      <tr key={app.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-4 font-mono font-bold text-purple-900">
                          <div>{app.applicationNo}</div>
                          <div className="text-[10px] text-slate-400 font-normal">{app.appliedDate}</div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{app.businessName}</div>
                          <div className="text-[11px] text-slate-500">স্বত্বাধিকারী: {app.ownerName}</div>
                          <span className="inline-block mt-0.5 px-2 py-0.2 rounded text-[9px] font-bold bg-purple-50 text-purple-700 uppercase">
                            {app.customerType}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-mono text-slate-700 font-semibold">{app.phone}</div>
                          <div className="text-[11px] text-slate-500">{app.email}</div>
                          <div className="text-[10px] text-slate-400 truncate max-w-xs">{app.address}</div>
                        </td>

                        <td className="py-3 px-4 font-mono text-[11px]">
                          <div>📄 {app.tradeLicenseNo || 'সংযুক্ত নেই'}</div>
                          {app.binTaxNo && <div className="text-slate-400">🏷️ BIN: {app.binTaxNo}</div>}
                          {app.inviteCodeUsed && (
                            <div className="text-[10px] text-indigo-600 font-bold mt-0.5">
                              কোড: {app.inviteCodeUsed}
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-4 font-mono font-bold text-slate-800">
                          {tenant.currency}{app.requestedCreditLimit.toLocaleString()}
                        </td>

                        <td className="py-3 px-4 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            app.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : app.status === 'rejected'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800 animate-pulse'
                          }`}>
                            {app.status === 'approved' ? '✓ অনুমোদিত' : app.status === 'rejected' ? '✕ বাতিল' : '⏳ পেন্ডিং'}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          {app.status === 'pending' ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  if (confirm(`আপনি কি "${app.businessName}"-এর আবেদন অনুমোদন করতে চান? এটি স্বয়ংক্রিয়ভাবে অনলাইন ক্লায়েন্ট পোর্টাল লগইন সহ কাস্টমার তৈরি করবে।`)) {
                                    onApproveApplication(app.id, app.requestedCreditLimit);
                                  }
                                }}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>অনুমোদন</span>
                              </button>

                              <button
                                onClick={() => setRejectingAppId(app.id)}
                                className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition cursor-pointer"
                              >
                                বাতিল
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">
                              {app.status === 'approved' ? `অনুমোদনকারী: ${app.reviewedBy || 'Admin'}` : `কারণ: ${app.rejectionReason || 'N/A'}`}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 4: CLIENT SELF-SERVICE PORTAL SIMULATOR & PREVIEW                */}
      {/* ========================================================================= */}
      {activeTab === 'client_portal' && (
        <div className="space-y-5">
          {/* Simulator Controls & Customer Switcher */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-cyan-500 animate-ping"></span>
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                গ্রাহক পোর্টাল লাইভ টেস্ট পরিবেশ (Portal Simulator):
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <label className="text-slate-500 font-semibold">লগইনকৃত গ্রাহক হিসেবে পরীক্ষা করুন:</label>
              <select
                value={activePortalCustomerId}
                onChange={e => setActivePortalCustomerId(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-purple-900 focus:outline-none focus:ring-1 focus:ring-purple-600 cursor-pointer"
              >
                {tenantCustomers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.hasLoginAccount ? '🔑 (With Login)' : '👤 (Guest)'} — বকেয়া: {tenant.currency}{c.dueAmount}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* THE ACTUAL CLIENT PORTAL SHELL (Matching modern client self-service UX) */}
          <div className="bg-slate-50 rounded-3xl border-2 border-indigo-200 overflow-hidden shadow-lg">
            {/* Portal Top Bar */}
            <header className="bg-slate-900 text-white px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-600 flex items-center justify-center font-black text-white text-base shadow-xs">
                  {tenant.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-2">
                    <span>{tenant.name} — ক্লায়েন্ট সেলফ-সার্ভিস পোর্টাল</span>
                    <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 uppercase">
                      Client Portal v2.0
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    স্বাগতম, <span className="text-white font-bold">{currentPortalCustomer?.name}</span> ({currentPortalCustomer?.company || currentPortalCustomer?.customerType || 'Customer'})
                  </p>
                </div>
              </div>

              {/* Portal Navigation Items */}
              <div className="flex items-center gap-1.5 text-xs font-bold overflow-x-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setPortalViewSection('overview')}
                  className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                    portalViewSection === 'overview' ? 'bg-purple-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  ওভারভিউ
                </button>
                <button
                  onClick={() => setPortalViewSection('invoices')}
                  className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                    portalViewSection === 'invoices' ? 'bg-purple-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  ইনভয়েস ও বিল ({customerSales.length})
                </button>
                <button
                  onClick={() => setPortalViewSection('pay_due')}
                  className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                    portalViewSection === 'pay_due' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  বকেয়া পরিশোধ ({(currentPortalCustomer?.dueAmount || 0) > 0 ? `৳${currentPortalCustomer?.dueAmount}` : '০'})
                </button>
                <button
                  onClick={() => setPortalViewSection('repairs')}
                  className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                    portalViewSection === 'repairs' ? 'bg-purple-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  সার্ভিস জব ({customerServiceTickets.length})
                </button>
                <button
                  onClick={() => setPortalViewSection('bookings')}
                  className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                    portalViewSection === 'bookings' ? 'bg-purple-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  বুকিং ও চুক্তি ({customerBookings.length + customerContracts.length})
                </button>
              </div>
            </header>

            {/* Portal Content Area */}
            <div className="p-6 space-y-6">
              {/* SECTION 1: OVERVIEW */}
              {portalViewSection === 'overview' && (
                <div className="space-y-6 animate-in fade-in">
                  {/* Financial Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                      <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider block">বর্তমান বকেয়া (Current Due)</span>
                      <div className="text-2xl font-black text-rose-600 mt-1">
                        {tenant.currency}{(currentPortalCustomer?.dueAmount || 0).toLocaleString()}
                      </div>
                      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-400">অনুমোদিত সীমা:</span>
                        <span className="font-bold text-slate-700">{tenant.currency}{(currentPortalCustomer?.creditLimit || 0).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                      <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider block">লাইফটাইম কেনাকাটা</span>
                      <div className="text-2xl font-black text-slate-900 mt-1">
                        {tenant.currency}{(currentPortalCustomer?.totalSpent || 0).toLocaleString()}
                      </div>
                      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-400">মোট লেনদেন:</span>
                        <span className="font-bold text-emerald-700">{customerSales.length} টি ইনভয়েস</span>
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                      <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider block">মেম্বারশিপ ও লয়্যালটি</span>
                      <div className="text-2xl font-black text-purple-800 mt-1 flex items-center gap-1.5">
                        <span>{currentPortalCustomer?.loyaltyPoints || 0}</span>
                        <span className="text-xs text-purple-500 font-bold uppercase">পয়েন্ট</span>
                      </div>
                      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-400">টিয়ার ব্যাজ:</span>
                        <span className="font-bold text-purple-700 uppercase">⭐ {currentPortalCustomer?.loyaltyTier || 'Standard'}</span>
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                      <span className="text-xs font-semibold text-cyan-600 uppercase tracking-wider block">পোর্টাল একাউন্ট আইডি</span>
                      <div className="text-lg font-mono font-bold text-slate-800 mt-1">
                        @{currentPortalCustomer?.portalUsername || currentPortalCustomer?.phone}
                      </div>
                      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-400">নিরাপত্তা স্ট্যাটাস:</span>
                        <span className="font-bold text-emerald-600">✓ সক্রিয় ও সুরক্ষিত</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Action Shortcuts */}
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-5 rounded-2xl border border-purple-100 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-sm text-purple-950">দ্রুত অ্যাকশন ও গ্রাহক সুবিধা</h4>
                      <p className="text-xs text-purple-700 mt-0.5">
                        আপনার বকেয়া পরিশোধ করুন, সার্ভিস জবের অগ্রগতি ট্র্যাক করুন অথবা ইনভয়েস সংগ্রহ করুন।
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => setPortalViewSection('pay_due')}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>বকেয়া পরিশোধ করুন</span>
                      </button>

                      <button
                        onClick={() => setPortalViewSection('invoices')}
                        className="px-4 py-2 bg-white hover:bg-slate-100 text-purple-900 border border-purple-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-purple-700" />
                        <span>সকল ইনভয়েস দেখুন</span>
                      </button>

                      <button
                        onClick={() => setPortalViewSection('repairs')}
                        className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        <span>সার্ভিস ট্র্যাকিং</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 2: MY INVOICES & BILLS */}
              {portalViewSection === 'invoices' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-slate-800">আমার অতীতের ক্রয় ও ইনভয়েস ইতিহাস</h4>
                    <span className="text-xs text-slate-500">{customerSales.length} টি কেনাকাটা রেকর্ড</span>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="py-3 px-4">ইনভয়েস নং</th>
                          <th className="py-3 px-4">তারিখ</th>
                          <th className="py-3 px-4">আইটেম বিবরণ</th>
                          <th className="py-3 px-4">মোট বিল</th>
                          <th className="py-3 px-4">পরিশোধ</th>
                          <th className="py-3 px-4">বকেয়া</th>
                          <th className="py-3 px-4 text-center">ইনভয়েস ডাউনলোড / ভিউ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {customerSales.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-slate-400">
                              এই গ্রাহকের কোনো অতীতের ইনভয়েস রেকর্ড পাওয়া যায়নি।
                            </td>
                          </tr>
                        ) : (
                          customerSales.map(sale => (
                            <tr key={sale.id} className="hover:bg-slate-50/70">
                              <td className="py-3 px-4 font-mono font-bold text-purple-900">
                                {sale.invoiceNumber}
                              </td>
                              <td className="py-3 px-4 text-slate-600">
                                {sale.createdAt.slice(0, 10)}
                              </td>
                              <td className="py-3 px-4">
                                <div className="font-medium text-slate-800 truncate max-w-xs">
                                  {sale.items.map(i => `${i.productName} (x${i.quantity})`).join(', ')}
                                </div>
                              </td>
                              <td className="py-3 px-4 font-mono font-bold text-slate-900">
                                {tenant.currency}{sale.totalAmount.toLocaleString()}
                              </td>
                              <td className="py-3 px-4 font-mono text-emerald-700 font-semibold">
                                {tenant.currency}{sale.paidAmount.toLocaleString()}
                              </td>
                              <td className="py-3 px-4 font-mono">
                                <span className={sale.dueAmount > 0 ? 'text-rose-600 font-bold' : 'text-slate-400'}>
                                  {tenant.currency}{sale.dueAmount.toLocaleString()}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <button
                                  onClick={() => onOpenA4Invoice?.(sale)}
                                  className="px-2.5 py-1 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 text-[11px] font-bold transition flex items-center justify-center gap-1 mx-auto cursor-pointer"
                                >
                                  <Printer className="w-3 h-3" />
                                  <span>A4 ইনভয়েস</span>
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

              {/* SECTION 3: DIGITAL DUE CLEARANCE (PAY DUE ONLINE) */}
              {portalViewSection === 'pay_due' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in">
                  {/* Left: Due Payment Submission Form */}
                  <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
                    <div>
                      <h4 className="font-bold text-base text-slate-900">অনলাইন বকেয়া পরিশোধ ও ভাউচার সাবমিশন</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        বিকাশ, নগদ বা ব্যাংক একাউন্টে ট্রান্সফার করে ট্রানজেকশন আইডি প্রদান করুন।
                      </p>
                    </div>

                    <div className="p-4 bg-purple-50 rounded-xl border border-purple-100 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-semibold text-purple-700 block">আপনার মোট বর্তমান বকেয়া:</span>
                        <div className="text-2xl font-black text-rose-600">
                          {tenant.currency}{(currentPortalCustomer?.dueAmount || 0).toLocaleString()}
                        </div>
                      </div>
                      <span className="text-xs text-purple-700 bg-white px-3 py-1.5 rounded-xl border border-purple-200 font-bold">
                        অফিসিয়াল মার্চেন্ট: {tenant.name}
                      </span>
                    </div>

                    <form onSubmit={handleSubmitClaimFromPortal} className="space-y-4 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">পরিশোধের টাকার পরিমাণ: *</label>
                          <input
                            type="number"
                            required
                            placeholder={currentPortalCustomer?.dueAmount?.toString() || '0'}
                            value={portalPayAmount}
                            onChange={e => setPortalPayAmount(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-purple-700 text-sm focus:outline-none focus:ring-1 focus:ring-purple-600"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-slate-700 block mb-1">পরিশোধের মাধ্যম: *</label>
                          <select
                            value={portalPayMethod}
                            onChange={e => setPortalPayMethod(e.target.value as any)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-600 cursor-pointer"
                          >
                            <option value="bkash">বিকাশ (bKash Merchant / Personal)</option>
                            <option value="nagad">নগদ (Nagad Merchant / Personal)</option>
                            <option value="bank">ব্যাংক ট্রান্সফার (NPSB / BEFTN / RTGS)</option>
                            <option value="rocket">রকেট (Rocket)</option>
                          </select>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="font-bold text-slate-700 block mb-1">ট্রানজেকশন আইডি (TxID) / ব্যাংক রেফারেন্স: *</label>
                          <input
                            type="text"
                            required
                            placeholder="যেমন: BK99AA1209 অথবা EBL-NPSB-998811"
                            value={portalPayTrxId}
                            onChange={e => setPortalPayTrxId(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-1 focus:ring-purple-600 uppercase"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="font-bold text-slate-700 block mb-1">অতিরিক্ত নোট বা ব্যাঙ্কের তথ্য:</label>
                          <input
                            type="text"
                            placeholder="যেমন: সিটি ব্যাংক থেকে ট্রান্সফার করা হয়েছে"
                            value={portalPayNote}
                            onChange={e => setPortalPayNote(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-600"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>পরিশোধের তথ্য সাবমিট করুন</span>
                      </button>
                    </form>
                  </div>

                  {/* Right: Submitted Payment Claims History */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-600">পূর্ববর্তী পরিশোধ দাবি ও স্ট্যাটাস</h4>
                    
                    <div className="space-y-3">
                      {customerClaims.length === 0 ? (
                        <p className="text-xs text-slate-400 italic py-4 text-center">এখনো কোনো অনলাইন পরিশোধ দাবি জমা দেননি।</p>
                      ) : (
                        customerClaims.map(claim => (
                          <div key={claim.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                            <div className="flex items-center justify-between font-bold">
                              <span className="text-slate-800">{tenant.currency}{claim.amount.toLocaleString()}</span>
                              <span className={`px-2 py-0.2 rounded-full text-[10px] ${
                                claim.status === 'verified_approved'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : claim.status === 'rejected'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {claim.status === 'verified_approved' ? '✓ সমন্বয় সম্পন্ন' : claim.status === 'rejected' ? '✕ বাতিল' : '⏳ যাচাই প্রক্রিয়াধীন'}
                              </span>
                            </div>
                            <div className="font-mono text-[10px] text-slate-500">
                              মাধ্যম: {claim.paymentMethod.toUpperCase()} • TxID: {claim.transactionId}
                            </div>
                            <div className="text-[10px] text-slate-400">{claim.submittedAt}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 4: SERVICE & REPAIR TICKETS TRACKING */}
              {portalViewSection === 'repairs' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-800">সার্ভিস ও ডিভাইস রিপেয়ার লাইভ ট্র্যাকার</h4>
                      <p className="text-xs text-slate-500">আপনার মেরামত বা সার্ভিসিং-এ থাকা যন্ত্রপাতির রিয়েল-টাইম অগ্রগতি</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {customerServiceTickets.length === 0 ? (
                      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400">
                        <Wrench className="w-8 h-8 mx-auto text-slate-300 mb-2 stroke-[1.2]" />
                        <p className="font-semibold text-slate-700">বর্তমানে কোনো সক্রিয় সার্ভিস টিকিট নেই</p>
                      </div>
                    ) : (
                      customerServiceTickets.map(ticket => (
                        <div key={ticket.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                            <div>
                              <span className="font-mono font-bold text-purple-900 text-sm">{ticket.ticketNumber}</span>
                              <h5 className="font-bold text-slate-900 mt-0.5">{ticket.brand} {ticket.model} ({ticket.deviceType})</h5>
                            </div>
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 self-start sm:self-auto uppercase">
                              স্ট্যাটাস: {ticket.status.replace(/_/g, ' ')}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                            <div>
                              <span className="text-[10px] text-slate-400 block">সমস্যা বিবরণ:</span>
                              <span className="font-medium text-slate-700">{ticket.reportedIssues}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 block">দায়িত্বপ্রাপ্ত টেকনিশিয়ান:</span>
                              <span className="font-bold text-slate-800">{ticket.assignedTechnicianName || 'Assigning...'}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 block">আনুমানিক ডেলিভারি:</span>
                              <span className="font-semibold text-indigo-700 font-mono">{ticket.expectedDeliveryDate || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 block">আনুমানিক খরচ:</span>
                              <span className="font-bold text-emerald-700 font-mono">{tenant.currency}{ticket.estimatedCost.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* SECTION 5: CONTRACTS & APPOINTMENTS */}
              {portalViewSection === 'bookings' && (
                <div className="space-y-6 animate-in fade-in">
                  <div>
                    <h4 className="font-bold text-sm text-slate-800">আসন্ন অ্যাপয়েন্টমেন্ট ও শিডিউল বুকিং</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                      {customerBookings.length === 0 ? (
                        <p className="text-xs text-slate-400 italic bg-white p-4 rounded-xl border border-slate-200">কোনো বুকিং শিডিউল পাওয়া যায়নি।</p>
                      ) : (
                        customerBookings.map(b => (
                          <div key={b.id} className="bg-white p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                            <div className="flex items-center justify-between font-bold">
                              <span className="text-purple-900 font-mono">{b.bookingNumber}</span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold">
                                {b.status}
                              </span>
                            </div>
                            <div className="font-bold text-slate-800">{b.serviceType.replace(/_/g, ' ').toUpperCase()}</div>
                            <div className="text-slate-500">📅 {b.bookingDate} ({b.timeSlot})</div>
                            <div className="text-[10px] text-slate-400">স্টাফ: {b.assignedStaffName}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-slate-800">বাণিজ্যিক ও সরবরাহ চুক্তিপত্র (Commercial Contracts)</h4>
                    <div className="space-y-3 mt-3">
                      {customerContracts.length === 0 ? (
                        <p className="text-xs text-slate-400 italic bg-white p-4 rounded-xl border border-slate-200">কোনো কার্যকর চুক্তিপত্র পাওয়া যায়নি।</p>
                      ) : (
                        customerContracts.map(c => (
                          <div key={c.id} className="bg-white p-4 rounded-xl border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                              <span className="font-mono font-bold text-indigo-900">{c.contractNumber}</span>
                              <h5 className="font-bold text-slate-800 mt-0.5">{c.title}</h5>
                              <div className="text-[11px] text-slate-400">মেয়াদ: {c.startDate} থেকে {c.endDate}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-mono font-black text-sm text-emerald-700">{tenant.currency}{c.contractValue.toLocaleString()}</div>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold uppercase">{c.status}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: SET / EDIT PORTAL CREDENTIALS                                   */}
      {/* ========================================================================= */}
      {selectedCustomerForPortal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-purple-100 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="bg-purple-900 text-white px-5 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">অনলাইন ক্লায়েন্ট পোর্টাল লগইন সেটআপ</h3>
                <p className="text-xs text-purple-200">{selectedCustomerForPortal.name}</p>
              </div>
              <button onClick={() => setSelectedCustomerForPortal(null)} className="text-purple-200 hover:text-white cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSavePortalAccess} className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">পোর্টাল ইউজারনেম: *</label>
                <input
                  type="text"
                  required
                  value={portalUsernameInput}
                  onChange={e => setPortalUsernameInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">পাসওয়ার্ড: *</label>
                <input
                  type="text"
                  required
                  value={portalPasswordInput}
                  onChange={e => setPortalPasswordInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-600"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">গ্রাহককে এই ইউজারনেম ও পাসওয়ার্ড জানিয়ে দিন যাতে তিনি পোর্টালে লগইন করতে পারেন।</span>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">অ্যাকাউন্ট স্ট্যাটাস:</label>
                <select
                  value={portalStatusInput}
                  onChange={e => setPortalStatusInput(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl cursor-pointer"
                >
                  <option value="active">Active (সক্রিয়)</option>
                  <option value="suspended">Suspended (স্থগিত)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCustomerForPortal(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold cursor-pointer"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: CREATE B2B INVITE CODE                                          */}
      {/* ========================================================================= */}
      {isCreateInviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-purple-100 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="bg-emerald-800 text-white px-5 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">নতুন বি২বি ইনভাইটেশন কোড তৈরি</h3>
                <p className="text-xs text-emerald-200">পাইকারি ও কর্পোরেট ডিলারদের জন্য</p>
              </div>
              <button onClick={() => setIsCreateInviteModalOpen(false)} className="text-emerald-200 hover:text-white cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreateInviteCodeSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">ইনভাইটেশন কোড (Invite Code): *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="যেমন: VIP-WHOLESALE-2026"
                    value={inviteCodeInput}
                    onChange={e => setInviteCodeInput(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-xl font-mono uppercase font-bold text-emerald-800"
                  />
                  <button
                    type="button"
                    onClick={() => setInviteCodeInput('B2B-' + Math.random().toString(36).substring(2, 7).toUpperCase())}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-[11px] cursor-pointer"
                  >
                    অটো জেনারেট
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">বর্ণনা বা উদ্দেশ্য:</label>
                <input
                  type="text"
                  placeholder="যেমন: ওষুধ পাইকারি বিক্রেতাদের জন্য বিশেষ কোড"
                  value={inviteDescInput}
                  onChange={e => setInviteDescInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">কাস্টমার টিয়ার:</label>
                  <select
                    value={inviteTierInput}
                    onChange={e => setInviteTierInput(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl cursor-pointer"
                  >
                    <option value="wholesale">Wholesale (পাইকারি)</option>
                    <option value="corporate">Corporate (কর্পোরেট)</option>
                    <option value="distributor">Distributor (ডিস্ট্রিবিউটর)</option>
                    <option value="retail">Retail (খুচরা)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">ফ্ল্যাট ডিসকাউন্ট (%):</label>
                  <input
                    type="number"
                    step="0.5"
                    value={inviteDiscountInput}
                    onChange={e => setInviteDiscountInput(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-emerald-700"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">প্রারম্ভিক ক্রেডিট সীমা (৳):</label>
                  <input
                    type="number"
                    value={inviteCreditLimitInput}
                    onChange={e => setInviteCreditLimitInput(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">সর্বোচ্চ ব্যবহার সীমা:</label>
                  <input
                    type="number"
                    value={inviteMaxRedemptionsInput}
                    onChange={e => setInviteMaxRedemptionsInput(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">মেয়াদ শেষ হওয়ার তারিখ:</label>
                <input
                  type="date"
                  value={inviteValidUntilInput}
                  onChange={e => setInviteValidUntilInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl cursor-pointer"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateInviteModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer"
                >
                  তৈরি করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: MANUAL B2B REGISTRATION APPLICATION                              */}
      {/* ========================================================================= */}
      {isManualAppModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-indigo-100 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="bg-indigo-900 text-white px-5 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">ম্যানুয়াল বি২বি হোলসেল আবেদন গ্রহণ</h3>
                <p className="text-xs text-indigo-200">কাউন্টার বা ফিল্ড থেকে সরাসরি বি২বি পার্টনার যোগ করুন</p>
              </div>
              <button onClick={() => setIsManualAppModalOpen(false)} className="text-indigo-200 hover:text-white cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreateManualAppSubmit} className="p-5 space-y-3 text-xs max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">প্রতিষ্ঠানের নাম: *</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: ইবনে সিনা ডায়াগনস্টিক পয়েন্ট"
                    value={appBusinessName}
                    onChange={e => setAppBusinessName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">মালিক / পরিচালকের নাম: *</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: ডা: মো: শাহাবুদ্দিন"
                    value={appOwnerName}
                    onChange={e => setAppOwnerName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">মোবাইল নম্বর: *</label>
                  <input
                    type="text"
                    required
                    placeholder="+880 1718-xxxxxx"
                    value={appPhone}
                    onChange={e => setAppPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">ইমেইল ঠিকানা:</label>
                  <input
                    type="email"
                    placeholder="procurement@company.com"
                    value={appEmail}
                    onChange={e => setAppEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">ব্যবসায়িক শ্রেণী:</label>
                  <select
                    value={appCustomerType}
                    onChange={e => setAppCustomerType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl cursor-pointer"
                  >
                    <option value="wholesale">Wholesale (পাইকারি)</option>
                    <option value="corporate">Corporate (কর্পোরেট)</option>
                    <option value="distributor">Distributor (ডিস্ট্রিবিউটর)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">ট্রেড লাইসেন্স নম্বর:</label>
                  <input
                    type="text"
                    placeholder="TRAD/DNCC/xxxx"
                    value={appTradeLicense}
                    onChange={e => setAppTradeLicense(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">BIN / ভ্যাট নম্বর:</label>
                  <input
                    type="text"
                    placeholder="001928475-xxxx"
                    value={appBinTax}
                    onChange={e => setAppBinTax(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">প্রার্থিত ক্রেডিট সীমা (৳):</label>
                  <input
                    type="number"
                    value={appRequestedCredit}
                    onChange={e => setAppRequestedCredit(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">রেফারেল ইনভাইট কোড:</label>
                  <input
                    type="text"
                    placeholder="ঐচ্ছিক"
                    value={appInviteCode}
                    onChange={e => setAppInviteCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl uppercase font-mono"
                  />
                </div>

                <div className="col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">প্রতিষ্ঠানের সম্পূর্ণ ঠিকানা:</label>
                  <textarea
                    rows={2}
                    placeholder="বাড়ি, রোড, এলাকা, জেলা..."
                    value={appAddress}
                    onChange={e => setAppAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsManualAppModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold cursor-pointer"
                >
                  আবেদন জমা নিন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: REJECTION REASON                                                */}
      {/* ========================================================================= */}
      {rejectingAppId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-4">
            <h4 className="font-bold text-sm text-slate-900">আবেদন বাতিলের কারণ উল্লেখ করুন</h4>
            <textarea
              rows={3}
              placeholder="যেমন: ট্রেড লাইসেন্সের মেয়াদ উত্তীর্ণ অথবা ভুয়া ফোন নম্বর..."
              value={rejectionReasonInput}
              onChange={e => setRejectionReasonInput(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
            <div className="flex items-center justify-end gap-2 text-xs font-bold">
              <button
                onClick={() => setRejectingAppId(null)}
                className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-xl cursor-pointer"
              >
                ফিরে যান
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl cursor-pointer"
              >
                বাতিল নিশ্চিত করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: ADD QUICK CUSTOMER WITH LOGIN OPTION                            */}
      {/* ========================================================================= */}
      {isAddCustomerModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-purple-100 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="bg-purple-800 text-white px-5 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">নতুন গ্রাহক যোগ করুন</h3>
                <p className="text-xs text-purple-200">কাউন্টার বা অনলাইন পোর্টাল গ্রাহক</p>
              </div>
              <button onClick={() => setIsAddCustomerModalOpen(false)} className="text-purple-200 hover:text-white cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleAddQuickCustomer} className="p-5 space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">গ্রাহকের নাম: *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: মো: কামরুল হাসান"
                  value={newCustName}
                  onChange={e => setNewCustName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">মোবাইল নম্বর: *</label>
                  <input
                    type="text"
                    required
                    placeholder="+880 1711-xxxxxx"
                    value={newCustPhone}
                    onChange={e => setNewCustPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">গ্রাহকের ধরন:</label>
                  <select
                    value={newCustType}
                    onChange={e => setNewCustType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl cursor-pointer"
                  >
                    <option value="retail">Retail (খুচরা ওয়াক-ইন)</option>
                    <option value="wholesale">Wholesale (পাইকারি)</option>
                    <option value="corporate">Corporate (কর্পোরেট)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">ইমেইল (ঐচ্ছিক):</label>
                <input
                  type="email"
                  placeholder="customer@gmail.com"
                  value={newCustEmail}
                  onChange={e => setNewCustEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">ঠিকানা:</label>
                <input
                  type="text"
                  placeholder="রোড, এলাকা..."
                  value={newCustAddress}
                  onChange={e => setNewCustAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">ক্রেডিট লিমিট (৳):</label>
                <input
                  type="number"
                  value={newCustCreditLimit}
                  onChange={e => setNewCustCreditLimit(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              {/* Portal Login Checkbox */}
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-purple-900">
                  <input
                    type="checkbox"
                    checked={newCustEnablePortal}
                    onChange={e => setNewCustEnablePortal(e.target.checked)}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                  />
                  <span>অনলাইন সেলফ-সার্ভিস পোর্টাল অ্যাকাউন্ট তৈরি করুন</span>
                </label>

                {newCustEnablePortal && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="text-[10px] text-slate-600 block">ইউজারনেম:</label>
                      <input
                        type="text"
                        placeholder="অটো ফোন নম্বর"
                        value={newCustPortalUsername}
                        onChange={e => setNewCustPortalUsername(e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-600 block">পাসওয়ার্ড:</label>
                      <input
                        type="text"
                        placeholder="ClientPass123!"
                        value={newCustPortalPassword}
                        onChange={e => setNewCustPortalPassword(e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddCustomerModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold cursor-pointer"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
