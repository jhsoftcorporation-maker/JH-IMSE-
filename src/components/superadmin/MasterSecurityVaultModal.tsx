import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  X, Shield, ShieldCheck, ShieldAlert, Key, Smartphone, 
  Copy, Check, RefreshCw, Lock, AlertTriangle, Eye, EyeOff, 
  Download, Sparkles, CheckCircle2 
} from 'lucide-react';
import { 
  getMasterSecurityConfig, saveMasterSecurityConfig, 
  setupNewTotpCredentials, enableMasterTotp, disableMasterTotp, 
  setGeneralTotpEnabled, updateMasterCredentials, MasterSecurityConfig 
} from '../../utils/masterSecurity';
import { buildOtpAuthUrl, verifyTOTP } from '../../utils/totpEngine';

interface MasterSecurityVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigUpdated?: (config: MasterSecurityConfig) => void;
}

export const MasterSecurityVaultModal: React.FC<MasterSecurityVaultModalProps> = ({
  isOpen,
  onClose,
  onConfigUpdated,
}) => {
  const [config, setConfig] = useState<MasterSecurityConfig>(getMasterSecurityConfig);
  const [activeTab, setActiveTab] = useState<'2fa' | 'password' | 'backup_codes'>('2fa');

  // 2FA Setup State
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [setupSecret, setSetupSecret] = useState('');
  const [setupBackupCodes, setSetupBackupCodes] = useState<string[]>([]);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState('');
  const [setupError, setSetupError] = useState('');
  const [setupSuccess, setSetupSuccess] = useState('');
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedBackup, setCopiedBackup] = useState(false);

  // Password Change State
  const [newMasterEmail, setNewMasterEmail] = useState(config.masterEmail);
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [credError, setCredError] = useState('');
  const [credSuccess, setCredSuccess] = useState('');

  // Load latest config whenever modal opens
  useEffect(() => {
    if (isOpen) {
      const c = getMasterSecurityConfig();
      setConfig(c);
      setNewMasterEmail(c.masterEmail);
      setIsSettingUp(false);
      setSetupError('');
      setSetupSuccess('');
      setCredError('');
      setCredSuccess('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Start 2FA Setup Wizard
  const handleStartSetup = async () => {
    const { secret, backupCodes } = setupNewTotpCredentials();
    setSetupSecret(secret);
    setSetupBackupCodes(backupCodes);
    setVerificationCode('');
    setSetupError('');
    setSetupSuccess('');

    // Generate QR Code data URL
    const otpAuthUrl = buildOtpAuthUrl('JH IMSE Master', config.masterEmail, secret);
    try {
      const url = await QRCode.toDataURL(otpAuthUrl, {
        width: 240,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      });
      setQrCodeDataUrl(url);
      setIsSettingUp(true);
    } catch (err) {
      setSetupError('কিউআর কোড জেনারেট করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।');
    }
  };

  // Verify code & Enable 2FA
  const handleConfirmEnable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setSetupError('');
    if (!verificationCode || verificationCode.trim().length !== 6) {
      setSetupError('অনুগ্রহ করে আপনার গুগল অথেন্টিকেটর অ্যাপের ৬ ডিজিটের কোডটি লিখুন।');
      return;
    }

    const isValid = await verifyTOTP(verificationCode.trim(), setupSecret);
    if (!isValid) {
      setSetupError('ভুল কোড! আপনার মোবাইল অ্যাপের সময় ঠিক আছে কিনা এবং বর্তমান ৬ ডিজিট লিখছেন কিনা যাচাই করুন।');
      return;
    }

    const updated = enableMasterTotp(setupSecret, setupBackupCodes);
    setConfig(updated);
    setIsSettingUp(false);
    setSetupSuccess('অভিনন্দন! গুগল অথেন্টিকেটর ২-ফ্যাক্টর অথেনটিকেশন (2FA) সফলভাবে সক্রিয় করা হয়েছে।');
    if (onConfigUpdated) onConfigUpdated(updated);
  };

  // Disable 2FA
  const handleDisable2FA = () => {
    if (window.confirm('আপনি কি নিশ্চিত যে গুগল অথেন্টিকেটর বন্ধ করতে চান? বন্ধ করলে পরবর্তীতে শুধুমাত্র পাসওয়ার্ড দিয়ে লগইন করা যাবে।')) {
      const updated = disableMasterTotp();
      setConfig(updated);
      setIsSettingUp(false);
      setSetupSuccess('গুগল অথেন্টিকেটর বন্ধ করা হয়েছে।');
      if (onConfigUpdated) onConfigUpdated(updated);
    }
  };

  // Toggle General Merchant / Standard Login 2FA Policy
  const handleToggleGeneral2FA = (enable: boolean) => {
    const updated = setGeneralTotpEnabled(enable);
    setConfig({ ...updated });
    setSetupSuccess(enable 
      ? 'সাধারণ গ্রাহকদের জন্য ২-ফ্যাক্টর অথেনটিকেশন (2FA) পলিসি সক্রিয় করা হয়েছে।' 
      : 'সাধারণ গ্রাহকদের জন্য ২-ফ্যাক্টর অথেনটিকেশন (2FA) পলিসি নিষ্ক্রিয় (OFF) করা হয়েছে।'
    );
    if (onConfigUpdated) onConfigUpdated(updated);
  };

  // Copy secret key
  const handleCopySecretKey = () => {
    navigator.clipboard.writeText(setupSecret || config.totpSecret);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  // Copy backup codes
  const handleCopyBackupCodes = () => {
    const list = isSettingUp ? setupBackupCodes : config.backupCodes;
    navigator.clipboard.writeText(list.join('\n'));
    setCopiedBackup(true);
    setTimeout(() => setCopiedBackup(false), 2000);
  };

  // Update Master Credentials
  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setCredError('');
    setCredSuccess('');

    if (currentPasswordInput !== config.masterPasswordHash) {
      setCredError('বর্তমান পাসওয়ার্ড সঠিক নয়!');
      return;
    }

    if (newPasswordInput && newPasswordInput.length < 6) {
      setCredError('নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে!');
      return;
    }

    if (newPasswordInput !== confirmPasswordInput) {
      setCredError('নতুন পাসওয়ার্ড ও কনফার্ম পাসওয়ার্ড মিলছে না!');
      return;
    }

    const updated = updateMasterCredentials(
      newMasterEmail,
      newPasswordInput ? newPasswordInput : undefined
    );
    setConfig(updated);
    setCurrentPasswordInput('');
    setNewPasswordInput('');
    setConfirmPasswordInput('');
    setCredSuccess('মাস্টার একাউন্টের তথ্য সফলভাবে আপডেট হয়েছে!');
    if (onConfigUpdated) onConfigUpdated(updated);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150 my-6">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-950 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 transition"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-purple-600/30 border border-purple-400/30 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-purple-300" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">সুপার অ্যাডমিন সিকিউরিটি ভল্ট</h2>
              <p className="text-xs text-purple-200 mt-0.5">
                Google Authenticator (2FA) ও মাস্টার একাউন্ট ক্রেডেনশিয়াল ব্যবস্থাপনা
              </p>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex gap-2 mt-5 border-b border-white/10 pb-1 text-xs overflow-x-auto scrollbar-none whitespace-nowrap">
            <button
              onClick={() => { setActiveTab('2fa'); setSetupError(''); setSetupSuccess(''); }}
              className={`pb-2 px-3 font-bold transition flex items-center gap-1.5 ${
                activeTab === '2fa'
                  ? 'border-b-2 border-purple-400 text-purple-200'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>গুগল অথেন্টিকেটর (2FA)</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                config.isTotpEnabled ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-700 text-slate-300'
              }`}>
                {config.isTotpEnabled ? 'ON' : 'OFF'}
              </span>
            </button>

            <button
              onClick={() => { setActiveTab('password'); setCredError(''); setCredSuccess(''); }}
              className={`pb-2 px-3 font-bold transition flex items-center gap-1.5 ${
                activeTab === 'password'
                  ? 'border-b-2 border-purple-400 text-purple-200'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>পাসওয়ার্ড পরিবর্তন</span>
            </button>

            {config.isTotpEnabled && (
              <button
                onClick={() => setActiveTab('backup_codes')}
                className={`pb-2 px-3 font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'backup_codes'
                    ? 'border-b-2 border-purple-400 text-purple-200'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>জরুরি রিকভারি কোড ({config.backupCodes.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 text-xs space-y-4">
          
          {/* TAB 1: GOOGLE AUTHENTICATOR (2FA) */}
          {activeTab === '2fa' && (
            <div className="space-y-4">
              {setupSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium">{setupSuccess}</span>
                </div>
              )}

              {/* Status Banner */}
              <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
                config.isTotpEnabled 
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950' 
                  : 'bg-amber-50/80 border-amber-200 text-amber-950'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    config.isTotpEnabled ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
                  }`}>
                    {config.isTotpEnabled ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">
                      {config.isTotpEnabled ? 'গুগল অথেন্টিকেটর (2FA) সক্রিয় রয়েছে' : 'গুগল অথেন্টিকেটর বর্তমানে বন্ধ রয়েছে (OFF)'}
                    </h4>
                    <p className="text-[11px] opacity-80 mt-0.5">
                      {config.isTotpEnabled
                        ? 'সুপার অ্যাডমিনে ঢুকতে প্রতিবার মোবাইল অ্যাপের লাইভ ৬ ডিজিটের কোড লাগবে।'
                        : 'এখন শুধুমাত্র মাস্টার ইমেইল ও পাসওয়ার্ড দিয়েই লগইন সম্ভব। সর্বোচ্চ সুরক্ষার জন্য এটি চালু করুন।'}
                    </p>
                  </div>
                </div>

                <div>
                  {config.isTotpEnabled ? (
                    <button
                      onClick={handleDisable2FA}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition shadow-xs text-xs whitespace-nowrap"
                    >
                      বন্ধ করুন (Turn OFF)
                    </button>
                  ) : (
                    !isSettingUp && (
                      <button
                        onClick={handleStartSetup}
                        className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl transition shadow-xs text-xs whitespace-nowrap flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>এখনই চালু করুন</span>
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* SETUP WIZARD (When user clicks Enable) */}
              {isSettingUp && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 animate-in fade-in duration-200">
                  <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-purple-700" />
                      <span>গুগল অথেন্টিকেটর সেটআপ নির্দেশিকা</span>
                    </h4>
                    <button
                      onClick={() => setIsSettingUp(false)}
                      className="text-slate-400 hover:text-slate-600 text-[11px] underline"
                    >
                      বাতিল করুন
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    {/* QR Code Canvas */}
                    <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                      {qrCodeDataUrl ? (
                        <img 
                          src={qrCodeDataUrl} 
                          alt="Google Authenticator QR Code" 
                          className="w-44 h-44 rounded-lg object-contain shadow-xs border border-slate-100"
                        />
                      ) : (
                        <div className="w-44 h-44 flex items-center justify-center text-slate-400">
                          <RefreshCw className="w-6 h-6 animate-spin text-purple-600" />
                        </div>
                      )}
                      <span className="text-[10px] text-slate-500 font-medium mt-2 text-center">
                        গুগল অথেন্টিকেটর অ্যাপ দিয়ে কিউআর কোডটি স্ক্যান করুন
                      </span>
                    </div>

                    {/* Step-by-Step Instructions & Manual Key */}
                    <div className="space-y-2.5 text-slate-700">
                      <div className="flex gap-2">
                        <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-[10px] shrink-0">১</span>
                        <p className="text-[11px] leading-relaxed">
                          ফোনের <strong>Google Authenticator</strong> অ্যাপ ওপেন করে <strong>&quot;+&quot;</strong> চাপুন এবং <strong>&quot;Scan a QR code&quot;</strong> সিলেক্ট করুন।
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-[10px] shrink-0">২</span>
                        <div className="text-[11px] leading-relaxed flex-1">
                          ম্যানুয়ালি কি যোগ করতে চাইলে এই সিক্রেট কি ব্যবহার করুন:
                          <div className="mt-1 flex items-center gap-1 bg-white border border-slate-200 p-1.5 rounded-lg font-mono font-bold text-purple-900 text-[11px]">
                            <span className="truncate flex-1 tracking-wider">{setupSecret}</span>
                            <button
                              type="button"
                              onClick={handleCopySecretKey}
                              className="px-2 py-0.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded transition shrink-0 flex items-center gap-1"
                            >
                              {copiedKey ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedKey ? 'কপি হয়েছে' : 'কপি'}</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-[10px] shrink-0">৩</span>
                        <p className="text-[11px] leading-relaxed">
                          স্ক্যান করার পর অ্যাপে চলা লাইভ <strong>৬ ডিজিটের কোডটি</strong> নিচের ঘরে লিখে ভেরিফাই করুন:
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Verification Form */}
                  <form onSubmit={handleConfirmEnable2FA} className="space-y-3 pt-2 border-t border-slate-200">
                    {setupError && (
                      <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>{setupError}</span>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <div className="relative flex-1 w-full">
                        <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          maxLength={6}
                          required
                          value={verificationCode}
                          onChange={e => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                          placeholder="অ্যাপের ৬ ডিজিটের কোড (যেমন: 492810)"
                          className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl font-mono font-bold text-sm tracking-widest focus:ring-2 focus:ring-purple-600 outline-none bg-white text-center sm:text-left"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full sm:w-auto px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shadow-xs text-xs whitespace-nowrap"
                      >
                        ভেরিফাই ও সক্রিয় করুন
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* SECTION 2: GENERAL MERCHANT & USER LOGIN 2FA POLICY */}
              <div className="pt-2 border-t border-slate-200">
                <div className={`p-4 rounded-2xl border transition-all ${
                  config.isGeneralTotpEnabled 
                    ? 'bg-purple-50/70 border-purple-200 text-purple-950' 
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        config.isGeneralTotpEnabled ? 'bg-purple-700 text-white shadow-xs' : 'bg-slate-200 text-slate-600'
                      }`}>
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900">
                            সাধারণ গ্রাহক ও মার্চেন্ট লগইন টু-ফ্যাক্টর (2FA)
                          </h4>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-mono ${
                            config.isGeneralTotpEnabled 
                              ? 'bg-purple-200 text-purple-800 border border-purple-300' 
                              : 'bg-slate-200 text-slate-600'
                          }`}>
                            {config.isGeneralTotpEnabled ? 'সক্রিয় (ON)' : 'বন্ধ (OFF)'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          যখন এই অপশনটি <strong>চালু (ON)</strong> থাকবে, তখন ব্রাউজারের মূল <strong>'লগইন'</strong> বাটন থেকে সাধারণ গ্রাহক বা মার্চেন্টরা লগইন করলেও ইমেইল-পাসওয়ার্ড দেওয়ার পর বাধ্যতামূলকভাবে ২-ফ্যাক্টর অথেন্টিকেটর কোড যাচাই করতে হবে।
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {config.isGeneralTotpEnabled 
                            ? '✅ বর্তমানে সাধারণ লগইনেও ২-ফ্যাক্টর কোড যাচাই কার্যকর রয়েছে।' 
                            : '⚡ বর্তমানে এটি বন্ধ (OFF) রাখা হয়েছে—যাতে সহজে সেটআপ সম্পন্ন করে সরাসরি প্রবেশ করা যায়।'}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 pt-1">
                      {config.isGeneralTotpEnabled ? (
                        <button
                          type="button"
                          onClick={() => handleToggleGeneral2FA(false)}
                          className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition shadow-xs text-xs whitespace-nowrap"
                        >
                          বন্ধ করুন (Turn OFF)
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleToggleGeneral2FA(true)}
                          className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl transition shadow-xs text-xs whitespace-nowrap flex items-center gap-1.5"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-purple-200" />
                          <span>চালু করুন (Turn ON)</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: MASTER CREDENTIALS / PASSWORD */}
          {activeTab === 'password' && (
            <form onSubmit={handleSaveCredentials} className="space-y-3.5">
              {credError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{credError}</span>
                </div>
              )}
              {credSuccess && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{credSuccess}</span>
                </div>
              )}

              <div>
                <label className="font-semibold text-slate-700 block mb-1">মাস্টার ইমেইল আইডি: *</label>
                <input
                  type="email"
                  required
                  value={newMasterEmail}
                  onChange={e => setNewMasterEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600 outline-none text-xs font-mono"
                  placeholder="jhanik1616@gmail.com"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  সুপার অ্যাডমিনের জন্য এই ইমেইল আইডি অনুমোদিত
                </span>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">বর্তমান মাস্টার পাসওয়ার্ড: *</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    value={currentPasswordInput}
                    onChange={e => setCurrentPasswordInput(e.target.value)}
                    placeholder="বর্তমান পাসওয়ার্ড লিখুন"
                    className="w-full pl-3 pr-9 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600 outline-none text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">নতুন পাসওয়ার্ড:</label>
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={newPasswordInput}
                    onChange={e => setNewPasswordInput(e.target.value)}
                    placeholder="নতুন গোপন পাসওয়ার্ড"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600 outline-none text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">নতুন পাসওয়ার্ড নিশ্চিত করুন:</label>
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={confirmPasswordInput}
                    onChange={e => setConfirmPasswordInput(e.target.value)}
                    placeholder="পুনরায় নতুন পাসওয়ার্ড লিখুন"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600 outline-none text-xs font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl transition shadow-xs text-xs mt-2"
              >
                ক্রেডেনশিয়াল সংরক্ষণ করুন
              </button>
            </form>
          )}

          {/* TAB 3: EMERGENCY RECOVERY CODES */}
          {activeTab === 'backup_codes' && (
            <div className="space-y-3.5">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs">
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>জরুরি ব্যাকআপ রিকভারি কোড (Emergency Backup Codes)</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  যদি কখনো আপনার ফোন হারিয়ে যায় বা গুগল অথেন্টিকেটর অ্যাপে প্রবেশ করতে না পারেন, তখন এই কোডগুলো দিয়ে সুপার অ্যাডমিনে লগইন করা যাবে। প্রতিটি কোড <strong>মাত্র একবার</strong> ব্যবহার করা যাবে।
                </p>
              </div>

              <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl font-mono text-center space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {config.backupCodes.length > 0 ? (
                    config.backupCodes.map((code, idx) => (
                      <div key={idx} className="p-2 bg-slate-800 rounded-lg border border-slate-700 tracking-wider font-bold">
                        {code}
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 text-rose-400 py-2">
                      সবগুলো ব্যাকআপ কোড ব্যবহার করা হয়ে গেছে। দয়া করে নতুন কোড জেনারেট করুন!
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCopyBackupCodes}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl transition text-xs flex items-center justify-center gap-1.5"
                >
                  {copiedBackup ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedBackup ? 'কপি করা হয়েছে' : 'কোডগুলো কপি করুন'}</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>JH IMSE Enterprise Security Engine v2.4</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg transition"
          >
            বন্ধ করুন
          </button>
        </div>

      </div>
    </div>
  );
};
