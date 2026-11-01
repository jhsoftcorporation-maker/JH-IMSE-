import React, { useRef } from 'react';
import { X, Printer, QrCode, Building, CheckCircle2, ShieldCheck, Tag } from 'lucide-react';
import { FixedAsset, Tenant } from '../../types';

interface AssetTagPrintModalProps {
  asset: FixedAsset;
  tenant: Tenant;
  onClose: () => void;
}

export const AssetTagPrintModal: React.FC<AssetTagPrintModalProps> = ({
  asset,
  tenant,
  onClose,
}) => {
  const printAreaRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Tag className="w-5 h-5 text-blue-400" />
            <div>
              <h2 className="text-base font-bold">অ্যাসেট বারকোড ট্যাগ প্রিন্ট (Asset Tag & Label)</h2>
              <p className="text-xs text-slate-300 font-mono">{asset.assetCode}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-md transition-colors"
            >
              <Printer className="w-4 h-4" /> প্রিন্ট করুন (Print Tag)
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-700 rounded-full text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div className="p-6 bg-slate-100 dark:bg-slate-950 flex flex-col items-center">
          <div
            ref={printAreaRef}
            id="asset-tag-print-container"
            className="w-full max-w-md bg-white text-slate-900 border-2 border-dashed border-slate-400 rounded-2xl p-5 shadow-lg space-y-4"
          >
            {/* Tag Header */}
            <div className="flex items-center justify-between border-b pb-3 border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-700 flex items-center justify-center text-white font-black text-sm">
                  {tenant.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-tight text-slate-900">{tenant.name}</h3>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                    FIXED ASSET IDENTIFICATION TAG
                  </p>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold uppercase">
                VERIFIED ASSET
              </span>
            </div>

            {/* Main Tag Body with QR Code */}
            <div className="grid grid-cols-3 gap-3 items-center">
              <div className="col-span-2 space-y-1.5">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">ASSET CODE</span>
                  <p className="font-mono text-xl font-extrabold text-blue-700 tracking-wider">
                    {asset.assetCode}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">ASSET NAME</span>
                  <p className="text-xs font-bold text-slate-800 line-clamp-2">
                    {asset.name}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                  <div>
                    <span className="text-[9px] text-slate-400 block font-semibold">CATEGORY</span>
                    <span className="font-medium text-slate-700 capitalize">
                      {asset.category.replace('_', ' ')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block font-semibold">PURCHASE DATE</span>
                    <span className="font-medium text-slate-700 font-mono">
                      {asset.purchaseDate}
                    </span>
                  </div>
                </div>
              </div>

              {/* QR Code Container */}
              <div className="flex flex-col items-center justify-center p-2 bg-slate-50 border rounded-xl">
                {/* Visual SVG QR Representation */}
                <div className="w-20 h-20 bg-white border border-slate-300 p-1 rounded-lg flex items-center justify-center shadow-inner">
                  <div className="grid grid-cols-4 gap-1 w-full h-full p-0.5">
                    <div className="bg-slate-900 rounded-sm col-span-2 row-span-2 flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-xs"></div>
                    </div>
                    <div className="bg-slate-900 rounded-sm"></div>
                    <div className="bg-slate-900 rounded-sm"></div>
                    <div className="bg-slate-900 rounded-sm"></div>
                    <div className="bg-slate-900 rounded-sm"></div>
                    <div className="bg-slate-900 rounded-sm"></div>
                    <div className="bg-slate-900 rounded-sm col-span-2 row-span-2 flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-xs"></div>
                    </div>
                  </div>
                </div>
                <span className="text-[8px] font-mono text-slate-500 mt-1 font-bold">SCAN WITH POS</span>
              </div>
            </div>

            {/* Serial & Custodian Footer */}
            <div className="border-t pt-2 border-slate-200 grid grid-cols-2 gap-2 text-[10px]">
              <div>
                <span className="text-slate-400 block font-semibold">SERIAL / BARCODE:</span>
                <span className="font-mono font-bold text-slate-800">{asset.serialOrBarcode}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block font-semibold">CUSTODIAN:</span>
                <span className="font-semibold text-slate-800">{asset.custodianName}</span>
              </div>
              <div className="col-span-2 text-[9px] text-slate-500 italic text-center pt-1">
                Property of {tenant.name}. Unauthorized removal, relocation, or tampering is strictly prohibited.
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 text-center">
            এই ট্যাগটি থার্মাল স্টিকার প্রিন্টার (৫০x৩০মিমি / ৬০x৪০মিমি) বা সাধারণ লেজার প্রিন্টারে প্রিন্ট করে স্থায়ী সম্পদে সেঁটে দিন।
          </p>
        </div>
      </div>
    </div>
  );
};
