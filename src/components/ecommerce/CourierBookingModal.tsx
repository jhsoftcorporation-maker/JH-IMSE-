import React, { useState } from 'react';
import { X, Truck, CheckCircle2, Printer, Barcode, ShieldCheck, MapPin, Phone } from 'lucide-react';
import { Tenant, OnlineOrder } from '../../types';

interface CourierBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: Tenant;
  order: OnlineOrder | null;
  onConfirmBooking: (
    orderId: string, 
    partner: 'steadfast' | 'redx' | 'pathao' | 'in_house', 
    trackingId: string
  ) => void;
}

export const CourierBookingModal: React.FC<CourierBookingModalProps> = ({
  isOpen,
  onClose,
  tenant,
  order,
  onConfirmBooking,
}) => {
  const [courierPartner, setCourierPartner] = useState<'steadfast' | 'redx' | 'pathao' | 'in_house'>('steadfast');
  const [parcelWeight, setParcelWeight] = useState('0.5');
  const [deliveryType, setDeliveryType] = useState<'standard' | 'express'>('standard');
  const [instructions, setInstructions] = useState('প্যাকেট সাবধানে হ্যান্ডেল করুন।');
  const [isBooked, setIsBooked] = useState(false);
  const [generatedTrackingId, setGeneratedTrackingId] = useState('');

  if (!isOpen || !order) return null;

  const handleBookCourier = (e: React.FormEvent) => {
    e.preventDefault();
    const prefix = courierPartner === 'steadfast' ? 'STDF-' : courierPartner === 'redx' ? 'REDX-' : courierPartner === 'pathao' ? 'PTH-' : 'INHOUSE-';
    const trackingCode = prefix + new Date().getFullYear() + '-' + Math.floor(100000 + Math.random() * 900000);
    
    setGeneratedTrackingId(trackingCode);
    setIsBooked(true);
    onConfirmBooking(order.id, courierPartner, trackingCode);
  };

  const handlePrintLabel = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-amber-700 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Truck className="w-5 h-5 text-orange-200" />
            </div>
            <div>
              <h3 className="font-bold text-base">১-ক্লিকে কুরিয়ার পার্সেল বুকিং ও ট্র্যাকিং</h3>
              <p className="text-xs text-orange-100">অর্ডার নং: {order.orderNumber} • {tenant.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-orange-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!isBooked ? (
          <form onSubmit={handleBookCourier} className="p-6 space-y-4 text-xs">
            {/* Courier Selection */}
            <div>
              <label className="font-bold text-slate-700 block mb-1.5">কুরিয়ার ডেলিভারি পার্টনার নির্বাচন করুন: *</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'steadfast', name: 'Steadfast Courier', logo: '🚀', fee: '৳৬০ / ৳১০০', active: true },
                  { id: 'redx', name: 'RedX Express', logo: '📦', fee: '৳৭০ / ৳১১০', active: true },
                  { id: 'pathao', name: 'Pathao Courier', logo: '⚡', fee: '৳৬০ / ৳১২০', active: true },
                  { id: 'in_house', name: 'নিজস্ব রাইডার', logo: '🛵', fee: 'ফ্রি / নিজস্ব', active: true },
                ].map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCourierPartner(c.id as any)}
                    className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                      courierPartner === c.id
                        ? 'border-orange-500 bg-orange-50/50 ring-2 ring-orange-500/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-xl mb-1">{c.logo}</div>
                    <div className="font-bold text-slate-900 text-xs">{c.name}</div>
                    <span className="text-[10px] text-slate-500 mt-0.5">{c.fee}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Recipient Details Card */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">প্রাপকের ঠিকানা ও যোগাযোগ</span>
                  <h4 className="font-bold text-slate-900 text-sm mt-0.5">{order.customerName}</h4>
                  <p className="text-slate-600 font-mono text-xs">{order.customerPhone}</p>
                  <p className="text-slate-600 text-xs mt-1">📍 {order.customerAddress}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">ক্যাশ অন ডেলিভারি (COD)</span>
                  <div className="font-mono font-black text-rose-600 text-base mt-0.5">
                    {order.paymentMethod === 'cod' ? `${tenant.currency}${order.totalAmount.toLocaleString()}` : `${tenant.currency}0 (পরিশোধিত)`}
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {order.paymentMethod === 'cod' ? 'কাস্টমার থেকে সংগ্রহ করবেন' : 'অগ্রিম বিকাশ/অনলাইনে পেইড'}
                  </span>
                </div>
              </div>
            </div>

            {/* Weight and Delivery Options */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">পার্সেলের ওজন (কেজি):</label>
                <select
                  value={parcelWeight}
                  onChange={e => setParcelWeight(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium outline-none"
                >
                  <option value="0.5">০.৫ কেজি পর্যন্ত (Standard)</option>
                  <option value="1.0">১.০ কেজি পর্যন্ত</option>
                  <option value="2.0">২.০ কেজি পর্যন্ত</option>
                  <option value="5.0">৫.০ কেজি পর্যন্ত</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">ডেলিভারির ধরন:</label>
                <select
                  value={deliveryType}
                  onChange={e => setDeliveryType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium outline-none"
                >
                  <option value="standard">স্ট্যান্ডার্ড (২৪-৪৮ ঘণ্টা)</option>
                  <option value="express">এক্সপ্রেস ডেলিভারি (সেম ডে / ২৪ ঘণ্টা)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">রাইডারের জন্য স্পেশাল নির্দেশনা:</label>
              <input
                type="text"
                value={instructions}
                onChange={e => setInstructions(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none"
              />
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold transition shadow-sm flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> কুরিয়ারে বুক করুন ও ট্র্যাকিং কোড তৈরি করুন
              </button>
            </div>
          </form>
        ) : (
          /* Booked & Shipping Label View */
          <div className="p-6 space-y-5 text-xs">
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider block">
                  কুরিয়ার পার্সেল সফলভাবে বুক হয়েছে ✓
                </span>
                <h4 className="font-mono font-black text-slate-900 text-base mt-0.5">
                  {generatedTrackingId}
                </h4>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  পার্টনার: <strong>{courierPartner.toUpperCase()}</strong> • স্ট্যাটাস: <strong>পিকআপের অপেক্ষায়</strong>
                </p>
              </div>
              <button
                onClick={handlePrintLabel}
                className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" /> শিপিং লেবেল প্রিন্ট করুন
              </button>
            </div>

            {/* Printable Shipping Label Preview */}
            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-5 bg-white space-y-4" id="printable-courier-label">
              <div className="flex justify-between items-start border-b border-slate-200 pb-3">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">প্রেরক (RETURN ADDRESS)</span>
                  <div className="font-extrabold text-slate-900 text-sm">{tenant.name}</div>
                  <div className="text-[11px] text-slate-500">ফোন: {tenant.phone}</div>
                  <div className="text-[10px] text-slate-500 max-w-xs">{tenant.address}</div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-900 uppercase">
                    {courierPartner}
                  </span>
                  <div className="font-mono text-xs font-bold text-slate-800 mt-1">
                    অর্ডার: {order.orderNumber}
                  </div>
                </div>
              </div>

              {/* Barcode Mock */}
              <div className="text-center py-2 bg-slate-50 rounded-xl border border-slate-200">
                <div className="font-mono text-xl tracking-[0.3em] font-bold text-slate-900">
                  ||||| | |||| |||||| || | ||||
                </div>
                <div className="font-mono text-[11px] text-slate-600 mt-1 font-bold">
                  {generatedTrackingId}
                </div>
              </div>

              <div className="flex justify-between items-start pt-1">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">প্রাপক (DELIVER TO)</span>
                  <div className="font-extrabold text-slate-900 text-sm">{order.customerName}</div>
                  <div className="text-xs font-mono font-bold text-slate-800">মোবাইল: {order.customerPhone}</div>
                  <div className="text-xs text-slate-600 max-w-xs mt-1">ঠিকানা: {order.customerAddress}</div>
                </div>
                <div className="text-right bg-rose-50 p-3 rounded-xl border border-rose-200 min-w-[140px]">
                  <span className="text-[10px] uppercase font-bold text-rose-700 block">ক্যাশ কালেকশন (COD)</span>
                  <div className="font-mono font-black text-rose-700 text-lg">
                    {order.paymentMethod === 'cod' ? `${tenant.currency}${order.totalAmount.toLocaleString()}` : `${tenant.currency}0.00`}
                  </div>
                  <span className="text-[9px] text-rose-600 font-semibold block mt-0.5">
                    {order.paymentMethod === 'cod' ? 'নগদ আদায়যোগ্য' : 'অনলাইন পেইড'}
                  </span>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 border-t border-slate-100 pt-2 flex justify-between">
                <span>ওজন: {parcelWeight} কেজি</span>
                <span>তারিখ: {new Date().toLocaleDateString('bn-BD')}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition"
              >
                সম্পন্ন করুন ও বন্ধ করুন
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
