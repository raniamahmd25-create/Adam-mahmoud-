import React, { useState, useRef, useEffect } from 'react';
import {
  Gamepad2,
  PlusCircle,
  Search,
  User,
  LogOut,
  ShieldAlert,
  Settings,
  Menu,
  X,
  Flame,
  Star,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { PageView } from '../types';
import { SupabaseDropdown } from './SupabaseDropdown';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  currentPage: PageView;
  setCurrentPage: (page: PageView) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  openAuthModal: (mode: 'login' | 'register') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  setCurrentPage,
  searchQuery,
  setSearchQuery,
  openAuthModal,
}) => {
  const { user, profile, isAdmin, logout } = useAuth();
  const { showInfo } = useToast();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { id: 'home', label: 'الرئيسية' },
    { id: 'games', label: 'الألعاب' },
    { id: 'apps', label: 'التطبيقات' },
    { id: 'most-downloaded', label: 'الأكثر تحميلاً', icon: Flame },
    { id: 'top-rated', label: 'الأعلى تقييماً', icon: Star },
  ];

  const handleNavClick = (pageId: PageView) => {
    setCurrentPage(pageId);
    setMobileMenuOpen(false);
    window.location.hash = pageId === 'home' ? '' : `#/${pageId}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-[#07090e]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-13 sm:h-16 gap-1.5 sm:gap-4">
          
          {/* Zone 1: Brand & Logo */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <button
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-1.5 sm:gap-2.5 text-right group cursor-pointer"
            >
              <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <Gamepad2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="text-sm sm:text-lg font-black tracking-tight text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    GameZone
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold text-violet-600 dark:text-violet-400 px-1 sm:px-1.5 py-0.2 bg-violet-500/10 rounded border border-violet-500/20">
                    Store
                  </span>
                </div>
              </div>
            </button>

            {/* Tiny Supabase Dropdown (Desktop) */}
            <div className="hidden md:block mr-1 sm:mr-2">
              <SupabaseDropdown />
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = currentPage === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id as PageView)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'text-indigo-600 dark:text-white bg-indigo-50 dark:bg-slate-800/80 shadow-sm border border-indigo-200 dark:border-slate-700/60'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/60'
                  }`}
                >
                  {Icon && <Icon className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />}
                  <span>{link.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Search Bar - Center/Right in desktop */}
          <div className="hidden md:flex items-center flex-1 max-w-xs mx-2">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن لعبة أو تطبيق..."
                className="w-full bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-500/70 rounded-xl py-1.5 pr-8 pl-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none transition-colors"
              />
              <Search className="absolute right-2.5 top-2 w-3.5 h-3.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute left-2.5 top-2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Zone 3: Actions (Theme Toggle, Supabase, Publish, Auth/Profile) */}
          <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
            {/* Theme Toggle Button */}
            <ThemeToggle />

            {/* Supabase dropdown visible on mobile/tablet */}
            <div className="md:hidden">
              <SupabaseDropdown />
            </div>

            {/* Publish Button - Accessible to all without requiring login */}
            <button
              onClick={() => handleNavClick('publish')}
              className="flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-3.5 sm:py-1.5 rounded-lg sm:rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-[11px] sm:text-xs font-bold shadow-md shadow-indigo-600/25 transition-all duration-200 cursor-pointer hover:shadow-indigo-600/40 shrink-0"
              title="نشر لعبة أو تطبيق جديد"
            >
              <PlusCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>نشر</span>
            </button>

            {/* Auth States */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center p-0.5 sm:p-1 rounded-lg sm:rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800/80 transition-colors cursor-pointer shrink-0"
                  title="حسابي"
                >
                  {profile?.photoURL ? (
                    <img
                      src={profile.photoURL}
                      alt={profile.displayName}
                      referrerPolicy="no-referrer"
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-cover ring-2 ring-indigo-500/50"
                    />
                  ) : (
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-tr from-slate-700 to-slate-600 flex items-center justify-center text-white text-[11px] sm:text-xs font-bold ring-1 ring-slate-600">
                      {(profile?.displayName || user.displayName || 'U')[0].toUpperCase()}
                    </div>
                  )}
                </button>

                {userMenuOpen && (
                  <div className="absolute left-0 mt-2 w-56 rounded-2xl bg-[#0f172a] border border-slate-700/80 shadow-2xl z-50 py-2 backdrop-blur-md animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-slate-800">
                      <p className="text-xs font-bold text-white truncate">
                        {profile?.displayName || user.displayName || 'مستخدم GameZone'}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      {isAdmin && (
                        <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          مدير الموقع (Admin)
                        </span>
                      )}
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          handleNavClick('profile');
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors text-right cursor-pointer"
                      >
                        <User className="w-4 h-4 text-indigo-400" />
                        <span>الملف الشخصي والمنشورات</span>
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            handleNavClick('admin');
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-amber-300 hover:text-amber-200 hover:bg-amber-500/10 transition-colors text-right cursor-pointer"
                        >
                          <ShieldAlert className="w-4 h-4 text-amber-400" />
                          <span>لوحة تحكم الإدارة</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          handleNavClick('settings');
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors text-right cursor-pointer"
                      >
                        <Settings className="w-4 h-4 text-slate-400" />
                        <span>الإعدادات</span>
                      </button>
                    </div>

                    <div className="pt-1 border-t border-slate-800">
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          logout();
                          showInfo('تم تسجيل الخروج', 'نراك قريباً في GameZone Store 👋');
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors text-right cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>تسجيل الخروج</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                <button
                  onClick={() => openAuthModal('login')}
                  className="px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <span className="hidden xs:inline sm:inline">تسجيل </span>الدخول
                </button>
                <button
                  onClick={() => openAuthModal('register')}
                  className="hidden sm:inline-flex px-3 py-1.5 rounded-xl text-xs font-semibold text-indigo-300 bg-indigo-950/50 hover:bg-indigo-900/60 border border-indigo-500/30 transition-colors cursor-pointer whitespace-nowrap"
                >
                  حساب جديد
                </button>
              </div>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors shrink-0"
              aria-label="القائمة"
            >
              {mobileMenuOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search input */}
        <div className="md:hidden py-2 border-t border-slate-800/60">
          <div className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن لعبة أو تطبيق..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 pr-9 pl-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <Search className="absolute right-3 top-2.5 w-4 h-4 text-slate-500" />
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-[#07090e]/95 px-4 pt-3 pb-6 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = currentPage === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id as PageView)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                  isActive
                    ? 'text-white bg-indigo-600/20 border border-indigo-500/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                <span>{link.label}</span>
                {Icon && <Icon className="w-4 h-4 text-amber-400" />}
              </button>
            );
          })}

          <div className="pt-2 border-t border-slate-800/80 flex flex-col gap-1">
            <button
              onClick={() => handleNavClick('privacy')}
              className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200 text-right"
            >
              سياسة الخصوصية
            </button>
            <button
              onClick={() => handleNavClick('contact')}
              className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200 text-right"
            >
              اتصل بنا
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
