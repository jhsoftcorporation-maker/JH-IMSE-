import React, { useState, useMemo } from 'react';
import { 
  ShoppingBag, Search, MapPin, Phone, CheckCircle, ArrowLeft,
  Truck, ShieldCheck, Heart, Banknote, Filter, X, ArrowRight,
  Printer, Clock, PackageCheck, Send, CheckCircle2, AlertCircle,
  Star, SlidersHorizontal, Zap, ChevronDown, Sparkles, BadgePercent,
  Store, QrCode, Copy, RefreshCw, MessageSquare
} from 'lucide-react';
import { Tenant, Product, OnlineOrder, GlobalPlatformSettings } from '../types';

interface StorefrontViewProps {
  tenant: Tenant;
  tenants?: Tenant[];
  onSelectTenant?: (id: string) => void;
  products: Product[];
  onPlaceOnlineOrder: (order: OnlineOrder) => void;
  onBackToDashboard: () => void;
  orders?: OnlineOrder[];
  globalSettings?: GlobalPlatformSettings;
}

interface CustomerReview {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
  verifiedBuyer: boolean;
  productName?: string;
}

const BANGLADESH_DIVISIONS = [
  'ঢাকা (Dhaka)',
  'চট্টগ্রাম (Chattogram)',
  'রাজশাহী (Rajshahi)',
  'খুলনা (Khulna)',
  'বরিশাল (Barishal)',
  'সিলেট (Sylhet)',
  'রংপুর (Rangpur)',
  'ময়মনসিংহ (Mymensingh)'
];

const INITIAL_REVIEWS: CustomerReview[] = [
  {
    id: 'rev-1',
    name: 'তানভীর আহমেদ',
    rating: 5,
    comment: 'অর্ডার করার ২৪ ঘণ্টার মধ্যে স্টেডফাস্ট কুরিয়ারে পণ্য হাতে পেয়েছি। প্যাকেজিং খুবই ভালো ছিল এবং পণ্যটি ১০০% আসল!',
    date: '২ দিন আগে',
    verifiedBuyer: true,
    productName: 'প্যারাসিটামল ৫০০ মি.গ্রা. / প্রিমিয়াম আইটেম'
  },
  {
    id: 'rev-2',
    name: 'নুসরাত জাহান',
    rating: 5,
    comment: 'বিকাশ পেমেন্ট করে সাথে সাথেই কনফার্মেশন পেয়েছি। অনলাইন থেকে ওষুধ ও নিত্যপণ্য কেনার সেরা অভিজ্ঞতা।',
    date: '৪ দিন আগে',
    verifiedBuyer: true,
    productName: 'অর্গানিক সোয়াবিন তেল ২ লিটার'
  },
  {
    id: 'rev-3',
    name: 'মোঃ সাইদুল ইসলাম',
    rating: 4,
    comment: 'প্রোমো কোড JH10 দিয়ে ১০% ছাড় পেয়েছি। ডেলিভারি বয় খুব দ্রুত পৌছে দিয়েছে। ধন্যবাদ JH IMSE!',
    date: '১ সপ্তাহ আগে',
    verifiedBuyer: true,
    productName: 'স্মার্ট ব্লুটুথ হেডসেট Pro'
  }
];

