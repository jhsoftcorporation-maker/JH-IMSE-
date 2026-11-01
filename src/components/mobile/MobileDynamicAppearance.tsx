import React, { useState } from 'react';
import { Layout, Palette, Moon, Sun, Check, X } from 'lucide-react';

interface MobileDynamicAppearanceProps {
  isOpen: boolean;
  onClose: () => void;
  currentColor: string;
  onSelectColor: (color: string) => void;
  sidebarLayout: 'sidebar-1' | 'sidebar-2';
  onSelectSidebarLayout: (layout: 'sidebar-1' | 'sidebar-2') => void;
  isDarkMode: boolean;
  onToggleDarkMode: (enabled: boolean) => void;
  isRTL: boolean;
  onToggleRTL: (enabled: boolean) => void;
}

const PRESET_COLORS = [
  { name: 'Purple (Stocky Classic)', hex: '#663399' },
  { name: 'Royal Blue', hex: '#3b82f6' },
  { name: 'Emerald Green', hex: '#10b981' },
  { name: 'Vibrant Magenta', hex: '#e11d48' },
  { name: 'Amber Orange', hex: '#f59e0b' },
  { name: 'Crimson Red', hex: '#ef4444' },
  { name: 'Ocean Cyan', hex: '#06b6d4' },
  { name: 'Midnight Slate', hex: '#1e293b' },
];

export const MobileDynamicAppearance: React.FC<MobileDynamicAppearanceProps> = ({
  isOpen,
  onClose,
  currentColor,
  onSelectColor,
  sidebarLayout,
  onSelectSidebarLayout,
  isDarkMode,
  onToggleDarkMode,
  isRTL,
  onToggleRTL,
}) => {
  const [customHex, setCustomHex] = useState(currentColor || '#663399');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end sm:justify-center bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-100 overflow-hidden text-slate-800 animate-in slide-in-from-bottom duration-300"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-[#663399]" />
            <span className="font-bold text-sm text-slate-800">Dynamic Appearance</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center transition"
          >
            <X className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        <div className="p-5 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* 1. Sidebar Layout */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2.5">
              Sidebar Layout
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onSelectSidebarLayout('sidebar-1')}
                className={`p-3 rounded-2xl border-2 flex items-center gap-2 text-xs font-semibold transition ${
                  sidebarLayout === 'sidebar-1'
                    ? 'border-[#663399] bg-[#663399]/5 text-[#663399]'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <div className="w-4 h-4 border border-current rounded flex flex-col justify-center gap-0.5 p-0.5">
                  <div className="h-0.5 bg-current w-full rounded-xs"></div>
                  <div className="h-0.5 bg-current w-full rounded-xs"></div>
                </div>
                <span>Sidebar 1</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectSidebarLayout('sidebar-2')}
                className={`p-3 rounded-2xl border-2 flex items-center gap-2 text-xs font-semibold transition ${
                  sidebarLayout === 'sidebar-2'
                    ? 'border-[#663399] bg-[#663399]/5 text-[#663399]'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <div className="w-4 h-4 border border-current rounded flex flex-col justify-center gap-0.5 p-0.5">
                  <div className="h-0.5 bg-current w-full rounded-xs"></div>
                  <div className="h-0.5 bg-current w-2/3 rounded-xs"></div>
                </div>
                <span>Sidebar 2</span>
              </button>
            </div>
          </div>

          {/* 2. Primary Color */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2.5">
              Primary Color
            </label>
            <div className="flex flex-wrap items-center gap-3">
              {PRESET_COLORS.map(c => {
                const isSelected = currentColor.toLowerCase() === c.hex.toLowerCase();
                return (
                  <button
                    key={c.hex}
                    type="button"
                    title={c.name}
                    onClick={() => {
                      onSelectColor(c.hex);
                      setCustomHex(c.hex);
                    }}
                    style={{ backgroundColor: c.hex }}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition shadow-xs hover:scale-110 relative ${
                      isSelected ? 'ring-3 ring-offset-2 ring-slate-800' : ''
                    }`}
                  >
                    {isSelected && <Check className="w-4 h-4 text-white stroke-[3]" />}
                  </button>
                );
              })}
            </div>

            {/* Custom Hex Input */}
            <div className="mt-3.5 flex items-center gap-3">
              <span className="text-xs text-slate-500 font-medium">Custom:</span>
              <div
                style={{ backgroundColor: customHex }}
                className="w-7 h-7 rounded-lg border border-slate-300 shadow-inner shrink-0"
              />
              <input
                type="text"
                value={customHex}
                onChange={e => {
                  const val = e.target.value;
                  setCustomHex(val);
                  if (/^#([0-9A-F]{3}){1,2}$/i.test(val)) {
                    onSelectColor(val);
                  }
                }}
                placeholder="#663399"
                className="font-mono text-xs uppercase px-3 py-1.5 border border-slate-200 rounded-xl w-28 focus:outline-none focus:ring-1 focus:ring-[#663399]"
              />
            </div>
          </div>

          {/* 3. Dark Mode */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-700 block">Dark Mode</span>
              <span className="text-[11px] text-slate-400">Switch between light and high-contrast dark theme</span>
            </div>
            <button
              type="button"
              onClick={() => onToggleDarkMode(!isDarkMode)}
              className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 ${
                isDarkMode ? 'bg-[#663399]' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  isDarkMode ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* 4. RTL Support */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-700 block">RTL</span>
              <span className="text-[11px] text-slate-400">Enable Right-to-Left orientation (Arabic/Urdu)</span>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isRTL}
                onChange={e => onToggleRTL(e.target.checked)}
                className="rounded text-[#663399] focus:ring-[#663399] w-4 h-4"
              />
              <span className="text-xs font-medium text-slate-600">Enable RTL</span>
            </label>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-white font-bold text-xs shadow-md transition"
            style={{ backgroundColor: currentColor || '#663399' }}
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
