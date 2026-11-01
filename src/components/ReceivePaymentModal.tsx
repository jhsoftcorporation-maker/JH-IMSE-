import React, { useState } from 'react';
import { Customer, Tenant, CustomerPaymentReceipt } from '../types';
import { 
  X, DollarSign, CreditCard, CheckCircle2, ShieldCheck, 
  AlertCircle, ArrowRight, Building, Phone, Receipt
} from 'lucide-react';

interface ReceivePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  tenant: Tenant;
  cashierName?: string;
  onPaymentReceived: (receipt: CustomerPaymentReceipt) => void;
}

export const ReceivePaymentModal: React.FC<ReceivePaymentModalProps> = ({
  isOpen,
  onClose,
  customer,
  tenant,
  cashierName = 'ক্যাশিয়ার',
  onPaymentReceived,
}) => {
  const [amountPaid, setAmountPaid] = useState<string>('');
  const [discountAmount, setDiscountAmount] = useState<string>('0');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bkash' | 'nagad' | 'bank'>('cash');
  const [transactionId, setTransactionId] = useState<string>('');
  const [bankName, setBankName] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [generatedReceipt, setGeneratedReceipt] = useState<CustomerPaymentReceipt | null>(null);

  if (!isOpen || !customer) return null;

  const currentDue = customer.dueAmount;
  const numPaid = parseFloat(amountPaid) || 0;
  const numDiscount = parseFloat(discountAmount) || 0;
  const totalSettled = numPaid + numDiscount;
  const remainingDue = Math.max(0, currentDue - totalSettled);

  const handleQuickAmount = (amt: number) => {
    setAmountPaid(amt.toString());
  };

  const handleFullDue = () => {
    setAmountPaid(currentDue.toString());
    setDiscountAmount('0');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (numPaid <= 0 && numDiscount <= 0) {
      alert('অনুগ্রহ করে প্রাপ্ত টাকার পরিমাণ অথবা ছাড়ের পরিমাণ দিন।');
      return;
    }

    if (totalSettled > currentDue) {
      if (!confirm(`প্রাপ্ত টাকা ও ছাড় (৳${totalSettled}) মোট বকেয়া (৳${currentDue}) এর চেয়ে বেশি। আপনি কি এই লেনদেন নিশ্চিত করতে চান?`)) {
        return;
      }
    }

    const receiptNo = `MR-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;

    const newReceipt: CustomerPaymentReceipt = {
      id: 'rec-' + Date.now(),
      receiptNumber: receiptNo,
      tenantId: tenant.id,
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      amount: numPaid,
      discount: numDiscount,
      paymentMethod,
      transactionId: transactionId.trim() || undefined,
      bankName: bankName.trim() || undefined,
      previousDue: currentDue,
      remainingDue,
      date: new Date().toLocaleString('en-GB'),
      collectedBy: cashierName,
      note: notes.trim() || undefined,
    };

    setGeneratedReceipt(newReceipt);
    setIsSuccess(true);
    onPaymentReceived(newReceipt);
  };

  const handleResetAndClose = () => {
    setAmountPaid('');
    setDiscountAmount('0');
    setPaymentMethod('cash');
    setTransactionId('');
    setBankName('');
    setNotes('');
    setIsSuccess(false);
    setGeneratedReceipt(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-emerald-100 overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
              <DollarSign className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight">বকেয়া জমা গ্রহণ (Receive Due Payment)</h3>
              <p className="text-xs text-emerald-200">
                ডিজিটাল মানি রিসিট ভাউচার ও খাতা সমন্বয়
              </p>
            </div>
          </div>

          <button
            onClick={handleResetAndClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content State: Success Voucher Confirmation */}
        {isSuccess && generatedReceipt ? (
          <div className="p-6 space-y-5 text-center">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">টাকা সফলভাবে জমা হয়েছে</span>
              <h4 className="text-xl font-black text-slate-900 mt-1">
                {tenant.currency}{generatedReceipt.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                রশিদ নম্বর: <strong className="font-mono text-purple-700">{generatedReceipt.receiptNumber}</strong>
              </p>
            </div>

            {/* Quick Summary Card */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">গ্রাহকের নাম:</span>
                <strong className="text-slate-900">{generatedReceipt.customerName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">পেমেন্ট মাধ্যম:</span>
                <span className="uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {generatedReceipt.paymentMethod}
                </span>
              </div>
              {generatedReceipt.discount > 0 && (
                <div className="flex justify-between text-amber-700">
                  <span>বিশেষ ছাড় (Discount):</span>
                  <strong>{tenant.currency}{generatedReceipt.discount.toFixed(2)}</strong>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-slate-200">
                <span className="text-slate-500">পূর্ববর্তী মোট বকেয়া:</span>
                <span>{tenant.currency}{generatedReceipt.previousDue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900">
                <span>বর্তমান অবশিষ্ট বকেয়া:</span>
                <span className={generatedReceipt.remainingDue > 0 ? 'text-rose-600' : 'text-emerald-700'}>
                  {tenant.currency}{generatedReceipt.remainingDue.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Receipt className="w-4 h-4" />
                রশিদ প্রিন্ট করুন
              </button>
              <button
                type="button"
                onClick={handleResetAndClose}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
              >
                সম্পন্ন ও বন্ধ
              </button>
            </div>
          </div>
        ) : (
          /* Form Content */
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
            
            {/* Customer Details Header Bar */}
            <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm">{customer.name}</h4>
                <p className="text-slate-500 font-mono text-[11px]">{customer.phone}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">বর্তমান বকেয়া</span>
                <span className="text-base font-black text-rose-600">
                  {tenant.currency}{currentDue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Quick Preset Buttons */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="font-bold text-slate-700">দ্রুত টাকার পরিমাণ সিলেক্ট করুন:</label>
                <button
                  type="button"
                  onClick={handleFullDue}
                  className="text-emerald-700 font-bold hover:underline"
                >
                  সব বকেয়া (৳{currentDue})
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[500, 1000, 2000, 5000].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleQuickAmount(amt)}
                    className="py-1.5 px-2 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 border border-slate-200 rounded-xl font-bold transition text-slate-700 text-center"
                  >
                    ৳{amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount Inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">প্রাপ্ত টাকা (Amount Received): *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">৳</span>
                  <input
                    type="number"
                    step="any"
                    required
                    min="1"
                    placeholder="0.00"
                    value={amountPaid}
                    onChange={e => setAmountPaid(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-emerald-50/50 border border-emerald-300 rounded-xl text-sm font-extrabold text-emerald-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">বিশেষ ছাড় (Discount / Waiver):</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">৳</span>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    placeholder="0.00"
                    value={discountAmount}
                    onChange={e => setDiscountAmount(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="font-bold text-slate-700 block mb-1.5">পেমেন্ট মাধ্যম:</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'cash', label: 'নগদ ক্যাশ', icon: DollarSign },
                  { id: 'bkash', label: 'বিকাশ (bKash)', icon: Phone },
                  { id: 'nagad', label: 'নগদ (Nagad)', icon: Phone },
                  { id: 'bank', label: 'ব্যাংক ট্রান্সফার', icon: Building },
                ].map(pm => {
                  const Icon = pm.icon;
                  const isSel = paymentMethod === pm.id;
                  return (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setPaymentMethod(pm.id as any)}
                      className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition ${
                        isSel 
                          ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-xs' 
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="text-[10px] text-center leading-tight">{pm.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Conditional Transaction ID or Bank details */}
            {(paymentMethod === 'bkash' || paymentMethod === 'nagad') && (
              <div>
                <label className="font-semibold text-slate-700 block mb-1">MFS ট্রানজেকশন আইডি (TrxID):</label>
                <input
                  type="text"
                  placeholder="যেমন: BK9812A45"
                  value={transactionId}
                  onChange={e => setTransactionId(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs uppercase font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-600"
                />
              </div>
            )}

            {paymentMethod === 'bank' && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">ব্যাংক ও ব্রাঞ্চের নাম:</label>
                  <input
                    type="text"
                    placeholder="যেমন: ব্র্যাক ব্যাংক, ধানমন্ডি শাখা"
                    value={bankName}
                    onChange={e => setBankName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">চেক নং / EFTN রেফারেন্স:</label>
                  <input
                    type="text"
                    placeholder="BEFTN-88129"
                    value={transactionId}
                    onChange={e => setTransactionId(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>
            )}

            {/* Note / Remarks */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">মন্তব্য / নোট (ঐচ্ছিক):</label>
              <input
                type="text"
                placeholder="যেমন: অক্টোবর মাসের বকেয়া আংশিক পরিশোধ"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none"
              />
            </div>

            {/* Live Remaining Balance Calculation Preview */}
            <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-purple-700 uppercase font-bold block">জমার পর অবশিষ্ট বকেয়া:</span>
                <span className={`text-base font-black ${remainingDue > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {tenant.currency}{remainingDue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="text-right text-[11px] text-purple-900 font-medium">
                <div>জমা: ৳{numPaid.toFixed(2)}</div>
                {numDiscount > 0 && <div>ছাড়: ৳{numDiscount.toFixed(2)}</div>}
              </div>
            </div>

            {/* Submit Actions */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                জমা নিশ্চিত করুন
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
