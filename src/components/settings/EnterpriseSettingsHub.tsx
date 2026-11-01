import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, Store, MessageSquare, Printer, Shield, 
  HelpCircle, CreditCard, Globe, CheckCircle2, Save, RefreshCw, 
  Search, ExternalLink, Sliders, Smartphone, AlertTriangle, Eye,
  Lock, Award, FileText, Check, Cpu, Zap, BellRing, Sparkles,
  Barcode, Layers, Box, ArrowRight, BookOpen, Video, HelpCircle as QuestionIcon,
  Database
} from 'lucide-react';
import { Tenant } from '../../types';

export interface EnterpriseSettingsHubProps {
  tenant: Tenant;
  initialTab?: 'general' | 'sms' | 'pos_policy' | 'receipt_designer' | 'modules' | 'knowledge_base' | 'subscriptions' | 'languages';
  onUpdateStoreSettings?: (updatedSettings: Partial<Tenant>) => void;
  onOpenSuperAdmin?: () => void;
  onOpenLicenseModal?: () => void;
  onOpenDataResetManager?: () => void;
}

export const EnterpriseSettingsHub: React.FC<EnterpriseSettingsHubProps> = ({
  tenant,
  initialTab = 'general',
  onUpdateStoreSettings,
  onOpenSuperAdmin,
  onOpenLicenseModal,
  onOpenDataResetManager,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'general' | 'sms' | 'pos_policy' | 'receipt_designer' | 'modules' | 'knowledge_base' | 'subscriptions' | 'languages'
  >(initialTab);

  React.useEffect(() => {
    if (initialTab) {
      setActiveSubTab(initialTab);
    }
  }, [initialTab]);

  // General Store State
  const [storeName, setStoreName] = useState(tenant.name || '');
  const [ownerName, setOwnerName] = useState(tenant.ownerName || '');
  const [phone, setPhone] = useState(tenant.phone || '');
  const [email, setEmail] = useState(tenant.email || '');
  const [address, setAddress] = useState(tenant.address || '');
  const [currency, setCurrency] = useState(tenant.currency || '৳');
  const [taxVatNo, setTaxVatNo] = useState(tenant.taxVatNo || 'BIN-992019481-2026');
  const [tradeLicense, setTradeLicense] = useState('TL-DHK-2026-90412');
  const [tagline, setTagline] = useState('পাইকারি ও খুচরা বিক্রয় কেন্দ্র • বিশ্বস্ত প্রতিষ্ঠান');

  // SMS Gateway State
  const [smsProvider, setSmsProvider] = useState<'greenweb' | 'mimsms' | 'twilio' | 'onnorokom'>('greenweb');
  const [smsApiKey, setSmsApiKey] = useState('gw_live_901928301923849102');
  const [smsSenderId, setSmsSenderId] = useState(tenant.name.slice(0, 11).replace(/[^a-zA-Z0-9]/g, '') || 'JHSOFT');
  const [notifyOnSale, setNotifyOnSale] = useState(true);
  const [notifyOnDuePayment, setNotifyOnDuePayment] = useState(true);
  const [notifyOnOrder, setNotifyOnOrder] = useState(true);
  const [smsBalance, setSmsBalance] = useState(482);
  const [testPhone, setTestPhone] = useState('');
  const [smsSentStatus, setSmsSentStatus] = useState<string | null>(null);

  // POS Policy State
  const [maxDiscountPercent, setMaxDiscountPercent] = useState('15');
  const [allowWalkInDue, setAllowWalkInDue] = useState(false);
  const [preventNegativeStock, setPreventNegativeStock] = useState(true);
  const [autoPrintReceipt, setAutoPrintReceipt] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [holdCartLimit, setHoldCartLimit] = useState('5');

  // Thermal Receipt State
  const [paperWidth, setPaperWidth] = useState<'80mm' | '58mm'>('80mm');
  const [receiptHeader, setReceiptHeader] = useState('বিসমিল্লাহির রাহমানির রাহিম');
  const [receiptFooter, setReceiptFooter] = useState('আমাদের সেবা গ্রহণের জন্য ধন্যবাদ! আবার আসবেন।');
  const [showTaxId, setShowTaxId] = useState(true);
  const [showCashierName, setShowCashierName] = useState(true);
  const [showQrCode, setShowQrCode] = useState(true);
  const [qrType, setQrType] = useState<'invoice_verify' | 'bkash_pay'>('bkash_pay');

  // Module Features State
  const [features, setFeatures] = useState<Tenant['features']>(tenant.features || {
    pos: true,
    ecommerce: true,
    crm: true,
    hrm: true,
    accounting: true,
    ai: true,
    multiWarehouse: true,
    globalCommerce: true,
    whatsappLoyalty: true,
    hardwareSuite: true,
    commissions: true,
    serviceMaintenance: true,
    assets: true,
    projects: true,
    peoplePortal: true,
    analytics3d: true,
  });

  // Language & Locale State
  const [localeLang, setLocaleLang] = useState<'bn' | 'en' | 'ar'>('bn');
  const [dateFormat, setDateFormat] = useState<'YYYY-MM-DD' | 'DD/MM/YYYY' | 'MM/DD/YYYY'>('YYYY-MM-DD');

  // Knowledge Base Search
  const [kbSearch, setKbSearch] = useState('');
  const [selectedKbArticle, setSelectedKbArticle] = useState<string | null>(null);

  // Notification Toast
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  const handleSaveAll = () => {
    const updated: Partial<Tenant> = {
      name: storeName,
      ownerName: ownerName,
      phone: phone,
      email: email,
      address: address,
      currency: currency,
      taxVatNo: taxVatNo,
      features: features,
    };
    onUpdateStoreSettings?.(updated);
    setSaveSuccessMessage('সেটিংস সফলভাবে ডেটাবেজে সংরক্ষিত ও কার্যকর হয়েছে!');
    setTimeout(() => setSaveSuccessMessage(null), 3500);
  };

  const handleTestSms = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPhone) return;
    setSmsSentStatus('পাঠানো হচ্ছে...');
    setTimeout(() => {
      setSmsBalance(prev => Math.max(0, prev - 1));
      setSmsSentStatus(`সফলভাবে ${testPhone} নাম্বারে টেস্ট এসএমএস ডেলিভার হয়েছে! (ব্যালেন্স: ${smsBalance - 1})`);
      setTimeout(() => setSmsSentStatus(null), 4000);
    }, 900);
  };

  const handleToggleFeature = (key: keyof Tenant['features']) => {
    setFeatures(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const kbArticles = [
    {
      id: 'kb-1',
      category: 'POS & বিলিং',
      title: 'দ্রুত কাউন্টার বিক্রয় ও বারকোড স্ক্যানার দিয়ে ক্যাশ মেমো তৈরি',
      summary: 'কিভাবে বারকোড গান ব্যবহার করে মুহূর্তেই আইটেম কার্ট এ যোগ করবেন এবং ভ্যাট/ডিসকাউন্ট সহ বিল করবেন।',
      content: `১. POS ট্যাবে গিয়ে বারকোড রিডার দিয়ে পণ্যের গায়ে থাকা বারকোড স্ক্যান করুন।\n২. অটোমেটিকভাবে আইটেম কার্টে যুক্ত হবে। প্রয়োজনে F2 চেপে কাস্টমার সিলেক্ট করুন।\n৩. ডিসকাউন্ট শতকরা বা ফিক্সড হিসেবে প্রদান করুন (ক্যাশিয়ার লিমিটের বেশি ডিসকাউন্ট প্রযোজ্য হবে না)।\n৪. 'পেমেন্ট গ্রহণ ও প্রিন্ট' বাটনে ক্লিক করলে ক্যাশ ড্রয়ার খুলে যাবে এবং ৮০মিমি থার্মাল রিসিট প্রিন্ট হবে।`,
    },
    {
      id: 'kb-2',
      category: 'অ্যাকাউন্টিং',
      title: 'ডাবল এন্ট্রি সাধারণ জাবেদা ও ব্যাংক রিকনসিলিয়েশন গাইড',
      summary: 'ডেবিট-ক্রেডিট নীতি অনুযায়ী ব্যালেন্স শিট এবং ব্যাংক স্টেটমেন্টের সাথে সফটওয়্যারের হিসাব মেলানো।',
      content: `১. অ্যাকাউন্টিং ট্যাবে চার্ট অফ অ্যাকাউন্টস (COA) থেকে হিসাবের খাত সিলেক্ট করুন।\n২. জাবেদা এন্ট্রিতে প্রতিটি ট্রানজেকশনের ডেবিট এবং ক্রেডিট সমান হতে হবে।\n৩. ব্যাংক স্টেটমেন্ট আমদানি করে ক্লিয়ারেন্স তারিখ ও রেফারেন্স মিলিয়ে রিকনসাইল বাটন চাপুন।`,
    },
    {
      id: 'kb-3',
      category: 'রিটার্ন ও অডিট',
      title: 'কাস্টমার সেলস রিটার্ন ও মহাজন পারচেজ ডেবিট নোট ম্যানেজমেন্ট',
      summary: 'ত্রুটিপূর্ণ মাল ফেরত নেওয়া, ইনভেন্টরি রি-স্টক এবং ক্রেতার বাকি থেকে অ্যাডজাস্টমেন্ট।',
      content: `১. রিটার্নস ট্যাবে গিয়ে 'নতুন সেলস রিটার্ন' ক্লিক করুন এবং ইনভয়েস নাম্বার দিন।\n২. ফেরত আসা পণ্যের পরিমাণ ও ভালো/ত্রুটিপূর্ণ অবস্থা নির্বাচন করুন।\n৩. ক্রেতাকে ক্যাশ ফেরত দেওয়া হবে নাকি কাস্টমার লেজারে ব্যালেন্স ক্রেডিট হবে তা টিক দিন।`,
    },
    {
      id: 'kb-4',
      category: 'হার্ডওয়্যার',
      title: 'Sunmi / iMin স্মার্ট POS ডিভাইস ও ব্লুটুথ থার্মাল প্রিন্টার পেয়ারিং',
      summary: 'USB, Bluetooth এবং Network ESC/POS থার্মাল রিসিট প্রিন্টার সংযোগ স্থাপন নির্দেশিকা।',
      content: `১. হার্ডওয়্যার ট্যাবে গিয়ে আপনার প্রিন্টারের ধরণ নির্বাচন করুন (Bluetooth / USB / Network IP)।\n২. টেস্ট রিসিট প্রিন্ট দিয়ে পেপারের সাইজ (80mm vs 58mm) চেক করুন।\n৩. ক্যাশ ড্রয়ার কিক পালস (Drawer Kick Pin 2/5) কনফিগার করে স্বয়ংক্রিয় ওপেনিং টেস্ট করুন।`,
    },
    {
      id: 'kb-5',
      category: 'ক্লাউড ইন্টিগ্রেশন',
      title: 'QuickBooks Online ও WooCommerce দুইমুখী সিঙ্ক কনফিগারেশন',
      summary: 'ই-কমার্স সাইট এবং আন্তর্জাতিক অ্যাকাউন্টিং সফটওয়্যারের সাথে অটোমেটিক সিঙ্ক।',
      content: `১. ইন্টিগ্রেশন ট্যাবে গিয়ে WooCommerce Consumer Key & Secret ইনপুট করুন।\n২. সেলস অর্ডারে অটো সিঙ্ক অন করলে যেকোনো ওয়েবসাইট অর্ডারে সাথে সাথে লোকাল ওয়্যারহাউসের স্টক হ্রাস পাবে।\n৩. QuickBooks OAuth টোকেন দিয়ে চার্ট অফ অ্যাকাউন্টস ম্যাপিং সম্পন্ন করুন।`,
    },
    {
      id: 'kb-6',
      category: 'ক্লায়েন্ট পোর্টাল',
      title: 'B2B কাস্টমারদের জন্য সেলফ-সার্ভিস পোর্টাল ও ইনভাইট কোড সিস্টেম',
      summary: 'বড় পাইকারি ক্লায়েন্টদের নিজস্ব লগইন আইডি দিয়ে বাকি খাতা ও চালান দেখা এবং পেমেন্ট রিকোয়েস্ট।',
      content: `১. People ট্যাবে গিয়ে ক্লায়েন্টের মোবাইল নাম্বারে ইনভাইট কোড তৈরি করে SMS পাঠান।\n২. ক্লায়েন্ট ওয়েবসাইটে পোর্টাল লগইন করে তার বিগত সকল ইনভয়েস, পেমেন্ট রিসিট ও বর্তমান বাকি ব্যালেন্স লাইভ দেখতে পারবেন।`,
    },
  ];

  const filteredArticles = kbArticles.filter(a => 
    a.title.toLowerCase().includes(kbSearch.toLowerCase()) ||
    a.category.toLowerCase().includes(kbSearch.toLowerCase()) ||
    a.summary.toLowerCase().includes(kbSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-100 text-purple-700">
              <SettingsIcon className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                এন্টারপ্রাইজ সিস্টেম সেটিংস ও কনফিগারেশন হাব
              </h1>
              <p className="text-xs text-slate-500">
                স্টোর প্রোফাইল, এসএমএস গেটওয়ে, পিওএস নীতি, রিসিট প্রিন্টার, নলেজ বেস ও মডিউল নিয়ন্ত্রণ
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {saveSuccessMessage && (
            <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {saveSuccessMessage}
            </span>
          )}
          <button
            onClick={handleSaveAll}
            className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-black transition flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Save className="w-4 h-4" /> সেটিংস সংরক্ষণ করুন
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 gap-1 overflow-x-auto text-xs pb-0.5 bg-white p-2 rounded-2xl border">
        {[
          { id: 'general', label: 'স্টোর প্রোফাইল ও সাধারণ', icon: Store },
          { id: 'sms', label: 'এসএমএস গেটওয়ে ও অ্যালার্ট', icon: MessageSquare },
          { id: 'pos_policy', label: 'পিওএস ও ক্যাশিয়ার কন্ট্রোল', icon: Sliders },
          { id: 'receipt_designer', label: 'থার্মাল রিসিট ডিজাইনার', icon: Printer },
          { id: 'modules', label: 'মডিউল ফ্লিট কন্ট্রোল', icon: Layers },
          { id: 'knowledge_base', label: 'ইউজার ম্যানুয়াল ও গাইড', icon: BookOpen },
          { id: 'subscriptions', label: 'সাবস্ক্রিপশন প্রোডাক্ট', icon: CreditCard },
          { id: 'languages', label: 'ভাষা ও লোকাল ফরম্যাট', icon: Globe },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-3.5 py-2.5 font-bold transition flex items-center gap-2 whitespace-nowrap rounded-xl cursor-pointer ${
                isActive
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================
          TAB 1: GENERAL & STORE PROFILE
      ======================================================== */}
      {activeSubTab === 'general' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-5">
            <h3 className="font-extrabold text-sm text-slate-900 border-b pb-3 flex items-center gap-2">
              <Store className="w-4 h-4 text-purple-700" />
              ব্যবসা প্রতিষ্ঠান ও আউটলেট প্রোফাইল
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">দোকান / প্রতিষ্ঠানের নাম: *</label>
                <input
                  type="text"
                  value={storeName}
                  onChange={e => setStoreName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">স্বত্বাধিকারী / মালিকের নাম: *</label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={e => setOwnerName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">অফিসিয়াল মোবাইল / হেল্পলাইন: *</label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">অফিসিয়াল ইমেইল:</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">প্রতিষ্ঠানের পূর্ণ ঠিকানা (রিসিটে প্রদর্শিত হবে): *</label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">মুদ্রা প্রতীক (Currency): *</label>
                <select
                  value={currency}
                  onChange={e => setCurrency(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:ring-2 focus:ring-purple-600"
                >
                  <option value="৳">৳ BDT (বাংলাদেশি টাকা)</option>
                  <option value="$">$ USD (United States Dollar)</option>
                  <option value="€">€ EUR (Euro)</option>
                  <option value="₹">₹ INR (Indian Rupee)</option>
                  <option value="﷼">﷼ SAR (Saudi Riyal)</option>
                  <option value="د.إ">د.إ AED (UAE Dirham)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ট্যাগলাইন / স্লোগান:</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={e => setTagline(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ভ্যাট / ট্যাক্স রেজিস্ট্রেশন নম্বর (BIN):</label>
                <input
                  type="text"
                  value={taxVatNo}
                  onChange={e => setTaxVatNo(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ট্রেড লাইসেন্স নম্বর:</label>
                <input
                  type="text"
                  value={tradeLicense}
                  onChange={e => setTradeLicense(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:ring-2 focus:ring-purple-600"
                />
              </div>
            </div>
          </div>

          {/* Quick Business Card Preview */}
          <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-3xl p-6 text-white shadow-md flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider">
                  ডিজিটাল বিজনেস পরিচিতি
                </span>
                <span className="text-xs text-purple-200 capitalize">{tenant.plan} Plan</span>
              </div>

              <div>
                <div className="w-12 h-12 rounded-2xl bg-white text-purple-900 flex items-center justify-center font-black text-xl shadow-md mb-3">
                  {storeName.charAt(0) || 'J'}
                </div>
                <h4 className="font-extrabold text-lg text-white leading-tight">{storeName}</h4>
                <p className="text-xs text-purple-200 mt-0.5">{tagline}</p>
              </div>

              <div className="space-y-1.5 text-xs text-purple-100 border-t border-white/10 pt-3">
                <div className="flex justify-between">
                  <span className="text-purple-300">স্বত্বাধিকারী:</span>
                  <span className="font-semibold">{ownerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-300">মোবাইল:</span>
                  <span className="font-mono">{phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-300">ভ্যাট BIN:</span>
                  <span className="font-mono">{taxVatNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-300">ঠিকানা:</span>
                  <span className="truncate max-w-[170px]">{address}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 mt-4 flex items-center justify-between">
              <span className="text-[11px] text-emerald-300 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> ভেরিফাইড প্রতিষ্ঠান
              </span>
              <button
                onClick={handleSaveAll}
                className="px-3.5 py-1.5 bg-white text-purple-900 rounded-xl text-xs font-black hover:bg-purple-50 transition"
              >
                আপডেট করুন
              </button>
            </div>
          </div>

          {/* Persistent Data Lifecycle & Clean Production Reset Hub */}
          <div className="lg:col-span-3 bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 rounded-3xl p-6 text-white shadow-lg border border-purple-800/40 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-600/30 border border-purple-400/30 flex items-center justify-center text-purple-300 shrink-0">
                <Database className="w-6 h-6 text-purple-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-base text-white">স্টোর ডেটা ম্যানেজমেন্ট ও প্রোডাকশন রিসেট</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Auto-Persistent
                  </span>
                </div>
                <p className="text-xs text-purple-200 mt-1 max-w-2xl leading-relaxed">
                  পরীক্ষামূলক ডামি ডেটা এক ক্লিকে মুছে ১০০% ক্লিন প্রোডাকশন মোডে রূপান্তর করুন, শুধু সেলস ইনভয়েস রিসেট করুন অথবা সম্পূর্ণ আসল ডেটার ব্যাকআপ ডাউনলোড ও রিস্টোর করুন।
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
              <button
                type="button"
                onClick={onOpenDataResetManager}
                className="w-full md:w-auto px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-2xl font-bold text-xs shadow-md shadow-purple-900/40 flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.02]"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>ডেটা রিসেট ও ব্যাকআপ কনসোল</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 2: SMS GATEWAY CONFIGURATION & ALERTS
      ======================================================== */}
      {activeSubTab === 'sms' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-purple-700" />
                এসএমএস গেটওয়ে API ও অটো-মেসেজ ট্রিগার
              </h3>
              <span className="px-2.5 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-bold font-mono">
                অবশিষ্ট ক্রেডিট: {smsBalance} টি
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">এসএমএস প্রোভাইডার নির্বাচন: *</label>
                <select
                  value={smsProvider}
                  onChange={e => setSmsProvider(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:ring-2 focus:ring-purple-600"
                >
                  <option value="greenweb">Greenweb Bangladesh (Masking/Non-masking)</option>
                  <option value="mimsms">MimSMS Enterprise Gateway</option>
                  <option value="onnorokom">Onnorokom SMS Web API</option>
                  <option value="twilio">Twilio Global Programmable SMS</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">সেন্ডার আইডি (Sender Masking ID): *</label>
                <input
                  type="text"
                  value={smsSenderId}
                  onChange={e => setSmsSenderId(e.target.value)}
                  maxLength={11}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase focus:bg-white focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">API Secret Token / Key: *</label>
                <input
                  type="password"
                  value={smsApiKey}
                  onChange={e => setSmsApiKey(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:ring-2 focus:ring-purple-600"
                />
              </div>
            </div>

            {/* Automatic Triggers */}
            <div className="border-t pt-4 space-y-3">
              <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
                স্বয়ংক্রিয় এসএমএস প্রেরণের নিয়ম (Event Triggers)
              </h4>

              <div className="space-y-2 text-xs">
                <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-purple-50/40 border border-slate-200 cursor-pointer transition">
                  <div className="flex items-center gap-3">
                    <Zap className="w-4 h-4 text-purple-700" />
                    <div>
                      <span className="font-bold text-slate-900 block">POS সেলস রিসিট এসএমএস</span>
                      <span className="text-slate-500 text-[11px]">কাউন্টারে বিক্রয় সম্পন্ন হলে ক্রেতার মোবাইলে ধন্যবাদ ও ইনভয়েস সামারি যাবে</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifyOnSale}
                    onChange={e => setNotifyOnSale(e.target.checked)}
                    className="w-4 h-4 text-purple-700 rounded-md focus:ring-purple-600"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-purple-50/40 border border-slate-200 cursor-pointer transition">
                  <div className="flex items-center gap-3">
                    <BellRing className="w-4 h-4 text-amber-600" />
                    <div>
                      <span className="font-bold text-slate-900 block">বাকি টাকা পরিশোধের রিমাইন্ডার ও মানি রিসিট</span>
                      <span className="text-slate-500 text-[11px]">বকেয়া আদায়ের সময় ক্রেতাকে ডিজিটাল মানি রিসিট মেসেজ পাঠানো</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifyOnDuePayment}
                    onChange={e => setNotifyOnDuePayment(e.target.checked)}
                    className="w-4 h-4 text-purple-700 rounded-md focus:ring-purple-600"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-purple-50/40 border border-slate-200 cursor-pointer transition">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-4 h-4 text-blue-600" />
                    <div>
                      <span className="font-bold text-slate-900 block">অনলাইন অর্ডারের ট্র্যাকিং কনফার্মেশন</span>
                      <span className="text-slate-500 text-[11px]">ই-কমার্স স্টোরফ্রন্টে নতুন অর্ডার আসলে বা পার্সেল ডিসপ্যাচ হলে এসএমএস যাবে</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifyOnOrder}
                    onChange={e => setNotifyOnOrder(e.target.checked)}
                    className="w-4 h-4 text-purple-700 rounded-md focus:ring-purple-600"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Live SMS Simulator & Tester */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 border-b pb-3 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-purple-700" />
              লাইভ টেস্ট এসএমএস সেন্ডার
            </h3>

            <form onSubmit={handleTestSms} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">টেস্ট মোবাইল নম্বর:</label>
                <input
                  type="text"
                  placeholder="017XXXXXXXX"
                  value={testPhone}
                  onChange={e => setTestPhone(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:ring-2 focus:ring-purple-600"
                />
              </div>

              {/* Sample SMS Preview Bubble */}
              <div className="p-3.5 bg-purple-50 rounded-2xl border border-purple-200 text-purple-900 text-[11px] leading-relaxed">
                <span className="font-bold block mb-1 text-purple-950">মেসেজ প্রিভিউ:</span>
                "প্রিয় গ্রাহক, {storeName} এ কেনাকাটা করার জন্য ধন্যবাদ। আপনার ইনভয়েস #JH-9021 মোট: ৳১২৫০ পরিশোধিত। হেল্পলাইন: {phone}"
              </div>

              {smsSentStatus && (
                <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{smsSentStatus}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={!testPhone}
                className="w-full py-2.5 bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-sm"
              >
                <Zap className="w-4 h-4" /> টেস্ট এসএমএস পাঠান
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 3: POS & CASHIER POLICY
      ======================================================== */}
      {activeSubTab === 'pos_policy' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-6 max-w-4xl">
          <h3 className="font-extrabold text-sm text-slate-900 border-b pb-3 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-purple-700" />
            পিওএস ও ক্যাশিয়ার কন্ট্রোল পলিসি (Cashier Policy & Fraud Prevention)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <label className="font-bold text-slate-800 block">ক্যাশিয়ারের সর্বোচ্চ ছাড় দেওয়ার সীমা (Max Discount %):</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={maxDiscountPercent}
                  onChange={e => setMaxDiscountPercent(e.target.value)}
                  className="w-24 p-2 bg-white border border-slate-300 rounded-xl font-bold text-center"
                />
                <span className="font-bold text-slate-600">% পর্যন্ত</span>
              </div>
              <p className="text-[11px] text-slate-500">
                এর বেশি ডিসকাউন্ট দিতে হলে সুপার অ্যাডমিন বা ম্যানেজারের স্পেশাল পিন ভেরিফিকেশন লাগবে।
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <label className="font-bold text-slate-800 block">হোল্ড কার্ট (Hold Cart) সর্বাধিক ধারণক্ষমতা:</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={holdCartLimit}
                  onChange={e => setHoldCartLimit(e.target.value)}
                  className="w-24 p-2 bg-white border border-slate-300 rounded-xl font-bold text-center"
                />
                <span className="font-bold text-slate-600">টি স্লট</span>
              </div>
              <p className="text-[11px] text-slate-500">
                গ্রাহক কোনো কারণে অপেক্ষা করলে সর্বোচ্চ কতটি ইনভয়েস সাময়িক হোল্ড রাখা যাবে।
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs border-t pt-4">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">নিরাপত্তা ও অপারেশনাল ফ্ল্যাগস</h4>

            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 cursor-pointer transition">
              <div>
                <span className="font-bold text-slate-900 block">স্টক শূন্য হলে বিক্রয় প্রতিরোধ (Prevent Negative Stock)</span>
                <span className="text-slate-500 text-[11px]">ইনভেন্টরিতে পণ্য পর্যাপ্ত না থাকলে ক্যাশিয়ার পণ্য সেল করতে পারবে না</span>
              </div>
              <input
                type="checkbox"
                checked={preventNegativeStock}
                onChange={e => setPreventNegativeStock(e.target.checked)}
                className="w-4 h-4 text-purple-700 rounded-md focus:ring-purple-600"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 cursor-pointer transition">
              <div>
                <span className="font-bold text-slate-900 block">খুচরা / অজ্ঞাত ক্রেতার কাছে বাকি বিক্রয় অনুমোদন (Walk-in Due)</span>
                <span className="text-slate-500 text-[11px]">নাম ও ফোন নাম্বার ছাড়া অজ্ঞাত ক্রেতার কাছে বকেয়ায় পণ্য বিক্রি নিষিদ্ধ করা শ্রেয়</span>
              </div>
              <input
                type="checkbox"
                checked={allowWalkInDue}
                onChange={e => setAllowWalkInDue(e.target.checked)}
                className="w-4 h-4 text-purple-700 rounded-md focus:ring-purple-600"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 cursor-pointer transition">
              <div>
                <span className="font-bold text-slate-900 block">পেমেন্ট নিশ্চিতের সাথে সাথে স্বয়ংক্রিয় রিসিট প্রিন্ট</span>
                <span className="text-slate-500 text-[11px]">প্রিন্ট ডায়ালগ ছাড়াই সরাসরি ডিফল্ট থার্মাল প্রিন্টারে পাঠানো হবে</span>
              </div>
              <input
                type="checkbox"
                checked={autoPrintReceipt}
                onChange={e => setAutoPrintReceipt(e.target.checked)}
                className="w-4 h-4 text-purple-700 rounded-md focus:ring-purple-600"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 cursor-pointer transition">
              <div>
                <span className="font-bold text-slate-900 block">বারকোড স্ক্যান ও পেমেন্ট বিপিং সাউন্ড ইফেক্ট</span>
                <span className="text-slate-500 text-[11px]">পণ্য স্ক্যান ও সফল ট্রানজেকশনে অডিও নিশ্চিতকরণ বীপ বাজবে</span>
              </div>
              <input
                type="checkbox"
                checked={soundEffects}
                onChange={e => setSoundEffects(e.target.checked)}
                className="w-4 h-4 text-purple-700 rounded-md focus:ring-purple-600"
              />
            </label>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 4: THERMAL RECEIPT DESIGNER
      ======================================================== */}
      {activeSubTab === 'receipt_designer' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-5">
            <h3 className="font-extrabold text-sm text-slate-900 border-b pb-3 flex items-center gap-2">
              <Printer className="w-4 h-4 text-purple-700" />
              থার্মাল প্রিন্টার রিসিট কনফিগারেশন (ESC/POS Designer)
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">রিসিট পেপার প্রস্থ (Paper Width):</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaperWidth('80mm')}
                    className={`py-2 px-3 rounded-xl border text-center font-bold transition ${
                      paperWidth === '80mm' ? 'bg-purple-700 text-white border-purple-700' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    ৮০মিমি স্ট্যান্ডার্ড (80mm / 3 inch)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaperWidth('58mm')}
                    className={`py-2 px-3 rounded-xl border text-center font-bold transition ${
                      paperWidth === '58mm' ? 'bg-purple-700 text-white border-purple-700' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    ৫৮মিমি কমপ্যাক্ট (58mm / 2 inch)
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">রিসিটের শীর্ষ বার্তা (Header Note):</label>
                <input
                  type="text"
                  value={receiptHeader}
                  onChange={e => setReceiptHeader(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">রিসিটের ফুটনোট (Footer Note):</label>
                <input
                  type="text"
                  value={receiptFooter}
                  onChange={e => setReceiptFooter(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white"
                />
              </div>

              <div className="border-t pt-3 space-y-2">
                <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                  <span className="font-semibold text-slate-800">ভ্যাট রেজিস্ট্রেশন (BIN) নম্বর প্রদর্শন করুন</span>
                  <input
                    type="checkbox"
                    checked={showTaxId}
                    onChange={e => setShowTaxId(e.target.checked)}
                    className="w-4 h-4 text-purple-700 rounded-md"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                  <span className="font-semibold text-slate-800">বিল প্রস্তুতকারী ক্যাশিয়ারের নাম প্রদর্শন করুন</span>
                  <input
                    type="checkbox"
                    checked={showCashierName}
                    onChange={e => setShowCashierName(e.target.checked)}
                    className="w-4 h-4 text-purple-700 rounded-md"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                  <span className="font-semibold text-slate-800">ডিজিটাল কিউআর কোড (QR Code) যুক্ত করুন</span>
                  <input
                    type="checkbox"
                    checked={showQrCode}
                    onChange={e => setShowQrCode(e.target.checked)}
                    className="w-4 h-4 text-purple-700 rounded-md"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Live Receipt Preview */}
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" /> থার্মাল রিসিট লাইভ প্রিভিউ ({paperWidth})
            </span>

            <div className={`${paperWidth === '80mm' ? 'w-80' : 'w-64'} bg-white border border-slate-300 rounded-lg p-5 shadow-xl font-mono text-[11px] text-slate-800 space-y-3 transition-all`}>
              <div className="text-center space-y-1">
                <p className="text-[10px] text-slate-500">{receiptHeader}</p>
                <h4 className="font-extrabold text-sm uppercase tracking-tight">{storeName}</h4>
                <p className="text-[10px] text-slate-600">{address}</p>
                <p className="text-[10px] text-slate-600">হেল্পলাইন: {phone}</p>
                {showTaxId && <p className="text-[10px] text-slate-600">BIN/VAT: {taxVatNo}</p>}
              </div>

              <div className="border-t border-b border-dashed border-slate-400 py-1.5 flex justify-between text-[10px]">
                <span>চালান: #JH-8092</span>
                <span>{new Date().toLocaleDateString('bn-BD')}</span>
              </div>

              <div className="space-y-1.5 border-b border-dashed border-slate-400 pb-2">
                <div className="flex justify-between font-bold text-[10px]">
                  <span>বিবরণ (Item)</span>
                  <span>মোট (৳)</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span>Ace Plus 500mg x 10</span>
                  <span>৩০.০০</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span>Napa Extra Tablet x 20</span>
                  <span>৫০.০০</span>
                </div>
              </div>

              <div className="space-y-1 text-right text-[10px]">
                <div className="flex justify-between">
                  <span>সর্বমোট (Subtotal):</span>
                  <span>৮০.০০</span>
                </div>
                <div className="flex justify-between font-bold text-xs">
                  <span>পরিশোধিত (Net Paid):</span>
                  <span>{currency}৮০.০০</span>
                </div>
              </div>

              {showCashierName && (
                <div className="border-t border-dashed border-slate-400 pt-1 text-[9px] text-slate-500 flex justify-between">
                  <span>ক্যাশিয়ার: আরিফুল ইসলাম</span>
                  <span>টার্মিনাল: POS-1</span>
                </div>
              )}

              {showQrCode && (
                <div className="text-center py-2 border-t border-dashed border-slate-400">
                  <div className="w-16 h-16 mx-auto bg-slate-900 text-white flex items-center justify-center font-bold text-[8px] rounded-lg">
                    [ QR CODE ]
                  </div>
                  <span className="text-[8px] text-slate-400 mt-1 block">ডিজিটাল ভেরিফিকেশন ও মার্চেন্ট পে</span>
                </div>
              )}

              <p className="text-center text-[10px] text-slate-600 border-t border-slate-300 pt-2">
                {receiptFooter}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 5: MODULE FLEET CONTROL (TOGGLE PER TENANT)
      ======================================================== */}
      {activeSubTab === 'modules' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-700" />
                মডিউল ফ্লিট কন্ট্রোল (Dynamic Feature Flags)
              </h3>
              <p className="text-xs text-slate-500">
                আপনার প্রতিষ্ঠানের প্রয়োজন অনুযায়ী প্রতিটি স্বতন্ত্র ERP মডিউল সক্রিয় বা নিষ্ক্রিয় করুন
              </p>
            </div>
            <button
              onClick={handleSaveAll}
              className="px-4 py-2 bg-purple-700 text-white rounded-xl text-xs font-bold hover:bg-purple-800 transition"
            >
              পরিবর্তন সেভ করুন
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {[
              { key: 'pos', name: 'পিওএস ও ক্যাউন্টার ক্যাশিয়ার (POS)', desc: 'বারকোড স্ক্যান, থার্মাল রিসিট ও ড্রয়ার কন্ট্রোল', phase: 'Core' },
              { key: 'ecommerce', name: 'অনলাইন স্টোরফ্রন্ট (E-Commerce)', desc: 'পাবলিক অনলাইন ওয়েবসাইট ও মোবাইল শপিং', phase: 'Phase 7' },
              { key: 'crm', name: 'কাস্টমার ও ডিজিটাল বাকি খাতা (CRM)', desc: 'বকেয়া হিসাব, SMS তাগাদা ও কাস্টমার লেজার', phase: 'Phase 3' },
              { key: 'hrm', name: 'এইচআরএম ও বেতন খাতা (HRM)', desc: 'কর্মচারী হাজিরা, শিফট ও পে-রোল স্যালারি স্লিপ', phase: 'Phase 4' },
              { key: 'accounting', name: 'ডাবল-এন্ট্রি অ্যাকাউন্টিং', desc: 'চার্ট অফ অ্যাকাউন্টস, সাধারণ জাবেদা ও ব্যালেন্স শিট', phase: 'Phase 10' },
              { key: 'ai', name: 'AI ডিমান্ড ফোরকাস্ট ও অটো-পিও', desc: 'মেশিন লার্নিং সেলস ট্রেন্ড ও স্টক ঘাটতি পূর্বাভাস', phase: 'Phase 12' },
              { key: 'multiWarehouse', name: 'মাল্টি-ব্রাঞ্চ ও ওয়্যারহাউস', desc: 'কেন্দ্রীয় ডিপো থেকে শাখায় স্টক ট্রান্সফার ও চালান', phase: 'Phase 11' },
              { key: 'globalCommerce', name: 'গ্লোবাল পেমেন্ট ও ফরেক্স', desc: 'মাল্টি-কারেন্সি ও স্ট্রাইপ/পেপাল গেটওয়ে', phase: 'Phase 13' },
              { key: 'whatsappLoyalty', name: 'WhatsApp বট ও লয়্যালটি টিয়ার', desc: 'স্বয়ংক্রিয় ইনভয়েস বট ও ভিআইপি পয়েন্ট প্রোগ্রাম', phase: 'Phase 14' },
              { key: 'hardwareSuite', name: 'Sunmi ও iMin হার্ডওয়্যার সুইট', desc: 'স্মার্ট POS ডিভাইস, কাস্টমার স্ক্রিন ও থার্মাল প্রিন্ট', phase: 'Phase 15' },
              { key: 'commissions', name: 'সেলস এজেন্ট কমিশন ইঞ্জিন', desc: 'মাল্টি-টিয়ার কমিশন প্রোগ্রাম ও পে-আউট ভাউচার', phase: 'Phase 19' },
              { key: 'serviceMaintenance', name: 'সার্ভিস, রিপেয়ার ও AMC', desc: 'রিপায়ার জব টিকেট, টেকনিক্যাল চেকলিস্ট ও ওয়ারেন্টি', phase: 'Phase 20' },
              { key: 'assets', name: 'স্থায়ী সম্পদ ও অবচয় (Assets)', desc: 'SLM/WDV অবচয় ক্যালকুলেটর ও ইকুইপমেন্ট মেইন্টেন্যান্স', phase: 'Phase 21' },
              { key: 'projects', name: 'প্রজেক্ট, টাস্ক কানবান ও চুক্তিপত্র', desc: 'প্রজেক্ট ট্র্যাকার, কানবান বোর্ড ও অ্যাপয়েন্টমেন্ট বুকিং', phase: 'Phase 22' },
              { key: 'peoplePortal', name: 'পিপল পোর্টাল ও সেলফ-সার্ভিস', desc: 'B2B ক্লায়েন্ট লগইন, ইনভাইটেশন কোড ও স্টেটমেন্ট', phase: 'Phase 23' },
              { key: 'analytics3d', name: '৩ডি ড্যাশবোর্ড ও গোয়েন্দা হাব', desc: '3D সেলস অ্যানালিটিক্স, স্টক এজিং ও ক্যাশ রেজিস্টার', phase: 'Phase 24' },
            ].map(mod => {
              const isEnabled = features[mod.key as keyof Tenant['features']] !== false;
              return (
                <div
                  key={mod.key}
                  onClick={() => handleToggleFeature(mod.key as keyof Tenant['features'])}
                  className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                    isEnabled
                      ? 'bg-purple-50/50 border-purple-300 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-purple-100 text-purple-800">
                        {mod.phase}
                      </span>
                      <input
                        type="checkbox"
                        checked={isEnabled}
                        onChange={() => {}}
                        className="w-4 h-4 text-purple-700 rounded-md"
                      />
                    </div>
                    <h4 className="font-extrabold text-slate-900">{mod.name}</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{mod.desc}</p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
                    <span className={isEnabled ? 'text-emerald-700 font-bold' : 'text-slate-400 font-semibold'}>
                      {isEnabled ? '● সক্রিয় (Active)' : '○ নিষ্ক্রিয় (Disabled)'}
                    </span>
                    <span className="text-purple-700 font-bold">টগল করুন →</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 6: KNOWLEDGE BASE & SYSTEM MANUAL
      ======================================================== */}
      {activeSubTab === 'knowledge_base' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-800 to-indigo-900 rounded-3xl p-6 text-white shadow-md">
            <div className="max-w-2xl space-y-3">
              <span className="px-2.5 py-1 rounded-full bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider">
                সহায়তা ও ইউজার গাইড
              </span>
              <h2 className="text-xl sm:text-2xl font-black">
                JH IMSE এন্টারপ্রাইজ নলেজ বেস ও অপারেশনাল ম্যানুয়াল
              </h2>
              <p className="text-xs sm:text-sm text-purple-100">
                সফটওয়্যারের প্রতিটি ধাপ, শর্টকাট কি, অ্যাকাউন্টিং পদ্ধতি ও ডিভাইস সেটআপের বিস্তারিত টিউটোরিয়াল
              </p>

              <div className="relative pt-2">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-5" />
                <input
                  type="text"
                  placeholder="যেকোনো ফিচার, এরর বা নিয়ম লিখে সার্চ করুন (যেমন: বারকোড, জাবেদা, পিওএস)..."
                  value={kbSearch}
                  onChange={e => setKbSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-white text-slate-800 rounded-2xl text-xs font-medium focus:outline-none shadow-lg"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {filteredArticles.map(article => (
              <div
                key={article.id}
                onClick={() => setSelectedKbArticle(article.id === selectedKbArticle ? null : article.id)}
                className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-md transition cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold">
                      {article.category}
                    </span>
                    <span className="text-[10px] text-slate-400">গাইডলাইন</span>
                  </div>

                  <h4 className="font-extrabold text-sm text-slate-900 leading-snug">
                    {article.title}
                  </h4>

                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    {article.summary}
                  </p>

                  {selectedKbArticle === article.id && (
                    <div className="mt-3 p-3 bg-purple-50 rounded-2xl text-[11px] text-purple-950 whitespace-pre-line border border-purple-200 animate-in fade-in">
                      {article.content}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-purple-700">
                  <span>{selectedKbArticle === article.id ? 'বন্ধ করুন ↑' : 'বিস্তারিত পড়ুন →'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 7: SUBSCRIPTION PRODUCT & BILLING
      ======================================================== */}
      {activeSubTab === 'subscriptions' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-purple-700" />
                  সফটওয়্যার সাবস্ক্রিপশন ও লাইসেন্সিং স্ট্যাটাস
                </h3>
                <p className="text-slate-500 text-[11px]">
                  আপনার প্রতিষ্ঠানের বর্তমান প্ল্যান, ব্যবহারকারী কোটা ও ক্লাউড সক্ষমতা
                </p>
              </div>

              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold uppercase tracking-wider text-[11px]">
                {tenant.plan} Subscription
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                <span className="text-[10px] text-slate-400 font-bold block">মেয়াদ উত্তীর্ণের তারিখ</span>
                <span className="font-mono font-black text-slate-900 text-sm mt-0.5 block">
                  {tenant.subscriptionExpiry || '২০২৭-১২-৩১'}
                </span>
                <span className="text-[10px] text-emerald-600 font-bold mt-0.5 block">সক্রিয় লাইসেন্স</span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                <span className="text-[10px] text-slate-400 font-bold block">সর্বোচ্চ ব্যবহারকারী</span>
                <span className="font-mono font-black text-slate-900 text-sm mt-0.5 block">
                  {tenant.quotas?.maxUsers || 15} জন
                </span>
                <span className="text-[10px] text-purple-700 font-bold mt-0.5 block">অফিস + ফিল্ড স্টাফ</span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                <span className="text-[10px] text-slate-400 font-bold block">ওয়্যারহাউস কোটা</span>
                <span className="font-mono font-black text-slate-900 text-sm mt-0.5 block">
                  {tenant.quotas?.maxBranches || 5} টি ব্রাঞ্চ
                </span>
                <span className="text-[10px] text-slate-500 font-semibold mt-0.5 block">মাল্টি-ডিপো রেডি</span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                <span className="text-[10px] text-slate-400 font-bold block">ক্লাউড ব্যাকআপ স্টোরেজ</span>
                <span className="font-mono font-black text-slate-900 text-sm mt-0.5 block">
                  ১০ জিবি SSD
                </span>
                <span className="text-[10px] text-emerald-600 font-bold mt-0.5 block">হোস্টিংগার এন্টারপ্রাইজ</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="font-extrabold text-sm text-purple-950">প্ল্যান আপগ্রেড অথবা লাইসেন্স নবায়ন প্রয়োজন?</h4>
                <p className="text-purple-700 text-[11px] mt-0.5">
                  সুপার অ্যাডমিন ড্যাশবোর্ড থেকে তাৎক্ষণিকভাবে ফিচার বা কোটা বৃদ্ধি করতে পারেন।
                </p>
              </div>

              <button
                onClick={onOpenSuperAdmin}
                className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl text-xs transition shadow-sm cursor-pointer whitespace-nowrap"
              >
                সুপার অ্যাডমিন হাব খুলুন →
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <h4 className="font-black text-sm text-slate-900">প্ল্যান সুবিধা ও সাপোর্ট SLA</h4>
              <ul className="space-y-2 text-slate-600 text-[11px]">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>২৪/৭ ডেডিকেটেড টেকনিক্যাল সাপোর্ট ও লাইভ কল</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>দৈনিক অটোমেটিক ক্লাউড ডাটাবেজ ব্যাকআপ</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>আনলিমিটেড ইনভয়েস ও বারকোড প্রিন্টিং</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>সবগুলো এন্টারপ্রাইজ মডিউল (Phase 1 - 25) অন্তর্ভুক্ত</span>
                </li>
              </ul>
            </div>

            <div className="pt-3 border-t">
              <span className="text-[10px] text-slate-400 block text-center">JH IMSE Engine v25.4 Pro</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 8: LANGUAGES & LOCALE FORMATS
      ======================================================== */}
      {activeSubTab === 'languages' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs max-w-2xl space-y-5 text-xs">
          <h3 className="font-extrabold text-sm text-slate-900 border-b pb-3 flex items-center gap-2">
            <Globe className="w-4 h-4 text-purple-700" />
            ভাষা, তারিখ ও আঞ্চলিক বিন্যাস (Locale & Globalization)
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">সিস্টেমের ডিফল্ট ভাষা:</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { code: 'bn', label: 'বাংলা (Bengali)' },
                  { code: 'en', label: 'English (US)' },
                  { code: 'ar', label: 'العربية (Arabic RTL)' },
                ].map(l => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => setLocaleLang(l.code as any)}
                    className={`py-2 px-3 rounded-xl border text-center font-bold transition ${
                      localeLang === l.code ? 'bg-purple-700 text-white border-purple-700' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">তারিখ প্রদর্শনের ফরম্যাট:</label>
              <select
                value={dateFormat}
                onChange={e => setDateFormat(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:ring-2 focus:ring-purple-600"
              >
                <option value="YYYY-MM-DD">YYYY-MM-DD (2026-10-28) - ISO আন্তর্জাতিক মানদণ্ড</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY (28/10/2026) - বাংলাদেশ ও কমনওয়েলথ মানদণ্ড</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY (10/28/2026) - US আমেরিকান ফরম্যাট</option>
              </select>
            </div>

            <div className="pt-2">
              <button
                onClick={handleSaveAll}
                className="px-5 py-2.5 bg-purple-700 text-white rounded-xl font-bold hover:bg-purple-800 transition"
              >
                ভাষা ও ফরম্যাট আপডেট করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
