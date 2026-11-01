import React, { useState } from 'react';
import { 
  Globe, RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck, Key,
  ExternalLink, Play, Plus, Trash2, Edit2, Copy, Check, Server,
  Database, Download, Upload, ShieldAlert, Smartphone, Monitor,
  HardDrive, Activity, Clock, Layers, FileCode, CheckSquare, Square,
  Zap, ArrowRightLeft, Lock, UserX, Cpu, Radio, ChevronRight, ChevronDown
} from 'lucide-react';
import { 
  Tenant, QuickBooksConfig, WooCommerceConfig, OutboundWebhook,
  WebhookDeliveryLog, ActiveUserSession, SystemHealthMetrics,
  DatabaseBackupArchive, BackupScheduleConfig, WebhookEvent
} from '../../types';
import { CreateWebhookModal } from './CreateWebhookModal';
import { TestWebhookModal } from './TestWebhookModal';
import { RestoreBackupConfirmModal } from './RestoreBackupConfirmModal';

interface EnterpriseIntegrationsAndSecurityHubProps {
  tenant: Tenant;
  quickBooksConfig: QuickBooksConfig;
  onUpdateQuickBooksConfig: (config: QuickBooksConfig) => void;
  wooCommerceConfig: WooCommerceConfig;
  onUpdateWooCommerceConfig: (config: WooCommerceConfig) => void;
  outboundWebhooks: OutboundWebhook[];
  onSaveWebhook: (webhook: OutboundWebhook) => void;
  onDeleteWebhook: (webhookId: string) => void;
  webhookDeliveryLogs: WebhookDeliveryLog[];
  onAddWebhookDeliveryLog: (log: WebhookDeliveryLog) => void;
  activeSessions: ActiveUserSession[];
  onRevokeSession: (sessionId: string) => void;
  onTerminateAllOtherSessions: (currentUserId: string) => void;
  systemHealth: SystemHealthMetrics;
  backupArchives: DatabaseBackupArchive[];
  onCreateBackup: (type: 'manual' | 'automated', format: 'sql' | 'json', notes?: string) => void;
  onRestoreBackup: (archiveId: string) => void;
  onDeleteBackup: (archiveId: string) => void;
  backupSchedule: BackupScheduleConfig;
  onUpdateBackupSchedule: (schedule: BackupScheduleConfig) => void;
  initialTab?: 'quickbooks' | 'woocommerce' | 'webhooks' | 'sessions' | 'system_health';
}

