import React from 'react';
import {
  Download,
  X,
  ExternalLink,
  CheckCircle2,
  Trash2,
  Gamepad2,
  Smartphone,
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { StoreItem } from '../types';

export interface LocalDownloadRecord {
  id: string;
  itemId: string;
  title: string;
  imageUrl: string;
  downloadUrl: string;
  version: string;
  type: 'game' | 'app';
  category: string;
  downloadedAt: string;
  status: 'completed' | 'in_progress';
}

interface DownloadsModalProps {
  isOpen: boolean;
  onClose: () => void;
  downloads: LocalDownloadRecord[];
  onClearDownloads: () => void;
  onReDownload: (item: LocalDownloadRecord) => void;
  onViewItem: (itemId: string) => void;
}

export const DownloadsModal: React.FC<DownloadsModalProps> = ({
  isOpen,
  onClose,
  downloads,
  onClearDownloads,
  onReDownload,
  onViewItem,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-right p-6 sm:p-8 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                تنزيلات الموقع (عمليات التحميل)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                قائمة الألعاب والتطبيقات التي قمت بتنزيلها من GameZone Store
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {downloads.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-900 text-slate-400 mx-auto flex items-center justify-center">
                <Download className="w-8 h-8" />
              </div>
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                لا توجد عمليات تنزيل حتى الآن
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                عندما تضغط على زر «تحميل» على أي لعبة أو تطبيق، سيبدأ التنزيل الفوري على جهازك وسيتم حفظها هنا في سجل تنزيلاتك للوصول السريع إليها دائماً.
              </p>
            </div>
          ) : (
            downloads.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-500/40 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 shrink-0">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : item.type === 'game' ? (
                      <div className="w-full h-full flex items-center justify-center text-indigo-400">
                        <Gamepad2 className="w-6 h-6" />
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-cyan-400">
                        <Smartphone className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4
                        onClick={() => {
                          onViewItem(item.itemId);
                          onClose();
                        }}
                        className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                      >
                        {item.title}
                      </h4>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
                        v{item.version}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>تم التنزيل</span>
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(item.downloadedAt).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => onReDownload(item)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
                    title="إعادة تنزيل الملف مجدداً"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">تحميل مجدداً</span>
                  </button>

                  <button
                    onClick={() => {
                      onViewItem(item.itemId);
                      onClose();
                    }}
                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                    title="فتح صفحة اللعبة"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info & clear */}
        {downloads.length > 0 && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-mono">
              إجمالي الملفات المنزلة: {downloads.length}
            </span>

            <button
              onClick={onClearDownloads}
              className="flex items-center gap-1 text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 font-bold transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>مسح السجل</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
