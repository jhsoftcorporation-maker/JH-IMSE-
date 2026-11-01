import React, { useState } from 'react';
import { 
  Users, UserCheck, ShieldCheck, DollarSign, Award, 
  Calendar, Clock, CheckCircle2, Building2, ChevronRight
} from 'lucide-react';
import { AttendanceRecord, Employee, RolePermission, SalarySlip, Tenant, Warehouse } from '../../types';
import { StaffDirectory } from './StaffDirectory';
import { AttendanceTracker } from './AttendanceTracker';
import { RolePermissionMatrix } from './RolePermissionMatrix';
import { PayrollAndCommission } from './PayrollAndCommission';

interface HRMManagerProps {
  tenant: Tenant;
  employees: Employee[];
  warehouses: Warehouse[];
  attendanceRecords: AttendanceRecord[];
  rolePermissions: RolePermission[];
  salarySlips: SalarySlip[];
  onSaveEmployee: (employeeData: Omit<Employee, 'id'>, existingId?: string) => void;
  onDeleteEmployee?: (employeeId: string) => void;
  onUpdateAttendanceRecord: (record: AttendanceRecord) => void;
  onBulkMarkAttendance?: (records: AttendanceRecord[]) => void;
  onUpdateRolePermissions: (roles: RolePermission[]) => void;
  onAddSalarySlip: (slip: SalarySlip) => void;
  onUpdateSlipStatus: (slipId: string, status: 'paid' | 'pending', method?: 'cash' | 'bkash' | 'bank') => void;
}

export const HRMManager: React.FC<HRMManagerProps> = ({
  tenant,
  employees,
  warehouses,
  attendanceRecords,
  rolePermissions,
  salarySlips,
  onSaveEmployee,
  onDeleteEmployee,
  onUpdateAttendanceRecord,
  onBulkMarkAttendance,
  onUpdateRolePermissions,
  onAddSalarySlip,
  onUpdateSlipStatus,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'staff' | 'attendance' | 'roles' | 'payroll'>('staff');

  // Tenant-specific counts
  const tenantEmployees = employees.filter(e => e.tenantId === tenant.id);
  const presentToday = tenantEmployees.filter(e => e.attendanceToday === 'present').length;
  const totalMonthlyPayroll = tenantEmployees.reduce((acc, e) => acc + (e.salary || 0) + (e.allowance || 0), 0);
  const totalSalesThisMonth = tenantEmployees.reduce((acc, e) => acc + (e.salesThisMonth || 0), 0);

  // Helper when clicking "Pay Slip" from Staff directory
  const handleOpenPayrollForStaff = (emp: Employee) => {
    setActiveSubTab('payroll');
  };

  const handleQuickMarkAttendance = (employeeId: string, status: Employee['attendanceToday']) => {
    const today = new Date().toISOString().slice(0, 10);
    const emp = tenantEmployees.find(e => e.id === employeeId);
    if (!emp) return;

    const record: AttendanceRecord = {
      id: `att-${today}-${employeeId}`,
      tenantId: tenant.id,
      employeeId,
      employeeName: emp.name,
      designation: emp.designation,
      date: today,
      status,
      clockIn: status === 'present' ? '09:00 AM' : '',
      workingHours: status === 'present' ? 8 : 0,
      overtimeHours: 0,
    };
    onUpdateAttendanceRecord(record);
  };

  return (
    <div className="space-y-5">
      {/* Module Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-100 text-purple-700">
              <Users className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">
                HRM, কর্মকর্তা-কর্মচারী উপস্থিতি ও সেলস কমিশন হাব
              </h2>
              <p className="text-xs text-slate-500">
                {tenant.name} • বায়োমেট্রিক/ডিজিটাল হাজিরা, আরব্যাক (RBAC) অনুমতি ও অফিশিয়াল পে-স্লিপ
              </p>
            </div>
          </div>
        </div>

        {/* Quick Header Indicators */}
        <div className="flex items-center gap-2 text-xs">
          <div className="px-3 py-1.5 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-slate-600 font-medium">আজকের উপস্থিতি:</span>
            <strong className="text-slate-900 font-mono">{presentToday}/{tenantEmployees.length} জন</strong>
          </div>
        </div>
      </div>

      {/* HRM Sub Navigation Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-2xs">
        <button
          onClick={() => setActiveSubTab('staff')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeSubTab === 'staff'
              ? 'bg-purple-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>কর্মচারী ডিরেক্টরি ও প্রোফাইল</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
            activeSubTab === 'staff' ? 'bg-purple-700 text-purple-200' : 'bg-slate-100 text-slate-600'
          }`}>
            {tenantEmployees.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('attendance')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeSubTab === 'attendance'
              ? 'bg-purple-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>দৈনিক ডিজিটাল হাজিরা ট্র্যাকার</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
            activeSubTab === 'attendance' ? 'bg-purple-700 text-purple-200' : 'bg-slate-100 text-slate-600'
          }`}>
            {presentToday} উপস্থিত
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('roles')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeSubTab === 'roles'
              ? 'bg-purple-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>রোল ও পারমিশন ম্যাট্রিক্স (RBAC)</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
            activeSubTab === 'roles' ? 'bg-purple-700 text-purple-200' : 'bg-slate-100 text-slate-600'
          }`}>
            {rolePermissions.length} টি রোল
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('payroll')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeSubTab === 'payroll'
              ? 'bg-purple-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>সেলস টার্গেট, কমিশন ও পে-স্লিপ</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
            activeSubTab === 'payroll' ? 'bg-purple-700 text-purple-200' : 'bg-slate-100 text-slate-600'
          }`}>
            {salarySlips.filter(s => s.tenantId === tenant.id).length} স্লিপ
          </span>
        </button>
      </div>

      {/* Sub Tab Views */}
      <div>
        {activeSubTab === 'staff' && (
          <StaffDirectory
            employees={employees}
            tenant={tenant}
            warehouses={warehouses}
            onSaveEmployee={onSaveEmployee}
            onDeleteEmployee={onDeleteEmployee}
            onOpenPayrollForStaff={handleOpenPayrollForStaff}
            onQuickMarkAttendance={handleQuickMarkAttendance}
          />
        )}

        {activeSubTab === 'attendance' && (
          <AttendanceTracker
            employees={employees}
            attendanceRecords={attendanceRecords}
            tenant={tenant}
            warehouses={warehouses}
            onUpdateAttendanceRecord={onUpdateAttendanceRecord}
            onBulkMarkAttendance={onBulkMarkAttendance}
          />
        )}

        {activeSubTab === 'roles' && (
          <RolePermissionMatrix
            rolePermissions={rolePermissions}
            onUpdateRolePermissions={onUpdateRolePermissions}
          />
        )}

        {activeSubTab === 'payroll' && (
          <PayrollAndCommission
            employees={employees}
            salarySlips={salarySlips}
            tenant={tenant}
            warehouses={warehouses}
            onAddSalarySlip={onAddSalarySlip}
            onUpdateSlipStatus={onUpdateSlipStatus}
          />
        )}
      </div>
    </div>
  );
};
