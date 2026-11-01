import React, { useState, useMemo } from 'react';
import { 
  Sparkles, TrendingUp, AlertTriangle, Package, ShoppingCart, 
  RefreshCw, Send, Printer, Tag, Calendar, DollarSign, 
  ShieldAlert, CheckCircle2, ChevronRight, MessageSquare, 
  HelpCircle, Search, Filter, ArrowUpRight, Clock, Box,
  FileText, Award, Layers, Bot, Zap, Flame, ExternalLink,
  ArrowRight
} from 'lucide-react';
import { 
  Tenant, Product, Sale, Supplier, SupplierPurchaseOrder,
  AIDemandForecast, DemandRiskLevel, AutoPurchaseOrder,
  SeasonalDemandTrend, DeadStockLiquidationItem
} from '../../types';
import { 
  calculateInventoryForecasts, 
  generateAutonomousPurchaseOrders, 
  queryGeminiSupplyChainAnalyst 
} from '../../utils/aiForecastEngine';
import { AutoPOApprovalModal } from './AutoPOApprovalModal';
import { PrintAutoPOModal } from './PrintAutoPOModal';
import { DeadStockPromoModal } from './DeadStockPromoModal';

interface AIDemandForecastManagerProps {
  tenant: Tenant;
  products: Product[];
  sales: Sale[];
  suppliers: Supplier[];
  autoPurchaseOrders: AutoPurchaseOrder[];
  seasonalTrends: SeasonalDemandTrend[];
  deadStockItems: DeadStockLiquidationItem[];
  onApproveAndCreatePO: (approvedPo: SupplierPurchaseOrder) => void;
  onUpdateAutoPoStatus: (autoPoId: string, status: AutoPurchaseOrder['status']) => void;
  onApplyDeadStockPromo: (productId: string, newSellingPrice: number, discountPct: number) => void;
  onGenerateNewAutoPOs?: (newPos: AutoPurchaseOrder[]) => void;
}

