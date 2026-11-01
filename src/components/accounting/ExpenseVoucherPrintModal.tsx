import React from 'react';
import { X, Printer, Receipt, ShieldCheck } from 'lucide-react';
import { Tenant, ExpenseItem } from '../../types';

interface ExpenseVoucherPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: Tenant;
  expense: ExpenseItem | null;
}

export const ExpenseVoucherPrintModal: React.FC<ExpenseVoucherPrintModalProps> = ({
  isOpen,
  onClose,
  tenant,
  expense,
}) => {
  if (!isOpen || !expense) return null;

  const handlePrint = () => {
    window.print();
  };

  const getCategoryName = (cat: string) => {
    switch (cat) {
      case 'rent': return 'দোকান / গোডাউন ভাড়া';
      case 'utilities': return 'বিদ্যুৎ, পানি ও গ্যাস বিল';
      case 'salaries': return 'স্টাফ বেতন ও ভাতাদি';
      case 'food_entertainment': return 'খাবার ও অতিথি আপ্যায়ন';
      case 'transport_courier': return 'পরিবহন ও যাতায়াত';
      case 'packaging': return 'প্যাকেজিং ও শপিং ব্যাগ';
      case 'marketing': return 'বিজ্ঞাপন ও প্রচারণা';
      case 'maintenance': return 'মেরামত ও মেইনটেনেন্স';
      case 'tax_trade_license': return 'ট্যাক্স ও লাইসেন্স ফি';
      default: return 'অন্যান্য বিবিধ খরচ';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Top Controls */}
        <div className="p-4 bg-slate-100 border-b border-slate-200 flex justify-between items-center print:hidden">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-700" />
            <span className="font-bold text-slate-800 text-sm">ডেবিট / খরচ ভাউচার প্রিন্ট প্রিভিউ</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" /> প্রিন্ট করুন
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Voucher Content */}
        <div className="p-8 text-slate-900 space-y-6 bg-white" id="printable-expense-voucher">
          {/* Header */}
          <div className="text-center border-b-2 border-slate-900 pb-4">
            <h2 className="text-xl font-extrabold text-slate-950 uppercase tracking-wide">{tenant.name}</h2>
            <p className="text-xs text-slate-600 mt-0.5">{tenant.address}</p>
            <p className="text-xs text-slate-600 font-mono">মোবাইল: {tenant.phone} • {tenant.email}</p>
            <div className="inline-block mt-3 px-4 py-1 bg-slate-900 text-white rounded font-bold text-xs uppercase tracking-wider">
              খরচের ডেবিট ভাউচার (DEBIT EXPENSE VOUCHER)
            </div>
          </div>

          {/* Voucher Meta */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-slate-500 font-medium">ভাউচার নম্বর:</p>
              <p className="font-mono font-bold text-slate-900 text-sm">{expense.voucherNo}</p>
              <p className="text-slate-500 font-medium mt-2">তারিখ:</p>
              <p className="font-semibold text-slate-900">{expense.date}</p>
            </div>
            <div className="text-right">
              <p className="text-slate-500 font-medium">পেমেন্ট মাধ্যম:</p>
              <p className="font-bold text-slate-900 uppercase">{expense.paymentMethod}</p>
              {expense.referenceNo && (
                <>
                  <p className="text-slate-500 font-medium mt-2">রেফারেন্স / TrxID:</p>
                  <p className="font-mono text-slate-800">{expense.referenceNo}</p>
                </>
              )}
            </div>
          </div>

          {/* Details Table */}
          <div className="border border-slate-300 rounded-lg overflow-hidden text-xs">
            <div className="bg-slate-100 p-2.5 font-bold border-b border-slate-300 flex justify-between">
              <span>খরচের খাত ও বিবরণ</span>
              <span>পরিমাণ</span>
            </div>
            <div className="p-3 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-bold text-slate-900">{expense.title}</span>
                  <span className="block text-[11px] text-slate-500 mt-0.5">
                    ক্যাটাগরি: <strong>{getCategoryName(expense.category)}</strong>
                  </span>
                  {expense.paidTo && (
                    <span className="block text-[11px] text-slate-500 mt-0.5">
                      প্রাপক / Paid To: <strong>{expense.paidTo}</strong>
                    </span>
                  )}
                  {expense.description && (
                    <p className="text-[11px] text-slate-600 italic mt-1 bg-slate-50 p-1.5 rounded">
                      নোট: {expense.description}
                    </p>
                  )}
                </div>
                <span className="font-mono font-extrabold text-base text-slate-900">
                  {tenant.currency}{expense.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
            <div className="bg-slate-50 p-2.5 font-bold border-t border-slate-300 flex justify-between items-center text-sm">
              <span>সর্বমোট প্রদেয় টাকা:</span>
              <span className="font-mono text-base font-black text-emerald-800">
                {tenant.currency}{expense.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Authorized Signatures */}
          <div className="grid grid-cols-3 gap-4 pt-12 text-center text-[11px] text-slate-600">
            <div className="border-t border-slate-400 pt-1">
              গ্রহীতার স্বাক্ষর
            </div>
            <div className="border-t border-slate-400 pt-1">
              হিসাবরক্ষক
            </div>
            <div className="border-t border-slate-400 pt-1 font-bold text-slate-900">
              অনুমোদনকারী স্বাক্ষর<br />
              <span className="text-[10px] text-slate-500 font-normal">{expense.approvedBy}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
