import React from 'react';
import { Download, Star, MessageSquare, Gamepad2, Smartphone, Calendar, User } from 'lucide-react';
import { StoreItem } from '../types';

interface ItemCardProps {
  item: StoreItem;
  onClick: () => void;
  onDownloadClick?: (e: React.MouseEvent) => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item, onClick, onDownloadClick }) => {
  const isGame = item.type === 'game';

  return (
    <div
      onClick={onClick}
      className="group relative flex flex-col bg-white dark:bg-[#0e1320] border border-slate-200 dark:border-slate-800/80 hover:border-indigo-500/50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 cursor-pointer"
    >
      {/* Thumbnail Aspect 16:9 / 4:3 */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 dark:bg-gradient-to-tr dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 text-slate-400 dark:text-slate-500">
            {isGame ? <Gamepad2 className="w-12 h-12 text-indigo-500 dark:text-indigo-400/60 mb-2" /> : <Smartphone className="w-12 h-12 text-violet-500 dark:text-violet-400/60 mb-2" />}
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{item.title}</span>
          </div>
        )}

        {/* Content Type overlay tag */}
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md text-[11px] font-bold text-white border border-white/10">
          {isGame ? (
            <>
              <Gamepad2 className="w-3 h-3 text-indigo-400" />
              <span>لعبة</span>
            </>
          ) : (
            <>
              <Smartphone className="w-3 h-3 text-cyan-400" />
              <span>تطبيق</span>
            </>
          )}
        </div>

        {/* Featured badge */}
        {item.isFeatured && (
          <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/90 text-slate-950 text-[10px] font-black shadow-md">
            <Star className="w-3 h-3 fill-slate-950" />
            <span>مميزة</span>
          </div>
        )}

        {/* Version Tag */}
        <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-mono text-slate-300 border border-white/10">
          v{item.version}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3 text-right">
        <div>
          {/* Metadata clean line (Zero-Pill discipline) */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1.5 font-medium">
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{item.category}</span>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
            <span>{new Date(item.createdAt).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' })}</span>
          </div>

          <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors line-clamp-1">
            {item.title}
          </h3>

          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Publisher info & stats strip */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
          {/* Publisher */}
          <div className="flex items-center gap-1.5 min-w-0">
            {item.publisherPhoto ? (
              <img
                src={item.publisherPhoto}
                alt={item.publisherName}
                referrerPolicy="no-referrer"
                className="w-5 h-5 rounded-full object-cover shrink-0"
              />
            ) : (
              <User className="w-4 h-4 text-slate-400 shrink-0" />
            )}
            <span className="truncate text-[11px] text-slate-700 dark:text-slate-300 font-medium">
              {item.publisherName}
            </span>
          </div>

          {/* Metrics */}
          <div className="flex items-center gap-3 shrink-0 text-[11px] font-medium">
            {/* Rating */}
            <div className="flex items-center gap-1 text-amber-500 dark:text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-500 dark:fill-amber-400" />
              <span className="font-mono tabular-nums">{item.ratingAverage > 0 ? item.ratingAverage : 'جديد'}</span>
            </div>

            {/* Downloads */}
            <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300" title="عدد التنزيلات">
              <Download className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
              <span className="font-mono tabular-nums">{item.downloadsCount}</span>
            </div>

            {/* Comments */}
            {item.commentsCount > 0 && (
              <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400" title="عدد التعليقات">
                <MessageSquare className="w-3 h-3" />
                <span className="font-mono tabular-nums">{item.commentsCount}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
