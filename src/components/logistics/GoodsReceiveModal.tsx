import React, { useState } from 'react';
import { X, CheckCircle2, AlertTriangle, ShieldCheck, Barcode, PackageCheck, AlertCircle, Sparkles } from 'lucide-react';
import { Tenant, StockTransferChallan, TransferChallanItem } from '../../types';

interface GoodsReceiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: Tenant;
  transfer: StockTransferChallan;
  onConfirmReceipt: (
    transferId: string, 
    receiptData: {
      grnNo: string;
      receivedBy: string;
      items: TransferChallanItem[];
      status: 'received' | 'discrepancy';
      notes?: string;
    }
  ) => void;
}

export const GoodsReceiveModal: React.FC<GoodsReceiveModalProps> = ({
  isOpen,
  onClose,
  tenant,
  transfer,
  onConfirmReceipt,
}) => {
  const [receivedBy, setReceivedBy] = useState<string>('সুমন রায় (ম্যানেজার)');
  const [barcodeInput, setBarcodeInput] = useState<string>(transfer.gatepassBarcode || transfer.transferNo);
  const [barcodeVerified, setBarcodeVerified] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>('ব্রাঞ্চ আউটলেটে মাল আনলোড ও ইনস্পেকশন সম্পন্ন হয়েছে।');

  // Items verification state
  const [itemsState, setItemsState] = useState<{
    productId: string;
    productName: string;
    sku: string;
    unit: string;
    unitCost: number;
    dispatchedQty: number;
    receivedQty: number;
    damagedQty: number;
    damageReason: string;
  }[]>(
    transfer.items.map(i => ({
      productId: i.productId,
      productName: i.productName,
      sku: i.sku,
      unit: i.unit,
      unitCost: i.unitCost,
      dispatchedQty: i.dispatchedQty,
      receivedQty: i.dispatchedQty, // default to 100% received
      damagedQty: 0,
      damageReason: '',
    }))
  );

  if (!isOpen) return null;

  const handleReceivedQtyChange = (index: number, val: number) => {
    setItemsState(prev => prev.map((item, idx) => {
      if (idx !== index) return item;
      const rQty = Math.max(0, Math.min(item.dispatchedQty, val));
      const dQty = item.dispatchedQty - rQty;
      return {
        ...item,
        receivedQty: rQty,
        damagedQty: dQty,
      };
    }));
  };

  const handleDamageReasonChange = (index: number, reason: string) => {
    setItemsState(prev => prev.map((item, idx) => 
      idx === index ? { ...item, damageReason: reason } : item
    ));
  };

  const totalDispatched = itemsState.reduce((acc, i) => acc + i.dispatchedQty, 0);
  const totalReceived = itemsState.reduce((acc, i) => acc + i.receivedQty, 0);
  const totalDamaged = itemsState.reduce((acc, i) => acc + i.damagedQty, 0);

  const receivedValue = itemsState.reduce((acc, i) => acc + (i.receivedQty * i.unitCost), 0);
  const damagedLossValue = itemsState.reduce((acc, i) => acc + (i.damagedQty * i.unitCost), 0);
  const totalGitValue = transfer.totalCostValue;

  const hasDiscrepancy = totalDamaged > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const grnNo = `GRN-${new Date().getFullYear()}-${randomNum}`;

    const finalItems: TransferChallanItem[] = itemsState.map(i => ({
      productId: i.productId,
      productName: i.productName,
      sku: i.sku,
      unit: i.unit,
      unitCost: i.unitCost,
      dispatchedQty: i.dispatchedQty,
      receivedQty: i.receivedQty,
      damagedQty: i.damagedQty,
      damageReason: i.damageReason || (i.damagedQty > 0 ? 'পণ্য পরিবহনকালীন ক্ষতি (Loss in Transit)' : undefined),
    }));

    onConfirmReceipt(transfer.id, {
      grnNo,
      receivedBy: receivedBy.trim(),
      items: finalItems,
      status: hasDiscrepancy ? 'discrepancy' : 'received',
      notes: notes.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-emerald-100 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <PackageCheck className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h3 className="font-bold text-base">গুডস রিসিভ নোট ও গেট-ইন পরীক্ষণ (GRN Inspection)</h3>
              <p className="text-xs text-emerald-200">
                চালান নং: <span className="font-mono font-bold text-white">{transfer.transferNo}</span> • গন্তব্য: {transfer.destinationBranchName}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-emerald-200 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          {/* Barcode & Driver Verification Banner */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Barcode className="w-5 h-5 text-slate-600" />
                <span className="font-bold text-slate-700">গেটপাস বারকোড স্ক্যান:</span>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  value={barcodeInput}
                  onChange={e => {
                    setBarcodeInput(e.target.value);
                    setBarcodeVerified(true);
                  }}
                  className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-mono text-xs font-bold text-emerald-800"
                  placeholder="বারকোড স্ক্যান করুন..."
                />
                <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> ভেরিফাইড
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-200/80 text-[11px]">
              <div>
                <span className="text-slate-400 block">উৎস ডিপো:</span>
                <span className="font-bold text-slate-800">{transfer.sourceWarehouseName}</span>
              </div>
              <div>
                <span className="text-slate-400 block">চালক ও ফোন:</span>
                <span className="font-bold text-slate-800">{transfer.driverName}</span>
                <span className="block text-[10px] text-slate-500 font-mono">{transfer.driverPhone}</span>
              </div>
              <div>
                <span className="text-slate-400 block">গাড়ি নম্বর:</span>
                <span className="font-bold text-slate-800">{transfer.vehicleNo}</span>
              </div>
              <div>
                <span className="text-slate-400 block">ডিসপ্যাচ সময়:</span>
                <span className="font-mono text-slate-700">{transfer.dispatchedAt.slice(0, 16)}</span>
              </div>
            </div>
          </div>

          {/* Items Physical Inspection Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <div className="bg-slate-100 px-4 py-2.5 font-bold text-slate-700 text-xs border-b border-slate-200 flex justify-between items-center">
              <span>পণ্য যাচাইকরণ ও ঘাটতি ইনপুট (Physical Count):</span>
              <span className="text-[11px] text-slate-500">
                মোট চালানভুক্ত: {totalDispatched} পিস
              </span>
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">পণ্য</th>
                  <th className="py-2.5 px-3 text-center">চালানের সংখ্যা</th>
                  <th className="py-2.5 px-3 text-center">সঠিক রিসিভ সংখ্যা</th>
                  <th className="py-2.5 px-3 text-center">ক্ষতি / ঘাটতি</th>
                  <th className="py-2.5 px-3">ক্ষতির কারণ (যদি থাকে)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {itemsState.map((item, idx) => (
                  <tr key={item.productId} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900">{item.productName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">SKU: {item.sku}</div>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-700">
                      {item.dispatchedQty} {item.unit}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <input
                        type="number"
                        min="0"
                        max={item.dispatchedQty}
                        value={item.receivedQty}
                        onChange={e => handleReceivedQtyChange(idx, parseInt(e.target.value) || 0)}
                        className="w-16 px-2 py-1 bg-white border border-emerald-300 rounded-lg text-xs font-bold text-center text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono ${
                        item.damagedQty > 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {item.damagedQty} {item.unit}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      {item.damagedQty > 0 ? (
                        <input
                          type="text"
                          value={item.damageReason}
                          onChange={e => handleDamageReasonChange(idx, e.target.value)}
                          placeholder="যেমন: বৃষ্টিতে ভিজে নষ্ট / বোতল ভাঙা"
                          className="w-full px-2 py-1 bg-rose-50/70 border border-rose-200 rounded-lg text-[11px] text-rose-900 focus:outline-none focus:bg-white"
                        />
                      ) : (
                        <span className="text-[11px] text-emerald-700 font-medium">✓ সম্পূর্ণ অক্ষত</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Audit & Accounting Reconciliation Preview */}
          <div className={`p-4 rounded-2xl border space-y-2 ${
            hasDiscrepancy ? 'bg-amber-50/80 border-amber-200' : 'bg-emerald-50/80 border-emerald-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>স্বয়ংক্রিয় ইনভেন্টরি ও আর্থিক জাবেদা সমন্বয় (Automated GRN Journal):</span>
              </div>
              {hasDiscrepancy && (
                <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                  ⚠️ ট্রানজিট ক্ষতি শনাক্ত: {totalDamaged} পিস
                </span>
              )}
            </div>

            <div className="font-mono text-[11px] bg-white/80 p-3 rounded-xl border border-slate-200 space-y-1.5 text-slate-800">
              <div className="flex justify-between text-emerald-800 font-bold">
                <span>Dr. 1050 পণ্য স্টক - {transfer.destinationBranchName}</span>
                <span>{tenant.currency}{receivedValue.toFixed(2)}</span>
              </div>
              {hasDiscrepancy && (
                <div className="flex justify-between text-rose-700 font-bold">
                  <span>Dr. 6070 পণ্য পরিবহন ও ট্রানজিট ড্যামেজ ক্ষতি (Loss in Transit)</span>
                  <span>{tenant.currency}{damagedLossValue.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between pl-4 text-slate-600 border-t border-slate-200 pt-1">
                <span>Cr. 1055 পণ্য ট্রানজিটে (Goods in Transit - Asset)</span>
                <span className="font-bold">{tenant.currency}{totalGitValue.toFixed(2)}</span>
              </div>
            </div>

            <p className="text-[10px] text-slate-600 leading-relaxed">
              * অনুমোদন করার সাথে সাথে রিসিভকৃত {totalReceived} পিস পণ্য {transfer.destinationBranchName}-এর বর্তমান স্টকে যুক্ত হবে এবং ট্রানজিট একাউন্ট শতভাগ সমন্বিত হবে।
            </p>
          </div>

          {/* Received By & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                গ্রহণকারী কর্মকর্তা (Received By): *
              </label>
              <input
                type="text"
                value={receivedBy}
                onChange={e => setReceivedBy(e.target.value)}
                placeholder="যেমন: সুমন রায় (ম্যানেজার)"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 font-medium"
                required
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">জিআরএন পর্যবেক্ষণ মন্তব্য:</label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="মন্তব্য..."
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          {/* Modal Buttons */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <PackageCheck className="w-4 h-4" /> মাল রিসিভ নিশ্চিত ও স্টক ইন করুন
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
