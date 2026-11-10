import React, { useState, useMemo } from 'react';
import { Gamepad2, Smartphone, Flame, Star, ArrowRight, Filter } from 'lucide-react';
import { StoreItem, PageView } from '../types';
import { useStore } from '../context/StoreContext';
import { ItemCard } from '../components/ItemCard';
import { EmptyState } from '../components/EmptyState';

interface AllItemsPageProps {
  viewMode: 'games' | 'apps' | 'most-downloaded' | 'top-rated';
  onSelectItem: (item: StoreItem) => void;
  onNavigate: (page: PageView) => void;
}

export const AllItemsPage: React.FC<AllItemsPageProps> = ({
  viewMode,
  onSelectItem,
  onNavigate,
}) => {
  const { items, loading } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('الكل');
  const [sortBy, setSortBy] = useState<'newest' | 'downloads' | 'rating'>('newest');

  const pageConfig = {
    games: {
      title: 'جميع الألعاب',
      description: 'تصفح وحمل جميع الألعاب المنشورة بواسطة المطورين واللاعبين',
      icon: Gamepad2,
      accent: 'text-indigo-400',
    },
    apps: {
      title: 'جميع التطبيقات',
      description: 'استكشف التطبيقات المفيدة والإنتاجية بروابط تنزيل مباشرة',
      icon: Smartphone,
      accent: 'text-cyan-400',
    },
    'most-downloaded': {
      title: 'الألعاب والتطبيقات الأكثر تحميلاً',
      description: 'المحتوى الأكثر شعبية وطلباً بين المستخدمين',
      icon: Flame,
      accent: 'text-amber-400',
    },
    'top-rated': {
      title: 'الأعلى تقييماً',
      description: 'أفضل الألعاب والتطبيقات الحاصلة على أعلى تقييمات بالنجوم',
      icon: Star,
      accent: 'text-emerald-400',
    },
  }[viewMode];

  const Icon = pageConfig.icon;

  // Filter items
  const filteredItems = useMemo(() => {
    let result = [...items];

    if (viewMode === 'games') {
      result = result.filter((i) => i.type === 'game');
    } else if (viewMode === 'apps') {
      result = result.filter((i) => i.type === 'app');
    }

    if (selectedCategory !== 'الكل') {
      result = result.filter((i) => i.category === selectedCategory);
    }

    // Sort
    if (viewMode === 'most-downloaded' || sortBy === 'downloads') {
      result.sort((a, b) => b.downloadsCount - a.downloadsCount);
    } else if (viewMode === 'top-rated' || sortBy === 'rating') {
      result.sort((a, b) => b.ratingAverage - a.ratingAverage);
    } else {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [items, viewMode, selectedCategory, sortBy]);

  // Categories list based on current items in this view
  const categories = useMemo(() => {
    const list = new Set<string>();
    items
      .filter((i) => {
        if (viewMode === 'games') return i.type === 'game';
        if (viewMode === 'apps') return i.type === 'app';
        return true;
      })
      .forEach((i) => list.add(i.category));
    return ['الكل', ...Array.from(list)];
  }, [items, viewMode]);

  return (
    <div className="max-w-6xl mx-auto py-4 space-y-8 text-right">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
            <Icon className={`w-7 h-7 ${pageConfig.accent}`} />
            <span>{pageConfig.title}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {pageConfig.description} ({filteredItems.length} عنصر)
          </p>
        </div>

        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-xl hover:bg-slate-900 border border-slate-800 transition-colors self-start sm:self-auto"
        >
          <ArrowRight className="w-4 h-4 ml-1" />
          <span>الرئيسية</span>
        </button>
      </div>

      {/* Filter and Sorting strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <span className="text-xs font-bold text-slate-400 ml-2 shrink-0">التصنيف:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sorting */}
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <span className="font-semibold text-slate-400">الترتيب:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
          >
            <option value="newest">الأحدث أولاً</option>
            <option value="downloads">الأكثر تنزيلاً</option>
            <option value="rating">الأعلى تقييماً</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-64 rounded-2xl bg-slate-900/60 animate-pulse border border-slate-800" />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <EmptyState
          title="لا توجد عناصر متوفرة حالياً"
          description="لم يقم أحد بنشر عناصر في هذا القسم بعد. يمكنك البدء بنشر أول لعبة أو تطبيق الآن!"
          onPublishClick={() => onNavigate('publish')}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <ItemCard key={item.id} item={item} onClick={() => onSelectItem(item)} />
          ))}
        </div>
      )}
    </div>
  );
};
