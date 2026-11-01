import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Search, ShoppingCart, Plus, Minus, Trash2, User, CreditCard, 
  Banknote, Smartphone, Receipt, CheckCircle, AlertTriangle, ArrowLeft,
  Barcode, Percent, Clock, PauseCircle, PlayCircle, FileText, ChevronRight,
  Wifi, WifiOff, RefreshCw, Volume2, Tablet, Monitor, PhoneCall, Lock, Sparkles, CheckCircle2,
  Scale, HardDrive
} from 'lucide-react';
import { Product, Customer, Sale, Tenant, SaleItem, Warehouse, HoldCart } from '../types';
import { calculateEarnedPoints, LOYALTY_TIERS, POINTS_TO_BDT_RATE } from '../utils/loyaltyEngine';
import { kickElectronicCashDrawer } from '../utils/hardwareBridge';
import { CustomerFacingDisplayModal } from './hardware/CustomerFacingDisplayModal';
import { WeighingScaleWidget } from './hardware/WeighingScaleWidget';

interface POSScreenProps {
  tenant: Tenant;
  products: Product[];
  customers: Customer[];
  warehouses: Warehouse[];
  activeWarehouseId: string;
  cashierName: string;
  onCompleteSale: (sale: Sale) => void;
  onBackToDashboard: () => void;
  onOpenReceipt: (sale: Sale) => void;
  onOpenA4Invoice?: (sale: Sale) => void;
  globalFleetPosLocked?: boolean;
}

