import React, { useState } from 'react';
import { Customer, Tenant, CustomerTransaction } from '../types';
import { 
  X, Printer, Download, DollarSign, Calendar, AlertTriangle, 
  Send, ShieldCheck, CheckCircle2, ArrowDownLeft, ArrowUpRight,
  FileText, Clock, Building2, Phone, MapPin, Mail, Award
} from 'lucide-react';

interface CustomerLedgerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  tenant: Tenant;
  onOpenReceivePayment: (customer: Customer) => void;
  onOpenSmsReminder: (customer: Customer) => void;
}

export const CustomerLedgerModal: React.FC<CustomerLedgerModalProps> = ({
  isOpen,
  onClose,
  customer,
  tenant,
  onOpenReceivePayment,
  onOpenSmsReminder,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'invoices' | 'payments'>('all');
  const [dateRange, setDateRange] = useState<'all' | 'this_month' | 'last_30_days'>('all');

  if (!isOpen || !customer) return null;

  // Extract or generate transactions
  const transactions: CustomerTransaction[] = customer.transactions && customer.transactions.length > 0 
    ? customer.transactions 
    : [
        {
          id: 'trx-fallback-1',
          customerId: customer.id,
          date: customer.lastPurchased || new Date().toISOString().slice(0, 10),
          type: 'opening_balance',
          referenceNo: 'OPB-001',
          description: 'প্রারম্ভিক জের (Opening Balance)',
          debit: customer.dueAmount,
          credit: 0,
          balance: customer.dueAmount,
          note: 'বাকি খাতা পূর্ববর্তী জের',
        }
      ];

  // Filtering
  const filteredTransactions = transactions.filter(t => {
    if (filterType === 'invoices') return t.type === 'invoice' || t.type === 'opening_balance';
    if (filterType === 'payments') return t.type === 'payment' || t.type === 'credit_note';
    return true;
  });

  const totalDebit = transactions.reduce((sum, t) => sum + (t.debit || 0), 0);
  const totalCredit = transactions.reduce((sum, t) => sum + (t.credit || 0), 0);
  const creditLimit = customer.creditLimit || 0;
  const isOverLimit = creditLimit > 0 && customer.dueAmount > creditLimit;
  const availableCredit = creditLimit > 0 ? Math.max(0, creditLimit - customer.dueAmount) : null;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ['তারিখ', 'লেনদেনের ধরন', 'রেফারেন্স / ভাউচার', 'বিবরণ', 'ডেবিট (টাকা)', 'ক্রেডিট (টাকা)', 'অবশিষ্ট ব্যালেন্স', 'মন্তব্য'];
    const rows = filteredTransactions.map(t => [
      t.date,
      t.type,
      t.referenceNo,
      `"${t.description.replace(/"/g, '""')}"`,
      t.debit.toFixed(2),
      t.credit.toFixed(2),
      t.balance.toFixed(2),
      `"${(t.note || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Ledger_${customer.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-purple-100 flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-900 text-white px-6 py-4 flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
              <FileText className="w-5 h-5 text-purple-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg tracking-tight">কাস্টমার ডিজিটাল খাতা ও স্টেটমেন্ট</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-700 text-purple-200 font-mono font-bold">
                  {customer.id}
                </span>
              </div>
              <p className="text-xs text-purple-200">
                {customer.name} • {tenant.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 border border-white/20"
              title="A4 প্রিন্ট করুন"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">লেজার প্রিন্ট</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 border border-white/20"
              title="CSV ডাউনলোড করুন"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">CSV এক্সপোর্ট</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          
          {/* Printable Official Statement Header (Visible when printed, or at top) */}
          <div className="border-b border-slate-200 pb-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-xs font-extrabold tracking-widest text-purple-700 uppercase">JH IMSE Enterprise Cloud</span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{tenant.name}</h2>
                <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> {tenant.address}
                </p>
                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> হেল্পলাইন: {tenant.phone} | JH Helpline: +8801940999830
                </p>
              </div>

              <div className="sm:text-right bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-2xl w-full sm:w-auto border sm:border-0 border-slate-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">লেজার স্টেটমেন্ট বিবরণ</span>
                <div className="text-sm font-extrabold text-slate-900">
                  তারিখ: {new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                <div className="text-xs text-slate-500 font-mono mt-0.5">
                  Currency: {tenant.currency} BDT
                </div>
              </div>
            </div>
          </div>

          {/* Customer Profile & Credit Control Badges */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Customer Details */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2 md:col-span-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-base text-slate-900">{customer.name}</h4>
                  {customer.loyaltyTier && (
                    <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full ${
                      customer.loyaltyTier === 'vip' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                      customer.loyaltyTier === 'gold' ? 'bg-yellow-100 text-yellow-900 border border-yellow-300' :
                      customer.loyaltyTier === 'silver' ? 'bg-slate-200 text-slate-800' : 'bg-orange-100 text-orange-900'
                    }`}>
                      ★ {customer.loyaltyTier}
                    </span>
                  )}
                  {customer.customerType && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold">
                      {customer.customerType === 'retail' ? 'খুচরা ক্রেতা' : customer.customerType === 'wholesale' ? 'পাইকারি গ্রাহক' : 'কর্পোরেট'}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <span className="font-mono font-medium">{customer.phone}</span>
                </div>
                {customer.email && (
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span className="truncate">{customer.email}</span>
                  </div>
                )}
                {customer.address && (
                  <div className="flex items-center gap-1.5 sm:col-span-2">
                    <MapPin className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span>{customer.address}</span>
                  </div>
                )}
              </div>

              {customer.notes && (
                <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-200/60">
                  নোট: {customer.notes}
                </p>
              )}
            </div>

            {/* Credit Limit & Risk Indicator */}
            <div className={`p-4 rounded-2xl border flex flex-col justify-between ${
              isOverLimit 
                ? 'bg-rose-50 border-rose-300 text-rose-950' 
                : 'bg-purple-50/70 border-purple-200 text-purple-950'
            }`}>
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">ক্রেডিট নিয়ন্ত্রণ</span>
                  {isOverLimit ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-rose-600 text-white rounded-md flex items-center gap-1 animate-pulse">
                      <AlertTriangle className="w-3 h-3" /> লিমিট অতিক্রম
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" /> ঝুঁকিহীন
                    </span>
                  )}
                </div>

                <div className="mt-2 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-600">ক্রেডিট সীমা (Limit):</span>
                    <strong className="font-bold">
                      {creditLimit > 0 ? `${tenant.currency}${creditLimit.toLocaleString()}` : 'সীমাহীন'}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">বর্তমান বকেয়া (Due):</span>
                    <strong className={`font-extrabold ${customer.dueAmount > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                      {tenant.currency}{customer.dueAmount.toLocaleString()}
                    </strong>
                  </div>
                  {availableCredit !== null && (
                    <div className="flex justify-between pt-1 border-t border-purple-200/50">
                      <span className="text-slate-600">অবশিষ্ট ক্রেডিট:</span>
                      <strong className={isOverLimit ? 'text-rose-600 font-bold' : 'text-emerald-700 font-bold'}>
                        {tenant.currency}{availableCredit.toLocaleString()}
                      </strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions inside Modal */}
              <div className="flex gap-2 pt-3 mt-2 border-t border-purple-200/50 print:hidden">
                <button
                  onClick={() => onOpenReceivePayment(customer)}
                  className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 shadow-2xs"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  জমা নিন
                </button>
                <button
                  onClick={() => onOpenSmsReminder(customer)}
                  disabled={customer.dueAmount <= 0}
                  className="flex-1 py-1.5 bg-purple-700 hover:bg-purple-800 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 shadow-2xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  SMS তাগাদা
                </button>
              </div>
            </div>
          </div>

          {/* 4 Summary Balance Blocks */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">সর্বমোট ক্রয় (Total Spent)</span>
              <div className="text-base sm:text-lg font-black text-slate-900 mt-1">
                {tenant.currency}{customer.totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[10px] text-slate-400">অর্ডার: {customer.purchaseCount} বার</span>
            </div>

            <div className="bg-blue-50 p-3.5 rounded-2xl border border-blue-100">
              <span className="text-[10px] font-bold text-blue-700 uppercase block">মোট চার্জ / বিল (Debit)</span>
              <div className="text-base sm:text-lg font-black text-blue-900 mt-1">
                {tenant.currency}{totalDebit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[10px] text-blue-600">মাল বিক্রয় ও প্রারম্ভিক জের</span>
            </div>

            <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-100">
              <span className="text-[10px] font-bold text-emerald-700 uppercase block">মোট পরিশোধ (Credit)</span>
              <div className="text-base sm:text-lg font-black text-emerald-900 mt-1">
                {tenant.currency}{totalCredit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[10px] text-emerald-600">আদায়কৃত টাকা ও সমন্বয়</span>
            </div>

            <div className="bg-rose-50 p-3.5 rounded-2xl border border-rose-200">
              <span className="text-[10px] font-bold text-rose-700 uppercase block">বর্তমান নিট বকেয়া (Closing Due)</span>
              <div className="text-base sm:text-lg font-black text-rose-600 mt-1">
                {tenant.currency}{customer.dueAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[10px] text-rose-700 font-semibold">
                {customer.dueAmount > 0 ? 'বকেয়া অনাদায়ী' : 'কোনো বাকি নেই'}
              </span>
            </div>
          </div>

          {/* Ledger Table Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 print:hidden">
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  filterType === 'all'
                    ? 'bg-purple-800 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                সব লেনদেন ({transactions.length})
              </button>
              <button
                onClick={() => setFilterType('invoices')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  filterType === 'invoices'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                }`}
              >
                ইনভয়েস ও চার্জ
              </button>
              <button
                onClick={() => setFilterType('payments')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  filterType === 'payments'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                জমা ও পরিশোধ
              </button>
            </div>

            <div className="text-xs text-slate-500 font-medium">
              লেনদেন রেকর্ড সংখ্যা: <strong>{filteredTransactions.length}</strong> টি
            </div>
          </div>

          {/* Detailed Ledger Timeline Table */}
          <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">তারিখ</th>
                  <th className="py-3 px-3">ধরন</th>
                  <th className="py-3 px-3">ভাউচার / ইনভয়েস #</th>
                  <th className="py-3 px-3">লেনদেন বিবরণ ও মাধ্যম</th>
                  <th className="py-3 px-3 text-right">ডেবিট (টাকা)</th>
                  <th className="py-3 px-3 text-right">ক্রেডিট (টাকা)</th>
                  <th className="py-3 px-3 text-right">অবশিষ্ট বকেয়া</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.map((trx, idx) => {
                  const isDebit = trx.debit > 0;
                  const isCredit = trx.credit > 0;

                  return (
                    <tr key={trx.id || idx} className="hover:bg-slate-50/80 transition">
                      {/* Date */}
                      <td className="py-3 px-3 font-mono text-slate-600 whitespace-nowrap">
                        {trx.date}
                      </td>

                      {/* Type Badge */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {trx.type === 'invoice' && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-800">
                            ইনভয়েস
                          </span>
                        )}
                        {trx.type === 'payment' && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            জমা / রিসিট
                          </span>
                        )}
                        {trx.type === 'credit_note' && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-800">
                            বিক্রয় ফেরত
                          </span>
                        )}
                        {trx.type === 'opening_balance' && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-200 text-slate-800">
                            প্রারম্ভিক জের
                          </span>
                        )}
                      </td>

                      {/* Reference No */}
                      <td className="py-3 px-3 font-mono font-bold text-slate-700 whitespace-nowrap">
                        {trx.referenceNo}
                      </td>

                      {/* Description & Payment method */}
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800">{trx.description}</div>
                        {(trx.paymentMethod || trx.note) && (
                          <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                            {trx.paymentMethod && (
                              <span className="uppercase font-bold text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200">
                                {trx.paymentMethod}
                              </span>
                            )}
                            {trx.note && <span>{trx.note}</span>}
                          </div>
                        )}
                      </td>

                      {/* Debit (Customer Owed) */}
                      <td className="py-3 px-3 text-right font-mono font-bold text-blue-700 whitespace-nowrap">
                        {trx.debit > 0 ? `${tenant.currency}${trx.debit.toFixed(2)}` : '-'}
                      </td>

                      {/* Credit (Customer Paid) */}
                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700 whitespace-nowrap">
                        {trx.credit > 0 ? `${tenant.currency}${trx.credit.toFixed(2)}` : '-'}
                      </td>

                      {/* Balance after this transaction */}
                      <td className="py-3 px-3 text-right font-mono font-extrabold text-slate-900 whitespace-nowrap">
                        {tenant.currency}{trx.balance.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-50 font-bold border-t border-slate-200 text-slate-800">
                <tr>
                  <td colSpan={4} className="py-3 px-3 text-right uppercase text-[11px] text-slate-500">
                    সর্বমোট হিসাব (Total Sum):
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-blue-700">
                    {tenant.currency}{totalDebit.toFixed(2)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-emerald-700">
                    {tenant.currency}{totalCredit.toFixed(2)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-rose-600 text-sm">
                    {tenant.currency}{customer.dueAmount.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Printable Signature & Corporate Verification Block */}
          <div className="pt-8 border-t border-slate-200 hidden print:block space-y-6">
            <div className="grid grid-cols-3 gap-6 text-center text-xs text-slate-600 pt-6">
              <div className="border-t border-slate-400 pt-2">
                <p className="font-bold text-slate-800">গ্রাহকের স্বাক্ষর</p>
                <p className="text-[10px] text-slate-400">Customer Signature</p>
              </div>
              <div className="border-t border-slate-400 pt-2">
                <p className="font-bold text-slate-800">হিসাবরক্ষক</p>
                <p className="text-[10px] text-slate-400">Accountant Verification</p>
              </div>
              <div className="border-t border-slate-400 pt-2">
                <p className="font-bold text-slate-800">কর্তৃপক্ষের স্বাক্ষর</p>
                <p className="text-[10px] text-slate-400">Authorized Signature & Seal</p>
              </div>
            </div>

            <div className="text-center text-[10px] text-slate-400 border-t border-slate-100 pt-3">
              সফটওয়্যার পার্টনার: <strong>JH Soft Corporation</strong> • Helpline: +8801940999830 • এটি একটি কম্পিউটার জেনারেটেড ডিজিটাল খাতা স্টেটমেন্ট।
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>JH IMSE ডাবল-এন্ট্রি সুরক্ষিত লেজার আর্কিটেকচার</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold transition"
            >
              বন্ধ করুন
            </button>
            <button
              type="button"
              onClick={() => onOpenReceivePayment(customer)}
              className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
            >
              <DollarSign className="w-4 h-4" />
              বকেয়া জমা গ্রহণ করুন
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
