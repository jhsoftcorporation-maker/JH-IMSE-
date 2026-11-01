import React, { useState } from 'react';
import { Customer, Tenant } from '../types';
import { 
  X, Send, Copy, Check, MessageSquare, Smartphone, 
  Sparkles, RefreshCw, AlertCircle, Info, ShieldCheck
} from 'lucide-react';

interface SmsReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  tenant: Tenant;
  onSendSms: (customer: Customer, message: string) => void;
}

export const SmsReminderModal: React.FC<SmsReminderModalProps> = ({
  isOpen,
  onClose,
  customer,
  tenant,
  onSendSms,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<number>(0);
  const [customMessage, setCustomMessage] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  if (!isOpen || !customer) return null;

  const dueAmount = customer.dueAmount;
  const storeName = tenant.name;
  const customerName = customer.name;
  const storePhone = tenant.phone;
  const helpline = '+8801940999830';

  // 4 Enterprise Bengali SMS Templates
  const templates = [
    {
      title: '১. সহজ ও বন্ধুত্বপূর্ণ তাগাদা',
      subtitle: 'Gentle Reminder',
      text: `প্রিয় ${customerName}, ${storeName} থেকে বিনীত অনুরোধ, আপনার হিসাবের অবশিষ্ট বকেয়া ৳${dueAmount.toLocaleString()} টাকা। অনুগ্রহ করে সুবিধাজনক সময়ে বিল পরিশোধ করে আমাদের সেবা সচল রাখুন। বিকাশ/নগদ: ${storePhone}। ধন্যবাদ।`,
    },
    {
      title: '২. আনুষ্ঠানিক বকেয়া পরিশোধ নোটিশ',
      subtitle: 'Formal Billing Notice',
      text: `সম্মানিত ${customerName}, ${storeName} এ আপনার পূর্ববর্তী ক্রয়ের মোট ৳${dueAmount.toLocaleString()} টাকা বকেয়া অনিষ্পন্ন রয়েছে। আগামী ৩ দিনের মধ্যে হিসাব সমন্বয় করার জন্য অনুরোধ করা হচ্ছে। বিস্তারিত জানতে কল করুন: ${storePhone}।`,
    },
    {
      title: '৩. জরুরি শেষ তাগাদা (Urgent Notice)',
      subtitle: 'Credit Hold Warning',
      text: `জরুরি নোটিশ: সম্মানিত ${customerName}, আপনার অ্যাকাউন্টে ৳${dueAmount.toLocaleString()} টাকার বিল নির্ধারিত সময়সীমা অতিক্রম করেছে। বাকি খাতা ও ক্রেডিট সুবিধা সচল রাখতে অবিলম্বে বকেয়া পরিশোধ করুন। যোগাযোগ: ${storePhone}।`,
    },
    {
      title: '৪. আন্তরিক শুভেচ্ছা সহ বকেয়া স্মরণ',
      subtitle: 'Festive & Relationship',
      text: `সালাম ও আন্তরিক শুভেচ্ছা! ${customerName}, ${storeName} এর সাথে কেনাকাটা করার জন্য ধন্যবাদ। আপনার অ্যাকাউন্টে অবশিষ্ট ৳${dueAmount.toLocaleString()} টাকা জমা দেওয়ার জন্য অনুরোধ করছি। হেল্পলাইন: ${storePhone}।`,
    },
  ];

  const currentText = customMessage || templates[selectedTemplate].text;

  // Bengali Unicode SMS Character count: 70 chars per standard SMS
  const charCount = currentText.length;
  const smsSegments = Math.max(1, Math.ceil(charCount / 70));

  const handleSelectTemplate = (idx: number) => {
    setSelectedTemplate(idx);
    setCustomMessage(templates[idx].text);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSend = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setSentSuccess(true);
      onSendSms(customer, currentText);
      setTimeout(() => {
        setSentSuccess(false);
        onClose();
      }, 2000);
    }, 1200);
  };

  const insertTag = (tag: string) => {
    setCustomMessage(prev => (prev || templates[selectedTemplate].text) + ' ' + tag);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-purple-100 overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
              <MessageSquare className="w-5 h-5 text-purple-200" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight">বকেয়া তাগাদা ও SMS নোটিশ (SMS Portal)</h3>
              <p className="text-xs text-purple-200">
                গ্রাহক: {customer.name} ({customer.phone}) • বকেয়া: ৳{customer.dueAmount.toLocaleString()}
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

        {/* Body Split */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-5 gap-6 flex-1 text-xs">
          
          {/* Left Column: Template Selection & Editor (3 cols) */}
          <div className="md:col-span-3 space-y-4">
            
            {/* Template Selector Pills */}
            <div>
              <label className="font-bold text-slate-700 block mb-1.5">রেডি বাংলা এসএমএস টেমপ্লেট নির্বাচন করুন:</label>
              <div className="grid grid-cols-2 gap-2">
                {templates.map((tpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectTemplate(idx)}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      selectedTemplate === idx
                        ? 'bg-purple-50 border-purple-600 text-purple-900 font-bold shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 font-medium'
                    }`}
                  >
                    <div className="text-xs truncate">{tpl.title}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{tpl.subtitle}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Editable Text Area */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-bold text-slate-700">এসএমএস বার্তা সম্পাদনা:</label>
                <button
                  type="button"
                  onClick={() => handleSelectTemplate(selectedTemplate)}
                  className="text-[11px] text-purple-700 hover:underline flex items-center gap-1 font-semibold"
                >
                  <RefreshCw className="w-3 h-3" /> রিসেট টেমপ্লেট
                </button>
              </div>

              <textarea
                rows={5}
                value={currentText}
                onChange={e => setCustomMessage(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 leading-relaxed focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600"
                placeholder="এখানে কাস্টম বার্তা লিখুন..."
              />

              {/* Character & SMS count counters */}
              <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1 px-1">
                <span>
                  ক্যারেক্টার সংখ্যা: <strong className="text-slate-800">{charCount}</strong> | বাংলা SMS সেগমেন্ট: <strong className="text-purple-700">{smsSegments} টি</strong>
                </span>
                <span className="text-[10px] text-slate-400">প্রতি ৭০ অক্ষরে ১টি বাংলা এসএমএস</span>
              </div>
            </div>

            {/* Dynamic Tag Injectors */}
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">দ্রুত ট্যাগ যুক্ত করুন:</label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => insertTag(`{bKash: ${storePhone}}`)}
                  className="px-2 py-1 bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 rounded-lg text-[10px] font-semibold transition"
                >
                  + বিকাশ নম্বর
                </button>
                <button
                  type="button"
                  onClick={() => insertTag(`[বকেয়া: ৳${dueAmount}]`)}
                  className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[10px] font-semibold transition"
                >
                  + বকেয়া টাকা
                </button>
                <button
                  type="button"
                  onClick={() => insertTag(`[তারিখ: ${new Date().toISOString().slice(0, 10)}]`)}
                  className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-[10px] font-semibold transition"
                >
                  + আজকের তারিখ
                </button>
                <button
                  type="button"
                  onClick={() => insertTag(`JH Helpline: ${helpline}`)}
                  className="px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-[10px] font-semibold transition"
                >
                  + কর্পোরেট হেল্পলাইন
                </button>
              </div>
            </div>

            {/* Gateway Info */}
            <div className="bg-amber-50 rounded-2xl p-3 border border-amber-200 text-amber-900 text-[11px] flex items-start gap-2">
              <Info className="w-4 h-4 shrink-0 text-amber-700 mt-0.5" />
              <div>
                <strong className="block font-bold">JH IMSE টেলিকম গেটওয়ে ইন্টিগ্রেশন:</strong>
                গ্রাহকের মোবাইল নম্বরে (গ্রামীণফোন, রবি, বাংলালিংক, টেলিটক) বাংলা মাস্কিং এসএমএস দ্রুত পাঠানো হবে।
              </div>
            </div>
          </div>

          {/* Right Column: Live Smartphone Preview (2 cols) */}
          <div className="md:col-span-2 flex flex-col items-center">
            <span className="text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">মোবাইল ডিসপ্লে প্রিভিউ</span>
            
            {/* Phone Frame */}
            <div className="w-64 bg-slate-900 rounded-[32px] p-3 shadow-xl border-4 border-slate-700 relative">
              {/* Speaker / Camera Notch */}
              <div className="w-20 h-4 bg-slate-800 rounded-full mx-auto mb-2 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-slate-600 mr-2" />
                <div className="w-10 h-1 bg-slate-700 rounded-full" />
              </div>

              {/* Phone Screen */}
              <div className="bg-slate-100 rounded-[20px] p-3 min-h-[300px] flex flex-col justify-between text-slate-900">
                {/* Screen Header */}
                <div className="text-center pb-2 border-b border-slate-200">
                  <div className="font-extrabold text-xs text-purple-900 truncate">{tenant.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{customer.phone}</div>
                </div>

                {/* SMS Chat Bubble */}
                <div className="my-auto py-2">
                  <div className="bg-purple-700 text-white p-3 rounded-2xl rounded-tr-none text-[11px] leading-relaxed shadow-sm">
                    {currentText}
                  </div>
                  <div className="text-right text-[9px] text-slate-400 mt-1">
                    আজ {new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })} • ডেলিভার্ড ✓✓
                  </div>
                </div>

                {/* Simulated Bottom Navigation */}
                <div className="pt-2 border-t border-slate-200 text-center">
                  <span className="text-[10px] text-slate-400 font-medium">JH Soft SMS Gateway</span>
                </div>
              </div>

              {/* Home indicator bar */}
              <div className="w-16 h-1 bg-slate-600 rounded-full mx-auto mt-2" />
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>সরাসরি গেটওয়ে অথবা কপি করে হোয়াটসঅ্যাপে পাঠানো যাবে</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleCopy}
              className="flex-1 sm:flex-none px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-2xs"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-purple-700" />}
              <span>{copied ? 'কপি হয়েছে!' : 'মেসেজ কপি'}</span>
            </button>

            <button
              type="button"
              onClick={handleSend}
              disabled={isSending || sentSuccess}
              className={`flex-1 sm:flex-none px-5 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs ${
                sentSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-purple-700 hover:bg-purple-800 text-white'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>{isSending ? 'পাঠানো হচ্ছে...' : sentSuccess ? 'সফলভাবে পাঠানো হয়েছে ✓' : 'সরাসরি SMS পাঠান'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
