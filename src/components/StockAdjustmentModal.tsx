import React, { useState } from 'react';
import { X, SlidersHorizontal, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Product, Tenant, StockAdjustment } from '../types';

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: Tenant;
  products: Product[];
  onApplyAdjustment: (productId: string, newStock: number, adjustmentRecord: StockAdjustment) => void;
}

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
  isOpen,
  onClose,
  tenant,
  products,
  onApplyAdjustment,
}) => {
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [adjustmentType, setAdjustmentType] = useState<'addition' | 'subtraction' | 'damage' | 'expired' | 'audit'>('addition');
  const [qty, setQty] = useState<number>(1);
  const [reason, setReason] = useState<string>('');

  if (!isOpen) return null;

  const currentProduct = products.find(p => p.id === selectedProductId) || products[0];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProduct || qty <= 0) return;

    let updatedStock = currentProduct.stock;
    if (adjustmentType === 'addition') {
      updatedStock += qty;
    } else {
      updatedStock = Math.max(0, currentProduct.stock - qty);
    }

    const record: StockAdjustment = {
      id: 'adj-' + Date.now(),
      productId: currentProduct.id,
      productName: currentProduct.name,
      type: adjustmentType,
      quantity: qty,
      reason: reason.trim() || (adjustmentType === 'damage' ? 'নষ্ট/ড্যামেজ পণ্য রাইট-অফ' : adjustmentType === 'expired' ? 'মেয়াদোত্তীর্ণ ওষুধ অপসারণ' : 'ইনভেন্টরি অডিট সমন্বয়'),
      adjustedBy: tenant.ownerName || 'Store Admin',
      createdAt: new Date().toLocaleString('en-GB'),
    };

    onApplyAdjustment(currentProduct.id, updatedStock, record);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-purple-100 overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="bg-purple-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-800 text-purple-200">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">স্টক সমন্বয় ও অডিট (Stock Adjustment)</h3>
              <p className="text-[11px] text-purple-200">ড্যামেজ, মেয়াদোত্তীর্ণ বা অডিট রাইট-অফ</p>
            </div>
          </div>
          <button onClick={onClose} className="text-purple-200 hover:text-white">✕</button>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-3.5 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">পণ্য সিলেক্ট করুন:</label>
            <select
              value={selectedProductId}
              onChange={e => setSelectedProductId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-purple-600"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} (বর্তমান স্টক: {p.stock} {p.unit})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">সমন্বয়ের ধরন (Type):</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'addition', label: '+ স্টক বৃদ্ধি (Surplus)', color: 'text-emerald-700 border-emerald-200' },
                { id: 'damage', label: '- ড্যামেজ / নষ্ট রাইট-অফ', color: 'text-rose-700 border-rose-200' },
                { id: 'expired', label: '- মেয়াদোত্তীর্ণ ওষুধ রাইট-অফ', color: 'text-amber-700 border-amber-200' },
                { id: 'subtraction', label: '- হিসাবের ঘাটতি সমন্বয়', color: 'text-slate-700 border-slate-200' },
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setAdjustmentType(t.id as any)}
                  className={`p-2 rounded-xl border text-left font-medium transition ${
                    adjustmentType === t.id
                      ? 'bg-purple-700 text-white border-purple-700 shadow-xs'
                      : `bg-slate-50 ${t.color} hover:bg-slate-100`
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">পরিমাণ (Quantity):</label>
            <input
              type="number"
              min="1"
              max={adjustmentType !== 'addition' ? currentProduct.stock : 10000}
              value={qty}
              onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm focus:bg-white"
            />
            {adjustmentType !== 'addition' && (
              <span className="text-[10px] text-slate-400 mt-1 block">
                সর্বোচ্চ বাদ দেওয়া যাবে: {currentProduct.stock} {currentProduct.unit}
              </span>
            )}
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">কারণ বা অডিট নোট (Reason):</label>
            <input
              type="text"
              placeholder="যেমন: মেয়াদ শেষ হওয়ায় ড্রাগ ড্রয়ার থেকে অপসারণ"
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
            />
          </div>

          <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 flex items-center justify-between text-xs font-semibold text-purple-900">
            <span>সমন্বয়ের পর নতুন স্টক:</span>
            <strong className="text-base text-purple-700">
              {adjustmentType === 'addition'
                ? currentProduct.stock + qty
                : Math.max(0, currentProduct.stock - qty)}{' '}
              {currentProduct.unit}
            </strong>
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl transition shadow-sm"
            >
              সমন্বয় নিশ্চিত করুন
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
