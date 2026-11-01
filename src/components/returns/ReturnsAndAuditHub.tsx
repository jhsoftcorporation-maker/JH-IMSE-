import React, { useState, useMemo } from 'react';
import {
  RotateCcw, AlertOctagon, ClipboardCheck, ArrowDownLeft, ArrowUpRight,
  Plus, Search, Printer, CheckCircle2, AlertTriangle, Filter,
  Building2, Trash2, Calendar, User, FileText, ChevronRight, X,
  Package, DollarSign, SlidersHorizontal, RefreshCw, Eye, ArrowRightLeft,
  Check, ShieldAlert, Barcode, Warehouse as WarehouseIcon
} from 'lucide-react';
import {
  Tenant, Product, Warehouse, Supplier, Customer, Sale,
  CreditNote, CreditNoteItem, PurchaseReturn, PurchaseReturnItem,
  DamageLog, DamageLogItem, DamageReason, StockCountAudit, StockCountItem,
  StockAdjustment
} from '../../types';

interface ReturnsAndAuditHubProps {
  tenant: Tenant;
  products: Product[];
  warehouses: Warehouse[];
  suppliers: Supplier[];
  customers: Customer[];
  sales: Sale[];
  creditNotes: CreditNote[];
  purchaseReturns: PurchaseReturn[];
  damageLogs: DamageLog[];
  stockCountAudits: StockCountAudit[];
  initialTab?: 'sales_returns' | 'purchase_returns' | 'damages' | 'stock_count';
  onSaveCreditNote: (cn: Omit<CreditNote, 'id'>, restockItems: { productId: string; quantity: number }[], damageItems?: { productId: string; quantity: number; reason: DamageReason }[]) => void;
  onSavePurchaseReturn: (pr: Omit<PurchaseReturn, 'id'>) => void;
  onSaveDamageLog: (dmg: Omit<DamageLog, 'id'>) => void;
  onCreateStockCountAudit: (audit: Omit<StockCountAudit, 'id'>) => void;
  onUpdateStockCountAudit: (audit: StockCountAudit) => void;
  onReconcileStockCountAudit: (auditId: string) => void;
}

