import React, { useState } from 'react';
import { X, Building2, Calendar, DollarSign, User, ShieldCheck, Tag, Sparkles } from 'lucide-react';
import { FixedAsset, AssetCategory, DepreciationMethod, AssetCondition } from '../../types';
import { calculateSLMAnnualDepreciation, calculateWDVAnnualDepreciation } from '../../utils/depreciationEngine';

interface AddAssetModalProps {
  tenantId: string;
  currency: string;
  onClose: () => void;
  onSave: (asset: Omit<FixedAsset, 'id' | 'createdAt' | 'updatedAt'>) => void;
  existingCount: number;
}

export const AddAssetModal: React.FC<AddAssetModalProps> = ({
  tenantId,
  currency,
  onClose,
  onSave,
  existingCount,
}) => {
  const generatedCode = `AST-2026-${String(existingCount + 1).padStart(3, '0')}`;

  const [formData, setFormData] = useState({
    assetCode: generatedCode,
    name: '',
    category: 'office_appliances' as AssetCategory,
    modelNo: '',
    serialOrBarcode: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    vendorOrSupplier: '',
    vendorInvoiceNo: '',
    originalCost: 50000,
    salvageValue: 5000,
    usefulLifeYears: 5,
    depreciationMethod: 'SLM' as DepreciationMethod,
    depreciationRatePercentage: 20,
    location: 'প্রধান আউটলেট - বিক্রয় এলাকা',
    department: 'স্টোর অপারেশনস',
    custodianName: '',
    custodianPhone: '',
    condition: 'brand_new' as AssetCondition,
    warrantyExpiryDate: '',
    notes: '',
  });

  // Calculate annual depreciation based on form
  const calculatedAnnualDep = formData.depreciationMethod === 'SLM'
    ? calculateSLMAnnualDepreciation(formData.originalCost, formData.salvageValue, formData.usefulLifeYears)
    : calculateWDVAnnualDepreciation(formData.originalCost, formData.depreciationRatePercentage);

  const monthlyDep = Math.round(calculatedAnnualDep / 12);

  const handleMethodChange = (method: DepreciationMethod) => {
    let rate = formData.depreciationRatePercentage;
    if (method === 'SLM' && formData.usefulLifeYears > 0) {
      rate = Math.round((100 / formData.usefulLifeYears) * 100) / 100;
    } else if (method === 'WDV') {
      rate = 20; // standard default
    } else if (method === 'NO_DEPRECIATION') {
      rate = 0;
    }
    setFormData(prev => ({ ...prev, depreciationMethod: method, depreciationRatePercentage: rate }));
  };

  const handleUsefulLifeChange = (years: number) => {
    const validYears = Math.max(1, years);
    let rate = formData.depreciationRatePercentage;
    if (formData.depreciationMethod === 'SLM') {
      rate = Math.round((100 / validYears) * 100) / 100;
    }
    setFormData(prev => ({ ...prev, usefulLifeYears: validYears, depreciationRatePercentage: rate }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || formData.originalCost <= 0) return;

    onSave({
      assetCode: formData.assetCode,
      tenantId,
      name: formData.name.trim(),
      category: formData.category,
      modelNo: formData.modelNo.trim() || undefined,
      serialOrBarcode: formData.serialOrBarcode.trim() || `SN-${Date.now().toString().slice(-6)}`,
      purchaseDate: formData.purchaseDate,
      vendorOrSupplier: formData.vendorOrSupplier.trim() || 'সাধারণ সরবরাহকারী (General Vendor)',
      vendorInvoiceNo: formData.vendorInvoiceNo.trim() || undefined,
      originalCost: Number(formData.originalCost),
      salvageValue: Number(formData.salvageValue) || 0,
      usefulLifeYears: Number(formData.usefulLifeYears) || 5,
      depreciationMethod: formData.depreciationMethod,
      depreciationRatePercentage: Number(formData.depreciationRatePercentage),
      accumulatedDepreciation: 0,
      currentBookValue: Number(formData.originalCost),
      location: formData.location.trim() || 'প্রধান শাখা',
      department: formData.department.trim() || 'অপারেশনস',
      custodianName: formData.custodianName.trim() || 'ম্যানেজার ইন-চার্জ',
      custodianPhone: formData.custodianPhone.trim() || undefined,
      condition: formData.condition,
      status: 'in_service',
      warrantyExpiryDate: formData.warrantyExpiryDate || undefined,
      totalMaintenanceCost: 0,
      qrCodeData: `JHIMSE://ASSET/${formData.assetCode}`,
      notes: formData.notes.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md">
              <Building2 className="w-6 h-6 text-blue-200" />
            </div>
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                নতুন স্থায়ী সম্পদ এন্ট্রি (Register Fixed Asset)
                <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full font-mono">
                  {formData.assetCode}
                </span>
              </h2>
              <p className="text-xs text-blue-100">
                দোকান বা কারখানার স্থায়ী সম্পদ, অবচয় পদ্ধতি (SLM/WDV) ও দায়িত্বপ্রাপ্ত কর্মকর্তা নির্ধারণ করুন।
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Section 1: Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Tag className="w-4 h-4 text-blue-500" /> ১. সম্পদের সাধারণ বিবরণ ও ক্যাটাগরি
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  সম্পদের পূর্ণ নাম (Asset Name) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: Hitachi 2.0 Ton Inverter AC বা Dell Server"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  ক্যাটাগরি (Category) *
                </label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value as AssetCategory })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="office_appliances">অফিস অ্যাপ্লায়েন্স (AC/ফ্রিজ/ফ্যান)</option>
                  <option value="pos_hardware">পিওএস হার্ডওয়্যার ও টার্মিনাল</option>
                  <option value="it_computer">আইটি ও কম্পিউটার সরঞ্জাম</option>
                  <option value="furniture_fixtures">ফার্নিচার ও ফিক্সচার</option>
                  <option value="machinery_equipment">ভারী যন্ত্রপাতি ও মেশিন</option>
                  <option value="vehicles">যানবাহন ও ডেলিভারি ভ্যান</option>
                  <option value="medical_equipment">মেডিকেল ও কোল্ড-চেইন ইকুইপমেন্ট</option>
                  <option value="leasehold_improvements">লিজহোল্ড ও ইন্টেরিয়র কাজ</option>
                  <option value="other">অন্যান্য স্থায়ী সম্পদ</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  মডেল নম্বর (Model No)
                </label>
                <input
                  type="text"
                  placeholder="যেমন: RAS-DX24CF"
                  value={formData.modelNo}
                  onChange={e => setFormData({ ...formData, modelNo: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  সিরিয়াল বা বারকোড নম্বর (Serial/Barcode)
                </label>
                <input
                  type="text"
                  placeholder="যেমন: SN-HTC-9921448"
                  value={formData.serialOrBarcode}
                  onChange={e => setFormData({ ...formData, serialOrBarcode: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  বর্তমান অবস্থা (Condition)
                </label>
                <select
                  value={formData.condition}
                  onChange={e => setFormData({ ...formData, condition: e.target.value as AssetCondition })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="brand_new">নতুন (Brand New)</option>
                  <option value="good">ভালো (Good / Operational)</option>
                  <option value="fair">চলনসই (Fair / Aged)</option>
                  <option value="needs_repair">মেরামত প্রয়োজন (Needs Repair)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Purchase & Valuation */}
          <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-500" /> ২. ক্রয়মূল্য, সরবরাহকারী ও ভ্যালুয়েশন
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  ক্রয় তারিখ (Purchase Date) *
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="date"
                    required
                    value={formData.purchaseDate}
                    onChange={e => setFormData({ ...formData, purchaseDate: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  ক্রয়মূল্য ({currency}) *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.originalCost}
                  onChange={e => setFormData({ ...formData, originalCost: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-semibold text-emerald-600 dark:text-emerald-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  ভগ্নাংশ বা স্ক্র্যাপ মূল্য ({currency} Salvage Value)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.salvageValue}
                  onChange={e => setFormData({ ...formData, salvageValue: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  সরবরাহকারী / ভেন্ডর (Vendor/Supplier)
                </label>
                <input
                  type="text"
                  placeholder="যেমন: Transcom Digital Ltd."
                  value={formData.vendorOrSupplier}
                  onChange={e => setFormData({ ...formData, vendorOrSupplier: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  চালান / বিল নম্বর (Invoice/Bill No)
                </label>
                <input
                  type="text"
                  placeholder="যেমন: INV-TD-8812"
                  value={formData.vendorInvoiceNo}
                  onChange={e => setFormData({ ...formData, vendorInvoiceNo: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  ওয়ারেন্টি মেয়াদের শেষ তারিখ
                </label>
                <input
                  type="date"
                  value={formData.warrantyExpiryDate}
                  onChange={e => setFormData({ ...formData, warrantyExpiryDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Depreciation Calculation Parameters */}
          <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" /> ৩. স্বয়ংক্রিয় অবচয় ইঞ্জিন (Depreciation Setup)
              </h3>
              <div className="text-xs bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-2.5 py-1 rounded-full font-medium">
                অ্যাকাউন্টিং জাবেদায় অটো পোস্ট যোগ্য
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  অবচয় পদ্ধতি (Depreciation Method) *
                </label>
                <select
                  value={formData.depreciationMethod}
                  onChange={e => handleMethodChange(e.target.value as DepreciationMethod)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none font-medium"
                >
                  <option value="SLM">সরলরৈখিক পদ্ধতি (Straight Line Method - SLM)</option>
                  <option value="WDV">ক্রমহ্রাসমান পদ্ধতি (Written Down Value - WDV)</option>
                  <option value="NO_DEPRECIATION">অবচয় প্রযোজ্য নয় (No Depreciation)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  আনুমানিক স্থায়িত্বকাল (Useful Life in Years) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={formData.usefulLifeYears}
                  onChange={e => handleUsefulLifeChange(parseInt(e.target.value) || 1)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  অবচয়ের হার (% Rate per Year)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.depreciationRatePercentage}
                  onChange={e => setFormData({ ...formData, depreciationRatePercentage: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Live Calculation Preview Card */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 rounded-xl p-4 border border-purple-200 dark:border-purple-900/50 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs text-purple-700 dark:text-purple-300 font-medium">
                  স্বয়ংক্রিয় হিসাবের পূর্বরূপ ({formData.depreciationMethod}):
                </p>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  বার্ষিক অবচয়: <span className="text-purple-600 dark:text-purple-400 font-bold">{currency}{calculatedAnnualDep.toLocaleString()}</span> / বছর
                  <span className="mx-2 text-slate-400">|</span>
                  মাসিক অবচয়: <span className="text-purple-600 dark:text-purple-400 font-bold">{currency}{monthlyDep.toLocaleString()}</span> / মাস
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 dark:text-slate-400">অবচয়যোগ্য মূল্য:</span>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {currency}{Math.max(0, formData.originalCost - formData.salvageValue).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: Location & Custodian */}
          <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <User className="w-4 h-4 text-amber-500" /> ৪. অবস্থান ও দায়িত্বপ্রাপ্ত কর্মকর্তা (Location & Custodian)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  অবস্থান / শাখা (Location / Room) *
                </label>
                <input
                  type="text"
                  placeholder="যেমন: ধানমন্ডি প্রধান আউটলেট - ২য় তলা সার্ভার রুম"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  বিভাগ (Department)
                </label>
                <input
                  type="text"
                  placeholder="যেমন: স্টোর অপারেশনস / বিলিং"
                  value={formData.department}
                  onChange={e => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  দায়িত্বপ্রাপ্ত কর্মকর্তা / কাস্টোডিয়ান (Custodian Name) *
                </label>
                <input
                  type="text"
                  placeholder="যেমন: Dr. Md. Abdur Rahim"
                  value={formData.custodianName}
                  onChange={e => setFormData({ ...formData, custodianName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  কাস্টোডিয়ানের মোবাইল নম্বর
                </label>
                <input
                  type="text"
                  placeholder="যেমন: +880 1711-234567"
                  value={formData.custodianPhone}
                  onChange={e => setFormData({ ...formData, custodianPhone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                বিশেষ নোট বা রক্ষণাবেক্ষণ সংক্রান্ত নির্দেশনা
              </label>
              <textarea
                rows={2}
                placeholder="যেমন: প্রতি ৬ মাসে সার্ভিসিং নিশ্চিত করতে হবে এবং গ্যাস প্রেসার মাপতে হবে..."
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              বাতিল (Cancel)
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" /> স্থায়ী সম্পদ সংরক্ষণ করুন (Save Asset)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
