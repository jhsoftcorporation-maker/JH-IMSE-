import React, { useState, useEffect } from 'react';
import { 
  Scale, RefreshCw, Plus, Check, AlertCircle, Sparkles, 
  Settings2, ChevronDown, Radio, ShoppingCart
} from 'lucide-react';
import { Product, DigitalWeighingScaleConfig } from '../../types';

interface WeighingScaleWidgetProps {
  products: Product[];
  onAddWeightedProductToCart: (product: Product, weightKg: number) => void;
  currency: string;
}

export const WeighingScaleWidget: React.FC<WeighingScaleWidgetProps> = ({
  products,
  onAddWeightedProductToCart,
  currency,
}) => {
  const [currentWeight, setCurrentWeight] = useState<number>(1.250);
  const [tareWeight, setTareWeight] = useState<number>(0);
  const [isStable, setIsStable] = useState<boolean>(true);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'reading' | 'offline'>('connected');
  const [unitMode, setUnitMode] = useState<'kg' | 'gm'>('kg');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filter products sold by weight (kg, gm, liter, etc.) or default to all
  const weightedProducts = products.filter(p => 
    p.unit.toLowerCase().includes('kg') || 
    p.unit.toLowerCase().includes('gm') || 
    p.unit.toLowerCase().includes('কেজি') ||
    p.category.toLowerCase().includes('vegetable') ||
    p.category.toLowerCase().includes('fruit') ||
    p.category.toLowerCase().includes('grocery') ||
    p.category.toLowerCase().includes('meat') ||
    p.category.toLowerCase().includes('sweet')
  );

  const activeWeightedList = weightedProducts.length > 0 ? weightedProducts : products.slice(0, 10);

  useEffect(() => {
    if (activeWeightedList.length > 0 && !selectedProductId) {
      setSelectedProductId(activeWeightedList[0].id);
    }
  }, [activeWeightedList, selectedProductId]);

  const selectedProduct = products.find(p => p.id === selectedProductId);
  const netWeight = Math.max(0, Math.round((currentWeight - tareWeight) * 1000) / 1000);
  const displayWeight = unitMode === 'kg' ? netWeight : netWeight * 1000;
  
  // Calculate price based on weight
  const calculatedPrice = selectedProduct ? (netWeight * selectedProduct.sellingPrice) : 0;

  // Simulate scale fluctuation when tray items change
  const handleSimulateWeight = (weight: number) => {
    setIsStable(false);
    setConnectionStatus('reading');
    setCurrentWeight(weight);
    setTimeout(() => {
      setIsStable(true);
      setConnectionStatus('connected');
    }, 400);
  };

  const handleTare = () => {
    setTareWeight(currentWeight);
    setToastMessage(`ট্যার (Tare) সম্পন্ন: ${currentWeight.toFixed(3)} kg বাদ দেওয়া হয়েছে`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleZero = () => {
    setCurrentWeight(0);
    setTareWeight(0);
    setToastMessage('স্কেল জিরো (Zero) রিসেট করা হয়েছে');
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleAddToCart = () => {
    if (!selectedProduct) return;
    if (netWeight <= 0) {
      alert('অনুগ্রহ করে স্কেলে পণ্য রাখুন! ওজন ০ হতে পারে না।');
      return;
    }

    onAddWeightedProductToCart(selectedProduct, netWeight);
    setToastMessage(`✅ কার্টে যুক্ত হয়েছে: ${selectedProduct.name} (${netWeight.toFixed(3)} ${unitMode})`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <span>ডিজিটাল ওজন স্কেল (RS-232 / USB)</span>
              <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                connectionStatus === 'connected' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                ● {connectionStatus === 'connected' ? 'অনলাইন' : 'রিডিং...'}
              </span>
            </h4>
            <p className="text-[10px] text-slate-400">Sunmi / Rongta / CAS Electronic Scale Protocol</p>
          </div>
        </div>

        {/* Unit switch */}
        <div className="flex bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold">
          <button
            onClick={() => setUnitMode('kg')}
            className={`px-2 py-0.5 rounded ${unitMode === 'kg' ? 'bg-white text-purple-700 shadow-2xs' : 'text-slate-500'}`}
          >
            KG
          </button>
          <button
            onClick={() => setUnitMode('gm')}
            className={`px-2 py-0.5 rounded ${unitMode === 'gm' ? 'bg-white text-purple-700 shadow-2xs' : 'text-slate-500'}`}
          >
            GM
          </button>
        </div>
      </div>

      {/* Main Digital 7-Segment Weight Display */}
      <div className="bg-slate-950 text-white rounded-xl p-3.5 border border-slate-800 flex items-center justify-between shadow-inner">
        <div>
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
            <span>নেট ওজন (NET WEIGHT)</span>
            {isStable ? (
              <span className="text-emerald-400 text-[9px] bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-800">
                STABLE
              </span>
            ) : (
              <span className="text-amber-400 text-[9px] bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-800 animate-pulse">
                DYNAMIC
              </span>
            )}
            {tareWeight > 0 && (
              <span className="text-purple-300 text-[9px]">Tare: {tareWeight.toFixed(3)}kg</span>
            )}
          </div>

          <div className="font-mono text-3xl font-black text-emerald-400 tracking-wider mt-0.5">
            {displayWeight.toFixed(unitMode === 'kg' ? 3 : 0)}{' '}
            <span className="text-sm font-bold text-slate-400 uppercase">{unitMode}</span>
          </div>
        </div>

        {/* Quick Tare & Zero Buttons */}
        <div className="flex flex-col gap-1.5">
          <button
            onClick={handleTare}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-bold transition border border-slate-700"
            title="ট্রে বা পাত্রের ওজন বাদ দিন"
          >
            ট্যার (Tare)
          </button>
          <button
            onClick={handleZero}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-bold transition border border-slate-700"
            title="স্কেল শূন্য করুন"
          >
            জিরো (Zero)
          </button>
        </div>
      </div>

      {/* Quick Test Presets (for instant demo / testing) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
        <span className="text-[10px] text-slate-400 font-bold shrink-0">ওজন টেস্ট:</span>
        {[0.250, 0.500, 1.000, 1.500, 2.250, 3.500].map(w => (
          <button
            key={w}
            onClick={() => handleSimulateWeight(w)}
            className="px-2 py-0.5 bg-slate-100 hover:bg-purple-100 text-slate-700 hover:text-purple-900 rounded-md font-mono text-[10px] font-semibold transition"
          >
            {w.toFixed(3)}kg
          </button>
        ))}
      </div>

      {/* Product Selector for per-kg pricing */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold text-slate-700 block">
          ওজন অনুযায়ী পণ্য নির্বাচন করুন:
        </label>
        <select
          value={selectedProductId}
          onChange={e => setSelectedProductId(e.target.value)}
          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-600"
        >
          {activeWeightedList.map(p => (
            <option key={p.id} value={p.id}>
              {p.name} ({currency}{p.sellingPrice}/{p.unit})
            </option>
          ))}
        </select>

        {selectedProduct && (
          <div className="p-2.5 bg-purple-50/70 rounded-xl border border-purple-200 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] text-purple-700 font-semibold block">নির্ধারিত মোট মূল্য:</span>
              <div className="font-black text-slate-900 text-sm">
                {currency}{calculatedPrice.toFixed(2)}{' '}
                <span className="text-[10px] font-normal text-slate-500">
                  ({netWeight.toFixed(3)} kg × {currency}{selectedProduct.sellingPrice})
                </span>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <ShoppingCart className="w-3.5 h-3.5" /> কার্টে যোগ করুন
            </button>
          </div>
        )}
      </div>

      {toastMessage && (
        <div className="text-[11px] text-purple-800 font-bold bg-purple-100 px-3 py-1.5 rounded-lg text-center animate-in fade-in">
          {toastMessage}
        </div>
      )}
    </div>
  );
};
