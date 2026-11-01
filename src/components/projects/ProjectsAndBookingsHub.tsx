import React, { useState, useMemo } from 'react';
import { 
  FolderKanban, CheckSquare, FileText, Calendar, Plus, Search, 
  Filter, Clock, ArrowRight, ArrowLeft, CheckCircle2, AlertTriangle, 
  Building, User, Phone, DollarSign, Printer, Eye, Trash2, Edit3, 
  TrendingUp, Send, Share2, Sparkles, ShieldCheck, ChevronRight
} from 'lucide-react';
import { 
  Project, ProjectTask, CommercialContract, AppointmentBooking, 
  Tenant, Customer, Employee, Supplier, TaskKanbanColumn, ProjectStatus 
} from '../../types';
import { CreateProjectModal } from './CreateProjectModal';
import { ProjectDetailModal } from './ProjectDetailModal';
import { CreateTaskModal } from './CreateTaskModal';
import { CreateContractModal } from './CreateContractModal';
import { ContractPrintModal } from './ContractPrintModal';
import { CreateBookingModal } from './CreateBookingModal';

interface ProjectsAndBookingsHubProps {
  tenant: Tenant;
  currency?: string;
  projects: Project[];
  tasks: ProjectTask[];
  contracts: CommercialContract[];
  bookings: AppointmentBooking[];
  customers: Customer[];
  employees: Employee[];
  suppliers: Supplier[];
  onSaveProject: (project: Project) => void;
  onUpdateProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
  onSaveTask: (task: ProjectTask) => void;
  onUpdateTask: (task: ProjectTask) => void;
  onDeleteTask: (id: string) => void;
  onSaveContract: (contract: CommercialContract) => void;
  onUpdateContract: (contract: CommercialContract) => void;
  onDeleteContract: (id: string) => void;
  onSaveBooking: (booking: AppointmentBooking) => void;
  onUpdateBookingStatus: (id: string, status: AppointmentBooking['status']) => void;
  onDeleteBooking: (id: string) => void;
  onSendBookingReminder?: (booking: AppointmentBooking) => void;
}

