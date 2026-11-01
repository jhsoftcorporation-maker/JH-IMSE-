import React from 'react';
import { X, Printer, Building2, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import { Tenant, BranchRequisition } from '../../types';

interface RequisitionPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: Tenant;
  requisition: BranchRequisition | null;
}

export const RequisitionPrintModal: React.FC<RequisitionPrintModalProps> = ({
  isOpen,
  onClose,
  tenant,
  requisition,
}) => {
  if (!isOpen || !requisition) return null;

  const handlePrint = () => {
    window.print();
  };

  const urgencyLabels: Record<string, string> = {
    normal: 'স্বাভাবিক (Normal)',
    urgent: 'জরুরি (Urgent - 24H)',
    critical: 'সংকটপূর্ণ (Critical)',
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-150">
        {/* Top Control Bar */}
        <div className="bg-slate-900 text-white px-6 py-3 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-purple-400" />
            <span className="font-bold text-sm">স্টোর রিকুইজিশন ভাউচার ({requisition.requisitionNo})</span>
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

        {/* Printable Voucher Body */}
        <div className="p-8 overflow-y-auto space-y-6 text-slate-800 text-xs print:p-0 print:m-0" id="requisition-printable">
          {/* Header */}
          <div className="border-b-2 border-purple-900 pb-4">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight">{tenant.name}</h1>
                <p className="text-slate-600 font-medium text-xs mt-0.5">{tenant.address}</p>
                <div className="flex items-center gap-4 text-[11px] text-slate-500 mt-1">
                  <span>যোগাযোগ: {tenant.phone}</span>
                  {tenant.taxVatNo && <span>মুসক: {tenant.taxVatNo}</span>}
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1 bg-purple-900 text-white text-xs font-extrabold uppercase tracking-wider rounded-lg">
                  স্টোর রিকুইজিশন অর্ডার (RO)
                </span>
                <div className="font-mono font-black text-purple-800 text-sm mt-1">
                  {requisition.requisitionNo}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  তারিখ: {requisition.createdAt.slice(0, 16)}
                </div>
              </div>
            </div>
          </div>

          {/* Requisition Routing & Urgency */}
          <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-[11px]">
            <div>
              <span className="font-bold text-[10px] uppercase text-slate-400 block mb-0.5">
                আবেদনকারী শাখা (From Branch):
              </span>
              <div className="font-bold text-slate-900 text-xs">{requisition.fromBranchName}</div>
              <p className="text-slate-500">অনুরোধকারী: {requisition.requestedBy}</p>
            </div>

            <div>
              <span className="font-bold text-[10px] uppercase text-purple-700 block mb-0.5">
                সরবরাহকারী গুদাম (To CDC):
              </span>
              <div className="font-bold text-purple-950 text-xs">{requisition.toWarehouseName}</div>
              <p className="text-slate-500">সেন্ট্রাল ডিস্ট্রিবিউশন ডিপো</p>
            </div>

            <div>
              <span className="font-bold text-[10px] uppercase text-slate-400 block mb-0.5">
                জরুরিতা ও স্ট্যাটাস:
              </span>
              <div className="font-bold text-slate-800">
                {urgencyLabels[requisition.urgency] || requisition.urgency}
              </div>
              <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-purple-100 text-purple-800">
                {requisition.status}
              </span>
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-slate-300 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300 text-[11px]">
                <tr>
                  <th className="py-2.5 px-3 w-10 text-center">ক্রম</th>
                  <th className="py-2.5 px-3">পণ্য বিবরণী ও কোড</th>
                  <th className="py-2.5 px-3 text-center">ব্রাঞ্চ স্টক</th>
                  <th className="py-2.5 px-3 text-center">চাহিদার পরিমাণ</th>
                  <th className="py-2.5 px-3 text-center">অনুমোদিত পরিমাণ</th>
                  <th className="py-2.5 px-3 text-right">ইউনিট রেট</th>
                  <th className="py-2.5 px-3 text-right">মোট সম্ভাব্য মূল্য</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {requisition.items.map((item, idx) => (
                  <tr key={item.productId} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 text-center font-mono text-slate-500">{idx + 1}</td>
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900">{item.productName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">SKU: {item.sku}</div>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-600">
                      {item.currentStockAtBranch} {item.unit}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold font-mono text-purple-900">
                      {item.requestedQty} {item.unit}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold font-mono text-slate-800">
                      {item.approvedQty > 0 ? `${item.approvedQty} ${item.unit}` : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                      {tenant.currency}{item.unitCost.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      {tenant.currency}{(item.requestedQty * item.unitCost).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-100 font-bold border-t border-slate-300 text-slate-900">
                <tr>
                  <td colSpan={6} className="py-2.5 px-3 text-right">
                    মোট প্রাক্কলিত চাহিদামূল্য:
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-sm text-purple-900">
                    {tenant.currency}{requisition.totalEstimatedValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Notes */}
          {requisition.notes && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-700 block mb-0.5 text-[11px]">শাখা ইনচার্জের মন্তব্য:</span>
              <p className="text-slate-600 text-[11px] leading-relaxed">{requisition.notes}</p>
            </div>
          )}

          {/* Signatures */}
          <div className="pt-12 grid grid-cols-3 gap-6 text-center text-[11px] text-slate-600">
            <div className="border-t border-slate-400 pt-1.5">
              <p className="font-bold text-slate-900">{requisition.requestedBy}</p>
              <p className="text-[10px] text-slate-400">চাহিদাকারী / শাখা ইনচার্জ</p>
            </div>
            <div className="border-t border-slate-400 pt-1.5">
              <p className="font-bold text-slate-900">ইনভেন্টরি অডিটর</p>
              <p className="text-[10px] text-slate-400">স্টক যাচাই ও সুপারিশ</p>
            </div>
            <div className="border-t border-slate-400 pt-1.5">
              <p className="font-bold text-slate-900">{requisition.approvedBy || 'অনুমোদনকারী কর্মকর্তা'}</p>
              <p className="text-[10px] text-slate-400">সেন্ট্রাল ডিপো হেড</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
