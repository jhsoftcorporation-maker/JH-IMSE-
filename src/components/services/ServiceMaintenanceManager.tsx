import React, { useState, useMemo } from 'react';
import { 
  Tenant, Product, Customer, Employee, Sale,
  ServiceJobTicket, ServiceJobStatus, InspectionChecklist,
  MaintenanceContract, WarrantyRecord, WarrantyClaim,
  ServiceJobPartItem, WarrantyClaimStatus
} from '../../types';
import { 
  Wrench, ShieldCheck, CheckCircle2, Clock, Plus, 
  Search, Filter, Printer, FileCheck, Calendar, Eye, 
  AlertTriangle, Phone, Smartphone, CheckSquare, Layers, 
  RotateCcw, Send, Sparkles, ChevronRight, CheckCircle, Tag
} from 'lucide-react';
import { CreateServiceJobModal } from './CreateServiceJobModal';
import { ServiceJobDetailModal } from './ServiceJobDetailModal';
import { InspectionChecklistModal } from './InspectionChecklistModal';
import { CreateAMCContractModal } from './CreateAMCContractModal';
import { RecordAMCVisitModal } from './RecordAMCVisitModal';
import { WarrantyLookupAndClaimModal } from './WarrantyLookupAndClaimModal';
import { ServiceJobPrintSlip } from './ServiceJobPrintSlip';

interface ServiceMaintenanceManagerProps {
  tenant: Tenant;
  products: Product[];
  customers: Customer[];
  employees: Employee[];
  sales: Sale[];
  tickets: ServiceJobTicket[];
  checklists: InspectionChecklist[];
  contracts: MaintenanceContract[];
  warranties: WarrantyRecord[];
  claims: WarrantyClaim[];
  initialTab?: 'jobs' | 'checklists' | 'amc' | 'warranty';
  onSaveTicket: (ticket: Omit<ServiceJobTicket, 'id' | 'createdAt'>) => void;
  onUpdateTicket: (updated: ServiceJobTicket) => void;
  onAddSparePartToJob?: (ticketId: string, part: ServiceJobPartItem) => void;
  onSaveChecklist: (checklist: InspectionChecklist) => void;
  onSaveContract: (contract: Omit<MaintenanceContract, 'id' | 'createdAt'>) => void;
  onRecordVisit: (contractId: string, visit: any) => void;
  onSaveWarrantyClaim: (claim: Omit<WarrantyClaim, 'id' | 'createdAt'>) => void;
  onUpdateWarrantyClaimStatus: (claimId: string, status: WarrantyClaimStatus, notes?: string) => void;
  onSendSmsAlert?: (phone: string, message: string) => void;
}

