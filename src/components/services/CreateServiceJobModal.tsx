import React, { useState } from 'react';
import { ServiceJobTicket, Customer, Employee, Tenant, ServiceJobPriority, ServiceWarrantyStatus } from '../../types';
import { X, Wrench, ShieldCheck, User, Calendar, Plus, Check } from 'lucide-react';

interface CreateServiceJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: Tenant;
  customers: Customer[];
  employees: Employee[];
  onSaveJob: (jobData: Omit<ServiceJobTicket, 'id' | 'createdAt'>) => void;
}

export const CreateServiceJobModal: React.FC<CreateServiceJobModalProps> = ({
  isOpen,
  onClose,
  tenant,
  customers,
  employees,
  onSaveJob,
}) => {
  if (!isOpen) return null;

  // Selected or new customer
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  // Device Info
  const [deviceType, setDeviceType] = useState('Medical & Diagnostic Device');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [imeiOrSerial, setImeiOrSerial] = useState('');
  const [deviceColor, setDeviceColor] = useState('');
  const [securityLockType, setSecurityLockType] = useState<'none' | 'pin_pattern' | 'password'>('none');
  const [securityCode, setSecurityCode] = useState('');

  // Accessories Checklist
  const defaultAccessories = ['পাওয়ার অ্যাডাপ্টার / চার্জার', 'মূল প্যাকেজিং বক্স', 'কানেক্টিং ক্যাবল', 'কাফ / সেন্সর প্রোব', 'ব্যাটারি প্যাক', 'ম্যানুয়াল ও ওয়ারেন্টি কার্ড'];
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);
  const [customAccessory, setCustomAccessory] = useState('');

  // Problem & Technician
  const [reportedIssues, setReportedIssues] = useState('');
  const [assignedTechnicianId, setAssignedTechnicianId] = useState<string>(employees[0]?.id || '');
  const [priority, setPriority] = useState<ServiceJobPriority>('normal');
  const [warrantyStatus, setWarrantyStatus] = useState<ServiceWarrantyStatus>('out_of_warranty');

  // Billing
  const [estimatedCost, setEstimatedCost] = useState('1200');
  const [laborCost, setLaborCost] = useState('500');
  const [advancePaid, setAdvancePaid] = useState('0');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState(
    new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );

  const handleCustomerSelect = (id: string) => {
    setSelectedCustomerId(id);
    const found = customers.find(c => c.id === id);
    if (found) {
      setCustomerName(found.name);
      setCustomerPhone(found.phone);
      setCustomerAddress(found.address || '');
    }
  };

  const toggleAccessory = (acc: string) => {
    setSelectedAccessories(prev => 
      prev.includes(acc) ? prev.filter(a => a !== acc) : [...prev, acc]
    );
  };

  const handleAddCustomAccessory = () => {
    if (customAccessory.trim() && !selectedAccessories.includes(customAccessory.trim())) {
      setSelectedAccessories(prev => [...prev, customAccessory.trim()]);
      setCustomAccessory('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !brand || !imeiOrSerial || !reportedIssues) {
      alert('অনুগ্রহ করে গ্রাহকের নাম, মোবাইল, ব্র্যান্ড, সিরিয়াল নম্বর এবং সমস্যার বিবরণ পূরণ করুন!');
      return;
    }

    const labor = parseFloat(laborCost) || 0;
    const est = parseFloat(estimatedCost) || labor;
    const adv = parseFloat(advancePaid) || 0;
    const assignedEmp = employees.find(emp => emp.id === assignedTechnicianId);

    const ticketNumber = `JOB-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    onSaveJob({
      ticketNumber,
      tenantId: tenant.id,
      customerId: selectedCustomerId || `cust-walkin-${Date.now()}`,
      customerName,
      customerPhone,
      customerAddress,
      deviceType,
      brand,
      model,
      imeiOrSerial,
      deviceColor: deviceColor || undefined,
      securityLockType,
      securityCode: securityCode || undefined,
      accessoriesReceived: selectedAccessories,
      reportedIssues,
      assignedTechnicianId,
      assignedTechnicianName: assignedEmp?.name || 'প্রধান টেকনিশিয়ান',
      priority,
      status: 'received',
      estimatedCost: est,
      laborCost: labor,
      partsCost: 0,
      discount: 0,
      totalCost: labor,
      advancePaid: adv,
      dueAmount: Math.max(0, labor - adv),
      paymentStatus: adv >= labor ? 'paid' : adv > 0 ? 'partial' : 'unpaid',
      warrantyStatus,
      partsUsed: [],
      intakeDate: new Date().toISOString().slice(0, 16).replace('T', ' '),
      expectedDeliveryDate,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-purple-100 overflow-hidden my-6 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-800 to-indigo-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-xs">
              <Wrench className="w-5 h-5 text-purple-200" />
            </div>
            <div>
              <h3 className="font-bold text-sm">নতুন সার্ভিস ও রিপেয়ার জব কার্ড তৈরি</h3>
              <p className="text-xs text-purple-200">ডিভাইস ইনটেক, সিরিয়াল নম্বর ও টেকনিক্যাল ফল্ট নিবন্ধন</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-purple-200 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
          {/* Section 1: Customer Details */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                <User className="w-4 h-4 text-purple-700" />
                ১. গ্রাহকের তথ্য (Customer Details)
              </span>
              {customers.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500">পূর্বের গ্রাহক:</span>
                  <select
                    value={selectedCustomerId}
                    onChange={e => handleCustomerSelect(e.target.value)}
                    className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="">-- নতুন গ্রাহক টাইপ করুন --</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-slate-600 block mb-1 font-semibold">গ্রাহকের পূর্ণ নাম: *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: জনাব আরিফুল ইসলাম"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="text-slate-600 block mb-1 font-semibold">মোবাইল নম্বর: *</label>
                <input
                  type="tel"
                  required
                  placeholder="017XXXXXXXX"
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono"
                />
              </div>
              <div>
                <label className="text-slate-600 block mb-1 font-semibold">ঠিকানা / এলাকা:</label>
                <input
                  type="text"
                  placeholder="যেমন: ধানমন্ডি, ঢাকা"
                  value={customerAddress}
                  onChange={e => setCustomerAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Equipment / Device Details */}
          <div className="bg-purple-50/40 p-4 rounded-2xl border border-purple-100 space-y-3">
            <span className="font-bold text-purple-950 flex items-center gap-1.5 text-xs">
              <ShieldCheck className="w-4 h-4 text-purple-700" />
              ২. ডিভাইসের বিবরণ ও সিরিয়াল নম্বর (Hardware Specs)
            </span>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-slate-600 block mb-1 font-semibold">ডিভাইসের ক্যাটাগরি:</label>
                <select
                  value={deviceType}
                  onChange={e => setDeviceType(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                >
                  <option value="Medical & Diagnostic Device">মেডিকেল ও ডায়াগনস্টিক যন্ত্র</option>
                  <option value="Smartphone / Mobile">স্মার্টফোন / মোবাইল</option>
                  <option value="Laptop & Computer">ল্যাপটপ / কম্পিউটার</option>
                  <option value="Printer & POS Hardware">প্রিন্টার ও পিওএস হার্ডওয়্যার</option>
                  <option value="Electronic Appliance">ইলেকট্রনিক্স হোম অ্যাপ্লায়েন্স</option>
                  <option value="Other Equipment">অন্যান্য যন্ত্র</option>
                </select>
              </div>

              <div>
                <label className="text-slate-600 block mb-1 font-semibold">ব্র্যান্ড (Brand): *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: Omron / Beurer / Samsung"
                  value={brand}
                  onChange={e => setBrand(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1 font-semibold">মডেল (Model):</label>
                <input
                  type="text"
                  placeholder="যেমন: HEM-7120 / Galaxy S23"
                  value={model}
                  onChange={e => setModel(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1 font-semibold">সিরিয়াল নম্বর / IMEI: *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: SN-99812401"
                  value={imeiOrSerial}
                  onChange={e => setImeiOrSerial(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono text-purple-900 font-bold"
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1 font-semibold">ডিভাইসের রং (Color):</label>
                <input
                  type="text"
                  placeholder="যেমন: White / Silver"
                  value={deviceColor}
                  onChange={e => setDeviceColor(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1 font-semibold">ওয়ারেন্টি কভারেজ:</label>
                <select
                  value={warrantyStatus}
                  onChange={e => setWarrantyStatus(e.target.value as ServiceWarrantyStatus)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium"
                >
                  <option value="out_of_warranty">ওয়ারেন্টি নেই (Paid Out of Warranty)</option>
                  <option value="under_warranty">ব্র্যান্ড অফিশিয়াল ওয়ারেন্টি (Official Free)</option>
                  <option value="shop_guarantee">দোকানের নিজস্ব গ্যারান্টি (Shop Guarantee)</option>
                  <option value="amc_covered">বার্ষিক মেইনটেন্যান্স চুক্তি (AMC Covered)</option>
                </select>
              </div>
            </div>

            {/* Lock / Password & Pattern */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-slate-600 block mb-1 font-semibold">লক সিকিউরিটি টাইপ:</label>
                <select
                  value={securityLockType}
                  onChange={e => setSecurityLockType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                >
                  <option value="none">লক নেই (No Password)</option>
                  <option value="pin_pattern">PIN / প্যাটার্ন লক</option>
                  <option value="password">টেক্সট পাসওয়ার্ড</option>
                </select>
              </div>
              {securityLockType !== 'none' && (
                <div>
                  <label className="text-slate-600 block mb-1 font-semibold">আনলক কোড / পাসওয়ার্ড:</label>
                  <input
                    type="text"
                    placeholder="পাসওয়ার্ড লিখুন..."
                    value={securityCode}
                    onChange={e => setSecurityCode(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono text-purple-900"
                  />
                </div>
              )}
            </div>

            {/* Received Accessories Checklist */}
            <div className="pt-1">
              <label className="text-slate-600 block mb-1 font-semibold">গ্রাহকের কাছ থেকে গৃহীত আনুষঙ্গিক (Accessories):</label>
              <div className="flex flex-wrap gap-2">
                {defaultAccessories.map(acc => {
                  const isChecked = selectedAccessories.includes(acc);
                  return (
                    <button
                      key={acc}
                      type="button"
                      onClick={() => toggleAccessory(acc)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border flex items-center gap-1.5 transition cursor-pointer ${
                        isChecked 
                          ? 'bg-purple-700 text-white border-purple-700 shadow-xs' 
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3" />}
                      {acc}
                    </button>
                  );
                })}
              </div>

              {/* Add custom accessory input */}
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="text"
                  placeholder="অন্য কোনো এক্সেসরিজ থাকলে লিখুন..."
                  value={customAccessory}
                  onChange={e => setCustomAccessory(e.target.value)}
                  className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs w-64"
                />
                <button
                  type="button"
                  onClick={handleAddCustomAccessory}
                  className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  যোগ করুন
                </button>
              </div>
            </div>
          </div>

          {/* Section 3: Issues & Assignment */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
              <Wrench className="w-4 h-4 text-purple-700" />
              ৩. সমস্যা ও টেকনিশিয়ান নির্বাচন
            </span>

            <div>
              <label className="text-slate-600 block mb-1 font-semibold">গ্রাহকের অভিযোগ / প্রধান সমস্যা: *</label>
              <textarea
                required
                rows={2}
                placeholder="সমস্যা বিস্তারিত লিখুন (যেমন: পাওয়ার অন হয় না, কাফে লিক করে, রিডিং এরর দেয় ইত্যাদি)..."
                value={reportedIssues}
                onChange={e => setReportedIssues(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-600 block mb-1 font-semibold">অ্যাসাইনড টেকনিশিয়ান:</label>
                <select
                  value={assignedTechnicianId}
                  onChange={e => setAssignedTechnicianId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.designation})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-600 block mb-1 font-semibold">কাজের অগ্রাধিকার (Priority):</label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value as ServiceJobPriority)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold"
                >
                  <option value="low">সাধারণ (Low)</option>
                  <option value="normal">নরমাল (Normal)</option>
                  <option value="high">জরুরি (High)</option>
                  <option value="urgent">অতি জরুরি (Urgent VIP)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: Cost & Dates */}
          <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200/70 space-y-3">
            <span className="font-bold text-amber-950 flex items-center gap-1.5 text-xs">
              <Calendar className="w-4 h-4 text-amber-700" />
              ৪. সার্ভিস ফি ও সম্ভাব্য ডেলিভারি তারিখ
            </span>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="text-slate-600 block mb-1 font-semibold">সম্ভাব্য খরচ (Est Cost):</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 font-bold text-slate-400">{tenant.currency}</span>
                  <input
                    type="number"
                    value={estimatedCost}
                    onChange={e => setEstimatedCost(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-600 block mb-1 font-semibold">শ্রম ফি (Labor Fee):</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 font-bold text-slate-400">{tenant.currency}</span>
                  <input
                    type="number"
                    value={laborCost}
                    onChange={e => setLaborCost(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-600 block mb-1 font-semibold">অগ্রিম জমা (Advance):</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 font-bold text-emerald-600">{tenant.currency}</span>
                  <input
                    type="number"
                    value={advancePaid}
                    onChange={e => setAdvancePaid(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl font-mono font-bold text-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-600 block mb-1 font-semibold">প্রত্যাশিত ডেলিভারি তারিখ:</label>
                <input
                  type="date"
                  required
                  value={expectedDeliveryDate}
                  onChange={e => setExpectedDeliveryDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-purple-700 to-indigo-800 hover:from-purple-800 hover:to-indigo-900 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              জব টিকিট তৈরি করুন
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
