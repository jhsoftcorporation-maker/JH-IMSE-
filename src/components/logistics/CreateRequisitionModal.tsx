import React, { useState } from 'react';
import { X, Plus, Trash2, AlertCircle, Building2, ShoppingBag, Send } from 'lucide-react';
import { Tenant, Warehouse, Product, BranchRequisition, RequisitionItem, RequisitionUrgency } from '../../types';

interface CreateRequisitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: Tenant;
  warehouses: Warehouse[];
  products: Product[];
  onSubmitRequisition: (requisition: BranchRequisition) => void;
}

export const CreateRequisitionModal: React.FC<CreateRequisitionModalProps> = ({
  isOpen,
  onClose,
  tenant,
  warehouses,
  products,
  onSubmitRequisition,
}) => {
  const tenantWarehouses = warehouses.filter(w => w.tenantId === tenant.id);
  const cdcWarehouses = tenantWarehouses.filter(w => w.type === 'cdc' || w.isMain);
  const branchWarehouses = tenantWarehouses.filter(w => w.type !== 'cdc' || !w.isMain);

  const defaultFrom = branchWarehouses[0]?.id || tenantWarehouses[1]?.id || tenantWarehouses[0]?.id || '';
  const defaultTo = cdcWarehouses[0]?.id || tenantWarehouses[0]?.id || '';

  const [fromBranchId, setFromBranchId] = useState<string>(defaultFrom);
  const [toWarehouseId, setToWarehouseId] = useState<string>(defaultTo);
  const [urgency, setUrgency] = useState<RequisitionUrgency>('urgent');
  const [requestedBy, setRequestedBy] = useState<string>('সুমন রায় (ম্যানেজার)');
  const [notes, setNotes] = useState<string>('');

  // Selected Items State
  const [items, setItems] = useState<{
    productId: string;
    requestedQty: number;
  }[]>([]);
  const [selectedProductToAdd, setSelectedProductToAdd] = useState<string>('');
  const [quantityToAdd, setQuantityToAdd] = useState<number>(10);
  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddItem = () => {
    if (!selectedProductToAdd) return;
    const prod = products.find(p => p.id === selectedProductToAdd);
    if (!prod) return;

    // Check if already in items
    const existingIndex = items.findIndex(i => i.productId === selectedProductToAdd);
    if (existingIndex !== -1) {
      setItems(prev => prev.map((item, idx) => 
        idx === existingIndex ? { ...item, requestedQty: item.requestedQty + quantityToAdd } : item
      ));
    } else {
      setItems(prev => [...prev, { productId: selectedProductToAdd, requestedQty: quantityToAdd }]);
    }

    setSelectedProductToAdd('');
    setQuantityToAdd(10);
  };

  const handleRemoveItem = (index: number) => {
    setItems(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleUpdateQty = (index: number, qty: number) => {
    if (qty <= 0) return;
    setItems(prev => prev.map((item, idx) => idx === index ? { ...item, requestedQty: qty } : item));
  };

  // Calculate items with full metadata
  const requisitionItems: RequisitionItem[] = items.map(item => {
    const p = products.find(prod => prod.id === item.productId)!;
    const branchStock = p?.warehouseStock?.[fromBranchId] ?? (p?.warehouseId === fromBranchId ? p.stock : 0);
    const cdcStock = p?.warehouseStock?.[toWarehouseId] ?? (p?.warehouseId === toWarehouseId ? p.stock : 0);
    return {
      productId: p?.id || item.productId,
      productName: p?.name || 'অজানা পণ্য',
      sku: p?.sku || 'N/A',
      requestedQty: item.requestedQty,
      approvedQty: 0,
      unitCost: p?.costPrice || 0,
      unit: p?.unit || 'pcs',
      currentStockAtBranch: branchStock,
      currentStockAtCDC: cdcStock,
    };
  });

  const totalEstimatedValue = requisitionItems.reduce((acc, i) => acc + (i.requestedQty * i.unitCost), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fromBranchId === toWarehouseId) {
      setFormError('অনুরোধকারী শাখা এবং সরবরাহকারী সেন্ট্রাল গুদাম একই হতে পারে না।');
      return;
    }
    if (requisitionItems.length === 0) {
      setFormError('অনুগ্রহ করে অন্তত একটি পণ্য চাহিদাপত্রে যুক্ত করুন।');
      return;
    }

    const fromBranch = tenantWarehouses.find(w => w.id === fromBranchId);
    const toWh = tenantWarehouses.find(w => w.id === toWarehouseId);

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const reqNo = `RO-${fromBranch?.code?.slice(-3) || 'BR'}-${randomNum}`;

    const newRequisition: BranchRequisition = {
      id: 'ro-' + Date.now(),
      tenantId: tenant.id,
      requisitionNo: reqNo,
      fromBranchId,
      fromBranchName: fromBranch?.name || 'শাখা আউটলেট',
      toWarehouseId,
      toWarehouseName: toWh?.name || 'সেন্ট্রাল ওয়্যারহাউস',
      requestedBy: requestedBy.trim() || 'শাখা ইনচার্জ',
      status: 'submitted',
      urgency,
      notes: notes.trim(),
      items: requisitionItems,
      totalEstimatedValue,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };

    onSubmitRequisition(newRequisition);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-purple-100 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-800 to-indigo-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <Building2 className="w-5 h-5 text-purple-200" />
            </div>
            <div>
              <h3 className="font-bold text-base">নতুন স্টক চাহিদাপত্র তৈরি (Store Requisition Order)</h3>
              <p className="text-xs text-purple-200">সেন্ট্রাল ডিপো থেকে শাখায় পণ্য সরবরাহের আনুষ্ঠানিক চাহিদা</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-purple-200 hover:text-white transition cursor-pointer"
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

          {/* Warehouse Route Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                অনুরোধকারী শাখা আউটলেট (From Branch): *
              </label>
              <select
                value={fromBranchId}
                onChange={e => {
                  setFromBranchId(e.target.value);
                  setFormError(null);
                }}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:border-purple-600"
                required
              >
                {tenantWarehouses.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.name} {w.code ? `(${w.code})` : ''} {w.type === 'cdc' ? '★ CDC' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                সরবরাহকারী সেন্ট্রাল গুদাম (To CDC / Depot): *
              </label>
              <select
                value={toWarehouseId}
                onChange={e => {
                  setToWarehouseId(e.target.value);
                  setFormError(null);
                }}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-semibold text-purple-900 focus:outline-none focus:border-purple-600"
                required
              >
                {tenantWarehouses.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.name} {w.code ? `(${w.code})` : ''} {w.type === 'cdc' ? '★ CDC' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                জরুরিতার মাত্রা (Urgency Level): *
              </label>
              <select
                value={urgency}
                onChange={e => setUrgency(e.target.value as RequisitionUrgency)}
                className={`w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold focus:outline-none ${
                  urgency === 'critical' ? 'text-rose-700' : urgency === 'urgent' ? 'text-amber-700' : 'text-slate-800'
                }`}
              >
                <option value="normal">🟢 স্বাভাবিক চাহিদা (Normal Schedule)</option>
                <option value="urgent">🟠 জরুরি সরবরাহ (Urgent - 24 Hours)</option>
                <option value="critical">🔴 সংকটপূর্ণ স্টক-আউট (Critical - Immediate)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                আবেদনকারী কর্মকর্তা / ম্যানেজার: *
              </label>
              <input
                type="text"
                value={requestedBy}
                onChange={e => setRequestedBy(e.target.value)}
                placeholder="যেমন: সুমন রায় (ম্যানেজার)"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-purple-600"
                required
              />
            </div>
          </div>

          {/* Add Product To Table Toolbar */}
          <div className="bg-purple-50/70 p-3.5 rounded-2xl border border-purple-100 space-y-2">
            <span className="font-bold text-purple-900 block text-xs">
              পণ্যের তালিকা যুক্ত করুন:
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
                      {p.name} ({p.sku}) • কেনা দর: ৳{p.costPrice.toFixed(2)}
                    </option>
                  ))}
              </select>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  value={quantityToAdd}
                  onChange={e => setQuantityToAdd(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-24 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-center"
                  placeholder="পরিমাণ"
                />
                <button
                  type="button"
                  onClick={handleAddItem}
                  disabled={!selectedProductToAdd}
                  className="px-4 py-2 bg-purple-700 hover:bg-purple-800 disabled:bg-slate-300 text-white rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> যোগ করুন
                </button>
              </div>
            </div>
          </div>

          {/* Requisition Items Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">পণ্য বিবরণী</th>
                  <th className="py-2.5 px-3 text-center">ব্রাঞ্চ স্টক</th>
                  <th className="py-2.5 px-3 text-center">সেন্ট্রাল স্টক</th>
                  <th className="py-2.5 px-3 text-center">চাহিদার পরিমাণ</th>
                  <th className="py-2.5 px-3 text-right">আনুমানিক মূল্য</th>
                  <th className="py-2.5 px-3 text-center">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requisitionItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      <ShoppingBag className="w-8 h-8 mx-auto text-slate-300 mb-1" />
                      <p>এখনো কোনো পণ্য যোগ করা হয়নি</p>
                      <span className="text-[10px]">উপরের ড্রপডাউন থেকে পণ্য ও পরিমাণ বেছে নিন</span>
                    </td>
                  </tr>
                ) : (
                  requisitionItems.map((item, idx) => (
                    <tr key={item.productId} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900">{item.productName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">SKU: {item.sku}</div>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.currentStockAtBranch <= 5 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {item.currentStockAtBranch} {item.unit}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700">
                          {item.currentStockAtCDC} {item.unit}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <input
                          type="number"
                          min="1"
                          value={item.requestedQty}
                          onChange={e => handleUpdateQty(idx, parseInt(e.target.value) || 1)}
                          className="w-20 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-center text-purple-800"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        {tenant.currency}{(item.requestedQty * item.unitCost).toFixed(2)}
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
                  ))
                )}
              </tbody>
              {requisitionItems.length > 0 && (
                <tfoot className="bg-slate-50 font-bold border-t border-slate-200 text-slate-800">
                  <tr>
                    <td colSpan={4} className="py-2.5 px-3 text-right">
                      মোট প্রাক্কলিত চাহিদামূল্য:
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-purple-800 text-sm">
                      {tenant.currency}{totalEstimatedValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          {/* Notes */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              বিশেষ নোট / চাহিদার যৌক্তিকতা:
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="যেমন: চলতি সপ্তাহে বিক্রি বেশি হওয়ায় স্টক দ্রুত শেষ হচ্ছে। দ্রুত ছাড়পত্র প্রয়োজন।"
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-purple-600 text-xs"
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
              disabled={requisitionItems.length === 0}
              className="flex-1 py-2.5 bg-purple-700 hover:bg-purple-800 disabled:bg-slate-300 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" /> চাহিদাপত্র প্রেরণ করুন
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
