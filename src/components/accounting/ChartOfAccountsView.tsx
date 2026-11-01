import React, { useState } from 'react';
import { 
  FolderTree, Plus, Search, Filter, ShieldCheck, 
  Layers, ArrowUpRight, ArrowDownRight, CheckCircle2, Lock, FileSpreadsheet
} from 'lucide-react';
import { ChartOfAccount, AccountCategory, AccountClassification } from '../../types';

interface ChartOfAccountsViewProps {
  chartOfAccounts: ChartOfAccount[];
  currency: string;
  onAddAccount: (account: ChartOfAccount) => void;
}

export const ChartOfAccountsView: React.FC<ChartOfAccountsViewProps> = ({
  chartOfAccounts,
  currency,
  onAddAccount,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<AccountCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [accountCode, setAccountCode] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNameBn, setAccountNameBn] = useState('');
  const [category, setCategory] = useState<AccountCategory>('asset');
  const [classification, setClassification] = useState<AccountClassification>('current_asset');
  const [normalBalance, setNormalBalance] = useState<'debit' | 'credit'>('debit');
  const [openingBalance, setOpeningBalance] = useState<number>(0);
  const [description, setDescription] = useState('');

  // Category change helper to adjust defaults
  const handleCategoryChange = (newCat: AccountCategory) => {
    setCategory(newCat);
    if (newCat === 'asset') {
      setClassification('current_asset');
      setNormalBalance('debit');
      setAccountCode('1090');
    } else if (newCat === 'liability') {
      setClassification('current_liability');
      setNormalBalance('credit');
      setAccountCode('2090');
    } else if (newCat === 'equity') {
      setClassification('equity');
      setNormalBalance('credit');
      setAccountCode('3090');
    } else if (newCat === 'revenue') {
      setClassification('operating_revenue');
      setNormalBalance('credit');
      setAccountCode('4090');
    } else if (newCat === 'expense') {
      setClassification('operating_expense');
      setNormalBalance('debit');
      setAccountCode('6090');
    }
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountCode.trim() || !accountName.trim()) return;

    const newAcc: ChartOfAccount = {
      id: 'coa-' + accountCode.trim(),
      tenantId: 'tenant-1',
      code: accountCode.trim(),
      name: accountName.trim(),
      nameBn: accountNameBn.trim() || accountName.trim(),
      category,
      classification,
      balance: openingBalance || 0,
      normalBalance,
      isSystem: false,
      description: description.trim() || undefined,
    };

    onAddAccount(newAcc);
    setIsAddModalOpen(false);
    // Reset form
    setAccountCode('');
    setAccountName('');
    setAccountNameBn('');
    setOpeningBalance(0);
    setDescription('');
  };

  // Filtered
  const filteredAccounts = chartOfAccounts.filter(acc => {
    const matchCat = selectedCategory === 'all' || acc.category === selectedCategory;
    const matchSearch = searchQuery === '' ||
      acc.code.includes(searchQuery) ||
      acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.nameBn.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  // Category Summaries
  const totalAssets = chartOfAccounts.filter(a => a.category === 'asset').reduce((s, a) => s + a.balance, 0);
  const totalLiabilities = chartOfAccounts.filter(a => a.category === 'liability').reduce((s, a) => s + a.balance, 0);
  const totalEquity = chartOfAccounts.filter(a => a.category === 'equity').reduce((s, a) => s + a.balance, 0);
  const totalRevenue = chartOfAccounts.filter(a => a.category === 'revenue').reduce((s, a) => s + a.balance, 0);
  const totalExpenses = chartOfAccounts.filter(a => a.category === 'expense').reduce((s, a) => s + a.balance, 0);

  const getClassificationLabel = (cls: AccountClassification) => {
    switch (cls) {
      case 'current_asset': return 'চলতি সম্পদ';
      case 'fixed_asset': return 'স্থায়ী সম্পদ';
      case 'other_asset': return 'অন্যান্য জামানত';
      case 'current_liability': return 'স্বল্পমেয়াদী চলতি দায়';
      case 'long_term_liability': return 'দীর্ঘমেয়াদী ঋণ';
      case 'equity': return 'মালিকের মূলধন ও স্বত্ব';
      case 'operating_revenue': return 'প্রত্যক্ষ বিক্রয় রাজস্ব';
      case 'non_operating_revenue': return 'অ-পরিচালন আয়';
      case 'cost_of_goods_sold': return 'মালের ক্রয়ব্যয় (COGS)';
      case 'operating_expense': return 'পরিচালন ব্যয়';
      case 'administrative_expense': return 'প্রশাসনিক ব্যয়';
      case 'tax_expense': return 'কর ও শুল্ক';
      default: return cls;
    }
  };

  return (
    <div className="space-y-4">
      {/* Category Totals Metric Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-emerald-200 shadow-2xs bg-emerald-50/20">
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">১০০০ - মোট সম্পদ (Assets)</span>
          <div className="font-mono font-black text-emerald-700 text-base mt-1">
            {currency}{totalAssets.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-emerald-600 mt-0.5 block">
            হিসাব সংখ্যা: {chartOfAccounts.filter(a => a.category === 'asset').length} টি
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-rose-200 shadow-2xs bg-rose-50/20">
          <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block">২০০০ - মোট দায় (Liabilities)</span>
          <div className="font-mono font-black text-rose-700 text-base mt-1">
            {currency}{totalLiabilities.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-rose-600 mt-0.5 block">
            হিসাব সংখ্যা: {chartOfAccounts.filter(a => a.category === 'liability').length} টি
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-indigo-200 shadow-2xs bg-indigo-50/20">
          <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider block">৩০০০ - মালিকানাস্বত্ব (Equity)</span>
          <div className="font-mono font-black text-indigo-700 text-base mt-1">
            {currency}{totalEquity.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-indigo-600 mt-0.5 block">
            হিসাব সংখ্যা: {chartOfAccounts.filter(a => a.category === 'equity').length} টি
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-teal-200 shadow-2xs bg-teal-50/20">
          <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block">৪০০০ - মোট রাজস্ব (Revenue)</span>
          <div className="font-mono font-black text-teal-700 text-base mt-1">
            {currency}{totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-teal-600 mt-0.5 block">
            হিসাব সংখ্যা: {chartOfAccounts.filter(a => a.category === 'revenue').length} টি
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-amber-200 shadow-2xs bg-amber-50/20 col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">৫০০০/৬০০০ - মোট ব্যয় (Expenses)</span>
          <div className="font-mono font-black text-amber-700 text-base mt-1">
            {currency}{totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-amber-600 mt-0.5 block">
            হিসাব সংখ্যা: {chartOfAccounts.filter(a => a.category === 'expense').length} টি
          </span>
        </div>
      </div>

      {/* Action Header & Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FolderTree className="w-5 h-5 text-indigo-700" />
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              হিসাব তালিকা ও লেজার চার্ট (Chart of Accounts - COA)
            </h3>
            <p className="text-xs text-slate-500">
              আন্তর্জাতিক ৫-স্তর বিশিষ্ট অ্যাকাউন্টিং হেড কোডিং স্ট্রাকচার
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            handleCategoryChange('asset');
            setIsAddModalOpen(true);
          }}
          className="px-4 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" /> + নতুন হিসাব কোড যুক্ত করুন
        </button>
      </div>

      {/* Filter Category Buttons & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 overflow-x-auto text-xs pb-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            সকল হিসাব ({chartOfAccounts.length})
          </button>
          <button
            onClick={() => setSelectedCategory('asset')}
            className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
              selectedCategory === 'asset'
                ? 'bg-emerald-700 text-white shadow-2xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            সম্পদ / Assets (1000)
          </button>
          <button
            onClick={() => setSelectedCategory('liability')}
            className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
              selectedCategory === 'liability'
                ? 'bg-rose-700 text-white shadow-2xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            দায় / Liabilities (2000)
          </button>
          <button
            onClick={() => setSelectedCategory('equity')}
            className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
              selectedCategory === 'equity'
                ? 'bg-indigo-700 text-white shadow-2xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            মালিকানাস্বত্ব / Equity (3000)
          </button>
          <button
            onClick={() => setSelectedCategory('revenue')}
            className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
              selectedCategory === 'revenue'
                ? 'bg-teal-700 text-white shadow-2xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            রাজস্ব / Revenue (4000)
          </button>
          <button
            onClick={() => setSelectedCategory('expense')}
            className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
              selectedCategory === 'expense'
                ? 'bg-amber-700 text-white shadow-2xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            ব্যয় / Expense (5000-6000)
          </button>
        </div>

        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="কোড বা হিসাবের নামে খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:border-indigo-600 focus:outline-hidden"
          />
        </div>
      </div>

      {/* COA Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
              <tr>
                <th className="py-3 px-3.5">কোড নং</th>
                <th className="py-3 px-3.5">হিসাবের নাম ও ক্যাটাগরি</th>
                <th className="py-3 px-3.5">শ্রেণিবিভাগ (Classification)</th>
                <th className="py-3 px-3.5 text-center">স্বাভাবিক জের (Normal)</th>
                <th className="py-3 px-3.5 text-right">বর্তমান ব্যালেন্স ({currency})</th>
                <th className="py-3 px-3.5 text-center">টাইপ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAccounts.map(account => (
                <tr key={account.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-3.5 font-mono font-bold text-slate-900">
                    <span className="px-2 py-0.5 bg-slate-100 rounded-md border border-slate-200 text-slate-700">
                      {account.code}
                    </span>
                  </td>

                  <td className="py-3 px-3.5">
                    <div className="font-bold text-slate-900">
                      {account.name}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {account.nameBn} {account.description ? `• ${account.description}` : ''}
                    </div>
                  </td>

                  <td className="py-3 px-3.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                      {getClassificationLabel(account.classification)}
                    </span>
                  </td>

                  <td className="py-3 px-3.5 text-center font-mono font-bold">
                    {account.normalBalance === 'debit' ? (
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        Dr. ডেবিট
                      </span>
                    ) : (
                      <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                        Cr. ক্রেডিট
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-3.5 text-right font-mono font-bold text-slate-900 text-sm">
                    {currency}{account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>

                  <td className="py-3 px-3.5 text-center">
                    {account.isSystem ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        <Lock className="w-3 h-3 text-slate-400" /> সিস্টেম
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                        কাস্টম
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Account Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-black text-slate-900 text-base">
                নতুন হিসাব কোড যোগ করুন (Add New Account)
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAccount} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">ক্যাটাগরি *</label>
                  <select
                    value={category}
                    onChange={(e) => handleCategoryChange(e.target.value as AccountCategory)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-indigo-600 focus:outline-hidden cursor-pointer"
                  >
                    <option value="asset">সম্পদ (Asset - 1000s)</option>
                    <option value="liability">দায় (Liability - 2000s)</option>
                    <option value="equity">মালিকানাস্বত্ব (Equity - 3000s)</option>
                    <option value="revenue">রাজস্ব (Revenue - 4000s)</option>
                    <option value="expense">ব্যয় ও খরচ (Expense - 5000/6000s)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">হিসাব কোড (Account Code) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1090"
                    value={accountCode}
                    onChange={(e) => setAccountCode(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono font-bold focus:border-indigo-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">হিসাবের নাম (English) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mutual Trust Bank Ltd."
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-indigo-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">হিসাবের নাম (বাংলা)</label>
                <input
                  type="text"
                  placeholder="e.g. মিউচুয়াল ট্রাস্ট ব্যাংক চলতি হিসাব"
                  value={accountNameBn}
                  onChange={(e) => setAccountNameBn(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-indigo-600 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">স্বাভাবিক জের (Normal Balance)</label>
                  <select
                    value={normalBalance}
                    onChange={(e) => setNormalBalance(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-indigo-600 focus:outline-hidden cursor-pointer"
                  >
                    <option value="debit">Dr. ডেবিট</option>
                    <option value="credit">Cr. ক্রেডিট</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">প্রারম্ভিক জের ({currency})</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={openingBalance || ''}
                    onChange={(e) => setOpeningBalance(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono text-right focus:border-indigo-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">সংক্ষিপ্ত বিবরণ</label>
                <input
                  type="text"
                  placeholder="e.g. ধানমন্ডি ব্রাঞ্চ অ্যাকাউন্ট নং..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
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
                  disabled={!accountCode.trim() || !accountName.trim()}
                  className="px-5 py-2 bg-indigo-700 hover:bg-indigo-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" /> হিসাব সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
