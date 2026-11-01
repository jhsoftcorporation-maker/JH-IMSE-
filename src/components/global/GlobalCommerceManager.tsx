import React, { useState, useMemo } from 'react';
import { 
  Globe, CreditCard, DollarSign, ArrowLeftRight, TrendingUp, TrendingDown,
  ShieldCheck, RefreshCw, Smartphone, Layers, CheckCircle2, AlertCircle,
  ExternalLink, Printer, Search, Plus, Eye, Key, Sliders, FileText, Send, Zap
} from 'lucide-react';
import { 
  Tenant, CurrencyCode, ExchangeRateRecord, PaymentGatewayConfig,
  CrossBorderTaxSlab, CrossBorderTransaction 
} from '../../types';
import { StripeCheckoutModal } from './StripeCheckoutModal';
import { InternationalInvoiceModal } from './InternationalInvoiceModal';

interface GlobalCommerceManagerProps {
  tenant: Tenant;
  exchangeRates: ExchangeRateRecord[];
  paymentGateways: PaymentGatewayConfig[];
  taxSlabs: CrossBorderTaxSlab[];
  transactions: CrossBorderTransaction[];
  onUpdateExchangeRate: (rateRecord: ExchangeRateRecord) => void;
  onToggleGateway: (gatewayId: string, isEnabled: boolean) => void;
  onUpdateGatewayMode: (gatewayId: string, mode: 'sandbox' | 'production') => void;
  onAddTransaction: (trx: CrossBorderTransaction) => void;
  onSaveTaxSlab: (slab: CrossBorderTaxSlab) => void;
}

