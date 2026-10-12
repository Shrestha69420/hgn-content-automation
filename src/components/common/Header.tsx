import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { Plus, LogOut, Globe } from 'lucide-react';
import { Logo } from './Logo';

export const Header: React.FC = () => {
  const { setActiveModule, showToast, activeBrand, openInStudio } = useApp();
  const { currentUser, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-zinc-800/80 text-zinc-100">
      {/* Main Single-Height Clean Header (No Top Operations Bar) */}
      <div className="px-5 sm:px-8 h-14 flex items-center justify-between">
        {/* Brand & Organization */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveModule('overview')}
            className="flex items-center gap-2.5 text-left cursor-pointer group focus:outline-none"
          >
            <Logo />
          </button>

          {activeBrand && (
            <button
              onClick={() => setActiveModule('brands')}
              className="hidden sm:flex items-center gap-2 max-w-[18rem] pl-2.5 pr-3 py-1 rounded-md bg-deep border border-zinc-800 hover:border-zinc-700 text-xs text-zinc-200 cursor-pointer"
              title="Active brand. Switch brands on the Brands page."
            >
              <span className="flex shrink-0">
                {[activeBrand.colors.primary, activeBrand.colors.accent].map((c, i) => (
                  <span key={i} className="w-2.5 h-2.5 rounded-full border border-black/20 -ml-0.5 first:ml-0" style={{ background: c }} />
                ))}
              </span>
              <span className="truncate">{activeBrand.name}</span>
            </button>
          )}
        </div>

        {/* Action Controls & User */}
        <div className="flex items-center gap-3">
          {/* Landing Page Link */}
          <button
            onClick={() => setActiveModule('landing')}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850/60 text-xs font-medium transition cursor-pointer"
            title="View Public Product Landing Page"
          >
            <Globe className="w-3.5 h-3.5 text-indigo-400" />
            <span>Landing Page</span>
          </button>

          {/* Quick AI Generator Launch with Accent Styling */}
          <button
            onClick={() => openInStudio(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition shadow-[0_1px_12px_rgba(43,181,166,0.25)] border border-indigo-400/30 active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-100" />
            <span>New post</span>
          </button>

          {/* User Profile / Logout Action */}
          <div className="flex items-center gap-2.5 pl-3 border-l border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-indigo-950/60 border border-indigo-500/30 text-indigo-200 flex items-center justify-center font-medium text-xs font-mono shrink-0">
                {(currentUser?.name || 'H')[0]?.toUpperCase() || 'U'}
              </div>
              <span className="hidden sm:inline font-normal text-xs text-zinc-300 truncate max-w-[120px]">
                {currentUser?.name || 'User'}
              </span>
            </div>

            <ThemeToggle />

            <button
              onClick={() => {
                logout();
                showToast('Signed out of Campaign Flow.');
              }}
              className="p-1.5 text-zinc-400 hover:text-zinc-200 rounded-md transition cursor-pointer"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
