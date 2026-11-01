import React, { useState, useMemo } from 'react';
import {
  Tenant, Product, Sale, Warehouse, Supplier, Customer, Employee,
  CashRegisterShift, CashDenominationBreakdown, CashRegisterAdjustment,
  UserLoginActivityLog, SystemAuditErrorLog
} from '../../types';
import {
  Box, TrendingUp, Calendar, AlertTriangle, ShieldAlert,
  Clock, CheckCircle2, XCircle, Printer, Download, Filter, Search,
  RefreshCw, DollarSign, ArrowUpRight, ArrowDownRight, Layers,
  ChevronRight, Sparkles, Building2, Eye, ShieldCheck, Users,
  Send, AlertCircle, Plus, FileText, Check, Award
} from 'lucide-react';

interface AnalyticsAndIntelligenceHubProps {
  tenant: Tenant;
  currency: string;
  products: Product[];
  sales: Sale[];
  warehouses: Warehouse[];
  suppliers: Supplier[];
  customers: Customer[];
  employees: Employee[];
  cashRegisterShifts: CashRegisterShift[];
  loginActivityLogs: UserLoginActivityLog[];
  systemErrorLogs: SystemAuditErrorLog[];
  initialTab?: '3d_dashboard' | 'cash_register' | 'inventory_radar' | 'ranking_matrix' | 'security_audit';
  onOpenShift: (shiftData: Omit<CashRegisterShift, 'id' | 'status' | 'totalCashSales' | 'totalDigitalSales' | 'totalReturnsRefunded' | 'totalExpensesPaid' | 'cashAdded' | 'cashRemoved' | 'expectedClosingCash' | 'totalTransactionsCount'>) => void;
  onCloseShift: (shiftId: string, actualClosingCash: number, notes?: string, denominations?: CashDenominationBreakdown) => void;
  onAddCashAdjustment: (shiftId: string, type: 'cash_in' | 'cash_out', amount: number, reason: string) => void;
  onResolveErrorLog: (logId: string, resolutionNotes: string) => void;
  onStockAdjustment?: (product: Product, newStock: number, reason: string) => void;
  onSendSmsAlert?: (phone: string, message: string) => void;
}

