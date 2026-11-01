import React, { useState } from 'react';
import { 
  BarChart2, ShoppingBag, Users, Shield, BookOpen, MapPin, 
  Receipt, ShoppingCart, ChevronRight, ChevronDown, ChevronLeft,
  ArrowRightLeft, AlertOctagon, Briefcase, Wallet, DollarSign,
  Wrench, Settings as SettingsIcon, Archive, FileText, CheckSquare,
  Calendar, Award, Share2, HelpCircle, Lightbulb, TrendingUp,
  Search, X, Plus, UploadCloud, Tag, Layers, RefreshCw, Smartphone,
  Printer, Scale, HardDrive, Monitor, Building2, FolderKanban, Globe
} from 'lucide-react';
import { Tenant } from '../../types';

interface MobileDrawerNavProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: Tenant;
  activeTab: string;
  onSelectTab: (tab: any, subItem?: string) => void;
  onOpenPOS: () => void;
  onOpenStorefront: () => void;
  onOpenCalculator: () => void;
  onOpenAppearance: () => void;
  primaryColor?: string;
}

export const MobileDrawerNav: React.FC<MobileDrawerNavProps> = ({
  isOpen,
  onClose,
  tenant,
  activeTab,
  onSelectTab,
  onOpenPOS,
  onOpenStorefront,
  onOpenCalculator,
  onOpenAppearance,
  primaryColor = '#663399',
}) => {
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const toggleAccordion = (name: string) => {
    setOpenAccordion(prev => prev === name ? null : name);
  };

  // Module filter helpers based on user mandate:
  // If a module is turned off in Super Admin, it must NOT show up in the customer panel!
  const hasEcommerce = tenant.features.ecommerce !== false;
  const hasCrm = tenant.features.crm !== false;
  const hasHrm = tenant.features.hrm !== false;
  const hasAccounting = tenant.features.accounting !== false;
  const hasAi = tenant.features.ai !== false;
  const hasWarehouse = tenant.features.multiWarehouse !== false;
  const hasCommissions = tenant.features.commissions !== false;
  const hasService = tenant.features.serviceMaintenance !== false;
  const hasAssets = tenant.features.assets !== false;
  const hasProjects = tenant.features.projects !== false;
  const hasHardware = tenant.features.hardwareSuite !== false;
  const hasWhatsappLoyalty = tenant.features.whatsappLoyalty !== false;

  const handleItemClick = (tabName: string, subName?: string) => {
    if (tabName === 'pos') {
      onOpenPOS();
    } else if (tabName === 'storefront') {
      onOpenStorefront();
    } else if (tabName === 'appearance') {
      onOpenAppearance();
    } else {
      onSelectTab(tabName, subName);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      {/* Drawer content */}
      <div className="relative w-[82%] max-w-xs bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div 
              style={{ backgroundColor: primaryColor }}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-xs"
            >
              {tenant.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-xs text-slate-900 truncate max-w-[170px]">{tenant.name}</h3>
              <span className="text-[10px] text-slate-400 capitalize">{tenant.businessType} Suite</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-slate-200 flex items-center justify-center transition"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Menu Search Box */}
        <div className="p-3 border-b border-slate-100">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search menus & options..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-100 rounded-xl border-none focus:outline-none focus:ring-1 focus:ring-[#663399]"
            />
          </div>
        </div>

        {/* Scrollable Navigation List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1 text-xs">
          {/* 1. Dashboard */}
          <button
            onClick={() => handleItemClick('dashboard')}
            style={activeTab === 'dashboard' ? { backgroundColor: primaryColor, color: '#fff' } : {}}
            className={`w-full px-3.5 py-2.5 rounded-xl font-medium flex items-center gap-3 transition ${
              activeTab === 'dashboard' 
                ? 'shadow-xs font-bold' 
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          {/* 2. Store (Conditional on ecommerce) */}
          {hasEcommerce && (
            <div>
              <button
                onClick={() => toggleAccordion('store')}
                className="w-full px-3.5 py-2.5 rounded-xl text-slate-700 hover:bg-slate-100 font-medium flex items-center justify-between transition"
              >
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-4 h-4 text-slate-600" />
                  <span>Store</span>
                </div>
                {openAccordion === 'store' ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
              </button>

              {openAccordion === 'store' && (
                <div className="pl-9 pr-2 py-1 space-y-1 bg-slate-50/50 rounded-xl my-0.5">
                  {[
                    { label: 'Visit Online Store', action: () => onOpenStorefront() },
                    { label: 'Settings', action: () => handleItemClick('ecommerce', 'settings') },
                    { label: 'Online Orders', action: () => handleItemClick('ecommerce', 'orders') },
                    { label: 'Collections', action: () => handleItemClick('ecommerce', 'collections') },
                    { label: 'Banners', action: () => handleItemClick('ecommerce', 'banners') },
                    { label: 'Subscribers', action: () => handleItemClick('ecommerce', 'subscribers') },
                    { label: 'Messages', action: () => handleItemClick('ecommerce', 'messages') },
                    { label: 'Invite Codes', action: () => handleItemClick('ecommerce', 'invites') },
                    { label: 'Pending Customers', action: () => handleItemClick('ecommerce', 'pending_customers') },
                  ].map(sub => (
                    <button
                      key={sub.label}
                      onClick={sub.action}
                      className="w-full text-left py-1.5 px-2 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-white text-[11px] transition"
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. People (Conditional on crm) */}
          {hasCrm && (
            <div>
              <button
                onClick={() => toggleAccordion('people')}
                className="w-full px-3.5 py-2.5 rounded-xl text-slate-700 hover:bg-slate-100 font-medium flex items-center justify-between transition"
              >
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-slate-600" />
                  <span>People</span>
                </div>
                {openAccordion === 'people' ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
              </button>

              {openAccordion === 'people' && (
                <div className="pl-9 pr-2 py-1 space-y-1 bg-slate-50/50 rounded-xl my-0.5">
                  {[
                    { label: 'Customers', action: () => handleItemClick('crm') },
                    { label: 'Create Customer', action: () => handleItemClick('crm', 'create_customer') },
                    { label: 'Import Customers', action: () => handleItemClick('crm', 'import_customers') },
                    { label: 'Customers without Login', action: () => handleItemClick('people', 'guest_customers') },
                    { label: 'Customers with Login', action: () => handleItemClick('people', 'portal_customers') },
                    { label: 'Client Portal', action: () => handleItemClick('people', 'client_portal') },
                    { label: 'Suppliers', action: () => handleItemClick('accounting', 'suppliers') },
                    { label: 'Create Supplier', action: () => handleItemClick('accounting', 'create_supplier') },
                    { label: 'Import Suppliers', action: () => handleItemClick('accounting', 'import_suppliers') },
                  ].map(sub => (
                    <button
                      key={sub.label}
                      onClick={sub.action}
                      className="w-full text-left py-1.5 px-2 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-white text-[11px] transition"
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 4. User Management */}
          <div>
            <button
              onClick={() => toggleAccordion('user_mgmt')}
              className="w-full px-3.5 py-2.5 rounded-xl text-slate-700 hover:bg-slate-100 font-medium flex items-center justify-between transition"
            >
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-slate-600" />
                <span>User Management</span>
              </div>
              {openAccordion === 'user_mgmt' ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
            </button>

            {openAccordion === 'user_mgmt' && (
              <div className="pl-9 pr-2 py-1 space-y-1 bg-slate-50/50 rounded-xl my-0.5">
                {[
                  { label: 'Users', action: () => handleItemClick('hrm', 'users') },
                  { label: 'Group Permissions', action: () => handleItemClick('hrm', 'permissions') },
                ].map(sub => (
                  <button
                    key={sub.label}
                    onClick={sub.action}
                    className="w-full text-left py-1.5 px-2 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-white text-[11px] transition"
                  >
                    {sub.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 5. Products */}
          <div>
            <button
              onClick={() => toggleAccordion('products')}
              className="w-full px-3.5 py-2.5 rounded-xl text-slate-700 hover:bg-slate-100 font-medium flex items-center justify-between transition"
            >
              <div className="flex items-center gap-3">
                <BookOpen className="w-4 h-4 text-slate-600" />
                <span>Products</span>
              </div>
              {openAccordion === 'products' ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
            </button>

            {openAccordion === 'products' && (
              <div className="pl-9 pr-2 py-1 space-y-1 bg-slate-50/50 rounded-xl my-0.5">
                {[
                  { label: 'Create product', action: () => handleItemClick('products', 'create') },
                  { label: 'All Products', action: () => handleItemClick('products') },
                  { label: 'Import products', action: () => handleItemClick('products', 'import') },
                  { label: 'Import (Update Only)', action: () => handleItemClick('products', 'update_import') },
                  { label: 'Opening Stock', action: () => handleItemClick('products', 'opening_stock') },
                  { label: 'Print Labels', action: () => handleItemClick('products', 'barcodes') },
                  { label: 'Count Stock', action: () => handleItemClick('products', 'audit') },
                  { label: 'Categories', action: () => handleItemClick('products', 'categories') },
                  { label: 'Sub Category', action: () => handleItemClick('products', 'sub_categories') },
                  { label: 'Brand', action: () => handleItemClick('products', 'brands') },
                  { label: 'Units', action: () => handleItemClick('products', 'units') },
                  { label: 'Batches', action: () => handleItemClick('products', 'batches') },
                ].map(sub => (
                  <button
                    key={sub.label}
                    onClick={sub.action}
                    className="w-full text-left py-1.5 px-2 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-white text-[11px] transition"
                  >
                    {sub.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 6. Adjustment */}
          <div>
            <button
              onClick={() => toggleAccordion('adjustment')}
              className="w-full px-3.5 py-2.5 rounded-xl text-slate-700 hover:bg-slate-100 font-medium flex items-center justify-between transition"
            >
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-slate-600" />
                <span>Adjustment</span>
              </div>
              {openAccordion === 'adjustment' ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
            </button>

            {openAccordion === 'adjustment' && (
              <div className="pl-9 pr-2 py-1 space-y-1 bg-slate-50/50 rounded-xl my-0.5">
                {[
                  { label: 'Create Adjustment', action: () => handleItemClick('products', 'create_adjustment') },
                  { label: 'All Adjustments', action: () => handleItemClick('products', 'adjustments') },
                ].map(sub => (
                  <button
                    key={sub.label}
                    onClick={sub.action}
                    className="w-full text-left py-1.5 px-2 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-white text-[11px] transition"
                  >
                    {sub.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 7. Purchases */}
          <div>
            <button
              onClick={() => toggleAccordion('purchases')}
              className="w-full px-3.5 py-2.5 rounded-xl text-slate-700 hover:bg-slate-100 font-medium flex items-center justify-between transition"
            >
              <div className="flex items-center gap-3">
                <Receipt className="w-4 h-4 text-slate-600" />
                <span>Purchases</span>
              </div>
              {openAccordion === 'purchases' ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
            </button>

            {openAccordion === 'purchases' && (
              <div className="pl-9 pr-2 py-1 space-y-1 bg-slate-50/50 rounded-xl my-0.5">
                {[
                  { label: 'Create Purchase', action: () => handleItemClick('accounting', 'create_purchase') },
                  { label: 'All Purchases', action: () => handleItemClick('accounting', 'purchases') },
                  { label: 'Import Purchases', action: () => handleItemClick('accounting', 'import_purchases') },
                ].map(sub => (
                  <button
                    key={sub.label}
                    onClick={sub.action}
                    className="w-full text-left py-1.5 px-2 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-white text-[11px] transition"
                  >
                    {sub.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 8. Sales */}
          <div>
            <button
              onClick={() => toggleAccordion('sales')}
              className="w-full px-3.5 py-2.5 rounded-xl text-slate-700 hover:bg-slate-100 font-medium flex items-center justify-between transition"
            >
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-4 h-4 text-slate-600" />
                <span>Sales</span>
              </div>
              {openAccordion === 'sales' ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
            </button>

            {openAccordion === 'sales' && (
              <div className="pl-9 pr-2 py-1 space-y-1 bg-slate-50/50 rounded-xl my-0.5">
                {[
                  { label: 'Create Sale', action: () => onOpenPOS() },
                  { label: 'Import Sales', action: () => handleItemClick('invoices', 'import') },
                  { label: 'All Sales', action: () => handleItemClick('invoices') },
                  { label: 'POS', action: () => onOpenPOS() },
                  { label: 'Customer Screen', action: () => handleItemClick('invoices', 'customer_screen') },
                  { label: 'Shipments', action: () => handleItemClick('invoices', 'shipments') },
                  { label: 'Real-time Sales Counter', action: () => handleItemClick('invoices', 'live_counter') },
                ].map(sub => (
                  <button
                    key={sub.label}
                    onClick={sub.action}
                    className="w-full text-left py-1.5 px-2 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-white text-[11px] transition"
                  >
                    {sub.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 9. Sales Return */}
          <button
            onClick={() => handleItemClick('returns', 'sales_returns')}
            className="w-full px-3.5 py-2.5 rounded-xl text-slate-700 hover:bg-slate-100 font-medium flex items-center gap-3 transition"
          >
            <ChevronRight className="w-4 h-4 text-slate-600" />
            <span>Sales Return</span>
          </button>

          {/* 10. Quotations */}
          <button
            onClick={() => handleItemClick('invoices', 'quotations')}
            className="w-full px-3.5 py-2.5 rounded-xl text-slate-700 hover:bg-slate-100 font-medium flex items-center gap-3 transition"
          >
            <FileText className="w-4 h-4 text-slate-600" />
            <span>Quotations</span>
          </button>

          {/* 11. Purchases Return */}
          <button
            onClick={() => handleItemClick('returns', 'purchase_returns')}
            className="w-full px-3.5 py-2.5 rounded-xl text-slate-700 hover:bg-slate-100 font-medium flex items-center gap-3 transition"
          >
            <ChevronLeft className="w-4 h-4 text-slate-600" />
            <span>Purchases Return</span>
          </button>

          {/* 12. Transfer (Conditional on multiWarehouse) */}
          {hasWarehouse && (
            <button
              onClick={() => handleItemClick('warehouses')}
              className="w-full px-3.5 py-2.5 rounded-xl text-slate-700 hover:bg-slate-100 font-medium flex items-center gap-3 transition"
            >
              <ArrowRightLeft className="w-4 h-4 text-slate-600" />
              <span>Transfer</span>
            </button>
          )}

          {/* 13. Damages */}
          <button
            onClick={() => handleItemClick('returns', 'damages')}
            className="w-full px-3.5 py-2.5 rounded-xl text-slate-700 hover:bg-slate-100 font-medium flex items-center gap-3 transition"
          >
            <AlertOctagon className="w-4 h-4 text-slate-600" />
            <span>Damages</span>
          </button>

          {/* 14. HRM (Conditional on hrm) */}
          {hasHrm && (
            <div>
              <button
                onClick={() => toggleAccordion('hrm')}
                className="w-full px-3.5 py-2.5 rounded-xl text-slate-700 hover:bg-slate-100 font-medium flex items-center justify-between transition"
              >
                <div className="flex items-center gap-3">
                  <Briefcase className="w-4 h-4 text-slate-600" />
                  <span>HRM</span>
                </div>
                {openAccordion === 'hrm' ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
              </button>

              {openAccordion === 'hrm' && (
                <div className="pl-9 pr-2 py-1 space-y-1 bg-slate-50/50 rounded-xl my-0.5">
                  {[
                    { label: 'Company', action: () => handleItemClick('hrm', 'company') },
                    { label: 'Departments', action: () => handleItemClick('hrm', 'departments') },
                    { label: 'Designations', action: () => handleItemClick('hrm', 'designations') },
                    { label: 'Office Shift', action: () => handleItemClick('hrm', 'shifts') },
                    { label: 'Employees', action: () => handleItemClick('hrm', 'employees') },
                    { label: 'Attendance', action: () => handleItemClick('hrm', 'attendance') },
                    { label: 'Leave Request', action: () => handleItemClick('hrm', 'leaves') },
                    { label: 'Holidays', action: () => handleItemClick('hrm', 'holidays') },
                    { label: 'Payroll', action: () => handleItemClick('hrm', 'payroll') },
                  ].map(sub => (
                    <button
                      key={sub.label}
                      onClick={sub.action}
                      className="w-full text-left py-1.5 px-2 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-white text-[11px] transition"
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 15. Accounting (Conditional on accounting) */}
          {hasAccounting && (
            <div>
              <button
                onClick={() => toggleAccordion('accounting')}
                className="w-full px-3.5 py-2.5 rounded-xl text-slate-700 hover:bg-slate-100 font-medium flex items-center justify-between transition"
              >
                <div className="flex items-center gap-3">
                  <Wallet className="w-4 h-4 text-slate-600" />
                  <span>Accounting</span>
                </div>
                {openAccordion === 'accounting' ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
              </button>

              {openAccordion === 'accounting' && (
                <div className="pl-9 pr-2 py-1 space-y-1 bg-slate-50/50 rounded-xl my-0.5">
                  {[
                    { label: 'Dashboard', action: () => handleItemClick('accounting') },
                    { label: 'Chart of Accounts', action: () => handleItemClick('accounting', 'coa') },
                    { label: 'Journal Entries', action: () => handleItemClick('accounting', 'journal') },
                    { label: 'Trial Balance', action: () => handleItemClick('accounting', 'trial_balance') },
                    { label: 'Profit & Loss', action: () => handleItemClick('accounting', 'profit_loss') },
                    { label: 'Balance Sheet', action: () => handleItemClick('accounting', 'balance_sheet') },
                    { label: 'Tax Summary Report', action: () => handleItemClick('accounting', 'taxes') },
                    { label: 'List Accounts', action: () => handleItemClick('accounting', 'accounts') },
                    { label: 'Transfers Money', action: () => handleItemClick('accounting', 'money_transfer') },
                    { label: 'Create Expense', action: () => handleItemClick('accounting', 'create_expense') },
                    { label: 'All Expenses', action: () => handleItemClick('accounting', 'expenses') },
                    { label: 'Create Deposit', action: () => handleItemClick('accounting', 'create_deposit') },
                    { label: 'List Deposit', action: () => handleItemClick('accounting', 'deposits') },
                    { label: 'Expense Category', action: () => handleItemClick('accounting', 'expense_categories') },
                    { label: 'Deposit Category', action: () => handleItemClick('accounting', 'deposit_categories') },
                  ].map(sub => (
                    <button
                      key={sub.label}
                      onClick={sub.action}
                      className="w-full text-left py-1.5 px-2 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-white text-[11px] transition"
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 16. Subscription Product */}
          <button
            onClick={() => handleItemClick('settings', 'subscriptions')}
            className="w-full px-3.5 py-2.5 rounded-xl text-slate-700 hover:bg-slate-100 font-medium flex items-center gap-3 transition"
          >
            <DollarSign className="w-4 h-4 text-slate-600" />
            <span>Subscription Product</span>
          </button>

          {/* 17. Service & Maintenance (Phase 20) */}
          {hasService && (
            <div>
              <button
                onClick={() => toggleAccordion('service')}
                className="w-full px-3.5 py-2.5 rounded-xl text-slate-700 hover:bg-slate-100 font-medium flex items-center justify-between transition"
              >
                <div className="flex items-center gap-3">
                  <Wrench className="w-4 h-4 text-slate-600" />
                  <span>Service & Maintenance</span>
                </div>
                {openAccordion === 'service' ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
              </button>

              {openAccordion === 'service' && (
                <div className="pl-9 pr-2 py-1 space-y-1 bg-slate-50/50 rounded-xl my-0.5">
                  {[
                    { label: 'Job Tickets (জব কার্ড)', action: () => handleItemClick('service', 'jobs') },
                    { label: 'Checklist Report (চেকলিস্ট)', action: () => handleItemClick('service', 'checklists') },
                    { label: 'AMC Contracts (রক্ষণাবেক্ষণ)', action: () => handleItemClick('service', 'amc') },
                    { label: 'Warranty / Guarantee Tracker', action: () => handleItemClick('service', 'warranty') },
                  ].map(sub => (
                    <button
                      key={sub.label}
                      onClick={sub.action}
                      className="w-full text-left py-1.5 px-2 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-white text-[11px] transition"
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 18. Assets (Phase 21: Fixed Assets & Depreciation) */}
          {hasAssets && (
            <div>
              <button
                onClick={() => toggleAccordion('assets')}
                className="w-full px-3.5 py-2.5 rounded-xl text-slate-700 hover:bg-slate-100 font-medium flex items-center justify-between transition"
              >
                <div className="flex items-center gap-3">
                  <Building2 className="w-4 h-4 text-slate-600" />
                  <span>Fixed Assets & Depreciation</span>
                </div>
                {openAccordion === 'assets' ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
              </button>

              {openAccordion === 'assets' && (
                <div className="pl-9 pr-2 py-1 space-y-1 bg-slate-50/50 rounded-xl my-0.5">
                  {[
                    { label: 'Asset Register (স্থায়ী সম্পদ খতিয়ান)', action: () => handleItemClick('assets', 'register') },
                    { label: 'Depreciation Engine (অবচয় ক্যালকুলেশন)', action: () => handleItemClick('assets', 'depreciation') },
                    { label: 'Maintenance Log (মেরামত ও সার্ভিসিং)', action: () => handleItemClick('assets', 'maintenance') },
                    { label: 'Disposal & Scrap (নিষ্পত্তি ও লাভ-ক্ষতি)', action: () => handleItemClick('assets', 'disposal') },
                  ].map(sub => (
                    <button
                      key={sub.label}
                      onClick={sub.action}
                      className="w-full text-left py-1.5 px-2 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-white text-[11px] transition"
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 19. Projects, Tasks, Contracts & Bookings (Phase 22) */}
          {hasProjects && (
            <div>
              <button
                onClick={() => toggleAccordion('projects')}
                className="w-full px-3.5 py-2.5 rounded-xl text-slate-700 hover:bg-slate-100 font-medium flex items-center justify-between transition"
              >
                <div className="flex items-center gap-3">
                  <FolderKanban className="w-4 h-4 text-slate-600" />
                  <span>Projects & Bookings</span>
                </div>
                {openAccordion === 'projects' ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
              </button>

              {openAccordion === 'projects' && (
                <div className="pl-9 pr-2 py-1 space-y-1 bg-slate-50/50 rounded-xl my-0.5">
                  {[
                    { label: 'All Projects (প্রজেক্টস ও মাইলস্টোন)', action: () => handleItemClick('projects', 'projects') },
                    { label: 'Tasks Kanban (টাস্ক কানবান বোর্ড)', action: () => handleItemClick('projects', 'tasks') },
                    { label: 'Commercial Contracts (বাণিজ্যিক চুক্তিপত্র)', action: () => handleItemClick('projects', 'contracts') },
                    { label: 'Appointment Bookings (অ্যাপয়েন্টমেন্ট)', action: () => handleItemClick('projects', 'bookings') },
                  ].map(sub => (
                    <button
                      key={sub.label}
                      onClick={sub.action}
                      className="w-full text-left py-1.5 px-2 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-white text-[11px] transition"
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 20. Commissions (Conditional on commissions) */}
          {hasCommissions && (
            <div>
              <button
                onClick={() => toggleAccordion('commissions')}
                className="w-full px-3.5 py-2.5 rounded-xl text-slate-700 hover:bg-slate-100 font-medium flex items-center justify-between transition"
              >
                <div className="flex items-center gap-3">
                  <Award className="w-4 h-4 text-slate-600" />
                  <span>Commissions</span>
                </div>
                {openAccordion === 'commissions' ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
              </button>

              {openAccordion === 'commissions' && (
                <div className="pl-9 pr-2 py-1 space-y-1 bg-slate-50/50 rounded-xl my-0.5">
                  {[
                    { label: 'Commission Programs', action: () => handleItemClick('commissions', 'commission_programs') },
                    { label: 'Sales Agents', action: () => handleItemClick('commissions', 'sales_agents') },
                    { label: 'Commission Rules', action: () => handleItemClick('commissions', 'commission_rules') },
                    { label: 'Commission Receipts', action: () => handleItemClick('commissions', 'commission_receipts') },
                    { label: 'Commission Report', action: () => handleItemClick('commissions', 'commission_reports') },
                  ].map(sub => (
                    <button
                      key={sub.label}
                      onClick={sub.action}
                      className="w-full text-left py-1.5 px-2 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-white text-[11px] transition"
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 21. WooCommerce Settings (Conditional on ecommerce) */}
          {hasEcommerce && (
            <button
              onClick={() => handleItemClick('integrations', 'woocommerce')}
              className="w-full px-3.5 py-2.5 rounded-xl text-slate-700 hover:bg-slate-100 font-medium flex items-center gap-3 transition"
            >
              <ShoppingCart className="w-4 h-4 text-slate-600" />
              <span>WooCommerce Settings</span>
            </button>
          )}

          {/* 22. Knowledge Base */}
          <button
            onClick={() => handleItemClick('settings', 'knowledge_base')}
            className="w-full px-3.5 py-2.5 rounded-xl text-slate-700 hover:bg-slate-100 font-medium flex items-center gap-3 transition"
          >
            <HelpCircle className="w-4 h-4 text-slate-600" />
            <span>Knowledge Base</span>
          </button>

          {/* 23. Settings */}
          <div>
            <button
              onClick={() => toggleAccordion('settings')}
              className="w-full px-3.5 py-2.5 rounded-xl text-slate-700 hover:bg-slate-100 font-medium flex items-center justify-between transition"
            >
              <div className="flex items-center gap-3">
                <SettingsIcon className="w-4 h-4 text-slate-600" />
                <span>Settings</span>
              </div>
              {openAccordion === 'settings' ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
            </button>

            {openAccordion === 'settings' && (
              <div className="pl-9 pr-2 py-1 space-y-1 bg-slate-50/50 rounded-xl my-0.5">
                {[
                  { label: 'System Settings', action: () => handleItemClick('settings') },
                  { label: 'Dynamic Appearance', action: () => onOpenAppearance() },
                  { label: 'Languages', action: () => handleItemClick('settings', 'languages') },
                  { label: 'Payment Methods', action: () => handleItemClick('global') },
                  { label: 'SMS Settings', action: () => handleItemClick('settings', 'sms') },
                  { label: 'POS Settings', action: () => handleItemClick('settings', 'pos_policy') },
                  { label: 'POS Receipt', action: () => handleItemClick('settings', 'receipt_designer') },
                  { label: 'Module Settings', action: () => handleItemClick('settings', 'modules') },
                  { label: 'Warehouses', action: () => handleItemClick('warehouses') },
                  { label: 'Currency', action: () => handleItemClick('global', 'currency') },
                  { label: 'Cloud Backup & Restore (Phase 25)', action: () => handleItemClick('integrations', 'system_health') },
                ].map(sub => (
                  <button
                    key={sub.label}
                    onClick={sub.action}
                    className="w-full text-left py-1.5 px-2 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-white text-[11px] transition"
                  >
                    {sub.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Phase 25: Integrations & Cloud Sync Hub */}
          <div>
            <button
              onClick={() => toggleAccordion('integrations')}
              className="w-full px-3.5 py-2.5 rounded-xl text-slate-700 hover:bg-slate-100 font-medium flex items-center justify-between transition"
            >
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-purple-600" />
                <span className="font-bold">Integrations & Sync (Phase 25)</span>
              </div>
              {openAccordion === 'integrations' ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
            </button>

            {openAccordion === 'integrations' && (
              <div className="pl-9 pr-2 py-1 space-y-1 bg-slate-50/50 rounded-xl my-0.5">
                {[
                  { label: '⚡ QuickBooks Online Sync', action: () => handleItemClick('integrations', 'quickbooks') },
                  { label: '🛒 WooCommerce REST API', action: () => handleItemClick('integrations', 'woocommerce') },
                  { label: '📡 Outbound Webhooks Hub', action: () => handleItemClick('integrations', 'webhooks') },
                  { label: '🔒 Active Sessions & Security', action: () => handleItemClick('integrations', 'sessions') },
                  { label: '💾 Database Backup & Health', action: () => handleItemClick('integrations', 'system_health') },
                ].map(sub => (
                  <button
                    key={sub.label}
                    onClick={sub.action}
                    className="w-full text-left py-1.5 px-2 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-white text-[11px] transition"
                  >
                    {sub.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Hardware & Devices (Phase 15 - Conditional on hardwareSuite) */}
          {hasHardware && (
            <button
              onClick={() => handleItemClick('hardware')}
              className="w-full px-3.5 py-2.5 rounded-xl text-slate-700 hover:bg-slate-100 font-medium flex items-center gap-3 transition"
            >
              <Printer className="w-4 h-4 text-purple-600" />
              <span>Hardware & Sunmi POS (Phase 15)</span>
            </button>
          )}

          {/* WhatsApp Bot & Loyalty (Phase 14 - Conditional on whatsappLoyalty) */}
          {hasWhatsappLoyalty && (
            <button
              onClick={() => handleItemClick('whatsapp_loyalty')}
              className="w-full px-3.5 py-2.5 rounded-xl text-slate-700 hover:bg-slate-100 font-medium flex items-center gap-3 transition"
            >
              <Smartphone className="w-4 h-4 text-emerald-600" />
              <span>WhatsApp Bot & Loyalty (Phase 14)</span>
            </button>
          )}

          {/* 24. AI Reports (Conditional on ai) */}
          {hasAi && (
            <button
              onClick={() => handleItemClick('ai')}
              className="w-full px-3.5 py-2.5 rounded-xl text-slate-700 hover:bg-slate-100 font-medium flex items-center gap-3 transition"
            >
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span>AI Reports</span>
            </button>
          )}

          {/* 25. Reports */}
          <div>
            <button
              onClick={() => toggleAccordion('reports')}
              className="w-full px-3.5 py-2.5 rounded-xl text-slate-700 hover:bg-slate-100 font-medium flex items-center justify-between transition"
            >
              <div className="flex items-center gap-3">
                <TrendingUp className="w-4 h-4 text-slate-600" />
                <span>Reports</span>
              </div>
              {openAccordion === 'reports' ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
            </button>

            {openAccordion === 'reports' && (
              <div className="pl-9 pr-2 py-1 space-y-1 bg-slate-50/50 rounded-xl my-0.5 max-h-48 overflow-y-auto">
                {[
                  '3D Sales Dashboard', 'Payments Report', 'Cash Flow Report', 'Profit & Loss Report',
                  'Inventory Valuation', 'Stock Alert Report', 'Sales by Category', 'Sales by Brand',
                  'Suppliers Report', 'Customers Report', 'Top Selling Products', 'Dead Stock Report',
                  'Tax Summary Report', 'Error Logs'
                ].map(rep => (
                  <button
                    key={rep}
                    onClick={() => handleItemClick('accounting', rep)}
                    className="w-full text-left py-1 px-2 rounded text-slate-600 hover:text-purple-700 hover:bg-white text-[10px] transition truncate"
                  >
                    {rep}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 text-[10px] text-slate-500 text-center">
          JH IMSE • Legacy Edition v14.0
        </div>
      </div>
    </div>
  );
};
