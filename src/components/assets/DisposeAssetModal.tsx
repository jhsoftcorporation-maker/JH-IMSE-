import React, { useState } from 'react';
import { X, Trash2, Calendar, DollarSign, TrendingUp, TrendingDown, AlertTriangle, ShieldAlert } from 'lucide-react';
import { FixedAsset, AssetDisposalType, AssetDisposal } from '../../types';

interface DisposeAssetModalProps {
  asset: FixedAsset;
  currency: string;
  onClose: () => void;
  onConfirmDisposal: (disposalData: Omit<AssetDisposal, 'id' | 'createdAt'>) => void;
}

export const DisposeAssetModal: React.FC<DisposeAssetModalProps> = ({
  asset,
  currency,
  onClose,
  onConfirmDisposal,
}) => {
  const currentNetBookValue = Math.max(0, asset.originalCost - asset.accumulatedDepreciation);

  const [formData, setFormData] = useState({
    disposalDate: new Date().toISOString().split('T')[0],
    disposalType: 'sold' as AssetDisposalType,
    saleProceeds: asset.salvageValue || 0,
    buyerOrScrapDealer: '',
    contactPhone: '',
    reason: '',
    approvedBy: 'Dr. Md. Abdur Rahim (Owner)',
  });

  const gainOrLoss = formData.saleProceeds - currentNetBookValue;
  const isGain = gainOrLoss >= 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.reason.trim()) return;

    onConfirmDisposal({
      assetId: asset.id,
      assetCode: asset.assetCode,
      disposalDate: formData.disposalDate,
      disposalType: formData.disposalType,
      saleProceeds: Number(formData.saleProceeds) || 0,
      bookValueAtDisposal: currentNetBookValue,
      accumulatedDepreciationAtDisposal: asset.accumulatedDepreciation,
      originalCost: asset.originalCost,
      gainOrLoss,
      buyerOrScrapDealer: formData.buyerOrScrapDealer.trim() || undefined,
      contactPhone: formData.contactPhone.trim() || undefined,
      reason: formData.reason.trim(),
      approvedBy: formData.approvedBy.trim(),
      journalVoucherNo: `JV-DSP-${Date.now().toString().slice(-6)}`,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-rose-700 via-red-700 to-rose-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md">
              <Trash2 className="w-6 h-6 text-rose-200" />
            </div>
            <div>
              <h2 className="text-lg font-bold">স্থায়ী সম্পদ নিষ্পত্তি ও বিক্রয় (Dispose / Retire Asset)</h2>
              <p className="text-xs text-rose-100 font-mono">
                {asset.assetCode} — {asset.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Asset Current Financial State Card */}
          <div className="grid grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">মূল ক্রয়মূল্য:</span>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {currency}{asset.originalCost.toLocaleString()}
              </p>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">পুঞ্জীভূত অবচয়:</span>
              <p className="text-sm font-bold text-amber-600 dark:text-amber-400">
                {currency}{asset.accumulatedDepreciation.toLocaleString()}
              </p>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">বর্তমান বুক ভ্যালু (NBV):</span>
              <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
                {currency}{currentNetBookValue.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                নিষ্পত্তির তারিখ (Disposal Date) *
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="date"
                  required
                  value={formData.disposalDate}
                  onChange={e => setFormData({ ...formData, disposalDate: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                নিষ্পত্তির ধরণ (Disposal Method) *
              </label>
              <select
                value={formData.disposalType}
                onChange={e => setFormData({ ...formData, disposalType: e.target.value as AssetDisposalType })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none font-medium"
              >
                <option value="sold">স্ক্র্যাপ বা পুরোনো হিসেবে বিক্রয় (Sold for Cash)</option>
                <option value="scrapped">সম্পূর্ণ বাতিল বা ধ্বংস (Scrapped / Written Off)</option>
                <option value="lost_stolen">হারিয়ে যাওয়া বা চুরি (Lost / Stolen)</option>
                <option value="donated">অনুদান বা উপহার (Donated)</option>
                <option value="traded_in">নতুন পণ্যের সাথে এক্সচেঞ্জ (Trade-In)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                বিক্রয়মূল্য বা স্ক্র্যাপ প্রাপ্তি ({currency} Cash Realized) *
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.saleProceeds}
                  onChange={e => setFormData({ ...formData, saleProceeds: parseFloat(e.target.value) || 0 })}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-bold text-emerald-600 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                অনুমোদনকারী কর্মকর্তা (Approved By) *
              </label>
              <input
                type="text"
                required
                value={formData.approvedBy}
                onChange={e => setFormData({ ...formData, approvedBy: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                ক্রেতা বা স্ক্র্যাপ ডিলার নাম
              </label>
              <input
                type="text"
                placeholder="যেমন: মেসার্স ভাই ভাই স্ক্র্যাপ ডিলার"
                value={formData.buyerOrScrapDealer}
                onChange={e => setFormData({ ...formData, buyerOrScrapDealer: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                ক্রেতার ফোন নম্বর
              </label>
              <input
                type="text"
                placeholder="+880 1715-667788"
                value={formData.contactPhone}
                onChange={e => setFormData({ ...formData, contactPhone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              সম্পদ বাতিলের কারণ ও বিস্তারিত ব্যাখ্যা *
            </label>
            <textarea
              rows={2}
              required
              placeholder="কেন সম্পদটি বাতিল বা বিক্রি করা হচ্ছে (যেমন: ৫ বছর আয়ুষ্কাল সমাপ্তি, মেরামত অযোগ্য বা আধুনিকায়ন)..."
              value={formData.reason}
              onChange={e => setFormData({ ...formData, reason: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
          </div>

          {/* Gain or Loss Analysis Card */}
          <div className={`p-4 rounded-xl border ${
            isGain
              ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40'
              : 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/40'
          } flex items-center justify-between`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isGain ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                {isGain ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  সম্পদ নিষ্পত্তিতে লাভ / (ক্ষতি) হিসাব:
                </p>
                <p className={`text-base font-extrabold ${isGain ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
                  {isGain ? `লাভ (Gain): +${currency}${gainOrLoss.toLocaleString()}` : `লোকসান (Loss): -${currency}${Math.abs(gainOrLoss).toLocaleString()}`}
                </p>
              </div>
            </div>
            <div className="text-right text-xs text-slate-500 dark:text-slate-400">
              <span className="block">বিক্রয়মূল্য - বুক ভ্যালু</span>
              <span className="font-mono">{currency}{formData.saleProceeds} - {currency}{currentNetBookValue}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-xl text-xs text-amber-800 dark:text-amber-300">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>
              <strong>সতর্কতা:</strong> এটি নিশ্চিত করলে স্বয়ংক্রিয়ভাবে জেনারেল লেজারে একটি ডাবল-এন্ট্রি জাবেদা (Journal Voucher) পোস্ট হবে এবং ব্যালেন্স শিট থেকে সম্পদটি নিষ্ক্রিয় হবে।
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              বাতিল (Cancel)
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-xl shadow-lg shadow-rose-500/25 transition-all flex items-center gap-2"
            >
              <ShieldAlert className="w-4 h-4" /> নিষ্পত্তি ও জাবেদা পোস্ট নিশ্চিত করুন
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
