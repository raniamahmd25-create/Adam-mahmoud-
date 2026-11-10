import React, { useState, useMemo } from 'react';
import { Flame, Star, Clock, Layers, ArrowLeft, Gamepad2, Smartphone, Search } from 'lucide-react';
import { HeroBanner } from '../components/HeroBanner';
import { ItemCard } from '../components/ItemCard';
import { EmptyState } from '../components/EmptyState';
import { CategoryFilter } from '../components/CategoryFilter';
import { FeaturedGames } from '../components/FeaturedGames';
import { useStore } from '../context/StoreContext';
import { StoreItem, PageView } from '../types';

interface HomePageProps {
  onSelectItem: (item: StoreItem) => void;
  onNavigate: (page: PageView) => void;
  searchQuery: string;
}

const CATEGORIES = [
  'الكل',
  'أكشن',
  'مغامرات',
  'سباقات',
  'رياضة',
  'استراتيجية',
  'ألغاز',
  'محاكاة',
  'ألعاب أخرى',
  'تطبيقات',
];

export const HomePage: React.FC<HomePageProps> = ({
  onSelectItem,
  onNavigate,
  searchQuery,
}) => {
  const { items, loading } = useStore();
  const [selectedCategory, setSelectedCategory] = useState('الكل');

  // Filter items by category & search query
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        !searchQuery.trim() ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'الكل' ||
        (selectedCategory === 'تطبيقات' && item.type === 'app') ||
        item.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [items, searchQuery, selectedCategory]);

  // Section splits
  const latestItems = useMemo(() => {
    return [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 8);
  }, [items]);

  const mostDownloaded = useMemo(() => {
    return [...items].sort((a, b) => b.downloadsCount - a.downloadsCount).slice(0, 4);
  }, [items]);

  const topRated = useMemo(() => {
    return [...items].sort((a, b) => b.ratingAverage - a.ratingAverage).slice(0, 4);
  }, [items]);

  return (
    <div className="space-y-12">
      {/* Hero Banner only when not actively searching */}
      {!searchQuery && (
        <HeroBanner
          onPublishClick={() => onNavigate('publish')}
          onExploreClick={() => {
            const el = document.getElementById('explore-section');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          totalItems={items.length}
        />
      )}

      {/* Featured Games Section (Administrator Curated Spotlight) */}
      {!searchQuery && (
        <FeaturedGames
          onSelectItem={onSelectItem}
          onNavigateToAdmin={() => onNavigate('admin')}
        />
      )}

      {/* Main Catalog or Search Results */}
      <div id="explore-section" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
              <span>{searchQuery ? `نتائج البحث عن: "${searchQuery}"` : 'تصفح أحدث الألعاب والتطبيقات'}</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {filteredItems.length} عنصر متوفر بروابط تحميل مباشرة
            </p>
          </div>

          {/* Categories Tab Selector */}
          <CategoryFilter
            categories={CATEGORIES}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-64 rounded-2xl bg-slate-900/60 animate-pulse border border-slate-800" />
            ))}
          </div>
        )}

        {/* Empty State when zero items published yet */}
        {!loading && filteredItems.length === 0 && (
          <EmptyState
            title={items.length === 0 ? 'المتجر فارغ تماماً حالياً' : 'لم يتم العثور على نتائج'}
            description={
              items.length === 0
                ? 'موقع GameZone Store يبدأ نظيفاً بدون بيانات وهمية. كن أول بطل ينشر لعبته أو تطبيقه ويشارك الرابط مع العالم!'
                : 'جرب البحث بكلمات أخرى أو اختر تصنيفاً مختلفاً.'
            }
            onPublishClick={() => onNavigate('publish')}
            actionText="كن أول من ينشر الآن"
          />
        )}

        {/* Items Grid */}
        {!loading && filteredItems.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onClick={() => onSelectItem(item)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Structured Curated Sections (Only shown when not searching and when items exist) */}
      {!searchQuery && items.length > 0 && (
        <>
          {/* Most Downloaded Section */}
          {mostDownloaded.length > 0 && (
            <div className="space-y-6 pt-6 border-t border-slate-800/80">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-white">الأكثر تحميلاً</h3>
                    <p className="text-xs text-slate-400">الألعاب والتطبيقات الأكثر شعبية وإقبالاً بين المستخدمين</p>
                  </div>
                </div>

                <button
                  onClick={() => onNavigate('most-downloaded')}
                  className="flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  <span>عرض الكل</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {mostDownloaded.map((item) => (
                  <ItemCard
                    key={`popular-${item.id}`}
                    item={item}
                    onClick={() => onSelectItem(item)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Top Rated Section */}
          {topRated.length > 0 && (
            <div className="space-y-6 pt-6 border-t border-slate-800/80">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Star className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-white">الأعلى تقييماً</h3>
                    <p className="text-xs text-slate-400">حسب آراء وتقييمات اللاعبين والمستخدمين الحقيقية</p>
                  </div>
                </div>

                <button
                  onClick={() => onNavigate('top-rated')}
                  className="flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  <span>عرض الكل</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {topRated.map((item) => (
                  <ItemCard
                    key={`top-${item.id}`}
                    item={item}
                    onClick={() => onSelectItem(item)}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
