import React, { useState, useEffect } from 'react';
import {
  Download,
  Share2,
  Star,
  MessageSquare,
  ArrowRight,
  User,
  Calendar,
  Check,
  AlertTriangle,
  Trash2,
  Edit,
  Send,
  Flag,
  ShieldAlert,
  Gamepad2,
  Smartphone,
  ExternalLink,
} from 'lucide-react';
import { StoreItem, Comment } from '../types';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { useToast } from '../context/ToastContext';
import { transformToDirectDownloadUrl } from '../lib/downloadHelper';

interface ItemDetailPageProps {
  item: StoreItem;
  onBack: () => void;
  onEditItem: (item: StoreItem) => void;
  openAuthModal: (mode: 'login' | 'register') => void;
}

export const ItemDetailPage: React.FC<ItemDetailPageProps> = ({
  item,
  onBack,
  onEditItem,
  openAuthModal,
}) => {
  const { user, profile, isAdmin } = useAuth();
  const {
    rateItem,
    getUserRating,
    getItemComments,
    addComment,
    updateComment,
    deleteComment,
    reportComment,
    reportItem,
    recordDownload,
    deleteItem,
    isItemOwner,
  } = useStore();
  const { showSuccess } = useToast();

  const [currentRating, setCurrentRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [ratingSuccess, setRatingSuccess] = useState(false);

  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentContent, setEditingCommentContent] = useState('');

  const [copiedLink, setCopiedLink] = useState(false);
  const [reportingCommentId, setReportingCommentId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [reportingItem, setReportingItem] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [downloadCountLocal, setDownloadCountLocal] = useState<number>(0);
  const [downloadState, setDownloadState] = useState<'idle' | 'starting' | 'started'>('idle');
  const [downloadUrlDirect, setDownloadUrlDirect] = useState<string>('');

  const isOwner = isItemOwner(item);
  const canManage = isOwner || isAdmin;
  const isGame = item.type === 'game';

  // Load user's rating
  useEffect(() => {
    if (user) {
      getUserRating(item.id).then((stars) => {
        setCurrentRating(stars);
      });
    }
  }, [user, item.id]);

  // Subscribe to comments
  useEffect(() => {
    const unsubscribe = getItemComments(item.id, (loadedComments) => {
      setComments(loadedComments);
    });
    return () => unsubscribe();
  }, [item.id]);

  // Handle Download Click - allows downloading as many times as the user wants
  const handleDownload = async () => {
    setDownloadState('starting');
    try {
      const res = await recordDownload(item.id, item.downloadUrl, item.title, item.version);
      setDownloadUrlDirect(res.directUrl);
      setDownloadState('started');
      setDownloadCountLocal((prev) => prev + 1);
      showSuccess(
        'بدأ التنزيل في متصفحك! 📥',
        'تم إرسال الملف إلى قائمة تنزيلات المتصفح. يمكنك التحميل أكثر من مرة في أي وقت.'
      );
      // Re-enable starting animation after 1s so the user can immediately click again
      setTimeout(() => {
        setDownloadState('started');
      }, 1000);
    } catch (err) {
      console.error(err);
      setDownloadState('idle');
    }
  };

  // Handle Share Click
  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.title,
          text: `حمّل لعبة أو تطبيق ${item.title} برابط مباشر من GameZone Store!`,
          url,
        });
        return;
      } catch (err) {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      showSuccess('تم نسخ الرابط! 📋', 'يمكنك الآن مشاركة الرابط المباشر مع أصدقائك.');
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {}
  };

  // Handle Rating
  const handleRate = async (stars: number) => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    setRatingLoading(true);
    try {
      await rateItem(item.id, stars);
      setCurrentRating(stars);
      setRatingSuccess(true);
      showSuccess(
        'تم حفظ تقييمك بنجاح! ⭐',
        `شكراً لمشاركتك رأيك (${stars} من 5 نجوم).`,
        'sparkle'
      );
      setTimeout(() => setRatingSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setRatingLoading(false);
    }
  };

  // Handle Add Comment
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal('login');
      return;
    }
    if (!newComment.trim()) return;

    setCommentLoading(true);
    try {
      await addComment(item.id, newComment);
      setNewComment('');
      showSuccess('تمت إضافة تعليقك بنجاح! 💬');
    } catch (err) {
      console.error(err);
    } finally {
      setCommentLoading(false);
    }
  };

  // Handle Update Comment
  const handleUpdateComment = async (commentId: string) => {
    if (!editingCommentContent.trim()) return;
    try {
      await updateComment(commentId, editingCommentContent);
      setEditingCommentId(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Delete Comment
  const handleDeleteComment = async (commentId: string) => {
    if (window.confirm('هل أنت متأكد من حذف تعليقك؟')) {
      try {
        await deleteComment(commentId, item.id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Handle Submit Report
  const handleSubmitReport = async () => {
    if (!reportReason.trim()) return;
    try {
      if (reportingCommentId) {
        await reportComment(reportingCommentId, reportReason);
        setReportingCommentId(null);
      } else if (reportingItem) {
        await reportItem(item.id, reportReason, item.title);
        setReportingItem(false);
      }
      setReportReason('');
      setReportSubmitted(true);
      setTimeout(() => setReportSubmitted(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Delete Item
  const handleDeleteItem = async () => {
    if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا المنشور نهائياً من المتجر؟')) {
      try {
        await deleteItem(item.id);
        onBack();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-4 space-y-10 text-right">
      {/* Top back navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-xl hover:bg-slate-900 border border-slate-800 transition-colors"
        >
          <ArrowRight className="w-4 h-4 ml-1" />
          <span>العودة للمتجر</span>
        </button>

        {canManage && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEditItem(item)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5 text-indigo-400" />
              <span>تعديل البيانات</span>
            </button>
            <button
              onClick={handleDeleteItem}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-300 bg-rose-950/40 border border-rose-800/40 hover:bg-rose-900/50 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>حذف</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Showcase Banner */}
      <div className="bg-[#0b0f19] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-8">
          
          {/* Big Image Section (16:9 / 4:3 high-res) */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-xl group">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-500">
                  {isGame ? <Gamepad2 className="w-16 h-16 text-indigo-400/60 mb-2" /> : <Smartphone className="w-16 h-16 text-violet-400/60 mb-2" />}
                  <span className="text-sm font-semibold">{item.title}</span>
                </div>
              )}

              <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/75 backdrop-blur-md text-xs font-bold text-white border border-white/10">
                {isGame ? <Gamepad2 className="w-3.5 h-3.5 text-indigo-400" /> : <Smartphone className="w-3.5 h-3.5 text-cyan-400" />}
                <span>{isGame ? 'لعبة' : 'تطبيق'}</span>
              </div>
            </div>
          </div>

          {/* Details & Actions Section */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              {/* Category & Version */}
              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                <span className="text-indigo-400 font-bold">{item.category}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-[11px] text-slate-300">
                  الإصدار {item.version}
                </span>
                <span aria-hidden="true">·</span>
                <span>{new Date(item.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                {item.title}
              </h1>

              {/* Publisher Card */}
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                {item.publisherPhoto ? (
                  <img
                    src={item.publisherPhoto}
                    alt={item.publisherName}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-xl object-cover ring-1 ring-indigo-500/30"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300">
                    <User className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <p className="text-xs text-slate-400">الناشر / المطور</p>
                  <p className="text-sm font-bold text-slate-200">{item.publisherName}</p>
                </div>
              </div>
            </div>

            {/* Metrics Ribbon */}
            <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
              <div>
                <p className="text-[11px] text-slate-400 mb-0.5">التنزيلات</p>
                <div className="flex items-center justify-center gap-1 text-white font-mono font-bold text-base">
                  <Download className="w-4 h-4 text-indigo-400" />
                  <span>{item.downloadsCount}</span>
                </div>
              </div>

              <div className="border-x border-slate-800">
                <p className="text-[11px] text-slate-400 mb-0.5">التقييم</p>
                <div className="flex items-center justify-center gap-1 text-amber-400 font-mono font-bold text-base">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>{item.ratingAverage > 0 ? item.ratingAverage : 'جديد'}</span>
                </div>
              </div>

              <div>
                <p className="text-[11px] text-slate-400 mb-0.5">المراجعات</p>
                <div className="flex items-center justify-center gap-1 text-slate-300 font-mono font-bold text-base">
                  <MessageSquare className="w-4 h-4 text-violet-400" />
                  <span>{item.commentsCount}</span>
                </div>
              </div>
            </div>

            {/* Actions: Download & Share */}
            <div className="space-y-3">
              <button
                onClick={handleDownload}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-black text-base shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:-translate-y-0.5 transition-all cursor-pointer active:scale-98"
                title="اضغط لبدء تنزيل اللعبة في المتصفح، ويمكنك الضغط مجدداً للتحميل أكثر من مرة"
              >
                <Download className={`w-5 h-5 ${downloadState === 'starting' ? 'animate-bounce' : ''}`} />
                <span>
                  {downloadState === 'starting'
                    ? 'جاري إرسال التنزيل لمتصفحك...'
                    : downloadCountLocal > 0
                    ? `تحميل ${isGame ? 'اللعبة' : 'التطبيق'} مرة أخرى ↻ (تم التحميل ${downloadCountLocal} مرة)`
                    : `تحميل ${isGame ? 'اللعبة' : 'التطبيق'} الآن في المتصفح`}
                </span>
                <ExternalLink className="w-4 h-4 text-indigo-200 opacity-80" />
              </button>

              {/* Browser Downloads Feedback Banner */}
              {downloadState === 'started' && (
                <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs space-y-2 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between font-bold text-emerald-300">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>بدأ التنزيل بنجاح في متصفحك! 📥</span>
                    </div>
                    {downloadCountLocal > 1 && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">
                        {downloadCountLocal} تنزيلات
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-emerald-300/80 leading-relaxed">
                    تم إرسال الملف مباشرة إلى نافذة وقائمة تنزيلات المتصفح (Downloads في أعلى أو أسفل المتصفح). يمكنك الضغط للتحميل عدة مرات كما تشاء.
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleDownload}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 px-3.5 py-1.5 rounded-xl shadow-md transition-all cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>تحميل مرة أخرى فوراً ↻</span>
                    </button>

                    <a
                      href={downloadUrlDirect || transformToDirectDownloadUrl(item.downloadUrl)}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-300 hover:text-white bg-emerald-900/60 hover:bg-emerald-800/80 border border-emerald-700/50 px-3 py-1.5 rounded-xl transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>رابط التحميل المباشر</span>
                    </a>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  onClick={handleShare}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">تم نسخ الرابط!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4 text-indigo-400" />
                      <span>مشاركة الرابط مع الأصدقاء</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    if (!user) openAuthModal('login');
                    else setReportingItem(true);
                  }}
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-amber-400 border border-slate-800 transition-colors"
                  title="إبلاغ عن محتوى مخالف"
                >
                  <Flag className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description Section */}
      <div className="bg-[#0b0f19] border border-slate-800 rounded-3xl p-6 sm:p-8">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span>عن {isGame ? 'اللعبة' : 'التطبيق'}</span>
        </h3>
        <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
          {item.description}
        </div>
      </div>

      {/* 4. Rating System Section */}
      <div className="bg-[#0b0f19] border border-slate-800 rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              <span>تقييم المستخدمين</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              شارك رأيك النزيه، يسمح بتقييم واحد فقط لكل مستخدم ويمكنك تعديله متى شئت.
            </p>
          </div>

          <div className="flex items-center gap-6">
            {/* Interactive Stars */}
            <div className="flex items-center gap-1.5" dir="ltr">
              {[1, 2, 3, 4, 5].map((star) => {
                const filled = (hoverRating ?? currentRating ?? 0) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    disabled={ratingLoading}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    onClick={() => handleRate(star)}
                    className="p-1 rounded-lg hover:scale-125 transition-transform cursor-pointer"
                    title={`تقييم ${star} من 5`}
                  >
                    <Star
                      className={`w-7 h-7 ${
                        filled ? 'text-amber-400 fill-amber-400' : 'text-slate-700 hover:text-amber-400/50'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Score pill */}
            <div className="text-center shrink-0 pr-4 border-r border-slate-800">
              <span className="text-2xl font-black text-white font-mono">
                {item.ratingAverage > 0 ? item.ratingAverage : '—'}
              </span>
              <span className="text-xs text-slate-500 block">من 5 ({item.ratingCount} تقييم)</span>
            </div>
          </div>
        </div>

        {ratingSuccess && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>تم حفظ تقييمك بنجاح! شكراً لمشاركتك.</span>
          </div>
        )}
      </div>

      {/* 5. Comments Section */}
      <div className="bg-[#0b0f19] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-400" />
            <span>التعليقات والمراجعات ({comments.length})</span>
          </h3>
        </div>

        {/* Comment input form */}
        <form onSubmit={handleAddComment} className="flex gap-3 items-start">
          <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 shrink-0 mt-1">
            {profile?.photoURL ? (
              <img src={profile.photoURL} alt="User" referrerPolicy="no-referrer" className="w-full h-full rounded-xl object-cover" />
            ) : (
              <User className="w-5 h-5" />
            )}
          </div>

          <div className="flex-1 relative">
            <textarea
              rows={2}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={user ? 'اكتب تعليقك أو مراجعتك هنا...' : 'سجل الدخول للمشاركة في التعليقات...'}
              disabled={!user || commentLoading}
              className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-2xl p-3 pl-12 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={!user || !newComment.trim() || commentLoading}
              className="absolute left-2.5 bottom-3 p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Comments List */}
        <div className="space-y-4 pt-4 border-t border-slate-800/80">
          {comments.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4">
              لا توجد تعليقات بعد. كن أول من يكتب مراجعة لهذه اللعبة!
            </p>
          ) : (
            comments.map((comment) => {
              const isCommentAuthor = user?.uid === comment.userId;
              const canModifyComment = isCommentAuthor || isAdmin;
              const isEditing = editingCommentId === comment.id;

              return (
                <div
                  key={comment.id}
                  className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2 text-right"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      {comment.userPhotoURL ? (
                        <img
                          src={comment.userPhotoURL}
                          alt={comment.userDisplayName}
                          referrerPolicy="no-referrer"
                          className="w-7 h-7 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300">
                          {comment.userDisplayName[0] || 'U'}
                        </div>
                      )}
                      <div>
                        <span className="text-xs font-bold text-slate-200">
                          {comment.userDisplayName}
                        </span>
                        <span className="text-[10px] text-slate-500 mr-2">
                          {new Date(comment.createdAt).toLocaleDateString('ar-EG', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isCommentAuthor && !isEditing && (
                        <button
                          onClick={() => {
                            setEditingCommentId(comment.id);
                            setEditingCommentContent(comment.content);
                          }}
                          className="p-1 text-slate-400 hover:text-slate-200 rounded"
                          title="تعديل تعليقي"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {canModifyComment && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="p-1 text-slate-400 hover:text-rose-400 rounded"
                          title="حذف التعليق"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {!isCommentAuthor && (
                        <button
                          onClick={() => {
                            if (!user) openAuthModal('login');
                            else setReportingCommentId(comment.id);
                          }}
                          className="p-1 text-slate-500 hover:text-amber-400 rounded"
                          title="إبلاغ عن تعليق مسيء"
                        >
                          <Flag className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="space-y-2 mt-2">
                      <textarea
                        rows={2}
                        value={editingCommentContent}
                        onChange={(e) => setEditingCommentContent(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateComment(comment.id)}
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold"
                        >
                          حفظ التعديل
                        </button>
                        <button
                          onClick={() => setEditingCommentId(null)}
                          className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs"
                        >
                          إلغاء
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pr-9">
                      {comment.content}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Reporting Modal */}
      {(reportingCommentId || reportingItem) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0f172a] border border-slate-800 rounded-2xl p-6 space-y-4 text-right">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Flag className="w-4 h-4 text-amber-400" />
              <span>إبلاغ عن محتوى أو تعليق مخالف</span>
            </h4>
            <p className="text-xs text-slate-400">
              ساعدنا في الحفاظ على مجتمع آمن ونظيف. يرجى توضيح سبب الإبلاغ:
            </p>
            <textarea
              rows={3}
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="مثال: رابط معطل، محتوى مسيء، برمجية خبيثة..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <div className="flex items-center gap-2 justify-end">
              <button
                onClick={() => {
                  setReportingCommentId(null);
                  setReportingItem(false);
                }}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                إلغاء
              </button>
              <button
                onClick={handleSubmitReport}
                disabled={!reportReason.trim()}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs disabled:opacity-50"
              >
                إرسال البلاغ
              </button>
            </div>
          </div>
        </div>
      )}

      {reportSubmitted && (
        <div className="fixed bottom-6 left-6 z-50 p-4 rounded-xl bg-emerald-500 text-white font-bold text-xs shadow-2xl flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>تم إرسال بلاغك للإدارة بنجاح، شكراً لحرصك!</span>
        </div>
      )}
    </div>
  );
};
