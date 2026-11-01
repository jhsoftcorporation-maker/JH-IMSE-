import React, { useState } from 'react';
import { 
  Sparkles, Store, ShieldCheck, ArrowRight, Zap, CheckCircle2, 
  BarChart3, Smartphone, Laptop, Globe, Layers, Users, Database,
  PlusCircle, ShoppingCart, Pill, Package, Wrench, ChevronRight,
  Phone, Mail, Lock, Check, Menu, X, FileText, CreditCard, Printer,
  Headphones, Server, ShieldAlert
} from 'lucide-react';
import { BusinessType, Tenant } from '../types';

interface LandingPageProps {
  tenants: Tenant[];
  onOpenStoreDashboard: (tenantId: string) => void;
  onOpenSuperAdmin: () => void;
  onCreateTenant: (newTenant: Omit<Tenant, 'id' | 'createdAt'>) => void;
  onOpenFreeTrialModal?: () => void;
  onOpenAuthModal?: () => void;
  onOpenSubscriptionModal?: (plan?: 'starter' | 'professional' | 'enterprise') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  tenants,
  onOpenStoreDashboard,
  onOpenSuperAdmin,
  onCreateTenant,
  onOpenFreeTrialModal,
  onOpenAuthModal,
  onOpenSubscriptionModal,
}) => {
  const [activeNiche, setActiveNiche] = useState<BusinessType>('pharmacy');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // New store form state
  const [newStoreName, setNewStoreName] = useState('');
  const [newBusinessType, setNewBusinessType] = useState<BusinessType>('grocery');
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');

  // Interactive Quote Calculator for Custom Software
  const [quotePlatform, setQuotePlatform] = useState<'web' | 'mobile' | 'both'>('web');
  const [quoteModules, setQuoteModules] = useState<{ [key: string]: boolean }>({
    inventory: true,
    pos: true,
    ecommerce: true,
    crm: false,
    ai: false,
  });

  const toggleModule = (key: string) => {
    setQuoteModules(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const calculatedQuote = () => {
    let base = quotePlatform === 'web' ? 35000 : quotePlatform === 'mobile' ? 45000 : 70000;
    if (quoteModules.inventory) base += 10000;
    if (quoteModules.pos) base += 15000;
    if (quoteModules.ecommerce) base += 20000;
    if (quoteModules.crm) base += 12000;
    if (quoteModules.ai) base += 25000;
    return base;
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoreName.trim()) return;

    const slug = newStoreName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const newTenantData: Omit<Tenant, 'id' | 'createdAt'> = {
      name: newStoreName,
      slug,
      businessType: newBusinessType,
      ownerName: newOwnerName || 'সম্মানিত স্বত্বাধিকারী',
      email: `${slug}@example.com`,
      phone: newPhone || '+880 1700-000000',
      address: newAddress || 'ঢাকা, বাংলাদেশ',
      currency: '৳',
      plan: 'professional',
      status: 'active',
      subscriptionExpiry: '2027-04-30',
      monthlyFee: 1999,
      quotas: {
        maxBranches: 3,
        maxUsers: 10,
        maxProducts: 10000,
        maxMonthlyInvoices: 5000,
        storageGb: 10,
      },
      usage: {
        currentBranches: 1,
        currentUsers: 1,
        currentProducts: 0,
        currentMonthlyInvoices: 0,
        currentStorageMb: 25,
      },
      features: {
        pos: true,
        ecommerce: true,
        crm: true,
        hrm: true,
        ai: true,
        pharmacyBatch: newBusinessType === 'pharmacy',
        imeiWarranty: newBusinessType === 'electronics',
        multiWarehouse: newBusinessType === 'warehouse',
      },
    };

    onCreateTenant(newTenantData);
    setShowCreateModal(false);
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-purple-100 selection:text-purple-900">
      {/* 1. Global Announcement / Support Strip */}
      <div className="bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-950 text-purple-200 py-2 px-4 text-xs border-b border-purple-900/40">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-200 font-bold text-[11px] border border-purple-400/30">
              <Sparkles className="w-3 h-3 text-purple-300 animate-pulse" /> JH Soft Corporation
            </span>
            <span className="hidden sm:inline text-slate-300">
              আধুনিক ব্যবসার নির্ভরযোগ্য ক্লাউড ইআরপি, স্মার্ট POS ও সাইট বিল্ডার প্ল্যাটফর্ম
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-300 text-xs">
            <a href="tel:+8801940999830" className="hover:text-white transition flex items-center gap-1">
              <Phone className="w-3 h-3 text-emerald-400" />
              <span>হেল্পলাইন: +880 1940-999830</span>
            </a>
            <span className="hidden md:inline text-purple-500">•</span>
            <a href="mailto:contact@jhsoftcorp.com" className="hidden md:flex hover:text-white transition items-center gap-1">
              <Mail className="w-3 h-3 text-purple-300" />
              <span>contact@jhsoftcorp.com</span>
            </a>
          </div>
        </div>
      </div>

      {/* 2. Primary Navigation Bar (Sticky, World-Class SaaS Standard) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-700 via-purple-800 to-indigo-900 text-white flex items-center justify-center font-black text-lg shadow-md shadow-purple-600/20">
              JH
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-slate-900 tracking-tight">JH IMSE</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-purple-100 text-purple-800">
                  Cloud ERP
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">JH Soft Corporation</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <button 
              onClick={() => scrollToSection('solutions')}
              className="hover:text-purple-700 transition"
            >
              ইন্ডাস্ট্রি সলিউশন
            </button>
            <button 
              onClick={() => scrollToSection('features')}
              className="hover:text-purple-700 transition"
            >
              কোর ফিচারসমূহ
            </button>
            <button 
              onClick={() => scrollToSection('pricing')}
              className="hover:text-purple-700 transition"
            >
              প্রাইসিং প্যাকেজ
            </button>
            <button 
              onClick={() => scrollToSection('custom-software')}
              className="hover:text-purple-700 transition"
            >
              কাস্টম সফটওয়্যার
            </button>
            <button 
              onClick={() => scrollToSection('team')}
              className="hover:text-purple-700 transition"
            >
              আমাদের টিম
            </button>
          </nav>

          {/* Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            {onOpenAuthModal && (
              <button
                onClick={onOpenAuthModal}
                className="px-4 py-2.5 text-slate-700 hover:text-purple-800 hover:bg-purple-50 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-slate-200"
              >
                <Lock className="w-3.5 h-3.5 text-purple-600" />
                <span>লগইন</span>
              </button>
            )}

            <button
              onClick={() => {
                if (onOpenFreeTrialModal) onOpenFreeTrialModal();
                else setShowCreateModal(true);
              }}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white font-bold rounded-xl text-xs shadow-md shadow-purple-600/20 hover:shadow-lg transition flex items-center gap-2"
            >
              <Store className="w-3.5 h-3.5 text-purple-200" />
              <span>ফ্রি ট্রায়াল শুরু করুন</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(prev => !prev)}
            className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-5 space-y-4 animate-in slide-in-from-top duration-150">
            <div className="flex flex-col space-y-3 font-semibold text-sm text-slate-700">
              <button 
                onClick={() => scrollToSection('solutions')}
                className="text-left py-1 hover:text-purple-700"
              >
                ইন্ডাস্ট্রি সলিউশন
              </button>
              <button 
                onClick={() => scrollToSection('features')}
                className="text-left py-1 hover:text-purple-700"
              >
                কোর ফিচারসমূহ
              </button>
              <button 
                onClick={() => scrollToSection('pricing')}
                className="text-left py-1 hover:text-purple-700"
              >
                প্রাইসিং প্যাকেজ
              </button>
              <button 
                onClick={() => scrollToSection('custom-software')}
                className="text-left py-1 hover:text-purple-700"
              >
                কাস্টম সফটওয়্যার
              </button>
              <button 
                onClick={() => scrollToSection('team')}
                className="text-left py-1 hover:text-purple-700"
              >
                আমাদের টিম
              </button>
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              {onOpenAuthModal && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuthModal();
                  }}
                  className="w-full py-2.5 text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5 text-purple-700" />
                  <span>লগইন করুন</span>
                </button>
              )}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onOpenFreeTrialModal) onOpenFreeTrialModal();
                  else setShowCreateModal(true);
                }}
                className="w-full py-3 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-sm"
              >
                <Store className="w-4 h-4" />
                <span>১৪ দিনের ফ্রি ট্রায়াল নিন</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 3. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-white via-purple-50/30 to-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100/80 border border-purple-200 text-purple-900 text-xs font-bold mb-6 shadow-xs">
              <Store className="w-4 h-4 text-purple-700" />
              <span>মুদি • ফার্মেসি • ইলেকট্রনিক্স • পাইকারি গোডাউন — সব ব্যবসার জন্য স্বয়ংসম্পূর্ণ</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-[1.15]">
              আপনার সম্পূর্ণ ব্যবসা পরিচালনা করুন এক <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800">আধুনিক ক্লাউড প্ল্যাটফর্মে</span>
            </h1>

            {/* Sub-headline */}
            <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              JH Soft Corporation নির্মিত আন্তর্জাতিক মানের এন্টারপ্রাইজ সিস্টেম। পান দ্রুততম বারকোড POS ক্যাশ কাউন্টার, ডিজিটাল বাকি খাতা, ওষুধ এক্সপায়ারি ও ওয়্যারহাউস স্টক এবং ১-ক্লিকে নিজস্ব ব্র্যান্ডের <strong>লাইভ অনলাইন ই-কমার্স স্টোরফ্রন্ট</strong>।
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => {
                  if (onOpenFreeTrialModal) onOpenFreeTrialModal();
                  else setShowCreateModal(true);
                }}
                className="px-7 py-3.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-2xl shadow-xl shadow-purple-600/25 hover:shadow-purple-700/35 transition flex items-center gap-2.5 text-sm transform hover:-translate-y-0.5"
              >
                <Store className="w-4 h-4" /> 
                <span>১৪ দিনের ফ্রি ট্রায়াল শুরু করুন</span> 
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onOpenStoreDashboard('tenant-1')}
                className="px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-bold rounded-2xl border border-slate-300 shadow-xs hover:border-purple-300 transition flex items-center gap-2 text-sm"
              >
                <Zap className="w-4 h-4 text-purple-600" /> 
                <span>লাইভ ইন্টারঅ্যাক্টিভ ডেমো দেখুন</span>
              </button>
            </div>

            {/* Trust Proof Points */}
            <div className="mt-10 pt-8 border-t border-slate-200/60 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-600 font-semibold">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>১-ক্লিক থার্মাল ও A4 ক্যাশ মেমো</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>বাকি কাস্টমারদের ফ্রি SMS নোটিফিকেশন</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>অফলাইন PWA ও ক্লাউড অটো-সিঙ্ক</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>৯৯.৯৯% হাই-সিকিউরিটি ব্যাকআপ</span>
              </div>
            </div>
          </div>

          {/* 4. Interactive Niche Switcher Live Preview */}
          <div id="solutions" className="mt-14 max-w-5xl mx-auto bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/80">
            <div className="text-center mb-6">
              <span className="text-xs uppercase font-bold tracking-wider text-purple-700">ইন্ডাস্ট্রি অনুযায়ী প্রস্তুতকৃত ফিচারস</span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">আপনার দোকানের ধরন বেছে নিয়ে লাইভ ইন্টারফেস দেখুন:</h3>
            </div>

            {/* Niche Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-8">
              {[
                { id: 'pharmacy', label: 'ফার্মেসি ও ড্রাগ স্টোর', icon: Pill, tenantId: 'tenant-1' },
                { id: 'grocery', label: 'মুদি ও ডিপার্টমেন্টাল', icon: ShoppingCart, tenantId: 'tenant-2' },
                { id: 'electronics', label: 'ইলেকট্রনিক্স ও গ্যাজেট', icon: Laptop, tenantId: 'tenant-3' },
                { id: 'warehouse', label: 'পাইকারি ও গোডাউন', icon: Package, tenantId: 'tenant-4' },
              ].map(item => {
                const Icon = item.icon;
                const isActive = activeNiche === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveNiche(item.id as BusinessType)}
                    className={`p-4 rounded-2xl text-left border transition flex flex-col gap-2.5 ${
                      isActive
                        ? 'bg-purple-50 border-purple-600 text-purple-950 shadow-xs ring-2 ring-purple-600/20'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-purple-700' : 'text-slate-400'}`} />
                    <span className="text-xs font-bold leading-tight">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Selected Niche Details */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 grid md:grid-cols-2 gap-8 items-center">
              <div>
                <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-500/30">
                  {activeNiche === 'pharmacy' && 'ফার্মেসি স্পেশালাইজড ইঞ্জিন'}
                  {activeNiche === 'grocery' && 'সুপারশপ ও মুদি ক্যাশ কাউন্টার'}
                  {activeNiche === 'electronics' && 'সিরিয়াল ও IMEI ওয়ারেন্টি মোড'}
                  {activeNiche === 'warehouse' && 'মাল্টি-ডিপো ও পাইকারি হোলসেল মোড'}
                </span>

                <h4 className="text-xl font-black mt-3 text-white leading-snug">
                  {activeNiche === 'pharmacy' && 'ওষুধের মেয়াদ শেষ (Expiry), ব্যাচ নম্বর ও প্রেসক্রিপশন জেনেরিক সার্চ'}
                  {activeNiche === 'grocery' && 'বারকোড স্ক্যানার, ডিজিটাল স্কেল ওজন ও মাউস ছাড়া ৩ সেকেন্ডে মেমো'}
                  {activeNiche === 'electronics' && 'IMEI সিরিয়াল ট্র্যাকিং, সার্ভিসিং টিকেট ও ১-ক্লিক ওয়ারেন্টি স্লিপ'}
                  {activeNiche === 'warehouse' && 'কার্টুন/বস্তা স্টক ট্র্যাকিং, ডিপো শিফটিং চালান ও হোলসেল রেট'}
                </h4>

                <p className="text-xs sm:text-sm text-slate-300 mt-3 leading-relaxed">
                  {activeNiche === 'pharmacy' && 'কোন ওষুধ আগামী ৩০ দিনে মেয়াদোত্তীর্ণ হবে ড্যাশবোর্ডে লাল সতর্কতা দেবে। জেনেরিক নাম লিখে সার্চ দিলে তাৎক্ষণিক বিকল্প ওষুধ সাজেস্ট করে।'}
                  {activeNiche === 'grocery' && 'কীবোর্ড শর্টকাট দিয়ে দ্রুত ক্যাশ মেমো প্রিন্ট। চাল, ডাল, আলুর মতো লুজ আইটেমের জন্য ইলেকট্রনিক ডিজিটাল স্কেল সাপোর্ট।'}
                  {activeNiche === 'electronics' && 'মোবাইল বা গ্যাজেটের আইএমইআই স্ক্যান করে বিক্রি। ইনভয়েসের নিচে ওয়ারেন্টির কিউআর কোড অটোমেটিক প্রিন্ট হয়ে যাবে।'}
                  {activeNiche === 'warehouse' && 'গোডাউন-১ থেকে গোডাউন-২ এ স্টক ট্রান্সফার এবং বাল্ক অর্ডারে অটোমেটিক পাইকারি মূল্য কার্যকর।'}
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      const t = tenants.find(x => x.businessType === activeNiche) || tenants[0];
                      onOpenStoreDashboard(t.id);
                    }}
                    className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-md shadow-purple-600/30"
                  >
                    <span>এই ক্যাটাগরির লাইভ ERP ড্যাশবোর্ড দেখুন</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Live Preview Display Box */}
              <div className="bg-slate-800/90 rounded-2xl p-5 border border-slate-700 text-xs font-mono space-y-3 shadow-inner">
                <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-purple-400 font-bold tracking-wider">LIVE STORE TELEMETRY</span>
                  </div>
                  <span className="text-slate-400 text-[10px]">Cloud Active</span>
                </div>
                <div className="space-y-2 text-slate-300 text-[11px]">
                  <div className="flex justify-between py-1 border-b border-slate-700/50">
                    <span className="text-slate-400">আজকের মোট বিক্রয়:</span>
                    <span className="text-emerald-400 font-bold font-sans">৳ ১৮,৫৪০.০০</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-700/50">
                    <span className="text-slate-400">বাকি খাতায় বকেয়া আদায়:</span>
                    <span className="text-amber-400 font-bold font-sans">৳ ৪,২০০.০০</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-700/50">
                    <span className="text-slate-400">অনলাইন স্টোরে অর্ডার:</span>
                    <span className="text-purple-300 font-bold font-sans">৩টি নতুন পেন্ডিং</span>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl border border-purple-500/30 text-purple-200 text-[11px] leading-relaxed font-sans">
                    💡 <strong>স্মার্ট স্টক ইনসাইট:</strong> &quot;গত সপ্তাহের তুলনায় আজ বিক্রি ২৪% বৃদ্ধি পেয়েছে। দ্রুত রিকুইজিশন তৈরি করুন!&quot;
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Core Platform Modules Grid */}
      <section id="features" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs uppercase font-bold text-purple-700 tracking-wider">কমপ্লিট ইকোসিস্টেম</span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mt-1">
              এক নজরে আমাদের মূল মডিউলসমূহ
            </h2>
            <p className="text-slate-600 text-sm mt-2">
              আপনার ব্যবসার প্রতিটি ধাপ সুনির্দিষ্ট ও স্বয়ংক্রিয়ভাবে পরিচালনার জন্য প্রস্তুত।
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:border-purple-300 transition group">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-4 group-hover:scale-105 transition">
                <Store className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900">দ্রুততম ক্লাউড POS কাউন্টার</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                বারকোড স্ক্যানার দিয়ে চোখের পলকে বিক্রয়, কাস্টমার স্ক্রিন ডিসপ্লে (CFD), থার্মাল ও A4 রসিদ প্রিন্ট এবং অফলাইন মোড সাপোর্ট।
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:border-purple-300 transition group">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-4 group-hover:scale-105 transition">
                <Package className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900">মাল্টি-গোডাউন ইনভেন্টরি</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                ব্রাঞ্চ টু ডিপো গেটপাস চালান, লো-স্টক এলার্ট, ব্যাচ ও এক্সপায়ারি ট্র্যাকিং এবং ফিজিক্যাল স্টক অডিট রিকনসিলিয়েশন।
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:border-purple-300 transition group">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4 group-hover:scale-105 transition">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900">ডিজিটাল বাকি খাতা ও SMS তাগাদা</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                কাস্টমার লেজার, ১-ক্লিকে বকেয়া পরিশোধ রসিদ এবং কাস্টমারকে ফ্রিতে স্বয়ংক্রিয় বাংলা এসএমএস রিমাইন্ডার পাঠানো।
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:border-purple-300 transition group">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4 group-hover:scale-105 transition">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900">ব্র্যান্ডেড ই-কমার্স স্টোরফ্রন্ট</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                নিজস্ব অনলাইন ওয়েবসাইট, সরাসরি অর্ডার রিসিভ, বিকাশ ও কার্ড পেমেন্ট গেটওয়ে এবং স্টিডফাস্ট কুরিয়ার চালান জেনারেশন।
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:border-purple-300 transition group">
              <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center mb-4 group-hover:scale-105 transition">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900">ডাবল-এন্ট্রি একাউন্টিং ও লাভ-ক্ষতি</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                চার্ট অফ অ্যাকাউন্টস, জেনারেল জার্নাল ভাউচার, সাপ্লায়ার বিল ও ব্যালান্স শিট রিপোর্ট—নিখুঁত ব্যবসায়িক হিসাব।
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:border-purple-300 transition group">
              <div className="w-12 h-12 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center mb-4 group-hover:scale-105 transition">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900">AI ফোরকাস্টিং ও অটো-পারচেজ (PO)</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                কোন পণ্যের চাহিদা বাড়ছে বা ডেড স্টক পড়ে আছে তা আগে থেকেই পূর্বাভাস এবং ১-ক্লিকে সাপ্লায়ারের জন্য পারচেজ অর্ডার তৈরি।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Custom Software Development & Quote Estimator */}
      <section id="custom-software" className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase font-bold text-purple-700 tracking-wider">JH Soft কাস্টম আইটি সার্ভিস পোর্টাল</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              কাস্টম ওয়েবসাইট ও মোবাইল অ্যাপ ডেভেলপমেন্ট
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-2">
              স্ট্যান্ডার্ড ইআরপি ছাড়াও আপনার প্রতিষ্ঠানের যেকোনো বিশেষ চাহিদামাফিক ওয়েব পোর্টাল, মোবাইল অ্যাপ এবং কাস্টম ডাটাবেজ সিস্টেম আমরা প্রস্তুত করে দিই।
            </p>
          </div>

          {/* Interactive Project Cost Estimator */}
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-purple-200 shadow-md">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="space-y-5 max-w-xl flex-1">
                <div>
                  <span className="text-xs font-bold uppercase text-purple-700 tracking-wider">ইন্টারেক্টিভ খরচ ক্যালকুলেটর</span>
                  <h3 className="text-xl font-bold text-slate-900 mt-1">আপনার কাস্টম প্রজেক্টের সম্ভাব্য খরচ হিসাব করুন</h3>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">প্ল্যাটফর্ম বেছে নিন:</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'web', label: 'ওয়েব অ্যাপ্লিকেশন' },
                      { id: 'mobile', label: 'মোবাইল অ্যাপ' },
                      { id: 'both', label: 'ওয়েব + মোবাইল কম্বো' },
                    ].map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setQuotePlatform(p.id as any)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                          quotePlatform === p.id 
                            ? 'bg-purple-700 text-white shadow-xs' 
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-2">প্রয়োজনীয় মডিউলসমূহ সিলেক্ট করুন:</label>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {[
                      { id: 'inventory', label: 'ইনভেন্টরি ও স্টক' },
                      { id: 'pos', label: 'POS ক্যাশ কাউন্টার' },
                      { id: 'ecommerce', label: 'অনলাইন ই-কমার্স' },
                      { id: 'crm', label: 'CRM ও এসএমএস খাতা' },
                      { id: 'ai', label: 'গুগল এআই প্রেডিকশন' },
                    ].map(f => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => toggleModule(f.id)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
                          quoteModules[f.id] 
                            ? 'bg-purple-100 text-purple-900 border-purple-400 font-bold' 
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {quoteModules[f.id] ? '✓ ' : '+ '}{f.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Estimate Display Card */}
              <div className="bg-purple-50 rounded-2xl p-6 sm:p-8 border border-purple-200 shadow-sm text-center min-w-[280px]">
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">আনুমানিক ডেভেলপমেন্ট বাজেট:</span>
                <div className="text-3xl sm:text-4xl font-black text-purple-800 mt-2">
                  ৳ {calculatedQuote().toLocaleString()}
                </div>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">ডেলিভারি সময়: ১৫ - ২৫ কার্যদিবস</p>
                <button
                  onClick={() => alert(`ধন্যবাদ! আপনার কাস্টম সফটওয়্যার চাহিদার কোটেশন জমা হয়েছে। আনুমানিক বাজেট: ৳ ${calculatedQuote().toLocaleString()}। আমাদের টিম শীঘ্রই যোগাযোগ করবে।`)}
                  className="mt-5 w-full py-3 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition shadow-md"
                >
                  প্রজেক্ট পরামর্শের জন্য রিকোয়েস্ট পাঠান
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. SaaS Pricing Plans */}
      <section id="pricing" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs uppercase font-bold text-purple-700 tracking-wider">সাশ্রয়ী সাবস্ক্রিপশন প্যাকেজ</span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mt-1">
              যেকোনো আকারের দোকানের জন্য উপযুক্ত প্ল্যান
            </h2>
            <div className="mt-5 inline-flex items-center p-1 bg-slate-100 border border-slate-200 rounded-2xl shadow-xs">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  billingCycle === 'monthly' ? 'bg-purple-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                মাসিক বিলিং
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  billingCycle === 'yearly' ? 'bg-purple-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                বাৎসরিক বিলিং <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full ml-1">২ মাস ফ্রি!</span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
            {/* Starter */}
            <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">স্টার্টার প্ল্যান</span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">ছোট মুদি ও খুচরা দোকান</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900">
                    ৳ {billingCycle === 'monthly' ? '৯৯৯' : '৮৫০'}
                  </span>
                  <span className="text-xs text-slate-500">/ মাস</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">একটি আউটলেটের সম্পূর্ণ দৈনিক হিসাব ও বিক্রয়ের জন্য সেরা।</p>
                
                <ul className="mt-6 space-y-3 text-xs text-slate-600">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> ১টি আউটলেট ও আনলিমিটেড পণ্য</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> POS ক্যাশ কাউন্টার ও রসিদ প্রিন্ট</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> কাস্টমার বাকি খাতা (ডিজিটাল লেজার)</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> দৈনিক ও মাসিক লাভ-ক্ষতি রিপোর্ট</li>
                </ul>
              </div>

              <button
                onClick={() => {
                  if (onOpenSubscriptionModal) onOpenSubscriptionModal('starter');
                  else if (onOpenFreeTrialModal) onOpenFreeTrialModal();
                  else setShowCreateModal(true);
                }}
                className="mt-8 w-full py-3 bg-slate-100 hover:bg-purple-100 text-purple-900 font-bold rounded-xl text-xs transition"
              >
                স্টার্টার প্ল্যান কিনুন (বা ফ্রি ট্রায়াল)
              </button>
            </div>

            {/* Professional (Popular) */}
            <div className="bg-white rounded-3xl p-7 border-2 border-purple-600 shadow-xl relative flex flex-col justify-between">
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-purple-700 to-indigo-700 text-white text-[11px] font-black rounded-full uppercase tracking-wider shadow-md">
                সবচেয়ে জনপ্রিয় প্যাকেজ
              </span>
              <div>
                <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">প্রফেশনাল প্ল্যান</span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">ফার্মেসি, সুপারশপ ও গ্যাজেট</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-purple-700">
                    ৳ {billingCycle === 'monthly' ? '১,৯৯৯' : '১,৬৫০'}
                  </span>
                  <span className="text-xs text-slate-500">/ মাস</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">ইনভেন্টরি, নিজস্ব অনলাইন ই-কমার্স সাইট ও এসএমএস অ্যালার্ট সহ কমপ্লিট সলিউশন।</p>
                
                <ul className="mt-6 space-y-3 text-xs text-slate-700">
                  <li className="flex items-center gap-2 font-semibold"><CheckCircle2 className="w-4 h-4 text-purple-600" /> স্টার্টার প্ল্যানের সকল ফিচার</li>
                  <li className="flex items-center gap-2 font-semibold"><CheckCircle2 className="w-4 h-4 text-purple-600" /> নিজস্ব অনলাইন ই-কমার্স ওয়েবসাইট</li>
                  <li className="flex items-center gap-2 font-semibold"><CheckCircle2 className="w-4 h-4 text-purple-600" /> এক্সপায়ারি ডেট, ব্যাচ ও IMEI ট্র্যাকিং</li>
                  <li className="flex items-center gap-2 font-semibold"><CheckCircle2 className="w-4 h-4 text-purple-600" /> বাকি কাস্টমারদের অটোমেটেড SMS অ্যালার্ট</li>
                  <li className="flex items-center gap-2 font-semibold"><CheckCircle2 className="w-4 h-4 text-purple-600" /> মাল্টি-ইউজার রোলস (মালিক, ম্যানেজার, ক্যাশিয়ার)</li>
                </ul>
              </div>

              <button
                onClick={() => {
                  if (onOpenSubscriptionModal) onOpenSubscriptionModal('professional');
                  else if (onOpenFreeTrialModal) onOpenFreeTrialModal();
                  else setShowCreateModal(true);
                }}
                className="mt-8 w-full py-3.5 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white font-bold rounded-xl text-xs shadow-md transition"
              >
                এখনই প্রফেশনাল প্যাকেজ কিনুন
              </button>
            </div>

            {/* Enterprise */}
            <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">এন্টারপ্রাইজ প্ল্যান</span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">গোডাউন ও মাল্টি-ব্রাঞ্চ চেইন</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900">
                    ৳ {billingCycle === 'monthly' ? '৩,৯৯৯' : '৩,৪০০'}
                  </span>
                  <span className="text-xs text-slate-500">/ মাস</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">আনলিমিটেড ওয়্যারহাউস, এইচআরএম, প্যারোল ও প্রেডিক্টিভ বিজনেস ইন্টেলিজেন্স।</p>
                
                <ul className="mt-6 space-y-3 text-xs text-slate-600">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> আনলিমিটেড ব্রাঞ্চ ও সেন্ট্রাল ওয়্যারহাউস</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> HRM, স্টাফ হাজিরা ও কমিশন প্যারোল</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> অটোমেটেড সেলস ফোরকাস্টিং ও ইনসাইটস</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> কাস্টম ডোমেইন কানেকশন ও ফ্রি SSL</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> ২৪/৭ ডেডিকেটেড ফোন ও অন-সাইট সাপোর্ট</li>
                </ul>
              </div>

              <button
                onClick={() => {
                  if (onOpenSubscriptionModal) onOpenSubscriptionModal('enterprise');
                  else if (onOpenFreeTrialModal) onOpenFreeTrialModal();
                  else setShowCreateModal(true);
                }}
                className="mt-8 w-full py-3 bg-slate-100 hover:bg-purple-100 text-purple-900 font-bold rounded-xl text-xs transition"
              >
                এন্টারপ্রাইজ প্যাকেজ কিনুন
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Core Team & Leadership */}
      <section id="team" className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase font-bold text-purple-700 tracking-wider">JH Soft Corporation কোর টিম</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              আমাদের লিডারশিপ ও ইঞ্জিনিয়ারিং টিম
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-2">
              অভিজ্ঞ ডেভেলপার ও ডিজাইনারদের সরাসরি তত্ত্বাবধানে তৈরি আন্তর্জাতিক মানের এন্টারপ্রাইজ ক্লাউড সফটওয়্যার।
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* 1. CEO & Main Developer */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 text-center hover:border-purple-300 transition shadow-xs">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-700 to-indigo-900 text-white font-bold text-xl flex items-center justify-center mx-auto mb-3 shadow-md">
                JA
              </div>
              <h3 className="font-bold text-base text-slate-900">Md Junayed Hossain Anik</h3>
              <p className="text-xs font-semibold text-purple-700 mt-0.5">CEO & Main Developer</p>
              <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                JH Soft Corporation-এর প্রধান নির্বাহী ও কোর সফটওয়্যার আর্কিটেকচার ডেভেলপার।
              </p>
            </div>

            {/* 2. Architecture Designer */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 text-center hover:border-purple-300 transition shadow-xs">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-700 to-slate-900 text-white font-bold text-xl flex items-center justify-center mx-auto mb-3 shadow-md">
                MA
              </div>
              <h3 className="font-bold text-base text-slate-900">MD Abdullah</h3>
              <p className="text-xs font-semibold text-indigo-700 mt-0.5">Architecture Designer</p>
              <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                মাল্টি-টেন্যান্ট ডেটাবেস ও হাই-স্কেলিং সিস্টেম আর্কিটেকচার পরিকল্পনাকারী।
              </p>
            </div>

            {/* 3. UI & UX Designer */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 text-center hover:border-purple-300 transition shadow-xs">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-600 to-teal-800 text-white font-bold text-xl flex items-center justify-center mx-auto mb-3 shadow-md">
                HA
              </div>
              <h3 className="font-bold text-base text-slate-900">MD Husain Ahmed</h3>
              <p className="text-xs font-semibold text-emerald-700 mt-0.5">UI & UX Designer</p>
              <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                সহজ, আকর্ষণীয় ও আধুনিক ইউজার এক্সপেরিয়েন্স ডিজাইনার।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. International Standard SaaS Footer */}
      <footer id="contact" className="bg-slate-950 text-slate-400 py-14 text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-700 text-white flex items-center justify-center font-bold text-xs">
                  JH
                </div>
                <span className="text-white font-bold text-base tracking-tight">JH IMSE — JH Soft Corporation</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
                বাংলাদেশের যে কোনো ধরণের রিটেইল, পাইকারি ও ডিস্ট্রিবিউশন ব্যবসায়ের পূর্ণাঙ্গ ডিজিটাল রূপান্তরের জন্য অল-ইন-ওয়ান ক্লাউড ইআরপি ও ই-কমার্স সাইট বিল্ডার।
              </p>
              <p className="text-slate-300 font-semibold text-xs">
                📞 হেল্পলাইন: +880 1940-999830 | ✉️ contact@jhsoftcorp.com
              </p>
            </div>

            <div>
              <h4 className="text-white font-bold mb-3 text-xs uppercase tracking-wider">সলিউশন ও ফিচার</h4>
              <ul className="space-y-2 text-slate-400 text-xs">
                <li><button onClick={() => scrollToSection('solutions')} className="hover:text-purple-400 transition">ফার্মেসি ড্রাগ স্টোর</button></li>
                <li><button onClick={() => scrollToSection('solutions')} className="hover:text-purple-400 transition">মুদি ও সুপারশপ POS</button></li>
                <li><button onClick={() => scrollToSection('solutions')} className="hover:text-purple-400 transition">ইলেকট্রনিক্স ও IMEI</button></li>
                <li><button onClick={() => scrollToSection('solutions')} className="hover:text-purple-400 transition">পাইকারি ও সেন্ট্রাল গোডাউন</button></li>
                <li><button onClick={() => scrollToSection('features')} className="hover:text-purple-400 transition">অনলাইন ই-কমার্স সাইট</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-3 text-xs uppercase tracking-wider">কোম্পানি ও পোর্টাল</h4>
              <ul className="space-y-2 text-slate-400 text-xs">
                <li><button onClick={() => scrollToSection('team')} className="hover:text-purple-400 transition">আমাদের টিম পরিচিতি</button></li>
                <li><button onClick={() => scrollToSection('pricing')} className="hover:text-purple-400 transition">সাবস্ক্রিপশন প্ল্যানস</button></li>
                <li>
                  <button 
                    onClick={onOpenSuperAdmin} 
                    className="text-purple-400 hover:text-purple-300 font-semibold transition flex items-center gap-1"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" /> সুপার অ্যাডমিন পোর্টাল
                  </button>
                </li>
                <li>
                  <a 
                    href="#setup"
                    className="text-amber-400 hover:text-amber-300 font-semibold transition flex items-center gap-1"
                  >
                    <Server className="w-3.5 h-3.5" /> হোস্টিংগার সেটআপ উইজার্ড
                  </a>
                </li>
                <li><button onClick={() => setShowCreateModal(true)} className="hover:text-purple-400 transition">নতুন স্টোর তৈরি</button></li>
              </ul>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <p>© {new Date().getFullYear()} JH Soft Corporation. সর্বস্বত্ব সংরক্ষিত।</p>
            <p>Developed with excellence by Md Junayed Hossain Anik, MD Abdullah & MD Husain Ahmed</p>
          </div>
        </div>
      </footer>

      {/* Store Creation Modal (Instant Direct Form) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-purple-100 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="bg-purple-800 text-white px-5 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">আপনার ফ্রি ট্রায়াল স্টোর খুলুন</h3>
                <p className="text-xs text-purple-200">১৪ দিনের সম্পূর্ণ অ্যাক্সেস, কোনো ক্রেডিট কার্ড লাগবে না</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-purple-200 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">দোকানের নাম (Store Name): *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: মা ফার্মেসি / ভাই ভাই জেনারেল স্টোর"
                  value={newStoreName}
                  onChange={e => setNewStoreName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">ব্যবসার ধরন (Business Category): *</label>
                <select
                  value={newBusinessType}
                  onChange={e => setNewBusinessType(e.target.value as BusinessType)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-purple-600 focus:outline-none"
                >
                  <option value="pharmacy">ফার্মেসি ও ড্রাগ স্টোর (মেয়াদ ও ব্যাচ ট্র্যাকিং সহ)</option>
                  <option value="grocery">মুদি দোকান ও সুপারশপ (বারকোড ও ডিজিটাল স্কেল সহ)</option>
                  <option value="electronics">ইলেকট্রনিক্স ও গ্যাজেট (IMEI ও ওয়ারেন্টি স্লিপ সহ)</option>
                  <option value="warehouse">পাইকারি ও সেন্ট্রাল গোডাউন (মাল্টি-ডিপো স্টক)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">স্বত্বাধিকারী / মালিকের নাম:</label>
                <input
                  type="text"
                  placeholder="আপনার নাম"
                  value={newOwnerName}
                  onChange={e => setNewOwnerName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">মোবাইল নম্বর (এসএমএস ও লগইনের জন্য):</label>
                <input
                  type="tel"
                  placeholder="+880 17xxxxxxxx"
                  value={newPhone}
                  onChange={e => setNewPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">দোকানের ঠিকানা:</label>
                <input
                  type="text"
                  placeholder="দোকান নং, বাজার বা রাস্তার নাম, জেলা"
                  value={newAddress}
                  onChange={e => setNewAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center justify-center gap-1.5"
                >
                  <Store className="w-4 h-4" /> ইনস্ট্যান্ট স্টোর তৈরি ও ড্যাশবোর্ডে প্রবেশ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
