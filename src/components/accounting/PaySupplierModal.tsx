import React, { useState } from 'react';
import { X, DollarSign, CheckCircle2, Building, CreditCard } from 'lucide-react';
import { Tenant, Supplier, SupplierPayment } from '../../types';

interface PaySupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: Tenant;
  supplier: Supplier | null;
  onRecordPayment: (payment: SupplierPayment) => void;
  defaultPayer?: string;
}

export const PaySupplierModal: React.FC<PaySupplierModalProps> = ({
  isOpen,
  onClose,
  tenant,
  supplier,
  onRecordPayment,
  defaultPayer = 'ম্যানেজার / স্বত্বাধিকারী',
}) => {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bkash' | 'nagad' | 'bank'>('bank');
  const [transactionId, setTransactionId] = useState('');
  const [note, setNote] = useState('');
  const [paidBy, setPaidBy] = useState(defaultPayer);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  if (!isOpen || !supplier) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payAmount = parseFloat(amount);
    if (isNaN(payAmount) || payAmount <= 0) {
      alert('সঠিক পরিশোধিত টাকার পরিমাণ দিন');
      return;
    }

    const remainingDue = Math.max(0, supplier.dueBalance - payAmount);
    const voucherNo = 'SP-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + Math.floor(100 + Math.random() * 900);

    const payment: SupplierPayment = {
      id: 'sp-' + Date.now(),
      tenantId: tenant.id,
      paymentVoucherNo: voucherNo,
      supplierId: supplier.id,
      supplierName: supplier.companyName || supplier.name,
      supplierPhone: supplier.phone,
      date,
      amount: payAmount,
      paymentMethod,
      transactionId: transactionId.trim() || undefined,
      remainingDue,
      note: note.trim() || undefined,
      paidBy: paidBy.trim() || defaultPayer,
      createdAt: new Date().toISOString(),
    };

    onRecordPayment(payment);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="bg-gradient-to-r from-blue-800 to-indigo-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <h3 className="font-bold text-base">মহাজন / সাপ্লায়ারকে বিল পরিশোধ</h3>
              <p className="text-xs text-blue-200">{supplier.companyName || supplier.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-blue-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Supplier Due Stats Card */}
          <div className="p-3.5 bg-blue-50/70 rounded-2xl border border-blue-100 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-500 font-medium">বর্তমান মোট দেনা বকেয়া:</span>
              <div className="font-mono font-black text-rose-600 text-lg">
                {tenant.currency}{supplier.dueBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-500 font-medium">যোগাযোগ:</span>
              <div className="font-mono font-bold text-slate-800 text-xs mt-0.5">{supplier.phone}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">তারিখ: *</label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">পেমেন্ট মাধ্যম: *</label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none uppercase font-bold"
              >
                <option value="bank">ব্যাংক চেক / ট্রান্সফার</option>
                <option value="cash">নগদ ক্যাশ (Cash)</option>
                <option value="bkash">বিকাশ মার্চেন্ট</option>
                <option value="nagad">নগদ মার্চেন্ট</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">পরিশোধিত টাকার পরিমাণ ({tenant.currency}): *</label>
            <input
              type="number"
              step="any"
              required
              placeholder="0.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl font-black text-base text-blue-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none"
            />
            {amount && !isNaN(parseFloat(amount)) && (
              <p className="text-[11px] text-slate-500 mt-1 font-medium">
                পরিশোধের পর অবশিষ্ট দেনা থাকবে: {' '}
                <strong className="text-emerald-700 font-mono">
                  {tenant.currency}{Math.max(0, supplier.dueBalance - parseFloat(amount)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </strong>
              </p>
            )}
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">চেক নম্বর / ব্যাংক ড্রাফট / TrxID:</label>
            <input
              type="text"
              placeholder="যেমন: DBBL Check #449102 অথবা TrxID: BK-99210"
              value={transactionId}
              onChange={e => setTransactionId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">পরিশোধকারীর নাম / সাক্ষ্য:</label>
            <input
              type="text"
              value={paidBy}
              onChange={e => setPaidBy(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">মন্তব্য বা বিলের বিবরণ:</label>
            <textarea
              rows={2}
              placeholder="যেমন: চালান নং CH-8819 এর আংশিক পরিশোধ..."
              value={note}
              onChange={e => setNote(e.target.value)}
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
              <CheckCircle2 className="w-4 h-4" /> পেমেন্ট সম্পন্ন করুন
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
