import React from 'react';
import { X, Printer, Truck, CheckCircle2, ShieldCheck, Building2, Barcode } from 'lucide-react';
import { Tenant, StockTransferChallan } from '../../types';

interface TransferChallanPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: Tenant;
  challan: StockTransferChallan | null;
}

export const TransferChallanPrintModal: React.FC<TransferChallanPrintModalProps> = ({
  isOpen,
  onClose,
  tenant,
  challan,
}) => {
  if (!isOpen || !challan) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-150">
        {/* Top Control Bar */}
        <div className="bg-slate-900 text-white px-6 py-3 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-indigo-400" />
            <span className="font-bold text-sm">গেটপাস ও ট্রান্সফার চালান ভিউ ({challan.transferNo})</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
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
        <div className="p-8 overflow-y-auto space-y-6 text-slate-800 text-xs print:p-0 print:m-0" id="transfer-challan-printable">
          {/* Header */}
          <div className="border-b-2 border-slate-800 pb-4">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight">{tenant.name}</h1>
                <p className="text-slate-600 font-medium text-xs mt-0.5">{tenant.address}</p>
                <div className="flex items-center gap-4 text-[11px] text-slate-500 mt-1">
                  <span>ফোন: {tenant.phone}</span>
                  {tenant.taxVatNo && <span>মুসক/BIN: {tenant.taxVatNo}</span>}
                  {tenant.tradeLicenseNo && <span>ট্রেড লাইসেন্স: {tenant.tradeLicenseNo}</span>}
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1 bg-slate-900 text-white text-xs font-extrabold uppercase tracking-wider rounded-lg">
                  ইন্টার-ব্রাঞ্চ স্টক ট্রান্সফার চালান ও গেটপাস
                </span>
                <div className="font-mono font-black text-indigo-700 text-sm mt-1">
                  {challan.transferNo}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  তারিখ: {challan.dispatchedAt.slice(0, 16)}
                </div>
              </div>
            </div>
          </div>

          {/* Route & Driver Details */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="font-bold text-[10px] uppercase text-slate-400 tracking-wider block mb-1">
                উৎস ওয়্যারহাউস (Source Depot):
              </span>
              <div className="font-bold text-slate-900 text-sm">{challan.sourceWarehouseName}</div>
              <p className="text-[11px] text-slate-600 mt-0.5">সেন্ট্রাল ডিস্ট্রিবিউশন ডিপো</p>
              <p className="text-[11px] text-slate-500">অনুমোদনকারী: {challan.dispatchedBy}</p>
            </div>

            <div>
              <span className="font-bold text-[10px] uppercase text-indigo-600 tracking-wider block mb-1">
                গন্তব্য শাখা (Destination Branch):
              </span>
              <div className="font-bold text-indigo-950 text-sm">{challan.destinationBranchName}</div>
              {challan.requisitionNo && (
                <p className="text-[11px] text-indigo-700 font-medium mt-0.5">
                  রেফারেন্স রিকুইজিশন: <span className="font-mono">{challan.requisitionNo}</span>
                </p>
              )}
              {challan.grnNo && (
                <p className="text-[11px] text-emerald-700 font-bold">
                  জিআরএন নং: <span className="font-mono">{challan.grnNo}</span>
                </p>
              )}
            </div>
          </div>

          {/* Logistics & Gatepass Vehicle Info */}
          <div className="grid grid-cols-3 gap-3 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 text-[11px]">
            <div>
              <span className="text-slate-500 block">চালকের নাম:</span>
              <span className="font-bold text-slate-900">{challan.driverName}</span>
            </div>
            <div>
              <span className="text-slate-500 block">চালকের ফোন:</span>
              <span className="font-mono font-bold text-slate-900">{challan.driverPhone}</span>
            </div>
            <div>
              <span className="text-slate-500 block">গাড়ি / পিকআপ নম্বর:</span>
              <span className="font-bold text-indigo-900">{challan.vehicleNo}</span>
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-slate-300 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300 text-[11px]">
                <tr>
                  <th className="py-2.5 px-3 w-10 text-center">ক্রম</th>
                  <th className="py-2.5 px-3">পণ্য বিবরণী ও স্পেসিফিকেশন</th>
                  <th className="py-2.5 px-3 text-center">ব্যাচ / লট নং</th>
                  <th className="py-2.5 px-3 text-center">স্থানান্তরিত পরিমাণ</th>
                  <th className="py-2.5 px-3 text-right">ইউনিট দর</th>
                  <th className="py-2.5 px-3 text-right">মোট প্রাক্কলিত মূল্য</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {challan.items.map((item, idx) => (
                  <tr key={item.productId} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 text-center font-mono text-slate-500">{idx + 1}</td>
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900">{item.productName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">SKU: {item.sku}</div>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-600">
                      {item.batchNumber || '-'}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold font-mono text-slate-900">
                      {item.dispatchedQty} {item.unit}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                      {tenant.currency}{item.unitCost.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      {tenant.currency}{(item.dispatchedQty * item.unitCost).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-100 font-bold border-t border-slate-300 text-slate-900">
                <tr>
                  <td colSpan={3} className="py-2.5 px-3 text-right">
                    সর্বমোট চালান আইটেম:
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono text-indigo-900">
                    {challan.totalItems} পিস
                  </td>
                  <td className="py-2.5 px-3 text-right">মোট স্টক ভ্যালু:</td>
                  <td className="py-2.5 px-3 text-right font-mono text-sm text-indigo-900">
                    {tenant.currency}{challan.totalCostValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Barcode Strip */}
          <div className="flex flex-col sm:flex-row items-center justify-between border-t border-b border-dashed border-slate-300 py-3 px-4">
            <div className="flex items-center gap-3">
              <Barcode className="w-8 h-8 text-slate-700" />
              <div>
                <span className="font-mono font-bold tracking-widest text-slate-900 text-sm">
                  {challan.gatepassBarcode || `GP-${challan.transferNo}`}
                </span>
                <span className="block text-[10px] text-slate-500">সিকিউরিটি গেট-আউট ও গেট-ইন ট্র্যাকিং বারকোড</span>
              </div>
            </div>
            <div className="text-right text-[11px] text-slate-500 mt-2 sm:mt-0">
              স্ট্যাটাস: <span className="font-bold uppercase text-indigo-800">{challan.status}</span>
            </div>
          </div>

          {/* Signatures */}
          <div className="pt-12 grid grid-cols-4 gap-4 text-center text-[11px] text-slate-600">
            <div className="border-t border-slate-400 pt-1.5">
              <p className="font-bold text-slate-900">প্রস্তুতকারী / গুদাম ইনচার্জ</p>
              <p className="text-[10px] text-slate-400">সেন্ট্রাল ডিপো</p>
            </div>
            <div className="border-t border-slate-400 pt-1.5">
              <p className="font-bold text-slate-900">ড্রাইভার / বহনকারী স্বাক্ষর</p>
              <p className="text-[10px] text-slate-400">{challan.driverName}</p>
            </div>
            <div className="border-t border-slate-400 pt-1.5">
              <p className="font-bold text-slate-900">সিকিউরিটি গেটপাস ক্লিয়ারেন্স</p>
              <p className="text-[10px] text-slate-400">মেইন গেট তল্লাশি</p>
            </div>
            <div className="border-t border-slate-400 pt-1.5">
              <p className="font-bold text-slate-900">শাখা গ্রহণকারী কর্মকর্তা</p>
              <p className="text-[10px] text-slate-400">জিআরএন সিলমোহর</p>
            </div>
          </div>

          {/* Footer note */}
          <div className="text-center text-[10px] text-slate-400 pt-2 border-t border-slate-100">
            * এটি একটি সিস্টেম জেনারেটেড ডিজিটাল ইন্টার-ব্রাঞ্চ চালান। জেএইচ আইএমএসই (JH IMSE) এন্টারপ্রাইজ লজিস্টিকস ইঞ্জিন দ্বারা প্রস্তুতকৃত।
          </div>
        </div>
      </div>
    </div>
  );
};
