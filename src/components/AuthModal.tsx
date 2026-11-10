import React, { useState } from 'react';
import { X, Mail, Lock, User, AlertCircle, CheckCircle2, Gamepad2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const { loginWithGoogle, loginWithEmail, registerWithEmail, resetPassword } = useAuth();
  const { showSuccess } = useToast();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await loginWithEmail(email, password);
        onClose();
        showSuccess(
          'مرحباً بك مجدداً! 🎮',
          'تم تسجيل الدخول بنجاح، نتمنى لك تجربة ممتعة في المتجر.',
          'login'
        );
      } else if (mode === 'register') {
        if (!name.trim()) throw new Error('يرجى كتابة اسم المستخدم.');
        if (password.length < 6) throw new Error('كلمة المرور يجب أن لا تقل عن 6 أحرف.');
        await registerWithEmail(email, password, name);
        onClose();
        showSuccess(
          'أهلاً بك في GameZone! 🎉',
          `تم إنشاء حسابك بنجاح باسم «${name}»، يمكنك الآن النشر والتحميل والتقييم.`,
          'sparkle'
        );
      } else if (mode === 'forgot') {
        if (!email.trim()) throw new Error('يرجى إدخال البريد الإلكتروني.');
        await resetPassword(email);
        setSuccessMsg('تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني.');
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('البريد الإلكتروني أو كلمة المرور غير صحيحة.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('البريد الإلكتروني مسجل بالفعل، يمكنك تسجيل الدخول.');
      } else if (err.code === 'auth/weak-password') {
        setError('كلمة المرور ضعيفة جداً، يرجى اختيار كلمة مرور أقوى.');
      } else if (err.code === 'auth/invalid-email') {
        setError('صيغة البريد الإلكتروني غير صحيحة.');
      } else {
        setError(err.message || 'حدث خطأ أثناء المصادقة.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle();
      onClose();
      showSuccess(
        'مرحباً بك في GameZone! 🎮',
        'تم تسجيل الدخول بحساب Google بنجاح.',
        'login'
      );
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('تعذر تسجيل الدخول بحساب Google.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0f172a] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-right p-6 sm:p-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute left-4 top-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white mb-3 shadow-lg shadow-indigo-500/25">
            <Gamepad2 className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">
            {mode === 'login' && 'تسجيل الدخول إلى GameZone'}
            {mode === 'register' && 'إنشاء حساب جديد في GameZone'}
            {mode === 'forgot' && 'استعادة كلمة المرور'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'login' && 'سجّل دخولك لنشر وتحميل وتقييم الألعاب والتطبيقات'}
            {mode === 'register' && 'انضم إلى مجتمع مطوري ومحبي الألعاب مجاناً'}
            {mode === 'forgot' && 'أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Google Sign-in */}
        {mode !== 'forgot' && (
          <>
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-white text-sm font-medium border border-slate-700/80 transition-all duration-200 cursor-pointer shadow-sm hover:border-slate-600 mb-4"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>المتابعة باستخدام Google</span>
            </button>

            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-slate-800 w-full"></div>
              <span className="bg-[#0f172a] px-3 text-[11px] text-slate-500 uppercase tracking-wider">
                أو عبر البريد الإلكتروني
              </span>
            </div>
          </>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                اسم المستخدم / المطور
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: أحمد محمد"
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-2.5 pl-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
                <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              البريد الإلكتروني
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-2.5 pl-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
              <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-slate-300">
                  كلمة المرور
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setError(null);
                      setSuccessMsg(null);
                    }}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                  >
                    نسيت كلمة المرور؟
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-2.5 pl-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
                <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium text-sm transition-all duration-200 shadow-lg shadow-indigo-600/30 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block animate-spin">⏳</span>
            ) : mode === 'login' ? (
              'تسجيل الدخول'
            ) : mode === 'register' ? (
              'إنشاء الحساب'
            ) : (
              'إرسال رابط الاستعادة'
            )}
          </button>
        </form>

        {/* Mode switch footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
          {mode === 'login' ? (
            <p>
              ليس لديك حساب بعد؟{' '}
              <button
                onClick={() => {
                  setMode('register');
                  setError(null);
                  setSuccessMsg(null);
                }}
                className="text-indigo-400 font-semibold hover:underline cursor-pointer"
              >
                إنشاء حساب جديد
              </button>
            </p>
          ) : (
            <p>
              لديك حساب بالفعل؟{' '}
              <button
                onClick={() => {
                  setMode('login');
                  setError(null);
                  setSuccessMsg(null);
                }}
                className="text-indigo-400 font-semibold hover:underline cursor-pointer"
              >
                تسجيل الدخول
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
