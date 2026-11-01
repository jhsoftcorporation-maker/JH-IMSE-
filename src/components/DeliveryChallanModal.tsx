import React, { useState } from 'react';
import { Truck, Plus, Printer, CheckCircle, X, PackageCheck, MapPin, Phone } from 'lucide-react';
import { DeliveryChallan, Sale, Tenant, DeliveryChallanItem } from '../types';

interface DeliveryChallanModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: Tenant;
  sales: Sale[];
  challans: DeliveryChallan[];
  onCreateChallan: (challan: Omit<DeliveryChallan, 'id'>) => void;
}

export const DeliveryChallanModal: React.FC<DeliveryChallanModalProps> = ({
  isOpen,
  onClose,
  tenant,
  sales,
  challans,
  onCreateChallan,
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');
  const [selectedChallanPreview, setSelectedChallanPreview] = useState<DeliveryChallan | null>(null);

  // Form State
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [transportName, setTransportName] = useState('Sundarban Courier');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<DeliveryChallanItem[]>([]);

  if (!isOpen) return null;

  const tenantChallans = challans.filter(c => c.tenantId === tenant.id);
  const tenantSales = sales.filter(s => s.tenantId === tenant.id);

  const handleSelectInvoice = (invId: string) => {
    setSelectedInvoiceId(invId);
    const sale = tenantSales.find(s => s.id === invId);
    if (sale) {
      setDeliveryAddress(tenant.address); // default or customer address
      setItems(
        sale.items.map(it => ({
          productId: it.productId,
          productName: it.productName,
          sku: it.sku,
          quantity: it.quantity,
          unit: it.unit || 'pcs',
          packType: '১ বক্স / প্যাকেট',
        }))
      );
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sale = tenantSales.find(s => s.id === selectedInvoiceId);
    if (!sale) {
      alert('অনুগ্রহ করে একটি ইনভয়েস নির্বাচন করুন।');
      return;
    }

    const challanNum = 'CH-' + Math.floor(10000 + Math.random() * 90000);

    onCreateChallan({
      challanNumber: challanNum,
      tenantId: tenant.id,
      invoiceNumber: sale.invoiceNumber,
      customerName: sale.customerName,
      customerPhone: sale.customerPhone,
      deliveryAddress: deliveryAddress || 'স্টোর কাউন্টার / ঠিকানা',
      transportName,
      vehicleNumber,
      driverName,
      driverPhone,
      items,
      status: 'dispatched',
      dispatchDate: new Date().toISOString().slice(0, 10),
      notes,
      createdAt: new Date().toLocaleString(),
    });

    setActiveTab('list');
    setSelectedInvoiceId('');
    setItems([]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-700 flex items-center justify-center">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm">ডেলিভারি চালান ব্যবস্থাপনা (Delivery Challans)</h3>
              <p className="text-xs text-slate-300">ইনভয়েস ভিত্তিক পরিবহন চালান তৈরি ও প্রিন্ট করুন</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-slate-800 p-1 rounded-xl flex gap-1 text-xs">
              <button
                onClick={() => { setActiveTab('list'); setSelectedChallanPreview(null); }}
                className={`px-3 py-1 rounded-lg font-bold transition ${activeTab === 'list' && !selectedChallanPreview ? 'bg-purple-700 text-white shadow-xs' : 'text-slate-300'}`}
              >
                চালান তালিকা ({tenantChallans.length})
              </button>
              <button
                onClick={() => { setActiveTab('create'); setSelectedChallanPreview(null); }}
                className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1 transition ${activeTab === 'create' ? 'bg-purple-700 text-white shadow-xs' : 'text-slate-300'}`}
              >
                <Plus className="w-3.5 h-3.5" />
                নতুন চালান
              </button>
            </div>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab 1: Challans List */}
        {activeTab === 'list' && !selectedChallanPreview && (
          <div className="p-6">
            {tenantChallans.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Truck className="w-12 h-12 mx-auto text-slate-300 mb-2 stroke-1" />
                <p className="font-semibold text-slate-600">কোন ডেলিভারি চালান পাওয়া যায়নি</p>
                <p className="text-xs text-slate-400 mt-1">নতুন চালান তৈরি করতে উপরের বাটনে ক্লিক করুন</p>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">চালান নং</th>
                      <th className="py-3 px-4">ইনভয়েস নং</th>
                      <th className="py-3 px-4">গ্রাহক</th>
                      <th className="py-3 px-4">পরিবহন মাধ্যম</th>
                      <th className="py-3 px-4">তারিখ</th>
                      <th className="py-3 px-4 text-center">স্ট্যাটাস</th>
                      <th className="py-3 px-4 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tenantChallans.map((ch) => (
                      <tr key={ch.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-4 font-mono font-bold text-purple-700">{ch.challanNumber}</td>
                        <td className="py-3 px-4 font-mono text-slate-600">{ch.invoiceNumber}</td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-800">{ch.customerName}</div>
                          {ch.customerPhone && <div className="text-[10px] text-slate-400">{ch.customerPhone}</div>}
                        </td>
                        <td className="py-3 px-4 text-slate-700 font-medium">
                          {ch.transportName}
                          {ch.vehicleNumber && <span className="block text-[10px] text-slate-400 font-mono">{ch.vehicleNumber}</span>}
                        </td>
                        <td className="py-3 px-4 text-slate-500">{ch.dispatchDate}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            ch.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                            ch.status === 'dispatched' ? 'bg-indigo-100 text-indigo-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {ch.status === 'delivered' ? 'পৌঁছেছে (Delivered)' :
                             ch.status === 'dispatched' ? 'চলমান (Dispatched)' : 'অপেক্ষমাণ'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setSelectedChallanPreview(ch)}
                            className="px-3 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-xs font-bold transition"
                          >
                            চালান প্রিন্ট
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

        {/* Tab 2: Create Challan */}
        {activeTab === 'create' && (
          <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">কোন বিক্রয় ইনভয়েসের চালান? *</label>
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
                <label className="font-semibold text-slate-700 block mb-1">পরিবহন / কুরিয়ারের নাম:</label>
                <input
                  type="text"
                  placeholder="যেমন: Sundarban, SA Paribahan, RedX, নিজস্ব রাইডার"
                  value={transportName}
                  onChange={e => setTransportName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">গাড়ির নম্বর (যদি থাকে):</label>
                <input
                  type="text"
                  placeholder="ঢাকা মেট্রো-ন ১২৩৪"
                  value={vehicleNumber}
                  onChange={e => setVehicleNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">চালক / ডেলিভারিম্যান ও ফোন:</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="চালকের নাম"
                    value={driverName}
                    onChange={e => setDriverName(e.target.value)}
                    className="w-full px-2 py-2 bg-white border border-slate-200 rounded-xl"
                  />
                  <input
                    type="text"
                    placeholder="চালকের ফোন"
                    value={driverPhone}
                    onChange={e => setDriverPhone(e.target.value)}
                    className="w-full px-2 py-2 bg-white border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="col-span-2">
                <label className="font-semibold text-slate-700 block mb-1">পৌঁছানোর গন্তব্য / ঠিকানা:</label>
                <input
                  type="text"
                  placeholder="সম্পূর্ণ ডেলিভারি ঠিকানা"
                  value={deliveryAddress}
                  onChange={e => setDeliveryAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            {/* Items in Challan */}
            {items.length > 0 && (
              <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100">
                <span className="font-bold text-purple-950 block mb-2">চালানে প্রেরিত পণ্যের তালিকা:</span>
                <table className="w-full text-left text-xs bg-white rounded-xl border border-purple-100 overflow-hidden">
                  <thead className="bg-purple-100/70 text-purple-900 font-bold border-b border-purple-200">
                    <tr>
                      <th className="py-2 px-3">পণ্য</th>
                      <th className="py-2 px-3 text-center">পরিমাণ</th>
                      <th className="py-2 px-3">প্যাকিং ধরন (যেমন: ২ কার্টুন, ১ বস্তা)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-50">
                    {items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="py-2 px-3 font-semibold text-slate-800">{it.productName}</td>
                        <td className="py-2 px-3 text-center font-bold text-purple-800">{it.quantity} {it.unit}</td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={it.packType || ''}
                            onChange={e => {
                              const val = e.target.value;
                              setItems(prev => prev.map((item, i) => i === idx ? { ...item, packType: val } : item));
                            }}
                            placeholder="১ বক্স"
                            className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs w-48"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

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
                চালান তৈরি ও সংরক্ষণ করুন
              </button>
            </div>
          </form>
        )}

        {/* View / Print Challan Preview */}
        {selectedChallanPreview && (
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-start border-b border-slate-200 pb-4">
              <div>
                <h4 className="text-lg font-black text-slate-900">{tenant.name}</h4>
                <p className="text-slate-500 text-xs">{tenant.address}</p>
                <p className="text-slate-600 text-xs">ফোন: {tenant.phone}</p>
              </div>
              <div className="text-right">
                <span className="px-3 py-1 bg-slate-900 text-white font-extrabold text-xs rounded-lg uppercase tracking-wider">
                  ডেলিভারি চালান (DELIVERY CHALLAN)
                </span>
                <p className="font-mono font-bold text-purple-800 mt-1">চালান নং: {selectedChallanPreview.challanNumber}</p>
                <p className="text-slate-500 text-xs font-mono">ইনভয়েস রেফারেন্স: {selectedChallanPreview.invoiceNumber}</p>
                <p className="text-slate-500 text-xs">প্রেরণের তারিখ: {selectedChallanPreview.dispatchDate}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">প্রাপক ও গন্তব্য:</span>
                <h5 className="font-bold text-slate-900">{selectedChallanPreview.customerName}</h5>
                <p className="text-slate-600">{selectedChallanPreview.deliveryAddress}</p>
                {selectedChallanPreview.customerPhone && <p className="text-slate-500 font-mono mt-0.5">মোবাইল: {selectedChallanPreview.customerPhone}</p>}
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">পরিবহন ও কুরিয়ার:</span>
                <p className="font-bold text-slate-800">{selectedChallanPreview.transportName}</p>
                {selectedChallanPreview.vehicleNumber && <p className="text-slate-600 font-mono">যানবাহন: {selectedChallanPreview.vehicleNumber}</p>}
                {selectedChallanPreview.driverName && <p className="text-slate-600">চালক: {selectedChallanPreview.driverName} ({selectedChallanPreview.driverPhone})</p>}
              </div>
            </div>

            <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 w-12 text-center">#</th>
                  <th className="py-2.5 px-3">পণ্যের বিবরণ</th>
                  <th className="py-2.5 px-3 text-center">পরিমাণ</th>
                  <th className="py-2.5 px-3 text-center">প্যাকিং বিস্তারিত</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {selectedChallanPreview.items.map((it, idx) => (
                  <tr key={idx}>
                    <td className="py-2.5 px-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{it.productName}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-slate-900">{it.quantity} {it.unit}</td>
                    <td className="py-2.5 px-3 text-center text-slate-600">{it.packType || 'প্যাকেট'}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pt-8 grid grid-cols-3 gap-4 text-center text-xs">
              <div>
                <div className="w-32 border-b border-slate-300 mx-auto mb-1"></div>
                <span className="text-slate-400 text-[11px]">প্রস্তুতকারক</span>
              </div>
              <div>
                <div className="w-32 border-b border-slate-300 mx-auto mb-1"></div>
                <span className="text-slate-400 text-[11px]">পরিবহনকারী / চালক</span>
              </div>
              <div>
                <div className="w-32 border-b border-slate-300 mx-auto mb-1"></div>
                <span className="text-slate-400 text-[11px]">গ্রহীতার স্বাক্ষর ও সিল</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                onClick={() => setSelectedChallanPreview(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs"
              >
                তালিকায় ফিরুন
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-xl font-bold text-xs flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" /> প্রিন্ট চালান
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
