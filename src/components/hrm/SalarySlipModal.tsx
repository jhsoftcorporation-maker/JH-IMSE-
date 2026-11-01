import React from 'react';
import { X, Printer, Download, CheckCircle2, DollarSign, Calendar, User, Building2, ShieldCheck } from 'lucide-react';
import { SalarySlip, Tenant } from '../../types';

interface SalarySlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  slip: SalarySlip | null;
  tenant: Tenant;
}

export const SalarySlipModal: React.FC<SalarySlipModalProps> = ({
  isOpen,
  onClose,
  slip,
  tenant,
}) => {
  if (!isOpen || !slip) return null;

  const handlePrint = () => {
    window.print();
  };

  // Helper for number in words in Bengali
  const numberToBengaliWords = (num: number): string => {
    if (num <= 0) return 'শূন্য টাকা মাত্র';
    return `${num.toLocaleString('bn-BD')} টাকা মাত্র`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 md:p-6 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:rounded-none">
        
        {/* Header - Screen only */}
        <div className="p-4 bg-slate-900 text-white flex justify-between items-center print:hidden">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-sm text-white">অফিসিয়াল বেতন স্লিপ ও পে-রোল ভাউচার</h3>
              <p className="text-[11px] text-slate-300">ভাউচার নং: {slip.slipNumber} • {slip.month}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Printer className="w-4 h-4" /> প্রিন্ট / PDF সংরক্ষণ
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Salary Slip Content */}
        <div id="salary-slip-printable" className="p-6 md:p-8 overflow-y-auto space-y-6 text-slate-800 print:p-4">
          
          {/* Company & Voucher Header */}
          <div className="border-b-2 border-slate-900 pb-5">
            <div className="flex justify-between items-start gap-4">
              <div>
                <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                  {tenant.name}
                </h1>
                <p className="text-xs text-slate-600 font-medium mt-0.5">{tenant.address}</p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 mt-1">
                  <span>ফোন: <strong>{tenant.phone}</strong></span>
                  <span>ইমেইল: <strong>{tenant.email}</strong></span>
                  {tenant.taxVatNo && <span>BIN/VAT: <strong>{tenant.taxVatNo}</strong></span>}
                </div>
              </div>
              <div className="text-right">
                <div className="inline-block bg-slate-900 text-white px-3 py-1 rounded text-xs font-black tracking-wider uppercase">
                  SALARY PAY SLIP
                </div>
                <div className="text-xs font-bold text-slate-700 mt-2 font-mono">
                  ভাউচার: #{slip.slipNumber}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  তারিখ: {slip.paymentDate}
                </div>
              </div>
            </div>
          </div>

          {/* Employee & Pay Period Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">কর্মচারীর নাম</span>
              <strong className="text-slate-900 text-xs">{slip.employeeName}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">পদবী ও বিভাগ</span>
              <span className="font-semibold text-slate-800">{slip.designation}</span>
              {slip.department && <span className="block text-[10px] text-slate-500">{slip.department}</span>}
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">মোবাইল নং</span>
              <span className="font-mono text-slate-800">{slip.phone}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">বেতনের মাস ও মেয়াদ</span>
              <strong className="text-purple-900">{slip.month}</strong>
              <span className="block text-[10px] text-slate-500">{slip.payPeriod}</span>
            </div>
          </div>

          {/* Sales & Performance Highlights (If Applicable) */}
          {slip.salesAchieved > 0 && (
            <div className="p-3 bg-purple-50/70 rounded-xl border border-purple-200/80 flex flex-wrap justify-between items-center gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="p-1 bg-purple-200 rounded text-purple-900 text-[11px] font-black">SALES</span>
                <div>
                  <span className="text-slate-600">চলতি মাসের বিক্রয় পারফরম্যান্স:</span>
                  <span className="font-bold text-slate-900 ml-1.5">{tenant.currency}{slip.salesAchieved.toLocaleString()}</span>
                  {slip.salesTarget > 0 && (
                    <span className="text-slate-500 ml-1">
                      (টার্গেট: {tenant.currency}{slip.salesTarget.toLocaleString()})
                    </span>
                  )}
                </div>
              </div>
              <div className="font-medium text-purple-900">
                অর্জিত কমিশন ({slip.salesCommissionRate}%): <strong>{tenant.currency}{slip.salesCommission.toLocaleString()}</strong>
              </div>
            </div>
          )}

          {/* Earnings vs Deductions 2-Column Table */}
          <div className="grid md:grid-cols-2 gap-4">
            
            {/* Earnings Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-emerald-50 px-3.5 py-2 border-b border-emerald-100 flex justify-between items-center">
                <span className="font-bold text-xs text-emerald-900 uppercase tracking-wide">১. উপার্জন (Earnings)</span>
                <span className="text-[10px] font-bold text-emerald-700">টাকা ({tenant.currency})</span>
              </div>
              <table className="w-full text-xs">
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-2 px-3 text-slate-600">মূল মাসিক বেতন (Basic Salary)</td>
                    <td className="py-2 px-3 text-right font-mono font-medium">{tenant.currency}{slip.basicSalary.toLocaleString()}</td>
                  </tr>
                  {slip.houseRentAllowance > 0 && (
                    <tr>
                      <td className="py-2 px-3 text-slate-600">বাড়ি ভাড়া ভাতা (House Rent)</td>
                      <td className="py-2 px-3 text-right font-mono font-medium">{tenant.currency}{slip.houseRentAllowance.toLocaleString()}</td>
                    </tr>
                  )}
                  {slip.conveyanceAllowance > 0 && (
                    <tr>
                      <td className="py-2 px-3 text-slate-600">যাতায়াত ভাতা (Conveyance)</td>
                      <td className="py-2 px-3 text-right font-mono font-medium">{tenant.currency}{slip.conveyanceAllowance.toLocaleString()}</td>
                    </tr>
                  )}
                  {slip.medicalAllowance > 0 && (
                    <tr>
                      <td className="py-2 px-3 text-slate-600">চিকিৎসা ভাতা (Medical Allowance)</td>
                      <td className="py-2 px-3 text-right font-mono font-medium">{tenant.currency}{slip.medicalAllowance.toLocaleString()}</td>
                    </tr>
                  )}
                  {slip.salesCommission > 0 && (
                    <tr>
                      <td className="py-2 px-3 text-purple-800 font-medium">সেলস কমিশন বোনাস ({slip.salesCommissionRate}%)</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-purple-800">{tenant.currency}{slip.salesCommission.toLocaleString()}</td>
                    </tr>
                  )}
                  {slip.overtimeAmount > 0 && (
                    <tr>
                      <td className="py-2 px-3 text-slate-600">ওভারটাইম ({slip.overtimeHours} ঘণ্টা @ {tenant.currency}{slip.overtimeRate})</td>
                      <td className="py-2 px-3 text-right font-mono font-medium">{tenant.currency}{slip.overtimeAmount.toLocaleString()}</td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 font-bold border-t border-slate-200">
                    <td className="py-2 px-3 text-slate-800">মোট উপার্জন (Gross Earnings)</td>
                    <td className="py-2 px-3 text-right font-mono text-emerald-700">{tenant.currency}{slip.grossEarnings.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Deductions Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-rose-50 px-3.5 py-2 border-b border-rose-100 flex justify-between items-center">
                <span className="font-bold text-xs text-rose-900 uppercase tracking-wide">২. কর্তন (Deductions)</span>
                <span className="text-[10px] font-bold text-rose-700">টাকা ({tenant.currency})</span>
              </div>
              <table className="w-full text-xs">
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-2 px-3 text-slate-600">অনুপস্থিতি কর্তন ({slip.absentDays} দিন)</td>
                    <td className="py-2 px-3 text-right font-mono font-medium text-rose-600">
                      {slip.absentDeduction > 0 ? `-${tenant.currency}${slip.absentDeduction.toLocaleString()}` : '০.০০'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-slate-600">অগ্রিম বেতন সমন্বয় (Salary Advance)</td>
                    <td className="py-2 px-3 text-right font-mono font-medium text-rose-600">
                      {slip.advanceDeduction > 0 ? `-${tenant.currency}${slip.advanceDeduction.toLocaleString()}` : '০.০০'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-slate-600">প্রভিডেন্ট ফান্ড / ট্যাক্স কর্তন</td>
                    <td className="py-2 px-3 text-right font-mono font-medium text-rose-600">
                      {slip.providentFund > 0 ? `-${tenant.currency}${slip.providentFund.toLocaleString()}` : '০.০০'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-slate-400">অন্যান্য ফি বা জরিমানা</td>
                    <td className="py-2 px-3 text-right font-mono text-slate-400">০.০০</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 font-bold border-t border-slate-200">
                    <td className="py-2 px-3 text-slate-800">মোট কর্তন (Total Deductions)</td>
                    <td className="py-2 px-3 text-right font-mono text-rose-700">-{tenant.currency}{slip.totalDeductions.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Net Payable Grand Card */}
          <div className="p-4 bg-gradient-to-r from-purple-900 to-indigo-900 text-white rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-purple-200 block font-semibold">
                সর্বমোট প্রদেয় নিট বেতন (Net Payable Amount)
              </span>
              <div className="text-[11px] text-purple-200 mt-0.5">
                কথায়: <span className="font-semibold text-white">{numberToBengaliWords(slip.netPayable)}</span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-[11px]">
                <span className="px-2 py-0.5 rounded bg-white/20 text-white font-medium uppercase text-[10px]">
                  পেমেন্ট মাধ্যম: {slip.paymentMethod}
                </span>
                <span className="text-emerald-300 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {slip.status === 'paid' ? 'পরিশোধিত' : 'অপেক্ষমান'}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl md:text-3xl font-black font-mono tracking-tight text-white">
                {tenant.currency}{slip.netPayable.toLocaleString()}
              </span>
            </div>
          </div>

          {slip.note && (
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600">
              <strong>বিশেষ মন্তব্য:</strong> {slip.note}
            </div>
          )}

          {/* Signature Blocks */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-xs">
            <div>
              <div className="border-t border-slate-400 pt-1.5 font-semibold text-slate-700">
                প্রস্তুতকারক (HR)
              </div>
              <div className="text-[10px] text-slate-400">তারিখ সহ স্বাক্ষর</div>
            </div>
            <div>
              <div className="border-t border-slate-400 pt-1.5 font-semibold text-slate-700">
                হিসাব কর্মকর্তা
              </div>
              <div className="text-[10px] text-slate-400">অডিট ও অনুমোদন</div>
            </div>
            <div>
              <div className="border-t border-slate-400 pt-1.5 font-semibold text-slate-700">
                মালিক / ব্যবস্থাপনা পরিচালক
              </div>
              <div className="text-[10px] text-slate-400">অনুমোদিত স্বাক্ষর</div>
            </div>
            <div>
              <div className="border-t border-slate-400 pt-1.5 font-semibold text-slate-700">
                গ্রহীতার স্বাক্ষর
              </div>
              <div className="text-[10px] text-slate-400">{slip.employeeName}</div>
            </div>
          </div>

          {/* Footer Notice */}
          <div className="border-t border-slate-100 pt-3 text-center text-[10px] text-slate-400">
            এই বেতন স্লিপটি JH IMSE ERP ক্লাউড সফটওয়্যার দ্বারা তৈরি একটি অনুমোদিত অফিসিয়াল পে-রোল ডকুমেন্ট।
          </div>

        </div>

      </div>
    </div>
  );
};
