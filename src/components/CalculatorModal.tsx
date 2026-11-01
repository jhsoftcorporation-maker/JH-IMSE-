import React, { useState } from 'react';
import { X, Delete, Equal } from 'lucide-react';

interface CalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CalculatorModal: React.FC<CalculatorModalProps> = ({ isOpen, onClose }) => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');

  if (!isOpen) return null;

  const handleNum = (num: string) => {
    if (display === '0') {
      setDisplay(num);
    } else {
      setDisplay(display + num);
    }
  };

  const handleOp = (op: string) => {
    setEquation(display + ' ' + op + ' ');
    setDisplay('0');
  };

  const handleEqual = () => {
    try {
      const fullExpr = equation + display;
      // safe simple evaluation of basic math
      const cleanExpr = fullExpr.replace(/[^0-9+\-*/.]/g, '');
      // eslint-disable-next-line no-eval
      const result = Function(`'use strict'; return (${cleanExpr})`)();
      setDisplay(String(result));
      setEquation('');
    } catch {
      setDisplay('Error');
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setEquation('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs border border-purple-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-purple-700 text-white px-4 py-3 flex items-center justify-between">
          <div className="font-semibold text-sm flex items-center gap-2">
            <span>🧮 POS কুইক ক্যালকুলেটর</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-purple-800 rounded-lg text-purple-200 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 bg-slate-900 text-right">
          <div className="text-xs text-purple-300 min-h-[18px]">{equation}</div>
          <div className="text-2xl font-mono font-bold text-white tracking-wider truncate">{display}</div>
        </div>

        <div className="p-3 grid grid-cols-4 gap-2 bg-slate-50">
          <button onClick={handleClear} className="col-span-2 py-2.5 bg-rose-100 text-rose-700 hover:bg-rose-200 font-semibold rounded-xl text-sm transition">AC</button>
          <button onClick={() => setDisplay(display.length > 1 ? display.slice(0, -1) : '0')} className="py-2.5 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-xl flex items-center justify-center transition">
            <Delete className="w-4 h-4" />
          </button>
          <button onClick={() => handleOp('/')} className="py-2.5 bg-purple-100 text-purple-700 hover:bg-purple-200 font-bold rounded-xl text-base transition">÷</button>

          {['7', '8', '9'].map(n => (
            <button key={n} onClick={() => handleNum(n)} className="py-2.5 bg-white border border-slate-200 text-slate-800 hover:bg-slate-100 font-semibold rounded-xl text-base shadow-xs transition">{n}</button>
          ))}
          <button onClick={() => handleOp('*')} className="py-2.5 bg-purple-100 text-purple-700 hover:bg-purple-200 font-bold rounded-xl text-base transition">×</button>

          {['4', '5', '6'].map(n => (
            <button key={n} onClick={() => handleNum(n)} className="py-2.5 bg-white border border-slate-200 text-slate-800 hover:bg-slate-100 font-semibold rounded-xl text-base shadow-xs transition">{n}</button>
          ))}
          <button onClick={() => handleOp('-')} className="py-2.5 bg-purple-100 text-purple-700 hover:bg-purple-200 font-bold rounded-xl text-base transition">−</button>

          {['1', '2', '3'].map(n => (
            <button key={n} onClick={() => handleNum(n)} className="py-2.5 bg-white border border-slate-200 text-slate-800 hover:bg-slate-100 font-semibold rounded-xl text-base shadow-xs transition">{n}</button>
          ))}
          <button onClick={() => handleOp('+')} className="py-2.5 bg-purple-100 text-purple-700 hover:bg-purple-200 font-bold rounded-xl text-base transition">+</button>

          <button onClick={() => handleNum('0')} className="col-span-2 py-2.5 bg-white border border-slate-200 text-slate-800 hover:bg-slate-100 font-semibold rounded-xl text-base shadow-xs transition">0</button>
          <button onClick={() => handleNum('.')} className="py-2.5 bg-white border border-slate-200 text-slate-800 hover:bg-slate-100 font-semibold rounded-xl text-base shadow-xs transition">.</button>
          <button onClick={handleEqual} className="py-2.5 bg-purple-700 text-white hover:bg-purple-800 font-bold rounded-xl text-base shadow-md transition flex items-center justify-center">
            <Equal className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