export const ProjectsAndBookingsHub: React.FC<ProjectsAndBookingsHubProps> = ({
  tenant,
  currency = '৳',
  projects,
  tasks,
  contracts,
  bookings,
  customers,
  employees,
  suppliers,
  onSaveProject,
  onUpdateProject,
  onDeleteProject,
  onSaveTask,
  onUpdateTask,
  onDeleteTask,
  onSaveContract,
  onUpdateContract,
  onDeleteContract,
  onSaveBooking,
  onUpdateBookingStatus,
  onDeleteBooking,
  onSendBookingReminder,
}) => {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'projects' | 'tasks' | 'contracts' | 'bookings'>('projects');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [projectStatusFilter, setProjectStatusFilter] = useState<string>('all');
  const [taskPriorityFilter, setTaskPriorityFilter] = useState<string>('all');
  const [contractCategoryFilter, setContractCategoryFilter] = useState<string>('all');
  const [bookingStatusFilter, setBookingStatusFilter] = useState<string>('all');

  // Modals state
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [selectedProjectForDetail, setSelectedProjectForDetail] = useState<Project | null>(null);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [taskInitialColumn, setTaskInitialColumn] = useState<TaskKanbanColumn>('todo');
  const [isCreateContractOpen, setIsCreateContractOpen] = useState(false);
  const [selectedContractForPrint, setSelectedContractForPrint] = useState<CommercialContract | null>(null);
  const [isCreateBookingOpen, setIsCreateBookingOpen] = useState(false);

  // Quick SMS Toast feedback simulation
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // KPIs Calculation based on active tab
  const kpiData = useMemo(() => {
    // Projects
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'in_progress').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const totalContractBilling = projects.reduce((sum, p) => sum + p.billingAmount, 0);
    const totalActualCost = projects.reduce((sum, p) => sum + p.actualCost, 0);
    const avgProgress = totalProjects > 0 
      ? Math.round(projects.reduce((sum, p) => sum + p.progressPercent, 0) / totalProjects) 
      : 0;

    // Tasks
    const totalTasks = tasks.length;
    const todoTasks = tasks.filter(t => t.column === 'todo').length;
    const inProgressTasks = tasks.filter(t => t.column === 'in_progress').length;
    const inReviewTasks = tasks.filter(t => t.column === 'in_review').length;
    const completedTasks = tasks.filter(t => t.column === 'completed').length;
    const urgentTasks = tasks.filter(t => t.priority === 'urgent' || t.priority === 'high').length;

    // Contracts
    const activeContracts = contracts.filter(c => c.status === 'active').length;
    const expiringSoonContracts = contracts.filter(c => {
      if (c.status === 'expired') return false;
      const end = new Date(c.endDate).getTime();
      const now = Date.now();
      const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
      return diffDays <= 30 && diffDays >= 0;
    }).length;
    const totalContractValue = contracts.reduce((sum, c) => sum + c.contractValue, 0);

    // Bookings
    const totalBookings = bookings.length;
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
    const completedBookings = bookings.filter(b => b.status === 'completed').length;
    const totalBookingFees = bookings
      .filter(b => b.paymentStatus === 'paid')
      .reduce((sum, b) => sum + b.fee, 0);

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      totalContractBilling,
      totalActualCost,
      avgProgress,
      totalTasks,
      todoTasks,
      inProgressTasks,
      inReviewTasks,
      completedTasks,
      urgentTasks,
      activeContracts,
      expiringSoonContracts,
      totalContractValue,
      totalBookings,
      confirmedBookings,
      completedBookings,
      totalBookingFees,
    };
  }, [projects, tasks, contracts, bookings]);

  // Filtered Projects
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchSearch = 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.projectCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.clientName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = projectStatusFilter === 'all' || p.status === projectStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [projects, searchQuery, projectStatusFilter]);

  // Filtered Tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchSearch = 
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.taskCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.projectName && t.projectName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        t.assignedEmployeeName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchPriority = taskPriorityFilter === 'all' || t.priority === taskPriorityFilter;
      return matchSearch && matchPriority;
    });
  }, [tasks, searchQuery, taskPriorityFilter]);

  // Tasks by Column
  const tasksByColumn = useMemo(() => {
    return {
      todo: filteredTasks.filter(t => t.column === 'todo'),
      in_progress: filteredTasks.filter(t => t.column === 'in_progress'),
      in_review: filteredTasks.filter(t => t.column === 'in_review'),
      completed: filteredTasks.filter(t => t.column === 'completed'),
    };
  }, [filteredTasks]);

  // Filtered Contracts
  const filteredContracts = useMemo(() => {
    return contracts.filter(c => {
      const matchSearch = 
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.contractNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.partyName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = contractCategoryFilter === 'all' || c.category === contractCategoryFilter;
      return matchSearch && matchCat;
    });
  }, [contracts, searchQuery, contractCategoryFilter]);

  // Filtered Bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const matchSearch = 
        b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.bookingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.customerPhone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.assignedStaffName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = bookingStatusFilter === 'all' || b.status === bookingStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [bookings, searchQuery, bookingStatusFilter]);

  // Handlers for Task Kanban Column Moves
  const handleMoveTaskColumn = (task: ProjectTask, direction: 'forward' | 'backward') => {
    const columns: TaskKanbanColumn[] = ['todo', 'in_progress', 'in_review', 'completed'];
    const currentIndex = columns.indexOf(task.column);
    const targetIndex = direction === 'forward' ? currentIndex + 1 : currentIndex - 1;
    if (targetIndex >= 0 && targetIndex < columns.length) {
      const updated: ProjectTask = {
        ...task,
        column: columns[targetIndex],
        updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      };
      onUpdateTask(updated);
    }
  };

  const handleToggleChecklistItem = (task: ProjectTask, checklistId: string) => {
    const updatedChecklists = task.checklists.map(c => {
      if (c.id === checklistId) {
        return { ...c, completed: !c.completed };
      }
      return c;
    });
    const updated: ProjectTask = {
      ...task,
      checklists: updatedChecklists,
      updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    };
    onUpdateTask(updated);
  };

  const handleSendReminder = (bkg: AppointmentBooking) => {
    if (onSendBookingReminder) {
      onSendBookingReminder(bkg);
    }
    showToast(`✅ অ্যাপয়েন্টমেন্ট রিমাইন্ডার পাঠানো হয়েছে: ${bkg.customerName} (${bkg.customerPhone}) - সময়: ${bkg.bookingDate} [${bkg.timeSlot}]`);
  };

  const renderTaskCard = (task: ProjectTask) => {
    const completedSubtasks = task.checklists.filter(c => c.completed).length;
    const totalSubtasks = task.checklists.length;
    const checklistProgress = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

    return (
      <div
        key={task.id}
        className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all space-y-2.5"
      >
        <div className="flex items-start justify-between gap-2">
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
            task.priority === 'urgent' ? 'bg-rose-100 text-rose-700' :
            task.priority === 'high' ? 'bg-amber-100 text-amber-800' :
            task.priority === 'medium' ? 'bg-blue-100 text-blue-700' :
            'bg-slate-100 text-slate-600'
          }`}>
            {task.priority === 'urgent' ? 'জরুরি' :
             task.priority === 'high' ? 'হাই প্রায়োরিটি' :
             task.priority === 'medium' ? 'মিডিয়াম' : 'লো'}
          </span>
          <button
            onClick={() => onDeleteTask(task.id)}
            className="text-slate-400 hover:text-red-500 p-0.5 rounded transition"
            title="টাস্ক মুছুন"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div>
          <h4 className="text-xs font-bold text-slate-800 leading-snug">{task.title}</h4>
          {task.description && (
            <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">{task.description}</p>
          )}
        </div>

        {task.projectName && (
          <div className="flex items-center gap-1 text-[10px] font-medium text-purple-700 bg-purple-50/80 px-2 py-0.5 rounded-md">
            <FolderKanban className="w-3 h-3 shrink-0" />
            <span className="truncate">{task.projectName}</span>
          </div>
        )}

        {totalSubtasks > 0 && (
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[10px] text-slate-500">
              <span className="font-medium">সাব-টাস্ক ({completedSubtasks}/{totalSubtasks})</span>
              <span className="font-bold text-slate-700">{checklistProgress}%</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                style={{ width: `${checklistProgress}%` }}
                className="bg-emerald-500 h-full rounded-full transition-all"
              />
            </div>
            <div className="space-y-1 pt-1 max-h-24 overflow-y-auto">
              {task.checklists.map(chk => (
                <label
                  key={chk.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleChecklistItem(task, chk.id);
                  }}
                  className="flex items-center gap-1.5 text-[11px] text-slate-600 cursor-pointer hover:text-slate-900 select-none"
                >
                  <input
                    type="checkbox"
                    checked={chk.completed}
                    readOnly
                    className="w-3.5 h-3.5 text-purple-600 rounded border-slate-300 focus:ring-purple-500 pointer-events-none"
                  />
                  <span className={`truncate ${chk.completed ? 'line-through text-slate-400' : ''}`}>
                    {chk.title}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
          <div className="flex items-center gap-1 truncate max-w-[120px]">
            <User className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="truncate">{task.assignedEmployeeName || 'অনির্ধারিত'}</span>
          </div>
          {task.dueDate && (
            <div className="flex items-center gap-1 text-slate-500 shrink-0">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{task.dueDate}</span>
            </div>
          )}
        </div>

        {/* Move Column Actions */}
        <div className="flex items-center justify-between pt-1 gap-1">
          {task.column !== 'todo' ? (
            <button
              onClick={() => handleMoveTaskColumn(task, 'backward')}
              className="px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg text-[10px] font-semibold flex items-center gap-1 transition"
              title="পূর্ববর্তী কলামে নিন"
            >
              <ArrowLeft className="w-3 h-3" /> পূর্ববর্তী
            </button>
          ) : <span />}

          {task.column !== 'completed' && (
            <button
              onClick={() => handleMoveTaskColumn(task, 'forward')}
              className="px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-[10px] font-semibold flex items-center gap-1 transition ml-auto"
              title="পরবর্তী কলামে নিন"
            >
              পরবর্তী <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification Simulation */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 p-4 bg-slate-900 text-white rounded-xl shadow-2xl flex items-center gap-3 border border-emerald-500/40 animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-2xl shadow-sm border border-purple-800/40">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-purple-600/30 rounded-xl border border-purple-400/30">
              <FolderKanban className="w-6 h-6 text-purple-300" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight">
                প্রজেক্টস, টাস্ক কানবান ও অ্যাপয়েন্টমেন্ট বুকিং ইঞ্জিন
              </h1>
              <p className="text-xs text-purple-200">
                Phase 22: Enterprise Project Tracking, Tasks Kanban Board, Commercial Contracts & Customer Bookings
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Button per active tab */}
        <div className="flex items-center gap-2">
          {activeTab === 'projects' && (
            <button
              onClick={() => setIsCreateProjectOpen(true)}
              className="px-4 py-2 bg-white text-purple-900 hover:bg-purple-50 rounded-xl font-bold text-xs shadow-sm transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              নতুন প্রজেক্ট যোগ করুন
            </button>
          )}
          {activeTab === 'tasks' && (
            <button
              onClick={() => {
                setTaskInitialColumn('todo');
                setIsCreateTaskOpen(true);
              }}
              className="px-4 py-2 bg-white text-purple-900 hover:bg-purple-50 rounded-xl font-bold text-xs shadow-sm transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              নতুন টাস্ক তৈরি করুন
            </button>
          )}
          {activeTab === 'contracts' && (
            <button
              onClick={() => setIsCreateContractOpen(true)}
              className="px-4 py-2 bg-white text-purple-900 hover:bg-purple-50 rounded-xl font-bold text-xs shadow-sm transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              নতুন চুক্তিপত্র তৈরি করুন
            </button>
          )}
          {activeTab === 'bookings' && (
            <button
              onClick={() => setIsCreateBookingOpen(true)}
              className="px-4 py-2 bg-white text-purple-900 hover:bg-purple-50 rounded-xl font-bold text-xs shadow-sm transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              নতুন বুকিং শিডিউল
            </button>
          )}
        </div>
      </div>

      {/* 4 Dynamic Tabs Navigation */}
      <div className="flex border-b border-slate-200 space-x-1 overflow-x-auto pb-0.5">
        <button
          onClick={() => setActiveTab('projects')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition ${
            activeTab === 'projects'
              ? 'bg-white border-t-2 border-purple-600 text-purple-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FolderKanban className="w-4 h-4" />
          <span>প্রজেক্ট ও মাইলস্টোন ({projects.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition ${
            activeTab === 'tasks'
              ? 'bg-white border-t-2 border-purple-600 text-purple-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>টাস্ক কানবান বোর্ড ({tasks.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('contracts')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition ${
            activeTab === 'contracts'
              ? 'bg-white border-t-2 border-purple-600 text-purple-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>বাণিজ্যিক চুক্তিপত্র ({contracts.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition ${
            activeTab === 'bookings'
              ? 'bg-white border-t-2 border-purple-600 text-purple-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>অ্যাপয়েন্টমেন্ট বুকিং ({bookings.length})</span>
        </button>
      </div>

      {/* KPI Cards Strip based on activeTab */}
      {activeTab === 'projects' && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500">মোট প্রজেক্ট</span>
            <p className="text-xl font-black text-slate-900 mt-1">{kpiData.totalProjects}</p>
            <span className="text-[10px] text-purple-600 font-medium">চলমান: {kpiData.activeProjects}</span>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500">মোট চুক্তি মূল্য</span>
            <p className="text-xl font-black text-purple-900 mt-1 font-mono">{currency}{kpiData.totalContractBilling.toLocaleString()}</p>
            <span className="text-[10px] text-slate-400">ক্লায়েন্ট বিলিং ভ্যালু</span>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500">প্রকৃত খরচ (Cost)</span>
            <p className="text-xl font-black text-amber-700 mt-1 font-mono">{currency}{kpiData.totalActualCost.toLocaleString()}</p>
            <span className="text-[10px] text-emerald-600 font-semibold">
              মার্জিন: {currency}{(kpiData.totalContractBilling - kpiData.totalActualCost).toLocaleString()}
            </span>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500">গড় অগ্রগতি (Avg Progress)</span>
            <p className="text-xl font-black text-indigo-700 mt-1">{kpiData.avgProgress}%</p>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div style={{ width: `${kpiData.avgProgress}%` }} className="bg-indigo-600 h-full rounded-full" />
            </div>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500">সম্পন্ন প্রজেক্ট</span>
            <p className="text-xl font-black text-emerald-700 mt-1">{kpiData.completedProjects}</p>
            <span className="text-[10px] text-emerald-600 font-medium">১০০% ডেলিভারি সাইন-অফ</span>
          </div>
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500">মোট টাস্ক</span>
            <p className="text-xl font-black text-slate-900 mt-1">{kpiData.totalTasks}</p>
            <span className="text-[10px] text-purple-600 font-medium">৪টি কলামে বিস্তৃত</span>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500">করতে হবে (To Do)</span>
            <p className="text-xl font-black text-slate-700 mt-1">{kpiData.todoTasks}</p>
            <span className="text-[10px] text-slate-400">অপেক্ষমাণ কিউ</span>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500">চলমান (In Progress)</span>
            <p className="text-xl font-black text-purple-700 mt-1">{kpiData.inProgressTasks}</p>
            <span className="text-[10px] text-purple-600 font-medium">কাজ চলছে</span>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500">যাচাইকরণ (In Review)</span>
            <p className="text-xl font-black text-amber-700 mt-1">{kpiData.inReviewTasks}</p>
            <span className="text-[10px] text-amber-600 font-medium">কোয়ালিটি চেক</span>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500">সম্পন্ন (Completed)</span>
            <p className="text-xl font-black text-emerald-700 mt-1">{kpiData.completedTasks}</p>
            <span className="text-[10px] text-emerald-600 font-medium">চেকলিস্ট ফিনিশড</span>
          </div>
        </div>
      )}

      {activeTab === 'contracts' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500">সক্রিয় বাণিজ্যিক চুক্তি</span>
            <p className="text-xl font-black text-slate-900 mt-1">{kpiData.activeContracts}</p>
            <span className="text-[10px] text-emerald-600 font-medium">নিয়মিত সক্রিয়</span>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500">মোট চুক্তিবদ্ধ মূল্য</span>
            <p className="text-xl font-black text-purple-900 mt-1 font-mono">{currency}{kpiData.totalContractValue.toLocaleString()}</p>
            <span className="text-[10px] text-purple-600 font-medium">বাৎসরিক ও রিটেইনার ভ্যালু</span>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500">মেয়াদোত্তীর্ণ প্রায় (৩০ দিন)</span>
            <p className="text-xl font-black text-amber-600 mt-1">{kpiData.expiringSoonContracts}</p>
            <span className="text-[10px] text-amber-700 font-semibold">রিনিউয়াল প্রস্তাব প্রয়োজন</span>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500">চুক্তির ক্যাটাগরি</span>
            <p className="text-base font-bold text-slate-900 mt-1">Corporate SLA & Supply</p>
            <span className="text-[10px] text-slate-400">লিগ্যাল স্ট্যাম্প ভিউ সমর্থিত</span>
          </div>
        </div>
      )}

      {activeTab === 'bookings' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500">মোট অ্যাপয়েন্টমেন্ট</span>
            <p className="text-xl font-black text-slate-900 mt-1">{kpiData.totalBookings}</p>
            <span className="text-[10px] text-purple-600 font-medium">শিডিউল করা স্লট</span>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500">নিশ্চিতকৃত (Confirmed)</span>
            <p className="text-xl font-black text-emerald-700 mt-1">{kpiData.confirmedBookings}</p>
            <span className="text-[10px] text-emerald-600 font-medium">এসএমএস রিমাইন্ডার পাঠানো</span>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500">সম্পন্ন ভিজিট (Completed)</span>
            <p className="text-xl font-black text-indigo-700 mt-1">{kpiData.completedBookings}</p>
            <span className="text-[10px] text-indigo-600 font-medium">সার্ভিস প্রদান সম্পন্ন</span>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500">সংগৃহীত সার্ভিস ফি</span>
            <p className="text-xl font-black text-purple-900 mt-1 font-mono">{currency}{kpiData.totalBookingFees.toLocaleString()}</p>
            <span className="text-[10px] text-emerald-600 font-semibold">আদায়কৃত ফি</span>
          </div>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-100 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={
              activeTab === 'projects' ? "প্রজেক্টের নাম, কোড বা ক্লায়েন্ট খুঁজুন..." :
              activeTab === 'tasks' ? "টাস্ক শিরোনাম, কর্মী বা প্রজেক্ট খুঁজুন..." :
              activeTab === 'contracts' ? "চুক্তির নাম, রেফারেন্স বা প্রতিষ্ঠান খুঁজুন..." :
              "গ্রাহকের নাম, মোবাইল বা বুকিং কোড খুঁজুন..."
            }
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Tab specific filter dropdown */}
        <div className="flex items-center gap-2">
          {activeTab === 'projects' && (
            <select
              value={projectStatusFilter}
              onChange={e => setProjectStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none"
            >
              <option value="all">সকল স্ট্যাটাস (All Projects)</option>
              <option value="planning">পরিকল্পনা (Planning)</option>
              <option value="in_progress">চলমান (In Progress)</option>
              <option value="on_hold">স্থগিত (On Hold)</option>
              <option value="completed">সম্পন্ন (Completed)</option>
              <option value="cancelled">বাতিল (Cancelled)</option>
            </select>
          )}

          {activeTab === 'tasks' && (
            <select
              value={taskPriorityFilter}
              onChange={e => setTaskPriorityFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none"
            >
              <option value="all">সকল অগ্রাধিকার (All Priorities)</option>
              <option value="urgent">Urgent (জরুরি)</option>
              <option value="high">High (উচ্চ)</option>
              <option value="medium">Medium (মাঝারি)</option>
              <option value="low">Low (সাধারণ)</option>
            </select>
          )}

          {activeTab === 'contracts' && (
            <select
              value={contractCategoryFilter}
              onChange={e => setContractCategoryFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none"
            >
              <option value="all">সকল ক্যাটাগরি (All Contracts)</option>
              <option value="corporate_supply">কর্পোরেট সাপ্লাই (Corporate Supply)</option>
              <option value="service_sla">সার্ভিস ও এসএলএ (Service SLA)</option>
              <option value="vendor_distribution">ভেন্ডর ডিস্ট্রিবিউশন (Vendor)</option>
              <option value="franchise_license">ফ্র্যাঞ্চাইজি (Franchise)</option>
              <option value="nda_mou">সমঝোতা স্মারক ও এনডিএ (MOU)</option>
            </select>
          )}

          {activeTab === 'bookings' && (
            <select
              value={bookingStatusFilter}
              onChange={e => setBookingStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none"
            >
              <option value="all">সকল বুকিং স্ট্যাটাস</option>
              <option value="confirmed">নিশ্চিতকৃত (Confirmed)</option>
              <option value="pending">অপেক্ষমাণ (Pending)</option>
              <option value="completed">সম্পন্ন (Completed)</option>
              <option value="cancelled">বাতিল (Cancelled)</option>
            </select>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: PROJECTS & MILESTONES VIEW */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'projects' && (
        <div className="space-y-4">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
              <FolderKanban className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-700">কোন প্রজেক্ট পাওয়া যায়নি</h3>
              <p className="text-xs text-slate-400 mt-1">নতুন প্রজেক্ট তৈরি করতে উপরের বাটনে ক্লিক করুন।</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProjects.map(proj => {
                const profit = proj.billingAmount - proj.actualCost;
                return (
                  <div
                    key={proj.id}
                    className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-purple-300 transition space-y-4"
                  >
                    {/* Top Row: Code, Priority, Status */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 bg-purple-100 text-purple-800 rounded-md">
                          {proj.projectCode}
                        </span>
                        {proj.priority === 'urgent' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">Urgent</span>
                        )}
                        {proj.priority === 'high' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">High</span>
                        )}
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        proj.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                        proj.status === 'in_progress' ? 'bg-purple-100 text-purple-800' :
                        proj.status === 'planning' ? 'bg-sky-100 text-sky-800' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {proj.status === 'completed' ? 'Completed' :
                         proj.status === 'in_progress' ? 'In Progress' :
                         proj.status === 'planning' ? 'Planning' : proj.status}
                      </span>
                    </div>

                    {/* Title & Client */}
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{proj.title}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        ক্লায়েন্ট: <span className="font-medium text-slate-700">{proj.clientName}</span> {proj.clientCompany ? `(${proj.clientCompany})` : ''}
                      </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">অগ্রগতি</span>
                        <span className="font-bold text-purple-700">{proj.progressPercent}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${proj.progressPercent}%` }}
                          className="bg-gradient-to-r from-purple-600 to-indigo-600 h-full rounded-full transition-all duration-300"
                        />
                      </div>
                    </div>

                    {/* Financials Strip */}
                    <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block">বাজেট ব্যয়</span>
                        <span className="font-bold text-slate-700 font-mono">{currency}{proj.budgetAmount.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">প্রকৃত খরচ</span>
                        <span className="font-bold text-amber-700 font-mono">{currency}{proj.actualCost.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">ক্লায়েন্ট বিলিং</span>
                        <span className="font-bold text-emerald-700 font-mono">{currency}{proj.billingAmount.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Milestones count & Manager */}
                    <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                        <span>মাইলস্টোন: {proj.milestones.filter(m => m.status === 'achieved').length}/{proj.milestones.length} সম্পন্ন</span>
                      </span>
                      <span className="text-slate-400">দায়িত্বে: {proj.managerName}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        onClick={() => setSelectedProjectForDetail(proj)}
                        className="px-3.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        বিস্তারিত ও আপডেট
                      </button>
                      <button
                        onClick={() => onDeleteProject(proj.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: TASKS KANBAN BOARD */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'tasks' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
          {/* Column 1: To Do */}
          <div className="bg-slate-100/80 p-3.5 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <h3 className="text-xs font-bold text-slate-800">To Do (করতে হবে)</h3>
              </div>
              <span className="px-2 py-0.5 bg-white text-slate-600 rounded-full text-[11px] font-bold shadow-2xs">
                {tasksByColumn.todo.length}
              </span>
            </div>

            <button
              onClick={() => {
                setTaskInitialColumn('todo');
                setIsCreateTaskOpen(true);
              }}
              className="w-full py-2 bg-white/70 hover:bg-white text-slate-600 rounded-xl text-xs font-semibold border border-dashed border-slate-300 transition flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-purple-600" />
              টাস্ক যোগ করুন
            </button>

            <div className="space-y-2.5">
              {tasksByColumn.todo.map(task => renderTaskCard(task))}
            </div>
          </div>

          {/* Column 2: In Progress */}
          <div className="bg-purple-50/60 p-3.5 rounded-2xl border border-purple-100 space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                <h3 className="text-xs font-bold text-purple-900">In Progress (চলমান)</h3>
              </div>
              <span className="px-2 py-0.5 bg-white text-purple-700 rounded-full text-[11px] font-bold shadow-2xs">
                {tasksByColumn.in_progress.length}
              </span>
            </div>

            <button
              onClick={() => {
                setTaskInitialColumn('in_progress');
                setIsCreateTaskOpen(true);
              }}
              className="w-full py-2 bg-white/70 hover:bg-white text-purple-700 rounded-xl text-xs font-semibold border border-dashed border-purple-200 transition flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-purple-600" />
              টাস্ক যোগ করুন
            </button>

            <div className="space-y-2.5">
              {tasksByColumn.in_progress.map(task => renderTaskCard(task))}
            </div>
          </div>

          {/* Column 3: In Review */}
          <div className="bg-amber-50/60 p-3.5 rounded-2xl border border-amber-100 space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <h3 className="text-xs font-bold text-amber-900">In Review (যাচাইকরণ)</h3>
              </div>
              <span className="px-2 py-0.5 bg-white text-amber-700 rounded-full text-[11px] font-bold shadow-2xs">
                {tasksByColumn.in_review.length}
              </span>
            </div>

            <button
              onClick={() => {
                setTaskInitialColumn('in_review');
                setIsCreateTaskOpen(true);
              }}
              className="w-full py-2 bg-white/70 hover:bg-white text-amber-700 rounded-xl text-xs font-semibold border border-dashed border-amber-200 transition flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-amber-600" />
              টাস্ক যোগ করুন
            </button>

            <div className="space-y-2.5">
              {tasksByColumn.in_review.map(task => renderTaskCard(task))}
            </div>
          </div>

          {/* Column 4: Completed */}
          <div className="bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-100 space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                <h3 className="text-xs font-bold text-emerald-900">Completed (সম্পন্ন)</h3>
              </div>
              <span className="px-2 py-0.5 bg-white text-emerald-700 rounded-full text-[11px] font-bold shadow-2xs">
                {tasksByColumn.completed.length}
              </span>
            </div>

            <div className="space-y-2.5">
              {tasksByColumn.completed.map(task => renderTaskCard(task))}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: COMMERCIAL CONTRACTS */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'contracts' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="px-4 py-3">চুক্তি কোড ও টাইটেল</th>
                  <th className="px-4 py-3">চুক্তিবদ্ধ প্রতিষ্ঠান</th>
                  <th className="px-4 py-3">ক্যাটাগরি</th>
                  <th className="px-4 py-3">চুক্তি মূল্য</th>
                  <th className="px-4 py-3">মেয়াদ ও রিনিউয়াল</th>
                  <th className="px-4 py-3">স্ট্যাটাস</th>
                  <th className="px-4 py-3 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredContracts.map(c => {
                  const end = new Date(c.endDate).getTime();
                  const now = Date.now();
                  const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
                  const isExpiringSoon = diffDays <= 30 && diffDays >= 0;

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-4 py-3">
                        <span className="font-mono text-purple-700 font-bold block">{c.contractNumber}</span>
                        <span className="font-bold text-slate-800 line-clamp-1">{c.title}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-slate-900 block">{c.partyName}</span>
                        <span className="text-[11px] text-slate-500">{c.partyContact}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="capitalize px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
                          {c.category.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-purple-800">
                        {c.contractValue > 0 ? `${currency}${c.contractValue.toLocaleString()}` : 'MOU'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-slate-700 block font-mono text-[11px]">{c.startDate} হতে {c.endDate}</span>
                        {isExpiringSoon && (
                          <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            {diffDays} দিন বাকি (Expiring Soon)
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          c.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                          c.status === 'expiring_soon' ? 'bg-amber-100 text-amber-800' :
                          c.status === 'expired' ? 'bg-red-100 text-red-800' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {c.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedContractForPrint(c)}
                            title="প্রিন্ট ও লিগ্যাল ভিউ"
                            className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteContract(c.id)}
                            title="মুছে ফেলুন"
                            className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 4: APPOINTMENT BOOKINGS */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredBookings.map(bkg => {
              return (
                <div
                  key={bkg.id}
                  className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-purple-300 transition space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-purple-800 px-2 py-0.5 bg-purple-100 rounded-md">
                        {bkg.bookingNumber}
                      </span>
                      <span className="text-[11px] font-bold capitalize text-slate-600">
                        {bkg.serviceType.replace('_', ' ')}
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      bkg.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                      bkg.status === 'completed' ? 'bg-indigo-100 text-indigo-800' :
                      bkg.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {bkg.status.toUpperCase()}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{bkg.customerName}</h3>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                      <a href={`tel:${bkg.customerPhone}`} className="hover:text-purple-600 font-mono">
                        {bkg.customerPhone}
                      </a>
                      {bkg.customerEmail && <span>• {bkg.customerEmail}</span>}
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl text-xs space-y-1 text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-400">তারিখ ও স্লট:</span>
                      <span className="font-semibold text-slate-800 font-mono">{bkg.bookingDate} | {bkg.timeSlot}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">দায়িত্বপ্রাপ্ত স্পেশালিস্ট:</span>
                      <span className="font-medium text-slate-800">{bkg.assignedStaffName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">লোকেশন:</span>
                      <span className="text-slate-700">{bkg.locationDetails || bkg.locationType}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-200">
                      <span className="text-slate-400">সার্ভিস ফি:</span>
                      <span className="font-mono font-bold text-purple-800">
                        {currency}{bkg.fee.toLocaleString()} ({bkg.paymentStatus})
                      </span>
                    </div>
                  </div>

                  {bkg.notes && (
                    <p className="text-[11px] text-slate-500 italic bg-purple-50/50 p-2 rounded-lg">
                      নোট: {bkg.notes}
                    </p>
                  )}

                  {/* Booking Controls */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <button
                      onClick={() => handleSendReminder(bkg)}
                      className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg font-bold flex items-center gap-1.5 transition text-[11px]"
                    >
                      <Send className="w-3 h-3" />
                      রিমাইন্ডার এসএমএস
                    </button>

                    <div className="flex items-center gap-1.5">
                      {bkg.status !== 'completed' && (
                        <button
                          onClick={() => onUpdateBookingStatus(bkg.id, 'completed')}
                          className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-[11px] transition"
                        >
                          সম্পন্ন মার্ক করুন
                        </button>
                      )}
                      <button
                        onClick={() => onDeleteBooking(bkg.id)}
                        className="p-1 text-slate-400 hover:text-red-500 rounded-md transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Helper function to render a Kanban Task Card */}
      {function renderTaskCard(task: ProjectTask) {
        const completedChecks = task.checklists.filter(c => c.completed).length;
        const totalChecks = task.checklists.length;

        return (
          <div
            key={task.id}
            className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs transition space-y-2.5"
          >
            {/* Task Code & Priority */}
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
                {task.taskCode}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                task.priority === 'high' ? 'bg-amber-100 text-amber-700' :
                task.priority === 'medium' ? 'bg-blue-100 text-blue-700' :
                'bg-slate-100 text-slate-700'
              }`}>
                {task.priority.toUpperCase()}
              </span>
            </div>

            {/* Title */}
            <h4 className="text-xs font-bold text-slate-900 leading-snug">{task.title}</h4>

            {/* Project Pill if associated */}
            {task.projectName && (
              <span className="inline-block text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded truncate max-w-full">
                📁 {task.projectName}
              </span>
            )}

            {/* Checklists Preview */}
            {totalChecks > 0 && (
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>চেকলিস্ট:</span>
                  <span className="font-bold">{completedChecks}/{totalChecks}</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${(completedChecks / totalChecks) * 100}%` }}
                    className="bg-emerald-500 h-full rounded-full transition-all"
                  />
                </div>
                <div className="space-y-1 pt-1 max-h-24 overflow-y-auto">
                  {task.checklists.map(chk => (
                    <div
                      key={chk.id}
                      onClick={() => handleToggleChecklistItem(task, chk.id)}
                      className="flex items-center gap-2 text-[11px] cursor-pointer text-slate-700"
                    >
                      <input
                        type="checkbox"
                        checked={chk.completed}
                        readOnly
                        className="accent-purple-600 rounded text-xs"
                      />
                      <span className={chk.completed ? 'line-through text-slate-400' : ''}>{chk.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Assignee & Due Date */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
              <span className="font-semibold text-slate-700 truncate max-w-[120px]">
                👤 {task.assignedEmployeeName}
              </span>
              <span className="font-mono text-[10px] text-slate-400">📅 {task.dueDate}</span>
            </div>

            {/* Move Column Arrow Controls */}
            <div className="flex items-center justify-between pt-1">
              <button
                disabled={task.column === 'todo'}
                onClick={() => handleMoveTaskColumn(task, 'backward')}
                className="p-1 rounded text-slate-400 hover:text-purple-700 disabled:opacity-20 transition"
                title="পূর্ববর্তী কলামে নিন"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDeleteTask(task.id)}
                className="p-1 text-slate-300 hover:text-red-500 rounded transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                disabled={task.column === 'completed'}
                onClick={() => handleMoveTaskColumn(task, 'forward')}
                className="p-1 rounded text-slate-400 hover:text-purple-700 disabled:opacity-20 transition"
                title="পরবর্তী কলামে নিন"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      }(null as any)}

      {/* Modals Container */}
      {isCreateProjectOpen && (
        <CreateProjectModal
          isOpen={isCreateProjectOpen}
          onClose={() => setIsCreateProjectOpen(false)}
          onSave={data => {
            const newProj: Project = {
              ...data,
              id: `prj-${Date.now()}`,
              createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
              updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
            };
            onSaveProject(newProj);
          }}
          customers={customers}
          employees={employees}
          currency={currency}
        />
      )}

      {selectedProjectForDetail && (
        <ProjectDetailModal
          isOpen={!!selectedProjectForDetail}
          onClose={() => setSelectedProjectForDetail(null)}
          project={selectedProjectForDetail}
          onUpdateProject={onUpdateProject}
          employees={employees}
          currency={currency}
        />
      )}

      {isCreateTaskOpen && (
        <CreateTaskModal
          isOpen={isCreateTaskOpen}
          onClose={() => setIsCreateTaskOpen(false)}
          onSave={data => {
            const newTask: ProjectTask = {
              ...data,
              id: `tsk-${Date.now()}`,
              createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
              updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
            };
            onSaveTask(newTask);
          }}
          projects={projects}
          employees={employees}
          initialColumn={taskInitialColumn}
        />
      )}

      {isCreateContractOpen && (
        <CreateContractModal
          isOpen={isCreateContractOpen}
          onClose={() => setIsCreateContractOpen(false)}
          onSave={data => {
            const newContract: CommercialContract = {
              ...data,
              id: `cnt-${Date.now()}`,
              createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
            };
            onSaveContract(newContract);
          }}
          customers={customers}
          suppliers={suppliers}
          currency={currency}
        />
      )}

      {selectedContractForPrint && (
        <ContractPrintModal
          isOpen={!!selectedContractForPrint}
          onClose={() => setSelectedContractForPrint(null)}
          contract={selectedContractForPrint}
          tenant={tenant}
          currency={currency}
        />
      )}

      {isCreateBookingOpen && (
        <CreateBookingModal
          isOpen={isCreateBookingOpen}
          onClose={() => setIsCreateBookingOpen(false)}
          onSave={data => {
            const newBooking: AppointmentBooking = {
              ...data,
              id: `bkg-${Date.now()}`,
              createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
            };
            onSaveBooking(newBooking);
          }}
          customers={customers}
          employees={employees}
          currency={currency}
        />
      )}
    </div>
  );
};
