import React, { useState } from 'react';
import { 
  X, CheckCircle2, ShoppingCart, Truck, AlertTriangle, Send, 
  Printer, MessageSquare, ShieldCheck, Sparkles, Building2, Trash2 
} from 'lucide-react';
import { Tenant, AutoPurchaseOrder, AutoPurchaseOrderItem, SupplierPurchaseOrder } from '../../types';

interface AutoPOApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: Tenant;
  autoPo: AutoPurchaseOrder | null;
  onApproveAndCreatePO: (approvedPo: SupplierPurchaseOrder) => void;
  onUpdateAutoPoStatus: (autoPoId: string, status: AutoPurchaseOrder['status']) => void;
  onOpenPrintPO: (autoPo: AutoPurchaseOrder) => void;
}

export const AutoPOApprovalModal: React.FC<AutoPOApprovalModalProps> = ({
  isOpen,
  onClose,
  tenant,
  autoPo,
  onApproveAndCreatePO,
  onUpdateAutoPoStatus,
  onOpenPrintPO,
}) => {
  if (!isOpen || !autoPo) return null;

  const [items, setItems] = useState<AutoPurchaseOrderItem[]>(autoPo.items);
  const [deliveryDate, setDeliveryDate] = useState<string>(autoPo.deliveryExpectedDate || '');
  const [notes, setNotes] = useState<string>(autoPo.notes || '');

  const handleQtyChange = (index: number, newQty: number) => {
    if (newQty < 0) return;
    setItems(prev => prev.map((item, idx) => {
      if (idx !== index) return item;
      return {
        ...item,
        orderQty: newQty,
        totalCost: newQty * item.unitCost,
      };
    }));
  };

  const handleRemoveItem = (index: number) => {
    setItems(prev => prev.filter((_, idx) => idx !== index));
  };

  const totalCalculatedAmount = items.reduce((acc, i) => acc + i.totalCost, 0);

  const handleApprove = () => {
    // Construct standard SupplierPurchaseOrder compatible with AccountingManager
    const officialPO: SupplierPurchaseOrder = {
      id: 'po-' + Date.now(),
      tenantId: tenant.id,
      poNumber: autoPo.autoPoNumber.replace('AUTO-', 'PO-'),
      supplierId: autoPo.supplierId,
      supplierName: autoPo.supplierName,
      supplierPhone: autoPo.supplierPhone,
      date: new Date().toISOString().slice(0, 10),
      items: items.map(it => ({
        productId: it.productId,
        productName: it.productName,
        sku: it.sku,
        unitPrice: it.unitCost,
        quantity: it.orderQty,
        total: it.totalCost,
      })),
      totalAmount: totalCalculatedAmount,
      paidAmount: 0,
      dueAmount: totalCalculatedAmount,
      paymentMethod: 'due',
      status: 'ordered',
      note: `AI Autonomous PO: ${autoPo.aiGeneratedReason} ${notes ? `• ${notes}` : ''}`,
      receivedBy: tenant.ownerName || 'ডা. মোঃ আব্দুর রহিম',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };

    onApproveAndCreatePO(officialPO);
    onUpdateAutoPoStatus(autoPo.id, 'approved');
    onClose();
  };

  const handleSendWhatsApp = () => {
    const textLines = [
      `*পারচেজ অর্ডার (Purchase Order)*`,
      `অর্ডার নং: ${autoPo.autoPoNumber}`,
      `প্রতিষ্ঠান: ${tenant.name}`,
      `ফোন: ${tenant.phone}`,
      `সাপ্লায়ার: ${autoPo.supplierName}`,
      `প্রত্যাশিত ডেলিভারি: ${deliveryDate || 'শীঘ্রই'}`,
      `--- আইটেম তালিকা ---`,
      ...items.map((it, idx) => `${idx + 1}. ${it.productName} - ${it.orderQty} ${it.unit} (৳${it.totalCost.toFixed(0)})`),
      `---`,
      `মোট অর্ডার মূল্য: ৳${totalCalculatedAmount.toLocaleString()}`,
      `অনুরোধ: অনুগ্রহ করে দ্রুত কনফার্ম করে চালানের সাথে ডেলিভারি দিন।`,
    ];

    const encodedText = encodeURIComponent(textLines.join('\n'));
    const phoneClean = (autoPo.supplierPhone || '').replace(/[^0-9]/g, '');
    const url = `https://wa.me/${phoneClean || '8801711002233'}?text=${encodedText}`;
    window.open(url, '_blank');
    onUpdateAutoPoStatus(autoPo.id, 'sent_whatsapp');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-purple-100 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-800 via-indigo-900 to-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-base flex items-center gap-2">
                <span>স্বয়ংক্রিয় পারচেজ অর্ডার অনুমোদন ({autoPo.autoPoNumber})</span>
                {autoPo.urgency === 'critical' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-500 text-white font-extrabold uppercase animate-pulse">
                    জরুরি সংকট
                  </span>
                )}
              </h3>
              <p className="text-xs text-purple-200">
                সাপ্লায়ার: <strong className="text-white">{autoPo.supplierName}</strong>
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-purple-200 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          {/* AI Intelligence Justification Box */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50/70 p-4 rounded-2xl border border-purple-200/80 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-xs text-purple-900">
              <Sparkles className="w-4 h-4 text-purple-700" />
              <span>Google Gemini AI & গাণিতিক আর-ও-পি (ROP) বিশ্লেষণ:</span>
            </div>
            <p className="text-purple-950 text-xs leading-relaxed font-medium">
              {autoPo.aiGeneratedReason}
            </p>
            <div className="flex items-center gap-4 text-[11px] text-purple-700 font-mono pt-1">
              <span>তৈরির তারিখ: {autoPo.generatedDate.slice(0, 16)}</span>
              {autoPo.supplierPhone && <span>ফোন: {autoPo.supplierPhone}</span>}
            </div>
          </div>

          {/* Supplier Info and Expected Delivery */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <div>
              <span className="text-[10px] text-slate-400 block font-bold uppercase">সাপ্লায়ার ও যোগাযোগ:</span>
              <div className="font-bold text-slate-800 text-xs mt-0.5">{autoPo.supplierName}</div>
              <p className="text-[11px] text-slate-500 font-mono">{autoPo.supplierPhone} • {autoPo.supplierEmail || 'N/A'}</p>
            </div>
            <div>
              <label className="text-[10px] text-slate-700 block font-bold uppercase mb-1">
                প্রত্যাশিত ডেলিভারির তারিখ:
              </label>
              <input
                type="date"
                value={deliveryDate}
                onChange={e => setDeliveryDate(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 text-xs focus:outline-none focus:border-purple-600"
              />
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">পণ্য</th>
                  <th className="py-2.5 px-2 text-center">বর্তমান স্টক</th>
                  <th className="py-2.5 px-2 text-center">বিক্রয় বেগ</th>
                  <th className="py-2.5 px-2 text-center">স্টক থাকবে</th>
                  <th className="py-2.5 px-2 text-center">অর্ডারের পরিমাণ</th>
                  <th className="py-2.5 px-3 text-right">কেনা দর</th>
                  <th className="py-2.5 px-3 text-right">মোট খরচ</th>
                  <th className="py-2.5 px-2 text-center">বাদ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item, idx) => (
                  <tr key={item.productId} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900">{item.productName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">SKU: {item.sku}</div>
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                        item.currentStock <= 15 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {item.currentStock} {item.unit}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-center font-mono font-bold text-slate-600">
                      {item.velocityDaily}/দিন
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <span className="font-mono font-bold text-amber-700 text-[11px]">
                        {item.daysRemaining} দিন
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <input
                        type="number"
                        min="1"
                        value={item.orderQty}
                        onChange={e => handleQtyChange(idx, parseInt(e.target.value) || 0)}
                        className="w-16 px-2 py-1 bg-white border border-purple-300 rounded-lg text-xs font-bold text-center text-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                      />
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                      {tenant.currency}{item.unitCost.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-purple-900">
                      {tenant.currency}{item.totalCost.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <button
                        onClick={() => handleRemoveItem(idx)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition cursor-pointer"
                        title="অর্ডার থেকে বাদ দিন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 font-bold border-t border-slate-200 text-slate-900">
                <tr>
                  <td colSpan={6} className="py-2.5 px-3 text-right">
                    সর্বমোট অনুমোদিত অর্ডার মূল্য:
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-purple-900 text-sm">
                    {tenant.currency}{totalCalculatedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Special Delivery Notes */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">সাপ্লায়ারকে বিশেষ নির্দেশনা / নোট:</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="যেমন: জরুরি সকালের ডেলিভারি ভ্যানে পাঠাবেন।"
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-purple-600"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenPrintPO({ ...autoPo, items, totalAmount: totalCalculatedAmount, notes })}
              className="px-3 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" /> প্রিন্ট / PDF
            </button>
            <button
              onClick={handleSendWhatsApp}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <MessageSquare className="w-3.5 h-3.5" /> হোয়াটসঅ্যাপে পাঠান
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs transition cursor-pointer"
            >
              বন্ধ করুন
            </button>
            <button
              type="button"
              onClick={handleApprove}
              disabled={items.length === 0}
              className="px-5 py-2 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 disabled:bg-slate-300 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" /> ১-ক্লিক অনুমোদন ও পারচেজ অর্ডার তৈরি
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
