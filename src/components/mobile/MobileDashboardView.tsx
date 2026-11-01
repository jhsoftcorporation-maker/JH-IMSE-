import React, { useState } from 'react';
import { 
  Menu, Calculator, Moon, Sun, Globe, Bell, 
  ChevronDown, Calendar, ShoppingCart, ShoppingBag, 
  RotateCcw, RotateCw, ArrowRightLeft, Users, Building, 
  Briefcase, Wallet, TrendingUp, Sparkles, SlidersHorizontal,
  FileText, Package, LayoutDashboard, Plus, Eye, CheckCircle2,
  AlertCircle, Monitor, Wrench, Building2
} from 'lucide-react';
import { Tenant, Product, Sale, Customer, Employee, OnlineOrder, Warehouse } from '../../types';
import { MobileDrawerNav } from './MobileDrawerNav';
import { MobileDynamicAppearance } from './MobileDynamicAppearance';

interface MobileDashboardViewProps {
  tenant: Tenant;
  products: Product[];
  sales: Sale[];
  customers: Customer[];
  employees: Employee[];
  onlineOrders: OnlineOrder[];
  warehouses: Warehouse[];
  activeWarehouseId: string;
  onSelectWarehouse: (whId: string) => void;
  activeTab: string;
  onSelectTab: (tab: any, subItem?: string) => void;
  onOpenPOS: () => void;
  onOpenStorefront: () => void;
  onOpenCalculator: () => void;
  primaryColor?: string;
  onUpdatePrimaryColor?: (color: string) => void;
  sidebarLayout?: 'sidebar-1' | 'sidebar-2';
  onUpdateSidebarLayout?: (layout: 'sidebar-1' | 'sidebar-2') => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: (enabled: boolean) => void;
  isRTL?: boolean;
  onToggleRTL?: (enabled: boolean) => void;
  onToggleDesktopMode?: () => void;
}

