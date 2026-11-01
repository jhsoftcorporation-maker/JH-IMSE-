import React, { useState } from 'react';
import { X, FileText, Plus, Trash2, Calendar, DollarSign, Building, ShieldCheck } from 'lucide-react';
import { 
  CommercialContract, ContractCategory, ContractPartyType, 
  ContractPaymentTerms, ContractClause, Customer, Supplier 
} from '../../types';

interface CreateContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contract: Omit<CommercialContract, 'id' | 'createdAt'>) => void;
  customers: Customer[];
  suppliers: Supplier[];
  currency?: string;
}

export const CreateContractModal: React.FC<CreateContractModalProps> = ({
  isOpen,
  onClose,
  onSave,
  customers,
  suppliers,
  currency = '৳',
}) => {
  const [contractNumber, setContractNumber] = useState(`CNT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ContractCategory>('corporate_supply');
  const [partyType, setPartyType] = useState<ContractPartyType>('client');
  const [partyName, setPartyName] = useState('');
  const [partyContact, setPartyContact] = useState('');
  const [partyEmail, setPartyEmail] = useState('');
  const [partyAddress, setPartyAddress] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [contractValue, setContractValue] = useState<number>(500000);
  const [paymentTerms, setPaymentTerms] = useState<ContractPaymentTerms>('monthly_retainer');
  const [autoRenew, setAutoRenew] = useState(true);
  const [renewalNoticeDays, setRenewalNoticeDays] = useState(30);
  const [signedByTenant, setSignedByTenant] = useState('Managing Director / Proprietor');
  const [signedByParty, setSignedByParty] = useState('Authorized Representative');
  const [notes, setNotes] = useState('');

  // Legal Clauses builder
  const [clauses, setClauses] = useState<ContractClause[]>([
    {
      id: 'cl-1',
      title: 'সরবরাহ সময়সীমা ও গুণগত মান (Supply SLA & Quality)',
      content: 'অনুমোদিত ক্রয়াদেশ প্রাপ্তির সর্বোচ্চ ৪৮ ঘণ্টার মধ্যে নির্ধারিত স্পেসিফিকেশন ও ওয়ারেন্টি সহ ডেলিভারি সম্পন্ন করতে হবে।',
    },
    {
      id: 'cl-2',
      title: 'বিল পরিশোধের শর্তাবলী (Payment Terms & Billing)',
      content: 'মাসিক ইনভয়েস সাবমিশনের ৩০ দিনের মধ্যে নির্ধারিত ব্যাংক অ্যাকাউন্টে সম্পূর্ণ বিল পরিশোধ করতে হবে।',
    },
    {
      id: 'cl-3',
      title: 'গোপনীয়তা ও দায়বদ্ধতা (Confidentiality & Non-Disclosure)',
      content: 'চুক্তির উভয় পক্ষ ব্যবসায়িক তথ্য, ক্লায়েন্ট রেকর্ড ও আর্থিক তথ্যের গোপনীয়তা বজায় রাখতে বাধ্য থাকবে।',
    },
  ]);

  const [newClauseTitle, setNewClauseTitle] = useState('');
  const [newClauseContent, setNewClauseContent] = useState('');

  if (!isOpen) return null;

  const handleSelectPartyQuick = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!val) return;

    if (partyType === 'client') {
      const foundCust = customers.find(c => c.id === val);
      if (foundCust) {
        setPartyName(foundCust.company || foundCust.name);
        setPartyContact(foundCust.phone);
        setPartyEmail(foundCust.email || '');
        setPartyAddress(foundCust.address || '');
      }
    } else {
      const foundSup = suppliers.find(s => s.id === val);
      if (foundSup) {
        setPartyName(foundSup.name);
        setPartyContact(foundSup.phone);
        setPartyEmail(foundSup.email || '');
        setPartyAddress(foundSup.address || '');
      }
    }
  };

  const handleAddClause = () => {
    if (!newClauseTitle.trim() || !newClauseContent.trim()) return;
    setClauses(prev => [
      ...prev,
      {
        id: `cl-${Date.now()}`,
        title: newClauseTitle.trim(),
        content: newClauseContent.trim(),
      },
    ]);
    setNewClauseTitle('');
    setNewClauseContent('');
  };

  const handleRemoveClause = (id: string) => {
    setClauses(prev => prev.filter(c => c.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !partyName.trim()) return;

    onSave({
      contractNumber,
      tenantId: '',
      title: title.trim(),
      category,
      partyType,
      partyName: partyName.trim(),
      partyContact: partyContact.trim(),
      partyEmail: partyEmail.trim(),
      partyAddress: partyAddress.trim(),
      startDate,
      endDate,
      contractValue: Number(contractValue) || 0,
      paymentTerms,
      status: 'active',
      autoRenew,
      renewalNoticeDays: Number(renewalNoticeDays) || 30,
      clauses,
      signedByTenant: signedByTenant.trim(),
      signedByParty: signedByParty.trim(),
      signedDate: new Date().toISOString().slice(0, 10),
      notes: notes.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto bg-white rounded-2xl shadow-2xl flex flex-col border border-slate-100">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">নতুন বাণিজ্যিক চুক্তিপত্র (Create Commercial Contract)</h2>
              <p className="text-xs text-slate-500">ক্লায়েন্ট, ভেন্ডর ও পার্টনারদের সাথে লিগ্যাল চুক্তি ও রিনিউয়াল শিডিউল</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Contract Code, Title, Category */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">চুক্তি কোড / রেফারেন্স</label>
              <input
                type="text"
                value={contractNumber}
                onChange={e => setContractNumber(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl text-purple-700 focus:outline-none"
              />
            </div>
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-slate-700">চুক্তির শিরোনাম *</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="যেমন: Evercare Hospital Annual Specialized Medicine Supply SLA"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">চুক্তির ধরন</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as ContractCategory)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
              >
                <option value="corporate_supply">কর্পোরেট সাপ্লাই (Corporate Supply)</option>
                <option value="service_sla">সার্ভিস ও এসএলএ (Service SLA)</option>
                <option value="vendor_distribution">ভেন্ডর ডিস্ট্রিবিউশন (Vendor Agreement)</option>
                <option value="franchise_license">ফ্র্যাঞ্চাইজি ও লাইসেন্স (Franchise)</option>
                <option value="nda_mou">সমঝোতা স্মারক ও এনডিএ (MOU / NDA)</option>
              </select>
            </div>
          </div>

          {/* Party details */}
          <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/70 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Building className="w-4 h-4 text-purple-600" />
                <span>চুক্তিবদ্ধ পক্ষ (Party Details)</span>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-xs font-semibold text-slate-600">পক্ষ ক্যাটাগরি:</label>
                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center gap-1 text-xs">
                    <input
                      type="radio"
                      checked={partyType === 'client'}
                      onChange={() => setPartyType('client')}
                      className="accent-purple-600"
                    />
                    ক্লায়েন্ট
                  </label>
                  <label className="inline-flex items-center gap-1 text-xs">
                    <input
                      type="radio"
                      checked={partyType === 'supplier'}
                      onChange={() => setPartyType('supplier')}
                      className="accent-purple-600"
                    />
                    সাপ্লায়ার
                  </label>
                  <label className="inline-flex items-center gap-1 text-xs">
                    <input
                      type="radio"
                      checked={partyType === 'partner'}
                      onChange={() => setPartyType('partner')}
                      className="accent-purple-600"
                    />
                    পার্টনার
                  </label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-600">দ্রুত সিলেক্ট করুন</label>
                <select
                  onChange={handleSelectPartyQuick}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none"
                >
                  <option value="">-- বিদ্যমান তালিকা --</option>
                  {partyType === 'client' && customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} {c.company ? `(${c.company})` : ''}</option>
                  ))}
                  {partyType === 'supplier' && suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-600">প্রতিষ্ঠানের নাম *</label>
                <input
                  type="text"
                  required
                  value={partyName}
                  onChange={e => setPartyName(e.target.value)}
                  placeholder="যেমন: Evercare Hospital Ltd."
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-600">মোবাইল নম্বর</label>
                <input
                  type="text"
                  value={partyContact}
                  onChange={e => setPartyContact(e.target.value)}
                  placeholder="+880 1711-xxxxxx"
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-600">ইমেইল ঠিকানা</label>
                <input
                  type="email"
                  value={partyEmail}
                  onChange={e => setPartyEmail(e.target.value)}
                  placeholder="procurement@company.com"
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Value, Payment Terms, Dates */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">মোট চুক্তি মূল্য ({currency})</label>
              <input
                type="number"
                min="0"
                value={contractValue}
                onChange={e => setContractValue(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">পেমেন্ট টার্মস</label>
              <select
                value={paymentTerms}
                onChange={e => setPaymentTerms(e.target.value as ContractPaymentTerms)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="monthly_retainer">মাসিক রিটেইনার (Monthly Retainer)</option>
                <option value="milestone_based">মাইলস্টোন কিস্তি (Milestone Based)</option>
                <option value="advance_full">পূর্ণ অগ্রিম (100% Advance)</option>
                <option value="net_30">নেট ৩০ দিন (Net 30 Days)</option>
                <option value="custom">কাস্টম পেমেন্ট (Custom)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">চুক্তি শুরুর তারিখ</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">চুক্তির মেয়াদ শেষ</label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Renewal settings */}
          <div className="flex items-center justify-between p-3 bg-purple-50/50 rounded-xl border border-purple-100 text-xs">
            <label className="flex items-center gap-2 cursor-pointer font-semibold text-purple-900">
              <input
                type="checkbox"
                checked={autoRenew}
                onChange={e => setAutoRenew(e.target.checked)}
                className="w-4 h-4 rounded text-purple-600 accent-purple-600"
              />
              অটো রিনিউয়াল অপশন সক্রিয় রাখুন (Auto Renew Contract)
            </label>
            <div className="flex items-center gap-2">
              <span className="text-slate-600">রিনিউয়াল নোটিশ সময়:</span>
              <input
                type="number"
                min="7"
                max="90"
                value={renewalNoticeDays}
                onChange={e => setRenewalNoticeDays(Number(e.target.value))}
                className="w-16 px-2 py-1 text-xs border border-slate-200 rounded-lg bg-white font-bold"
              />
              <span className="text-slate-500">দিন পূর্বে</span>
            </div>
          </div>

          {/* Contract Clauses */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              <span>আইনি শর্তাবলী ও অনুচ্ছেদ (Contract Clauses & Terms) ({clauses.length})</span>
            </label>

            <div className="space-y-2">
              {clauses.map((c, idx) => (
                <div key={c.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{idx + 1}. {c.title}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveClause(c.id)}
                      className="text-slate-400 hover:text-red-500 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-slate-600 text-[11px]">{c.content}</p>
                </div>
              ))}
            </div>

            {/* Add clause inline */}
            <div className="p-3 bg-slate-50/50 rounded-xl border border-dashed border-slate-300 space-y-2">
              <span className="text-[11px] font-bold text-slate-600">+ নতুন শর্ত / অনুচ্ছেদ যোগ করুন:</span>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="শর্তের শিরোনাম (যেমন: ওয়্যারেন্টি ও রিটার্ন পলিসি)"
                  value={newClauseTitle}
                  onChange={e => setNewClauseTitle(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none"
                />
                <textarea
                  rows={2}
                  placeholder="শর্তের পূর্ণ অনুচ্ছেদ ও ধারা লিখুন..."
                  value={newClauseContent}
                  onChange={e => setNewClauseContent(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none"
                />
                <div className="text-right">
                  <button
                    type="button"
                    onClick={handleAddClause}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition inline-flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    শর্ত যোগ করুন
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Signatories */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">স্বাক্ষরকারী (প্রথম পক্ষ / প্রতিষ্ঠান):</label>
              <input
                type="text"
                value={signedByTenant}
                onChange={e => setSignedByTenant(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">স্বাক্ষরকারী (দ্বিতীয় পক্ষ / ক্লায়েন্ট):</label>
              <input
                type="text"
                value={signedByParty}
                onChange={e => setSignedByParty(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-sm transition flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              চুক্তিপত্র সেভ করুন
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
