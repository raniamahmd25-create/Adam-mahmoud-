import React, { useState } from 'react';
import {
  Sparkles,
  Star,
  Download,
  ChevronRight,
  ChevronLeft,
  ShieldAlert,
  Gamepad2,
  ExternalLink,
  Flame,
} from 'lucide-react';
import { StoreItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';

interface FeaturedGamesProps {
  onSelectItem: (item: StoreItem) => void;
  onNavigateToAdmin?: () => void;
}

export const FeaturedGames: React.FC<FeaturedGamesProps> = ({
  onSelectItem,
  onNavigateToAdmin,
}) => {
  const { items, toggleFeaturedItem, recordDownload } = useStore();
  const { isAdmin } = useAuth();

  // Filter games that are marked as featured
  const featuredGames = items.filter((item) => item.type === 'game' && item.isFeatured);
  const [currentIndex, setCurrentIndex] = useState(0);

  // If no games are featured and user is not admin, we don't render anything
  if (featuredGames.length === 0 && !isAdmin) {
    return null;
  }

  // If no games are featured and user is admin, show a friendly configuration banner
  if (featuredGames.length === 0 && isAdmin) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-950/30 via-slate-900/60 to-slate-900/60 p-6 sm:p-8 text-right shadow-xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>ميزة خاصة بمدير الموقع (Featured Games)</span>
            </div>
            <h3 className="text-xl font-bold text-white">قسم «الألعاب المميزة» جاهز للعرض</h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              لم تقم بتحديد أي ألعاب مميزة بعد. يمكنك الآن كمسؤول اختيار أي لعبة وتفعيل خيار «تمييز كـ لعبة مميزة ⭐» لتظهر هنا في صدارة الصفحة الرئيسية للمستخدمين.
            </p>
          </div>

          {onNavigateToAdmin && (
            <button
              onClick={onNavigateToAdmin}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition-all shrink-0 cursor-pointer"
            >
              إدارة الألعاب من لوحة التحكم
            </button>
          )}
        </div>
      </div>
    );
  }

  const currentItem = featuredGames[currentIndex] || featuredGames[0];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredGames.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + featuredGames.length) % featuredGames.length);
  };

  return (
    <section className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/50 via-slate-900/90 to-[#0b0f19] dark:from-indigo-950/50 dark:via-slate-900/90 dark:to-[#0b0f19] shadow-2xl transition-all duration-300">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Banner Header */}
      <div className="relative z-10 flex items-center justify-between px-6 pt-6 pb-2 border-b border-indigo-500/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                ألعاب مميزة ومختارة (Featured Games)
              </h2>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                اختيار الإدارة ⭐
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              أفضل الألعاب المنتقاة بعناية لرواد منصة GameZone Store
            </p>
          </div>
        </div>

        {/* Carousel controls if more than 1 featured game */}
        {featuredGames.length > 1 && (
          <div className="flex items-center gap-2" dir="ltr">
            <button
              onClick={prevSlide}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white transition-colors border border-slate-700 cursor-pointer"
              title="السابق"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono font-bold text-slate-300 px-1">
              {currentIndex + 1} / {featuredGames.length}
            </span>
            <button
              onClick={nextSlide}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white transition-colors border border-slate-700 cursor-pointer"
              title="التالي"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Active Featured Game Spotlight */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 sm:p-8 items-center">
        {/* Cover Art (Dominant & High-Res) */}
        <div
          onClick={() => onSelectItem(currentItem)}
          className="lg:col-span-6 relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-indigo-500/30 shadow-2xl cursor-pointer group"
        >
          {currentItem.imageUrl ? (
            <img
              src={currentItem.imageUrl}
              alt={currentItem.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-indigo-400">
              <Gamepad2 className="w-16 h-16 mb-2" />
              <span className="text-xs font-bold">{currentItem.title}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          <div className="absolute bottom-4 right-4 flex items-center gap-2">
            <span className="px-3 py-1 rounded-xl bg-indigo-600/90 backdrop-blur-md text-xs font-bold text-white border border-indigo-400/30">
              {currentItem.category}
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-black/70 backdrop-blur-md text-[11px] font-mono text-slate-200 border border-white/10">
              الإصدار v{currentItem.version}
            </span>
          </div>
        </div>

        {/* Content & Details */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-4 text-right">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <span className="text-amber-400 font-bold flex items-center gap-1">
                <Flame className="w-3.5 h-3.5" />
                <span>لعبة مختارة ومميزة</span>
              </span>
              <span aria-hidden="true">·</span>
              <span>بواسطة: {currentItem.publisherName}</span>
            </div>

            <h3
              onClick={() => onSelectItem(currentItem)}
              className="text-2xl sm:text-3xl font-black text-white hover:text-indigo-300 transition-colors cursor-pointer"
            >
              {currentItem.title}
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-3">
              {currentItem.description}
            </p>

            {/* Quick Metrics */}
            <div className="flex items-center gap-4 text-xs font-medium text-slate-400 pt-1">
              <div className="flex items-center gap-1 text-amber-400">
                <Star className="w-4 h-4 fill-amber-400" />
                <span className="font-mono font-bold">{currentItem.ratingAverage > 0 ? currentItem.ratingAverage : 'جديد'}</span>
                <span className="text-[11px] text-slate-500">({currentItem.ratingCount} تقييم)</span>
              </div>
              <div className="flex items-center gap-1 text-indigo-300">
                <Download className="w-4 h-4 text-indigo-400" />
                <span className="font-mono font-bold">{currentItem.downloadsCount}</span>
                <span className="text-[11px] text-slate-500">تنزيل</span>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-3 pt-3">
            <button
              onClick={() => recordDownload(currentItem.id, currentItem.downloadUrl)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>تحميل مباشر</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </button>

            <button
              onClick={() => onSelectItem(currentItem)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs sm:text-sm border border-slate-700 transition-colors cursor-pointer"
            >
              <span>عرض تفاصيل اللعبة</span>
            </button>

            {/* Admin quick toggle */}
            {isAdmin && (
              <button
                onClick={async () => {
                  await toggleFeaturedItem(currentItem.id, false);
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-950/50 hover:bg-rose-900 border border-rose-800/40 text-rose-300 text-xs font-bold transition-colors cursor-pointer mr-auto"
                title="إلغاء تمييز هذه اللعبة"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                <span>إلغاء التمييز</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
