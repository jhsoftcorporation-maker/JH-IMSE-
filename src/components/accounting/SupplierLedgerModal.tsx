import React from 'react';
import { X, Printer, Building, FileSpreadsheet, DollarSign, Calendar } from 'lucide-react';
import { Tenant, Supplier, SupplierTransaction } from '../../types';

interface SupplierLedgerModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: Supplier | null;
  tenant: Tenant;
  onOpenPaySupplier: (sup: Supplier) => void;
}

export const SupplierLedgerModal: React.FC<SupplierLedgerModalProps> = ({
  isOpen,
  onClose,
  supplier,
  tenant,
  onOpenPaySupplier,
}) => {
  if (!isOpen || !supplier) return null;

  const handlePrint = () => {
    window.print();
  };

  const transactions = supplier.transactions || [];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header Controls */}
        <div className="p-4 bg-slate-100 border-b border-slate-200 flex justify-between items-center print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-700 text-white flex items-center justify-center">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">মহাজন / সাপ্লায়ার লেজার স্টেটমেন্ট</h3>
              <p className="text-[11px] text-slate-500">{supplier.companyName || supplier.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenPaySupplier(supplier)}
              className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <DollarSign className="w-3.5 h-3.5" /> বিল পরিশোধ করুন
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" /> প্রিন্ট
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs bg-white" id="printable-supplier-ledger">
          {/* Supplier Info Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-slate-200 gap-3">
            <div>
              <h2 className="text-base font-extrabold text-slate-950">{supplier.companyName}</h2>
              <p className="text-slate-600 font-medium">{supplier.name} • {supplier.category}</p>
              <p className="text-slate-500 text-[11px] font-mono mt-0.5">📞 {supplier.phone} {supplier.email ? `• ✉️ ${supplier.email}` : ''}</p>
              <p className="text-slate-500 text-[11px]">📍 {supplier.address}</p>
              {supplier.bankAccountDetails && (
                <p className="text-blue-800 text-[11px] font-mono mt-0.5">💳 {supplier.bankAccountDetails}</p>
              )}
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-right min-w-[200px]">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">বর্তমান প্রদেয় বকেয়া (Accounts Payable)</span>
              <span className="text-xl font-black text-rose-600 font-mono block mt-0.5">
                {tenant.currency}{supplier.dueBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <div className="text-[10px] text-slate-500 mt-1 flex justify-between border-t border-slate-200 pt-1">
                <span>মোট ক্রয়: ৳{supplier.totalPurchases.toLocaleString()}</span>
                <span>মোট পরিশোধ: ৳{supplier.totalPaid.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Ledger Table */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">লেনদেনের ইতিহাস ও খতিয়ান (Debit / Credit Ledger)</h4>
              <span className="text-slate-400 text-[11px]">মোট রেকর্ড: {transactions.length} টি</span>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">তারিখ</th>
                    <th className="py-2.5 px-3">রেফারেন্স / ভাউচার</th>
                    <th className="py-2.5 px-3">বিবরণ ও মাধ্যম</th>
                    <th className="py-2.5 px-3 text-right">মাল ক্রয় / ডেবিট (বিল)</th>
                    <th className="py-2.5 px-3 text-right">টাকা পরিশোধ / ক্রেডিট</th>
                    <th className="py-2.5 px-3 text-right">অবশিষ্ট দেনা (Balance)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        কোনো লেনদেন রেকর্ড পাওয়া যায়নি।
                      </td>
                    </tr>
                  ) : (
                    transactions.map((trx: any, idx: number) => (
                      <tr key={trx.id || idx} className="hover:bg-slate-50/70 transition">
                        <td className="py-2.5 px-3 font-mono text-slate-600 text-[11px]">{trx.date}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-blue-800 text-[11px]">{trx.referenceNo}</td>
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-slate-900">{trx.description}</div>
                          {trx.note && <div className="text-[10px] text-slate-400">{trx.note}</div>}
                          {trx.paymentMethod && (
                            <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
                              {trx.paymentMethod}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-700">
                          {trx.debit > 0 ? `${tenant.currency}${trx.debit.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                          {trx.credit > 0 ? `${tenant.currency}${trx.credit.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-black text-slate-900">
                          {tenant.currency}{trx.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Statement Footer */}
          <div className="pt-8 border-t border-slate-200 flex justify-between items-center text-[11px] text-slate-500">
            <div>
              সফটওয়্যার জেনারেটেড মহাজন খাতা স্টেটমেন্ট • <strong>JH IMSE Cloud ERP</strong>
            </div>
            <div className="text-right">
              তারিখ: {new Date().toLocaleDateString('bn-BD')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
