import React from 'react';
import { Gamepad2, Heart, Shield, Mail } from 'lucide-react';
import { PageView } from '../types';

interface FooterProps {
  onNavigate: (page: PageView) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full bg-[#05070b] border-t border-slate-900 mt-20 py-12 text-right">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-black tracking-tight text-white">GameZone Store</span>
              <p className="text-xs text-slate-500">منصة نشر ومشاركة وتحميل الألعاب والتطبيقات بروابط مباشرة</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400">
            <button
              onClick={() => onNavigate('home')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              الرئيسية
            </button>
            <button
              onClick={() => onNavigate('games')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              الألعاب
            </button>
            <button
              onClick={() => onNavigate('apps')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              التطبيقات
            </button>
            <button
              onClick={() => onNavigate('publish')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              نشر لعبة
            </button>
            <button
              onClick={() => onNavigate('privacy')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              سياسة الخصوصية
            </button>
            <button
              onClick={() => onNavigate('contact')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              اتصل بنا
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} GameZone Store. جميع الحقوق محفوظة للمطورين والمبدعين.</p>
          <p className="flex items-center gap-1.5">
            <span>صُنع بشغف لعشاق الألعاب والبرمجة</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
