import React, { useState, useMemo } from 'react';
import { 
  DollarSign, TrendingUp, TrendingDown, Receipt, Building, ShoppingCart, 
  Plus, Search, Filter, Calendar, Printer, Download, Eye, FileText, 
  Trash2, CreditCard, ArrowUpRight, ArrowDownRight, CheckCircle2, AlertTriangle, ShieldCheck,
  BookOpen, FolderTree, Scale, Building2
} from 'lucide-react';
import { 
  Tenant, Sale, Customer, ExpenseItem, ExpenseCategory, Supplier, 
  SupplierPurchaseOrder, SupplierPayment, CashBookEntry, Product,
  ChartOfAccount, JournalEntry, BankReconciliationItem
} from '../../types';
import { 
  INITIAL_CHART_OF_ACCOUNTS, INITIAL_JOURNAL_ENTRIES, INITIAL_BANK_RECONCILIATION 
} from '../../data/mockData';
import { AddExpenseModal } from './AddExpenseModal';
import { ExpenseVoucherPrintModal } from './ExpenseVoucherPrintModal';
import { AddSupplierModal } from './AddSupplierModal';
import { PaySupplierModal } from './PaySupplierModal';
import { SupplierLedgerModal } from './SupplierLedgerModal';
import { AddPurchaseModal } from './AddPurchaseModal';
import { GeneralJournalView } from './GeneralJournalView';
import { ChartOfAccountsView } from './ChartOfAccountsView';
import { FinancialAuditStatementsView } from './FinancialAuditStatementsView';
import { BankReconciliationView } from './BankReconciliationView';

interface AccountingManagerProps {
  tenant: Tenant;
  sales: Sale[];
  customers: Customer[];
  products: Product[];
  expenses: ExpenseItem[];
  suppliers: Supplier[];
  purchaseOrders: SupplierPurchaseOrder[];
  supplierPayments: SupplierPayment[];
  initialSubTab?: 'journal' | 'coa' | 'statements' | 'reconciliation' | 'pnl_cashbook' | 'expenses' | 'suppliers' | 'purchases';
  onAddExpense: (expense: Omit<ExpenseItem, 'id' | 'voucherNo' | 'createdAt'>) => void;
  onDeleteExpense?: (expenseId: string) => void;
  onSaveSupplier: (supplierData: Omit<Supplier, 'id' | 'createdAt'>, existingId?: string) => void;
  onRecordSupplierPayment: (payment: SupplierPayment) => void;
  onCreatePurchaseOrder: (purchase: Omit<SupplierPurchaseOrder, 'id' | 'createdAt'>) => void;
}

