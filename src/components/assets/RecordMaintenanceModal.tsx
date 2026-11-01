import React, { useState } from 'react';
import { X, Wrench, Calendar, Phone, DollarSign, FileText, CheckCircle2 } from 'lucide-react';
import { FixedAsset, AssetMaintenanceRecord } from '../../types';

interface RecordMaintenanceModalProps {
  asset: FixedAsset;
  currency: string;
  onClose: () => void;
  onSave: (record: Omit<AssetMaintenanceRecord, 'id' | 'createdAt'>) => void;
}

export const RecordMaintenanceModal: React.FC<RecordMaintenanceModalProps> = ({
  asset,
  currency,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    maintenanceDate: new Date().toISOString().split('T')[0],
    maintenanceType: 'preventive' as AssetMaintenanceRecord['maintenanceType'],
    serviceProvider: '',
    technicianPhone: '',
    invoiceBillNo: '',
    cost: 2500,
    description: '',
    partsReplaced: '',
    performedBy: '',
    nextScheduledDate: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.serviceProvider.trim() || !formData.description.trim()) return;

    onSave({
      assetId: asset.id,
      assetCode: asset.assetCode,
      maintenanceDate: formData.maintenanceDate,
      maintenanceType: formData.maintenanceType,
      serviceProvider: formData.serviceProvider.trim(),
      technicianPhone: formData.technicianPhone.trim() || undefined,
      invoiceBillNo: formData.invoiceBillNo.trim() || undefined,
      cost: Number(formData.cost) || 0,
      description: formData.description.trim(),
      partsReplaced: formData.partsReplaced.trim() || undefined,
      performedBy: formData.performedBy.trim() || 'অন-কল সার্ভিস টেকনিশিয়ান',
      nextScheduledDate: formData.nextScheduledDate || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md">
              <Wrench className="w-6 h-6 text-amber-200" />
            </div>
            <div>
              <h2 className="text-lg font-bold">রক্ষণাবেক্ষণ ও মেরামত লগ (Record Maintenance)</h2>
              <p className="text-xs text-amber-100 font-mono">
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                মেরামতের তারিখ *
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="date"
                  required
                  value={formData.maintenanceDate}
                  onChange={e => setFormData({ ...formData, maintenanceDate: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                কাজের ধরন (Maintenance Type) *
              </label>
              <select
                value={formData.maintenanceType}
                onChange={e => setFormData({ ...formData, maintenanceType: e.target.value as any })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="preventive">প্রিভেনটিভ রুটিন সার্ভিস (Preventive)</option>
                <option value="corrective_repair">কারেক্টিভ ত্রুটি মেরামত (Corrective Repair)</option>
                <option value="upgrade">হার্ডওয়্যার আপগ্রেড (Upgrade)</option>
                <option value="inspection">নিরাপত্তা ও কার্যক্ষমতা অডিট (Inspection)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                সার্ভিস প্রোভাইডার / ওয়ার্কশপ নাম *
              </label>
              <input
                type="text"
                required
                placeholder="যেমন: CoolAir HVAC Engineering Ltd."
                value={formData.serviceProvider}
                onChange={e => setFormData({ ...formData, serviceProvider: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                টেকনিশিয়ানের ফোন নম্বর
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  placeholder="+880 1718-223344"
                  value={formData.technicianPhone}
                  onChange={e => setFormData({ ...formData, technicianPhone: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                মোট মেরামত খরচ ({currency}) *
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.cost}
                  onChange={e => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-semibold text-amber-600 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                বিল বা ইনভয়েস নম্বর (Bill/Invoice No)
              </label>
              <input
                type="text"
                placeholder="যেমন: BILL-HVAC-9912"
                value={formData.invoiceBillNo}
                onChange={e => setFormData({ ...formData, invoiceBillNo: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              সম্পন্ন কাজের বিবরণ (Work Done Description) *
            </label>
            <textarea
              rows={2}
              required
              placeholder="কী সমস্যা হয়েছিল এবং কী কাজ করা হলো বিস্তারিত লিখুন..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              প্রতিস্থাপিত পার্টস (Parts Replaced - if any)
            </label>
            <input
              type="text"
              placeholder="যেমন: Capacitor 45uF, Filter Mesh, Compressor Valve"
              value={formData.partsReplaced}
              onChange={e => setFormData({ ...formData, partsReplaced: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                দায়িত্বপ্রাপ্ত টেকনিশিয়ান / কর্মী নাম
              </label>
              <input
                type="text"
                placeholder="যেমন: ইঞ্জিনিয়ার শাহেদ করিম"
                value={formData.performedBy}
                onChange={e => setFormData({ ...formData, performedBy: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                পরবর্তী সম্ভাব্য মেইনটেন্যান্স তারিখ
              </label>
              <input
                type="date"
                value={formData.nextScheduledDate}
                onChange={e => setFormData({ ...formData, nextScheduledDate: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              বাতিল (Cancel)
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 active:bg-amber-800 rounded-xl shadow-lg shadow-amber-500/25 transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" /> রক্ষণাবেক্ষণ রেকর্ড সংরক্ষণ করুন
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