export const EnterpriseIntegrationsAndSecurityHub: React.FC<EnterpriseIntegrationsAndSecurityHubProps> = ({
  tenant,
  quickBooksConfig,
  onUpdateQuickBooksConfig,
  wooCommerceConfig,
  onUpdateWooCommerceConfig,
  outboundWebhooks,
  onSaveWebhook,
  onDeleteWebhook,
  webhookDeliveryLogs,
  onAddWebhookDeliveryLog,
  activeSessions,
  onRevokeSession,
  onTerminateAllOtherSessions,
  systemHealth,
  backupArchives,
  onCreateBackup,
  onRestoreBackup,
  onDeleteBackup,
  backupSchedule,
  onUpdateBackupSchedule,
  initialTab = 'quickbooks',
}) => {
  const [activeTab, setActiveTab] = useState<'quickbooks' | 'woocommerce' | 'webhooks' | 'sessions' | 'system_health'>(initialTab);

  // Modals state
  const [isCreateWebhookOpen, setIsCreateWebhookOpen] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<OutboundWebhook | null>(null);
  const [testingWebhook, setTestingWebhook] = useState<OutboundWebhook | null>(null);
  const [restoringArchive, setRestoringArchive] = useState<DatabaseBackupArchive | null>(null);
  const [viewingPayloadLog, setViewingPayloadLog] = useState<WebhookDeliveryLog | null>(null);

  // Notifications / Feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isQboSyncing, setIsQboSyncing] = useState(false);
  const [isWooSyncing, setIsWooSyncing] = useState(false);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Form states
  const [qboState, setQboState] = useState<QuickBooksConfig>(quickBooksConfig);
  const [wooState, setWooState] = useState<WooCommerceConfig>(wooCommerceConfig);
  const [scheduleState, setScheduleState] = useState<BackupScheduleConfig>(backupSchedule);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const copyText = (text: string, key: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedUrl(key);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  // QuickBooks Handlers
  const handleToggleQboConnect = () => {
    const updated: QuickBooksConfig = {
      ...qboState,
      isConnected: !qboState.isConnected,
      syncStatus: !qboState.isConnected ? 'success' : 'idle',
      lastSyncTime: !qboState.isConnected ? new Date().toISOString().replace('T', ' ').slice(0, 19) : qboState.lastSyncTime,
    };
    setQboState(updated);
    onUpdateQuickBooksConfig(updated);
    showToast(updated.isConnected ? 'QuickBooks Online সফলভাবে কানেক্ট হয়েছে!' : 'QuickBooks সংযোগ বিচ্ছিন্ন করা হয়েছে।');
  };

  const handleQboSyncNow = () => {
    if (!qboState.isConnected) {
      showToast('আগে QuickBooks কানেক্ট করুন!');
      return;
    }
    setIsQboSyncing(true);
    setTimeout(() => {
      setIsQboSyncing(false);
      const newLog = {
        id: 'qbo-log-' + Date.now(),
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        action: 'MANUAL_FULL_SYNC',
        entity: 'Invoice' as const,
        status: 'success' as const,
        details: 'সকল অনুমোদিত ইনভয়েস, গ্রাহক ও পেমেন্ট QuickBooks Online-এ সফলভাবে সিঙ্ক সম্পন্ন হয়েছে।',
      };
      const updated: QuickBooksConfig = {
        ...qboState,
        lastSyncTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
        syncStatus: 'success',
        logs: [newLog, ...qboState.logs],
      };
      setQboState(updated);
      onUpdateQuickBooksConfig(updated);
      showToast('QuickBooks 2-Way Sync সফলভাবে সমাপ্ত হয়েছে!');
    }, 1200);
  };

  // WooCommerce Handlers
  const handleWooTestConnection = () => {
    setIsWooSyncing(true);
    setTimeout(() => {
      setIsWooSyncing(false);
      showToast(`WooCommerce API পিং সফল (HTTP 200 OK) • স্টোর: ${wooState.storeUrl}`);
    }, 800);
  };

  const handleWooPushCatalog = () => {
    setIsWooSyncing(true);
    setTimeout(() => {
      setIsWooSyncing(false);
      const newLog = {
        id: 'woo-log-' + Date.now(),
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        direction: 'push' as const,
        entity: 'product' as const,
        status: 'success' as const,
        message: `${tenant.usage?.currentProducts || 1420} টি পণ্যের দাম ও স্টক WooCommerce-এ সফলভাবে পুশ হয়েছে।`,
        recordsCount: tenant.usage?.currentProducts || 1420,
      };
      const updated: WooCommerceConfig = {
        ...wooState,
        lastSyncTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
        logs: [newLog, ...wooState.logs],
      };
      setWooState(updated);
      onUpdateWooCommerceConfig(updated);
      showToast('WooCommerce ক্যাটালগ ও স্টক রিয়েল-টাইমে আপডেট হয়েছে!');
    }, 1100);
  };

  const handleWooPullOrders = () => {
    setIsWooSyncing(true);
    setTimeout(() => {
      setIsWooSyncing(false);
      const newLog = {
        id: 'woo-log-' + Date.now(),
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        direction: 'pull' as const,
        entity: 'order' as const,
        status: 'success' as const,
        message: 'WooCommerce থেকে ৩টি নতুন অনলাইন অর্ডার সফলভাবে ইমপোর্ট হয়েছে।',
        recordsCount: 3,
      };
      const updated: WooCommerceConfig = {
        ...wooState,
        totalPendingOrders: 0,
        logs: [newLog, ...wooState.logs],
      };
      setWooState(updated);
      onUpdateWooCommerceConfig(updated);
      showToast('WooCommerce থেকে নতুন অর্ডার সফলভাবে সিঙ্ক হয়েছে!');
    }, 1000);
  };

  // Backup Trigger
  const handleCreateInstantBackup = (format: 'sql' | 'json') => {
    setIsCreatingBackup(true);
    setTimeout(() => {
      setIsCreatingBackup(false);
      onCreateBackup('manual', format, 'ব্যবহারকারী কর্তৃক ম্যানুয়াল ফুল ব্যাকআপ তৈরি');
      showToast(`ডাটাবেজের পূর্ণাঙ্গ ${format.toUpperCase()} ব্যাকআপ সফলভাবে সংরক্ষিত হয়েছে!`);
    }, 900);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-purple-500/50 flex items-center gap-3 animate-in slide-in-from-top-3 duration-200 text-xs font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-purple-500/10 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-200 text-[10px] font-bold tracking-wider uppercase font-mono">
                Phase 25 • Enterprise Architecture
              </span>
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Cloud Sync
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight">
              এন্টারপ্রাইজ ইন্টিগ্রেশন, ক্লাউড সিঙ্ক ও সিকিউরিটি হাব
            </h2>
            <p className="text-xs text-purple-200 mt-1 max-w-2xl leading-relaxed">
              QuickBooks Online দ্বিমুখী সিঙ্ক, WooCommerce ক্যাটালগ পুশ/পুল, HMAC সিকিউরড আউটবাউন্ড ওয়েবহুকস, রিমোট সেশন লগআউট এবং অটোমেটেড ডাটাবেজ ব্যাকআপ ইঞ্জিন।
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('system_health')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer backdrop-blur-xs"
            >
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>সিস্টেম হেলথ ({systemHealth.dbLatencyMs}ms)</span>
            </button>
          </div>
        </div>

        {/* Quick Highlights Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-5 pt-4 border-t border-white/10 text-xs">
          <div className="bg-white/5 rounded-2xl p-3 border border-white/10 backdrop-blur-xs">
            <span className="text-[10px] text-purple-300 block font-medium">QuickBooks Online</span>
            <div className="font-bold flex items-center gap-1.5 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${qboState.isConnected ? 'bg-emerald-400' : 'bg-slate-400'}`} />
              <span>{qboState.isConnected ? 'সংযুক্ত (Connected)' : 'সংযোগ বিচ্ছিন্ন'}</span>
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-3 border border-white/10 backdrop-blur-xs">
            <span className="text-[10px] text-purple-300 block font-medium">WooCommerce API</span>
            <div className="font-bold flex items-center gap-1.5 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${wooState.isConnected ? 'bg-emerald-400' : 'bg-slate-400'}`} />
              <span>{wooState.totalSyncedProducts} পণ্য সিঙ্কড</span>
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-3 border border-white/10 backdrop-blur-xs">
            <span className="text-[10px] text-purple-300 block font-medium">Webhooks Hub</span>
            <div className="font-bold flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              <span>{outboundWebhooks.filter(w => w.isActive).length} টি সক্রিয় এন্ডপয়েন্ট</span>
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-3 border border-white/10 backdrop-blur-xs">
            <span className="text-[10px] text-purple-300 block font-medium">সক্রিয় ডিভাইস সেশন</span>
            <div className="font-bold flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{activeSessions.length} টি সেশন লাইভ</span>
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-3 border border-white/10 backdrop-blur-xs col-span-2 md:col-span-1">
            <span className="text-[10px] text-purple-300 block font-medium">ডাটাবেজ ও ক্লাউড ব্যাকআপ</span>
            <div className="font-bold flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span>{backupArchives.length} টি সংরক্ষিত আর্কাইভ</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200">
        {[
          { id: 'quickbooks', label: 'কুইকবুকস সিঙ্ক (QuickBooks)', icon: Zap },
          { id: 'woocommerce', label: 'উ-কমার্স ইন্টিগ্রেশন (WooCommerce)', icon: Globe },
          { id: 'webhooks', label: 'আউটবাউন্ড ওয়েবহুকস (Webhooks Hub)', icon: ArrowRightLeft },
          { id: 'sessions', label: 'ডিভাইস ও সেশন কন্ট্রোল (Security)', icon: Monitor },
          { id: 'system_health', label: 'সিস্টেম হেলথ ও ক্লাউড ব্যাকআপ', icon: Database },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-2xl font-bold text-xs transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-purple-700 text-white shadow-sm shadow-purple-900/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* TAB 1: QUICKBOOKS ONLINE SYNC                             */}
      {/* ======================================================== */}
      {activeTab === 'quickbooks' && (
        <div className="space-y-6">
          {/* Connection Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#2CA01C]/10 border border-[#2CA01C]/20 flex items-center justify-center font-black text-[#2CA01C] text-lg">
                  qb
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-slate-900">Intuit QuickBooks Online Cloud Sync</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      qboState.isConnected ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {qboState.isConnected ? 'সক্রিয় সংযোগ (Active OAuth 2.0)' : 'সংযুক্ত নয় (Disconnected)'}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-mono">
                      {qboState.environment.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    JH IMSE ইনভয়েস, পেমেন্ট এবং চার্ট অফ অ্যাকাউন্টস সরাসরি QuickBooks লেজারে পোস্ট করে।
                  </p>
                  {qboState.lastSyncTime && (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1 font-mono">
                      <Clock className="w-3 h-3" />
                      <span>সর্বশেষ সিঙ্ক: {qboState.lastSyncTime}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleQboSyncNow}
                  disabled={!qboState.isConnected || isQboSyncing}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 cursor-pointer ${
                    qboState.isConnected && !isQboSyncing
                      ? 'bg-purple-700 hover:bg-purple-800 text-white shadow-md shadow-purple-900/20'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isQboSyncing ? 'animate-spin' : ''}`} />
                  <span>{isQboSyncing ? 'সিঙ্ক হচ্ছে...' : 'এখনই সিঙ্ক করুন (Sync Now)'}</span>
                </button>

                <button
                  onClick={handleToggleQboConnect}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs transition border cursor-pointer ${
                    qboState.isConnected
                      ? 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                      : 'border-[#2CA01C] bg-[#2CA01C] text-white hover:bg-[#238116]'
                  }`}
                >
                  {qboState.isConnected ? 'ডিসকানেক্ট করুন' : 'Connect to QuickBooks'}
                </button>
              </div>
            </div>

            {/* Config Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">কোম্পানি রিয়েলম আইডি (Company Realm ID)</label>
                <input
                  type="text"
                  value={qboState.realmId}
                  onChange={e => setQboState({ ...qboState, realmId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">ক্লায়েন্ট আইডি (OAuth2 Client ID)</label>
                <input
                  type="text"
                  value={qboState.clientId}
                  onChange={e => setQboState({ ...qboState, clientId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">এনভায়রনমেন্ট (Environment)</label>
                <select
                  value={qboState.environment}
                  onChange={e => setQboState({ ...qboState, environment: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs focus:bg-white focus:outline-none"
                >
                  <option value="production">Production (লাইভ একাউন্ট)</option>
                  <option value="sandbox">Sandbox (টেস্টিং মোড)</option>
                </select>
              </div>
            </div>

            {/* Sync Entities Toggles */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <h4 className="font-bold text-xs text-slate-900 mb-3">সিঙ্ক করার জন্য প্রযোজ্য মডিউলসমূহ:</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  { key: 'invoices', label: 'বিক্রয় ইনভয়েস (Invoices)' },
                  { key: 'customers', label: 'গ্রাহক তথ্য (Customers)' },
                  { key: 'products', label: 'পণ্য ক্যাটালগ (Items)' },
                  { key: 'payments', label: 'পেমেন্ট রসিদ (Payments)' },
                  { key: 'expenses', label: 'খরচের ভাউচার (Expenses)' },
                ].map(item => {
                  const isChecked = (qboState.syncItems as any)[item.key];
                  return (
                    <div
                      key={item.key}
                      onClick={() => {
                        const updated = {
                          ...qboState,
                          syncItems: {
                            ...qboState.syncItems,
                            [item.key]: !isChecked,
                          },
                        };
                        setQboState(updated);
                        onUpdateQuickBooksConfig(updated);
                      }}
                      className={`p-3 rounded-xl border transition cursor-pointer flex items-center gap-2.5 ${
                        isChecked ? 'bg-purple-50/70 border-purple-300' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="text-purple-700">
                        {isChecked ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-300" />}
                      </div>
                      <span className="font-bold text-slate-800 text-xs">{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Chart of Accounts Mapping Card */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <h4 className="font-bold text-xs text-slate-900 mb-2">QuickBooks চার্ট অফ অ্যাকাউন্টস ম্যাপিং (Account Mapping):</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold block">SALES INCOME ACCOUNT</span>
                  <div className="font-bold text-slate-800">{qboState.accountMappings.salesIncomeAccountName}</div>
                  <span className="text-[10px] text-purple-700 font-mono">QBO ID: {qboState.accountMappings.salesIncomeAccountId}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold block">BANK DEPOSIT ACCOUNT</span>
                  <div className="font-bold text-slate-800">{qboState.accountMappings.bankDepositAccountName}</div>
                  <span className="text-[10px] text-purple-700 font-mono">QBO ID: {qboState.accountMappings.bankDepositAccountId}</span>
                </div>
              </div>
            </div>
          </div>

          {/* QuickBooks Sync Logs */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
            <h3 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-700" />
              <span>QuickBooks ক্লাউড সিঙ্ক লগ ও অডিট ট্রেইল</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] border-b border-slate-100">
                  <tr>
                    <th className="py-2.5 px-3">সময়</th>
                    <th className="py-2.5 px-3">এনটিটি</th>
                    <th className="py-2.5 px-3">অ্যাকশন</th>
                    <th className="py-2.5 px-3">স্ট্যাটাস</th>
                    <th className="py-2.5 px-3">বিস্তারিত বিবরণ</th>
                    <th className="py-2.5 px-3">QBO ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {qboState.logs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/70">
                      <td className="py-2 px-3 font-mono text-[11px] whitespace-nowrap">{log.timestamp}</td>
                      <td className="py-2 px-3 font-bold text-slate-900">{log.entity}</td>
                      <td className="py-2 px-3 font-mono text-[11px] text-purple-800">{log.action}</td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          log.status === 'success'
                            ? 'bg-emerald-100 text-emerald-800'
                            : log.status === 'skipped'
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {log.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-2 px-3">{log.details}</td>
                      <td className="py-2 px-3 font-mono text-[11px] text-slate-500">{log.externalId || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: WOOCOMMERCE REST API INTEGRATION                  */}
      {/* ======================================================== */}
      {activeTab === 'woocommerce' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#96588a]/10 border border-[#96588a]/20 flex items-center justify-center font-black text-[#96588a] text-lg">
                  woo
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-slate-900">WooCommerce REST API & Stock Push/Pull</h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                      REST API {wooState.apiVersion}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    ওয়ার্ডপ্রেস ওয়েবসাইটের সাথে ইনভেন্টরি, মূল্য ও অনলাইন অর্ডার রিয়েল-টাইমে সিঙ্ক রাখুন।
                  </p>
                  {wooState.lastSyncTime && (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1 font-mono">
                      <Clock className="w-3 h-3" />
                      <span>সর্বশেষ সিঙ্ক: {wooState.lastSyncTime}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleWooTestConnection}
                  disabled={isWooSyncing}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <Activity className="w-3.5 h-3.5 text-purple-700" />
                  <span>API টেস্ট পিং</span>
                </button>
                <button
                  onClick={handleWooPushCatalog}
                  disabled={isWooSyncing}
                  className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold text-xs transition shadow-md shadow-purple-900/20 cursor-pointer flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>ক্যাটালগ পুশ করুন ({tenant.usage?.currentProducts || 1420})</span>
                </button>
                <button
                  onClick={handleWooPullOrders}
                  disabled={isWooSyncing}
                  className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl font-bold text-xs transition shadow-md shadow-indigo-900/20 cursor-pointer flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>অর্ডার সিঙ্ক করুন</span>
                </button>
              </div>
            </div>

            {/* Connection Credentials */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">স্টোর ইউআরএল (Store URL) *</label>
                <input
                  type="url"
                  value={wooState.storeUrl}
                  onChange={e => setWooState({ ...wooState, storeUrl: e.target.value })}
                  placeholder="https://mystore.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">কনজিউমার কি (Consumer Key - ck_...)</label>
                <input
                  type="text"
                  value={wooState.consumerKey}
                  onChange={e => setWooState({ ...wooState, consumerKey: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">কনজিউমার সিক্রেট (Consumer Secret - cs_...)</label>
                <input
                  type="password"
                  value={wooState.consumerSecret}
                  onChange={e => setWooState({ ...wooState, consumerSecret: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {/* Automation Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 pt-5 border-t border-slate-100 text-xs">
              <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">পিওএস বিক্রয়ের সাথে অটো-স্টক সিঙ্ক (Auto-Sync on POS Sale)</span>
                  <input
                    type="checkbox"
                    checked={wooState.autoSyncOnSale}
                    onChange={e => {
                      const updated = { ...wooState, autoSyncOnSale: e.target.checked };
                      setWooState(updated);
                      onUpdateWooCommerceConfig(updated);
                    }}
                    className="w-4 h-4 text-purple-600 rounded cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  কাউন্টার বা ফিজিক্যাল দোকানে পণ্য বিক্রি হওয়ার সাথে সাথেই WooCommerce ওয়েবসাইটে স্টক আপডেট হবে।
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">সিঙ্কের দিক (Sync Direction)</span>
                  <select
                    value={wooState.syncDirection}
                    onChange={e => {
                      const updated = { ...wooState, syncDirection: e.target.value as any };
                      setWooState(updated);
                      onUpdateWooCommerceConfig(updated);
                    }}
                    className="px-2 py-1 bg-white border border-slate-300 rounded-lg font-bold text-xs"
                  >
                    <option value="two_way">দ্বিমুখী (Two-way Bi-directional)</option>
                    <option value="erp_to_woo">শুধুমাত্র ERP থেকে WooCommerce-এ</option>
                    <option value="woo_to_erp">শুধুমাত্র WooCommerce থেকে ERP-তে</option>
                  </select>
                </div>
                <p className="text-[11px] text-slate-500">
                  ইনভেন্টরি স্টক ও দামের মাস্টার ডেটাসোর্স নির্ধারণ করুন।
                </p>
              </div>
            </div>

            {/* Webhook Listener URL */}
            <div className="mt-5 p-4 bg-slate-900 text-white rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-purple-300 flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                  WooCommerce Webhook Listener Endpoint (আপনার ওয়ার্ডপ্রেসে যোগ করুন):
                </span>
                <button
                  type="button"
                  onClick={() => copyText(wooState.webhookListenerUrl, 'woo_wh')}
                  className="text-xs font-bold text-purple-300 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  {copiedUrl === 'woo_wh' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedUrl === 'woo_wh' ? 'কপি হয়েছে' : 'কপি করুন'}
                </button>
              </div>
              <div className="font-mono text-xs text-emerald-400 bg-slate-800/80 p-2.5 rounded-xl break-all">
                {wooState.webhookListenerUrl}
              </div>
            </div>
          </div>

          {/* WooCommerce Sync Logs */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
            <h3 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-700" />
              <span>WooCommerce ডেটাবেজ কার্যকলাপ ও সিঙ্ক লগ</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] border-b border-slate-100">
                  <tr>
                    <th className="py-2.5 px-3">সময়</th>
                    <th className="py-2.5 px-3">দিক (Direction)</th>
                    <th className="py-2.5 px-3">মডিউল</th>
                    <th className="py-2.5 px-3">স্ট্যাটাস</th>
                    <th className="py-2.5 px-3">মেসেজ</th>
                    <th className="py-2.5 px-3">রেকর্ড সংখ্যা</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {wooState.logs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/70">
                      <td className="py-2 px-3 font-mono text-[11px] whitespace-nowrap">{log.timestamp}</td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.direction === 'push' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {log.direction.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-bold text-slate-900 uppercase">{log.entity}</td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          log.status === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {log.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-2 px-3">{log.message}</td>
                      <td className="py-2 px-3 font-mono font-bold text-purple-800">{log.recordsCount ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: OUTBOUND WEBHOOKS ENGINE (Webhooks Hub)           */}
      {/* ======================================================== */}
      {activeTab === 'webhooks' && (
        <div className="space-y-6">
          {/* Header & Add Button */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-base text-slate-900">আউটবাউন্ড ওয়েবহুকস হাব (Outbound Webhooks)</h3>
              <p className="text-xs text-slate-500">
                যেকোনো সিস্টেম ইভেন্টে থার্ড-পার্টি কুরিয়ার, টেলিগ্রাম বা এক্সটার্নাল CRM-এ HMAC-SHA256 সাইন্ড ডাটা পাঠান।
              </p>
            </div>

            <button
              onClick={() => { setEditingWebhook(null); setIsCreateWebhookOpen(true); }}
              className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold text-xs transition shadow-md shadow-purple-900/20 cursor-pointer flex items-center gap-1.5 self-start md:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন ওয়েবহুক যোগ করুন</span>
            </button>
          </div>

          {/* Webhooks Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {outboundWebhooks.map(wh => (
              <div key={wh.id} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900">{wh.name}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          wh.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {wh.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </div>
                      <div className="font-mono text-[11px] text-purple-700 break-all mt-1">
                        {wh.targetUrl}
                      </div>
                    </div>
                  </div>

                  {wh.description && (
                    <p className="text-[11px] text-slate-500">{wh.description}</p>
                  )}

                  {/* Events Badges */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {wh.events.map(ev => (
                      <span key={ev} className="px-2 py-0.5 bg-purple-50 text-purple-800 border border-purple-200 rounded-md font-mono text-[10px] font-bold">
                        {ev}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
                    <span className="text-emerald-700 font-bold">✓ {wh.successCount} প্রেরিত</span>
                    {wh.failureCount > 0 && (
                      <span className="text-rose-600 font-bold">✗ {wh.failureCount} ব্যর্থ</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setTestingWebhook(wh)}
                      className="px-2.5 py-1 bg-purple-100 hover:bg-purple-200 text-purple-900 rounded-lg font-bold text-[11px] transition flex items-center gap-1 cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-purple-900" />
                      <span>টেস্ট পিং</span>
                    </button>
                    <button
                      onClick={() => { setEditingWebhook(wh); setIsCreateWebhookOpen(true); }}
                      className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-900 transition cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteWebhook(wh.id)}
                      className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Webhook Delivery Logs Table */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
            <h3 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-700" />
              <span>আউটবাউন্ড ওয়েবহুক ডেলিভারি হিস্টোরি ও HMAC সিগনেচার লগ</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] border-b border-slate-100">
                  <tr>
                    <th className="py-2.5 px-3">সময়</th>
                    <th className="py-2.5 px-3">ওয়েবহুকের নাম</th>
                    <th className="py-2.5 px-3">ইভেন্ট</th>
                    <th className="py-2.5 px-3">HTTP স্ট্যাটাস</th>
                    <th className="py-2.5 px-3">লেটেন্সি</th>
                    <th className="py-2.5 px-3">টার্গেট ইউআরএল</th>
                    <th className="py-2.5 px-3 text-right">পে-লোড</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {webhookDeliveryLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/70">
                      <td className="py-2 px-3 font-mono text-[11px] whitespace-nowrap">{log.attemptedAt}</td>
                      <td className="py-2 px-3 font-bold text-slate-900">{log.webhookName}</td>
                      <td className="py-2 px-3 font-mono text-[11px] text-purple-800">{log.event}</td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                          log.responseStatus >= 200 && log.responseStatus < 300
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          HTTP {log.responseStatus}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-500">{log.latencyMs} ms</td>
                      <td className="py-2 px-3 font-mono text-[11px] text-slate-400 max-w-[200px] truncate">{log.targetUrl}</td>
                      <td className="py-2 px-3 text-right">
                        <button
                          onClick={() => setViewingPayloadLog(log)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-bold text-[11px] transition cursor-pointer"
                        >
                          Payload
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: LOGIN DEVICE & SESSION CONTROL (Security Hub)     */}
      {/* ======================================================== */}
      {activeTab === 'sessions' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-purple-700" />
                  <span>সক্রিয় লগইন সেশন ও রিমোট ডিভাইস কন্ট্রোল</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  যেসব কম্পিউটার, মোবাইল বা সানমি পিওএস টার্মিনালে কর্মীরা লগইন আছেন তাদের তালিকা ও এক ক্লিকে দূরবর্তী সেশন বাতিল।
                </p>
              </div>

              <button
                onClick={() => {
                  onTerminateAllOtherSessions('usr-1');
                  showToast('আপনার বর্তমান ডিভাইস ছাড়া অন্য সকল সেশন সফলভাবে লগআউট করা হয়েছে!');
                }}
                className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-xl font-bold text-xs transition flex items-center gap-1.5 cursor-pointer self-start md:self-auto"
              >
                <UserX className="w-4 h-4" />
                <span>অন্য সব সেশন লগআউট করুন (Terminate All Others)</span>
              </button>
            </div>

            {/* Sessions Table */}
            <div className="overflow-x-auto pt-4">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] border-b border-slate-100">
                  <tr>
                    <th className="py-2.5 px-3">ব্যবহারকারী (User)</th>
                    <th className="py-2.5 px-3">ডিভাইস ও ওএস</th>
                    <th className="py-2.5 px-3">আইপি এড্রেস</th>
                    <th className="py-2.5 px-3">অবস্থান (City)</th>
                    <th className="py-2.5 px-3">সক্রিয় অবস্থা</th>
                    <th className="py-2.5 px-3 text-right">পদক্ষেপ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {activeSessions.map(sess => (
                    <tr key={sess.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <span>{sess.userName}</span>
                          {sess.isCurrentSession && (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[9px]">
                              Current Device
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 capitalize">{sess.userRole} • {sess.userEmail}</span>
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          {sess.deviceType === 'pos_terminal' ? (
                            <HardDrive className="w-4 h-4 text-purple-600 shrink-0" />
                          ) : sess.deviceType === 'mobile' ? (
                            <Smartphone className="w-4 h-4 text-blue-600 shrink-0" />
                          ) : (
                            <Monitor className="w-4 h-4 text-slate-600 shrink-0" />
                          )}
                          <span className="font-medium text-slate-800">{sess.devicePlatform}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3 font-mono text-[11px] text-purple-900 font-semibold">{sess.ipAddress}</td>
                      <td className="py-3 px-3">{sess.location}</td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-500">{sess.lastActive}</td>

                      <td className="py-3 px-3 text-right">
                        {sess.isCurrentSession ? (
                          <span className="text-[11px] font-bold text-slate-400">এই সেশন সক্রিয়</span>
                        ) : (
                          <button
                            onClick={() => {
                              onRevokeSession(sess.id);
                              showToast(`সেশন ${sess.userName} (${sess.devicePlatform}) বাতিল করা হয়েছে।`);
                            }}
                            className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-bold text-[11px] transition cursor-pointer"
                          >
                            সেশন রিভোক
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Security Policies */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <h4 className="font-bold text-xs text-slate-900 mb-3">ডিভাইস ও সেশন পলিসি কনফিগারেশন:</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-800 block">সর্বোচ্চ একই সময়ে সেশন (Max Sessions):</span>
                  <select className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-bold">
                    <option value="1">১টি সেশন (কঠোর নিরাপত্তা)</option>
                    <option value="3" selected>৩টি সেশন (প্রস্তাবিত)</option>
                    <option value="5">৫টি সেশন</option>
                  </select>
                  <p className="text-[10px] text-slate-400">নতুন ডিভাইসে লগইন করলে পুরনোটি অটো-লগআউট হবে।</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-800 block">নিষ্ক্রিয়তায় অটো-লগআউট (Session Timeout):</span>
                  <select className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-bold">
                    <option value="15">১৫ মিনিট</option>
                    <option value="30" selected>৩০ মিনিট</option>
                    <option value="120">২ ঘণ্টা</option>
                    <option value="480">৮ ঘণ্টা</option>
                  </select>
                  <p className="text-[10px] text-slate-400">অব্যবহৃত থাকলে স্বয়ংক্রিয়ভাবে ক্যাশিয়ার প্যানেল লক হবে।</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-800 block">নতুন ডিভাইসে 2FA ওটিপি ভেরিফিকেশন:</span>
                  <div className="flex items-center gap-2 pt-1">
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-purple-600 rounded cursor-pointer" />
                    <span className="font-medium text-slate-700">SMS / ইমেইল OTP বাধ্যতামূলক</span>
                  </div>
                  <p className="text-[10px] text-slate-400">অপরিচিত আইপি থেকে লগইনে মালিকের ফোনে এসএমএস যাবে।</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: SYSTEM TELEMETRY & CLOUD BACKUP ENGINE            */}
      {/* ======================================================== */}
      {activeTab === 'system_health' && (
        <div className="space-y-6">
          {/* Telemetry Dashboard */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <Server className="w-5 h-5 text-purple-700" />
                  <span>সিস্টেম হেলথ ও সার্ভার রিয়েল-টাইম টেলিমেট্রি</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Hostinger Cloud MySQL 8.0 ডাটাবেজ পারফরম্যান্স ও সার্ভার রিসোর্স স্ট্যাটাস।
                </p>
              </div>

              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-xs flex items-center gap-1.5 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Database Online ({systemHealth.dbLatencyMs} ms)
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-5">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">ডাটাবেজ ইঞ্জিন</span>
                <span className="font-bold text-xs text-slate-900 mt-1 block truncate">{systemHealth.dbEngine}</span>
                <span className="text-[10px] text-purple-700 font-mono mt-0.5 block">Uptime: {systemHealth.dbUptime}</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">স্টোরেজ কোটা ব্যবহার</span>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="font-bold text-base text-slate-900">{(systemHealth.storageUsedMb / 1024).toFixed(2)} GB</span>
                  <span className="text-[11px] text-slate-500">/ 10.00 GB</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div
                    className="bg-purple-600 h-full rounded-full"
                    style={{ width: `${(systemHealth.storageUsedMb / systemHealth.storageTotalMb) * 100}%` }}
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">মেমোরি (RAM) লোড</span>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="font-bold text-base text-slate-900">{systemHealth.ramLoadPercent}%</span>
                  <span className="text-[11px] text-emerald-600 font-bold">Optimal</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${systemHealth.ramLoadPercent}%` }} />
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">CPU প্রসেসর লোড</span>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="font-bold text-base text-slate-900">{systemHealth.cpuLoadPercent}%</span>
                  <span className="text-[11px] text-purple-700 font-mono">{systemHealth.activeConnections} Connections</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div className="bg-purple-700 h-full rounded-full" style={{ width: `${systemHealth.cpuLoadPercent}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Cloud Backup Generator & Archive List */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <Database className="w-5 h-5 text-purple-700" />
                  <span>ক্লাউড ব্যাকআপ ও ডেটা পুনরুদ্ধার ইঞ্জিন (Database Backups)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  ১-ক্লিকে ফুল ডাটাবেজ ব্যাকআপ তৈরি করুন অথবা পূর্বের যেকোনো স্ন্যাপশট থেকে ইনস্ট্যান্ট রিস্টোর করুন।
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCreateInstantBackup('sql')}
                  disabled={isCreatingBackup}
                  className="px-4 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-purple-900/20 cursor-pointer"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>{isCreatingBackup ? 'ব্যাকআপ তৈরি হচ্ছে...' : 'SQL ব্যাকআপ তৈরি (.sql.gz)'}</span>
                </button>
                <button
                  onClick={() => handleCreateInstantBackup('json')}
                  disabled={isCreatingBackup}
                  className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <FileCode className="w-3.5 h-3.5 text-purple-700" />
                  <span>JSON এক্সপোর্ট</span>
                </button>
              </div>
            </div>

            {/* Archives Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] border-b border-slate-100">
                  <tr>
                    <th className="py-2.5 px-3">ফাইল নেম (Archive Name)</th>
                    <th className="py-2.5 px-3">সাইজ</th>
                    <th className="py-2.5 px-3">টাইপ</th>
                    <th className="py-2.5 px-3">তৈরির তারিখ ও সময়</th>
                    <th className="py-2.5 px-3">তৈরি করেছেন</th>
                    <th className="py-2.5 px-3 text-right">পদক্ষেপ (Actions)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {backupArchives.map(arc => (
                    <tr key={arc.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-3">
                        <div className="font-mono font-bold text-slate-900 flex items-center gap-1.5">
                          <Database className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                          <span>{arc.fileName}</span>
                        </div>
                        {arc.notes && <span className="text-[10px] text-slate-400 font-sans">{arc.notes}</span>}
                      </td>

                      <td className="py-3 px-3 font-mono font-bold text-purple-800">{arc.fileSizeFormatted}</td>

                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          arc.backupType === 'automated'
                            ? 'bg-blue-100 text-blue-800'
                            : arc.backupType === 'pre_update'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {arc.backupType.toUpperCase()}
                        </span>
                      </td>

                      <td className="py-3 px-3 font-mono text-[11px] whitespace-nowrap">{arc.createdAt}</td>
                      <td className="py-3 px-3">{arc.createdBy}</td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => showToast(`ডাউনলোড শুরু হয়েছে: ${arc.fileName}`)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 transition cursor-pointer"
                            title="আর্কাইভ ডাউনলোড করুন"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setRestoringArchive(arc)}
                            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg font-bold text-[11px] transition cursor-pointer flex items-center gap-1"
                            title="এই ব্যাকআপ রিস্টোর করুন"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>রিস্টোর</span>
                          </button>
                          <button
                            onClick={() => onDeleteBackup(arc.id)}
                            className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition cursor-pointer"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Auto-Backup Cron Schedule Card */}
            <div className="pt-6 border-t border-slate-100">
              <h4 className="font-bold text-xs text-slate-900 mb-3 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-purple-700" />
                <span>স্বয়ংক্রিয় ব্যাকআপ শিডিউল কনফিগারেশন (Scheduled Cron):</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">ফ্রিকোয়েন্সি (Frequency)</label>
                  <select
                    value={scheduleState.frequency}
                    onChange={e => setScheduleState({ ...scheduleState, frequency: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="daily">দৈনিক (Daily at 02:00 AM)</option>
                    <option value="weekly">সাপ্তাহিক (Weekly on Friday)</option>
                    <option value="manual">শুধুমাত্র ম্যানুয়াল</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">সংরক্ষণ মেয়াদ (Retention Days)</label>
                  <select
                    value={scheduleState.retentionDays}
                    onChange={e => setScheduleState({ ...scheduleState, retentionDays: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value={7}>৭ দিন (পূর্বেরগুলো অটো ডিলিট)</option>
                    <option value={30}>৩০ দিন (প্রস্তাবিত)</option>
                    <option value={90}>৯০ দিন (এন্টারপ্রাইজ)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">ক্লাউড স্টোরেজ টার্গেট</label>
                  <select
                    value={scheduleState.storageTarget}
                    onChange={e => setScheduleState({ ...scheduleState, storageTarget: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="local_hostinger">Hostinger Cloud Secure Vault</option>
                    <option value="google_drive">Google Drive Cloud Storage</option>
                    <option value="aws_s3">Amazon AWS S3 Bucket</option>
                  </select>
                </div>

                <div className="space-y-1 flex flex-col justify-end">
                  <button
                    onClick={() => {
                      onUpdateBackupSchedule(scheduleState);
                      showToast('স্বয়ংক্রিয় ব্যাকআপ শিডিউল সফলভাবে আপডেট করা হয়েছে!');
                    }}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition cursor-pointer"
                  >
                    শিডিউল সংরক্ষণ করুন
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Modals */}
      {isCreateWebhookOpen && (
        <CreateWebhookModal
          isOpen={isCreateWebhookOpen}
          onClose={() => { setIsCreateWebhookOpen(false); setEditingWebhook(null); }}
          tenantId={tenant.id}
          onSaveWebhook={wh => {
            onSaveWebhook(wh);
            showToast('ওয়েবহুক সফলভাবে সংরক্ষিত ও সক্রিয় করা হয়েছে!');
          }}
          existingWebhook={editingWebhook}
        />
      )}

      {testingWebhook && (
        <TestWebhookModal
          isOpen={Boolean(testingWebhook)}
          onClose={() => setTestingWebhook(null)}
          webhook={testingWebhook}
          onAddDeliveryLog={onAddWebhookDeliveryLog}
        />
      )}

      {restoringArchive && (
        <RestoreBackupConfirmModal
          isOpen={Boolean(restoringArchive)}
          onClose={() => setRestoringArchive(null)}
          archive={restoringArchive}
          onConfirmRestore={archId => {
            onRestoreBackup(archId);
            showToast('ডাটাবেজ সফলভাবে রিস্টোর ও রিকভার সম্পন্ন হয়েছে!');
          }}
        />
      )}

      {/* View Payload Modal */}
      {viewingPayloadLog && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-purple-100 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">প্রেরিত পে-লোড ডেটা প্রিভিউ</h3>
                <p className="text-xs text-slate-400 font-mono">
                  {viewingPayloadLog.event} • HTTP {viewingPayloadLog.responseStatus} ({viewingPayloadLog.latencyMs} ms)
                </p>
              </div>
              <button
                onClick={() => setViewingPayloadLog(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-800 flex items-center justify-center transition cursor-pointer text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-3 font-mono text-xs">
              <div>
                <span className="font-bold text-slate-800 block mb-1">HMAC Signature Header:</span>
                <div className="p-2 bg-slate-100 rounded-lg text-purple-900 break-all select-all">
                  {viewingPayloadLog.signatureHeader}
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-800 block mb-1">Payload JSON:</span>
                <pre className="p-3 bg-slate-900 text-slate-100 rounded-2xl overflow-x-auto max-h-56">
                  {JSON.stringify(viewingPayloadLog.payload, null, 2)}
                </pre>
              </div>

              <div>
                <span className="font-bold text-slate-800 block mb-1">Response Body:</span>
                <pre className="p-2.5 bg-slate-800 text-emerald-400 rounded-xl overflow-x-auto max-h-32">
                  {viewingPayloadLog.responseBody}
                </pre>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 text-right">
              <button
                onClick={() => setViewingPayloadLog(null)}
                className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold transition cursor-pointer text-xs"
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