export const ServiceMaintenanceManager: React.FC<ServiceMaintenanceManagerProps> = ({
  tenant,
  products,
  customers,
  employees,
  sales,
  tickets,
  checklists,
  contracts,
  warranties,
  claims,
  initialTab = 'jobs',
  onSaveTicket,
  onUpdateTicket,
  onAddSparePartToJob,
  onSaveChecklist,
  onSaveContract,
  onRecordVisit,
  onSaveWarrantyClaim,
  onUpdateWarrantyClaimStatus,
  onSendSmsAlert,
}) => {
  const [activeTab, setActiveTab] = useState<'jobs' | 'checklists' | 'amc' | 'warranty'>(initialTab);

  // Modals state
  const [isCreateJobOpen, setIsCreateJobOpen] = useState(false);
  const [selectedTicketForDetail, setSelectedTicketForDetail] = useState<ServiceJobTicket | null>(null);
  const [selectedTicketForPrint, setSelectedTicketForPrint] = useState<ServiceJobTicket | null>(null);
  const [selectedTicketForChecklist, setSelectedTicketForChecklist] = useState<ServiceJobTicket | null>(null);
  const [isCreateAMCOpen, setIsCreateAMCOpen] = useState(false);
  const [selectedContractForVisit, setSelectedContractForVisit] = useState<MaintenanceContract | null>(null);
  const [isWarrantyModalOpen, setIsWarrantyModalOpen] = useState(false);

  // Search & Filters
  const [jobSearchQuery, setJobSearchQuery] = useState('');
  const [jobStatusFilter, setJobStatusFilter] = useState<'all' | ServiceJobStatus>('all');
  const [jobPriorityFilter, setJobPriorityFilter] = useState<'all' | 'low' | 'normal' | 'high' | 'urgent'>('all');

  const [amcSearchQuery, setAmcSearchQuery] = useState('');
  const [amcStatusFilter, setAmcStatusFilter] = useState<'all' | 'active' | 'expiring_soon' | 'expired'>('all');

  const [warrantySearchQuery, setWarrantySearchQuery] = useState('');

  // Tenant-scoped Data
  const tenantTickets = useMemo(() => {
    return tickets.filter(t => t.tenantId === tenant.id);
  }, [tickets, tenant.id]);

  const tenantChecklists = useMemo(() => {
    return checklists.filter(c => c.tenantId === tenant.id);
  }, [checklists, tenant.id]);

  const tenantContracts = useMemo(() => {
    return contracts.filter(c => c.tenantId === tenant.id);
  }, [contracts, tenant.id]);

  const tenantWarranties = useMemo(() => {
    return warranties.filter(w => w.tenantId === tenant.id);
  }, [warranties, tenant.id]);

  const tenantClaims = useMemo(() => {
    return claims.filter(cl => cl.tenantId === tenant.id);
  }, [claims, tenant.id]);

  // KPIs
  const totalJobs = tenantTickets.length;
  const inRepairJobs = tenantTickets.filter(t => t.status === 'in_diagnosis' || t.status === 'in_repair' || t.status === 'waiting_for_parts').length;
  const readyQaJobs = tenantTickets.filter(t => t.status === 'ready_for_qa' || t.status === 'completed').length;
  const deliveredJobs = tenantTickets.filter(t => t.status === 'delivered').length;
  const totalRevenueCollected = tenantTickets.reduce((acc, t) => acc + t.advancePaid, 0);
  const totalDuePending = tenantTickets.reduce((acc, t) => acc + t.dueAmount, 0);

  const activeAmcCount = tenantContracts.filter(c => c.status === 'active').length;
  const activeWarrantiesCount = tenantWarranties.filter(w => w.status === 'active').length;

  // Filtered Job Tickets
  const filteredTickets = useMemo(() => {
    return tenantTickets.filter(t => {
      const matchQuery = 
        t.ticketNumber.toLowerCase().includes(jobSearchQuery.toLowerCase()) ||
        t.customerName.toLowerCase().includes(jobSearchQuery.toLowerCase()) ||
        t.customerPhone.includes(jobSearchQuery) ||
        t.brand.toLowerCase().includes(jobSearchQuery.toLowerCase()) ||
        t.model.toLowerCase().includes(jobSearchQuery.toLowerCase()) ||
        t.imeiOrSerial.toLowerCase().includes(jobSearchQuery.toLowerCase());
      
      const matchStatus = jobStatusFilter === 'all' || t.status === jobStatusFilter;
      const matchPriority = jobPriorityFilter === 'all' || t.priority === jobPriorityFilter;

      return matchQuery && matchStatus && matchPriority;
    });
  }, [tenantTickets, jobSearchQuery, jobStatusFilter, jobPriorityFilter]);

  // Filtered AMC Contracts
  const filteredContracts = useMemo(() => {
    return tenantContracts.filter(c => {
      const matchQuery = 
        c.contractNumber.toLowerCase().includes(amcSearchQuery.toLowerCase()) ||
        c.customerName.toLowerCase().includes(amcSearchQuery.toLowerCase()) ||
        c.customerPhone.includes(amcSearchQuery) ||
        c.title.toLowerCase().includes(amcSearchQuery.toLowerCase());

      const matchStatus = amcStatusFilter === 'all' || c.status === amcStatusFilter;
      return matchQuery && matchStatus;
    });
  }, [tenantContracts, amcSearchQuery, amcStatusFilter]);

  // Filtered Warranties
  const filteredWarranties = useMemo(() => {
    return tenantWarranties.filter(w => {
      return (
        w.imeiOrSerial.toLowerCase().includes(warrantySearchQuery.toLowerCase()) ||
        w.productName.toLowerCase().includes(warrantySearchQuery.toLowerCase()) ||
        w.customerName.toLowerCase().includes(warrantySearchQuery.toLowerCase()) ||
        w.invoiceNumber.toLowerCase().includes(warrantySearchQuery.toLowerCase())
      );
    });
  }, [tenantWarranties, warrantySearchQuery]);

  const handleSendReadyNotification = (ticket: ServiceJobTicket) => {
    const msg = `প্রিয় ${ticket.customerName}, আপনার ${ticket.brand} ${ticket.model} (টিকেট: ${ticket.ticketNumber}) এর সার্ভিসিং সফলভাবে সম্পন্ন হয়েছে। অনুগ্রহ করে ${tenant.name} থেকে পণ্যটি বুঝে নিন। বকেয়া বিল: ৳${ticket.dueAmount}`;
    onSendSmsAlert?.(ticket.customerPhone, msg);
    alert(`গ্রাহক ${ticket.customerName} (${ticket.customerPhone})-কে ডেলিভারি রেডি এসএমএস নোটিফিকেশন প্রেরণ করা হয়েছে!`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Title Header */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/30 text-purple-200 border border-purple-400/30">
                Phase 20 Complete
              </span>
              <span className="text-xs text-purple-300 font-medium">Enterprise Service Suite</span>
            </div>
            <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2.5">
              <Wrench className="w-6 h-6 text-purple-300" />
              সার্ভিস, রিপেয়ার জবস ও রক্ষণাবেক্ষণ ব্যবস্থাপনা (AMC / Warranty)
            </h2>
            <p className="text-xs text-purple-200 mt-1 max-w-2xl leading-relaxed">
              ডিভাইস ইনটেক জব টিকিট, ইনভেন্টরি পার্টস কনজাম্পশন, টেকনিক্যাল প্রি/পোস্ট কিউএ চেকলিস্ট, বার্ষিক মেইনটেন্যান্স কন্ট্রাক্ট (AMC) ও সিরিয়াল/IMEI ওয়ারেন্টি ট্র্যাকার।
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsWarrantyModalOpen(true)}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer backdrop-blur-xs"
            >
              <ShieldCheck className="w-4 h-4 text-amber-300" />
              IMEI / ওয়ারেন্টি সার্চ
            </button>

            <button
              onClick={() => setIsCreateAMCOpen(true)}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Calendar className="w-4 h-4" />
              নতুন AMC চুক্তি
            </button>

            <button
              onClick={() => setIsCreateJobOpen(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              নতুন জব টিকিট তৈরি
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {/* KPI 1: Total Tickets */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>মোট জব টিকিট</span>
            <Wrench className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-xl font-black text-slate-900">{totalJobs} টি</div>
          <div className="text-[10px] text-slate-400">সর্বমোট ইনটেক ডিভাইস</div>
        </div>

        {/* KPI 2: In Repair */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>মেরামত বেঞ্চে</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-black text-amber-700">{inRepairJobs} টি</div>
          <div className="text-[10px] text-amber-600 font-medium">ডায়াগনসিস ও পার্টস ফেজ</div>
        </div>

        {/* KPI 3: Ready for QA / Pickup */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>ডেলিভারি প্রস্তুত</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-emerald-700">{readyQaJobs} টি</div>
          <div className="text-[10px] text-emerald-600 font-medium">QA সম্পন্ন বা প্রস্তুত</div>
        </div>

        {/* KPI 4: Delivered */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>ডেলিভার্ড</span>
            <CheckCircle className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-black text-blue-900">{deliveredJobs} টি</div>
          <div className="text-[10px] text-slate-400">সফল গ্রাহক হস্তান্তর</div>
        </div>

        {/* KPI 5: Active AMC */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>সক্রিয় AMC চুক্তি</span>
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl font-black text-indigo-900">{activeAmcCount} টি</div>
          <div className="text-[10px] text-indigo-600 font-medium">রক্ষণাবেক্ষণ সেবা চালু</div>
        </div>

        {/* KPI 6: Total Revenue / Due */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>সার্ভিস আয় / বকেয়া</span>
            <Sparkles className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-base font-black text-slate-900">{tenant.currency}{totalRevenueCollected.toLocaleString()}</div>
          <div className="text-[10px] text-rose-600 font-bold">বকেয়া: {tenant.currency}{totalDuePending.toLocaleString()}</div>
        </div>
      </div>

      {/* Main Container with 4 Sub-Tabs */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Navigation Tabs Header */}
        <div className="flex items-center justify-between px-6 pt-4 border-b border-slate-200 overflow-x-auto">
          <div className="flex items-center gap-4 text-xs min-w-max">
            <button
              onClick={() => setActiveTab('jobs')}
              className={`pb-3 font-bold border-b-2 transition cursor-pointer flex items-center gap-2 ${
                activeTab === 'jobs'
                  ? 'border-purple-700 text-purple-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>১. সার্ভিস ও রিপেয়ার জব কার্ড ({tenantTickets.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('checklists')}
              className={`pb-3 font-bold border-b-2 transition cursor-pointer flex items-center gap-2 ${
                activeTab === 'checklists'
                  ? 'border-purple-700 text-purple-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileCheck className="w-4 h-4" />
              <span>২. টেকনিক্যাল চেকলিস্ট সমাপ্তি রিপোর্ট ({tenantChecklists.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('amc')}
              className={`pb-3 font-bold border-b-2 transition cursor-pointer flex items-center gap-2 ${
                activeTab === 'amc'
                  ? 'border-purple-700 text-purple-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>৩. গ্রাহক রক্ষণাবেক্ষণ চুক্তি (AMC: {tenantContracts.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('warranty')}
              className={`pb-3 font-bold border-b-2 transition cursor-pointer flex items-center gap-2 ${
                activeTab === 'warranty'
                  ? 'border-purple-700 text-purple-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>৪. ওয়ারেন্টি ও গ্যারান্টি ট্র্যাকার ({tenantWarranties.length})</span>
            </button>
          </div>
        </div>

        {/* TAB 1: SERVICE JOB TICKETS */}
        {activeTab === 'jobs' && (
          <div className="p-6 space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="relative flex-1 w-full md:max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={jobSearchQuery}
                  onChange={e => setJobSearchQuery(e.target.value)}
                  placeholder="টিকেট নং, গ্রাহকের নাম, মোবাইল বা ডিভাইসের IMEI খুঁজুন..."
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-700"
                />
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <select
                  value={jobStatusFilter}
                  onChange={e => setJobStatusFilter(e.target.value as any)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                >
                  <option value="all">সব স্ট্যাটাস ({tenantTickets.length})</option>
                  <option value="received">📥 রিসিভড (Received)</option>
                  <option value="in_diagnosis">🔬 ডায়াগনসিস চলছে</option>
                  <option value="waiting_for_parts">⏳ পার্টস অপেক্ষমান</option>
                  <option value="in_repair">🔧 মেরামত চলছে</option>
                  <option value="ready_for_qa">📋 QA চেকলিস্ট প্রস্তুত</option>
                  <option value="completed">✅ মেরামত সম্পন্ন</option>
                  <option value="delivered">🚀 ডেলিভার্ড</option>
                </select>

                <select
                  value={jobPriorityFilter}
                  onChange={e => setJobPriorityFilter(e.target.value as any)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                >
                  <option value="all">সব প্রায়োরিটি</option>
                  <option value="urgent">🔴 Urgent (ভিআইপি)</option>
                  <option value="high">🟠 High (জরুরি)</option>
                  <option value="normal">🔵 Normal (স্বাভাবিক)</option>
                  <option value="low">⚪ Low (সাধারণ)</option>
                </select>

                <button
                  onClick={() => setIsCreateJobOpen(true)}
                  className="px-3.5 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  নতুন টিকেট
                </button>
              </div>
            </div>

            {/* Tickets Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3">টিকেট নং</th>
                    <th className="py-3 px-3">ডিভাইস ও সিরিয়াল</th>
                    <th className="py-3 px-3">গ্রাহক ও যোগাযোগ</th>
                    <th className="py-3 px-3">সমস্যা ও টেকনিশিয়ান</th>
                    <th className="py-3 px-3 text-right">বিল ও বকেয়া</th>
                    <th className="py-3 px-3 text-center">স্ট্যাটাস</th>
                    <th className="py-3 px-3 text-center">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTickets.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <Wrench className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                        <p className="font-semibold text-slate-600">কোনো সার্ভিস জব টিকিট পাওয়া যায়নি</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">নতুন ডিভাইস মেরামত এন্ট্রি নিতে উপরের বাটনে ক্লিক করুন</p>
                      </td>
                    </tr>
                  ) : (
                    filteredTickets.map(ticket => (
                      <tr key={ticket.id} className="hover:bg-slate-50/70 transition">
                        {/* Ticket No & Priority */}
                        <td className="py-3 px-3">
                          <div className="font-mono font-black text-purple-900">{ticket.ticketNumber}</div>
                          <span className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase mt-0.5 ${
                            ticket.priority === 'urgent' ? 'bg-rose-100 text-rose-800' :
                            ticket.priority === 'high' ? 'bg-amber-100 text-amber-800' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {ticket.priority}
                          </span>
                        </td>

                        {/* Device & Serial */}
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900">{ticket.brand} {ticket.model}</div>
                          <div className="font-mono text-[11px] text-slate-500 font-semibold">{ticket.imeiOrSerial}</div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[140px]">{ticket.deviceType}</div>
                        </td>

                        {/* Customer */}
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-900">{ticket.customerName}</div>
                          <div className="font-mono text-[11px] text-slate-600">{ticket.customerPhone}</div>
                          <div className="text-[10px] text-slate-400">ইনটেক: {ticket.intakeDate.slice(0, 10)}</div>
                        </td>

                        {/* Issue & Tech */}
                        <td className="py-3 px-3 max-w-xs">
                          <div className="text-slate-800 line-clamp-1 font-medium">{ticket.reportedIssues}</div>
                          <div className="text-[11px] text-purple-700 font-semibold mt-0.5 flex items-center gap-1">
                            <span>👨‍🔧 {ticket.assignedTechnicianName}</span>
                          </div>
                        </td>

                        {/* Cost & Due */}
                        <td className="py-3 px-3 text-right">
                          <div className="font-bold text-slate-900">{tenant.currency}{ticket.totalCost}</div>
                          {ticket.dueAmount > 0 ? (
                            <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">
                              বাকি: {tenant.currency}{ticket.dueAmount}
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                              পরিশোধিত
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            ticket.status === 'delivered' ? 'bg-slate-100 text-slate-700' :
                            ticket.status === 'ready_for_qa' || ticket.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                            ticket.status === 'in_repair' ? 'bg-indigo-100 text-indigo-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {ticket.status.replace(/_/g, ' ').toUpperCase()}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setSelectedTicketForDetail(ticket)}
                              className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-lg text-[11px] font-bold transition cursor-pointer"
                              title="ওয়ার্কবেঞ্চ খুলুন"
                            >
                              ম্যানেজ
                            </button>

                            <button
                              onClick={() => setSelectedTicketForPrint(ticket)}
                              className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer transition"
                              title="জব স্লিপ প্রিন্ট"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>

                            {(ticket.status === 'ready_for_qa' || ticket.status === 'completed') && (
                              <button
                                onClick={() => handleSendReadyNotification(ticket)}
                                className="p-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 cursor-pointer transition"
                                title="গ্রাহককে রেডি এসএমএস পাঠান"
                              >
                                <Send className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: TECHNICAL CHECKLISTS */}
        {activeTab === 'checklists' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">টেকনিক্যাল চেকলিস্ট সমাপ্তি রিপোর্ট রেজিস্টার</h4>
                <p className="text-xs text-slate-500">ডিভাইস ইনটেক ও ফাইনাল ডেলিভারির পূর্বে হার্ডওয়্যার ও ফাংশনাল কোয়ালিটি নিশ্চয়তা</p>
              </div>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3">রিপোর্ট নং</th>
                    <th className="py-3 px-3">জব টিকিট ও ডিভাইস</th>
                    <th className="py-3 px-3">পর্যায় (Stage)</th>
                    <th className="py-3 px-3">ইন্সপেক্টর ও তারিখ</th>
                    <th className="py-3 px-3 text-center">টেস্ট স্কোর</th>
                    <th className="py-3 px-3 text-center">ফলাফল</th>
                    <th className="py-3 px-3 text-center">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tenantChecklists.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <FileCheck className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                        <p className="font-semibold text-slate-600">কোনো চেকলিস্ট রিপোর্ট পাওয়া যায়নি</p>
                      </td>
                    </tr>
                  ) : (
                    tenantChecklists.map(chk => {
                      const passCount = chk.items.filter(i => i.status === 'pass').length;
                      const relatedTicket = tenantTickets.find(t => t.id === chk.ticketId);

                      return (
                        <tr key={chk.id} className="hover:bg-slate-50/70">
                          <td className="py-3 px-3 font-mono font-bold text-teal-900">{chk.id}</td>
                          <td className="py-3 px-3">
                            <span className="font-mono font-bold text-slate-800">{chk.ticketNumber}</span>
                            {relatedTicket && (
                              <div className="text-[11px] text-slate-500">{relatedTicket.brand} {relatedTicket.model}</div>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                              {chk.inspectionType === 'post_repair_qa' ? 'পোস্ট-রিপেয়ার QA' : 'ইনটেক ডায়াগনসিস'}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-semibold text-slate-800">{chk.inspectorName}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{chk.inspectionDate}</div>
                          </td>
                          <td className="py-3 px-3 text-center font-bold font-mono">
                            <span className="text-emerald-700">{passCount}</span> / {chk.items.length} পাস
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              chk.overallResult === 'passed' ? 'bg-emerald-100 text-emerald-800' :
                              chk.overallResult === 'passed_with_issues' ? 'bg-amber-100 text-amber-800' :
                              'bg-rose-100 text-rose-800'
                            }`}>
                              {chk.overallResult === 'passed' ? '১০০% পাস' : 'পর্যালোচনা'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            {relatedTicket && (
                              <button
                                onClick={() => setSelectedTicketForChecklist(relatedTicket)}
                                className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-lg text-[11px] font-bold transition cursor-pointer"
                              >
                                চেকলিস্ট দেখুন
                              </button>
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
        )}

        {/* TAB 3: AMC MAINTENANCE CONTRACTS */}
        {activeTab === 'amc' && (
          <div className="p-6 space-y-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="relative flex-1 w-full md:max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={amcSearchQuery}
                  onChange={e => setAmcSearchQuery(e.target.value)}
                  placeholder="চুক্তি নং, ক্লায়েন্ট বা মোবাইল দিয়ে খুঁজুন..."
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={amcStatusFilter}
                  onChange={e => setAmcStatusFilter(e.target.value as any)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                >
                  <option value="all">সব চুক্তি ({tenantContracts.length})</option>
                  <option value="active">সক্রিয় (Active)</option>
                  <option value="expiring_soon">মেয়াদোত্তীর্ণের পথে</option>
                  <option value="expired">মেয়াদোত্তীর্ণ</option>
                </select>

                <button
                  onClick={() => setIsCreateAMCOpen(true)}
                  className="px-3.5 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  নতুন AMC চুক্তি
                </button>
              </div>
            </div>

            {/* Contracts List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredContracts.length === 0 ? (
                <div className="col-span-2 py-12 text-center text-slate-400">
                  <Calendar className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  <p className="font-semibold text-slate-600">কোনো গ্রাহক রক্ষণাবেক্ষণ চুক্তি পাওয়া যায়নি</p>
                </div>
              ) : (
                filteredContracts.map(contract => (
                  <div key={contract.id} className="bg-slate-50/70 p-5 rounded-3xl border border-slate-200 space-y-3 hover:border-amber-300 transition">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-amber-900 text-xs">{contract.contractNumber}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-800">
                            {contract.tier}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 mt-1">{contract.title}</h4>
                        <p className="text-xs text-slate-600 mt-0.5">
                          ক্লায়েন্ট: <strong>{contract.customerName}</strong> ({contract.customerPhone})
                        </p>
                      </div>

                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                        {contract.status}
                      </span>
                    </div>

                    {/* Meta stats */}
                    <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-200 text-[11px]">
                      <div>
                        <span className="text-slate-400 block">ভিজিট অগ্রগতি:</span>
                        <strong className="text-slate-800">{contract.visitsCompleted} / {contract.totalVisitsAllowed} সম্পন্ন</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">চুক্তি মূল্য:</span>
                        <strong className="text-slate-800 font-mono">{tenant.currency}{contract.contractAmount}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">পরবর্তী ভিজিট:</span>
                        <strong className="text-amber-800 font-mono">{contract.nextScheduledDate}</strong>
                      </div>
                    </div>

                    {/* Covered equipment chips */}
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">আওতাভুক্ত যন্ত্রপাতি:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {contract.coveredEquipment.map(eq => (
                          <span key={eq.id} className="px-2 py-0.5 bg-white border border-slate-200 rounded-lg text-[10px] font-medium text-slate-700">
                            {eq.name} ({eq.serialNumber})
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Action */}
                    <div className="pt-2 flex items-center justify-between border-t border-slate-200">
                      <span className="text-[11px] text-slate-500 font-mono">
                        মেয়াদ: {contract.startDate} - {contract.endDate}
                      </span>
                      <button
                        onClick={() => setSelectedContractForVisit(contract)}
                        className="px-3.5 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        ভিজিট এন্ট্রি নিন
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 4: WARRANTY TRACKER */}
        {activeTab === 'warranty' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">বিক্রিত পণ্যের ওয়ারেন্টি ও গ্যারান্টি রেজিস্টার</h4>
                <p className="text-xs text-slate-500">IMEI/সিরিয়াল নম্বর দ্বারা অফিসিয়াল ও শপ রিপ্লেসমেন্ট ওয়ারেন্টি ট্র্যাকিং</p>
              </div>

              <button
                onClick={() => setIsWarrantyModalOpen(true)}
                className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Search className="w-3.5 h-3.5" />
                IMEI সার্চ ও ক্লেইম
              </button>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3">সিরিয়াল / IMEI</th>
                    <th className="py-3 px-3">পণ্যের বিবরণ</th>
                    <th className="py-3 px-3">গ্রাহক ও ইনভয়েস</th>
                    <th className="py-3 px-3">ওয়ারেন্টির ধরন</th>
                    <th className="py-3 px-3">মেয়াদ শেষ</th>
                    <th className="py-3 px-3 text-center">স্ট্যাটাস</th>
                    <th className="py-3 px-3 text-center">ক্লেইম সংখ্যা</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredWarranties.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <ShieldCheck className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                        <p className="font-semibold text-slate-600">কোনো ওয়ারেন্টি রেকর্ড পাওয়া যায়নি</p>
                      </td>
                    </tr>
                  ) : (
                    filteredWarranties.map(war => (
                      <tr key={war.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-3 font-mono font-bold text-blue-900">{war.imeiOrSerial}</td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-800">{war.productName}</div>
                          <div className="text-[10px] text-slate-400">{war.brand} - {war.model}</div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-medium text-slate-800">{war.customerName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">চালান: {war.invoiceNumber}</div>
                        </td>
                        <td className="py-3 px-3 capitalize font-semibold text-purple-900">
                          {war.warrantyType.replace(/_/g, ' ')}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-700">{war.warrantyExpiryDate}</td>
                        <td className="py-3 px-3 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            war.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                            war.status === 'claimed' ? 'bg-amber-100 text-amber-800' :
                            'bg-rose-100 text-rose-800'
                          }`}>
                            {war.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-bold font-mono">
                          {war.claimsCount} বার
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: CREATE SERVICE JOB */}
      {isCreateJobOpen && (
        <CreateServiceJobModal
          isOpen={isCreateJobOpen}
          onClose={() => setIsCreateJobOpen(false)}
          tenant={tenant}
          customers={customers}
          employees={employees}
          onSaveJob={onSaveTicket}
        />
      )}

      {/* MODAL 2: ACTIVE TICKET WORKBENCH DETAIL */}
      {selectedTicketForDetail && (
        <ServiceJobDetailModal
          isOpen={!!selectedTicketForDetail}
          onClose={() => setSelectedTicketForDetail(null)}
          ticket={selectedTicketForDetail}
          tenant={tenant}
          products={products}
          checklists={tenantChecklists}
          onUpdateTicket={(updated) => {
            onUpdateTicket(updated);
            setSelectedTicketForDetail(updated);
          }}
          onAddSparePartToJob={onAddSparePartToJob}
          onSaveChecklist={onSaveChecklist}
        />
      )}

      {/* MODAL 3: PRINT SLIP */}
      {selectedTicketForPrint && (
        <ServiceJobPrintSlip
          ticket={selectedTicketForPrint}
          tenant={tenant}
          onClose={() => setSelectedTicketForPrint(null)}
        />
      )}

      {/* MODAL 4: CHECKLIST MODAL */}
      {selectedTicketForChecklist && (
        <InspectionChecklistModal
          isOpen={!!selectedTicketForChecklist}
          onClose={() => setSelectedTicketForChecklist(null)}
          ticket={selectedTicketForChecklist}
          tenant={tenant}
          existingChecklist={tenantChecklists.find(c => c.ticketId === selectedTicketForChecklist.id)}
          onSaveChecklist={onSaveChecklist}
        />
      )}

      {/* MODAL 5: CREATE AMC CONTRACT */}
      {isCreateAMCOpen && (
        <CreateAMCContractModal
          isOpen={isCreateAMCOpen}
          onClose={() => setIsCreateAMCOpen(false)}
          tenant={tenant}
          customers={customers}
          onSaveContract={onSaveContract}
        />
      )}

      {/* MODAL 6: RECORD AMC VISIT */}
      {selectedContractForVisit && (
        <RecordAMCVisitModal
          isOpen={!!selectedContractForVisit}
          onClose={() => setSelectedContractForVisit(null)}
          contract={selectedContractForVisit}
          tenant={tenant}
          onSaveVisit={onRecordVisit}
        />
      )}

      {/* MODAL 7: WARRANTY SEARCH & CLAIMS */}
      {isWarrantyModalOpen && (
        <WarrantyLookupAndClaimModal
          isOpen={isWarrantyModalOpen}
          onClose={() => setIsWarrantyModalOpen(false)}
          tenant={tenant}
          warrantyRecords={tenantWarranties}
          sales={sales}
          claims={tenantClaims}
          onSaveClaim={onSaveWarrantyClaim}
          onUpdateClaimStatus={onUpdateWarrantyClaimStatus}
        />
      )}
    </div>
  );
};
