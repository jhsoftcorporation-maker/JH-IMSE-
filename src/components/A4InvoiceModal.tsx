import React from 'react';
import { Printer, X, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Sale, Tenant } from '../types';

interface A4InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale | null;
  tenant: Tenant;
}

// Helper: Convert number to Bengali words for in-words representation
function numberToBanglaWords(num: number): string {
  const units = ['', 'এক', 'দুই', 'তিন', 'চার', 'পাঁচ', 'ছয়', 'সাত', 'আট', 'নয়'];
  const teens = ['দশ', 'এগারো', 'বারো', 'তেরো', 'চৌদ্দ', 'পনেরো', 'ষোলো', 'সতেরো', 'আঠারো', 'উনিশ'];
  const tens = ['', '', 'বিশ', 'ত্রিশ', 'চল্লিশ', 'পঞ্চাশ', 'ষাট', 'সত্তর', 'আশি', 'নব্বই'];

  if (num === 0) return 'শূন্য টাকা মাত্র';
  const integerPart = Math.floor(num);

  function convertSmall(n: number): string {
    if (n < 10) return units[n];
    if (n < 20) return teens[n - 10];
    const ten = Math.floor(n / 10);
    const unit = n % 10;
    return `${tens[ten]} ${units[unit]}`.trim();
  }

  let words = '';
  const crore = Math.floor(integerPart / 10000000);
  let rem = integerPart % 10000000;
  const lakh = Math.floor(rem / 100000);
  rem = rem % 100000;
  const thousand = Math.floor(rem / 1000);
  rem = rem % 1000;
  const hundred = Math.floor(rem / 100);
  rem = rem % 100;

  if (crore > 0) words += `${convertSmall(crore)} কোটি `;
  if (lakh > 0) words += `${convertSmall(lakh)} লাখ `;
  if (thousand > 0) words += `${convertSmall(thousand)} হাজার `;
  if (hundred > 0) words += `${units[hundred]} শত `;
  if (rem > 0) words += `${convertSmall(rem)} `;

  return `কথায়: ${words.trim()} টাকা মাত্র`;
}

