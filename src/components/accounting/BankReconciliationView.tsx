import React, { useState } from 'react';
import { 
  Building2, CheckCircle2, Clock, AlertCircle, Plus, 
  ArrowRightLeft, FileCheck, RefreshCw, Printer
} from 'lucide-react';
import { BankReconciliationItem, ChartOfAccount } from '../../types';

interface BankReconciliationViewProps {
  reconciliationItems: BankReconciliationItem[];
  bankAccounts: ChartOfAccount[];
  currency: string;
  onUpdateItemStatus: (itemId: string, status: BankReconciliationItem['status']) => void;
  onAddItem: (item: BankReconciliationItem) => void;
}

export const BankReconciliationView: React.FC<BankReconciliationViewProps> = ({
  reconciliationItems,
  bankAccounts,
  currency,
  onUpdateItemStatus,
  onAddItem,
}) => {
  const [selectedAccountId, setSelectedAccountId] = useState<string>(bankAccounts[0]?.id || 'coa-1020');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Item State
  const [itemDate, setItemDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState('');
  const [referenceNo, setReferenceNo] = useState('');
  const [bookAmount, setBookAmount] = useState<number>(0);
  const [bankAmount, setBankAmount] = useState<number>(0);
  const [itemType, setItemType] = useState<BankReconciliationItem['type']>('matched');
  const [notes, setNotes] = useState('');

  const currentAccount = bankAccounts.find(a => a.id === selectedAccountId) || bankAccounts[0];
  const itemsForAccount = reconciliationItems.filter(i => i.bankAccountId === selectedAccountId);

  // Calculations
  const ledgerBalance = currentAccount?.balance || 285400;

  // Deposits in transit (in book, not yet cleared by bank)
  const depositsInTransit = itemsForAccount
    .filter(i => i.type === 'deposit_in_transit' && i.status === 'pending')
    .reduce((s, i) => s + i.bookAmount, 0);

  // Outstanding cheques (issued in book, not yet presented to bank)
  const outstandingCheques = itemsForAccount
    .filter(i => i.type === 'outstanding_cheque' && i.status === 'pending')
    .reduce((s, i) => s + i.bookAmount, 0);

  // Bank fees not yet in books
  const bankFees = itemsForAccount
    .filter(i => i.type === 'bank_fee' && i.status === 'discrepancy')
    .reduce((s, i) => s + i.bankAmount, 0);

  // Computed Bank Statement Balance = Ledger + Outstanding Cheques - Deposits in Transit - Bank Fees
  const statementBalance = ledgerBalance + outstandingCheques - depositsInTransit - bankFees;

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    const newItem: BankReconciliationItem = {
      id: 'rec-' + Date.now(),
      tenantId: 'tenant-1',
      bankAccountId: selectedAccountId,
      bankAccountName: currentAccount?.name || 'ব্যাংক হিসাব',
      date: itemDate,
      description,
      referenceNo: referenceNo.trim() || 'REF-' + Math.floor(Math.random() * 9000 + 1000),
      bookAmount: Number(bookAmount) || 0,
      bankAmount: Number(bankAmount) || 0,
      type: itemType,
      status: itemType === 'matched' ? 'reconciled' : itemType === 'bank_fee' ? 'discrepancy' : 'pending',
      reconciledDate: itemType === 'matched' ? itemDate : undefined,
      notes: notes.trim() || undefined,
    };

    onAddItem(newItem);
    setIsAddModalOpen(false);
    setDescription('');
    setReferenceNo('');
    setBookAmount(0);
    setBankAmount(0);
    setNotes('');
  };

  return (
    <div className="space-y-4">
      {/* Header and Bank Selector */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-indigo-700" />
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              ব্যাংক সমন্বয় বিবরণী (Bank Reconciliation Statement)
            </h3>
            <p className="text-xs text-slate-500">
              সফটওয়্যার লেজার ও ব্যাংক স্টেটমেন্টের মধ্যে চেক ও ট্রানজেকশন মেলানো
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedAccountId}
            onChange={(e) => setSelectedAccountId(e.target.value)}
            className="px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden cursor-pointer text-slate-800"
          >
            {bankAccounts.map(acc => (
              <option key={acc.id} value={acc.id}>
                {acc.name} ({acc.code})
              </option>
            ))}
          </select>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> + ব্যাংক এন্ট্রি
          </button>
        </div>
      </div>

      {/* Reconciliation Math Summary Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {/* Ledger Balance */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            ১. লেজার ব্যালেন্স (Balance per Books)
          </span>
          <div className="font-mono font-black text-slate-900 text-lg mt-1">
            {currency}{ledgerBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            সফটওয়্যারের অভ্যন্তরীণ হিসাব খাতা
          </span>
        </div>

        {/* Deposits in Transit */}
        <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-2xs bg-emerald-50/20">
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
            (+) জমা যা ব্যাংক ক্রেডিট করেনি (In-Transit)
          </span>
          <div className="font-mono font-black text-emerald-700 text-lg mt-1">
            +{currency}{depositsInTransit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-emerald-600 mt-0.5 block">
            ক্লিয়ারিং হাউজে জমা অপেক্ষমাণ
          </span>
        </div>

        {/* Outstanding Cheques */}
        <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-2xs bg-rose-50/20">
          <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block">
            (-) ব্যাংকে উপস্থাপনহীন চেক (Outstanding)
          </span>
          <div className="font-mono font-black text-rose-700 text-lg mt-1">
            -{currency}{outstandingCheques.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-rose-600 mt-0.5 block">
            মহাজন কর্তৃক এখনো না ভাঙানো চেক
          </span>
        </div>

        {/* Statement Balance */}
        <div className="bg-indigo-900 text-white p-4 rounded-2xl shadow-2xs">
          <span className="text-[10px] font-bold opacity-80 uppercase tracking-wider block">
            (=) সমন্বিত ব্যাংক স্টেটমেন্ট ব্যালেন্স
          </span>
          <div className="font-mono font-black text-xl mt-1 text-teal-300">
            {currency}{statementBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] opacity-90 mt-0.5 block">
            ব্যাংক স্টেটমেন্টের সাথে মেলানো ব্যালেন্স
          </span>
        </div>
      </div>

      {/* Discrepancy Alert if any */}
      {bankFees > 0 && (
        <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>
              <strong>সতর্কতা:</strong> ব্যাংকে {currency}{bankFees.toFixed(2)} টাকার এসএমএস/সার্ভিস চার্জ কাটা হয়েছে যা এখনো সাধারণ জাবেদায় এন্ট্রি হয়নি।
            </span>
          </div>
          <span className="font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-lg">
            জাবেদা ভাউচার প্রয়োজন
          </span>
        </div>
      )}

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
              <tr>
                <th className="py-3 px-3.5">তারিখ</th>
                <th className="py-3 px-3.5">রেফারেন্স নং</th>
                <th className="py-3 px-3.5">লেনদেনের বিবরণ</th>
                <th className="py-3 px-3.5 text-right">লেজার এন্ট্রি ({currency})</th>
                <th className="py-3 px-3.5 text-right">ব্যাংক স্টেটমেন্ট ({currency})</th>
                <th className="py-3 px-3.5 text-center">লেনদেনের টাইপ</th>
                <th className="py-3 px-3.5 text-center">স্ট্যাটাস ও অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {itemsForAccount.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-3.5 font-mono text-slate-600">
                    {item.date}
                  </td>

                  <td className="py-3 px-3.5 font-mono font-bold text-indigo-700">
                    {item.referenceNo}
                  </td>

                  <td className="py-3 px-3.5">
                    <div className="font-bold text-slate-900">{item.description}</div>
                    {item.notes && <div className="text-[11px] text-slate-500">{item.notes}</div>}
                  </td>

                  <td className="py-3 px-3.5 text-right font-mono font-bold text-slate-800">
                    {item.bookAmount > 0 ? `${currency}${item.bookAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '-'}
                  </td>

                  <td className="py-3 px-3.5 text-right font-mono font-bold text-slate-800">
                    {item.bankAmount > 0 ? `${currency}${item.bankAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '-'}
                  </td>

                  <td className="py-3 px-3.5 text-center">
                    {item.type === 'matched' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        ম্যাচড (Matched)
                      </span>
                    )}
                    {item.type === 'deposit_in_transit' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                        ইন-ট্রানজিট চেক
                      </span>
                    )}
                    {item.type === 'outstanding_cheque' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        অপেশকৃত চেক
                      </span>
                    )}
                    {item.type === 'bank_fee' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                        ব্যাংক ফি / চার্জ
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-3.5 text-center">
                    {item.status === 'reconciled' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> সমন্বিত ✓
                      </span>
                    ) : item.status === 'pending' ? (
                      <button
                        onClick={() => onUpdateItemStatus(item.id, 'reconciled')}
                        className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[10px] font-bold transition cursor-pointer border border-indigo-200"
                      >
                        রিকনসাইল করুন
                      </button>
                    ) : (
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-100/70 px-2 py-0.5 rounded-full">
                        অননুমোদিত চার্জ ⚠️
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Item Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-black text-slate-900 text-base">
                ব্যাংক ট্রানজেকশন সমন্বয় এন্ট্রি
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">তারিখ *</label>
                <input
                  type="date"
                  required
                  value={itemDate}
                  onChange={(e) => setItemDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-indigo-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">লেনদেনের ধরন *</label>
                <select
                  value={itemType}
                  onChange={(e) => setItemType(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-indigo-600 focus:outline-hidden cursor-pointer"
                >
                  <option value="matched">ম্যাচড ট্রানজেকশন (Matched Entry)</option>
                  <option value="deposit_in_transit">জমাকৃত কিন্তু ক্লিয়ার না হওয়া চেক (Deposit in Transit)</option>
                  <option value="outstanding_cheque">ব্যাংকে উপস্থাপন না করা চেক (Outstanding Cheque)</option>
                  <option value="bank_fee">ব্যাংক ফি ও চার্জ (Bank Charges)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">বিবরণ *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ডাচ বাংলা চেক বা সার্ভিস চার্জ"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-indigo-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">চেক / রেফারেন্স নং</label>
                <input
                  type="text"
                  placeholder="e.g. CHQ-449012"
                  value={referenceNo}
                  onChange={(e) => setReferenceNo(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-indigo-600 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">লেজার অ্যামাউন্ট ({currency})</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={bookAmount || ''}
                    onChange={(e) => setBookAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono text-right focus:border-indigo-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">ব্যাংক অ্যামাউন্ট ({currency})</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={bankAmount || ''}
                    onChange={(e) => setBankAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono text-right focus:border-indigo-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">অতিরিক্ত নোট</label>
                <input
                  type="text"
                  placeholder="মন্তব্য..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-indigo-600 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={!description.trim()}
                  className="px-5 py-2 bg-indigo-700 hover:bg-indigo-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" /> সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
