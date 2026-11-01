import React, { useState } from 'react';
import { X, Tag, Sparkles, TrendingUp, AlertCircle, CheckCircle2, DollarSign } from 'lucide-react';
import { Tenant, DeadStockLiquidationItem, Product } from '../../types';

interface DeadStockPromoModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: Tenant;
  item: DeadStockLiquidationItem | null;
  onApplyPromo: (productId: string, newSellingPrice: number, discountPct: number) => void;
}

export const DeadStockPromoModal: React.FC<DeadStockPromoModalProps> = ({
  isOpen,
  onClose,
  tenant,
  item,
  onApplyPromo,
}) => {
  if (!isOpen || !item) return null;

  const [discountPct, setDiscountPct] = useState<number>(item.suggestedDiscountPct || 20);

  const discountedPrice = Math.round((item.sellingPrice * (1 - discountPct / 100)) * 10) / 10;
  const projectedRecovery = Math.round(discountedPrice * item.currentStock);

  const handleConfirm = () => {
    onApplyPromo(item.productId, discountedPrice, discountPct);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-amber-100 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
        <div className="bg-gradient-to-r from-amber-600 to-orange-700 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <Tag className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h3 className="font-bold text-base">ডেড-স্টক লিকুইডেশন ও ক্যাপিটাল রিকভারি</h3>
              <p className="text-xs text-amber-100">আটকে থাকা মূলধন দ্রুত নগদে রূপান্তরের সেলস অফার</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-amber-200 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          {/* Product Snapshot */}
          <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] text-amber-800 font-bold uppercase tracking-wider block">
                  পণ্য বিবরণী ({item.category})
                </span>
                <h4 className="font-bold text-sm text-slate-900 mt-0.5">{item.productName}</h4>
                <span className="text-[11px] text-slate-500 font-mono">SKU: {item.sku}</span>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-100 text-rose-800">
                {item.daysWithoutSale} দিন কোনো বিক্রি নেই!
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-amber-200/80 text-center">
              <div className="bg-white p-2 rounded-xl border border-amber-100">
                <span className="text-[10px] text-slate-400 block">বর্তমান স্টক</span>
                <span className="font-bold font-mono text-slate-800">{item.currentStock} পিস</span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-amber-100">
                <span className="text-[10px] text-slate-400 block">আটকে থাকা মূলধন</span>
                <span className="font-bold font-mono text-rose-700">{tenant.currency}{item.tiedUpCapital.toFixed(0)}</span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-amber-100">
                <span className="text-[10px] text-slate-400 block">বর্তমান রেগুলার দর</span>
                <span className="font-bold font-mono text-slate-800">{tenant.currency}{item.sellingPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Discount Selector */}
          <div>
            <label className="font-bold text-slate-700 block mb-1.5">
              ডিসকাউন্ট শতকরা হার নির্ধারণ করুন:
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[10, 15, 20, 25, 30].map(pct => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setDiscountPct(pct)}
                  className={`py-2 rounded-xl font-bold text-xs transition cursor-pointer ${
                    discountPct === pct
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {pct}% ছাড়
                </button>
              ))}
            </div>
          </div>

          {/* Pricing Impact Preview */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <span className="font-bold text-slate-800 block text-xs">মূল্য ও ক্যাপিটাল সমন্বয় প্রভাব:</span>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600">নতুন অফার মূল্য (New MRP):</span>
              <span className="font-bold font-mono text-emerald-700 text-sm">
                {tenant.currency}{discountedPrice.toFixed(2)} <span className="line-through text-slate-400 text-xs font-normal">{tenant.currency}{item.sellingPrice.toFixed(2)}</span>
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600">প্রত্যাশিত ক্যাশ রিকভারি:</span>
              <span className="font-bold font-mono text-slate-900 text-sm">
                {tenant.currency}{projectedRecovery.toLocaleString()}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 pt-1 border-t border-slate-200">
              * প্রমোশন সক্রিয় করলে পিওএস কাউন্টারে স্বয়ংক্রিয়ভাবে ডিসকাউন্ট প্রাইস প্রযোজ্য হবে এবং অনলাইন স্টোরে ব্যানার শো করবে।
            </p>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs transition cursor-pointer"
          >
            বাতিল
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" /> অফার সক্রিয় ও মূল্য আপডেট
          </button>
        </div>
      </div>
    </div>
  );
};
