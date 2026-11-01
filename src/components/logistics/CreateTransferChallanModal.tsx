import React, { useState, useEffect } from 'react';
import { X, Truck, Plus, Trash2, AlertCircle, Building2, CheckCircle2, ShieldCheck, ArrowRight, Barcode } from 'lucide-react';
import { Tenant, Warehouse, Product, StockTransferChallan, TransferChallanItem, BranchRequisition } from '../../types';

interface CreateTransferChallanModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: Tenant;
  warehouses: Warehouse[];
  products: Product[];
  activeRequisition?: BranchRequisition | null;
  onDispatchTransfer: (challan: StockTransferChallan) => void;
}

export const CreateTransferChallanModal: React.FC<CreateTransferChallanModalProps> = ({
  isOpen,
  onClose,
  tenant,
  warehouses,
  products,
  activeRequisition,
  onDispatchTransfer,
}) => {
  const tenantWarehouses = warehouses.filter(w => w.tenantId === tenant.id);
  const cdcWarehouses = tenantWarehouses.filter(w => w.type === 'cdc' || w.isMain);
  const branchWarehouses = tenantWarehouses.filter(w => w.type !== 'cdc' || !w.isMain);

  const defaultSource = activeRequisition ? activeRequisition.toWarehouseId : (cdcWarehouses[0]?.id || tenantWarehouses[0]?.id || '');
  const defaultDest = activeRequisition ? activeRequisition.fromBranchId : (branchWarehouses[0]?.id || tenantWarehouses[1]?.id || '');

  const [sourceWarehouseId, setSourceWarehouseId] = useState<string>(defaultSource);
  const [destinationBranchId, setDestinationBranchId] = useState<string>(defaultDest);
  const [driverName, setDriverName] = useState<string>('মোঃ বাবুল হোসেন');
  const [driverPhone, setDriverPhone] = useState<string>('+880 1819-778899');
  const [vehicleNo, setVehicleNo] = useState<string>('ঢাকা মেট্রো-চ ৫৩-৮৮১৯ (পিকআপ ভ্যান)');
  const [notes, setNotes] = useState<string>('গেটপাস ভেরিফাইড। পণ্য সেন্ট্রাল গুদাম থেকে লোড করে চালকের কাছে হস্তান্তর করা হয়েছে।');

  // Items
  const [items, setItems] = useState<{
    productId: string;
    dispatchedQty: number;
    batchNumber?: string;
  }[]>([]);
  const [selectedProductToAdd, setSelectedProductToAdd] = useState<string>('');
  const [qtyToAdd, setQtyToAdd] = useState<number>(10);
  const [formError, setFormError] = useState<string | null>(null);

  // If opening with an active requisition, pre-populate items!
  useEffect(() => {
    if (activeRequisition) {
      setSourceWarehouseId(activeRequisition.toWarehouseId);
      setDestinationBranchId(activeRequisition.fromBranchId);
      setNotes(`রিকুইজিশন নং ${activeRequisition.requisitionNo} অনুযায়ী সেন্ট্রাল ডিপো থেকে মাল ডিসপ্যাচ করা হলো।`);
      setItems(
        activeRequisition.items.map(i => ({
          productId: i.productId,
          dispatchedQty: i.approvedQty > 0 ? i.approvedQty : i.requestedQty,
        }))
      );
    } else {
      setItems([]);
    }
  }, [activeRequisition, isOpen]);

  if (!isOpen) return null;

  const handleAddItem = () => {
    if (!selectedProductToAdd) return;
    const prod = products.find(p => p.id === selectedProductToAdd);
    if (!prod) return;

    const existingIndex = items.findIndex(i => i.productId === selectedProductToAdd);
    if (existingIndex !== -1) {
      setItems(prev => prev.map((item, idx) => 
        idx === existingIndex ? { ...item, dispatchedQty: item.dispatchedQty + qtyToAdd } : item
      ));
    } else {
      setItems(prev => [...prev, { 
        productId: selectedProductToAdd, 
        dispatchedQty: qtyToAdd,
        batchNumber: prod.batchNumber || 'DEF-LOT-01'
      }]);
    }
    setSelectedProductToAdd('');
    setQtyToAdd(10);
  };

  const handleRemoveItem = (index: number) => {
    setItems(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleUpdateQty = (index: number, qty: number) => {
    if (qty <= 0) return;
    setItems(prev => prev.map((item, idx) => idx === index ? { ...item, dispatchedQty: qty } : item));
  };

  const challanItems: TransferChallanItem[] = items.map(item => {
    const p = products.find(prod => prod.id === item.productId)!;
    return {
      productId: p?.id || item.productId,
      productName: p?.name || 'অজানা পণ্য',
      sku: p?.sku || 'N/A',
      unit: p?.unit || 'pcs',
      unitCost: p?.costPrice || 0,
      dispatchedQty: item.dispatchedQty,
      receivedQty: 0,
      damagedQty: 0,
      batchNumber: item.batchNumber || p?.batchNumber,
    };
  });

  const totalItemsCount = challanItems.reduce((acc, i) => acc + i.dispatchedQty, 0);
  const totalCostValue = challanItems.reduce((acc, i) => acc + (i.dispatchedQty * i.unitCost), 0);

  const sourceWh = tenantWarehouses.find(w => w.id === sourceWarehouseId);
  const destWh = tenantWarehouses.find(w => w.id === destinationBranchId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (sourceWarehouseId === destinationBranchId) {
      setFormError('উৎস ওয়্যারহাউস এবং গন্তব্য শাখা একই হতে পারে না।');
      return;
    }
    if (challanItems.length === 0) {
      setFormError('অনুগ্রহ করে চালানে অন্তত একটি পণ্য যুক্ত করুন।');
      return;
    }
    if (!driverName.trim() || !vehicleNo.trim()) {
      setFormError('চালকের নাম ও গাড়ির নম্বর প্রদান করা বাধ্যতামূলক।');
      return;
    }

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const transferNo = `TR-${new Date().getFullYear()}-${randomNum}`;
    const gatepassBarcode = `GP-${transferNo}`;

    const newTransfer: StockTransferChallan = {
      id: 'tr-' + Date.now(),
      tenantId: tenant.id,
      transferNo,
      gatepassBarcode,
      requisitionId: activeRequisition?.id,
      requisitionNo: activeRequisition?.requisitionNo,
      sourceWarehouseId,
      sourceWarehouseName: sourceWh?.name || 'সেন্ট্রাল ডিপো',
      destinationBranchId,
      destinationBranchName: destWh?.name || 'শাখা আউটলেট',
      driverName: driverName.trim(),
      driverPhone: driverPhone.trim(),
      vehicleNo: vehicleNo.trim(),
      totalItems: totalItemsCount,
      totalCostValue,
      status: 'in_transit', // Goods In Transit (GIT)
      items: challanItems,
      dispatchedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      dispatchedBy: tenant.ownerName || 'ডা. মোঃ আব্দুর রহিম',
      notes: notes.trim(),
      journalEntryId: `jv-git-${Date.now()}`,
    };

    onDispatchTransfer(newTransfer);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-indigo-100 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-800 to-purple-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <Truck className="w-5 h-5 text-indigo-200" />
            </div>
            <div>
              <h3 className="font-bold text-base">আন্তঃশাখা ট্রান্সফার গেটপাস চালান (Stock Transfer Challan)</h3>
              <p className="text-xs text-indigo-200">
                {activeRequisition 
                  ? `রিকুইজিশন ${activeRequisition.requisitionNo} থেকে ডিসপ্যাচ প্রস্তুত` 
                  : 'সেন্ট্রাল ডিপো থেকে মাল আউট ও ট্রানজিটে প্রেরণ'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-indigo-200 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Route Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                উৎস গুদাম (Dispatch From): *
              </label>
              <select
                value={sourceWarehouseId}
                onChange={e => {
                  setSourceWarehouseId(e.target.value);
                  setFormError(null);
                }}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-indigo-600"
                required
              >
                {tenantWarehouses.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.name} {w.code ? `(${w.code})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                গন্তব্য শাখা (Destination Branch): *
              </label>
              <select
                value={destinationBranchId}
                onChange={e => {
                  setDestinationBranchId(e.target.value);
                  setFormError(null);
                }}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-indigo-900 focus:outline-none focus:border-indigo-600"
                required
              >
                {tenantWarehouses.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.name} {w.code ? `(${w.code})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                চালকের নাম (Driver Name): *
              </label>
              <input
                type="text"
                value={driverName}
                onChange={e => setDriverName(e.target.value)}
                placeholder="যেমন: মোঃ বাবুল হোসেন"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 font-medium"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                চালকের মোবাইল নম্বর: *
              </label>
              <input
                type="text"
                value={driverPhone}
                onChange={e => setDriverPhone(e.target.value)}
                placeholder="+880 1819-XXXXXX"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 font-mono"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">
                যানবাহন নম্বর ও প্রকার (Vehicle No): *
              </label>
              <input
                type="text"
                value={vehicleNo}
                onChange={e => setVehicleNo(e.target.value)}
                placeholder="যেমন: ঢাকা মেট্রো-চ ৫৩-৮৮১৯ (পিকআপ ভ্যান)"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 font-medium"
                required
              />
            </div>
          </div>

          {/* Add Product Toolbar (if manual) */}
          <div className="bg-indigo-50/70 p-3.5 rounded-2xl border border-indigo-100 space-y-2">
            <span className="font-bold text-indigo-900 block text-xs">
              স্থানান্তরযোগ্য পণ্য তালিকা:
            </span>
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={selectedProductToAdd}
                onChange={e => setSelectedProductToAdd(e.target.value)}
                className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none"
              >
                <option value="">-- পণ্য নির্বাচন করুন --</option>
                {products
                  .filter(p => p.tenantId === tenant.id)
                  .map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku}) • স্টক: {p.warehouseStock?.[sourceWarehouseId] ?? p.stock}
                    </option>
                  ))}
              </select>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  value={qtyToAdd}
                  onChange={e => setQtyToAdd(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-24 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-center"
                  placeholder="পরিমাণ"
                />
                <button
                  type="button"
                  onClick={handleAddItem}
                  disabled={!selectedProductToAdd}
                  className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 disabled:bg-slate-300 text-white rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> যোগ করুন
                </button>
              </div>
            </div>
          </div>

          {/* Challan Items Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">পণ্য ও ব্যাচ</th>
                  <th className="py-2.5 px-3 text-center">উৎস স্টক</th>
                  <th className="py-2.5 px-3 text-center">স্থানান্তর পরিমাণ</th>
                  <th className="py-2.5 px-3 text-right">ইউনিট দর</th>
                  <th className="py-2.5 px-3 text-right">মোট ভ্যালু</th>
                  <th className="py-2.5 px-3 text-center">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {challanItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      <Truck className="w-8 h-8 mx-auto text-slate-300 mb-1" />
                      <p>কোনো পণ্য চালানে যুক্ত করা হয়নি</p>
                    </td>
                  </tr>
                ) : (
                  challanItems.map((item, idx) => {
                    const prod = products.find(p => p.id === item.productId);
                    const sourceStock = prod?.warehouseStock?.[sourceWarehouseId] ?? prod?.stock ?? 0;
                    return (
                      <tr key={item.productId} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-900">{item.productName}</div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            SKU: {item.sku} {item.batchNumber ? `• Batch: ${item.batchNumber}` : ''}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                            {sourceStock} {item.unit}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <input
                            type="number"
                            min="1"
                            value={item.dispatchedQty}
                            onChange={e => handleUpdateQty(idx, parseInt(e.target.value) || 1)}
                            className="w-20 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-center text-indigo-800"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                          {tenant.currency}{item.unitCost.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-indigo-900">
                          {tenant.currency}{(item.dispatchedQty * item.unitCost).toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              {challanItems.length > 0 && (
                <tfoot className="bg-slate-50 font-bold border-t border-slate-200 text-slate-800">
                  <tr>
                    <td colSpan={2} className="py-2.5 px-3">
                      মোট আইটেম: {totalItemsCount} পিস
                    </td>
                    <td colSpan={2} className="py-2.5 px-3 text-right">
                      মোট স্টক মূল্য (GIT Value):
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-indigo-900 text-sm">
                      {tenant.currency}{totalCostValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          {/* Phase 10 Automated Accounting Journal Preview */}
          <div className="bg-emerald-50/80 p-3.5 rounded-2xl border border-emerald-200 space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>স্বয়ংক্রিয় অ্যাকাউন্টিং জাবেদা অনুমোদন (Phase 10 & 11 Automated JV):</span>
            </div>
            <div className="font-mono text-[11px] text-emerald-800 bg-white/70 p-2.5 rounded-xl border border-emerald-100 space-y-1">
              <div className="flex justify-between">
                <span>Dr. 1055 পণ্য ট্রানজিটে (Goods In Transit - Asset)</span>
                <span className="font-bold">{tenant.currency}{totalCostValue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pl-4 text-emerald-900">
                <span>Cr. 1050 পণ্য স্টক - সেন্ট্রাল গুদাম (Inventory CDC)</span>
                <span className="font-bold">{tenant.currency}{totalCostValue.toFixed(2)}</span>
              </div>
            </div>
            <p className="text-[10px] text-emerald-700">
              * মাল ডিসপ্যাচ হওয়ার সাথে সাথে স্বয়ংক্রিয়ভাবে সেন্ট্রাল ডিপোর স্টক হ্রাস পাবে এবং ট্রানজিট হিসেবে হিসাবভুক্ত হবে।
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">গেটপাস চালান মন্তব্য:</label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 text-xs"
            />
          </div>

          {/* Modal Action Buttons */}
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
              disabled={challanItems.length === 0}
              className="flex-1 py-2.5 bg-indigo-700 hover:bg-indigo-800 disabled:bg-slate-300 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Truck className="w-4 h-4" /> গেটপাস চালান অনুমোদন ও ডিসপ্যাচ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