export const ReturnsAndAuditHub: React.FC<ReturnsAndAuditHubProps> = ({
  tenant,
  products,
  warehouses,
  suppliers,
  customers,
  sales,
  creditNotes,
  purchaseReturns,
  damageLogs,
  stockCountAudits,
  initialTab = 'sales_returns',
  onSaveCreditNote,
  onSavePurchaseReturn,
  onSaveDamageLog,
  onCreateStockCountAudit,
  onUpdateStockCountAudit,
  onReconcileStockCountAudit,
}) => {
  // Active Tab
  const [activeTab, setActiveTab] = useState<'sales_returns' | 'purchase_returns' | 'damages' | 'stock_count'>(initialTab);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWarehouseFilter, setSelectedWarehouseFilter] = useState('all');

  // Modals
  const [isCreateSalesReturnOpen, setIsCreateSalesReturnOpen] = useState(false);
  const [isCreatePurchaseReturnOpen, setIsCreatePurchaseReturnOpen] = useState(false);
  const [isCreateDamageLogOpen, setIsCreateDamageLogOpen] = useState(false);
  const [isCreateStockCountOpen, setIsCreateStockCountOpen] = useState(false);

  // Active viewing/printing objects
  const [viewingCreditNote, setViewingCreditNote] = useState<CreditNote | null>(null);
  const [viewingPurchaseReturn, setViewingPurchaseReturn] = useState<PurchaseReturn | null>(null);
  const [viewingDamageLog, setViewingDamageLog] = useState<DamageLog | null>(null);
  const [activeAuditWorkspace, setActiveAuditWorkspace] = useState<StockCountAudit | null>(null);

  // Audio beep for barcode scan
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.08);
    } catch {
      // Audio not supported or blocked
    }
  };

  // Filtered dataset for active tenant
  const tenantCreditNotes = useMemo(() => {
    return creditNotes.filter(cn => cn.tenantId === tenant.id && 
      (searchQuery === '' || 
       cn.creditNoteNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
       cn.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
       cn.originalInvoiceNumber.toLowerCase().includes(searchQuery.toLowerCase())));
  }, [creditNotes, tenant.id, searchQuery]);

  const tenantPurchaseReturns = useMemo(() => {
    return purchaseReturns.filter(pr => pr.tenantId === tenant.id && 
      (selectedWarehouseFilter === 'all' || pr.warehouseId === selectedWarehouseFilter) &&
      (searchQuery === '' || 
       pr.debitNoteNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
       pr.supplierName.toLowerCase().includes(searchQuery.toLowerCase())));
  }, [purchaseReturns, tenant.id, selectedWarehouseFilter, searchQuery]);

  const tenantDamageLogs = useMemo(() => {
    return damageLogs.filter(d => d.tenantId === tenant.id &&
      (selectedWarehouseFilter === 'all' || d.warehouseId === selectedWarehouseFilter) &&
      (searchQuery === '' || 
       d.damageVoucherNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
       d.warehouseName.toLowerCase().includes(searchQuery.toLowerCase())));
  }, [damageLogs, tenant.id, selectedWarehouseFilter, searchQuery]);

  const tenantAudits = useMemo(() => {
    return stockCountAudits.filter(a => a.tenantId === tenant.id &&
      (selectedWarehouseFilter === 'all' || a.warehouseId === selectedWarehouseFilter) &&
      (searchQuery === '' || 
       a.auditNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
       a.title.toLowerCase().includes(searchQuery.toLowerCase())));
  }, [stockCountAudits, tenant.id, selectedWarehouseFilter, searchQuery]);

  // Overall KPI aggregates
  const totalSalesReturnAmount = tenantCreditNotes.reduce((acc, c) => acc + c.totalRefundAmount, 0);
  const totalPurchaseReturnAmount = tenantPurchaseReturns.reduce((acc, p) => acc + p.totalRefundAmount, 0);
  const totalDamageLossAmount = tenantDamageLogs.reduce((acc, d) => acc + d.totalLossAmount, 0);
  const totalAuditsCount = tenantAudits.length;

  // =========================================================================
  // STATE & LOGIC: CREATE SALES RETURN (CREDIT NOTE / RMA)
  // =========================================================================
  const [srInvoiceQuery, setSrInvoiceQuery] = useState('');
  const [srSelectedInvoice, setSrSelectedInvoice] = useState<Sale | null>(null);
  const [srReturnItems, setSrReturnItems] = useState<(CreditNoteItem & { maxQty: number })[]>([]);
  const [srReason, setSrReason] = useState('পণ্য পরিবর্তন বা বাতিল (Return/Exchange)');
  const [srRefundMethod, setSrRefundMethod] = useState<'cash' | 'adjust_due' | 'wallet'>('cash');

  const handleSelectSrInvoice = (sale: Sale) => {
    setSrSelectedInvoice(sale);
    setSrReturnItems(
      sale.items.map(it => ({
        productId: it.productId,
        productName: it.productName,
        quantity: 1,
        maxQty: it.quantity,
        unitPrice: it.price,
        subtotal: it.price,
        condition: 'good',
      }))
    );
  };

  const handleSrQtyChange = (idx: number, qty: number) => {
    setSrReturnItems(prev => prev.map((item, i) => {
      if (i === idx) {
        const safeQty = Math.max(0, Math.min(qty, item.maxQty));
        return {
          ...item,
          quantity: safeQty,
          subtotal: safeQty * item.unitPrice,
        };
      }
      return item;
    }));
  };

  const handleSrConditionChange = (idx: number, condition: 'good' | 'damaged') => {
    setSrReturnItems(prev => prev.map((item, i) => i === idx ? { ...item, condition } : item));
  };

  const srTotalRefund = srReturnItems.reduce((acc, it) => acc + it.subtotal, 0);

  const handleSubmitSalesReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!srSelectedInvoice || srTotalRefund <= 0) return;

    const activeItems = srReturnItems.filter(it => it.quantity > 0);
    if (activeItems.length === 0) return;

    const restockItems: { productId: string; quantity: number }[] = [];
    const damagedItems: { productId: string; quantity: number; reason: DamageReason }[] = [];

    activeItems.forEach(it => {
      if (it.condition === 'good') {
        restockItems.push({ productId: it.productId, quantity: it.quantity });
      } else {
        damagedItems.push({ productId: it.productId, quantity: it.quantity, reason: 'storage_spoilage' });
      }
    });

    const newCreditNote: Omit<CreditNote, 'id'> = {
      creditNoteNumber: `CN-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(creditNotes.length + 1).padStart(3, '0')}`,
      tenantId: tenant.id,
      originalInvoiceNumber: srSelectedInvoice.invoiceNumber || srSelectedInvoice.id,
      customerId: srSelectedInvoice.customerId,
      customerName: srSelectedInvoice.customerName || 'সাধারন ক্রেতা (Walk-in)',
      items: activeItems,
      totalRefundAmount: srTotalRefund,
      reason: srReason,
      refundMethod: srRefundMethod,
      createdAt: new Date().toLocaleString('en-GB'),
    };

    onSaveCreditNote(newCreditNote, restockItems, damagedItems);
    setIsCreateSalesReturnOpen(false);
    setSrSelectedInvoice(null);
    setSrReturnItems([]);
  };

  // =========================================================================
  // STATE & LOGIC: CREATE PURCHASE RETURN (DEBIT NOTE)
  // =========================================================================
  const [prSupplierId, setPrSupplierId] = useState<string>(suppliers[0]?.id || '');
  const [prWarehouseId, setPrWarehouseId] = useState<string>(warehouses[0]?.id || '');
  const [prOriginalPo, setPrOriginalPo] = useState('');
  const [prReason, setPrReason] = useState('স্বল্প মেয়াদ ও প্যাকেজিং নষ্ট থাকার কারণে ফেরত');
  const [prSettlementMethod, setPrSettlementMethod] = useState<'deduct_from_due' | 'cash_refund' | 'bank_transfer'>('deduct_from_due');
  const [prItems, setPrItems] = useState<PurchaseReturnItem[]>([]);
  const [prSelectedProductId, setPrSelectedProductId] = useState<string>(products[0]?.id || '');
  const [prItemQty, setPrItemQty] = useState<number>(1);
  const [prItemRate, setPrItemRate] = useState<number>(products[0]?.costPrice || 0);
  const [prItemReason, setPrItemReason] = useState<'expired' | 'damaged' | 'wrong_item' | 'quality_defect' | 'excess_delivery'>('damaged');
  const [prBatchNumber, setPrBatchNumber] = useState('');

  const handleAddPrItem = () => {
    const prod = products.find(p => p.id === prSelectedProductId);
    if (!prod || prItemQty <= 0) return;

    const newItem: PurchaseReturnItem = {
      productId: prod.id,
      productName: prod.name,
      sku: prod.sku,
      quantity: prItemQty,
      unitPrice: prItemRate > 0 ? prItemRate : prod.costPrice,
      subtotal: prItemQty * (prItemRate > 0 ? prItemRate : prod.costPrice),
      batchNumber: prBatchNumber || prod.batchNumber || 'BATCH-RTN',
      reason: prItemReason,
    };

    setPrItems(prev => [...prev, newItem]);
    setPrItemQty(1);
    setPrBatchNumber('');
  };

  const handleRemovePrItem = (index: number) => {
    setPrItems(prev => prev.filter((_, i) => i !== index));
  };

  const prTotalRefund = prItems.reduce((acc, it) => acc + it.subtotal, 0);

  const handleSubmitPurchaseReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (prItems.length === 0 || !prSupplierId) return;

    const supp = suppliers.find(s => s.id === prSupplierId);
    const wh = warehouses.find(w => w.id === prWarehouseId);

    const newPr: Omit<PurchaseReturn, 'id'> = {
      debitNoteNumber: `PR-${new Date().getFullYear()}-${String(purchaseReturns.length + 1).padStart(3, '0')}`,
      tenantId: tenant.id,
      supplierId: prSupplierId,
      supplierName: supp?.name || 'Square Pharmaceuticals Ltd.',
      supplierPhone: supp?.phone,
      originalPoNumber: prOriginalPo || `PO-${new Date().getFullYear()}-001`,
      warehouseId: prWarehouseId,
      warehouseName: wh?.name || 'প্রধান গোডাউন',
      items: prItems,
      totalRefundAmount: prTotalRefund,
      settlementMethod: prSettlementMethod,
      reason: prReason,
      status: 'approved',
      dispatchDate: new Date().toISOString().split('T')[0],
      returnedBy: tenant.ownerName || 'Store Manager',
      createdAt: new Date().toLocaleString('en-GB'),
    };

    onSavePurchaseReturn(newPr);
    setIsCreatePurchaseReturnOpen(false);
    setPrItems([]);
  };

  // =========================================================================
  // STATE & LOGIC: CREATE DAMAGE & WASTAGE VOUCHER
  // =========================================================================
  const [dmgWarehouseId, setDmgWarehouseId] = useState<string>(warehouses[0]?.id || '');
  const [dmgReportedBy, setDmgReportedBy] = useState(tenant.ownerName || 'Branch In-charge');
  const [dmgDisposalMethod, setDmgDisposalMethod] = useState<'discarded' | 'recycled' | 'returned_for_scrap' | 'quarantine'>('discarded');
  const [dmgNotes, setDmgNotes] = useState('সরকারি নীতিমালা ও ড্রাগ লাইসেন্স প্রটোকল অনুযায়ী বিনষ্ট করা হয়েছে।');
  const [dmgItems, setDmgItems] = useState<DamageLogItem[]>([]);
  const [dmgSelectedProductId, setDmgSelectedProductId] = useState<string>(products[0]?.id || '');
  const [dmgQty, setDmgQty] = useState<number>(1);
  const [dmgReason, setDmgReason] = useState<DamageReason>('expired');
  const [dmgBatchNo, setDmgBatchNo] = useState('');

  const handleAddDmgItem = () => {
    const prod = products.find(p => p.id === dmgSelectedProductId);
    if (!prod || dmgQty <= 0) return;

    const newItem: DamageLogItem = {
      productId: prod.id,
      productName: prod.name,
      sku: prod.sku,
      quantity: dmgQty,
      unitPrice: prod.costPrice,
      lossAmount: dmgQty * prod.costPrice,
      batchNumber: dmgBatchNo || prod.batchNumber || 'DMG-LOT',
      expiryDate: prod.expiryDate,
      reason: dmgReason,
    };

    setDmgItems(prev => [...prev, newItem]);
    setDmgQty(1);
    setDmgBatchNo('');
  };

  const handleRemoveDmgItem = (idx: number) => {
    setDmgItems(prev => prev.filter((_, i) => i !== idx));
  };

  const dmgTotalLoss = dmgItems.reduce((acc, it) => acc + it.lossAmount, 0);

  const handleSubmitDamageLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (dmgItems.length === 0) return;

    const wh = warehouses.find(w => w.id === dmgWarehouseId);

    const newDmg: Omit<DamageLog, 'id'> = {
      damageVoucherNumber: `DMG-${new Date().getFullYear()}-${String(damageLogs.length + 1).padStart(3, '0')}`,
      tenantId: tenant.id,
      warehouseId: dmgWarehouseId,
      warehouseName: wh?.name || 'ধানমন্ডি শাখা',
      date: new Date().toISOString().split('T')[0],
      items: dmgItems,
      totalLossAmount: dmgTotalLoss,
      reportedBy: dmgReportedBy,
      approvedBy: tenant.ownerName || 'Executive Admin',
      disposalMethod: dmgDisposalMethod,
      notes: dmgNotes,
      status: 'approved_written_off',
      createdAt: new Date().toLocaleString('en-GB'),
    };

    onSaveDamageLog(newDmg);
    setIsCreateDamageLogOpen(false);
    setDmgItems([]);
  };

  // =========================================================================
  // STATE & LOGIC: STOCK COUNT AUDIT (COUNT STOCK)
  // =========================================================================
  const [scWarehouseId, setScWarehouseId] = useState<string>(warehouses[0]?.id || '');
  const [scTitle, setScTitle] = useState('ত্রৈমাসিক ইনভেন্টরি ফিজিক্যাল অডিট ২০২৬');
  const [scCategoryFilter, setScCategoryFilter] = useState('All');
  const [scAuditedBy, setScAuditedBy] = useState(tenant.ownerName || 'Lead Auditor');
  const [scNotes, setScNotes] = useState('গোডাউনের সকল র‍্যাক ও তাক শারীরিকভাবে গণনা করা হয়েছে।');

  const handleCreateNewAudit = (e: React.FormEvent) => {
    e.preventDefault();
    const wh = warehouses.find(w => w.id === scWarehouseId);

    // Eligible products
    const eligibleProds = products.filter(p => 
      p.tenantId === tenant.id && 
      (scCategoryFilter === 'All' || p.category === scCategoryFilter)
    );

    const auditItems: StockCountItem[] = eligibleProds.map(p => ({
      productId: p.id,
      productName: p.name,
      sku: p.sku,
      category: p.category,
      unit: p.unit || 'pcs',
      systemStock: p.stock,
      countedStock: p.stock, // Default initially matched
      varianceQty: 0,
      costPrice: p.costPrice,
      varianceAmount: 0,
      status: 'matched',
      notes: '',
    }));

    const newAudit: Omit<StockCountAudit, 'id'> = {
      auditNumber: `AUD-${new Date().getFullYear()}-${String(stockCountAudits.length + 1).padStart(3, '0')}`,
      tenantId: tenant.id,
      warehouseId: scWarehouseId,
      warehouseName: wh?.name || 'মিরপুর সেন্ট্রাল গোডাউন',
      title: scTitle,
      auditDate: new Date().toISOString().split('T')[0],
      categoryFilter: scCategoryFilter,
      items: auditItems,
      totalSystemItems: auditItems.length,
      totalCountedItems: auditItems.length,
      totalSurplusQty: 0,
      totalShortageQty: 0,
      totalFinancialVariance: 0,
      auditedBy: scAuditedBy,
      status: 'in_progress',
      notes: scNotes,
      createdAt: new Date().toLocaleString('en-GB'),
    };

    onCreateStockCountAudit(newAudit);
    setIsCreateStockCountOpen(false);
  };

  // Barcode / SKU quick-increment in live audit workspace
  const [auditBarcodeScanInput, setAuditBarcodeScanInput] = useState('');

  const handleAuditBarcodeScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAuditWorkspace || !auditBarcodeScanInput.trim()) return;

    const term = auditBarcodeScanInput.trim().toLowerCase();
    const itemIndex = activeAuditWorkspace.items.findIndex(
      it => it.sku.toLowerCase() === term || it.productName.toLowerCase().includes(term)
    );

    if (itemIndex >= 0) {
      playBeep();
      const updatedItems = [...activeAuditWorkspace.items];
      const target = updatedItems[itemIndex];
      const newCount = target.countedStock + 1;
      const newVariance = newCount - target.systemStock;

      updatedItems[itemIndex] = {
        ...target,
        countedStock: newCount,
        varianceQty: newVariance,
        varianceAmount: newVariance * target.costPrice,
        status: newVariance === 0 ? 'matched' : newVariance > 0 ? 'surplus' : 'shortage',
      };

      const updatedAudit: StockCountAudit = {
        ...activeAuditWorkspace,
        items: updatedItems,
        totalSurplusQty: updatedItems.filter(it => it.varianceQty > 0).reduce((acc, it) => acc + it.varianceQty, 0),
        totalShortageQty: Math.abs(updatedItems.filter(it => it.varianceQty < 0).reduce((acc, it) => acc + it.varianceQty, 0)),
        totalFinancialVariance: updatedItems.reduce((acc, it) => acc + it.varianceAmount, 0),
      };

      setActiveAuditWorkspace(updatedAudit);
      onUpdateStockCountAudit(updatedAudit);
      setAuditBarcodeScanInput('');
    } else {
      alert(`বারকোড বা SKU "${auditBarcodeScanInput}" পাওয়া যায়নি!`);
    }
  };

  const handleUpdateItemCount = (itemId: string, newCount: number) => {
    if (!activeAuditWorkspace) return;

    const updatedItems = activeAuditWorkspace.items.map(it => {
      if (it.productId === itemId) {
        const safeCount = Math.max(0, newCount);
        const variance = safeCount - it.systemStock;
        return {
          ...it,
          countedStock: safeCount,
          varianceQty: variance,
          varianceAmount: variance * it.costPrice,
          status: (variance === 0 ? 'matched' : variance > 0 ? 'surplus' : 'shortage') as 'matched' | 'surplus' | 'shortage',
        };
      }
      return it;
    });

    const updatedAudit: StockCountAudit = {
      ...activeAuditWorkspace,
      items: updatedItems,
      totalSurplusQty: updatedItems.filter(it => it.varianceQty > 0).reduce((acc, it) => acc + it.varianceQty, 0),
      totalShortageQty: Math.abs(updatedItems.filter(it => it.varianceQty < 0).reduce((acc, it) => acc + it.varianceQty, 0)),
      totalFinancialVariance: updatedItems.reduce((acc, it) => acc + it.varianceAmount, 0),
    };

    setActiveAuditWorkspace(updatedAudit);
    onUpdateStockCountAudit(updatedAudit);
  };

  const handleExecuteReconciliation = (audit: StockCountAudit) => {
    if (confirm(`আপনি কি নিশ্চিত যে "${audit.title}" এর গণনা অনুযায়ী ইনভেন্টরি স্টক সমন্বয় করতে চান? সিস্টেম স্টক স্বয়ংক্রিয়ভাবে আপডেট হবে।`)) {
      onReconcileStockCountAudit(audit.id);
      setActiveAuditWorkspace(null);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Print Stylesheet */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-voucher-root, #print-voucher-root * {
            visibility: visible;
          }
          #print-voucher-root {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Top Main Header Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 bg-gradient-to-tr from-purple-700 to-indigo-600 text-white rounded-2xl shadow-xs">
              <RotateCcw className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                রিটার্ন, ড্যামেজ ও ফিজিক্যাল স্টক অডিট হাব (Phase 18)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                RMA বিক্রয় ফেরত, ভেন্ডর ডেবিট নোট, মেয়াদোত্তীর্ণ/ক্ষতিগ্রস্ত পণ্যের ড্যামেজ রেজিস্টার ও সাইকেল কাউন্ট অডিট
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Launchers */}
        <div className="flex flex-wrap items-center gap-2">
          {activeTab === 'sales_returns' && (
            <button
              onClick={() => setIsCreateSalesReturnOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-2xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              নতুন বিক্রয় ফেরত (Credit Note)
            </button>
          )}

          {activeTab === 'purchase_returns' && (
            <button
              onClick={() => setIsCreatePurchaseReturnOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-2xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              নতুন ক্রয় ফেরত (Debit Note)
            </button>
          )}

          {activeTab === 'damages' && (
            <button
              onClick={() => setIsCreateDamageLogOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-2xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              নতুন ড্যামেজ ভাউচার এন্ট্রি
            </button>
          )}

          {activeTab === 'stock_count' && (
            <button
              onClick={() => setIsCreateStockCountOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              নতুন সাইকেল কাউন্ট অডিট সেশন
            </button>
          )}
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider block">বিক্রয় ফেরত (Sales RMA)</span>
              <div className="text-xl font-black text-slate-900 mt-1">
                {tenant.currency}{totalSalesReturnAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
              <RotateCcw className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[10px] text-slate-400 mt-2 font-medium">
            মোট ভাউচার: {tenantCreditNotes.length} টি
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">ক্রয় ফেরত (Debit Notes)</span>
              <div className="text-xl font-black text-slate-900 mt-1">
                {tenant.currency}{totalPurchaseReturnAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="p-3 bg-amber-50 text-amber-700 rounded-2xl">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[10px] text-slate-400 mt-2 font-medium">
            সাপ্লায়ার রিটার্ন: {tenantPurchaseReturns.length} টি
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-purple-100 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider block">ড্যামেজ ও নষ্ট ক্ষতি</span>
              <div className="text-xl font-black text-slate-900 mt-1">
                {tenant.currency}{totalDamageLossAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="p-3 bg-purple-50 text-purple-700 rounded-2xl">
              <AlertOctagon className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[10px] text-slate-400 mt-2 font-medium">
            নষ্ট ভাউচার: {tenantDamageLogs.length} টি
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-indigo-100 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider block">ফিজিক্যাল স্টক অডিট</span>
              <div className="text-xl font-black text-slate-900 mt-1">
                {totalAuditsCount} টি সেশন
              </div>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-700 rounded-2xl">
              <ClipboardCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[10px] text-slate-400 mt-2 font-medium">
            রিকনসিল্ড: {tenantAudits.filter(a => a.status === 'reconciled').length} | চলমান: {tenantAudits.filter(a => a.status === 'in_progress').length}
          </div>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-2 shadow-xs flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => { setActiveTab('sales_returns'); setActiveAuditWorkspace(null); }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'sales_returns'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            বিক্রয় ফেরত (Sales RMA & Credit Notes)
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'sales_returns' ? 'bg-rose-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {tenantCreditNotes.length}
            </span>
          </button>

          <button
            onClick={() => { setActiveTab('purchase_returns'); setActiveAuditWorkspace(null); }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'purchase_returns'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            ক্রয় ফেরত ও ডেবিট নোট (Purchases Return)
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'purchase_returns' ? 'bg-amber-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {tenantPurchaseReturns.length}
            </span>
          </button>

          <button
            onClick={() => { setActiveTab('damages'); setActiveAuditWorkspace(null); }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'damages'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <AlertOctagon className="w-4 h-4" />
            ড্যামেজ ও অপচয় লগ (Damages Register)
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'damages' ? 'bg-purple-800 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {tenantDamageLogs.length}
            </span>
          </button>

          <button
            onClick={() => { setActiveTab('stock_count'); }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'stock_count'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ClipboardCheck className="w-4 h-4" />
            ফিজিক্যাল স্টক কাউন্ট / অডিট (Count Stock)
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'stock_count' ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {tenantAudits.length}
            </span>
          </button>
        </div>

        {/* Global Search and Warehouse Filter */}
        <div className="flex items-center gap-2 min-w-[260px]">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="সার্চ ভাউচার নং, গ্রাহক, সাপ্লায়ার..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-100 rounded-xl border border-transparent focus:border-purple-600 focus:bg-white outline-none transition"
            />
          </div>

          {(activeTab === 'purchase_returns' || activeTab === 'damages' || activeTab === 'stock_count') && (
            <select
              value={selectedWarehouseFilter}
              onChange={e => setSelectedWarehouseFilter(e.target.value)}
              className="py-1.5 px-2.5 text-xs bg-slate-100 rounded-xl border border-slate-200 font-medium text-slate-700 outline-none"
            >
              <option value="all">সকল ওয়্যারহাউস</option>
              {warehouses.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* =================================================================== */}
      {/* TAB 1: SALES RETURN & CREDIT NOTES                                  */}
      {/* =================================================================== */}
      {activeTab === 'sales_returns' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">বিক্রয় ফেরত ও ক্রেডিট নোট তালিকা</h3>
              <p className="text-xs text-slate-500">গ্রাহক পণ্য ফেরত দিলে স্বয়ংক্রিয় স্টক রিস্টকিং বা ড্যামেজে স্থানান্তর</p>
            </div>
            <span className="text-xs text-slate-400">মোট প্রাপ্ত: {tenantCreditNotes.length} টি</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="py-3 px-4">ক্রেডিট নোট নং</th>
                  <th className="py-3 px-4">মূল ইনভয়েস #</th>
                  <th className="py-3 px-4">গ্রাহক</th>
                  <th className="py-3 px-4">ফেরতের কারণ</th>
                  <th className="py-3 px-4">রিফান্ড মাধ্যম</th>
                  <th className="py-3 px-4 text-center">ফেরত আইটেম সংখ্যা</th>
                  <th className="py-3 px-4 text-right">মোট রিফান্ড টাকা</th>
                  <th className="py-3 px-4 text-center">তারিখ</th>
                  <th className="py-3 px-4 text-center">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tenantCreditNotes.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      <RotateCcw className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                      <p className="font-semibold text-slate-600">কোনো বিক্রয় ফেরত রেকর্ড পাওয়া যায়নি</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">নতুন বিক্রয় ফেরত যোগ করতে উপরের বাটনে ক্লিক করুন</p>
                    </td>
                  </tr>
                ) : (
                  tenantCreditNotes.map(cn => (
                    <tr key={cn.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-rose-700">
                        {cn.creditNoteNumber}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-700">
                        #{cn.originalInvoiceNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{cn.customerName}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-[200px] truncate" title={cn.reason}>
                        {cn.reason}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          cn.refundMethod === 'cash' ? 'bg-emerald-100 text-emerald-800' :
                          cn.refundMethod === 'adjust_due' ? 'bg-blue-100 text-blue-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {cn.refundMethod === 'cash' ? 'ক্যাশ ফেরত' : cn.refundMethod === 'adjust_due' ? 'বকেয়া সমন্বয়' : 'ওয়ালেট'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px]">
                          {cn.items.length} টি
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-black font-mono text-rose-600 text-sm">
                        {tenant.currency}{cn.totalRefundAmount.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-[11px] text-slate-500">
                        {cn.createdAt}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => setViewingCreditNote(cn)}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition cursor-pointer"
                          title="ক্রেডিট নোট ভাউচার প্রিন্ট করুন"
                        >
                          <Printer className="w-4 h-4" />
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

      {/* =================================================================== */}
      {/* TAB 2: PURCHASE RETURNS (DEBIT NOTES)                                */}
      {/* =================================================================== */}
      {activeTab === 'purchase_returns' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">ক্রয় ফেরত ও ভেন্ডর ডেবিট নোট রেজিস্টার</h3>
              <p className="text-xs text-slate-500">কোম্পানি/সাপ্লায়ারকে ত্রুটিযুক্ত পণ্য ফেরত পাঠিয়ে বকেয়া হিসাব থেকে সমন্বয়</p>
            </div>
            <span className="text-xs text-slate-400">মোট রেকর্ড: {tenantPurchaseReturns.length} টি</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="py-3 px-4">ডেবিট নোট নং</th>
                  <th className="py-3 px-4">সাপ্লায়ার কোম্পানি</th>
                  <th className="py-3 px-4">মূল PO / ইনভয়েস</th>
                  <th className="py-3 px-4">ওয়্যারহাউস</th>
                  <th className="py-3 px-4">ফেরত কারণ</th>
                  <th className="py-3 px-4">সেটেলমেন্ট মাধ্যম</th>
                  <th className="py-3 px-4 text-right">মোট ডেবিট মূল্য</th>
                  <th className="py-3 px-4 text-center">স্ট্যাটাস</th>
                  <th className="py-3 px-4 text-center">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tenantPurchaseReturns.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      <ArrowUpRight className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                      <p className="font-semibold text-slate-600">কোনো ক্রয় ফেরত রেকর্ড পাওয়া যায়নি</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">সাপ্লায়ারকে পণ্য ফেরত দিতে নতুন ডেবিট নোট তৈরি করুন</p>
                    </td>
                  </tr>
                ) : (
                  tenantPurchaseReturns.map(pr => (
                    <tr key={pr.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-700">
                        {pr.debitNoteNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{pr.supplierName}</div>
                        {pr.supplierPhone && <div className="text-[10px] text-slate-400 font-mono">{pr.supplierPhone}</div>}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {pr.originalPoNumber || 'N/A'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        {pr.warehouseName}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-[200px] truncate" title={pr.reason}>
                        {pr.reason}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          {pr.settlementMethod === 'deduct_from_due' ? 'বকেয়া থেকে কর্তন' : 'ক্যাশ রিফান্ড'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-black font-mono text-amber-700 text-sm">
                        {tenant.currency}{pr.totalRefundAmount.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {pr.status === 'dispatched' ? 'ডিসপ্যাচড' : 'অনুমোদিত'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => setViewingPurchaseReturn(pr)}
                          className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 transition cursor-pointer"
                          title="ডেবিট নোট চালান প্রিন্ট করুন"
                        >
                          <Printer className="w-4 h-4" />
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

      {/* =================================================================== */}
      {/* TAB 3: DAMAGES & SPOILAGE LOG                                      */}
      {/* =================================================================== */}
      {activeTab === 'damages' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">ড্যামেজ, বিনষ্ট ও অপচয় ভাউচার রেজিস্টার</h3>
              <p className="text-xs text-slate-500">মেয়াদোত্তীর্ণ, ট্রানজিটে ভাঙা বা ক্ষতিগ্রস্ত পণ্যের হিসাব ও লস রাইট-অফ</p>
            </div>
            <span className="text-xs text-slate-400">মোট ক্ষতি ভাউচার: {tenantDamageLogs.length} টি</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="py-3 px-4">ড্যামেজ ভাউচার নং</th>
                  <th className="py-3 px-4">ওয়্যারহাউস</th>
                  <th className="py-3 px-4">তারিখ</th>
                  <th className="py-3 px-4">আইটেমসমূহ</th>
                  <th className="py-3 px-4">নিষ্পত্তি পদ্ধতি</th>
                  <th className="py-3 px-4 text-right">আর্থিক ক্ষতি (Loss BDT)</th>
                  <th className="py-3 px-4">অনুমোদনকারী</th>
                  <th className="py-3 px-4 text-center">স্ট্যাটাস</th>
                  <th className="py-3 px-4 text-center">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tenantDamageLogs.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      <AlertOctagon className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                      <p className="font-semibold text-slate-600">কোনো ড্যামেজ বা বিনষ্ট পণ্যের এন্ট্রি নেই</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">নষ্ট পণ্য ইনভেন্টরি থেকে বাদ দিতে নতুন ড্যামেজ ভাউচার তৈরি করুন</p>
                    </td>
                  </tr>
                ) : (
                  tenantDamageLogs.map(dmg => (
                    <tr key={dmg.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-purple-700">
                        {dmg.damageVoucherNumber}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {dmg.warehouseName}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                        {dmg.date}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          {dmg.items.map((it, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 text-[11px]">
                              <span className="font-medium text-slate-800">{it.productName}</span>
                              <span className="text-rose-600 font-bold">({it.quantity} টি)</span>
                              <span className="px-1 py-0.2 rounded text-[9px] bg-slate-100 text-slate-600">
                                {it.reason === 'expired' ? 'মেয়াদোত্তীর্ণ' : it.reason === 'broken_in_transit' ? 'ভাঙা' : 'ক্ষতিগ্রস্ত'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">
                          {dmg.disposalMethod === 'discarded' ? 'ধ্বংস/বিনষ্ট' : dmg.disposalMethod === 'quarantine' ? 'কোয়ারেন্টাইন' : 'স্ক্র্যাপ'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-black font-mono text-purple-700 text-sm">
                        {tenant.currency}{dmg.totalLossAmount.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 text-[11px]">
                        {dmg.approvedBy}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          dmg.status === 'approved_written_off' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {dmg.status === 'approved_written_off' ? 'রাইট-অফ সম্পন্ন' : 'রিভিউ বাকি'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => setViewingDamageLog(dmg)}
                          className="p-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 transition cursor-pointer"
                          title="ড্যামেজ ভাউচার প্রিন্ট করুন"
                        >
                          <Printer className="w-4 h-4" />
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

      {/* =================================================================== */}
      {/* TAB 4: PHYSICAL STOCK COUNT & AUDIT                                 */}
      {/* =================================================================== */}
      {activeTab === 'stock_count' && !activeAuditWorkspace && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">ফিজিক্যাল স্টক কাউন্ট ও সাইকেল অডিট সেশন</h3>
              <p className="text-xs text-slate-500">সফটওয়্যার স্টক বনাম বাস্তব গণনার ফারাক নির্ণয় ও ১-ক্লিকে স্বয়ংক্রিয় স্টক সমন্বয়</p>
            </div>
            <span className="text-xs text-slate-400">মোট সেশন: {tenantAudits.length} টি</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="py-3 px-4">অডিট নং</th>
                  <th className="py-3 px-4">অডিটের শিরোনাম</th>
                  <th className="py-3 px-4">ওয়্যারহাউস</th>
                  <th className="py-3 px-4">তারিখ</th>
                  <th className="py-3 px-4 text-center">মোট আইটেম</th>
                  <th className="py-3 px-4 text-center">ঘাটতি (Shortage)</th>
                  <th className="py-3 px-4 text-center">অতিরিক্ত (Surplus)</th>
                  <th className="py-3 px-4 text-right">আর্থিক ফারাক (Variance BDT)</th>
                  <th className="py-3 px-4 text-center">স্ট্যাটাস</th>
                  <th className="py-3 px-4 text-center">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tenantAudits.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-400">
                      <ClipboardCheck className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                      <p className="font-semibold text-slate-600">কোনো ফিজিক্যাল স্টক অডিট সেশন তৈরি হয়নি</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">নতুন স্টক যাচাই সেশন শুরু করতে উপরের বাটনে ক্লিক করুন</p>
                    </td>
                  </tr>
                ) : (
                  tenantAudits.map(aud => (
                    <tr key={aud.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">
                        {aud.auditNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{aud.title}</div>
                        <div className="text-[10px] text-slate-400">অডিটর: {aud.auditedBy}</div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-700">
                        {aud.warehouseName}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                        {aud.auditDate}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                        {aud.items.length} টি
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          aud.totalShortageQty > 0 ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {aud.totalShortageQty > 0 ? `-${aud.totalShortageQty} পিস` : '০'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          aud.totalSurplusQty > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {aud.totalSurplusQty > 0 ? `+${aud.totalSurplusQty} পিস` : '০'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-black text-sm">
                        <span className={aud.totalFinancialVariance < 0 ? 'text-rose-600' : aud.totalFinancialVariance > 0 ? 'text-emerald-600' : 'text-slate-700'}>
                          {tenant.currency}{aud.totalFinancialVariance.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          aud.status === 'reconciled' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {aud.status === 'reconciled' ? 'রিকনসিল্ড (সমন্বিত)' : 'চলমান (In Progress)'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setActiveAuditWorkspace(aud)}
                            className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                          >
                            <SlidersHorizontal className="w-3.5 h-3.5" />
                            {aud.status === 'reconciled' ? 'রিপোর্ট দেখুন' : 'গণনা ও মিলান'}
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

      {/* =================================================================== */}
      {/* ACTIVE AUDIT WORKSPACE (COUNTING & RECONCILIATION)                  */}
      {/* =================================================================== */}
      {activeTab === 'stock_count' && activeAuditWorkspace && (
        <div className="bg-white rounded-3xl border border-indigo-200 shadow-md p-5 space-y-4">
          {/* Header of Active Audit */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveAuditWorkspace(null)}
                  className="px-2 py-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  ← তালিকা ফিরে যান
                </button>
                <span className="font-mono text-xs font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                  {activeAuditWorkspace.auditNumber}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeAuditWorkspace.status === 'reconciled' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {activeAuditWorkspace.status === 'reconciled' ? 'সমন্বয় সম্পন্ন' : 'লাইভ গণনা চলমান'}
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900 mt-1">{activeAuditWorkspace.title}</h3>
              <p className="text-xs text-slate-500">
                ওয়্যারহাউস: <strong>{activeAuditWorkspace.warehouseName}</strong> • অডিটর: {activeAuditWorkspace.auditedBy} • তারিখ: {activeAuditWorkspace.auditDate}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => window.print()}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                ফিজিক্যাল কাউন্ট শীট প্রিন্ট
              </button>

              {activeAuditWorkspace.status !== 'reconciled' && (
                <button
                  onClick={() => handleExecuteReconciliation(activeAuditWorkspace)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  স্টক সমন্বয় নিশ্চিত করুন (Auto-Reconcile)
                </button>
              )}
            </div>
          </div>

          {/* Barcode Quick Count Scanner & Search */}
          {activeAuditWorkspace.status !== 'reconciled' && (
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-3.5 rounded-2xl border border-indigo-100 flex flex-col sm:flex-row items-center gap-3">
              <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs whitespace-nowrap">
                <Barcode className="w-5 h-5 text-indigo-600" />
                বারকোড স্ক্যান মোড (Auto +1 Increment):
              </div>
              <form onSubmit={handleAuditBarcodeScan} className="flex-1 flex items-center gap-2 w-full">
                <input
                  type="text"
                  value={auditBarcodeScanInput}
                  onChange={e => setAuditBarcodeScanInput(e.target.value)}
                  placeholder="বারকোড স্ক্যান করুন বা SKU লিখে এন্টার চাপুন..."
                  className="flex-1 px-3 py-1.5 text-xs bg-white rounded-xl border border-indigo-200 outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  গণনা যোগ করুন
                </button>
              </form>
            </div>
          )}

          {/* Audit Items Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">পণ্য ও SKU</th>
                  <th className="py-2.5 px-3">ক্যাটাগরি</th>
                  <th className="py-2.5 px-3 text-center">সিস্টেম স্টক</th>
                  <th className="py-2.5 px-3 text-center">বাস্তব গণনা (Counted)</th>
                  <th className="py-2.5 px-3 text-center">ফারাক (Variance)</th>
                  <th className="py-2.5 px-3 text-right">ক্রয়মূল্য</th>
                  <th className="py-2.5 px-3 text-right">ফারাক মূল্য (BDT)</th>
                  <th className="py-2.5 px-3 text-center">স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeAuditWorkspace.items.map(it => (
                  <tr key={it.productId} className={`transition ${
                    it.status === 'shortage' ? 'bg-rose-50/40' : it.status === 'surplus' ? 'bg-emerald-50/40' : 'hover:bg-slate-50'
                  }`}>
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900">{it.productName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">SKU: {it.sku}</div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 font-medium">
                      {it.category}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-700">
                      {it.systemStock} {it.unit}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {activeAuditWorkspace.status === 'reconciled' ? (
                        <span className="font-mono font-bold text-slate-900">{it.countedStock} {it.unit}</span>
                      ) : (
                        <input
                          type="number"
                          min={0}
                          value={it.countedStock}
                          onChange={e => handleUpdateItemCount(it.productId, Number(e.target.value))}
                          className="w-20 px-2 py-1 text-center font-mono font-bold text-xs bg-white border border-slate-300 rounded-lg outline-none focus:border-indigo-600"
                        />
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold">
                      <span className={it.varianceQty < 0 ? 'text-rose-600' : it.varianceQty > 0 ? 'text-emerald-600' : 'text-slate-400'}>
                        {it.varianceQty > 0 ? `+${it.varianceQty}` : it.varianceQty}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                      {tenant.currency}{it.costPrice.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold">
                      <span className={it.varianceAmount < 0 ? 'text-rose-600' : it.varianceAmount > 0 ? 'text-emerald-600' : 'text-slate-400'}>
                        {tenant.currency}{it.varianceAmount.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        it.status === 'matched' ? 'bg-slate-100 text-slate-600' :
                        it.status === 'surplus' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-rose-100 text-rose-800'
                      }`}>
                        {it.status === 'matched' ? 'মিলেছে' : it.status === 'surplus' ? 'অতিরিক্ত (+)' : 'ঘাটতি (-)'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 1: CREATE SALES RETURN (CREDIT NOTE / RMA)                    */}
      {/* =================================================================== */}
      {isCreateSalesReturnOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-rose-100 overflow-hidden animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            <div className="bg-rose-700 text-white px-5 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">নতুন বিক্রয় ফেরত ভাউচার (Sales RMA / Credit Note)</h3>
                <p className="text-xs text-rose-200">মূল ইনভয়েস সার্চ করে ফেরত আইটেম ও রিফান্ড মাধ্যম নির্বাচন করুন</p>
              </div>
              <button onClick={() => setIsCreateSalesReturnOpen(false)} className="text-rose-200 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmitSalesReturn} className="p-5 space-y-4 text-xs overflow-y-auto flex-1">
              {/* Invoice Search Bar */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">১. মূল বিক্রয় ইনভয়েস নির্বাচন করুন: *</label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={srInvoiceQuery}
                    onChange={e => setSrInvoiceQuery(e.target.value)}
                    placeholder="ইনভয়েস # বা গ্রাহকের নাম দিয়ে সার্চ..."
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>

                {/* Candidate Invoices List */}
                <div className="mt-2 max-h-32 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100">
                  {sales
                    .filter(s => s.tenantId === tenant.id && 
                      (srInvoiceQuery === '' || 
                       (s.invoiceNumber && s.invoiceNumber.toLowerCase().includes(srInvoiceQuery.toLowerCase())) ||
                       s.customerName.toLowerCase().includes(srInvoiceQuery.toLowerCase())))
                    .slice(0, 5)
                    .map(sale => (
                      <div
                        key={sale.id}
                        onClick={() => handleSelectSrInvoice(sale)}
                        className={`p-2.5 flex items-center justify-between cursor-pointer transition ${
                          srSelectedInvoice?.id === sale.id ? 'bg-rose-50 border-l-4 border-rose-600' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div>
                          <strong className="font-mono text-slate-900 block">#{sale.invoiceNumber || sale.id}</strong>
                          <span className="text-[11px] text-slate-500">{sale.customerName} • {sale.items.length} আইটেম</span>
                        </div>
                        <span className="font-bold font-mono text-slate-900">{tenant.currency}{sale.totalAmount}</span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Selected Invoice Items for Return */}
              {srSelectedInvoice && (
                <div className="space-y-3 pt-2 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">২. ফেরতকৃত পণ্যের পরিমাণ ও কন্ডিশন:</span>
                    <span className="text-[11px] text-slate-500 font-mono">Invoice: #{srSelectedInvoice.invoiceNumber}</span>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="p-2">পণ্য</th>
                          <th className="p-2 text-center">বিক্রীত</th>
                          <th className="p-2 text-center">ফেরত পরিমাণ</th>
                          <th className="p-2 text-center">পণ্যের অবস্থা</th>
                          <th className="p-2 text-right">রিফান্ড</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {srReturnItems.map((item, idx) => (
                          <tr key={item.productId}>
                            <td className="p-2 font-medium text-slate-800">{item.productName}</td>
                            <td className="p-2 text-center text-slate-500">{item.maxQty}</td>
                            <td className="p-2 text-center">
                              <input
                                type="number"
                                min={0}
                                max={item.maxQty}
                                value={item.quantity}
                                onChange={e => handleSrQtyChange(idx, Number(e.target.value))}
                                className="w-16 px-2 py-0.5 border border-slate-200 rounded text-center font-bold"
                              />
                            </td>
                            <td className="p-2 text-center">
                              <select
                                value={item.condition}
                                onChange={e => handleSrConditionChange(idx, e.target.value as 'good' | 'damaged')}
                                className="text-[11px] p-1 border border-slate-200 rounded"
                              >
                                <option value="good">ভালো (Restock)</option>
                                <option value="damaged">নষ্ট (Damaged)</option>
                              </select>
                            </td>
                            <td className="p-2 text-right font-mono font-bold text-rose-700">
                              {tenant.currency}{item.subtotal.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Settlement method and reason */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">রিফান্ড মাধ্যম: *</label>
                      <select
                        value={srRefundMethod}
                        onChange={e => setSrRefundMethod(e.target.value as 'cash' | 'adjust_due' | 'wallet')}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                      >
                        <option value="cash">নগদ টাকা ফেরত (Cash Refund)</option>
                        <option value="adjust_due">বকেয়া হিসাব থেকে সমন্বয় (Deduct Due)</option>
                        <option value="wallet">গ্রাহক ওয়ালেটে ক্রেডিট যোগ (Store Credit)</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">মোট রিফান্ড টাকা:</label>
                      <div className="p-2 bg-rose-50 border border-rose-200 rounded-xl font-mono font-black text-rose-700 text-base">
                        {tenant.currency}{srTotalRefund.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">ফেরতের কারণ / মন্তব্য:</label>
                    <input
                      type="text"
                      value={srReason}
                      onChange={e => setSrReason(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                      placeholder="কারণ উল্লেখ করুন..."
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCreateSalesReturnOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={!srSelectedInvoice || srTotalRefund <= 0}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  ক্রেডিট নোট নিশ্চিত করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 2: CREATE PURCHASE RETURN (DEBIT NOTE)                        */}
      {/* =================================================================== */}
      {isCreatePurchaseReturnOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-amber-100 overflow-hidden animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            <div className="bg-amber-600 text-white px-5 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">নতুন ক্রয় ফেরত ও ডেবিট নোট (Purchases Return)</h3>
                <p className="text-xs text-amber-100">সাপ্লায়ারকে ত্রুটিযুক্ত পণ্য ফেরত পাঠানো ও ভেন্ডর লেজার সমন্বয়</p>
              </div>
              <button onClick={() => setIsCreatePurchaseReturnOpen(false)} className="text-amber-100 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmitPurchaseReturn} className="p-5 space-y-4 text-xs overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">সাপ্লায়ার / কোম্পানি: *</label>
                  <select
                    value={prSupplierId}
                    onChange={e => setPrSupplierId(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.companyName})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">ওয়্যারহাউস / গোডাউন: *</label>
                  <select
                    value={prWarehouseId}
                    onChange={e => setPrWarehouseId(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    {warehouses.map(w => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Add items to return */}
              <div className="bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200 space-y-3">
                <span className="font-bold text-amber-900 block">ফেরতযোগ্য পণ্য যোগ করুন:</span>
                <div className="grid grid-cols-4 gap-2">
                  <div className="col-span-2">
                    <label className="text-[10px] text-slate-500 block mb-0.5">পণ্য নির্বাচন:</label>
                    <select
                      value={prSelectedProductId}
                      onChange={e => {
                        setPrSelectedProductId(e.target.value);
                        const p = products.find(x => x.id === e.target.value);
                        if (p) setPrItemRate(p.costPrice);
                      }}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    >
                      {products.filter(p => p.tenantId === tenant.id).map(p => (
                        <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">পরিমাণ:</label>
                    <input
                      type="number"
                      min={1}
                      value={prItemQty}
                      onChange={e => setPrItemQty(Number(e.target.value))}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs text-center font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">ফেরত কারণ:</label>
                    <select
                      value={prItemReason}
                      onChange={e => setPrItemReason(e.target.value as typeof prItemReason)}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-[10px]"
                    >
                      <option value="damaged">নষ্ট/ভাঙা</option>
                      <option value="expired">মেয়াদোত্তীর্ণ</option>
                      <option value="wrong_item">ভুল পণ্য</option>
                      <option value="quality_defect">কোয়ালিটি সমস্যা</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500">ব্যাচ/লট নং:</span>
                    <input
                      type="text"
                      value={prBatchNumber}
                      onChange={e => setPrBatchNumber(e.target.value)}
                      placeholder="e.g. SQ-LOT-24"
                      className="px-2 py-1 text-[11px] bg-white border border-slate-200 rounded-lg font-mono"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddPrItem}
                    className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs transition cursor-pointer"
                  >
                    + আইটেম যোগ করুন
                  </button>
                </div>
              </div>

              {/* Items List */}
              {prItems.length > 0 && (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-2">পণ্য</th>
                        <th className="p-2 text-center">পরিমাণ</th>
                        <th className="p-2 text-right">ক্রয় রেট</th>
                        <th className="p-2 text-right">মোট</th>
                        <th className="p-2 text-center">মুছুন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {prItems.map((item, idx) => (
                        <tr key={idx}>
                          <td className="p-2 font-medium">{item.productName} ({item.batchNumber})</td>
                          <td className="p-2 text-center font-bold">{item.quantity}</td>
                          <td className="p-2 text-right font-mono">{tenant.currency}{item.unitPrice.toFixed(2)}</td>
                          <td className="p-2 text-right font-mono font-bold text-amber-700">{tenant.currency}{item.subtotal.toFixed(2)}</td>
                          <td className="p-2 text-center">
                            <button type="button" onClick={() => handleRemovePrItem(idx)} className="text-rose-600 hover:text-rose-800">
                              <Trash2 className="w-3.5 h-3.5 mx-auto" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">সেটেলমেন্ট পদ্ধতি:</label>
                  <select
                    value={prSettlementMethod}
                    onChange={e => setPrSettlementMethod(e.target.value as 'deduct_from_due' | 'cash_refund')}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="deduct_from_due">সাপ্লায়ার বকেয়া থেকে কর্তন (Deduct from Payable)</option>
                    <option value="cash_refund">ক্যাশ/ব্যাংক রিফান্ড গ্রহণ (Cash Refund)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">মোট ডেবিট ভ্যালু:</label>
                  <div className="p-2 bg-amber-50 border border-amber-200 rounded-xl font-mono font-black text-amber-800 text-base">
                    {tenant.currency}{prTotalRefund.toFixed(2)}
                  </div>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">মন্তব্য / গেটপাস নোট:</label>
                <input
                  type="text"
                  value={prReason}
                  onChange={e => setPrReason(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCreatePurchaseReturnOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={prItems.length === 0}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  ডেবিট নোট অনুমোদন করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 3: CREATE DAMAGE LOG VOUCHER                                  */}
      {/* =================================================================== */}
      {isCreateDamageLogOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-purple-100 overflow-hidden animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            <div className="bg-purple-800 text-white px-5 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">নতুন ড্যামেজ ভাউচার এন্ট্রি (Damage & Spoilage Log)</h3>
                <p className="text-xs text-purple-200">মেয়াদোত্তীর্ণ বা ক্ষতিগ্রস্ত পণ্য ইনভেন্টরি থেকে অপসারন ও লস রাইট-অফ</p>
              </div>
              <button onClick={() => setIsCreateDamageLogOpen(false)} className="text-purple-200 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmitDamageLog} className="p-5 space-y-4 text-xs overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">ওয়্যারহাউস: *</label>
                  <select
                    value={dmgWarehouseId}
                    onChange={e => setDmgWarehouseId(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    {warehouses.map(w => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">নিষ্পত্তি পদ্ধতি (Disposal Method):</label>
                  <select
                    value={dmgDisposalMethod}
                    onChange={e => setDmgDisposalMethod(e.target.value as typeof dmgDisposalMethod)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="discarded">সম্পূর্ণ বিনষ্ট/ধ্বংস (Discarded)</option>
                    <option value="quarantine">কোয়ারেন্টাইন আইসোলেশন (Quarantine)</option>
                    <option value="returned_for_scrap">স্ক্র্যাপ হিসেবে বিক্রয় (Scrap)</option>
                  </select>
                </div>
              </div>

              {/* Add damage item */}
              <div className="bg-purple-50/60 p-3.5 rounded-2xl border border-purple-200 space-y-3">
                <span className="font-bold text-purple-900 block">ক্ষতিগ্রস্ত পণ্য যোগ করুন:</span>
                <div className="grid grid-cols-4 gap-2">
                  <div className="col-span-2">
                    <label className="text-[10px] text-slate-500 block mb-0.5">পণ্য নির্বাচন:</label>
                    <select
                      value={dmgSelectedProductId}
                      onChange={e => setDmgSelectedProductId(e.target.value)}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    >
                      {products.filter(p => p.tenantId === tenant.id).map(p => (
                        <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">পরিমাণ:</label>
                    <input
                      type="number"
                      min={1}
                      value={dmgQty}
                      onChange={e => setDmgQty(Number(e.target.value))}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs text-center font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">ক্ষতির ধরন:</label>
                    <select
                      value={dmgReason}
                      onChange={e => setDmgReason(e.target.value as DamageReason)}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-[10px]"
                    >
                      <option value="expired">মেয়াদোত্তীর্ণ</option>
                      <option value="broken_in_transit">পরিবহনে ভাঙা</option>
                      <option value="water_pest_damage">পানি/ইঁদুর ক্ষতি</option>
                      <option value="manufacturing_defect">ফ্যাক্টরি ত্রুটি</option>
                      <option value="testing_wastage">টেস্টিং অপচয়</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    onClick={handleAddDmgItem}
                    className="px-3.5 py-1.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-lg text-xs transition cursor-pointer"
                  >
                    + ড্যামেজ আইটেম যোগ করুন
                  </button>
                </div>
              </div>

              {/* Items List */}
              {dmgItems.length > 0 && (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-2">পণ্য</th>
                        <th className="p-2 text-center">পরিমাণ</th>
                        <th className="p-2 text-right">ক্রয়মূল্য</th>
                        <th className="p-2 text-right">আর্থিক ক্ষতি</th>
                        <th className="p-2 text-center">মুছুন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {dmgItems.map((item, idx) => (
                        <tr key={idx}>
                          <td className="p-2 font-medium">{item.productName}</td>
                          <td className="p-2 text-center font-bold text-rose-600">{item.quantity}</td>
                          <td className="p-2 text-right font-mono">{tenant.currency}{item.unitPrice.toFixed(2)}</td>
                          <td className="p-2 text-right font-mono font-bold text-purple-700">{tenant.currency}{item.lossAmount.toFixed(2)}</td>
                          <td className="p-2 text-center">
                            <button type="button" onClick={() => handleRemoveDmgItem(idx)} className="text-rose-600 hover:text-rose-800">
                              <Trash2 className="w-3.5 h-3.5 mx-auto" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
                <span className="font-bold text-purple-900">মোট আর্থিক ক্ষতির পরিমাণ (Total Loss):</span>
                <span className="text-base font-black font-mono text-purple-900">{tenant.currency}{dmgTotalLoss.toFixed(2)}</span>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">অফিসিয়াল রাইট-অফ নোট:</label>
                <input
                  type="text"
                  value={dmgNotes}
                  onChange={e => setDmgNotes(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCreateDamageLogOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={dmgItems.length === 0}
                  className="px-5 py-2 bg-purple-700 hover:bg-purple-800 disabled:opacity-40 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  ড্যামেজ ভাউচার সেভ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 4: CREATE STOCK COUNT AUDIT SESSION                           */}
      {/* =================================================================== */}
      {isCreateStockCountOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-indigo-100 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="bg-indigo-700 text-white px-5 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">নতুন ফিজিক্যাল স্টক অডিট সেশন (Count Stock)</h3>
                <p className="text-xs text-indigo-200">গোডাউনের বাস্তব স্টক যাচাই ও সমন্বয় করার ওয়ার্কস্পেস তৈরি</p>
              </div>
              <button onClick={() => setIsCreateStockCountOpen(false)} className="text-indigo-200 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateNewAudit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">অডিট সেশনের শিরোনাম: *</label>
                <input
                  type="text"
                  value={scTitle}
                  onChange={e => setScTitle(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">ওয়্যারহাউস: *</label>
                  <select
                    value={scWarehouseId}
                    onChange={e => setScWarehouseId(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    {warehouses.map(w => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">ক্যাটাগরি ফিল্টার:</label>
                  <select
                    value={scCategoryFilter}
                    onChange={e => setScCategoryFilter(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="All">সকল ক্যাটাগরি (All Items)</option>
                    <option value="Tablet">Tablet</option>
                    <option value="Capsule">Capsule</option>
                    <option value="Syrup">Syrup</option>
                    <option value="Injection">Injection</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">প্রধান অডিটর / পরিদর্শক:</label>
                <input
                  type="text"
                  value={scAuditedBy}
                  onChange={e => setScAuditedBy(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">অডিট নোট / উদ্দেশ্য:</label>
                <input
                  type="text"
                  value={scNotes}
                  onChange={e => setScNotes(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCreateStockCountOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  অডিট সেশন শুরু করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* PRINTABLE VOUCHER PREVIEW MODAL (OFFICIAL SLIP)                     */}
      {/* =================================================================== */}
      {(viewingCreditNote || viewingPurchaseReturn || viewingDamageLog) && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between no-print">
              <span className="font-bold text-xs flex items-center gap-2">
                <Printer className="w-4 h-4 text-purple-400" />
                অফিসিয়াল প্রিন্ট প্রিভিউ
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" /> প্রিন্ট করুন
                </button>
                <button
                  onClick={() => {
                    setViewingCreditNote(null);
                    setViewingPurchaseReturn(null);
                    setViewingDamageLog(null);
                  }}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Document Content */}
            <div id="print-voucher-root" className="p-8 space-y-6 text-xs text-slate-800 overflow-y-auto">
              {/* Header */}
              <div className="text-center border-b pb-4">
                <h1 className="text-xl font-black text-slate-900 uppercase tracking-wider">{tenant.name}</h1>
                <p className="text-[11px] text-slate-500 mt-0.5">{tenant.address} • ফোন: {tenant.phone}</p>
                <div className="mt-2 inline-block px-3 py-1 bg-slate-100 font-bold uppercase rounded-md text-[11px] tracking-widest text-slate-800">
                  {viewingCreditNote && 'বিক্রয় ফেরত ক্রেডিট নোট (Sales Return Credit Note)'}
                  {viewingPurchaseReturn && 'ক্রয় ফেরত ডেবিট নোট (Purchases Return Debit Note)'}
                  {viewingDamageLog && 'ড্যামেজ ও অপচয় সার্টিফিকেট (Damage & Spoilage Write-off)'}
                </div>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                {viewingCreditNote && (
                  <>
                    <div>
                      <p><strong>ভাউচার নং:</strong> {viewingCreditNote.creditNoteNumber}</p>
                      <p><strong>মূল ইনভয়েস #:</strong> #{viewingCreditNote.originalInvoiceNumber}</p>
                      <p><strong>তারিখ:</strong> {viewingCreditNote.createdAt}</p>
                    </div>
                    <div>
                      <p><strong>গ্রাহক:</strong> {viewingCreditNote.customerName}</p>
                      <p><strong>রিফান্ড মাধ্যম:</strong> {viewingCreditNote.refundMethod.toUpperCase()}</p>
                      <p><strong>কারণ:</strong> {viewingCreditNote.reason}</p>
                    </div>
                  </>
                )}

                {viewingPurchaseReturn && (
                  <>
                    <div>
                      <p><strong>ডেবিট নোট নং:</strong> {viewingPurchaseReturn.debitNoteNumber}</p>
                      <p><strong>মূল PO #:</strong> {viewingPurchaseReturn.originalPoNumber}</p>
                      <p><strong>ডিসপ্যাচ তারিখ:</strong> {viewingPurchaseReturn.dispatchDate}</p>
                    </div>
                    <div>
                      <p><strong>সাপ্লায়ার:</strong> {viewingPurchaseReturn.supplierName}</p>
                      <p><strong>ওয়্যারহাউস:</strong> {viewingPurchaseReturn.warehouseName}</p>
                      <p><strong>রিটার্নকারী:</strong> {viewingPurchaseReturn.returnedBy}</p>
                    </div>
                  </>
                )}

                {viewingDamageLog && (
                  <>
                    <div>
                      <p><strong>ভাউচার নং:</strong> {viewingDamageLog.damageVoucherNumber}</p>
                      <p><strong>ওয়্যারহাউস:</strong> {viewingDamageLog.warehouseName}</p>
                      <p><strong>তারিখ:</strong> {viewingDamageLog.date}</p>
                    </div>
                    <div>
                      <p><strong>নিষ্পত্তি পদ্ধতি:</strong> {viewingDamageLog.disposalMethod.toUpperCase()}</p>
                      <p><strong>রিপোর্টার:</strong> {viewingDamageLog.reportedBy}</p>
                      <p><strong>অনুমোদনকারী:</strong> {viewingDamageLog.approvedBy}</p>
                    </div>
                  </>
                )}
              </div>

              {/* Items Table */}
              <table className="w-full text-left border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 text-slate-800">
                    <th className="border border-slate-300 p-2">পণ্য বিবরণ</th>
                    <th className="border border-slate-300 p-2 text-center">পরিমাণ</th>
                    <th className="border border-slate-300 p-2 text-right">দর</th>
                    <th className="border border-slate-300 p-2 text-right">মোট টাকা</th>
                  </tr>
                </thead>
                <tbody>
                  {viewingCreditNote && viewingCreditNote.items.map((it, i) => (
                    <tr key={i}>
                      <td className="border border-slate-300 p-2 font-medium">{it.productName} ({it.condition})</td>
                      <td className="border border-slate-300 p-2 text-center">{it.quantity}</td>
                      <td className="border border-slate-300 p-2 text-right">{tenant.currency}{it.unitPrice.toFixed(2)}</td>
                      <td className="border border-slate-300 p-2 text-right font-bold">{tenant.currency}{it.subtotal.toFixed(2)}</td>
                    </tr>
                  ))}

                  {viewingPurchaseReturn && viewingPurchaseReturn.items.map((it, i) => (
                    <tr key={i}>
                      <td className="border border-slate-300 p-2 font-medium">{it.productName} (লট: {it.batchNumber})</td>
                      <td className="border border-slate-300 p-2 text-center">{it.quantity}</td>
                      <td className="border border-slate-300 p-2 text-right">{tenant.currency}{it.unitPrice.toFixed(2)}</td>
                      <td className="border border-slate-300 p-2 text-right font-bold">{tenant.currency}{it.subtotal.toFixed(2)}</td>
                    </tr>
                  ))}

                  {viewingDamageLog && viewingDamageLog.items.map((it, i) => (
                    <tr key={i}>
                      <td className="border border-slate-300 p-2 font-medium">{it.productName} ({it.reason})</td>
                      <td className="border border-slate-300 p-2 text-center">{it.quantity}</td>
                      <td className="border border-slate-300 p-2 text-right">{tenant.currency}{it.unitPrice.toFixed(2)}</td>
                      <td className="border border-slate-300 p-2 text-right font-bold">{tenant.currency}{it.lossAmount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 font-bold">
                    <td colSpan={3} className="border border-slate-300 p-2 text-right">সর্বমোট:</td>
                    <td className="border border-slate-300 p-2 text-right text-sm">
                      {tenant.currency}
                      {viewingCreditNote ? viewingCreditNote.totalRefundAmount.toFixed(2) :
                       viewingPurchaseReturn ? viewingPurchaseReturn.totalRefundAmount.toFixed(2) :
                       viewingDamageLog ? viewingDamageLog.totalLossAmount.toFixed(2) : '0.00'}
                    </td>
                  </tr>
                </tfoot>
              </table>

              {/* Signatures */}
              <div className="pt-12 grid grid-cols-3 gap-6 text-center text-[10px] text-slate-500">
                <div className="border-t border-slate-400 pt-1.5">
                  প্রস্তুতকারক স্বাক্ষর
                </div>
                <div className="border-t border-slate-400 pt-1.5">
                  ওয়্যারহাউস ইনচার্জ
                </div>
                <div className="border-t border-slate-400 pt-1.5 font-bold text-slate-800">
                  অনুমোদিত কর্মকর্তা / মালিক
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
