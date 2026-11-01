import React, { useState } from 'react';
import { 
  MaintenanceContract, Customer, Tenant, 
  MaintenanceContractTier, MaintenanceFrequency, CoveredEquipmentItem 
} from '../../types';
import { X, ShieldCheck, Plus, Trash2, Calendar, User } from 'lucide-react';

interface CreateAMCContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: Tenant;
  customers: Customer[];
  onSaveContract: (contractData: Omit<MaintenanceContract, 'id' | 'createdAt'>) => void;
}

export const CreateAMCContractModal: React.FC<CreateAMCContractModalProps> = ({
  isOpen,
  onClose,
  tenant,
  customers,
  onSaveContract,
}) => {
  if (!isOpen) return null;

  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  const [title, setTitle] = useState('বার্ষিক প্রিভেন্টিভ মেডিকেল ও আইটি ইকুইপমেন্ট মেইনটেন্যান্স চুক্তি');
  const [tier, setTier] = useState<MaintenanceContractTier>('gold');
  const [frequency, setFrequency] = useState<MaintenanceFrequency>('quarterly');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );

  const [contractAmount, setContractAmount] = useState('36000');
  const [paidAmount, setPaidAmount] = useState('18000');
  const [totalVisitsAllowed, setTotalVisitsAllowed] = useState('4');
  const [nextScheduledDate, setNextScheduledDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [autoReminderSms, setAutoReminderSms] = useState(true);

  // Covered Equipment List
  const [equipmentList, setEquipmentList] = useState<CoveredEquipmentItem[]>([
    {
      id: 'eq-init-1',
      name: 'Digital Patient Monitor / BP Unit',
      brand: 'Omron',
      model: 'HEM-7120',
      serialNumber: 'OMR-SN-99821',
      location: 'Ward Room 3'
    }
  ]);

  const [newEqName, setNewEqName] = useState('');
  const [newEqBrand, setNewEqBrand] = useState('');
  const [newEqModel, setNewEqModel] = useState('');
  const [newEqSerial, setNewEqSerial] = useState('');
  const [newEqLocation, setNewEqLocation] = useState('');

  const handleCustomerSelect = (id: string) => {
    setSelectedCustomerId(id);
    const found = customers.find(c => c.id === id);
    if (found) {
      setCustomerName(found.name);
      setCustomerPhone(found.phone);
      setCustomerAddress(found.address || '');
    }
  };

  const handleAddEquipment = () => {
    if (!newEqName || !newEqSerial) {
      alert('যন্ত্রের নাম ও সিরিয়াল নম্বর বাধ্যতামূলক!');
      return;
    }
    setEquipmentList(prev => [
      ...prev,
      {
        id: `eq-${Date.now()}`,
        name: newEqName,
        brand: newEqBrand || 'General',
        model: newEqModel || 'Standard',
        serialNumber: newEqSerial,
        location: newEqLocation || undefined,
      }
    ]);
    setNewEqName('');
    setNewEqBrand('');
    setNewEqModel('');
    setNewEqSerial('');
    setNewEqLocation('');
  };

  const handleRemoveEquipment = (id: string) => {
    setEquipmentList(prev => prev.filter(e => e.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !title || equipmentList.length === 0) {
      alert('অনুগ্রহ করে গ্রাহকের বিবরণ, চুক্তির নাম ও অন্তত একটি অন্তর্ভুক্ত যন্ত্র যোগ করুন!');
      return;
    }

    const cAmt = parseFloat(contractAmount) || 0;
    const pAmt = parseFloat(paidAmount) || 0;
    const visits = parseInt(totalVisitsAllowed) || 4;

    const contractNumber = `AMC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    onSaveContract({
      contractNumber,
      tenantId: tenant.id,
      customerId: selectedCustomerId || `cust-amc-${Date.now()}`,
      customerName,
      customerPhone,
      customerAddress,
      title,
      tier,
      frequency,
      startDate,
      endDate,
      contractAmount: cAmt,
      paidAmount: pAmt,
      paymentStatus: pAmt >= cAmt ? 'paid' : pAmt > 0 ? 'partial' : 'due',
      totalVisitsAllowed: visits,
      visitsCompleted: 0,
      nextScheduledDate,
      status: 'active',
      coveredEquipment: equipmentList,
      visitLogs: [],
      autoReminderSms,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-purple-100 overflow-hidden my-6 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-700 to-purple-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-xs">
              <ShieldCheck className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h3 className="font-bold text-sm">নতুন গ্রাহক রক্ষণাবেক্ষণ চুক্তি (AMC Contract)</h3>
              <p className="text-xs text-amber-200">বার্ষিক ও ষাণ্মাসিক প্রিভেন্টিভ সার্ভিস ও ওয়ারেন্টি এগ্রিমেন্ট</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-amber-200 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
          {/* Customer Selection */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                <User className="w-4 h-4 text-amber-700" />
                ১. গ্রাহক বা প্রতিষ্ঠানের তথ্য
              </span>
              {customers.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500">পূর্বের ক্লায়েন্ট:</span>
                  <select
                    value={selectedCustomerId}
                    onChange={e => handleCustomerSelect(e.target.value)}
                    className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="">-- নতুন ক্লায়েন্ট --</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-slate-600 block mb-1 font-semibold">গ্রাহক / প্রতিষ্ঠানের নাম: *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: গ্রিন ক্রিসেন্ট হসপিটাল"
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
                <label className="text-slate-600 block mb-1 font-semibold">ঠিকানা / শাখা:</label>
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

          {/* Contract Plan & Scope */}
          <div className="bg-amber-50/40 p-4 rounded-2xl border border-amber-200/60 space-y-3">
            <span className="font-bold text-amber-950 flex items-center gap-1.5 text-xs">
              <Calendar className="w-4 h-4 text-amber-700" />
              ২. চুক্তির মেয়াদ ও সার্ভিস প্যাকেজ
            </span>

            <div>
              <label className="text-slate-600 block mb-1 font-semibold">চুক্তির শিরোনাম: *</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="text-slate-600 block mb-1 font-semibold">সার্ভিস টায়ার:</label>
                <select
                  value={tier}
                  onChange={e => setTier(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold uppercase text-amber-900"
                >
                  <option value="standard">Standard</option>
                  <option value="silver">Silver Tier</option>
                  <option value="gold">Gold Tier (Recommended)</option>
                  <option value="enterprise_24_7">Enterprise 24/7</option>
                </select>
              </div>

              <div>
                <label className="text-slate-600 block mb-1 font-semibold">ভিজিট ফ্রিকোয়েন্সি:</label>
                <select
                  value={frequency}
                  onChange={e => setFrequency(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-semibold"
                >
                  <option value="monthly">মাসিক (Monthly)</option>
                  <option value="quarterly">ত্রৈমাসিক (Quarterly)</option>
                  <option value="bi_annual">ষাণ্মাসিক (Bi-Annual)</option>
                  <option value="annual">বার্ষিক (Annual)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-600 block mb-1 font-semibold">শুরুর তারিখ:</label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1 font-semibold">মেয়াদ শেষের তারিখ:</label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              <div>
                <label className="text-slate-600 block mb-1 font-semibold">মোট চুক্তি মূল্য ({tenant.currency}):</label>
                <input
                  type="number"
                  value={contractAmount}
                  onChange={e => setContractAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono font-bold text-amber-900"
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1 font-semibold">পরিশোধিত অগ্রিম ({tenant.currency}):</label>
                <input
                  type="number"
                  value={paidAmount}
                  onChange={e => setPaidAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono font-bold text-emerald-700"
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1 font-semibold">পরবর্তী শিডিউল ভিজিট:</label>
                <input
                  type="date"
                  value={nextScheduledDate}
                  onChange={e => setNextScheduledDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Covered Equipment */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <span className="font-bold text-slate-800 block text-xs">
              🛡️ চুক্তির আওতাভুক্ত যন্ত্রপাতি (Covered Equipment):
            </span>

            {/* Existing Equipment Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">যন্ত্রপাতির নাম</th>
                    <th className="py-2 px-3">ব্র্যান্ড ও মডেল</th>
                    <th className="py-2 px-3">সিরিয়াল / বারকোড</th>
                    <th className="py-2 px-3">অবস্থান</th>
                    <th className="py-2 px-3 text-center">মুছুন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {equipmentList.map(eq => (
                    <tr key={eq.id}>
                      <td className="py-2 px-3 font-semibold text-slate-800">{eq.name}</td>
                      <td className="py-2 px-3 text-slate-600">{eq.brand} {eq.model}</td>
                      <td className="py-2 px-3 font-mono font-bold text-purple-900">{eq.serialNumber}</td>
                      <td className="py-2 px-3 text-slate-500">{eq.location || 'N/A'}</td>
                      <td className="py-2 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveEquipment(eq.id)}
                          className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Quick Add Equipment Row */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 pt-1 items-end">
              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">যন্ত্রের নাম:</label>
                <input
                  type="text"
                  placeholder="যেমন: Nebulizer / Monitor"
                  value={newEqName}
                  onChange={e => setNewEqName(e.target.value)}
                  className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">ব্র্যান্ড:</label>
                <input
                  type="text"
                  placeholder="Philips / Beurer"
                  value={newEqBrand}
                  onChange={e => setNewEqBrand(e.target.value)}
                  className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">মডেল:</label>
                <input
                  type="text"
                  placeholder="Model no..."
                  value={newEqModel}
                  onChange={e => setNewEqModel(e.target.value)}
                  className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">সিরিয়াল নম্বর: *</label>
                <input
                  type="text"
                  placeholder="SN-12345"
                  value={newEqSerial}
                  onChange={e => setNewEqSerial(e.target.value)}
                  className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold"
                />
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleAddEquipment}
                  className="w-full py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  যন্ত্র যোগ করুন
                </button>
              </div>
            </div>
          </div>

          {/* SMS Notification */}
          <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-xl border border-purple-100">
            <input
              type="checkbox"
              id="autoSms"
              checked={autoReminderSms}
              onChange={e => setAutoReminderSms(e.target.checked)}
              className="w-4 h-4 text-purple-700 rounded cursor-pointer"
            />
            <label htmlFor="autoSms" className="text-purple-900 text-xs font-semibold cursor-pointer">
              শিডিউল ভিজিটের ৩ দিন পূর্বে গ্রাহককে স্বয়ংক্রিয় এসএমএস রিমাইন্ডার প্রেরণ চালু রাখুন
            </label>
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
              className="px-6 py-2.5 bg-gradient-to-r from-amber-700 to-purple-800 hover:from-amber-800 hover:to-purple-900 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition cursor-pointer flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              এগ্রিমেন্ট সক্রিয় করুন
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