export const A4InvoiceModal: React.FC<A4InvoiceModalProps> = ({
  isOpen,
  onClose,
  sale,
  tenant
}) => {
  if (!isOpen || !sale) return null;

  const handlePrint = () => {
    window.print();
  };

  const isFullyPaid = sale.dueAmount <= 0;
  const isPartial = sale.paidAmount > 0 && sale.dueAmount > 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Modal Controls Header (Hidden in print) */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm">A4 কর্পোরেট ট্যাক্স ইনভয়েস প্রিভিউ</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-900 text-purple-200 border border-purple-700 font-mono">
              {sale.invoiceNumber}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              প্রিন্ট A4 ইনভয়েস
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable A4 Document Content */}
        <div id="a4-printable-area" className="p-8 bg-white text-slate-800 text-xs font-sans space-y-6">
          {/* Header & Logo */}
          <div className="flex items-start justify-between border-b border-slate-200 pb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-purple-700 text-white flex items-center justify-center font-bold text-base">
                  {tenant.name.charAt(0)}
                </div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight">{tenant.name}</h1>
              </div>
              <p className="text-slate-500 text-[11px] max-w-sm leading-relaxed">{tenant.address}</p>
              <p className="text-slate-600 font-medium text-[11px] mt-1">
                ফোন: {tenant.phone} | ইমেইল: {tenant.email}
              </p>
              {tenant.customDomain && (
                <p className="text-purple-700 text-[11px] font-mono">ওয়েবসাইট: www.{tenant.customDomain}</p>
              )}
            </div>

            <div className="text-right space-y-1">
              <div className="inline-block px-3 py-1 bg-purple-50 text-purple-800 font-extrabold text-sm rounded-lg border border-purple-100 uppercase tracking-wider">
                COMMERCIAL INVOICE
              </div>
              <div className="font-mono text-slate-700 font-bold text-xs">
                ইনভয়েস নং: <span className="text-slate-900">{sale.invoiceNumber}</span>
              </div>
              <div className="text-slate-500 text-[11px]">তারিখ ও সময়: {sale.createdAt}</div>
              <div>
                {isFullyPaid && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" /> পরিশোধিত (PAID)
                  </span>
                )}
                {isPartial && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    <Clock className="w-3 h-3" /> আংশিক বাকি (PARTIAL)
                  </span>
                )}
                {!isFullyPaid && !isPartial && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                    <AlertCircle className="w-3 h-3" /> সম্পূর্ণ বাকি (DUE)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Client & Billing Info */}
          <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                ক্রেতার তথ্য (BILL TO)
              </span>
              <h3 className="font-bold text-slate-900 text-sm">{sale.customerName}</h3>
              {sale.customerPhone && (
                <p className="text-slate-600 text-[11px]">মোবাইল: {sale.customerPhone}</p>
              )}
              <p className="text-slate-500 text-[11px]">বিলিং মোড: {sale.pricingType === 'wholesale' ? 'পাইকারি (Wholesale)' : 'খুচরা (Retail MRP)'}</p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                পেমেন্ট ও কাউন্টার বিবরণ
              </span>
              <p className="text-slate-700 text-[11px]">
                ক্যাশিয়ার / প্রস্তুতকারক: <strong className="text-slate-900">{sale.cashierName}</strong>
              </p>
              <p className="text-slate-700 text-[11px]">
                পরিশোধের মাধ্যম: <span className="font-bold text-purple-800 uppercase">{sale.paymentMethod}</span>
                {sale.transactionId && (
                  <span className="font-mono text-slate-500 ml-1">(TrxID: {sale.transactionId})</span>
                )}
              </p>
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="py-2.5 px-3 w-10 text-center">#</th>
                  <th className="py-2.5 px-3">পণ্যের বিবরণ (Description)</th>
                  <th className="py-2.5 px-3 text-center">SKU / ব্যাচ</th>
                  <th className="py-2.5 px-3 text-right">একক দর</th>
                  <th className="py-2.5 px-3 text-center">পরিমাণ</th>
                  <th className="py-2.5 px-3 text-right">মোট (৳)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sale.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 text-center text-slate-400 font-mono text-[10px]">{idx + 1}</td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-900">{item.productName}</div>
                      {item.imei && <div className="text-[10px] text-indigo-600 font-mono">IMEI: {item.imei}</div>}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-[10px] text-slate-500">
                      {item.sku} {item.batchNumber ? `| ${item.batchNumber}` : ''}
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium text-slate-700">
                      ৳{item.price.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-slate-900">
                      {item.quantity} {item.unit || ''}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                      ৳{item.subtotal.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* In-Words and Financial Summary */}
          <div className="grid grid-cols-12 gap-6 pt-2">
            <div className="col-span-7 space-y-3">
              <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100 text-[11px] text-purple-950 font-medium">
                {numberToBanglaWords(sale.totalAmount)}
              </div>
              <div className="text-[10px] text-slate-500 leading-relaxed">
                <strong>শর্তাবলী:</strong> বিক্রিত ওষুধ বা পণ্য ৭ দিনের মধ্যে ক্যাশ মেমোসহ পরিবর্তনযোগ্য (যদি সিল ও মান অক্ষুণ্ণ থাকে)। যেকোনো জিজ্ঞাসা বা সহায়তার জন্য যোগাযোগ করুন: {tenant.phone}
              </div>
            </div>

            <div className="col-span-5 space-y-1.5 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <div className="flex justify-between text-slate-600">
                <span>সাব-টোটাল (Subtotal):</span>
                <span className="font-semibold">৳{sale.subtotal.toFixed(2)}</span>
              </div>
              {sale.discount > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>ডিসকাউন্ট (Discount):</span>
                  <span>-৳{sale.discount.toFixed(2)}</span>
                </div>
              )}
              {sale.tax > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>ভ্যাট / ট্যাক্স (VAT):</span>
                  <span>+৳{sale.tax.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-slate-200 pt-1.5 flex justify-between font-black text-slate-900 text-sm">
                <span>সর্বমোট (Grand Total):</span>
                <span className="text-purple-700">৳{sale.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-semibold pt-1">
                <span>পরিশোধিত (Paid):</span>
                <span>৳{sale.paidAmount.toFixed(2)}</span>
              </div>
              {sale.dueAmount > 0 ? (
                <div className="flex justify-between text-rose-600 font-bold bg-rose-50 px-2 py-1 rounded-lg border border-rose-100">
                  <span>বকেয়া (Due):</span>
                  <span>৳{sale.dueAmount.toFixed(2)}</span>
                </div>
              ) : (
                sale.changeAmount > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>ফেরত দেওয়া হলো (Change):</span>
                    <span>৳{sale.changeAmount.toFixed(2)}</span>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Signatures & Footer Credits */}
          <div className="pt-10 flex justify-between items-end text-center text-xs">
            <div>
              <div className="w-40 border-b border-slate-300 pb-1 mb-1"></div>
              <span className="text-slate-500 text-[11px]">ক্রেতার স্বাক্ষর</span>
            </div>
            <div>
              <div className="w-40 border-b border-slate-300 pb-1 mb-1"></div>
              <span className="text-slate-500 text-[11px]">কর্তৃপক্ষের স্বাক্ষর</span>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 text-center text-[10px] text-slate-400">
            Powered by <strong>JH IMSE</strong> | JH Soft Corporation (Helpline: +8801940999830)
          </div>
        </div>
      </div>
    </div>
  );
};
