import React, { useState } from 'react';
import { X, Building2, Plus, ShieldCheck, MapPin, Phone, Mail } from 'lucide-react';
import { Tenant, Warehouse, WarehouseType } from '../../types';

interface AddWarehouseBranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: Tenant;
  onSaveWarehouse: (warehouse: Warehouse) => void;
  existingWarehouse?: Warehouse | null;
}

export const AddWarehouseBranchModal: React.FC<AddWarehouseBranchModalProps> = ({
  isOpen,
  onClose,
  tenant,
  onSaveWarehouse,
  existingWarehouse,
}) => {
  const [name, setName] = useState(existingWarehouse?.name || '');
  const [code, setCode] = useState(existingWarehouse?.code || '');
  const [type, setType] = useState<WarehouseType>(existingWarehouse?.type || 'retail_branch');
  const [location, setLocation] = useState(existingWarehouse?.location || '');
  const [contactPerson, setContactPerson] = useState(existingWarehouse?.contactPerson || '');
  const [phone, setPhone] = useState(existingWarehouse?.phone || '');
  const [email, setEmail] = useState(existingWarehouse?.email || '');
  const [capacitySqFt, setCapacitySqFt] = useState(existingWarehouse?.capacitySqFt ? String(existingWarehouse.capacitySqFt) : '1500');
  const [isMain, setIsMain] = useState(existingWarehouse?.isMain || false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const warehouseId = existingWarehouse?.id || `wh-${Date.now()}`;
    const generatedCode = code.trim() || `BR-${Math.floor(100 + Math.random() * 900)}`;

    const saved: Warehouse = {
      id: warehouseId,
      tenantId: tenant.id,
      name: name.trim(),
      code: generatedCode.toUpperCase(),
      type,
      location: location.trim() || tenant.address,
      contactPerson: contactPerson.trim(),
      phone: phone.trim() || tenant.phone,
      email: email.trim() || tenant.email,
      capacitySqFt: parseInt(capacitySqFt) || 1000,
      isMain,
      status: 'active',
    };

    onSaveWarehouse(saved);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-purple-100 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
        <div className="bg-gradient-to-r from-purple-800 to-indigo-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <Building2 className="w-5 h-5 text-purple-200" />
            </div>
            <div>
              <h3 className="font-bold text-base">
                {existingWarehouse ? 'ব্রাঞ্চ তথ্য পরিবর্তন' : 'নতুন শাখা বা গুদাম যুক্ত করুন'}
              </h3>
              <p className="text-xs text-purple-200">{tenant.name} মাল্টি-শাখা নেটওয়ার্ক</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-purple-200 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-3.5 text-xs flex-1">
          <div>
            <label className="font-bold text-slate-700 block mb-1">শাখা বা গুদামের নাম: *</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="যেমন: বনানী ফ্ল্যাগশিপ আউটলেট / উত্তরা হাব"
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-purple-600 font-bold text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">শাখা কোড (Outlet Code):</label>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="যেমন: BR-BNN-04"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono uppercase text-purple-900 font-bold focus:outline-none focus:border-purple-600"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">ওয়্যারহাউসের প্রকার:</label>
              <select
                value={type}
                onChange={e => setType(e.target.value as WarehouseType)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-purple-600"
              >
                <option value="retail_branch">🏪 রিটেইল শাখা আউটলেট (Retail Outlet)</option>
                <option value="cdc">🏢 সেন্ট্রাল ডিস্ট্রিবিউশন ডিপো (Central CDC)</option>
                <option value="regional_hub">❄️ আঞ্চলিক হাব / কোল্ড চেইন (Regional Hub)</option>
                <option value="dark_store">📦 অনলাইন ডেলিভারি ডার্ক স্টোর (Dark Store)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">ঠিকানা / লোকেশন: *</label>
            <input
              type="text"
              required
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="যেমন: হাউজ ১২, রোড ১১, বনানী, ঢাকা"
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-purple-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">শাখা ম্যানেজার / ইনচার্জ:</label>
              <input
                type="text"
                value={contactPerson}
                onChange={e => setContactPerson(e.target.value)}
                placeholder="ম্যানেজারের নাম"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-purple-600"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">যোগাযোগ ফোন নম্বর:</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+880 17XXXXXXXX"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono focus:outline-none focus:border-purple-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">ইমেইল:</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="branch@shop.com"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-purple-600 font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">ধারণক্ষমতা (বর্গফুট):</label>
              <input
                type="number"
                value={capacitySqFt}
                onChange={e => setCapacitySqFt(e.target.value)}
                placeholder="1500"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-purple-600"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <input
              type="checkbox"
              id="isMainCheck"
              checked={isMain}
              onChange={e => setIsMain(e.target.checked)}
              className="rounded text-purple-700 w-4 h-4"
            />
            <label htmlFor="isMainCheck" className="text-slate-800 font-bold cursor-pointer">
              প্রধান সেন্ট্রাল ওয়্যারহাউস হিসেবে চিহ্নিত করুন (Primary Main CDC)
            </label>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> সংরক্ষণ করুন
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
