import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  Sparkles,
  PhoneCall,
  LogOut,
  Radio
} from 'lucide-react';

export const Header: React.FC = () => {
  const { setActiveModule, showToast } = useApp();
  const { currentUser, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-[#0E1013]/95 backdrop-blur-md border-b border-zinc-800/80 text-zinc-100">
      {/* Discreet Live System Bar */}
      <div className="bg-[#090A0C] px-5 py-1 text-[11px] flex items-center justify-between border-b border-zinc-800/60 text-zinc-400">
        <div className="flex items-center gap-2.5">
          <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span className="font-medium text-zinc-300">
            Khumbu & Annapurna Corridor Operations
          </span>
          <span className="text-zinc-600 hidden sm:inline">•</span>
          <span className="text-zinc-500 hidden sm:inline">
            Sub-zero advisory active on high passes
          </span>
        </div>

        <div className="flex items-center gap-4 text-zinc-400 font-mono text-[11px]">
          <div className="flex items-center gap-1.5 hover:text-zinc-200 transition">
            <PhoneCall className="w-3 h-3 text-zinc-400" />
            <span>SOS +977-1-4412345</span>
          </div>
          <span className="text-zinc-700 hidden sm:inline">|</span>
          <span className="hidden sm:inline text-zinc-500">Dispatch: Online</span>
        </div>
      </div>

      {/* Main Clean Header */}
      <div className="px-5 sm:px-8 h-14 flex items-center justify-between">
        {/* Brand & Organization */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-md bg-zinc-800/90 border border-zinc-700/60 flex items-center justify-center text-zinc-200 shadow-sm">
            <svg
              className="w-4 h-4 text-zinc-200"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" />
              <path d="M7 14l3.5-4.5L13 12l4-5" />
            </svg>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-semibold text-sm tracking-tight text-white font-sans">
              Himalayan Guardian
            </span>
            <span className="text-xs text-zinc-500 font-normal">
              Nepal
            </span>
          </div>
        </div>

        {/* Action Controls & User */}
        <div className="flex items-center gap-3">
          {/* Quick AI Generator Launch */}
          <button
            onClick={() => setActiveModule('generator')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-medium transition shadow-sm active:scale-[0.98]"
          >
            <Sparkles className="w-3.5 h-3.5 text-zinc-950" />
            <span>New Post Draft</span>
          </button>

          {/* User Profile / Logout Action */}
          <div className="flex items-center gap-2.5 pl-3 border-l border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 flex items-center justify-center font-medium text-xs font-mono shrink-0">
                {(currentUser?.name || 'H')[0]?.toUpperCase() || 'U'}
              </div>
              <span className="hidden sm:inline font-normal text-xs text-zinc-300 truncate max-w-[120px]">
                {currentUser?.name || 'User'}
              </span>
            </div>

            <button
              onClick={() => {
                logout();
                showToast('Signed out of HGN Marketing Hub.');
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
