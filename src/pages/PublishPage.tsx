import React, { useState, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Link as LinkIcon,
  Gamepad2,
  Smartphone,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Info,
  User,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { useToast } from '../context/ToastContext';
import { ContentType, StoreItem } from '../types';
import { transformToDirectDownloadUrl } from '../lib/downloadHelper';

interface PublishPageProps {
  onSuccess: (newItem: StoreItem) => void;
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

export const PublishPage: React.FC<PublishPageProps> = ({ onSuccess, onCancel }) => {
  const { user, profile } = useAuth();
  const { publishItem } = useStore();
  const { showSuccess } = useToast();

  const [title, setTitle] = useState('');
  const [type, setType] = useState<ContentType>('game');
  const [category, setCategory] = useState('أكشن');
  const [description, setDescription] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [version, setVersion] = useState('1.0.0');
  const [publisherNameInput, setPublisherNameInput] = useState(
    profile?.displayName || user?.displayName || ''
  );
  const [imagePreview, setImagePreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Switch categories when type changes
  const handleTypeChange = (newType: ContentType) => {
    setType(newType);
    setCategory(newType === 'game' ? GAME_CATEGORIES[0] : APP_CATEGORIES[0]);
  };

  // Image upload and client-side optimization to guaranteed data-url
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('يرجى اختيار ملف صورة صالح (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 5 ميغابايت.');
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Create canvas to resize to optimal dimension (max 1200x675)
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const scale = Math.min(1, MAX_WIDTH / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const compressed = canvas.toDataURL('image/jpeg', 0.82);
          setImagePreview(compressed);
        } else {
          setImagePreview(event.target?.result as string);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const detectedDirectUrl = downloadUrl ? transformToDirectDownloadUrl(downloadUrl) : '';
  const isGoogleDrive = downloadUrl.includes('drive.google.com');
  const isDropbox = downloadUrl.includes('dropbox.com');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('يرجى إدخال اسم اللعبة أو التطبيق.');
      return;
    }

    if (!imagePreview) {
      setError('يرجى اختيار صورة للغلاف أو الأيقونة من جهازك.');
      return;
    }

    if (!description.trim()) {
      setError('يرجى كتابة وصف للعبة أو التطبيق.');
      return;
    }

    // Validate download URL
    let sanitizedUrl = downloadUrl.trim();
    if (!sanitizedUrl.startsWith('http://') && !sanitizedUrl.startsWith('https://')) {
      sanitizedUrl = 'https://' + sanitizedUrl;
    }

    try {
      const parsed = new URL(sanitizedUrl);
      if (!parsed.hostname.includes('.')) {
        throw new Error('رابط التحميل غير صالح.');
      }
    } catch {
      setError('يرجى التأكد من صحة رابط التحميل المباشر (مثل: https://example.com/game.apk أو رابط Google Drive / MediaFire / GitHub).');
      return;
    }

    setLoading(true);

    try {
      const effectivePublisherName =
        publisherNameInput.trim() ||
        profile?.displayName ||
        user?.displayName ||
        'مطور زائر';

      const itemId = await publishItem({
        title,
        type,
        category,
        description,
        downloadUrl: sanitizedUrl,
        version: version.trim() || '1.0.0',
        imageUrl: imagePreview,
        publisherName: effectivePublisherName,
      });

      // Launch celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}

      // Trigger user engagement Toast
      showSuccess(
        type === 'game' ? 'تم نشر اللعبة بنجاح! 🚀' : 'تم نشر التطبيق بنجاح! 📱',
        `أصبحت «${title}» متاحة الآن للتحميل المباشر للجميع في المتجر.`,
        'game'
      );

      // Trigger callback with created item
      const newItem: StoreItem = {
        id: itemId,
        title,
        type,
        category,
        description,
        downloadUrl: sanitizedUrl,
        version: version.trim() || '1.0.0',
        imageUrl: imagePreview,
        publisherId: user?.uid || (localStorage.getItem('gz_guest_id') || 'guest'),
        publisherName: effectivePublisherName,
        publisherPhoto: profile?.photoURL || user?.photoURL || '',
        downloadsCount: 0,
        ratingAverage: 0,
        ratingCount: 0,
        commentsCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      onSuccess(newItem);
    } catch (err: any) {
      console.error('Publish error:', err);
      setError(err.message || 'حدث خطأ أثناء حفظ اللعبة في قاعدة البيانات.');
    } finally {
      setLoading(false);
    }
  };

  const categoriesList = type === 'game' ? GAME_CATEGORIES : APP_CATEGORIES;

  return (
    <div className="max-w-3xl mx-auto py-4 text-right">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-indigo-400" />
            <span>نشر لعبة أو تطبيق جديد</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            انشر ألعابك وتطبيقاتك مجاناً وبكل سهولة. يتم حفظ البيانات فورياً وتظهر للجميع في المتجر.
          </p>
        </div>

        <button
          onClick={onCancel}
          className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <ArrowRight className="w-4 h-4 ml-1" />
          <span>إلغاء</span>
        </button>
      </div>

      {/* Guest Publishing Notice Banner */}
      {!user && (
        <div className="mb-6 p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-200 text-xs flex items-center gap-2.5">
          <Zap className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>النشر متاح للجميع بدون الحاجة لتسجيل دخول!</strong> يمكنك النشر كزائر الآن، وستظهر لعبتك مباشرة في الصفحة الرئيسية للمتجر.
          </span>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs sm:text-sm flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Name & Type */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-200 mb-2">
              1. اسم اللعبة أو التطبيق <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: أساطير الصحراء، تطبيق إدارة المهام..."
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-200 mb-2">
              نوع المحتوى <span className="text-rose-400">*</span>
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleTypeChange('game')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                  type === 'game'
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                    : 'bg-slate-900 text-slate-400 border-slate-700/80 hover:text-white'
                }`}
              >
                <Gamepad2 className="w-4 h-4" />
                <span>لعبة</span>
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('app')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                  type === 'app'
                    ? 'bg-cyan-600 text-white border-cyan-500 shadow-md shadow-cyan-600/30'
                    : 'bg-slate-900 text-slate-400 border-slate-700/80 hover:text-white'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>تطبيق</span>
              </button>
            </div>
          </div>
        </div>

        {/* Publisher / Developer Name */}
        <div>
          <label className="block text-xs font-bold text-slate-200 mb-2">
            اسم الناشر / المطور أو الفريق
          </label>
          <div className="relative">
            <input
              type="text"
              value={publisherNameInput}
              onChange={(e) => setPublisherNameInput(e.target.value)}
              placeholder={user ? (profile?.displayName || user.displayName || 'اسمك أو اسم الاستوديو') : 'مثال: مطور ألعاب، فريق النجوم... (افتراضي: مطور زائر)'}
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-2.5 pr-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            <User className="absolute right-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            يظهر هذا الاسم كصاحب ومطور اللعبة أو التطبيق في صفحة التفاصيل.
          </p>
        </div>

        {/* 2. Image Upload */}
        <div>
          <label className="block text-xs font-bold text-slate-200 mb-2">
            2. اختيار صورة اللعبة أو التطبيق من الجهاز <span className="text-rose-400">*</span>
          </label>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
            className="hidden"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className="group relative flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-700/80 hover:border-indigo-500 rounded-2xl bg-slate-900/50 hover:bg-slate-900/80 transition-all cursor-pointer text-center"
          >
            {imagePreview ? (
              <div className="relative w-full aspect-video max-h-64 rounded-xl overflow-hidden border border-slate-700">
                <img
                  src={imagePreview}
                  alt="Preview"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold shadow-lg">
                    تغيير الصورة
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-2 py-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-slate-200">
                  انقر هنا لاختيار صورة من جهازك (PNG, JPG, WebP)
                </p>
                <p className="text-[11px] text-slate-400">
                  يفضل صورة عالية الجودة بنسبة عرض إلى ارتفاع 16:9 أو 4:3
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 3. Description */}
        <div>
          <label className="block text-xs font-bold text-slate-200 mb-2">
            3. وصف اللعبة أو التطبيق <span className="text-rose-400">*</span>
          </label>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="اكتب وصفاً جذاباً ومفصلاً يشرح فكرة اللعبة ومميزاتها وطريقة اللعب أو الاستخدام..."
            className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 leading-relaxed"
          />
        </div>

        {/* 4. Direct Download Link & 5. Version */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-200 mb-2">
              4. رابط التحميل المباشر <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={downloadUrl}
                onChange={(e) => setDownloadUrl(e.target.value)}
                placeholder="https://drive.google.com/... أو رابط مباشر للملف"
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-2.5 pl-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dir-ltr text-left"
              />
              <LinkIcon className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            </div>

            {/* Smart link detection helper */}
            <div className="mt-1.5 space-y-1">
              {isGoogleDrive && (
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>تم التعرف على رابط Google Drive — سيتم تحويله تلقائياً لرابط تنزيل مباشر للمتصفح.</span>
                </div>
              )}
              {isDropbox && (
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>تم التعرف على رابط Dropbox — سيتم تفعيل التنزيل المباشر تلقائياً.</span>
                </div>
              )}
              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>ينزل هذا الملف مباشرة في نافذة وعمليات تنزيل المتصفح للمستخدم عند الضغط على تحميل.</span>
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-200 mb-2">
              5. إصدار اللعبة (Version) <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="مثال: 1.0.0"
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dir-ltr text-center font-mono"
            />
          </div>
        </div>

        {/* 7. Category Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-200 mb-2">
            7. تحديد التصنيف <span className="text-rose-400">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {categoriesList.map((cat) => {
              const isSelected = category === cat;
              return (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`p-3 rounded-xl text-xs font-semibold border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600/30 border-indigo-500 text-white font-bold shadow-md shadow-indigo-600/20'
                      : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* 8. Publish Button */}
        <div className="pt-4 border-t border-slate-800">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-base shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="inline-block animate-spin">⏳</span>
                <span>جاري الحفظ والنشر في المتجر...</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                <span>نشر الآن في المتجر</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
