import React from 'react';
import { CustomerPaymentReceipt, Tenant } from '../types';
import { X, Printer, CheckCircle2, Building, Phone, MapPin, Receipt, ShieldCheck } from 'lucide-react';

interface PaymentReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: CustomerPaymentReceipt | null;
  tenant: Tenant;
}

export const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({
  isOpen,
  onClose,
  receipt,
  tenant,
}) => {
  if (!isOpen || !receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-emerald-100 overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col">
        
        {/* Modal Top Bar */}
        <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-xs">মানি রিসিট ভাউচার</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>প্রিন্ট</span>
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Printable Money Receipt Slip (80mm / Standard format) */}
        <div className="p-6 text-slate-900 space-y-4 text-xs font-sans">
          
          {/* Header */}
          <div className="text-center pb-3 border-b border-dashed border-slate-300">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700">টাকা জমার অফিশিয়াল রশিদ</span>
            <h3 className="text-lg font-black text-slate-950 mt-0.5">{tenant.name}</h3>
            <p className="text-[11px] text-slate-500">{tenant.address}</p>
            <p className="text-[11px] text-slate-500">ফোন: {tenant.phone} | হেল্পলাইন: +8801940999830</p>
          </div>

          {/* Receipt Info */}
          <div className="flex justify-between items-center text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-400 block text-[9px] uppercase font-bold">রশিদ নম্বর</span>
              <strong className="font-mono text-purple-800">{receipt.receiptNumber}</strong>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[9px] uppercase font-bold">তারিখ ও সময়</span>
              <span className="font-mono text-slate-700">{receipt.date}</span>
            </div>
          </div>

          {/* Customer Details */}
          <div className="space-y-1.5 py-1 border-b border-slate-200 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">গ্রাহকের নাম:</span>
              <strong className="text-slate-900">{receipt.customerName}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">মোবাইল:</span>
              <span className="font-mono text-slate-700">{receipt.customerPhone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">পেমেন্ট মাধ্যম:</span>
              <span className="uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] border border-emerald-200">
                {receipt.paymentMethod}
              </span>
            </div>
            {receipt.transactionId && (
              <div className="flex justify-between">
                <span className="text-slate-500">ট্রানজেকশন / রেফারেন্স:</span>
                <span className="font-mono text-purple-700 font-bold">{receipt.transactionId}</span>
              </div>
            )}
            {receipt.bankName && (
              <div className="flex justify-between">
                <span className="text-slate-500">ব্যাংক তথ্য:</span>
                <span className="text-slate-700">{receipt.bankName}</span>
              </div>
            )}
            {receipt.note && (
              <div className="flex justify-between">
                <span className="text-slate-500">বিবরণ:</span>
                <span className="text-slate-700 italic">{receipt.note}</span>
              </div>
            )}
          </div>

          {/* Ledger Calculation Breakdown */}
          <div className="space-y-2 py-2">
            <div className="flex justify-between text-slate-600">
              <span>পূর্ববর্তী মোট বকেয়া:</span>
              <span className="font-mono">{tenant.currency}{receipt.previousDue.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center text-sm font-black text-emerald-700 bg-emerald-50 p-2 rounded-xl border border-emerald-200">
              <span>জমা প্রদানকৃত টাকা:</span>
              <span className="font-mono text-base">{tenant.currency}{receipt.amount.toFixed(2)}</span>
            </div>

            {receipt.discount > 0 && (
              <div className="flex justify-between text-amber-700 font-semibold">
                <span>বিশেষ ছাড় (Waiver / Discount):</span>
                <span className="font-mono">{tenant.currency}{receipt.discount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-xs font-extrabold text-slate-900 pt-1 border-t border-slate-200">
              <span>বর্তমান অবশিষ্ট বকেয়া:</span>
              <span className={`font-mono text-sm ${receipt.remainingDue > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                {tenant.currency}{receipt.remainingDue.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Signatures */}
          <div className="pt-6 border-t border-dashed border-slate-300 grid grid-cols-2 gap-4 text-center text-[10px] text-slate-500">
            <div>
              <div className="border-t border-slate-400 pt-1">
                জমা প্রদানকারী (গ্রাহক)
              </div>
            </div>
            <div>
              <div className="border-t border-slate-400 pt-1">
                আদায়কারী: <strong>{receipt.collectedBy}</strong>
              </div>
            </div>
          </div>

          {/* Footer branding */}
          <div className="text-center text-[9px] text-slate-400 pt-2 border-t border-slate-100">
            সফটওয়্যার প্রস্তুতকারক: <strong>JH Soft Corporation</strong> • Helpline: +8801940999830
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex gap-2 print:hidden">
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
          >
            <Printer className="w-4 h-4" />
            রশিদ প্রিন্ট করুন
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold transition"
          >
            বন্ধ
          </button>
        </div>

      </div>
    </div>
  );
};
