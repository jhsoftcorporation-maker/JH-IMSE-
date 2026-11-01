import React, { useState, useEffect } from 'react';
import { X, User, Phone, Mail, DollarSign, Award, Shield, MapPin, Building, Calendar, CheckCircle2 } from 'lucide-react';
import { Employee, EmployeeRole, Tenant, Warehouse } from '../../types';

interface AddStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (employeeData: Omit<Employee, 'id'>, existingId?: string) => void;
  employeeToEdit?: Employee | null;
  tenant: Tenant;
  warehouses: Warehouse[];
}

export const AddStaffModal: React.FC<AddStaffModalProps> = ({
  isOpen,
  onClose,
  onSave,
  employeeToEdit,
  tenant,
  warehouses,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [designation, setDesignation] = useState('');
  const [role, setRole] = useState<EmployeeRole>('cashier');
  const [warehouseId, setWarehouseId] = useState('');
  const [nid, setNid] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [address, setAddress] = useState('');
  const [salary, setSalary] = useState('');
  const [allowance, setAllowance] = useState('');
  const [salesTarget, setSalesTarget] = useState('');
  const [salesCommissionRate, setSalesCommissionRate] = useState('2.0');
  const [joinedDate, setJoinedDate] = useState(new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState<'active' | 'inactive' | 'on_leave'>('active');

  useEffect(() => {
    if (employeeToEdit) {
      setName(employeeToEdit.name);
      setPhone(employeeToEdit.phone);
      setEmail(employeeToEdit.email || '');
      setDesignation(employeeToEdit.designation || '');
      setRole(employeeToEdit.role);
      setWarehouseId(employeeToEdit.warehouseId || (warehouses[0]?.id || ''));
      setNid(employeeToEdit.nid || '');
      setEmergencyPhone(employeeToEdit.emergencyPhone || '');
      setAddress(employeeToEdit.address || '');
      setSalary(employeeToEdit.salary ? employeeToEdit.salary.toString() : '');
      setAllowance(employeeToEdit.allowance ? employeeToEdit.allowance.toString() : '0');
      setSalesTarget(employeeToEdit.salesTarget ? employeeToEdit.salesTarget.toString() : '0');
      setSalesCommissionRate(employeeToEdit.salesCommissionRate ? employeeToEdit.salesCommissionRate.toString() : '0');
      setJoinedDate(employeeToEdit.joinedDate || new Date().toISOString().slice(0, 10));
      setStatus(employeeToEdit.status || 'active');
    } else {
      setName('');
      setPhone('');
      setEmail('');
      setDesignation('কাউন্টার ক্যাশিয়ার ও সেলস');
      setRole('cashier');
      setWarehouseId(warehouses[0]?.id || '');
      setNid('');
      setEmergencyPhone('');
      setAddress('');
      setSalary('20000');
      setAllowance('3000');
      setSalesTarget('150000');
      setSalesCommissionRate('2.0');
      setJoinedDate(new Date().toISOString().slice(0, 10));
      setStatus('active');
    }
  }, [employeeToEdit, isOpen, warehouses]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const initials = name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0])
      .join('')
      .toUpperCase();

    const employeeData: Omit<Employee, 'id'> = {
      tenantId: tenant.id,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      designation: designation.trim() || 'কর্মকর্তা',
      role,
      warehouseId: warehouseId || undefined,
      nid: nid.trim() || undefined,
      emergencyPhone: emergencyPhone.trim() || undefined,
      address: address.trim() || undefined,
      salary: parseFloat(salary) || 0,
      allowance: parseFloat(allowance) || 0,
      salesTarget: parseFloat(salesTarget) || 0,
      salesCommissionRate: parseFloat(salesCommissionRate) || 0,
      salesThisMonth: employeeToEdit ? employeeToEdit.salesThisMonth : 0,
      attendanceToday: employeeToEdit ? employeeToEdit.attendanceToday : 'present',
      clockInTime: employeeToEdit ? employeeToEdit.clockInTime : '09:00 AM',
      clockOutTime: employeeToEdit ? employeeToEdit.clockOutTime : '',
      status,
      joinedDate,
      avatar: initials || 'ST',
    };

    onSave(employeeData, employeeToEdit?.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 md:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-purple-400" />
            <div>
              <h3 className="font-bold text-sm text-white">
                {employeeToEdit ? 'কর্মচারীর তথ্য সম্পাদনা করুন' : 'নতুন কর্মচারী / স্টাফ যোগ করুন'}
              </h3>
              <p className="text-[11px] text-slate-300">এইচআরএম প্রোফাইল, পদবী, পারিশ্রমিক ও সেলস কমিশন কনফিগারেশন</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 md:p-6 overflow-y-auto space-y-4 text-xs">
          {/* Basic Info */}
          <div>
            <h4 className="font-bold text-slate-800 mb-2.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-600"></span>
              মৌলিক ব্যক্তিগত তথ্য
            </h4>
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  কর্মচারীর নাম <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="যেমন: সুমন রায় / মো: রাসেল হোসেন"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">পদবী (Designation)</label>
                <input
                  type="text"
                  value={designation}
                  onChange={e => setDesignation(e.target.value)}
                  placeholder="যেমন: সিনিয়র ক্যাশিয়ার / ফার্মাসিস্ট"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  মোবাইল নম্বর <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+880 17XXXXXXXX"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">ইমেইল ঠিকানা</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="staff@business.com"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">জাতীয় পরিচয়পত্র (NID / Smart Card)</label>
                <input
                  type="text"
                  value={nid}
                  onChange={e => setNid(e.target.value)}
                  placeholder="১০ বা ১৭ ডিজিটের এনআইডি নম্বর"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">জরুরি যোগাযোগের ফোন (Emergency Contact)</label>
                <input
                  type="text"
                  value={emergencyPhone}
                  onChange={e => setEmergencyPhone(e.target.value)}
                  placeholder="অভিভাবক বা নিকটাত্মীয়ের নম্বর"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 outline-none font-mono"
                />
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-slate-600 font-semibold mb-1">বর্তমান ঠিকানা</label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="বাড়ি নং, রোড নং, এলাকা, থানা, জেলা"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 outline-none"
              />
            </div>
          </div>

          {/* Role & Branch Assignment */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="font-bold text-slate-800 mb-2.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
              সিস্টেম রোল ও ব্রাঞ্চ অ্যাসাইনমেন্ট
            </h4>
            <div className="grid md:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">সিস্টেম রোল (Role & Access)</label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value as EmployeeRole)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 outline-none"
                >
                  <option value="cashier">কাউন্টার ক্যাশিয়ার (POS Billing)</option>
                  <option value="manager">স্টোর / আউটলেট ম্যানেজার (Manager)</option>
                  <option value="accountant">অ্যাকাউন্ট্যান্ট (Accounts & Tax)</option>
                  <option value="auditor">স্টক ও গোডাউন অডিটর (Auditor)</option>
                  <option value="sales_rep">সেলস রিপ্রেজেন্টেটিভ (Sales Rep)</option>
                  <option value="owner">মালিক ও এডমিন (Owner)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">অ্যাসাইনকৃত শাখা / ওয়্যারহাউস</label>
                <select
                  value={warehouseId}
                  onChange={e => setWarehouseId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 outline-none"
                >
                  <option value="">সকল শাখা / কেন্দ্রীয়</option>
                  {warehouses.map(wh => (
                    <option key={wh.id} value={wh.id}>
                      {wh.name} {wh.isMain ? '(প্রধান আউটলেট)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">বর্তমান স্ট্যাটাস</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 outline-none"
                >
                  <option value="active">সক্রিয় (Active)</option>
                  <option value="on_leave">ছুটিতে আছে (On Leave)</option>
                  <option value="inactive">নিষ্ক্রিয় (Inactive)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Payroll, Targets & Commission */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="font-bold text-slate-800 mb-2.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              মাসিক বেতন, সেলস টার্গেট ও কমিশন ইঞ্জিন
            </h4>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  মূল বেতন (Basic) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">{tenant.currency}</span>
                  <input
                    type="number"
                    required
                    value={salary}
                    onChange={e => setSalary(e.target.value)}
                    placeholder="20000"
                    className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 outline-none font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">অন্যান্য ভাতা (Allowances)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">{tenant.currency}</span>
                  <input
                    type="number"
                    value={allowance}
                    onChange={e => setAllowance(e.target.value)}
                    placeholder="3000"
                    className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">মাসিক সেলস টার্গেট</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">{tenant.currency}</span>
                  <input
                    type="number"
                    value={salesTarget}
                    onChange={e => setSalesTarget(e.target.value)}
                    placeholder="150000"
                    className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">বিক্রয় কমিশন রেট (%)</label>
                <div className="relative">
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                  <input
                    type="number"
                    step="0.1"
                    value={salesCommissionRate}
                    onChange={e => setSalesCommissionRate(e.target.value)}
                    placeholder="2.0"
                    className="w-full pl-3 pr-8 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 outline-none font-mono font-bold text-emerald-700"
                  />
                </div>
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-slate-600 font-semibold mb-1">যোগদানের তারিখ</label>
              <input
                type="date"
                value={joinedDate}
                onChange={e => setJoinedDate(e.target.value)}
                className="w-full md:w-56 px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 outline-none"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-200 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold transition cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              {employeeToEdit ? 'আপডেট সংরক্ষণ করুন' : 'কর্মচারী যুক্ত করুন'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
