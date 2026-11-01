import React, { useState } from 'react';
import { InspectionChecklist, ServiceJobTicket, Tenant, ChecklistItem, ChecklistCategory } from '../../types';
import { X, CheckCircle2, XCircle, MinusCircle, Printer, FileCheck, ShieldAlert, Award } from 'lucide-react';

interface InspectionChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: ServiceJobTicket;
  tenant: Tenant;
  existingChecklist?: InspectionChecklist;
  onSaveChecklist: (checklist: InspectionChecklist) => void;
}

const DEFAULT_INSPECTION_ITEMS: { category: ChecklistCategory; name: string }[] = [
  { category: 'Display & Touch', name: 'LCD Display Segment & Backlight Illumination' },
  { category: 'Display & Touch', name: 'Touch Screen Responsiveness & Multi-Touch Test' },
  { category: 'Battery & Power', name: 'Battery Charging & Discharge Cycle Stability' },
  { category: 'Battery & Power', name: 'DC Input Port & Power Button Tactile Response' },
  { category: 'Audio & Microphone', name: 'Alert Buzzer & Speaker Sound Quality' },
  { category: 'Audio & Microphone', name: 'Microphone Input & Noise Filtration' },
  { category: 'Cameras', name: 'Optical Sensor / Camera Clear Focus & Lenses' },
  { category: 'Connectivity & Network', name: 'Wireless Bluetooth / Wi-Fi Sync Calibration' },
  { category: 'Biometrics & Sensors', name: 'Internal Pressure / Temp / Vital Sensors Accuracy' },
  { category: 'Housing & Ports', name: 'Air / Fluid Tubing Tightness (Zero Leakage)' },
  { category: 'Housing & Ports', name: 'Physical Enclosure Cracks, Screws & Assembly' },
  { category: 'Housing & Ports', name: 'Medical / Technical Sanitization & Alcohol Cleaning' },
];

