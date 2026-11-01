import React, { useState } from 'react';
import { 
  Monitor, QrCode, ShoppingCart, Smartphone, Sparkles, CheckCircle2, 
  ExternalLink, X, Store, Volume2, ShieldCheck, Heart
} from 'lucide-react';
import { Tenant, Customer } from '../../types';

interface DisplayCartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
  unit?: string;
}

interface CustomerFacingDisplayModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: Tenant;
  cartItems: DisplayCartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  grandTotal: number;
  paidAmount: number;
  changeAmount: number;
  paymentMethod?: string;
  isCompleted?: boolean;
  customer?: Customer;
}

export const CustomerFacingDisplayModal: React.FC<CustomerFacingDisplayModalProps> = ({
  isOpen,
  onClose,
  tenant,
  cartItems,
  subtotal,
  discount,
  tax,
  grandTotal,
  paidAmount,
  changeAmount,
  paymentMethod = 'cash',
  isCompleted = false,
  customer,
}) => {
  const [selectedQrGateway, setSelectedQrGateway] = useState<'bkash' | 'nagad'>('bkash');

  if (!isOpen) return null;

  // Pop out into a dedicated second monitor window
  const handlePopOutWindow = () => {
    const width = 1024;
    const height = 650;
    const left = window.screen.width ? window.screen.width - width : 100;
    const cfdWindow = window.open(
      '',
      'JH_IMSE_CFD_DISPLAY',
      `width=${width},height=${height},left=${left},top=100,menubar=no,toolbar=no,location=no,status=no`
    );

    if (cfdWindow) {
      cfdWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${tenant.name} - কাস্টমার ডিসপ্লে (CFD)</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;600;700&display=swap');
            body { font-family: 'Hind Siliguri', sans-serif; }
          </style>
        </head>
        <body class="bg-slate-950 text-white min-h-screen p-6 flex flex-col justify-between">
          <div class="flex items-center justify-between border-b border-slate-800 pb-4">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-black text-2xl shadow-lg">
                ${tenant.name.charAt(0)}
              </div>
              <div>
                <h1 class="text-2xl font-black">${tenant.name}</h1>
                <p class="text-sm text-purple-300">স্বাগতম! আপনার কেনাকাটার বিবরণ নিচে প্রদর্শিত হচ্ছে</p>
              </div>
            </div>
            <div class="text-right">
              <span class="text-xs text-slate-400">লাইভ কাউন্টার ডিসপ্লে</span>
              <div class="text-emerald-400 font-bold flex items-center gap-1 justify-end">● সক্রিয় সংযোগ</div>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-6 my-6 flex-1">
            <div class="col-span-2 bg-slate-900 rounded-3xl p-5 border border-slate-800 flex flex-col">
              <h2 class="text-lg font-bold mb-3 flex items-center gap-2">
                <span>🛒 কার্ট আইটেম তালিকা (${cartItems.length})</span>
              </h2>
              <div class="flex-1 overflow-y-auto space-y-2">
                ${cartItems.map(item => `
                  <div class="flex items-center justify-between p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60">
                    <div>
                      <div class="font-bold text-base">${item.name}</div>
                      <div class="text-xs text-slate-400">${item.quantity} ${item.unit || 'pcs'} × ${tenant.currency}${item.price.toFixed(2)}</div>
                    </div>
                    <div class="text-xl font-black text-purple-300">
                      ${tenant.currency}${item.total.toFixed(2)}
                    </div>
                  </div>
                `).join('')}
                ${cartItems.length === 0 ? '<div class="text-center py-16 text-slate-500">বর্তমানে কোনো পণ্য নির্বাচন করা হয়নি</div>' : ''}
              </div>
            </div>

            <div class="col-span-1 flex flex-col justify-between bg-gradient-to-br from-purple-950/70 to-slate-900 rounded-3xl p-6 border border-purple-800/60">
              <div class="space-y-4">
                <div class="text-center bg-white p-4 rounded-2xl text-slate-900 inline-block w-full">
                  <div class="text-xs font-bold text-purple-900 mb-1">bKash / Nagad স্ক্যান করে পে করুন</div>
                  <div class="w-36 h-36 mx-auto bg-slate-100 rounded-xl flex items-center justify-center border border-slate-300 p-2">
                    <svg viewBox="0 0 100 100" class="w-full h-full text-slate-900">
                      <rect width="100" height="100" fill="white"/>
                      <path d="M10 10h30v30h-30z M20 20h10v10h-10z M60 10h30v30h-30z M70 20h10v10h-10z M10 60h30v30h-30z M20 70h10v10h-10z M45 15h10v10h-10z M45 45h10v10h-10z M65 45h25v10h-25z M45 65h10v25h-10z M65 65h10v10h-10z M80 75h10v15h-10z" fill="currentColor"/>
                    </svg>
                  </div>
                  <div class="text-[11px] font-mono font-bold mt-1 text-slate-600">মার্চেন্ট: 01940999830</div>
                </div>

                <div class="space-y-1.5 text-sm pt-2 border-t border-purple-800/40">
                  <div class="flex justify-between text-slate-300">
                    <span>মোট পণ্যের মূল্য:</span>
                    <span>${tenant.currency}${subtotal.toFixed(2)}</span>
                  </div>
                  ${discount > 0 ? `<div class="flex justify-between text-emerald-400"><span>ডিসকাউন্ট:</span><span>-${tenant.currency}${discount.toFixed(2)}</span></div>` : ''}
                  ${tax > 0 ? `<div class="flex justify-between text-slate-300"><span>ভ্যাট / ট্যাক্স:</span><span>+${tenant.currency}${tax.toFixed(2)}</span></div>` : ''}
                </div>
              </div>

              <div class="p-4 rounded-2xl bg-purple-900/60 border border-purple-700/80 text-center mt-4">
                <span class="text-xs uppercase font-bold tracking-widest text-purple-200">সর্বমোট প্রদেয় বিল</span>
                <div class="text-4xl font-black text-amber-300 mt-1">${tenant.currency}${grandTotal.toFixed(2)}</div>
              </div>
            </div>
          </div>

          <div class="text-center text-xs text-slate-500 border-t border-slate-800 pt-3 flex items-center justify-between">
            <span>ক্যাশ মেমো ও ডিজিটাল রসিদ পেতে ক্যাশিয়ারকে মোবাইল নম্বর প্রদান করুন</span>
            <span>JH IMSE Smart POS Dual-Screen Terminal</span>
          </div>
        </body>
        </html>
      `);
      cfdWindow.document.close();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-slate-900 text-white rounded-3xl max-w-4xl w-full border border-purple-800/60 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Control Bar for Cashier */}
        <div className="bg-slate-950 px-5 py-3 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <Monitor className="w-4 h-4 text-purple-400" />
              Sunmi T2s / iMin D4 কাস্টমার-ফেসিং সেকেন্ডারি স্ক্রিন (Dual Screen CFD)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePopOutWindow}
              className="px-3 py-1.5 bg-purple-700 hover:bg-purple-600 text-white rounded-xl font-bold transition flex items-center gap-1.5 shadow-xs"
              title="আলাদা উইন্ডো বা দ্বিতীয় মনিটরে ওপেন করুন"
            >
              <ExternalLink className="w-3.5 h-3.5" /> দ্বিতীয় মনিটরে পপ-আউট
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* CFD Main Screen Area (What the customer sees on the physical 10.1" / 15.6" sub-screen) */}
        <div className="p-5 sm:p-6 flex-1 overflow-y-auto bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 flex flex-col justify-between">
          {/* Header Branding */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-700 to-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-md border border-purple-400/30">
                {tenant.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-black text-white leading-tight">{tenant.name}</h2>
                <p className="text-xs text-purple-300">
                  {tenant.storeBannerText || 'আমাদের দোকানে কেনাকাটার জন্য আপনাকে আন্তরিক ধন্যবাদ!'}
                </p>
              </div>
            </div>

            {customer && (
              <div className="bg-purple-950/80 border border-purple-700/60 px-3.5 py-1.5 rounded-2xl text-right">
                <span className="text-[10px] text-purple-300 block">সম্মানিত গ্রাহক</span>
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1 justify-end">
                  <Sparkles className="w-3 h-3 text-amber-400" /> {customer.name}
                </span>
              </div>
            )}
          </div>

          {/* Body: Cart List (Left) + Dynamic QR & Total (Right) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 my-auto">
            {/* Left 2 Cols: Cart items */}
            <div className="md:col-span-2 bg-slate-900/90 rounded-3xl p-4 border border-slate-800 flex flex-col h-[320px]">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 mb-2">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <ShoppingCart className="w-4 h-4 text-purple-400" /> আপনার আইটেম তালিকা ({cartItems.length})
                </span>
                <span className="text-[11px] text-slate-500 font-mono">কাউন্টার ১ • লাইভ সিঙ্ক</span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {cartItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/60 border border-slate-700/40 hover:border-purple-600/50 transition"
                  >
                    <div>
                      <div className="font-bold text-sm text-slate-100">{item.name}</div>
                      <div className="text-[11px] text-slate-400">
                        {item.quantity} {item.unit || 'pcs'} × {tenant.currency}{item.price.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-base font-black text-purple-300">
                      {tenant.currency}{item.total.toFixed(2)}
                    </div>
                  </div>
                ))}

                {cartItems.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                    <ShoppingCart className="w-10 h-10 mb-2 text-slate-700" />
                    <p className="text-sm font-semibold text-slate-400">বর্তমানে কোনো পণ্য বাছাই করা হয়নি</p>
                    <p className="text-xs text-slate-600 mt-1">পণ্য বারকোড স্ক্যান করামাত্র স্ক্রিনে ভেসে উঠবে</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right 1 Col: Dynamic Scan-to-Pay QR & Big Total */}
            <div className="md:col-span-1 bg-gradient-to-br from-purple-950/60 to-slate-900 rounded-3xl p-4 border border-purple-800/50 flex flex-col justify-between">
              <div>
                {/* QR Gateway Selector */}
                <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800 mb-3 text-[11px]">
                  <button
                    onClick={() => setSelectedQrGateway('bkash')}
                    className={`flex-1 py-1 rounded-lg font-bold transition flex items-center justify-center gap-1 ${
                      selectedQrGateway === 'bkash' ? 'bg-[#e2136e] text-white shadow-xs' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    bKash QR
                  </button>
                  <button
                    onClick={() => setSelectedQrGateway('nagad')}
                    className={`flex-1 py-1 rounded-lg font-bold transition flex items-center justify-center gap-1 ${
                      selectedQrGateway === 'nagad' ? 'bg-[#f7941d] text-white shadow-xs' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Nagad QR
                  </button>
                </div>

                {/* QR Code Container */}
                <div className="bg-white p-3.5 rounded-2xl text-slate-900 text-center shadow-lg">
                  <div className="w-32 h-32 mx-auto bg-slate-50 rounded-xl p-2 border border-slate-200 flex items-center justify-center relative">
                    <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900">
                      <rect width="100" height="100" fill="white" />
                      {/* Stylized QR Code Paths */}
                      <path d="M8 8h28v28h-28z M14 14h16v16h-16z M64 8h28v28h-28z M70 14h16v16h-16z M8 64h28v28h-28z M14 70h16v16h-16z M44 12h12v12h-12z M44 44h12v12h-12z M64 44h28v8h-28z M44 64h8v28h-8z M64 64h12v12h-12z M80 72h12v20h-12z M20 44h16v8h-16z" fill="currentColor" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-[10px] font-black text-purple-800 border border-slate-200">
                        {selectedQrGateway === 'bkash' ? 'বিকাশ' : 'নগদ'}
                      </div>
                    </div>
                  </div>
                  <div className="text-[11px] font-bold text-slate-800 mt-2">
                    {selectedQrGateway === 'bkash' ? 'বিকাশ মার্চেন্ট' : 'নগদ পেমেন্ট'}: 01940999830
                  </div>
                  <div className="text-[10px] text-slate-500">স্ক্যান করে পেমেন্ট সম্পন্ন করুন</div>
                </div>

                {/* Financial Summary */}
                <div className="space-y-1.5 text-xs pt-3 mt-3 border-t border-purple-800/40 text-slate-300">
                  <div className="flex justify-between">
                    <span>উপ-মোট (Subtotal):</span>
                    <span>{tenant.currency}{subtotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-400 font-semibold">
                      <span>ডিসকাউন্ট:</span>
                      <span>-{tenant.currency}{discount.toFixed(2)}</span>
                    </div>
                  )}
                  {tax > 0 && (
                    <div className="flex justify-between">
                      <span>ভ্যাট / ট্যাক্স:</span>
                      <span>+{tenant.currency}{tax.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Huge Grand Total Display */}
              <div className="bg-gradient-to-r from-purple-900 to-indigo-900 p-3.5 rounded-2xl border border-purple-600/60 text-center mt-3 shadow-md">
                <span className="text-[10px] uppercase font-bold tracking-wider text-purple-200 block">
                  সর্বমোট প্রদেয় বিল (Grand Total)
                </span>
                <div className="text-3xl font-black text-amber-300 mt-0.5">
                  {tenant.currency}{grandTotal.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Customer Greeting */}
          <div className="border-t border-slate-800/80 pt-3 mt-4 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> শতভাগ নিরাপদ ও ডিজিটাল বিলিং সিস্টেম
            </span>
            <span className="text-purple-300 font-semibold">
              JH IMSE POS • সানমি ও আইমিন সার্টিফাইড ডুয়াল স্ক্রিন
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
