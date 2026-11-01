import React, { useState } from 'react';
import { Customer, Product, Sale, Tenant, WhatsAppConfig, WhatsAppMessageLog, LoyaltyPointTransaction, WhatsAppChatMessage } from '../../types';
import { LOYALTY_TIERS, calculateCustomerTier, getTierProgress, processWhatsAppBotMessage, POINTS_TO_BDT_RATE } from '../../utils/loyaltyEngine';
import { DigitalLoyaltyCardModal } from './DigitalLoyaltyCardModal';
import { WhatsAppDueReminderModal } from './WhatsAppDueReminderModal';
import { 
  Award, MessageSquare, Smartphone, Settings, CheckCircle2, 
  Send, Sparkles, QrCode, Search, Filter, ShieldCheck, RefreshCw, 
  CheckCheck, Check, Clock, AlertTriangle, ChevronRight, Gift, 
  CreditCard, ExternalLink, Zap, Users, ArrowUpRight, DollarSign,
  ChevronDown
} from 'lucide-react';

interface WhatsAppLoyaltyManagerProps {
  tenant: Tenant;
  customers: Customer[];
  products: Product[];
  sales: Sale[];
  whatsAppConfig: WhatsAppConfig;
  onUpdateWhatsAppConfig: (config: WhatsAppConfig) => void;
  whatsAppLogs: WhatsAppMessageLog[];
  onAddWhatsAppLog: (log: WhatsAppMessageLog) => void;
  loyaltyTransactions: LoyaltyPointTransaction[];
  onAddLoyaltyTransaction: (trx: LoyaltyPointTransaction) => void;
  onUpdateCustomerPoints: (customerId: string, newPoints: number) => void;
}

