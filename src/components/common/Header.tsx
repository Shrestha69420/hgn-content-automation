import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  Sparkles,
  LogOut,
  Globe,
  Radio
} from 'lucide-react';

export const Header: React.FC = () => {
  const { setActiveModule, showToast } = useApp();
  const { currentUser, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-[#101A1F]/95 backdrop-blur-md border-b border-zinc-800/80 text-zinc-100">
      {/* Main Single-Height Clean Header (No Top Operations Bar) */}
      <div className="px-5 sm:px-8 h-14 flex items-center justify-between">
        {/* Brand & Organization */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveModule('dashboard')}
            className="flex items-center gap-2.5 text-left cursor-pointer group focus:outline-none"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white shadow-[0_0_14px_rgba(43,181,166,0.35)] transition group-hover:scale-105">
              <svg
                className="w-4 h-4 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 15c2.5-4 5.5-4 8 0s5.5 4 8 0" />
                <path d="M4 9c2.5-4 5.5-4 8 0s5.5 4 8 0" />
              </svg>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-semibold text-sm tracking-tight text-white font-sans">
                Campaign Flow
              </span>
              <span className="text-[11px] text-zinc-500 font-normal hidden sm:inline">
                Himalayan Guardian Nepal
              </span>
            </div>
          </button>

          <div className="hidden lg:flex items-center gap-1.5 pl-3 border-l border-zinc-850 text-[11px] font-mono text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>SQLite Active</span>
          </div>
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
            onClick={() => setActiveModule('generator')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition shadow-[0_1px_12px_rgba(43,181,166,0.25)] border border-indigo-400/30 active:scale-[0.98] cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
            <span>New Post Draft</span>
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
