import React, { useState } from 'react';
import { X, Plus, Trash2, CheckCircle2, ShoppingCart } from 'lucide-react';
import { Tenant, Supplier, Product, SupplierPurchaseOrder } from '../../types';

interface AddPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: Tenant;
  suppliers: Supplier[];
  products: Product[];
  onCreatePurchase: (purchase: Omit<SupplierPurchaseOrder, 'id' | 'createdAt'>) => void;
}

interface PurchaseItemRow {
  productId?: string;
  productName: string;
  sku?: string;
  unitPrice: number;
  quantity: number;
  batchNumber?: string;
  expiryDate?: string;
}

export const AddPurchaseModal: React.FC<AddPurchaseModalProps> = ({
  isOpen,
  onClose,
  tenant,
  suppliers,
  products,
  onCreatePurchase,
}) => {
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(suppliers[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [poNumber, setPoNumber] = useState(
    'PO-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + Math.floor(100 + Math.random() * 900)
  );
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bkash' | 'nagad' | 'bank' | 'due'>('cash');
  const [paidAmount, setPaidAmount] = useState<string>('0');
  const [note, setNote] = useState('');
  const [receivedBy, setReceivedBy] = useState('স্টোর ইনচার্জ / ম্যানেজার');

  const [items, setItems] = useState<PurchaseItemRow[]>([
    {
      productId: products[0]?.id,
      productName: products[0]?.name || '',
      sku: products[0]?.sku || '',
      unitPrice: products[0]?.costPrice || 0,
      quantity: 10,
      batchNumber: 'BEX-' + new Date().getFullYear() + '-01',
      expiryDate: '2028-12-31',
    },
  ]);

  if (!isOpen) return null;

  const handleProductSelect = (index: number, prodId: string) => {
    const prod = products.find(p => p.id === prodId);
    if (!prod) return;

    setItems(prev => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        productId: prod.id,
        productName: prod.name,
        sku: prod.sku,
        unitPrice: prod.costPrice,
      };
      return next;
    });
  };

  const handleRowChange = (index: number, field: keyof PurchaseItemRow, value: any) => {
    setItems(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const addRow = () => {
    const defaultProd = products[0];
    setItems(prev => [
      ...prev,
      {
        productId: defaultProd?.id,
        productName: defaultProd?.name || '',
        sku: defaultProd?.sku || '',
        unitPrice: defaultProd?.costPrice || 0,
        quantity: 1,
        batchNumber: '',
        expiryDate: '',
      },
    ]);
  };

  const removeRow = (index: number) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const totalAmount = items.reduce((sum, item) => sum + (item.unitPrice * (item.quantity || 0)), 0);
  const numPaid = parseFloat(paidAmount) || 0;
  const dueAmount = Math.max(0, totalAmount - numPaid);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sup = suppliers.find(s => s.id === selectedSupplierId) || suppliers[0];
    if (!sup) {
      alert('সাপ্লায়ার নির্বাচন করুন');
      return;
    }

    if (items.length === 0 || totalAmount <= 0) {
      alert('কমপক্ষে একটি পণ্য ও সঠিক দর দিন');
      return;
    }

    onCreatePurchase({
      tenantId: tenant.id,
      poNumber,
      supplierId: sup.id,
      supplierName: sup.companyName || sup.name,
      supplierPhone: sup.phone,
      date,
      items: items.map(item => ({
        ...item,
        total: item.unitPrice * item.quantity,
      })),
      totalAmount,
      paidAmount: numPaid,
      dueAmount,
      paymentMethod,
      status: 'received',
      note: note.trim() || undefined,
      receivedBy: receivedBy.trim() || 'ম্যানেজার',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        <div className="bg-gradient-to-r from-teal-800 to-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-teal-300" />
            </div>
            <div>
              <h3 className="font-bold text-base">নতুন ক্রয় চালান / পারচেজ অর্ডার এন্ট্রি</h3>
              <p className="text-xs text-teal-200">{tenant.name} • ইনভেন্টরি ও মহাজন দেনা যুক্ত হবে</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-teal-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Top Meta */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">সরবরাহকারী / মহাজন: *</label>
              <select
                value={selectedSupplierId}
                onChange={e => setSelectedSupplierId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-none font-medium bg-slate-50"
              >
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.companyName || s.name} (দেনা: ৳{s.dueBalance.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">চালান / PO নম্বর: *</label>
              <input
                type="text"
                required
                value={poNumber}
                onChange={e => setPoNumber(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">চালানের তারিখ: *</label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-none"
              />
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">ক্রয়কৃত পণ্যের তালিকা</span>
              <button
                type="button"
                onClick={addRow}
                className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-lg font-bold text-xs flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5" /> পণ্য যোগ করুন
              </button>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">পণ্য নির্বাচন</th>
                    <th className="py-2.5 px-3">ব্যাচ ও মেয়াদ</th>
                    <th className="py-2.5 px-3 text-right">কেনা দর ({tenant.currency})</th>
                    <th className="py-2.5 px-3 text-right">পরিমাণ (Qty)</th>
                    <th className="py-2.5 px-3 text-right">মোট টাকা</th>
                    <th className="py-2.5 px-3 text-center">মুছুন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70">
                      <td className="py-2 px-3">
                        <select
                          value={row.productId}
                          onChange={e => handleProductSelect(idx, e.target.value)}
                          className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs"
                        >
                          {products.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.sku})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            placeholder="ব্যাচ নং"
                            value={row.batchNumber || ''}
                            onChange={e => handleRowChange(idx, 'batchNumber', e.target.value)}
                            className="w-24 px-1.5 py-1 border border-slate-200 rounded text-[11px] font-mono"
                          />
                          <input
                            type="date"
                            value={row.expiryDate || ''}
                            onChange={e => handleRowChange(idx, 'expiryDate', e.target.value)}
                            className="w-28 px-1 py-1 border border-slate-200 rounded text-[10px]"
                          />
                        </div>
                      </td>
                      <td className="py-2 px-3 text-right">
                        <input
                          type="number"
                          step="any"
                          value={row.unitPrice}
                          onChange={e => handleRowChange(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="w-20 px-2 py-1 border border-slate-200 rounded text-right font-mono font-bold"
                        />
                      </td>
                      <td className="py-2 px-3 text-right">
                        <input
                          type="number"
                          min="1"
                          value={row.quantity}
                          onChange={e => handleRowChange(idx, 'quantity', parseInt(e.target.value) || 1)}
                          className="w-16 px-2 py-1 border border-slate-200 rounded text-right font-mono font-bold"
                        />
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-teal-800">
                        {tenant.currency}{(row.unitPrice * (row.quantity || 0)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => removeRow(idx)}
                          disabled={items.length <= 1}
                          className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-30"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment & Summary */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">মোট বিলের টাকা:</label>
                <div className="text-xl font-black text-slate-900 font-mono">
                  {tenant.currency}{totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">পরিশোধিত নগদ/ব্যাংক জমা: *</label>
                <input
                  type="number"
                  step="any"
                  value={paidAmount}
                  onChange={e => setPaidAmount(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl font-bold font-mono text-emerald-700 bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">অবশিষ্ট বকেয়া দেনা (Due):</label>
                <div className="text-xl font-black text-rose-600 font-mono">
                  {tenant.currency}{dueAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">পেমেন্ট মাধ্যম:</label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl bg-white font-bold uppercase"
                >
                  <option value="cash">নগদ ক্যাশ (Cash)</option>
                  <option value="bank">ব্যাংক চেক / ট্রান্সফার</option>
                  <option value="bkash">বিকাশ মার্চেন্ট</option>
                  <option value="nagad">নগদ মার্চেন্ট</option>
                  <option value="due">সম্পূর্ণ বাকি (Full Due)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">মাল গ্রহণকারী (Received By):</label>
                <input
                  type="text"
                  value={receivedBy}
                  onChange={e => setReceivedBy(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl bg-white"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl font-bold transition shadow-sm flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" /> ক্রয় চালান সংরক্ষণ ও স্টক আপডেট
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
