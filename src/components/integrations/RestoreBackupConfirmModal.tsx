import React, { useState } from 'react';
import { X, AlertTriangle, Database, CheckCircle2, ShieldAlert } from 'lucide-react';
import { DatabaseBackupArchive } from '../../types';

interface RestoreBackupConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  archive: DatabaseBackupArchive;
  onConfirmRestore: (archiveId: string) => void;
}

export const RestoreBackupConfirmModal: React.FC<RestoreBackupConfirmModalProps> = ({
  isOpen,
  onClose,
  archive,
  onConfirmRestore,
}) => {
  const [confirmationInput, setConfirmationInput] = useState('');
  const [isRestoring, setIsRestoring] = useState(false);
  const [progress, setProgress] = useState(0);

  if (!isOpen) return null;

  const isMatch = confirmationInput.trim().toUpperCase() === 'RESTORE';

  const handleStartRestore = () => {
    if (!isMatch) return;
    setIsRestoring(true);
    setProgress(10);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          setTimeout(() => {
            setIsRestoring(false);
            onConfirmRestore(archive.id);
            onClose();
          }, 400);
          return 100;
        }
        return prev + 20;
      });
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-rose-200 overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-700 to-red-800 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-rose-200" />
            </div>
            <div>
              <h3 className="font-bold text-base">ডাটাবেজ রিস্টোর নিশ্চিতকরণ</h3>
              <p className="text-xs text-rose-200">সতর্কতা: বর্তমান ডাটা এই আর্কাইভে প্রতিস্থাপিত হবে</p>
            </div>
          </div>
          {!isRestoring && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition cursor-pointer text-rose-200 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-xs text-slate-700">
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 font-bold text-rose-900 text-xs">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              <span>গুরুত্বপূর্ণ নিরাপত্তা নির্দেশিকা:</span>
            </div>
            <p className="text-rose-800 text-[11px] leading-relaxed">
              আপনি <span className="font-mono font-bold">{archive.fileName}</span> ব্যাকআপ ফাইল থেকে ডাটাবেজ রিস্টোর করতে যাচ্ছেন। রিস্টোর সম্পন্ন হলে এই তারিখের পরের কোনো বিক্রয়, চালান বা নতুন পণ্য থাকলে তা মুছে যাবে।
            </p>
          </div>

          {/* Archive Metadata Card */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 font-mono text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-sans">ফাইল নেম:</span>
              <span className="font-bold text-slate-900">{archive.fileName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-sans">ফাইলের সাইজ:</span>
              <span className="text-slate-700 font-bold">{archive.fileSizeFormatted}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-sans">ব্যাকআপের সময়:</span>
              <span className="text-slate-700">{archive.createdAt}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-sans">তৈরি করেছেন:</span>
              <span className="text-slate-700 font-sans">{archive.createdBy}</span>
            </div>
          </div>

          {isRestoring ? (
            <div className="py-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span>ডাটাবেজ টেবিল রিস্টোর হচ্ছে...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
                <div
                  className="bg-gradient-to-r from-rose-600 to-red-600 h-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400 text-center font-mono">
                Executing SQL DDL schema & unpacking compressed records...
              </p>
            </div>
          ) : (
            <div className="space-y-2 pt-1">
              <label className="font-bold text-slate-800 block text-xs">
                রিস্টোর নিশ্চিত করতে নিচে বড়হাতে <span className="text-rose-600 font-mono">RESTORE</span> টাইপ করুন:
              </label>
              <input
                type="text"
                value={confirmationInput}
                onChange={e => setConfirmationInput(e.target.value)}
                placeholder="RESTORE"
                className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl focus:border-rose-500 focus:outline-none text-center font-mono font-bold text-sm text-slate-900 tracking-wider uppercase"
                autoFocus
              />
            </div>
          )}

          {/* Actions */}
          {!isRestoring && (
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleStartRestore}
                disabled={!isMatch}
                className={`px-5 py-2 rounded-xl font-bold transition flex items-center gap-2 cursor-pointer ${
                  isMatch
                    ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-900/20 active:scale-98'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Database className="w-4 h-4" />
                <span>রিস্টোর শুরু করুন</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
