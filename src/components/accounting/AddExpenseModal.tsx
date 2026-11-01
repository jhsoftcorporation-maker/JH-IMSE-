import React, { useState } from 'react';
import { X, DollarSign, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import { Tenant, ExpenseItem, ExpenseCategory } from '../../types';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: Tenant;
  onAddExpense: (expense: Omit<ExpenseItem, 'id' | 'voucherNo' | 'createdAt'>) => void;
  defaultApprover?: string;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  tenant,
  onAddExpense,
  defaultApprover = 'ম্যানেজার / হিসাবরক্ষক',
}) => {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState<ExpenseCategory>('utilities');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bkash' | 'nagad' | 'bank'>('cash');
  const [referenceNo, setReferenceNo] = useState('');
  const [paidTo, setPaidTo] = useState('');
  const [approvedBy, setApprovedBy] = useState(defaultApprover);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('সঠিক খরচের পরিমাণ দিন');
      return;
    }

    onAddExpense({
      tenantId: tenant.id,
      date,
      category,
      title,
      description: description.trim() || undefined,
      amount: numAmount,
      paymentMethod,
      referenceNo: referenceNo.trim() || undefined,
      paidTo: paidTo.trim() || undefined,
      approvedBy: approvedBy.trim() || 'ম্যানেজার',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-bold text-base">নতুন খরচ এন্ট্রি (Expense Voucher)</h3>
              <p className="text-xs text-emerald-200">{tenant.name} • দৈনিক হিসাব খাতা</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-emerald-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">তারিখ: *</label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full pl-3 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">খরচের ক্যাটাগরি: *</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as ExpenseCategory)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none bg-slate-50 font-medium"
              >
                <option value="rent">দোকান / গোডাউন ভাড়া (Rent)</option>
                <option value="utilities">বিদ্যুৎ, পানি ও ইন্টারনেট বিল (Utilities)</option>
                <option value="salaries">স্টাফ বেতন ও অগ্রিম (Salaries)</option>
                <option value="food_entertainment">স্টাফ খাবার ও নাস্তা (Food & Snacks)</option>
                <option value="transport_courier">পরিবহন ও কুরিয়ার ভাড়া (Transport)</option>
                <option value="packaging">প্যাকেজিং ও শপিং ব্যাগ (Packaging)</option>
                <option value="marketing">বিজ্ঞাপন ও মার্কেটিং (Marketing)</option>
                <option value="maintenance">দোকান সংস্কার ও মেরামত (Maintenance)</option>
                <option value="tax_trade_license">ট্যাক্স, ভ্যাট ও ট্রেড লাইসেন্স ফি</option>
                <option value="other">অন্যান্য বিবিধ খরচ (Miscellaneous)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">খরচের শিরোনাম বা বিবরণ: *</label>
            <input
              type="text"
              required
              placeholder="যেমন: ডেসকো বিদ্যুৎ বিল সেপ্টেম্বর অথবা ৫ জন স্টাফের দুপুরের খাবার"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">খরচের পরিমাণ ({tenant.currency}): *</label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full pl-3 pr-3 py-2 border border-slate-200 rounded-xl font-black text-sm text-emerald-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">পেমেন্ট মাধ্যম: *</label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none uppercase font-bold"
              >
                <option value="cash">নগদ ক্যাশ (Cash)</option>
                <option value="bkash">বিকাশ (bKash)</option>
                <option value="nagad">নগদ (Nagad)</option>
                <option value="bank">ব্যাংক ট্রান্সফার / চেক (Bank)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">গ্রহীতা / কাকে দেওয়া হলো:</label>
              <input
                type="text"
                placeholder="যেমন: বাড়িওয়ালা আবুল কাশেম / ডিপিডিসি"
                value={paidTo}
                onChange={e => setPaidTo(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">রেফারেন্স / ভাউচার / TrxID:</label>
              <input
                type="text"
                placeholder="যেমন: BILL-9921 অথবা BK-88124"
                value={referenceNo}
                onChange={e => setReferenceNo(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">অনুমোদনকারী (Approved By):</label>
            <input
              type="text"
              value={approvedBy}
              onChange={e => setApprovedBy(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">অতিরিক্ত নোট বা মন্তব্য (ঐচ্ছিক):</label>
            <textarea
              rows={2}
              placeholder="খরচ সংক্রান্ত কোনো বাড়তি তথ্য থাকলে এখানে লিখুন..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
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
              className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold transition shadow-sm flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" /> খরচ সংরক্ষণ করুন
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
