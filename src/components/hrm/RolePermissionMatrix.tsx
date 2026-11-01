import React, { useState } from 'react';
import { 
  Shield, ShieldCheck, Lock, Unlock, Check, X, Plus, 
  HelpCircle, UserCheck, Settings, Save, RotateCcw, AlertTriangle,
  Info, Eye, Edit3
} from 'lucide-react';
import { RolePermission } from '../../types';

interface RolePermissionMatrixProps {
  rolePermissions: RolePermission[];
  onUpdateRolePermissions: (roles: RolePermission[]) => void;
}

export const RolePermissionMatrix: React.FC<RolePermissionMatrixProps> = ({
  rolePermissions,
  onUpdateRolePermissions,
}) => {
  const [roles, setRoles] = useState<RolePermission[]>(rolePermissions);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('cashier');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleNameBn, setNewRoleNameBn] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');

  const activeRole = roles.find(r => r.roleId === selectedRoleId) || roles[0];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleTogglePermission = (roleId: string, permissionKey: keyof RolePermission['permissions']) => {
    const updated = roles.map(r => {
      if (r.roleId === roleId) {
        return {
          ...r,
          permissions: {
            ...r.permissions,
            [permissionKey]: !r.permissions[permissionKey],
          },
        };
      }
      return r;
    });
    setRoles(updated);
    onUpdateRolePermissions(updated);
    showToast(`রোল '${activeRole.roleNameBn}' এর পারমিশন সফলভাবে আপডেট হয়েছে!`);
  };

  const handleCreateCustomRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim() || !newRoleNameBn.trim()) return;

    const newId = 'custom-' + Date.now();
    const newRole: RolePermission = {
      roleId: newId,
      roleName: newRoleName.trim(),
      roleNameBn: newRoleNameBn.trim(),
      description: newRoleDesc.trim() || 'কাস্টম অনুমতি স্তর',
      isSystem: false,
      permissions: {
        posBilling: true,
        posDiscount: false,
        posPriceOverride: false,
        posHoldCart: true,
        inventoryView: true,
        inventoryManage: false,
        stockTransfer: false,
        customerView: true,
        customerDueCollect: false,
        customerCreditLimit: false,
        sendSmsReminder: false,
        quotationsManage: false,
        challansManage: false,
        creditNotesManage: false,
        financialReports: false,
        hrmManage: false,
        payrollManage: false,
        settingsManage: false,
      },
    };

    const updated = [...roles, newRole];
    setRoles(updated);
    onUpdateRolePermissions(updated);
    setSelectedRoleId(newId);
    setIsAddRoleModalOpen(false);
    setNewRoleName('');
    setNewRoleNameBn('');
    setNewRoleDesc('');
    showToast(`নতুন কাস্টম রোল '${newRoleNameBn}' তৈরি সম্পন্ন হয়েছে`);
  };

  // Group definitions for clear visual matrix
  const permissionModules = [
    {
      moduleTitle: '১. POS কাউন্টার ও বিলিং (POS Billing)',
      description: 'দোকানের কাউন্টারে পণ্য স্ক্যান, সেলস ও ডিসকাউন্ট নিয়ন্ত্রণ',
      permissions: [
        { key: 'posBilling', title: 'POS বিক্রয় বিল তৈরি', desc: 'পণ্য স্ক্যান ও বিক্রয় মেমো প্রিন্ট' },
        { key: 'posDiscount', title: 'বিশেষ ডিসকাউন্ট প্রদান', desc: 'আইটেম বা মোট বিলে নিজস্ব ছাড় দেওয়ার ক্ষমতা' },
        { key: 'posPriceOverride', title: 'বিক্রয়মূল্য পরিবর্তন (Price Override)', desc: 'কাউন্টারে নির্ধারিত দামের পরিবর্তন' },
        { key: 'posHoldCart', title: 'হোল্ড কার্ট (Hold Cart)', desc: 'সাময়িকভাবে কাস্টমার বিল স্থগিত ও পুনরুদ্ধার' },
      ],
    },
    {
      moduleTitle: '২. ইনভেন্টরি ও গোডাউন (Inventory & Stock)',
      description: 'মাল স্টক, ক্রয় মূল্য, ব্যাচ ও গোডাউন ট্রান্সফার অ্যাক্সেস',
      permissions: [
        { key: 'inventoryView', title: 'স্টক ও পণ্যের তালিকা দেখা', desc: 'মজুত পণ্য ও ইউনিট অনুসন্ধান' },
        { key: 'inventoryManage', title: 'নতুন পণ্য যোগ ও স্টক সমন্বয়', desc: 'মূল্য নির্ধারণ, ড্যামেজ এন্ট্রি ও এডিট' },
        { key: 'stockTransfer', title: 'আন্তঃশাখা স্টক ট্রান্সফার', desc: 'এক গোডাউন থেকে অন্য গোডাউনে মাল চালান' },
      ],
    },
    {
      moduleTitle: '৩. কাস্টমার ও ডিজিটাল বাকি খাতা CRM',
      description: 'বকেয়া হিসাব, টাকা গ্রহণ ও তাগাদা এসএমএস পাঠানো',
      permissions: [
        { key: 'customerView', title: 'গ্রাহক তালিকা ও ক্রয় ইতিহাস দেখা', desc: 'গ্রাহকের প্রোফাইল ও কেনাকাটা ভিউ' },
        { key: 'customerDueCollect', title: 'বকেয়া টাকা জমা ও রিসিট প্রদান', desc: 'গ্রাহক থেকে নগদ/বিকাশ পেমেন্ট রিসিভ' },
        { key: 'customerCreditLimit', title: 'ক্রেডিট লিমিট ও বাকি সীমা নির্ধারণ', desc: 'বকেয়া সীমা বৃদ্ধি বা নিয়ন্ত্রণ' },
        { key: 'sendSmsReminder', title: 'বকেয়া তাগাদা SMS পাঠানো', desc: 'গ্রাহকের ফোনে স্বয়ংক্রিয় বাংলা এসএমএস' },
      ],
    },
    {
      moduleTitle: '৪. কোটেশন, চালান ও রিটার্ন ভাউচার',
      description: 'করপোরেট কোটেশন, ডেলিভারি চালান ও ক্রেডিট নোট রিটার্ন',
      permissions: [
        { key: 'quotationsManage', title: 'মূল্য কোটেশন তৈরি ও মেমো কনভার্ট', desc: 'কোটেশন প্রদান ও অনুমোদন' },
        { key: 'challansManage', title: 'ডেলিভারি চালান ও ট্রান্সপোর্ট গেটপাস', desc: 'মাল খালাস ও পরিবহন ভাউচার' },
        { key: 'creditNotesManage', title: 'বিক্রি ফেরত ও ক্রেডিট নোট প্রদান', desc: 'পণ্য রিটার্ন ও স্টক পুনঃপ্রবেশ' },
      ],
    },
    {
      moduleTitle: '৫. হিসাববিজ্ঞান, লাভ-ক্ষতি ও HRM',
      description: 'ব্যবসায়ের মোট আয়-ব্যয়, স্টাফদের বেতন ও অনুমতি নিয়ন্ত্রণ',
      permissions: [
        { key: 'financialReports', title: 'দৈনিক লাভ-ক্ষতি ও আর্থিক রিপোর্ট', desc: 'মার্জিন, রাজস্ব ও ক্যাশ ড্রয়ার হিসাব' },
        { key: 'hrmManage', title: 'স্টাফ প্রোফাইল ও দৈনিক হাজিরা', desc: 'কর্মচারী পরিচালনা ও হাজিরা রেজিস্টার' },
        { key: 'payrollManage', title: 'বেতন স্লিপ অনুমোদন ও কমিশন প্রদান', desc: 'মাসিক পে-রোল ও কমিশন ক্যালকুলেটর' },
        { key: 'settingsManage', title: 'সিস্টেম সেটিংস ও স্টোর কনফিগারেশন', desc: 'ট্যাক্স/ভ্যাট, প্রিন্টার ও লাইসেন্স' },
      ],
    },
  ];

  return (
    <div className="space-y-4">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs border border-purple-500/30 animate-in fade-in slide-in-from-top-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Info */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-700" />
            ভূমিকা-ভিত্তিক প্রবেশাধিকার নিয়ন্ত্রণ (RBAC - Role-Based Access Control)
          </h3>
          <p className="text-xs text-slate-500">
            কাউন্টার ক্যাশিয়ার, ম্যানেজার, অডিটর ও অন্যান্য স্টাফদের নির্দিষ্ট অনুমতি নির্ধারণ করুন
          </p>
        </div>

        <button
          onClick={() => setIsAddRoleModalOpen(true)}
          className="px-3.5 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" /> নতুন কাস্টম রোল তৈরি করুন
        </button>
      </div>

      {/* Role Selector Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {roles.map(r => {
          const isSelected = r.roleId === selectedRoleId;
          const activePermCount = Object.values(r.permissions).filter(Boolean).length;
          const totalPermCount = Object.values(r.permissions).length;

          return (
            <button
              key={r.roleId}
              onClick={() => setSelectedRoleId(r.roleId)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition text-left shrink-0 cursor-pointer border ${
                isSelected
                  ? 'bg-purple-900 text-white border-purple-900 shadow-sm'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span>{r.roleNameBn}</span>
                {r.isSystem && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-black ${
                    isSelected ? 'bg-purple-700 text-purple-200' : 'bg-slate-100 text-slate-500'
                  }`}>
                    SYSTEM
                  </span>
                )}
              </div>
              <div className={`text-[10px] mt-0.5 font-normal ${isSelected ? 'text-purple-200' : 'text-slate-400'}`}>
                অনুমোদিত: {activePermCount}/{totalPermCount} টি
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Role Overview Banner */}
      <div className="bg-purple-50 rounded-2xl p-4 border border-purple-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-slate-900 text-sm">{activeRole.roleNameBn}</h4>
            <span className="text-xs text-purple-700 font-mono">({activeRole.roleName})</span>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">{activeRole.description}</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500">অনুমতি পরিবর্তন সাথে সাথে সক্রিয় হয়</span>
        </div>
      </div>

      {/* Granular Permission Checklist by Module */}
      <div className="space-y-4">
        {permissionModules.map((mod, idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
              <div>
                <h4 className="font-bold text-xs text-slate-900">{mod.moduleTitle}</h4>
                <p className="text-[11px] text-slate-500">{mod.description}</p>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {mod.permissions.map(perm => {
                const isEnabled = !!activeRole.permissions[perm.key as keyof RolePermission['permissions']];

                return (
                  <div
                    key={perm.key}
                    className="p-3.5 px-4 flex items-center justify-between hover:bg-slate-50/80 transition"
                  >
                    <div className="pr-4">
                      <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                        {isEnabled ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        ) : (
                          <X className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        )}
                        <span>{perm.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{perm.desc}</p>
                    </div>

                    <div>
                      <button
                        onClick={() => handleTogglePermission(activeRole.roleId, perm.key as keyof RolePermission['permissions'])}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
                          isEnabled ? 'bg-purple-700' : 'bg-slate-200'
                        }`}
                        title={isEnabled ? 'অনুমতি বন্ধ করুন' : 'অনুমতি চালু করুন'}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-xs ${
                            isEnabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Add Custom Role Modal */}
      {isAddRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
              <h3 className="font-bold text-sm">নতুন কাস্টম রোল তৈরি করুন</h3>
              <button
                onClick={() => setIsAddRoleModalOpen(false)}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomRole} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  রোলের নাম (বাংলায়) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newRoleNameBn}
                  onChange={e => setNewRoleNameBn(e.target.value)}
                  placeholder="যেমন: সিনিয়র ফার্মাসিস্ট / সহকারী ক্যাশিয়ার"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  রোলের কোড / ইংরেজি নাম <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newRoleName}
                  onChange={e => setNewRoleName(e.target.value)}
                  placeholder="যেমন: Senior Pharmacist"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">দায়িত্ব ও বিবরণ</label>
                <textarea
                  rows={2}
                  value={newRoleDesc}
                  onChange={e => setNewRoleDesc(e.target.value)}
                  placeholder="এই রোলের অন্তর্ভুক্ত কর্মচারীদের কর্মপরিধি লিখুন..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 outline-none resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddRoleModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold cursor-pointer"
                >
                  রোল তৈরি করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
