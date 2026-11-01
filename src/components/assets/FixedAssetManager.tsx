import React, { useState, useMemo } from 'react';
import { 
  Building2, Plus, Search, Filter, Wrench, Trash2, Printer, Sparkles, 
  TrendingUp, TrendingDown, DollarSign, Calendar, Tag, ShieldCheck, 
  ArrowUpDown, CheckCircle2, AlertTriangle, Layers, Download
} from 'lucide-react';
import { FixedAsset, AssetMaintenanceRecord, AssetCategory, AssetStatus, Tenant, JournalEntry } from '../../types';
import { AddAssetModal } from './AddAssetModal';
import { AssetDetailModal } from './AssetDetailModal';
import { RecordMaintenanceModal } from './RecordMaintenanceModal';
import { DisposeAssetModal } from './DisposeAssetModal';
import { AssetTagPrintModal } from './AssetTagPrintModal';
import { 
  calculateSLMAnnualDepreciation, 
  calculateWDVAnnualDepreciation,
  createDepreciationJournalVoucher,
  createDisposalJournalVoucher
} from '../../utils/depreciationEngine';

interface FixedAssetManagerProps {
  tenant: Tenant;
  currency?: string;
  assets: FixedAsset[];
  maintenanceLogs: AssetMaintenanceRecord[];
  onSaveAsset: (asset: FixedAsset) => void;
  onUpdateAsset: (asset: FixedAsset) => void;
  onSaveMaintenanceRecord: (record: AssetMaintenanceRecord) => void;
  onPostJournalEntry?: (entry: JournalEntry) => void;
}

