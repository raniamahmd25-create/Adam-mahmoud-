import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, Sparkles, X, Gamepad2, LogIn } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  iconType?: 'check' | 'game' | 'login' | 'sparkle' | 'info';
}

interface ToastContextType {
  toasts: ToastItem[];
  showToast: (toast: Omit<ToastItem, 'id'>) => string;
  showSuccess: (title: string, message?: string, iconType?: ToastItem['iconType']) => string;
  showError: (title: string, message?: string) => string;
  showInfo: (title: string, message?: string) => string;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type, title, message, duration = 4500, iconType }: Omit<ToastItem, 'id'>) => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const newToast: ToastItem = { id, type, title, message, duration, iconType };

      setToasts((prev) => [...prev.slice(-3), newToast]); // keep max 4 toasts at once

      if (duration > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, duration);
      }

      return id;
    },
    [dismissToast]
  );

  const showSuccess = useCallback(
    (title: string, message?: string, iconType: ToastItem['iconType'] = 'check') => {
      return showToast({ type: 'success', title, message, iconType });
    },
    [showToast]
  );

  const showError = useCallback(
    (title: string, message?: string) => {
      return showToast({ type: 'error', title, message });
    },
    [showToast]
  );

  const showInfo = useCallback(
    (title: string, message?: string) => {
      return showToast({ type: 'info', title, message });
    },
    [showToast]
  );

  return (
    <ToastContext.Provider
      value={{
        toasts,
        showToast,
        showSuccess,
        showError,
        showInfo,
        dismissToast,
      }}
    >
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    // Provide safe fallback in case useToast is invoked outside ToastProvider
    return {
      toasts: [],
      showToast: () => '',
      showSuccess: () => '',
      showError: () => '',
      showInfo: () => '',
      dismissToast: () => {},
    };
  }
  return context;
};

// Toast Container & Presentation
const ToastContainer: React.FC<{
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 left-4 z-50 flex flex-col gap-2.5 max-w-sm w-[calc(100vw-2rem)] pointer-events-none text-right"
      dir="rtl"
    >
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
      ))}
    </div>
  );
};

const ToastCard: React.FC<{
  toast: ToastItem;
  onDismiss: () => void;
}> = ({ toast, onDismiss }) => {
  const getIcon = () => {
    if (toast.iconType === 'game') {
      return <Gamepad2 className="w-5 h-5 text-indigo-400" />;
    }
    if (toast.iconType === 'login') {
      return <LogIn className="w-5 h-5 text-emerald-400" />;
    }
    if (toast.iconType === 'sparkle') {
      return <Sparkles className="w-5 h-5 text-amber-400" />;
    }

    switch (toast.type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-rose-400" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-amber-400" />;
      default:
        return <Info className="w-5 h-5 text-indigo-400" />;
    }
  };

  const borderAndGlowClasses = () => {
    switch (toast.type) {
      case 'success':
        return 'border-emerald-500/40 bg-[#0c191a]/95 text-emerald-100 shadow-[0_0_20px_-3px_rgba(16,185,129,0.3)]';
      case 'error':
        return 'border-rose-500/40 bg-[#1a0c0f]/95 text-rose-100 shadow-[0_0_20px_-3px_rgba(244,63,94,0.3)]';
      case 'warning':
        return 'border-amber-500/40 bg-[#1a150c]/95 text-amber-100 shadow-[0_0_20px_-3px_rgba(245,158,11,0.3)]';
      default:
        return 'border-indigo-500/40 bg-[#0e1124]/95 text-indigo-100 shadow-[0_0_20px_-3px_rgba(99,102,241,0.3)]';
    }
  };

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl border backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 ${borderAndGlowClasses()}`}
    >
      <div className="p-1.5 rounded-xl bg-white/5 shrink-0 mt-0.5">{getIcon()}</div>

      <div className="flex-1 min-w-0 pr-1">
        <h4 className="text-xs sm:text-sm font-bold leading-snug text-white">{toast.title}</h4>
        {toast.message && (
          <p className="text-[11px] text-slate-300/90 mt-0.5 leading-relaxed break-words">
            {toast.message}
          </p>
        )}
      </div>

      <button
        onClick={onDismiss}
        className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
        aria-label="إغلاق الإشعار"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
