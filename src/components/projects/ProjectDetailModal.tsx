import React, { useState } from 'react';
import { 
  X, CheckCircle2, Clock, DollarSign, Calendar, User, 
  Building, Phone, ArrowUpRight, TrendingUp, AlertCircle, 
  Layers, Tag, Edit3, Save, Plus
} from 'lucide-react';
import { Project, ProjectMilestone, ProjectStatus, Employee } from '../../types';

interface ProjectDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onUpdateProject: (updated: Project) => void;
  employees: Employee[];
  currency?: string;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  isOpen,
  onClose,
  project,
  onUpdateProject,
  employees,
  currency = '৳',
}) => {
  if (!isOpen || !project) return null;

  const [currentProgress, setCurrentProgress] = useState(project.progressPercent);
  const [currentStatus, setCurrentStatus] = useState<ProjectStatus>(project.status);
  const [milestones, setMilestones] = useState<ProjectMilestone[]>(project.milestones);
  const [actualCost, setActualCost] = useState(project.actualCost);
  const [paidAmount, setPaidAmount] = useState(project.paidAmount);
  const [isEditing, setIsEditing] = useState(false);

  // Profitability
  const projectedProfit = project.billingAmount - actualCost;
  const marginPct = project.billingAmount > 0 
    ? Math.round((projectedProfit / project.billingAmount) * 100) 
    : 0;

  const handleToggleMilestone = (milestoneId: string) => {
    const updated = milestones.map(m => {
      if (m.id === milestoneId) {
        const nextStatus = m.status === 'achieved' ? 'pending' : 'achieved';
        return {
          ...m,
          status: nextStatus as any,
          achievedDate: nextStatus === 'achieved' ? new Date().toISOString().slice(0, 10) : undefined,
        };
      }
      return m;
    });
    setMilestones(updated);

    // Auto-calculate progress based on achieved milestones
    const achievedCount = updated.filter(m => m.status === 'achieved').length;
    if (updated.length > 0) {
      const calculatedPct = Math.round((achievedCount / updated.length) * 100);
      setCurrentProgress(calculatedPct);
    }
  };

  const handleSaveChanges = () => {
    let paymentStatus: 'unpaid' | 'partial' | 'paid' = 'unpaid';
    if (paidAmount >= project.billingAmount && project.billingAmount > 0) {
      paymentStatus = 'paid';
    } else if (paidAmount > 0) {
      paymentStatus = 'partial';
    }

    const updatedProject: Project = {
      ...project,
      progressPercent: currentProgress,
      status: currentStatus,
      milestones,
      actualCost: Number(actualCost) || 0,
      paidAmount: Number(paidAmount) || 0,
      paymentStatus,
      actualEndDate: currentStatus === 'completed' && !project.actualEndDate 
        ? new Date().toISOString().slice(0, 10) 
        : project.actualEndDate,
      updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    };

    onUpdateProject(updatedProject);
    setIsEditing(false);
  };

  const getPriorityBadge = (p: Project['priority']) => {
    switch (p) {
      case 'urgent':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">Urgent (জরুরি)</span>;
      case 'high':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">High (উচ্চ)</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">Medium (মাঝারি)</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">Low</span>;
    }
  };

  const getStatusBadge = (s: ProjectStatus) => {
    switch (s) {
      case 'completed':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">Completed (সম্পন্ন)</span>;
      case 'in_progress':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800">In Progress (চলমান)</span>;
      case 'planning':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800">Planning (পরিকল্পনা)</span>;
      case 'on_hold':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">On Hold (স্থগিত)</span>;
      case 'cancelled':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">Cancelled (বাতিল)</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto bg-white rounded-2xl shadow-2xl flex flex-col border border-slate-100">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white border-b border-slate-100">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-black px-2.5 py-1 bg-purple-100 text-purple-800 rounded-lg">
              {project.projectCode}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 truncate max-w-md">{project.title}</h2>
                {getPriorityBadge(project.priority)}
              </div>
              <p className="text-xs text-slate-500">ক্লায়েন্ট: {project.clientName} {project.clientCompany ? `(${project.clientCompany})` : ''}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-3 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                আপডেট মোড
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSaveChanges}
                className="px-3.5 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition flex items-center gap-1.5 shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                সেভ করুন
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Progress Bar & Status Controls */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">অগ্রগতি (Progress):</span>
                <span className="text-sm font-black text-purple-700">{currentProgress}%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-500">বর্তমান স্ট্যাটাস:</span>
                {isEditing ? (
                  <select
                    value={currentStatus}
                    onChange={e => setCurrentStatus(e.target.value as ProjectStatus)}
                    className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg bg-white font-bold"
                  >
                    <option value="planning">Planning (পরিকল্পনা)</option>
                    <option value="in_progress">In Progress (চলমান)</option>
                    <option value="on_hold">On Hold (স্থগিত)</option>
                    <option value="completed">Completed (সম্পন্ন)</option>
                    <option value="cancelled">Cancelled (বাতিল)</option>
                  </select>
                ) : (
                  getStatusBadge(project.status)
                )}
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
              <div
                style={{ width: `${currentProgress}%` }}
                className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 transition-all duration-300 rounded-full"
              />
            </div>

            {isEditing && (
              <div className="flex items-center gap-3 pt-1">
                <span className="text-[11px] text-slate-500">ম্যানুয়াল প্রগ্রেস স্লাইডার:</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={currentProgress}
                  onChange={e => setCurrentProgress(Number(e.target.value))}
                  className="flex-1 accent-purple-600"
                />
              </div>
            )}
          </div>

          {/* 4 Financial KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100">
              <span className="text-[11px] font-medium text-blue-700">বাজেট ব্যয় (Budget)</span>
              <p className="text-base font-bold text-slate-900 mt-1">{currency}{project.budgetAmount.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100">
              <span className="text-[11px] font-medium text-amber-700">প্রকৃত খরচ (Actual Cost)</span>
              {isEditing ? (
                <input
                  type="number"
                  value={actualCost}
                  onChange={e => setActualCost(Number(e.target.value))}
                  className="w-full mt-1 px-2 py-0.5 text-xs font-bold bg-white border border-slate-200 rounded"
                />
              ) : (
                <p className="text-base font-bold text-amber-800 mt-1">{currency}{project.actualCost.toLocaleString()}</p>
              )}
            </div>
            <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
              <span className="text-[11px] font-medium text-emerald-700">ক্লায়েন্ট বিলিং (Contract)</span>
              <p className="text-base font-bold text-emerald-900 mt-1">{currency}{project.billingAmount.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100">
              <span className="text-[11px] font-medium text-purple-700">আদায়কৃত (Paid / Due)</span>
              {isEditing ? (
                <input
                  type="number"
                  value={paidAmount}
                  onChange={e => setPaidAmount(Number(e.target.value))}
                  className="w-full mt-1 px-2 py-0.5 text-xs font-bold bg-white border border-slate-200 rounded"
                />
              ) : (
                <p className="text-base font-bold text-purple-900 mt-1">
                  {currency}{project.paidAmount.toLocaleString()}
                  <span className="text-[10px] block font-normal text-slate-500">
                    বকেয়া: {currency}{(Math.max(0, project.billingAmount - project.paidAmount)).toLocaleString()}
                  </span>
                </p>
              )}
            </div>
          </div>

          {/* Profitability banner */}
          <div className="flex items-center justify-between p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 text-xs text-emerald-900">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>প্রজেক্ট মুনাফা মার্জিন (Project Margin):</span>
              <span className="font-bold">{currency}{projectedProfit.toLocaleString()} ({marginPct}%)</span>
            </div>
            <span className="text-[11px] text-emerald-700 font-medium">
              বাজেট সাশ্রয়: {currency}{(Math.max(0, project.budgetAmount - actualCost)).toLocaleString()}
            </span>
          </div>

          {/* Description & Stakeholders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/70 space-y-2">
              <span className="text-xs font-bold text-slate-800">প্রজেক্ট স্কোপ ও বিবরণ:</span>
              <p className="text-xs text-slate-600 leading-relaxed">{project.description || 'কোন অতিরিক্ত বিবরণ প্রদান করা হয়নি।'}</p>
              {project.notes && (
                <p className="text-[11px] text-purple-700 bg-purple-50 p-2 rounded-lg mt-2">
                  <strong>নোট:</strong> {project.notes}
                </p>
              )}
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/70 space-y-2 text-xs">
              <span className="text-xs font-bold text-slate-800">দায়িত্বপ্রাপ্ত ও সময়কাল:</span>
              <div className="space-y-1.5 text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">প্রজেক্ট ম্যানেজার:</span>
                  <span className="font-semibold text-slate-800">{project.managerName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">শুরুর তারিখ:</span>
                  <span className="font-mono text-slate-700">{project.startDate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">টার্গেট সমাপ্তি:</span>
                  <span className="font-mono text-slate-700">{project.targetEndDate}</span>
                </div>
                {project.clientPhone && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">ক্লায়েন্ট যোগাযোগ:</span>
                    <a href={`tel:${project.clientPhone}`} className="text-purple-600 font-mono font-medium hover:underline">
                      {project.clientPhone}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Milestones Check-off List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-purple-600" />
                <span>মাইলস্টোন ডেলিভারেবলস ও পেমেন্ট কিস্তি ({milestones.length})</span>
              </h3>
              <span className="text-[11px] text-slate-400">ক্লিক করে সম্পন্ন/অসম্পন্ন মার্ক করুন</span>
            </div>

            <div className="space-y-2">
              {milestones.map((m, idx) => {
                const isAchieved = m.status === 'achieved';
                return (
                  <div
                    key={m.id || idx}
                    onClick={() => handleToggleMilestone(m.id)}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                      isAchieved 
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' 
                        : 'bg-white border-slate-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center border transition ${
                        isAchieved 
                          ? 'bg-emerald-600 border-emerald-600 text-white' 
                          : 'border-slate-300 bg-white'
                      }`}>
                        {isAchieved && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold ${isAchieved ? 'line-through text-slate-500' : 'text-slate-800'}`}>
                            {m.title}
                          </span>
                          {isAchieved && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200 text-emerald-800">
                              Achieved {m.achievedDate}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">ডেলিভারেবল: {m.deliverable}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-xs text-purple-700">{currency}{m.amount.toLocaleString()}</span>
                      <span className="text-[10px] text-slate-400 block">টার্গেট: {m.dueDate}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            <span>তৈরি: {project.createdAt}</span>
          </div>
          <div className="flex items-center gap-2">
            {isEditing && (
              <button
                type="button"
                onClick={handleSaveChanges}
                className="px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition"
              >
                আপডেট সংরক্ষণ করুন
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition"
            >
              বন্ধ করুন (Close)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
