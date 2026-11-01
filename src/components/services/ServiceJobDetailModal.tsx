import React, { useState } from 'react';
import { 
  ServiceJobTicket, ServiceJobStatus, Product, Tenant, 
  ServiceJobPartItem, InspectionChecklist 
} from '../../types';
import { 
  X, Wrench, CheckCircle2, Clock, Package, DollarSign, 
  Printer, FileCheck, ArrowRight, ShieldCheck, AlertTriangle, Plus, Trash2, Check, Smartphone
} from 'lucide-react';
import { ServiceJobPrintSlip } from './ServiceJobPrintSlip';
import { InspectionChecklistModal } from './InspectionChecklistModal';

interface ServiceJobDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: ServiceJobTicket;
  tenant: Tenant;
  products: Product[];
  checklists: InspectionChecklist[];
  onUpdateTicket: (updated: ServiceJobTicket) => void;
  onAddSparePartToJob?: (ticketId: string, part: ServiceJobPartItem) => void;
  onSaveChecklist: (checklist: InspectionChecklist) => void;
}

const STATUS_STEPS: { key: ServiceJobStatus; label: string; icon: string }[] = [
  { key: 'received', label: 'গৃহীত (Received)', icon: '📥' },
  { key: 'in_diagnosis', label: 'ডায়াগনসিস (Diagnosing)', icon: '🔬' },
  { key: 'waiting_for_parts', label: 'পার্টস অপেক্ষমান', icon: '⏳' },
  { key: 'in_repair', label: 'মেরামত চলছে (In Repair)', icon: '🔧' },
  { key: 'ready_for_qa', label: 'QA ও চেকলিস্ট', icon: '📋' },
  { key: 'completed', label: 'সম্পন্ন (Completed)', icon: '✅' },
  { key: 'delivered', label: 'ডেলিভার্ড (Delivered)', icon: '🚀' },
];

