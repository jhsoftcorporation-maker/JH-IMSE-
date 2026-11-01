import React, { useState, useEffect } from 'react';
import { Customer, Tenant, CustomerType, LoyaltyTier } from '../types';
import { X, UserPlus, Phone, MapPin, Mail, ShieldCheck, DollarSign, Award, Building } from 'lucide-react';

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: Tenant;
  customerToEdit?: Customer | null;
  onSaveCustomer: (customerData: Omit<Customer, 'id'>, existingId?: string) => void;
}

export const AddCustomerModal: React.FC<AddCustomerModalProps> = ({
  isOpen,
  onClose,
  tenant,
  customerToEdit,
  onSaveCustomer,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+880 ');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [customerType, setCustomerType] = useState<CustomerType>('retail');
  const [loyaltyTier, setLoyaltyTier] = useState<LoyaltyTier>('bronze');
  const [creditLimit, setCreditLimit] = useState<string>('5000');
  const [openingBalance, setOpeningBalance] = useState<string>('0');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (customerToEdit) {
      setName(customerToEdit.name);
      setPhone(customerToEdit.phone);
      setEmail(customerToEdit.email || '');
      setAddress(customerToEdit.address || '');
      setCustomerType(customerToEdit.customerType || 'retail');
      setLoyaltyTier(customerToEdit.loyaltyTier || 'bronze');
      setCreditLimit(customerToEdit.creditLimit !== undefined ? customerToEdit.creditLimit.toString() : '5000');
      setOpeningBalance(customerToEdit.dueAmount.toString());
      setNotes(customerToEdit.notes || '');
    } else {
      setName('');
      setPhone('+880 ');
      setEmail('');
      setAddress('');
      setCustomerType('retail');
      setLoyaltyTier('bronze');
      setCreditLimit('5000');
      setOpeningBalance('0');
      setNotes('');
    }
  }, [customerToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('অনুগ্রহ করে গ্রাহকের নাম লিখুন');
      return;
    }
    if (!phone.trim() || phone.trim() === '+880') {
      alert('অনুগ্রহ করে গ্রাহকের মোবাইল নম্বর লিখুন');
      return;
    }

    const due = parseFloat(openingBalance) || 0;
    const limit = parseFloat(creditLimit) || 0;

    const customerPayload: Omit<Customer, 'id'> = {
      tenantId: tenant.id,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      address: address.trim() || undefined,
      customerType,
      loyaltyTier,
      creditLimit: limit,
      totalSpent: customerToEdit ? customerToEdit.totalSpent : due,
      dueAmount: due,
      purchaseCount: customerToEdit ? customerToEdit.purchaseCount : (due > 0 ? 1 : 0),
      lastPurchased: customerToEdit ? customerToEdit.lastPurchased : new Date().toISOString().slice(0, 10),
      notes: notes.trim() || undefined,
      transactions: customerToEdit?.transactions || (due > 0 ? [
        {
          id: 'trx-' + Date.now(),
          customerId: 'temp',
          date: new Date().toISOString().slice(0, 10),
          type: 'opening_balance',
          referenceNo: 'OPB-' + Math.floor(100 + Math.random() * 900),
          description: 'প্রারম্ভিক জের (Opening Balance)',
          debit: due,
          credit: 0,
          balance: due,
          note: 'বাকি খাতা শুরু',
        }
      ] : []),
    };

    onSaveCustomer(customerPayload, customerToEdit?.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-purple-100 overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-purple-800 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
              <UserPlus className="w-5 h-5 text-purple-200" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight">
                {customerToEdit ? 'গ্রাহকের তথ্য সম্পাদনা' : 'নতুন গ্রাহক যুক্ত করুন'}
              </h3>
              <p className="text-xs text-purple-200">
                {tenant.name} • সিআরএম ও বাকি খাতা প্রোফাইল
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
          
          {/* Customer Name */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">গ্রাহকের নাম: *</label>
            <input
              type="text"
              required
              placeholder="যেমন: শামসুল আলম / গ্রীন ভিউ ক্লিনিক"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600 font-semibold"
            />
          </div>

          {/* Phone & Email */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">মোবাইল নম্বর: *</label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="+880 1712-XXXXXX"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">ইমেইল (ঐচ্ছিক):</label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="client@mail.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">পূর্ণ ঠিকানা:</label>
            <div className="relative">
              <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <textarea
                rows={2}
                placeholder="যেমন: ফ্ল্যাট ৪বি, রোড ৯/এ, ধানমন্ডি, ঢাকা"
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>
          </div>

          {/* Customer Type & Loyalty Tier */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">গ্রাহকের ক্যাটাগরি:</label>
              <select
                value={customerType}
                onChange={e => setCustomerType(e.target.value as CustomerType)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none font-semibold text-slate-800"
              >
                <option value="retail">খুচরা ক্রেতা (Retail)</option>
                <option value="wholesale">পাইকারি খরিদ্দার (Wholesale)</option>
                <option value="corporate">কর্পোরেট প্রতিষ্ঠান (Corporate)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">লয়্যালটি টিয়ার (Loyalty Tier):</label>
              <select
                value={loyaltyTier}
                onChange={e => setLoyaltyTier(e.target.value as LoyaltyTier)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none font-semibold text-slate-800"
              >
                <option value="bronze">ব্রোঞ্জ সদস্য (Bronze)</option>
                <option value="silver">সিলভার সদস্য (Silver)</option>
                <option value="gold">গোল্ড মেম্বার (Gold)</option>
                <option value="vip">ভিআইপি কর্পোরেট (VIP)</option>
              </select>
            </div>
          </div>

          {/* Credit Control Section */}
          <div className="p-3.5 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-3">
            <span className="font-extrabold text-purple-900 flex items-center gap-1.5 text-xs">
              <ShieldCheck className="w-4 h-4 text-purple-700" />
              ক্রেডিট লিমিট ও বাকি খাতা নির্ধারণ
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  ক্রেডিট লিমিট সীমা (টাকা):
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">৳</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="5000"
                    value={creditLimit}
                    onChange={e => setCreditLimit(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-800"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">০ দিলে কোনো সীমা প্রযোজ্য নয়</span>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  প্রারম্ভিক বকেয়া (Opening Due):
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">৳</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={openingBalance}
                    onChange={e => setOpeningBalance(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl font-bold text-rose-600"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">পূর্বে কোনো বাকি থাকলে এখানে দিন</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">বিশেষ নোট / লেনদেনের শর্ত:</label>
            <input
              type="text"
              placeholder="যেমন: প্রতি মাসের শুরুতে বকেয়া পরিশোধ করেন"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold transition shadow-xs flex items-center justify-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              {customerToEdit ? 'আপডেট করুন' : 'গ্রাহক সংরক্ষণ করুন'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
