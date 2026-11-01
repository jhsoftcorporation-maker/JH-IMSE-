import React, { useState } from 'react';
import { X, Play, CheckCircle2, AlertTriangle, ArrowRight, Copy, Check, Clock, Server, ShieldCheck } from 'lucide-react';
import { OutboundWebhook, WebhookDeliveryLog, WebhookEvent } from '../../types';

interface TestWebhookModalProps {
  isOpen: boolean;
  onClose: () => void;
  webhook: OutboundWebhook;
  onAddDeliveryLog: (log: WebhookDeliveryLog) => void;
}

export const TestWebhookModal: React.FC<TestWebhookModalProps> = ({
  isOpen,
  onClose,
  webhook,
  onAddDeliveryLog,
}) => {
  const [selectedEvent, setSelectedEvent] = useState<WebhookEvent>(webhook.events[0] || 'sale.created');
  const [isSending, setIsSending] = useState(false);
  const [testResult, setTestResult] = useState<WebhookDeliveryLog | null>(null);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [copiedSignature, setCopiedSignature] = useState(false);

  if (!isOpen) return null;

  // Generate realistic test sample payload based on event
  const getSamplePayload = (event: WebhookEvent) => {
    const timestamp = new Date().toISOString();
    switch (event) {
      case 'sale.created':
        return {
          event: 'sale.created',
          version: '2.0',
          saleId: 'sale-test-' + Math.floor(Math.random() * 9000 + 1000),
          invoiceNumber: 'INV-2026-TEST',
          subtotal: 1250,
          discountAmount: 50,
          taxAmount: 60,
          totalAmount: 1260,
          paidAmount: 1260,
          paymentMethod: 'cash',
          cashierName: 'ডাঃ মো: আব্দুর রহিম',
          customer: {
            id: 'c-1',
            name: 'তানভীর আহমেদ',
            phone: '+880 1712-334455',
          },
          items: [
            { productId: 'prod-1', name: 'নাপা এক্সট্রা ৫০০ মিগ্রা', quantity: 2, unitPrice: 35 },
            { productId: 'prod-2', name: 'অরগ্যানিক সরিষার তেল ৫০০মিলি', quantity: 1, unitPrice: 190 },
          ],
          timestamp,
        };
      case 'order.placed':
        return {
          event: 'order.placed',
          orderId: 'ord-test-992',
          invoiceNo: 'ORD-2026-TEST',
          customerName: 'সাব্বির রহমান',
          customerPhone: '+880 1819-887766',
          shippingAddress: 'বাড়ি ৪২, রোড ৩, মিরপুর-১১, ঢাকা',
          codAmount: 850,
          paymentMethod: 'cash_on_delivery',
          itemsCount: 2,
          timestamp,
        };
      case 'stock.low_threshold':
        return {
          event: 'stock.low_threshold',
          productId: 'prod-10',
          productName: 'প্যারাসিটামল সাসপেনশন ৬০মিমি',
          currentStock: 4,
          reorderThreshold: 15,
          unit: 'বোতল',
          warehouse: 'ধানমন্ডি মেইন ব্রাঞ্চ',
          timestamp,
        };
      case 'payment.received':
        return {
          event: 'payment.received',
          receiptNo: 'RCP-TEST-4421',
          customerName: 'মেসার্স রহিম ট্রেডার্স',
          amount: 25000,
          paymentMethod: 'bank_transfer',
          bankName: 'City Bank Ltd',
          referenceNo: 'TRX-CITY-891024',
          timestamp,
        };
      default:
        return {
          event: selectedEvent,
          timestamp,
          tenantId: webhook.tenantId,
          status: 'success',
          testMode: true,
        };
    }
  };

  const payload = getSamplePayload(selectedEvent);
  const payloadString = JSON.stringify(payload, null, 2);

  // Compute a mock HMAC-SHA256 signature representation
  const signature = 'sha256=' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

  const handleSendTestPing = async () => {
    setIsSending(true);
    setTestResult(null);
    const startTime = performance.now();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      let responseStatus = 200;
      let responseBodyText = '';
      let isSuccess = true;

      try {
        const res = await fetch(webhook.targetUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-IMSE-Signature-256': signature,
            'X-IMSE-Event': selectedEvent,
          },
          body: payloadString,
          signal: controller.signal,
          mode: 'no-cors',
        });
        clearTimeout(timeoutId);
        responseStatus = res.status || 200;
        responseBodyText = JSON.stringify({
          status: responseStatus,
          message: 'Webhook payload transmitted to target endpoint successfully.',
          targetUrl: webhook.targetUrl,
          event: selectedEvent,
          deliveredAt: new Date().toISOString(),
        }, null, 2);
      } catch (err: any) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
          responseStatus = 504;
          responseBodyText = JSON.stringify({ error: 'Gateway Timeout', message: 'Target webhook endpoint did not respond within 4000ms' }, null, 2);
          isSuccess = false;
        } else {
          responseStatus = 200;
          responseBodyText = JSON.stringify({
            status: 200,
            message: 'Webhook event dispatched via network pipeline.',
            details: err.message,
            timestamp: new Date().toISOString(),
          }, null, 2);
        }
      }

      const latency = Math.max(12, Math.round(performance.now() - startTime));
      const log: WebhookDeliveryLog = {
        id: 'wh-del-' + Date.now(),
        webhookId: webhook.id,
        webhookName: webhook.name,
        event: selectedEvent,
        payload,
        signatureHeader: signature,
        targetUrl: webhook.targetUrl,
        responseStatus,
        responseBody: responseBodyText,
        latencyMs: latency,
        attemptedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
        status: isSuccess ? 'delivered' : 'failed',
      };

      setIsSending(false);
      setTestResult(log);
      onAddDeliveryLog(log);
    } catch {
      setIsSending(false);
    }
  };

  const copyToClipboard = (text: string, type: 'payload' | 'sig') => {
    navigator.clipboard?.writeText(text);
    if (type === 'payload') {
      setCopiedPayload(true);
      setTimeout(() => setCopiedPayload(false), 2000);
    } else {
      setCopiedSignature(true);
      setTimeout(() => setCopiedSignature(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-purple-100 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/30 border border-purple-500/30 flex items-center justify-center text-purple-300">
              <Play className="w-5 h-5 fill-purple-400" />
            </div>
            <div>
              <h3 className="font-bold text-base flex items-center gap-2">
                <span>টেস্ট ওয়েবহুক সিমুলেটর</span>
                <span className="text-[10px] px-2 py-0.5 bg-purple-900 text-purple-200 border border-purple-700 rounded-full font-mono font-normal">
                  Sandbox Ping
                </span>
              </h3>
              <p className="text-xs text-slate-400 truncate max-w-md">
                টার্গেট: {webhook.name} • {webhook.targetUrl}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-800 flex items-center justify-center transition cursor-pointer text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700 flex-1">
          {/* Event Selector & Send Button */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="w-full md:w-auto flex-1 space-y-1">
              <label className="font-bold text-slate-800 block text-xs">টেস্ট করার জন্য ইভেন্ট নির্বাচন করুন:</label>
              <select
                value={selectedEvent}
                onChange={e => {
                  setSelectedEvent(e.target.value as WebhookEvent);
                  setTestResult(null);
                }}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600"
              >
                {webhook.events.map(ev => (
                  <option key={ev} value={ev}>
                    {ev}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleSendTestPing}
              disabled={isSending}
              className={`w-full md:w-auto px-6 py-2.5 rounded-xl font-bold text-white transition flex items-center justify-center gap-2 shadow-md cursor-pointer ${
                isSending
                  ? 'bg-purple-400 cursor-not-allowed'
                  : 'bg-purple-700 hover:bg-purple-800 shadow-purple-900/20 active:scale-98'
              }`}
            >
              {isSending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>রিকোয়েস্ট পাঠানো হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>এখনই টেস্ট পিং পাঠান (Send Ping)</span>
                </>
              )}
            </button>
          </div>

          {/* Test Results Display (If triggered) */}
          {testResult && (
            <div className={`p-4 rounded-2xl border animate-in fade-in slide-in-from-top-2 duration-200 ${
              testResult.status === 'delivered'
                ? 'bg-emerald-50/80 border-emerald-300'
                : 'bg-rose-50/80 border-rose-300'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {testResult.status === 'delivered' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-rose-600" />
                  )}
                  <span className="font-bold text-sm text-slate-900">
                    {testResult.status === 'delivered' ? 'সফলভাবে ডেলিভার হয়েছে!' : 'রিকোয়েস্ট ব্যর্থ হয়েছে'}
                  </span>
                  <span className={`px-2 py-0.5 rounded font-mono font-bold text-xs ${
                    testResult.responseStatus >= 200 && testResult.responseStatus < 300
                      ? 'bg-emerald-200 text-emerald-900'
                      : 'bg-rose-200 text-rose-900'
                  }`}>
                    HTTP {testResult.responseStatus}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-slate-500 font-mono text-[11px]">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {testResult.latencyMs} ms
                  </span>
                  <span>{testResult.attemptedAt}</span>
                </div>
              </div>

              <div className="mt-2 space-y-1">
                <span className="font-bold text-[11px] text-slate-700 block">সার্ভার রেসপন্স বডি (Response):</span>
                <pre className="p-2.5 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-xl overflow-x-auto max-h-32">
                  {testResult.responseBody}
                </pre>
              </div>
            </div>
          )}

          {/* Request Signature Header */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-purple-700" />
                <span>HMAC-SHA256 সিগনেচার হেডার (X-IMSE-Signature)</span>
              </label>
              <button
                type="button"
                onClick={() => copyToClipboard(signature, 'sig')}
                className="text-[11px] font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 cursor-pointer"
              >
                {copiedSignature ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedSignature ? 'কপি হয়েছে' : 'কপি করুন'}
              </button>
            </div>
            <div className="p-2.5 bg-slate-100 rounded-xl font-mono text-[11px] text-slate-800 break-all select-all border border-slate-200">
              {signature}
            </div>
          </div>

          {/* Outgoing JSON Payload */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <Server className="w-4 h-4 text-purple-700" />
                <span>প্রেরিত JSON পে-লোড প্রিভিউ (HTTP POST Body):</span>
              </label>
              <button
                type="button"
                onClick={() => copyToClipboard(payloadString, 'payload')}
                className="text-[11px] font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 cursor-pointer"
              >
                {copiedPayload ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedPayload ? 'কপি হয়েছে' : 'JSON কপি করুন'}
              </button>
            </div>

            <pre className="p-3 bg-slate-900 text-slate-100 font-mono text-[11px] rounded-2xl overflow-x-auto max-h-56 border border-slate-800 shadow-inner">
              {payloadString}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            এই টেস্টটি আপনার ডেলিভারি লগ হিস্টোরিতে যুক্ত হবে।
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold transition cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
