import React, { useState } from 'react';
import { X, Calendar, Clock, User, Phone, MapPin, DollarSign, CheckCircle2 } from 'lucide-react';
import { AppointmentBooking, BookingServiceType, BookingPaymentStatus, BookingLocationType, Customer, Employee } from '../../types';

interface CreateBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (booking: Omit<AppointmentBooking, 'id' | 'createdAt'>) => void;
  customers: Customer[];
  employees: Employee[];
  currency?: string;
}

export const CreateBookingModal: React.FC<CreateBookingModalProps> = ({
  isOpen,
  onClose,
  onSave,
  customers,
  employees,
  currency = '৳',
}) => {
  const [bookingNumber, setBookingNumber] = useState(`BKG-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [serviceType, setServiceType] = useState<BookingServiceType>('consultation');
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().slice(0, 10));
  const [timeSlot, setTimeSlot] = useState('10:30 AM - 11:30 AM');
  const [assignedStaffId, setAssignedStaffId] = useState(employees[0]?.id || '');
  const [locationType, setLocationType] = useState<BookingLocationType>('in_store');
  const [locationDetails, setLocationDetails] = useState('ক্যাবিন ১, কনসালটেশন চেম্বার');
  const [fee, setFee] = useState<number>(1000);
  const [paymentStatus, setPaymentStatus] = useState<BookingPaymentStatus>('pending');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSelectCustomer = (custId: string) => {
    setSelectedCustomerId(custId);
    const found = customers.find(c => c.id === custId);
    if (found) {
      setCustomerName(found.name);
      setCustomerPhone(found.phone);
      setCustomerEmail(found.email || '');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) return;

    const assignedStaff = employees.find(e => e.id === assignedStaffId);
    const assignedStaffName = assignedStaff ? `${assignedStaff.name} (${assignedStaff.designation})` : 'Assigned Specialist';

    onSave({
      bookingNumber,
      tenantId: '',
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim(),
      customerId: selectedCustomerId || undefined,
      serviceType,
      bookingDate,
      timeSlot,
      assignedStaffName,
      assignedStaffId,
      locationType,
      locationDetails: locationDetails.trim(),
      fee: Number(fee) || 0,
      paymentStatus,
      status: 'confirmed',
      notes: notes.trim(),
      smsReminderSent: false,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto bg-white rounded-2xl shadow-2xl flex flex-col border border-slate-100">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">নতুন বুকিং / অ্যাপয়েন্টমেন্ট শিডিউল</h2>
              <p className="text-xs text-slate-500">গ্রাহকের ভিজিট, কনসাল্টেশন বা অন-সাইট সার্ভিস স্লট বুক করুন</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-slate-700">সার্ভিসের ধরন (Service Type) *</label>
              <select
                value={serviceType}
                onChange={e => setServiceType(e.target.value as BookingServiceType)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="consultation">ফার্মাসিউটিক্যাল / ক্লিনিক্যাল কনসালটেশন (Consultation)</option>
                <option value="installation">ডিভাইস ও যন্ত্রপাতি ইনস্টলেশন (Installation)</option>
                <option value="maintenance_visit">রুটিন সার্ভিস ও মেইনটেন্যান্স ভিজিট (Maintenance)</option>
                <option value="product_demo">সফটওয়্যার / প্রোডাক্ট ডেমো (Product Demo)</option>
                <option value="custom_tailoring">কাস্টম অর্ডারিং ও ফিটিং (Custom Service)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">বুকিং স্লিপ কোড</label>
              <input
                type="text"
                value={bookingNumber}
                onChange={e => setBookingNumber(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl text-purple-700 focus:outline-none"
              />
            </div>
          </div>

          {/* Customer Selection */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">গ্রাহকের বিবরণ (Customer Details)</span>
              <select
                onChange={e => handleSelectCustomer(e.target.value)}
                className="px-2 py-1 text-xs border border-slate-200 rounded-lg bg-white"
              >
                <option value="">-- বিদ্যমান কাস্টমার থেকে আনুন --</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-600">গ্রাহকের নাম *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="যেমন: Dr. Kazi Mahbubur Rahman"
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-600">মোবাইল নম্বর *</label>
                <input
                  type="text"
                  required
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  placeholder="+880 1711-xxxxxx"
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Date, Time Slot, Assigned Staff */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">তারিখ (Date) *</label>
              <input
                type="date"
                required
                value={bookingDate}
                onChange={e => setBookingDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">সময় স্লট (Time Slot) *</label>
              <select
                value={timeSlot}
                onChange={e => setTimeSlot(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="09:00 AM - 10:00 AM">09:00 AM - 10:00 AM</option>
                <option value="10:30 AM - 11:30 AM">10:30 AM - 11:30 AM</option>
                <option value="12:00 PM - 01:00 PM">12:00 PM - 01:00 PM</option>
                <option value="02:00 PM - 03:00 PM">02:00 PM - 03:00 PM</option>
                <option value="03:30 PM - 04:30 PM">03:30 PM - 04:30 PM</option>
                <option value="05:00 PM - 06:00 PM">05:00 PM - 06:00 PM</option>
                <option value="06:30 PM - 07:30 PM">06:30 PM - 07:30 PM</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">দায়িত্বপ্রাপ্ত স্পেশালিস্ট</label>
              <select
                value={assignedStaffId}
                onChange={e => setAssignedStaffId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.designation})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Location & Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">লোকেশন মাধ্যম</label>
              <select
                value={locationType}
                onChange={e => setLocationType(e.target.value as BookingLocationType)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="in_store">ইন-স্টোর / চেম্বার (In-Store)</option>
                <option value="on_site">অন-সাইট ক্লায়েন্ট লোকেশন (On-Site)</option>
                <option value="virtual_meeting">অনলাইন ভার্চুয়াল মিটিং (Virtual Meeting)</option>
              </select>
            </div>
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-slate-700">লোকেশন বিবরণ / মিটিং লিংক</label>
              <input
                type="text"
                value={locationDetails}
                onChange={e => setLocationDetails(e.target.value)}
                placeholder="যেমন: ক্যাবিন ১, অথবা Google Meet লিংক"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Fee & Payment Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-purple-50/50 rounded-xl border border-purple-100">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">সার্ভিস ফি ({currency})</label>
              <input
                type="number"
                min="0"
                value={fee}
                onChange={e => setFee(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-lg focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">পেমেন্ট স্ট্যাটাস</label>
              <select
                value={paymentStatus}
                onChange={e => setPaymentStatus(e.target.value as BookingPaymentStatus)}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white font-bold"
              >
                <option value="paid">পরিশোধিত (Paid)</option>
                <option value="pending">বকেয়া / অপেক্ষমাণ (Pending)</option>
                <option value="waived">মওকুফ / ফ্রি (Waived)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">বিশেষ নির্দেশনা / নোট</label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="গ্রাহকের অনুরোধ বা প্রয়োজনীয় কাগজপত্র..."
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-sm transition flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              বুকিং নিশ্চিত করুন
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
