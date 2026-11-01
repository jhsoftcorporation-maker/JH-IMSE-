import React, { useState, useMemo } from 'react';
import { 
  ShoppingBag, Eye, Truck, CheckCircle2, Clock, PackageCheck, AlertCircle, 
  Search, Filter, Globe, ExternalLink, Printer, Settings, Check, X, 
  Send, DollarSign, MapPin, Phone, ShieldCheck
} from 'lucide-react';
import { Tenant, OnlineOrder, Product } from '../../types';
import { CourierBookingModal } from './CourierBookingModal';

interface ECommerceManagerProps {
  tenant: Tenant;
  orders: OnlineOrder[];
  products: Product[];
  onOpenStorefront: () => void;
  onUpdateOrderStatus: (orderId: string, status: OnlineOrder['status']) => void;
  onUpdateOrderCourier?: (
    orderId: string, 
    partner: 'steadfast' | 'redx' | 'pathao' | 'in_house', 
    trackingId: string
  ) => void;
  onUpdateStoreSettings?: (settings: {
    storeBannerText?: string;
    insideDhakaDeliveryFee?: number;
    outsideDhakaDeliveryFee?: number;
  }) => void;
}

export const ECommerceManager: React.FC<ECommerceManagerProps> = ({
  tenant,
  orders,
  products,
  onOpenStorefront,
  onUpdateOrderStatus,
  onUpdateOrderCourier,
  onUpdateStoreSettings,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderForCourier, setSelectedOrderForCourier] = useState<OnlineOrder | null>(null);
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<OnlineOrder | null>(null);

  // Storefront settings state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [bannerText, setBannerText] = useState(tenant.storeBannerText || '🎉 শুভ উদ্বোধন! অনলাইন অর্ডারে পাচ্ছেন ফ্রি হোম ডেলিভারি ও বিশেষ উপহার।');
  const [insideFee, setInsideFee] = useState((tenant.insideDhakaDeliveryFee || 60).toString());
  const [outsideFee, setOutsideFee] = useState((tenant.outsideDhakaDeliveryFee || 120).toString());

  // Filter orders by tenant
  const tenantOrders = useMemo(() => {
    return orders.filter(o => o.tenantId === tenant.id);
  }, [orders, tenant.id]);

  // Filtered orders
  const displayedOrders = useMemo(() => {
    return tenantOrders.filter(o => {
      const matchStatus = filterStatus === 'all' || o.status === filterStatus;
      const matchSearch = searchQuery === '' || 
        o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customerPhone.includes(searchQuery);
      return matchStatus && matchSearch;
    });
  }, [tenantOrders, filterStatus, searchQuery]);

  // Order Counts
  const pendingCount = tenantOrders.filter(o => o.status === 'pending').length;
  const packingCount = tenantOrders.filter(o => o.status === 'accepted' || o.status === 'packing').length;
  const shippedCount = tenantOrders.filter(o => o.status === 'shipped').length;
  const deliveredCount = tenantOrders.filter(o => o.status === 'delivered').length;
  const totalGMV = tenantOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateStoreSettings?.({
      storeBannerText: bannerText.trim(),
      insideDhakaDeliveryFee: parseFloat(insideFee) || 60,
      outsideDhakaDeliveryFee: parseFloat(outsideFee) || 120,
    });
    setIsSettingsOpen(false);
    alert('ই-কমার্স স্টোরফ্রন্ট সেটিংস সফলভাবে সংরক্ষিত হয়েছে!');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Storefront Preview Card */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[11px] font-bold text-purple-300 uppercase tracking-widest">
              লাইভ ই-কমার্স স্টোরফ্রন্ট ইঞ্জিন
            </span>
          </div>
          <h2 className="text-xl font-black mt-1 flex items-center gap-2">
            <span>{tenant.name} অনলাইন শপ</span>
          </h2>
          <p className="text-xs text-purple-200 mt-0.5 flex items-center gap-2 font-mono">
            <span>🌐 {tenant.customDomain || `${tenant.slug}.jh-imse.shop`}</span>
            {tenant.customDomain && (
              <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-sans font-bold">
                কাস্টম ডোমেইন সক্রিয় ✓
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
          >
            <Settings className="w-3.5 h-3.5" /> স্টোর ও ডেলিভারি সেটিংস
          </button>
          <button
            onClick={onOpenStorefront}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm"
          >
            <Eye className="w-4 h-4" /> লাইভ ওয়েবসাইট ভিজিট করুন
          </button>
        </div>
      </div>

      {/* Settings Panel Drawer */}
      {isSettingsOpen && (
        <form onSubmit={handleSaveSettings} className="bg-white p-5 rounded-3xl border border-purple-200 shadow-sm space-y-4 text-xs">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Settings className="w-4 h-4 text-purple-700" />
              অনলাইন স্টোর ও ডেলিভারি ফি কনফিগারেশন
            </h3>
            <button type="button" onClick={() => setIsSettingsOpen(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-3">
              <label className="font-semibold text-slate-700 block mb-1">ওয়েবসাইটের টপ অ্যানাউন্সমেন্ট ব্যানার:</label>
              <input
                type="text"
                value={bannerText}
                onChange={e => setBannerText(e.target.value)}
                placeholder="যেমন: ফ্রি হোম ডেলিভারি ও মেগা অফার..."
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">ঢাকা সিটির ভেতরে ডেলিভারি চার্জ ({tenant.currency}):</label>
              <input
                type="number"
                value={insideFee}
                onChange={e => setInsideFee(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono font-bold"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">ঢাকা সিটির বাইরে ডেলিভারি চার্জ ({tenant.currency}):</label>
              <input
                type="number"
                value={outsideFee}
                onChange={e => setOutsideFee(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono font-bold"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">ফ্রি ডেলিভারি থ্রেশহোল্ড:</label>
              <input
                type="text"
                disabled
                value="৳১,০০০ টাকার ওপর কেনাকাটায় ফ্রি"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-500 font-medium"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsSettingsOpen(false)}
              className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl font-semibold"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold"
            >
              সেভ করুন
            </button>
          </div>
        </form>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">নতুন অর্ডার (Pending)</span>
          <div className="font-mono font-black text-amber-600 text-xl mt-1">{pendingCount} টি</div>
          <span className="text-[10px] text-amber-700 font-medium mt-0.5 block">যাচাইয়ের অপেক্ষায়</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">প্যাকিং চলছে (Processing)</span>
          <div className="font-mono font-black text-indigo-600 text-xl mt-1">{packingCount} টি</div>
          <span className="text-[10px] text-indigo-600 font-medium mt-0.5 block">পার্সেল প্রস্তুত হচ্ছে</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">কুরিয়ারে রানিং (Shipped)</span>
          <div className="font-mono font-black text-blue-600 text-xl mt-1">{shippedCount} টি</div>
          <span className="text-[10px] text-blue-600 font-medium mt-0.5 block">কুরিয়ার ট্র্যাকিং সক্রিয়</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">ডেলিভারি সম্পন্ন</span>
          <div className="font-mono font-black text-emerald-600 text-xl mt-1">{deliveredCount} টি</div>
          <span className="text-[10px] text-emerald-600 font-medium mt-0.5 block">সফলভাবে প্রাপ্ত</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-purple-100 shadow-2xs bg-purple-50/20 col-span-2 sm:col-span-1">
          <span className="text-[10px] text-purple-700 font-bold uppercase tracking-wider block">মোট অনলাইন বিক্রয় (GMV)</span>
          <div className="font-mono font-black text-purple-900 text-lg mt-1">
            {tenant.currency}{totalGMV.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-purple-600 font-semibold mt-0.5 block">মোট {tenantOrders.length} টি অর্ডার</span>
        </div>
      </div>

      {/* Orders Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {[
            { id: 'all', label: 'সকল অর্ডার', count: tenantOrders.length },
            { id: 'pending', label: 'নতুন (Pending)', count: pendingCount },
            { id: 'accepted', label: 'গৃহীত (Accepted)', count: tenantOrders.filter(o => o.status === 'accepted').length },
            { id: 'packing', label: 'প্যাকিং চলছে', count: tenantOrders.filter(o => o.status === 'packing').length },
            { id: 'shipped', label: 'কুরিয়ারে হস্তান্তরিত', count: shippedCount },
            { id: 'delivered', label: 'ডেলিভারি সম্পন্ন', count: deliveredCount },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
                filterStatus === tab.id
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                filterStatus === tab.id ? 'bg-purple-900 text-purple-100' : 'bg-slate-200 text-slate-700'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="অর্ডার নং, কাস্টমারের নাম বা ফোন..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11px]">
              <tr>
                <th className="py-3 px-4">অর্ডার নং ও সময়</th>
                <th className="py-3 px-4">গ্রাহক ও ডেলিভারি ঠিকানা</th>
                <th className="py-3 px-4">অর্ডারকৃত পণ্য</th>
                <th className="py-3 px-4 text-right">বিল ও পেমেন্ট</th>
                <th className="py-3 px-4 text-center">কুরিয়ার ও ট্র্যাকিং</th>
                <th className="py-3 px-4 text-center">স্ট্যাটাস</th>
                <th className="py-3 px-4 text-center">অ্যাকশন ও প্রসেসিং</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <ShoppingBag className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">কোনো অনলাইন অর্ডার পাওয়া যায়নি</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">কাস্টমাররা ওয়েবসাইটে অর্ডার দিলে এখানে দেখতে পাবেন</p>
                  </td>
                </tr>
              ) : (
                displayedOrders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50/70 transition">
                    {/* Order No & Date */}
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-purple-700 text-xs">{order.orderNumber}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 font-mono">{order.createdAt}</div>
                    </td>

                    {/* Customer */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{order.customerName}</div>
                      <div className="font-mono text-slate-600 text-[11px]">{order.customerPhone}</div>
                      <div className="text-[10px] text-slate-500 max-w-xs truncate mt-0.5">📍 {order.customerAddress}</div>
                      {order.customerNotes && (
                        <div className="text-[10px] text-amber-700 italic bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 mt-1 max-w-xs">
                          নোট: {order.customerNotes}
                        </div>
                      )}
                    </td>

                    {/* Items */}
                    <td className="py-3 px-4">
                      <div className="text-slate-800 font-medium">
                        {order.items.map(i => `${i.productName} (${i.quantity}x)`).join(', ')}
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        মোট {order.items.reduce((s, i) => s + i.quantity, 0)} টি আইটেম
                      </span>
                    </td>

                    {/* Bill & Payment */}
                    <td className="py-3 px-4 text-right">
                      <div className="font-mono font-black text-purple-700 text-sm">
                        {tenant.currency}{order.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="flex items-center justify-end gap-1 mt-0.5">
                        <span className="uppercase text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                          {order.paymentMethod}
                        </span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                          order.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {order.paymentStatus === 'paid' ? 'পরিশোধিত' : 'বাকি / COD'}
                        </span>
                      </div>
                      {order.transactionId && (
                        <div className="text-[9px] text-purple-600 font-mono mt-0.5">
                          Trx: {order.transactionId}
                        </div>
                      )}
                    </td>

                    {/* Courier & Tracking */}
                    <td className="py-3 px-4 text-center">
                      {order.courierPartner ? (
                        <div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-orange-100 text-orange-900 border border-orange-200">
                            {order.courierPartner}
                          </span>
                          {order.courierTrackingId && (
                            <span className="block font-mono text-[10px] font-bold text-slate-700 mt-1">
                              {order.courierTrackingId}
                            </span>
                          )}
                          <span className="text-[9px] text-slate-500 block mt-0.5">
                            {order.courierStatus === 'in_transit' ? 'পথে রয়েছে 🚚' : 'পিকআপের অপেক্ষায়'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">কুরিয়ার নির্বাচন হয়নি</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        order.status === 'pending' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                        order.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'packing' ? 'bg-indigo-100 text-indigo-800' :
                        order.status === 'shipped' ? 'bg-orange-100 text-orange-800' :
                        order.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-slate-200 text-slate-600'
                      }`}>
                        {order.status}
                      </span>
                    </td>

                    {/* Actions & Lifecycle Workflow */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {order.status === 'pending' && (
                          <button
                            onClick={() => onUpdateOrderStatus(order.id, 'accepted')}
                            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition"
                            title="অর্ডার গ্রহণ করুন"
                          >
                            গ্রহণ করুন
                          </button>
                        )}

                        {order.status === 'accepted' && (
                          <button
                            onClick={() => onUpdateOrderStatus(order.id, 'packing')}
                            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition"
                            title="প্যাকিং শুরু করুন"
                          >
                            প্যাকিং শুরু
                          </button>
                        )}

                        {order.status === 'packing' && (
                          <button
                            onClick={() => setSelectedOrderForCourier(order)}
                            className="px-2.5 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
                            title="কুরিয়ারে বুক করুন"
                          >
                            <Truck className="w-3.5 h-3.5" /> কুরিয়ারে পাঠান
                          </button>
                        )}

                        {order.status === 'shipped' && (
                          <button
                            onClick={() => onUpdateOrderStatus(order.id, 'delivered')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition"
                            title="ডেলিভারি সম্পন্ন"
                          >
                            ডেলিভারি সম্পন্ন
                          </button>
                        )}

                        {/* Print Invoice / Order Slip */}
                        <button
                          onClick={() => {
                            setSelectedOrderForDetails(order);
                          }}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                          title="অর্ডার ইনভয়েস দেখুন ও প্রিন্ট করুন"
                        >
                          <Printer className="w-3.5 h-3.5" />
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

      {/* Courier Booking Modal */}
      <CourierBookingModal
        isOpen={!!selectedOrderForCourier}
        onClose={() => setSelectedOrderForCourier(null)}
        tenant={tenant}
        order={selectedOrderForCourier}
        onConfirmBooking={(orderId, partner, trackingId) => {
          onUpdateOrderCourier?.(orderId, partner, trackingId);
          onUpdateOrderStatus(orderId, 'shipped');
        }}
      />

      {/* Order Details & Printable Slip Modal */}
      {selectedOrderForDetails && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-4 bg-slate-100 border-b border-slate-200 flex justify-between items-center print:hidden">
              <span className="font-bold text-slate-800 text-sm">অর্ডার ইনভয়েস প্রিভিউ ({selectedOrderForDetails.orderNumber})</span>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" /> প্রিন্ট চালান
                </button>
                <button onClick={() => setSelectedOrderForDetails(null)} className="p-1 text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4 text-xs bg-white" id="printable-order-slip">
              <div className="text-center border-b pb-3">
                <h3 className="font-extrabold text-base text-slate-950 uppercase">{tenant.name}</h3>
                <p className="text-slate-500 text-[11px]">{tenant.address} • ফোন: {tenant.phone}</p>
                <span className="inline-block mt-2 px-3 py-0.5 rounded bg-purple-100 text-purple-900 font-mono font-bold text-xs">
                  অনলাইন অর্ডার মেমো: {selectedOrderForDetails.orderNumber}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-400 font-bold">গ্রাহক:</span>
                  <div className="font-bold text-slate-900">{selectedOrderForDetails.customerName}</div>
                  <div className="font-mono text-slate-600">{selectedOrderForDetails.customerPhone}</div>
                  <div className="text-slate-600">{selectedOrderForDetails.customerAddress}</div>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 font-bold">পেমেন্ট ও তারিখ:</span>
                  <div className="font-bold uppercase text-slate-900">{selectedOrderForDetails.paymentMethod}</div>
                  <div className="text-slate-600 font-mono">{selectedOrderForDetails.createdAt}</div>
                  {selectedOrderForDetails.courierTrackingId && (
                    <div className="text-orange-700 font-mono font-bold mt-1">
                      {selectedOrderForDetails.courierPartner?.toUpperCase()}: {selectedOrderForDetails.courierTrackingId}
                    </div>
                  )}
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b text-[11px]">
                    <tr>
                      <th className="p-2">পণ্য</th>
                      <th className="p-2 text-center">পরিমাণ</th>
                      <th className="p-2 text-right">দর</th>
                      <th className="p-2 text-right">মোট</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedOrderForDetails.items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="p-2 font-medium">{it.productName}</td>
                        <td className="p-2 text-center font-mono">{it.quantity}</td>
                        <td className="p-2 text-right font-mono">{tenant.currency}{it.price.toFixed(2)}</td>
                        <td className="p-2 text-right font-mono font-bold">{tenant.currency}{(it.price * it.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Total Calculation */}
              <div className="space-y-1 text-right text-xs pt-1">
                <div className="flex justify-between text-slate-500">
                  <span>পণ্য সাবটোটাল:</span>
                  <span className="font-mono font-bold">{tenant.currency}{selectedOrderForDetails.subtotal?.toFixed(2) || (selectedOrderForDetails.totalAmount - (selectedOrderForDetails.deliveryFee || 0)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>ডেলিভারি চার্জ:</span>
                  <span className="font-mono font-bold">{tenant.currency}{selectedOrderForDetails.deliveryFee?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between font-extrabold text-sm text-slate-900 border-t pt-1">
                  <span>সর্বমোট প্রদেয় বিল:</span>
                  <span className="font-mono font-black text-purple-700">{tenant.currency}{selectedOrderForDetails.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="text-center text-[10px] text-slate-400 pt-3 border-t">
                ধন্যবাদ আমাদের সাথে কেনাকাটা করার জন্য! • JH IMSE E-Commerce
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