export const MobileDashboardView: React.FC<MobileDashboardViewProps> = ({
  tenant,
  products,
  sales,
  customers,
  employees,
  onlineOrders,
  warehouses,
  activeWarehouseId,
  onSelectWarehouse,
  activeTab,
  onSelectTab,
  onOpenPOS,
  onOpenStorefront,
  onOpenCalculator,
  primaryColor = '#663399',
  onUpdatePrimaryColor = () => {},
  sidebarLayout = 'sidebar-2',
  onUpdateSidebarLayout = () => {},
  isDarkMode = false,
  onToggleDarkMode = () => {},
  isRTL = false,
  onToggleRTL = () => {},
  onToggleDesktopMode = () => {},
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAppearanceOpen, setIsAppearanceOpen] = useState(false);
  const [showWarehousePicker, setShowWarehousePicker] = useState(false);
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month'>('week');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [lang, setLang] = useState<'bn' | 'en'>('en');

  // Filter items by warehouse
  const filteredSales = activeWarehouseId === 'all' 
    ? sales 
    : sales.filter(s => s.warehouseId === activeWarehouseId);

  const totalSalesAmount = filteredSales.reduce((acc, s) => acc + s.totalAmount, 0);
  const totalDueAmount = filteredSales.reduce((acc, s) => acc + s.dueAmount, 0);

  // Active warehouse name
  const currentWarehouseName = activeWarehouseId === 'all' 
    ? 'All Warehouses' 
    : (warehouses.find(w => w.id === activeWarehouseId)?.name || 'Filter by warehouse');

  // Module filter conditions (Per user strict requirement):
  // Modules turned off in Super Admin MUST NOT show here!
  const hasPos = tenant.features.pos !== false;
  const hasEcommerce = tenant.features.ecommerce !== false;
  const hasCrm = tenant.features.crm !== false;
  const hasHrm = tenant.features.hrm !== false;
  const hasAccounting = tenant.features.accounting !== false;
  const hasAi = tenant.features.ai !== false;
  const hasWarehouse = tenant.features.multiWarehouse !== false;
  const hasService = tenant.features.serviceMaintenance !== false;
  const hasAssets = tenant.features.assets !== false;

  return (
    <div 
      className={`min-h-screen bg-slate-50 text-slate-800 pb-20 select-none ${isDarkMode ? 'dark bg-slate-900 text-slate-100' : ''}`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* 1. TOP HEADER (Replicating Screenshot Header) */}
      <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 py-2.5 flex items-center justify-between shadow-xs">
        {/* Left: Hamburger menu */}
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          aria-label="Open menu drawer"
        >
          <Menu className="w-6 h-6 stroke-[2.2]" />
        </button>

        {/* Right Action Icons Group */}
        <div className="flex items-center gap-2">
          {/* Calculator button (Purple square) */}
          <button
            onClick={onOpenCalculator}
            style={{ backgroundColor: primaryColor }}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-xs hover:opacity-90 active:scale-95 transition"
            title="Calculator"
          >
            <Calculator className="w-4 h-4" />
          </button>

          {/* Dark Mode toggle icon button */}
          <button
            onClick={() => onToggleDarkMode(!isDarkMode)}
            className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Toggle theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Language selector button */}
          <button
            onClick={() => setLang(l => l === 'en' ? 'bn' : 'en')}
            className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-xs font-bold"
            title="Change language"
          >
            <Globe className="w-4 h-4" />
          </button>

          {/* Desktop Mode Switcher */}
          <button
            onClick={onToggleDesktopMode}
            className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Switch to Desktop View"
          >
            <Monitor className="w-4 h-4" />
          </button>

          {/* Notification bell icon button */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-3 z-40 text-xs">
                <div className="font-bold text-slate-900 dark:text-white mb-2 pb-1 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                  <span>Notifications</span>
                  <span className="text-[10px] text-purple-600 bg-purple-50 dark:bg-purple-900/30 px-1.5 py-0.5 rounded">3 New</span>
                </div>
                <div className="space-y-2">
                  <div className="p-2 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <span className="font-semibold block text-slate-800 dark:text-slate-200">Stock Alert</span>
                    <span className="text-[11px] text-slate-500">Paracetamol 500mg is running low</span>
                  </div>
                  <div className="p-2 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <span className="font-semibold block text-slate-800 dark:text-slate-200">New Order</span>
                    <span className="text-[11px] text-slate-500">Online order #108 received</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Brand/Stocky Logo badge */}
          <div className="flex items-center gap-1 pl-1">
            <div 
              style={{ color: primaryColor }}
              className="font-black text-lg tracking-tighter flex items-center"
            >
              <span className="italic font-serif text-2xl font-black leading-none">$</span>
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block -ml-1 mt-3">STOCKY</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="p-4 space-y-4 max-w-md mx-auto">
        {/* 2. PURPLE WELCOME BANNER (Replicating Screenshot 1) */}
        <div 
          style={{ backgroundColor: primaryColor }}
          className="rounded-3xl p-5 text-white shadow-xl relative overflow-hidden transition-all duration-300"
        >
          {/* Subtle background glow */}
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <h2 className="text-2xl font-black tracking-tight mb-1">Dashboard</h2>
          <p className="text-white/90 text-xs sm:text-sm font-normal mb-4">
            Welcome back, {tenant.ownerName || 'Manager'}! Here's what's happening today.
          </p>

          {/* Filter by warehouse selector */}
          <div className="relative mb-2.5">
            <button
              type="button"
              onClick={() => setShowWarehousePicker(!showWarehousePicker)}
              className="w-full bg-white/15 hover:bg-white/25 active:bg-white/30 backdrop-blur-md text-white rounded-2xl px-4 py-3 text-xs font-semibold flex items-center justify-between border border-white/20 transition shadow-inner"
            >
              <span className="truncate">{currentWarehouseName}</span>
              <ChevronDown className="w-4 h-4 shrink-0 text-white/80" />
            </button>

            {/* Warehouse Dropdown */}
            {showWarehousePicker && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-100 p-2 z-30 max-h-48 overflow-y-auto">
                <button
                  type="button"
                  onClick={() => {
                    onSelectWarehouse('all');
                    setShowWarehousePicker(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition ${
                    activeWarehouseId === 'all' ? 'bg-purple-100 text-[#663399] font-bold' : 'hover:bg-slate-100'
                  }`}
                >
                  🌐 All Warehouses
                </button>
                {warehouses.map(w => (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => {
                      onSelectWarehouse(w.id);
                      setShowWarehousePicker(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition ${
                      activeWarehouseId === w.id ? 'bg-purple-100 text-[#663399] font-bold' : 'hover:bg-slate-100'
                    }`}
                  >
                    🏢 {w.name} ({w.code})
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Date Range Selector Pill */}
          <div className="bg-white/15 backdrop-blur-md rounded-2xl px-4 py-2.5 text-xs text-white/95 flex items-center gap-2 border border-white/20 font-medium">
            <Calendar className="w-4 h-4 shrink-0 text-white/80" />
            <span className="tracking-wide">2026-10-20 - 2026-10-26</span>
          </div>
        </div>

        {/* 3. MOBILE QUICK-ACCESS GRID (Replicating Screenshot 1 Exact 3-Column Icons) */}
        <div className="grid grid-cols-3 gap-3">
          {/* 1. POS */}
          {hasPos && (
            <button
              onClick={onOpenPOS}
              className="bg-white dark:bg-slate-800 rounded-2xl p-3.5 shadow-xs border border-slate-100 dark:border-slate-700/60 flex flex-col items-center justify-center text-center hover:shadow-md active:scale-95 transition"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#6a3cb5] flex items-center justify-center text-white mb-2 shadow-sm">
                <Calculator className="w-6 h-6 stroke-[2.2]" />
              </div>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">POS</span>
            </button>
          )}

          {/* 2. Sales */}
          <button
            onClick={() => onSelectTab('invoices')}
            className="bg-white dark:bg-slate-800 rounded-2xl p-3.5 shadow-xs border border-slate-100 dark:border-slate-700/60 flex flex-col items-center justify-center text-center hover:shadow-md active:scale-95 transition"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#4c6ef5] flex items-center justify-center text-white mb-2 shadow-sm">
              <ShoppingCart className="w-6 h-6 stroke-[2.2]" />
            </div>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">Sales</span>
          </button>

          {/* 3. Sales Return */}
          <button
            onClick={() => onSelectTab('returns', 'sales_returns')}
            className="bg-white dark:bg-slate-800 rounded-2xl p-3.5 shadow-xs border border-slate-100 dark:border-slate-700/60 flex flex-col items-center justify-center text-center hover:shadow-md active:scale-95 transition"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#f59f00] flex items-center justify-center text-white mb-2 shadow-sm">
              <RotateCcw className="w-6 h-6 stroke-[2.2]" />
            </div>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">Sales Return</span>
          </button>

          {/* 4. Purchases */}
          <button
            onClick={() => onSelectTab('accounting', 'purchases')}
            className="bg-white dark:bg-slate-800 rounded-2xl p-3.5 shadow-xs border border-slate-100 dark:border-slate-700/60 flex flex-col items-center justify-center text-center hover:shadow-md active:scale-95 transition"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#20c997] flex items-center justify-center text-white mb-2 shadow-sm">
              <ShoppingBag className="w-6 h-6 stroke-[2.2]" />
            </div>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">Purchases</span>
          </button>

          {/* 5. Purchases Return */}
          <button
            onClick={() => onSelectTab('returns', 'purchase_returns')}
            className="bg-white dark:bg-slate-800 rounded-2xl p-3.5 shadow-xs border border-slate-100 dark:border-slate-700/60 flex flex-col items-center justify-center text-center hover:shadow-md active:scale-95 transition"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#ff922b] flex items-center justify-center text-white mb-2 shadow-sm">
              <RotateCw className="w-6 h-6 stroke-[2.2]" />
            </div>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">Purchases Return</span>
          </button>

          {/* 6. All Products */}
          <button
            onClick={() => onSelectTab('products')}
            className="bg-white dark:bg-slate-800 rounded-2xl p-3.5 shadow-xs border border-slate-100 dark:border-slate-700/60 flex flex-col items-center justify-center text-center hover:shadow-md active:scale-95 transition"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#12b886] flex items-center justify-center text-white mb-2 shadow-sm">
              <Package className="w-6 h-6 stroke-[2.2]" />
            </div>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">All Products</span>
          </button>

          {/* 7. Quotations */}
          <button
            onClick={() => onSelectTab('invoices', 'quotations')}
            className="bg-white dark:bg-slate-800 rounded-2xl p-3.5 shadow-xs border border-slate-100 dark:border-slate-700/60 flex flex-col items-center justify-center text-center hover:shadow-md active:scale-95 transition"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#fab005] flex items-center justify-center text-white mb-2 shadow-sm">
              <FileText className="w-6 h-6 stroke-[2.2]" />
            </div>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">Quotations</span>
          </button>

          {/* 8. Transfer (Conditional on multiWarehouse) */}
          {hasWarehouse && (
            <button
              onClick={() => onSelectTab('warehouses')}
              className="bg-white dark:bg-slate-800 rounded-2xl p-3.5 shadow-xs border border-slate-100 dark:border-slate-700/60 flex flex-col items-center justify-center text-center hover:shadow-md active:scale-95 transition"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#495057] flex items-center justify-center text-white mb-2 shadow-sm">
                <ArrowRightLeft className="w-6 h-6 stroke-[2.2]" />
              </div>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">Transfer</span>
            </button>
          )}

          {/* 9. Customers (Conditional on crm) */}
          {hasCrm && (
            <button
              onClick={() => onSelectTab('crm')}
              className="bg-white dark:bg-slate-800 rounded-2xl p-3.5 shadow-xs border border-slate-100 dark:border-slate-700/60 flex flex-col items-center justify-center text-center hover:shadow-md active:scale-95 transition"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#228be6] flex items-center justify-center text-white mb-2 shadow-sm">
                <Users className="w-6 h-6 stroke-[2.2]" />
              </div>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">Customers</span>
            </button>
          )}

          {/* 10. Suppliers */}
          <button
            onClick={() => onSelectTab('accounting', 'suppliers')}
            className="bg-white dark:bg-slate-800 rounded-2xl p-3.5 shadow-xs border border-slate-100 dark:border-slate-700/60 flex flex-col items-center justify-center text-center hover:shadow-md active:scale-95 transition"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#5c7cfa] flex items-center justify-center text-white mb-2 shadow-sm">
              <Building className="w-6 h-6 stroke-[2.2]" />
            </div>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">Suppliers</span>
          </button>

          {/* 11. HRM (Conditional on hrm) */}
          {hasHrm && (
            <button
              onClick={() => onSelectTab('hrm')}
              className="bg-white dark:bg-slate-800 rounded-2xl p-3.5 shadow-xs border border-slate-100 dark:border-slate-700/60 flex flex-col items-center justify-center text-center hover:shadow-md active:scale-95 transition"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#7048e8] flex items-center justify-center text-white mb-2 shadow-sm">
                <Briefcase className="w-6 h-6 stroke-[2.2]" />
              </div>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">HRM</span>
            </button>
          )}

          {/* 12. Accounting (Conditional on accounting) */}
          {hasAccounting && (
            <button
              onClick={() => onSelectTab('accounting')}
              className="bg-white dark:bg-slate-800 rounded-2xl p-3.5 shadow-xs border border-slate-100 dark:border-slate-700/60 flex flex-col items-center justify-center text-center hover:shadow-md active:scale-95 transition"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#0ca678] flex items-center justify-center text-white mb-2 shadow-sm">
                <Wallet className="w-6 h-6 stroke-[2.2]" />
              </div>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">Accounting</span>
            </button>
          )}

          {/* 13. Online Store (Conditional on ecommerce) */}
          {hasEcommerce && (
            <button
              onClick={onOpenStorefront}
              className="bg-white dark:bg-slate-800 rounded-2xl p-3.5 shadow-xs border border-slate-100 dark:border-slate-700/60 flex flex-col items-center justify-center text-center hover:shadow-md active:scale-95 transition"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#e64980] flex items-center justify-center text-white mb-2 shadow-sm">
                <ShoppingBag className="w-6 h-6 stroke-[2.2]" />
              </div>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">Online Store</span>
            </button>
          )}

          {/* 14. Reports */}
          <button
            onClick={() => onSelectTab('analytics', '3d_dashboard')}
            className="bg-white dark:bg-slate-800 rounded-2xl p-3.5 shadow-xs border border-slate-100 dark:border-slate-700/60 flex flex-col items-center justify-center text-center hover:shadow-md active:scale-95 transition"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#7950f2] flex items-center justify-center text-white mb-2 shadow-sm">
              <TrendingUp className="w-6 h-6 stroke-[2.2]" />
            </div>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">Reports</span>
          </button>

          {/* 15. AI Forecast (Conditional on ai) */}
          {hasAi && (
            <button
              onClick={() => onSelectTab('ai')}
              className="bg-white dark:bg-slate-800 rounded-2xl p-3.5 shadow-xs border border-slate-100 dark:border-slate-700/60 flex flex-col items-center justify-center text-center hover:shadow-md active:scale-95 transition"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#d6336c] flex items-center justify-center text-white mb-2 shadow-sm">
                <Sparkles className="w-6 h-6 stroke-[2.2]" />
              </div>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">AI Forecast</span>
            </button>
          )}

          {/* 16. Service & Repairs (Phase 20) */}
          {hasService && (
            <button
              onClick={() => onSelectTab('service')}
              className="bg-white dark:bg-slate-800 rounded-2xl p-3.5 shadow-xs border border-slate-100 dark:border-slate-700/60 flex flex-col items-center justify-center text-center hover:shadow-md active:scale-95 transition"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#087f5b] flex items-center justify-center text-white mb-2 shadow-sm">
                <Wrench className="w-6 h-6 stroke-[2.2]" />
              </div>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">Service & AMC</span>
            </button>
          )}

          {/* 17. Fixed Assets & Depreciation (Phase 21) */}
          {hasAssets && (
            <button
              onClick={() => onSelectTab('assets')}
              className="bg-white dark:bg-slate-800 rounded-2xl p-3.5 shadow-xs border border-slate-100 dark:border-slate-700/60 flex flex-col items-center justify-center text-center hover:shadow-md active:scale-95 transition"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#1971c2] flex items-center justify-center text-white mb-2 shadow-sm">
                <Building2 className="w-6 h-6 stroke-[2.2]" />
              </div>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">Fixed Assets</span>
            </button>
          )}
        </div>

        {/* 4. BUSINESS VITALS SUMMARY CARD */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-100 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">Today's Performance</h3>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">Live</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-2xl">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Total Sales</span>
              <strong className="text-base font-black text-slate-900 dark:text-white">
                {tenant.currency}{totalSalesAmount.toLocaleString()}
              </strong>
            </div>

            <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-2xl">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Customer Due</span>
              <strong className="text-base font-black text-amber-600">
                {tenant.currency}{totalDueAmount.toLocaleString()}
              </strong>
            </div>
          </div>
        </div>
      </main>

      {/* 5. FIXED MOBILE BOTTOM NAVIGATION BAR (Exact 5 Icons from Screenshot) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 px-4 py-2 flex items-center justify-around shadow-lg">
        {/* 1. Dashboard */}
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold transition ${
            activeTab === 'dashboard' ? 'text-[#663399] dark:text-purple-400' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 stroke-[2.2]" />
          <span>Dashboard</span>
        </button>

        {/* 2. Sales */}
        <button
          onClick={() => onSelectTab('invoices')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold transition ${
            activeTab === 'invoices' ? 'text-[#663399] dark:text-purple-400' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShoppingCart className="w-5 h-5 stroke-[2.2]" />
          <span>Sales</span>
        </button>

        {/* 3. Products */}
        <button
          onClick={() => onSelectTab('products')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold transition ${
            activeTab === 'products' ? 'text-[#663399] dark:text-purple-400' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Package className="w-5 h-5 stroke-[2.2]" />
          <span>Products</span>
        </button>

        {/* 4. Reports */}
        <button
          onClick={() => onSelectTab('accounting', 'reports')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold transition ${
            activeTab === 'accounting' ? 'text-[#663399] dark:text-purple-400' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <TrendingUp className="w-5 h-5 stroke-[2.2]" />
          <span>Reports</span>
        </button>

        {/* 5. Settings / Floating Action Button (Purple circle with gear) */}
        <button
          onClick={() => setIsAppearanceOpen(!isAppearanceOpen)}
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

      {/* 6. Mobile Sidebar Drawer */}
      <MobileDrawerNav
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        tenant={tenant}
        activeTab={activeTab}
        onSelectTab={onSelectTab}
        onOpenPOS={onOpenPOS}
        onOpenStorefront={onOpenStorefront}
        onOpenCalculator={onOpenCalculator}
        onOpenAppearance={() => setIsAppearanceOpen(true)}
        primaryColor={primaryColor}
      />

      {/* 7. Dynamic Appearance Flyout */}
      <MobileDynamicAppearance
        isOpen={isAppearanceOpen}
        onClose={() => setIsAppearanceOpen(false)}
        currentColor={primaryColor}
        onSelectColor={onUpdatePrimaryColor}
        sidebarLayout={sidebarLayout}
        onSelectSidebarLayout={onUpdateSidebarLayout}
        isDarkMode={isDarkMode}
        onToggleDarkMode={onToggleDarkMode}
        isRTL={isRTL}
        onToggleRTL={onToggleRTL}
      />
    </div>
  );
};
