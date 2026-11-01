import React, { useState } from 'react';
import { RotateCcw, Plus, Printer, CheckCircle, X, AlertTriangle } from 'lucide-react';
import { CreditNote, Sale, Tenant, CreditNoteItem } from '../types';

interface CreditNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: Tenant;
  sales: Sale[];
  creditNotes: CreditNote[];
  onCreateCreditNote: (cn: Omit<CreditNote, 'id'>, restockItems: { productId: string; quantity: number }[]) => void;
}

export const CreditNoteModal: React.FC<CreditNoteModalProps> = ({
  isOpen,
  onClose,
  tenant,
  sales,
  creditNotes,
  onCreateCreditNote,
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');
  const [selectedCnPreview, setSelectedCnPreview] = useState<CreditNote | null>(null);

  // Form State
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [reason, setReason] = useState('পণ্য পরিবর্তন বা বাতিল');
  const [refundMethod, setRefundMethod] = useState<'cash' | 'adjust_due' | 'wallet'>('cash');
  const [returnItems, setReturnItems] = useState<(CreditNoteItem & { maxQty: number })[]>([]);

  if (!isOpen) return null;

  const tenantCreditNotes = creditNotes.filter(cn => cn.tenantId === tenant.id);
  const tenantSales = sales.filter(s => s.tenantId === tenant.id);

  const handleSelectInvoice = (invId: string) => {
    setSelectedInvoiceId(invId);
    const sale = tenantSales.find(s => s.id === invId);
    if (sale) {
      setReturnItems(
        sale.items.map(it => ({
          productId: it.productId,
          productName: it.productName,
          quantity: 1,
          maxQty: it.quantity,
          unitPrice: it.price,
          subtotal: it.price,
          condition: 'good',
        }))
      );
    }
  };

  const handleQtyChange = (idx: number, qty: number) => {
    setReturnItems(prev => prev.map((item, i) => {
      if (i === idx) {
        const validQty = Math.max(0, Math.min(qty, item.maxQty));
        return {
          ...item,
          quantity: validQty,
          subtotal: validQty * item.unitPrice,
        };
      }
      return item;
    }));
  };

  const handleConditionChange = (idx: number, condition: 'good' | 'damaged') => {
    setReturnItems(prev => prev.map((item, i) => i === idx ? { ...item, condition } : item));
  };

  const totalRefund = returnItems.reduce((acc, it) => acc + it.subtotal, 0);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sale = tenantSales.find(s => s.id === selectedInvoiceId);
    if (!sale) {
      alert('অনুগ্রহ করে একটি বিক্রয় ইনভয়েস নির্বাচন করুন।');
      return;
    }

    const activeReturns = returnItems.filter(it => it.quantity > 0);
    if (activeReturns.length === 0) {
      alert('অনুগ্রহ করে অন্তত একটি পণ্যের ফেরত পরিমাণ দিন।');
      return;
    }

    const cnNumber = 'CN-' + Math.floor(10000 + Math.random() * 90000);

    const restockItems = activeReturns
      .filter(it => it.condition === 'good')
      .map(it => ({ productId: it.productId, quantity: it.quantity }));

    onCreateCreditNote({
      creditNoteNumber: cnNumber,
      tenantId: tenant.id,
      originalInvoiceNumber: sale.invoiceNumber,
      customerId: sale.customerId,
      customerName: sale.customerName,
      items: activeReturns.map(({ maxQty, ...rest }) => rest),
      totalRefundAmount: totalRefund,
      reason,
      refundMethod,
      createdAt: new Date().toLocaleString(),
    }, restockItems);

    setActiveTab('list');
    setSelectedInvoiceId('');
    setReturnItems([]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-purple-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-700 flex items-center justify-center">
              <RotateCcw className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm">বিক্রয় ফেরত ও ক্রেডিট নোট (Credit Notes / Sales Returns)</h3>
              <p className="text-xs text-purple-200">বিক্রিত পণ্য ফেরত গ্রহণ, গ্রাহকের বাকি সমন্বয় এবং স্বয়ংক্রিয় স্টক রিস্টোর</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-purple-800 p-1 rounded-xl flex gap-1 text-xs">
              <button
                onClick={() => { setActiveTab('list'); setSelectedCnPreview(null); }}
                className={`px-3 py-1 rounded-lg font-bold transition ${activeTab === 'list' && !selectedCnPreview ? 'bg-white text-purple-900 shadow-xs' : 'text-purple-200'}`}
              >
                ক্রেডিট নোট তালিকা ({tenantCreditNotes.length})
              </button>
              <button
                onClick={() => { setActiveTab('create'); setSelectedCnPreview(null); }}
                className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1 transition ${activeTab === 'create' ? 'bg-white text-purple-900 shadow-xs' : 'text-purple-200'}`}
              >
                <Plus className="w-3.5 h-3.5" />
                নতুন ফেরত / ক্রেডিট নোট
              </button>
            </div>
            <button onClick={onClose} className="p-1 text-purple-200 hover:text-white rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab 1: Credit Notes List */}
        {activeTab === 'list' && !selectedCnPreview && (
          <div className="p-6">
            {tenantCreditNotes.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <RotateCcw className="w-12 h-12 mx-auto text-slate-300 mb-2 stroke-1" />
                <p className="font-semibold text-slate-600">কোন ক্রেডিট নোট পাওয়া যায়নি</p>
                <p className="text-xs text-slate-400 mt-1">পণ্য ফেরত নিতে উপরের বাটনে ক্লিক করুন</p>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">ক্রেডিট নোট নং</th>
                      <th className="py-3 px-4">ইনভয়েস নং</th>
                      <th className="py-3 px-4">গ্রাহক</th>
                      <th className="py-3 px-4">ফেরতের কারণ</th>
                      <th className="py-3 px-4">রিফান্ড পদ্ধতি</th>
                      <th className="py-3 px-4 text-right">মোট ফেরত (৳)</th>
                      <th className="py-3 px-4 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tenantCreditNotes.map((cn) => (
                      <tr key={cn.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-4 font-mono font-bold text-purple-700">{cn.creditNoteNumber}</td>
                        <td className="py-3 px-4 font-mono text-slate-600">{cn.originalInvoiceNumber}</td>
                        <td className="py-3 px-4 font-bold text-slate-800">{cn.customerName}</td>
                        <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{cn.reason}</td>
                        <td className="py-3 px-4">
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-100">
                            {cn.refundMethod === 'cash' ? 'নগদ রিফান্ড' :
                             cn.refundMethod === 'adjust_due' ? 'বাকি সমন্বয় (Adjust Due)' : 'কাস্টমার ওয়ালেট'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-black text-rose-600">৳{cn.totalRefundAmount.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setSelectedCnPreview(cn)}
                            className="px-3 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-xs font-bold transition"
                          >
                            দেখুন / প্রিন্ট
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Create Credit Note */}
        {activeTab === 'create' && (
          <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 text-xs">
            <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">কোন ইনভয়েস থেকে ফেরত? *</label>
                <select
                  value={selectedInvoiceId}
                  onChange={e => handleSelectInvoice(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                  required
                >
                  <option value="">-- ইনভয়েস নির্বাচন করুন --</option>
                  {tenantSales.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.invoiceNumber} — {s.customerName} (৳{s.totalAmount})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">রিফান্ড এডজাস্টমেন্ট মাধ্যম:</label>
                <select
                  value={refundMethod}
                  onChange={e => setRefundMethod(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                >
                  <option value="cash">নগদ টাকা ফেরত দিন (Cash Refund)</option>
                  <option value="adjust_due">বাকি খাতার বকেয়া থেকে কমান (Adjust Due)</option>
                  <option value="wallet">কাস্টমার ক্রেডিট ওয়ালেট (Store Balance)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">ফেরতের কারণ:</label>
                <input
                  type="text"
                  placeholder="যেমন: মেয়াদ বা প্যাকেজিং ইস্যু"
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                  required
                />
              </div>
            </div>

            {/* Items returning */}
            {returnItems.length > 0 && (
              <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-purple-950">ফেরতযোগ্য পণ্য ও অবস্থা নির্বাচন করুন:</span>
                  <span className="text-[11px] text-purple-700 font-medium">ভালো অবস্থায় থাকলে স্বয়ংক্রিয়ভাবে মূল ইনভেন্টরি স্টকে ফেরত যাবে</span>
                </div>
                <table className="w-full text-left text-xs bg-white rounded-xl border border-purple-100 overflow-hidden">
                  <thead className="bg-purple-100/70 text-purple-900 font-bold border-b border-purple-200">
                    <tr>
                      <th className="py-2.5 px-3">পণ্য</th>
                      <th className="py-2.5 px-3 text-right">বিক্রয় দর</th>
                      <th className="py-2.5 px-3 text-center">ফেরত পরিমাণ (সর্বোচ্চ)</th>
                      <th className="py-2.5 px-3 text-center">পণ্যের বর্তমান অবস্থা</th>
                      <th className="py-2.5 px-3 text-right">ফেরত মূল্য (৳)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-50">
                    {returnItems.map((it, idx) => (
                      <tr key={idx}>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">{it.productName}</td>
                        <td className="py-2.5 px-3 text-right text-slate-600">৳{it.unitPrice.toFixed(2)}</td>
                        <td className="py-2.5 px-3 text-center">
                          <input
                            type="number"
                            min="0"
                            max={it.maxQty}
                            value={it.quantity}
                            onChange={e => handleQtyChange(idx, parseInt(e.target.value) || 0)}
                            className="w-20 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-center font-bold text-purple-800"
                          />
                          <span className="text-[10px] text-slate-400 block">ক্রয়কৃত: {it.maxQty}</span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <select
                            value={it.condition}
                            onChange={e => handleConditionChange(idx, e.target.value as any)}
                            className={`px-2 py-1 border rounded-lg text-xs font-semibold ${
                              it.condition === 'good' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
                            }`}
                          >
                            <option value="good">ভালো (স্টকে ফেরত যাবে)</option>
                            <option value="damaged">নষ্ট/ড্যামেজ (স্টকে যাবে না)</option>
                          </select>
                        </td>
                        <td className="py-2.5 px-3 text-right font-black text-rose-600">৳{it.subtotal.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-700">মোট রিফান্ড / ক্রেডিট পরিমাণ:</span>
              <span className="text-xl font-black text-rose-600">৳{totalRefund.toFixed(2)}</span>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveTab('list')}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold shadow-xs"
              >
                ক্রেডিট নোট নিশ্চিত ও স্টক আপডেট করুন
              </button>
            </div>
          </form>
        )}

        {/* View / Print Credit Note Preview */}
        {selectedCnPreview && (
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-start border-b border-slate-200 pb-4">
              <div>
                <h4 className="text-lg font-black text-slate-900">{tenant.name}</h4>
                <p className="text-slate-500 text-xs">{tenant.address}</p>
                <p className="text-slate-600 text-xs">ফোন: {tenant.phone}</p>
              </div>
              <div className="text-right">
                <span className="px-3 py-1 bg-rose-100 text-rose-800 font-extrabold text-xs rounded-lg uppercase tracking-wider">
                  ক্রেডিট নোট (CREDIT NOTE)
                </span>
                <p className="font-mono font-bold text-rose-700 mt-1">নোট নং: {selectedCnPreview.creditNoteNumber}</p>
                <p className="text-slate-500 text-xs font-mono">মূল ইনভয়েস: {selectedCnPreview.originalInvoiceNumber}</p>
                <p className="text-slate-500 text-xs">তারিখ: {selectedCnPreview.createdAt}</p>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs flex justify-between">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">গ্রাহকের নাম:</span>
                <strong className="text-slate-900">{selectedCnPreview.customerName}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">ফেরতের কারণ:</span>
                <span className="text-slate-700">{selectedCnPreview.reason}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">এডজাস্টমেন্ট মেথড:</span>
                <span className="font-bold text-purple-800">{selectedCnPreview.refundMethod.toUpperCase()}</span>
              </div>
            </div>

            <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">ফেরতকৃত পণ্য</th>
                  <th className="py-2.5 px-3 text-right">দর</th>
                  <th className="py-2.5 px-3 text-center">পরিমাণ</th>
                  <th className="py-2.5 px-3 text-center">অবস্থা</th>
                  <th className="py-2.5 px-3 text-right">মোট রিফান্ড</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {selectedCnPreview.items.map((it, idx) => (
                  <tr key={idx}>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{it.productName}</td>
                    <td className="py-2.5 px-3 text-right">৳{it.unitPrice.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-center font-bold">{it.quantity}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${it.condition === 'good' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                        {it.condition === 'good' ? 'ভালো (স্টকে রিস্টোর হয়েছে)' : 'ড্যামেজ'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-black text-rose-600">৳{it.subtotal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                onClick={() => setSelectedCnPreview(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs"
              >
                তালিকায় ফিরুন
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl font-bold text-xs flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" /> প্রিন্ট ক্রেডিট নোট
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