export const POSScreen: React.FC<POSScreenProps> = ({
  tenant,
  products,
  customers,
  warehouses,
  activeWarehouseId,
  cashierName,
  onCompleteSale,
  onBackToDashboard,
  onOpenReceipt,
  onOpenA4Invoice,
  globalFleetPosLocked = false,
  }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [pricingMode, setPricingMode] = useState<'retail' | 'wholesale'>('retail');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [loyaltyPointsRedeemed, setLoyaltyPointsRedeemed] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [taxPercent, setTaxPercent] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bkash' | 'nagad' | 'card' | 'credit'>('cash');
  const [transactionId, setTransactionId] = useState<string>('');
  const [paidInput, setPaidInput] = useState<string>('');
  const [receiptType, setReceiptType] = useState<'thermal' | 'a4'>('thermal');
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [quickAddCustomer, setQuickAddCustomer] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');

  // Phase 15: Hardware CFD & Scale State
  const [isCfdOpen, setIsCfdOpen] = useState(false);
  const [showScaleWidget, setShowScaleWidget] = useState(false);

  // Mobile Handheld Mode & Offline PWA State
  const [isMobileMode, setIsMobileMode] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [offlineQueue, setOfflineQueue] = useState<Sale[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('jh_offline_sales_queue') || '[]');
    } catch {
      return [];
    }
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  // Barcode quick scan state
  const [barcodeScanInput, setBarcodeScanInput] = useState('');
  const [scanAlert, setScanAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Synthesized Web Audio barcode beep sound
  const playScanBeep = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {
      // Audio autoplay restrictions
    }
  };

  // Hold / Park Carts state
  const [heldCarts, setHeldCarts] = useState<HoldCart[]>([]);
  const [showHeldCartsModal, setShowHeldCartsModal] = useState(false);
  const [holdNoteInput, setHoldNoteInput] = useState('');
  const [showHoldPrompt, setShowHoldPrompt] = useState(false);

  // Focus barcode input on mount
  useEffect(() => {
    barcodeInputRef.current?.focus();
  }, []);

  // Flash alert dismissal
  useEffect(() => {
    if (scanAlert) {
      const timer = setTimeout(() => setScanAlert(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [scanAlert]);

  // Categories list for active tenant
  const categories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach(p => {
      if (p.tenantId === tenant.id) {
        cats.add(p.category);
      }
    });
    return ['All', ...Array.from(cats)];
  }, [products, tenant.id]);

  // Filter products by active warehouse, category, and search query
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (p.tenantId !== tenant.id) return false;
      if (activeWarehouseId && activeWarehouseId !== 'all' && p.warehouseId !== activeWarehouseId) return false;
      if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesSku = p.sku.toLowerCase().includes(q);
        const matchesGeneric = p.genericName?.toLowerCase().includes(q);
        const matchesBatch = p.batchNumber?.toLowerCase().includes(q);
        const matchesRack = p.rackNumber?.toLowerCase().includes(q);
        return matchesName || matchesSku || matchesGeneric || matchesBatch || matchesRack;
      }
      return true;
    });
  }, [products, tenant.id, activeWarehouseId, selectedCategory, searchQuery]);

  // Selected customer
  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  // POS Policies from Tenant posSettings
  const posPolicies = tenant.posSettings || {
    allowDueSale: true,
    allowCashierDiscount: true,
    maxDiscountPercent: 20,
    allowNegativeStock: false,
    autoPrintThermal: true,
    audioBeep: true,
    requireCustomerPhone: false,
    allowHoldCart: true,
  };

  const isTerminalLocked = Boolean(globalFleetPosLocked || tenant.isPosLocked);

  // Effective price based on Retail vs Wholesale mode
  const getProductPrice = (p: Product) => {
    if (pricingMode === 'wholesale') {
      return p.wholesalePrice ? p.wholesalePrice : p.sellingPrice * 0.9;
    }
    return p.sellingPrice;
  };

  // Cart calculations
  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + (getProductPrice(item.product) * item.quantity), 0);
  }, [cart, pricingMode]);

  const taxAmount = (subtotal * taxPercent) / 100;
  const loyaltyDiscount = loyaltyPointsRedeemed * POINTS_TO_BDT_RATE;
  const netTotal = Math.max(0, subtotal - discountAmount - loyaltyDiscount + taxAmount);
  const earnedPoints = calculateEarnedPoints(netTotal, selectedCustomer?.loyaltyTier);
  
  const paidAmount = paidInput === '' ? netTotal : Math.max(0, parseFloat(paidInput) || 0);
  const dueAmount = Math.max(0, netTotal - paidAmount);
  const changeAmount = Math.max(0, paidAmount - netTotal);

  // Add to cart with audio beep and negative stock restriction
  const handleAddToCart = (product: Product) => {
    if (isTerminalLocked) {
      setScanAlert({ message: '🚨 টার্মিনাল লক করা আছে! বিক্রয় গ্রহণ করা যাবে না।', type: 'error' });
      return;
    }

    if (!posPolicies.allowNegativeStock && product.stock <= 0) {
      setScanAlert({ message: `"${product.name}" এর স্টক শেষ! নেগেটিভ স্টক পলিসি বন্ধ।`, type: 'error' });
      return;
    }

    if (posPolicies.audioBeep) {
      playScanBeep();
    }

    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        if (!posPolicies.allowNegativeStock && existing.quantity >= product.stock) {
          setScanAlert({ message: `সর্বোচ্চ স্টক সীমা (${product.stock}) পৌঁছে গেছে`, type: 'error' });
          return prev;
        }
        return prev.map(item => 
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  // Phase 15: Add Weighted item directly from RS-232 Digital Scale
  const handleAddWeightedToCart = (product: Product, weightKg: number) => {
    if (isTerminalLocked) {
      setScanAlert({ message: '🚨 টার্মিনাল লক করা আছে! বিক্রয় গ্রহণ করা যাবে না।', type: 'error' });
      return;
    }
    if (posPolicies.audioBeep) {
      playScanBeep();
    }
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: Math.round((item.quantity + weightKg) * 1000) / 1000 } 
            : item
        );
      }
      return [...prev, { product, quantity: weightKg }];
    });
    setScanAlert({ 
      message: `✅ ওজন স্কেল থেকে যুক্ত: ${product.name} (${weightKg.toFixed(3)} ${product.unit || 'kg'})`, 
      type: 'success' 
    });
  };

  // Instant Barcode Scan Enter Handler
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = barcodeScanInput.trim();
    if (!query) return;

    // Look for exact SKU or Barcode or match name
    const found = products.find(p => 
      p.tenantId === tenant.id && 
      (p.sku.toLowerCase() === query.toLowerCase() || p.id.toLowerCase() === query.toLowerCase() || p.name.toLowerCase().includes(query.toLowerCase()))
    );

    if (found) {
      handleAddToCart(found);
      setScanAlert({ message: `✅ যুক্ত হয়েছে: ${found.name}`, type: 'success' });
      setBarcodeScanInput('');
    } else {
      setScanAlert({ message: `❌ কোনো পণ্য পাওয়া যায়নি: "${query}"`, type: 'error' });
    }
  };

  const handleUpdateQty = (productId: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          if (newQty > item.product.stock) return item;
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(Boolean) as { product: Product; quantity: number }[];
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
    setDiscountAmount(0);
    setLoyaltyPointsRedeemed(0);
    setPaidInput('');
    setTransactionId('');
    setSelectedCustomerId('');
  };

  // Hold / Park Cart functions
  const handleHoldCartSubmit = () => {
    if (cart.length === 0) return;
    const newHold: HoldCart = {
      id: 'hold-' + Date.now(),
      note: holdNoteInput.trim() || `কাস্টমার ${heldCarts.length + 1} (${cart.length} টি পণ্য)`,
      createdAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      items: [...cart],
      customerId: selectedCustomerId,
      discountAmount,
      taxPercent,
      pricingType: pricingMode,
    };
    setHeldCarts(prev => [newHold, ...prev]);
    setShowHoldPrompt(false);
    setHoldNoteInput('');
    handleClearCart();
    setScanAlert({ message: 'বিল সাময়িকভাবে হোল্ড করা হয়েছে', type: 'success' });
  };

  const handleResumeHeldCart = (hold: HoldCart) => {
    setCart(hold.items);
    setSelectedCustomerId(hold.customerId || '');
    setDiscountAmount(hold.discountAmount);
    setTaxPercent(hold.taxPercent);
    setPricingMode(hold.pricingType);
    setHeldCarts(prev => prev.filter(h => h.id !== hold.id));
    setShowHeldCartsModal(false);
    setScanAlert({ message: 'হোল্ড বিল কার্টে ফিরিয়ে আনা হয়েছে', type: 'success' });
  };

  const handleDeleteHeldCart = (holdId: string) => {
    setHeldCarts(prev => prev.filter(h => h.id !== holdId));
  };

  // Quick Taka increment buttons
  const handleAddTaka = (amount: number) => {
    const current = parseFloat(paidInput) || 0;
    setPaidInput((current + amount).toString());
  };

  const handleSetExactTaka = () => {
    setPaidInput(netTotal.toFixed(2));
  };

  // Process checkout & trigger memo
  const handleProcessCheckout = () => {
    if (cart.length === 0) return;

    if (isTerminalLocked) {
      alert('সুপার এডমিন কমান্ড সেন্টার দ্বারা টার্মিনাল লক করা আছে। বিক্রয় সম্পন্ন করা সম্ভব নয়।');
      return;
    }

    const isCredit = paymentMethod === 'credit';

    if (isCredit && !posPolicies.allowDueSale) {
      alert('সুপার এডমিন পলিসি অনুযায়ী এই টার্মিনালে বাকি বিক্রয় (Credit/Due Sale) সম্পূর্ণ নিষিদ্ধ করা হয়েছে।');
      return;
    }

    const custPhone = selectedCustomer ? selectedCustomer.phone : newCustPhone.trim();
    if (posPolicies.requireCustomerPhone && !custPhone) {
      alert('দোকানের পলিসি অনুযায়ী কাস্টমারের মোবাইল নম্বর প্রদান করা বাধ্যতামূলক!');
      return;
    }

    const saleItems: SaleItem[] = cart.map(item => ({
      productId: item.product.id,
      productName: item.product.name,
      sku: item.product.sku,
      price: getProductPrice(item.product),
      costPrice: item.product.costPrice,
      quantity: item.quantity,
      unit: item.product.unit,
      subtotal: getProductPrice(item.product) * item.quantity,
      batchNumber: item.product.batchNumber,
      imei: item.product.imeiNumbers?.[0],
    }));

    const newSale: Sale = {
      id: 'sale-' + Date.now(),
      invoiceNumber: 'INV-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + Math.floor(100 + Math.random() * 900),
      tenantId: tenant.id,
      warehouseId: activeWarehouseId === 'all' ? (warehouses[0]?.id || 'wh-1') : activeWarehouseId,
      customerId: selectedCustomerId || undefined,
      customerName: selectedCustomer ? selectedCustomer.name : (newCustName.trim() || 'সাধারণ গ্রাহক (Walk-in)'),
      customerPhone: selectedCustomer ? selectedCustomer.phone : (newCustPhone.trim() || undefined),
      items: saleItems,
      subtotal,
      tax: taxAmount,
      discount: discountAmount,
      totalAmount: netTotal,
      paidAmount: isCredit ? 0 : paidAmount,
      dueAmount: isCredit ? netTotal : dueAmount,
      changeAmount: isCredit ? 0 : changeAmount,
      paymentMethod,
      transactionId: transactionId.trim() || undefined,
      pricingType: pricingMode,
      invoiceStatus: isCredit ? 'due' : dueAmount > 0 ? 'partial' : 'paid',
      cashierId: 'cashier-1',
      cashierName: cashierName,
      createdAt: new Date().toLocaleString('en-GB'),
      status: 'completed',
      loyaltyPointsUsed: loyaltyPointsRedeemed > 0 ? loyaltyPointsRedeemed : undefined,
      loyaltyDiscountBDT: loyaltyDiscount > 0 ? loyaltyDiscount : undefined,
      loyaltyPointsEarned: earnedPoints,
      whatsAppStatus: 'delivered',
    };

    onCompleteSale(newSale);
    setShowCheckoutModal(false);
    handleClearCart();

    // Phase 15: Automatically kick electronic cash drawer on cash transactions
    if (paymentMethod === 'cash') {
      kickElectronicCashDrawer(2);
    }

    // Trigger selected receipt format (autoPrintThermal defaults to thermal slip)
    if (receiptType === 'a4' && onOpenA4Invoice) {
      onOpenA4Invoice(newSale);
    } else {
      onOpenReceipt(newSale);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-100 overflow-hidden font-sans relative">
      {/* Super Admin POS Lockdown Screen Overlay */}
      {isTerminalLocked && (
        <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-6 text-white text-center animate-in fade-in duration-200">
          <div className="max-w-md w-full bg-slate-900 border-2 border-rose-500/60 rounded-3xl p-8 shadow-2xl space-y-5">
            <div className="w-16 h-16 rounded-3xl bg-rose-500/20 text-rose-500 border border-rose-500/40 flex items-center justify-center mx-auto animate-pulse">
              <Lock className="w-8 h-8" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-rose-400 bg-rose-950/60 px-3 py-1 rounded-full border border-rose-800">
                🚨 POS টার্মিনাল লকডাউন
              </span>
              <h2 className="text-xl font-black text-white mt-3">
                ক্যাশ কাউন্টার সাময়িক লক করা হয়েছে
              </h2>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700 font-sans">
                {tenant.posLockReason || 'JH IMSE সুপার এডমিন কমান্ড সেন্টার বা প্রধান কার্যালয় কর্তৃক এই শাখার ক্যাশ কাউন্টার ফ্রিজ/লক রাখা হয়েছে। কোনো নতুন বিক্রয় বা লেনদেন অনুমোদন করা হবে না।'}
              </p>
            </div>

            <div className="text-[11px] text-slate-400 border-t border-slate-800 pt-3">
              দোকান: <strong>{tenant.name}</strong> • সহায়তা: <strong className="text-purple-300">+8801940999830</strong>
            </div>

            <button
              onClick={onBackToDashboard}
              className="w-full py-2.5 bg-white hover:bg-slate-100 text-slate-900 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-md"
            >
              <ArrowLeft className="w-4 h-4 text-purple-700" /> স্টোর ড্যাশবোর্ডে ফিরে যান
            </button>
          </div>
        </div>
      )}
      {/* POS Top Bar */}
      <div className="bg-purple-900 text-white px-5 py-2.5 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToDashboard}
            className="p-1.5 bg-purple-800 hover:bg-purple-700 rounded-xl text-purple-200 hover:text-white transition flex items-center gap-1.5 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" /> ড্যাশবোর্ড
          </button>
          <div>
            <h1 className="font-bold text-sm tracking-wide flex items-center gap-2">
              <span>{tenant.name} - POS ক্যাশ কাউন্টার</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 font-normal">
                লাইভ মোড
              </span>
            </h1>
            <p className="text-[11px] text-purple-200">
              ক্যাশিয়ার: <strong className="text-white">{cashierName}</strong> • ওয়্যারহাউস: {activeWarehouseId === 'all' ? 'সব শাখা' : warehouses.find(w => w.id === activeWarehouseId)?.name || 'মূল দোকান'}
            </p>
          </div>
        </div>

        {/* Center / Action Toolbar */}
        <div className="flex items-center gap-2">
          {/* Dual Pricing Mode Toggle */}
          <div className="bg-purple-950 p-0.5 rounded-xl flex items-center border border-purple-800 text-xs">
            <button
              onClick={() => setPricingMode('retail')}
              className={`px-3 py-1 rounded-lg font-bold transition ${pricingMode === 'retail' ? 'bg-purple-600 text-white shadow-xs' : 'text-purple-300 hover:text-white'}`}
            >
              খুচরা (Retail MRP)
            </button>
            <button
              onClick={() => setPricingMode('wholesale')}
              className={`px-3 py-1 rounded-lg font-bold transition ${pricingMode === 'wholesale' ? 'bg-amber-500 text-slate-900 shadow-xs' : 'text-purple-300 hover:text-white'}`}
            >
              পাইকারি (Wholesale)
            </button>
          </div>

          {/* Hold Carts Button */}
          <button
            onClick={() => setShowHeldCartsModal(true)}
            className="px-3 py-1.5 bg-purple-800 hover:bg-purple-700 text-purple-200 hover:text-white text-xs rounded-xl font-bold flex items-center gap-1.5 transition border border-purple-700 relative"
          >
            <PauseCircle className="w-4 h-4 text-amber-300" />
            <span>হোল্ড বিলসমূহ</span>
            {heldCarts.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-900 font-extrabold text-[10px] flex items-center justify-center">
                {heldCarts.length}
              </span>
            )}
          </button>

          {/* Phase 15: Customer Facing Display (CFD) */}
          <button
            onClick={() => setIsCfdOpen(true)}
            className="px-2.5 py-1.5 bg-purple-800 hover:bg-purple-700 text-purple-200 hover:text-white text-xs rounded-xl font-bold flex items-center gap-1.5 transition border border-purple-700"
            title="কাস্টমার ফেসিং ডুয়াল স্ক্রিন (CFD) ওপেন করুন"
          >
            <Monitor className="w-4 h-4 text-emerald-400" />
            <span className="hidden md:inline">CFD ডিসপ্লে</span>
          </button>

          {/* Phase 15: Digital Scale Toggle */}
          <button
            onClick={() => setShowScaleWidget(!showScaleWidget)}
            className={`px-2.5 py-1.5 text-xs rounded-xl font-bold flex items-center gap-1.5 transition border ${
              showScaleWidget 
                ? 'bg-amber-400 text-slate-900 border-amber-500 shadow-xs' 
                : 'bg-purple-800 hover:bg-purple-700 text-purple-200 hover:text-white border-purple-700'
            }`}
            title="RS-232 / USB ডিজিটাল ওজন স্কেল"
          >
            <Scale className="w-4 h-4 text-amber-300" />
            <span className="hidden md:inline">ওজন স্কেল</span>
          </button>

          {/* Phase 15: Manual Cash Drawer Kick */}
          <button
            onClick={() => kickElectronicCashDrawer(2)}
            className="px-2.5 py-1.5 bg-purple-800 hover:bg-purple-700 text-purple-200 hover:text-white text-xs rounded-xl font-bold flex items-center gap-1.5 transition border border-purple-700"
            title="ক্যাশ ড্রয়ার খুলুন (RJ11 Kick Pulse)"
          >
            <HardDrive className="w-4 h-4 text-cyan-300" />
            <span className="hidden lg:inline">ড্রয়ার</span>
          </button>

          {/* Hold Current Cart */}
          <button
            onClick={() => setShowHoldPrompt(true)}
            disabled={cart.length === 0}
            className="px-3 py-1.5 bg-purple-800/80 hover:bg-purple-700 text-purple-200 hover:text-white text-xs rounded-xl font-medium transition disabled:opacity-40"
            title="বর্তমান কার্ট হোল্ড করে নতুন কাস্টমার সার্ভ করুন"
          >
            হোল্ড বিল
          </button>

          <button
            onClick={handleClearCart}
            disabled={cart.length === 0}
            className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500 text-rose-200 hover:text-white text-xs rounded-xl font-medium transition disabled:opacity-40"
          >
            কার্ট খালি
          </button>
        </div>
      </div>

      {/* Main Body: Left Product catalog, Right Cart Drawer */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Scan Alert Floating Toast */}
        {scanAlert && (
          <div className={`absolute top-3 left-6 z-40 px-4 py-2 rounded-xl text-xs font-bold shadow-lg transition-all ${
            scanAlert.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
          }`}>
            {scanAlert.message}
          </div>
        )}

        {/* Left Side: Product Grid */}
        <div className="flex-1 flex flex-col p-4 overflow-hidden border-r border-slate-200">
          {/* Barcode & Search Controls */}
          <div className="grid grid-cols-12 gap-2 mb-3">
            {/* Quick Barcode Scanner Input */}
            <form onSubmit={handleBarcodeSubmit} className="col-span-5 relative">
              <Barcode className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-purple-600" />
              <input
                ref={barcodeInputRef}
                type="text"
                value={barcodeScanInput}
                onChange={e => setBarcodeScanInput(e.target.value)}
                placeholder="বারকোড স্ক্যানার / SKU টাইপ করে [Enter] চাপুন..."
                className="w-full pl-9 pr-14 py-2 bg-purple-50/60 border border-purple-200 rounded-xl text-xs font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white shadow-2xs"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2 py-1 bg-purple-700 text-white rounded-lg text-[10px] font-bold"
              >
                স্ক্যান
              </button>
            </form>

            {/* Standard Keyword Search */}
            <div className="col-span-4 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="পণ্য, জেনেরিক বা র‍্যাক সার্চ..."
                className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-600 shadow-2xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category tabs */}
            <div className="col-span-3 flex gap-1 overflow-x-auto pb-0.5">
              {categories.slice(0, 4).map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition ${
                    selectedCategory === cat
                      ? 'bg-purple-700 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Phase 15: RS-232 / USB Digital Weighing Scale Panel */}
          {showScaleWidget && (
            <div className="mb-3 animate-in fade-in zoom-in-95 duration-150">
              <WeighingScaleWidget
                products={filteredProducts}
                onAddWeightedProductToCart={handleAddWeightedToCart}
                currency={tenant.currency}
              />
            </div>
          )}

          {/* Product Cards Grid */}
          <div className="flex-1 overflow-y-auto pr-1">
            {filteredProducts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8">
                <Search className="w-10 h-10 mb-2 opacity-50 text-slate-400" />
                <p className="text-sm font-medium">কোনো পণ্য পাওয়া যায়নি</p>
                <p className="text-xs text-slate-400 mt-1">অন্য কি-ওয়ার্ড বা ক্যাটাগরি দিয়ে চেষ্টা করুন</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredProducts.map(product => {
                  const inCartItem = cart.find(i => i.product.id === product.id);
                  const isOutOfStock = product.stock <= 0;
                  const isLowStock = product.stock > 0 && product.stock <= product.alertStock;
                  const effectivePrice = getProductPrice(product);

                  return (
                    <div
                      key={product.id}
                      onClick={() => !isOutOfStock && handleAddToCart(product)}
                      className={`relative bg-white rounded-2xl p-3 border transition-all text-left flex flex-col justify-between select-none ${
                        isOutOfStock 
                          ? 'border-slate-200 opacity-60 cursor-not-allowed bg-slate-50' 
                          : 'border-slate-200 hover:border-purple-500 hover:shadow-md cursor-pointer active:scale-[0.98]'
                      }`}
                    >
                      {/* Top Badges */}
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <span className="text-[10px] font-mono font-medium text-slate-400 truncate">
                          {product.sku}
                        </span>
                        {isOutOfStock ? (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-700 font-bold">
                            স্টক নেই
                          </span>
                        ) : isLowStock ? (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-700 font-bold flex items-center gap-0.5">
                            <AlertTriangle className="w-2.5 h-2.5" /> লো ({product.stock})
                          </span>
                        ) : (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                            স্টক: {product.stock}
                          </span>
                        )}
                      </div>

                      {/* Name & Generic / Batch */}
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-900 text-xs line-clamp-2 leading-snug">
                          {product.name}
                        </h3>
                        {product.genericName && (
                          <p className="text-[10px] text-purple-700 font-medium italic mt-0.5 truncate">
                            {product.genericName}
                          </p>
                        )}
                        {product.rackNumber && (
                          <span className="inline-block text-[9px] font-mono bg-slate-100 px-1 py-0.2 rounded text-slate-500 mt-1">
                            📍 {product.rackNumber}
                          </span>
                        )}
                        {product.expiryDate && (
                          <p className="text-[9px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Clock className="w-2.5 h-2.5 text-slate-400" /> মেয়াদ: {product.expiryDate}
                          </p>
                        )}
                      </div>

                      {/* Price and Cart Indicator */}
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="text-sm font-black text-purple-800">
                            {tenant.currency}{effectivePrice.toFixed(2)}
                          </span>
                          {pricingMode === 'wholesale' && (
                            <span className="text-[9px] text-amber-700 font-bold block -mt-0.5">
                              পাইকারি দর
                            </span>
                          )}
                        </div>
                        {inCartItem ? (
                          <span className="w-6 h-6 rounded-full bg-purple-700 text-white text-xs font-bold flex items-center justify-center shadow-xs">
                            {inCartItem.quantity}
                          </span>
                        ) : (
                          <span className="p-1.5 rounded-xl bg-purple-50 text-purple-600 hover:bg-purple-100 transition">
                            <Plus className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Cart & Checkout (380px wide) */}
        <div className="w-96 bg-white flex flex-col shadow-xl border-l border-slate-200">
          {/* Cart Header & Customer Selector */}
          <div className="p-3.5 border-b border-slate-200 bg-slate-50 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <ShoppingCart className="w-4 h-4 text-purple-700" />
                <span className="font-bold text-xs text-slate-900">অর্ডার কার্ট ({cart.length})</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${pricingMode === 'wholesale' ? 'bg-amber-100 text-amber-800' : 'bg-purple-100 text-purple-800'}`}>
                  {pricingMode === 'wholesale' ? 'পাইকারি' : 'খুচরা'}
                </span>
              </div>
              <button
                onClick={() => setQuickAddCustomer(!quickAddCustomer)}
                className="text-xs text-purple-700 font-bold hover:underline"
              >
                {quickAddCustomer ? 'তালিকা থেকে বাছুন' : '+ নতুন গ্রাহক'}
              </button>
            </div>

            {quickAddCustomer ? (
              <div className="space-y-1.5 pt-1 animate-in fade-in duration-100">
                <input
                  type="text"
                  placeholder="গ্রাহকের নাম"
                  value={newCustName}
                  onChange={e => setNewCustName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-purple-600"
                />
                <input
                  type="text"
                  placeholder="মোবাইল নম্বর"
                  value={newCustPhone}
                  onChange={e => setNewCustPhone(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-purple-600"
                />
              </div>
            ) : (
              <div>
                <select
                  value={selectedCustomerId}
                  onChange={e => setSelectedCustomerId(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-600"
                >
                  <option value="">সাধারণ গ্রাহক (Walk-in Customer)</option>
                  {customers.filter(c => c.tenantId === tenant.id).map(cust => (
                    <option key={cust.id} value={cust.id}>
                      {cust.name} ({cust.phone}) {cust.dueAmount > 0 ? `[বাকি: ${tenant.currency}${cust.dueAmount}]` : ''}
                    </option>
                  ))}
                </select>

                {selectedCustomer && selectedCustomer.dueAmount > 0 && (
                  <div className="mt-1 px-2 py-0.5 bg-rose-50 border border-rose-200 rounded-lg flex items-center justify-between text-[11px] text-rose-700">
                    <span>পূর্বের বকেয়া (বাকি খাতা):</span>
                    <strong className="font-bold">{tenant.currency}{selectedCustomer.dueAmount}</strong>
                  </div>
                )}

                {selectedCustomer && (
                  <div className="mt-1.5 p-2 bg-gradient-to-r from-purple-50 to-amber-50 border border-purple-200 rounded-lg space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800">
                        <span>
                          {selectedCustomer.loyaltyTier === 'platinum' || selectedCustomer.loyaltyTier === 'vip' ? '💎 প্ল্যাটিনাম' :
                           selectedCustomer.loyaltyTier === 'gold' ? '🥇 গোল্ড' :
                           selectedCustomer.loyaltyTier === 'silver' ? '🥈 সিলভার' : '🥉 ব্রোঞ্জ'}
                        </span>
                        <span className="text-amber-700 font-mono">({selectedCustomer.loyaltyPoints || 0} Pts)</span>
                      </div>
                      {(selectedCustomer.loyaltyPoints || 0) > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            const maxRedeem = Math.min(selectedCustomer.loyaltyPoints || 0, Math.floor(subtotal));
                            if (loyaltyPointsRedeemed > 0) {
                              setLoyaltyPointsRedeemed(0);
                            } else {
                              setLoyaltyPointsRedeemed(maxRedeem);
                            }
                          }}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                            loyaltyPointsRedeemed > 0
                              ? 'bg-rose-100 text-rose-700 border border-rose-300'
                              : 'bg-amber-600 text-white hover:bg-amber-700 shadow-2xs'
                          }`}
                        >
                          {loyaltyPointsRedeemed > 0 ? 'পয়েন্ট বাতিল' : 'পয়েন্ট ছাড় (৳' + Math.min(selectedCustomer.loyaltyPoints || 0, Math.floor(subtotal)) + ')'}
                        </button>
                      )}
                    </div>
                    {loyaltyPointsRedeemed > 0 && (
                      <div className="text-[10px] text-emerald-700 font-bold flex items-center justify-between">
                        <span>রিওয়ার্ড পয়েন্ট ছাড়:</span>
                        <span>-৳{loyaltyDiscount.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center">
                <ShoppingCart className="w-12 h-12 stroke-[1.2] opacity-40 mb-2 text-slate-400" />
                <p className="text-xs font-semibold text-slate-500">কার্ট খালি আছে</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  বারকোড স্ক্যান করুন অথবা পণ্যের উপর ক্লিক করুন
                </p>
              </div>
            ) : (
              cart.map(({ product, quantity }) => {
                const itemPrice = getProductPrice(product);
                return (
                  <div
                    key={product.id}
                    className="bg-slate-50 rounded-xl p-2.5 border border-slate-200 flex items-center justify-between gap-2"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-slate-900 truncate">{product.name}</h4>
                      <p className="text-[10px] text-slate-500">
                        {tenant.currency}{itemPrice.toFixed(2)} × {quantity} = <strong className="text-slate-800">{tenant.currency}{(itemPrice * quantity).toFixed(2)}</strong>
                      </p>
                    </div>

                    {/* Quantity Stepper */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleUpdateQty(product.id, -1)}
                        className="w-6 h-6 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-slate-200 text-xs"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center font-bold text-xs text-slate-800">
                        {quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateQty(product.id, 1)}
                        disabled={quantity >= product.stock}
                        className="w-6 h-6 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-slate-200 text-xs disabled:opacity-40"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleRemoveFromCart(product.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition ml-0.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Cart Summary & Checkout Trigger */}
          <div className="p-3.5 bg-slate-50 border-t border-slate-200 space-y-2">
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>সাব-টোটাল ({pricingMode}):</span>
                <span className="font-semibold text-slate-800">{tenant.currency}{subtotal.toFixed(2)}</span>
              </div>

              {/* Discount Row */}
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Percent className="w-3 h-3 text-purple-600" /> ছাড় (Discount):
                  {!posPolicies.allowCashierDiscount && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 font-bold">পলিসি বন্ধ</span>
                  )}
                  {posPolicies.allowCashierDiscount && posPolicies.maxDiscountPercent < 100 && (
                    <span className="text-[9px] text-slate-400 font-semibold">(সর্বোচ্চ {posPolicies.maxDiscountPercent}%)</span>
                  )}
                </span>
                <div className="flex items-center gap-1">
                  <span>{tenant.currency}</span>
                  <input
                    type="number"
                    min="0"
                    disabled={!posPolicies.allowCashierDiscount}
                    value={discountAmount || ''}
                    onChange={e => {
                      if (!posPolicies.allowCashierDiscount) return;
                      const entered = Math.max(0, parseFloat(e.target.value) || 0);
                      const maxAllowed = (subtotal * (posPolicies.maxDiscountPercent || 100)) / 100;
                      if (entered > maxAllowed) {
                        setDiscountAmount(maxAllowed);
                        setScanAlert({ message: `সর্বোচ্চ ছাড়ের সীমা ${posPolicies.maxDiscountPercent}% (৳${maxAllowed.toFixed(0)})`, type: 'error' });
                      } else {
                        setDiscountAmount(entered);
                      }
                    }}
                    placeholder="0"
                    title={!posPolicies.allowCashierDiscount ? 'সুপার এডমিন কর্তৃক ক্যাশিয়ার ছাড় পলিসি বন্ধ আছে' : `সর্বোচ্চ অনুমোদনযোগ্য ছাড় ${posPolicies.maxDiscountPercent}%`}
                    className={`w-16 px-1.5 py-0.5 rounded text-right text-xs font-semibold ${
                      !posPolicies.allowCashierDiscount 
                        ? 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed' 
                        : 'bg-white border border-slate-200 focus:ring-1 focus:ring-purple-600'
                    }`}
                  />
                </div>
              </div>

              {/* Tax Row */}
              <div className="flex items-center justify-between">
                <span>ভ্যাট / ট্যাক্স (%):</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={taxPercent || ''}
                    onChange={e => setTaxPercent(Math.max(0, parseFloat(e.target.value) || 0))}
                    placeholder="0"
                    className="w-12 px-1.5 py-0.5 bg-white border border-slate-200 rounded text-right text-xs"
                  />
                  <span>% ({tenant.currency}{taxAmount.toFixed(2)})</span>
                </div>
              </div>

              {loyaltyPointsRedeemed > 0 && (
                <div className="flex items-center justify-between text-amber-800 font-bold">
                  <span>পয়েন্ট রিডিম ছাড়:</span>
                  <span>-{tenant.currency}{loyaltyDiscount.toFixed(2)}</span>
                </div>
              )}

              {earnedPoints > 0 && (
                <div className="flex items-center justify-between text-emerald-700 font-bold text-[11px] bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                  <span>✨ এই ক্রয়ে অর্জিত লয়্যালটি:</span>
                  <span>+{earnedPoints} Pts</span>
                </div>
              )}

              <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                <span>সর্বমোট বিল:</span>
                <span className="text-purple-700">{tenant.currency}{netTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setPaidInput(netTotal.toFixed(2));
                setShowCheckoutModal(true);
              }}
              disabled={cart.length === 0}
              className="w-full py-3 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-40 disabled:hover:shadow-none"
            >
              <CreditCard className="w-4 h-4" /> দ্রুত পেমেন্ট ও ইনভয়েস ({tenant.currency}{netTotal.toFixed(2)})
            </button>
          </div>
        </div>
      </div>

      {/* Hold Bill Prompt Modal */}
      {showHoldPrompt && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <PauseCircle className="w-5 h-5 text-amber-500" /> বর্তমান বিল হোল্ড করুন
            </h3>
            <p className="text-xs text-slate-500">
              গ্রাহক পরে এলে এই বিলটি সরাসরি পুনরুদ্ধার করা যাবে। বিল শনাক্ত করতে একটি নোট দিন:
            </p>
            <input
              type="text"
              placeholder="যেমন: রহিম সাহেব - ক্যাশ আনতে গেছেন"
              value={holdNoteInput}
              onChange={e => setHoldNoteInput(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-purple-600"
              autoFocus
            />
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowHoldPrompt(false)}
                className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold text-xs"
              >
                বাতিল
              </button>
              <button
                onClick={handleHoldCartSubmit}
                className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-xl text-xs shadow-xs"
              >
                হোল্ড নিশ্চিত করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Held Carts List Modal */}
      {showHeldCartsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PauseCircle className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm">হোল্ডকৃত ড্রাফট বিলসমূহ ({heldCarts.length})</h3>
              </div>
              <button onClick={() => setShowHeldCartsModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="p-5 max-h-[60vh] overflow-y-auto space-y-2.5">
              {heldCarts.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <PauseCircle className="w-10 h-10 mx-auto opacity-30 mb-2" />
                  <p className="text-xs font-semibold">কোনো হোল্ড বিল নেই</p>
                </div>
              ) : (
                heldCarts.map(hold => {
                  const holdTotal = hold.items.reduce((s, it) => s + (it.product.sellingPrice * it.quantity), 0);
                  return (
                    <div key={hold.id} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
                      <div>
                        <h4 className="font-bold text-xs text-slate-800">{hold.note}</h4>
                        <p className="text-[10px] text-slate-400">
                          সময়: {hold.createdAt} • {hold.items.length} টি আইটেম • মোড: {hold.pricingType}
                        </p>
                        <p className="text-xs font-black text-purple-700 mt-0.5">৳{holdTotal.toFixed(2)}</p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleResumeHeldCart(hold)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs"
                        >
                          <PlayCircle className="w-3.5 h-3.5" /> কার্টে আনুন
                        </button>
                        <button
                          onClick={() => handleDeleteHeldCart(hold.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-purple-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-purple-900 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">পেমেন্ট গ্রহণ ও মেমো প্রিন্ট</h3>
                <p className="text-xs text-purple-200">মোট প্রদেয়: <strong className="text-white font-mono text-sm">{tenant.currency}{netTotal.toFixed(2)}</strong></p>
              </div>
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="text-purple-200 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {/* Payment Method Selector */}
              <div>
                <label className="font-semibold text-slate-700 block mb-2">
                  পেমেন্ট মাধ্যম বেছে নিন:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`py-2 px-3 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition ${
                      paymentMethod === 'cash'
                        ? 'bg-purple-700 text-white border-purple-700 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Banknote className="w-4 h-4" /> নগদ (Cash)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bkash')}
                    className={`py-2 px-3 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition ${
                      paymentMethod === 'bkash'
                        ? 'bg-pink-600 text-white border-pink-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" /> বিকাশ (bKash)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('nagad')}
                    className={`py-2 px-3 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition ${
                      paymentMethod === 'nagad'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" /> নগদ (Nagad)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`py-2 px-3 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition ${
                      paymentMethod === 'card'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" /> কার্ড (Card)
                  </button>
                  <button
                    type="button"
                    disabled={!posPolicies.allowDueSale}
                    onClick={() => {
                      if (!posPolicies.allowDueSale) {
                        alert('সুপার এডমিন পলিসি অনুযায়ী এই টার্মিনালে বাকি বিক্রয় (Due/Credit Sale) বন্ধ করা হয়েছে।');
                        return;
                      }
                      setPaymentMethod('credit');
                    }}
                    className={`col-span-2 py-2 px-3 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition ${
                      !posPolicies.allowDueSale
                        ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                        : paymentMethod === 'credit'
                        ? 'bg-rose-700 text-white border-rose-700 shadow-xs'
                        : 'bg-white text-rose-700 border-rose-200 hover:bg-rose-50'
                    }`}
                  >
                    <Receipt className="w-4 h-4" /> 
                    {posPolicies.allowDueSale ? 'সম্পূর্ণ বাকি (Credit / Due Khata)' : 'বাকি বিক্রয় পলিসি বন্ধ (Due Blocked)'}
                  </button>
                </div>
              </div>

              {/* Digital TrxID input for bKash or Nagad */}
              {(paymentMethod === 'bkash' || paymentMethod === 'nagad') && (
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                  <label className="font-bold text-purple-900 block mb-1">
                    লেনদেন আইডি (TrxID / Transaction ID) [ঐচ্ছিক]:
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: 9J83KX91"
                    value={transactionId}
                    onChange={e => setTransactionId(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-purple-200 rounded-xl font-mono text-xs"
                  />
                </div>
              )}

              {/* Cash Denomination Buttons & Amount Inputs */}
              {paymentMethod !== 'credit' && (
                <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  {/* Quick Taka Buttons for Cashiers */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">
                      দ্রুত ক্যাশ এন্ট্রি বাটন:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={handleSetExactTaka}
                        className="px-2.5 py-1 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-lg font-bold text-[11px]"
                      >
                        হুবহু ৳{netTotal.toFixed(0)}
                      </button>
                      {[50, 100, 500, 1000, 2000].map(val => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => handleAddTaka(val)}
                          className="px-2.5 py-1 bg-white hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg font-bold text-[11px]"
                        >
                          +{tenant.currency}{val}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      গ্রাহক প্রদান করেছেন (Paid Amount):
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-500">
                        {tenant.currency}
                      </span>
                      <input
                        type="number"
                        step="any"
                        value={paidInput}
                        onChange={e => setPaidInput(e.target.value)}
                        placeholder={netTotal.toFixed(2)}
                        className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-xl font-black text-lg text-slate-900 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Change or Due Result */}
                  <div className="grid grid-cols-2 gap-2 pt-1 font-medium">
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800">
                      <span className="text-[10px] block text-emerald-600">ফেরত দিতে হবে (Change):</span>
                      <strong className="text-base font-black">{tenant.currency}{changeAmount.toFixed(2)}</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800">
                      <span className="text-[10px] block text-rose-600">বকেয়া থাকবে (Due):</span>
                      <strong className="text-base font-black">{tenant.currency}{dueAmount.toFixed(2)}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Receipt Format Selection */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <span className="font-bold text-slate-700 block mb-2">রসিদ / ইনভয়েসের প্রিন্ট ফরম্যাট:</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setReceiptType('thermal')}
                    className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2 ${
                      receiptType === 'thermal'
                        ? 'bg-purple-50 border-purple-600 text-purple-900 font-bold shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    <Receipt className="w-4 h-4 text-purple-700" />
                    <div>
                      <span className="block text-xs">থার্মাল স্লিপ (POS 80mm)</span>
                      <span className="text-[10px] text-slate-400">রসিদ রোল প্রিন্টারের জন্য</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReceiptType('a4')}
                    className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2 ${
                      receiptType === 'a4'
                        ? 'bg-purple-50 border-purple-600 text-purple-900 font-bold shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    <FileText className="w-4 h-4 text-purple-700" />
                    <div>
                      <span className="block text-xs">A4 ট্যাক্স ইনভয়েস</span>
                      <span className="text-[10px] text-slate-400">কর্পোরেট / পাইকারি বিল</span>
                    </div>
                  </button>
                </div>
              </div>

              {paymentMethod === 'credit' && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                  <p className="font-semibold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    বাকি খাতা সতর্কতা
                  </p>
                  <p className="text-[11px] mt-1 text-amber-700">
                    সর্বমোট {tenant.currency}{netTotal.toFixed(2)} টাকা সরাসরি গ্রাহকের বাকি খাতায় জমা হবে। গ্রাহকের নাম ও ফোন নম্বর নিশ্চিত করুন।
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCheckoutModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition"
                >
                  বাতিল
                </button>
                <button
                  type="button"
                  onClick={handleProcessCheckout}
                  className="flex-2 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center justify-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" /> বিল সম্পন্ন ও মেমো প্রিন্ট
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Phase 15: Sunmi / iMin Customer-Facing Secondary Display Modal */}
      <CustomerFacingDisplayModal
        isOpen={isCfdOpen}
        onClose={() => setIsCfdOpen(false)}
        tenant={tenant}
        cartItems={cart.map(item => ({
          id: item.product.id,
          name: item.product.name,
          price: getProductPrice(item.product),
          quantity: item.quantity,
          total: getProductPrice(item.product) * item.quantity,
          unit: item.product.unit,
        }))}
        subtotal={subtotal}
        discount={discountAmount + loyaltyDiscount}
        tax={taxAmount}
        grandTotal={netTotal}
        paidAmount={paidAmount}
        changeAmount={changeAmount}
        paymentMethod={paymentMethod}
        customer={selectedCustomer}
      />
    </div>
  );
};
