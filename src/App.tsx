/** Campaign Flow: AI content studio with scheduled publishing. */
import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Header } from './components/common/Header';
import { Sidebar, NAV_ITEMS } from './components/common/Sidebar';
import { OverviewModule } from './components/modules/OverviewModule';
import { StudioModule } from './components/modules/StudioModule';
import { LibraryModule } from './components/modules/LibraryModule';
import { BrandsModule } from './components/modules/BrandsModule';
import { LandingPage } from './components/landing/LandingPage';
import { Watermark } from './components/common/Watermark';

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { activeModule, setActiveModule, toastMessage, loading } = useApp();

  if (!isAuthenticated || activeModule === 'landing') return <LandingPage />;

  return (
    <ProtectedRoute>
      <div className="relative min-h-screen bg-page text-zinc-100 flex flex-col font-sans antialiased" style={{ backgroundImage: 'radial-gradient(60rem 28rem at 88% -6%, rgba(43,181,166,0.08), transparent 70%)' }}>
        {/* Decorative brand watermark, fixed behind the content */}
        <Watermark className="fixed -right-10 -bottom-44 w-[44rem] text-indigo-400 opacity-[0.11] z-0" />
        <Header />
        <div className="flex-1 flex w-full overflow-hidden pb-16 md:pb-0">
          <div className="hidden md:block"><Sidebar /></div>
          <main className="relative z-10 flex-1 px-5 py-6 sm:px-8 sm:py-8 lg:px-10 overflow-y-auto w-full">
            <div className="max-w-6xl mx-auto">
              {loading && <p className="text-xs text-zinc-500 mb-3">Loading…</p>}
              {activeModule === 'overview' && <OverviewModule />}
              {activeModule === 'studio' && <StudioModule />}
              {activeModule === 'library' && <LibraryModule />}
              {activeModule === 'brands' && <BrandsModule />}
            </div>
          </main>
        </div>

        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-md border-t border-zinc-800 px-2 py-2 flex items-center justify-around">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            return (
              <button key={item.id} onClick={() => setActiveModule(item.id)}
                className={`flex flex-col items-center gap-1 p-1 text-[11px] font-medium cursor-pointer ${activeModule === item.id ? 'text-zinc-100' : 'text-zinc-500'}`}>
                <Icon className="w-4 h-4" /><span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {toastMessage && (
          <div className="fixed bottom-16 md:bottom-6 right-6 z-50 max-w-sm">
            <div className="bg-surface border border-zinc-700/80 text-zinc-200 px-3.5 py-2 rounded-lg shadow-2xl flex items-center gap-2.5 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
              <span className="break-words">{toastMessage}</span>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}
