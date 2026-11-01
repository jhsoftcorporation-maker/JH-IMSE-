import React, { useState } from 'react';
import { MaintenanceContract, MaintenanceVisitLog, Tenant } from '../../types';
import { X, Calendar, CheckCircle2, User, Star } from 'lucide-react';

interface RecordAMCVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: MaintenanceContract;
  tenant: Tenant;
  onSaveVisit: (contractId: string, visit: MaintenanceVisitLog) => void;
}

export const RecordAMCVisitModal: React.FC<RecordAMCVisitModalProps> = ({
  isOpen,
  onClose,
  contract,
  tenant,
  onSaveVisit,
}) => {
  if (!isOpen) return null;

  const [visitDate, setVisitDate] = useState(new Date().toISOString().slice(0, 10));
  const [technicianName, setTechnicianName] = useState('রফিকুল ইসলাম (প্রধান বায়োমেডিক্যাল টেকনিশিয়ান)');
  const [servicePerformed, setServicePerformed] = useState('');
  const [partsReplaced, setPartsReplaced] = useState('');
  const [rating, setRating] = useState('5');
  const [customerRemarks, setCustomerRemarks] = useState('নিয়মিত ত্রৈমাসিক ইন্সপেকশন সন্তোষজনকভাবে সম্পন্ন হয়েছে।');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!servicePerformed.trim()) {
      alert('অনুগ্রহ করে সম্পন্নকৃত সার্ভিসের বিবরণ লিখুন!');
      return;
    }

    const visit: MaintenanceVisitLog = {
      id: `vlog-${Date.now()}`,
      visitDate,
      technicianName,
      servicePerformed,
      partsReplaced: partsReplaced.trim() || undefined,
      status: 'completed',
      rating: parseInt(rating) || 5,
      customerRemarks: customerRemarks.trim() || undefined,
    };

    onSaveVisit(contract.id, visit);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-amber-100 overflow-hidden my-6 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-800 to-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-xs">
              <Calendar className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h3 className="font-bold text-sm">AMC রক্ষণাবেক্ষণ ভিজিট এন্ট্রি</h3>
              <p className="text-xs text-amber-200 font-mono">{contract.contractNumber} • {contract.customerName}</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-amber-200 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">চুক্তির নাম:</span>
              <span className="font-semibold text-slate-800">{contract.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">মোট অনুমোদিত ভিজিট:</span>
              <span className="font-bold text-slate-800">{contract.visitsCompleted + 1} / {contract.totalVisitsAllowed}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">আওতাভুক্ত ইকুইপমেন্ট:</span>
              <span className="font-medium text-slate-700">{contract.coveredEquipment.length} টি যন্ত্র</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-600 block mb-1 font-semibold">ভিজিটের তারিখ: *</label>
              <input
                type="date"
                required
                value={visitDate}
                onChange={e => setVisitDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="text-slate-600 block mb-1 font-semibold">টেকনিশিয়ানের নাম:</label>
              <input
                type="text"
                required
                value={technicianName}
                onChange={e => setTechnicianName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-600 block mb-1 font-semibold">সম্পন্নকৃত সার্ভিস ও ডায়াগনসিস: *</label>
            <textarea
              required
              rows={3}
              placeholder="কি কি কাজ করা হয়েছে (যেমন: সেন্সর ক্লিন, ক্যালিব্রেশন, পাওয়ার টেস্ট ইত্যাদি)..."
              value={servicePerformed}
              onChange={e => setServicePerformed(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl leading-relaxed text-xs"
            />
          </div>

          <div>
            <label className="text-slate-600 block mb-1 font-semibold">প্রতিস্থাপিত কোনো পার্টস থাকলে:</label>
            <input
              type="text"
              placeholder="যেমন: সিলিকন ও-রিং, ব্যাকটেরিয়াল ফিল্টার..."
              value={partsReplaced}
              onChange={e => setPartsReplaced(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-600 block mb-1 font-semibold">গ্রাহক সন্তুষ্টি রেটিং:</label>
              <select
                value={rating}
                onChange={e => setRating(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-amber-700"
              >
                <option value="5">⭐⭐⭐⭐⭐ ৫ তারকা (অসাধারণ)</option>
                <option value="4">⭐⭐⭐⭐ ৪ তারকা (ভালো)</option>
                <option value="3">⭐⭐⭐ ৩ তারকা (সন্তোষজনক)</option>
                <option value="2">⭐⭐ ২ তারকা (উন্নতি দরকার)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-600 block mb-1 font-semibold">গ্রাহকের মন্তব্য / সাইনঅফ:</label>
              <input
                type="text"
                value={customerRemarks}
                onChange={e => setCustomerRemarks(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold shadow-md transition cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              ভিজিট সম্পন্ন রেকর্ড করুন
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
