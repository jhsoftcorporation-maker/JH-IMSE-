import React from 'react';
import { X, Printer, Globe, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { CrossBorderTransaction, Tenant } from '../../types';

interface InternationalInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: CrossBorderTransaction | null;
  tenant: Tenant;
}

export const InternationalInvoiceModal: React.FC<InternationalInvoiceModalProps> = ({
  isOpen,
  onClose,
  transaction,
  tenant,
}) => {
  if (!isOpen || !transaction) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150 my-auto">
        {/* Modal Top Actions */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2.5">
            <Globe className="w-5 h-5 text-purple-400" />
            <div>
              <h3 className="font-bold text-sm">আন্তর্জাতিক বাণিজ্যিক ইনভয়েস ও কাস্টমস ডিক্লারেশন</h3>
              <p className="text-xs text-slate-400">
                NBR মূসক ৬.৩ কমপ্লায়েন্ট • দ্বৈত মুদ্রা (Dual-Currency Commercial Invoice)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              প্রিন্ট ইনভয়েস
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Document Body */}
        <div className="p-8 text-slate-800 space-y-6 text-xs bg-white">
          {/* Exporter Header & NBR Reg */}
          <div className="flex items-start justify-between border-b-2 border-purple-900 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-purple-900">{tenant.name}</span>
                <span className="text-[10px] bg-purple-100 text-purple-800 font-extrabold px-2 py-0.5 rounded uppercase">
                  গ্লোবাল এক্সপোর্ট হাব
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1">{tenant.address}</p>
              <p className="text-[11px] text-slate-600">ফোন: {tenant.phone} • ইমেইল: {tenant.email}</p>
              <div className="flex gap-4 mt-2 text-[10px] font-mono text-slate-700">
                <span><strong>BIN:</strong> {tenant.taxVatNo || '002948192-0101'}</span>
                <span><strong>TIN:</strong> 7841-9921-0021</span>
                <span><strong>ট্রেড লাইসেন্স:</strong> {tenant.tradeLicenseNo || 'TRAD/DN-09214'}</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-extrabold uppercase tracking-widest text-purple-800 block">
                COMMERCIAL EXPORT INVOICE
              </span>
              <span className="font-mono text-base font-black text-slate-900 block mt-1">
                {transaction.transactionNo}
              </span>
              <span className="text-[11px] text-slate-500 block">তারিখ: {transaction.date}</span>
              <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                ✓ PAID VIA {transaction.gateway.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Consignee & Shipping Details */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">আমদানিকারক / প্রাপক (Consignee):</span>
              <strong className="text-xs text-slate-900 block">{transaction.customerName}</strong>
              <p className="text-[11px] text-slate-600">{transaction.customerEmail}</p>
              <p className="text-[11px] text-slate-600 font-semibold mt-0.5">দেশ: {transaction.customerCountry}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">শিপিং ও শুল্ক তথ্য (Customs Data):</span>
              <p className="text-[11px] text-slate-700"><strong>Port of Loading:</strong> Hazrat Shahjalal Int'l Airport (DAC)</p>
              <p className="text-[11px] text-slate-700"><strong>Payment Intent:</strong> {transaction.paymentIntentId}</p>
              <p className="text-[11px] text-slate-700"><strong>Terms of Delivery:</strong> CIF (Cost, Insurance & Freight)</p>
            </div>
          </div>

          {/* Dual-Currency Line Items Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-purple-900 text-white text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">বিবরণ (Item & Description)</th>
                  <th className="py-2.5 px-3">HS কোড</th>
                  <th className="py-2.5 px-3 text-right">মুদ্রা ({transaction.currency})</th>
                  <th className="py-2.5 px-3 text-right">বুকিং রেট</th>
                  <th className="py-2.5 px-3 text-right">লোকাল টাকা (BDT)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800 text-[11px]">
                <tr>
                  <td className="py-3 px-3">
                    <strong className="block text-slate-900">গ্লোবাল ইকমার্স অর্ডার - {transaction.transactionNo}</strong>
                    <span className="text-[10px] text-slate-500">
                      আন্তর্জাতিক পেমেন্ট গেটওয়ে {transaction.gateway.toUpperCase()} এর মাধ্যমে নিষ্পত্তি
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-600">3004.90.00</td>
                  <td className="py-3 px-3 text-right font-black text-slate-900">
                    {transaction.currency} {transaction.foreignAmount.toFixed(2)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-600">
                    ৳{transaction.exchangeRate}
                  </td>
                  <td className="py-3 px-3 text-right font-black text-purple-900">
                    ৳{transaction.baseAmountBDT.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Financial Calculation Breakdown */}
          <div className="flex justify-between items-start pt-2">
            <div className="space-y-2 max-w-xs text-[11px] text-slate-600">
              <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>NBR মূসক ৬.৩ রপ্তানি ধারা অনুচ্ছেদ ০% ভ্যাট রেয়াত</span>
              </div>
              <p className="text-[10px] leading-relaxed text-slate-500">
                Declaration: We declare that this commercial invoice shows the actual value of the goods and that all particulars are true and correct.
              </p>
            </div>

            <div className="w-64 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>মোট বিল ({transaction.currency}):</span>
                <span className="font-bold text-slate-900">{transaction.currency} {transaction.foreignAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>সমতুল্য প্রমিত টাকা (BDT):</span>
                <span className="font-bold text-slate-900">৳{transaction.baseAmountBDT.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
                <span>ফরেক্স নিষ্পত্তি লাভ/ক্ষতি:</span>
                <span className="font-black">
                  {transaction.forexGainLossBDT >= 0 ? '+' : ''}৳{transaction.forexGainLossBDT.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-purple-900 font-black border-t-2 border-purple-900 pt-2 text-sm">
                <span>নিট নিষ্পত্তি ব্যাংক জমা:</span>
                <span>৳{transaction.netAmountBDT.toLocaleString()} BDT</span>
              </div>
            </div>
          </div>

          {/* Authorized Signature Stamp */}
          <div className="pt-10 flex justify-between items-end border-t border-slate-200">
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              <span>JH IMSE Electronic Seal Verified • Valid without manual signature</span>
            </div>
            <div className="text-center">
              <div className="w-36 border-b border-slate-400 mb-1"></div>
              <span className="text-[10px] font-bold text-slate-500 uppercase">অনুমোদিত স্বাক্ষর ও সিল</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
