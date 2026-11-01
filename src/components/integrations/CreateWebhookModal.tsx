import React, { useState } from 'react';
import { X, ShieldAlert, Key, Globe, CheckSquare, Square, RefreshCw, Send } from 'lucide-react';
import { OutboundWebhook, WebhookEvent } from '../../types';

interface CreateWebhookModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantId: string;
  onSaveWebhook: (webhook: OutboundWebhook) => void;
  existingWebhook?: OutboundWebhook | null;
}

const AVAILABLE_EVENTS: { id: WebhookEvent; label: string; desc: string; category: string }[] = [
  { id: 'sale.created', label: 'বিক্রয় সম্পন্ন (sale.created)', desc: 'POS কাউন্টারে নতুন বিক্রয় ও চালান ইস্যু হলে', category: 'Sales' },
  { id: 'sale.refunded', label: 'বিক্রয় ফেরত (sale.refunded)', desc: 'ক্রেতাকে পণ্য ফেরত ও ক্রেডিট নোট তৈরি হলে', category: 'Sales' },
  { id: 'order.placed', label: 'অনলাইন অর্ডার (order.placed)', desc: 'অনলাইন স্টোরে গ্রাহক নতুন অর্ডার প্লেস করলে', category: 'Orders' },
  { id: 'order.delivered', label: 'অর্ডার ডেলিভারি (order.delivered)', desc: 'কুরিয়ার বা সেলসম্যান পার্সেল ডেলিভারি করলে', category: 'Orders' },
  { id: 'stock.low_threshold', label: 'লো-স্টক সতর্কবার্তা (stock.low_threshold)', desc: 'পণ্য সর্বনিম্ন রি-অর্ডার সীমার নিচে নেমে গেলে', category: 'Inventory' },
  { id: 'customer.created', label: 'নতুন গ্রাহক (customer.created)', desc: 'নতুন কাস্টমার বা হোলসেলার নিবন্ধিত হলে', category: 'CRM' },
  { id: 'payment.received', label: 'পেমেন্ট রসিদ (payment.received)', desc: 'বকেয়া পরিশোধ বা ক্যাশ/ডিজিটাল পেমেন্ট পেলে', category: 'Finance' },
  { id: 'service.ticket_completed', label: 'সার্ভিস সম্পন্ন (service.ticket_completed)', desc: 'ডিভাইস রিপেয়ার ও টেকনিশিয়ান চেকলিস্ট সমাপ্ত হলে', category: 'Service' },
];