export const AnalyticsAndIntelligenceHub: React.FC<AnalyticsAndIntelligenceHubProps> = ({
  tenant,
  currency,
  products,
  sales,
  warehouses,
  suppliers,
  customers,
  employees,
  cashRegisterShifts,
  loginActivityLogs,
  systemErrorLogs,
  initialTab = '3d_dashboard',
  onOpenShift,
  onCloseShift,
  onAddCashAdjustment,
  onResolveErrorLog,
  onStockAdjustment,
  onSendSmsAlert,
}) => {
  // Navigation Sub-tab
  const [activeTab, setActiveTab] = useState<'3d_dashboard' | 'cash_register' | 'inventory_radar' | 'ranking_matrix' | 'security_audit'>(initialTab);

  // 3D Dashboard State
  const [view3DMode, setView3DMode] = useState<'isometric' | 'perspective' | 'front'>('isometric');
  const [cameraYaw, setCameraYaw] = useState<number>(-35); // rotation in degrees
  const [timeRange, setTimeRange] = useState<'today' | '7days' | 'month' | 'year'>('month');
  const [metricType, setMetricType] = useState<'revenue' | 'profit' | 'transactions'>('revenue');
  const [hovered3DBar, setHovered3DBar] = useState<{ label: string; branch: string; value: number; sub: string } | null>(null);

  // Cash Register State
  const [selectedShiftForZReport, setSelectedShiftForZReport] = useState<CashRegisterShift | null>(null);
  const [isCloseShiftModalOpen, setIsCloseShiftModalOpen] = useState(false);
  const [shiftToClose, setShiftToClose] = useState<CashRegisterShift | null>(null);
  const [isCashAdjModalOpen, setIsCashAdjModalOpen] = useState(false);
  const [cashAdjType, setCashAdjType] = useState<'cash_in' | 'cash_out'>('cash_in');
  const [cashAdjAmount, setCashAdjAmount] = useState('');
  const [cashAdjReason, setCashAdjReason] = useState('');
  const [isOpenNewShiftModalOpen, setIsOpenNewShiftModalOpen] = useState(false);
  const [newShiftOpeningCash, setNewShiftOpeningCash] = useState('5000');
  const [newShiftRegisterName, setNewShiftRegisterName] = useState('Counter-01 (Main POS Terminal)');
  const [newShiftCashierId, setNewShiftCashierId] = useState(employees[0]?.id || 'emp-2');
  const [newShiftWarehouseId, setNewShiftWarehouseId] = useState(warehouses[0]?.id || 'wh-main');

  // Close shift form physical denominations
  const [denom1000, setDenom1000] = useState('10');
  const [denom500, setDenom500] = useState('6');
  const [denom200, setDenom200] = useState('5');
  const [denom100, setDenom100] = useState('8');
  const [denom50, setDenom50] = useState('4');
  const [denomCoins, setDenomCoins] = useState('0');
  const [closeShiftNotes, setCloseShiftNotes] = useState('');

  // Inventory Radar State
  const [radarSubTab, setRadarSubTab] = useState<'negative' | 'aging' | 'expiry'>('aging');
  const [selectedAdjustProduct, setSelectedAdjustProduct] = useState<Product | null>(null);
  const [adjustNewStock, setAdjustNewStock] = useState('10');
  const [adjustReason, setAdjustReason] = useState('ইনভেন্টরি গোয়েন্দা অডিট সমন্বয়');
  const [agingFilter, setAgingFilter] = useState<'all' | '0_30' | '31_60' | '61_90' | '91_180' | '180_plus'>('all');
  const [expiryDaysFilter, setExpiryDaysFilter] = useState<number>(90);

  // Ranking Matrix State
  const [inactiveDaysThreshold, setInactiveDaysThreshold] = useState<30 | 60 | 90>(30);
  const [smsSuccessToast, setSmsSuccessToast] = useState<string | null>(null);

  // Security Audit State
  const [selectedErrorForResolve, setSelectedErrorForResolve] = useState<SystemAuditErrorLog | null>(null);
  const [errorResolutionText, setErrorResolutionText] = useState('');
  const [auditLogSearch, setAuditLogSearch] = useState('');
  const [auditLogTypeFilter, setAuditLogTypeFilter] = useState<'all' | 'success' | 'failed' | 'expired'>('all');

  // -----------------------------------------------------------------
  // CALCULATED METRICS FOR 3D SALES DASHBOARD
  // -----------------------------------------------------------------
  const activeBranchList = useMemo(() => {
    return warehouses.length > 0 ? warehouses : [
      { id: 'wh-main', tenantId: tenant.id, name: 'প্রধান ওয়্যারহাউস (CDC)', location: 'ঢাকা', isMain: true },
      { id: 'wh-dhanmondi', tenantId: tenant.id, name: 'ধানমন্ডি আউটলেট শাখা', location: 'ধানমন্ডি', isMain: false },
      { id: 'wh-uttara', tenantId: tenant.id, name: 'উত্তরা এক্সপ্রেস ব্রাঞ্চ', location: 'উত্তরা', isMain: false },
    ];
  }, [warehouses, tenant.id]);

  // Simulated 3D Multi-Branch Bars across timeline
  const spatialBarData = useMemo(() => {
    const intervals = timeRange === 'today'
      ? ['সকাল ৮-১১টা', 'দুপুর ১২-৩টা', 'বিকেল ৪-৭টা', 'রাত ৮-১০টা']
      : timeRange === '7days'
      ? ['শনিবার', 'রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার']
      : timeRange === 'month'
      ? ['সপ্তাহ ১', 'সপ্তাহ ২', 'সপ্তাহ ৩', 'সপ্তাহ ৪']
      : ['Q1 (জানু-মার্চ)', 'Q2 (এপ্রিল-জুন)', 'Q3 (জুলাই-সেপ্টে)', 'Q4 (অক্টো-ডিসেম্বর)'];

    // Base multiplier according to metric
    const baseMult = metricType === 'revenue' ? 1000 : metricType === 'profit' ? 250 : 15;

    return intervals.map((interval, idx) => {
      // Dynamic simulated volumes for 3 branches
      const branchValues = activeBranchList.slice(0, 3).map((branch, bIdx) => {
        const factor = (idx + 1) * 1.35 + (bIdx * 0.8) + (idx % 2 === 0 ? 1.2 : 0.6);
        const rawVal = Math.round(factor * baseMult * 12);
        return {
          branchId: branch.id,
          branchName: branch.name,
          value: rawVal,
        };
      });

      const totalValue = branchValues.reduce((s, b) => s + b.value, 0);

      return {
        label: interval,
        branchValues,
        totalValue,
      };
    });
  }, [timeRange, metricType, activeBranchList]);

  const maxSpatialValue = useMemo(() => {
    let max = 1;
    spatialBarData.forEach(item => {
      item.branchValues.forEach(b => {
        if (b.value > max) max = b.value;
      });
    });
    return max;
  }, [spatialBarData]);

  // Category distribution cubes
  const category3DMetrics = useMemo(() => {
    const cats = [
      { name: 'ওষুধ ও ফার্মাসিউটিক্যালস', share: 45, color: '#8b5cf6', hexDark: '#6d28d9', hexLight: '#a78bfa', growth: '+22.4%' },
      { name: 'শিশু খাদ্য ও পুষ্টি', share: 25, color: '#3b82f6', hexDark: '#1d4ed8', hexLight: '#60a5fa', growth: '+15.8%' },
      { name: 'চিকিৎসা ও ডায়াগনস্টিক সামগ্রী', share: 18, color: '#10b981', hexDark: '#047857', hexLight: '#34d399', growth: '+8.2%' },
      { name: 'কসমেটিকস ও পার্সোনাল কেয়ার', share: 12, color: '#f59e0b', hexDark: '#b45309', hexLight: '#fbbf24', growth: '+5.1%' },
    ];
    return cats;
  }, []);

  // -----------------------------------------------------------------
  // CASH REGISTER METRICS
  // -----------------------------------------------------------------
  const activeShift = useMemo(() => {
    return cashRegisterShifts.find(s => s.status === 'open') || null;
  }, [cashRegisterShifts]);

  const closedShifts = useMemo(() => {
    return cashRegisterShifts.filter(s => s.status === 'closed');
  }, [cashRegisterShifts]);

  // Calculate dynamic counted cash inside close shift modal
  const computedCountedCash = useMemo(() => {
    const c1000 = (parseInt(denom1000) || 0) * 1000;
    const c500 = (parseInt(denom500) || 0) * 500;
    const c200 = (parseInt(denom200) || 0) * 200;
    const c100 = (parseInt(denom100) || 0) * 100;
    const c50 = (parseInt(denom50) || 0) * 50;
    const cCoins = parseInt(denomCoins) || 0;
    return c1000 + c500 + c200 + c100 + c50 + cCoins;
  }, [denom1000, denom500, denom200, denom100, denom50, denomCoins]);

  // -----------------------------------------------------------------
  // INVENTORY RADAR METRICS
  // -----------------------------------------------------------------
  // 1. Negative Stock products
  const negativeStockProducts = useMemo(() => {
    return products.filter(p => p.stock <= 0);
  }, [products]);

  // 2. Stock Aging Analysis
  const agedProductsData = useMemo(() => {
    const now = new Date();
    return products.map(p => {
      // simulate age based on sku hash or batch
      const hash = (p.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 210);
      let bracket: '0_30' | '31_60' | '61_90' | '91_180' | '180_plus' = '0_30';
      let statusColor = 'emerald';
      let recommendation = 'স্বাভাবিক বিক্রয় প্রবাহ';
      let discountOffer = 0;

      if (hash > 180) {
        bracket = '180_plus';
        statusColor = 'rose';
        recommendation = 'ডেড স্টক ঝুঁকি: ৩০% ক্লিয়ারেন্স বা সাপ্লায়ার রিটার্ন';
        discountOffer = 30;
      } else if (hash > 90) {
        bracket = '91_180';
        statusColor = 'amber';
        recommendation = 'মন্থর গতি: ১৫% ডিসকাউন্টে বান্ডেল অফার দিন';
        discountOffer = 15;
      } else if (hash > 60) {
        bracket = '61_90';
        statusColor = 'yellow';
        recommendation = 'সতর্কতা: বিক্রয় গতি হ্রাস পেয়েছে (৫% অফার)';
        discountOffer = 5;
      } else if (hash > 30) {
        bracket = '31_60';
        statusColor = 'blue';
        recommendation = 'নিয়মিত স্টোরেজ ও ইনভেন্টরি ঘূর্ণন';
      }

      const totalVal = (p.costPrice || p.sellingPrice * 0.8) * Math.max(1, p.stock);

      return {
        product: p,
        ageDays: hash,
        bracket,
        statusColor,
        recommendation,
        discountOffer,
        tiedUpCapital: totalVal,
      };
    });
  }, [products]);

  const filteredAgedProducts = useMemo(() => {
    if (agingFilter === 'all') return agedProductsData;
    return agedProductsData.filter(item => item.bracket === agingFilter);
  }, [agedProductsData, agingFilter]);

  const totalCapitalTiedUp = useMemo(() => {
    return agedProductsData.reduce((sum, item) => sum + item.tiedUpCapital, 0);
  }, [agedProductsData]);

  const deadStockCapital = useMemo(() => {
    return agedProductsData
      .filter(item => item.bracket === '180_plus' || item.bracket === '91_180')
      .reduce((sum, item) => sum + item.tiedUpCapital, 0);
  }, [agedProductsData]);

  // 3. Batch & Expiry Timeline
  const expiryTimeline = useMemo(() => {
    const today = new Date();
    return products
      .filter(p => p.expiryDate)
      .map(p => {
        const expDate = new Date(p.expiryDate!);
        const diffMs = expDate.getTime() - today.getTime();
        const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        return {
          product: p,
          expiryDate: p.expiryDate!,
          batchNumber: p.batchNumber || 'BAT-2026-X',
          daysLeft,
          status: daysLeft <= 30 ? 'critical' : daysLeft <= 60 ? 'urgent' : daysLeft <= 90 ? 'warning' : 'safe',
        };
      })
      .sort((a, b) => a.daysLeft - b.daysLeft);
  }, [products]);

  const filteredExpiryTimeline = useMemo(() => {
    return expiryTimeline.filter(item => item.daysLeft <= expiryDaysFilter);
  }, [expiryTimeline, expiryDaysFilter]);

  // -----------------------------------------------------------------
  // RANKING MATRIX METRICS
  // -----------------------------------------------------------------
  // Top 5 Customers
  const topCustomers = useMemo(() => {
    return [...customers]
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5);
  }, [customers]);

  // Inactive Churn-Risk Customers
  const inactiveCustomers = useMemo(() => {
    const now = new Date();
    return customers.map(c => {
      const lastDate = c.lastPurchased ? new Date(c.lastPurchased) : new Date(now.getTime() - 40 * 86400000);
      const daysSince = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      return {
        customer: c,
        daysSince,
        churnRisk: daysSince > 90 ? 'High' : daysSince > 60 ? 'Medium' : 'Low',
      };
    }).filter(item => item.daysSince >= inactiveDaysThreshold)
      .sort((a, b) => b.daysSince - a.daysSince);
  }, [customers, inactiveDaysThreshold]);

  // Top Suppliers
  const topSuppliersPerformance = useMemo(() => {
    return suppliers.map((sup, idx) => {
      const fulfillmentRate = 98 - (idx * 3);
      const onTimeRate = 96 - (idx * 2);
      const qualityScore = (4.9 - (idx * 0.15)).toFixed(1);
      const totalPoBDT = 150000 + (suppliers.length - idx) * 45000;
      return {
        supplier: sup,
        fulfillmentRate,
        onTimeRate,
        qualityScore,
        totalPoBDT,
      };
    });
  }, [suppliers]);

  // -----------------------------------------------------------------
  // SECURITY & SYSTEM AUDIT METRICS
  // -----------------------------------------------------------------
  const filteredLoginLogs = useMemo(() => {
    return loginActivityLogs.filter(log => {
      if (auditLogTypeFilter === 'success' && log.status !== 'success') return false;
      if (auditLogTypeFilter === 'failed' && log.status !== 'failed_credentials' && log.status !== 'blocked_ip') return false;
      if (auditLogTypeFilter === 'expired' && log.status !== 'session_expired') return false;

      if (auditLogSearch.trim()) {
        const q = auditLogSearch.toLowerCase();
        const matchName = log.userName.toLowerCase().includes(q);
        const matchIp = log.ipAddress.includes(q);
        const matchCity = log.locationCity.toLowerCase().includes(q);
        const matchBrowser = log.browser.toLowerCase().includes(q);
        if (!matchName && !matchIp && !matchCity && !matchBrowser) return false;
      }
      return true;
    });
  }, [loginActivityLogs, auditLogTypeFilter, auditLogSearch]);

  const unresolvedErrorsCount = useMemo(() => {
    return systemErrorLogs.filter(e => !e.resolved).length;
  }, [systemErrorLogs]);

  // Handlers
  const handleStartShiftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const openCashNum = parseFloat(newShiftOpeningCash) || 0;
    const selectedCashier = employees.find(e => e.id === newShiftCashierId);
    onOpenShift({
      tenantId: tenant.id,
      warehouseId: newShiftWarehouseId,
      registerName: newShiftRegisterName,
      cashierId: newShiftCashierId,
      cashierName: selectedCashier ? selectedCashier.name : 'ক্যাশিয়ার',
      openedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      openingCash: openCashNum,
    });
    setIsOpenNewShiftModalOpen(false);
  };

  const handleCloseShiftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shiftToClose) return;
    onCloseShift(shiftToClose.id, computedCountedCash, closeShiftNotes, {
      note1000: parseInt(denom1000) || 0,
      note500: parseInt(denom500) || 0,
      note200: parseInt(denom200) || 0,
      note100: parseInt(denom100) || 0,
      note50: parseInt(denom50) || 0,
      coins: parseInt(denomCoins) || 0,
    });
    setIsCloseShiftModalOpen(false);
    setShiftToClose(null);
  };

  const handleCashAdjustmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeShift) return;
    const amount = parseFloat(cashAdjAmount);
    if (!amount || amount <= 0) return;
    onAddCashAdjustment(activeShift.id, cashAdjType, amount, cashAdjReason.trim() || (cashAdjType === 'cash_in' ? 'ক্যাশ ইনজেকশন' : 'সেফে জমা'));
    setIsCashAdjModalOpen(false);
    setCashAdjAmount('');
    setCashAdjReason('');
  };

  const handleSaveStockAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdjustProduct || !onStockAdjustment) return;
    const newStockNum = parseInt(adjustNewStock, 10);
    onStockAdjustment(selectedAdjustProduct, newStockNum, adjustReason);
    setSelectedAdjustProduct(null);
  };

  const handleSendReactivationSms = (cust: Customer) => {
    const msg = `শ্রদ্ধেয় ${cust.name}, ${tenant.name}-এ আপনি অনেকদিন আসেননি। আপনার জন্য বিশেষ ১০% ডিসকাউন্ট ভাউচার JH2026 চালু করা হয়েছে। ভিজিট করুন!`;
    if (onSendSmsAlert) {
      onSendSmsAlert(cust.phone, msg);
    }
    setSmsSuccessToast(`${cust.name}-কে অফার SMS পাঠানো হয়েছে!`);
    setTimeout(() => setSmsSuccessToast(null), 3500);
  };

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedErrorForResolve) return;
    onResolveErrorLog(selectedErrorForResolve.id, errorResolutionText.trim() || 'ইস্যুটি সমাধান করা হয়েছে।');
    setSelectedErrorForResolve(null);
    setErrorResolutionText('');
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {smsSuccessToast && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-center gap-3 animate-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{smsSuccessToast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl border border-purple-500/30 relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
          <Box className="w-72 h-72 text-purple-200" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-400/30 backdrop-blur-xs">
                <Box className="w-5 h-5 text-purple-300" />
              </span>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                3D অ্যানালিটিক্স, ক্যাশ শিফট ও ইনভেন্টরি গোয়েন্দা হাব
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider">
                Phase 24 Live
              </span>
            </div>
            <p className="text-xs text-purple-200/90 max-w-2xl leading-relaxed">
              শাখা ও সময়ের ত্রিমাত্রিক (3D Spatial) বিক্রয় অ্যানালিটিক্স, পিওএস কাউন্টার ক্যাশ শিফট রিকনসিলিয়েশন (Z-Report), নেগেটিভ স্টক রাডার, কাস্টমার রিটার্ন রেটিং এবং সিস্টেম সিকিউরিটি অডিট ট্রেইল।
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              onClick={() => setActiveTab('cash_register')}
              className="px-3.5 py-2 bg-purple-600/30 hover:bg-purple-600/50 border border-purple-400/40 rounded-xl text-xs font-bold text-white transition flex items-center gap-1.5"
            >
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>শিফট স্ট্যাটাস: {activeShift ? 'সক্রিয় (Open)' : 'বন্ধ (Closed)'}</span>
            </button>
            <button
              onClick={() => setActiveTab('inventory_radar')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                negativeStockProducts.length > 0 ? 'bg-rose-500 text-white animate-pulse' : 'bg-emerald-600/30 border border-emerald-400/30 text-emerald-200'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>নেগেটিভ স্টক ({negativeStockProducts.length})</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-purple-500/20 overflow-x-auto text-xs font-bold scrollbar-none">
          <button
            onClick={() => setActiveTab('3d_dashboard')}
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === '3d_dashboard'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-purple-200 hover:text-white hover:bg-purple-800/40'
            }`}
          >
            <Box className="w-4 h-4" />
            <span>৩ডি সেলস ও ব্রাঞ্চ ড্যাশবোর্ড</span>
          </button>

          <button
            onClick={() => setActiveTab('cash_register')}
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'cash_register'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-purple-200 hover:text-white hover:bg-purple-800/40'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>ক্যাশ রেজিস্টার শিফট ও Z-রিপোর্ট</span>
            {activeShift && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('inventory_radar')}
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'inventory_radar'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-purple-200 hover:text-white hover:bg-purple-800/40'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>ইনভেন্টরি গোয়েন্দা ও স্টক এজিং</span>
            {negativeStockProducts.length > 0 && (
              <span className="px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[10px]">
                {negativeStockProducts.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('ranking_matrix')}
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'ranking_matrix'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-purple-200 hover:text-white hover:bg-purple-800/40'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>কাস্টমার ও সাপ্লায়ার র্যাঙ্কিং</span>
          </button>

          <button
            onClick={() => setActiveTab('security_audit')}
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'security_audit'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-purple-200 hover:text-white hover:bg-purple-800/40'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>সিকিউরিটি ও সিস্টেম অডিট লগ</span>
            {unresolvedErrorsCount > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-500 text-slate-900 rounded-full text-[10px]">
                {unresolvedErrorsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: 3D INTERACTIVE SPATIAL SALES & BRANCH DASHBOARD                     */}
      {/* ========================================================================= */}
      {activeTab === '3d_dashboard' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-4">
            {/* View Angle Mode */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => { setView3DMode('isometric'); setCameraYaw(-35); }}
                className={`px-3 py-1.5 rounded-lg transition ${
                  view3DMode === 'isometric' ? 'bg-purple-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🧊 আইসোমেট্রিক (3D Iso)
              </button>
              <button
                onClick={() => { setView3DMode('perspective'); setCameraYaw(-15); }}
                className={`px-3 py-1.5 rounded-lg transition ${
                  view3DMode === 'perspective' ? 'bg-purple-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                📐 পারস্পেকটিভ (3D Tilt)
              </button>
              <button
                onClick={() => { setView3DMode('front'); setCameraYaw(0); }}
                className={`px-3 py-1.5 rounded-lg transition ${
                  view3DMode === 'front' ? 'bg-purple-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                📊 ফ্ল্যাট চার্ট (2D Front)
              </button>
            </div>

            {/* Timeframe Toggles */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              {(['today', '7days', 'month', 'year'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTimeRange(t)}
                  className={`px-2.5 py-1.5 rounded-lg transition capitalize ${
                    timeRange === t ? 'bg-white text-purple-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {t === 'today' ? 'আজ' : t === '7days' ? '৭ দিন' : t === 'month' ? 'চলতি মাস' : 'বছর'}
                </button>
              ))}
            </div>

            {/* Metric Selector */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-medium">মেট্রিক:</span>
              <select
                value={metricType}
                onChange={e => setMetricType(e.target.value as any)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-600"
              >
                <option value="revenue">মোট বিক্রয় (Revenue ৳)</option>
                <option value="profit">নিট মুনাফা (Estimated Profit ৳)</option>
                <option value="transactions">মোট ভাউচার সংখ্যা (Transactions)</option>
              </select>
            </div>

            {/* Camera Rotation Slider */}
            {view3DMode !== 'front' && (
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span className="text-[11px] font-semibold">ক্যামেরা রোটেশন:</span>
                <input
                  type="range"
                  min="-60"
                  max="60"
                  value={cameraYaw}
                  onChange={e => setCameraYaw(parseInt(e.target.value))}
                  className="w-24 accent-purple-700 cursor-pointer"
                />
                <span className="font-mono text-[10px] w-6">{cameraYaw}°</span>
              </div>
            )}
          </div>

          {/* 3D Multi-Branch Spatial Stage */}
          <div className="bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 rounded-3xl p-6 text-white border border-slate-800 shadow-2xl relative overflow-hidden min-h-[460px] flex flex-col justify-between">
            {/* Stage Grid Background Lines */}
            <div className="absolute inset-0 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

            {/* Top HUD Stats Overlay */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-b border-indigo-900/50 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">ত্রিমাত্রিক শাখা পারফরম্যান্স ভিজুয়ালাইজার</span>
                <h4 className="text-base font-extrabold text-white flex items-center gap-2">
                  <span>৩ডি শাখা তুলনা ও রাজস্ব বিশ্লেষণ</span>
                  <span className="text-xs px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-400/30">
                    {activeBranchList.slice(0, 3).length}টি শাখা সক্রিয়
                  </span>
                </h4>
              </div>

              {/* Branch Legend */}
              <div className="flex items-center gap-3 text-xs flex-wrap">
                {activeBranchList.slice(0, 3).map((branch, i) => {
                  const colors = [
                    { dot: 'bg-purple-500', text: 'text-purple-300' },
                    { dot: 'bg-sky-400', text: 'text-sky-300' },
                    { dot: 'bg-emerald-400', text: 'text-emerald-300' },
                  ][i] || { dot: 'bg-amber-400', text: 'text-amber-300' };
                  return (
                    <div key={branch.id} className="flex items-center gap-1.5 font-medium">
                      <span className={`w-3 h-3 rounded-full ${colors.dot} shadow-xs`} />
                      <span className={colors.text}>{branch.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3D Spatial Canvas Stage */}
            <div 
              className="relative z-10 my-8 flex items-end justify-around h-64 px-4 transition-all duration-300 select-none"
              style={{
                perspective: '1200px',
                transform: view3DMode === 'isometric'
                  ? `rotateX(42deg) rotateY(0deg) rotateZ(${cameraYaw}deg)`
                  : view3DMode === 'perspective'
                  ? `rotateX(28deg) rotateY(${cameraYaw * 0.5}deg)`
                  : 'none',
                transformStyle: 'preserve-3d',
              }}
            >
              {/* Floor Shadow Plane in 3D */}
              {view3DMode !== 'front' && (
                <div 
                  className="absolute inset-x-8 -bottom-4 h-16 bg-indigo-500/10 rounded-full blur-2xl transform -rotate-x-90 pointer-events-none"
                />
              )}

              {spatialBarData.map((col, idx) => {
                return (
                  <div key={idx} className="flex flex-col items-center gap-2 group relative">
                    {/* Bar Cluster for 3 Branches */}
                    <div className="flex items-end gap-2.5 h-48 justify-center">
                      {col.branchValues.map((bVal, bIdx) => {
                        const heightPct = Math.max(12, Math.round((bVal.value / maxSpatialValue) * 100));
                        const themeGradients = [
                          {
                            front: 'from-purple-600 to-indigo-700',
                            side: 'bg-purple-900',
                            top: 'bg-purple-400',
                            glow: 'shadow-[0_0_20px_rgba(168,85,247,0.3)]',
                          },
                          {
                            front: 'from-sky-500 to-blue-700',
                            side: 'bg-sky-950',
                            top: 'bg-sky-300',
                            glow: 'shadow-[0_0_20px_rgba(56,189,248,0.3)]',
                          },
                          {
                            front: 'from-emerald-500 to-teal-700',
                            side: 'bg-emerald-950',
                            top: 'bg-emerald-300',
                            glow: 'shadow-[0_0_20px_rgba(52,211,153,0.3)]',
                          },
                        ][bIdx] || {
                          front: 'from-amber-500 to-orange-700',
                          side: 'bg-amber-950',
                          top: 'bg-amber-300',
                          glow: 'shadow-[0_0_20px_rgba(251,191,36,0.3)]',
                        };

                        return (
                          <div
                            key={bIdx}
                            onMouseEnter={() => setHovered3DBar({
                              label: col.label,
                              branch: bVal.branchName,
                              value: bVal.value,
                              sub: metricType === 'revenue' ? `${currency}${bVal.value.toLocaleString()}` : `${bVal.value} Units`,
                            })}
                            onMouseLeave={() => setHovered3DBar(null)}
                            style={{ height: `${heightPct}%` }}
                            className={`w-6 sm:w-8 bg-gradient-to-t ${themeGradients.front} rounded-t-sm relative transition-all duration-300 hover:brightness-125 cursor-pointer ${themeGradients.glow}`}
                          >
                            {/* 3D Top Cap */}
                            {view3DMode !== 'front' && (
                              <div
                                className={`absolute -top-2 left-0 right-0 h-2 ${themeGradients.top} transform -skew-x-12 origin-bottom rounded-xs opacity-90`}
                              />
                            )}

                            {/* 3D Right Side Depth */}
                            {view3DMode !== 'front' && (
                              <div
                                className={`absolute top-0 -right-2 bottom-0 w-2 ${themeGradients.side} transform -skew-y-12 origin-left rounded-r-xs opacity-80`}
                              />
                            )}

                            {/* Height Value Floating Badge */}
                            <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-lg border border-purple-400 whitespace-nowrap z-30 transition">
                              {metricType === 'revenue' ? `${currency}${bVal.value.toLocaleString()}` : bVal.value}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Timeline Label */}
                    <span className="text-[11px] font-semibold text-slate-300 mt-2 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700 whitespace-nowrap">
                      {col.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Bottom Floating Hover HUD */}
            <div className="relative z-10 pt-3 border-t border-indigo-900/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                {hovered3DBar ? (
                  <span>
                    বাছাইকৃত: <strong className="text-white">{hovered3DBar.branch}</strong> • {hovered3DBar.label} এ অর্জিত: <strong className="text-emerald-400 font-mono">{hovered3DBar.sub}</strong>
                  </span>
                ) : (
                  <span className="text-slate-400">বারগুলোর উপর মাউস হোভার করে বিস্তারিত তথ্য দেখুন</span>
                )}
              </div>

              <div className="flex items-center gap-3 text-slate-400">
                <span>সর্বোচ্চ প্রবৃদ্ধি: <strong className="text-emerald-400">+২৪.৫%</strong></span>
                <span>•</span>
                <span>অটো-রিফ্রেশ: <strong className="text-purple-300">লাইভ সিঙ্ক</strong></span>
              </div>
            </div>
          </div>

          {/* 3D Category Performance Cubes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {category3DMetrics.map((cat, idx) => (
              <div
                key={idx}
                className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition relative overflow-hidden group"
              >
                <div 
                  style={{ backgroundColor: `${cat.color}15` }}
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 text-purple-700 transition group-hover:scale-110"
                >
                  <Box className="w-6 h-6" style={{ color: cat.color }} />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">{cat.name}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                    {cat.growth}
                  </span>
                </div>

                <div className="flex items-baseline gap-2 mt-1">
                  <h4 className="text-xl font-black text-slate-900">{cat.share}%</h4>
                  <span className="text-xs text-slate-400">মোট বিক্রয়ের অংশ</span>
                </div>

                {/* Simulated 3D isometric mini cube */}
                <div className="mt-3 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${cat.share * 2}%`, backgroundColor: cat.color }}
                    className="h-full rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CASH REGISTER SHIFT REPORTS & Z-REPORT RECONCILIATION              */}
      {/* ========================================================================= */}
      {activeTab === 'cash_register' && (
        <div className="space-y-6">
          {/* Active Shift Overview Card */}
          <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 rounded-3xl p-6 text-white border border-emerald-500/30 shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">চলতি সক্রিয় পিওএস শিফট (Active Live Shift)</span>
                </div>
                <h3 className="text-xl font-black text-white">
                  {activeShift ? activeShift.registerName : 'বর্তমানে কোনো সক্রিয় শিফট চালু নেই'}
                </h3>
                {activeShift && (
                  <p className="text-xs text-slate-300">
                    দায়িত্বপ্রাপ্ত ক্যাশিয়ার: <strong className="text-white">{activeShift.cashierName}</strong> • শুরুর সময়: <strong className="text-emerald-300 font-mono">{activeShift.openedAt}</strong>
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {activeShift ? (
                  <>
                    <button
                      onClick={() => setIsCashAdjModalOpen(true)}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 transition flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5 text-amber-400" />
                      <span>ক্যাশ ইন / আউট (Safe Drop)</span>
                    </button>
                    <button
                      onClick={() => {
                        setShiftToClose(activeShift);
                        setIsCloseShiftModalOpen(true);
                      }}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>শিফট ক্লোজ ও ব্যালেন্স মিলান (Z-Report)</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsOpenNewShiftModalOpen(true)}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    <span>নতুন পিওএস শিফট শুরু করুন</span>
                  </button>
                )}
              </div>
            </div>

            {/* Active Shift Financial Matrix */}
            {activeShift && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-slate-800 text-xs">
                <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">ওপেনিং ক্যাশ:</span>
                  <span className="text-base font-extrabold text-white font-mono mt-0.5 block">
                    {currency}{activeShift.openingCash.toLocaleString()}
                  </span>
                </div>

                <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800">
                  <span className="text-emerald-400 block text-[10px]">নগদ বিক্রয় (Cash Sales):</span>
                  <span className="text-base font-extrabold text-emerald-400 font-mono mt-0.5 block">
                    +{currency}{activeShift.totalCashSales.toLocaleString()}
                  </span>
                </div>

                <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800">
                  <span className="text-sky-400 block text-[10px]">ডিজিটাল পেমেন্ট (bKash/Card):</span>
                  <span className="text-base font-extrabold text-sky-400 font-mono mt-0.5 block">
                    {currency}{activeShift.totalDigitalSales.toLocaleString()}
                  </span>
                </div>

                <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800">
                  <span className="text-rose-400 block text-[10px]">ফেরত ও খরচ (Returns/Exp):</span>
                  <span className="text-base font-extrabold text-rose-400 font-mono mt-0.5 block">
                    -{currency}{(activeShift.totalReturnsRefunded + activeShift.totalExpensesPaid).toLocaleString()}
                  </span>
                </div>

                <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800">
                  <span className="text-amber-400 block text-[10px]">ক্যাশ ইনজেকশন/ড্রপ:</span>
                  <span className="text-base font-extrabold text-amber-300 font-mono mt-0.5 block">
                    {activeShift.cashAdded - activeShift.cashRemoved >= 0 ? '+' : ''}{currency}{(activeShift.cashAdded - activeShift.cashRemoved).toLocaleString()}
                  </span>
                </div>

                <div className="bg-emerald-950/80 p-3 rounded-xl border border-emerald-500/40">
                  <span className="text-emerald-300 block text-[10px] font-bold">প্রত্যাশিত ক্যাশ ড্রয়ার ব্যালেন্স:</span>
                  <span className="text-base font-black text-emerald-200 font-mono mt-0.5 block">
                    {currency}{activeShift.expectedClosingCash.toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Past Closed Shifts History Table */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm">বিগত ক্যাশ রেজিস্টার শিফট লগ ও Z-রিপোর্ট খতিয়ান</h4>
                <p className="text-xs text-slate-500">প্রতিটি শিফটের শুরু ও শেষের অডিট ট্রেইল এবং ক্যাশ তারতম্য (Over/Short)</p>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-700 rounded-xl">
                মোট {cashRegisterShifts.length}টি শিফট
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">রেজিস্টার ও ক্যাশিয়ার</th>
                    <th className="py-3 px-4">শুরু ও সমাপ্তি সময়</th>
                    <th className="py-3 px-4 text-right">ওপেনিং ক্যাশ</th>
                    <th className="py-3 px-4 text-right">নগদ বিক্রয়</th>
                    <th className="py-3 px-4 text-right">প্রত্যাশিত ক্যাশ</th>
                    <th className="py-3 px-4 text-right">প্রকৃত গোনা ক্যাশ</th>
                    <th className="py-3 px-4 text-center">তারতম্য ($ \Delta $)</th>
                    <th className="py-3 px-4 text-center">স্ট্যাটাস</th>
                    <th className="py-3 px-4 text-center">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cashRegisterShifts.map((shift) => {
                    const diff = shift.cashDifference || 0;
                    return (
                      <tr key={shift.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-4">
                          <strong className="text-slate-900 block font-semibold">{shift.registerName}</strong>
                          <span className="text-[11px] text-slate-500">{shift.cashierName}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                          <div>শুরু: {shift.openedAt}</div>
                          <div className="text-slate-400">শেষ: {shift.closedAt || 'চলমান...'}</div>
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-slate-700">
                          {currency}{shift.openingCash.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                          {currency}{shift.totalCashSales.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                          {currency}{shift.expectedClosingCash.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-indigo-900">
                          {shift.actualClosingCash !== undefined ? `${currency}${shift.actualClosingCash.toLocaleString()}` : '—'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {shift.status === 'open' ? (
                            <span className="text-[11px] text-slate-400">চলমান</span>
                          ) : diff === 0 ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                              সঠিক (৳০)
                            </span>
                          ) : diff > 0 ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                              +{currency}{diff} অতিরিক্ত
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                              -{currency}{Math.abs(diff)} ঘাটতি
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            shift.status === 'open' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {shift.status === 'open' ? 'সক্রিয়' : 'সম্পন্ন'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => setSelectedShiftForZReport(shift)}
                            className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg font-bold text-xs transition inline-flex items-center gap-1"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Z-রিপোর্ট</span>
                          </button>
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

      {/* ========================================================================= */}
      {/* TAB 3: INVENTORY RADAR (NEGATIVE STOCK, AGING & EXPIRY REGISTER)          */}
      {/* ========================================================================= */}
      {activeTab === 'inventory_radar' && (
        <div className="space-y-6">
          {/* Sub Navigation Bar */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setRadarSubTab('aging')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  radarSubTab === 'aging' ? 'bg-purple-700 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>স্টক এজিং এনালাইসিস (Stock Aging)</span>
              </button>

              <button
                onClick={() => setRadarSubTab('negative')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  radarSubTab === 'negative' ? 'bg-rose-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>নেগেটিভ স্টক রাডার ({negativeStockProducts.length})</span>
              </button>

              <button
                onClick={() => setRadarSubTab('expiry')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  radarSubTab === 'expiry' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>ব্যাচ ও মেয়াদোত্তীর্ণ ক্যালেন্ডার ({filteredExpiryTimeline.length})</span>
              </button>
            </div>
          </div>

          {/* VIEW 1: STOCK AGING ANALYSIS */}
          {radarSubTab === 'aging' && (
            <div className="space-y-6">
              {/* Financial Capital Tied Up KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
                  <span className="text-xs font-semibold text-slate-500">মোট আটকে থাকা ইনভেন্টরি মূলধন</span>
                  <h4 className="text-xl font-extrabold text-slate-900 mt-1 font-mono">
                    {currency}{totalCapitalTiedUp.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1">দোকানের সকল সক্রিয় স্টকের মোট ক্রয়মূল্য</p>
                </div>

                <div className="bg-rose-50/80 p-5 rounded-2xl border border-rose-200 shadow-2xs">
                  <span className="text-xs font-semibold text-rose-800">ডেড স্টক ও মন্থর মূলধন (৯১+ দিন)</span>
                  <h4 className="text-xl font-extrabold text-rose-900 mt-1 font-mono">
                    {currency}{deadStockCapital.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </h4>
                  <p className="text-[11px] text-rose-600 mt-1">তাত্ক্ষণিক ক্লিয়ারেন্স সেল বা ফেরত সুপারিশ</p>
                </div>

                <div className="bg-purple-50/80 p-5 rounded-2xl border border-purple-200 shadow-2xs">
                  <span className="text-xs font-semibold text-purple-800">দ্রুত ঘূর্ণনশীল পণ্য (০-৩০ দিন)</span>
                  <h4 className="text-xl font-extrabold text-purple-900 mt-1 font-mono">
                    {agedProductsData.filter(i => i.bracket === '0_30').length} টি পণ্য
                  </h4>
                  <p className="text-[11px] text-purple-600 mt-1">স্বাস্থ্যকর রি-অর্ডার ফ্রিকোয়েন্সি</p>
                </div>

                <div className="bg-amber-50/80 p-5 rounded-2xl border border-amber-200 shadow-2xs">
                  <span className="text-xs font-semibold text-amber-800">গড় ইনভেন্টরি হোল্ডিং বয়স</span>
                  <h4 className="text-xl font-extrabold text-amber-900 mt-1 font-mono">
                    ৪২ দিন (42 Days)
                  </h4>
                  <p className="text-[11px] text-amber-700 mt-1">শিল্প আদর্শ মান: ৩০-৪৫ দিন</p>
                </div>
              </div>

              {/* Age Bracket Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
                {[
                  { id: 'all', label: `সকল পণ্য (${agedProductsData.length})` },
                  { id: '0_30', label: '০-৩০ দিন (Fresh)' },
                  { id: '31_60', label: '৩১-৬০ দিন (Normal)' },
                  { id: '61_90', label: '৬১-৯০ দিন (Slow Warning)' },
                  { id: '91_180', label: '৯১-১৮০ দিন (Stagnant)' },
                  { id: '180_plus', label: '১৮০+ দিন (Dead Stock Risk)' },
                ].map(b => (
                  <button
                    key={b.id}
                    onClick={() => setAgingFilter(b.id as any)}
                    className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap ${
                      agingFilter === b.id ? 'bg-purple-700 text-white shadow-xs font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>

              {/* Aged Products Table */}
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">পণ্য ও বারকোড</th>
                        <th className="py-3 px-4">ক্যাটাগরি</th>
                        <th className="py-3 px-4 text-center">মজুদ বয়স</th>
                        <th className="py-3 px-4 text-right">বর্তমান স্টক</th>
                        <th className="py-3 px-4 text-right">আটকে থাকা টাকা</th>
                        <th className="py-3 px-4">সুপারিশকৃত পদক্ষেপ (AI Recommendation)</th>
                        <th className="py-3 px-4 text-center">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredAgedProducts.map((item) => (
                        <tr key={item.product.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-4">
                            <strong className="text-slate-900 block font-semibold">{item.product.name}</strong>
                            <span className="text-[11px] text-slate-400 font-mono">{item.product.sku}</span>
                          </td>
                          <td className="py-3 px-4 text-slate-600">{item.product.category}</td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.bracket === '180_plus' ? 'bg-rose-100 text-rose-800 font-mono' :
                              item.bracket === '91_180' ? 'bg-amber-100 text-amber-800 font-mono' :
                              item.bracket === '61_90' ? 'bg-yellow-100 text-yellow-800 font-mono' : 'bg-emerald-100 text-emerald-800 font-mono'
                            }`}>
                              {item.ageDays} দিন
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">
                            {item.product.stock} {item.product.unit}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-extrabold text-slate-900">
                            {currency}{item.tiedUpCapital.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-4 text-slate-700">
                            <div className="flex items-center gap-1.5">
                              {item.discountOffer > 0 && (
                                <span className="px-1.5 py-0.5 rounded bg-rose-500 text-white text-[10px] font-bold">
                                  -{item.discountOffer}%
                                </span>
                              )}
                              <span className="text-xs">{item.recommendation}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => {
                                setSelectedAdjustProduct(item.product);
                                setAdjustNewStock(String(item.product.stock));
                              }}
                              className="px-2 py-1 bg-slate-100 hover:bg-purple-100 hover:text-purple-700 text-slate-700 rounded-lg text-xs font-bold transition"
                            >
                              স্টক অডিট
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

          {/* VIEW 2: NEGATIVE STOCK RADAR */}
          {radarSubTab === 'negative' && (
            <div className="space-y-4">
              <div className="bg-rose-50 border border-rose-200 rounded-3xl p-5 text-xs text-rose-900 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-rose-950">নেগেটিভ ও শূন্য স্টক সতর্কতা (Negative Stock Radar)</h4>
                  <p className="mt-0.5 text-rose-800">
                    যখন কোনো পণ্যের ক্রয় চালান এন্ট্রি করার পূর্বেই পিওএস কাউন্টারে বিক্রি হয়ে যায়, অথবা ইনভেন্টরি গণনায় ভুল হয়, তখন স্টক ০ বা ঋণাত্মক হয়। সরাসরি ১-ক্লিকে ফিজিক্যাল অডিট সমন্বয় সম্পন্ন করুন।
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
                <div className="p-4 border-b border-slate-200 font-bold text-slate-800 text-xs flex justify-between">
                  <span>চিহ্নিত ঋণাত্মক / শূন্য মজুদ পণ্যসমূহ ({negativeStockProducts.length})</span>
                </div>
                {negativeStockProducts.length === 0 ? (
                  <div className="p-12 text-center text-slate-400">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                    <p className="font-bold text-slate-700">কোনো ঋণাত্মক বা শূন্য স্টক পণ্য নেই</p>
                    <p className="text-xs text-slate-400 mt-0.5">সব পণ্যের স্টক ব্যালেন্স সন্তোষজনক রয়েছে।</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                        <tr>
                          <th className="py-3 px-4">পণ্য ও SKU</th>
                          <th className="py-3 px-4">ক্যাটাগরি</th>
                          <th className="py-3 px-4 text-center">বর্তমান রেকর্ডকৃত মজুদ</th>
                          <th className="py-3 px-4">সম্ভাব্য কারণ</th>
                          <th className="py-3 px-4 text-center">তাত্ক্ষণিক সমাধান</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {negativeStockProducts.map(p => (
                          <tr key={p.id} className="hover:bg-slate-50/70">
                            <td className="py-3 px-4">
                              <strong className="text-slate-900 block">{p.name}</strong>
                              <span className="text-[11px] text-slate-400 font-mono">{p.sku}</span>
                            </td>
                            <td className="py-3 px-4 text-slate-600">{p.category}</td>
                            <td className="py-3 px-4 text-center">
                              <span className="px-2.5 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-800 font-mono">
                                {p.stock} {p.unit}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-600">
                              {p.stock === 0 ? 'সম্পূর্ণ স্টকআউট, জরুরি রি-অর্ডার প্রয়োজন' : 'চালান ভেন্ডর থেকে আসার আগেই পিওএস বিলিং'}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <button
                                onClick={() => {
                                  setSelectedAdjustProduct(p);
                                  setAdjustNewStock('10');
                                }}
                                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 mx-auto"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                                <span>স্টক সমন্বয় করুন</span>
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

          {/* VIEW 3: BATCH & EXPIRY REGISTER */}
          {radarSubTab === 'expiry' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4 flex-wrap bg-white p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-700">মেয়াদ উত্তীর্ণের সময়সীমা:</span>
                  {[30, 60, 90, 180].map(days => (
                    <button
                      key={days}
                      onClick={() => setExpiryDaysFilter(days)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        expiryDaysFilter === days ? 'bg-purple-700 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {days} দিন
                    </button>
                  ))}
                </div>

                <span className="text-xs text-slate-500 font-medium">
                  আগামী {expiryDaysFilter} দিনের মধ্যে মেয়াদোত্তীর্ণ হবে {filteredExpiryTimeline.length}টি ব্যাচ
                </span>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">পণ্য ও জেনেরিক</th>
                        <th className="py-3 px-4">ব্যাচ নম্বর</th>
                        <th className="py-3 px-4">মেয়াদ শেষ তারিখ</th>
                        <th className="py-3 px-4 text-center">অবশিষ্ট দিন</th>
                        <th className="py-3 px-4 text-right">মজুদ স্টক</th>
                        <th className="py-3 px-4 text-center">জরুরি স্ট্যাটাস</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredExpiryTimeline.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/70">
                          <td className="py-3 px-4">
                            <strong className="text-slate-900 block font-semibold">{item.product.name}</strong>
                            <span className="text-[11px] text-slate-400">{item.product.genericName || item.product.category}</span>
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-slate-700">{item.batchNumber}</td>
                          <td className="py-3 px-4 font-mono text-slate-600">{item.expiryDate}</td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold font-mono ${
                              item.status === 'critical' ? 'bg-rose-100 text-rose-800 animate-pulse' :
                              item.status === 'urgent' ? 'bg-amber-100 text-amber-800' : 'bg-sky-100 text-sky-800'
                            }`}>
                              {item.daysLeft} দিন বাকি
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">
                            {item.product.stock} {item.product.unit}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                              item.status === 'critical' ? 'bg-rose-600 text-white' :
                              item.status === 'urgent' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {item.status === 'critical' ? 'লাল সতর্কতা (<৩০ দিন)' : item.status === 'urgent' ? 'জরুরি ডিসকাউন্ট' : 'মনিটরিং'}
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
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: CUSTOMER & SUPPLIER RANKING MATRIX                                */}
      {/* ========================================================================= */}
      {activeTab === 'ranking_matrix' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Col: Top 5 Customers Leaderboard */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span>সেরা গ্রাহক তালিকা (Top 5 Customers)</span>
                  </h4>
                  <p className="text-xs text-slate-400">সর্বোচ্চ লাইফটাইম বিক্রয় মূল্যের ভিত্তিতে র‍্যাংকিং</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-800">
                  VIP ক্লায়েন্ট
                </span>
              </div>

              <div className="space-y-3">
                {topCustomers.map((c, i) => (
                  <div
                    key={c.id}
                    className="p-3.5 rounded-2xl bg-slate-50 hover:bg-purple-50/50 border border-slate-100 transition flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center shrink-0 ${
                        i === 0 ? 'bg-amber-100 text-amber-900' :
                        i === 1 ? 'bg-slate-200 text-slate-800' :
                        i === 2 ? 'bg-orange-100 text-orange-900' : 'bg-purple-100 text-purple-800'
                      }`}>
                        #{i + 1}
                      </div>
                      <div>
                        <strong className="text-xs font-bold text-slate-900 block">{c.name}</strong>
                        <span className="text-[11px] text-slate-500 font-mono">{c.phone} • {c.purchaseCount} বার ক্রয়</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-black text-purple-900 block font-mono">
                        {currency}{c.totalSpent.toLocaleString()}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase bg-purple-100 text-purple-800">
                        {c.loyaltyTier || 'gold'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Col: Inactive Customers & Churn Risk */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-rose-500" />
                    <span>নিষ্ক্রিয় ও হারানোর ঝুঁকিতে থাকা খদ্দের (Churn Radar)</span>
                  </h4>
                  <p className="text-xs text-slate-400">নির্দিষ্ট দিন ধরে কোনো লেনদেন না করা গ্রাহক</p>
                </div>

                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-[11px] font-bold">
                  {([30, 60, 90] as const).map(d => (
                    <button
                      key={d}
                      onClick={() => setInactiveDaysThreshold(d)}
                      className={`px-2 py-0.5 rounded-lg transition ${
                        inactiveDaysThreshold === d ? 'bg-white text-purple-900 shadow-2xs' : 'text-slate-500'
                      }`}
                    >
                      {d} দিন+
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {inactiveCustomers.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-8">কোনো নিষ্ক্রিয় গ্রাহক পাওয়া যায়নি।</p>
                ) : (
                  inactiveCustomers.map(({ customer, daysSince, churnRisk }) => (
                    <div
                      key={customer.id}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <strong className="text-slate-900 font-bold block">{customer.name}</strong>
                        <span className="text-[11px] text-rose-600 font-semibold font-mono">
                          {daysSince} দিন ধরে কোনো ক্রয় নেই (ঝুঁকি: {churnRisk})
                        </span>
                      </div>

                      <button
                        onClick={() => handleSendReactivationSms(customer)}
                        className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shrink-0"
                      >
                        <Send className="w-3 h-3" />
                        <span>অফার SMS</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Top Suppliers Scorecard */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="p-5 border-b border-slate-200">
              <h4 className="font-extrabold text-sm text-slate-900">শীর্ষ সরবরাহকারী পারফরম্যান্স স্কোরকার্ড (Supplier Scorecard)</h4>
              <p className="text-xs text-slate-500">অন-টাইম ডেলিভারি রেট, কোয়ালিটি স্কোর এবং মোট ক্রয়ের পরিমাণ</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">সরবরাহকারী প্রতিষ্ঠান</th>
                    <th className="py-3 px-4">যোগাযোগ নম্বর</th>
                    <th className="py-3 px-4 text-center">অন-টাইম ডেলিভারি %</th>
                    <th className="py-3 px-4 text-center">কোয়ালিটি স্কোর (৫.০)</th>
                    <th className="py-3 px-4 text-right">মোট ক্রয় ভলিউম</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {topSuppliersPerformance.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4">
                        <strong className="text-slate-900 font-semibold block">{item.supplier.name}</strong>
                        <span className="text-[11px] text-slate-400">{item.supplier.companyName || 'ভেন্ডর'}</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">{item.supplier.phone}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 font-mono">
                          {item.onTimeRate}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 font-mono">
                          ⭐ {item.qualityScore}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        {currency}{item.totalPoBDT.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: SECURITY AUDIT & SYSTEM ERROR LOGS                                 */}
      {/* ========================================================================= */}
      {activeTab === 'security_audit' && (
        <div className="space-y-6">
          {/* Security KPI Alert Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500">মোট লগইন প্রচেষ্টা (Login Audits)</span>
              <h4 className="text-xl font-extrabold text-slate-900 mt-1">{loginActivityLogs.length} টি সেশন</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">ডিভাইস, আইপি ও ব্রাউজার ফিংগারপ্রিন্ট সহ</p>
            </div>

            <div className="bg-rose-50/80 p-5 rounded-2xl border border-rose-200 shadow-2xs">
              <span className="text-xs font-semibold text-rose-800">ব্যর্থ লগইন প্রচেষ্টা (Failed Attacks)</span>
              <h4 className="text-xl font-extrabold text-rose-900 mt-1">
                {loginActivityLogs.filter(l => l.status === 'failed_credentials' || l.status === 'blocked_ip').length} টি
              </h4>
              <p className="text-[11px] text-rose-600 mt-0.5">ভুল পাসওয়ার্ড দিয়ে প্রবেশের চেষ্টা রোধ করা হয়েছে</p>
            </div>

            <div className="bg-amber-50/80 p-5 rounded-2xl border border-amber-200 shadow-2xs">
              <span className="text-xs font-semibold text-amber-800">অমীমাংসিত সিস্টেম ইরর (Open Errors)</span>
              <h4 className="text-xl font-extrabold text-amber-900 mt-1">{unresolvedErrorsCount} টি ইস্যু</h4>
              <p className="text-[11px] text-amber-700 mt-0.5">হার্ডওয়্যার, সিঙ্ক বা পেমেন্ট টাইমআউট লগ</p>
            </div>
          </div>

          {/* Section 1: User Login Activity Logs */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <h4 className="font-extrabold text-sm text-slate-900">ব্যবহারকারী লগইন ও ডিভাইস অডিট লগ (Login Activity Log)</h4>
                <p className="text-xs text-slate-400">প্রতিটি ডিভাইসের আইপি অ্যাড্রেস, অপারেটিং সিস্টেম ও লগইন স্ট্যাটাস</p>
              </div>

              {/* Search & Filter */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="ব্যবহারকারী, আইপি বা শহর..."
                  value={auditLogSearch}
                  onChange={e => setAuditLogSearch(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs w-full sm:w-48"
                />
                <select
                  value={auditLogTypeFilter}
                  onChange={e => setAuditLogTypeFilter(e.target.value as any)}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                >
                  <option value="all">সকল স্ট্যাটাস</option>
                  <option value="success">সফল লগইন</option>
                  <option value="failed">ব্যর্থ / ব্লকড</option>
                  <option value="expired">সেশন সমাপ্ত</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">ব্যবহারকারী ও পদবি</th>
                    <th className="py-3 px-4">ডিভাইস ও ব্রাউজার</th>
                    <th className="py-3 px-4">আইপি অ্যাড্রেস ও শহর</th>
                    <th className="py-3 px-4">লগইন সময়</th>
                    <th className="py-3 px-4 text-center">স্ট্যাটাস</th>
                    <th className="py-3 px-4">মন্তব্য</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLoginLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4">
                        <strong className="text-slate-900 font-semibold block">{log.userName}</strong>
                        <span className="text-[11px] text-slate-400 uppercase font-mono">{log.userRole}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <div className="font-medium text-slate-800">{log.deviceType}</div>
                        <div className="text-[11px] text-slate-400">{log.browser}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-mono text-purple-900 font-bold">{log.ipAddress}</div>
                        <div className="text-[11px] text-slate-500">{log.locationCity}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">{log.timestamp}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          log.status === 'success' ? 'bg-emerald-100 text-emerald-800' :
                          log.status === 'failed_credentials' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {log.status === 'success' ? 'সফল (Success)' : log.status === 'failed_credentials' ? 'ব্যর্থ চেষ্টা' : 'মেয়াদোত্তীর্ণ'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-[11px]">{log.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: System Error & Exception Logs */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-sm text-slate-900">সিস্টেম ব্যতিক্রম ও ত্রুটি অডিট লগ (System Error Logs)</h4>
                <p className="text-xs text-slate-400">পিওএস প্রিন্টার সংযোগ, ক্লাউড সিঙ্ক ও গেটওয়ে ত্রুটির ট্র্যাকিং</p>
              </div>
              <span className="text-xs px-2.5 py-1 bg-purple-50 text-purple-700 rounded-xl font-bold">
                মোট {systemErrorLogs.length}টি ত্রুটি রেকর্ড
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {systemErrorLogs.map(err => (
                <div key={err.id} className="p-4 hover:bg-slate-50/70 transition flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        err.severity === 'high' ? 'bg-rose-600 text-white' :
                        err.severity === 'medium' ? 'bg-amber-500 text-white' : 'bg-blue-600 text-white'
                      }`}>
                        {err.severity}
                      </span>
                      <span className="font-mono font-bold text-slate-800">{err.errorCode}</span>
                      <span className="px-2 py-0.2 rounded bg-slate-100 text-slate-600 font-semibold text-[10px]">
                        মডিউল: {err.module}
                      </span>
                      <span className="text-slate-400 font-mono text-[11px]">{err.occurredAt}</span>
                    </div>

                    <p className="font-medium text-slate-800">{err.message}</p>
                    {err.stackTrace && (
                      <p className="font-mono text-[11px] text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
                        {err.stackTrace}
                      </p>
                    )}
                    {err.resolved && (
                      <div className="text-[11px] text-emerald-700 font-medium flex items-center gap-1 mt-1">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>সমাধানকারী: {err.resolvedBy} ({err.resolvedAt}) — {err.resolutionNotes}</span>
                      </div>
                    )}
                  </div>

                  <div className="shrink-0">
                    {err.resolved ? (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>মীমাংসিত (Resolved)</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => setSelectedErrorForResolve(err)}
                        className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>সমাধান মার্ক করুন</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS: Z-REPORT PRINTABLE SUMMARY MODAL                                   */}
      {/* ========================================================================= */}
      {selectedShiftForZReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-purple-100 overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-purple-900 text-white p-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-purple-300">পিওএস দৈনিক শিফট খতিয়ান</span>
                <h4 className="font-black text-base text-white">অফিশিয়াল Z-Report সামারি</h4>
              </div>
              <button
                onClick={() => setSelectedShiftForZReport(null)}
                className="text-purple-200 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Z-Report Content Body (Thermal Receipt Aesthetic) */}
            <div className="p-6 space-y-4 font-mono text-xs text-slate-800 bg-slate-50 border-b border-slate-200 max-h-[70vh] overflow-y-auto">
              <div className="text-center space-y-1 border-b border-dashed border-slate-300 pb-3">
                <h3 className="font-black text-base uppercase text-slate-900">{tenant.name}</h3>
                <p className="text-[11px] text-slate-500 font-sans">{tenant.address}</p>
                <div className="text-[10px] text-purple-800 font-bold font-sans">
                  *** DAILY CASH REGISTER SHIFT REPORT (Z-REPORT) ***
                </div>
              </div>

              <div className="space-y-1 text-[11px] border-b border-dashed border-slate-300 pb-3">
                <div className="flex justify-between">
                  <span>রেজিস্টার টার্মিনাল:</span>
                  <strong>{selectedShiftForZReport.registerName}</strong>
                </div>
                <div className="flex justify-between">
                  <span>ক্যাশিয়ার:</span>
                  <strong>{selectedShiftForZReport.cashierName}</strong>
                </div>
                <div className="flex justify-between">
                  <span>শিফট শুরু:</span>
                  <span>{selectedShiftForZReport.openedAt}</span>
                </div>
                <div className="flex justify-between">
                  <span>শিফট সমাপ্তি:</span>
                  <span>{selectedShiftForZReport.closedAt || 'সক্রিয় চলমান'}</span>
                </div>
                <div className="flex justify-between">
                  <span>মোট লেনদেন সংখ্যা:</span>
                  <strong>{selectedShiftForZReport.totalTransactionsCount} টি</strong>
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="space-y-1.5 text-xs border-b border-dashed border-slate-300 pb-3">
                <div className="flex justify-between">
                  <span>ওপেনিং ক্যাশ ড্রয়ার ব্যালেন্স:</span>
                  <span>{currency}{selectedShiftForZReport.openingCash.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>(+) নগদ বিক্রয় (Cash Sales):</span>
                  <span>+{currency}{selectedShiftForZReport.totalCashSales.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sky-700">
                  <span>(+) ডিজিটাল সংগ্রহ (bKash/Cards):</span>
                  <span>{currency}{selectedShiftForZReport.totalDigitalSales.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-rose-700">
                  <span>(-) ফেরত প্রদান (Refunds):</span>
                  <span>-{currency}{selectedShiftForZReport.totalReturnsRefunded.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-rose-700">
                  <span>(-) পিওএস খরচ (Expenses Paid):</span>
                  <span>-{currency}{selectedShiftForZReport.totalExpensesPaid.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-amber-700">
                  <span>(+/-) ক্যাশ ইনজেকশন / ড্রপ:</span>
                  <span>{currency}{(selectedShiftForZReport.cashAdded - selectedShiftForZReport.cashRemoved).toFixed(2)}</span>
                </div>
              </div>

              {/* Final Reconciliation */}
              <div className="space-y-1.5 pt-1 text-xs">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>প্রত্যাশিত ক্যাশ ড্রয়ার ব্যালেন্স:</span>
                  <span>{currency}{selectedShiftForZReport.expectedClosingCash.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-indigo-900">
                  <span>শারীরিকভাবে গোনা ক্যাশ (Actual):</span>
                  <span>{selectedShiftForZReport.actualClosingCash !== undefined ? `${currency}${selectedShiftForZReport.actualClosingCash.toFixed(2)}` : 'পেন্ডিং'}</span>
                </div>
                <div className="flex justify-between font-black text-sm border-t border-slate-400 pt-2 text-purple-900">
                  <span>তারতম্য ($ \Delta $ Over/Short):</span>
                  <span>
                    {selectedShiftForZReport.cashDifference === 0 ? '৳ 0.00 (Exact)' : `${currency}${selectedShiftForZReport.cashDifference?.toFixed(2)}`}
                  </span>
                </div>
              </div>

              {selectedShiftForZReport.notes && (
                <div className="pt-2 text-[11px] text-slate-500 font-sans italic border-t border-dashed border-slate-300">
                  ক্যাশিয়ার মন্তব্য: {selectedShiftForZReport.notes}
                </div>
              )}
            </div>

            {/* Footer Print Actions */}
            <div className="p-4 bg-white flex items-center justify-between gap-3">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>থার্মাল প্রিন্ট করুন</span>
              </button>

              <button
                onClick={() => setSelectedShiftForZReport(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS: CLOSE SHIFT FORM & CASH COUNTING MODAL                            */}
      {/* ========================================================================= */}
      {isCloseShiftModalOpen && shiftToClose && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-purple-100 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="bg-purple-900 text-white p-5 flex items-center justify-between">
              <div>
                <h4 className="font-black text-base text-white">পিওএস শিফট ক্লোজ ও ক্যাশ গোনা</h4>
                <p className="text-xs text-purple-200">ক্যাশ ড্রয়ারে থাকা নোট ও কয়েন গুণে এন্ট্রি দিন</p>
              </div>
              <button onClick={() => setIsCloseShiftModalOpen(false)} className="text-purple-200 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCloseShiftSubmit} className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
              <div className="bg-purple-50 p-3 rounded-xl border border-purple-100 space-y-1">
                <div className="flex justify-between font-semibold text-purple-900">
                  <span>রেজিস্টার: {shiftToClose.registerName}</span>
                  <span>ক্যাশিয়ার: {shiftToClose.cashierName}</span>
                </div>
                <div className="flex justify-between text-slate-600 font-mono">
                  <span>সিস্টেম প্রত্যাশিত ক্যাশ ব্যালেন্স:</span>
                  <strong className="text-purple-900 text-sm">{currency}{shiftToClose.expectedClosingCash.toLocaleString()}</strong>
                </div>
              </div>

              {/* Physical Cash Denominations Input */}
              <div className="space-y-2">
                <label className="font-bold text-slate-800 block">ক্যাশ ড্রয়ার নোট গণনা (Denominations):</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono">
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">৳১০০০ নোট সংখ্যা:</label>
                    <input
                      type="number"
                      min="0"
                      value={denom1000}
                      onChange={e => setDenom1000(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">৳৫০০ নোট সংখ্যা:</label>
                    <input
                      type="number"
                      min="0"
                      value={denom500}
                      onChange={e => setDenom500(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">৳২০০ নোট সংখ্যা:</label>
                    <input
                      type="number"
                      min="0"
                      value={denom200}
                      onChange={e => setDenom200(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">৳১০০ নোট সংখ্যা:</label>
                    <input
                      type="number"
                      min="0"
                      value={denom100}
                      onChange={e => setDenom100(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">৳৫০ নোট সংখ্যা:</label>
                    <input
                      type="number"
                      min="0"
                      value={denom50}
                      onChange={e => setDenom50(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">ভাঙতি কয়েন মোট (৳):</label>
                    <input
                      type="number"
                      min="0"
                      value={denomCoins}
                      onChange={e => setDenomCoins(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Total Counted vs Expected Comparison */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 block">মোট গোনা প্রকৃত টাকা:</span>
                  <span className="text-lg font-black text-indigo-900">{currency}{computedCountedCash.toLocaleString()}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">পার্থক্য (তারতম্য):</span>
                  <span className={`text-base font-black ${
                    computedCountedCash - shiftToClose.expectedClosingCash === 0 ? 'text-emerald-600' :
                    computedCountedCash - shiftToClose.expectedClosingCash > 0 ? 'text-sky-600' : 'text-rose-600'
                  }`}>
                    {computedCountedCash - shiftToClose.expectedClosingCash >= 0 ? '+' : ''}{currency}{(computedCountedCash - shiftToClose.expectedClosingCash).toLocaleString()}
                  </span>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">শিফট সমাপ্তি নোট / মন্তব্য:</label>
                <textarea
                  rows={2}
                  placeholder="দিনের শিফট সমাপ্ত। ড্রয়ার ও বিল কাউন্ট সম্পূর্ণ সঠিক রয়েছে..."
                  value={closeShiftNotes}
                  onChange={e => setCloseShiftNotes(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCloseShiftModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-md transition"
                >
                  শিফট সমাপ্ত ও Z-Report তৈরি করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS: CASH IN / CASH OUT ADJUSTMENT                                     */}
      {/* ========================================================================= */}
      {isCashAdjModalOpen && activeShift && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl border border-purple-100 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="bg-purple-900 text-white p-4 flex items-center justify-between">
              <h4 className="font-bold text-sm">ক্যাশ ড্রয়ার সমন্বয় (Cash In/Out)</h4>
              <button onClick={() => setIsCashAdjModalOpen(false)} className="text-purple-200 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCashAdjustmentSubmit} className="p-5 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">সমন্বয়ের ধরন:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCashAdjType('cash_in')}
                    className={`py-2 rounded-xl font-bold text-xs transition ${
                      cashAdjType === 'cash_in' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    + ক্যাশ ইনজেকশন (ভাঙতি)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCashAdjType('cash_out')}
                    className={`py-2 rounded-xl font-bold text-xs transition ${
                      cashAdjType === 'cash_out' ? 'bg-amber-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    - সেফে জমা (Safe Drop)
                  </button>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">টাকার পরিমাণ (৳): *</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="যেমন: ১০০০"
                  value={cashAdjAmount}
                  onChange={e => setCashAdjAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-sm"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">কারণ বা রেফারেন্স:</label>
                <input
                  type="text"
                  placeholder="যেমন: খুচরা টাকা ঘাটতি পূরণ বা সন্ধ্যায় ব্যাংক ভল্টে জমা"
                  value={cashAdjReason}
                  onChange={e => setCashAdjReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCashAdjModalOpen(false)}
                  className="px-3.5 py-1.5 border border-slate-200 text-slate-700 rounded-xl"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-purple-700 text-white rounded-xl font-bold shadow-xs hover:bg-purple-800"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS: START NEW SHIFT FORM                                              */}
      {/* ========================================================================= */}
      {isOpenNewShiftModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl border border-purple-100 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="bg-purple-900 text-white p-4 flex items-center justify-between">
              <h4 className="font-bold text-sm">নতুন পিওএস শিফট শুরু</h4>
              <button onClick={() => setIsOpenNewShiftModalOpen(false)} className="text-purple-200 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleStartShiftSubmit} className="p-5 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">রেজিস্টার / কাউন্টার নাম:</label>
                <input
                  type="text"
                  required
                  value={newShiftRegisterName}
                  onChange={e => setNewShiftRegisterName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">দায়িত্বপ্রাপ্ত ক্যাশিয়ার:</label>
                <select
                  value={newShiftCashierId}
                  onChange={e => setNewShiftCashierId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-semibold"
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">প্রারম্ভিক ওপেনিং ক্যাশ (৳):</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={newShiftOpeningCash}
                  onChange={e => setNewShiftOpeningCash(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpenNewShiftModalOpen(false)}
                  className="px-3.5 py-1.5 border border-slate-200 text-slate-700 rounded-xl"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs"
                >
                  শিফট সক্রিয় করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS: INSTANT STOCK ADJUSTMENT FOR NEGATIVE STOCK                       */}
      {/* ========================================================================= */}
      {selectedAdjustProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl border border-purple-100 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="bg-purple-900 text-white p-4 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm">স্টক অডিট সমন্বয়</h4>
                <p className="text-[11px] text-purple-200">{selectedAdjustProduct.name}</p>
              </div>
              <button onClick={() => setSelectedAdjustProduct(null)} className="text-purple-200 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveStockAdjustment} className="p-5 space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span>পূর্ববর্তী রেকর্ডকৃত স্টক:</span>
                  <strong className="text-rose-600 font-mono">{selectedAdjustProduct.stock} {selectedAdjustProduct.unit}</strong>
                </div>
                <div className="flex justify-between">
                  <span>SKU / বারকোড:</span>
                  <span className="font-mono">{selectedAdjustProduct.sku}</span>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">সঠিক ফিজিক্যাল গোনা স্টক: *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={adjustNewStock}
                  onChange={e => setAdjustNewStock(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-base font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">সমন্বয়ের কারণ:</label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={e => setAdjustReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedAdjustProduct(null)}
                  className="px-3.5 py-1.5 border border-slate-200 text-slate-700 rounded-xl font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold shadow-xs"
                >
                  স্টক আপডেট নিশ্চিত করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS: SYSTEM ERROR RESOLVE MODAL                                        */}
      {/* ========================================================================= */}
      {selectedErrorForResolve && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl border border-purple-100 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="bg-purple-900 text-white p-4 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm">সিস্টেম ত্রুটি সমাধান নোট</h4>
                <p className="text-[11px] text-purple-200">{selectedErrorForResolve.errorCode}</p>
              </div>
              <button onClick={() => setSelectedErrorForResolve(null)} className="text-purple-200 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleResolveSubmit} className="p-5 space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-600">
                <p className="font-medium text-slate-800">{selectedErrorForResolve.message}</p>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">গৃহীত পদক্ষেপ / সমাধান নোট: *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="যেমন: প্রিন্টার ক্যাবল পুনরায় লাগানো হয়েছে এবং সংযোগ সফল..."
                  value={errorResolutionText}
                  onChange={e => setErrorResolutionText(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedErrorForResolve(null)}
                  className="px-3.5 py-1.5 border border-slate-200 text-slate-700 rounded-xl"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs"
                >
                  সমাধান সম্পন্ন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
