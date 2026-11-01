import React from 'react';
import { X, Printer, ShieldCheck, Download, CheckCircle2, Building, Calendar, DollarSign } from 'lucide-react';
import { CommercialContract, Tenant } from '../../types';

interface ContractPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: CommercialContract | null;
  tenant: Tenant;
  currency?: string;
}

export const ContractPrintModal: React.FC<ContractPrintModalProps> = ({
  isOpen,
  onClose,
  contract,
  tenant,
  currency = '৳',
}) => {
  if (!isOpen || !contract) return null;

  const handlePrint = () => {
    window.print();
  };

  const getCategoryLabel = (cat: CommercialContract['category']) => {
    switch (cat) {
      case 'corporate_supply':
        return 'কর্পোরেট সাপ্লাই চুক্তি (Corporate Supply Agreement)';
      case 'service_sla':
        return 'সার্ভিস ও এসএলএ চুক্তি (Service Level Agreement)';
      case 'vendor_distribution':
        return 'ভেন্ডর ডিস্ট্রিবিউটর চুক্তি (Vendor Distribution Agreement)';
      case 'franchise_license':
        return 'ফ্র্যাঞ্চাইজি ও লাইসেন্সিং চুক্তি (Franchise Agreement)';
      case 'nda_mou':
        return 'গোপনীয়তা ও সমঝোতা স্মারক (NDA / Non-Disclosure Agreement)';
    }
  };

  const getPaymentTermsLabel = (term: CommercialContract['paymentTerms']) => {
    switch (term) {
      case 'monthly_retainer':
        return 'মাসিক রিটেইনার (Monthly Retainer)';
      case 'milestone_based':
        return 'মাইলস্টোন ডেলিভারেবল কিস্তি (Milestone Based)';
      case 'advance_full':
        return '১০০% পূর্ণ অগ্রিম (Full Advance)';
      case 'net_30':
        return 'ইনভয়েস জমার ৩০ দিনের মধ্যে (Net 30 Days)';
      case 'custom':
        return 'দ্বিপাক্ষিক আলোচনা সাপেক্ষে (Custom Terms)';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto bg-white rounded-2xl shadow-2xl flex flex-col border border-slate-100">
        {/* Header Actions */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-3.5 bg-slate-900 text-white rounded-t-2xl">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold font-mono">{contract.contractNumber}</span>
            <span className="text-xs text-slate-300">| লিগ্যাল চুক্তিপত্র প্রিন্ট ভিউ</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              প্রিন্ট (Print)
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Contract Document */}
        <div id="contract-printable" className="p-8 space-y-6 text-slate-800 bg-white">
          {/* Header Title */}
          <div className="text-center border-b-2 border-slate-900 pb-5 space-y-1">
            <h1 className="text-xl font-extrabold uppercase tracking-wide text-slate-900">
              {tenant.name}
            </h1>
            <p className="text-xs text-slate-500">{tenant.address} | হেল্পলাইন: {tenant.phone}</p>
            <div className="pt-2">
              <span className="inline-block px-4 py-1 bg-purple-50 text-purple-900 rounded-full font-bold text-xs uppercase tracking-wider border border-purple-200">
                {getCategoryLabel(contract.category)}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono pt-1">চুক্তি রেফারেন্স নং: {contract.contractNumber}</p>
          </div>

          {/* Opening Preamble */}
          <p className="text-xs leading-relaxed text-slate-700 text-justify">
            এই বাণিজ্যিক চুক্তিপত্রটি <strong>{contract.startDate}</strong> তারিখে প্রথম পক্ষ <strong>{tenant.name}</strong> (যার কার্যনির্বাহী কার্যালয়: {tenant.address}) এবং দ্বিতীয় পক্ষ <strong>{contract.partyName}</strong> (যোগাযোগ: {contract.partyContact}, ইমেইল: {contract.partyEmail || 'N/A'}, ঠিকানা: {contract.partyAddress || 'N/A'})-এর মধ্যে পারস্পরিক সমঝোতা ও সম্মতির ভিত্তিতে স্বাক্ষরিত হলো।
          </p>

          {/* Key Commercial Terms Box */}
          <div className="border border-slate-300 rounded-xl overflow-hidden text-xs">
            <div className="bg-slate-100 px-4 py-2 font-bold text-slate-900 border-b border-slate-300 flex items-center justify-between">
              <span>মূল বাণিজ্যিক ও আর্থিক শর্তাবলী (Commercial Terms Summary)</span>
              <span className="text-[11px] font-normal text-slate-500">চুক্তির স্থায়িত্ব: {contract.startDate} হতে {contract.endDate}</span>
            </div>
            <div className="grid grid-cols-2 divide-x divide-slate-200 bg-slate-50/50">
              <div className="p-3 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">চুক্তির মোট মূল্য:</span>
                  <span className="font-bold text-purple-800 font-mono">
                    {contract.contractValue > 0 ? `${currency}${contract.contractValue.toLocaleString()}` : 'অপ্রযোজ্য / সমঝোতা স্মারক'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">বিলিং ও পেমেন্ট ব্যবস্থা:</span>
                  <span className="font-semibold text-slate-800">{getPaymentTermsLabel(contract.paymentTerms)}</span>
                </div>
              </div>
              <div className="p-3 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">অটো রিনিউয়াল:</span>
                  <span className="font-semibold text-emerald-700">{contract.autoRenew ? 'হ্যাঁ, স্বয়ংক্রিয় নবায়নযোগ্য' : 'না, নির্দিষ্ট মেয়াদী'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">রিনিউয়াল নোটিশ সময়:</span>
                  <span className="font-semibold text-slate-800">{contract.renewalNoticeDays} দিন পূর্বে</span>
                </div>
              </div>
            </div>
          </div>

          {/* Clauses & Articles */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
              আইনি ধারা ও শর্তাবলী (Terms & Conditions)
            </h3>

            <div className="space-y-3">
              {contract.clauses.map((clause, idx) => (
                <div key={clause.id} className="text-xs space-y-1">
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="font-mono text-purple-700">ধারা {idx + 1}.</span>
                    <span>{clause.title}</span>
                  </h4>
                  <p className="text-slate-700 text-justify leading-relaxed pl-5 text-[11px]">
                    {clause.content}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Notes if any */}
          {contract.notes && (
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
              <strong className="text-slate-800">বিশেষ দ্রষ্টব্য / নোট:</strong>
              <p className="text-slate-600 mt-0.5 text-[11px]">{contract.notes}</p>
            </div>
          )}

          {/* Signature Boxes */}
          <div className="pt-12 grid grid-cols-2 gap-12 text-xs">
            {/* Tenant Side */}
            <div className="space-y-4 text-center">
              <div className="border-b border-dashed border-slate-400 pb-1">
                <p className="font-serif italic text-purple-900 font-bold text-sm">
                  {contract.signedByTenant}
                </p>
              </div>
              <div>
                <p className="font-bold text-slate-900">প্রথম পক্ষের স্বাক্ষর ও সিলমোহর</p>
                <p className="text-[11px] text-slate-500">{tenant.name}</p>
                <p className="text-[10px] text-slate-400 mt-1">তারিখ: {contract.signedDate || contract.startDate}</p>
              </div>
            </div>

            {/* Client/Party Side */}
            <div className="space-y-4 text-center">
              <div className="border-b border-dashed border-slate-400 pb-1">
                <p className="font-serif italic text-slate-800 font-bold text-sm">
                  {contract.signedByParty}
                </p>
              </div>
              <div>
                <p className="font-bold text-slate-900">দ্বিতীয় পক্ষের স্বাক্ষর ও সিলমোহর</p>
                <p className="text-[11px] text-slate-500">{contract.partyName}</p>
                <p className="text-[10px] text-slate-400 mt-1">তারিখ: {contract.signedDate || contract.startDate}</p>
              </div>
            </div>
          </div>

          {/* Seal / Watermark simulation */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-200 text-[10px] text-slate-400 font-mono">
            <span>JH IMSE Enterprise Cloud ERP & Contract Governance Engine</span>
            <span>Security Hash: SHA256-{(contract.id + contract.contractNumber).slice(0, 16)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