export const StorefrontView: React.FC<StorefrontViewProps> = ({
  tenant,
  tenants = [],
  onSelectTenant,
  products,
  onPlaceOnlineOrder,
  onBackToDashboard,
  orders = [],
  globalSettings,
}) => {
  // Navigation & Filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'popular' | 'price_asc' | 'price_desc' | 'rating'>('popular');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [showStoreSwitcher, setShowStoreSwitcher] = useState(false);

  // Cart & Drawer
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Quick View Product Modal State
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [quickViewQty, setQuickViewQty] = useState(1);
  
  // Coupon Code & Discount Engine
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; label: string } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccessToast, setCouponSuccessToast] = useState<string | null>(null);

  // Checkout Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerDivision, setCustomerDivision] = useState('ঢাকা (Dhaka)');
  const [customerDistrict, setCustomerDistrict] = useState('ঢাকা');
  const [customerThana, setCustomerThana] = useState('ধানমন্ডি / গুলশান / মিরপুর');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [deliveryArea, setDeliveryArea] = useState<'inside_dhaka' | 'outside_dhaka' | 'pickup'>('inside_dhaka');
  const [courierPartner, setCourierPartner] = useState<'steadfast' | 'redx' | 'pathao' | 'in_house'>('steadfast');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bkash' | 'nagad'>('cod');
  const [senderPhone, setSenderPhone] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [isOrderSubmitted, setIsOrderSubmitted] = useState<OnlineOrder | null>(null);

  // Order Tracking Modal State
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [trackingQuery, setTrackingQuery] = useState('');
  const [trackedOrder, setTrackedOrder] = useState<OnlineOrder | null>(null);
  const [trackingNotFound, setTrackingNotFound] = useState(false);

  // Customer Reviews State
  const [reviews, setReviews] = useState<CustomerReview[]>(INITIAL_REVIEWS);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newReviewName, setNewReviewName] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');

  // Products available for online store
  const onlineProducts = useMemo(() => {
    return products.filter(p => p.tenantId === tenant.id && (p.showInOnlineStore !== false));
  }, [products, tenant.id]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    onlineProducts.forEach(p => cats.add(p.category));
    return ['All', ...Array.from(cats)];
  }, [onlineProducts]);

  const filteredProducts = useMemo(() => {
    let result = onlineProducts.filter(p => {
      if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
      if (inStockOnly && p.stock <= 0) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return p.name.toLowerCase().includes(q) || 
               (p.genericName && p.genericName.toLowerCase().includes(q)) || 
               p.sku.toLowerCase().includes(q);
      }
      return true;
    });

    // Sorting
    if (sortBy === 'price_asc') {
      result.sort((a, b) => a.sellingPrice - b.sellingPrice);
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => b.sellingPrice - a.sellingPrice);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.stock - a.stock); // Proxy for high availability
    }
    return result;
  }, [onlineProducts, selectedCategory, searchQuery, inStockOnly, sortBy]);

  const totalCartCount = cart.reduce((acc, i) => acc + i.quantity, 0);
  const totalCartAmount = cart.reduce((acc, i) => acc + (i.product.sellingPrice * i.quantity), 0);
  
  // Delivery Fee & Coupon calculation
  const insideFee = tenant.insideDhakaDeliveryFee || 60;
  const outsideFee = tenant.outsideDhakaDeliveryFee || 120;
  const baseDeliveryFee = deliveryArea === 'pickup' ? 0 : deliveryArea === 'inside_dhaka' ? insideFee : outsideFee;
  const isFreeShipEligible = totalCartAmount >= 1000 || appliedCoupon?.code === 'FREESHIP';
  const deliveryFee = deliveryArea === 'pickup' || isFreeShipEligible ? 0 : baseDeliveryFee;
  const couponDiscount = appliedCoupon ? (appliedCoupon.code === 'FREESHIP' ? 0 : appliedCoupon.discount) : 0;
  const grandTotal = Math.max(0, totalCartAmount - couponDiscount + (cart.length > 0 ? deliveryFee : 0));

  // Apply Coupon Code
  const handleApplyCouponCode = (codeToApply?: string) => {
    const code = (codeToApply || couponInput).trim().toUpperCase();
    if (!code) return;
    if (code === 'JH10' || code === 'JHCOMMERCE') {
      const disc = Math.round(totalCartAmount * 0.1);
      setAppliedCoupon({ code, discount: disc, label: '১০% বিশেষ ফ্ল্যাট ছাড়' });
      setCouponError(null);
      setCouponInput('');
      setCouponSuccessToast('🎉 ১০% ডিসকাউন্ট সক্রিয় হয়েছে!');
      setTimeout(() => setCouponSuccessToast(null), 3000);
    } else if (code === 'EID50') {
      const disc = Math.min(50, totalCartAmount);
      setAppliedCoupon({ code, discount: disc, label: '৳৫০ ঈদ উপহার ছাড়' });
      setCouponError(null);
      setCouponInput('');
      setCouponSuccessToast('🎉 ৳৫০ ঈদ অফার ছাড় সক্রিয় হয়েছে!');
      setTimeout(() => setCouponSuccessToast(null), 3000);
    } else if (code === 'FREESHIP') {
      setAppliedCoupon({ code, discount: baseDeliveryFee, label: 'ফ্রি হোম ডেলিভারি অফার' });
      setCouponError(null);
      setCouponInput('');
      setCouponSuccessToast('🚚 ফ্রি হোম ডেলিভারি সক্রিয় হয়েছে!');
      setTimeout(() => setCouponSuccessToast(null), 3000);
    } else {
      setCouponError('ভুল কুপন কোড! সক্রিয় কোড: JH10, EID50, FREESHIP');
      setTimeout(() => setCouponError(null), 3500);
    }
  };

  const handleAddToCart = (product: Product, quantityToAdd: number = 1) => {
    if (product.stock <= 0) return;
    setCart(prev => {
      const exist = prev.find(i => i.product.id === product.id);
      if (exist) {
        const nextQty = Math.min(product.stock, exist.quantity + quantityToAdd);
        return prev.map(i => i.product.id === product.id ? { ...i, quantity: nextQty } : i);
      }
      return [...prev, { product, quantity: Math.min(product.stock, quantityToAdd) }];
    });
  };

  // Instant Buy Now (Adds item and opens cart drawer directly)
  const handleBuyNow = (product: Product) => {
    handleAddToCart(product, 1);
    setIsCartOpen(true);
  };

  const handleUpdateQty = (productId: string, delta: number) => {
    setCart(prev => {
      return prev.map(i => {
        if (i.product.id === productId) {
          const nQty = i.quantity + delta;
          if (nQty <= 0) return null;
          if (nQty > i.product.stock) return i;
          return { ...i, quantity: nQty };
        }
        return i;
      }).filter(Boolean) as { product: Product; quantity: number }[];
    });
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !customerAddress || cart.length === 0) {
      alert('দয়া করে আপনার নাম, মোবাইল নম্বর এবং সম্পূর্ণ ঠিকানা পূরণ করুন');
      return;
    }

    if (paymentMethod !== 'cod' && !transactionId.trim()) {
      alert('অনলাইন পেমেন্ট সম্পন্ন করে TrxID (Transaction ID) প্রদান করুন');
      return;
    }

    const fullFormattedAddress = `${customerAddress.trim()}, থানা: ${customerThana}, জেলা: ${customerDistrict}, বিভাগ: ${customerDivision}`;

    const newOrder: OnlineOrder = {
      id: 'ord-' + Date.now(),
      orderNumber: 'WEB-' + Math.floor(1000 + Math.random() * 9000),
      tenantId: tenant.id,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim() || undefined,
      customerAddress: fullFormattedAddress,
      customerNotes: customerNotes.trim() ? `${customerNotes.trim()} (কুরিয়ার পছন্দ: ${courierPartner.toUpperCase()})` : `কুরিয়ার: ${courierPartner.toUpperCase()}`,
      items: cart.map(i => ({
        productId: i.product.id,
        productName: i.product.name,
        price: i.product.sellingPrice,
        quantity: i.quantity,
        unit: i.product.unit,
        sku: i.product.sku,
      })),
      subtotal: totalCartAmount,
      deliveryFee,
      totalAmount: grandTotal,
      deliveryArea,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'cod' : 'paid',
      transactionId: transactionId.trim() || undefined,
      senderPhone: senderPhone.trim() || undefined,
      status: 'pending',
      courierPartner: courierPartner,
      createdAt: new Date().toLocaleString('en-GB'),
    };

    onPlaceOnlineOrder(newOrder);
    setIsOrderSubmitted(newOrder);
    setCart([]);
    setIsCartOpen(false);
  };

  const handleSearchOrderTracking = (e: React.FormEvent) => {
    e.preventDefault();
    const q = trackingQuery.trim().toLowerCase();
    if (!q) return;

    const found = orders.find(o => 
      o.orderNumber.toLowerCase() === q ||
      o.customerPhone.includes(q)
    );

    if (found) {
      setTrackedOrder(found);
      setTrackingNotFound(false);
    } else {
      setTrackedOrder(null);
      setTrackingNotFound(true);
    }
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewName.trim() || !newReviewComment.trim()) return;

    const rev: CustomerReview = {
      id: 'rev-' + Date.now(),
      name: newReviewName.trim(),
      rating: newReviewRating,
      comment: newReviewComment.trim(),
      date: 'আজ মাত্র',
      verifiedBuyer: true,
      productName: tenant.name + ' স্টোর কাস্টমার'
    };
    setReviews(prev => [rev, ...prev]);
    setShowReviewModal(false);
    setNewReviewName('');
    setNewReviewComment('');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans pb-16 text-slate-800">
      {/* ============================================================== */}
      {/* 1. TOP PROMOTIONAL MARQUEE TICKER & COUPON BAR */}
      {/* ============================================================== */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-950 to-purple-900 text-white text-xs px-4 py-2 border-b border-purple-800 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto text-[11px] font-medium scrollbar-none">
          <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] uppercase flex items-center gap-1 shrink-0">
            <Sparkles className="w-3 h-3 text-slate-950" /> বিশেষ অফার
          </span>
          <span className="text-purple-200">
            🔥 কুপন কোড <button onClick={() => handleApplyCouponCode('JH10')} className="font-mono font-bold text-amber-300 underline cursor-pointer hover:text-white">JH10</button> দিয়ে ১০% ফ্ল্যাট ছাড়!
          </span>
          <span className="text-purple-400">•</span>
          <span className="text-purple-200">
            🎁 কোড <button onClick={() => handleApplyCouponCode('EID50')} className="font-mono font-bold text-amber-300 underline cursor-pointer hover:text-white">EID50</button> দিয়ে ৳৫০ ছাড়!
          </span>
          <span className="text-purple-400">•</span>
          <span className="text-purple-200">
            🚚 ৳১০০০+ কেনাকাটায় <button onClick={() => handleApplyCouponCode('FREESHIP')} className="font-mono font-bold text-emerald-300 underline cursor-pointer hover:text-white">FREESHIP</button> দিয়ে ফ্রি হোম ডেলিভারি!
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0 text-[11px]">
          <span className="hidden md:flex items-center gap-1 text-slate-300">
            <Phone className="w-3.5 h-3.5 text-purple-400" /> হেল্পলাইন: <strong>{globalSettings?.helplinePhone || '+8801940999830'}</strong>
          </span>

          <button
            onClick={() => setIsTrackingModalOpen(true)}
            className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-purple-200 rounded-lg font-bold flex items-center gap-1 transition"
          >
            <Truck className="w-3.5 h-3.5 text-amber-400" /> লাইভ অর্ডার ট্র্যাকিং
          </button>

          <button
            onClick={onBackToDashboard}
            className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold flex items-center gap-1 transition shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> স্টোর ERP ড্যাশবোর্ড
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. STORE HEADER & MULTI-STORE SWITCHER */}
      {/* ============================================================== */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* Store Info & Multi-Shop Switcher */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-purple-700 text-white flex items-center justify-center font-bold text-xl shadow-md shrink-0">
              {tenant.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-base text-slate-900 leading-tight">
                  {tenant.name}
                </h1>
                {tenants.length > 1 && onSelectTenant && (
                  <button
                    onClick={() => setShowStoreSwitcher(!showStoreSwitcher)}
                    className="p-1 rounded-lg hover:bg-purple-50 text-purple-700 transition flex items-center text-[11px] font-bold gap-0.5 border border-purple-200"
                    title="অন্য দোকানে সুইচ করুন"
                  >
                    <Store className="w-3 h-3 text-purple-700" />
                    <span className="hidden sm:inline">দোকান পরিবর্তন</span>
                    <ChevronDown className="w-3 h-3 text-purple-700" />
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3 text-slate-400" /> {tenant.address}</span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:flex items-center gap-0.5 text-purple-700 font-semibold font-mono">
                  {tenant.customDomain || `${tenant.slug}.jh-imse.shop`}
                </span>
              </p>
            </div>
          </div>

          {/* Search, Filter & Cart Bar */}
          <div className="flex items-center gap-2.5">
            {/* Search Input */}
            <div className="relative hidden md:block w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="পণ্য বা ওষুধ খুঁজুন..."
                className="w-full pl-9 pr-3 py-2 bg-slate-100 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600 border border-transparent transition shadow-2xs"
              />
            </div>

            {/* Cart Trigger Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative px-3.5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl shadow-xs transition flex items-center gap-2 text-xs font-bold"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">শপিং ব্যাগ</span>
              {totalCartCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] shadow-xs">
                  {totalCartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="px-4 pb-3 md:hidden">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="পণ্য বা ওষুধ খুঁজুন..."
              className="w-full pl-9 pr-3 py-2 bg-slate-100 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>
        </div>

        {/* Multi-Store Switcher Modal / Dropdown */}
        {showStoreSwitcher && (
          <div className="border-t border-slate-200 bg-purple-50/90 p-4 max-w-6xl mx-auto animate-in slide-in-from-top-2">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                <Store className="w-4 h-4 text-purple-700" /> JH IMSE মাল্টি-স্টোর নির্বাচন করুন:
              </span>
              <button onClick={() => setShowStoreSwitcher(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
              {tenants.map(t => (
                <button
                  key={t.id}
                  onClick={() => {
                    if (onSelectTenant) onSelectTenant(t.id);
                    setShowStoreSwitcher(false);
                  }}
                  className={`p-3 rounded-xl border text-left transition flex items-start gap-2.5 ${
                    t.id === tenant.id
                      ? 'bg-purple-700 text-white border-purple-700 shadow-xs'
                      : 'bg-white hover:bg-purple-100 text-slate-800 border-purple-200'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                    t.id === tenant.id ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-800'
                  }`}>
                    {t.name.charAt(0)}
                  </div>
                  <div className="truncate flex-1">
                    <span className="font-bold text-xs block truncate leading-tight">{t.name}</span>
                    <span className={`text-[10px] block truncate mt-0.5 ${t.id === tenant.id ? 'text-purple-200' : 'text-slate-500'}`}>
                      {t.businessType === 'grocery' ? '🛒 মুদি ও সুপারশপ' :
                       t.businessType === 'pharmacy' ? '⚕️ মডেল ফার্মেসি' :
                       t.businessType === 'electronics' ? '⚡ গ্যাজেট ও ইলেকট্রনিক্স' : '📦 এগ্রো ও পাইকারি'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* ============================================================== */}
      {/* 3. STORE HERO BANNER */}
      {/* ============================================================== */}
      <div className="max-w-6xl mx-auto px-4 mt-4">
        <div className="bg-gradient-to-r from-purple-800 via-indigo-900 to-purple-950 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
          <div className="relative z-10 max-w-xl">
            <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-purple-200 text-xs font-bold mb-3 border border-white/10">
              {tenant.businessType === 'pharmacy' ? '⚕️ ১০০% প্রেসক্রিপশন ও আসল ওষুধের নিশ্চয়তা' : 
               tenant.businessType === 'grocery' ? '🛒 ফ্রেশ নিত্যপণ্য ও গ্রোসারি সুপার স্টোর' : 
               tenant.businessType === 'electronics' ? '⚡ গ্যাজেট ও অফিশিয়াল ওয়ারেন্টি হাব' : '🌟 অনুমোদিত এন্টারপ্রাইজ স্টোর'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{tenant.name}-এ স্বাগতম!</h2>
            <p className="text-xs sm:text-sm text-purple-200 mt-2 leading-relaxed">
              {tenant.storeBannerText || tenant.storeNotice || 'ঘরে বসেই অর্ডার করুন আপনার প্রয়োজনীয় পণ্য। দ্রুততম ডেলিভারি এবং ১০০% আসল পণ্যের নিশ্চয়তা।'}
            </p>
            <div className="flex flex-wrap gap-4 mt-5 text-xs text-purple-100 font-medium">
              <span className="flex items-center gap-1.5"><Truck className="w-4 h-4 text-emerald-400" /> সারা দেশে দ্রুততম হোম ডেলিভারি</span>
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-cyan-400" /> ১০০% অরিজিনাল ব্র্যান্ড</span>
              <span className="flex items-center gap-1.5"><Banknote className="w-4 h-4 text-emerald-400" /> ক্যাশ অন ডেলিভারি, বিকাশ ও নগদ</span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. PRODUCT CATALOG CONTROLS (Category Pills, Sorting, In-Stock) */}
      {/* ============================================================== */}
      <main className="max-w-6xl mx-auto px-4 mt-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none flex-1 min-w-0">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-purple-700 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort & In-Stock Only Filters */}
          <div className="flex items-center gap-2.5 shrink-0">
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 cursor-pointer bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={e => setInStockOnly(e.target.checked)}
                className="rounded text-purple-600 focus:ring-purple-500"
              />
              <span>শুধু ইন-স্টক</span>
            </label>

            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs text-xs">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="bg-transparent text-slate-800 font-bold focus:outline-none text-xs"
              >
                <option value="popular">জনপ্রিয়তা অনুযায়ী</option>
                <option value="price_asc">দাম: কম থেকে বেশি</option>
                <option value="price_desc">দাম: বেশি থেকে কম</option>
                <option value="rating">স্টক ও রেটিং অনুযায়ী</option>
              </select>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 5. PRODUCTS GRID */}
        {/* ============================================================== */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500 shadow-2xs">
            <ShoppingBag className="w-12 h-12 stroke-[1.2] mx-auto text-slate-300 mb-2" />
            <p className="font-bold text-slate-700 text-sm">কোনো পণ্য পাওয়া যায়নি</p>
            <p className="text-xs text-slate-400 mt-1">ক্যাটাগরি বা ফিল্টার পরিবর্তন করে পুনরায় দেখুন।</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredProducts.map(product => {
              const inCart = cart.find(i => i.product.id === product.id);
              const isOut = product.stock <= 0;

              return (
                <div
                  key={product.id}
                  onClick={() => {
                    setQuickViewProduct(product);
                    setQuickViewQty(1);
                  }}
                  className="bg-white rounded-3xl p-4 border border-slate-200 hover:border-purple-300 hover:shadow-lg transition flex flex-col justify-between cursor-pointer group relative"
                >
                  <div>
                    {/* Header: Category & In-Stock Badge */}
                    <div className="flex justify-between items-start gap-1 mb-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{product.category}</span>
                      {isOut ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold">স্টক শেষ</span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold">
                          স্টকে আছে ({product.stock})
                        </span>
                      )}
                    </div>

                    {/* Product Name */}
                    <h3 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-2 leading-snug group-hover:text-purple-700 transition">
                      {product.name}
                    </h3>

                    {/* Generic / Subtitle */}
                    {product.genericName && (
                      <p className="text-[11px] text-purple-700 font-semibold italic mt-0.5 truncate">
                        {product.genericName}
                      </p>
                    )}

                    {/* Rating & Warranty Stars */}
                    <div className="flex items-center gap-1.5 mt-2">
                      <div className="flex items-center text-amber-400">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span className="text-xs font-bold text-slate-700 ml-1">4.9</span>
                      </div>
                      <span className="text-[10px] text-slate-400">(২৪ রিভিউ)</span>
                    </div>

                    {product.warrantyMonths && (
                      <p className="text-[10px] text-indigo-600 font-semibold mt-1">
                        🛡️ {product.warrantyMonths} মাসের ওয়ারেন্টি
                      </p>
                    )}

                    {product.stock > 0 && product.stock <= 5 && (
                      <p className="text-[10px] text-amber-600 font-bold mt-1.5 animate-pulse">
                        ⚡ মাত্র {product.stock}টি বাকি - দ্রুত অর্ডার করুন!
                      </p>
                    )}
                  </div>

                  {/* Price & Action Buttons */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-base font-black text-purple-800">
                        {tenant.currency}{product.sellingPrice.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        প্রতি {product.unit}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(product);
                        }}
                        disabled={isOut}
                        className={`py-1.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
                          isOut
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : inCart
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-slate-100 hover:bg-purple-50 text-purple-900 border border-purple-200'
                        }`}
                      >
                        {inCart ? `কার্টে (${inCart.quantity})` : '+ কার্ট'}
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBuyNow(product);
                        }}
                        disabled={isOut}
                        className={`py-1.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
                          isOut
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-purple-700 hover:bg-purple-800 text-white shadow-xs'
                        }`}
                      >
                        <Zap className="w-3 h-3 text-amber-300" /> কিনুন
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ============================================================== */}
        {/* 6. CUSTOMER REVIEWS & SOCIAL PROOF */}
        {/* ============================================================== */}
        <section className="mt-12 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg text-slate-900">
                  গ্রাহক সন্তুষ্টি ও রিভিউ (Customer Reviews)
                </h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> ৪.৯ / ৫.০ রেটিং
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                সারা বাংলাদেশের যাচাইকৃত ক্রেতাদের বাস্তব মতামত ও অভিজ্ঞতা
              </p>
            </div>

            <button
              onClick={() => setShowReviewModal(true)}
              className="px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-xl text-xs font-bold transition border border-purple-200 flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5 text-purple-700" /> আপনার রিভিউ লিখুন
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {reviews.map(rev => (
              <div key={rev.id} className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">{rev.name}</span>
                    <span className="text-[10px] text-slate-400">{rev.date}</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">
                    &quot;{rev.comment}&quot;
                  </p>
                </div>
                {rev.verifiedBuyer && (
                  <div className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 pt-2 border-t border-slate-200/60">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> যাচাইকৃত ক্রেতা (Verified Buyer)
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* ============================================================== */}
      {/* 7. CART & CHECKOUT SLIDE-OVER DRAWER */}
      {/* ============================================================== */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-4 bg-purple-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-sm">আপনার অনলাইন শপিং ব্যাগ ({totalCartCount})</h3>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 text-purple-200 hover:text-white rounded-lg hover:bg-purple-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Free Shipping Progress Meter */}
            <div className="bg-purple-50 px-4 py-2.5 border-b border-purple-100">
              <div className="flex items-center justify-between text-xs font-bold text-purple-900 mb-1.5">
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-purple-700" />
                  {isFreeShipEligible
                    ? '🎉 অভিনন্দন! আপনার অর্ডারে ফ্রি ডেলিভারি যুক্ত হয়েছে!'
                    : `৳${Math.max(0, 1000 - totalCartAmount)} টাকার কেনাকাটা করলেই ফ্রি হোম ডেলিভারি!`}
                </span>
                <span>{Math.min(100, Math.round((totalCartAmount / 1000) * 100))}%</span>
              </div>
              <div className="w-full bg-purple-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-purple-700 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${Math.min(100, (totalCartAmount / 1000) * 100)}%` }}
                />
              </div>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <div className="py-16 text-center text-slate-400">
                  <ShoppingBag className="w-12 h-12 stroke-[1.2] mx-auto text-slate-300 mb-2" />
                  <p className="font-bold text-slate-600 text-sm">আপনার কার্ট খালি রয়েছে</p>
                  <p className="text-xs text-slate-400 mt-1">পণ্য ব্রাউজ করে ব্যাগে যোগ করুন</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map(item => (
                    <div key={item.product.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-xs text-slate-900 truncate">{item.product.name}</h4>
                        <span className="text-[11px] font-extrabold text-purple-700 block">
                          {tenant.currency}{item.product.sellingPrice.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-xl border border-slate-200 shrink-0">
                        <button
                          onClick={() => handleUpdateQty(item.product.id, -1)}
                          className="w-5 h-5 rounded flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                        >
                          -
                        </button>
                        <span className="w-6 text-center font-bold text-xs">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQty(item.product.id, 1)}
                          disabled={item.quantity >= item.product.stock}
                          className="w-5 h-5 rounded flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold disabled:opacity-40"
                        >
                          +
                        </button>
                      </div>

                      <span className="font-mono font-bold text-xs text-slate-900 shrink-0">
                        {tenant.currency}{(item.product.sellingPrice * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Checkout Form if cart has items */}
              {cart.length > 0 && (
                <form onSubmit={handleCheckoutSubmit} className="pt-4 border-t border-slate-200 space-y-3 text-xs">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-purple-700" /> ডেলিভারি ও কাস্টমার তথ্য
                  </h4>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">আপনার নাম: *</label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={e => setCustomerName(e.target.value)}
                        placeholder="যেমন: মোঃ সাকিব হোসেন"
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">মোবাইল নম্বর: *</label>
                      <input
                        type="tel"
                        required
                        value={customerPhone}
                        onChange={e => setCustomerPhone(e.target.value)}
                        placeholder="018XXXXXXXX"
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Division, District, Thana */}
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-700 block mb-1">বিভাগ: *</label>
                      <select
                        value={customerDivision}
                        onChange={e => setCustomerDivision(e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-200 rounded-xl text-xs bg-white font-medium"
                      >
                        {BANGLADESH_DIVISIONS.map(div => (
                          <option key={div} value={div}>{div}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-700 block mb-1">জেলা: *</label>
                      <input
                        type="text"
                        required
                        value={customerDistrict}
                        onChange={e => setCustomerDistrict(e.target.value)}
                        placeholder="যেমন: ঢাকা / সিলেট"
                        className="w-full px-2 py-1.5 border border-slate-200 rounded-xl text-xs bg-white"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-700 block mb-1">থানা / উপজেলা: *</label>
                      <input
                        type="text"
                        required
                        value={customerThana}
                        onChange={e => setCustomerThana(e.target.value)}
                        placeholder="থানার নাম"
                        className="w-full px-2 py-1.5 border border-slate-200 rounded-xl text-xs bg-white"
                      />
                    </div>
                  </div>

                  {/* Detailed Street Address */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">বিস্তারিত ডেলিভারি ঠিকানা (বাসা/রোড/এলাকা): *</label>
                    <textarea
                      required
                      rows={2}
                      value={customerAddress}
                      onChange={e => setCustomerAddress(e.target.value)}
                      placeholder="বাড়ি নং, রোড নং, ফ্ল্যাট বা নিকটবর্তী ল্যান্ডমার্ক..."
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none"
                    />
                  </div>

                  {/* Delivery Area Radio */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">ডেলিভারি এরিয়া নির্বাচন করুন: *</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setDeliveryArea('inside_dhaka')}
                        className={`p-2 rounded-xl border text-[11px] font-semibold transition text-left ${
                          deliveryArea === 'inside_dhaka'
                            ? 'border-purple-600 bg-purple-50 text-purple-900 ring-1 ring-purple-500/20'
                            : 'border-slate-200 bg-white text-slate-700'
                        }`}
                      >
                        <div className="font-bold">ঢাকা সিটি</div>
                        <div className="text-[10px] text-slate-500">চার্জ: ৳{insideFee}</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeliveryArea('outside_dhaka')}
                        className={`p-2 rounded-xl border text-[11px] font-semibold transition text-left ${
                          deliveryArea === 'outside_dhaka'
                            ? 'border-purple-600 bg-purple-50 text-purple-900 ring-1 ring-purple-500/20'
                            : 'border-slate-200 bg-white text-slate-700'
                        }`}
                      >
                        <div className="font-bold">ঢাকার বাইরে</div>
                        <div className="text-[10px] text-slate-500">চার্জ: ৳{outsideFee}</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeliveryArea('pickup')}
                        className={`p-2 rounded-xl border text-[11px] font-semibold transition text-left ${
                          deliveryArea === 'pickup'
                            ? 'border-purple-600 bg-purple-50 text-purple-900 ring-1 ring-purple-500/20'
                            : 'border-slate-200 bg-white text-slate-700'
                        }`}
                      >
                        <div className="font-bold">আউটলেট পিকআপ</div>
                        <div className="text-[10px] text-emerald-600 font-bold">৳০ (ফ্রি)</div>
                      </button>
                    </div>
                  </div>

                  {/* Courier Partner Selection */}
                  {deliveryArea !== 'pickup' && (
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">পছন্দের কুরিয়ার সার্ভিস:</label>
                      <div className="grid grid-cols-4 gap-1.5">
                        {[
                          { id: 'steadfast' as const, label: 'Steadfast', eta: '২৪-৪৮ ঘণ্টা' },
                          { id: 'redx' as const, label: 'RedX', eta: '৪৮ ঘণ্টা' },
                          { id: 'pathao' as const, label: 'Pathao', eta: '২৪ ঘণ্টা' },
                          { id: 'in_house' as const, label: 'নিজস্ব রাইডার', eta: 'সেম ডে' },
                        ].map(c => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setCourierPartner(c.id)}
                            className={`p-1.5 rounded-xl border text-center transition ${
                              courierPartner === c.id
                                ? 'bg-purple-700 text-white border-purple-700 shadow-xs'
                                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            <span className="block text-[11px] font-bold">{c.label}</span>
                            <span className={`block text-[9px] ${courierPartner === c.id ? 'text-purple-200' : 'text-slate-400'}`}>
                              {c.eta}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Coupon Code Section */}
                  <div className="pt-2 border-t border-slate-200">
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">ডিসকাউন্ট কুপন কোড:</label>
                    {appliedCoupon ? (
                      <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs font-bold text-emerald-800">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          <span>সক্রিয় কুপন: <strong>{appliedCoupon.code}</strong> ({appliedCoupon.label} - ৳{appliedCoupon.discount})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setAppliedCoupon(null)}
                          className="text-[10px] text-rose-600 hover:text-rose-800 font-bold px-1.5 py-0.5 rounded bg-rose-100 hover:bg-rose-200 transition"
                        >
                          মুছুন ✕
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          placeholder="যেমন: JH10, EID50, FREESHIP"
                          value={couponInput}
                          onChange={e => setCouponInput(e.target.value)}
                          className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold uppercase focus:ring-1 focus:ring-purple-600 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleApplyCouponCode()}
                          className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
                        >
                          প্রয়োগ
                        </button>
                      </div>
                    )}
                    {couponError && (
                      <p className="text-[10px] text-rose-600 font-bold mt-1">{couponError}</p>
                    )}
                    {couponSuccessToast && (
                      <p className="text-[10px] text-emerald-600 font-bold mt-1">{couponSuccessToast}</p>
                    )}
                  </div>

                  {/* Payment Method Selector */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">পেমেন্ট মাধ্যম বেছে নিন: *</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('cod')}
                        className={`py-2 rounded-xl border text-xs font-bold transition ${
                          paymentMethod === 'cod' ? 'bg-purple-700 text-white border-purple-700' : 'bg-white text-slate-700 border-slate-200'
                        }`}
                      >
                        ক্যাশ অন ডেলিভারি
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('bkash')}
                        className={`py-2 rounded-xl border text-xs font-bold transition ${
                          paymentMethod === 'bkash' ? 'bg-pink-600 text-white border-pink-600' : 'bg-white text-slate-700 border-slate-200'
                        }`}
                      >
                        বিকাশ (bKash)
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('nagad')}
                        className={`py-2 rounded-xl border text-xs font-bold transition ${
                          paymentMethod === 'nagad' ? 'bg-orange-600 text-white border-orange-600' : 'bg-white text-slate-700 border-slate-200'
                        }`}
                      >
                        নগদ (Nagad)
                      </button>
                    </div>
                  </div>

                  {/* bKash / Nagad Payment Instructions */}
                  {paymentMethod !== 'cod' && (
                    <div className="p-3 bg-pink-50/90 rounded-2xl border border-pink-200 space-y-2 text-xs">
                      <p className="font-bold text-pink-900 flex items-center gap-1.5">
                        <QrCode className="w-4 h-4 text-pink-700" />
                        {paymentMethod === 'bkash' ? 'বিকাশ মার্চেন্ট পেমেন্ট নির্দেশনা:' : 'নগদ মার্চেন্ট পেমেন্ট নির্দেশনা:'}
                      </p>
                      <p className="text-[11px] text-pink-800 leading-relaxed">
                        আমাদের অফিসিয়াল মার্চেন্ট/ব্যক্তিগত নম্বর: <strong className="font-mono text-pink-950">{tenant.phone || '01940999830'}</strong> নম্বরে <strong>৳{grandTotal.toFixed(2)}</strong> টাকা পাঠান এবং ট্রানজেকশন আইডি (TrxID) দিন:
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="tel"
                          required
                          placeholder="প্রেরকের নম্বর *"
                          value={senderPhone}
                          onChange={e => setSenderPhone(e.target.value)}
                          className="px-2.5 py-1.5 bg-white border border-pink-300 rounded-xl text-xs"
                        />
                        <input
                          type="text"
                          required
                          placeholder="TrxID (যেমন: 9J83KX91) *"
                          value={transactionId}
                          onChange={e => setTransactionId(e.target.value)}
                          className="px-2.5 py-1.5 bg-white border border-pink-300 rounded-xl text-xs font-mono font-bold uppercase"
                        />
                      </div>
                    </div>
                  )}

                  {/* Billing Breakdown */}
                  <div className="pt-2 border-t border-slate-200 space-y-1.5 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>পণ্যের দাম ({totalCartCount} টি আইটেম):</span>
                      <span className="font-semibold text-slate-800">{tenant.currency}{totalCartAmount.toFixed(2)}</span>
                    </div>
                    {couponDiscount > 0 && (
                      <div className="flex justify-between text-emerald-700 font-bold">
                        <span>কুপন ডিসকাউন্ট ({appliedCoupon?.code}):</span>
                        <span>-{tenant.currency}{couponDiscount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>ডেলিভারি চার্জ:</span>
                      <span className="font-semibold text-slate-800">{deliveryFee === 0 ? 'ফ্রি (৳০)' : `${tenant.currency}${deliveryFee.toFixed(2)}`}</span>
                    </div>
                    <div className="flex justify-between text-sm font-black text-slate-900 pt-1.5 border-t border-slate-200">
                      <span>সর্বমোট প্রদেয় বিল:</span>
                      <span className="text-purple-700 text-base">{tenant.currency}{grandTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-purple-700 hover:bg-purple-800 text-white font-black rounded-2xl text-xs shadow-md transition flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4 text-amber-300" />
                    অর্ডার নিশ্চিত করুন ({tenant.currency}{grandTotal.toFixed(2)})
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 8. ORDER CONFIRMED SUCCESS MODAL */}
      {/* ============================================================== */}
      {isOrderSubmitted && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl border border-purple-100 animate-in zoom-in-95 duration-200 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">ধন্যবাদ, আপনার অর্ডার গৃহীত হয়েছে!</h3>
              <p className="text-xs text-slate-500 mt-1">
                অর্ডার ট্র্যাকিং কোড: <strong className="text-purple-700 font-mono text-base">{isOrderSubmitted.orderNumber}</strong>
              </p>
            </div>

            <div className="p-3 bg-purple-50 rounded-2xl border border-purple-100 text-left text-xs space-y-1">
              <div className="flex justify-between text-slate-600">
                <span>গ্রাহক:</span>
                <span className="font-bold text-slate-900">{isOrderSubmitted.customerName}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>মোট বিল:</span>
                <span className="font-bold text-purple-700">{tenant.currency}{isOrderSubmitted.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>পেমেন্ট:</span>
                <span className="font-bold text-slate-900 uppercase">{isOrderSubmitted.paymentMethod}</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => window.print()}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" /> অর্ডার স্লিপ প্রিন্ট করুন
              </button>
              <button
                onClick={() => {
                  setIsOrderSubmitted(null);
                  onBackToDashboard();
                }}
                className="w-full py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                ERP ড্যাশবোর্ডে গিয়ে নতুন অর্ডারটি দেখুন <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOrderSubmitted(null)}
                className="w-full py-2 text-slate-500 hover:text-slate-800 text-xs font-semibold"
              >
                আরও কেনাকাটা করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 9. CUSTOMER LIVE ORDER TRACKING MODAL */}
      {/* ============================================================== */}
      {isTrackingModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-purple-700" />
                <h3 className="font-black text-sm text-slate-900">আপনার অর্ডার ট্র্যাক করুন</h3>
              </div>
              <button onClick={() => setIsTrackingModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSearchOrderTracking} className="flex gap-2">
              <input
                type="text"
                required
                value={trackingQuery}
                onChange={e => setTrackingQuery(e.target.value)}
                placeholder="অর্ডার নং (যেমন WEB-9821) বা মোবাইল..."
                className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-600 outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                খুঁজুন
              </button>
            </form>

            {trackingNotFound && (
              <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs text-center border border-rose-200">
                ⚠️ এই নম্বরে কোনো অর্ডারের তথ্য পাওয়া যায়নি। সঠিক অর্ডার নং বা মোবাইল নম্বর দিন।
              </div>
            )}

            {trackedOrder && (
              <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 space-y-3 text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono font-bold text-purple-700">{trackedOrder.orderNumber}</span>
                    <h4 className="font-bold text-slate-900 mt-0.5">{trackedOrder.customerName}</h4>
                    <p className="text-[11px] text-slate-500">তারিখ: {trackedOrder.createdAt}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      trackedOrder.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                      trackedOrder.status === 'packing' ? 'bg-indigo-100 text-indigo-800' :
                      trackedOrder.status === 'shipped' ? 'bg-orange-100 text-orange-800' :
                      'bg-emerald-100 text-emerald-800'
                    }`}>
                      {trackedOrder.status}
                    </span>
                    <div className="font-mono font-bold text-purple-900 mt-1">
                      {tenant.currency}{trackedOrder.totalAmount.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* 5-Step Progress Timeline */}
                <div className="pt-2 border-t border-purple-200 space-y-2 text-[11px]">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>১. অর্ডার সিস্টেমে গৃহীত হয়েছে</span>
                  </div>
                  <div className={`flex items-center gap-2 ${
                    trackedOrder.status !== 'pending' ? 'text-emerald-700 font-bold' : 'text-slate-400'
                  }`}>
                    <CheckCircle2 className={`w-4 h-4 shrink-0 ${trackedOrder.status !== 'pending' ? 'text-emerald-600' : 'text-slate-300'}`} />
                    <span>২. গুদাম থেকে পণ্য প্যাকিং সম্পন্ন</span>
                  </div>
                  <div className={`flex items-center gap-2 ${
                    trackedOrder.status === 'shipped' || trackedOrder.status === 'delivered' ? 'text-emerald-700 font-bold' : 'text-slate-400'
                  }`}>
                    <CheckCircle2 className={`w-4 h-4 shrink-0 ${trackedOrder.status === 'shipped' || trackedOrder.status === 'delivered' ? 'text-emerald-600' : 'text-slate-300'}`} />
                    <span>৩. কুরিয়ারে হস্তান্তর ({trackedOrder.courierPartner?.toUpperCase() || 'STEADFAST'})</span>
                    {trackedOrder.courierTrackingId && (
                      <span className="font-mono font-bold text-orange-700">({trackedOrder.courierTrackingId})</span>
                    )}
                  </div>
                  <div className={`flex items-center gap-2 ${
                    trackedOrder.status === 'delivered' ? 'text-emerald-700 font-bold' : 'text-slate-400'
                  }`}>
                    <CheckCircle2 className={`w-4 h-4 shrink-0 ${trackedOrder.status === 'delivered' ? 'text-emerald-600' : 'text-slate-300'}`} />
                    <span>৪. কাস্টমার ডেলিভারি সম্পন্ন</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 10. PRODUCT QUICK VIEW MODAL */}
      {/* ============================================================== */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 animate-in zoom-in-95">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                {quickViewProduct.category}
              </span>
              <button onClick={() => setQuickViewProduct(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 leading-tight">
                  {quickViewProduct.name}
                </h3>
                {quickViewProduct.genericName && (
                  <p className="text-xs font-bold text-purple-700 mt-0.5">
                    জেনেরিক / উপাত্ত: {quickViewProduct.genericName}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xl font-black text-purple-800">
                    {tenant.currency}{quickViewProduct.sellingPrice.toFixed(2)}
                  </span>
                  <span className="text-xs text-slate-400">প্রতি {quickViewProduct.unit}</span>
                  {quickViewProduct.stock > 0 ? (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold ml-2">
                      ইন স্টক ({quickViewProduct.stock})
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold ml-2">
                      স্টক শেষ
                    </span>
                  )}
                </div>
              </div>

              {/* Specifications */}
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                {quickViewProduct.warrantyMonths && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">অফিসিয়াল ওয়ারেন্টি</span>
                    <span className="font-bold text-slate-900">🛡️ {quickViewProduct.warrantyMonths} মাস রিপ্লেসমেন্ট</span>
                  </div>
                )}
                {quickViewProduct.manufacturer && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">কোম্পানি / প্রস্তুতকারক</span>
                    <span className="font-bold text-slate-900">{quickViewProduct.manufacturer}</span>
                  </div>
                )}
                {quickViewProduct.sku && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">বারকোড / SKU</span>
                    <span className="font-mono font-bold text-slate-900">{quickViewProduct.sku}</span>
                  </div>
                )}
                {quickViewProduct.rackNumber && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">দোকানের সেলফ / রেক নং</span>
                    <span className="font-bold text-slate-900">{quickViewProduct.rackNumber}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {quickViewProduct.stock > 0 ? (
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">পরিমাণ:</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setQuickViewQty(Math.max(1, quickViewQty - 1))}
                        className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center justify-center transition"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-black text-sm text-slate-900">
                        {quickViewQty}
                      </span>
                      <button
                        onClick={() => setQuickViewQty(Math.min(quickViewProduct.stock, quickViewQty + 1))}
                        className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center justify-center transition"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => {
                        handleAddToCart(quickViewProduct, quickViewQty);
                        setQuickViewProduct(null);
                      }}
                      className="py-2.5 px-4 bg-purple-100 hover:bg-purple-200 text-purple-800 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5"
                    >
                      <ShoppingBag className="w-4 h-4" /> ব্যাগে যোগ করুন
                    </button>
                    <button
                      onClick={() => {
                        handleAddToCart(quickViewProduct, quickViewQty);
                        setQuickViewProduct(null);
                        setIsCartOpen(true);
                      }}
                      className="py-2.5 px-4 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center justify-center gap-1.5"
                    >
                      এখনই কিনুন (Checkout)
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-rose-50 text-rose-700 text-xs text-center font-bold rounded-xl border border-rose-200">
                  দুঃখিত, এই পণ্যটি বর্তমানে স্টক আউট। খুব শীঘ্রই পুনরায় আসবে।
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 11. WRITE REVIEW MODAL */}
      {/* ============================================================== */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> আপনার অভিজ্ঞতা শেয়ার করুন
              </h3>
              <button onClick={() => setShowReviewModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddReview} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">আপনার নাম: *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: তানভীর আহমেদ"
                  value={newReviewName}
                  onChange={e => setNewReviewName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">রেটিং (Star Rating):</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setNewReviewRating(st)}
                      className="p-1 hover:scale-110 transition"
                    >
                      <Star className={`w-6 h-6 ${st <= newReviewRating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-700 ml-2">{newReviewRating} স্টার</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">আপনার মূল্যবান মতামত: *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="পণ্যের গুণগত মান, ডেলিভারি ও সার্ভিস কেমন লেগেছে লিখুন..."
                  value={newReviewComment}
                  onChange={e => setNewReviewComment(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl text-xs transition shadow-xs"
              >
                রিভিউ সাবমিট করুন
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
