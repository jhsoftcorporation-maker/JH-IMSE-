import React, { useState } from 'react';
import { X, FolderPlus, Calendar, DollarSign, User, Building, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { Project, Customer, Employee, ProjectPriority, ProjectStatus, ProjectMilestone } from '../../types';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
  customers: Customer[];
  employees: Employee[];
  currency?: string;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  customers,
  employees,
  currency = '৳',
}) => {
  const [title, setTitle] = useState('');
  const [projectCode, setProjectCode] = useState(`PRJ-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
  const [description, setDescription] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customClientName, setCustomClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [managerId, setManagerId] = useState(employees[0]?.id || '');
  const [priority, setPriority] = useState<ProjectPriority>('medium');
  const [status, setStatus] = useState<ProjectStatus>('planning');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [targetEndDate, setTargetEndDate] = useState(
    new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [budgetAmount, setBudgetAmount] = useState<number>(100000);
  const [billingAmount, setBillingAmount] = useState<number>(130000);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [tagsInput, setTagsInput] = useState('Corporate Supply');
  const [notes, setNotes] = useState('');

  // Milestones list
  const [milestones, setMilestones] = useState<Omit<ProjectMilestone, 'id'>[]>([
    {
      title: 'Initial Phase & Requirement Sign-off',
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      amount: 40000,
      status: 'pending',
      deliverable: 'Signed Architecture & Requirement Spec',
    },
    {
      title: 'Deployment & Final Handover',
      dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      amount: 90000,
      status: 'pending',
      deliverable: 'Tested Live Handover & Client Sign-off',
    },
  ]);

  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneDate, setNewMilestoneDate] = useState('');
  const [newMilestoneAmount, setNewMilestoneAmount] = useState('');
  const [newMilestoneDeliverable, setNewMilestoneDeliverable] = useState('');

  if (!isOpen) return null;

  const handleCustomerChange = (custId: string) => {
    setSelectedCustomerId(custId);
    const found = customers.find(c => c.id === custId);
    if (found) {
      setCustomClientName(found.name);
      setClientPhone(found.phone);
      setClientCompany(found.company || found.name);
    }
  };

  const handleAddMilestone = () => {
    if (!newMilestoneTitle.trim()) return;
    setMilestones(prev => [
      ...prev,
      {
        title: newMilestoneTitle.trim(),
        dueDate: newMilestoneDate || targetEndDate,
        amount: Number(newMilestoneAmount) || 0,
        status: 'pending',
        deliverable: newMilestoneDeliverable.trim() || 'Phase Deliverable',
      },
    ]);
    setNewMilestoneTitle('');
    setNewMilestoneDate('');
    setNewMilestoneAmount('');
    setNewMilestoneDeliverable('');
  };

  const handleRemoveMilestone = (idx: number) => {
    setMilestones(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const assignedManager = employees.find(e => e.id === managerId);
    const managerName = assignedManager?.name || 'Project Lead';

    const clientNameFinal = customClientName.trim() || 'Corporate Client';

    const projectMilestones: ProjectMilestone[] = milestones.map((m, idx) => ({
      ...m,
      id: `ms-${Date.now()}-${idx}`,
    }));

    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    let paymentStatus: 'unpaid' | 'partial' | 'paid' = 'unpaid';
    if (paidAmount >= billingAmount && billingAmount > 0) {
      paymentStatus = 'paid';
    } else if (paidAmount > 0) {
      paymentStatus = 'partial';
    }

    onSave({
      projectCode,
      tenantId: '',
      title: title.trim(),
      description: description.trim(),
      clientId: selectedCustomerId || 'client-walkin',
      clientName: clientNameFinal,
      clientPhone: clientPhone.trim(),
      clientCompany: clientCompany.trim(),
      managerId,
      managerName,
      status,
      priority,
      startDate,
      targetEndDate,
      budgetAmount: Number(budgetAmount) || 0,
      actualCost: 0,
      billingAmount: Number(billingAmount) || 0,
      paidAmount: Number(paidAmount) || 0,
      paymentStatus,
      progressPercent: status === 'completed' ? 100 : 0,
      milestones: projectMilestones,
      tags,
      notes: notes.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto bg-white rounded-2xl shadow-2xl flex flex-col border border-slate-100">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">নতুন প্রজেক্ট তৈরি করুন (Create Project)</h2>
              <p className="text-xs text-slate-500">বাজেট, ক্লায়েন্ট ও মাইলস্টোন ট্র্যাকিং সহ দীর্ঘমেয়াদী প্রকল্প</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Top Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-slate-700">প্রজেক্ট টাইটেল *</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="যেমন: Evercare ICU Medicine Supply & Storage Setup"
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">প্রজেক্ট কোড</label>
              <input
                type="text"
                value={projectCode}
                onChange={e => setProjectCode(e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl text-purple-700 focus:outline-none"
              />
            </div>
          </div>

          {/* Client Details */}
          <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/60 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <Building className="w-4 h-4 text-purple-600" />
              <span>ক্লায়েন্ট ও প্রতিষ্ঠান সংক্রান্ত তথ্য (Client Information)</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-600">বিদ্যমান ক্লায়েন্ট সিলেক্ট করুন</label>
                <select
                  value={selectedCustomerId}
                  onChange={e => handleCustomerChange(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">-- নতুন ক্লায়েন্ট লিখুন --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.company ? `(${c.company})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-600">ক্লায়েন্টের নাম *</label>
                <input
                  type="text"
                  required
                  value={customClientName}
                  onChange={e => setCustomClientName(e.target.value)}
                  placeholder="যেমন: Apollo Diagnostics Ltd."
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-600">মোবাইল নম্বর</label>
                <input
                  type="text"
                  value={clientPhone}
                  onChange={e => setClientPhone(e.target.value)}
                  placeholder="+880 1711-xxxxxx"
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Manager, Priority, Dates */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">প্রজেক্ট ম্যানেজার</label>
              <select
                value={managerId}
                onChange={e => setManagerId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.designation})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">অগ্রাধিকার (Priority)</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as ProjectPriority)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="low">Low (সাধারণ)</option>
                <option value="medium">Medium (মাঝারি)</option>
                <option value="high">High (উচ্চ)</option>
                <option value="urgent">Urgent (জরুরি)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">শুরুর তারিখ</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">সমাপ্তির লক্ষ্যমাত্রা</label>
              <input
                type="date"
                value={targetEndDate}
                onChange={e => setTargetEndDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Financials: Budget, Billing, Advance */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-purple-50/50 rounded-xl border border-purple-100">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">প্রজেক্ট বাজেট ব্যয় ({currency})</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">{currency}</span>
                <input
                  type="number"
                  min="0"
                  value={budgetAmount}
                  onChange={e => setBudgetAmount(Number(e.target.value))}
                  className="w-full pl-8 pr-3 py-1.5 text-xs font-bold border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">মোট ক্লায়েন্ট বিলিং ভ্যালু ({currency})</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">{currency}</span>
                <input
                  type="number"
                  min="0"
                  value={billingAmount}
                  onChange={e => setBillingAmount(Number(e.target.value))}
                  className="w-full pl-8 pr-3 py-1.5 text-xs font-bold border border-slate-200 rounded-lg bg-white text-emerald-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">অগ্রিম আদায় ({currency})</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">{currency}</span>
                <input
                  type="number"
                  min="0"
                  value={paidAmount}
                  onChange={e => setPaidAmount(Number(e.target.value))}
                  className="w-full pl-8 pr-3 py-1.5 text-xs font-bold border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Milestones Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-purple-600" />
                <span>প্রজেক্ট মাইলস্টোন ও ডেলিভারেবলস ({milestones.length})</span>
              </label>
            </div>

            {/* Existing Milestones List */}
            <div className="space-y-2">
              {milestones.map((m, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs"
                >
                  <div className="space-y-0.5 max-w-[70%]">
                    <span className="font-bold text-slate-800">{idx + 1}. {m.title}</span>
                    <p className="text-[11px] text-slate-500 truncate">ডেলিভারেবল: {m.deliverable}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-purple-700">{currency}{m.amount.toLocaleString()}</span>
                    <span className="text-[10px] text-slate-400">{m.dueDate}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveMilestone(idx)}
                      className="p-1 text-slate-400 hover:text-red-500 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add new milestone inline */}
            <div className="p-3 bg-slate-50/50 rounded-xl border border-dashed border-slate-300 space-y-2">
              <span className="text-[11px] font-bold text-slate-600">+ নতুন মাইলস্টোন যোগ করুন:</span>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <input
                  type="text"
                  placeholder="মাইলস্টোন শিরোনাম"
                  value={newMilestoneTitle}
                  onChange={e => setNewMilestoneTitle(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="ডেলিভারেবল ডকুমেন্ট/প্রোডাক্ট"
                  value={newMilestoneDeliverable}
                  onChange={e => setNewMilestoneDeliverable(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none"
                />
                <input
                  type="number"
                  placeholder="বিলিং কিস্তি পরিমাণ"
                  value={newMilestoneAmount}
                  onChange={e => setNewMilestoneAmount(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none"
                />
                <div className="flex gap-1.5">
                  <input
                    type="date"
                    value={newMilestoneDate}
                    onChange={e => setNewMilestoneDate(e.target.value)}
                    className="flex-1 px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddMilestone}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    যোগ
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Description & Tags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">প্রজেক্টের বিবরণ ও স্কোপ</label>
              <textarea
                rows={2}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="প্রজেক্টের লক্ষ্য, চুক্তিবদ্ধ শর্ত ও মূল কার্যক্রম লিখুন..."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">ট্যাগস (কমা দিয়ে আলাদা করুন)</label>
              <input
                type="text"
                value={tagsInput}
                onChange={e => setTagsInput(e.target.value)}
                placeholder="Hospital, Cold Chain, Urgent"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              বাতিল (Cancel)
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-sm transition flex items-center gap-2"
            >
              <FolderPlus className="w-4 h-4" />
              প্রজেক্ট সংরক্ষণ করুন
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
