import React, { useState } from 'react';
import { X, Printer, Barcode, CheckSquare, Settings2 } from 'lucide-react';
import { Product, Tenant } from '../types';

interface BarcodeGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: Tenant;
  products: Product[];
  initialSelectedProductId?: string;
}

export const BarcodeGeneratorModal: React.FC<BarcodeGeneratorModalProps> = ({
  isOpen,
  onClose,
  tenant,
  products,
  initialSelectedProductId,
}) => {
  const [selectedProductId, setSelectedProductId] = useState<string>(
    initialSelectedProductId || products[0]?.id || ''
  );
  const [printCount, setPrintCount] = useState<number>(12);
  const [paperFormat, setPaperFormat] = useState<'a4_24' | 'a4_40' | 'roll_thermal'>('a4_24');
  const [showPrice, setShowPrice] = useState(true);
  const [showBusinessName, setShowBusinessName] = useState(true);
  const [showBatchExpiry, setShowBatchExpiry] = useState(true);

  if (!isOpen) return null;

  const currentProduct = products.find(p => p.id === selectedProductId) || products[0];

  const handlePrint = () => {
    window.print();
  };

  // Generate mock barcode lines based on SKU
  const renderBarcodeLines = (sku: string) => {
    return (
      <div className="flex items-center justify-center gap-[2px] h-9 w-full my-1">
        {sku.split('').map((char, idx) => {
          const charCode = char.charCodeAt(0);
          const widthClass = charCode % 3 === 0 ? 'w-[3px]' : charCode % 2 === 0 ? 'w-[2px]' : 'w-[1px]';
          return (
            <span
              key={idx}
              className={`h-full bg-slate-900 ${widthClass}`}
            />
          );
        })}
        {/* Fill to give authentic density */}
        <span className="h-full bg-slate-900 w-[2px]" />
        <span className="h-full bg-slate-900 w-[1px]" />
        <span className="h-full bg-slate-900 w-[3px]" />
        <span className="h-full bg-slate-900 w-[1px]" />
        <span className="h-full bg-slate-900 w-[2px]" />
        <span className="h-full bg-slate-900 w-[1px]" />
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] shadow-2xl border border-purple-100 flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-purple-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-800 text-purple-200">
              <Barcode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">বারকোড ও প্রাইস লেবেল স্টিকার জেনারেটর</h3>
              <p className="text-xs text-purple-200">A4 শিট অথবা থার্মাল রোল স্টিকার প্রিন্ট করুন</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <Printer className="w-4 h-4" /> লেবেল শিট প্রিন্ট করুন
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-purple-200 hover:text-white hover:bg-purple-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Controls Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">পণ্য সিলেক্ট করুন:</label>
            <select
              value={selectedProductId}
              onChange={e => setSelectedProductId(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl font-medium focus:ring-1 focus:ring-purple-600"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">কাগজ ফরম্যাট:</label>
            <select
              value={paperFormat}
              onChange={e => setPaperFormat(e.target.value as any)}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl font-medium focus:ring-1 focus:ring-purple-600"
            >
              <option value="a4_24">A4 স্টিকার শিট (২৪টি লেবেল / পাতা)</option>
              <option value="a4_40">A4 কম্প্যাক্ট শিট (৪০টি লেবেল / পাতা)</option>
              <option value="roll_thermal">থার্মাল লেবেল রোল (৫০মিমি × ৩০মিমি)</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">লেবেল সংখ্যা:</label>
            <input
              type="number"
              min="1"
              max="200"
              value={printCount}
              onChange={e => setPrintCount(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl font-semibold"
            />
          </div>

          <div className="flex flex-col justify-end gap-1 text-[11px] text-slate-600 font-medium">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showPrice}
                onChange={e => setShowPrice(e.target.checked)}
                className="rounded text-purple-700"
              />
              মূল্য প্রদর্শন
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showBusinessName}
                onChange={e => setShowBusinessName(e.target.checked)}
                className="rounded text-purple-700"
              />
              দোকানের নাম প্রদর্শন
            </label>
          </div>
        </div>

        {/* Printable Barcode Sheet Preview */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-200 flex justify-center">
          <div
            id="printable-barcode-sheet"
            className="bg-white shadow-xl p-6 rounded-lg min-h-[500px] w-full max-w-[800px] font-sans"
          >
            <div
              className={`grid gap-3 ${
                paperFormat === 'a4_24'
                  ? 'grid-cols-2 sm:grid-cols-3'
                  : paperFormat === 'a4_40'
                  ? 'grid-cols-3 sm:grid-cols-4'
                  : 'grid-cols-1 sm:grid-cols-2 max-w-sm mx-auto'
              }`}
            >
              {Array.from({ length: printCount }).map((_, idx) => (
                <div
                  key={idx}
                  className="border border-dashed border-slate-400 p-2.5 rounded-lg text-center flex flex-col justify-between bg-white text-slate-900"
                >
                  {showBusinessName && (
                    <div className="text-[10px] font-bold uppercase tracking-wider text-purple-900 truncate">
                      {tenant.name}
                    </div>
                  )}

                  <div className="font-bold text-xs truncate mt-0.5 text-slate-900">
                    {currentProduct.name}
                  </div>

                  {/* Barcode Visual */}
                  <div className="px-2">
                    {renderBarcodeLines(currentProduct.sku)}
                  </div>

                  <div className="text-[10px] font-mono tracking-widest text-slate-700">
                    *{currentProduct.sku}*
                  </div>

                  {/* Batch & Expiry for Pharmacy if present */}
                  {showBatchExpiry && currentProduct.expiryDate && (
                    <div className="text-[9px] text-slate-500 flex justify-between px-1 mt-0.5 border-t border-slate-200 pt-0.5">
                      <span>ব্যাচ: {currentProduct.batchNumber || 'N/A'}</span>
                      <span>মেয়াদ: {currentProduct.expiryDate}</span>
                    </div>
                  )}

                  {showPrice && (
                    <div className="font-extrabold text-sm text-slate-950 mt-1 bg-slate-50 py-0.5 rounded border border-slate-200">
                      M.R.P: {tenant.currency}{currentProduct.sellingPrice.toFixed(2)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            মোট <strong>{printCount}</strong> টি স্টিকার লেবেল প্রস্তুত হয়েছে।
          </span>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition"
            >
              বন্ধ করুন
            </button>
            <button
              onClick={handlePrint}
              className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm"
            >
              <Printer className="w-4 h-4" /> প্রিন্ট দিন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
