import React, { useState, useMemo, useRef } from 'react';
import {
  User,
  Edit,
  Download,
  Star,
  MessageSquare,
  Calendar,
  Gamepad2,
  Smartphone,
  Trash2,
  ExternalLink,
  PlusCircle,
  Save,
  X,
  Camera,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { StoreItem, PageView } from '../types';
import { ItemCard } from '../components/ItemCard';

interface ProfilePageProps {
  onSelectItem: (item: StoreItem) => void;
  onEditItem: (item: StoreItem) => void;
  onNavigate: (page: PageView) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  onSelectItem,
  onEditItem,
  onNavigate,
}) => {
  const { user, profile, updateUserProfile } = useAuth();
  const { items, deleteItem } = useStore();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.displayName || user?.displayName || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [photoURL, setPhotoURL] = useState(profile?.photoURL || '');
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter items published by this user
  const userItems = useMemo(() => {
    if (!user) return [];
    return items.filter((item) => item.publisherId === user.uid);
  }, [items, user]);

  // Aggregate user statistics
  const stats = useMemo(() => {
    const totalDownloads = userItems.reduce((acc, curr) => acc + curr.downloadsCount, 0);
    const totalComments = userItems.reduce((acc, curr) => acc + curr.commentsCount, 0);
    const ratedItems = userItems.filter((i) => i.ratingCount > 0);
    const avgRating =
      ratedItems.length > 0
        ? (ratedItems.reduce((acc, curr) => acc + curr.ratingAverage, 0) / ratedItems.length).toFixed(1)
        : '—';

    return {
      publishedCount: userItems.length,
      totalDownloads,
      totalComments,
      avgRating,
    };
  }, [userItems]);

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX = 400;
        const scale = Math.min(1, MAX / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          setPhotoURL(canvas.toDataURL('image/jpeg', 0.85));
        } else {
          setPhotoURL(event.target?.result as string);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;
    setSaveLoading(true);
    try {
      await updateUserProfile(displayName.trim(), bio.trim(), photoURL);
      setIsEditingProfile(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('هل أنت متأكد من حذف هذه اللعبة أو التطبيق من المتجر؟')) {
      await deleteItem(itemId);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-20 space-y-4">
        <User className="w-16 h-16 text-slate-600 mx-auto" />
        <h2 className="text-xl font-bold text-white">يرجى تسجيل الدخول للوصول إلى حسابك</h2>
        <button
          onClick={() => onNavigate('home')}
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold"
        >
          العودة للرئيسية
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-4 space-y-8 text-right">
      {/* Profile Card Header */}
      <div className="bg-[#0b0f19] border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
          <div className="relative group shrink-0">
            {profile?.photoURL || photoURL ? (
              <img
                src={photoURL || profile?.photoURL}
                alt={profile?.displayName || user.displayName || 'Avatar'}
                referrerPolicy="no-referrer"
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover ring-2 ring-indigo-500/50 shadow-xl"
              />
            ) : (
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-tr from-indigo-700 to-violet-600 flex items-center justify-center text-white text-3xl font-black shadow-xl">
                {(profile?.displayName || user.displayName || 'U')[0].toUpperCase()}
              </div>
            )}
          </div>

          {/* User Details */}
          <div className="flex-1 space-y-3 text-center sm:text-right">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white">
                  {profile?.displayName || user.displayName || 'مطور GameZone'}
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
              </div>

              <button
                onClick={() => {
                  setDisplayName(profile?.displayName || user.displayName || '');
                  setBio(profile?.bio || '');
                  setPhotoURL(profile?.photoURL || '');
                  setIsEditingProfile(true);
                }}
                className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors cursor-pointer self-center sm:self-auto"
              >
                <Edit className="w-3.5 h-3.5 text-indigo-400" />
                <span>تعديل الملف الشخصي</span>
              </button>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
              {profile?.bio || 'عاشق للألعاب ومستكشف للتطبيقات الحديثة ومشارك للمحتوى في GameZone Store.'}
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-1 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>عضو منذ: {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short' }) : 'حديثاً'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Aggregate Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-slate-800/80">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-center">
            <p className="text-xs text-slate-400 mb-1">المنشورات</p>
            <p className="text-xl font-black text-white font-mono">{stats.publishedCount}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-center">
            <p className="text-xs text-slate-400 mb-1">إجمالي التنزيلات</p>
            <p className="text-xl font-black text-indigo-400 font-mono flex items-center justify-center gap-1">
              <Download className="w-4 h-4" />
              <span>{stats.totalDownloads}</span>
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-center">
            <p className="text-xs text-slate-400 mb-1">متوسط التقييم</p>
            <p className="text-xl font-black text-amber-400 font-mono flex items-center justify-center gap-1">
              <Star className="w-4 h-4 fill-amber-400" />
              <span>{stats.avgRating}</span>
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-center">
            <p className="text-xs text-slate-400 mb-1">المراجعات المستلمة</p>
            <p className="text-xl font-black text-slate-300 font-mono flex items-center justify-center gap-1">
              <MessageSquare className="w-4 h-4 text-violet-400" />
              <span>{stats.totalComments}</span>
            </p>
          </div>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>تم تحديث بيانات ملفك الشخصي بنجاح!</span>
        </div>
      )}

      {/* User's Published Items List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-indigo-400" />
              <span>الألعاب والتطبيقات المنشورة بواسطتك ({userItems.length})</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              يمكنك إدارة وتعديل وحذف منشوراتك في أي وقت
            </p>
          </div>

          <button
            onClick={() => onNavigate('publish')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-indigo-600/30"
          >
            <PlusCircle className="w-4 h-4" />
            <span>نشر جديد</span>
          </button>
        </div>

        {userItems.length === 0 ? (
          <div className="p-10 rounded-3xl bg-[#0b0e17] border border-dashed border-slate-800 text-center space-y-3">
            <Gamepad2 className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">لم تقم بنشر أي لعبة أو تطبيق بعد</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              انشر أول ألعابك وشارك رابط التحميل المباشر مع ملايين اللاعبين في الوطن العربي.
            </p>
            <button
              onClick={() => onNavigate('publish')}
              className="mt-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              انشر أول لعبة الآن
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {userItems.map((item) => (
              <div key={item.id} className="relative group">
                <ItemCard item={item} onClick={() => onSelectItem(item)} />
                {/* Overlay actions on card */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditItem(item);
                    }}
                    className="p-1.5 rounded-lg bg-black/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 transition-colors shadow-lg cursor-pointer"
                    title="تعديل المنشور"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(item.id, e)}
                    className="p-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 hover:text-white border border-rose-500/20 transition-colors shadow-lg cursor-pointer"
                    title="حذف المنشور"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0f172a] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 text-right">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">تعديل الملف الشخصي</h3>
              <button
                onClick={() => setIsEditingProfile(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Photo Selector */}
              <div className="flex items-center gap-4">
                <div className="relative group">
                  {photoURL ? (
                    <img
                      src={photoURL}
                      alt="Avatar"
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-2xl object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-xl font-bold">
                      {displayName[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 p-1 rounded-lg bg-indigo-600 text-white shadow-md hover:bg-indigo-500 cursor-pointer"
                    title="تغيير الصورة"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarFile}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                <div className="text-xs text-slate-400">
                  <p className="font-semibold text-slate-200">الصورة الشخصية</p>
                  <p className="text-[11px]">انقر على أيقونة الكاميرا لاختيار صورة من جهازك.</p>
                </div>
              </div>

              {/* Display Name */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">اسم العرض</label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">النبذة التعريفية (Bio)</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="اكتب نبذة مختصرة عنك وعن اهتماماتك في الألعاب..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 cursor-pointer disabled:opacity-50"
                >
                  {saveLoading ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
