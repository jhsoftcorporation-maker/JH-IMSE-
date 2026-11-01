import React, { useState, useRef } from 'react';
import { 
  X, AlertTriangle, Trash2, RefreshCw, CheckCircle2, ShieldAlert,
  Download, Upload, Sparkles, Database, FileCheck, Layers, Package,
  ShoppingCart, Users, DollarSign, ArrowRight, ShieldCheck, Info
} from 'lucide-react';
import { Tenant } from '../../types';
import { StoreDataStats, downloadBackupFile } from '../../utils/storageEngine';

interface DataResetManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: Tenant;
  stats: StoreDataStats;
  onCleanProductionReset: () => void;
  onResetSalesOnly: () => void;
  onLoadStarterTemplate: (industry: 'clean_blank' | 'pharmacy_starter' | 'grocery_starter' | 'electronics_starter') => void;
  onLoadDemoData: () => void;
  onExportAllData: () => string;
  onImportAllData: (jsonData: string) => boolean;
}

export const DataResetManagerModal: React.FC<DataResetManagerModalProps> = ({
  isOpen,
  onClose,
  tenant,
  stats,
  onCleanProductionReset,
  onResetSalesOnly,
  onLoadStarterTemplate,
  onLoadDemoData,
  onExportAllData,
  onImportAllData,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'clean_production' | 'reset_sales' | 'starter_templates' | 'backup_restore'>('overview');
  
  // Confirmation input strings
  const [cleanConfirmText, setCleanConfirmText] = useState('');
  const [salesConfirmText, setSalesConfirmText] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // File import ref
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const showStatus = (type: 'success' | 'error', text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 4500);
  };

  const handleExecuteCleanReset = () => {
    if (cleanConfirmText.trim().toUpperCase() !== 'CLEAN-PRODUCTION') {
      showStatus('error', 'নিশ্চিত করতে হুবহু "CLEAN-PRODUCTION" লিখুন');
      return;
    }
    onCleanProductionReset();
    setCleanConfirmText('');
    showStatus('success', 'সকল ডামি ডাটা সফলভাবে মুছে ফেলা হয়েছে! আপনার স্টোর এখন শতভাগ ক্লিন ও ফ্রেশ।');
    setTimeout(() => onClose(), 1500);
  };

  const handleExecuteResetSalesOnly = () => {
    if (salesConfirmText.trim().toUpperCase() !== 'RESET-SALES') {
      showStatus('error', 'নিশ্চিত করতে হুবহু "RESET-SALES" লিখুন');
      return;
    }
    onResetSalesOnly();
    setSalesConfirmText('');
    showStatus('success', 'সকল টেস্ট ইনভয়েস ও ট্রানজ্যাকশন রিসেট সম্পন্ন হয়েছে! পণ্য তালিকা অক্ষুণ্ণ আছে।');
    setTimeout(() => onClose(), 1500);
  };

  const handleExportBackup = () => {
    const jsonStr = onExportAllData();
    const dateStr = new Date().toISOString().slice(0, 10);
    const fileName = `jhimse_${tenant.slug || tenant.id}_real_backup_${dateStr}.json`;
    downloadBackupFile(fileName, jsonStr);
    showStatus('success', `রিয়েল ডাটা ব্যাকআপ ফাইল (${fileName}) ডাউনলোড শুরু হয়েছে।`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = onImportAllData(content);
        if (success) {
          showStatus('success', 'ডাটা ব্যাকআপ ফাইল সফলভাবে রিস্টোর করা হয়েছে!');
          setTimeout(() => onClose(), 1500);
        } else {
          showStatus('error', 'ফাইল ফরম্যাট ভুল অথবা ডেটা করাপ্টেড!');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-purple-100 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-purple-600/30 border border-purple-400/30 flex items-center justify-center text-purple-300">
              <Database className="w-6 h-6 text-purple-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-white">স্টোর ডাটা ম্যানেজার ও ফ্যাক্টরি রিসেট</h3>
                <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                  stats.isCleanProduction ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {stats.isCleanProduction ? '✓ ক্লিন প্রোডাকশন মোড' : '⚠️ ডেমো / মক ডেটা মোড'}
                </span>
              </div>
              <p className="text-xs text-purple-200 mt-0.5">
                {tenant.name} • ডামি ডেটা মুছে রিয়েল ডেটা ব্যবহার ও সিস্টেম রিসেট কনসোল
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Toast inside Modal */}
        {statusMessage && (
          <div className={`px-6 py-2.5 flex items-center gap-2 text-xs font-semibold ${
            statusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-b border-emerald-200' : 'bg-rose-50 text-rose-800 border-b border-rose-200'
          }`}>
            {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 gap-2 pt-2 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-3.5 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'overview' ? 'border-purple-600 text-purple-700 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>বর্তমান ডেটা স্ট্যাটাস</span>
          </button>

          <button
            onClick={() => setActiveTab('clean_production')}
            className={`pb-3 px-3.5 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'clean_production' ? 'border-rose-600 text-rose-700 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Trash2 className="w-4 h-4 text-rose-500" />
            <span className="text-rose-600">১০০% ক্লিন প্রোডাকশন রিসেট</span>
          </button>

          <button
            onClick={() => setActiveTab('reset_sales')}
            className={`pb-3 px-3.5 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'reset_sales' ? 'border-amber-600 text-amber-700 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <RefreshCw className="w-4 h-4 text-amber-600" />
            <span>শুধু সেলস ও খাতা রিসেট</span>
          </button>

          <button
            onClick={() => setActiveTab('starter_templates')}
            className={`pb-3 px-3.5 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'starter_templates' ? 'border-purple-600 text-purple-700 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>ইন্ডাস্ট্রি ফ্রেশ টেমপ্লেট</span>
          </button>

          <button
            onClick={() => setActiveTab('backup_restore')}
            className={`pb-3 px-3.5 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'backup_restore' ? 'border-purple-600 text-purple-700 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Download className="w-4 h-4 text-purple-600" />
            <span>ব্যাকআপ ও রিস্টোর</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* TAB 1: OVERVIEW & LIVE METRICS */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-purple-50 via-white to-indigo-50/50 p-5 rounded-2xl border border-purple-100">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-purple-600/20">
                    <Database className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-slate-900">দোকানের লাইভ ডেটাবেজ পরিসংখ্যান</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      JH IMSE-তে আপনার দোকানের যাবতীয় প্রোডাক্ট, ইনভয়েস ও কাস্টমার তথ্য স্বয়ংক্রিয়ভাবে ব্রাউজার লোকালস্টোরেজ ও ডাটাবেজে পারসিস্টেন্ট (Persistent) রাখা হচ্ছে। পেজ রিলোড দিলেও আপনার আসল ডেটা নষ্ট হবে না।
                    </p>
                  </div>
                </div>
              </div>

              {/* Stat Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl">
                  <div className="flex items-center gap-2 text-slate-500 mb-1 text-xs font-semibold">
                    <Package className="w-4 h-4 text-purple-600" />
                    <span>মোট প্রোডাক্ট</span>
                  </div>
                  <div className="text-xl font-black text-slate-900">{stats.productsCount} টি</div>
                </div>

                <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl">
                  <div className="flex items-center gap-2 text-slate-500 mb-1 text-xs font-semibold">
                    <ShoppingCart className="w-4 h-4 text-emerald-600" />
                    <span>মোট ইনভয়েস/বিক্রি</span>
                  </div>
                  <div className="text-xl font-black text-slate-900">{stats.salesCount} টি</div>
                </div>

                <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl">
                  <div className="flex items-center gap-2 text-slate-500 mb-1 text-xs font-semibold">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span>নিবন্ধিত গ্রাহক</span>
                  </div>
                  <div className="text-xl font-black text-slate-900">{stats.customersCount} জন</div>
                </div>

                <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl">
                  <div className="flex items-center gap-2 text-slate-500 mb-1 text-xs font-semibold">
                    <Layers className="w-4 h-4 text-amber-600" />
                    <span>স্টোরেজ সাইজ</span>
                  </div>
                  <div className="text-xl font-black text-slate-900">{stats.storageUsageKb} KB</div>
                </div>
              </div>

              {/* Action Recommendations */}
              <div className="space-y-3 pt-2">
                <h5 className="font-bold text-sm text-slate-800">আপনি কি রিয়েল ডেটা দিয়ে শুরু করতে চান?</h5>
                
                <div 
                  onClick={() => setActiveTab('clean_production')}
                  className="p-4 rounded-2xl border-2 border-dashed border-rose-200 hover:border-rose-400 bg-rose-50/40 hover:bg-rose-50 cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Trash2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-rose-900">ডামি ডেটা পুরোপুরি ডিলিট করে রিয়েল ব্যবসা শুরু করুন</div>
                      <div className="text-xs text-rose-700">সমস্ত ডামি প্রোডাক্ট ও টেস্ট বিক্রি মুছে শূন্য (Clean Slate) করে নিন।</div>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-rose-400 group-hover:text-rose-600 group-hover:translate-x-1 transition-all" />
                </div>

                <div 
                  onClick={() => setActiveTab('reset_sales')}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-amber-300 bg-amber-50/30 hover:bg-amber-50 cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <RefreshCw className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-900">প্রোডাক্ট রেখে শুধু সেলস ও খাতা রিসেট করুন</div>
                      <div className="text-xs text-slate-600">দোকানের পণ্য তালিকা থাকবে, কিন্তু টেস্ট করার সব বিক্রি ও বকেয়া ০ হয়ে যাবে।</div>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CLEAN PRODUCTION RESET */}
          {activeTab === 'clean_production' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-black text-base text-rose-900">সতর্কতা: সম্পূর্ণ ডামি ডাটা মুছে ক্লিন প্রোডাকশন মোড</h4>
                    <p className="text-xs text-rose-800 mt-1 leading-relaxed">
                      এই অ্যাকশনটি সম্পন্ন করলে আপনার বর্তমান দোকানের <strong>সকল ডামি প্রোডাক্ট, টেস্ট বিক্রি, ডামি গ্রাহক ও ডামি খরচ</strong> সম্পূর্ণ মুছে শূন্য (Blank) করে দেওয়া হবে।
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                <h5 className="font-bold text-xs uppercase tracking-wider text-slate-500">ক্লিন রিসেট করার পর কী হবে:</h5>
                <ul className="text-xs text-slate-700 space-y-2.5">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>আপনার দোকানের নাম, ঠিকানা, ভ্যাট নম্বর ও ব্রাঞ্চ অক্ষুণ্ণ থাকবে।</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>প্রোডাক্ট সংখ্যা শূন্য (০) হবে — আপনি এক্সেল দিয়ে বা ম্যানুয়ালি আপনার আসল পণ্য এন্ট্রি করতে পারবেন।</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>সকল টেস্ট ইনভয়েস ও মেমো ডিলিট হবে — আসল কাউন্টার ওপেনিং ক্যাশ দিয়ে শিফট শুরু করতে পারবেন।</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-3 pt-2">
                <label className="block text-xs font-bold text-slate-800">
                  নিশ্চিত করতে নিচে হুবহু লিখুন: <span className="font-mono text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">CLEAN-PRODUCTION</span>
                </label>
                <input
                  type="text"
                  value={cleanConfirmText}
                  onChange={(e) => setCleanConfirmText(e.target.value)}
                  placeholder="CLEAN-PRODUCTION"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none font-mono text-sm uppercase"
                />

                <button
                  onClick={handleExecuteCleanReset}
                  disabled={cleanConfirmText.trim().toUpperCase() !== 'CLEAN-PRODUCTION'}
                  className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                    cleanConfirmText.trim().toUpperCase() === 'CLEAN-PRODUCTION'
                      ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/30 cursor-pointer'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  }`}
                >
                  <Trash2 className="w-4 h-4" />
                  <span>সকল ডামি ডাটা মুছে সম্পূর্ণ ফ্রেশ শুরু করুন</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: RESET SALES ONLY */}
          {activeTab === 'reset_sales' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950">
                <div className="flex items-start gap-3">
                  <RefreshCw className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-black text-base text-amber-900">শুধু টেস্ট ট্রানজ্যাকশন ও খাতা রিসেট</h4>
                    <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                      আপনি যদি ইতোমধ্যে আসল পণ্য বা ক্যাটালগ এন্ট্রি করে থাকেন, কিন্তু উদ্বোধনের আগে টেস্ট বিক্রির চালান ও মেমোগুলো ডিলিট করে শূন্য করতে চান, তবে এটি ব্যবহার করুন।
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3 text-xs text-slate-700">
                <div className="font-bold text-slate-800">যা অক্ষুণ্ণ থাকবে:</div>
                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> সকল প্রোডাক্ট ও স্টক তালিকা</div>
                  <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> ক্যাটাগরি, ব্র্যান্ড ও ইউনিট</div>
                  <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> সাপ্লায়ার ও কাস্টমার ডিরেক্টরি</div>
                  <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> কর্মচারী ও ব্রাঞ্চ সেটিংস</div>
                </div>

                <div className="font-bold text-rose-800 pt-2">যা শূন্য (০) হয়ে যাবে:</div>
                <div className="text-rose-700">
                  সকল সেলস মেমো, কোটেশন, ডেলিভারি চালান, ক্যাশ রেজিস্টার হিস্ট্রি ও কাস্টমারের বকেয়া ব্যালেন্স শূন্য হবে।
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <label className="block text-xs font-bold text-slate-800">
                  নিশ্চিত করতে নিচে হুবহু লিখুন: <span className="font-mono text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">RESET-SALES</span>
                </label>
                <input
                  type="text"
                  value={salesConfirmText}
                  onChange={(e) => setSalesConfirmText(e.target.value)}
                  placeholder="RESET-SALES"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none font-mono text-sm uppercase"
                />

                <button
                  onClick={handleExecuteResetSalesOnly}
                  disabled={salesConfirmText.trim().toUpperCase() !== 'RESET-SALES'}
                  className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                    salesConfirmText.trim().toUpperCase() === 'RESET-SALES'
                      ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/30 cursor-pointer'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  }`}
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>ট্রানজ্যাকশন রিসেট করে ক্যাশ খাতা শূন্য করুন</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: STARTER TEMPLATES */}
          {activeTab === 'starter_templates' && (
            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-base text-slate-900">ইন্ডাস্ট্রি অনুযায়ী ফ্রেশ টেমপ্লেট সেটআপ</h4>
                <p className="text-xs text-slate-600 mt-1">
                  কোনো ডামি সেলস ছাড়া, শুধু প্রয়োজনীয় ক্যাটাগরি ও ইউনিট (Pcs, Box, Strip, Kg, Liter) দিয়ে ক্লিন শুরু করুন।
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Pharmacy Starter */}
                <div className="p-4 rounded-2xl border border-slate-200 hover:border-purple-300 bg-white hover:bg-purple-50/20 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2.5 font-bold text-slate-900 text-sm">
                      <span className="text-xl">💊</span>
                      <span>ফার্মেসি ফ্রেশ স্টার্টার</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      ওষুধের জেনেরিক ক্যাটাগরি, বক্স/পাতা/পিস ইউনিট, ও শূন্য ইনভয়েস দিয়ে ক্লিন স্টার্ট।
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onLoadStarterTemplate('pharmacy_starter');
                      showStatus('success', 'ফার্মেসি ফ্রেশ টেমপ্লেট লোড হয়েছে (০ ডামি বিক্রি)');
                      setTimeout(() => onClose(), 1500);
                    }}
                    className="mt-4 w-full py-2 bg-purple-50 hover:bg-purple-600 text-purple-700 hover:text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    ফার্মেসি ফ্রেশ সেটআপ চালু করুন
                  </button>
                </div>

                {/* Grocery Starter */}
                <div className="p-4 rounded-2xl border border-slate-200 hover:border-emerald-300 bg-white hover:bg-emerald-50/20 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2.5 font-bold text-slate-900 text-sm">
                      <span className="text-xl">🛒</span>
                      <span>মুদি ও ডিপার্টমেন্টাল ফ্রেশ স্টার্টার</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      মুদিখানা ক্যাটাগরি, কেজি/গ্রাম/লিটার ইউনিট ও বারকোড স্কেল সাপোর্ট সহ ফ্রেশ সেটআপ।
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onLoadStarterTemplate('grocery_starter');
                      showStatus('success', 'মুদি ফ্রেশ টেমপ্লেট লোড হয়েছে (০ ডামি বিক্রি)');
                      setTimeout(() => onClose(), 1500);
                    }}
                    className="mt-4 w-full py-2 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    মুদি ফ্রেশ সেটআপ চালু করুন
                  </button>
                </div>
              </div>

              {/* Training Demo Sandbox Option */}
              <div className="pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div>
                    <div className="font-bold text-xs text-slate-800">কর্মচারী বা ক্যাশিয়ার ট্রেনিংয়ের জন্য ডেমো ডাটা চান?</div>
                    <div className="text-[11px] text-slate-500">প্র্যাকটিস করার জন্য ডেমো ওষুধ ও বিক্রির রেকর্ড আবার ফেরত আনতে পারেন।</div>
                  </div>
                  <button
                    onClick={() => {
                      onLoadDemoData();
                      showStatus('success', 'ট্রেনিং ডেমো ডাটা সফলভাবে লোড হয়েছে!');
                      setTimeout(() => onClose(), 1500);
                    }}
                    className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-colors"
                  >
                    ডেমো ডাটা লোড করুন
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: BACKUP & RESTORE */}
          {activeTab === 'backup_restore' && (
            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-base text-slate-900">রিয়েল ডেটা ব্যাকআপ ও রিস্টোর</h4>
                <p className="text-xs text-slate-600 mt-1">
                  আপনার দোকানের আসল পণ্য, গ্রাহক ও হিসাব কম্পিউটার বা ড্রাইভে সুরক্ষিত ফাইল হিসেবে ব্যাকআপ রাখুন।
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                      <Download className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-900">JSON ব্যাকআপ ডাউনলোড</div>
                      <div className="text-xs text-slate-500">সম্পূর্ণ আসল ডেটার কপি ডাউনলোড করুন</div>
                    </div>
                  </div>
                  <button
                    onClick={handleExportBackup}
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>ব্যাকআপ ফাইল ডাউনলোড করুন (.json)</span>
                  </button>
                </div>

                <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-900">ব্যাকআপ ফাইল থেকে রিস্টোর</div>
                      <div className="text-xs text-slate-500">পূর্বের ব্যাকআপ ফাইল আপলোড করুন</div>
                    </div>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".json"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>ফাইল আপলোড করে রিস্টোর করুন</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>JH IMSE Enterprise Security • আপনার ডেটা সুরক্ষিত ও এনক্রিপ্টেড</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-colors"
          >
            বন্ধ করুন
          </button>
        </div>

      </div>
    </div>
  );
};
