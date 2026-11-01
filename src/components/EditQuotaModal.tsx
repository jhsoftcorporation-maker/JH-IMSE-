import React, { useState } from 'react';
import { HardDrive, X, CheckCircle2, Building2, Users, Package, FileText, Database } from 'lucide-react';
import { Tenant } from '../types';

interface EditQuotaModalProps {
  tenant: Tenant | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateTenant: (updated: Tenant) => void;
}

export const EditQuotaModal: React.FC<EditQuotaModalProps> = ({
  tenant,
  isOpen,
  onClose,
  onUpdateTenant,
}) => {
  if (!isOpen || !tenant) return null;

  const [maxBranches, setMaxBranches] = useState(tenant.quotas.maxBranches);
  const [maxUsers, setMaxUsers] = useState(tenant.quotas.maxUsers);
  const [maxProducts, setMaxProducts] = useState(tenant.quotas.maxProducts);
  const [maxMonthlyInvoices, setMaxMonthlyInvoices] = useState(tenant.quotas.maxMonthlyInvoices);
  const [storageGb, setStorageGb] = useState(tenant.quotas.storageGb);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Tenant = {
      ...tenant,
      quotas: {
        maxBranches: Number(maxBranches),
        maxUsers: Number(maxUsers),
        maxProducts: Number(maxProducts),
        maxMonthlyInvoices: Number(maxMonthlyInvoices),
        storageGb: Number(storageGb),
      },
    };
    onUpdateTenant(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-purple-100 overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="bg-gradient-to-r from-purple-800 to-indigo-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <HardDrive className="w-5 h-5 text-amber-300" />
            <div>
              <h3 className="font-bold text-sm">রিসোর্স কোটা ও ক্লাউড লিমিট সম্পাদনা</h3>
              <p className="text-xs text-purple-200">{tenant.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-purple-200 hover:text-white">✕</button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-purple-600" />
              সর্বোচ্চ অনুমোদিত আউটলেট / ব্রাঞ্চ সংখ্যা:
            </label>
            <input
              type="number"
              min={1}
              value={maxBranches}
              onChange={e => setMaxBranches(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:outline-none"
            />
            <span className="text-[10px] text-slate-400">বর্তমানে ব্যবহৃত: {tenant.usage.currentBranches} টি</span>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-600" />
              সর্বোচ্চ ক্যাশিয়ার ও স্টাফ ইউজার অ্যাকাউন্টস:
            </label>
            <input
              type="number"
              min={1}
              value={maxUsers}
              onChange={e => setMaxUsers(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:outline-none"
            />
            <span className="text-[10px] text-slate-400">বর্তমানে ব্যবহৃত: {tenant.usage.currentUsers} জন</span>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-emerald-600" />
              সর্বোচ্চ ইনভেন্টরি পণ্য ধারণক্ষমতা (Products):
            </label>
            <input
              type="number"
              min={100}
              step={500}
              value={maxProducts}
              onChange={e => setMaxProducts(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:outline-none"
            />
            <span className="text-[10px] text-slate-400">বর্তমানে ব্যবহৃত: {tenant.usage.currentProducts} টি পণ্য</span>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-600" />
              প্রতি মাসে সর্বোচ্চ ইনভয়েস স্লিপ (Monthly Invoices):
            </label>
            <input
              type="number"
              min={100}
              step={500}
              value={maxMonthlyInvoices}
              onChange={e => setMaxMonthlyInvoices(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:outline-none"
            />
            <span className="text-[10px] text-slate-400">চলতি মাসে ব্যবহৃত: {tenant.usage.currentMonthlyInvoices} টি</span>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-cyan-600" />
              ক্লাউড ডাটাবেজ ও মিডিয়া স্টোরেজ কোটা (GB):
            </label>
            <input
              type="number"
              min={1}
              value={storageGb}
              onChange={e => setStorageGb(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:outline-none"
            />
            <span className="text-[10px] text-slate-400">বর্তমানে ব্যবহৃত: {(tenant.usage.currentStorageMb / 1024).toFixed(1)} GB</span>
          </div>

          <div className="pt-3 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="flex-1 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" /> কোটা আপডেট করুন
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