export const AccountingManager: React.FC<AccountingManagerProps> = ({
  tenant,
  sales,
  customers,
  products,
  expenses,
  suppliers,
  purchaseOrders,
  supplierPayments,
  initialSubTab = 'journal',
  onAddExpense,
  onDeleteExpense,
  onSaveSupplier,
  onRecordSupplierPayment,
  onCreatePurchaseOrder,
}) => {
  // Sub-tabs (Phase 10 Enterprise Suite)
  const [subTab, setSubTab] = useState<
    'journal' | 'coa' | 'statements' | 'reconciliation' | 'pnl_cashbook' | 'expenses' | 'suppliers' | 'purchases'
  >(initialSubTab);

  React.useEffect(() => {
    if (initialSubTab) {
      setSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  const [dateFilter, setDateFilter] = useState<'today' | '7days' | 'month' | 'year' | 'all'>('month');

  // Phase 10 State
  const [chartOfAccounts, setChartOfAccounts] = useState<ChartOfAccount[]>(INITIAL_CHART_OF_ACCOUNTS);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(INITIAL_JOURNAL_ENTRIES);
  const [reconciliationItems, setReconciliationItems] = useState<BankReconciliationItem[]>(INITIAL_BANK_RECONCILIATION);

  // Phase 10 Handlers
  const handleAddJournalEntry = (newEntry: JournalEntry) => {
    setJournalEntries(prev => [newEntry, ...prev]);

    // Live ledger balance updates for the involved accounts
    setChartOfAccounts(prev => {
      const updated = [...prev];
      newEntry.lines.forEach(line => {
        const accIdx = updated.findIndex(a => a.id === line.accountId || a.code === line.accountCode);
        if (accIdx !== -1) {
          const acc = updated[accIdx];
          let balanceChange = 0;
          if (acc.normalBalance === 'debit') {
            balanceChange = (line.debit || 0) - (line.credit || 0);
          } else {
            balanceChange = (line.credit || 0) - (line.debit || 0);
          }
          updated[accIdx] = {
            ...acc,
            balance: Math.max(0, acc.balance + balanceChange),
          };
        }
      });
      return updated;
    });
  };

  const handleAddAccount = (newAcc: ChartOfAccount) => {
    setChartOfAccounts(prev => [...prev, newAcc]);
  };

  const handleUpdateReconcileStatus = (itemId: string, status: BankReconciliationItem['status']) => {
    setReconciliationItems(prev => prev.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          status,
          reconciledDate: status === 'reconciled' ? new Date().toISOString().slice(0, 10) : undefined,
        };
      }
      return item;
    }));
  };

  const handleAddReconcileItem = (item: BankReconciliationItem) => {
    setReconciliationItems(prev => [item, ...prev]);
  };

  // Modals state
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [selectedExpenseForPrint, setSelectedExpenseForPrint] = useState<ExpenseItem | null>(null);

  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [supplierToEdit, setSupplierToEdit] = useState<Supplier | null>(null);
  const [selectedSupplierForPayment, setSelectedSupplierForPayment] = useState<Supplier | null>(null);
  const [selectedSupplierForLedger, setSelectedSupplierForLedger] = useState<Supplier | null>(null);
  const [isAddPurchaseOpen, setIsAddPurchaseOpen] = useState(false);

  // Filters & Search
  const [expenseSearch, setExpenseSearch] = useState('');
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState<string>('all');
  const [supplierSearch, setSupplierSearch] = useState('');
  const [supplierFilterDue, setSupplierFilterDue] = useState<'all' | 'due' | 'paid'>('all');

  // Filtered by tenant
  const tenantSales = useMemo(() => sales.filter(s => s.tenantId === tenant.id), [sales, tenant.id]);
  const tenantExpenses = useMemo(() => expenses.filter(e => e.tenantId === tenant.id), [expenses, tenant.id]);
  const tenantSuppliers = useMemo(() => suppliers.filter(s => s.tenantId === tenant.id), [suppliers, tenant.id]);
  const tenantPurchases = useMemo(() => purchaseOrders.filter(p => p.tenantId === tenant.id), [purchaseOrders, tenant.id]);
  const tenantSupplierPayments = useMemo(() => supplierPayments.filter(sp => sp.tenantId === tenant.id), [supplierPayments, tenant.id]);
  const tenantCustomers = useMemo(() => customers.filter(c => c.tenantId === tenant.id), [customers, tenant.id]);

  // Financial Calculations
  const totalSalesRevenue = useMemo(() => {
    return tenantSales.reduce((sum, s) => sum + s.totalAmount, 0);
  }, [tenantSales]);

  // Cost of Goods Sold (COGS)
  const totalCOGS = useMemo(() => {
    return tenantSales.reduce((sum, s) => {
      const saleCost = s.items.reduce((iSum, item) => iSum + ((item.costPrice || 0) * item.quantity), 0);
      return sum + (saleCost > 0 ? saleCost : s.totalAmount * 0.75); // fallback 75% cost if zero
    }, 0);
  }, [tenantSales]);

  const grossProfit = Math.max(0, totalSalesRevenue - totalCOGS);
  const grossProfitMargin = totalSalesRevenue > 0 ? ((grossProfit / totalSalesRevenue) * 100).toFixed(1) : '0';

  const totalExpenses = useMemo(() => {
    return tenantExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [tenantExpenses]);

  const netProfit = grossProfit - totalExpenses;

  // Accounts Payable (Total amount owed to all suppliers)
  const totalAccountsPayable = useMemo(() => {
    return tenantSuppliers.reduce((sum, s) => sum + s.dueBalance, 0);
  }, [tenantSuppliers]);

  // Accounts Receivable (Total amount owed by customers)
  const totalAccountsReceivable = useMemo(() => {
    return tenantCustomers.reduce((sum, c) => sum + c.dueAmount, 0);
  }, [tenantCustomers]);

  // Cash In vs Cash Out for Cash Book
  const cashBookEntries: CashBookEntry[] = useMemo(() => {
    const list: CashBookEntry[] = [];
    let runningBalance = 25000; // Starting baseline cash in drawer

    // 1. Sales Cash In
    tenantSales.forEach(s => {
      if (s.paidAmount > 0) {
        runningBalance += s.paidAmount;
        list.push({
          id: 'cb-sale-' + s.id,
          tenantId: tenant.id,
          date: s.createdAt.slice(0, 10),
          type: 'cash_in',
          source: 'sale',
          referenceNo: s.invoiceNumber,
          description: `কাউন্টার বিক্রয় (${s.customerName || 'খুচরা ক্রেতা'})`,
          amount: s.paidAmount,
          paymentMethod: (s.paymentMethod as any) || 'cash',
          balance: runningBalance,
        });
      }
    });

    // 2. Operational Expenses Cash Out
    tenantExpenses.forEach(e => {
      runningBalance -= e.amount;
      list.push({
        id: 'cb-exp-' + e.id,
        tenantId: tenant.id,
        date: e.date,
        type: 'cash_out',
        source: 'expense',
        referenceNo: e.voucherNo,
        description: `${e.title} (${e.paidTo || 'ভাউচার'})`,
        amount: e.amount,
        paymentMethod: e.paymentMethod,
        balance: runningBalance,
      });
    });

    // 3. Supplier Payments Cash Out
    tenantSupplierPayments.forEach(sp => {
      runningBalance -= sp.amount;
      list.push({
        id: 'cb-sp-' + sp.id,
        tenantId: tenant.id,
        date: sp.date,
        type: 'cash_out',
        source: 'supplier_payment',
        referenceNo: sp.paymentVoucherNo,
        description: `মহাজনকে বিল পরিশোধ: ${sp.supplierName}`,
        amount: sp.amount,
        paymentMethod: sp.paymentMethod,
        balance: runningBalance,
      });
    });

    // Sort by date descending
    return list.sort((a, b) => b.date.localeCompare(a.date));
  }, [tenantSales, tenantExpenses, tenantSupplierPayments, tenant.id]);

  const totalCashIn = cashBookEntries.filter(c => c.type === 'cash_in').reduce((s, c) => s + c.amount, 0);
  const totalCashOut = cashBookEntries.filter(c => c.type === 'cash_out').reduce((s, c) => s + c.amount, 0);

  // Filtered Expenses
  const displayedExpenses = useMemo(() => {
    return tenantExpenses.filter(e => {
      const matchCat = expenseCategoryFilter === 'all' || e.category === expenseCategoryFilter;
      const matchSearch = expenseSearch === '' || 
        e.title.toLowerCase().includes(expenseSearch.toLowerCase()) ||
        e.voucherNo.toLowerCase().includes(expenseSearch.toLowerCase()) ||
        (e.paidTo && e.paidTo.toLowerCase().includes(expenseSearch.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [tenantExpenses, expenseCategoryFilter, expenseSearch]);

  // Filtered Suppliers
  const displayedSuppliers = useMemo(() => {
    return tenantSuppliers.filter(s => {
      const matchDue = supplierFilterDue === 'all' || 
        (supplierFilterDue === 'due' && s.dueBalance > 0) ||
        (supplierFilterDue === 'paid' && s.dueBalance === 0);
      const matchSearch = supplierSearch === '' ||
        s.name.toLowerCase().includes(supplierSearch.toLowerCase()) ||
        s.companyName.toLowerCase().includes(supplierSearch.toLowerCase()) ||
        s.phone.includes(supplierSearch);
      return matchDue && matchSearch;
    });
  }, [tenantSuppliers, supplierFilterDue, supplierSearch]);

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'rent': return 'দোকান ভাড়া';
      case 'utilities': return 'বিদ্যুৎ ও বিল';
      case 'salaries': return 'স্টাফ বেতন';
      case 'food_entertainment': return 'চা-নাস্তা ও খাবার';
      case 'transport_courier': return 'পরিবহন ও যাতায়াত';
      case 'packaging': return 'প্যাকেজিং ব্যাগ';
      case 'marketing': return 'বিজ্ঞাপন';
      case 'maintenance': return 'মেরামত';
      case 'tax_trade_license': return 'ট্যাক্স ও লাইসেন্স';
      default: return 'অন্যান্য বিবিধ';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Title & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-sm">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                আর্থিক হিসাব খাতা ও লাভ-ক্ষতি (Accounts & Finance Hub)
              </h2>
              <p className="text-xs text-slate-500">
                {tenant.name} • দৈনিক ক্যাশ বুক, প্রফিট অ্যান্ড লস, খরচ ভাউচার ও মহাজন দেনা-পাওনা
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsAddExpenseOpen(true)}
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" /> নতুন খরচ এন্ট্রি
          </button>
          <button
            onClick={() => setIsAddPurchaseOpen(true)}
            className="px-3.5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <ShoppingCart className="w-4 h-4" /> ক্রয় চালান (Purchase)
          </button>
          <button
            onClick={() => {
              setSupplierToEdit(null);
              setIsAddSupplierOpen(true);
            }}
            className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <Building className="w-4 h-4" /> নতুন মহাজন / সাপ্লায়ার
          </button>
        </div>
      </div>

      {/* KPI Financial Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Sales */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">মোট বিক্রয় রাজস্ব</span>
          <div className="font-mono font-black text-slate-900 text-lg mt-1">
            {tenant.currency}{totalSalesRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5 mt-0.5">
            <ArrowUpRight className="w-3 h-3" /> মোট ইনভয়েস: {tenantSales.length} টি
          </span>
        </div>

        {/* COGS */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">মালের ক্রয়মূল্য (COGS)</span>
          <div className="font-mono font-bold text-slate-700 text-lg mt-1">
            {tenant.currency}{totalCOGS.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-slate-500 font-medium mt-0.5 block">
            কেনা দর বাবদ ব্যয়
          </span>
        </div>

        {/* Gross Profit */}
        <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-2xs bg-emerald-50/20">
          <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider block">মোট লাভ (Gross Profit)</span>
          <div className="font-mono font-black text-emerald-700 text-lg mt-1">
            {tenant.currency}{grossProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-emerald-600 font-bold mt-0.5 block">
            মার্জিন: {grossProfitMargin}%
          </span>
        </div>

        {/* Total Expenses */}
        <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-2xs bg-rose-50/20">
          <span className="text-[10px] text-rose-700 font-bold uppercase tracking-wider block">দোকানের মোট খরচ</span>
          <div className="font-mono font-black text-rose-600 text-lg mt-1">
            {tenant.currency}{totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-rose-500 font-semibold mt-0.5 block">
            মোট ভাউচার: {tenantExpenses.length} টি
          </span>
        </div>

        {/* Net Profit */}
        <div className={`p-4 rounded-2xl border shadow-2xs ${
          netProfit >= 0 ? 'bg-emerald-700 text-white border-emerald-800' : 'bg-rose-700 text-white border-rose-800'
        }`}>
          <span className="text-[10px] uppercase font-bold tracking-wider opacity-80 block">প্রকৃত নিট মুনাফা (Net Profit)</span>
          <div className="font-mono font-black text-xl mt-1">
            {tenant.currency}{netProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] font-semibold opacity-90 mt-0.5 block">
            {netProfit >= 0 ? 'লাভজনক অবস্থান ✓' : 'ঘাটতি / লোকসান ⚠️'}
          </span>
        </div>

        {/* Accounts Payable (মহাজন দেনা) */}
        <div className="bg-white p-4 rounded-2xl border border-blue-200 shadow-2xs bg-blue-50/20">
          <span className="text-[10px] text-blue-800 font-bold uppercase tracking-wider block">মহাজনদের দেনা বকেয়া</span>
          <div className="font-mono font-black text-blue-900 text-lg mt-1">
            {tenant.currency}{totalAccountsPayable.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-blue-600 font-semibold mt-0.5 block">
            সাপ্লায়ার দেনা: {tenantSuppliers.filter(s => s.dueBalance > 0).length} জন
          </span>
        </div>
      </div>

      {/* Navigation Sub-Tabs (Phase 10 Double-Entry Suite) */}
      <div className="flex border-b border-slate-200 gap-1 overflow-x-auto text-xs pb-0.5">
        <button
          onClick={() => setSubTab('journal')}
          className={`px-3.5 py-2.5 font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            subTab === 'journal'
              ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" /> সাধারণ জাবেদা (General Journal)
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-100 text-indigo-800 font-mono">
            {journalEntries.length}
          </span>
        </button>

        <button
          onClick={() => setSubTab('coa')}
          className={`px-3.5 py-2.5 font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            subTab === 'coa'
              ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FolderTree className="w-4 h-4" /> হিসাবের চার্ট (Chart of Accounts)
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-700 font-mono">
            {chartOfAccounts.length}
          </span>
        </button>

        <button
          onClick={() => setSubTab('statements')}
          className={`px-3.5 py-2.5 font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            subTab === 'statements'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Scale className="w-4 h-4" /> রেওয়ামিল ও ব্যালেন্স শিট (Trial Balance)
        </button>

        <button
          onClick={() => setSubTab('reconciliation')}
          className={`px-3.5 py-2.5 font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            subTab === 'reconciliation'
              ? 'border-teal-600 text-teal-700 bg-teal-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" /> ব্যাংক সমন্বয় (Bank Reconciliation)
          {reconciliationItems.filter(i => i.status === 'pending').length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800 font-mono font-bold">
              {reconciliationItems.filter(i => i.status === 'pending').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setSubTab('pnl_cashbook')}
          className={`px-3.5 py-2.5 font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            subTab === 'pnl_cashbook'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" /> ক্যাশ বুক ও লাভ-ক্ষতি (Cash Book)
        </button>

        <button
          onClick={() => setSubTab('expenses')}
          className={`px-3.5 py-2.5 font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            subTab === 'expenses'
              ? 'border-rose-600 text-rose-700 bg-rose-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Receipt className="w-4 h-4" /> খরচের হিসাব (Expenses)
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-100 text-rose-800 font-mono">
            {tenantExpenses.length}
          </span>
        </button>

        <button
          onClick={() => setSubTab('suppliers')}
          className={`px-3.5 py-2.5 font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            subTab === 'suppliers'
              ? 'border-blue-600 text-blue-700 bg-blue-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building className="w-4 h-4" /> মহাজন লেজার (Suppliers & AP)
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 text-blue-800 font-mono">
            {tenantSuppliers.length}
          </span>
        </button>

        <button
          onClick={() => setSubTab('purchases')}
          className={`px-3.5 py-2.5 font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            subTab === 'purchases'
              ? 'border-teal-600 text-teal-700 bg-teal-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShoppingCart className="w-4 h-4" /> ক্রয় চালান (Purchases)
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-teal-100 text-teal-800 font-mono">
            {tenantPurchases.length}
          </span>
        </button>
      </div>

      {/* ========================================================
          PHASE 10: SUB-TAB - GENERAL JOURNAL
      ======================================================== */}
      {subTab === 'journal' && (
        <GeneralJournalView
          journalEntries={journalEntries}
          chartOfAccounts={chartOfAccounts}
          currency={tenant.currency}
          onAddJournalEntry={handleAddJournalEntry}
        />
      )}

      {/* ========================================================
          PHASE 10: SUB-TAB - CHART OF ACCOUNTS (COA)
      ======================================================== */}
      {subTab === 'coa' && (
        <ChartOfAccountsView
          chartOfAccounts={chartOfAccounts}
          currency={tenant.currency}
          onAddAccount={handleAddAccount}
        />
      )}

      {/* ========================================================
          PHASE 10: SUB-TAB - FINANCIAL AUDIT STATEMENTS
      ======================================================== */}
      {subTab === 'statements' && (
        <FinancialAuditStatementsView
          chartOfAccounts={chartOfAccounts}
          journalEntries={journalEntries}
          currency={tenant.currency}
          storeName={tenant.name}
        />
      )}

      {/* ========================================================
          PHASE 10: SUB-TAB - BANK RECONCILIATION
      ======================================================== */}
      {subTab === 'reconciliation' && (
        <BankReconciliationView
          reconciliationItems={reconciliationItems}
          bankAccounts={chartOfAccounts.filter(a => a.category === 'asset' && (a.classification === 'current_asset' && (a.code === '1020' || a.code === '1025' || a.name.toLowerCase().includes('bank'))))}
          currency={tenant.currency}
          onUpdateItemStatus={handleUpdateReconcileStatus}
          onAddItem={handleAddReconcileItem}
        />
      )}

      {/* ========================================================
          SUB-TAB 1: CASH BOOK & P&L STATEMENT
      ======================================================== */}
      {subTab === 'pnl_cashbook' && (
        <div className="space-y-5">
          {/* Cash Summary Banner */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl p-6 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest block">
                আজকের ক্যাশ ফ্লো ও ট্রেজারি স্থিতি
              </span>
              <h3 className="text-2xl font-black font-mono mt-1">
                {tenant.currency}{(totalCashIn - totalCashOut + 25000).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                প্রারম্ভিক ক্যাশ ড্রয়ার ব্যালেন্স সহ বর্তমান নগদ ও ব্যাংক সঞ্চয়
              </p>
            </div>

            <div className="flex gap-4 bg-white/10 p-4 rounded-2xl backdrop-blur-xs">
              <div>
                <span className="text-[10px] text-emerald-300 font-semibold block uppercase">মোট ক্যাশ-ইন (জমা)</span>
                <span className="text-base font-black font-mono text-emerald-400">
                  +{tenant.currency}{totalCashIn.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="w-px bg-white/20"></div>
              <div>
                <span className="text-[10px] text-rose-300 font-semibold block uppercase">মোট ক্যাশ-আউট (খরচ/পরিশোধ)</span>
                <span className="text-base font-black font-mono text-rose-400">
                  -{tenant.currency}{totalCashOut.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Cash Book Timeline Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">দৈনিক ক্যাশ বুক খতিয়ান (Daily Cash In / Cash Out Log)</h3>
                <p className="text-xs text-slate-500">বিক্রয় কালেকশন, খরচের ভাউচার এবং সাপ্লায়ার পেমেন্টের রিয়েল-টাইম ক্যাশ প্রবাহ</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Printer className="w-3.5 h-3.5" /> ক্যাশ বুক প্রিন্ট
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11px]">
                  <tr>
                    <th className="py-3 px-4">তারিখ</th>
                    <th className="py-3 px-4">রেফারেন্স নং</th>
                    <th className="py-3 px-4">খাত ও বিবরণ</th>
                    <th className="py-3 px-4 text-center">মাধ্যম</th>
                    <th className="py-3 px-4 text-right">ক্যাশ-ইন / জমা (+)</th>
                    <th className="py-3 px-4 text-right">ক্যাশ-আউট / খরচ (-)</th>
                    <th className="py-3 px-4 text-right">চলতি ব্যালেন্স</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cashBookEntries.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        কোনো লেনদেন রেকর্ড পাওয়া যায়নি
                      </td>
                    </tr>
                  ) : (
                    cashBookEntries.map(entry => (
                      <tr key={entry.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-4 font-mono text-slate-600 text-[11px]">{entry.date}</td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-800 text-[11px]">{entry.referenceNo}</td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-slate-900">{entry.description}</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="uppercase text-[9px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {entry.paymentMethod}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                          {entry.type === 'cash_in' ? `+${tenant.currency}${entry.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '-'}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-rose-600">
                          {entry.type === 'cash_out' ? `-${tenant.currency}${entry.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '-'}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-black text-slate-900">
                          {tenant.currency}{entry.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
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

      {/* ========================================================
          SUB-TAB 2: EXPENSES (খরচের হিসাব খাতা)
      ======================================================== */}
      {subTab === 'expenses' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={expenseCategoryFilter}
                onChange={e => setExpenseCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-none"
              >
                <option value="all">সকল খরচের খাত (All Categories)</option>
                <option value="rent">দোকান / গোডাউন ভাড়া</option>
                <option value="utilities">বিদ্যুৎ ও গ্যাস বিল</option>
                <option value="salaries">স্টাফ বেতন</option>
                <option value="food_entertainment">খাবার ও নাস্তা</option>
                <option value="transport_courier">পরিবহন ও যাতায়াত</option>
                <option value="packaging">প্যাকেজিং ও ব্যাগ</option>
                <option value="marketing">মার্কেটিং ও বিজ্ঞাপন</option>
                <option value="maintenance">মেরামত ও সংস্কার</option>
                <option value="tax_trade_license">ট্যাক্স ও লাইসেন্স ফি</option>
                <option value="other">অন্যান্য বিবিধ খরচ</option>
              </select>
            </div>

            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={expenseSearch}
                onChange={e => setExpenseSearch(e.target.value)}
                placeholder="খরচের নাম, ভাউচার নং বা প্রাপক খুঁজুন..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
              />
            </div>
          </div>

          {/* Expenses Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11px]">
                  <tr>
                    <th className="py-3 px-4">ভাউচার নং</th>
                    <th className="py-3 px-4">তারিখ</th>
                    <th className="py-3 px-4">খরচের খাত ও শিরোনাম</th>
                    <th className="py-3 px-4">প্রাপক (Paid To)</th>
                    <th className="py-3 px-4 text-center">মাধ্যম</th>
                    <th className="py-3 px-4 text-right">পরিমাণ ({tenant.currency})</th>
                    <th className="py-3 px-4 text-center">অনুমোদন</th>
                    <th className="py-3 px-4 text-center">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayedExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        <Receipt className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                        <p className="font-semibold text-slate-600">কোনো খরচের রেকর্ড পাওয়া যায়নি</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">নতুন খরচের ভাউচার তৈরি করতে উপরের বাটনে ক্লিক করুন</p>
                      </td>
                    </tr>
                  ) : (
                    displayedExpenses.map(exp => (
                      <tr key={exp.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-4 font-mono font-bold text-rose-700 text-[11px]">{exp.voucherNo}</td>
                        <td className="py-3 px-4 font-mono text-slate-600 text-[11px]">{exp.date}</td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{exp.title}</div>
                          <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-700">
                            {getCategoryLabel(exp.category)}
                          </span>
                          {exp.referenceNo && (
                            <span className="ml-1 text-[10px] text-slate-400 font-mono">Ref: {exp.referenceNo}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-700 font-medium">
                          {exp.paidTo || '-'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="uppercase text-[9px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                            {exp.paymentMethod}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-black text-rose-600 text-sm">
                          {tenant.currency}{exp.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-center text-[11px] text-slate-500">
                          {exp.approvedBy}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setSelectedExpenseForPrint(exp)}
                              className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition cursor-pointer"
                              title="খরচ ভাউচার প্রিন্ট করুন"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                            {onDeleteExpense && (
                              <button
                                onClick={() => {
                                  if (confirm(`আপনি কি "${exp.title}" খরচের ভাউচারটি মুছে ফেলতে চান?`)) {
                                    onDeleteExpense(exp.id);
                                  }
                                }}
                                className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
                                title="ভাউচার মুছুন"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
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

      {/* ========================================================
          SUB-TAB 3: SUPPLIERS (মহাজন ও সাপ্লায়ার লেজার)
      ======================================================== */}
      {subTab === 'suppliers' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div className="flex items-center gap-2">
              <select
                value={supplierFilterDue}
                onChange={e => setSupplierFilterDue(e.target.value as any)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-none"
              >
                <option value="all">সকল মহাজন / সাপ্লায়ার</option>
                <option value="due">বকেয়া দেনা রয়েছে (Accounts Payable)</option>
                <option value="paid">পরিশোধিত (No Due)</option>
              </select>
            </div>

            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={supplierSearch}
                onChange={e => setSupplierSearch(e.target.value)}
                placeholder="কোম্পানি, নাম বা ফোন নম্বর খুঁজুন..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>
          </div>

          {/* Suppliers Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11px]">
                  <tr>
                    <th className="py-3 px-4">প্রতিষ্ঠান ও প্রতিনিধির নাম</th>
                    <th className="py-3 px-4">ক্যাটাগরি ও যোগাযোগ</th>
                    <th className="py-3 px-4 text-right">মোট ক্রয় (Purchases)</th>
                    <th className="py-3 px-4 text-right">পরিশোধকৃত (Paid)</th>
                    <th className="py-3 px-4 text-right">বর্তমান দেনা (Payable Due)</th>
                    <th className="py-3 px-4 text-center">অ্যাকশন ও খতিয়ান</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayedSuppliers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <Building className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                        <p className="font-semibold text-slate-600">কোনো সরবরাহকারী পাওয়া যায়নি</p>
                      </td>
                    </tr>
                  ) : (
                    displayedSuppliers.map(sup => (
                      <tr key={sup.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 text-xs">{sup.companyName}</div>
                          <div className="text-[11px] text-slate-500">{sup.name}</div>
                          <div className="text-[10px] text-slate-400 truncate max-w-xs mt-0.5">📍 {sup.address}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800">
                            {sup.category}
                          </span>
                          <div className="text-[11px] font-mono text-slate-600 mt-1">📞 {sup.phone}</div>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">
                          {tenant.currency}{sup.totalPurchases.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                          {tenant.currency}{sup.totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-black text-rose-600 text-sm">
                          {tenant.currency}{sup.dueBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          {sup.dueBalance === 0 && (
                            <span className="block text-[9px] text-emerald-600 font-semibold mt-0.5">
                              পরিশোধিত ✓
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* View Ledger */}
                            <button
                              onClick={() => setSelectedSupplierForLedger(sup)}
                              className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition cursor-pointer"
                              title="মহাজন লেজার স্টেটমেন্ট দেখুন"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>

                            {/* Pay Supplier */}
                            <button
                              onClick={() => setSelectedSupplierForPayment(sup)}
                              disabled={sup.dueBalance <= 0}
                              className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 disabled:opacity-30 text-emerald-700 transition cursor-pointer"
                              title="বিল পরিশোধ করুন"
                            >
                              <DollarSign className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit Supplier */}
                            <button
                              onClick={() => {
                                setSupplierToEdit(sup);
                                setIsAddSupplierOpen(true);
                              }}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                              title="তথ্য এডিট করুন"
                            >
                              <Eye className="w-3.5 h-3.5" />
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
        </div>
      )}

      {/* ========================================================
          SUB-TAB 4: PURCHASES (ক্রয় চালান ও ইনকামিং)
      ======================================================== */}
      {subTab === 'purchases' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700">সাপ্লায়ার ক্রয় চালান ও গুদাম ইনকামিং তালিকা</span>
              <span className="text-slate-500 font-mono">মোট চালান: {tenantPurchases.length} টি</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11px]">
                  <tr>
                    <th className="py-3 px-4">চালান নং (PO)</th>
                    <th className="py-3 px-4">তারিখ</th>
                    <th className="py-3 px-4">মহাজন / সাপ্লায়ার</th>
                    <th className="py-3 px-4">পণ্য ও পরিমাণ</th>
                    <th className="py-3 px-4 text-right">মোট বিল</th>
                    <th className="py-3 px-4 text-right">জমা (Paid)</th>
                    <th className="py-3 px-4 text-right">বাকি (Due)</th>
                    <th className="py-3 px-4 text-center">স্ট্যাটাস</th>
                    <th className="py-3 px-4 text-center">গ্রহণকারী</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tenantPurchases.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400">
                        <ShoppingCart className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                        <p className="font-semibold text-slate-600">কোনো ক্রয় চালান এন্ট্রি পাওয়া যায়নি</p>
                      </td>
                    </tr>
                  ) : (
                    tenantPurchases.map(po => (
                      <tr key={po.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-4 font-mono font-bold text-teal-800">{po.poNumber}</td>
                        <td className="py-3 px-4 font-mono text-slate-600">{po.date}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">{po.supplierName}</td>
                        <td className="py-3 px-4">
                          <div className="text-slate-800 font-medium">
                            {po.items.map((i: any) => `${i.productName} (${i.quantity}x)`).join(', ')}
                          </div>
                          {po.items.some((i: any) => i.batchNumber) && (
                            <span className="text-[10px] text-teal-700 font-mono block mt-0.5">
                              ব্যাচ: {po.items.map((i: any) => i.batchNumber).filter(Boolean).join(', ')}
                            </span>
                          )}

                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                          {tenant.currency}{po.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                          {tenant.currency}{po.paidAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-rose-600">
                          {tenant.currency}{po.dueAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 uppercase">
                            {po.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center text-slate-600 text-[11px]">
                          {po.receivedBy}
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

      {/* ========================================================
          MODALS
      ======================================================== */}
      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        tenant={tenant}
        onAddExpense={onAddExpense}
      />

      {/* Expense Voucher Print Modal */}
      <ExpenseVoucherPrintModal
        isOpen={!!selectedExpenseForPrint}
        onClose={() => setSelectedExpenseForPrint(null)}
        tenant={tenant}
        expense={selectedExpenseForPrint}
      />

      {/* Add / Edit Supplier Modal */}
      <AddSupplierModal
        isOpen={isAddSupplierOpen}
        onClose={() => {
          setIsAddSupplierOpen(false);
          setSupplierToEdit(null);
        }}
        tenant={tenant}
        supplierToEdit={supplierToEdit}
        onSaveSupplier={onSaveSupplier}
      />

      {/* Pay Supplier Modal */}
      <PaySupplierModal
        isOpen={!!selectedSupplierForPayment}
        onClose={() => setSelectedSupplierForPayment(null)}
        tenant={tenant}
        supplier={selectedSupplierForPayment}
        onRecordPayment={onRecordSupplierPayment}
      />

      {/* Supplier Ledger Statement Modal */}
      <SupplierLedgerModal
        isOpen={!!selectedSupplierForLedger}
        onClose={() => setSelectedSupplierForLedger(null)}
        tenant={tenant}
        supplier={selectedSupplierForLedger}
        onOpenPaySupplier={(sup) => {
          setSelectedSupplierForLedger(null);
          setSelectedSupplierForPayment(sup);
        }}
      />

      {/* Add Purchase / Bill Modal */}
      <AddPurchaseModal
        isOpen={isAddPurchaseOpen}
        onClose={() => setIsAddPurchaseOpen(false)}
        tenant={tenant}
        suppliers={tenantSuppliers}
        products={products.filter(p => p.tenantId === tenant.id)}
        onCreatePurchase={onCreatePurchaseOrder}
      />
    </div>
  );
};
