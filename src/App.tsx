/**
 * Marketing Content Automation and Social Media Management System
 * Organization: Himalayan Guardian Nepal
 * Platform: HGN Marketing Hub
 */

import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LoginPage } from './components/auth/LoginPage';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { DashboardModule } from './components/modules/DashboardModule';
import { CampaignModule } from './components/modules/CampaignModule';
import { GeneratorModule } from './components/modules/GeneratorModule';
import { QualityScoreModule } from './components/modules/QualityScoreModule';
import { ContentLibraryModule } from './components/modules/ContentLibraryModule';
import { CalendarModule } from './components/modules/CalendarModule';
import { AnalyticsModule } from './components/modules/AnalyticsModule';
import { SettingsModule } from './components/modules/SettingsModule';
import {
  LayoutDashboard,
  Target,
  Sparkles,
  Award,
  Layers,
  Calendar,
  Bell
} from 'lucide-react';

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { activeModule, setActiveModule, toastMessage } = useApp();

  // If user is not authenticated, render the dedicated LoginPage
  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={() => setActiveModule('dashboard')} />;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#090A0C] text-zinc-100 flex flex-col font-sans selection:bg-zinc-800 selection:text-zinc-200 antialiased">
        {/* Top Header */}
        <Header />

        {/* Main Workspace Layout */}
        <div className="flex-1 flex w-full overflow-hidden pb-16 md:pb-0">
          {/* Desktop Sidebar */}
          <div className="hidden md:block">
            <Sidebar />
          </div>

          {/* Dynamic Module Content Viewport */}
          <main className="flex-1 px-5 py-6 sm:px-8 sm:py-8 lg:px-10 overflow-y-auto w-full">
            <div className="max-w-6xl mx-auto">
              {activeModule === 'dashboard' && <DashboardModule />}
              {activeModule === 'campaigns' && <CampaignModule />}
              {activeModule === 'generator' && <GeneratorModule />}
              {activeModule === 'quality-score' && <QualityScoreModule />}
              {activeModule === 'library' && <ContentLibraryModule />}
              {activeModule === 'calendar' && <CalendarModule />}
              {activeModule === 'analytics' && <AnalyticsModule />}
              {activeModule === 'settings' && <SettingsModule />}
            </div>
          </main>
        </div>

        {/* Mobile Bottom Navigation Bar */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-850 px-2 py-2 flex items-center justify-around">
          <button
            onClick={() => setActiveModule('dashboard')}
            className={`flex flex-col items-center gap-1 p-1 text-[11px] font-medium transition ${
              activeModule === 'dashboard' ? 'text-zinc-100 font-semibold' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Home</span>
          </button>
          <button
            onClick={() => setActiveModule('campaigns')}
            className={`flex flex-col items-center gap-1 p-1 text-[11px] font-medium transition ${
              activeModule === 'campaigns' ? 'text-zinc-100 font-semibold' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>Campaigns</span>
          </button>
          <button
            onClick={() => setActiveModule('generator')}
            className={`flex flex-col items-center gap-1 p-1 text-[11px] font-medium transition ${
              activeModule === 'generator' ? 'text-zinc-100 font-semibold' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Draft</span>
          </button>
          <button
            onClick={() => setActiveModule('quality-score')}
            className={`flex flex-col items-center gap-1 p-1 text-[11px] font-medium transition ${
              activeModule === 'quality-score' ? 'text-zinc-100 font-semibold' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Quality</span>
          </button>
          <button
            onClick={() => setActiveModule('library')}
            className={`flex flex-col items-center gap-1 p-1 text-[11px] font-medium transition ${
              activeModule === 'library' ? 'text-zinc-100 font-semibold' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Library</span>
          </button>
          <button
            onClick={() => setActiveModule('calendar')}
            className={`flex flex-col items-center gap-1 p-1 text-[11px] font-medium transition ${
              activeModule === 'calendar' ? 'text-zinc-100 font-semibold' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Calendar</span>
          </button>
        </nav>

        {/* Global Toast Alert */}
        {toastMessage && (
          <div className="fixed bottom-16 md:bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
            <div className="bg-zinc-900 border border-zinc-700/80 text-zinc-200 px-3.5 py-2 rounded-lg shadow-2xl flex items-center gap-2.5 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>{toastMessage}</span>
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