export const AIDemandForecastManager: React.FC<AIDemandForecastManagerProps> = ({
  tenant,
  products,
  sales,
  suppliers,
  autoPurchaseOrders,
  seasonalTrends,
  deadStockItems,
  onApproveAndCreatePO,
  onUpdateAutoPoStatus,
  onApplyDeadStockPromo,
  onGenerateNewAutoPOs,
}) => {
  const [activeTab, setActiveTab] = useState<'radar' | 'autopo' | 'deadstock' | 'seasonal' | 'gemini'>('radar');
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<'all' | DemandRiskLevel>('all');
  const [selectedAutoPoForApproval, setSelectedAutoPoForApproval] = useState<AutoPurchaseOrder | null>(null);
  const [selectedAutoPoForPrint, setSelectedAutoPoForPrint] = useState<AutoPurchaseOrder | null>(null);
  const [selectedDeadStockItem, setSelectedDeadStockItem] = useState<DeadStockLiquidationItem | null>(null);
  
  // Gemini AI Chat state
  const [geminiQuestion, setGeminiQuestion] = useState('');
  const [geminiChatHistory, setGeminiChatHistory] = useState<Array<{ role: 'user' | 'assistant'; text: string; time: string }>>([
    {
      role: 'assistant',
      text: `স্বাগতম! আমি JH IMSE এর অটোনোমাস সাপ্লাই চেইন এআই কনসালটেন্ট। আপনার বর্তমান স্টকের বিক্রয় বেগ (Sales Velocity), রি-অর্ডার পয়েন্ট (ROP) এবং ঘাটতি ঝুঁকি বিশ্লেষণ সম্পন্ন হয়েছে। আপনি যেকোনো প্রশ্ন করতে পারেন।`,
      time: 'এখনই'
    }
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Compute live mathematical forecasts
  const liveForecasts = useMemo(() => {
    return calculateInventoryForecasts(products, sales, suppliers);
  }, [products, sales, suppliers]);

  // Aggregate Key Statistics
  const stats = useMemo(() => {
    const criticalCount = liveForecasts.filter(f => f.riskLevel === 'critical').length;
    const warningCount = liveForecasts.filter(f => f.riskLevel === 'warning').length;
    const optimalCount = liveForecasts.filter(f => f.riskLevel === 'optimal').length;
    const deadStockCount = deadStockItems.length;
    const draftPoCount = autoPurchaseOrders.filter(po => po.status === 'draft').length;
    
    const totalRevenueAtRisk = liveForecasts
      .filter(f => f.riskLevel === 'critical' || f.riskLevel === 'warning')
      .reduce((acc, f) => acc + f.stockoutImpactEstimatedLoss, 0);

    const totalDeadStockCapital = deadStockItems.reduce((acc, i) => acc + i.tiedUpCapital, 0);

    return {
      totalSkus: products.length,
      criticalCount,
      warningCount,
      optimalCount,
      deadStockCount,
      draftPoCount,
      totalRevenueAtRisk,
      totalDeadStockCapital,
    };
  }, [liveForecasts, deadStockItems, autoPurchaseOrders, products.length]);

  // Filtered forecasts for Radar view
  const filteredForecasts = useMemo(() => {
    return liveForecasts.filter(item => {
      const matchesSearch = 
        item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRisk = riskFilter === 'all' || item.riskLevel === riskFilter;

      return matchesSearch && matchesRisk;
    });
  }, [liveForecasts, searchQuery, riskFilter]);

  // Recalculate and generate autonomous POs
  const handleTriggerAutonomousAutoPO = () => {
    const newPos = generateAutonomousPurchaseOrders(liveForecasts, products, suppliers, tenant.id);
    if (onGenerateNewAutoPOs) {
      onGenerateNewAutoPOs(newPos);
    }
    setActiveTab('autopo');
  };

  // Handle Gemini Chat Submit
  const handleAskGemini = async (e?: React.FormEvent, customQ?: string) => {
    if (e) e.preventDefault();
    const query = customQ || geminiQuestion;
    if (!query.trim() || isAiLoading) return;

    const userMsg = {
      role: 'user' as const,
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setGeminiChatHistory(prev => [...prev, userMsg]);
    setGeminiQuestion('');
    setIsAiLoading(true);

    try {
      const response = await queryGeminiSupplyChainAnalyst(query, tenant.name, liveForecasts, suppliers);
      setGeminiChatHistory(prev => [
        ...prev,
        {
          role: 'assistant' as const,
          text: response,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    } catch {
      setGeminiChatHistory(prev => [
        ...prev,
        {
          role: 'assistant' as const,
          text: 'দুঃখিত, সংযোগে ত্রুটি হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-300 animate-spin" /> Phase 12: AI Autonomous Demand Forecasting & Auto-PO
              </span>
              <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[11px] font-semibold">
                গুগল জেমিনি ইন্টেলিজেন্স সক্রিয়
              </span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              স্মার্ট সাপ্লাই চেইন ও অটোনোমাস ইনভেন্টরি অপ্টিমাইজার
            </h1>
            <p className="text-slate-300 text-xs md:text-sm max-w-2xl">
              গাণিতিক বিক্রয় বেগ ($V$), ডায়নামিক রি-অর্ডার পয়েন্ট ($ROP$) এবং সেফটি স্টক ($SS$) অ্যালগরিদমের মাধ্যমে স্টক-আউট শূন্যে নামানো ও স্বয়ংক্রিয় পারচেজ অর্ডার সিস্টেম।
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleTriggerAutonomousAutoPO}
              className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-900/30 flex items-center gap-2 transition cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" /> রি-অর্ডার হিসাব ও অটো-পিও রান
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {/* Total Analyzed */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold">মোট SKU ফোরকাস্ট</span>
            <Package className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl font-extrabold text-slate-900">{stats.totalSkus}</div>
          <div className="text-[10px] text-emerald-600 font-medium flex items-center gap-0.5 mt-1">
            <CheckCircle2 className="w-3 h-3" /> শতভাগ ট্র্যাকিং লাইভ
          </div>
        </div>

        {/* Critical Risk */}
        <div className="bg-rose-50/70 p-4 rounded-2xl border border-rose-200 shadow-2xs">
          <div className="flex items-center justify-between text-rose-700 mb-1">
            <span className="text-[11px] font-bold">🚨 সংকটপূর্ণ (&lt;৭২ ঘণ্টা)</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-xl font-extrabold text-rose-700">{stats.criticalCount} টি আইটেম</div>
          <div className="text-[10px] text-rose-600 font-semibold mt-1">
            তাৎক্ষণিক রিস্টক আবশ্যক
          </div>
        </div>

        {/* Warning ROP */}
        <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 shadow-2xs">
          <div className="flex items-center justify-between text-amber-700 mb-1">
            <span className="text-[11px] font-bold">⚠️ রি-অর্ডার সংকেত (ROP)</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-extrabold text-amber-800">{stats.warningCount} টি আইটেম</div>
          <div className="text-[10px] text-amber-700 font-semibold mt-1">
            নিরাপদ সীমার নিচে স্টক
          </div>
        </div>

        {/* Revenue at Risk */}
        <div className="bg-purple-50/70 p-4 rounded-2xl border border-purple-200 shadow-2xs">
          <div className="flex items-center justify-between text-purple-700 mb-1">
            <span className="text-[11px] font-bold">ঝুঁকিপূর্ণ সম্ভাব্য বিক্রয়</span>
            <DollarSign className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-xl font-extrabold text-purple-900">৳{stats.totalRevenueAtRisk.toLocaleString()}</div>
          <div className="text-[10px] text-purple-700 font-semibold mt-1">
            স্টক-আউট হলে রাজস্ব ক্ষতি
          </div>
        </div>

        {/* Draft Auto-POs */}
        <div className="bg-indigo-50/70 p-4 rounded-2xl border border-indigo-200 shadow-2xs">
          <div className="flex items-center justify-between text-indigo-700 mb-1">
            <span className="text-[11px] font-bold">ড্রাফট অটো-পিও (PO)</span>
            <ShoppingCart className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl font-extrabold text-indigo-900">{stats.draftPoCount} টি অর্ডার</div>
          <div className="text-[10px] text-indigo-700 font-semibold mt-1">
            অনুমোদনের অপেক্ষায়
          </div>
        </div>

        {/* Dead Stock Capital */}
        <div className="bg-slate-100 p-4 rounded-2xl border border-slate-300 shadow-2xs">
          <div className="flex items-center justify-between text-slate-700 mb-1">
            <span className="text-[11px] font-bold">আটকে থাকা মূলধন</span>
            <Tag className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-xl font-extrabold text-slate-900">৳{stats.totalDeadStockCapital.toLocaleString()}</div>
          <div className="text-[10px] text-slate-600 font-medium mt-1">
            {stats.deadStockCount} টি ডেড-স্টক আইটেম
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap gap-1.5">
        <button
          onClick={() => setActiveTab('radar')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'radar'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          স্টকআউট রাডার ও সেলস ভেলোসিটি
          {stats.criticalCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
              {stats.criticalCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('autopo')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'autopo'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          স্বয়ংক্রিয় পারচেজ অর্ডার হাব (Auto-PO)
          {stats.draftPoCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-indigo-500 text-white text-[10px] font-bold">
              {stats.draftPoCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('deadstock')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'deadstock'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Tag className="w-4 h-4" />
          ডেড-স্টক ও মূলধন পুনরুদ্ধার
        </button>

        <button
          onClick={() => setActiveTab('seasonal')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'seasonal'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Flame className="w-4 h-4 text-amber-400" />
          মৌসুমি ডিমান্ড ট্রেন্ড (Seasonal Surge)
        </button>

        <button
          onClick={() => setActiveTab('gemini')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'gemini'
              ? 'bg-gradient-to-r from-purple-700 to-indigo-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Bot className="w-4 h-4 text-purple-300" />
          জেমিনি এআই কনসালটেন্ট (Q&A)
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: STOCKOUT RADAR & SALES VELOCITY */}
      {/* ======================================================== */}
      {activeTab === 'radar' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="পণ্যের নাম, SKU বা ক্যাটাগরি সার্চ করুন..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> ফিল্টার:
              </span>
              <button
                onClick={() => setRiskFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  riskFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                সব পণ্য ({liveForecasts.length})
              </button>
              <button
                onClick={() => setRiskFilter('critical')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  riskFilter === 'critical' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                }`}
              >
                🚨 সংকটপূর্ণ ({stats.criticalCount})
              </button>
              <button
                onClick={() => setRiskFilter('warning')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  riskFilter === 'warning' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                }`}
              >
                ⚠️ রি-অর্ডার সতর্কতা ({stats.warningCount})
              </button>
              <button
                onClick={() => setRiskFilter('optimal')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  riskFilter === 'optimal' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                ✅ স্বাভাবিক
              </button>
            </div>
          </div>

          {/* Forecasts Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
                    <th className="py-3 px-4">পণ্যের বিবরণ ও SKU</th>
                    <th className="py-3 px-3 text-right">বর্তমান স্টক</th>
                    <th className="py-3 px-3 text-right">বিক্রয় বেগ ($V$)</th>
                    <th className="py-3 px-3 text-center">স্টক স্থায়িত্ব ($DIR$)</th>
                    <th className="py-3 px-3 text-right">ROP ও সেফটি স্টক</th>
                    <th className="py-3 px-3 text-right">প্রস্তাবিত রি-অর্ডার</th>
                    <th className="py-3 px-3 text-center">ঝুঁকির স্তর</th>
                    <th className="py-3 px-4">এআই বিশ্লেষণ ও কারণ</th>
                    <th className="py-3 px-3 text-center">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredForecasts.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-400">
                        কোনো পণ্য পাওয়া যায়নি
                      </td>
                    </tr>
                  ) : (
                    filteredForecasts.map(forecast => {
                      const isCritical = forecast.riskLevel === 'critical';
                      const isWarning = forecast.riskLevel === 'warning';
                      const isOver = forecast.riskLevel === 'overstocked';

                      return (
                        <tr 
                          key={forecast.productId}
                          className={`hover:bg-slate-50/80 transition ${
                            isCritical ? 'bg-rose-50/30' : isWarning ? 'bg-amber-50/20' : ''
                          }`}
                        >
                          {/* Product Details */}
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{forecast.productName}</div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-2">
                              <span>SKU: {forecast.sku}</span>
                              <span>•</span>
                              <span>{forecast.category}</span>
                            </div>
                            <div className="text-[10px] text-purple-700 font-medium mt-0.5">
                              মূল সাপ্লায়ার: {forecast.preferredSupplierName || 'প্রধান সরবরাহকারী'}
                            </div>
                          </td>

                          {/* Current Stock */}
                          <td className="py-3 px-3 text-right">
                            <span className={`font-extrabold text-sm ${
                              isCritical ? 'text-rose-600' : isWarning ? 'text-amber-600' : 'text-slate-900'
                            }`}>
                              {forecast.currentStock}
                            </span>
                          </td>

                          {/* Velocity */}
                          <td className="py-3 px-3 text-right">
                            <div className="font-bold text-slate-800">{forecast.salesVelocity} /দিন</div>
                            <div className="text-[10px] text-slate-400">৩০ দিনের গড়</div>
                          </td>

                          {/* DIR (Days Inventory Remaining) */}
                          <td className="py-3 px-3 text-center">
                            <div className={`inline-flex flex-col items-center px-2 py-1 rounded-xl text-[11px] font-bold ${
                              forecast.daysOfInventoryRemaining <= 3 
                                ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                                : forecast.daysOfInventoryRemaining <= 7 
                                ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                                : 'bg-emerald-50 text-emerald-700'
                            }`}>
                              <span>{forecast.daysOfInventoryRemaining} দিন বাকি</span>
                              <span className="text-[9px] font-normal text-slate-500">শেষ: {forecast.runOutDate}</span>
                            </div>
                          </td>

                          {/* ROP & Safety Stock */}
                          <td className="py-3 px-3 text-right">
                            <div className="font-bold text-slate-800">ROP: {forecast.reorderPoint}</div>
                            <div className="text-[10px] text-slate-500">সেফটি: {forecast.safetyStock} (LT {forecast.leadTimeDays}d)</div>
                          </td>

                          {/* Recommended Reorder */}
                          <td className="py-3 px-3 text-right">
                            <span className="font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                              +{forecast.recommendedOrderQty}
                            </span>
                          </td>

                          {/* Risk Badge */}
                          <td className="py-3 px-3 text-center">
                            {isCritical && (
                              <span className="px-2 py-1 rounded-full bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-extrabold whitespace-nowrap">
                                🚨 সংকটপূর্ণ (&lt;৭২ঘণ্টা)
                              </span>
                            )}
                            {isWarning && (
                              <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-bold whitespace-nowrap">
                                ⚠️ রি-অর্ডার প্রয়োজন
                              </span>
                            )}
                            {!isCritical && !isWarning && !isOver && (
                              <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold whitespace-nowrap">
                                ✅ পর্যাপ্ত স্টক
                              </span>
                            )}
                            {isOver && (
                              <span className="px-2 py-1 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold whitespace-nowrap">
                                📦 ওভারস্টকড
                              </span>
                            )}
                          </td>

                          {/* AI Reasoning */}
                          <td className="py-3 px-4 max-w-xs">
                            <div className="text-[11px] text-slate-600 line-clamp-2 hover:line-clamp-none transition-all duration-200 cursor-pointer" title={forecast.aiReasoning}>
                              {forecast.aiReasoning}
                            </div>
                            {(isCritical || isWarning) && (
                              <div className="text-[10px] text-rose-600 font-semibold mt-0.5">
                                ঘাটতিতে রাজস্ব ঝুঁকি: ৳{forecast.stockoutImpactEstimatedLoss.toLocaleString()}
                              </div>
                            )}
                          </td>

                          {/* Action */}
                          <td className="py-3 px-3 text-center">
                            {(isCritical || isWarning) ? (
                              <button
                                onClick={handleTriggerAutonomousAutoPO}
                                className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-[11px] font-bold flex items-center gap-1 shadow-xs transition cursor-pointer mx-auto"
                              >
                                <ShoppingCart className="w-3.5 h-3.5" /> পিও বানান
                              </button>
                            ) : (
                              <span className="text-slate-400 text-[10px] font-medium">প্রয়োজন নেই</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: AUTONOMOUS PURCHASE ORDER HUB (AUTO-PO) */}
      {/* ======================================================== */}
      {activeTab === 'autopo' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-purple-700" />
                সাপ্লায়ার অনুযায়ী গ্রুপকৃত স্বয়ংক্রিয় পারচেজ অর্ডার ({autoPurchaseOrders.length}টি সক্রিয় অর্ডার)
              </h3>
              <p className="text-xs text-slate-500">
                AI অ্যালগরিদম প্রতিটি পণ্যের ঘাটতি ও প্রাথমিক সাপ্লায়ার বিবেচনা করে একক PO তে সমন্বয় করেছে।
              </p>
            </div>
            <button
              onClick={handleTriggerAutonomousAutoPO}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto"
            >
              <RefreshCw className="w-3.5 h-3.5 text-purple-300" /> নতুন অর্ডার রিফ্রেশ করুন
            </button>
          </div>

          <div className="grid gap-4">
            {autoPurchaseOrders.map(autoPo => {
              const isCriticalUrgency = autoPo.urgency === 'critical';
              const isApproved = autoPo.status === 'approved' || autoPo.status === 'sent_whatsapp';

              return (
                <div 
                  key={autoPo.id}
                  className={`bg-white rounded-2xl border ${
                    isCriticalUrgency ? 'border-rose-200 shadow-rose-100/50' : 'border-slate-200'
                  } shadow-sm overflow-hidden`}
                >
                  {/* Card Header */}
                  <div className={`px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                    isCriticalUrgency ? 'bg-rose-50/40' : 'bg-slate-50/70'
                  } border-b border-slate-100`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${
                        isCriticalUrgency ? 'bg-rose-100 text-rose-700' : 'bg-purple-100 text-purple-700'
                      }`}>
                        <ShoppingCart className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-slate-900">{autoPo.autoPoNumber}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            autoPo.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                            autoPo.status === 'sent_whatsapp' ? 'bg-teal-100 text-teal-800' :
                            'bg-indigo-100 text-indigo-800'
                          }`}>
                            {autoPo.status === 'approved' ? 'অনুমোদিত' :
                             autoPo.status === 'sent_whatsapp' ? 'হোয়াটসঅ্যাপ প্রেরিত' : 'খসড়া (Draft)'}
                          </span>
                          {isCriticalUrgency && (
                            <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold">
                              🚨 সংকটপূর্ণ জরুরি
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                          <span className="font-bold text-slate-700">{autoPo.supplierName}</span>
                          <span>•</span>
                          <span>ফোন: {autoPo.supplierPhone || 'N/A'}</span>
                          <span>•</span>
                          <span>জেনারেট: {autoPo.generatedDate}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => setSelectedAutoPoForPrint(autoPo)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" /> ভাউচার প্রিন্ট
                      </button>

                      <button
                        onClick={() => setSelectedAutoPoForApproval(autoPo)}
                        className={`px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                          isApproved 
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                            : 'bg-purple-700 hover:bg-purple-800 text-white shadow-xs'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {isApproved ? 'অর্ডার আপডেট / দেখুন' : 'পর্যালোচনা ও ১-ক্লিকে অনুমোদন'}
                      </button>
                    </div>
                  </div>

                  {/* Card Content & Items */}
                  <div className="p-5 space-y-4">
                    {/* Reason */}
                    <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100 text-xs text-purple-950 flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>এআই রিস্টক সিদ্ধান্ত:</strong> {autoPo.aiGeneratedReason}
                      </div>
                    </div>

                    {/* Items table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                            <th className="py-2 px-3">পণ্য</th>
                            <th className="py-2 px-3 text-right">বর্তমান স্টক</th>
                            <th className="py-2 px-3 text-right">দৈনিক বেগ</th>
                            <th className="py-2 px-3 text-right">প্রস্তাবিত সংখ্যা</th>
                            <th className="py-2 px-3 text-right">অর্ডার পরিমাণ</th>
                            <th className="py-2 px-3 text-right">একক রেট (৳)</th>
                            <th className="py-2 px-3 text-right">মোট সম্ভাব্য খরচ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {autoPo.items.map((item, idx) => (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="py-2 px-3 font-bold text-slate-800">{item.productName} ({item.sku})</td>
                              <td className="py-2 px-3 text-right text-slate-600">{item.currentStock} {item.unit}</td>
                              <td className="py-2 px-3 text-right text-slate-600">{item.velocityDaily} {item.unit}</td>
                              <td className="py-2 px-3 text-right text-indigo-700 font-semibold">{item.recommendedQty} {item.unit}</td>
                              <td className="py-2 px-3 text-right font-extrabold text-slate-900">{item.orderQty} {item.unit}</td>
                              <td className="py-2 px-3 text-right text-slate-600">৳{item.unitCost.toFixed(2)}</td>
                              <td className="py-2 px-3 text-right font-bold text-purple-900">৳{item.totalCost.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="border-t border-slate-200 font-extrabold text-slate-900">
                            <td colSpan={6} className="py-2.5 px-3 text-right">মোট অর্ডার মূল্য:</td>
                            <td className="py-2.5 px-3 text-right text-sm text-purple-700">৳{autoPo.totalAmount.toLocaleString()}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: DEAD-STOCK LIQUIDATION & CAPITAL RECOVERY */}
      {/* ======================================================== */}
      {activeTab === 'deadstock' && (
        <div className="space-y-4">
          <div className="bg-amber-500/10 border border-amber-300 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-amber-500 text-white rounded-xl shrink-0 mt-0.5">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-amber-950">
                  ডেড-স্টক ক্যাপিটাল রিকভারি ইঞ্জিন
                </h3>
                <p className="text-xs text-amber-900 max-w-2xl mt-0.5">
                  যেসব পণ্য ৬০ দিনের বেশি সময় অবিক্রিত অবস্থায় শেলফে পড়ে রয়েছে, সেগুলোতে স্বয়ংক্রিয় ডিসকাউন্ট প্রমোশন দিয়ে আটকে থাকা মূলধন দ্রুত ক্যাশে রূপান্তর করুন।
                </p>
              </div>
            </div>

            <div className="bg-white px-4 py-2.5 rounded-xl border border-amber-200 text-center shrink-0">
              <div className="text-[10px] font-bold text-amber-700 uppercase">মোট উদ্ধারযোগ্য ক্যাপিটাল</div>
              <div className="text-lg font-extrabold text-amber-950">৳{stats.totalDeadStockCapital.toLocaleString()}</div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {deadStockItems.map(item => (
              <div key={item.productId} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">
                      {item.daysWithoutSale} দিন অবিক্রিত
                    </span>
                    <span className="text-xs text-slate-400 font-mono">{item.sku}</span>
                  </div>

                  <h4 className="font-bold text-sm text-slate-900">{item.productName}</h4>
                  <div className="text-xs text-slate-500">{item.category}</div>

                  <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">মজুদ পরিমাণ:</span>
                      <span className="font-bold text-slate-800">{item.currentStock} পিস</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">আটকে থাকা মূলধন:</span>
                      <span className="font-bold text-rose-600">৳{item.tiedUpCapital.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">বর্তমান বিক্রয়মূল্য:</span>
                      <span className="line-through text-slate-400">৳{item.sellingPrice}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-200 font-bold">
                      <span className="text-purple-700">{item.suggestedDiscountPct}% ছাড়ে প্রস্তাবিত মূল্য:</span>
                      <span className="text-emerald-700">৳{item.suggestedSalePrice}</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-amber-900 bg-amber-50 p-2.5 rounded-xl border border-amber-200/60 font-medium">
                    📢 <strong>প্রমোশনাল হুক:</strong> &ldquo;{item.promotionalHook}&rdquo;
                  </div>
                </div>

                <button
                  onClick={() => setSelectedDeadStockItem(item)}
                  className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
                >
                  <Tag className="w-3.5 h-3.5" /> লিকুইডেশন ক্যাম্পেইন চালু করুন
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: SEASONAL DEMAND SURGE TRENDS */}
      {/* ======================================================== */}
      {activeTab === 'seasonal' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              বাংলাদেশি মৌসুমি আবহাওয়া ও রোগের চাহিদার পূর্বাভাস (Seasonal Demand Engine)
            </h3>
            <p className="text-xs text-slate-500">
              শীতকালীন ঠান্ডা, গ্রীষ্মের তাপদাহ বা বর্ষার ডেঙ্গু মৌসুমে নির্দিষ্ট গ্রুপের ওষুধের চাহিদা শতকরা ৫০% থেকে ১২০% বৃদ্ধি পায়।
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {seasonalTrends.map(trend => (
              <div key={trend.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 text-[10px] font-extrabold flex items-center gap-1">
                      <Flame className="w-3 h-3 text-orange-600" /> +{trend.expectedDemandSurgePct}% ডিমান্ড বৃদ্ধি
                    </span>
                    <span className="text-[11px] text-slate-400 font-semibold">{trend.peakPeriod}</span>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{trend.seasonNameBn}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 font-medium">{trend.seasonName}</p>
                  </div>

                  <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100 text-xs text-purple-950">
                    <strong>প্রস্তুতি পরামর্শ:</strong> {trend.recommendedAction}
                  </div>

                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">উচ্চ চাহিদাসম্পন্ন পণ্য:</span>
                    <div className="space-y-1.5">
                      {trend.highDemandProducts.map((p, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs p-2 bg-slate-50 rounded-lg">
                          <span className="font-semibold text-slate-800">{p.productName}</span>
                          <div className="flex items-center gap-2 text-[11px]">
                            <span className="text-slate-400">স্টক: {p.currentStock}</span>
                            <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                              টার্গেট: {p.recommendedStockBuffer}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleTriggerAutonomousAutoPO}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <ShoppingCart className="w-3.5 h-3.5 text-purple-300" /> মৌসুমি বাফার স্টক নিশ্চিত করুন
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: GEMINI AI SUPPLY CHAIN ANALYST (INTERACTIVE Q&A) */}
      {/* ======================================================== */}
      {activeTab === 'gemini' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-purple-800 to-indigo-900 text-white p-5 rounded-2xl shadow-md flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/10 rounded-xl">
                <Bot className="w-6 h-6 text-purple-300" />
              </div>
              <div>
                <h3 className="font-bold text-base">গুগল জেমিনি সাপ্লাই চেইন অ্যানালিস্ট</h3>
                <p className="text-xs text-purple-200">
                  আপনার ইনভেন্টরির রিয়েল-টাইম তথ্য অনুযায়ী সিদ্ধান্ত গ্রহণ ও ব্যবসায়িক পরামর্শ
                </p>
              </div>
            </div>
          </div>

          {/* Quick Query Suggestion Chips */}
          <div className="flex flex-wrap gap-2">
            {[
              'কোন কোন মালের স্টক আগামী ৩ দিনে শেষ হয়ে যাবে?',
              'সবচেয়ে বেশি লাভজনক পণ্যগুলোর রিস্টক সুপারিশ কী?',
              'ডেড-স্টক দ্রুত লিকুইডেট করার উপায় কী?',
              'সাপ্লায়ারদের সাথে দেনা-পাওনা ও ক্যাশ ফ্লো সমন্বয় কীভাবে করব?'
            ].map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleAskGemini(undefined, chip)}
                className="px-3 py-1.5 bg-white hover:bg-purple-50 text-slate-700 hover:text-purple-700 border border-slate-200 hover:border-purple-300 rounded-xl text-xs font-medium transition cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-3 h-3 text-purple-500" /> {chip}
              </button>
            ))}
          </div>

          {/* Chat Container */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col h-[460px]">
            {/* Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {geminiChatHistory.map((msg, idx) => (
                <div 
                  key={idx}
                  className={`flex gap-3 max-w-2xl ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    msg.role === 'user' ? 'bg-purple-700 text-white' : 'bg-indigo-100 text-indigo-700'
                  }`}>
                    {msg.role === 'user' ? 'আমি' : <Bot className="w-4 h-4" />}
                  </div>

                  <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-purple-700 text-white rounded-tr-none' 
                      : 'bg-slate-50 text-slate-800 border border-slate-200 rounded-tl-none font-medium'
                  }`}>
                    <div>{msg.text}</div>
                    <div className={`text-[9px] mt-1.5 ${msg.role === 'user' ? 'text-purple-200' : 'text-slate-400'}`}>
                      {msg.time}
                    </div>
                  </div>
                </div>
              ))}

              {isAiLoading && (
                <div className="flex gap-3 max-w-xl">
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 rounded-tl-none text-xs text-slate-500 flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-600" /> জেমিনি এআই আপনার ইনভেন্টরি বিশ্লেষণ করছে...
                  </div>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleAskGemini} className="p-3 bg-slate-50 border-t border-slate-200 flex gap-2">
              <input
                type="text"
                value={geminiQuestion}
                onChange={e => setGeminiQuestion(e.target.value)}
                placeholder="ইনভেন্টরি বা সাপ্লাই চেইন সম্পর্কে প্রশ্ন লিখুন..."
                disabled={isAiLoading}
                className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
              <button
                type="submit"
                disabled={isAiLoading || !geminiQuestion.trim()}
                className="px-5 py-2 bg-purple-700 hover:bg-purple-800 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" /> পাঠান
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODALS */}
      {/* ======================================================== */}
      {/* Auto-PO Review & Approval Modal */}
      {selectedAutoPoForApproval && (
        <AutoPOApprovalModal
          isOpen={true}
          onClose={() => setSelectedAutoPoForApproval(null)}
          tenant={tenant}
          autoPo={selectedAutoPoForApproval}
          onApproveAndCreatePO={approvedPo => {
            onApproveAndCreatePO(approvedPo);
            onUpdateAutoPoStatus(selectedAutoPoForApproval.id, 'approved');
            setSelectedAutoPoForApproval(null);
          }}
          onUpdateAutoPoStatus={onUpdateAutoPoStatus}
          onOpenPrintPO={po => {
            setSelectedAutoPoForApproval(null);
            setSelectedAutoPoForPrint(po);
          }}
        />
      )}

      {/* Printable Auto-PO Voucher Modal */}
      {selectedAutoPoForPrint && (
        <PrintAutoPOModal
          isOpen={true}
          onClose={() => setSelectedAutoPoForPrint(null)}
          tenant={tenant}
          autoPo={selectedAutoPoForPrint}
        />
      )}

      {/* Dead Stock Liquidation Campaign Modal */}
      {selectedDeadStockItem && (
        <DeadStockPromoModal
          isOpen={true}
          onClose={() => setSelectedDeadStockItem(null)}
          tenant={tenant}
          item={selectedDeadStockItem}
          onApplyPromo={(productId, newPrice, discountPct) => {
            onApplyDeadStockPromo(productId, newPrice, discountPct);
            setSelectedDeadStockItem(null);
          }}
        />
      )}
    </div>
  );
};
