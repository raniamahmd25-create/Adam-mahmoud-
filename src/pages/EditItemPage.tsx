import React, { useState, useRef } from 'react';
import { ArrowRight, Save, Image as ImageIcon, Link as LinkIcon, Gamepad2, Smartphone, AlertCircle, Trash2 } from 'lucide-react';
import { StoreItem, ContentType } from '../types';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';

interface EditItemPageProps {
  item: StoreItem;
  onSuccess: () => void;
  onCancel: () => void;
}

const GAME_CATEGORIES = [
  'أكشن',
  'مغامرات',
  'سباقات',
  'رياضة',
  'استراتيجية',
  'ألغاز',
  'محاكاة',
  'ألعاب أخرى',
];

const APP_CATEGORIES = [
  'أدوات وإنتاجية',
  'تواصل واجتماعي',
  'وسائط وفيديو',
  'تعليم',
  'تطبيقات أخرى',
];

export const EditItemPage: React.FC<EditItemPageProps> = ({ item, onSuccess, onCancel }) => {
  const { updateItem, deleteItem } = useStore();
  const { user, isAdmin } = useAuth();

  const [title, setTitle] = useState(item.title);
  const [type, setType] = useState<ContentType>(item.type);
  const [category, setCategory] = useState(item.category);
  const [description, setDescription] = useState(item.description);
  const [downloadUrl, setDownloadUrl] = useState(item.downloadUrl);
  const [version, setVersion] = useState(item.version);
  const [imageUrl, setImageUrl] = useState(item.imageUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX = 1200;
        const scale = Math.min(1, MAX / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          setImageUrl(canvas.toDataURL('image/jpeg', 0.82));
        } else {
          setImageUrl(event.target?.result as string);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !description.trim() || !downloadUrl.trim()) {
      setError('يرجى ملء جميع الحقول الإلزامية.');
      return;
    }

    setLoading(true);
    try {
      await updateItem(item.id, {
        title: title.trim(),
        type,
        category,
        description: description.trim(),
        downloadUrl: downloadUrl.trim(),
        version: version.trim() || '1.0.0',
        imageUrl,
      });
      onSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'حدث خطأ أثناء حفظ التعديلات.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('هل أنت متأكد تماماً من رغبتك في حذف هذا المحتوى؟')) {
      try {
        await deleteItem(item.id);
        onSuccess();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const categoriesList = type === 'game' ? GAME_CATEGORIES : APP_CATEGORIES;

  return (
    <div className="max-w-3xl mx-auto py-4 text-right">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white">تعديل بيانات: {item.title}</h1>
          <p className="text-xs text-slate-400 mt-1">تحديث الروابط، الصور، رقم الإصدار، والتصنيف</p>
        </div>

        <button
          onClick={onCancel}
          className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <ArrowRight className="w-4 h-4 ml-1" />
          <span>إلغاء</span>
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-200 mb-2">اسم اللعبة أو التطبيق</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-200 mb-2">نوع المحتوى</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setType('game');
                  setCategory(GAME_CATEGORIES[0]);
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-colors ${
                  type === 'game' ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-900 text-slate-400 border-slate-700'
                }`}
              >
                لعبة
              </button>
              <button
                type="button"
                onClick={() => {
                  setType('app');
                  setCategory(APP_CATEGORIES[0]);
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-colors ${
                  type === 'app' ? 'bg-cyan-600 text-white border-cyan-500' : 'bg-slate-900 text-slate-400 border-slate-700'
                }`}
              >
                تطبيق
              </button>
            </div>
          </div>
        </div>

        {/* Image Preview & Change */}
        <div>
          <label className="block text-xs font-bold text-slate-200 mb-2">الصورة أو الغلاف</label>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
            className="hidden"
          />
          <div
            onClick={() => fileInputRef.current?.click()}
            className="relative aspect-video max-h-64 rounded-2xl overflow-hidden border border-slate-700 cursor-pointer group"
          >
            <img src={imageUrl} alt="Cover" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold">
                تغيير الصورة من الجهاز
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-slate-200 mb-2">الوصف</label>
          <textarea
            rows={4}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
          />
        </div>

        {/* Download URL & Version */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-200 mb-2">رابط التحميل المباشر</label>
            <input
              type="text"
              required
              value={downloadUrl}
              onChange={(e) => setDownloadUrl(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 dir-ltr text-left"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-200 mb-2">رقم الإصدار</label>
            <input
              type="text"
              required
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 dir-ltr text-center font-mono"
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-bold text-slate-200 mb-2">التصنيف</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {categoriesList.map((cat) => {
              const isSelected = category === cat;
              return (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`p-3 rounded-xl text-xs font-semibold border transition-all ${
                    isSelected
                      ? 'bg-indigo-600/30 border-indigo-500 text-white font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-4 py-3 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-300 hover:bg-rose-900/50 text-xs font-bold transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4 text-rose-400" />
            <span>حذف المنشور</span>
          </button>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/30 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'جاري الحفظ...' : 'حفظ التعديلات'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
