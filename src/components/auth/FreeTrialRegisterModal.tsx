import React, { useState } from 'react';
import { 
  X, Sparkles, CheckCircle2, ShieldCheck, Mail, Phone, 
  CreditCard, Store, ArrowRight, Check, AlertCircle 
} from 'lucide-react';
import { Tenant, BusinessType } from '../../types';

interface FreeTrialRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterSuccess: (tenantData: Omit<Tenant, 'id' | 'createdAt'>) => void;
}

export const FreeTrialRegisterModal: React.FC<FreeTrialRegisterModalProps> = ({
  isOpen,
  onClose,
  onRegisterSuccess,
}) => {
  const [step, setStep] = useState<'form' | 'verify_email' | 'success'>('form');

  // Form Fields
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+880 ');
  const [nidNumber, setNidNumber] = useState('');
  const [shopName, setShopName] = useState('');
  const [businessType, setBusinessType] = useState<BusinessType>('pharmacy');
  const [address, setAddress] = useState('');
  const [selectedModule, setSelectedModule] = useState<'ecommerce' | 'erp_pos' | 'hrm' | 'crm' | 'all_in_one'>('all_in_one');

  // Email OTP verification state
  const [verificationCode, setVerificationCode] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('784912');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpError, setOtpError] = useState('');

  if (!isOpen) return null;

  const handleSendEmailVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerName.trim() || !email.trim() || !phone.trim() || !nidNumber.trim() || !shopName.trim()) {
      alert('দয়া করে সকল বাধ্যতামূলক তথ্য পূরণ করুন');
      return;
    }

    if (nidNumber.trim().length < 10) {
      alert('সঠিক ১০ বা ১৭ ডিজিটের জাতীয় পরিচয়পত্র (NID) নম্বর দিন');
      return;
    }

    // Generate random 6 digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setIsOtpSent(true);
    setStep('verify_email');
  };

  const handleVerifyOtpAndActivate = (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode !== generatedOtp && verificationCode !== '123456') {
      setOtpError('ভুল ওটিপি কোড! অনুগ্রহ করে ইমেইলে পাঠানো সঠিক ৬ ডিজিটের কোড দিন।');
      return;
    }

    // Generate slug from shop name
    const slug = shopName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');

    const newTenantData: Omit<Tenant, 'id' | 'createdAt'> = {
      name: shopName.trim(),
      slug: slug || 'my-store-' + Date.now().toString().slice(-4),
      businessType,
      ownerName: ownerName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim() || 'ঢাকা, বাংলাদেশ',
      currency: '৳',
      plan: 'trial',
      status: 'active', // FREE TRIAL IS AUTOMATICALLY APPROVED INSTANTLY!
      subscriptionExpiry: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), // 14 days free trial
      monthlyFee: 0,
      billingCycle: 'monthly',
      tradeLicenseNo: undefined,
      taxVatNo: undefined,
      customDomain: undefined,
      storeNotice: 'JH IMSE ক্লাউড সফটওয়্যারে স্বাগতম! ১৪ দিনের ফ্রি ট্রায়াল সক্রিয় রয়েছে।',
      nidNumber: nidNumber.trim(),
      selectedModule,
      quotas: {
        maxBranches: 1,
        maxUsers: 3,
        maxProducts: 500,
        maxMonthlyInvoices: 250,
        storageGb: 2,
      },
      usage: {
        currentBranches: 1,
        currentUsers: 1,
        currentProducts: 10,
        currentMonthlyInvoices: 0,
        currentStorageMb: 45,
      },
      features: {
        pos: selectedModule === 'all_in_one' || selectedModule === 'erp_pos',
        ecommerce: selectedModule === 'all_in_one' || selectedModule === 'ecommerce',
        crm: selectedModule === 'all_in_one' || selectedModule === 'crm',
        hrm: selectedModule === 'all_in_one' || selectedModule === 'hrm',
        ai: true,
        pharmacyBatch: businessType === 'pharmacy',
        imeiWarranty: businessType === 'electronics',
        multiWarehouse: false,
      },
    };

    setStep('success');
    setTimeout(() => {
      onRegisterSuccess(newTenantData);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-purple-100 overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-800 via-indigo-800 to-purple-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-purple-100 transition"
          >
            <X className="w-4 h-4" />
          </button>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-400/30 mb-2">
            <Sparkles className="w-3.5 h-3.5" /> ১৪ দিনের আনলিমিটেড ফ্রি ট্রায়াল
          </span>
          <h3 className="text-xl font-extrabold">সহজেই শুরু করুন JH IMSE ERP</h3>
          <p className="text-xs text-purple-200 mt-1">
            কোনো ক্রেডিট কার্ড লাগবে না • রেজিস্ট্রেশনের সাথে সাথেই স্বয়ংক্রিয় ইনস্ট্যান্ট অ্যাক্টিভেশন
          </p>
        </div>

        {/* STEP 1: REGISTRATION FORM */}
        {step === 'form' && (
          <form onSubmit={handleSendEmailVerification} className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">আপনার পূর্ণ নাম: *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: মোঃ আব্দুল্লাহ"
                  value={ownerName}
                  onChange={e => setOwnerName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600 outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">মোবাইল নম্বর: *</label>
                <input
                  type="text"
                  required
                  placeholder="+880 17XXXXXXXX"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600 outline-none font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">জিমেইল / ইমেইল ঠিকানা: *</label>
                <input
                  type="email"
                  required
                  placeholder="name@gmail.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600 outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">জাতীয় পরিচয়পত্র (NID) নম্বর: *</label>
                <input
                  type="text"
                  required
                  placeholder="১০ বা ১৭ ডিজিট NID"
                  value={nidNumber}
                  onChange={e => setNidNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600 outline-none font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">দোকান বা কোম্পানির নাম: *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: আল-মদিনা সুপার স্টোর"
                  value={shopName}
                  onChange={e => setShopName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600 outline-none font-bold"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">ব্যবসার ধরন (Type): *</label>
                <select
                  value={businessType}
                  onChange={e => setBusinessType(e.target.value as BusinessType)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600 outline-none bg-slate-50 font-medium"
                >
                  <option value="pharmacy">⚕️ ফার্মেসি ও ড্রাগ স্টোর (DGDA)</option>
                  <option value="grocery">🛒 মুদি, সুপার শপ ও ডিপার্টমেন্টাল</option>
                  <option value="electronics">⚡ ইলেকট্রনিক্স, মোবাইল ও গ্যাজেট</option>
                  <option value="warehouse">🏢 পাইকারি আড়ত ও হোলসেল গোডাউন</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">দোকানের সম্পূর্ণ ঠিকানা:</label>
              <input
                type="text"
                placeholder="যেমন: দোকান নং ১২, নিউ মার্কেট, ঢাকা"
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600 outline-none"
              />
            </div>

            {/* Module Plan Selection */}
            <div>
              <label className="font-bold text-slate-800 block mb-1.5">কোন মডিউল দিয়ে শুরু করতে চান? *</label>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                {[
                  { id: 'all_in_one', label: '🚀 অল-ইন-ওয়ান পূর্ণাঙ্গ ইআরপি স্যুট', desc: 'সব মডিউল আনলকড (POS, ই-কমার্স, HRM, CRM)' },
                  { id: 'erp_pos', label: '🧾 ক্লাউড POS ও ইনভেন্টরি ERP', desc: 'কাউন্টার বিক্রয়, বারকোড ও স্টক ম্যানেজমেন্ট' },
                  { id: 'ecommerce', label: '🛒 অনলাইন ই-কমার্স স্টোরফ্রন্ট', desc: 'কাস্টমার অনলাইন শপ ও কুরিয়ার ট্র্যাকিং' },
                  { id: 'crm', label: '📒 CRM ও ডিজিটাল বাকি খাতা', desc: 'গ্রাহক লেজার, এসএমএস তাগাদা ও মানি রিসিট' },
                ].map(mod => (
                  <button
                    key={mod.id}
                    type="button"
                    onClick={() => setSelectedModule(mod.id as any)}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      selectedModule === mod.id
                        ? 'border-purple-600 bg-purple-50 text-purple-950 ring-2 ring-purple-600/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-bold text-xs">{mod.label}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{mod.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold transition shadow-sm flex items-center justify-center gap-2 text-sm"
              >
                <span>ইমেইল ভেরিফাই করে ফ্রি ট্রায়াল সক্রিয় করুন</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: EMAIL VERIFICATION CODE */}
        {step === 'verify_email' && (
          <form onSubmit={handleVerifyOtpAndActivate} className="p-6 space-y-4 text-xs">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center mx-auto">
                <Mail className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-base text-slate-900">ইমেইল ভেরিফিকেশন কোড দিন</h4>
              <p className="text-slate-500 text-xs">
                আমরা আপনার <strong>{email}</strong> ইমেইলে একটি ৬ ডিজিটের সিকিউরিটি কোড পাঠিয়েছি।
              </p>
              <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-800 border border-emerald-200 text-xs font-mono font-bold">
                সিমুলেটেড জিমেইল ওটিপি কোড: <span className="text-sm underline">{generatedOtp}</span> (বা টাইপ করুন 123456)
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1 text-center">৬ ডিজিটের ওটিপি কোড লিখুন:</label>
              <input
                type="text"
                required
                maxLength={6}
                value={verificationCode}
                onChange={e => {
                  setVerificationCode(e.target.value);
                  setOtpError('');
                }}
                placeholder="******"
                className="w-full py-2.5 text-center font-mono font-black text-xl tracking-[0.3em] border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-600 outline-none"
              />
              {otpError && (
                <p className="text-rose-600 text-[11px] font-semibold text-center mt-1.5">{otpError}</p>
              )}
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setStep('form')}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition"
              >
                পেছনে যান
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition shadow-sm flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> নিশ্চিত করুন ও লগইন করুন
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: INSTANT SUCCESS */}
        {step === 'success' && (
          <div className="p-8 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">অভিনন্দন, আপনার স্টোর প্রস্তুত!</h3>
            <p className="text-xs text-slate-600">
              ফ্রি ট্রায়াল ইনস্ট্যান্ট অ্যাপ্রুভ হয়েছে। আপনার শপ ড্যাশবোর্ডে প্রবেশ করা হচ্ছে...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
