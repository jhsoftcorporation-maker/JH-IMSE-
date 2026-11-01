import React from 'react';
import { ServiceJobTicket, Tenant } from '../../types';
import { Printer, X, Wrench, ShieldCheck, QrCode } from 'lucide-react';

interface ServiceJobPrintSlipProps {
  ticket: ServiceJobTicket;
  tenant: Tenant;
  onClose: () => void;
  format?: 'thermal' | 'a4';
}

export const ServiceJobPrintSlip: React.FC<ServiceJobPrintSlipProps> = ({
  ticket,
  tenant,
  onClose,
  format: initialFormat = 'thermal',
}) => {
  const [format, setFormat] = React.useState<'thermal' | 'a4'>(initialFormat);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Top Control Bar (Hidden on print) */}
        <div className="bg-purple-900 text-white px-6 py-3.5 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-purple-300" />
            <div>
              <h3 className="font-bold text-sm">সার্ভিস জব কার্ড ভাউচার / স্লিপ</h3>
              <p className="text-[11px] text-purple-200 font-mono">{ticket.ticketNumber}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-purple-950/60 p-1 rounded-xl flex items-center text-xs">
              <button
                type="button"
                onClick={() => setFormat('thermal')}
                className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                  format === 'thermal' ? 'bg-purple-600 text-white font-bold' : 'text-purple-300 hover:text-white'
                }`}
              >
                ৮০মিমি থার্মাল
              </button>
              <button
                type="button"
                onClick={() => setFormat('a4')}
                className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                  format === 'a4' ? 'bg-purple-600 text-white font-bold' : 'text-purple-300 hover:text-white'
                }`}
              >
                A4 পেপার
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              প্রিন্ট করুন
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-purple-200 hover:text-white rounded-lg hover:bg-purple-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Area */}
        <div className="p-6 overflow-y-auto max-h-[80vh] bg-slate-50 flex justify-center">
          {format === 'thermal' ? (
            /* 80mm POS Slip Format */
            <div 
              id="service-slip-thermal"
              className="bg-white p-5 w-[330px] shadow-sm border border-slate-200 rounded-2xl text-slate-800 font-sans text-xs print:w-[80mm] print:border-none print:shadow-none print:p-2"
            >
              {/* Header */}
              <div className="text-center pb-3 border-b border-dashed border-slate-300">
                <h2 className="font-extrabold text-sm text-slate-900 uppercase tracking-tight">{tenant.name}</h2>
                <p className="text-[10px] text-slate-600 mt-0.5">{tenant.address}</p>
                <p className="text-[10px] text-slate-600 font-mono">মোবাইল: {tenant.phone}</p>
                <div className="mt-2 inline-block bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-slate-200">
                  🔧 রিপেয়ার ও সার্ভিস জব কার্ড
                </div>
              </div>

              {/* Ticket Meta */}
              <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">জব টিকিট নং:</span>
                  <span className="font-mono font-bold text-slate-900">{ticket.ticketNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">তারিখ ও সময়:</span>
                  <span className="font-mono">{ticket.intakeDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">প্রত্যাশিত ডেলিভারি:</span>
                  <span className="font-bold text-purple-700 font-mono">{ticket.expectedDeliveryDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">অগ্রাধিকার:</span>
                  <span className="font-bold uppercase text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                    {ticket.priority}
                  </span>
                </div>
              </div>

              {/* Customer Info */}
              <div className="py-2.5 border-b border-dashed border-slate-300 space-y-0.5 text-[11px]">
                <div className="font-bold text-slate-900">{ticket.customerName}</div>
                <div className="text-slate-600 font-mono">{ticket.customerPhone}</div>
                {ticket.customerAddress && <div className="text-[10px] text-slate-500 truncate">{ticket.customerAddress}</div>}
              </div>

              {/* Device Details */}
              <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
                <div className="font-bold text-slate-900">যন্ত্রপাতি / ডিভাইসের বিবরণ:</div>
                <div className="flex justify-between">
                  <span className="text-slate-500">মডেল:</span>
                  <span className="font-semibold text-slate-800">{ticket.brand} {ticket.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">সিরিয়াল/IMEI:</span>
                  <span className="font-mono text-slate-900">{ticket.imeiOrSerial}</span>
                </div>
                {ticket.deviceColor && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">রং:</span>
                    <span>{ticket.deviceColor}</span>
                  </div>
                )}
                {ticket.accessoriesReceived.length > 0 && (
                  <div className="mt-1 pt-1 border-t border-slate-100">
                    <span className="text-[10px] text-slate-500 block">গৃহীত আনুষঙ্গিক (Accessories):</span>
                    <span className="text-[10px] text-slate-700">{ticket.accessoriesReceived.join(', ')}</span>
                  </div>
                )}
              </div>

              {/* Problem Description */}
              <div className="py-2.5 border-b border-dashed border-slate-300 text-[11px]">
                <div className="font-bold text-slate-900 mb-0.5">গ্রাহকের অভিযোগ / সমস্যা:</div>
                <div className="bg-slate-50 p-2 rounded-lg text-slate-700 text-[10px] leading-relaxed border border-slate-200">
                  {ticket.reportedIssues}
                </div>
              </div>

              {/* Spare Parts Consumed */}
              {ticket.partsUsed && ticket.partsUsed.length > 0 && (
                <div className="py-2.5 border-b border-dashed border-slate-300 text-[11px]">
                  <div className="font-bold text-slate-900 mb-1">ব্যবহৃত খুচরা যন্ত্রাংশ (Spare Parts):</div>
                  <table className="w-full text-[10px]">
                    <tbody>
                      {ticket.partsUsed.map((p, idx) => (
                        <tr key={idx} className="border-b border-slate-100 last:border-none">
                          <td className="py-1 text-slate-800">{p.productName} <span className="text-slate-400">x{p.quantity}</span></td>
                          <td className="py-1 text-right font-mono font-bold text-slate-900">{tenant.currency}{p.subtotal}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Billing Summary */}
              <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
                <div className="flex justify-between text-slate-600">
                  <span>সার্ভিস শ্রম চার্জ (Labor):</span>
                  <span className="font-mono">{tenant.currency}{ticket.laborCost}</span>
                </div>
                {ticket.partsCost > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>পার্টস খরচ (Parts):</span>
                    <span className="font-mono">{tenant.currency}{ticket.partsCost}</span>
                  </div>
                )}
                {ticket.discount > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>বিশেষ ছাড় (Discount):</span>
                    <span className="font-mono">-{tenant.currency}{ticket.discount}</span>
                  </div>
                )}
                <div className="flex justify-between font-extrabold text-xs text-slate-900 pt-1 border-t border-slate-200">
                  <span>সর্বমোট প্রাক্কলিত খরচ:</span>
                  <span className="font-mono">{tenant.currency}{ticket.totalCost}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>অগ্রিম জমা (Advance):</span>
                  <span className="font-mono">{tenant.currency}{ticket.advancePaid}</span>
                </div>
                <div className="flex justify-between text-rose-700 font-bold text-xs bg-rose-50 px-2 py-1 rounded">
                  <span>অবশিষ্ট বকেয়া (Due):</span>
                  <span className="font-mono">{tenant.currency}{ticket.dueAmount}</span>
                </div>
              </div>

              {/* QR Verification & Signatures */}
              <div className="pt-3 text-center space-y-2">
                <div className="inline-flex flex-col items-center justify-center p-2 bg-slate-50 border border-slate-200 rounded-xl">
                  <QrCode className="w-16 h-16 text-slate-800" />
                  <span className="text-[9px] font-mono text-slate-500 mt-1">TRACK: {ticket.ticketNumber}</span>
                </div>

                <div className="text-[9px] text-slate-400 text-left pt-2 leading-tight">
                  * শর্তাবলী: ডেলিভারির সময় এই স্লিপ প্রদর্শন বাধ্যতামূলক। ৩০ দিনের মধ্যে পণ্য ডেলিভারি না নিলে কর্তৃপক্ষ দায়ী থাকবে না।
                </div>

                <div className="grid grid-cols-2 gap-4 pt-6 text-[10px]">
                  <div className="border-t border-slate-400 pt-1 text-slate-600">গ্রাহকের স্বাক্ষর</div>
                  <div className="border-t border-slate-400 pt-1 text-slate-600">টেকনিশিয়ান স্বাক্ষর</div>
                </div>
              </div>
            </div>
          ) : (
            /* A4 Service Sheet Format */
            <div 
              id="service-slip-a4"
              className="bg-white p-8 w-[620px] shadow-sm border border-slate-200 rounded-2xl text-slate-800 font-sans text-xs print:w-full print:border-none print:shadow-none"
            >
              {/* Header */}
              <div className="flex justify-between items-start pb-4 border-b-2 border-purple-800">
                <div>
                  <h1 className="text-xl font-black text-purple-900 tracking-tight">{tenant.name}</h1>
                  <p className="text-slate-600 mt-0.5">{tenant.address}</p>
                  <p className="text-slate-600 font-mono">মোবাইল: {tenant.phone} | ইমেইল: {tenant.email}</p>
                  <p className="text-[10px] text-slate-400">ট্রেড লাইসেন্স: {tenant.tradeLicenseNo || 'TRAD/2026/0912'}</p>
                </div>
                <div className="text-right">
                  <div className="inline-block bg-purple-100 text-purple-900 px-3 py-1 rounded-lg text-xs font-bold border border-purple-200">
                    SERVICE JOB CARD
                  </div>
                  <div className="text-base font-extrabold font-mono text-slate-900 mt-1">{ticket.ticketNumber}</div>
                  <div className="text-[11px] text-slate-500">তারিখ: {ticket.intakeDate}</div>
                </div>
              </div>

              {/* Grid 2 Column (Customer & Device) */}
              <div className="grid grid-cols-2 gap-4 py-4 border-b border-slate-200">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-900 block text-xs border-b border-slate-200 pb-1 mb-1">
                    গ্রাহক তথ্য (Customer Information):
                  </span>
                  <div><span className="text-slate-500">নাম:</span> <strong className="text-slate-900">{ticket.customerName}</strong></div>
                  <div><span className="text-slate-500">মোবাইল:</span> <span className="font-mono text-slate-800 font-bold">{ticket.customerPhone}</span></div>
                  <div><span className="text-slate-500">ঠিকানা:</span> <span className="text-slate-700">{ticket.customerAddress || 'N/A'}</span></div>
                </div>

                <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100 space-y-1">
                  <span className="font-bold text-purple-900 block text-xs border-b border-purple-100 pb-1 mb-1">
                    ডিভাইস বিবরণ (Equipment Details):
                  </span>
                  <div><span className="text-slate-500">ডিভাইস:</span> <span className="font-bold text-slate-900">{ticket.deviceType}</span></div>
                  <div><span className="text-slate-500">ব্র্যান্ড ও মডেল:</span> <span>{ticket.brand} - {ticket.model}</span></div>
                  <div><span className="text-slate-500">IMEI/Serial:</span> <span className="font-mono font-bold text-purple-900">{ticket.imeiOrSerial}</span></div>
                  <div><span className="text-slate-500">ওয়ারেন্টি কভারেজ:</span> <span className="capitalize font-semibold text-emerald-800">{ticket.warrantyStatus.replace(/_/g, ' ')}</span></div>
                </div>
              </div>

              {/* Problem Diagnosis */}
              <div className="py-3 border-b border-slate-200 space-y-2">
                <div>
                  <span className="font-bold text-slate-900 block text-xs">রিপোর্টেড সমস্যা (Reported Problem / Fault):</span>
                  <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200 mt-1">{ticket.reportedIssues}</p>
                </div>
                {ticket.diagnosticNotes && (
                  <div>
                    <span className="font-bold text-slate-900 block text-xs">টেকনিশিয়ান পর্যবেক্ষণ (Diagnostic Findings):</span>
                    <p className="text-purple-900 bg-purple-50/60 p-2.5 rounded-lg border border-purple-100 mt-1">{ticket.diagnosticNotes}</p>
                  </div>
                )}
              </div>

              {/* Parts & Cost Calculation Table */}
              <div className="py-3 border-b border-slate-200">
                <span className="font-bold text-slate-900 block text-xs mb-2">সার্ভিস ফি ও পার্টস হিসাব:</span>
                <table className="w-full text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3 text-left">আইটেম বিবরণ</th>
                      <th className="py-2 px-3 text-center">পরিমাণ</th>
                      <th className="py-2 px-3 text-right">একক মূল্য</th>
                      <th className="py-2 px-3 text-right">মোট (BDT)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-2 px-3 font-medium text-slate-800">টেকনিক্যাল ডায়াগনসিস ও শ্রম চার্জ (Labor Fee)</td>
                      <td className="py-2 px-3 text-center">১ সার্ভিস</td>
                      <td className="py-2 px-3 text-right font-mono">{tenant.currency}{ticket.laborCost}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold">{tenant.currency}{ticket.laborCost}</td>
                    </tr>
                    {ticket.partsUsed?.map((p, idx) => (
                      <tr key={idx}>
                        <td className="py-2 px-3 text-slate-700">{p.productName} ({p.sku})</td>
                        <td className="py-2 px-3 text-center">{p.quantity} পিস</td>
                        <td className="py-2 px-3 text-right font-mono">{tenant.currency}{p.unitPrice}</td>
                        <td className="py-2 px-3 text-right font-mono font-bold">{tenant.currency}{p.subtotal}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t-2 border-slate-300 font-bold bg-slate-50/70">
                    <tr>
                      <td colSpan={3} className="py-2 px-3 text-right">মোট প্রদেয় বিল:</td>
                      <td className="py-2 px-3 text-right font-mono text-slate-900">{tenant.currency}{ticket.totalCost}</td>
                    </tr>
                    <tr>
                      <td colSpan={3} className="py-2 px-3 text-right text-emerald-700">অগ্রিম পরিশোধিত:</td>
                      <td className="py-2 px-3 text-right font-mono text-emerald-700">-{tenant.currency}{ticket.advancePaid}</td>
                    </tr>
                    <tr className="text-sm bg-purple-100/60 text-purple-950 font-black">
                      <td colSpan={3} className="py-2 px-3 text-right">ডেলিভারির সময় প্রদেয় বাকি:</td>
                      <td className="py-2 px-3 text-right font-mono">{tenant.currency}{ticket.dueAmount}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-10 text-xs text-center">
                <div>
                  <div className="border-t border-slate-400 pt-1.5 font-semibold text-slate-800">গ্রাহকের পূর্ণ স্বাক্ষর</div>
                  <p className="text-[10px] text-slate-400">যন্ত্রপাতি সচল অবস্থায় বুঝে পেলাম</p>
                </div>
                <div>
                  <div className="border-t border-slate-400 pt-1.5 font-semibold text-slate-800">কর্তৃপক্ষ / টেকনিশিয়ান স্বাক্ষর</div>
                  <p className="text-[10px] text-slate-400">{ticket.assignedTechnicianName || 'সার্ভিস ইনচার্জ'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
