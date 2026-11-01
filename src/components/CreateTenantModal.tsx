import React, { useState } from 'react';
import { 
  Building2, X, Sparkles, CheckCircle2, ShieldCheck, 
  MapPin, Phone, Mail, FileText, Layers, Key, ArrowRight
} from 'lucide-react';
import { Tenant, BusinessType, PlanTier } from '../types';
import { INITIAL_SUBSCRIPTION_PACKAGES } from '../data/mockData';

interface CreateTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTenant: (tenantData: Omit<Tenant, 'id' | 'createdAt'>) => void;
}

export const CreateTenantModal: React.FC<CreateTenantModalProps> = ({
  isOpen,
  onClose,
  onCreateTenant,
}) => {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [businessType, setBusinessType] = useState<BusinessType>('grocery');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+880 1');
  const [address, setAddress] = useState('ঢাকা, বাংলাদেশ');
  const [tradeLicenseNo, setTradeLicenseNo] = useState('TRAD/DN-' + Math.floor(10000 + Math.random() * 90000) + '/2026');
  const [taxVatNo, setTaxVatNo] = useState('BIN-00' + Math.floor(100000000 + Math.random() * 900000000) + '-0101');
  const [plan, setPlan] = useState<PlanTier>('professional');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [customDomain, setCustomDomain] = useState('');
  const [storeNotice, setStoreNotice] = useState('স্বাগতম! আমাদের সকল পণ্য শতভাগ জেনুইন ও সেরা মানের নিশ্চয়তা।');

  if (!isOpen) return null;

  const handleNameChange = (val: string) => {
    setName(val);
    const generatedSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    if (!slug || slug === generatedSlug.slice(0, -1)) {
      setSlug(generatedSlug || 'shop-' + Date.now().toString().slice(-4));
    }
  };

  const selectedPkg = INITIAL_SUBSCRIPTION_PACKAGES.find(p => p.tier === plan) || INITIAL_SUBSCRIPTION_PACKAGES[2];
  const fee = billingCycle === 'yearly' ? selectedPkg.yearlyPrice : selectedPkg.monthlyPrice;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !ownerName.trim()) {
      alert('অনুগ্রহ করে কোম্পানির নাম ও স্বত্বাধিকারীর নাম পূরণ করুন।');
      return;
    }

    // Expiry date calculation
    const exp = new Date();
    if (plan === 'trial') {
      exp.setDate(exp.getDate() + 14);
    } else if (billingCycle === 'yearly') {
      exp.setFullYear(exp.getFullYear() + 1);
    } else {
      exp.setMonth(exp.getMonth() + 1);
    }

    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const licenseKey = `JHIMSE-${plan.toUpperCase().slice(0, 3)}-2026-${randomSuffix}`;

    const newTenantData: Omit<Tenant, 'id' | 'createdAt'> = {
      name,
      slug: slug || 'shop-' + Date.now(),
      businessType,
      ownerName,
      email: email || `${slug || 'shop'}@jh-imse.shop`,
      phone,
      address,
      currency: '৳',
      plan,
      status: 'active',
      subscriptionExpiry: exp.toISOString().slice(0, 10),
      monthlyFee: billingCycle === 'yearly' ? Math.round(fee / 12) : fee,
      billingCycle,
      licenseKey,
      tradeLicenseNo,
      taxVatNo,
      customDomain: customDomain.trim() || undefined,
      storeNotice,
      quotas: selectedPkg.quotas,
      usage: {
        currentBranches: 1,
        currentUsers: 1,
        currentProducts: 0,
        currentMonthlyInvoices: 0,
        currentStorageMb: 25,
      },
      features: {
        pos: true,
        ecommerce: plan !== 'starter',
        crm: plan !== 'trial',
        hrm: plan === 'enterprise',
        ai: plan === 'enterprise',
        pharmacyBatch: businessType === 'pharmacy',
        imeiWarranty: businessType === 'electronics',
        multiWarehouse: plan === 'professional' || plan === 'enterprise',
      },
    };

    onCreateTenant(newTenantData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-purple-100 overflow-hidden my-8 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-800 via-indigo-800 to-purple-900 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
              <Building2 className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-wide flex items-center gap-2">
                নতুন কোম্পানি ও টেন্যান্ট অনবোর্ডিং
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 font-semibold">
                  SaaS Hub
                </span>
              </h3>
              <p className="text-xs text-purple-200">নতুন শপ বা এন্টারপ্রাইজ কোম্পানি রেজিস্ট্রেশন ও সাবস্ক্রিপশন বরাদ্দ</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Section 1: Company Info */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-700 flex items-center gap-1.5 mb-3">
              <Building2 className="w-3.5 h-3.5" /> ১. কোম্পানির মৌলিক তথ্য
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  কোম্পানি বা শপের নাম <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => handleNameChange(e.target.value)}
                  placeholder="যেমন: ঢাকা ফ্যাশন অ্যান্ড লাইফস্টাইল"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  সাবডোমেইন স্লাগ (Unique Slug) <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center">
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder="dhaka-fashion"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-l-xl focus:bg-white focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  />
                  <span className="px-3 py-2 bg-slate-100 border border-l-0 border-slate-200 rounded-r-xl text-slate-500 text-[11px] font-mono whitespace-nowrap">
                    .jh-imse.shop
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ব্যবসার ক্যাটাগরি (Business Type)
                </label>
                <select
                  value={businessType}
                  onChange={e => setBusinessType(e.target.value as BusinessType)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-600 focus:outline-none font-medium"
                >
                  <option value="grocery">🛒 মুদি, সুপারশপ ও রিটেইল (Grocery & Retail)</option>
                  <option value="pharmacy">⚕️ ফার্মেসি ও ড্রাগ স্টোর (Pharmacy & Batch Expiry)</option>
                  <option value="electronics">⚡ গ্যাজেট ও ইলেকট্রনিক্স (Electronics & IMEI)</option>
                  <option value="warehouse">📦 পাইকারি ও সেন্ট্রাল গোডাউন (Warehouse & Wholesale)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  কাস্টম ডোমেইন (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  value={customDomain}
                  onChange={e => setCustomDomain(e.target.value)}
                  placeholder="যেমন: shop.dhakafashion.com.bd"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Owner & Legal */}
          <div className="border-t border-slate-100 pt-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-700 flex items-center gap-1.5 mb-3">
              <FileText className="w-3.5 h-3.5" /> ২. মালিকানা ও লিগ্যাল ডকুমেন্টস
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  স্বত্বাধিকারী / মালিকের নাম <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={ownerName}
                  onChange={e => setOwnerName(e.target.value)}
                  placeholder="যেমন: জনাব আরিফুল ইসলাম"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  মোবাইল নম্বর <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+880 17XX-XXXXXX"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  অফিসিয়াল ইমেইল
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="corporate@company.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ট্রেড লাইসেন্স নম্বর (Trade License)
                </label>
                <input
                  type="text"
                  value={tradeLicenseNo}
                  onChange={e => setTradeLicenseNo(e.target.value)}
                  placeholder="TRAD/DN-XXXXX/2026"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-600 focus:outline-none font-mono"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  দোকান / আউটলেটের পূর্ণ ঠিকানা
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="দোকান নং, শপিং কমপ্লেক্স, রোড, এলাকা, জেলা"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Subscription Package & Quotas */}
          <div className="border-t border-slate-100 pt-5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-700 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> ৩. সাবস্ক্রিপশন প্ল্যান ও কোটা বরাদ্দ
              </h4>

              {/* Monthly vs Yearly Toggle */}
              <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-3 py-1 rounded-lg transition ${billingCycle === 'monthly' ? 'bg-white shadow-xs font-bold text-purple-700' : 'text-slate-600'}`}
                >
                  মাসিক বিলিং
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle('yearly')}
                  className={`px-3 py-1 rounded-lg transition flex items-center gap-1 ${billingCycle === 'yearly' ? 'bg-purple-700 text-white font-bold shadow-xs' : 'text-slate-600'}`}
                >
                  বাৎসরিক (২০% ছাড়) 🏷️
                </button>
              </div>
            </div>

            {/* Plan selection radio cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {INITIAL_SUBSCRIPTION_PACKAGES.map(pkg => {
                const isSelected = plan === pkg.tier;
                const cost = billingCycle === 'yearly' ? pkg.yearlyPrice : pkg.monthlyPrice;
                return (
                  <div
                    key={pkg.id}
                    onClick={() => setPlan(pkg.tier)}
                    className={`cursor-pointer rounded-2xl p-3.5 border text-xs transition relative flex flex-col justify-between ${
                      isSelected
                        ? 'border-purple-600 bg-purple-50/70 shadow-sm ring-1 ring-purple-600'
                        : 'border-slate-200 bg-white hover:border-purple-300'
                    }`}
                  >
                    {pkg.popular && (
                      <span className="absolute -top-2.5 right-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-[9px] px-2 py-0.5 rounded-full shadow-xs">
                        {pkg.badge}
                      </span>
                    )}

                    <div>
                      <div className="font-bold text-slate-900 text-sm">{pkg.name}</div>
                      <div className="text-lg font-black text-purple-700 my-1">
                        ৳ {cost.toLocaleString()}
                        <span className="text-[10px] text-slate-500 font-normal">
                          {pkg.tier === 'trial' ? ' / ১৪ দিন' : billingCycle === 'yearly' ? ' / বছর' : ' / মাস'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-tight mb-2.5">
                        {pkg.description}
                      </p>

                      <div className="space-y-1 text-[10px] text-slate-700 border-t border-slate-100 pt-2 font-medium">
                        <div>🏢 ব্রাঞ্চ: {pkg.quotas.maxBranches} টি</div>
                        <div>👥 ইউজার: {pkg.quotas.maxUsers} জন</div>
                        <div>📦 প্রোডাক্ট: {pkg.quotas.maxProducts.toLocaleString()} টি</div>
                        <div>💾 স্টোরেজ: {pkg.quotas.storageGb} GB</div>
                      </div>
                    </div>

                    <div className="mt-3 pt-2">
                      <div className={`w-full py-1 text-center rounded-lg text-[10px] font-bold ${
                        isSelected ? 'bg-purple-700 text-white' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {isSelected ? '✓ নির্বাচিত' : 'নির্বাচন করুন'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 4: Store Notice */}
          <div className="border-t border-slate-100 pt-5 text-xs">
            <label className="block font-semibold text-slate-700 mb-1">
              স্টোর ফ্রন্ট বা ইনভয়েস নোটিশ
            </label>
            <input
              type="text"
              value={storeNotice}
              onChange={e => setStoreNotice(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-600 focus:outline-none"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-4 flex items-center justify-between border-t border-slate-200">
            <div className="text-xs text-slate-500">
              * রেজিস্ট্রেশনের সাথে স্বয়ংক্রিয়ভাবে মেইন ওয়্যারহাউস ও ক্রিপ্টো লাইসেন্স তৈরি হবে।
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
              >
                বাতিল
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> কোম্পানি অনবোর্ড ও সক্রিয় করুন
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
