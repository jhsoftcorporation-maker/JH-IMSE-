import React, { useState } from 'react';
import { 
  Plus, Search, Filter, Calendar, FileText, CheckCircle2, 
  AlertCircle, Printer, Eye, Trash2, ArrowRightLeft, BookOpen, Clock
} from 'lucide-react';
import { JournalEntry, JournalEntryLine, ChartOfAccount } from '../../types';

interface GeneralJournalViewProps {
  journalEntries: JournalEntry[];
  chartOfAccounts: ChartOfAccount[];
  currency: string;
  onAddJournalEntry: (entry: JournalEntry) => void;
}

export const GeneralJournalView: React.FC<GeneralJournalViewProps> = ({
  journalEntries,
  chartOfAccounts,
  currency,
  onAddJournalEntry,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New JV form state
  const [entryDate, setEntryDate] = useState(new Date().toISOString().slice(0, 10));
  const [referenceType, setReferenceType] = useState<JournalEntry['referenceType']>('manual_jv');
  const [description, setDescription] = useState('');
  const [referenceId, setReferenceId] = useState('');
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<{
    id: string;
    accountId: string;
    description: string;
    debit: number;
    credit: number;
  }[]>([
    { id: '1', accountId: chartOfAccounts[0]?.id || '', description: '', debit: 0, credit: 0 },
    { id: '2', accountId: chartOfAccounts[1]?.id || '', description: '', debit: 0, credit: 0 },
  ]);

  // Calculations for current modal
  const totalDebit = lines.reduce((sum, l) => sum + (Number(l.debit) || 0), 0);
  const totalCredit = lines.reduce((sum, l) => sum + (Number(l.credit) || 0), 0);
  const difference = Math.abs(totalDebit - totalCredit);
  const isBalanced = totalDebit > 0 && Math.abs(totalDebit - totalCredit) < 0.01;

  const handleAddLine = () => {
    setLines(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        accountId: chartOfAccounts[0]?.id || '',
        description: '',
        debit: 0,
        credit: 0,
      },
    ]);
  };

  const handleRemoveLine = (idx: number) => {
    if (lines.length <= 2) return;
    setLines(prev => prev.filter((_, i) => i !== idx));
  };

  const handleLineChange = (idx: number, field: string, value: any) => {
    setLines(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };

  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBalanced) return;
    if (!description.trim()) return;

    const formattedLines: JournalEntryLine[] = lines.map(line => {
      const acc = chartOfAccounts.find(a => a.id === line.accountId);
      return {
        id: 'jl-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        accountId: line.accountId,
        accountCode: acc?.code || '1000',
        accountName: acc?.name || 'হিসাব',
        description: line.description || description,
        debit: Number(line.debit) || 0,
        credit: Number(line.credit) || 0,
      };
    });

    const newEntry: JournalEntry = {
      id: 'jv-' + Date.now(),
      tenantId: 'tenant-1',
      entryNumber: `JV-${new Date().getFullYear()}-${String(journalEntries.length + 1).padStart(3, '0')}`,
      date: entryDate,
      description,
      referenceType,
      referenceId: referenceId.trim() || undefined,
      lines: formattedLines,
      totalDebit,
      totalCredit,
      status: 'posted',
      createdBy: 'হিসাবরক্ষক (Accountant)',
      createdAt: new Date().toISOString(),
      notes: notes.trim() || undefined,
    };

    onAddJournalEntry(newEntry);
    setIsCreateModalOpen(false);
    // Reset form
    setDescription('');
    setReferenceId('');
    setNotes('');
    setLines([
      { id: '1', accountId: chartOfAccounts[0]?.id || '', description: '', debit: 0, credit: 0 },
      { id: '2', accountId: chartOfAccounts[1]?.id || '', description: '', debit: 0, credit: 0 },
    ]);
  };

  // Filtered entries
  const filteredEntries = journalEntries.filter(entry => {
    const matchType = filterType === 'all' || entry.referenceType === filterType;
    const matchSearch = searchTerm === '' || 
      entry.entryNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (entry.referenceId && entry.referenceId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      entry.lines.some(l => l.accountName.toLowerCase().includes(searchTerm.toLowerCase()) || l.accountCode.includes(searchTerm));
    return matchType && matchSearch;
  });

  const getReferenceLabel = (type: JournalEntry['referenceType']) => {
    switch (type) {
      case 'opening_balance': return 'প্রারম্ভিক জের';
      case 'sale': return 'বিক্রয় সমন্বয়';
      case 'purchase': return 'ক্রয় চালান';
      case 'supplier_payment': return 'মহাজন দেনা পরিশোধ';
      case 'due_collection': return 'বকেয়া আদায়';
      case 'expense': return 'পরিচালন ব্যয়';
      case 'payroll': return 'বেতন ও কমিশন';
      case 'bank_transfer': return 'ব্যাংক স্থানান্তর';
      default: return 'ম্যানুয়াল জাবেদা';
    }
  };

  return (
    <div className="space-y-4">
      {/* Action Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            সাধারণ জাবেদা বহি (General Journal & Vouchers)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            দ্বি-তরফা দাখিলা পদ্ধতি (Debit = Credit) অনুযায়ী স্বয়ংক্রিয় ও ম্যানুয়াল জাবেদা ভাউচার
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" /> + নতুন জাবেদা ভাউচার (JV)
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-8 relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="ভাউচার নং (JV), বিবরণ বা হিসাব কোড দিয়ে খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition"
          />
        </div>

        <div className="sm:col-span-4">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full px-3 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-600 cursor-pointer"
          >
            <option value="all">সকল রেফারেন্স টাইপ</option>
            <option value="manual_jv">ম্যানুয়াল জাবেদা (Manual JV)</option>
            <option value="sale">বিক্রয় সমন্বয় (Sales)</option>
            <option value="purchase">ক্রয় চালান (Purchases)</option>
            <option value="supplier_payment">মহাজন পরিশোধ (Payments)</option>
            <option value="due_collection">বকেয়া আদায় (Collections)</option>
            <option value="expense">খরচ ভাউচার (Expenses)</option>
            <option value="opening_balance">প্রারম্ভিক জের (Opening)</option>
          </select>
        </div>
      </div>

      {/* Entries Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
              <tr>
                <th className="py-3 px-3.5">তারিখ ও JV নং</th>
                <th className="py-3 px-3.5">রেফারেন্স / খাত</th>
                <th className="py-3 px-3.5">হিসাবের নাম ও বিবরণ</th>
                <th className="py-3 px-3.5 text-right">ডেবিট ({currency})</th>
                <th className="py-3 px-3.5 text-right">ক্রেডিট ({currency})</th>
                <th className="py-3 px-3.5 text-center">স্ট্যাটাস</th>
                <th className="py-3 px-3.5 text-center">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    কোনো জাবেদা ভাউচার পাওয়া যায়নি
                  </td>
                </tr>
              ) : (
                filteredEntries.map(entry => (
                  <tr key={entry.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-3.5 align-top">
                      <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md inline-block">
                        {entry.entryNumber}
                      </span>
                      <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {entry.date}
                      </div>
                    </td>

                    <td className="py-3 px-3.5 align-top">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 inline-block">
                        {getReferenceLabel(entry.referenceType)}
                      </span>
                      {entry.referenceId && (
                        <div className="font-mono text-[10px] text-slate-500 mt-1">
                          Ref: {entry.referenceId}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-3.5">
                      <div className="font-bold text-slate-900 mb-1">
                        {entry.description}
                      </div>
                      <div className="space-y-1 bg-slate-50/60 p-2 rounded-lg border border-slate-100 text-[11px]">
                        {entry.lines.map(line => (
                          <div key={line.id} className="flex justify-between items-center text-slate-600">
                            <span>
                              <span className="font-mono text-slate-400 mr-1.5">{line.accountCode}</span>
                              <span className={line.credit > 0 ? 'pl-3 text-slate-500' : 'font-semibold text-slate-800'}>
                                {line.accountName}
                              </span>
                            </span>
                            <span className="font-mono">
                              {line.debit > 0 ? (
                                <span className="text-emerald-700 font-medium">Dr. {currency}{line.debit.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                              ) : (
                                <span className="text-blue-700 font-medium">Cr. {currency}{line.credit.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>

                    <td className="py-3 px-3.5 align-top text-right font-mono font-bold text-slate-800">
                      {currency}{entry.totalDebit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>

                    <td className="py-3 px-3.5 align-top text-right font-mono font-bold text-slate-800">
                      {currency}{entry.totalCredit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>

                    <td className="py-3 px-3.5 align-top text-center">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> পোস্টেড
                      </span>
                    </td>

                    <td className="py-3 px-3.5 align-top text-center">
                      <button
                        onClick={() => setSelectedEntry(entry)}
                        className="p-1.5 text-indigo-700 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                        title="ভাউচার ভিউ ও প্রিন্ট"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Journal Entry Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  নতুন জাবেদা ভাউচার তৈরি (New Journal Voucher)
                </h3>
                <p className="text-xs text-slate-500">
                  ডেবিট ও ক্রেডিট উভয় পাশের অংক সমান হওয়া বাধ্যতামূলক (Debit = Credit)
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEntry} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">তারিখ *</label>
                  <input
                    type="date"
                    required
                    value={entryDate}
                    onChange={(e) => setEntryDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-indigo-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">রেফারেন্স টাইপ</label>
                  <select
                    value={referenceType}
                    onChange={(e) => setReferenceType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-indigo-600 focus:outline-hidden cursor-pointer"
                  >
                    <option value="manual_jv">ম্যানুয়াল জাবেদা (Manual JV)</option>
                    <option value="sale">বিক্রয় রাজস্ব (Sale Entry)</option>
                    <option value="purchase">পণ্য ক্রয় (Purchase Bill)</option>
                    <option value="supplier_payment">মহাজনকে পেমেন্ট (Supplier Payment)</option>
                    <option value="due_collection">বকেয়া আদায় (Due Collection)</option>
                    <option value="expense">অফিস/দোকান খরচ (Expense)</option>
                    <option value="payroll">বেতন ও মজুরি (Payroll)</option>
                    <option value="bank_transfer">ব্যাংক ট্রান্সফার (Bank Transfer)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">রেফারেন্স নং / ইনভয়েস</label>
                  <input
                    type="text"
                    placeholder="e.g. INV-102 বা CHQ-8891"
                    value={referenceId}
                    onChange={(e) => setReferenceId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-indigo-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">জাবেদার সংক্ষিপ্ত বিবরণ *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. সিটি ব্যাংক থেকে নগদ ক্যাশ উত্তোলন অথবা বিবিধ খরচ সমন্বয়"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-indigo-600 focus:outline-hidden"
                />
              </div>

              {/* Dynamic Lines */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">জাবেদার দাখিলা লাইনসমূহ (Journal Lines)</label>
                  <button
                    type="button"
                    onClick={handleAddLine}
                    className="text-xs font-bold text-indigo-700 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> + লাইন যুক্ত করুন
                  </button>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto p-1">
                  {lines.map((line, idx) => (
                    <div key={line.id} className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <div className="col-span-4">
                        <select
                          value={line.accountId}
                          onChange={(e) => handleLineChange(idx, 'accountId', e.target.value)}
                          className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden"
                        >
                          {chartOfAccounts.map(acc => (
                            <option key={acc.id} value={acc.id}>
                              {acc.code} - {acc.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-span-3">
                        <input
                          type="text"
                          placeholder="লাইনের বিবরণ..."
                          value={line.description}
                          onChange={(e) => handleLineChange(idx, 'description', e.target.value)}
                          className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden"
                        />
                      </div>

                      <div className="col-span-2">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="Debit"
                          value={line.debit || ''}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            handleLineChange(idx, 'debit', val);
                            if (val > 0) handleLineChange(idx, 'credit', 0);
                          }}
                          className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-right font-mono focus:border-indigo-600 focus:outline-hidden"
                        />
                      </div>

                      <div className="col-span-2">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="Credit"
                          value={line.credit || ''}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            handleLineChange(idx, 'credit', val);
                            if (val > 0) handleLineChange(idx, 'debit', 0);
                          }}
                          className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-right font-mono focus:border-indigo-600 focus:outline-hidden"
                        />
                      </div>

                      <div className="col-span-1 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveLine(idx)}
                          disabled={lines.length <= 2}
                          className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-30 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Debit Credit Summary & Balance Warning */}
              <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-slate-500 mr-2">মোট ডেবিট:</span>
                  <span className="font-bold text-emerald-700 text-sm">{currency}{totalDebit.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-slate-500 mr-2">মোট ক্রেডিট:</span>
                  <span className="font-bold text-blue-700 text-sm">{currency}{totalCredit.toFixed(2)}</span>
                </div>
                <div>
                  {isBalanced ? (
                    <span className="flex items-center gap-1 text-emerald-700 font-bold bg-emerald-100/70 px-2.5 py-1 rounded-full text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5" /> হিসাব মিলেছে (Balanced)
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-rose-700 font-bold bg-rose-100/70 px-2.5 py-1 rounded-full text-xs">
                      <AlertCircle className="w-3.5 h-3.5" /> ব্যবধান: {currency}{difference.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">অতিরিক্ত নোট / অডিট মন্তব্য</label>
                <input
                  type="text"
                  placeholder="e.g. অ্যাকাউন্ট্যান্ট ও স্টোর ম্যানেজারের যৌথ অনুমোদনক্রমে"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-indigo-600 focus:outline-hidden"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={!isBalanced || !description.trim()}
                  className="px-5 py-2.5 bg-indigo-700 hover:bg-indigo-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" /> জাবেদা পোস্ট ও সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View & Print Single Voucher Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h3 className="font-extrabold text-slate-900">জাবেদা ভাউচার (Journal Voucher)</h3>
              </div>
              <button
                onClick={() => setSelectedEntry(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs mb-4">
              <div className="flex justify-between">
                <span className="text-slate-500">ভাউচার নম্বর:</span>
                <span className="font-mono font-bold text-indigo-700">{selectedEntry.entryNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">তারিখ:</span>
                <span className="font-bold text-slate-800">{selectedEntry.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">রেফারেন্স খাত:</span>
                <span className="font-bold text-slate-800">{getReferenceLabel(selectedEntry.referenceType)}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-1">বিবরণ:</span>
                <p className="p-2 bg-white rounded-lg border border-slate-200 font-medium text-slate-800">
                  {selectedEntry.description}
                </p>
              </div>
            </div>

            {/* Lines */}
            <div className="border border-slate-200 rounded-xl overflow-hidden mb-4 text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">হিসাব</th>
                    <th className="p-2.5 text-right">ডেবিট ({currency})</th>
                    <th className="p-2.5 text-right">ক্রেডিট ({currency})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedEntry.lines.map(line => (
                    <tr key={line.id}>
                      <td className="p-2.5">
                        <span className="font-mono text-slate-400 mr-1">{line.accountCode}</span>
                        <span className="font-medium text-slate-800">{line.accountName}</span>
                      </td>
                      <td className="p-2.5 text-right font-mono text-emerald-700 font-bold">
                        {line.debit > 0 ? line.debit.toFixed(2) : '-'}
                      </td>
                      <td className="p-2.5 text-right font-mono text-blue-700 font-bold">
                        {line.credit > 0 ? line.credit.toFixed(2) : '-'}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 font-bold text-slate-900 border-t border-slate-200">
                    <td className="p-2.5">মোট (Total):</td>
                    <td className="p-2.5 text-right font-mono text-emerald-700 font-black">
                      {currency}{selectedEntry.totalDebit.toFixed(2)}
                    </td>
                    <td className="p-2.5 text-right font-mono text-blue-700 font-black">
                      {currency}{selectedEntry.totalCredit.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-400">
                পোস্টেড বাই: {selectedEntry.createdBy}
              </span>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Printer className="w-4 h-4" /> ভাউচার প্রিন্ট করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
