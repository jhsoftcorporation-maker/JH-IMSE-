import React, { useState, useMemo } from 'react';
import { 
  Users, UserPlus, Search, Filter, Phone, Mail, MapPin, 
  DollarSign, Award, Shield, CheckCircle2, Clock, Calendar, 
  Building2, Edit3, Trash2, ArrowUpRight, FileText, Check, AlertCircle
} from 'lucide-react';
import { Employee, EmployeeRole, Tenant, Warehouse } from '../../types';
import { AddStaffModal } from './AddStaffModal';

interface StaffDirectoryProps {
  employees: Employee[];
  tenant: Tenant;
  warehouses: Warehouse[];
  onSaveEmployee: (emp: Omit<Employee, 'id'>, existingId?: string) => void;
  onDeleteEmployee?: (employeeId: string) => void;
  onOpenPayrollForStaff: (employee: Employee) => void;
  onQuickMarkAttendance: (employeeId: string, status: Employee['attendanceToday']) => void;
}

export const StaffDirectory: React.FC<StaffDirectoryProps> = ({
  employees,
  tenant,
  warehouses,
  onSaveEmployee,
  onDeleteEmployee,
  onOpenPayrollForStaff,
  onQuickMarkAttendance,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'on_leave'>('all');
  const [warehouseFilter, setWarehouseFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);

  // Filter employees for current tenant
  const tenantEmployees = useMemo(() => {
    return employees.filter(e => e.tenantId === tenant.id);
  }, [employees, tenant.id]);

  const filteredEmployees = useMemo(() => {
    return tenantEmployees.filter(emp => {
      const matchSearch =
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.phone.includes(searchQuery) ||
        (emp.designation && emp.designation.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (emp.email && emp.email.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchRole = roleFilter === 'all' || emp.role === roleFilter;
      const matchStatus = statusFilter === 'all' || (emp.status || 'active') === statusFilter;
      const matchWarehouse = warehouseFilter === 'all' || emp.warehouseId === warehouseFilter;

      return matchSearch && matchRole && matchStatus && matchWarehouse;
    });
  }, [tenantEmployees, searchQuery, roleFilter, statusFilter, warehouseFilter]);

  // Statistics
  const totalStaff = tenantEmployees.length;
  const activeStaff = tenantEmployees.filter(e => (e.status || 'active') === 'active').length;
  const totalMonthlyPayroll = tenantEmployees.reduce((acc, e) => acc + (e.salary || 0) + (e.allowance || 0), 0);
  const totalSalesThisMonth = tenantEmployees.reduce((acc, e) => acc + (e.salesThisMonth || 0), 0);

  const getRoleBadge = (role: EmployeeRole) => {
    switch (role) {
      case 'owner':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">মালিক / এডমিন</span>;
      case 'manager':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-200">ম্যানেজার</span>;
      case 'cashier':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-200">কাউন্টার ক্যাশিয়ার</span>;
      case 'accountant':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">অ্যাকাউন্ট্যান্ট</span>;
      case 'auditor':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-900 border border-orange-200">স্টক অডিটর</span>;
      case 'sales_rep':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-900 border border-indigo-200">সেলস অফিসার</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">{role}</span>;
    }
  };

  const getAttendanceBadge = (status: Employee['attendanceToday']) => {
    switch (status) {
      case 'present':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">● উপস্থিত</span>;
      case 'late':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">● দেরিতে উপস্থিতি</span>;
      case 'half_day':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">● অর্ধদিবস</span>;
      case 'on_leave':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">● ছুটিতে আছে</span>;
      case 'absent':
      default:
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">● অনুপস্থিত</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">মোট কর্মকর্তা ও স্টাফ</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">{totalStaff} জন</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-0.5">
            সক্রিয় কর্মী: {activeStaff} জন
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">মাসিক মূল বেতন বাজেট</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {tenant.currency}{totalMonthlyPayroll.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">ভাতা ও কমিশন ব্যতীত</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">চলতি মাসের স্টাফ সেলস</span>
            <Award className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-700 font-mono">
            {tenant.currency}{totalSalesThisMonth.toLocaleString()}
          </div>
          <div className="text-[11px] text-purple-600 font-medium mt-0.5">কাউন্টার ও ফিল্ড সেলস</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">শাখা / ওয়্যারহাউস</span>
            <Building2 className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">{warehouses.length} টি</div>
          <div className="text-[11px] text-slate-400 mt-0.5">স্টাফ বিন্যাস সম্পন্ন</div>
        </div>
      </div>

      {/* Action Bar & Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="font-bold text-sm text-slate-900">কর্মচারী ডিরেক্টরি ও পদবী তালিকা</h3>
            <p className="text-xs text-slate-500">স্টাফদের মৌলিক তথ্য, বেতন কাঠামো, ব্রাঞ্চ ও কাজের অনুমতি নিয়ন্ত্রণ</p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                setEmployeeToEdit(null);
                setIsAddModalOpen(true);
              }}
              className="w-full sm:w-auto px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
            >
              <UserPlus className="w-4 h-4" /> নতুন স্টাফ যুক্ত করুন
            </button>
          </div>
        </div>

        {/* Filter Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Bar */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="নাম, ফোন বা পদবী দিয়ে খুঁজুন..."
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 outline-none"
              />
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none"
            >
              <option value="all">সকল পদবী / রোল</option>
              <option value="cashier">ক্যাশিয়ার (POS)</option>
              <option value="manager">স্টোর ম্যানেজার</option>
              <option value="accountant">অ্যাকাউন্ট্যান্ট</option>
              <option value="auditor">স্টক অডিটর</option>
              <option value="sales_rep">সেলস অফিসার</option>
              <option value="owner">মালিক ও এডমিন</option>
            </select>

            {/* Branch Filter */}
            <select
              value={warehouseFilter}
              onChange={e => setWarehouseFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none"
            >
              <option value="all">সকল শাখা / গোডাউন</option>
              {warehouses.map(wh => (
                <option key={wh.id} value={wh.id}>{wh.name}</option>
              ))}
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded-md font-semibold transition cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              তালিকা ভিউ
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1 rounded-md font-semibold transition cursor-pointer ${
                viewMode === 'cards' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              কার্ড ভিউ
            </button>
          </div>
        </div>
      </div>

      {/* Directory Content */}
      {filteredEmployees.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-200 shadow-2xs">
          <Users className="w-12 h-12 mx-auto text-slate-300 mb-2" />
          <h4 className="font-bold text-slate-700 text-sm">কোনো কর্মচারীর তথ্য পাওয়া যায়নি</h4>
          <p className="text-xs text-slate-400 mt-1">অনুসন্ধান ফিল্টার পরিবর্তন করুন অথবা নতুন কর্মী যুক্ত করুন</p>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="py-3 px-4">কর্মচারীর নাম ও পরিচিতি</th>
                  <th className="py-3 px-4">পদবী ও দায়িত্ব</th>
                  <th className="py-3 px-4">শাখা / ওয়্যারহাউস</th>
                  <th className="py-3 px-4 text-right">মূল বেতন + ভাতা</th>
                  <th className="py-3 px-4 text-right">চলতি মাসের সেলস</th>
                  <th className="py-3 px-4 text-center">আজকের হাজিরা</th>
                  <th className="py-3 px-4 text-center">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEmployees.map(emp => {
                  const wh = warehouses.find(w => w.id === emp.warehouseId);
                  const target = emp.salesTarget || 0;
                  const targetPct = target > 0 ? Math.min(100, Math.round((emp.salesThisMonth / target) * 100)) : 0;

                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/80 transition">
                      {/* Name & Contact */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 font-black flex items-center justify-center text-xs shrink-0 border border-purple-200">
                            {emp.avatar || emp.name.slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                              <span>{emp.name}</span>
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2 mt-0.5">
                              <span>{emp.phone}</span>
                              {emp.email && <span className="text-slate-400 font-sans">• {emp.email}</span>}
                            </div>
                            {emp.nid && (
                              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                NID: {emp.nid}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Role & Designation */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{emp.designation || 'কর্মকর্তা'}</div>
                        <div className="mt-1">{getRoleBadge(emp.role)}</div>
                      </td>

                      {/* Warehouse / Branch */}
                      <td className="py-3 px-4 text-slate-600">
                        <div className="flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{wh ? wh.name : 'কেন্দ্রীয় শাখা'}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          যোগদান: {emp.joinedDate}
                        </div>
                      </td>

                      {/* Salary & Allowances */}
                      <td className="py-3 px-4 text-right">
                        <div className="font-mono font-bold text-slate-900">
                          {tenant.currency}{(emp.salary + (emp.allowance || 0)).toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          মূল: {tenant.currency}{emp.salary.toLocaleString()}
                          {emp.allowance ? ` + ভাতা: ৳${emp.allowance}` : ''}
                        </div>
                      </td>

                      {/* Monthly Sales & Target */}
                      <td className="py-3 px-4 text-right">
                        {target > 0 ? (
                          <div>
                            <div className="font-mono font-extrabold text-purple-700">
                              {tenant.currency}{emp.salesThisMonth.toLocaleString()}
                            </div>
                            <div className="w-24 ml-auto bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  targetPct >= 100 ? 'bg-emerald-500' : 'bg-purple-600'
                                }`}
                                style={{ width: `${targetPct}%` }}
                              ></div>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {targetPct}% অর্জিত (কমিশন: {emp.salesCommissionRate}%)
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">—</span>
                        )}
                      </td>

                      {/* Attendance Status */}
                      <td className="py-3 px-4 text-center">
                        <div>{getAttendanceBadge(emp.attendanceToday)}</div>
                        {emp.clockInTime && (
                          <div className="text-[10px] text-slate-500 font-mono mt-1">
                            ইন: {emp.clockInTime}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onOpenPayrollForStaff(emp)}
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition cursor-pointer"
                            title="বেতন স্লিপ ও কমিশন ভাউচার"
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setEmployeeToEdit(emp);
                              setIsAddModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                            title="তথ্য ও পারিশ্রমিক সম্পাদনা"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARDS VIEW */
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map(emp => {
            const wh = warehouses.find(w => w.id === emp.warehouseId);
            const target = emp.salesTarget || 0;
            const targetPct = target > 0 ? Math.min(100, Math.round((emp.salesThisMonth / target) * 100)) : 0;
            const commission = emp.salesThisMonth * (emp.salesCommissionRate / 100);

            return (
              <div key={emp.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4 hover:shadow-md transition">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 text-white font-black flex items-center justify-center text-sm shadow-xs">
                      {emp.avatar || emp.name.slice(0, 2)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{emp.name}</h4>
                      <p className="text-xs text-slate-500 font-medium">{emp.designation || 'কর্মকর্তা'}</p>
                    </div>
                  </div>
                  <div>{getAttendanceBadge(emp.attendanceToday)}</div>
                </div>

                <div className="flex items-center gap-2">
                  {getRoleBadge(emp.role)}
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-slate-400" />
                    {wh ? wh.name : 'কেন্দ্রীয় আউটলেট'}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs">
                  <div className="flex justify-between items-center text-slate-600">
                    <span>মূল মাসিক বেতন:</span>
                    <strong className="text-slate-900 font-mono">{tenant.currency}{emp.salary.toLocaleString()}</strong>
                  </div>
                  {emp.allowance ? (
                    <div className="flex justify-between items-center text-slate-600">
                      <span>মাসিক অন্যান্য ভাতা:</span>
                      <span className="font-mono text-slate-700">{tenant.currency}{emp.allowance.toLocaleString()}</span>
                    </div>
                  ) : null}
                  {target > 0 && (
                    <div className="pt-1.5 border-t border-slate-200">
                      <div className="flex justify-between items-center text-slate-600">
                        <span>বিক্রয় টার্গেট ও অর্জন:</span>
                        <span className="font-bold font-mono text-purple-700">
                          {tenant.currency}{emp.salesThisMonth.toLocaleString()} / {tenant.currency}{target.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${targetPct >= 100 ? 'bg-emerald-500' : 'bg-purple-600'}`}
                          style={{ width: `${targetPct}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                        <span>{targetPct}% সম্পন্ন</span>
                        <span className="text-emerald-700 font-bold">কমিশন: ৳{commission.toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-500 text-[11px]">{emp.phone}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onOpenPayrollForStaff(emp)}
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <DollarSign className="w-3.5 h-3.5" /> বেতন স্লিপ
                    </button>
                    <button
                      onClick={() => {
                        setEmployeeToEdit(emp);
                        setIsAddModalOpen(true);
                      }}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition cursor-pointer"
                      title="এডিট করুন"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Staff Modal */}
      <AddStaffModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEmployeeToEdit(null);
        }}
        onSave={onSaveEmployee}
        employeeToEdit={employeeToEdit}
        tenant={tenant}
        warehouses={warehouses}
      />
    </div>
  );
};
