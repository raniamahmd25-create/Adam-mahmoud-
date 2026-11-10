import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { HomePage } from './pages/HomePage';
import { PublishPage } from './pages/PublishPage';
import { ItemDetailPage } from './pages/ItemDetailPage';
import { ProfilePage } from './pages/ProfilePage';
import { EditItemPage } from './pages/EditItemPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { AllItemsPage } from './pages/AllItemsPage';
import { SettingsPage } from './pages/SettingsPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { ContactPage } from './pages/ContactPage';
import { StoreItem, PageView } from './types';

function MainApp() {
  const { items } = useStore();
  const { user } = useAuth();

  const [currentPage, setCurrentPage] = useState<PageView>('home');
  const [selectedItem, setSelectedItem] = useState<StoreItem | null>(null);
  const [editingItem, setEditingItem] = useState<StoreItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  // URL Hash Sync for direct link sharing (e.g. #/item/item_123)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (!hash || hash === '#/' || hash === '#') {
        setCurrentPage('home');
        setSelectedItem(null);
        return;
      }

      if (hash.startsWith('#/item/')) {
        const id = hash.replace('#/item/', '');
        const found = items.find((i) => i.id === id);
        if (found) {
          setSelectedItem(found);
          setCurrentPage('item-detail');
        }
        return;
      }

      const rawPage = hash.replace('#/', '') as PageView;
      const validPages: PageView[] = [
        'home',
        'games',
        'apps',
        'most-downloaded',
        'top-rated',
        'publish',
        'profile',
        'admin',
        'settings',
        'privacy',
        'contact',
      ];
      if (validPages.includes(rawPage)) {
        setCurrentPage(rawPage);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    // Initial check when items are loaded
    if (items.length > 0) {
      handleHashChange();
    }

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [items]);

  const handleSelectItem = (item: StoreItem) => {
    setSelectedItem(item);
    setCurrentPage('item-detail');
    window.location.hash = `#/item/${item.id}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (page: PageView) => {
    setCurrentPage(page);
    window.location.hash = page === 'home' ? '' : `#/${page}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openAuth = (mode: 'login' | 'register') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#07090e] text-slate-100 font-sans selection:bg-indigo-600 selection:text-white">
      {/* Top Header */}
      <Header
        currentPage={currentPage}
        setCurrentPage={handleNavigate}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        openAuthModal={openAuth}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentPage === 'home' && (
          <HomePage
            onSelectItem={handleSelectItem}
            onNavigate={handleNavigate}
            searchQuery={searchQuery}
          />
        )}

        {currentPage === 'publish' && (
          <PublishPage
            onSuccess={(newItem) => {
              handleSelectItem(newItem);
            }}
            onCancel={() => handleNavigate('home')}
          />
        )}

        {currentPage === 'item-detail' && selectedItem && (
          <ItemDetailPage
            item={selectedItem}
            onBack={() => handleNavigate('home')}
            onEditItem={(itemToEdit) => {
              setEditingItem(itemToEdit);
              setCurrentPage('edit-item');
            }}
            openAuthModal={openAuth}
          />
        )}

        {currentPage === 'edit-item' && editingItem && (
          <EditItemPage
            item={editingItem}
            onSuccess={() => {
              handleNavigate('profile');
            }}
            onCancel={() => handleNavigate('item-detail')}
          />
        )}

        {currentPage === 'profile' && (
          <ProfilePage
            onSelectItem={handleSelectItem}
            onEditItem={(itemToEdit) => {
              setEditingItem(itemToEdit);
              setCurrentPage('edit-item');
            }}
            onNavigate={handleNavigate}
          />
        )}

        {['games', 'apps', 'most-downloaded', 'top-rated'].includes(currentPage) && (
          <AllItemsPage
            viewMode={currentPage as any}
            onSelectItem={handleSelectItem}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'admin' && (
          <AdminDashboard onSelectItem={handleSelectItem} />
        )}

        {currentPage === 'settings' && (
          <SettingsPage onNavigate={handleNavigate} />
        )}

        {currentPage === 'privacy' && (
          <PrivacyPage onNavigate={handleNavigate} />
        )}

        {currentPage === 'contact' && (
          <ContactPage onNavigate={handleNavigate} />
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <StoreProvider>
            <MainApp />
          </StoreProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
