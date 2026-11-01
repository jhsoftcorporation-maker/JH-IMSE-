import React, { useState } from 'react';
import { Customer, Tenant } from '../../types';
import { generateWhatsAppDueReminderTemplate } from '../../utils/loyaltyEngine';
import { X, Send, MessageSquare, AlertCircle, CheckCircle2, Copy, ExternalLink, ShieldCheck } from 'lucide-react';

interface WhatsAppDueReminderModalProps {
  customer: Customer;
  tenant: Tenant;
  onClose: () => void;
  onSend: (message: string, recipientPhone: string) => void;
}

export const WhatsAppDueReminderModal: React.FC<WhatsAppDueReminderModalProps> = ({
  customer,
  tenant,
  onClose,
  onSend,
}) => {
  const initialText = generateWhatsAppDueReminderTemplate(
    customer,
    tenant.name,
    tenant.phone || '+880 1711-234567'
  );

  const [messageText, setMessageText] = useState(initialText);
  const [recipientPhone, setRecipientPhone] = useState(customer.phone);
  const [isSending, setIsSending] = useState(false);
  const [isSentSuccess, setIsSentSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const payUrl = `https://jh-imse.shop/pay/INV-${customer.id.replace('cust-', '')}-${Date.now().toString().slice(-4)}`;

  const handleSend = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setIsSentSuccess(true);
      onSend(messageText, recipientPhone);
      setTimeout(() => {
        onClose();
      }, 1500);
    }, 800);
  };

  const handleCopyPayLink = () => {
    navigator.clipboard?.writeText(payUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-emerald-700 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-emerald-600 rounded-lg">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">হোয়াটসঅ্যাপ বকেয়া রিমাইন্ডার ও পে-লিংক</h3>
              <p className="text-xs text-emerald-100">Meta Cloud API v20.0 অটোমেশন ইঞ্জিন</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Due Summary Card */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
            <div>
              <p className="text-xs text-amber-800 font-semibold">গ্রাহকের নাম: <span className="font-bold text-slate-800">{customer.name}</span></p>
              <p className="text-xs text-amber-700">বর্তমান বকেয়া জের:</p>
              <p className="text-2xl font-black text-amber-900 font-mono">৳{customer.dueAmount.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <span className="inline-block px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                1-Click bKash Ready
              </span>
              <p className="text-[11px] text-slate-500 mt-1">স্বয়ংক্রিয় জের সমন্বয়</p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                গ্রাহকের হোয়াটসঅ্যাপ মোবাইল নম্বর
              </label>
              <input
                type="text"
                value={recipientPhone}
                onChange={e => setRecipientPhone(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="+880 17XXXXXXXX"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  হোয়াটসঅ্যাপ মেসেজ টেক্সট (অনুমোদিত টেমপ্লেট)
                </label>
                <button
                  type="button"
                  onClick={handleCopyPayLink}
                  className="text-xs text-emerald-700 hover:underline flex items-center gap-1 font-medium"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copiedLink ? 'পে-লিংক কপি হয়েছে!' : '১-ক্লিক পে-লিংক কপি'}
                </button>
              </div>
              <textarea
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
                rows={9}
                className="w-full px-3.5 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 bg-slate-50/50"
              />
            </div>
          </div>

          {/* Security & Cloud API Banner */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              মেটা ভেরিফাইড বিজনেস অ্যাকাউন্ট থেকে এনক্রিপ্টেড মেসেজ ডেলিভারি হবে। প্রতি সেশন খরচ প্রায় ৳০.৫৫।
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200">
            <button
              onClick={onClose}
              disabled={isSending}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              বাতিল
            </button>
            <button
              onClick={handleSend}
              disabled={isSending || isSentSuccess}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              {isSending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  মেটা API-তে পাঠানো হচ্ছে...
                </>
              ) : isSentSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  সফলভাবে পাঠানো হয়েছে!
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  হোয়াটসঅ্যাপে রিমাইন্ডার পাঠান
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