export const FixedAssetManager: React.FC<FixedAssetManagerProps> = ({
  tenant,
  currency = '৳',
  assets,
  maintenanceLogs,
  onSaveAsset,
  onUpdateAsset,
  onSaveMaintenanceRecord,
  onPostJournalEntry,
}) => {
  // Navigation & Sub-Tabs
  const [activeTab, setActiveTab] = useState<'register' | 'depreciation' | 'maintenance' | 'disposal'>('register');

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedAssetForDetail, setSelectedAssetForDetail] = useState<FixedAsset | null>(null);
  const [selectedAssetForMaintenance, setSelectedAssetForMaintenance] = useState<FixedAsset | null>(null);
  const [selectedAssetForDisposal, setSelectedAssetForDisposal] = useState<FixedAsset | null>(null);
  const [selectedAssetForTag, setSelectedAssetForTag] = useState<FixedAsset | null>(null);
  const [batchPostSuccessMessage, setBatchPostSuccessMessage] = useState<string | null>(null);

  // Financial KPIs
  const kpiData = useMemo(() => {
    const activeAssets = assets.filter(a => a.status !== 'disposed');
    const totalOriginalCost = activeAssets.reduce((sum, a) => sum + a.originalCost, 0);
    const totalAccumulatedDep = activeAssets.reduce((sum, a) => sum + a.accumulatedDepreciation, 0);
    const totalNetBookValue = Math.max(0, totalOriginalCost - totalAccumulatedDep);

    // Projected FY depreciation for active assets
    const projectedFYDep = activeAssets.reduce((sum, a) => {
      if (a.depreciationMethod === 'SLM') {
        return sum + calculateSLMAnnualDepreciation(a.originalCost, a.salvageValue, a.usefulLifeYears);
      } else if (a.depreciationMethod === 'WDV') {
        const currentNBV = Math.max(0, a.originalCost - a.accumulatedDepreciation);
        return sum + calculateWDVAnnualDepreciation(currentNBV, a.depreciationRatePercentage);
      }
      return sum;
    }, 0);

    const totalMaintenanceSpend = maintenanceLogs.reduce((sum, m) => sum + m.cost, 0);
    const disposedCount = assets.filter(a => a.status === 'disposed').length;

    return {
      totalOriginalCost,
      totalAccumulatedDep,
      totalNetBookValue,
      projectedFYDep: Math.round(projectedFYDep),
      totalMaintenanceSpend,
      activeCount: activeAssets.length,
      disposedCount,
    };
  }, [assets, maintenanceLogs]);

  // Filtered Assets
  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      const matchesSearch = 
        asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.assetCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.serialOrBarcode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.custodianName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.location.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = selectedCategory === 'all' || asset.category === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || asset.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [assets, searchTerm, selectedCategory, selectedStatus]);

  // Handle Save New Asset
  const handleCreateAsset = (assetData: Omit<FixedAsset, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newAsset: FixedAsset = {
      ...assetData,
      id: `ast-${Date.now()}`,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };

    onSaveAsset(newAsset);
    setIsAddModalOpen(false);
  };

  // Handle Record Maintenance
  const handleSaveMaintenance = (recordData: Omit<AssetMaintenanceRecord, 'id' | 'createdAt'>) => {
    const newRecord: AssetMaintenanceRecord = {
      ...recordData,
      id: `maint-${Date.now()}`,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };

    onSaveMaintenanceRecord(newRecord);

    // Update the asset's total maintenance cost and last maintenance date
    if (selectedAssetForMaintenance) {
      const updated = {
        ...selectedAssetForMaintenance,
        lastMaintenanceDate: recordData.maintenanceDate,
        totalMaintenanceCost: selectedAssetForMaintenance.totalMaintenanceCost + recordData.cost,
        updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      };
      onUpdateAsset(updated);
    }

    setSelectedAssetForMaintenance(null);
  };

  // Handle Asset Disposal & Auto Journal Posting
  const handleConfirmDisposal = (disposalData: any) => {
    if (!selectedAssetForDisposal) return;

    const fullDisposal = {
      ...disposalData,
      id: `dsp-${Date.now()}`,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };

    const updatedAsset: FixedAsset = {
      ...selectedAssetForDisposal,
      status: 'disposed',
      condition: 'disposed',
      disposal: fullDisposal,
      currentBookValue: 0,
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };

    onUpdateAsset(updatedAsset);

    // Auto post journal entry to General Ledger
    if (onPostJournalEntry) {
      const jv = createDisposalJournalVoucher(
        selectedAssetForDisposal,
        tenant.id,
        disposalData.saleProceeds,
        disposalData.disposalDate,
        disposalData.reason,
        disposalData.approvedBy
      );
      onPostJournalEntry(jv);
    }

    setSelectedAssetForDisposal(null);
    if (selectedAssetForDetail && selectedAssetForDetail.id === selectedAssetForDisposal.id) {
      setSelectedAssetForDetail(updatedAsset);
    }
  };

  // Post individual depreciation voucher
  const handlePostDepreciationVoucher = (asset: FixedAsset, fiscalYear: string, amount: number) => {
    if (onPostJournalEntry) {
      const jv = createDepreciationJournalVoucher(asset, tenant.id, amount, fiscalYear, tenant.ownerName);
      onPostJournalEntry(jv);
    }

    // Update accumulated depreciation on the asset
    const newAccumulated = asset.accumulatedDepreciation + amount;
    const newBookValue = Math.max(asset.salvageValue, asset.originalCost - newAccumulated);

    const updatedAsset: FixedAsset = {
      ...asset,
      accumulatedDepreciation: newAccumulated,
      currentBookValue: newBookValue,
      status: newBookValue <= asset.salvageValue ? 'fully_depreciated' : asset.status,
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };

    onUpdateAsset(updatedAsset);
    if (selectedAssetForDetail && selectedAssetForDetail.id === asset.id) {
      setSelectedAssetForDetail(updatedAsset);
    }

    setBatchPostSuccessMessage(`সাফল্যের সাথে ${asset.assetCode}-এর অবচয় ৳${amount.toLocaleString()} জাবেদায় পোস্ট করা হয়েছে!`);
    setTimeout(() => setBatchPostSuccessMessage(null), 4000);
  };

  // Batch Post all active assets depreciation
  const handleBatchPostAllDepreciation = () => {
    const activeAssets = assets.filter(a => a.status === 'in_service');
    let postedCount = 0;
    let totalPosted = 0;

    activeAssets.forEach(asset => {
      let depAmount = 0;
      if (asset.depreciationMethod === 'SLM') {
        depAmount = calculateSLMAnnualDepreciation(asset.originalCost, asset.salvageValue, asset.usefulLifeYears);
      } else if (asset.depreciationMethod === 'WDV') {
        const nbv = Math.max(0, asset.originalCost - asset.accumulatedDepreciation);
        depAmount = calculateWDVAnnualDepreciation(nbv, asset.depreciationRatePercentage);
      }

      if (depAmount > 0) {
        const remaining = Math.max(0, (asset.originalCost - asset.accumulatedDepreciation) - asset.salvageValue);
        const actualDep = Math.min(depAmount, remaining);

        if (actualDep > 0) {
          if (onPostJournalEntry) {
            const jv = createDepreciationJournalVoucher(asset, tenant.id, actualDep, '2026-2027', 'Batch Engine');
            onPostJournalEntry(jv);
          }

          const newAcc = asset.accumulatedDepreciation + actualDep;
          onUpdateAsset({
            ...asset,
            accumulatedDepreciation: newAcc,
            currentBookValue: Math.max(asset.salvageValue, asset.originalCost - newAcc),
            updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
          });

          postedCount++;
          totalPosted += actualDep;
        }
      }
    });

    setBatchPostSuccessMessage(`ব্যাচ প্রসেস সম্পন্ন: মোট ${postedCount}টি স্থায়ী সম্পদের সর্বমোট ৳${totalPosted.toLocaleString()} অবচয় জাবেদায় পোস্টিং সফল!`);
    setTimeout(() => setBatchPostSuccessMessage(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-blue-800/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-blue-500/20 text-blue-300 rounded-2xl border border-blue-400/30 backdrop-blur-md">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-400/20 text-blue-200 border border-blue-300/30 font-bold uppercase tracking-wider">
                  Phase 21: Enterprise Asset Engine
                </span>
                <span className="text-xs text-blue-200 font-mono">
                  {assets.length} Assets Registered
                </span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
                স্থায়ী সম্পদ ও অবচয় ব্যবস্থাপনা (Fixed Assets & Depreciation)
              </h1>
              <p className="text-xs text-blue-200/90 max-w-2xl mt-0.5">
                ফার্নিচার, পিওএস মেশিন, এয়ার কন্ডিশনার, যানবাহন ও কারখানার যন্ত্রপাতির খতিয়ান, SLM/WDV অবচয় ক্যালকুলেশন এবং অটোমেটেড জাবেদা পোস্টিং।
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleBatchPostAllDepreciation}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all active:scale-95"
            >
              <Sparkles className="w-4 h-4" /> বার্ষিক অবচয় রান (Run Depreciation)
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-500/30 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" /> নতুন সম্পদ নিবন্ধন (Add Asset)
            </button>
          </div>
        </div>

        {/* 5 KPI Highlight Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5 mt-6 pt-6 border-t border-blue-800/60">
          <div className="bg-white/10 dark:bg-slate-900/40 p-3.5 rounded-xl border border-white/10 backdrop-blur-sm">
            <span className="text-[11px] text-blue-200 block font-medium">মোট ক্রয়মূল্য (Gross Value)</span>
            <p className="text-lg font-extrabold text-white mt-0.5">
              {currency}{kpiData.totalOriginalCost.toLocaleString()}
            </p>
            <span className="text-[10px] text-blue-300 font-mono">{kpiData.activeCount}টি সক্রিয় সম্পদ</span>
          </div>

          <div className="bg-white/10 dark:bg-slate-900/40 p-3.5 rounded-xl border border-white/10 backdrop-blur-sm">
            <span className="text-[11px] text-amber-200 block font-medium">পুঞ্জীভূত অবচয় (Accumulated Dep.)</span>
            <p className="text-lg font-extrabold text-amber-300 mt-0.5">
              {currency}{kpiData.totalAccumulatedDep.toLocaleString()}
            </p>
            <span className="text-[10px] text-amber-200">
              {kpiData.totalOriginalCost > 0 ? Math.round((kpiData.totalAccumulatedDep / kpiData.totalOriginalCost) * 100) : 0}% হ্রাসপ্রাপ্ত
            </span>
          </div>

          <div className="bg-white/10 dark:bg-slate-900/40 p-3.5 rounded-xl border border-white/10 backdrop-blur-sm">
            <span className="text-[11px] text-emerald-200 block font-medium">নেট বুক ভ্যালু (Net Carrying Value)</span>
            <p className="text-lg font-extrabold text-emerald-300 mt-0.5">
              {currency}{kpiData.totalNetBookValue.toLocaleString()}
            </p>
            <span className="text-[10px] text-emerald-200">ব্যালেন্স শিট সম্পদ মূল্য</span>
          </div>

          <div className="bg-white/10 dark:bg-slate-900/40 p-3.5 rounded-xl border border-white/10 backdrop-blur-sm">
            <span className="text-[11px] text-purple-200 block font-medium">চলতি অর্থবছরে অবচয় (FY Expense)</span>
            <p className="text-lg font-extrabold text-purple-300 mt-0.5">
              {currency}{kpiData.projectedFYDep.toLocaleString()}
            </p>
            <span className="text-[10px] text-purple-200">SLM + WDV প্রক্ষেপিত</span>
          </div>

          <div className="bg-white/10 dark:bg-slate-900/40 p-3.5 rounded-xl border border-white/10 backdrop-blur-sm">
            <span className="text-[11px] text-rose-200 block font-medium">মোট মেরামত ব্যয় ও নিষ্পত্তি</span>
            <p className="text-lg font-extrabold text-rose-300 mt-0.5">
              {currency}{kpiData.totalMaintenanceSpend.toLocaleString()}
            </p>
            <span className="text-[10px] text-rose-200">{kpiData.disposedCount}টি নিষ্পত্তি/বিক্রয়</span>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {batchPostSuccessMessage && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 rounded-xl flex items-center justify-between gap-3 text-emerald-900 dark:text-emerald-200 animate-fadeIn">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            {batchPostSuccessMessage}
          </div>
          <button
            onClick={() => setBatchPostSuccessMessage(null)}
            className="text-xs text-emerald-700 hover:underline font-bold"
          >
            বন্ধ করুন
          </button>
        </div>
      )}

      {/* Sub-Tabs Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('register')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'register'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> স্থায়ী সম্পদ খতিয়ান ({assets.length})
          </button>
          <button
            onClick={() => setActiveTab('depreciation')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'depreciation'
                ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> অবচয় ইঞ্জিন ও জাবেদা (SLM/WDV)
          </button>
          <button
            onClick={() => setActiveTab('maintenance')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'maintenance'
                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" /> মেরামত ও সার্ভিসিং লগ ({maintenanceLogs.length})
          </button>
          <button
            onClick={() => setActiveTab('disposal')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'disposal'
                ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" /> নিষ্পত্তি ও লাভ-ক্ষতি ({kpiData.disposedCount})
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="সম্পদের নাম, কোড, সিরিয়াল বা রুম..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 pr-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs w-64 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="all">সকল ক্যাটাগরি</option>
            <option value="office_appliances">অফিস অ্যাপ্লায়েন্স</option>
            <option value="pos_hardware">পিওএস হার্ডওয়্যার</option>
            <option value="it_computer">আইটি ও কম্পিউটার</option>
            <option value="furniture_fixtures">ফার্নিচার ও ফিক্সচার</option>
            <option value="vehicles">যানবাহন</option>
            <option value="medical_equipment">মেডিকেল ইকুইপমেন্ট</option>
          </select>

          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="all">সকল স্ট্যাটাস</option>
            <option value="in_service">ব্যবহারাধীন (In Service)</option>
            <option value="under_maintenance">মেরামত চলছে</option>
            <option value="disposed">নিষ্পত্তি/বাতিল</option>
          </select>
        </div>
      </div>

      {/* Tab 1: Asset Register View */}
      {activeTab === 'register' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAssets.map(asset => {
              const currentNBV = Math.max(0, asset.originalCost - asset.accumulatedDepreciation);
              const depPct = asset.originalCost > 0
                ? Math.min(100, Math.round((asset.accumulatedDepreciation / asset.originalCost) * 100))
                : 0;

              return (
                <div
                  key={asset.id}
                  className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    {/* Top Row: Code & Status */}
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-extrabold px-2.5 py-0.5 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
                        {asset.assetCode}
                      </span>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        asset.status === 'in_service'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : asset.status === 'under_maintenance'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}>
                        {asset.status === 'in_service' ? 'ব্যবহারাধীন' : asset.status === 'under_maintenance' ? 'সার্ভিসিং' : 'নিষ্পত্তি'}
                      </span>
                    </div>

                    {/* Name & Category */}
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {asset.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 capitalize mt-0.5">
                        {asset.category.replace('_', ' ')} | SN: <span className="font-mono">{asset.serialOrBarcode}</span>
                      </p>
                    </div>

                    {/* Financial Metrics */}
                    <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block">ক্রয়মূল্য</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {currency}{asset.originalCost.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-blue-500 dark:text-blue-400 block">নেট বুক ভ্যালু (NBV)</span>
                        <span className="font-extrabold text-blue-700 dark:text-blue-300">
                          {currency}{currentNBV.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Depreciation Progress */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>অবচয় সম্পন্ন: {depPct}%</span>
                        <span className="font-medium text-amber-600">
                          -{currency}{asset.accumulatedDepreciation.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-amber-500 h-1.5 rounded-full"
                          style={{ width: `${depPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Custodian & Location */}
                    <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                      <span className="truncate max-w-[160px]">{asset.location}</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">{asset.custodianName}</span>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedAssetForDetail(asset)}
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-semibold flex-1 transition-colors text-center"
                    >
                      বিস্তারিত দেখুন (Details)
                    </button>
                    <button
                      onClick={() => setSelectedAssetForTag(asset)}
                      title="বারকোড ট্যাগ প্রিন্ট"
                      className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg transition-colors"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                    {asset.status !== 'disposed' && (
                      <button
                        onClick={() => setSelectedAssetForMaintenance(asset)}
                        title="রক্ষণাবেক্ষণ লগ এন্ট্রি"
                        className="p-1.5 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-600 rounded-lg transition-colors"
                      >
                        <Wrench className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredAssets.length === 0 && (
            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-500">
              <Building2 className="w-12 h-12 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold">কোনো স্থায়ী সম্পদ খুঁজে পাওয়া যায়নি।</p>
              <p className="text-xs">নতুন কোনো সরঞ্জাম বা ফার্নিচার যোগ করতে উপরের বাটনটিতে ক্লিক করুন।</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Depreciation Engine View */}
      {activeTab === 'depreciation' && (
        <div className="space-y-5">
          {/* Methodology Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20 rounded-2xl border border-indigo-200 dark:border-indigo-900/40 space-y-2">
              <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-indigo-600" /> সরলরৈখিক পদ্ধতি (Straight Line Method - SLM)
              </div>
              <p className="text-xs text-indigo-800 dark:text-indigo-300">
                প্রতি বছর সমান হারে অবচয় কর্তন করা হয়। সূত্র: <code>(ক্রয়মূল্য - ভগ্নাংশ মূল্য) ÷ আয়ুষ্কাল</code>। অফিস ফার্নিচার ও এসি-র জন্য উপযোগী।
              </p>
              <div className="text-xs font-mono font-semibold text-indigo-700 dark:text-indigo-300">
                SLM আওতাভুক্ত সম্পদ: {assets.filter(a => a.depreciationMethod === 'SLM').length}টি
              </div>
            </div>

            <div className="p-5 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-2xl border border-purple-200 dark:border-purple-900/40 space-y-2">
              <div className="flex items-center gap-2 text-purple-900 dark:text-purple-200 font-bold text-sm">
                <TrendingDown className="w-4 h-4 text-purple-600" /> ক্রমহ্রাসমান পদ্ধতি (Written Down Value - WDV)
              </div>
              <p className="text-xs text-purple-800 dark:text-purple-300">
                প্রতি বছর প্রারম্ভিক নেট বুক ভ্যালুর ওপর নির্দিষ্ট % হারে অবচয় কর্তন হয়। কম্পিউটার, গাড়ি ও দ্রুত ক্ষয়শীল ভারী মেশিনারির জন্য মানসম্মত।
              </p>
              <div className="text-xs font-mono font-semibold text-purple-700 dark:text-purple-300">
                WDV আওতাভুক্ত সম্পদ: {assets.filter(a => a.depreciationMethod === 'WDV').length}টি
              </div>
            </div>
          </div>

          {/* Master Depreciation Table */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  চলতি অর্থবছরের (২০২৬-২০২৭) অবচয় হিসেব ও জাবেদা শিডিউল
                </h3>
                <p className="text-xs text-slate-500">
                  সরাসরি বাটন ক্লিক করে যে কোনো সম্পদের অবচয় জাবেদায় পোস্টিং করা যাবে।
                </p>
              </div>
              <button
                onClick={handleBatchPostAllDepreciation}
                className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-colors"
              >
                সবগুলোর অবচয় পোস্ট করুন
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 uppercase font-semibold">
                  <tr>
                    <th className="p-3.5">সম্পদের কোড ও নাম</th>
                    <th className="p-3.5">পদ্ধতি</th>
                    <th className="p-3.5">ক্রয়মূল্য</th>
                    <th className="p-3.5">বর্তমান বুক ভ্যালু</th>
                    <th className="p-3.5">অবচয় হার</th>
                    <th className="p-3.5">প্রদেয় বার্ষিক অবচয়</th>
                    <th className="p-3.5 text-center">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {assets.filter(a => a.status !== 'disposed').map(asset => {
                    let annualDep = 0;
                    if (asset.depreciationMethod === 'SLM') {
                      annualDep = calculateSLMAnnualDepreciation(asset.originalCost, asset.salvageValue, asset.usefulLifeYears);
                    } else if (asset.depreciationMethod === 'WDV') {
                      const nbv = Math.max(0, asset.originalCost - asset.accumulatedDepreciation);
                      annualDep = calculateWDVAnnualDepreciation(nbv, asset.depreciationRatePercentage);
                    }

                    const currentNBV = Math.max(0, asset.originalCost - asset.accumulatedDepreciation);

                    return (
                      <tr key={asset.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                        <td className="p-3.5">
                          <span className="font-mono font-bold text-blue-600 dark:text-blue-400 block">{asset.assetCode}</span>
                          <span className="font-semibold text-slate-900 dark:text-slate-100">{asset.name}</span>
                        </td>
                        <td className="p-3.5">
                          <span className="font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                            {asset.depreciationMethod}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono">{currency}{asset.originalCost.toLocaleString()}</td>
                        <td className="p-3.5 font-mono font-bold text-blue-600 dark:text-blue-400">
                          {currency}{currentNBV.toLocaleString()}
                        </td>
                        <td className="p-3.5 font-mono text-purple-600 dark:text-purple-400 font-bold">
                          {asset.depreciationRatePercentage}%
                        </td>
                        <td className="p-3.5 font-mono font-bold text-rose-600 dark:text-rose-400">
                          {currency}{annualDep.toLocaleString()}
                        </td>
                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => handlePostDepreciationVoucher(asset, '2026-2027', annualDep)}
                            className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-[11px] font-semibold transition-colors"
                          >
                            জাবেদায় পোস্ট করুন
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Maintenance & Servicing Hub */}
      {activeTab === 'maintenance' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                সকল স্থায়ী সম্পদের সার্ভিসিং ও মেরামত ইতিহাস
              </h3>
              <p className="text-xs text-slate-500">
                মোট মেরামত ব্যয়: <strong className="text-amber-600 font-bold">{currency}{kpiData.totalMaintenanceSpend.toLocaleString()}</strong>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {maintenanceLogs.map(log => (
              <div
                key={log.id}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                    {log.assetCode}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 font-semibold uppercase">
                    {log.maintenanceType.replace('_', ' ')}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    {log.serviceProvider}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                    {log.description}
                  </p>
                </div>

                {log.partsReplaced && (
                  <div className="text-[11px] bg-slate-50 dark:bg-slate-900 p-2 rounded-lg text-slate-700 dark:text-slate-300">
                    <strong>পার্টস:</strong> {log.partsReplaced}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700 text-xs">
                  <span className="text-slate-400">{log.maintenanceDate}</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    {currency}{log.cost.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Disposal & Scrap Register */}
      {activeTab === 'disposal' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                নিষ্পত্তি, বিক্রয় ও স্ক্র্যাপ রেজিস্টার (Asset Disposal & Gain/Loss)
              </h3>
              <p className="text-xs text-slate-500">
                সম্পদ মেয়াদান্তে বিক্রয় বা বাতিলের পর নিট লাভ বা ক্ষতি এবং অডিট রেফারেন্স।
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 uppercase font-semibold">
                  <tr>
                    <th className="p-3.5">সম্পদের কোড ও নাম</th>
                    <th className="p-3.5">নিষ্পত্তির তারিখ</th>
                    <th className="p-3.5">মূল ক্রয়মূল্য</th>
                    <th className="p-3.5">নিষ্পত্তিকালীন বুক ভ্যালু</th>
                    <th className="p-3.5">প্রাপ্ত বিক্রয়মূল্য</th>
                    <th className="p-3.5">লাভ / (লোকসান)</th>
                    <th className="p-3.5">জাবেদা ভাউচার</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {assets.filter(a => a.status === 'disposed' && a.disposal).map(asset => {
                    const disp = asset.disposal!;
                    const isGain = disp.gainOrLoss >= 0;

                    return (
                      <tr key={asset.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                        <td className="p-3.5">
                          <span className="font-mono font-bold text-rose-600 block">{asset.assetCode}</span>
                          <span className="font-semibold text-slate-900 dark:text-slate-100">{asset.name}</span>
                        </td>
                        <td className="p-3.5 font-mono">{disp.disposalDate}</td>
                        <td className="p-3.5 font-mono">{currency}{disp.originalCost.toLocaleString()}</td>
                        <td className="p-3.5 font-mono">{currency}{disp.bookValueAtDisposal.toLocaleString()}</td>
                        <td className="p-3.5 font-mono font-bold text-emerald-600">
                          {currency}{disp.saleProceeds.toLocaleString()}
                        </td>
                        <td className="p-3.5 font-mono font-extrabold">
                          <span className={`px-2 py-0.5 rounded ${isGain ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                            {isGain ? `+${currency}${disp.gainOrLoss.toLocaleString()}` : `-${currency}${Math.abs(disp.gainOrLoss).toLocaleString()}`}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono text-purple-600 font-bold">
                          {disp.journalVoucherNo || 'N/A'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {isAddModalOpen && (
        <AddAssetModal
          tenantId={tenant.id}
          currency={currency}
          existingCount={assets.length}
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleCreateAsset}
        />
      )}

      {selectedAssetForDetail && (
        <AssetDetailModal
          asset={selectedAssetForDetail}
          maintenanceLogs={maintenanceLogs.filter(m => m.assetId === selectedAssetForDetail.id)}
          currency={currency}
          tenant={tenant}
          onClose={() => setSelectedAssetForDetail(null)}
          onRecordMaintenance={asset => {
            setSelectedAssetForMaintenance(asset);
          }}
          onDisposeAsset={asset => {
            setSelectedAssetForDisposal(asset);
          }}
          onPrintTag={asset => {
            setSelectedAssetForTag(asset);
          }}
          onPostDepreciationVoucher={handlePostDepreciationVoucher}
        />
      )}

      {selectedAssetForMaintenance && (
        <RecordMaintenanceModal
          asset={selectedAssetForMaintenance}
          currency={currency}
          onClose={() => setSelectedAssetForMaintenance(null)}
          onSave={handleSaveMaintenance}
        />
      )}

      {selectedAssetForDisposal && (
        <DisposeAssetModal
          asset={selectedAssetForDisposal}
          currency={currency}
          onClose={() => setSelectedAssetForDisposal(null)}
          onConfirmDisposal={handleConfirmDisposal}
        />
      )}

      {selectedAssetForTag && (
        <AssetTagPrintModal
          asset={selectedAssetForTag}
          tenant={tenant}
          onClose={() => setSelectedAssetForTag(null)}
        />
      )}
    </div>
  );
};
