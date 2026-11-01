import React, { useState } from 'react';
import { 
  Sparkles, DollarSign, Globe, Monitor, Settings, 
  UserPlus, ChevronDown, Folder, Tag, Scan, Barcode,
  Trash2, Home, ShoppingCart, PauseCircle, Clock, Menu,
  Plus, Minus, CheckCircle2, ArrowLeft, Search, X
} from 'lucide-react';
import { Tenant, Product, Customer, Warehouse, Sale } from '../../types';
import { playCashDrawerClickSound, kickElectronicCashDrawer } from '../../utils/hardwareBridge';

interface MobilePOSViewProps {
  tenant: Tenant;
  products: Product[];
  customers: Customer[];
  warehouses: Warehouse[];
  activeWarehouseId: string;
  onSelectWarehouse: (whId: string) => void;
  onCompleteSale: (saleData: any) => void;
  onBackToDashboard: () => void;
  onOpenReceipt?: (sale: Sale) => void;
  onOpenA4Invoice?: (sale: Sale) => void;
  primaryColor?: string;
  onToggleDesktopMode?: () => void;
}

export const MobilePOSView: React.FC<MobilePOSViewProps> = ({
  tenant,
  products,
  customers,
  warehouses,
  activeWarehouseId,
  onSelectWarehouse,
  onCompleteSale,
  onBackToDashboard,
  onOpenReceipt,
  onOpenA4Invoice,
  primaryColor = '#663399',
  onToggleDesktopMode,
}) => {
  const [isRegisterOpen, setIsRegisterOpen] = useState(true);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('walk-in');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cartItems, setCartItems] = useState<{ product: Product; quantity: number }[]>([]);
  const [taxPercent, setTaxPercent] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [shippingFee, setShippingFee] = useState<number>(0);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [cashTendered, setCashTendered] = useState<number>(0);

  // Categories & Brands list
  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));
  const brands = Array.from(new Set(products.map(p => p.brand).filter(Boolean)));

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchesSearch = !searchQuery || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ((p as any).barcode && (p as any).barcode.includes(searchQuery));
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesBrand = selectedBrand === 'all' || p.brand === selectedBrand;
    return matchesSearch && matchesCat && matchesBrand;
  });

  const cartSubtotal = cartItems.reduce((acc, item) => acc + (item.product.sellingPrice * item.quantity), 0);
  const taxAmount = (cartSubtotal * taxPercent) / 100;
  const cartTotal = Math.max(0, cartSubtotal + taxAmount + shippingFee - discountAmount);

  const handleAddToCart = (prod: Product) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.product.id === prod.id);
      if (existing) {
        return prev.map(i => i.product.id === prod.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { product: prod, quantity: 1 }];
    });
  };

  const handleUpdateQty = (prodId: string, delta: number) => {
    setCartItems(prev => prev.map(i => {
      if (i.product.id === prodId) {
        const nextQty = i.quantity + delta;
        return nextQty > 0 ? { ...i, quantity: nextQty } : null;
      }
      return i;
    }).filter(Boolean) as { product: Product; quantity: number }[]);
  };

  const handleFinishSale = () => {
    if (cartItems.length === 0) return;
    const customer = customers.find(c => c.id === selectedCustomerId);
    const newSale = {
      id: 'sale-' + Date.now(),
      invoiceNumber: 'POS-' + Math.floor(100000 + Math.random() * 900000),
      tenantId: tenant.id,
      warehouseId: activeWarehouseId === 'all' ? (warehouses[0]?.id || 'wh-1') : activeWarehouseId,
      customerId: selectedCustomerId === 'walk-in' ? undefined : selectedCustomerId,
      customerName: customer?.name || 'Walk-in Customer',
      customerPhone: customer?.phone || 'N/A',
      items: cartItems.map(i => ({
        productId: i.product.id,
        productName: i.product.name,
        sku: i.product.sku,
        price: i.product.sellingPrice,
        costPrice: i.product.costPrice,
        quantity: i.quantity,
        unit: i.product.unit || 'pcs',
        subtotal: i.product.sellingPrice * i.quantity,
      })),
      subtotal: cartSubtotal,
      tax: taxAmount,
      discount: discountAmount,
      totalAmount: cartTotal,
      paidAmount: cartTotal,
      dueAmount: 0,
      changeAmount: Math.max(0, cashTendered - cartTotal),
      paymentMethod: 'cash',
      cashierId: 'cashier-1',
      date: new Date().toISOString(),
      status: 'completed',
    };

    playCashDrawerClickSound();
    kickElectronicCashDrawer(2);
    onCompleteSale(newSale);
    setCartItems([]);
    setShowCheckoutModal(false);
    if (onOpenReceipt) {
      onOpenReceipt(newSale as any);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20 select-none">
      {/* 1. TOP HEADER (Replicating Screenshot faaf2ca1) */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-100 px-4 py-2.5 flex items-center justify-between shadow-xs">
        {/* Left purple floral / back icon */}
        <div className="flex items-center gap-2">
          <button
            onClick={onBackToDashboard}
            className="w-9 h-9 rounded-xl bg-purple-50 text-[#663399] flex items-center justify-center hover:bg-purple-100 transition"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div 
            style={{ backgroundColor: primaryColor }}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-xs"
          >
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        {/* Right action group */}
        <div className="flex items-center gap-2">
          <button className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition">
            <DollarSign className="w-4 h-4" />
          </button>
          <button className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition">
            <Globe className="w-4 h-4" />
          </button>
          <button 
            onClick={onToggleDesktopMode || onBackToDashboard}
            className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition"
            title="Desktop Mode"
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition">
            <Settings className="w-4 h-4" />
          </button>
          {/* Stocky logo */}
          <div className="flex items-center gap-1 pl-1">
            <div style={{ color: primaryColor }} className="font-black text-lg tracking-tighter flex items-center">
              <span className="italic font-serif text-2xl font-black leading-none">$</span>
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block -ml-1 mt-3">STOCKY</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="p-4 space-y-3 max-w-md mx-auto">
        {/* Register Status Pill */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-slate-700">Register</span>
            <button
              onClick={() => setIsRegisterOpen(!isRegisterOpen)}
              className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 transition ${
                isRegisterOpen 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isRegisterOpen ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              <span>{isRegisterOpen ? 'OPEN' : 'CLOSED'}</span>
            </button>
          </div>
        </div>

        {/* Customer Selector Row */}
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-white rounded-2xl border border-slate-200 px-3 py-2 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2 truncate">
              <div className="w-7 h-7 rounded-full bg-emerald-500 text-white font-black text-xs flex items-center justify-center shrink-0">
                W
              </div>
              <select
                value={selectedCustomerId}
                onChange={e => setSelectedCustomerId(e.target.value)}
                className="text-xs font-semibold text-slate-700 bg-transparent border-none focus:outline-none w-full"
              >
                <option value="walk-in">walk-in-customer</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                ))}
              </select>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
          </div>

          <button className="w-11 h-11 rounded-2xl border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-100 shadow-xs">
            <UserPlus className="w-4 h-4" />
          </button>
        </div>

        {/* Select Warehouse Row */}
        <div className="bg-white rounded-2xl border border-slate-200 px-3.5 py-2.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-cyan-500 text-white flex items-center justify-center shrink-0">
              <Home className="w-4 h-4" />
            </div>
            <select
              value={activeWarehouseId}
              onChange={e => onSelectWarehouse(e.target.value)}
              className="text-xs font-semibold text-slate-700 bg-transparent border-none focus:outline-none"
            >
              <option value="all">Select Warehouse (All)</option>
              {warehouses.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </div>

        {/* Category & Brand Filters */}
        <div className="grid grid-cols-2 gap-2">
          {/* Categories */}
          <div className="bg-white rounded-2xl border border-slate-200 px-3 py-2 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2 truncate">
              <Folder className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="text-xs font-medium text-slate-700 bg-transparent border-none focus:outline-none truncate"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </div>

          {/* Brands */}
          <div className="bg-white rounded-2xl border border-slate-200 px-3 py-2 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2 truncate">
              <Tag className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={selectedBrand}
                onChange={e => setSelectedBrand(e.target.value)}
                className="text-xs font-medium text-slate-700 bg-transparent border-none focus:outline-none truncate"
              >
                <option value="all">All Brands</option>
                {brands.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </div>
        </div>

        {/* Search & Barcode Scan Bar */}
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-white rounded-2xl border border-slate-200 px-3.5 py-2.5 flex items-center gap-2 shadow-xs">
            <Scan className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Scan/Search Product by Code Or Name"
              className="text-xs text-slate-700 bg-transparent border-none focus:outline-none w-full"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')}>
                <X className="w-3.5 h-3.5 text-slate-400" />
              </button>
            )}
          </div>

          <button className="w-11 h-11 rounded-2xl border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-100 shadow-xs">
            <Barcode className="w-5 h-5" />
          </button>
        </div>

        {/* Product Catalog / Quick Add Tiles */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Available Items</span>
            <span className="text-[11px] text-slate-400">{filteredProducts.length} items</span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-slate-100 text-center flex flex-col items-center justify-center">
              <Search className="w-10 h-10 text-slate-300 stroke-[1.5] mb-2" />
              <p className="text-sm font-semibold text-slate-600">No products found</p>
              <span className="text-xs text-slate-400 mt-0.5">Try searching with a different term or clear filters</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {filteredProducts.slice(0, 10).map(p => (
                <button
                  key={p.id}
                  onClick={() => handleAddToCart(p)}
                  className="bg-white p-3 rounded-2xl border border-slate-200 text-left hover:border-purple-300 hover:shadow-sm active:scale-95 transition"
                >
                  <span className="font-bold text-xs text-slate-800 line-clamp-1 block">{p.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono block">{p.sku}</span>
                  <div className="flex items-center justify-between mt-1">
                    <strong className="text-xs font-black text-[#663399]">
                      {tenant.currency}{p.sellingPrice.toFixed(2)}
                    </strong>
                    <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-semibold">
                      Stock: {p.stock}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Current Cart Section */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-purple-50 text-[#663399] flex items-center justify-center">
                <ShoppingCart className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-xs text-slate-800">Current Cart</span>
                <span className="text-[10px] text-slate-400 block">{cartItems.length} items</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">TOTAL</span>
                <strong className="text-sm font-black text-[#663399]">
                  {tenant.currency} {cartTotal.toFixed(2)}
                </strong>
              </div>
              {cartItems.length > 0 && (
                <button
                  onClick={() => setCartItems([])}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Cart Items List */}
          {cartItems.length === 0 ? (
            <div className="py-6 text-center">
              <ShoppingCart className="w-8 h-8 text-slate-200 mx-auto mb-1.5" />
              <p className="text-xs font-semibold text-slate-600">No items added</p>
              <span className="text-[11px] text-slate-400">Select products from the panel above to add</span>
            </div>
          ) : (
            <div className="py-2 space-y-2 max-h-36 overflow-y-auto">
              {cartItems.map(item => (
                <div key={item.product.id} className="flex items-center justify-between py-1 border-b border-slate-50 text-xs">
                  <div className="truncate pr-2">
                    <span className="font-semibold text-slate-800 block truncate">{item.product.name}</span>
                    <span className="text-[10px] text-slate-400">{tenant.currency}{item.product.sellingPrice} x {item.quantity}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleUpdateQty(item.product.id, -1)}
                      className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-bold text-xs w-4 text-center">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQty(item.product.id, 1)}
                      className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tax, Discount & Shipping Row */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-[11px]">
            <div>
              <label className="text-slate-400 block font-medium mb-1">Tax %</label>
              <input
                type="number"
                value={taxPercent}
                onChange={e => setTaxPercent(Number(e.target.value) || 0)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-center font-bold focus:outline-none"
              />
            </div>
            <div>
              <label className="text-slate-400 block font-medium mb-1">Discount ({tenant.currency})</label>
              <input
                type="number"
                value={discountAmount}
                onChange={e => setDiscountAmount(Number(e.target.value) || 0)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-center font-bold focus:outline-none"
              />
            </div>
            <div>
              <label className="text-slate-400 block font-medium mb-1">Shipping ({tenant.currency})</label>
              <input
                type="number"
                value={shippingFee}
                onChange={e => setShippingFee(Number(e.target.value) || 0)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-center font-bold focus:outline-none"
              />
            </div>
          </div>

          {/* Pay Button */}
          {cartItems.length > 0 && (
            <button
              onClick={() => setShowCheckoutModal(true)}
              style={{ backgroundColor: primaryColor }}
              className="w-full mt-3 py-3 rounded-2xl text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 active:scale-98 transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Checkout • {tenant.currency}{cartTotal.toFixed(2)}</span>
            </button>
          )}
        </div>
      </main>

      {/* Checkout Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl animate-in slide-in-from-bottom duration-200">
            <h3 className="font-black text-base text-slate-800 mb-2">Complete Payment</h3>
            <p className="text-xs text-slate-500 mb-4">Total payable amount: <strong className="text-[#663399] font-black">{tenant.currency}{cartTotal.toFixed(2)}</strong></p>

            <div className="space-y-3 mb-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Cash Received ({tenant.currency})</label>
                <input
                  type="number"
                  value={cashTendered || ''}
                  onChange={e => setCashTendered(Number(e.target.value) || 0)}
                  placeholder={cartTotal.toString()}
                  className="w-full text-base font-bold px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#663399]"
                />
              </div>

              {cashTendered > cartTotal && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 font-semibold flex justify-between">
                  <span>Change to Return:</span>
                  <span>{tenant.currency}{(cashTendered - cartTotal).toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleFinishSale}
                style={{ backgroundColor: primaryColor }}
                className="flex-1 py-2.5 text-white font-bold rounded-xl text-xs shadow-md"
              >
                Confirm Sale
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. FIXED BOTTOM BAR (Replicating Screenshot faaf2ca1: Home, Cart, Hold, Recent, More) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-100 px-4 py-2 flex items-center justify-around shadow-lg">
        <button
          onClick={onBackToDashboard}
          className="flex flex-col items-center gap-0.5 text-[10px] font-semibold text-[#663399]"
        >
          <Home className="w-5 h-5 stroke-[2.2]" />
          <span>Home</span>
        </button>

        <button
          className="flex flex-col items-center gap-0.5 text-[10px] font-semibold text-slate-500"
        >
          <div className="relative">
            <ShoppingCart className="w-5 h-5 stroke-[2.2]" />
            {cartItems.length > 0 && (
              <span className="absolute -top-1 -right-2 bg-[#663399] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {cartItems.length}
              </span>
            )}
          </div>
          <span>Cart</span>
        </button>

        <button
          onClick={() => alert('Current cart has been put on hold.')}
          className="flex flex-col items-center gap-0.5 text-[10px] font-semibold text-slate-500"
        >
          <PauseCircle className="w-5 h-5 stroke-[2.2]" />
          <span>Hold</span>
        </button>

        <button
          onClick={() => alert('Showing recent sales transactions.')}
          className="flex flex-col items-center gap-0.5 text-[10px] font-semibold text-slate-500"
        >
          <Clock className="w-5 h-5 stroke-[2.2]" />
          <span>Recent</span>
        </button>

        <button
          onClick={onBackToDashboard}
          className="flex flex-col items-center gap-0.5 text-[10px] font-semibold text-slate-500"
        >
          <Menu className="w-5 h-5 stroke-[2.2]" />
          <span>More</span>
        </button>
      </nav>
    </div>
  );
};
