import React, { useState } from 'react';
import { 
  Key, ShieldCheck, X, CheckCircle2, Copy, RefreshCw, 
  Calendar, Building2, HardDrive, Users, Store, Printer, Award
} from 'lucide-react';
import { Tenant, PlanTier } from '../types';

interface TenantLicenseModalProps {
  tenant: Tenant | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateTenant: (updated: Tenant) => void;
}

export const TenantLicenseModal: React.FC<TenantLicenseModalProps> = ({
  tenant,
  isOpen,
  onClose,
  onUpdateTenant,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'extend' | 'certificate'>('details');

  if (!isOpen || !tenant) return null;

  const currentLicense = tenant.licenseKey || `JHIMSE-${tenant.plan.toUpperCase().slice(0, 3)}-2026-DEFAULT`;

  const handleCopyKey = () => {
    navigator.clipboard.writeText(currentLicense);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerateKey = () => {
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    const newKey = `JHIMSE-${tenant.plan.toUpperCase().slice(0, 3)}-2026-${randomHex}-${Math.floor(100 + Math.random() * 900)}`;
    const updated: Tenant = {
      ...tenant,
      licenseKey: newKey,
    };
    onUpdateTenant(updated);
  };

  const handleExtendDuration = (months: number) => {
    const currentExp = new Date(tenant.subscriptionExpiry);
    currentExp.setMonth(currentExp.getMonth() + months);
    const updated: Tenant = {
      ...tenant,
      subscriptionExpiry: currentExp.toISOString().slice(0, 10),
      status: 'active',
    };
    onUpdateTenant(updated);
    alert(`${tenant.name}-এর সাবস্ক্রিপশন মেয়াদ ${months} মাস বৃদ্ধি করা হয়েছে!`);
  };

  const handlePlanChange = (newPlan: PlanTier) => {
    const updated: Tenant = {
      ...tenant,
      plan: newPlan,
    };
    onUpdateTenant(updated);
  };

  const daysLeft = Math.ceil(
    (new Date(tenant.subscriptionExpiry).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-purple-100 overflow-hidden my-8 animate-in zoom-in-95 duration-150">
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center justify-center font-bold">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-wide">
                কোম্পানি লাইসেন্স ও সাবস্ক্রিপশন কন্ট্রোল
              </h3>
              <p className="text-xs text-purple-200">
                {tenant.name} • {tenant.tradeLicenseNo || 'ট্রেড লাইসেন্স নং সংরক্ষিত'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sub Navigation */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 flex items-center gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-3 border-b-2 transition ${
              activeTab === 'details'
                ? 'border-purple-700 text-purple-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            লাইসেন্স বিবরণ ও কি
          </button>
          <button
            onClick={() => setActiveTab('extend')}
            className={`py-3 border-b-2 transition ${
              activeTab === 'extend'
                ? 'border-purple-700 text-purple-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            মেয়াদ বৃদ্ধি ও প্ল্যান আপগ্রেড
          </button>
          <button
            onClick={() => setActiveTab('certificate')}
            className={`py-3 border-b-2 transition ${
              activeTab === 'certificate'
                ? 'border-purple-700 text-purple-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            অ্যাক্টিভেশন সার্টিফিকেট (প্রিন্ট)
          </button>
        </div>

        {/* Tab 1: License Details */}
        {activeTab === 'details' && (
          <div className="p-6 space-y-5 text-xs">
            {/* License Key Box */}
            <div className="bg-purple-50/60 rounded-2xl p-4 border border-purple-200">
              <div className="flex items-center justify-between text-slate-600 mb-1.5 font-medium">
                <span className="flex items-center gap-1.5 text-purple-900 font-bold">
                  <ShieldCheck className="w-4 h-4 text-purple-700" />
                  JH IMSE এনক্রিপ্টেড কর্পোরেট লাইসেন্স কি:
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  daysLeft > 7 ? 'bg-emerald-100 text-emerald-800' :
                  daysLeft > 0 ? 'bg-amber-100 text-amber-800' :
                  'bg-rose-100 text-rose-800'
                }`}>
                  {daysLeft > 0 ? `${daysLeft} দিন অবশিষ্ট` : 'মেয়াদ শেষ'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 font-mono font-bold text-sm bg-white px-3.5 py-2.5 rounded-xl border border-purple-200 text-slate-900 tracking-wider">
                  {currentLicense}
                </div>
                <button
                  onClick={handleCopyKey}
                  className="px-3.5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold flex items-center gap-1.5 transition shadow-xs"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'কপি হয়েছে' : 'কপি করুন'}
                </button>
                <button
                  onClick={handleRegenerateKey}
                  title="নতুন লাইসেন্স কি ইস্যু করুন"
                  className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tenant Meta Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="text-[10px] text-slate-500">বর্তমান প্ল্যান</div>
                <div className="font-bold text-purple-700 text-xs uppercase mt-0.5">{tenant.plan}</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="text-[10px] text-slate-500">বিলিং সাইকেল</div>
                <div className="font-bold text-slate-800 text-xs mt-0.5">
                  {tenant.billingCycle === 'yearly' ? 'বাৎসরিক' : 'মাসিক'}
                </div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="text-[10px] text-slate-500">মেয়াদ উত্তীর্ণের তারিখ</div>
                <div className="font-bold text-slate-800 text-xs mt-0.5">{tenant.subscriptionExpiry}</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="text-[10px] text-slate-500">সাবস্ক্রিপশন ফি</div>
                <div className="font-bold text-emerald-700 text-xs mt-0.5">৳ {tenant.monthlyFee}/মাস</div>
              </div>
            </div>

            {/* Quota vs Usage Meters */}
            <div>
              <h4 className="font-bold text-slate-800 text-xs mb-3 flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-purple-600" />
                রিসোর্স কোটা বনাম বর্তমান ব্যবহার:
              </h4>

              <div className="space-y-3">
                {/* Branches */}
                <div>
                  <div className="flex justify-between text-[11px] mb-1 font-medium">
                    <span className="text-slate-600">আউটলেট ও ব্রাঞ্চ বরাদ্দ:</span>
                    <span className="font-bold text-slate-900">
                      {tenant.usage.currentBranches} / {tenant.quotas.maxBranches} টি
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-purple-600 h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, (tenant.usage.currentBranches / tenant.quotas.maxBranches) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Users */}
                <div>
                  <div className="flex justify-between text-[11px] mb-1 font-medium">
                    <span className="text-slate-600">ইউজার / ক্যাশিয়ার অ্যাকাউন্টস:</span>
                    <span className="font-bold text-slate-900">
                      {tenant.usage.currentUsers} / {tenant.quotas.maxUsers} জন
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, (tenant.usage.currentUsers / tenant.quotas.maxUsers) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Products */}
                <div>
                  <div className="flex justify-between text-[11px] mb-1 font-medium">
                    <span className="text-slate-600">পণ্য ও ইনভেন্টরি সীমা:</span>
                    <span className="font-bold text-slate-900">
                      {tenant.usage.currentProducts.toLocaleString()} / {tenant.quotas.maxProducts.toLocaleString()} টি
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-emerald-600 h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, (tenant.usage.currentProducts / tenant.quotas.maxProducts) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Cloud Storage */}
                <div>
                  <div className="flex justify-between text-[11px] mb-1 font-medium">
                    <span className="text-slate-600">ক্লাউড ডাটাবেজ ও ইমেজ স্টোরেজ:</span>
                    <span className="font-bold text-slate-900">
                      {(tenant.usage.currentStorageMb / 1024).toFixed(1)} GB / {tenant.quotas.storageGb} GB
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-amber-500 h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, (tenant.usage.currentStorageMb / (tenant.quotas.storageGb * 1024)) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Extend & Plan Upgrade */}
        {activeTab === 'extend' && (
          <div className="p-6 space-y-5 text-xs">
            <div>
              <h4 className="font-bold text-slate-800 text-xs mb-2">দ্রুত সাবস্ক্রিপশন মেয়াদ বৃদ্ধি করুন:</h4>
              <p className="text-slate-500 text-[11px] mb-3">
                ক্লায়েন্টের পেমেন্ট পাওয়ার পর সরাসরি ১-ক্লিকে সাবস্ক্রিপশন রিনিউ করুন।
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <button
                  onClick={() => handleExtendDuration(1)}
                  className="p-3 bg-slate-50 hover:bg-purple-50 hover:border-purple-300 border border-slate-200 rounded-xl font-bold text-slate-800 transition text-center"
                >
                  <div className="text-sm text-purple-700">+১ মাস</div>
                  <div className="text-[10px] text-slate-500 font-normal">৩০ দিন বৃদ্ধি</div>
                </button>

                <button
                  onClick={() => handleExtendDuration(3)}
                  className="p-3 bg-slate-50 hover:bg-purple-50 hover:border-purple-300 border border-slate-200 rounded-xl font-bold text-slate-800 transition text-center"
                >
                  <div className="text-sm text-purple-700">+৩ মাস</div>
                  <div className="text-[10px] text-slate-500 font-normal">কোয়ার্টারলি প্যাক</div>
                </button>

                <button
                  onClick={() => handleExtendDuration(6)}
                  className="p-3 bg-slate-50 hover:bg-purple-50 hover:border-purple-300 border border-slate-200 rounded-xl font-bold text-slate-800 transition text-center"
                >
                  <div className="text-sm text-purple-700">+৬ মাস</div>
                  <div className="text-[10px] text-slate-500 font-normal">হাফ-ইয়ারলি</div>
                </button>

                <button
                  onClick={() => handleExtendDuration(12)}
                  className="p-3 bg-purple-700 hover:bg-purple-800 text-white border border-purple-800 rounded-xl font-bold transition text-center shadow-xs"
                >
                  <div className="text-sm text-amber-300">+১ বছর</div>
                  <div className="text-[10px] text-purple-200 font-normal">বাৎসরিক রিনিউয়াল</div>
                </button>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <h4 className="font-bold text-slate-800 text-xs mb-2">সাবস্ক্রিপশন টিয়ার পরিবর্তন করুন:</h4>
              <div className="grid grid-cols-3 gap-3">
                {(['starter', 'professional', 'enterprise'] as PlanTier[]).map(p => (
                  <button
                    key={p}
                    onClick={() => handlePlanChange(p)}
                    className={`p-3 rounded-xl border text-center transition ${
                      tenant.plan === p
                        ? 'bg-purple-50 border-purple-600 text-purple-800 font-bold ring-1 ring-purple-600'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-purple-300'
                    }`}
                  >
                    <div className="uppercase text-xs font-bold">{p}</div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      {p === 'starter' ? '৳ ৯৯৯/মাস' : p === 'professional' ? '৳ ২,৪৯৯/মাস' : '৳ ৫,৯৯৯/মাস'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Certificate Print */}
        {activeTab === 'certificate' && (
          <div className="p-6 text-xs space-y-4">
            <div className="p-6 border-4 border-double border-purple-200 rounded-2xl bg-amber-50/20 text-center relative overflow-hidden">
              <div className="flex justify-center mb-2">
                <div className="w-12 h-12 rounded-full bg-purple-700 text-white flex items-center justify-center font-bold shadow-md">
                  <Award className="w-6 h-6 text-amber-300" />
                </div>
              </div>

              <div className="text-[11px] font-bold tracking-widest text-purple-900 uppercase">
                JH SOFT CORPORATION • BANGLADESH
              </div>
              <h2 className="text-lg font-black text-slate-900 mt-1">
                অফিসিয়াল সফটওয়্যার লাইসেন্স সনদপত্র
              </h2>
              <p className="text-[11px] text-slate-500 mb-4">
                Enterprise Resource Planning & Cloud POS Suite
              </p>

              <div className="bg-white p-3 rounded-xl border border-slate-200 inline-block text-left mb-4 shadow-2xs">
                <div className="text-slate-600">কোম্পানির নাম: <strong className="text-slate-900">{tenant.name}</strong></div>
                <div className="text-slate-600">ট্রেড লাইসেন্স নং: <span className="font-mono">{tenant.tradeLicenseNo || 'N/A'}</span></div>
                <div className="text-slate-600">সাবস্ক্রিপশন প্ল্যান: <span className="font-bold uppercase text-purple-700">{tenant.plan} Tier</span></div>
                <div className="text-slate-600">মেয়াদ উত্তীর্ণ: <strong>{tenant.subscriptionExpiry}</strong></div>
                <div className="text-slate-600">লাইসেন্স কি: <span className="font-mono font-bold text-purple-800">{currentLicense}</span></div>
              </div>

              <div className="text-[10px] text-slate-500 leading-relaxed max-w-md mx-auto">
                এই সনদপত্রটি নিশ্চিত করে যে উল্লেখিত বাণিজ্যিক প্রতিষ্ঠানটি JH IMSE ক্লাউড সফটওয়্যার ব্যবহারের পূর্ণ বৈধ লাইসেন্সধারী।
                যেকোনো প্রয়োজনে যোগাযোগ: +8801940999830 | support@jhsoftcorp.com
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="w-full py-2.5 bg-purple-800 hover:bg-purple-900 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition shadow-xs"
            >
              <Printer className="w-4 h-4 text-amber-300" /> সার্টিফিকেট প্রিন্ট / PDF সেভ করুন
            </button>
          </div>
        )}

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
