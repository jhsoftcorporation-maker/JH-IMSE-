import React, { useState, useMemo } from 'react';
import {
  Users, Award, Percent, DollarSign, Plus, Search, Printer,
  CheckCircle2, AlertTriangle, TrendingUp, Filter, Calendar,
  Shield, Check, ArrowRight, UserCheck, Briefcase, FileText,
  BarChart2, Edit3, Trash2, X, ChevronRight, Sparkles, Building2,
  Clock, CreditCard, ChevronDown, CheckCircle, Target
} from 'lucide-react';
import {
  Tenant, SalesAgent, CommissionProgram, CommissionRule,
  CommissionReceipt, CommissionCalculationType
} from '../../types';

interface CommissionManagerProps {
  tenant: Tenant;
  agents: SalesAgent[];
  programs: CommissionProgram[];
  rules: CommissionRule[];
  receipts: CommissionReceipt[];
  initialTab?: 'agents' | 'programs' | 'rules' | 'receipts' | 'reports';
  onSaveAgent: (agentData: Omit<SalesAgent, 'id'>, existingId?: string) => void;
  onDeleteAgent: (agentId: string) => void;
  onSaveProgram: (programData: Omit<CommissionProgram, 'id'>, existingId?: string) => void;
  onDeleteProgram: (programId: string) => void;
  onSaveRule: (ruleData: Omit<CommissionRule, 'id'>, existingId?: string) => void;
  onDeleteRule: (ruleId: string) => void;
  onSaveReceipt: (receiptData: Omit<CommissionReceipt, 'id'>) => void;
}

