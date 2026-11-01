import React, { useState } from 'react';
import { 
  WarrantyRecord, WarrantyClaim, Tenant, 
  Sale, WarrantyType, WarrantyClaimStatus 
} from '../../types';
import { 
  X, ShieldCheck, Search, AlertCircle, CheckCircle2, 
  Clock, Plus, Printer, RefreshCw, Send, ShieldAlert
} from 'lucide-react';

interface WarrantyLookupAndClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: Tenant;
  warrantyRecords: WarrantyRecord[];
  sales: Sale[];
  claims: WarrantyClaim[];
  onSaveClaim: (claim: Omit<WarrantyClaim, 'id' | 'createdAt'>) => void;
  onUpdateClaimStatus: (claimId: string, status: WarrantyClaimStatus, notes?: string) => void;
}

export const WarrantyLookupAndClaimModal: React.FC<WarrantyLookupAndClaimModalProps> = ({
  isOpen,
  onClose,
  tenant,
  warrantyRecords,
  sales,
  claims,
  onSaveClaim,
  onUpdateClaimStatus,
}) => {
  if (!isOpen) return null;

  const [searchQuery, setSearchQuery] = useState('');
  const [matchedRecord, setMatchedRecord] = useState<WarrantyRecord | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // New Claim Form
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [defectDescription, setDefectDescription] = useState('');
  const [vendorName, setVendorName] = useState('Brand Authorized Service Center');
  const [vendorRmaNo, setVendorRmaNo] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    if (!query) return;

    setHasSearched(true);
    const found = warrantyRecords.find(w => 
      w.imeiOrSerial.toLowerCase().includes(query) ||
      w.invoiceNumber.toLowerCase().includes(query) ||
      w.customerPhone.toLowerCase().includes(query)
    );

    setMatchedRecord(found || null);
  };

  const getRemainingDays = (expiryDate: string) => {
    const diff = new Date(expiryDate).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const handleCreateClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matchedRecord) return;
    if (!defectDescription.trim()) {
      alert('ত্রুটি বা সমস্যার বিবরণ প্রদান করুন!');
      return;
    }

    const claimNumber = `WAR-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    onSaveClaim({
      claimNumber,
      tenantId: tenant.id,
      warrantyId: matchedRecord.id,
      imeiOrSerial: matchedRecord.imeiOrSerial,
      productName: matchedRecord.productName,
      brand: matchedRecord.brand,
      customerName: matchedRecord.customerName,
      customerPhone: matchedRecord.customerPhone,
      claimDate: new Date().toISOString().slice(0, 10),
      defectDescription,
      claimStatus: 'accepted_in_warranty',
      vendorName: vendorName || undefined,
      vendorRmaNo: vendorRmaNo || undefined,
      technicianNotes: 'প্রাথমিক ওয়ারেন্টি টেস্টে ভ্যালিড ত্রুটি শনাক্ত হয়েছে। ক্লেইম অনুমোদন করা হলো।',
    });

    setShowClaimForm(false);
    setDefectDescription('');
    alert(`ওয়ারেন্টি ক্লেইম ${claimNumber} সফলভাবে গ্রহণ করা হয়েছে!`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-blue-100 overflow-hidden my-6 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-950 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-xs">
              <ShieldCheck className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <h3 className="font-bold text-sm">ওয়ারেন্টি ও গ্যারান্টি ট্র্যাকার (Warranty Hub)</h3>
              <p className="text-xs text-blue-200">IMEI বা সিরিয়াল নম্বর দিয়ে লাইভ ভ্যালিডিটি যাচাই ও ক্লেইম সাবমিশন</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-blue-200 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
          {/* Search Box */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="ডিভাইসের IMEI, সিরিয়াল নম্বর (e.g. OMR-2025-HEM8891) বা মোবাইল নম্বর লিখুন..."
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-2xl font-bold transition cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              যাচাই করুন
            </button>
          </form>

          {/* Search Results */}
          {hasSearched && (
            <div>
              {matchedRecord ? (
                (() => {
                  const remainingDays = getRemainingDays(matchedRecord.warrantyExpiryDate);
                  const isExpired = remainingDays <= 0;
                  return (
                    <div className="p-5 bg-gradient-to-br from-blue-50/70 to-indigo-50/50 rounded-2xl border border-blue-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-slate-900">{matchedRecord.productName}</h4>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 uppercase">
                              {matchedRecord.brand}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 font-mono mt-0.5">
                            SN/IMEI: <strong className="text-blue-900">{matchedRecord.imeiOrSerial}</strong> • চালান: {matchedRecord.invoiceNumber}
                          </p>
                        </div>

                        <div>
                          {!isExpired ? (
                            <div className="text-right">
                              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                ওয়ারেন্টি বৈধ ({remainingDays} দিন বাকি)
                              </span>
                              <span className="text-[10px] text-slate-500 block mt-0.5">মেয়াদ শেষ: {matchedRecord.warrantyExpiryDate}</span>
                            </div>
                          ) : (
                            <div className="text-right">
                              <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5" />
                                ওয়ারেন্টির মেয়াদোত্তীর্ণ
                              </span>
                              <span className="text-[10px] text-rose-600 block mt-0.5">মেয়াদ উত্তীর্ণ হয়েছে: {matchedRecord.warrantyExpiryDate}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Detail Metrics */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-blue-100 text-[11px]">
                        <div>
                          <span className="text-slate-500 block">গ্রাহকের নাম:</span>
                          <strong className="text-slate-800">{matchedRecord.customerName}</strong>
                        </div>
                        <div>
                          <span className="text-slate-500 block">মোবাইল নম্বর:</span>
                          <span className="font-mono text-slate-800">{matchedRecord.customerPhone}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">ক্রয় তারিখ:</span>
                          <span className="font-mono">{matchedRecord.purchaseDate}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">ওয়ারেন্টির ধরন:</span>
                          <span className="font-bold text-purple-900 capitalize">{matchedRecord.warrantyType.replace(/_/g, ' ')}</span>
                        </div>
                      </div>

                      {/* Claim Action */}
                      <div className="pt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={() => setShowClaimForm(!showClaimForm)}
                          className="px-4 py-2 bg-blue-800 hover:bg-blue-900 text-white rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          {showClaimForm ? 'ফর্ম বন্ধ করুন' : 'নতুন ওয়ারেন্টি ক্লেইম আবেদন'}
                        </button>
                      </div>

                      {/* Inline Claim Form */}
                      {showClaimForm && (
                        <form onSubmit={handleCreateClaim} className="p-4 bg-white rounded-xl border border-blue-200 space-y-3 mt-3 animate-in fade-in">
                          <span className="font-bold text-slate-800 block text-xs">
                            📝 ওয়ারেন্টি ক্লেইম তথ্য পূরণ করুন:
                          </span>

                          <div>
                            <label className="text-slate-600 block mb-1 font-semibold">ত্রুটি বা সমস্যার বিবরণ: *</label>
                            <textarea
                              required
                              rows={2}
                              placeholder="ডিভাইসে কি ত্রুটি দেখা দিয়েছে বিস্তারিত লিখুন..."
                              value={defectDescription}
                              onChange={e => setDefectDescription(e.target.value)}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl leading-relaxed text-xs"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="text-slate-600 block mb-1 font-semibold">ভেন্ডর / সার্ভিস সেন্টার:</label>
                              <input
                                type="text"
                                value={vendorName}
                                onChange={e => setVendorName(e.target.value)}
                                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                              />
                            </div>

                            <div>
                              <label className="text-slate-600 block mb-1 font-semibold">ভেন্ডর RMA ট্র্যাকিং নং:</label>
                              <input
                                type="text"
                                placeholder="যেমন: RMA-BD-99120"
                                value={vendorRmaNo}
                                onChange={e => setVendorRmaNo(e.target.value)}
                                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                              />
                            </div>
                          </div>

                          <div className="flex justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setShowClaimForm(false)}
                              className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-xs"
                            >
                              বাতিল
                            </button>
                            <button
                              type="submit"
                              className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              ক্লেইম সাবমিট করুন
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  );
                })()
              ) : (
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center text-slate-500">
                  <ShieldAlert className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                  <p className="font-semibold text-slate-700">কোনো ওয়ারেন্টি রেকর্ড পাওয়া যায়নি</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">সিরিয়াল নম্বর বা IMEI চেক করে পুনরায় চেষ্টা করুন</p>
                </div>
              )}
            </div>
          )}

          {/* Existing Claims Table */}
          <div className="pt-3 space-y-2">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-700" />
              সম্প্রতি দাখিলকৃত ওয়ারেন্টি ক্লেইমসমূহ ({claims.length})
            </h4>

            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">ক্লেইম নং</th>
                    <th className="py-2.5 px-3">পণ্য ও IMEI</th>
                    <th className="py-2.5 px-3">গ্রাহক</th>
                    <th className="py-2.5 px-3">ত্রুটির সারসংক্ষেপ</th>
                    <th className="py-2.5 px-3 text-center">স্ট্যাটাস</th>
                    <th className="py-2.5 px-3 text-center">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {claims.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-400">
                        কোনো ওয়ারেন্টি ক্লেইম দাখিল করা হয়নি
                      </td>
                    </tr>
                  ) : (
                    claims.map(clm => (
                      <tr key={clm.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-mono font-bold text-blue-900">
                          {clm.claimNumber}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-slate-800">{clm.productName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{clm.imeiOrSerial}</div>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-medium text-slate-800">{clm.customerName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{clm.customerPhone}</div>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 max-w-xs truncate">
                          {clm.defectDescription}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            clm.claimStatus === 'repaired_free' || clm.claimStatus === 'replaced_new'
                              ? 'bg-emerald-100 text-emerald-800'
                              : clm.claimStatus === 'rejected_void'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {clm.claimStatus.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <select
                            value={clm.claimStatus}
                            onChange={e => onUpdateClaimStatus(clm.id, e.target.value as WarrantyClaimStatus)}
                            className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700"
                          >
                            <option value="verifying">যাচাই চলছে (Verifying)</option>
                            <option value="accepted_in_warranty">গৃহীত (Accepted)</option>
                            <option value="sent_to_vendor">ভেন্ডরে প্রেরিত (RMA)</option>
                            <option value="repaired_free">ফ্রি মেরামত (Repaired)</option>
                            <option value="replaced_new">নতুন রিপ্লেস (Replaced)</option>
                            <option value="rejected_void">বাতিল (Rejected Void)</option>
                            <option value="closed">ক্লোজড (Closed)</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