export const ServiceJobDetailModal: React.FC<ServiceJobDetailModalProps> = ({
  isOpen,
  onClose,
  ticket,
  tenant,
  products,
  checklists,
  onUpdateTicket,
  onAddSparePartToJob,
  onSaveChecklist,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'overview' | 'parts' | 'billing'>('overview');
  const [showPrintSlip, setShowPrintSlip] = useState(false);
  const [showChecklistModal, setShowChecklistModal] = useState(false);

  // Diagnostic notes editing
  const [diagnosticNotes, setDiagnosticNotes] = useState(ticket.diagnosticNotes || '');
  const [technicianNotes, setTechnicianNotes] = useState(ticket.technicianNotes || '');

  // Add spare part state
  const [selectedProductId, setSelectedProductId] = useState('');
  const [partQty, setPartQty] = useState('1');
  const [partPrice, setPartPrice] = useState('');

  // Payment collection
  const [paymentAmount, setPaymentAmount] = useState(ticket.dueAmount.toString());
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bkash' | 'nagad' | 'card'>('cash');

  const relatedChecklist = checklists.find(c => c.ticketId === ticket.id);

  const handleStatusChange = (newStatus: ServiceJobStatus) => {
    const updated: ServiceJobTicket = {
      ...ticket,
      status: newStatus,
      diagnosticNotes,
      technicianNotes,
      completedDate: newStatus === 'completed' ? new Date().toISOString().slice(0, 10) : ticket.completedDate,
      deliveredDate: newStatus === 'delivered' ? new Date().toISOString().slice(0, 16).replace('T', ' ') : ticket.deliveredDate,
    };
    onUpdateTicket(updated);
  };

  const handleSelectProduct = (prodId: string) => {
    setSelectedProductId(prodId);
    const prod = products.find(p => p.id === prodId);
    if (prod) {
      setPartPrice(prod.sellingPrice.toString());
    }
  };

  const handleAddPart = () => {
    if (!selectedProductId) {
      alert('অনুগ্রহ করে ইনভেন্টরি থেকে একটি পার্টস নির্বাচন করুন!');
      return;
    }
    const prod = products.find(p => p.id === selectedProductId);
    if (!prod) return;

    const qty = parseInt(partQty) || 1;
    if (prod.stock < qty) {
      alert(`ইনভেন্টরিতে অপর্যাপ্ত স্টক! বর্তমান স্টক: ${prod.stock}`);
      return;
    }

    const price = parseFloat(partPrice) || prod.sellingPrice;
    const subtotal = qty * price;

    const newPart: ServiceJobPartItem = {
      productId: prod.id,
      productName: prod.name,
      sku: prod.sku,
      quantity: qty,
      unitPrice: price,
      subtotal,
    };

    const newPartsList = [...(ticket.partsUsed || []), newPart];
    const newPartsCost = newPartsList.reduce((acc, curr) => acc + curr.subtotal, 0);
    const newTotalCost = ticket.laborCost + newPartsCost - ticket.discount;
    const newDueAmount = Math.max(0, newTotalCost - ticket.advancePaid);

    const updatedTicket: ServiceJobTicket = {
      ...ticket,
      partsUsed: newPartsList,
      partsCost: newPartsCost,
      totalCost: newTotalCost,
      dueAmount: newDueAmount,
      paymentStatus: newDueAmount === 0 ? 'paid' : ticket.advancePaid > 0 ? 'partial' : 'unpaid',
      diagnosticNotes,
      technicianNotes,
    };

    onUpdateTicket(updatedTicket);
    onAddSparePartToJob?.(ticket.id, newPart);

    // Reset input
    setSelectedProductId('');
    setPartQty('1');
    setPartPrice('');
  };

  const handleCollectPayment = () => {
    const pay = parseFloat(paymentAmount) || 0;
    if (pay <= 0) {
      alert('সঠিক জমার পরিমাণ উল্লেখ করুন!');
      return;
    }

    const newAdvance = ticket.advancePaid + pay;
    const newDue = Math.max(0, ticket.totalCost - newAdvance);

    const updated: ServiceJobTicket = {
      ...ticket,
      advancePaid: newAdvance,
      dueAmount: newDue,
      paymentStatus: newDue === 0 ? 'paid' : 'partial',
      diagnosticNotes,
      technicianNotes,
    };

    onUpdateTicket(updated);
    setPaymentAmount('0');
    alert(`৳${pay} পেমেন্ট সফলভাবে সংরক্ষিত হয়েছে! অবশিষ্ট বাকি: ৳${newDue}`);
  };

  const handleSaveNotes = () => {
    const updated: ServiceJobTicket = {
      ...ticket,
      diagnosticNotes,
      technicianNotes,
    };
    onUpdateTicket(updated);
    alert('টেকনিক্যাল নোটস সফলভাবে সংরক্ষিত হয়েছে!');
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-xs">
                <Wrench className="w-5 h-5 text-purple-200" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base">{ticket.ticketNumber}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-200 border border-purple-400/30 uppercase">
                    {ticket.priority} Priority
                  </span>
                </div>
                <p className="text-xs text-purple-200">
                  {ticket.brand} {ticket.model} • IMEI/SN: <span className="font-mono text-white">{ticket.imeiOrSerial}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowPrintSlip(true)}
                className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                জব কার্ড প্রিন্ট
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-purple-200 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Status Pipeline Bar */}
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 overflow-x-auto">
            <div className="flex items-center gap-2 min-w-max">
              {STATUS_STEPS.map((step, idx) => {
                const isCurrent = ticket.status === step.key;
                const isPast = STATUS_STEPS.findIndex(s => s.key === ticket.status) >= idx;
                return (
                  <button
                    key={step.key}
                    type="button"
                    onClick={() => handleStatusChange(step.key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                      isCurrent
                        ? 'bg-purple-800 text-white shadow-xs font-bold'
                        : isPast
                        ? 'bg-purple-100 text-purple-900 hover:bg-purple-200'
                        : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>{step.icon}</span>
                    <span>{step.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-100 text-xs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-2.5 font-bold border-b-2 transition cursor-pointer ${
                activeTab === 'overview'
                  ? 'border-purple-700 text-purple-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              📋 ওভারভিউ ও ডায়াগনসিস
            </button>
            <button
              onClick={() => setActiveTab('parts')}
              className={`pb-2.5 font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'parts'
                  ? 'border-purple-700 text-purple-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>খুচরা যন্ত্রাংশ (Spare Parts: {ticket.partsUsed?.length || 0})</span>
            </button>
            <button
              onClick={() => setActiveTab('billing')}
              className={`pb-2.5 font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'billing'
                  ? 'border-purple-700 text-purple-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>বিলিং ও পেমেন্ট (বকেয়া: ৳{ticket.dueAmount})</span>
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 max-h-[65vh] overflow-y-auto text-xs space-y-4">
            {activeTab === 'overview' && (
              <div className="space-y-4">
                {/* 2-Column Specs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Customer & Intake Card */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <span className="font-bold text-slate-900 block text-xs border-b border-slate-200 pb-1">
                      👤 গ্রাহক ও ইনটেক তথ্য
                    </span>
                    <div className="flex justify-between">
                      <span className="text-slate-500">গ্রাহকের নাম:</span>
                      <span className="font-bold text-slate-800">{ticket.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">মোবাইল:</span>
                      <span className="font-mono text-purple-800 font-bold">{ticket.customerPhone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">ইনটেক তারিখ:</span>
                      <span className="font-mono">{ticket.intakeDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">ডেলিভারি ডেডলাইন:</span>
                      <span className="font-bold text-rose-700 font-mono">{ticket.expectedDeliveryDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">অ্যাসাইনড টেকনিশিয়ান:</span>
                      <span className="font-semibold text-slate-900">{ticket.assignedTechnicianName}</span>
                    </div>
                  </div>

                  {/* Device Specs Card */}
                  <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 space-y-2">
                    <span className="font-bold text-purple-900 block text-xs border-b border-purple-200 pb-1">
                      📱 ডিভাইস স্পেসিফিকেশন
                    </span>
                    <div className="flex justify-between">
                      <span className="text-slate-500">ডিভাইসের ধরন:</span>
                      <span className="font-bold text-slate-800">{ticket.deviceType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">ব্র্যান্ড ও মডেল:</span>
                      <span className="font-semibold text-slate-800">{ticket.brand} - {ticket.model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">সিরিয়াল/IMEI:</span>
                      <span className="font-mono font-bold text-purple-900">{ticket.imeiOrSerial}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">ওয়ারেন্টি কভারেজ:</span>
                      <span className="capitalize font-bold text-emerald-700">{ticket.warrantyStatus.replace(/_/g, ' ')}</span>
                    </div>
                    {ticket.securityLockType !== 'none' && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">আনলক কোড:</span>
                        <span className="font-mono bg-white px-2 py-0.5 rounded border border-purple-200 font-bold">{ticket.securityCode || 'Pattern'}</span>
                      </div>
                    )}
                    {ticket.accessoriesReceived.length > 0 && (
                      <div className="pt-1">
                        <span className="text-[11px] text-slate-500 block">গৃহীত এক্সেসরিজ:</span>
                        <span className="text-slate-700 font-medium">{ticket.accessoriesReceived.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Problem Complaint */}
                <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200">
                  <span className="font-bold text-amber-950 block text-xs mb-1">
                    ⚠️ গ্রাহকের অভিযোগ (Reported Issues):
                  </span>
                  <p className="text-amber-900 leading-relaxed">{ticket.reportedIssues}</p>
                </div>

                {/* Diagnostic Findings */}
                <div className="space-y-3">
                  <div>
                    <label className="text-slate-700 block mb-1 font-semibold">
                      🔬 কারিগরি ডায়াগনসিস ফলাফল (Diagnostic Notes):
                    </label>
                    <textarea
                      rows={2}
                      placeholder="সমস্যার কারণ বিস্তারিত লিখুন..."
                      value={diagnosticNotes}
                      onChange={e => setDiagnosticNotes(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl leading-relaxed text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-slate-700 block mb-1 font-semibold">
                      🛠️ রিপেয়ার অ্যাকশন ও ফাইনাল মন্তব্য (Technician Notes):
                    </label>
                    <textarea
                      rows={2}
                      placeholder="কি কি কাজ করা হয়েছে তা লিখুন..."
                      value={technicianNotes}
                      onChange={e => setTechnicianNotes(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl leading-relaxed text-xs"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleSaveNotes}
                      className="px-4 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
                    >
                      নোটস সংরক্ষণ করুন
                    </button>
                  </div>
                </div>

                {/* QA Inspection Banner */}
                <div className="p-4 bg-teal-50 rounded-2xl border border-teal-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center text-teal-800">
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-teal-950">টেকনিক্যাল ইন্সপেকশন চেকলিস্ট রিপোর্ট</h4>
                      <p className="text-[11px] text-teal-800">
                        {relatedChecklist ? (
                          <span>
                            অবস্থা: <strong>{relatedChecklist.overallResult === 'passed' ? '১০০% পাস' : 'পর্যালোচনা প্রয়োজন'}</strong> ({relatedChecklist.inspectionDate})
                          </span>
                        ) : (
                          'ডেলিভারির পূর্বে কোয়ালিটি নিশ্চয়তার জন্য চেকলিস্ট পূরণ করুন।'
                        )}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowChecklistModal(true)}
                    className="px-3.5 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    {relatedChecklist ? 'চেকলিস্ট দেখুন / সম্পাদনা' : 'নতুন চেকলিস্ট তৈরি'}
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: SPARE PARTS */}
            {activeTab === 'parts' && (
              <div className="space-y-4">
                {/* Add Part Section */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <span className="font-bold text-slate-800 block text-xs">
                    📦 ইনভেন্টরি থেকে খুচরা যন্ত্রাংশ যুক্ত করুন (Auto Stock Deduct):
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="md:col-span-2">
                      <label className="text-slate-500 block mb-1 font-semibold text-[11px]">পণ্য / স্পেয়ার পার্টস:</label>
                      <select
                        value={selectedProductId}
                        onChange={e => handleSelectProduct(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                      >
                        <option value="">-- স্টক পার্টস সিলেক্ট করুন --</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name} (স্টক: {p.stock} {p.unit || 'pcs'} | ৳{p.sellingPrice})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-500 block mb-1 font-semibold text-[11px]">পরিমাণ (Qty):</label>
                      <input
                        type="number"
                        min="1"
                        value={partQty}
                        onChange={e => setPartQty(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-slate-500 block mb-1 font-semibold text-[11px]">একক মূল্য (Price):</label>
                      <input
                        type="number"
                        value={partPrice}
                        onChange={e => setPartPrice(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleAddPart}
                      className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      পার্টস যুক্ত ও স্টক থেকে কর্তন করুন
                    </button>
                  </div>
                </div>

                {/* Used Parts Table */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">পার্টসের নাম ও SKU</th>
                        <th className="py-2.5 px-3 text-center">পরিমাণ</th>
                        <th className="py-2.5 px-3 text-right">একক মূল্য</th>
                        <th className="py-2.5 px-3 text-right">মোট (BDT)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {ticket.partsUsed?.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-6 text-center text-slate-400">
                            কোনো খুচরা যন্ত্রাংশ এখনো ব্যবহার করা হয়নি
                          </td>
                        </tr>
                      ) : (
                        ticket.partsUsed?.map((part, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="py-2.5 px-3">
                              <div className="font-semibold text-slate-800">{part.productName}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{part.sku}</div>
                            </td>
                            <td className="py-2.5 px-3 text-center font-bold text-slate-700">
                              {part.quantity} পিস
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono">
                              {tenant.currency}{part.unitPrice}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-purple-900">
                              {tenant.currency}{part.subtotal}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                    <tfoot className="bg-slate-50 border-t border-slate-200 font-bold">
                      <tr>
                        <td colSpan={3} className="py-2 px-3 text-right">সর্বমোট পার্টস খরচ:</td>
                        <td className="py-2 px-3 text-right font-mono text-purple-900">
                          {tenant.currency}{ticket.partsCost}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: BILLING & PAYMENT */}
            {activeTab === 'billing' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Bill Breakdown */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <span className="font-bold text-slate-900 block text-xs border-b border-slate-200 pb-1">
                      💰 বিল বিবরণী (Cost Breakdown)
                    </span>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">টেকনিশিয়ান শ্রম ফি (Labor):</span>
                      <span className="font-mono font-bold">{tenant.currency}{ticket.laborCost}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">পার্টস বাবদ খরচ (Spare Parts):</span>
                      <span className="font-mono font-bold">{tenant.currency}{ticket.partsCost}</span>
                    </div>
                    {ticket.discount > 0 && (
                      <div className="flex justify-between py-1 text-rose-600">
                        <span>বিশেষ ছাড় (Discount):</span>
                        <span className="font-mono font-bold">-{tenant.currency}{ticket.discount}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-1.5 border-t border-slate-300 font-extrabold text-sm text-slate-900">
                      <span>মোট চূড়ান্ত প্রদেয় বিল:</span>
                      <span className="font-mono text-purple-900">{tenant.currency}{ticket.totalCost}</span>
                    </div>
                    <div className="flex justify-between py-1 text-emerald-700">
                      <span>পরিশোধিত অগ্রিম (Advance):</span>
                      <span className="font-mono font-bold">{tenant.currency}{ticket.advancePaid}</span>
                    </div>
                    <div className="flex justify-between py-1 text-rose-700 font-bold bg-rose-50 px-2 py-1.5 rounded-xl border border-rose-100">
                      <span>অবশিষ্ট বকেয়া (Due Balance):</span>
                      <span className="font-mono text-sm">{tenant.currency}{ticket.dueAmount}</span>
                    </div>
                  </div>

                  {/* Payment Collection Form */}
                  <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200 space-y-3">
                    <span className="font-bold text-emerald-950 block text-xs border-b border-emerald-200 pb-1">
                      💵 বকেয়া বা বিল পরিশোধ গ্রহণ
                    </span>

                    <div>
                      <label className="text-slate-600 block mb-1 font-semibold text-[11px]">পেমেন্টের পরিমাণ (BDT):</label>
                      <input
                        type="number"
                        value={paymentAmount}
                        onChange={e => setPaymentAmount(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono font-bold text-base text-emerald-900"
                      />
                    </div>

                    <div>
                      <label className="text-slate-600 block mb-1 font-semibold text-[11px]">পেমেন্ট মাধ্যম:</label>
                      <select
                        value={paymentMethod}
                        onChange={e => setPaymentMethod(e.target.value as any)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium"
                      >
                        <option value="cash">নগদ ক্যাশ (Cash)</option>
                        <option value="bkash">বিকাশ (bKash)</option>
                        <option value="nagad">নগদ (Nagad)</option>
                        <option value="card">ব্যাংক কার্ড (POS Card)</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={handleCollectPayment}
                      className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold transition cursor-pointer shadow-md flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      পেমেন্ট রিসিভ ও ইনভয়েস সমন্বয়
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Bar */}
          <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between">
            <div className="text-[11px] text-slate-500">
              বর্তমান স্ট্যাটাস: <strong className="text-purple-800 uppercase">{ticket.status}</strong>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Print Slip Modal */}
      {showPrintSlip && (
        <ServiceJobPrintSlip
          ticket={ticket}
          tenant={tenant}
          onClose={() => setShowPrintSlip(false)}
        />
      )}

      {/* Checklist Inspection Modal */}
      {showChecklistModal && (
        <InspectionChecklistModal
          isOpen={showChecklistModal}
          onClose={() => setShowChecklistModal(false)}
          ticket={ticket}
          tenant={tenant}
          existingChecklist={relatedChecklist}
          onSaveChecklist={onSaveChecklist}
        />
      )}
    </>
  );
};
