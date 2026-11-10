import React from 'react';
import { UploadCloud, Compass, Sparkles, DownloadCloud, ShieldCheck, Zap } from 'lucide-react';
import heroImg from '../assets/images/store_hero_banner_1794059539972.jpg';

interface HeroBannerProps {
  onPublishClick: () => void;
  onExploreClick: () => void;
  totalItems: number;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onPublishClick,
  onExploreClick,
  totalItems,
}) => {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-950 mb-10 shadow-2xl">
      {/* Background Graphic with Scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImg}
          alt="GameZone Store Showcase"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center opacity-40 mix-blend-screen scale-105 transition-transform duration-1000 hover:scale-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] via-[#07090e]/85 to-[#07090e]/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#07090e] via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12 sm:py-16 text-center lg:text-right flex flex-col lg:flex-row items-center justify-between gap-8">
        <div className="space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>متجر ألعاب وتطبيقات حر ومباشر</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            حمّل وشارك أحدث الألعاب والتطبيقات بروابط مباشرة
          </h1>

          <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed max-w-xl">
            منصة GameZone Store تتيح للمطورين والمبدعين نشر ألعابهم وتطبيقاتهم بسهولة، وللمستخدمين التنزيل المباشر، التقييم بالنجوم، والمراجعات التفاعلية.
          </p>

          {/* Value Props Row */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>تحميل فوري بدون إعلانات مزعجة</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>روابط مباشرة ومتحقق منها</span>
            </div>
            <div className="flex items-center gap-1.5">
              <DownloadCloud className="w-4 h-4 text-cyan-400" />
              <span>إحصائيات تنزيل دقيقة</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-4">
            <button
              onClick={onPublishClick}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>انشر لعبتك أو تطبيقك الآن</span>
            </button>
            <button
              onClick={onExploreClick}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 font-semibold text-sm border border-slate-700/80 hover:border-slate-600 transition-all cursor-pointer"
            >
              <Compass className="w-4 h-4 text-indigo-400" />
              <span>استكشف المنشورات ({totalItems})</span>
            </button>
          </div>
        </div>

        {/* Feature Visual Badge */}
        <div className="hidden lg:flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md text-center max-w-xs shrink-0">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600/20 to-violet-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-3">
            <Sparkles className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">منصة مفتوحة للجميع</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            المتجر يبدأ فارغاً بدون عناصر وهمية. كل لعبة أو تطبيق يظهر هنا هو مساهمة حقيقية من مطور في المجتمع!
          </p>
        </div>
      </div>
    </div>
  );
};
