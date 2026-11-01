import React, { useState } from 'react';
import { 
  X, Building2, Tag, Calendar, DollarSign, Wrench, Trash2, Printer, 
  Sparkles, CheckCircle2, AlertTriangle, ShieldCheck, ArrowRight, TrendingUp, TrendingDown
} from 'lucide-react';
import { FixedAsset, AssetMaintenanceRecord, Tenant } from '../../types';
import { generateDepreciationSchedule } from '../../utils/depreciationEngine';

interface AssetDetailModalProps {
  asset: FixedAsset;
  maintenanceLogs: AssetMaintenanceRecord[];
  currency: string;
  tenant: Tenant;
  onClose: () => void;
  onRecordMaintenance: (asset: FixedAsset) => void;
  onDisposeAsset: (asset: FixedAsset) => void;
  onPrintTag: (asset: FixedAsset) => void;
  onPostDepreciationVoucher: (asset: FixedAsset, fiscalYear: string, amount: number) => void;
}

export const AssetDetailModal: React.FC<AssetDetailModalProps> = ({
  asset,
  maintenanceLogs,
  currency,
  tenant,
  onClose,
  onRecordMaintenance,
  onDisposeAsset,
  onPrintTag,
  onPostDepreciationVoucher,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'schedule' | 'maintenance' | 'disposal'>('overview');
  
  const schedule = generateDepreciationSchedule(asset);
  const currentNetBookValue = Math.max(0, asset.originalCost - asset.accumulatedDepreciation);
  const depreciatedPercentage = asset.originalCost > 0
    ? Math.min(100, Math.round((asset.accumulatedDepreciation / asset.originalCost) * 100))
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/20 text-blue-300 rounded-xl border border-blue-400/30">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/40 font-bold">
                  {asset.assetCode}
                </span>
                <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  asset.status === 'in_service'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : asset.status === 'under_maintenance'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}>
                  {asset.status === 'in_service' ? 'সক্রিয় ব্যবহারাধীন (In Service)' : asset.status === 'under_maintenance' ? 'সার্ভিসিং চলছে (In Maintenance)' : 'নিষ্পত্তি সম্পন্ন (Disposed)'}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white mt-1">{asset.name}</h2>
              <p className="text-xs text-slate-300">
                অবস্থান: {asset.location} | দায়িত্বে: {asset.custodianName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPrintTag(asset)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
            >
              <Printer className="w-4 h-4 text-blue-400" /> বারকোড ট্যাগ
            </button>
            {asset.status !== 'disposed' && (
              <>
                <button
                  onClick={() => onRecordMaintenance(asset)}
                  className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow transition-colors"
                >
                  <Wrench className="w-4 h-4" /> মেরামত লগ
                </button>
                <button
                  onClick={() => onDisposeAsset(asset)}
                  className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> নিষ্পত্তি / বিক্রয়
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Tag className="w-4 h-4" /> বিবরণ ও স্পেক্স (Overview)
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`pb-3 px-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'schedule'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4" /> অবচয় শিডিউল ও জাবেদা (Depreciation)
          </button>
          <button
            onClick={() => setActiveTab('maintenance')}
            className={`pb-3 px-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'maintenance'
                ? 'border-amber-600 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Wrench className="w-4 h-4" /> রক্ষণাবেক্ষণ ইতিহাস ({maintenanceLogs.length})
          </button>
          {asset.disposal && (
            <button
              onClick={() => setActiveTab('disposal')}
              className={`pb-3 px-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'disposal'
                  ? 'border-rose-600 text-rose-600 dark:text-rose-400'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Trash2 className="w-4 h-4" /> নিষ্পত্তি ও লাভ/ক্ষতি (Disposal Certificate)
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* 4 Financial Highlight Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">মূল ক্রয়মূল্য:</span>
                  <p className="text-lg font-bold text-slate-800 dark:text-slate-100 mt-1">
                    {currency}{asset.originalCost.toLocaleString()}
                  </p>
                  <span className="text-[10px] text-slate-400 font-mono">ক্রয়: {asset.purchaseDate}</span>
                </div>

                <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-800/40">
                  <span className="text-xs text-amber-700 dark:text-amber-300 block font-medium">পুঞ্জীভূত অবচয়:</span>
                  <p className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-1">
                    {currency}{asset.accumulatedDepreciation.toLocaleString()}
                  </p>
                  <div className="w-full bg-amber-200 dark:bg-amber-900 rounded-full h-1.5 mt-2 overflow-hidden">
                    <div
                      className="bg-amber-500 h-1.5 rounded-full"
                      style={{ width: `${depreciatedPercentage}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 mt-1 block">
                    {depreciatedPercentage}% অবচয় সম্পন্ন
                  </span>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-800/40">
                  <span className="text-xs text-blue-700 dark:text-blue-300 block font-medium">বর্তমান নেট বুক ভ্যালু (NBV):</span>
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-1">
                    {currency}{currentNetBookValue.toLocaleString()}
                  </p>
                  <span className="text-[10px] text-blue-500">বুক ভ্যালু = ক্রয়মূল্য - অবচয়</span>
                </div>

                <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-xl border border-purple-200 dark:border-purple-800/40">
                  <span className="text-xs text-purple-700 dark:text-purple-300 block font-medium">ভগ্নাংশ / স্ক্র্যাপ মূল্য:</span>
                  <p className="text-lg font-bold text-purple-600 dark:text-purple-400 mt-1">
                    {currency}{(asset.salvageValue || 0).toLocaleString()}
                  </p>
                  <span className="text-[10px] text-purple-500">মেয়াদান্তে প্রত্যাশিত মূল্য</span>
                </div>
              </div>

              {/* Technical Specifications & Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    কারিগরি স্পেসিফিকেশন ও তথ্য
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                      <span className="text-slate-500">ক্যাটাগরি:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                        {asset.category.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                      <span className="text-slate-500">মডেল নম্বর:</span>
                      <span className="font-semibold font-mono text-slate-800 dark:text-slate-200">
                        {asset.modelNo || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                      <span className="text-slate-500">সিরিয়াল / বারকোড:</span>
                      <span className="font-semibold font-mono text-blue-600 dark:text-blue-400">
                        {asset.serialOrBarcode}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                      <span className="text-slate-500">বর্তমান কন্ডিশন:</span>
                      <span className="font-semibold capitalize text-emerald-600">
                        {asset.condition}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">ওয়ারেন্টি মেয়াদ:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {asset.warrantyExpiryDate || 'ওয়ারেন্টি নেই'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    সরবরাহকারী, অবস্থান ও রক্ষণাবেক্ষণ
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                      <span className="text-slate-500">সরবরাহকারী:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {asset.vendorOrSupplier}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                      <span className="text-slate-500">চালান নম্বর:</span>
                      <span className="font-semibold font-mono text-slate-800 dark:text-slate-200">
                        {asset.vendorInvoiceNo || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                      <span className="text-slate-500">বিভাগ ও শাখা:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {asset.department} — {asset.location}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                      <span className="text-slate-500">কাস্টোডিয়ান কর্মী:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {asset.custodianName} {asset.custodianPhone ? `(${asset.custodianPhone})` : ''}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">মোট মেরামত ব্যয়:</span>
                      <span className="font-bold text-amber-600">
                        {currency}{asset.totalMaintenanceCost.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {asset.notes && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-xl text-xs text-blue-900 dark:text-blue-200">
                  <strong>বিশেষ নোট:</strong> {asset.notes}
                </div>
              )}
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/40 rounded-xl">
                <div>
                  <h4 className="text-sm font-bold text-purple-950 dark:text-purple-200">
                    অবচয় মেথডোলজি: {asset.depreciationMethod === 'SLM' ? 'সরলরৈখিক পদ্ধতি (Straight Line Method)' : 'ক্রমহ্রাসমান পদ্ধতি (Written Down Value - WDV)'}
                  </h4>
                  <p className="text-xs text-purple-700 dark:text-purple-300">
                    আয়ুষ্কাল: {asset.usefulLifeYears} বছর | বার্ষিক অবচয় হার: {asset.depreciationRatePercentage}% | ভগ্নাংশ মূল্য: {currency}{asset.salvageValue.toLocaleString()}
                  </p>
                </div>
                <div className="text-xs bg-purple-200 dark:bg-purple-800 text-purple-900 dark:text-purple-100 font-bold px-3 py-1.5 rounded-lg">
                  স্বয়ংক্রিয় জাবেদা ইন্টিগ্রেটেড
                </div>
              </div>

              {/* Depreciation Schedule Table */}
              <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase font-semibold">
                    <tr>
                      <th className="p-3">বছর (FY)</th>
                      <th className="p-3">প্রারম্ভিক বুক ভ্যালু</th>
                      <th className="p-3">অবচয়ের হার</th>
                      <th className="p-3">বার্ষিক অবচয় ({currency})</th>
                      <th className="p-3">পুঞ্জীভূত অবচয়</th>
                      <th className="p-3">সমাপনী নেট বুক ভ্যালু</th>
                      <th className="p-3 text-center">জাবেদা স্ট্যাটাস</th>
                      <th className="p-3 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                    {schedule.map((row) => (
                      <tr key={row.year} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="p-3 font-bold text-slate-900 dark:text-slate-100">
                          Year {row.year} <span className="text-slate-400 font-normal">({row.fiscalYear})</span>
                        </td>
                        <td className="p-3">{currency}{row.openingBookValue.toLocaleString()}</td>
                        <td className="p-3 text-purple-600 dark:text-purple-400 font-bold">{row.depreciationRate}%</td>
                        <td className="p-3 font-bold text-rose-600 dark:text-rose-400">-{currency}{row.depreciationAmount.toLocaleString()}</td>
                        <td className="p-3 text-amber-600 dark:text-amber-400 font-bold">{currency}{row.accumulatedDepreciation.toLocaleString()}</td>
                        <td className="p-3 font-extrabold text-blue-600 dark:text-blue-400">{currency}{row.closingBookValue.toLocaleString()}</td>
                        <td className="p-3 text-center">
                          {row.isPosted ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                              <CheckCircle2 className="w-3 h-3" /> জাবেদায় পোস্টকৃত ({row.journalVoucherNo})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                              পোস্টিং পেন্ডিং
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          {!row.isPosted && asset.status !== 'disposed' ? (
                            <button
                              onClick={() => onPostDepreciationVoucher(asset, row.fiscalYear, row.depreciationAmount)}
                              className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-[11px] font-sans font-semibold transition-colors"
                            >
                              জাবেদায় পোস্ট করুন
                            </button>
                          ) : (
                            <span className="text-slate-400 text-[11px] font-sans">সম্পন্ন</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'maintenance' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    রক্ষণাবেক্ষণ ও মেরামতের সময়রেখা
                  </h4>
                  <p className="text-xs text-slate-500">
                    সর্বমোট মেরামত খরচ: <strong className="text-amber-600 font-bold">{currency}{asset.totalMaintenanceCost.toLocaleString()}</strong>
                  </p>
                </div>
                {asset.status !== 'disposed' && (
                  <button
                    onClick={() => onRecordMaintenance(asset)}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow"
                  >
                    <Wrench className="w-3.5 h-3.5" /> নতুন মেরামত এন্ট্রি
                  </button>
                )}
              </div>

              {maintenanceLogs.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-500">
                  <Wrench className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                  <p className="text-sm font-semibold">কোনো মেরামত রেকর্ড পাওয়া যায়নি।</p>
                  <p className="text-xs">যন্ত্রপাতির সার্ভিসিং হলে রেকর্ড মেইনটেন্যান্সে যোগ করুন।</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {maintenanceLogs.map(log => (
                    <div
                      key={log.id}
                      className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-wrap items-start justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                            {log.serviceProvider}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 font-semibold uppercase">
                            {log.maintenanceType.replace('_', ' ')}
                          </span>
                          {log.invoiceBillNo && (
                            <span className="text-[10px] font-mono text-slate-400">
                              বিল: {log.invoiceBillNo}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300">
                          {log.description}
                        </p>
                        {log.partsReplaced && (
                          <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                            প্রতিস্থাপিত পার্টস: {log.partsReplaced}
                          </p>
                        )}
                        <p className="text-[10px] text-slate-400">
                          তারিখ: {log.maintenanceDate} | সম্পন্ন করেছেন: {log.performedBy}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-slate-400 block">খরচ</span>
                        <span className="text-base font-bold text-amber-600 dark:text-amber-400">
                          {currency}{log.cost.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'disposal' && asset.disposal && (
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-5">
              <div className="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-rose-100 text-rose-700 rounded-xl">
                    <Trash2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      অফিসিয়াল সম্পদ নিষ্পত্তি ও বিক্রয় সার্টিফিকেট
                    </h3>
                    <p className="text-xs text-slate-500">
                      ভাউচার নম্বর: <span className="font-mono font-bold text-rose-600">{asset.disposal.journalVoucherNo}</span>
                    </p>
                  </div>
                </div>
                <span className="text-xs px-3 py-1 bg-rose-100 text-rose-800 rounded-full font-bold uppercase">
                  DISPOSED & RETIRED
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border">
                  <span className="text-[11px] text-slate-400 block">নিষ্পত্তির তারিখ</span>
                  <p className="font-bold font-mono text-sm">{asset.disposal.disposalDate}</p>
                </div>
                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border">
                  <span className="text-[11px] text-slate-400 block">নিষ্পত্তির পদ্ধতি</span>
                  <p className="font-bold text-sm capitalize">{asset.disposal.disposalType}</p>
                </div>
                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border">
                  <span className="text-[11px] text-slate-400 block">প্রাপ্ত বিক্রয়মূল্য</span>
                  <p className="font-bold text-sm text-emerald-600">{currency}{asset.disposal.saleProceeds.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border">
                  <span className="text-[11px] text-slate-400 block">লাভ / (লোকসান)</span>
                  <p className={`font-extrabold text-sm ${asset.disposal.gainOrLoss >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {asset.disposal.gainOrLoss >= 0 ? `+${currency}${asset.disposal.gainOrLoss.toLocaleString()}` : `-${currency}${Math.abs(asset.disposal.gainOrLoss).toLocaleString()}`}
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-xs bg-white dark:bg-slate-800 p-4 rounded-xl border">
                <p><strong>ক্রেতা বা ডিলার:</strong> {asset.disposal.buyerOrScrapDealer || 'সাধারণ স্ক্র্যাপ ডিলার'} {asset.disposal.contactPhone ? `(${asset.disposal.contactPhone})` : ''}</p>
                <p><strong>অনুমোদনকারী:</strong> {asset.disposal.approvedBy}</p>
                <p><strong>নিষ্পত্তির কারণ:</strong> {asset.disposal.reason}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