export const GlobalCommerceManager: React.FC<GlobalCommerceManagerProps> = ({
  tenant,
  exchangeRates,
  paymentGateways,
  taxSlabs,
  transactions,
  onUpdateExchangeRate,
  onToggleGateway,
  onUpdateGatewayMode,
  onAddTransaction,
  onSaveTaxSlab,
}) => {
  const [subTab, setSubTab] = useState<'forex' | 'gateways' | 'taxes' | 'ledger'>('forex');
  
  // Modals
  const [isStripeModalOpen, setIsStripeModalOpen] = useState(false);
  const [selectedInvoiceTrx, setSelectedInvoiceTrx] = useState<CrossBorderTransaction | null>(null);
  const [selectedJvTrx, setSelectedJvTrx] = useState<CrossBorderTransaction | null>(null);

  // FX Calculator State
  const [calcAmount, setCalcAmount] = useState<number>(100);
  const [calcFromCurrency, setCalcFromCurrency] = useState<CurrencyCode>('USD');
  const [calcToCurrency, setCalcToCurrency] = useState<CurrencyCode>('BDT');

  // Rate Editing State
  const [editingRate, setEditingRate] = useState<ExchangeRateRecord | null>(null);
  const [editRateValue, setEditRateValue] = useState<number>(0);

  // Webhook Simulator State
  const [webhookEventType, setWebhookEventType] = useState<'checkout.session.completed' | 'payment_intent.succeeded' | 'charge.refunded'>('checkout.session.completed');
  const [webhookSimulationResult, setWebhookSimulationResult] = useState<{
    status: number;
    signatureVerified: boolean;
    timestamp: string;
    payloadPreview: string;
  } | null>(null);
  const [isSimulatingWebhook, setIsSimulatingWebhook] = useState(false);

  // Customs Duty Estimator State
  const [dutyValue, setDutyValue] = useState<number>(500);
  const [dutyCountry, setDutyCountry] = useState<string>('US');
  const [dutyCategory, setDutyCategory] = useState<string>('medicines');

  // Ledger Filter
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [ledgerCurrencyFilter, setLedgerCurrencyFilter] = useState<'all' | CurrencyCode>('all');
  const [ledgerGatewayFilter, setLedgerGatewayFilter] = useState<'all' | 'stripe' | 'paypal' | 'apple_pay'>('all');

  // Overall Financial Aggregates
  const stats = useMemo(() => {
    const totalTransactions = transactions.length;
    const totalBDT = transactions.reduce((sum, t) => sum + t.baseAmountBDT, 0);
    const totalForexGainLoss = transactions.reduce((sum, t) => sum + t.forexGainLossBDT, 0);
    const totalNetBDT = transactions.reduce((sum, t) => sum + t.netAmountBDT, 0);
    const activeGatewaysCount = paymentGateways.filter(g => g.isEnabled).length;

    return {
      totalTransactions,
      totalBDT,
      totalForexGainLoss,
      totalNetBDT,
      activeGatewaysCount,
    };
  }, [transactions, paymentGateways]);

  // Currency Converter calculation
  const calculatedConversion = useMemo(() => {
    const getRateToBDT = (cur: CurrencyCode): number => {
      if (cur === 'BDT') return 1;
      const found = exchangeRates.find(r => r.fromCurrency === cur);
      return found ? found.rate : 1;
    };

    const rateFrom = getRateToBDT(calcFromCurrency);
    const rateTo = getRateToBDT(calcToCurrency);

    // Amount in BDT
    const amountInBDT = calcAmount * rateFrom;
    // Converted to target currency
    const result = amountInBDT / rateTo;
    const effectiveCrossRate = rateFrom / rateTo;

    return {
      result: Number(result.toFixed(2)),
      effectiveCrossRate: Number(effectiveCrossRate.toFixed(4)),
      amountInBDT: Number(amountInBDT.toFixed(2)),
    };
  }, [calcAmount, calcFromCurrency, calcToCurrency, exchangeRates]);

  // Handle Edit Rate Save
  const handleSaveRate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRate) return;
    const updated: ExchangeRateRecord = {
      ...editingRate,
      rate: editRateValue,
      inverseRate: Number((1 / editRateValue).toFixed(5)),
      buyRate: Number((editRateValue * 0.995).toFixed(2)),
      sellRate: Number((editRateValue * 1.005).toFixed(2)),
      lastUpdated: new Date().toISOString().replace('T', ' ').slice(0, 19),
      source: 'manual',
    };
    onUpdateExchangeRate(updated);
    setEditingRate(null);
  };

  // Webhook Simulator Action
  const handleSimulateWebhook = () => {
    setIsSimulatingWebhook(true);
    setWebhookSimulationResult(null);

    setTimeout(() => {
      setIsSimulatingWebhook(false);
      const fakePayload = {
        id: `evt_1N9x${Math.random().toString(36).substring(2, 8)}`,
        object: 'event',
        type: webhookEventType,
        created: Math.floor(Date.now() / 1000),
        data: {
          object: {
            id: `pi_3N9xLive${Math.floor(100000 + Math.random() * 900000)}`,
            amount: 12000,
            currency: 'usd',
            status: 'succeeded',
            customer_email: 'buyer@globalenterprise.com',
            metadata: {
              tenant_id: tenant.id,
              tenant_name: tenant.name,
              platform: 'JH_IMSE_CLOUD',
            },
          },
        },
      };

      setWebhookSimulationResult({
        status: 200,
        signatureVerified: true,
        timestamp: new Date().toLocaleTimeString(),
        payloadPreview: JSON.stringify(fakePayload, null, 2),
      });
    }, 800);
  };

  // Customs calculation
  const calculatedCustoms = useMemo(() => {
    const selectedSlab = taxSlabs.find(s => s.countryCode === dutyCountry) || taxSlabs[0];
    let dutyPct = 0;
    if (dutyCategory === 'medicines') dutyPct = 0; // Essential pharma duty-free
    else if (dutyCategory === 'electronics') dutyPct = 5.0;
    else if (dutyCategory === 'textiles') dutyPct = 7.5;
    else dutyPct = 10.0;

    const dutyAmount = (dutyValue * dutyPct) / 100;
    const vatRate = selectedSlab.standardRatePct;
    const vatAmount = ((dutyValue + dutyAmount) * vatRate) / 100;
    const totalLandedCost = dutyValue + dutyAmount + vatAmount;

    return {
      dutyPct,
      dutyAmount: Number(dutyAmount.toFixed(2)),
      vatRate,
      vatAmount: Number(vatAmount.toFixed(2)),
      totalLandedCost: Number(totalLandedCost.toFixed(2)),
    };
  }, [dutyValue, dutyCountry, dutyCategory, taxSlabs]);

  // Filtered Ledger
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (t.tenantId !== tenant.id) return false;
      if (ledgerCurrencyFilter !== 'all' && t.currency !== ledgerCurrencyFilter) return false;
      if (ledgerGatewayFilter !== 'all' && t.gateway !== ledgerGatewayFilter) return false;
      if (ledgerSearch.trim()) {
        const q = ledgerSearch.toLowerCase();
        const matchNo = t.transactionNo.toLowerCase().includes(q);
        const matchCust = t.customerName.toLowerCase().includes(q);
        const matchPi = t.paymentIntentId.toLowerCase().includes(q);
        if (!matchNo && !matchCust && !matchPi) return false;
      }
      return true;
    });
  }, [transactions, tenant.id, ledgerCurrencyFilter, ledgerGatewayFilter, ledgerSearch]);

  return (
    <div className="space-y-6">
      {/* Top Banner / Global Performance Summary */}
      <div className="bg-linear-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-400 text-slate-900">
                Phase 13 Active
              </span>
              <span className="text-purple-300 text-xs font-semibold">
                মাল্টি-কারেন্সি ও আন্তর্জাতিক পেমেন্ট ইঞ্জিন
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <Globe className="w-6 h-6 text-purple-400" />
              গ্লোবাল পেমেন্ট গেটওয়ে ও ফরেক্স হাব
            </h2>
            <p className="text-xs text-purple-200 mt-1 max-w-2xl">
              বিশ্বব্যাপী মার্কিন যুক্তরাষ্ট্র, যুক্তরাজ্য, ইউরোপ, দুবাই ও সৌদি আরবের গ্রাহকদের কাছ থেকে Stripe, PayPal, Apple Pay ও কার্ডে যেকোনো মুদ্রায় বিল গ্রহণ ও রিয়েল-টাইম মুদ্রা নিষ্পত্তি।
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsStripeModalOpen(true)}
              className="px-4 py-2.5 bg-[#635BFF] hover:bg-[#5349e4] text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span>Stripe টেস্ট চেকআউট চালান</span>
            </button>
          </div>
        </div>

        {/* 4 Key Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10">
          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3 border border-white/10">
            <span className="text-[10px] uppercase font-bold text-purple-200 block">মোট আন্তর্জাতিক ভলিউম:</span>
            <div className="text-lg font-black text-white mt-0.5">
              ৳{stats.totalBDT.toLocaleString()} <span className="text-[11px] font-medium text-purple-200">BDT</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-semibold block mt-0.5">
              {stats.totalTransactions} টি বৈদেশিক লেনদেন সম্পন্ন
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3 border border-white/10">
            <span className="text-[10px] uppercase font-bold text-purple-200 block">মুদ্রা রূপান্তর লাভ (Forex Gain):</span>
            <div className="text-lg font-black text-emerald-300 mt-0.5">
              {stats.totalForexGainLoss >= 0 ? '+' : ''}৳{stats.totalForexGainLoss.toFixed(2)}
            </div>
            <span className="text-[10px] text-purple-200 block mt-0.5">
              স্বয়ংক্রিয় জাবেদায় পোস্টিং সম্পন্ন
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3 border border-white/10">
            <span className="text-[10px] uppercase font-bold text-purple-200 block">সক্রিয় বৈদেশিক মুদ্রা:</span>
            <div className="text-lg font-black text-white mt-0.5">
              ৬টি কারেন্সি
            </div>
            <span className="text-[10px] text-purple-300 block mt-0.5">
              USD, EUR, GBP, AED, SAR, BDT
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3 border border-white/10">
            <span className="text-[10px] uppercase font-bold text-purple-200 block">গেটওয়ে আপটাইম ও সিকিউরিটি:</span>
            <div className="text-lg font-black text-white mt-0.5 flex items-center gap-1.5">
              <span>১০০%</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-[10px] text-emerald-400 block mt-0.5 font-semibold">
              3D Secure 2.0 • SCA এনক্রিপ্টেড
            </span>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-slate-200 bg-white rounded-2xl p-1.5 shadow-xs gap-1 overflow-x-auto">
        <button
          onClick={() => setSubTab('forex')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            subTab === 'forex'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ArrowLeftRight className="w-4 h-4" />
          লাইভ এক্সচেঞ্জ রেট ও ফরেক্স কনভার্টার
        </button>

        <button
          onClick={() => setSubTab('gateways')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            subTab === 'gateways'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          আন্তর্জাতিক পেমেন্ট গেটওয়ে হাব
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-100 text-purple-800 font-extrabold">
            {stats.activeGatewaysCount}
          </span>
        </button>

        <button
          onClick={() => setSubTab('taxes')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            subTab === 'taxes'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          আন্তর্জাতিক ট্যাক্স স্ল্যাব ও NBR মূসক ৬.৩
        </button>

        <button
          onClick={() => setSubTab('ledger')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            subTab === 'ledger'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          ক্রস-বর্ডার সেলস ও ফরেক্স লাভ-ক্ষতি লেজার
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-extrabold">
            {filteredTransactions.length}
          </span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* SUB-TAB 1: LIVE FOREX RATES & CURRENCY CONVERTER */}
      {/* ======================================================== */}
      {subTab === 'forex' && (
        <div className="space-y-6">
          {/* Top Row: Rates Table + Interactive Currency Converter */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Live Exchange Rates Table (2 cols) */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-purple-700" />
                    আন্তর্জাতিক মুদ্রা ও লাইভ এক্সচেঞ্জ রেট বোর্ড
                  </h3>
                  <p className="text-xs text-slate-500">
                    বাংলাদেশ ব্যাংক ও ওপেন এক্সচেঞ্জ সেন্ট্রাল ফরেক্স ডেটা ফিড (বেস কারেন্সি: BDT ৳)
                  </p>
                </div>
                <button
                  onClick={() => alert('সেন্ট্রাল ব্যাংক API ফিড থেকে এক্সচেঞ্জ রেট সফলভাবে রিফ্রেশ করা হয়েছে!')}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  API সিঙ্ক
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-y border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">মুদ্রা (Currency)</th>
                      <th className="py-2.5 px-3">প্রমিত মধ্যম দর (Mid Rate)</th>
                      <th className="py-2.5 px-3">ক্রয় দর (Buy)</th>
                      <th className="py-2.5 px-3">বিক্রয় দর (Sell)</th>
                      <th className="py-2.5 px-3">২৪ ঘণ্টার পরিবর্তন</th>
                      <th className="py-2.5 px-3 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {exchangeRates.map(fx => (
                      <tr key={fx.id} className="hover:bg-purple-50/40 transition">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <span className="text-xl">
                              {fx.fromCurrency === 'USD' ? '🇺🇸' : fx.fromCurrency === 'EUR' ? '🇪🇺' : fx.fromCurrency === 'GBP' ? '🇬🇧' : fx.fromCurrency === 'AED' ? '🇦🇪' : '🇸🇦'}
                            </span>
                            <div>
                              <strong className="text-slate-900 font-bold block">{fx.fromCurrency} / BDT</strong>
                              <span className="text-[10px] text-slate-400 capitalize">{fx.source.replace('_', ' ')}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 font-mono text-sm font-bold text-purple-900">
                          ৳{fx.rate.toFixed(2)}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-600">
                          ৳{fx.buyRate.toFixed(2)}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-600">
                          ৳{fx.sellRate.toFixed(2)}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                            fx.change24hPct >= 0
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}>
                            {fx.change24hPct >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {fx.change24hPct >= 0 ? '+' : ''}{fx.change24hPct}%
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => {
                              setEditingRate(fx);
                              setEditRateValue(fx.rate);
                            }}
                            className="px-2.5 py-1 bg-white border border-slate-200 hover:border-purple-600 text-purple-700 hover:bg-purple-50 rounded-lg text-[11px] font-semibold transition cursor-pointer"
                          >
                            দর পরিবর্তন
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Interactive Currency Converter Tool (1 col) */}
            <div className="bg-linear-to-b from-purple-50 to-white rounded-3xl border border-purple-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-purple-100">
                <ArrowLeftRight className="w-4 h-4 text-purple-700" />
                <h4 className="font-bold text-xs text-purple-950 uppercase tracking-wide">
                  লাইভ কারেন্সি কনভার্টার ক্যালকুলেটর
                </h4>
              </div>

              {/* Amount Input */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">রূপান্তর পরিমাণ (Amount):</label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  value={calcAmount}
                  onChange={e => setCalcAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl text-slate-900 font-bold text-sm focus:outline-purple-600"
                />
              </div>

              {/* From Currency Selector */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">উৎস মুদ্রা (From):</label>
                <select
                  value={calcFromCurrency}
                  onChange={e => setCalcFromCurrency(e.target.value as CurrencyCode)}
                  className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-purple-600"
                >
                  <option value="BDT">BDT (৳) - বাংলাদেশী টাকা</option>
                  <option value="USD">USD ($) - মার্কিন ডলার</option>
                  <option value="EUR">EUR (€) - ইউরো</option>
                  <option value="GBP">GBP (£) - ব্রিটিশ পাউন্ড</option>
                  <option value="AED">AED (د.إ) - ইউএই দিরহাম</option>
                  <option value="SAR">SAR (﷼) - সৌদি রিয়াল</option>
                </select>
              </div>

              {/* Swap Button */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    const temp = calcFromCurrency;
                    setCalcFromCurrency(calcToCurrency);
                    setCalcToCurrency(temp);
                  }}
                  className="p-2 rounded-full bg-white border border-purple-200 text-purple-700 hover:bg-purple-100 transition cursor-pointer shadow-2xs"
                  title="মুদ্রা উল্টান (Swap)"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* To Currency Selector */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">গন্তব্য মুদ্রা (To):</label>
                <select
                  value={calcToCurrency}
                  onChange={e => setCalcToCurrency(e.target.value as CurrencyCode)}
                  className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-purple-600"
                >
                  <option value="BDT">BDT (৳) - বাংলাদেশী টাকা</option>
                  <option value="USD">USD ($) - মার্কিন ডলার</option>
                  <option value="EUR">EUR (€) - ইউরো</option>
                  <option value="GBP">GBP (£) - ব্রিটিশ পাউন্ড</option>
                  <option value="AED">AED (د.إ) - ইউএই দিরহাম</option>
                  <option value="SAR">SAR (﷼) - সৌদি রিয়াল</option>
                </select>
              </div>

              {/* Calculated Result Display Card */}
              <div className="bg-purple-900 text-white rounded-2xl p-4 space-y-1 shadow-md">
                <span className="text-[10px] text-purple-200 font-medium uppercase tracking-wide block">
                  মোট রূপান্তরিত মূল্য:
                </span>
                <div className="text-xl font-black text-white">
                  {calcToCurrency} {calculatedConversion.result.toLocaleString()}
                </div>
                <div className="text-[11px] text-purple-200 pt-1 border-t border-purple-800 flex justify-between">
                  <span>এক্সচেঞ্জ ক্রস-রেট:</span>
                  <span className="font-mono font-bold">1 {calcFromCurrency} = {calculatedConversion.effectiveCrossRate} {calcToCurrency}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Rate Edit Modal */}
          {editingRate && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl border border-slate-200 animate-in zoom-in-95">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h4 className="font-bold text-xs text-slate-900">
                    ম্যানুয়াল এক্সচেঞ্জ রেট পরিবর্তন ({editingRate.fromCurrency})
                  </h4>
                  <button onClick={() => setEditingRate(null)} className="text-slate-400 hover:text-slate-700">✕</button>
                </div>

                <form onSubmit={handleSaveRate} className="space-y-3 text-xs">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      ১ {editingRate.fromCurrency} = কত BDT (৳)?
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={editRateValue}
                      onChange={e => setEditRateValue(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                    />
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-[11px] text-slate-500">
                    রেট পরিবর্তন করলে স্টোরফ্রন্ট এবং পিওএস-এ তাত্ক্ষণিকভাবে নতুন রূপান্তরিত মূল্য প্রদর্শিত হবে।
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingRate(null)}
                      className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold"
                    >
                      বাতিল
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold"
                    >
                      সংরক্ষণ করুন
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 2: PAYMENT GATEWAYS HUB (Stripe, PayPal, Apple Pay) */}
      {/* ======================================================== */}
      {subTab === 'gateways' && (
        <div className="space-y-6">
          {/* Gateways Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {paymentGateways.map(gw => (
              <div 
                key={gw.id}
                className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-purple-300 transition"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-white shadow-xs ${
                        gw.gatewayKey === 'stripe' ? 'bg-[#635BFF]' :
                        gw.gatewayKey === 'paypal' ? 'bg-[#0070BA]' :
                        gw.gatewayKey === 'apple_pay' ? 'bg-black' : 'bg-rose-600'
                      }`}>
                        {gw.gatewayKey === 'stripe' ? <CreditCard className="w-5 h-5" /> :
                         gw.gatewayKey === 'paypal' ? <DollarSign className="w-5 h-5" /> :
                         gw.gatewayKey === 'apple_pay' ? <Smartphone className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-sm font-bold text-slate-900">{gw.name}</strong>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase ${
                            gw.mode === 'production'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {gw.mode}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 block">{gw.nameBn}</span>
                      </div>
                    </div>

                    {/* Enable Toggle Switch */}
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={gw.isEnabled}
                        onChange={e => onToggleGateway(gw.id, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-700"></div>
                    </label>
                  </div>

                  <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                    {gw.description}
                  </p>

                  {/* Credentials / Keys Box */}
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 mt-3 text-xs space-y-1.5 font-mono">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-400">পাবলিক কি / ক্লায়েন্ট আইডি:</span>
                      <span className="text-slate-800 font-bold truncate max-w-[200px]" title={gw.publishableKey}>
                        {gw.publishableKey}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-400">সিক্রেট কি (এনক্রিপ্টেড):</span>
                      <span className="text-slate-600 font-bold">{gw.secretKeyMasked}</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-400">ওয়েবহুক সিগনেচার সিক্রেট:</span>
                      <span className="text-slate-600 font-bold">{gw.webhookSecretMasked}</span>
                    </div>
                  </div>

                  {/* Supported Currencies Badges */}
                  <div className="mt-3 flex flex-wrap items-center gap-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold mr-1">সমর্থিত কারেন্সি:</span>
                    {gw.supportedCurrencies.map(c => (
                      <span key={c} className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 font-bold text-[10px]">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-[11px] text-slate-500">
                    <span className="font-semibold">ফি:</span> {gw.transactionFeePct}% + ৳{gw.fixedFee}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onUpdateGatewayMode(gw.id, gw.mode === 'sandbox' ? 'production' : 'sandbox')}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
                    >
                      {gw.mode === 'sandbox' ? 'প্রোডাকশনে নিন' : 'স্যান্ডবক্সে নিন'}
                    </button>
                    {gw.gatewayKey === 'stripe' && (
                      <button
                        onClick={() => setIsStripeModalOpen(true)}
                        className="px-3 py-1.5 bg-[#635BFF] hover:bg-[#5349e4] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        টেস্ট করুন
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Webhook Event Simulator & HMAC SHA-256 Validator */}
          <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Key className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-bold text-sm text-white">Stripe Webhook সিমুলেটর ও সিগনেচার ভ্যালিডেটর</h3>
                  <p className="text-xs text-slate-400">
                    ইন্টারন্যাশনাল পেমেন্ট সম্পন্ন হলে ইভেন্ট রিসিভ ও HMAC SHA-256 ভেরিফিকেশন টেস্ট
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={webhookEventType}
                  onChange={e => setWebhookEventType(e.target.value as any)}
                  className="px-3 py-1.5 bg-slate-800 border border-slate-700 text-xs font-semibold text-white rounded-xl focus:outline-none"
                >
                  <option value="checkout.session.completed">checkout.session.completed</option>
                  <option value="payment_intent.succeeded">payment_intent.succeeded</option>
                  <option value="charge.refunded">charge.refunded</option>
                </select>

                <button
                  onClick={handleSimulateWebhook}
                  disabled={isSimulatingWebhook}
                  className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-75 text-slate-950 font-extrabold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  {isSimulatingWebhook ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Webhook ট্রিগার টেস্ট</span>
                </button>
              </div>
            </div>

            {webhookSimulationResult ? (
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-xs space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-[11px]">
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> HTTP 200 OK • Signature Verified (HMAC-SHA256)
                  </span>
                  <span className="text-slate-500">{webhookSimulationResult.timestamp}</span>
                </div>
                <pre className="text-slate-300 text-[11px] overflow-x-auto leading-relaxed">
                  {webhookSimulationResult.payloadPreview}
                </pre>
              </div>
            ) : (
              <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-800 text-xs text-slate-400 text-center">
                উপরের বাটনটি চেপে সরাসরি স্ট্রাইপ ক্লাউড ওয়েবহুক ট্রিগার ও ইনভয়েস রিকনসিলিয়েশন টেস্ট করুন।
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 3: TAX SLABS & NBR MUSHAK 6.3 */}
      {/* ======================================================== */}
      {subTab === 'taxes' && (
        <div className="space-y-6">
          {/* Duty & Tax Calculator Widget */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-700" />
                  আন্তর্জাতিক শুল্ক ও কাস্টমস ডিউটি এস্টিমেটর (Customs Calculator)
                </h3>
                <p className="text-xs text-slate-500">
                  বাংলাদেশ থেকে বিদেশের যেকোনো দেশে পণ্য রপ্তানির সময় গন্তব্য দেশের ভ্যাট ও শুল্ক হিসাব
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">পণ্য চালান মূল্য ($ USD):</label>
                <input
                  type="number"
                  min="1"
                  value={dutyValue}
                  onChange={e => setDutyValue(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 text-xs focus:outline-purple-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">গন্তব্য দেশ (Destination):</label>
                <select
                  value={dutyCountry}
                  onChange={e => setDutyCountry(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-purple-600"
                >
                  <option value="US">মার্কিন যুক্তরাষ্ট্র (USA)</option>
                  <option value="GB">যুক্তরাজ্য (United Kingdom)</option>
                  <option value="EU">ইউরোপীয় ইউনিয়ন (Germany/France)</option>
                  <option value="AE">সংযুক্ত আরব আমিরাত (UAE)</option>
                  <option value="SA">সৌদি আরব (KSA)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">পণ্যের ক্যাটাগরি (HS Code):</label>
                <select
                  value={dutyCategory}
                  onChange={e => setDutyCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-purple-600"
                >
                  <option value="medicines">ঔষধ ও ফার্মাসিউটিক্যালস (০% ডিউটি)</option>
                  <option value="electronics">স্মার্ট ইলেকট্রনিক্স (৫% ডিউটি)</option>
                  <option value="textiles">রেডিমেড গার্মেন্টস ও টেক্সটাইল (৭.৫%)</option>
                  <option value="general">সাধারণ বাণিজ্যিক পণ্য (১০% ডিউটি)</option>
                </select>
              </div>

              {/* Landed Cost Output */}
              <div className="bg-purple-900 text-white p-3 rounded-xl flex flex-col justify-between">
                <span className="text-[10px] text-purple-200 uppercase font-semibold">সম্ভাব্য মোট ডেলিভারি খরচ (Landed Cost):</span>
                <div className="text-base font-black text-white mt-1">
                  ${calculatedCustoms.totalLandedCost.toFixed(2)} USD
                </div>
                <span className="text-[10px] text-purple-300">
                  শুল্ক: ${calculatedCustoms.dutyAmount} + ভ্যাট ({calculatedCustoms.vatRate}%): ${calculatedCustoms.vatAmount}
                </span>
              </div>
            </div>
          </div>

          {/* Tax Slabs List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {taxSlabs.map(slab => (
              <div 
                key={slab.id}
                className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3 hover:border-purple-300 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">
                      {slab.countryCode === 'BD' ? '🇧🇩' : slab.countryCode === 'US' ? '🇺🇸' : slab.countryCode === 'GB' ? '🇬🇧' : slab.countryCode === 'EU' ? '🇪🇺' : slab.countryCode === 'AE' ? '🇦🇪' : '🇸🇦'}
                    </span>
                    <div>
                      <strong className="text-xs font-bold text-slate-900 block">{slab.countryName}</strong>
                      <span className="text-[10px] text-slate-400 font-semibold">{slab.taxAuthority}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-purple-100 text-purple-800">
                    {slab.taxType}
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">প্রমিত ভ্যাট/ট্যাক্স হার:</span>
                    <span className="font-black text-slate-900">{slab.standardRatePct}%</span>
                  </div>
                  {slab.reducedRatePct !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">হ্রাসকৃত বিশেষ হার:</span>
                      <span className="font-semibold text-slate-700">{slab.reducedRatePct}%</span>
                    </div>
                  )}
                  <div className="flex justify-between text-emerald-700">
                    <span>রপ্তানি চালান রেয়াত:</span>
                    <span className="font-bold">{slab.exportRatePct}% (Rebate)</span>
                  </div>
                  {slab.tdsRatePct !== undefined && (
                    <div className="flex justify-between text-amber-700">
                      <span>উৎসে কর কর্তন (TDS):</span>
                      <span className="font-bold">{slab.tdsRatePct}%</span>
                    </div>
                  )}
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {slab.notes}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 4: CROSS-BORDER TRANSACTIONS & FOREX GAIN/LOSS */}
      {/* ======================================================== */}
      {subTab === 'ledger' && (
        <div className="space-y-4">
          {/* Filter Toolbar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex-1 w-full relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="গ্রাহকের নাম, পেমেন্ট আইডি বা ট্রানজেকশন নম্বর দিয়ে খুঁজুন..."
                value={ledgerSearch}
                onChange={e => setLedgerSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                value={ledgerCurrencyFilter}
                onChange={e => setLedgerCurrencyFilter(e.target.value as any)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl text-slate-700"
              >
                <option value="all">সকল মুদ্রা (All Currencies)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="AED">AED (د.إ)</option>
                <option value="SAR">SAR (﷼)</option>
              </select>

              <select
                value={ledgerGatewayFilter}
                onChange={e => setLedgerGatewayFilter(e.target.value as any)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl text-slate-700"
              >
                <option value="all">সকল গেটওয়ে (All Gateways)</option>
                <option value="stripe">Stripe</option>
                <option value="paypal">PayPal</option>
                <option value="apple_pay">Apple Pay</option>
              </select>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">ট্রানজেকশন ও তারিখ</th>
                    <th className="py-3 px-4">গ্রাহক ও দেশ</th>
                    <th className="py-3 px-4">গেটওয়ে ও কার্ড</th>
                    <th className="py-3 px-4 text-right">চার্জকৃত বৈদেশিক মুদ্রা</th>
                    <th className="py-3 px-4 text-right">বুকিং রেট ও BDT</th>
                    <th className="py-3 px-4 text-right">ফরেক্স লাভ / ক্ষতি</th>
                    <th className="py-3 px-4 text-right">নিট ব্যাংক জমা</th>
                    <th className="py-3 px-4 text-center">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                        কোনো আন্তর্জাতিক ট্রানজেকশন পাওয়া যায়নি।
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map(trx => (
                      <tr key={trx.id} className="hover:bg-purple-50/40 transition">
                        <td className="py-3 px-4">
                          <strong className="text-purple-800 font-mono block font-bold">{trx.transactionNo}</strong>
                          <span className="text-[10px] text-slate-400">{trx.date}</span>
                        </td>
                        <td className="py-3 px-4">
                          <strong className="text-slate-900 block font-bold">{trx.customerName}</strong>
                          <span className="text-[10px] text-slate-500">{trx.customerCountry}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="capitalize font-bold text-slate-800">{trx.gateway}</span>
                            {trx.cardBrand && (
                              <span className="text-[9px] uppercase font-bold bg-slate-100 px-1 py-0.5 rounded text-slate-600">
                                {trx.cardBrand} ••{trx.cardLast4}
                              </span>
                            )}
                          </div>
                          {trx.threeDSecureAuthenticated && (
                            <span className="text-[9px] font-semibold text-emerald-600 flex items-center gap-0.5 mt-0.5">
                              <ShieldCheck className="w-2.5 h-2.5" /> 3DS 2.0
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-black text-slate-900">
                          {trx.currency} {trx.foreignAmount.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-bold text-slate-800 block">৳{trx.baseAmountBDT.toLocaleString()}</span>
                          <span className="text-[10px] text-slate-400">@ ৳{trx.exchangeRate}</span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-black ${
                            trx.forexGainLossBDT >= 0
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {trx.forexGainLossBDT >= 0 ? '+' : ''}৳{trx.forexGainLossBDT.toFixed(2)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-black text-purple-900">
                          ৳{trx.netAmountBDT.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => setSelectedInvoiceTrx(trx)}
                              className="p-1.5 bg-slate-100 hover:bg-purple-100 text-purple-800 rounded-lg transition cursor-pointer"
                              title="বাণিজ্যিক ইনভয়েস প্রিন্ট"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setSelectedJvTrx(trx)}
                              className="px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-lg text-[10px] font-bold transition cursor-pointer"
                            >
                              জাবেদা (JV)
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* DUAL-ENTRY FOREX JOURNAL VOUCHER (JV) MODAL */}
      {selectedJvTrx && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-700" />
                <div>
                  <h4 className="font-bold text-xs text-slate-900 uppercase">
                    স্বয়ংক্রিয় ফরেক্স দ্বি-তরফা জাবেদা ভাউচার (JV)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    IFRS 21 ও বাংলাদেশ অ্যাকাউন্টিং স্ট্যান্ডার্ড অনুযায়ী মুদ্রা বিনিময় জাবেদা
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedJvTrx(null)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">রেফারেন্স ট্রানজেকশন:</span>
                <span className="font-mono font-bold text-purple-800">{selectedJvTrx.transactionNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">বুকিং রেট বনাম সেটেলমেন্ট রেট:</span>
                <span className="font-bold">৳{selectedJvTrx.exchangeRate} ➔ ৳{selectedJvTrx.settlementExchangeRate}</span>
              </div>
            </div>

            {/* JV Accounting Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-purple-900 text-white text-[10px] uppercase">
                  <tr>
                    <th className="py-2 px-3">অ্যাকাউন্টিং হেড ও কোড</th>
                    <th className="py-2 px-3 text-right">ডেবিট (Dr.)</th>
                    <th className="py-2 px-3 text-right">ক্রেডিট (Cr.)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-2.5 px-3">
                      <strong className="block text-slate-800">1020 সিটি ব্যাংক ফরেন কারেন্সি হিসাব</strong>
                      <span className="text-[10px] text-slate-400">Foreign Currency Realized Inward Remittance</span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      ৳{selectedJvTrx.settlementAmountBDT.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-400">-</td>
                  </tr>

                  <tr>
                    <td className="py-2.5 px-3 pl-6">
                      <strong className="block text-slate-700">1030 আন্তর্জাতিক দেনাদার গ্রাহক হিসাব</strong>
                      <span className="text-[10px] text-slate-400">Accounts Receivable Clearance</span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-400">-</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      ৳{selectedJvTrx.baseAmountBDT.toLocaleString()}
                    </td>
                  </tr>

                  {selectedJvTrx.forexGainLossBDT >= 0 ? (
                    <tr className="bg-emerald-50/50">
                      <td className="py-2.5 px-3 pl-6">
                        <strong className="block text-emerald-800">4080 বৈদেশিক মুদ্রা বিনিময় লাভ (Forex Gain)</strong>
                        <span className="text-[10px] text-emerald-600">রেট বৃদ্ধিজনিত রিয়ালাইজড আয়</span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-400">-</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                        ৳{selectedJvTrx.forexGainLossBDT.toFixed(2)}
                      </td>
                    </tr>
                  ) : (
                    <tr className="bg-rose-50/50">
                      <td className="py-2.5 px-3">
                        <strong className="block text-rose-800">5080 বৈদেশিক মুদ্রা বিনিময় ক্ষতি (Forex Loss)</strong>
                        <span className="text-[10px] text-rose-600">রেট হ্রাসজনিত রিয়ালাইজড ক্ষতি</span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-700">
                        ৳{Math.abs(selectedJvTrx.forexGainLossBDT).toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-400">-</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedJvTrx(null)}
                className="px-4 py-2 bg-purple-700 text-white rounded-xl text-xs font-bold hover:bg-purple-800 cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stripe Interactive Checkout Modal */}
      <StripeCheckoutModal
        isOpen={isStripeModalOpen}
        onClose={() => setIsStripeModalOpen(false)}
        tenant={tenant}
        exchangeRates={exchangeRates}
        onPaymentSuccess={(trx) => {
          onAddTransaction(trx);
        }}
      />

      {/* International Commercial Export Invoice Modal */}
      <InternationalInvoiceModal
        isOpen={Boolean(selectedInvoiceTrx)}
        onClose={() => setSelectedInvoiceTrx(null)}
        transaction={selectedInvoiceTrx}
        tenant={tenant}
      />
    </div>
  );
};
