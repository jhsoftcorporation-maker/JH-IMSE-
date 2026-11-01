import React, { useState } from 'react';
import { 
  X, CheckCircle2, ShieldCheck, DollarSign, UploadCloud, 
  CreditCard, Smartphone, Building, AlertCircle, ArrowRight 
} from 'lucide-react';
import { Tenant, PlanTier, AdminPaymentAccounts, SubscriptionPaymentRequest } from '../../types';

interface SubscriptionCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: Tenant;
  selectedPlan: PlanTier;
  planPrice: number;
  billingCycle: 'monthly' | 'yearly';
  adminPaymentAccounts: AdminPaymentAccounts;
  onSubmitPaymentRequest: (req: Omit<SubscriptionPaymentRequest, 'id' | 'status' | 'submittedAt'>) => void;
}

export const SubscriptionCheckoutModal: React.FC<SubscriptionCheckoutModalProps> = ({
  isOpen,
  onClose,
  tenant,
  selectedPlan,
  planPrice,
  billingCycle,
  adminPaymentAccounts,
  onSubmitPaymentRequest,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'bKash' | 'Nagad' | 'Rocket' | 'Bank Transfer'>('bKash');
  const [senderPhone, setSenderPhone] = useState('');
  const [trxId, setTrxId] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderPhone.trim() || !trxId.trim()) {
      alert('প্রেরকের নম্বর এবং ট্রানজেকশন আইডি (TrxID) দিন');
      return;
    }

    onSubmitPaymentRequest({
      tenantId: tenant.id,
      tenantName: tenant.name,
      ownerName: tenant.ownerName,
      ownerPhone: tenant.phone,
      plan: selectedPlan,
      amount: planPrice,
      billingCycle,
      paymentMethod,
      senderPhone: senderPhone.trim(),
      trxId: trxId.trim().toUpperCase(),
      screenshotUrl: screenshotUrl.trim() || undefined,
    });

    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white p-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-purple-300 block">JH IMSE SaaS সাবস্ক্রিপশন চেকআউট</span>
            <h3 className="font-extrabold text-base capitalize mt-0.5">
              {selectedPlan} প্ল্যান আপগ্রেড • ৳{planPrice.toLocaleString()} ({billingCycle === 'yearly' ? 'বাৎসরিক' : 'মাসিক'})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
            {/* Payment Method Selector */}
            <div>
              <label className="font-bold text-slate-800 block mb-1.5">পেমেন্ট মাধ্যম বেছে নিন: *</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'bKash', label: 'বিকাশ', num: adminPaymentAccounts.bkashNumber, color: 'border-pink-500 bg-pink-50/50' },
                  { id: 'Nagad', label: 'নগদ', num: adminPaymentAccounts.nagadNumber, color: 'border-orange-500 bg-orange-50/50' },
                  { id: 'Rocket', label: 'রকেট', num: adminPaymentAccounts.rocketNumber, color: 'border-purple-500 bg-purple-50/50' },
                  { id: 'Bank Transfer', label: 'ব্যাংক', num: adminPaymentAccounts.bankName, color: 'border-blue-500 bg-blue-50/50' },
                ].map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPaymentMethod(p.id as any)}
                    className={`p-2.5 rounded-xl border text-center transition ${
                      paymentMethod === p.id
                        ? `${p.color} ring-2 ring-purple-600/20 font-bold text-slate-900`
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <div className="text-xs font-bold">{p.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Official Payment Accounts Instructions Box */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-1.5 text-purple-900 font-bold">
                <Smartphone className="w-4 h-4" />
                <span>অফিসিয়াল একাউন্ট তথ্য ও পেমেন্ট নির্দেশনা:</span>
              </div>

              {paymentMethod === 'bKash' && (
                <div className="space-y-1 text-slate-700">
                  <div className="flex justify-between items-center bg-white p-2 rounded-lg border">
                    <span>বিকাশ {adminPaymentAccounts.bkashType === 'merchant' ? 'মার্চেন্ট পেমেন্ট' : 'পার্সোনাল'} নম্বর:</span>
                    <strong className="font-mono text-pink-700 text-sm">{adminPaymentAccounts.bkashNumber}</strong>
                  </div>
                  <p className="text-[11px] text-slate-500">বিকাশ অ্যাপে "Payment" বা "Send Money" করে সর্বমোট <strong>৳{planPrice.toLocaleString()}</strong> পাঠান।</p>
                </div>
              )}

              {paymentMethod === 'Nagad' && (
                <div className="space-y-1 text-slate-700">
                  <div className="flex justify-between items-center bg-white p-2 rounded-lg border">
                    <span>নগদ {adminPaymentAccounts.nagadType === 'merchant' ? 'মার্চেন্ট পেমেন্ট' : 'পার্সোনাল'} নম্বর:</span>
                    <strong className="font-mono text-orange-700 text-sm">{adminPaymentAccounts.nagadNumber}</strong>
                  </div>
                  <p className="text-[11px] text-slate-500">নগদ একাউন্ট থেকে <strong>৳{planPrice.toLocaleString()}</strong> টাকা পেমেন্ট সম্পন্ন করুন।</p>
                </div>
              )}

              {paymentMethod === 'Rocket' && (
                <div className="space-y-1 text-slate-700">
                  <div className="flex justify-between items-center bg-white p-2 rounded-lg border">
                    <span>রকেট একাউন্ট নম্বর:</span>
                    <strong className="font-mono text-purple-800 text-sm">{adminPaymentAccounts.rocketNumber}</strong>
                  </div>
                  <p className="text-[11px] text-slate-500">রকেটে টাকা পাঠিয়ে TrxID নিচে লিখুন।</p>
                </div>
              )}

              {paymentMethod === 'Bank Transfer' && (
                <div className="space-y-1.5 text-slate-700 bg-white p-2.5 rounded-lg border">
                  <div className="flex justify-between">
                    <span>ব্যাংকের নাম:</span>
                    <strong className="text-slate-900">{adminPaymentAccounts.bankName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>একাউন্ট নাম:</span>
                    <strong className="text-slate-900">{adminPaymentAccounts.bankAccountName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>একাউন্ট নম্বর:</span>
                    <strong className="font-mono text-blue-700">{adminPaymentAccounts.bankAccountNumber}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>শাখা (Branch):</span>
                    <span className="text-slate-600">{adminPaymentAccounts.bankBranch}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Verification Inputs */}
            <div className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  যে নম্বর বা একাউন্ট থেকে টাকা পাঠিয়েছেন: *
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: 01712345678 বা ব্যাংক একাউন্ট নম্বর"
                  value={senderPhone}
                  onChange={e => setSenderPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600 outline-none font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  ট্রানজেকশন আইডি (Transaction ID / TrxID): *
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: BK-881204 অথবা EFT-992102"
                  value={trxId}
                  onChange={e => setTrxId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600 outline-none font-mono font-bold uppercase"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  পেমেন্ট স্লিপ বা স্ক্রিনশটের লিংক (ঐচ্ছিক):
                </label>
                <input
                  type="text"
                  placeholder="https://imgur.com/... বা ড্রাইভ লিংক"
                  value={screenshotUrl}
                  onChange={e => setScreenshotUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600 outline-none text-slate-500"
                />
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold transition shadow-sm flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> সাবমিট করুন (অ্যাডমিন ভেরিফিকেশন)
              </button>
            </div>
          </form>
        ) : (
          /* Submitted State */
          <div className="p-8 text-center space-y-4 text-xs">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto animate-pulse">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">পেমেন্ট রিকোয়েস্ট সফলভাবে জমা হয়েছে!</h3>
            <p className="text-slate-600 max-w-sm mx-auto leading-relaxed">
              আপনার প্রেরিত TrxID <strong>({trxId})</strong> আমাদের অ্যাডমিন প্যানেলে যাচাইয়ের জন্য পাঠানো হয়েছে। ব্যাংক/বিকাশ স্টেটমেন্ট চেক করে অনুমোদনের সাথে সাথে আপনার প্ল্যান সক্রিয় হয়ে যাবে।
            </p>
            <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200 text-purple-900 font-medium">
              জরুরি প্রয়োজনে যোগাযোগ করুন: <strong>+8801940999830</strong>
            </div>
            <div className="pt-2">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition"
              >
                ঠিক আছে, বন্ধ করুন
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
