import React from 'react';
import { Gamepad2, PlusCircle, Sparkles } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  onPublishClick?: () => void;
  actionText?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'المتجر بانتظار إبداعاتكم!',
  description = 'لا توجد ألعاب أو تطبيقات منشورة حالياً في هذا القسم. كن أول من ينشر ويشارك رابط التحميل المباشر مع المجتمع.',
  onPublishClick,
  actionText = 'انشر أول لعبة أو تطبيق الآن',
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-14 text-center rounded-3xl bg-[#0b0e17] border border-dashed border-slate-800 my-8">
      <div className="relative mb-5">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-950 to-violet-950 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-xl shadow-indigo-500/10">
          <Gamepad2 className="w-10 h-10" />
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-400 flex items-center justify-center text-indigo-300">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
      </div>

      <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">{title}</h3>
      <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed mb-6">
        {description}
      </p>

      {onPublishClick && (
        <button
          onClick={onPublishClick}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:-translate-y-0.5 transition-all cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
};
