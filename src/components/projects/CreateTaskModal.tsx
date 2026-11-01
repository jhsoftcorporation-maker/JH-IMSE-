import React, { useState } from 'react';
import { X, CheckSquare, Calendar, User, Clock, Tag, Plus, Trash2 } from 'lucide-react';
import { ProjectTask, Project, Employee, TaskPriority, TaskKanbanColumn, TaskChecklistItem } from '../../types';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<ProjectTask, 'id' | 'createdAt' | 'updatedAt'>) => void;
  projects: Project[];
  employees: Employee[];
  initialColumn?: TaskKanbanColumn;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  projects,
  employees,
  initialColumn = 'todo',
}) => {
  const [title, setTitle] = useState('');
  const [taskCode, setTaskCode] = useState(`TSK-${Math.floor(100 + Math.random() * 900)}`);
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState(projects[0]?.id || '');
  const [column, setColumn] = useState<TaskKanbanColumn>(initialColumn);
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [assignedEmployeeId, setAssignedEmployeeId] = useState(employees[0]?.id || '');
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
  const [estimatedHours, setEstimatedHours] = useState<number>(8);
  const [tagsInput, setTagsInput] = useState('');

  // Sub-task checklist items
  const [checklists, setChecklists] = useState<TaskChecklistItem[]>([
    { id: 'chk-1', title: 'প্রাথমিক পরীক্ষা ও যাচাই', completed: false },
  ]);
  const [newChecklistText, setNewChecklistText] = useState('');

  if (!isOpen) return null;

  const handleAddChecklist = () => {
    if (!newChecklistText.trim()) return;
    setChecklists(prev => [
      ...prev,
      {
        id: `chk-${Date.now()}`,
        title: newChecklistText.trim(),
        completed: false,
      },
    ]);
    setNewChecklistText('');
  };

  const handleRemoveChecklist = (id: string) => {
    setChecklists(prev => prev.filter(c => c.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const assigned = employees.find(emp => emp.id === assignedEmployeeId);
    const assignedEmployeeName = assigned?.name || 'Staff Member';

    const selectedProj = projects.find(p => p.id === projectId);
    const projectName = selectedProj?.title;

    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    onSave({
      taskCode,
      tenantId: '',
      projectId: projectId || undefined,
      projectName,
      title: title.trim(),
      description: description.trim(),
      column,
      priority,
      assignedEmployeeId,
      assignedEmployeeName,
      dueDate,
      estimatedHours: Number(estimatedHours) || 0,
      spentHours: 0,
      checklists,
      tags,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl flex flex-col border border-slate-100">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">নতুন কানবান টাস্ক যোগ করুন (New Task)</h2>
              <p className="text-xs text-slate-500">কাজের দায়িত্ব, ডেডলাইন ও চেকলিস্ট অ্যাসাইন করুন</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-3 space-y-1">
              <label className="text-xs font-semibold text-slate-700">টাস্ক টাইটেল *</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="যেমন: ৩টি কাউন্টারে থার্মাল প্রিন্টার ড্রাইভার সেটআপ"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">টাস্ক কোড</label>
              <input
                type="text"
                value={taskCode}
                onChange={e => setTaskCode(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl text-purple-700 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">সংযুক্ত প্রজেক্ট (ঐচ্ছিক)</label>
              <select
                value={projectId}
                onChange={e => setProjectId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">-- সাধারণ অপারেশনাল টাস্ক --</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.projectCode} - {p.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">দায়িত্বপ্রাপ্ত কর্মী (Assignee) *</label>
              <select
                value={assignedEmployeeId}
                onChange={e => setAssignedEmployeeId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.designation})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">কলাম স্ট্যাটাস</label>
              <select
                value={column}
                onChange={e => setColumn(e.target.value as TaskKanbanColumn)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="todo">To Do (করতে হবে)</option>
                <option value="in_progress">In Progress (চলমান)</option>
                <option value="in_review">In Review (যাচাই)</option>
                <option value="completed">Completed (সম্পন্ন)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">অগ্রাধিকার (Priority)</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="low">Low (সাধারণ)</option>
                <option value="medium">Medium (মাঝারি)</option>
                <option value="high">High (উচ্চ)</option>
                <option value="urgent">Urgent (জরুরি)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">ডেডলাইন তারিখ</label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">আনুমানিক কর্মঘণ্টা (Hours)</label>
              <input
                type="number"
                min="1"
                value={estimatedHours}
                onChange={e => setEstimatedHours(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">ট্যাগস (কমা দিয়ে)</label>
              <input
                type="text"
                value={tagsInput}
                onChange={e => setTagsInput(e.target.value)}
                placeholder="Hardware, POS, Urgent"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">কাজের বিস্তারিত বর্ণনা</label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="কাজের বিস্তারিত বিবরণ ও নির্দেশনাবলী লিখুন..."
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Checklist Subtasks */}
          <div className="space-y-2 pt-1">
            <label className="text-xs font-bold text-slate-800">সাব-টাস্ক চেকলিস্ট ({checklists.length}):</label>
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {checklists.map((chk, idx) => (
                <div key={chk.id} className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                  <span className="text-slate-700 font-medium">{idx + 1}. {chk.title}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveChecklist(chk.id)}
                    className="text-slate-400 hover:text-red-500 p-1 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-1">
              <input
                type="text"
                placeholder="+ নতুন সাব-টাস্ক চেকলিস্ট আইটেম..."
                value={newChecklistText}
                onChange={e => setNewChecklistText(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddChecklist}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                যোগ
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-sm transition flex items-center gap-2"
            >
              <CheckSquare className="w-4 h-4" />
              টাস্ক তৈরি করুন
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