export const CommissionManager: React.FC<CommissionManagerProps> = ({
  tenant,
  agents,
  programs,
  rules,
  receipts,
  initialTab = 'agents',
  onSaveAgent,
  onDeleteAgent,
  onSaveProgram,
  onDeleteProgram,
  onSaveRule,
  onDeleteRule,
  onSaveReceipt,
}) => {
  // Navigation Sub-tab
  const [activeTab, setActiveTab] = useState<'agents' | 'programs' | 'rules' | 'receipts' | 'reports'>(initialTab);

  // Search and Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProgramFilter, setSelectedProgramFilter] = useState('all');

  // Modals
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<SalesAgent | null>(null);

  const [isProgramModalOpen, setIsProgramModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<CommissionProgram | null>(null);

  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<CommissionRule | null>(null);

  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [receiptAgentId, setReceiptAgentId] = useState<string>('');

  const [viewingReceipt, setViewingReceipt] = useState<CommissionReceipt | null>(null);

  // Filtered Datasets
  const tenantAgents = useMemo(() => {
    return agents.filter(a => a.tenantId === tenant.id &&
      (selectedProgramFilter === 'all' || a.programId === selectedProgramFilter) &&
      (searchQuery === '' ||
       a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       a.territory.toLowerCase().includes(searchQuery.toLowerCase()) ||
       a.phone.includes(searchQuery)));
  }, [agents, tenant.id, selectedProgramFilter, searchQuery]);

  const tenantPrograms = useMemo(() => {
    return programs.filter(p => p.tenantId === tenant.id &&
      (searchQuery === '' ||
       p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
       p.code.toLowerCase().includes(searchQuery.toLowerCase())));
  }, [programs, tenant.id, searchQuery]);

  const tenantRules = useMemo(() => {
    return rules.filter(r => r.tenantId === tenant.id &&
      (searchQuery === '' || r.name.toLowerCase().includes(searchQuery.toLowerCase())));
  }, [rules, tenant.id, searchQuery]);

  const tenantReceipts = useMemo(() => {
    return receipts.filter(r => r.tenantId === tenant.id &&
      (searchQuery === '' ||
       r.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
       r.agentName.toLowerCase().includes(searchQuery.toLowerCase())));
  }, [receipts, tenant.id, searchQuery]);

  // Aggregate Metrics
  const totalAgents = tenantAgents.length;
  const totalSalesThisMonth = tenantAgents.reduce((acc, a) => acc + a.currentMonthSales, 0);
  const totalEarnedCommission = tenantAgents.reduce((acc, a) => acc + a.earnedCommission, 0);
  const totalDueCommission = tenantAgents.reduce((acc, a) => acc + a.dueCommission, 0);
  const totalPaidCommission = tenantAgents.reduce((acc, a) => acc + a.paidCommission, 0);

  // =========================================================================
  // AGENT FORM STATE
  // =========================================================================
  const [agName, setAgName] = useState('');
  const [agPhone, setAgPhone] = useState('');
  const [agEmail, setAgEmail] = useState('');
  const [agNid, setAgNid] = useState('');
  const [agTerritory, setAgTerritory] = useState('');
  const [agProgramId, setAgProgramId] = useState('');
  const [agTarget, setAgTarget] = useState<number>(150000);
  const [agStatus, setAgStatus] = useState<'active' | 'inactive'>('active');
  const [agNotes, setAgNotes] = useState('');

  const handleOpenCreateAgent = () => {
    setEditingAgent(null);
    setAgName('');
    setAgPhone('');
    setAgEmail('');
    setAgNid('');
    setAgTerritory('ঢাকা নর্থ ও ধানমন্ডি জোন');
    setAgProgramId(tenantPrograms[0]?.id || '');
    setAgTarget(150000);
    setAgStatus('active');
    setAgNotes('');
    setIsAgentModalOpen(true);
  };

  const handleOpenEditAgent = (agent: SalesAgent) => {
    setEditingAgent(agent);
    setAgName(agent.name);
    setAgPhone(agent.phone);
    setAgEmail(agent.email);
    setAgNid(agent.nationalId || '');
    setAgTerritory(agent.territory);
    setAgProgramId(agent.programId);
    setAgTarget(agent.monthlyTargetSales);
    setAgStatus(agent.status);
    setAgNotes(agent.notes || '');
    setIsAgentModalOpen(true);
  };

  const handleSaveAgentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agName.trim() || !agPhone.trim()) return;

    const prog = tenantPrograms.find(p => p.id === agProgramId);

    const agentPayload: Omit<SalesAgent, 'id'> = {
      tenantId: tenant.id,
      name: agName.trim(),
      phone: agPhone.trim(),
      email: agEmail.trim(),
      nationalId: agNid.trim(),
      territory: agTerritory.trim(),
      programId: agProgramId,
      programTitle: prog?.title || 'স্ট্যান্ডার্ড কমিশন স্কিম',
      monthlyTargetSales: Number(agTarget),
      currentMonthSales: editingAgent ? editingAgent.currentMonthSales : 0,
      earnedCommission: editingAgent ? editingAgent.earnedCommission : 0,
      paidCommission: editingAgent ? editingAgent.paidCommission : 0,
      dueCommission: editingAgent ? editingAgent.dueCommission : 0,
      performanceRating: editingAgent ? editingAgent.performanceRating : 'on_track',
      status: agStatus,
      joinedDate: editingAgent ? editingAgent.joinedDate : new Date().toISOString().split('T')[0],
      notes: agNotes.trim(),
    };

    onSaveAgent(agentPayload, editingAgent?.id);
    setIsAgentModalOpen(false);
  };

  // =========================================================================
  // PROGRAM FORM STATE
  // =========================================================================
  const [prTitle, setPrTitle] = useState('');
  const [prCode, setPrCode] = useState('');
  const [prDescription, setPrDescription] = useState('');
  const [prCalcType, setPrCalcType] = useState<CommissionCalculationType>('percentage_of_sales');
  const [prBaseRate, setPrBaseRate] = useState<number>(3.0);
  const [prBonusAmount, setPrBonusAmount] = useState<number>(5000);
  const [prTargetThreshold, setPrTargetThreshold] = useState<number>(150000);

  const handleOpenCreateProgram = () => {
    setEditingProgram(null);
    setPrTitle('');
    setPrCode(`PROG-COMM-${tenantPrograms.length + 1}`);
    setPrDescription('');
    setPrCalcType('percentage_of_sales');
    setPrBaseRate(3.0);
    setPrBonusAmount(5000);
    setPrTargetThreshold(150000);
    setIsProgramModalOpen(true);
  };

  const handleOpenEditProgram = (prog: CommissionProgram) => {
    setEditingProgram(prog);
    setPrTitle(prog.title);
    setPrCode(prog.code);
    setPrDescription(prog.description);
    setPrCalcType(prog.calculationType);
    setPrBaseRate(prog.baseRatePercent);
    setPrBonusAmount(prog.targetBonusAmount);
    setPrTargetThreshold(prog.monthlyTargetThreshold);
    setIsProgramModalOpen(true);
  };

  const handleSaveProgramSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prTitle.trim()) return;

    const programPayload: Omit<CommissionProgram, 'id'> = {
      tenantId: tenant.id,
      title: prTitle.trim(),
      code: prCode.trim(),
      description: prDescription.trim(),
      calculationType: prCalcType,
      baseRatePercent: Number(prBaseRate),
      targetBonusAmount: Number(prBonusAmount),
      monthlyTargetThreshold: Number(prTargetThreshold),
      rules: editingProgram ? editingProgram.rules : [],
      status: 'active',
      createdAt: editingProgram ? editingProgram.createdAt : new Date().toISOString().split('T')[0],
    };

    onSaveProgram(programPayload, editingProgram?.id);
    setIsProgramModalOpen(false);
  };

  // =========================================================================
  // RULE FORM STATE
  // =========================================================================
  const [rlProgramId, setRlProgramId] = useState<string>(tenantPrograms[0]?.id || '');
  const [rlName, setRlName] = useState('');
  const [rlCondition, setRlCondition] = useState<CommissionRule['condition']>('min_sales_amount');
  const [rlThreshold, setRlThreshold] = useState<number>(100000);
  const [rlBrandName, setRlBrandName] = useState('');
  const [rlRewardType, setRlRewardType] = useState<'rate_boost_pct' | 'fixed_bonus_bdt'>('rate_boost_pct');
  const [rlRewardValue, setRlRewardValue] = useState<number>(1.5);
  const [rlDescription, setRlDescription] = useState('');

  const handleOpenCreateRule = () => {
    setEditingRule(null);
    setRlProgramId(tenantPrograms[0]?.id || '');
    setRlName('');
    setRlCondition('min_sales_amount');
    setRlThreshold(100000);
    setRlBrandName('Square Pharmaceuticals Ltd.');
    setRlRewardType('rate_boost_pct');
    setRlRewardValue(1.5);
    setRlDescription('');
    setIsRuleModalOpen(true);
  };

  const handleSaveRuleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rlName.trim()) return;

    const rulePayload: Omit<CommissionRule, 'id'> = {
      tenantId: tenant.id,
      programId: rlProgramId,
      name: rlName.trim(),
      condition: rlCondition,
      threshold: Number(rlThreshold),
      brandName: rlCondition === 'brand_specific' ? rlBrandName : undefined,
      rewardType: rlRewardType,
      rewardValue: Number(rlRewardValue),
      description: rlDescription.trim(),
      isActive: true,
    };

    onSaveRule(rulePayload, editingRule?.id);
    setIsRuleModalOpen(false);
  };

  // =========================================================================
  // RECEIPT / PAYOUT FORM STATE
  // =========================================================================
  const [rcPeriodStart, setRcPeriodStart] = useState('2026-10-01');
  const [rcPeriodEnd, setRcPeriodEnd] = useState('2026-10-31');
  const [rcSalesAchieved, setRcSalesAchieved] = useState<number>(0);
  const [rcBaseCommission, setRcBaseCommission] = useState<number>(0);
  const [rcBonus, setRcBonus] = useState<number>(0);
  const [rcTaxDeduction, setRcTaxDeduction] = useState<number>(0);
  const [rcPaymentMethod, setRcPaymentMethod] = useState<'cash' | 'bkash' | 'nagad' | 'bank'>('bkash');
  const [rcTrxRef, setRcTrxRef] = useState('');
  const [rcNotes, setRcNotes] = useState('');

  const handleOpenCreateReceipt = (preselectedAgentId?: string) => {
    const targetAgentId = preselectedAgentId || tenantAgents[0]?.id || '';
    setReceiptAgentId(targetAgentId);
    const agent = tenantAgents.find(a => a.id === targetAgentId);

    const salesVal = agent ? agent.currentMonthSales : 150000;
    const prog = tenantPrograms.find(p => p.id === agent?.programId);
    const rate = prog ? prog.baseRatePercent : 3.0;
    const baseComm = (salesVal * rate) / 100;
    const bonus = salesVal >= (agent?.monthlyTargetSales || 150000) ? (prog?.targetBonusAmount || 5000) : 0;
    const tax = Math.round((baseComm + bonus) * 0.05); // 5% TDS

    setRcPeriodStart('2026-10-01');
    setRcPeriodEnd('2026-10-31');
    setRcSalesAchieved(salesVal);
    setRcBaseCommission(baseComm);
    setRcBonus(bonus);
    setRcTaxDeduction(tax);
    setRcPaymentMethod('bkash');
    setRcTrxRef(`BK-${Date.now().toString().slice(-6)}`);
    setRcNotes('অক্টোবর ২০২৬ মাসিক বিক্রয় কমিশন ও ইনসেন্টিভ পে-আউট।');
    setIsReceiptModalOpen(true);
  };

  const handleAgentSelectInReceipt = (agentId: string) => {
    setReceiptAgentId(agentId);
    const agent = tenantAgents.find(a => a.id === agentId);
    if (!agent) return;

    const prog = tenantPrograms.find(p => p.id === agent.programId);
    const rate = prog ? prog.baseRatePercent : 3.0;
    const baseComm = (agent.currentMonthSales * rate) / 100;
    const bonus = agent.currentMonthSales >= agent.monthlyTargetSales ? (prog?.targetBonusAmount || 5000) : 0;
    const tax = Math.round((baseComm + bonus) * 0.05);

    setRcSalesAchieved(agent.currentMonthSales);
    setRcBaseCommission(baseComm);
    setRcBonus(bonus);
    setRcTaxDeduction(tax);
  };

  const rcNetPayable = Math.max(0, rcBaseCommission + rcBonus - rcTaxDeduction);

  const handleSaveReceiptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const agent = tenantAgents.find(a => a.id === receiptAgentId);
    if (!agent || rcNetPayable <= 0) return;

    const receiptPayload: Omit<CommissionReceipt, 'id'> = {
      receiptNumber: `CMP-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(tenantReceipts.length + 1).padStart(3, '0')}`,
      tenantId: tenant.id,
      agentId: agent.id,
      agentName: agent.name,
      agentPhone: agent.phone,
      territory: agent.territory,
      periodStart: rcPeriodStart,
      periodEnd: rcPeriodEnd,
      totalSalesAchieved: Number(rcSalesAchieved),
      baseCommissionAmount: Number(rcBaseCommission),
      bonusAmount: Number(rcBonus),
      taxDeduction: Number(rcTaxDeduction),
      netPayable: rcNetPayable,
      paidAmount: rcNetPayable,
      paymentMethod: rcPaymentMethod,
      transactionReference: rcTrxRef,
      payoutStatus: 'paid',
      approvedBy: tenant.ownerName || 'Managing Director',
      paidAt: new Date().toISOString().split('T')[0],
      notes: rcNotes,
      createdAt: new Date().toLocaleString('en-GB'),
    };

    onSaveReceipt(receiptPayload);
    setIsReceiptModalOpen(false);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Print Stylesheet */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-receipt-root, #print-receipt-root * {
            visibility: visible;
          }
          #print-receipt-root {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 24px;
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Main Header Banner */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 bg-gradient-to-tr from-emerald-600 to-teal-500 text-white rounded-2xl shadow-xs">
              <Award className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                মাল্টি-টায়ার সেলস এজেন্ট ও কমিশন হাব (Phase 19)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                ফিল্ড রিপ্রেজেন্টেটিভ টার্গেট, প্রফিট শেয়ারিং স্কিম, স্বয়ংক্রিয় রুলস ইঞ্জিন ও অফিসিয়াল কমিশন পে-আউট
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {activeTab === 'agents' && (
            <button
              onClick={handleOpenCreateAgent}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              নতুন সেলস এজেন্ট যুক্ত করুন
            </button>
          )}

          {activeTab === 'programs' && (
            <button
              onClick={handleOpenCreateProgram}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              নতুন কমিশন পলিসি তৈরি
            </button>
          )}

          {activeTab === 'rules' && (
            <button
              onClick={handleOpenCreateRule}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-2xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              নতুন ইনসেন্টিভ রুল যোগ
            </button>
          )}

          {activeTab === 'receipts' && (
            <button
              onClick={() => handleOpenCreateReceipt()}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl shadow-xs transition-colors cursor-pointer"
            >
              <DollarSign className="w-4 h-4" />
              কমিশন পে-আউট ভাউচার তৈরি
            </button>
          )}
        </div>
      </div>

      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">সক্রিয় সেলস এজেন্ট</span>
              <div className="text-xl font-black text-slate-900 mt-1">
                {totalAgents} জন
              </div>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[10px] text-slate-400 mt-2 font-medium">
            নির্ধারিত এলাকা: {tenantAgents.map(a => a.territory).filter((v, i, s) => s.indexOf(v) === i).length} টি
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-indigo-100 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider block">চলতি মাসের এজেন্ট সেলস</span>
              <div className="text-xl font-black text-slate-900 mt-1">
                {tenant.currency}{totalSalesThisMonth.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-700 rounded-2xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[10px] text-slate-400 mt-2 font-medium">
            এজেন্টদের মাধ্যমে ফিল্ড কালেকশন
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">অর্জিত মোট কমিশন</span>
              <div className="text-xl font-black text-slate-900 mt-1">
                {tenant.currency}{totalEarnedCommission.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="p-3 bg-amber-50 text-amber-700 rounded-2xl">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[10px] text-slate-400 mt-2 font-medium">
            গড় কমিশন হার: ৩.৪%
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider block">বকেয়া কমিশন পে-আউট</span>
              <div className="text-xl font-black text-rose-700 mt-1">
                {tenant.currency}{totalDueCommission.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[10px] text-slate-400 mt-2 font-medium">
            পরিশোধিত: {tenant.currency}{totalPaidCommission.toLocaleString()}
          </div>
        </div>
      </div>

      {/* 5-Tab Sub-navigation Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-2 shadow-xs flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('agents')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'agents'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            সেলস এজেন্ট প্রোফাইল ও এলাকা (Agents)
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'agents' ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {tenantAgents.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('programs')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'programs'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Percent className="w-4 h-4" />
            কমিশন পলিসি ও স্কিম (Programs)
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'programs' ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {tenantPrograms.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('rules')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'rules'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Target className="w-4 h-4" />
            ইনসেন্টিভ ও বোনাস রুলস (Rules)
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'rules' ? 'bg-purple-800 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {tenantRules.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('receipts')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'receipts'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            কমিশন পে-আউট রসিদ (Receipts)
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'receipts' ? 'bg-teal-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {tenantReceipts.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'reports'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            লিডারবোর্ড ও ROI রিপোর্ট (Reports)
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="এজেন্ট, এলাকা বা স্কিম সার্চ..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-100 rounded-xl border border-transparent focus:border-emerald-600 focus:bg-white outline-none transition"
          />
        </div>
      </div>

      {/* =================================================================== */}
      {/* TAB 1: SALES AGENTS                                                 */}
      {/* =================================================================== */}
      {activeTab === 'agents' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">নিবন্ধিত সেলস রিপ্রেজেন্টেটিভ ও ফিল্ড এজেন্ট</h3>
              <p className="text-xs text-slate-500">এলাকা ভিত্তিক সেলস টার্গেট প্রগ্রেস, অর্জিত কমিশন ও সরাসরি পে-আউট</p>
            </div>
            <span className="text-xs text-slate-400">মোট এজেন্ট: {tenantAgents.length} জন</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="py-3 px-4">এজেন্টের নাম ও ফোন</th>
                  <th className="py-3 px-4">নির্ধারিত সেলস এলাকা</th>
                  <th className="py-3 px-4">কমিশন প্রোগ্রাম স্কিম</th>
                  <th className="py-3 px-4 text-center">টার্গেট প্রগ্রেস</th>
                  <th className="py-3 px-4 text-right">চলতি মাসের সেলস</th>
                  <th className="py-3 px-4 text-right">অর্জিত কমিশন</th>
                  <th className="py-3 px-4 text-right">বকেয়া কমিশন</th>
                  <th className="py-3 px-4 text-center">পারফরম্যান্স</th>
                  <th className="py-3 px-4 text-center">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tenantAgents.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                      <p className="font-semibold text-slate-600">কোনো সেলস এজেন্ট পাওয়া যায়নি</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">নতুন এজেন্ট যোগ করতে উপরের বাটনে ক্লিক করুন</p>
                    </td>
                  </tr>
                ) : (
                  tenantAgents.map(agent => {
                    const pct = agent.monthlyTargetSales > 0 ? Math.min(100, Math.round((agent.currentMonthSales / agent.monthlyTargetSales) * 100)) : 0;
                    return (
                      <tr key={agent.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                              {agent.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <strong className="font-bold text-slate-900 block">{agent.name}</strong>
                              <span className="text-[11px] text-slate-500 font-mono">{agent.phone}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-700">
                          {agent.territory}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {agent.programTitle}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center min-w-[120px]">
                          <div className="flex items-center justify-between text-[10px] font-bold text-slate-600 mb-1">
                            <span>{pct}% অর্জিত</span>
                            <span>{tenant.currency}{(agent.monthlyTargetSales / 1000).toFixed(0)}k টার্গেট</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              style={{ width: `${pct}%` }}
                              className={`h-full rounded-full ${pct >= 100 ? 'bg-emerald-500' : pct >= 60 ? 'bg-indigo-500' : 'bg-amber-500'}`}
                            />
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right font-black font-mono text-slate-900 text-sm">
                          {tenant.currency}{agent.currentMonthSales.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold font-mono text-emerald-700 text-sm">
                          {tenant.currency}{agent.earnedCommission.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold font-mono text-rose-600">
                          {tenant.currency}{agent.dueCommission.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            agent.performanceRating === 'top_performer' ? 'bg-emerald-100 text-emerald-800' :
                            agent.performanceRating === 'on_track' ? 'bg-blue-100 text-blue-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {agent.performanceRating === 'top_performer' ? 'শীর্ষ পারফরমার ⭐' :
                             agent.performanceRating === 'on_track' ? 'টার্গেটে আছে' : 'টার্গেট পিছিয়ে'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenCreateReceipt(agent.id)}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg text-xs transition flex items-center gap-1 cursor-pointer"
                              title="কমিশন পে-আউট করুন"
                            >
                              <DollarSign className="w-3.5 h-3.5" />
                              পে-আউট
                            </button>
                            <button
                              onClick={() => handleOpenEditAgent(agent)}
                              className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition cursor-pointer"
                              title="এডিট"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`আপনি কি "${agent.name}" এজেন্টকে মুছে ফেলতে চান?`)) {
                                  onDeleteAgent(agent.id);
                                }
                              }}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition cursor-pointer"
                              title="ডিলিট"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
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
      )}

      {/* =================================================================== */}
      {/* TAB 2: COMMISSION PROGRAMS                                          */}
      {/* =================================================================== */}
      {activeTab === 'programs' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tenantPrograms.map(prog => {
            const enrolledCount = tenantAgents.filter(a => a.programId === prog.id).length;
            return (
              <div key={prog.id} className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                      {prog.code}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800">
                      সক্রিয় পলিসি
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm mt-2">{prog.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{prog.description}</p>

                  <div className="mt-4 p-3 bg-slate-50 rounded-2xl space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">হিসাব পদ্ধতি:</span>
                      <strong className="text-slate-800">
                        {prog.calculationType === 'percentage_of_sales' ? 'গ্রস বিক্রয় মূল্য %' :
                         prog.calculationType === 'percentage_of_profit' ? 'নিট লাভ শেয়ারিং %' :
                         prog.calculationType === 'tiered_volume' ? 'ভলিউম টায়ার স্কেল' : 'ফ্ল্যাট পার ইউনিট'}
                      </strong>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">মূল কমিশন হার:</span>
                      <strong className="text-emerald-700 font-bold font-mono text-sm">{prog.baseRatePercent}%</strong>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">মাইলস্টোন সেলস টার্গেট:</span>
                      <strong className="font-mono text-slate-800">{tenant.currency}{prog.monthlyTargetThreshold.toLocaleString()}</strong>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">টার্গেট পূরণ বোনাস:</span>
                      <strong className="text-indigo-700 font-bold font-mono">{tenant.currency}{prog.targetBonusAmount.toLocaleString()}</strong>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-medium">
                    অ্যাসাইনড এজেন্ট: <strong>{enrolledCount}</strong> জন
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditProgram(prog)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 cursor-pointer"
                      title="পলিসি এডিট করুন"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`আপনি কি "${prog.title}" পলিসি মুছে ফেলতে চান?`)) {
                          onDeleteProgram(prog.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 cursor-pointer"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 3: COMMISSION RULES ENGINE                                      */}
      {/* =================================================================== */}
      {activeTab === 'rules' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">কমিশন রুলস ও ইনসেন্টিভ অটোমেশন ইঞ্জিন</h3>
              <p className="text-xs text-slate-500">টার্গেট সেলস বুস্ট, নির্দিষ্ট ব্র্যান্ড স্পেশাল ইনসেন্টিভ ও নতুন ক্লায়েন্ট বোনাস রুলস</p>
            </div>
            <span className="text-xs text-slate-400">সক্রিয় রুলস: {tenantRules.length} টি</span>
          </div>

          <div className="divide-y divide-slate-100">
            {tenantRules.map(rule => (
              <div key={rule.id} className="p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                      {rule.condition === 'min_sales_amount' ? 'টার্গেট সেলস বুস্ট' :
                       rule.condition === 'brand_specific' ? 'ব্র্যান্ড ইনসেন্টিভ' :
                       rule.condition === 'new_customer_bonus' ? 'নতুন ক্লায়েন্ট বোনাস' : 'ক্যাটাগরি স্পেসিফিক'}
                    </span>
                    <h4 className="font-bold text-slate-900 text-xs">{rule.name}</h4>
                  </div>
                  <p className="text-xs text-slate-500">{rule.description}</p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                    {rule.condition === 'brand_specific' && (
                      <span>ব্র্যান্ড: <strong className="text-slate-700">{rule.brandName}</strong></span>
                    )}
                    {rule.threshold > 0 && (
                      <span>ন্যূনতম থ্রেশহোল্ড: <strong className="text-slate-700">{tenant.currency}{rule.threshold.toLocaleString()}</strong></span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-medium">ইনসেন্টিভ পুরস্কার:</span>
                    <span className="text-sm font-black font-mono text-emerald-700">
                      {rule.rewardType === 'rate_boost_pct' ? `+${rule.rewardValue}% অতিরিক্ত রেট` : `+${tenant.currency}${rule.rewardValue.toLocaleString()} বোনাস`}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm(`আপনি কি "${rule.name}" রুলটি মুছে ফেলতে চান?`)) {
                        onDeleteRule(rule.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 4: COMMISSION RECEIPTS & PAYOUTS                                */}
      {/* =================================================================== */}
      {activeTab === 'receipts' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">কমিশন রসিদ ও পে-আউট হিস্ট্রি</h3>
              <p className="text-xs text-slate-500">অনুমোদিত পে-আউট ভাউচার, ট্যাক্স কর্তন ও পেইড রসিদ প্রিন্টিং</p>
            </div>
            <span className="text-xs text-slate-400">মোট রসিদ: {tenantReceipts.length} টি</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="py-3 px-4">রশিদ নং</th>
                  <th className="py-3 px-4">এজেন্টের নাম ও ফোন</th>
                  <th className="py-3 px-4">সময়কাল (Period)</th>
                  <th className="py-3 px-4 text-right">অর্জিত সেলস</th>
                  <th className="py-3 px-4 text-right">মূল কমিশন</th>
                  <th className="py-3 px-4 text-right">বোনাস</th>
                  <th className="py-3 px-4 text-right">ট্যাক্স (TDS)</th>
                  <th className="py-3 px-4 text-right">নিট পরিশোধ</th>
                  <th className="py-3 px-4">মাধ্যম</th>
                  <th className="py-3 px-4 text-center">প্রিন্ট</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tenantReceipts.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-400">
                      <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                      <p className="font-semibold text-slate-600">কোনো পে-আউট রসিদ তৈরি হয়নি</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">কমিশন প্রদান করে নতুন রসিদ তৈরি করুন</p>
                    </td>
                  </tr>
                ) : (
                  tenantReceipts.map(rc => (
                    <tr key={rc.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-800">
                        {rc.receiptNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <strong className="text-slate-900 block">{rc.agentName}</strong>
                        <span className="text-[10px] text-slate-400 font-mono">{rc.agentPhone}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600 text-[11px]">
                        {rc.periodStart} হতে {rc.periodEnd}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-700">
                        {tenant.currency}{rc.totalSalesAchieved.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-emerald-700">
                        {tenant.currency}{rc.baseCommissionAmount.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-indigo-700 font-bold">
                        {rc.bonusAmount > 0 ? `+${tenant.currency}${rc.bonusAmount.toFixed(2)}` : '-'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-rose-600">
                        {rc.taxDeduction > 0 ? `-${tenant.currency}${rc.taxDeduction.toFixed(2)}` : '০.০০'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-black font-mono text-slate-900 text-sm">
                        {tenant.currency}{rc.paidAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                          {rc.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => setViewingReceipt(rc)}
                          className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition cursor-pointer"
                          title="ভাউচার প্রিন্ট করুন"
                        >
                          <Printer className="w-4 h-4" />
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

      {/* =================================================================== */}
      {/* TAB 5: LEADERBOARD & ROI REPORTS                                    */}
      {/* =================================================================== */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          {/* Top Leaderboard Card */}
          <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-widest block">চলতি মাসের শীর্ষ রিপ্রেজেন্টেটিভ</span>
                <h3 className="text-2xl font-black mt-1">সেলস এজেন্ট লিডারবোর্ড (Leaderboard)</h3>
                <p className="text-xs text-emerald-200 mt-1 max-w-xl">
                  মাসিক বিক্রয় লক্ষ্যমাত্রা অতিক্রম ও সর্বোচ্চ প্রফিট মার্জিন জেনারেট করা ফিল্ড অফিসারদের র্যাঙ্কিং
                </p>
              </div>

              {/* ROI Stat Card */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-right">
                <span className="text-[10px] text-emerald-200 block">কমিশন কস্ট অনুপাত (ROI):</span>
                <div className="text-2xl font-black font-mono">
                  {totalPaidCommission > 0 ? `${((totalSalesThisMonth / (totalPaidCommission || 1))).toFixed(1)}x সেলস` : '২৫x'}
                </div>
                <span className="text-[10px] text-emerald-300 block mt-0.5">প্রতি ১ টাকা কমিশনে উৎপন্ন বিক্রয়</span>
              </div>
            </div>
          </div>

          {/* Leaderboard Podium Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tenantAgents
              .sort((a, b) => b.currentMonthSales - a.currentMonthSales)
              .map((agent, rank) => (
                <div key={agent.id} className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className={`w-7 h-7 rounded-full text-xs font-black flex items-center justify-center ${
                      rank === 0 ? 'bg-amber-100 text-amber-900 ring-2 ring-amber-400' :
                      rank === 1 ? 'bg-slate-200 text-slate-800' :
                      'bg-orange-100 text-orange-900'
                    }`}>
                      #{rank + 1}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800">
                      {rank === 0 ? 'চ্যাম্পিয়ন 🏆' : rank === 1 ? 'রানার-আপ 🥈' : '৩য় স্থান 🥉'}
                    </span>
                  </div>

                  <div className="mt-3">
                    <h4 className="font-bold text-slate-900 text-sm">{agent.name}</h4>
                    <span className="text-[11px] text-slate-400 block">{agent.territory}</span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">মোট বিক্রয়:</span>
                      <strong className="font-mono text-slate-900 font-black">{tenant.currency}{agent.currentMonthSales.toLocaleString()}</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">অর্জিত কমিশন:</span>
                      <strong className="font-mono text-emerald-700 font-bold">{tenant.currency}{agent.earnedCommission.toLocaleString()}</strong>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 1: CREATE / EDIT SALES AGENT                                  */}
      {/* =================================================================== */}
      {isAgentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-emerald-100 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="bg-emerald-700 text-white px-5 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">
                  {editingAgent ? 'সেলস এজেন্ট প্রোফাইল সম্পাদনা' : 'নতুন সেলস এজেন্ট যুক্ত করুন'}
                </h3>
                <p className="text-xs text-emerald-200">ফিল্ড রিপ্রেজেন্টেটিভ এর এলাকা ও সেলস স্কিম নির্ধারণ</p>
              </div>
              <button onClick={() => setIsAgentModalOpen(false)} className="text-emerald-200 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveAgentSubmit} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">এজেন্টের পূর্ণ নাম: *</label>
                  <input
                    type="text"
                    value={agName}
                    onChange={e => setAgName(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                    placeholder="e.g. মোঃ তরিকুল ইসলাম"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">মোবাইল নম্বর: *</label>
                  <input
                    type="text"
                    value={agPhone}
                    onChange={e => setAgPhone(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                    placeholder="+880 1711-..."
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">ইমেইল ঠিকানা:</label>
                  <input
                    type="email"
                    value={agEmail}
                    onChange={e => setAgEmail(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                    placeholder="agent@company.com"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">জাতীয় পরিচয়পত্র (NID):</label>
                  <input
                    type="text"
                    value={agNid}
                    onChange={e => setAgNid(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">নির্ধারিত এলাকা (Territory): *</label>
                  <input
                    type="text"
                    value={agTerritory}
                    onChange={e => setAgTerritory(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                    placeholder="e.g. ধানমন্ডি ও কলাবাগান"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">কমিশন পলিসি স্কিম: *</label>
                  <select
                    value={agProgramId}
                    onChange={e => setAgProgramId(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    {tenantPrograms.map(p => (
                      <option key={p.id} value={p.id}>{p.title} ({p.baseRatePercent}%)</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">মাসিক সেলস টার্গেট (টাকা):</label>
                  <input
                    type="number"
                    value={agTarget}
                    onChange={e => setAgTarget(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">মন্তব্য / নোট:</label>
                <input
                  type="text"
                  value={agNotes}
                  onChange={e => setAgNotes(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAgentModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  {editingAgent ? 'আপডেট করুন' : 'সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 2: CREATE / EDIT COMMISSION PROGRAM                           */}
      {/* =================================================================== */}
      {isProgramModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-indigo-100 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="bg-indigo-700 text-white px-5 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">কমিশন পলিসি স্কিম কনফিগারেশন</h3>
                <p className="text-xs text-indigo-200">বিক্রয় বা প্রফিট মার্জিনের উপর ভিত্তি করে কমিশন নির্ধারণ</p>
              </div>
              <button onClick={() => setIsProgramModalOpen(false)} className="text-indigo-200 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveProgramSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">পলিসির শিরোনাম: *</label>
                <input
                  type="text"
                  value={prTitle}
                  onChange={e => setPrTitle(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  placeholder="e.g. ফিল্ড অফিসার ৩% গ্রস সেলস স্কিম"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">হিসাব পদ্ধতি (Calculation Basis):</label>
                  <select
                    value={prCalcType}
                    onChange={e => setPrCalcType(e.target.value as CommissionCalculationType)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="percentage_of_sales">গ্রস বিক্রয় মূল্যের উপর % (Sales %)</option>
                    <option value="percentage_of_profit">নিট মুনাফার শেয়ার % (Profit %)</option>
                    <option value="tiered_volume">ভলিউম টায়ার স্কেল (Tiered)</option>
                    <option value="flat_per_unit">ফ্ল্যাট রেট পার ইউনিট (Flat)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">মূল কমিশন হার (%): *</label>
                  <input
                    type="number"
                    step="0.1"
                    value={prBaseRate}
                    onChange={e => setPrBaseRate(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-emerald-700"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">মাইলস্টোন সেলস থ্রেশহোল্ড (টাকা):</label>
                  <input
                    type="number"
                    value={prTargetThreshold}
                    onChange={e => setPrTargetThreshold(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">টার্গেট পূরণ বোনাস (টাকা):</label>
                  <input
                    type="number"
                    value={prBonusAmount}
                    onChange={e => setPrBonusAmount(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-indigo-700"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">পলিসির বিবরণ / শর্তাবলী:</label>
                <textarea
                  value={prDescription}
                  onChange={e => setPrDescription(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl h-16"
                  placeholder="পলিসির বিস্তারিত বিবরণ লিখুন..."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsProgramModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  পলিসি সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 3: CREATE / EDIT COMMISSION RULE                              */}
      {/* =================================================================== */}
      {isRuleModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-purple-100 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="bg-purple-800 text-white px-5 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">নতুন ইনসেন্টিভ রুল কনফিগারেশন</h3>
                <p className="text-xs text-purple-200">নির্দিষ্ট ব্র্যান্ড, ভলিউম বা নতুন ক্লায়েন্টের উপর অটো বোনাস</p>
              </div>
              <button onClick={() => setIsRuleModalOpen(false)} className="text-purple-200 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveRuleSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">রুলসের নাম: *</label>
                <input
                  type="text"
                  value={rlName}
                  onChange={e => setRlName(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="e.g. স্কয়ার ফার্মার পণ্যে স্পেশাল ইনসেন্টিভ"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">কমিশন পলিসির সাথে লিঙ্ক:</label>
                  <select
                    value={rlProgramId}
                    onChange={e => setRlProgramId(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    {tenantPrograms.map(p => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">শর্তের ধরন (Condition):</label>
                  <select
                    value={rlCondition}
                    onChange={e => setRlCondition(e.target.value as CommissionRule['condition'])}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="min_sales_amount">ন্যূনতম মাসিক সেলস থ্রেশহোল্ড</option>
                    <option value="brand_specific">নির্দিষ্ট ব্র্যান্ড বিক্রয় ইনসেন্টিভ</option>
                    <option value="new_customer_bonus">নতুন ক্লায়েন্ট অনবোর্ডিং বোনাস</option>
                  </select>
                </div>

                {rlCondition === 'brand_specific' && (
                  <div className="col-span-2">
                    <label className="font-semibold text-slate-700 block mb-1">ব্র্যান্ডের নাম:</label>
                    <input
                      type="text"
                      value={rlBrandName}
                      onChange={e => setRlBrandName(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                      placeholder="e.g. Square Pharmaceuticals Ltd."
                    />
                  </div>
                )}

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">পুরস্কারের ধরন:</label>
                  <select
                    value={rlRewardType}
                    onChange={e => setRlRewardType(e.target.value as typeof rlRewardType)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="rate_boost_pct">কমিশন রেট বৃদ্ধি (% Boost)</option>
                    <option value="fixed_bonus_bdt">ফ্ল্যাট বোনাস টাকা (BDT)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">পুরস্কারের মান (Value):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={rlRewardValue}
                    onChange={e => setRlRewardValue(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">বিবরণ:</label>
                <input
                  type="text"
                  value={rlDescription}
                  onChange={e => setRlDescription(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="শর্তের বিস্তারিত বর্ণনা লিখুন..."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsRuleModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  রুল সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 4: CREATE COMMISSION PAYOUT RECEIPT                           */}
      {/* =================================================================== */}
      {isReceiptModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-emerald-100 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="bg-emerald-700 text-white px-5 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">নতুন কমিশন পে-আউট ভাউচার জেনারেট</h3>
                <p className="text-xs text-emerald-200">বিক্রয় ভলিউম, অর্জিত কমিশন ও ট্যাক্স কর্তনের হিসাব</p>
              </div>
              <button onClick={() => setIsReceiptModalOpen(false)} className="text-emerald-200 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveReceiptSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">সেলস এজেন্ট নির্বাচন: *</label>
                <select
                  value={receiptAgentId}
                  onChange={e => handleAgentSelectInReceipt(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                >
                  {tenantAgents.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({a.territory})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">শুরুর তারিখ:</label>
                  <input
                    type="date"
                    value={rcPeriodStart}
                    onChange={e => setRcPeriodStart(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">সমাপ্তি তারিখ:</label>
                  <input
                    type="date"
                    value={rcPeriodEnd}
                    onChange={e => setRcPeriodEnd(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">অর্জিত সেলস (টাকা):</label>
                  <input
                    type="number"
                    value={rcSalesAchieved}
                    onChange={e => setRcSalesAchieved(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">মূল কমিশন (টাকা):</label>
                  <input
                    type="number"
                    value={rcBaseCommission}
                    onChange={e => setRcBaseCommission(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-emerald-700"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">ইনসেন্টিভ বোনাস (+টাকা):</label>
                  <input
                    type="number"
                    value={rcBonus}
                    onChange={e => setRcBonus(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-indigo-700"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">উৎস কর কর্তন (TDS -টাকা):</label>
                  <input
                    type="number"
                    value={rcTaxDeduction}
                    onChange={e => setRcTaxDeduction(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-rose-600"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">পেমেন্ট মেথড:</label>
                  <select
                    value={rcPaymentMethod}
                    onChange={e => setRcPaymentMethod(e.target.value as typeof rcPaymentMethod)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="bkash">বিকাশ (bKash)</option>
                    <option value="nagad">নগদ (Nagad)</option>
                    <option value="bank">ব্যাংক ট্রান্সফার (BEFTN/NPSB)</option>
                    <option value="cash">নগদ ক্যাশ (Cash)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">ট্রানজেকশন আইডি / রেফারেন্স:</label>
                  <input
                    type="text"
                    value={rcTrxRef}
                    onChange={e => setRcTrxRef(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                    placeholder="e.g. BK991209"
                  />
                </div>
              </div>

              {/* Net Payable Highlight */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                <span className="font-bold text-emerald-900">সর্বমোট নিট পরিশোধযোগ্য (Net Payout):</span>
                <span className="text-lg font-black font-mono text-emerald-800">{tenant.currency}{rcNetPayable.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsReceiptModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={rcNetPayable <= 0}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  পে-আউট নিশ্চিত করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* PRINTABLE COMMISSION RECEIPT VOUCHER                                */}
      {/* =================================================================== */}
      {viewingReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between no-print">
              <span className="font-bold text-xs flex items-center gap-2">
                <Printer className="w-4 h-4 text-emerald-400" />
                কমিশন রসিদ প্রিন্ট প্রিভিউ
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" /> প্রিন্ট করুন
                </button>
                <button onClick={() => setViewingReceipt(null)} className="text-slate-400 hover:text-white">✕</button>
              </div>
            </div>

            <div id="print-receipt-root" className="p-8 space-y-6 text-xs text-slate-800 overflow-y-auto">
              <div className="text-center border-b pb-4">
                <h1 className="text-xl font-black text-slate-900 uppercase tracking-wider">{tenant.name}</h1>
                <p className="text-[11px] text-slate-500 mt-0.5">{tenant.address} • ফোন: {tenant.phone}</p>
                <div className="mt-2 inline-block px-3 py-1 bg-emerald-50 border border-emerald-200 font-bold uppercase rounded-md text-[11px] tracking-widest text-emerald-800">
                  অফিসিয়াল সেলস কমিশন ও ইনসেন্টিভ ভাউচার (Commission Receipt)
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <p><strong>রশিদ নং:</strong> {viewingReceipt.receiptNumber}</p>
                  <p><strong>সময়কাল:</strong> {viewingReceipt.periodStart} হতে {viewingReceipt.periodEnd}</p>
                  <p><strong>তারিখ:</strong> {viewingReceipt.createdAt}</p>
                </div>
                <div>
                  <p><strong>এজেন্টের নাম:</strong> {viewingReceipt.agentName}</p>
                  <p><strong>মোবাইল:</strong> {viewingReceipt.agentPhone}</p>
                  <p><strong>এলাকা:</strong> {viewingReceipt.territory}</p>
                </div>
              </div>

              {/* Breakdown */}
              <table className="w-full text-left border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 text-slate-800">
                    <th className="border border-slate-300 p-2.5">বিবরণ (Description)</th>
                    <th className="border border-slate-300 p-2.5 text-right">টাকা (BDT)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-slate-300 p-2.5 font-medium">অর্জিত বিক্রয় ভলিউম (Total Sales Achieved)</td>
                    <td className="border border-slate-300 p-2.5 text-right font-mono font-bold">{tenant.currency}{viewingReceipt.totalSalesAchieved.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 p-2.5">মূল কমিশন (Base Commission Earned)</td>
                    <td className="border border-slate-300 p-2.5 text-right font-mono text-emerald-700">{tenant.currency}{viewingReceipt.baseCommissionAmount.toFixed(2)}</td>
                  </tr>
                  {viewingReceipt.bonusAmount > 0 && (
                    <tr>
                      <td className="border border-slate-300 p-2.5 text-indigo-700 font-semibold">টার্গেট পূরণ বোনাস (Milestone Performance Bonus)</td>
                      <td className="border border-slate-300 p-2.5 text-right font-mono font-bold text-indigo-700">+{tenant.currency}{viewingReceipt.bonusAmount.toFixed(2)}</td>
                    </tr>
                  )}
                  {viewingReceipt.taxDeduction > 0 && (
                    <tr>
                      <td className="border border-slate-300 p-2.5 text-rose-600">উৎস কর কর্তন (TDS / Tax Withholding)</td>
                      <td className="border border-slate-300 p-2.5 text-right font-mono text-rose-600">-{tenant.currency}{viewingReceipt.taxDeduction.toFixed(2)}</td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="bg-emerald-50 font-black">
                    <td className="border border-slate-300 p-2.5 text-right text-emerald-950">সর্বমোট নিট পরিশোধ (Net Paid):</td>
                    <td className="border border-slate-300 p-2.5 text-right text-sm text-emerald-900 font-mono">
                      {tenant.currency}{viewingReceipt.paidAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>

              <div className="bg-slate-50 p-3 rounded-lg text-[11px] text-slate-600">
                <strong>পেমেন্ট মাধ্যম:</strong> {viewingReceipt.paymentMethod.toUpperCase()} • <strong>রেফারেন্স / TrxID:</strong> {viewingReceipt.transactionReference || 'N/A'}
              </div>

              {/* Signatures */}
              <div className="pt-12 grid grid-cols-2 gap-12 text-center text-[10px] text-slate-500">
                <div className="border-t border-slate-400 pt-1.5">
                  গ্রহীতা এজেন্টের স্বাক্ষর
                </div>
                <div className="border-t border-slate-400 pt-1.5 font-bold text-slate-800">
                  অনুমোদনকারী কর্মকর্তা / স্বত্বাধিকারী
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
