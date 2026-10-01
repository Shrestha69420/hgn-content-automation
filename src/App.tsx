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
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
        {/* Top Header */}
        <Header />

        {/* Main Workspace Layout */}
        <div className="flex-1 flex max-w-7xl w-full mx-auto pb-16 md:pb-0">
          {/* Desktop Sidebar */}
          <div className="hidden md:block">
            <Sidebar />
          </div>

          {/* Dynamic Module Content Viewport */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-full">
            {activeModule === 'dashboard' && <DashboardModule />}
            {activeModule === 'campaigns' && <CampaignModule />}
            {activeModule === 'generator' && <GeneratorModule />}
            {activeModule === 'quality-score' && <QualityScoreModule />}
            {activeModule === 'library' && <ContentLibraryModule />}
            {activeModule === 'calendar' && <CalendarModule />}
            {activeModule === 'analytics' && <AnalyticsModule />}
            {activeModule === 'settings' && <SettingsModule />}
          </main>
        </div>

        {/* Mobile Bottom Navigation Bar */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-2 py-1.5 flex items-center justify-around">
          <button
            onClick={() => setActiveModule('dashboard')}
            className={`flex flex-col items-center gap-1 p-1 text-[10px] ${
              activeModule === 'dashboard' ? 'text-amber-400 font-bold' : 'text-slate-400'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Home</span>
          </button>
          <button
            onClick={() => setActiveModule('campaigns')}
            className={`flex flex-col items-center gap-1 p-1 text-[10px] ${
              activeModule === 'campaigns' ? 'text-amber-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>Campaigns</span>
          </button>
          <button
            onClick={() => setActiveModule('generator')}
            className={`flex flex-col items-center gap-1 p-1 text-[10px] ${
              activeModule === 'generator' ? 'text-amber-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Draft</span>
          </button>
          <button
            onClick={() => setActiveModule('quality-score')}
            className={`flex flex-col items-center gap-1 p-1 text-[10px] ${
              activeModule === 'quality-score' ? 'text-cyan-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Score</span>
          </button>
          <button
            onClick={() => setActiveModule('library')}
            className={`flex flex-col items-center gap-1 p-1 text-[10px] ${
              activeModule === 'library' ? 'text-amber-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Library</span>
          </button>
          <button
            onClick={() => setActiveModule('calendar')}
            className={`flex flex-col items-center gap-1 p-1 text-[10px] ${
              activeModule === 'calendar' ? 'text-amber-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Calendar</span>
          </button>
        </nav>

        {/* Global Toast Alert */}
        {toastMessage && (
          <div className="fixed bottom-16 md:bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
            <div className="bg-slate-900 border border-amber-500/40 text-amber-200 px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-medium">
              <Bell className="w-4 h-4 text-amber-400 shrink-0" />
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
