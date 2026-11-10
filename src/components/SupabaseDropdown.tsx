import React, { useState, useRef, useEffect } from 'react';
import { Database, ExternalLink, Smartphone, ChevronDown } from 'lucide-react';

export const SupabaseDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-right" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-1.5 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-300 dark:border-emerald-500/30 rounded-md sm:rounded-lg transition-all duration-200 cursor-pointer shadow-sm hover:border-emerald-400/50 shrink-0"
        title="روابط سريعة لأدوات Supabase"
        aria-expanded={isOpen}
      >
        <Database className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span>Supabase</span>
        <ChevronDown className={`w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-600/70 dark:text-emerald-400/70 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-56 rounded-xl bg-[#0f172a] border border-slate-700/80 shadow-2xl z-50 py-1.5 backdrop-blur-md animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="px-3 py-1.5 border-b border-slate-800 text-[11px] font-medium text-slate-400">
            أدوات وإدارة Supabase
          </div>
          
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-between px-3 py-2 text-xs text-slate-200 hover:text-white hover:bg-emerald-950/40 transition-colors group"
          >
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              <div className="text-right">
                <p className="font-semibold text-slate-100">Supabase Dashboard</p>
                <p className="text-[10px] text-slate-400">لوحة تحكم وإعدادات المشروعات</p>
              </div>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400" />
          </a>

          <a
            href="https://play.google.com/store/apps/details?id=com.supabase.dashboard"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-between px-3 py-2 text-xs text-slate-200 hover:text-white hover:bg-emerald-950/40 transition-colors group"
          >
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              <div className="text-right">
                <p className="font-semibold text-slate-100">Supabase Android App</p>
                <p className="text-[10px] text-slate-400">تحميل التطبيق من متجر Google Play</p>
              </div>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400" />
          </a>
        </div>
      )}
    </div>
  );
};
