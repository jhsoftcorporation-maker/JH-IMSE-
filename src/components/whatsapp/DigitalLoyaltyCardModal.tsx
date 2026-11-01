import React from 'react';
import { Customer, Tenant } from '../../types';
import { LOYALTY_TIERS, getTierProgress } from '../../utils/loyaltyEngine';
import { X, QrCode, Sparkles, Printer, Share2, Award, ShieldCheck, Check } from 'lucide-react';

interface DigitalLoyaltyCardModalProps {
  customer: Customer;
  tenant: Tenant;
  onClose: () => void;
  onSendWhatsAppCard?: (customer: Customer) => void;
}

export const DigitalLoyaltyCardModal: React.FC<DigitalLoyaltyCardModalProps> = ({
  customer,
  tenant,
  onClose,
  onSendWhatsAppCard,
}) => {
  const [copied, setCopied] = React.useState(false);
  const tierKey = (customer.loyaltyTier === 'vip' ? 'platinum' : customer.loyaltyTier) || 'bronze';
  const tierConfig = LOYALTY_TIERS[tierKey as keyof typeof LOYALTY_TIERS] || LOYALTY_TIERS.bronze;
  const progress = getTierProgress(customer.totalSpent);
  const points = customer.loyaltyPoints || 0;

  const cardMemberId = `JH-MEM-${customer.id.replace('cust-', '').padStart(5, '0')}`;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyCardId = () => {
    navigator.clipboard?.writeText(cardMemberId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base">ডিজিটাল ভিআইপি মেম্বারশিপ কার্ড</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Virtual Card Canvas */}
          <div
            id="digital-member-card-canvas"
            className={`relative w-full aspect-[1.586] rounded-2xl p-6 text-white shadow-xl bg-gradient-to-br ${tierConfig.bgGradient} overflow-hidden border border-white/20 flex flex-col justify-between`}
          >
            {/* Holographic Watermark & Pattern */}
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute right-4 bottom-4 opacity-10 pointer-events-none">
              <Sparkles className="w-36 h-36" />
            </div>

            {/* Top Bar: Store Name & Tier Badge */}
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-[10px] tracking-widest uppercase font-semibold text-white/80">
                  {tenant.businessType?.toUpperCase() || 'RETAIL'} EXCLUSIVE
                </p>
                <h4 className="font-extrabold text-lg sm:text-xl tracking-tight drop-shadow-sm">
                  {tenant.name}
                </h4>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-bold uppercase tracking-wider shadow-sm">
                <span>{tierConfig.iconName}</span>
                <span>{tierConfig.nameBn.split(' ')[0]}</span>
              </div>
            </div>

            {/* Middle: Smart Chip Visual & Member ID */}
            <div className="relative z-10 flex items-center justify-between my-auto">
              <div className="flex items-center gap-3">
                <div className="w-11 h-8 rounded-md bg-gradient-to-tr from-amber-200 via-amber-300 to-amber-100 border border-amber-400/60 shadow-inner flex flex-col justify-around p-1">
                  <div className="w-full h-0.5 bg-amber-600/40" />
                  <div className="w-full h-0.5 bg-amber-600/40" />
                </div>
                <div className="text-white/90 text-sm tracking-widest font-mono font-semibold">
                  •••• •••• {customer.phone.replace(/[^0-9]/g, '').slice(-4)}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase text-white/80 font-medium block">রিওয়ার্ড ব্যালেন্স</span>
                <span className="font-mono text-xl font-black text-amber-200 drop-shadow">
                  {points.toLocaleString()} <span className="text-xs font-sans text-white/90">Pts</span>
                </span>
                <span className="text-[10px] text-white/80 block">≈ ৳{points.toLocaleString()} সমমূল্য</span>
              </div>
            </div>

            {/* Bottom Bar: Customer Details & QR Code */}
            <div className="relative z-10 flex items-end justify-between pt-2 border-t border-white/20">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-white/70 font-semibold">কার্ডহোল্ডার</p>
                <p className="font-bold text-sm tracking-wide">{customer.name}</p>
                <p className="text-[11px] font-mono text-white/80">{cardMemberId}</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="bg-white p-1.5 rounded-lg shadow-md">
                  {/* Simulated QR Code for scanner */}
                  <div className="w-12 h-12 bg-slate-900 rounded p-1 flex flex-col justify-between items-center text-white">
                    <QrCode className="w-full h-full text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tier Progress & Perks */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">টিয়ার প্রগ্রেস (Tier Progress):</span>
              <span className="text-slate-500 font-mono">
                {progress.nextTier 
                  ? `পরবর্তী স্তর: ${progress.nextTier.nameBn.split(' ')[0]} (${progress.progressPercent}%)`
                  : 'সর্বোচ্চ স্তর অর্জিত'}
              </span>
            </div>
            
            {progress.nextTier && (
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-purple-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${progress.progressPercent}%` }}
                />
              </div>
            )}

            <div className="text-xs text-slate-600 flex items-center justify-between">
              <span>মোট খরচ: <strong>৳{customer.totalSpent.toLocaleString()}</strong></span>
              {progress.nextTier ? (
                <span className="text-purple-700 font-medium">
                  আরও ৳{progress.amountNeeded.toLocaleString()} ক্রয়ে আপগ্রেড
                </span>
              ) : (
                <span className="text-emerald-700 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> আজীবন ভিআইপি স্ট্যাটাস
                </span>
              )}
            </div>

            {/* Perks list */}
            <div className="pt-2 border-t border-slate-200">
              <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {tierConfig.nameBn} সুবিধাসমূহ:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-600">
                {tierConfig.perks.map((perk, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">{perk}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2">
            <button
              onClick={handleCopyCardId}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition flex items-center gap-1.5"
            >
              {copied ? 'কপি হয়েছে!' : 'মেম্বার আইডি কপি'}
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" /> প্রিন্ট কার্ড
            </button>

            {onSendWhatsAppCard && (
              <button
                onClick={() => {
                  onSendWhatsAppCard(customer);
                  onClose();
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition shadow flex items-center gap-1.5"
              >
                <Share2 className="w-4 h-4" /> হোয়াটসঅ্যাপে কার্ড পাঠান
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
