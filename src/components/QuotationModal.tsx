import React, { useState } from 'react';
import { FileText, Plus, Printer, CheckCircle, ArrowRight, X, Trash2, Calendar } from 'lucide-react';
import { Quotation, Product, Customer, Tenant, QuotationItem } from '../types';

interface QuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: Tenant;
  products: Product[];
  customers: Customer[];
  quotations: Quotation[];
  onCreateQuotation: (quote: Omit<Quotation, 'id'>) => void;
  onConvertToInvoice: (quote: Quotation) => void;
}

export const QuotationModal: React.FC<QuotationModalProps> = ({
  isOpen,
  onClose,
  tenant,
  products,
  customers,
  quotations,
  onCreateQuotation,
  onConvertToInvoice,
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');
  const [selectedQuoteForPreview, setSelectedQuoteForPreview] = useState<Quotation | null>(null);

  // New Quote Form State
  const [customerId, setCustomerId] = useState('');
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [validDays, setValidDays] = useState('15');
  const [quoteNotes, setQuoteNotes] = useState('');
  const [discountVal, setDiscountVal] = useState('0');
  const [taxVal, setTaxVal] = useState('0');
  const [items, setItems] = useState<QuotationItem[]>([]);

  // Item selector state
  const [selectedProdId, setSelectedProdId] = useState('');
  const [itemQty, setItemQty] = useState('1');
  const [itemRate, setItemRate] = useState('');

  if (!isOpen) return null;

  const tenantQuotes = quotations.filter(q => q.tenantId === tenant.id);

  const handleSelectProduct = (pId: string) => {
    setSelectedProdId(pId);
    const p = products.find(prod => prod.id === pId);
    if (p) {
      setItemRate(p.sellingPrice.toString());
    }
  };

  const handleAddItem = () => {
    if (!selectedProdId) return;
    const prod = products.find(p => p.id === selectedProdId);
    if (!prod) return;
    const qty = parseFloat(itemQty) || 1;
    const rate = parseFloat(itemRate) || prod.sellingPrice;

    setItems(prev => [
      ...prev,
      {
        productId: prod.id,
        productName: prod.name,
        sku: prod.sku,
        rate,
        quantity: qty,
        unit: prod.unit,
        subtotal: qty * rate,
      }
    ]);

    setSelectedProdId('');
    setItemQty('1');
    setItemRate('');
  };

  const handleRemoveItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const quoteSubtotal = items.reduce((acc, it) => acc + it.subtotal, 0);
  const discountAmt = parseFloat(discountVal) || 0;
  const taxAmt = ((quoteSubtotal - discountAmt) * (parseFloat(taxVal) || 0)) / 100;
  const grandTotal = Math.max(0, quoteSubtotal - discountAmt + taxAmt);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      alert('অনুগ্রহ করে অন্তত একটি পণ্য যুক্ত করুন।');
      return;
    }

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + (parseInt(validDays) || 15));

    const newQuoteNum = 'QU-' + Math.floor(10000 + Math.random() * 90000);

    onCreateQuotation({
      quotationNumber: newQuoteNum,
      tenantId: tenant.id,
      customerId: customerId || undefined,
      customerName: custName || (customerId ? (customers.find(c => c.id === customerId)?.name || 'ক্লাইন্ট') : 'ক্লাইন্ট'),
      customerPhone: custPhone || (customerId ? customers.find(c => c.id === customerId)?.phone : undefined),
      items,
      subtotal: quoteSubtotal,
      discount: discountAmt,
      tax: taxAmt,
      totalAmount: grandTotal,
      validUntil: expiryDate.toISOString().slice(0, 10),
      status: 'sent',
      notes: quoteNotes,
      createdAt: new Date().toISOString().slice(0, 10),
    });

    // Reset and return to list
    setItems([]);
    setCustName('');
    setCustPhone('');
    setCustomerId('');
    setQuoteNotes('');
    setActiveTab('list');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-purple-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-700 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm">কোটেশন ও প্রাক্কলন বিল (Quotations Hub)</h3>
              <p className="text-xs text-purple-200">কাস্টমারের জন্য কোটেশন তৈরি করুন ও ১-ক্লিকে ইনভয়েসে রূপান্তর করুন</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-purple-800/80 p-1 rounded-xl flex gap-1 text-xs">
              <button
                onClick={() => { setActiveTab('list'); setSelectedQuoteForPreview(null); }}
                className={`px-3 py-1 rounded-lg font-bold transition ${activeTab === 'list' && !selectedQuoteForPreview ? 'bg-white text-purple-900 shadow-xs' : 'text-purple-200'}`}
              >
                কোটেশন তালিকা ({tenantQuotes.length})
              </button>
              <button
                onClick={() => { setActiveTab('create'); setSelectedQuoteForPreview(null); }}
                className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1 transition ${activeTab === 'create' ? 'bg-white text-purple-900 shadow-xs' : 'text-purple-200'}`}
              >
                <Plus className="w-3.5 h-3.5" />
                নতুন কোটেশন
              </button>
            </div>
            <button onClick={onClose} className="p-1 text-purple-200 hover:text-white rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab 1: Quotations List */}
        {activeTab === 'list' && !selectedQuoteForPreview && (
          <div className="p-6">
            {tenantQuotes.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <FileText className="w-12 h-12 mx-auto text-slate-300 mb-2 stroke-1" />
                <p className="font-semibold text-slate-600">কোন কোটেশন পাওয়া যায়নি</p>
                <p className="text-xs text-slate-400 mt-1">নতুন কোটেশন তৈরি করতে উপরের বাটনে ক্লিক করুন</p>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">কোটেশন নং</th>
                      <th className="py-3 px-4">গ্রাহক</th>
                      <th className="py-3 px-4">তারিখ</th>
                      <th className="py-3 px-4">মেয়াদ</th>
                      <th className="py-3 px-4 text-right">মোট পরিমাণ</th>
                      <th className="py-3 px-4 text-center">স্ট্যাটাস</th>
                      <th className="py-3 px-4 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tenantQuotes.map((q) => (
                      <tr key={q.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-4 font-mono font-bold text-purple-700">{q.quotationNumber}</td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-800">{q.customerName}</div>
                          {q.customerPhone && <div className="text-[10px] text-slate-400">{q.customerPhone}</div>}
                        </td>
                        <td className="py-3 px-4 text-slate-500">{q.createdAt}</td>
                        <td className="py-3 px-4 text-slate-500">{q.validUntil}</td>
                        <td className="py-3 px-4 text-right font-black text-slate-900">৳{q.totalAmount.toFixed(2)}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            q.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' :
                            q.status === 'sent' ? 'bg-indigo-100 text-indigo-800' :
                            q.status === 'declined' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {q.status === 'accepted' ? 'গৃহীত (Accepted)' :
                             q.status === 'sent' ? 'প্রেরিত (Sent)' :
                             q.status === 'declined' ? 'বাতিল' : 'মেয়াদোত্তীর্ণ'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedQuoteForPreview(q)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                            >
                              দেখুন
                            </button>
                            <button
                              onClick={() => {
                                onConvertToInvoice(q);
                                onClose();
                              }}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs"
                              title="ইনভয়েস বা বিক্রয়ে রূপান্তর করুন"
                            >
                              <ArrowRight className="w-3.5 h-3.5" />
                              ইনভয়েস করুন
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Create Quotation */}
        {activeTab === 'create' && (
          <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 text-xs">
            {/* Customer & Dates */}
            <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">গ্রাহক নির্বাচন করুন:</label>
                <select
                  value={customerId}
                  onChange={e => {
                    const cId = e.target.value;
                    setCustomerId(cId);
                    const c = customers.find(cust => cust.id === cId);
                    if (c) {
                      setCustName(c.name);
                      setCustPhone(c.phone);
                    }
                  }}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl"
                >
                  <option value="">-- নতুন ক্লায়েন্ট / কাস্টম নাম --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">কাস্টমার নাম:</label>
                <input
                  type="text"
                  placeholder="যেমন: ঢাকা ক্লিনিক"
                  value={custName}
                  onChange={e => setCustName(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">মেয়াদ (দিন):</label>
                <input
                  type="number"
                  placeholder="15"
                  value={validDays}
                  onChange={e => setValidDays(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            {/* Add Items to Quote */}
            <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100 space-y-3">
              <span className="font-bold text-purple-950 block">কোটেশনে পণ্য যোগ করুন:</span>
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-6">
                  <select
                    value={selectedProdId}
                    onChange={e => handleSelectProduct(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-purple-200 rounded-xl text-xs"
                  >
                    <option value="">-- পণ্য বা ওষুধ বেছে নিন --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} (স্টক: {p.stock} | দর: ৳{p.sellingPrice})</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    step="any"
                    placeholder="পরিমাণ"
                    value={itemQty}
                    onChange={e => setItemQty(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-purple-200 rounded-xl text-xs"
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    step="any"
                    placeholder="দর (৳)"
                    value={itemRate}
                    onChange={e => setItemRate(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-purple-200 rounded-xl text-xs"
                  />
                </div>
                <div className="col-span-2">
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="w-full py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold flex items-center justify-center gap-1 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" /> যোগ করুন
                  </button>
                </div>
              </div>

              {/* Items List */}
              {items.length > 0 && (
                <div className="bg-white rounded-xl border border-purple-100 overflow-hidden mt-2">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-purple-50/80 text-purple-900 font-bold border-b border-purple-100">
                      <tr>
                        <th className="py-2 px-3">পণ্য</th>
                        <th className="py-2 px-3 text-right">দর</th>
                        <th className="py-2 px-3 text-center">পরিমাণ</th>
                        <th className="py-2 px-3 text-right">মোট</th>
                        <th className="py-2 px-3 text-center">মুছুন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-50">
                      {items.map((it, idx) => (
                        <tr key={idx}>
                          <td className="py-2 px-3 font-semibold text-slate-800">{it.productName}</td>
                          <td className="py-2 px-3 text-right text-slate-600">৳{it.rate.toFixed(2)}</td>
                          <td className="py-2 px-3 text-center font-bold">{it.quantity} {it.unit}</td>
                          <td className="py-2 px-3 text-right font-bold text-slate-900">৳{it.subtotal.toFixed(2)}</td>
                          <td className="py-2 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="text-rose-500 hover:text-rose-700 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Totals & Notes */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">কোটেশন নোট বা শর্তাবলী:</label>
                <textarea
                  rows={3}
                  value={quoteNotes}
                  onChange={e => setQuoteNotes(e.target.value)}
                  placeholder="যেমন: পণ্য ডেলিভারির সময় সম্পূর্ণ পেমেন্ট করতে হবে।"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600">সাব-টোটাল:</span>
                  <span className="font-bold">৳{quoteSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-600">ডিসকাউন্ট (৳):</span>
                  <input
                    type="number"
                    value={discountVal}
                    onChange={e => setDiscountVal(e.target.value)}
                    className="w-24 px-2 py-1 bg-white border border-slate-200 rounded-lg text-right font-bold text-rose-600"
                  />
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between font-black text-slate-900 text-sm">
                  <span>কোটেশন গ্র্যান্ড টোটাল:</span>
                  <span className="text-purple-700">৳{grandTotal.toFixed(2)}</span>
                </div>
              </div>
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
                কোটেশন সংরক্ষণ ও প্রস্তুত করুন
              </button>
            </div>
          </form>
        )}

        {/* View / Print Single Quotation */}
        {selectedQuoteForPreview && (
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-start border-b border-slate-200 pb-4">
              <div>
                <h4 className="text-lg font-black text-purple-900">{tenant.name}</h4>
                <p className="text-slate-500 text-xs">{tenant.address}</p>
                <p className="text-slate-600 text-xs">ফোন: {tenant.phone}</p>
              </div>
              <div className="text-right">
                <span className="px-3 py-1 bg-purple-100 text-purple-800 font-extrabold text-xs rounded-lg uppercase">
                  আনুষ্ঠানিক কোটেশন (QUOTATION)
                </span>
                <p className="font-mono font-bold text-slate-900 mt-1">নং: {selectedQuoteForPreview.quotationNumber}</p>
                <p className="text-slate-500 text-xs">তারিখ: {selectedQuoteForPreview.createdAt}</p>
                <p className="text-amber-700 font-medium text-xs">মেয়াদ: {selectedQuoteForPreview.validUntil} পর্যন্ত</p>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 block mb-0.5 uppercase">কোটেশন প্রাপক:</span>
              <h5 className="font-bold text-slate-800">{selectedQuoteForPreview.customerName}</h5>
              {selectedQuoteForPreview.customerPhone && <p className="text-slate-500 text-xs">ফোন: {selectedQuoteForPreview.customerPhone}</p>}
            </div>

            <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">বিবরণ</th>
                  <th className="py-2.5 px-3 text-right">দর</th>
                  <th className="py-2.5 px-3 text-center">পরিমাণ</th>
                  <th className="py-2.5 px-3 text-right">মোট (৳)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {selectedQuoteForPreview.items.map((it, idx) => (
                  <tr key={idx}>
                    <td className="py-2.5 px-3 font-medium text-slate-800">{it.productName}</td>
                    <td className="py-2.5 px-3 text-right">৳{it.rate.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-center font-bold">{it.quantity} {it.unit}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">৳{it.subtotal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-between items-center bg-purple-50 p-4 rounded-xl border border-purple-100">
              <div className="text-xs text-purple-900">
                <strong>নোট:</strong> {selectedQuoteForPreview.notes || 'কোটেশন গ্রহণের জন্য অফিসে যোগাযোগ করুন।'}
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 block">সর্বমোট প্রাক্কলন:</span>
                <span className="text-lg font-black text-purple-900">৳{selectedQuoteForPreview.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedQuoteForPreview(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs"
              >
                তালিকায় ফিরুন
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" /> প্রিন্ট কোটেশন
              </button>
              <button
                onClick={() => {
                  onConvertToInvoice(selectedQuoteForPreview);
                  onClose();
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm"
              >
                <ArrowRight className="w-3.5 h-3.5" /> ইনভয়েস ও বিক্রয়ে কনভার্ট করুন
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
