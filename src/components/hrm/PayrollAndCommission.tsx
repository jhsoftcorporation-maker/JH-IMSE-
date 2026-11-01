import React, { useState, useMemo } from 'react';
import { 
  DollarSign, Award, Printer, CheckCircle2, Clock, Calendar, 
  Search, Filter, Plus, User, ArrowUpRight, Check, X, Building2,
  FileSpreadsheet, ShieldAlert, Sparkles, TrendingUp
} from 'lucide-react';
import { Employee, SalarySlip, Tenant, Warehouse } from '../../types';
import { SalarySlipModal } from './SalarySlipModal';

interface PayrollAndCommissionProps {
  employees: Employee[];
  salarySlips: SalarySlip[];
  tenant: Tenant;
  warehouses: Warehouse[];
  onAddSalarySlip: (slip: SalarySlip) => void;
  onUpdateSlipStatus: (slipId: string, status: 'paid' | 'pending', method?: 'cash' | 'bkash' | 'bank') => void;
}

export const PayrollAndCommission: React.FC<PayrollAndCommissionProps> = ({
  employees,
  salarySlips,
  tenant,
  warehouses,
  onAddSalarySlip,
  onUpdateSlipStatus,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>('অক্টোবর ২০২৬');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [activeSlipForPrint, setActiveSlipForPrint] = useState<SalarySlip | null>(null);
  const [isGenerateSlipModalOpen, setIsGenerateSlipModalOpen] = useState(false);

  // Form state for generating a new salary slip
  const [selectedEmpId, setSelectedEmpId] = useState<string>('');
  const [genBasic, setGenBasic] = useState('0');
  const [genHouseRent, setGenHouseRent] = useState('0');
  const [genConveyance, setGenConveyance] = useState('0');
  const [genMedical, setGenMedical] = useState('0');
  const [genSalesAchieved, setGenSalesAchieved] = useState('0');
  const [genSalesTarget, setGenSalesTarget] = useState('0');
  const [genCommissionRate, setGenCommissionRate] = useState('0');
  const [genOvertimeHours, setGenOvertimeHours] = useState('0');
  const [genOvertimeRate, setGenOvertimeRate] = useState('150');
  const [genAbsentDays, setGenAbsentDays] = useState('0');
  const [genAbsentDeduction, setGenAbsentDeduction] = useState('0');
  const [genAdvanceDeduction, setGenAdvanceDeduction] = useState('0');
  const [genProvidentFund, setGenProvidentFund] = useState('0');
  const [genPaymentMethod, setGenPaymentMethod] = useState<'cash' | 'bkash' | 'bank'>('bkash');
  const [genNote, setGenNote] = useState('');

  // Tenant's employees
  const tenantEmployees = useMemo(() => {
    return employees.filter(e => e.tenantId === tenant.id);
  }, [employees, tenant.id]);

  // Tenant's slips
  const tenantSlips = useMemo(() => {
    return salarySlips.filter(s => s.tenantId === tenant.id);
  }, [salarySlips, tenant.id]);

  // Filtered slips
  const filteredSlips = useMemo(() => {
    return tenantSlips.filter(s => {
      const matchSearch =
        s.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.slipNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.designation.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'all' || s.status === statusFilter;
      const matchMonth = selectedMonth === 'all' || s.month === selectedMonth;

      return matchSearch && matchStatus && matchMonth;
    });
  }, [tenantSlips, searchQuery, statusFilter, selectedMonth]);

  // Financial aggregates
  const totalPayrollPaid = tenantSlips
    .filter(s => s.status === 'paid' && (selectedMonth === 'all' || s.month === selectedMonth))
    .reduce((acc, s) => acc + s.netPayable, 0);

  const totalPayrollPending = tenantSlips
    .filter(s => s.status === 'pending' && (selectedMonth === 'all' || s.month === selectedMonth))
    .reduce((acc, s) => acc + s.netPayable, 0);

  const totalCommissionDisbursed = tenantSlips
    .filter(s => selectedMonth === 'all' || s.month === selectedMonth)
    .reduce((acc, s) => acc + s.salesCommission, 0);

  // When an employee is selected in Generate Modal, auto-populate details
  const handleSelectEmployeeForSlip = (empId: string) => {
    setSelectedEmpId(empId);
    const emp = tenantEmployees.find(e => e.id === empId);
    if (emp) {
      setGenBasic(emp.salary.toString());
      setGenHouseRent(Math.round((emp.allowance || 0) * 0.6).toString());
      setGenConveyance(Math.round((emp.allowance || 0) * 0.4).toString());
      setGenMedical('500');
      setGenSalesAchieved((emp.salesThisMonth || 0).toString());
      setGenSalesTarget((emp.salesTarget || 0).toString());
      setGenCommissionRate((emp.salesCommissionRate || 0).toString());
      setGenOvertimeHours('8');
      setGenOvertimeRate('150');
      setGenAbsentDays('0');
      setGenAbsentDeduction('0');
      setGenAdvanceDeduction('0');
      setGenProvidentFund('1000');
      setGenNote(`${selectedMonth} এর নির্ধারিত বেতন ও বিক্রয় কমিশন`);
    }
  };

  // Live calculation of net payable in modal
  const calcGrossEarnings = () => {
    const basic = parseFloat(genBasic) || 0;
    const hr = parseFloat(genHouseRent) || 0;
    const conv = parseFloat(genConveyance) || 0;
    const med = parseFloat(genMedical) || 0;
    const sales = parseFloat(genSalesAchieved) || 0;
    const commRate = parseFloat(genCommissionRate) || 0;
    const comm = sales * (commRate / 100);
    const otHours = parseFloat(genOvertimeHours) || 0;
    const otRate = parseFloat(genOvertimeRate) || 0;
    const otAmount = otHours * otRate;

    return basic + hr + conv + med + comm + otAmount;
  };

  const calcTotalDeductions = () => {
    const absent = parseFloat(genAbsentDeduction) || 0;
    const adv = parseFloat(genAdvanceDeduction) || 0;
    const pf = parseFloat(genProvidentFund) || 0;
    return absent + adv + pf;
  };

  const calcNetPayable = () => {
    return Math.max(0, calcGrossEarnings() - calcTotalDeductions());
  };

  const handleCreateSalarySlip = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = tenantEmployees.find(e => e.id === selectedEmpId);
    if (!emp) return;

    const sales = parseFloat(genSalesAchieved) || 0;
    const commRate = parseFloat(genCommissionRate) || 0;
    const comm = Math.round(sales * (commRate / 100));
    const otHours = parseFloat(genOvertimeHours) || 0;
    const otRate = parseFloat(genOvertimeRate) || 0;
    const otAmount = Math.round(otHours * otRate);

    const gross = Math.round(calcGrossEarnings());
    const deductions = Math.round(calcTotalDeductions());
    const net = Math.round(calcNetPayable());

    const newSlip: SalarySlip = {
      id: `slip-${Date.now()}`,
      slipNumber: `PAY-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(tenantSlips.length + 1).padStart(3, '0')}`,
      tenantId: tenant.id,
      employeeId: emp.id,
      employeeName: emp.name,
      designation: emp.designation || 'কর্মকর্তা',
      phone: emp.phone,
      department: emp.role === 'cashier' ? 'কাউন্টার ও ক্যাশ' : emp.role === 'manager' ? 'ম্যানেজমেন্ট' : 'হিসাব ও অডিট',
      month: selectedMonth,
      payPeriod: `০১ ${selectedMonth} - ৩০ ${selectedMonth}`,
      basicSalary: parseFloat(genBasic) || 0,
      houseRentAllowance: parseFloat(genHouseRent) || 0,
      conveyanceAllowance: parseFloat(genConveyance) || 0,
      medicalAllowance: parseFloat(genMedical) || 0,
      salesAchieved: sales,
      salesTarget: parseFloat(genSalesTarget) || 0,
      salesCommissionRate: commRate,
      salesCommission: comm,
      overtimeHours: otHours,
      overtimeRate: otRate,
      overtimeAmount: otAmount,
      grossEarnings: gross,
      absentDays: parseFloat(genAbsentDays) || 0,
      absentDeduction: parseFloat(genAbsentDeduction) || 0,
      advanceDeduction: parseFloat(genAdvanceDeduction) || 0,
      providentFund: parseFloat(genProvidentFund) || 0,
      totalDeductions: deductions,
      netPayable: net,
      paymentMethod: genPaymentMethod,
      paymentDate: new Date().toISOString().slice(0, 10),
      status: 'paid',
      note: genNote,
    };

    onAddSalarySlip(newSlip);
    setIsGenerateSlipModalOpen(false);
    setActiveSlipForPrint(newSlip); // open printable slip directly!
  };

  return (
    <div className="space-y-4">
      {/* Top Aggregates */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">পরিশোধিত মোট বেতন</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600 font-mono">
            {tenant.currency}{totalPayrollPaid.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">{selectedMonth} এর হিসাব</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">অপেক্ষমান বেতন (Pending)</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700 font-mono">
            {tenant.currency}{totalPayrollPending.toLocaleString()}
          </div>
          <div className="text-[11px] text-amber-600 mt-0.5">পরিশোধ করতে হবে</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">অর্জিত সেলস কমিশন</span>
            <Award className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-700 font-mono">
            {tenant.currency}{totalCommissionDisbursed.toLocaleString()}
          </div>
          <div className="text-[11px] text-purple-600 mt-0.5">বিক্রয়ের ভিত্তিতে বোনাস</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">ইস্যুকৃত বেতন স্লিপ</span>
            <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {tenantSlips.length} টি
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">ভাউচার প্রিন্ট যোগ্য</div>
        </div>
      </div>

      {/* Cashier & Sales Performance Target Leaderboard */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              ক্যাশিয়ার ও সেলস টিম পারফরম্যান্স এবং কমিশন লিডারবোর্ড
            </h3>
            <p className="text-xs text-slate-500">
              ব্যক্তিগত বিক্রয় লক্ষ্যমাত্রা (Target) বনাম অর্জিত বিক্রয় এবং কমিশন হিসাব
            </p>
          </div>
          <span className="text-xs font-bold text-purple-800 bg-purple-50 px-3 py-1 rounded-lg border border-purple-200">
            মাস: {selectedMonth}
          </span>
        </div>

        <div className="grid md:grid-cols-3 gap-3 pt-2">
          {tenantEmployees
            .filter(e => (e.salesTarget || 0) > 0)
            .map(emp => {
              const target = emp.salesTarget || 0;
              const achieved = emp.salesThisMonth || 0;
              const pct = target > 0 ? Math.round((achieved / target) * 100) : 0;
              const commissionEarned = achieved * (emp.salesCommissionRate / 100);
              const isOver = pct >= 100;

              return (
                <div
                  key={emp.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:shadow-sm transition space-y-2.5"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">{emp.name}</h4>
                      <p className="text-[11px] text-slate-500">{emp.designation}</p>
                    </div>
                    {isOver && (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase rounded-md border border-emerald-300">
                        ★ TARGET EXCEEDED
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600">বিক্রয় অর্জন:</span>
                      <strong className="text-purple-900 font-mono">
                        {tenant.currency}{achieved.toLocaleString()} / {tenant.currency}{target.toLocaleString()}
                      </strong>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isOver ? 'bg-emerald-500' : 'bg-purple-600'
                        }`}
                        style={{ width: `${Math.min(100, pct)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[11px] mt-1 text-slate-500">
                      <span>{pct}% সম্পন্ন</span>
                      <span className="text-emerald-700 font-bold">
                        কমিশন ({emp.salesCommissionRate}%): {tenant.currency}{commissionEarned.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Salary Slips & History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Table Header & Action Controls */}
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div>
            <h3 className="font-bold text-sm text-slate-900">কর্মচারীদের মাসিক পে-রোল ও বেতন স্লিপ রেজিস্টার</h3>
            <p className="text-xs text-slate-500">অফিসিয়াল পে-স্লিপ প্রিন্ট, কমিশন অনুমোদন এবং পেমেন্ট মার্কিং</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Month Filter */}
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none"
            >
              <option value="অক্টোবর ২০২৬">অক্টোবর ২০২৬</option>
              <option value="সেপ্টেম্বর ২০২৬">সেপ্টেম্বর ২০২৬</option>
              <option value="আগস্ট ২০২৬">আগস্ট ২০২৬</option>
              <option value="all">সকল মাস</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none"
            >
              <option value="all">সকল স্ট্যাটাস</option>
              <option value="paid">পরিশোধিত (Paid)</option>
              <option value="pending">বাকি / অপেক্ষমান (Pending)</option>
            </select>

            {/* Generate Button */}
            <button
              onClick={() => {
                if (tenantEmployees.length > 0) {
                  handleSelectEmployeeForSlip(tenantEmployees[0].id);
                }
                setIsGenerateSlipModalOpen(true);
              }}
              className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" /> নতুন বেতন স্লিপ প্রস্তুত করুন
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11px]">
              <tr>
                <th className="py-3 px-4">স্লিপ নং ও মাস</th>
                <th className="py-3 px-4">কর্মচারীর নাম ও পদবী</th>
                <th className="py-3 px-4 text-right">মূল বেতন</th>
                <th className="py-3 px-4 text-right">সেলস কমিশন</th>
                <th className="py-3 px-4 text-right">ওভারটাইম</th>
                <th className="py-3 px-4 text-right">মোট কর্তন</th>
                <th className="py-3 px-4 text-right">নিট প্রদেয় বেতন</th>
                <th className="py-3 px-4 text-center">পেমেন্ট অবস্থা</th>
                <th className="py-3 px-4 text-center">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSlips.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <FileSpreadsheet className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">কোনো বেতন স্লিপ পাওয়া যায়নি</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">নতুন বেতন স্লিপ প্রস্তুত করতে উপরের বাটনে চাপুন</p>
                  </td>
                </tr>
              ) : (
                filteredSlips.map(slip => {
                  const isPaid = slip.status === 'paid';

                  return (
                    <tr key={slip.id} className="hover:bg-slate-50/80 transition">
                      {/* Slip No & Month */}
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-purple-700">{slip.slipNumber}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{slip.month}</div>
                      </td>

                      {/* Employee */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{slip.employeeName}</div>
                        <div className="text-[11px] text-slate-500">{slip.designation}</div>
                      </td>

                      {/* Basic */}
                      <td className="py-3 px-4 text-right font-mono font-medium text-slate-800">
                        {tenant.currency}{slip.basicSalary.toLocaleString()}
                      </td>

                      {/* Commission */}
                      <td className="py-3 px-4 text-right font-mono font-bold text-purple-800">
                        {slip.salesCommission > 0 ? `${tenant.currency}${slip.salesCommission.toLocaleString()}` : '—'}
                      </td>

                      {/* Overtime */}
                      <td className="py-3 px-4 text-right font-mono text-emerald-700">
                        {slip.overtimeAmount > 0 ? `+${tenant.currency}${slip.overtimeAmount.toLocaleString()}` : '—'}
                      </td>

                      {/* Deductions */}
                      <td className="py-3 px-4 text-right font-mono text-rose-600">
                        {slip.totalDeductions > 0 ? `-${tenant.currency}${slip.totalDeductions.toLocaleString()}` : '০.০০'}
                      </td>

                      {/* Net Payable */}
                      <td className="py-3 px-4 text-right font-mono font-black text-slate-900 text-sm">
                        {tenant.currency}{slip.netPayable.toLocaleString()}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isPaid
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800 animate-pulse'
                          }`}
                        >
                          {isPaid ? '● পরিশোধিত' : '● অপেক্ষমান'}
                        </span>
                        <div className="text-[9px] text-slate-400 uppercase font-mono mt-0.5">
                          {slip.paymentMethod}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Print / View Slip */}
                          <button
                            onClick={() => setActiveSlipForPrint(slip)}
                            className="p-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 transition cursor-pointer"
                            title="অফিসিয়াল বেতন স্লিপ দেখুন ও প্রিন্ট করুন"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick Toggle Paid */}
                          {!isPaid && (
                            <button
                              onClick={() => onUpdateSlipStatus(slip.id, 'paid', 'cash')}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition cursor-pointer"
                              title="নগদে পরিশোধ সম্পন্ন মার্ক করুন"
                            >
                              পরিশোধ
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Salary Slip Modal */}
      {isGenerateSlipModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 md:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-bold text-sm text-white">মাসিক বেতন ও কমিশন স্লিপ প্রস্তুতকরণ</h3>
                  <p className="text-[11px] text-slate-300">হাজিরা, সেলস টার্গেট বোনাস ও কর্তন সমন্বয়</p>
                </div>
              </div>
              <button
                onClick={() => setIsGenerateSlipModalOpen(false)}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSalarySlip} className="p-5 md:p-6 overflow-y-auto space-y-4 text-xs">
              {/* Employee Selection */}
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">
                    কর্মচারী নির্বাচন করুন <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={selectedEmpId}
                    onChange={e => handleSelectEmployeeForSlip(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 outline-none"
                  >
                    <option value="">কর্মচারী বাছাই করুন...</option>
                    {tenantEmployees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.designation || emp.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">বেতনের মাস ও সাল</label>
                  <input
                    type="text"
                    value={selectedMonth}
                    onChange={e => setSelectedMonth(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-semibold outline-none"
                  />
                </div>
              </div>

              {/* Earnings Breakdown */}
              <div className="pt-2 border-t border-slate-100">
                <h4 className="font-bold text-slate-800 mb-2.5 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  উপার্জন অংশ (Earnings)
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1">মূল বেতন (Basic)</label>
                    <input
                      type="number"
                      required
                      value={genBasic}
                      onChange={e => setGenBasic(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">বাড়ি ভাড়া</label>
                    <input
                      type="number"
                      value={genHouseRent}
                      onChange={e => setGenHouseRent(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">যাতায়াত ভাতা</label>
                    <input
                      type="number"
                      value={genConveyance}
                      onChange={e => setGenConveyance(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">চিকিৎসা ভাতা</label>
                    <input
                      type="number"
                      value={genMedical}
                      onChange={e => setGenMedical(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Sales Commission & Overtime */}
              <div className="pt-2 border-t border-slate-100">
                <h4 className="font-bold text-slate-800 mb-2.5 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                  সেলস পারফরম্যান্স কমিশন ও ওভারটাইম
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1">চলতি মাসের বিক্রয়</label>
                    <input
                      type="number"
                      value={genSalesAchieved}
                      onChange={e => setGenSalesAchieved(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono font-bold text-purple-700"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">কমিশন রেট (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={genCommissionRate}
                      onChange={e => setGenCommissionRate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-purple-700"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">ওভারটাইম ঘণ্টা</label>
                    <input
                      type="number"
                      value={genOvertimeHours}
                      onChange={e => setGenOvertimeHours(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">প্রতি ঘণ্টা রেট</label>
                    <input
                      type="number"
                      value={genOvertimeRate}
                      onChange={e => setGenOvertimeRate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div className="pt-2 border-t border-slate-100">
                <h4 className="font-bold text-slate-800 mb-2.5 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                  কর্তনসমূহ (Deductions)
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1">অনুপস্থিতি জরিমানা</label>
                    <input
                      type="number"
                      value={genAbsentDeduction}
                      onChange={e => setGenAbsentDeduction(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-rose-600"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">অগ্রিম বেতন সমন্বয়</label>
                    <input
                      type="number"
                      value={genAdvanceDeduction}
                      onChange={e => setGenAdvanceDeduction(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-rose-600"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">প্রভিডেন্ট ফান্ড / ট্যাক্স</label>
                    <input
                      type="number"
                      value={genProvidentFund}
                      onChange={e => setGenProvidentFund(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-rose-600"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method & Total Calculation Preview */}
              <div className="p-4 bg-slate-900 text-white rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <span className="text-[10px] text-purple-300 uppercase block font-semibold">পেমেন্ট মাধ্যম</span>
                  <div className="flex gap-2 mt-1">
                    {(['cash', 'bkash', 'bank'] as const).map(m => (
                      <button
                        type="button"
                        key={m}
                        onClick={() => setGenPaymentMethod(m)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition cursor-pointer ${
                          genPaymentMethod === m
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {m === 'cash' ? 'নগদ (Cash)' : m === 'bkash' ? 'bKash বিকাশ' : 'ব্যাংক ট্রান্সফার'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-purple-300 uppercase block font-semibold">সর্বমোট প্রদেয় নিট বেতন</span>
                  <div className="text-2xl font-black font-mono text-emerald-400">
                    {tenant.currency}{Math.round(calcNetPayable()).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="pt-2 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsGenerateSlipModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={!selectedEmpId}
                  className="px-5 py-2 bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> স্লিপ তৈরি ও প্রিন্ট প্রিভিউ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Salary Slip Printable Modal */}
      <SalarySlipModal
        isOpen={!!activeSlipForPrint}
        onClose={() => setActiveSlipForPrint(null)}
        slip={activeSlipForPrint}
        tenant={tenant}
      />
    </div>
  );
};
