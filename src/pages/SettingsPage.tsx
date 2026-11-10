import React, { useState } from 'react';
import { Settings, User, Bell, Shield, Trash2, CheckCircle, ArrowRight, Database } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PageView } from '../types';

interface SettingsPageProps {
  onNavigate: (page: PageView) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onNavigate }) => {
  const { user, profile, isAdmin } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [cacheCleared, setCacheCleared] = useState(false);

  const handleClearDownloadCache = () => {
    // Clear session storage download cooldown tokens
    Object.keys(sessionStorage).forEach((k) => {
      if (k.startsWith('gz_dl_')) sessionStorage.removeItem(k);
    });
    setCacheCleared(true);
    setTimeout(() => setCacheCleared(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-8 text-right">
      <div className="flex items-center justify-between pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            <Settings className="w-7 h-7 text-indigo-400" />
            <span>إعدادات الحساب والمتجر</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">تفضيلات التصفح، الأمان، وإدارة الجلسات</p>
        </div>

        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-900 border border-slate-800 transition-colors"
        >
          <ArrowRight className="w-4 h-4 ml-1" />
          <span>الرئيسية</span>
        </button>
      </div>

      {cacheCleared && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>تم مسح الذاكرة المؤقتة لعمليات التنزيل المحلية بنجاح!</span>
        </div>
      )}

      <div className="space-y-6">
        {/* Account Info Box */}
        <div className="bg-[#0b0f19] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-400" />
            <span>معلومات الحساب</span>
          </h3>

          {user ? (
            <div className="space-y-2 text-xs text-slate-300">
              <p><span className="text-slate-500 font-bold ml-2">الاسم:</span> {profile?.displayName || user.displayName}</p>
              <p><span className="text-slate-500 font-bold ml-2">البريد:</span> {user.email}</p>
              <p><span className="text-slate-500 font-bold ml-2">نوع الحساب:</span> {isAdmin ? 'مدير النظام (Admin)' : 'مستخدم عادي'}</p>
              <div className="pt-2">
                <button
                  onClick={() => onNavigate('profile')}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
                >
                  الانتقال للملف الشخصي لتعديل البيانات
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400">أنت تتصفح كزائر حالياً. سجّل الدخول لإدارة حسابك.</p>
          )}
        </div>

        {/* Preferences */}
        <div className="bg-[#0b0f19] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-cyan-400" />
            <span>التنبيهات والتفضيلات</span>
          </h3>

          <div className="flex items-center justify-between py-2 border-b border-slate-800/80">
            <div>
              <p className="text-xs font-bold text-white">إشعارات التقييمات والتعليقات</p>
              <p className="text-[11px] text-slate-400">تلقي إشعار عند تفاعل المستخدمين مع ألعابك المنشورة</p>
            </div>
            <input
              type="checkbox"
              checked={notificationsEnabled}
              onChange={(e) => setNotificationsEnabled(e.target.checked)}
              className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-xs font-bold text-white">مسح ذاكرة التنزيل المؤقتة</p>
              <p className="text-[11px] text-slate-400">إعادة تعيين قيود الجلسة لاحتساب التنزيل لأغراض الاختبار</p>
            </div>
            <button
              onClick={handleClearDownloadCache}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>مسح الكاش</span>
            </button>
          </div>
        </div>

        {/* Legal & Security links */}
        <div className="bg-[#0b0f19] border border-slate-800 rounded-3xl p-6 sm:p-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-emerald-400" />
            <div>
              <p className="text-xs font-bold text-white">الأمان والخصوصية</p>
              <p className="text-[11px] text-slate-400">اطّلع على شروط الاستخدام وسياسة حماية البيانات</p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('privacy')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl"
          >
            عرض السياسة
          </button>
        </div>
      </div>
    </div>
  );
};