export const CreateWebhookModal: React.FC<CreateWebhookModalProps> = ({
  isOpen,
  onClose,
  tenantId,
  onSaveWebhook,
  existingWebhook,
}) => {
  const [name, setName] = useState(existingWebhook?.name || '');
  const [targetUrl, setTargetUrl] = useState(existingWebhook?.targetUrl || '');
  const [secretKey, setSecretKey] = useState(
    existingWebhook?.secretKey || 'whsec_' + Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
  );
  const [selectedEvents, setSelectedEvents] = useState<WebhookEvent[]>(
    existingWebhook?.events || ['sale.created', 'order.placed']
  );
  const [isActive, setIsActive] = useState<boolean>(existingWebhook ? existingWebhook.isActive : true);
  const [description, setDescription] = useState(existingWebhook?.description || '');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRegenerateKey = () => {
    const newKey = 'whsec_' + Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    setSecretKey(newKey);
  };

  const toggleEvent = (event: WebhookEvent) => {
    setSelectedEvents(prev =>
      prev.includes(event) ? prev.filter(e => e !== event) : [...prev, event]
    );
  };

  const handleSelectAllEvents = () => {
    if (selectedEvents.length === AVAILABLE_EVENTS.length) {
      setSelectedEvents([]);
    } else {
      setSelectedEvents(AVAILABLE_EVENTS.map(e => e.id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('অনুগ্রহ করে ওয়েবহুকের একটি অর্থপূর্ণ নাম প্রদান করুন।');
      return;
    }
    if (!targetUrl.trim() || !targetUrl.startsWith('https://')) {
      setError('টার্গেট ইউআরএল অবশ্যই একটি বৈধ সুরক্ষিত HTTPS লিংক হতে হবে (e.g. https://api.crm.com/webhook)।');
      return;
    }
    if (selectedEvents.length === 0) {
      setError('কমপক্ষে একটি ট্রিগার ইভেন্ট নির্বাচন করতে হবে।');
      return;
    }

    const payload: OutboundWebhook = {
      id: existingWebhook ? existingWebhook.id : 'wh-' + Date.now(),
      tenantId,
      name: name.trim(),
      targetUrl: targetUrl.trim(),
      secretKey,
      events: selectedEvents,
      isActive,
      createdAt: existingWebhook ? existingWebhook.createdAt : new Date().toISOString().slice(0, 10),
      lastTriggeredAt: existingWebhook?.lastTriggeredAt,
      successCount: existingWebhook ? existingWebhook.successCount : 0,
      failureCount: existingWebhook ? existingWebhook.failureCount : 0,
      description: description.trim(),
    };

    onSaveWebhook(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-purple-100 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-purple-800 to-indigo-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
              <Globe className="w-5 h-5 text-purple-200" />
            </div>
            <div>
              <h3 className="font-bold text-base">
                {existingWebhook ? 'ওয়েবহুক সম্পাদনা করুন' : 'নতুন আউটবাউন্ড ওয়েবহুক নিবন্ধন (Webhooks Hub)'}
              </h3>
              <p className="text-xs text-purple-200">
                রিয়েল-টাইম ইভেন্টে থার্ড-পার্টি সিস্টেমে HMAC-SHA256 সাইন্ড ডাটা প্রেরণ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition cursor-pointer text-purple-200 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700 flex-1">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Webhook Name & Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1">
              <label className="font-bold text-slate-800 block">ওয়েবহুকের নাম (Webhook Name) *</label>
              <input
                type="text"
                value={name}
                onChange={e => { setName(e.target.value); setError(null); }}
                placeholder="যেমন: Steadfast Courier Auto-Dispatch"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600 text-xs font-semibold"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-800 block">স্ট্যাটাস (Status)</label>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`w-full py-2 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
                  isActive
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-slate-100 border-slate-300 text-slate-600'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-600 animate-pulse' : 'bg-slate-400'}`} />
                {isActive ? 'সক্রিয় (Active)' : 'নিষ্ক্রিয় (Disabled)'}
              </button>
            </div>
          </div>

          {/* Target URL */}
          <div className="space-y-1">
            <label className="font-bold text-slate-800 block flex items-center justify-between">
              <span>টার্গেট এন্ডপয়েন্ট ইউআরএল (Target HTTPS URL) *</span>
              <span className="text-[10px] text-slate-400 font-normal">HTTP POST মেথডে পে-লোড যাবে</span>
            </label>
            <input
              type="url"
              value={targetUrl}
              onChange={e => { setTargetUrl(e.target.value); setError(null); }}
              placeholder="https://api.external-service.com/webhooks/imse"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600 text-xs font-mono"
              required
            />
          </div>

          {/* Secret Signing Key */}
          <div className="space-y-1 bg-purple-50/60 p-3.5 rounded-2xl border border-purple-100">
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-purple-950 flex items-center gap-1.5 text-xs">
                <Key className="w-3.5 h-3.5 text-purple-700" />
                HMAC-SHA256 সিক্রেট কি (Secret Signing Key)
              </label>
              <button
                type="button"
                onClick={handleRegenerateKey}
                className="text-[11px] font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                নতুন কি তৈরি করুন
              </button>
            </div>
            <p className="text-[11px] text-purple-800 mb-2">
              প্রতিটি রিকোয়েস্টের হেডারে <code className="bg-purple-200/70 px-1 py-0.5 rounded font-mono text-[10px]">X-IMSE-Signature</code> পাঠানো হবে। আপনার সার্ভার এই কি দিয়ে সিগনেচার ভেরিফাই করবে।
            </p>
            <input
              type="text"
              value={secretKey}
              readOnly
              className="w-full px-3 py-1.5 bg-white border border-purple-200 rounded-xl text-purple-900 font-mono text-[11px] select-all"
            />
          </div>

          {/* Event Triggers */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-900 text-xs">ট্রিগার ইভেন্টসমূহ (Subscription Events) *</label>
              <button
                type="button"
                onClick={handleSelectAllEvents}
                className="text-purple-700 hover:text-purple-900 font-bold text-[11px] cursor-pointer"
              >
                {selectedEvents.length === AVAILABLE_EVENTS.length ? 'সব বাদ দিন' : 'সবগুলো নির্বাচন করুন'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {AVAILABLE_EVENTS.map(event => {
                const isSelected = selectedEvents.includes(event.id);
                return (
                  <div
                    key={event.id}
                    onClick={() => toggleEvent(event.id)}
                    className={`p-3 rounded-xl border transition cursor-pointer flex items-start gap-2.5 ${
                      isSelected
                        ? 'bg-purple-50/80 border-purple-400 shadow-2xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="mt-0.5 text-purple-700">
                      {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-300" />}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                        <span>{event.label}</span>
                        <span className="text-[9px] px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                          {event.category}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">{event.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="font-bold text-slate-800 block">বিবরণ / নোটস (Optional)</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="এই ওয়েবহুকটি কী উদ্দেশ্যে ব্যবহার হচ্ছে লিখুন..."
              rows={2}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600 text-xs"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-purple-700 to-indigo-800 hover:from-purple-800 hover:to-indigo-900 text-white rounded-xl font-bold transition shadow-md shadow-purple-900/20 cursor-pointer flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              {existingWebhook ? 'আপডেট সংরক্ষণ করুন' : 'ওয়েবহুক সক্রিয় করুন'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