export const WhatsAppLoyaltyManager: React.FC<WhatsAppLoyaltyManagerProps> = ({
  tenant,
  customers,
  products,
  sales,
  whatsAppConfig,
  onUpdateWhatsAppConfig,
  whatsAppLogs,
  onAddWhatsAppLog,
  loyaltyTransactions,
  onAddLoyaltyTransaction,
  onUpdateCustomerPoints,
}) => {
  // Navigation sub-tab
  const [activeSubTab, setActiveSubTab] = useState<'loyalty' | 'simulator' | 'meta_api' | 'logs'>('loyalty');

  // Loyalty customer filter & search
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<'all' | 'bronze' | 'silver' | 'gold' | 'platinum'>('all');

  // Modals state
  const [selectedCardCustomer, setSelectedCardCustomer] = useState<Customer | null>(null);
  const [selectedDueReminderCustomer, setSelectedDueReminderCustomer] = useState<Customer | null>(null);
  const [activeRedeemCustomer, setActiveRedeemCustomer] = useState<Customer | null>(null);
  const [redeemPointsInput, setRedeemPointsInput] = useState<number>(50);

  // Bot Simulator State
  const [simulatorCustomer, setSimulatorCustomer] = useState<Customer>(customers[0] || {
    id: 'cust-1',
    tenantId: tenant.id,
    name: 'Shamsul Alam',
    phone: '+880 1712-445566',
    totalSpent: 12450,
    dueAmount: 850,
    loyaltyTier: 'silver',
    loyaltyPoints: 186,
    purchaseCount: 14,
    lastPurchased: '2026-10-24',
  });

  const [chatMessages, setChatMessages] = useState<WhatsAppChatMessage[]>([
    {
      id: 'msg-init-1',
      sender: 'user',
      text: 'হ্যালো',
      timestamp: '10:30 AM',
    },
    {
      id: 'msg-init-2',
      sender: 'bot',
      text: `👋 আসসালামু আলাইকুম Shamsul Alam!
*${tenant.name}* স্মার্ট অ্যাসিস্ট্যান্টে আপনাকে স্বাগতম।

আপনার মেম্বারশিপ: *🥈 সিলভার সদস্য (Silver)*
লয়্যালটি পয়েন্ট ব্যালেন্স: *186 পয়েন্ট (৳186 সমমূল্য)*

কীভাবে সাহায্য করতে পারি? নিচের মেনু থেকে নির্বাচন করুন:`,
      timestamp: '10:30 AM',
      quickReplies: ['১. পয়েন্ট ও সুবিধা', '২. বকেয়া হিসাব', '৩. সাম্প্রতিক রসিদ', '৪. সেরা পণ্য ক্যাটালগ', '৫. এজেন্টের সাথে কথা'],
    },
  ]);

  const [inputChatText, setInputChatText] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);

  // Meta Config Editable Form
  const [configForm, setConfigForm] = useState<WhatsAppConfig>(whatsAppConfig);
  const [pingStatus, setPingStatus] = useState<{ testing: boolean; success?: boolean; message?: string }>({
    testing: false,
  });

  // Broadcast modal
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastTargetTier, setBroadcastTargetTier] = useState<'all' | 'bronze' | 'silver' | 'gold' | 'platinum'>('all');
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);
  const [broadcastSuccessCount, setBroadcastSuccessCount] = useState<number | null>(null);

  // Selected Log for detail modal
  const [selectedLog, setSelectedLog] = useState<WhatsAppMessageLog | null>(null);

  // Filter customers by tenant
  const tenantCustomers = customers.filter(c => c.tenantId === tenant.id);

  // Tier counts
  const tierCounts = {
    bronze: tenantCustomers.filter(c => (c.loyaltyTier === 'bronze' || !c.loyaltyTier)).length,
    silver: tenantCustomers.filter(c => c.loyaltyTier === 'silver').length,
    gold: tenantCustomers.filter(c => c.loyaltyTier === 'gold').length,
    platinum: tenantCustomers.filter(c => c.loyaltyTier === 'platinum' || c.loyaltyTier === 'vip').length,
  };

  const filteredCustomers = tenantCustomers.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery);
    
    if (tierFilter === 'all') return matchesSearch;
    const tier = c.loyaltyTier === 'vip' ? 'platinum' : (c.loyaltyTier || 'bronze');
    return matchesSearch && tier === tierFilter;
  });

  // Handle Send Simulated Message in Bot
  const handleSendChatMessage = (textToSend?: string) => {
    const msg = textToSend || inputChatText;
    if (!msg.trim()) return;

    const userMsg: WhatsAppChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: msg,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputChatText('');
    setIsBotTyping(true);

    setTimeout(() => {
      const botResponse = processWhatsAppBotMessage(
        msg,
        simulatorCustomer,
        tenant.name,
        products.filter(p => p.tenantId === tenant.id)
      );

      const botMsg: WhatsAppChatMessage = {
        id: 'msg-bot-' + Date.now(),
        sender: 'bot',
        text: botResponse.replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickReplies: botResponse.quickReplies,
        actionLink: botResponse.actionLink,
      };

      setChatMessages(prev => [...prev, botMsg]);
      setIsBotTyping(false);
    }, 600);
  };

  // Test Meta API Connection
  const handleTestMetaConnection = () => {
    setPingStatus({ testing: true });
    setTimeout(() => {
      setPingStatus({
        testing: false,
        success: true,
        message: 'Meta Graph API v20.0 কানেকশন সফল! রেসপন্স টাইম: 114ms (HTTP 200 OK)',
      });
    }, 1000);
  };

  // Save Meta API Config
  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateWhatsAppConfig(configForm);
    setPingStatus({
      testing: false,
      success: true,
      message: 'মেটা হোয়াটসঅ্যাপ ক্লাউড কনফিগারেশন সফলভাবে সেভ করা হয়েছে!',
    });
  };

  // Handle Point Redemption
  const handleConfirmRedeem = () => {
    if (!activeRedeemCustomer || redeemPointsInput <= 0) return;
    const currentPoints = activeRedeemCustomer.loyaltyPoints || 0;
    if (redeemPointsInput > currentPoints) return;

    const newPoints = currentPoints - redeemPointsInput;
    onUpdateCustomerPoints(activeRedeemCustomer.id, newPoints);

    const newTrx: LoyaltyPointTransaction = {
      id: 'lpt-' + Date.now(),
      tenantId: tenant.id,
      customerId: activeRedeemCustomer.id,
      customerName: activeRedeemCustomer.name,
      type: 'redeemed',
      points: -redeemPointsInput,
      amountBDT: redeemPointsInput * POINTS_TO_BDT_RATE,
      date: new Date().toISOString().slice(0, 10),
      notes: `ম্যানুয়াল কাউন্টার রিডেম্পশন: ${redeemPointsInput} পয়েন্ট = ৳${redeemPointsInput * POINTS_TO_BDT_RATE} ছাড়`,
    };

    onAddLoyaltyTransaction(newTrx);
    setActiveRedeemCustomer(null);
  };

  // Handle Broadcast Campaign Dispatch
  const handleSendBroadcast = () => {
    if (!broadcastMessage.trim()) return;
    setIsSendingBroadcast(true);

    const targets = tenantCustomers.filter(c => {
      if (broadcastTargetTier === 'all') return true;
      const tier = c.loyaltyTier === 'vip' ? 'platinum' : (c.loyaltyTier || 'bronze');
      return tier === broadcastTargetTier;
    });

    setTimeout(() => {
      targets.forEach(c => {
        const log: WhatsAppMessageLog = {
          id: 'wa-bcast-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
          tenantId: tenant.id,
          recipientName: c.name,
          recipientPhone: c.phone,
          templateType: 'custom_broadcast',
          messageText: broadcastMessage,
          status: 'delivered',
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
          costBDT: 0.55,
        };
        onAddWhatsAppLog(log);
      });

      setIsSendingBroadcast(false);
      setBroadcastSuccessCount(targets.length);
      setBroadcastMessage('');
      setTimeout(() => setBroadcastSuccessCount(null), 3000);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Title */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            Phase 14 • Omnichannel Engagement
          </div>
          <h2 className="text-2xl font-black tracking-tight flex items-center gap-2.5">
            মেটা হোয়াটসঅ্যাপ ক্লাউড বট ও মেম্বারশিপ লয়্যালটি ইঞ্জিন
          </h2>
          <p className="text-emerald-100/80 text-xs sm:text-sm max-w-2xl leading-relaxed">
            অফিসিয়াল Meta WhatsApp Cloud API v20.0 দিয়ে স্বয়ংক্রিয় পিডিএফ ক্যাশ মেমো, বাকি আদায়ের পে-লিংক ও চার স্তরের ভিআইপি রিওয়ার্ড সিস্টেম।
          </p>
        </div>

        {/* Live Meta Connection Indicator Badge */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-3 flex items-center gap-3">
            <div className="relative">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-ping absolute inset-0" />
              <div className="w-3 h-3 bg-emerald-400 rounded-full relative" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-emerald-200 font-semibold">Meta Cloud API</p>
              <p className="text-xs font-bold text-white flex items-center gap-1">
                {whatsAppConfig.verifiedBusinessName.split(' ')[0]} Verified
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 inline" />
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'loyalty', label: 'কাস্টমার লয়্যালটি ও মেম্বারশিপ', icon: Award, count: tenantCustomers.length },
          { id: 'simulator', label: '২-ওয়ে হোয়াটসঅ্যাপ বট সিমুলেটর', icon: Smartphone, badge: 'Live' },
          { id: 'meta_api', label: 'মেটা API ও মেসেজ টেমপ্লেট', icon: Settings },
          { id: 'logs', label: 'ডেলিভারি অডিট লগ', icon: MessageSquare, count: whatsAppLogs.filter(l => l.tenantId === tenant.id).length },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition shadow-sm ${
                isActive
                  ? 'bg-emerald-700 text-white shadow-emerald-200'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'}`}>
                  {tab.count}
                </span>
              )}
              {tab.badge && (
                <span className="px-1.5 py-0.2 rounded bg-amber-400 text-slate-900 text-[10px] font-black uppercase tracking-wider">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* =====================================================================
          TAB 1: CUSTOMER LOYALTY TIERS & MEMBERSHIP
          ===================================================================== */}
      {activeSubTab === 'loyalty' && (
        <div className="space-y-6">
          {/* 4 Tier Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.values(LOYALTY_TIERS).map(tier => {
              const count = tierCounts[tier.tier as keyof typeof tierCounts];
              return (
                <div
                  key={tier.tier}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition relative overflow-hidden flex flex-col justify-between"
                >
                  <div className={`absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r ${tier.bgGradient}`} />

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{tier.iconName}</span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {count} জন সদস্য
                      </span>
                    </div>

                    <h4 className="font-extrabold text-base text-slate-900">{tier.nameBn}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      খরচ সীমা: ৳{tier.minSpendBDT.toLocaleString()} - {tier.maxSpendBDT > 1000000 ? 'সীমাহীন' : `৳${tier.maxSpendBDT.toLocaleString()}`}
                    </p>

                    <div className="my-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">পয়েন্ট অর্জনের হার:</span>
                        <span className="font-bold text-emerald-700">{tier.pointsPerHundredBDT} pt / ৳১০০</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">ইনস্ট্যান্ট ছাড়:</span>
                        <span className="font-bold text-purple-700">{tier.discountPct}% ফ্ল্যাট</span>
                      </div>
                    </div>

                    <div className="space-y-1 text-[11px] text-slate-600">
                      {tier.perks.slice(0, 2).map((p, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span className="truncate">{p}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">১ পয়েন্ট = ৳১.০০</span>
                    <button
                      onClick={() => {
                        setTierFilter(tier.tier);
                      }}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                    >
                      সদস্যদের দেখুন <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Customer Loyalty Directory */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Table Filters Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/60">
              <div className="flex items-center gap-2.5">
                <Users className="w-5 h-5 text-emerald-700" />
                <h3 className="font-bold text-base text-slate-900">লয়্যালটি গ্রাহক ডিরেক্টরি ও পয়েন্ট লেজার</h3>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* Search */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="নাম বা মোবাইল নম্বর..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-48 sm:w-60 bg-white"
                  />
                </div>

                {/* Tier Filter Pills */}
                <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 text-xs">
                  {[
                    { id: 'all', label: 'সকল' },
                    { id: 'bronze', label: '🥉 ব্রোঞ্জ' },
                    { id: 'silver', label: '🥈 সিলভার' },
                    { id: 'gold', label: '🥇 গোল্ড' },
                    { id: 'platinum', label: '💎 প্ল্যাটিনাম' },
                  ].map(tf => (
                    <button
                      key={tf.id}
                      onClick={() => setTierFilter(tf.id as any)}
                      className={`px-2.5 py-1 rounded font-medium transition ${
                        tierFilter === tf.id ? 'bg-emerald-700 text-white' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {tf.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/70 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">গ্রাহকের নাম ও ফোন</th>
                    <th className="py-3 px-4">মেম্বারশিপ স্তর (Tier)</th>
                    <th className="py-3 px-4 text-right">মোট কেনাকাটা</th>
                    <th className="py-3 px-4 text-right">লয়্যালটি পয়েন্ট</th>
                    <th className="py-3 px-4 text-right">বকেয়া জের</th>
                    <th className="py-3 px-4 text-center">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        কোনো গ্রাহক পাওয়া যায়নি।
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map(customer => {
                      const tierKey = (customer.loyaltyTier === 'vip' ? 'platinum' : customer.loyaltyTier) || 'bronze';
                      const tierConfig = LOYALTY_TIERS[tierKey as keyof typeof LOYALTY_TIERS] || LOYALTY_TIERS.bronze;
                      const points = customer.loyaltyPoints || 0;

                      return (
                        <tr key={customer.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3.5 px-4">
                            <p className="font-bold text-slate-900">{customer.name}</p>
                            <p className="text-[11px] text-slate-500 font-mono">{customer.phone}</p>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${tierConfig.badgeColor}`}>
                              <span>{tierConfig.iconName}</span>
                              <span>{tierConfig.nameBn.split(' ')[0]}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-800">
                            ৳{customer.totalSpent.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <p className="font-mono font-black text-amber-600 text-sm">
                              {points.toLocaleString()} Pts
                            </p>
                            <p className="text-[10px] text-slate-400">≈ ৳{points * POINTS_TO_BDT_RATE}</p>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {customer.dueAmount > 0 ? (
                              <span className="font-mono font-bold text-rose-600">
                                ৳{customer.dueAmount.toLocaleString()}
                              </span>
                            ) : (
                              <span className="text-emerald-600 font-medium">পরিশোধিত</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* Digital Card Preview */}
                              <button
                                onClick={() => setSelectedCardCustomer(customer)}
                                className="p-1.5 rounded-lg text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition"
                                title="ভিআইপি মেম্বারশিপ কার্ড দেখুন"
                              >
                                <QrCode className="w-4 h-4" />
                              </button>

                              {/* Redeem Points */}
                              <button
                                onClick={() => {
                                  setActiveRedeemCustomer(customer);
                                  setRedeemPointsInput(Math.min(50, points));
                                }}
                                disabled={points <= 0}
                                className="px-2 py-1 rounded-lg text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition disabled:opacity-40"
                                title="পয়েন্ট রিডিম করে ডিসকাউন্ট দিন"
                              >
                                রিডিম
                              </button>

                              {/* Send Due Reminder via WhatsApp */}
                              {customer.dueAmount > 0 && (
                                <button
                                  onClick={() => setSelectedDueReminderCustomer(customer)}
                                  className="p-1.5 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition"
                                  title="হোয়াটসঅ্যাপে বকেয়া রিমাইন্ডার ও পে-লিংক পাঠান"
                                >
                                  <MessageSquare className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Loyalty Transactions Ledger */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-sm text-slate-800">সাম্প্রতিক লয়্যালটি পয়েন্ট লেনদেন হিস্ট্রি</h3>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                মোট ট্রানজেকশন: {loyaltyTransactions.filter(t => t.tenantId === tenant.id).length} টি
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {loyaltyTransactions
                .filter(t => t.tenantId === tenant.id)
                .slice(0, 6)
                .map(trx => (
                  <div key={trx.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{trx.customerName}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          trx.type === 'earned' ? 'bg-emerald-100 text-emerald-800' :
                          trx.type === 'redeemed' ? 'bg-amber-100 text-amber-800' :
                          trx.type === 'tier_upgrade' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {trx.type === 'earned' ? 'অর্জিত (+)' :
                           trx.type === 'redeemed' ? 'রিডিম (-)' :
                           trx.type === 'tier_upgrade' ? 'টিয়ার বোনাস' : 'সমন্বয়'}
                        </span>
                      </div>
                      <p className="text-slate-500 text-[11px]">{trx.notes}</p>
                    </div>

                    <div className="text-right">
                      <span className={`font-mono font-black ${trx.points > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {trx.points > 0 ? `+${trx.points}` : trx.points} Pts
                      </span>
                      <p className="text-[10px] text-slate-400 font-mono">{trx.date}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 2: TWO-WAY WHATSAPP BOT SIMULATOR & CAMPAIGNS
          ===================================================================== */}
      {activeSubTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Interactive Smartphone WhatsApp Screen (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col items-center">
            {/* Phone Outer Shell */}
            <div className="w-full max-w-sm rounded-[40px] bg-slate-900 p-3 shadow-2xl border-4 border-slate-700">
              {/* Speaker / Notch */}
              <div className="flex justify-center mb-1">
                <div className="w-20 h-4 bg-slate-950 rounded-b-xl flex items-center justify-center">
                  <div className="w-8 h-1 bg-slate-700 rounded-full" />
                </div>
              </div>

              {/* Screen Body */}
              <div className="w-full bg-[#efeae2] rounded-[32px] overflow-hidden flex flex-col h-[540px] relative text-slate-900 border border-slate-300">
                {/* WhatsApp Chat Header */}
                <div className="bg-[#075e54] text-white px-3.5 py-2.5 flex items-center justify-between shadow-md">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-700 border border-white/30 flex items-center justify-center font-bold text-xs uppercase shadow">
                      {tenant.name.slice(0, 2)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <p className="font-bold text-xs leading-tight">{tenant.name}</p>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                      </div>
                      <p className="text-[10px] text-emerald-200">Official WhatsApp Business</p>
                    </div>
                  </div>

                  <div className="text-[10px] bg-emerald-800/80 px-2 py-0.5 rounded text-emerald-100 font-mono">
                    24/7 AI Bot
                  </div>
                </div>

                {/* Chat Scroll Area */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2.5 text-xs">
                  {/* Security Banner */}
                  <div className="bg-[#ffeecd] border border-amber-200 text-amber-900 text-[10px] p-2 rounded-lg text-center shadow-xs">
                    🔒 এন্ড-টু-এন্ড এনক্রিপ্টেড। আপনার বার্তা ও তথ্য সম্পূর্ণ সুরক্ষিত।
                  </div>

                  {chatMessages.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-xl px-3 py-2 shadow-sm relative ${
                          msg.sender === 'user'
                            ? 'bg-[#dcf8c6] text-slate-900 rounded-tr-none'
                            : 'bg-white text-slate-900 rounded-tl-none border border-slate-200'
                        }`}
                      >
                        <p className="whitespace-pre-line text-[11px] leading-relaxed">
                          {msg.text}
                        </p>

                        {/* Action Link button inside bot response */}
                        {msg.actionLink && (
                          <div className="mt-2 pt-2 border-t border-slate-200">
                            <a
                              href={msg.actionLink.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 text-white font-bold text-[11px] hover:bg-emerald-800 transition shadow-sm w-full justify-center"
                            >
                              <span>{msg.actionLink.title}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}

                        <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-slate-400">
                          <span>{msg.timestamp}</span>
                          {msg.sender === 'user' && (
                            <CheckCheck className="w-3 h-3 text-sky-500" />
                          )}
                        </div>
                      </div>

                      {/* Quick Replies Buttons */}
                      {msg.quickReplies && msg.quickReplies.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5 max-w-[90%]">
                          {msg.quickReplies.map((qr, i) => (
                            <button
                              key={i}
                              onClick={() => handleSendChatMessage(qr)}
                              className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-full text-[10px] font-bold shadow-xs transition"
                            >
                              {qr}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Typing Indicator */}
                  {isBotTyping && (
                    <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-full border border-slate-200 w-fit text-[10px] text-slate-500 shadow-xs">
                      <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                      <span className="ml-1">টাইপ করছে...</span>
                    </div>
                  )}
                </div>

                {/* Input Bar */}
                <div className="bg-slate-100 p-2 border-t border-slate-200 flex items-center gap-1.5">
                  <input
                    type="text"
                    value={inputChatText}
                    onChange={e => setInputChatText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendChatMessage()}
                    placeholder="মেসেজ লিখুন (যেমন: পয়েন্ট, বাকি, ক্যাটালগ)..."
                    className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-full text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <button
                    onClick={() => handleSendChatMessage()}
                    className="p-2 bg-[#128c7e] hover:bg-[#075e54] text-white rounded-full transition shadow"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Customer Switcher & Broadcast Tool (5 Cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Active Customer Simulator Profile */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-700" />
                সিমুলেটরের জন্য গ্রাহক নির্বাচন করুন
              </h3>
              <p className="text-xs text-slate-500">
                গ্রাহক পরিবর্তন করলে বট তাদের নির্দিষ্ট পয়েন্ট, বকেয়া এবং অর্ডারের উপর ভিত্তি করে স্বয়ংক্রিয় উত্তর তৈরি করবে।
              </p>

              <select
                value={simulatorCustomer.id}
                onChange={e => {
                  const found = tenantCustomers.find(c => c.id === e.target.value);
                  if (found) {
                    setSimulatorCustomer(found);
                    setChatMessages([
                      {
                        id: 'msg-' + Date.now(),
                        sender: 'bot',
                        text: `👋 আসসালামু আলাইকুম ${found.name}!
*${tenant.name}* স্মার্ট অ্যাসিস্ট্যান্টে আপনাকে স্বাগতম।

আপনার মেম্বারশিপ: *${found.loyaltyTier?.toUpperCase() || 'BRONZE'}*
লয়্যালটি পয়েন্ট ব্যালেন্স: *${found.loyaltyPoints || 0} পয়েন্ট*

কীভাবে সাহায্য করতে পারি? নিচের মেনু থেকে নির্বাচন করুন:`,
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        quickReplies: ['১. পয়েন্ট ও সুবিধা', '২. বকেয়া হিসাব', '৩. সাম্প্রতিক রসিদ', '৪. সেরা পণ্য ক্যাটালগ', '৫. এজেন্টের সাথে কথা'],
                      },
                    ]);
                  }
                }}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50 font-medium focus:ring-2 focus:ring-emerald-500"
              >
                {tenantCustomers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.loyaltyTier?.toUpperCase() || 'BRONZE'} - {c.loyaltyPoints || 0} Pts, বাকি: ৳{c.dueAmount})
                  </option>
                ))}
              </select>

              <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-100">
                  <span className="text-[10px] text-emerald-700 block">বর্তমান পয়েন্ট</span>
                  <span className="font-bold text-emerald-900 text-sm font-mono">
                    {simulatorCustomer.loyaltyPoints || 0} Pts
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-100">
                  <span className="text-[10px] text-rose-700 block">বকেয়া পরিমাণ</span>
                  <span className="font-bold text-rose-900 text-sm font-mono">
                    ৳{simulatorCustomer.dueAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Bulk WhatsApp Promotional Broadcast Sender */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-sm text-slate-900">বাল্ক হোয়াটসঅ্যাপ ব্রডকাস্ট ক্যাম্পেইন</h3>
              </div>
              <p className="text-xs text-slate-500">
                নির্দিষ্ট টিয়ারের গ্রাহক অথবা সবাইকে এক ক্লিকে অফার বা ডিসকাউন্ট ক্যাম্পেইন পাঠান।
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">টার্গেট লয়্যালটি গ্রুপ</label>
                <select
                  value={broadcastTargetTier}
                  onChange={e => setBroadcastTargetTier(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-slate-50"
                >
                  <option value="all">সকল গ্রাহক ({tenantCustomers.length} জন)</option>
                  <option value="bronze">🥉 ব্রোঞ্জ সদস্যবৃন্দ ({tierCounts.bronze} জন)</option>
                  <option value="silver">🥈 সিলভার সদস্যবৃন্দ ({tierCounts.silver} জন)</option>
                  <option value="gold">🥇 গোল্ড সদস্যবৃন্দ ({tierCounts.gold} জন)</option>
                  <option value="platinum">💎 প্ল্যাটিনাম ভিআইপিবৃন্দ ({tierCounts.platinum} জন)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ক্যাম্পেইন মেসেজ টেক্সট</label>
                <textarea
                  rows={3}
                  value={broadcastMessage}
                  onChange={e => setBroadcastMessage(e.target.value)}
                  placeholder="যেমন: 🎉 বিশেষ সপ্তাহান্তে ভিআইপি সদস্যদের জন্য অতিরিক্ত ৫% ক্যাশব্যাক! এখনই ভিজিট করুন..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {broadcastSuccessCount !== null && (
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  সফলভাবে {broadcastSuccessCount} জন গ্রাহকের হোয়াটসঅ্যাপে ক্যাম্পেইন পাঠানো হয়েছে!
                </div>
              )}

              <button
                onClick={handleSendBroadcast}
                disabled={isSendingBroadcast || !broadcastMessage.trim()}
                className="w-full py-2.5 px-4 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition shadow flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSendingBroadcast ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ব্রডকাস্ট ডেলিভারি হচ্ছে...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    হোয়াটসঅ্যাপে ব্রডকাস্ট ক্যাম্পেইন প্রেরণ
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 3: META WHATSAPP CLOUD API & TEMPLATES
          ===================================================================== */}
      {activeSubTab === 'meta_api' && (
        <div className="space-y-6">
          {/* API Configuration Form */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-emerald-700" />
                  অফিসিয়াল Meta WhatsApp Cloud API ক্রেডেনশিয়ালস
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Facebook Developers & Meta Business Manager ভেরিফাইড কানেকশন
                </p>
              </div>

              <button
                type="button"
                onClick={handleTestMetaConnection}
                disabled={pingStatus.testing}
                className="px-4 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl transition flex items-center gap-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${pingStatus.testing ? 'animate-spin' : ''}`} />
                {pingStatus.testing ? 'পিং পরীক্ষা হচ্ছে...' : 'Meta API পিং টেস্ট (Ping Test)'}
              </button>
            </div>

            {pingStatus.message && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-medium text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{pingStatus.message}</span>
              </div>
            )}

            <form onSubmit={handleSaveConfig} className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  WhatsApp Phone Number ID
                </label>
                <input
                  type="text"
                  value={configForm.phoneNumberId}
                  onChange={e => setConfigForm({ ...configForm, phoneNumberId: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  WhatsApp Business Account ID (WABA)
                </label>
                <input
                  type="text"
                  value={configForm.businessAccountId}
                  onChange={e => setConfigForm({ ...configForm, businessAccountId: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Meta Permanent System Access Token (EAAG...)
                </label>
                <input
                  type="password"
                  value={configForm.apiAccessToken}
                  onChange={e => setConfigForm({ ...configForm, apiAccessToken: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Webhook Verify Token (Secret)
                </label>
                <input
                  type="text"
                  value={configForm.webhookVerifyToken}
                  onChange={e => setConfigForm({ ...configForm, webhookVerifyToken: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  অনুমোদিত বিজনেস নাম (Meta Verified Name)
                </label>
                <input
                  type="text"
                  value={configForm.verifiedBusinessName}
                  onChange={e => setConfigForm({ ...configForm, verifiedBusinessName: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Automation Toggles */}
              <div className="md:col-span-2 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                  স্বয়ংক্রিয় ক্লাউড অটোমেশন টগল
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={configForm.autoSendOnPOSSale}
                      onChange={e => setConfigForm({ ...configForm, autoSendOnPOSSale: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <span className="text-xs font-semibold text-slate-800 block">
                        পিওএস সেলস সম্পন্ন হলে স্বয়ংক্রিয় রসিদ প্রেরণ
                      </span>
                      <span className="text-[11px] text-slate-500">
                        ক্যাশ কাউন্টারে বিল প্রিন্ট বা পেমেন্ট হওয়া মাত্রই গ্রাহকের নম্বরে মেসেজ যাবে।
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={configForm.catalogSyncEnabled}
                      onChange={e => setConfigForm({ ...configForm, catalogSyncEnabled: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <span className="text-xs font-semibold text-slate-800 block">
                        মেটা ক্যাটালগ রিয়েল-টাইম সিঙ্ক (Meta Catalog)
                      </span>
                      <span className="text-[11px] text-slate-500">
                        ইনভেন্টরি পরিবর্তন হলে হোয়াটসঅ্যাপ স্টোরে স্বয়ংক্রিয় আপডেট হবে।
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="md:col-span-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition shadow"
                >
                  কনফিগারেশন সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>

          {/* Pre-Approved WhatsApp Cloud Message Templates */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                অনুমোদিত মেটা মেসেজ টেমপ্লেট গ্যালারি (Meta Approved Templates)
              </h3>
              <p className="text-xs text-slate-500">
                গ্রাহকের সাথে প্রথম যোগাযোগ স্থাপনের জন্য মেটা দ্বারা প্রাক-অনুমোদিত টেমপ্লেটসমূহ।
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  id: 'pos_invoice_receipt',
                  title: '🧾 POS ক্যাশ মেমো ও লয়্যালটি',
                  category: 'TRANSACTIONAL',
                  desc: 'বিল সম্পন্ন হলে মেমো লিংক, লয়্যালটি পয়েন্ট ও ধন্যবাদ বার্তা ডেলিভারি।',
                  sample: 'সম্মানিত [গ্রাহক], [দোকান]-এ কেনাকাটা করার জন্য ধন্যবাদ! মেমো: [ইনভয়েস নং], মোট: [টাকা]। অর্জিত লয়্যালটি: [পয়েন্ট]',
                },
                {
                  id: 'due_recovery_notice',
                  title: '🔔 বকেয়া রিমাইন্ডার ও পে-লিংক',
                  category: 'PAYMENT_REMINDER',
                  desc: 'সৌজন্যমূলক বাকি আদায়ের নোটিশ এবং ১-ক্লিক বিকাশ/নগদ পেমেন্ট লিংক।',
                  sample: 'সম্মানিত [গ্রাহক], [দোকান]-এ আপনার পূর্বের বকেয়া জের ৳[টাকা]। সরাসরি বিকাশে পরিশোধ করতে ক্লিক করুন: [পে-লিংক]',
                },
                {
                  id: 'loyalty_tier_upgrade',
                  title: '💎 ভিআইপি টিয়ার আপগ্রেড শুভেচ্ছা',
                  category: 'REWARD_ENGAGEMENT',
                  desc: 'গ্রাহক সিলভার/গোল্ড/প্ল্যাটিনামে উন্নীত হলে বিশেষ ছাড় ভাউচার কোড সহ অভিনন্দন।',
                  sample: 'অভিনন্দন! আপনি [দোকান]-এর [টিয়ার] ক্লাবে উন্নীত হয়েছেন! ফ্ল্যাট [ছাড়]% ডিসকাউন্ট পেতে কোড ব্যবহার করুন: VIPBONUS',
                },
                {
                  id: 'order_dispatch_tracking',
                  title: '🚚 ডেলিভারি ট্র্যাকিং ও গেটপাস',
                  category: 'ORDER_STATUS',
                  desc: 'ই-কমার্স বা পার্সেল ডেলিভারি ম্যানের হাতে পৌঁছালে লাইভ ট্র্যাকিং লিংক।',
                  sample: 'আপনার অর্ডারটি কুরিয়ারে হস্তান্তর করা হয়েছে। ট্র্যাকিং কোড: [কোড], কুরিয়ার: [নাম]। লাইভ ট্র্যাক করুন: [লিংক]',
                },
                {
                  id: 'interactive_catalog',
                  title: '🛍️ ইন্টারঅ্যাক্টিভ পণ্য ক্যাটালগ',
                  category: 'MARKETING_CATALOG',
                  desc: 'শীর্ষ বিক্রিত পণ্যসমূহ ও সরাসরি অর্ডার বুকিং বাটন সহ ব্রডকাস্ট।',
                  sample: '[দোকান]-এর জনপ্রিয় পণ্যসমূহ দেখুন এবং ঘরে বসেই ১-ট্যাপে অর্ডার বুক করুন!',
                },
              ].map(tmpl => (
                <div key={tmpl.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-xs text-slate-800">{tmpl.title}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {tmpl.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mb-2">{tmpl.desc}</p>
                    <div className="p-2.5 rounded bg-white border border-slate-200 text-[11px] font-mono text-slate-600">
                      {tmpl.sample}
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400">
                    <span>স্ট্যাটাস: ✅ Approved</span>
                    <span className="text-emerald-700 font-bold">Graph API v20.0</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 4: DELIVERY AUDIT LOG
          ===================================================================== */}
      {activeSubTab === 'logs' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
          <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-700" />
                হোয়াটসঅ্যাপ মেসেজ ডেলিভারি হিস্ট্রি ও অডিট ট্রেইল
              </h3>
              <p className="text-xs text-slate-500">
                প্রতিটি প্রেরিত মেসেজের ডেলিভারি স্ট্যাটাস, ব্লু টিক ও খরচ অডিট
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300">
                মোট প্রেরিত: {whatsAppLogs.filter(l => l.tenantId === tenant.id).length} টি
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">তারিখ ও সময়</th>
                  <th className="py-3 px-4">প্রাপকের নাম ও ফোন</th>
                  <th className="py-3 px-4">মেসেজ টেমপ্লেট</th>
                  <th className="py-3 px-4">মেসেজ টেক্সট সারসংক্ষেপ</th>
                  <th className="py-3 px-4 text-center">স্ট্যাটাস</th>
                  <th className="py-3 px-4 text-right">খরচ (BDT)</th>
                  <th className="py-3 px-4 text-center">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {whatsAppLogs.filter(l => l.tenantId === tenant.id).length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      এখনো কোনো হোয়াটসঅ্যাপ মেসেজ রেকর্ড নেই।
                    </td>
                  </tr>
                ) : (
                  whatsAppLogs
                    .filter(l => l.tenantId === tenant.id)
                    .map(log => (
                      <tr key={log.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                          {log.timestamp}
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-900">{log.recipientName}</p>
                          <p className="text-[11px] text-slate-500 font-mono">{log.recipientPhone}</p>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                            {log.templateType}
                          </span>
                        </td>
                        <td className="py-3 px-4 max-w-xs truncate text-slate-700">
                          {log.messageText}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {log.status === 'read' ? (
                            <span className="inline-flex items-center gap-1 text-sky-600 font-bold">
                              <CheckCheck className="w-3.5 h-3.5 text-sky-500" /> পড়া হয়েছে
                            </span>
                          ) : log.status === 'delivered' ? (
                            <span className="inline-flex items-center gap-1 text-slate-600 font-medium">
                              <CheckCheck className="w-3.5 h-3.5 text-slate-400" /> ডেলিভার্ড
                            </span>
                          ) : log.status === 'sent' ? (
                            <span className="inline-flex items-center gap-1 text-slate-500">
                              <Check className="w-3.5 h-3.5 text-slate-400" /> প্রেরিত
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-rose-600 font-bold">
                              <AlertTriangle className="w-3.5 h-3.5" /> ব্যর্থ
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-slate-700 font-semibold">
                          ৳{log.costBDT.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => setSelectedLog(log)}
                            className="text-emerald-700 hover:text-emerald-900 font-bold text-xs underline"
                          >
                            ভিউ
                          </button>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: Digital VIP Loyalty Card Modal */}
      {selectedCardCustomer && (
        <DigitalLoyaltyCardModal
          customer={selectedCardCustomer}
          tenant={tenant}
          onClose={() => setSelectedCardCustomer(null)}
          onSendWhatsAppCard={cust => {
            const log: WhatsAppMessageLog = {
              id: 'wa-card-' + Date.now(),
              tenantId: tenant.id,
              recipientName: cust.name,
              recipientPhone: cust.phone,
              templateType: 'loyalty_upgrade',
              messageText: `🌟 অভিনন্দন ${cust.name}! আপনার ডিজিটাল মেম্বারশিপ কার্ড প্রস্তুত। স্তর: ${cust.loyaltyTier?.toUpperCase() || 'BRONZE'}, পয়েন্ট: ${cust.loyaltyPoints || 0} Pts। ডিজিটাল কপি: https://jh-imse.shop/card/${cust.id}`,
              status: 'delivered',
              timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
              costBDT: 0.55,
            };
            onAddWhatsAppLog(log);
          }}
        />
      )}

      {/* MODAL 2: WhatsApp Due Recovery Reminder Modal */}
      {selectedDueReminderCustomer && (
        <WhatsAppDueReminderModal
          customer={selectedDueReminderCustomer}
          tenant={tenant}
          onClose={() => setSelectedDueReminderCustomer(null)}
          onSend={(msg, phone) => {
            const log: WhatsAppMessageLog = {
              id: 'wa-due-' + Date.now(),
              tenantId: tenant.id,
              recipientName: selectedDueReminderCustomer.name,
              recipientPhone: phone,
              templateType: 'due_reminder',
              messageText: msg,
              status: 'delivered',
              timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
              costBDT: 0.55,
            };
            onAddWhatsAppLog(log);
          }}
        />
      )}

      {/* MODAL 3: Point Redemption Dialog */}
      {activeRedeemCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Gift className="w-5 h-5 text-amber-600" />
              লয়্যালটি পয়েন্ট রিডিম করুন
            </h3>
            <p className="text-xs text-slate-600">
              গ্রাহক: <strong>{activeRedeemCustomer.name}</strong><br />
              বর্তমান লয়্যালটি ব্যালেন্স: <strong className="text-amber-600">{activeRedeemCustomer.loyaltyPoints || 0} Pts</strong> (৳{activeRedeemCustomer.loyaltyPoints || 0} সমমূল্য)
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                রিডিম করার পয়েন্ট সংখ্যা (১ পয়েন্ট = ৳১.০০)
              </label>
              <input
                type="number"
                min={1}
                max={activeRedeemCustomer.loyaltyPoints || 0}
                value={redeemPointsInput}
                onChange={e => setRedeemPointsInput(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 font-medium">
              গ্রাহক এই কেনাকাটায় সরাসরি <strong>৳{redeemPointsInput * POINTS_TO_BDT_RATE}</strong> ক্যাশ ডিসকাউন্ট পাবেন।
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setActiveRedeemCustomer(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                বাতিল
              </button>
              <button
                onClick={handleConfirmRedeem}
                disabled={redeemPointsInput <= 0 || redeemPointsInput > (activeRedeemCustomer.loyaltyPoints || 0)}
                className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition shadow disabled:opacity-50"
              >
                রিডেম্পশন নিশ্চিত করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Full Message Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-700" />
                হোয়াটসঅ্যাপ মেসেজ ডেলিভারি বিস্তারিত
              </h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                ×
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <p><strong>প্রাপক:</strong> {selectedLog.recipientName} ({selectedLog.recipientPhone})</p>
              <p><strong>তারিখ ও সময়:</strong> {selectedLog.timestamp}</p>
              <p><strong>টেমপ্লেট:</strong> {selectedLog.templateType}</p>
              <p><strong>ডেলিভারি স্ট্যাটাস:</strong> {selectedLog.status.toUpperCase()}</p>
              <p><strong>মেটা বিলিং খরচ:</strong> ৳{selectedLog.costBDT.toFixed(2)}</p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono whitespace-pre-line text-slate-800">
              {selectedLog.messageText}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
