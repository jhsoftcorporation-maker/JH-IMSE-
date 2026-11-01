import React, { useState, useMemo } from 'react';
import { 
  Calendar, Clock, CheckCircle2, XCircle, AlertCircle, 
  UserCheck, Users, Search, Filter, ArrowRight, Save, RotateCcw,
  Sparkles, Check, ChevronLeft, ChevronRight, Moon, Sun
} from 'lucide-react';
import { AttendanceRecord, AttendanceStatus, Employee, Tenant, Warehouse } from '../../types';

interface AttendanceTrackerProps {
  employees: Employee[];
  attendanceRecords: AttendanceRecord[];
  tenant: Tenant;
  warehouses: Warehouse[];
  onUpdateAttendanceRecord: (record: AttendanceRecord) => void;
  onBulkMarkAttendance?: (records: AttendanceRecord[]) => void;
}

export const AttendanceTracker: React.FC<AttendanceTrackerProps> = ({
  employees,
  attendanceRecords,
  tenant,
  warehouses,
  onUpdateAttendanceRecord,
  onBulkMarkAttendance,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-25');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [warehouseFilter, setWarehouseFilter] = useState<string>('all');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Tenant's employees
  const tenantEmployees = useMemo(() => {
    return employees.filter(e => e.tenantId === tenant.id);
  }, [employees, tenant.id]);

  // Existing records for the selected date
  const dateRecords = useMemo(() => {
    return attendanceRecords.filter(r => r.tenantId === tenant.id && r.date === selectedDate);
  }, [attendanceRecords, tenant.id, selectedDate]);

  // Combine employees with their record for the selected date
  const combinedAttendance = useMemo(() => {
    return tenantEmployees.map(emp => {
      const existing = dateRecords.find(r => r.employeeId === emp.id);
      if (existing) {
        return existing;
      }
      // If no record exists yet for this date, provide a default initialized state
      const defaultRecord: AttendanceRecord = {
        id: `att-${selectedDate}-${emp.id}`,
        tenantId: tenant.id,
        employeeId: emp.id,
        employeeName: emp.name,
        designation: emp.designation,
        date: selectedDate,
        status: emp.attendanceToday || 'present',
        clockIn: emp.clockInTime || '09:00 AM',
        clockOut: emp.clockOutTime || '',
        workingHours: 8,
        overtimeHours: 0,
        notes: '',
      };
      return defaultRecord;
    });
  }, [tenantEmployees, dateRecords, selectedDate, tenant.id]);

  // Filtered list
  const filteredAttendance = useMemo(() => {
    return combinedAttendance.filter(item => {
      const matchSearch =
        item.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.designation && item.designation.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchStatus = statusFilter === 'all' || item.status === statusFilter;
      
      const emp = tenantEmployees.find(e => e.id === item.employeeId);
      const matchWarehouse = warehouseFilter === 'all' || (emp && emp.warehouseId === warehouseFilter);

      return matchSearch && matchStatus && matchWarehouse;
    });
  }, [combinedAttendance, searchQuery, statusFilter, warehouseFilter, tenantEmployees]);

  // Attendance stats for selected date
  const totalEmployees = combinedAttendance.length;
  const presentCount = combinedAttendance.filter(r => r.status === 'present').length;
  const lateCount = combinedAttendance.filter(r => r.status === 'late').length;
  const leaveCount = combinedAttendance.filter(r => r.status === 'on_leave' || r.status === 'half_day').length;
  const absentCount = combinedAttendance.filter(r => r.status === 'absent').length;
  const attendanceRate = totalEmployees > 0 ? Math.round(((presentCount + lateCount) / totalEmployees) * 100) : 0;

  const showNotification = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // Status changer
  const handleStatusChange = (item: AttendanceRecord, newStatus: AttendanceStatus) => {
    const updated: AttendanceRecord = {
      ...item,
      status: newStatus,
      clockIn: newStatus === 'absent' || newStatus === 'on_leave' ? '' : item.clockIn || '09:00 AM',
      workingHours: newStatus === 'absent' || newStatus === 'on_leave' ? 0 : newStatus === 'half_day' ? 4 : 8,
    };
    onUpdateAttendanceRecord(updated);
    showNotification(`${item.employeeName} এর স্ট্যাটাস '${newStatus}' আপডেট হয়েছে`);
  };

  // Quick clock in right now
  const handleClockInNow = (item: AttendanceRecord) => {
    const nowTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const updated: AttendanceRecord = {
      ...item,
      status: 'present',
      clockIn: nowTime,
    };
    onUpdateAttendanceRecord(updated);
    showNotification(`${item.employeeName} ক্লক-ইন সম্পন্ন: ${nowTime}`);
  };

  // Quick clock out right now
  const handleClockOutNow = (item: AttendanceRecord) => {
    const nowTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const updated: AttendanceRecord = {
      ...item,
      clockOut: nowTime,
      workingHours: 9,
      overtimeHours: 1,
    };
    onUpdateAttendanceRecord(updated);
    showNotification(`${item.employeeName} ক্লক-আউট সম্পন্ন: ${nowTime}`);
  };

  // Mark all present
  const handleMarkAllPresent = () => {
    const updatedAll = combinedAttendance.map(item => ({
      ...item,
      status: 'present' as AttendanceStatus,
      clockIn: item.clockIn || '09:00 AM',
      workingHours: 8,
    }));
    if (onBulkMarkAttendance) {
      onBulkMarkAttendance(updatedAll);
    } else {
      updatedAll.forEach(rec => onUpdateAttendanceRecord(rec));
    }
    showNotification('সকল কর্মচারীকে আজকের জন্য উপস্থিত মার্ক করা হয়েছে!');
  };

  return (
    <div className="space-y-4">
      {/* Toast */}
      {successToast && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs border border-purple-500/30 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">উপস্থিতির হার</span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600 font-mono">{attendanceRate}%</div>
          <div className="text-[11px] text-slate-400 mt-0.5">আজকের গড় উপস্থিতি</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">উপস্থিত (Present)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">{presentCount} জন</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-0.5">সময়মত উপস্থিত</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">দেরিতে উপস্থিতি</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700 font-mono">{lateCount} জন</div>
          <div className="text-[11px] text-amber-600 mt-0.5">নির্ধারিত সময়ের পরে</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">অনুমোদিত ছুটি</span>
            <Moon className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-indigo-700 font-mono">{leaveCount} জন</div>
          <div className="text-[11px] text-indigo-600 mt-0.5">লিভ ও হাফ-ডে</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">অনুপস্থিত (Absent)</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-700 font-mono">{absentCount} জন</div>
          <div className="text-[11px] text-rose-600 mt-0.5">বিনা অনুমতিতে অনুপস্থিত</div>
        </div>
      </div>

      {/* Date Header & Action Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-700" />
              দৈনিক কর্মকর্তা ও কর্মচারী ডিজিটাল হাজিরা রেজিস্টার
            </h3>
            <p className="text-xs text-slate-500">তারিখ অনুযায়ী ক্লক-ইন, ক্লক-আউট এবং ওভারটাইম লগ পর্যবেক্ষণ</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Date Selector */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="px-2.5 py-1 text-xs font-bold text-slate-800 bg-white rounded-lg border border-slate-200 shadow-2xs outline-none"
              />
            </div>

            {/* Mark All Present Button */}
            <button
              onClick={handleMarkAllPresent}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Check className="w-4 h-4" /> সকলকে উপস্থিত মার্ক করুন
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="কর্মচারীর নাম দিয়ে খুঁজুন..."
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 outline-none"
              />
            </div>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none"
            >
              <option value="all">সকল হাজিরার অবস্থা</option>
              <option value="present">উপস্থিত (Present)</option>
              <option value="late">দেরি (Late)</option>
              <option value="half_day">অর্ধদিবস (Half Day)</option>
              <option value="on_leave">ছুটি (On Leave)</option>
              <option value="absent">অনুপস্থিত (Absent)</option>
            </select>

            <select
              value={warehouseFilter}
              onChange={e => setWarehouseFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none"
            >
              <option value="all">সকল শাখা</option>
              {warehouses.map(wh => (
                <option key={wh.id} value={wh.id}>{wh.name}</option>
              ))}
            </select>
          </div>

          <div className="text-xs text-slate-500">
            তারিখ: <strong>{selectedDate}</strong> • মোট: <strong>{filteredAttendance.length}</strong> জন স্টাফ
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11px]">
              <tr>
                <th className="py-3 px-4">কর্মচারী ও পদবী</th>
                <th className="py-3 px-4 text-center">হাজিরার স্ট্যাটাস</th>
                <th className="py-3 px-4 text-center">ক্লক-ইন (Clock In)</th>
                <th className="py-3 px-4 text-center">ক্লক-আউট (Clock Out)</th>
                <th className="py-3 px-4 text-center">কাজের সময়</th>
                <th className="py-3 px-4 text-center">ওভারটাইম</th>
                <th className="py-3 px-4">মন্তব্য / নোট</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAttendance.map(item => {
                const emp = tenantEmployees.find(e => e.id === item.employeeId);
                const isAbsentOrLeave = item.status === 'absent' || item.status === 'on_leave';

                return (
                  <tr key={item.id || item.employeeId} className="hover:bg-slate-50/80 transition">
                    {/* Name & Designation */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-xs">{item.employeeName}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {item.designation || emp?.designation || 'স্টাফ'}
                      </div>
                      {emp && (
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {emp.phone}
                        </div>
                      )}
                    </td>

                    {/* Status Pill Selectors */}
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex p-1 bg-slate-100 rounded-xl gap-1">
                        <button
                          onClick={() => handleStatusChange(item, 'present')}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                            item.status === 'present'
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          উপস্থিত
                        </button>
                        <button
                          onClick={() => handleStatusChange(item, 'late')}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                            item.status === 'late'
                              ? 'bg-amber-600 text-white shadow-2xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          দেরি
                        </button>
                        <button
                          onClick={() => handleStatusChange(item, 'half_day')}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                            item.status === 'half_day'
                              ? 'bg-blue-600 text-white shadow-2xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          অর্ধদিবস
                        </button>
                        <button
                          onClick={() => handleStatusChange(item, 'on_leave')}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                            item.status === 'on_leave'
                              ? 'bg-indigo-600 text-white shadow-2xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          ছুটি
                        </button>
                        <button
                          onClick={() => handleStatusChange(item, 'absent')}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                            item.status === 'absent'
                              ? 'bg-rose-600 text-white shadow-2xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          অনুপস্থিত
                        </button>
                      </div>
                    </td>

                    {/* Clock In */}
                    <td className="py-3 px-4 text-center">
                      {isAbsentOrLeave ? (
                        <span className="text-slate-400 font-mono text-xs">—</span>
                      ) : item.clockIn ? (
                        <div className="font-mono font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg inline-block text-[11px]">
                          {item.clockIn}
                        </div>
                      ) : (
                        <button
                          onClick={() => handleClockInNow(item)}
                          className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold rounded-lg text-[11px] transition cursor-pointer"
                        >
                          + ক্লক-ইন
                        </button>
                      )}
                    </td>

                    {/* Clock Out */}
                    <td className="py-3 px-4 text-center">
                      {isAbsentOrLeave ? (
                        <span className="text-slate-400 font-mono text-xs">—</span>
                      ) : item.clockOut ? (
                        <div className="font-mono font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg inline-block text-[11px]">
                          {item.clockOut}
                        </div>
                      ) : (
                        <button
                          onClick={() => handleClockOutNow(item)}
                          className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold rounded-lg text-[11px] transition cursor-pointer"
                        >
                          + ক্লক-আউট
                        </button>
                      )}
                    </td>

                    {/* Working Hours */}
                    <td className="py-3 px-4 text-center font-mono">
                      {isAbsentOrLeave ? (
                        <span className="text-slate-400">০ ঘণ্টা</span>
                      ) : (
                        <span className="font-bold text-slate-700">{item.workingHours || 8} ঘণ্টা</span>
                      )}
                    </td>

                    {/* Overtime */}
                    <td className="py-3 px-4 text-center font-mono">
                      {(item.overtimeHours || 0) > 0 ? (
                        <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                          +{item.overtimeHours} ঘণ্টা
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">০</span>
                      )}
                    </td>

                    {/* Notes */}
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        value={item.notes || ''}
                        onChange={e => {
                          const updated = { ...item, notes: e.target.value };
                          onUpdateAttendanceRecord(updated);
                        }}
                        placeholder="মন্তব্য লিখুন..."
                        className="w-full px-2.5 py-1 text-[11px] border border-slate-200 rounded-lg focus:outline-none focus:border-purple-600"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