export const InspectionChecklistModal: React.FC<InspectionChecklistModalProps> = ({
  isOpen,
  onClose,
  ticket,
  tenant,
  existingChecklist,
  onSaveChecklist,
}) => {
  if (!isOpen) return null;

  const [inspectionType, setInspectionType] = useState<'pre_repair_intake' | 'post_repair_qa'>(
    existingChecklist?.inspectionType || (ticket.status === 'ready_for_qa' || ticket.status === 'completed' ? 'post_repair_qa' : 'pre_repair_intake')
  );

  const [inspectorName, setInspectorName] = useState(
    existingChecklist?.inspectorName || ticket.assignedTechnicianName || 'প্রধান টেকনিশিয়ান'
  );

  const [items, setItems] = useState<ChecklistItem[]>(() => {
    if (existingChecklist?.items && existingChecklist.items.length > 0) {
      return existingChecklist.items;
    }
    return DEFAULT_INSPECTION_ITEMS.map((def, idx) => ({
      id: `chk-item-${idx + 1}`,
      category: def.category,
      name: def.name,
      status: 'pass',
      notes: '',
    }));
  });

  const [technicianRemarks, setTechnicianRemarks] = useState(
    existingChecklist?.technicianRemarks || 'ডিভাইসের সকল কারিগরি প্যারামিটার স্ট্যান্ডার্ড স্পেসিফিকেশন অনুযায়ী ভেরিফাই করা হয়েছে।'
  );

  const [customerConfirmed, setCustomerConfirmed] = useState(
    existingChecklist?.customerConfirmed ?? true
  );

  const setItemStatus = (id: string, status: 'pass' | 'fail' | 'na') => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, status } : item));
  };

  const setItemNotes = (id: string, notes: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, notes } : item));
  };

  const passCount = items.filter(i => i.status === 'pass').length;
  const failCount = items.filter(i => i.status === 'fail').length;
  const naCount = items.filter(i => i.status === 'na').length;

  const overallResult: 'passed' | 'passed_with_issues' | 'failed' = 
    failCount === 0 ? 'passed' : failCount <= 2 ? 'passed_with_issues' : 'failed';

  const handleSave = () => {
    const checklist: InspectionChecklist = {
      id: existingChecklist?.id || `chk-${Date.now()}`,
      ticketId: ticket.id,
      ticketNumber: ticket.ticketNumber,
      tenantId: tenant.id,
      inspectionType,
      inspectorName,
      inspectionDate: new Date().toISOString().slice(0, 16).replace('T', ' '),
      items,
      overallResult,
      technicianRemarks,
      customerConfirmed,
      createdAt: existingChecklist?.createdAt || new Date().toISOString().slice(0, 16).replace('T', ' '),
    };

    onSaveChecklist(checklist);
    onClose();
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-800 to-emerald-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-xs">
              <FileCheck className="w-5 h-5 text-teal-200" />
            </div>
            <div>
              <h3 className="font-bold text-sm">টেকনিক্যাল চেকলিস্ট সমাপ্তি রিপোর্ট (QA Inspection Report)</h3>
              <p className="text-xs text-teal-200">
                জব টিকিট: <span className="font-mono font-bold text-white">{ticket.ticketNumber}</span> • {ticket.brand} {ticket.model}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrintCertificate}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer print:hidden"
            >
              <Printer className="w-3.5 h-3.5" />
              সার্টিফিকেট প্রিন্ট
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-teal-200 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
          {/* Metadata Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <div>
              <label className="text-slate-500 block mb-1 font-semibold text-[11px]">ইন্সপেকশন পর্যায়:</label>
              <select
                value={inspectionType}
                onChange={e => setInspectionType(e.target.value as any)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-800"
              >
                <option value="pre_repair_intake">📥 ইনটেক প্রাথমিক ডায়াগনসিস (Pre-Repair)</option>
                <option value="post_repair_qa">✅ ফাইনাল ডেলিভারি কিউএ (Post-Repair QA)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-500 block mb-1 font-semibold text-[11px]">ইন্সপেক্টরের নাম:</label>
              <input
                type="text"
                value={inspectorName}
                onChange={e => setInspectorName(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl font-semibold"
              />
            </div>

            <div>
              <label className="text-slate-500 block mb-1 font-semibold text-[11px]">সার্বিক মূল্যায়ন (Overall QA):</label>
              <div className="flex items-center gap-2 pt-0.5">
                {overallResult === 'passed' ? (
                  <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 font-extrabold flex items-center gap-1.5 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ১০০% পাস (Passed)
                  </span>
                ) : overallResult === 'passed_with_issues' ? (
                  <span className="px-3 py-1 rounded-xl bg-amber-100 text-amber-800 font-extrabold flex items-center gap-1.5 text-xs">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    সতর্কতা সহ পাস (With Minor Issues)
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-xl bg-rose-100 text-rose-800 font-extrabold flex items-center gap-1.5 text-xs">
                    <XCircle className="w-4 h-4 text-rose-600" />
                    ব্যর্থ (QA Failed)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center justify-between px-3 py-2 bg-slate-100 rounded-xl text-[11px]">
            <div className="flex items-center gap-4">
              <span className="font-semibold text-slate-700">মোট আইটেম: <strong>{items.length}</strong></span>
              <span className="text-emerald-700 font-bold">✓ পাস: {passCount}</span>
              <span className="text-rose-700 font-bold">✕ ফেইল: {failCount}</span>
              <span className="text-slate-500 font-medium">- প্রযোজ্য নয়: {naCount}</span>
            </div>
            <div className="text-slate-500 font-mono text-[10px]">
              ডিভাইস: {ticket.brand} {ticket.model} ({ticket.imeiOrSerial})
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">ক্যাটাগরি</th>
                  <th className="py-2.5 px-3">টেকনিক্যাল চেকলিস্ট আইটেম</th>
                  <th className="py-2.5 px-3 text-center">স্ট্যাটাস</th>
                  <th className="py-2.5 px-3">টেকনিশিয়ান রিমার্কস</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="py-2 px-3 text-slate-500 font-medium text-[11px] whitespace-nowrap">
                      {item.category}
                    </td>
                    <td className="py-2 px-3 font-semibold text-slate-800">
                      {item.name}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <div className="inline-flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                        <button
                          type="button"
                          onClick={() => setItemStatus(item.id, 'pass')}
                          className={`px-2 py-1 rounded-md text-[10px] font-bold transition cursor-pointer flex items-center gap-1 ${
                            item.status === 'pass' 
                              ? 'bg-emerald-600 text-white shadow-2xs' 
                              : 'text-slate-600 hover:text-emerald-700'
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          পাস
                        </button>
                        <button
                          type="button"
                          onClick={() => setItemStatus(item.id, 'fail')}
                          className={`px-2 py-1 rounded-md text-[10px] font-bold transition cursor-pointer flex items-center gap-1 ${
                            item.status === 'fail' 
                              ? 'bg-rose-600 text-white shadow-2xs' 
                              : 'text-slate-600 hover:text-rose-700'
                          }`}
                        >
                          <XCircle className="w-3 h-3" />
                          ফেইল
                        </button>
                        <button
                          type="button"
                          onClick={() => setItemStatus(item.id, 'na')}
                          className={`px-2 py-1 rounded-md text-[10px] font-bold transition cursor-pointer flex items-center gap-1 ${
                            item.status === 'na' 
                              ? 'bg-slate-600 text-white shadow-2xs' 
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <MinusCircle className="w-3 h-3" />
                          N/A
                        </button>
                      </div>
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        placeholder="মন্তব্য লিখুন..."
                        value={item.notes || ''}
                        onChange={e => setItemNotes(item.id, e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-[11px]"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Remarks & Signoff */}
          <div className="space-y-3 pt-2">
            <div>
              <label className="text-slate-700 block mb-1 font-semibold">টেকনিশিয়ানের চূড়ান্ত মতামত (Final Assessment):</label>
              <textarea
                rows={2}
                value={technicianRemarks}
                onChange={e => setTechnicianRemarks(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl leading-relaxed text-xs"
              />
            </div>

            <div className="flex items-center gap-2 p-3 bg-teal-50 border border-teal-200/70 rounded-xl">
              <input
                type="checkbox"
                id="custConfirm"
                checked={customerConfirmed}
                onChange={e => setCustomerConfirmed(e.target.checked)}
                className="w-4 h-4 text-teal-700 rounded cursor-pointer"
              />
              <label htmlFor="custConfirm" className="text-teal-900 text-xs font-semibold cursor-pointer">
                গ্রাহককে চেকলিস্ট ও ডিভাইসের বর্তমান স্ট্যাটাস বুঝিয়ে দেওয়া হয়েছে এবং তিনি এতে সন্তোষ প্রকাশ করেছেন।
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition cursor-pointer flex items-center gap-1.5"
            >
              <FileCheck className="w-4 h-4" />
              চেকলিস্ট রিপোর্ট সংরক্ষণ করুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
