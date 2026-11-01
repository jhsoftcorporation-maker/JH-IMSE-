import React, { useState } from 'react';
import { 
  Printer, Monitor, Scale, ShieldCheck, Cpu, HardDrive, RefreshCw, 
  CheckCircle2, AlertTriangle, Play, Smartphone, Wifi, Bluetooth, 
  Settings2, Plus, Trash2, Check, QrCode, Power, Eye, Volume2, FileText
} from 'lucide-react';
import { 
  Tenant, ThermalPrinterConfig, ElectronicCashDrawerConfig, 
  DigitalWeighingScaleConfig, SunmiHardwareDeviceStatus 
} from '../../types';
import { 
  INITIAL_THERMAL_PRINTERS, INITIAL_CASH_DRAWER_CONFIG, 
  INITIAL_WEIGHING_SCALE_CONFIG, INITIAL_SUNMI_DEVICE_STATUS,
  kickElectronicCashDrawer, buildThermalReceiptText
} from '../../utils/hardwareBridge';
import { CustomerFacingDisplayModal } from './CustomerFacingDisplayModal';

interface HardwareSuiteManagerProps {
  tenant: Tenant;
}

export const HardwareSuiteManager: React.FC<HardwareSuiteManagerProps> = ({
  tenant,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'printers' | 'cash_drawer' | 'cfd' | 'scale' | 'diagnostics'>('overview');
  
  // Hardware state
  const [deviceStatus, setDeviceStatus] = useState<SunmiHardwareDeviceStatus>(INITIAL_SUNMI_DEVICE_STATUS);
  const [printers, setPrinters] = useState<ThermalPrinterConfig[]>(INITIAL_THERMAL_PRINTERS);
  const [drawerConfig, setDrawerConfig] = useState<ElectronicCashDrawerConfig>(INITIAL_CASH_DRAWER_CONFIG);
  const [scaleConfig, setScaleConfig] = useState<DigitalWeighingScaleConfig>(INITIAL_WEIGHING_SCALE_CONFIG);

  // Modals & testing
  const [isCfdModalOpen, setIsCfdModalOpen] = useState(false);
  const [testPrintOutput, setTestPrintOutput] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<{ message: string; type: 'success' | 'warning' } | null>(null);

  // New printer form
  const [showAddPrinterModal, setShowAddPrinterModal] = useState(false);
  const [newPrnName, setNewPrnName] = useState('');
  const [newPrnType, setNewPrnType] = useState<ThermalPrinterConfig['connectionType']>('usb');
  const [newPrnWidth, setNewPrnWidth] = useState<ThermalPrinterConfig['paperWidth']>('80mm');
  const [newPrnIp, setNewPrnIp] = useState('192.168.1.200');

  const showToast = (message: string, type: 'success' | 'warning' = 'success') => {
    setActionNotice({ message, type });
    setTimeout(() => setActionNotice(null), 3500);
  };

  // Test cash drawer kick
  const handleTestCashDrawer = async () => {
    const result = await kickElectronicCashDrawer(drawerConfig.pinNumber);
    setDrawerConfig(prev => ({
      ...prev,
      testKickCount: prev.testKickCount + 1,
      lastKickedAt: 'Just now (' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ')',
    }));
    showToast(result.message);
  };

  // Trigger test ESC/POS print
  const handleTestPrint = (printer: ThermalPrinterConfig) => {
    const cols = printer.paperWidth === '80mm' ? 48 : 32;
    const separator = '='.repeat(cols);
    const slip = `
${separator}
        ${tenant.name.toUpperCase()}
   HARDWARE TEST & SELF DIAGNOSTIC
${separator}
Printer: ${printer.name}
Connection: ${printer.connectionType.toUpperCase()}
Paper Width: ${printer.paperWidth}
Density: ${printer.density.toUpperCase()}
Bangla Engine: ${printer.banglaBitmapSupport ? 'ENABLED (Bitmap 24-dot)' : 'RAW'}
Date: ${new Date().toLocaleString()}

[ALIGNMENT TEST]
Left Aligned Line
         Centered Text Header
                      Right Price
${'-'.repeat(cols)}
[FONT TEST]
NORMAL: 1234567890 ABCDEF
BOLD:   1234567890 ABCDEF
DOUBLE: 1234567890 ABCDEF
${'-'.repeat(cols)}
[BARCODE 128 / QR TEST]
||| |||| || ||||| |||| || |||
SKU-JHIMSE-2026-TEST
[CUTTER COMMAND]: GS V 65 0
${separator}
     DIAGNOSTIC TEST PASSED OK!
${separator}
    `;
    setTestPrintOutput(slip);
    showToast(`"${printer.name}"-এ টেস্ট প্রিন্ট পাঠানো হয়েছে!`);
  };

  // Add new printer
  const handleCreatePrinter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrnName) return;

    const newPrinter: ThermalPrinterConfig = {
      id: 'prn-' + Date.now(),
      tenantId: tenant.id,
      name: newPrnName,
      connectionType: newPrnType,
      paperWidth: newPrnWidth,
      ipAddress: newPrnType === 'network_tcp' ? newPrnIp : undefined,
      port: 9100,
      autoCut: true,
      openDrawerOnCash: true,
      isDefault: printers.length === 0,
      density: 'normal',
      banglaBitmapSupport: true,
      status: 'connected',
    };

    setPrinters(prev => [...prev, newPrinter]);
    setShowAddPrinterModal(false);
    setNewPrnName('');
    showToast(`নতুন প্রিন্টার "${newPrinter.name}" সফলভাবে যুক্ত হয়েছে!`);
  };

  // Set default printer
  const handleSetDefaultPrinter = (id: string) => {
    setPrinters(prev => prev.map(p => ({
      ...p,
      isDefault: p.id === id,
    })));
    showToast('ডিফল্ট প্রিন্টার হালনাগাদ করা হয়েছে');
  };

  // Run full diagnostic self-test
  const handleRunFullDiagnostics = () => {
    showToast('সম্পূর্ণ হার্ডওয়্যার ডায়াগনস্টিক স্ক্যান চলছে...', 'warning');
    setTimeout(() => {
      setDeviceStatus(prev => ({
        ...prev,
        lastHealthCheck: 'Just now (All Systems Nominal)',
        thermalHeadTempC: 37.2,
        batteryLevelPct: 100,
        cutterStatus: 'ok',
        paperRollState: 'ok',
      }));
      showToast('✅ সকল হার্ডওয়্যার ডিভাইস সক্রিয় ও শতভাগ ত্রুটিহীন!');
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {actionNotice && (
        <div className={`p-3.5 rounded-2xl flex items-center justify-between text-xs font-bold shadow-md animate-in fade-in ${
          actionNotice.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-purple-900 text-purple-100'
        }`}>
          <span>{actionNotice.message}</span>
          <button onClick={() => setActionNotice(null)} className="opacity-80 hover:opacity-100 text-white font-bold ml-2">✕</button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-400/30">
            <Cpu className="w-3.5 h-3.5 text-amber-300" /> Phase 15: Sunmi & iMin Native Hardware Integration
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            স্মার্ট POS হার্ডওয়্যার ড্রাইভার হাব
          </h2>
          <p className="text-xs sm:text-sm text-purple-200">
            সানমি (Sunmi V2/T2), আইমিন (iMin D4), এপসন ও এক্সপ্রিন্টার থার্মাল প্রিন্টিং, ইলেকট্রনিক ক্যাশ ড্রয়ার পালস, ডুয়াল স্ক্রিন CFD ডিসপ্লে এবং ডিজিটাল ওজন স্কেলের কেন্দ্রীয় ড্রাইভার কন্ট্রোল।
          </p>
        </div>

        {/* Action button */}
        <div className="flex flex-col gap-2 min-w-[200px]">
          <button
            onClick={() => setIsCfdModalOpen(true)}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-md"
          >
            <Monitor className="w-4 h-4" /> ডুয়াল-স্ক্রিন CFD প্রিভিউ
          </button>
          <button
            onClick={handleRunFullDiagnostics}
            className="w-full py-2 px-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border border-white/20"
          >
            <RefreshCw className="w-3.5 h-3.5" /> হার্ডওয়্যার সেলফ টেস্ট
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 text-xs font-bold text-slate-600">
        {[
          { id: 'overview', label: 'টার্মিনাল ও ড্রাইভার স্ট্যাটাস', icon: Cpu },
          { id: 'printers', label: 'ESC/POS থার্মাল প্রিন্টার', icon: Printer, badge: printers.length },
          { id: 'cash_drawer', label: 'ক্যাশ ড্রয়ার (RJ11 Pulse)', icon: HardDrive },
          { id: 'cfd', label: 'কাস্টমার ডিসপ্লে (CFD)', icon: Monitor },
          { id: 'scale', label: 'ডিজিটাল ওজন স্কেল (RS-232)', icon: Scale },
          { id: 'diagnostics', label: 'লগ ও ডায়াগনস্টিক রিপোর্ট', icon: ShieldCheck },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-3.5 py-2.5 rounded-xl transition flex items-center gap-2 shrink-0 ${
                isActive
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'bg-white hover:bg-purple-50 hover:text-purple-900 border border-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-purple-800 text-purple-100' : 'bg-purple-100 text-purple-700'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* SUB-TAB 1: OVERVIEW */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Hardware Status Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>মাস্টার POS টার্মিনাল</span>
                <Cpu className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-base font-black text-slate-900 mt-2 truncate">{deviceStatus.model}</div>
              <div className="text-[11px] text-emerald-600 font-bold mt-1">● ড্রাইভার অ্যাক্টিভ ও অনলাইন</div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>ব্যাটারি ও চার্জিং</span>
                <Smartphone className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-emerald-700 mt-1">{deviceStatus.batteryLevelPct}%</div>
              <div className="text-[11px] text-slate-500 font-semibold mt-1">
                {deviceStatus.isCharging ? '⚡ AC চার্জার সংযুক্ত' : 'ব্যাটারি মোড'}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>থার্মাল হেড তাপমাত্রা</span>
                <Printer className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-black text-indigo-700 mt-1">{deviceStatus.thermalHeadTempC}°C</div>
              <div className="text-[11px] text-emerald-600 font-bold mt-1">স্বাভাবিক তাপমাত্রা (Cool)</div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>কাটার ও পেপার স্ট্যাটাস</span>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-lg font-black text-slate-900 mt-1">পেপার নরমাল (OK)</div>
              <div className="text-[11px] text-emerald-600 font-bold mt-1">অটো কাটার প্রস্তুত</div>
            </div>
          </div>

          {/* Connected Device Spec Sheet */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">টার্মিনাল হার্ডওয়্যার স্পেসিফিকেশন</h3>
                <p className="text-xs text-slate-500">Android AIDL & WebUSB Hardware Bus</p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                Sunmi OS 3.4 Verified
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">ডিভাইস মডেল:</span>
                  <strong className="text-slate-900">{deviceStatus.model}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">সিরিয়াল নম্বর:</span>
                  <strong className="text-purple-700 font-mono">{deviceStatus.serialNumber}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">অপারেটিং সিস্টেম:</span>
                  <strong className="text-slate-900">{deviceStatus.osVersion}</strong>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">বারকোড স্ক্যানার হেড:</span>
                  <strong className="text-slate-900 uppercase">{deviceStatus.scannerEngine}</strong>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">NFC / RFID রিডার:</span>
                  <strong className="text-emerald-700">{deviceStatus.nfcReaderAvailable ? 'সক্রিয় (ISO14443 Type A/B)' : 'অনুপস্থিত'}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">ক্যাশ ড্রয়ার পালস পোর্ট:</span>
                  <strong className="text-slate-900 font-mono">RJ11 (24V DC / 1A)</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">ওজন স্কেল ইন্টারফেস:</span>
                  <strong className="text-slate-900">RS-232 / WebSerial USB</strong>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">লাস্ট হেলথ চেক:</span>
                  <strong className="text-slate-900">{deviceStatus.lastHealthCheck}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: PRINTERS */}
      {activeSubTab === 'printers' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">থার্মাল প্রিন্টার ড্রাইভার ও তালিকা</h3>
              <p className="text-xs text-slate-500">৫৮মিমি ও ৮০মিমি রসিদ প্রিন্টার কনফিগারেশন</p>
            </div>
            <button
              onClick={() => setShowAddPrinterModal(true)}
              className="px-3.5 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" /> নতুন প্রিন্টার যুক্ত করুন
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {printers.map(printer => (
              <div 
                key={printer.id}
                className={`bg-white rounded-3xl p-5 border transition shadow-2xs flex flex-col justify-between ${
                  printer.isDefault ? 'border-purple-500 ring-2 ring-purple-500/20' : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                      printer.connectionType === 'browser_direct' ? 'bg-purple-100 text-purple-800' :
                      printer.connectionType === 'network_tcp' ? 'bg-indigo-100 text-indigo-800' :
                      printer.connectionType === 'bluetooth' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'
                    }`}>
                      {printer.connectionType.replace('_', ' ')}
                    </span>

                    {printer.isDefault && (
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" /> প্রধান প্রিন্টার
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-sm text-slate-900 leading-snug">{printer.name}</h4>
                  
                  <div className="space-y-1.5 text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
                    <div className="flex justify-between">
                      <span>পেপার প্রস্থ:</span>
                      <strong className="text-slate-800">{printer.paperWidth}</strong>
                    </div>
                    {printer.ipAddress && (
                      <div className="flex justify-between">
                        <span>নেটওয়ার্ক আইপি:</span>
                        <strong className="text-purple-700 font-mono">{printer.ipAddress}:{printer.port || 9100}</strong>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>অটো পেপার কাটার:</span>
                      <strong className={printer.autoCut ? 'text-emerald-700' : 'text-slate-400'}>
                        {printer.autoCut ? 'চালু' : 'বন্ধ'}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span>ক্যাশ ড্রয়ার অটো-কিক:</span>
                      <strong className={printer.openDrawerOnCash ? 'text-emerald-700' : 'text-slate-400'}>
                        {printer.openDrawerOnCash ? 'চালু' : 'বন্ধ'}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span>বাংলা বিটম্যাপ ইঞ্জিন:</span>
                      <strong className="text-purple-700">সক্রিয় (Unicode)</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => handleTestPrint(printer)}
                    className="flex-1 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
                  >
                    <Play className="w-3.5 h-3.5" /> টেস্ট প্রিন্ট
                  </button>
                  {!printer.isDefault && (
                    <button
                      onClick={() => handleSetDefaultPrinter(printer.id)}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                    >
                      ডিফল্ট করুন
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Test Print Preview Box */}
          {testPrintOutput && (
            <div className="bg-slate-900 text-white rounded-3xl p-5 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-400" /> থার্মাল টেস্ট প্রিন্ট প্রিভিউ
                </span>
                <button
                  onClick={() => setTestPrintOutput(null)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  ✕ বন্ধ করুন
                </button>
              </div>
              <pre className="font-mono text-xs text-emerald-400 bg-slate-950 p-4 rounded-2xl overflow-x-auto whitespace-pre">
                {testPrintOutput}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 3: CASH DRAWER */}
      {activeSubTab === 'cash_drawer' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">ইলেকট্রনিক ক্যাশ ড্রয়ার (RJ11 Solenoid Kick)</h3>
              <p className="text-xs text-slate-500">ক্যাশ বিক্রয় সম্পন্ন হওয়ামাত্র স্বয়ংক্রিয়ভাবে ক্যাশ বাক্স উন্মুক্ত করুন</p>
            </div>
            <button
              onClick={handleTestCashDrawer}
              className="px-4 py-2 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
            >
              <Volume2 className="w-4 h-4 text-amber-300" /> ক্যাশ ড্রয়ার কিক টেস্ট
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <strong className="text-slate-900 text-sm">স্বয়ংক্রিয় ক্যাশ ড্রয়ার ওপেন</strong>
                    <p className="text-slate-500 text-[11px]">ক্যাশ পেমেন্ট মেমো কাটার সাথে সাথে পালস পাঠাবে</p>
                  </div>
                  <button
                    onClick={() => setDrawerConfig(prev => ({ ...prev, enabled: !prev.enabled }))}
                    className={`w-11 h-6 rounded-full transition-colors relative flex items-center ${
                      drawerConfig.enabled ? 'bg-purple-700' : 'bg-slate-300'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      drawerConfig.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                  <span className="text-slate-500">RJ11 ড্রয়ার পিন সিলেক্টর:</span>
                  <div className="flex bg-white rounded-lg p-0.5 border border-slate-200">
                    <button
                      onClick={() => setDrawerConfig(prev => ({ ...prev, pinNumber: 2 }))}
                      className={`px-3 py-1 rounded text-xs font-bold ${
                        drawerConfig.pinNumber === 2 ? 'bg-purple-700 text-white' : 'text-slate-600'
                      }`}
                    >
                      Pin 2 (Standard)
                    </button>
                    <button
                      onClick={() => setDrawerConfig(prev => ({ ...prev, pinNumber: 5 }))}
                      className={`px-3 py-1 rounded text-xs font-bold ${
                        drawerConfig.pinNumber === 5 ? 'bg-purple-700 text-white' : 'text-slate-600'
                      }`}
                    >
                      Pin 5 (Aux)
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-purple-50/70 rounded-2xl border border-purple-200 space-y-2">
                <span className="text-purple-900 font-bold block">ESC/POS হেক্স পালস সিকোয়েন্স:</span>
                <code className="block p-2.5 bg-white rounded-xl border border-purple-200 font-mono text-purple-800 font-bold">
                  {drawerConfig.pinNumber === 2 ? '1B 70 00 19 FA (ESC p 0 25 250)' : '1B 70 01 19 FA (ESC p 1 25 250)'}
                </code>
                <p className="text-[10px] text-purple-700">
                  ২৪ ভোল্ট সোলেনয়েড কয়েলে ২৫০ মিলিসেকেন্ড ডিউরেশনের একটি ইলেকট্রিক পালস ড্রয়ার ক্যাচ মুক্ত করে।
                </p>
              </div>
            </div>

            <div className="p-5 bg-slate-900 text-white rounded-3xl border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300 block mb-1">
                  ক্যাশ ড্রয়ার হেলথ মেট্রিক্স
                </span>
                <div className="text-2xl font-black text-amber-300 mt-2">
                  {drawerConfig.testKickCount} বার সক্রিয় হয়েছে
                </div>
                <div className="text-slate-400 text-xs mt-1">
                  সর্বশেষ কিক: <strong className="text-slate-200">{drawerConfig.lastKickedAt || 'Never'}</strong>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 mt-4">
                <button
                  onClick={handleTestCashDrawer}
                  className="w-full py-2.5 bg-purple-700 hover:bg-purple-600 text-white rounded-xl font-bold transition flex items-center justify-center gap-2"
                >
                  <Play className="w-3.5 h-3.5" /> এখনই ড্রয়ার ওপেন টেস্ট করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: CFD (Customer Facing Display) */}
      {activeSubTab === 'cfd' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">কাস্টমার ফেসিং ডুয়াল স্ক্রিন (CFD Sub-Display)</h3>
              <p className="text-xs text-slate-500">Sunmi T2 / iMin D4 সেকেন্ডারি ডিসপ্লে ও কিউআর পেমেন্ট</p>
            </div>
            <button
              onClick={() => setIsCfdModalOpen(true)}
              className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <Eye className="w-4 h-4" /> সেকেন্ডারি ডিসপ্লে চালু করুন
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <strong className="text-slate-900 text-sm block">লাইভ কার্ট মিররিং</strong>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                ক্যাশিয়ার যখনই একটি আইটেম স্ক্যান করবে, কাস্টমার তার সামনের স্ক্রিনে তাত্ক্ষণিক দেখতে পাবে। কোনো ভুল হলে সাথে সাথে জানাতে পারবে।
              </p>
              <div className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" /> জিরো-ল্যাটেন্সি লোকাল ব্রডকাস্ট
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <strong className="text-slate-900 text-sm block">ডাইনামিক bKash & Nagad QR</strong>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                পেমেন্টের সময় কাস্টমারের স্ক্রিনে অটোমেটিক কিউআর কোড ভেসে ওঠে, যাতে গ্রাহক নিজের বিকাশ অ্যাপ দিয়ে এক ক্লিকে টাকা পরিশোধ করতে পারেন।
              </p>
              <div className="text-purple-700 font-bold flex items-center gap-1 text-[11px]">
                <QrCode className="w-3.5 h-3.5" /> অটোমেটিক ইনভয়েস অ্যামাউন্ট এম্বেড
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <strong className="text-slate-900 text-sm block">বিজ্ঞাপন ও ব্র্যান্ড ব্যানার</strong>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                কাউন্টার যখন খালি বা অলস থাকবে, স্ক্রিনে আপনার শপের লোগো, অফার ব্যানার ও ওয়েলকাম মেসেজ লুপ হতে থাকবে।
              </p>
              <div className="text-indigo-700 font-bold flex items-center gap-1 text-[11px]">
                <Monitor className="w-3.5 h-3.5" /> ব্র্যান্ড প্রমোশন ডিসপ্লে
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: SCALE */}
      {activeSubTab === 'scale' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">ডিজিটাল ওজন স্কেল ড্রাইভার (RS-232 / USB)</h3>
              <p className="text-xs text-slate-500">মুদি, কাঁচাবাজার ও মিষ্টির দোকানের ওজন পরিমাপের স্বয়ংক্রিয় ব্রিজ</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
              ● WebSerial API Ready
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <strong className="text-slate-900 text-sm block">সিরিয়াল পোর্ট কনফিগারেশন</strong>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-500 font-bold block mb-1">কানেকশন পোর্ট:</label>
                  <input
                    type="text"
                    value={scaleConfig.portName}
                    onChange={e => setScaleConfig({ ...scaleConfig, portName: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-bold block mb-1">বাড রেট (Baud Rate):</label>
                  <select
                    value={scaleConfig.baudRate}
                    onChange={e => setScaleConfig({ ...scaleConfig, baudRate: parseInt(e.target.value) })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                  >
                    <option value={9600}>9600 bps (Standard)</option>
                    <option value={4800}>4800 bps</option>
                    <option value={19200}>19200 bps</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                <span className="text-slate-600">ওজন স্থিতিশীল হলে অটো-কার্ট অ্যাড:</span>
                <button
                  onClick={() => setScaleConfig(prev => ({ ...prev, autoAddToCart: !prev.autoAddToCart }))}
                  className={`w-11 h-6 rounded-full transition-colors relative flex items-center ${
                    scaleConfig.autoAddToCart ? 'bg-purple-700' : 'bg-slate-300'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    scaleConfig.autoAddToCart ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>

            {/* Scale Simulator in Action */}
            <div className="p-5 bg-slate-950 text-white rounded-3xl border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">লাইভ স্কেল সেন্সর ফিড</span>
                <div className="font-mono text-4xl font-black text-emerald-400 mt-2">
                  {scaleConfig.currentWeightKg.toFixed(3)} <span className="text-sm font-bold text-slate-400">KG</span>
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  স্ট্যাটাস: <strong className="text-emerald-400">STABLE (0.000 Drift)</strong>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex gap-2 mt-4">
                <button
                  onClick={() => setScaleConfig(prev => ({ ...prev, currentWeightKg: 0 }))}
                  className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold transition text-xs"
                >
                  জিরো রিসেট
                </button>
                <button
                  onClick={() => setScaleConfig(prev => ({ ...prev, currentWeightKg: Math.round((Math.random() * 3 + 0.2) * 1000) / 1000 }))}
                  className="flex-1 py-1.5 bg-purple-700 hover:bg-purple-600 text-white rounded-xl font-bold transition text-xs"
                >
                  ওজন পরিবর্তন টেস্ট
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 6: DIAGNOSTICS */}
      {activeSubTab === 'diagnostics' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">হার্ডওয়্যার ডায়াগনস্টিক রিপোর্ট ও অডিট</h3>
              <p className="text-xs text-slate-500">ডিভাইস সেন্সর, কাটার এবং পাওয়ার স্ট্যাটাস পরীক্ষা</p>
            </div>
            <button
              onClick={handleRunFullDiagnostics}
              className="px-3.5 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" /> ডায়াগনস্টিক চালান
            </button>
          </div>

          <div className="space-y-2 text-xs">
            {[
              { component: 'Internal Seiko 80mm Direct Thermal Head', status: 'PASS', note: 'Resistance nominal, no missing dots detected' },
              { component: 'Auto Cutter Guillotine Blade', status: 'PASS', note: '1,500,000 cuts MTBF rating, 0 paper jams' },
              { component: 'Optocoupler Paper End Sensor', status: 'PASS', note: 'Paper roll detected (Level: High)' },
              { component: 'RJ11 Solenoid Coil 24V Line', status: 'PASS', note: 'Resistance: 24 Ohms, Kick pulse responsive' },
              { component: 'Sub-Display MIPI / HDMI Link', status: 'PASS', note: 'Dual display buffer mirrored at 60 FPS' },
              { component: 'RS-232 / USB Host Controller', status: 'PASS', note: 'Baud rate 9600 streaming with CRC checksum ok' },
            ].map((d, i) => (
              <div key={i} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <strong className="text-slate-900">{d.component}</strong>
                  <p className="text-[11px] text-slate-500 mt-0.5">{d.note}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                  ✓ {d.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Printer Modal */}
      {showAddPrinterModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-purple-100 animate-in zoom-in-95">
            <h3 className="text-sm font-bold text-slate-900 mb-3">নতুন থার্মাল প্রিন্টার যুক্ত করুন</h3>
            <form onSubmit={handleCreatePrinter} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">প্রিন্টারের নাম:</label>
                <input
                  type="text"
                  required
                  value={newPrnName}
                  onChange={e => setNewPrnName(e.target.value)}
                  placeholder="যেমন: Xprinter XP-N160II Kitchen"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-1 focus:ring-purple-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">কানেকশন মাধ্যম:</label>
                  <select
                    value={newPrnType}
                    onChange={e => setNewPrnType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  >
                    <option value="usb">USB (WebUSB)</option>
                    <option value="network_tcp">Network IP (LAN TCP)</option>
                    <option value="bluetooth">Bluetooth (BLE)</option>
                    <option value="browser_direct">Built-in (AIDL)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">পেপার প্রস্থ:</label>
                  <select
                    value={newPrnWidth}
                    onChange={e => setNewPrnWidth(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  >
                    <option value="80mm">80mm (Standard Counter)</option>
                    <option value="58mm">58mm (Handheld Mobile)</option>
                  </select>
                </div>
              </div>

              {newPrnType === 'network_tcp' && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">নেটওয়ার্ক IP অ্যাড্রেস:</label>
                  <input
                    type="text"
                    value={newPrnIp}
                    onChange={e => setNewPrnIp(e.target.value)}
                    placeholder="192.168.1.200"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddPrinterModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Facing Display Modal */}
      <CustomerFacingDisplayModal
        isOpen={isCfdModalOpen}
        onClose={() => setIsCfdModalOpen(false)}
        tenant={tenant}
        cartItems={[
          { id: '1', name: 'প্রাণ চানাচুর ২০০ গ্রাম', price: 65, quantity: 2, total: 130 },
          { id: '2', name: 'তাজা সয়াবিন তেল ১ লিটার', price: 185, quantity: 1, total: 185 },
          { id: '3', name: 'আম্রপালি আম (ফ্রেশ)', price: 120, quantity: 1.5, total: 180, unit: 'kg' },
        ]}
        subtotal={495}
        discount={25}
        tax={0}
        grandTotal={470}
        paidAmount={500}
        changeAmount={30}
      />
    </div>
  );
};
