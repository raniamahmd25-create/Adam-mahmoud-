import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldAlert,
  Users,
  Gamepad2,
  Smartphone,
  Download,
  Flag,
  Trash2,
  CheckCircle,
  XCircle,
  Search,
  ExternalLink,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { StoreItem, Report, UserProfile } from '../types';

interface AdminDashboardProps {
  onSelectItem: (item: StoreItem) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onSelectItem }) => {
  const { user, isAdmin } = useAuth();
  const { items, reports, deleteItem, adminUpdateReport, adminDeleteReport } = useStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'items' | 'reports' | 'users'>('overview');
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all registered users for administration
  const fetchUsers = async () => {
    if (!isAdmin) return;
    setLoadingUsers(true);
    try {
      const snap = await getDocs(collection(db, 'users'));
      const list: UserProfile[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() } as UserProfile));
      setUsersList(list);
    } catch (err) {
      console.warn('Could not load all users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  // Aggregate stats
  const stats = useMemo(() => {
    const gamesCount = items.filter((i) => i.type === 'game').length;
    const appsCount = items.filter((i) => i.type === 'app').length;
    const totalDownloads = items.reduce((acc, curr) => acc + curr.downloadsCount, 0);
    const pendingReports = reports.filter((r) => r.status === 'pending').length;

    return {
      usersCount: usersList.length,
      gamesCount,
      appsCount,
      totalDownloads,
      pendingReports,
    };
  }, [items, usersList, reports]);

  if (!isAdmin) {
    return (
      <div className="text-center py-24 space-y-4 max-w-md mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">منطقة إدارية محمية</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          عذراً، هذه الصفحة مخصصة فقط لمدير الموقع وصاحب الصلاحيات الإدارية.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-4 space-y-8 text-right">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              مدير النظام الرئيسي
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            <ShieldAlert className="w-7 h-7 text-amber-400" />
            <span>لوحة تحكم إدارة المتجر (Admin)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            إشراف كامل على المحتوى، مراجعة البلاغات، إدارة المستخدمين وحذف المخالفات
          </p>
        </div>

        <button
          onClick={fetchUsers}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingUsers ? 'animate-spin' : ''}`} />
          <span>تحديث البيانات</span>
        </button>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 mx-auto flex items-center justify-center mb-1">
            <Users className="w-4 h-4" />
          </div>
          <p className="text-[11px] text-slate-400">المستخدمين</p>
          <p className="text-lg font-black text-white font-mono">{stats.usersCount}</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
          <div className="w-8 h-8 rounded-lg bg-violet-500/10 text-violet-400 mx-auto flex items-center justify-center mb-1">
            <Gamepad2 className="w-4 h-4" />
          </div>
          <p className="text-[11px] text-slate-400">الألعاب</p>
          <p className="text-lg font-black text-white font-mono">{stats.gamesCount}</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 mx-auto flex items-center justify-center mb-1">
            <Smartphone className="w-4 h-4" />
          </div>
          <p className="text-[11px] text-slate-400">التطبيقات</p>
          <p className="text-lg font-black text-white font-mono">{stats.appsCount}</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center mb-1">
            <Download className="w-4 h-4" />
          </div>
          <p className="text-[11px] text-slate-400">إجمالي التنزيلات</p>
          <p className="text-lg font-black text-white font-mono">{stats.totalDownloads}</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-center col-span-2 sm:col-span-1">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 mx-auto flex items-center justify-center mb-1">
            <Flag className="w-4 h-4" />
          </div>
          <p className="text-[11px] text-slate-400">البلاغات المعلقة</p>
          <p className="text-lg font-black text-amber-400 font-mono">{stats.pendingReports}</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          نظرة عامة
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'reports'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>البلاغات</span>
          {stats.pendingReports > 0 && (
            <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center">
              {stats.pendingReports}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('items')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'items'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          إدارة المنشورات ({items.length})
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'users'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          المستخدمين ({usersList.length})
        </button>
      </div>

      {/* Tab: Reports */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white">بلاغات المستخدمين عن المحتوى المخالف</h3>
          {reports.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-10 bg-slate-900/40 rounded-2xl border border-slate-800">
              لا توجد أي بلاغات حالياً. الموقع آمن ومستقر!
            </p>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {report.targetType === 'item' ? 'بلاغ عن لعبة/تطبيق' : 'بلاغ عن تعليق'}
                      </span>
                      <span className="text-xs font-semibold text-slate-300">
                        بواسطة: {report.reporterName}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(report.createdAt).toLocaleDateString('ar-EG')}
                      </span>
                    </div>

                    <p className="text-xs text-rose-300 font-medium">السبب: {report.reason}</p>
                    {report.targetTitle && (
                      <p className="text-[11px] text-slate-400">العنوان: {report.targetTitle}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {report.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => adminUpdateReport(report.id, 'reviewed')}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>تمت المراجعة</span>
                        </button>
                        <button
                          onClick={() => adminUpdateReport(report.id, 'dismissed')}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>تجاهل البلاغ</span>
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium px-3 py-1 bg-slate-800 rounded-lg">
                        الحالة: {report.status === 'reviewed' ? 'تمت المراجعة' : 'تم التجاهل'}
                      </span>
                    )}

                    <button
                      onClick={() => adminDeleteReport(report.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg"
                      title="حذف سجل البلاغ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Items Management */}
      {activeTab === 'items' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">قائمة جميع المنشورات</h3>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="تصفية حسب الاسم..."
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
            />
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 font-bold">
                <tr>
                  <th className="p-3">العنصر</th>
                  <th className="p-3">النوع</th>
                  <th className="p-3">التصنيف</th>
                  <th className="p-3">الناشر</th>
                  <th className="p-3">التنزيلات</th>
                  <th className="p-3">التقييم</th>
                  <th className="p-3 text-left">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {items
                  .filter((i) => !searchQuery || i.title.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/40">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <img
                            src={item.imageUrl}
                            alt=""
                            referrerPolicy="no-referrer"
                            className="w-8 h-8 rounded-lg object-cover"
                          />
                          <span className="font-bold text-white truncate max-w-[150px]">{item.title}</span>
                        </div>
                      </td>
                      <td className="p-3 text-slate-300">{item.type === 'game' ? 'لعبة' : 'تطبيق'}</td>
                      <td className="p-3 text-slate-400">{item.category}</td>
                      <td className="p-3 text-slate-300">{item.publisherName}</td>
                      <td className="p-3 font-mono text-white">{item.downloadsCount}</td>
                      <td className="p-3 font-mono text-amber-400">{item.ratingAverage}</td>
                      <td className="p-3 text-left">
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => onSelectItem(item)}
                            className="p-1 text-indigo-400 hover:text-indigo-300 rounded"
                            title="عرض الصفحة"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={async () => {
                              if (window.confirm(`هل أنت متأكد من حذف ${item.title} بصفتك مدير الموقع؟`)) {
                                await deleteItem(item.id);
                              }
                            }}
                            className="p-1 text-rose-400 hover:text-rose-300 rounded"
                            title="حذف فوري"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Users Management */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white">إدارة الحسابات والمستخدمين المسجلين</h3>
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 font-bold">
                <tr>
                  <th className="p-3">المستخدم</th>
                  <th className="p-3">البريد الإلكتروني</th>
                  <th className="p-3">الدور (Role)</th>
                  <th className="p-3">تاريخ التسجيل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/40">
                    <td className="p-3 font-bold text-white">{u.displayName}</td>
                    <td className="p-3 text-slate-300 font-mono text-[11px]">{u.email}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.role === 'admin'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {u.role === 'admin' ? 'مدير (Admin)' : 'مستخدم عادي'}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString('ar-EG')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h3 className="text-base font-bold text-white">إرشادات وسياسة إدارة GameZone Store</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              بصفتك مدير النظام الرئيسي (Admin)، لديك صلاحية كاملة لحذف أي ألعاب أو تطبيقات تخالف شروط الخدمة، أو تحتوي على روابط معطلة أو برمجيات خبيثة. كما يمكنك مراجعة البلاغات المقدمة من المجتمع واتخاذ الإجراء الفوري بحذف التعليق أو المنشور المخالف.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
