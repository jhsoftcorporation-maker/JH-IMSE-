import React from 'react';
import { X, Printer, ShoppingCart, Sparkles, Building2 } from 'lucide-react';
import { Tenant, AutoPurchaseOrder } from '../../types';

interface PrintAutoPOModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: Tenant;
  autoPo: AutoPurchaseOrder | null;
}

export const PrintAutoPOModal: React.FC<PrintAutoPOModalProps> = ({
  isOpen,
  onClose,
  tenant,
  autoPo,
}) => {
  if (!isOpen || !autoPo) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-150">
        {/* Top Control Bar */}
        <div className="bg-slate-900 text-white px-6 py-3 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-purple-400" />
            <span className="font-bold text-sm">পারচেজ অর্ডার প্রিন্ট ভিউ ({autoPo.autoPoNumber})</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Printer className="w-4 h-4" /> প্রিন্ট / PDF সংরক্ষণ
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 overflow-y-auto space-y-6 text-slate-800 text-xs print:p-0 print:m-0" id="auto-po-printable">
          {/* Header */}
          <div className="border-b-2 border-purple-900 pb-4">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight">{tenant.name}</h1>
                <p className="text-slate-600 font-medium text-xs mt-0.5">{tenant.address}</p>
                <div className="flex items-center gap-4 text-[11px] text-slate-500 mt-1">
                  <span>ফোন: {tenant.phone}</span>
                  {tenant.taxVatNo && <span>মুসক/BIN: {tenant.taxVatNo}</span>}
                  {tenant.email && <span>ইমেইল: {tenant.email}</span>}
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1 bg-purple-900 text-white text-xs font-extrabold uppercase tracking-wider rounded-lg">
                  পারচেজ অর্ডার (PURCHASE ORDER)
                </span>
                <div className="font-mono font-black text-purple-800 text-sm mt-1">
                  {autoPo.autoPoNumber}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  তারিখ: {autoPo.generatedDate.slice(0, 10)}
                </div>
              </div>
            </div>
          </div>

          {/* Supplier Info & Delivery Date */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="font-bold text-[10px] uppercase text-purple-700 tracking-wider block mb-1">
                সরবরাহকারী প্রতিষ্ঠান (Vendor / Supplier):
              </span>
              <div className="font-bold text-slate-900 text-sm">{autoPo.supplierName}</div>
              <p className="text-[11px] text-slate-600 mt-0.5">যোগাযোগ: {autoPo.supplierPhone || tenant.phone}</p>
              {autoPo.supplierEmail && (
                <p className="text-[11px] text-slate-500 font-mono">ইমেইল: {autoPo.supplierEmail}</p>
              )}
            </div>

            <div>
              <span className="font-bold text-[10px] uppercase text-slate-500 tracking-wider block mb-1">
                ডেলিভারি সংক্রান্ত বিবরণ:
              </span>
              <div className="text-[11px] space-y-1">
                <div>
                  <span className="text-slate-500">প্রত্যাশিত ডেলিভারির তারিখ:</span>{' '}
                  <strong className="text-slate-800 font-mono">{autoPo.deliveryExpectedDate || 'অনতিবিলম্বে'}</strong>
                </div>
                <div>
                  <span className="text-slate-500">ডেলিভারির স্থান:</span>{' '}
                  <strong className="text-slate-800">{tenant.address}</strong>
                </div>
                <div>
                  <span className="text-slate-500">অর্ডার স্ট্যাটাস:</span>{' '}
                  <span className="font-bold uppercase text-purple-800">{autoPo.status}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-slate-300 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300 text-[11px]">
                <tr>
                  <th className="py-2.5 px-3 w-10 text-center">ক্রম</th>
                  <th className="py-2.5 px-3">পণ্য বিবরণী ও স্পেসিফিকেশন</th>
                  <th className="py-2.5 px-3 text-center">কোড / SKU</th>
                  <th className="py-2.5 px-3 text-center">অর্ডারের পরিমাণ</th>
                  <th className="py-2.5 px-3 text-right">ইউনিট ক্রয়মূল্য</th>
                  <th className="py-2.5 px-3 text-right">মোট টাকা</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {autoPo.items.map((item, idx) => (
                  <tr key={item.productId} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 text-center font-mono text-slate-500">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{item.productName}</td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-600">{item.sku}</td>
                    <td className="py-2.5 px-3 text-center font-bold font-mono text-purple-900">
                      {item.orderQty} {item.unit}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                      {tenant.currency}{item.unitCost.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      {tenant.currency}{item.totalCost.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-100 font-bold border-t border-slate-300 text-slate-900">
                <tr>
                  <td colSpan={5} className="py-2.5 px-3 text-right">
                    সর্বমোট অর্ডারের মূল্য:
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-sm text-purple-900">
                    {tenant.currency}{autoPo.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Delivery Instructions */}
          {autoPo.notes && (
            <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200">
              <span className="font-bold text-purple-950 block mb-0.5 text-[11px]">বিশেষ নির্দেশনা / নোট:</span>
              <p className="text-purple-900 text-[11px] leading-relaxed">{autoPo.notes}</p>
            </div>
          )}

          {/* Signatures */}
          <div className="pt-12 grid grid-cols-3 gap-6 text-center text-[11px] text-slate-600">
            <div className="border-t border-slate-400 pt-1.5">
              <p className="font-bold text-slate-900">প্রস্তুতকারী / পারচেজ অফিসার</p>
              <p className="text-[10px] text-slate-400">JH IMSE AI Engine</p>
            </div>
            <div className="border-t border-slate-400 pt-1.5">
              <p className="font-bold text-slate-900">ইনভেন্টরি ম্যানেজার</p>
              <p className="text-[10px] text-slate-400">স্টক যাচাই ও সুপারিশ</p>
            </div>
            <div className="border-t border-slate-400 pt-1.5">
              <p className="font-bold text-slate-900">{tenant.ownerName}</p>
              <p className="text-[10px] text-slate-400">অনুমোদনকারী কর্তৃপক্ষ / স্বত্বাধিকারী</p>
            </div>
          </div>

          <div className="text-center text-[10px] text-slate-400 pt-2 border-t border-slate-100">
            * এটি একটি স্বয়ংক্রিয় এআই পারচেজ অর্ডার। জেএইচ আইএমএসই (JH IMSE) অটোনোমাস সাপ্লাই চেইন প্ল্যাটফর্ম দ্বারা নির্মিত।
          </div>
        </div>
      </div>
    </div>
  );
};
