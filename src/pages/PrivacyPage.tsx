import React from 'react';
import { ShieldCheck, Lock, Eye, DownloadCloud, FileText, ArrowRight } from 'lucide-react';
import { PageView } from '../types';

interface PrivacyPageProps {
  onNavigate: (page: PageView) => void;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto py-6 space-y-8 text-right">
      <div className="flex items-center justify-between pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-emerald-400" />
            <span>سياسة الخصوصية والأمان</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            آخر تحديث: 2026 - التزامنا بحماية بياناتك وشفافية الروابط
          </p>
        </div>

        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-900 border border-slate-800 transition-colors"
        >
          <ArrowRight className="w-4 h-4 ml-1" />
          <span>الرئيسية</span>
        </button>
      </div>

      <div className="space-y-6 text-sm text-slate-300 leading-relaxed bg-[#0b0f19] border border-slate-800 rounded-3xl p-6 sm:p-8">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-indigo-400" />
            <span>1. جمع المعلومات وحسابات المستخدمين</span>
          </h2>
          <p>
            في GameZone Store، نحترم خصوصية جميع المستخدمين والناشرين. نقوم بجمع المعلومات الأساسية فقط اللازمة لإنشاء حساب وتوثيق الهوية (الاسم، البريد الإلكتروني، والصورة الشخصية إن وُجدت). لا نبيع ولا نشارك هذه البيانات مع أي جهات خارجية مطلقاً.
          </p>
        </section>

        <section className="space-y-2 pt-4 border-t border-slate-800/80">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <DownloadCloud className="w-5 h-5 text-cyan-400" />
            <span>2. روابط التحميل المباشرة والمسؤولية</span>
          </h2>
          <p>
            تتيح منصة GameZone Store للمطورين نشر روابط تحميل مباشرة لألعابهم وتطبيقاتهم (مثل ملفات APK أو روابط التخزين السحابي). يلتزم كل ناشر بعدم نشر برمجيات ضارة أو ملفات تنتهك حقوق الملكية الفكرية. يحتفظ فريق إدارة المتجر بالحق الكامل في إزالة أي رابط أو محتوى مخالف فوراً.
          </p>
        </section>

        <section className="space-y-2 pt-4 border-t border-slate-800/80">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Eye className="w-5 h-5 text-amber-400" />
            <span>3. إحصائيات التنزيل النزيهة ومنع الاحتيال</span>
          </h2>
          <p>
            نطبق نظاماً دقيقاً لمنع احتساب التنزيلات المتكررة أو التحديثات الوهمية من نفس المستخدم خلال فترات زمنية متقاربة، وذلك لضمان شفافية ودقة الأرقام المعروضة في المتجر.
          </p>
        </section>

        <section className="space-y-2 pt-4 border-t border-slate-800/80">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-violet-400" />
            <span>4. التقييمات والتعليقات</span>
          </h2>
          <p>
            يخضع نظام التعليقات والتقييمات للرقابة المجتمعية والإدارية. يمكن للمستخدمين الإبلاغ عن أي تعليق مسيء أو غير لائق، وتتخذ الإدارة الإجراءات المناسبة لحماية بيئة المتجر.
          </p>
        </section>
      </div>
    </div>
  );
};
