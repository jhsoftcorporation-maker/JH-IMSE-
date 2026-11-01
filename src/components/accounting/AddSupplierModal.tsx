import React, { useState, useEffect } from 'react';
import { X, Building, CheckCircle2, User, Phone, MapPin, CreditCard } from 'lucide-react';
import { Tenant, Supplier } from '../../types';

interface AddSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: Tenant;
  supplierToEdit?: Supplier | null;
  onSaveSupplier: (supplierData: Omit<Supplier, 'id' | 'createdAt'>, existingId?: string) => void;
}

export const AddSupplierModal: React.FC<AddSupplierModalProps> = ({
  isOpen,
  onClose,
  tenant,
  supplierToEdit,
  onSaveSupplier,
}) => {
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [category, setCategory] = useState('মেডিসিন সাপ্লায়ার');
  const [tradeLicenseNo, setTradeLicenseNo] = useState('');
  const [bankAccountDetails, setBankAccountDetails] = useState('');
  const [initialDue, setInitialDue] = useState('0');

  useEffect(() => {
    if (supplierToEdit) {
      setName(supplierToEdit.name);
      setCompanyName(supplierToEdit.companyName);
      setPhone(supplierToEdit.phone);
      setEmail(supplierToEdit.email || '');
      setAddress(supplierToEdit.address);
      setCategory(supplierToEdit.category);
      setTradeLicenseNo(supplierToEdit.tradeLicenseNo || '');
      setBankAccountDetails(supplierToEdit.bankAccountDetails || '');
      setInitialDue(supplierToEdit.dueBalance.toString());
    } else {
      setName('');
      setCompanyName('');
      setPhone('+880 ');
      setEmail('');
      setAddress('');
      setCategory(tenant.businessType === 'pharmacy' ? 'ফার্মাসিউটিক্যালস ম্যানুফ্যাকচারার' : 'পাইকারি পরিবেশক ও ডিলার');
      setTradeLicenseNo('');
      setBankAccountDetails('');
      setInitialDue('0');
    }
  }, [supplierToEdit, tenant, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      alert('সাপ্লায়ারের নাম ও মোবাইল নম্বর পূরণ করুন');
      return;
    }

    const due = parseFloat(initialDue) || 0;

    onSaveSupplier(
      {
        tenantId: tenant.id,
        name: name.trim(),
        companyName: companyName.trim() || name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        address: address.trim(),
        category: category.trim(),
        tradeLicenseNo: tradeLicenseNo.trim() || undefined,
        bankAccountDetails: bankAccountDetails.trim() || undefined,
        totalPurchases: supplierToEdit ? supplierToEdit.totalPurchases : due,
        totalPaid: supplierToEdit ? supplierToEdit.totalPaid : 0,
        dueBalance: due,
        status: 'active',
        transactions: supplierToEdit?.transactions || [],
      },
      supplierToEdit?.id
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Building className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <h3 className="font-bold text-base">
                {supplierToEdit ? 'সাপ্লায়ার তথ্য এডিট করুন' : 'নতুন সরবরাহকারী / মহাজন যুক্ত করুন'}
              </h3>
              <p className="text-xs text-blue-200">{tenant.name} • সাপ্লায়ার ও ভেন্ডর লেজার</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-blue-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-3.5 text-xs max-h-[80vh] overflow-y-auto">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">কোম্পানি বা প্রতিষ্ঠানের নাম: *</label>
            <input
              type="text"
              required
              placeholder="যেমন: স্কয়ার ফার্মাসিউটিক্যালস লিঃ / সিটি গ্রুপ"
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">প্রতিনিধি বা মহাজনের নাম: *</label>
              <input
                type="text"
                required
                placeholder="যেমন: মোঃ কামরুল ইসলাম (ডিপো ম্যানেজার)"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">মোবাইল নম্বর: *</label>
              <input
                type="text"
                required
                placeholder="+880 1711-XXXXXX"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">ইমেইল ঠিকানা (ঐচ্ছিক):</label>
              <input
                type="email"
                placeholder="sales@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">সরবরাহের ধরন / ক্যাটাগরি:</label>
              <input
                type="text"
                placeholder="যেমন: মেডিসিন ডিলার / চালের আড়তদার"
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">ডিপো / অফিসের ঠিকানা: *</label>
            <input
              type="text"
              required
              placeholder="যেমন: প্লট নং ১২, রোড নং ৩, তেজগাঁও শিল্প এলাকা, ঢাকা"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">ট্রেড লাইসেন্স বা BIN নং:</label>
              <input
                type="text"
                placeholder="TRAD/DNCC/08219"
                value={tradeLicenseNo}
                onChange={e => setTradeLicenseNo(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                {supplierToEdit ? 'বর্তমান দেনা বকেয়া:' : 'প্রারম্ভিক বকেয়া দেনা (Opening Due):'}
              </label>
              <input
                type="number"
                step="any"
                value={initialDue}
                onChange={e => setInitialDue(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-rose-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">ব্যাংক একাউন্ট বা বিকাশ মার্চেন্ট তথ্য:</label>
            <input
              type="text"
              placeholder="যেমন: Dutch-Bangla Bank, A/C: 115-120-998877 অথবা বিকাশ মার্চেন্ট: 01711..."
              value={bankAccountDetails}
              onChange={e => setBankAccountDetails(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none"
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
              className="flex-1 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold transition shadow-sm flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" /> {supplierToEdit ? 'আপডেট করুন' : 'সাপ্লায়ার সংরক্ষণ করুন'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
