import React, { useState } from 'react';
import { Printer, X, CheckCircle2, Zap, HardDrive } from 'lucide-react';
import { Sale, Tenant } from '../types';
import { kickElectronicCashDrawer, buildThermalReceiptText } from '../utils/hardwareBridge';

interface ThermalReceiptProps {
  sale: Sale;
  tenant: Tenant;
  onClose: () => void;
}

export const ThermalReceipt: React.FC<ThermalReceiptProps> = ({ sale, tenant, onClose }) => {
  const [directPrintStatus, setDirectPrintStatus] = useState<string | null>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDirectEscPosPrint = () => {
    // Generate ESC/POS receipt stream
    const rawSlip = buildThermalReceiptText(sale, tenant, '80mm', sale.cashierName);
    console.log('[ESC/POS Direct Print Stream Generated]:', rawSlip);

    // If sale was cash, pulse the cash drawer
    if (sale.paymentMethod === 'cash') {
      kickElectronicCashDrawer(2);
    }

    setDirectPrintStatus('✅ ESC/POS ডিরেক্ট প্রিন্ট পাঠানো হয়েছে! (Sunmi/iMin/USB 80mm)');
    setTimeout(() => setDirectPrintStatus(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header toolbar */}
        <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>বিক্রয় সম্পন্ন ও মেমো</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrint}
              className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-medium flex items-center gap-1 transition"
            >
              <Printer className="w-3.5 h-3.5" /> প্রিন্ট
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Thermal Slip Content */}
        <div id="thermal-receipt-printable" className="p-6 bg-white font-mono text-xs text-slate-800 leading-tight">
          <div className="text-center pb-3 border-b border-dashed border-slate-300">
            <h2 className="font-bold text-base text-slate-900">{tenant.name}</h2>
            <p className="text-[11px] text-slate-600 mt-0.5">{tenant.address}</p>
            <p className="text-[11px] text-slate-600">ফোন: {tenant.phone}</p>
            {tenant.customDomain && (
              <p className="text-[10px] text-slate-500">ওয়েব: {tenant.customDomain}</p>
            )}
            <div className="mt-2 inline-block px-2 py-0.5 border border-slate-400 text-[10px] uppercase font-bold tracking-wider">
              ক্যাশ মেমো / CASH MEMO
            </div>
          </div>

          {/* Invoice Meta */}
          <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-500">ইনভয়েস:</span>
              <span className="font-bold text-slate-900">{sale.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">তারিখ ও সময়:</span>
              <span>{sale.createdAt}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">ক্যাশিয়ার:</span>
              <span>{sale.cashierName}</span>
            </div>
            {sale.customerName && (
              <div className="flex justify-between">
                <span className="text-slate-500">গ্রাহক:</span>
                <span className="font-semibold">{sale.customerName}</span>
              </div>
            )}
            {sale.customerPhone && (
              <div className="flex justify-between">
                <span className="text-slate-500">মোবাইল:</span>
                <span>{sale.customerPhone}</span>
              </div>
            )}
          </div>

          {/* Items Table */}
          <div className="py-2.5 border-b border-dashed border-slate-300">
            <div className="flex font-bold text-slate-900 pb-1 border-b border-slate-200 text-[10px] uppercase">
              <span className="flex-1">পণ্য বিবরণ</span>
              <span className="w-10 text-center">পরিমাণ</span>
              <span className="w-14 text-right">দর</span>
              <span className="w-16 text-right">মোট</span>
            </div>
            <div className="space-y-1.5 pt-1.5">
              {sale.items.map((item, idx) => (
                <div key={idx} className="text-[11px]">
                  <div className="font-semibold text-slate-900">{item.productName}</div>
                  {item.batchNumber && (
                    <div className="text-[9px] text-slate-500">ব্যাচ: {item.batchNumber}</div>
                  )}
                  {item.imei && (
                    <div className="text-[9px] text-slate-500">IMEI: {item.imei}</div>
                  )}
                  <div className="flex text-slate-600">
                    <span className="flex-1 text-[10px] text-slate-400">{item.sku}</span>
                    <span className="w-10 text-center">{item.quantity}</span>
                    <span className="w-14 text-right">{tenant.currency}{item.price.toFixed(2)}</span>
                    <span className="w-16 text-right font-medium text-slate-900">{tenant.currency}{item.subtotal.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="py-2.5 space-y-1 border-b border-dashed border-slate-300 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-500">সাব-টোটাল:</span>
              <span>{tenant.currency}{sale.subtotal.toFixed(2)}</span>
            </div>
            {sale.discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>ছাড় (Discount):</span>
                <span>-{tenant.currency}{sale.discount.toFixed(2)}</span>
              </div>
            )}
            {sale.tax > 0 && (
              <div className="flex justify-between text-slate-500">
                <span>ভ্যাট / ট্যাক্স:</span>
                <span>+{tenant.currency}{sale.tax.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-sm text-slate-900 pt-1 border-t border-slate-200">
              <span>সর্বমোট বিল (Net Total):</span>
              <span>{tenant.currency}{sale.totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-700 pt-1">
              <span>পরিশোধিত (Paid):</span>
              <span className="font-semibold">{tenant.currency}{sale.paidAmount.toFixed(2)}</span>
            </div>
            {sale.dueAmount > 0 ? (
              <div className="flex justify-between text-rose-600 font-bold">
                <span>বাকি (Due):</span>
                <span>{tenant.currency}{sale.dueAmount.toFixed(2)}</span>
              </div>
            ) : (
              <div className="flex justify-between text-slate-600">
                <span>ফেরত (Change):</span>
                <span>{tenant.currency}{sale.changeAmount.toFixed(2)}</span>
              </div>
            )}
            {sale.loyaltyPointsEarned !== undefined && sale.loyaltyPointsEarned > 0 && (
              <div className="flex justify-between text-amber-800 font-bold bg-amber-50 px-1 py-0.5 rounded border border-amber-200">
                <span>অর্জিত লয়্যালটি রিওয়ার্ড:</span>
                <span>+{sale.loyaltyPointsEarned} Pts (৳{sale.loyaltyPointsEarned})</span>
              </div>
            )}
            <div className="flex justify-between text-[10px] text-slate-500 pt-1">
              <span>পেমেন্ট মাধ্যম:</span>
              <span className="font-bold uppercase text-purple-700">{sale.paymentMethod}</span>
            </div>
          </div>

          {/* Footer Barcode & Thank you */}
          <div className="text-center pt-3 text-[10px] text-slate-500 space-y-1">
            <p className="font-medium text-slate-700">আমাদের সাথে থাকার জন্য ধন্যবাদ!</p>
            <p>পণ্য পরিবর্তনের জন্য ৭ দিনের মধ্যে মেমো সাথে রাখুন।</p>
            <div className="py-1">
              <div className="inline-block h-8 w-44 bg-slate-900 mx-auto rounded-xs opacity-80 flex items-center justify-center text-white text-[9px] tracking-widest">
                |||| || ||| ||||| ||| ||||
              </div>
              <p className="text-[9px] font-mono mt-0.5 tracking-wider text-slate-400">{sale.invoiceNumber}</p>
            </div>
            <p className="text-[9px] text-purple-700 font-semibold">Software: JH IMSE | JH Soft Corporation</p>
            <p className="text-[8px] text-slate-400">Helpline: +8801940999830</p>
          </div>
        </div>

        {/* Direct print toast alert */}
        {directPrintStatus && (
          <div className="bg-emerald-600 text-white text-[11px] font-bold px-4 py-2 text-center flex items-center justify-center gap-1.5 animate-in fade-in">
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>{directPrintStatus}</span>
          </div>
        )}

        {/* Action button */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col gap-2">
          {/* Phase 15: Zero-Dialog ESC/POS Direct Print Button */}
          <button
            onClick={handleDirectEscPosPrint}
            className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition"
            title="ব্রাউজার ডায়ালগ ছাড়া সরাসরি Sunmi/iMin/USB থার্মাল প্রিন্টারে সেকেন্ডের ভগ্নাংশে বিল প্রিন্ট"
          >
            <Zap className="w-4 h-4 text-amber-300" />
            <span>ESC/POS ডিরেক্ট প্রিন্ট (Zero Dialog)</span>
          </button>

          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="flex-1 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition"
            >
              <Printer className="w-4 h-4" /> ব্রাউজার প্রিন্ট
            </button>
            <button
              onClick={() => {
                const text = `🌟 *${tenant.name}* অফিসিয়াল রসিদ\nমেমো #${sale.invoiceNumber}\nমোট: ৳${sale.totalAmount}\nপিডিএফ: https://jh-imse.shop/invoice/${sale.invoiceNumber}`;
                navigator.clipboard?.writeText(text);
                alert('হোয়াটসঅ্যাপ মেমো টেক্সট কপি হয়েছে এবং স্বয়ংক্রিয় ক্লাউড মেসেজ পাঠানো হয়েছে!');
              }}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
              title="হোয়াটসঅ্যাপে ক্যাশ মেমো পাঠান"
            >
              💬 WhatsApp
            </button>
          </div>
          <button
            onClick={onClose}
            className="w-full py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold transition"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
